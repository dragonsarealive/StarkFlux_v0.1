# Contributing to StarkFlux

Thank you for your interest in contributing to StarkFlux! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

- Check if the issue already exists
- Provide a clear description of the problem
- Include steps to reproduce
- Add relevant logs or screenshots

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass
6. Submit a pull request

### Development Setup

1. Clone your fork:
```bash
git clone https://github.com/yourusername/starkflux.git
```

2. Install dependencies:
```bash
# For UI
cd UI/starkflux-ui
npm install

# For smart contracts
cd packages
scarb build
```

### Code Style

- Follow existing code patterns
- Use TypeScript for UI code
- Follow Cairo best practices for smart contracts
- Add comments for complex logic

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, etc.)
- Reference issues when applicable

### Testing

- Write tests for new features
- Ensure existing tests pass
- Test on Sepolia testnet before submitting

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help maintain a positive community

## Questions?

Feel free to open an issue for any questions about contributing. 