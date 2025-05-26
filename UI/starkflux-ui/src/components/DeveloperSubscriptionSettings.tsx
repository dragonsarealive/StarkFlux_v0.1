import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { useUsdToStrkConversion } from '../hooks/useUsdToStrkConversion';
import { useDevSubscriptionPricing } from '../hooks/useDevSubscriptionPricing';
import { useWallet } from './wallet/WalletProvider';
import colors from '../utils/colors';

interface DeveloperSubscriptionSettingsProps {
  isRegistered: boolean;
  developerId?: string;
}

const DeveloperSubscriptionSettings: React.FC<DeveloperSubscriptionSettingsProps> = ({
  isRegistered,
  developerId: _developerId // Prefix with underscore to indicate intentionally unused
}) => {
  const toast = useToast();
  const { isConnected } = useWallet();
  
  // Simple state management
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(false);
  const [usdPrice, setUsdPrice] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);

  // Oracle conversion hook - only converts when user clicks Calculate
  const {
    convertedAmount,
    isLoading: conversionLoading,
    error: conversionError,
    isFallback
  } = useUsdToStrkConversion(hasCalculated ? usdPrice : '0');

  // DevSubscription pricing hook
  const {
    setPrice,
    isLoading: pricingLoading,
    error: pricingError,
    txHash
  } = useDevSubscriptionPricing();

  // Handle Calculate STRK button click
  const handleCalculateStrk = () => {
    if (!usdPrice || parseFloat(usdPrice) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid USD price greater than 0",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setHasCalculated(true);
  };

  // Handle Set Price On-Chain button click
  const handleSetPriceOnChain = async () => {
    if (!subscriptionEnabled) {
      toast({
        title: "Subscription Disabled",
        description: "Please enable subscription model first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!hasCalculated || !convertedAmount) {
      toast({
        title: "Calculate STRK First",
        description: "Please calculate STRK equivalent before setting price",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await setPrice(usdPrice);
      
      if (result.success) {
        toast({
          title: "Price Set Successfully!",
          description: `Subscription price set to $${usdPrice} USD`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'Failed to set price');
      }
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error?.message || 'Failed to set price on blockchain',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle subscription toggle
  const handleSubscriptionToggle = (enabled: boolean) => {
    setSubscriptionEnabled(enabled);
    if (!enabled) {
      // Clear data when disabling
      setUsdPrice('');
      setHasCalculated(false);
    }
  };

  // Calculate STRK display value
  const strkEquivalent = hasCalculated && convertedAmount && convertedAmount !== '0' 
    ? (parseFloat(convertedAmount) / Math.pow(10, 18)).toFixed(2)
    : '';

  return (
    <Box opacity={0.5} pointerEvents="none" position="relative">
      {/* Coming Soon Overlay */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={10}
        bg="rgba(0, 0, 0, 0.8)"
        px={4}
        py={2}
        borderRadius="md"
        border="1px solid rgba(255, 255, 255, 0.2)"
      >
        <Text color="white" fontSize="sm" fontWeight="600" textAlign="center">
          Coming Soon in Future Release
        </Text>
      </Box>
      
      <Text color="gray.400" fontSize="lg" fontWeight="600" mb={4}>
        Developer Subscription Settings
      </Text>
      
      <VStack spacing={6} align="stretch">
        {/* Enable/Disable Switch */}
        <Box p={4} bg="rgba(255, 255, 255, 0.02)" borderRadius="md" border="1px solid rgba(255, 255, 255, 0.1)">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text color="white" fontWeight="500">
                Enable Developer Subscriptions
              </Text>
              <Text color="gray.400" fontSize="sm">
                Allow users to subscribe to your content for monthly access
              </Text>
            </VStack>
            <Switch
              isChecked={subscriptionEnabled}
              onChange={(e) => handleSubscriptionToggle(e.target.checked)}
              isDisabled={!isRegistered}
              colorScheme="blue"
              size="lg"
            />
          </HStack>

          {!isRegistered && (
            <Alert status="warning" bg="rgba(255, 165, 0, 0.1)" border="1px solid rgba(255, 165, 0, 0.2)" mt={4}>
              <AlertIcon color="orange.400" />
              <Text color="orange.400" fontSize="sm">
                Complete developer registration to enable subscription settings
              </Text>
            </Alert>
          )}
        </Box>

        {/* Subscription Pricing */}
        {subscriptionEnabled && (
          <Box p={4} bg="rgba(255, 255, 255, 0.02)" borderRadius="md" border="1px solid rgba(255, 255, 255, 0.1)">
            <VStack spacing={4} align="stretch">
              <HStack>
                <Text color="white" fontWeight="500">
                  Monthly Subscription Price
                </Text>
                <Tooltip 
                  label="Set your monthly subscription price in USD. The system will convert to STRK using Pragma Oracle."
                  placement="top"
                  hasArrow
                >
                  <InfoIcon color="gray.400" boxSize={4} cursor="help" />
                </Tooltip>
              </HStack>

              {/* USD Price Input */}
              <FormControl>
                <FormLabel color="gray.300" fontSize="sm">
                  Price (USD)
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Text color="gray.400" fontSize="sm">$</Text>
                  </InputLeftElement>
                  <Input
                    value={usdPrice}
                    onChange={(e) => {
                      setUsdPrice(e.target.value);
                      setHasCalculated(false); // Reset calculation when price changes
                    }}
                    placeholder="5.00"
                    type="number"
                    step="0.01"
                    min="0.01"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                  />
                </InputGroup>
              </FormControl>

              {/* Calculate STRK Button */}
              <Button
                onClick={handleCalculateStrk}
                isDisabled={!usdPrice || parseFloat(usdPrice) <= 0}
                isLoading={conversionLoading}
                loadingText="Calculating..."
                bg={colors.primary}
                color="white"
                size="sm"
                _hover={{ bg: colors.secondary }}
              >
                Calculate STRK Equivalent
              </Button>

              {/* STRK Equivalent Display */}
              {strkEquivalent && (
                <Box p={3} bg="rgba(59, 130, 246, 0.1)" borderRadius="md" border="1px solid rgba(59, 130, 246, 0.2)">
                  <HStack justify="space-between">
                    <Text color="blue.300" fontSize="sm">
                      STRK Equivalent:
                    </Text>
                    <HStack>
                      <Text color="white" fontWeight="600">
                        {strkEquivalent} STRK
                      </Text>
                      <Tooltip 
                        label={isFallback ? "Using fallback conversion rate" : "Provided by Pragma Oracle"} 
                        placement="top"
                        hasArrow
                      >
                        <Box
                          as="span"
                          width="14px"
                          height="14px"
                          cursor="pointer"
                          onClick={() => window.open('https://www.pragma.build/', '_blank')}
                          bg={isFallback ? "orange.600" : "gray.600"}
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="10px"
                          color="white"
                          fontWeight="bold"
                        >
                          i
                        </Box>
                      </Tooltip>
                    </HStack>
                  </HStack>
                </Box>
              )}

              {/* Conversion Error */}
              {conversionError && (
                <Alert status="error" bg="rgba(224, 49, 49, 0.1)" border="1px solid rgba(224, 49, 49, 0.2)">
                  <AlertIcon color="red.400" />
                  <Text color="red.400" fontSize="sm">
                    {conversionError}
                  </Text>
                </Alert>
              )}

              {/* Pricing Hook Error */}
              {pricingError && (
                <Alert status="error" bg="rgba(224, 49, 49, 0.1)" border="1px solid rgba(224, 49, 49, 0.2)">
                  <AlertIcon color="red.400" />
                  <Text color="red.400" fontSize="sm">
                    {pricingError}
                  </Text>
                </Alert>
              )}

              {/* Set Price On-Chain Button */}
              <Button
                onClick={handleSetPriceOnChain}
                isDisabled={!hasCalculated || !strkEquivalent || !isConnected}
                isLoading={pricingLoading}
                loadingText="Setting Price..."
                bg={colors.primary}
                color="white"
                size="md"
                _hover={{ bg: colors.secondary }}
              >
                Set Price On-Chain
              </Button>

              {/* Transaction Success */}
              {txHash && (
                <Alert status="success" bg="rgba(21, 128, 61, 0.1)" border="1px solid rgba(21, 128, 61, 0.2)">
                  <AlertIcon color="green.400" />
                  <VStack align="start" spacing={1}>
                    <Text color="green.400" fontSize="sm" fontWeight="500">
                      Subscription price set successfully!
                    </Text>
                    <Text color="green.300" fontSize="xs">
                      Users can now subscribe to your content for ${usdPrice} USD per month
                    </Text>
                    <Text color="green.300" fontSize="xs">
                      Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </Text>
                  </VStack>
                </Alert>
              )}
            </VStack>
          </Box>
        )}

        {/* Info Section */}
        {subscriptionEnabled && (
          <Box p={4} bg="rgba(59, 130, 246, 0.05)" borderRadius="md" border="1px solid rgba(59, 130, 246, 0.1)">
            <VStack spacing={2} align="start">
              <Text color="blue.300" fontSize="sm" fontWeight="500">
                How Developer Subscriptions Work:
              </Text>
              <VStack spacing={1} align="start" pl={2}>
                <Text color="gray.300" fontSize="xs">
                  • Users pay monthly to access all your DEV_SUB components
                </Text>
                <Text color="gray.300" fontSize="xs">
                  • You receive 80% of fees, platform gets 10%, liquidity pool gets 10%
                </Text>
                <Text color="gray.300" fontSize="xs">
                  • Prices set in USD, charged in STRK using Oracle conversion
                </Text>
                <Text color="gray.300" fontSize="xs">
                  • Subscribers get unlimited access during their subscription period
                </Text>
              </VStack>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default DeveloperSubscriptionSettings; 