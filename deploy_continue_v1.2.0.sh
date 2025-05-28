#!/bin/bash

# deploy_continue_v1.2.0.sh - Continue deployment from ComponentRegistry

# Configuration
ACCOUNT_ADDR="0x0308528603f1e515Cac9E57b3708FdAEe757b08C4636864867479A526a7245Ec"
OWNER_ADDR="0x0308528603f1e515Cac9E57b3708FdAEe757b08C4636864867479A526a7245Ec"
TREASURY_ADDR="0x024A85D2bF61f4EC32C31187c6ac03fb22281EaA0D47B084a0a3931E096D93b8"
LIQUIDITY_ADDR="0x03103C30feDc51ad71dCabB6733EbEC5ce83718CA2E6C0Af6C7412ce516FB011"
RPC_URL="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb"
STARKLI_KEYSTORE="/home/dragonsarealive/.starkli-wallets/argentx_sep/keystore.json"
STARKLI_ACCOUNT="/home/dragonsarealive/.starkli-configs/sepolia/argentx_sep_fetched.json"
ARTIFACTS_DIR="./target/fixed"
STARKLI="starkli"

# Already deployed
IDENTITY_ADDR="0x079c5e6a08cab253e7bb4b57776d5ed0e66ca06bc01fc65f09fbf5ebdc397274"

# Sepolia addresses
STRK_TOKEN_ADDR="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
PRAGMA_ORACLE_ADDR="0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a"
PRAGMA_STRK_USD_PAIR_ID="0x5354524b2f555344"

echo "Continuing deployment from ComponentRegistry..."
echo "Using existing IdentityRegistry at: $IDENTITY_ADDR"
echo ""

# Step 2: Deploy ComponentRegistry v1.2.1
echo "2. Deploying ComponentRegistry v1.2.1..."
$STARKLI declare $ARTIFACTS_DIR/component_registry.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
COMPONENT_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/component_registry.contract_class.json)
echo "Component Registry v1.2.1 declared with class hash: $COMPONENT_CLASS"

COMPONENT_DEPLOY=$($STARKLI deploy $COMPONENT_CLASS $OWNER_ADDR $STRK_TOKEN_ADDR $PRAGMA_ORACLE_ADDR $IDENTITY_ADDR $TREASURY_ADDR $LIQUIDITY_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
COMPONENT_ADDR=$(echo "$COMPONENT_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | tail -1)
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

DEV_SUB_DEPLOY=$($STARKLI deploy $DEV_SUB_CLASS $IDENTITY_ADDR $TREASURY_ADDR $LIQUIDITY_ADDR $STRK_TOKEN_ADDR $PRAGMA_ORACLE_ADDR $COMPONENT_ADDR --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
DEV_SUB_ADDR=$(echo "$DEV_SUB_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | tail -1) 
echo "Dev Subscription v1.2.0 deployed at: $DEV_SUB_ADDR"

# Step 5: Deploy MarketplaceSubscription v1.2.0
echo "5. Deploying MarketplaceSubscription v1.2.0..."
$STARKLI declare $ARTIFACTS_DIR/marketplace_subscription.contract_class.json --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch
MARKETPLACE_CLASS=$($STARKLI class-hash $ARTIFACTS_DIR/marketplace_subscription.contract_class.json)
echo "Marketplace Subscription v1.2.0 declared with class hash: $MARKETPLACE_CLASS"

# MarketplaceSubscription v1.2.0 constructor parameters
MARKETPLACE_DEPLOY=$($STARKLI deploy $MARKETPLACE_CLASS \
  "0" \
  "10000000" \
  $PRAGMA_STRK_USD_PAIR_ID \
  $STRK_TOKEN_ADDR \
  $PRAGMA_ORACLE_ADDR \
  $LIQUIDITY_ADDR \
  $TREASURY_ADDR \
  $COMPONENT_ADDR \
  --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch)
MARKETPLACE_ADDR=$(echo "$MARKETPLACE_DEPLOY" | grep -o -E '0x[0-9a-fA-F]+' | tail -1)
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