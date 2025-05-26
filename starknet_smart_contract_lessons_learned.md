# StarkNet Smart Contract Development: Lessons Learned

This document captures key insights and lessons learned during the development, testing, and deployment preparation of the StarkFlux marketplace contracts on StarkNet.

## Class Hash Generation

1. **Storage Layout Changes Are Essential**
   - Adding or changing comments does NOT alter a contract's class hash
   - Adding storage variables DOES reliably create new class hashes
   - Function signature changes (adding new functions) DOES create new class hashes
   - Contract constants DOES affect class hash generation

2. **Version Tracking Is Valuable**
   - Implementing a formal version tracking mechanism provides both functional value and creates new class hashes
   - Storage variables for version tracking serve as documentation and upgrade validation
   - Version constants help maintain consistency across deployments

3. **Interface-Implementation Synchronization**
   - When adding a function to a contract, the interface must be updated first
   - The interface and implementation must stay in sync to avoid compilation issues
   - Both file changes must be deployed together for a successful upgrade

## Deployment Process

1. **Step-by-Step Compilation**
   - Compile contracts in the correct order based on dependencies
   - Verify each contract compiles on its own before combining
   - Use the "minimum viable code" approach to catch issues early

2. **Artifact Processing**
   - Original artifacts from Scarb builds may need post-processing
   - Use dedicated scripts like `fix_artifacts_unix.sh` to ensure proper deployment format
   - Verify artifacts after processing by checking class hashes

3. **Contract Declaration Order Matters**
   - Deploy dependent contracts in the correct order (e.g., IdentityRegistry before ComponentRegistry)
   - Track and verify each class hash before proceeding to the next contract
   - Save deployment info for each contract immediately after deployment

## ABI Extraction and UI Integration

**NEW SECTION: May 2025**

4. **Complete ABI Extraction from Deployed Contracts**
   - The compiled contract class JSON contains the complete ABI in the `abi` field
   - Extract using: `python3 -c "import json; contract_class = json.load(open('target/dev/component_registry_ComponentRegistry.contract_class.json', 'r')); json.dump(contract_class.get('abi', []), open('component_registry_v1_2_0.abi.json', 'w'), indent=2)"`
   - Complete ABIs are significantly larger than minimal ABIs (19KB vs 2KB) but provide access to all contract functions
   - Extraction should be done after each contract upgrade to maintain UI compatibility

5. **TypeScript Configuration for ABI Integration**
   - Enable JSON imports with `"resolveJsonModule": true` and `"allowSyntheticDefaultImports": true`
   - Create type declarations for ABI files: `declare module "*.abi.json" { const abi: any[]; export default abi; }`
   - Remove problematic TypeScript options like `"erasableSyntaxOnly"` that cause compilation errors
   - Import ABIs directly: `import ComponentRegistryABI from './component_registry_v1_2_0.abi.json'`

6. **Contract Address Management and Version Control**
   - Update UI contract addresses immediately after deploying new contract versions
   - Maintain deprecated addresses for reference but clearly mark them as no longer in use
   - Use environment variables for contract addresses to support different deployment environments
   - Document address changes in compatibility check files to track deployment history

7. **ABI Deployment Verification**
   - Block explorer "ABI not verified" warnings are cosmetic and don't affect functionality
   - UI applications can use complete ABIs extracted from compiled contracts without block explorer verification
   - Manual block explorer verification is optional but helpful for public visibility
   - Test contract functions through UI to verify ABI completeness and accuracy

## Smart Contract Design

1. **Storage Planning**
   - Plan storage layout carefully as it cannot be changed without redeployment
   - Group related storage variables together
   - Consider future extensibility in the initial design

2. **Error Handling Standards**
   - Error messages in Cairo must be ≤ 31 characters
   - Use consistent error prefix patterns (e.g., ERR_INVALID_VERSION_V110)
   - Group error constants at the top of the contract

3. **Event Design**
   - Include necessary indexed fields for efficient filtering
   - Design events with off-chain indexing in mind
   - Emit comprehensive information for tracking important state changes

## Testing and Security

1. **Progressive Testing Strategy**
   - Test individual contract functionalities before integration testing
   - Use mock objects for dependent contracts during isolated testing
   - Test both positive flows and error conditions

2. **Access Control Patterns**
   - Implement clear ownership and access control patterns
   - Use consistent helper functions like `_only_owner()` across contracts
   - Guard important state-changing functions with appropriate checks

3. **Numeric Safety**
   - Use appropriate numeric types (u64, u128, u256) based on maximum expected values
   - Check for overflow/underflow in arithmetic operations
   - Use safe math utilities for critical calculations

## Cairo-Specific Insights

1. **Class Hash Determinism**
   - Class hashes are fully deterministic based on contract code
   - Small changes in contract code can lead to entirely different class hashes
   - Renaming a contract or changing its contained modules affects class hash

2. **Fee Estimation**
   - Transactions on StarkNet have varying fees based on computation and storage
   - Test transactions on testnet to estimate fees before mainnet deployment
   - Include sensible defaults in deployment scripts with room for adjustment

3. **Interface Design**
   - Keep interfaces minimal but complete
   - Group related functions for clarity
   - Document parameter constraints and return value meanings

## UI-Contract Integration Patterns

**NEW SECTION: May 2025**

4. **Phased Integration Strategy**
   - Integrate one contract at a time rather than attempting all contracts simultaneously
   - Start with complete ABI extraction and contract address configuration
   - Progress from mock data to real contract calls incrementally
   - Test each integration phase thoroughly before proceeding to the next

5. **ABI Version Management**
   - Maintain ABI version files alongside UI code (e.g., `component_registry_v1_2_0.abi.json`)
   - Include ABI version in file names to track contract upgrades
   - Update UI imports and configuration when deploying new contract versions
   - Keep deprecated ABI files for reference during development

6. **Development Environment Configuration**
   - Use build-time environment variables for contract addresses across different networks
   - Configure separate ABI files for different contract versions in development and production
   - Set up TypeScript properly to handle dynamic JSON imports for ABI files
   - Test ABI integration with contract version verification functions

## Deployment Verification and Monitoring

**NEW SECTION: May 2025**

7. **Post-Deployment Verification Process**
   - Verify contract version by calling `get_version()` function after deployment
   - Test critical contract functions through UI immediately after deployment
   - Confirm contract addresses match expected values in UI configuration
   - Document successful deployment details including contract address, class hash, and version

8. **Integration Testing Methodology**
   - Test contract function accessibility through complete ABI before UI integration
   - Verify TypeScript compilation succeeds with new ABI imports
   - Test contract read operations (view functions) before write operations
   - Validate error handling for contract-specific error conditions

## Conclusion

Smart contract development on StarkNet requires careful planning, progressive testing, and attention to the specific requirements of the Cairo language. **UI integration adds additional complexity** that requires systematic ABI management, proper TypeScript configuration, and phased testing approaches.

**Key Success Factors Identified**:
- **Complete ABI Extraction**: Extract full ABIs rather than using minimal function sets
- **Version Control**: Maintain clear version tracking for both contracts and ABIs
- **Phased Integration**: Integrate one contract at a time with thorough testing
- **Address Management**: Update contract addresses systematically across all environments
- **TypeScript Configuration**: Properly configure module resolution for JSON imports

By following established patterns and learning from previous deployments, teams can create more robust, maintainable, and secure contract systems that leverage the unique capabilities of StarkNet's Layer 2 technology.

This document will be updated as additional insights are gathered through continued development and deployment experiences. 