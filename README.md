# StarkFlux - Component Marketplace for Starknet

StarkFlux is a decentralized marketplace for developer components on Starknet, enabling developers to monetize their code through multiple revenue models.

## 🚀 Features

- **Component Registry**: Upload and manage reusable code components
- **Multiple Monetization Models**:
  - Direct purchase (one-time payment)
  - Marketplace subscription (global access pool)
  - Developer subscription (access to all developer's content)
- **IPFS Integration**: Decentralized storage for component metadata
- **Smart Contract Architecture**: Fully on-chain marketplace logic
- **Modern UI**: React-based interface with wallet integration

## 🏗️ Architecture

### Smart Contracts (Cairo)
- `ComponentRegistry`: Core registry for component management
- `MarketplaceSubscription`: Global subscription system
- `DeveloperSubscription`: Developer-specific subscriptions
- `LiquidityPool`: Revenue sharing and liquidity management

### Frontend (React + TypeScript)
- Chakra UI for component library
- Starknet.js for blockchain interaction
- IPFS integration for metadata storage
- Responsive design with dark mode support

## 🛠️ Tech Stack

- **Smart Contracts**: Cairo 2.0
- **Frontend**: React, TypeScript, Vite
- **UI Library**: Chakra UI
- **Blockchain**: Starknet (Sepolia Testnet)
- **Storage**: IPFS (Pinata)
- **Build Tools**: Scarb, Node.js

## 📦 Installation

### Prerequisites
- Node.js 18+
- Scarb (Cairo package manager)
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/dragonsarealive/StarkFlux_v0.1.git
cd StarkFlux_v0.1
```

2. Install smart contract dependencies:
```bash
scarb build
```

3. Install UI dependencies:
```bash
cd UI/starkflux-ui
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## 🚀 Running Locally

### Start the UI Development Server
```bash
cd UI/starkflux-ui
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Smart Contract Addresses (Sepolia Testnet)

⚠️ **Warning: Testnet Only** - This is a development version deployed on Sepolia testnet.

See deployment documentation for current contract addresses.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines (coming soon).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Documentation](docs/) (coming soon)
- [Demo](https://starkflux.netlify.app) (testnet)
- [Discord](https://discord.gg/starkflux) (coming soon)

## ⚠️ Disclaimer

This is an alpha version deployed on testnet. Do not use in production or with real funds. 