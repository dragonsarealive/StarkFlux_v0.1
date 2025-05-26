# Project Brief: Starknet Dev-Components Marketplace

## 1. Project Goal

The primary goal is to implement a decentralized marketplace for Starknet developer components. This marketplace will consist of three core, composable Cairo 1.1 smart contracts:

1.  **`ComponentRegistryV2`** (Baseline, Implemented & Compiles): Handles component listings, purchases, and dynamic pricing mechanisms (STRK or USD-based).
2.  **`IdentityRegistry`**: Manages developer identities and tracks their marketplace activity (uploads, sales).
3.  **`MarketplaceSubscription`**: Manages marketplace-wide STRK-based subscription access to eligible components, with pooled rewards distributed based on actual usage.

All contracts must compile with Scarb 2+, expose their ABI using `#[abi(embed_v0)]`, and be deployable and operational on the Starknet Sepolia testnet.

## 2. High-Level Scope & Key Features

### ComponentRegistryV2 (Implemented Baseline)
*   Component registration with metadata (title, reference like IPFS CID/Git URL, seller, pricing).
*   Duplicate reference prevention.
*   STRK and USD pricing modes, with on-chain oracle integration (Pragma) for USD-to-STRK conversion.
*   Component purchasing mechanism with fee split of 80/10/10 (seller/platform/liquidity).
*   Record download API for tracking component usage.
*   Interface for other contracts to query component details.
*   Owner-configurable parameters (oracle, fees, treasury, etc.) with two-step ownership transfer.
*   Events: `ComponentRegistered`, `ComponentPurchased`, plus ownership/fee update events.
*   Access flags system (BUY, DEV_SUB, MKT_SUB, FREE) for flexible monetization.
*   Monetization mode enforcement for developers.

### IdentityRegistry
*   **Purpose**: Map developer addresses to unique IDs; track upload count and cumulative STRK sales; manage monetization modes.
*   **Storage (Key Elements)**: `Identity` struct (`id`, `owner`, `join_timestamp`, `upload_count`, `total_sales_strk`), `next_id`, `id_by_owner` map, `identities` map.
*   **Key API Functions**: `register()`, `get_identity(id)`, `get_id(owner)`, `record_upload(owner)`, `record_sale(owner, amount)`, `set_monetization_mode(mode)`, `get_monetization_mode(owner)`.
*   **Events**: `IdentityRegistered {id, owner}`, `UploadRecorded {id}`, `SaleRecorded {id, amount}`.
*   **Access Control**: `onlyComponentRegistry` guard on `record_upload` and `record_sale`. Owner can set ComponentRegistry address. Two-step ownership transfer.
*   **Error Codes**: `ERR_ALREADY_REGISTERED`, `ERR_NOT_REGISTERED`, `ERR_NOT_COMPONENT_REGISTRY`, `ERR_ZERO_ADDRESS`.

### MarketplaceSubscription (New Market-Wide Approach)
*   **Purpose**: Provide renewable, marketplace-wide subscription access to components flagged with MKT_SUB access flag, with pooled developer rewards based on actual usage.
*   **Storage (Key Elements)**: `subscription_expiry` map, `weighted_dl` map, `seen_this_epoch` map, `reward_pool_strk`, epoch timestamps, `subscription_fee_strk`, and address settings.
*   **Key API Functions**: `subscribe()`, `record_download(user, component_id)`, `start_new_epoch()`, `set_subscription_fee(new_fee)`, `is_subscribed(user)`.
*   **Events**: `Subscribed {user, expiry, price}`, `SubscriptionFeeChanged {old_fee, new_fee}`, `EpochStarted`, `DownloadRecorded`.
*   **Fee Logic**: Fixed 45/45/10 split (developer reward pool/platform/liquidity).
*   **Weight Formula**: +2 for first-ever wallet·component usage, else +1; square-root dampening on payout.
*   **Inter-contract calls**: Checks access flags via `ComponentRegistry.get_component`, checks for FREE components via `ComponentRegistry.is_free`, distributes rewards via STRK transfers.
*   **Access Control**: Public subscribe; admin-only epoch management and fee settings.
*   **Constants**: `EPOCH_LENGTH = 2,592,000s (30d)`, `GRACE_WINDOW = 21,600s (6h)`.

## 3. Revenue Distribution Model

| Revenue type      | Developer | MarketplaceVault| LiquidityVault  |
|-------------------|-----------|-----------------|-----------------|
| One-off licence   | 80%       | 10%             | 10%             |
| Marketplace sub   | 45% (via reward_pool)| 45% | 10%             |
| Developer sub     | 80%       | 10%             | 10%             |
| FREE components   | N/A       | N/A             | N/A             |

## 4. Technical Stack Summary
*   **Language:** Cairo 1.1
*   **Build Tool:** Scarb 2+
*   **Testing:** (Currently removed, was `snforge`)
*   **Target Network:** Starknet Sepolia testnet
*   **ABI:** `#[abi(embed_v0)]`

## 5. Directory Structure
The project workspace (`starknet-dev-components-marketplace`) uses the following structure for Cairo source files:
```
starknet-dev-components-marketplace/
 ├ src/
 │  ├ component_registry_v2.cairo
 │  ├ identity_registry.cairo       
 │  ├ marketplace_subscription.cairo // Replaces subscription_manager.cairo
 │  ├ dev_subscription.cairo       // Developer-specific subscription contract
 │  ├ interfaces.cairo              // Contains all trait definitions
 │  ├ types.cairo                   // Shared structs/enums
 │  ├ math_utils.cairo              // Shared math helper functions
 │  └ lib.cairo                     // Declares modules: interfaces, types, math_utils
 ├ Scarb.toml
 └ README.md 
``` 