import React from "react";
import type { PaymentStatus } from "../services/x402Client";
import { WalletConnect } from "./WalletConnect";
import { useWallet } from "../contexts/WalletContext";

interface GameMenuProps {
  onPlayClick: () => void;
  onDepositClick: () => void;
  paymentStatus: PaymentStatus;
  error: string | null;
  isLoading: boolean;
  gamePrice: string;
  hasActiveGame: boolean;
  credits: number;
  devMode?: boolean;
}

export function GameMenu({
  onPlayClick,
  onDepositClick,
  paymentStatus,
  error,
  isLoading,
  gamePrice,
  hasActiveGame,
  credits,
  devMode = false,
}: GameMenuProps) {
  const { isConnected } = useWallet();

  // In dev mode or if wallet is connected, show game controls
  const canPlay = devMode || isConnected;

  return (
    <div className="arcade-screen min-h-[600px] relative">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[600px] p-8">
        {/* Arcade Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-yellow-400 neon-text pixel-font mb-6 tracking-wider">
            FLAPPY
          </h1>
          <h1 className="text-4xl md:text-5xl text-yellow-400 neon-text pixel-font mb-8 tracking-wider">
            x402
          </h1>
          <div className="text-green-400 pixel-font-xs animate-pulse">
            POWERED BY x402
          </div>
        </div>

        {/* Wallet Connection Status - only show if not in dev mode */}
        {!devMode && (
          <div className="mb-8">
            <WalletConnect />
          </div>
        )}

        {/* Dev mode indicator */}
        {devMode && (
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-900/50 px-4 py-2 rounded border border-yellow-600">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 pixel-font-xs">DEV MODE ACTIVE</span>
            </div>
          </div>
        )}

        {/* Show game content if wallet is connected OR in dev mode */}
        {canPlay ? (
          <>
            {/* Credit Display */}
            <div className="mb-12">
              {hasActiveGame ? (
                <div className="text-center">
                  <div className="text-green-400 pixel-font text-lg mb-4 tracking-wide">CREDIT: {credits > 0 ? credits : 1}</div>
                  <div className="text-yellow-400 pixel-font-xs blink">PRESS START</div>
                </div>
              ) : credits > 0 ? (
                <div className="text-center">
                  <div className="text-green-400 pixel-font text-base mb-4 tracking-wide">CREDITS: {credits}</div>
                  <div className="text-yellow-400 pixel-font-xs">PRESS PLAY</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-red-400 pixel-font text-base mb-4 blink tracking-wide">INSERT COIN</div>
                  <div className="text-white pixel-font-xs">{gamePrice} USDC PER GAME</div>
                </div>
              )}
            </div>

            {/* Coin Slot / Play Button */}
            <div className="mb-12">
              <button
                onClick={onPlayClick}
                disabled={isLoading || hasActiveGame}
                className={`
                  coin-slot px-10 py-8 ${isLoading ? 'coin-slot-active' : ''}
                  ${hasActiveGame ? 'opacity-50' : ''}
                  transition-all
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Coin Icon */}
                  <div className="w-12 h-12 rounded-full bg-yellow-500 border-4 border-yellow-600 relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-yellow-900 font-bold text-xl">¢</span>
                    </div>
                  </div>
                  
                  {/* Button Text */}
                  <div className="text-left">
                    {hasActiveGame ? (
                      <span className="text-green-400 pixel-font-xs">
                        READY
                      </span>
                    ) : isLoading ? (
                      <span className="text-yellow-400 pixel-font-xs animate-pulse">
                        PROCESSING...
                      </span>
                    ) : (
                      <span className="text-white pixel-font-xs">
                        {credits > 0 ? 'PLAY' : 'INSERT COIN'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
              {!hasActiveGame && credits === 0 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={onDepositClick}
                    disabled={isLoading}
                    className="arcade-button px-6 py-3 text-white"
                  >
                    DEPOSIT $1
                  </button>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {paymentStatus === "processing" && (
              <div className="text-yellow-400 pixel-font-xs mb-8 animate-pulse">
                VERIFYING PAYMENT...
              </div>
            )}
            
            {paymentStatus === "success" && !hasActiveGame && (
              <div className="text-green-400 pixel-font-xs mb-8">
                PAYMENT ACCEPTED!
              </div>
            )}

            {error && (
              <div className="max-w-md mb-8">
                <div className="bg-red-900/50 border-2 border-red-500 rounded p-4">
                  <p className="text-red-400 pixel-font-xs break-words">{error}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Show message when wallet not connected (and not in dev mode) */
          <div className="mt-8 text-center">
            <p className="text-gray-400 pixel-font mb-4">WALLET REQUIRED TO PLAY</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-auto pt-8">
          <div className="text-center space-y-4">
            {canPlay && (
              <>
                <p className="text-gray-400 pixel-font-xs">
                  1 CREDIT = 1 GAME
                </p>
                <p className="text-gray-400 pixel-font-xs">
                  {gamePrice} USDC PER CREDIT
                </p>
              </>
            )}
            <p className="text-gray-400 pixel-font-xs">
              PRESS SPACE OR CLICK TO FLY
            </p>
          </div>
        </div>

        {/* Player Info */}
        <div className="absolute top-8 left-8">
          <div className="text-cyan-400 pixel-font-xs">
          </div>
        </div>
      </div>

      {/* CRT Effect Overlay */}
      <div className="crt-flicker absolute inset-0 pointer-events-none"></div>
    </div>
  );
} 