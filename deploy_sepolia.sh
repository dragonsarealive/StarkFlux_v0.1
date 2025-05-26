#!/bin/bash

# deploy_sepolia.sh - Script to deploy contracts to Starknet Sepolia testnet
# Updated for version 1.1.0 - Fresh deployment with completely new contract classes

# Configuration from pre-requisites
PRIVATE_KEY="0x01d76d5b4689a69c18c047cd69dd8aabdf975090474fa99932509a3ea740e704"
ACCOUNT_ADDR="0x0308528603f1e515Cac9E57b3708FdAEe757b08C4636864867479A526a7245Ec"
OWNER_ADDR="0x0019CC7622177f02bA83D1D7E5bb835c0f461C87df8758c28ed756891c96D2CC"
TREASURY_ADDR="0x024A85D2bF61f4EC32C31187c6ac03fb22281EaA0D47B084a0a3931E096D93b8"
LIQUIDITY_ADDR="0x03103C30feDc51ad71dCabB6733EbEC5ce83718CA2E6C0Af6C7412ce516FB011"
RPC_URL="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb"
STARKLI_KEYSTORE="/home/dragonsarealive/.starkli-wallets/argentx_sep/keystore.json"
STARKLI_ACCOUNT="/home/dragonsarealive/.starkli-configs/sepolia/argentx_sep_fetched.json"
ARTIFACTS_DIR="./target/fixed"
STARKLI="/home/dragonsarealive/.starkli/bin/starkli"

# Create necessary directories if they don't exist
mkdir -p /home/dragonsarealive/.starkli-wallets/argentx_sep
mkdir -p /home/dragonsarealive/.starkli-configs/sepolia

# Create keystore JSON file 
echo "{
  \"version\": 1,
  \"variant\": {
    \"type\": \"argent\",
    \"version\": 1,
    \"owner\": \"$OWNER_ADDR\",
    \"guardian\": \"0x0\"
  },
  \"deployment\": {
    \"status\": \"deployed\",
    \"class_hash\": \"0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f\",
    \"address\": \"$ACCOUNT_ADDR\"
  }
}" > $STARKLI_ACCOUNT

echo "Account JSON file created at $STARKLI_ACCOUNT"

# Use python script to create keystore
python3 -c "
from eth_account import Account
import json
import os

# Create keystore
private_key = '$PRIVATE_KEY'
password = '\$trkfLUx!'

keystore = Account.encrypt(private_key, password)
with open('$STARKLI_KEYSTORE', 'w') as f:
    json.dump(keystore, f)
    
print(f'Keystore created at {os.path.abspath('$STARKLI_KEYSTORE')}')
"

echo "Starting deployment process for Version 1.1.0..."
echo "This deployment creates completely new contract classes from scratch"

# Step 1: Deploy IdentityRegistry
echo "1. Deploying IdentityRegistry v1.1.0..."
$STARKLI declare $ARTIFACTS_DIR/identity_registry.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch --compiler-version auto
IDENTITY_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/identity_registry.contract_class.json)
echo "Identity Registry v1.1.0 declared with class hash: $IDENTITY_CLASS"

IDENTITY_DEPLOY=$($STARKLI deploy $IDENTITY_CLASS $OWNER_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
IDENTITY_ADDR=$(echo "$IDENTITY_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | head -1)
echo "Identity Registry v1.1.0 deployed at: $IDENTITY_ADDR"

# Step 2: Deploy ComponentRegistry (using identity_registry address)
echo "2. Deploying ComponentRegistry v1.1.0..."
$STARKLI declare $ARTIFACTS_DIR/component_registry.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch --compiler-version auto
COMPONENT_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/component_registry.contract_class.json)
echo "Component Registry v1.1.0 declared with class hash: $COMPONENT_CLASS"

# STRK token address on Sepolia - using placeholder for now
STRK_TOKEN_ADDR="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
# Pragma Oracle Address - using placeholder for now 
PRAGMA_ORACLE_ADDR="0x02a85bd616f912537c50a49a4076db02c00b29b2cdc8a197ce92ed1837fa875b"

COMPONENT_DEPLOY=$($STARKLI deploy $COMPONENT_CLASS $OWNER_ADDR $STRK_TOKEN_ADDR $PRAGMA_ORACLE_ADDR $IDENTITY_ADDR $TREASURY_ADDR $LIQUIDITY_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
COMPONENT_ADDR=$(echo "$COMPONENT_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | head -1)
echo "Component Registry v1.1.0 deployed at: $COMPONENT_ADDR"

# Step 3: Set Registry Address in IdentityRegistry
echo "3. Configuring IdentityRegistry..."
$STARKLI invoke $IDENTITY_ADDR set_registry_address $COMPONENT_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
echo "Identity Registry configured with Component Registry address"

# Step 4: Deploy DevSubscription
echo "4. Deploying DevSubscription v1.1.0..."
$STARKLI declare $ARTIFACTS_DIR/dev_subscription.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch --compiler-version auto
DEV_SUB_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/dev_subscription.contract_class.json)
echo "Dev Subscription v1.1.0 declared with class hash: $DEV_SUB_CLASS"

DEV_SUB_DEPLOY=$($STARKLI deploy $DEV_SUB_CLASS $OWNER_ADDR $IDENTITY_ADDR $STRK_TOKEN_ADDR $TREASURY_ADDR $LIQUIDITY_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
DEV_SUB_ADDR=$(echo "$DEV_SUB_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | head -1) 
echo "Dev Subscription v1.1.0 deployed at: $DEV_SUB_ADDR"

# Step 5: Deploy MarketplaceSubscription
echo "5. Deploying MarketplaceSubscription v1.1.0..."
$STARKLI declare $ARTIFACTS_DIR/marketplace_subscription.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch --compiler-version auto
MARKETPLACE_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/marketplace_subscription.contract_class.json)
echo "Marketplace Subscription v1.1.0 declared with class hash: $MARKETPLACE_CLASS"

# Platform and liquidity fees in basis points (45/45/10 split for marketplace)
PLATFORM_FEE="4500"
LIQUIDITY_FEE="1000"

MARKETPLACE_DEPLOY=$($STARKLI deploy $MARKETPLACE_CLASS $OWNER_ADDR $COMPONENT_ADDR $IDENTITY_ADDR $STRK_TOKEN_ADDR $TREASURY_ADDR $LIQUIDITY_ADDR $PLATFORM_FEE $LIQUIDITY_FEE --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
MARKETPLACE_ADDR=$(echo "$MARKETPLACE_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | head -1)
echo "Marketplace Subscription v1.1.0 deployed at: $MARKETPLACE_ADDR"

# Step 6: Set Subscription Managers in ComponentRegistry
echo "6. Configuring ComponentRegistry with subscription managers..."
$STARKLI invoke $COMPONENT_ADDR set_subscription_managers $DEV_SUB_ADDR $MARKETPLACE_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
echo "Component Registry configured with subscription managers"

echo "Deployment complete. Contract addresses for v1.1.0:"
echo "Identity Registry: $IDENTITY_ADDR"
echo "Component Registry: $COMPONENT_ADDR"
echo "Dev Subscription: $DEV_SUB_ADDR"
echo "Marketplace Subscription: $MARKETPLACE_ADDR"

# Save deployment addresses to file
echo "Saving deployment addresses to deployment_addresses_v1.1.0.txt..."
cat > deployment_addresses_v1.1.0.txt << EOL
StarkFlux v1.1.0 Contract Deployment Addresses
------------------------------------------------
Identity Registry: $IDENTITY_ADDR
Component Registry: $COMPONENT_ADDR
Dev Subscription: $DEV_SUB_ADDR
Marketplace Subscription: $MARKETPLACE_ADDR
EOL

echo "Deployment script for v1.1.0 completed successfully!" 