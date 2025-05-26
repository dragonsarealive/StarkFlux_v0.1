import { useState, useEffect } from 'react';
import { Contract } from 'starknet';
import { useContract, useContractRead } from '@starknet-react/core';
import { useWallet } from '../components/wallet/WalletProvider';
import { CONTRACT_ADDRESSES, DEV_SUBSCRIPTION_ABI } from '../abis';
import { ORACLE_CONSTANTS } from '../abis';
import { useDeveloperRegistration } from './useDeveloperRegistration';
import { formatUsdPrice, formatStrkPrice } from '../abis';

export interface DevSubscriptionPricing {
  setPrice: (priceUsd: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  getCurrentPrice: () => Promise<string | null>;
  getCurrentPriceUsd: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
}

export const useDevSubscriptionPricing = (): DevSubscriptionPricing => {
  const { account, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  // Get developer ID from identity registry
  const { developerId } = useDeveloperRegistration();
  
  // Use starknet-react's useContract hook for reliable provider connection
  const { contract } = useContract({
    address: CONTRACT_ADDRESSES.DEV_SUBSCRIPTION,
    abi: DEV_SUBSCRIPTION_ABI,
  });

  const setPrice = async (priceUsd: string): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    // Check for wallet connection first
    if (!account || !address) {
      const errorMsg = 'Wallet not connected. Please connect your StarkNet wallet (Argent X or Braavos) to set subscription pricing.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Check for contract availability
    if (!contract) {
      const errorMsg = 'Smart contract not available. Please check your network connection.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Check for developer ID
    if (!developerId || developerId === '0') {
      const errorMsg = 'Developer not registered. Please register as a developer first using the registration form.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      console.log('Setting subscription price with:', {
        walletAddress: account.address,
        developerId,
        priceUsd
      });

      // Convert USD price to micros (multiply by 1,000,000)
      const priceUsdMicros = Math.floor(parseFloat(priceUsd) * 1_000_000);
      
      if (priceUsdMicros <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Use the STRK/USD price feed from Pragma Oracle
      const priceFeedKey = ORACLE_CONSTANTS.PRAGMA_STRK_USD_PAIR_ID;

      console.log('Setting developer subscription price:', {
        developerId,
        priceUsdMicros,
        priceFeedKey
      });

      // For write operations, we need to connect the account to the contract
      const contractWithAccount = new Contract(
        DEV_SUBSCRIPTION_ABI,
        CONTRACT_ADDRESSES.DEV_SUBSCRIPTION,
        account
      );

      // Call the contract function
      const result = await contractWithAccount.set_price_usd(
        parseInt(developerId), // Pass as number for core::integer::u64
        priceUsdMicros.toString(),
        priceFeedKey
      );

      const hash = result.transaction_hash;
      setTxHash(hash);

      console.log('Developer subscription price set successfully:', hash);
      
      return {
        success: true,
        txHash: hash
      };

    } catch (err: any) {
      console.error('Failed to set developer subscription price:', err);
      const errorMessage = err?.message || 'Failed to set price';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPrice = async (): Promise<string | null> => {
    if (!contract || !developerId) {
      return null;
    }

    try {
      // Read operations can use the contract directly (no account needed)
      const result = await contract.call('get_price', [parseInt(developerId)]);
      return result.toString();
    } catch (err) {
      console.error('Failed to get current STRK price:', err);
      return null;
    }
  };

  const getCurrentPriceUsd = async (): Promise<string | null> => {
    if (!contract || !developerId) {
      return null;
    }

    try {
      // Read operations can use the contract directly (no account needed)
      const result = await contract.call('get_price_usd', [parseInt(developerId)]);
      // Convert from micros back to USD
      const priceUsd = parseInt(result.toString()) / 1_000_000;
      return priceUsd.toString();
    } catch (err) {
      console.error('Failed to get current USD price:', err);
      return null;
    }
  };

  return {
    setPrice,
    getCurrentPrice,
    getCurrentPriceUsd,
    isLoading,
    error,
    txHash
  };
}; 