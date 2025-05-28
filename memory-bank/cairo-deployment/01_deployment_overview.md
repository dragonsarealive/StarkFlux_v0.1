# 01: Starknet Contract Deployment Overview

Deploying a smart contract on Starknet is a two-step process. This separation allows for efficiency: a contract's code (its class) can be declared once, and then multiple instances of that contract can be deployed using the declared class hash.

## Step 1: Declare the Contract Class

Before you can deploy an instance of your smart contract, its code must be made known to the Starknet network. This is called **declaring a contract class**.

*   **What happens:** You submit the compiled Sierra code of your contract to Starknet.
*   **Compilation:** Your Cairo source code is first compiled into Sierra (Safe Intermediate Representation) using Scarb (`scarb build`). This Sierra JSON file is what you declare.
*   **Class Hash:** Upon successful declaration, Starknet computes and assigns a unique **class hash** to your contract's code. This class hash acts as a blueprint or template identifier.
*   **Immutability:** Once a class is declared with a specific class hash, its code is immutable on the network.
*   **Cost:** Declaring a class incurs a fee on the network, payable in ETH (on mainnet/testnets) or through the local devnet's mechanism.

## Step 2: Deploy the Contract Instance

Once a contract class is declared and you have its class hash, you can deploy one or more instances of that contract.

*   **What happens:** You instruct Starknet to create a new contract account using a previously declared class hash.
*   **Constructor Arguments:** If your contract has a `#[constructor]` function, you must provide the required arguments during the deployment of the instance. These arguments initialize the state of the new contract instance.
*   **Unique Address:** Each deployed instance gets its own unique **contract address** on Starknet.
*   **Salt (Optional but Recommended):** To deploy a contract at a predictable address, you can provide a `salt` during deployment. The contract address is then computed based on the class hash, constructor arguments, deployer address, and the salt. This is useful for counterfactual deployments or when the address needs to be known before deployment.
*   **Cost:** Deploying an instance also incurs a fee, which can be higher than declaration due to storage initialization and constructor execution.

## Key Considerations

### Account for Deployment

*   **Deployer Account:** Both declaring a class and deploying an instance are transactions that must be initiated and paid for by a Starknet account. This account needs to be funded with enough ETH (on testnets/mainnet) to cover the transaction fees.
*   **Smart Wallets:** On Starknet, accounts are smart contracts themselves (Account Abstraction). You'll typically use a pre-deployed account contract (like Argent X, Braavos, or an OpenZeppelin account contract) to sign and send deployment transactions.

### Networks

The deployment process is conceptually the same across different Starknet networks, but specific parameters change:

*   **Local Development Node (e.g., Katana):**
    *   Fast and free deployments.
    *   Often comes with pre-funded accounts.
    *   Ideal for development and testing.
    *   State is ephemeral unless configured otherwise.
*   **Testnet (e.g., Sepolia Testnet):
    *   Simulates the mainnet environment.
    *   Requires testnet ETH (obtained from faucets) to pay for fees.
    *   Used for staging, integration testing, and sharing with others before mainnet launch.
*   **Mainnet:**
    *   The live Starknet network with real value.
    *   Requires real ETH for deployment fees.
    *   Deployments are permanent and public.

### Compilation Artifacts

*   `scarb build` produces the Sierra class definition file (e.g., `target/dev/my_project_MyContract.contract_class.json`). This is the primary file needed for declaration.
*   The ABI (Application Binary Interface) is also generated (e.g., `target/dev/my_project_MyContract.abi.json`), which is needed for interacting with the contract after deployment but not directly for the declaration/deployment transaction itself (though tools might use it to format constructor calls).

Understanding this two-step process and the associated requirements is fundamental to successfully launching your Cairo applications on Starknet. 