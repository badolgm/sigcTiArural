/**
 * Generadores de senal sintetica.
 *
 * EXISTEN PARA UNA SOLA COSA: verificar que el pipeline (WAV -> features -> 44 dims ->
 * gates) funciona de punta a punta sin depender de un microfono ni de una captura real.
 *
 * NO son datos del dataset. Un WAV sintetico NUNCA entra en raw/: el comando `ingest`
 * no tiene forma de distinguirlos, asi que el selftest escribe en un directorio temporal
 * y lo borra. Si alguna vez estos archivos se quisieran promover a muestra real, seria
 * falsificar evidencia, que es justo lo que este sistema existe para impedir.
 */

import { CLIP_CONTRACT } from './constants.js';

/** Ruido blanco con semilla fija: reproducible, que es lo que hace falta para testear. */
export function whiteNoise(length, seed = 42) {
  const out = new Float64Array(length);
  let s = seed >>> 0;
  for (let i = 0; i < length; i++) {
    // LCG determinista: sin Math.random, para que el selftest sea reproducible.
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out[i] = (s / 0xffffffff) * 2 - 1;
  }
  return out;
}

/** Mezcla de tonos: sirve para comprobar pico dominante y centroid. */
export function toneMix(length, sampleRate, tones) {
  const out = new Float64Array(length);
  for (let i = 0; i < length; i++) {
    let v = 0;
    for (const t of tones) {
      v += t.amp * Math.sin((2 * Math.PI * t.hz * i) / sampleRate + (t.phase ?? 0));
    }
    out[i] = v;
  }
  return normalize(out);
}

/** Ruido rosa (1/f) aproximado: energia repartida como en un entorno natural. */
export function pinkNoise(length, seed = 7) {
  const out = new Float64Array(length);
  let s = seed >>> 0;
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const white = (s / 0xffffffff) * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57555 * b2 + white * 1.0526913;
    out[i] = (b0 + b1 + b2 + white * 0.1848) * 0.16;
  }
  return out;
}

/** Silencio con una minuscule densa: el caso que AC-5 debe RECHAZAR. */
export function nearSilence(length, seed = 3) {
  const noise = whiteNoise(length, seed);
  const out = new Float64Array(length);
  for (let i = 0; i < length; i++) out[i] = noise[i] * 1e-5;
  return out;
}

/** Clip saturado: el caso que AC-6 debe RECHAZAR. */
export function clipped(length, sampleRate) {
  const tone = toneMix(length, sampleRate, [{ hz: 440, amp: 1 }]);
  const out = new Float64Array(length);
  for (let i = 0; i < length; i++) out[i] = Math.max(-1, Math.min(1, tone[i] * 3));
  return out;
}

export function normalize(samples, targetPeak = 0.8) {
  let peak = 0;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  if (peak === 0) return samples;
  const k = targetPeak / peak;
  const out = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * k;
  return out;
}

/** Longitud exacta de un clip del contract. */
export function clipLength(sampleRate = CLIP_CONTRACT.sampleRate) {
  return Math.round(CLIP_CONTRACT.durationS * sampleRate);
}

/**
 * Casos de selftest. Cada uno declara lo que el pipeline DEBE hacer con el.
 * `esperado` es el veredicto de ingesta que exige la verdad, no el deseado.
 */
export const SELFTEST_CASES = [
  {
    id: 'silencio_cerca',
    nombre: 'casi-silencio (debe RECHAZAR por AC-5)',
    make: (n) => nearSilence(n),
    esperado: 'quarantine',
    valida: ['AC-5']
  },
  {
    id: 'tono_1k',
    nombre: 'tono puro 1 kHz (debe ACEPTAR, pico dominante ~1000 Hz)',
    make: (n, sr) => toneMix(n, sr, [{ hz: 1000, amp: 1 }]),
    esperado: 'accepted',
    valida: ['dominante']
  },
  {
    id: 'mezcla_500_3k',
    nombre: 'mezcla 500 Hz + 3 kHz (debe ACEPTAR, energia en medios/agudos)',
    make: (n, sr) => toneMix(n, sr, [{ hz: 500, amp: 0.5 }, { hz: 3000, amp: 0.5 }]),
    esperado: 'accepted',
    valida: ['bandas']
  },
  {
    id: 'ruido_blanco',
    nombre: 'ruido blanco (debe ACEPTAR, flatness alta)',
    make: (n) => normalize(whiteNoise(n), 0.5),
    esperado: 'accepted',
    valida: ['flatness']
  },
  {
    id: 'ruido_rosa',
    nombre: 'ruido rosa (debe ACEPTAR, mas energia en graves)',
    make: (n) => normalize(pinkNoise(n), 0.5),
    esperado: 'accepted',
    valida: ['bandas']
  },
  {
    id: 'saturado',
    nombre: 'tono saturado (debe RECHAZAR por AC-6)',
    make: (n, sr) => clipped(n, sr),
    esperado: 'quarantine',
    valida: ['AC-6']
  },
  {
    id: 'tono_60hz',
    nombre: 'tono 60 Hz (debe ACEPTAR, pico dominante en banda baja)',
    make: (n, sr) => toneMix(n, sr, [{ hz: 60, amp: 1 }]),
    esperado: 'accepted',
    valida: ['bandas']
  }
];