import { config } from "dotenv";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { paymentMiddleware, Network, Resource } from "x402-hono";
import { v4 as uuidv4 } from "uuid";

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
    },
    {
      url: facilitatorUrl,
    }
  )
);

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
