import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Image,
  Flex,
  Spacer,
  useColorModeValue,
  Icon,
  Tooltip,
  Skeleton,
  SkeletonText,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  useToast,
} from '@chakra-ui/react';
import { 
  DownloadIcon, 
  LockIcon, 
  UnlockIcon, 
  StarIcon,
  TimeIcon,
  ViewIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
} from '@chakra-ui/icons';
import { useAccount, useContract, useSendTransaction } from '@starknet-react/core';
import { CONTRACT_ADDRESSES, formatStrkPrice, formatUsdPrice } from '../abis';
import { formatAccessFlags } from '../utils/contractFormatters';

interface ComponentCardProps {
  component: {
    id: number;
    title: string;
    description?: string;
    reference: string;
    seller: string;
    seller_id: number;
    price_strk: string;
    access_flags: number;
    timestamp: number;
    is_active?: boolean;
    price_usd_micros?: string;
    price_feed_key?: string;
    metadata?: any;
    tags?: string[];
    category?: string;
    screenshots?: string[];
  };
  onPurchase?: () => void;
  onDownload?: () => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, onPurchase, onDownload }) => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const priceColor = useColorModeValue('blue.600', 'blue.300');
  const freeColor = useColorModeValue('green.600', 'green.300');
  
  // Check if component is free
  const isFree = !!(component.access_flags & 8);
  
  // Format price display
  const getPriceDisplay = () => {
    if (isFree) return 'FREE';
    
    if (component.price_usd_micros && component.price_usd_micros !== '0') {
      return formatUsdPrice(component.price_usd_micros);
    }
    
    if (component.price_strk && component.price_strk !== '0') {
      return formatStrkPrice(component.price_strk);
    }
    
    return 'Price not set';
  };
  
  // Get access method badges
  const getAccessBadges = () => {
    const badges = [];
    const flags = component.access_flags;
    
    if (flags & 8) {
      badges.push({ label: 'FREE', color: 'green' });
    }
    if (flags & 1) {
      badges.push({ label: 'BUY', color: 'blue' });
    }
    if (flags & 2) {
      badges.push({ label: 'DEV SUB', color: 'purple' });
    }
    if (flags & 4) {
      badges.push({ label: 'MKT SUB', color: 'orange' });
    }
    
    return badges;
  };
  
  // Handle purchase/download action
  const handleAction = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to continue',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFree || hasAccess) {
        // Handle download
        if (onDownload) {
          await onDownload();
        } else {
          // Default download behavior - open reference
          window.open(component.reference, '_blank');
        }
        
        toast({
          title: 'Download started',
          description: 'Your download should begin shortly',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Handle purchase
        if (onPurchase) {
          await onPurchase();
        } else {
          toast({
            title: 'Purchase required',
            description: 'Please complete the purchase to access this component',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        title: 'Action failed',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get button text and icon
  const getButtonConfig = () => {
    if (isFree) {
      return {
        text: 'Download',
        icon: DownloadIcon,
        colorScheme: 'green',
      };
    }
    
    if (hasAccess) {
      return {
        text: 'Download',
        icon: DownloadIcon,
        colorScheme: 'blue',
      };
    }
    
    return {
      text: `Purchase - ${getPriceDisplay()}`,
      icon: LockIcon,
      colorScheme: 'blue',
    };
  };
  
  const buttonConfig = getButtonConfig();
  
  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'lg',
        borderColor: 'blue.400',
      }}
      position="relative"
      height="full"
      display="flex"
      flexDirection="column"
    >
      {/* Screenshot or placeholder image */}
      {component.screenshots && component.screenshots.length > 0 ? (
        <Image
          src={component.screenshots[0]}
          alt={component.title}
          height="200px"
          width="100%"
          objectFit="cover"
          fallback={
            <Box
              height="200px"
              bg={useColorModeValue('gray.100', 'gray.700')}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={ViewIcon} boxSize={12} color={mutedColor} />
            </Box>
          }
        />
      ) : (
        <Box
          height="200px"
          bg={useColorModeValue('gray.100', 'gray.700')}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={ViewIcon} boxSize={12} color={mutedColor} />
        </Box>
      )}
      
      <VStack align="stretch" p={4} spacing={3} height="full">
        {/* Title and ID */}
        <Flex align="center" justify="space-between">
          <Text fontSize="lg" fontWeight="bold" color={textColor} noOfLines={1}>
            {component.title}
          </Text>
          <Badge colorScheme="gray" fontSize="xs">
            #{component.id}
          </Badge>
        </Flex>
        
        {/* Description */}
        <Box minH="40px">
          {component.description ? (
            <Text fontSize="sm" color={mutedColor} noOfLines={2}>
              {component.description}
            </Text>
          ) : (
            <SkeletonText noOfLines={2} spacing={2} />
          )}
        </Box>
        
        {/* Tags */}
        <Box minH="28px">
          {component.tags && component.tags.length > 0 ? (
            <Wrap spacing={2}>
              {component.tags.slice(0, 3).map((tag, index) => (
                <WrapItem key={index}>
                  <Tag size="sm" colorScheme="blue" variant="subtle">
                    <TagLabel>{tag}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
              {component.tags.length > 3 && (
                <WrapItem>
                  <Tag size="sm" variant="ghost">
                    <TagLabel>+{component.tags.length - 3}</TagLabel>
                  </Tag>
                </WrapItem>
              )}
            </Wrap>
          ) : (
            <Box />
          )}
        </Box>
        
        {/* Access badges */}
        <HStack spacing={2}>
          {getAccessBadges().map((badge, index) => (
            <Badge key={index} colorScheme={badge.color} fontSize="xs">
              {badge.label}
            </Badge>
          ))}
        </HStack>
        
        {/* Developer info */}
        <HStack fontSize="xs" color={mutedColor}>
          <Text>by</Text>
          <Tooltip label={component.seller} placement="top">
            <Text fontFamily="mono" noOfLines={1}>
              {component.seller.slice(0, 6)}...{component.seller.slice(-4)}
            </Text>
          </Tooltip>
        </HStack>
        
        <Spacer />
        
        {/* Price and action button */}
        <VStack spacing={2} align="stretch" mt="auto">
          {/* Always show price section for consistent height */}
          <Flex justify="space-between" align="center" minH="32px">
            <Text fontSize="sm" color={mutedColor}>
              Price:
            </Text>
            <Text 
              fontSize="lg" 
              fontWeight="bold" 
              color={isFree ? freeColor : priceColor}
            >
              {getPriceDisplay()}
            </Text>
          </Flex>
          
          <Button
            colorScheme={buttonConfig.colorScheme}
            leftIcon={<Icon as={buttonConfig.icon} />}
            onClick={handleAction}
            isLoading={isLoading}
            loadingText="Processing..."
            width="100%"
            size="md"
            isDisabled={!isConnected}
          >
            {buttonConfig.text}
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default ComponentCard; 