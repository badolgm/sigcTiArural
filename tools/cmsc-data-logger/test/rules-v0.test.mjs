/**
 * RULES-V0 — prueba de contrato, determinismo, puertas y fixtures F01-F12.
 *
 * Mision: ACOUSTIC_E4_RULES_V0_IMPLEMENTATION.
 * Base: Documentacion/Arquitectura/CMSC_AI_ACOUSTIC_RULES_V0_DESIGN.md (§5 fixtures,
 *       §6 contrato de salida).
 *
 * Fixtures:
 *   F01  ancla real silencio (WAV del dataset v1, raw/silencio)          -> SILENCIO
 *   F02  silencio digital (ceros)                                          -> SILENCIO (puerta R0.1)
 *   F03  motor 60Hz + armonicos (120/180/240/300 + leve ruido)             -> MOTOR
 *   F04  viento (rosa, sin filtro con energia repartida)                   -> VIENTO
 *   F05  lluvia (blanco, dominio agudo)                                    -> LLUVIA
 *   F06  agua (gotas: transitorios/impulsos)                               -> AGUA
 *   F07  insectos (tono 6,5k AM 180Hz estable)                             -> INSECTOS
 *   F08  ave (chirps barridos 1->6k en rafagas)                            -> AVE
 *   F09  voz (formantes u/i/a + silabeo)                                   -> VOZ
 *   F10  saturado (tono full-scale)                                        -> RUIDO DESCONOCIDO (puerta R0.2)
 *   F11  musica (acorde 440+554+659, armonico puro)                        -> RUIDO DESCONOCIDO (OOD)
 *   F12  mezcla tono 1k + ruido (perfil ambiguo)                           -> RUIDO DESCONOCIDO (OOD)
 *
 * Puridad: fixtures deterministas (seeds fijos) y el vector se reconstruye con e
 * mismo pipeline del logger (extractClipFeatures + aggregateWindow), por lo que la
 * clasificacion vale para cualquier cliente que consuma `acoustic.feat.window.v2`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { extractClipFeatures } from '../src/features.js';
import { aggregateWindow } from '../src/window.js';
import { toneMix, whiteNoise, pinkNoise, normalize, clipLength } from '../src/synth.js';
import { decodeWav } from '../src/wav.js';
import {
  classifyAcoustic,
  RULES_V0_VERSION,
  RULES_V0_METHOD,
  RULES_V0_LABELS,
  DECISION_MARGIN_MIN,
  RULES_V0_COLUMN_NAMES,
  RULES_V0_FEATURE_META,
  RULES_SILENCE_REBASED
} from '../src/rules-v0.js';
import { WINDOW_SCHEMA_DIMS } from '../src/constants.js';

const SR = 44100;
const N = clipLength(SR);

/** Aplica el pipeline real del logger: clip -> frames (22) -> ventana 44. */
function vectorOf(samples) {
  const { frames, frameCount } = extractClipFeatures(samples, SR, 2048);
  const { values, named } = aggregateWindow(frames);
  return { values, named, frameCount };
}

/* ----------------------------- generadores ----------------------------- */

function amTone(baseHz, amHz, depth, noiseAmp) {
  const out = new Float64Array(N);
  const wn = whiteNoise(N, 999);
  for (let i = 0; i < N; i++) {
    const env = 1 - depth + depth * Math.sin((2 * Math.PI * amHz * i) / SR);
    out[i] = Math.sin((2 * Math.PI * baseHz * i) / SR) * env + wn[i] * noiseAmp;
  }
  return normalize(out, 0.8);
}

function chirpBursts(f0, f1, burstMs, gapMs) {
  const out = new Float64Array(N);
  const burst = Math.round((burstMs / 1000) * SR);
  const gap = Math.round((gapMs / 1000) * SR);
  let pos = 0;
  let k = 0;
  while (pos + burst <= N) {
    for (let i = 0; i < burst && pos + i < N; i++) {
      const t = i / burst;
      const f = f0 + (f1 - f0) * t;
      out[pos + i] = Math.sin((2 * Math.PI * f * (pos + i)) / SR + k);
    }
    pos += burst + gap;
    k++;
  }
  return normalize(out, 0.8);
}

function voiceFormants() {
  const out = new Float64Array(N);
  const phrase = Math.round(0.12 * SR);
  const pause = Math.round(0.09 * SR);
  const formants = [
    [{ hz: 300, amp: 1 }, { hz: 700, amp: 0.5 }],
    [{ hz: 400, amp: 1 }, { hz: 2200, amp: 0.4 }, { hz: 2900, amp: 0.2 }],
    [{ hz: 250, amp: 1 }, { hz: 900, amp: 0.6 }]
  ];
  let pos = 0;
  let formIdx = 0;
  while (pos + phrase <= N) {
    const f = formants[formIdx % formants.length];
    for (let i = 0; i < phrase && pos + i < N; i++) {
      let v = 0;
      for (const p of f) v += p.amp * Math.sin((2 * Math.PI * p.hz * (pos + i)) / SR + (i % 2) * 0.3);
      out[pos + i] = v;
    }
    pos += phrase + pause;
    formIdx++;
  }
  return normalize(out, 0.8);
}

function motor() {
  const t = toneMix(N, SR, [
    { hz: 60, amp: 1 }, { hz: 120, amp: 0.5 }, { hz: 180, amp: 0.3 },
    { hz: 240, amp: 0.2 }, { hz: 300, amp: 0.1 }
  ]);
  const wn = whiteNoise(N, 77);
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) out[i] = t[i] * 0.95 + wn[i] * 0.05;
  return normalize(out, 0.8);
}

function rain() {
  return normalize(whiteNoise(N, 11), 0.5);
}
function wind() {
  return normalize(pinkNoise(N, 13), 0.7);
}
function drips() {
  const out = new Float64Array(N);
  const per = Math.round((1 / 8) * SR);
  const wn = whiteNoise(N, 21);
  for (let i = 0; i < N; i += per) {
    for (let j = 0; j < per && i + j < N; j++) {
      const decay = Math.exp(-j / (0.004 * SR));
      out[i + j] = wn[i + j] * decay;
    }
  }
  return normalize(out, 0.9);
}
function chord() {
  return toneMix(N, SR, [
    { hz: 440, amp: 1 }, { hz: 554, amp: 0.8 }, { hz: 659, amp: 0.6 },
    { hz: 880, amp: 0.3 }, { hz: 1108, amp: 0.2 }
  ]);
}
function revuelto() {
  const t = toneMix(N, SR, [{ hz: 1000, amp: 0.4 }]);
  const wn = whiteNoise(N, 55);
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) out[i] = t[i] * 0.5 + wn[i] * 0.5;
  return normalize(out, 0.8);
}

/* ------------------------------ fixtures ------------------------------- */

/** F01 — ancla real: WAV del dataset v1. Ruta estable via import.meta.url. */
const ANCLA_REAL_WAV = fileURLToPath(
  new URL(
    '../../../data/datasets/sigct_rural_acoustic/v1/raw/silencio/' +
      'ac_20261006_215109_000_f6fe2a1e010e17f068cc01fcba052d66cb3d446be5e2f4e36236f8dbc5784ae7.wav',
    import.meta.url
  )
);

function realAnchorVector() {
  const buf = readFileSync(ANCLA_REAL_WAV);
  const { samples } = decodeWav(buf);
  return vectorOf(samples);
}

function fixture(name, make) {
  return { name, vector: vectorOf(make()) };
}

const FIXTURES = {
  F01_REAL_SILENCIO: () => {
    const v = realAnchorVector();
    return { key: 'F01_REAL_SILENCIO', anchor: RULES_SILENCE_REBASED.reference_anchor, v, expected: 'SILENCIO', degraded: false };
  },
  F02_SILENCIO_DIGITAL: () => {
    const v = vectorOf(new Float64Array(N));
    return { key: 'F02_SILENCIO_DIGITAL', v, expected: 'SILENCIO', degraded: true, gate: 'R0.1' };
  },
  F03_MOTOR: () => {
    const v = vectorOf(motor());
    return { key: 'F03_MOTOR', v, expected: 'MOTOR', degraded: false };
  },
  F04_VIENTO: () => {
    const v = vectorOf(wind());
    return { key: 'F04_VIENTO', v, expected: 'VIENTO', degraded: false };
  },
  F05_LLUVIA: () => {
    const v = vectorOf(rain());
    return { key: 'F05_LLUVIA', v, expected: 'LLUVIA', degraded: false };
  },
  F06_AGUA: () => {
    const v = vectorOf(drips());
    return { key: 'F06_AGUA', v, expected: 'AGUA', degraded: false };
  },
  F07_INSECTOS: () => {
    const v = vectorOf(amTone(6500, 180, 0.6, 0.01));
    return { key: 'F07_INSECTOS', v, expected: 'INSECTOS', degraded: false };
  },
  F08_AVE: () => {
    const v = vectorOf(chirpBursts(1000, 6000, 180, 220));
    return { key: 'F08_AVE', v, expected: 'AVE', degraded: false };
  },
  F09_VOZ: () => {
    const v = vectorOf(voiceFormants());
    return { key: 'F09_VOZ', v, expected: 'VOZ', degraded: false };
  },
  F10_SATURADO: () => {
    const v = vectorOf(toneMix(N, SR, [{ hz: 1000, amp: 1 }]));
    return { key: 'F10_SATURADO', v, expected: 'RUIDO DESCONOCIDO', degraded: true, gate: 'R0.2' };
  },
  F11_MUSICA: () => {
    const v = vectorOf(chord());
    return { key: 'F11_MUSICA', v, expected: 'RUIDO DESCONOCIDO', degraded: true };
  },
  F12_REVUELTO: () => {
    const v = vectorOf(revuelto());
    return { key: 'F12_REVUELTO', v, expected: 'RUIDO DESCONOCIDO', degraded: true };
  }
};

/* ------------------------------ contratos ------------------------------ */

test('rules-v0: contrato de salida de cada fixture', () => {
  for (const build of Object.values(FIXTURES)) {
    const { v, expected } = build();
    const r = classifyAcoustic(v.values);

    assert.equal(r.signalId, 'S81', `${v.key}: signalId`);
    assert.equal(r.method, RULES_V0_METHOD, `${v.key}: method`);
    assert.equal(r.modelVersion, RULES_V0_VERSION, `${v.key}: modelVersion`);
    assert.equal(r.sourceMode, 'live', `${v.key}: sourceMode`);

    assert.ok(
      RULES_V0_LABELS.includes(r.label),
      `${v.key}: label "${r.label}" debe estar en la taxonomia`
    );
    assert.ok(
      Number.isFinite(r.confidence) && r.confidence >= 0 && r.confidence <= 1,
      `${v.key}: confidence ${r.confidence} en [0,1]`
    );

    const probSum = Object.values(r.probabilities).reduce((a, b) => a + b, 0);
    assert.ok(
      Object.keys(r.probabilities).length === RULES_V0_LABELS.length &&
        probSum === r.confidence,
      `${v.key}: probabilities suman confidence y dienen las 9 clases`
    );

    assert.deepEqual(
      r.featureMeta,
      {
        schema: 'acoustic.feat.v2',
        schemaSize: 22,
        window: 'acoustic.feat.window.v2',
        windowDims: 44,
        frames: 63,
        sampleRate: 44100,
        nFft: 4096,
        hop: 2048
      },
      `${v.key}: featureMeta fijo`
    );
  }
});

test('rules-v0: fixtures F01-F12 clasifican segun diseno', () => {
  for (const [key, build] of Object.entries(FIXTURES)) {
    const fix = build();
    const r = classifyAcoustic(fix.v.values);
    assert.equal(r.label, fix.expected, `${key}: etiqueta esperada`);
    assert.equal(
      r.degraded,
      fix.degraded ?? false,
      `${key}: degraded (${fix.degraded ?? false})`
    );
    if (fix.gate) assert.equal(r.gate, fix.gate, `${key}: puerta`);
  }
});

test('rules-v0: F01 ancla real cumple el perfil del piso (calibracion v3)', () => {
  const { v, key } = FIXTURES.F01_REAL_SILENCIO();
  const p = v.named;
  assert.ok(p.mean_bandPctHigh < 0.05, `${key}: bandPctHigh piso`);
  assert.ok(p.mean_profileEntropy < 0.35, `${key}: entropy piso`);
  assert.ok(p.mean_bandPctLow < 0.85, `${key}: bandPctLow < motor`);
  assert.ok(p.std_bandPctLow >= 0.05, `${key}: piso varia (std_bandPctLow)`);
  assert.ok(p.mean_spectralFlux < 25, `${key}: flux piso`);
  assert.ok(p.mean_flatness >= 0.12, `${key}: no es tono puro`);
});

test('rules-v0: determinismo (mismo vector -> misma salida)', () => {
  const { v, key } = FIXTURES.F03_MOTOR();
  const a = classifyAcoustic(v.values);
  const b = classifyAcoustic(v.values);
  assert.deepEqual(a, b, `${key}: dos llamadas identicas`);
  assert.equal(JSON.stringify(a), JSON.stringify(b), `${key}: serializacion identica`);
});

test('rules-v0: validacion de entrada estricta (no recorta ni rellena)', () => {
  const good = FIXTURES.F05_LLUVIA().v.values;
  assert.throws(() => classifyAcoustic(good.slice(0, 43)), /dimension invalida/);
  assert.throws(() => classifyAcoustic([...good, 0]), /dimension invalida/);
  assert.throws(() => classifyAcoustic(undefined), /se esperaba un vector/);
  assert.throws(() => classifyAcoustic([...good.slice(0, 43), NaN]), /NaN\/Infinity/);
  assert.throws(() => classifyAcoustic([...good.slice(0, 43), Infinity]), /NaN\/Infinity/);
  assert.doesNotThrow(() => classifyAcoustic(good));
});

test('rules-v0: el vector de entrada tiene exactamente 44 dims (window.v2)', () => {
  for (const build of Object.values(FIXTURES)) {
    const { v, key } = build();
    assert.equal(v.values.length, WINDOW_SCHEMA_DIMS, `${key}: 44 dims`);
    assert.equal(v.frameCount, RULES_V0_FEATURE_META.frames, `${key}: 63 frames`);
  }
});

test('rules-v0: RULES_V0_COLUMN_NAMES documenta el orden inmutable', () => {
  assert.equal(RULES_V0_COLUMN_NAMES.length, 44);
  assert.equal(RULES_V0_COLUMN_NAMES[0], 'mean_dominantHzNorm');
  assert.equal(RULES_V0_COLUMN_NAMES[21], 'mean_profileEntropy');
  assert.equal(RULES_V0_COLUMN_NAMES[22], 'std_dominantHzNorm');
  assert.equal(RULES_V0_COLUMN_NAMES[43], 'std_profileEntropy');
  // Apoyo a la decision D-1: las 22 features v2 en mean+std.
  for (let i = 0; i < 22; i++) {
    assert.equal(RULES_V0_COLUMN_NAMES[i], `mean_${RULES_V0_COLUMN_NAMES[i].slice(5)}`);
    assert.equal(RULES_V0_COLUMN_NAMES[22 + i], `std_${RULES_V0_COLUMN_NAMES[i].slice(5)}`);
  }
});

test('rules-v0: DECISION_MARGIN_MIN y detalle de implementation coherente', () => {
  assert.equal(DECISION_MARGIN_MIN, 0.1);
  // Los fixtures OOD (F11/F12) deben salir si ninguna regla viva gana con margen.
  const f11 = classifyAcoustic(FIXTURES.F11_MUSICA().v.values);
  assert.equal(f11.label, 'RUIDO DESCONOCIDO');
  const f12 = classifyAcoustic(FIXTURES.F12_REVUELTO().v.values);
  assert.equal(f12.label, 'RUIDO DESCONOCIDO');
});