# Essential Tools for Cairo & Starknet Development

This document outlines the core tools you'll need for developing smart contracts with Cairo on the Starknet platform.

## 1. Scarb

*   **What it is:** Scarb is the official Cairo and Starknet package manager and build tool. It handles dependencies, compiles your Cairo projects, and helps manage project structure.
*   **Why use it:** It standardizes project setup, simplifies dependency management, and provides a consistent way to build and compile Cairo code into Sierra (Starknet Intermediate Representation), which is then compiled to CASM (Cairo Assembly) for execution.
*   **Key Features:**
    *   Dependency management (via `Scarb.toml`)
    *   Project compilation (`scarb build`)
    *   Extensible via plugins
    *   Manages Cairo language versions implicitly.

## 2. Starknet Foundry (snforge & sncast)

*   **What it is:** Starknet Foundry is a blazing-fast toolkit for Starknet contract development, heavily inspired by Ethereum's Foundry. It consists of:
    *   `snforge`: A testing framework for Cairo contracts. Allows you to write tests in Cairo itself.
    *   `sncast`: A command-line tool for interacting with Starknet (deploying contracts, calling functions, querying state). It's an alternative to Starkli for many operations.
*   **Why use it:** `snforge` enables robust and efficient testing of your contracts directly in Cairo, offering features like cheatcodes (e.g., manipulating block numbers, sender addresses). `sncast` provides a powerful CLI for network interactions, often used in scripting and CI/CD pipelines.
*   **Key Features:**
    *   Write tests in Cairo.
    *   Fast execution of tests.
    *   Comprehensive CLI for deployment and interaction (`sncast`).
    *   Manages contract artifacts.

## 3. Katana

*   **What it is:** Katana is a high-performance, local Starknet development node. It simulates a Starknet environment on your machine, allowing for rapid testing and iteration without deploying to a public testnet.
*   **Why use it:** Local development nodes are crucial for quick feedback loops. Katana offers fast transaction processing, pre-funded accounts, and easy state resets, making it ideal for development and testing phases.
*   **Key Features:**
    *   Extremely fast local Starknet instance.
    *   Pre-funded accounts for testing.
    *   RPC interface compatible with tools like Starkli and sncast.
    *   Part of the Dojo engine toolchain but can be used standalone.

## 4. Starkli

*   **What it is:** Starkli is another powerful command-line interface (CLI) for interacting with Starknet. It allows you to send transactions, deploy contracts, call functions, query network status, and manage accounts.
*   **Why use it:** Starkli is a versatile tool for manual interaction with Starknet networks (local, testnet, or mainnet). It's often used for initial deployments, quick tests, and scripting interactions.
*   **Key Features:**
    *   Comprehensive Starknet interaction capabilities.
    *   Account management (creation, deployment).
    *   Contract declaration and deployment.
    *   Function calls and multicalls.
    *   Human-readable output and JSON support.

## 5. Software Development Kits (SDKs)

SDKs are libraries that allow you to interact with Starknet from various programming languages, typically for building dApps (decentralized applications) or scripts.

*   **starknet.js:**
    *   **What it is:** The official JavaScript/TypeScript SDK for Starknet.
    *   **Why use it:** Essential for building web frontends (dApps) that interact with Starknet smart contracts. Also useful for scripting interactions in Node.js environments.
*   **starknet.py:**
    *   **What it is:** The official Python SDK for Starknet.
    *   **Why use it:** Suitable for backend services, scripting, data analysis, and Python-based dApp development that needs to interact with Starknet.

## 6. VS Code Extension for Cairo

*   **What it is:** An official extension for Visual Studio Code provided by StarkWare.
*   **Why use it:** Enhances the development experience by providing syntax highlighting, code completion, error checking, and integration with Scarb.
*   **Key Features:**
    *   Syntax highlighting for `.cairo` files.
    *   Language server support (diagnostics, go to definition, etc.).
    *   Integration with Scarb for building and managing projects. 