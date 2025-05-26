import React, { useState, useCallback } from 'react';
import { zipFolderBlob } from '../utils/zipStream';
import { encryptStream } from '../utils/encryptStream';
import { streamToBlobWithProgress } from '../utils/streamToBlob';
import { uploadBlobToPinata, testPinataConnection } from '../utils/ipfs';

interface EncryptedUploadProps {
  onComplete: (cid: string, iv: Uint8Array, keyRaw: ArrayBuffer) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  stage: 'idle' | 'zipping' | 'encrypting' | 'uploading' | 'complete' | 'error';
  error: string | null;
  bytesProcessed: number;
  totalFiles: number;
}

export const EncryptedUpload: React.FC<EncryptedUploadProps> = ({
  onComplete,
  onError,
  maxSizeMB = 200
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    stage: 'idle',
    error: null,
    bytesProcessed: 0,
    totalFiles: 0
  });

  const [pinataConnected, setPinataConnected] = useState<boolean | null>(null);

  // Test Pinata connection on component mount
  React.useEffect(() => {
    testPinataConnection().then(setPinataConnected);
  }, []);

  const updateProgress = useCallback((stage: UploadState['stage'], progress: number, bytesProcessed?: number) => {
    setUploadState(prev => ({
      ...prev,
      stage,
      progress,
      ...(bytesProcessed !== undefined && { bytesProcessed })
    }));
  }, []);

  const handleError = useCallback((error: string) => {
    setUploadState(prev => ({
      ...prev,
      stage: 'error',
      error,
      isUploading: false
    }));
    onError?.(error);
  }, [onError]);

  const calculateTotalSize = (files: FileList): number => {
    let totalSize = 0;
    for (let i = 0; i < files.length; i++) {
      totalSize += files[i].size;
    }
    return totalSize;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    // Check Pinata connection
    if (pinataConnected === false) {
      handleError('Pinata connection failed. Please check your JWT token.');
      return;
    }

    // Calculate total size
    const totalSizeBytes = calculateTotalSize(files);
    const totalSizeMB = totalSizeBytes / (1024 * 1024);

    if (totalSizeMB > maxSizeMB) {
      handleError(`Folder size (${totalSizeMB.toFixed(1)} MB) exceeds maximum allowed size (${maxSizeMB} MB)`);
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      stage: 'zipping',
      error: null,
      bytesProcessed: 0,
      totalFiles: files.length
    });

    try {
      // Step 1: Create zip
      updateProgress('zipping', 10);
      const zipBlob = await zipFolderBlob(files);
      
      // Step 2: Convert to stream and encrypt
      updateProgress('encrypting', 30);
      const zipStream = zipBlob.stream();
      const { stream: encryptedStream, iv, keyRaw } = await encryptStream(zipStream);
      
      // Step 3: Convert encrypted stream to blob with progress
      updateProgress('encrypting', 50);
      const encryptedBlob = await streamToBlobWithProgress(
        encryptedStream,
        (bytesProcessed) => {
          const progress = 50 + (bytesProcessed / zipBlob.size) * 30; // 50-80%
          updateProgress('encrypting', progress, bytesProcessed);
        }
      );
      
      // Step 4: Upload to Pinata
      updateProgress('uploading', 80);
      const filename = `component-${Date.now()}.zip.enc`;
      const cid = await uploadBlobToPinata(encryptedBlob, filename);
      
      // Step 5: Complete
      updateProgress('complete', 100);
      setUploadState(prev => ({ ...prev, isUploading: false }));
      
      onComplete(cid, iv, keyRaw);
      
    } catch (error) {
      console.error('Upload failed:', error);
      handleError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStageText = (): string => {
    switch (uploadState.stage) {
      case 'idle':
        return 'Select a folder to upload';
      case 'zipping':
        return 'Creating zip archive...';
      case 'encrypting':
        return 'Encrypting files...';
      case 'uploading':
        return 'Uploading to IPFS...';
      case 'complete':
        return 'Upload complete!';
      case 'error':
        return 'Upload failed';
      default:
        return '';
    }
  };

  return (
    <div className="encrypted-upload">
      <div className="upload-section">
        <h3>Upload Component Folder</h3>
        
        {/* Pinata Connection Status */}
        {pinataConnected !== null && (
          <div className={`connection-status ${pinataConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-indicator"></span>
            {pinataConnected ? 'Pinata Connected' : 'Pinata Connection Failed'}
          </div>
        )}
        
        {/* File Input */}
        <div className="file-input-container">
          <input
            type="file"
            id="folder-upload"
            webkitdirectory="true"
            multiple
            onChange={handleFileSelect}
            disabled={uploadState.isUploading || pinataConnected === false}
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="folder-upload" 
            className={`upload-button ${uploadState.isUploading ? 'disabled' : ''}`}
          >
            {uploadState.isUploading ? 'Uploading...' : 'Select Folder'}
          </label>
        </div>
        
        {/* Upload Progress */}
        {uploadState.isUploading && (
          <div className="upload-progress">
            <div className="progress-info">
              <span className="stage-text">{getStageText()}</span>
              <span className="progress-percent">{Math.round(uploadState.progress)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
            {uploadState.bytesProcessed > 0 && (
              <div className="bytes-info">
                Processed: {formatBytes(uploadState.bytesProcessed)}
              </div>
            )}
          </div>
        )}
        
        {/* File Count */}
        {uploadState.totalFiles > 0 && (
          <div className="file-count">
            Files selected: {uploadState.totalFiles}
          </div>
        )}
        
        {/* Error Display */}
        {uploadState.error && (
          <div className="error-message">
            <strong>Error:</strong> {uploadState.error}
          </div>
        )}
        
        {/* Success Message */}
        {uploadState.stage === 'complete' && (
          <div className="success-message">
            ✅ Folder uploaded and encrypted successfully!
          </div>
        )}
        
        {/* Upload Info */}
        <div className="upload-info">
          <h4>Upload Information:</h4>
          <ul>
            <li>Maximum folder size: {maxSizeMB} MB</li>
            <li>Files will be zipped and encrypted before upload</li>
            <li>Encryption keys will be stored locally for component access</li>
            <li>Upload to IPFS via Pinata service</li>
          </ul>
        </div>
      </div>
      
      <style jsx>{`
        .encrypted-upload {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          background-color: #fafafa;
        }
        
        .connection-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
          padding: 8px;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .connection-status.connected {
          background-color: #d4edda;
          color: #155724;
        }
        
        .connection-status.disconnected {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: currentColor;
        }
        
        .upload-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        
        .upload-button:hover:not(.disabled) {
          background-color: #0056b3;
        }
        
        .upload-button.disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .upload-progress {
          margin: 20px 0;
          text-align: left;
        }
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #28a745;
          transition: width 0.3s ease;
        }
        
        .bytes-info {
          margin-top: 8px;
          font-size: 12px;
          color: #6c757d;
        }
        
        .file-count {
          margin: 10px 0;
          font-size: 14px;
          color: #495057;
        }
        
        .error-message {
          margin: 16px 0;
          padding: 12px;
          background-color: #f8d7da;
          color: #721c24;
          border-radius: 4px;
          text-align: left;
        }
        
        .success-message {
          margin: 16px 0;
          padding: 12px;
          background-color: #d4edda;
          color: #155724;
          border-radius: 4px;
        }
        
        .upload-info {
          margin-top: 20px;
          text-align: left;
          font-size: 14px;
          color: #6c757d;
        }
        
        .upload-info h4 {
          margin-bottom: 8px;
          color: #495057;
        }
        
        .upload-info ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .upload-info li {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}; 