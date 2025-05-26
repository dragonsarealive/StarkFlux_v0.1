# Gap Solution Checklist for StarkFlux Smart Contracts

This document provides detailed implementation steps to address all gaps identified in the gap analysis, ensuring compatibility between contracts and compliance with requirements in smartContractsReqs.md.

## Priority 1: Type Consistency

### 1.1 Update Component ID Type in Common Package ✅
- **Description**: Standardize on u64 for component_id across all contracts
- **Implementation Steps**:
  ```cairo
  // In common/src/types.cairo
  #[derive(Drop, Copy, starknet::Store, Serde)]
  struct Component {
      id: u64, // Use u64 consistently, NOT u128
      title: felt252,
      reference: felt252,
      seller: ContractAddress,
      pricing: Pricing,
      price_feed_key: felt252,
      is_active: bool,
      registration_timestamp: u64,
      access_flags: u8,
  }
  ```
- **Verification**: Ensure Component struct uses u64 for id field
- **Affected Files**: `packages/common/src/types.cairo`

### 1.2 Update Interface Definitions for Component Registry ✅
- **Description**: Make interface parameter types consistent
- **Implementation Steps**:
  ```cairo
  // In common/src/interfaces.cairo
  #[starknet::interface]
  trait IComponentRegistryExternal<TContractState> {
      // Use u64 for component_id instead of u128
      fn register_component(
          ref self: TContractState,
          title: felt252,
          reference: felt252,
          price_strk: u128,
          price_usd_micros: u128,
          price_feed_key: felt252,
          access_flags: u8
      ) -> u64; // Return type changed to u64
      
      fn get_component(self: @TContractState, component_id: u64) -> Component;
      fn get_current_price(self: @TContractState, component_id: u64) -> felt252;
      fn purchase_component(ref self: TContractState, component_id: u64);
      // Update remaining function signatures...
  }
  ```
- **Verification**: All component_id parameters use u64 consistently
- **Affected Files**: `packages/common/src/interfaces.cairo`

### 1.3 Replace LegacyMap with Map ✅
- **Description**: Update all storage containers to use Map instead of LegacyMap
- **Implementation Steps**:
  ```cairo
  // Example for IdentityRegistry
  #[storage]
  struct Storage {
      next_id: u64,
      id_by_owner: Map::<ContractAddress, u64>,
      identities: Map::<u64, Identity>,
      // Other storage variables...
  }
  ```
- **Verification**: No usage of LegacyMap in any contract
- **Affected Files**: All contract implementation files

## Priority 2: Oracle Integration

### 2.1 Implement OraclePriceCfg Struct ✅
- **Description**: Create a standard struct for Oracle price configuration
- **Implementation Steps**:
  ```cairo
  // In common/src/types.cairo
  #[derive(Drop, Copy, starknet::Store, Serde)]
  struct OraclePriceCfg {
      price_usd_micros: u256,  // Price in USD with 6 decimals
      price_feed_key: felt252, // Pragma Oracle pair ID (e.g., STRK/USD)
  }
  ```
- **Verification**: Struct is properly defined and used consistently
- **Affected Files**: `packages/common/src/types.cairo`

### 2.2 Implement USD-to-STRK Conversion Function ✅
- **Description**: Create reusable conversion function with proper error handling
- **Implementation Steps**:
  ```cairo
  // In each contract that needs Oracle price conversion
  fn _usd_to_strk(
      self: @ContractState,
      cfg: OraclePriceCfg,
      max_staleness: u64
  ) -> u256 {
      // 1. Verify price_usd_micros and price_feed_key are valid
      assert(cfg.price_usd_micros > 0, ErrInvalidPricing);
      assert(cfg.price_feed_key != 0, ErrPriceFeedKeyNeeded);
      
      // 2. Get STRK/USD price from Oracle
      let oracle_dispatcher = IPragmaOracleDispatcher { 
          contract_address: self.pragma_oracle_address.read() 
      };
      let (price_strk_usd, decimals, last_updated_timestamp, _) = 
          oracle_dispatcher.get_median(cfg.price_feed_key);
      
      // 3. Validate Oracle response
      assert(price_strk_usd > 0, ErrOraclePriceZero);
      
      // 4. Check staleness
      let now = get_block_timestamp();
      assert(now - last_updated_timestamp <= max_staleness, ErrOraclePriceStale);
      
      // 5. Calculate price in STRK
      // Note: price_strk_usd is STRK/USD, so we divide USD price by this value
      let oracle_power = math_utils::get_oracle_power_of_10(decimals);
      let usd_micros_scaling = math_utils::u256_from_u128(1_000_000); // 10^6 for micros
      
      // (USD_price * oracle_power) / (STRK_USD_price * USD_micro_scaling)
      let calculated_strk = (cfg.price_usd_micros * oracle_power) / 
          (math_utils::u256_from_u128(price_strk_usd) * usd_micros_scaling);
      
      // 6. Safety check for extremely large prices
      assert(calculated_strk.high == 0, ErrPriceTooLarge);
      
      calculated_strk
  }
  ```
- **Verification**: Function handles all error cases and performs correct conversion
- **Affected Files**: All contract implementation files that require Oracle pricing

### 2.3 Implement get_oracle_power_of_10 Utility ✅
- **Description**: Add utility function for Oracle decimal handling
- **Implementation Steps**:
  ```cairo
  // In common/src/math_utils.cairo
  fn get_oracle_power_of_10(decimals: u8) -> u256 {
      // Common decimal values: 6, 8, 10, 12
      match decimals {
          6 => u256 { low: 1_000_000, high: 0 },
          8 => u256 { low: 100_000_000, high: 0 },
          10 => u256 { low: 10_000_000_000, high: 0 },
          12 => u256 { low: 1_000_000_000_000, high: 0 },
          18 => u256 { low: 1_000_000_000_000_000_000, high: 0 },
          _ => {
              // Fallback calculation for uncommon decimals
              let mut result = u256 { low: 1, high: 0 };
              let ten = u256 { low: 10, high: 0 };
              let mut i = 0;
              
              while i < decimals {
                  result = result * ten;
                  i += 1;
              }
              
              result
          }
      }
  }
  ```
- **Verification**: Function returns correct powers of 10 for different decimal values
- **Affected Files**: `packages/common/src/math_utils.cairo`

## Priority 3: Fee Distribution Logic

### 3.1 Implement ComponentRegistry Fee Distribution (80/10/10) ✅
- **Description**: Implement the fee distribution logic for direct purchases
- **Implementation Steps**:
  ```cairo
  // In ComponentRegistry.cairo
  fn _handle_payment_distribution(
      ref self: ContractState, 
      total_price_strk_u128: u128, 
      seller: ContractAddress,
      buyer: ContractAddress 
  ) -> (u128, u128, u128) {
      let strk_token_addr = self.strk_token_address.read();
      let strk_dispatcher = IERC20Dispatcher { contract_address: strk_token_addr };
      
      // Transfer total amount from buyer to this contract first
      strk_dispatcher.transfer_from(
          buyer, 
          starknet::get_contract_address(), 
          u256_from_u128(total_price_strk_u128)
      );
      
      let platform_treasury = self.platform_treasury_address.read();
      let liquidity_vault = self.liquidity_vault_address.read();
      let platform_bp = self.platform_fee_bp.read(); // Should be 1000 (10%)
      let liquidity_bp = self.liquidity_fee_bp.read(); // Should be 1000 (10%)
      
      // Calculate fees using math_utils::calculate_percentage
      let platform_fee_u128 = math_utils::calculate_percentage(
          total_price_strk_u128, platform_bp
      );
      let liquidity_fee_u128 = math_utils::calculate_percentage(
          total_price_strk_u128, liquidity_bp
      );
      
      // Calculate seller share (80%)
      let total_fees_u128 = platform_fee_u128 + liquidity_fee_u128;
      let seller_share_u128 = total_price_strk_u128 - total_fees_u128;
      
      // Perform transfers
      if platform_fee_u128 > 0 {
          strk_dispatcher.transfer(
              platform_treasury, 
              u256_from_u128(platform_fee_u128)
          );
      }
      
      if liquidity_fee_u128 > 0 {
          strk_dispatcher.transfer(
              liquidity_vault, 
              u256_from_u128(liquidity_fee_u128)
          );
      }
      
      if seller_share_u128 > 0 {
          strk_dispatcher.transfer(
              seller, 
              u256_from_u128(seller_share_u128)
          );
      }
      
      (seller_share_u128, platform_fee_u128, liquidity_fee_u128)
  }
  ```
- **Verification**: Test with various price values, confirm 80/10/10 split
- **Affected Files**: `packages/component_registry/src/component_registry.cairo`

### 3.2 Implement MarketplaceSubscription Fee Distribution (45/45/10) ✅
- **Description**: Implement subscription fee distribution for marketplace subscription
- **Implementation Steps**:
  ```cairo
  // In MarketplaceSubscription.cairo
  fn _handle_subscription_payment(
      ref self: ContractState,
      subscriber: ContractAddress,
      subscription_fee: u256
  ) {
      // Pull subscription fee from subscriber
      let erc20 = IERC20Dispatcher { contract_address: self.strk_token.read() };
      erc20.transfer_from(
          subscriber,
          starknet::get_contract_address(),
          subscription_fee
      );
      
      // Calculate splits (45/45/10)
      let platform_fee = calculate_fee_share(subscription_fee, PLATFORM_FEE_BPS);    // 45%
      let liquidity_fee = calculate_fee_share(subscription_fee, LIQUIDITY_FEE_BPS);  // 10% 
      let reward_pool_share = calculate_fee_share(subscription_fee, DEVELOPER_FEE_BPS); // 45%
      
      // Verify split adds up to 100% (within rounding error)
      let total_distributed = platform_fee + liquidity_fee + reward_pool_share;
      assert(
          subscription_fee >= total_distributed && 
          subscription_fee - total_distributed <= u256 { low: 10, high: 0 },
          'Fee split error'
      );
      
      // Transfer platform and liquidity fees
      let platform_treasury = self.marketplace_vault.read();
      let liquidity_vault = self.liquidity_vault.read();
      
      erc20.transfer(platform_treasury, platform_fee);
      erc20.transfer(liquidity_vault, liquidity_fee);
      
      // Add remainder to reward pool
      self.reward_pool_strk.write(uint256_add(self.reward_pool_strk.read(), reward_pool_share));
  }
  ```
- **Verification**: Test with various fee values, confirm 45/45/10 split
- **Affected Files**: `packages/marketplace_subscription/src/marketplace_subscription.cairo`

### 3.3 Implement DevSubscription Fee Distribution (80/10/10) ✅
- **Description**: Implement subscription fee distribution for developer subscription
- **Implementation Steps**:
  ```cairo
  // In DevSubscription.cairo
  fn _handle_subscription_payment(
      ref self: ContractState,
      dev_id: u64,
      subscriber: ContractAddress,
      subscription_fee: u256
  ) {
      // Get developer address from identity registry
      let identity_registry = self.identity_registry_address.read();
      let identity_registry_dispatcher = IUniversalIdentityRegistryDispatcher { 
          contract_address: identity_registry 
      };
      let identity = identity_registry_dispatcher.get_identity(dev_id);
      let developer_address = identity.owner;
      
      // Transfer total fee from subscriber
      let strk_token = self.strk_token.read();
      let token_dispatcher = IERC20Dispatcher { contract_address: strk_token };
      token_dispatcher.transfer_from(
          subscriber,
          starknet::get_contract_address(),
          subscription_fee
      );
      
      // Calculate 80/10/10 split
      let dev_fee = _calculate_fee_share(subscription_fee, DEVELOPER_FEE_BPS);       // 80%
      let platform_fee = _calculate_fee_share(subscription_fee, PLATFORM_FEE_BPS);   // 10%
      let liquidity_fee = _calculate_fee_share(subscription_fee, LIQUIDITY_FEE_BPS); // 10%
      
      // Verify split adds up to 100% (within rounding error)
      let total_distributed = dev_fee + platform_fee + liquidity_fee;
      assert(
          subscription_fee >= total_distributed && 
          subscription_fee - total_distributed <= u256 { low: 10, high: 0 },
          'Fee split error'
      );
      
      // Transfer shares
      let platform_treasury = self.platform_treasury.read();
      let liquidity_vault = self.liquidity_vault.read();
      
      token_dispatcher.transfer(developer_address, dev_fee);
      token_dispatcher.transfer(platform_treasury, platform_fee);
      token_dispatcher.transfer(liquidity_vault, liquidity_fee);
  }
  ```
- **Verification**: Test with various fee values, confirm 80/10/10 split
- **Affected Files**: `packages/dev_subscription/src/dev_subscription.cairo`

## Priority 4: FREE Flag Implementation

### 4.1 Update AccessFlags in Common Package ✅
- **Description**: Define and document the FREE flag constant
- **Implementation Steps**:
  ```cairo
  // In common/src/types.cairo
  mod AccessFlags {
      const BUY: u8 = 1;      // Can be purchased directly
      const DEV_SUB: u8 = 2;  // Available via developer subscription
      const MKT_SUB: u8 = 4;  // Available via marketplace subscription
      const FREE: u8 = 8;     // Free for everyone (no monetization)
  }
  ```
- **Verification**: All flags are properly defined with correct bit values
- **Affected Files**: `packages/common/src/types.cairo`

### 4.2 Implement FREE Flag Validation in ComponentRegistry ✅
- **Description**: Add validation logic for FREE flag in component registration
- **Implementation Steps**:
  ```cairo
  // In ComponentRegistry.register_component() function
  // Verify access_flags is not zero
  assert(access_flags != 0, 'ERR_ACCESS_FLAGS_ZERO');
  
  // Reject if FREE is combined with any monetization flag
  if access_flags & AccessFlags::FREE != 0 {
      // Must be free-only (no BUY, DEV_SUB, or MKT_SUB)
      assert(access_flags == AccessFlags::FREE, 'ERR_INVALID_FREE_COMBO');
      assert(price_strk == 0 && price_usd_micros == 0, 'ERR_FREE_MUST_BE_ZERO_PRICE');
  } else {
      // Normal pricing validation for non-free components
      assert(
          (price_strk > 0 && price_usd_micros == 0) || 
          (price_usd_micros > 0 && price_strk == 0),
          ErrInvalidPricing
      );
      
      // If BUY flag is set, require at least one price field to be > 0
      if access_flags & AccessFlags::BUY != 0 {
          assert(price_strk > 0 || price_usd_micros > 0, 'ERR_BUY_REQUIRES_PRICE');
      }
  }
  ```
- **Verification**: Test component registration with various flag combinations
- **Affected Files**: `packages/component_registry/src/component_registry.cairo`

### 4.3 Block Purchase of FREE Components ✅
- **Description**: Add check in purchase_component to block purchases of FREE components
- **Implementation Steps**:
  ```cairo
  // In ComponentRegistry.purchase_component() function
  // Early return for FREE components - no need for payment or duplicate check
  if component.access_flags & AccessFlags::FREE != 0 {
      // Free components don't need purchase processing
      // Just return directly without doing any payment logic
      return;
  }
  
  // For paid components, continue with normal purchase logic
  let key = purchase_key(component_id, buyer);
  assert(self.purchases.read(key) == 0.into(), ErrAlreadyPurchased);
  ```
- **Verification**: Test purchase_component with FREE components, ensure no payment occurs
- **Affected Files**: `packages/component_registry/src/component_registry.cairo`

### 4.4 Implement is_free View Function ✅
- **Description**: Add helper function to check if a component is free
- **Implementation Steps**:
  ```cairo
  // In ComponentRegistry.cairo
  fn is_free(self: @ContractState, component_id: u64) -> bool {
      let component = self.components.read(component_id);
      assert(component.id != 0, ErrComponentNotFound);
      return component.access_flags & AccessFlags::FREE != 0;
  }
  ```
- **Verification**: Test with both FREE and paid components
- **Affected Files**: `packages/component_registry/src/component_registry.cairo`

## Priority 5: External Contract Calls

### 5.1 Implement IdentityRegistry Calls in ComponentRegistry ✅
- **Description**: Add proper calls to record_upload and record_sale
- **Implementation Steps**:
  ```cairo
  // In ComponentRegistry.register_component() function - after saving component
  let identity_registry_addr = self.identity_registry_address.read();
  IUniversalIdentityRegistryDispatcher { 
      contract_address: identity_registry_addr 
  }.record_upload(caller);
  
  // In ComponentRegistry.purchase_component() function - after payment distribution
  let identity_registry_addr = self.identity_registry_address.read();
  IUniversalIdentityRegistryDispatcher { 
      contract_address: identity_registry_addr 
  }.record_sale(seller, price_strk_u128);
  ```
- **Verification**: Test registration and purchase, verify IdentityRegistry records updates
- **Affected Files**: `packages/component_registry/src/component_registry.cairo`

### 5.2 Implement MarketplaceSubscription Call in ComponentRegistry ✅
- **Description**: Add proper call to record_download for marketplace subscription tracking
- **Implementation Steps**:
  ```cairo
  // In ComponentRegistry.record_download() function
  fn record_download(ref self: ContractState, wallet: ContractAddress, component_id: u64) {
      let caller = get_caller_address();
      let component = self.components.read(component_id);
      assert(component.id != 0, ErrComponentNotFound);
      
      // Caller must be either the wallet itself, component seller, or contract owner
      assert(
          caller == wallet || caller == component.seller || caller == self.owner_address.read(),
          'ERR_NOT_AUTHORIZED'
      );
      
      // Allow FREE components to be downloaded without subscription check
      let is_free = component.access_flags & AccessFlags::FREE != 0;
      // For non-free components, check they have the marketplace subscription access flag
      if !is_free {
          assert(component.access_flags & AccessFlags::MKT_SUB != 0, 'ERR_NOT_MKT_SUB_ELIGIBLE');
      }
      
      // Forward to subscription manager
      let subscription_manager = self.subscription_manager_address.read();
      assert(subscription_manager != ZERO_ADDRESS, 'ERR_NO_SUB_MGR_SET');
      
      let subscription_dispatcher = IMarketplaceSubscriptionDispatcher { 
          contract_address: subscription_manager 
      };
      subscription_dispatcher.record_download(wallet, component_id);
  }
  ```
- **Verification**: Test download recording, verify MarketplaceSubscription receives call
- **Affected Files**: `packages/component_registry/src/component_registry.cairo`

### 5.3 Implement purchase_key Function ✅
- **Description**: Implement a purchase_key function for tracking purchases
- **Implementation Steps**:
  ```cairo
  // In ComponentRegistry.cairo
  fn purchase_key(component_id: u64, buyer: ContractAddress) -> felt252 {
      // Simple concatenation to create a unique key
      (component_id.into() * 0x100000000000000000000000000000000) + buyer.into()
  }
  ```
- **Verification**: Test with various inputs, ensure consistent key generation
- **Affected Files**: `packages/component_registry/src/component_registry.cairo`

## Priority 6: Helper Functions and Access Control

### 6.1 Implement _only_owner Helper ✅
- **Description**: Add access control helper for owner-only functions
- **Implementation Steps**:
  ```cairo
  // In ComponentRegistry.cairo
  fn _only_owner(self: @ContractState) {
      let caller = get_caller_address();
      let owner = self.owner_address.read();
      assert(caller == owner, ErrOwnerOnly);
  }
  ```
- **Verification**: Test with both owner and non-owner callers
- **Affected Files**: All contract implementation files that require owner functions

### 6.2 Complete Two-Step Ownership Transfer ✅
- **Description**: Implement ownership transfer and acceptance
- **Implementation Steps**:
  ```cairo
  // In ComponentRegistry.cairo
  fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
      self._only_owner();
      assert(new_owner != ZERO_ADDRESS, ErrZeroAddress);
      self.pending_owner_address.write(new_owner);
      self.emit(Event::OwnershipTransferStarted(OwnershipTransferStarted {
          previous_owner: self.owner_address.read(),
          new_owner: new_owner,
      }));
  }
  
  fn accept_ownership(ref self: ContractState) {
      let caller = get_caller_address();
      let pending_owner = self.pending_owner_address.read();
      assert(caller == pending_owner, ErrPendingOwnerCaller);
      assert(caller != ZERO_ADDRESS, ErrZeroAddress); 
      let previous_owner = self.owner_address.read();
      self.owner_address.write(caller);
      self.pending_owner_address.write(ZERO_ADDRESS);
      self.emit(Event::OwnershipTransferred(OwnershipTransferred {
          previous_owner: previous_owner,
          new_owner: caller,
      }));
  }
  ```
- **Verification**: Test complete ownership transfer flow
- **Affected Files**: All contract implementation files that require ownership transfer

## Testing and Verification

### Integration Testing
1. **Cross-Contract Flow Test**: Test all flows in the provided flow diagram
   - Registration → Record Upload
   - Purchase → Fee Distribution → Record Sale
   - Subscription (both types) → Fee Distribution
   - Record Download → Download Recording

### USD Pricing Tests
1. **Oracle Price Conversion**: Test with various USD prices and exchange rates
2. **Staleness Checks**: Test with stale oracle data, verify rejection
3. **Zero Price Handling**: Test with zero price data, verify rejection

### Fee Distribution Tests
1. **Direct Purchase**: Verify 80/10/10 split with various price points
2. **Marketplace Subscription**: Verify 45/45/10 split with various fee amounts
3. **Developer Subscription**: Verify 80/10/10 split with various fee amounts
4. **Edge Cases**: Test with minimum possible payments, verify correct splits

### FREE Component Tests
1. **Registration**: Test FREE flag validation, combinations with other flags
2. **Purchase Attempts**: Verify FREE components cannot be purchased
3. **Download Access**: Verify FREE components can be downloaded without subscription

### Type Consistency Tests
1. **Interface Compatibility**: Ensure all contracts use compatible types
2. **Parameter Passing**: Test all cross-contract calls with large values

## Deployment Checklist

1. **Contract Order**:
   - Deploy IdentityRegistry first
   - Deploy ComponentRegistry with IdentityRegistry address
   - Deploy MarketplaceSubscription with ComponentRegistry address
   - Deploy DevSubscription with IdentityRegistry address
   - Configure ComponentRegistry with subscription manager addresses

2. **Configuration Verification**:
   - Verify fee basis points are set correctly in each contract
   - Verify oracle address is set and working
   - Test USD pricing with a sample component

3. **UI Integration Tests**:
   - Test all view functions needed by UI
   - Verify event emissions for UI updates 