/**
 * Ingesta de un clip: valida, escribe el WAV, extrae features y registra la fila.
 *
 * ORDEN DE OPERACIONES (importante para la honestidad del estado):
 *   1. Se valida el audio EN MEMORIA. Nada toca el disco hasta saber si es valido.
 *   2. Se escribe el WAV en raw/<dir>/.
 *   3. Se extraen las 44 features.
 *   4. Se escribe UNA fila en metadata.csv (atomica).
 *   5. Se escribe/actualiza la fila de features.
 *
 * Si un paso falla, los anteriores se conservan y el clip queda marcado; nunca se borra
 * una muestra (NADA DESAPARECE) y nunca se marca `accepted` lo que no paso los AC.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  CLIP_CONTRACT, N_FFT, LOGGER_VERSION, MISSION, FRAMES_PER_CLIP, WINDOW_SCHEMA_V1,
  resolveFeatureSchemaId, windowSchemaFor
} from './constants.js';
import { decodeWav, encodeWav, WavError } from './wav.js';
import { resample, fitDuration } from './resample.js';
import { extractClipFeatures } from './features.js';
import { aggregateWindow } from './window.js';
import { evaluateClip, energyEnvelope, checkFrameContract } from './gates.js';
import {
  DatasetPaths,
  loadMetadata, saveMetadata, upsertMetadataRow, loadFeatures, saveFeatures,
  loadEnvelopes, saveEnvelopes, refreshChecksums,
  sha256Hex, nowIso, uniqueSampleId, ensureDir
} from './dataset.js';

export const INGEST_STATUSES = Object.freeze(['accepted', 'quarantine', 'rejected']);

/**
 * Ingesta un WAV externo al dataset.
 *
 * @param {object} opts
 * @param {string} opts.datasetRoot
 * @param {string} opts.wavPath ruta del WAV a ingerir
 * @param {string} opts.classId
 * @param {object} opts.ctx { session_id, place_id, operator_id, annotator_id, environment, device_id, agreement, notes, latitude, longitude, weather_note, hour_local }
 * @param {string} [opts.resampleMethod] 'cubic' (default) | 'linear'
 * @param {string} [opts.featureSchema] `acoustic.feat.v2` (default) | `acoustic.feat.v1`.
 *   v1 queda disponible solo para reproducir artefactos historicos: su feature 21 es
 *   cientificamente incorrecta y esta CONGELADA por decision de gobernanza 2026-10-05.
 * @param {boolean} [opts.dryRun] valida y calcula sin escribir nada
 * @param {function} [opts.log]
 * @returns {object} informe de la ingesta
 */
export function ingestWav(opts) {
  const { datasetRoot, wavPath, classId, ctx, resampleMethod = 'cubic', dryRun = false, log = () => {} } = opts;
  const paths = opts.paths ?? new DatasetPaths(datasetRoot);
  const featureSchema = resolveFeatureSchemaId(opts.featureSchema);
  const windowSchema = windowSchemaFor(featureSchema);

  const started = Date.now();
  const buffer = fs.readFileSync(wavPath);

  // --- 1. Decode + remuestreo declarado (todo en memoria)
  let decoded;
  try {
    decoded = decodeWav(buffer);
  } catch (err) {
if (err instanceof WavError) {
      return rejection({ wavPath, reason: err.message, detail: err.detail, dryRun, log });
    }
    throw err;
  }

  const nativeRate = decoded.sampleRate;
  const rs = resample(decoded.samples, nativeRate, resampleMethod);
  const fit = fitDuration(rs.samples, rs.targetRate);

  const { header, rows } = loadMetadata(paths);
  const timestamp = ctx.timestamp ?? nowIso();
  const sampleId = ctx.sample_id ?? uniqueSampleId(rows, timestamp ? new Date(timestamp) : new Date());
  const dirName = paths.dirFor(classId);

  // --- 2. Artefacto a escribir y su hash.
  // El sha256 que se registra y se usa en AC-8 es el del ARTEFACTO DEL DATASET, no el del
  // fichero entrante. Si hay remuestreo o recorte, el WAV escrito es distinto y hashear el
  // original dejaria CHECKSUMS.sha256 en contradiccion con metadata.csv.
  const identityBytes = (!rs.resampled && fit.wasExact) ? buffer : encodeWav(fit.samples, rs.targetRate);
  const sha256 = sha256Hex(identityBytes);
  const storedFilename = `${sampleId}_${sha256}.wav`;
  const fileRel = path.posix.join('raw', dirName, storedFilename);
  const destPath = path.join(paths.root, fileRel);
  const destinationExists = fs.existsSync(destPath);
  if (destinationExists && !fs.readFileSync(destPath).equals(identityBytes)) {
    throw new Error(`ingestWav: colision de destino con contenido distinto: ${fileRel}`);
  }

  // --- 2. Features (44 dims) — se calculan siempre, incluso si el clip se rechaza,
  //     para que el diagnostico diga QUE se oyo, no solo QUE no sirvio.
  const extracted = extractClipFeatures(fit.samples, rs.targetRate, CLIP_CONTRACT.hop, N_FFT, featureSchema);
  let window = null;
  let windowError = null;
  if (extracted.frames.length > 0) {
    try {
      window = aggregateWindow(extracted.frames);
    } catch (err) {
      windowError = err.message;
    }
  } else {
    windowError = 'el clip no produce ningun frame: no hay 4096 muestras completas';
  }

  // --- 3. Evaluacion AC-1..AC-10
  const existingSha = new Set(rows.filter((r) => r.ingest_status === 'accepted').map((r) => r.sha256).filter(Boolean));

  // Sobres de energia de clips ya aceptados: dan a AC-9 referencias reales en vez de
  // dejarse siempre en "provisional". Cache derivada en features/, no columna del contrato.
  const envelopeCache = loadEnvelopes(paths);
  const previousEnvelopes = [...envelopeCache.values()].map((v) => (Array.isArray(v) ? v : [])).filter((v) => v.length > 0);

  const storedDurationS = fit.samples.length / rs.targetRate;
  const evaluation = evaluateClip({
    stored: {
      sampleRate: rs.targetRate,
      channels: decoded.channels,
      bitDepth: decoded.bitDepth,
      durationS: storedDurationS
    },
    source: { sampleRate: nativeRate, durationS: decoded.durationS, sampleCount: decoded.numSamples },
    fit,
    samples: fit.samples,
    sha256,
    file: fileRel,
    classId,
    dirName,
    existingSha256: existingSha,
    frames: extracted.frames,
    previousEnvelopes,
    audibleEnergyShare: extracted.audibleEnergyShare,
    // Tolerancia de desajuste entre la duracion de la fuente y la del artefacto.
    // 1 ms: el unico desfase legitimo es el redondeo al ultimo sample.
    spreadToleranceS: 0.001
  });

  const frameContract = checkFrameContract(extracted.frameCount);
  if (windowError) {
    evaluation.verdict = 'quarantine';
    evaluation.checks.push({ id: 'FEAT-1', ok: false, detail: windowError, on_fail: 'quarantine' });
  }
  if (!frameContract.ok) {
    evaluation.checks.push({
      id: 'FEAT-2',
      ok: false,
      detail: `frames=${extracted.frameCount}, esperado ${FRAMES_EXPECTED}`,
      on_fail: 'quarantine'
    });
    if (evaluation.verdict === 'accepted') evaluation.verdict = 'quarantine';
  }
  if (fit.padded) {
    evaluation.checks.push({
      id: 'FIT-1',
      ok: false,
      detail: `clip relleno con ceros (${(fit.samples.length - Math.round(nativeRate * CLIP_CONTRACT.durationS * (nativeRate / rs.targetRate))).toFixed(0)} muestras): no es una captura completa`,
      on_fail: 'quarantine'
    });
    if (evaluation.verdict === 'accepted') evaluation.verdict = 'quarantine';
  }

  const row = {
    sample_id: sampleId,
    file: fileRel,
    partition: 'unassigned',
    class_id: classId,
    sha256,
    duration_s: storedDurationS.toFixed(6),
    sample_rate: String(rs.targetRate),
    channels: String(decoded.channels),
    bit_depth: String(decoded.bitDepth),
    session_id: ctx.session_id ?? '',
    take_index: String(ctx.take_index ?? nextTakeIndex(rows, ctx.session_id)),
    place_id: ctx.place_id ?? '',
    environment: ctx.environment ?? 'campo',
    device_id: ctx.device_id ?? 'desconocido',
    capture_source_rate: String(rs.sourceRate),
    resample_method: rs.method,
    annotator_id: ctx.annotator_id ?? '',
    operator_id: ctx.operator_id ?? '',
    annotation_round: String(ctx.annotation_round ?? 1),
    review_annotator_id: ctx.review_annotator_id ?? '',
    agreement: ctx.agreement ?? 'single_reviewed',
    timestamp,
    license: ctx.license ?? 'PROPIO',
    source: 'cmsc_logger',
    dataset_version: 'v1',
    taxonomy_version: 'acoustic_v1_taxonomy',
    label_schema_version: 'acoustic_v1_label_schema',
    feature_schema: featureSchema,
    window_schema: windowSchema.id,
    ingest_status: evaluation.verdict,
    qc_status: evaluation.verdict === 'accepted' ? 'pass' : 'quarantine',
    curated_path: '',
    frames_count: String(extracted.frameCount),
    split_group_key: `${ctx.session_id ?? 's'}|${ctx.place_id ?? 'p'}`,
    secondary_classes: ctx.secondary_classes ?? '',
    contaminated: ctx.contaminated === true ? 'true' : '',
    confidence_annotator: ctx.confidence_annotator ?? '',
    hour_local: ctx.hour_local ?? String(new Date(timestamp).getHours()).padStart(2, '0'),
    weather_note: ctx.weather_note ?? '',
    latitude: ctx.latitude ?? '',
    longitude: ctx.longitude ?? '',
    notes: buildNotes({ ctx, fit, rs, evaluation, frameContract, logger: LOGGER_VERSION, mission: MISSION })
  };

  if (dryRun) {
    return {
      dryRun: true,
      sample_id: sampleId,
      verdict: evaluation.verdict,
      checks: evaluation.checks,
      failed: evaluation.checks.filter((c) => !c.ok),
      frameContract,
      features44: window ? window.values.length : 0,
      featurePreview: window ? preview(window.named) : null,
      row
    };
  }

  // --- 4. Escritura del WAV (si no venia ya de la ruta destino)
  ensureDir(path.dirname(destPath));
  if (!destinationExists) {
    fs.writeFileSync(destPath, identityBytes, { flag: 'wx' });
  }

  // --- 5. Fila en la tabla maestra
  const cols = header.length ? header : Object.keys(row);
  const { rows: rowsNow } = loadMetadata(paths);
  const upsert = upsertMetadataRow(cols, rowsNow, row);
  saveMetadata(paths, cols, rowsNow);

  // --- 6. Features
  let featureAction = 'skipped';
  if (window) {
    const featureMap = loadFeatures(paths, featureSchema);
    const existingRecords = [...featureMap.values()].map((r) => ({
      sample_id: r.sample_id,
      frame_count: Number(r.frame_count),
      values: WINDOW_ORDER.map((k) => Number(r[k]))
    }));
    const record = {
      sample_id: sampleId,
      frame_count: extracted.frameCount,
      values: window.values,
      feature_schema: featureSchema,
      window_schema: windowSchema.id
    };
    const without = existingRecords.filter((r) => r.sample_id !== sampleId);
    saveFeatures(paths, [...without, record], featureSchema);
    featureAction = featureMap.has(sampleId) ? 'updated' : 'inserted';
  }

  // --- 7. Cache de sobres para AC-9 (derivada) + indice de integridad.
  // Solo se indexa lo aceptado: un clip en cuarentena no es una referencia valida.
  // La cache es COMPARTIDA entre v1 y v2 a proposito: `energyEnvelope` lee el indice 4
  // (`rms`), que es identico en ambos esquemas. Una filaAccepted no depende de la
  // version de features, y las referencias de AC-9 no deben cambiar al migrar de esquema.
  let checksums = null;
  if (evaluation.verdict === 'accepted' && extracted.frames.length > 0) {
    envelopeCache.set(sampleId, energyEnvelope(extracted.frames));
    saveEnvelopes(paths, envelopeCache);
  }
  checksums = refreshChecksums(paths);

  log(`  ${evaluation.verdict.toUpperCase()} ${sampleId} -> ${fileRel}`);

  return {
    dryRun: false,
    sample_id: sampleId,
    verdict: evaluation.verdict,
    checks: evaluation.checks,
    failed: evaluation.checks.filter((c) => !c.ok),
    frameContract,
    features44: window ? window.values.length : 0,
    featurePreview: window ? preview(window.named) : null,
    metadataAction: upsert.action,
    featureAction,
    checksumsIndexed: checksums,
    wavPath: destPath,
    row,
    elapsedMs: Date.now() - started
  };
}

/** Rechazo temprano: el archivo ni siquiera es un WAV legible. */
function rejection({ wavPath, reason, detail, dryRun, log }) {
  const message = `rechazado en decodificacion: ${reason}`;
  const checks = [{ id: 'WAV-0', ok: false, detail: message, on_fail: 'rejected' }];
  if (dryRun) {
    return { dryRun: true, sample_id: null, verdict: 'rejected', checks, failed: checks, reason: message, detail };
  }
  // No se escribe fila: un archivo que ni se decodifica no es una muestra del dataset,
  // es un archivo entrante. Se informa y el archivo original queda intacto en su ruta.
  log(`  REJECTED ${path.basename(wavPath)}: ${message}`);
  return { dryRun: false, sample_id: null, verdict: 'rejected', checks, failed: checks, reason: message, detail, wroteNothing: true };
}

// Orden de columnas de la ventana. v1 y v2 comparten los mismos 44 nombres, asi que el
// orden se lee del array congelado de v1 y vale para ambas.
const WINDOW_ORDER = WINDOW_SCHEMA_V1;
const FRAMES_EXPECTED = FRAMES_PER_CLIP;

function nextTakeIndex(rows, sessionId) {
  return rows.filter((r) => r.session_id === sessionId).length;
}

function buildNotes({ ctx, fit, rs, evaluation, frameContract, logger, mission }) {
  const parts = [];
  if (ctx.notes) parts.push(ctx.notes);
  if (rs.resampled) parts.push(`remuestreado ${rs.sourceRate}->${rs.targetRate} (${rs.method})`);
  if (fit.trimmed) parts.push('recortado a 3,0 s');
  if (fit.padded) parts.push('RELLENADO CON CEROS hasta 3,0 s: captura incompleta');
  if (!frameContract.ok) parts.push(`frames=${frameContract.obtenido}/${frameContract.esperado}`);
  const failed = evaluation.checks.filter((c) => !c.ok).map((c) => c.id);
  if (failed.length) parts.push(`AC fallidos: ${failed.join(',')}`);
  parts.push(`${mission} v${logger}`);
  return parts.join(' | ');
}

function preview(named) {
  const keys = [
    'mean_dominantHzNorm', 'mean_centroidNorm', 'mean_flatness', 'mean_levelDb', 'mean_profileEntropy',
    'mean_bandPctLow', 'mean_bandPctMid', 'mean_bandPctHigh',
    'std_levelDb', 'std_dominantHzNorm'
  ];
  const out = {};
  for (const k of keys) if (named[k] !== undefined) out[k] = Number(named[k].toFixed(5));
  return out;
}