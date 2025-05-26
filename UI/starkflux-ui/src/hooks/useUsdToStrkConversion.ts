import { useMemo, useEffect } from 'react';
import { ORACLE_CONSTANTS } from '../abis';
import { usePragmaOracleData } from './usePragmaOracleData';

/**
 * Hook for converting USD amounts to STRK with Oracle integration and fallback mechanism
 * 
 * @param usdAmount - USD amount as a string (e.g. "20.00")
 * @param priceFeedKey - Optional custom price feed key for the Oracle
 * @returns Conversion details including STRK amount and status info
 */
export const useUsdToStrkConversion = (
  usdAmount: string, 
  priceFeedKey?: string
) => {
  // This constant determines whether to attempt Oracle integration
  // Setting to true to enable real Oracle price data instead of fallback
  const USE_ORACLE = true;
  
  // Use provided price feed key or fall back to default
  const activePriceFeedKey = priceFeedKey || ORACLE_CONSTANTS.PRAGMA_STRK_USD_PAIR_ID;
  
  // Fetch the latest STRK/USD price from Pragma Oracle
  const { 
    data: oracleData,
    isLoading, 
    isStale, 
    error: oracleError
  } = usePragmaOracleData(USE_ORACLE ? activePriceFeedKey : null);
  
  // Log Oracle data for debugging
  useEffect(() => {
    if (!USE_ORACLE) {
      console.log("Oracle integration is disabled, using fallback conversion");
      return;
    }
    
    if (oracleData) {
      console.log('Oracle data received for conversion:', {
        priceFeedKey: activePriceFeedKey,
        price: oracleData.price,
        decimals: oracleData.decimals,
        timestamp: new Date(oracleData.lastUpdatedTimestamp * 1000).toISOString(),
        isStale
      });
    } else if (oracleError) {
      console.error('Oracle data error:', oracleError);
    }
  }, [oracleData, oracleError, isStale, activePriceFeedKey]);
  
  // Convert USD to STRK with Oracle data or fallback
  const convertedData = useMemo(() => {
    // Reasonable fallback: 1 STRK = $0.60, so 1 USD = 1.67 STRK approximately
    // Using a fixed conversion rate in a simpler format
    const fallbackStrkPriceInUsd = 0.60; // STRK price in USD
    
    // Skip conversion if amount is empty or zero
    if (!usdAmount || parseFloat(usdAmount) === 0) {
      return {
        convertedAmount: "0",
        strkUsdPrice: Math.floor(fallbackStrkPriceInUsd * 1_000_000).toString(),
        isFallback: true,
        isOracleData: false
      };
    }
    
    // First try with Oracle data if available and USE_ORACLE is true
    if (USE_ORACLE && oracleData && !isStale) {
      try {
        console.log("Attempting Oracle-based conversion with data:", oracleData);
        
        // Oracle price: STRK/USD with decimals specified by Oracle
        const strkUsdPrice = BigInt(oracleData.price);
        const decimals = oracleData.decimals;
        const decimalFactor = BigInt(10) ** BigInt(decimals);
        
        // Convert from USD to STRK with full precision
        // USD amount (in dollars) to USD micros (1 USD = 10^6 micros)
        // Then to wei (1 STRK = 10^18 wei)
        const usdAmountBigInt = BigInt(Math.floor(parseFloat(usdAmount) * 1_000_000)) * BigInt(10)**BigInt(12);
        
        // Formula: (USD amount in wei) * (decimal factor) / (STRK/USD price)
        const strkAmount = (usdAmountBigInt * decimalFactor) / strkUsdPrice;
        
        console.log("Oracle conversion successful:", {
          usdInput: usdAmount,
          strkResult: strkAmount.toString(),
          formula: "usdAmount * decimalFactor / strkUsdPrice"
        });
        
        return {
          convertedAmount: strkAmount.toString(),
          strkUsdPrice: oracleData.price,
          isFallback: false,
          isOracleData: true
        };
      } catch (err) {
        console.error("Oracle conversion error:", err);
        // Will fall through to fallback
      }
    }
    
    // Fallback conversion: Simple calculation using fixed STRK price
    try {
      if (!USE_ORACLE) {
        console.log("Using predetermined fallback conversion rate (Oracle disabled)");
      } else if (isStale) {
        console.log("Using fallback conversion rate (Oracle data stale):", fallbackStrkPriceInUsd);
      } else if (!oracleData) {
        console.log("Using fallback conversion rate (No Oracle data):", fallbackStrkPriceInUsd);
      } else {
        console.log("Using fallback conversion rate (Oracle conversion failed):", fallbackStrkPriceInUsd);
      }
      
      // Simple conversion: USD amount / STRK price in USD = STRK amount
      const usdAmountNumber = parseFloat(usdAmount);
      const strkAmountNumber = usdAmountNumber / fallbackStrkPriceInUsd;
      
      // Convert to wei (multiply by 10^18)
      const strkAmountWei = BigInt(Math.floor(strkAmountNumber * Math.pow(10, 18)));
      
      console.log("Fallback conversion result:", {
        usdInput: usdAmount,
        strkPrice: fallbackStrkPriceInUsd,
        strkAmount: strkAmountNumber,
        strkAmountWei: strkAmountWei.toString()
      });
      
      return {
        convertedAmount: strkAmountWei.toString(),
        strkUsdPrice: Math.floor(fallbackStrkPriceInUsd * 1_000_000).toString(),
        isFallback: true,
        isOracleData: false
      };
    } catch (err) {
      console.error("Fallback conversion error:", err);
      return {
        convertedAmount: "0",
        strkUsdPrice: Math.floor(fallbackStrkPriceInUsd * 1_000_000).toString(),
        isFallback: true,
        isOracleData: false
      };
    }
  }, [usdAmount, oracleData, isStale]);
  
  return {
    convertedAmount: convertedData.convertedAmount,
    strkUsdPrice: convertedData.strkUsdPrice,
    isLoading,
    isStale,
    isFallback: convertedData.isFallback,
    error: oracleError
  };
};

export default useUsdToStrkConversion; 