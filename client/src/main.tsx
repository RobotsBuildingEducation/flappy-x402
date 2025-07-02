import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { WalletProvider } from './contexts/WalletContext.tsx'
import { PatreonProvider } from './contexts/PatreonContext.tsx'
import './index.css'

// Show setup instructions in console
console.log(`
🕹️ Flappy x402 - Blockchain Arcade
==================================

To play this game, you need:

1. Start the server:
   cd flappy-x402/server
   npm install
   npm run dev

2. Create .env files:

   Server .env (flappy-x402/server/.env):
   FACILITATOR_URL=https://x402.org/facilitator
   NETWORK=base-sepolia
   ADDRESS=0xYOUR_WALLET_ADDRESS
   PORT=3001

   Client .env (flappy-x402/client/.env):
   VITE_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   VITE_API_BASE_URL=http://localhost:3001

3. Get Base Sepolia ETH and USDC from faucets

4. Refresh this page

Game Rules:
- One coin ($0.001 USDC) = One game
- Play until you crash
- Insert another coin to play again

Need help? Check the README.md
`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider>
      <PatreonProvider>
        <App />
      </PatreonProvider>
    </WalletProvider>
  </StrictMode>,
)
