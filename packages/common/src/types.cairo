// @version v0.9.0-beta

// src/types.cairo
use starknet::ContractAddress;
use core::integer::{u8, u64, u128, u256};

// Pricing Models
#[derive(Drop, Copy, starknet::Store, Serde)]
pub struct Pricing {
    pub price_strk: u128,       // Direct price in STRK wei (18 decimals)
    pub price_usd_micros: u128, // Price in USD micros (6 decimals) - using Oracle if set
}

// Component Data
#[derive(Drop, Copy, starknet::Store, Serde)]
pub struct Component {
    pub id: u64,
    pub title: felt252, // Short name/title
    pub reference: felt252, // IPFS CID, Git URL, etc.
    pub seller: ContractAddress,
    pub pricing: Pricing,
    pub price_feed_key: felt252, // Needed if pricing via Oracle, e.g. selector!("STRK/USD")
    pub is_active: bool,
    pub registration_timestamp: u64,
    pub access_flags: u8, // bit flags: 1=BUY, 2=DEV_SUB, 4=MKT_SUB, 8=FREE
} 

// Access Flag Constants
mod AccessFlags {
    const BUY: u8 = 1;  // direct purchase
    const DEV_SUB: u8 = 2;  // per-developer subscription
    const MKT_SUB: u8 = 4;  // marketplace subscription
    const FREE: u8 = 8;  // free component
}

// Oracle Price Configuration
#[derive(Drop, Copy, starknet::Store, Serde)]
pub struct OraclePriceCfg {
    pub price_usd_micros: u256, // Price in USD micros (6 decimals)
    pub price_feed_key: felt252, // Oracle pair ID, e.g. selector!("STRK/USD")
}
