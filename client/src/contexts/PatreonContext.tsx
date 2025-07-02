import React, { createContext, useContext, useState } from 'react';
import { loginWithPatreon, PatreonAuthResult } from '../services/patreonAuth';

interface PatreonContextType {
  user: any | null;
  token: PatreonAuthResult['token'] | null;
  login: () => Promise<void>;
  logout: () => void;
}

const PatreonContext = createContext<PatreonContextType | undefined>(undefined);

export function PatreonProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<PatreonAuthResult['token'] | null>(null);

  const login = async () => {
    const result = await loginWithPatreon();
    setUser(result.user);
    setToken(result.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <PatreonContext.Provider value={{ user, token, login, logout }}>
      {children}
    </PatreonContext.Provider>
  );
}

export function usePatreon() {
  const ctx = useContext(PatreonContext);
  if (!ctx) throw new Error('usePatreon must be used within PatreonProvider');
  return ctx;
}
