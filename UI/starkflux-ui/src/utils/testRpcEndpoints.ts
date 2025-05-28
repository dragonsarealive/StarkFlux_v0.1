// Utility to test StarkNet Sepolia RPC endpoints
import { RpcProvider } from 'starknet';

const SEPOLIA_RPC_ENDPOINTS = [
  import.meta.env.VITE_RPC_URL || 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8', // Use env variable
  'https://starknet-sepolia.public.blastapi.io/rpc/v0_8',
  'https://free-rpc.nethermind.io/sepolia-juno/v0_8',
  'https://starknet-sepolia.lava.build',
  'https://rpc.starknet-sepolia.lava.build',
];

export const testRpcEndpoints = async (): Promise<{ working: string[], failed: string[] }> => {
  const working: string[] = [];
  const failed: string[] = [];

  console.log('Testing StarkNet Sepolia RPC endpoints...');

  for (const endpoint of SEPOLIA_RPC_ENDPOINTS) {
    try {
      console.log(`Testing: ${endpoint}`);
      const provider = new RpcProvider({ nodeUrl: endpoint });
      
      // Test with a simple call - get chain ID
      const chainId = await provider.getChainId();
      console.log(`✅ ${endpoint} - Chain ID: ${chainId}`);
      working.push(endpoint);
    } catch (error) {
      console.log(`❌ ${endpoint} - Error:`, error);
      failed.push(endpoint);
    }
  }

  console.log('\n=== RPC Test Results ===');
  console.log('Working endpoints:', working);
  console.log('Failed endpoints:', failed);

  return { working, failed };
};

// Export the recommended endpoint (your Alchemy endpoint)
export const RECOMMENDED_RPC_ENDPOINT = import.meta.env.VITE_RPC_URL || 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8'; 