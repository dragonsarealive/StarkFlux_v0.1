/**
 * Hashes an IPFS CID to fit within felt252 constraints (31 characters max)
 * Uses SHA-256 hash and takes first 30 characters to ensure it fits
 * @param cid - The full IPFS CID
 * @returns A shortened hash that fits in felt252
 */
export async function hashCidForFelt252(cid: string): Promise<string> {
  // Convert CID to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(cid);
  
  // Hash the CID using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Take first 26 characters of the hash to leave room for prefix
  const shortHash = hashHex.slice(0, 26);
  
  // Add a prefix to identify this as a hashed CID (total 30 chars)
  return `cid_${shortHash}`;
}

/**
 * Stores the full CID mapping for later retrieval
 * In production, this would be stored in a database or IPFS
 * For now, we'll use localStorage as a temporary solution
 */
export function storeCidMapping(hashedCid: string, fullCid: string): void {
  const mappings = JSON.parse(localStorage.getItem('cidMappings') || '{}');
  mappings[hashedCid] = fullCid;
  localStorage.setItem('cidMappings', JSON.stringify(mappings));
}

/**
 * Retrieves the full CID from a hashed reference
 */
export function getFullCid(hashedCid: string): string | null {
  const mappings = JSON.parse(localStorage.getItem('cidMappings') || '{}');
  return mappings[hashedCid] || null;
} 