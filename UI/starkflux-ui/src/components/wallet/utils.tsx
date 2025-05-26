/**
 * Formats a StarkNet address for display by shortening it
 * @param address The full StarkNet address
 * @param start Number of characters to show at the start (default: 6)
 * @param end Number of characters to show at the end (default: 4)
 * @returns Shortened address string
 */
export const shortenAddress = (address: string, start = 6, end = 4): string => {
  if (!address) return '';
  
  // Normalize address to include 0x prefix if missing
  let normalizedAddress = address;
  if (!normalizedAddress.startsWith('0x')) {
    normalizedAddress = `0x${normalizedAddress}`;
  }
  
  // Remove leading zeros after 0x prefix
  let cleanAddress = normalizedAddress.replace(/^0x0+/, '0x');
  
  // If address is too short after normalization, return full address
  if (cleanAddress.length <= start + end + 2) { // +2 for '0x'
    return cleanAddress;
  }
  
  const beginning = cleanAddress.substring(2, start + 2); // Start after '0x'
  const ending = cleanAddress.substring(cleanAddress.length - end);
  
  return `0x${beginning}...${ending}`;
};

/**
 * Normalizes a StarkNet address by ensuring it has leading zeros
 * to match the expected 64 characters after 0x prefix
 * @param address The address to normalize
 * @returns Normalized address with 0x prefix and 64 hex characters
 */
export const normalizeAddress = (address: string): string => {
  if (!address) return '';
  
  // Add 0x prefix if missing
  let normalizedAddress = address.startsWith('0x') ? address : `0x${address}`;
  
  // Remove 0x prefix for padding calculation
  const addressWithoutPrefix = normalizedAddress.substring(2);
  
  // Add leading zeros to make it 64 characters long (excluding 0x prefix)
  const paddedAddress = addressWithoutPrefix.padStart(64, '0');
  
  return `0x${paddedAddress}`;
};

/**
 * Checks if an address is valid
 * @param address The address to check
 * @returns Whether the address is valid
 */
export const isValidAddress = (address: string): boolean => {
  if (!address) return false;
  
  // Normalize address for validation
  const normalizedAddress = address.startsWith('0x') ? address : `0x${address}`;
  
  // Check if it's a valid hex string
  const hexRegex = /^0x[0-9a-fA-F]+$/;
  if (!hexRegex.test(normalizedAddress)) return false;
  
  // StarkNet addresses can be different lengths but should be reasonable
  // A typical StarkNet address is 0x + 64 chars (felts)
  return normalizedAddress.length >= 10 && normalizedAddress.length <= 68;
};

/**
 * Copies text to clipboard
 * @param text The text to copy
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
    throw err;
  }
}; 