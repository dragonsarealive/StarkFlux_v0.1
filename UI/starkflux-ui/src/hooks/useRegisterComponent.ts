import { useState, useCallback, useRef, useEffect } from 'react';
import { CONTRACT_ADDRESSES } from '../abis';
import { useUsdToStrkConversion } from './useUsdToStrkConversion';
import { useWallet } from '../components/wallet/WalletProvider';
import { COMPONENT_REGISTRY_ABI } from '../abis';
import { shortString, Contract, CallData } from 'starknet';

interface ComponentRegistrationData {
  title: string;
  reference: string;
  priceUsdMicros: string;
  priceStrk?: string; // Optional as it's only set when using STRK pricing
  priceFeedKey?: string; // Optional as it's only set when using USD pricing
  accessFlags: number;
}



/**
 * Hook for component registration functionality
 * Now using real Oracle price conversion
 */
export const useRegisterComponent = () => {
  const { account, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [currentStrkEquivalent, setCurrentStrkEquivalent] = useState<string | null>(null);
  const [currentUsdAmount, setCurrentUsdAmount] = useState<string>('');
  const timeoutRef = useRef<number | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Use our real Oracle integration instead of the mock one
  const { 
    convertedAmount,
    isLoading: oracleLoading,
    isStale: oracleStale,
    isFallback,
    error: oracleError
  } = useUsdToStrkConversion(currentUsdAmount);

  // This would be called when USD price input changes to show live STRK equivalent
  const updateStrkEquivalent = useCallback(async (usdAmount: string, customPriceFeedKey?: string) => {
    // Clear any existing timeout to implement debouncing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If the input is empty or zero, clear the STRK equivalent
    if (!usdAmount || parseFloat(usdAmount) === 0) {
      setCurrentUsdAmount('');
      setCurrentStrkEquivalent(null);
      return;
    }
    
    // Update the current USD amount (with debounce)
    timeoutRef.current = setTimeout(() => {
      setCurrentUsdAmount(usdAmount);
      // Store the custom price feed key if provided
      if (customPriceFeedKey) {
        console.log(`Using custom price feed key: ${customPriceFeedKey}`);
      }
    }, 300); // 300ms delay for debouncing
  }, []);

  // Update STRK equivalent when converted amount changes
  useEffect(() => {
    // Only process if convertedAmount is valid and not zero
    if (convertedAmount && convertedAmount !== '0') {
      try {
        // Convert wei to STRK for display with greater precision (1 STRK = 10^18 wei)
        const weiAmount = BigInt(convertedAmount);
        const strkValue = Number(weiAmount) / Math.pow(10, 18);
        
        // Only set the STRK value if it's meaningful (greater than a very small amount)
        if (strkValue > 0.0001) {
          setCurrentStrkEquivalent(strkValue.toString());
          console.log('Updated STRK equivalent:', strkValue.toString());
        } else {
          // For very small values, don't store anything to prevent "0" display
          setCurrentStrkEquivalent(null);
        }
      } catch (err) {
        console.error('Error converting to STRK:', err);
        setCurrentStrkEquivalent(null);
      }
    } else {
      setCurrentStrkEquivalent(null);
    }
  }, [convertedAmount]);
  
  // Set error state if Oracle has an error
  useEffect(() => {
    if (oracleError && currentUsdAmount) {
      setError(`Oracle error: ${oracleError}. Using fallback conversion.`);
    } else {
      setError(null);
    }
  }, [oracleError, currentUsdAmount]);

  // Real blockchain registration function
  const registerComponent = async (data: ComponentRegistrationData) => {
    setLoading(true);
    setError(null);
    setTxHash(null);
    setRegistrationError(null);
    setRegistrationSuccess(false);

    try {
      // Check wallet connection
      if (!account || !isConnected) {
        throw new Error('Please connect your wallet first');
      }

      // Validate data
      if (!data.title.trim()) {
        throw new Error('Component title is required');
      }
      
      if (data.title.length > 31) {
        throw new Error('Component title must be 31 characters or less');
      }
      
      if (!data.reference.trim()) {
        throw new Error('Component reference is required');
      }
      
      if (data.reference.length > 31) {
        throw new Error('Component reference must be 31 characters or less');
      }
      
      // For non-free components, check price based on whether we're using USD or STRK pricing
      if (!(data.accessFlags & 8)) {
        if (data.priceFeedKey) {
          // USD pricing
          if (!data.priceUsdMicros || parseFloat(data.priceUsdMicros) <= 0) {
            throw new Error('USD price is required for non-free components');
          }
        } else {
          // STRK pricing
          if (!data.priceStrk || parseFloat(data.priceStrk) <= 0) {
            throw new Error('STRK price is required for non-free components');
          }
        }
      }
      
      // Convert strings to contract format
      const titleFelt = shortString.encodeShortString(data.title);
      const referenceFelt = shortString.encodeShortString(data.reference);
      const priceFeedKeyFelt = data.priceFeedKey || '0';
      
      // Handle price conversion based on pricing model
      let priceStrkWei = '0';
      let priceUsdMicros = '0';
      
      if (data.priceFeedKey && data.priceUsdMicros && parseFloat(data.priceUsdMicros) > 0) {
        // USD pricing - convert to micros
        priceUsdMicros = Math.floor(parseFloat(data.priceUsdMicros) * 1_000_000).toString();
        priceStrkWei = '0'; // Set STRK to 0 when using USD pricing
      } else if (data.priceStrk && parseFloat(data.priceStrk) > 0) {
        // STRK pricing - convert to wei
        priceStrkWei = Math.floor(parseFloat(data.priceStrk) * Math.pow(10, 18)).toString();
        priceUsdMicros = '0'; // Set USD to 0 when using STRK pricing
      }
      
      // Convert prices to u128 format (contract expects u128, not u256)
      // Validate that values fit within u128 range (2^128 - 1)
      const maxU128 = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'); // 2^128 - 1
      
      if (BigInt(priceStrkWei) > maxU128) {
        throw new Error('STRK price too large for u128');
      }
      
      if (BigInt(priceUsdMicros) > maxU128) {
        throw new Error('USD price too large for u128');
      }
      
      const priceStrkU128 = priceStrkWei;
      const priceUsdMicrosU128 = priceUsdMicros;
      
      // Prepare the call data for the transaction
      const calldata = [
        titleFelt,
        referenceFelt,
        priceStrkU128,
        priceUsdMicrosU128,
        priceFeedKeyFelt,
        data.accessFlags.toString()
      ];
      
      console.log('Contract call parameters:', {
        contractAddress: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
        entrypoint: 'register_component',
        calldata: calldata
      });
      
      // Add detailed parameter logging to debug the "Input too long" error
      console.log('Parameter Analysis:');
      console.log('- titleFelt:', titleFelt, '(length:', titleFelt.length, ')');
      console.log('- referenceFelt:', referenceFelt, '(length:', referenceFelt.length, ')');  
      console.log('- priceStrkU128:', priceStrkU128);
      console.log('- priceUsdMicrosU128:', priceUsdMicrosU128);
      console.log('- priceFeedKeyFelt:', priceFeedKeyFelt, '(length:', priceFeedKeyFelt.length, ')');
      console.log('- accessFlags:', data.accessFlags.toString());
      
      // Check if any felt252 values are too large (> 2^251)
      const maxFelt252 = BigInt('0x800000000000011000000000000000000000000000000000000000000000001');
      console.log('Felt252 validation:');
      try {
        const titleBigInt = BigInt(titleFelt);
        console.log('- titleFelt as BigInt:', titleBigInt.toString(), 'valid:', titleBigInt < maxFelt252);
      } catch(e) { console.log('- titleFelt conversion error:', e); }
      
      try {
        const refBigInt = BigInt(referenceFelt);
        console.log('- referenceFelt as BigInt:', refBigInt.toString(), 'valid:', refBigInt < maxFelt252);
      } catch(e) { console.log('- referenceFelt conversion error:', e); }
      
      try {
        const keyBigInt = BigInt(priceFeedKeyFelt);
        console.log('- priceFeedKeyFelt as BigInt:', keyBigInt.toString(), 'valid:', keyBigInt < maxFelt252);
      } catch(e) { console.log('- priceFeedKeyFelt conversion error:', e); }
      
      // Create contract instance
      const contract = new Contract(
        COMPONENT_REGISTRY_ABI,
        CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
        account
      );
      
      // Compile the calldata using CallData helper
      const compiledCalldata = CallData.compile({
        title: titleFelt,
        reference: referenceFelt,
        price_strk: priceStrkU128,
        price_usd_micros: priceUsdMicrosU128,
        price_feed_key: priceFeedKeyFelt,
        access_flags: data.accessFlags
      });
      
      // Execute the transaction using contract.invoke() method
      const result = await contract.invoke('register_component', compiledCalldata);
      
      setTxHash(result.transaction_hash);
      setRegistrationSuccess(true);
      
      // Return the transaction hash for the component ID
      // In a real implementation, you would parse the transaction receipt to get the component ID
      return {
        success: true,
        txHash: result.transaction_hash,
        componentId: result.transaction_hash // Temporary - should be parsed from events
      };
    } catch (err) {
      const errorMessage = handleContractError(err);
      setError(errorMessage);
      setRegistrationError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Error handling for contract-specific errors
  const handleContractError = (error: any): string => {
    console.error('Contract error details:', error);
    
    if (error.code === 'REJECTED_BY_USER') {
      return 'Transaction was cancelled by user';
    }
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return 'Insufficient funds for transaction';
    }
    
    // Check for the specific ERR_NOT_COMPONENT_REGISTRY error
    if (error.message?.includes('ERR_NOT_COMPONENT_REGISTRY')) {
      return 'Contract validation failed. Please ensure you are registered as a developer first.';
    }
    
    // Check for argent/multicall-failed
    if (error.message?.includes('argent/multicall-failed')) {
      return 'Transaction failed. Please check your wallet connection and try again.';
    }
    
    // Contract-specific error messages
    if (error.message?.includes('Component title already exists')) {
      return 'A component with this title already exists';
    }
    
    if (error.message?.includes('Invalid access flags')) {
      return 'Invalid access flags combination';
    }
    
    if (error.message?.includes('Price must be zero for FREE components')) {
      return 'FREE components must have zero price';
    }
    
    if (error.message?.includes('Developer not registered')) {
      return 'You must register as a developer first';
    }
    
    if (error.message?.includes('Title too long')) {
      return 'Component title must be 31 characters or less';
    }
    
    return error.message || 'Transaction failed';
  };

  return {
    registerComponent,
    loading,
    error,
    txHash,
    currentStrkEquivalent,
    updateStrkEquivalent,
    oracleLoading,
    oracleStale,
    isFallback,
    registrationError,
    registrationSuccess
  };
};

export default useRegisterComponent; 