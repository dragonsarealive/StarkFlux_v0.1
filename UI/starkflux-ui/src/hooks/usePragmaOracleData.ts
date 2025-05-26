import { useState, useEffect } from 'react';
import { useContract } from '@starknet-react/core';
import { shortString, num, CallData } from 'starknet';
import { CONTRACT_ADDRESSES, ORACLE_CONSTANTS } from '../abis';

// Pragma Oracle ABI - just the functions we need
const PRAGMA_ORACLE_ABI = [
  {
    "name": "get_data_median",
    "type": "function",
    "inputs": [
      {
        "name": "price_feed_key",
        "type": "felt252"
      }
    ],
    "outputs": [
      {
        "name": "price",
        "type": "felt252"
      },
      {
        "name": "decimals",
        "type": "felt252"
      },
      {
        "name": "last_updated_timestamp",
        "type": "felt252"
      },
      {
        "name": "num_sources_aggregated",
        "type": "felt252"
      },
      {
        "name": "status",
        "type": "felt252"
      }
    ],
    "stateMutability": "view"
  }
];

// Type definition for the Oracle data returned to components
export interface OracleData {
  price: string; // Oracle price as string (preserves precision)
  decimals: number; // Number of decimals the price has
  lastUpdatedTimestamp: number; // Unix timestamp
  numSourcesAggregated: number; // Number of sources used in aggregation
  status: number; // Oracle status code
}

// Type definition for the Oracle contract call result
interface OracleResult {
  price: bigint;
  decimals: bigint;
  last_updated_timestamp: bigint;
  num_sources_aggregated: bigint;
  status: bigint;
}

/**
 * Hook for fetching data from the Pragma Oracle
 * Pass null for priceFeedKey to disable Oracle fetching
 */
export const usePragmaOracleData = (priceFeedKey: string | null) => {
  const [data, setData] = useState<OracleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the contract from starknet-react
  const { contract } = useContract({
    address: CONTRACT_ADDRESSES.PRAGMA_ORACLE,
    abi: PRAGMA_ORACLE_ABI,
  });
  
  useEffect(() => {
    // If priceFeedKey is null, Oracle integration is disabled
    if (priceFeedKey === null) {
      setData(null);
      setIsLoading(false);
      setIsStale(false);
      setError(null);
      return;
    }
    
    const fetchOracleData = async () => {
      if (!priceFeedKey) {
        setError('Missing price feed key');
        return;
      }
      
      if (!contract) {
        setError('Oracle contract not initialized');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching Oracle data with price feed key: ${priceFeedKey}`);
        
        // Use shortString encoding if the key is not already in hex format
        let keyHex = priceFeedKey;
        if (!priceFeedKey.startsWith('0x')) {
          keyHex = shortString.encodeShortString(priceFeedKey);
        }
        
        // Convert to BigInt
        const keyFelt = num.toBigInt(keyHex);
        
        // Log for debugging - should show only 16 hex digits after 0x for STRK/USD
        console.log("Price feed key (hex):", keyHex);
        console.log("Price feed key (decimal):", keyFelt.toString());
        
        // Sanity check - this should never trigger if the key is properly formatted
        if (keyFelt >> 251n) {
          throw Error("Key exceeds 251 bits - cannot be used as felt252");
        }
        
        // CRITICAL: Properly format the calldata with the variant index (0 for SpotEntry) and key
        // This is the key fix for the "Endpoint is deprecated" error
        const calldata = CallData.compile([0, keyFelt]);
        
        console.log("Oracle contract address:", CONTRACT_ADDRESSES.PRAGMA_ORACLE);
        console.log("Formatted calldata:", calldata);
        
        // Call the Oracle contract with properly formatted calldata
        const result = await contract.call('get_data_median', calldata) as OracleResult;
        
        console.log('Oracle raw data received:', result);
        
        if (!result) {
          throw new Error('Oracle returned null result');
        }
        
        // Check if oracle data is stale
        const currentTime = Math.floor(Date.now() / 1000);
        const timestamp = Number(result.last_updated_timestamp);
        const isDataStale = (currentTime - timestamp) > ORACLE_CONSTANTS.ORACLE_MAX_STALENESS;
        
        const processedData = {
          price: result.price.toString(),
          decimals: Number(result.decimals),
          lastUpdatedTimestamp: timestamp,
          numSourcesAggregated: Number(result.num_sources_aggregated),
          status: Number(result.status)
        };
        
        console.log('Oracle processed data:', processedData);
        
        setData(processedData);
        setIsStale(isDataStale);
        
        if (isDataStale) {
          console.warn('Oracle data is stale:', {
            currentTime,
            timestamp,
            difference: currentTime - timestamp,
            maxStaleness: ORACLE_CONSTANTS.ORACLE_MAX_STALENESS
          });
        }
      } catch (err) {
        // Provide more detailed error information
        console.error('Error fetching Oracle data:', err);
        
        // Try to extract a more helpful error message
        let errorMessage = 'Unknown error fetching Oracle data';
        
        if (err instanceof Error) {
          errorMessage = err.message;
          
          // Check for specific error types
          if (errorMessage.includes('Contract not found')) {
            errorMessage = 'Oracle contract not found at the specified address';
          } else if (errorMessage.includes('Validate Unhandled')) {
            errorMessage = 'Invalid parameter format for Oracle call - felt252 value too large';
            console.error('The price feed key must be <= 251 bits (NOT 32 bytes/256 bits)');
            console.error('For STRK/USD, use: shortString.encodeShortString("STRK/USD")');
            console.error('Calldata must include variant index: CallData.compile([0, keyFelt])');
          } else if (errorMessage.includes('network') || errorMessage.includes('connect')) {
            errorMessage = 'Network error connecting to Oracle';
          } else if (errorMessage.includes('deprecated') || errorMessage.includes('0.12.3')) {
            errorMessage = 'Using deprecated API endpoint - update to RPC API';
            console.error('The Starknet Sequencer API is deprecated. Using fallback conversion.');
            console.error('Update starknet.js and starknet-react to latest versions and use RPC provider.');
          }
        }
        
        setError(errorMessage);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch data immediately
    fetchOracleData();
    
    // Set up polling every minute to keep data fresh
    const interval = setInterval(fetchOracleData, 60000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, [contract, priceFeedKey]);
  
  return {
    data,
    isLoading,
    isStale,
    error
  };
};

export default usePragmaOracleData; 