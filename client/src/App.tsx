import React, { useState, useEffect } from "react";
import { FlappyBird } from "./components/FlappyBird";
import { GameMenu } from "./components/GameMenu";
import { PaymentStatus } from "./components/PaymentStatus";
import { SetupGuide } from "./components/SetupGuide";
import { DevModeToggle } from "./components/DevModeToggle";
import { Confetti } from "./components/Confetti";
import { useGameSession } from "./hooks/useGameSession";
import { gameAPI, useDevAccount } from "./services/x402Client";

type GameState = "menu" | "playing" | "gameOver";

function App() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [lastScore, setLastScore] = useState(0);
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [continueScore, setContinueScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [payToWinError, setPayToWinError] = useState<string | null>(null);
  const [isPayToWinLoading, setIsPayToWinLoading] = useState(false);

  const {
    session,
    paymentStatus,
    error,
    isLoading,
    hasActiveGame,
    credits,
    depositId,
    createSession,
    deposit,
    continueGame,
    submitScore,
    resetSession,
  } = useGameSession();

  // Fetch server info on mount
  useEffect(() => {
    gameAPI
      .getHealth()
      .then(setServerInfo)
      .catch((err) => {
        console.error("Server connection failed:", err);
        setConnectionError(
          "Cannot connect to server. Please ensure the server is running on port 3001."
        );
      });
  }, []);

  // Handle dev mode toggle
  const handleDevModeToggle = (enabled: boolean) => {
    setDevMode(enabled);
    if (enabled) {
      // Dev mode uses the private key
      useDevAccount();
    }
    // When disabled, the wallet connection will take over
  };

  // Handle session creation and game start
  const handlePlayClick = async () => {
    console.log("Insert coin clicked");
    setContinueScore(0); // Reset for new games
    await createSession();
  };

  const handleDepositClick = async () => {
    await deposit();
  };

  // Handle pay to win
  const handlePayToWin = async () => {
    setIsPayToWinLoading(true);
    setPayToWinError(null);

    try {
      const newScore = await continueGame(lastScore);

      if (newScore !== null) {
        // Payment successful! Show confetti and continue game
        setShowConfetti(true);
        setContinueScore(newScore);

        // Wait for confetti animation then transition to playing
        setTimeout(() => {
          setShowConfetti(false);
          // Only set game state, the useEffect will handle the transition
          setGameState("menu");
        }, 3000);
      }
    } catch (err: any) {
      setPayToWinError(err.message || "Failed to process payment");
    } finally {
      setIsPayToWinLoading(false);
    }
  };

  // Start game when session is created
  useEffect(() => {
    console.log("Session state check:", {
      session,
      paymentStatus,
      hasActiveGame,
      gameState,
      continueScore,
    });

    // Only transition to playing if we're not already in game over state
    if (
      session &&
      paymentStatus === "success" &&
      hasActiveGame &&
      gameState === "menu"
    ) {
      // Small delay to ensure UI updates properly
      setTimeout(() => {
        // If continueScore is 0, this is a normal game, not pay-to-win
        if (continueScore === 0) {
          console.log("Starting normal game");
        } else {
          console.log("Starting pay-to-win game with score:", continueScore);
        }
        setGameState("playing");
      }, 100);
    }
  }, [session, paymentStatus, hasActiveGame, gameState, continueScore]);

  // Handle game over
  const handleGameOver = async (score: number) => {
    console.log("Game over with score:", score);
    setLastScore(score);
    setGameState("gameOver");
    // Don't reset continue score here - only reset when starting a NEW game

    if (session && hasActiveGame) {
      try {
        await submitScore(score);
        console.log("Score submitted successfully");
      } catch (error) {
        console.error("Failed to submit score:", error);
      }
    } else {
      console.log("No active game session to submit score");
    }
  };

  const handlePlayAgain = () => {
    setContinueScore(0); // Reset continue score when starting fresh
    resetSession(); // Reset the session state first
    setGameState("menu");
    // Don't immediately create a new session - let the user click insert coin
  };

  const handleBackToMenu = () => {
    setContinueScore(0); // Reset continue score when going back to menu
    setGameState("menu");
    resetSession();
  };

  // Show setup guide if there's a connection error or configuration issue
  const showSetupGuide =
    connectionError ||
    (error &&
      (error.includes("Cannot connect to server") ||
        error.includes("No wallet configured") ||
        error.includes("Please set VITE_PRIVATE_KEY")));

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-purple-900 flex items-center justify-center p-4">
      {/* Dev Mode Toggle */}
      <DevModeToggle enabled={devMode} onToggle={handleDevModeToggle} />

      {/* Arcade Cabinet Container */}
      <div className="arcade-cabinet w-full max-w-5xl p-8 bg-gray-900">
        {/* Main Screen Area */}
        <div className="relative">
          {showSetupGuide ? (
            <SetupGuide error={connectionError || error} />
          ) : !serverInfo ? (
            <div className="arcade-screen min-h-[600px] flex items-center justify-center">
              <p className="text-green-400 pixel-font animate-pulse">
                BOOTING...
              </p>
            </div>
          ) : (
            <>
              {gameState === "menu" && (
                <GameMenu
                  onPlayClick={handlePlayClick}
                  onDepositClick={handleDepositClick}
                  paymentStatus={paymentStatus}
                  error={error}
                  isLoading={isLoading}
                  gamePrice={serverInfo.gamePrice || "$0.001"}
                  hasActiveGame={hasActiveGame}
                  credits={credits}
                  devMode={devMode}
                />
              )}

              {gameState === "playing" && (
                <div className="arcade-screen">
                  <div className="relative z-10">
                    {/* Game HUD */}
                    <div className="absolute top-0 left-0 right-0 bg-black/80 p-4 flex justify-between items-center">
                      <div>
                        <p className="text-green-400 pixel-font-xs mb-1">
                          CREDIT
                        </p>
                        <p className="text-green-400 neon-text pixel-font text-lg">
                          {credits}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-yellow-400 pixel-font-xs animate-pulse">
                          {continueScore > 0 ? "PAY TO WIN MODE" : "PLAYING"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 pixel-font-xs">
                          {serverInfo.network}
                        </p>
                      </div>
                    </div>

                    {/* Game Canvas */}
                    <div className="flex justify-center pt-20">
                      <FlappyBird
                        onGameOver={handleGameOver}
                        isPlaying={gameState === "playing"}
                        initialScore={continueScore}
                      />
                    </div>
                  </div>
                </div>
              )}

              {gameState === "gameOver" && (
                <PaymentStatus
                  score={lastScore}
                  onPlayAgain={handlePlayAgain}
                  onBackToMenu={handleBackToMenu}
                  onPayToWin={handlePayToWin}
                  isPayToWinLoading={isPayToWinLoading}
                  payToWinError={payToWinError}
                  credits={credits}
                />
              )}
            </>
          )}
        </div>

        {/* Cabinet Control Panel */}
        <div className="mt-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-lg p-4 border-4 border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>

            {serverInfo && (
              <div className="text-gray-400 pixel-font-xs">
                {devMode ? "DEV MODE" : "OWNER WALLET: "}
                {serverInfo.payTo.slice(0, 6)}...{serverInfo.payTo.slice(-4)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && <Confetti />}
    </div>
  );
}

export default App;
