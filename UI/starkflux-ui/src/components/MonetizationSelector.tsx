import React, { useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  Box,
  Badge,
  SimpleGrid,
  Divider,
  Flex
} from '@chakra-ui/react';
import { MonetizationCard, MONETIZATION_TYPES, MonetizationType } from './MonetizationCard';

import { useMonetizationPreferences } from '../hooks/useMonetizationPreferences';

export interface MonetizationPreferences {
  direct: boolean;
  devSubscription: boolean;
  marketplace: boolean;
  free: boolean;
  devSubscriptionPrice: string;
}

interface MonetizationSelectorProps {
  initialPreferences?: Partial<MonetizationPreferences>;
  onPreferencesChange?: (preferences: MonetizationPreferences) => void;
  disabled?: boolean;
}

export const MonetizationSelector: React.FC<MonetizationSelectorProps> = ({
  initialPreferences = {},
  onPreferencesChange,
  disabled = false
}) => {
  // Use localStorage preferences hook
  const { 
    preferences, 
    savePreferences, 
    getAccessFlagsFromPreferences 
  } = useMonetizationPreferences();



  // Apply initial preferences if provided (for external override)
  useEffect(() => {
    if (Object.keys(initialPreferences).length > 0) {
      const mergedPreferences = {
        ...preferences,
        ...initialPreferences
      };
      savePreferences(mergedPreferences);
    }
  }, [initialPreferences]);

  // Update parent when preferences change
  useEffect(() => {
    if (onPreferencesChange) {
      onPreferencesChange(preferences);
    }
  }, [preferences, onPreferencesChange]);



  const handleToggle = async (monetizationType: MonetizationType['id'], enabled: boolean) => {
    const newPreferences = {
      ...preferences,
      [monetizationType]: enabled
    };

    // Handle mutual exclusivity with free
    if (monetizationType === 'free' && enabled) {
      newPreferences.direct = false;
      newPreferences.devSubscription = false;
      newPreferences.marketplace = false;
    } else if (monetizationType !== 'free' && enabled && preferences.free) {
      newPreferences.free = false;
    }

    // Save to localStorage
    savePreferences(newPreferences);
  };



  // Get enabled monetization count for summary
  const enabledCount = Object.values(preferences).filter((value, index) => 
    index < 4 && value === true // Only count the boolean flags, not price
  ).length;

  // Check if any paid monetization is enabled to show revenue split
  const hasPaidMonetization = preferences.direct || preferences.devSubscription || preferences.marketplace;

  // Get access flags preview for user feedback
  const accessFlagsPreview = getAccessFlagsFromPreferences();

  return (
    <VStack spacing={6} align="stretch">
      {/* Header Section */}
      <VStack spacing={3} align="start">
        <HStack justify="space-between" w="full" align="center">
          <VStack align="start" spacing={1}>
            <Text color="white" fontSize="xl" fontWeight="700" letterSpacing="0.5px">
              Monetization Strategy
            </Text>
            <Text color="gray.400" fontSize="sm" lineHeight="1.5" maxW="600px">
              Set your default monetization preferences for component uploads
            </Text>
          </VStack>
          {enabledCount > 0 && (
            <Badge 
              colorScheme="green" 
              variant="subtle" 
              fontSize="xs" 
              px={3} 
              py={1}
              borderRadius="full"
            >
              {enabledCount} method{enabledCount === 1 ? '' : 's'} active
            </Badge>
          )}
        </HStack>

        {/* Preferences Preview */}
        {accessFlagsPreview.enabledMethods.length > 0 && (
          <Box 
            bg="rgba(66, 153, 225, 0.05)" 
            border="1px solid rgba(66, 153, 225, 0.15)" 
            p={3} 
            borderRadius="lg"
            w="full"
          >
            <VStack spacing={2} align="start">
              <Text color="blue.300" fontSize="sm" fontWeight="600">
                💡 Component Upload Defaults
              </Text>
              <Text color="gray.400" fontSize="xs" lineHeight="1.4">
                When you upload components, these access types will be pre-selected: <strong>{accessFlagsPreview.enabledMethods.join(', ')}</strong>
              </Text>
              <Text color="gray.500" fontSize="2xs">
                You can always override these settings per component during upload
              </Text>
            </VStack>
          </Box>
        )}

        {/* Revenue Split Overview */}
        {hasPaidMonetization && (
          <Box 
            bg="rgba(21, 128, 61, 0.05)" 
            border="1px solid rgba(21, 128, 61, 0.15)" 
            p={4} 
            borderRadius="lg"
            w="full"
          >
            <VStack spacing={3} align="stretch">
              <HStack spacing={2} align="center">
                <Text color="green.300" fontSize="sm" fontWeight="600">
                  💰 Smart Contract Revenue Distribution
                </Text>
              </HStack>
              
              <HStack spacing={4} justify="space-between">
                <VStack align="center" spacing={1}>
                  <Box w={3} h={3} bg="green.400" borderRadius="full" />
                  <Text color="green.300" fontSize="xs" fontWeight="600">
                    {preferences.marketplace && !preferences.direct && !preferences.devSubscription ? '45%' : '80%'}
                  </Text>
                  <Text color="gray.400" fontSize="2xs">Developer</Text>
                  <Text color="gray.500" fontSize="2xs" textAlign="center">Your revenue</Text>
                </VStack>
                
                <VStack align="center" spacing={1}>
                  <Box w={3} h={3} bg="blue.400" borderRadius="full" />
                  <Text color="blue.300" fontSize="xs" fontWeight="600">
                    {preferences.marketplace && !preferences.direct && !preferences.devSubscription ? '45%' : '10%'}
                  </Text>
                  <Text color="gray.400" fontSize="2xs">Platform</Text>
                  <Text color="gray.500" fontSize="2xs" textAlign="center">Operations & growth</Text>
                </VStack>
                
                <VStack align="center" spacing={1}>
                  <Box w={3} h={3} bg="purple.400" borderRadius="full" />
                  <Text color="purple.300" fontSize="xs" fontWeight="600">10%</Text>
                  <Text color="gray.400" fontSize="2xs">Liquidity</Text>
                  <Text color="gray.500" fontSize="2xs" textAlign="center">Ecosystem fund</Text>
                </VStack>
              </HStack>
              
              <Text color="gray.400" fontSize="xs" textAlign="center" lineHeight="1.4">
                All payments processed automatically via StarkNet smart contracts
              </Text>
            </VStack>
          </Box>
        )}
      </VStack>



      {/* Modern Monetization Cards Grid - Optimized Layout */}
      <VStack spacing={4} align="stretch">
        {/* Primary Options Row */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          {MONETIZATION_TYPES.filter(m => m.id === 'direct' || m.id === 'devSubscription').map((monetization) => (
            <MonetizationCard
              key={monetization.id}
              monetization={monetization}
              isEnabled={preferences[monetization.id]}
              onToggle={(enabled) => handleToggle(monetization.id, enabled)}
              disabled={disabled}
            />
          ))}
        </SimpleGrid>

        {/* Secondary Options Row */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          {MONETIZATION_TYPES.filter(m => m.id === 'marketplace' || m.id === 'free').map((monetization) => (
            <MonetizationCard
              key={monetization.id}
              monetization={monetization}
              isEnabled={preferences[monetization.id]}
              onToggle={(enabled) => handleToggle(monetization.id, enabled)}
              disabled={disabled}
            />
          ))}
        </SimpleGrid>
      </VStack>

      {/* Strategy Tips */}
      <Box bg="rgba(66, 153, 225, 0.05)" p={4} borderRadius="lg" border="1px solid rgba(66, 153, 225, 0.15)">
        <VStack spacing={3} align="start">
          <Text color="blue.300" fontSize="sm" fontWeight="600">
            💡 Monetization Strategy Tips
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
            <VStack align="start" spacing={1}>
              <Text color="gray.300" fontSize="xs" fontWeight="500">🚀 Getting Started</Text>
              <Text color="gray.400" fontSize="xs">Start with Direct Sales for immediate revenue</Text>
              <Text color="gray.400" fontSize="xs">Use Free components to build reputation</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text color="gray.300" fontSize="xs" fontWeight="500">📈 Scaling Up</Text>
              <Text color="gray.400" fontSize="xs">Add Developer Subscription after 3+ components</Text>
              <Text color="gray.400" fontSize="xs">Enable Marketplace for broader discovery</Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Transaction Status */}
      {txHash && (
        <Box bg="rgba(255, 255, 255, 0.02)" p={3} borderRadius="lg" border="1px solid rgba(255, 255, 255, 0.08)">
          <VStack spacing={2} align="start">
            <Text color="white" fontSize="sm" fontWeight="500">
              🔗 Blockchain Transaction
            </Text>
            <HStack spacing={2}>
              {txStatus === 'pending' && (
                <Box w={2} h={2} bg="orange.400" borderRadius="full" animation="pulse 1.5s infinite" />
              )}
              {txStatus === 'success' && (
                <Box w={2} h={2} bg="green.400" borderRadius="full" />
              )}
              {txStatus === 'error' && (
                <Box w={2} h={2} bg="red.400" borderRadius="full" />
              )}
              <Text color="gray.300" fontSize="xs">
                {txStatus === 'pending' && 'Processing on StarkNet...'}
                {txStatus === 'success' && 'Confirmed on blockchain'}
                {txStatus === 'error' && 'Transaction failed'}
                {!txStatus && 'Waiting for confirmation...'}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </VStack>
  );
}; 