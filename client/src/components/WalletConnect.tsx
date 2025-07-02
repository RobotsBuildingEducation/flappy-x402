import React from "react";
import { useWallet } from "../contexts/WalletContext";

export function WalletConnect() {
  const {
    isConnected,
    address,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-black/50 px-4 py-2 rounded border border-green-400/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 pixel-font-xs">CONNECTED</span>
          </div>
          <span className="text-cyan-400 pixel-font">
            {formatAddress(address)}
          </span>
          <button
            onClick={disconnectWallet}
            className="text-red-400 hover:text-red-300 pixel-font-xs underline"
          >
            DISCONNECT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`
          relative group
          px-8 py-4 
          bg-gradient-to-b from-yellow-600 to-orange-600 
          border-4 border-yellow-700
          rounded-lg
          pixel-font text-lg
          text-white
          shadow-lg
          transform transition-all duration-100
          hover:scale-105
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isConnecting ? "animate-pulse" : ""}
        `}
      >
        <span className="relative z-10">
          {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
        </span>

        {/* Arcade button shine effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-lg"></div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-yellow-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      {error && (
        <div className="mt-4 px-4 py-2 bg-red-900/50 border border-red-500 rounded">
          <p className="text-red-400 pixel-font-xs">{error}</p>
        </div>
      )}

      <div className="mt-4 text-gray-400 pixel-font-xs">
        <p>CONNECT YOUR WALLET</p>
        <p className="mt-1">TO PLAY WITH USDC ON BASE SEPOLIA</p>
      </div>
    </div>
  );
}
