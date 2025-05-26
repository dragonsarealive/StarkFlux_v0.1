/**
 * Encrypts a ReadableStream using AES-CTR encryption
 * Returns the encrypted stream along with the IV and key for decryption
 */
export async function encryptStream(source: ReadableStream<Uint8Array>): Promise<{
  stream: ReadableStream<Uint8Array>;
  iv: Uint8Array;
  keyRaw: ArrayBuffer;
}> {
  // Generate a 256-bit AES key
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-CTR',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
  
  // Generate a random 16-byte IV
  const iv = crypto.getRandomValues(new Uint8Array(16));
  
  // Export the key for storage
  const keyRaw = await crypto.subtle.exportKey('raw', key);
  
  // Create a transform stream for encryption
  const encryptedStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader();
      let counter = 0;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            controller.close();
            break;
          }
          
          // Create a unique counter for each chunk
          const chunkIv = new Uint8Array(16);
          chunkIv.set(iv);
          
          // Set the counter in the last 8 bytes (big-endian)
          const counterBytes = new DataView(chunkIv.buffer, 8, 8);
          counterBytes.setBigUint64(0, BigInt(counter), false);
          
          // Encrypt the chunk
          const encrypted = await crypto.subtle.encrypt(
            {
              name: 'AES-CTR',
              counter: chunkIv,
              length: 64, // Counter length in bits
            },
            key,
            value
          );
          
          controller.enqueue(new Uint8Array(encrypted));
          counter++;
        }
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    }
  });
  
  return {
    stream: encryptedStream,
    iv,
    keyRaw
  };
}

/**
 * Decrypts a stream that was encrypted with encryptStream
 */
export async function decryptStream(
  encryptedSource: ReadableStream<Uint8Array>,
  keyRaw: ArrayBuffer,
  iv: Uint8Array
): Promise<ReadableStream<Uint8Array>> {
  // Import the key
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
          
          // Recreate the same counter used for encryption
          const chunkIv = new Uint8Array(16);
          chunkIv.set(iv);
          
          const counterBytes = new DataView(chunkIv.buffer, 8, 8);
          counterBytes.setBigUint64(0, BigInt(counter), false);
          
          // Decrypt the chunk
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