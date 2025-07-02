import React from "react";

interface PaymentStatusProps {
  score: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onPayToWin?: () => void;
  isPayToWinLoading?: boolean;
  payToWinError?: string | null;
  credits?: number;
}

export function PaymentStatus({ 
  score, 
  onPlayAgain, 
  onBackToMenu,
  onPayToWin,
  isPayToWinLoading = false,
  payToWinError = null,
  credits = 0
}: PaymentStatusProps) {
  // Format score with leading zeros
  const formattedScore = score.toString().padStart(6, '0');
  
  return (
    <div className="arcade-screen min-h-[600px] relative">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[600px] p-8">
        {/* Game Over Title */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl text-red-500 neon-text pixel-font mb-4 animate-pulse tracking-wider">
            GAME OVER
          </h2>
        </div>

        {/* Score Display */}
        <div className="mb-10 text-center">
          <div className="text-cyan-400 pixel-font-sm mb-4">FINAL SCORE</div>
          <div className="text-5xl text-yellow-400 neon-text pixel-font tracking-wider">
            {formattedScore}
          </div>
        </div>

        {/* Pay to Win Section */}
        {onPayToWin && score > 0 && (
          <div className="mb-8 text-center">
            <div className="mb-4">
              <button
                onClick={onPayToWin}
                disabled={isPayToWinLoading}
                className={`
                  relative px-8 py-6 
                  bg-gradient-to-b from-purple-600 to-purple-800 
                  border-4 border-purple-900
                  rounded-lg
                  text-white pixel-font-sm
                  shadow-lg
                  transform transition-all duration-100
                  hover:scale-105 hover:from-purple-500 hover:to-purple-700
                  active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isPayToWinLoading ? 'animate-pulse' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <span>{isPayToWinLoading ? 'PROCESSING...' : 'PAY TO WIN'}</span>
                  <span className="text-2xl">💰</span>
                </div>
                <div className="text-xs mt-2 text-purple-200">
                  $1.00 TO CONTINUE WITH SCORE
                </div>
                
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-purple-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
            
            {payToWinError && (
              <div className="px-4 py-2 bg-red-900/50 border border-red-500 rounded">
                <p className="text-red-400 pixel-font-xs">{payToWinError}</p>
              </div>
            )}
          </div>
        )}

        {/* Insert Coin Prompt */}
        <div className="mb-10 text-center">
          <div className="text-red-400 pixel-font text-base mb-4 blink tracking-wide">
            INSERT COIN TO CONTINUE
          </div>
          <div className="text-gray-400 pixel-font-xs">
            1 CREDIT = 1 GAME
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-8 mb-10">
          {/* Play Again Button */}
          <button
            onClick={onPlayAgain}
            className="arcade-button px-8 py-4 text-white"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🪙</span>
              <span className="pixel-font-sm">INSERT COIN</span>
            </div>
          </button>

          {/* Back to Menu Button */}
          <button
            onClick={onBackToMenu}
            className="px-8 py-4 bg-gray-700 border-4 border-gray-800 rounded-lg text-gray-300 pixel-font-sm hover:bg-gray-600 transition-colors"
          >
            MENU
          </button>
        </div>

        {/* Score Rank Display */}
        <div className="mt-8 text-center">
          {score >= 10 && (
            <div className="text-green-400 pixel-font-sm animate-pulse">
              {score >= 30 ? "LEGENDARY PILOT!" : 
               score >= 20 ? "EXPERT FLYER!" :
               "NICE FLYING!"}
            </div>
          )}
        </div>

        {/* Arcade Message */}
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <div className="text-gray-500 pixel-font-xs">
            THANK YOU FOR PLAYING
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 left-8">
          <div className="text-cyan-400 pixel-font-xs">
            CREDITS: {credits}
          </div>
        </div>

        <div className="absolute top-8 right-8">
          <div className="text-cyan-400 pixel-font-xs">
            {onPayToWin ? 'PAY $1 TO CONTINUE' : '$0.001 USDC'}
          </div>
        </div>
      </div>

      {/* CRT Effect Overlay */}
      <div className="crt-flicker absolute inset-0 pointer-events-none"></div>
    </div>
  );
} 