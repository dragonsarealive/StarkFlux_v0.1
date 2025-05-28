#!/bin/bash

# deploy_sepolia_v1.2.0.sh - Script to deploy contracts v1.2.0 to Starknet Sepolia testnet
# Updated with correct Oracle address and constructor parameters

# Configuration from pre-requisites
PRIVATE_KEY="0x01d76d5b4689a69c18c047cd69dd8aabdf975090474fa99932509a3ea740e704"
ACCOUNT_ADDR="0x0308528603f1e515Cac9E57b3708FdAEe757b08C4636864867479A526a7245Ec"
OWNER_ADDR="0x0308528603f1e515Cac9E57b3708FdAEe757b08C4636864867479A526a7245Ec"
TREASURY_ADDR="0x024A85D2bF61f4EC32C31187c6ac03fb22281EaA0D47B084a0a3931E096D93b8"
LIQUIDITY_ADDR="0x03103C30feDc51ad71dCabB6733EbEC5ce83718CA2E6C0Af6C7412ce516FB011"
RPC_URL="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb"
STARKLI_KEYSTORE="/home/dragonsarealive/.starkli-wallets/argentx_sep/keystore.json"
STARKLI_ACCOUNT="/home/dragonsarealive/.starkli-configs/sepolia/argentx_sep_fetched.json"
ARTIFACTS_DIR="./target/fixed"
STARKLI="/home/dragonsarealive/bin/starkli"

# CORRECT Sepolia addresses
STRK_TOKEN_ADDR="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
PRAGMA_ORACLE_ADDR="0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a"  # SEPOLIA!

# Oracle constants
PRAGMA_STRK_USD_PAIR_ID="0x5354524b2f555344"  # selector!("STRK/USD")

# Create necessary directories if they don't exist
mkdir -p /home/dragonsarealive/.starkli-wallets/argentx_sep
mkdir -p /home/dragonsarealive/.starkli-configs/sepolia

# Create keystore JSON file 
echo "{
  \"version\": 1,
  \"variant\": {
    \"type\": \"argent\",
    \"version\": 1,
    \"owner\": \"0x0714413ac55b5c9769fa716b50bae9a8949ab225fefe9d01cc8f4f7de24af7f9\",
    \"guardian\": \"0x0\"
  },
  \"deployment\": {
    \"status\": \"deployed\",
    \"class_hash\": \"0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f\",
    \"address\": \"$ACCOUNT_ADDR\"
  }
}" > $STARKLI_ACCOUNT

echo "Account JSON file created at $STARKLI_ACCOUNT"

# Check if keystore already exists
if [ ! -f "$STARKLI_KEYSTORE" ]; then
    echo "Creating new keystore..."
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
else
    echo "Using existing keystore at $STARKLI_KEYSTORE"
fi

echo "Starting deployment process for Version 1.2.0..."
echo "Using SEPOLIA Oracle address: $PRAGMA_ORACLE_ADDR"

# Step 1: Deploy IdentityRegistry v1.2.0
echo "1. Deploying IdentityRegistry v1.2.0..."
$STARKLI declare $ARTIFACTS_DIR/identity_registry.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
IDENTITY_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/identity_registry.contract_class.json)
echo "Identity Registry v1.2.0 declared with class hash: $IDENTITY_CLASS"

IDENTITY_DEPLOY=$($STARKLI deploy $IDENTITY_CLASS $OWNER_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
IDENTITY_ADDR=$(echo "$IDENTITY_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | head -1)
echo "Identity Registry v1.2.0 deployed at: $IDENTITY_ADDR"

# Step 2: Deploy ComponentRegistry v1.2.1
echo "2. Deploying ComponentRegistry v1.2.1..."
$STARKLI declare $ARTIFACTS_DIR/component_registry.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
COMPONENT_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/component_registry.contract_class.json)
echo "Component Registry v1.2.1 declared with class hash: $COMPONENT_CLASS"

COMPONENT_DEPLOY=$($STARKLI deploy $COMPONENT_CLASS $OWNER_ADDR $STRK_TOKEN_ADDR $PRAGMA_ORACLE_ADDR $IDENTITY_ADDR $TREASURY_ADDR $LIQUIDITY_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
COMPONENT_ADDR=$(echo "$COMPONENT_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | head -1)
echo "Component Registry v1.2.1 deployed at: $COMPONENT_ADDR"

# Step 3: Set Registry Address in IdentityRegistry
echo "3. Configuring IdentityRegistry..."
$STARKLI invoke $IDENTITY_ADDR set_registry_address $COMPONENT_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
echo "Identity Registry configured with Component Registry address"

# Step 4: Deploy DevSubscription v1.2.0
echo "4. Deploying DevSubscription v1.2.0..."
$STARKLI declare $ARTIFACTS_DIR/dev_subscription.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
DEV_SUB_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/dev_subscription.contract_class.json)
echo "Dev Subscription v1.2.0 declared with class hash: $DEV_SUB_CLASS"

# DevSubscription v1.2.0 constructor parameters:
# identity_registry, platform_treasury, liquidity_vault, strk_token, pragma_oracle_address, component_registry
DEV_SUB_DEPLOY=$($STARKLI deploy $DEV_SUB_CLASS $IDENTITY_ADDR $TREASURY_ADDR $LIQUIDITY_ADDR $STRK_TOKEN_ADDR $PRAGMA_ORACLE_ADDR $COMPONENT_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
DEV_SUB_ADDR=$(echo "$DEV_SUB_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | head -1) 
echo "Dev Subscription v1.2.0 deployed at: $DEV_SUB_ADDR"

# Step 5: Deploy MarketplaceSubscription v1.2.0
echo "5. Deploying MarketplaceSubscription v1.2.0..."
$STARKLI declare $ARTIFACTS_DIR/marketplace_subscription.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
MARKETPLACE_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/marketplace_subscription.contract_class.json)
echo "Marketplace Subscription v1.2.0 declared with class hash: $MARKETPLACE_CLASS"

# MarketplaceSubscription v1.2.0 constructor parameters:
# subscription_fee: u256, price_usd_micros: u256, price_feed_key: felt252,
# strk_token, pragma_oracle, liquidity_vault, marketplace_vault, component_registry
MARKETPLACE_DEPLOY=$($STARKLI deploy $MARKETPLACE_CLASS \
  "0" \                    # subscription_fee (0 for now, set via setter)
  "10000000" \            # price_usd_micros ($10 USD)
  $PRAGMA_STRK_USD_PAIR_ID \  # price_feed_key
  $STRK_TOKEN_ADDR \
  $PRAGMA_ORACLE_ADDR \
  $LIQUIDITY_ADDR \
  $TREASURY_ADDR \        # marketplace_vault
  $COMPONENT_ADDR \
  --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
MARKETPLACE_ADDR=$(echo "$MARKETPLACE_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | head -1)
echo "Marketplace Subscription v1.2.0 deployed at: $MARKETPLACE_ADDR"

# Step 6: Set Subscription Managers in ComponentRegistry
echo "6. Configuring ComponentRegistry with subscription managers..."
$STARKLI invoke $COMPONENT_ADDR set_subscription_managers $DEV_SUB_ADDR $MARKETPLACE_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
echo "Component Registry configured with subscription managers"

echo "Deployment complete. Contract addresses for v1.2.0:"
echo "Identity Registry: $IDENTITY_ADDR"
echo "Component Registry: $COMPONENT_ADDR"
echo "Dev Subscription: $DEV_SUB_ADDR"
echo "Marketplace Subscription: $MARKETPLACE_ADDR"

# Save deployment addresses to file
echo "Saving deployment addresses to deployment_addresses_v1.2.0.txt..."
cat > deployment_addresses_v1.2.0.txt << EOL
StarkFlux v1.2.0 Contract Deployment Addresses
------------------------------------------------
Identity Registry: $IDENTITY_ADDR
Component Registry: $COMPONENT_ADDR
Dev Subscription: $DEV_SUB_ADDR
Marketplace Subscription: $MARKETPLACE_ADDR

Oracle Address (Sepolia): $PRAGMA_ORACLE_ADDR
STRK Token (Sepolia): $STRK_TOKEN_ADDR
EOL

echo "Deployment script for v1.2.0 completed successfully!" 