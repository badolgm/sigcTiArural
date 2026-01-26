import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRoboticsApi } from '../hooks/useRoboticsApi';
import ErrorBoundary from '../components/ErrorBoundary';

// Lazy load del componente 3D para evitar bloqueos iniciales
const Telemetry3DScene = React.lazy(() => import('../components/Telemetry3DScene'));

const NEON_COLORS = {
  primary: '#00FFFF', // Cyan
  secondary: '#39FF14', // Neon Green
  alert: '#FF3131', // Plasma Red
  nvidia: '#76b900', // NVIDIA Green
  darkBackground: '#0a0a0a',
  panelBg: '#111111',
};

const Section = ({ title, children, borderColor = NEON_COLORS.primary }) => (
  <div className="p-4 rounded-xl border mb-6 bg-opacity-50 backdrop-blur-sm" 
       style={{ 
         borderColor: borderColor + '55', 
         boxShadow: `0 0 12px ${borderColor}20`,
         backgroundColor: NEON_COLORS.panelBg
       }}>
    <h2 className="text-xl font-bold mb-3 uppercase flex items-center gap-2" 
        style={{ color: borderColor, textShadow: `0 0 10px ${borderColor}80` }}>
      {title}
    </h2>
    {children}
  </div>
);

const ExternalToolCard = ({ title, desc, link, icon, color }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" 
     className="block p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02]"
     style={{ borderColor: color, backgroundColor: 'rgba(0,0,0,0.4)' }}>
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-bold text-lg text-white">{title}</h3>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-sm text-gray-400 mb-3">{desc}</p>
    <div className="text-xs font-mono px-2 py-1 rounded inline-block" 
         style={{ backgroundColor: color + '22', color: color }}>
      ACCESS TOOL →
    </div>
  </a>
);

const RoboticsLab = () => {
  const [activeTab, setActiveTab] = useState('simulation'); // simulation, telemetry, code
  const { telemetry, loading: loadingTelemetry } = useRoboticsApi('PHYSICS-BOT-01');

  return (
    <div className="min-h-screen p-6 pt-24" style={{ backgroundColor: NEON_COLORS.darkBackground, color: 'white' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-8 text-center border-b pb-6" style={{ borderColor: '#333' }}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2"
              style={{ 
                background: `linear-gradient(to right, ${NEON_COLORS.primary}, ${NEON_COLORS.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.3))'
              }}>
            Robótica Avanzada & Gemelos Digitales
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Plataforma de orquestación para simulación física (Newton), renderizado industrial (Omniverse) y control ROS2 en tiempo real.
          </p>
        </header>

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { id: 'simulation', label: '🔌 Motores de Simulación', icon: '🎮' },
            { id: 'telemetry', label: '📊 Telemetría en Vivo', icon: '📡' },
            { id: 'code', label: '💻 Studio Code', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-black scale-105' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
              style={activeTab === tab.id ? { boxShadow: `0 0 15px ${NEON_COLORS.primary}` } : {}}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: VISUALIZATION (Always Visible) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 3D VIEWER */}
            <Section title="Visor de Gemelo Digital (Three.js)" borderColor={NEON_COLORS.primary}>
              <div className="relative rounded-lg overflow-hidden border border-gray-800 bg-black h-[500px]">
                <ErrorBoundary>
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full text-cyan-500 animate-pulse">
                      Cargando Motor Gráfico...
                    </div>
                  }>
                    {/* Pasamos telemetry solo si existe para evitar crash */}
                    {telemetry ? (
                      <Telemetry3DScene telemetryData={telemetry} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="text-4xl mb-4">📡</div>
                        <p>Esperando flujo de datos del robot...</p>
                        <p className="text-xs mt-2 font-mono text-gray-600">Estado: {loadingTelemetry ? 'Conectando...' : 'Desconectado'}</p>
                      </div>
                    )}
                  </Suspense>
                </ErrorBoundary>
                
                {/* Overlay Info */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded border border-gray-700 text-xs font-mono">
                  <span className="text-green-400">● LIVE</span> | FPS: 60 | PING: 24ms
                </div>
              </div>
            </Section>

            {activeTab === 'telemetry' && (
               <Section title="Datos de Sensores" borderColor={NEON_COLORS.secondary}>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {['Joint 1', 'Joint 2', 'Gripper', 'Battery'].map(sensor => (
                      <div key={sensor} className="p-3 bg-gray-900 rounded border border-gray-800">
                        <div className="text-gray-500 text-xs uppercase mb-1">{sensor}</div>
                        <div className="text-xl font-mono text-white">
                          {telemetry ? (Math.random() * 100).toFixed(2) : '--'}
                        </div>
                      </div>
                    ))}
                 </div>
               </Section>
            )}
          </div>

          {/* RIGHT COLUMN: TOOLS & CONTROL */}
          <div className="space-y-6">
            
            {activeTab === 'simulation' && (
              <div className="animate-fade-in space-y-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">INTEGRACIÓN EXTERNA</div>
                
                <ExternalToolCard 
                  title="NVIDIA Omniverse" 
                  desc="Plataforma de colaboración y simulación física fotorrealista (OpenUSD)."
                  link="https://www.nvidia.com/en-us/omniverse/"
                  icon="🌌"
                  color={NEON_COLORS.nvidia}
                />
                
                <ExternalToolCard 
                  title="Newton Physics" 
                  desc="Motor físico acelerado por GPU para robótica (NVIDIA Warp)."
                  link="https://github.com/newton-physics/newton.git"
                  icon="🍎"
                  color="#ff00ff"
                />

                <Section title="Estado del Puente" borderColor={NEON_COLORS.nvidia}>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Backend Script:</span>
                      <span className="text-green-400">newton_bridge.py</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GPU Driver:</span>
                      <span className="text-red-400">NO DETECTADO</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Omniverse Kit:</span>
                      <span className="text-yellow-400">ESPERANDO</span>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {activeTab === 'code' && (
               <Section title="ROS2 Scripting" borderColor="#FFA500">
                 <textarea 
                   className="w-full h-64 bg-gray-900 text-gray-300 font-mono text-xs p-4 rounded border border-gray-700 focus:outline-none focus:border-orange-500"
                   defaultValue={`# Python ROS2 Node Template
import rclpy
from rclpy.node import Node

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        
    def move_arm(self, x, y, z):
        # Implementar cinemática inversa aquí
        pass
`}
                 />
                 <button className="w-full mt-2 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded text-sm transition-colors">
                   DEPLOY TO ROBOT
                 </button>
               </Section>
            )}

            <div className="p-4 rounded border border-gray-800 bg-gray-900">
               <h3 className="text-sm font-bold text-gray-400 mb-2">DOCUMENTACIÓN TÉCNICA</h3>
               <ul className="space-y-2 text-xs">
                 <li><a href="/docs/architecture/simulation_stack.md" className="text-cyan-400 hover:underline">📄 Arquitectura Omniverse/Newton</a></li>
                 <li><a href="/docs/architecture/robotics_contracts.md" className="text-cyan-400 hover:underline">📄 Contratos de Interfaz</a></li>
               </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoboticsLab;