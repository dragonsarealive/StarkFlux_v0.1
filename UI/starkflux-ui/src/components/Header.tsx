import { Link, useLocation } from 'react-router-dom'
import WalletConnectButton from './WalletConnectButton'
import colors from '../utils/colors'

const Header = () => {
  const location = useLocation();
  
  // Check if the current path matches the link
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Nav link with appropriate styles
  const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
    const active = isActive(to);
    
    return (
      <Link 
        to={to} 
        style={{ 
          color: active ? colors.textPrimary : colors.textSecondary, 
          textDecoration: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          position: 'relative',
          fontWeight: active ? '600' : '500',
          backgroundColor: active ? colors.glassHighlight : 'transparent',
          letterSpacing: '0.3px',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.color = colors.textPrimary;
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.textSecondary;
          }
        }}
      >
        {children}
        {active && (
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '2px',
            background: `linear-gradient(90deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
            borderRadius: '2px',
          }}></div>
        )}
      </Link>
    );
  };
  
  // Logo component
  const ModernDeerLogo = () => (
    <img 
      src="https://i.postimg.cc/G2nCjRF8/starkflux-logo.png" 
      alt="StarkFlux Logo" 
      style={{
        width: '80px',
        height: '80px',
        objectFit: 'contain'
      }}
    />
  );

  return (
    <>
      {/* Testnet Warning Banner */}
      <div style={{
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderBottom: '1px solid rgba(255, 193, 7, 0.3)',
        padding: '8px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        color: '#FFC107',
        letterSpacing: '0.5px',
      }}>
        ⚠️ WARNING: TESTNET ONLY - Do not use real funds
      </div>
      
      <div style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        backgroundColor: colors.glass,
        color: colors.textPrimary,
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: `1px solid ${colors.glassBorder}`,
      }}>
        {/* Logo with title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(216, 31, 42, 0.2) 0%, rgba(216, 31, 42, 0) 70%)`,
              filter: 'blur(8px)',
              opacity: 0.8,
            }}></div>
            <ModernDeerLogo />
          </div>
          
          <h1 style={{ 
            margin: 0,
            fontWeight: '700',
            letterSpacing: '0.5px',
            textShadow: '0 0 10px rgba(216, 31, 42, 0.3)',
            color: colors.textPrimary,
            fontSize: '1.5rem',
          }}>
            STARKFLUX
          </h1>
        </div>
        
        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.15)',
          padding: '4px',
          borderRadius: '12px',
        }}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/register">Dev Profile</NavLink>
          <NavLink to="/upload">Upload</NavLink>
          
          {/* Separator */}
          <div style={{
            width: '1px',
            height: '24px',
            backgroundColor: colors.glassBorder,
            margin: '0 4px'
          }}></div>
          
          <WalletConnectButton />
        </div>
      </div>
    </>
  )
}

export default Header 