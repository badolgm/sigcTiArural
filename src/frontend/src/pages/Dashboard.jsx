import React from 'react';
import ClusterCard from '../components/ClusterCard'; // Importamos el componente reutilizable
import GlobalChart from '../components/GlobalChart.jsx';

// Colores Neón definidos (importados localmente para asegurar el color)
const NEON_COLORS = {
  primary: '#00FFFF', // Azul Ciber
  secondary: '#39FF14', // Verde Neón (para estado OK)
  alert: '#FF3131', // Rojo Plasma (para alertas)
  darkBackground: '#0a0a0a',
};

// Función de estilos de sombra (necesaria aquí también)
const getNeonShadow = (color) => `shadow-[0_0_15px_${color}80] hover:shadow-[0_0_25px_${color}] transition-all duration-500`;

// --- DATOS SIMULADOS DEL CLÚSTER BBB (Debe provenir del estado/API en producción) ---
const initialNodes = [
  { id: 'BBB-01', name: 'Gateway / MQTT Broker', role: 'Gateway', status: 'online', data: { cpu: '15%', temp: '45°C', network: 'OK' } },
  { id: 'BBB-02', name: 'IA Edge / TFLite', role: 'Analista', status: 'alert', data: { cpu: '88%', temp: '68°C', diagnosis: 'Enfermedad Detectada' } },
  { id: 'BBB-03', name: 'Adquisición de Datos / IoT', role: 'Sensor', status: 'offline', data: { cpu: '0%', temp: 'N/A', humidity: 'N/A' } },
];


/**
 * Dashboard: Página principal que muestra el estado de los 3 nodos BBB y telemetría general.
 * Cumple con la Fase 2.1 del Plan Maestro.
 */
const Dashboard = ({ nodes = initialNodes }) => { // Usamos initialNodes como fallback
    return (
        <div className="p-8 pt-24 min-h-screen text-white" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
            <div className="max-w-7xl mx-auto">
                {/* Título Principal Neón */}
                <h1 
                    className={`text-4xl sm:text-5xl font-bold mb-10 uppercase text-center`}
                    style={{ 
                        color: NEON_COLORS.primary,
                        textShadow: `0 0 15px ${NEON_COLORS.primary}, 0 0 10px ${NEON_COLORS.primary}AA`
                    }}
                >
                    DASHBOARD CIENTÍFICO (EDGE)
                </h1>
                
                <p className="text-lg text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                    Visualización en tiempo real del estado, carga y telemetría de los 3 Nodos BeagleBone Black RevC.
                </p>

                {/* Grid de las Tarjetas del Clúster */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {nodes.map(node => (
                        <ClusterCard key={node.id} node={node} />
                    ))}
                </div>

                {/* Sección de Telemetría Global (Gráficos) */}
                <div className={`mt-16 p-8 rounded-xl border-2 bg-gray-900 bg-opacity-70`}
                    style={{ borderColor: NEON_COLORS.secondary, boxShadow: `0 0 15px ${NEON_COLORS.secondary}80` }}
                >
                    <h2 className={`text-2xl font-bold uppercase mb-4`} style={{ color: NEON_COLORS.secondary, textShadow: `0 0 8px ${NEON_COLORS.secondary}80` }}>
                        Telemetría Global (Gráficos)
                    </h2>
                    <GlobalChart />
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
