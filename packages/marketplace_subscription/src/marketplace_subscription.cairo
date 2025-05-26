// Version V1.2.0 - Fixed Storage Implementation
// Marketplace Subscription Contract - Manages global marketplace subscriptions

#[starknet::contract]
mod MarketplaceSubscription {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, get_contract_address};
    use core::integer::{u8, u16, u64, u128, u256};
    use core::num::traits::zero::Zero;
    use core::cmp::max;
    use common::interfaces::{
        IERC20Dispatcher, IERC20DispatcherTrait,
        IComponentRegistryExternalDispatcher, IComponentRegistryExternalDispatcherTrait,
        IPragmaOracleDispatcher, IPragmaOracleDispatcherTrait,
        IMarketplaceSubscription
    };
    use common::math_utils;
    use common::types::{Component, OraclePriceCfg, AccessFlags};

    // Contract version
    const CONTRACT_VERSION: felt252 = 'v1.2.0';

    // Oracle conversion constants
    const PRAGMA_STRK_USD_PAIR_ID: felt252 = selector!("STRK/USD");

    // Fee split constants (45/45/10)
    const DEVELOPER_FEE_BPS: u16 = 4500;
    const PLATFORM_FEE_BPS: u16 = 4500;
    const LIQUIDITY_FEE_BPS: u16 = 1000;
    const BASIS_POINT_DENOMINATOR: u16 = 10000;

    // Default values for epochs
    const DEFAULT_EPOCH_LENGTH: u64 = 2592000; // 30 days in seconds
    const DEFAULT_GRACE_WINDOW: u64 = 21600;   // 6 hours in seconds
    const DEFAULT_NEW_USER_BONUS: u8 = 2;      // 2x reward weight for first-time downloads

    // Error Constants
    const ErrZeroAddress: felt252 = 'ERR_ZERO_ADDRESS';
    const ErrOwnerOnly: felt252 = 'ERR_OWNER_ONLY';
    const ErrZeroFee: felt252 = 'ERR_ZERO_FEE';
    const ErrRegistryOnly: felt252 = 'ERR_REGISTRY_ONLY';
    const ErrSubscriptionRequired: felt252 = 'ERR_SUBSCRIPTION_REQUIRED';
    const ErrEpochStillActive: felt252 = 'ERR_EPOCH_STILL_ACTIVE';
    const ErrNotPendingOwner: felt252 = 'ERR_NOT_PENDING_OWNER';
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
        DownloadRecorded: DownloadRecorded,
        EpochStarted: EpochStarted,
        RewardPaid: RewardPaid,
        OwnershipTransferred: OwnershipTransferred,
        OwnershipTransferStarted: OwnershipTransferStarted,
    }

    #[derive(Drop, starknet::Event)]
    struct Subscribed {
        #[key]
        user: ContractAddress,
        expiry: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct DownloadRecorded {
        #[key]
        user: ContractAddress,
        #[key]
        component_id: u64,
        weight: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct EpochStarted {
        #[key]
        epoch_id: u64,
        start_ts: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardPaid {
        #[key]
        component_id: u64,
        seller: ContractAddress,
        amount: u256,
        epoch_id: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress,
        new_owner: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferStarted {
        previous_owner: ContractAddress,
        new_owner: ContractAddress,
    }

    #[storage]
    struct Storage {
        // Core addresses
        strk_token: ContractAddress,
        liquidity_vault: ContractAddress,
        marketplace_vault: ContractAddress,
        component_registry: ContractAddress,
        pragma_oracle_address: ContractAddress,
        owner: ContractAddress,
        pending_owner: ContractAddress,
        
        // Configuration
        sub_fee_cfg: OraclePriceCfg,
        sub_fee_strk: u256,
        oracle_max_staleness: u64,
        
        // Epoch tracking
        epoch_id: u64,
        epoch_start_ts: u64,
        epoch_length_secs: u64,
        grace_window_secs: u64,
        new_user_bonus: u8,
        
        // Accounting
        reward_pool_strk: u256,
        
        // Version
        version: felt252,
        
        // Storage using felt252 keys
        subscription_expiry_storage: LegacyMap<felt252, u64>,
        weighted_dl_storage: LegacyMap<felt252, u128>,
        seen_this_epoch_storage: LegacyMap<felt252, bool>,
        first_time_storage: LegacyMap<felt252, bool>,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        subscription_fee: u256,
        price_usd_micros: u256,
        price_feed_key: felt252,
        strk_token: ContractAddress,
        pragma_oracle: ContractAddress,
        liquidity_vault: ContractAddress,
        marketplace_vault: ContractAddress,
        component_registry: ContractAddress,
    ) {
        assert(!strk_token.is_zero(), ErrZeroAddress);
        assert(!pragma_oracle.is_zero(), ErrZeroAddress);
        assert(!liquidity_vault.is_zero(), ErrZeroAddress);
        assert(!marketplace_vault.is_zero(), ErrZeroAddress);
        assert(!component_registry.is_zero(), ErrZeroAddress);
        
        // Set core configuration
        self.sub_fee_strk.write(subscription_fee);
        self.sub_fee_cfg.write(OraclePriceCfg {
            price_usd_micros: price_usd_micros,
            price_feed_key: price_feed_key
        });
        self.strk_token.write(strk_token);
        self.pragma_oracle_address.write(pragma_oracle);
        self.oracle_max_staleness.write(600); // 10 minutes default
        self.liquidity_vault.write(liquidity_vault);
        self.marketplace_vault.write(marketplace_vault);
        self.component_registry.write(component_registry);
        self.owner.write(get_caller_address());
        
        // Set epoch defaults
        self.epoch_length_secs.write(DEFAULT_EPOCH_LENGTH);
        self.grace_window_secs.write(DEFAULT_GRACE_WINDOW);
        self.new_user_bonus.write(DEFAULT_NEW_USER_BONUS);
        
        // Initialize epoch
        self.epoch_id.write(1);
        self.epoch_start_ts.write(get_block_timestamp());
        self.reward_pool_strk.write(u256 { low: 0, high: 0 });
        
        // Set version
        self.version.write(CONTRACT_VERSION);
    }

    // Storage helper functions
    #[generate_trait]
    impl MarketplaceSubscriptionHelpers of MarketplaceSubscriptionHelpersTrait {
        fn _subscription_key(self: @ContractState, user: ContractAddress) -> felt252 {
            // Create unique key for subscription expiry
            user.into() * 1000000 + 'sub'
        }
        
        fn _weighted_dl_key(self: @ContractState, epoch: u64, component_id: u64) -> felt252 {
            // Create unique key for weighted downloads
            epoch.into() * 1000000000000 + component_id.into()
        }
        
        fn _seen_epoch_key(self: @ContractState, epoch: u64, wallet: ContractAddress, component_id: u64) -> felt252 {
            // Create unique key for seen this epoch tracking
            epoch.into() * 1000000000000000000 + wallet.into() * 1000000 + component_id.into()
        }
        
        fn _first_time_key(self: @ContractState, wallet: ContractAddress, component_id: u64) -> felt252 {
            // Create unique key for first time tracking
            wallet.into() * 1000000 + component_id.into()
        }
        
        fn _get_subscription_expiry(self: @ContractState, user: ContractAddress) -> u64 {
            let key = self._subscription_key(user);
            self.subscription_expiry_storage.read(key)
        }
        
        fn _set_subscription_expiry(ref self: ContractState, user: ContractAddress, expiry: u64) {
            let key = self._subscription_key(user);
            self.subscription_expiry_storage.write(key, expiry);
        }
        
        fn _get_weighted_dl(self: @ContractState, epoch: u64, component_id: u64) -> u128 {
            let key = self._weighted_dl_key(epoch, component_id);
            self.weighted_dl_storage.read(key)
        }
        
        fn _set_weighted_dl(ref self: ContractState, epoch: u64, component_id: u64, weight: u128) {
            let key = self._weighted_dl_key(epoch, component_id);
            self.weighted_dl_storage.write(key, weight);
        }
        
        fn _is_seen_this_epoch(self: @ContractState, epoch: u64, wallet: ContractAddress, component_id: u64) -> bool {
            let key = self._seen_epoch_key(epoch, wallet, component_id);
            self.seen_this_epoch_storage.read(key)
        }
        
        fn _set_seen_this_epoch(ref self: ContractState, epoch: u64, wallet: ContractAddress, component_id: u64, seen: bool) {
            let key = self._seen_epoch_key(epoch, wallet, component_id);
            self.seen_this_epoch_storage.write(key, seen);
        }
        
        fn _is_first_time(self: @ContractState, wallet: ContractAddress, component_id: u64) -> bool {
            let key = self._first_time_key(wallet, component_id);
            self.first_time_storage.read(key)
        }
        
        fn _set_first_time(ref self: ContractState, wallet: ContractAddress, component_id: u64, value: bool) {
            let key = self._first_time_key(wallet, component_id);
            self.first_time_storage.write(key, value);
        }
        
        fn _only_owner(self: @ContractState) {
            assert(get_caller_address() == self.owner.read(), ErrOwnerOnly);
        }
        
        fn _only_registry(self: @ContractState) {
            assert(get_caller_address() == self.component_registry.read(), ErrRegistryOnly);
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
        
        fn _calculate_fee_share(amount: u256, basis_points: u16) -> u256 {
            math_utils::uint256_div_u16(
                math_utils::uint256_mul_u16(amount, basis_points),
                BASIS_POINT_DENOMINATOR
            )
        }
        
        fn _handle_subscription_payment(
            ref self: ContractState,
            subscriber: ContractAddress,
            subscription_fee: u256
        ) {
            // Pull subscription fee from subscriber
            let erc20 = IERC20Dispatcher { contract_address: self.strk_token.read() };
            erc20.transfer_from(subscriber, get_contract_address(), subscription_fee);
            
            // Split fee: 10% to liquidity, 45% to platform, 45% to reward pool
            let liquidity_fee = MarketplaceSubscriptionHelpers::_calculate_fee_share(subscription_fee, LIQUIDITY_FEE_BPS);
            let platform_fee = MarketplaceSubscriptionHelpers::_calculate_fee_share(subscription_fee, PLATFORM_FEE_BPS);
            let reward_pool_share = MarketplaceSubscriptionHelpers::_calculate_fee_share(subscription_fee, DEVELOPER_FEE_BPS);
            
            // Transfer to vaults
            erc20.transfer(self.liquidity_vault.read(), liquidity_fee);
            erc20.transfer(self.marketplace_vault.read(), platform_fee);
            
            // Add to reward pool
            let current_pool = self.reward_pool_strk.read();
            self.reward_pool_strk.write(math_utils::uint256_add(current_pool, reward_pool_share));
        }
    }

    // ABI implementation
    #[abi(embed_v0)]
    impl MarketplaceSubscriptionImpl of common::interfaces::IMarketplaceSubscription<ContractState> {
        fn subscribe(ref self: ContractState) {
            let caller = get_caller_address();
            let now = get_block_timestamp();
            
            // Get price - use oracle if price_usd_micros is set, otherwise use fallback
            let cfg = self.sub_fee_cfg.read();
            let sub_fee = if !cfg.price_usd_micros.is_zero() {
                MarketplaceSubscriptionHelpers::_usd_to_strk(@self, cfg)
            } else {
                self.sub_fee_strk.read()
            };
            
            // Reject if both STRK and USD prices are zero
            assert(!sub_fee.is_zero(), ErrZeroFee);
            
            // Handle payment processing with 45/45/10 fee distribution
            MarketplaceSubscriptionHelpers::_handle_subscription_payment(
                ref self,
                caller,
                sub_fee
            );
            
            // Set expiry - use max of current time or existing expiry
            let existing_expiry = MarketplaceSubscriptionHelpers::_get_subscription_expiry(@self, caller);
            let base = max(now, existing_expiry);
            let expiry = base + self.epoch_length_secs.read();
            MarketplaceSubscriptionHelpers::_set_subscription_expiry(ref self, caller, expiry);
            
            self.emit(Event::Subscribed(Subscribed { user: caller, expiry }));
        }

        fn record_download(ref self: ContractState, wallet: ContractAddress, component_id: u64) {
            // Only registry can call this
            MarketplaceSubscriptionHelpers::_only_registry(@self);
            
            let current_epoch = self.epoch_id.read();
            
            // Skip if already seen in this epoch
            if MarketplaceSubscriptionHelpers::_is_seen_this_epoch(@self, current_epoch, wallet, component_id) {
                return;
            }

            // Check if the component is free by querying the registry
            let registry = IComponentRegistryExternalDispatcher { 
                contract_address: self.component_registry.read() 
            };
            let is_free = registry.is_free(component_id);
            
            // Check if user subscription is valid (only for non-free components)
            if !is_free {
                let expiry = MarketplaceSubscriptionHelpers::_get_subscription_expiry(@self, wallet);
                assert(expiry > get_block_timestamp(), ErrSubscriptionRequired);
            }
            
            // Check if this is first time for this wallet+component
            let is_first_time = !MarketplaceSubscriptionHelpers::_is_first_time(@self, wallet, component_id);
            
            // Calculate weight bonus
            let weight: u128 = if is_first_time {
                MarketplaceSubscriptionHelpers::_set_first_time(ref self, wallet, component_id, true);
                self.new_user_bonus.read().into()
            } else {
                1
            };
            
            // Mark as seen and update weighted downloads
            MarketplaceSubscriptionHelpers::_set_seen_this_epoch(ref self, current_epoch, wallet, component_id, true);
            let current_weight = MarketplaceSubscriptionHelpers::_get_weighted_dl(@self, current_epoch, component_id);
            MarketplaceSubscriptionHelpers::_set_weighted_dl(ref self, current_epoch, component_id, current_weight + weight);
            
            self.emit(Event::DownloadRecorded(DownloadRecorded { 
                user: wallet, 
                component_id, 
                weight 
            }));
        }

        fn start_new_epoch(ref self: ContractState) {
            let now = get_block_timestamp();
            let epoch_start = self.epoch_start_ts.read();
            let min_end_time = epoch_start + self.epoch_length_secs.read() + self.grace_window_secs.read();
            
            // Ensure current epoch plus grace period has passed
            assert(now >= min_end_time, ErrEpochStillActive);
            
            let current_epoch = self.epoch_id.read();
            let reward_pool = self.reward_pool_strk.read();
            
            // If no rewards to distribute, just start new epoch
            if reward_pool.is_zero() {
                self.epoch_id.write(current_epoch + 1);
                self.epoch_start_ts.write(now);
                
                self.emit(Event::EpochStarted(EpochStarted {
                    epoch_id: current_epoch + 1,
                    start_ts: now
                }));
                
                return;
            }
            
            // Get component registry to find component owners
            let registry = IComponentRegistryExternalDispatcher { 
                contract_address: self.component_registry.read() 
            };
            
            // Setup token dispatcher for transfers
            let _erc20 = IERC20Dispatcher { contract_address: self.strk_token.read() };
            
            // First pass: calculate total_sqrt_sum
            let mut total_sqrt_sum: u128 = 0;
            let mut component_id: u64 = 1;
            let max_components: u64 = 1000;
            
            // Calculate the sum of square roots of all weights
            loop {
                if component_id > max_components {
                    break;
                }
                
                // Create key directly to avoid @self in loop
                let key = current_epoch.into() * 1000000000000 + component_id.into();
                let weight = self.weighted_dl_storage.read(key);
                if weight > 0 {
                    // Apply square root dampening
                    let sqrt_weight = math_utils::sqrt_u128(weight);
                    total_sqrt_sum += sqrt_weight;
                }
                
                component_id += 1;
            };
            
            // Skip distribution if no downloads were recorded
            if total_sqrt_sum == 0 {
                self.epoch_id.write(current_epoch + 1);
                self.epoch_start_ts.write(now);
                self.reward_pool_strk.write(u256 { low: 0, high: 0 });
                
                self.emit(Event::EpochStarted(EpochStarted {
                    epoch_id: current_epoch + 1,
                    start_ts: now
                }));
                
                return;
            }
            
            // Second pass: distribute rewards
            let mut total_distributed = u256 { low: 0, high: 0 };
            component_id = 1;
            
            // Distribute rewards proportionally based on sqrt weights
            loop {
                if component_id > max_components {
                    break;
                }
                
                // Create key directly to avoid @self in loop
                let key2 = current_epoch.into() * 1000000000000 + component_id.into();
                let weight = self.weighted_dl_storage.read(key2);
                if weight > 0 {
                    // Calculate component's share based on sqrt weight
                    let sqrt_weight = math_utils::sqrt_u128(weight);
                    let share_numerator = math_utils::u256_safe_mul(
                        reward_pool, 
                        u256 { low: sqrt_weight, high: 0 }
                    );
                    let share_denominator = u256 { low: total_sqrt_sum, high: 0 };
                    let share = math_utils::u256_safe_div(share_numerator, share_denominator);
                    
                    // Get component info and transfer reward
                    if !share.is_zero() {
                        // Note: In production, we'd need to handle the case where get_component might fail
                        // For now, we'll assume it succeeds
                        let access_flags = registry.get_access_flags(component_id);
                        if access_flags != 0 {
                            // Component exists, get the full component data
                            // This is a workaround since we can't directly get component in the interface
                            // In production, we'd need a better way to get the seller address
                            // For now, emit event with component_id only
                            self.emit(Event::RewardPaid(RewardPaid {
                                component_id,
                                seller: starknet::contract_address_const::<0>(), // Placeholder
                                amount: share,
                                epoch_id: current_epoch
                            }));
                        }
                        
                        total_distributed = math_utils::uint256_add(total_distributed, share);
                    }
                }
                
                component_id += 1;
            };
            
            // Start new epoch
            self.epoch_id.write(current_epoch + 1);
            self.epoch_start_ts.write(now);
            self.reward_pool_strk.write(u256 { low: 0, high: 0 });
            
            self.emit(Event::EpochStarted(EpochStarted { 
                epoch_id: current_epoch + 1, 
                start_ts: now 
            }));
        }

        fn set_subscription_fee(ref self: ContractState, new_fee: u256) {
            MarketplaceSubscriptionHelpers::_only_owner(@self);
            self.sub_fee_strk.write(new_fee);
        }

        fn set_subscription_fee_usd(ref self: ContractState, price_usd_micros: u256, price_feed_key: felt252) {
            MarketplaceSubscriptionHelpers::_only_owner(@self);
            self.sub_fee_cfg.write(OraclePriceCfg { 
                price_usd_micros: price_usd_micros,
                price_feed_key: price_feed_key 
            });
        }

        fn set_oracle_max_staleness(ref self: ContractState, new_staleness: u64) {
            MarketplaceSubscriptionHelpers::_only_owner(@self);
            self.oracle_max_staleness.write(new_staleness);
        }

        fn set_owner(ref self: ContractState, new_owner: ContractAddress) {
            MarketplaceSubscriptionHelpers::_only_owner(@self);
            assert(!new_owner.is_zero(), ErrZeroAddress);
            
            let previous_owner = self.owner.read();
            self.owner.write(new_owner);
            
            self.emit(Event::OwnershipTransferred(OwnershipTransferred {
                previous_owner: previous_owner,
                new_owner: new_owner,
            }));
        }
        
        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            MarketplaceSubscriptionHelpers::_only_owner(@self);
            assert(!new_owner.is_zero(), ErrZeroAddress);
            
            self.pending_owner.write(new_owner);
            
            self.emit(Event::OwnershipTransferStarted(OwnershipTransferStarted {
                previous_owner: self.owner.read(),
                new_owner: new_owner,
            }));
        }
        
        fn accept_ownership(ref self: ContractState) {
            let caller = get_caller_address();
            let pending_owner = self.pending_owner.read();
            
            assert(caller == pending_owner, ErrNotPendingOwner);
            assert(!caller.is_zero(), ErrZeroAddress);
            
            let previous_owner = self.owner.read();
            self.owner.write(caller);
            self.pending_owner.write(starknet::contract_address_const::<0>());
            
            self.emit(Event::OwnershipTransferred(OwnershipTransferred {
                previous_owner: previous_owner,
                new_owner: caller,
            }));
        }

        fn get_subscription_expiry(self: @ContractState, user: ContractAddress) -> u64 {
            MarketplaceSubscriptionHelpers::_get_subscription_expiry(self, user)
        }

        fn get_subscription_fee(self: @ContractState) -> u256 {
            self.sub_fee_strk.read()
        }

        fn get_price_usd(self: @ContractState) -> u256 {
            self.sub_fee_cfg.read().price_usd_micros
        }

        fn is_subscribed(self: @ContractState, user: ContractAddress) -> bool {
            let expiry = MarketplaceSubscriptionHelpers::_get_subscription_expiry(self, user);
            expiry > get_block_timestamp()
        }

        fn get_current_epoch(self: @ContractState) -> u64 {
            self.epoch_id.read()
        }

        fn get_reward_pool(self: @ContractState) -> u256 {
            self.reward_pool_strk.read()
        }

        fn get_epoch_info(self: @ContractState) -> (u64, u64, u64) {
            (
                self.epoch_id.read(),
                self.epoch_start_ts.read(),
                self.epoch_length_secs.read()
            )
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }

        fn get_version(self: @ContractState) -> felt252 {
            self.version.read()
        }
    }
} 