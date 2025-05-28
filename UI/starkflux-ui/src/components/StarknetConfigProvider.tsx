import type { ReactNode } from "react";
import { StarknetConfig, jsonRpcProvider } from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";

interface StarknetConfigProviderProps {
  children: ReactNode;
}

// Use RPC URL from environment variable with fallback to Alchemy
const RPC_URL = import.meta.env.VITE_RPC_URL || 
  'https://starknet-sepolia.g.alchemy.com/v2/demo';

// Create a custom provider using jsonRpcProvider
const provider = jsonRpcProvider({
  rpc: (_chain) => {
    return {
      nodeUrl: RPC_URL
    };
  }
});

export const StarknetConfigProvider = ({ children }: StarknetConfigProviderProps) => (
  <StarknetConfig
    autoConnect
    chains={[sepolia]}
    provider={provider}
  >
    {children}
  </StarknetConfig>
);

export default StarknetConfigProvider; 