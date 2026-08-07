import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

// URL absoluta, consistente con el resto del frontend (ej. AIPredictiva.jsx /
// VITE_AI_INFERENCE_URL): el nginx que sirve el build de producción no repite
// el proxy /api del dev server de Vite, así que una ruta relativa no llega al
// backend fuera de `vite dev`.
const API_BASE = import.meta.env.VITE_API_URL?.trim() || '';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = !!token;

  const login = async (username, password) => {
    let resp;
    try {
      resp = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    } catch (e) {
      // Backend inalcanzable (caído, CORS, red). Nunca propagar el objeto Error
      // crudo: React no puede renderizarlo como hijo (invariant #31).
      return { ok: false, error: 'No se pudo conectar con el servidor. Intenta de nuevo.' };
    }

    let data;
    try {
      data = await resp.json();
    } catch (e) {
      // Respuesta sin cuerpo JSON (ej. error de infraestructura como un 405/502
      // de un proxy mal configurado) — mismo motivo: siempre string.
      return { ok: false, error: 'El servidor respondió de forma inesperada. Intenta de nuevo.' };
    }

    if (!resp.ok) {
      const detail = typeof data.detail === 'string' ? data.detail : 'Credenciales inválidas';
      return { ok: false, error: detail };
    }

    setToken(data.access); localStorage.setItem('authToken', data.access);
    localStorage.setItem('authRefreshToken', data.refresh);
    const u = { username };
    setUser(u); localStorage.setItem('authUser', JSON.stringify(u));
    return { ok: true };
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRefreshToken');
    localStorage.removeItem('authUser');
  };

  const value = useMemo(() => ({ isAuthenticated, token, user, login, logout }), [isAuthenticated, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);