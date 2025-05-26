import { ACCESS_FLAGS } from '../abis';

/**
 * Format STRK price from wei to human-readable format
 * @param priceWei - Price in wei (string)
 * @returns Formatted price string
 */
export const formatStrkPrice = (priceWei: string): string => {
  if (!priceWei || priceWei === '0') {
    return '0';
  }

  try {
    // Convert from wei (18 decimals) to STRK
    const price = BigInt(priceWei);
    const decimals = BigInt(10 ** 18);
    const wholePart = price / decimals;
    const fractionalPart = price % decimals;

    // If the price is less than 0.01 STRK, show more decimals
    if (wholePart === BigInt(0) && fractionalPart > BigInt(0)) {
      const fractionalStr = fractionalPart.toString().padStart(18, '0');
      // Find first non-zero digit
      let firstNonZero = 0;
      for (let i = 0; i < fractionalStr.length; i++) {
        if (fractionalStr[i] !== '0') {
          firstNonZero = i;
          break;
        }
      }
      // Show up to 4 significant digits after the first non-zero
      const significantDigits = fractionalStr.slice(firstNonZero, firstNonZero + 4);
      return `0.${'0'.repeat(firstNonZero)}${significantDigits}`;
    }

    // For whole numbers or standard decimals
    if (fractionalPart === BigInt(0)) {
      return wholePart.toString();
    }

    // Show up to 2 decimal places for standard prices
    const fractionalStr = fractionalPart.toString().padStart(18, '0');
    const twoDecimals = fractionalStr.slice(0, 2);
    return `${wholePart}.${twoDecimals}`;
  } catch (error) {
    console.error('Error formatting STRK price:', error);
    return '0';
  }
};

/**
 * Format access flags into human-readable array of strings
 * @param flags - Bitwise flags number
 * @returns Array of flag names
 */
export const formatAccessFlags = (flags: number): string[] => {
  const flagNames: string[] = [];

  if (flags & ACCESS_FLAGS.BUY) {
    flagNames.push('BUY');
  }
  if (flags & ACCESS_FLAGS.DEV_SUB) {
    flagNames.push('DEV_SUB');
  }
  if (flags & ACCESS_FLAGS.MKT_SUB) {
    flagNames.push('MKT_SUB');
  }
  if (flags & ACCESS_FLAGS.FREE) {
    flagNames.push('FREE');
  }

  return flagNames.length > 0 ? flagNames : ['NONE'];
};

/**
 * Format USD price from micros to human-readable format
 * @param priceMicros - Price in micros (1/1,000,000 USD)
 * @returns Formatted price string with $ symbol
 */
export const formatUsdPrice = (priceMicros: string | number): string => {
  if (!priceMicros || priceMicros === '0') {
    return '$0.00';
  }

  try {
    const micros = BigInt(priceMicros);
    const dollars = Number(micros) / 1_000_000;
    return `$${dollars.toFixed(2)}`;
  } catch (error) {
    console.error('Error formatting USD price:', error);
    return '$0.00';
  }
};

/**
 * Format timestamp to human-readable date
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
export const formatTimestamp = (timestamp: number): string => {
  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Unknown date';
  }
};

/**
 * Format address to shortened version
 * @param address - Full address string
 * @param startChars - Number of characters to show at start (default 6)
 * @param endChars - Number of characters to show at end (default 4)
 * @returns Shortened address like "0x1234...5678"
 */
export const formatAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address || address.length < startChars + endChars) {
    return address || '';
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}; 