import JSZip from 'jszip';

/**
 * Creates a zip stream from a FileList (folder upload)
 * Uses JSZip to create the archive and returns a ReadableStream
 */
export async function zipFolderStream(files: FileList): Promise<ReadableStream<Uint8Array>> {
  const zip = new JSZip();
  
  // Add all files to the zip
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relativePath = file.webkitRelativePath || file.name;
    
    // Add file to zip
    zip.file(relativePath, file);
  }
  
  // Generate zip as a stream
  const zipStream = zip.generateInternalStream({
    type: 'uint8array',
    streamFiles: true,
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6 // Balanced compression
    }
  });
  
  // Convert JSZip internal stream to ReadableStream
  return new ReadableStream<Uint8Array>({
    start(controller) {
      zipStream.on('data', (chunk: Uint8Array) => {
        controller.enqueue(chunk);
      });
      
      zipStream.on('end', () => {
        controller.close();
      });
      
      zipStream.on('error', (error: Error) => {
        controller.error(error);
      });
    }
  });
}

/**
 * Alternative implementation that loads all files into memory first
 * Use this if the streaming version has issues
 */
export async function zipFolderBlob(files: FileList): Promise<Blob> {
  const zip = new JSZip();
  
  // Add all files to the zip
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relativePath = file.webkitRelativePath || file.name;
    zip.file(relativePath, file);
  }
  
  // Generate zip as blob
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6
    }
  });
} 