# Flappy x402 Server

This server implements the backend for the Flappy Bird game with x402 payment integration on Base Sepolia.

## Setup

1. **Create a .env file** with your configuration:

```bash
# x402 Configuration
FACILITATOR_URL=https://x402.org/facilitator
NETWORK=base-sepolia
ADDRESS=0xYOUR_WALLET_ADDRESS_HERE  # Your wallet address to receive payments

# Server Configuration
PORT=3001

# Game Configuration (optional - defaults are set in code)
GAME_PRICE=0.001  # Price in USD per game
```

2. **Install dependencies:**

```bash
npm install
```

3. **Run the server:**

```bash
npm run dev
```

## API Endpoints

### Free Endpoints

- `GET /api/health` - Health check and configuration info
- `GET /api/game/session/:sessionId` - Validate a game session
- `POST /api/game/score` - Submit a game score (requires valid session)
- `GET /api/leaderboard` - Get the game leaderboard
- `GET /api/auth/patreon/login` - Redirect to Patreon for OAuth login
- `GET /api/auth/patreon/callback` - Handle OAuth callback and return user info

### Paid Endpoints (x402)

- `POST /api/game/session` - Create a new game session ($0.001 USDC per game)
- `POST /api/deposit` - Deposit $1.00 for 1000 credits
- `POST /api/game/session/credit` - Start a session using deposit credits

## How It Works

1. Client requests a new game session at `/api/game/session`
2. x402 middleware intercepts and returns payment requirements (402 status)
3. Client signs and submits payment transaction
4. Server verifies payment and creates a game session
5. Client plays one game with the session ID
6. Game ends when player crashes - need new payment to play again

## Payment Model

- **One Payment = One Game**
- No timers or session expiration
- Game ends when player hits a pipe
- New payment required for each game

## Environment Variables

- `FACILITATOR_URL` - x402 facilitator URL (default: https://x402.org/facilitator)
- `NETWORK` - Blockchain network (use `base-sepolia` for testing)
- `ADDRESS` - Your wallet address to receive game payments
- `PORT` - Server port (default: 3001)
- `GAME_PRICE` - Price per game in USD (default: 0.001)
- `PATREON_CLIENT_ID` - Patreon OAuth client ID
- `PATREON_CLIENT_SECRET` - Patreon OAuth client secret
- `PATREON_REDIRECT_URI` - OAuth redirect URI used for Patreon authentication
