/**
 * RULES-V0 — clasificador acustico determinista por umbrales.
 *
 * Mision: ACOUSTIC_E4_RULES_V0_IMPLEMENTATION.
 * Base: Documentacion/Arquitectura/CMSC_AI_ACOUSTIC_RULES_V0_DESIGN.md
 * Entrada: vector de 44 dims (`acoustic.feat.window.v2` = mean_<f> + std_<f> de las 22
 *          features en el orden inmutable de FEATURE_SCHEMA_V2).
 *
 * DISCIPLINA DE HONESTIDAD (heredada de AI_ACOUSTIC_ARCHITECTURE_V1.md §4.2):
 *   - rules-v0 es heuristica determinista, NO aprendizaje:
 *       method:'rules-v0' y estado visible SIM, NUNCA REAL-LOCAL.
 *   - `confidence` es un SCORE de regla (0..1), NO una probabilidad.
 *   - Ninguna clase se fabrica: lo que no dispara o duda cae en RUIDO DESCONOCIDO (OOD).
 *
 * PROHIBIDO en esta mision: entrenar, modelos ML, tocar M1/M2/IA agricola/Dataset
 * Governance/S81/S82/endpoints. Solo implementacion aislada (sin integracion visual).
 *
 * Puridad: mismo vector -> misma salida. Sin estado. Sin IO.
 */

import {
  FEATURE_SCHEMA_V1,
  WINDOW_SCHEMA_V1,
  WINDOW_SCHEMA_DIMS,
  FEATURE_SCHEMA_SIZE
} from './constants.js';

export const RULES_V0_VERSION = 'acoustic-rules-v0';
export const RULES_V0_METHOD = 'rules-v0';

/** Etiquetas permitidas en el contrato (class_id de labels.csv, en mayusculas). */
export const RULES_V0_LABELS = Object.freeze([
  'SILENCIO',
  'VIENTO',
  'LLUVIA',
  'AGUA',
  'INSECTOS',
  'AVE',
  'VOZ',
  'MOTOR',
  'RUIDO DESCONOCIDO'
]);

/** Margen de decision minimo entre la 1a y la 2a mejor regla (diseno §4). */
export const DECISION_MARGIN_MIN = 0.1;

/** Mapa indice de columna de la ventana 44 por codigo legible (mean_x / std_x). */
const COL = {};
WINDOW_SCHEMA_V1.forEach((name, i) => {
  COL[name] = i;
});

const clamp01 = (v) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);

/**
 * Membresia de una condicion comparativa, coherente con el diseno §4:
 *   - condicion `x < T`: membership 1 muy por debajo del umbral, 0 en el umbral
 *     (el punto de frontera es dudoso). Regresion lineal en [T - margin, T].
 *   - condicion `x >= T`: membership 1 muy por encima, 0 en el umbral.
 */
function membershipLE(x, threshold, margin) {
  return clamp01((threshold - x) / margin);
}
function membershipGE(x, threshold, margin) {
  return clamp01((x - threshold) / margin);
}

/**
 * Reglas de las 8 clases vivas (diseno §1.2-§1.9).
 *
 * CALIBRACION v3 (2026-10-06) — medidas reales, no memoria:
 *   - El UNICO ancla real del dataset hoy (ac_20261006_215109_000) midio, tras la
 *     normalizacion del WAV (pico 0,8): spectralFlux=7.27, std_spectralFlux=1.34,
 *     levelDb=0.714, rms=1.61, peakDbNorm=1.0, bandPctLow=0.62, bandPctMid=0.35,
 *     bandPctHigh=0.005, profileEntropy=0.158, flatness=0.304, crest=2.53.
 *   - Hallazgo 1: `peakDbNorm`=1.0 en silencio porque el WAV se normaliza -> NO se puede
 *     discriminar el silencio por peakDb (el diseno §1.2 lo asumia <0.70; esa via queda
 *     bloqueada). El piso real se define por bandas + entropia + estabilidad.
 *   - Hallazgo 2: `mean_spectralFlux`≈7 en TODAS las senales estables (tono, motor,
 *     viento, lluvia, silencio real) por el deslizamiento de fase de la FFT + hop 2048;
 *     los valores >20 solo aparecen con eventos temporales (AVE 66, VOZ 37, AGUA 42).
 *     Por eso SILENCIO no puede usar `flux < 0.5` (roto), sino `< 25` razonable y la
 *     discriminacion fuerte la ponen bandas + entropia + std_bandPctLow + std_flux.
 *   - Hallazgo 3: ruido ROSA sintetico reparte energia en las 3 bandas (low 0.31,
 *     mid 0.24, high 0.27) y el BLANCO en high (0.82). El diseno §1.5 asumia
 *     lluvia/viento por bandPctMid; eso era ERRONEO y se reemplaza por los perfiles
 *     medidos. viento = repartido (0.2..0.9 de entropia, flatness alta); lluvia =
 *     dominio agudo + entropia 0.8..1 + crest ~1.7.
 *   - Hallazgo 4: MOTOR real = tono compuesto muy estable: std_bandPctLow≈0.0003 y
 *     profileEntropy≈0.044. Se separa del SILENCIO real (bandPctLow 0.62, entropy 0.16,
 *     std_bandPctLow 0.27) por std_bandPctLow y bandPctLow.
 *   - Hallazgo 5: AGUA = crestFactor ALTISIMO (11, impulsos) + std_flux alto (30) +
 *     bandPctHigh alto. Esto la separa de LLUVIA (crest 1.7, std_flux 1) y de AVE
 *     (crest 1.4, pero std_flux 62).
 *   - Hallazgo 6: AVE (chirps) = std_bandPctHigh > 0.2 y std_flux > 20 (barridos
 *     rapidos). INSECTOS = tono estabilizado: std_dominant ≈ 0 y std_bandPeakHigh ≈ 0,
 *     bandPctHigh 1.0, entropy < 0.4. Se separan por la ESTABILIDAD espectral.
 *   - Hallazgo 7: VOZ (formantes u/i/a + silabeo) = bandPctMid dominante (0.82),
 *     bandPctHigh marginal (~0.06), std_flux ALTO (36, por las frases), std_levelDb > 0
 *     (silabeo), crest ~3. Un tono/acorde puro se descarta por flatness < 0.05 y
 *     std_levelDb ≈ 0, para que el acorde F11 caiga a OOD.
 *   - Calibrado con vectores medidos (test/rules-v0.test.mjs, fixtures F01-F12): las
 *     columnas del perfil del piso se verifican contra el ancla real en F01.
 */
export const RULES_SILENCE_REBASED = {
  addition: 'calibracion v3 medida sobre el unico ancla real (2026-10-06); el piso se define por bandas+entropia+std_bandPctLow+std_flux, no por peakDb (WAV normalizado)',
  reference_anchor: 'ac_20261006_215109_000 (silencio real, site_a, lab_mic_01)',
  anchor_measured: {
    mean_levelDb: 0.714, mean_rms: 1.61, mean_peakDbNorm: 1.0,
    mean_spectralFlux: 7.27, std_spectralFlux: 1.34, mean_profileEntropy: 0.158,
    mean_bandPctLow: 0.622, mean_bandPctMid: 0.346, mean_bandPctHigh: 0.005,
    mean_flatness: 0.304, mean_crestFactor: 2.53, mean_zeroCrossingRate: 0.028
  }
};

const RULES = Object.freeze([
  {
    id: 'silencio',
    label: 'SILENCIO',
    conditions: [
      { col: COL['mean_bandPctHigh'], op: 'lt', threshold: 0.05, margin: 0.03 },
      { col: COL['mean_bandPctLow'], op: 'lt', threshold: 0.85, margin: 0.2 },
      { col: COL['mean_profileEntropy'], op: 'lt', threshold: 0.35, margin: 0.2 },
      { col: COL['mean_dominantHzNorm'], op: 'lt', threshold: 0.1, margin: 0.06 },
      { col: COL['std_bandPctLow'], op: 'ge', threshold: 0.05, margin: 0.03 },
      { col: COL['mean_spectralFlux'], op: 'lt', threshold: 25, margin: 15 },
      { col: COL['std_spectralFlux'], op: 'lt', threshold: 5, margin: 3 },
      { col: COL['mean_flatness'], op: 'ge', threshold: 0.12, margin: 0.08 },
      { col: COL['mean_crestFactor'], op: 'lt', threshold: 6, margin: 2.5 }
    ]
  },
  {
    id: 'motor',
    label: 'MOTOR',
    conditions: [
      { col: COL['mean_levelDb'], op: 'ge', threshold: 0.45, margin: 0.3 },
      { col: COL['mean_bandPctLow'], op: 'ge', threshold: 0.85, margin: 0.12 },
      { col: COL['mean_bandPctHigh'], op: 'lt', threshold: 0.05, margin: 0.03 },
      { col: COL['mean_profileEntropy'], op: 'lt', threshold: 0.25, margin: 0.15 },
      { col: COL['std_bandPctLow'], op: 'lt', threshold: 0.1, margin: 0.07 },
      { col: COL['mean_centroidNorm'], op: 'lt', threshold: 0.3, margin: 0.15 },
      { col: COL['mean_zeroCrossingRate'], op: 'lt', threshold: 0.08, margin: 0.04 },
      { col: COL['mean_crestFactor'], op: 'lt', threshold: 3, margin: 1.2 }
    ]
  },
  {
    id: 'viento',
    label: 'VIENTO',
    conditions: [
      { col: COL['mean_bandPctLow'], op: 'ge', threshold: 0.2, margin: 0.12 },
      { col: COL['mean_bandPctMid'], op: 'ge', threshold: 0.15, margin: 0.1 },
      { col: COL['mean_bandPctHigh'], op: 'ge', threshold: 0.15, margin: 0.1 },
      { col: COL['mean_profileEntropy'], op: 'ge', threshold: 0.45, margin: 0.25 },
      { col: COL['mean_profileEntropy'], op: 'lt', threshold: 0.9, margin: 0.1 },
      { col: COL['mean_flatness'], op: 'ge', threshold: 0.4, margin: 0.25 },
      { col: COL['mean_crestFactor'], op: 'lt', threshold: 5, margin: 2 },
      { col: COL['mean_spectralFlux'], op: 'lt', threshold: 25, margin: 15 },
      { col: COL['std_spectralFlux'], op: 'lt', threshold: 5, margin: 3 }
    ]
  },
  {
    id: 'agua',
    label: 'AGUA',
    conditions: [
      { col: COL['mean_crestFactor'], op: 'ge', threshold: 4, margin: 2 },
      { col: COL['mean_bandPctHigh'], op: 'ge', threshold: 0.5, margin: 0.25 },
      { col: COL['mean_profileEntropy'], op: 'ge', threshold: 0.6, margin: 0.25 },
      { col: COL['mean_spectralFlux'], op: 'ge', threshold: 20, margin: 12 },
      { col: COL['std_spectralFlux'], op: 'ge', threshold: 10, margin: 6 }
    ]
  },
  {
    id: 'lluvia',
    label: 'LLUVIA',
    conditions: [
      { col: COL['mean_bandPctHigh'], op: 'ge', threshold: 0.6, margin: 0.25 },
      { col: COL['mean_bandPctLow'], op: 'lt', threshold: 0.2, margin: 0.1 },
      { col: COL['mean_profileEntropy'], op: 'ge', threshold: 0.8, margin: 0.15 },
      { col: COL['mean_zeroCrossingRate'], op: 'ge', threshold: 0.3, margin: 0.2 },
      { col: COL['mean_spectralFlux'], op: 'lt', threshold: 25, margin: 15 },
      { col: COL['std_spectralFlux'], op: 'lt', threshold: 5, margin: 3 },
      { col: COL['mean_crestFactor'], op: 'lt', threshold: 4, margin: 1.5 },
      { col: COL['mean_flatness'], op: 'ge', threshold: 0.5, margin: 0.3 }
    ]
  },
  {
    id: 'insectos',
    label: 'INSECTOS',
    conditions: [
      { col: COL['mean_bandPctHigh'], op: 'ge', threshold: 0.7, margin: 0.25 },
      { col: COL['mean_centroidNorm'], op: 'ge', threshold: 0.2, margin: 0.12 },
      { col: COL['mean_profileEntropy'], op: 'lt', threshold: 0.4, margin: 0.2 },
      { col: COL['std_dominantHzNorm'], op: 'lt', threshold: 0.1, margin: 0.06 },
      { col: COL['std_bandPeakHighNorm'], op: 'lt', threshold: 0.15, margin: 0.1 },
      { col: COL['std_spectralFlux'], op: 'lt', threshold: 10, margin: 6 },
      { col: COL['mean_spectralFlux'], op: 'lt', threshold: 25, margin: 15 },
      { col: COL['mean_zeroCrossingRate'], op: 'ge', threshold: 0.15, margin: 0.1 },
      { col: COL['mean_flatness'], op: 'lt', threshold: 0.6, margin: 0.3 }
    ]
  },
  {
    id: 'ave',
    label: 'AVE',
    conditions: [
      { col: COL['mean_bandPctHigh'], op: 'ge', threshold: 0.3, margin: 0.2 },
      { col: COL['mean_profileEntropy'], op: 'ge', threshold: 0.2, margin: 0.12 },
      { col: COL['std_bandPctHigh'], op: 'ge', threshold: 0.2, margin: 0.12 },
      { col: COL['std_spectralFlux'], op: 'ge', threshold: 20, margin: 12 },
      { col: COL['mean_spectralFlux'], op: 'ge', threshold: 20, margin: 12 },
      { col: COL['mean_crestFactor'], op: 'lt', threshold: 6, margin: 2.5 },
      { col: COL['mean_flatness'], op: 'ge', threshold: 0.2, margin: 0.12 }
    ]
  },
  {
    id: 'voz',
    label: 'VOZ',
    conditions: [
      { col: COL['mean_bandPctMid'], op: 'ge', threshold: 0.5, margin: 0.25 },
      { col: COL['mean_bandPctHigh'], op: 'lt', threshold: 0.15, margin: 0.08 },
      { col: COL['mean_profileEntropy'], op: 'ge', threshold: 0.1, margin: 0.06 },
      { col: COL['mean_zeroCrossingRate'], op: 'ge', threshold: 0.03, margin: 0.015 },
      { col: COL['std_spectralFlux'], op: 'ge', threshold: 3, margin: 2 },
      { col: COL['std_levelDb'], op: 'ge', threshold: 0.02, margin: 0.015 },
      { col: COL['mean_flatness'], op: 'ge', threshold: 0.05, margin: 0.03 }
    ]
  }
]);

/**
 * Metadatos del vector de entrada (el featureMeta del contrato AcousticClassification).
 * Frames/geometry fijos por clip contract: 3,0 s · 44.100 Hz · N_FFT 4096 · hop 2048.
 */
export const RULES_V0_FEATURE_META = Object.freeze({
  schema: 'acoustic.feat.v2',
  schemaSize: FEATURE_SCHEMA_SIZE,
  window: 'acoustic.feat.window.v2',
  windowDims: WINDOW_SCHEMA_DIMS,
  frames: 63,
  sampleRate: 44100,
  nFft: 4096,
  hop: 2048
});

function validateInput(values) {
  if (!Array.isArray(values)) {
    throw new TypeError('rules-v0: se esperaba un vector de 44 dims (array)');
  }
  if (values.length !== WINDOW_SCHEMA_DIMS) {
    throw new Error(
      `rules-v0: dimension invalida ${values.length} (esperado ${WINDOW_SCHEMA_DIMS}); el clasificador no recorta ni rellena vectores`
    );
  }
  if (!values.every(Number.isFinite)) {
    throw new Error('rules-v0: el vector contiene NaN/Infinity; un vector invalido no se clasifica');
  }
}

/**
 * Score de una regla = minimo de las membresias de sus condiciones (diseno §4,
 * cierre conservador): una condicion en el umbral falla toda la regla.
 */
function ruleScore(rule, values) {
  let score = 1;
  for (const c of rule.conditions) {
    const x = values[c.col];
    const m = c.op === 'lt' ? membershipLE(x, c.threshold, c.margin) : membershipGE(x, c.threshold, c.margin);
    if (m < score) score = m;
  }
  return score;
}

/** Score de las 8 reglas vivas en orden. */
function scoreAllRules(values) {
  return RULES.map((r) => ({ rule: r, score: ruleScore(r, values) }));
}

/** Puerta de senal del diseno §1.1. Devuelve una clasificacion anticipada o null. */
function signalGate(values) {
  const rms = values[COL['mean_rms']];
  const logEnergy = values[COL['mean_logEnergy']];
  const zcr = values[COL['mean_zeroCrossingRate']];
  const peakDb = values[COL['mean_peakDbNorm']];
  const stdPeakDb = values[COL['std_peakDbNorm']];
  const crest = values[COL['mean_crestFactor']];

  // R0.1 audio muerto / sin senal: todo vacio.
  if (rms < 0.0005 && logEnergy < 0.5 && zcr < 0.001) {
    return {
      label: 'SILENCIO',
      confidence: clamp01((0.5 - rms) / 0.5),
      degraded: true,
      gate: 'R0.1',
      note: 'audio muerto / sin senal (AC-5 actuaria antes en ingesta; aqui solo clasificacion)'
    };
  }
  // R0.2 saturado / clipping: artefacto, no clase.
  if (stdPeakDb < 0.02 && peakDb >= 0.99 && crest < 1.5) {
    return {
      label: 'RUIDO DESCONOCIDO',
      confidence: clamp01((1.5 - crest) / 1.5),
      degraded: true,
      gate: 'R0.2',
      note: 'saturado / clipping (artefacto, no clase viva)'
    };
  }
  return null;
}

/** probabilities del contrato: solo la clase resuelta > 0, resto 0 (diseno §7). */
function probabilitiesFor(label, confidence) {
  const probs = {};
  for (const l of RULES_V0_LABELS) probs[l] = 0;
  probs[label] = confidence;
  return probs;
}

/**
 * Clasifica un vector de 44 dims.
 *
 * @param {number[]} values vector `acoustic.feat.window.v2` (44 dims)
 * @returns {AcousticClassification}
 */
export function classifyAcoustic(values) {
  validateInput(values);

  const gate = signalGate(values);
  if (gate) {
    return {
      signalId: 'S81',
      label: gate.label,
      confidence: gate.confidence,
      probabilities: probabilitiesFor(gate.label, gate.confidence),
      modelVersion: RULES_V0_VERSION,
      method: RULES_V0_METHOD,
      sourceMode: 'live',
      degraded: gate.degraded,
      gate: gate.gate,
      note: gate.note,
      featureMeta: { ...RULES_V0_FEATURE_META }
    };
  }

  const scored = scoreAllRules(values).sort((a, b) => b.score - a.score);
  const best = scored[0];
  const second = scored[1] || { score: 0 };

  // Etapa 9 — OOD: ninguna regla dispara, o el margen de decision es dudoso.
  if (best.score <= 0 || best.score - second.score <= DECISION_MARGIN_MIN) {
    const label = 'RUIDO DESCONOCIDO';
    return {
      signalId: 'S81',
      label,
      confidence: best.score, // mejor candidato (o 0)
      probabilities: probabilitiesFor(label, best.score),
      modelVersion: RULES_V0_VERSION,
      method: RULES_V0_METHOD,
      sourceMode: 'live',
      degraded: best.score <= 0,
      note: best.score <= 0
        ? 'ninguna regla viva disparo; no se fuerza a clase viva'
        : `margen de decision ${(best.score - second.score).toFixed(3)} <= ${DECISION_MARGIN_MIN}: dudoso, no se fuerza`,
      featureMeta: { ...RULES_V0_FEATURE_META }
    };
  }

  return {
    signalId: 'S81',
    label: best.rule.label,
    confidence: best.score,
    probabilities: probabilitiesFor(best.rule.label, best.score),
    modelVersion: RULES_V0_VERSION,
    method: RULES_V0_METHOD,
    sourceMode: 'live',
    degraded: false,
    note: `regla ${best.rule.id} disparada con ventaja de ${(best.score - second.score).toFixed(3)}`,
    featureMeta: { ...RULES_V0_FEATURE_META }
  };
}

/** Nombres de columna de la ventana (orden inmutable). Util para difs/debug. */
export const RULES_V0_COLUMN_NAMES = Object.freeze([...WINDOW_SCHEMA_V1]);
export { FEATURE_SCHEMA_V1, RULES };