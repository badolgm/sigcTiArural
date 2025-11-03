import React, { useState } from 'react';

// Colores Neón definidos según la especificación
const NEON_COLORS = {
  primary: '#00FFFF', // Azul Ciber
  alert: '#FF3131', // Rojo Plasma (para alertas)
  secondary: '#39FF14', // Verde Neón
  darkBackground: '#0a0a0a',
};

// Datos Simulados (Debe venir del estado global o API en producción)
const initialNodes = [
  { id: 'BBB-01', name: 'Gateway / MQTT Broker', role: 'Gateway', status: 'online' },
  { id: 'BBB-02', name: 'IA Edge / TFLite', role: 'Analista', status: 'alert' }, // Alerta simulada
  { id: 'BBB-03', name: 'Adquisición de Datos / IoT', role: 'Sensor', status: 'offline' },
];


/**
 * TopNav: Barra de Navegación Superior con estética Neón.
 * Incluye el estado del Clúster para cumplimiento de MASTERDOC.
 */
const TopNav = ({ currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Definición de enlaces de navegación
  const navItems = [
    { name: 'Dashboard', page: 'dashboard' },
    { name: 'Laboratorios', page: 'labs' },
    { name: 'Matemáticas Avanzadas', page: 'advanced-math' },
    { name: 'IA Predictiva', page: 'ai' },
    { name: 'Biblioteca', page: 'library' },
    { name: 'Docs (v5.0)', page: 'docs' },
  ];

  // Estilo para el botón de alerta (simulación de un estado crítico)
  const dotStyle = (color) => ({ backgroundColor: color, boxShadow: `0 0 8px ${color}` });

  // Lógica para determinar el estado general del clúster (si hay alguna alerta)
  const clusterStatus = initialNodes.some(n => n.status === 'alert') ? 'alert' : 'online';

  return (
    // Contenedor principal de la navegación con el fondo oscuro y un borde neón inferior
    <nav
      className={"fixed top-0 left-0 w-full z-50 border-b-2 backdrop-blur-sm bg-opacity-90"}
      style={{ backgroundColor: NEON_COLORS.darkBackground, borderColor: NEON_COLORS.primary, boxShadow: `0 4px 15px -5px ${NEON_COLORS.primary}` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Título del Proyecto (Fuente de Título Neón) */}
          <div className="flex items-center">
            <button 
                onClick={() => setCurrentPage('home')}
                className={`text-2xl font-extrabold tracking-widest text-[${NEON_COLORS.primary}] cursor-pointer transition-all duration-300 hover:text-white hover:shadow-[0_0_10px_${NEON_COLORS.primary}]`}
            >
              SIGC&T RURAL
            </button>
          </div>

          {/* Menú de Escritorio (Desktop) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setCurrentPage(item.page)}
                  className={"px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 " + (currentPage === item.page ? "bg-gray-800 text-white border" : "text-gray-300 hover:bg-gray-700")}
                  style={currentPage === item.page ? { borderColor: NEON_COLORS.primary, boxShadow: `0 0 8px ${NEON_COLORS.primary}` } : { color: undefined }}
                >
                  {item.name}
                </button>
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

          {/* Botón para Abrir Menú Móvil (Hamburguesa) */}
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

      {/* Menú Móvil Desplegable */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {setCurrentPage(item.page); setIsMenuOpen(false);}}
                className={"block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-300 " + (currentPage === item.page ? "bg-gray-800 text-white border" : "text-gray-300 hover:bg-gray-700")}
                style={currentPage === item.page ? { borderColor: NEON_COLORS.primary, boxShadow: `0 0 8px ${NEON_COLORS.primary}` } : {}}
              >
                {item.name}
              </button>
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
