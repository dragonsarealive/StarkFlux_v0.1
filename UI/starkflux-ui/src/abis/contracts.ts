// Contract addresses for StarkFlux on Sepolia testnet
export const CONTRACT_ADDRESSES = {
  IDENTITY_REGISTRY: '0x079c5e6a08cab253e7bb4b57776d5ed0e66ca06bc01fc65f09fbf5ebdc397274',
  COMPONENT_REGISTRY: '0x05fce2407338ddba93698b12af82275cbe62e1d9bcf7de63938cea642c894667',
  DEV_SUBSCRIPTION: '0x07c402205781ccd3b48b1b777c82cbc4a8eab20127bc3049fa2f6c7bfcfbc0ae',
  MARKETPLACE_SUBSCRIPTION: '0x06e2c90a5fca956dc8c0e014e149c2708cb5ff1e7cf2c9345ff53599efbf90e1',
  STRK_TOKEN: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  PRAGMA_ORACLE: '0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a' as `0x${string}`,
} as const;

// Import complete ComponentRegistry v1.2.1 ABI
import ComponentRegistryABI from './component_registry_v1_2_1.abi.json';

// Export the complete ABI
export const COMPONENT_REGISTRY_ABI = ComponentRegistryABI;

// ACCESS FLAGS constants for component access control
export const ACCESS_FLAGS = {
  FREE: 8,
  BUY: 1,
  DEV_SUB: 2,
  MKT_SUB: 4,
} as const;

// RPC Configuration - Using environment variable
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8';

// Account info for development and testing
export const DEVELOPMENT_ACCOUNT = {
  address: '0x0019CC7622177f02bA83D1D7E5bb835c0f461C87df8758c28ed756891c96D2CC', 
}; 