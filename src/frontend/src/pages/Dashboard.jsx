import React, { useEffect, useMemo, useState } from 'react';
import ClusterCard from '../components/ClusterCard.jsx';
import LoginModal from '../components/LoginModal.jsx';
import GlobalChart from '../components/GlobalChart.jsx';
import TelemetryPanel from '../components/TelemetryPanel.jsx';

// Colores Neón definidos
const NEON_COLORS = {
  primary: '#00FFFF', // Azul Ciber
  secondary: '#39FF14', // Verde Neón (para estado OK)
  alert: '#FF3131', // Rojo Plasma (para alertas)
  darkBackground: '#0a0a0a',
};

// --- DATOS SIMULADOS DEL CLÚSTER BBB ---
const initialNodes = [
  { id: 'BBB-01', name: 'Gateway / MQTT Broker', role: 'Gateway', status: 'online', data: { cpu: '15%', temp: '45°C', network: 'OK' } },
  { id: 'BBB-02', name: 'IA Edge / TFLite', role: 'Analista', status: 'alert', data: { cpu: '88%', temp: '68°C', diagnosis: 'Enfermedad Detectada' } },
  { id: 'BBB-03', name: 'Adquisición de Datos / IoT', role: 'Sensor', status: 'offline', data: { cpu: '0%', temp: 'N/A', humidity: 'N/A' } },
];

// --- DATOS FALLBACK PARA GRÁFICA (Si no llegan props) ---
const defaultChartData = [
  { time: '06:00', temp: 18, humidity: 85 },
  { time: '09:00', temp: 22, humidity: 75 },
  { time: '12:00', temp: 28, humidity: 60 },
  { time: '15:00', temp: 30, humidity: 55 },
  { time: '18:00', temp: 26, humidity: 70 },
  { time: '21:00', temp: 22, humidity: 80 },
];

const telemetryHistoryUrl = import.meta.env.VITE_TELEMETRY_HISTORY_URL?.trim();

const TELEMETRY_ENDPOINTS = [
  telemetryHistoryUrl,
  '/api/v3/telemetry/history/',
].filter(Boolean);

async function fetchTelemetryEnvelope() {
  for (const url of TELEMETRY_ENDPOINTS) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      const data = await response.json();
      if (data?.context === 'telemetry' && Array.isArray(data?.items)) {
        return data;
      }
    } catch (error) {
      // Intentar siguiente endpoint
    }
  }
  throw new Error('No fue posible obtener telemetria oficial V3');
}

// --- TARJETAS DE INTEGRACIONES FUTURAS (Tu código original) ---
const futureNodes = [
  {
    id: 'RPI-05', name: 'Raspberry Pi 5 / Edge AI', role: 'SBC', status: 'construction',
    data: { cpu: '—', temp: '—' }, icon: '🍓', banner: 'Placeholder de integración',
    links: [
      { label: 'Docs Raspberry Pi', href: 'https://www.raspberrypi.com/documentation/' },
      { label: 'Software (Imager)', href: 'https://www.raspberrypi.com/software/' },
    ],
  },
  {
    id: 'FPGA-X', name: 'FPGA Moderna / HDL', role: 'Aceleradora', status: 'construction',
    data: { cpu: '—', temp: '—' }, icon: '🧩', banner: 'Placeholder de integración',
    links: [
      { label: 'AMD Adaptive SoCs', href: 'https://www.amd.com/en/products/adaptive-socs-and-fpgas' },
      { label: 'Yosys Open Source', href: 'https://yosyshq.net/yosys/' },
    ],
  },
  {
    id: 'ARDUINO-UNO-Q', name: 'Arduino UNO Q', role: 'SBC/MCU', status: 'construction',
    data: { cpu: '—', temp: '—' }, icon: '⚡', banner: 'Placeholder de integración',
    links: [
      { label: 'Arduino Docs', href: 'https://docs.arduino.cc/' },
      { label: 'Arduino Cloud', href: 'https://cloud.arduino.cc/' },
    ],
  },
  {
    id: 'ALEXA-IOT', name: 'Alexa / Google Assistant', role: 'Voz IoT', status: 'construction',
    data: { cpu: '—', temp: '—' }, icon: '🎙️', banner: 'Placeholder de integración',
    links: [
      { label: 'Alexa Developer', href: 'https://developer.amazon.com/en-US/alexa' },
    ],
  },
  {
    id: 'DRONE-NAV', name: 'Drones / Autopilots', role: 'UAV', status: 'construction',
    data: { cpu: '—', temp: '—' }, icon: '🛸', banner: 'Placeholder de integración',
    links: [
      { label: 'PX4 Docs', href: 'https://docs.px4.io/main/en/' },
      { label: 'ArduPilot', href: 'https://ardupilot.org/' },
    ],
  },
];

const Dashboard = ({ nodes = initialNodes, chartData = defaultChartData }) => { 
    const [loginOpen, setLoginOpen] = useState(false);
    const [telemetryEnvelope, setTelemetryEnvelope] = useState(null);
    const [telemetryLoading, setTelemetryLoading] = useState(true);
    const [telemetryError, setTelemetryError] = useState(null);
    const onRequireAuth = () => setLoginOpen(true);

    useEffect(() => {
        let isMounted = true;

        const loadTelemetry = async () => {
            try {
                setTelemetryLoading(true);
                const data = await fetchTelemetryEnvelope();
                if (isMounted) {
                    setTelemetryEnvelope(data);
                    setTelemetryError(null);
                }
            } catch (error) {
                if (isMounted) {
                    setTelemetryError(error.message);
                }
            } finally {
                if (isMounted) {
                    setTelemetryLoading(false);
                }
            }
        };

        loadTelemetry();
        return () => {
            isMounted = false;
        };
    }, []);

    const telemetryItems = telemetryEnvelope?.items ?? [];

    const telemetryChartData = useMemo(() => {
        return telemetryItems.map((item) => ({
            time: String(item.timestamp || '').includes('T')
                ? String(item.timestamp).slice(11, 16)
                : String(item.timestamp || ''),
            temp: item.temperature,
            humidity: item.humidity,
            sensor: item.sensor_id,
        }));
    }, [telemetryItems]);

    return (
        <div className="p-6 pt-24 min-h-screen text-white font-sans" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
            <div className="max-w-7xl mx-auto animate-fade-in">
                
                {/* 1. ENCABEZADO CIENTÍFICO */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter" 
                            style={{ 
                                color: NEON_COLORS.primary, 
                                textShadow: `0 0 15px ${NEON_COLORS.primary}, 0 0 10px ${NEON_COLORS.primary}AA`
                            }}>
                            🌱 Dashboard Científico (Edge)
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                            Visualización en tiempo real del estado, carga y telemetría de los 3 Nodos BeagleBone Black RevC.
                        </p>
                    </div>
                    <div className="text-right hidden sm:block">
                         <div className="text-xs text-[#39FF14] font-mono animate-pulse border border-[#39FF14] px-2 py-1 rounded">
                            ● SISTEMA OPERATIVO
                        </div>
                    </div>
                </div>

                {/* 2. NUEVO PANEL DE TELEMETRÍA (Insertado Aquí) */}
                <TelemetryPanel
                    items={telemetryItems}
                    sourceMode={telemetryEnvelope?.source_mode ?? 'unknown'}
                    loading={telemetryLoading}
                    error={telemetryError}
                />

                {/* 3. GRID DE NODOS BBB (Tu código original) */}
                <h2 className="text-[#00FFFF] text-lg font-bold mb-4 mt-8 uppercase border-l-4 border-[#00FFFF] pl-3">
                    Infraestructura Activa
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {nodes.map(node => (
                        <ClusterCard key={node.id} {...node} onRequireAuth={onRequireAuth} />
                    ))}
                </div>

                {/* 4. GRÁFICAS GLOBALES */}
                <div className="mt-12 p-6 rounded-xl border bg-gray-900 bg-opacity-70"
                     style={{ borderColor: NEON_COLORS.secondary, boxShadow: `0 0 15px ${NEON_COLORS.secondary}20` }}>
                    <h2 className="text-2xl font-bold uppercase mb-4 flex items-center gap-2" style={{ color: NEON_COLORS.secondary }}>
                        📈 Telemetría Global
                    </h2>
                    <GlobalChart data={telemetryChartData} compact={false} />
                    {telemetryLoading && (
                        <p className="mt-3 text-sm text-gray-400">
                            Cargando telemetría oficial...
                        </p>
                    )}
                    {!telemetryLoading && telemetryError && (
                        <p className="mt-3 text-sm font-semibold text-[#FF3131]">
                            La grafica se oculto porque la telemetria oficial no esta disponible.
                        </p>
                    )}
                    {!telemetryLoading && !telemetryError && telemetryChartData.length === 0 && (
                        <p className="mt-3 text-sm text-gray-400">
                            No hay lecturas oficiales disponibles para graficar.
                        </p>
                    )}
                </div>

                {/* 5. INTEGRACIONES FUTURAS (Tu código original) */}
                <div className="mt-12 p-6 rounded-xl border bg-gray-900 bg-opacity-70"
                     style={{ borderColor: NEON_COLORS.primary, boxShadow: `0 0 15px ${NEON_COLORS.primary}40` }}>
                    <h2 className="text-2xl font-bold uppercase mb-6" style={{ color: NEON_COLORS.primary }}>
                        🧩 Integraciones Futuras
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">Tarjetas presentacionales para SBC, FPGA, asistentes de voz e interfaces UAV.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {futureNodes.map(node => (
                            <ClusterCard key={node.id} {...node} />
                        ))}
                    </div>
                </div>

                {/* 6. NOTICIAS (Tu código original) */}
                <div className="mt-10 p-6 rounded-xl border-2 bg-gray-900 bg-opacity-70" style={{ borderColor: '#334155' }}>
                    <h3 className="text-xl font-bold uppercase mb-4" style={{ color: '#e6edf3' }}>🗞️ Noticias & Enlaces Oficiales</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <a className="px-3 py-2 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://blog.arduino.cc/" target="_blank" rel="noreferrer">Arduino Blog</a>
                        <a className="px-3 py-2 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://www.raspberrypi.com/news/" target="_blank" rel="noreferrer">Raspberry Pi News</a>
                        <a className="px-3 py-2 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://developer.amazon.com/en-US/alexa" target="_blank" rel="noreferrer">Alexa Developer News</a>
                        <a className="px-3 py-2 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://developers.googleblog.com/" target="_blank" rel="noreferrer">Google Developers Blog</a>
                        <a className="px-3 py-2 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://spectrum.ieee.org/" target="_blank" rel="noreferrer">IEEE Spectrum</a>
                    </div>
                </div>

                <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
            </div>
        </div>
    );
};

export default Dashboard;
