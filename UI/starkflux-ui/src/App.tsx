import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Library from './pages/Library'
import UploadComponent from './pages/UploadComponent'
import DeveloperProfile from './pages/DeveloperProfile'
import colors from './utils/colors'
import WalletProvider from './components/wallet/WalletProvider'
import WalletErrorMessage from './components/wallet/WalletErrorMessage'
import StarknetConfigProvider from './components/StarknetConfigProvider'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from './utils/theme'
import Navbar from './components/Navbar'



function App() {
  return (
    <StarknetConfigProvider>
    <WalletProvider>
      <div style={{ 
        backgroundColor: colors.bgPrimary, 
        color: colors.textPrimary,
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.bgPrimary} 0%, #080A10 100%)`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Background pattern elements - subtle abstract shapes */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(150, 21, 29, 0.02) 0%, rgba(150, 21, 29, 0) 70%)`,
          zIndex: 0,
          opacity: 0.6,
          transform: 'translate(30%, -40%)'
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '1000px',
          height: '1000px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(150, 21, 29, 0.015) 0%, rgba(150, 21, 29, 0) 60%)`,
          zIndex: 0,
          opacity: 0.7,
          transform: 'translate(-20%, 40%)'
        }}></div>
        
        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(30, 44, 75, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30, 44, 75, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          zIndex: 0,
          opacity: 0.5
        }}></div>
        
        {/* Content container */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Header />
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 20px',
            flex: 1,
            width: '100%'
          }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/upload" element={<UploadComponent />} />
              <Route path="/register" element={<DeveloperProfile />} />
            </Routes>
          </div>
          <Footer />
        </div>
        
        {/* Add global styles */}
          <style>{`
            /* Pixel-perfect scrollbar styles */
            ::-webkit-scrollbar {
              width: 12px;
            }
            
            ::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 10px;
            }
            
            ::-webkit-scrollbar-thumb {
              background: rgba(150, 21, 29, 0.4);
              border-radius: 10px;
              border: 3px solid rgba(0, 0, 0, 0.1);
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(150, 21, 29, 0.6);
            }
            
            /* Global styles */
            body {
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              background-color: ${colors.bgPrimary};
              color: ${colors.textPrimary};
            }
            
            a {
              color: ${colors.primary};
              text-decoration: none;
            }
            
            a:hover {
              text-decoration: underline;
            }
          `}</style>
        
          {/* Error message for wallet connection issues */}
        <WalletErrorMessage />
      </div>
    </WalletProvider>
    </StarknetConfigProvider>
  )
}

export default App
