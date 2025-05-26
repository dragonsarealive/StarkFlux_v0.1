import { useState } from 'react';
import { useWallet } from '../components/wallet/WalletProvider';
import { CONTRACT_ADDRESSES } from '../abis';

export interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  profilePicture: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  personalWebsite: string;
  location: string;
  yearsExperience: string;
  skills: string[];
  specialization: string;
  email: string;
}

export interface SaveProfileResult {
  success: boolean;
  message: string;
  profileId?: string;
  ipfsHash?: string;
}

export const useProfileSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaveResult, setLastSaveResult] = useState<SaveProfileResult | null>(null);
  const { account, isConnected } = useWallet();

  // Create a deployment-specific storage key prefix
  const getStorageKeyPrefix = () => {
    // Use a combination of contract addresses to create a unique deployment identifier
    const deploymentId = `${CONTRACT_ADDRESSES.IDENTITY_REGISTRY.slice(0, 10)}_${CONTRACT_ADDRESSES.COMPONENT_REGISTRY.slice(0, 10)}`;
    return `starkflux_${deploymentId}`;
  };

  const saveProfile = async (profileData: ProfileData): Promise<SaveProfileResult> => {
    setIsSaving(true);
    setSaveError(null);
    setLastSaveResult(null);

    try {
      // Validate wallet connection
      if (!isConnected || !account) {
        throw new Error('Please connect your wallet to save your profile');
      }

      // Validate required fields
      if (!profileData.displayName.trim()) {
        throw new Error('Display name is required');
      }
      if (!profileData.username.trim()) {
        throw new Error('Username is required');
      }
      if (!profileData.bio.trim()) {
        throw new Error('Bio is required');
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_-]+$/.test(profileData.username)) {
        throw new Error('Username can only contain letters, numbers, hyphens, and underscores');
      }

      // Validate bio length
      if (profileData.bio.length > 500) {
        throw new Error('Bio must be 500 characters or less');
      }

      // Validate URLs if provided
      const urlFields = ['githubUrl', 'linkedinUrl', 'twitterUrl', 'personalWebsite'];
      for (const field of urlFields) {
        const url = profileData[field as keyof ProfileData] as string;
        if (url && !isValidUrl(url)) {
          throw new Error(`Please enter a valid ${field.replace('Url', '')} URL`);
        }
      }

      // Create profile save data
      const profileSaveData = {
        ...profileData,
        walletAddress: account.address,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
        contractDeployment: {
          identityRegistry: CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
          componentRegistry: CONTRACT_ADDRESSES.COMPONENT_REGISTRY
        }
      };

      // Phase 1: Save to localStorage with enhanced structure
      // TODO: Phase 2: Upload to IPFS and get hash
      // TODO: Phase 3: Store IPFS hash in smart contract
      
      const keyPrefix = getStorageKeyPrefix();
      const profileKey = `${keyPrefix}-profile-${account.address}`;
      const profileHistoryKey = `${keyPrefix}-profile-history-${account.address}`;
      
      // Save current profile
      localStorage.setItem(profileKey, JSON.stringify(profileSaveData));
      
      // Maintain profile history (last 5 saves)
      const existingHistory = JSON.parse(localStorage.getItem(profileHistoryKey) || '[]');
      const newHistory = [
        {
          ...profileSaveData,
          savedAt: new Date().toISOString()
        },
        ...existingHistory.slice(0, 4) // Keep last 4 + new one = 5 total
      ];
      localStorage.setItem(profileHistoryKey, JSON.stringify(newHistory));
      
      // Clear wallet-specific draft since we've saved
      const draftKey = `${keyPrefix}-profile-draft-${account.address}`;
      localStorage.removeItem(draftKey);
      
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result: SaveProfileResult = {
        success: true,
        message: 'Profile saved successfully!',
        profileId: `profile_${account.address}_${Date.now()}`,
        // ipfsHash: 'QmFutureIPFSHash...' // Will be added in Phase 2
      };
      
      setLastSaveResult(result);
      return result;

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save profile';
      setSaveError(errorMessage);
      
      const result: SaveProfileResult = {
        success: false,
        message: errorMessage
      };
      
      setLastSaveResult(result);
      return result;
    } finally {
      setIsSaving(false);
    }
  };

  const loadProfile = (): ProfileData | null => {
    if (!account) return null;
    
    try {
      const keyPrefix = getStorageKeyPrefix();
      const profileKey = `${keyPrefix}-profile-${account.address}`;
      const savedProfile = localStorage.getItem(profileKey);
      
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        // Extract only the profile data fields, excluding metadata
        const {
          displayName, username, bio, profilePicture, githubUrl,
          linkedinUrl, twitterUrl, personalWebsite, location,
          yearsExperience, skills, specialization, email
        } = parsed;
        
        return {
          displayName: displayName || '',
          username: username || '',
          bio: bio || '',
          profilePicture: profilePicture || '',
          githubUrl: githubUrl || '',
          linkedinUrl: linkedinUrl || '',
          twitterUrl: twitterUrl || '',
          personalWebsite: personalWebsite || '',
          location: location || '',
          yearsExperience: yearsExperience || '',
          skills: skills || [],
          specialization: specialization || '',
          email: email || ''
        };
      }
    } catch (error) {
      console.error('Failed to load saved profile:', error);
    }
    
    return null;
  };

  const getProfileHistory = () => {
    if (!account) return [];
    
    try {
      const keyPrefix = getStorageKeyPrefix();
      const profileHistoryKey = `${keyPrefix}-profile-history-${account.address}`;
      const history = localStorage.getItem(profileHistoryKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load profile history:', error);
      return [];
    }
  };

  const clearProfile = () => {
    if (!account) return;
    
    const keyPrefix = getStorageKeyPrefix();
    const profileKey = `${keyPrefix}-profile-${account.address}`;
    const profileHistoryKey = `${keyPrefix}-profile-history-${account.address}`;
    const draftKey = `${keyPrefix}-profile-draft-${account.address}`;
    
    localStorage.removeItem(profileKey);
    localStorage.removeItem(profileHistoryKey);
    localStorage.removeItem(draftKey);
    
    setLastSaveResult(null);
    setSaveError(null);
  };

  // Utility to clean up old global draft data (migration helper)
  const cleanupGlobalDraft = () => {
    localStorage.removeItem('starkflux-profile-draft');
    
    // Also clean up old format data if needed
    if (account) {
      // Remove old format keys that don't include deployment ID
      localStorage.removeItem(`starkflux-profile-${account.address}`);
      localStorage.removeItem(`starkflux-profile-history-${account.address}`);
      localStorage.removeItem(`starkflux-profile-draft-${account.address}`);
    }
  };

  return {
    saveProfile,
    loadProfile,
    getProfileHistory,
    clearProfile,
    cleanupGlobalDraft,
    isSaving,
    saveError,
    lastSaveResult,
    isConnected
  };
};

// Helper function to validate URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default useProfileSave; 