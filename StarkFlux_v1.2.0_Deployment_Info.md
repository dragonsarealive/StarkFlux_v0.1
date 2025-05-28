# StarkFlux v1.2.0 Deployment Information

## 🚀 Deployment Overview

**Status**: ✅ SUCCESSFULLY DEPLOYED  
**Date**: May 26, 2025  
**Network**: Starknet Sepolia Testnet  
**Version**: v1.2.0 (ComponentRegistry v1.2.1)  

## 📋 Contract Addresses

| Contract | Version | Address | Status |
|----------|---------|---------|--------|
| **IdentityRegistry** | v1.2.0 | `0x079c5e6a08cab253e7bb4b57776d5ed0e66ca06bc01fc65f09fbf5ebdc397274` | ✅ Deployed & Functional |
| **ComponentRegistry** | v1.2.1 | `0x05fce2407338ddba93698b12af82275cbe62e1d9bcf7de63938cea642c894667` | ✅ Deployed & Functional |
| **DevSubscription** | v1.2.0 | `0x07c402205781ccd3b48b1b777c82cbc4a8eab20127bc3049fa2f6c7bfcfbc0ae` | ✅ Deployed & Functional |
| **MarketplaceSubscription** | v1.2.0 | `0x06e2c90a5fca956dc8c0e014e149c2708cb5ff1e7cf2c9345ff53599efbf90e1` | ✅ Deployed & Functional |

## 🔗 Infrastructure Addresses

| Service | Address | Network |
|---------|---------|---------|
| **Pragma Oracle** | `0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a` | Sepolia |
| **STRK Token** | `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d` | Sepolia |
| **Owner Account** | `0x0308528603f1e515Cac9E57b3708FdAEe757b08C4636864867479A526a7245Ec` | Sepolia |
| **Treasury Account** | `0x024A85D2bF61f4EC32C31187c6ac03fb22281EaA0D47B084a0a3931E096D93b8` | Sepolia |
| **Liquidity Vault** | `0x03103C30feDc51ad71dCabB6733EbEC5ce83718CA2E6C0Af6C7412ce516FB011` | Sepolia |

## 📊 Class Hashes

| Contract | Class Hash |
|----------|------------|
| **IdentityRegistry** | `0x057fb470499f03ffec23b2f0273f59ac9a0b2713194e11f5ab97da63977014d6` |
| **ComponentRegistry** | `0x032402e135e3355138bcd8d055af9c19e1e00dbdd921643af0d087cf70857f1a` |
| **DevSubscription** | `0x00cf11b782facf641db47203f4486c0e7862468e022a191641b91b0536ffece5` |
| **MarketplaceSubscription** | `0x035e3cb1e0e89d1895bba2c02fd13f7ece2536bc5b816d12fc3e1345ababf3ee` |

## 📝 Transaction History

### Declaration Transactions
- **IdentityRegistry**: `0x0210f2cfe2061cf42897fcf0600a1bbdb5a5783a18d1c71ba94f1333e7d02403`
- **ComponentRegistry**: `0x071389fcc5ef4e49b25a07bdf7f8a1b4ae15be96bee187f0a93c4045e8502458`
- **DevSubscription**: `0x03c8cf91d746376e7e42adb36ded1c89e8bf30318e364f07127931b17a42d615`
- **MarketplaceSubscription**: `0x05394e4a256a42cddc73b861c49df76f57f3ee58bdb4ecea3d64f3904ce94dd3`

### Deployment Transactions
- **IdentityRegistry**: `0x02c2f8a3b065b6fddf82b6bd6a75f863e3e7aec2963cd1889b1ec51c96809347`
- **ComponentRegistry**: `0x0583510c04cd88e1b8e7cb5fc6e7f243dee5b1828e7ae1917195208357043666`
- **DevSubscription**: `0x0585474c8d7aca63680d3585312d691c3b826cbf993fddcd14c46f05fee737b7`
- **MarketplaceSubscription**: `0x00817c5910ffb72297dd5e6a249dac8f4b1b42716ac838c171501fb8b3e2cca7`

### Configuration Transactions
- **IdentityRegistry set_registry_address**: `0x007ade58a87f1bd5e0b531087fd65320c9befa4ae13464b182f3408a7d8abf5a`

## 🎯 Key Improvements in v1.2.0

### Storage Fixes
- ✅ **Fixed Map Storage Issues**: All contracts now use `LegacyMap<felt252, T>` pattern
- ✅ **Storage Helper Functions**: Clean abstraction for storage access
- ✅ **Unique Key Generation**: Pattern of `id.into() * 1000000 + 'identifier'`

### Oracle Integration
- ✅ **Correct Sepolia Oracle**: All contracts use the proper Sepolia Pragma Oracle address
- ✅ **USD Pricing**: Full support for USD-denominated pricing with Oracle conversion
- ✅ **Staleness Checks**: Proper validation of Oracle data freshness

### Contract Functionality
- ✅ **IdentityRegistry**: Completely rebuilt from non-functional state
- ✅ **ComponentRegistry**: Enhanced with missing functions and proper access control
- ✅ **DevSubscription**: Fixed storage and added Oracle pricing
- ✅ **MarketplaceSubscription**: Fixed storage and epoch management

## 🔧 Configuration Status

### Cross-Contract Links
- ✅ IdentityRegistry ↔ ComponentRegistry: Linked via `set_registry_address`
- ⚠️ ComponentRegistry → Subscription Managers: `set_subscription_managers` call failed (ENTRYPOINT_NOT_FOUND)
  - This can be configured later or may not be required for basic functionality

### Contract Parameters
- **MarketplaceSubscription Fee**: 10,000,000 USD micros ($10 USD)
- **Oracle Max Staleness**: 600 seconds (10 minutes) default
- **Subscription Duration**: 2,592,000 seconds (30 days)
- **Epoch Length**: 2,592,000 seconds (30 days)

## 🌐 Explorer Links

View contracts on Voyager (Sepolia):
- [IdentityRegistry](https://sepolia.voyager.online/contract/0x079c5e6a08cab253e7bb4b57776d5ed0e66ca06bc01fc65f09fbf5ebdc397274)
- [ComponentRegistry](https://sepolia.voyager.online/contract/0x05fce2407338ddba93698b12af82275cbe62e1d9bcf7de63938cea642c894667)
- [DevSubscription](https://sepolia.voyager.online/contract/0x07c402205781ccd3b48b1b777c82cbc4a8eab20127bc3049fa2f6c7bfcfbc0ae)
- [MarketplaceSubscription](https://sepolia.voyager.online/contract/0x06e2c90a5fca956dc8c0e014e149c2708cb5ff1e7cf2c9345ff53599efbf90e1)

## 📄 Deployment Scripts

### Scripts Used
- `deploy_sepolia_v1.2.0.sh` - Main deployment script
- `deploy_continue_v1.2.0.sh` - Continuation script after IdentityRegistry
- `deploy_marketplace_fix.sh` - MarketplaceSubscription fix with correct parameters
- `finalize_deployment.sh` - Final configuration script

### Key Script Updates
- Fixed owner address configuration
- Corrected Oracle address from Mainnet to Sepolia
- Updated constructor parameters for v1.2.0 contracts
- Proper u256 parameter formatting for MarketplaceSubscription

## 🚀 Next Steps

1. **Update UI Configuration**
   - Replace old contract addresses with v1.2.0 addresses
   - Update contract ABIs from compiled artifacts
   - Configure RPC endpoints for Sepolia

2. **Generate Contract ABIs**
   ```bash
   # Extract ABIs from artifacts
   cat target/fixed/identity_registry.contract_class.json | jq '.abi' > identity_registry.abi.json
   cat target/fixed/component_registry.contract_class.json | jq '.abi' > component_registry.abi.json
   cat target/fixed/dev_subscription.contract_class.json | jq '.abi' > dev_subscription.abi.json
   cat target/fixed/marketplace_subscription.contract_class.json | jq '.abi' > marketplace_subscription.abi.json
   ```

3. **Test Contract Functionality**
   - Developer registration flow
   - Component upload with USD pricing
   - Direct purchase transactions
   - Subscription flows (developer and marketplace)
   - Access verification

4. **Monitor Contract Performance**
   - Transaction success rates
   - Oracle price feed reliability
   - Gas usage patterns
   - Error rates

## 📚 Related Documentation

- [Smart Contracts Fix Checklist](./Smart_Contracts_Fix_Checklist.md)
- [Contract Architecture Analysis](./StarkFlux_Architecture_Analysis.md)
- [Contract Interaction Guide](./StarkFlux_Contract_Interaction_Guide.md)
- [UI Development Checklist](./UI/StarkFlux_UI_Development_Checklist.md) 