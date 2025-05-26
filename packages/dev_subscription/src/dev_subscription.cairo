// Version V1.2.0 - Fixed Storage Implementation
// Developer Subscription Contract - Manages developer-specific subscriptions

#[starknet::contract]
mod DevSubscription {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use core::integer::{u64, u128, u256};
    use core::num::traits::zero::Zero;
    use common::interfaces::{
        IERC20Dispatcher, IERC20DispatcherTrait,
        IUniversalIdentityRegistryDispatcher, IUniversalIdentityRegistryDispatcherTrait,
        IDevSubscription, IPragmaOracleDispatcher, IPragmaOracleDispatcherTrait,
        IComponentRegistryExternalDispatcher, IComponentRegistryExternalDispatcherTrait
    };
    use common::math_utils;
    use common::types::{OraclePriceCfg, AccessFlags};

    // Contract version
    const CONTRACT_VERSION: felt252 = 'v1.2.0';

    // Fee constants
    const DEVELOPER_FEE_BPS: u16 = 8000; 
    const PLATFORM_FEE_BPS: u16 = 1000;
    const LIQUIDITY_FEE_BPS: u16 = 1000;
    const BASIS_POINT_DENOMINATOR: u16 = 10000;

    // Other constants
    const DEFAULT_SUBSCRIPTION_DURATION: u64 = 2592000; // 30 days in seconds
    const PRAGMA_STRK_USD_PAIR_ID: felt252 = selector!("STRK/USD");

    // Error constants
    const ErrZeroAddress: felt252 = 'ERR_ZERO_ADDRESS';
    const ErrOwnerOnly: felt252 = 'ERR_OWNER_ONLY';
    const ErrDevOnly: felt252 = 'ERR_DEV_ONLY';
    const ErrPriceZero: felt252 = 'ERR_PRICE_ZERO';
    const ErrInvalidPrice: felt252 = 'ERR_INVALID_PRICE';
    const ErrTransferFailed: felt252 = 'ERR_TRANSFER_FAILED';
    const ErrOracleDataInvalid: felt252 = 'ERR_ORACLE_DATA_INVALID';
    const ErrClockError: felt252 = 'ERR_CLOCK_ERROR';
    const ErrOraclePriceStale: felt252 = 'ERR_ORACLE_PRICE_STALE';
    const ErrOraclePriceZero: felt252 = 'ERR_ORACLE_PRICE_ZERO';
    const ErrPriceTooLarge: felt252 = 'ERR_PRICE_TOO_LARGE';

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Subscribed: Subscribed,
        PriceSet: PriceSet,
        PriceUsdSet: PriceUsdSet,
    }

    #[derive(Drop, starknet::Event)]
    struct Subscribed {
        #[key]
        user: ContractAddress,
        #[key]
        dev_id: u64,
        expiry: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct PriceSet {
        #[key]
        dev_id: u64,
        price: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct PriceUsdSet {
        #[key]
        dev_id: u64,
        price_usd_micros: u256,
        price_feed_key: felt252,
    }

    #[storage]
    struct Storage {
        // Core addresses
        identity_registry: ContractAddress,
        platform_treasury: ContractAddress,
        liquidity_vault: ContractAddress,
        strk_token: ContractAddress,
        pragma_oracle_address: ContractAddress,
        component_registry: ContractAddress,
        
        // Configuration
        sub_duration_secs: u64,
        oracle_max_staleness: u64,
        owner: ContractAddress,
        version: felt252,
        
        // Subscription data using felt252 keys
        subscription_expiry_storage: LegacyMap<felt252, u64>,
        dev_prices_storage: LegacyMap<felt252, u256>,
        dev_price_cfg_storage: LegacyMap<felt252, OraclePriceCfg>,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        identity_registry: ContractAddress,
        platform_treasury: ContractAddress,
        liquidity_vault: ContractAddress,
        strk_token: ContractAddress,
        pragma_oracle_address: ContractAddress,
        component_registry: ContractAddress
    ) {
        // Validate inputs
        assert(!identity_registry.is_zero(), ErrZeroAddress);
        assert(!platform_treasury.is_zero(), ErrZeroAddress);
        assert(!liquidity_vault.is_zero(), ErrZeroAddress);
        assert(!strk_token.is_zero(), ErrZeroAddress);
        assert(!pragma_oracle_address.is_zero(), ErrZeroAddress);
        assert(!component_registry.is_zero(), ErrZeroAddress);

        // Set contract addresses
        self.identity_registry.write(identity_registry);
        self.platform_treasury.write(platform_treasury);
        self.liquidity_vault.write(liquidity_vault);
        self.strk_token.write(strk_token);
        self.pragma_oracle_address.write(pragma_oracle_address);
        self.component_registry.write(component_registry);

        // Set default subscription duration (30 days)
        self.sub_duration_secs.write(DEFAULT_SUBSCRIPTION_DURATION);
        
        // Set default oracle staleness (5 minutes)
        self.oracle_max_staleness.write(300);

        // Set owner to caller
        let caller = get_caller_address();
        self.owner.write(caller);
        
        // Set version
        self.version.write(CONTRACT_VERSION);
    }

    // Storage helper functions
    #[generate_trait]
    impl DevSubscriptionHelpers of DevSubscriptionHelpersTrait {
        fn _subscription_key(self: @ContractState, dev_id: u64, user: ContractAddress) -> felt252 {
            // Create unique key for subscription expiry
            dev_id.into() * 1000000000000000000 + user.into()
        }
        
        fn _dev_price_key(self: @ContractState, dev_id: u64) -> felt252 {
            // Create unique key for dev price
            dev_id.into() * 1000000 + 'price'
        }
        
        fn _dev_cfg_key(self: @ContractState, dev_id: u64) -> felt252 {
            // Create unique key for dev price config
            dev_id.into() * 1000000 + 'cfg'
        }
        
        fn _get_subscription_expiry(self: @ContractState, dev_id: u64, user: ContractAddress) -> u64 {
            let key = self._subscription_key(dev_id, user);
            self.subscription_expiry_storage.read(key)
        }
        
        fn _set_subscription_expiry(ref self: ContractState, dev_id: u64, user: ContractAddress, expiry: u64) {
            let key = self._subscription_key(dev_id, user);
            self.subscription_expiry_storage.write(key, expiry);
        }
        
        fn _get_dev_price(self: @ContractState, dev_id: u64) -> u256 {
            let key = self._dev_price_key(dev_id);
            self.dev_prices_storage.read(key)
        }
        
        fn _set_dev_price(ref self: ContractState, dev_id: u64, price: u256) {
            let key = self._dev_price_key(dev_id);
            self.dev_prices_storage.write(key, price);
        }
        
        fn _get_dev_price_cfg(self: @ContractState, dev_id: u64) -> OraclePriceCfg {
            let key = self._dev_cfg_key(dev_id);
            self.dev_price_cfg_storage.read(key)
        }
        
        fn _set_dev_price_cfg(ref self: ContractState, dev_id: u64, cfg: OraclePriceCfg) {
            let key = self._dev_cfg_key(dev_id);
            self.dev_price_cfg_storage.write(key, cfg);
        }
        
        fn _only_owner(self: @ContractState) {
            assert(get_caller_address() == self.owner.read(), ErrOwnerOnly);
        }
        
        fn _check_developer_owner(self: @ContractState, dev_id: u64, caller: ContractAddress) -> bool {
            let identity_registry = self.identity_registry.read();
            let identity_registry_dispatcher = IUniversalIdentityRegistryDispatcher {
                contract_address: identity_registry
            };
            
            // Get the developer's identity
            let identity = identity_registry_dispatcher.get_identity(dev_id);
            let developer_address = identity.owner;
            
            // Check if caller is the developer
            caller == developer_address
        }
        
        fn _usd_to_strk(self: @ContractState, cfg: OraclePriceCfg) -> u256 {
            // Oracle conversion implementation
            let oracle_addr = self.pragma_oracle_address.read();
            let max_staleness = self.oracle_max_staleness.read();
            
            let oracle_dispatcher = IPragmaOracleDispatcher { contract_address: oracle_addr };
            
            // Get STRK/USD price data
            let (price_u128, decimals, last_updated_timestamp, _num_sources) = 
                oracle_dispatcher.get_median(PRAGMA_STRK_USD_PAIR_ID);
            
            // Check staleness
            let current_time = get_block_timestamp();
            assert(current_time >= last_updated_timestamp, ErrClockError);
            assert(current_time - last_updated_timestamp <= max_staleness, ErrOraclePriceStale);
            
            // Validate price
            assert(price_u128 > 0, ErrOraclePriceZero);
            
            // Convert price from oracle format to u256
            let oracle_price_u256 = math_utils::u256_from_u128(price_u128);
            let oracle_decimals_factor = math_utils::get_oracle_power_of_10(decimals);
            
            // Calculate: (USD_amount_in_micros * oracle_decimals_factor * STRK_scaling) / (oracle_price * USD_micros_scaling)
            let numerator = math_utils::u256_safe_mul(
                math_utils::u256_safe_mul(cfg.price_usd_micros, oracle_decimals_factor),
                math_utils::STRK_SCALING_FACTOR_U256
            );
            
            let denominator = math_utils::u256_safe_mul(
                oracle_price_u256,
                math_utils::USD_MICROS_SCALING_FACTOR_U256
            );
            
            math_utils::u256_safe_div(numerator, denominator)
        }
        
        fn _calculate_fee_share(total: u256, basis_points: u16) -> u256 {
            math_utils::uint256_div_u16(
                math_utils::uint256_mul_u16(total, basis_points),
                BASIS_POINT_DENOMINATOR
            )
        }
        
        fn _handle_subscription_payment(
            ref self: ContractState,
            dev_id: u64,
            subscriber: ContractAddress,
            total_price: u256
        ) {
            // Get developer address from identity registry
            let identity_registry = self.identity_registry.read();
            let identity_registry_dispatcher = IUniversalIdentityRegistryDispatcher {
                contract_address: identity_registry
            };
            let identity = identity_registry_dispatcher.get_identity(dev_id);
            let developer_address = identity.owner;
            
            // Get token addresses
            let platform_treasury = self.platform_treasury.read();
            let liquidity_vault = self.liquidity_vault.read();
            let strk_token = self.strk_token.read();
            
            // Create token dispatcher
            let token_dispatcher = IERC20Dispatcher { contract_address: strk_token };
            
            // First transfer the total amount from subscriber to the contract
            let contract_address = starknet::get_contract_address();
            let success_transfer = token_dispatcher.transfer_from(subscriber, contract_address, total_price);
            assert(success_transfer, ErrTransferFailed);
            
            // Calculate fee shares (80/10/10 split)
            let dev_fee = DevSubscriptionHelpers::_calculate_fee_share(total_price, DEVELOPER_FEE_BPS);
            let platform_fee = DevSubscriptionHelpers::_calculate_fee_share(total_price, PLATFORM_FEE_BPS);
            let liquidity_fee = DevSubscriptionHelpers::_calculate_fee_share(total_price, LIQUIDITY_FEE_BPS);
            
            // Distribute funds
            if !dev_fee.is_zero() {
                token_dispatcher.transfer(developer_address, dev_fee);
            }
            
            if !platform_fee.is_zero() {
                token_dispatcher.transfer(platform_treasury, platform_fee);
            }
            
            if !liquidity_fee.is_zero() {
                token_dispatcher.transfer(liquidity_vault, liquidity_fee);
            }
        }
    }

    // ABI implementation
    #[abi(embed_v0)]
    impl DevSubscriptionImpl of common::interfaces::IDevSubscription<ContractState> {
        fn subscribe(ref self: ContractState, dev_id: u64) {
            let caller = get_caller_address();
            
            // Get the subscription price for this developer
            let price = self.get_price(dev_id);
            
            // Ensure price is set
            assert(!price.is_zero(), ErrInvalidPrice);
            
            // Get current timestamp and existing subscription if any
            let current_time = get_block_timestamp();
            let existing_expiry = DevSubscriptionHelpers::_get_subscription_expiry(@self, dev_id, caller);
            
            // Calculate new expiry (if already subscribed, extend from current expiry)
            let sub_duration = self.sub_duration_secs.read();
            let new_expiry = if existing_expiry > current_time {
                existing_expiry + sub_duration
            } else {
                current_time + sub_duration
            };
            
            // Update subscription expiry
            DevSubscriptionHelpers::_set_subscription_expiry(ref self, dev_id, caller, new_expiry);
            
            // Process payment with 80/10/10 fee distribution
            DevSubscriptionHelpers::_handle_subscription_payment(
                ref self, 
                dev_id,
                caller,
                price
            );
            
            // Emit subscription event
            self.emit(Event::Subscribed(Subscribed { 
                user: caller,
                dev_id,
                expiry: new_expiry
            }));
        }

        fn is_subscribed(self: @ContractState, user: ContractAddress, dev_id: u64) -> bool {
            // Get current timestamp and subscription expiry
            let current_time = get_block_timestamp();
            let expiry = DevSubscriptionHelpers::_get_subscription_expiry(self, dev_id, user);
            
            // Check if subscription is still active
            current_time <= expiry
        }

        fn set_price(ref self: ContractState, dev_id: u64, price: u256) {
            let caller = get_caller_address();
            
            // Check if caller is the owner of the contract or the developer
            let is_contract_owner = caller == self.owner.read();
            let is_developer_owner = DevSubscriptionHelpers::_check_developer_owner(@self, dev_id, caller);
            
            // Only allow the contract owner or the developer to set the price
            assert(is_contract_owner || is_developer_owner, ErrDevOnly);
            
            // Can't set price to zero
            assert(!price.is_zero(), ErrPriceZero);
            
            // Clear USD price config to avoid conflicts between pricing models
            let empty_cfg = OraclePriceCfg {
                price_usd_micros: u256 { low: 0, high: 0 },
                price_feed_key: 0
            };
            DevSubscriptionHelpers::_set_dev_price_cfg(ref self, dev_id, empty_cfg);
            
            // Set the price
            DevSubscriptionHelpers::_set_dev_price(ref self, dev_id, price);
            
            // Emit event
            self.emit(Event::PriceSet(PriceSet { dev_id, price }));
        }

        fn get_price(self: @ContractState, dev_id: u64) -> u256 {
            // Read the fixed STRK price
            let strk_price = DevSubscriptionHelpers::_get_dev_price(self, dev_id);
            
            // If STRK price is set, return it
            if !strk_price.is_zero() {
                return strk_price;
            }
            
            // Otherwise, check if we have a USD price config
            let cfg = DevSubscriptionHelpers::_get_dev_price_cfg(self, dev_id);
            if !cfg.price_usd_micros.is_zero() {
                // Convert USD to STRK using oracle
                return DevSubscriptionHelpers::_usd_to_strk(self, cfg);
            }
            
            // No price is set
            u256 { low: 0, high: 0 }
        }

        fn get_subscription_expiry(self: @ContractState, user: ContractAddress, dev_id: u64) -> u64 {
            DevSubscriptionHelpers::_get_subscription_expiry(self, dev_id, user)
        }

        fn set_price_usd(ref self: ContractState, dev_id: u64, price_usd_micros: u256, price_feed_key: felt252) {
            let caller = get_caller_address();
            
            // Check if caller is the owner of the contract or the developer
            let is_contract_owner = caller == self.owner.read();
            let is_developer_owner = DevSubscriptionHelpers::_check_developer_owner(@self, dev_id, caller);
            
            // Only allow the contract owner or the developer to set the price
            assert(is_contract_owner || is_developer_owner, ErrDevOnly);
            
            // Can't set price to zero
            assert(!price_usd_micros.is_zero(), ErrPriceZero);
            assert(price_feed_key != 0, 'ERR_PRICE_FEED_KEY_ZERO');
            
            // Store the USD price config
            let cfg = OraclePriceCfg {
                price_usd_micros: price_usd_micros,
                price_feed_key: price_feed_key
            };
            DevSubscriptionHelpers::_set_dev_price_cfg(ref self, dev_id, cfg);
            
            // Clear STRK price to avoid conflicts between pricing models
            DevSubscriptionHelpers::_set_dev_price(ref self, dev_id, u256 { low: 0, high: 0 });
            
            // Emit event with USD price details
            self.emit(Event::PriceUsdSet(PriceUsdSet {
                dev_id,
                price_usd_micros,
                price_feed_key
            }));
        }

        fn get_price_usd(self: @ContractState, dev_id: u64) -> u256 {
            let cfg = DevSubscriptionHelpers::_get_dev_price_cfg(self, dev_id);
            cfg.price_usd_micros
        }

        fn get_version(self: @ContractState) -> felt252 {
            self.version.read()
        }
    }
} 