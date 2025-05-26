# StarkFlux Contract Interaction Guide

**🎉 UPDATED FOR v1.2.0**: All contracts successfully deployed and fully functional! All critical bugs resolved.

## v1.2.0 Contract Addresses (Deployed May 26, 2025)
- **IdentityRegistry v1.2.0**: `0x079c5e6a08cab253e7bb4b57776d5ed0e66ca06bc01fc65f09fbf5ebdc397274`
- **ComponentRegistry v1.2.1**: `0x05fce2407338ddba93698b12af82275cbe62e1d9bcf7de63938cea642c894667`
- **DevSubscription v1.2.0**: `0x07c402205781ccd3b48b1b777c82cbc4a8eab20127bc3049fa2f6c7bfcfbc0ae`
- **MarketplaceSubscription v1.2.0**: `0x06e2c90a5fca956dc8c0e014e149c2708cb5ff1e7cf2c9345ff53599efbf90e1`

**Status**: All marketplace functionality working - developers can register, components can be uploaded, Oracle pricing active, all monetization paths operational.

This guide provides detailed instructions on how to interact with the StarkFlux marketplace smart contracts. It covers setup, common interactions, contract-specific functions, and important edge cases.

## 1. Setup and Configuration

### 1.1. Required Libraries

```bash
# Install required packages
npm install starknet starknet-react @starknet-react/chains @starknet-react/core starknetkit
```

### 1.2. Contract Configuration

Create a configuration file with contract addresses and ABIs:

```typescript
// contracts.config.ts
export const CONTRACT_ADDRESSES = {
  // v1.2.0 contract addresses - deployed May 26, 2025
  IDENTITY_REGISTRY: '0x079c5e6a08cab253e7bb4b57776d5ed0e66ca06bc01fc65f09fbf5ebdc397274', // v1.2.0
  COMPONENT_REGISTRY: '0x05fce2407338ddba93698b12af82275cbe62e1d9bcf7de63938cea642c894667', // v1.2.1
  DEV_SUBSCRIPTION: '0x07c402205781ccd3b48b1b777c82cbc4a8eab20127bc3049fa2f6c7bfcfbc0ae', // v1.2.0
  MARKETPLACE_SUBSCRIPTION: '0x06e2c90a5fca956dc8c0e014e149c2708cb5ff1e7cf2c9345ff53599efbf90e1', // v1.2.0
  STRK_TOKEN: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  PRAGMA_ORACLE: '0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a', // Sepolia Oracle
};

// Import contract ABIs (generated from contract artifacts)
import identityRegistryAbi from './abis/identityRegistry.json';
import componentRegistryAbi from './abis/componentRegistry.json';
import devSubscriptionAbi from './abis/devSubscription.json';
import marketplaceSubscriptionAbi from './abis/marketplaceSubscription.json';
import strkTokenAbi from './abis/strkToken.json';

export const CONTRACT_ABIS = {
  IDENTITY_REGISTRY: identityRegistryAbi,
  COMPONENT_REGISTRY: componentRegistryAbi,
  DEV_SUBSCRIPTION: devSubscriptionAbi,
  MARKETPLACE_SUBSCRIPTION: marketplaceSubscriptionAbi,
  STRK_TOKEN: strkTokenAbi,
};
```

### 1.3. Wallet Connection Setup

```tsx
// WalletConnection.tsx
import React, { useState, useEffect } from 'react';
import { connect, disconnect } from 'starknetkit';
import { sepolia } from '@starknet-react/chains';
import { useAccount } from '@starknet-react/core';

const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const [connectionDetails, setConnectionDetails] = useState<any>(null);

  const connectWallet = async () => {
    const connection = await connect({
      modalOptions: {
        theme: 'light',
      },
      webWalletUrl: "https://web.argent.xyz",
      dappName: "StarkFlux Marketplace",
    });
    
    if (connection && connection.wallet) {
      setConnectionDetails(connection);
    }
  };

  const disconnectWallet = async () => {
    await disconnect();
    setConnectionDetails(null);
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnection;
```

### 1.4. Contract Provider Setup

```tsx
// App.tsx
import React from 'react';
import { StarknetConfig, sepolia } from '@starknet-react/core';
import WalletConnection from './components/WalletConnection';

const App = () => {
  return (
    <StarknetConfig chains={[sepolia]} provider={{ rpcUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/v0_8/NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb' }}>
      <div className="App">
        <WalletConnection />
        {/* Other components */}
      </div>
    </StarknetConfig>
  );
};

export default App;
```

## 2. Common Contract Interactions

### 2.1. Reading Contract State

```tsx
import { useContract, useReadContract } from '@starknet-react/core';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../contracts.config';

// Example: Reading a component from ComponentRegistry
const ComponentDetails = ({ componentId }) => {
  const { contract } = useContract({
    address: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
    abi: CONTRACT_ABIS.COMPONENT_REGISTRY,
  });

  const { data: component, isLoading, error } = useReadContract({
    functionName: 'get_component',
    args: [componentId],
    watch: true,  // Re-fetch when data changes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{component?.title}</h2>
      <p>Seller: {component?.seller}</p>
      <p>Reference: {component?.reference}</p>
      <p>Price: {component?.price_strk}</p>
      {/* Other component details */}
    </div>
  );
};
```

### 2.2. Writing to Contracts (Transactions)

```tsx
import { useContract, useWriteContract } from '@starknet-react/core';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../contracts.config';

// Example: Purchasing a component
const PurchaseButton = ({ componentId }) => {
  const { contract } = useContract({
    address: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
    abi: CONTRACT_ABIS.COMPONENT_REGISTRY,
  });

  const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();

  const handlePurchase = async () => {
    try {
      await writeContract({
        functionName: 'purchase_component',
        args: [componentId],
      });
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={handlePurchase} 
        disabled={isPending}
      >
        {isPending ? 'Processing...' : 'Purchase Component'}
      </button>
      
      {isSuccess && <p>Purchase successful!</p>}
      {isError && <p>Purchase failed: {error?.message || 'Unknown error'}</p>}
    </div>
  );
};
```

### 2.3. Handling Transactions and Confirmations

```tsx
import { useWaitForTransaction } from '@starknet-react/core';

const TransactionStatus = ({ hash }) => {
  const { data, isLoading, isError, error } = useWaitForTransaction({ hash });

  if (isLoading) {
    return <div>Transaction in progress... Please wait.</div>;
  }

  if (isError) {
    return <div>Transaction failed: {error?.message || 'Unknown error'}</div>;
  }

  if (data) {
    return <div>Transaction confirmed! Block: {data.block_number}</div>;
  }

  return null;
};
```

### 2.4. Error Handling

```tsx
const handleContractInteraction = async (interactionFn, errorMessage) => {
  try {
    const result = await interactionFn();
    return { success: true, data: result };
  } catch (error) {
    // Handle specific error types
    if (error.code === 'REJECTED_BY_USER') {
      console.error('Transaction was rejected by user');
      return { success: false, error: 'Transaction cancelled' };
    }
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('Insufficient funds for transaction');
      return { success: false, error: 'Insufficient funds' };
    }
    
    // Handle other errors
    console.error(`${errorMessage}:`, error);
    return { success: false, error: error.message || 'Unknown error' };
  }
};

// Usage example
const result = await handleContractInteraction(
  () => writeContract({ functionName: 'purchase_component', args: [componentId] }),
  'Failed to purchase component'
);

if (result.success) {
  // Handle success
} else {
  // Display error message
}
```

## 3. Contract-Specific Interactions

### 3.1. IdentityRegistry

#### 3.1.1. Register as a Developer

```tsx
const RegisterDeveloper = () => {
  const { contract } = useContract({
    address: CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
    abi: CONTRACT_ABIS.IDENTITY_REGISTRY,
  });

  const { writeContract, isPending, isSuccess } = useWriteContract();

  const handleRegister = async () => {
    await writeContract({
      functionName: 'register',
      args: [],
    });
  };

  return (
    <div>
      <button onClick={handleRegister} disabled={isPending}>
        {isPending ? 'Registering...' : 'Register as Developer'}
      </button>
      {isSuccess && <p>Registration successful!</p>}
    </div>
  );
};
```

#### 3.1.2. Get Developer Identity

```tsx
const DeveloperProfile = ({ address }) => {
  const { contract } = useContract({
    address: CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
    abi: CONTRACT_ABIS.IDENTITY_REGISTRY,
  });

  // Get developer ID
  const { data: developerId, isLoading: idLoading } = useReadContract({
    functionName: 'get_id',
    args: [address],
  });

  // Get full identity using the ID
  const { data: identity, isLoading: identityLoading } = useReadContract({
    functionName: 'get_identity',
    args: [developerId || 0],
    enabled: !!developerId && developerId !== 0,
  });

  if (idLoading || identityLoading) return <div>Loading...</div>;
  if (!developerId || developerId === 0) return <div>Not a registered developer</div>;

  return (
    <div>
      <h2>Developer #{identity?.id}</h2>
      <p>Address: {identity?.owner}</p>
      <p>Joined: {new Date(identity?.join_timestamp * 1000).toLocaleDateString()}</p>
      <p>Uploads: {identity?.upload_count}</p>
      <p>Total Sales: {identity?.total_sales_strk} STRK</p>
    </div>
  );
};
```

#### 3.1.3. Set Monetization Mode

```tsx
const MonetizationModeSelector = () => {
  const [mode, setMode] = useState(0);
  
  const { writeContract } = useWriteContract();

  const handleSetMode = async () => {
    await writeContract({
      functionName: 'set_monetization_mode',
      args: [mode],
    });
  };

  return (
    <div>
      <h3>Set Monetization Mode</h3>
      <select value={mode} onChange={(e) => setMode(Number(e.target.value))}>
        <option value={0}>Free Only</option>
        <option value={1}>Paid Allowed (Default)</option>
      </select>
      <button onClick={handleSetMode}>Save</button>
    </div>
  );
};
```

### 3.2. ComponentRegistry

#### 3.2.1. Register a Component

```tsx
const RegisterComponentForm = () => {
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [priceStrk, setPriceStrk] = useState('');
  const [priceUsdMicros, setPriceUsdMicros] = useState('');
  const [priceFeedKey, setPriceFeedKey] = useState('');
  const [accessFlags, setAccessFlags] = useState(0);
  
  const { writeContract, isPending } = useWriteContract();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Prepare arguments based on pricing type
    const args = [
      title,
      reference,
      priceStrk || 0,
      priceUsdMicros || 0,
      priceFeedKey || 0,
      accessFlags,
    ];
    
    await writeContract({
      functionName: 'register_component',
      args,
    });
  };

  // Access flag toggles
  const handleAccessFlagToggle = (flag) => {
    if (flag === 8) {
      // If FREE flag, clear all other flags
      setAccessFlags(8);
    } else if (accessFlags & 8) {
      // If FREE flag was set and toggling another flag, clear FREE flag
      setAccessFlags(flag);
    } else {
      // Toggle the flag
      setAccessFlags(accessFlags ^ flag);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      
      <input
        type="text"
        placeholder="Reference (IPFS CID or URL)"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        required
      />
      
      <div>
        <h4>Pricing</h4>
        <label>
          STRK Price:
          <input
            type="number"
            step="0.000000000000000001"
            value={priceStrk}
            onChange={(e) => setPriceStrk(e.target.value)}
            disabled={accessFlags & 8} // Disable if FREE flag is set
          />
        </label>
        
        <label>
          USD Price (micros):
          <input
            type="number"
            step="0.000001"
            value={priceUsdMicros}
            onChange={(e) => setPriceUsdMicros(e.target.value)}
            disabled={accessFlags & 8} // Disable if FREE flag is set
          />
        </label>
        
        <label>
          Price Feed Key:
          <input
            type="text"
            value={priceFeedKey}
            onChange={(e) => setPriceFeedKey(e.target.value)}
            disabled={accessFlags & 8 || !priceUsdMicros} // Disable if FREE flag is set or no USD price
          />
        </label>
      </div>
      
      <div>
        <h4>Access Flags</h4>
        <label>
          <input
            type="checkbox"
            checked={!!(accessFlags & 1)}
            onChange={() => handleAccessFlagToggle(1)}
            disabled={accessFlags & 8} // Disable if FREE flag is set
          />
          BUY - One-time purchase
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={!!(accessFlags & 2)}
            onChange={() => handleAccessFlagToggle(2)}
            disabled={accessFlags & 8} // Disable if FREE flag is set
          />
          DEV_SUB - Developer subscription
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={!!(accessFlags & 4)}
            onChange={() => handleAccessFlagToggle(4)}
            disabled={accessFlags & 8} // Disable if FREE flag is set
          />
          MKT_SUB - Marketplace subscription
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={!!(accessFlags & 8)}
            onChange={() => handleAccessFlagToggle(8)}
          />
          FREE - Free for everyone
        </label>
      </div>
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Registering...' : 'Register Component'}
      </button>
    </form>
  );
};
```

#### 3.2.2. Purchase a Component

```tsx
const PurchaseComponent = ({ componentId }) => {
  const { contract: componentContract } = useContract({
    address: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
    abi: CONTRACT_ABIS.COMPONENT_REGISTRY,
  });
  
  const { contract: tokenContract } = useContract({
    address: CONTRACT_ADDRESSES.STRK_TOKEN,
    abi: CONTRACT_ABIS.STRK_TOKEN,
  });
  
  const { writeContract: writeComponentRegistry } = useWriteContract();
  const { writeContract: writeStrkToken } = useWriteContract();
  
  // Get component details
  const { data: component } = useReadContract({
    functionName: 'get_component',
    args: [componentId],
  });
  
  // Check if the component is free
  const { data: isFree } = useReadContract({
    functionName: 'is_free',
    args: [componentId],
  });
  
  // Get current price (handles Oracle conversion if USD-priced)
  const { data: currentPrice } = useReadContract({
    functionName: 'get_current_price_strk',
    args: [componentId],
  });
  
  const handlePurchase = async () => {
    if (isFree) {
      console.log('Component is free, no purchase needed.');
      return;
    }
    
    // First, approve STRK transfer
    try {
      await writeStrkToken({
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.COMPONENT_REGISTRY, currentPrice],
      });
      
      // Then purchase component
      await writeComponentRegistry({
        functionName: 'purchase_component',
        args: [componentId],
      });
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };
  
  if (isFree) {
    return <button disabled>Free Component - No Purchase Needed</button>;
  }
  
  return (
    <div>
      <p>Price: {currentPrice} STRK</p>
      <button onClick={handlePurchase}>Purchase Component</button>
    </div>
  );
};
```

### 3.3. MarketplaceSubscription

#### 3.3.1. Subscribe to Marketplace

```tsx
const MarketplaceSubscriptionButton = () => {
  const { contract: subscriptionContract } = useContract({
    address: CONTRACT_ADDRESSES.MARKETPLACE_SUBSCRIPTION,
    abi: CONTRACT_ABIS.MARKETPLACE_SUBSCRIPTION,
  });
  
  const { contract: tokenContract } = useContract({
    address: CONTRACT_ADDRESSES.STRK_TOKEN,
    abi: CONTRACT_ABIS.STRK_TOKEN,
  });
  
  const { writeContract: writeSubscription } = useWriteContract();
  const { writeContract: writeStrkToken } = useWriteContract();
  
  // Get current subscription price
  const { data: subscriptionPrice } = useReadContract({
    functionName: 'get_price',
  });
  
  // Check if user is already subscribed
  const { data: subscriptionExpiry, isLoading } = useReadContract({
    functionName: 'get_subscription_expiry',
    args: [account.address],
  });
  
  const isSubscribed = subscriptionExpiry > Math.floor(Date.now() / 1000);
  
  const handleSubscribe = async () => {
    try {
      // First, approve STRK transfer
      await writeStrkToken({
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.MARKETPLACE_SUBSCRIPTION, subscriptionPrice],
      });
      
      // Then subscribe
      await writeSubscription({
        functionName: 'subscribe',
        args: [],
      });
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  if (isSubscribed) {
    return (
      <div>
        <p>Subscribed until {new Date(subscriptionExpiry * 1000).toLocaleDateString()}</p>
        <button onClick={handleSubscribe}>Renew Subscription</button>
      </div>
    );
  }
  
  return (
    <div>
      <p>Subscription Price: {subscriptionPrice} STRK</p>
      <button onClick={handleSubscribe}>Subscribe to Marketplace</button>
    </div>
  );
};
```

#### 3.3.2. Record Download

```tsx
const DownloadButton = ({ componentId, component }) => {
  const { account } = useAccount();
  const { writeContract } = useWriteContract();
  
  // Check if the component is free
  const { data: isFree } = useReadContract({
    functionName: 'is_free',
    args: [componentId],
  });
  
  // Check marketplace subscription status
  const { data: isMarketplaceSubscribed } = useReadContract({
    functionName: 'is_subscribed',
    args: [account.address],
  });
  
  const handleDownload = async () => {
    // If the component is marketplace subscription eligible
    if (!isFree && (component.access_flags & 4) && isMarketplaceSubscribed) {
      // Record the download for reward distribution
      try {
        await writeContract({
          functionName: 'record_download',
          args: [account.address, componentId],
        });
      } catch (error) {
        console.error('Failed to record download:', error);
      }
    }
    
    // Actual download logic - fetch the reference content
    window.open(component.reference, '_blank');
  };
  
  return (
    <button onClick={handleDownload}>
      Download Component
    </button>
  );
};
```

### 3.4. DevSubscription

#### 3.4.1. Subscribe to a Developer

```tsx
const DeveloperSubscriptionButton = ({ developerId }) => {
  const { contract: subscriptionContract } = useContract({
    address: CONTRACT_ADDRESSES.DEV_SUBSCRIPTION,
    abi: CONTRACT_ABIS.DEV_SUBSCRIPTION,
  });
  
  const { contract: tokenContract } = useContract({
    address: CONTRACT_ADDRESSES.STRK_TOKEN,
    abi: CONTRACT_ABIS.STRK_TOKEN,
  });
  
  const { writeContract: writeSubscription } = useWriteContract();
  const { writeContract: writeStrkToken } = useWriteContract();
  
  // Get current subscription price for this developer
  const { data: subscriptionPrice } = useReadContract({
    functionName: 'get_price',
    args: [developerId],
  });
  
  // Check if user is already subscribed to this developer
  const { data: isSubscribed } = useReadContract({
    functionName: 'is_subscribed',
    args: [account.address, developerId],
  });
  
  const handleSubscribe = async () => {
    try {
      // First, approve STRK transfer
      await writeStrkToken({
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.DEV_SUBSCRIPTION, subscriptionPrice],
      });
      
      // Then subscribe
      await writeSubscription({
        functionName: 'subscribe',
        args: [developerId],
      });
    } catch (error) {
      console.error('Developer subscription failed:', error);
    }
  };
  
  if (isSubscribed) {
    return <button disabled>Already Subscribed</button>;
  }
  
  return (
    <div>
      <p>Subscription Price: {subscriptionPrice} STRK</p>
      <button onClick={handleSubscribe}>Subscribe to Developer</button>
    </div>
  );
};
```

#### 3.4.2. Set Developer Subscription Price

```tsx
const DeveloperPriceForm = () => {
  const [price, setPrice] = useState('');
  const { writeContract } = useWriteContract();
  
  const handleSetPrice = async (e) => {
    e.preventDefault();
    
    await writeContract({
      functionName: 'set_price',
      args: [price],
    });
  };
  
  return (
    <form onSubmit={handleSetPrice}>
      <h3>Set Your Subscription Price</h3>
      <input
        type="number"
        step="0.000000000000000001"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price in STRK"
        required
      />
      <button type="submit">Set Price</button>
    </form>
  );
};
```

## 4. Edge Cases and Caveats

### 4.1. DevSubscription and ComponentRegistry Integration

As noted in the architecture analysis, there is no direct connection between DevSubscription and ComponentRegistry. This means that verifying developer subscription eligibility must be handled at the UI level:

```tsx
const ComponentAccessChecker = ({ componentId, component, developerId }) => {
  const { account } = useAccount();
  
  // Check if the component is free
  const { data: isFree } = useReadContract({
    functionName: 'is_free',
    args: [componentId],
    contract: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
  });
  
  // Check if user has purchased the component
  const { data: hasPurchased } = useReadContract({
    functionName: 'has_purchased',
    args: [account.address, componentId],
    contract: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
  });
  
  // Check marketplace subscription
  const { data: hasMarketplaceSub } = useReadContract({
    functionName: 'is_subscribed',
    args: [account.address],
    contract: CONTRACT_ADDRESSES.MARKETPLACE_SUBSCRIPTION,
  });
  
  // Check developer subscription
  const { data: hasDevSub } = useReadContract({
    functionName: 'is_subscribed',
    args: [account.address, developerId],
    contract: CONTRACT_ADDRESSES.DEV_SUBSCRIPTION,
  });
  
  // Determine if user has access
  const hasBuyAccess = hasPurchased && (component.access_flags & 1);
  const hasDevSubAccess = hasDevSub && (component.access_flags & 2);
  const hasMarketSubAccess = hasMarketplaceSub && (component.access_flags & 4);
  const hasFreeAccess = isFree && (component.access_flags & 8);
  
  const hasAccess = hasBuyAccess || hasDevSubAccess || hasMarketSubAccess || hasFreeAccess;
  
  return (
    <div>
      {hasAccess ? (
        <DownloadButton componentId={componentId} component={component} />
      ) : (
        <AccessOptions 
          componentId={componentId} 
          component={component} 
          developerId={developerId} 
        />
      )}
    </div>
  );
};
```

### 4.2. U256 Parameter Formatting

When using Starkli for contract calls, u256 parameters require special formatting:

```bash
# Instead of this
starkli invoke contract_address set_price 1000000000000000000

# Use this format
starkli invoke contract_address set_price u256:1000000000000000000
```

In JavaScript/TypeScript, ensure proper BigInt handling:

```typescript
// Convert JavaScript number to BigInt for u256 values
const priceInStr = '1000000000000000000';
const priceAsBigInt = BigInt(priceInStr);

// When passing to contract function
await writeContract({
  functionName: 'set_price',
  args: [priceAsBigInt.toString()],
});
```

### 4.3. Oracle Data Staleness

The Oracle-based USD pricing system requires handling potential staleness:

```tsx
const UsdPriceDisplay = ({ componentId }) => {
  const { data: priceUsd } = useReadContract({
    functionName: 'get_price_usd',
    args: [componentId],
  });
  
  const { data: oracleData, isError } = useReadContract({
    functionName: 'get_oracle_data',
    args: [priceFeedKey],
  });
  
  // Check if oracle data is stale
  const isStale = oracleData?.timestamp < (Date.now() / 1000) - oracleData?.max_staleness;
  
  if (isError || isStale) {
    return (
      <div>
        <p>{formatUsdPrice(priceUsd)} USD</p>
        <p className="error">Warning: Oracle data may be stale</p>
      </div>
    );
  }
  
  return <p>{formatUsdPrice(priceUsd)} USD</p>;
};
```

### 4.4. Fee Calculation Considerations

Different contracts use different fee split models:

```tsx
const FeeSplitDisplay = ({ monetizationType, price }) => {
  let developerFee, platformFee, liquidityFee, rewardPoolFee;
  
  switch (monetizationType) {
    case 'direct':
    case 'developer':
      // 80/10/10 split
      developerFee = price * 0.8;
      platformFee = price * 0.1;
      liquidityFee = price * 0.1;
      rewardPoolFee = 0;
      break;
    case 'marketplace':
      // 45/45/10 split
      developerFee = 0; // Individual developers get paid from reward pool
      platformFee = price * 0.45;
      liquidityFee = price * 0.1;
      rewardPoolFee = price * 0.45;
      break;
    default:
      return null;
  }
  
  return (
    <div className="fee-breakdown">
      <h4>Fee Breakdown</h4>
      {developerFee > 0 && <p>Developer: {developerFee} STRK (80%)</p>}
      {rewardPoolFee > 0 && <p>Reward Pool: {rewardPoolFee} STRK (45%)</p>}
      <p>Platform: {platformFee} STRK ({rewardPoolFee > 0 ? '45%' : '10%'})</p>
      <p>Liquidity: {liquidityFee} STRK (10%)</p>
    </div>
  );
};
```

## 5. Event Listening

### 5.1. Setting Up Event Listeners

```tsx
import { useContract, useContractEvents } from '@starknet-react/core';

const ComponentEventLog = () => {
  const { contract } = useContract({
    address: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
    abi: CONTRACT_ABIS.COMPONENT_REGISTRY,
  });
  
  const { events, isLoading, error } = useContractEvents({
    eventName: 'ComponentRegistered',
    fromBlock: 'latest-100', // Last 100 blocks
    toBlock: 'latest',
    watch: true,
  });
  
  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error loading events: {error.message}</div>;
  
  return (
    <div>
      <h3>Recent Component Registrations</h3>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            Component #{event.component_id} registered by {event.seller}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### 5.2. Processing and Indexing Events

For production applications, consider setting up a dedicated indexer service that processes events and stores them in a database for efficient querying:

```typescript
// Example indexer pseudocode
import { RpcProvider } from 'starknet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './contracts.config';

const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/v0_8/NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb' });

// Define events to track
const eventConfigs = [
  { contractAddress: CONTRACT_ADDRESSES.COMPONENT_REGISTRY, eventName: 'ComponentRegistered' },
  { contractAddress: CONTRACT_ADDRESSES.COMPONENT_REGISTRY, eventName: 'ComponentPurchased' },
  { contractAddress: CONTRACT_ADDRESSES.IDENTITY_REGISTRY, eventName: 'IdentityRegistered' },
  { contractAddress: CONTRACT_ADDRESSES.MARKETPLACE_SUBSCRIPTION, eventName: 'Subscribed' },
  { contractAddress: CONTRACT_ADDRESSES.DEV_SUBSCRIPTION, eventName: 'Subscribed' },
];

// Process events from a specific block range
async function processEvents(fromBlock, toBlock) {
  for (const config of eventConfigs) {
    const events = await provider.getEvents({
      address: config.contractAddress,
      keys: [[config.eventName]],
      from_block: { block_number: fromBlock },
      to_block: { block_number: toBlock },
    });
    
    // Process and store events in database
    for (const event of events) {
      // Parse event data
      const parsedEvent = parseEvent(event, config.eventName);
      
      // Store in database
      await storeEvent(parsedEvent);
    }
  }
}

// Regularly poll for new blocks and process events
async function startIndexer() {
  let lastProcessedBlock = await getLastProcessedBlock();
  
  setInterval(async () => {
    const currentBlock = await provider.getBlockNumber();
    
    if (currentBlock > lastProcessedBlock) {
      await processEvents(lastProcessedBlock + 1, currentBlock);
      lastProcessedBlock = currentBlock;
      await updateLastProcessedBlock(currentBlock);
    }
  }, 15000); // Poll every 15 seconds
}

startIndexer();
```

## 6. Conclusion

This guide provides a comprehensive overview of how to interact with the StarkFlux marketplace smart contracts. By following these patterns and best practices, developers can build robust applications that leverage the full capabilities of the StarkFlux contracts while handling edge cases and potential issues.

Remember to always validate user inputs, handle errors gracefully, and provide clear feedback to users throughout the contract interaction process. Proper error handling and transaction confirmation mechanisms are essential for a good user experience in blockchain applications. 