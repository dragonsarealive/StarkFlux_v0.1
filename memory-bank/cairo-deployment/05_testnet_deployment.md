# 05: Starknet Testnet Deployment (e.g., Sepolia) - Project Focus: Dev-Components Marketplace

Deploying to a public testnet is a critical phase after local development. It allows you to test your contracts in an environment that closely mimics Starknet Mainnet, interact with other deployed contracts, and share your application for broader testing. This guide focuses on deploying the **Starknet Dev-Components Marketplace** contracts to the **Starknet Sepolia Testnet** using Starkli.

## Version 1.1.0 Update (May 2025)

The project has been updated to version 1.1.0 with significant changes to enable a fresh deployment with new contract classes:

### Key Changes
- All contracts now include version tracking functionality
- Added `get_version()` functions to all interfaces and implementations
- Added storage variables to track contract versions
- Modified contract code to generate new class hashes

### New Class Hashes
- Identity Registry: `0x00f181d5e0a1a379fbfa8e539cf6a283613060db381a2126c802f9a4a8d3f6d3`
- Component Registry: `0x03136f1be5f434a7fd4c357811538e562a7c0b645bdcefee740b44539337c0c6`
- Dev Subscription: `0x01aa6fe3392ebcab64fc81410cf7ca4223e3bab972886f5e72a643c71f149615`
- Marketplace Subscription: `0x04fa34f03cc9d2d9e9a99e1907c4ab784f60ccc9cf6c92677fe15195228515b2`

### Deployment Strategy
The deployment will create completely new contract instances, leaving the previous contracts on-chain. This approach was chosen to avoid potential upgrade issues and provide a clean slate for the application.

For the v1.1.0 deployment, refer to the updated `deploy_sepolia.sh` script and the `starknet_sepolia_deployment_checklist_v1.1.0.md` for detailed steps.

## 1. Prerequisites

*   **Project Compiled:** The `starknet-dev-components-marketplace` project must be compiled using `scarb build`.
*   **`fix_artifacts.sh` Script:** This project uses a custom script `./scripts/fix_artifacts.sh` located in the `starknet-dev-components-marketplace` root directory. This script processes Scarb's output to create deployable artifacts, typically in a `starknet-artifacts/` directory.
*   **Starkli:** The latest version of Starkli installed and accessible in your PATH.
*   **Python with `eth-account`:** Needed for generating the V3 keystore file for Starkli. Install with `pip install eth-account`.
*   **Starknet Sepolia Testnet Account:**
    *   An account address on Sepolia (e.g., from Argent X or Braavos wallet, switched to Sepolia network).
    *   The private key for this account. **NEVER use a mainnet private key for testnet setups if generating keystores this way.**
*   **Funded Account:** The Sepolia account must be funded with Sepolia ETH (from a faucet) and some Sepolia STRK tokens if you intend to test functionalities requiring STRK immediately after deployment.
    *   Sepolia ETH Faucet: [https://starknet-faucet.vercel.app/](https://starknet-faucet.vercel.app/) or [https://www.alchemy.com/faucets/starknet-sepolia](https://www.alchemy.com/faucets/starknet-sepolia)
*   **Sepolia STRK Faucet:** [https://starknet-faucet.vercel.app/](https://starknet-faucet.vercel.app/) (select STRK) or [https://blastapi.io/faucets/starknet-sepolia-strk](https://blastapi.io/faucets/starknet-sepolia-strk)
*   **Sepolia RPC Endpoint URL:** From a provider like Infura, Alchemy, Blast API, or Chainstack.
*   **Starknet Sepolia STRK Token Address:** `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d` (as of May 2025, verify on Starkscan if unsure).

## 2. Setting Up Account Files for Starkli (V3 Keystore Method)

Starkli uses two files for account management with keystores:
    1.  **Starkli Account JSON File:** Contains public information like account address, public key, salt, and class hash of the account contract.
    2.  **V3 Keystore JSON File:** Encrypted private key.

### a. Generate V3 Keystore File

If you have your Sepolia account's private key, you can generate a V3 keystore file using Python:

```python
from eth_account import Account
import json
import os

# --- CONFIGURATION ---
private_key_hex = "0xYOUR_SEPOLIA_ACCOUNT_PRIVATE_KEY"  # Replace with your actual private key
keystore_password = "YOUR_STRONG_PASSWORD"          # Choose a strong password
keystore_filename = "starkli_sepolia_keystore.json"
# --- END CONFIGURATION ---

try:
    private_key_bytes = bytes.fromhex(private_key_hex.replace("0x", ""))
    encrypted_keystore = Account.encrypt(private_key_bytes, keystore_password)
    
    # Save the keystore
    with open(keystore_filename, 'w') as f:
        json.dump(encrypted_keystore, f, indent=2)
    print(f"V3 Keystore saved to: {os.path.abspath(keystore_filename)}")
    print("IMPORTANT: Remember your password and keep this file secure.")

except ValueError as e:
    print(f"Error: Invalid private key format or other value error. {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

```
*   Run this script, replacing `0xYOUR_SEPOLIA_ACCOUNT_PRIVATE_KEY` and `YOUR_STRONG_PASSWORD`.
*   This will create `starkli_sepolia_keystore.json` (or your chosen name). **Keep this file and password secure.**

### b. Create Starkli Account JSON File

You then need a Starkli account JSON file. This file usually has the following structure:

```json
{
  "version": 1,
  "variant": {
    "type": "open_zeppelin", // Or "braavos", "argent" depending on your account
    "version": 1,
    "public_key": "0xYOUR_ACCOUNT_PUBLIC_KEY_HEX", // Get this from your wallet or derive if needed
    // "salt": "0xYOUR_ACCOUNT_SALT_IF_ANY", // Only if your account deployment used a salt
    // "deployment": { ... } // May contain deployment info if Starkli managed the account deployment
  },
  "deployment": {
       "status": "deployed",
       "class_hash": "0xACCOUNT_CLASS_HASH", // e.g., OpenZeppelin Account v0.8.0 class hash on Sepolia
       "address": "0xYOUR_SEPOLIA_ACCOUNT_ADDRESS_HEX"
  }
}
```
*   Replace placeholders with your actual Sepolia account address, its public key, and its class hash.
*   The account class hash depends on your wallet provider (Argent X, Braavos, OpenZeppelin standard). You can find these on Starkscan for your account or in wallet documentation.
    *   Example OZ Account v0.8.0 (Cairo 1): `0x05400e90f7e0ae78bd02c77cd75527280470e2c19c54afe917712b9168728954` (Verify on Sepolia Starkscan for the latest).
*   Save this as, for example, `starkli_sepolia_account.json`.

### c. Set Environment Variables (Recommended)

    ```bash
# In your ~/.bashrc, ~/.zshrc, or for the current session:
    export STARKNET_RPC_URL="<YOUR_SEPOLIA_RPC_URL>"
export STARKLI_ACCOUNT="/path/to/your/starkli_sepolia_account.json"
export STARKLI_KEYSTORE="/path/to/your/starkli_sepolia_keystore.json"
export STARKLI_KEYSTORE_PASSWORD="<YOUR_KEYSTORE_PASSWORD>" # Optional: if not set, Starkli will prompt
```
Source your shell configuration file (e.g., `source ~/.bashrc`) after adding these.

## 3. Build and Prepare Artifacts

Navigate to the root of the `starknet-dev-components-marketplace` project.

```bash
# 1. Compile your contracts
scarb build

# 2. Run the script to fix and prepare artifacts for deployment
./scripts/fix_artifacts.sh
```
This script will create/update Sierra JSON files (e.g., `starknet-artifacts/component_registry_v2.contract_class.json`) and CASM files required for declaration. Verify the output path from the script. For the examples below, we'll assume artifacts are in `starknet-artifacts/`.

## 4. Declare and Deploy Contracts

We will declare and deploy the contracts in an order that respects dependencies.
**Important:**
*   Replace `<YOUR_OWNER_ACCOUNT_ADDRESS_HEX>` with your Sepolia deployer account address. This will be the initial owner for most contracts.
*   Replace `<YOUR_TREASURY_ACCOUNT_ADDRESS_HEX>` and `<YOUR_LIQUIDITY_VAULT_ADDRESS_HEX>` with the designated addresses.
*   The `compiler-version` should match the one used by your `scarb build` (check `Scarb.toml` or `scarb --version`). Example: `2.6.3`.
*   Set `--max-fee` appropriately for Sepolia (e.g., `100000000000000` wei for declare, `500000000000000` for deploy - adjust based on network conditions).
*   `--watch` flag is used to wait for transaction confirmation.
*   Salts are recommended for predictable addresses (`0x<RANDOM_HEX_VALUE>`).

### Contract 1: IdentityRegistry

Constructor args: `owner: ContractAddress`
```bash
# Step 1: Declare IdentityRegistry
IDENTITY_REGISTRY_SIERRA_PATH="starknet-artifacts/identity_registry.contract_class.json"
starkli declare $IDENTITY_REGISTRY_SIERRA_PATH \
  --compiler-version <YOUR_CAIRO_VERSION> \
  --max-fee <FEE_DECLARE> \
  --watch
# Note down the Class Hash: 0xIDENTITY_REGISTRY_CLASS_HASH

# Step 2: Deploy IdentityRegistry
IDENTITY_REGISTRY_CLASS_HASH="0xCLASS_HASH_FROM_DECLARE"
OWNER_ADDRESS="<YOUR_OWNER_ACCOUNT_ADDRESS_HEX>"
SALT_IDENTITY="0x$(openssl rand -hex 4)" # Generate a random salt

starkli deploy $IDENTITY_REGISTRY_CLASS_HASH $OWNER_ADDRESS \
  --salt $SALT_IDENTITY \
  --max-fee <FEE_DEPLOY> \
  --watch
# Note down the Contract Address: 0xIDENTITY_REGISTRY_ADDRESS
```

### Contract 2: ComponentRegistryV2

Constructor args: `owner: ContractAddress, identity_registry_address: ContractAddress, treasury_address: ContractAddress, liquidity_vault_address: ContractAddress`
(Platform/Seller/Liquidity fee BPS are hardcoded in constructor as 1000/8000/1000 for direct purchases)
    ```bash
# Step 1: Declare ComponentRegistryV2
COMPONENT_REGISTRY_SIERRA_PATH="starknet-artifacts/component_registry_v2.contract_class.json"
starkli declare $COMPONENT_REGISTRY_SIERRA_PATH \
  --compiler-version <YOUR_CAIRO_VERSION> \
  --max-fee <FEE_DECLARE> \
  --watch
# Note down the Class Hash: 0xCOMPONENT_REGISTRY_CLASS_HASH

# Step 2: Deploy ComponentRegistryV2
COMPONENT_REGISTRY_CLASS_HASH="0xCLASS_HASH_FROM_DECLARE"
IDENTITY_REGISTRY_ADDRESS="0xADDRESS_FROM_PREVIOUS_STEP"
TREASURY_ADDRESS="<YOUR_TREASURY_ACCOUNT_ADDRESS_HEX>"
LIQUIDITY_VAULT_ADDRESS="<YOUR_LIQUIDITY_VAULT_ADDRESS_HEX>"
SALT_COMPONENT="0x$(openssl rand -hex 4)"

starkli deploy $COMPONENT_REGISTRY_CLASS_HASH $OWNER_ADDRESS $IDENTITY_REGISTRY_ADDRESS $TREASURY_ADDRESS $LIQUIDITY_VAULT_ADDRESS \
  --salt $SALT_COMPONENT \
  --max-fee <FEE_DEPLOY> \
  --watch
# Note down the Contract Address: 0xCOMPONENT_REGISTRY_ADDRESS
```

### Contract 3: MarketplaceSubscription

Constructor args: `owner: ContractAddress, component_registry_address: ContractAddress, identity_registry_address: ContractAddress, strk_token_address: ContractAddress, treasury_address: ContractAddress, liquidity_vault_address: ContractAddress`
(Fee BPS are hardcoded: platform_fee_bps=4500, reward_pool_fee_bps=4500, liquidity_provider_fee_bps=1000)
```bash
# Step 1: Declare MarketplaceSubscription
MARKETPLACE_SUB_SIERRA_PATH="starknet-artifacts/marketplace_subscription.contract_class.json"
starkli declare $MARKETPLACE_SUB_SIERRA_PATH \
  --compiler-version <YOUR_CAIRO_VERSION> \
  --max-fee <FEE_DECLARE> \
  --watch
# Note down the Class Hash: 0xMARKETPLACE_SUB_CLASS_HASH

# Step 2: Deploy MarketplaceSubscription
MARKETPLACE_SUB_CLASS_HASH="0xCLASS_HASH_FROM_DECLARE"
COMPONENT_REGISTRY_ADDRESS="0xADDRESS_FROM_PREVIOUS_STEP"
# IDENTITY_REGISTRY_ADDRESS is already set from deploying IdentityRegistry
STRK_TOKEN_ADDRESS_SEPOLIA="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
SALT_MARKETPLACE="0x$(openssl rand -hex 4)"

starkli deploy $MARKETPLACE_SUB_CLASS_HASH $OWNER_ADDRESS $COMPONENT_REGISTRY_ADDRESS $IDENTITY_REGISTRY_ADDRESS $STRK_TOKEN_ADDRESS_SEPOLIA $TREASURY_ADDRESS $LIQUIDITY_VAULT_ADDRESS \
  --salt $SALT_MARKETPLACE \
  --max-fee <FEE_DEPLOY> \
  --watch
# Note down the Contract Address: 0xMARKETPLACE_SUB_ADDRESS
```

### Contract 4: DevSubscription

Constructor args: `owner: ContractAddress, component_registry_address: ContractAddress, identity_registry_address: ContractAddress, strk_token_address: ContractAddress, treasury_address: ContractAddress, liquidity_vault_address: ContractAddress`
(Fee BPS are hardcoded: developer_fee_bps=8000, platform_fee_bps=1000, liquidity_provider_fee_bps=1000)
```bash
# Step 1: Declare DevSubscription
DEV_SUB_SIERRA_PATH="starknet-artifacts/dev_subscription.contract_class.json"
starkli declare $DEV_SUB_SIERRA_PATH \
  --compiler-version <YOUR_CAIRO_VERSION> \
  --max-fee <FEE_DECLARE> \
  --watch
# Note down the Class Hash: 0xDEV_SUB_CLASS_HASH

# Step 2: Deploy DevSubscription
DEV_SUB_CLASS_HASH="0xCLASS_HASH_FROM_DECLARE"
# COMPONENT_REGISTRY_ADDRESS, IDENTITY_REGISTRY_ADDRESS, STRK_TOKEN_ADDRESS_SEPOLIA, TREASURY_ADDRESS, LIQUIDITY_VAULT_ADDRESS are already set
SALT_DEV="0x$(openssl rand -hex 4)"

starkli deploy $DEV_SUB_CLASS_HASH $OWNER_ADDRESS $COMPONENT_REGISTRY_ADDRESS $IDENTITY_REGISTRY_ADDRESS $STRK_TOKEN_ADDRESS_SEPOLIA $TREASURY_ADDRESS $LIQUIDITY_VAULT_ADDRESS \
  --salt $SALT_DEV \
  --max-fee <FEE_DEPLOY> \
  --watch
# Note down the Contract Address: 0xDEV_SUB_ADDRESS
```

## 5. Post-Deployment Configuration

After all contracts are deployed, you need to link them:
*   Call `set_component_registry_address(component_registry_address)` on `IdentityRegistry` if it was deployed with address 0 or needs updating.
*   Call `set_marketplace_subscription_address(marketplace_subscription_address)` on `ComponentRegistryV2`.
*   Call `set_dev_subscription_address(dev_subscription_address)` on `ComponentRegistryV2`.

These calls are also done using `starkli invoke`, providing the contract address, function name, and arguments.

Example:
```bash
# Set ComponentRegistry address in IdentityRegistry
starkli invoke $IDENTITY_REGISTRY_ADDRESS set_component_registry_address $COMPONENT_REGISTRY_ADDRESS \
  --max-fee <FEE_INVOKE> --watch

# Set MarketplaceSubscription address in ComponentRegistryV2
starkli invoke $COMPONENT_REGISTRY_ADDRESS set_marketplace_subscription_address $MARKETPLACE_SUB_ADDRESS \
  --max-fee <FEE_INVOKE> --watch

# Set DevSubscription address in ComponentRegistryV2
starkli invoke $COMPONENT_REGISTRY_ADDRESS set_dev_subscription_address $DEV_SUB_ADDRESS \
  --max-fee <FEE_INVOKE> --watch
```

## 6. Verifying on Testnet Block Explorer

Once deployed and configured, view your contracts and transactions on a Starknet Sepolia block explorer:
*   **Starkscan:** [https://sepolia.starkscan.co/](https://sepolia.starkscan.co/)
*   **ViewBlock:** [https://viewblock.io/starknet?network=sepolia](https://viewblock.io/starknet?network=sepolia)

Search for your declared class hashes or deployed contract addresses.

## 7. Troubleshooting: Real-World Issues & Solutions (May 2025+)
*   **"MAC mismatch" or password errors with keystore:** Ensure password is correct. Regenerate keystore carefully with `eth-account` using the correct private key (hex string, `0x` prefix, then actual key) and a memorable password.
*   **"account config file not found" / "keystore file not found":** Double-check paths set in `STARKLI_ACCOUNT` and `STARKLI_KEYSTORE` environment variables. Ensure files exist and are readable.
*   **"Invalid params: Invalid transaction query" (or similar RPC errors):** RPC URL might be incorrect, malformed, or your API key limit reached. Verify URL and API key.
*   **"Transaction execution error" / Reverts:**
    *   Check constructor arguments carefully. Types and values must match contract expectations.
    *   Ensure prerequisite addresses (like `IdentityRegistry` address for `ComponentRegistryV2`) are correct.
    *   Contract logic might be reverting due to an unmet `assert` or other condition. Test with `snforge` locally.
*   **"Max fee exceeded" / Stuck transactions:** Increase `--max-fee`. Check Starkscan for current gas prices on Sepolia.
*   **"Compiler version mismatch":** Ensure `--compiler-version` in `starkli declare` matches the Cairo version used by `scarb build` (from `Scarb.toml`).
*   **SSL/TLS errors during Starkli operations:** If on WSL, ensure CA certificates are up to date: `sudo apt update && sudo apt install --reinstall ca-certificates`.

Always start with one contract, ensure it's declared and deployed correctly, then move to the next, noting down class hashes and addresses. Scripting this process is highly recommended for repeatability. 