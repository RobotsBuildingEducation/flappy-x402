# 🚀 Quick Start Guide

## Step 1: Create your .env files

### Server .env (`flappy-x402/server/.env`)
```bash
cd flappy-x402/server
cat > .env << EOF
FACILITATOR_URL=https://x402.org/facilitator
NETWORK=base-sepolia
ADDRESS=0xYOUR_WALLET_ADDRESS_HERE
PORT=3001
GAME_PRICE=0.001
SESSION_DURATION_MINUTES=10
EOF
```

### Client .env (`flappy-x402/client/.env`)
```bash
cd ../client
cat > .env << EOF
VITE_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
VITE_API_BASE_URL=http://localhost:3001
EOF
```

## Step 2: Replace placeholders

1. Replace `0xYOUR_WALLET_ADDRESS_HERE` with your wallet address (40 hex chars after 0x)
2. Replace `0xYOUR_PRIVATE_KEY_HERE` with your private key (64 hex chars after 0x)

## Step 3: Start the server

```bash
# Terminal 1
cd flappy-x402/server
npm install
npm run dev
```

You should see:
```
🎮 Flappy x402 Server starting on port 3001
💰 Accepting payments to: 0x...
🔗 Network: base-sepolia
💵 Game price: $0.001 USDC
```

## Step 4: Start the client

```bash
# Terminal 2
cd flappy-x402/client
npm install
npm run dev
```

## Step 5: Play!

1. Open http://localhost:5173 in your browser
2. Click "Play Game"
3. Approve the $0.001 USDC transaction
4. Start playing!
5. Optionally, click "Deposit $1" to preload 1000 credits

## Troubleshooting

### "No private key found" warning
- Make sure your private key starts with `0x`
- Check that the .env file is in the correct directory

### "Please set your wallet ADDRESS" error
- Update the ADDRESS in server/.env with your actual wallet address

### Payment fails
- Ensure you have Base Sepolia ETH for gas
- Ensure you have Base Sepolia USDC for payments
- Check that your private key matches the wallet with funds

### Can't connect to server
- Make sure the server is running on port 3001
- Check that VITE_API_BASE_URL is correct in client/.env 