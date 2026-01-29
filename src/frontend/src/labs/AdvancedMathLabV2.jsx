import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLabStore } from '../stores/useLabStore';

const AdvancedMathLabV2 = () => {
  const electronicsData = useLabStore((state) => state.electronicsData);

  useEffect(() => {
    // Generamos partículas simples de fondo
    const container = document.querySelector('.particles');
    if (!container) return;
    const count = 60;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
      container.appendChild(p);
    }
    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #2d1b69 100%)', color: 'white' }}>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: 'Rajdhani', sans-serif; }
        .particles { position: fixed; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none; }
        .particle { position:absolute; width:2px; height:2px; background:#00ffff; border-radius:50%; animation: float 6s ease-in-out infinite; opacity:0.7; }
        @keyframes float { 0%,100%{ transform: translateY(0px) translateX(0px);} 25%{ transform: translateY(-20px) translateX(10px);} 50%{ transform: translateY(-40px) translateX(-10px);} 75%{ transform: translateY(-20px) translateX(5px);} }
        .game-container { max-width: 1200px; margin:0 auto; padding:20px; position:relative; z-index:10; }
        .quantum-header { text-align:center; margin-bottom:30px; position:relative; }
        .quantum-title { font-family:'Orbitron', monospace; font-size:2.6rem; font-weight:900; background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; text-shadow:0 0 30px rgba(0,255,255,0.5); margin-bottom:15px; animation:titleGlow 3s ease-in-out infinite; }
        @keyframes titleGlow { 0%,100%{ filter:brightness(1) hue-rotate(0deg);} 50%{ filter:brightness(1.2) hue-rotate(30deg);} }
        .doctor-avatar { width:100px; height:100px; background: radial-gradient(circle, #00ffff, #0080ff); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:3rem; margin:0 auto 20px; border:3px solid #00ffff; box-shadow:0 0 30px rgba(0,255,255,0.6); animation: avatarPulse 2s ease-in-out infinite; }
        @keyframes avatarPulse { 0%,100%{ transform:scale(1); box-shadow:0 0 30px rgba(0,255,255,0.6);} 50%{ transform:scale(1.05); box-shadow:0 0 50px rgba(0,255,255,0.8);} }
        .stats-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:20px; margin-bottom:30px; }
        .stat-panel { background: linear-gradient(145deg, rgba(0,255,255,0.1), rgba(255,0,255,0.1)); border:2px solid #00ffff; border-radius:15px; padding:20px; text-align:center; position:relative; overflow:hidden; }
        .stat-panel::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background: linear-gradient(45deg, transparent, rgba(0,255,255,0.1), transparent); animation: scanLine 3s linear infinite; }
        @keyframes scanLine { 0%{ transform: translateX(-100%) translateY(-100%) rotate(45deg);} 100%{ transform: translateX(100%) translateY(100%) rotate(45deg);} }
        .stat-value { font-family:'Orbitron', monospace; font-size:2rem; font-weight:700; color:#00ffff; margin-bottom:5px; }
        .stat-label { font-size:0.9rem; color:#cccccc; text-transform:uppercase; letter-spacing:1px; }
        .lab-modes { display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:30px; }
        .mode-card { background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,255,255,0.05)); border:2px solid transparent; border-radius:20px; padding:25px; cursor:pointer; transition: all 0.3s ease; position:relative; overflow:hidden; text-align:center; }
        .mode-card:hover { transform: translateY(-10px); border-color:#00ffff; box-shadow:0 20px 40px rgba(0,255,255,0.3); }
        .mode-card.active { border-color:#ff00ff; background: linear-gradient(145deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1)); }
        .mode-icon { font-size:3rem; margin-bottom:15px; background: linear-gradient(45deg, #00ffff, #ff00ff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        .interactive-section { background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,255,255,0.05)); border:2px solid #00ffff55; border-radius:16px; padding:16px; margin-bottom:24px; }
        .controls { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap:12px; margin-top:8px; margin-bottom:12px; }
        .ctrl { display:flex; flex-direction:column; gap:6px; }
        .ctrl label { font-size:0.85rem; color:#b0b8c0; }
        .ctrl input { width:100%; }
        .matrix { display:grid; grid-template-columns: repeat(2, 100px); gap:8px; margin-top:8px; }
        .matrix div { background:#0d0d1f; border:1px solid #00ffff55; padding:6px; text-align:center; border-radius:8px; }
        .svg-wrap { background:#0d0d1f; border:1px solid #00ffff33; border-radius:12px; padding:8px; overflow:hidden; }
      `}</style>

      <div className="particles" aria-hidden="true"></div>
      <div className="game-container">
        <div className="quantum-header">
          <div className="doctor-avatar"><span className="fa-solid fa-brain" aria-hidden="true"></span></div>
          <h1 className="quantum-title">Laboratorio Cuántico del Dr. Binary</h1>
          <p style={{ color: '#cccccc' }}>Explora visualizaciones y experimentos interactivos de matemáticas avanzadas.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-panel" style={{ borderColor: electronicsData?.active ? '#39FF14' : '#555', background: electronicsData?.active ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.05)' }} onClick={() => document.getElementById('section-real-signal')?.scrollIntoView({behavior:'smooth'})} role="button">
            <div className="stat-value" style={{ color: electronicsData?.active ? '#39FF14' : '#777' }}>⚡</div>
            <div className="stat-label">{electronicsData?.active ? 'Señal Entrante' : 'Sin Señal'}</div>
            <div className="text-xs mt-2" style={{ color: electronicsData?.active ? '#86efac' : '#777', whiteSpace: 'pre-line' }}>
              {electronicsData?.active 
                ? `${electronicsData.signals.description || 'Datos de Electrónica'}\nFreq: ${electronicsData.params.vinFreq} Hz | Amp: ${electronicsData.params.vinAmp} V`
                : 'Activa el circuito en\nLaboratorio de Electrónica'}
            </div>
          </div>
          <div className="stat-panel" onClick={() => document.getElementById('section-integrals')?.scrollIntoView({behavior:'smooth'})} role="button" aria-label="Ir a Integrales">
            <div className="stat-value">∫</div>
            <div className="stat-label">Integrales</div>
          </div>
          <div className="stat-panel" onClick={() => document.getElementById('section-eigen')?.scrollIntoView({behavior:'smooth'})} role="button" aria-label="Ir a Eigenvalores">
            <div className="stat-value">λ</div>
            <div className="stat-label">Eigenvalores</div>
          </div>
          <div className="stat-panel" onClick={() => document.getElementById('section-signals')?.scrollIntoView({behavior:'smooth'})} role="button" aria-label="Ir a Transformadas">
            <div className="stat-value">ℱ</div>
            <div className="stat-label">Transformadas</div>
          </div>
          <div className="stat-panel" onClick={() => document.getElementById('section-complex')?.scrollIntoView({behavior:'smooth'})} role="button" aria-label="Ir a Complejo">
            <div className="stat-value">ℂ</div>
            <div className="stat-label">Complejo</div>
          </div>
        </div>

        <div className="lab-modes">
          <div className="mode-card">
            <div className="mode-icon">∂</div>
            <h3 style={{ marginBottom: 8 }}>Ecuaciones Diferenciales</h3>
            <p style={{ color: '#cccccc' }}>Resolver `dy/dx + y = e^x` y visualizar soluciones.</p>
          </div>
          <div className="mode-card">
            <div className="mode-icon">R(θ)</div>
            <h3 style={{ marginBottom: 8 }}>Geometría y Álgebra</h3>
            <p style={{ color: '#cccccc' }}>Matrices de rotación y transformaciones lineales en 2D/3D.</p>
          </div>
          <div className="mode-card">
            <div className="mode-icon">ℱ</div>
            <h3 style={{ marginBottom: 8 }}>Señales y Transformadas</h3>
            <p style={{ color: '#cccccc' }}>Series de Fourier y transformadas de Laplace y Wavelets.</p>
          </div>
        </div>

        {/* Interactividad real */}
        <DynamicSections electronicsData={electronicsData} />
      </div>
    </div>
  );
};

// --- Helper Components & Functions ---

const downloadCSV = (history, selectedNode) => {
  if (!history || !history[selectedNode]) return;
  const time = history.time;
  const signal = history[selectedNode];
  let csvContent = "data:text/csv;charset=utf-8,Time,Value\n";
  time.forEach((t, i) => {
    csvContent += `${t},${signal[i]}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `signal_${selectedNode}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const PhasePortraitPlot = ({ time, signal, width, height }) => {
  if (!time || !signal || time.length < 2) return null;
  
  // Simple dV/dt calculation
  const dVdt = signal.map((v, i) => {
    if (i === 0) return 0;
    const dt = time[i] - time[i-1];
    return (v - signal[i-1]) / dt;
  });

  const minV = Math.min(...signal);
  const maxV = Math.max(...signal);
  const minDV = Math.min(...dVdt.slice(1));
  const maxDV = Math.max(...dVdt.slice(1));
  
  const rangeV = maxV - minV || 1;
  const rangeDV = maxDV - minDV || 1;

  const padding = 20;
  const mapX = (v) => padding + ((v - minV) / rangeV) * (width - 2*padding);
  const mapY = (dv) => height - padding - ((dv - minDV) / rangeDV) * (height - 2*padding);

  const path = signal.map((v, i) => {
    if (i === 0) return `M ${mapX(v)} ${mapY(dVdt[i])}`;
    return `L ${mapX(v)} ${mapY(dVdt[i])}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
       <rect x="0" y="0" width={width} height={height} fill="#000" />
       {/* Axis */}
       <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#333" />
       <line x1={width/2} y1={padding} x2={width/2} y2={height-padding} stroke="#333" />
       {/* Plot */}
       <path d={path} fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.8" />
       <text x={width-40} y={height/2-5} fill="#666" fontSize="10">V</text>
       <text x={width/2+5} y={20} fill="#666" fontSize="10">dV/dt</text>
    </svg>
  );
};

export default AdvancedMathLabV2;

// --- Componentes Dinámicos ---
const DynamicSections = ({ electronicsData }) => {
  return (
    <div>
      <RealSignalAnalysis electronicsData={electronicsData} />
      <IntegralsInteractive />
      <EigenvaluesInteractive />
      <DiffEqInteractive />
      <GeometryInteractive />
      <SignalsInteractive />
      <ComplexInteractive />
      <FormulasPanel />
    </div>
  );
};

// --- Componente de Análisis de Señal Real (Mejorado) ---
const RealSignalAnalysis = ({ electronicsData }) => {
  const [selectedNode, setSelectedNode] = useState('1');
  const [inputNode, setInputNode] = useState('1'); // Para función de transferencia
  const [showDiffEq, setShowDiffEq] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [harmonicsCount, setHarmonicsCount] = useState(10);

  // Actualizar nodo seleccionado si no existe en los nuevos datos
  useEffect(() => {
    if (electronicsData?.simulationResults?.history) {
      const nodes = Object.keys(electronicsData.simulationResults.history).filter(k => k !== 'time');
      if (!nodes.includes(selectedNode) && nodes.length > 0) setSelectedNode(nodes[0]);
      if (!nodes.includes(inputNode) && nodes.length > 0) setInputNode(nodes[0]);
    }
  }, [electronicsData, selectedNode, inputNode]);

  if (!electronicsData?.active || !electronicsData?.simulationResults?.history) {
    return (
      <div className="interactive-section" id="section-real-signal">
        <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>🔬 Análisis de Señal Real</h3>
        <div className="p-4 border border-dashed border-gray-600 rounded text-center text-gray-400">
          <p>No hay datos de simulación activos.</p>
          <p className="text-sm mt-2">Ve al <strong>Laboratorio de Electrónica</strong>, diseña un circuito y ejecútalo.</p>
        </div>
      </div>
    );
  }

  const history = electronicsData.simulationResults.history;
  const nodes = Object.keys(history).filter(k => k !== 'time');
  const timeData = history.time;
  
  // --- CLIENT-SIDE MATH PROCESSING ---
  // 1. FFT Calculation (Simple implementation for visualization)
  const calculateFFT = (signal, time) => {
      if(!signal || !time || signal.length < 2) return [];
      const N = signal.length;
      const dt = time[1] - time[0];
      const fs = 1/dt;
      
      // Windowing (Hann)
      const windowed = signal.map((v, i) => v * (0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)))));
      
      // Simple DFT for first K harmonics (faster than full FFT for visualization)
      const K = 100; // Max frequency bins to compute
      const spectrum = [];
      
      for(let k=0; k<K; k++) {
          let re = 0, im = 0;
          for(let n=0; n<N; n+=4) { // Downsample calculation for speed
              const angle = 2 * Math.PI * k * n / N;
              re += windowed[n] * Math.cos(angle);
              im -= windowed[n] * Math.sin(angle);
          }
          const mag = 2 * Math.sqrt(re*re + im*im) / N; // Normalized magnitude
          const freq = k * fs / N;
          if (freq > 0) spectrum.push({ f: freq, m: mag });
      }
      return spectrum;
  };

  const spectrumData = useMemo(() => calculateFFT(history[selectedNode], timeData), [history, selectedNode, timeData]);
  
  // 2. Transfer Function H(f) = Vout(f) / Vin(f)
  const transferFunction = useMemo(() => {
      if (!showTransfer || inputNode === selectedNode) return null;
      const specIn = calculateFFT(history[inputNode], timeData);
      const specOut = spectrumData; // Already calculated for selectedNode (assumed output)
      
      const tf = [];
      for(let i=0; i<Math.min(specIn.length, specOut.length); i++) {
          const minM = 1e-6;
          const gain = specOut[i].m / (specIn[i].m + minM);
          const gainDB = 20 * Math.log10(gain + minM);
          tf.push({ f: specIn[i].f, gain: gain, db: gainDB });
      }
      return tf;
  }, [showTransfer, inputNode, selectedNode, spectrumData, history, timeData]);


  // SVG Helper
  const width = 500;
  const height = 200;
  const padding = 30;
  
  const selectedSignal = history[selectedNode];
  const minVal = Math.min(...selectedSignal);
  const maxVal = Math.max(...selectedSignal);
  const range = maxVal - minVal || 1;
  
  const mapX = (t) => padding + (t / (timeData[timeData.length-1])) * (width - 2*padding);
  const mapY = (v) => height - padding - ((v - minVal) / range) * (height - 2*padding);
  
  const pathD = timeData.map((t, i) => 
    `${i===0?'M':'L'} ${mapX(t)} ${mapY(history[selectedNode][i])}`
  ).join(' ');

  return (
    <div className="interactive-section" id="section-real-signal">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>🔬 Análisis de Señal Real</h3>
            <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded border border-green-700">Live Data</span>
        </div>
        
        <div className="flex gap-4">
            <div className="flex flex-col">
                <label className="text-[10px] text-gray-400">Nodo Análisis</label>
                <select 
                  value={selectedNode} 
                  onChange={(e) => setSelectedNode(e.target.value)}
                  className="bg-black border border-cyan-500 text-cyan-500 rounded px-2 py-1 text-sm"
                >
                  {nodes.map(n => <option key={n} value={n}>Nodo {n}</option>)}
                </select>
            </div>
            {showTransfer && (
                <div className="flex flex-col">
                    <label className="text-[10px] text-gray-400">Nodo Entrada (Ref)</label>
                    <select 
                      value={inputNode} 
                      onChange={(e) => setInputNode(e.target.value)}
                      className="bg-black border border-purple-500 text-purple-500 rounded px-2 py-1 text-sm"
                    >
                      {nodes.map(n => <option key={n} value={n}>Nodo {n}</option>)}
                    </select>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Time Domain */}
        <div className="bg-black/40 p-2 rounded border border-gray-800">
          <h4 className="text-sm font-semibold mb-2 text-gray-400 flex justify-between">
              <span>Dominio del Tiempo: V(t)</span>
              <span className="text-xs text-cyan-400">T_max: {timeData[timeData.length-1].toFixed(3)}s</span>
          </h4>
          <div className="svg-wrap relative">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
              <rect x="0" y="0" width={width} height={height} fill="#0b0b1a" />
              {/* Grid */}
              <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#222" />
              <line x1={width/2} y1={padding} x2={width/2} y2={height-padding} stroke="#222" />
              <path d={pathD} fill="none" stroke="#39ff14" strokeWidth="2" />
            </svg>
            <div className="absolute top-2 right-2 text-[10px] bg-black/70 p-1 rounded text-green-400 font-mono border border-green-900">
                Vpp: {(maxVal-minVal).toFixed(3)}V
            </div>
          </div>
        </div>

        {/* Frequency Domain (Enhanced) */}
        <div className="bg-black/40 p-2 rounded border border-gray-800">
          <h4 className="text-sm font-semibold mb-2 text-gray-400 flex justify-between">
              <span>Dominio Frecuencia: FFT (Cliente)</span>
              <div className="flex items-center gap-2">
                  <span className="text-[10px]">Armónicos:</span>
                  <input 
                    type="range" min="5" max="50" step="5" 
                    value={harmonicsCount} 
                    onChange={(e) => setHarmonicsCount(Number(e.target.value))}
                    className="w-20 accent-purple-500"
                  />
              </div>
          </h4>
          <div className="svg-wrap">
             {spectrumData.length > 0 ? (
               <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                 <rect x="0" y="0" width={width} height={height} fill="#0b0b1a" />
                 {(() => {
                    const visibleSpectrum = spectrumData.slice(0, harmonicsCount * 2); // Show a bit more range
                    const maxMag = Math.max(...visibleSpectrum.map(s => s.m)) || 1;
                    const maxFreq = visibleSpectrum[visibleSpectrum.length-1]?.f || 1;
                    
                    return visibleSpectrum.map((s, i) => {
                      const x = padding + (s.f / maxFreq) * (width - 2*padding);
                      const h = (s.m / maxMag) * (height - 2*padding);
                      return (
                          <g key={i}>
                            <line x1={x} y1={height-padding} x2={x} y2={height-padding-h} stroke="#ff00ff" strokeWidth="3" opacity="0.7" />
                            {/* Hover effect could be added with more complex code */}
                          </g>
                      );
                    });
                 })()}
                 {/* Axis Labels */}
                 <text x={padding} y={height-5} fill="#666" fontSize="10">0 Hz</text>
                 <text x={width-padding} y={height-5} fill="#666" fontSize="10" textAnchor="end">
                     {(spectrumData[harmonicsCount*2]?.f || 0).toFixed(0)} Hz
                 </text>
               </svg>
             ) : (
               <div className="h-[200px] flex items-center justify-center text-gray-600">
                 Calculando FFT...
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Math Tools Toolbar */}
      <div className="mt-4 p-3 bg-gray-900/50 rounded border border-cyan-900/50 backdrop-blur-sm">
        <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
            <span className="text-lg">🧮</span> Herramientas Matemáticas Avanzadas
        </h4>
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={() => setShowDiffEq(!showDiffEq)}
             className={`px-3 py-1 border rounded text-xs transition flex items-center gap-2 ${showDiffEq ? 'bg-cyan-900 border-cyan-400 text-white' : 'bg-cyan-900/20 border-cyan-700 text-cyan-200 hover:bg-cyan-800/50'}`}
           >
             <span>∂</span> Espacio de Fase (V vs dV/dt)
           </button>
           <button 
             onClick={() => setShowTransfer(!showTransfer)}
             className={`px-3 py-1 border rounded text-xs transition flex items-center gap-2 ${showTransfer ? 'bg-purple-900 border-purple-400 text-white' : 'bg-purple-900/20 border-purple-700 text-purple-200 hover:bg-purple-800/50'}`}
           >
             <span>ℱ</span> Función de Transferencia H(s)
           </button>
           <button 
             onClick={() => downloadCSV(history, selectedNode)}
             className="px-3 py-1 bg-green-900/20 border border-green-700 rounded text-xs hover:bg-green-800/50 transition text-green-200 flex items-center gap-2"
           >
             <span>⬇</span> Exportar CSV
           </button>
        </div>

        {/* Phase Portrait Panel */}
        {showDiffEq && (
          <div className="mt-4 p-4 bg-black/60 rounded border border-cyan-500/30 animate-in fade-in zoom-in duration-300">
             <h5 className="text-cyan-400 font-bold mb-2 text-sm">Análisis en el Espacio de Fases</h5>
             <p className="text-xs text-gray-400 mb-4">
               Visualización de la dinámica del sistema. Ciclos límite indican oscilaciones estables.
             </p>
             <div className="h-64 w-full bg-black rounded relative border border-gray-800">
                <PhasePortraitPlot time={timeData} signal={history[selectedNode]} width={600} height={250} />
             </div>
          </div>
        )}

        {/* Transfer Function / Bode Analysis Panel */}
        {showTransfer && transferFunction && (
          <div className="mt-4 p-4 bg-black/60 rounded border border-purple-500/30 animate-in fade-in zoom-in duration-300">
             <div className="flex justify-between items-start mb-4">
                 <div>
                     <h5 className="text-purple-400 font-bold text-sm">Diagrama de Bode (Magnitud Estimada)</h5>
                     <p className="text-xs text-gray-400">
                       H(f) = Output(Node {selectedNode}) / Input(Node {inputNode}). Muestra la respuesta en frecuencia del sistema.
                     </p>
                 </div>
                 <div className="text-right text-xs text-purple-300 font-mono">
                     Max Gain: {Math.max(...transferFunction.map(t=>t.db)).toFixed(2)} dB
                 </div>
             </div>
             
             <div className="h-64 w-full bg-black rounded relative border border-gray-800 overflow-hidden">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                   <rect width={width} height={height} fill="#050510" />
                   {/* Grid Lines */}
                   {[0.25, 0.5, 0.75].map(p => (
                       <line key={p} x1={0} y1={height*p} x2={width} y2={height*p} stroke="#222" strokeDasharray="2" />
                   ))}
                   
                   {/* Bode Plot Line */}
                   {(() => {
                       const maxDB = 20; // Clamp visuals
                       const minDB = -60;
                       const rangeDB = maxDB - minDB;
                       const maxFreq = transferFunction[transferFunction.length-1].f;
                       
                       const points = transferFunction.map(t => {
                           const x = (t.f / maxFreq) * width;
                           const y = height - ((t.db - minDB) / rangeDB) * height;
                           return `${x},${y}`;
                       }).join(' ');
                       
                       return <polyline points={points} fill="none" stroke="#d946ef" strokeWidth="2" vectorEffect="non-scaling-stroke" />;
                   })()}
                </svg>
                <div className="absolute bottom-1 left-1 text-[10px] text-gray-500">0 Hz</div>
                <div className="absolute bottom-1 right-1 text-[10px] text-gray-500">{(transferFunction[transferFunction.length-1]?.f/1000).toFixed(1)} kHz</div>
                <div className="absolute top-1 left-1 text-[10px] text-gray-500">+20 dB</div>
                <div className="absolute bottom-8 left-1 text-[10px] text-gray-500">-60 dB</div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Integrales robustas: cursor, derivadas, concavidad y Teorema Fundamental del Cálculo
const IntegralsInteractive = () => {
  const [fn, setFn] = useState('sin');
  const [a, setA] = useState(0);
  const [b, setB] = useState(Math.PI);
  const [n, setN] = useState(200);
  const [coeff, setCoeff] = useState({ A: 1, B: 0, C: 0, amp: 1, omega: 1 });
  const [cursorX, setCursorX] = useState(null);

  const f = useCallback((x) => {
    if (fn === 'sin') return coeff.amp * Math.sin(coeff.omega * x);
    if (fn === 'exp') return Math.exp(x);
    return coeff.A * x * x + coeff.B * x + coeff.C;
  }, [fn, coeff]);

  const hBase = useMemo(() => Math.max(1e-4, (b - a) / 1000), [a, b]);
  const fprime = useCallback((x) => (f(x + hBase) - f(x - hBase)) / (2 * hBase), [f, hBase]);
  const fsecond = useCallback((x) => (f(x + hBase) - 2 * f(x) + f(x - hBase)) / (hBase * hBase), [f, hBase]);

  const integralBetween = useCallback((x0, x1, N) => {
    if (x1 < x0) [x0, x1] = [x1, x0];
    const steps = Math.max(2, N);
    const dx = (x1 - x0) / steps;
    let S = 0; let prev = f(x0);
    for (let i = 1; i <= steps; i++) { const xi = x0 + i * dx; const yi = f(xi); S += (prev + yi) * dx / 2; prev = yi; }
    return S;
  }, [f]);

  const [area, path, fillPath, stats] = useMemo(() => {
    const N = Math.max(10, n);
    const xs = []; const dx = (b - a) / N;
    for (let i = 0; i <= N; i++) xs.push(a + i * dx);
    const ys = xs.map((x) => f(x));
    let S = 0; for (let i = 0; i < N; i++) S += (ys[i] + ys[i + 1]) * dx / 2;
    const mapX = (x) => 20 + ((x - a) / (b - a)) * 460;
    const maxY = Math.max(...ys); const minY = Math.min(...ys);
    const mapY = (y) => 180 - ((y - minY) / (maxY - minY + 1e-9)) * 160;
    const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${mapX(x)} ${mapY(f(x))}`).join(' ');
    const fp = `M ${mapX(a)} 180 ` + xs.map((x) => `L ${mapX(x)} ${mapY(f(x))}`).join(' ') + ` L ${mapX(b)} 180 Z`;
    return [S, d, fp, { mapX, mapY, minY, maxY }];
  }, [f, a, b, n]);

  const currentExpr = useMemo(() => {
    if (fn === 'sin') return `${coeff.amp} sin(${coeff.omega} x)`;
    if (fn === 'exp') return 'e^x';
    return `${coeff.A} x^2 + ${coeff.B} x + ${coeff.C}`;
  }, [fn, coeff]);
  const wolframIntegral = useMemo(() => `https://www.wolframalpha.com/input?i=${encodeURIComponent(`integrate ${currentExpr} dx from ${a} to ${b}`)}`,[currentExpr,a,b]);
  const wolframDerivative = useMemo(() => `https://www.wolframalpha.com/input?i=${encodeURIComponent(`derivative of ${currentExpr}`)}`,[currentExpr]);
  const matlabLink = 'https://www.mathworks.com/help/matlab/ref/integral.html';
  const scipyLink = 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.quad.html';

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const x = a + ((px - 20) / 460) * (b - a);
    if (x >= a && x <= b) setCursorX(x);
  };
  const handleLeave = () => setCursorX(null);

  const Fx = useMemo(() => cursorX==null ? null : integralBetween(a, cursorX, Math.max(10, Math.floor(n * Math.max(0, (cursorX - a) / (b - a))))), [cursorX, a, b, n, integralBetween]);

  return (
    <div className="interactive-section" id="section-integrals">
      <h3 className="text-xl font-bold" style={{ color:'#00ffff' }}>Análisis Matemático: Derivadas e Integrales</h3>
      <div className="controls">
        <div className="ctrl"><label>Función</label>
          <select value={fn} onChange={(e)=>setFn(e.target.value)}>
            <option value="sin">{`${coeff.amp}·sin(${coeff.omega}x)`}</option>
            <option value="exp">e^x</option>
            <option value="poly">A x^2 + B x + C</option>
          </select>
        </div>
        {fn==='sin' && (
          <>
            <div className="ctrl"><label>Amplitud</label><input type="range" min="0" max="3" step="0.1" value={coeff.amp} onChange={(e)=>setCoeff({...coeff, amp: parseFloat(e.target.value)})} /></div>
            <div className="ctrl"><label>Frecuencia ω</label><input type="range" min="0.2" max="5" step="0.1" value={coeff.omega} onChange={(e)=>setCoeff({...coeff, omega: parseFloat(e.target.value)})} /></div>
          </>
        )}
        {fn==='poly' && (
          <>
            <div className="ctrl"><label>A (concavidad)</label><input type="range" min="-3" max="3" step="0.1" value={coeff.A} onChange={(e)=>setCoeff({...coeff, A: parseFloat(e.target.value)})} /></div>
            <div className="ctrl"><label>B</label><input type="range" min="-5" max="5" step="0.1" value={coeff.B} onChange={(e)=>setCoeff({...coeff, B: parseFloat(e.target.value)})} /></div>
            <div className="ctrl"><label>C</label><input type="range" min="-5" max="5" step="0.1" value={coeff.C} onChange={(e)=>setCoeff({...coeff, C: parseFloat(e.target.value)})} /></div>
          </>
        )}
        <div className="ctrl"><label>a</label><input type="number" value={a} onChange={(e)=>setA(parseFloat(e.target.value))} /></div>
        <div className="ctrl"><label>b</label><input type="number" value={b} onChange={(e)=>setB(parseFloat(e.target.value))} /></div>
        <div className="ctrl"><label>Subdivisiones N</label><input type="range" min="20" max="1000" step="10" value={n} onChange={(e)=>setN(parseInt(e.target.value))} /></div>
      </div>

      <div className="svg-wrap" onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <svg width="500" height="200" role="img" aria-label="Gráfica de f(x) con área bajo la curva">
          <rect x="0" y="0" width="500" height="200" fill="#0b0b1a" />
          <path d={fillPath} fill="#00ffff22" stroke="none" />
          <path d={path} fill="none" stroke="#00ffff" strokeWidth="2" />
          {cursorX!==null && (
            <>
              <line x1={stats.mapX(cursorX)} x2={stats.mapX(cursorX)} y1={20} y2={180} stroke="#ff3cc7" strokeDasharray="4 4" />
              <circle cx={stats.mapX(cursorX)} cy={stats.mapY(f(cursorX))} r="4" fill="#ff3cc7" />
            </>
          )}
        </svg>
      </div>

      <div className="controls">
        <div className="ctrl">
          <label>Área ∫_a^b f(x) dx (trapecios)</label>
          <span style={{ color:'#aab2ba' }}>{area.toFixed(6)}</span>
        </div>
        {cursorX!==null && (
          <div className="ctrl">
            <label>Mediciones en x={cursorX.toFixed(3)}</label>
            <span className="font-mono" style={{ color:'#e6edf3' }}>f(x)={f(cursorX).toFixed(6)} | f′(x)={fprime(cursorX).toFixed(6)} | f″(x)={fsecond(cursorX).toFixed(6)} ({Math.abs(fsecond(cursorX))<1e-6 ? 'lineal' : fsecond(cursorX)>0 ? 'convexa' : 'cóncava'})</span>
          </div>
        )}
        {cursorX!==null && (
          <div className="ctrl">
            <label>Teorema Fundamental del Cálculo</label>
            <span className="font-mono" style={{ color:'#e6edf3' }}>F(x)=∫_a^x f(t) dt ≈ {Fx?.toFixed(6)} , dF/dx ≈ f(x) = {cursorX!==null?f(cursorX).toFixed(6):''}</span>
          </div>
        )}
      </div>

      <div className="controls">
        <div className="ctrl">
          <label>Recursos avanzados</label>
          <div>
            <a href={wolframIntegral} target="_blank" rel="noreferrer" style={{ marginRight:8, color:'#00ffff' }}>Wolfram: ∫ actual</a>
            <a href={wolframDerivative} target="_blank" rel="noreferrer" style={{ marginRight:8, color:'#00ffff' }}>Wolfram: d/dx actual</a>
            <a href={matlabLink} target="_blank" rel="noreferrer" style={{ marginRight:8, color:'#00ffff' }}>MATLAB integral()</a>
            <a href={scipyLink} target="_blank" rel="noreferrer" style={{ color:'#00ffff' }}>SciPy integrate.quad</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Eigenvalores 2x2
const EigenvaluesInteractive = () => {
  const [a,setA]=useState(1),[b,setB]=useState(0),[c,setC]=useState(0),[d,setD]=useState(1);
  const {lambda1, lambda2, v1, v2} = useMemo(()=>{
    const tr=a+d; const det=a*d-b*c; const disc=Math.sqrt(tr*tr-4*det);
    const l1=(tr+disc)/2, l2=(tr-disc)/2;
    const v1= b!==0 ? [l1-d, b] : [1, (l1-a)];
    const v2= b!==0 ? [l2-d, b] : [1, (l2-a)];
    return {lambda1:l1, lambda2:l2, v1, v2};
  },[a,b,c,d]);
  return (
    <div className="interactive-section" id="section-eigen">
      <h3 className="text-xl font-bold" style={{ color:'#00ffff' }}>Eigenvalores y Eigenvectores (2×2)</h3>
      <div className="controls">
        <div className="ctrl"><label>a</label><input type="number" value={a} onChange={(e)=>setA(parseFloat(e.target.value))} /></div>
        <div className="ctrl"><label>b</label><input type="number" value={b} onChange={(e)=>setB(parseFloat(e.target.value))} /></div>
        <div className="ctrl"><label>c</label><input type="number" value={c} onChange={(e)=>setC(parseFloat(e.target.value))} /></div>
        <div className="ctrl"><label>d</label><input type="number" value={d} onChange={(e)=>setD(parseFloat(e.target.value))} /></div>
      </div>
      <div className="matrix">
        <div>{a.toFixed(2)}</div><div>{b.toFixed(2)}</div><div>{c.toFixed(2)}</div><div>{d.toFixed(2)}</div>
      </div>
      <p style={{color:'#aab2ba'}}>λ₁={lambda1.toFixed(3)} , λ₂={lambda2.toFixed(3)} | v₁≈[{v1.map(v=>v.toFixed(2)).join(', ')}] , v₂≈[{v2.map(v=>v.toFixed(2)).join(', ')}]</p>
    </div>
  );
};

const DiffEqInteractive = () => {
  const [y0, setY0] = useState(1);
  const [xMax, setXMax] = useState(5);
  const [points, path] = useMemo(() => {
    const pts = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (xMax * i) / N;
      const C = y0 - 0.5;
      const y = 0.5 * Math.exp(x) + C * Math.exp(-x);
      pts.push({ x, y });
    }
    const maxY = Math.max(...pts.map((p) => p.y));
    const minY = Math.min(...pts.map((p) => p.y));
    const mapX = (x) => 20 + (x / xMax) * 460;
    const mapY = (y) => 180 - ((y - minY) / (maxY - minY + 1e-9)) * 160;
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x)} ${mapY(p.y)}`).join(' ');
    return [pts, d];
  }, [y0, xMax]);

  return (
    <div className="interactive-section">
      <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>Ecuación Diferencial: dy/dx + y = e^x</h3>
      <div className="controls">
        <div className="ctrl">
          <label>Condición inicial y(0)</label>
          <input type="range" min="-2" max="3" step="0.1" value={y0} onChange={(e) => setY0(parseFloat(e.target.value))} />
          <span style={{ color:'#ccc' }}>y(0) = {y0.toFixed(2)}</span>
        </div>
        <div className="ctrl">
          <label>Rango x</label>
          <input type="range" min="1" max="10" step="1" value={xMax} onChange={(e) => setXMax(parseInt(e.target.value))} />
          <span style={{ color:'#ccc' }}>x ∈ [0, {xMax}]</span>
        </div>
      </div>
      <div className="svg-wrap">
        <svg width="500" height="200" role="img" aria-label="Gráfica solución exacta">
          <defs>
            <linearGradient id="gradLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#00ffff" />
              <stop offset="100%" stopColor="#ff00ff" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="500" height="200" fill="#0b0b1a" />
          <path d={path} fill="none" stroke="url(#gradLine)" strokeWidth="2" />
        </svg>
      </div>
      <p style={{ color:'#aab2ba' }}>Solución exacta: y(x) = 1/2 e^x + (y(0) - 1/2) e^(-x)</p>
    </div>
  );
};

const GeometryInteractive = () => {
  const [theta, setTheta] = useState(30);
  const rad = useMemo(() => (theta * Math.PI) / 180, [theta]);
  const R = useMemo(() => ({
    a: Math.cos(rad), b: -Math.sin(rad), c: Math.sin(rad), d: Math.cos(rad)
  }), [rad]);
  const base = useMemo(() => ([
    { x: -40, y: -40 }, { x: 40, y: -40 }, { x: 40, y: 40 }, { x: -40, y: 40 }, { x: -40, y: -40 }
  ]), []);
  const rot = useMemo(() => base.map(p => ({
    x: R.a * p.x + R.b * p.y, y: R.c * p.x + R.d * p.y
  })), [base, R]);

  const map = (p) => ({ x: 250 + p.x, y: 100 + p.y });
  const pathBase = base.map((p, i) => `${i === 0 ? 'M' : 'L'} ${map(p).x} ${map(p).y}`).join(' ');
  const pathRot = rot.map((p, i) => `${i === 0 ? 'M' : 'L'} ${map(p).x} ${map(p).y}`).join(' ');

  return (
    <div className="interactive-section">
      <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>Geometría: Rotación 2D</h3>
      <div className="controls">
        <div className="ctrl">
          <label>Ángulo θ (grados)</label>
          <input type="range" min="0" max="180" step="1" value={theta} onChange={(e) => setTheta(parseInt(e.target.value))} />
          <span style={{ color:'#ccc' }}>θ = {theta}°</span>
        </div>
      </div>
      <div className="matrix">
        <div>{R.a.toFixed(3)}</div>
        <div>{R.b.toFixed(3)}</div>
        <div>{R.c.toFixed(3)}</div>
        <div>{R.d.toFixed(3)}</div>
      </div>
      <div className="svg-wrap">
        <svg width="500" height="200" role="img" aria-label="Cuadrado base y rotado">
          <rect x="0" y="0" width="500" height="200" fill="#0b0b1a" />
          <path d={pathBase} fill="none" stroke="#555" strokeDasharray="4 4" strokeWidth="2" />
          <path d={pathRot} fill="none" stroke="#00ffff" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

const SignalsInteractive = () => {
  const [f1, setF1] = useState(1);
  const [f3, setF3] = useState(3);
  const [a1, setA1] = useState(1);
  const [a3, setA3] = useState(0.5);
  const [em, setEm] = useState({ fc: 10, fm: 1, depth: 0.7 });
  const [wave, spec] = useMemo(() => {
    const N = 200; const pts = []; const T = 2 * Math.PI;
    for (let i = 0; i <= N; i++) {
      const t = (T * i) / N;
      const y = a1 * Math.sin(f1 * t) + a3 * Math.sin(f3 * t);
      pts.push({ t, y });
    }
    return [pts, [
      { k: f1, amp: Math.abs(a1) },
      { k: f3, amp: Math.abs(a3) },
    ]];
  }, [f1, f3, a1, a3]);

  // Señal EM simple por modulación AM y demodulación (envolvente)
  const [emWave, emDemod] = useMemo(() => {
    const N=400; const pts=[], dem=[]; const dt=1/100;
    for(let i=0;i<N;i++){
      const t=i*dt; const m=Math.sin(2*Math.PI*em.fm*t); // mensaje base
      const s=(1+em.depth*m)*Math.sin(2*Math.PI*em.fc*t); // AM
      pts.push({t,y:s});
      // demodulación por rectificación y filtro (promedio móvil corto)
      const rect=Math.abs(s); dem.push(rect);
    }
    // suavizado simple
    const M=8; const smooth=dem.map((_,i)=>{
      let acc=0,cnt=0; for(let k=-M;k<=M;k++){ const j=i+k; if(j>=0 && j<dem.length){ acc+=dem[j]; cnt++; }}
      return acc/(cnt||1);
    });
    return [pts, smooth.map((y,i)=>({t:i*dt, y}))];
  },[em]);

  const mapX = (t) => 20 + (t / (2 * Math.PI)) * 460;
  const maxY = Math.max(...wave.map((p) => p.y));
  const minY = Math.min(...wave.map((p) => p.y));
  const mapY = (y) => 180 - ((y - minY) / (maxY - minY + 1e-9)) * 160;
  const path = wave.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.t)} ${mapY(p.y)}`).join(' ');

  return (
    <div className="interactive-section" id="section-signals">
      <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>Señales: Serie de Fourier simple</h3>
      <div className="controls">
        <div className="ctrl"><label>f1</label><input type="range" min="1" max="6" value={f1} onChange={(e)=>setF1(parseInt(e.target.value))} /><span style={{color:'#ccc'}}>f1={f1}</span></div>
        <div className="ctrl"><label>a1</label><input type="range" min="0" max="2" step="0.1" value={a1} onChange={(e)=>setA1(parseFloat(e.target.value))} /><span style={{color:'#ccc'}}>a1={a1.toFixed(1)}</span></div>
        <div className="ctrl"><label>f3</label><input type="range" min="1" max="9" value={f3} onChange={(e)=>setF3(parseInt(e.target.value))} /><span style={{color:'#ccc'}}>f3={f3}</span></div>
        <div className="ctrl"><label>a3</label><input type="range" min="0" max="2" step="0.1" value={a3} onChange={(e)=>setA3(parseFloat(e.target.value))} /><span style={{color:'#ccc'}}>a3={a3.toFixed(1)}</span></div>
      </div>
      <div className="svg-wrap" style={{ marginBottom: 12 }}>
        <svg width="500" height="200" role="img" aria-label="Señal en el tiempo">
          <rect x="0" y="0" width="500" height="200" fill="#0b0b1a" />
          <path d={path} fill="none" stroke="#39ff14" strokeWidth="2" />
        </svg>
      </div>
      {/* Panel de derivación y referencias académicas para AM */}
      <div className="interactive-section" style={{ marginTop: 8 }}>
        <h5 className="font-semibold mb-2" style={{ color: '#00ffff' }}>📡 AM: Fórmulas, espectro y derivación</h5>
        <div className="text-sm" style={{ color: '#aab2ba' }}>
          <p>
            Señal AM ideal: <span className="font-mono">s(t) = (1 + m cos(2π f_m t)) cos(2π f_c t)</span>, con
            <span className="font-mono"> 0 ≤ m ≤ 1</span> la profundidad de modulación.
          </p>
          <p style={{ marginTop: 6 }}>
            Usando <span className="font-mono">cos A · cos B = 1/2 [cos(A + B) + cos(A - B)]</span>:
            <br/>
            <span className="font-mono">s(t) = cos(2π f_c t) + (m/2)[cos(2π(f_c + f_m)t) + cos(2π(f_c - f_m)t)]</span>.
            Esto muestra las bandas laterales en <span className="font-mono">f_c ± f_m</span> con amplitud <span className="font-mono">m/2</span>.
          </p>
          <p style={{ marginTop: 6 }}>
            Fourier: el espectro contiene deltas en <span className="font-mono">±f_c</span> y <span className="font-mono">±(f_c ± f_m)</span>.
            Laplace: <span className="font-mono">ℒ(cos(ωt)) = s/(s² + ω²)</span>, dando tres términos racionales.
            Z-transform (discreto): polos en <span className="font-mono">z = e^(±j 2π f_c T)</span> y <span className="font-mono">e^(±j 2π (f_c ± f_m) T)</span>;
            las bandas laterales aparecen alrededor de la portadora.
          </p>
          <p style={{ marginTop: 6 }}>
            Demodulación AM (envolvente): <span className="font-mono">y(t) ≈ |Hilbert[s(t)]|</span> o rectificación + filtrado paso-bajo. En la gráfica inferior se visualiza la envolvente recuperada.
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:8, marginTop:10 }}>
          <a href="https://www.fceia.unr.edu.ar/lsd/" target="_blank" rel="noreferrer" style={{ color:'#ffd32a' }}>Laboratorio de Señales – UNR FCEIA</a>
          <a href="https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/resources/fourier-series/" target="_blank" rel="noreferrer" style={{ color:'#ff3cc7' }}>MIT OCW – Fourier/Laplace</a>
        </div>
      </div>
      <div className="svg-wrap">
        <svg width="500" height="160" role="img" aria-label="Espectro discreto">
          <rect x="0" y="0" width="500" height="160" fill="#0b0b1a" />
          {spec.map((s, i) => (
            <rect key={i} x={40 + i * 60} y={140 - s.amp * 60} width="40" height={s.amp * 60} fill="#ff3cc7" />
          ))}
        </svg>
      </div>
      <h4 className="text-lg font-bold" style={{color:'#ffd32a', marginTop:12}}>Ejemplo EM: Modulación AM y Demodulación</h4>
      <div className="controls">
        <div className="ctrl"><label>f<sub>c</sub> (portadora)</label><input type="range" min="5" max="30" value={em.fc} onChange={(e)=>setEm({...em, fc: parseInt(e.target.value)})} /><span style={{color:'#ccc'}}>fc={em.fc}</span></div>
        <div className="ctrl"><label>f<sub>m</sub> (mensaje)</label><input type="range" min="0" max="10" step="1" value={em.fm} onChange={(e)=>setEm({...em, fm: parseInt(e.target.value)})} /><span style={{color:'#ccc'}}>fm={em.fm}</span></div>
        <div className="ctrl"><label>Profundidad</label><input type="range" min="0" max="1" step="0.05" value={em.depth} onChange={(e)=>setEm({...em, depth: parseFloat(e.target.value)})} /><span style={{color:'#ccc'}}>m={em.depth.toFixed(2)}</span></div>
      </div>
      <div className="svg-wrap" style={{ marginBottom: 12 }}>
        <svg width="500" height="200" role="img" aria-label="Señal AM">
          <rect x="0" y="0" width="500" height="200" fill="#0b0b1a" />
          {(() => {
            const mapX=(t)=>20+(t/(emWave[emWave.length-1]?.t||1))*460;
            const maxY=Math.max(...emWave.map(p=>p.y)); const minY=Math.min(...emWave.map(p=>p.y));
            const mapY=(y)=>180-((y-minY)/(maxY-minY+1e-9))*160;
            const d=emWave.map((p,i)=>`${i===0?'M':'L'} ${mapX(p.t)} ${mapY(p.y)}`).join(' ');
            return <path d={d} fill="none" stroke="#00ffff" strokeWidth="2" />
          })()}
        </svg>
      </div>
      <div className="svg-wrap">
        <svg width="500" height="200" role="img" aria-label="Demodulación (envolvente)">
          <rect x="0" y="0" width="500" height="200" fill="#0b0b1a" />
          {(() => {
            const mapX=(t)=>20+(t/(emDemod[emDemod.length-1]?.t||1))*460;
            const maxY=Math.max(...emDemod.map(p=>p.y)); const minY=Math.min(...emDemod.map(p=>p.y));
            const mapY=(y)=>180-((y-minY)/(maxY-minY+1e-9))*160;
            const d=emDemod.map((p,i)=>`${i===0?'M':'L'} ${mapX(p.t)} ${mapY(p.y)}`).join(' ');
            return <path d={d} fill="none" stroke="#ffd32a" strokeWidth="2" />
          })()}
        </svg>
      </div>
    </div>
  );
};

// Complejo: mapeo z -> z^2 sobre puntos de rejilla
const ComplexInteractive = () => {
  const [scale,setScale]=useState(1);
  const grid=useMemo(()=>{
    const pts=[]; for(let x=-2;x<=2;x+=0.5){ for(let y=-2;y<=2;y+=0.5){ pts.push({x,y}); }}
    return pts;
  },[]);
  const mapped=useMemo(()=>grid.map(p=>({x:p.x*p.x - p.y*p.y, y:2*p.x*p.y})),[grid]);
  const map=(p)=>({x:250 + p.x*30*scale, y:100 - p.y*30*scale});
  return (
    <div className="interactive-section" id="section-complex">
      <h3 className="text-xl font-bold" style={{ color:'#00ffff' }}>Variable Compleja: f(z)=z²</h3>
      <div className="controls"><div className="ctrl"><label>Escala</label><input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={(e)=>setScale(parseFloat(e.target.value))} /><span style={{color:'#ccc'}}>×{scale.toFixed(1)}</span></div></div>
      <div className="svg-wrap">
        <svg width="500" height="200" role="img" aria-label="Mapa complejo">
          <rect x="0" y="0" width="500" height="200" fill="#0b0b1a" />
          {grid.map((p,i)=>{ const m=map({x:p.x,y:p.y}); return <circle key={i} cx={m.x} cy={m.y} r="1.5" fill="#555" />; })}
          {mapped.map((p,i)=>{ const m=map(p); return <circle key={'m'+i} cx={m.x} cy={m.y} r="2" fill="#ff3cc7" />; })}
        </svg>
      </div>
    </div>
  );
};

// Panel de fórmulas con explicaciones rápidas y enlaces académicos reales
const FormulasPanel = () => {
  const formulas=[
    {name:'Transformada de Fourier', expr:'F(ω)=∫ f(t) e^{-iωt} dt', desc:'Series/transformada para análisis espectral de señales.', link:'https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/resources/fourier-series/'},
    {name:'Transformada de Laplace', expr:'L\{f\}(s)=∫₀^∞ f(t)e^{-st} dt', desc:'Sistemas LTI y estabilidad por polos/ceros.', link:'https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/'},
    {name:'Transformada Z (discreta)', expr:'X(z)=Σ x[n] z^{-n}', desc:'DSP y análisis en el plano-z.', link:'https://www.sp4comm.org/webversion.html'},
    {name:'Modulación AM', expr:'s(t)=(1+m cos(2π f_m t)) cos(2π f_c t)', desc:'Portadora y bandas laterales en f_c ± f_m.', link:'https://www.fceia.unr.edu.ar/lsd/'},
    {name:'Álgebra Lineal (Curso UNAL)', expr:'det(A-λI)=0', desc:'Eigenvalores/eigenvectores en cursos reales.', link:'https://ciencias.medellin.unal.edu.co/cursos/algebra-lineal/'},
    {name:'Variable Compleja (IMA UMN)', expr:'f(z)=u+iv', desc:'Funciones analíticas y mapeos conformes.', link:'https://www.ima.umn.edu/~arnold/complex.html'},
  ];
  const [open,setOpen]=useState(null);
  return (
    <div className="interactive-section">
      <h3 className="text-xl font-bold" style={{ color:'#00ffff' }}>📐 Fórmulas y Explicaciones</h3>
      <div className="controls">
        {formulas.map((f,i)=> (
          <div className="ctrl" key={i}>
            <button title={f.desc} onClick={()=>setOpen(i)} style={{border:'1px solid #00ffff55', borderRadius:8, padding:8, color:'#e6edf3', background:'#0d0d1f'}}> {f.name}: <span className="font-mono">{f.expr}</span></button>
          </div>
        ))}
      </div>
      {open!==null && (
        <div style={{background:'#0d0d1f', border:'1px solid #00ffff55', borderRadius:12, padding:12}}>
          <p style={{color:'#aab2ba'}}>{formulas[open].desc}</p>
          <p style={{marginTop:8}}>
            <a href={formulas[open].link} target="_blank" rel="noreferrer" style={{ color:'#00ffff' }}>Referencia avanzada</a>
          </p>
          {/* Banners académicos: NASA y CERN */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12, marginTop:12}}>
            <a href="https://www.nasa.gov/" target="_blank" rel="noreferrer" style={{display:'block', padding:12, border:'1px solid #00ffff55', borderRadius:12, background:'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,255,255,0.05))', color:'#00ffff', textAlign:'center'}}>
              🚀 NASA — Laboratorios y Ciencia
            </a>
            <a href="https://home.cern/" target="_blank" rel="noreferrer" style={{display:'block', padding:12, border:'1px solid #00ffff55', borderRadius:12, background:'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,0,255,0.05))', color:'#ff3cc7', textAlign:'center'}}>
              ⚛️ CERN — Organización Europea para la Investigación Nuclear
            </a>
          </div>
        </div>
      )}
    </div>
  );
};