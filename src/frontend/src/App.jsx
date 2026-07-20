import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// --- IMPORTACIONES EXISTENTES (Mantenemos todo tu código) ---
import TopNav from './components/TopNav.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LabCatalog from './pages/LabCatalog.jsx';
import AdvancedMathLab from './labs/AdvancedMathLab.jsx';
import AdvancedMathLabV2 from './labs/AdvancedMathLabV2.jsx';
import RoboticsLab from './labs/RoboticsLab.jsx';      // Tu laboratorio de Robótica
import EmbeddedLab from './labs/EmbeddedLab.jsx';
import TelecomLab from './labs/TelecomLab.jsx';
import ElectronicsLab from './labs/ElectronicsLab.jsx';
import KnowledgeHubLayout from './knowledge-hub/pages/KnowledgeHubLayout.jsx';
import AIPredictiva from './pages/AIPredictiva.jsx';
import DataScienceLab from './pages/DataScienceLab.jsx';
import VoiceAssistant from './components/VoiceAssistant.jsx'; // Tu Asistente

// Servicios
import { fetchClusterNodesReal, fetchTelemetrySeriesReal } from './services/cloud.js';

// Colores Neón (Globales)
const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  alert: '#FF3131',
  darkBackground: '#0a0a0a',
};

// --- COMPONENTE INTERNO (Maneja la lógica de rutas y datos) ---
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para los datos del clúster (Tu lógica original)
  const [nodes, setNodes] = useState([
    { id: 'BBB-01', name: 'Gateway / MQTT', role: 'Gateway', status: 'online', data: { cpu: '15%', temp: '45°C' } },
    { id: 'BBB-02', name: 'IA Edge / TFLite', role: 'Analista', status: 'alert', data: { diagnosis: 'Iniciando...' } },
    { id: 'BBB-03', name: 'Sensores IoT', role: 'Sensor', status: 'offline', data: { humidity: 'N/A' } },
  ]);
  const [chartData, setChartData] = useState(null);

  // Carga de datos reales (Tu useEffect original)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [n, c] = await Promise.all([
          fetchClusterNodesReal().catch(() => []),
          fetchTelemetrySeriesReal().catch(() => [])
        ]);
        if (!mounted) return;
        if (Array.isArray(n) && n.length > 0) setNodes(n);
        if (Array.isArray(c) && c.length > 0) setChartData(c);
      } catch (e) {
        console.error("Error cargando datos del cluster:", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // --- PUENTE DE NAVEGACIÓN (Para el Asistente de Voz y Botones internos) ---
  const handleNavigation = (target) => {
    console.log("Navegando a:", target);
    
    // Mapeo de comandos antiguos a Rutas Reales
    const routeMap = {
      'dashboard': '/dashboard',
      'home': '/dashboard',
      'labs': '/labs',
      'robotics': '/labs/robotics',     // Voz: "Ir a robótica"
      'ai': '/ai-predictive',           // Voz: "Ir a Inteligencia Artificial"
      'docs': '/knowledge/doc/masterdoc',
      'math': '/advanced-math-v2', // FIX: 'math' key points to correct V2 lab
      'advanced-math': '/advanced-math',
      'advanced-math-v2': '/advanced-math-v2',
      'lab-embedded': '/lab-embedded',
      'lab-telecom': '/lab-telecom',
      'lab-electronics': '/lab-electronics',
      'data-lab': '/data-science'
    };

    // Si target empieza con '/', es una ruta directa. Si no, busca en el mapa.
    const path = target.startsWith('/') ? target : (routeMap[target] || '/dashboard');
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      
      {/* --- DEBUG: GLOBAL STATUS --- */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none p-1 flex justify-center opacity-50">
        <span className="bg-black/80 text-green-400 text-[10px] px-2 rounded border border-green-900">
            SYSTEM ONLINE: {location.pathname}
        </span>
      </div>

      {/* 1. Barra de Navegación (Pasa los nodos para el status del cluster) */}
      <TopNav clusterNodes={nodes} />

      {/* 2. SISTEMA DE RUTAS (Reemplaza al Switch Case) */}
      <main className="flex-grow transition-opacity duration-500 ease-in-out">
        <Routes>
          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* --- VISTAS PRINCIPALES --- */}
          <Route path="/dashboard" element={<Dashboard nodes={nodes} chartData={chartData} />} />
          <Route path="/labs" element={<LabCatalog onNavigate={handleNavigation} />} />
          <Route path="/ai-predictive" element={<AIPredictiva />} />
          <Route path="/data-science" element={<DataScienceLab />} />

          {/* --- LABORATORIOS ESPECÍFICOS --- */}
          <Route path="/labs/robotics" element={<RoboticsLab />} /> {/* Tu nuevo lab */}
          <Route path="/advanced-math" element={<AdvancedMathLab onNavigate={handleNavigation} />} />
          <Route path="/advanced-math-v2" element={<AdvancedMathLabV2 />} />
          <Route path="/lab-embedded" element={<EmbeddedLab />} />
          <Route path="/lab-telecom" element={<TelecomLab />} />
          <Route path="/lab-electronics" element={<ElectronicsLab onNavigate={handleNavigation} />} />

          {/* --- KNOWLEDGE HUB (MVP — FASE 8D, entrada principal — FASE 9A) --- */}
          <Route path="/knowledge" element={<KnowledgeHubLayout />} />
          <Route path="/knowledge/doc/:docId" element={<KnowledgeHubLayout />} />

          {/* --- ERROR 404 --- */}
          <Route path="*" element={
            <div className="pt-32 text-center text-white">
              <h1 className="text-4xl" style={{color: NEON_COLORS.alert}}>404</h1>
              <p>Ruta no encontrada: {location.pathname}</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-4 py-2 border rounded"
                style={{borderColor: NEON_COLORS.primary, color: NEON_COLORS.primary}}
              >
                Volver al Dashboard
              </button>
            </div>
          } />
        </Routes>
      </main>

      {/* 3. ASISTENTE DE VOZ (Siempre visible) */}
      <VoiceAssistant onNavigate={handleNavigation} />
      
    </div>
  );
};

// --- COMPONENTE RAÍZ (Provee Router y Auth) ---
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;