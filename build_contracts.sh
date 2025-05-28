#!/bin/bash
set -e

echo "Building all contracts in workspace..."
scarb build --workspace

# Create a directory for deployment artifacts
mkdir -p ./target/deployment

echo "Preparing artifacts for deployment..."

# Copy artifacts from each package's target directory
for pkg in component_registry_v2 identity_registry marketplace_subscription dev_subscription; do
  echo "Processing $pkg..."
  
  # Find the Sierra file
  sierra_file=$(find ./packages/$pkg/target/dev -name "*.sierra.json" | head -n 1)
  
  if [ -n "$sierra_file" ]; then
    cp "$sierra_file" "./target/deployment/${pkg}_contract.sierra.json"
    echo "  Copied Sierra artifact to target/deployment/${pkg}_contract.sierra.json"
  else
    echo "  WARNING: No Sierra file found for $pkg"
  fi
  
  # Find the contract class file
  class_file=$(find ./packages/$pkg/target/dev -name "*.contract_class.json" | head -n 1)
  
  if [ -n "$class_file" ]; then
    cp "$class_file" "./target/deployment/${pkg}_contract.contract_class.json"
    echo "  Copied contract class artifact to target/deployment/${pkg}_contract.contract_class.json"
  else
    echo "  WARNING: No contract class file found for $pkg"
  fi
done

echo "Getting class hashes for each contract..."
for contract in ./target/deployment/*.contract_class.json; do
  contract_name=$(basename "$contract" .contract_class.json)
  echo "Class hash for $contract_name:"
  starkli class-hash "$contract"
  echo ""
done

echo "Artifacts prepared for deployment in target/deployment/"
echo "You can now declare and deploy the contracts using starkli." 