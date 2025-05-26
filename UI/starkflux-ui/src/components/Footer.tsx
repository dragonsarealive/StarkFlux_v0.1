import React from 'react';
import { Box, Container, Text, HStack, Link, useColorModeValue } from '@chakra-ui/react';

const Footer: React.FC = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      as="footer"
      borderTop="1px solid"
      borderColor={borderColor}
      mt="auto"
      py={4}
    >
      <Container maxW="container.xl">
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" color={textColor}>
            © 2025 StarkFlux
          </Text>
          <HStack spacing={4}>
            <Link
              href="https://github.com/starkflux"
              isExternal
              fontSize="sm"
              color={textColor}
              _hover={{ color: 'blue.500' }}
            >
              GitHub
            </Link>
            <Link
              href="https://starknet.io"
              isExternal
              fontSize="sm"
              color={textColor}
              _hover={{ color: 'blue.500' }}
            >
              StarkNet
            </Link>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
};

export default Footer; 