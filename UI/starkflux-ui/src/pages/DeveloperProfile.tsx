import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import colors from '../utils/colors';
import { useRegisterDeveloper } from '../hooks/useRegisterDeveloper';
import { useDeveloperRegistration } from '../hooks/useDeveloperRegistration';
// import { useTransactionStatus } from '../hooks/useTransactionStatus';
import { useWallet } from '../components/wallet/WalletProvider';
import { useProfileSave } from '../hooks/useProfileSave';
import { CONTRACT_ADDRESSES } from '../abis';

import ProfilePictureUpload from '../components/ProfilePictureUpload';
import SkillsSelector from '../components/SkillsSelector';
import DeveloperSubscriptionSettings from '../components/DeveloperSubscriptionSettings';
import { 
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  IconButton,
  Box,
  Divider,
  Spinner,
  Grid,
  GridItem,
  Badge,
  InputGroup,
  InputLeftElement,
  FormErrorMessage,
  useToast,
  SimpleGrid,
  Tooltip
} from '@chakra-ui/react';
import { 
  ArrowBackIcon, 
  LinkIcon,
  AtSignIcon,
  CalendarIcon,
  CheckCircleIcon,
  InfoIcon
} from '@chakra-ui/icons';

interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  profilePicture: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  personalWebsite: string;
  location: string;
  yearsExperience: string;
  skills: string[];
  specialization: string;
  email: string;
}

/**
 * Developer Profile Page
 * Combines developer registration with comprehensive profile setup
 */
const DeveloperProfile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { account, isConnected } = useWallet();
  const { registerDeveloper, isRegistering, registrationError, registrationSuccess } = useRegisterDeveloper();

  const { needsRegistration, isLoading: checkingRegistration, developerId, isRegistered, refreshRegistrationStatus } = useDeveloperRegistration();
  
  // Profile save hook
  const { 
    saveProfile, 
    loadProfile, 
    cleanupGlobalDraft,
    isSaving, 
    saveError, 
    lastSaveResult 
  } = useProfileSave();
  
  // Transaction status tracking (unused for now)
  // const { 
  //   status: txStatus, 
  //   blockNumber
  // } = useTransactionStatus(txHash);
  
  // Profile form state
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    username: '',
    bio: '',
    profilePicture: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    personalWebsite: '',
    location: '',
    yearsExperience: '',
    skills: [],
    specialization: '',
    email: ''
  });

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<Partial<ProfileData>>({});
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  
  // Success/failure state after submission
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);



  // Handle successful registration
  useEffect(() => {
    if (registrationSuccess) {
      setSubmissionResult({
        success: true,
        message: 'Successfully registered as developer! Now complete your profile to get started.'
      });
      
      toast({
        title: "Registration Successful!",
        description: "Refreshing your registration status...",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Refresh registration status with retry mechanism
      const refreshWithRetry = async (attempts = 0) => {
        if (attempts >= 5) {
          console.log('Max refresh attempts reached');
          return;
        }

        await refreshRegistrationStatus();
        
        // Check if status updated after a short delay
        setTimeout(() => {
          if (needsRegistration && attempts < 4) {
            console.log(`Registration status not updated yet, retrying... (attempt ${attempts + 1})`);
            refreshWithRetry(attempts + 1);
          }
        }, 1000);
      };

      // Start the refresh process after a short delay
      setTimeout(() => {
        refreshWithRetry();
      }, 2000);
    }
  }, [registrationSuccess, toast, refreshRegistrationStatus, needsRegistration]);

  // Handle registration error
  useEffect(() => {
    if (registrationError) {
      setSubmissionResult({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  }, [registrationError]);

  // One-time cleanup of old global draft data
  useEffect(() => {
    cleanupGlobalDraft();
  }, [cleanupGlobalDraft]);

  // Load saved profile data when wallet connects, clear when disconnects
  useEffect(() => {
    if (!isConnected || !account) {
      // Clear profile data when wallet disconnects
      setProfileData({
        displayName: '',
        username: '',
        bio: '',
        profilePicture: '',
        githubUrl: '',
        linkedinUrl: '',
        twitterUrl: '',
        personalWebsite: '',
        location: '',
        yearsExperience: '',
        skills: [],
        specialization: '',
        email: ''
      });
      return;
    }

    // Only load profile data when wallet is connected
    const savedProfile = loadProfile();
    if (savedProfile) {
      setProfileData(savedProfile);
    } else {
      // Fallback to wallet-specific draft if no saved profile exists
      const deploymentId = `${CONTRACT_ADDRESSES.IDENTITY_REGISTRY.slice(0, 10)}_${CONTRACT_ADDRESSES.COMPONENT_REGISTRY.slice(0, 10)}`;
      const draftKey = `starkflux_${deploymentId}-profile-draft-${account.address}`;
      const draftProfile = localStorage.getItem(draftKey);
      if (draftProfile) {
        try {
          const parsed = JSON.parse(draftProfile);
          setProfileData(parsed);
        } catch (error) {
          console.error('Failed to load draft profile:', error);
        }
      }
    }
  }, [account, isConnected]); // Removed loadProfile from dependencies

  // Save profile data to wallet-specific localStorage on changes
  useEffect(() => {
    // Only save drafts when wallet is connected and profile has some data
    if (!isConnected || !account || !profileData.displayName && !profileData.username && !profileData.bio) {
      return;
    }

    const timeoutId = setTimeout(() => {
      // Use deployment-specific draft key
      const deploymentId = `${CONTRACT_ADDRESSES.IDENTITY_REGISTRY.slice(0, 10)}_${CONTRACT_ADDRESSES.COMPONENT_REGISTRY.slice(0, 10)}`;
      const draftKey = `starkflux_${deploymentId}-profile-draft-${account.address}`;
      localStorage.setItem(draftKey, JSON.stringify(profileData));
    }, 1000); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [profileData, account, isConnected]);

  // Check if profile is complete
  useEffect(() => {
    const requiredFields = ['displayName', 'username', 'bio'];
    const isComplete = requiredFields.every(field => 
      profileData[field as keyof ProfileData].toString().trim().length > 0
    );
    setIsProfileComplete(isComplete);
  }, [profileData]);

  const handleRegister = async () => {
    if (!isConnected || !account) {
      setSubmissionResult({
        success: false,
        message: 'Please connect your wallet first'
      });
      return;
    }

    if (!needsRegistration) {
      setSubmissionResult({
        success: false,
        message: 'You are already registered as a developer'
      });
      return;
    }
    
    setSubmissionResult(null);
    
    try {
      const result = await registerDeveloper();
      
      if (result.success) {
        // Wait a moment for the transaction to be processed, then refresh status
        setTimeout(async () => {
          await refreshRegistrationStatus();
        }, 2000);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setSubmissionResult({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  };

  // Handle profile data changes
  const handleProfileChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validate profile data
  const validateProfile = (): boolean => {
    const errors: Partial<ProfileData> = {};

    if (!profileData.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }

    if (!profileData.username.trim()) {
      errors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(profileData.username)) {
      errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    if (!profileData.bio.trim()) {
      errors.bio = 'Bio is required';
    } else if (profileData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less';
    }

         // Validate URLs if provided
     const urlFields: (keyof ProfileData)[] = ['githubUrl', 'linkedinUrl', 'twitterUrl', 'personalWebsite'];
     urlFields.forEach(field => {
       const url = profileData[field] as string;
       if (url && !isValidUrl(url)) {
         (errors as any)[field] = 'Please enter a valid URL';
       }
     });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in your profile.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await saveProfile(profileData);
      
      if (result.success) {
        toast({
          title: "Profile Saved!",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Save Failed",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };





  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack>
          <IconButton
            aria-label="Back to Home"
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            variant="ghost"
            size="lg"
          />
          <Heading color="white">Developer Profile</Heading>
        </HStack>

        {/* Registration Status Messages */}
        {submissionResult && (
          <Alert 
            status={submissionResult.success ? "success" : "error"} 
            bg={submissionResult.success ? "rgba(21, 128, 61, 0.1)" : "rgba(224, 49, 49, 0.1)"} 
            border={`1px solid ${submissionResult.success ? "rgba(21, 128, 61, 0.2)" : "rgba(224, 49, 49, 0.2)"}`}
          >
            <AlertIcon color={submissionResult.success ? "green.400" : "red.400"} />
            <VStack align="start" spacing={1}>
              <Text color={submissionResult.success ? "green.400" : "red.400"} fontSize="sm">
                {submissionResult.message}
              </Text>
            </VStack>
          </Alert>
        )}

        <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8}>
          {/* Profile Preview Column */}
          <GridItem>
            <Card bg="rgba(255, 255, 255, 0.02)" borderColor="rgba(255, 255, 255, 0.1)" position="sticky" top="8">
              <CardBody>
                                 <VStack spacing={6} align="center">
                   <VStack spacing={4} align="center">
                     <ProfilePictureUpload
                       currentImage={profileData.profilePicture}
                       onImageChange={(imageUrl) => handleProfileChange('profilePicture', imageUrl)}
                       displayName={profileData.displayName}
                       username={profileData.username}
                     />
                     <VStack spacing={1} align="center">
                      <Heading size="md" color="white" textAlign="center">
                        {profileData.displayName || 'Your Name'}
                      </Heading>
                      <Text color="gray.400" fontSize="sm">
                        @{profileData.username || 'username'}
                      </Text>
                      {isRegistered && (
                        <Badge colorScheme="green" variant="subtle" fontSize="xs">
                          Developer ID: {developerId}
                        </Badge>
                      )}
                    </VStack>
                  </VStack>

                  {profileData.bio && (
                    <Text color="gray.300" fontSize="sm" textAlign="center" lineHeight="1.5">
                      {profileData.bio}
                    </Text>
                  )}

                  {/* Registration Status Section */}
                  <Box w="full" p={3} bg={isRegistered ? "rgba(21, 128, 61, 0.1)" : "rgba(255, 165, 0, 0.1)"} 
                       borderRadius="md" border={`1px solid ${isRegistered ? "rgba(21, 128, 61, 0.2)" : "rgba(255, 165, 0, 0.2)"}`}>
                    <VStack spacing={2}>
                      <HStack justify="center" w="full">
                        {isRegistered ? (
                          <Tooltip 
                            label="Your wallet address is verified on-chain as a registered developer. This confirms your account has been successfully registered in the StarkFlux Developer Registry smart contract."
                            placement="top"
                            hasArrow
                            bg="gray.700"
                            color="white"
                            fontSize="sm"
                            p={3}
                            borderRadius="md"
                          >
                            <HStack cursor="help">
                              <CheckCircleIcon color="green.400" boxSize={4} />
                              <Text color="green.400" fontSize="sm" fontWeight="500">
                                Developer Verified
                              </Text>
                              <InfoIcon color="green.300" boxSize={3} />
                            </HStack>
                          </Tooltip>
                        ) : (
                          <HStack>
                            <Text color="orange.400" fontSize="sm" fontWeight="500">
                              Registration Required
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                      
                      {!isRegistered && (
                        <VStack spacing={2} w="full">
                                                {checkingRegistration ? (
                        <HStack>
                          <Spinner size="sm" color="orange.400" />
                          <Text color="gray.400" fontSize="xs">Checking status...</Text>
                        </HStack>
                      ) : (
                        <VStack spacing={2} w="full">
                          <Button
                            onClick={handleRegister}
                            isDisabled={!isConnected || isRegistering || !needsRegistration}
                            isLoading={isRegistering}
                            loadingText="Registering..."
                            bg={isConnected && needsRegistration ? colors.primary : "gray.600"}
                            color={isConnected && needsRegistration ? "white" : "gray.400"}
                            size="sm"
                            width="100%"
                            _hover={{ 
                              bg: isConnected && needsRegistration ? colors.secondary : "gray.600" 
                            }}
                          >
                            {!isConnected ? 'Connect Wallet' : 
                             needsRegistration ? 'Register Now' :
                             'Already Registered'}
                          </Button>
                          
                          {registrationSuccess && needsRegistration && (
                            <Button
                              onClick={refreshRegistrationStatus}
                              size="xs"
                              variant="ghost"
                              color="blue.400"
                              _hover={{ bg: "blue.900" }}
                            >
                              Refresh Status
                            </Button>
                          )}
                        </VStack>
                      )}
                        </VStack>
                      )}
                    </VStack>
                  </Box>

                  {/* Profile Stats */}
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <VStack spacing={1}>
                      <Text color="white" fontWeight="600" fontSize="lg">
                        {profileData.yearsExperience || '0'}
                      </Text>
                      <Text color="gray.400" fontSize="xs" textAlign="center">
                        Years Experience
                      </Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text color="white" fontWeight="600" fontSize="lg">
                        {profileData.skills.length}
                      </Text>
                      <Text color="gray.400" fontSize="xs" textAlign="center">
                        Skills
                      </Text>
                    </VStack>
                  </SimpleGrid>

                  {/* Skills Preview */}
                  {profileData.skills.length > 0 && (
                    <VStack spacing={2} w="full">
                      <Text color="gray.400" fontSize="xs" fontWeight="500">
                        SKILLS
                      </Text>
                      <Box w="full">
                        {profileData.skills.slice(0, 6).map((skill) => (
                          <Badge
                            key={skill}
                            mr={1}
                            mb={1}
                            px={2}
                            py={1}
                            bg="blue.500"
                            color="white"
                            fontSize="2xs"
                            borderRadius="full"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {profileData.skills.length > 6 && (
                          <Badge
                            mr={1}
                            mb={1}
                            px={2}
                            py={1}
                            bg="gray.600"
                            color="gray.300"
                            fontSize="2xs"
                            borderRadius="full"
                          >
                            +{profileData.skills.length - 6} more
                          </Badge>
                        )}
                      </Box>
                    </VStack>
                  )}

                  {/* Social Links Preview */}
                  {(profileData.githubUrl || profileData.linkedinUrl || profileData.twitterUrl || profileData.personalWebsite) && (
                    <VStack spacing={2} w="full">
                      <Text color="gray.400" fontSize="xs" fontWeight="500">
                        LINKS
                      </Text>
                      <VStack spacing={1} w="full">
                        {profileData.githubUrl && (
                          <HStack w="full" color="gray.300" fontSize="sm">
                            <LinkIcon boxSize={3} />
                            <Text>GitHub</Text>
                          </HStack>
                        )}
                        {profileData.linkedinUrl && (
                          <HStack w="full" color="gray.300" fontSize="sm">
                            <LinkIcon boxSize={3} />
                            <Text>LinkedIn</Text>
                          </HStack>
                        )}
                        {profileData.twitterUrl && (
                          <HStack w="full" color="gray.300" fontSize="sm">
                            <LinkIcon boxSize={3} />
                            <Text>Twitter</Text>
                          </HStack>
                        )}
                        {profileData.personalWebsite && (
                          <HStack w="full" color="gray.300" fontSize="sm">
                            <LinkIcon boxSize={3} />
                            <Text>Website</Text>
                          </HStack>
                        )}
                      </VStack>
                    </VStack>
                  )}

                  {/* Profile Completion */}
                  <Box w="full" p={3} bg="rgba(66, 153, 225, 0.1)" borderRadius="md" border="1px solid rgba(66, 153, 225, 0.2)">
                    <VStack spacing={2}>
                      <HStack justify="space-between" w="full">
                        <Text color="blue.300" fontSize="xs" fontWeight="500">
                          Profile Completion
                        </Text>
                        <Text color="blue.300" fontSize="xs">
                          {Math.round((Object.values(profileData).filter(v => 
                            Array.isArray(v) ? v.length > 0 : v.toString().trim().length > 0
                          ).length / Object.keys(profileData).length) * 100)}%
                        </Text>
                      </HStack>
                      <Box w="full" h="2" bg="rgba(66, 153, 225, 0.2)" borderRadius="full">
                        <Box 
                          h="full" 
                          bg="linear-gradient(90deg, #667eea 0%, #764ba2 100%)" 
                          borderRadius="full"
                          width={`${Math.round((Object.values(profileData).filter(v => 
                            Array.isArray(v) ? v.length > 0 : v.toString().trim().length > 0
                          ).length / Object.keys(profileData).length) * 100)}%`}
                          transition="width 0.3s ease"
                        />
                      </Box>
                    </VStack>
                  </Box>

                  {/* Developer Subscription Settings */}
                  {isRegistered && (
                    <Box w="full">
                      <DeveloperSubscriptionSettings
                        isRegistered={!!isRegistered}
                        developerId={developerId || undefined}
                      />
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Profile Form Column */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Registration Section */}
              {!isRegistered && (
                <Card bg="gray.800" borderColor="gray.600">
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <VStack spacing={2} align="start">
                        <Heading size="md" color="white">Step 1: Developer Registration</Heading>
                        <Text color="gray.400" fontSize="sm">
                          First, register your wallet address as a developer on the StarkFlux platform.
                        </Text>
                      </VStack>
                      
                      {/* Registration Status Check */}
                      {checkingRegistration ? (
                        <HStack>
                          <Spinner size="sm" color={colors.primary} />
                          <Text color="gray.400">Checking registration status...</Text>
                        </HStack>
                      ) : (
                        <VStack spacing={3} w="full">
                          <Button
                            onClick={handleRegister}
                            isDisabled={!isConnected || isRegistering || !needsRegistration}
                            isLoading={isRegistering}
                            loadingText="Registering..."
                            bg={isConnected && needsRegistration ? colors.primary : "gray.600"}
                            color={isConnected && needsRegistration ? "white" : "gray.400"}
                            size="lg"
                            width="100%"
                            height="50px"
                            _hover={{ 
                              bg: isConnected && needsRegistration ? colors.secondary : "gray.600" 
                            }}
                          >
                            {!isConnected ? 'Connect Wallet First' : 
                             needsRegistration ? 'Register as Developer' :
                             'Already Registered'}
                          </Button>
                          
                          {registrationSuccess && needsRegistration && (
                            <Button
                              onClick={refreshRegistrationStatus}
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              width="100%"
                            >
                              Refresh Registration Status
                            </Button>
                          )}
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Profile Form Section */}
              <Card bg="gray.800" borderColor="gray.600">
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={2} align="start">
                      <Heading size="md" color="white">
                        {isRegistered ? 'Developer Profile' : 'Step 2: Complete Your Profile'}
                      </Heading>
                      <Text color="gray.400" fontSize="sm">
                        {isRegistered 
                          ? 'Manage your developer profile and showcase your skills.'
                          : 'Complete your profile after registration to start uploading components.'
                        }
                      </Text>
                    </VStack>

                                         <VStack spacing={6} align="stretch">
                       {/* Basic Information */}
                       <Box>
                         <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
                           Basic Information
                         </Text>
                         <VStack spacing={4}>
                          <FormControl isRequired isInvalid={!!validationErrors.displayName}>
                            <FormLabel color="gray.300">Display Name</FormLabel>
                            <Input
                              value={profileData.displayName}
                              onChange={(e) => handleProfileChange('displayName', e.target.value)}
                              placeholder="Your full name"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _placeholder={{ color: 'gray.400' }}
                            />
                            <FormErrorMessage>{validationErrors.displayName}</FormErrorMessage>
                          </FormControl>

                          <FormControl isRequired isInvalid={!!validationErrors.username}>
                            <FormLabel color="gray.300">Username</FormLabel>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none">
                                <AtSignIcon color="gray.400" />
                              </InputLeftElement>
                              <Input
                                value={profileData.username}
                                onChange={(e) => handleProfileChange('username', e.target.value.toLowerCase())}
                                placeholder="unique-username"
                                bg="gray.700"
                                borderColor="gray.600"
                                color="white"
                                _placeholder={{ color: 'gray.400' }}
                              />
                            </InputGroup>
                            <FormErrorMessage>{validationErrors.username}</FormErrorMessage>
                          </FormControl>

                          <FormControl isRequired isInvalid={!!validationErrors.bio}>
                            <FormLabel color="gray.300">Bio</FormLabel>
                            <Textarea
                              value={profileData.bio}
                              onChange={(e) => handleProfileChange('bio', e.target.value)}
                              placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _placeholder={{ color: 'gray.400' }}
                              minHeight="100px"
                              resize="vertical"
                            />
                            <HStack justify="space-between" mt={1}>
                              <FormErrorMessage>{validationErrors.bio}</FormErrorMessage>
                              <Text color="gray.500" fontSize="xs">
                                {profileData.bio.length}/500
                              </Text>
                            </HStack>
                          </FormControl>
                        </VStack>
                      </Box>

                      <Divider borderColor="gray.600" />

                      {/* Contact & Links */}
                      <Box>
                        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
                          Contact & Links
                        </Text>
                        <VStack spacing={4}>
                          <FormControl isInvalid={!!validationErrors.githubUrl}>
                            <FormLabel color="gray.300">GitHub URL</FormLabel>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none">
                                <LinkIcon color="gray.400" />
                              </InputLeftElement>
                              <Input
                                value={profileData.githubUrl}
                                onChange={(e) => handleProfileChange('githubUrl', e.target.value)}
                                placeholder="https://github.com/yourusername"
                                bg="gray.700"
                                borderColor="gray.600"
                                color="white"
                                _placeholder={{ color: 'gray.400' }}
                              />
                            </InputGroup>
                            <FormErrorMessage>{validationErrors.githubUrl}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!validationErrors.linkedinUrl}>
                            <FormLabel color="gray.300">LinkedIn URL</FormLabel>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none">
                                <LinkIcon color="gray.400" />
                              </InputLeftElement>
                              <Input
                                value={profileData.linkedinUrl}
                                onChange={(e) => handleProfileChange('linkedinUrl', e.target.value)}
                                placeholder="https://linkedin.com/in/yourusername"
                                bg="gray.700"
                                borderColor="gray.600"
                                color="white"
                                _placeholder={{ color: 'gray.400' }}
                              />
                            </InputGroup>
                            <FormErrorMessage>{validationErrors.linkedinUrl}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!validationErrors.twitterUrl}>
                            <FormLabel color="gray.300">Twitter/X URL</FormLabel>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none">
                                <LinkIcon color="gray.400" />
                              </InputLeftElement>
                              <Input
                                value={profileData.twitterUrl}
                                onChange={(e) => handleProfileChange('twitterUrl', e.target.value)}
                                placeholder="https://twitter.com/yourusername"
                                bg="gray.700"
                                borderColor="gray.600"
                                color="white"
                                _placeholder={{ color: 'gray.400' }}
                              />
                            </InputGroup>
                            <FormErrorMessage>{validationErrors.twitterUrl}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!validationErrors.personalWebsite}>
                            <FormLabel color="gray.300">Personal Website</FormLabel>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none">
                                <LinkIcon color="gray.400" />
                              </InputLeftElement>
                              <Input
                                value={profileData.personalWebsite}
                                onChange={(e) => handleProfileChange('personalWebsite', e.target.value)}
                                placeholder="https://yourwebsite.com"
                                bg="gray.700"
                                borderColor="gray.600"
                                color="white"
                                _placeholder={{ color: 'gray.400' }}
                              />
                            </InputGroup>
                            <FormErrorMessage>{validationErrors.personalWebsite}</FormErrorMessage>
                          </FormControl>
                        </VStack>
                      </Box>

                      <Divider borderColor="gray.600" />

                      {/* Professional Information */}
                      <Box>
                        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
                          Professional Information
                        </Text>
                        <VStack spacing={4}>
                          <FormControl>
                            <FormLabel color="gray.300">Location</FormLabel>
                            <Input
                              value={profileData.location}
                              onChange={(e) => handleProfileChange('location', e.target.value)}
                              placeholder="City, Country"
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _placeholder={{ color: 'gray.400' }}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel color="gray.300">Years of Experience</FormLabel>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none">
                                <CalendarIcon color="gray.400" />
                              </InputLeftElement>
                              <Input
                                value={profileData.yearsExperience}
                                onChange={(e) => handleProfileChange('yearsExperience', e.target.value)}
                                placeholder="5"
                                type="number"
                                min="0"
                                max="50"
                                bg="gray.700"
                                borderColor="gray.600"
                                color="white"
                                _placeholder={{ color: 'gray.400' }}
                              />
                            </InputGroup>
                          </FormControl>

                          <FormControl>
                            <FormLabel color="gray.300">Specialization</FormLabel>
                            <Input
                              value={profileData.specialization}
                              onChange={(e) => handleProfileChange('specialization', e.target.value)}
                              placeholder="Frontend Developer, Smart Contract Developer, etc."
                              bg="gray.700"
                              borderColor="gray.600"
                              color="white"
                              _placeholder={{ color: 'gray.400' }}
                            />
                          </FormControl>

                          {/* Skills Selector */}
                          <SkillsSelector
                            skills={profileData.skills}
                            onSkillsChange={(skills) => handleProfileChange('skills', skills)}
                            maxSkills={15}
                            placeholder="Add your skills and technologies..."
                          />
                        </VStack>
                      </Box>

                      {/* Save Status */}
                      {(lastSaveResult || saveError) && (
                        <Alert 
                          status={lastSaveResult?.success ? "success" : "error"} 
                          bg={lastSaveResult?.success ? "rgba(21, 128, 61, 0.1)" : "rgba(224, 49, 49, 0.1)"} 
                          border={`1px solid ${lastSaveResult?.success ? "rgba(21, 128, 61, 0.2)" : "rgba(224, 49, 49, 0.2)"}`}
                          borderRadius="md"
                        >
                          <AlertIcon color={lastSaveResult?.success ? "green.400" : "red.400"} />
                          <Text color={lastSaveResult?.success ? "green.400" : "red.400"} fontSize="sm">
                            {lastSaveResult?.message || saveError}
                          </Text>
                        </Alert>
                      )}

                      {/* Save Profile Button */}
                      <Button
                        onClick={handleSaveProfile}
                        isDisabled={!isRegistered || !isProfileComplete}
                        isLoading={isSaving}
                        loadingText="Saving Profile..."
                        bg={isRegistered && isProfileComplete ? colors.primary : "gray.600"}
                        color={isRegistered && isProfileComplete ? "white" : "gray.400"}
                        size="lg"
                        width="100%"
                        height="50px"
                        _hover={{ 
                          bg: isRegistered && isProfileComplete ? colors.secondary : "gray.600" 
                        }}
                      >
                        {!isRegistered ? 'Complete Registration First' : 
                         !isProfileComplete ? 'Complete Required Fields' :
                         isSaving ? 'Saving...' :
                         'Save Profile'}
                      </Button>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>


      </VStack>
    </Container>
  );
};

export default DeveloperProfile; 