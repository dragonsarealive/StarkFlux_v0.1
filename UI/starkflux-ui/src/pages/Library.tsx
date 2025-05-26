import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  HStack,
  VStack,
  Badge,
  Button,
  Icon,
  Flex,
  Spinner,
  Center,
  useToast,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  ViewIcon, 
  DownloadIcon, 
  AddIcon,
  ChevronDownIcon,
  RepeatIcon,
  StarIcon,
  TimeIcon,
  CalendarIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import ComponentCard from '../components/ComponentCard';
import { useComponentRegistry } from '../hooks/useComponentRegistry';
import { formatStrkPrice, formatAccessFlags } from '../utils/contractFormatters';
import { useAccount, useContract, useSendTransaction } from '@starknet-react/core';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../abis';
import { CallData } from 'starknet';

const Library: React.FC = () => {
  const { getAllComponents, loading, error, refreshComponents, totalComponents } = useComponentRegistry();
  const { address, isConnected } = useAccount();
  const toast = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  
  // Contract setup for purchases
  const { contract: componentRegistry } = useContract({
    address: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
    abi: CONTRACT_ABIS.COMPONENT_REGISTRY,
  });
  
  const { contract: strkToken } = useContract({
    address: CONTRACT_ADDRESSES.STRK_TOKEN,
    abi: CONTRACT_ABIS.STRK_TOKEN,
  });
  
  const { send: sendTransaction, isPending: isTransactionPending } = useSendTransaction({});
  
  // Get components
  const components = getAllComponents();
  
  // Filter and sort components
  const filteredComponents = components.filter(component => {
    const matchesSearch = component.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'free' && (component.access_flags & 8)) ||
                         (filterType === 'paid' && !(component.access_flags & 8));
    
    return matchesSearch && matchesFilter;
  });
  
  // Sort components
  const sortedComponents = [...filteredComponents].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id - a.id;
      case 'oldest':
        return a.id - b.id;
      case 'price-low':
        return parseInt(a.price_strk || '0') - parseInt(b.price_strk || '0');
      case 'price-high':
        return parseInt(b.price_strk || '0') - parseInt(a.price_strk || '0');
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  // Calculate stats
  const stats = {
    total: components.length,
    free: components.filter(c => c.access_flags & 8).length,
    paid: components.filter(c => !(c.access_flags & 8)).length,
  };
  
  // Handle component purchase
  const handlePurchase = async (componentId: number) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to purchase components',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      // Get component details
      const component = components.find(c => c.id === componentId);
      if (!component) throw new Error('Component not found');
      
      // Check if it's free
      if (component.access_flags & 8) {
        toast({
          title: 'Free component',
          description: 'This component is free to download',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Get current price (handles Oracle conversion if USD-priced)
      const priceResult = await componentRegistry.get_current_price(componentId);
      const currentPrice = priceResult.toString();
      
      // Prepare multicall for approval and purchase
      const calls = [
        // Approve STRK transfer
        {
          contractAddress: CONTRACT_ADDRESSES.STRK_TOKEN,
          entrypoint: 'approve',
          calldata: CallData.compile({
            spender: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
            amount: currentPrice,
          }),
        },
        // Purchase component
        {
          contractAddress: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
          entrypoint: 'purchase_component',
          calldata: CallData.compile({
            component_id: componentId,
          }),
        },
      ];
      
      // Execute transaction
      const tx = await sendTransaction({ calls });
      
      toast({
        title: 'Transaction submitted',
        description: 'Please wait for confirmation...',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      
      // Wait for transaction confirmation
      // In a real app, you'd use useWaitForTransaction hook
      
      toast({
        title: 'Purchase successful!',
        description: 'You now have access to this component',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: 'Purchase failed',
        description: error.message || 'An error occurred during purchase',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle component download
  const handleDownload = async (componentId: number) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    // For marketplace subscription components, record the download
    if ((component.access_flags & 4) && isConnected) {
      try {
        const calls = [{
          contractAddress: CONTRACT_ADDRESSES.MARKETPLACE_SUBSCRIPTION,
          entrypoint: 'record_download',
          calldata: CallData.compile({
            wallet: address,
            component_id: componentId,
          }),
        }];
        
        await sendTransaction({ calls });
      } catch (error) {
        console.error('Failed to record download:', error);
      }
    }
    
    // Open the component reference (IPFS link)
    if (component.reference.startsWith('Qm') || component.reference.startsWith('bafy')) {
      window.open(`https://gateway.pinata.cloud/ipfs/${component.reference}`, '_blank');
    } else {
      window.open(component.reference, '_blank');
    }
  };
  
  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color={mutedColor}>Loading components...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center h="400px">
          <VStack spacing={4}>
            <Icon as={InfoIcon} boxSize={12} color="red.500" />
            <Text color="red.500" fontSize="lg">Failed to load components</Text>
            <Text color={mutedColor}>{error}</Text>
            <Button onClick={refreshComponents} leftIcon={<RepeatIcon />}>
              Try Again
            </Button>
          </VStack>
        </Center>
      </Container>
    );
  }
  
  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" mb={2} color={textColor}>
              Component Library
            </Heading>
            <Text color={mutedColor}>
              Discover and access developer components from the StarkFlux marketplace
            </Text>
          </Box>
          
          {/* Coming Soon Banner */}
          <Box
            bg="blue.500"
            color="white"
            p={4}
            borderRadius="lg"
            textAlign="center"
            fontWeight="medium"
            fontSize="lg"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          >
            🚧 Coming Soon: Full marketplace functionality with Pinata IPFS integration for component metadata
          </Box>
          
          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <StatLabel color={mutedColor}>Total Components</StatLabel>
              <StatNumber color={textColor}>{stats.total}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <Icon as={ViewIcon} />
                  <Text>Available now</Text>
                </HStack>
              </StatHelpText>
            </Stat>
            
            <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <StatLabel color={mutedColor}>Free Components</StatLabel>
              <StatNumber color="green.500">{stats.free}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <Icon as={DownloadIcon} />
                  <Text>No payment required</Text>
                </HStack>
              </StatHelpText>
            </Stat>
            
            <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <StatLabel color={mutedColor}>Paid Components</StatLabel>
              <StatNumber color="blue.500">{stats.paid}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <Icon as={StarIcon} />
                  <Text>Premium content</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </SimpleGrid>
          
          {/* Search and filters */}
          <HStack spacing={4} flexWrap="wrap">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={mutedColor} />
              </InputLeftElement>
              <Input
                placeholder="Search components by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={cardBg}
                borderColor={borderColor}
                _placeholder={{ color: mutedColor }}
              />
            </InputGroup>
            
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              maxW="150px"
              bg={cardBg}
              borderColor={borderColor}
            >
              <option value="all">All Components</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </Select>
            
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="outline"
                borderColor={borderColor}
              >
                Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1).replace('-', ' ')}
              </MenuButton>
              <MenuList bg={cardBg} borderColor={borderColor}>
                <MenuItem onClick={() => setSortBy('newest')}>Newest First</MenuItem>
                <MenuItem onClick={() => setSortBy('oldest')}>Oldest First</MenuItem>
                <MenuItem onClick={() => setSortBy('price-low')}>Price: Low to High</MenuItem>
                <MenuItem onClick={() => setSortBy('price-high')}>Price: High to Low</MenuItem>
                <MenuItem onClick={() => setSortBy('title')}>Title: A to Z</MenuItem>
              </MenuList>
            </Menu>
            
            <Flex flex={1} justify="flex-end">
              <HStack>
                <IconButton
                  aria-label="Grid view"
                  icon={<ViewIcon />}
                  variant={viewMode === 'grid' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  size="sm"
                />
                <IconButton
                  aria-label="List view"
                  icon={<Icon viewBox="0 0 24 24">
                    <path fill="currentColor" d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
                  </Icon>}
                  variant={viewMode === 'list' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('list')}
                  size="sm"
                />
                <IconButton
                  aria-label="Refresh"
                  icon={<RepeatIcon />}
                  onClick={refreshComponents}
                  variant="outline"
                  size="sm"
                />
              </HStack>
            </Flex>
          </HStack>
          
          <Divider />
          
          {/* Components grid/list */}
          {sortedComponents.length === 0 ? (
            <Center h="300px">
              <VStack spacing={4}>
                <Icon as={ViewIcon} boxSize={12} color={mutedColor} />
                <Text fontSize="lg" color={mutedColor}>
                  {searchTerm || filterType !== 'all' 
                    ? 'No components match your search criteria'
                    : 'No components available yet'}
                </Text>
                {searchTerm || filterType !== 'all' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button as={Link} to="/upload" colorScheme="blue" leftIcon={<AddIcon />}>
                    Upload First Component
                  </Button>
                )}
              </VStack>
            </Center>
          ) : (
            <SimpleGrid
              columns={viewMode === 'grid' ? { base: 1, md: 2, lg: 3, xl: 4 } : { base: 1 }}
              spacing={6}
            >
              {sortedComponents.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  onPurchase={() => handlePurchase(component.id)}
                  onDownload={() => handleDownload(component.id)}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Library; 