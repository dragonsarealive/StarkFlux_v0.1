# 06: Starknet Mainnet Deployment - Critical Considerations

Deploying a smart contract to Starknet Mainnet is a significant step, as it involves real assets and immutable public records. This process demands meticulous preparation, thorough testing, and a deep understanding of the associated risks and responsibilities.

**This guide is not exhaustive financial or security advice but highlights critical technical considerations.**

## 1. Absolute Prerequisites – DO NOT SKIP

Before even attempting a mainnet deployment, ensure the following are completed to the highest standard:

*   **Exhaustive Testing:**
    *   Comprehensive unit tests for all contract logic (`snforge` or similar).
    *   Extensive integration tests, including interactions with other potential contracts.
    *   Thorough deployment and interaction testing on a public testnet (e.g., Sepolia) that mirrors mainnet conditions as closely as possible.
    *   Consider edge cases, failure modes, and security exploits.
*   **Code Audits (Highly Recommended for Valuable Assets):**
    *   For contracts handling significant value or complex logic, obtain one or more independent security audits from reputable firms specializing in Cairo/Starknet.
    *   Address all critical and high-severity findings from audits.
*   **Understanding Gas Costs:**
    *   Be aware that mainnet transaction fees (for declaration and deployment) are paid in real ETH and can be substantial, depending on network congestion and contract complexity.
    *   Estimate potential costs and ensure your deployer account has sufficient funds.
*   **Secure Key Management:**
    *   The private key for your mainnet deployer account must be secured with the utmost care. Compromise of this key means loss of control over the account and any contracts it owns or has special privileges on.
    *   **NEVER** use private keys directly in scripts or expose them in plaintext for mainnet operations. Utilize secure V3 JSON keystore files (generated via `eth-account`, same method as for testnet but with a mainnet private key and NEW, STRONG password), hardware wallets (if supported by tools for deployment), or robust environment variable management with strict access controls.
    *   Your Starkli account JSON file (with address, public key etc.) should also be managed securely.
    *   Consider using a fresh, dedicated account for deployments that will hold minimal ETH beyond what's needed for deployment fees, or use a multi-sig setup for deploying high-value contracts if your deployment strategy allows.
*   **Final Code Review:**
    *   Perform a final, careful review of the exact contract code version you intend to deploy (i.e., the specific Sierra JSON files that will be produced by `scarb build` and subsequently processed by `./scripts/fix_artifacts.sh`).
    *   Ensure all configurations and initial parameters are correct.

## 2. Mainnet Account and Funding

*   **Dedicated Mainnet Account:** Use a Starknet account intended for Mainnet.
*   **Funding with Real ETH:** Your deployer account must be funded with sufficient real ETH to cover declaration and deployment fees. You can bridge ETH from Ethereum L1 to Starknet L2 using an official bridge like **StarkGate** ([https://starkgate.starknet.io/](https://starkgate.starknet.io/)) or acquire ETH on L2 via exchanges that support Starknet withdrawals.

## 3. Mainnet RPC Endpoint

You will need a reliable RPC URL for the Starknet Mainnet. Providers like Infura, Alchemy, Blast API, Chainstack, etc., offer mainnet RPC endpoints, often requiring an API key.

Example:
*   `https://starknet-mainnet.blastapi.io/YOUR_API_KEY`
*   `https://starknet-mainnet.infura.io/v3/YOUR_API_KEY`

## 4. Configuring Deployment Tools for Mainnet

This is similar to testnet but with mainnet-specific details and heightened security for account credentials.

*   **For Starkli (using secure account/keystore files):**
    ```bash
    export STARKNET_RPC_URL="<YOUR_MAINNET_RPC_URL>"
    export STARKLI_ACCOUNT="/path/to/your/secure/starkli_mainnet_account.json"
    export STARKLI_KEYSTORE="/path/to/your/secure/starkli_mainnet_v3_keystore.json"
    export STARKLI_KEYSTORE_PASSWORD="<YOUR_MAINNET_KEYSTORE_PASSWORD>" # Strongly recommend setting via prompt if not in a secure env
    ```
    Ensure these files are stored securely and have appropriate permissions.

*   **For sncast (using a secure accounts file):**
    ```bash
    export SNCAST_RPC_URL="<YOUR_MAINNET_RPC_URL>"
    export SNCAST_ACCOUNTS_FILE="~/.starknet_accounts/my_mainnet_secure_accounts.json"
    export SNCAST_ACCOUNT="my_mainnet_deployer_name"
    ```
    Protect this accounts file diligently.

**NEVER hardcode mainnet private keys directly into CLI commands or scripts.**

## 5. The Deployment Process: Extreme Caution

The commands are structurally identical to testnet, but every parameter and every step must be **double-checked and triple-checked**.

*   **Correct Sierra File:** Ensure you are using the exact, audited, and final version of your `*.contract_class.json` file from the `starknet-artifacts/` directory (or equivalent output from `./scripts/fix_artifacts.sh` if the path differs).
*   **Correct Compiler Version:** Specify the exact compiler version used to build the Sierra file (check `Scarb.toml` or `scarb --version`).
*   **Constructor Arguments:** Verify every constructor argument meticulously. Incorrect values can lead to a misconfigured or non-functional contract.
*   **Salt (if used):** Confirm the salt if you need a predictable address.
*   **Max Fee:** Set an appropriate `--max-fee` based on current mainnet gas prices. Check Starknet block explorers for recent transaction fees as a guide. Setting it too low will cause the transaction to fail or get stuck; setting it excessively high could lead to overpayment if the network is less congested than anticipated (though tools often use the `max_fee` as a ceiling).

**Example (Starkli Declare):**
```bash
starkli declare starknet-artifacts/my_final_audited_contract.contract_class.json \
  --compiler-version <CORRECT_COMPILER_VERSION> \
  --max-fee <CAREFULLY_CALCULATED_MAX_FEE_WEI> \
  --watch
  # Assumes secure environment variables for RPC, account, keystore, and password are set
```

**Example (Starkli Deploy):**
```bash
starkli deploy <CLASS_HASH_FROM_MAINNET_DECLARE> <CONSTRUCTOR_ARGS...> \
  --salt <YOUR_SALT_IF_ANY> \
  --max-fee <CAREFULLY_CALCULATED_MAX_FEE_WEI> \
  --watch
  # Assumes secure environment variables for RPC, account, keystore, and password are set
```

**Before hitting enter on any mainnet transaction, pause and verify all details one last time.**

## 6. Post-Deployment Verification

Once the transactions are confirmed:

*   **Block Explorer:** Immediately verify your contract's declaration and deployment on a mainnet block explorer like:
    *   **Starkscan:** [https://starkscan.co/](https://starkscan.co/) (Switch to Mainnet)
    *   **ViewBlock:** [https://viewblock.io/starknet](https://viewblock.io/starknet) (Switch to Mainnet)
*   **Verify Class Hash and Contract Address:** Ensure they match your expectations.
*   **Initial Interaction:** Perform a few simple read calls (if applicable) to confirm the contract is responding as expected with the correct initial state.
*   **Source Code Verification (if available):** Some block explorers offer source code verification. If so, upload your source code so users can verify the deployed bytecode matches your published code. This builds trust.

## 7. Monitoring and Maintenance

*   Deployment is not the end. Plan for ongoing monitoring of your contract, especially if it involves user funds or critical operations.
*   Have a plan for addressing any issues that may arise post-deployment (though upgrades for Cairo contracts have their own complexities and patterns, e.g., via proxies).

Deploying to Starknet Mainnet is a serious undertaking. Prioritize security, thoroughness, and caution at every step. If in doubt, seek advice from experienced Starknet developers or security professionals. 