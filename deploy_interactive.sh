#!/bin/bash

# deploy_interactive.sh - Interactive deployment script for v1.2.0 contracts

# Configuration
PRIVATE_KEY="0x0778f9f6ae23eedc5309c03078c794f3b8022e9d70a092f8fb5063dd496576d8"
ACCOUNT_ADDR="0x0308528603f1e515Cac9E57b3708FdAEe757b08C4636864867479A526a7245Ec"
OWNER_ADDR="0x0019CC7622177f02bA83D1D7E5bb835c0f461C87df8758c28ed756891c96D2CC"
TREASURY_ADDR="0x024A85D2bF61f4EC32C31187c6ac03fb22281EaA0D47B084a0a3931E096D93b8"
LIQUIDITY_ADDR="0x03103C30feDc51ad71dCabB6733EbEC5ce83718CA2E6C0Af6C7412ce516FB011"
RPC_URL="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb"
STARKLI_KEYSTORE="/home/dragonsarealive/.starkli-wallets/argentx_sep/keystore.json"
STARKLI_ACCOUNT="/home/dragonsarealive/.starkli-configs/sepolia/argentx_sep_fetched.json"
ARTIFACTS_DIR="./target/fixed"
STARKLI="starkli"
PASSWORD='$trkfLUx!'

# Sepolia addresses
STRK_TOKEN_ADDR="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
PRAGMA_ORACLE_ADDR="0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a"
PRAGMA_STRK_USD_PAIR_ID="0x5354524b2f555344"

echo "Starting deployment process for Version 1.2.0..."
echo "Using SEPOLIA Oracle address: $PRAGMA_ORACLE_ADDR"
echo ""
echo "NOTE: When prompted for keystore password, enter: \$trkfLUx!"
echo ""

# Step 1: Deploy IdentityRegistry v1.2.0
echo "1. Declaring IdentityRegistry v1.2.0..."
echo "Please enter the keystore password when prompted..."

# First, let's just declare the contract
$STARKLI declare $ARTIFACTS_DIR/identity_registry.contract_class.json \
  --account $STARKLI_ACCOUNT \
  --keystore $STARKLI_KEYSTORE \
  --rpc $RPC_URL

echo ""
echo "If declaration was successful, we'll continue with deployment."
echo "Press Enter to continue or Ctrl+C to abort..."
read

# Get the class hash
IDENTITY_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/identity_registry.contract_class.json)
echo "Identity Registry v1.2.0 class hash: $IDENTITY_CLASS"

# Deploy the contract
echo "Deploying IdentityRegistry..."
$STARKLI deploy $IDENTITY_CLASS $OWNER_ADDR \
  --account $STARKLI_ACCOUNT \
  --keystore $STARKLI_KEYSTORE \
  --rpc $RPC_URL

echo ""
echo "Deployment script paused. Check the output above."
echo "If successful, note the contract address and update the script to continue." 