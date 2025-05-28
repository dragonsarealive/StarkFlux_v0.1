const { Contract, RpcProvider } = require('starknet');

// Configuration based on your transaction
const IDENTITY_REGISTRY_ADDRESS = '0x07438257cd32d2d858b9f7918de43942564f660880e09471906fe55855603cca';
const DEPLOYED_WALLET_ADDRESS = '0x07458d134151De3fFb903eAf6F9ba7Fd7712d89215B9cCa4Fac5539A4C1d2351';
// Use public Starknet RPC endpoint for Sepolia (better CORS support)
const RPC_URL = 'https://starknet-sepolia.public.blastapi.io';

// IdentityRegistry ABI - minimal for checking registration
const IDENTITY_REGISTRY_ABI = [
  {
    "name": "get_id",
    "type": "function",
    "inputs": [{"name": "owner", "type": "core::starknet::contract_address::ContractAddress"}],
    "outputs": [{"name": "id", "type": "core::integer::u64"}],
    "state_mutability": "view"
  }
];

async function checkDeveloperRegistration() {
  try {
    console.log('🔍 Checking developer registration status...');
    console.log(`📄 IdentityRegistry: ${IDENTITY_REGISTRY_ADDRESS}`);
    console.log(`👤 Wallet Address: ${DEPLOYED_WALLET_ADDRESS}`);
    console.log('');

    // Create provider and contract instance
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const contract = new Contract(IDENTITY_REGISTRY_ABI, IDENTITY_REGISTRY_ADDRESS, provider);

    // Check developer ID
    const developerId = await contract.get_id(DEPLOYED_WALLET_ADDRESS);
    const idValue = developerId.toString();

    console.log('📊 Registration Check Results:');
    console.log(`   Developer ID: ${idValue}`);
    console.log(`   Is Registered: ${idValue !== '0' ? '✅ YES' : '❌ NO'}`);
    
    if (idValue !== '0') {
      console.log('');
      console.log('🎉 SUCCESS! You are now registered as a developer!');
      console.log(`   Your Developer ID: ${idValue}`);
      console.log('   You can now:');
      console.log('   • Upload components to the marketplace');
      console.log('   • Set subscription pricing');
      console.log('   • Earn revenue from your components');
    } else {
      console.log('');
      console.log('❌ Registration not found. The transaction may still be processing.');
      console.log('   Please wait a few minutes and try again.');
    }

  } catch (error) {
    console.error('Error checking registration:', error.message);
    
    if (error.message.includes('Contract not found')) {
      console.log('');
      console.log('ℹ️  The contract might not be fully synced yet.');
      console.log('   Please try again in a few minutes.');
    }
  }
}

// Run the check
checkDeveloperRegistration(); 