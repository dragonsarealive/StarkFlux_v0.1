/**
 * Utility to clear old localStorage data from previous contract deployments
 * This helps prevent stale data from appearing when using new contracts
 */

export const clearOldDeploymentData = (walletAddress?: string) => {
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Patterns for old StarkFlux data
  const oldPatterns = [
    /^starkflux-profile-0x/,           // Old profile data
    /^starkflux-profile-history-0x/,   // Old profile history
    /^starkflux-profile-draft-0x/,     // Old draft data
    /^starkflux-component-/,           // Old component data
    /^starkflux-developer-/,           // Old developer data
  ];
  
  // If wallet address is provided, only clear data for that wallet
  const addressFilter = walletAddress ? walletAddress.toLowerCase() : null;
  
  keys.forEach(key => {
    // Check if key matches any old pattern
    const isOldData = oldPatterns.some(pattern => pattern.test(key));
    
    if (isOldData) {
      // If address filter is set, only remove if key contains that address
      if (!addressFilter || key.toLowerCase().includes(addressFilter)) {
        console.log(`Removing old data: ${key}`);
        localStorage.removeItem(key);
      }
    }
  });
  
  // Also clear any global StarkFlux data
  const globalKeys = [
    'starkflux-profile-draft',
    'starkflux-last-deployment',
    'starkflux-cached-components'
  ];
  
  globalKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Removing global data: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

/**
 * Get current deployment identifier based on contract addresses
 */
export const getCurrentDeploymentId = (contractAddresses: {
  IDENTITY_REGISTRY: string;
  COMPONENT_REGISTRY: string;
}) => {
  return `${contractAddresses.IDENTITY_REGISTRY.slice(0, 10)}_${contractAddresses.COMPONENT_REGISTRY.slice(0, 10)}`;
};

/**
 * Check if data is from current deployment
 */
export const isCurrentDeploymentData = (key: string, contractAddresses: {
  IDENTITY_REGISTRY: string;
  COMPONENT_REGISTRY: string;
}) => {
  const currentDeploymentId = getCurrentDeploymentId(contractAddresses);
  return key.includes(`starkflux_${currentDeploymentId}`);
}; 