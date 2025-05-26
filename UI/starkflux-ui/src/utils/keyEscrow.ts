/**
 * Key Escrow System for StarkFlux Marketplace
 * Implements the proper architecture where:
 * 1. Smart contract handles access control (purchases, subscriptions, FREE)
 * 2. Key escrow service stores encrypted keys
 * 3. Only authorized buyers can retrieve decryption keys
 */

interface ComponentKeyData {
  componentId: string;
  cid: string;
  encryptedAesKey: string; // AES key encrypted for escrow
  iv: string; // Base64 encoded IV
  developerAddress: string;
  createdAt: number;
}

interface PurchaserKeyData {
  componentId: string;
  purchaserAddress: string;
  encryptedAesKey: string; // AES key encrypted for this specific purchaser
  iv: string;
  grantedAt: number;
}

/**
 * Stores encryption keys for a component in the escrow system
 * This enables purchasers to decrypt the component after verifying access
 */
export async function storeComponentKey(
  componentId: string,
  cid: string,
  aesKey: ArrayBuffer,
  iv: Uint8Array,
  developerAddress: string
): Promise<void> {
  // Convert key and IV to storable format
  const keyHex = Array.from(new Uint8Array(aesKey))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const ivHex = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // In production, this would be sent to a secure backend service
  // For MVP, we're using localStorage with the understanding this is temporary
  const escrowData = {
    componentId,
    cid, // Store the full CID
    developerAddress,
    encryptedKey: keyHex, // In production, this would be encrypted with purchaser's public key
    iv: ivHex,
    timestamp: Date.now()
  };

  // Store in escrow system (temporary localStorage implementation)
  const escrowKey = `escrow_${componentId}`;
  localStorage.setItem(escrowKey, JSON.stringify(escrowData));
  
  console.log('Component keys stored in escrow:', {
    componentId,
    cid,
    developer: developerAddress
  });
}

/**
 * Grant access to a component by creating a purchaser-specific encrypted key
 * This would be called by a backend service after verifying smart contract access
 */
export async function grantComponentAccess(
  componentId: string,
  purchaserAddress: string,
  purchaserPublicKeyJwk: JsonWebKey
): Promise<PurchaserKeyData> {
  // Retrieve component key from escrow
  const stored = localStorage.getItem(`component_key_${componentId}`);
  if (!stored) {
    throw new Error('Component key not found in escrow');
  }

  const componentKey: ComponentKeyData = JSON.parse(stored);

  // Convert AES key back from base64
  const aesKeyRaw = new Uint8Array(
    atob(componentKey.encryptedAesKey).split('').map(char => char.charCodeAt(0))
  ).buffer;

  // Import purchaser's public key
  const purchaserPublicKey = await crypto.subtle.importKey(
    'jwk',
    purchaserPublicKeyJwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );

  // Encrypt AES key for this specific purchaser
  const encryptedForPurchaser = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    purchaserPublicKey,
    aesKeyRaw
  );

  const encryptedKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedForPurchaser)));

  const purchaserKeyData: PurchaserKeyData = {
    componentId,
    purchaserAddress,
    encryptedAesKey: encryptedKeyBase64,
    iv: componentKey.iv,
    grantedAt: Date.now(),
  };

  // Store purchaser-specific key
  localStorage.setItem(
    `purchaser_key_${componentId}_${purchaserAddress}`, 
    JSON.stringify(purchaserKeyData)
  );

  return purchaserKeyData;
}

/**
 * Retrieve decryption key for an authorized purchaser
 * This simulates what would happen after smart contract access verification
 */
export async function getPurchaserKey(
  componentId: string,
  purchaserAddress: string,
  purchaserPrivateKeyJwk: JsonWebKey
): Promise<{
  aesKey: ArrayBuffer;
  iv: Uint8Array;
} | null> {
  // Check if purchaser has been granted access
  const stored = localStorage.getItem(`purchaser_key_${componentId}_${purchaserAddress}`);
  if (!stored) {
    return null;
  }

  const purchaserKeyData: PurchaserKeyData = JSON.parse(stored);

  // Import purchaser's private key
  const purchaserPrivateKey = await crypto.subtle.importKey(
    'jwk',
    purchaserPrivateKeyJwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt']
  );

  // Decrypt the AES key
  const encryptedKey = new Uint8Array(
    atob(purchaserKeyData.encryptedAesKey).split('').map(char => char.charCodeAt(0))
  ).buffer;

  const aesKey = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    purchaserPrivateKey,
    encryptedKey
  );

  const iv = new Uint8Array(
    atob(purchaserKeyData.iv).split('').map(char => char.charCodeAt(0))
  );

  return { aesKey, iv };
}

/**
 * Simulate smart contract access verification
 * In production, this would query the actual ComponentRegistry contract
 */
export async function verifyComponentAccess(
  componentId: string,
  userAddress: string
): Promise<{
  hasAccess: boolean;
  accessType: 'FREE' | 'PURCHASED' | 'DEV_SUBSCRIPTION' | 'MARKETPLACE_SUBSCRIPTION' | 'DEVELOPER';
}> {
  // This is a mock implementation
  // In production, this would:
  // 1. Call ComponentRegistry.is_free(componentId)
  // 2. Call ComponentRegistry.has_purchased(componentId, userAddress) 
  // 3. Check subscription contracts for active subscriptions
  // 4. Check if user is the component developer

  // For demo, assume FREE components are accessible
  // and simulate some purchases
  const mockPurchases = ['component_1', 'component_2'];
  const mockFreeComponents = ['component_free'];

  if (mockFreeComponents.includes(componentId)) {
    return { hasAccess: true, accessType: 'FREE' };
  }

  if (mockPurchases.includes(componentId)) {
    return { hasAccess: true, accessType: 'PURCHASED' };
  }

  return { hasAccess: false, accessType: 'FREE' };
}

/**
 * Complete flow: Check access and grant key if authorized
 * This simulates the backend service that would handle key distribution
 */
export async function requestComponentAccess(
  componentId: string,
  userAddress: string,
  userPublicKeyJwk: JsonWebKey
): Promise<PurchaserKeyData | null> {
  // Step 1: Verify access via smart contract
  const { hasAccess, accessType } = await verifyComponentAccess(componentId, userAddress);
  
  if (!hasAccess) {
    throw new Error('Access denied: Component not purchased or accessible');
  }

  console.log(`Access granted via ${accessType} for component ${componentId}`);

  // Step 2: Grant access by encrypting key for user
  return await grantComponentAccess(componentId, userAddress, userPublicKeyJwk);
}

/**
 * Decrypt and download component for authorized user
 */
export async function downloadComponent(
  componentId: string,
  cid: string,
  userAddress: string,
  userPrivateKeyJwk: JsonWebKey
): Promise<Blob> {
  // Get decryption key
  const keyData = await getPurchaserKey(componentId, userAddress, userPrivateKeyJwk);
  if (!keyData) {
    throw new Error('Decryption key not available - access may not be granted');
  }

  // Fetch encrypted component from IPFS
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch component: ${response.status}`);
  }

  const encryptedBlob = await response.blob();
  const encryptedStream = encryptedBlob.stream();

  // Decrypt the stream
  const decryptedStream = await decryptStream(encryptedStream, keyData.aesKey, keyData.iv);
  
  // Convert back to blob
  const chunks: Uint8Array[] = [];
  const reader = decryptedStream.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return new Blob(chunks, { type: 'application/zip' });
}

/**
 * Decrypt stream helper (moved from encryptStream.ts for completeness)
 */
async function decryptStream(
  encryptedSource: ReadableStream<Uint8Array>,
  keyRaw: ArrayBuffer,
  iv: Uint8Array
): Promise<ReadableStream<Uint8Array>> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyRaw,
    {
      name: 'AES-CTR',
      length: 256,
    },
    false,
    ['decrypt']
  );

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = encryptedSource.getReader();
      let counter = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }

          const chunkIv = new Uint8Array(16);
          chunkIv.set(iv);
          
          const counterBytes = new DataView(chunkIv.buffer, 8, 8);
          counterBytes.setBigUint64(0, BigInt(counter), false);

          const decrypted = await crypto.subtle.decrypt(
            {
              name: 'AES-CTR',
              counter: chunkIv,
              length: 64,
            },
            key,
            value
          );

          controller.enqueue(new Uint8Array(decrypted));
          counter++;
        }
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    }
  });
} 