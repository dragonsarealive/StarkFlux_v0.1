# StarkFlux Deployment Guide

This guide explains how to deploy the StarkFlux smart contracts to StarkNet.

## Prerequisites

1. **Starkli** - StarkNet CLI tool
   ```bash
   curl https://get.starkli.sh | sh
   ```

2. **Scarb** - Cairo package manager
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
   ```

3. **StarkNet Wallet** - You'll need a funded wallet on your target network

## Building Contracts

1. Navigate to the packages directory:
   ```bash
   cd packages
   ```

2. Build all contracts:
   ```bash
   scarb build
   ```

## Setting Up Your Wallet

1. Create a keystore file:
   ```bash
   starkli signer keystore new /path/to/keystore.json
   ```

2. Create an account descriptor:
   ```bash
   starkli account fetch <YOUR_WALLET_ADDRESS> --output /path/to/account.json
   ```

## Deployment Order

The contracts must be deployed in this specific order due to dependencies:

1. **IdentityRegistry** - No dependencies
2. **ComponentRegistry** - Requires IdentityRegistry address
3. **DevSubscription** - Requires ComponentRegistry address
4. **MarketplaceSubscription** - Requires ComponentRegistry address

## Deploying Contracts

### 1. Deploy IdentityRegistry

```bash
starkli deploy \
    --keystore /path/to/keystore.json \
    --account /path/to/account.json \
    ./target/dev/starkflux_identity_registry.contract_class.json \
    <OWNER_ADDRESS>
```

### 2. Deploy ComponentRegistry

```bash
starkli deploy \
    --keystore /path/to/keystore.json \
    --account /path/to/account.json \
    ./target/dev/starkflux_component_registry.contract_class.json \
    <IDENTITY_REGISTRY_ADDRESS> \
    <OWNER_ADDRESS> \
    <TREASURY_ADDRESS> \
    <LIQUIDITY_VAULT_ADDRESS>
```

### 3. Deploy DevSubscription

```bash
starkli deploy \
    --keystore /path/to/keystore.json \
    --account /path/to/account.json \
    ./target/dev/starkflux_dev_subscription.contract_class.json \
    <COMPONENT_REGISTRY_ADDRESS> \
    <OWNER_ADDRESS> \
    <TREASURY_ADDRESS> \
    <LIQUIDITY_VAULT_ADDRESS>
```

### 4. Deploy MarketplaceSubscription

```bash
starkli deploy \
    --keystore /path/to/keystore.json \
    --account /path/to/account.json \
    ./target/dev/starkflux_marketplace_subscription.contract_class.json \
    <COMPONENT_REGISTRY_ADDRESS> \
    <OWNER_ADDRESS> \
    <TREASURY_ADDRESS> \
    <LIQUIDITY_VAULT_ADDRESS>
```

## Post-Deployment Configuration

After deploying all contracts, you need to configure the ComponentRegistry:

```bash
# Set DevSubscription address
starkli invoke \
    --keystore /path/to/keystore.json \
    --account /path/to/account.json \
    <COMPONENT_REGISTRY_ADDRESS> \
    set_dev_subscription_address \
    <DEV_SUBSCRIPTION_ADDRESS>

# Set MarketplaceSubscription address
starkli invoke \
    --keystore /path/to/keystore.json \
    --account /path/to/account.json \
    <COMPONENT_REGISTRY_ADDRESS> \
    set_marketplace_subscription_address \
    <MARKETPLACE_SUBSCRIPTION_ADDRESS>
```

## Network-Specific Information

### Sepolia Testnet
- RPC URL: `https://starknet-sepolia.public.blastapi.io`
- Chain ID: `0x534e5f5345504f4c4941`
- STRK Token: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`

### Mainnet
- RPC URL: `https://starknet-mainnet.public.blastapi.io`
- Chain ID: `0x534e5f4d41494e`
- STRK Token: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`

## Verification

After deployment, verify your contracts are working:

1. Check contract deployment:
   ```bash
   starkli call <CONTRACT_ADDRESS> get_owner
   ```

2. For ComponentRegistry, verify the linked contracts:
   ```bash
   starkli call <COMPONENT_REGISTRY_ADDRESS> get_identity_registry
   starkli call <COMPONENT_REGISTRY_ADDRESS> get_dev_subscription_address
   starkli call <COMPONENT_REGISTRY_ADDRESS> get_marketplace_subscription_address
   ```

## Important Notes

- Always deploy to testnet first
- Keep your deployment addresses safe
- The owner address will have admin privileges
- Treasury and liquidity vault addresses receive platform fees
- Make sure all addresses are valid StarkNet addresses before deployment 