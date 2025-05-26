import { useState } from 'react';
import { useWallet } from '../components/wallet/WalletProvider';
import { CONTRACT_ADDRESSES, IDENTITY_REGISTRY_ABI } from '../abis';
import { Contract } from 'starknet';

export const useRegisterDeveloper = () => {
  const { account, isConnected } = useWallet();
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const registerDeveloper = async () => {
    if (!account || !isConnected) {
      setRegistrationError('Please connect your wallet first');
      return { success: false, error: 'No wallet connected' };
    }
    
    setRegistrationError(null);
    setRegistrationSuccess(false);
    setIsRegistering(true);
    
    try {
      // Create contract instance
      const contract = new Contract(
        IDENTITY_REGISTRY_ABI,
        CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
        account
      );
      
      // Execute the registration transaction
      const result = await contract.invoke('register', []);
      
      setRegistrationSuccess(true);
      
      return { success: true, hash: result.transaction_hash };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Developer registration failed';
      
      // Check for specific error types
      if (error.message && error.message.includes('ERR_ALREADY_REGISTERED')) {
        errorMessage = 'You are already registered as a developer! Please refresh the page.';
      } else if (error.message && error.message.includes('argent/multicall-failed')) {
        errorMessage = 'Transaction failed. You may already be registered as a developer.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setRegistrationError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsRegistering(false);
    }
  };
  
  return {
    registerDeveloper,
    isRegistering,
    registrationError,
    registrationSuccess
  };
}; 