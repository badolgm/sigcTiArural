import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = !!token;

  const login = async (username, password) => {
    try {
      // Intento real: backend Django (ajusta URL si existe)
      const resp = await fetch('/api/auth/login/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (resp.ok) {
        const data = await resp.json();
        const tk = data.token || data.access || 'demo-token';
        setToken(tk); localStorage.setItem('authToken', tk);
        const u = data.user || { username };
        setUser(u); localStorage.setItem('authUser', JSON.stringify(u));
        return { ok: true };
      }
      // Fallback demo-mode
      if (username && password) {
        setToken('demo-token'); localStorage.setItem('authToken', 'demo-token');
        const u = { username };
        setUser(u); localStorage.setItem('authUser', JSON.stringify(u));
        return { ok: true, demo: true };
      }
      return { ok: false };
    } catch (e) {
      if (username && password) {
        setToken('demo-token'); localStorage.setItem('authToken', 'demo-token');
        const u = { username };
        setUser(u); localStorage.setItem('authUser', JSON.stringify(u));
        return { ok: true, demo: true };
      }
      return { ok: false, error: e };
    }
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('authToken'); localStorage.removeItem('authUser');
  };

  const value = useMemo(() => ({ isAuthenticated, token, user, login, logout }), [isAuthenticated, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);