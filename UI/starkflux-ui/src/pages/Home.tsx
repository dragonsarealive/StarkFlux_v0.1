import { Link } from 'react-router-dom';
import colors from '../utils/colors';

const Home = () => {
  // Reusable section title component
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 style={{ 
      fontSize: '2rem', 
      marginBottom: '1.5rem',
      color: colors.textPrimary,
      fontWeight: '700',
    }}>
      {children}
    </h2>
  );

  // Reusable button component
  const PrimaryButton = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link
      to={to}
      style={{
        background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
        color: colors.textPrimary,
        padding: '12px 24px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'inline-block',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 10px rgba(150, 21, 29, 0.2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 15px rgba(150, 21, 29, 0.35)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 10px rgba(150, 21, 29, 0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </Link>
  );

  // Reusable secondary button component
  const SecondaryButton = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link
      to={to}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        color: colors.textPrimary,
        padding: '12px 24px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'inline-block',
        transition: 'all 0.3s ease',
        border: `1px solid ${colors.glassBorder}`,
        marginLeft: '12px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
        e.currentTarget.style.borderColor = colors.glassBorder;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.25)';
      }}
    >
      {children}
    </Link>
  );

  // Step card component
  const StepCard = ({ number, title, description }: { number: number, title: string, description: string }) => (
    <div style={{
      backgroundColor: colors.bgSecondary,
      padding: '24px',
      borderRadius: '12px',
      position: 'relative',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      border: `1px solid ${colors.glassBorder}`,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.borderColor = colors.glassBorder;
    }}
    >
      <div style={{
        position: 'absolute',
        top: '-15px',
        left: '24px',
        background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
        color: colors.textPrimary,
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}>
        {number}
      </div>
      <h3 style={{ 
        marginTop: '15px', 
        marginBottom: '10px',
        color: colors.textPrimary,
      }}>
        {title}
      </h3>
      <p style={{ 
        color: colors.textSecondary,
        lineHeight: '1.6',
        margin: 0,
      }}>
        {description}
      </p>
    </div>
  );

  // Feature card component
  const FeatureCard = ({ title, description }: { title: string, description: string }) => (
    <div style={{
      backgroundColor: colors.bgSecondary,
      padding: '24px',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    }}
    >
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '10px',
        color: colors.textPrimary,
      }}>
        {title}
      </h3>
      <p style={{ 
        color: colors.textSecondary,
        lineHeight: '1.6',
        margin: 0,
      }}>
        {description}
      </p>
    </div>
  );

  // PoweredBy Item component
  const PoweredByItem = ({ text }: { text: string }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
    }}>
      <div style={{
        width: '6px',
        height: '6px',
        backgroundColor: colors.primary,
        borderRadius: '50%',
        marginRight: '10px',
      }}></div>
      <span style={{ color: colors.textSecondary }}>{text}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Hero Section */}
      <div style={{ 
        marginBottom: '80px',
        padding: '60px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(216, 31, 42, 0.05) 0%, rgba(216, 31, 42, 0) 70%)`,
          zIndex: 0,
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(216, 31, 42, 0.05) 0%, rgba(216, 31, 42, 0) 70%)`,
          zIndex: 0,
        }}></div>
        
        {/* Abstract Stag Logo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          zIndex: 0,
          opacity: 0.02,
        }}>
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L8 5L7 9L5 12L7 15L8 19L12 22L16 19L17 15L19 12L17 9L16 5L12 2Z" 
              fill="#D81F2A" 
              stroke="none"/>
            <path d="M12 7L10 9L9 12L10 15L12 17L14 15L15 12L14 9L12 7Z" 
              fill="#131B28" 
              stroke="none"/>
            <path d="M12 2L9 4M12 2L15 4M8 5L6 8M16 5L18 8M7 9L4 11M17 9L20 11M5 12L4 14M19 12L20 14M7 15L6 17M17 15L18 17M8 19L9 21M16 19L15 21M12 22L10 20M12 22L14 20" 
              stroke="#D81F2A" 
              strokeWidth="0.5"/>
          </svg>
        </div>
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '4rem', 
            marginBottom: '1.5rem',
            background: `linear-gradient(135deg, #FFFFFF 0%, #CBD5E0 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800',
            letterSpacing: '0.5px',
            lineHeight: '1.2',
            textShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          }}>
            Launch your dev toolkit.<br/>
            <span style={{ 
              background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800',
            }}>
              Sell once or earn forever.
            </span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2.5rem',
            maxWidth: '800px',
            margin: '0 auto 2.5rem',
            color: colors.textSecondary,
            lineHeight: '1.6',
          }}>
            StarkFlux is the decentralized component marketplace for StarkNet developers. 
            Upload reusable tools, set your access model, and start earning — no middlemen, no gatekeepers.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <PrimaryButton to="/library">Browse Components</PrimaryButton>
            <SecondaryButton to="/upload">Upload Your First Component</SecondaryButton>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{ marginBottom: '80px' }}>
        <SectionTitle>How It Works</SectionTitle>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '40px',
        }}>
          <StepCard 
            number={1} 
            title="Upload Components" 
            description="Upload smart contracts, SDKs, scripts, or dev utilities. You choose what to share: GitHub URLs, IPFS files, or both."
          />
          <StepCard 
            number={2} 
            title="Set Access & Pricing" 
            description="Offer your components as free, paid, or subscription-accessible — all enforced trustlessly via smart contracts."
          />
          <StepCard 
            number={3} 
            title="Start Earning On-Chain" 
            description="Every purchase or subscription goes directly to your wallet. No delays. No lockups. No centralized cut."
          />
        </div>
        <p style={{ 
          color: colors.textSecondary,
          fontStyle: 'italic',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          Developer earnings: Up to 80% on direct purchases, plus passive income from subscriptions.
        </p>
      </div>

      {/* Why StarkFlux Section */}
      <div style={{ marginBottom: '80px' }}>
        <SectionTitle>Why StarkFlux</SectionTitle>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          <FeatureCard 
            title="Earn from Your Code, Not Just Your Time" 
            description="Turn libraries, utilities, and smart contracts into ongoing revenue."
          />
          <FeatureCard 
            title="Multiple Monetization Models" 
            description="Sell once, offer developer subscriptions, or join the global marketplace reward pool."
          />
          <FeatureCard 
            title="Powered by StarkNet and IPFS" 
            description="Fully decentralized — every listing, price, and permission is enforced on-chain."
          />
          <FeatureCard 
            title="Transparent and Composable" 
            description="Build your own developer reputation. Your components, your terms, your storefront."
          />
        </div>
      </div>

      {/* Marketplace Browse Section */}
      <div style={{ 
        marginBottom: '80px',
        textAlign: 'center',
        backgroundColor: colors.bgSecondary,
        padding: '40px',
        borderRadius: '12px',
      }}>
        <SectionTitle>Browse the Marketplace</SectionTitle>
        <p style={{ 
          color: colors.textSecondary,
          marginBottom: '30px',
          maxWidth: '800px',
          margin: '0 auto 30px',
        }}>
          Discover developer tools built by the StarkNet community.
        </p>
        <div style={{ marginBottom: '20px' }}>
          <PrimaryButton to="/library">Browse All Components</PrimaryButton>
        </div>
        <p style={{ 
          color: colors.textSecondary,
          fontSize: '0.9rem',
          marginTop: '20px',
        }}>
          You can search by keyword, tag, or developer reputation. Every listing is verified on-chain.
        </p>
      </div>

      {/* For Developers Section */}
      <div style={{ 
        marginBottom: '80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '40px',
        alignItems: 'center',
      }}>
        <div>
          <SectionTitle>For Developers: Start Selling in Minutes</SectionTitle>
          <ol style={{ 
            color: colors.textSecondary,
            paddingLeft: '20px',
            marginBottom: '30px',
          }}>
            <li style={{ marginBottom: '10px' }}>Connect your wallet</li>
            <li style={{ marginBottom: '10px' }}>Upload a component reference (IPFS or GitHub)</li>
            <li style={{ marginBottom: '10px' }}>Choose access settings and pricing</li>
            <li style={{ marginBottom: '10px' }}>Publish to the marketplace</li>
          </ol>
          <p style={{ 
            color: colors.textSecondary,
            marginBottom: '30px',
            fontWeight: 'bold',
          }}>
            No approvals. No lock-in. Just deploy and get paid.
          </p>
          <div>
            <PrimaryButton to="/upload">Upload a Component</PrimaryButton>
            <SecondaryButton to="/library">Browse Components</SecondaryButton>
          </div>
        </div>
        <div style={{ 
          backgroundColor: colors.bgSecondary,
          padding: '30px',
          borderRadius: '12px',
        }}>
          <h3 style={{ 
            marginTop: 0,
            marginBottom: '20px',
            color: colors.textPrimary,
          }}>
            Powered By
          </h3>
          <PoweredByItem text="StarkNet smart contracts" />
          <PoweredByItem text="Pragma oracles (live USD/STRK pricing)" />
          <PoweredByItem text="IPFS for decentralized file storage" />
          <PoweredByItem text="Non-custodial wallets like ArgentX and Braavos" />
        </div>
      </div>

      {/* Final CTA Section */}
      <div style={{ 
        textAlign: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.05)',
        padding: '60px 40px',
        borderRadius: '12px',
        marginBottom: '40px',
      }}>
        <h2 style={{ 
          fontSize: '2.5rem',
          marginBottom: '1rem',
          color: colors.textPrimary,
        }}>
          Ready to launch your toolkit?
        </h2>
        <p style={{ 
          color: colors.textSecondary,
          marginBottom: '30px',
          fontSize: '1.2rem',
        }}>
          Start building your developer storefront today.
        </p>
        <div>
          <PrimaryButton to="/register">Connect Wallet</PrimaryButton>
          <SecondaryButton to="/upload">Upload Component</SecondaryButton>
        </div>
      </div>
    </div>
  )
}

export default Home 