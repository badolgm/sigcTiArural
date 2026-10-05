/**
 * Contrato de ingesta: AC-1..AC-10, features 44 dims, WAV y tabla maestra.
 *
 * Estos tests escriben SOLO en directorios temporales. El dataset real no se toca.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { encodeWav, decodeWav, signalStats, WavError } from '../src/wav.js';
import { resample, fitDuration, targetLength } from '../src/resample.js';
import { extractClipFeatures } from '../src/features.js';
import { aggregateWindow } from '../src/window.js';
import { evaluateClip, evaluateGates, checkFrameContract, energyEnvelope, pearson } from '../src/gates.js';
import { ingestWav } from '../src/ingest.js';
import { DatasetPaths, loadMetadata, loadFeatures, saveMetadata, parseCsv, toCsv, readCsv } from '../src/dataset.js';
import { toneMix, whiteNoise, normalize, nearSilence, clipped, pinkNoise, clipLength } from '../src/synth.js';
import { CLIP_CONTRACT, N_FFT, WINDOW_SCHEMA_V1, FEATURE_SCHEMA_V1, WINDOW_SCHEMA_DIMS, FRAMES_PER_CLIP, FEATURE_SCHEMA_IDS, WINDOW_SCHEMA_IDS } from '../src/constants.js';
import { CAPTURE_DURATION_S, captureChunk, missingCaptureFields, targetCaptureSamples } from '../capture/captureContract.js';

const SR = CLIP_CONTRACT.sampleRate;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const CLI = path.resolve(HERE, '..', 'src', 'cli.js');
const REAL = new DatasetPaths(path.join(REPO_ROOT, 'data', 'datasets', 'sigct_rural_acoustic', 'v1'));

function tmpDataset() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cmsc-logger-test-'));
  const paths = new DatasetPaths(root);
  fs.mkdirSync(paths.metadataDir, { recursive: true });
  fs.mkdirSync(paths.rawDir, { recursive: true });
  fs.mkdirSync(paths.featuresDir, { recursive: true });
  const schema = JSON.parse(fs.readFileSync(REAL.schemaJson, 'utf8'));
  fs.writeFileSync(paths.metadataCsv, `${schema.columns.map((c) => c.name).join(',')}\n`);
  fs.copyFileSync(REAL.labelsCsv, paths.labelsCsv);
  fs.copyFileSync(REAL.schemaJson, paths.schemaJson);
  return { root, paths, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test('validate cuenta los mids AudioSet UNVERIFIED con el campo del contrato', () => {
  const { root, cleanup } = tmpDataset();
  try {
    const result = spawnSync(process.execPath, [CLI, 'validate', '--dataset', root], { encoding: 'utf8' });
    assert.equal(result.status, 1, result.stderr);
    const output = result.stdout.replace(/\u001b\[[0-9;]*m/g, '');
    assert.match(output, /mids_sin_verificar=7/);
    assert.match(output, /FAIL\s+G-DS-1/);
  } finally {
    cleanup();
  }
});

function writeWav(dir, name, samples, sampleRate = SR) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  fs.writeFileSync(file, encodeWav(samples, sampleRate));
  return file;
}

const CTX = {
  session_id: 'test_sesion',
  place_id: 'test_lugar',
  operator_id: 'test_operador',
  annotator_id: 'test_operador',
  device_id: 'test_mic'
};

test('la validacion de captura identifica campos faltantes sin error de referencia', () => {
  const fields = { session: 's1', place: '', operator: 'op1', device: 'mic1' };
  const missing = missingCaptureFields(['session', 'place', 'operator', 'device'], (id) => fields[id]);
  assert.deepEqual(missing, ['place']);
  assert.deepEqual(missingCaptureFields(['session', 'place'], (id) => fields[id] || 'ok'), []);
});

test('la captura se limita exactamente a 3 segundos en tasas nativas comunes', () => {
  assert.equal(CAPTURE_DURATION_S, 3);
  for (const sampleRate of [44100, 48000]) {
    const target = targetCaptureSamples(sampleRate);
    let captured = 0;
    while (captured < target) {
      const chunk = captureChunk(new Float32Array(4096), captured, target);
      assert.ok(chunk.length > 0 && chunk.length <= 4096);
      captured += chunk.length;
    }
    assert.equal(captured, target);
    assert.equal(captureChunk(new Float32Array(4096), captured, target).length, 0);
  }
});

/* ------------------------------------------------------------------- WAV */

test('encodeWav/decodeWav: roundtrip exacto en PCM16 mono', () => {
  const n = clipLength(SR);
  const src = toneMix(n, SR, [{ hz: 1000, amp: 0.5 }]);
  const decoded = decodeWav(encodeWav(src, SR));
  assert.equal(decoded.sampleRate, SR);
  assert.equal(decoded.channels, 1);
  assert.equal(decoded.bitDepth, 16);
  assert.equal(decoded.samples.length, n);
  assert.ok(Math.abs(decoded.durationS - 3) < 1e-6);

  // Tolerancia de cuantizacion PCM16. El codec es asimetrico a proposito (wav.js:139-140):
  // encodea -1,0 como -32768 y +1,0 como 32767 para no desbordar, pero decodea siempre
  // dividiendo entre 32768. El error maximo en el lado positivo es por tanto el redondeo
  // (0,5/32767) mas el sesgo del divisor (1/32768), unos 4,6e-5, no 1 LSB.
  let worst = 0;
  for (let i = 0; i < n; i++) worst = Math.max(worst, Math.abs(decoded.samples[i] - src[i]));
  const bound = 0.5 / 32767 + 1 / 32768;
  assert.ok(worst < bound, `error de cuantizacion ${worst.toExponential(3)} > ${bound.toExponential(3)}`);
  assert.ok(worst < 1e-4, 'el error debe ser despreciable a nivel de feature');
});

test('decodeWav rechaza lo que no es WAV, con motivo', () => {
  assert.throws(() => decodeWav(Buffer.from('no soy un wav')), WavError);
  assert.throws(() => decodeWav(Buffer.alloc(4)), WavError);
  const stereo = encodeWav(new Float64Array(1000), SR);
  const d = decodeWav(stereo);
  assert.equal(d.channels, 1);
});

test('signalStats detecta saturacion y offset DC', () => {
  const clean = toneMix(10000, SR, [{ hz: 440, amp: 0.5 }]);
  assert.ok(signalStats(clean).saturatedRatio === 0, 'un tono al 50% no satura');
  assert.ok(Math.abs(signalStats(clean).dcOffset) < 0.01, 'tono puro no tiene offset DC apreciable');

  const sat = clipped(10000, SR);
  assert.ok(signalStats(sat).saturatedRatio > 0.01, 'el clip saturado debe superar el maximo');

  const dc = new Float64Array(10000).fill(0.3);
  assert.ok(Math.abs(signalStats(dc).dcOffset - 0.3) < 1e-9, 'offset DC debe detectarse');
});

/* -------------------------------------------------------------- resample */

test('resample declara el metodo y preserva la duracion', () => {
  const n = clipLength(48000);
  const src = toneMix(n, 48000, [{ hz: 1000, amp: 0.6 }]);
  for (const method of ['linear', 'cubic']) {
    const out = resample(src, 48000, method);
    assert.equal(out.method, method);
    assert.equal(out.resampled, true);
    assert.equal(out.sourceRate, 48000);
    assert.equal(out.targetRate, SR);
    assert.equal(out.samples.length, targetLength(n, 48000, SR));
    // 3,0 s a 44,1 kHz
    assert.ok(Math.abs(out.samples.length / SR - 3) < 0.001, `${method}: duracion ${out.samples.length / SR}`);
  }
  // Un tono puro a 1 kHz debe seguir siendo un tono puro: peakto-peak comparable.
  const out = resample(src, 48000, 'cubic');
  assert.ok(out.samples.some((v) => v > 0.5), 'cubic debe conservar la amplitud del tono');
});

test('resample a la misma tasa declara none y no toca la senal', () => {
  const src = toneMix(1000, SR, [{ hz: 440, amp: 0.5 }]);
  const out = resample(src, SR, 'cubic');
  assert.equal(out.method, 'none');
  assert.equal(out.resampled, false);
  assert.equal(out.samples, src, 'sin remuestreo debe devolver la misma referencia');
});

test('resample rechaza metodos que Node no puede garantizar', () => {
  const src = new Float64Array(100);
  assert.throws(() => resample(src, 48000, 'soxr_hq'), /no soportado/);
});

test('fitDuration recorta lo largo y marca lo relleno', () => {
  const expected = Math.round(3 * SR);
  const largo = new Float64Array(expected + 5000).fill(0.5);
  const cut = fitDuration(largo, SR);
  assert.equal(cut.samples.length, expected);
  assert.equal(cut.trimmed, true);
  assert.equal(cut.padded, false);
  assert.equal(cut.wasExact, false);

  const corto = new Float64Array(expected - 5000).fill(0.5);
  const pad = fitDuration(corto, SR);
  assert.equal(pad.samples.length, expected);
  assert.equal(pad.padded, true, 'un clip corto debe quedar marcado como rellenado');
});

/* --------------------------------------------------------------- window */

test('aggregateWindow produce 44 dims en el orden aprobado', () => {
  const samples = toneMix(clipLength(SR), SR, [{ hz: 1000, amp: 1 }]);
  const ex = extractClipFeatures(samples, SR, CLIP_CONTRACT.hop, N_FFT);
  const win = aggregateWindow(ex.frames);

  assert.equal(win.values.length, WINDOW_SCHEMA_DIMS);
  assert.equal(WINDOW_SCHEMA_DIMS, 44);
  assert.equal(WINDOW_SCHEMA_V1.length, 44);
  assert.equal(win.named['mean_' + FEATURE_SCHEMA_V1[0]], win.values[0], 'el orden debe ser el del esquema');
  assert.equal(win.named['std_' + FEATURE_SCHEMA_V1[0]], win.values[22], 'los std van detras de todos los mean');

  // Los primeros 22 nombres son mean_*, los ultimos 22 std_*, en el mismo orden interno.
  for (let i = 0; i < 22; i++) {
    assert.ok(win.named[`mean_${FEATURE_SCHEMA_V1[i]}`] !== undefined, `falta mean_${FEATURE_SCHEMA_V1[i]}`);
    assert.ok(win.named[`std_${FEATURE_SCHEMA_V1[i]}`] !== undefined, `falta std_${FEATURE_SCHEMA_V1[i]}`);
  }
  for (const v of win.values) assert.ok(Number.isFinite(v), 'ninguna dim puede ser NaN o Infinity');
});

test('aggregateWindow rechaza una matriz de 22 features (no es ventana)', () => {
  assert.throws(() => aggregateWindow([[0, 1, 2]]), /22|features|dim/i);
});

test('checkFrameContract acepta 63 y rechaza cualquier otra cosa', () => {
  assert.equal(checkFrameContract(63).ok, true);
  assert.equal(checkFrameContract(62).ok, false);
  assert.equal(checkFrameContract(63).esperado, FRAMES_PER_CLIP);
});

/* ------------------------------------------------------------------ AC */

function baseClipArgs(overrides = {}) {
  const n = clipLength(SR);
  const samples = toneMix(n, SR, [{ hz: 1000, amp: 0.6 }]);
  const ex = extractClipFeatures(samples, SR, CLIP_CONTRACT.hop, N_FFT);
  return {
    stored: { sampleRate: SR, channels: 1, bitDepth: 16, durationS: 3 },
    source: { sampleRate: SR, durationS: 3, sampleCount: n },
    fit: { trimmed: false, padded: false, wasExact: true },
    samples,
    sha256: 'a'.repeat(64),
    file: 'raw/agua/x.wav',
    classId: 'agua',
    dirName: 'agua',
    existingSha256: new Set(),
    frames: ex.frames,
    audibleEnergyShare: ex.audibleEnergyShare,
    previousEnvelopes: [],
    ...overrides
  };
}

const checkOf = (res, id) => res.checks.find((c) => c.id === id);

test('un clip valido se acepta con las 10 comprobaciones en verde', () => {
  const res = evaluateClip(baseClipArgs());
  assert.equal(res.verdict, 'accepted', `fallos: ${res.failed?.map((f) => f.id).join(',')}`);
  assert.equal(res.checks.length, 10, 'AC-1..AC-10');
  for (const c of res.checks) assert.ok(c.ok, `${c.id} fallo: ${c.detail}`);
});

test('AC-1 acepta 48 kHz de entrada si el remuestreo esta declarado', () => {
  const res = evaluateClip(baseClipArgs({ source: { sampleRate: 48000, durationS: 3, sampleCount: 144000 } }));
  assert.equal(checkOf(res, 'AC-1').ok, true, 'una captura de navegador a 48 kHz es legitima si se remuestrea');
  assert.match(checkOf(res, 'AC-1').detail, /DECLARADO 48000 -> 44100/);
});

test('AC-3 rechaza un clip relleno con ceros aunque mida 3,0 s', () => {
  const res = evaluateClip(baseClipArgs({ fit: { trimmed: false, padded: true, wasExact: false } }));
  assert.equal(checkOf(res, 'AC-3').ok, false);
  assert.equal(res.verdict, 'quarantine');
  assert.match(checkOf(res, 'AC-3').detail, /RELLENADO/);
});

test('AC-3 rechaza cuando la fuente y el destino discrepan mas de 1 ms', () => {
  const res = evaluateClip(baseClipArgs({ source: { sampleRate: SR, durationS: 2.5, sampleCount: Math.round(2.5 * SR) } }));
  assert.equal(checkOf(res, 'AC-3').ok, false);
});

test('AC-3 rechaza muestras fuente inexactas y artefactos recortados', () => {
  const n = clipLength(SR);
  const inexactSource = evaluateClip(baseClipArgs({ source: { sampleRate: SR, durationS: (n - 1) / SR, sampleCount: n - 1 } }));
  assert.equal(checkOf(inexactSource, 'AC-3').ok, false);

  const trimmed = evaluateClip(baseClipArgs({ fit: { trimmed: true, padded: false, wasExact: false } }));
  assert.equal(checkOf(trimmed, 'AC-3').ok, false);
});

test('AC-2 rechaza multicanal, AC-4 rechaza otro bit depth', () => {
  assert.equal(checkOf(evaluateClip(baseClipArgs({
    stored: { sampleRate: SR, channels: 2, bitDepth: 16, durationS: 3 }
  })), 'AC-2').ok, false);
  assert.equal(checkOf(evaluateClip(baseClipArgs({
    stored: { sampleRate: SR, channels: 1, bitDepth: 24, durationS: 3 }
  })), 'AC-4').ok, false);
});

test('AC-5 rechaza el casi-silencio y AC-6 la saturacion', () => {
  const n = clipLength(SR);
  const exQ = extractClipFeatures(nearSilence(n), SR, CLIP_CONTRACT.hop, N_FFT);
  const q = evaluateClip(baseClipArgs({ samples: nearSilence(n), frames: exQ.frames, audibleEnergyShare: exQ.audibleEnergyShare }));
  assert.equal(checkOf(q, 'AC-5').ok, false);
  assert.equal(q.verdict, 'quarantine');

  const sat = clipped(n, SR);
  const exS = extractClipFeatures(sat, SR, CLIP_CONTRACT.hop, N_FFT);
  const s = evaluateClip(baseClipArgs({ samples: sat, frames: exS.frames, audibleEnergyShare: exS.audibleEnergyShare }));
  assert.equal(checkOf(s, 'AC-6').ok, false);
  assert.equal(s.verdict, 'quarantine');
});

test('AC-7 acepta ruido rosa (pico real en 15,7 Hz) y rechaza energia solo no audible', () => {
  const n = clipLength(SR);
  const rosa = normalize(pinkNoise(n), 0.6);
  const ex = extractClipFeatures(rosa, SR, CLIP_CONTRACT.hop, N_FFT);
  const res = evaluateClip(baseClipArgs({ samples: rosa, frames: ex.frames, audibleEnergyShare: ex.audibleEnergyShare }));
  assert.equal(checkOf(res, 'AC-7').ok, true, `ruido rosa rechazado: ${checkOf(res, 'AC-7').detail}`);

  // 5 Hz queda por debajo de AUDIBLE_MIN_HZ (20 Hz) y por tanto fuera de la banda.
  // Se usa una subarmonica y NO un tono de 23 kHz: a 44,1 kHz el Nyquist es 22,05 kHz, asi
  // que 23 kHz se ALIASEA a 21,1 kHz y entra de nuevo en banda. Seria un test que pasa
  // por la razon contraria a la que quiere comprobar.
  const subarmonica = toneMix(n, SR, [{ hz: 5, amp: 1 }]);
  const exU = extractClipFeatures(subarmonica, SR, CLIP_CONTRACT.hop, N_FFT);
  const rU = evaluateClip(baseClipArgs({ samples: subarmonica, frames: exU.frames, audibleEnergyShare: exU.audibleEnergyShare }));
  assert.equal(checkOf(rU, 'AC-7').ok, false, `energia solo bajo 20 Hz no es audio audible: ${checkOf(rU, 'AC-7').detail}`);
});

test('AC-7 rechaza un offset DC grande aunque la senal sea audible', () => {
  const n = clipLength(SR);
  const conDC = toneMix(n, SR, [{ hz: 1000, amp: 0.4 }]);
  for (let i = 0; i < n; i++) conDC[i] += 0.15;
  const ex = extractClipFeatures(conDC, SR, CLIP_CONTRACT.hop, N_FFT);
  const res = evaluateClip(baseClipArgs({ samples: conDC, frames: ex.frames, audibleEnergyShare: ex.audibleEnergyShare }));
  assert.equal(checkOf(res, 'AC-7').ok, false, 'una ganancia mal puesta deja DC y no es audio limpio');
  assert.match(checkOf(res, 'AC-7').detail, /offset_dc/);
});

test('AC-8 rechaza sha256 duplicado con veredicto rejected, no quarantine', () => {
  const sha = 'b'.repeat(64);
  const res = evaluateClip(baseClipArgs({ sha256: sha, existingSha256: new Set([sha]) }));
  assert.equal(checkOf(res, 'AC-8').ok, false);
  assert.equal(res.verdict, 'rejected');
});

test('AC-9 es provisional sin referencias y bloquea con casi-duplicado', () => {
  const ex = extractClipFeatures(toneMix(clipLength(SR), SR, [{ hz: 1000, amp: 1 }]), SR, CLIP_CONTRACT.hop, N_FFT);
  const sinRef = evaluateClip(baseClipArgs({ frames: ex.frames }));
  assert.equal(checkOf(sinRef, 'AC-9').ok, true);
  assert.match(checkOf(sinRef, 'AC-9').detail, /PROVISIONAL/, 'debe declarar que no es una verificacion');

  // Mismo clip de nuevo: sobre identico -> correlacion 1.0 > 0.98
  const duplicado = evaluateClip(baseClipArgs({ frames: ex.frames, previousEnvelopes: [energyEnvelope(ex.frames)] }));
  assert.equal(checkOf(duplicado, 'AC-9').ok, false, 'un sobre identico debe rechazarse');
});

test('AC-10 exige que la carpeta corresponda a la clase', () => {
  const res = evaluateClip(baseClipArgs({ file: 'raw/ave/x.wav', classId: 'agua', dirName: 'agua' }));
  assert.equal(checkOf(res, 'AC-10').ok, false);
});

test('pearson devuelve 0 ante series constantes, no NaN', () => {
  assert.equal(pearson([1, 1, 1], [1, 2, 3]), 0);
  assert.equal(pearson([], []), 0);
  assert.ok(Math.abs(pearson([1, 2, 3], [2, 4, 6]) - 1) < 1e-12);
});

test('G-DS-6 queda PENDING sin etiquetas individuales para Cohen kappa', () => {
  const row = { ingest_status: 'accepted', qc_status: 'pass', agreement: 'double_reviewed_agree' };
  const pending = evaluateGates({ rows: [row], kappaByClass: null }).find((gate) => gate.id === 'G-DS-6');
  assert.equal(pending.veredicto, 'PENDING');
  assert.match(pending.bloqueantes.join(' '), /Cohen kappa no calculable/);

  const measured = evaluateGates({ rows: [row], kappaByClass: { agua: 0.75 } }).find((gate) => gate.id === 'G-DS-6');
  assert.equal(measured.veredicto, 'PASS');
});

/* -------------------------------------------------------------- ingesta */

test('ingest escribe WAV, fila y 44 features para un clip valido', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const wav = writeWav(path.join(root, 'in'), 'clip.wav', toneMix(clipLength(SR), SR, [{ hz: 1000, amp: 0.6 }]));
    const res = ingestWav({ datasetRoot: root, paths, wavPath: wav, classId: 'agua', ctx: CTX });

    assert.equal(res.verdict, 'accepted', `fallos: ${res.failed.map((f) => f.id).join(',')}`);
    assert.ok(fs.existsSync(res.wavPath), 'el WAV debe estar escrito');

    const { header, rows } = loadMetadata(paths);
    assert.equal(rows.length, 1);
    assert.equal(header.length, 42, 'la cabecera debe tener las 42 columnas del esquema');
    const row = rows[0];
    assert.equal(row.class_id, 'agua');
    assert.equal(row.partition, 'unassigned');
    assert.equal(row.ingest_status, 'accepted');
    assert.equal(row.qc_status, 'pass');
    assert.equal(row.sample_rate, '44100');
    assert.equal(row.channels, '1');
    assert.equal(row.bit_depth, '16');
    assert.equal(row.operator_id, 'test_operador', 'operator_id es obligatoria (H-1)');
    assert.equal(row.capture_source_rate, '44100');
    assert.equal(row.resample_method, 'none');
    assert.equal(row.license, 'PROPIO');
    assert.equal(row.source, 'cmsc_logger');
    assert.equal(row.frames_count, '63');
    assert.equal(row.feature_schema, 'acoustic.feat.v2', 'el logger sella v2 por defecto (decision 2026-10-05)');
    assert.equal(row.window_schema, 'acoustic.feat.window.v2');
    assert.ok(/^ac_\d{8}_\d{6}_\d{3}$/.test(row.sample_id), `sample_id con mal formato: ${row.sample_id}`);
    assert.ok(row.split_group_key.includes('|'), 'split_group_key debe agrupar por sesion|lugar');
    assert.ok(row.timestamp.length >= 19, 'timestamp ISO-8601');

    const feats = loadFeatures(paths, FEATURE_SCHEMA_IDS.V2);
    assert.equal(feats.size, 1);
    const f = [...feats.values()][0];
    assert.equal(f.window_schema, 'acoustic.feat.window.v2');
    assert.equal(f.frame_count, '63');
    for (const key of WINDOW_SCHEMA_V1) {
      assert.ok(Number.isFinite(Number(f[key])), `${key} no es numerico`);
    }
  } finally {
    cleanup();
  }
});

test('ingest conserva WAV distintos con el mismo nombre base', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const firstInput = writeWav(path.join(root, 'in-a'), 'same.wav', toneMix(clipLength(SR), SR, [{ hz: 900, amp: 0.6 }]));
    const secondInput = writeWav(path.join(root, 'in-b'), 'same.wav', toneMix(clipLength(SR), SR, [{ hz: 1700, amp: 0.6 }]));
    const first = ingestWav({ datasetRoot: root, paths, wavPath: firstInput, classId: 'agua', ctx: CTX });
    const second = ingestWav({ datasetRoot: root, paths, wavPath: secondInput, classId: 'agua', ctx: CTX });

    assert.equal(first.verdict, 'accepted');
    assert.equal(second.verdict, 'accepted');
    assert.notEqual(first.row.file, second.row.file);
    for (const result of [first, second]) {
      const stored = fs.readFileSync(result.wavPath);
      assert.equal(crypto.createHash('sha256').update(stored).digest('hex'), result.row.sha256);
    }
    assert.equal(loadMetadata(paths).rows.length, 2);
  } finally {
    cleanup();
  }
});

test('el sha256 registrado es el del artefacto escrito, no el del entrante', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    // 48 kHz: obliga a remuestrear, luego el WAV escrito difiere del fichero de entrada.
    const wav = writeWav(path.join(root, 'in'), 'clip48.wav', toneMix(clipLength(48000), 48000, [{ hz: 1000, amp: 0.6 }]), 48000);
    const res = ingestWav({ datasetRoot: root, paths, wavPath: wav, classId: 'agua', ctx: CTX, resampleMethod: 'cubic' });
    assert.equal(res.verdict, 'accepted');

    const written = fs.readFileSync(res.wavPath);
    const actual = readCsv(paths.metadataCsv)[0].sha256;
    const hashOfWritten = crypto.createHash('sha256').update(written).digest('hex');
    assert.equal(actual, hashOfWritten, 'metadata.csv debe holdar el WAV que esta en disco');

    const checksums = fs.readFileSync(paths.checksums, 'utf8');
    assert.ok(checksums.includes(hashOfWritten), 'CHECKSUMS.sha256 debe contener el mismo hash');
    assert.equal(res.row.capture_source_rate, '48000', 'la tasa nativa queda declarada');
    assert.equal(res.row.resample_method, 'cubic');
  } finally {
    cleanup();
  }
});

test('dry-run no escribe nada', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const wav = writeWav(path.join(root, 'in'), 'clip.wav', toneMix(clipLength(SR), SR, [{ hz: 1000, amp: 0.6 }]));
    const before = fs.readFileSync(paths.metadataCsv, 'utf8');
    const res = ingestWav({ datasetRoot: root, paths, wavPath: wav, classId: 'agua', ctx: CTX, dryRun: true });

    assert.equal(res.dryRun, true);
    assert.equal(res.verdict, 'accepted');
    assert.equal(res.features44, 44);
    assert.ok(res.featurePreview, 'debe previsualizar features sin escribir');
    assert.equal(fs.readFileSync(paths.metadataCsv, 'utf8'), before, 'metadata.csv intacto');
    assert.equal(loadFeatures(paths).size, 0, 'features intactas');
    assert.ok(!fs.existsSync(path.join(root, 'raw', 'agua', 'clip.wav')), 'el WAV no debe copiarse');
  } finally {
    cleanup();
  }
});

test('un clip relleno con ceros se pone en cuarentena y queda registrado', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    // 2,0 s en un WAV de 44,1 kHz: se rellena a 3,0 s y debe quedar marcado.
    const wav = writeWav(path.join(root, 'in'), 'corto.wav', toneMix(Math.round(2 * SR), SR, [{ hz: 1000, amp: 0.6 }]));
    const res = ingestWav({ datasetRoot: root, paths, wavPath: wav, classId: 'agua', ctx: CTX });

    assert.equal(res.verdict, 'quarantine');
    const { rows } = loadMetadata(paths);
    assert.equal(rows.length, 1, 'NADA DESAPARECE: la fila se escribe igual');
    assert.equal(rows[0].ingest_status, 'quarantine');
    assert.equal(rows[0].qc_status, 'quarantine');
    const schema = JSON.parse(fs.readFileSync(paths.schemaJson, 'utf8'));
    const ingestStatus = schema.columns.find((column) => column.name === 'ingest_status');
    const qcStatus = schema.columns.find((column) => column.name === 'qc_status');
    assert.ok(ingestStatus.values.includes(rows[0].ingest_status));
    assert.ok(qcStatus.values.includes(rows[0].qc_status));
    assert.match(rows[0].notes, /AC fallidos/);
  } finally {
    cleanup();
  }
});

test('ingersionar dos veces el mismo WAV se marca rejected por duplicado', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const wav = writeWav(path.join(root, 'in'), 'clip.wav', toneMix(clipLength(SR), SR, [{ hz: 1000, amp: 0.6 }]));
    const first = ingestWav({ datasetRoot: root, paths, wavPath: wav, classId: 'agua', ctx: CTX });
    assert.equal(first.verdict, 'accepted');
    const second = ingestWav({ datasetRoot: root, paths, wavPath: wav, classId: 'agua', ctx: CTX });
    assert.equal(second.verdict, 'rejected');
    assert.equal(checkOf(second, 'AC-8').ok, false);
  } finally {
    cleanup();
  }
});

test('ingersionar un fichero que no es WAV se rechaza sin escribir fila', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const bad = path.join(root, 'in', 'malo.wav');
    fs.mkdirSync(path.dirname(bad), { recursive: true });
    fs.writeFileSync(bad, 'esto no es un wav');
    const res = ingestWav({ datasetRoot: root, paths, wavPath: bad, classId: 'agua', ctx: CTX });
    assert.equal(res.verdict, 'rejected');
    assert.equal(res.wroteNothing, true);
    assert.equal(loadMetadata(paths).rows.length, 0, 'un fichero no decodificable no es una muestra');
  } finally {
    cleanup();
  }
});

test('sample_id se renumera dentro del mismo segundo en vez de colisionar', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const ts = '2026-10-04T10:00:00+00:00';
    const a = writeWav(path.join(root, 'in'), 'a.wav', toneMix(clipLength(SR), SR, [{ hz: 1000, amp: 0.6 }]));
    const b = writeWav(path.join(root, 'in'), 'b.wav', toneMix(clipLength(SR), SR, [{ hz: 1200, amp: 0.6 }]));

    const ra = ingestWav({ datasetRoot: root, paths, wavPath: a, classId: 'agua', ctx: { ...CTX, timestamp: ts } });
    const rb = ingestWav({ datasetRoot: root, paths, wavPath: b, classId: 'agua', ctx: { ...CTX, timestamp: ts } });

    assert.notEqual(ra.sample_id, rb.sample_id, 'dos capturas en el mismo segundo no comparten id');
    assert.match(ra.sample_id, /_000$/);
    assert.match(rb.sample_id, /_001$/);
    assert.equal(loadMetadata(paths).rows.length, 2);
  } finally {
    cleanup();
  }
});

test('reingerar con el MISMO sample_id actualiza en vez de duplicar', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const wav = writeWav(path.join(root, 'in'), 'clip.wav', toneMix(clipLength(SR), SR, [{ hz: 1000, amp: 0.6 }]));
    const id = 'ac_20261004_100000_042';
    const a = ingestWav({ datasetRoot: root, paths, wavPath: wav, classId: 'agua', ctx: { ...CTX, sample_id: id } });
    const b = ingestWav({ datasetRoot: root, paths, wavPath: wav, classId: 'agua', ctx: { ...CTX, sample_id: id, notes: 'revisado' } });

    assert.equal(a.sample_id, id);
    assert.equal(b.sample_id, id);
    assert.equal(a.metadataAction, 'inserted');
    assert.equal(b.metadataAction, 'updated');
    assert.equal(b.featureAction, 'updated');
    assert.equal(loadMetadata(paths).rows.length, 1, 'no debe duplicar la fila');
    assert.match(loadMetadata(paths).rows[0].notes, /^revisado/, 'la segunda pasada debe ganar');
    assert.equal(loadFeatures(paths).size, 1);
  } finally {
    cleanup();
  }
});

test('una clase con carpeta propia (ruido_desconocido -> desconocido) se enruta bien', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const wav = writeWav(path.join(root, 'in'), 'x.wav', toneMix(clipLength(SR), SR, [{ hz: 3000, amp: 0.6 }]));
    const res = ingestWav({ datasetRoot: root, paths, wavPath: wav, classId: 'ruido_desconocido', ctx: CTX });
    assert.ok(res.row.file.startsWith('raw/desconocido/'), `ruta inesperada: ${res.row.file}`);
    assert.equal(checkOf(res, 'AC-10').ok, true);
  } finally {
    cleanup();
  }
});

/* ------------------------------------------------------------------ CSV */

test('toCsv escapa comas, comillas y saltos de linea', () => {
  const rows = [
    ['a', 'b', 'c'],
    ['con,coma', 'con"comilla', 'con\nnueva']
  ];
  const text = toCsv(rows);
  const back = parseCsv(text);
  assert.deepEqual(back[1], ['con,coma', 'con"comilla', 'con\nnueva']);
});

test('saveMetadata conserva comas en notes al releer', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const { header } = loadMetadata(paths);
    const row = {};
    for (const h of header) row[h] = '';
    row.sample_id = 'ac_20261004_100000_000';
    row.notes = 'ruido de tractor, a 30 m de la colmena';
    saveMetadata(paths, header, [row]);
    const reread = loadMetadata(paths);
    assert.equal(reread.rows[0].notes, row.notes);
  } finally {
    cleanup();
  }
});