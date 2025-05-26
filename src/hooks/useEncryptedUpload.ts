import { useState, useCallback } from 'react';

interface EncryptedUploadData {
  cid: string;
  iv: Uint8Array;
  keyRaw: ArrayBuffer;
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

  const handleUploadComplete = useCallback((cid: string, iv: Uint8Array, keyRaw: ArrayBuffer) => {
    setUploadState({
      uploadData: { cid, iv, keyRaw },
      isUploaded: true,
      error: null
    });
    
    // Store encryption keys in localStorage for later access
    // Convert binary data to base64 for storage
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(keyRaw)));
    
    const encryptionData = {
      cid,
      iv: ivBase64,
      key: keyBase64,
      timestamp: Date.now()
    };
    
    // Store with CID as key for easy retrieval
    localStorage.setItem(`component_encryption_${cid}`, JSON.stringify(encryptionData));
    
    console.log('Upload completed and encryption keys stored:', { cid });
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

  const getStoredEncryptionData = useCallback((cid: string) => {
    try {
      const stored = localStorage.getItem(`component_encryption_${cid}`);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      
      // Convert base64 back to binary
      const iv = new Uint8Array(atob(data.iv).split('').map(char => char.charCodeAt(0)));
      const keyRaw = new Uint8Array(atob(data.key).split('').map(char => char.charCodeAt(0))).buffer;
      
      return {
        cid: data.cid,
        iv,
        keyRaw,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Failed to retrieve encryption data:', error);
      return null;
    }
  }, []);

  return {
    uploadData: uploadState.uploadData,
    isUploaded: uploadState.isUploaded,
    error: uploadState.error,
    handleUploadComplete,
    handleUploadError,
    clearUpload,
    getStoredEncryptionData
  };
}; 