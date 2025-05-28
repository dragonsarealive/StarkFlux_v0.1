# Product Context: Starknet Dev-Components Marketplace

## 1. Problem Statement

Starknet developers currently lack a centralized, on-chain marketplace specifically designed for discovering, buying, and selling reusable Cairo components (e.g., libraries, contracts, utilities). This fragmentation can lead to:

*   Difficulty in finding quality, audited Starknet development components.
*   Redundant effort in re-implementing common functionalities.
*   Limited avenues for skilled Cairo developers to monetize their reusable code components directly within the Starknet ecosystem.
*   Lack of a transparent, on-chain system for tracking developer reputation based on component quality and sales.
*   No straightforward mechanism for subscription-based access to a pool of developer components with rewards for contributors.

## 2. Proposed Solution: A Composable Marketplace

The Starknet Dev-Components Marketplace aims to address these problems by providing a suite of three interconnected smart contracts:

1.  **`ComponentRegistryV2`**: Enables developers (sellers) to list their Cairo components via `register_component()` with detailed metadata, including a reference (IPFS CID, Git URL), title, and flexible pricing (fixed STRK or USD-pegged via oracle). Buyers can browse and purchase these components directly using `purchase_component()`.
2.  **`IdentityRegistry`**: Establishes an on-chain identity and reputation system for developers. Developers can `register()` to get a unique ID. Reputation is built based on verifiable actions such as component uploads (tracked via `record_upload()`) and successful sales (tracked via `record_sale()`), fostering trust within the marketplace. Users can query identity details using `get_identity()` or `get_id()`.
3.  **`SubscriptionManager`**: Offers a subscription model where users `subscribe()` or `renew()` by paying a recurring STRK fee for time-limited access to a range of eligible components. A portion of these fees contributes to a developer pool, which is then distributed to component creators based on the usage/access of their listed components within the subscription period. Users can `cancel()` subscriptions and check status with `is_subscribed()`.

This system provides a transparent, decentralized, and economically incentivized platform for the exchange and utilization of Starknet developer components.

## 3. Target Users & Roles

*   **Component Sellers (Developers):** Cairo developers who create reusable Starknet components and wish to list them for sale or inclusion in the subscription pool.
    *   *Needs:* Easy listing process (via `ComponentRegistryV2.register_component()`), fair monetization, reputation building (via `IdentityRegistry` tracking `record_upload` and `record_sale`), transparent payout mechanisms.
*   **Component Buyers (Developers/Teams):** Developers or teams looking for pre-built, potentially audited Cairo components to accelerate their Starknet project development.
    *   *Needs:* Reliable component discovery, clear pricing (viewable via `ComponentRegistryV2.get_current_price_strk()`), assurance of component utility (via `IdentityRegistry` reputation), secure purchase process (via `ComponentRegistryV2.purchase_component()`).
*   **Subscribers (Developers/Teams):** Users who prefer access to a broader range of components through a recurring subscription fee rather than individual purchases.
    *   *Needs:* Cost-effective access to multiple components (via `SubscriptionManager.subscribe()`), clear understanding of subscription benefits (`is_subscribed()`) and eligible items.
*   **Platform Owner/Operator:** The entity deploying and maintaining the marketplace contracts.
    *   *Needs:* Sustainable platform revenue (via platform fees set by owner), ability to manage core settings (fees, authorized contracts, oracle addresses via owner-only functions in each contract).

## 4. User Experience Goals (Implied from Specifications)

*   **Discoverability:** Users should be able to easily find and assess available components (e.g., via `ComponentRegistryV2.get_component()`).
*   **Transparency:** Pricing, developer reputation (`IdentityRegistry.get_identity()`), and transaction history (purchases, distributions) should be transparent and verifiable on-chain through events like `ComponentPurchased`, `SaleRecorded`, `Subscribed`.
*   **Trust:** The reputation system and clear component references (IPFS/Git) should help build trust between buyers and sellers.
*   **Flexibility:** Offering both direct purchase (STRK/USD) and subscription models caters to different user needs.
*   **Fairness:** Automated and transparent fee distribution for sales and subscription rewards ensures fairness for all participants, using a cloned fee helper logic.
*   **Security:** Transactions should be secure, and contracts should be robust against common vulnerabilities, employing patterns like two-step ownership.
*   **Composability:** The contracts are designed to work together seamlessly, providing a cohesive user experience across different marketplace functions, as illustrated in the inter-contract sequence diagram. 

## 5. Project Availability & Accessibility

*   **Source Code Access:** The complete codebase is available on GitHub at github.com/dragonsarealive/starknet-dev-components-marketplace under an MIT license, allowing for open review, contribution, and usage.
*   **Documentation:** Comprehensive documentation including requirements, architecture patterns, and system design is maintained in the repository.
*   **Build & Deployment Tools:** Helper scripts for building and fixing artifacts are included in the scripts/ directory.
*   **Testing Resources:** Test files and utilities are organized in the tests/ directory.
*   **Community Collaboration:** The open-source repository enables community contributions and improvements, fostering a collaborative development environment.
*   **Version Control:** All development history and changes are tracked through the GitHub repository, providing transparency and accountability. 