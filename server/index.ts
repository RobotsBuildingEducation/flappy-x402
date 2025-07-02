import { config } from "dotenv";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { paymentMiddleware, Network, Resource } from "x402-hono";
import { v4 as uuidv4 } from "uuid";
import crypto from "node:crypto";
import {
  getPatreonAuthUrl,
  getPatreonAccessToken,
  getPatreonUserInfo,
} from "./patreon";

config();

// Required environment variables:
// FACILITATOR_URL=https://x402.org/facilitator
// NETWORK=base-sepolia
// ADDRESS=0x_YOUR_WALLET_ADDRESS_HERE
// PORT=3001

const facilitatorUrl =
  (process.env.FACILITATOR_URL as Resource) || "https://x402.org/facilitator";
const payTo = process.env.ADDRESS as `0x${string}`;
const network = (process.env.NETWORK as Network) || "base-sepolia";
const port = parseInt(process.env.PORT || "3001");
const gamePrice = process.env.GAME_PRICE || "0.001";
const patreonClientId = process.env.PATREON_CLIENT_ID || "";
const patreonClientSecret = process.env.PATREON_CLIENT_SECRET || "";
const patreonRedirectUri = process.env.PATREON_REDIRECT_URI || "";

if (!payTo || payTo === "0x_YOUR_WALLET_ADDRESS_HERE") {
  console.error("Please set your wallet ADDRESS in the .env file");
  console.error("Create a .env file with:");
  console.error("FACILITATOR_URL=https://x402.org/facilitator");
  console.error("NETWORK=base-sepolia");
  console.error("ADDRESS=0xYourWalletAddress");
  console.error("PORT=3001");
  process.exit(1);
}

const app = new Hono();

// Enable CORS for frontend
app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Store active game sessions in memory (in production, use Redis or a database)
const gameSessions = new Map<
  string,
  {
    sessionId: string;
    createdAt: Date;
    used: boolean;
    paymentId?: string;
    continueScore?: number; // Add score for continued games
  }
>();

// Store deposit credits
const deposits = new Map<
  string,
  {
    depositId: string;
    credits: number;
    paymentId?: string;
  }
>();

// Configure x402 payment middleware
app.use(
  paymentMiddleware(
    payTo,
    {
      "/api/game/session": {
        price: `$${gamePrice}`,
        network,
      },
      "/api/game/continue": {
        price: "$1.00", // Pay to win price!
        network,
      },
      "/api/deposit": {
        price: "$1.00",
        network,
      },
    },
    {
      url: facilitatorUrl,
    }
  )
);

// Patreon OAuth endpoints
app.get("/api/auth/patreon/login", (c) => {
  const state = crypto.randomUUID();
  const authUrl = getPatreonAuthUrl(state);
  return c.redirect(authUrl);
});

app.get("/api/auth/patreon/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.text("Missing code", 400);
  }

  try {
    const tokenData = await getPatreonAccessToken(code);
    const user = await getPatreonUserInfo(tokenData.access_token);

    const html = `<!DOCTYPE html><html><body><script>
      window.opener?.postMessage({
        type: 'patreon-auth',
        token: ${JSON.stringify(tokenData)},
        user: ${JSON.stringify(user)}
      }, '*');
      window.close();
    </script></body></html>`;
    return c.html(html);
  } catch (err) {
    console.error("Patreon OAuth failed", err);
    return c.text("OAuth error", 500);
  }
});

// Health check endpoint (free)
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    payTo,
    network,
    gamePrice: `$${gamePrice}`,
  });
});

// Test endpoint (free) - for debugging
app.get("/api/test", (c) => {
  return c.json({
    message: "Server is working!",
    timestamp: new Date().toISOString(),
    headers: c.req.header(),
  });
});

// Deposit credits (requires $1 payment)
app.post("/api/deposit", (c) => {
  const depositId = uuidv4();

  const deposit = {
    depositId,
    credits: 1000, // $1.00 worth of games at $0.001 each
    paymentId: c.req.header("x-payment-id"),
  };

  deposits.set(depositId, deposit);

  return c.json({ depositId, credits: deposit.credits });
});

// Get deposit status
app.get("/api/deposit/:depositId", (c) => {
  const depositId = c.req.param("depositId");
  const deposit = deposits.get(depositId);

  if (!deposit) {
    return c.json({ error: "Deposit not found" }, 404);
  }

  return c.json({ depositId, credits: deposit.credits });
});

// Create a new game session (requires payment)
app.post("/api/game/session", (c) => {
  const sessionId = uuidv4();
  const now = new Date();

  const session = {
    sessionId,
    createdAt: now,
    used: false,
    paymentId: c.req.header("x-payment-id"),
  };

  gameSessions.set(sessionId, session);

  return c.json({
    sessionId,
    message: "Payment accepted! Press SPACE to start your game.",
  });
});

// Create a new game session using deposit credits
app.post("/api/game/session/credit", async (c) => {
  const body = await c.req.json();
  const { depositId } = body;

  const deposit = deposits.get(depositId);
  if (!deposit || deposit.credits <= 0) {
    return c.json({ error: "No credits available" }, 400);
  }

  deposit.credits -= 1;

  const sessionId = uuidv4();
  const now = new Date();

  const session = {
    sessionId,
    createdAt: now,
    used: false,
  };

  gameSessions.set(sessionId, session);

  return c.json({ sessionId, creditsRemaining: deposit.credits });
});

// Validate a game session (free)
app.get("/api/game/session/:sessionId", (c) => {
  const sessionId = c.req.param("sessionId");
  const session = gameSessions.get(sessionId);

  if (!session) {
    return c.json({ valid: false, message: "Session not found" }, 404);
  }

  if (session.used) {
    return c.json({ valid: false, message: "Game already played" }, 410);
  }

  return c.json({
    valid: true,
    sessionId: session.sessionId,
    used: session.used,
  });
});

// Pay to continue endpoint (requires $1 payment) - The ultimate pay-to-win joke!
app.post("/api/game/continue", async (c) => {
  const body = await c.req.json();
  const { score } = body;

  if (typeof score !== "number" || score < 0) {
    return c.json({ error: "Invalid score" }, 400);
  }

  const sessionId = uuidv4();
  const now = new Date();

  const session = {
    sessionId,
    createdAt: now,
    used: false,
    paymentId: c.req.header("x-payment-id"),
    continueScore: score, // Store the score they're continuing with
  };

  gameSessions.set(sessionId, session);

  return c.json({
    sessionId,
    message: "Pay to win activated! Your score has been restored. 🎉",
    continueScore: score,
  });
});

// Submit game score (free, but requires valid session)
app.post("/api/game/score", async (c) => {
  const body = await c.req.json();
  const { sessionId, score } = body;

  const session = gameSessions.get(sessionId);
  if (!session) {
    return c.json({ error: "Invalid session" }, 401);
  }

  if (session.used) {
    return c.json({ error: "Game already completed" }, 401);
  }

  // Mark session as used
  session.used = true;

  // In a real app, you'd store scores in a database
  console.log(`Score submitted: ${score} for session ${sessionId}`);

  return c.json({
    success: true,
    score,
    message: "Game over! Insert coin to play again.",
  });
});

// Get leaderboard (free)
app.get("/api/leaderboard", (c) => {
  // In a real app, fetch from database
  const mockLeaderboard = [
    { rank: 1, score: 42, player: "0x1234...5678" },
    { rank: 2, score: 38, player: "0xabcd...efgh" },
    { rank: 3, score: 35, player: "0x9876...5432" },
  ];

  return c.json({ leaderboard: mockLeaderboard });
});

console.log(`🎮 Flappy x402 Server starting on port ${port}`);
console.log(`💰 Accepting payments to: ${payTo}`);
console.log(`🔗 Network: ${network}`);
console.log(`💵 Price per game: $${gamePrice} USDC`);

serve({
  fetch: app.fetch,
  port,
});
