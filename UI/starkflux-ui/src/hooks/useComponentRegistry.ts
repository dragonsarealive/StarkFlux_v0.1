import { useState, useEffect, useCallback } from 'react';
import { Contract, RpcProvider, shortString, num, hash } from 'starknet';
import { CONTRACT_ADDRESSES, COMPONENT_REGISTRY_ABI } from '../abis';
import { ComponentMetadata } from '../types/metadata';

// Component type matching the contract structure
interface Component {
  id: number;
  title: string;
  description?: string; // Fetched from IPFS metadata
  reference: string;
  seller: string;
  seller_id: number;
  price_strk: string;
  access_flags: number;
  timestamp: number;
  is_active?: boolean;
  price_usd_micros?: string;
  price_feed_key?: string;
  // Additional metadata fields
  metadata?: ComponentMetadata;
  tags?: string[];
  category?: string;
  screenshots?: string[];
}

/**
 * Hook for component registry interactions with real blockchain data.
 * Fetches components from events and their metadata from IPFS.
 */
export const useComponentRegistry = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to fetch metadata from IPFS
  const fetchMetadataFromIPFS = async (reference: string): Promise<ComponentMetadata | null> => {
    try {
      // Check if this is a hashed CID (starts with cid_)
      if (reference.startsWith('cid_')) {
        // Try to get the original CID from localStorage
        const originalCid = localStorage.getItem(`cidMapping_${reference}`);
        if (originalCid) {
          reference = originalCid;
          console.log(`Found mapping for ${reference.substring(0, 20)}... -> ${originalCid}`);
        } else {
          // Can't fetch metadata without the original CID
          console.log(`No mapping found for hashed CID: ${reference}`);
          return null;
        }
      }
      
      // Try to fetch from IPFS gateways
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${reference}`,
        `https://ipfs.io/ipfs/${reference}`,
        `https://cloudflare-ipfs.com/ipfs/${reference}`
      ];
      
      for (const gateway of gateways) {
        try {
          const response = await fetch(gateway);
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const metadata = await response.json();
              // Verify it's valid metadata
              if (metadata.version && metadata.component && metadata.encrypted) {
                console.log(`Successfully fetched metadata for component: ${metadata.component.title}`);
                return metadata as ComponentMetadata;
              }
            }
          }
        } catch (err) {
          console.error(`Gateway ${gateway} failed:`, err);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching metadata from IPFS:', error);
      return null;
    }
  };

  // Fetch components from blockchain events
  const fetchComponents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch components from blockchain events...');

      // Initialize provider - using public endpoint
      const provider = new RpcProvider({ 
        nodeUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7'
      });

      // Create contract instance
      const contract = new Contract(
        COMPONENT_REGISTRY_ABI,
        CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
        provider
      );

      // Calculate the event key for ComponentRegistered
      const eventKey = hash.getSelectorFromName('ComponentRegistered');
      console.log('Event key for ComponentRegistered:', eventKey);

      // Fetch events from the last 1000 blocks (adjust as needed)
      const latestBlock = await provider.getBlock('latest');
      const fromBlock = Math.max(0, latestBlock.block_number - 1000);
      
      console.log(`Fetching events from block ${fromBlock} to ${latestBlock.block_number}`);

      // Get events
      const events = await provider.getEvents({
        address: CONTRACT_ADDRESSES.COMPONENT_REGISTRY,
        from_block: { block_number: fromBlock },
        to_block: { block_number: latestBlock.block_number },
        keys: [[eventKey]],
        chunk_size: 100
      });

      console.log(`Found ${events.events.length} ComponentRegistered events`);

      const fetchedComponents: Component[] = [];
      const componentMap = new Map<number, Component>();

      // Process each event
      for (const event of events.events) {
        try {
          // Event structure based on ABI:
          // keys: [event_key, component_id, seller]
          // data: [reference, title, price_strk, price_usd_micros, price_feed_key, access_flags]
          
          const componentId = Number(event.keys[1]);
          const seller = event.keys[2];
          
          const reference = event.data[0];
          const title = event.data[1];
          const priceStrk = event.data[2];
          const priceUsdMicros = event.data[3];
          const priceFeedKey = event.data[4];
          const accessFlags = Number(event.data[5]);

          // Decode title and reference
          let decodedTitle = `Component #${componentId}`;
          let decodedReference = reference;
          
          try {
            if (title && title !== '0x0') {
              decodedTitle = shortString.decodeShortString(title);
            }
          } catch (e) {
            console.log('Could not decode title:', title);
          }

          try {
            if (reference && reference.startsWith('0x') && reference !== '0x0') {
              decodedReference = shortString.decodeShortString(reference);
            }
          } catch (e) {
            console.log('Could not decode reference, keeping as hex');
          }

          const component: Component = {
            id: componentId,
            title: decodedTitle,
            reference: decodedReference,
            seller: seller,
            seller_id: 0, // Would need to fetch from IdentityRegistry
            price_strk: priceStrk,
            price_usd_micros: priceUsdMicros,
            price_feed_key: priceFeedKey,
            access_flags: accessFlags,
            timestamp: event.block_number || Date.now() / 1000,
            is_active: true // Assume active unless we find deactivation event
          };

          // Store in map to handle duplicates (keep latest)
          componentMap.set(componentId, component);

          console.log(`Found component ${componentId}: ${decodedTitle} (ref: ${decodedReference.substring(0, 20)}...)`);
        } catch (err) {
          console.error('Error processing event:', err);
        }
      }

      // Convert map to array and fetch metadata
      for (const component of componentMap.values()) {
        try {
          // Try to fetch metadata
          const metadata = await fetchMetadataFromIPFS(component.reference);
          if (metadata) {
            component.description = metadata.component.description;
            component.tags = metadata.component.tags;
            component.category = metadata.component.category;
            component.screenshots = metadata.component.screenshots;
            component.metadata = metadata;
            console.log(`Successfully loaded metadata for component ${component.id}: ${component.title}`);
          } else {
            console.log(`No metadata available for component ${component.id}`);
          }
          
          fetchedComponents.push(component);
        } catch (err) {
          console.error(`Error fetching metadata for component ${component.id}:`, err);
          // Add component even if metadata fetch fails
          fetchedComponents.push(component);
        }
      }

      // Sort by ID (newest first)
      fetchedComponents.sort((a, b) => b.id - a.id);

      console.log(`Successfully processed ${fetchedComponents.length} components`);
      setComponents(fetchedComponents);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError('Failed to fetch components from blockchain');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch components on mount
  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  // Get a specific component by ID
  const getComponent = useCallback((componentId: number | string) => {
    const id = typeof componentId === 'string' ? parseInt(componentId, 10) : componentId;
    return components.find(c => c.id === id);
  }, [components]);

  // Get all components
  const getAllComponents = useCallback(() => {
    return components;
  }, [components]);

  // Check if a component is free
  const isFree = useCallback((componentId: number | string) => {
    const component = getComponent(componentId);
    return component ? !!(component.access_flags & 8) : false;
  }, [getComponent]);

  // Refresh components
  const refreshComponents = useCallback(() => {
    fetchComponents();
  }, [fetchComponents]);

  return {
    getComponent,
    getAllComponents,
    isFree,
    loading,
    error,
    refreshComponents,
    totalComponents: components.length
  };
}; 