# StarkFlux - StarkNet Developer Components Marketplace

StarkFlux is a decentralized marketplace for StarkNet developer components, enabling developers to monetize their code components while providing the community with reusable, high-quality building blocks.

## 🚀 Features

- **Component Marketplace**: Browse, purchase, and download developer components
- **Multiple Monetization Models**: 
  - Direct purchase (one-time payment)
  - Developer subscriptions (subscribe to specific developers)
  - Marketplace subscriptions (access to all components)
  - Free components
- **Encrypted Storage**: Components are encrypted and stored on IPFS via Pinata
- **Smart Contract Architecture**: Fully decentralized on StarkNet
- **Modern UI**: React-based interface with real-time blockchain integration

## 📁 Project Structure

```
StarkFlux_v0.1/
├── UI/                                    # Frontend application
│   ├── StarkFlux_UI_Development_Guide.md  # UI development documentation
│   └── starkflux-ui/                     # React + TypeScript UI
├── packages/                             # Smart contracts
│   ├── common/                          # Shared interfaces and types
│   ├── component_registry/              # Main marketplace contract
│   ├── dev_subscription/                # Developer subscription system
│   ├── identity_registry/               # Developer identity management
│   └── marketplace_subscription/        # Global subscription system
├── src/                                 # (Additional source files)
├── .env.example                         # Environment variables example
├── .gitignore                          # Git ignore rules
├── CHANGELOG.md                        # Project changelog
├── CONTRIBUTING.md                     # Contribution guidelines
├── DEPLOYMENT.md                       # Deployment instructions
├── LICENSE                             # Source Available License
├── README.md                           # Project documentation
├── Scarb.lock                          # Cairo dependencies lock
├── Scarb.toml                          # Cairo project config
├── package.json                        # Node.js project config
└── package-lock.json                   # Node.js dependencies lock
```

## 🛠️ Technology Stack

- **Smart Contracts**: Cairo 1.0
- **Frontend**: React, TypeScript, Vite
- **UI Library**: Chakra UI
- **Blockchain Integration**: starknet.js, starknet-react
- **Storage**: IPFS (Pinata)
- **Network**: StarkNet Sepolia Testnet

## 🚦 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Rust and Scarb (for smart contract development)
- Git

### Installation

1. Clone the repository:
```bash
git clone hhttps://github.com/dragonsarealive/StarkFlux_v0.1.git
cd starkflux
```

2. Install UI dependencies:
```bash
cd UI/starkflux-ui
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm run dev
```

### Smart Contract Development

1. Navigate to the packages directory:
```bash
cd packages
```

2. Build contracts:
```bash
scarb build
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in `UI/starkflux-ui/` with:

```env
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_STARKNET_ALCHEMY_KEY=your_alchemy_api_key
```

### Contract Addresses (Sepolia Testnet)

The contracts are deployed on Sepolia testnet. See `UI/starkflux-ui/src/abis/contracts.ts` for addresses.

## 📖 Documentation

- [UI Development Guide](UI/StarkFlux_UI_Development_Guide.md)
- [Smart Contract Architecture](memory-bank/systemPatterns.md)
- [Technical Context](memory-bank/techContext.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is under the **StarkFlux Source Available License v1.0** - see the [LICENSE](LICENSE) file for details.

**Important**: This is NOT an open source license. The code is source-available for:
- 🎓 Educational purposes
- 🔬 Evaluation and testing
- 🏆 Hackathon judging
- 💡 Personal projects

**Commercial use requires a separate license**. Contact us for commercial licensing options.

## 💼 Commercial Licensing

Interested in using StarkFlux for your business? We offer flexible commercial licensing options. Please contact andres.cano@reapstudios.com for more information.

## ⚠️ Security

- Never commit private keys or sensitive data
- Always use environment variables for secrets
- Report security vulnerabilities to [security@starkflux.com]

## 🌟 Acknowledgments

- StarkNet community
- Pragma Oracle for price feeds
- Pinata for IPFS infrastructure

---

**Note**: This project is currently on testnet. Do not use real funds. 
