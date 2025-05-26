import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import colors from '../utils/colors';
import useRegisterComponent from '../hooks/useRegisterComponent';
import { useDeveloperRegistration } from '../hooks/useDeveloperRegistration';
import { useRegisterDeveloper } from '../hooks/useRegisterDeveloper';
import { useTransactionStatus } from '../hooks/useTransactionStatus';
import { useWallet } from '../components/wallet/WalletProvider';
import { useEncryptedUpload } from '../hooks/useEncryptedUpload';
// import { useCheckRegistryConfig } from '../hooks/useCheckRegistryConfig'; // REMOVED - checking non-existent function

import { ComponentMonetizationSelector } from '../components/ComponentMonetizationSelector';
import { EncryptedUpload } from '../components/EncryptedUpload';
import { ACCESS_FLAGS, ORACLE_CONSTANTS } from '../abis';
import { isGitHubUrl, parseGitHubUrl } from '../utils/githubUtils';
import { GitHubRepositoryPreview } from '../components/GitHubRepositoryPreview';
import { 
  Box, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea, 
  Button, 
  Text, 
  Flex, 
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  Container,
  VStack,
  HStack,
  Heading,
  IconButton,
  Card,
  CardBody,
  Tooltip,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { hashCidForFelt252, storeCidMapping } from '../utils/cidHash';

/**
 * Component Upload Form
 */
const UploadComponent = () => {
  const navigate = useNavigate();
  
  const { 
    registerComponent, 
    loading, 
    error, 
    txHash, 
    currentStrkEquivalent, 
    updateStrkEquivalent,
    oracleLoading,
    oracleStale,
    isFallback
  } = useRegisterComponent();
  
  // Wallet connection hook
  const { account, isConnected, connectWallet } = useWallet();
  
  // Developer registration hooks
  const { 
    needsRegistration, 
    isLoading: checkingRegistration,
    developerId,
    isRegistered,
    refreshRegistrationStatus
  } = useDeveloperRegistration();
  
  const { 
    registerDeveloper, 
    isRegistering, 
    registrationError, 
    registrationSuccess 
  } = useRegisterDeveloper();
  
  // Encrypted upload hook
  const {
    uploadData,
    isUploaded,
    error: uploadError,
    handleUploadComplete,
    handleUploadError,
    clearUpload,
    storeKeysInEscrow
  } = useEncryptedUpload();
  
  // State for wallet connection flow
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletConnectionMessage, setWalletConnectionMessage] = useState<string | null>(null);


  
  // Transaction status tracking for component registration
  const { 
    status: txStatus, 
    blockNumber
  } = useTransactionStatus(txHash);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [priceUsdInput, setPriceUsdInput] = useState('');
  const [priceStrk, setPriceStrk] = useState('');
  const [pricingModel, setPricingModel] = useState<'USD' | 'STRK'>('USD');
  const [uploadMethod, setUploadMethod] = useState<'folder' | 'github'>('folder');
  // GitHub repository preview state
  const [isGitHubRepository, setIsGitHubRepository] = useState(false);
  const [gitHubOwner, setGitHubOwner] = useState('');
  const [gitHubRepo, setGitHubRepo] = useState('');
  const priceFeedKey = ORACLE_CONSTANTS.PRAGMA_STRK_USD_PAIR_ID;
  const priceInputRef = useRef<HTMLInputElement>(null);
  const [accessFlags, setAccessFlags] = useState(ACCESS_FLAGS.BUY);


  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
    reference?: string;
    price?: string;
    accessFlags?: string;
  }>({});
  
  // Success/failure state after submission
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Refresh registration status after successful developer registration
  useEffect(() => {
    if (registrationSuccess) {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }, [registrationSuccess]);

  // Handle wallet connection and registration check
  const handleWalletConnect = async () => {
    setIsConnectingWallet(true);
    setWalletConnectionMessage(null);
    
    try {
      await connectWallet();
      // The wallet connection will trigger a re-render and the registration check will happen automatically
      setWalletConnectionMessage('Wallet connected! Checking registration status...');
      
      // Give a moment for the registration check to complete
      setTimeout(() => {
        setWalletConnectionMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWalletConnectionMessage('Failed to connect wallet. Please try again.');
      setTimeout(() => {
        setWalletConnectionMessage(null);
      }, 3000);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Show message when wallet connects but user is not registered
  useEffect(() => {
    if (isConnected && needsRegistration && !checkingRegistration) {
      setWalletConnectionMessage("You're not registered as a developer. Please register first.");
      setTimeout(() => {
        setWalletConnectionMessage(null);
      }, 4000);
    }
  }, [isConnected, needsRegistration, checkingRegistration]);

  // Handle price input change with simple validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPriceUsdInput(value);
      
      if (validationErrors.price) {
        setValidationErrors(prev => ({ ...prev, price: undefined }));
      }
    }
  };
  
  // Handler for the Calculate STRK button
  const handleCalculateStrk = () => {
    if ((accessFlags & ACCESS_FLAGS.FREE) === 0 && priceUsdInput && parseFloat(priceUsdInput) > 0) {
      updateStrkEquivalent(priceUsdInput, priceFeedKey);
    }
  };

  // Handler for reference input changes
  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReference(value);
    
    if (isGitHubUrl(value)) {
      const parsed = parseGitHubUrl(value);
      if (parsed) {
        setIsGitHubRepository(true);
        setGitHubOwner(parsed.owner);
        setGitHubRepo(parsed.repo);
      }
    } else {
      setIsGitHubRepository(false);
      setGitHubOwner('');
      setGitHubRepo('');
    }
    
    if (validationErrors.reference) {
      setValidationErrors(prev => ({ ...prev, reference: undefined }));
    }
  };

  // Validate the entire form
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    
    if (!title.trim()) {
      errors.title = 'Component title is required';
    }
    
    if (!description.trim()) {
      errors.description = 'Component description is required';
    }
    
    // Validate reference based on upload method
    if (uploadMethod === 'folder') {
      if (!isUploaded || !uploadData?.cid) {
        errors.reference = 'Please upload a folder first';
      }
    } else {
      if (!reference.trim()) {
        errors.reference = 'Reference URL or IPFS CID is required';
      } else if (
        !reference.startsWith('ipfs://') && 
        !reference.startsWith('https://') && 
        !reference.startsWith('http://')
      ) {
        errors.reference = 'Reference must start with ipfs://, https://, or http://';
      }
    }
    
    // Price validation for non-free components
    if (!((accessFlags & ACCESS_FLAGS.FREE) !== 0)) {
      if (pricingModel === 'USD') {
        if (!priceUsdInput || parseFloat(priceUsdInput) <= 0) {
          errors.price = 'Price is required for non-free components';
        } else if (parseFloat(priceUsdInput) > 10000) {
          errors.price = 'Price cannot exceed $10,000';
        }
        
        if (!currentStrkEquivalent && priceUsdInput && parseFloat(priceUsdInput) > 0) {
          errors.price = 'Click "Calculate STRK" before submitting';
        }
      } else {
        if (!priceStrk || parseFloat(priceStrk) <= 0) {
          errors.price = 'STRK price is required for non-free components';
        } else if (parseFloat(priceStrk) > 1000000) {
          errors.price = 'STRK price cannot exceed 1,000,000';
        }
      }
    }
    
    if (accessFlags === 0) {
      errors.accessFlags = 'At least one access type must be selected';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmissionResult(null);
    
    if (needsRegistration) {
      setSubmissionResult({
        success: false,
        message: 'Please register as a developer before uploading components'
      });
      return;
    }
    
    if (checkingRegistration) {
      setSubmissionResult({
        success: false,
        message: 'Please wait while we verify your developer registration'
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    const finalPriceUsd = (accessFlags & ACCESS_FLAGS.FREE) !== 0 ? '0' : priceUsdInput;
    const finalPriceStrk = (accessFlags & ACCESS_FLAGS.FREE) !== 0 ? '0' : priceStrk;
    
          // Determine the reference based on upload method
    let componentReference = reference;
    
    if (uploadMethod === 'folder' && uploadData?.cid) {
      // Hash the CID to fit within felt252 constraints
      const hashedCid = await hashCidForFelt252(uploadData.cid);
      // Store the mapping for later retrieval
      storeCidMapping(hashedCid, uploadData.cid);
      // Also store in localStorage for the library to use
      localStorage.setItem(`cidMapping_${hashedCid}`, uploadData.cid);
      componentReference = hashedCid;
      
      console.log('CID hashing:', {
        originalCid: uploadData.cid,
        hashedCid: hashedCid,
        length: hashedCid.length
      });
    }
      
      const result = await registerComponent({
        title,
        reference: componentReference,
      priceUsdMicros: pricingModel === 'USD' ? finalPriceUsd : '0',
      priceStrk: pricingModel === 'STRK' ? finalPriceStrk : '0',
      priceFeedKey: pricingModel === 'USD' ? priceFeedKey : '',
      accessFlags
    });
    
    if (result.success) {
      // Store encryption keys in escrow after successful registration
      if (uploadMethod === 'folder' && uploadData && account) {
        try {
          await storeKeysInEscrow(result.componentId || 'unknown', account);
          console.log('Encryption keys stored in escrow for purchaser access');
        } catch (error) {
          console.error('Failed to store keys in escrow:', error);
          // Don't fail the whole process, but log the issue
        }
      }
      
      setSubmissionResult({
        success: true,
        message: 'Component successfully registered!'
      });
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } else {
      setSubmissionResult({
        success: false,
        message: result.error || 'Failed to register component'
      });
    }
  };

  // Determine if we should show STRK equivalent
  const shouldShowStrkEquivalent = (): boolean => {
    if ((accessFlags & ACCESS_FLAGS.FREE) !== 0) return false;
    if (!currentStrkEquivalent) return false;
    
    const strkValue = parseFloat(currentStrkEquivalent);
    if (isNaN(strkValue) || strkValue <= 0.0001) return false;
    
    return true;
  };

  // Main component render
  return (
    <Container maxW="4xl" py={8} position="relative">
      <VStack spacing={8} align="stretch">
        <HStack>
          <IconButton
            aria-label="Back to Home"
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            variant="ghost"
            size="lg"
          />
          <Heading color="white">Upload Component</Heading>
        </HStack>

        {/* Registration Required Overlay */}
        {needsRegistration && !checkingRegistration && (
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.75)"
            backdropFilter="blur(4px)"
            zIndex="1000"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <VStack spacing={6} textAlign="center" p={8}>
              {/* Icon */}
              <Box
                width="80px"
                height="80px"
                bg="rgba(216, 31, 42, 0.1)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid rgba(216, 31, 42, 0.3)"
              >
                <Box
                  width="40px"
                  height="40px"
                  backgroundImage={`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2C13.1046 2 14 2.89543 14 4V10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10V4C10 2.89543 10.8954 2 12 2Z' fill='%23D81F2A'/%3E%3Cpath d='M12 14C13.1046 14 14 14.8954 14 16V20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20V16C10 14.8954 10.8954 14 12 14Z' fill='%23D81F2A'/%3E%3Cpath d='M4 10C2.89543 10 2 10.8954 2 12C2 13.1046 2.89543 14 4 14H10C11.1046 14 12 13.1046 12 12C12 10.8954 11.1046 10 10 10H4Z' fill='%23D81F2A'/%3E%3Cpath d='M16 10C14.8954 10 14 10.8954 14 12C14 13.1046 14.8954 14 16 14H20C21.1046 14 22 13.1046 22 12C22 10.8954 21.1046 10 20 10H16Z' fill='%23D81F2A'/%3E%3C/svg%3E")`}
                  backgroundSize="contain"
                  backgroundPosition="center"
                  backgroundRepeat="no-repeat"
                />
              </Box>

              {/* Title */}
              <Heading size="lg" color="white" fontWeight="600">
                Developer Registration Required
              </Heading>

              {/* Description */}
              <Text color="gray.300" fontSize="lg" maxW="400px" lineHeight="1.6">
                You need to register as a developer before you can upload components to the StarkFlux marketplace.
              </Text>

              {/* Register Button */}
              <Button
                onClick={() => navigate('/register')}
                bg={colors.primary}
                color="white"
                size="lg"
                height="50px"
                px={8}
                borderRadius="8px"
                _hover={{ bg: colors.secondary }}
                _active={{ bg: colors.secondary }}
                fontWeight="600"
              >
                Register as Developer First
              </Button>

              {/* Wallet Connection Link */}
              <Text 
                color={isConnectingWallet ? "gray.400" : "blue.400"}
                fontSize="sm" 
                cursor={isConnectingWallet ? "default" : "pointer"}
                textDecoration={isConnectingWallet ? "none" : "underline"}
                _hover={isConnectingWallet ? {} : { color: "blue.300" }}
                onClick={isConnectingWallet ? undefined : handleWalletConnect}
              >
                {isConnectingWallet ? 'Connecting wallet...' : 'Or connect with your wallet if you\'re already registered'}
              </Text>

              {/* Wallet Connection Message */}
              {walletConnectionMessage && (
                <Text 
                  color={walletConnectionMessage.includes('not registered') ? "red.400" : 
                        walletConnectionMessage.includes('Failed') ? "red.400" : "green.400"} 
                  fontSize="sm"
                  textAlign="center"
                  bg={walletConnectionMessage.includes('not registered') ? "rgba(224, 49, 49, 0.1)" : 
                      walletConnectionMessage.includes('Failed') ? "rgba(224, 49, 49, 0.1)" : "rgba(21, 128, 61, 0.1)"}
                  border={walletConnectionMessage.includes('not registered') ? "1px solid rgba(224, 49, 49, 0.2)" : 
                          walletConnectionMessage.includes('Failed') ? "1px solid rgba(224, 49, 49, 0.2)" : "1px solid rgba(21, 128, 61, 0.2)"}
                  borderRadius="md"
                  p={3}
                >
                  {walletConnectionMessage}
                </Text>
              )}

              {/* Secondary text */}
              <Text color="gray.400" fontSize="sm">
                Registration is quick and free. Complete your developer profile to start sharing your components.
              </Text>
            </VStack>
          </Box>
        )}
      
      {/* Main Content - Disabled when registration required */}
      <Box 
        opacity={needsRegistration && !checkingRegistration ? 0.3 : 1}
        pointerEvents={needsRegistration && !checkingRegistration ? "none" : "auto"}
        transition="opacity 0.3s ease"
      >
        
        {/* Debug: Registry Configuration Check - REMOVED */}
        {/* {configError && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Registry Configuration Issue:</Text>
              <Text fontSize="sm">{configError}</Text>
              <Text fontSize="xs" mt={1}>This is likely why transactions are failing.</Text>
            </Box>
          </Alert>
        )} */}
        
        {submissionResult ? (
        <div style={{
          backgroundColor: submissionResult.success ? 'rgba(21, 128, 61, 0.1)' : 'rgba(224, 49, 49, 0.1)',
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center',
          marginTop: '40px',
          border: `1px solid ${submissionResult.success ? 'rgba(21, 128, 61, 0.2)' : 'rgba(224, 49, 49, 0.2)'}`,
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 20px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z' stroke='${submissionResult.success ? '%2315803D' : '%23E03131'}' stroke-width='1.5'/%3E%3Cpath d='M16 8.5L10.5 15.5L8 12.5' stroke='${submissionResult.success ? '%2315803D' : '%23E03131'}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M10.5 16L7 13L10.5 10' stroke='%23D81F2A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}></div>
          
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600',
            color: submissionResult.success ? colors.success : colors.error,
            marginBottom: '10px'
          }}>
            {submissionResult.success ? 'Success!' : 'Error'}
          </h3>
          
          <p style={{ 
            fontSize: '1rem',
            color: colors.textSecondary,
            marginBottom: '20px'
          }}>
            {submissionResult.message}
          </p>
          
          {submissionResult.success && (
            <p style={{ 
              fontSize: '0.9rem',
              color: colors.textSecondary,
            }}>
                Redirecting to home...
            </p>
          )}
        </div>
      ) : (
          <Card bg="gray.800" borderColor="gray.600">
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="white">Component Information</Heading>
                
                <FormControl isRequired isInvalid={!!validationErrors.title}>
                  <FormLabel color="gray.300">Component Title</FormLabel>
              <Input
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="Enter component title"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
              />
                <FormErrorMessage>{validationErrors.title}</FormErrorMessage>
            </FormControl>

                <FormControl isRequired isInvalid={!!validationErrors.description}>
                  <FormLabel color="gray.300">Component Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of your component, its functionality, features, and usage instructions."
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                minHeight="120px"
              />
                <FormErrorMessage>{validationErrors.description}</FormErrorMessage>
            </FormControl>

                <FormControl isRequired isInvalid={!!validationErrors.reference}>
                  <FormLabel color="gray.300">Component Upload Method</FormLabel>
              
              {/* Upload Method Selector */}
              <HStack spacing={4} mb={4}>
                <Button
                  size="sm"
                  variant={uploadMethod === 'folder' ? 'solid' : 'outline'}
                  colorScheme={uploadMethod === 'folder' ? 'blue' : 'gray'}
                  onClick={() => setUploadMethod('folder')}
                >
                  Upload Folder
                </Button>
                <Button
                  size="sm"
                  variant={uploadMethod === 'github' ? 'solid' : 'outline'}
                  colorScheme={uploadMethod === 'github' ? 'blue' : 'gray'}
                  onClick={() => setUploadMethod('github')}
                >
                  GitHub URL
                </Button>
              </HStack>
              
              {/* Conditional Upload Interface */}
              {uploadMethod === 'folder' ? (
                <Box>
                  <EncryptedUpload
                    onComplete={handleUploadComplete}
                    onError={handleUploadError}
                    maxSizeMB={200}
                    title={title}
                    description={description}
                    author={account?.address || ''}
                    tags={[]} // TODO: Add tags input field
                    category="Uncategorized" // TODO: Add category selector
                  />
                  {isUploaded && uploadData && (
                    <Box mt={3} p={3} bg="green.900" borderRadius="md">
                      <Text color="green.300" fontSize="sm">
                        ✅ Folder uploaded and encrypted successfully!
                      </Text>
                      <Text color="gray.300" fontSize="xs">
                        CID: {uploadData.cid}
                      </Text>
                      <Text color="gray.400" fontSize="xs" mt={1}>
                        🔐 Encrypted for secure marketplace distribution
                      </Text>
                    </Box>
                  )}
                  {uploadError && (
                    <Box mt={3} p={3} bg="red.900" borderRadius="md">
                      <Text color="red.300" fontSize="sm">
                        ❌ Upload failed: {uploadError}
                      </Text>
                    </Box>
                  )}
                </Box>
              ) : (
                <>
                  <Input
                    value={reference}
                    onChange={handleReferenceChange}
                    placeholder="ipfs://... or https://github.com/..."
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                  />
                  
                  {/* GitHub Repository Preview */}
                  {isGitHubRepository && gitHubOwner && gitHubRepo && (
                    <Box mt={3}>
                      <GitHubRepositoryPreview 
                        owner={gitHubOwner} 
                        repo={gitHubRepo} 
                      />
                    </Box>
                  )}
                </>
              )}
              
              <FormErrorMessage>{validationErrors.reference}</FormErrorMessage>
            </FormControl>

                <FormControl isRequired isInvalid={!!validationErrors.price}>
                  <FormLabel color="gray.300">Price</FormLabel>
              
              {/* Pricing Model Selector */}
              <Box mb={3}>
                <Flex>
                  <Button 
                    onClick={() => setPricingModel('USD')}
                    bg={pricingModel === 'USD' ? 'rgba(216, 31, 42, 0.1)' : 'transparent'}
                    color={pricingModel === 'USD' ? colors.textPrimary : colors.textSecondary}
                    borderColor={pricingModel === 'USD' ? 'rgba(216, 31, 42, 0.3)' : colors.inputBorder}
                    borderWidth="1px"
                    borderRadius="6px 0 0 6px"
                    flex="1"
                    isDisabled={(accessFlags & ACCESS_FLAGS.FREE) !== 0}
                    _hover={{ bg: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    USD Pricing (Oracle)
                  </Button>
                  <Button 
                    onClick={() => setPricingModel('STRK')}
                    bg={pricingModel === 'STRK' ? 'rgba(216, 31, 42, 0.1)' : 'transparent'}
                    color={pricingModel === 'STRK' ? colors.textPrimary : colors.textSecondary}
                    borderColor={pricingModel === 'STRK' ? 'rgba(216, 31, 42, 0.3)' : colors.inputBorder}
                    borderWidth="1px"
                    borderRadius="0 6px 6px 0"
                    flex="1"
                    isDisabled={(accessFlags & ACCESS_FLAGS.FREE) !== 0}
                    _hover={{ bg: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    STRK Pricing (Fixed)
                  </Button>
                </Flex>
              </Box>
              
                  {/* USD Price Input */}
              {pricingModel === 'USD' && (
                <>
                  <Flex alignItems="center" gap={3}>
                    <InputGroup flex="1">
                      <InputLeftElement pointerEvents="none" color={(accessFlags & ACCESS_FLAGS.FREE) !== 0 ? colors.inactive : colors.textSecondary}>
                        $
                      </InputLeftElement>
                      <Input
                        id="priceUsd"
                        type="text"
                        value={priceUsdInput}
                        onChange={handlePriceChange}
                        placeholder="0.00"
                        isDisabled={(accessFlags & ACCESS_FLAGS.FREE) !== 0}
                        ref={priceInputRef}
                        bg={colors.inputBg}
                        borderColor={validationErrors.price ? "red.500" : colors.inputBorder}
                        color={(accessFlags & ACCESS_FLAGS.FREE) !== 0 ? colors.inactive : colors.textPrimary}
                        _hover={{ borderColor: colors.primary }}
                        _focus={{ borderColor: colors.primary, boxShadow: `0 0 0 1px ${colors.primary}` }}
                      />
                    </InputGroup>
                    
                    <Button
                      onClick={handleCalculateStrk}
                      isDisabled={(accessFlags & ACCESS_FLAGS.FREE) !== 0 || !priceUsdInput || parseFloat(priceUsdInput) <= 0 || oracleLoading}
                      isLoading={oracleLoading}
                      loadingText="Calculating..."
                      bg={(accessFlags & ACCESS_FLAGS.FREE) !== 0 || !priceUsdInput || parseFloat(priceUsdInput) <= 0 ? 'rgba(13, 17, 27, 0.4)' : colors.bgSecondary}
                      color={(accessFlags & ACCESS_FLAGS.FREE) !== 0 || !priceUsdInput || parseFloat(priceUsdInput) <= 0 ? colors.inactive : colors.textPrimary}
                      borderColor={colors.inputBorder}
                      border="1px solid"
                      borderRadius="6px"
                      minWidth="135px"
                      height="42px"
                      _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      Calculate STRK
                    </Button>
                  </Flex>
                  
                  {shouldShowStrkEquivalent() && (
                    <Box
                      display="flex"
                      alignItems="center"
                      mt={2}
                      p={3}
                      bg="rgba(150, 21, 29, 0.05)"
                      borderRadius="md"
                      border="1px solid rgba(150, 21, 29, 0.1)"
                      mb={3}
                    >
                      <Box
                        width="18px"
                        height="18px"
                        mr={2}
                        backgroundImage={`url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13 9H7' stroke='%23D81F2A' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M22 12C22 16.714 22 19.071 20.535 20.535C19.071 22 16.714 22 12 22C7.286 22 4.929 22 3.464 20.535C2 19.071 2 16.714 2 12C2 7.286 2 4.929 3.464 3.464C4.929 2 7.286 2 12 2C16.714 2 19.071 2 20.535 3.464C21.5086 4.43755 21.8395 5.80891 21.9451 8' stroke='%23D81F2A' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M17 9C17 12.5 14.5 13 12.5 13H7' stroke='%23D81F2A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M10.5 16L7 13L10.5 10' stroke='%23D81F2A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`}
                        backgroundSize="contain"
                        backgroundPosition="center"
                        backgroundRepeat="no-repeat"
                      ></Box>
                      <Box display="flex" flexDirection="column">
                        <Flex alignItems="center" gap={1}>
                          <Text color={colors.textSecondary} fontSize="0.85rem">
                            Current equivalent: ~{currentStrkEquivalent ? Number(parseFloat(currentStrkEquivalent).toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'} STRK
                          </Text>
                          <Tooltip 
                            label="Provided by Pragma Oracle" 
                            placement="top"
                            bg="gray.700"
                            color="white"
                            fontSize="sm"
                            borderRadius="md"
                            px={2}
                            py={1}
                            hasArrow
                          >
                            <Box
                              as="span"
                              display="inline-flex"
                              alignItems="center"
                              justifyContent="center"
                              width="14px"
                              height="14px"
                              cursor="pointer"
                              opacity={0.7}
                              _hover={{ opacity: 1 }}
                              onClick={() => window.open('https://www.pragma.build/', '_blank')}
                              bg="gray.600"
                              borderRadius="full"
                              fontSize="10px"
                              color="white"
                              fontWeight="bold"
                            >
                              i
                            </Box>
                          </Tooltip>
                        </Flex>
                        {oracleLoading && (
                          <Text color={colors.inactive} fontSize="0.75rem">
                            Loading price data...
                          </Text>
                        )}
                        {oracleStale && (
                          <Text color={colors.warning} fontSize="0.75rem">
                            Warning: Using stale price data.
                          </Text>
                        )}
                        {isFallback && !oracleLoading && (
                          <Text color={colors.warning} fontSize="0.75rem">
                            Using fallback price conversion.
                          </Text>
                        )}
                      </Box>
                    </Box>
                  )}
                  
                  {(accessFlags & ACCESS_FLAGS.FREE) !== 0 && (
                    <Text color={colors.textSecondary} fontSize="0.8rem" mt={1} mb={4}>
                      Price is set to $0 for FREE components
                    </Text>
                  )}
                </>
              )}
              
                  {/* STRK Price Input */}
              {pricingModel === 'STRK' && (
                <InputGroup>
                  <Input
                    id="priceStrk"
                    type="text"
                    value={priceStrk}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setPriceStrk(value);
                        
                        if (validationErrors.price) {
                          setValidationErrors(prev => ({ ...prev, price: undefined }));
                        }
                      }
                    }}
                    placeholder="0.0"
                    isDisabled={(accessFlags & ACCESS_FLAGS.FREE) !== 0}
                    bg={colors.inputBg}
                    borderColor={validationErrors.price ? "red.500" : colors.inputBorder}
                    color={(accessFlags & ACCESS_FLAGS.FREE) !== 0 ? colors.inactive : colors.textPrimary}
                    _hover={{ borderColor: colors.primary }}
                    _focus={{ borderColor: colors.primary, boxShadow: `0 0 0 1px ${colors.primary}` }}
                  />
                </InputGroup>
              )}
            </FormControl>

                <FormControl isRequired isInvalid={!!validationErrors.accessFlags}>
                  <HStack justify="space-between" align="center" mb={3}>
                    <FormLabel color="gray.300" mb={0}>Access Type</FormLabel>

                  </HStack>
                              <Box>
                 <ComponentMonetizationSelector
                   accessFlags={accessFlags}
                   setAccessFlags={(newFlags) => setAccessFlags(newFlags)}
                   disabled={loading}
                 />
                </Box>
              {validationErrors.accessFlags && (
                <FormErrorMessage>{validationErrors.accessFlags}</FormErrorMessage>
              )}
            </FormControl>

            <Button
              type="submit"
              bg={needsRegistration || checkingRegistration ? colors.inactive : colors.primary}
              color="white"
              size="lg"
              width="100%"
              height="50px"
              borderRadius="8px"
              _hover={{ bg: needsRegistration || checkingRegistration ? colors.inactive : colors.secondary }}
              _active={{ bg: needsRegistration || checkingRegistration ? colors.inactive : colors.secondary }}
              isLoading={loading || checkingRegistration}
              loadingText={checkingRegistration ? "Checking registration..." : "Registering..."}
              isDisabled={needsRegistration || checkingRegistration || loading}
              onClick={handleSubmit}
              mb={6}
            >
              {needsRegistration ? "Register as Developer First" : "Register Component"}
            </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
        </Box>
      </VStack>
    </Container>
  );
};

export default UploadComponent;