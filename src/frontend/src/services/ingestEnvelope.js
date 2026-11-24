// ENVELOPE DE INGESTA AGNÓSTICA · declarativo, en memoria, sin WRITE.
//
// Contrato: docs/AI_VISION_LLM_INGEST_ETL_STATUS_V1.md (§4). Resume cualquier
// fuente (cámara USB, clip local, archivo, sensor HTTP o dataset de referencia)
// a un mismo conjunto de campos de procedencia, sin asumir hardware ni BD.
//
// REGLA DE HONESTIDAD: este módulo NO persiste, NO escribe en data/, NO llama a
// la base de datos y NO certifica calidad científica. `qcStatus: PENDING` es el
// valor por defecto; solo se marca un check como PASS cuando el hecho ya está
// declarado por la captura o por la respuesta oficial de inferencia.

export const INGEST_ENVELOPE_VERSION = 'sigct-ingest-envelope-v1';

export const INGEST_SOURCE_KINDS = Object.freeze({
  CAMERA_FRAME: 'camera-frame',
  CLIP_FRAME: 'clip-frame',
  CLIP_RECORDING: 'clip-recording',
  LOCAL_FILE: 'local-file',
  LOCAL_CLIP: 'local-clip',
  SENSOR_HTTP: 'sensor-http',
  DATASET_REFERENCE: 'dataset-reference',
});

export const INGEST_STATUS = Object.freeze({
  SIN_DATOS: 'SIN_DATOS',
  PENDIENTE_AUTORIZACION: 'PENDIENTE_AUTORIZACION',
  PENDIENTE_INFERENCIA: 'PENDIENTE_INFERENCIA',
  OBSERVACION_LOCAL: 'OBSERVACION_LOCAL',
  ACEPTADO_MUESTRA: 'ACEPTADO_MUESTRA',
  RECHAZADO: 'RECHAZADO',
});

const clean = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const check = (code, result, detail) => ({ code, result, detail });

/**
 * @param {object} args
 * @param {object} [args.capture]  describeCapture(...) de visionEvidence.
 * @param {object} [args.clip]     clip descrito por visionEvidence.
 * @param {object} [args.info]     buildInfoFromOfficialResponse(...)
 * @param {string} [args.error]    error de transporte/analyzer, si lo hubo.
 * @param {string} [args.deviceId] identificador declarado por la fuente; nunca se inventa.
 * @param {string} [args.sourceId] identificador lógico de la fuente.
 */
export const buildIngestEnvelope = ({
  capture = null,
  clip = null,
  info = null,
  error = null,
  deviceId = null,
  sourceId = null,
} = {}) => {
  const source = capture && typeof capture === 'object' ? capture : {};
  const localClip = clip && typeof clip === 'object' && clip.status ? clip : null;
  const inference = info && typeof info === 'object' ? info : {};
  const kind = clean(source.kind, localClip ? 'local-clip' : 'none');
  const authorized = source.authorized === true;
  const executed = inference.inferenceExecuted === true;
  const errored = Boolean(error) || source.status === 'ROTO' || localClip?.status === 'ROTO';
  const isLocal = source.status === 'LOCAL' || localClip?.status === 'LOCAL';
  const hasAny = kind !== 'none' || Boolean(localClip);

  let ingestStatus = INGEST_STATUS.SIN_DATOS;
  if (errored) ingestStatus = INGEST_STATUS.RECHAZADO;
  else if (isLocal) ingestStatus = INGEST_STATUS.OBSERVACION_LOCAL;
  else if (!hasAny) ingestStatus = INGEST_STATUS.SIN_DATOS;
  else if (!authorized) ingestStatus = INGEST_STATUS.PENDIENTE_AUTORIZACION;
  else if (!executed) ingestStatus = INGEST_STATUS.PENDIENTE_INFERENCIA;
  else ingestStatus = INGEST_STATUS.ACEPTADO_MUESTRA;

  const sha256 = clean(localClip?.sha256 || source.sha256);
  const origin = clean(source.origin || source.declaredPath || localClip?.declaredPath);
  const declaredPath = clean(source.declaredPath || localClip?.declaredPath);

  const lineage = [
    { step: 'CAPTURA', status: errored && !localClip ? 'ROTO' : clean(source.status, 'NO_DATA') },
  ];
  if (localClip) {
    lineage.push({ step: 'EXTRACCION_LOCAL', status: localClip.status === 'LOCAL' ? 'DETERMINISTA_LOCAL' : 'ROTO' });
  }
  lineage.push({ step: 'AUTORIZACION', status: authorized ? 'CONFIRMADA' : 'AUSENTE' });
  lineage.push({ step: 'TRANSPORTE', status: info ? 'RESPUESTA_OFICIAL_RECIBIDA' : 'SIN_RESPUESTA' });
  lineage.push({ step: 'INFERENCIA', status: executed ? 'EJECUTADA_SOBRE_MUESTRA' : 'NO_EJECUTADA' });
  lineage.push({ step: 'PERSISTENCIA', status: 'NO_REALIZADA' });
  lineage.push({ step: 'EVIDENCIA', status: hasAny || localClip ? 'PUBLICADA_EN_SESION' : 'NO_DATA' });

  const qcChecks = [
    check('ORIGEN_DECLARADO', origin ? 'PASS' : 'NO_DATA', origin || 'sin origen declarado'),
    check('HASH_DISPONIBLE', sha256 ? 'PASS' : 'NO_DATA', sha256 ? 'sha256 calculado' : 'sin hash'),
    check('AUTORIZACION_EXPLICITA', authorized ? 'PASS' : 'FAIL', authorized ? 'confirmada en pantalla' : 'ausente'),
    check('TRANSPORTE_OFICIAL', info ? 'PASS' : 'NO_DATA', info ? '/api/v3/ai/inference/ → :8081/infer' : 'sin respuesta'),
    check('INFERENCIA_EJECUTADA', executed ? 'PASS' : 'NO_DATA', executed ? 'sobre la muestra enviada' : 'no ejecutada'),
    check('QC_CIENTIFICO', 'PENDING', 'requiere curación, doble anotación y gate de dataset; no se simula'),
  ];

  return {
    version: INGEST_ENVELOPE_VERSION,
    analysisKind: 'DETERMINISTIC_LOCAL',
    llmUsed: false,
    source: {
      sourceId: clean(sourceId, kind === 'none' ? 'NO_DECLARADO' : kind),
      deviceId: clean(deviceId, 'NO_DECLARADO'),
      kind,
      modality: kind.includes('clip') || kind.includes('camera') ? 'video/image' : 'undeclared',
      origin,
      declaredPath,
      fileName: clean(source.fileName || localClip?.fileName),
      sha256,
      bytes: Number.isFinite(source.clipBytes) ? source.clipBytes : (Number.isFinite(localClip?.bytes) ? localClip.bytes : null),
      mimeType: clean(source.clipMimeType || localClip?.mimeType),
    },
    ingestStatus,
    qcStatus: errored ? 'FAIL' : 'PENDING',
    qcChecks,
    lineage,
    provenance: {
      captureStatus: clean(source.status, 'NO_DATA'),
      clipStatus: clean(localClip?.status),
      inferenceStatus: executed ? 'EJECUTADA' : 'NO_EJECUTADA',
      modelStatus: clean(info?.modelStatus),
      endpoint: '/api/v3/ai/inference/ → :8081/infer',
      error: clean(error),
    },
    persistence: {
      target: 'IN_MEMORY_SESSION',
      databaseWrite: false,
      datasetWrite: false,
      reason: 'Sin misión explícita de persistencia: la evidencia vive en el store de sesión y no se escribe en data/.',
    },
    observedAt: new Date().toISOString(),
  };
};
