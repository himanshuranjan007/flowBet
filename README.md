# HBet - HBAR/USD Real-time Betting Platform

A decentralized betting platform built on Hedera Hashgraph that allows users to bet on HBAR/USD price movements in real-time using Pyth Network data.

## Features

- 🎯 **Real-time Price Feeds**: Live HBAR/USD price data from Pyth Hermes
- ⏱️ **60-Second Rounds**: Quick betting rounds with automatic settlement
- 🔗 **Hedera Integration**: All transactions processed on Hedera blockchain
- 💰 **Smart Contract Betting**: Transparent, on-chain betting logic
- 📊 **Live Charts**: Real-time price visualization with Recharts
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Blockchain**: Hedera Hashgraph SDK
- **Price Data**: Pyth Network Hermes
- **Runtime**: Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Hedera testnet account with HBAR tokens
- Basic understanding of Hedera blockchain

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hbet
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Connecting Your Wallet

1. Click "Connect Wallet" on the main page
2. Enter your Hedera account ID (e.g., `0.0.123456`)
3. Enter your private key
4. Click "Connect"

**Note**: This is a demonstration implementation. In production, integrate with proper wallet providers like HashPack.

### Placing Bets

1. Ensure your wallet is connected and has HBAR balance
2. Wait for a new betting round to start (60-second intervals)
3. Choose UP or DOWN direction
4. Enter your bet amount in HBAR
5. Click "Place Bet"

### How Betting Works

- **Rounds**: Each betting round lasts exactly 60 seconds
- **Settlement**: Bets are automatically settled at the end of each round
- **Payout**: Winning bets receive 2x the bet amount
- **Price Source**: All prices come from Pyth Network Hermes

## Smart Contract

The betting logic is implemented in a Hedera smart contract that handles:

- Bet placement and validation
- Price updates from Pyth Network
- Automatic bet settlement
- Payout distribution

### Contract Functions

- `placeBet(bool direction)`: Place a bet (true = UP, false = DOWN)
- `updatePrice(uint256 price)`: Update current round price
- `settleRound(uint256 endPrice)`: Settle the current round
- `getBet(uint256 betId)`: Retrieve bet information

## Architecture

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── BettingInterface.tsx
│   ├── BettingHistory.tsx
│   ├── PriceChart.tsx
│   └── WalletConnection.tsx
├── hooks/               # Custom React hooks
│   └── useBetting.ts
├── services/            # External service integrations
│   ├── hederaService.ts
│   └── pythService.ts
├── types/               # TypeScript type definitions
│   └── index.ts
└── lib/                 # Utility functions
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=your_account_id
HEDERA_PRIVATE_KEY=your_private_key

# Pyth Configuration
PYTH_HERMES_ENDPOINT=https://hermes.pyth.network/v2/updates
```

### Hedera Testnet Setup

1. Create a Hedera testnet account at [portal.hedera.com](https://portal.hedera.com)
2. Get testnet HBAR from the faucet
3. Note your account ID and private key

## Development

### Running Tests

```bash
bun test
```

### Building for Production

```bash
bun build
```

### Linting

```bash
bun lint
```

## Security Considerations

- **Private Keys**: Never expose private keys in production
- **Wallet Integration**: Use proper wallet providers like HashPack
- **Price Validation**: Implement additional price validation mechanisms
- **Smart Contract Audits**: Audit smart contracts before mainnet deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This is a demonstration project for educational purposes. Cryptocurrency betting involves financial risk. Use at your own discretion and never bet more than you can afford to lose.

## Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Hedera Hashgraph and Pyth Network**