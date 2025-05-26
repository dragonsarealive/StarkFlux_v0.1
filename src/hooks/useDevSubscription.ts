import { useState } from 'react';
import { mockDevSubscriptions } from '../mocks/subscriptions';

/**
 * Mock hook for developer subscription interactions.
 * Will be replaced with real contract calls later.
 */
export const useDevSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a user is subscribed to a specific developer
  const isSubscribed = (address: string, developerId: number | string) => {
    const devId = typeof developerId === 'string' ? parseInt(developerId, 10) : developerId;
    
    const subscription = mockDevSubscriptions.find(
      sub => 
        sub.user.toLowerCase() === address.toLowerCase() && 
        sub.developer_id === devId
    );
    
    if (!subscription) return false;
    
    // Check if subscription is still valid (not expired)
    const currentTime = Math.floor(Date.now() / 1000);
    return subscription.expiry > currentTime;
  };

  // Get subscription expiry for a user and developer
  const getSubscriptionExpiry = (address: string, developerId: number | string) => {
    const devId = typeof developerId === 'string' ? parseInt(developerId, 10) : developerId;
    
    const subscription = mockDevSubscriptions.find(
      sub => 
        sub.user.toLowerCase() === address.toLowerCase() && 
        sub.developer_id === devId
    );
    
    return subscription ? subscription.expiry : 0;
  };

  // Mock developer subscription price (fixed for now)
  const getPrice = (developerId: number | string) => {
    return "5000000000000000000"; // 5 STRK, same for all developers in mock
  };

  return {
    isSubscribed,
    getSubscriptionExpiry,
    getPrice,
    loading,
    error
  };
}; 