// Test script to verify library functionality
import { Contract, RpcProvider, shortString } from 'starknet';

const CONTRACT_ADDRESSES = {
  COMPONENT_REGISTRY: '0x05fce2407338ddba93698b12af82275cbe62e1d9bcf7de63938cea642c894667'
};

// Minimal ABI for testing
const COMPONENT_REGISTRY_ABI = [
  {
    "name": "get_next_component_id",
    "type": "function",
    "inputs": [],
    "outputs": [{"type": "core::integer::u64"}],
    "state_mutability": "view"
  },
  {
    "name": "get_component_seller",
    "type": "function",
    "inputs": [{"name": "component_id", "type": "core::integer::u64"}],
    "outputs": [{"type": "core::starknet::contract_address::ContractAddress"}],
    "state_mutability": "view"
  },
  {
    "name": "get_component_title",
    "type": "function",
    "inputs": [{"name": "component_id", "type": "core::integer::u64"}],
    "outputs": [{"type": "core::felt252"}],
    "state_mutability": "view"
  },
  {
    "name": "get_component_reference",
    "type": "function",
    "inputs": [{"name": "component_id", "type": "core::integer::u64"}],
    "outputs": [{"type": "core::felt252"}],
    "state_mutability": "view"
  },
  {
    "name": "get_access_flags",
    "type": "function",
    "inputs": [{"name": "component_id", "type": "core::integer::u64"}],
    "outputs": [{"type": "core::integer::u8"}],
    "state_mutability": "view"
  }
];

async function testLibraryFetch() {
  console.log('=== Testing Library Component Fetch ===\n');
  
  const provider = new RpcProvider({ 
    nodeUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7'
  });

  const contract = new Contract(
    COMPONENT_REGISTRY_ABI,
    CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
    provider
  );

  try {
    // Get component count
    console.log('1. Getting component count...');
    const nextId = await contract.get_next_component_id();
    const componentCount = Number(nextId) - 1;
    console.log(`Total components: ${componentCount}`);

    // Fetch each component
    console.log('\n2. Fetching components...');
    for (let id = 1; id <= componentCount; id++) {
      console.log(`\n--- Component ${id} ---`);
      
      try {
        const seller = await contract.get_component_seller(id);
        const title = await contract.get_component_title(id);
        const reference = await contract.get_component_reference(id);
        const accessFlags = await contract.get_access_flags(id);
        
        // Decode title
        let decodedTitle = `Component #${id}`;
        try {
          if (title && title !== '0x0') {
            decodedTitle = shortString.decodeShortString(title);
          }
        } catch (e) {
          console.log('Could not decode title');
        }
        
        // Decode reference
        let decodedReference = reference.toString();
        try {
          if (reference && reference.toString().startsWith('0x') && reference !== '0x0') {
            decodedReference = shortString.decodeShortString(reference);
          }
        } catch (e) {
          // Keep as hex
        }
        
        console.log(`Title: ${decodedTitle}`);
        console.log(`Reference: ${decodedReference}`);
        console.log(`Seller: ${seller}`);
        console.log(`Access Flags: ${accessFlags}`);
        
        // Check if metadata can be fetched
        if (decodedReference.startsWith('cid_')) {
          console.log('This is a hashed CID - would need mapping to fetch metadata');
        } else if (decodedReference.length === 46) {
          console.log('This looks like a valid IPFS CID - metadata could be fetched');
        }
        
      } catch (err) {
        console.log(`Error fetching component ${id}:`, err.message);
      }
    }
    
    console.log('\n=== Test Complete ===');
    console.log('\nSummary:');
    console.log('- The library should show these components');
    console.log('- Components with hashed CIDs need localStorage mapping for metadata');
    console.log('- Components with full CIDs can fetch metadata directly');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testLibraryFetch().catch(console.error); 