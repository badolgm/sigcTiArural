import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ClusterCard from '../components/ClusterCard.jsx';
import LoginModal from '../components/LoginModal.jsx';
import GlobalChart from '../components/GlobalChart.jsx';
import TelemetryPanel from '../components/TelemetryPanel.jsx';
import registry from '../knowledge-hub/registry/knowledgeRegistry.generated.json';
import { hardwareCatalogEntries } from '../data/catalog-data.js';
import { ecosystemProjects } from '../data/projects-data.js';

const NAV_SIDEBAR = [
  { icon: '🏠', label: 'Dashboard', to: '/dashboard' },
  { icon: '📋', label: 'Proyectos', to: '/proyectos' },
  { icon: '🛒', label: 'Hardware', to: '/hardware-catalog' },
  { icon: '📚', label: 'Conocimiento', to: '/knowledge' },
  { icon: '🧬', label: 'Laboratorios', to: '/labs' },
  { icon: '🧠', label: 'IA Predictiva', to: '/ai-predictive' },
];

const CAPABILITY_CARDS = [
  { icon: '📋', title: 'Proyectos', text: 'Proyectos reales y en diseño, evidencia trazable', to: '/proyectos' },
  { icon: '🛒', title: 'Hardware', text: 'Catálogo de plataformas con estado honesto', to: '/hardware-catalog' },
  { icon: '🌱', title: 'Laboratorios', text: 'Espacios de aprendizaje y simulación', to: '/labs' },
  { icon: '🧠', title: 'IA Predictiva', text: 'Predicción y explicabilidad', to: '/ai-predictive' },
  { icon: '📚', title: 'Conocimiento', text: 'Knowledge Hub — documentación gobernada', to: '/knowledge' },
];

// U2.2 — ACCESO RÁPIDO A LABORATORIOS (todas las rutas ya existen en App.jsx)
const LAB_QUICK_ACCESS = [
  { icon: '⚛️', title: 'Electrónica', to: '/lab-electronics', accent: '#ff4d4d' },
  { icon: '📡', title: 'Telecomunicaciones', to: '/lab-telecom', accent: '#00e5ff' },
  { icon: '💻', title: 'Programación', to: '/labs', accent: '#D946EF' },
  { icon: '🧠', title: 'IA Predictiva', to: '/ai-predictive', accent: '#00FFFF' },
  { icon: '🤖', title: 'Robótica', to: '/labs/robotics', accent: '#00e5ff' },
  { icon: '⚡', title: 'Sistemas Embebidos', to: '/lab-embedded', accent: '#a3ff12' },
  { icon: '📊', title: 'Ciencia de Datos', to: '/data-science', accent: '#ffd32a' },
];

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

    // --- DASHBOARD EJECUTIVO (U2): ruta actual para el sidebar ---
    const currentPath = useLocation().pathname;

    // --- MÉTRICAS DEL DASHBOARD EJECUTIVO (U2 — aditivas) ---
    const onlineCount = nodes.filter((n) => n.status === 'online').length;
    const alertCount = nodes.filter((n) => n.status === 'alert').length;
    const offlineCount = nodes.filter((n) => n.status === 'offline').length;
    const docsCount = registry?.documents?.length ?? 0;
    const researchV2Count = (registry?.documents ?? []).filter((d) =>
        String(d?.id ?? d?.key ?? '').includes('research_v2') || String(d?.category ?? '').toLowerCase().includes('research')
    ).length;
    const hardwareCount = hardwareCatalogEntries.length;
    const projectsCount = ecosystemProjects.length;
    const sourceMode = telemetryEnvelope?.source_mode ?? 'unknown';
    const systemState = {
      live: { label: '● Operativo', color: NEON_COLORS.secondary },
      simulated: { label: '⚪ Referencia (simulación)', color: '#f59e0b' },
    };
    const systemStateInfo = systemState[sourceMode] || { label: '⚪ Estado no confirmado', color: '#9ca3af' };

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
                <div className="flex flex-col lg:flex-row gap-6">

                {/* 0. SIDEBAR EJECUTIVA (U2 — aditiva, navegación de capacidades) */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="p-4 rounded-xl border bg-gray-900 bg-opacity-70 lg:sticky lg:top-24" style={{ borderColor: `${NEON_COLORS.primary}30` }}>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">🧭 Navegación</h2>
                        <nav className="flex flex-col gap-1">
                            {NAV_SIDEBAR.map((n) => (
                                <Link
                                    key={n.to}
                                    to={n.to}
                                    className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2"
                                    style={{
                                        color: currentPath === n.to ? NEON_COLORS.primary : '#cbd5e1',
                                        background: currentPath === n.to ? `${NEON_COLORS.primary}10` : 'transparent',
                                        border: currentPath === n.to ? `1px solid ${NEON_COLORS.primary}50` : '1px solid transparent',
                                    }}
                                >
                                    <span>{n.icon}</span> {n.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-4 pt-3 border-t border-gray-800">
                            <h3 className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Estado del sistema</h3>
                            <div className="text-xs flex items-center gap-2" style={{ color: systemStateInfo.color }}>
                                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: systemStateInfo.color }}></span>
                                {systemStateInfo.label}
                            </div>
                            <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
                                Fuente: {sourceMode}. BBB y catálogo usan vocabulario honesto (operativo / referencia / diseño).
                            </p>
                        </div>
                    </div>
                </aside>

                {/* CONTENIDO PRINCIPAL */}
                <div className="flex-1 min-w-0">

                {/* 1. ENCABEZADO CIENTÍFICO */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter" 
                            style={{ 
                                color: NEON_COLORS.primary, 
                                textShadow: `0 0 15px ${NEON_COLORS.primary}, 0 0 10px ${NEON_COLORS.primary}AA`
                            }}>
                            🌱 SIGC&T Rural — Capacidades del Ecosistema
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                            Conocimiento · Laboratorios · Hardware · Protocolos · Telemetría · IA · Proyectos Reales. El clúster BBB y su monitoreo en vivo viven abajo, en Operación.
                        </p>
                    </div>
                    <div className="text-right hidden sm:block">
                         <div className="text-xs text-[#39FF14] font-mono animate-pulse border border-[#39FF14] px-2 py-1 rounded">
                            ● SISTEMA OPERATIVO
                        </div>
                    </div>
                </div>

                {/* 1a. CINTA DEL CICLO CIENTÍFICO (U5 — hace visible el flujo SENSOR→PRODUCCIÓN; cada eslabón es una ruta real y su estado es honesto; NADA DESAPARECE) */}
                <div className="mb-8 p-4 rounded-xl border bg-gray-900 bg-opacity-70" style={{ borderColor: `${NEON_COLORS.primary}40` }}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: NEON_COLORS.primary, textShadow: `0 0 8px ${NEON_COLORS.primary}60` }}>
                            🔬 Ciclo Científico del Ecosistema
                        </h3>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">sensor → decisión → campo</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: 'SENSOR', label: 'Sensor', icon: '🔬', to: '/dashboard', state: nodes.length > 0 ? 'activo' : 'diseño', stateLabel: `${nodes.length} nodos`, color: NEON_COLORS.secondary },
                            { id: 'SEÑAL', label: 'Señal', icon: '📶', to: '/dashboard', state: telemetryItems.length > 0 ? 'activo' : 'diseño', stateLabel: `${telemetryItems.length} lecturas·${sourceMode}`, color: NEON_COLORS.secondary },
                            { id: 'DATO', label: 'Dato', icon: '🗄️', to: '/dashboard', state: telemetryItems.length > 0 ? 'activo' : 'diseño', stateLabel: telemetryItems.length > 0 ? 'V3 streaming' : 'sin flujo aún', color: telemetryItems.length > 0 ? NEON_COLORS.primary : '#f59e0b' },
                            { id: 'DATASET', label: 'Dataset', icon: '📊', to: '/knowledge', state: researchV2Count > 0 ? 'diseño' : 'ausente', stateLabel: `${researchV2Count} docs research`, color: researchV2Count > 0 ? '#f59e0b' : '#9ca3af' },
                            { id: 'MODELO', label: 'Modelo ML', icon: '🧠', to: '/ai-predictive', state: 'diseño', stateLabel: 'binary demo', color: '#f59e0b' },
                            { id: 'IA', label: 'IA', icon: '🤖', to: '/ai-predictive', state: 'diseño', stateLabel: 'inferencia demo', color: '#f59e0b' },
                            { id: 'DECISIÓN', label: 'Decisión', icon: '🎯', to: '/ai-predictive', state: 'diseño', stateLabel: 'recomendación', color: '#f59e0b' },
                            { id: 'PRODUCCIÓN', label: 'Producción', icon: '🚜', to: '/proyectos', state: 'diseño', stateLabel: 'agricultura IA · diseño', color: '#9ca3af' },
                        ].map((step, i) => (
                            <React.Fragment key={step.id}>
                                {i > 0 && <span className="text-gray-600 text-[10px] font-mono">→</span>}
                                <Link
                                    to={step.to}
                                    title={`${step.label} · ${step.stateLabel}`}
                                    className="px-2.5 py-1.5 rounded-md border bg-gray-900 bg-opacity-60 transition-all duration-200 hover:scale-105 inline-flex items-center gap-1.5"
                                    style={{ borderColor: `${step.color}55` }}
                                >
                                    <span className="text-xs">{step.icon}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: step.color }}>{step.label}</span>
                                    <span className="text-[9px] font-mono text-gray-400 hidden sm:inline">· {step.stateLabel}</span>
                                </Link>
                            </React.Fragment>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                        Flujo vivo del ecosistema: cada eslabón enlaza a su página real. Verde = operativo · ámbar = en desarrollo · gris = en diseño. El dato se vuelve señal, la señal dataset, el dataset modelo, el modelo decisión y la decisión producción.
                    </p>
                </div>

                {/* 1b. MAPA DE DISPOSITIVOS (U2.4 — aditivo, primer nivel) */}
                <div className="mb-8 p-6 rounded-xl border bg-gray-900 bg-opacity-70" style={{ borderColor: `${NEON_COLORS.primary}50`, boxShadow: `0 0 15px ${NEON_COLORS.primary}20` }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: NEON_COLORS.primary, textShadow: `0 0 8px ${NEON_COLORS.primary}60` }}>
                            🗺️ Mapa de Dispositivos
                        </h3>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                            <span style={{ color: '#39FF14' }}>● online</span> · <span style={{ color: '#f59e0b' }}>● alerta</span> · <span style={{ color: '#9ca3af' }}>● offline</span> · <span style={{ color: '#00FFFF' }}>● referencia</span> · <span style={{ color: '#94a3b8' }}>● roadmap</span>
                        </span>
                    </div>

                    {/* Grupo A: NODOS OPERATIVOS (BBB) — zona del clúster vivo */}
                    <div className="mb-4 p-4 rounded-lg border bg-gray-900 bg-opacity-40" style={{ borderColor: '#39FF1450' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#39FF14]">
                                💠 Nodos Operativos <span className="text-gray-500">({nodes.length})</span>
                            </h4>
                            <Link to="/dashboard" className="text-[10px] text-gray-500 hover:text-[#39FF14] transition-colors">
                                Ver operación →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {nodes.map((node) => {
                                const color = node.status === 'online' ? '#39FF14' : node.status === 'alert' ? '#f59e0b' : '#9ca3af';
                                const label = node.status === 'online' ? 'online' : node.status === 'alert' ? 'alerta' : 'offline';
                                return (
                                    <Link key={node.id} to="/dashboard" title={`${node.id} · ${node.role} · ${label}`}
                                        className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 transition-all duration-300 hover:scale-[1.03]"
                                        style={{ borderColor: `${color}40` }}>
                                        <div className="text-2xl mb-1">💠</div>
                                        <div className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{node.id}</div>
                                        <div className="text-[10px] text-gray-400 truncate">{node.name}</div>
                                        <div className="text-[10px] font-mono text-gray-500 mt-1">{node.data?.cpu ?? '—'} · {node.data?.temp ?? '—'}{node.id === 'BBB-03' && telemetryItems.length > 0 && telemetryEnvelope?.source_mode === 'live' ? ' · 📡 LIVE' : ''}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Grupo B: HARDWARE DISPONIBLE — zona del catálogo (fichas) */}
                    <div className="mb-4 p-4 rounded-lg border bg-gray-900 bg-opacity-40" style={{ borderColor: `${NEON_COLORS.primary}50` }}>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: NEON_COLORS.primary }}>
                                🛒 Hardware Disponible <span className="text-gray-500">({hardwareCatalogEntries.filter((e) => e.id !== 'BBB').length})</span>
                            </h4>
                            <Link to="/hardware-catalog" className="text-[10px] text-gray-500 hover:text-[#00FFFF] transition-colors">
                                Ver catálogo →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {hardwareCatalogEntries.filter((e) => e.id !== 'BBB').map((entry) => (
                                <Link key={entry.id} to={`/hardware/${entry.id}`} title={`${entry.id} · ${entry.role} · ${entry.status === 'reference' ? 'referencia' : 'diseño'}`}
                                    className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 transition-all duration-300 hover:scale-[1.03]"
                                    style={{ borderColor: `${NEON_COLORS.primary}35` }}>
                                    <div className="text-2xl mb-1">{entry.icon}</div>
                                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: NEON_COLORS.primary }}>{entry.name}</div>
                                    <div className="text-[10px] text-gray-400 truncate">{entry.role}</div>
                                    <div className="text-[10px] font-mono text-gray-500 mt-1">{entry.fase}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Grupo C: ROADMAP TECNOLÓGICO — zona de futuras plataformas */}
                    <div className="p-4 rounded-lg border bg-gray-900 bg-opacity-40" style={{ borderColor: '#94a3b850' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-300">
                                🧭 Roadmap Tecnológico <span className="text-gray-500">({futureNodes.length})</span>
                            </h4>
                            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Planeado · no implementado</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {futureNodes.map((node) => (
                                <Link key={node.id} to="/hardware-catalog" title={`${node.id} · ${node.role} · roadmap`}
                                    className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 transition-all duration-300 hover:scale-[1.03]"
                                    style={{ borderColor: '#94a3b835' }}>
                                    <div className="text-2xl mb-1">{node.icon}</div>
                                    <div className="text-xs font-bold uppercase tracking-wide text-gray-300">{node.id}</div>
                                    <div className="text-[10px] text-gray-400 truncate">{node.role}</div>
                                    <div className="text-[10px] font-mono text-gray-500 mt-1">{node.data?.cpu ?? '—'} · {node.data?.temp ?? '—'}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 1c. KPIs GANADORA (U3.3 — ejecutivos, 7 métricas) */}
                <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {[
                        { label: 'Dispositivos activos', value: `${onlineCount}/${nodes.length}`, sub: `${alertCount} alerta · ${offlineCount} offline`, color: onlineCount > 0 ? NEON_COLORS.secondary : NEON_COLORS.alert },
                        { label: 'Lecturas (flujo)', value: String(telemetryItems.length), sub: telemetryItems.length === 0 ? 'Sin lecturas activas' : 'último envío', color: telemetryItems.length > 0 ? NEON_COLORS.primary : '#9ca3af' },
                        { label: 'Alertas activas', value: String(alertCount), sub: alertCount > 0 ? 'Revisar operación' : 'Sistema estable', color: alertCount > 0 ? NEON_COLORS.alert : NEON_COLORS.secondary },
                        { label: 'Proyectos', value: String(projectsCount), sub: 'Reales y en diseño', color: NEON_COLORS.primary },
                        { label: 'Plataformas', value: String(hardwareCount), sub: 'Hardware Catalog', color: NEON_COLORS.primary },
                        { label: 'Conocimiento', value: String(docsCount), sub: 'Docs en Knowledge Hub', color: NEON_COLORS.secondary },
                        { label: 'Fuente de datos', value: sourceMode === 'live' ? 'LIVE' : sourceMode === 'simulated' ? 'SIM' : 'N/D', sub: systemStateInfo.label, color: onlineCount === nodes.length ? NEON_COLORS.secondary : '#f59e0b' },
                    ].map((kpi) => (
                        <div key={kpi.label} className="p-3 rounded-xl border bg-gray-900 bg-opacity-60 text-center hover:scale-[1.03] transition-all duration-300" style={{ borderColor: `${kpi.color}40`, boxShadow: `0 0 12px ${kpi.color}20` }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{kpi.label}</div>
                            <div className="text-2xl font-mono font-black" style={{ color: kpi.color, textShadow: `0 0 12px ${kpi.color}80` }}>{kpi.value}</div>
                            <div className="text-[10px] text-gray-500">{kpi.sub}</div>
                        </div>
                    ))}
                </div>

                {/* 1d. ACCESO RÁPIDO A CAPACIDADES (U4 — compactado: de 5 cards a franja de chips; los 5 destinos y textos se conservan como title) */}
                <div className="mb-8 p-3 rounded-xl border bg-gray-900 bg-opacity-70 flex flex-wrap items-center gap-2" style={{ borderColor: `${NEON_COLORS.primary}40` }}>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mr-1">Capacidades:</span>
                    {CAPABILITY_CARDS.map((cap) => (
                        <Link
                            key={cap.to}
                            to={cap.to}
                            title={cap.text}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded border bg-gray-900 bg-opacity-60 transition-all duration-200 hover:scale-105"
                            style={{ borderColor: `${NEON_COLORS.primary}50`, color: NEON_COLORS.primary }}
                        >
                            {cap.icon} {cap.title}
                        </Link>
                    ))}
                </div>

                {/* 1e. ACCESO RÁPIDO A LABORATORIOS (U2.2 — aditivo, primer nivel) */}
                <div className="mb-8 p-4 rounded-xl border bg-gray-900 bg-opacity-70" style={{ borderColor: `${NEON_COLORS.primary}50`, boxShadow: `0 0 15px ${NEON_COLORS.primary}20` }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: NEON_COLORS.primary, textShadow: `0 0 8px ${NEON_COLORS.primary}60` }}>
                            🧬 Acceso Rápido a Laboratorios
                        </h3>
                        <Link to="/labs" className="text-xs text-gray-500 hover:text-[#00FFFF] transition-colors">Ver todos →</Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {LAB_QUICK_ACCESS.map((lab) => (
                            <Link
                                key={lab.to}
                                to={lab.to}
                                className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 text-center transition-all duration-300 hover:scale-[1.05]"
                                style={{ borderColor: `${lab.accent}50`, boxShadow: `0 0 12px ${lab.accent}20` }}
                            >
                                <div className="text-2xl mb-1">{lab.icon}</div>
                                <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: lab.accent }}>{lab.title}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 1f. ACTIVIDAD RECIENTE (U2 — aditiva, honesta) */}
                <div className="mb-8 p-4 rounded-xl border bg-gray-900 bg-opacity-70" style={{ borderColor: '#334155' }}>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">🕓 Actividad reciente</h3>
                    <ul className="space-y-2 text-xs">
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: onlineCount > 0 ? NEON_COLORS.secondary : '#374151' }}></span>
                            <span className="text-gray-400">Cluster BBB:</span>
                            <span className="text-gray-300">{onlineCount} operativos · {alertCount} alerta · {offlineCount} offline</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sourceMode === 'live' ? NEON_COLORS.secondary : '#f59e0b' }}></span>
                            <span className="text-gray-400">Telemetría:</span>
                            <span className="text-gray-300">{sourceMode === 'live' ? 'Flujo en vivo conectado' : 'Datos de referencia / sin flujo activo'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NEON_COLORS.primary }}></span>
                            <span className="text-gray-400">Catálogo:</span>
                            <span className="text-gray-300">{hardwareCount} plataformas documentadas</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NEON_COLORS.primary }}></span>
                            <span className="text-gray-400">Conocimiento:</span>
                            <span className="text-gray-300">{docsCount} documentos indexados</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NEON_COLORS.secondary }}></span>
                            <span className="text-gray-400">Proyectos:</span>
                            <span className="text-gray-300">{projectsCount} capacidades registradas</span>
                        </li>
                    </ul>
                </div>

                {/* 1g. PANEL ESTADO DEL SISTEMA (U3.3 — aditivo, solo datos existentes, sin métricas inventadas) */}
                <div className="mb-8 p-6 rounded-xl border bg-gray-900 bg-opacity-70" style={{ borderColor: `${NEON_COLORS.secondary}50`, boxShadow: `0 0 15px ${NEON_COLORS.secondary}20` }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: NEON_COLORS.secondary, textShadow: `0 0 8px ${NEON_COLORS.secondary}60` }}>
                            🖥️ Estado del Sistema
                        </h3>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: systemStateInfo.color, boxShadow: `0 0 8px ${systemStateInfo.color}` }}></span>
                            {systemStateInfo.label}
                        </span>
                    </div>

                    {/* Fila 1: métricas de infraestructura (honestas, derivadas o pendientes) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {/* CPU — derivada del nodo con data.cpu disponible */}
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60" style={{ borderColor: '#334155' }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">🧠 CPU</div>
                            <div className="text-xs font-mono text-gray-300 whitespace-pre-line">
                                {nodes.map((n) => n.data?.cpu ? `${n.id}: ${n.data.cpu}` : null).filter(Boolean).join('\n') || 'No disponible'}
                            </div>
                        </div>
                        {/* RAM — no existe dato real */}
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60" style={{ borderColor: '#334155' }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">💾 RAM</div>
                            <div className="text-xs font-mono text-gray-500">Pendiente de integración</div>
                        </div>
                        {/* Red — derivada del modo de fuente + alertas conectadas */}
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60" style={{ borderColor: '#334155' }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">🌐 Red</div>
                            <div className="text-xs font-mono" style={{ color: sourceMode === 'live' ? NEON_COLORS.secondary : '#f59e0b' }}>
                                {sourceMode === 'live' ? `Flujo vivo · ${telemetryItems.length} lecturas` : 'Flujo de referencia / sin conexión activa'}
                            </div>
                        </div>
                        {/* Almacenamiento — no existe dato real */}
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60" style={{ borderColor: '#334155' }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">🗄️ Almacenamiento</div>
                            <div className="text-xs font-mono text-gray-500">Pendiente de integración</div>
                        </div>
                    </div>

                    {/* Fila 2: indicadores del ecosistema (todos derivados de datos existentes) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 text-center" style={{ borderColor: `${onlineCount > 0 ? NEON_COLORS.secondary : NEON_COLORS.alert}50` }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Dispositivos</div>
                            <div className="text-xl font-mono font-black" style={{ color: onlineCount > 0 ? NEON_COLORS.secondary : NEON_COLORS.alert }}>{onlineCount}/{nodes.length}</div>
                            <div className="text-[10px] text-gray-500">online</div>
                        </div>
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 text-center" style={{ borderColor: `${alertCount > 0 ? NEON_COLORS.alert : '#334155'}50` }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Alertas</div>
                            <div className="text-xl font-mono font-black" style={{ color: alertCount > 0 ? NEON_COLORS.alert : '#9ca3af' }}>{alertCount}</div>
                            <div className="text-[10px] text-gray-500">{alertCount > 0 ? 'Revisar' : 'Estable'}</div>
                        </div>
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 text-center" style={{ borderColor: `${telemetryItems.length > 0 ? NEON_COLORS.primary : '#334155'}50` }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Lecturas/flujo</div>
                            <div className="text-xl font-mono font-black" style={{ color: telemetryItems.length > 0 ? NEON_COLORS.primary : '#9ca3af' }}>{telemetryItems.length}</div>
                            <div className="text-[10px] text-gray-500">enviados</div>
                        </div>
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 text-center" style={{ borderColor: `${NEON_COLORS.primary}40` }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Plataformas</div>
                            <div className="text-xl font-mono font-black" style={{ color: NEON_COLORS.primary }}>{hardwareCount}</div>
                            <div className="text-[10px] text-gray-500">catálogo</div>
                        </div>
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 text-center" style={{ borderColor: `${NEON_COLORS.primary}40` }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Proyectos</div>
                            <div className="text-xl font-mono font-black" style={{ color: NEON_COLORS.primary }}>{projectsCount}</div>
                            <div className="text-[10px] text-gray-500">registrados</div>
                        </div>
                        <div className="p-3 rounded-lg border bg-gray-900 bg-opacity-60 text-center" style={{ borderColor: `${NEON_COLORS.secondary}40` }}>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Conocimiento</div>
                            <div className="text-xl font-mono font-black" style={{ color: NEON_COLORS.secondary }}>{docsCount}</div>
                            <div className="text-[10px] text-gray-500">docs</div>
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

                {/* 3. FRANJA HARDWARE CONECTADO (U3.7 — reemplaza el grid BBB antiguo por chips del ecosistema; la info BBB persiste en el Mapa Grupo A y en chips) */}
                <details className="group mb-8 rounded-xl border bg-gray-900 bg-opacity-70" style={{ borderColor: `${NEON_COLORS.primary}40` }}>
                    <summary className="cursor-pointer list-none p-4 flex flex-wrap items-center justify-between gap-3 select-none">
                        <span className="flex flex-wrap items-center gap-2 text-[#00FFFF] text-base font-bold uppercase">
                            🔌 Hardware conectado
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                {nodes.filter((n) => n.status === 'online').length} BBB online · {hardwareCatalogEntries.length} plataformas
                            </span>
                        </span>
                        <span className="text-xs text-gray-400 italic">▸ Desplegar el ecosistema</span>
                    </summary>
                    <div className="px-4 pb-4">
                        <p className="text-sm text-gray-400 mb-4">
                            Dispositivos representados en el ecosistema. Cada chip abre su ficha de hardware; los nodos BBB operan en vivo (resumen también en el Mapa → Grupo A). Franja de micro-chips para no duplicar el Mapa en tamaño.
                        </p>
                        {/* Sub-franja 1: NODOS BBB (micro-chips de línea, sin tablero duplicado del Mapa) */}
                        <div className="mb-4">
                            <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: NEON_COLORS.secondary }}>
                                💠 Clúster BBB <span className="text-gray-500">· operación en vivo</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {nodes.map((node) => {
                                    const color = node.status === 'online' ? '#39FF14' : node.status === 'alert' ? '#f59e0b' : '#9ca3af';
                                    const label = node.status === 'online' ? 'online' : node.status === 'alert' ? 'alerta' : 'offline';
                                    return (
                                        <Link key={node.id} to="/dashboard" title={`${node.id} · ${node.role} · ${label} · cpu ${node.data?.cpu ?? '—'}℃ temp ${node.data?.temp ?? '—'}℃`}
                                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border bg-gray-900 bg-opacity-60 transition-all duration-200 hover:scale-105"
                                            style={{ borderColor: `${color}40` }}>
                                            <span className="text-xs">💠</span>
                                            <span className="text-[11px] font-bold uppercase tracking-wide truncate max-w-28" style={{ color }}>{node.id}</span>
                                            <span className="text-[10px] text-gray-400 truncate hidden sm:inline">{node.role}</span>
                                            <span className="text-[9px] font-mono uppercase" style={{ color }}>{label === 'online' ? '●' : label === 'alerta' ? '▲' : '○'} {label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Sub-franja 2: HARDWARE DEL CATÁLOGO (micro-chips navegables a ficha) */}
                        <div>
                            <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: NEON_COLORS.primary }}>
                                🛒 Hardware del ecosistema <span className="text-gray-500">· fichas {hardwareCatalogEntries.length}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {hardwareCatalogEntries.map((entry) => (
                                    <Link key={entry.id} to={`/hardware/${entry.id}`} title={`${entry.id} · ${entry.role} · ${entry.status} · ${entry.fase}`}
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border bg-gray-900 bg-opacity-60 transition-all duration-200 hover:scale-105"
                                        style={{ borderColor: entry.status === 'reference' ? `${NEON_COLORS.secondary}40` : `${NEON_COLORS.primary}35` }}>
                                        <span className="text-xs">{entry.icon}</span>
                                        <span className="text-[11px] font-bold uppercase tracking-wide truncate max-w-28" style={{ color: NEON_COLORS.primary }}>{entry.name}</span>
                                        <span className="text-[10px] text-gray-400 truncate hidden sm:inline">{entry.role}</span>
                                        <span className="text-[9px] font-mono text-gray-500 truncate hidden lg:inline">{entry.fase}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </details>

                {/* 4-6. MÓDULOS EJECUTIVOS COMPACTOS (U3.8 — franja única de 3 módulos; mismo contenido que los acordeones 4/5/6, representación ejecutiva) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    {/* MÓDULO 4: TELEMETRÍA GLOBAL */}
                    <details className="group rounded-xl border bg-gray-900 bg-opacity-70 h-fit" style={{ borderColor: `${NEON_COLORS.secondary}40` }}>
                        <summary className="cursor-pointer list-none p-3 flex flex-col gap-1 select-none">
                            <span className="flex items-center gap-2 text-[#39FF14] text-sm font-bold uppercase">
                                📈 Telemetría Global
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                                    {telemetryItems.length} · {sourceMode === 'live' ? 'LIVE' : sourceMode === 'simulated' ? 'SIM' : 'REF'}
                                </span>
                            </span>
                            <span className="flex flex-wrap items-center gap-2">
                                {(telemetryChartData.length > 0) && (
                                    <>
                                        <span className="text-[10px] font-mono px-2 py-1 rounded border border-gray-700 text-gray-400">
                                            🌡️ {telemetryChartData[telemetryChartData.length - 1]?.temp ?? '—'}°C
                                        </span>
                                        <span className="text-[10px] font-mono px-2 py-1 rounded border border-gray-700 text-gray-400">
                                            💧 {telemetryChartData[telemetryChartData.length - 1]?.humidity ?? '—'}%
                                        </span>
                                    </>
                                )}
                                <span className="text-[10px] text-gray-400 italic">▸ gráfica</span>
                            </span>
                        </summary>
                        <div className="px-3 pb-3">
                            <GlobalChart data={telemetryChartData} compact />
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
                    </details>

                    {/* MÓDULO 5: INTEGRACIONES FUTURAS */}
                    <details className="group rounded-xl border bg-gray-900 bg-opacity-70 h-fit" style={{ borderColor: `${NEON_COLORS.primary}40` }}>
                        <summary className="cursor-pointer list-none p-3 flex flex-col gap-1 select-none">
                            <span className="flex items-center gap-2 text-[#00FFFF] text-sm font-bold uppercase">
                                🧩 Integraciones Futuras
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">{futureNodes.length} plataformas</span>
                            </span>
                            <span className="text-[10px] text-gray-400 italic">▸ roadmap · ver Hardware Catalog</span>
                        </summary>
                        <div className="px-3 pb-3">
                            <p className="text-xs text-gray-400 mb-2">SBC, FPGA, asistentes de voz e interfaces UAV — integración futura. La ficha completa vive en el{' '}
                                <span className="text-[#00FFFF]">🗺️ Roadmap Tecnológico</span> (Mapa) y el{' '}
                                <Link to="/hardware-catalog" className="text-[#00FFFF] hover:underline">Hardware Catalog</Link>.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {futureNodes.map(node => (
                                    <Link key={node.id} to="/hardware-catalog" title={`${node.id} · ${node.role} · roadmap`}
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border bg-gray-900 bg-opacity-60 transition-all duration-200 hover:scale-105"
                                        style={{ borderColor: '#94a3b850' }}>
                                        <span className="text-xs">{node.icon}</span>
                                        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-300">{node.id}</span>
                                        <span className="text-[10px] text-gray-400 truncate hidden sm:inline">{node.role}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </details>

                    {/* MÓDULO 6: NOTICIAS & ENLACES */}
                    <details className="group rounded-xl border-2 bg-gray-900 bg-opacity-70 h-fit" style={{ borderColor: '#334155' }}>
                        <summary className="cursor-pointer list-none p-3 flex flex-col gap-1 select-none">
                            <span className="flex items-center gap-2 text-sm font-bold uppercase" style={{ color: '#e6edf3' }}>
                                🗞️ Noticias & Enlaces Oficiales
                            </span>
                            <span className="text-[10px] text-gray-400 italic">▸ 5 fuentes oficiales</span>
                        </summary>
                        <div className="px-3 pb-3">
                            <div className="flex flex-wrap gap-2 text-xs">
                                <a className="px-2 py-1 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://blog.arduino.cc/" target="_blank" rel="noreferrer">Arduino Blog</a>
                                <a className="px-2 py-1 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://www.raspberrypi.com/news/" target="_blank" rel="noreferrer">Raspberry Pi News</a>
                                <a className="px-2 py-1 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://developer.amazon.com/en-US/alexa" target="_blank" rel="noreferrer">Alexa Developer News</a>
                                <a className="px-2 py-1 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://developers.googleblog.com/" target="_blank" rel="noreferrer">Google Developers Blog</a>
                                <a className="px-2 py-1 rounded border hover:border-[#00FFFF] hover:text-[#00FFFF] transition-colors text-gray-400 border-gray-700" href="https://spectrum.ieee.org/" target="_blank" rel="noreferrer">IEEE Spectrum</a>
                            </div>
                        </div>
                    </details>
                </div>

                <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

                </div>{/* /flex-1 contenido principal */}
                </div>{/* /flex lg:flex-row */}
            </div>
        </div>
    );
};

export default Dashboard;
