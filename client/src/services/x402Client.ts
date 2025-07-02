import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Hex, WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";

// In production, use a wallet connector instead of private key
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY as Hex;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Create account from private key (for development only)
const devAccount =
  // PRIVATE_KEY && PRIVATE_KEY !== "0xYOUR_PRIVATE_KEY_HERE"
  //   ? privateKeyToAccount(PRIVATE_KEY)
  // :
  null;

if (devAccount) {
  console.log(
    "⚠️ Development private key detected. Use wallet connection for production!"
  );
}

// Base axios instance without payment interceptor
const baseApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// This will be set dynamically based on wallet connection
let apiClient: AxiosInstance = baseApiClient;
let currentWalletAddress: string | null = null;

// Function to update the API client with a wallet client
export function updateApiClientWithWallet(walletClient: WalletClient | null) {
  if (walletClient && walletClient.account) {
    // x402-axios expects the wallet client to have an account
    apiClient = withPaymentInterceptor(baseApiClient, walletClient as any);
    currentWalletAddress = walletClient.account.address;
    console.log("💳 API client updated with wallet:", currentWalletAddress);
  } else {
    // No wallet connected - reset to base client
    apiClient = baseApiClient;
    currentWalletAddress = null;
    console.log("⚠️ API client reset - no wallet connected");
  }
}

// Function to update with dev account (only for development)
export function useDevAccount() {
  if (devAccount) {
    apiClient = withPaymentInterceptor(baseApiClient, devAccount);
    currentWalletAddress = devAccount.address;
    console.log("🔧 Using dev account:", devAccount.address);
  }
}

// Legacy functions for backward compatibility
export function updateApiClientWithSigner() {
  console.warn(
    "⚠️ updateApiClientWithSigner is deprecated. Wallet is now handled automatically."
  );
}

export function updateApiClient() {
  console.warn(
    "⚠️ updateApiClient is deprecated. Wallet is now handled automatically."
  );
}

// API endpoints
export const gameAPI = {
  // Get server health and config
  getHealth: async () => {
    const response = await apiClient.get("/api/health");
    return response.data;
  },

  // Create a new game session (requires payment)
  createSession: async () => {
    console.log("🎮 Creating game session...");
    console.log("📍 API URL:", API_BASE_URL);
    console.log("💳 Current wallet:", currentWalletAddress || "None");

    if (!currentWalletAddress) {
      throw new Error(
        "No wallet connected. Please connect your wallet to play."
      );
    }

    try {
      const response = await apiClient.post("/api/game/session");

      console.log("✅ Session created:", response.data);

      // Decode payment response if available
      const paymentResponse = response.headers["x-payment-response"];
      if (paymentResponse) {
        const decoded = decodeXPaymentResponse(paymentResponse);
        console.log("💰 Payment processed:", decoded);
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Session creation failed:", error);

      if (error.response?.status === 402) {
        console.log("💳 Payment required (402):", error.response.data);
        console.log("🔄 x402 should handle this automatically...");

        // Check if this is a wallet signature rejection
        if (
          error.message?.includes("User rejected") ||
          error.message?.includes("User denied")
        ) {
          throw new Error(
            "Payment authorization was rejected. Please approve the payment in your wallet."
          );
        }
      } else if (error.code === "ERR_NETWORK") {
        console.error("🔌 Network error - is the server running on port 3001?");
      }

      throw error;
    }
  },

  // Validate a game session
  validateSession: async (sessionId: string) => {
    const response = await apiClient.get(`/api/game/session/${sessionId}`);
    return response.data;
  },

  // Submit game score
  submitScore: async (sessionId: string, score: number) => {
    const response = await apiClient.post("/api/game/score", {
      sessionId,
      score,
    });
    return response.data;
  },

  // Pay to continue (requires $1 payment) - Pay to win!
  continueGame: async (score: number) => {
    console.log("💰 PAY TO WIN MODE ACTIVATED!");
    console.log("📍 API URL:", API_BASE_URL);
    console.log("💳 Current wallet:", currentWalletAddress || "None");
    console.log("🎮 Continuing with score:", score);

    if (!currentWalletAddress) {
      throw new Error(
        "No wallet connected. Please connect your wallet to continue."
      );
    }

    try {
      const response = await apiClient.post("/api/game/continue", { score });

      console.log("✅ Continue session created:", response.data);

      // Decode payment response if available
      const paymentResponse = response.headers["x-payment-response"];
      if (paymentResponse) {
        const decoded = decodeXPaymentResponse(paymentResponse);
        console.log("💸 $1.00 payment processed for pay-to-win:", decoded);
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Continue payment failed:", error);

      if (error.response?.status === 402) {
        console.log("💳 $1.00 payment required for pay-to-win");

        // Check if this is a wallet signature rejection
        if (
          error.message?.includes("User rejected") ||
          error.message?.includes("User denied")
        ) {
          throw new Error(
            "Pay-to-win payment was rejected. Looks like you chose honor over victory!"
          );
        }
      }

      throw error;
    }
  },

  // Get leaderboard
  getLeaderboard: async () => {
    const response = await apiClient.get("/api/leaderboard");
    return response.data;
  },
};

// Export payment status types
export type PaymentStatus = "idle" | "processing" | "success" | "error";

export interface GameSession {
  sessionId: string;
  message: string;
}
