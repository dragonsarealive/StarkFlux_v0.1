# Project Brief: Starknet Dev-Components Marketplace

## 1. Project Goal

The primary goal is to implement a decentralized marketplace for Starknet developer components. This marketplace will consist of three core, composable Cairo 1.1 smart contracts:

1.  **`ComponentRegistryV2`** (Baseline, Implemented & Compiles): Handles component listings, purchases, and dynamic pricing mechanisms (STRK or USD-based).
2.  **`IdentityRegistry`**: Manages developer identities and tracks their marketplace activity (uploads, sales).
3.  **`SubscriptionManager`**: Manages STRK-based renewable, time-limited subscription payments for component access, and distributes rewards.

All contracts must compile with Scarb 2+, expose their ABI using `#[abi(embed_v0)]`, and be deployable and operational on the Starknet Sepolia testnet.

## 2. High-Level Scope & Key Features

### ComponentRegistryV2 (Implemented Baseline)
*   Component registration with metadata (title, reference like IPFS CID/Git URL, seller, pricing).
*   Duplicate reference prevention.
*   STRK and USD pricing modes, with on-chain oracle integration (Pragma) for USD-to-STRK conversion.
*   Component purchasing mechanism.
*   Payment splitting logic (`_handle_payment_distribution` for seller, platform treasury, liquidity vault) based on basis points.
*   Interface for other contracts to query component details.
*   Owner-configurable parameters (oracle, fees, treasury, etc.) with two-step ownership transfer.
*   Events: `ComponentRegistered`, `ComponentPurchased`, plus ownership/fee update events.

### IdentityRegistry
*   **Purpose**: Map developer addresses to unique IDs; track upload count and cumulative STRK sales.
*   **Storage (Key Elements)**: `Identity` struct (`id`, `owner`, `join_timestamp`, `upload_count`, `total_sales_strk`), `next_id`, `id_by_owner` map, `identities` map.
*   **Key API Functions**: `register()`, `get_identity(id)`, `get_id(owner)`, `record_upload(owner)`, `record_sale(owner, amount)`.
*   **Events**: `IdentityRegistered {id, owner}`, `UploadRecorded {id}`, `SaleRecorded {id, amount}`.
*   **Access Control**: `onlyComponentRegistry` guard on `record_upload` and `record_sale`. Owner can set ComponentRegistry address. Two-step ownership transfer.
*   **Error Codes**: `ERR_ALREADY_REGISTERED`, `ERR_NOT_REGISTERED`, `ERR_NOT_COMPONENT_REGISTRY`, `ERR_ZERO_ADDRESS`.

### SubscriptionManager
*   **Purpose**: Provide renewable, time-limited access to components flagged `is_subscription_eligible`, using a fee split mechanism cloned from `ComponentRegistryV2`.
*   **Storage (Key Elements)**: `Subscription` struct (`expiry`), `subscriptions` map `(component_id, user) -> Subscription`.
*   **Key API Functions**: `subscribe(component_id, duration_days)`, `renew(component_id, duration_days)`, `cancel(component_id)`, `is_subscribed(user, component_id)`.
*   **Events**: `Subscribed {component_id, user, expiry, price}`, `Renewed {component_id, user, new_expiry}`, `Unsubscribed {component_id, user}`.
*   **Fee Logic**: Clones `_handle_payment_distribution` from `ComponentRegistryV2`.
*   **Inter-contract calls**: Reads price/eligibility from `ComponentRegistryV2`; `transferFrom` STRK; calls `IdentityRegistry.record_sale`.
*   **Access Control**: Public subscribe/renew. Owner-only setters (owner address kept identical to Registry owner). Two-step ownership transfer.
*   **Error Codes**: `ERR_NOT_ELIGIBLE`, `ERR_ALREADY_ACTIVE`, `ERR_EXPIRED`, `ERR_DURATION_ZERO`.


## 3. Technical Stack Summary
*   **Language:** Cairo 1.1
*   **Build Tool:** Scarb 2+
*   **Testing:** (Currently removed, was `snforge`)
*   **Target Network:** Starknet Sepolia testnet
*   **ABI:** `#[abi(embed_v0)]`
*   **Version Control:** Git, GitHub repository at github.com/dragonsarealive/starknet-dev-components-marketplace

## 4. Directory Structure
The project workspace (`starknet-dev-components-marketplace`) uses the following structure for Cairo source files:
```
starknet-dev-components-marketplace/
 ├ src/
 │  ├ component_registry_v2.cairo
 │  ├ identity_registry.cairo       // To be created
 │  ├ subscription_manager.cairo    // To be created
 │  ├ interfaces.cairo              // Contains all trait definitions
 │  ├ types.cairo                   // Shared structs/enums
 │  ├ math_utils.cairo              // Shared math helper functions
 │  └ lib.cairo                     // Declares modules: interfaces, types, math_utils
 ├ Scarb.toml
 ├ README.md
 ├ LICENSE                         // MIT License
 └ .gitignore                      // Standard Cairo/Starknet .gitignore
```

## 5. Repository Access
The complete project is available on GitHub at github.com/dragonsarealive/starknet-dev-components-marketplace. The repository includes:

* All source code for smart contracts
* Build and deployment scripts
* Testing infrastructure
* Documentation
* MIT License for open-source distribution

The repository serves as the definitive source of truth for the project, with all production-ready code maintained in the main branch. 