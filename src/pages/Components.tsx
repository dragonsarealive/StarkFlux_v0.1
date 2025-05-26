import React, { useState } from 'react';
import { DEVELOPMENT_ACCOUNT } from '../abis/contracts';
import ComponentList from '../components/ComponentList';
import ComponentAccess from '../components/ComponentAccess';
import colors from '../utils/colors';

const Components: React.FC = () => {
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  
  // Using development account for initial testing
  const userAddress = DEVELOPMENT_ACCOUNT.address;
  
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ 
        color: colors.textPrimary,
        marginBottom: '20px',
        background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Components Marketplace
      </h1>
      
      {/* Component List */}
      <div style={{ marginBottom: '40px' }}>
        <ComponentList />
      </div>
      
      {/* Component Access Test Section */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'rgba(30, 44, 75, 0.2)', 
        borderRadius: '12px',
        border: `1px solid ${colors.glassBorder}`,
        marginTop: '40px' 
      }}>
        <h2 style={{ marginBottom: '20px' }}>Test Component Access</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="componentSelect" style={{ marginRight: '10px' }}>
            Select a component:
          </label>
          <select 
            id="componentSelect"
            value={selectedComponentId || ''}
            onChange={(e) => setSelectedComponentId(e.target.value ? parseInt(e.target.value, 10) : null)}
            style={{
              padding: '8px 16px',
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              border: `1px solid ${colors.glassBorder}`,
              borderRadius: '6px'
            }}
          >
            <option value="">-- Select Component --</option>
            <option value="1">1 - StarkNet Authentication Component</option>
            <option value="2">2 - StarkNet Data Indexer</option>
            <option value="3">3 - Cairo Library Utilities</option>
          </select>
        </div>
        
        {selectedComponentId && (
          <ComponentAccess 
            componentId={selectedComponentId} 
            userAddress={userAddress}
          />
        )}
      </div>
    </div>
  );
};

export default Components; 