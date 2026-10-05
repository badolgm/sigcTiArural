/**
 * WINDOW_SCHEMA_V1 — agregacion temporal de las 22 features a 44 dimensiones.
 *
 * DECISION D-1 APROBADA 2026-10-04 (mision CMSC_DATA_LOGGER_V1):
 *   acoustic.feat.window.v1 = mean(feature) + std(feature) sobre los frames del clip.
 *
 * Orden del vector: las 22 medias (en el orden de acoustic.feat.v1) seguidas de las 22
 * desviaciones (mismo orden). El orden es CONTRATO INMUTABLE.
 *
 * std es POBLACIONAL (ddof=0): describe el clip, no una muestra estadistica. Con un solo
 * frame std = 0 y no se divide por nada.
 */

import {
  FEATURE_SCHEMA_V1,
  WINDOW_SCHEMA_V1,
  FEATURE_SCHEMA_SIZE,
  WINDOW_SCHEMA_DIMS
} from './constants.js';

function assertFrames(frames) {
  if (!Array.isArray(frames) || frames.length === 0) {
    throw new Error('aggregateWindow: se requiere al menos 1 frame');
  }
  for (const f of frames) {
    if (!Array.isArray(f) || f.length !== FEATURE_SCHEMA_SIZE) {
      throw new Error(
        `aggregateWindow: cada frame debe tener ${FEATURE_SCHEMA_SIZE} valores, recibido ${f && f.length}`
      );
    }
  }
}

/** media y desviacion poblacional por indice de feature. */
function columnStats(frames) {
  const n = frames.length;
  const mean = new Array(FEATURE_SCHEMA_SIZE).fill(0);
  const std = new Array(FEATURE_SCHEMA_SIZE).fill(0);

  for (const frame of frames) {
    for (let i = 0; i < FEATURE_SCHEMA_SIZE; i++) mean[i] += frame[i];
  }
  for (let i = 0; i < FEATURE_SCHEMA_SIZE; i++) mean[i] /= n;

  // Segunda pasada para la varianza. Se evita la formula de Welford porque el numero de
  // frames por clip (63) es fijo y pequeno: la resta de medias es estable aqui.
  for (const frame of frames) {
    for (let i = 0; i < FEATURE_SCHEMA_SIZE; i++) {
      const d = frame[i] - mean[i];
      std[i] += d * d;
    }
  }
  for (let i = 0; i < FEATURE_SCHEMA_SIZE; i++) {
    std[i] = Math.sqrt(std[i] / n);
  }

  return { mean, std };
}

/**
 * Agrega la matriz de features por frame al vector de 44 dimensiones.
 *
 * @param {number[][]} frames una fila por frame, 22 columnas
 * @returns {{values: number[], named: Record<string, number>, frameCount: number}}
 */
export function aggregateWindow(frames) {
  assertFrames(frames);
  const { mean, std } = columnStats(frames);
  const values = [...mean, ...std];

  if (values.length !== WINDOW_SCHEMA_DIMS) {
    throw new Error(
      `aggregateWindow: se esperaban ${WINDOW_SCHEMA_DIMS} dims, se obtuvieron ${values.length}`
    );
  }

  const named = {};
  WINDOW_SCHEMA_V1.forEach((name, i) => {
    const v = Number.isFinite(values[i]) ? values[i] : 0;
    values[i] = v;
    named[name] = v;
  });

  return { values, named, frameCount: frames.length };
}

/**
 * Declara si el vector cumple el contrato de 44 dims.
 * Usado por las validaciones: dimension incorrecta = clip invalido, no "se recorta".
 */
export function isValidWindowVector(values) {
  return Array.isArray(values) && values.length === WINDOW_SCHEMA_DIMS && values.every(Number.isFinite);
}

/** Nombres de las 22 features de origen, en orden. Reexportado por comodidad. */
export { FEATURE_SCHEMA_V1, WINDOW_SCHEMA_V1, FEATURE_SCHEMA_SIZE, WINDOW_SCHEMA_DIMS };