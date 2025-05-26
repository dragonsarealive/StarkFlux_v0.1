import { useState, useEffect } from 'react';
import { useWallet } from '../components/wallet/WalletProvider';
import { RpcProvider } from 'starknet';

export const useTransactionStatus = (hash: string | null) => {
  const { account } = useWallet();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  
  useEffect(() => {
    if (!hash || !account) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }
    
    const checkTransactionStatus = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      
      try {
        // Create RPC provider for checking transaction status
        const provider = new RpcProvider({
          nodeUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/v0_8/NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb'
        });
        
        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(hash);
        setData(receipt);
      } catch (err: any) {
        console.error('Error checking transaction status:', err);
        setIsError(true);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check status immediately
    checkTransactionStatus();
    
    // Set up polling for pending transactions
    const interval = setInterval(checkTransactionStatus, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [hash, account]);
  
  const getStatus = () => {
    if (!hash) return 'idle';
    if (isLoading) return 'pending';
    if (isError) return 'failed';
    if (data) return 'confirmed';
    return 'unknown';
  };
  
  return {
    status: getStatus(),
    transactionData: data,
    isConfirming: isLoading,
    confirmationError: error,
    blockNumber: data?.block_number,
    blockHash: data?.block_hash
  };
}; 