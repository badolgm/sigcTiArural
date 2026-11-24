import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../theme/mmcWorkbench.css';
import MmcJsxGraphBoard from './MmcJsxGraphBoard.jsx';
import MmcEquation from './MmcEquation.jsx';
import DockToolbar from './DockToolbar.jsx';
import DockPanel from './DockPanel.jsx';
import {
  ENGINE_ID,
  describeSeries,
  engineVersion,
  plotDataCurve,
  plotFunctionCurve,
  sampleFunctionUniform
} from '../adapters/jsxgraphAdapter.js';
import { VISUAL_ENGINE } from '../engines.js';
import { compileEquation, equationToTex } from '../parse/equationParser.js';
import { MODEL_ESTADO, MODEL_INTEGRATION_POINTS, buildWorkspaceModel } from '../workspace/modelContract.js';
import { useLabStore } from '../../../stores/useLabStore.js';
import {
  CALCULUS_VERSION,
  analyzeRealSeries,
  computeDerivative,
  computeIntegral,
  computeVectorCalculus
} from '../numerical/realSeriesCalculus.js';
import {
  computeRealSeries,
  loadEnvelopeCatalog,
  loadEnvelopeSample
} from '../../../services/realSeriesService.js';

// MMC — Núcleo matemático visual: el pilar del laboratorio.
//
// REGLA FUNDAMENTAL QUE IMPLEMENTA: el estudiante modela SIN PROGRAMAR. Escribe
// una ecuación, mueve deslizadores, ve la curva y la serie. Pyodide queda como
// motor computacional para el CAS futuro; aquí no se escribe Python.
//
// SEPARACIÓN DE PODERES:
//   1. equationParser traduce texto a función numérica. Sin motor gráfico.
//   · jsxgraphAdapter dibuja y muestrea. Sin interpretar texto.
//   · React + KaTeX  son dueños del texto. JSXGraph es dueño de la geometría.
//
// ESTADO HONESTO: la ECUACIÓN es SIM (se calcula en rejilla uniforme con fs
// explícito, nunca leyendo los puntos adaptativos del motor). La serie de
// contraste es REAL-LOCAL cuando viene de una captura propia (envelope RMS del
// dataset acústico o WAV local) y LOCAL cuando es un CSV aportado por el usuario,
// cuya proveniencia no se verifica aquí. Nunca se mezclan: verde = dato, cian =
// modelo. Ninguna fuente se escribe en disco ni se envía a otro servicio.

const DEFAULT_EXPRESSION = 'y(t)=2*sin(2*pi*100*t)';

// Parametrización equivalente al escenario por defecto. Es la misma ecuación con
// los literales promovidos a parámetros deslizantes: 2 -> A, 100 -> f.
const PARAMETRIC_EXPRESSION = 'y(t)=A*sin(2*pi*f*t)+offset';

// Modelo de envolvente de energía: ajuste natural para la serie RMS por frame
// del dataset acústico propio. `decay` es un parámetro (NO la constante `tau`
// del parser, que vale 2π y está reservada).
const ENVELOPE_EXPRESSION = 'y(t)=offset+A*exp(-t/decay)';

// Deslizadores del instrumento. `unit` solo es informativo.
const PARAM_DEFS = [
  { name: 'A', label: 'Amplitud A', min: 0, max: 5, step: 0.01, value: 2, unit: '' },
  { name: 'f', label: 'Frecuencia f', min: 1, max: 500, step: 1, value: 100, unit: 'Hz' },
  { name: 'offset', label: 'Desplazamiento', min: -2, max: 2, step: 0.01, value: 0, unit: '' },
  { name: 'decay', label: 'Decaimiento', min: 0.005, max: 1.5, step: 0.005, value: 0.15, unit: 's' }
];

// Capacidades declaradas. Las que no están implementadas lo dicen: es preferible
// un `preparado` explícito que un botón que no hace nada.
const CAPACIDADES = [
  { id: 'funciones', label: 'Funciones', estado: 'OPERACIONAL' },
  { id: 'senales', label: 'Señales', estado: 'OPERACIONAL' },
  { id: 'matrices', label: 'Matrices', estado: 'PREPARADO' },
  { id: 'geometria', label: 'Geometría', estado: 'PREPARADO' },
  { id: 'sistemas', label: 'Sistemas', estado: 'PREPARADO' },
  { id: 'exportar', label: 'Exportar', estado: 'OPERACIONAL' }
];

const formatTime = (s) => (Math.abs(s) >= 1 ? s.toFixed(3) : s.toFixed(6));

// Publicación S35 → useLabStore. El snapshot es ACOTADO: resumen estadístico +
// muestras diezmadas. Nunca se publican los arrays completos ni se escribe a
// disco: el store es memoria de sesión, no un registro de evidencia.
const MAX_SNAPSHOT_SAMPLES = 64;
const roundStat = (v) => (Number.isFinite(v) ? Number(v.toFixed(6)) : null);

const summarizeSnapshot = (values) => {
  if (!Array.isArray(values)) return null;
  let min = Infinity;
  let max = -Infinity;
  let sumSq = 0;
  let n = 0;
  for (let i = 0; i < values.length; i += 1) {
    const v = values[i];
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
    sumSq += v * v;
    n += 1;
  }
  if (!n) return null;
  return { min: roundStat(min), max: roundStat(max), rms: roundStat(Math.sqrt(sumSq / n)) };
};

const boundedSnapshotSamples = (time, values, limit = MAX_SNAPSHOT_SAMPLES) => {
  const n = Math.min(time?.length ?? 0, values?.length ?? 0);
  if (!n) return [];
  const stride = Math.max(1, Math.ceil(n / limit));
  const out = [];
  for (let i = 0; i < n; i += stride) {
    out.push([roundStat(time[i]), roundStat(values[i])]);
  }
  return out;
};

// Muestreo gobernado SOLO para dibujar: los cálculos se hacen con la serie
// completa, nunca con esta versión diezmada.
const MAX_CURVE_POINTS = 512;
const downsampleCurve = (time, values, limit = MAX_CURVE_POINTS) => {
  const srcTime = Array.from(time ?? [], Number);
  const srcValues = Array.from(values ?? [], Number);
  const n = Math.min(srcTime.length, srcValues.length);
  if (!n) return { time: [], values: [] };
  const stride = Math.max(1, Math.ceil(n / limit));
  const out = { time: [], values: [] };
  for (let i = 0; i < n; i += stride) {
    if (!Number.isFinite(srcTime[i]) || !Number.isFinite(srcValues[i])) continue;
    out.time.push(srcTime[i]);
    out.values.push(srcValues[i]);
  }
  return out;
};

/**
 * Alto nominal del plot. Es un valor de reserva, no el que manda: el CSS lo
 * sobrescribe con `clamp(340px, 52vh, 760px)` para que el gráfico crezca con la
 * ventana. Se pasa igual porque el componente del tablero necesita una altura
 * numérica para dimensionar su host antes de que CSS aplique.
 */
const PLOT_HEIGHT = 460;

const MAX_CSV_ROWS = 10000;
const MAX_CSV_BYTES = 2 * 1024 * 1024;
const MAX_REAL_BYTES = 8 * 1024 * 1024;
const MAX_WAV_POINTS = 8000;

// Contrato del dataset acústico propio (cmsc_data_logger v1): 3,0 s a 44,1 kHz,
// N_FFT 4096 y hop 2048 => 63 frames por clip. La serie de envolventes guarda la
// feature 4 (RMS espectral) por frame. El tiempo se reconstruye desde el hop;
// no es una forma de onda cruda y así se declara en la interfaz.
const ENVELOPE_SCHEMA = 'cmsc.acoustic.envelopes.v1';
const ACOUSTIC_SAMPLE_RATE = 44100;
const ACOUSTIC_FRAME_HOP = 2048;
const ENVELOPE_SOURCE_PATH = 'data/datasets/sigct_rural_acoustic/v1/features/acoustic_envelopes_v1.json';

/**
 * Parsea `time,value` íntegramente en memoria: sin disco, sin store y sin fetch.
 * La primera fila no numérica se acepta como cabecera; cualquier otra fila
 * inválida se rechaza con su número para no dibujar datos inventados.
 */
const parseCsvSeries = (text) => {
  const time = [];
  const values = [];
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(/[;,]/).map((p) => p.trim());
    if (parts.length < 2) throw new Error(`fila ${i + 1}: se esperaban 2 columnas`);
    const t = Number(parts[0]);
    const v = Number(parts[1]);
    if (!Number.isFinite(t) || !Number.isFinite(v)) {
      if (i === 0) continue; // cabecera `time,value`
      throw new Error(`fila ${i + 1}: valores no numéricos`);
    }
    if (time.length >= MAX_CSV_ROWS) throw new Error(`límite de ${MAX_CSV_ROWS} filas excedido`);
    time.push(t);
    values.push(v);
  }
  if (time.length < 2) throw new Error('se necesitan al menos 2 muestras');
  return { time, values };
};

/**
 * Catálogo de envolventes RMS del dataset propio. Se valida el schema antes de
 * ofrecer muestras: un JSON ajeno no se convierte silenciosamente en dato real.
 */
const parseEnvelopeCatalog = (text) => {
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (err) {
    throw new Error('JSON no válido');
  }
  if (!payload || payload.schema !== ENVELOPE_SCHEMA || !payload.envelopes || typeof payload.envelopes !== 'object') {
    throw new Error(`se esperaba el schema ${ENVELOPE_SCHEMA}`);
  }
  const ids = Object.keys(payload.envelopes).filter(
    (id) => Array.isArray(payload.envelopes[id]) && payload.envelopes[id].length >= 2
  );
  if (ids.length === 0) throw new Error('sin envolventes de al menos 2 muestras');
  return {
    ids,
    envelopes: payload.envelopes,
    declaredCount: Number(payload.count) || ids.length
  };
};

/** Serie time/value derivada de una envolvente: t_i = i*hop/sr (63 frames). */
const envelopeSeries = (catalog, sampleId) => {
  const raw = catalog?.envelopes?.[sampleId];
  if (!Array.isArray(raw) || raw.length < 2) throw new Error('muestra no disponible');
  const values = raw.map((v) => Number(v));
  if (values.some((v) => !Number.isFinite(v))) {
    throw new Error('la envolvente contiene valores no finitos');
  }
  const dt = ACOUSTIC_FRAME_HOP / ACOUSTIC_SAMPLE_RATE;
  return { time: values.map((_, i) => i * dt), values };
};

/**
 * WAV local: se decodifica en memoria con el AudioContext del navegador. No
 * abre micrófono, no escribe en disco y no envía el audio a ningún servicio.
 * Se submuestrea para que la comparación siga siendo interactiva.
 */
const decodeWavFile = async (file) => {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) throw new Error('el navegador no expone AudioContext');
  const ctx = new Ctor();
  try {
    const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
    const channel = buffer.getChannelData(0);
    const stride = Math.max(1, Math.ceil(channel.length / MAX_WAV_POINTS));
    const time = [];
    const values = [];
    for (let i = 0; i < channel.length; i += stride) {
      time.push(i / buffer.sampleRate);
      values.push(channel[i]);
    }
    if (values.length < 2) throw new Error('el WAV no tiene suficientes muestras');
    return { time, values, sampleRate: buffer.sampleRate, frames: channel.length };
  } finally {
    if (typeof ctx.close === 'function') await ctx.close();
  }
};

const MmcMathematicsCore = () => {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
  const [params, setParams] = useState(() =>
    PARAM_DEFS.reduce((acc, p) => ({ ...acc, [p.name]: p.value }), {})
  );
  const [t0, setT0] = useState(0);
  const [t1, setT1] = useState(0.02);
  const [fs, setFs] = useState(2000);
  const [realSeries, setRealSeries] = useState(null);
  const [realName, setRealName] = useState('');
  const [realError, setRealError] = useState(null);
  // 'csv' = LOCAL sin verificar · 'envelope' | 'wav' = REAL-LOCAL (captura propia).
  const [realKind, setRealKind] = useState(null);
  const [realDetail, setRealDetail] = useState('');
  const [envelopeCatalog, setEnvelopeCatalog] = useState(null);
  const [envelopeName, setEnvelopeName] = useState('');
  const [envelopeId, setEnvelopeId] = useState('');
  const [backendCatalog, setBackendCatalog] = useState(null);
  const [backendCatalogId, setBackendCatalogId] = useState('');
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [backendAnalysis, setBackendAnalysis] = useState(null);
  const [engineState, setEngineState] = useState('CARGANDO');
  const [activeTab, setActiveTab] = useState('2d');
  const inputRef = useRef(null);
  const curveRef = useRef(null);
  const setMathLiveSignal = useLabStore((s) => s.setMathLiveSignal);

  // Compilación: única fuente de verdad de la función. Si el parser falla, el
  // error se muestra y NO se dibuja nada: preferimos un hueco honesto a una
  // curva que no corresponde con lo escrito.
  const compiled = useMemo(() => {
    try {
      const out = compileEquation(expression, params);
      return { ok: true, fn: out.fn, free: out.free, tex: equationToTex(expression), error: null };
    } catch (err) {
      return { ok: false, fn: null, free: [], tex: null, error: err.message };
    }
  }, [expression, params]);

  // Muestreo en rejilla uniforme. Es el registro científico: fs explícito,
  // tiempo t0 + i/fs. Se recalcula solo; no depende del tablero.
  const series = useMemo(() => {
    if (!compiled.ok) return null;
    return sampleFunctionUniform(compiled.fn, { fs, t0, t1 });
  }, [compiled, fs, t0, t1]);

  const stats = useMemo(() => (series ? describeSeries(series) : null), [series]);

  const realStats = useMemo(
    () => (realSeries ? describeSeries({ values: realSeries.values }) : null),
    [realSeries]
  );

  const realRange = useMemo(() => {
    if (!realSeries || realSeries.time.length === 0) return null;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < realSeries.time.length; i += 1) {
      if (realSeries.time[i] < min) min = realSeries.time[i];
      if (realSeries.time[i] > max) max = realSeries.time[i];
    }
    return { min, max };
  }, [realSeries]);

  // La comparación evalúa el modelo analítico en los instantes de la serie
  // importada: mismos tiempos, sin interpolar y sin mezclar fuentes.
  const comparison = useMemo(() => {
    if (!realSeries || !compiled.ok) return null;
    let sumSq = 0;
    let maxError = 0;
    let n = 0;
    for (let i = 0; i < realSeries.time.length; i += 1) {
      const modelValue = compiled.fn(realSeries.time[i]);
      if (!Number.isFinite(modelValue)) continue;
      const error = Math.abs(realSeries.values[i] - modelValue);
      sumSq += error * error;
      if (error > maxError) maxError = error;
      n += 1;
    }
    if (!n) return null;
    return {
      n,
      rmse: Math.sqrt(sumSq / n),
      maxError,
      min: realStats ? realStats.min : NaN,
      max: realStats ? realStats.max : NaN,
      // Rango de la serie real (Vpp) y ventana temporal evaluada.
      range: realStats ? realStats.peakToPeak : NaN,
      timeRange: realRange ? realRange.max - realRange.min : NaN
    };
  }, [realSeries, compiled, realStats, realRange]);

  // ---------------------------------------------------------------------------
  // CÁLCULO NUMÉRICO SOBRE LA SERIE REAL. La procedencia se declara aquí, antes
  // de cualquier operador: si el dato es CSV no se inventa que es C0; si es
  // envolvente del dataset propio se declara C0/REAL-LOCAL. El operador solo
  // transforma y jamás eleva el estado.
  // ---------------------------------------------------------------------------
  const calculusSource = useMemo(() => {
    if (!realSeries) return null;
    const isCsv = realKind === 'csv';
    return {
      time: Array.from(realSeries.time, Number),
      values: Array.from(realSeries.values, Number),
      estado: isCsv ? 'LOCAL' : 'REAL-LOCAL',
      layer: isCsv ? 'LOCAL' : 'C0',
      sourceKind: realKind,
      sourceLabel: realName || 'serie local'
    };
  }, [realSeries, realKind, realName]);

  const calculus = useMemo(() => {
    if (!calculusSource) return null;
    const analysis = analyzeRealSeries(calculusSource);
    if (!analysis.ok) return { ok: false, error: analysis.error, code: analysis.code };
    const first = computeDerivative(calculusSource);
    const integral = computeIntegral(calculusSource);
    const vector = computeVectorCalculus(calculusSource);
    const phaseStride = Math.max(1, Math.ceil(vector.phaseVectors.length / MAX_SNAPSHOT_SAMPLES));
    return {
      ok: true,
      analysis,
      derivativeCurve: downsampleCurve(first.time, first.d1),
      cumulativeCurve: downsampleCurve(integral.time, integral.cumulative),
      energyCurve: downsampleCurve(integral.time, integral.cumulativeEnergy),
      criticalPoints: analysis.differential.criticalPoints,
      jumps: analysis.differential.jumps,
      phaseSamples: vector.phaseVectors
        .filter((_, i) => i % phaseStride === 0)
        .map((point) => point.map(roundStat))
    };
  }, [calculusSource]);

  const calculusBoundingbox = useMemo(() => {
    if (!calculus?.ok) return [-1, 1, 1, -1];
    const values = [...calculus.cumulativeCurve.values, ...calculus.energyCurve.values];
    if (!values.length) return [-1, 1, 1, -1];
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const pad = Math.max((hi - lo) * 0.1, 1e-6);
    const firstT = calculus.cumulativeCurve.time[0] ?? 0;
    const lastT = calculus.cumulativeCurve.time[calculus.cumulativeCurve.time.length - 1] ?? firstT + 1;
    return [firstT, hi + pad, lastT > firstT ? lastT : firstT + 1, lo - pad];
  }, [calculus]);

  // Verificación extremo a extremo contra el backend. Si no responde se dice
  // NO_DATA: el cálculo local sigue siendo válido y jamás se inventa una
  // confirmación del servidor.
  useEffect(() => {
    let cancelled = false;
    setBackendAnalysis(null);
    if (!calculusSource) return () => { cancelled = true; };
    computeRealSeries({ series: calculusSource, options: { minSamples: 3 }, order: 1, method: 'auto' })
      .then((payload) => {
        if (!cancelled && payload?.ok) setBackendAnalysis({ status: 'ok', result: payload });
      })
      .catch((err) => {
        if (!cancelled) setBackendAnalysis({ status: 'error', error: err.message });
      });
    return () => { cancelled = true; };
  }, [calculusSource]);

  // Catálogo C0 del backend (GET /api/v3/cmsc/acoustic-envelopes/). Es solo
  // lectura: el dataset vive fuera de git y aquí nunca se escribe. Si el
  // backend no está disponible se dice NO_DATA, no se inventa un catálogo.
  useEffect(() => {
    let cancelled = false;
    setCatalogBusy(true);
    loadEnvelopeCatalog()
      .then((payload) => {
        if (cancelled) return;
        setBackendCatalog(payload);
        setCatalogError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setBackendCatalog(null);
        setCatalogError(err.message);
      })
      .finally(() => { if (!cancelled) setCatalogBusy(false); });
    return () => { cancelled = true; };
  }, []);

  // Huella del contenido, no solo del nombre: recargar el mismo archivo con
  // otros valores debe redibujar aunque coincidan nombre y número de filas.
  const realFingerprint = useMemo(() => {
    if (!realSeries) return '';
    const { time, values } = realSeries;
    let acc = 0;
    for (let i = 0; i < values.length; i += 1) acc += values[i] * (i + 1);
    return `${time.length}:${time[0]}:${time[time.length - 1]}:${acc.toFixed(6)}`;
  }, [realSeries]);

  // Encuadre derivado de los datos. Con CSV se extienden dominio y rango para
  // no recortar ninguna fuente: modelo cian, serie importada verde.
  const boundingbox = useMemo(() => {
    const yValues = [];
    if (stats && Number.isFinite(stats.min) && Number.isFinite(stats.max)) yValues.push(stats.min, stats.max);
    if (realStats && Number.isFinite(realStats.min) && Number.isFinite(realStats.max)) {
      yValues.push(realStats.min, realStats.max);
    }
    const xMin = Math.min(t0, realRange?.min ?? t0);
    const xMax = Math.max(t1, realRange?.max ?? t1);
    if (yValues.length === 0) return [xMin, 3, xMax, -3];
    const lo = Math.min(...yValues);
    const hi = Math.max(...yValues);
    const pad = Math.max((hi - lo) * 0.15, 1e-6);
    return [xMin, hi + pad, xMax, lo - pad];
  }, [stats, realStats, realRange, t0, t1]);

  // Parámetros que la ecuación realmente usa. Distingue "declarado" de "usado":
  // un literal 100 no se puede deslizar, y decirlo evita la falsa impresión de
  // que el deslizador de frecuencia está vinculado al modelo.
  const activeParams = useMemo(() => {
    if (!compiled.ok) return [];
    const used = new Set(compiled.free);
    return PARAM_DEFS.filter((p) => used.has(p.name)).map((p) => p.name);
  }, [compiled]);

  // Envelope de workspace.model. Se construye para que el contrato quede visible
  // y probado, pero NO se escribe en ningún store, registro ni destino: eso es
  // una fase posterior con su propia misión.
  const workspaceModel = useMemo(() => {
    if (!compiled.ok || !series) return null;
    return buildWorkspaceModel({
      id: `mmc-model-${Date.now()}`,
      kind: 'numeric-plot',
      label: 'Modelo del núcleo matemático',
      expression,
      parameters: params,
      domain: { t0, t1, fs },
      implementation: {
        engine: ENGINE_ID,
        version: engineVersion(),
        adapter: VISUAL_ENGINE?.adapter ?? null,
        license: VISUAL_ENGINE?.licenseBranch ?? null
      },
      signal: series,
      estado: MODEL_ESTADO.SIM,
      clase_senal: 'GENERADA',
      dominio: 'matematico',
      confianza: series.finite ? 1 : 0.5,
      metadata: {
        producedBy: 'MmcMathematicsCore',
        provenance: 'ecuación escrita por el usuario, vía parser MMC, hacia adapter JSXGraph'
      }
    });
  }, [compiled, series, expression, params, t0, t1, fs]);

  // El rebuild necesita la función vigente sin capturarla en el deps del board.
  const modelRef = useRef(null);
  modelRef.current = { compiled, boundingbox, t0, t1, realSeries, calculus, calculusBoundingbox };

  const buildBoard = useCallback((board, ctx) => {
    const { compiled: c, boundingbox: bbox } = modelRef.current;
    if (!c.ok) return;
    board.setBoundingBox(bbox, false);
    curveRef.current = plotFunctionCurve(board, c.fn, {
      t0: modelRef.current.t0,
      t1: modelRef.current.t1,
      color: ctx.theme.cyan,
      name: null
    });
    if (modelRef.current.realSeries) {
      plotDataCurve(board, modelRef.current.realSeries, { color: ctx.theme.green });
    }
    const detail = modelRef.current.calculus;
    if (detail?.ok) {
      plotDataCurve(board, detail.derivativeCurve, { color: ctx.theme.pink });
      for (const point of detail.criticalPoints.slice(0, 40)) {
        board.create('point', [point.t, point.value], {
          size: 4,
          color: ctx.theme.amber,
          name: point.kind === 'maximo' ? 'max' : 'min',
          label: { fontSize: 10, color: ctx.theme.amber }
        });
      }
    }
  }, []);

  const rebuildBoard = useCallback((board, ctx) => {
    const { compiled: c, boundingbox: bbox } = modelRef.current;
    if (!c.ok) return;
    // Eliminar TODOS los objetos del tablero antes de redibujar.
    // `removeObject` puede fallar si el objeto ya fue eliminado o si hay
    // referencias cruzadas. La forma más segura es eliminar todo.
    try {
      const objects = board.objectsList || [];
      for (let i = objects.length - 1; i >= 0; i--) {
        try { board.removeObject(objects[i]); } catch (e) { /* ya eliminado */ }
      }
    } catch (e) { /* board vacío */ }
    curveRef.current = null;
    board.setBoundingBox(bbox, false);
    curveRef.current = plotFunctionCurve(board, c.fn, {
      t0: modelRef.current.t0,
      t1: modelRef.current.t1,
      color: ctx.theme.cyan,
      name: null
    });
    if (modelRef.current.realSeries) {
      plotDataCurve(board, modelRef.current.realSeries, { color: ctx.theme.green });
    }
    const detail = modelRef.current.calculus;
    if (detail?.ok) {
      plotDataCurve(board, detail.derivativeCurve, { color: ctx.theme.pink });
      for (const point of detail.criticalPoints.slice(0, 40)) {
        board.create('point', [point.t, point.value], {
          size: 4,
          color: ctx.theme.amber,
          name: point.kind === 'maximo' ? 'max' : 'min',
          label: { fontSize: 10, color: ctx.theme.amber }
        });
      }
    }
  }, []);

  const buildCalculusBoard = useCallback((board, ctx) => {
    const detail = modelRef.current.calculus;
    if (!detail?.ok) return;
    board.setBoundingBox(modelRef.current.calculusBoundingbox, false);
    plotDataCurve(board, detail.cumulativeCurve, { color: ctx.theme.cyan });
    plotDataCurve(board, detail.energyCurve, { color: ctx.theme.green });
  }, []);

  const rebuildCalculusBoard = useCallback((board, ctx) => {
    const detail = modelRef.current.calculus;
    if (!detail?.ok) return;
    try {
      const objects = board.objectsList || [];
      for (let i = objects.length - 1; i >= 0; i -= 1) {
        try { board.removeObject(objects[i]); } catch (err) { /* ya eliminado */ }
      }
    } catch (err) { /* board vacío */ }
    board.setBoundingBox(modelRef.current.calculusBoundingbox, false);
    plotDataCurve(board, detail.cumulativeCurve, { color: ctx.theme.cyan });
    plotDataCurve(board, detail.energyCurve, { color: ctx.theme.green });
  }, []);

  // Al desmontar el instrumento, el board se libera en el propio board bridge.
  // Aquí solo se suelta la referencia a la curva para no retenerla.
  useEffect(() => () => {
    curveRef.current = null;
  }, []);

  // Estado que se publica y se muestra en el propio núcleo. SIM = modelo,
  // REAL-LOCAL = captura propia (envolvente RMS del dataset o WAV local),
  // LOCAL = CSV aportado por el usuario, cuya proveniencia NO se verifica aquí,
  // ROTO = ecuación inválida. `LOCAL` no eleva la serie: es la etiqueta honesta
  // de una fuente local sin verificar y nunca se presenta como REAL ni REAL-LOCAL.
  const realSeriesEstado = realKind === 'csv' ? 'LOCAL' : 'REAL-LOCAL';
  const publicEstado = !series ? 'ROTO' : realSeries ? realSeriesEstado : 'SIM';

  // PUBLICACIÓN REACTIVA S35 → useLabStore. Cualquier cambio de expresión,
  // parámetros, dominio/muestreo o serie contrastada actualiza el snapshot.
  // La serie real manda: cuando está cargada, el snapshot la describe a ella y
  // guarda el modelo en `modelFs`; cuando no, describe la rejilla del modelo.
  useEffect(() => {
    if (!series) {
      setMathLiveSignal({
        published: true,
        estado: 'ROTO',
        clase_senal: 'GENERADA',
        dominio: 'Matemático',
        expression,
        sourceLabel: compiled.error || 'expresión no válida',
        sourceKind: null,
        fs,
        sampleCount: 0,
        t0,
        t1,
        min: null,
        max: null,
        rms: null,
        metrics: null,
        calculus: null,
        phaseSamples: [],
        samples: []
      });
      return;
    }

    const loaded = Boolean(realSeries);
    const summary = summarizeSnapshot(loaded ? realSeries.values : series.values);
    const span = loaded && realSeries.time.length > 1
      ? realSeries.time[realSeries.time.length - 1] - realSeries.time[0]
      : 0;
    const realFs = loaded && Number.isFinite(span) && span > 0
      ? (realSeries.time.length - 1) / span
      : null;

    setMathLiveSignal({
      published: true,
      estado: loaded ? realSeriesEstado : 'SIM',
      clase_senal: loaded ? 'LOCAL' : 'GENERADA',
      dominio: 'Matemático',
      expression,
      sourceLabel: loaded
        ? `${realName || 'serie local'}${realDetail ? ` · ${realDetail}` : ''}`
        : 'Modelo SIM · ecuación del núcleo MMC',
      sourceKind: loaded ? realKind : null,
      fs: loaded && realFs ? roundStat(realFs) : series.fs,
      modelFs: series.fs,
      sampleCount: loaded ? realSeries.time.length : series.sampleCount,
      t0: loaded ? realSeries.time[0] : t0,
      t1: loaded ? realSeries.time[realSeries.time.length - 1] : t1,
      min: summary?.min ?? null,
      max: summary?.max ?? null,
      rms: summary?.rms ?? null,
      metrics: comparison
        ? {
            n: comparison.n,
            rmse: roundStat(comparison.rmse),
            maxError: roundStat(comparison.maxError),
            range: roundStat(comparison.range),
            timeRange: roundStat(comparison.timeRange)
          }
        : null,
      // Cálculo derivado de la MISMA serie publicada: la procedencia se hereda
      // y el operador nunca eleva LOCAL/SIM. Acotado a 40 críticos/saltos y a
      // los vectores de fase ya diezmados; nunca arrays completos en el store.
      calculus: calculus?.ok
        ? {
            version: calculus.analysis.version,
            provenance: calculus.analysis.provenance,
            summary: calculus.analysis.summary,
            criticalPoints: calculus.analysis.differential.criticalPoints.slice(0, 40),
            jumps: calculus.analysis.differential.jumps.slice(0, 40)
          }
        : calculus?.ok === false
          ? { ok: false, code: calculus.code, error: calculus.error }
          : null,
      phaseSamples: calculus?.ok ? calculus.phaseSamples : [],
      samples: loaded
        ? boundedSnapshotSamples(realSeries.time, realSeries.values)
        : boundedSnapshotSamples(series.time, series.values)
    });
  }, [
    setMathLiveSignal,
    series,
    compiled.ok,
    compiled.error,
    expression,
    realSeries,
    realKind,
    realSeriesEstado,
    realName,
    realDetail,
    comparison,
    calculus,
    fs,
    t0,
    t1
  ]);

  const rebuildKey = `${expression}|${JSON.stringify(params)}|${t0}|${t1}|${fs}|${realFingerprint}`;

  const insertParam = (name) => {
    const el = inputRef.current;
    if (!el) return;
    const token = name;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = `${el.value.slice(0, start)}${token}${el.value.slice(end)}`;
    setExpression(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + token.length;
      el.setSelectionRange(caret, caret);
    });
  };

  // La serie real manda el dominio: sin esto el modelo se dibujaría en 0..0,02 s
  // mientras el dato vive en 0..2,9 s y la comparación sería invisible.
  const applyRealDomain = (data) => {
    const n = data?.time?.length ?? 0;
    if (n < 2) return;
    const lo = data.time[0];
    const hi = data.time[n - 1];
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return;
    setT0(lo);
    setT1(hi);
    setFs(Math.max(2, Math.round((n - 1) / (hi - lo))));
  };

  const setReal = ({ data, name, kind, detail }) => {
    setRealSeries(data);
    setRealName(name);
    setRealKind(kind);
    setRealDetail(detail);
    setRealError(null);
    applyRealDomain(data);
  };

  const clearRealSeries = () => {
    setRealSeries(null);
    setRealName('');
    setRealKind(null);
    setRealDetail('');
    setRealError(null);
    setEnvelopeCatalog(null);
    setEnvelopeName('');
    setEnvelopeId('');
  };

  const failReal = (message) => {
    clearRealSeries();
    setRealError(message);
  };

  const onCsvFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_CSV_BYTES) {
      failReal(`archivo demasiado grande (máx. ${MAX_CSV_BYTES / 1024 / 1024} MB)`);
      return;
    }
    try {
      const parsed = parseCsvSeries(await file.text());
      setReal({
        data: parsed,
        name: file.name,
        kind: 'csv',
        detail: 'CSV time,value · proveniencia no verificada en esta vista'
      });
    } catch (err) {
      failReal(err.message);
    }
  };

  const onEnvelopeFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_REAL_BYTES) {
      failReal(`archivo demasiado grande (máx. ${MAX_REAL_BYTES / 1024 / 1024} MB)`);
      return;
    }
    try {
      const catalog = parseEnvelopeCatalog(await file.text());
      const first = catalog.ids[0];
      setEnvelopeCatalog(catalog);
      setEnvelopeName(file.name);
      setEnvelopeId(first);
      setReal({
        data: envelopeSeries(catalog, first),
        name: file.name,
        kind: 'envelope',
        detail: `${first} · RMS espectral/frame · ${catalog.envelopes[first].length} muestras`
      });
    } catch (err) {
      failReal(err.message);
    }
  };

  const selectEnvelope = (event) => {
    const id = event.target.value;
    setEnvelopeId(id);
    if (!envelopeCatalog || !id) return;
    try {
      setReal({
        data: envelopeSeries(envelopeCatalog, id),
        name: envelopeName,
        kind: 'envelope',
        detail: `${id} · RMS espectral/frame · ${envelopeCatalog.envelopes[id].length} muestras`
      });
    } catch (err) {
      failReal(err.message);
    }
  };

  // Una muestra del catálogo C0 se sirve por el backend con time[] reconstruido
  // desde el hop (2048/44100 s). Se publica como REAL-LOCAL/C0: no se mezcla con
  // el CSV local ni se eleva una fuente SIM. Nada se escribe en `data/`.
  const selectBackendEnvelope = async (event) => {
    const id = event.target.value;
    setBackendCatalogId(id);
    if (!id) return;
    setCatalogBusy(true);
    setCatalogError(null);
    try {
      const sample = await loadEnvelopeSample(id);
      const time = Array.from(sample.time ?? [], Number);
      const values = Array.from(sample.values ?? [], Number);
      if (time.length < 2 || time.length !== values.length) {
        throw new Error('muestra C0 incompleta');
      }
      setReal({
        data: { time, values },
        name: 'catálogo C0 · backend',
        kind: 'envelope',
        detail: `${id} · RMS espectral/frame · ${values.length} muestras · ${sample.sourcePath}`
      });
    } catch (err) {
      setCatalogError(err.message);
    } finally {
      setCatalogBusy(false);
    }
  };

  const onWavFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_REAL_BYTES) {
      failReal(`archivo demasiado grande (máx. ${MAX_REAL_BYTES / 1024 / 1024} MB)`);
      return;
    }
    try {
      const decoded = await decodeWavFile(file);
      setReal({
        data: { time: decoded.time, values: decoded.values },
        name: file.name,
        kind: 'wav',
        detail: `WAV local · ${decoded.sampleRate} Hz · canal 0 · ${decoded.frames} muestras, submuestreado`
      });
    } catch (err) {
      failReal(err.message);
    }
  };

  const exportCsv = () => {
    if (!series) return;
    const rows = ['index,time_s,value'];
    for (let i = 0; i < series.sampleCount; i += 1) {
      rows.push(`${i},${series.time[i]},${series.values[i]}`);
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mmc_modelo.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const samplesPerPeriod = useMemo(() => {
    if (!activeParams.includes('f') || !params.f) return null;
    return params.f > 0 ? fs / params.f : null;
  }, [activeParams, params.f, fs]);

  const statusChip = () => {
    if (engineState === 'ROTO') return <span className="mmc-wb-status-roto">ROTO</span>;
    if (engineState === 'LISTO') return <span className="mmc-wb-status-ok">motor listo</span>;
    return <span className="mmc-wb-status-load">cargando motor</span>;
  };

return (
    <div className="mmc-workbench">
      {/* ---------- Estado del motor: una línea, sin marco ---------- */}
      <div className="mmc-wb-status">
        <span className="mmc-wb-status-id">M00 · Núcleo matemático</span>
        {statusChip()}
        <span className="mmc-wb-status-sim">GENERADA · SIM</span>
        <span className="mmc-wb-status-meta">jsxgraph {engineVersion()}</span>
        <span className="mmc-wb-status-meta">{VISUAL_ENGINE?.licenseBranch ?? 'MIT'}</span>
        <span className="mmc-wb-status-count">
          {CAPACIDADES.filter((c) => c.estado === 'OPERACIONAL').length}/{CAPACIDADES.length} capacidades
        </span>
      </div>

      {/*
        Dos columnas y una sola regla: el raíl instrumenta, el escenario dibuja.

        En escritorio el reparto es 24% / 76%. Antes el workbench apilaba
        ecuación, gráfica y controles en una columna, de modo que la curva
        quedaba comprimida en el ancho de un texto y había que desplazarse
        para verla. Con la gráfica en su propia columna, el grafo es lo primero
        que se ve al llegar y los controles quedan a la vista, al lado, sin
       _scroll.

        Por debajo de 980 px el raíl colapsa a una columna: a ese ancho un 24%
        son menos de 240 px y los deslizadores dejan de poder manipularse. Ese
        mismo umbral protege la celda del CMSC, que anda por los 406 px.
      */}
      <div className="mmc-wb-body">
        <div className="mmc-wb-rail">
      <div className="mmc-wb-equation">
        <input
          ref={inputRef}
          className={`mmc-wb-input${compiled.ok ? '' : ' mmc-wb-input-bad'}`}
          value={expression}
          spellCheck={false}
          autoComplete="off"
          aria-label="Ecuación matemática"
          onChange={(e) => setExpression(e.target.value)}
        />
        {compiled.ok ? (
          <MmcEquation tex={compiled.tex} ariaLabel="Ecuación renderizada" />
        ) : (
          <span className="mmc-wb-msg mmc-wb-msg-bad">{compiled.error}</span>
        )}
      </div>

      {/* ---------- Instrumentación: raíl izquierdo, 24% en escritorio ---------- */}
      <div className="mmc-wb-controls">
        {PARAM_DEFS.map((p) => (
          <div className="mmc-wb-ctrl" key={p.name}>
            <label htmlFor={`mmc-param-${p.name}`}>
              {p.label}
              {activeParams.includes(p.name) ? ' (activo)' : ''}
            </label>
            <span className="mmc-wb-ctrl-val">
              {params[p.name]}
              {p.unit}
            </span>
            <input
              id={`mmc-param-${p.name}`}
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={params[p.name]}
              onChange={(e) => setParams((prev) => ({ ...prev, [p.name]: Number(e.target.value) }))}
            />
          </div>
        ))}
        <div className="mmc-wb-ctrl">
          <label htmlFor="mmc-t0">t0 · inicio</label>
          <input id="mmc-t0" type="number" step="0.001" value={t0} onChange={(e) => setT0(Number(e.target.value))} />
        </div>
        <div className="mmc-wb-ctrl">
          <label htmlFor="mmc-t1">t1 · fin</label>
          <input id="mmc-t1" type="number" step="0.001" value={t1} onChange={(e) => setT1(Number(e.target.value))} />
        </div>
        <div className="mmc-wb-ctrl">
          <label htmlFor="mmc-fs">fs</label>
          <span className="mmc-wb-ctrl-val">N={series ? series.sampleCount : '--'}</span>
          <input
            id="mmc-fs"
            type="number"
            step="100"
            min="2"
            value={fs}
            onChange={(e) => setFs(Math.max(2, Number(e.target.value)))}
          />
        </div>
      </div>

      <div className="mmc-wb-actions">
        <button type="button" className="mmc-wb-btn" onClick={() => setExpression(PARAMETRIC_EXPRESSION)}>
          parametrizar
        </button>
        <button type="button" className="mmc-wb-btn" onClick={() => setExpression(DEFAULT_EXPRESSION)}>
          escenario base
        </button>
        <button type="button" className="mmc-wb-btn" onClick={() => setExpression(ENVELOPE_EXPRESSION)}>
          modelo envolvente
        </button>
        <button type="button" className="mmc-wb-btn" onClick={exportCsv} disabled={!series}>
          exportar csv
        </button>
        <span style={{ flex: '1 1 12px' }} />
        {PARAM_DEFS.map((p) => (
          <button key={p.name} type="button" className="mmc-wb-btn" onClick={() => insertParam(p.name)}>
            +{p.name}
          </button>
        ))}
      </div>

      {/* ---------- Contraste con dato: verde = serie real/importada, cian = modelo SIM ---------- */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'4px 10px', margin:'6px 0', fontFamily:'ui-monospace,Menlo,monospace', fontSize:10 }}>
        <span style={{ color:'#64748b', letterSpacing:'.06em', flexBasis:'100%' }}>CONTRASTE CON DATO · serie verde</span>
        {realSeries && (
          <span className={realKind === 'csv' ? 'mmc-wb-status-meta' : 'mmc-wb-status-ok'}>
            {realKind === 'csv' ? 'LOCAL' : 'REAL-LOCAL'}
          </span>
        )}
        <label htmlFor="mmc-envelope-file">envoltura RMS</label>
        <input
          id="mmc-envelope-file"
          type="file"
          accept=".json,application/json"
          onChange={onEnvelopeFile}
          style={{ flex:'1 1 130px', minWidth:0, color:'#94a3b8', fontSize:10 }}
          aria-label="Importar envolventes RMS del dataset acústico propio"
        />
        {envelopeCatalog && (
          <select
            id="mmc-envelope-sample"
            value={envelopeId}
            onChange={selectEnvelope}
            style={{ flex:'1 1 130px', minWidth:0, background:'#0b1220', color:'#94a3b8', border:'1px solid #1e293b', fontSize:10 }}
            aria-label="Seleccionar muestra real por sample_id"
          >
            {envelopeCatalog.ids.map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
        )}
        <label htmlFor="mmc-backend-envelope">catálogo C0 (backend)</label>
        <select
          id="mmc-backend-envelope"
          value={backendCatalogId}
          onChange={selectBackendEnvelope}
          disabled={!backendCatalog?.samples?.length || catalogBusy}
          style={{ flex:'1 1 150px', minWidth:0, background:'#0b1220', color:'#94a3b8', border:'1px solid #1e293b', fontSize:10 }}
          aria-label="Seleccionar envolvente C0 REAL-LOCAL servida por el backend"
        >
          <option value="">{catalogBusy ? 'cargando…' : (backendCatalog?.samples?.length ? 'seleccionar sample_id…' : 'sin catálogo (NO_DATA)')}</option>
          {(backendCatalog?.samples ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.id} · {s.n} muestras</option>
          ))}
        </select>
        {catalogError && <span className="mmc-wb-msg mmc-wb-msg-bad" style={{ flexBasis:'100%' }}>backend NO_DATA · {catalogError}</span>}
        <label htmlFor="mmc-wav-file">WAV local</label>
        <input
          id="mmc-wav-file"
          type="file"
          accept=".wav,audio/wav,audio/x-wav"
          onChange={onWavFile}
          style={{ flex:'1 1 110px', minWidth:0, color:'#94a3b8', fontSize:10 }}
          aria-label="Importar WAV local para comparar con el modelo"
        />
        <label htmlFor="mmc-csv-file">CSV</label>
        <input
          id="mmc-csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={onCsvFile}
          style={{ flex:'1 1 110px', minWidth:0, color:'#94a3b8', fontSize:10 }}
          aria-label="Importar serie CSV time,value"
        />
        <button type="button" className="mmc-wb-btn" onClick={clearRealSeries} disabled={!realSeries}>quitar</button>
        {realName && <span style={{ color:'#39ff14', flexBasis:'100%' }}>{realName} · {realDetail}</span>}
        {realError && <span className="mmc-wb-msg mmc-wb-msg-bad" style={{ flexBasis:'100%' }}>{realError}</span>}
        <span style={{ color:'#475569', flexBasis:'100%' }}>
          envolturas: {ENVELOPE_SOURCE_PATH} · dataset local fuera de git · importación manual sin fetch · catálogo C0 vía GET /api/v3/cmsc/acoustic-envelopes/ (solo lectura)
        </span>
      </div>

      <DockToolbar active={activeTab} onSelect={setActiveTab} />
      <DockPanel
        activeTab={activeTab}
        workspaceModel={workspaceModel}
        workspaceSignal={series}
        stats={stats}
      />
        </div>

        {/* ---------- El escenario: 76% del ancho, aquí vive la gráfica ---------- */}
        <div className="mmc-wb-stage">
      <div className="mmc-wb-plot">
        {compiled.ok ? (
          <MmcJsxGraphBoard
            build={buildBoard}
            rebuild={rebuildBoard}
            rebuildKey={rebuildKey}
            boundingbox={boundingbox}
            height={PLOT_HEIGHT}
            ariaLabel="Curva de la ecuación modelada"
            onReady={({ estado }) => setEngineState(estado === 'ROTO' ? 'ROTO' : 'LISTO')}
          />
        ) : (
          <div className="mmc-board-fail" style={{ height: PLOT_HEIGHT }}>
            <strong>ECUACIÓN NO VÁLIDA</strong>
            <span>No se dibuja nada mientras la expresión no compile.</span>
          </div>
        )}
      </div>

      {/* ---------- Lecturas: columnas de texto ---------- */}
      {series ? (
        <>
          <div className="mmc-wb-series">
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">muestras</span>
              <span className="mmc-wb-metric-v">{series.sampleCount}</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">fs</span>
              <span className="mmc-wb-metric-v">{series.fs} Hz</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">min</span>
              <span className="mmc-wb-metric-v">{Number.isFinite(stats.min) ? stats.min.toFixed(3) : '--'}</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">max</span>
              <span className="mmc-wb-metric-v">{Number.isFinite(stats.max) ? stats.max.toFixed(3) : '--'}</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">Vpp</span>
              <span className="mmc-wb-metric-v">{Number.isFinite(stats.peakToPeak) ? stats.peakToPeak.toFixed(3) : '--'}</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">finita</span>
              <span className="mmc-wb-metric-v">{series.finite ? 'sí' : 'NO'}</span>
            </div>
          </div>

          {comparison && (
            <>
              <div className="mmc-wb-series" aria-label="Comparación de la serie real contra el modelo analítico">
                <div className="mmc-wb-metric">
                  <span className="mmc-wb-metric-k">N evaluadas</span>
                  <span className="mmc-wb-metric-v">{comparison.n}</span>
                </div>
                <div className="mmc-wb-metric">
                  <span className="mmc-wb-metric-k">RMSE</span>
                  <span className="mmc-wb-metric-v">{comparison.rmse.toFixed(6)}</span>
                </div>
                <div className="mmc-wb-metric">
                  <span className="mmc-wb-metric-k">Error Máx</span>
                  <span className="mmc-wb-metric-v">{comparison.maxError.toFixed(6)}</span>
                </div>
                <div className="mmc-wb-metric">
                  <span className="mmc-wb-metric-k">Rango dato</span>
                  <span className="mmc-wb-metric-v">{Number.isFinite(comparison.range) ? comparison.range.toFixed(6) : '--'}</span>
                </div>
                <div className="mmc-wb-metric">
                  <span className="mmc-wb-metric-k">min / max</span>
                  <span className="mmc-wb-metric-v">
                    {Number.isFinite(comparison.min) && Number.isFinite(comparison.max)
                      ? `${comparison.min.toFixed(4)} / ${comparison.max.toFixed(4)}` : '--'}
                  </span>
                </div>
                <div className="mmc-wb-metric">
                  <span className="mmc-wb-metric-k">ventana t</span>
                  <span className="mmc-wb-metric-v">
                    {Number.isFinite(comparison.timeRange) ? `${comparison.timeRange.toFixed(4)} s` : '--'}
                  </span>
                </div>
              </div>
              <div className="mmc-wb-honest" style={{ marginTop: 2 }}>
                <div>
                  <b>{realKind === 'csv' ? 'LOCAL' : 'REAL-LOCAL'}</b> · dato {realName} · {realDetail}
                </div>
                <div>
                  <b>SIM</b> · modelo evaluado en los mismos instantes del dato, sin interpolar ni mezclar fuentes
                </div>
              </div>
            </>
          )}

          <details className="mmc-wb-details">
            <summary>time[] / values[]</summary>
            <pre className="mmc-wb-peek">
              {`i      time[s]     value\n` +
                Array.from({ length: Math.min(12, series.sampleCount) }, (_, i) =>
                  `${String(i).padEnd(4)} ${formatTime(series.time[i]).padEnd(12)} ${series.values[i].toFixed(6)}`
                ).join('\n') +
                (series.sampleCount > 12 ? `\n(+${series.sampleCount - 12} muestras más)` : '')}
            </pre>
          </details>

          {workspaceModel && (
            <details className="mmc-wb-details">
              <summary>workspace.model</summary>
              <pre className="mmc-wb-peek">
                {`// workspace.model — PREPARADO, NO CONECTADO\n` +
                  `estado      : ${workspaceModel.estado}\n` +
                  `clase_senal : ${workspaceModel.clase_senal}\n` +
                  `confianza   : ${workspaceModel.confianza}\n` +
                  `dominio     : ${workspaceModel.domain ? JSON.stringify(workspaceModel.domain) : '--'}\n` +
                  `engine      : ${workspaceModel.implementation.engine} ${workspaceModel.implementation.version}\n` +
                  `licencia    : ${workspaceModel.implementation.license}\n` +
                  `signal.time : Float64Array(${workspaceModel.signal?.time?.length ?? 0})\n` +
                  `signal.vals : Float64Array(${workspaceModel.signal?.values?.length ?? 0})`}
              </pre>
            </details>
          )}
        </>
      ) : (
        <div className="mmc-wb-msg mmc-wb-msg-info">Sin serie: la ecuación no compila.</div>
      )}

      {/* ---------- Cálculo verificable: diferencial / integral / vectorial ---------- */}
      {calculusSource && (
        <div className="mmc-wb-series" aria-label="Cálculo numérico sobre la serie cargada">
          <div className="mmc-wb-metric">
            <span className="mmc-wb-metric-k">operador</span>
            <span className="mmc-wb-metric-v">{calculus?.ok ? calculus.analysis.version : (calculus ? 'ERROR' : '...')}</span>
          </div>
          {calculus?.ok ? (
            <>
              <div className="mmc-wb-metric">
                <span className="mmc-wb-metric-k">∫·dt</span>
                <span className="mmc-wb-metric-v">{calculus.analysis.summary.quadrature}</span>
              </div>
              <div className="mmc-wb-metric">
                <span className="mmc-wb-metric-k">∫x dt</span>
                <span className="mmc-wb-metric-v">{Number.isFinite(calculus.analysis.integral.defined) ? calculus.analysis.integral.defined.toFixed(6) : '--'}</span>
              </div>
              <div className="mmc-wb-metric">
                <span className="mmc-wb-metric-k">energía ∫x²dt</span>
                <span className="mmc-wb-metric-v">{Number.isFinite(calculus.analysis.integral.energy) ? calculus.analysis.integral.energy.toFixed(6) : '--'}</span>
              </div>
              <div className="mmc-wb-metric">
                <span className="mmc-wb-metric-k">‖x‖₂</span>
                <span className="mmc-wb-metric-v">{Number.isFinite(calculus.analysis.summary.normL2) ? calculus.analysis.summary.normL2.toFixed(6) : '--'}</span>
              </div>
              <div className="mmc-wb-metric">
                <span className="mmc-wb-metric-k">rms x′</span>
                <span className="mmc-wb-metric-v">{Number.isFinite(calculus.analysis.summary.rmsD1) ? calculus.analysis.summary.rmsD1.toFixed(6) : '--'}</span>
              </div>
              <div className="mmc-wb-metric">
                <span className="mmc-wb-metric-k">rms x″</span>
                <span className="mmc-wb-metric-v">{Number.isFinite(calculus.analysis.summary.rmsD2) ? calculus.analysis.summary.rmsD2.toFixed(6) : '--'}</span>
              </div>
              <div className="mmc-wb-metric">
                <span className="mmc-wb-metric-k">críticos / saltos</span>
                <span className="mmc-wb-metric-v">{calculus.analysis.summary.criticalCount} / {calculus.analysis.summary.jumpCount}</span>
              </div>
              <div className="mmc-wb-metric">
                <span className="mmc-wb-metric-k">‖(x,x′,x″)‖máx</span>
                <span className="mmc-wb-metric-v">{Number.isFinite(calculus.analysis.summary.maxMagnitude) ? calculus.analysis.summary.maxMagnitude.toFixed(6) : '--'}</span>
              </div>
              <details className="mmc-wb-details" style={{ flexBasis:'100%' }}>
                <summary>críticos y saltos detectados (muestra acotada)</summary>
                <pre className="mmc-wb-peek">
                  {`críticos: ${calculus.criticalPoints.length} · saltos: ${calculus.jumps.length}\n` +
                    (calculus.criticalPoints.length
                      ? calculus.criticalPoints.slice(0, 8).map((p) => `t=${p.t.toFixed(4)}  ${p.kind}  x=${p.value.toFixed(4)}  x″=${p.d2.toFixed(4)}`).join('\n')
                      : 'sin críticos en la ventana analizada') +
                    (calculus.jumps.length
                      ? `\n` + calculus.jumps.slice(0, 8).map((j) => `t=${j.t.toFixed(4)}  salto x′=${j.jump.toFixed(4)}`).join('\n')
                      : '\nsin saltos en la ventana analizada') +
                    `\n\nlimpieza: ${calculus.analysis.diagnostics.inputCount} → ${calculus.analysis.diagnostics.outputCount} muestras` +
                    ` · NaN/Inf ${calculus.analysis.diagnostics.droppedNonFinite}` +
                    ` · huecos interpolados ${calculus.analysis.diagnostics.interpolatedGaps}` +
                    ` · outliers recortados ${calculus.analysis.diagnostics.clippedOutliers}`}
                </pre>
              </details>
            </>
          ) : (
            <span className="mmc-wb-msg mmc-wb-msg-bad" style={{ flexBasis:'100%' }}>
              {calculus ? `${calculus.code}: ${calculus.error}` : 'calculando…'}
            </span>
          )}
          <div className="mmc-wb-honest" style={{ flexBasis:'100%' }}>
            <div>
              <b>{calculusSource.estado} · {calculusSource.layer}</b> · operador <code>{CALCULUS_VERSION}</code> · hereda procedencia: nunca eleva LOCAL/SIM a REAL-LOCAL · sin relleno silencioso
            </div>
            <div>
              <b>backend</b> · {backendAnalysis === null
                ? 'NO_DATA · sin verificación del servidor'
                : backendAnalysis.status === 'ok'
                  ? `ok · ${backendAnalysis.result.version} · ${backendAnalysis.result.n} muestras verificadas`
                  : `NO_DATA · ${backendAnalysis.error}`}
            </div>
          </div>
        </div>
      )}

      {calculus?.ok && (
        <div className="mmc-wb-plot">
          <MmcJsxGraphBoard
            build={buildCalculusBoard}
            rebuild={rebuildCalculusBoard}
            rebuildKey={`calculus|${realFingerprint}`}
            boundingbox={calculusBoundingbox}
            height={260}
            ariaLabel="Integrales acumuladas: ∫x dt y energía ∫x² dt sobre la serie real"
            onReady={() => {}}
          />
        </div>
      )}
        </div>
      </div>

      {/* ---------- Honestidad: una línea al pie ---------- */}
      <div className="mmc-wb-honest">
        <div>
          <b>SIM</b> · simulación · <code>time[]</code>/<code>values[]</code> en rejilla uniforme con <code>fs</code> explícito
          {samplesPerPeriod ? ` · ${samplesPerPeriod.toFixed(1)} muestras/periodo a ${params.f} Hz` : ''}
        </div>
        {realSeries && (
          <div style={{ marginTop: 2 }}>
            <b>{realKind === 'csv' ? 'CSV IMPORTADA · LOCAL' : 'SERIE REAL-LOCAL'}</b> · {realName} · {realDetail} · {realSeries.time.length} muestras en memoria · sin escribir en disco ni enviar a servicio · verde sobre cian
          </div>
        )}
        <div style={{ marginTop: 2 }}>
          <b>S35 → useLabStore</b> · snapshot <b>{publicEstado}</b> · {realSeries ? 'serie contrastada publicada' : 'modelo generado publicado'} · muestras acotadas, sin arrays completos ni escritura en disco
          {calculus?.ok && (
            <span> · cálculo y fase <b>(x, x′, x″)</b> publicados con la procedencia heredada de la fuente</span>
          )}
        </div>
        <details style={{ marginTop: 2 }}>
          <summary style={{ cursor: 'pointer', fontSize: 10, color: '#475569' }}>
            capacidades {CAPACIDADES.filter((c) => c.estado === 'OPERACIONAL').length}/{CAPACIDADES.length} · integración
          </summary>
          <div style={{ marginTop: 4, display: 'grid', gap: 2 }}>
            {CAPACIDADES.map((c) => (
              <div key={c.id} style={{ fontSize: 10, color: '#475569' }}>
                {c.label} · {c.estado === 'OPERACIONAL' ? 'ok' : 'preparado'}
              </div>
            ))}
            {MODEL_INTEGRATION_POINTS.map((p) => (
              <div key={p.id} style={{ fontSize: 10, color: '#374151' }}>
                {p.destino} · {p.estado}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default MmcMathematicsCore;
