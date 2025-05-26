/**
 * Format a StarkNet price from wei to STRK
 * @param priceWei Price in wei as string or number
 * @param decimals Number of decimal places to show
 * @returns Formatted price in STRK
 */
export const formatStrkPrice = (priceWei: string | number, decimals = 4): string => {
  if (!priceWei) return "0";
  
  try {
    // Convert to BigInt for precise calculation
    const price = typeof priceWei === 'string' ? BigInt(priceWei) : BigInt(priceWei);
    
    // 1 STRK = 10^18 wei
    const divisor = BigInt(10 ** 18);
    
    // Integer division
    const wholePart = price / divisor;
    
    // Remainder for decimal part
    const fractionPart = price % divisor;
    
    // Format the fractional part with specified decimal places
    const fractionalStr = fractionPart.toString().padStart(18, '0');
    const decimalsStr = fractionalStr.substring(0, decimals);
    
    return `${wholePart}${decimals > 0 ? '.' + decimalsStr : ''}`;
  } catch (error) {
    console.error("Error formatting STRK price:", error);
    return "0";
  }
};

/**
 * Convert access flags to readable format
 * @param flags Access flags bitmask
 * @returns Array of access type strings
 */
export const formatAccessFlags = (flags: number): string[] => {
  const accessTypes = [];
  if (flags & 1) accessTypes.push("BUY");
  if (flags & 2) accessTypes.push("DEV_SUB");
  if (flags & 4) accessTypes.push("MKT_SUB");
  if (flags & 8) accessTypes.push("FREE");
  return accessTypes;
};

/**
 * Format a unix timestamp to a readable date
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
}; 