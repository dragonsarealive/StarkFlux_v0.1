import { useState, useEffect } from 'react';
import { MonetizationPreferences } from '../components/MonetizationSelector';
import { ACCESS_FLAGS } from '../abis';

const PREFERENCES_KEY = 'starkflux_monetization_preferences';

export interface AccessFlagsFromPreferences {
  suggestedFlags: number;
  enabledMethods: string[];
  devSubscriptionPrice: string;
}

export const useMonetizationPreferences = () => {
  const [preferences, setPreferences] = useState<MonetizationPreferences>({
    direct: true,
    devSubscription: false,
    marketplace: false,
    free: false,
    devSubscriptionPrice: '5.00'
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) {
        const parsedPreferences = JSON.parse(saved);
        setPreferences(prev => ({
          ...prev,
          ...parsedPreferences
        }));
      }
    } catch (error) {
      console.error('Failed to load monetization preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const savePreferences = (newPreferences: MonetizationPreferences) => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to save monetization preferences:', error);
    }
  };

  // Convert preferences to access flags for component upload
  const getAccessFlagsFromPreferences = (): AccessFlagsFromPreferences => {
    let suggestedFlags = 0;
    const enabledMethods: string[] = [];

    if (preferences.free) {
      suggestedFlags = ACCESS_FLAGS.FREE;
      enabledMethods.push('Free');
    } else {
      if (preferences.direct) {
        suggestedFlags |= ACCESS_FLAGS.BUY;
        enabledMethods.push('Direct Sales');
      }
      
      if (preferences.devSubscription) {
        suggestedFlags |= ACCESS_FLAGS.DEV_SUB;
        enabledMethods.push('Developer Subscription');
      }
      
      if (preferences.marketplace) {
        suggestedFlags |= ACCESS_FLAGS.MKT_SUB;
        enabledMethods.push('Marketplace Subscription');
      }
    }

    // Default to direct sales if nothing is selected
    if (suggestedFlags === 0) {
      suggestedFlags = ACCESS_FLAGS.BUY;
      enabledMethods.push('Direct Sales (default)');
    }

    return {
      suggestedFlags,
      enabledMethods,
      devSubscriptionPrice: preferences.devSubscriptionPrice
    };
  };

  // Clear all preferences
  const clearPreferences = () => {
    try {
      localStorage.removeItem(PREFERENCES_KEY);
      setPreferences({
        direct: true,
        devSubscription: false,
        marketplace: false,
        free: false,
        devSubscriptionPrice: '5.00'
      });
    } catch (error) {
      console.error('Failed to clear monetization preferences:', error);
    }
  };

  return {
    preferences,
    savePreferences,
    getAccessFlagsFromPreferences,
    clearPreferences
  };
}; 