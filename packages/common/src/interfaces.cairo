// @version v0.9.0-beta
// Updated for v1.1.0 with new version tracking function

// src/interfaces.cairo - Module file

// Optionally, re-export specific items if direct use from `crate::interfaces::` is desired for them.
// For example:
// pub use icomponent_registry_external::IComponentRegistryExternal;
// pub use ierc20::IERC20;
// pub use ipragma_oracle::{IPragmaOracle, PragmaOraclePriceData}; // Note PragmaOraclePriceData is also here
// pub use iuniversal_identity_registry::IUniversalIdentityRegistry;
// For now, we will rely on full path imports like `crate::interfaces::ierc20::IERC20Dispatcher`

use starknet::ContractAddress;
use core::integer::{u64, u128, u256};
// TEMPORARILY REMOVED FOR COMPILATION FIX
// use crate::types::Component;

#[derive(Drop, Copy, starknet::Store, Serde)]
struct Identity {
    id: u64,
    owner: ContractAddress,
    join_timestamp: u64,
    upload_count: u64, 
    total_sales_strk: u128,
}

#[derive(Drop, Copy, starknet::Store, Serde)]
struct Subscription {
    expiry: u64,
}

#[starknet::interface]
trait IERC20<TContractState> {
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256
    ) -> bool;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn total_supply(self: @TContractState) -> u256;
    fn name(self: @TContractState) -> felt252;
    fn symbol(self: @TContractState) -> felt252;
    fn decimals(self: @TContractState) -> u8;
}

#[starknet::interface]
trait IPragmaOracle<TContractState> {
    // Per Pragma docs, get_median returns: (price: u128, decimals: u8, last_updated_timestamp: u64, num_sources_aggregated: u8)
    fn get_median(self: @TContractState, pair_id: felt252) -> (u128, u8, u64, u8);
}

#[starknet::interface]
trait IUniversalIdentityRegistry<TContractState> {
    fn register(ref self: TContractState) -> u64;
    fn get_identity(self: @TContractState, id: u64) -> Identity;
    fn get_id(self: @TContractState, owner: ContractAddress) -> u64;
    fn record_upload(ref self: TContractState, owner: ContractAddress);
    fn record_sale(ref self: TContractState, owner: ContractAddress, amount_strk: u128);
    fn set_registry_address(ref self: TContractState, new_address: ContractAddress);
    fn get_reputation_score(self: @TContractState, owner: ContractAddress) -> u128;
    fn has_identity(self: @TContractState, owner: ContractAddress) -> bool;
    fn authorize_contract(ref self: TContractState, contract_addr: ContractAddress);
    fn set_subscription_price(ref self: TContractState, price: u256);
    fn set_monetization_mode(ref self: TContractState, mode: u8);
    fn get_monetization_mode(self: @TContractState, owner: ContractAddress) -> u8;
    fn get_subscription_price(self: @TContractState, owner: ContractAddress) -> u256;
    // Added in v1.1.0 - Returns the contract version
    fn get_version(self: @TContractState) -> felt252;
}

#[starknet::interface]
trait IComponentRegistryExternal<TContractState> {
    // Component Lifecycle
    fn register_component(
        ref self: TContractState,
        title: felt252,
        reference: felt252,
        price_strk: u128,
        price_usd_micros: u128,
        price_feed_key: felt252,
        access_flags: u8
    ) -> u64;
    // TEMPORARILY REMOVED FOR COMPILATION FIX - USES Component TYPE
    // fn get_component(self: @TContractState, component_id: u64) -> Component;
    fn get_current_price(self: @TContractState, component_id: u64) -> felt252;
    fn purchase_component(ref self: TContractState, component_id: u64);
    fn set_component_active_status(ref self: TContractState, component_id: u64, is_active: bool);
    fn set_component_access_flags(ref self: TContractState, component_id: u64, new_access_flags: u8);
    fn update_component(
        ref self: TContractState,
        component_id: u64,
        title: felt252,
        reference: felt252,
        price_strk: u128,
        price_usd_micros: u128,
        price_feed_key: felt252,
        access_flags: u8
    );
    fn record_download(ref self: TContractState, wallet: ContractAddress, component_id: u64);

    // Ownership
    fn transfer_ownership(ref self: TContractState, new_owner: ContractAddress);
    fn accept_ownership(ref self: TContractState);
    fn owner_address(self: @TContractState) -> ContractAddress;

    // Admin Configuration - query functions for these might also be useful externally
    fn set_pragma_oracle_address(ref self: TContractState, new_address: ContractAddress);
    fn set_oracle_max_staleness(ref self: TContractState, new_staleness: u64);
    fn set_identity_registry_address(ref self: TContractState, new_address: ContractAddress);
    fn set_platform_treasury_address(ref self: TContractState, new_address: ContractAddress);
    fn set_liquidity_vault_address(ref self: TContractState, new_address: ContractAddress);
    fn set_strk_token_address(ref self: TContractState, new_address: ContractAddress);
    fn set_subscription_manager(ref self: TContractState, addr: ContractAddress);

    // View functions for querying configuration
    fn get_fee_split_bps(self: @TContractState) -> (u16, u16, u16);
    fn get_treasury_addresses(self: @TContractState) -> (ContractAddress, ContractAddress);
    fn is_free(self: @TContractState, component_id: u64) -> bool;
    fn get_access_flags(self: @TContractState, component_id: u64) -> u8;
    // Added in v1.1.0 - Returns the contract version
    fn get_version(self: @TContractState) -> felt252;
}

#[starknet::interface]
trait ISubscriptionManager<TContractState> {
    fn subscribe(ref self: TContractState, component_id: u64, duration_days: u64);
    fn renew(ref self: TContractState, component_id: u64, duration_days: u64);
    fn cancel(ref self: TContractState, component_id: u64);
    fn is_subscribed(self: @TContractState, user: ContractAddress, component_id: u64) -> bool;
    fn get_subscription(self: @TContractState, user: ContractAddress, component_id: u64) -> Subscription;
    
    // Admin functions
    fn set_platform_fee_bp(ref self: TContractState, new_bp: u64);
    fn set_liquidity_fee_bp(ref self: TContractState, new_bp: u64);
    fn set_linked_addresses(
        ref self: TContractState, 
        registry_address: ContractAddress,
        id_registry_address: ContractAddress,
        strk_token_address: ContractAddress
    );
    fn transfer_ownership(ref self: TContractState, new_owner: ContractAddress);
    fn accept_ownership(ref self: TContractState);
    
    // View functions for querying configuration
    fn get_fee_split_bps(self: @TContractState) -> (u16, u16, u16);
    fn get_treasury_addresses(self: @TContractState) -> (ContractAddress, ContractAddress);
}

#[starknet::interface]
trait IMarketplaceSubscription<TContractState> {
    fn subscribe(ref self: TContractState);
    fn record_download(ref self: TContractState, wallet: ContractAddress, component_id: u64);
    fn start_new_epoch(ref self: TContractState);
    fn set_subscription_fee(ref self: TContractState, new_fee: u256);
    fn set_subscription_fee_usd(ref self: TContractState, price_usd_micros: u256, price_feed_key: felt252);
    fn set_oracle_max_staleness(ref self: TContractState, new_staleness: u64);
    fn set_owner(ref self: TContractState, new_owner: ContractAddress);
    fn transfer_ownership(ref self: TContractState, new_owner: ContractAddress);
    fn accept_ownership(ref self: TContractState);
    fn is_subscribed(self: @TContractState, user: ContractAddress) -> bool;
    fn get_subscription_expiry(self: @TContractState, user: ContractAddress) -> u64;
    fn get_subscription_fee(self: @TContractState) -> u256;
    fn get_price_usd(self: @TContractState) -> u256;
    fn get_current_epoch(self: @TContractState) -> u64;
    fn get_reward_pool(self: @TContractState) -> u256;
    fn get_epoch_info(self: @TContractState) -> (u64, u64, u64);
    fn get_owner(self: @TContractState) -> ContractAddress;
    // Added in v1.1.0 - Returns the contract version
    fn get_version(self: @TContractState) -> felt252;
}

#[starknet::interface]
trait IDevSubscription<TContractState> {
    fn subscribe(ref self: TContractState, dev_id: u64);
    fn is_subscribed(self: @TContractState, user: ContractAddress, dev_id: u64) -> bool;
    fn set_price(ref self: TContractState, dev_id: u64, price: u256);
    fn set_price_usd(ref self: TContractState, dev_id: u64, price_usd_micros: u256, price_feed_key: felt252);
    fn get_price(self: @TContractState, dev_id: u64) -> u256;
    fn get_price_usd(self: @TContractState, dev_id: u64) -> u256;
    fn get_subscription_expiry(self: @TContractState, user: ContractAddress, dev_id: u64) -> u64;
    // Added in v1.1.0 - Returns the contract version
    fn get_version(self: @TContractState) -> felt252;
} 