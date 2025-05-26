import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';
import { connect, disconnect } from 'get-starknet';
import { AccountInterface } from 'starknet';

// Define the wallet type
type WalletType = 'argentX' | 'braavos' | 'unknown';

// Define the connection state 
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// Define the context type
type WalletContextType = {
  account: AccountInterface | null;
  address: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  walletType: WalletType;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  connectionState: ConnectionState;
};

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  account: null,
  address: '',
  isConnected: false,
  isConnecting: false,
  error: null,
  walletType: 'unknown',
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  connectionState: 'disconnected',
});

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

type WalletProviderProps = {
  children: ReactNode;
};

// Helper to detect wallet type
const detectWalletType = (account: AccountInterface | null): WalletType => {
  if (!account) return 'unknown';
  
  // Check wallet provider in the account object - should be present in newer wallet versions
  if ('provider' in account) {
    const provider = (account as any).provider;
    if (provider?.id?.includes('argentX') || provider?.name?.includes('argentX')) {
      return 'argentX';
    }
    if (provider?.id?.includes('braavos') || provider?.name?.includes('braavos')) {
      return 'braavos';
    }
  }
  
  // Fallback: Try to detect based on implementation details
  const accountObj = account as any;
  
  // Check for Argent X specific properties
  if (accountObj?.options?.name?.includes('argentX') || 
      accountObj?.providerName?.includes('argentX')) {
    return 'argentX';
  }
  
  // Check for Braavos specific properties
  if (accountObj?.options?.name?.includes('braavos') || 
      accountObj?.providerName?.includes('braavos')) {
    return 'braavos';
  }
  
  return 'unknown';
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [walletType, setWalletType] = useState<WalletType>('unknown');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [, setConnectionAttempts] = useState<number>(0);

  // Function to update wallet state with connected account
  const updateWalletState = useCallback((connectedAccount: AccountInterface) => {
    const detectedWalletType = detectWalletType(connectedAccount);
    
    setAccount(connectedAccount);
    setAddress(connectedAccount.address);
    setIsConnected(true);
    setWalletType(detectedWalletType);
    setConnectionState('connected');
    setError(null);
    
    console.log("Wallet connected successfully:", {
      address: connectedAccount.address,
      type: detectedWalletType
    });
  }, []);

  // Listen for wallet changes (account, network)
  useEffect(() => {
    if (!window.starknet) return;

    const handleAccountsChanged = async () => {
      console.log("Wallet accounts changed - refreshing connection");
      
      try {
        const starknet = await connect({ modalMode: "neverAsk" });
        
        if (starknet?.isConnected && starknet?.account) {
          updateWalletState(starknet.account);
        } else {
          // If no longer connected, reset state
          setIsConnected(false);
          setAccount(null);
          setAddress('');
          setWalletType('unknown');
          setConnectionState('disconnected');
        }
      } catch (e) {
        console.error("Error handling accounts changed:", e);
      }
    };

    // Add event listeners for wallet changes
    if (window.starknet?.on) {
      window.starknet.on('accountsChanged', handleAccountsChanged);
      window.starknet.on('networkChanged', handleAccountsChanged);
    }

    return () => {
      // Remove event listeners on cleanup
      if (window.starknet?.removeListener) {
        window.starknet.removeListener('accountsChanged', handleAccountsChanged);
        window.starknet.removeListener('networkChanged', handleAccountsChanged);
      }
    };
  }, [updateWalletState]);

  // Check for existing connection on mount, with retry mechanism
  useEffect(() => {
    const checkConnectedWallet = async () => {
      try {
        console.log("Checking for existing wallet connection...");
        setConnectionState('connecting');
        
        const starknet = await connect({
          modalMode: "neverAsk",
        });
        
        if (starknet?.isConnected && starknet?.account) {
          updateWalletState(starknet.account);
        } else {
          setConnectionState('disconnected');
        }
      } catch (e) {
        console.error("Error checking wallet connection:", e);
        setConnectionState('disconnected');
      }
    };

    checkConnectedWallet();
  }, [updateWalletState]);

  // Function to check if StarkNet wallet is available
  const isWalletAvailable = () => {
    // Check for any of these properties that would indicate a wallet is present
    return Boolean(
      window.starknet || 
      window.starknet_argentX || 
      window.starknet_braavos || 
      window.argentX || 
      window.braavos
    );
  };
  
  // Connect wallet with improved error handling and retries
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setConnectionState('connecting');
      setConnectionAttempts(prev => prev + 1);
      
      console.log("Attempting to connect wallet...");
      
      // First, explicitly check if wallet is available in window
      const walletAvailable = isWalletAvailable();
      console.log("Is wallet available in window:", walletAvailable);
      
      if (!walletAvailable) {
        throw new Error("No StarkNet wallet extension found. Please install ArgentX or Braavos.");
      }
      
      // Now try to connect without user interaction
      const starknet = await connect({
        modalMode: "neverAsk",
      });
      
      console.log("Initial wallet check response:", starknet ? "Found" : "Not found via connect()");
      
      // Even if connect() returns null, the wallet might still be available but not initialized
      if (!starknet && !walletAvailable) {
        throw new Error("No StarkNet wallet extension found");
      }
      
      console.log("Wallet found, requesting connection...");
      
      // Try different connection approaches for different wallet types
      let connection;
      
      try {
        // First approach - standard connect with alwaysAsk
        connection = await connect({
          modalMode: "alwaysAsk",
          dappName: "StarkFlux",
          chainId: "SN_SEPOLIA", 
        });
        
        console.log("Standard connection response:", connection);
      } catch (connectError) {
        console.error("Error in standard connect:", connectError);
        
        // Try alternative connection method - some wallets might behave differently
        console.log("Trying alternative connection method...");
        
        // Wait a bit before trying again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Try connecting with silentMode first (helps with certain wallet configurations)
          await connect({ modalMode: "silentMode" });
          
          // Then immediately try with alwaysAsk
          connection = await connect({
            modalMode: "alwaysAsk",
            dappName: "StarkFlux",
            chainId: "SN_SEPOLIA",
          });
          
          console.log("Alternative connection response:", connection);
        } catch (altError) {
          console.error("Alternative connection also failed:", altError);
          throw new Error("Failed to connect to wallet after multiple attempts");
        }
      }
      
      // Wait a moment for the connection to fully establish
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // If we made it this far but connection is undefined, the user may have cancelled
      if (!connection) {
        // One last try - direct window access
        if (window.starknet?.isConnected) {
          console.log("Window.starknet indicates connected state, trying to get account...");
          
          // Try to get the account directly
          try {
            // Force the connection to be recognized by refreshing
            connection = await connect({ modalMode: "neverAsk" });
            console.log("Last attempt connection:", connection);
          } catch (e) {
            console.error("Final attempt failed:", e);
          }
          
          if (!connection) {
            throw new Error("Wallet appears connected but unable to access account");
          }
        } else {
          throw new Error("Connection request cancelled or wallet not responding");
        }
      }
      
      // Check if account is available either through the connection or directly
      if (!connection.account) {
        console.log("Account not immediately available, trying fallback methods...");
        
        // First check if we can access window.starknet directly
        if (window.starknet?.account) {
          console.log("Found account directly through window.starknet.account");
          updateWalletState(window.starknet.account);
          return;
        }
        
        // Progressive retry with increasing delays
        console.log("Trying progressive retries...");
        
        // Try multiple times with increasing delays
        const retryDelays = [1000, 1500, 2000, 3000]; // 1s, 1.5s, 2s, 3s
        let connectedAccount = null;
        
        for (let i = 0; i < retryDelays.length; i++) {
          await new Promise(resolve => setTimeout(resolve, retryDelays[i]));
          console.log(`Retry attempt ${i+1}...`);
          
          // Try multiple ways to get the account
          try {
            // Method 1: Refresh connection state via connect()
            const refreshedConnection = await connect({
              modalMode: "neverAsk",
            });
            
            if (refreshedConnection?.account) {
              console.log("Connected successfully with refreshedConnection.account");
              connectedAccount = refreshedConnection.account;
              break;
            }
            
            // Method 2: Try window.starknet.account again
            if (window.starknet?.account) {
              console.log("Found account via window.starknet.account on retry");
              connectedAccount = window.starknet.account;
              break;
            }
            
            // Method 3: For some wallets, we might need to request enable() first
            if (window.starknet?.enable && !window.starknet.isConnected) {
              console.log("Trying window.starknet.enable()...");
              await window.starknet.enable();
              
              // Check again after enable
              if (window.starknet?.account) {
                console.log("Found account after enable()");
                connectedAccount = window.starknet.account;
                break;
              }
            }
          } catch (retryError) {
            console.error(`Error in retry attempt ${i+1}:`, retryError);
          }
        }
        
        if (connectedAccount) {
          updateWalletState(connectedAccount);
          return;
        } else {
          // One final desperate attempt - maybe the account is available now in the original connection
          if (connection.account) {
            console.log("Found account in original connection after waiting");
            updateWalletState(connection.account);
            return;
          }
          
          throw new Error("Wallet connected but no account available after multiple retries");
        }
      }
      
      // Successfully connected on first try
      console.log("Successfully connected with account on first try");
      updateWalletState(connection.account);
      
    } catch (e) {
      console.error("Error connecting wallet:", e);
      setConnectionState('error');
      
      // Provide more helpful error messages based on error type
      if (e instanceof Error) {
        // Handle specific error types
        if (e.message.includes("User abort") || 
            e.message.includes("cancelled") || 
            e.message.includes("reject")) {
          setError(new Error("Connection cancelled by user"));
        } else if (e.message.includes("No wallet") || 
                  e.message.includes("not found") || 
                  e.message.includes("extension")) {
          setError(new Error("No StarkNet wallet extension found. Please install ArgentX or Braavos"));
        } else if (e.message.includes("pending") || 
                  e.message.includes("already in progress")) {
          setError(new Error("Connection already in progress. Check your wallet for pending requests"));
        } else if (e.message.includes("network") || 
                  e.message.includes("chain") || 
                  e.message.includes("testnet")) {
          setError(new Error("Network mismatch. Please set your wallet to Sepolia testnet"));
        } else if (e.message.includes("timeout") || 
                  e.message.includes("not responding")) {
          setError(new Error("Connection timed out. Please try again or restart your browser"));
        } else {
          // For other errors, try to provide a clear message
          const errorMessage = e.message.length > 100 
            ? e.message.substring(0, 100) + '...' 
            : e.message;
          setError(new Error(`Connection error: ${errorMessage}`));
        }
      } else {
        setError(new Error("Unknown error occurred during wallet connection"));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Function to disconnect wallet with improved error handling
  const disconnectWallet = async () => {
    try {
      console.log("Attempting to disconnect wallet...");
      setConnectionState('disconnected');
      await disconnect();
      setAccount(null);
      setAddress('');
      setIsConnected(false);
      setWalletType('unknown');
      setError(null);
      console.log("Wallet disconnected successfully");
    } catch (e) {
      console.error("Error disconnecting wallet:", e);
      setError(e instanceof Error ? e : new Error("Failed to disconnect"));
    }
  };

  return (
    <WalletContext.Provider value={{
      account,
      address,
      isConnected,
      isConnecting,
      error,
      walletType,
      connectWallet,
      disconnectWallet,
      connectionState,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider; 