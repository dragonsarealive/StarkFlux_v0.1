// Version V1.2.0 - Fixed Storage Implementation
// Identity Registry Contract - Manages user identities and developer profiles

#[starknet::contract]
mod IdentityRegistry {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use core::integer::{u64, u128, u256};
    use core::num::traits::zero::Zero;
    use common::interfaces::{IUniversalIdentityRegistry, Identity};

    // Contract version
    const CONTRACT_VERSION: felt252 = 'v1.2.0';

    // Error constants
    const ErrAlreadyRegistered: felt252 = 'ERR_ALREADY_REGISTERED';
    const ErrNotRegistered: felt252 = 'ERR_NOT_REGISTERED';
    const ErrNotComponentRegistry: felt252 = 'ERR_NOT_COMPONENT_REGISTRY';
    const ErrZeroAddress: felt252 = 'ERR_ZERO_ADDRESS';
    const ErrOwnerOnly: felt252 = 'ERR_OWNER_ONLY';
    const ErrU128Overflow: felt252 = 'ERR_U128_OVERFLOW';

    // Extended identity information structure
    #[derive(Drop, starknet::Store, Copy)]
    struct ExtendedIdentityInfo {
        monetization_mode: u8,      // 0=Direct 1=Marketplace 2=DevSub 3=Hybrid
        dev_subscription_price: u256,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        IdentityRegistered: IdentityRegistered,
        UploadRecorded: UploadRecorded,
        SaleRecorded: SaleRecorded,
        RegistryAddressChanged: RegistryAddressChanged,
    }

    #[derive(Drop, starknet::Event)]
    struct IdentityRegistered { 
        #[key] 
        id: u64, 
        #[key] 
        owner: ContractAddress 
    }
    
    #[derive(Drop, starknet::Event)]
    struct UploadRecorded { 
        #[key] 
        id: u64 
    }
    
    #[derive(Drop, starknet::Event)]
    struct SaleRecorded { 
        #[key] 
        id: u64, 
        amount: u128 
    }
    
    #[derive(Drop, starknet::Event)]
    struct RegistryAddressChanged { 
        previous_address: ContractAddress, 
        new_address: ContractAddress 
    }

    #[storage]
    struct Storage {
        // Next identity ID to assign (counter starts at 1)
        next_id: u64,
        // Address of the component registry contract
        registry_address: ContractAddress,
        // Address of the contract owner
        owner_address: ContractAddress,
        // Contract version
        version: felt252,
        
        // Identity storage using felt252 keys (replaces Map functionality)
        // Identity by owner: owner_address -> u64
        id_by_owner_storage: LegacyMap<felt252, u64>,
        
        // Identity data: id -> Identity
        identities_storage: LegacyMap<felt252, Identity>,
        
        // Extended info: id -> ExtendedIdentityInfo
        extended_info_storage: LegacyMap<felt252, ExtendedIdentityInfo>,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_owner: ContractAddress) {
        // Ensure the initial owner address is not zero
        assert(!initial_owner.is_zero(), ErrZeroAddress);
        
        // Set the owner address
        self.owner_address.write(initial_owner);
        
        // Initialize the next ID counter to 1 (IDs start at 1, 0 is invalid)
        self.next_id.write(1);
        
        // Set version
        self.version.write(CONTRACT_VERSION);
        
        // Initialize registry_address to zero (will be set later by owner)
        self.registry_address.write(starknet::contract_address_const::<0>());
    }

    // Storage helper functions
    #[generate_trait]
    impl IdentityRegistryHelpers of IdentityRegistryHelpersTrait {
        fn _owner_key(self: @ContractState, owner: ContractAddress) -> felt252 {
            // Create unique key for owner mapping
            owner.into() * 1000000 + 'owner'
        }
        
        fn _identity_key(self: @ContractState, id: u64) -> felt252 {
            // Create unique key for identity storage
            id.into() * 1000000 + 'identity'
        }
        
        fn _extended_key(self: @ContractState, id: u64) -> felt252 {
            // Create unique key for extended info storage
            id.into() * 1000000 + 'extended'
        }
        
        fn _get_id_by_owner(self: @ContractState, owner: ContractAddress) -> u64 {
            let key = self._owner_key(owner);
            self.id_by_owner_storage.read(key)
        }
        
        fn _set_id_by_owner(ref self: ContractState, owner: ContractAddress, id: u64) {
            let key = self._owner_key(owner);
            self.id_by_owner_storage.write(key, id);
        }
        
        fn _get_identity(self: @ContractState, id: u64) -> Identity {
            let key = self._identity_key(id);
            self.identities_storage.read(key)
        }
        
        fn _set_identity(ref self: ContractState, id: u64, identity: Identity) {
            let key = self._identity_key(id);
            self.identities_storage.write(key, identity);
        }
        
        fn _get_extended_info(self: @ContractState, id: u64) -> ExtendedIdentityInfo {
            let key = self._extended_key(id);
            self.extended_info_storage.read(key)
        }
        
        fn _set_extended_info(ref self: ContractState, id: u64, info: ExtendedIdentityInfo) {
            let key = self._extended_key(id);
            self.extended_info_storage.write(key, info);
        }
        
        fn _only_owner(self: @ContractState) {
            assert(get_caller_address() == self.owner_address.read(), ErrOwnerOnly);
        }
    }

    // ABI implementation
    #[abi(embed_v0)]
    impl IdentityRegistryImpl of common::interfaces::IUniversalIdentityRegistry<ContractState> {
        fn register(ref self: ContractState) -> u64 {
            let caller = get_caller_address();
            assert(!caller.is_zero(), ErrZeroAddress);
            
            // Check if already registered
            let existing_id = IdentityRegistryHelpers::_get_id_by_owner(@self, caller);
            assert(existing_id == 0, ErrAlreadyRegistered);

            let new_id = self.next_id.read();
            self.next_id.write(new_id + 1);

            // Create and store the basic identity info
            let identity = Identity {
                id: new_id,
                owner: caller,
                join_timestamp: get_block_timestamp(),
                upload_count: 0,
                total_sales_strk: 0,
            };
            IdentityRegistryHelpers::_set_identity(ref self, new_id, identity);
            
            // Create and store extended identity info
            let ext_info = ExtendedIdentityInfo {
                monetization_mode: 1, // Default to paid allowed
                dev_subscription_price: 0,
            };
            IdentityRegistryHelpers::_set_extended_info(ref self, new_id, ext_info);
            
            // Map owner to ID
            IdentityRegistryHelpers::_set_id_by_owner(ref self, caller, new_id);

            self.emit(Event::IdentityRegistered(IdentityRegistered { id: new_id, owner: caller }));
            new_id
        }

        fn get_identity(self: @ContractState, id: u64) -> Identity {
            let ident = IdentityRegistryHelpers::_get_identity(self, id);
            assert(ident.id != 0, ErrNotRegistered);
            ident
        }

        fn get_id(self: @ContractState, owner: ContractAddress) -> u64 {
            IdentityRegistryHelpers::_get_id_by_owner(self, owner)
        }

        fn has_identity(self: @ContractState, owner: ContractAddress) -> bool {
            IdentityRegistryHelpers::_get_id_by_owner(self, owner) != 0
        }

        fn get_version(self: @ContractState) -> felt252 {
            self.version.read()
        }

        fn record_upload(ref self: ContractState, owner: ContractAddress) {
            // Verify caller is the component registry
            let reg = self.registry_address.read();
            assert(!reg.is_zero(), ErrZeroAddress);
            assert(get_caller_address() == reg, ErrNotComponentRegistry);
            
            let id = IdentityRegistryHelpers::_get_id_by_owner(@self, owner);
            if id == 0 { return; } // silently ignore unregistered devs

            let mut ident = IdentityRegistryHelpers::_get_identity(@self, id);
            ident.upload_count += 1;
            IdentityRegistryHelpers::_set_identity(ref self, id, ident);
            
            self.emit(Event::UploadRecorded(UploadRecorded { id }));
        }

        fn record_sale(ref self: ContractState, owner: ContractAddress, amount_strk: u128) {
            // Verify caller is the component registry
            let reg = self.registry_address.read();
            assert(!reg.is_zero(), ErrZeroAddress);
            assert(get_caller_address() == reg, ErrNotComponentRegistry);
            
            let id = IdentityRegistryHelpers::_get_id_by_owner(@self, owner);
            if id == 0 { return; }

            let mut ident = IdentityRegistryHelpers::_get_identity(@self, id);
            assert(ident.total_sales_strk + amount_strk >= ident.total_sales_strk, ErrU128Overflow);
            ident.total_sales_strk += amount_strk;
            IdentityRegistryHelpers::_set_identity(ref self, id, ident);
            
            self.emit(Event::SaleRecorded(SaleRecorded { id, amount: amount_strk }));
        }

        fn set_registry_address(ref self: ContractState, new_address: ContractAddress) {
            IdentityRegistryHelpers::_only_owner(@self);
            assert(!new_address.is_zero(), ErrZeroAddress);

            let prev = self.registry_address.read();
            self.registry_address.write(new_address);
            
            self.emit(Event::RegistryAddressChanged(RegistryAddressChanged { 
                previous_address: prev, 
                new_address 
            }));
        }

        fn get_reputation_score(self: @ContractState, owner: ContractAddress) -> u128 {
            let id = IdentityRegistryHelpers::_get_id_by_owner(self, owner);
            if id == 0 { return 0; }

            let ident = IdentityRegistryHelpers::_get_identity(self, id);
            let upload_score = ident.upload_count.into() * 100_u128;
            let sales_score = ident.total_sales_strk / 10_000_000_000_000_000_u128; // 0.01 STRK = 1 point
            upload_score + sales_score
        }

        fn authorize_contract(ref self: ContractState, contract_addr: ContractAddress) {
            IdentityRegistryHelpers::_only_owner(@self);
            // For now, this just sets registry_address
            self.registry_address.write(contract_addr);
        }

        fn set_subscription_price(ref self: ContractState, price: u256) {
            let caller = get_caller_address();
            let id = IdentityRegistryHelpers::_get_id_by_owner(@self, caller);
            assert(id != 0, ErrNotRegistered);
            
            let mut ext_info = IdentityRegistryHelpers::_get_extended_info(@self, id);
            ext_info.dev_subscription_price = price;
            IdentityRegistryHelpers::_set_extended_info(ref self, id, ext_info);
        }

        fn set_monetization_mode(ref self: ContractState, mode: u8) {
            let caller = get_caller_address();
            let id = IdentityRegistryHelpers::_get_id_by_owner(@self, caller);
            assert(id != 0, ErrNotRegistered);
            assert(mode <= 3, 'Invalid mode'); // 0=Direct 1=Marketplace 2=DevSub 3=Hybrid
            
            let mut ext_info = IdentityRegistryHelpers::_get_extended_info(@self, id);
            ext_info.monetization_mode = mode;
            IdentityRegistryHelpers::_set_extended_info(ref self, id, ext_info);
        }

        fn get_monetization_mode(self: @ContractState, owner: ContractAddress) -> u8 {
            let id = IdentityRegistryHelpers::_get_id_by_owner(self, owner);
            if id == 0 { return 0; }
            
            IdentityRegistryHelpers::_get_extended_info(self, id).monetization_mode
        }

        fn get_subscription_price(self: @ContractState, owner: ContractAddress) -> u256 {
            let id = IdentityRegistryHelpers::_get_id_by_owner(self, owner);
            if id == 0 { return 0; }
            
            IdentityRegistryHelpers::_get_extended_info(self, id).dev_subscription_price
        }
    }
} 