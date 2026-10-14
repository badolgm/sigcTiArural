// endpoints.js — FRONTEND_OFFICIALIZATION_IMPLEMENTATION_PHASE_1 (P2)
//
// Resuelve la base de endpoints para que el mismo build funcione en:
//   - dev:  Vite dev server (proxy `/api` -> backend)  → `vite.config.js`
//   - prod: nginx del contenedor (location /api/ -> backend:8000) → Dockerfile
//
// Regla: una base absoluta a la propia máquina (localhost / 127.0.0.1) NO debe
// hornearse en el build — rompe el acceso desde otra máquina. Se normaliza a
// su ruta relativa (o al fallback), de modo que el navegador hable con el mismo
// origen y el proxy (Vite o nginx) haga el resto.
export function resolveEndpoint(envValue, fallback = '') {
  const raw = String(envValue ?? '').trim();
  if (!raw) return fallback;
  try {
    const url = new URL(raw);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
      const query = url.search || '';
      return `${path}${query}` || fallback;
    }
  } catch {
    // No es una URL absoluta (ya es relativa): se respeta tal cual.
  }
  return raw;
}
