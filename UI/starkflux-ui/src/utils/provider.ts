import { RpcProvider } from 'starknet';

// Default RPC URLs - you should replace these with your own API keys in production
const SEPOLIA_RPC_URL = 'https://starknet-sepolia.g.alchemy.com/v2/demo';

// Create the RPC provider
export const provider = new RpcProvider({
  nodeUrl: SEPOLIA_RPC_URL,
  chainId: '0x534e5f5345504f4c4941' as any, // SN_SEPOLIA hex format
});

// Export chain configuration for use with StarknetConfig
export const chains = [{
  id: 'SN_SEPOLIA',
  name: 'Starknet Sepolia',
  // This needs to be a function that returns a provider (factory pattern)
  provider: () => new RpcProvider({ 
    nodeUrl: SEPOLIA_RPC_URL,
    chainId: '0x534e5f5345504f4c4941' as any, // SN_SEPOLIA hex format
  })
}];

export default provider; 