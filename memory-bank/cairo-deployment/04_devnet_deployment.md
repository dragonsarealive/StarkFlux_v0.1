# 04: Starknet Devnet Deployment (Using Katana)

Deploying contracts to a local development network (devnet) is a crucial first step in the Starknet development workflow. A devnet provides a fast, isolated, and cost-free environment for testing and iteration. **Katana** is a popular, high-performance local Starknet node provided by the Dojo team.

This guide outlines how to deploy contracts to Katana.

## 1. Prerequisites

*   **Scarb:** Your Cairo package manager, used to compile your project (`scarb build`).
*   **Katana:** Installed (usually via `dojoup`).
*   **Deployment Tool:** Starkli or sncast installed and configured.
*   **Compiled Contract:** Your contract's Sierra JSON file (e.g., `target/dev/my_project_MyContract.contract_class.json`).

## 2. Starting Katana

Open your terminal and run the Katana command:

```bash
katana
```

Katana will start and output information, including:

*   **RPC Service Endpoint:** Typically `http://0.0.0.0:5050` or `http://127.0.0.1:5050`. This is the URL your deployment tools will use to communicate with Katana.
*   **Pre-funded Accounts:** Katana automatically creates and funds several accounts for you to use. The output will list these accounts with their addresses and private keys.

**Example Katana Startup Output (Illustrative):**

```
🚀 KATANA - STARKNET DEVNET - RPC RUNNING ON http://0.0.0.0:5050

 ACCOUNTS 
==================

| Account address |  Private key   |
|-----------------|----------------|
| 0x517f...       | 0x1800...      |
| 0x...           | 0x...          |
... (typically 10 accounts)

[Further Katana logs]
```

**Note down one of the account addresses and its corresponding private key.** You will use these as your deployer account on Katana.

## 3. Configuring Deployment Tools for Katana

You need to tell Starkli or sncast to use Katana's RPC endpoint and one of its pre-funded accounts.

### Using Environment Variables (Recommended)

*   **For Starkli:**
    ```bash
    export STARKNET_RPC_URL="http://127.0.0.1:5050" # Or 0.0.0.0:5050
    export STARKNET_ACCOUNT="<YOUR_KATANA_ACCOUNT_ADDRESS_HEX>"
    export STARKNET_PRIVATE_KEY="<YOUR_KATANA_ACCOUNT_PRIVATE_KEY_HEX>" 
    # No keystore file needed when using private key directly with Katana's accounts
    ```

*   **For sncast:**
    ```bash
    export SNCAST_RPC_URL="http://127.0.0.1:5050" # Or 0.0.0.0:5050
    export SNCAST_ACCOUNT="<YOUR_KATANA_ACCOUNT_ADDRESS_HEX>"
    export SNCAST_PRIVATE_KEY="<YOUR_KATANA_ACCOUNT_PRIVATE_KEY_HEX>"
    # sncast can also use a --keystore, but direct private key is common for Katana
    ```
    Replace placeholders with the actual address and private key from Katana's output.

### Using Command-Line Flags

Alternatively, you can pass these details directly in each command (see examples below).

## 4. Declaring and Deploying to Katana

The process is the same as described in `03_deployment_process.md`, but tailored for Katana.

Let's assume:
*   Sierra file: `target/dev/my_project_MyContract.contract_class.json`
*   Contract name (for sncast): `MyContract`
*   Constructor argument: `initial_value = 42`
*   Salt: `0x7E57A70`
*   Your chosen Katana account address: `0xACCOUNT_ADDR`
*   Your chosen Katana private key: `0xPRIVATE_KEY`
*   Scarb/Cairo compiler version: `2.6.3` (check your `Scarb.toml` or `scarb --version`)

### Step 1: Declare Contract Class

**Using Starkli:**

```bash
starkli declare target/dev/my_project_MyContract.contract_class.json \
  --rpc http://127.0.0.1:5050 \
  --account 0xACCOUNT_ADDR \
  --private-key 0xPRIVATE_KEY \
  --compiler-version 2.6.3 \
  --max-fee 0 # Fees are often negligible or zero on Katana
  # --watch # Optional: waits for acceptance
```
*   Note the `Class hash declared: 0x...`

**Using sncast:**

```bash
sncast declare MyContract \
  --url http://127.0.0.1:5050 \
  --account 0xACCOUNT_ADDR \
  --private-key 0xPRIVATE_KEY \
  --max-fee 0 
  # --wait # Optional
```
*   Note the `class_hash: 0x...`

### Step 2: Deploy Contract Instance

Let the declared class hash be `0xCLASS_HASH_EXAMPLE`.

**Using Starkli:**

```bash
starkli deploy 0xCLASS_HASH_EXAMPLE 42 \
  --rpc http://127.0.0.1:5050 \
  --account 0xACCOUNT_ADDR \
  --private-key 0xPRIVATE_KEY \
  --salt 0x7E57A70 \
  --max-fee 0
  # --watch
```
*   Note the `Contract deployed: 0x...` (your new contract address on Katana).

**Using sncast:**

```bash
sncast deploy --class-hash 0xCLASS_HASH_EXAMPLE \
  --constructor-calldata 42 \
  --salt 0x7E57A70 \
  --url http://127.0.0.1:5050 \
  --account 0xACCOUNT_ADDR \
  --private-key 0xPRIVATE_KEY \
  --max-fee 0
  # --wait
```
*   Note the `contract_address: 0x...`

## 5. Benefits of Devnet (Katana)

*   **Speed:** Transactions are processed almost instantly.
*   **Cost-Free:** No real ETH is required for gas fees.
*   **Isolation:** Your local network doesn't affect or depend on public testnets or mainnet.
*   **Easy Reset:** You can easily restart Katana to get a fresh state.
*   **Debugging:** Facilitates easier debugging and iteration during early development stages.

Always start your development and testing on a devnet like Katana before moving to testnets or mainnet. 