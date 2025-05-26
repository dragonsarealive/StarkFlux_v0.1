/**
 * Key Management System for StarkFlux Marketplace
 * Enables secure key sharing between developers and purchasers
 */

interface EncryptedKeyData {
  encryptedKey: string; // AES key encrypted with recipient's public key
  iv: string; // Base64 encoded IV
  keyId: string; // Unique identifier for this key
  componentCid: string; // IPFS CID of encrypted component
  createdAt: number; // Timestamp
}

interface KeyEscrowData {
  componentCid: string;
  developerAddress: string;
  encryptedAesKey: string; // AES key encrypted with escrow public key
  iv: string;
  keyId: string;
  createdAt: number;
}

/**
 * Generate a key pair for the user (developer or purchaser)
 */
export async function generateUserKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyJwk,
  };
}

/**
 * Import a public key from JWK format
 */
export async function importPublicKey(publicKeyJwk: JsonWebKey): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    publicKeyJwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
}

/**
 * Import a private key from JWK format
 */
export async function importPrivateKey(privateKeyJwk: JsonWebKey): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt']
  );
}

/**
 * Encrypt AES key with recipient's public key
 */
export async function encryptKeyForRecipient(
  aesKeyRaw: ArrayBuffer,
  recipientPublicKey: CryptoKey
): Promise<string> {
  const encryptedKey = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    recipientPublicKey,
    aesKeyRaw
  );

  return btoa(String.fromCharCode(...new Uint8Array(encryptedKey)));
}

/**
 * Decrypt AES key with recipient's private key
 */
export async function decryptKeyForRecipient(
  encryptedKeyBase64: string,
  recipientPrivateKey: CryptoKey
): Promise<ArrayBuffer> {
  const encryptedKey = new Uint8Array(
    atob(encryptedKeyBase64).split('').map(char => char.charCodeAt(0))
  ).buffer;

  return await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    recipientPrivateKey,
    encryptedKey
  );
}

/**
 * Store user's key pair in localStorage (for demo - should be in secure wallet)
 */
export function storeUserKeyPair(
  publicKeyJwk: JsonWebKey,
  privateKeyJwk: JsonWebKey,
  userAddress: string
): void {
  const keyData = {
    publicKey: publicKeyJwk,
    privateKey: privateKeyJwk,
    address: userAddress,
    createdAt: Date.now(),
  };

  localStorage.setItem(`starkflux_keys_${userAddress}`, JSON.stringify(keyData));
}

/**
 * Retrieve user's key pair from localStorage
 */
export function getUserKeyPair(userAddress: string): {
  publicKeyJwk: JsonWebKey;
  privateKeyJwk: JsonWebKey;
} | null {
  const stored = localStorage.getItem(`starkflux_keys_${userAddress}`);
  if (!stored) return null;

  try {
    const keyData = JSON.parse(stored);
    return {
      publicKeyJwk: keyData.publicKey,
      privateKeyJwk: keyData.privateKey,
    };
  } catch (error) {
    console.error('Failed to parse stored key pair:', error);
    return null;
  }
}

/**
 * Create key escrow entry for a component
 * This would typically be stored on a secure server or IPFS
 */
export async function createKeyEscrow(
  componentCid: string,
  aesKeyRaw: ArrayBuffer,
  iv: Uint8Array,
  developerAddress: string
): Promise<KeyEscrowData> {
  // For demo, we'll use a simple escrow approach
  // In production, this should use a secure key management service
  
  const keyId = crypto.randomUUID();
  
  // Convert to base64 for storage
  const encryptedAesKey = btoa(String.fromCharCode(...new Uint8Array(aesKeyRaw)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  const escrowData: KeyEscrowData = {
    componentCid,
    developerAddress,
    encryptedAesKey,
    iv: ivBase64,
    keyId,
    createdAt: Date.now(),
  };

  // Store in localStorage for demo (should be secure server)
  localStorage.setItem(`escrow_${componentCid}`, JSON.stringify(escrowData));

  return escrowData;
}

/**
 * Retrieve key escrow data for a component
 */
export function getKeyEscrow(componentCid: string): KeyEscrowData | null {
  const stored = localStorage.getItem(`escrow_${componentCid}`);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse escrow data:', error);
    return null;
  }
}

/**
 * Grant access to a component by encrypting the key for a purchaser
 */
export async function grantComponentAccess(
  componentCid: string,
  purchaserPublicKeyJwk: JsonWebKey
): Promise<EncryptedKeyData | null> {
  const escrowData = getKeyEscrow(componentCid);
  if (!escrowData) {
    throw new Error('Component key escrow not found');
  }

  // Convert back from base64
  const aesKeyRaw = new Uint8Array(
    atob(escrowData.encryptedAesKey).split('').map(char => char.charCodeAt(0))
  ).buffer;

  // Import purchaser's public key
  const purchaserPublicKey = await importPublicKey(purchaserPublicKeyJwk);

  // Encrypt AES key for purchaser
  const encryptedKey = await encryptKeyForRecipient(aesKeyRaw, purchaserPublicKey);

  const keyData: EncryptedKeyData = {
    encryptedKey,
    iv: escrowData.iv,
    keyId: escrowData.keyId,
    componentCid,
    createdAt: Date.now(),
  };

  return keyData;
}

/**
 * Decrypt component access key for a purchaser
 */
export async function decryptComponentKey(
  encryptedKeyData: EncryptedKeyData,
  purchaserPrivateKeyJwk: JsonWebKey
): Promise<{
  aesKey: ArrayBuffer;
  iv: Uint8Array;
}> {
  const purchaserPrivateKey = await importPrivateKey(purchaserPrivateKeyJwk);
  
  const aesKey = await decryptKeyForRecipient(
    encryptedKeyData.encryptedKey,
    purchaserPrivateKey
  );

  const iv = new Uint8Array(
    atob(encryptedKeyData.iv).split('').map(char => char.charCodeAt(0))
  );

  return { aesKey, iv };
} 