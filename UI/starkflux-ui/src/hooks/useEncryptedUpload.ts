import { useState, useCallback } from 'react';

interface EncryptedUploadData {
  cid: string;
  aesKey: ArrayBuffer;
  iv: Uint8Array;
}

interface EncryptedUploadState {
  uploadData: EncryptedUploadData | null;
  isUploaded: boolean;
  error: string | null;
}

/**
 * Hook to manage encrypted upload state for component registration
 */
export const useEncryptedUpload = () => {
  const [uploadState, setUploadState] = useState<EncryptedUploadState>({
    uploadData: null,
    isUploaded: false,
    error: null
  });

  const handleUploadComplete = useCallback((
    cid: string, 
    iv: Uint8Array, 
    keyRaw: ArrayBuffer
  ) => {
    setUploadState({
      uploadData: { cid, aesKey: keyRaw, iv },
      isUploaded: true,
      error: null
    });
    
    console.log('Upload completed:', { cid });
  }, []);

  const handleUploadError = useCallback((error: string) => {
    setUploadState(prev => ({
      ...prev,
      error,
      isUploaded: false
    }));
  }, []);

  const clearUpload = useCallback(() => {
    setUploadState({
      uploadData: null,
      isUploaded: false,
      error: null
    });
  }, []);

  // Store encryption keys after successful component registration
  const storeKeysInEscrow = useCallback(async (
    componentId: string,
    developerAddress: string
  ) => {
    if (!uploadState.uploadData) {
      throw new Error('No upload data available');
    }

    const { cid, aesKey, iv } = uploadState.uploadData;
    
    // Import the key escrow system
    const { storeComponentKey } = await import('../utils/keyEscrow');
    
    // Store the encryption keys in escrow for purchaser access
    await storeComponentKey(componentId, cid, aesKey, iv, developerAddress);
    
    console.log('Keys stored in escrow for component:', componentId);
  }, [uploadState.uploadData]);

  return {
    uploadData: uploadState.uploadData,
    isUploaded: uploadState.isUploaded,
    error: uploadState.error,
    handleUploadComplete,
    handleUploadError,
    clearUpload,
    storeKeysInEscrow
  };
}; 