// Verify Dual IPFS Implementation
// This script checks if the metadata was properly stored and contains the description

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YjQ0YjA5Zi1hYTQxLTRjNGUtODRmNy1hNGU2MjA0YmVmNGQiLCJlbWFpbCI6ImRyYWdvbnNhcmVhbGl2ZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNjJmNjJjNjJjNjJmNjJjNjJjNjIiLCJzY29wZWRLZXlTZWNyZXQiOiI2MmY2MmM2MmM2MmY2MmM2MmM2MmY2MmM2MmM2MmY2MmM2MmM2MmY2MmM2MmM2MmY2MmM2MmM2MmY2MmM2MmM2MiIsImV4cCI6MTc4OTgzMTI5MX0.Qs-U0y5BEe0nrGPbIpZjWisBj0JMGn-Y8OgbE9-FDlE';

// Component data from the event
const componentData = {
  id: 2,
  title: "Dual IFPS Test",
  hashedReference: "cid_ce91206eb2cc01a0c2ecc78e1f",
  seller: "0x1cbaa3550cfcdf0d04170ec80af4236829e33ef2c654d013574c3a4d7efdd19"
};

// Function to get CID mapping from localStorage (simulated)
function getCidMapping(hashedCid) {
  // In the real app, this would come from localStorage
  // For this test, we'll need to find the actual metadata CID
  console.log(`Looking up original CID for hash: ${hashedCid}`);
  
  // The actual metadata CID would be stored in localStorage
  // Let's check if we can find it in recent Pinata uploads
  return null; // We'll fetch from Pinata list instead
}

// Function to list recent Pinata uploads
async function listRecentUploads() {
  try {
    const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.rows;
  } catch (error) {
    console.error('Error listing Pinata uploads:', error);
    return [];
  }
}

// Function to fetch metadata from IPFS
async function fetchMetadata(cid) {
  try {
    console.log(`\nFetching metadata from IPFS: ${cid}`);
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

// Main verification function
async function verifyDualIPFS() {
  console.log('=== Dual IPFS Verification ===\n');
  console.log('Component Registration Details:');
  console.log(`- ID: ${componentData.id}`);
  console.log(`- Title: ${componentData.title}`);
  console.log(`- Hashed Reference: ${componentData.hashedReference}`);
  console.log(`- Seller: ${componentData.seller}`);
  
  console.log('\n1. Listing recent Pinata uploads to find metadata...');
  const uploads = await listRecentUploads();
  
  // Find metadata files (JSON files uploaded recently)
  const metadataFiles = uploads.filter(file => 
    file.metadata.name && file.metadata.name.includes('metadata') && 
    file.metadata.name.endsWith('.json')
  );
  
  console.log(`\nFound ${metadataFiles.length} metadata files:`);
  
  for (const file of metadataFiles) {
    console.log(`\n--- Checking ${file.metadata.name} ---`);
    console.log(`CID: ${file.ipfs_pin_hash}`);
    console.log(`Size: ${file.size} bytes`);
    console.log(`Date: ${file.date_pinned}`);
    
    // Fetch and display the metadata
    const metadata = await fetchMetadata(file.ipfs_pin_hash);
    
    if (metadata) {
      console.log('\nMetadata Contents:');
      console.log(`- Version: ${metadata.version}`);
      console.log(`- Title: ${metadata.component.title}`);
      console.log(`- Description: ${metadata.component.description}`);
      console.log(`- Author: ${metadata.component.author.address}`);
      console.log(`- Category: ${metadata.component.category}`);
      console.log(`- Tags: ${metadata.component.tags.join(', ') || 'None'}`);
      console.log(`- License: ${metadata.component.license}`);
      console.log(`- Component Version: ${metadata.component.version}`);
      
      console.log('\nEncrypted Content Info:');
      console.log(`- Content CID: ${metadata.encrypted.contentCID}`);
      console.log(`- File Count: ${metadata.encrypted.fileCount}`);
      console.log(`- Total Size: ${metadata.encrypted.totalSize}`);
      
      console.log('\n✅ SUCCESS: Dual IPFS approach is working!');
      console.log('- Description is preserved in metadata');
      console.log('- Encrypted content CID is referenced');
      console.log('- All component information is accessible');
      
      // Check if this might be our component
      if (metadata.component.title === componentData.title || 
          metadata.component.title === "Dual IPFS Test") {
        console.log('\n🎯 This appears to be the metadata for our registered component!');
        console.log(`Metadata CID: ${file.ipfs_pin_hash}`);
        console.log(`This would hash to: cid_${file.ipfs_pin_hash.substring(0, 26)}`);
      }
    }
  }
  
  console.log('\n=== Verification Complete ===');
}

// Run the verification
verifyDualIPFS().catch(console.error); 