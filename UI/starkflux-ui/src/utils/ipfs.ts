/**
 * Uploads a blob to Pinata IPFS service
 * Returns the IPFS hash (CID) that can be used as a reference
 */
export async function uploadBlobToPinata(
  blob: Blob,
  filename: string = 'encrypted.zip'
): Promise<string> {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  if (!jwt) {
    throw new Error('Pinata JWT missing. Please set VITE_PINATA_JWT in .env.local');
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

  // CID will be hashed later to fit within felt252 constraints
  console.log(`Uploaded to IPFS with CID: ${IpfsHash} (${IpfsHash.length} chars)`);

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
  const jwt = import.meta.env.VITE_PINATA_JWT;
  if (!jwt) {
    throw new Error('Pinata JWT missing. Please set VITE_PINATA_JWT in .env.local');
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

  // CID will be hashed later to fit within felt252 constraints
  console.log(`Uploaded to IPFS with CID: ${IpfsHash} (${IpfsHash.length} chars)`);

  return IpfsHash;
}

/**
 * Test Pinata connection and authentication
 */
export async function testPinataConnection(): Promise<boolean> {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  if (!jwt) {
    console.error('Pinata JWT not found in environment variables');
    return false;
  }

  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        Authorization: jwt,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata authentication failed:', response.status, errorText);
    }

    return response.ok;
  } catch (error) {
    console.error('Pinata connection test failed:', error);
    return false;
  }
}

/**
 * Debug Pinata connection with detailed logging
 */
export async function debugPinataConnection(): Promise<void> {
  console.log('=== Pinata Connection Debug ===');
  console.log('Environment JWT:', import.meta.env.VITE_PINATA_JWT ? 'Present' : 'Missing');
  
  if (import.meta.env.VITE_PINATA_JWT) {
    console.log('JWT starts with:', import.meta.env.VITE_PINATA_JWT.substring(0, 20) + '...');
  }
  
  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        Authorization: import.meta.env.VITE_PINATA_JWT,
      },
    });
    
    console.log('Pinata response status:', response.status);
    console.log('Pinata response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Pinata response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Pinata connection successful');
    } else {
      console.log('❌ Pinata connection failed');
    }
  } catch (error) {
    console.error('❌ Pinata connection error:', error);
  }
  console.log('=== End Debug ===');
} 