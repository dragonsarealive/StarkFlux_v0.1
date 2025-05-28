# 03: Step-by-Step Starknet Deployment Process

This guide outlines the practical steps to declare and deploy a Starknet smart contract using CLI tools like Starkli or sncast.

## Prerequisites

1.  **Compiled Contract (Sierra):** Your Cairo contract code must be compiled using `scarb build`. This will produce a Sierra JSON file (e.g., `target/dev/my_project_MyContract.contract_class.json`).
    *   **Project Specific:** For the `starknet-dev-components-marketplace` project, after `scarb build`, you **must** run the `./scripts/fix_artifacts.sh` script. This script corrects the generated artifacts and places them (usually in `starknet-artifacts/`) in the format expected by deployment tools like Starkli. Use these corrected artifacts for declaration.
2.  **Starknet Account:** You need a funded Starknet account to pay for declaration and deployment fees.
    *   **Local (Katana):** Katana usually provides pre-funded accounts. You'll need their address and private key.
    *   **Testnet (e.g., Sepolia):** Create an account using a wallet like Argent X or Braavos. Fund it with Sepolia ETH from a faucet (e.g., [https://faucet.sepolia.starknet.io/](https://faucet.sepolia.starknet.io/)). Export or retrieve your account details (address, private key, or setup for keystore usage with tools).
    *   **Mainnet:** Use a funded mainnet Starknet account.
3.  **RPC Endpoint URL:** The URL of the Starknet node you want to interact with.
    *   **Katana (default):** `http://0.0.0.0:5050` or `http://127.0.0.1:5050`
    *   **Sepolia Testnet:** Obtain from an RPC provider like Infura, Alchemy, Chainstack, Blast API, etc.
    *   **Mainnet:** Obtain from an RPC provider.
4.  **Deployment Tool:** Starkli or sncast installed and configured.

## Account Setup for Deployment Tools

Both Starkli and sncast need access to your deployer account's credentials to sign transactions. Common methods include:

*   **Environment Variables (Recommended for scripting/CI):**
    *   **Starkli:**
        ```bash
        export STARKNET_RPC_URL="<YOUR_RPC_URL>"
        export STARKNET_ACCOUNT="<PATH_TO_ACCOUNT_JSON_FILE_OR_ADDRESS>"
        export STARKNET_KEYSTORE="<PATH_TO_V3_KEYSTORE_JSON_FILE>"
        export STARKNET_KEYSTORE_PASSWORD="<YOUR_KEYSTORE_PASSWORD>" # Optional, otherwise prompted
        # OR for direct private key (less secure, for local devnets like Katana):
        # export STARKNET_PRIVATE_KEY="<0xYOUR_PRIVATE_KEY_HEX>"
        ```
        *Note on Starkli Keystore:* For Sepolia/Mainnet, Starkli usually expects a V3 JSON keystore (see `05_testnet_deployment.md` for more on generation with `eth-account`).
    *   **sncast:**
        ```bash
        export SNCAST_RPC_URL="<YOUR_RPC_URL>"
        # Using sncast's accounts file:
        export SNCAST_ACCOUNTS_FILE="~/.starknet_accounts/starknet_open_zeppelin_accounts.json" # Example path
        export SNCAST_ACCOUNT="my_account_name_in_file"
        # OR for direct private key/address:
        # export SNCAST_PRIVATE_KEY="<0xYOUR_PRIVATE_KEY_HEX>"
        # export SNCAST_ACCOUNT="<0xYOUR_ACCOUNT_ADDRESS_HEX>"
        # export SNCAST_KEYSTORE="<PATH_TO_KEYSTORE_JSON_FILE>"
        ```
*   **Command-Line Flags:** Pass RPC URL, account, and keystore/private key directly as options to each command (more verbose, shown in examples below).
*   **Tool-Specific Account Files:**
    *   `sncast` uses an accounts file (often `starknet_open_zeppelin_accounts.json` format) to manage multiple named accounts.
    *   Starkli can also use an account JSON file (different format from sncast's) and a corresponding keystore file.

Refer to the Starkli Book and Starknet Foundry Book for detailed account management instructions.

## Deployment Steps (Example using a hypothetical contract)

Let's assume:
*   Your Scarb project is `my_counter_project`.
*   Your contract module is `MyCounter`.
*   `scarb build` produced `target/dev/my_counter_project_MyCounter.contract_class.json`.
*   **Marketplace Project Specific:** You then run `./scripts/fix_artifacts.sh`. This creates, for example, `starknet-artifacts/my_counter_project_MyCounter.contract_class.json` (actual path may vary based on script output).
*   The constructor is `fn constructor(ref self: ContractState, initial_value: u128)`. We want `initial_value = 10`.
*   We choose a salt: `0x12345`.

### Step 0: Build and Fix Artifacts (Project Specific)

```bash
# 1. Compile your contracts
scarb build

# 2. Run the script to fix and prepare artifacts for deployment
./scripts/fix_artifacts.sh 
# This will typically create/update files in a directory like starknet-artifacts/
```

### Step 1: Declare the Contract Class

**Using Starkli:**

```bash
starkli declare starknet-artifacts/my_counter_project_MyCounter.contract_class.json \
  --rpc <YOUR_RPC_URL> \
  --account <PATH_TO_YOUR_ACCOUNT_FILE_OR_ADDRESS> \
  --keystore <PATH_TO_YOUR_V3_KEYSTORE_FILE> \
  # Or --private-key <YOUR_PRIVATE_KEY> if not using keystore (e.g. Katana)
  --compiler-version <YOUR_SCARB_CAIRO_VERSION> \
  --max-fee <MAX_FEE_AMOUNT_WEI> \
  --watch
```
*   Replace placeholders with your actual values.
*   `<YOUR_SCARB_CAIRO_VERSION>` can usually be found in your `Scarb.toml` or by checking your Scarb version.
*   Note the `class_hash` from the output (e.g., `Class hash declared: 0x...`).

**Using sncast:**

```bash
sncast declare MyCounter \
  # Potentially point to fixed artifact: --contract-class-path starknet-artifacts/my_counter_project_MyCounter.contract_class.json
  --url <YOUR_RPC_URL> \
  --account <YOUR_ACCOUNT_NAME_OR_ADDRESS> \
  # --accounts-file <PATH_IF_NOT_DEFAULT_OR_ENV_VAR> \
  # --private-key <YOUR_PRIVATE_KEY_IF_NOT_USING_ACCOUNTS_FILE> \
  # --keystore <PATH_TO_KEYSTORE_IF_USING_KEYSTORE> \
  --max-fee <MAX_FEE_AMOUNT_WEI> \
  --wait
```
*   Note the `class_hash` from the output.

### Step 2: Deploy the Contract Instance

Let's say the declared `class_hash` is `0xCLASS_HASH_EXAMPLE`.
Constructor arguments: `initial_value = 10` (as `u128`).
Salt: `0x12345`.

**Using Starkli:**

```bash
starkli deploy 0xCLASS_HASH_EXAMPLE 10 \
  --rpc <YOUR_RPC_URL> \
  --account <PATH_TO_YOUR_ACCOUNT_FILE_OR_ADDRESS> \
  --keystore <PATH_TO_YOUR_KEYSTORE_FILE_IF_USING_ACCOUNT_FILE> \
  # Or --private-key <YOUR_PRIVATE_KEY>
  --salt 0x12345 \
  --max-fee <MAX_FEE_AMOUNT_WEI> \
  --watch
```
*   Note the `Contract deployed: 0x...` (the new contract address).

**Using sncast:**

```bash
sncast deploy --class-hash 0xCLASS_HASH_EXAMPLE \
  --constructor-calldata 10 \
  --salt 0x12345 \
  --url <YOUR_RPC_URL> \
  --account <YOUR_ACCOUNT_NAME_OR_ADDRESS> \
  # --accounts-file <PATH_IF_NOT_DEFAULT_OR_ENV_VAR> \
  # --private-key <YOUR_PRIVATE_KEY_IF_NOT_USING_ACCOUNTS_FILE> \
  # --keystore <PATH_TO_KEYSTORE_IF_USING_KEYSTORE> \
  --max-fee <MAX_FEE_AMOUNT_WEI> \
  --wait
```
*   Note the `contract_address` from the output.

## Network-Specific Notes

*   **Local (Katana):**
    *   Use Katana's RPC: `http://127.0.0.1:5050`.
    *   Use one of Katana's pre-funded account addresses and private keys directly with the `--private-key` and relevant account address flags.
    *   `max-fee` can often be set to a low value or might not be strictly necessary if Katana is configured not to charge fees.
*   **Testnet (e.g., Sepolia):**
    *   Ensure your deployer account has Sepolia ETH.
    *   Use a valid Sepolia RPC URL.
    *   Set a reasonable `--max-fee`. Check current network conditions or use tool defaults if sensible.
*   **Mainnet:**
    *   **CRITICAL:** Use your mainnet account and a mainnet RPC URL.
    *   **CRITICAL:** Ensure your account has sufficient **real ETH** for fees. Fees can be substantial.
    *   **CRITICAL:** Double-check all parameters (class hash, constructor args, salt, RPC URL, account) before sending transactions. Mainnet deployments are irreversible.
    *   Set an appropriate `--max-fee` based on current mainnet gas prices.

## Important Considerations

*   **Max Fee:** Setting an appropriate `max-fee` is important. Too low, and your transaction may get stuck or fail. Too high, and you might overpay if the tool doesn't optimize. Some tools might have fee estimation features.
*   **Idempotency:** Using a `salt` makes your deployment idempotent. If you run the same `deploy` command with the same class hash, constructor arguments, and salt from the same deployer, it will result in the same contract address. If the contract is already deployed at that address, the transaction might fail (or succeed without re-deploying, depending on the network/tool behavior for already deployed UDC-deployed contracts).
*   **Transaction Hash & Monitoring:** Both declaration and deployment are transactions. The tools will output a transaction hash. You can use this hash to monitor the transaction status on a block explorer (e.g., StarkScan, Viewblock).
*   **Error Messages:** Pay close attention to any error messages from the tools. They often provide clues about missing arguments, incorrect account setup, insufficient funds, or network issues.

Always test your deployment process thoroughly on a local node and then a testnet before attempting mainnet deployment. 