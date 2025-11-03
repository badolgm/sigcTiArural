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
    default:
      return { borderColor: NEON_COLORS.primary };
  }
};

/**
 * ClusterCard: Muestra el estado y telemetría de un nodo BeagleBone Black.
 * Aplica la estética 'flotante' y neón requerida.
 */
const ClusterCard = ({ node }) => {
    // FIX: Verificar si 'node' es nulo o indefinido antes de la desestructuración
    if (!node) return null; 
    
    const { id, name, role, status, data } = node;
    const statusStyle = getStatusStyle(status);
    const statusText = status.toUpperCase();
    const isAlert = status === 'alert';

    return (
        <div
          className={`p-6 bg-gray-900 bg-opacity-80 rounded-xl border-2 transition-all duration-700 ease-in-out transform hover:-translate-y-1`}
          style={statusStyle}
        >
            {/* Cabecera y ID */}
            <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-2">
                <h3 className="text-xl font-bold uppercase" style={{ color: NEON_COLORS.primary, textShadow: `0 0 5px ${NEON_COLORS.primary}80` }}>
                    {id}
                </h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${isAlert ? 'bg-red-800' : status === 'online' ? 'bg-green-800' : 'bg-gray-800'}`}>
                    {statusText}
                </span>
            </div>
            
            {/* Rol y Nombre */}
            <p className="text-sm text-gray-400 mb-2">
                <span className='font-semibold'>Rol:</span> {role}
            </p>
            <p className="text-lg font-medium mb-4" style={{ color: NEON_COLORS.primary }}>
                {name}
            </p>

            {/* Datos de Telemetría */}
            <div className="space-y-2 text-sm">
                <p className="flex justify-between items-center text-gray-300">
                    <span className="font-semibold">CPU Load:</span>
                    <span style={isAlert ? { color: NEON_COLORS.alert } : {}}>{data.cpu}</span>
                </p>
                <p className="flex justify-between items-center text-gray-300">
                    <span className="font-semibold">Temperature:</span>
                    <span style={isAlert ? { color: NEON_COLORS.alert } : {}}>{data.temp}</span>
                </p>
                
                {data.diagnosis && (
                    <p className="flex justify-between items-center border-t border-red-900 pt-2 font-bold" style={{ color: NEON_COLORS.alert }}>
                        <span className="font-semibold">ALERTA IA:</span>
                        <span>{data.diagnosis}</span>
                    </p>
                )}
                {data.network && (
                    <p className="flex justify-between items-center text-gray-300">
                        <span className="font-semibold">Network:</span>
                        <span style={data.network !== 'OK' ? { color: NEON_COLORS.alert } : {}}>{data.network}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default ClusterCard;
