// CONTEXTO DE VOZ · adaptador aditivo para S62 (/assist).
//
// Este modulo NO es un LLM y NO fabrica evidencia. Solo:
//   1. construye un resumen acotado del contexto vivo del cliente
//      (S35 publicada por el MMC + evidencia de vision publicada por la sonda);
//   2. valida la navegacion contra un vocabulario cerrado de rutas que SI
//      existen en App.jsx;
//   3. lee las trazas X-SIGCT-* devueltas por el servicio.
//
// Regla de honestidad: los unicos estados aceptados son REAL-LOCAL, LOCAL,
// SIM, NO_DATA y ROTO. Todo valor desconocido degrada a NO_DATA; ningun
// resumen de este modulo puede elevar una senal a REAL.

import { resolveEndpoint } from '../config/endpoints.js';

export const VOICE_CONTEXT_VERSION = 'sigct-voice-context-v1';

export const VOICE_HONESTY_STATES = Object.freeze([
  'REAL-LOCAL',
  'LOCAL',
  'SIM',
  'NO_DATA',
  'ROTO',
]);

// Espejo del routeMap de App.jsx (lineas 73-89) mas las rutas aditivas
// /knowledge, /dashboard-cmsc y /hardware-catalog. Nunca se navega a una
// ruta que no este en esta lista, aunque el backend la sugiera.
export const VOICE_NAV_TARGETS = Object.freeze({
  dashboard: '/dashboard',
  home: '/dashboard',
  labs: '/labs',
  robotics: '/labs/robotics',
  ai: '/ai-predictive',
  docs: '/knowledge/doc/masterdoc',
  math: '/advanced-math-v2',
  'advanced-math': '/advanced-math',
  'advanced-math-v2': '/advanced-math-v2',
  'lab-embedded': '/lab-embedded',
  'lab-telecom': '/lab-telecom',
  'lab-electronics': '/lab-electronics',
  'data-lab': '/data-science',
  proyectos: '/proyectos',
  projectos: '/proyectos',
  cmsc: '/dashboard-cmsc',
});

const VOICE_PATHS = Object.freeze(new Set([
  ...Object.values(VOICE_NAV_TARGETS),
  '/knowledge',
  '/hardware-catalog',
]));

const API_BASE = resolveEndpoint(
  import.meta.env.VITE_AI_API_BASE,
  import.meta.env.DEV ? 'http://localhost:8081' : ''
);

export const VOICE_ASSIST_BASE = API_BASE;

const text = (value, max = 120) => {
  if (value === null || value === undefined) return null;
  const clean = String(value).trim().slice(0, max);
  return clean || null;
};

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeVoiceState = (value) => {
  const candidate = text(value, 24);
  return VOICE_HONESTY_STATES.includes(candidate) ? candidate : 'NO_DATA';
};

/** Resuelve un token (o ruta) del backend a una ruta existente. */
export const resolveVoiceTarget = (target) => {
  const key = text(target, 64)?.toLowerCase();
  if (!key) return null;
  if (VOICE_PATHS.has(key)) return key;
  if (Object.prototype.hasOwnProperty.call(VOICE_NAV_TARGETS, key)) {
    return VOICE_NAV_TARGETS[key];
  }
  return null;
};

/**
 * Doble validacion: el backend propone un token cerrado y aqui se comprueba
 * ademas que la ruta exista. Sin funcion de navegacion, NO se navega.
 */
export const safeNavigate = (target, onNavigate) => {
  const path = resolveVoiceTarget(target);
  if (path && typeof onNavigate === 'function') {
    onNavigate(path);
    return path;
  }
  return null;
};

const asObject = (value) => (value && typeof value === 'object' ? value : {});

/**
 * Resumen estructurado que viaja al /assist en el campo `context`.
 * `signal` = mathLiveSignal del store canonico; `vision` = snapshot del canal
 * de evidencia de vision. Ninguno se modifica.
 */
export const buildVoiceContext = ({ signal, vision } = {}) => {
  const live = asObject(signal);
  const sight = asObject(vision);
  const capture = asObject(sight.capture);
  const inference = asObject(sight.inference);
  const visionSignal = asObject(sight.signal);
  const clip = asObject(sight.clip);
  const clipFrames = asObject(clip.frameInferences);
  const published = live.published === true;

  return {
    version: VOICE_CONTEXT_VERSION,
    generatedAt: new Date().toISOString(),
    analysisKind: 'DETERMINISTIC_LOCAL',
    llmUsed: false,
    navigation: { targets: Object.keys(VOICE_NAV_TARGETS) },
    signal: {
      id: text(live.id, 12) || 'S35',
      published,
      // Un snapshot no publicado nunca se presenta como señal viva.
      estado: published ? normalizeVoiceState(live.estado) : 'NO_DATA',
      sourceLabel: text(live.sourceLabel, 100),
      sampleCount: numberOrNull(live.sampleCount),
      fs: numberOrNull(live.fs),
      rms: numberOrNull(live.rms),
    },
    vision: {
      status: normalizeVoiceState(sight.status),
      captureStatus: normalizeVoiceState(capture.status),
      captureKind: text(capture.kind, 40),
      authorized: capture.authorized === true,
      inferenceExecuted: inference.executed === true,
      modelStatus: text(inference.modelStatus, 40),
      modelId: text(inference.modelId, 80),
      contractVersion: text(inference.semanticContractVersion, 20),
      confidence: numberOrNull(inference.confidence),
      analysisKind: text(sight.analysisKind, 40) || 'DETERMINISTIC_LOCAL',
      // El resumen del cliente es determinista aunque el servidor use LLM.
      llmUsed: false,
      visionSignalStatus: normalizeVoiceState(visionSignal.estado),
      // Resumen multi-frame del clip local: métricas temporales, nunca un diagnóstico.
      clip: clip.status ? {
        status: normalizeVoiceState(clip.status),
        declaredPath: text(clip.declaredPath, 160),
        sha256: text(clip.sha256, 64),
        durationSec: numberOrNull(clip.durationSec),
        analyzedFrames: numberOrNull(clip.analyzedFrames),
        meanFrameDelta: numberOrNull(clip.meanFrameDelta),
        temporalVariation: numberOrNull(clip.temporalVariation),
        lumaTrend: text(clip.lumaTrend, 24),
        frameInferences: clip.frameInferences ? {
          requestedFrames: numberOrNull(clipFrames.requestedFrames),
          executedFrames: numberOrNull(clipFrames.executedFrames),
          distinctLabels: Array.isArray(clipFrames.distinctLabels)
            ? clipFrames.distinctLabels.slice(0, 8).map((label) => text(label, 40)).filter(Boolean)
            : [],
        } : null,
      } : null,
    },
    limitations: [
      'Resumen determinista del cliente: no es un LLM ni una inferencia nueva.',
      'NO_DATA y ROTO no se elevan a REAL; LOCAL y SIM se reportan como declarados.',
      'El clip local se reporta LOCAL: sus métricas temporales NO son diagnóstico y NO elevan la escena a REAL-LOCAL.',
      'La navegacion exige token cerrado del servidor y ruta existente en el frontend.',
    ],
  };
};

const readHeader = (headers, name) => {
  try {
    const raw = headers?.get?.(name);
    return raw ? String(raw).trim() : '';
  } catch {
    return '';
  }
};

const decodeHeader = (value) => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/** Trazas del servicio. No asume que los headers estan presentes. */
export const readVoiceTrace = (headers) => {
  const navigate = readHeader(headers, 'X-SIGCT-Navigate');
  return {
    mode: readHeader(headers, 'X-SIGCT-Assist-Mode') || 'UNKNOWN',
    llmUsed: readHeader(headers, 'X-SIGCT-LLM-Used').toLowerCase() === 'true',
    llmStatus: readHeader(headers, 'X-SIGCT-LLM-Status') || 'UNKNOWN',
    intent: readHeader(headers, 'X-SIGCT-Intent') || 'unknown',
    transcript: decodeHeader(readHeader(headers, 'X-SIGCT-Transcript')),
    navigate,
    navigatedTo: resolveVoiceTarget(navigate),
    contextStatus: readHeader(headers, 'X-SIGCT-Context-Status') || 'absent',
    clipStatus: readHeader(headers, 'X-SIGCT-Clip-Status') || 'absent',
    clipFrames: readHeader(headers, 'X-SIGCT-Clip-Frames') || '',
    clipMotion: readHeader(headers, 'X-SIGCT-Clip-Motion') || '',
    clipSha256: readHeader(headers, 'X-SIGCT-Clip-Sha256') || '',
  };
};

/**
 * Envía audio + contexto al /assist real. Devuelve el audio y la traza;
 * la navegacion solo se ejecuta cuando el servidor propone un token valido.
 */
export const postVoiceAudio = async ({ audioBlob, mimeType, context, onNavigate } = {}) => {
  if (!audioBlob || typeof audioBlob.arrayBuffer !== 'function') {
    throw new Error('No se capturó audio para enviar.');
  }

  const contentType = String(mimeType || audioBlob.type || 'audio/webm');
  const extension = contentType.includes('mp4') ? 'mp4' : contentType.includes('ogg') ? 'ogg' : 'webm';
  const formData = new FormData();
  formData.append('audio', audioBlob, `grabacion.${extension}`);
  if (context) formData.append('context', JSON.stringify(context));

  const response = await fetch(`${API_BASE}/assist`, {
    method: 'POST',
    body: formData,
  });
  const trace = readVoiceTrace(response.headers);

  if (!response.ok) {
    const error = new Error(`Asistente de voz no disponible (HTTP ${response.status}).`);
    error.trace = trace;
    throw error;
  }

  const audio = await response.blob();
  const navigatedTo = trace.navigate ? safeNavigate(trace.navigate, onNavigate) : null;
  return { audio, trace, navigatedTo };
};
