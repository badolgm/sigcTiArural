// MMC · Adapter de JSXGraph (motor visual del Laboratorio Matemático).
//
// ESTE FICHERO ES LA FRONTERA. Ningún componente debe importar 'jsxgraph'
// directamente: todo pasa por aquí. Si mañana el motor cambia, se toca este
// adapter y el registro, no los instrumentos.
//
// Decisiones que este adapter_encode:
//
//  1. CARGA PEREZOSA. `import('jsxgraph')` diferido para que el motor no entre
//     en el bundle inicial de quien no abre el laboratorio. El namespace es un
//     default export (`export default JXG` en src/index.js). Nota: el paquete
//     declara `exports` sin subrutas, así que `jsxgraph/distrib/...` NO resuelve
//     (ERR_PACKAGE_PATH_NOT_EXPORTED). El CSS se importa del vendor por eso.
//
//  2. LIBRERÍA DE TEMA. JSXGraph trae un tema 'dark' propio pero con colores
//     genéricos; el MMC usa MMC_PALETTE para que todos los tableros del
//     laboratorio se vean como un único Scientific Workbench.
//
//  3. MUESTREO EN REJILLA UNIFORME. Los puntos que dibuja JSXGraph son
//     adaptativos (numberpointshigh/low): sirven para dibujar, NO para la
//     ciencia. `sampleCurveUniform` fuerza fs explícito y tiempo t0 + i/fs para
//     no acumular error. Confianza 1.0 solo si todos los valores son finitos.
//
//  4. SIN ESTADO GLOBAL. JXG.boards es global del motor. Cada tablero se crea
//     sobre un elemento propio (nunca por id) y se libera con freeBoard, que
//     además vacía el contenedor y desregistra el board.

import '../../../vendor/jsxgraph/jsxgraph.css';
import { loadEngine as loadEngineVendor } from '../../../vendor/jsxgraph/loadEngine.js';

/** Identificador declarativo del motor, tal como figura en engines.js. */
export const ENGINE_ID = 'math-jsxgraph';

/** Versión verificada en node_modules/jsxgraph/package.json el 2026-09-30. */
export const ENGINE_VERSION_FALLBACK = '1.13.3';

/** Rama de licencia que adoptó SIGCT-Rural: sin copyleft ni uso-no-comercial. */
export const ENGINE_LICENSE = 'MIT';

/** Paleta única del MMC. Todos los tableros la comparten. */
export const MMC_PALETTE = {
  bg: '#05070d',
  panel: '#0a0e18',
  grid: '#141c2e',
  axis: '#2b3a52',
  text: '#94a3b8',
  textDim: '#475569',
  curve: '#00ffff',
  curveAlt: '#ff3cc7',
  accent: '#39ff14',
  warn: '#ffb300',
  vector: '#ffd32a',
  point: '#ff6b6b'
};

let engineInstance = null;

/**
 * Carga perezosa del motor UMD auto-hospedado y cacheo del namespace.
 *
 * El wrapper del vendor resuelve el global `JXG`; aqui se guarda la referencia
 * para que `isEngineLoaded` / `createBoard` / `destroyBoard` la consulten.
 * @returns {Promise<object>} namespace de JSXGraph
 */
export async function loadEngine() {
  const JXG = await loadEngineVendor();
  engineInstance = JXG;
  return engineInstance;
}

/** ¿Motor ya cargado en memoria? Permite pintar la UI sin esperar al import. */
export const isEngineLoaded = () => engineInstance !== null;

/**
 * Versión real en runtime si el motor la publica; si no, la verificada.
 * @returns {string}
 */
export function engineVersion() {
  const v = engineInstance && (engineInstance.version || engineInstance.VERSION);
  return v || ENGINE_VERSION_FALLBACK;
}

/**
 * Procedencia del motor para las etiquetas de honestidad.
 * Se muestra junto al valor, nunca escondido.
 */
export function engineProvenance() {
  return {
    engine: 'jsxgraph',
    version: engineVersion(),
    license: ENGINE_LICENSE,
    licenseFull: 'MIT OR LGPL-3.0-or-later',
    adapter: 'mmc/adapters/jsxgraphAdapter.js'
  };
}

/**
 * Crea un tablero sobre un elemento host ya dimensionado.
 * @param {HTMLElement} host elemento con width/height en px
 * @param {object} [opts]
 * @returns {object} board de JSXGraph
 */
export function createBoard(host, opts = {}) {
  if (!engineInstance) {
    throw new Error('MMC/jsxgraph: loadEngine() debe resolverse antes de createBoard()');
  }
  const {
    boundingbox = [-5, 5, 5, -5],
    axis = true,
    grid = false,
    showCopyright = false,
    showNavigation = true,
    keepaspectratio = false,
    pan = { enabled: true },
    zoom = { enabled: true, wheel: true },
    drag = { enabled: true },
    renderer = 'svg'
  } = opts;

  const axisAttrs = {
    strokeColor: MMC_PALETTE.axis,
    strokeWidth: 1,
    withLabel: true,
    label: { strokeColor: MMC_PALETTE.textDim, fontSize: 10 },
    name: { strokeColor: MMC_PALETTE.text, fontSize: 11 },
    tick: { strokeColor: MMC_PALETTE.axis, majorHeight: 6, minorHeight: 3, fontSize: 9, label: { strokeColor: MMC_PALETTE.textDim } }
  };

  return engineInstance.JSXGraph.initBoard(host, {
    boundingbox,
    axis: axis ? axisAttrs : false,
    grid,
    showCopyright,
    showNavigation,
    keepaspectratio,
    pan,
    zoom,
    drag,
    renderer,
    // Fondo del SVG gestionado por el tema del MMC, no por el default blanco.
    backgroundColor: MMC_PALETTE.bg
  });
}

/**
 * Libera un tablero. freeBoard quita handlers, objetos, listeners ARIA, vacía el
 * contenedor y desregistra el board de JXG.boards. Idempotente.
 * @param {object|null} board
 */
export function destroyBoard(board) {
  if (!board || !engineInstance) return;
  try {
    engineInstance.JSXGraph.freeBoard(board);
  } catch (err) {
    // Un tablero ya liberado no debe romper el desmontaje de React.
    console.warn('[MMC/jsxgraph] freeBoard falló:', err);
  }
}

/** Atributos de estilo comunes para curvas del MMC. */
function curveAttrs(strokeColor, extra = {}) {
  return {
    strokeColor,
    strokeWidth: 2,
    highlight: false,
    withLabel: false,
    ...extra
  };
}

/**
 * Grafica y(t) = fn(t) como curva paramétrica sobre el dominio [t0, t1].
 * Devuelve la curva: curve.X(t) e curve.Y(t) son invocables (sampling in-process).
 * @param {object} board
 * @param {Function} fn
 * @param {object} cfg
 * @returns {object} curve
 */
export function plotFunctionCurve(board, fn, cfg = {}) {
  const { t0 = 0, t1 = 6.28, color = MMC_PALETTE.curve, name = 'y(t)' } = cfg;
  const span = Math.max(t1 - t0, 1e-9);
  // Puntos de dibujo adaptativos: con f alta y dominio corto se necesitan muchos
  // puntos para que la curva no se vea poligonal ni genere líneas verticales.
  // 400 puntos son insuficientes para f=100 Hz en [0, 0.02] (200 ciclos).
  const drawPoints = Math.max(400, Math.ceil(span * 2000));
  const curve = board.create(
    'curve',
    [
      (t) => t,
      fn,
      t0,
      t1
    ],
    curveAttrs(color, {
      numberPoints: drawPoints
    })
  );
  if (name) {
    board.create('text', [-4.6, 4.5, () => name], {
      strokeColor: color,
      fontSize: 11,
      highlight: false,
      fixed: true
    });
  }
  return curve;
}

/**
 * Grafica un data plot a partir de arrays crudos.
 * Esta es la via de entrada para senales externas en fases futuras.
 * @param {object} board
 * @param {{time:ArrayLike<number>, values:ArrayLike<number>}} series
 * @param {object} cfg
 * @returns {object} curve
 */
export function plotDataCurve(board, series, cfg = {}) {
  const { color = MMC_PALETTE.accent } = cfg;
  const xs = Array.from(series.time, Number);
  const ys = Array.from(series.values, Number);
  return board.create('curve', [xs, ys], curveAttrs(color));
}

/**
 * Muestreo en rejilla uniforme de una curva JSXGraph.
 *
 * Es el camino que hace valuable este motor: curve.Y(t) es una llamada JS
 * directa, sin ida y vuelta, sin parseo de cadenas y sin serialización.
 *
 * @param {object} curve devuelta por plotFunctionCurve
 * @param {{fs:number, t0:number, t1:number}} cfg
 * @returns {{time:Float64Array, values:Float64Array, fs:number, sampleCount:number, finite:boolean}}
 */
export function sampleCurveUniform(curve, cfg = {}) {
  const { fs = 1000, t0 = 0, t1 = 1 } = cfg;
  const safeFs = fs > 0 ? fs : 1000;
  const span = Math.max(0, t1 - t0);
  const sampleCount = Math.max(2, Math.floor(span * safeFs) + 1);
  const time = new Float64Array(sampleCount);
  const values = new Float64Array(sampleCount);

  let finite = true;
  for (let i = 0; i < sampleCount; i += 1) {
    // t0 + i/fs evita la deriva acumulativa de t0 + i*dt
    const t = t0 + i / safeFs;
    const y = curve.Y(t);
    time[i] = t;
    values[i] = y;
    if (!Number.isFinite(y)) finite = false;
  }

  return { time, values, fs: safeFs, sampleCount, finite };
}

/**
 * Muestrea una función pura sin board. Es la vía rápida: cuando el usuario mueve
 * un slider, esto recalcula sin necesidad de redibujar el tablero.
 * @param {Function} fn
 * @param {{fs:number, t0:number, t1:number}} cfg
 */
export function sampleFunctionUniform(fn, cfg = {}) {
  const { fs = 1000, t0 = 0, t1 = 1 } = cfg;
  const safeFs = fs > 0 ? fs : 1000;
  const span = Math.max(0, t1 - t0);
  const sampleCount = Math.max(2, Math.floor(span * safeFs) + 1);
  const time = new Float64Array(sampleCount);
  const values = new Float64Array(sampleCount);

  let finite = true;
  for (let i = 0; i < sampleCount; i += 1) {
    const t = t0 + i / safeFs;
    const y = fn(t);
    time[i] = t;
    values[i] = y;
    if (!Number.isFinite(y)) finite = false;
  }

  return { time, values, fs: safeFs, sampleCount, finite };
}

/** Estadísticos de una serie muestreada. Se muestran junto al valor. */
export function describeSeries(series) {
  const { values } = series;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let finite = 0;
  for (let i = 0; i < values.length; i += 1) {
    const v = values[i];
    if (Number.isFinite(v)) {
      finite += 1;
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
    }
  }
  return {
    min: finite ? min : NaN,
    max: finite ? max : NaN,
    mean: finite ? sum / finite : NaN,
    peakToPeak: finite ? max - min : NaN,
    finite
  };
}

export default {
  ENGINE_ID,
  ENGINE_LICENSE,
  MMC_PALETTE,
  loadEngine,
  isEngineLoaded,
  engineVersion,
  engineProvenance,
  createBoard,
  destroyBoard,
  plotFunctionCurve,
  plotDataCurve,
  sampleCurveUniform,
  sampleFunctionUniform,
  describeSeries
};