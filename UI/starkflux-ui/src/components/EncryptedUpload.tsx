import React, { useState, useCallback } from 'react';
import { zipFolderBlob } from '../utils/zipStream';
import { encryptStream } from '../utils/encryptStream';
import { streamToBlobWithProgress } from '../utils/streamToBlob';
import { uploadBlobToPinata, testPinataConnection, debugPinataConnection } from '../utils/ipfs';
import { createComponentMetadata } from '../types/metadata';
import {
  Box,
  Button,
  Text,
  Progress,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  List,
  ListItem,
  useColorModeValue,
  Collapse,
  Icon,
  Divider
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface EncryptedUploadProps {
  onComplete: (cid: string, iv: Uint8Array, keyRaw: ArrayBuffer) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
  // Metadata fields for dual IPFS approach
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  category?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  stage: 'idle' | 'zipping' | 'encrypting' | 'uploading' | 'complete' | 'error';
  error: string | null;
  bytesProcessed: number;
  totalFiles: number;
}

interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  children?: FileTreeNode[];
}

export const EncryptedUpload: React.FC<EncryptedUploadProps> = ({
  onComplete,
  onError,
  maxSizeMB = 200,
  title = '',
  description = '',
  author = '',
  tags = [],
  category = 'Uncategorized'
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
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeNode | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

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

  const buildFileTree = (files: FileList): FileTreeNode => {
    const root: FileTreeNode = {
      name: 'Selected Folder',
      path: '',
      isDirectory: true,
      children: []
    };

    // Build tree structure from file paths
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pathParts = file.webkitRelativePath.split('/');
      
      let currentNode = root;
      
      // Navigate/create path in tree
      for (let j = 1; j < pathParts.length; j++) {
        const part = pathParts[j];
        const isLastPart = j === pathParts.length - 1;
        
        if (!currentNode.children) {
          currentNode.children = [];
        }
        
        let childNode = currentNode.children.find(child => child.name === part);
        
        if (!childNode) {
          childNode = {
            name: part,
            path: pathParts.slice(0, j + 1).join('/'),
            isDirectory: !isLastPart,
            ...(isLastPart && { size: file.size })
          };
          currentNode.children.push(childNode);
        }
        
        if (!isLastPart) {
          currentNode = childNode;
        }
      }
    }
    
    return root;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderFileTree = (node: FileTreeNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path) || depth === 0;
    
    return (
      <Box key={node.path} ml={depth * 4}>
        {node.isDirectory ? (
          <>
            <HStack
              spacing={1}
              cursor="pointer"
              onClick={() => toggleFolder(node.path)}
              _hover={{ bg: 'whiteAlpha.50' }}
              p={1}
              borderRadius="sm"
            >
              <Icon
                as={isExpanded ? ChevronDownIcon : ChevronRightIcon}
                boxSize={4}
                color="gray.400"
              />
              <Text fontSize="sm" color="gray.300" fontWeight="medium">
                📁 {node.name}
              </Text>
              {node.children && (
                <Text fontSize="xs" color="gray.500">
                  ({node.children.length} items)
                </Text>
              )}
            </HStack>
            {isExpanded && node.children && (
              <Box>
                {node.children.map(child => renderFileTree(child, depth + 1))}
              </Box>
            )}
          </>
        ) : (
          <HStack spacing={2} p={1} pl={5}>
            <Text fontSize="sm" color="gray.400">
              📄 {node.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              ({formatBytes(node.size || 0)})
            </Text>
          </HStack>
        )}
      </Box>
    );
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    // Store selected files and build tree
    setSelectedFiles(files);
    const tree = buildFileTree(files);
    setFileTree(tree);
    setExpandedFolders(new Set([tree.path])); // Expand root by default

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
      isUploading: false, // Don't start upload immediately
      progress: 0,
      stage: 'idle',
      error: null,
      bytesProcessed: 0,
      totalFiles: files.length
    });
  };

  const startUpload = async () => {
    if (!selectedFiles) return;

    setUploadState({
      isUploading: true,
      progress: 0,
      stage: 'zipping',
      error: null,
      bytesProcessed: 0,
      totalFiles: selectedFiles.length
    });

    try {
      // Step 1: Create zip
      updateProgress('zipping', 10);
      const zipBlob = await zipFolderBlob(selectedFiles);
      
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
      
      // Step 4: Upload encrypted content to Pinata
      updateProgress('uploading', 80);
      const filename = `component-${Date.now()}.zip.enc`;
      const contentCid = await uploadBlobToPinata(encryptedBlob, filename);
      
      // Step 5: Create and upload metadata (if we have component info)
      let metadataCid = contentCid; // Default to content CID if no metadata
      
      if (title && description && author) {
        updateProgress('uploading', 90);
        
        // Create metadata object
        const metadata = createComponentMetadata(
          title,
          description,
          author,
          contentCid,
          selectedFiles.length,
          encryptedBlob.size,
          {
            tags,
            category
          }
        );
        
        // Convert metadata to JSON blob
        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
          type: 'application/json'
        });
        
        // Upload metadata to IPFS
        const metadataFilename = `metadata-${Date.now()}.json`;
        metadataCid = await uploadBlobToPinata(metadataBlob, metadataFilename);
      }
      
      // Step 6: Complete
      updateProgress('complete', 100);
      setUploadState(prev => ({ ...prev, isUploading: false }));
      
      // Pass the metadata CID (or content CID if no metadata)
      onComplete(metadataCid, iv, keyRaw);
      
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

  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box
      border="2px dashed"
      borderColor={borderColor}
      borderRadius="md"
      p={6}
      textAlign="center"
      bg={bgColor}
    >
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.300">
          Upload Component Folder
        </Text>
        
        {/* Pinata Connection Status */}
        {pinataConnected !== null && (
          <VStack spacing={2}>
            <Alert status={pinataConnected ? 'success' : 'error'} size="sm">
              <AlertIcon />
              {pinataConnected ? 'Pinata Connected' : 'Pinata Connection Failed'}
            </Alert>
            {!pinataConnected && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => debugPinataConnection()}
                colorScheme="red"
              >
                Debug Connection
              </Button>
            )}
          </VStack>
        )}
        
        {/* File Input */}
        <Box>
          <input
            type="file"
            id="folder-upload"
            webkitdirectory="true"
            multiple
            onChange={handleFileSelect}
            disabled={uploadState.isUploading || pinataConnected === false}
            style={{ display: 'none' }}
          />
          <VStack spacing={2}>
          <Button
            as="label"
            htmlFor="folder-upload"
            colorScheme="blue"
            isDisabled={uploadState.isUploading || pinataConnected === false}
            cursor={uploadState.isUploading || pinataConnected === false ? 'not-allowed' : 'pointer'}
          >
              Select Folder
          </Button>
            <VStack spacing={1}>
              <Text fontSize="xs" color="gray.500">
                Your browser will ask for confirmation to upload the folder
              </Text>
              <Text fontSize="xs" color="gray.500">
                Click "Upload" in the dialog to proceed
              </Text>
            </VStack>
          </VStack>
        </Box>
        
        {/* File Tree Display */}
        {fileTree && !uploadState.isUploading && uploadState.stage !== 'complete' && (
          <Box w="100%" mt={4}>
            <Divider mb={3} />
            <Text fontSize="sm" fontWeight="semibold" color="gray.300" mb={2}>
              Selected Files:
            </Text>
            <Box
              maxH="200px"
              overflowY="auto"
              border="1px solid"
              borderColor="gray.600"
              borderRadius="md"
              p={3}
              bg="gray.900"
              textAlign="left"
            >
              {renderFileTree(fileTree)}
            </Box>
            <HStack justify="space-between" mt={3}>
              <Text fontSize="sm" color="gray.400">
                Total: {uploadState.totalFiles} files ({formatBytes(calculateTotalSize(selectedFiles!))})
              </Text>
              <Button
                size="sm"
                colorScheme="green"
                onClick={startUpload}
                isLoading={uploadState.isUploading}
                loadingText="Uploading..."
              >
                Start Upload
              </Button>
            </HStack>
          </Box>
        )}
        
        {/* Upload Progress */}
        {uploadState.isUploading && (
          <Box w="100%">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.400">
                {getStageText()}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {Math.round(uploadState.progress)}%
              </Text>
            </HStack>
            <Progress value={uploadState.progress} colorScheme="blue" size="lg" />
            {uploadState.bytesProcessed > 0 && (
              <Text fontSize="xs" color="gray.500" mt={2}>
                Processed: {formatBytes(uploadState.bytesProcessed)}
              </Text>
            )}
          </Box>
        )}
        
        {/* Error Display */}
        {uploadState.error && (
          <Alert status="error">
            <AlertIcon />
            <Text fontSize="sm">{uploadState.error}</Text>
          </Alert>
        )}
        
        {/* Success Message */}
        {uploadState.stage === 'complete' && (
          <Alert status="success">
            <AlertIcon />
            <Text fontSize="sm">Folder uploaded and encrypted successfully!</Text>
          </Alert>
        )}
        
        {/* Upload Info */}
        <Box textAlign="left" w="100%">
          <Text fontSize="sm" fontWeight="semibold" color="gray.300" mb={2}>
            Upload Information:
          </Text>
          <List spacing={1} fontSize="xs" color="gray.400">
            <ListItem>• Maximum folder size: {maxSizeMB} MB</ListItem>
            <ListItem>• Navigate into the folder you want to upload before clicking "Upload"</ListItem>
            <ListItem>• All files and subfolders will be included automatically</ListItem>
            <ListItem>• Files will be zipped and encrypted before upload</ListItem>
            <ListItem>• Encryption keys stored in secure escrow for purchaser access</ListItem>
            <ListItem>• Smart contract controls who can decrypt components</ListItem>
            <ListItem>• Upload to IPFS via Pinata service</ListItem>
          </List>
        </Box>
      </VStack>
    </Box>
  );
}; 