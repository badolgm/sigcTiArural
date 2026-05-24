import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Importación de helpers matemáticos puros unificados
import {
  getInitialQubits,
  appendGateToQubit,
  resetQubitGates,
  generateWaveData,
  getTransformationMatrix
} from './mathHelpers';

// --- CONFIGURACIÓN ESTÉTICA (NEON THEME) ---
const NEON_COLORS = {
  primary: '#00f3ff',   // Cyan Cyberpunk
  secondary: '#bc13fe', // Purple Neon
  success: '#0aff0a',   // Hacker Green
  warning: '#ffa500',   // Orange corregido (#fzp202 era inválido)
  danger: '#ff003c',    // Red Glitch
  quantum: '#7df9ff',   // Electric Blue
  background: '#050510',
  card: '#0a0a1f'
};

const THEMES = {
  cyberpunk: { primary: NEON_COLORS.primary, bg: NEON_COLORS.background, card: NEON_COLORS.card }
};

// --- COMPONENTES AUXILIARES ---

// 1. Terminal Python Global (Pyodide Integration con Cleanup Seguro)
const PyodideTerminal = ({ isVisible, onClose }) => {
  const [output, setOutput] = useState(['>>> Inicializando entorno científico...', '>>> Pyodide cargando...']);
  const [input, setInput] = useState('');
  const [isReady, setIsReady] = useState(false);
  const scrollRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    let scriptElement = null;

    const initPyodide = async () => {
      if (window.__pyodide) {
        setIsReady(true);
        setOutput(prev => [...prev, '>>> Sistema listo. Librerías: numpy, sympy, pandas disponibles.']);
        return;
      }

      try {
        if (!window.loadPyodide) {
          scriptElement = document.createElement('script');
          scriptElement.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
          scriptElement.async = true;
          document.head.appendChild(scriptElement);
          await new Promise(r => scriptElement.onload = r);
        }

        const pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });

        await pyodide.loadPackage(['micropip', 'numpy', 'pandas']);
        await pyodide.runPythonAsync(`
          import micropip
          try:
              await micropip.install('sympy')
          except:
              pass
        `);

        if (isMounted.current) {
          window.__pyodide = pyodide;
          setIsReady(true);
          setOutput(prev => [...prev, '>>> Pyodide cargado correctamente.', '>>> Puedes ejecutar código Python real aquí.']);
        }
      } catch (err) {
        if (isMounted.current) {
          setOutput(prev => [...prev, `!!! Error de carga: ${err.message}`]);
        }
      }
    };

    if (isVisible) initPyodide();

    return () => {
      if (scriptElement && document.head.contains(scriptElement)) {
        document.head.removeChild(scriptElement);
      }
    };
  }, [isVisible]);

  const handleRun = async (e) => {
    if (e.key !== 'Enter' || !input.trim()) return;
    const cmd = input;
    setInput('');
    setOutput(prev => [...prev, `>>> ${cmd}`]);

    try {
      if (!window.__pyodide) throw new Error('El kernel aún no está listo.');

      window.__pyodide.runPython(`
        import sys, io
        sys.stdout = io.StringIO()
      `);

      await window.__pyodide.runPythonAsync(cmd);
      const stdout = window.__pyodide.runPython('sys.stdout.getvalue()');
      
      if (stdout.trim()) {
        setOutput(prev => [...prev, stdout.trim()]);
      }
    } catch (err) {
      setOutput(prev => [...prev, `ValueError: ${err.message}`]);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 bg-black border-t border-gray-800 z-50 flex flex-col font-mono text-xs text-green-400">
      <div className="h-8 bg-gray-900 px-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Terminal size={14} />
          <span>PYTHON CORE SCIENTIFIC SHELL v3.11</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-1">
        {output.map((line, i) => <div key={i} className="whitespace-pre-wrap">{line}</div>)}
      </div>
      <div className="h-10 bg-gray-950 border-t border-gray-900 px-4 flex items-center gap-2">
        <span>&gt;&gt;&gt;</span>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleRun}
          disabled={!isReady}
          className="flex-1 bg-transparent border-none outline-none text-gray-200"
          placeholder={isReady ? "Escribe código de computación matemática (ej. import numpy as np) y presiona Enter..." : "Cargando kernel..."}
        />
      </div>
    </div>
  );
};

// 2. Componente de Recursos Externos
const resourceData = [
  { label: 'IBM Quantum Experience', href: 'https://quantum-computing.ibm.com/', desc: 'Ejecuta circuitos en hardware cuántico real de IBM.', color: '#6f42c1' },
  { label: 'Qiskit (Python Framework)', href: 'https://qiskit.org/', desc: 'Documentación oficial del SDK cuántico más usado.', color: '#8a3ffc' },
  { label: 'PennyLane AI', href: 'https://pennylane.ai/', desc: 'Librería líder para Machine Learning Cuántico (QML).', color: '#20c997' },
  { label: 'Google Quantum AI (Cirq)', href: 'https://quantumai.google/cirq', desc: 'Herramientas de Google para procesadores NISQ.', color: '#ea4335' },
  { label: 'Wolfram Alpha', href: 'https://www.wolframalpha.com/', desc: 'Motor de conocimiento computacional.', color: '#dd1100' },
  { label: 'Desmos Graphing', href: 'https://www.desmos.com/calculator', desc: 'Calculadora gráfica avanzada en línea.', color: '#138936' },
  { label: 'Overleaf LaTeX', href: 'https://www.overleaf.com/', desc: 'Editor colaborativo de LaTeX para papers científicos.', color: '#47ba04' },
  { label: 'ArXiv.org (Math/Quantum)', href: 'https://arxiv.org/list/quant-ph/recent', desc: 'Últimos papers de investigación en Física Cuántica.', color: '#b31b1b' }
];

const ExternalResources = () => (
  <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-cyan-400">
        <BookOpen size={20} /> Ecosistema de Computación Avanzada e Investigación
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Enlaces sugeridos y herramientas académicas internacionales para expandir el desarrollo y diseño de algoritmos complejos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resourceData.map((r) => (
          <a 
            key={r.href}
            href={r.href} 
            target="_blank" 
            rel="noreferrer"
            className="p-4 rounded-xl bg-gray-950/60 border border-gray-800 hover:border-gray-700 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400" style={{ borderLeft: `3px solid ${r.color}` }}>
                  {r.label}
                </span>
                <ExternalLink size={14} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{r.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

// 3. Simulador Cuántico (Corregido y Acoplado con mathHelpers multi-qubit)
const GATES_LIST = ['H', 'X', 'Y', 'Z', 'CNOT', 'SWAP', 'T', 'S'];

const QuantumSimulator = () => {
  const [qubits, setQubits] = useState(getInitialQubits());
  const [selectedQubit, setSelectedQubit] = useState(0);

  const addGate = useCallback((gate) => {
    setQubits(prev => appendGateToQubit(prev, selectedQubit, gate));
  }, [selectedQubit]);

  const reset = useCallback(() => {
    setQubits(resetQubitGates(getInitialQubits()));
  }, []);

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex-1 bg-black/40 rounded-xl border border-gray-700 p-6 relative flex flex-col gap-6 overflow-y-auto">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {qubits.map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedQubit(q.id)}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                selectedQubit === q.id 
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' 
                  : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700'
              }`}
            >
              Foco: {q.label}
            </button>
          ))}
        </div>

        {/* Renderizado Dinámico de la Matriz de Qubits del Circuito */}
        <div className="flex flex-col gap-8 my-auto w-full max-w-4xl mx-auto">
          {qubits.map((q) => (
            <div key={q.id} className="flex items-center gap-4 relative">
              <div className="w-16 font-mono text-xs text-cyan-400 font-bold bg-gray-900/80 px-2 py-1 rounded border border-gray-800 text-center">
                {q.label} ({q.state})
              </div>
              
              <div className="flex-1 h-12 bg-gray-950/40 rounded border border-gray-800/60 flex items-center px-4 gap-3 relative overflow-x-auto min-w-[300px]">
                {q.gates.map((g, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 bg-gray-900 border border-cyan-500/80 flex items-center justify-center font-mono font-bold text-xs text-cyan-300 rounded shadow-md flex-shrink-0"
                  >
                    {g}
                  </motion.div>
                ))}
                <div className="w-full h-[1px] bg-gray-700 absolute left-0 right-0 top-1/2 -z-10"></div>
              </div>

              <div className="w-24 text-right font-mono text-[10px] text-gray-500 space-y-0.5">
                <div>P(|0⟩): {q.probability0}%</div>
                <div>P(|1⟩): {q.probability1}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-32 mt-4 bg-gray-900/80 rounded-xl border border-gray-700 p-4 flex items-center gap-4">
        <div className="grid grid-cols-4 gap-2 w-full max-w-2xl">
          {GATES_LIST.map(gate => (
            <button
              key={gate}
              onClick={() => addGate(gate)}
              className="h-10 bg-gray-950 border border-gray-800 rounded font-mono text-xs font-bold text-gray-400 hover:text-cyan-400 hover:border-cyan-500 transition-all active:scale-95"
            >
              {gate}
            </button>
          ))}
        </div>
        <div className="h-full w-[1px] bg-gray-700 mx-2"></div>
        <div className="flex flex-col gap-2">
          <button onClick={reset} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 border border-red-800 rounded hover:bg-red-900/50 w-28 text-xs font-mono">
            <RefreshCw size={14} /> Reset
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-900/30 text-green-400 border border-green-800 rounded hover:bg-green-900/50 w-28 text-xs font-mono">
            <Play size={14} /> Simular
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Transformaciones Vectoriales (Canvas Reactivo Eficiente)
const VectorTransform = () => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;

    for(let i = 0; i < w; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for(let i = 0; i < h; i += 20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    const baseVec = { x: 50, y: -50 };
    const rad = (rotation * Math.PI) / 180;
    const tx = (baseVec.x * Math.cos(rad) - baseVec.y * Math.sin(rad)) * scale;
    const ty = (baseVec.x * Math.sin(rad) + baseVec.y * Math.cos(rad)) * scale;

    ctx.strokeStyle = NEON_COLORS.secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + tx, cy + ty);
    ctx.stroke();

    ctx.fillStyle = NEON_COLORS.secondary;
    ctx.beginPath();
    ctx.arc(cx + tx, cy + ty, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [rotation, scale]);

  const transformationMatrix = useMemo(() => {
    return getTransformationMatrix(rotation, scale);
  }, [rotation, scale]);

  return (
    <div className="flex h-full gap-6 text-white">
      <div className="flex-1 bg-black/40 rounded-xl border border-gray-700 p-4 flex items-center justify-center relative">
        <canvas ref={canvasRef} width={400} height={400} className="border border-gray-800 rounded bg-[#050510]" />
      </div>

      <div className="w-80 bg-gray-900/50 rounded-xl border border-gray-700 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-base font-bold text-cyan-400 mb-1 flex items-center gap-2">
            <Grid size={18} /> Transformaciones R²
          </h2>
          <p className="text-xs text-gray-400">Multiplicación matricial sobre vectores del espacio vectorial bidimensional.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Rotación</span>
              <span className="text-purple-400 font-mono">{rotation}°</span>
            </div>
            <input 
              type="range" min="0" max="360" 
              value={rotation} 
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full accent-cyan-400 bg-gray-950"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Escala</span>
              <span className="text-purple-400 font-mono">x{scale}</span>
            </div>
            <input 
              type="range" min="0.1" max="3" step="0.1" 
              value={scale} 
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-gray-950"
            />
          </div>
        </div>

        <div className="mt-auto p-3 bg-gray-800 rounded border border-gray-600">
          <h4 className="text-xs font-bold text-gray-300 mb-2">Matriz de Transformación</h4>
          <div className="grid grid-cols-2 gap-1 text-center font-mono text-sm text-purple-300">
            <div className="bg-black/50 p-1 rounded">{transformationMatrix.c11}</div>
            <div className="bg-black/50 p-1 rounded">{transformationMatrix.c12}</div>
            <div className="bg-black/50 p-1 rounded">{transformationMatrix.c21}</div>
            <div className="bg-black/50 p-1 rounded">{transformationMatrix.c22}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Visualización Matemática (Ondas Analíticas Optimizadas)
const MathVisualization = () => {
  const data = useMemo(() => {
    return generateWaveData(5);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800/80 h-72">
        <h3 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Activity size={16} /> Funciones de Onda Continuas en Dominio Angular
        </h3>
        <div className="w-full h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16162a" />
              <XAxis dataKey="angle" stroke="#4a5568" fontSize={10} />
              <YAxis stroke="#4a5568" fontSize={10} domain={[-1.2, 1.2]} />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a1f', borderColor: '#334155', fontSize: 11 }} />
              <Line type="monotone" dataKey="sin" stroke={NEON_COLORS.primary} strokeWidth={2} dot={false} name="Seno(θ)" />
              <Line type="monotone" dataKey="cos" stroke={NEON_COLORS.secondary} strokeWidth={2} dot={false} name="Coseno(θ)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h4 className="text-orange-400 font-bold mb-2 text-xs uppercase font-mono">Análisis de Fourier</h4>
          <p className="text-xs text-gray-400">Visualización de componentes de frecuencia en tiempo real. (Simulación)</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h4 className="text-cyan-400 font-bold mb-2 text-xs uppercase font-mono">Derivadas</h4>
          <p className="text-xs text-gray-400">Cálculo de tasas de cambio instantáneas sobre funciones trascendentales continuas.</p>
        </div>
      </div>
    </div>
  );
};

export default function AdvancedMathLab() {
  const [activeTab, setActiveTab] = useState('quantum');
  const [showTerminal, setShowTerminal] = useState(false);

  // Renderizado condicional del contenido mediante callback memorizado
  const renderContent = useCallback(() => {
    switch(activeTab) {
      case 'quantum': return <QuantumSimulator />;
      case 'vector': return <VectorTransform />;
      case 'waves': return <MathVisualization />;
      case 'resources': return <ExternalResources />;
      default: return <QuantumSimulator />;
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen w-full bg-[#050510] text-gray-100 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* 1. Sidebar de Navegación */}
      <div className="w-20 flex flex-col items-center py-6 bg-black border-r border-gray-800 z-20 shadow-[5px_0_20px_rgba(0,0,0,0.5)]">
        <div className="mb-8 p-2 bg-cyan-500/10 rounded-lg">
          <Sigma className="text-cyan-400" size={32} />
        </div>

        <div className="flex flex-col gap-4 w-full px-2">
          {[
            { id: 'quantum', icon: Cpu, label: 'Quantum' },
            { id: 'vector', icon: Box, label: 'Vectores' },
            { id: 'waves', icon: Activity, label: 'Ondas' },
            { id: 'resources', icon: Globe, label: 'Recursos' },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl transition-all gap-1 ${
                  activeTab === tab.id 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
                }`}
              >
                <Icon size={20} />
                <span className="text-[9px] font-medium tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-4 w-full px-2">
          <button
            onClick={() => setShowTerminal(prev => !prev)}
            className={`flex items-center justify-center w-full aspect-square rounded-xl transition-all ${
              showTerminal ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-gray-500 hover:text-green-400 hover:bg-gray-900'
            }`}
          >
            <Terminal size={20} />
          </button>
        </div>
      </div>

      {/* 2. Área Principal (Stage) */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-black/50 backdrop-blur-sm">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-3">
              LABORATORIO MATEMÁTICO AVANZADO 
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 uppercase">
                {activeTab} CORE
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              SISTEMA ONLINE
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-hidden relative">
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

      {/* 3. Terminal Global */}
      <PyodideTerminal isVisible={showTerminal} onClose={() => setShowTerminal(false)} />

    </div>
  );
}