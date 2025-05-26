import React from 'react';
import { useComponentRegistry } from '../hooks/useComponentRegistry';
import { formatStrkPrice, formatAccessFlags, formatTimestamp } from '../utils/contractFormatters';

/**
 * Component to display a list of available components
 */
const ComponentList: React.FC = () => {
  const { getAllComponents, loading, error } = useComponentRegistry();
  
  const components = getAllComponents();
  
  if (loading) {
    return <div>Loading components...</div>;
  }
  
  if (error) {
    return <div>Error loading components: {error}</div>;
  }
  
  if (!components || components.length === 0) {
    return <div>No components found.</div>;
  }
  
  return (
    <div>
      <h2>Available Components</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {components.map(component => (
          <div 
            key={component.id} 
            style={{ 
              border: '1px solid #333', 
              borderRadius: '8px', 
              padding: '16px',
              background: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h3>{component.title}</h3>
            <p>ID: {component.id}</p>
            <p>Price: {formatStrkPrice(component.price_strk)} STRK</p>
            <p>Access: {formatAccessFlags(component.access_flags).join(', ')}</p>
            <p>Uploaded: {formatTimestamp(component.timestamp)}</p>
            <p>Reference: <a href={component.reference} target="_blank" rel="noopener noreferrer">View Component</a></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentList; 