// identity_registry crate
mod identity_registry;
 
// Re-export the identity_registry module
// This allows the contract to be used as a starknet contract
use identity_registry::IdentityRegistry; 