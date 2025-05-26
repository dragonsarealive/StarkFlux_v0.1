/**
 * Uploads a blob to Pinata IPFS service
 * Returns the IPFS hash (CID) that can be used as a reference
 */
export async function uploadBlobToPinata(
  blob: Blob,
  filename: string = 'encrypted.zip'
): Promise<string> {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
  if (!jwt) {
    throw new Error('Pinata JWT missing. Please set NEXT_PUBLIC_PINATA_JWT in .env.local');
  }

  const form = new FormData();
  form.append('file', blob, filename);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: jwt,
    },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const { IpfsHash } = result;

  if (!IpfsHash) {
    throw new Error('No IPFS hash returned from Pinata');
  }

  // Validate CID length for StarkNet felt252 compatibility
  if (IpfsHash.length > 31) {
    throw new Error(`CID too long for felt252: ${IpfsHash.length} characters (max 31)`);
  }

  return IpfsHash;
}

/**
 * Uploads a blob to Pinata with additional metadata
 */
export async function uploadBlobToPinataWithMetadata(
  blob: Blob,
  filename: string,
  metadata: {
    name?: string;
    description?: string;
    keyvalues?: Record<string, string>;
  }
): Promise<string> {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
  if (!jwt) {
    throw new Error('Pinata JWT missing. Please set NEXT_PUBLIC_PINATA_JWT in .env.local');
  }

  const form = new FormData();
  form.append('file', blob, filename);
  
  // Add metadata if provided
  if (metadata) {
    const pinataMetadata = {
      name: metadata.name || filename,
      ...(metadata.description && { description: metadata.description }),
      ...(metadata.keyvalues && { keyvalues: metadata.keyvalues }),
    };
    form.append('pinataMetadata', JSON.stringify(pinataMetadata));
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: jwt,
    },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const { IpfsHash } = result;

  if (!IpfsHash) {
    throw new Error('No IPFS hash returned from Pinata');
  }

  // Validate CID length for StarkNet felt252 compatibility
  if (IpfsHash.length > 31) {
    throw new Error(`CID too long for felt252: ${IpfsHash.length} characters (max 31)`);
  }

  return IpfsHash;
}

/**
 * Test Pinata connection and authentication
 */
export async function testPinataConnection(): Promise<boolean> {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
  if (!jwt) {
    return false;
  }

  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        Authorization: jwt,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Pinata connection test failed:', error);
    return false;
  }
} 