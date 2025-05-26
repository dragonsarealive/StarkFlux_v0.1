import { useState } from 'react';
import { mockMarketplaceSubscriptions } from '../mocks/subscriptions';

/**
 * Mock hook for marketplace subscription interactions.
 * Will be replaced with real contract calls later.
 */
export const useMarketplaceSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a user is subscribed to the marketplace
  const isSubscribed = (address: string) => {
    const subscription = mockMarketplaceSubscriptions.find(
      sub => sub.user.toLowerCase() === address.toLowerCase()
    );
    
    if (!subscription) return false;
    
    // Check if subscription is still valid (not expired)
    const currentTime = Math.floor(Date.now() / 1000);
    return subscription.expiry > currentTime;
  };

  // Get subscription expiry for a user
  const getSubscriptionExpiry = (address: string) => {
    const subscription = mockMarketplaceSubscriptions.find(
      sub => sub.user.toLowerCase() === address.toLowerCase()
    );
    
    return subscription ? subscription.expiry : 0;
  };

  // Mock marketplace subscription price (fixed for now)
  const getPrice = () => {
    return "20000000000000000000"; // 20 STRK
  };

  return {
    isSubscribed,
    getSubscriptionExpiry,
    getPrice,
    loading,
    error
  };
}; 