import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLabStore } from '../stores/useLabStore';
import MmcMathematicsCore from './mmc/components/MmcMathematicsCore.jsx';
import MmcJsxGraphBoard from './mmc/components/MmcJsxGraphBoard.jsx';
import MmcEquation from './mmc/components/MmcEquation.jsx';
import { plotDataCurve } from './mmc/adapters/jsxgraphAdapter.js';

const AdvancedMathLabV2 = () => {
  const electronicsData = useLabStore((state) => state.electronicsData);

  return (
    <div className="min-h-screen" style={{ background: '#070b11', color: 'white' }}>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: 'Rajdhani', sans-serif; }
        /*
         * ANCHO. No hay max-width. Un contenedor restrictivo es la causa
         * directa de tener que bajar el zoom: a 1920 px se usaba 1200 px y se
         * desperdiciaban 720. Se ocupa el 94% del viewport en pantallas anchas
         * y el 100% en las estrechas, donde cada píxel cuenta. Ninguna columna
         * central delgada: el contenido es lo que define el ancho.
         */
        .game-container { width:94%; max-width:none; margin:0 auto; padding:0; position:relative; }
        @media (max-width: 1100px) { .game-container { width:100%; padding:0 12px; } }
        @media (min-width: 2200px) { .game-container { width:95%; } }

        /*
         * GRÁFICAS FLUIDAS. Los SVG heredados llevaban width/height fijos, así
         * que se veían pequeños en una pantalla grande. Con viewBox ya
         * definido, quitar el ancho fijo y dejar que CSS imponga la proporción
         * hace que ocupen todo el ancho disponible sin deformarse.
         */
        .mmc-plot { display:block; width:100%; height:auto; }

        /*
         * Grid de gráficas: en escritorio van 2 columnas, en móvil 1.
         * Antes las 4 gráficas de SignalsInteractive se apilaban verticalmente
         * (200+160+200+200 = 760px de scroll). Con 2 columnas se reduce a
         * ~380px y cada gráfica gana ancho.
         */
        .mmc-plot-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 980px) {
          .mmc-plot-grid { grid-template-columns: 1fr 1fr; }
        }

        /*
         * ESTO ES UN WORKBENCH, NO UN DASHBOARD.
         *
         * La diferencia no es de gusto, es de función: un dashboard reparte el
         * espacio en cajas iguales y decora cada una para que se lean como
         * módulos intercambiables. Aquí cada instrumento es una sección de un
         * documento continuo, y lo que separa un instrumento del siguiente es
         * una línea y aire, no una caja. El gráfico manda; el marco estorba.
         *
         * Se conserva a propósito: el anillo de foco (accesibilidad con
         * teclado) y el borde del estado ROTO (comunica información).
         */

        .mmc-tag { display:flex; flex-wrap:wrap; gap:4px 16px; align-items:baseline; margin:2px 0 8px; font-size:11px; color:#aab2ba; }
        .mmc-tag b { font-weight:600; color:#e2e8f0; text-transform:uppercase; letter-spacing:.06em; font-size:10px; }

        .quantum-header { display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:10px; padding-bottom:8px; border-bottom:1px solid #1f2937; }
        .quantum-title { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:1.15rem; font-weight:700; letter-spacing:.02em; color:#e2e8f0; margin:0; }
        .lab-status { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px; letter-spacing:.06em; text-transform:uppercase; }

        /* Índice: enlaces de texto, no botones-engordo. */
        .lab-index { display:flex; flex-wrap:wrap; gap:4px 16px; padding:8px 0; }
        .lab-index a, .lab-index button { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px; letter-spacing:.05em; text-transform:uppercase; padding:0; border:0; border-bottom:1px solid transparent; background:none; color:#94a3b8; cursor:pointer; }
        .lab-index a:hover, .lab-index button:hover { border-bottom-color:#155e75; color:#67e8f9; }
        .lab-index button:focus-visible, .lab-readout:focus-visible { outline:1px solid #155e75; outline-offset:3px; }

        .mmc-note { font-size:11px; color:#6b7280; margin:0 0 10px; }

        /* Lectura: una línea con filete inferior. Sin caja. */
        .lab-readout { display:flex; flex-wrap:wrap; align-items:center; gap:4px 12px; padding:6px 0; margin-bottom:12px; border:0; border-bottom:1px solid #1f2937; background:none; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px; cursor:pointer; text-align:left; }
        .lab-readout:hover { border-bottom-color:#155e75; }
        .lab-readout-k { color:#475569; text-transform:uppercase; letter-spacing:.08em; font-size:9px; }
        .lab-readout-v { color:#22d3ee; }
        .lab-readout-dim { color:#64748b; }

        /*
         * Instrumento: separación por filete + aire. Sin fondo, sin borde, sin
         * radio, sin padding. El nombre de la clase se conserva porque
         * MathModelingCell lo usa como ancla para ocultar el h3.
         */
        .interactive-section { padding:0 0 14px; margin-bottom:14px; border-bottom:1px solid #16202e; }
        .interactive-section:last-child { border-bottom:0; }

        /* Controles: fila densa. Se conservan las clases .controls, .ctrl y el
           elemento label porque el MutationObserver de MathModelingCell los lee. */
        .controls { display:grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap:6px 18px; margin:8px 0; }
        .ctrl { display:grid; grid-template-columns:auto 1fr; align-items:center; gap:2px 8px; min-width:0; }
        .ctrl label { grid-column:1; font-family:ui-monospace,Menlo,monospace; font-size:10px; color:#8494a8; white-space:nowrap; cursor:pointer; }
        .ctrl input[type='number'], .ctrl select { grid-column:2; grid-row:1; width:100%; padding:2px 4px; border:0; border-bottom:1px solid #1f2937; border-radius:0; background:transparent; color:#cbd5e1; font-family:ui-monospace,Menlo,monospace; }
        .ctrl input[type='range'] { grid-column:2; grid-row:1; width:100%; }

        /* Matriz: cuatro números en monoespaciada, no cuatro mini-tarjetas. */
        .matrix { display:grid; grid-template-columns: repeat(2, minmax(64px, 96px)); gap:2px 20px; margin:8px 0; }
        .matrix div { font-family:ui-monospace,Menlo,monospace; font-size:14px; text-align:right; color:#00ffff; }

        /* El gráfico es el contenido: sin marco y sin padding alrededor.
           Se usa overflow auto en vez de hidden a propósito: los SVG heredados
           son de ancho fijo y en la celda del CMSC no caben. Recortarlos
           escondería datos, dejarlos visibles desbordarían el layout. La barra
           de scroll los mantiene enteros. */
        .svg-wrap { background:none; border:0; border-radius:0; padding:0; overflow-x:auto; overflow-y:hidden; }

        /* Acordeones: compactos, colapsados por defecto */
        .wb-accordion { border-bottom:1px solid #16202e; }
        .wb-accordion summary {
          cursor:pointer; padding:6px 0; font-family:ui-monospace,Menlo,monospace;
          font-size:11px; letter-spacing:.05em; text-transform:uppercase; color:#64748b;
          list-style:none; display:flex; align-items:center; gap:6px;
        }
        .wb-accordion summary::-webkit-details-marker { display:none; }
        .wb-accordion summary::before { content:'▸'; font-size:9px; color:#374151; }
        .wb-accordion[open] summary::before { content:'▾'; }
        .wb-accordion summary:hover { color:#94a3b8; }
        .wb-accordion > div { padding:0 0 8px; }

        /* Núcleo dominante: 65-70% del viewport */
        .mmc-wb-plot .mmc-board,
        .mmc-wb-plot .mmc-board-fail {
          height: clamp(450px, 68vh, 950px) !important;
        }

        /* Rail 30% / Stage 70% */
        @media (min-width: 980px) {
          .mmc-wb-body { grid-template-columns: minmax(280px, 30%) minmax(0, 1fr); }
        }
      `}</style>

      <div className="game-container">
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
    <svg className="mmc-plot" viewBox={`0 0 ${width} ${height}`}>
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

// Instrumentos del laboratorio reutilizables por el CMSC (export aditivo, lógica intacta).
export { IntegralsInteractive, EigenvaluesInteractive, DiffEqInteractive, GeometryInteractive, SignalsInteractive, ComplexInteractive };

// --- Componentes Dinámicos ---

// Etiqueta de salida y destino de cada instrumento. Solo presentación: no altera ningún cálculo.
const MmcTag = ({ produce, hacia, live }) => (
  <div className="mmc-tag">
    <span><b>Produce:</b> {produce.join(' · ')}</span>
    <span><b>Va hacia:</b> {hacia.join(' · ')}</span>
  </div>
);

const DynamicSections = ({ electronicsData }) => {
  return (
    <div>
      {/* Núcleo Matemático: siempre visible, es el laboratorio principal */}
      <div id="section-mmc-core">
        <MmcMathematicsCore />
      </div>

      {/* Todo lo demás: acordeones colapsados por defecto */}
      <details className="wb-accordion">
        <summary>Señal Real</summary>
        <div><RealSignalAnalysis electronicsData={electronicsData} /></div>
      </details>

      <details className="wb-accordion">
        <summary>Fourier</summary>
        <div><SignalsInteractive /></div>
      </details>

      <details className="wb-accordion">
        <summary>Integrales</summary>
        <div><IntegralsInteractive /></div>
      </details>

      <details className="wb-accordion">
        <summary>Eigenvalores</summary>
        <div><EigenvaluesInteractive /></div>
      </details>

      <details className="wb-accordion">
        <summary>Geometría</summary>
        <div><GeometryInteractive /></div>
      </details>

      <details className="wb-accordion">
        <summary>Complejos</summary>
        <div><ComplexInteractive /></div>
      </details>

      <details className="wb-accordion">
        <summary>Fórmulas</summary>
        <div><FormulasPanel /></div>
      </details>
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
          <p>Este es el único enlace de medición real del MMC: aún no hay datos de circuito activos.</p>
          <p className="text-sm mt-2">
            Activa un circuito en el <strong>Laboratorio de Electrónica</strong> y el MMC recibirá su señal
            para medirla en tiempo y frecuencia, comparar teoría contra comportamiento físico y exportar el resultado.
          </p>
          <p className="text-sm mt-2 text-gray-500">
            Sin esa medición, todo lo que este laboratorio produce sigue siendo simulación.
          </p>
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

  // Guard: selectedNode arranca en '1' (valor por defecto de useState) y el
  // useEffect de arriba lo corrige a una clave real de `history` -- pero ese
  // efecto corre DESPUÉS de este render, no antes. Si el adaptador que llenó
  // `history` no usa numeración automática de nets (ej. Falstad, que usa los
  // nombres de nodo que el usuario etiquetó dentro de su propio editor,
  // nunca '1'), este primer render puede caer con selectedNode apuntando a
  // una clave que no existe todavía. Antes: Math.min(...undefined) crasheaba
  // el componente entero a una pantalla en blanco, sin ningún mensaje.
  if (!Array.isArray(selectedSignal) || selectedSignal.length === 0) {
    return (
      <div className="interactive-section" id="section-real-signal">
        <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>🔬 Análisis de Señal Real</h3>
        <div className="p-4 border border-dashed border-yellow-600 rounded text-center text-yellow-400">
          <p>Selecciona un nodo válido para analizar.</p>
          {nodes.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {nodes.map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedNode(n)}
                  className="px-3 py-1 text-xs bg-cyan-900 text-cyan-300 rounded border border-cyan-700 hover:bg-cyan-800"
                >
                  {n}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm mt-2 text-gray-500">No hay nodos disponibles en los datos recibidos.</p>
          )}
        </div>
      </div>
    );
  }

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

        <MmcTag
          live
          produce={['V(t) medida', 'espectro FFT', 'H(s) · Bode', 'fase V-dV/dt', 'CSV']}
          hacia={['Electrónica', 'Telecomunicaciones', 'IA Predictiva', 'Knowledge Hub']}
        />
        
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
            <svg className="mmc-plot" viewBox={`0 0 ${width} ${height}`}>
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
               <svg className="mmc-plot" viewBox={`0 0 ${width} ${height}`}>
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
      <MmcTag
        produce={['curva de referencia', 'área acumulada', 'TFC verificada']}
        hacia={['validación teórica', 'Electrónica · filtrado', 'Knowledge Hub']}
      />
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
        <svg className="mmc-plot" viewBox="0 0 500 200" role="img" aria-label="Gráfica de f(x) con área bajo la curva">
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
      <MmcTag
        produce={['espectro propio', 'direcciones invariantes', 'criterio de estabilidad']}
        hacia={['resonancia', 'Electrónica · respuesta en frecuencia', 'Knowledge Hub']}
      />
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
      <MmcTag
        produce={['solución exacta', 'trayectoria numérica', 'ciclo límite']}
        hacia={['simulación de dinámica', 'escenarios experimentales', 'IA Predictiva']}
      />
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
        <svg className="mmc-plot" viewBox="0 0 500 200" role="img" aria-label="Gráfica solución exacta">
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

// Geometría: rotación 2D sobre geometría dinámica real (JSXGraph).
// Mejora respecto a la versión anterior, que dibujaba un polígono con rutas SVG
// calculadas a mano: ahora el cuadrado es un objeto geométrico de verdad, con
// punto arrastrable, zoom, encuadre y ejes reales. El deslizador θ y la matriz R
// se conservan idénticos, incluido el cálculo.
const GeometryInteractive = () => {
  const [theta, setTheta] = useState(30);
  const rad = useMemo(() => (theta * Math.PI) / 180, [theta]);
  const R = useMemo(() => ({
    a: Math.cos(rad), b: -Math.sin(rad), c: Math.sin(rad), d: Math.cos(rad)
  }), [rad]);

  const BASE = useMemo(() => ([
    [ -1.5, -1.5 ], [ 1.5, -1.5 ], [ 1.5,  1.5 ], [ -1.5,  1.5 ], [ -1.5, -1.5 ]
  ]), []);

  const buildGeometry = useCallback((board, ctx) => {
    const { theme } = ctx;
    // `polygon` recibe una lista PLANA de pares [x, y]. Verificado en
    // src/utils/type.js `providePoints`: itera `parents` y crea un punto por
    // entrada, así que anidar la lista en un array extra
    // (`[BASE.map(...)]`) haría `create('point', [p0,p1,p2,...])`, que es
    // inválido y deja el cuadrado sin dibujar.
    const flat = (pts) => pts.map(([x, y]) => [x, y]);

    // Cuadrado base: referencia, siempre el mismo.
    board.create('polygon', flat(BASE), {
      strokeColor: theme.axis,
      strokeWidth: 1.5,
      dash: 2,
      fillOpacity: 0.04,
      vertices: { visible: false },
      fixed: true,
      highlight: false
    });

    // Cuadrado rotado: se recalcula con el deslizador θ.
    const rot = BASE.map(([x, y]) => [R.a * x + R.b * y, R.c * x + R.d * y]);
    board.create('polygon', flat(rot), {
      strokeColor: theme.cyan,
      strokeWidth: 2,
      fillColor: theme.cyan,
      fillOpacity: 0.1,
      vertices: { visible: false },
      fixed: true,
      highlight: false
    });

    // Punto arrastrable: demuestra geometría dinámica y alimenta la caja de
    // información del propio tablero. NO acopla con θ a propósito: si el punto
    // moviera el estado, cada cambio reconstruiría el tablero y el arrastre se
    // cortaría a mitad de gesto.
    board.create('point', [2.6, 1.2], {
      name: 'P',
      strokeColor: theme.amber,
      fillColor: theme.amber,
      size: 3,
      label: { strokeColor: theme.amber, fontSize: 12 }
    });

    // Ejes y rejilla sobre la geometría.
    board.create('line', [[0, 0], [4.5, 0]], { strokeColor: theme.axis, dash: 1, fixed: true, highlight: false });
    board.create('line', [[0, 0], [0, 4.5]], { strokeColor: theme.axis, dash: 1, fixed: true, highlight: false });
  }, [BASE, R]);

  return (
    <div className="interactive-section" id="section-geometry">
      <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>Geometría: Rotación 2D</h3>
      <MmcTag
        produce={['transformación lineal', 'rotación de trayectoria']}
        hacia={['Álgebra y geometría', 'Knowledge Hub']}
      />
      <div className="controls">
        <div className="ctrl">
          <label>Ángulo θ (grados)</label>
          <input type="range" min="0" max="180" step="1" value={theta} onChange={(e) => setTheta(parseInt(e.target.value))} />
          <span style={{ color: '#ccc' }}>θ = {theta}°</span>
        </div>
      </div>
      <div className="matrix">
        <div>{R.a.toFixed(3)}</div><div>{R.b.toFixed(3)}</div>
        <div>{R.c.toFixed(3)}</div><div>{R.d.toFixed(3)}</div>
      </div>
      <MmcJsxGraphBoard
        build={buildGeometry}
        rebuildKey={`${theta}`}
        boundingbox={[-5, 5, 5, -5]}
        height={320}
        ariaLabel="Rotación de un cuadrado en el plano, con punto arrastrable"
      />
      <p style={{ color: '#aab2ba' }}>
        Arrastrá el punto rojo P sobre el tablero. La matriz R rota el cuadrado base (gris discontinuo) en sentido antihorario.
      </p>
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

  // Los cuatro gráficos pasan a tableros JSXGraph con eje FIJO.
  // Mejora científica real, no cosmética: antes `mapY` renormalizaba cada
  // señal para llenar el marco, así que a1=0.1 se veía idéntico a a1=2 y el
  // deslizador de amplitud no enseñaba nada. Y el espectro dibujaba las barras
  // en posiciones fijas de pantalla (40 + i*60) sin relación con f1/f3, así que
  // tampoco respondía a los controles.
  const buildWave = useCallback((board, ctx) => {
    board.create('curve', plotDataCurve(wave), {
      strokeColor: ctx.theme.green, strokeWidth: 2, fixed: true, highlight: false
    });
  }, [wave]);

  const buildSpec = useCallback((board, ctx) => {
    // Barras como polígonos: `bar` no está verificado en esta versión.
    spec.forEach(({ k, amp }) => {
      // Lista plana de [x, y], igual que en la geometría: ver `providePoints`.
      board.create('polygon', [
        [k - 0.28, 0], [k - 0.28, amp], [k + 0.28, amp], [k + 0.28, 0]
      ], {
        fillColor: ctx.theme.pink, fillOpacity: 0.75, strokeColor: ctx.theme.pink,
        vertices: { visible: false }, fixed: true, highlight: false
      });
      board.create('point', [k, amp], {
        size: 2.5, strokeColor: ctx.theme.pink, fillColor: ctx.theme.pink, fixed: true, highlight: false
      });
    });
    board.create('line', [[0, 0], [10, 0]], { strokeColor: ctx.theme.axis, dash: 1, fixed: true, highlight: false });
    board.create('text', [5, -0.42, 'k (armónico)'], { cssStyle: 'font-size:10px;color:#8892a0', fixed: true });
    board.create('text', [-0.35, 1.05, '|a_k|'], { cssStyle: 'font-size:10px;color:#8892a0', fixed: true });
  }, [spec]);

  const buildAm = useCallback((board, ctx) => {
    board.create('curve', plotDataCurve(emWave), {
      strokeColor: ctx.theme.cyan, strokeWidth: 1.2, fixed: true, highlight: false
    });
  }, [emWave]);

  const buildDemod = useCallback((board, ctx) => {
    board.create('curve', plotDataCurve(emDemod), {
      strokeColor: ctx.theme.amber, strokeWidth: 2, fixed: true, highlight: false
    });
  }, [emDemod]);

  return (
    <div className="interactive-section" id="section-signals">
      <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>Señales: Serie de Fourier simple</h3>
      <MmcTag
        produce={['señal de prueba', 'espectro discreto', 'señal AM', 'envolvente demodulada']}
        hacia={['Análisis espectral', 'Telecomunicaciones', 'Electrónica · filtrado', 'Hardware BBB', 'IA Predictiva']}
      />
      {/* Honestidad de estado: estas señales se generan en el navegador a partir
          de los controles. No son mediciones. Reutiliza las clases de estado ya
          existentes en este archivo en lugar de inventar otro sistema. */}
      <p className="lab-status" style={{ color: '#e0b64f', margin: '6px 0 0' }}>
        ● sim · señales sintéticas calculadas en el navegador · ningún sensor las produce
      </p>
      <div className="controls">
        <div className="ctrl"><label>f1</label><input type="range" min="1" max="6" value={f1} onChange={(e)=>setF1(parseInt(e.target.value))} /><span style={{color:'#ccc'}}>f1={f1}</span></div>
        <div className="ctrl"><label>a1</label><input type="range" min="0" max="2" step="0.1" value={a1} onChange={(e)=>setA1(parseFloat(e.target.value))} /><span style={{color:'#ccc'}}>a1={a1.toFixed(1)}</span></div>
        <div className="ctrl"><label>f3</label><input type="range" min="1" max="9" value={f3} onChange={(e)=>setF3(parseInt(e.target.value))} /><span style={{color:'#ccc'}}>f3={f3}</span></div>
        <div className="ctrl"><label>a3</label><input type="range" min="0" max="2" step="0.1" value={a3} onChange={(e)=>setA3(parseFloat(e.target.value))} /><span style={{color:'#ccc'}}>a3={a3.toFixed(1)}</span></div>
      </div>
      <div className="mmc-plot-grid">
      <div className="svg-wrap" style={{ marginBottom: 12 }}>
        <MmcJsxGraphBoard
          build={buildWave}
          rebuildKey={`${f1}-${f3}-${a1}-${a3}`}
          boundingbox={[-0.35, 2 * Math.PI + 0.35, 4.5, -4.5]}
          height={200}
          ariaLabel="Suma de armónicos en el tiempo, eje fijo"
        />
      </div>
      <div className="svg-wrap">
        <MmcJsxGraphBoard
          build={buildSpec}
          rebuildKey={`${f1}-${f3}-${a1}-${a3}`}
          boundingbox={[-0.7, 10.3, 2.4, -0.7]}
          height={160}
          ariaLabel="Espectro discreto de armónicos, posiciones ligadas a f1 y f3"
        />
      </div>
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
      <h4 className="text-lg font-bold" style={{color:'#ffd32a', marginTop:12}}>Ejemplo EM: Modulación AM y Demodulación</h4>
      <MmcTag
        produce={['portadora s(t)', 'bandas laterales f_c ± f_m', 'envolvente recuperada']}
        hacia={['Telecomunicaciones', 'Electrónica · demodulador', 'Análisis espectral', 'Knowledge Hub']}
      />
      <div className="controls">
        <div className="ctrl"><label>f<sub>c</sub> (portadora)</label><input type="range" min="5" max="30" value={em.fc} onChange={(e)=>setEm({...em, fc: parseInt(e.target.value)})} /><span style={{color:'#ccc'}}>fc={em.fc}</span></div>
        <div className="ctrl"><label>f<sub>m</sub> (mensaje)</label><input type="range" min="0" max="10" step="1" value={em.fm} onChange={(e)=>setEm({...em, fm: parseInt(e.target.value)})} /><span style={{color:'#ccc'}}>fm={em.fm}</span></div>
        <div className="ctrl"><label>Profundidad</label><input type="range" min="0" max="1" step="0.05" value={em.depth} onChange={(e)=>setEm({...em, depth: parseFloat(e.target.value)})} /><span style={{color:'#ccc'}}>m={em.depth.toFixed(2)}</span></div>
      </div>
      <div className="mmc-plot-grid">
      <div className="svg-wrap" style={{ marginBottom: 12 }}>
        <MmcJsxGraphBoard
          build={buildAm}
          rebuildKey={`${em.fc}-${em.fm}-${em.depth}`}
          boundingbox={[-0.25, 4.25, 2.4, -2.4]}
          height={200}
          ariaLabel="Señal AM modulada"
        />
      </div>
      <div className="svg-wrap">
        <MmcJsxGraphBoard
          build={buildDemod}
          rebuildKey={`${em.fc}-${em.fm}-${em.depth}`}
          boundingbox={[-0.25, 4.25, 2.4, -2.4]}
          height={200}
          ariaLabel="Envolvente demodulada por rectificación y filtro"
        />
      </div>
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
      <MmcTag
        produce={['mapeo conforme', 'plano complejo']}
        hacia={['transformaciones analíticas', 'Knowledge Hub']}
      />
      <div className="controls"><div className="ctrl"><label>Escala</label><input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={(e)=>setScale(parseFloat(e.target.value))} /><span style={{color:'#ccc'}}>×{scale.toFixed(1)}</span></div></div>
      <div className="svg-wrap">
        <svg className="mmc-plot" viewBox="0 0 500 200" role="img" aria-label="Mapa complejo">
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
  // `expr` es la cadena legible y accesible (title del botón, texto plano).
  // `tex` es la representación tipográfica que KaTeX sabe maquetar. El texto
  // original mezclaba notación Unicode suelta con notación ASCII
  // (`L\{f\}(s)`, `Σ`, `∫₀^∞`) que no se lee como fórmula matemática: el
  // subíndice y el exponente de la Laplace quedaban mal. Se conservan ambas.
  const formulas=[
    {name:'Transformada de Fourier', expr:'F(ω) = ∫ f(t) e^(-iωt) dt', tex:'F(\\omega)=\\int_{-\\infty}^{\\infty} f(t)\\,e^{-i\\omega t}\\,\\mathrm{d}t', desc:'Series/transformada para análisis espectral de señales.', link:'https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/resources/fourier-series/'},
    {name:'Transformada de Laplace', expr:'L{f}(s) = ∫₀^∞ f(t)e^(-st) dt', tex:'\\mathcal{L}\\{f\\}(s)=\\int_{0}^{\\infty} f(t)e^{-st}\\,\\mathrm{d}t', desc:'Sistemas LTI y estabilidad por polos/ceros.', link:'https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/'},
    {name:'Transformada Z (discreta)', expr:'X(z) = Σ x[n] z^(-n)', tex:'X(z)=\\sum_{n=-\\infty}^{\\infty} x[n]\,z^{-n}', desc:'DSP y análisis en el plano-z.', link:'https://www.sp4comm.org/webversion.html'},
    {name:'Modulación AM', expr:'s(t) = (1 + m·cos(2π f_m t))·cos(2π f_c t)', tex:'s(t)=\\bigl(1+m\\cos(2\\pi f_m t)\\bigr)\\cos(2\\pi f_c t)', desc:'Portadora y bandas laterales en f_c ± f_m.', link:'https://www.fceia.unr.edu.ar/lsd/'},
    {name:'Álgebra Lineal (Curso UNAL)', expr:'det(A - λI) = 0', tex:'\\det(A-\\lambda I)=0', desc:'Eigenvalores/eigenvectores en cursos reales.', link:'https://ciencias.medellin.unal.edu.co/cursos/algebra-lineal/'},
    {name:'Variable Compleja (IMA UMN)', expr:'f(z) = u + iv', tex:'f(z)=u+iv', desc:'Funciones analíticas y mapeos conformes.', link:'https://www.ima.umn.edu/~arnold/complex.html'},
  ];
  const [open,setOpen]=useState(null);
  return (
    <div className="interactive-section">
      <h3 className="text-xl font-bold" style={{ color:'#00ffff' }}>📐 Fórmulas y Explicaciones</h3>
      <MmcTag
        produce={['referencia verificable', 'vínculo académico externo']}
        hacia={['Knowledge Hub', 'Análisis espectral', 'validación teórica']}
      />
      <div className="controls">
        {formulas.map((f,i)=> (
          <div className="ctrl" key={i}>
            <button title={`${f.name}: ${f.desc}`} onClick={()=>setOpen(i)} style={{border:'1px solid #00ffff55', borderRadius:8, padding:8, color:'#e6edf3', background:'#0d0d1f', display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start'}}>
              <span style={{fontSize:'0.85rem', color:'#b0b8c0'}}>{f.name}</span>
              <MmcEquation tex={f.tex} ariaLabel={`Fórmula: ${f.name}`} />
            </button>
          </div>
        ))}
      </div>
      {open!==null && (
        <div style={{background:'#0d0d1f', border:'1px solid #00ffff55', borderRadius:12, padding:12}}>
          <p style={{color:'#aab2ba'}}>{formulas[open].desc}</p>
          <p style={{marginTop:8}}><MmcEquation tex={formulas[open].tex} ariaLabel={`Fórmula: ${formulas[open].name}`} /></p>
          <p style={{marginTop:8}}>
            <a href={formulas[open].link} target="_blank" rel="noreferrer" style={{ color:'#00ffff' }}>Referencia avanzada</a>
          </p>
        </div>
      )}
    </div>
  );
};