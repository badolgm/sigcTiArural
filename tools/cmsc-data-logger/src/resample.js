/**
 * Remuestreo DECLARADO.
 *
 * Honestidad de estado (OBS-06): `getUserMedia` entrega habitualmente 48000 Hz. Convertir a
 * 44100 Hz es un transform real y debe quedar registrado en `capture_source_rate` +
 * `resample_method`. Este modulo no "arregla" la tasa en silencio: devuelve la tasa nativa
 * y el metodo usado, y el llamador los escribe en metadata.csv.
 */

import { CLIP_CONTRACT } from './constants.js';

export const RESAMPLE_METHODS = Object.freeze(['none', 'linear', 'cubic']);

/** Longitud esperada tras remuestrear a la tasa objetivo. */
export function targetLength(numSamples, fromRate, toRate) {
  return Math.round((numSamples * toRate) / fromRate);
}

/** Interpolacion lineal. */
function resampleLinear(samples, fromRate, toRate) {
  const outLength = targetLength(samples.length, fromRate, toRate);
  const out = new Float64Array(outLength);
  const ratio = fromRate / toRate;
  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const frac = pos - i0;
    const a = samples[i0] ?? 0;
    const b = samples[i0 + 1] ?? a;
    out[i] = a + (b - a) * frac;
  }
  return out;
}

/** Interpolacion cubica Catmull-Rom. */
function resampleCubic(samples, fromRate, toRate) {
  const outLength = targetLength(samples.length, fromRate, toRate);
  const out = new Float64Array(outLength);
  const ratio = fromRate / toRate;
  const n = samples.length;

  const at = (i) => {
    if (i < 0) return samples[0] ?? 0;
    if (i >= n) return samples[n - 1] ?? 0;
    return samples[i];
  };

  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const i1 = Math.floor(pos);
    const t = pos - i1;
    const p0 = at(i1 - 1);
    const p1 = at(i1);
    const p2 = at(i1 + 1);
    const p3 = at(i1 + 2);
    const a = 2 * p1;
    const b = p2 - p0;
    const c = 2 * p0 - 5 * p1 + 4 * p2 - p3;
    const d = -p0 + 3 * p1 - 3 * p2 + p3;
    out[i] = 0.5 * (a + b * t + c * t * t + d * t * t * t);
  }
  return out;
}

/**
 * Remuestrea a la tasa objetivo del clip contract.
 *
 * @param {Float64Array} samples
 * @param {number} sourceRate tasa NATIVA del dispositivo
 * @param {'linear'|'cubic'} method
 * @returns {{samples: Float64Array, sourceRate: number, targetRate: number, method: string, resampled: boolean}}
 */
export function resample(samples, sourceRate, method = 'cubic') {
  const targetRate = CLIP_CONTRACT.sampleRate;

  if (sourceRate === targetRate) {
    // El metodo sigue siendo obligatorio en metadata: 'none' explica que no hubo remuestreo.
    return { samples, sourceRate, targetRate, method: 'none', resampled: false };
  }

  if (method === 'linear') {
    return { samples: resampleLinear(samples, sourceRate, targetRate), sourceRate, targetRate, method, resampled: true };
  }
  if (method === 'cubic') {
    return { samples: resampleCubic(samples, sourceRate, targetRate), sourceRate, targetRate, method, resampled: true };
  }

  throw new Error(
    `resample: metodo no soportado '${method}'. En Node solo hay 'linear' y 'cubic'; ` +
      `'soxr_hq' y 'browser_audiocontext' los produce la captura web.`
  );
}

/**
 * Recorta o rellena el clip a la duracion exacta del contract.
 *
 * El recorte es honesto (no inventa audio): si el clip es largo se corta; si es corto se
 * rellena con ceros y la muestra queda marcada, porque un clip relleno no es una captura real.
 *
 * @returns {{samples: Float64Array, trimmed: boolean, padded: boolean, wasExact: boolean}}
 */
export function fitDuration(samples, sampleRate = CLIP_CONTRACT.sampleRate) {
  const expected = Math.round(CLIP_CONTRACT.durationS * sampleRate);
  if (samples.length === expected) {
    return { samples, trimmed: false, padded: false, wasExact: true };
  }
  if (samples.length > expected) {
    return { samples: samples.slice(0, expected), trimmed: true, padded: false, wasExact: false };
  }
  const out = new Float64Array(expected);
  out.set(samples, 0);
  return { samples: out, trimmed: false, padded: true, wasExact: false };
}