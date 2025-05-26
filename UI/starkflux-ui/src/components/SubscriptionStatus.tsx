// Props for the subscription status
type SubscriptionStatusProps = {
  type: 'marketplace' | 'developer';
  active: boolean;
  expiry?: string;
  developerName?: string;
}

const SubscriptionStatus = ({ type, active, expiry, developerName }: SubscriptionStatusProps) => {
  // Format expiry date for display
  const formatExpiry = (expiryDate: string) => {
    if (!expiryDate) return 'N/A';
    return new Date(expiryDate).toLocaleDateString();
  };
  
  return (
    <div style={{ 
      backgroundColor: '#444444', 
      padding: '20px', 
      borderRadius: '8px',
      marginBottom: '15px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>
          {type === 'marketplace' ? 'Marketplace Subscription' : `Developer Subscription: ${developerName}`}
        </h3>
        <span style={{ 
          backgroundColor: active ? 'green' : 'red',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {active ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      {active && expiry && (
        <div>
          <p style={{ marginBottom: '10px' }}>Expires: {formatExpiry(expiry)}</p>
          <div style={{ height: '8px', backgroundColor: '#333333', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: '60%', // This would be calculated based on time remaining
                backgroundColor: '#FF0000'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button style={{
              backgroundColor: '#FF0000',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Renew Subscription
            </button>
          </div>
        </div>
      )}
      
      {!active && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={{
            backgroundColor: '#FF0000',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Subscribe
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus; 