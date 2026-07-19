import React from 'react';

// Colores Neón definidos según la especificación
const NEON_COLORS = {
  primary: '#00FFFF', // Azul Ciber
  secondary: '#39FF14', // Verde Neón (para estado OK)
  alert: '#FF3131', // Rojo Plasma (para alertas)
  darkBackground: '#0a0a0a',
};

// Estilos dinámicos para sombra y borde según estado
const getStatusStyle = (status) => {
  switch (status) {
    case 'online':
      return { borderColor: NEON_COLORS.secondary, boxShadow: `0 0 15px ${NEON_COLORS.secondary}80` };
    case 'alert':
      return { borderColor: NEON_COLORS.alert, boxShadow: `0 0 15px ${NEON_COLORS.alert}80` };
    case 'offline':
      return { borderColor: '#374151', boxShadow: 'none', color: '#6b7280' };
    case 'construction':
      return { borderColor: '#f59e0b', boxShadow: '0 0 15px #f59e0b80' };
    default:
      return { borderColor: NEON_COLORS.primary };
  }
};

const ClusterCard = ({ id, name, role, status, data, onRequireAuth, icon, banner, links }) => {
  const styles = getStatusStyle(status);

  // Helper para requerir auth si se proporciona la función
  const requireAuth = (action) => {
    if (onRequireAuth) onRequireAuth(action);
    else alert("Acción restringida: Requiere inicio de sesión (Simulado)");
  };

  const ControlButton = ({ label, onClick, danger }) => (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-[10px] uppercase font-bold border rounded transition-all duration-300 hover:scale-105`}
      style={{
        borderColor: danger ? NEON_COLORS.alert : NEON_COLORS.primary,
        color: danger ? NEON_COLORS.alert : NEON_COLORS.primary,
        backgroundColor: 'transparent'
      }}
    >
      {label}
    </button>
  );

  return (
    <div 
      className="p-6 rounded-xl border-2 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02]"
      style={styles}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {name}
          </h3>
          <span className="text-xs font-mono text-gray-400">ID: {id} | {role}</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${status === 'online' ? 'animate-pulse' : ''}`} 
             style={{ backgroundColor: styles.borderColor, boxShadow: styles.boxShadow }}>
        </div>
      </div>

      {/* Datos de Telemetría */}
      <div className="space-y-2 font-mono text-sm">
        {data && Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b border-gray-800 pb-1 last:border-0">
            <span className="text-gray-500 uppercase">{key}:</span>
            <span className="text-white font-bold">{value}</span>
          </div>
        ))}
      </div>

      {/* Enlaces opcionales (Para sección de Futuras Integraciones) */}
      {Array.isArray(links) && links.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="px-3 py-2 text-xs rounded border text-center transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: '#e6edf3' }}>
              {l.label}
            </a>
          ))}
        </div>
      )}

      {/* Estado de verdad (FASE 9A): mismo lenguaje 🟢/🔷/⚪ ya establecido en README.md */}
      {status === 'construction' && (
        <div className="mt-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#f59e0b' }}>
          🔷 Planeado — objetivo oficial, aún no implementado
        </div>
      )}

      {/* Banda informativa */}
      {banner && (
        <div className="mt-3 text-xs text-yellow-300 font-semibold border-l-2 border-yellow-500 pl-2">{banner}</div>
      )}

      {/* Controles estilo panel gamer (acciones restringidas) */}
      {!banner && status !== 'construction' && (
        <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
          <ControlButton label="Iniciar" onClick={() => requireAuth({ node: id, action: 'start' })} />
          <ControlButton label="Reiniciar" danger onClick={() => requireAuth({ node: id, action: 'restart' })} />
        </div>
      )}
    </div>
  );
};

export default ClusterCard;