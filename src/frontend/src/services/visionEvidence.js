// CANAL DE EVIDENCIA DE VISIÓN · aditivo, en memoria de sesión.
//
// Propósito: unir, sin inventar nada, tres hechos que hoy viven separados:
//   1. la captura autorizada en el navegador (frame de cámara, frame extraído de
//      un clip en memoria o archivo local);
//   2. la respuesta REAL del pipeline de inferencia oficial
//      (navegador -> /api/v3/ai/inference/ -> ai_service :8081 -> /infer);
//   3. el snapshot vivo S35 publicado por el núcleo MMC (ya en useLabStore);
//   4. (aditivo) el resumen multi-frame de un clip LOCAL leído sin copiar desde
//      .local_backups/, con sus métricas temporales y frames autorizados.
//
// ESTE MÓDULO NO ES UN LLM. No llama a ningún servicio externo, no carga
// modelos y no fabrica diagnósticos: aplica reglas deterministas sobre campos
// verificables y deja constancia de qué NO se pudo verificar. Un veredicto
// REAL-LOCAL solo aparece cuando hay captura propia autorizada Y el servicio
// declara `inference_executed: true`. Nunca se emite `REAL`.
//
// Se implementa como store externo mínimo con useSyncExternalStore para NO
// modificar useLabStore.js (contrato canónico intacto). Es solo lectura para
// los consumidores y se publica desde la sonda de cámara.

import { useSyncExternalStore } from 'react';
import { buildIngestEnvelope } from './ingestEnvelope.js';

export const VISION_STATES = Object.freeze({
  'REAL-LOCAL': '#39FF14',
  LOCAL: '#FFD32A',
  SIM: '#00FFFF',
  ROTO: '#FF3131',
  NO_DATA: '#94A3B8',
});

const EMPTY_EVIDENCE = Object.freeze({
  version: 'vision-evidence-v1',
  analysisKind: 'DETERMINISTIC_LOCAL',
  llmUsed: false,
  status: 'NO_DATA',
  statusColor: VISION_STATES.NO_DATA,
  capture: null,
  clip: null,
  inference: null,
  ingest: null,
  signal: null,
  observations: [],
  recommendation: 'Sin captura ni inferencia en esta sesión: activar la sonda y autorizar una captura.',
  limitations: [],
  trace: null,
  updatedAt: null,
});

let snapshot = EMPTY_EVIDENCE;
const listeners = new Set();

const emit = () => { listeners.forEach((listener) => listener()); };

export const subscribeVisionEvidence = (listener) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export const getVisionEvidence = () => snapshot;

export const clearVisionEvidence = () => {
  if (snapshot === EMPTY_EVIDENCE) return;
  snapshot = EMPTY_EVIDENCE;
  emit();
};

export const publishVisionEvidence = (evidence) => {
  snapshot = Object.freeze({ ...evidence, updatedAt: new Date().toISOString() });
  emit();
};

export const useVisionEvidence = () => (
  useSyncExternalStore(subscribeVisionEvidence, getVisionEvidence, getVisionEvidence)
);

const text = (value, fallback = '—') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const shortHash = (value) => {
  const hash = text(value, null);
  return hash ? `${hash.slice(0, 12)}…` : '—';
};

/**
 * Describe la captura con el estado honesto que le corresponde. El clip se
 * graba solo en memoria y NUNCA se envía: lo que cruza la red es un frame
 * extraído con autorización explícita.
 */
export const describeCapture = ({
  kind = 'none',
  authorized = false,
  origin = '',
  fileName = '',
  derivedFrom = '',
  clipBytes = null,
  clipMimeType = '',
  declaredPath = '',
  sha256 = '',
  error = null,
} = {}) => {
  let status = 'NO_DATA';
  if (error) status = 'ROTO';
  else if (kind === 'camera-frame' || kind === 'clip-frame' || kind === 'clip-recording') {
    status = authorized ? 'REAL-LOCAL' : 'NO_DATA';
  } else if (kind === 'local-file' || kind === 'local-clip') {
    // Un archivo/clip cargado desde disco es LOCAL: NUNCA se eleva a REAL-LOCAL.
    status = 'LOCAL';
  }
  return {
    kind,
    status,
    authorized: Boolean(authorized),
    origin: text(origin, null),
    fileName: text(fileName, null),
    derivedFrom: text(derivedFrom, null),
    clipBytes: Number.isFinite(clipBytes) ? clipBytes : null,
    clipMimeType: text(clipMimeType, null),
    declaredPath: text(declaredPath, null),
    sha256: text(sha256, null),
    error: text(error, null),
  };
};

/**
 * Normaliza el resumen multi-frame del clip local. Solo acepta un análisis
 * determinista LOCAL: cualquier error o estado desconocido degrada a ROTO.
 * Ningún campo aquí puede elevar el clip a REAL ni inventar inferencias.
 */
const describeClip = ({ summary, frameInferences = null, error = null } = {}) => {
  if (error || !summary || summary.status !== 'LOCAL') {
    return {
      status: 'ROTO',
      error: text(error, null) || 'El análisis del clip local no produjo un resumen utilizable.',
      declaredPath: text(summary?.source?.declaredPath, null),
      fileName: text(summary?.source?.fileName, null),
      sha256: text(summary?.source?.sha256, null),
    };
  }
  const source = summary.source || {};
  const metrics = summary.metrics || {};
  const sampling = summary.sampling || {};
  const inference = frameInferences || null;
  return {
    status: 'LOCAL',
    error: null,
    analysisKind: text(summary.analysisKind, 'DETERMINISTIC_LOCAL'),
    llmUsed: false,
    declaredPath: text(source.declaredPath, null),
    fileName: text(source.fileName, null),
    bytes: Number.isFinite(source.bytes) ? source.bytes : null,
    mimeType: text(source.mimeType, null),
    sha256: text(source.sha256, null),
    durationSec: Number.isFinite(source.durationSec) ? source.durationSec : null,
    durationEstimated: source.durationEstimated === true,
    width: Number.isFinite(source.width) ? source.width : null,
    height: Number.isFinite(source.height) ? source.height : null,
    analyzedFrames: Number.isFinite(sampling.analyzedFrames) ? sampling.analyzedFrames : null,
    meanFrameDelta: Number.isFinite(metrics.meanFrameDelta) ? metrics.meanFrameDelta : null,
    maxFrameDelta: Number.isFinite(metrics.maxFrameDelta) ? metrics.maxFrameDelta : null,
    temporalVariation: Number.isFinite(metrics.temporalVariation) ? metrics.temporalVariation : null,
    lumaTrend: text(metrics.lumaTrend, null),
    meanEdgeEnergy: Number.isFinite(metrics.meanEdgeEnergy) ? metrics.meanEdgeEnergy : null,
    changingPairRatio: Number.isFinite(metrics.changingPairRatio) ? metrics.changingPairRatio : null,
    frameInferences: inference ? {
      requestedFrames: Number.isFinite(inference.requestedFrames) ? inference.requestedFrames : null,
      executedFrames: Number.isFinite(inference.executedFrames) ? inference.executedFrames : null,
      distinctLabels: Array.isArray(inference.distinctLabels) ? inference.distinctLabels : [],
      confidenceMin: Number.isFinite(inference.confidenceMin) ? inference.confidenceMin : null,
      confidenceMax: Number.isFinite(inference.confidenceMax) ? inference.confidenceMax : null,
    } : null,
  };
};

const statusFromInference = (info, error) => {
  if (error) return 'ROTO';
  if (!info) return 'NO_DATA';
  if (info.inferenceExecuted !== true) return 'ROTO';
  return info.modelStatus === 'NO_DISPONIBLE' ? 'ROTO' : 'REAL-LOCAL';
};

/**
 * Análisis contextual determinista. `info` es el resultado de
 * buildInfoFromOfficialResponse(data); `raw` es el sobre V3 completo;
 * `liveSignal` es mathLiveSignal del store canónico.
 */
export const analyzeVisionContext = ({ capture, info, raw, liveSignal, error, clip = null } = {}) => {
  const described = capture || describeCapture({ error });
  const describedClip = clip ? describeClip(clip) : null;
  const trace = raw?.trace || {};
  const prediction = raw?.prediction || {};
  const inferenceStatus = statusFromInference(info, error);
  const published = Boolean(liveSignal?.published);
  const liveState = published && ['REAL-LOCAL', 'LOCAL', 'SIM', 'ROTO'].includes(liveSignal?.estado)
    ? liveSignal.estado
    : 'NO_DATA';

  const executed = info?.inferenceExecuted === true;
  // Un clip cargado desde disco es LOCAL con o sin inferencia: NUNCA se eleva a
  // REAL-LOCAL. Solo la captura propia autorizada puede alcanzar REAL-LOCAL.
  let verdict;
  if (error || described.status === 'ROTO' || describedClip?.status === 'ROTO') {
    verdict = 'ROTO';
  } else if (describedClip?.status === 'LOCAL') {
    verdict = 'LOCAL';
  } else if (!executed) {
    verdict = inferenceStatus;
  } else {
    verdict = described.status === 'REAL-LOCAL' || described.status === 'LOCAL'
      ? described.status
      : 'NO_DATA';
  }

  // Envelope de ingesta agnóstica: declare procedencia, linaje y QC sin escribir
  // en BD ni en data/. Es una vista del mismo hecho, no una segunda evidencia.
  const ingest = buildIngestEnvelope({
    capture: described,
    clip: describedClip,
    info,
    error,
  });

  const observations = [];
  const push = (code, detail) => observations.push({ code, detail });

  push('CAPTURA', described.status === 'NO_DATA'
    ? 'Sin captura autorizada en esta sesión.'
    : `${text(described.kind)} · ${described.status} · origen: ${text(described.origin)}.`);
  if (described.kind === 'clip-frame' || described.kind === 'clip-recording') {
    push('CLIP', described.clipBytes
      ? `Clip en memoria ${described.clipBytes} B · ${text(described.clipMimeType)} · no enviado ni persistido; solo el frame autorizado cruza la red.`
      : 'Clip en memoria · no enviado ni persistido.');
  }
  if (described.derivedFrom) {
    push('DERIVED_FROM', `${described.derivedFrom} · metadato local, no interpretado por V3.`);
  }
  if (describedClip?.status === 'ROTO') {
    push('CLIP', `Análisis fallido: ${text(describedClip.error)}.`);
  } else if (describedClip?.status === 'LOCAL') {
    push('CLIP', `LOCAL ${text(describedClip.declaredPath)} · ${shortHash(describedClip.sha256)} · ${text(describedClip.bytes)} B · ${text(describedClip.durationSec)} s · ${text(describedClip.width)}x${text(describedClip.height)}.`);
    push('MULTIFRAME', `${text(describedClip.analyzedFrames)} frames · Δ ${text(describedClip.meanFrameDelta)}/${text(describedClip.maxFrameDelta)} · var ${text(describedClip.temporalVariation)} · tend ${text(describedClip.lumaTrend, '—')} · bordes ${text(describedClip.meanEdgeEnergy)}. Determinista: no es inferencia ni diagnóstico.`);
    if (describedClip.frameInferences) {
      const fi = describedClip.frameInferences;
      push('FRAME_INFERENCE', `${fi.executedFrames}/${fi.requestedFrames} frames · etiquetas ${fi.distinctLabels.length ? fi.distinctLabels.map(text).join(', ') : 'sin etiqueta'} · conf ${text(fi.confidenceMin)}–${text(fi.confidenceMax)} · por frame, no promedio del clip.`);
    } else {
      push('FRAME_INFERENCE', 'Sin inferencia sobre frames: no se estiman etiquetas ni confianza.');
    }
  }
  push('INGESTA', `${text(ingest.source.kind)} · ingest=${ingest.ingestStatus} · qc=${ingest.qcStatus} · destino=${ingest.persistence.target} · sin escritura en BD ni data/.`);
  if (error) {
    push('TRANSPORTE', `Petición incompleta: ${text(error)}.`);
  } else if (info) {
    push('ARTEFACTO', `${text(info.modelStatus)} · ${text(info.modelVersion)} · ${shortHash(info.modelSha256)}.`);
    if (info.modelStatus === 'HISTORICO') {
      push('PROCEDENCIA', 'Histórico binario congelado: sin especie ni enfermedad; confianza alta no valida la escena.');
    } else if (info.modelStatus === 'CANONICO') {
      push('PROCEDENCIA', 'Canónico servido como challenger: servir != promover sobre M1.');
    } else {
      push('PROCEDENCIA', 'Procedencia no declarada: sin afirmaciones sobre el artefacto.');
    }
    push('EJECUCIÓN', `inference_executed=${executed} · source_mode=${text(info.sourceMode)} · origen=${text(trace.inference_origin, '—')}.`);
    if (executed) {
      const contract = text(prediction.semantic_contract_version || info.semanticContractVersion, 'v1').toLowerCase();
      push('CONTRATO', contract === 'v2'
        ? 'v2 · 16 clases (maíz, papa, tomate): investigación, no diagnóstico de campo.'
        : 'v1 binario (enferma/sana): sin enfermedad específica.');
      push('CONFIANZA', `${Number(info.confidence || 0).toFixed(4)} · softmax de esta muestra, no precisión calibrada.`);
      push('RESULTADO', `${text(prediction.prediction_label || info.disease, 'sin etiqueta')} · ${text(prediction.prediction_code || info.predictionCode, 'sin código')}.`);
    }
  }

  push('SEÑAL S35', published
    ? `${liveState} · ${text(liveSignal.sourceLabel)} · ${text(liveSignal.sampleCount)} muestras · fs ${text(liveSignal.fs)} Hz · rms ${text(liveSignal.rms)}.`
    : 'NO_DATA · sin señal publicada.');

  let recommendation;
  if (verdict === 'ROTO') {
    recommendation = 'Sin inferencia útil o artefacto no disponible: no reportar resultado. Revisar el servicio y repetir la captura autorizada.';
  } else if (verdict === 'NO_DATA') {
    recommendation = 'Falta captura autorizada o respuesta: activar cámara, declarar origen y enviar un frame antes de emitir juicio.';
  } else if (verdict === 'LOCAL' && describedClip?.status === 'LOCAL') {
    recommendation = 'Clip LOCAL con métricas temporales: reportar origen, sha256 y duración; no elevan a REAL ni validan cultivo. Cada frame describe solo esa muestra.';
  } else if (verdict === 'LOCAL') {
    recommendation = 'Imagen local: verificar origen, fecha y contexto. La inferencia describe esa muestra, no el cultivo.';
  } else {
    recommendation = 'Captura propia e inferencia ejecutadas: conservar origen, hash y metadata; contrastar en campo. No usar para promover M2 sobre M1.';
  }

  return {
    version: 'vision-evidence-v1',
    analysisKind: 'DETERMINISTIC_LOCAL',
    llmUsed: false,
    status: verdict,
    statusColor: VISION_STATES[verdict] || VISION_STATES.NO_DATA,
    capture: described,
    clip: describedClip,
    ingest,
    inference: info ? {
      executed,
      modelStatus: text(info.modelStatus),
      modelId: text(info.modelVersion),
      modelSha256: shortHash(info.modelSha256),
      contractVersion: text(info.modelContractVersion, null),
      semanticContractVersion: text(prediction.semantic_contract_version || info.semanticContractVersion, null),
      sourceMode: text(info.sourceMode),
      confidence: Number(info.confidence || 0),
      rawDiagnosis: text(trace.raw_diagnosis, null),
      rawClassIndex: Number.isFinite(Number(trace.raw_class_index)) ? Number(trace.raw_class_index) : null,
    } : null,
    signal: {
      published,
      estado: liveState,
      sourceLabel: text(liveSignal?.sourceLabel, null),
      sampleCount: Number.isFinite(liveSignal?.sampleCount) ? liveSignal.sampleCount : null,
      fs: Number.isFinite(liveSignal?.fs) ? liveSignal.fs : null,
      rms: Number.isFinite(liveSignal?.rms) ? liveSignal.rms : null,
    },
    observations,
    recommendation,
    limitations: [
      'Determinista local: sin LLM ni inferencia nueva; clip original solo en lectura, sin copia ni persistencia en data/.',
      'Métricas multi-frame = señales temporales; no diagnostican especie, enfermedad ni estado de cultivo.',
      describedClip?.status === 'LOCAL'
        ? 'Frames al endpoint solo con autorización; cada inferencia describe su frame.'
        : 'Sin métricas de clip en esta sesión.',
      'Confianza alta no valida la escena ni implica precisión de campo; envelope de ingesta en memoria, sin escritura en BD ni data/.',
      'M1 baseline congelado · M2 challenger sin promoción (servir != promover).',
    ],
    trace: {
      clientContext: 'usb_frame_contract_v1',
      inferenceUrl: '/api/v3/ai/inference/ → :8081/infer',
      captureOrigin: text(described.origin, null),
      authorization: text(described.authorized ? 'autorización explícita en pantalla' : 'sin autorización', null),
      clipStatus: text(describedClip?.status, null),
      clipPath: text(describedClip?.declaredPath, null),
      clipSha256: describedClip?.sha256 ? shortHash(describedClip.sha256) : null,
      clipFrames: Number.isFinite(describedClip?.analyzedFrames) ? describedClip.analyzedFrames : null,
      clipFrameInferences: describedClip?.frameInferences
        ? `${describedClip.frameInferences.executedFrames ?? 0}/${describedClip.frameInferences.requestedFrames ?? 0}`
        : null,
      ingestStatus: ingest.ingestStatus,
      ingestQcStatus: ingest.qcStatus,
      ingestPersistence: ingest.persistence.target,
      s35UpdatedAt: text(liveSignal?.updatedAt, null),
    },
  };
};
