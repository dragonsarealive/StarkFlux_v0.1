import type { ReactNode } from "react";
import { StarknetConfig, jsonRpcProvider } from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";

interface StarknetConfigProviderProps {
  children: ReactNode;
}

// API key with fallback to hardcoded value if not set in .env
const ALCHEMY_API_KEY = import.meta.env.VITE_STARKNET_ALCHEMY_KEY || "NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb";

// Create a custom provider using jsonRpcProvider
const provider = jsonRpcProvider({
  rpc: (_chain) => {
    // Make sure we're using the same chain ID that sepolia uses
    return {
      nodeUrl: `https://starknet-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
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