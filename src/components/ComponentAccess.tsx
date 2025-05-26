import React from 'react';
import { useAccessVerification } from '../hooks/useAccessVerification';
import { useComponentRegistry } from '../hooks/useComponentRegistry';
import { formatStrkPrice } from '../utils/contractFormatters';

interface ComponentAccessProps {
  componentId: number;
  userAddress: string;
}

/**
 * Component to display access status and options for a specific component
 */
const ComponentAccess: React.FC<ComponentAccessProps> = ({ componentId, userAddress }) => {
  const { getComponent } = useComponentRegistry();
  const { 
    hasAccess, 
    hasBuyAccess, 
    hasDevSubAccess, 
    hasMarketSubAccess, 
    hasFreeAccess,
    error 
  } = useAccessVerification(componentId, userAddress);
  
  const component = getComponent(componentId);
  
  if (!component) {
    return <div>Component not found</div>;
  }
  
  if (error) {
    return <div>Error checking access: {error}</div>;
  }
  
  return (
    <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '8px', maxWidth: '500px' }}>
      <h2>{component.title}</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Access Status</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <StatusBadge label="Overall Access" status={hasAccess} />
          {component.access_flags & 1 && <StatusBadge label="Purchase" status={hasBuyAccess} />}
          {component.access_flags & 2 && <StatusBadge label="Dev Subscription" status={hasDevSubAccess} />}
          {component.access_flags & 4 && <StatusBadge label="Market Subscription" status={hasMarketSubAccess} />}
          {component.access_flags & 8 && <StatusBadge label="Free" status={hasFreeAccess} />}
        </div>
      </div>
      
      {hasAccess ? (
        <div>
          <button 
            style={{
              padding: '10px 20px',
              backgroundColor: '#2F9E44',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Download Component
          </button>
        </div>
      ) : (
        <div>
          <h3>Access Options</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {component.access_flags & 1 && !hasBuyAccess && (
              <button 
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1E40AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Purchase for {formatStrkPrice(component.price_strk)} STRK
              </button>
            )}
            
            {component.access_flags & 2 && !hasDevSubAccess && (
              <button 
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#9333EA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Subscribe to Developer
              </button>
            )}
            
            {component.access_flags & 4 && !hasMarketSubAccess && (
              <button 
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0D9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Subscribe to Marketplace
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for access status badges
const StatusBadge: React.FC<{ label: string, status: boolean }> = ({ label, status }) => {
  return (
    <div 
      style={{
        padding: '4px 8px',
        backgroundColor: status ? 'rgba(47, 158, 68, 0.2)' : 'rgba(224, 49, 49, 0.2)',
        color: status ? '#2F9E44' : '#E03131',
        border: `1px solid ${status ? '#2F9E44' : '#E03131'}`,
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}
    >
      {label}: {status ? 'Yes' : 'No'}
    </div>
  );
};

export default ComponentAccess; 