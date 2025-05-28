#!/bin/bash

# deploy_marketplace_fix.sh - Deploy MarketplaceSubscription with correct parameters

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

# Already deployed contracts
IDENTITY_ADDR="0x079c5e6a08cab253e7bb4b57776d5ed0e66ca06bc01fc65f09fbf5ebdc397274"
COMPONENT_ADDR="0x05fce2407338ddba93698b12af82275cbe62e1d9bcf7de63938cea642c894667"
DEV_SUB_ADDR="0x07c402205781ccd3b48b1b777c82cbc4a8eab20127bc3049fa2f6c7bfcfbc0ae"

# Sepolia addresses
STRK_TOKEN_ADDR="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
PRAGMA_ORACLE_ADDR="0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a"

# MarketplaceSubscription class hash (already declared)
MARKETPLACE_CLASS="0x035e3cb1e0e89d1895bba2c02fd13f7ece2536bc5b816d12fc3e1345ababf3ee"

echo "Deploying MarketplaceSubscription v1.2.0 with correct parameters..."
echo ""

# MarketplaceSubscription v1.2.0 constructor parameters:
# subscription_fee: u256 (low, high)
# price_usd_micros: u256 (low, high)
# price_feed_key: felt252
# strk_token: ContractAddress
# pragma_oracle: ContractAddress
# liquidity_vault: ContractAddress
# marketplace_vault: ContractAddress
# component_registry: ContractAddress

# Deploy with properly formatted parameters
echo "Deploying MarketplaceSubscription..."
$STARKLI deploy $MARKETPLACE_CLASS \
  0 0 \
  10000000 0 \
  0x5354524b2f555344 \
  $STRK_TOKEN_ADDR \
  $PRAGMA_ORACLE_ADDR \
  $LIQUIDITY_ADDR \
  $TREASURY_ADDR \
  $COMPONENT_ADDR \
  --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch

echo ""
echo "If deployment is successful, note the contract address and run the final configuration step." 