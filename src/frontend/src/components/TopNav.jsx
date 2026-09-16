import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NEON_COLORS = {
  primary: '#00FFFF', // Azul Ciber
  alert: '#FF3131', // Rojo Plasma
  secondary: '#39FF14', // Verde Neón
  darkBackground: '#0a0a0a',
};

// Datos Simulados por defecto (si no llegan props)
const initialNodes = [
  { id: 'BBB-01', name: 'Gateway', role: 'Gateway', status: 'online' },
  { id: 'BBB-02', name: 'IA Edge', role: 'Analista', status: 'alert' },
  { id: 'BBB-03', name: 'IoT', role: 'Sensor', status: 'offline' },
];

const TopNav = ({ clusterNodes }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // Definición de enlaces con Rutas Reales
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Laboratorios', path: '/labs' },
    { name: 'Hardware', path: '/hardware-catalog' },
    { name: 'IA Predictiva', path: '/ai-predictive' },
    { name: 'Proyectos', path: '/proyectos' },
    { name: 'Conocimiento', path: '/knowledge' },
  ];

  // Lógica de estado del clúster
  const srcNodes = Array.isArray(clusterNodes) && clusterNodes.length ? clusterNodes : initialNodes;
  const clusterStatus = srcNodes.some(n => n.status === 'alert') ? 'alert' : 'online';
  const onlineCount = srcNodes.filter(n => n.status === 'online').length;
  const alertCount = srcNodes.filter(n => n.status === 'alert').length;
  const offlineCount = srcNodes.filter(n => n.status === 'offline').length;
  const notificationCount = alertCount;

  const dotStyle = (color) => ({ backgroundColor: color, boxShadow: `0 0 8px ${color}` });

  // Estado del sistema honesto (derivado de los nodos reales)
  const systemStatusInfo = clusterStatus === 'alert'
    ? { label: 'Sistema operativo — revisar alertas', color: NEON_COLORS.alert }
    : { label: 'Sistema operativo', color: NEON_COLORS.secondary };

  return (
    <header
      className={"fixed top-0 left-0 w-full z-50 border-b-2 backdrop-blur-sm bg-opacity-90"}
      style={{ backgroundColor: NEON_COLORS.darkBackground, borderColor: NEON_COLORS.primary, boxShadow: `0 4px 15px -5px ${NEON_COLORS.primary}` }}
    >
      {/* Identidad (primera línea del Header Ganadora) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO + SUBTÍTULO IDENTIDAD */}
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="text-2xl font-extrabold tracking-widest cursor-pointer transition-all duration-300 hover:text-white"
              style={{ textDecoration: 'none', color: NEON_COLORS.primary }}
            >
              SIGC&T RURAL
            </Link>
            <span className="hidden md:inline text-[10px] text-gray-500 uppercase tracking-wider border-l border-gray-700 pl-2">
              Ecosistema de ciencia y tecnología rural
            </span>
          </div>

          {/* MENÚ DE ESCRITORIO */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={"px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 " + (currentPath.startsWith(item.path) ? "bg-gray-800 text-white border" : "text-gray-300 hover:bg-gray-700")}
                  style={currentPath.startsWith(item.path) ? { borderColor: NEON_COLORS.primary, boxShadow: `0 0 8px ${NEON_COLORS.primary}` } : { color: undefined }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ZONA DERECHA GANADORA: Estado + Notificaciones + Perfil */}
          <div className="hidden lg:flex items-center gap-3">

            {/* ESTADO DEL SISTEMA */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-800" style={{ color: systemStatusInfo.color }}>
              <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse" style={dotStyle(systemStatusInfo.color)}></span>
              <span className="text-xs font-semibold uppercase tracking-wider">{systemStatusInfo.label}</span>
            </div>

            {/* NOTIFICACIONES (alertas reales, sin inventar) */}
            <details className="group relative">
              <summary className="list-none cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded border border-gray-800 hover:border-gray-600 transition-colors text-gray-300">
                <span className="text-base">🔔</span>
                <span className="text-xs font-semibold">{notificationCount > 0 ? `${notificationCount} alerta${notificationCount > 1 ? 's' : ''}` : 'Sin alertas'}</span>
              </summary>
              <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-gray-900 border-gray-700 p-3 shadow-xl">
                {notificationCount > 0 ? (
                  <>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Alertas del clúster</div>
                    <ul className="space-y-1.5">
                      {srcNodes.filter(n => n.status !== 'online').map(n => (
                        <li key={n.id} className="text-xs flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full" style={dotStyle(n.status === 'alert' ? NEON_COLORS.alert : '#9ca3af')}></span>
                          <span className="text-gray-300">{n.id} · {n.name}</span>
                          <span className="ml-auto text-[10px] uppercase" style={{ color: n.status === 'alert' ? NEON_COLORS.alert : '#9ca3af' }}>
                            {n.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/dashboard" className="block mt-3 text-[10px] text-[#00FFFF] hover:underline">Ver operación →</Link>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">No hay alertas activas en el clúster.</div>
                )}
              </div>
            </details>

            {/* PERFIL (informativo, sin sesión falsa) */}
            <details className="group relative">
              <summary className="list-none cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded border border-gray-800 hover:border-gray-600 transition-colors text-gray-300">
                <span className="text-base">👤</span>
                <span className="text-xs font-semibold">Invitado</span>
                <span className="text-[9px] text-gray-500">▾</span>
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-gray-900 border-gray-700 p-3 shadow-xl">
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Sesión</div>
                <p className="text-xs text-gray-300 mb-3">Modo invitado — la autenticación vive en el Dashboard (LoginModal).</p>
                <div className="text-[10px] font-mono text-gray-500">Estado: sesión local (frontend)</div>
              </div>
            </details>
          </div>

          {/* BOTÓN MÓVIL (Hamburguesa) */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#00FFFF] hover:text-white hover:bg-gray-800 focus:outline-none transition-all duration-300"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={"block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-300 " + (currentPath.startsWith(item.path) ? "bg-gray-800 text-white border" : "text-gray-300 hover:bg-gray-700")}
                style={currentPath.startsWith(item.path) ? { borderColor: NEON_COLORS.primary, boxShadow: `0 0 8px ${NEON_COLORS.primary}` } : {}}
              >
                {item.name}
              </Link>
            ))}
            {/* Estado + notificaciones + perfil (móvil) */}
            <div className="py-2 px-3 border-t border-gray-700 mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse" style={dotStyle(systemStatusInfo.color)}></span>
                {systemStatusInfo.label}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-base">🔔</span>
                {notificationCount > 0 ? `${notificationCount} alerta${notificationCount > 1 ? 's' : ''} en el clúster` : 'Sin alertas activas'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-base">👤</span> Invitado · {onlineCount} online · {offlineCount} offline
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNav;