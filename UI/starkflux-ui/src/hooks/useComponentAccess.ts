import { useState, useCallback } from 'react';
import { 
  verifyComponentAccess, 
  requestComponentAccess, 
  downloadComponent,
  getPurchaserKey
} from '../utils/keyEscrow';
import { getFullCid } from '../utils/cidHash';

interface ComponentAccessState {
  hasAccess: boolean;
  accessType: 'FREE' | 'PURCHASED' | 'DEV_SUBSCRIPTION' | 'MARKETPLACE_SUBSCRIPTION' | 'DEVELOPER' | null;
  isLoading: boolean;
  error: string | null;
}

interface DownloadState {
  isDownloading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Hook for managing component access and downloads
 * Integrates with smart contract access control and key escrow system
 */
export const useComponentAccess = () => {
  const [accessState, setAccessState] = useState<ComponentAccessState>({
    hasAccess: false,
    accessType: null,
    isLoading: false,
    error: null
  });

  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    error: null
  });

  /**
   * Check if user has access to a component
   * This queries the smart contract to verify purchase/subscription status
   */
  const checkAccess = useCallback(async (
    componentId: string,
    userAddress: string
  ) => {
    setAccessState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { hasAccess, accessType } = await verifyComponentAccess(componentId, userAddress);
      
      setAccessState({
        hasAccess,
        accessType,
        isLoading: false,
        error: null
      });

      return { hasAccess, accessType };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check access';
      setAccessState({
        hasAccess: false,
        accessType: null,
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }, []);

  /**
   * Request access to a component (for purchasers)
   * This grants access by encrypting the component key for the user
   */
  const requestAccess = useCallback(async (
    componentId: string,
    userAddress: string,
    userPublicKeyJwk: JsonWebKey
  ) => {
    try {
      const purchaserKeyData = await requestComponentAccess(
        componentId,
        userAddress,
        userPublicKeyJwk
      );

      console.log('Access granted for component:', componentId);
      return purchaserKeyData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request access';
      setAccessState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Download and decrypt a component
   * Only works if user has been granted access
   */
  const downloadComponent = async (componentId: string, hashedReference: string) => {
    try {
      setAccessState(prev => ({ ...prev, isLoading: true, error: null }));
      setDownloadState(prev => ({ ...prev, isDownloading: true, progress: 0, error: null }));

      if (!accessState.hasAccess) {
        throw new Error('You do not have access to this component');
      }

      // Step 1: Get decryption keys from escrow
      const keys = await getPurchaserKey(componentId, accessState.accessType, accessState.accessType);
      
      // Step 2: Get the full CID from the hashed reference
      const fullCid = getFullCid(hashedReference);
      if (!fullCid) {
        // If no mapping found, assume it's a direct CID (for backward compatibility)
        console.warn('No CID mapping found, using reference as CID');
      }
      
      const cidToDownload = fullCid || hashedReference;

      // Step 3: Download encrypted component from IPFS
      const encryptedData = await downloadComponent(
        componentId,
        cidToDownload,
        accessState.accessType,
        keys.privateKeyJwk
      );

      // Step 4: Decrypt the component
      const decryptedData = await decryptComponent(
        encryptedData,
        keys.aesKey,
        keys.iv
      );

      // Step 5: Create download blob
      const blob = new Blob([decryptedData], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      
      // Step 6: Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `component_${componentId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setAccessState(prev => ({ ...prev, isLoading: false }));
      setDownloadState(prev => ({ ...prev, isDownloading: false, progress: 100, error: null }));

      return {
        success: true,
        accessType: accessState.accessType
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setAccessState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      setDownloadState(prev => ({ ...prev, isDownloading: false, progress: 0, error: errorMessage }));
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Check if user already has decryption keys for a component
   */
  const hasDecryptionKey = useCallback(async (
    componentId: string,
    userAddress: string,
    userPrivateKeyJwk: JsonWebKey
  ): Promise<boolean> => {
    try {
      const keyData = await getPurchaserKey(componentId, userAddress, userPrivateKeyJwk);
      return keyData !== null;
    } catch (error) {
      console.error('Error checking decryption key:', error);
      return false;
    }
  }, []);

  /**
   * Generate user key pair for encryption/decryption
   * This should be called once per user and stored securely
   */
  const generateUserKeys = useCallback(async (): Promise<{
    publicKeyJwk: JsonWebKey;
    privateKeyJwk: JsonWebKey;
  }> => {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );

    const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

    return { publicKeyJwk, privateKeyJwk };
  }, []);

  /**
   * Store user keys in localStorage (for demo - should be in secure wallet)
   */
  const storeUserKeys = useCallback((
    publicKeyJwk: JsonWebKey,
    privateKeyJwk: JsonWebKey,
    userAddress: string
  ) => {
    const keyData = {
      publicKey: publicKeyJwk,
      privateKey: privateKeyJwk,
      address: userAddress,
      createdAt: Date.now(),
    };

    localStorage.setItem(`starkflux_user_keys_${userAddress}`, JSON.stringify(keyData));
  }, []);

  /**
   * Retrieve user keys from localStorage
   */
  const getUserKeys = useCallback((userAddress: string): {
    publicKeyJwk: JsonWebKey;
    privateKeyJwk: JsonWebKey;
  } | null => {
    const stored = localStorage.getItem(`starkflux_user_keys_${userAddress}`);
    if (!stored) return null;

    try {
      const keyData = JSON.parse(stored);
      return {
        publicKeyJwk: keyData.publicKey,
        privateKeyJwk: keyData.privateKey,
      };
    } catch (error) {
      console.error('Failed to parse stored user keys:', error);
      return null;
    }
  }, []);

  return {
    // Access state
    hasAccess: accessState.hasAccess,
    accessType: accessState.accessType,
    isCheckingAccess: accessState.isLoading,
    accessError: accessState.error,

    // Download state
    isDownloading: downloadState.isDownloading,
    downloadProgress: downloadState.progress,
    downloadError: downloadState.error,

    // Actions
    checkAccess,
    requestAccess,
    downloadComponent,
    hasDecryptionKey,
    generateUserKeys,
    storeUserKeys,
    getUserKeys,
  };
}; 