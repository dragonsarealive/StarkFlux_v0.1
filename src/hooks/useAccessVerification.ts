import { useComponentRegistry } from './useComponentRegistry';
import { useDevSubscription } from './useDevSubscription';
import { useMarketplaceSubscription } from './useMarketplaceSubscription';
import { mockPurchasedComponents } from '../mocks/subscriptions';

/**
 * Hook to verify component access rights based on various conditions.
 * Combines data from different contracts to determine access rights.
 */
export const useAccessVerification = (componentId: number | string, userAddress?: string) => {
  const { getComponent, isFree } = useComponentRegistry();
  const { isSubscribed: isDevSubscribed } = useDevSubscription();
  const { isSubscribed: isMarketplaceSubscribed } = useMarketplaceSubscription();

  if (!userAddress) {
    return {
      hasAccess: false,
      hasBuyAccess: false,
      hasDevSubAccess: false,
      hasMarketSubAccess: false,
      hasFreeAccess: false,
      loading: false,
      error: "No user address provided"
    };
  }

  const component = getComponent(componentId);
  if (!component) {
    return {
      hasAccess: false,
      hasBuyAccess: false,
      hasDevSubAccess: false,
      hasMarketSubAccess: false,
      hasFreeAccess: false,
      loading: false,
      error: "Component not found"
    };
  }

  // Check if component is free
  const hasFreeAccess = isFree(componentId);

  // Check if user has purchased the component
  const hasPurchased = mockPurchasedComponents.some(
    purchase => 
      purchase.user.toLowerCase() === userAddress.toLowerCase() && 
      purchase.component_id === (typeof componentId === 'string' ? parseInt(componentId, 10) : componentId)
  );
  const hasBuyAccess = hasPurchased && !!(component.access_flags & 1);

  // Check developer subscription access
  const hasDevSubAccess = !!(component.access_flags & 2) && isDevSubscribed(userAddress, component.seller_id);

  // Check marketplace subscription access
  const hasMarketSubAccess = !!(component.access_flags & 4) && isMarketplaceSubscribed(userAddress);

  // Determine overall access
  const hasAccess = hasBuyAccess || hasDevSubAccess || hasMarketSubAccess || hasFreeAccess;

  return {
    hasAccess,
    hasBuyAccess,
    hasDevSubAccess,
    hasMarketSubAccess,
    hasFreeAccess,
    loading: false,
    error: null
  };
}; 