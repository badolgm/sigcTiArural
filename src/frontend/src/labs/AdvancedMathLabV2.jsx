import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useLabStore } from '../stores/useLabStore';
import MmcMathematicsCore from './mmc/components/MmcMathematicsCore.jsx';
import MmcJsxGraphBoard from './mmc/components/MmcJsxGraphBoard.jsx';
import MmcEquation from './mmc/components/MmcEquation.jsx';
import MmcSignal3DProjection, {
  projectSeriesToPaths,
  projectStrokesToPaths
} from './mmc/components/MmcSignal3DProjection.jsx';
import { compileEquation, equationToTex } from './mmc/parse/equationParser.js';

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
        .ctrl input[type='number'], .ctrl input[type='text'], .ctrl select { grid-column:2; grid-row:1; width:100%; padding:2px 4px; border:0; border-bottom:1px solid #1f2937; border-radius:0; background:transparent; color:#cbd5e1; font-family:ui-monospace,Menlo,monospace; }
        .ctrl input[type='range'] { grid-column:2; grid-row:1; width:100%; }
        /* La expresión libre ocupa toda la fila: es la entrada principal del
           instrumento de integrales, no un control más entre otros. */
        .ctrl.integral-expr { grid-column:1 / -1; }
        .ctrl.integral-expr input[type='text'] { color:#22d3ee; border-bottom-color:#155e75; }

        /* Marco de los tableros: ancho acotado y altura fija en píxeles.
           Sin este tope, un SVG con viewBox 500×200 estirado al 94% de un
           monitor de 1920 px alcanzaba ~760 px de alto: la curva dominaba
           toda la pantalla y los controles quedaban lejos. */
        .board-frame { max-width:900px; margin:0 auto; }
        .board-frame.narrow { max-width:760px; }
        .board-note { font-size:10px; color:#64748b; margin:2px 0 6px; font-family:ui-monospace,Menlo,monospace; }
        .board-metrics { display:grid; grid-template-columns:repeat(auto-fit, minmax(150px,1fr)); gap:6px 16px; margin:8px 0 2px; }
        .board-metrics div { font-family:ui-monospace,Menlo,monospace; font-size:11px; color:#aab2ba; }
        .board-metrics b { color:#22d3ee; font-weight:600; }
        .board-error { border:1px solid #b45309; background:rgba(120,53,15,.2); color:#fbbf24; padding:6px 8px; border-radius:6px; font-size:11px; margin:6px 0; }

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

        /* Núcleo dominante PERO PROPORCIONADO. El valor anterior (68vh, hasta
           950 px) convertía la gráfica en una curva gigante y rígida que
           desplazaba los controles fuera de pantalla. 46vh con techo de 560 px
           mantiene el protagonismo del gráfico sin romper la relación de
           aspecto ni obligar a hacer scroll para cambiar un parámetro. */
        .mmc-wb-plot .mmc-board,
        .mmc-wb-plot .mmc-board-fail {
          height: clamp(300px, 46vh, 560px) !important;
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

// Contrato de redibujado compartido por todos los tableros de este archivo:
// limpiar los objetos antes de volver a crearlos evita apilar curvas al mover
// los deslizadores. Los callbacks build/rebuild reciben (board, ctx).
const clearJsxGraphBoard = (board) => {
  const objects = board?.objectsList || [];
  for (let i = objects.length - 1; i >= 0; i -= 1) {
    try { board.removeObject(objects[i]); } catch (e) { /* ya eliminado */ }
  }
};

/**
 * Divide la serie en tramos continuos de UN solo signo. Un polígono único que
 * cruza y=0 varias veces se autointerseca y JSXGraph rellena con regla even-odd:
 * eso produce los "cortes" del área. Un polígono por lóbulo, cerrado sobre el
 * eje real en cada cruce interpolado, mantiene el área con signo sin cortes.
 * Los huecos no finitos también cortan el tramo: nunca se conectan dos islas.
 */
const buildAreaSegments = (xs, ys) => {
  const segments = [];
  let run = [];
  let sign = 0;
  const finish = (lastPoint) => {
    if (run.length < 2) { run = []; return; }
    const startX = run[0][0];
    const endX = run[run.length - 1][0];
    segments.push([[startX, 0], ...run, [endX, 0]]);
    run = lastPoint ? [lastPoint] : [];
  };
  for (let i = 0; i < xs.length; i += 1) {
    const y = ys[i];
    if (!Number.isFinite(y)) { finish(null); sign = 0; continue; }
    const nextSign = y === 0 ? sign : Math.sign(y);
    if (run.length > 0 && nextSign !== sign) {
      const prev = run[run.length - 1];
      let cross = null;
      if (Number.isFinite(prev[1]) && prev[1] !== 0 && y !== 0) {
        const denom = y - prev[1];
        if (Math.abs(denom) > 1e-12) {
          const u = -prev[1] / denom;
          cross = [prev[0] + u * (xs[i] - prev[0]), 0];
        }
      }
      finish(cross);
    }
    run.push([xs[i], y]);
    sign = nextSign;
  }
  finish(null);
  return segments;
};

// Modos de trazo del tablero de integrales. Todo se resuelve como una polilínea
// de puntos en coordenadas de usuario: la recta son 2 puntos y el círculo se
// muestrea en 96 lados. Así los tres modos comparten UN solo tipo de objeto
// JSXGraph (curve) y, lo que es más importante, expón los mismos datos (x,y)
// que se dibujan, listos para un futuro análisis o proyección 2D/3D.
const STROKE_MODES = {
  free: { label: 'Libre (lápiz)' },
  line: { label: 'Recta' },
  circle: { label: 'Círculo' }
};

const circleStrokePoints = (cx, cy, r, sides = 96) => {
  const pts = [];
  for (let i = 0; i <= sides; i += 1) {
    const theta = (i / sides) * Math.PI * 2;
    pts.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
  }
  return pts;
};

// Puntos renderizables de un trazo en curso. El free usa las muestras crudas
// del mouse; la recta y el círculo se calculan de forma exacta desde el punto
// inicial (centro, en el círculo) y el punto final del arrastre.
const strokeRenderPoints = (draft) => {
  if (!draft) return [];
  const { mode, start, current, pts } = draft;
  if (!start || !current) return [];
  if (mode === 'line') return [start, current];
  if (mode === 'circle') {
    const radius = Math.hypot(current[0] - start[0], current[1] - start[1]);
    return radius > 1e-9
      ? circleStrokePoints(start[0], start[1], radius)
      : [[start[0], start[1]]];
  }
  return pts || [];
};

const STROKE_FREE_MAX_POINTS = 4000;

// Un trazo confirmado es SOLO datos: { id, mode, start, end, points }. La curva
// visual se deriva de esos puntos, así que un rebuild (clearJsxGraphBoard se
// lleva todos los objetos) puede reconstruir TODOS los trazos sin perder uno.
const createStrokeCurve = (board, theme, points, { draft = false } = {}) => {
  if (!board || !Array.isArray(points) || points.length < 2) return null;
  return board.create('curve', [
    points.map((p) => p[0]),
    points.map((p) => p[1])
  ], {
    strokeColor: theme?.pink || '#ff5fd2',
    strokeWidth: draft ? 1.8 : 2.2,
    fixed: true,
    highlight: false,
    ...(draft ? { strokeOpacity: 0.8, dash: 3 } : {})
  });
};

const setStrokeCurvePoints = (board, curve, points) => {
  if (!curve || !Array.isArray(points)) return;
  curve.dataX = points.map((p) => p[0]);
  curve.dataY = points.map((p) => p[1]);
  board?.update?.();
};

const roundStrokePoint = (p) => [
  Number.isFinite(p?.[0]) ? Number(p[0].toFixed(6)) : null,
  Number.isFinite(p?.[1]) ? Number(p[1].toFixed(6)) : null
];

// Vista pública de un trazo: las mismas coordenadas que se dibujan, redondeadas
// a 6 decimales para que puedan consumirse después en análisis o proyección 2D/3D.
const strokeSummary = (stroke) => ({
  id: stroke.id,
  mode: stroke.mode,
  modeLabel: STROKE_MODES[stroke.mode]?.label || stroke.mode,
  pointCount: stroke.points.length,
  start: roundStrokePoint(stroke.start),
  end: roundStrokePoint(stroke.end),
  points: stroke.points.map(roundStrokePoint)
});

// Colores y vocabulario de la proyección 3D. LOCAL es la etiqueta honesta del
// CSV cargado en el núcleo (proveniencia no verificada): se distingue de
// REAL-LOCAL y NUNCA se sustituye por SIM ni por REAL.
const PROJECTION_STATE_COLOR = {
  'REAL-LOCAL': '#39ff14',
  LOCAL: '#fbbf24',
  SIM: '#00ffff',
  ROTO: '#ff3131',
  NO_DATA: '#94a3b8'
};
const PROJECTION_STATES = new Set(Object.keys(PROJECTION_STATE_COLOR));

// --- Geometría de la edición de trazos -------------------------------------
// Un trazo es datos puros, así que moverlo o escalarlo es transformar esos
// datos y volver a escribir la curva. Nada de tocar el SVG a mano.
const strokeCentroid = (geom) => {
  const pts = geom?.points || [];
  if (!pts.length) return [0, 0];
  let sx = 0;
  let sy = 0;
  pts.forEach((p) => { sx += p[0]; sy += p[1]; });
  return [sx / pts.length, sy / pts.length];
};

const translateStrokeGeometry = (geom, dx, dy) => ({
  points: geom.points.map((p) => [p[0] + dx, p[1] + dy]),
  start: [geom.start[0] + dx, geom.start[1] + dy],
  end: [geom.end[0] + dx, geom.end[1] + dy]
});

const scaleStrokeGeometry = (geom, factor, centroid) => {
  const [cx, cy] = centroid;
  const tx = (p) => [cx + (p[0] - cx) * factor, cy + (p[1] - cy) * factor];
  return {
    points: geom.points.map(tx),
    start: tx(geom.start),
    end: tx(geom.end)
  };
};

const snapshotStroke = (stroke) => ({
  points: stroke.points.map((p) => [p[0], p[1]]),
  start: [stroke.start[0], stroke.start[1]],
  end: [stroke.end[0], stroke.end[1]]
});

// --- Campo vectorial --------------------------------------------------------
// SIM: V(x,y) = k · (1, f'(x) + β·f(x) + γ·y). La derivada se calcula con la
// MISMA diferencia centrada que la recta tangente; no hay eval ni parser nuevo.
// La dirección se normaliza y la longitud crece con |V| (tope 2.4) para que la
// magnitud sea legible sin salirse del tablero.
const buildVectorField = (board, ctx, { bbox, lo, hi, fn, density, scale, coupling, shear }) => {
  if (!board || !Array.isArray(bbox) || typeof fn !== 'function') return;
  const nx = Math.max(4, Math.min(12, Math.round(density)));
  const ny = Math.max(3, Math.min(9, Math.round(density * 0.7)));
  const [x0, x1, yTop, yBot] = bbox;
  const dx = (x1 - x0) / (nx + 1);
  const dy = (yTop - yBot) / (ny + 1);
  const base = Math.min(dx, dy) * 0.75;
  const h = Math.max(1e-6, Math.abs(hi - lo) * 1e-4);
  if (!(base > 0)) return;

  for (let i = 1; i <= nx; i += 1) {
    for (let j = 1; j <= ny; j += 1) {
      const x = x0 + dx * i;
      const y = yTop - dy * j;
      let f = NaN;
      let m = NaN;
      try {
        f = fn(x);
        m = (fn(x + h) - fn(x - h)) / (2 * h);
      } catch (err) { f = NaN; m = NaN; }
      if (!Number.isFinite(f) || !Number.isFinite(m)) continue;
      const vx = 1;
      const vy = m + coupling * f + shear * y;
      const mag = Math.hypot(vx, vy);
      if (!Number.isFinite(mag) || mag < 1e-9) continue;
      const len = scale * base * Math.min(2.4, mag);
      board.create('arrow', [[x, y], [x + (vx / mag) * len, y + (vy / mag) * len]], {
        strokeColor: ctx.theme.green, strokeWidth: 1, strokeOpacity: 0.5,
        fixed: true, highlight: false
      });
    }
  }
};

const vectorComponents = (y, slope) => {
  const safeSlope = Number.isFinite(slope) ? slope : 0;
  const norm = Math.hypot(1, safeSlope) || 1;
  const tx = 1 / norm;
  const ty = safeSlope / norm;
  return {
    slope: safeSlope,
    tx, ty,
    nx: -ty, ny: tx,
    evalX: 0,
    evalY: Number.isFinite(y) ? -y : 0,
    y: Number.isFinite(y) ? y : 0
  };
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
const MmcTag = ({ produce, hacia }) => (
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
        <summary>Señal Simulada de Circuito (S32 · SIM)</summary>
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
    </div>
  );
};

// --- Componente de Señal Simulada de Circuito (S32 · SIM) ---
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

  // Los dos useMemo se calculan ANTES de cualquier return anticipado: si se
  // declararan después, el orden de hooks cambiaría según existan o no datos
  // de circuito. El encadenamiento opcional permite calcularlos también en el
  // render sin datos, sin alterar ningún texto ni resultado visible.
  const history = electronicsData?.simulationResults?.history;
  const timeData = history?.time;

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

  const spectrumData = useMemo(() => calculateFFT(history?.[selectedNode], timeData), [history, selectedNode, timeData]);
  
  // 2. Transfer Function H(f) = Vout(f) / Vin(f)
  const transferFunction = useMemo(() => {
      if (!showTransfer || inputNode === selectedNode) return null;
      const specIn = calculateFFT(history?.[inputNode], timeData);
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

  if (!electronicsData?.active || !history) {
    return (
      <div className="interactive-section" id="section-real-signal">
        <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>🔬 Señal Simulada de Circuito (S32 · SIM)</h3>
        <div className="p-4 border border-dashed border-gray-600 rounded text-center text-gray-400">
          <p>Este bloque muestra la simulación del circuito electrónico; aún no hay datos activos.</p>
          <p className="text-sm mt-2">
            Activa un circuito en el <strong>Laboratorio de Electrónica</strong> y el MMC recibirá su historial
            de simulación para analizarlo en tiempo y frecuencia y exportar el resultado.
          </p>
          <p className="text-sm mt-2 text-gray-500">
            S32 · SIM: proviene del simulador electrónico, no de un sensor físico. No es una medición REAL-LOCAL.
          </p>
        </div>
      </div>
    );
  }

  const nodes = Object.keys(history).filter(k => k !== 'time');

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
        <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>🔬 Señal Simulada de Circuito (S32 · SIM)</h3>
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
            <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>🔬 Señal Simulada de Circuito (S32 · SIM)</h3>
            <span className="text-xs px-2 py-1 rounded border" style={{ color: '#fbbf24', borderColor: '#b45309', background: 'rgba(120,53,15,.25)' }}>SIM · CIRCUITO</span>
        </div>

        <MmcTag
          produce={['V(t) simulada', 'espectro FFT', 'H(s) · Bode', 'fase V-dV/dt', 'CSV']}
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
             <div className="w-full bg-black rounded relative border border-gray-800">
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
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Diagrama de Bode, magnitud estimada en decibelios frente a frecuencia">
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

// Integrales: modelo editable con compileEquation, área bajo la curva y recta
// tangente. Todo el trazado pasa por MmcJsxGraphBoard (motor 2D del MMC), con
// altura fija y ancho acotado: nada de SVG estirado a toda la pantalla.
const INTEGRAL_PRESETS = {
  sin: { label: 'A·sen(ωx)', expr: 'A*sin(W*x)' },
  mod: { label: 'Onda modulada', expr: 'A*sin(W*x)*(1+0.3*cos(3*x))' },
  exp: { label: 'e^x', expr: 'exp(x)' },
  poly: { label: 'Ax² + Bx + C', expr: 'A*x^2+B*x+C' }
};

const IntegralsInteractive = () => {
  const [preset, setPreset] = useState('sin');
  const [expr, setExpr] = useState(INTEGRAL_PRESETS.sin.expr);
  const [a, setA] = useState(0);
  const [b, setB] = useState(Math.PI);
  // Los límites se escriben como texto y se confirman solo cuando son finitos.
  // Con `type=number` + step, escribir `3.` reescribía el valor a `3` y borraba
  // el punto decimal: de ahí la sensación de control trabado con b=π.
  const [aText, setAText] = useState('0');
  const [bText, setBText] = useState(String(Math.PI));
  const [n, setN] = useState(200);
  const [amp, setAmp] = useState(1);
  const [omega, setOmega] = useState(1);
  const [poly, setPoly] = useState({ B: 0, C: 0 });
  const [xT, setXT] = useState(0.8);
  // Trazos: cada gesto completado queda como DATOS en strokesRef, de modo que
  // sobrevive a los rebuild del tablero (clearJsxGraphBoard elimina todos los
  // objetos visuales). Las curvas se derivan de esos datos, nunca al revés.
  // free = muestras del mouse · line = 2 puntos · circle = 96 lados.
  const [pencil, setPencil] = useState(false);
  const [strokeMode, setStrokeMode] = useState('free');
  const [strokesView, setStrokesView] = useState([]);
  const strokesRef = useRef([]);
  const strokeElemsRef = useRef([]);
  const draftRef = useRef(null);
  const draftElemRef = useRef(null);
  const boardApiRef = useRef(null);
  const themeRef = useRef(null);
  const pencilRef = useRef(pencil);
  const strokeModeRef = useRef(strokeMode);
  const drawingRef = useRef(false);
  const strokeSeqRef = useRef(0);

  // Edición de trazos: seleccionar y transformar los datos ya confirmados.
  const [editing, setEditing] = useState(false);
  const [editAction, setEditAction] = useState('move');
  const [selectedStrokeId, setSelectedStrokeId] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const editingRef = useRef(editing);
  const editActionRef = useRef(editAction);
  const selectedStrokeIdRef = useRef(selectedStrokeId);
  const editDragRef = useRef(null);
  const selectionBaseRef = useRef(null);

  // Capa SIM de campo vectorial sobre el dominio del tablero.
  const [vectorField, setVectorField] = useState(false);
  const [fieldDensity, setFieldDensity] = useState(8);
  const [fieldScale, setFieldScale] = useState(1);
  const [fieldCoupling, setFieldCoupling] = useState(0.4);
  const [fieldShear, setFieldShear] = useState(0);

  // Vectores en P: se publican en un único frame por rAF para que el arrastre
  // no competa con React en cada evento del mouse.
  const [vectorView, setVectorView] = useState(null);
  const tangentFrameRef = useRef(0);
  const pendingFrameRef = useRef(null);
  const lastFrameRef = useRef({ x: Number.NaN, slope: Number.NaN });

  // Proyección 3D: la alimenta la señal viva S35 publicada por MmcMathematicsCore
  // (SIM o REAL-LOCAL según su fuente) o los trazos confirmados del tablero (SIM).
  const [projection3D, setProjection3D] = useState(false);
  const [projectionSource, setProjectionSource] = useState('signal');
  const mathLiveSignal = useLabStore((state) => state.mathLiveSignal);

  pencilRef.current = pencil;
  strokeModeRef.current = strokeMode;
  editingRef.current = editing;
  editActionRef.current = editAction;
  selectedStrokeIdRef.current = selectedStrokeId;

  // Ámbito de parámetros: A es la amplitud y W la frecuencia ω. Se aceptan
  // alias para que una expresión escrita a mano no falle por mayúsculas.
  const scope = useMemo(() => ({
    A: amp, W: omega, w: omega, omega, amp, freq: omega, B: poly.B, C: poly.C
  }), [amp, omega, poly]);

  const compiled = useMemo(() => {
    try {
      const model = compileEquation(expr, scope);
      // Forzar una evaluación detecta parámetros sin declarar. Un resultado no
      // finito (p. ej. sqrt(x) en x<0) es válido: esos puntos se descartan al
      // muestrear, no es un error de sintaxis.
      model.fn(0);
      let tex = expr;
      try { tex = equationToTex(expr); } catch (err) { /* se muestra texto plano */ }
      return { fn: model.fn, tex, free: model.free || [], error: null };
    } catch (err) {
      return { fn: null, tex: expr, free: [], error: err?.message || String(err) };
    }
  }, [expr, scope]);

  const usesAmp = ['A', 'amp'].some((name) => compiled.free.includes(name));
  const usesOmega = ['W', 'w', 'omega', 'freq'].some((name) => compiled.free.includes(name));

  // xT NO entra en `model`: al arrastrar P se recalculan hasta 5000 muestras,
  // trapecios y boundingbox en cada frame, y eso se sentía como congelamiento.
  // Lo que depende de x₀ vive en `tangentModel` (cálculo ligero) y se publica
  // una vez por frame. Así el drag solo mueve geometría.
  const model = useMemo(() => {
    if (!compiled.fn) return null;
    const lo = Number.isFinite(a) ? a : 0;
    const requestedHi = Number.isFinite(b) ? b : 1;
    // Intervalo degeneration a derecha: b ≤ a no produce un boundingbox
    // invertido (que dejaría el tablero en blanco) sino un dominio de longitud 1.
    const hi = requestedHi <= lo ? lo + 1 : requestedHi;
    const N = Math.max(2, Math.min(5000, Math.round(Number(n)) || 200));
    const dx = (hi - lo) / N;
    const xs = [];
    const ys = [];
    for (let i = 0; i <= N; i += 1) {
      const x = lo + i * dx;
      let y = NaN;
      try { y = compiled.fn(x); } catch (err) { y = NaN; }
      xs.push(x);
      ys.push(Number.isFinite(y) ? y : NaN);
    }
    const finiteYs = ys.filter(Number.isFinite);
    if (finiteYs.length < 2) return null;

    // Trapecios sobre el dominio pedido. Los tramos con valores no finitos se
    // omiten en lugar de contaminar el área con NaN.
    let area = 0;
    for (let i = 0; i < N; i += 1) {
      if (Number.isFinite(ys[i]) && Number.isFinite(ys[i + 1])) {
        area += (ys[i] + ys[i + 1]) * dx / 2;
      }
    }

    const yMinData = Math.min(0, ...finiteYs);
    const yMaxData = Math.max(0, ...finiteYs);
    let ySpan = yMaxData - yMinData;
    if (!(ySpan > 1e-9)) ySpan = 1;
    const yPad = ySpan * 0.12;
    const xPad = Math.abs(hi - lo) * 0.05;
    const bbox = [lo - xPad, hi + xPad, yMaxData + yPad, yMinData - yPad];

    return {
      xs, ys, lo, hi, N, dx, area, bbox,
      minY: yMinData, maxY: yMaxData, finiteCount: finiteYs.length
    };
  }, [compiled, a, b, n]);

  const tangentModel = useMemo(() => {
    if (!model || !compiled.fn) return null;
    const { lo, hi, xs, ys } = model;
    const t0 = Math.min(hi, Math.max(lo, Number.isFinite(xT) ? xT : lo));
    const h = Math.max(1e-6, Math.abs(hi - lo) * 1e-4);
    let yT = NaN;
    let slope = NaN;
    try {
      yT = compiled.fn(t0);
      slope = (compiled.fn(t0 + h) - compiled.fn(t0 - h)) / (2 * h);
    } catch (err) { yT = NaN; slope = NaN; }

    // Área acumulada desde a hasta x₀ (el área total ∫ₐᵇ no depende de x₀).
    let partialArea = 0;
    for (let i = 0; i < xs.length - 1; i += 1) {
      const xi = xs[i];
      const xj = xs[i + 1];
      if (xj <= t0) {
        if (Number.isFinite(ys[i]) && Number.isFinite(ys[i + 1])) {
          partialArea += (ys[i] + ys[i + 1]) * (xj - xi) / 2;
        }
      } else if (xi < t0) {
        if (Number.isFinite(ys[i]) && Number.isFinite(yT)) {
          partialArea += (ys[i] + yT) * (t0 - xi) / 2;
        }
        break;
      } else {
        break;
      }
    }
    return { t0, yT, slope, partialArea };
  }, [model, compiled, xT]);

  // P es un GLIDER nativo sobre una curva funcional cuyo parámetro ES x:
  // X(t)=t, Y(t)=f(t), t∈[lo,hi]. JSXGraph proyecta el punto sobre la curva en
  // cada movimiento, así que y₀=f(x₀) queda garantizado por el motor, no por
  // una recomputación manual (que además usaba Point.setCoords, inexistente en
  // 1.13.3). xT NO entra en rebuildKey: si entrara, cada frame del drag
  // destruiría el objeto que se está arrastrando.
  const tangentRef = useRef(null); // { board, JXG, glider, p1, p2, endpoints, arrows }
  const draggingRef = useRef(false);
  const tangencyChangeRef = useRef(setXT);
  tangencyChangeRef.current = setXT;
  const boundsRef = useRef({ lo: 0, hi: 1, fn: null });
  boundsRef.current = { lo: model?.lo ?? 0, hi: model?.hi ?? 1, fn: compiled.fn };

  // Publicar x₀ y los componentes una sola vez por frame evita que React
  // reconstruya el árbol en cada mousemove: era la causa de los saltos de P.
  const publishTangentFrame = useCallback((x, y, slope) => {
    const last = lastFrameRef.current;
    if (Math.abs(last.x - x) < 1e-9 && Math.abs(last.slope - slope) < 1e-9) return;
    lastFrameRef.current = { x, slope };
    pendingFrameRef.current = { x, y, slope };
    if (tangentFrameRef.current) return;
    tangentFrameRef.current = requestAnimationFrame(() => {
      tangentFrameRef.current = 0;
      const frame = pendingFrameRef.current;
      if (!frame) return;
      pendingFrameRef.current = null;
      setVectorView(vectorComponents(frame.y, frame.slope));
      tangencyChangeRef.current(frame.x);
    });
  }, []);

  useEffect(() => () => {
    if (tangentFrameRef.current) cancelAnimationFrame(tangentFrameRef.current);
  }, []);

  // p1/p2 sostienen la recta; los tres puntos "End" sostienen las flechas.
  // setPosition(COORDS_BY_USER, [x,y]) fija coordenadas absolutas sin recrear
  // objetos (setCoords no existe en Point 1.13.3). Un solo board.update al final.
  const moveTangentGeometry = useCallback((x) => {
    const st = tangentRef.current;
    if (!st?.board || !st.JXG || !st.p1 || !st.p2) return;
    const { lo, hi, fn } = boundsRef.current;
    const xx = Math.min(hi, Math.max(lo, Number.isFinite(x) ? x : lo));
    let y = NaN;
    try { y = fn ? fn(xx) : NaN; } catch (e) { y = NaN; }
    if (!Number.isFinite(y)) return;
    const h = Math.max(1e-6, Math.abs(hi - lo) * 1e-4);
    let slope = NaN;
    try { slope = (fn(xx + h) - fn(xx - h)) / (2 * h); } catch (e) { slope = NaN; }
    if (!Number.isFinite(slope)) return;

    const JXG = st.JXG;
    const span = (hi - lo) * 0.28;
    const x1 = Math.max(lo, xx - span);
    const x2 = Math.min(hi, xx + span);
    st.p1.setPosition(JXG.COORDS_BY_USER, [x1, y + slope * (x1 - xx)]);
    st.p2.setPosition(JXG.COORDS_BY_USER, [x2, y + slope * (x2 - xx)]);

    // Vectores en P: T unitario (dirección de cambio), N unitario (normal) y
    // E = P → (x₀, 0) (evaluación). Todos parten de P y usan la misma pendiente.
    const v = vectorComponents(y, slope);
    const L = (hi - lo) * 0.22;
    st.tanEnd?.setPosition(JXG.COORDS_BY_USER, [xx + v.tx * L, y + v.ty * L]);
    st.norEnd?.setPosition(JXG.COORDS_BY_USER, [xx + v.nx * L * 0.7, y + v.ny * L * 0.7]);
    st.evEnd?.setPosition(JXG.COORDS_BY_USER, [xx, 0]);
    st.evArrow?.setAttribute?.({ visible: Math.abs(y) > 1e-9 });

    st.board.update();
    publishTangentFrame(xx, y, slope);
  }, [publishTangentFrame]);
  const moveTangentRef = useRef(moveTangentGeometry);
  moveTangentRef.current = moveTangentGeometry;

  const syncTangent = useCallback((x) => {
    const st = tangentRef.current;
    if (!st?.board || !st.glider) return;
    const { lo, hi } = boundsRef.current;
    const xx = Math.min(hi, Math.max(lo, Number.isFinite(x) ? x : lo));
    // En pleno drag el glider ya está donde el puntero lo puso; recolocarlo
    // pelearía con el gesto. El handler del drag publica xT vía rAF.
    if (!draggingRef.current) st.glider.setGliderPosition(xx);
    moveTangentGeometry(xx);
  }, [moveTangentGeometry]);

  // El deslizador (o un cambio de dominio) mueve P sin reconstruir el tablero.
  const tangencyX = tangentModel ? tangentModel.t0 : null;
  useEffect(() => {
    if (tangencyX === null || draggingRef.current) return;
    syncTangent(tangencyX);
  }, [syncTangent, tangencyX]);

  // ---- Trazos: Libre / Recta / Círculo -------------------------------------
  // No se usan los sketchcurve nativos: JSXGraph los inicializa en CADA
  // mousedown (incluso al arrastrar P) y terminarían dibujando sobre el gesto
  // de tangencia. Nuestro trazo es una curva propia por gesto.
  // Un draft NO se publica hasta el 'up': si el gesto se cancela, no contamina
  // la lista de trazos confirmados. Al soltar, se convierte en datos + curva.

  const paintDraft = useCallback(() => {
    const board = boardApiRef.current;
    if (!board || !themeRef.current) return;
    const pts = strokeRenderPoints(draftRef.current);
    if (pts.length < 2) return;
    if (!draftElemRef.current) {
      draftElemRef.current = createStrokeCurve(board, themeRef.current, pts, { draft: true });
      board.update?.();
      return;
    }
    setStrokeCurvePoints(board, draftElemRef.current, pts);
  }, []);

  const removeDraftCurve = useCallback(() => {
    const board = boardApiRef.current;
    const el = draftElemRef.current;
    draftElemRef.current = null;
    if (!board || !el) return;
    try { board.removeObject(el); } catch (err) { /* ya eliminado */ }
    board.update?.();
  }, []);

  const paintStrokeStyles = useCallback(() => {
    const board = boardApiRef.current;
    const theme = themeRef.current;
    if (!board || !theme) return;
    strokesRef.current.forEach((stroke, i) => {
      const el = strokeElemsRef.current[i];
      if (!el?.setAttribute) return;
      const selected = stroke.id === selectedStrokeIdRef.current;
      el.setAttribute({
        strokeColor: selected ? theme.green : theme.pink,
        strokeWidth: selected ? 3.4 : 2.2,
        strokeOpacity: selected ? 1 : 0.9
      });
    });
    board.update?.();
  }, []);

  // El único objeto arrastrable del tablero es P: si el trazo empieza sobre su
  // marca en pantalla, se da prioridad al arrastre y no se dibuja.
  const overGlider = useCallback((evt) => {
    const st = tangentRef.current;
    const board = boardApiRef.current;
    if (!st?.glider || !board || typeof board.getMousePosition !== 'function') return false;
    const mouse = board.getMousePosition(evt);
    const scr = st.glider.coords?.scrCoords;
    if (!mouse || !scr) return false;
    return Math.hypot(mouse[0] - scr[1], mouse[1] - scr[2]) <= 16;
  }, []);

  // --- Edición dinámica de trazos ------------------------------------------
  // Seleccionar, trasladar y escalar son transformaciones de los DATOS del
  // trazo. La curva se reescribe desde esos datos y la exportación JSON los
  // lee directamente, así coordenadas visuales y exportadas nunca divergen.
  const selectStroke = useCallback((id) => {
    const stroke = strokesRef.current.find((s) => s.id === id) || null;
    const nextId = stroke ? stroke.id : null;
    selectedStrokeIdRef.current = nextId;
    setSelectedStrokeId(nextId);
    if (stroke) {
      const geom = snapshotStroke(stroke);
      selectionBaseRef.current = { geom, centroid: strokeCentroid(geom) };
    } else {
      selectionBaseRef.current = null;
    }
    setScaleFactor(1);
    paintStrokeStyles();
  }, [paintStrokeStyles]);

  const writeStrokeGeometry = useCallback((id, geom) => {
    const idx = strokesRef.current.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const stroke = strokesRef.current[idx];
    stroke.points = geom.points;
    stroke.start = geom.start;
    stroke.end = geom.end;
    setStrokeCurvePoints(boardApiRef.current, strokeElemsRef.current[idx], geom.points);
  }, []);

  const beginStrokeEdit = useCallback((evt) => {
    const board = boardApiRef.current;
    if (!board) return;
    const c = board.getUsrCoordsOfMouse(evt);
    if (![c[0], c[1]].every(Number.isFinite)) return;
    const { lo, hi } = boundsRef.current;
    const ySpan = Math.max(1, (model?.maxY ?? 1) - (model?.minY ?? 0));
    const threshold = 0.08 * Math.max(hi - lo, ySpan);
    let best = null;
    let bestD = Infinity;
    strokesRef.current.forEach((stroke) => {
      stroke.points.forEach((p) => {
        const d = Math.hypot(c[0] - p[0], c[1] - p[1]);
        if (d < bestD) { bestD = d; best = stroke; }
      });
    });
    if (!best || bestD > threshold) {
      selectStroke(null);
      return;
    }
    selectStroke(best.id);
    const base = selectionBaseRef.current;
    if (!base) return;
    editDragRef.current = {
      id: best.id,
      baseGeom: base.geom,
      centroid: base.centroid,
      lastPointer: [c[0], c[1]],
      startDist: Math.max(1e-6, Math.hypot(c[0] - base.centroid[0], c[1] - base.centroid[1]))
    };
  }, [model, selectStroke]);

  const applyStrokeEdit = useCallback((evt) => {
    const drag = editDragRef.current;
    const board = boardApiRef.current;
    if (!drag || !board) return;
    const c = board.getUsrCoordsOfMouse(evt);
    if (![c[0], c[1]].every(Number.isFinite)) return;
    if (editActionRef.current === 'move') {
      const dx = c[0] - drag.lastPointer[0];
      const dy = c[1] - drag.lastPointer[1];
      drag.lastPointer = [c[0], c[1]];
      const current = strokesRef.current.find((s) => s.id === drag.id);
      if (!current) return;
      writeStrokeGeometry(drag.id, translateStrokeGeometry(snapshotStroke(current), dx, dy));
    } else {
      const dist = Math.hypot(c[0] - drag.centroid[0], c[1] - drag.centroid[1]);
      const factor = Math.max(0.08, Math.min(12, dist / drag.startDist));
      writeStrokeGeometry(drag.id, scaleStrokeGeometry(drag.baseGeom, factor, drag.centroid));
      setScaleFactor(factor);
    }
  }, [writeStrokeGeometry]);

  const finishStrokeEdit = useCallback(() => {
    const drag = editDragRef.current;
    if (!drag) return;
    editDragRef.current = null;
    const stroke = strokesRef.current.find((s) => s.id === drag.id);
    if (stroke) {
      const geom = snapshotStroke(stroke);
      selectionBaseRef.current = { geom, centroid: strokeCentroid(geom) };
    }
    setScaleFactor(1);
    setStrokesView(strokesRef.current.map(strokeSummary));
  }, []);

  const applyScaleSlider = useCallback((value) => {
    setScaleFactor(value);
    const base = selectionBaseRef.current;
    const id = selectedStrokeIdRef.current;
    if (!base || id === null) return;
    writeStrokeGeometry(id, scaleStrokeGeometry(base.geom, value, base.centroid));
    setStrokesView(strokesRef.current.map(strokeSummary));
  }, [writeStrokeGeometry]);

  const toggleEditing = useCallback(() => {
    if (editing) {
      editDragRef.current = null;
      selectStroke(null);
      setEditing(false);
    } else {
      setPencil(false);
      setEditing(true);
    }
  }, [editing, selectStroke]);

  const togglePencil = useCallback(() => {
    if (!pencil) {
      editDragRef.current = null;
      selectStroke(null);
      setEditing(false);
    }
    setPencil((v) => !v);
  }, [pencil, selectStroke]);

  const onBoardDown = useCallback((evt) => {
    if (!boardApiRef.current) return;
    if (editingRef.current) { beginStrokeEdit(evt); return; }
    if (!pencilRef.current) return;
    if (overGlider(evt)) return;
    const c = boardApiRef.current.getUsrCoordsOfMouse(evt);
    if (![c[0], c[1]].every(Number.isFinite)) return;
    drawingRef.current = true;
    draftRef.current = {
      mode: strokeModeRef.current,
      start: [c[0], c[1]],
      current: [c[0], c[1]],
      pts: [[c[0], c[1]]]
    };
  }, [beginStrokeEdit, overGlider]);

  const onBoardMove = useCallback((evt) => {
    if (editDragRef.current) { applyStrokeEdit(evt); return; }
    if (!pencilRef.current || !drawingRef.current || !boardApiRef.current) return;
    const draft = draftRef.current;
    if (!draft) return;
    const c = boardApiRef.current.getUsrCoordsOfMouse(evt);
    if (![c[0], c[1]].every(Number.isFinite)) return;
    draft.current = [c[0], c[1]];
    if (draft.mode === 'free') {
      const pts = draft.pts;
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(c[0] - last[0], c[1] - last[1]) >= 1e-5) {
        pts.push([c[0], c[1]]);
        if (pts.length > STROKE_FREE_MAX_POINTS) pts.shift();
      }
    }
    paintDraft();
  }, [applyStrokeEdit, paintDraft]);

  const onBoardUp = useCallback(() => {
    // Red de seguridad: si el 'up' del glider no llega (puntero suelto fuera
    // del tablero), el board 'up' también libera el flag de arrastre.
    draggingRef.current = false;
    if (editDragRef.current) { finishStrokeEdit(); return; }
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const draft = draftRef.current;
    draftRef.current = null;
    removeDraftCurve();
    if (!draft) return;
    const points = strokeRenderPoints(draft);
    if (points.length < 2) {
      boardApiRef.current?.update?.();
      return;
    }
    // Confirmación: se conserva el trazo anterior Y se añade uno nuevo. Nada
    // de resetear un único array: por eso pueden dibujarse muchos seguidos.
    strokeSeqRef.current += 1;
    const stroke = {
      id: strokeSeqRef.current,
      mode: draft.mode,
      start: draft.start,
      end: draft.current,
      points
    };
    strokesRef.current = [...strokesRef.current, stroke];
    const board = boardApiRef.current;
    if (board && themeRef.current) {
      const el = createStrokeCurve(board, themeRef.current, points);
      if (el) strokeElemsRef.current = [...strokeElemsRef.current, el];
      board.update?.();
    }
    setStrokesView(strokesRef.current.map(strokeSummary));
    paintStrokeStyles();
  }, [finishStrokeEdit, paintStrokeStyles, removeDraftCurve]);

  const handleBoardReady = useCallback((info) => {
    const board = info?.board;
    if (!board) return;
    boardApiRef.current = board;
    // Neutralizamos los sketchcurve nativos: no queremos puntos sueltos al
    // hacer clic con el lápiz apagado ni un segundo trazo paralelo al nuestro.
    board.sketches?.forEach((s) => s?.setAttribute?.({ visible: false }));
    if (board.attr?.sketches) board.attr.sketches.enabled = false;
    if (board.attr?.pan) board.attr.pan.enabled = !pencilRef.current && !editingRef.current;
    board.on('down', onBoardDown);
    board.on('move', onBoardMove);
    board.on('up', onBoardUp);
  }, [onBoardDown, onBoardMove, onBoardUp]);

  const clearStroke = useCallback(() => {
    draftRef.current = null;
    drawingRef.current = false;
    editDragRef.current = null;
    selectionBaseRef.current = null;
    selectedStrokeIdRef.current = null;
    setSelectedStrokeId(null);
    setScaleFactor(1);
    removeDraftCurve();
    const board = boardApiRef.current;
    strokeElemsRef.current.forEach((el) => {
      try { board?.removeObject(el); } catch (err) { /* ya eliminado */ }
    });
    strokeElemsRef.current = [];
    strokesRef.current = [];
    setStrokesView([]);
    board?.update?.();
  }, [removeDraftCurve]);

  const exportStrokes = useCallback(() => {
    const payload = {
      estado: 'SIM · trazo local en tablero',
      nota: 'Coordenadas (x,y) en unidades de usuario del tablero JSXGraph, muestreadas del gesto local. No son mediciones físicas.',
      trazos: strokesRef.current.map(strokeSummary)
    };
    const uri = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'trazos_mmc_locales.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Con lápiz o edición activos se desactiva el pan: si no, arrastrar movería
  // los ejes en vez de dibujar/transformar. El arrastre de P sigue intacto porque
  // es una interacción de elemento, no de fondo.
  useEffect(() => {
    const board = boardApiRef.current;
    if (board?.attr?.pan) board.attr.pan.enabled = !pencil && !editing;
  }, [pencil, editing]);

  const buildIntegral = useCallback((board, ctx) => {
    if (!model) return;
    // Los trazos confirmados viven en strokesRef, NO en el board. Al reconstruir
    // se descartan solo las referencias visuales (los objetos ya se eliminaron)
    // y se vuelven a crear TODOS desde sus coordenadas. El tema se guarda para
    // que los handlers puedan pintar el draft con la misma paleta.
    themeRef.current = ctx.theme;
    draftElemRef.current = null;
    strokeElemsRef.current = [];
    const { xs, ys, bbox } = model;
    // t0/yT/slope viven en el modelo ligero de tangencia: xT no entra en
    // `model`, así el arrastre no recalcula 5000 muestras por frame.
    const t0 = tangentModel
      ? tangentModel.t0
      : Math.min(model.hi, Math.max(model.lo, Number.isFinite(xT) ? xT : model.lo));
    const yT = tangentModel ? tangentModel.yT : NaN;
    const slope = tangentModel ? tangentModel.slope : NaN;
    // El encuadre se recalcula con los datos: así b, la amplitud y ω cambian
    // la escala del tablero en el mismo redibujado, sin ejes fijos engañosos.
    if (Array.isArray(bbox) && typeof board.setBoundingBox === 'function') {
      board.setBoundingBox(bbox);
    }
    const finite = xs
      .map((x, i) => (Number.isFinite(ys[i]) ? [x, ys[i]] : null))
      .filter(Boolean);
    if (finite.length < 2) return;

    // Un polígono por lóbulo. buildAreaSegments ya interpoló cada cruce por
    // cero, así que no hay autointersección ni relleno even-odd con cortes.
    buildAreaSegments(xs, ys).forEach((segment) => {
      board.create('polygon', segment, {
        fillColor: ctx.theme.cyan, fillOpacity: 0.18,
        strokeColor: ctx.theme.cyan, strokeWidth: 1, strokeOpacity: 0.35,
        vertices: { visible: false }, fixed: true, highlight: false
      });
    });

    // La curva solo recibe muestras finitas: un NaN en el array hacía que
    // JSXGraph dibujara un tramo phantom y rompiera el trazado.
    board.create('curve', [finite.map((p) => p[0]), finite.map((p) => p[1])], {
      strokeColor: ctx.theme.cyan, strokeWidth: 2.2, fixed: true, highlight: false
    });

    // Capa SIM de campo vectorial. Se dibuja ANTES que los trazos para que
    // estos queden por encima; cambiar cualquier parámetro entra en rebuildKey.
    if (vectorField) {
      buildVectorField(board, ctx, {
        bbox, lo: model.lo, hi: model.hi, fn: boundsRef.current.fn,
        density: fieldDensity, scale: fieldScale,
        coupling: fieldCoupling, shear: fieldShear
      });
    }

    if (Number.isFinite(slope) && Number.isFinite(yT)) {
      const { lo, hi } = boundsRef.current;
      const span = (hi - lo) * 0.28;
      const x1 = Math.max(lo, t0 - span);
      const x2 = Math.min(hi, t0 + span);

      // Curva de restricción INVISIBLE: X(t)=t, Y(t)=f(t), t∈[lo,hi]. El glider
      // se crea sobre ella, de modo que el motor mantenga y₀=f(x₀) y que el
      // parámetro del glider sea exactamente x₀ (setGliderPosition(x₀) funciona).
      const constraint = board.create('curve', [
        (t) => t,
        (t) => { try { return boundsRef.current.fn?.(t); } catch (e) { return NaN; } },
        [lo, hi]
      ], { visible: false, fixed: true, highlight: false });

      // Dos puntos helper invisibles: moverlos con setPosition mueve la recta
      // sin recrearla (y sin perder el objeto que se está arrastrando).
      const p1 = board.create('point', [x1, yT + slope * (x1 - t0)], {
        visible: false, fixed: true
      });
      const p2 = board.create('point', [x2, yT + slope * (x2 - t0)], {
        visible: false, fixed: true
      });
      board.create('line', [p1, p2], {
        strokeColor: ctx.theme.amber, strokeWidth: 2, dash: 4,
        fixed: true, highlight: false
      });

      // P = glider nativo. No hay setCoords: JSXGraph proyecta el punto dentro
      // de [lo,hi] en cada movimiento y recalcula la derivada en vivo.
      const glider = board.create('glider', [t0, yT, constraint], {
        name: 'P', size: 4, fillColor: ctx.theme.amber, strokeColor: ctx.theme.amber,
        label: { strokeColor: ctx.theme.amber, fontSize: 12 },
        fixed: false, highlight: true
      });
      glider.on('drag', () => {
        draggingRef.current = true;
        const raw = Number(glider.X());
        const xx = Math.min(hi, Math.max(lo, Number.isFinite(raw) ? raw : lo));
        moveTangentRef.current(xx);
      });
      glider.on('up', () => { draggingRef.current = false; });

      // Vectores explícitos que PARTEN de P. Los extremos son puntos invisibles
      // fijos: moverlos con setPosition actualiza la flecha sin recrearla.
      const v = vectorComponents(yT, slope);
      const L = (hi - lo) * 0.22;
      const tanEnd = board.create('point', [t0 + v.tx * L, yT + v.ty * L], {
        visible: false, fixed: true
      });
      const norEnd = board.create('point', [t0 + v.nx * L * 0.7, yT + v.ny * L * 0.7], {
        visible: false, fixed: true
      });
      const evEnd = board.create('point', [t0, 0], {
        visible: false, fixed: true
      });
      const tanArrow = board.create('arrow', [glider, tanEnd], {
        strokeColor: ctx.theme.amber, strokeWidth: 2.2, fixed: true, highlight: false
      });
      const norArrow = board.create('arrow', [glider, norEnd], {
        strokeColor: ctx.theme.green, strokeWidth: 2, fixed: true, highlight: false
      });
      const evArrow = board.create('arrow', [glider, evEnd], {
        strokeColor: ctx.theme.cyan, strokeWidth: 1.4, dash: 3,
        fixed: true, highlight: false, visible: Math.abs(yT) > 1e-9
      });

      tangentRef.current = {
        board, JXG: ctx.JXG, glider, p1, p2, constraint,
        tanEnd, norEnd, evEnd, tanArrow, norArrow, evArrow
      };
    } else {
      tangentRef.current = null;
    }

    // Trazos confirmados: una curva por gesto, reconstruida desde los datos.
    // Al cambiar preset, límites o amplitud no se pierde ningún dibujo previo.
    strokesRef.current.forEach((stroke) => {
      if (!Array.isArray(stroke.points) || stroke.points.length < 2) return;
      const el = createStrokeCurve(board, ctx.theme, stroke.points);
      if (el) strokeElemsRef.current.push(el);
    });

    // Si el tablero se reconstruyera a mitad de un gesto, se recupera el draft.
    if (draftRef.current) paintDraft();
    paintStrokeStyles();
  }, [
    model, tangentModel, xT, vectorField, fieldDensity, fieldScale,
    fieldCoupling, fieldShear, paintDraft, paintStrokeStyles
  ]);

  const rebuildIntegral = useCallback((board, ctx) => {
    clearJsxGraphBoard(board);
    buildIntegral(board, ctx);
  }, [buildIntegral]);

  // xT queda FUERA: durante el drag cada frame cambiaría la key, el tablero se
  // reconstruiría y el glider que se está arrastrando desaparecería. El drag se
  // resuelve moviendo la geometría y publicando xT; el deslizador comparte el
  // mismo estado React (syncTangent recoloca el glider solo cuando no hay drag).
  const rebuildKey = [
    expr, amp, omega, poly.B, poly.C, a, b, n,
    vectorField ? 1 : 0, fieldDensity, fieldScale, fieldCoupling, fieldShear,
    model ? model.bbox.join(',') : 'sin-modelo'
  ].join('|');

  const slopeText = tangentModel && Number.isFinite(tangentModel.slope)
    ? `f′(${tangentModel.t0.toFixed(3)}) = ${tangentModel.slope.toFixed(6)}`
    : 'f′(x₀) = no disponible en este punto';

  // La proyección 3D NO decide el estado: lo hereda de la fuente. S35 es un
  // snapshot acotado publicado por el núcleo MMC; si no está publicado se dice
  // NO_DATA en vez de inventar una forma de onda. Los trazos son SIM por ser
  // generados en el navegador y se normalizan solo para la vista.
  const projection = useMemo(() => {
    if (projectionSource === 'signal') {
      const sig = mathLiveSignal;
      const published = Boolean(sig?.published);
      const paths = published ? projectSeriesToPaths(sig.samples) : [];
      // Herencia exacta: el proyector no decide ni reetiqueta. Un estado
      // desconocido se degrada a NO_DATA, nunca a SIM (que sería una invención).
      const inherited = PROJECTION_STATES.has(sig?.estado) ? sig.estado : 'NO_DATA';
      const estado = !published
        ? 'NO_DATA'
        : sig.estado === 'ROTO' ? 'ROTO'
          : paths.length ? inherited : 'NO_DATA';
      const rangeLabel = published && estado !== 'ROTO'
        && Number.isFinite(sig?.min) && Number.isFinite(sig?.max)
        ? `rango original ${sig.min} … ${sig.max}${Number.isFinite(sig?.rms) ? ` · rms ${sig.rms}` : ''}`
        : '';
      return {
        paths,
        estado,
        color: PROJECTION_STATE_COLOR[estado],
        rangeLabel,
        sourceLabel: published
          ? `${sig.sourceLabel || 'S35'} · ${sig.sampleCount ?? 0} muestras · fs ${sig.fs ?? '—'} Hz${sig.clase_senal ? ` · clase ${sig.clase_senal}` : ''}`
          : 'S35 sin publicar en esta sesión: abrí el núcleo matemático para publicar la señal activa.',
        note: published && estado !== 'ROTO'
          ? 'Serie temporal → hélice: ángulo = tiempo normalizado, altura = valor normalizado. La normalización es solo visual: el rango original se muestra en el HUD y la serie completa sigue en el store; no se eleva LOCAL a REAL-LOCAL ni SIM a REAL.'
          : ''
      };
    }
    const paths = projectStrokesToPaths(strokesView);
    const estado = paths.length ? 'SIM' : 'NO_DATA';
    return {
      paths,
      estado,
      color: PROJECTION_STATE_COLOR[estado],
      rangeLabel: '',
      sourceLabel: paths.length
        ? `${paths.length} trazo(s) del tablero MMC · coordenadas (x,y) apiladas en capas z`
        : 'Sin trazos confirmados: dibujá sobre el tablero para alimentar la proyección.',
      note: 'Trazos generados en el navegador: SIM. Se normalizan para visualizar; el JSON 2D conserva las coordenadas originales.'
    };
  }, [projectionSource, mathLiveSignal, strokesView]);

  const handlePreset = (e) => {
    const key = e.target.value;
    setPreset(key);
    if (INTEGRAL_PRESETS[key]) setExpr(INTEGRAL_PRESETS[key].expr);
  };

  return (
    <div className="interactive-section" id="section-integrals">
      <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>Análisis Matemático: Derivadas e Integrales</h3>
      <MmcTag
        produce={['curva de referencia', 'área acumulada', 'recta tangente']}
        hacia={['validación teórica', 'Electrónica · filtrado', 'Knowledge Hub']}
      />
      <p className="board-note">MODELADO · SIM: la expresión se evalúa en el navegador con el parser del MMC, sin eval. Usá A (amplitud) y W (frecuencia ω) para que los deslizadores incidan sobre la curva.</p>

      <div className="controls">
        <div className="ctrl">
          <label>Preset</label>
          <select value={preset} onChange={handlePreset}>
            {Object.entries(INTEGRAL_PRESETS).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
            <option value="custom">Personalizada</option>
          </select>
        </div>
        <div className="ctrl">
          <label htmlFor="integral-a">a (inicio)</label>
          <input
            id="integral-a" type="text" inputMode="decimal" value={aText}
            onChange={(e) => {
              const text = e.target.value;
              setAText(text);
              const value = parseFloat(text);
              if (Number.isFinite(value)) setA(value);
            }}
            onBlur={() => {
              const value = parseFloat(aText);
              if (Number.isFinite(value)) { setA(value); setAText(String(value)); }
              else setAText(String(a));
            }}
          />
        </div>
        <div className="ctrl">
          <label htmlFor="integral-b">b (fin)</label>
          <input
            id="integral-b" type="text" inputMode="decimal" value={bText}
            onChange={(e) => {
              const text = e.target.value;
              setBText(text);
              const value = parseFloat(text);
              if (Number.isFinite(value)) setB(value);
            }}
            onBlur={() => {
              const value = parseFloat(bText);
              if (Number.isFinite(value)) { setB(value); setBText(String(value)); }
              else setBText(String(b));
            }}
          />
        </div>
        <div className="ctrl"><label>Subdivisiones N</label><input type="range" min="20" max="2000" step="10" value={n} onChange={(e) => setN(parseInt(e.target.value, 10))} /></div>
        <div className="ctrl"><label>Amplitud{usesAmp ? '' : ' (sin uso)'}</label><input type="range" min="0" max="3" step="0.1" value={amp} onChange={(e) => setAmp(parseFloat(e.target.value))} /></div>
        <div className="ctrl"><label>Frecuencia ω{usesOmega ? '' : ' (sin uso)'}</label><input type="range" min="0.2" max="5" step="0.1" value={omega} onChange={(e) => setOmega(parseFloat(e.target.value))} /></div>
        <div className="ctrl">
          <label>x₀ (tangencia)</label>
          <input
            type="range" min={model ? model.lo : 0} max={model ? model.hi : 1} step="0.01"
            value={tangentModel ? tangentModel.t0 : xT} onChange={(e) => setXT(parseFloat(e.target.value))}
            aria-label="Posición x cero de la recta tangente"
          />
        </div>
        <div className="ctrl">
          <label>Lápiz</label>
          <button
            type="button"
            onClick={togglePencil}
            aria-pressed={pencil}
            className={`px-2 py-1 border rounded text-[10px] transition ${
              pencil
                ? 'bg-fuchsia-800 border-fuchsia-400 text-white'
                : 'bg-fuchsia-900/20 border-fuchsia-700 text-fuchsia-200 hover:bg-fuchsia-800/50'
            }`}
          >
            {pencil ? '✎ Lápiz ACTIVO' : '✎ Lápiz off'}
          </button>
        </div>
        <div className="ctrl">
          <label htmlFor="stroke-mode">Modo trazo</label>
          <select
            id="stroke-mode"
            value={strokeMode}
            onChange={(e) => setStrokeMode(e.target.value)}
            aria-label="Modo de trazo sobre el tablero"
          >
            {Object.entries(STROKE_MODES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>
        <div className="ctrl">
          <label>Trazo</label>
          <button
            type="button"
            onClick={clearStroke}
            className="px-2 py-1 bg-slate-800/40 border border-slate-600 rounded text-[10px] text-slate-200 hover:bg-slate-700/50 transition"
          >
            Limpiar trazo
          </button>
        </div>

        <div className="ctrl">
          <label>Editar trazo</label>
          <button
            type="button"
            onClick={toggleEditing}
            aria-pressed={editing}
            className={`px-2 py-1 border rounded text-[10px] transition ${
              editing
                ? 'bg-emerald-800 border-emerald-400 text-white'
                : 'bg-emerald-900/20 border-emerald-700 text-emerald-200 hover:bg-emerald-800/50'
            }`}
          >
            {editing ? '✥ Edición ACTIVA' : '✥ Edición off'}
          </button>
        </div>
        <div className="ctrl">
          <label htmlFor="edit-action">Acción</label>
          <select
            id="edit-action"
            value={editAction}
            onChange={(e) => setEditAction(e.target.value)}
            aria-label="Acción de edición sobre el trazo seleccionado"
          >
            <option value="move">Mover / trasladar</option>
            <option value="scale">Escalar</option>
          </select>
        </div>
        <div className="ctrl">
          <label htmlFor="stroke-select">Trazo seleccionado</label>
          <select
            id="stroke-select"
            value={selectedStrokeId === null ? '' : String(selectedStrokeId)}
            onChange={(e) => selectStroke(e.target.value === '' ? null : parseInt(e.target.value, 10))}
            aria-label="Seleccionar trazo a editar"
          >
            <option value="">— ninguno —</option>
            {strokesView.map((stroke) => (
              <option key={stroke.id} value={stroke.id}>#{stroke.id} · {stroke.modeLabel}</option>
            ))}
          </select>
        </div>
        <div className="ctrl">
          <label>Escala (sobre selección)</label>
          <input
            type="range" min="0.1" max="4" step="0.05"
            value={scaleFactor}
            disabled={selectedStrokeId === null}
            onChange={(e) => applyScaleSlider(parseFloat(e.target.value))}
            aria-label="Factor de escala del trazo seleccionado"
          />
          <span style={{ color: '#ccc' }}>×{scaleFactor.toFixed(2)}</span>
        </div>

        <div className="ctrl">
          <label>Campo vectorial (SIM)</label>
          <button
            type="button"
            onClick={() => setVectorField((v) => !v)}
            aria-pressed={vectorField}
            className={`px-2 py-1 border rounded text-[10px] transition ${
              vectorField
                ? 'bg-teal-800 border-teal-400 text-white'
                : 'bg-teal-900/20 border-teal-700 text-teal-200 hover:bg-teal-800/50'
            }`}
          >
            {vectorField ? '⋚ Campo ACTIVO' : '⋚ Campo off'}
          </button>
        </div>
        <div className="ctrl"><label>Densidad campo</label><input type="range" min="4" max="12" step="1" value={fieldDensity} onChange={(e) => setFieldDensity(parseInt(e.target.value, 10))} aria-label="Densidad del campo vectorial" /></div>
        <div className="ctrl"><label>Escala campo</label><input type="range" min="0.3" max="2" step="0.1" value={fieldScale} onChange={(e) => setFieldScale(parseFloat(e.target.value))} aria-label="Escala de magnitud del campo vectorial" /></div>
        <div className="ctrl"><label>Acoplamiento β·f(x)</label><input type="range" min="-2" max="2" step="0.1" value={fieldCoupling} onChange={(e) => setFieldCoupling(parseFloat(e.target.value))} aria-label="Acoplamiento del campo con f de x" /></div>
        <div className="ctrl"><label>Cizalla γ·y</label><input type="range" min="-1" max="1" step="0.1" value={fieldShear} onChange={(e) => setFieldShear(parseFloat(e.target.value))} aria-label="Cizalla del campo con y" /></div>

        {preset === 'poly' && (
          <>
            <div className="ctrl"><label>B</label><input type="range" min="-5" max="5" step="0.1" value={poly.B} onChange={(e) => setPoly({ ...poly, B: parseFloat(e.target.value) })} /></div>
            <div className="ctrl"><label>C</label><input type="range" min="-5" max="5" step="0.1" value={poly.C} onChange={(e) => setPoly({ ...poly, C: parseFloat(e.target.value) })} /></div>
          </>
        )}
        <div className="ctrl integral-expr">
          <label htmlFor="integral-expr">f(x)</label>
          <input
            id="integral-expr"
            type="text"
            value={expr}
            spellCheck="false"
            aria-label="Expresión matemática f de x"
            onChange={(e) => { setExpr(e.target.value); setPreset('custom'); }}
          />
        </div>
      </div>

      <div className="mmc-eq" style={{ margin: '6px 0' }}>
        <MmcEquation tex={compiled.tex ? `f(x)=${compiled.tex}` : ''} ariaLabel="Ecuación introducida" />
      </div>

      {compiled.error && (
        <div className="board-error" role="status">No se pudo evaluar la expresión: {compiled.error}</div>
      )}
      {!compiled.error && !model && (
        <div className="board-error" role="status">La expresión no produjo puntos finitos en el intervalo. Revisá la fórmula o los límites.</div>
      )}

      <div className="board-frame">
        <MmcJsxGraphBoard
          build={buildIntegral}
          rebuild={rebuildIntegral}
          rebuildKey={rebuildKey}
          boundingbox={model ? model.bbox : [-1, 7, 3, -3]}
          height={340}
          ariaLabel="Gráfica de f(x), área bajo la curva, recta tangente en x cero, vectores tangente normal y evaluación desde P, campo vectorial simulado y trazos libres rectos o circulares editables"
          onReady={handleBoardReady}
        />
      </div>
      <p className="board-note">Cian: f(x) y área con signo por lóbulos · Ámbar: recta tangente, punto P y vector T (dirección) · Verde: vector N (normal) y campo SIM · Discontinuo cian: vector E (P → eje x). Arrastrá P: glider sobre la curva, x queda clampado a [a,b] y y₀=f(x₀); los componentes se actualizan en vivo. «Campo vectorial (SIM)» dibuja V(x,y)=k·(1, f′(x)+β·f(x)+γ·y), dirección normalizada y longitud según |V|: es una visualización simulada, no una medición. «Editar trazo» permite seleccionar un trazo (también desde el selector) y moverlo o escalarlo; la exportación JSON usa las coordenadas ya transformadas.</p>

      <div className="mmc-projection-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => setProjection3D((v) => !v)}
          aria-pressed={projection3D}
          className={`px-2 py-1 border rounded text-[10px] transition ${
            projection3D
              ? 'bg-sky-800 border-sky-400 text-white'
              : 'bg-sky-900/20 border-sky-700 text-sky-200 hover:bg-sky-800/50'
          }`}
        >
          {projection3D ? '◼ Ocultar proyección 3D' : '◧ Mostrar proyección 3D'}
        </button>
        <label htmlFor="projection-source" style={{ fontSize: 10, color: '#94a3b8' }}>Fuente 3D</label>
        <select
          id="projection-source"
          value={projectionSource}
          onChange={(e) => setProjectionSource(e.target.value)}
          aria-label="Fuente de datos de la proyección 3D"
          style={{ background: '#0b1220', color: '#94a3b8', border: '1px solid #1e293b', fontSize: 10 }}
        >
          <option value="signal">Señal activa S35 (store MMC)</option>
          <option value="strokes">Trazos del tablero</option>
        </select>
        <span style={{ fontSize: 10, color: PROJECTION_STATE_COLOR[projection.estado] || '#64748b' }}>
          {projection.estado} · {projection.paths.reduce((n, p) => n + p.points.length, 0)} pts
        </span>
      </div>
      {projection3D && (
        <MmcSignal3DProjection
          title={`Proyección 3D · ${projectionSource === 'signal' ? 'S35' : 'trazos MMC'}`}
          estado={projection.estado}
          sourceLabel={projection.sourceLabel}
          rangeLabel={projection.rangeLabel}
          paths={projection.paths}
          color={projection.color}
          note={projection.note}
        />
      )}

      <details className="board-note" style={{ marginTop: 6 }}>
        <summary style={{ cursor: 'pointer', color: '#ff77d4' }}>
          SIM · trazo local en tablero — coordenadas (x, y) · {strokesView.length} trazo(s)
        </summary>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', margin: '6px 0' }}>
          <button
            type="button"
            onClick={exportStrokes}
            disabled={strokesView.length === 0}
            className="px-2 py-1 bg-fuchsia-900/20 border border-fuchsia-700 rounded text-[10px] text-fuchsia-200 hover:bg-fuchsia-800/50 transition disabled:opacity-40"
          >
            ⬇ Exportar coordenadas (JSON)
          </button>
          <span>Coordenadas en unidades de usuario del tablero; no son mediciones físicas.</span>
        </div>
        {strokesView.length === 0 ? (
          <p>Activá el lápiz y dibujá para generar muestras (x, y).</p>
        ) : (
          strokesView.map((stroke) => (
            <div key={stroke.id} style={{ marginTop: 6 }}>
              <b>#{stroke.id} · {stroke.modeLabel}</b> — {stroke.pointCount} muestras · inicio ({stroke.start[0].toFixed(3)}, {stroke.start[1].toFixed(3)}) · fin ({stroke.end[0].toFixed(3)}, {stroke.end[1].toFixed(3)})
              <pre style={{ maxHeight: 96, overflow: 'auto', margin: '4px 0', fontSize: 10 }}>
                {JSON.stringify(stroke.points.slice(0, 24))}
                {stroke.points.length > 24 ? `\n… ${stroke.points.length - 24} muestras más (ver exportación)` : ''}
              </pre>
            </div>
          ))
        )}
      </details>

      <div className="board-metrics">
        <div>Área ∫ₐᵇ f(x) dx (trapecios): <b>{model ? model.area.toFixed(6) : '—'}</b></div>
        <div>Área acumulada ∫ₐˣ⁰ f(x) dx: <b>{tangentModel ? tangentModel.partialArea.toFixed(6) : '—'}</b></div>
        <div>{slopeText}</div>
        <div>x₀: <b>{tangentModel ? tangentModel.t0.toFixed(4) : '—'}</b> · f(x₀): <b>{tangentModel && Number.isFinite(tangentModel.yT) ? tangentModel.yT.toFixed(6) : '—'}</b></div>
        <div>T (tangente): <b>({vectorView ? vectorView.tx.toFixed(3) : '—'}, {vectorView ? vectorView.ty.toFixed(3) : '—'})</b> · N (normal): <b>({vectorView ? vectorView.nx.toFixed(3) : '—'}, {vectorView ? vectorView.ny.toFixed(3) : '—'})</b></div>
        <div>E (P → eje x): <b>({vectorView ? vectorView.evalX.toFixed(3) : '—'}, {vectorView ? vectorView.evalY.toFixed(3) : '—'})</b> · |f(x₀)|: <b>{vectorView ? Math.abs(vectorView.y).toFixed(3) : '—'}</b></div>
        <div>Subdivisiones N: <b>{model ? model.N : '—'}</b> · Δx: <b>{model ? model.dx.toFixed(6) : '—'}</b></div>
        <div>Intervalo: <b>[{Number.isFinite(a) ? a : '—'}, {Number.isFinite(b) ? b : '—'}]</b></div>
        <div>Muestras finitas: <b>{model ? model.finiteCount : 0}</b></div>
        <div>Amplitud A: <b>{amp.toFixed(2)}</b> · Frecuencia ω: <b>{omega.toFixed(2)}</b></div>
        <div>Campo vectorial: <b>{vectorField ? `SIM · β=${fieldCoupling.toFixed(1)} · γ=${fieldShear.toFixed(1)}` : 'off'}</b></div>
      </div>

    </div>
  );
};

// Eigenvalores 2x2
const EigenvaluesInteractive = () => {
  const [a,setA]=useState(1),[b,setB]=useState(0),[c,setC]=useState(0),[d,setD]=useState(1);
  const {lambda1, lambda2, v1, v2, complex} = useMemo(()=>{
    const tr=a+d; const det=a*d-b*c; const raw=tr*tr-4*det;
    // Con discriminante negativo no hay autovectores reales: antes Math.sqrt
    // devolvía NaN y la caja mostraba λ=NaN. Se declara el par complejo y se
    // explicita que no se representa en este plano 2x2 real.
    if (raw < -1e-12) {
      return {
        lambda1: null, lambda2: null, v1: null, v2: null,
        complex: { re: tr / 2, im: Math.sqrt(-raw) / 2 }
      };
    }
    const disc=Math.sqrt(Math.max(0, raw));
    const l1=(tr+disc)/2, l2=(tr-disc)/2;
    const v1= b!==0 ? [l1-d, b] : [1, (l1-a)];
    const v2= b!==0 ? [l2-d, b] : [1, (l2-a)];
    return {lambda1:l1, lambda2:l2, v1, v2, complex:null};
  },[a,b,c,d]);
  return (
    <div className="interactive-section" id="section-eigen">
      <h3 className="text-xl font-bold" style={{ color:'#00ffff' }}>Eigenvalores y Eigenvectores (2×2)</h3>
      <MmcTag
        produce={['espectro propio', 'direcciones invariantes']}
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
      <p style={{color:'#aab2ba'}}>
        {complex
          ? `λ = ${complex.re.toFixed(3)} ± ${complex.im.toFixed(3)}i · autovalores complejos: no hay direcciones invariantes reales en este plano 2×2`
          : `λ₁=${lambda1.toFixed(3)} , λ₂=${lambda2.toFixed(3)} | v₁≈[${v1.map(v=>v.toFixed(2)).join(', ')}] , v₂≈[${v2.map(v=>v.toFixed(2)).join(', ')}]`}
      </p>
    </div>
  );
};

const DiffEqInteractive = () => {
  const [y0, setY0] = useState(1);
  const [xMax, setXMax] = useState(5);
  const plot = useMemo(() => {
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
    const mapX = (x) => 40 + (x / xMax) * 420;
    const mapY = (y) => 170 - ((y - minY) / (maxY - minY + 1e-9)) * 140;
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x)} ${mapY(p.y)}`).join(' ');
    return { path, mapX, mapY, minY, maxY };
  }, [y0, xMax]);
  const yAxisY = Math.max(20, Math.min(180, plot.mapY(0)));

  return (
    <div className="interactive-section">
      <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>Ecuación Diferencial: dy/dx + y = e^x</h3>
      <MmcTag
        produce={['solución exacta', 'curva de respuesta']}
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
      <div className="board-frame">
        <svg className="mmc-plot" viewBox="0 0 500 200" role="img" aria-label="Gráfica de la solución exacta con rejilla y ejes">
          <defs>
            <linearGradient id="gradLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#00ffff" />
              <stop offset="100%" stopColor="#ff00ff" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="500" height="200" fill="#0b0b1a" />
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line x1={40 + p * 420} y1={30} x2={40 + p * 420} y2={170} stroke="#16202e" strokeWidth="1" />
              <line x1={40} y1={30 + p * 140} x2={460} y2={30 + p * 140} stroke="#16202e" strokeWidth="1" />
            </g>
          ))}
          <line x1={40} y1={yAxisY} x2={460} y2={yAxisY} stroke="#2b3a52" strokeWidth="1" />
          <line x1={plot.mapX(0)} y1={30} x2={plot.mapX(0)} y2={170} stroke="#2b3a52" strokeWidth="1" />
          <path d={plot.path} fill="none" stroke="url(#gradLine)" strokeWidth="2" />
          <text x={464} y={yAxisY - 5} fill="#64748b" fontSize="9">x</text>
          <text x={plot.mapX(0) + 5} y={24} fill="#64748b" fontSize="9">y</text>
          <text x={40} y={192} fill="#64748b" fontSize="9">0</text>
          <text x={460} y={192} fill="#64748b" fontSize="9" textAnchor="end">{xMax}</text>
        </svg>
      </div>
      <p style={{ color:'#aab2ba' }}>Solución exacta: y(x) = 1/2 e^x + (y(0) - 1/2) e^(-x)</p>
    </div>
  );
};

// Geometría: mapa polar NO lineal (rotación + vórtice dependiente del radio +
// deformación radial con lóbulos). La rotación euclidiana queda como un caso
// particular (swirl = 0, petal = 0). Toda la malla se dibuja con MmcJsxGraphBoard
// sobre el mismo motor; no se sustituye ningún simulador externo.
const GeometryInteractive = () => {
  const [theta, setTheta] = useState(30);
  const [swirl, setSwirl] = useState(0.6);
  const [petal, setPetal] = useState(0.25);
  const [lobes, setLobes] = useState(3);
  const [probe, setProbe] = useState({ x: 2.2, y: 0.8 });

  const rad = useMemo(() => (theta * Math.PI) / 180, [theta]);

  // T(x,y): giro global + giro proporcional al radio (vórtice) + escala radial
  // modulada por un seno de `lobes` lóbulos. Es no lineal y suave en el origen.
  const transform = useCallback((x, y) => {
    const r = Math.hypot(x, y);
    const phi = Math.atan2(y, x);
    const r1 = r * (1 + petal * Math.sin(lobes * phi));
    const phi1 = phi + rad + swirl * r;
    return [r1 * Math.cos(phi1), r1 * Math.sin(phi1)];
  }, [rad, swirl, petal, lobes]);

  const probeImage = useMemo(
    () => transform(probe.x, probe.y),
    [transform, probe]
  );

  // Jacobiano local por diferencias centradas: dato derivado del mapa, no texto
  // teórico. det J < 0 indica que la malla se pliega en ese punto.
  const jacobian = useMemo(() => {
    const h = 1e-4;
    const [xp, yp] = transform(probe.x + h, probe.y);
    const [xm, ym] = transform(probe.x - h, probe.y);
    const [xq, yq] = transform(probe.x, probe.y + h);
    const [xr, yr] = transform(probe.x, probe.y - h);
    const dxx = (xp - xm) / (2 * h);
    const dyx = (yp - ym) / (2 * h);
    const dxy = (xq - xr) / (2 * h);
    const dyy = (yq - yr) / (2 * h);
    return dxx * dyy - dxy * dyx;
  }, [transform, probe]);

  const BASE = useMemo(() => ([
    [-1.2, -1.2], [1.2, -1.2], [1.2, 1.2], [-1.2, 1.2], [-1.2, -1.2]
  ]), []);

  const GRID = useMemo(() => [-3, -1.5, 0, 1.5, 3], []);

  const mapSegment = useCallback((x0, y0, x1, y1) => {
    const refX = []; const refY = []; const defX = []; const defY = [];
    const steps = 32;
    for (let i = 0; i <= steps; i += 1) {
      const u = i / steps;
      const x = x0 + (x1 - x0) * u;
      const y = y0 + (y1 - y0) * u;
      const [X, Y] = transform(x, y);
      refX.push(x); refY.push(y); defX.push(X); defY.push(Y);
    }
    return { refX, refY, defX, defY };
  }, [transform]);

  const buildGeometry = useCallback((board, ctx) => {
    const { theme } = ctx;

    // Lista plana de pares [x,y]: `polygon` y `curve` con dos arrays ya están
    // verificados en este archivo (Fourier e integrales). Sin APIs nuevas.
    GRID.forEach((g) => {
      [mapSegment(g, -3, g, 3), mapSegment(-3, g, 3, g)].forEach((seg) => {
        board.create('curve', [seg.refX, seg.refY], {
          strokeColor: theme.axis, strokeWidth: 0.8, dash: 2,
          fixed: true, highlight: false
        });
        board.create('curve', [seg.defX, seg.defY], {
          strokeColor: theme.cyan, strokeWidth: 1.2,
          fixed: true, highlight: false
        });
      });
    });

    const deformedBase = BASE.map(([x, y]) => transform(x, y));
    board.create('polygon', BASE.map(([x, y]) => [x, y]), {
      strokeColor: theme.axis, strokeWidth: 1.2, dash: 2,
      fillOpacity: 0.02, vertices: { visible: false }, fixed: true, highlight: false
    });
    board.create('polygon', deformedBase.map(([x, y]) => [x, y]), {
      strokeColor: theme.pink, strokeWidth: 2, fillColor: theme.pink,
      fillOpacity: 0.12, vertices: { visible: false }, fixed: true, highlight: false
    });

    board.create('curve', [[probe.x, probeImage[0]], [probe.y, probeImage[1]]], {
      strokeColor: theme.amber, strokeWidth: 1, dash: 2, fixed: true, highlight: false
    });
    board.create('point', [probe.x, probe.y], {
      name: 'P', strokeColor: theme.amber, fillColor: theme.amber,
      size: 3, fixed: true, label: { strokeColor: theme.amber, fontSize: 12 }
    });
    board.create('point', [probeImage[0], probeImage[1]], {
      name: "P'", strokeColor: theme.pink, fillColor: theme.pink,
      size: 3, fixed: true, label: { strokeColor: theme.pink, fontSize: 12 }
    });
  }, [BASE, GRID, mapSegment, probe, probeImage, transform]);

  // Mismo contrato que los demás tableros: rebuildKey dispara rebuild y
  // clearJsxGraphBoard evita apilar curvas al mover cualquier deslizador.
  const rebuildGeometry = useCallback((board, ctx) => {
    clearJsxGraphBoard(board);
    if (typeof board.setBoundingBox === 'function') board.setBoundingBox([-5, 5, 5, -5]);
    buildGeometry(board, ctx);
  }, [buildGeometry]);

  return (
    <div className="interactive-section" id="section-geometry">
      <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>Geometría: malla deformada y mapa no lineal</h3>
      <MmcTag
        produce={['malla deformada', 'mapa no lineal', 'trayectoria P → T(P)', 'jacobiano local']}
        hacia={['Álgebra y geometría', 'Análisis de señales · espacio de fase', 'Knowledge Hub']}
      />
      <p className="mmc-note">SIM · malla y transformación calculadas en el navegador; no es una medición.</p>
      <div className="controls">
        <div className="ctrl">
          <label>Ángulo θ (°)</label>
          <input type="range" min="0" max="180" step="1" value={theta} onChange={(e) => setTheta(parseInt(e.target.value))} />
          <span style={{ color: '#ccc' }}>{theta}°</span>
        </div>
        <div className="ctrl">
          <label>Vórtice</label>
          <input type="range" min="-1.5" max="1.5" step="0.05" value={swirl} onChange={(e) => setSwirl(parseFloat(e.target.value))} />
          <span style={{ color: '#ccc' }}>{swirl.toFixed(2)}</span>
        </div>
        <div className="ctrl">
          <label>Deformación radial</label>
          <input type="range" min="-0.4" max="0.4" step="0.01" value={petal} onChange={(e) => setPetal(parseFloat(e.target.value))} />
          <span style={{ color: '#ccc' }}>{petal.toFixed(2)}</span>
        </div>
        <div className="ctrl">
          <label>Lóbulos</label>
          <input type="range" min="2" max="6" step="1" value={lobes} onChange={(e) => setLobes(parseInt(e.target.value))} />
          <span style={{ color: '#ccc' }}>{lobes}</span>
        </div>
        <div className="ctrl">
          <label>P · x</label>
          <input type="range" min="-3" max="3" step="0.1" value={probe.x} onChange={(e) => setProbe({ ...probe, x: parseFloat(e.target.value) })} />
          <span style={{ color: '#ccc' }}>{probe.x.toFixed(1)}</span>
        </div>
        <div className="ctrl">
          <label>P · y</label>
          <input type="range" min="-3" max="3" step="0.1" value={probe.y} onChange={(e) => setProbe({ ...probe, y: parseFloat(e.target.value) })} />
          <span style={{ color: '#ccc' }}>{probe.y.toFixed(1)}</span>
        </div>
      </div>
      <div className="board-frame narrow">
        <MmcJsxGraphBoard
          build={buildGeometry}
          rebuild={rebuildGeometry}
          rebuildKey={`${theta}-${swirl}-${petal}-${lobes}-${probe.x}-${probe.y}`}
          boundingbox={[-5, 5, 5, -5]}
          height={340}
          ariaLabel="Malla de referencia y malla deformada por rotación, vórtice y deformación radial, con punto P y su imagen"
        />
      </div>
      <div className="board-metrics">
        <div>T(P): <b>({probeImage[0].toFixed(3)}, {probeImage[1].toFixed(3)})</b></div>
        <div>det J en P: <b>{Number.isFinite(jacobian) ? jacobian.toFixed(4) : '—'}</b></div>
        <div>θ = {theta}° · vórtice = {swirl.toFixed(2)} · lóbulos = {lobes}</div>
      </div>
      <p style={{ color: '#aab2ba' }}>
        Gris discontinuo: malla y cuadrado de referencia. Cian: malla transformada. Rosa: imagen del cuadrado y de P. Ámbar: P y su unión con T(P).
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
    board.create('curve', [wave.map((p) => p.t), wave.map((p) => p.y)], {
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
    board.create('curve', [emWave.map((p) => p.t), emWave.map((p) => p.y)], {
      strokeColor: ctx.theme.cyan, strokeWidth: 1.2, fixed: true, highlight: false
    });
  }, [emWave]);

  const buildDemod = useCallback((board, ctx) => {
    board.create('curve', [emDemod.map((p) => p.t), emDemod.map((p) => p.y)], {
      strokeColor: ctx.theme.amber, strokeWidth: 2, fixed: true, highlight: false
    });
  }, [emDemod]);

  // rebuildKey dispara estos callbacks: sin ellos el tablero solo se dibujaba
  // en el montaje y los deslizadores no tenían efecto visible.
  const rebuildWave = useCallback((board, ctx) => {
    clearJsxGraphBoard(board);
    buildWave(board, ctx);
  }, [buildWave]);

  const rebuildSpec = useCallback((board, ctx) => {
    clearJsxGraphBoard(board);
    buildSpec(board, ctx);
  }, [buildSpec]);

  const rebuildAm = useCallback((board, ctx) => {
    clearJsxGraphBoard(board);
    buildAm(board, ctx);
  }, [buildAm]);

  const rebuildDemod = useCallback((board, ctx) => {
    clearJsxGraphBoard(board);
    buildDemod(board, ctx);
  }, [buildDemod]);

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
          rebuild={rebuildWave}
          rebuildKey={`${f1}-${f3}-${a1}-${a3}`}
          boundingbox={[-0.35, 2 * Math.PI + 0.35, 4.5, -4.5]}
          height={260}
          ariaLabel="Suma de armónicos en el tiempo, eje fijo"
        />
      </div>
      <div className="svg-wrap">
        <MmcJsxGraphBoard
          build={buildSpec}
          rebuild={rebuildSpec}
          rebuildKey={`${f1}-${f3}-${a1}-${a3}`}
          boundingbox={[-0.7, 10.3, 1.2, -1.2]}
          height={180}
          ariaLabel="Espectro discreto de armónicos, posiciones ligadas a f1 y f3"
        />
      </div>
      </div>
      <h4 className="text-lg font-bold" style={{color:'#ffd32a', marginTop:12}}>Señal AM y envolvente demodulada</h4>
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
          rebuild={rebuildAm}
          rebuildKey={`${em.fc}-${em.fm}-${em.depth}`}
          boundingbox={[-0.25, 4.25, 2.4, -2.4]}
          height={200}
          ariaLabel="Señal AM modulada"
        />
      </div>
      <div className="svg-wrap">
        <MmcJsxGraphBoard
          build={buildDemod}
          rebuild={rebuildDemod}
          rebuildKey={`${em.fc}-${em.fm}-${em.depth}`}
          boundingbox={[-0.25, 4.25, 1.4, -0.2]}
          height={200}
          ariaLabel="Envolvente demodulada por rectificación y filtro, entre cero y uno"
        />
      </div>
      </div>
    </div>
  );
};

// Complejo: mapeo z -> z^2. SVG puro: el viewBox se deriva del rango real de
// z y de w = z², así ningún extremo queda recortado. La malla del dominio y su
// imagen hacen visible el mapeo conforme sin inventar un motor pesado.
const ComplexInteractive = () => {
  const [scale, setScale] = useState(1);
  const gridValues = useMemo(() => [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2], []);
  const grid = useMemo(() => {
    const pts = [];
    for (const x of gridValues) for (const y of gridValues) pts.push({ x, y });
    return pts;
  }, [gridValues]);
  const mapped = useMemo(
    () => grid.map((p) => ({ x: p.x * p.x - p.y * p.y, y: 2 * p.x * p.y })),
    [grid]
  );

  // Rectas x=c e y=c del dominio y sus imágenes bajo z²:
  //   (c+iy)² = c²-y² + i·2cy   → parábola
  //   (x+ic)² = x²-c² + i·2xc   → parábola
  const mesh = useMemo(() => {
    const lines = [];
    for (const c of [-2, -1, 0, 1, 2]) {
      lines.push({
        c,
        domainX: gridValues.map((y) => ({ x: c, y })),
        domainY: gridValues.map((x) => ({ x, y: c })),
        imageX: gridValues.map((y) => ({ x: c * c - y * y, y: 2 * c * y })),
        imageY: gridValues.map((x) => ({ x: x * x - c * c, y: 2 * c * x }))
      });
    }
    return lines;
  }, [gridValues]);

  const dataExtent = useMemo(() => {
    let m = 0;
    for (const p of grid) m = Math.max(m, Math.abs(p.x), Math.abs(p.y));
    for (const p of mapped) m = Math.max(m, Math.abs(p.x), Math.abs(p.y));
    return m || 1;
  }, [grid, mapped]);

  // El slider ya no multiplica píxeles por unidad (eso recortaba w=±8 en un
  // canvas de ±3,3). Ahora ajusta el margen del encuadre: siempre queda al
  // menos 5% de holgura alrededor de TODO el rango z y w.
  const margin = 1.55 - 0.25 * scale; // 0.5→1.425 · 1→1.30 · 2→1.05
  const halfH = dataExtent * margin;
  const halfW = halfH * (500 / 280);
  const viewBox = `${-halfW} ${-halfH} ${2 * halfW} ${2 * halfH}`;

  // En coordenadas de datos el eje Y de SVG crece hacia abajo: se invierte y.
  const pts = (arr) => arr.map((p) => `${p.x},${-p.y}`).join(' ');
  const meshLine = (arr, color) => (
    <polyline points={pts(arr)} fill="none" stroke={color} strokeWidth={0.035} />
  );

  return (
    <div className="interactive-section" id="section-complex">
      <h3 className="text-xl font-bold" style={{ color: '#00ffff' }}>Variable Compleja: f(z)=z²</h3>
      <MmcTag
        produce={['mapeo conforme', 'plano complejo']}
        hacia={['transformaciones analíticas', 'Knowledge Hub']}
      />
      <p className="mmc-note">CÁLCULO · SIM: mapeo construido en el navegador, no dato medido. Las rectas grises de z se transforman en parábolas rosas de w.</p>
      <div className="controls">
        <div className="ctrl">
          <label>Encuadre</label>
          <input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />
          <span style={{ color: '#ccc' }}>×{scale.toFixed(1)}</span>
        </div>
      </div>
      <div className="board-frame narrow">
      <div className="svg-wrap">
        <svg className="mmc-plot" viewBox={viewBox} role="img" aria-label="Mapeo z a z cuadrado: malla del dominio en gris y su imagen en rosa, con ejes Re e Im">
          <rect x={-halfW} y={-halfH} width={2 * halfW} height={2 * halfH} fill="#0b0b1a" />

          {/* Ejes Re/Im con origen y referencia en los enteros del dominio. */}
          <line x1={-halfW} y1={0} x2={halfW} y2={0} stroke="#5b6b80" strokeWidth={0.05} />
          <line x1={0} y1={-halfH} x2={0} y2={halfH} stroke="#5b6b80" strokeWidth={0.05} />
          {[-2, -1, 0, 1, 2].map((t) => (
            <g key={t}>
              <circle cx={t} cy={0} r={0.07} fill="#5b6b80" />
              <circle cx={0} cy={-t} r={0.07} fill="#5b6b80" />
            </g>
          ))}
          <text x={0.2} y={-0.3} fill="#8b98a8" fontSize={0.34}>0</text>
          <text x={halfW - 1.2} y={-0.35} fill="#8b98a8" fontSize={0.4}>Re</text>
          <text x={0.3} y={-halfH + 0.7} fill="#8b98a8" fontSize={0.4}>Im</text>

          {/* Malla del dominio y su imagen. */}
          {mesh.map((l) => (
            <g key={l.c}>
              {meshLine(l.domainX, 'rgba(150,160,175,.35)')}
              {meshLine(l.domainY, 'rgba(150,160,175,.35)')}
              {meshLine(l.imageX, 'rgba(255,60,199,.30)')}
              {meshLine(l.imageY, 'rgba(255,60,199,.30)')}
            </g>
          ))}
          {grid.map((p, i) => <circle key={i} cx={p.x} cy={-p.y} r={0.07} fill="#9aa6b5" />)}
          {mapped.map((p, i) => <circle key={'m' + i} cx={p.x} cy={-p.y} r={0.09} fill="#ff3cc7" />)}

          {/* Leyenda: z (dominio) vs w=z² (imagen). */}
          <g>
            <rect x={-halfW + 0.5} y={-halfH + 0.5} width={6.4} height={2.1} fill="#0b0b1a" fillOpacity={0.85} stroke="#1f2937" strokeWidth={0.03} />
            <circle cx={-halfW + 1.1} cy={-halfH + 1.15} r={0.11} fill="#9aa6b5" />
            <text x={-halfW + 1.5} y={-halfH + 1.28} fill="#cbd5e1" fontSize={0.38}>z · dominio</text>
            <circle cx={-halfW + 1.1} cy={-halfH + 1.9} r={0.13} fill="#ff3cc7" />
            <text x={-halfW + 1.5} y={-halfH + 2.03} fill="#cbd5e1" fontSize={0.38}>w = z² · imagen</text>
          </g>
        </svg>
      </div>
      </div>
      <p style={{ color: '#aab2ba' }}>
        z y −z comparten imagen (el mapeo es 2 a 1): la malla gris se pliega sobre las parábolas rosas. El módulo se eleva al cuadrado y el argumento se duplica.
      </p>
    </div>
  );
};
