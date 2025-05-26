import { useState, useEffect } from 'react';
import colors from '../utils/colors';
import { useWallet } from './wallet/WalletProvider';
import { shortenAddress, copyToClipboard, normalizeAddress } from './wallet/utils';

const WalletConnectButton = () => {
  const { address, isConnected, isConnecting, walletType, error, connectWallet, disconnectWallet } = useWallet();
  const [isHovering, setIsHovering] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [connectingDots, setConnectingDots] = useState('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState('');
  
  // Animate connecting dots
  useEffect(() => {
    if (isConnecting) {
      const interval = setInterval(() => {
        setConnectingDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
    
    return () => {};
  }, [isConnecting]);

  // Reset diagnostic when error changes
  useEffect(() => {
    if (error) {
      setShowDiagnostic(false);
      setDiagnosticInfo('');
    }
  }, [error]);
  
  // Handle copy address to clipboard
  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Ensure we copy the normalized address
      const normalizedAddr = normalizeAddress(address);
      await copyToClipboard(normalizedAddr);
      setTooltipMessage('Address copied!');
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
      setTooltipMessage('Failed to copy');
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };
  
  // Get wallet display name
  const getWalletName = () => {
    if (walletType === 'argentX') {
      return 'Argent X';
    } else if (walletType === 'braavos') {
      return 'Braavos';
    } else {
      return 'StarkNet Wallet';
    }
  };
  
  // Get wallet icon
  const getWalletIcon = () => {
    if (walletType === 'argentX') {
      // Argent X icon
      return (
        <svg width="14" height="14" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 15C0 6.71573 6.71573 0 15 0H45C53.2843 0 60 6.71573 60 15V45C60 53.2843 53.2843 60 45 60H15C6.71573 60 0 53.2843 0 45V15Z" fill="#FF5B81"/>
          <path d="M40.739 19H35.6144L30 28.9667L24.3856 19H19.261L27.7433 33.6837L18.7316 49H23.8562L30 38.4522L36.1438 49H41.2684L32.2567 33.6837L40.739 19Z" fill="white"/>
        </svg>
      );
    } else if (walletType === 'braavos') {
      // Braavos icon
      return (
        <svg width="14" height="14" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 26C0 11.6406 11.6406 0 26 0H274C288.359 0 300 11.6406 300 26V274C300 288.359 288.359 300 274 300H26C11.6406 300 0 288.359 0 274V26Z" fill="#1A3C3F"/>
          <path d="M221.667 68.3333H210.833V53.3333C210.833 50.5761 209.738 47.9316 207.785 45.9781C205.831 44.0246 203.187 42.9292 200.43 42.9292H100.43C97.6725 42.9292 95.0281 44.0246 93.0746 45.9781C91.1211 47.9316 90.0257 50.5761 90.0257 53.3333V68.3333H79.1923C76.435 68.3333 73.7906 69.4287 71.8371 71.3822C69.8836 73.3357 68.7882 75.9801 68.7882 78.7373V246.667C68.7882 249.424 69.8836 252.068 71.8371 254.022C73.7906 255.975 76.435 257.071 79.1923 257.071H221.667C224.424 257.071 227.068 255.975 229.022 254.022C230.975 252.068 232.071 249.424 232.071 246.667V78.7373C232.071 75.9801 230.975 73.3357 229.022 71.3822C227.068 69.4287 224.424 68.3333 221.667 68.3333ZM150.43 126.071C139.147 126.071 128.147 121.84 119.833 113.526C111.519 105.213 107.287 94.213 107.287 82.9292C107.287 82.0503 107.637 81.2075 108.26 80.5836C108.884 79.9597 109.727 79.6097 110.606 79.6097C111.485 79.6097 112.327 79.9597 112.951 80.5836C113.575 81.2075 113.925 82.0503 113.925 82.9292C113.925 92.0704 117.559 100.8 124.038 107.28C130.517 113.759 139.246 117.393 148.388 117.393C157.529 117.393 166.258 113.759 172.738 107.28C179.217 100.8 182.851 92.0704 182.851 82.9292C182.851 82.0503 183.201 81.2075 183.825 80.5836C184.449 79.9597 185.291 79.6097 186.17 79.6097C187.049 79.6097 187.892 79.9597 188.516 80.5836C189.14 81.2075 189.49 82.0503 189.49 82.9292C189.49 94.213 185.258 105.213 176.944 113.526C168.63 121.84 157.63 126.071 146.347 126.071H150.43ZM129.573 220.613L114.573 205.613C114.262 205.302 114.015 204.931 113.849 204.522C113.683 204.113 113.6 203.675 113.606 203.232C113.611 202.789 113.704 202.353 113.879 201.949C114.055 201.545 114.31 201.179 114.627 200.876C114.945 200.573 115.322 200.335 115.733 200.178C116.144 200.022 116.582 199.949 117.025 199.963C117.468 199.978 117.9 200.081 118.3 200.264C118.699 200.448 119.06 200.709 119.357 201.033L125.763 207.439V178.749C125.763 177.87 126.113 177.028 126.737 176.404C127.361 175.78 128.204 175.429 129.083 175.429C129.962 175.429 130.805 175.78 131.429 176.404C132.052 177.028 132.402 177.87 132.402 178.749V207.429L138.809 201.033C139.105 200.709 139.466 200.448 139.866 200.264C140.265 200.081 140.697 199.978 141.14 199.963C141.584 199.949 142.021 200.022 142.432 200.178C142.843 200.335 143.22 200.573 143.538 200.876C143.855 201.179 144.11 201.545 144.286 201.949C144.462 202.353 144.554 202.789 144.559 203.232C144.565 203.675 144.482 204.113 144.316 204.522C144.15 204.931 143.904 205.302 143.593 205.613L128.593 220.613C128.284 220.923 127.913 221.168 127.504 221.334C127.096 221.5 126.657 221.583 126.214 221.578C125.772 221.573 125.335 221.48 124.931 221.304C124.528 221.128 124.161 220.873 123.858 220.556C123.555 220.239 123.318 219.862 123.161 219.451C123.004 219.04 122.932 218.602 122.946 218.159C122.961 217.717 123.064 217.284 123.248 216.885C123.431 216.485 123.692 216.124 124.017 215.826L129.573 220.613ZM178.593 200.613C178.905 200.302 179.151 199.931 179.317 199.522C179.483 199.113 179.567 198.675 179.561 198.232C179.555 197.789 179.462 197.353 179.286 196.949C179.11 196.545 178.855 196.179 178.538 195.876C178.221 195.573 177.844 195.335 177.433 195.178C177.022 195.022 176.584 194.949 176.141 194.963C175.697 194.978 175.265 195.081 174.866 195.264C174.466 195.448 174.105 195.709 173.809 196.033L167.402 202.439V173.749C167.402 172.87 167.052 172.028 166.428 171.404C165.804 170.78 164.962 170.429 164.083 170.429C163.204 170.429 162.361 170.78 161.737 171.404C161.113 172.028 160.763 172.87 160.763 173.749V202.429L154.356 196.033C154.06 195.709 153.699 195.448 153.3 195.264C152.9 195.081 152.468 194.978 152.025 194.963C151.582 194.949 151.144 195.022 150.733 195.178C150.322 195.335 149.945 195.573 149.627 195.876C149.31 196.179 149.055 196.545 148.879 196.949C148.704 197.353 148.611 197.789 148.606 198.232C148.6 198.675 148.683 199.113 148.849 199.522C149.015 199.931 149.262 200.302 149.573 200.613L164.573 215.613C165.197 216.237 166.04 216.587 166.918 216.587C167.797 216.587 168.639 216.237 169.263 215.613L184.263 200.613C184.574 200.302 184.821 199.931 184.987 199.522C185.153 199.113 185.236 198.675 185.23 198.232C185.225 197.789 185.132 197.353 184.956 196.949C184.781 196.545 184.525 196.179 184.208 195.876C183.891 195.573 183.514 195.335 183.103 195.178C182.692 195.022 182.254 194.949 181.811 194.963C181.368 194.978 180.936 195.081 180.536 195.264C180.137 195.448 179.776 195.709 179.479 196.033L173.073 202.439V173.749C173.073 172.87 172.722 172.028 172.098 171.404C171.474 170.78 170.632 170.429 169.753 170.429C168.874 170.429 168.031 170.78 167.407 171.404C166.783 172.028 166.433 172.87 166.433 173.749V202.429L160.026 196.033C159.729 195.709 159.368 195.448 158.969 195.264C158.569 195.081 158.137 194.978 157.694 194.963C157.251 194.949 156.813 195.022 156.402 195.178C155.991 195.335 155.614 195.573 155.297 195.876C154.98 196.179 154.724 196.545 154.549 196.949C154.373 197.353 154.28 197.789 154.275 198.232C154.269 198.675 154.352 199.113 154.518 199.522C154.684 199.931 154.931 200.302 155.242 200.613L170.242 215.613C170.551 215.924 170.923 216.17 171.331 216.336C171.74 216.502 172.178 216.585 172.621 216.579C173.064 216.574 173.5 216.481 173.904 216.305C174.307 216.129 174.674 215.874 174.977 215.557C175.28 215.24 175.518 214.863 175.674 214.452C175.831 214.041 175.903 213.602 175.889 213.16C175.874 212.717 175.771 212.285 175.587 211.885C175.404 211.486 175.143 211.125 174.818 210.826L178.593 200.613Z" fill="#4FE1B8"/>
        </svg>
      );
    } else {
      // Generic wallet icon
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 7h-1V6a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3zm-1 11H5V6h10v1h-5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9v7zm1-9h-9V8h9v1z" fill="white"/>
        </svg>
      );
    }
  };

  // Check wallet availability for diagnostics
  const checkWalletAvailability = () => {
    const walletInfo = {
      windowStarknet: Boolean(window.starknet),
      windowArgentX: Boolean(window.starknet_argentX),
      windowBraavos: Boolean(window.starknet_braavos),
      starknetEnabled: Boolean(window.starknet?.enable),
      starknetConnected: Boolean(window.starknet?.isConnected),
      hasAccount: Boolean(window.starknet?.account),
      browserName: navigator.userAgent
    };

    setDiagnosticInfo(JSON.stringify(walletInfo, null, 2));
    setShowDiagnostic(true);
  };
  
  return (
    <div>
      {isConnected && address ? (
        <div 
          style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '6px 12px',
            borderRadius: '10px',
            transition: 'all 0.3s ease',
            border: `1px solid ${isHovering ? colors.glassBorder : 'transparent'}`,
            boxShadow: isHovering ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
            position: 'relative'
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: colors.success,
            borderRadius: '50%',
            marginRight: '5px',
            boxShadow: '0 0 10px rgba(47, 158, 68, 0.5)'
          }}></div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-start',
            cursor: 'pointer'
          }}
          onClick={handleCopyAddress}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {getWalletIcon()}
              <span style={{ 
                fontSize: '14px',
                fontWeight: 'bold',
                color: colors.textPrimary
              }}>
                {getWalletName()}
              </span>
            </div>
            <span style={{ 
              fontSize: '10px',
              color: colors.textSecondary
            }}>
              {shortenAddress(address)}
            </span>
            
            {/* Copy tooltip */}
            {showTooltip && (
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 10,
                whiteSpace: 'nowrap'
              }}>
                {tooltipMessage}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => disconnectWallet()}
            style={{
              backgroundColor: 'transparent',
              color: colors.textPrimary,
              border: `1px solid ${colors.glassBorder}`,
              padding: '4px 8px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease',
              opacity: isHovering ? '1' : '0.7'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(150, 21, 29, 0.15)';
              e.currentTarget.style.border = `1px solid rgba(216, 31, 42, 0.3)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.border = `1px solid ${colors.glassBorder}`;
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => connectWallet()}
            disabled={isConnecting}
            style={{
              background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
              color: colors.textPrimary,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              cursor: isConnecting ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 10px rgba(150, 21, 29, 0.2)',
              animation: isConnecting ? 'pulse 1.5s infinite' : 'none',
              opacity: isConnecting ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!isConnecting) {
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(150, 21, 29, 0.35)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(150, 21, 29, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {getWalletIcon()}
            {isConnecting ? `Connecting${connectingDots}` : 'Connect Wallet'}
          </button>
          
          {error && (
            <button
              onClick={checkWalletAvailability}
              style={{
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                border: `1px dashed ${colors.glassBorder}`,
                padding: '4px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                marginTop: '5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = colors.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              Check Wallet Status
            </button>
          )}
          
          {showDiagnostic && (
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '10px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxWidth: '300px',
              maxHeight: '200px',
              overflowY: 'auto',
              color: '#00ff00',
              border: '1px solid #333'
            }}>
              <div style={{ marginBottom: '5px', color: '#fff', fontSize: '12px' }}>Wallet Diagnostic Info:</div>
              {diagnosticInfo}
              <button
                onClick={() => setShowDiagnostic(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ddd',
                  border: 'none',
                  padding: '2px 4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  marginTop: '5px',
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Add keyframe animations - these would typically go in a CSS file */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default WalletConnectButton; 