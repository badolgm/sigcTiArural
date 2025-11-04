import React, { useEffect, useState } from 'react';

// Importamos los componentes modulares
import TopNav from './components/TopNav.jsx'; // FIX: Especificación de extensión
import Dashboard from './pages/Dashboard.jsx'; // FIX: Especificación de extensión
import LabCatalog from './pages/LabCatalog.jsx';
import AdvancedMathLab from './labs/AdvancedMathLab.jsx';
import RoboticsLab from './labs/RoboticsLab.jsx';
import EmbeddedLab from './labs/EmbeddedLab.jsx';
import TelecomLab from './labs/TelecomLab.jsx';
import DocsEdgeSetup from './pages/DocsEdgeSetup.jsx';
import DocsMasterdoc from './pages/DocsMasterdoc.jsx';
import DocsReadme from './pages/DocsReadme.jsx';
import DocsPlanMaestro from './pages/DocsPlanMaestro.jsx';
import DocsApiReference from './pages/DocsApiReference.jsx';
import AIPredictiva from './pages/AIPredictiva.jsx';
import DataScienceLab from './pages/DataScienceLab.jsx';
import { fetchClusterNodesReal, fetchTelemetrySeriesReal } from './services/cloud.js';

// Importaciones de otras páginas (Placeholders)
// import Labs from './pages/Labs'; 
// import AIPredictiva from './pages/AIPredictiva';
// import Biblioteca from './pages/Biblioteca';

// Colores Neón definidos (centralizados para el uso global)
const NEON_COLORS = {
  primary: '#00FFFF', // Azul Ciber
  secondary: '#39FF14', // Verde Neón (para estado OK)
  alert: '#FF3131', // Rojo Plasma (para alertas)
  darkBackground: '#0a0a0a',
};

// --- DATOS SIMULADOS DEL CLÚSTER BBB (Se usarán en TopNav y Dashboard hasta integrar la API) ---
const initialNodes = [
  { id: 'BBB-01', name: 'Gateway / MQTT Broker', role: 'Gateway', status: 'online', data: { cpu: '15%', temp: '45°C', network: 'OK' } },
  { id: 'BBB-02', name: 'IA Edge / TFLite', role: 'Analista', status: 'alert', data: { cpu: '88%', temp: '68°C', diagnosis: 'Enfermedad Detectada' } },
  { id: 'BBB-03', name: 'Adquisición de Datos / IoT', role: 'Sensor', status: 'offline', data: { cpu: '0%', temp: 'N/A', humidity: 'N/A' } },
];


// --- FUNCIÓN DE RENDERIZADO DE PÁGINAS (Switch Case) ---

const PageContent = ({ page, nodes, onNavigate }) => {
    // Usamos el Switch para el ruteo básico (según MASTERDOC)
    switch (page) {
        case 'home':
        case 'dashboard':
            return <Dashboard nodes={nodes} />;
        // Los otros casos solo tienen placeholders por ahora
        case 'labs':
            return <LabCatalog onNavigate={onNavigate} />;
        case 'advanced-math':
            return <AdvancedMathLab onNavigate={onNavigate} />;
        case 'lab-robotics':
            return <RoboticsLab />;
        case 'lab-embedded':
            return <EmbeddedLab />;
        case 'lab-telecom':
            return <TelecomLab />;
        case 'docs-edge-setup':
            return <DocsEdgeSetup />;
        case 'docs-masterdoc':
            return <DocsMasterdoc />;
        case 'docs-readme':
            return <DocsReadme />;
        case 'docs-plan':
            return <DocsPlanMaestro />;
        case 'docs-api':
            return <DocsApiReference />;
        case 'ai':
            return <AIPredictiva />;
        case 'data-lab':
            return <DataScienceLab />;
        case 'library':
            return <PlaceholderPage title="BIBLIOTECA DE CONOCIMIENTO" description="Recursos curados del SENA y universidades aliadas." />;
        case 'docs':
            return <PlaceholderPage title="DOCUMENTACIÓN TÉCNICA (SENA)" description="Enlaces directos al MASTERDOC, Plan Maestro y Documentación de APIs." />;
        default:
            return <PlaceholderPage title="Bienvenido a SIGC&T Rural" description="Inicia la navegación para explorar el sistema." />;
    }
};

// --- COMPONENTE PlaceholderPage (Para otras páginas) ---
const PlaceholderPage = ({ title, description }) => {
    // Clase de sombra Neón
    const getNeonShadow = (color) => `shadow-[0_0_15px_${color}80] hover:shadow-[0_0_25px_${color}] transition-all duration-500`;

    return (
        <div className={`p-8 pt-24 min-h-screen bg-[${NEON_COLORS.darkBackground}] text-white flex flex-col items-center justify-start`}>
            <div className="max-w-4xl w-full">
                <h1 
                    className={`text-4xl sm:text-5xl font-bold mb-4 uppercase text-center transition-colors duration-500`}
                    style={{ 
                        color: NEON_COLORS.primary,
                        textShadow: `0 0 15px ${NEON_COLORS.primary}, 0 0 10px ${NEON_COLORS.primary}AA`
                    }}
                >
                    {title}
                </h1>
                <p className="text-lg text-center text-gray-400 mb-8 max-w-2xl mx-auto">
                    {description}
                </p>
                
                <div className={`p-6 border-2 rounded-xl shadow-2xl transition-all duration-700 
                    border-[${NEON_COLORS.primary}] ${getNeonShadow(NEON_COLORS.primary)}
                    bg-gray-900 bg-opacity-70 mt-10
                `}>
                    <h2 className={`text-2xl font-semibold mb-4`} style={{ color: NEON_COLORS.secondary }}>
                        En Desarrollo
                    </h2>
                    <p className="mb-4">
                        Esta sección será implementada en las próximas Fases del Plan Maestro.
                    </p>
                    <button 
                        className={`px-6 py-2 rounded-full font-bold text-gray-900 transition-all duration-300 
                            bg-[${NEON_COLORS.secondary}] shadow-[0_0_8px_${NEON_COLORS.secondary}] hover:scale-[1.02]
                        `}
                    >
                        Ver Documentación
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---
const App = () => {
    // Estado para controlar la página actual
    const [currentPage, setCurrentPage] = useState('dashboard');
    // Estado para los datos del clúster (será actualizado por WebSocket/API)
    const [nodes, setNodes] = useState(initialNodes); 
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const [n, c] = await Promise.all([
                fetchClusterNodesReal().catch(() => null),
                fetchTelemetrySeriesReal().catch(() => null),
            ]);
            if (!mounted) return;
            if (Array.isArray(n) && n.length) setNodes(n);
            if (Array.isArray(c) && c.length) setChartData(c);
        })();
        return () => { mounted = false; };
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
            {/* 1. Barra de Navegación (Importada y Modular) */}
            <TopNav currentPage={currentPage} setCurrentPage={setCurrentPage} clusterNodes={nodes} />
            
            {/* 2. Contenido de la Página (Lógica de Ruteo) */}
            <PageContent page={currentPage} nodes={nodes} chartData={chartData} onNavigate={setCurrentPage} />
        </div>
    );
};

export default App;
