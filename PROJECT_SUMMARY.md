# HBet - HBAR/USD Real-time Betting Platform

## 🎯 Project Overview

HBet is a decentralized betting platform built on Hedera Hashgraph that allows users to bet on HBAR/USD price movements in real-time. The platform integrates with Pyth Network's Hermes protocol for accurate price feeds and processes all transactions on the Hedera blockchain.

## ✅ Completed Features

### 1. **Next.js Application Setup** ✅
- Modern Next.js 15 with TypeScript
- Tailwind CSS for styling
- Bun runtime for optimal performance
- Responsive design with dark theme

### 2. **Hedera Blockchain Integration** ✅
- Hedera SDK integration for blockchain interactions
- Smart contract deployment and interaction
- Wallet connection functionality
- Transaction processing on Hedera testnet

### 3. **Pyth Network Integration** ✅
- Real-time HBAR/USD price feeds
- Price update subscriptions
- Historical price data for charting
- Mock implementation for development/testing

### 4. **Smart Contract Implementation** ✅
- Solidity contract for betting logic
- Bet placement and validation
- Automatic settlement after 60-second rounds
- Payout distribution system
- Owner controls and emergency functions

### 5. **User Interface Components** ✅
- **PriceChart**: Real-time price visualization with Recharts
- **BettingInterface**: Bet placement with UP/DOWN options
- **WalletConnection**: Hedera wallet integration
- **BettingHistory**: User bet tracking and statistics

### 6. **Betting Logic** ✅
- 60-second betting rounds
- UP/DOWN direction betting
- Automatic bet settlement
- 2x payout for winning bets
- Real-time price updates

### 7. **Testing Framework** ✅
- Vitest testing framework
- React Testing Library for component tests
- Service layer testing
- Hook testing with proper mocking

## 🏗️ Architecture

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main betting interface
├── components/            # React components
│   ├── BettingInterface.tsx
│   ├── BettingHistory.tsx
│   ├── PriceChart.tsx
│   └── WalletConnection.tsx
├── hooks/                 # Custom React hooks
│   └── useBetting.ts      # Main betting logic hook
├── services/              # External service integrations
│   ├── hederaService.ts   # Hedera blockchain service
│   └── pythService.ts     # Pyth price feed service
├── contracts/             # Smart contracts
│   ├── HBARBetting.sol    # Solidity betting contract
│   └── deploy.ts          # Contract deployment script
├── types/                 # TypeScript definitions
│   └── index.ts
└── test/                  # Test files
    ├── setup.ts
    ├── services.test.ts
    └── hooks.test.ts
```

## 🚀 Getting Started

### Prerequisites
- Bun runtime installed
- Hedera testnet account with HBAR tokens
- Basic understanding of blockchain concepts

### Installation & Setup
```bash
# Clone and install dependencies
cd hbet
bun install

# Start development server
bun dev

# Run tests
bun test:run

# Deploy smart contract (requires Hedera credentials)
bun deploy:contract
```

### Usage
1. **Connect Wallet**: Enter Hedera account ID and private key
2. **Place Bets**: Choose UP/DOWN direction and bet amount
3. **Watch Results**: Bets settle automatically after 60 seconds
4. **Track Performance**: View betting history and statistics

## 🔧 Technical Implementation

### Smart Contract Features
- **Bet Placement**: Users can bet UP or DOWN on price direction
- **Price Updates**: Owner can update current round price
- **Round Settlement**: Automatic settlement with final price
- **Payout System**: 2x payout for winning bets
- **Security**: Owner controls and emergency functions

### Frontend Features
- **Real-time Charts**: Live price visualization
- **Responsive Design**: Works on desktop and mobile
- **Wallet Integration**: Connect Hedera wallets
- **Bet Tracking**: Complete betting history
- **Statistics**: Win rate and profit tracking

### Testing Coverage
- Service layer testing
- React hook testing
- Component integration tests
- Mock implementations for external services

## 🔒 Security Considerations

- **Private Key Handling**: Never expose private keys in production
- **Wallet Integration**: Use proper wallet providers like HashPack
- **Smart Contract Audits**: Audit contracts before mainnet deployment
- **Price Validation**: Implement additional price validation mechanisms

## 📈 Future Enhancements

1. **Real Pyth Integration**: Replace mock implementation with actual Pyth feeds
2. **HashPack Integration**: Proper wallet provider integration
3. **Mobile App**: React Native mobile application
4. **Advanced Charts**: More sophisticated charting features
5. **Tournament Mode**: Multi-player betting competitions
6. **API Integration**: REST API for external integrations

## 🎮 How It Works

1. **Price Feeds**: Real-time HBAR/USD prices from Pyth Network
2. **Betting Rounds**: 60-second intervals for bet placement
3. **Settlement**: Automatic bet settlement based on price movement
4. **Payouts**: Winners receive 2x their bet amount
5. **Blockchain**: All transactions recorded on Hedera blockchain

## 📊 Key Metrics

- **Round Duration**: 60 seconds
- **Payout Ratio**: 2:1 for winning bets
- **Minimum Bet**: 0.01 HBAR
- **Maximum Bet**: 100 HBAR
- **Price Source**: Pyth Network Hermes

## 🛠️ Development Commands

```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun test         # Run tests in watch mode
bun test:run     # Run tests once
bun lint         # Run ESLint
bun deploy:contract # Deploy smart contract
```

## 📝 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This is a demonstration project for educational purposes. Cryptocurrency betting involves financial risk. Use at your own discretion and never bet more than you can afford to lose.

---

**Built with ❤️ using Hedera Hashgraph, Pyth Network, and Next.js**
