/**
 * Contratos congelados del logger.
 *
 * INVARIANTE DE PARIDAD: N_FFT, DEFAULT_SAMPLE_RATE, AUDIBLE_MIN_HZ y FREQ_BANDS estan
 * copiados de `src/frontend/src/pages/cmsc/spectralEngine.js`. Si ese motor cambia, este
 * archivo DEBE cambiar con el (test/parity.test.mjs falla si divergen).
 */

export const LOGGER_VERSION = '1.0.0';
export const MISSION = 'CMSC_DATA_LOGGER_V1';

/** Paridad con spectralEngine.js */
export const N_FFT = 4096;
export const DEFAULT_SAMPLE_RATE = 44100;
export const AUDIBLE_MIN_HZ = 20;
export const SPECTRUM_BUCKETS = 96;

export const FREQ_BANDS = [
  { name: 'Sub 20-250', min: 20, max: 250, key: 'low' },
  { name: 'Medios 250-2k', min: 250, max: 2000, key: 'mid' },
  { name: 'Agudos 2k-20k', min: 2000, max: 20000, key: 'high' }
];

/** Clip contract: metadata/schema.json v1.1.0 */
export const CLIP_CONTRACT = {
  durationS: 3.0,
  durationToleranceS: 0.01,
  sampleRate: 44100,
  channels: 1,
  bitDepth: 16,
  nFft: N_FFT,
  hop: 2048,
  window: 'hann'
};

/** floor de energia para Division-por-cero (evita Infinity/NaN) */
export const EPSILON = 1e-9;

/** dBFS de referencia: normalizacion (dB + 100) / 100 acotada a [0,1] */
export const DBFS_FLOOR = -100;
export const DBFS_CEIL = 0;

/** Rango de normalizacion de peakDb (dBFS de un pico audible util) */
export const PEAK_DB_MIN = -100;
export const PEAK_DB_RANGE = 100;

/** Umbral del piso de silencio para AC-5 (max|x| absoluto). Provisional, ver G-DS-2. */
export const SILENCE_PEAK_FLOOR = 0.001;

/** Proporcion de muestras saturadas maxima para AC-6 (no clipping). */
export const CLIPPING_RATIO_MAX = 0.01;

/** Correlacion del sobre de energia por frame para AC-9 (PROPUESTO, sin calibrar). */
export const NEAR_DUPLICATE_CORRELATION = 0.98;

/**
 * Cuota minima de energia dentro de la banda audible (20 Hz - Nyquist) para AC-7.
 *
 * Se eligio midiendo, no suponiendo: sobre las senales de referencia el selftest da
 * 0,712 para ruido rosa, 0,906 para ruido blanco y 1,000 para tonos. El umbral queda en
 * 0,50 para separar "energia en banda" de "contenido solo fuera de banda" (ultrasonido,
 * zumbido de reloj) con margen amplio, sin volverse tan estricto que rechace senales reales.
 * Ver el comentario de AC-7 en gates.js para la medicion completa.
 */
export const AUDIBLE_SHARE_MIN = 0.5;

/** Offset DC maximo (media de la senal normalizada) para AC-7. */
export const DC_OFFSET_MAX = 0.02;

/** Cohen kappa minimo por clase para G-DS-6. */
export const KAPPA_MIN = 0.7;

/** Objetivo de muestras por clase viva para G-DS-2. */
export const TARGET_PER_CLASS = 150;

/** Tasa maxima de desbalance max/min para G-DS-2. */
export const BALANCE_RATIO_MAX = 1.5;

/** Numeros de frames esperados para un clip de 3,0 s (OBS-04). */
export const FRAMES_PER_CLIP =
  Math.floor((CLIP_CONTRACT.durationS * CLIP_CONTRACT.sampleRate - N_FFT) / CLIP_CONTRACT.hop) + 1;

/**
 * FEATURE_SCHEMA_V1 — 22 features oficiales, orden INMUTABLE.
 * Cambiar el orden o el nombre = acoustic.feat.v2 (contrato congelado).
 */
export const FEATURE_SCHEMA_V1 = Object.freeze([
  'dominantHzNorm',
  'peakDbNorm',
  'centroidNorm',
  'flatness',
  'rms',
  'logEnergy',
  'levelDb',
  'bandPctLow',
  'bandPctMid',
  'bandPctHigh',
  'bandPeakLowNorm',
  'bandPeakMidNorm',
  'bandPeakHighNorm',
  'bandPeakDbLow',
  'bandPeakDbMid',
  'bandPeakDbHigh',
  'spectralBandwidthNorm',
  'spectralRolloffNorm',
  'zeroCrossingRate',
  'crestFactor',
  'spectralFlux',
  'profileEntropy'
]);

/**
 * WINDOW_SCHEMA_V1 — 44 dims: mean de las 22 + std de las 22.
 * APROBADO 2026-10-04 (mision CMSC_DATA_LOGGER_V1, decision D-1).
 *
 * CONGELADO. No se modifica. Se conserva para poder reproducir features v1.
 */
export const WINDOW_SCHEMA_V1 = Object.freeze([
  ...FEATURE_SCHEMA_V1.map((n) => `mean_${n}`),
  ...FEATURE_SCHEMA_V1.map((n) => `std_${n}`)
]);

/**
 * FEATURE_SCHEMA_V2 — revision de esquema APROBADA 2026-10-05.
 *
 * Decision de gobernanza: OPCION B. `acoustic.feat.v1` queda CONGELADO y no recibe
 * modificaciones retroactivas. v2 existe porque v1 tiene un defecto CIENTIFICO en la
 * feature 21 `profileEntropy`, no por un cambio de criterio estetico.
 *
 * Que cambia respecto a v1 (y SOLO esto):
 *
 *   feature 21 `profileEntropy`
 *     v1 (defectuoso, congelado): acumulas `db[i] * db[i]`.
 *         Los dB son NEGATIVOS, de modo que al elevarlos al cuadrado la banda mas
 *         silenciosa pesa mas que la banda dominante. Con el suelo del epsilon
 *         (1e-9 -> -180 dB -> 32.400 frente a 400 de una banda a -20 dB) UNA sola
 *         banda muda aporta el 98,8% de la "potencia". Medido: silencio digital
 *         1,0000 · tono puro 1 kHz 0,9893 · ruido blanco 0,9979 · ruido rosa 0,9218.
 *         El ranking queda invertido respecto a la planicidad espectral.
 *     v2 (corregido): entropia de Shannon sobre el espectro de POTENCIA
 *         (`magnitudes[i]^2`), que es la definicion estandar de entropia espectral.
 *         Medido: silencio 0,0000 · tono 0,0000 · ruido blanco 0,9901 · ruido rosa 0,5143.
 *
 *   feature 21 `profileEntropy` — cobertura de bandas
 *     v1: `per = floor(HALF/96) = 21` -> leia 96x21 = 2016 de 2048 bins. Los 32 bins
 *         mas altos (21,71 kHz .. Nyquist) NUNCA se leian.
 *     v2: bordes de banda fraccionarios -> los 2048 bins se leen, completos.
 *
 * Que NO cambia: los nombres de las 22 features, su ORDEN (contrato inmutable), el
 * numero de features (22) y el numero de dims (44). Por eso la unica dimension del
 * vector de 44 que se altera es la 43 y la 44 (`mean_profileEntropy`,
 * `std_profileEntropy`); las dims 1..42 quedan bit a bit identicas.
 */
export const FEATURE_SCHEMA_V2 = Object.freeze([
  ...FEATURE_SCHEMA_V1
]);

/**
 * WINDOW_SCHEMA_V2 — 44 dims, ligadura explicita a acoustic.feat.v2.
 *
 * La OPERACION de agregacion (mean + std poblacional sobre los frames) es la misma que
 * la aprobada en D-1 y no se toca. Lo que cambia es a que esquema de features se aplica,
 * asi que el vector resultante es distinto y necesita su propio sello: una fila que
 * declara `window.v1` debe seguir significando feat.v1.
 */
export const WINDOW_SCHEMA_V2 = Object.freeze([
  ...FEATURE_SCHEMA_V2.map((n) => `mean_${n}`),
  ...FEATURE_SCHEMA_V2.map((n) => `std_${n}`)
]);

/** Identificadores de esquema. La version viaja en cada fila del dataset. */
export const FEATURE_SCHEMA_IDS = Object.freeze({
  V1: 'acoustic.feat.v1',
  V2: 'acoustic.feat.v2'
});

export const WINDOW_SCHEMA_IDS = Object.freeze({
  V1: 'acoustic.feat.window.v1',
  V2: 'acoustic.feat.window.v2'
});

/**
 * Version por defecto para nuevas ingestas: v2.
 * v1 NO se usa por defecto porque su feature 21 es cientificamente incorrecta.
 * Sigue disponible de forma explicita para reproducir artefactos historicos.
 */
export const DEFAULT_FEATURE_SCHEMA_ID = FEATURE_SCHEMA_IDS.V2;
export const DEFAULT_WINDOW_SCHEMA_ID = WINDOW_SCHEMA_IDS.V2;

const FEATURE_SCHEMA_ID_SET = new Set(Object.values(FEATURE_SCHEMA_IDS));
const WINDOW_SCHEMA_ID_SET = new Set(Object.values(WINDOW_SCHEMA_IDS));

export function isKnownFeatureSchema(id) {
  return FEATURE_SCHEMA_ID_SET.has(id);
}

export function isKnownWindowSchema(id) {
  return WINDOW_SCHEMA_ID_SET.has(id);
}

/** feature schema id -> ventana ligadura y array de nombres de 44. */
export function windowSchemaFor(featureSchemaId) {
  if (featureSchemaId === FEATURE_SCHEMA_IDS.V1) {
    return { id: WINDOW_SCHEMA_IDS.V1, names: WINDOW_SCHEMA_V1 };
  }
  if (featureSchemaId === FEATURE_SCHEMA_IDS.V2) {
    return { id: WINDOW_SCHEMA_IDS.V2, names: WINDOW_SCHEMA_V2 };
  }
  throw new Error(`windowSchemaFor: feature schema desconocido "${featureSchemaId}"`);
}

/** Acepta "v1"/"v2" o el identificador completo. */
export function resolveFeatureSchemaId(value) {
  if (value === undefined || value === null || value === '') return DEFAULT_FEATURE_SCHEMA_ID;
  if (value === 'v1' || value === FEATURE_SCHEMA_IDS.V1) return FEATURE_SCHEMA_IDS.V1;
  if (value === 'v2' || value === FEATURE_SCHEMA_IDS.V2) return FEATURE_SCHEMA_IDS.V2;
  throw new Error(`resolveFeatureSchemaId: "${value}" no es un feature schema conocido`);
}

/** Sufijo corto para nombres de fichero: acoustic_features_v2.csv */
export function schemaTag(featureSchemaId) {
  if (featureSchemaId === FEATURE_SCHEMA_IDS.V1) return 'v1';
  if (featureSchemaId === FEATURE_SCHEMA_IDS.V2) return 'v2';
  throw new Error(`schemaTag: feature schema desconocido "${featureSchemaId}"`);
}

export const FEATURE_SCHEMA_SIZE = FEATURE_SCHEMA_V1.length;
export const WINDOW_SCHEMA_DIMS = WINDOW_SCHEMA_V1.length;

/** Cabecera del CSV de features: contexto + 44 columnas. */
export const FEATURES_CSV_HEADER = Object.freeze([
  'sample_id',
  'feature_schema',
  'window_schema',
  'frame_count',
  ...WINDOW_SCHEMA_V2
]);

/** Las 8 clases vivas (objetivo de captura). */
export const LIVE_CLASSES = Object.freeze([
  'silencio',
  'viento',
  'lluvia',
  'agua',
  'insectos',
  'ave',
  'voz',
  'motor'
]);

/** Bucket OOD: nunca se captura a demanda. */
export const OOD_CLASS = 'ruido_desconocido';

export const ALL_CLASSES = Object.freeze([...LIVE_CLASSES, OOD_CLASS]);

export const DATASET_STATE_SEQUENCE = Object.freeze([
  'PREPARADO_VACIO',
  'CAPTADO_INICIAL',
  'CURADO',
  'SPLITEADO',
  'PUBLICADO'
]);