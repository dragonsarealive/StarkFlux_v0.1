import React, { useState } from 'react';
import { Button, VStack, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { testRpcEndpoints } from '../utils/testRpcEndpoints';

const RpcTestButton: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{ working: string[], failed: string[] } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      const testResults = await testRpcEndpoints();
      setResults(testResults);
    } catch (error) {
      console.error('RPC test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Button
        onClick={handleTest}
        isLoading={testing}
        loadingText="Testing RPC endpoints..."
        colorScheme="blue"
        size="sm"
      >
        Test RPC Connectivity
      </Button>

      {results && (
        <VStack spacing={2} align="stretch">
          {results.working.length > 0 && (
            <Alert status="success" size="sm">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold">Working RPC endpoints:</Text>
                {results.working.map((endpoint, index) => (
                  <Text key={index} fontSize="xs" fontFamily="mono">
                    ✅ {endpoint}
                  </Text>
                ))}
              </VStack>
            </Alert>
          )}

          {results.failed.length > 0 && (
            <Alert status="error" size="sm">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold">Failed RPC endpoints:</Text>
                {results.failed.map((endpoint, index) => (
                  <Text key={index} fontSize="xs" fontFamily="mono">
                    ❌ {endpoint}
                  </Text>
                ))}
              </VStack>
            </Alert>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default RpcTestButton; 