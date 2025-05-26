import React from 'react';
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Switch,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  Tooltip,
  Badge,
  Fade,
  Progress,
  Divider,
  Button,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import colors from '../utils/colors';

export interface MonetizationType {
  id: 'direct' | 'devSubscription' | 'marketplace' | 'free';
  title: string;
  icon: string;
  description: string;
  explanation: string;
  bestFor: string;
  requiresPrice?: boolean;
  isGlobal?: boolean;
  revenueSplit?: {
    developer: number;
    platform: number;
    liquidity: number;
  };
}

interface MonetizationCardProps {
  monetization: MonetizationType;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export const MonetizationCard: React.FC<MonetizationCardProps> = ({
  monetization,
  isEnabled,
  onToggle,
  disabled = false
  }) => {

  return (
    <Card
      bg={isEnabled ? "rgba(216, 31, 42, 0.08)" : "rgba(255, 255, 255, 0.02)"}
      borderColor={isEnabled ? "rgba(216, 31, 42, 0.3)" : "rgba(255, 255, 255, 0.1)"}
      borderWidth="1px"
      _hover={{
        borderColor: isEnabled ? "rgba(216, 31, 42, 0.5)" : "rgba(255, 255, 255, 0.2)",
        transform: "translateY(-1px)",
        shadow: "0 4px 20px rgba(0, 0, 0, 0.25)"
      }}
      transition="all 0.2s ease"
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.6 : 1}
      h="100%"
      minH="200px"
    >
      <CardBody p={4}>
        <VStack spacing={3} align="stretch">
          {/* Compact Header */}
          <HStack justify="space-between" align="center">
            <HStack spacing={3} flex="1">
              <Box
                fontSize="lg"
                w={8}
                h={8}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="rgba(255, 255, 255, 0.08)"
                borderRadius="md"
                flexShrink={0}
              >
                {monetization.icon}
              </Box>
              <VStack align="start" spacing={0} flex="1">
                <HStack spacing={2} align="center">
                  <Text color="white" fontWeight="600" fontSize="md" lineHeight="1.2">
                    {monetization.title}
                  </Text>
                  {monetization.isGlobal && (
                    <Badge colorScheme="blue" variant="subtle" fontSize="2xs" px={2} py={0.5}>
                      Platform
                    </Badge>
                  )}
                  <Tooltip
                    label={monetization.explanation}
                    bg="gray.800"
                    color="white"
                    fontSize="xs"
                    borderRadius="md"
                    p={3}
                    maxW="280px"
                    hasArrow
                  >
                    <InfoIcon color="gray.500" w={3} h={3} cursor="help" />
                  </Tooltip>
                </HStack>
                <Text color="gray.400" fontSize="xs" lineHeight="1.3" noOfLines={2}>
                  {monetization.description}
                </Text>
              </VStack>
            </HStack>
            
            <Switch
              isChecked={isEnabled}
              onChange={(e) => onToggle(e.target.checked)}
              colorScheme="red"
              size="md"
              isDisabled={disabled}
              flexShrink={0}
            />
          </HStack>

          {/* Revenue Split Visualization */}
          {monetization.revenueSplit && isEnabled && (
            <Fade in={isEnabled}>
              <Box>
                <Text color="gray.400" fontSize="xs" mb={2} fontWeight="500">
                  Revenue Split:
                </Text>
                <VStack spacing={1.5}>
                  <HStack w="full" spacing={2} fontSize="2xs">
                    <Box bg="green.500" w={`${monetization.revenueSplit.developer}%`} h="4px" borderRadius="full" />
                    <Box bg="blue.500" w={`${monetization.revenueSplit.platform}%`} h="4px" borderRadius="full" />
                    <Box bg="purple.500" w={`${monetization.revenueSplit.liquidity}%`} h="4px" borderRadius="full" />
                  </HStack>
                  <HStack w="full" justify="space-between" fontSize="2xs" color="gray.500">
                    <Text>You: {monetization.revenueSplit.developer}%</Text>
                    <Text>Platform: {monetization.revenueSplit.platform}%</Text>
                    <Text>Vault: {monetization.revenueSplit.liquidity}%</Text>
                  </HStack>
                </VStack>
              </Box>
            </Fade>
          )}



          {/* Best For Info */}
          {isEnabled && (
            <Fade in={isEnabled}>
              <Box bg="rgba(255, 255, 255, 0.02)" p={2} borderRadius="sm">
                <Text color="gray.500" fontSize="2xs" mb={1}>
                  Best for:
                </Text>
                <Text color="gray.400" fontSize="2xs" fontStyle="italic" lineHeight="1.3">
                  {monetization.bestFor}
                </Text>
              </Box>
            </Fade>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Updated monetization types with correct fee splits from smart contracts
export const MONETIZATION_TYPES: MonetizationType[] = [
  {
    id: 'direct',
    title: 'Direct Sales',
    icon: '◆',
    description: 'One-time component purchases with instant revenue.',
    explanation: 'Users buy individual components. Perfect for high-value, specialized tools. You set prices per component and keep the majority of revenue.',
    bestFor: 'Premium, specialized, or high-value components',
    requiresPrice: false,
    revenueSplit: {
      developer: 80,
      platform: 10,
      liquidity: 10
    }
  },
  {
    id: 'devSubscription',
    title: 'Developer Subscription',
    icon: '⟐',
    description: 'Monthly recurring income from your component library.',
    explanation: 'Users subscribe monthly for unlimited access to ALL your components. Creates predictable recurring revenue and encourages component creation.',
    bestFor: 'Prolific developers with 3+ components and regular releases',
    requiresPrice: false,
    revenueSplit: {
      developer: 80,
      platform: 10,
      liquidity: 10
    }
  },
  {
    id: 'marketplace',
    title: 'Marketplace Subscription',
    icon: '◉',
    description: 'Revenue share from platform-wide subscriptions.',
    explanation: 'Users pay for marketplace access, revenue distributed based on component usage and popularity. Increases discoverability through platform marketing.',
    bestFor: 'Broader reach and discovery through platform marketing',
    requiresPrice: false,
    isGlobal: true,
    revenueSplit: {
      developer: 45,
      platform: 45,
      liquidity: 10
    }
  },
  {
    id: 'free',
    title: 'Free Components',
    icon: '○',
    description: 'Build reputation and attract users with free access.',
    explanation: 'Components available at no cost. Excellent for building reputation, showcasing skills, and attracting users to your premium content.',
    bestFor: 'Reputation building, demos, open-source, or lead magnets',
    requiresPrice: false
  }
]; 