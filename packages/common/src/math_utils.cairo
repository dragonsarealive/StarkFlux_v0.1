// @version v0.9.0-beta

use core::integer::{u256, u128, u8}; // Added u8 for decimals
use core::option::OptionTrait; // For unwrap on overflowing operations if we assert no overflow
use core::num::traits::{OverflowingAdd, OverflowingSub, OverflowingMul}; // Use traits
use core::traits::TryInto; // For try_into
use core::zeroable::Zeroable; // For is_zero() method
use starknet::{ContractAddress, get_block_timestamp};
// TEMPORARILY REMOVED FOR COMPILATION FIX
// use crate::types::OraclePriceCfg;
// use crate::interfaces::{IPragmaOracleDispatcher, IPragmaOracleDispatcherTrait};

const U128_MAX: u128 = 340282366920938463463374607431768211455; // 2**128 - 1
pub const BASIS_POINT_DENOMINATOR_U128: u128 = 10000;

// Constants for Oracle and USD conversion
pub const STRK_SCALING_FACTOR_U256: u256 = u256 { low: 1_000_000_000_000_000_000, high: 0 }; // 10^18
pub const USD_MICROS_SCALING_FACTOR_U256: u256 = u256 { low: 1_000_000, high: 0 }; // 10^6

// Error Constants for Oracle operations
pub const ErrOracleDataInvalid: felt252 = 'ERR_ORACLE_DATA_INVALID';
pub const ErrClockError: felt252 = 'ERR_CLOCK_ERROR';
pub const ErrOraclePriceStale: felt252 = 'ERR_ORACLE_PRICE_STALE';
pub const ErrOraclePriceZero: felt252 = 'ERR_ORACLE_PRICE_ZERO';
pub const ErrPriceTooLarge: felt252 = 'ERR_PRICE_TOO_LARGE';

// Public helper, useful for pow10 and other conversions if needed by users of math_utils
pub fn u256_from_u128(val: u128) -> u256 {
    u256 { low: val, high: 0 } // Reverted to original implementation
}

// Convert felt252 to u256
pub fn uint256_from_felt252(val: felt252) -> u256 {
    u256 { low: val.try_into().unwrap(), high: 0 }
}

fn u256_is_zero(val: u256) -> bool {
    val.is_zero()
}

pub fn u256_safe_add(a: u256, b: u256) -> u256 {
    let (res, overflow) = a.overflowing_add(b);
    assert(!overflow, 'u256_safe_add: overflow');
    res
}

pub fn u256_safe_sub(a: u256, b: u256) -> u256 {
    let (res, overflow) = a.overflowing_sub(b);
    assert(!overflow, 'u256_safe_sub: underflow');
    res
}

pub fn u256_safe_mul(a: u256, b: u256) -> u256 {
    let (res, overflow) = a.overflowing_mul(b);
    assert(!overflow, 'u256_safe_mul: overflow');
    res
}

pub fn u256_safe_div(a: u256, b: u256) -> u256 {
    assert(!u256_is_zero(b), 'u256_safe_div: div by zero');
    a / b
}

pub fn pow10_u256(exponent: u8) -> u256 {
    match exponent {
        0 => u256_from_u128(1),
        1 => u256_from_u128(10),
        2 => u256_from_u128(100),
        3 => u256_from_u128(1_000),
        4 => u256_from_u128(10_000),
        5 => u256_from_u128(100_000),
        6 => u256_from_u128(1_000_000),
        7 => u256_from_u128(10_000_000),
        8 => u256_from_u128(100_000_000),
        9 => u256_from_u128(1_000_000_000),
        10 => u256_from_u128(10_000_000_000),
        11 => u256_from_u128(100_000_000_000),
        12 => u256_from_u128(1_000_000_000_000),
        13 => u256_from_u128(10_000_000_000_000),
        14 => u256_from_u128(100_000_000_000_000),
        15 => u256_from_u128(1_000_000_000_000_000),
        16 => u256_from_u128(10_000_000_000_000_000),
        17 => u256_from_u128(100_000_000_000_000_000),
        18 => u256_from_u128(1_000_000_000_000_000_000), // 10^18
        // Add more cases up to 38 as per user spec if needed, this is illustrative for common cases
        19 => u256_from_u128(10_000_000_000_000_000_000), 
        20 => u256_from_u128(100_000_000_000_000_000_000), 
        21 => u256_from_u128(1_000_000_000_000_000_000_000), 
        22 => u256_from_u128(10_000_000_000_000_000_000_000), 
        23 => u256_from_u128(100_000_000_000_000_000_000_000), 
        24 => u256_from_u128(1_000_000_000_000_000_000_000_000), 
        25 => u256_from_u128(10_000_000_000_000_000_000_000_000), 
        26 => u256_from_u128(100_000_000_000_000_000_000_000_000), 
        27 => u256_from_u128(1_000_000_000_000_000_000_000_000_000), 
        28 => u256_from_u128(10_000_000_000_000_000_000_000_000_000), 
        29 => u256_from_u128(100_000_000_000_000_000_000_000_000_000), 
        30 => u256_from_u128(1_000_000_000_000_000_000_000_000_000_000), // 10^30
        31 => u256_from_u128(10_000_000_000_000_000_000_000_000_000_000),
        32 => u256_from_u128(100_000_000_000_000_000_000_000_000_000_000),
        33 => u256_from_u128(1_000_000_000_000_000_000_000_000_000_000_000),
        34 => u256_from_u128(10_000_000_000_000_000_000_000_000_000_000_000),
        35 => u256_from_u128(100_000_000_000_000_000_000_000_000_000_000_000),
        36 => u256_from_u128(1_000_000_000_000_000_000_000_000_000_000_000_000),
        37 => u256_from_u128(10_000_000_000_000_000_000_000_000_000_000_000_000),
        38 => u256_from_u128(100_000_000_000_000_000_000_000_000_000_000_000_000), // 10^38
        // Max u128 is 340_282_366_920_938_463_463_374_607_431_768_211_455 (approx 3.4 * 10^38)
        // 10^38 fits in u128. All these literals fit.
        _ => { assert(false, 'pow10_u256: exp too big'); u256_from_u128(0) } // Or handle error differently
    }
}

/// Helper to handle common oracle decimal values - optimized for common cases
pub fn get_oracle_power_of_10(decimals: u8) -> u256 {
    if decimals == 6 {
        u256_from_u128(1_000_000)
    } else if decimals == 8 {
        u256_from_u128(100_000_000)
    } else if decimals == 10 {
        u256_from_u128(10_000_000_000)
    } else if decimals == 12 {
        u256_from_u128(1_000_000_000_000)
    } else {
        pow10_u256(decimals)
    }
}

// TEMPORARILY REMOVED FOR COMPILATION FIX - USES OraclePriceCfg AND IPragmaOracleDispatcher
// usd_to_strk function removed until module imports are fixed

/// Calculates percentage: (value * basis_points) / BASIS_POINT_DENOMINATOR_U128.
/// basis_points: e.g., 500 for 5%.
pub fn calculate_percentage(value: u128, basis_points: u64) -> u128 {
    let basis_points_u128: u128 = basis_points.into();
    assert(basis_points_u128 <= BASIS_POINT_DENOMINATOR_U128, 'calc_perc: bp > denom');

    let val_u256 = u256_from_u128(value);
    let bp_u256 = u256_from_u128(basis_points_u128); // Use basis_points_u128
    let denominator_u256 = u256_from_u128(BASIS_POINT_DENOMINATOR_U128);

    let numerator_res = u256_safe_mul(val_u256, bp_u256);
    // No explicit check for mul_overflow here since u256_safe_mul will assert/panic.

    let result_u256 = u256_safe_div(numerator_res, denominator_u256);
    // No explicit check for div_overflow here (already handled by u256_safe_div for by-zero).

    assert(result_u256.high == 0 && result_u256.low <= U128_MAX, 'calc_perc: res > u128_max');
    result_u256.low
}

/// Asserts that the sum of two basis points is less than or equal to 10000 (100%)
pub fn assert_bp_sum(p1: u16, p2: u16) {
    assert(p1 + p2 <= 10_000_u16, 'ERR_FEE_BP_OVERFLOW');
}

// Square root function for u128 using Babylonian method with 2 iterations
pub fn sqrt_u128(x: u128) -> u128 {
    if x == 0 {
        return 0;
    }
    
    let mut z = x;
    let mut y = (z + 1) / 2;
    
    // First iteration
    z = y;
    y = (z + x / z) / 2;
    
    // Second iteration
    z = y;
    y = (z + x / z) / 2;
    
    y
}

// Multiply two u256 numbers and divide by a third, with rounding down
pub fn uint256_mul_div_down(a: u256, b: u256, c: u256) -> u256 {
    assert(!u256_is_zero(c), 'Division by zero');
    let product = u256_safe_mul(a, b);
    u256_safe_div(product, c)
}

// Add two u256 numbers
pub fn uint256_add(a: u256, b: u256) -> u256 {
    u256_safe_add(a, b)
}

// Divide a u256 by a u64, with rounding down
pub fn uint256_div_u64_round_down(a: u256, b: u64) -> u256 {
    assert(b != 0, 'Division by zero');
    let b_u256 = u256 { low: b.into(), high: 0 };
    u256_safe_div(a, b_u256)
}

// Multiply a u256 by a u64
pub fn uint256_mul_u64(a: u256, b: u64) -> u256 {
    let b_u256 = u256 { low: b.into(), high: 0 };
    u256_safe_mul(a, b_u256)
}

// Multiply a u256 by a u16
pub fn uint256_mul_u16(a: u256, b: u16) -> u256 {
    let b_u256 = u256 { low: b.into(), high: 0 };
    u256_safe_mul(a, b_u256)
}

// Divide a u256 by a u16
pub fn uint256_div_u16(a: u256, b: u16) -> u256 {
    assert(b != 0, 'Division by zero');
    let b_u256 = u256 { low: b.into(), high: 0 };
    u256_safe_div(a, b_u256)
} 