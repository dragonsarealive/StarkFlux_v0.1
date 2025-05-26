import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Avatar,
  IconButton,
  useToast,
  Input,
  Circle
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  displayName?: string;
  username?: string;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImage,
  onImageChange,
  displayName,
  username
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Generate avatar fallback from initials
  const getAvatarFallback = () => {
    const name = displayName || username || 'Dev';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, WebP, etc.)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for preview (in production, upload to IPFS)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageChange(result);
        
        toast({
          title: "Image Uploaded!",
          description: "Your profile picture has been updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload your image. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  }, [onImageChange, toast]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Image Removed",
      description: "Your profile picture has been removed.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

    return (
    <Box position="relative" display="inline-block">
      {/* Profile Picture Display with Hover Overlay */}
      <Box
        position="relative"
        cursor="pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        _hover={{
          '& .edit-overlay': {
            opacity: 1
          }
        }}
      >
        <Avatar
          size="2xl"
          src={currentImage}
          name={getAvatarFallback()}
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          color="white"
          fontWeight="600"
          border="4px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        />
        
        {/* Edit Overlay - Only visible on hover */}
        <Box
          className="edit-overlay"
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.6)"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          opacity="0"
          transition="opacity 0.2s ease"
          cursor="pointer"
        >
          <VStack spacing={1}>
            <EditIcon boxSize={6} color="white" />
            <Text color="white" fontSize="xs" fontWeight="500">
              Edit
            </Text>
          </VStack>
        </Box>
        
        {/* Small edit indicator in bottom right */}
        <Circle
          size="32px"
          bg="rgba(0, 0, 0, 0.8)"
          color="white"
          position="absolute"
          bottom="0"
          right="0"
          border="2px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <EditIcon boxSize={3} />
        </Circle>
      </Box>

      {/* Remove button - only show if image exists */}
      {currentImage && (
        <IconButton
          aria-label="Remove image"
          icon={<DeleteIcon />}
          onClick={handleRemoveImage}
          position="absolute"
          top="-8px"
          right="-8px"
          size="sm"
          colorScheme="red"
          variant="solid"
          borderRadius="full"
          bg="red.500"
          color="white"
          _hover={{
            bg: "red.600",
            transform: "scale(1.1)"
          }}
          transition="all 0.2s ease"
        />
      )}

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        display="none"
      />
    </Box>
  );
};

export default ProfilePictureUpload; 