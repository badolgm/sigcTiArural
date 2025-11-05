import React from 'react';
import ClusterCard from '../components/ClusterCard'; // Importamos el componente reutilizable
import LoginModal from '../components/LoginModal.jsx';
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

// --- TARJETAS DE INTEGRACIONES FUTURAS (Placeholders "En construcción") ---
const futureNodes = [
  {
    id: 'RPi-05',
    name: 'Raspberry Pi 5 / Edge AI',
    role: 'SBC',
    status: 'construction',
    data: { cpu: '—', temp: '—' },
    icon: '🍓',
    banner: 'Placeholder de integración',
    links: [
      { label: 'Docs Raspberry Pi', href: 'https://www.raspberrypi.com/documentation/' },
      { label: 'Software (Imager)', href: 'https://www.raspberrypi.com/software/' },
    ],
  },
  {
    id: 'FPGA-X',
    name: 'FPGA Moderna / HDL',
    role: 'Aceleradora',
    status: 'construction',
    data: { cpu: '—', temp: '—' },
    icon: '🧩',
    banner: 'Placeholder de integración',
    links: [
      { label: 'AMD Adaptive SoCs & FPGAs', href: 'https://www.amd.com/en/products/adaptive-socs-and-fpgas' },
      { label: 'Intel FPGAs', href: 'https://www.intel.com/content/www/us/en/products/details/fpga.html' },
      { label: 'Yosys (FPGA Open Source)', href: 'https://yosyshq.net/yosys/' },
    ],
  },
  {
    id: 'ALEXA-IOT',
    name: 'Alexa / Google Assistant IoT',
    role: 'Integración Voz',
    status: 'construction',
    data: { cpu: '—', temp: '—' },
    icon: '🎙️',
    banner: 'Placeholder de integración',
    links: [
      { label: 'Alexa Developer', href: 'https://developer.amazon.com/en-US/alexa' },
      { label: 'Google Assistant Dev', href: 'https://developers.google.com/assistant' },
    ],
  },
  {
    id: 'DRONE-NAV',
    name: 'Drones / Autopilots',
    role: 'UAV',
    status: 'construction',
    data: { cpu: '—', temp: '—' },
    icon: '🛸',
    banner: 'Placeholder de integración',
    links: [
      { label: 'PX4 Docs', href: 'https://docs.px4.io/main/en/' },
      { label: 'ArduPilot Docs', href: 'https://ardupilot.org/ardupilot/index.html' },
      { label: 'MAVLink', href: 'https://mavlink.io/en/' },
    ],
  },
];


/**
 * Dashboard: Página principal que muestra el estado de los 3 nodos BBB y telemetría general.
 * Cumple con la Fase 2.1 del Plan Maestro.
 */
const Dashboard = ({ nodes = initialNodes, chartData }) => { // Usamos initialNodes como fallback
    const [loginOpen, setLoginOpen] = React.useState(false);
    const onRequireAuth = () => setLoginOpen(true);
    return (
        <div className="p-8 pt-24 min-h-screen text-white" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
            <div className="max-w-7xl mx-auto">
                {/* Título Principal Neón con icono contextual */}
                <h1 
                    className={`text-4xl sm:text-5xl font-bold mb-10 uppercase text-center`}
                    style={{ 
                        color: NEON_COLORS.primary,
                        textShadow: `0 0 15px ${NEON_COLORS.primary}, 0 0 10px ${NEON_COLORS.primary}AA`
                    }}
                >
                    🌱 Dashboard Científico (Edge)
                </h1>
                
                <p className="text-lg text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                    Visualización en tiempo real del estado, carga y telemetría de los 3 Nodos BeagleBone Black RevC.
                </p>

                {/* Grid de las Tarjetas del Clúster BBB */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {nodes.map(node => (
                        <ClusterCard key={node.id} node={node} onRequireAuth={onRequireAuth} />
                    ))}
                </div>

                {/* Sección de Telemetría Global (Gráficos) */}
                <div className={`mt-16 p-8 rounded-xl border-2 bg-gray-900 bg-opacity-70`}
                    style={{ borderColor: NEON_COLORS.secondary, boxShadow: `0 0 15px ${NEON_COLORS.secondary}80` }}
                >
                    <h2 className={`text-2xl font-bold uppercase mb-4`} style={{ color: NEON_COLORS.secondary, textShadow: `0 0 8px ${NEON_COLORS.secondary}80` }}>
                        📈 Telemetría Global
                    </h2>
                    <GlobalChart data={chartData} />
                </div>

                {/* Integraciones Futuras (Placeholders) */}
                <div className={`mt-16 p-8 rounded-xl border-2 bg-gray-900 bg-opacity-70`}
                    style={{ borderColor: NEON_COLORS.primary, boxShadow: `0 0 15px ${NEON_COLORS.primary}80` }}
                >
                    <h2 className={`text-2xl font-bold uppercase mb-6`} style={{ color: NEON_COLORS.primary, textShadow: `0 0 8px ${NEON_COLORS.primary}80` }}>
                        🧩 Integraciones Futuras
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">Tarjetas presentacionales para SBC, FPGA, asistentes de voz e interfaces UAV. Listas para conectar cuando se integre el backend.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {futureNodes.map(node => (
                            <ClusterCard key={node.id} node={node} />
                        ))}
                    </div>
                </div>

                {/* Panel de Noticias Tecnológicas (fuentes oficiales) */}
                <div className={`mt-10 p-6 rounded-xl border-2 bg-gray-900 bg-opacity-70`}
                    style={{ borderColor: '#334155' }}
                >
                    <h3 className="text-xl font-bold uppercase mb-4" style={{ color: '#e6edf3' }}>🗞️ Noticias & Enlaces Oficiales</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <a className="px-3 py-2 rounded border neon-btn" style={{ borderColor: '#334155' }} href="https://blog.arduino.cc/" target="_blank" rel="noreferrer">Arduino Blog</a>
                        <a className="px-3 py-2 rounded border neon-btn" style={{ borderColor: '#334155' }} href="https://www.raspberrypi.com/news/" target="_blank" rel="noreferrer">Raspberry Pi News</a>
                        <a className="px-3 py-2 rounded border neon-btn" style={{ borderColor: '#334155' }} href="https://developer.amazon.com/en-US/alexa" target="_blank" rel="noreferrer">Alexa Developer News</a>
                        <a className="px-3 py-2 rounded border neon-btn" style={{ borderColor: '#334155' }} href="https://developers.googleblog.com/" target="_blank" rel="noreferrer">Google Developers Blog</a>
                        <a className="px-3 py-2 rounded border neon-btn" style={{ borderColor: '#334155' }} href="https://www.eetimes.com/" target="_blank" rel="noreferrer">EE Times</a>
                        <a className="px-3 py-2 rounded border neon-btn" style={{ borderColor: '#334155' }} href="https://spectrum.ieee.org/" target="_blank" rel="noreferrer">IEEE Spectrum</a>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Este panel muestra fuentes oficiales. Se pueden añadir titulares específicos cuando haya confirmación pública.</p>
                </div>

                {/* Login modal for restricted actions */}
                <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
            </div>
        </div>
    );
};

export default Dashboard;
