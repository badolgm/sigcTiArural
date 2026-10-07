/**
 * Pruebas de la revision de esquema `acoustic.feat.v2` (decision de gobernanza 2026-10-05).
 *
 * Tres bloques:
 *   1. profileEntropy v2 corregida y v1 congelada (reproducibilidad).
 *   2. Aislamiento del cambio: v1 y v2 solo difieren en el indice 21.
 *   3. Sellado por version en la ingesta y en el CSV de features.
 *
 * Estas pruebas comprueban que el cambio es EXACTO y REPRODUCIBLE, no que la feature sea
 * "correcta" en un sentido filosofico: lo que se fija aqui son las cifras medidas que
 * motivaron la revision.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  FEATURE_SCHEMA_IDS, WINDOW_SCHEMA_IDS, WINDOW_SCHEMA_DIMS,
  FEATURE_SCHEMA_V1, FEATURE_SCHEMA_V2, WINDOW_SCHEMA_V1, WINDOW_SCHEMA_V2,
  DEFAULT_FEATURE_SCHEMA_ID, resolveFeatureSchemaId, windowSchemaFor, schemaTag
} from '../src/constants.js';
import { extractClipFeatures, analyzeFrame, profileEntropyBinCoverage } from '../src/features.js';
import { aggregateWindow } from '../src/window.js';
import { toneMix, whiteNoise, pinkNoise, normalize, clipLength } from '../src/synth.js';

const SR = 44100;
const N = clipLength(SR);
const ENTROPY_IDX = 21; // indice 0-based de profileEntropy dentro de las 22

/** profileEntropy tal como queda en v1, replicada desde el codigo congelado. */
function entropyV1(db) {
  const buckets = 96;
  const per = Math.max(1, Math.floor((db.length) / buckets));
  const power = new Float64Array(buckets);
  let total = 0;
  for (let b = 0; b < buckets; b++) {
    let acc = 0;
    for (let i = b * per; i < Math.min(db.length, b * per + per); i++) acc += db[i] * db[i];
    power[b] = acc; total += acc;
  }
  if (total <= 0) return 0;
  let e = 0;
  for (const v of power) { if (v <= 0) continue; const p = v / total; e -= p * Math.log(p); }
  return Math.min(1, Math.max(0, e / Math.log(buckets)));
}

/** profileEntropy tal como queda en v2: potencia y cobertura completa. */
function entropyV2(magnitudes) {
  const buckets = 96;
  const half = magnitudes.length;
  const power = new Float64Array(buckets);
  let total = 0;
  for (let b = 0; b < buckets; b++) {
    const start = Math.floor((b * half) / buckets);
    const end = Math.floor(((b + 1) * half) / buckets);
    let acc = 0;
    for (let i = start; i < end; i++) acc += magnitudes[i] * magnitudes[i];
    power[b] = acc; total += acc;
  }
  if (total <= 0) return 0;
  let e = 0;
  for (const v of power) { if (v <= 0) continue; const p = v / total; e -= p * Math.log(p); }
  return Math.min(1, Math.max(0, e / Math.log(buckets)));
}

const senales = {
  silencio: new Float64Array(N),
  'tono 1 kHz': toneMix(N, SR, [{ hz: 1000, amp: 0.6 }]),
  'ruido blanco': normalize(whiteNoise(N), 0.6),
  'ruido rosa': normalize(pinkNoise(N), 0.6)
};

/* ----------------------------------------------------------------- 1. valores */

test('v2 corrige profileEntropy: el silencio ya no puntua entropia maxima', () => {
  const f = analyzeFrame(senales.silencio, SR);
  assert.equal(entropyV2(f.magnitudes), 0, 'silencio digital = 0 en v2');
  assert.ok(entropyV1(f.db) > 0.99, 'v1 (congelada) sigue dando ~1: es el defecto que se corrige');
});

test('v2 separa tono de ruido; v1 no lo hacia', () => {
  const ent = (s) => {
    const f = analyzeFrame(s, SR);
    return { v1: entropyV1(f.db), v2: entropyV2(f.magnitudes) };
  };
  const tono = ent(senales['tono 1 kHz']);
  const blanco = ent(senales['ruido blanco']);

  assert.ok(tono.v2 < 0.05, `tono puro debe tener entropia ~0 en v2, dio ${tono.v2}`);
  assert.ok(blanco.v2 > 0.9, `ruido blanco debe tener entropia ~1 en v2, dio ${blanco.v2}`);
  assert.ok(blanco.v2 - tono.v2 > 0.8, 'v2 separa tono de ruido de forma rotunda');

  // v1 no distinguia: ambos cerca de 1.
  assert.ok(Math.abs(blanco.v1 - tono.v1) < 0.05, 'v1 comprimia ambas senales (por eso no servia)');
});

test('v2 mantiene el orden de planicidad: rosa entre tono y blanco', () => {
  const e = (s) => entropyV2(analyzeFrame(s, SR).magnitudes);
  const tono = e(senales['tono 1 kHz']);
  const rosa = e(senales['ruido rosa']);
  const blanco = e(senales['ruido blanco']);
  assert.ok(rosa > tono, 'ruido rosa (pico a 15,7 Hz) mas disperso que un tono puro');
  assert.ok(blanco > rosa, 'ruido blanco mas disperso que el rosa');
});

test('v2 queda dentro de [0,1] y es finita en todas las senales de referencia', () => {
  for (const [nombre, s] of Object.entries(senales)) {
    for (let k = 0; k < 63; k++) {
      const off = k * 2048;
      const f = analyzeFrame(s, SR, off);
      const e = entropyV2(f.magnitudes);
      assert.ok(Number.isFinite(e), `${nombre} frame ${k}: entropia no finita`);
      assert.ok(e >= 0 && e <= 1, `${nombre} frame ${k}: entropia ${e} fuera de [0,1]`);
    }
  }
});

/* ------------------------------------------------------------- 2. aislamiento */

test('v2 cubre los 2048 bins; v1 solo 2016 (el defecto de truncamiento)', () => {
  const v2 = profileEntropyBinCoverage(FEATURE_SCHEMA_IDS.V2);
  const v1 = profileEntropyBinCoverage(FEATURE_SCHEMA_IDS.V1);
  assert.equal(v2.half, 2048);
  assert.equal(v2.read, 2048, 'v2 debe leer todos los bins');
  assert.equal(v2.truncados, 0);
  assert.equal(v1.read, 2016, 'v1 (congelado) conserva su truncamiento');
  assert.equal(v1.truncados, 32);
});

test('v2 NO toca analyzeFrame: la paridad con S30 sigue intacta', async () => {
  // analyzeFrame es la unica funcion bloqueada por paridad. profileEntropyV2 solo LEE
  // `magnitudes`, no modifica nada del frame. Si este test falla, se rompio S30.
  const { extractFeatures } = await import('../src/features.js');
  const f = analyzeFrame(senales['tono 1 kHz'], SR);
  const snapshot = { mag: f.magnitudes.slice(0, 8), db: f.db.slice(0, 8), rms: f.rms };
  const v1 = extractFeatures(f, senales['tono 1 kHz'], null, FEATURE_SCHEMA_IDS.V1);
  const v2 = extractFeatures(f, senales['tono 1 kHz'], null, FEATURE_SCHEMA_IDS.V2);
  for (let i = 0; i < 8; i++) {
    assert.equal(f.magnitudes[i], snapshot.mag[i], 'magnitudes mutados');
    assert.equal(f.db[i], snapshot.db[i], 'db mutados');
  }
  assert.equal(f.rms, snapshot.rms, 'rms mutado');
  assert.equal(v1.length, 22);
  assert.equal(v2.length, 22);
});

test('v1 y v2 difieren EXCLUSIVAMENTE en el indice 21', () => {
  for (const [nombre, s] of Object.entries(senales)) {
    const a = extractClipFeatures(s, SR, 2048, 4096, FEATURE_SCHEMA_IDS.V1);
    const b = extractClipFeatures(s, SR, 2048, 4096, FEATURE_SCHEMA_IDS.V2);
    assert.equal(a.frameCount, b.frameCount, `${nombre}: distinto numero de frames`);
    for (let k = 0; k < a.frameCount; k++) {
      for (let i = 0; i < 22; i++) {
        if (i === ENTROPY_IDX) continue;
        assert.equal(a.frames[k][i], b.frames[k][i],
          `${nombre} frame ${k}: la dim ${i} (${FEATURE_SCHEMA_V1[i]}) cambio entre v1 y v2`);
      }
    }
  }
});

test('el vector de 44 dims solo cambia en mean_profileEntropy y std_profileEntropy', () => {
  // Vector aplanado: indices 0..21 = los 22 means, 22..43 = los 22 stds.
  // Por tanto mean_profileEntropy cae en el indice 21 y std_profileEntropy en el 43.
  const MEAN_ENTROPY = ENTROPY_IDX;        // 21
  const STD_ENTROPY = 22 + ENTROPY_IDX;    // 43
  const s = senales['ruido rosa'];
  const a = aggregateWindow(extractClipFeatures(s, SR, 2048, 4096, FEATURE_SCHEMA_IDS.V1).frames);
  const b = aggregateWindow(extractClipFeatures(s, SR, 2048, 4096, FEATURE_SCHEMA_IDS.V2).frames);
  assert.equal(a.values.length, WINDOW_SCHEMA_DIMS);
  assert.equal(b.values.length, WINDOW_SCHEMA_DIMS);
  for (let i = 0; i < WINDOW_SCHEMA_DIMS; i++) {
    if (i === MEAN_ENTROPY || i === STD_ENTROPY) continue;
    assert.equal(a.values[i], b.values[i], `dim ${i + 1} (${WINDOW_SCHEMA_V1[i]}) cambio entre v1 y v2`);
  }
  assert.equal(WINDOW_SCHEMA_V1[MEAN_ENTROPY], 'mean_profileEntropy');
  assert.equal(WINDOW_SCHEMA_V1[STD_ENTROPY], 'std_profileEntropy');
  assert.notEqual(a.values[MEAN_ENTROPY], b.values[MEAN_ENTROPY], 'mean_profileEntropy debe cambiar');
  assert.notEqual(a.values[STD_ENTROPY], b.values[STD_ENTROPY], 'std_profileEntropy debe cambiar');
  assert.ok(a.values[MEAN_ENTROPY] > 0.9, 'el v1 congelado rondaba 0.92');
  assert.ok(b.values[MEAN_ENTROPY] > 0.4 && b.values[MEAN_ENTROPY] < 0.7, 'v2 ronda 0.51 para el rosa');
});

test('v1 y v2 comparten nombres y orden: el contrato de 44 dims no se altera', () => {
  assert.deepEqual([...FEATURE_SCHEMA_V2], [...FEATURE_SCHEMA_V1], 'mismos 22 nombres, mismo orden');
  assert.deepEqual([...WINDOW_SCHEMA_V2], [...WINDOW_SCHEMA_V1], 'mismos 44 nombres, mismo orden');
  assert.equal(FEATURE_SCHEMA_V2.length, 22);
  assert.equal(WINDOW_SCHEMA_V2.length, 44);
  assert.equal(FEATURE_SCHEMA_V1[ENTROPY_IDX], 'profileEntropy', 'la feature corregida sigue en la posicion 21');
});

/* --------------------------------------------------------------- 3. sellado */

test('resolveFeatureSchemaId acepta v1, v2 y los ids completos', () => {
  assert.equal(resolveFeatureSchemaId(undefined), DEFAULT_FEATURE_SCHEMA_ID);
  assert.equal(resolveFeatureSchemaId(''), DEFAULT_FEATURE_SCHEMA_ID);
  assert.equal(resolveFeatureSchemaId('v1'), FEATURE_SCHEMA_IDS.V1);
  assert.equal(resolveFeatureSchemaId('v2'), FEATURE_SCHEMA_IDS.V2);
  assert.equal(resolveFeatureSchemaId('acoustic.feat.v1'), FEATURE_SCHEMA_IDS.V1);
  assert.equal(resolveFeatureSchemaId('acoustic.feat.v2'), FEATURE_SCHEMA_IDS.V2);
  assert.throws(() => resolveFeatureSchemaId('v3'), /no es un feature schema conocido/);
});

test('windowSchemaFor liga cada feature schema con su ventana', () => {
  assert.deepEqual(windowSchemaFor(FEATURE_SCHEMA_IDS.V1), { id: WINDOW_SCHEMA_IDS.V1, names: WINDOW_SCHEMA_V1 });
  assert.deepEqual(windowSchemaFor(FEATURE_SCHEMA_IDS.V2), { id: WINDOW_SCHEMA_IDS.V2, names: WINDOW_SCHEMA_V2 });
  assert.throws(() => windowSchemaFor('acoustic.feat.v9'), /desconocido/);
});

test('schemaTag genera el nombre de fichero por version', () => {
  assert.equal(schemaTag(FEATURE_SCHEMA_IDS.V1), 'v1');
  assert.equal(schemaTag(FEATURE_SCHEMA_IDS.V2), 'v2');
  assert.throws(() => schemaTag('x'), /desconocido/);
});

test('v1 por defecto NO: el logger materializa v2', () => {
  assert.equal(DEFAULT_FEATURE_SCHEMA_ID, FEATURE_SCHEMA_IDS.V2,
    'la feature 21 de v1 es cientificamente incorrecta: no puede ser el default');
});

test('extractClipFeatures rechaza un nFft distinto de N_FFT en vez de mentir', () => {
  assert.throws(
    () => extractClipFeatures(senales['tono 1 kHz'], SR, 2048, 2048, FEATURE_SCHEMA_IDS.V2),
    /no soportado/,
    'un nFft distinto daria un conteo de frames de una taille y un espectro de otra'
  );
});

test('extractClipFeatures rechaza un feature schema desconocido', () => {
  assert.throws(
    () => extractClipFeatures(senales['tono 1 kHz'], SR, 2048, 4096, 'acoustic.feat.v99'),
    /desconocido/
  );
});

test('extraer con v1 sigue siendo posible: reproducibilidad del congelado', () => {
  const a = extractClipFeatures(senales['ruido rosa'], SR, 2048, 4096, FEATURE_SCHEMA_IDS.V1);
  assert.equal(a.featureSchema, FEATURE_SCHEMA_IDS.V1);
  assert.equal(a.frameCount, 63);
  // El valor congelado debe seguir dando ~0.92, no el ~0.51 de v2.
  const meanV1 = a.frames.reduce((s, f) => s + f[ENTROPY_IDX], 0) / a.frames.length;
  assert.ok(meanV1 > 0.85, `v1 debe conservar su valor congelado (~0.92), dio ${meanV1}`);
});

test('el repo no escribe WAV ni features al importar este modulo', () => {
  // Comprobacion de aislamiento: este test no debe crear nada nuevo en data/.
  const real = path.resolve(process.cwd(), '..', '..', 'data', 'datasets', 'sigct_rural_acoustic', 'v1');
  if (!fs.existsSync(real)) return; // el repo puede no tener data/ enotro entorno
  const wavs = fs.readdirSync(path.join(real, 'raw'), { withFileTypes: true, recursive: true })
    .filter((d) => d.isFile() && d.name.endsWith('.wav'));
  // Expectativa del estado real (no "dataset vacio"): tras la mision E1 el dataset esta en
  // CAPTADO_INICIAL con UN unico WAV legitimo (ancla real ac_20261006_215109_000, silencio).
  // Importar este modulo no debe SUMAR WAV; si el dataset gana muestras, actualizar EXPECT.
  const EXPECT_REAL_WAVS = ['ac_20261006_215109_000_f6fe2a1e010e17f068cc01fcba052d66cb3d446be5e2f4e36236f8dbc5784ae7.wav'];
  const present = wavs.map((d) => d.name);
  assert.equal(
    present.length,
    EXPECT_REAL_WAVS.length,
    `el dataset real debe tener exactamente ${EXPECT_REAL_WAVS.length} WAV legitimos (E1), encontrados: ${present.join(', ')}`
  );
  for (const name of EXPECT_REAL_WAVS) {
    assert.ok(present.includes(name), `falta el WAV legitimo ${name}`);
  }
});