# Cairo and Starknet Development Environment Overview

## What is Cairo?

Cairo is a programming language designed for creating provable programs, where one party can prove to another that a certain computation was executed correctly without having to re-run the computation or reveal sensitive inputs. It is particularly prominent in the context of STARK-based ZK-rollups, which enhance the scalability and privacy of blockchains.

Cairo's design focuses on efficiency for STARK proof generation, making it suitable for complex computations that can be verified on-chain (like on Ethereum) at a lower cost.

## What is Starknet?

Starknet is a Validity-Rollup (also known as a ZK-Rollup) Layer 2 scaling solution for Ethereum. It operates by bundling thousands of transactions off-chain into a single STARK proof. This proof is then submitted to Ethereum, attesting to the validity of these transactions. This significantly increases transaction throughput and reduces gas fees compared to transacting directly on Ethereum Layer 1, while still inheriting Ethereum's security.

Smart contracts on Starknet are primarily written in Cairo.

## The Ecosystem

The Cairo and Starknet development ecosystem provides a suite of tools to facilitate the entire lifecycle of smart contract development, from writing code to testing, deployment, and interaction. Key components include:

*   **Cairo Language & Compiler:** The core language and the tools to compile it into Sierra (Starknet's intermediate representation).
*   **Package Managers & Build Tools:** For managing dependencies, compiling projects, and running scripts (e.g., Scarb).
*   **Development Frameworks/Toolkits:** For contract testing, deployment, and local development (e.g., Starknet Foundry).
*   **Local Development Nodes:** For simulating the Starknet network locally for rapid testing (e.g., Katana).
*   **Command-Line Interfaces (CLIs):** For interacting with Starknet networks (e.g., Starkli).
*   **Software Development Kits (SDKs):** For building applications that interact with Starknet contracts (e.g., starknet.js, starknet.py).
*   **Wallets & Block Explorers:** For managing assets and inspecting network activity.

This set of documents will guide you through setting up the essential tools for Cairo and Starknet development. 