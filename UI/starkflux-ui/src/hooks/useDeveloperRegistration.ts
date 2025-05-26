import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../components/wallet/WalletProvider';
import { CONTRACT_ADDRESSES, IDENTITY_REGISTRY_ABI } from '../abis';
import { Contract, RpcProvider } from 'starknet';

// Normalize Starknet address to consistent format
function normalizeStarknetAddress(address: string): string {
  if (!address) return address;
  
  // Remove 0x prefix, convert to lowercase, pad to 64 characters, add 0x back
  const cleaned = address.replace('0x', '').toLowerCase();
  const padded = cleaned.padStart(64, '0');
  return `0x${padded}`;
}

export const useDeveloperRegistration = () => {
  const { account, isConnected } = useWallet();
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [developerId, setDeveloperId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const checkDeveloperRegistration = useCallback(async () => {
      if (!account || !isConnected) {
        // No wallet connected - set to unregistered state
        setNeedsRegistration(true);
        setDeveloperId(null);
        setIsLoading(false);
        setError(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Create contract instance with public RPC (same as working diagnostic)
        const provider = new RpcProvider({ 
          nodeUrl: 'https://starknet-sepolia.public.blastapi.io' 
        });
        const contract = new Contract(
          IDENTITY_REGISTRY_ABI,
          CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
          provider
        );
        
        // Check if user has a developer ID
        const result = await contract.call('get_id', [normalizeStarknetAddress(account.address)]);
        
        console.log('🔍 useDeveloperRegistration - Raw result:', result);
        console.log('🔍 Original address:', account.address);
        console.log('🔍 Normalized address:', normalizeStarknetAddress(account.address));
        console.log('🔍 Result type:', typeof result);
        console.log('🔍 Is array:', Array.isArray(result));
        
        let idValue = '0';
        
        // Extract the actual value - the contract returns bigint directly
        if (typeof result === 'bigint') {
          idValue = result.toString();
        } else if (Array.isArray(result)) {
          console.log('📋 Result is array, first element:', result[0]);
          const firstElement = result[0];
          idValue = typeof firstElement === 'bigint' ? firstElement.toString() : firstElement?.toString() || '0';
        } else if (result && typeof result === 'object') {
          console.log('📦 Result is object, trying extraction...');
          
          // Check for result.id first (the actual structure we're getting)
          if ('id' in result) {
            console.log('📦 Found result.id:', result.id);
            const idElement = (result as any).id;
            idValue = typeof idElement === 'bigint' ? idElement.toString() : idElement?.toString() || '0';
          } else if ('result' in result) {
            const innerResult = (result as any).result;
            if (Array.isArray(innerResult) && innerResult.length > 0) {
              const innerElement = innerResult[0];
              idValue = typeof innerElement === 'bigint' ? innerElement.toString() : innerElement?.toString() || '0';
            } else {
              idValue = typeof innerResult === 'bigint' ? innerResult.toString() : innerResult?.toString() || '0';
            }
          } else if ('0' in result) {
            const zeroElement = (result as any)['0'];
            idValue = typeof zeroElement === 'bigint' ? zeroElement.toString() : zeroElement?.toString() || '0';
          } else {
            const numericKeys = Object.keys(result).filter(key => !isNaN(Number(key)));
            if (numericKeys.length > 0) {
              const element = (result as any)[numericKeys[0]];
              idValue = typeof element === 'bigint' ? element.toString() : element?.toString() || '0';
            }
          }
        } else {
          idValue = result?.toString() || '0';
        }
        
        console.log('Real contract call - Developer ID check:', {
          address: account.address,
          rawResult: result,
          extractedId: idValue,
          needsRegistration: idValue === '0'
        });
        
        setDeveloperId(idValue);
        // If developerId is 0, user needs to register
        setNeedsRegistration(idValue === '0');
        
      } catch (err: any) {
        console.error('Error checking developer registration:', err);
        setError(err.message || 'Failed to check developer registration');
        setNeedsRegistration(true); // Default to needs registration on error
      } finally {
        setIsLoading(false);
      }
    }, [account, isConnected]);
  
  useEffect(() => {
    checkDeveloperRegistration();
  }, [checkDeveloperRegistration]);
  
  return {
    developerId,
    needsRegistration,
    isLoading,
    error,
    isRegistered: !needsRegistration && !isLoading && isConnected && developerId && developerId !== '0',
    refreshRegistrationStatus: checkDeveloperRegistration
  };
}; 