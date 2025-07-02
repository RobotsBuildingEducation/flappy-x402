# 🕹️ Flappy x402 - Blockchain Arcade

A retro arcade game demonstrating Coinbase's x402 payment standard. Experience the nostalgia of inserting coins at the arcade, reimagined with USDC micropayments on Base Sepolia.

![x402 Payments](https://img.shields.io/badge/x402-Payments-blue)
![Base Sepolia](https://img.shields.io/badge/Base-Sepolia-green)
![USDC](https://img.shields.io/badge/USDC-Payments-orange)

## 🎮 Overview

Flappy x402 recreates the classic arcade experience where you "insert coins" to play - except now you're using blockchain technology! Each game costs $0.001 USDC, just like the quarter-munching arcade machines of the past.

## ✨ Features

- 🕹️ **Authentic Arcade Experience**: Complete with pixel art, CRT effects, and retro design
- 🪙 **One Coin = One Game**: Pay $0.001 USDC per game, just like classic arcades
- 💰 **Deposit Mode**: Prepay $1.00 to receive 1000 game credits
- 🔐 **x402 Payment Integration**: Seamless blockchain payments
- ⚡ **Instant Verification**: Start playing immediately after payment
- 🎯 **Pure Gameplay**: Play until you crash, then insert another coin
- 🏆 **Score Tracking**: Compete for the high score

## 🏗️ Architecture

```
flappy-x402/
├── client/          # React frontend with retro arcade UI
├── server/          # Hono backend with x402 middleware
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites

1. Node.js v20+ and npm
2. A wallet with:
   - ETH on Base Sepolia for gas fees
   - USDC on Base Sepolia for game payments
3. Private key for demo (use wallet connector in production)

### Setup Instructions

1. **Clone and navigate to the project:**
```bash
cd game-test/flappy-x402
```

2. **Set up the server:**
```bash
cd server
npm install

# Create .env file with:
# FACILITATOR_URL=https://x402.org/facilitator
# NETWORK=base-sepolia
# ADDRESS=0xYOUR_WALLET_ADDRESS
# PORT=3001
# PATREON_CLIENT_ID=your_patreon_client_id
# PATREON_CLIENT_SECRET=your_patreon_client_secret
# PATREON_REDIRECT_URI=http://localhost:3001/api/auth/patreon/callback

npm run dev
```

3. **Set up the client:**
```bash
cd ../client
npm install

# Create .env file with:
# VITE_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
# VITE_API_BASE_URL=http://localhost:3001

npm run dev
```

4. **Play the game:**
   - Open http://localhost:5173
   - (Optional) Click "LOGIN WITH PATREON" to fetch your profile
   - Click "INSERT COIN" to pay $0.001 USDC
   - Or click "DEPOSIT $1" to load 1000 credits
   - Press SPACE or click to fly!
   - When you crash, insert another coin to play again

## 🎨 Game Flow

Just like classic arcade games:
1. **INSERT COIN** - Pay $0.001 USDC
2. **PLAY** - Avoid the pipes as long as you can
3. **GAME OVER** - Your game ends when you hit a pipe
4. **REPEAT** - Insert another coin to play again

No timers, no sessions - just pure arcade gameplay!

## 💰 How x402 Works

1. **Insert Coin**: Click the coin slot button
2. **Deposit**: Optionally deposit $1 for 1000 credits
3. **Payment Request**: Server returns x402 payment requirements
4. **Sign Transaction**: Approve $0.001 USDC transfer
5. **Verification**: Server verifies with x402 facilitator
6. **Game On**: Play until game over!

## 🔧 Technical Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS with custom arcade components
- x402-axios for payment handling
- HTML5 Canvas with pixel art rendering

### Backend
- Hono server with x402 middleware
- One payment = one game logic
- CORS support for payment headers
- In-memory session tracking

## 🔐 Security Notes

⚠️ **Important**: This demo uses private keys directly for simplicity. In production:
- Use wallet connectors (MetaMask, WalletConnect, etc.)
- Never expose private keys in client code
- Implement proper authentication
- Use secure session management

## 🌐 Resources

- [x402 GitHub Repository](https://github.com/coinbase/x402)
- [Base Documentation](https://docs.base.org/)
- [Base Sepolia Faucet](https://docs.base.org/tools/network-faucets/)

## 🚧 Future Enhancements

- [ ] Wallet connector integration
- [ ] Persistent leaderboard
- [ ] Different game modes (easy/hard)
- [ ] Multiplayer tournaments
- [ ] Achievement NFTs
- [ ] Sound effects and 8-bit music

## 📜 License

MIT - Feel free to use this demo as inspiration for your own blockchain arcade games!

---

*Remember: In the blockchain arcade, every coin counts!* 🕹️✨ 