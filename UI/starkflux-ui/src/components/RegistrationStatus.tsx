import React from 'react';
import { 
  Text, Spinner, Alert, AlertIcon, Link, VStack, 
  Progress, Badge, Button, HStack 
} from '@chakra-ui/react';
import { ExternalLinkIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';

interface RegistrationStatusProps {
  // Developer registration
  needsRegistration: boolean;
  isRegistering: boolean;
  registrationError: string | null;
  onRegisterDeveloper: () => void;
  
  // Component registration
  isRegisteringComponent: boolean;
  componentRegistrationError: string | null;
  componentRegistrationSuccess: boolean;
  txHash: string | null;
  confirmationStatus: string;
  blockNumber?: number;
}

export const RegistrationStatus: React.FC<RegistrationStatusProps> = ({
  needsRegistration,
  isRegistering,
  registrationError,
  onRegisterDeveloper,
  isRegisteringComponent,
  componentRegistrationError,
  componentRegistrationSuccess,
  txHash,
  confirmationStatus,
  blockNumber
}) => {
  // Developer registration required
  if (needsRegistration) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <VStack align="start" spacing={2} flex={1}>
          <Text>You must register as a developer before uploading components.</Text>
          <Button 
            size="sm" 
            colorScheme="orange"
            onClick={onRegisterDeveloper}
            isLoading={isRegistering}
            loadingText="Registering..."
          >
            Register as Developer
          </Button>
          {registrationError && (
            <Text color="red.500" fontSize="sm">{registrationError}</Text>
          )}
        </VStack>
      </Alert>
    );
  }
  
  // Component registration in progress
  if (isRegisteringComponent) {
    return (
      <Alert status="info">
        <Spinner size="sm" mr={2} />
        <VStack align="start" spacing={2} flex={1}>
          <Text>Submitting component registration transaction...</Text>
          <Progress size="sm" isIndeterminate width="100%" />
        </VStack>
      </Alert>
    );
  }
  
  // Component registration error
  if (componentRegistrationError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>{componentRegistrationError}</Text>
      </Alert>
    );
  }
  
  // Component registration success
  if (componentRegistrationSuccess && txHash) {
    return (
      <Alert status="success">
        <AlertIcon />
        <VStack align="start" spacing={2} flex={1}>
          <HStack>
            <CheckIcon color="green.500" />
            <Text fontWeight="bold">Component registered successfully!</Text>
          </HStack>
          
          <Text fontSize="sm">
            Transaction: 
            <Link 
              href={`https://sepolia.starkscan.co/tx/${txHash}`}
              isExternal
              color="blue.500"
              ml={2}
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
              <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
          
          {confirmationStatus === 'confirmed' && blockNumber && (
            <HStack>
              <Badge colorScheme="green">Confirmed</Badge>
              <Text fontSize="sm" color="green.600">
                Block {blockNumber}
              </Text>
            </HStack>
          )}
          
          {confirmationStatus === 'pending' && (
            <HStack>
              <Spinner size="xs" />
              <Text fontSize="sm" color="orange.500">
                Waiting for confirmation...
              </Text>
            </HStack>
          )}
          
          {confirmationStatus === 'failed' && (
            <HStack>
              <WarningIcon color="red.500" />
              <Text fontSize="sm" color="red.500">
                Transaction failed
              </Text>
            </HStack>
          )}
        </VStack>
      </Alert>
    );
  }
  
  return null;
}; 