# Basic Workflow & Resources for Cairo/Starknet Development

This document outlines a typical basic workflow for developing a Starknet smart contract using the tools discussed, along with key resources for further learning.

## Basic Development Workflow Example

This example assumes you have Scarb, Starknet Foundry (snforge/sncast), Katana, and Starkli installed and configured.

### 1. Initialize a New Project with Scarb

Scarb will create a new project with a default structure, including a `Scarb.toml` manifest file and a `src/lib.cairo` file.

```bash
scarb new my_starknet_project
cd my_starknet_project
```

Open `Scarb.toml`. You'll need to add `starknet` as a dependency to write Starknet contracts:

```toml
[package]
name = "my_starknet_project"
version = "0.1.0"
edition = "2023_11"

[dependencies]
starknet = ">=2.6.3"

[[target.starknet-contract]]
#casm = true # (Optional) Output CASM, default is false since Scarb v2.7

# For development, you might want to allow adding Sierra CASM hints
# [cairo]
# sierra-replace-ids = true 
```

Replace the content of `src/lib.cairo` with a simple Starknet contract:

```cairo
#[starknet::contract]
mod HelloStarknet {
    use starknet::ContractAddress;

    #[storage]
    struct Storage {
        balance: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_balance: u256) {
        self.balance.write(initial_balance);
    }

    #[external(v0)]
    fn increase_balance(ref self: ContractState, amount: u256) {
        let current_balance = self.balance.read();
        self.balance.write(current_balance + amount);
    }

    #[external(v0)]
    fn get_balance(self: @ContractState) -> u256 {
        self.balance.read()
    }
}
```

### 2. Compile the Contract

Use Scarb to compile your Cairo code into Sierra (and optionally CASM).

```bash
scarb build
```
This will produce a Sierra JSON file in `target/dev/my_starknet_project.contract_class.json` (or similar, check Scarb output for the exact name and path).

### 3. Write Tests (Using Starknet Foundry - `snforge`)

Create a `tests` directory and add a test file, e.g., `tests/test_contract.cairo`.

```cairo
// tests/test_contract.cairo
use starknet::ContractAddress;
use starknet::class_hash::Felt252TryIntoClassHash;
use snforge_std::{declare, ContractClassTrait, start_prank, stop_prank, CheatTarget};

// Assuming your contract is in a crate named 'my_starknet_project'
// and the contract module is HelloStarknet
use my_starknet_project::HelloStarknet;

#[test]
fn test_increase_balance() {
    // Declare the contract class
    let contract = declare("HelloStarknet").unwrap();

    // Prepare constructor arguments
    let initial_balance = 100_u256;
    let mut constructor_calldata = array![initial_balance.try_into().unwrap()];

    // Deploy the contract
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

    // Get a dispatcher to interact with the deployed contract
    let dispatcher = HelloStarknet::IDispatcher { contract_address };

    // Initial balance check
    let balance_before = dispatcher.get_balance();
    assert(balance_before == initial_balance, 'Initial balance mismatch');

    // Increase balance
    let amount_to_increase = 50_u256;
    dispatcher.increase_balance(amount_to_increase);

    // Check new balance
    let balance_after = dispatcher.get_balance();
    assert(balance_after == initial_balance + amount_to_increase, 'Balance after increase mismatch');
}
```

Run tests with `snforge`:

```bash
snforge
```

### 4. Start a Local Development Node (Katana)

In a new terminal window, start Katana:

```bash
katana
```
Katana will output RPC endpoint (e.g., `http://0.0.0.0:5050`) and pre-funded account details.

### 5. Declare and Deploy to Katana (Using Starkli or sncast)

**Using Starkli:**

*   **Set up Starkli environment variables (or pass as options):**
    ```bash
    # Example for one of Katana's pre-funded accounts
    export STARKNET_ACCOUNT=~/.starknet_accounts/starknet_open_zeppelin_accounts.json # (You might need to create this or point to Katana's generated one)
    export STARKNET_KEYSTORE=~/.starknet_accounts/starknet_open_zeppelin_keys.json
    export STARKNET_RPC=http://0.0.0.0:5050 # Katana's RPC
    # Account address and private key for one of Katana's prefunded accounts
    # The actual paths/commands to set up accounts might differ based on your Starkli version and setup.
    # Refer to Katana's output and Starkli documentation.
    ```
    For Katana, you'd typically use one of its pre-funded account addresses and private keys directly in commands if not using a keystore file.

*   **Declare the contract class:**
    ```bash
    # Path to your compiled Sierra class from `scarb build`
    # The filename might vary based on your project name.
    starkli declare target/dev/my_starknet_project.contract_class.json \
      --account <YOUR_KATANA_ACCOUNT_ADDRESS_HEX> \
      --private-key <YOUR_KATANA_ACCOUNT_PRIVATE_KEY_HEX> \
      --compiler-version 2.6.3 # Match your Scarb/Cairo version
    ```
    Note the `class_hash` from the output.

*   **Deploy the contract instance:**
    ```bash
    starkli deploy <CLASS_HASH_FROM_DECLARE> <CONSTRUCTOR_ARG_1> <CONSTRUCTOR_ARG_2> ... \
      --account <YOUR_KATANA_ACCOUNT_ADDRESS_HEX> \
      --private-key <YOUR_KATANA_ACCOUNT_PRIVATE_KEY_HEX>
    ```
    For our `HelloStarknet` constructor `initial_balance: u256`, the argument would be the initial balance (e.g., `100`).
    Note the `contract_address` from the output.

**Using `sncast` (Starknet Foundry):**

*   **Set up environment variables for `sncast`:**
    ```bash
    export SNCAST_RPC_URL=http://0.0.0.0:5050
    export SNCAST_ACCOUNT=<YOUR_KATANA_ACCOUNT_ADDRESS_HEX>
    export SNCAST_PRIVATE_KEY=<YOUR_KATANA_ACCOUNT_PRIVATE_KEY_HEX>
    # Or use a named account from sncast's accounts file (e.g., ~/.starknet_accounts/starknet_open_zeppelin_accounts.json)
    # export SNCAST_ACCOUNTS_FILE=~/.starknet_accounts/starknet_open_zeppelin_accounts.json
    # export SNCAST_ACCOUNT=my_katana_account_name
    ```

*   **Declare:**
    ```bash
    # The contract name here should match the name in Scarb.toml or your contract definition
    sncast declare --contract-name HelloStarknet --max-fee <MAX_FEE_AMOUNT>
    ```
    Note the `class_hash`.

*   **Deploy:**
    ```bash
    sncast deploy --class-hash <CLASS_HASH_FROM_DECLARE> --constructor-calldata <ARG1> <ARG2> ... --max-fee <MAX_FEE_AMOUNT>
    ```
    For `HelloStarknet`, constructor calldata for initial_balance 100: `--constructor-calldata 100`.
    Note the `contract_address`.

### 6. Interact with the Deployed Contract

**Using Starkli:**
```bash
starkli call <CONTRACT_ADDRESS> get_balance --abi target/dev/my_starknet_project.abi.json
starkli invoke <CONTRACT_ADDRESS> increase_balance <AMOUNT> --account <YOUR_ACCOUNT> --private-key <YOUR_KEY> --abi target/dev/my_starknet_project.abi.json
```

**Using `sncast`:**
```bash
sncast call --contract-address <CONTRACT_ADDRESS> --function get_balance
sncast invoke --contract-address <CONTRACT_ADDRESS> --function increase_balance --calldata <AMOUNT> --max-fee <FEE>
```

## Key Resources

*   **The Cairo Book:** [https://book.cairo-lang.org/](https://book.cairo-lang.org/) - Official Cairo language documentation.
*   **Starknet Documentation:** [https://docs.starknet.io/](https://docs.starknet.io/) - Official Starknet documentation.
*   **Scarb Documentation:** [https://docs.swmansion.com/scarb/](https://docs.swmansion.com/scarb/) - Official Scarb documentation.
*   **Starknet Foundry Book:** [https://foundry-rs.github.io/starknet-foundry/](https://foundry-rs.github.io/starknet-foundry/) - Official Starknet Foundry documentation.
*   **Katana (Dojo Book):** [https://book.dojoengine.org/toolchain/katana/overview](https://book.dojoengine.org/toolchain/katana/overview) - Katana documentation.
*   **Starkli Book:** [https://book.starkli.rs/](https://book.starkli.rs/) - Official Starkli documentation.
*   **starknet.js Documentation:** [https://www.starknetjs.com/](https://www.starknetjs.com/)
*   **starknet.py Documentation:** [https://starknetpy.rtfd.io/](https://starknetpy.rtfd.io/)
*   **Starklings:** [https://github.com/shramee/starklings-cairo1](https://github.com/shramee/starklings-cairo1) - Interactive exercises to learn Cairo.
*   **Cairo Examples by StarkWare:** [https://github.com/starkware-libs/cairo_examples](https://github.com/starkware-libs/cairo_examples)

This workflow provides a starting point. Real-world development involves more complex contract interactions, account abstraction, frontend integration, and deployment to testnets/mainnet. 