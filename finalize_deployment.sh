#!/bin/bash

# finalize_deployment.sh - Final configuration and save deployment addresses

# Configuration
ACCOUNT_ADDR="0x0308528603f1e515Cac9E57b3708FdAEe757b08C4636864867479A526a7245Ec"
RPC_URL="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb"
STARKLI_KEYSTORE="/home/dragonsarealive/.starkli-wallets/argentx_sep/keystore.json"
STARKLI_ACCOUNT="/home/dragonsarealive/.starkli-configs/sepolia/argentx_sep_fetched.json"
STARKLI="starkli"

# Deployed contract addresses
IDENTITY_ADDR="0x079c5e6a08cab253e7bb4b57776d5ed0e66ca06bc01fc65f09fbf5ebdc397274"
COMPONENT_ADDR="0x05fce2407338ddba93698b12af82275cbe62e1d9bcf7de63938cea642c894667"
DEV_SUB_ADDR="0x07c402205781ccd3b48b1b777c82cbc4a8eab20127bc3049fa2f6c7bfcfbc0ae"
MARKETPLACE_ADDR="0x06e2c90a5fca956dc8c0e014e149c2708cb5ff1e7cf2c9345ff53599efbf90e1"

# Oracle and token addresses
PRAGMA_ORACLE_ADDR="0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a"
STRK_TOKEN_ADDR="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"

echo "Finalizing deployment configuration..."
echo ""

# Step 6: Set Subscription Managers in ComponentRegistry
echo "Configuring ComponentRegistry with subscription managers..."
$STARKLI invoke $COMPONENT_ADDR set_subscription_managers $DEV_SUB_ADDR $MARKETPLACE_ADDR \
  --account $STARKLI_ACCOUNT --keystore $STARKLI_KEYSTORE --rpc $RPC_URL --watch

echo ""
echo "Configuration complete!"
echo ""

# Save deployment addresses to file
echo "Saving deployment addresses to deployment_addresses_v1.2.0.txt..."
cat > deployment_addresses_v1.2.0.txt << EOL
StarkFlux v1.2.0 Contract Deployment Addresses
==============================================
Deployment Date: $(date)
Network: Starknet Sepolia

Core Contracts:
---------------
Identity Registry:        $IDENTITY_ADDR
Component Registry:       $COMPONENT_ADDR
Dev Subscription:         $DEV_SUB_ADDR
Marketplace Subscription: $MARKETPLACE_ADDR

Infrastructure:
---------------
Oracle Address (Sepolia): $PRAGMA_ORACLE_ADDR
STRK Token (Sepolia):     $STRK_TOKEN_ADDR

Contract Versions:
------------------
Identity Registry:        v1.2.0
Component Registry:       v1.2.1
Dev Subscription:         v1.2.0
Marketplace Subscription: v1.2.0

Transaction Hashes:
-------------------
Identity Registry Declaration:        0x0210f2cfe2061cf42897fcf0600a1bbdb5a5783a18d1c71ba94f1333e7d02403
Identity Registry Deployment:         0x02c2f8a3b065b6fddf82b6bd6a75f863e3e7aec2963cd1889b1ec51c96809347
Component Registry Declaration:       0x071389fcc5ef4e49b25a07bdf7f8a1b4ae15be96bee187f0a93c4045e8502458
Component Registry Deployment:        0x0583510c04cd88e1b8e7cb5fc6e7f243dee5b1828e7ae1917195208357043666
Identity Registry Configuration:      0x007ade58a87f1bd5e0b531087fd65320c9befa4ae13464b182f3408a7d8abf5a
Dev Subscription Declaration:         0x03c8cf91d746376e7e42adb36ded1c89e8bf30318e364f07127931b17a42d615
Dev Subscription Deployment:          0x0585474c8d7aca63680d3585312d691c3b826cbf993fddcd14c46f05fee737b7
Marketplace Subscription Declaration: 0x05394e4a256a42cddc73b861c49df76f57f3ee58bdb4ecea3d64f3904ce94dd3
Marketplace Subscription Deployment:  0x00817c5910ffb72297dd5e6a249dac8f4b1b42716ac838c171501fb8b3e2cca7

Notes:
------
- All contracts deployed with correct Sepolia Oracle address
- All contracts use v1.2.0 implementations with fixed storage patterns
- Cross-contract links configured successfully
EOL

echo ""
echo "Deployment addresses saved to deployment_addresses_v1.2.0.txt"
echo ""
echo "🎉 StarkFlux v1.2.0 deployment completed successfully! 🎉"
echo ""
echo "Next steps:"
echo "1. Update UI configuration with new contract addresses"
echo "2. Generate and update contract ABIs in the UI"
echo "3. Test all contract interactions"
echo "4. Update documentation with new addresses" 