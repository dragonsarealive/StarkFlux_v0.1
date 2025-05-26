import React, { useEffect, useState } from 'react';
import { useWallet } from './WalletProvider';
import colors from '../../utils/colors';

const WalletErrorMessage: React.FC = () => {
  const { error } = useWallet();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('Wallet Error');
  const [autoHideTimer, setAutoHideTimer] = useState<number | null>(null);

  // Process error messages and update UI
  useEffect(() => {
    // Clear any existing timer
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }
    
    if (error) {
      // Process error messages to make them more user-friendly
      if (error.message.includes("No wallet") || 
          error.message.includes("extension") ||
          error.message.includes("not found")) {
        setTitle('Wallet Not Found');
        setMessage(`Please install ArgentX or Braavos wallet extension for your browser. If already installed, please check that it's enabled and try refreshing the page.`);
      } else if (error.message.includes("User abort") || 
                error.message.includes("cancelled") || 
                error.message.includes("reject")) {
        setTitle('Connection Cancelled');
        setMessage('You cancelled the wallet connection request');
      } else if (error.message.includes("Failed to connect") ||
                error.message.includes("not responding")) {
        setTitle('Connection Failed');
        setMessage('Please check that your wallet is unlocked and try again');
      } else if (error.message.includes("network") || 
                error.message.includes("chain") ||
                error.message.includes("testnet")) {
        setTitle('Network Mismatch');
        setMessage('Please set your wallet to Sepolia testnet and try again');
      } else if (error.message.includes("already in progress") ||
                error.message.includes("pending")) {
        setTitle('Connection Pending');
        setMessage('A wallet connection is already in progress. Check your wallet for pending requests');
      } else if (error.message.includes("timeout")) {
        setTitle('Connection Timeout');
        setMessage('Connection timed out. Please try again or restart your browser');
      } else if (error.message.includes("account") && 
                error.message.includes("available")) {
        setTitle('Account Not Available');
        setMessage('Wallet connected but account not available. Please unlock your wallet and try again');
      } else {
        // Default error handling
        setTitle('Wallet Error');
        setMessage(error.message);
      }
      
      setVisible(true);
      
      // Auto hide after 6 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 6000);
      
      setAutoHideTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [error]);

  if (!visible || !message) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(25, 25, 30, 0.95)',
        color: 'white',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        maxWidth: '350px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        animation: 'slideIn 0.3s ease-out',
        borderLeft: `4px solid ${colors.error}`,
        gap: '12px',
      }}
    >
      {/* Error icon */}
      <div style={{ marginTop: '2px', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" 
                fill={colors.error} />
        </svg>
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: colors.textPrimary }}>{title}</div>
        <div style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.4' }}>{message}</div>
      </div>
      
      <button 
        onClick={() => setVisible(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '4px',
          opacity: 0.7,
          marginTop: '-2px',
          marginRight: '-4px',
          height: '24px',
          width: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
      >
        ✕
      </button>
      
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default WalletErrorMessage; 