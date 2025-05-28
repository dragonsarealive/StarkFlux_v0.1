#!/bin/bash

# fix_artifacts_unix.sh - Script to fix Scarb artifact module paths for proper deployment
# Updated for version 1.1.0 - Creates correct artifact files for deployment of new contract classes

echo "Starting artifact fix process for v1.1.0..."

# Create target directory
mkdir -p target/fixed

# For each contract, create a properly named artifact with the correct module path
echo "Fixing identity_registry v1.1.0..."
cp target/dev/identity_registry_IdentityRegistry.contract_class.json target/fixed/identity_registry.contract_class.json

echo "Fixing component_registry v1.1.0..."
cp target/dev/component_registry_ComponentRegistry.contract_class.json target/fixed/component_registry.contract_class.json 

echo "Fixing dev_subscription v1.1.0..."
cp target/dev/dev_subscription_DevSubscription.contract_class.json target/fixed/dev_subscription.contract_class.json

echo "Fixing marketplace_subscription v1.1.0..."
cp target/dev/marketplace_subscription_MarketplaceSubscription.contract_class.json target/fixed/marketplace_subscription.contract_class.json

echo "Artifact fix for v1.1.0 complete. Fixed artifacts are in target/fixed/" 