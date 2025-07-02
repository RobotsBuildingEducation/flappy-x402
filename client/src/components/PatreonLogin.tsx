import React from 'react';
import { usePatreon } from '../contexts/PatreonContext';

export function PatreonLogin() {
  const { user, login, logout } = usePatreon();

  if (user) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-black/50 px-4 py-2 rounded border border-green-400/50">
          <span className="text-green-400 pixel-font-xs">PATREON</span>
          <span className="text-cyan-400 pixel-font">{user.data.attributes.full_name}</span>
          <button onClick={logout} className="text-red-400 hover:text-red-300 pixel-font-xs underline">LOGOUT</button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={login}
        className="arcade-button px-6 py-3 text-white"
      >
        LOGIN WITH PATREON
      </button>
    </div>
  );
}
