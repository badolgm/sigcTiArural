import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Box, 
  Cpu, 
  Globe, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Play, 
  RefreshCw, 
  Settings, 
  Share2, 
  Terminal, 
  Zap,
  ExternalLink,
  Code,
  BookOpen,
  Grid,
  Sigma
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURACIÓN ESTÉTICA (NEON THEME) ---
const NEON_COLORS = {
  primary: '#00f3ff',   // Cyan Cyberpunk
  secondary: '#bc13fe', // Purple Neon
  success: '#0aff0a',   // Hacker Green
  warning: '#fzp202',   // Orange
  danger: '#ff003c',    // Red Glitch
  quantum: '#7df9ff',   // Electric Blue
  background: '#050510',
  card: '#0a0a1f'
};

const THEMES = {
  quantum: { color: NEON_COLORS.quantum, icon: Cpu, label: 'Simulador Cuántico' },
  vector: { color: NEON_COLORS.secondary, icon: Box, label: 'Espacios Vectoriales' },
  calculus: { color: NEON_COLORS.warning, icon: Activity, label: 'Cálculo Dinámico' },
  resources: { color: NEON_COLORS.success, icon: Globe, label: 'Recursos Externos' }
};

// --- COMPONENTES AUXILIARES ---

// 1. Terminal Python Global (Pyodide Integration)
const PyodideTerminal = ({ isVisible, onClose }) => {
  const [output, setOutput] = useState(['>>> Inicializando entorno científico...', '>>> Pyodide cargando...']);
  const [input, setInput] = useState('');
  const [isReady, setIsReady] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [output]);

  useEffect(() => {
    const initPyodide = async () => {
      // Evitar recarga si ya existe en window
      if (window.__pyodide) {
        setIsReady(true);
        setOutput(prev => [...prev, '>>> Sistema listo. Librerías: numpy, sympy, pandas disponibles.']);
        return;
      }

      try {
        if (!window.loadPyodide) {
           const s = document.createElement('script');
           s.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
           document.head.appendChild(s);
           await new Promise(r => s.onload = r);
        }
        
        const pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
        
        // Cargar paquetes científicos
        await pyodide.loadPackage(['micropip', 'numpy', 'pandas']);
        await pyodide.runPythonAsync(`
          import micropip
          try:
              await micropip.install('sympy==1.12')
          except:
              pass
        `);
        
        window.__pyodide = pyodide;
        setIsReady(true);
        setOutput(prev => [...prev, '>>> Pyodide cargado correctamente.', '>>> Puedes ejecutar código Python real aquí.']);
      } catch (err) {
        setOutput(prev => [...prev, `!!! Error de carga: ${err.message}`]);
      }
    };

    if (isVisible) initPyodide();
  }, [isVisible]);

  const handleRun = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const cmd = input;
    setInput('');
    setOutput(prev => [...prev, `>>> ${cmd}`]);
    
    try {
      if (!window.__pyodide) throw new Error('El kernel aún no está listo.');
      
      // Capturar stdout
      window.__pyodide.runPython(`
        import sys, io
        sys.stdout = io.StringIO()
      `);
      
      const result = await window.__pyodide.runPythonAsync(cmd);
      const stdout = window.__pyodide.runPython("sys.stdout.getvalue()");
      
      if (stdout) setOutput(prev => [...prev, stdout]);
      if (result !== undefined) setOutput(prev => [...prev, String(result)]);
    } catch (err) {
      setOutput(prev => [...prev, `Error: ${err}`]);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 bg-black border-t-2 z-50 flex flex-col font-mono text-sm shadow-[0_-5px_20px_rgba(0,0,0,0.8)]" 
         style={{ borderColor: NEON_COLORS.secondary }}>
      <div className="flex justify-between items-center px-4 py-1 bg-gray-900 border-b border-gray-800">
        <span className="text-green-400 flex items-center gap-2"><Terminal size={14}/> Python Scientific Console</span>
        <div className="flex gap-2">
            <span className="text-xs text-gray-500">numpy, pandas, sympy ready</span>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><Minimize2 size={14}/></button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-black/90 text-green-300" ref={scrollRef}>
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap font-mono">{line}</div>
        ))}
      </div>
      <form onSubmit={handleRun} className="flex border-t border-gray-800">
        <span className="p-2 text-green-500 font-bold">{'>'}</span>
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent text-white p-2 focus:outline-none font-mono"
          placeholder={isReady ? "Escribe código Python aquí... (ej: import numpy as np)" : "Cargando kernel..."}
          disabled={!isReady}
        />
      </form>
    </div>
  );
};

// 2. Componente de Recursos Externos (PRESERVADO Y MEJORADO)
const ExternalResources = () => (
  <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
            <Globe className="text-blue-400" />
            Centro de Recursos Científicos
        </h2>
        <p className="text-gray-300 mb-6">
            Acceso directo a las herramientas y laboratorios más avanzados del mundo. 
            Estos enlaces son vitales para profundizar en la computación cuántica y matemáticas avanzadas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
            { 
                label: 'IBM Quantum Experience', 
                href: 'https://quantum-computing.ibm.com/', 
                desc: 'Ejecuta circuitos en hardware cuántico real de IBM.',
                color: '#6f42c1'
            },
            { 
                label: 'Qiskit (Python Framework)', 
                href: 'https://qiskit.org/', 
                desc: 'Documentación oficial del SDK cuántico más usado.',
                color: '#8a3ffc'
            },
            { 
                label: 'PennyLane AI', 
                href: 'https://pennylane.ai/', 
                desc: 'Librería líder para Machine Learning Cuántico (QML).',
                color: '#20c997'
            },
            { 
                label: 'Google Quantum AI (Cirq)', 
                href: 'https://quantumai.google/cirq', 
                desc: 'Herramientas de Google para procesadores NISQ.',
                color: '#ea4335'
            },
            { 
                label: 'Wolfram Alpha', 
                href: 'https://www.wolframalpha.com/', 
                desc: 'Motor de conocimiento computacional.',
                color: '#dd1100'
            },
            { 
                label: 'Desmos Graphing', 
                href: 'https://www.desmos.com/calculator', 
                desc: 'Calculadora gráfica avanzada en línea.',
                color: '#138936'
            },
            { 
                label: 'Overleaf LaTeX', 
                href: 'https://www.overleaf.com/', 
                desc: 'Editor colaborativo de LaTeX para papers científicos.',
                color: '#47ba04'
            },
            { 
                label: 'ArXiv.org (Math/Quantum)', 
                href: 'https://arxiv.org/list/quant-ph/recent', 
                desc: 'Últimos papers de investigación en Física Cuántica.',
                color: '#b31b1b'
            }
            ].map((r) => (
            <a 
                key={r.href} 
                href={r.href} 
                target="_blank" 
                rel="noreferrer"
                className="group relative p-5 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: r.color }}></div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">{r.label}</h3>
                    <ExternalLink size={18} className="text-gray-500 group-hover:text-white" />
                </div>
                <p className="text-sm text-gray-400 mb-3">{r.desc}</p>
                <div className="flex items-center gap-1 text-xs font-mono text-gray-500 bg-black/30 p-1 rounded truncate">
                    <Globe size={10} />
                    <span className="truncate">{r.href}</span>
                </div>
            </a>
            ))}
        </div>
    </div>
  </div>
);

// 3. Simulador Cuántico Refactorizado
const QuantumSimulator = () => {
  const [qubits, setQubits] = useState([{ id: 0, state: [1, 0], gates: [] }]);
  
  const addGate = (gate) => {
    setQubits(prev => prev.map(q => ({
      ...q,
      gates: [...q.gates, gate]
    })));
  };

  const reset = () => {
      setQubits([{ id: 0, state: [1, 0], gates: [] }]);
  };

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex-1 bg-black/40 rounded-xl border border-gray-700 p-4 relative overflow-hidden">
        {/* Visualización del Circuito */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <Cpu size={300} />
        </div>
        
        <div className="relative z-10 space-y-8">
            {qubits.map(q => (
                <div key={q.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-cyan-500 flex items-center justify-center font-mono text-xl shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                        |0⟩
                    </div>
                    <div className="h-1 bg-gray-700 flex-1 relative flex items-center px-4 gap-2 overflow-x-auto">
                        {q.gates.map((g, i) => (
                            <motion.div 
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-10 h-10 bg-gray-900 border border-cyan-400 flex items-center justify-center font-bold text-cyan-300 rounded shadow-sm"
                            >
                                {g}
                            </motion.div>
                        ))}
                        <div className="w-full h-[1px] bg-gray-600 absolute -z-10"></div>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-600 flex items-center justify-center text-gray-400">
                        M
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Panel de Control Inferior */}
      <div className="h-32 mt-4 bg-gray-900/80 rounded-xl border border-gray-700 p-4 flex items-center gap-4">
        <div className="grid grid-cols-4 gap-2 w-full max-w-2xl">
            {['H', 'X', 'Y', 'Z', 'CNOT', 'SWAP', 'T', 'S'].map(gate => (
                <button 
                    key={gate}
                    onClick={() => addGate(gate)}
                    className="p-2 bg-gray-800 hover:bg-cyan-900/30 border border-gray-600 hover:border-cyan-400 text-cyan-300 rounded transition-all font-mono font-bold"
                >
                    {gate}
                </button>
            ))}
        </div>
        <div className="h-full w-[1px] bg-gray-700 mx-2"></div>
        <div className="flex flex-col gap-2">
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 border border-red-800 rounded hover:bg-red-900/50">
                <RefreshCw size={16} /> Reset
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-900/30 text-green-400 border border-green-800 rounded hover:bg-green-900/50">
                <Play size={16} /> Simular
            </button>
        </div>
      </div>
    </div>
  );
};

// 4. Transformaciones Vectoriales Refactorizado
const VectorTransform = () => {
    const canvasRef = useRef(null);
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        const drawGrid = () => {
            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 1;

            for(let i=0; i<w; i+=20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
            for(let i=0; i<h; i+=20) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }

            // Ejes
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
        };

        const drawVector = () => {
            const baseVec = { x: 50, y: -50 }; // Vector base
            
            // Transformación
            const rad = (rotation * Math.PI) / 180;
            const tx = (baseVec.x * Math.cos(rad) - baseVec.y * Math.sin(rad)) * scale;
            const ty = (baseVec.x * Math.sin(rad) + baseVec.y * Math.cos(rad)) * scale;

            ctx.strokeStyle = NEON_COLORS.secondary;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + tx, cy + ty);
            ctx.stroke();

            // Punta de flecha
            ctx.fillStyle = NEON_COLORS.secondary;
            ctx.beginPath();
            ctx.arc(cx + tx, cy + ty, 4, 0, Math.PI * 2);
            ctx.fill();
        };

        let animId;
        const render = () => {
            drawGrid();
            drawVector();
            animId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animId);
    }, [rotation, scale]);

    return (
        <div className="flex h-full gap-4">
            <div className="flex-1 bg-black rounded-xl overflow-hidden border border-gray-700 relative">
                <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={600} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/60 p-2 rounded text-xs text-purple-300 font-mono">
                    Espacio Vectorial R²
                </div>
            </div>
            
            <div className="w-64 bg-gray-900/80 p-4 rounded-xl border border-gray-700 flex flex-col gap-6">
                <h3 className="text-purple-400 font-bold flex items-center gap-2">
                    <Settings size={18} /> Controles
                </h3>
                
                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Rotación ({rotation}°)</label>
                    <input 
                        type="range" min="0" max="360" 
                        value={rotation} 
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-full accent-purple-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Escala (x{scale})</label>
                    <input 
                        type="range" min="0.1" max="3" step="0.1"
                        value={scale} 
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full accent-purple-500"
                    />
                </div>

                <div className="mt-auto p-3 bg-gray-800 rounded border border-gray-600">
                    <h4 className="text-xs font-bold text-gray-300 mb-2">Matriz de Transformación</h4>
                    <div className="grid grid-cols-2 gap-1 text-center font-mono text-sm text-purple-300">
                        <div className="bg-black/50 p-1 rounded">{(Math.cos(rotation*Math.PI/180)*scale).toFixed(2)}</div>
                        <div className="bg-black/50 p-1 rounded">{(-Math.sin(rotation*Math.PI/180)*scale).toFixed(2)}</div>
                        <div className="bg-black/50 p-1 rounded">{(Math.sin(rotation*Math.PI/180)*scale).toFixed(2)}</div>
                        <div className="bg-black/50 p-1 rounded">{(Math.cos(rotation*Math.PI/180)*scale).toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 5. Visualización Matemática (Ondas)
const MathVisualization = () => {
    const [data, setData] = useState([]);
    
    useEffect(() => {
        const generateData = () => {
            const d = [];
            for (let i = 0; i <= 360; i += 5) {
                const rad = (i * Math.PI) / 180;
                d.push({
                    angle: i,
                    sin: Math.sin(rad),
                    cos: Math.cos(rad),
                    tan: Math.tan(rad) > 10 ? 10 : (Math.tan(rad) < -10 ? -10 : Math.tan(rad))
                });
            }
            setData(d);
        };
        generateData();
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 bg-gray-900/50 rounded-xl border border-gray-700 p-4 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                        <XAxis dataKey="angle" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                            itemStyle={{ color: '#ccc' }}
                        />
                        <Line type="monotone" dataKey="sin" stroke={NEON_COLORS.warning} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="cos" stroke={NEON_COLORS.primary} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="h-1/3 grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h4 className="text-orange-400 font-bold mb-2">Análisis de Fourier</h4>
                    <p className="text-xs text-gray-400">Visualización de componentes de frecuencia en tiempo real. (Simulación)</p>
                    {/* Placeholder para FFT futura */}
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h4 className="text-cyan-400 font-bold mb-2">Derivadas</h4>
                    <p className="text-xs text-gray-400">Cálculo de pendientes instantáneas.</p>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL: MATH COCKPIT ---
export default function AdvancedMathLab() {
  const [activeTab, setActiveTab] = useState('quantum');
  const [showTerminal, setShowTerminal] = useState(false);

  // Renderizado condicional del contenido principal
  const renderContent = () => {
    switch(activeTab) {
        case 'quantum': return <QuantumSimulator />;
        case 'vector': return <VectorTransform />;
        case 'calculus': return <MathVisualization />;
        case 'resources': return <ExternalResources />;
        default: return <QuantumSimulator />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#050510] text-gray-100 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* 1. Sidebar de Navegación (Compacta) */}
      <div className="w-20 flex flex-col items-center py-6 bg-black border-r border-gray-800 z-20 shadow-[5px_0_20px_rgba(0,0,0,0.5)]">
        <div className="mb-8 p-2 bg-cyan-500/10 rounded-lg">
            <Sigma className="text-cyan-400" size={32} />
        </div>
        
        <nav className="flex-1 flex flex-col gap-6 w-full px-2">
            {Object.entries(THEMES).map(([key, theme]) => {
                const Icon = theme.icon;
                const isActive = activeTab === key;
                return (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`group relative flex items-center justify-center w-full aspect-square rounded-xl transition-all duration-300 ${
                            isActive ? 'bg-gray-800 text-white shadow-[0_0_15px_' + theme.color + '40]' : 'text-gray-500 hover:text-white hover:bg-gray-900'
                        }`}
                        title={theme.label}
                    >
                        <Icon size={24} style={{ color: isActive ? theme.color : undefined }} />
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full" style={{ backgroundColor: theme.color }} />
                        )}
                        
                        {/* Tooltip Hover */}
                        <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-gray-700 transition-opacity">
                            {theme.label}
                        </div>
                    </button>
                );
            })}
        </nav>

        <div className="mt-auto flex flex-col gap-4 w-full px-2">
            <button 
                onClick={() => setShowTerminal(!showTerminal)}
                className={`flex items-center justify-center w-full aspect-square rounded-xl transition-all ${
                    showTerminal ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-gray-500 hover:text-green-400 hover:bg-gray-900'
                }`}
                title="Terminal Python"
            >
                <Terminal size={20} />
            </button>
            <button className="text-gray-600 hover:text-white transition-colors">
                <Settings size={20} />
            </button>
        </div>
      </div>

      {/* 2. Área Principal (Stage) */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header Contextual */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-black/50 backdrop-blur-sm">
            <div>
                <h1 className="text-xl font-bold flex items-center gap-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        {THEMES[activeTab].label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-gray-700 text-gray-500 font-mono">v3.1.0</span>
                </h1>
                <p className="text-xs text-gray-500 mt-1">Entorno de Simulación Avanzada</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    SISTEMA ONLINE
                </div>
            </div>
        </header>

        {/* Espacio de Trabajo */}
        <main className="flex-1 p-6 overflow-hidden relative">
            {/* Grid de Fondo Decorativo */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </main>
      </div>

      {/* 3. Terminal Global (Overlay) */}
      <PyodideTerminal isVisible={showTerminal} onClose={() => setShowTerminal(false)} />

    </div>
  );
}
