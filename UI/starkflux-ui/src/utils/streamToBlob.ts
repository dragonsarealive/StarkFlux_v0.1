/**
 * Converts a ReadableStream to a Blob
 * Collects all chunks in memory - suitable for files up to ~200MB
 */
export async function streamToBlob(
  rs: ReadableStream<Uint8Array>, 
  mime: string = 'application/octet-stream'
): Promise<Blob> {
  const chunks: Uint8Array[] = [];
  const reader = rs.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  
  return new Blob(chunks, { type: mime });
}

/**
 * Alternative implementation with progress tracking
 */
export async function streamToBlobWithProgress(
  rs: ReadableStream<Uint8Array>,
  onProgress?: (bytesRead: number) => void,
  mime: string = 'application/octet-stream'
): Promise<Blob> {
  const chunks: Uint8Array[] = [];
  const reader = rs.getReader();
  let totalBytes = 0;
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      chunks.push(value);
      totalBytes += value.length;
      
      if (onProgress) {
        onProgress(totalBytes);
      }
    }
  } finally {
    reader.releaseLock();
  }
  
  return new Blob(chunks, { type: mime });
} 