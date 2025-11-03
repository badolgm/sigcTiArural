import React from 'react';

// Colores Neón definidos según la especificación
const NEON_COLORS = {
  primary: '#00FFFF', // Azul Ciber
  secondary: '#39FF14', // Verde Neón (para estado OK)
  alert: '#FF3131', // Rojo Plasma (para alertas)
  darkBackground: '#0a0a0a',
};

// Clase para la sombra flotante Neón
const getNeonShadow = (color) => `shadow-[0_0_15px_${color}80] hover:shadow-[0_0_25px_${color}] transition-all duration-500`;

// Clase para el borde dinámico del estado
const getStatusClasses = (status) => {
  switch (status) {
    case 'online':
      return `border-[${NEON_COLORS.secondary}] ${getNeonShadow(NEON_COLORS.secondary)} text-[${NEON_COLORS.secondary}]`;
    case 'alert':
      return `border-[${NEON_COLORS.alert}] ${getNeonShadow(NEON_COLORS.alert)} text-[${NEON_COLORS.alert}]`;
    case 'offline':
      return `border-gray-700 shadow-none text-gray-500`;
    default:
      return `border-[${NEON_COLORS.primary}]`;
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
    const statusClasses = getStatusClasses(status);
    const statusText = status.toUpperCase();
    const isAlert = status === 'alert';

    return (
        <div className={`p-6 bg-gray-900 bg-opacity-80 rounded-xl border-2 ${statusClasses} transition-all duration-700 ease-in-out transform hover:-translate-y-1`}>
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
                    <span className={isAlert ? `text-[${NEON_COLORS.alert}]` : 'text-white'}>{data.cpu}</span>
                </p>
                <p className="flex justify-between items-center text-gray-300">
                    <span className="font-semibold">Temperature:</span>
                    <span className={isAlert ? `text-[${NEON_COLORS.alert}]` : 'text-white'}>{data.temp}</span>
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
                        <span className={data.network !== 'OK' ? `text-[${NEON_COLORS.alert}]` : 'text-white'}>{data.network}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default ClusterCard;
