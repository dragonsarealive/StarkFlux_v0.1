# 02: Starknet Deployment Tools

While various tools and scripts can be built around the deployment process, the two primary command-line interface (CLI) tools provided by the Starknet ecosystem for direct contract declaration and deployment are **Starkli** and **sncast** (part of Starknet Foundry).

## Scarb: The Build Tool

Before any deployment tool can be used, **Scarb** plays the crucial first role:

*   **Compilation:** `scarb build` compiles your Cairo source code into Sierra (e.g., `my_contract.contract_class.json`). This Sierra file is the artifact you provide to the deployment tools for class declaration.
*   **ABI Generation:** Scarb also generates the contract's ABI (Application Binary Interface), which is used by tools to understand how to interact with your contract (e.g., formatting constructor arguments or function calls).

## 1. Starkli

Starkli is a powerful and versatile CLI for interacting with Starknet. It's widely used for development, scripting, and querying the network.

**Important Note on Keystores for Starkli (especially with Sepolia/Mainnet):**
For interactions with newer Starknet networks like Sepolia or Mainnet, Starkli typically requires an Ethereum V3 keystore file for account management. This keystore file is a JSON file encrypted with a password, containing your private key.
*   **Generation:** You can generate a V3 keystore file using Python's `eth-account` library. A common approach involves using `Account.encrypt(private_key, password)`. Ensure your private key is in bytes format (e.g., `bytes.fromhex('0x...')`).
*   **Usage:** You then provide the path to this V3 keystore file via the `--keystore` flag and are prompted for the password, or set it via `STARKNET_KEYSTORE_PASSWORD` environment variable. The associated Starknet account JSON file (usually containing the address, public key, and salt) is provided via the `--account` flag.

### Key Starkli Deployment Commands:

*   **`starkli declare <PATH_TO_SIERRA_JSON> [OPTIONS]`**
    *   Declares a contract class on Starknet.
    *   `<PATH_TO_SIERRA_JSON>` is the path to the compiled Sierra file from `scarb build`. For this project, ensure you use the artifacts generated/corrected by the `./scripts/fix_artifacts.sh` script (see below).
    *   **Common Options:**
        *   `--rpc <RPC_URL>`: Specifies the Starknet RPC endpoint (e.g., for Sepolia testnet, mainnet, or a local Katana node).
        *   `--account <PATH_TO_ACCOUNT_FILE>`: Path to the Starknet account JSON file (deployer account, often containing address, public key, variant type, and salt).
        *   `--keystore <PATH_TO_KEYSTORE_FILE>`: Path to the V3 keystore JSON file for signing (associated with the account file).
        *   `--private-key <PRIVATE_KEY_HEX>`: Directly provide the private key (less secure, mainly for local dev or ephemeral accounts like Katana's default).
        *   `--compiler-version <VERSION>`: Specifies the Cairo compiler version used (important for compatibility).
        *   `--max-fee <FEE_IN_WEI>`: Sets the maximum transaction fee.
        *   `--watch`: Waits for the transaction to be accepted on L2.
    *   **Output:** Returns the `class_hash` of the declared contract.

*   **`starkli deploy <CLASS_HASH> [CONSTRUCTOR_ARGS...] [OPTIONS]`**
    *   Deploys an instance of a previously declared contract class.
    *   `<CLASS_HASH>` is the hash obtained from `starkli declare`.
    *   `[CONSTRUCTOR_ARGS...]` are the arguments for your contract's constructor, space-separated.
    *   **Common Options:** (Many are similar to `declare`)
        *   `--rpc`, `--account`, `--keystore`, `--private-key`, `--max-fee`, `--watch`.
        *   `--salt <SALT_VALUE>`: A hex value used to ensure a predictable contract address.
    *   **Output:** Returns the `contract_address` of the deployed instance.

### Starkli Resources:

*   **Starkli Book:** [https://book.starkli.rs/](https://book.starkli.rs/)
*   Installation: Typically via `starkliup`.

**Project-Specific Build Step: `fix_artifacts.sh`**
Note that for the `starknet-dev-components-marketplace` project, there's a custom script: `./scripts/fix_artifacts.sh`.
*   **Purpose:** This script is run *after* `scarb build`. It processes the initially compiled Sierra files and their corresponding CASM files, renaming them and creating correctly structured `starknet_artifacts.json` files for each contract. This is necessary to resolve issues with Scarb's default artifact generation where all contracts might incorrectly reference a single module path.
*   **Workflow:**
    1.  `scarb build`
    2.  `./scripts/fix_artifacts.sh`
    3.  Use the artifacts from the `starknet-artifacts/` directory (or as specified by the script's output) for `starkli declare`.

## 2. sncast (Starknet Foundry)

sncast is the CLI tool bundled with Starknet Foundry, designed for interacting with Starknet, including contract deployment. It offers a user experience similar to Foundry's `cast` on Ethereum.

### Key sncast Deployment Commands:

*   **`sncast declare <CONTRACT_NAME> [OPTIONS]`**
    *   Declares a contract class. `sncast` can often find the compiled artifact if run from the root of a Scarb project.
    *   `<CONTRACT_NAME>` is the name of your contract as defined in `Scarb.toml` or your Cairo files.
    *   **Common Options:**
        *   `--url <RPC_URL>`: Specifies the Starknet RPC endpoint.
        *   `--accounts-file <PATH_TO_ACCOUNTS_FILE>`: Path to sncast's accounts JSON file.
        *   `--account <ACCOUNT_NAME_OR_ADDRESS>`: Name of the account (from accounts file) or its address.
        *   `--private-key <PRIVATE_KEY_HEX>`: Directly provide the private key.
        *   `--keystore <PATH_TO_KEYSTORE_FILE>`: For keystore-based signing.
        *   `--max-fee <FEE_IN_WEI>`.
        *   `--wait`: Waits for the transaction to be accepted.
    *   **Note:** `sncast declare` often handles finding the Sierra file and may even compile the project if needed using Scarb under the hood.
    *   **Output:** Returns the `class_hash`.

*   **`sncast deploy --class-hash <CLASS_HASH> [OPTIONS]`**
    *   Deploys an instance of a declared class.
    *   `<CLASS_HASH>` is the hash from `sncast declare`.
    *   **Common Options:** (Many are similar to `declare`)
        *   `--url`, `--accounts-file`, `--account`, `--private-key`, `--keystore`, `--max-fee`, `--wait`.
        *   `--salt <SALT_VALUE>`.
        *   `--constructor-calldata <ARG1> <ARG2> ...`: Space-separated constructor arguments.
    *   **Output:** Returns the `contract_address`.

### sncast Resources:

*   **Starknet Foundry Book (sncast section):** [https://foundry-rs.github.io/starknet-foundry/](https://foundry-rs.github.io/starknet-foundry/)
*   Installation: Via `snfoundryup` (which installs Starknet Foundry, including snforge and sncast).

## Choosing Between Starkli and sncast

*   **Starkli:** A general-purpose, standalone CLI. Often favored for its comprehensive feature set beyond just deployment (e.g., advanced scripting, querying). Can be more explicit in its command structure.
*   **sncast:** Integrated with Starknet Foundry. If you are already using `snforge` for testing, `sncast` provides a consistent workflow. It can be more convenient for projects managed with Scarb due to its tighter integration (e.g., automatically finding contract artifacts by name).

Both tools are actively maintained and widely used. The choice often comes down to personal preference or project setup. Both require careful management of account details (addresses, private keys/keystores) and RPC endpoint configurations for different networks.

Many developers use environment variables to manage RPC URLs and account details for convenience and security (e.g., `STARKNET_RPC_URL`, `STARKNET_ACCOUNT`, `STARKNET_KEYSTORE` for Starkli, or similar `SNCAST_` prefixed variables for sncast). 