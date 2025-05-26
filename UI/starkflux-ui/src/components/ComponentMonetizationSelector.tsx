import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Icon,
  Flex
} from '@chakra-ui/react';
import { InfoIcon, CheckIcon } from '@chakra-ui/icons';
import { MonetizationCard, MONETIZATION_TYPES } from './MonetizationCard';
import { ACCESS_FLAGS } from '../abis';

interface ComponentMonetizationSelectorProps {
  accessFlags: number;
  setAccessFlags: (flags: number) => void;
  disabled?: boolean;
}

export const ComponentMonetizationSelector: React.FC<ComponentMonetizationSelectorProps> = ({
  accessFlags,
  setAccessFlags,
  disabled = false
}) => {


  // Convert access flags to enabled methods
  const getEnabledMethods = (flags: number): string[] => {
    const methods: string[] = [];
    if (flags & ACCESS_FLAGS.BUY) methods.push('Direct Purchase');
    if (flags & ACCESS_FLAGS.DEV_SUB) methods.push('Developer Subscription');
    if (flags & ACCESS_FLAGS.MKT_SUB) methods.push('Marketplace Subscription');
    if (flags & ACCESS_FLAGS.FREE) methods.push('Free Access');
    return methods;
  };

  // Handle monetization method toggle
  const handleToggle = (methodId: string, enabled: boolean) => {
    let newFlags = accessFlags;

    switch (methodId) {
      case 'direct':
        if (enabled) {
          newFlags |= ACCESS_FLAGS.BUY;
          newFlags &= ~ACCESS_FLAGS.FREE; // Remove FREE if adding paid method
        } else {
          newFlags &= ~ACCESS_FLAGS.BUY;
        }
        break;
      case 'devSubscription':
        // Disabled for MVP - Coming Soon
        return;
        break;
      case 'marketplace':
        if (enabled) {
          newFlags |= ACCESS_FLAGS.MKT_SUB;
          newFlags &= ~ACCESS_FLAGS.FREE; // Remove FREE if adding paid method
        } else {
          newFlags &= ~ACCESS_FLAGS.MKT_SUB;
        }
        break;
      case 'free':
        if (enabled) {
          newFlags = ACCESS_FLAGS.FREE; // FREE is exclusive
        } else {
          newFlags = ACCESS_FLAGS.BUY; // Default to BUY when removing FREE
        }
        break;
    }

    setAccessFlags(newFlags);
  };

  // Check if a method is enabled
  const isMethodEnabled = (methodId: string): boolean => {
    switch (methodId) {
      case 'direct':
        return (accessFlags & ACCESS_FLAGS.BUY) !== 0;
      case 'devSubscription':
        return (accessFlags & ACCESS_FLAGS.DEV_SUB) !== 0;
      case 'marketplace':
        return (accessFlags & ACCESS_FLAGS.MKT_SUB) !== 0;
      case 'free':
        return (accessFlags & ACCESS_FLAGS.FREE) !== 0;
      default:
        return false;
    }
  };

  const enabledMethods = getEnabledMethods(accessFlags);
  const isFreeEnabled = (accessFlags & ACCESS_FLAGS.FREE) !== 0;

  return (
    <VStack spacing={6} align="stretch">
      {/* Header Section */}
      <VStack spacing={3} align="start">
        <HStack justify="space-between" w="full" align="center">
          <VStack align="start" spacing={1}>
            <Text color="white" fontSize="lg" fontWeight="600">
              Component Access Methods
            </Text>
            <Text color="gray.400" fontSize="sm" lineHeight="1.5">
              Choose how users can access this component
            </Text>
          </VStack>
          {enabledMethods.length > 0 && (
            <Badge 
              colorScheme={isFreeEnabled ? "green" : "blue"} 
              variant="subtle" 
              fontSize="xs" 
              px={3} 
              py={1}
              borderRadius="full"
            >
              {enabledMethods.length} method{enabledMethods.length === 1 ? '' : 's'}
            </Badge>
          )}
        </HStack>

        {/* Current Selection Preview */}
        {enabledMethods.length > 0 && (
          <Box 
            bg="rgba(66, 153, 225, 0.05)" 
            border="1px solid rgba(66, 153, 225, 0.15)" 
            p={3} 
            borderRadius="lg"
            w="full"
          >
            <VStack spacing={2} align="start">
              <HStack>
                <Icon as={CheckIcon} color="blue.300" boxSize={3} />
                <Text color="blue.300" fontSize="sm" fontWeight="600">
                  Selected Access Methods
                </Text>
              </HStack>
              <Text color="gray.400" fontSize="xs" lineHeight="1.4">
                <strong>{enabledMethods.join(', ')}</strong>
              </Text>
              {!isFreeEnabled && (
                <Text color="gray.500" fontSize="2xs">
                  Remember to set pricing for paid access methods
                </Text>
              )}
            </VStack>
          </Box>
        )}
      </VStack>

      {/* Monetization Cards Grid */}
      <Box>
        <VStack spacing={4} align="stretch">
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            {/* Direct Purchase */}
            <Box flex="1">
              <MonetizationCard
                monetization={MONETIZATION_TYPES[0]} // direct
                isEnabled={isMethodEnabled('direct')}
                onToggle={(enabled) => handleToggle('direct', enabled)}
                disabled={disabled || isFreeEnabled}
              />
            </Box>

            {/* Developer Subscription - Coming Soon */}
            <Box position="relative" flex="1">
              <MonetizationCard
                monetization={MONETIZATION_TYPES[1]} // devSubscription
                isEnabled={false}
                onToggle={() => {}} // Disabled
                disabled={true} // Always disabled for MVP
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                bg="rgba(0, 0, 0, 0.9)"
                px={3}
                py={1}
                borderRadius="md"
                border="1px solid rgba(255, 255, 255, 0.3)"
                zIndex={10}
                pointerEvents="none"
                userSelect="none"
              >
                <Text color="white" fontSize="xs" fontWeight="600" textAlign="center">
                  Coming Soon
                </Text>
              </Box>
            </Box>
          </Flex>

          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            {/* Marketplace Subscription */}
            <Box flex="1">
              <MonetizationCard
                monetization={MONETIZATION_TYPES[2]} // marketplace
                isEnabled={isMethodEnabled('marketplace')}
                onToggle={(enabled) => handleToggle('marketplace', enabled)}
                disabled={disabled || isFreeEnabled}
              />
            </Box>

            {/* Free Access */}
            <Box flex="1">
              <MonetizationCard
                monetization={MONETIZATION_TYPES[3]} // free
                isEnabled={isMethodEnabled('free')}
                onToggle={(enabled) => handleToggle('free', enabled)}
                disabled={disabled}
              />
            </Box>
          </Flex>
        </VStack>
      </Box>

      {/* Revenue Split Information */}
      {!isFreeEnabled && enabledMethods.length > 0 && (
        <Box 
          bg="rgba(21, 128, 61, 0.05)" 
          border="1px solid rgba(21, 128, 61, 0.15)" 
          p={4} 
          borderRadius="lg"
          w="full"
        >
          <VStack spacing={3} align="stretch">
            <HStack>
              <Icon as={InfoIcon} color="green.300" boxSize={4} />
              <Text color="green.300" fontSize="sm" fontWeight="600">
                Revenue Distribution
              </Text>
            </HStack>
            
            <VStack spacing={2} align="start">
              {(accessFlags & (ACCESS_FLAGS.BUY | ACCESS_FLAGS.DEV_SUB)) !== 0 && (
                <HStack justify="space-between" w="full">
                  <Text color="gray.400" fontSize="xs">Direct Purchase & Dev Subscription:</Text>
                  <Text color="green.300" fontSize="xs" fontWeight="500">80% You, 10% Platform, 10% Liquidity</Text>
                </HStack>
              )}
              
              {(accessFlags & ACCESS_FLAGS.MKT_SUB) !== 0 && (
                <HStack justify="space-between" w="full">
                  <Text color="gray.400" fontSize="xs">Marketplace Subscription:</Text>
                  <Text color="blue.300" fontSize="xs" fontWeight="500">45% Reward Pool, 45% Platform, 10% Liquidity</Text>
                </HStack>
              )}
            </VStack>
            
            <Text color="gray.500" fontSize="2xs" lineHeight="1.3">
              Revenue is automatically distributed by smart contracts when users access your component
            </Text>
          </VStack>
        </Box>
      )}

      {/* Validation Message */}
      {enabledMethods.length === 0 && (
        <Box 
          bg="rgba(245, 101, 101, 0.05)" 
          border="1px solid rgba(245, 101, 101, 0.15)" 
          p={3} 
          borderRadius="lg"
          w="full"
        >
          <Text color="red.300" fontSize="sm" fontWeight="500">
            ⚠️ Please select at least one access method
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default ComponentMonetizationSelector; 