// Import contract addresses from contracts.ts
import { CONTRACT_ADDRESSES, COMPONENT_REGISTRY_ABI, ACCESS_FLAGS, RPC_URL, DEVELOPMENT_ACCOUNT } from './contracts';

// Re-export for convenience
export { CONTRACT_ADDRESSES, COMPONENT_REGISTRY_ABI, ACCESS_FLAGS, RPC_URL, DEVELOPMENT_ACCOUNT };

// Import all ABIs
import IdentityRegistryABI from './identity_registry.abi.json';
import DevSubscriptionABI from './dev_subscription.abi.json';
import MarketplaceSubscriptionABI from './marketplace_subscription.abi.json';

// Export all ABIs
export const IDENTITY_REGISTRY_ABI = IdentityRegistryABI;
export const DEV_SUBSCRIPTION_ABI = DevSubscriptionABI;
export const MARKETPLACE_SUBSCRIPTION_ABI = MarketplaceSubscriptionABI;

// Minimal STRK token ABI for approve function
export const STRK_TOKEN_ABI = [
  {
    "name": "approve",
    "type": "function",
    "inputs": [
      {
        "name": "spender",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "amount",
        "type": "core::integer::u256"
      }
    ],
    "outputs": [
      {
        "type": "core::bool"
      }
    ],
    "state_mutability": "external"
  }
];

// Export CONTRACT_ABIS object for convenience
export const CONTRACT_ABIS = {
  COMPONENT_REGISTRY: COMPONENT_REGISTRY_ABI,
  IDENTITY_REGISTRY: IDENTITY_REGISTRY_ABI,
  DEV_SUBSCRIPTION: DEV_SUBSCRIPTION_ABI,
  MARKETPLACE_SUBSCRIPTION: MARKETPLACE_SUBSCRIPTION_ABI,
  STRK_TOKEN: STRK_TOKEN_ABI,
};

// Oracle constants
export const ORACLE_CONSTANTS = {
  // Pragma Oracle API expects direct string encoding of "STRK/USD", not the Cairo selector hash
  // This is the direct hex encoding of "STRK/USD" string
  PRAGMA_STRK_USD_PAIR_ID: '0x5354524B2F555344', // Direct encoding of "STRK/USD" 
  ORACLE_MAX_STALENESS: 3600, // 1 hour in seconds
  USD_DECIMAL_PLACES: 6, // USD amounts are in micro USD (10^6)
};

// Helper functions for pricing
export const formatUsdPrice = (micros: string | number): string => {
  if (!micros) return '$0.00';
  const numericValue = typeof micros === 'string' ? parseFloat(micros) : micros;
  return `$${(numericValue / 1_000_000).toFixed(2)}`;
};

export const formatStrkPrice = (wei: string | number): string => {
  if (!wei) return '0 STRK';
  const numericValue = typeof wei === 'string' ? parseFloat(wei) : wei;
  return `${(numericValue / 10**18).toFixed(4)} STRK`;
};

export const convertUsdToMicros = (usdAmount: string | number): string => {
  if (!usdAmount) return '0';
  const numericValue = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
  return Math.floor(numericValue * 1_000_000).toString();
};

export default {
  CONTRACT_ADDRESSES,
  ORACLE_CONSTANTS,
  ACCESS_FLAGS,
  formatUsdPrice,
  formatStrkPrice,
  convertUsdToMicros,
}; 