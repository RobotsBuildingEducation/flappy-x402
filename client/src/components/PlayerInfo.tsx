import React from 'react';
import { usePatreon } from '../contexts/PatreonContext';

export function PlayerInfo() {
  const { user } = usePatreon();
  if (!user) return null;
  return (
    <div className="text-cyan-400 pixel-font-xs">
      {user.data.attributes.full_name}
    </div>
  );
}
