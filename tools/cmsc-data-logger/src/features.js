/**
 * Extraccion de las 22 features oficiales por frame.
 *
 * Esquemas soportados: `acoustic.feat.v1` (CONGELADO) y `acoustic.feat.v2` (revision
 * 2026-10-05). Ambos tienen los mismos 22 nombres en el mismo orden; v2 corrige la
 * feature 21. Ver constants.js FEATURE_SCHEMA_V2 para el detalle del cambio.
 *
 * Contrato: docs/AI_ACOUSTIC_ARCHITECTURE_V1.md §2.2.
 * Invariantes (mismo §2.3):
 *   1. Puro y determinista: mismo input -> mismo output. Sin estado global; el frame
 *      anterior entra por `ctx` (necesario para spectralFlux).
 *   2. Sin dependencias externas: solo la FFT de ./fft.js.
 *   3. Finite-safe: todo NaN/Infinity se sanea antes de salir.
 *   4. Barato: O(2048) sobre el espectro ya calculado.
 */

import {
  N_FFT, FREQ_BANDS, EPSILON, FEATURE_SCHEMA_V1, PEAK_DB_MIN, PEAK_DB_RANGE,
  DBFS_FLOOR, DBFS_CEIL, AUDIBLE_MIN_HZ,
  FEATURE_SCHEMA_IDS, DEFAULT_FEATURE_SCHEMA_ID, isKnownFeatureSchema
} from './constants.js';
import { fftRadix2, windowed } from './fft.js';

const HALF = N_FFT >> 1;

/** Bandas del perfil para `profileEntropy`. 96 = SPECTRUM_BUCKETS del instrumento. */
export const PROFILE_ENTROPY_BUCKETS = 96;

/** Sanea a 0 cualquier NaN/Infinity. Invariante 3. */
export function finite(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

/** Acota a [0,1]. */
export function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/** Normaliza un dB a [0,1] con un piso y techo declarados. */
export function dbToUnit(db) {
  return clamp01((finite(db, DBFS_FLOOR) - DBFS_FLOOR) / (DBFS_CEIL - DBFS_FLOOR));
}

/** Indices de bin para una banda en Hz. Mismo criterio que `binsForHz` del frontend. */
export function binsForHz(minHz, maxHz, sampleRate) {
  const binHertz = sampleRate / N_FFT;
  return {
    minBin: Math.max(0, Math.round(minHz / binHertz)),
    maxBin: Math.min(HALF, Math.round(maxHz / binHertz))
  };
}

/**
 * Analiza un frame en el dominio del tiempo.
 *
 * @param {Float64Array|Float32Array} samples serie completa
 * @param {number} sampleRate
 * @param {number} offset indice del inicio del frame
 * @returns {{magnitudes: Float64Array, db: Float64Array, time: Float64Array, ...}}
 */
export function analyzeFrame(samples, sampleRate, offset = 0) {
  const { re, im, n } = windowed(samples, offset);
  fftRadix2(re, im);

  const binHertz = sampleRate / N_FFT;
  // Float32Array, igual que spectralEngine.js:80-81. No es un detalle: el redondeo a
  // float32 de cada bin se acumula al sumar 2048 magnitudes y desplaza el centroid ~6e-3 Hz.
  // Con Float64 la paridad solo se lograba "aproximada"; asi la paridad es la misma operacion.
  const magnitudes = new Float32Array(HALF);
  const db = new Float32Array(HALF);

  let maxDb = -Infinity;
  let maxIdx = 0;
  let sumAmp = 0;
  let sumAmpHz = 0;
  let sumSq = 0;
  let sumLogMag = 0;

  for (let i = 0; i < HALF; i++) {
    const mag = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    magnitudes[i] = mag;
    const level = 20 * Math.log10(mag + EPSILON);
    db[i] = level;
    if (level > maxDb) {
      maxDb = level;
      maxIdx = i;
    }
    sumAmp += mag;
    sumAmpHz += mag * i * binHertz;
    sumSq += mag * mag;
    sumLogMag += Math.log(mag + EPSILON);
  }

  const meanMag = sumAmp / HALF || EPSILON;
  const flatness = Math.exp(sumLogMag / HALF) / meanMag;

  // Cuota de energia dentro de la banda audible (20 Hz - Nyquist).
  // NO se usa "el pico dominante cae en banda audible" como criterio de validez: medido sobre
  // senales de referencia, el maximo espectral del ruido rosa cae en 15,7 Hz (correcto para
  // un spectrum 1/f) y el del ruido blanco en ~10,6 kHz, que es donde la fluctuacion
  // aleatoria happenedo mayor. Ambos son audio legitimo y un criterio de pico los rechazaria.
  const aud = binsForHz(AUDIBLE_MIN_HZ, sampleRate / 2, sampleRate);
  let audibleEnergy = 0;
  for (let i = aud.minBin; i < aud.maxBin; i++) audibleEnergy += magnitudes[i] * magnitudes[i];

  const bands = FREQ_BANDS.map((band) => {
    const { minBin, maxBin } = binsForHz(band.min, band.max, sampleRate);
    let energy = 0;
    let peak = -Infinity;
    let peakBin = minBin;
    for (let i = minBin; i < maxBin; i++) {
      energy += magnitudes[i] * magnitudes[i];
      if (db[i] > peak) {
        peak = db[i];
        peakBin = i;
      }
    }
    return {
      key: band.key,
      min: band.min,
      max: band.max,
      energy,
      pct: sumSq > 0 ? energy / sumSq : 0,
      peakHz: peakBin * binHertz,
      peakDb: peak === -Infinity ? 0 : peak
    };
  });

  return {
    n,
    sampleRate,
    binHertz,
    magnitudes,
    db,
    dominantFrequency: maxIdx * binHertz,
    peakDb: maxDb,
    spectralCentroid: sumAmpHz / (sumAmp || 1),
    spectralFlatness: flatness,
    totalEnergy: sumSq,
    audibleEnergy,
    audibleEnergyShare: sumSq > 0 ? audibleEnergy / sumSq : 0,
    audibleBins: { min: aud.minBin, max: aud.maxBin },
    rms: Math.sqrt(sumSq / HALF),
    bands,
    offset
  };
}

/** Nivel global del frame en dBFS, calculado sobre el dominio del tiempo (no del espectro). */
export function frameLevelDb(samples, sampleRate, offset = 0) {
  const n = Math.min(samples.length - offset, N_FFT);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const v = samples[offset + i] || 0;
    sum += v * v;
  }
  return 20 * Math.log10(Math.sqrt(sum / n) || EPSILON);
}

/** Ancho espectral: sqrt( Σ ((f - centroid)^2 * mag) / Σ mag ). Derivada (feature 16). */
function spectralBandwidth(magnitudes, binHertz, centroid) {
  let num = 0;
  let den = 0;
  for (let i = 0; i < HALF; i++) {
    const d = i * binHertz - centroid;
    num += d * d * magnitudes[i];
    den += magnitudes[i];
  }
  if (den <= 0) return 0;
  return Math.sqrt(num / den);
}

/** Rolloff 85%: bin donde la energia acumulada supera el 85% del total. Derivada (feature 17). */
function spectralRolloff(magnitudes, binHertz) {
  let total = 0;
  for (let i = 0; i < HALF; i++) total += magnitudes[i];
  if (total <= 0) return 0;
  const target = total * 0.85;
  let acc = 0;
  for (let i = 0; i < HALF; i++) {
    acc += magnitudes[i];
    if (acc >= target) return i * binHertz;
  }
  return (HALF - 1) * binHertz;
}

/** Tasa de cambios de signo sobre el dominio del tiempo. Derivada (feature 18). */
function zeroCrossingRate(samples, offset, n) {
  if (n < 2) return 0;
  let crossings = 0;
  let prev = samples[offset] || 0;
  for (let i = 1; i < n; i++) {
    const cur = samples[offset + i] || 0;
    if ((cur >= 0) !== (prev >= 0)) crossings++;
    prev = cur;
  }
  return crossings / (n - 1);
}

/**
 * crestFactor = peak(|x|) / rms, ambos en el DOMINIO DEL TIEMPO.
 *
 * Decision declarada: el `rms` de la feature 4 es el rms ESPECTRAL que devuelve
 * `spectralEngine.analyzeFrame` (sqrt(sum(mag^2)/HALF)), porque la tabla de la
 * arquitectura lo define como `Origen: rms` (paridad con S30). El crest factor es
 * `derivada` y usa la definicion clasica sobre `timeDomain`: pico temporal / rms temporal.
 * Son dos magnitudes distintas a proposito; mezclarlas seria un error silencioso.
 */
function crestFactor(samples, offset, n) {
  let peak = 0;
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    const v = samples[offset + i] || 0;
    const a = Math.abs(v);
    if (a > peak) peak = a;
    sumSq += v * v;
  }
  const timeRms = Math.sqrt(sumSq / (n || 1));
  if (timeRms <= 0) return 0;
  return peak / timeRms;
}

/**
 * Entropia normalizada del perfil espectral en dB. Derivada (feature 21).
 *
 * CONGELADO — `acoustic.feat.v1`. NO MODIFICAR.
 *
 * Se conserva exactamente como se escribio, con su defecto, para que cualquier artefacto
 * calculado con v1 siga siendo reproducible. La correccion vive en `profileEntropyV2`.
 *
 * Defecto documentado (medido, no supuesto): se acumulan `db[i] * db[i]` y los dB son
 * NEGATIVOS, asi que al elevarlos al cuadrado la banda mas silenciosa pesa mas que la
 * dominante. Con el suelo del epsilon (mag=0 -> 20*log10(1e-9) = -180 dB -> 32.400)
 * frente a una banda real a -20 dB (-> 400), UNA sola banda muda aporta el 98,8% de la
 * potencia total. Medido: silencio 1,0000 · tono 1 kHz 0,9893 · blanco 0,9979 · rosa 0,9218.
 *
 * Segundo defecto: `per = floor(HALF/96) = 21` cubre 96x21 = 2016 de 2048 bins; los 32
 * bins mas altos (21,71 kHz .. Nyquist) nunca se leen.
 */
function profileEntropyV1(db) {
  // Energia agrupada en 96 bandas, la misma resolucion de perfil que ve el usuario en el
  // instrumento (SPECTRUM_BUCKETS), pero en potencia y no en uint8.
  const buckets = 96;
  const per = Math.max(1, Math.floor(HALF / buckets));
  const power = new Float64Array(buckets);
  let total = 0;
  for (let b = 0; b < buckets; b++) {
    const start = b * per;
    const end = Math.min(HALF, start + per);
    let acc = 0;
    for (let i = start; i < end; i++) acc += db[i] * db[i];
    power[b] = acc;
    total += acc;
  }
  if (total <= 0) return 0;
  let entropy = 0;
  for (let b = 0; b < buckets; b++) {
    if (power[b] <= 0) continue;
    const p = power[b] / total;
    entropy -= p * Math.log(p);
  }
  return clamp01(entropy / Math.log(buckets));
}

/**
 * Entropia espectral normalizada. Derivada (feature 21) de `acoustic.feat.v2`.
 *
 * Dos correcciones respecto a v1, ambas dentro de la MISMA revision de esquema:
 *
 * 1. Se calcula sobre el espectro de POTENCIA (`magnitudes[i]^2`), no sobre dB al
 *    cuadrado. Es la definicion estandar de entropia espectral: una banda contributes
 *    proporcional a la energia que realmente transporta. Al usar potencias, el suelo
 *    del epsilon deja de importar y el silencio digital da exactamente 0 en vez de 1.
 *
 * 2. Los bordes de banda son FRACCIONARIOS, de modo que los 2048 bins se leen completos.
 *    Con `per` entero se perdian los 32 bins mas altos (21,71 kHz .. Nyquist). Aqui
 *    `HALF/96 = 21.333`: 64 bandas toman 21 bins y 32 toman 22, sumando exactamente 2048.
 *
 * Rango: [0,1]. 0 = toda la energia en una banda (tono puro). 1 = energia repartida
 * (ruido blanco). Medido: silencio 0,0000 · tono 1 kHz 0,0000 · blanco 0,9901 · rosa 0,5143.
 *
 * NO toca `analyzeFrame`: el epsilon 1e-9 vive ahi y `analyzeFrame` esta bloqueado por
 * paridad con S30. Este cambio es local a la feature y no altera la paridad.
 */
function profileEntropyV2(magnitudes) {
  const buckets = PROFILE_ENTROPY_BUCKETS;
  const power = new Float64Array(buckets);
  let total = 0;
  for (let b = 0; b < buckets; b++) {
    const start = Math.floor((b * HALF) / buckets);
    const end = Math.floor(((b + 1) * HALF) / buckets);
    let acc = 0;
    for (let i = start; i < end; i++) acc += magnitudes[i] * magnitudes[i];
    power[b] = acc;
    total += acc;
  }
  // Silencio digital: todas las potencias 0. Se define 0 (no hay energia que repartir),
  // que es lo coherente con "entropia de una distribucion degenerada".
  if (total <= 0) return 0;
  let entropy = 0;
  for (let b = 0; b < buckets; b++) {
    if (power[b] <= 0) continue;
    const p = power[b] / total;
    entropy -= p * Math.log(p);
  }
  return clamp01(entropy / Math.log(buckets));
}

/** Cobertura de bins que lee cada implementacion. Usado por las pruebas de contrato. */
export function profileEntropyBinCoverage(variant) {
  const buckets = PROFILE_ENTROPY_BUCKETS;
  let read = 0;
  if (variant === FEATURE_SCHEMA_IDS.V1) {
    const per = Math.max(1, Math.floor(HALF / buckets));
    read = Math.min(HALF, buckets * per);
  } else {
    read = HALF;
  }
  return { buckets, half: HALF, read, truncados: HALF - read };
}

/**
 * Calcula las 22 features de un frame.
 *
 * @param {object} frame resultado de analyzeFrame
 * @param {Float64Array|Float32Array} samples serie completa
 * @param {Float64Array|null} prevDb espectro dB del frame anterior (para spectralFlux)
 * @param {string} schemaId `acoustic.feat.v1` (congelado) o `acoustic.feat.v2`
 * @returns {number[]} vector de 22 valores, en el orden de FEATURE_SCHEMA_V1/V2
 */
export function extractFeatures(frame, samples, prevDb = null, schemaId = DEFAULT_FEATURE_SCHEMA_ID) {
  if (!isKnownFeatureSchema(schemaId)) {
    throw new Error(`extractFeatures: feature schema desconocido "${schemaId}"`);
  }
  const { binHertz, dominantFrequency, peakDb, spectralCentroid, spectralFlatness, totalEnergy, rms, bands, db } = frame;
  const offset = frame.offset || 0;
  const n = frame.n;

  const nyquist = frame.sampleRate / 2;

  // spectralFlux: diferencia L2 entre el espectro dB actual y el anterior.
  let flux = 0;
  if (prevDb) {
    let acc = 0;
    for (let i = 0; i < HALF; i++) {
      const d = db[i] - prevDb[i];
      acc += d * d;
    }
    flux = Math.sqrt(acc / HALF);
  }

  const levelDb = frameLevelDb(samples, frame.sampleRate, offset);

  const values = [
    // 0 dominantHzNorm
    clamp01(dominantFrequency / nyquist),
    // 1 peakDbNorm
    clamp01((finite(peakDb, PEAK_DB_MIN) - PEAK_DB_MIN) / PEAK_DB_RANGE),
    // 2 centroidNorm
    clamp01(spectralCentroid / nyquist),
    // 3 flatness
    clamp01(spectralFlatness),
    // 4 rms (espectral: paridad con spectralEngine.analyzeFrame().rms)
    finite(rms, 0),
    // 5 logEnergy
    Math.log10(Math.max(0, totalEnergy) + EPSILON),
    // 6 levelDb
    dbToUnit(levelDb),
    // 7..9 bandPctLow/Mid/High
    clamp01(bands[0].pct),
    clamp01(bands[1].pct),
    clamp01(bands[2].pct),
    // 10..12 bandPeak*Norm
    clamp01(bands[0].peakHz / nyquist),
    clamp01(bands[1].peakHz / nyquist),
    clamp01(bands[2].peakHz / nyquist),
    // 13..15 bandPeakDb*
    dbToUnit(bands[0].peakDb),
    dbToUnit(bands[1].peakDb),
    dbToUnit(bands[2].peakDb),
    // 16 spectralBandwidthNorm
    clamp01(spectralBandwidth(frame.magnitudes, binHertz, spectralCentroid) / nyquist),
    // 17 spectralRolloffNorm
    clamp01(spectralRolloff(frame.magnitudes, binHertz) / nyquist),
    // 18 zeroCrossingRate
    clamp01(zeroCrossingRate(samples, offset, n)),
    // 19 crestFactor (pico temporal / rms temporal)
    finite(crestFactor(samples, offset, n), 0),
    // 20 spectralFlux
    finite(flux, 0),
    // 21 profileEntropy — UNICA feature que difiere entre v1 y v2.
    schemaId === FEATURE_SCHEMA_IDS.V1
      ? profileEntropyV1(db)
      : profileEntropyV2(frame.magnitudes)
  ];

  // Invariante 3: finite-safe. Ningun NaN/Infinity sale de aqui.
  return values.map((v) => (Number.isFinite(v) ? v : 0));
}

/**
 * Recorre todos los frames de un clip y devuelve la matriz de features por frame.
 *
 * `nFft` se valida en vez de aceptarse en silencio: `analyzeFrame` trabaja siempre con
 * el `N_FFT` global (esta bloqueado por paridad con S30), asi que aceptar otro `nFft`
 * daria un conteo de frames de una taille y un espectro de otra, en silencio.
 *
 * @returns {{frames: number[][], frameCount: number, perFrameDb: Float64Array[],
 *            audibleEnergyShare: number, featureSchema: string}}
 */
export function extractClipFeatures(
  samples,
  sampleRate,
  hop,
  nFft = N_FFT,
  schemaId = DEFAULT_FEATURE_SCHEMA_ID
) {
  if (nFft !== N_FFT) {
    throw new Error(
      `extractClipFeatures: nFft=${nFft} no soportado; analyzeFrame usa el N_FFT global (${N_FFT}) por paridad con S30`
    );
  }
  if (!isKnownFeatureSchema(schemaId)) {
    throw new Error(`extractClipFeatures: feature schema desconocido "${schemaId}"`);
  }
  const total = samples.length;
  const frameCount = total < nFft ? 0 : Math.floor((total - nFft) / hop) + 1;
  const frames = [];
  const perFrameDb = [];
  let prevDb = null;
  let shareAcc = 0;
  let shareN = 0;

  for (let k = 0; k < frameCount; k++) {
    const offset = k * hop;
    const frame = analyzeFrame(samples, sampleRate, offset);
    frames.push(extractFeatures(frame, samples, prevDb, schemaId));
    perFrameDb.push(frame.db);
    if (Number.isFinite(frame.audibleEnergyShare)) {
      shareAcc += frame.audibleEnergyShare;
      shareN++;
    }
    prevDb = frame.db;
  }

  return {
    frames,
    frameCount,
    perFrameDb,
    audibleEnergyShare: shareN > 0 ? shareAcc / shareN : null,
    featureSchema: schemaId,
    dominantHzMean: shareN > 0
      ? frames.reduce((a, f) => a + (Number.isFinite(f[0]) ? f[0] : 0), 0) / frames.length * (sampleRate / 2)
      : null
  };
}