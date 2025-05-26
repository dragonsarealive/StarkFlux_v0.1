import { useState } from 'react';
import { mockDevelopers } from '../mocks/developers';

/**
 * Mock hook for identity registry interactions.
 * Will be replaced with real contract calls later.
 */
export const useIdentityRegistry = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get developer identity by ID
  const getIdentity = (developerId: number | string) => {
    const id = typeof developerId === 'string' ? parseInt(developerId, 10) : developerId;
    return mockDevelopers.find(dev => dev.id === id);
  };

  // Get developer ID by address
  const getDeveloperId = (address: string) => {
    const developer = mockDevelopers.find(dev => 
      dev.owner.toLowerCase() === address.toLowerCase()
    );
    return developer ? developer.id : null;
  };

  // Check if address is a registered developer
  const isRegisteredDeveloper = (address: string) => {
    return mockDevelopers.some(dev => 
      dev.owner.toLowerCase() === address.toLowerCase()
    );
  };

  return {
    getIdentity,
    getDeveloperId,
    isRegisteredDeveloper,
    loading,
    error
  };
}; 