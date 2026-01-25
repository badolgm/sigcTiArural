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
    { name: 'IA Predictiva', path: '/ai-predictive' },
    { name: 'Docs (v5.0)', path: '/docs/masterdoc' },
  ];

  // Lógica de estado del clúster
  const srcNodes = Array.isArray(clusterNodes) && clusterNodes.length ? clusterNodes : initialNodes;
  const clusterStatus = srcNodes.some(n => n.status === 'alert') ? 'alert' : 'online';
  
  const dotStyle = (color) => ({ backgroundColor: color, boxShadow: `0 0 8px ${color}` });

  return (
    <nav
      className={"fixed top-0 left-0 w-full z-50 border-b-2 backdrop-blur-sm bg-opacity-90"}
      style={{ backgroundColor: NEON_COLORS.darkBackground, borderColor: NEON_COLORS.primary, boxShadow: `0 4px 15px -5px ${NEON_COLORS.primary}` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <div className="flex items-center">
            <Link 
                to="/dashboard"
                className={`text-2xl font-extrabold tracking-widest text-[${NEON_COLORS.primary}] cursor-pointer transition-all duration-300 hover:text-white hover:shadow-[0_0_10px_${NEON_COLORS.primary}]`}
                style={{ textDecoration: 'none', color: NEON_COLORS.primary }}
            >
              SIGC&T RURAL
            </Link>
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

              {/* Indicador de Estado del Clúster */}
              <div className="ml-4 flex items-center">
                <span className="text-xs font-semibold uppercase text-gray-400 mr-2">Cluster Status:</span>
                <span
                  className="inline-block w-3 h-3 rounded-full transition-all duration-500"
                  style={clusterStatus === 'alert' ? dotStyle(NEON_COLORS.alert) : dotStyle(NEON_COLORS.secondary)}
                ></span>
              </div>
            </div>
          </div>

          {/* BOTÓN MÓVIL (Hamburguesa) */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md text-[${NEON_COLORS.primary}] hover:text-white hover:bg-gray-800 focus:outline-none transition-all duration-300`}
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
             <div className="py-2 px-3 text-sm font-semibold text-gray-400 border-t border-gray-700 mt-2 flex items-center">
                Cluster Status: 
                <span
                  className="ml-2 inline-block w-3 h-3 rounded-full transition-all duration-500"
                  style={clusterStatus === 'alert' ? dotStyle(NEON_COLORS.alert) : dotStyle(NEON_COLORS.secondary)}
                ></span>
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNav;