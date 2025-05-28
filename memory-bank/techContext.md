# Tech Context

## 1. Core Technologies & Versions (Target)

*   **Cairo Language**: Latest stable version compatible with target Starknet version.
*   **Starknet**: Target is Sepolia testnet, then mainnet. Using relevant contract ABIs and standards.
*   **Scarb**: Target a recent, stable version (e.g., specific nightly like `2.11.4+nightly-2025-05-14` or a version built from `main` like `2.12.x-dev`).
*   **Starknet Foundry (`snforge_std`)**: Version 0.43.0 for testing, with the key components:
    *   `snforge`: For running Cairo-based tests that can deploy contracts, modify blockchain state with cheatcodes, and verify expected behavior.
    *   `sncast`: For contract deployments and interaction on testnet/mainnet.
*   **Rust**: For local building of Scarb or plugins if necessary (version typically managed by `rustup`, latest stable).
*   **Custom Build Scripts**: Custom shell scripts for resolving artifact generation issues during the build process.

### UI Technologies (Target)
*   **React**: Version 18+ with TypeScript for frontend development.
*   **@starknet-react/core**: Version 1.0.4 for React hooks integration with StarkNet.
*   **get-starknet**: Version 2.1.0 for wallet connection and provider management.
*   **starknet.js**: Version 5.14.1 for contract interactions.
*   **React Router**: For page routing and navigation.
*   **PowerShell**: For Windows environment script execution.
*   **Vite**: For fast development server and optimized builds.

### Encrypted Upload Technologies (Implemented)
*   **JSZip**: For client-side folder compression and streaming.
*   **Web Crypto API**: For AES-CTR encryption/decryption of component folders.
*   **Pinata IPFS**: For decentralized storage of encrypted component files.
*   **Key Escrow System**: Custom implementation for secure marketplace key management.
*   **Stream Processing**: Custom utilities for handling large file uploads (≤200MB) with progress tracking.

## 2. Development Environment & Setup

*   **IDE**: Visual Studio Code with Cairo LS extension (or equivalent).
*   **Shell**: PowerShell for Windows development, configuring execution policies as needed.
*   **Version Control**: Git, GitHub repository at github.com/dragonsarealive/starknet-dev-components-marketplace.
*   **Current State**: The environment is stable for core Cairo contract development and compilation using Scarb. A comprehensive testing guide and setup (`starknet_testing_guide.md`) has been created.
*   **UI Development**: Browser-based development using standard web technologies. Brave browser is the primary target for optimizations, with compatibility maintained for Chrome and Firefox.
*   **Build Process Helper**: Custom scripts included in the project that improve the Scarb build output for deployment.

## 3. Technical Constraints & Considerations

*   **WSL Stability**: While previously a blocker for testing toolchain setup, the current focus on core compilation is stable.
*   **Cairo/Starknet Versioning**: Contracts must be compatible with the target Starknet network version.
*   **Error Message Constraints**: Cairo `felt252` string literal limitations (<= 31 chars) for `assert` and `Result::Err` messages.
*   **Test Isolation**: Starknet Foundry (v0.40+) guarantees isolated states for each test, which simplifies test writing but still requires careful use of cheatcodes.
*   **ERC-20 Behavior**: We're targeting OpenZeppelin-style ERC-20 tokens that revert on failure rather than returning status codes. Our contract relies on this revert-on-failure behavior for transfer safety.
*   **Build Artifact Issues**: Scarb generates incorrect artifacts where all contracts reference the same module path (MarketplaceSubscription). This requires a custom fix script (fix_artifacts.sh) to correctly map contract names to their respective module paths.
*   **UI Constraints**:
    *   **Wallet Detection**: Different wallets inject different objects into the window, requiring adaptive detection.
    *   **StarkNet Network Latency**: UI must handle asynchronous transaction processing with clear user feedback.
    *   **Brave Browser Privacy Features**: Must ensure compatibility with Brave's tracker blocking and security features.
    *   **Responsive Design Requirements**: UI must work on mobile, tablet, and desktop devices.
    *   **PowerShell Execution**: Windows environments may require adjusting PowerShell execution policy.
    *   **Contract Implementation Strategy**: Starting with mock implementations before connecting to live contracts.
    *   **🚨 CRITICAL: Oracle Address Mismatch**: DevSubscription contract deployed with wrong Oracle address (`0x02a85bd616f912537c50a49a4076db02c00b29b2cdc8a197ce92ed1837fa875b` - not deployed) while UI uses working Oracle (`0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a`). This breaks all USD pricing functionality in DevSubscription.

*   **Encrypted Upload Constraints**:
    *   **File Size Limits**: Maximum 200MB per folder upload to maintain browser performance.
    *   **Memory Management**: Streaming encryption to prevent browser memory overflow.
    *   **IPFS Storage**: Dependency on Pinata service availability and JWT token validity.
    *   **Key Management**: Secure escrow system required for marketplace functionality.
    *   **Browser Compatibility**: Web Crypto API support required for encryption operations.
    *   **Network Reliability**: Large file uploads require robust error handling and retry mechanisms.

## 4. Key Dependencies

*   **Scarb**: For project and dependency management, compilation.
*   **OpenZeppelin Cairo Contracts**: For standard contract components (e.g., ERC20, Ownable) if utilized.
*   **Starknet Foundry**: For testing Cairo contracts through `snforge` and deploying them through `sncast`.
*   **Core System CLI tools within WSL**: `git`, `curl` (for manual Scarb/toolchain installations if needed in future).
*   **Custom Build Scripts**: To fix artifact module paths and enable deployment.
*   **UI Dependencies**:
    *   **StarkNet.js**: Core library for StarkNet contract interaction.
    *   **@starknet-react/core**: React hooks for StarkNet integration.
    *   **get-starknet**: Wallet connection library optimized for StarkNet.
    *   **React Router**: For routing and navigation.
    *   **TypeScript**: For type safety and improved developer experience.
    *   **Vite**: For fast development and optimized builds.

## 5. Build Process (Current)

1.  Write Cairo contracts (`src/`).
2.  Compile contracts: `scarb build`.
3.  Debug any compilation failures.
4.  Run fix_artifacts.sh script to create correct artifacts with proper module path references.
5.  Deploy using fixed artifacts.
6.  Test contracts: `snforge test` (once testing is implemented).
7.  Commit changes to GitHub repository: github.com/dragonsarealive/starknet-dev-components-marketplace.

### UI Contract Integration Process (Current)

1. **Mock Development Phase**:
   - Create directory structure for contract integration (`abis`, `mocks`, `hooks`, `utils`)
   - Implement mock data matching contract output structures
   - Develop hooks with mock implementations for all contract functionality
   - Create utility functions for data formatting and standardization
   - Build UI components that use the hooks with mock data

2. **Contract ABI Integration Phase**:
   - Create proper ABI definitions for all contracts
   - Implement contract instantiation with proper provider management
   - Replace mock implementations with actual contract calls
   - Add proper loading and error states for asynchronous operations
   - Test all read operations against deployed contracts

3. **Transaction Handling Phase**:
   - Implement transaction flow for write operations
   - Create transaction status tracking and feedback
   - Add wallet-specific error handling
   - Implement proper event handling and UI updates

4. **Integration Testing Phase**:
   - Test all contract interactions end-to-end
   - Verify proper error handling for network and contract issues
   - Optimize for performance and user experience
   - Ensure responsive behavior across devices

### Artifact Fix Build Process (Verified)

1. Configure Scarb.toml with correct contract-name and module-path entries for each contract.
2. Run scarb build to generate initial compiled files.
3. Execute fix_artifacts.sh which:
   - Creates correctly named artifact JSON files with proper module paths
   - Renames compiled class files to match artifact references
4. Use the fixed artifacts for deployment or testing.

The artifact fix process has been verified through comprehensive testing, ensuring proper bytecode and ABI generation. The script produces consistent and correct artifacts for all five contracts, making them ready for production testnet deployment.

### Deployment Process (Ready)

The verified contracts are now ready for deployment to Starknet Sepolia testnet:

1. Generate fixed artifacts using fix_artifacts.sh
2. Deploy contracts in proper order:
   - ComponentRegistry
   - IdentityRegistry
   - MarketplaceSubscription
   - DevSubscription
3. Set configuration parameters:
   - Fee splits (80/10/10) for ComponentRegistry
   - Initial USD pricing for subscription contracts
   - Contract references (SubscriptionManager, etc.)
4. Document deployed addresses for frontend integration

The deploy.sh script contains the proper sequence and parameters for deployment, including post-deployment configuration calls.

### UI Build Process (Current)

1. Create React application with TypeScript and necessary dependencies:
   ```bash
   # Using npm
   npm create vite@latest my-app -- --template react-ts
   cd my-app
   npm install --legacy-peer-deps
   
   # Install StarkNet dependencies
   npm install starknet@5.14.1 @starknet-react/core@1.0.4 get-starknet@2.1.0 --legacy-peer-deps
   
   # Install utilities
   npm install react-router-dom
   ```

2. Setup directory structure:
   ```
   src/
   ├── abis/         # Contract addresses and ABIs 
   ├── mocks/        # Mock data for development
   ├── hooks/        # React hooks for contract interaction
   ├── utils/        # Utility functions
   ├── components/   # UI components
   ├── pages/        # Application pages
   └── App.tsx       # Main application component
   ```

3. Implement contract interaction layer:
   - Start with mock implementations
   - Create hooks for each contract
   - Replace with actual contract calls as development progresses

4. Build and deploy:
   ```bash
   npm run build
   # Deploy to hosting platform
   ```

## 15. Encrypted Component Upload Architecture

The StarkFlux marketplace implements a complete encrypted folder upload system for secure component distribution:

### 1. Upload Flow Architecture
**Developer Upload Process**:
1. **Folder Selection**: Browser-based folder selection using webkitdirectory
2. **Compression**: JSZip library compresses folder contents into stream
3. **Encryption**: AES-CTR encryption using Web Crypto API with generated keys
4. **IPFS Upload**: Encrypted blob uploaded to Pinata IPFS service
5. **Smart Contract Registration**: Component registered on-chain with IPFS CID
6. **Key Escrow**: Encryption keys stored securely for marketplace access

### 2. Key Management System
**Escrow Architecture**:
- **Developer Keys**: Stored in escrow system after successful component registration
- **Access Control**: Smart contract verification before key release
- **Purchaser Access**: Keys provided only to users with verified component access
- **Security**: No localStorage usage - proper marketplace key management

### 3. Purchaser Access Flow
**Component Download Process**:
1. **Access Verification**: Smart contract checks user access rights (BUY/DEV_SUB/MKT_SUB/FREE)
2. **Key Retrieval**: Escrow service provides decryption keys for authorized users
3. **IPFS Download**: Encrypted component blob downloaded using CID
4. **Decryption**: Client-side decryption using provided keys
5. **File Access**: User receives original folder contents

### 4. Technical Implementation
**Core Utilities**:
- **src/utils/zipStream.ts**: JSZip-based folder compression
- **src/utils/encryptStream.ts**: AES-CTR encryption/decryption with Web Crypto API
- **src/utils/streamToBlob.ts**: Stream processing with progress tracking
- **src/utils/ipfs.ts**: Pinata REST API integration with CID validation
- **src/utils/keyEscrow.ts**: Key management with smart contract integration

**React Components**:
- **src/components/EncryptedUpload.tsx**: Upload UI with progress and error handling
- **src/hooks/useEncryptedUpload.ts**: Upload state management
- **src/hooks/useComponentAccess.ts**: Purchaser access and decryption system

### 5. Environment Configuration
**Pinata Integration**:
```bash
# .env.local configuration
VITE_PINATA_JWT=Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Connection Status**: ✅ User confirmed "Pinata Connected" with green checkmark

### 6. Security Considerations
**Encryption Standards**:
- **Algorithm**: AES-CTR with 256-bit keys
- **Key Generation**: Cryptographically secure random key generation
- **IV Management**: Unique initialization vectors for each upload
- **Stream Processing**: Memory-efficient encryption for large files

**Access Control**:
- **Smart Contract Verification**: On-chain access rights verification
- **Key Escrow**: Secure key storage with marketplace integration
- **No Client Storage**: Keys never stored in localStorage or browser storage

## 16. UI Contract Integration Approach

The StarkFlux UI implementation follows a layered approach for contract interaction:

### 1. Contract ABI Layer
Located in `src/abis`:
- `contracts.ts`: Contains all deployed contract addresses and RPC configuration
- Future ABI definitions will be added here as needed

### 2. Mock Data Layer
Located in `src/mocks`:
- `components.ts`: Mock component data with proper structure
- `developers.ts`: Developer identity information
- `subscriptions.ts`: Mock subscription and purchase records
- Used during development to simulate contract responses
- Follows same structure as expected contract data

### 3. Hooks Layer
Located in `src/hooks`:
- `useComponentRegistry.ts`: Component listing and details
- `useIdentityRegistry.ts`: Developer identity information
- `useMarketplaceSubscription.ts`: Marketplace subscription operations
- `useDevSubscription.ts`: Developer subscription operations
- `useAccessVerification.ts`: Composite hook for determining access rights
- Each hook provides consistent API regardless of mock vs. real implementation

### 4. Utility Layer
Located in `src/utils`:
- `contractFormatters.ts`: Functions for formatting contract data
- Handles conversion between contract values and UI-friendly formats
- Examples: STRK price formatting, access flag conversion, timestamp formatting

### 5. UI Components Layer
Located in `src/components`:
- Components that use the hooks layer to display data
- Handle loading and error states
- Provide interactive elements for user actions

### 6. Pages Layer
Located in `src/pages`:
- Page-level components that organize the UI
- Manage page-specific state
- Handle routing and navigation

This layered approach allows for:
1. Parallel development of UI and contract integration
2. Easy replacement of mock implementations with real contract calls
3. Consistent API design across the application
4. Separation of concerns between data and presentation

## 16. UI Testing Approach

*   **Component Testing:** Using React Testing Library for component-level testing.
*   **Contract Interaction Testing:** Mocking StarkNet.js and contract interactions for unit testing.
*   **Integration Testing:** Using Cypress or Playwright for end-to-end testing of user workflows.
*   **Wallet Testing:** Testing wallet connection and transaction flows using mock wallets.
*   **Responsive Testing:** Testing UI on different device sizes using responsive testing tools.
*   **Browser Compatibility Testing:** Testing on Brave, Chrome, and Firefox to ensure cross-browser compatibility.

## 6. Contract Development Standards

*   **ABI Exposure:** All public functions in each contract intended for external interaction (including by users or other contracts) must be annotated with `#[external(v0)]` and contracts should expose their ABI using `#[abi(embed_v0)]` for discoverability and interaction.
*   **Struct Derivations:** Structs used in storage or as event/function parameters/return types should use `#[derive(Drop, Serde, Copy)]` where appropriate and required by the compiler for their usage (e.g., `Copy` for types stored in `Map`, `Serde` for external calls, `Drop` for general memory management).
*   **Imports:** Imports should be explicit (e.g., `use starknet::ContractAddress;` instead of relying on prelude or wildcard imports where clarity is paramount). Duplicate imports should be avoided.
*   **Integer Types:** Use `core::integer::u256` for 256-bit unsigned integers rather than custom wrappers, unless a specific, justified need for a wrapper arises.
*   **Event Emission:** Events should be emitted after successful state changes and any external calls, to accurately reflect the completed transaction's outcome.
*   **Documentation:** NatSpec-style documentation comments (`///`) must be included for every external function, detailing its purpose, arguments, and return values.
*   **External Calls Safety:** For external contract calls, especially ERC-20 tokens, rely on the OpenZeppelin pattern where functions revert on failure, rather than checking return values. This is gas-efficient and handles failure appropriately.
*   **Post-Sale Modifications:** Components can be deactivated even after sale for safety reasons, but economic terms (pricing, eligibility) should not be modifiable after sale.
*   **Testing:** Tests should be organized in the `tests/` directory, with a focus on isolated, atomic tests that verify specific functionalities. Cheatcodes from `snforge_std` should be used to set up test conditions and verify outcomes.
*   **Artifact Generation:** Due to limitations in Scarb's artifact generation, use the provided fix_artifacts.sh script after building to ensure proper module path references.

## 7. UI Development Standards

*   **Component Organization:** UI components should be organized by functionality and contract, with clear separation of concerns.
*   **TypeScript Usage:** All components should use TypeScript for type safety and improved developer experience.
*   **Contract Interaction Patterns:** Use Starknet React hooks for contract interaction, with proper error handling and loading states.
*   **Responsive Design:** All components should be designed with a mobile-first approach, with responsive layouts for tablet and desktop.
*   **Wallet Integration:** Use StarknetKit for wallet connection, with support for multiple wallet types (ArgentX, Braavos, etc.).
*   **Security Considerations:** Follow best practices for blockchain application security, with clear user feedback for transaction confirmation and error handling.
*   **Accessibility:** Ensure UI components meet WCAG 2.1 AA standards for accessibility.
*   **Performance Optimization:** Use code splitting, lazy loading, and efficient data fetching to ensure optimal performance.
*   **Brave Browser Compatibility:** Test and optimize for Brave's privacy features, with fallbacks for blocked trackers and scripts.

## 8. Inter-Contract Communication

*   Interfaces defined in `src/interfaces.cairo` will be used for standardized communication between the marketplace contracts and with external dependencies like an ERC20 token or an Oracle.
    *   `IERC20`
    *   `IPragmaOracle` (or a similar standard oracle interface if Pragma has a different official one by the development time)
    *   `IComponentRegistryExternal` (for `SubscriptionManager` to query component details).

## 9. Shared Code & Constants

*   **Shared Constants:** Common constant values (e.g., storage slot names if absolutely necessary, though direct usage of `#[storage]` variables is more common) will be defined in `src/storage_slots.cairo` if a clear benefit for such centralization is identified over direct definition.
*   **Utility Functions:** Common mathematical helper functions (e.g., `mul_div_u256`, safe type casting like `u128_to_u256`) will be placed in `src/math_utils.cairo` and imported where needed.

## 10. Oracle Integration

*   The `ComponentRegistry` contract will integrate with an on-chain price oracle (specified as `IPragmaOracle`) to fetch USD price data for STRK conversion.
*   The `max_staleness` parameter will be used to ensure the freshness of oracle data.
*   UI needs to handle oracle data display, including loading states and error handling for stale or unavailable data.

## 11. Token Standard

*   The marketplace will use a STRK token adhering to an ERC20-compatible interface for payments and subscriptions.
*   We expect the token to follow the OpenZeppelin pattern of reverting on failure rather than returning status codes.

## 12. Testing Infrastructure

*   **Test Organization:** Tests are organized in a `tests/` directory at the project root, with separate files for each contract being tested.
*   **Test Framework:** Using Starknet Foundry's `snforge` tool with the `snforge_std` library for cheatcodes and assertions.
*   **Test Approach:** 
    *   Unit tests for individual functions and components.
    *   Integration tests for contract interactions.
    *   Optional fork tests for testing against real network state (e.g., deployed dependencies on Sepolia).
*   **Key Testing Features:**
    *   Contract deployment within tests using `declare` and `deploy`.
    *   State manipulation with cheatcodes like `start_prank` (for caller spoofing), `start_warp` (for timestamp), etc.
    *   Event verification with `spy_events` module.
    *   Revert testing with `#[should_panic]` attribute. 

## 13. Deployment Process

*   **Artifact Preparation:** After building with Scarb, run the fix_artifacts.sh script to create properly named artifacts with correct module paths.
*   **Contract Deployment:** Use Starknet CLI or other deployment tools with the fixed artifacts for proper contract deployment.
*   **Deployment Verification:** Ensure each contract's address is correctly recorded for cross-contract references.
*   **Version Control:** All deployment scripts and artifacts are version-controlled in the GitHub repository at github.com/dragonsarealive/starknet-dev-components-marketplace.

## 14. UI Testing Approach

*   **Component Testing:** Using React Testing Library for component-level testing.
*   **Contract Interaction Testing:** Mocking StarkNet.js and contract interactions for unit testing.
*   **Integration Testing:** Using Cypress or Playwright for end-to-end testing of user workflows.
*   **Wallet Testing:** Testing wallet connection and transaction flows using mock wallets.
*   **Responsive Testing:** Testing UI on different device sizes using responsive testing tools.
*   **Browser Compatibility Testing:** Testing on Brave, Chrome, and Firefox to ensure cross-browser compatibility. 

# Technical Context: Starknet Dev-Components Marketplace

## 1. Technologies Used

### Smart Contract Language & Environment
- **Cairo 1.0**: Type-safe programming language specifically for Starknet
- **Scarb**: Package manager and build tool for Cairo/Starknet development
- **Starknet Foundry (snforge)**: Testing framework for Cairo smart contracts
- **Custom Build Scripts**: Shell scripts for fixing artifacts to enable proper deployment

### Core Libraries
- **Starknet Standard Library**: Core Cairo functionality + Starknet-specific features
- **Starknet Contract Library**: Smart contract primitives, storage, events
- **OpenZeppelin Cairo Contracts**: ERC standards and security features

### Frontend (Planned/Recommended)
- **React**: JavaScript UI library
- **Chakra UI**: Component library for React
- **StarknetKit**: Wallet connection library
- **Starknet.js**: JavaScript library for interacting with Starknet

## 2. Development Setup

### Environment Requirements
- Cairo 1.0 and Scarb installed
- Starknet Foundry installed for testing
- Starknet Command Line Interface (CLI) tools
- Node.js environment for frontend development

### Building
```bash
# Build all contracts
scarb build

# Fix artifacts for deployment
./scripts/fix_artifacts.sh

# Build with json artifacts for ABI generation
scarb build --json-artifacts
```

### Testing (using Starknet Foundry)
```bash
# Run all tests
snforge test

# Run specific test file
snforge test tests/marketplace_subscription_test.cairo
```

## 3. Contract Structure

### Core Contracts
1. **ComponentRegistry** (`src/component_registry.cairo`)
   - Core marketplace functionality
   - Component registration, pricing, purchasing
   - Fee splitting for one-off purchases (80/10/10)
   - Integration with IdentityRegistry

2. **IdentityRegistry** (`src/identity_registry.cairo`)
   - Developer identity tracking
   - Sales and uploads metrics
   - Account verification

3. **MarketplaceSubscription** (`src/marketplace_subscription.cairo`)
   - Manages marketplace-wide subscriptions
   - Tracks component downloads with weighted metrics
   - Implements epoch-based reward distribution (45/45/10)
   - Uses anti-abuse mechanisms with square-root dampening
   - Distributes rewards to component creators based on usage

### Shared Modules
1. **Interfaces** (`src/interfaces.cairo`)
   - External interfaces (ERC20, ComponentRegistry, etc.)
   - Shared data structures (Component, Identity, etc.)

2. **Math Utilities** (`src/math_utils.cairo`)
   - Percentage calculations
   - Basis point validation
   - Square root function for download weights

3. **Types** (`src/types.cairo`)
   - Common data types used across contracts

### Entry Point
- **Library Module** (`src/lib.cairo`)
  - Declares all modules for the project

## 4. Technical Dependencies

### External Contracts
- **ERC20 Token (STRK)**: Used for payments
- **PragmaOracle**: Optional USD price oracle integration

### Technical Constraints
- Gas optimization for Starknet
- Cairo 1.0 language features and limitations
- Component size limits for efficient storage
- Epoch-based reward distribution constraints

## 5. Data Structures

### ComponentRegistry
```cairo
// Component structure
#[derive(Drop, Serde, starknet::Store)]
struct Component {
    id: u64,
    seller: ContractAddress,
    name: felt252,
    description: felt252,
    image_url: felt252,
    // other fields...
}

// Storage
#[storage]
struct Storage {
    components: Map::<u64, Component>,
    next_component_id: u64,
    // other storage variables...
}
```

### IdentityRegistry
```cairo
// Identity structure
#[derive(Drop, Serde, starknet::Store)]
struct Identity {
    id: u64,
    owner: ContractAddress,
    registered_at: u64,
    uploads_count: u64,
    sales_amount_strk: u256,
}

// Storage
#[storage]
struct Storage {
    identities: Map::<u64, Identity>,
    identity_by_address: Map::<ContractAddress, u64>,
    next_identity_id: u64,
    // other storage variables...
}
```

### MarketplaceSubscription
```cairo
// Storage
#[storage]
struct Storage {
    subscription_expiry: Map::<ContractAddress, u64>,
    weighted_dl: Map::<(u64, u128), u128>,
    seen_this_epoch: Map::<(u64, ContractAddress, u128), bool>,
    first_time: Map::<(ContractAddress, u128), bool>,
    reward_pool_strk: u256,
    // other storage variables...
}
```

## 6. Key Functions & Features

### Component Registry
- Component registration and management
- Purchasing with fee distribution
- Integration with Identity Registry
- Download tracking via MarketplaceSubscription

### Identity Registry
- Identity creation and management
- Recording sales and uploads
- Account verification

### MarketplaceSubscription
- `subscribe()` - User subscribes to marketplace with optimized renewal logic
- `record_download()` - Record component download with weighting using optimized storage patterns
- `start_new_epoch()` - Distribute rewards and start new epoch with detailed events
- `is_subscribed()` - Check if a user has active subscription
- Anti-abuse system with first-time bonus and square-root dampening
- Consistent component_id type (u128) matching ComponentRegistry
- Optimized map key ordering for efficient data access
- Safe u256 operations for token calculations

#### Key Implementation Details

The MarketplaceSubscription contract uses several technical optimizations:

```cairo
// Optimized map key ordering
weighted_dl: Map::<(u64, u128), u128>, // (epoch, cid)
seen_this_epoch: Map::<(u64, ContractAddress, u128), bool>, // (epoch, wallet, cid)
first_time: Map::<(ContractAddress, u128), bool>,

// Proper subscription renewal logic
let base = max(now, self.subscription_expiry.read(caller));
let expiry = base + self.epoch_length_secs.read();

// Safe u256 math operations
self.reward_pool_strk.write(uint256_add(self.reward_pool_strk.read(), dev_amount));

// Enhanced reward tracking events
#[derive(Drop, starknet::Event)]
struct RewardPaid {
    component_id: u128,
    seller: ContractAddress,
    amount: u256,
    epoch_id: u64,
}
```

## 7. Math Utilities

### Percentage Calculations
- Safe division for fee calculations
- Basis point validation for fee splits

### Square Root Function
- `sqrt_u128()` - Calculates square root of a u128 number
- Used for download weight dampening in reward distribution
- Gas-optimized implementation for Starknet

### Safe u256 Operations
- `uint256_add()` - Safe addition of two u256 numbers
- `uint256_mul_u16()` - Multiply a u256 by a u16 safely
- `uint256_div_u16()` - Divide a u256 by a u16 safely
- Used throughout MarketplaceSubscription for token operations
- Prevents common math errors and overflows

## 8. Security Features

- Input validation for all functions
- Access control between contracts
- Safe math for arithmetic operations
- Two-step ownership transfer
- Event emission for all state changes
- Anti-abuse mechanisms in reward distribution
- Consistent key ordering in maps to prevent data corruption
- Transparent reward tracking through dedicated events

## 9. Event System

### ComponentRegistry
- ComponentRegistered
- ComponentPurchased
- ComponentUpdated
- OwnershipTransferred

### IdentityRegistry
- IdentityRegistered
- SaleRecorded
- UploadRecorded
- OwnershipTransferred

### MarketplaceSubscription
- Subscribed
- DownloadRecorded
- EpochStarted
- OwnershipTransferred

## 10. Technical Roadmap

### Immediate Next Steps
1. Set up testing infrastructure with Starknet Foundry
2. Create comprehensive test suite for all contracts
3. Integrate contracts with frontend

### Future Technical Enhancements
1. Enhanced analytics for download metrics
2. Tiered subscription models
3. Reputation system based on identity metrics
4. Governance features for treasury management
5. Enhanced anti-abuse mechanisms 

## 14. Developer Subscription Module

### Core Architecture

1. **DevSubscription Contract**
   - Manages developer-specific subscriptions with 30-day duration (2,592,000 seconds)
   - Implements 45/45/10 fee split (Developer/Platform/Liquidity)
   - Tracks subscription expiry per (developer, user) pair
   - Allows developers to set their own subscription prices

2. **Identity Registry Extensions** 
   - New monetization modes (Direct, Marketplace, DevSub, Hybrid)
   - Developer subscription price storage and management
   - APIs for querying and setting monetization preferences

3. **Component Registry Extensions**
   - Component access flags using bitmask system
   - Components can specify eligible access methods (direct purchase, dev subscription, marketplace subscription)

### Technical Implementation

```cairo
// DevSubscription key storage pattern
subscription_expiry: LegacyMap<(u64, ContractAddress), u64> // (devId, user) -> expiry timestamp

// Access flags bitmask system
const BUY: u8 = 1;       // 0b001 - Component available for direct purchase
const DEV_SUB: u8 = 2;   // 0b010 - Available via developer subscription
const MARKET_SUB: u8 = 4; // 0b100 - Available via marketplace subscription
```

### Integration Model

Unlike the marketplace subscription which directly updates on-chain state for downloads, the developer subscription model uses a UI-driven access control system:

1. Component metadata contains access_flags specifying eligible access methods
2. UI checks subscription status against multiple contracts:
   - Direct ownership via ComponentRegistry
   - Marketplace subscription via MarketplaceSubscription
   - Developer subscription via DevSubscription
3. UI enables/disables access based on component's access_flags and user's subscription status

### Fee Distribution

Developer subscriptions implement a 45/45/10 split between:
- 45% to Component Developer
- 45% to Platform Treasury
- 10% to Liquidity Vault

Fees are distributed at subscription time, unlike the epoch-based distribution in the MarketplaceSubscription contract.

### Interface Integration

The new DevSubscription contract exposes an interface that works alongside existing marketplace contracts:

```cairo
#[starknet::interface]
trait IDevSubscription<T> {
    fn subscribe(ref self: T, dev_id: u64);
    fn is_subscribed(self: @T, user: ContractAddress, dev_id: u64) -> bool;
    fn set_price(ref self: T, dev_id: u64, price: Uint256);
}
```

This creates a multi-contract architecture where access control is primarily UI-driven but based on verified on-chain subscription data. 

## CLI Tools & Versioning
- **Starkli**: Version `0.4.1` is installed at `/home/dragonsarealive/.starkli/bin/starkli` within the tool's execution environment. This version is used for all `starkli` commands.
    - Key commands used: `starkli account fetch`, `starkli class-hash`, `starkli declare`.
    - Account JSON configuration is managed using files generated by `starkli account fetch` (e.g., `/home/dragonsarealive/.starkli-configs/sepolia/argentx_sep_fetched.json`).
    - Keystores are V3 JSON files, created via a helper Python script (`create_keystore.py`) that uses `eth-account`.
- **Scarb**: Used for compiling Cairo 1.x contracts. Version specified in `Scarb.toml` is `starknet = ">=2.6.3"` and `cairo-version = "2.6.3"`.

## Shell Environment & Scripting
- Operations are primarily conducted in a WSL (Windows Subsystem for Linux) environment, user `dragonsarealive` for tool execution.
- Bash scripts (e.g., `declare_contracts.sh`, `fix_artifacts.sh`) are used to automate sequences of commands.
- Python 3 (`python3`) is available for helper scripts. `pip3` is used for package management; `--break-system-packages` was required for `eth-account` installation in the global tool Python environment.
- **File Creation Anomaly**: The `edit_file` tool showed inconsistent behavior creating files at absolute paths for the WSL user `dragonsarealive`. Using `run_terminal_cmd` with `echo 'content' > /abs/path/to/file` proved to be a more reliable method for ensuring file creation and content integrity in this context.

## RPC Node
- StarkNet Sepolia Testnet RPC: `https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb` (via Alchemy).

## Deployment Environment (v1.1.0)

The StarkFlux project has been successfully deployed to the Starknet Sepolia testnet. Here are the key technical details:

### Deployed Contract Addresses

1. **IdentityRegistry**:
   - Class Hash: 0x00f181d5e0a1a379fbfa8e539cf6a283613060db381a2126c802f9a4a8d3f6d3
   - Address: 0x07438257cd32d2d858b9f7918de43942564f660880e09471906fe55855603cca
   - Function: Manages developer identities and metrics

2. **ComponentRegistry**:
   - Class Hash: 0x03136f1be5f434a7fd4c357811538e562a7c0b645bdcefee740b44539337c0c6
   - Address: 0x0030e23a1baf9b1bcd695e187bf8b7867c5017341bf871fbf623e4301c4c889a
   - Function: Catalogs components, handles purchases, and access control

3. **DevSubscription**:
   - Class Hash: 0x01aa6fe3392ebcab64fc81410cf7ca4223e3bab972886f5e72a643c71f149615
   - Address: 0x01fd15c8a66acd0451dce8cf4e1fba7c6028e3fa565525e0be0ec0224deb680a
   - Function: Manages developer-specific subscriptions

4. **MarketplaceSubscription**:
   - Class Hash: 0x04fa34f03cc9d2d9e9a99e1907c4ab784f60ccc9cf6c92677fe15195228515b2
   - Address: 0x01fd9d8c71d4f990cad6047178f2703653dad24adb06ac504ff6ce326ce3f820
   - Function: Manages marketplace-wide subscriptions with reward pooling

### Deployment Tools

1. **Starkli v0.4.1**:
   - Used for declaring and deploying contracts
   - Used for configuring and linking contracts post-deployment
   - Installation: `curl -sL https://install.starkli.sh | bash`
   - Update PATH: `export PATH=$PATH:~/.starkli/bin`

2. **Scarb 2.4.3**:
   - Used for building and compiling contracts
   - Creates initial artifacts that need post-processing
   - Installation: `curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh`

3. **fix_artifacts_unix.sh**:
   - Custom script for processing Scarb artifacts
   - Creates properly named artifact files for deployment
   - Fixes module paths in artifacts for correct deployment

### Network Configuration

1. **Sepolia RPC Endpoint**:
   - URL: https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/
   - Provider: Alchemy
   - Used for all Starkli operations

2. **Account and Authentication**:
   - Account Address: 0x0308528603f1e515Cac9E57b3708FdAEe757b08C4636864867479A526a7245Ec
   - Account Type: Argent X (v0.3.0)
   - Keystore Location: ~/.starkli-wallets/argentx_sep/keystore.json
   - Account JSON: ~/.starkli-configs/sepolia/argentx_sep_fetched.json

3. **External Contract Addresses**:
   - STRK Token: 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
   - Pragma Oracle: 0x02a85bd616f912537c50a49a4076db02c00b29b2cdc8a197ce92ed1837fa875b

### Deployment Scripts

1. **fix_artifacts_unix.sh**:
   - Used for creating properly named artifact files
   - Copies files from target/dev/ to target/fixed/ directory
   - Handles renaming and module path corrections

2. **deploy_sepolia.sh**:
   - Main deployment script for declaring and deploying contracts
   - Sets up keystore and account configuration
   - Handles class hash generation
   - Deploys contracts in the correct order
   - Configures contract relationships post-deployment

### Known Technical Challenges

1. **U256 Parameter Formatting**:
   - When using Starkli, u256 parameters require special formatting
   - Format: `u256:{value}` (e.g., `u256:1000000000000000000`)
   - This formatting is not documented in Starkli's help information

2. **Class Hash Generation**:
   - Adding comments alone doesn't change class hashes
   - Adding storage variables reliably creates new class hashes
   - Function signature changes create new class hashes
   - These patterns are documented in systemPatterns.md

3. **DevSubscription Integration**:
   - There is no explicit method to set the DevSubscription address in ComponentRegistry
   - The DevSubscription integrates directly with IdentityRegistry without requiring explicit registration
   - This is an architectural design consideration for future versions 