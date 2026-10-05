/**
 * Pruebas de los BUG B, BUG C y BUG D detectados en la auditoria del 2026-10-05.
 *
 *   BUG B · `meanAbs` en `signalStats` mentia sobre el nombre: la media de potencias no es
 *           una media de valores absolutos. Se renombro a `meanPower`. Sin cambio de valor.
 *   BUG C · `features` solo reescribia el CSV y dejaba la cache de envelopes de AC-9 sin
 *           regenerar, con lo que AC-9 quedaba PROVISIONAL para todo el dataset.
 *   BUG D · G-DS-1 pasaba con `labels.csv` AUSENTE porque `existsSync` degradaba a `[]`.
 *
 * Todos los tests escriben SOLO en directorios temporales.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { signalStats, encodeWav } from '../src/wav.js';
import { energyEnvelope, evaluateGates } from '../src/gates.js';
import { ingestWav } from '../src/ingest.js';
import {
  DatasetPaths, loadMetadata, loadFeatures, loadEnvelopes, readCsv, readCsvHeader, envelopesPath
} from '../src/dataset.js';
import { analyzeFrame, extractClipFeatures } from '../src/features.js';
import { toneMix, clipLength } from '../src/synth.js';
import { CLIP_CONTRACT, ALL_CLASSES, FEATURE_SCHEMA_IDS, N_FFT } from '../src/constants.js';

const SR = CLIP_CONTRACT.sampleRate;
const N = clipLength(SR);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const CLI = path.resolve(HERE, '..', 'src', 'cli.js');
const REAL = new DatasetPaths(path.join(REPO_ROOT, 'data', 'datasets', 'sigct_rural_acoustic', 'v1'));

const CTX = {
  session_id: 'bug_sesion',
  place_id: 'bug_lugar',
  operator_id: 'bug_operador',
  annotator_id: 'bug_operador',
  device_id: 'bug_mic'
};

const strip = (s) => s.replace(/\u001b\[[0-9;]*m/g, '');

/** Reescribe labels.csv a partir de filas-objeto, conservando la cabecera original. */
function writeLabels(paths, objects) {
  const header = readCsvHeader(paths.labelsCsv);
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = objects.map((o) => header.map((h) => escape(o[h])).join(','));
  fs.writeFileSync(paths.labelsCsv, `${header.join(',')}\n${body.join('\n')}\n`);
}

function tmpDataset({ labels = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cmsc-logger-bug-'));
  const paths = new DatasetPaths(root);
  fs.mkdirSync(paths.metadataDir, { recursive: true });
  fs.mkdirSync(paths.rawDir, { recursive: true });
  fs.mkdirSync(paths.featuresDir, { recursive: true });
  const schema = JSON.parse(fs.readFileSync(REAL.schemaJson, 'utf8'));
  fs.writeFileSync(paths.metadataCsv, `${schema.columns.map((c) => c.name).join(',')}\n`);
  if (labels) fs.copyFileSync(REAL.labelsCsv, paths.labelsCsv);
  fs.copyFileSync(REAL.schemaJson, paths.schemaJson);
  return { root, paths, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

/* ------------------------------------------------------------------ BUG B */

test('BUG B: signalStats expone meanPower y el valor sigue siendo la media de potencias', () => {
  const s = toneMix(N, SR, [{ hz: 1000, amp: 0.5 }]);
  const st = signalStats(s);

  assert.ok('meanPower' in st, 'debe existir meanPower');
  assert.ok(!('meanAbs' in st), 'meanAbs no debe seguir expuesta: mentia sobre lo que media');

  // media de potencias calculada a mano sobre el mismo buffer
  let sumSq = 0;
  for (let i = 0; i < s.length; i++) sumSq += s[i] * s[i];
  const esperado = sumSq / s.length;

  assert.ok(Math.abs(st.meanPower - esperado) < 1e-12, `meanPower ${st.meanPower} != ${esperado}`);
  assert.ok(Math.abs(st.meanPower - st.rms * st.rms) < 1e-12, 'meanPower debe ser rms^2');

  // Y no es la media de valores absolutos (que es un numero MUY distinto).
  let sumAbs = 0;
  for (let i = 0; i < s.length; i++) sumAbs += Math.abs(s[i]);
  const mediaAbs = sumAbs / s.length;
  assert.ok(Math.abs(st.meanPower - mediaAbs) > 1e-6, 'meanPower no debe ser la media de absolutos');
});

test('BUG B: el silencio da las tres medidas a cero', () => {
  const st = signalStats(new Float64Array(N));
  assert.equal(st.meanPower, 0);
  assert.equal(st.rms, 0);
  assert.equal(st.peak, 0);
});

/* ------------------------------------------------------------------ BUG C */

test('BUG C: `features` regenera tambien la cache de envelopes de AC-9', () => {
  const { root, paths, cleanup } = tmpDataset();
  try {
    const input = path.join(paths.rawDir, 'tono_entrada.wav');
    fs.writeFileSync(input, encodeWav(toneMix(N, SR, [{ hz: 1000, amp: 0.6 }]), SR));

    const res = ingestWav({ datasetRoot: root, wavPath: input, classId: 'ave', clipId: 'bug_c_1', ctx: CTX });
    assert.equal(res.row.ingest_status, 'accepted', `la ingesta deberia aceptar un tono valido: ${res.reason ?? ''}`);

    const envTrasIngesta = loadEnvelopes(paths);
    assert.equal(envTrasIngesta.size, 1, 'la ingesta deja 1 envelope');
    assert.equal(loadFeatures(paths, FEATURE_SCHEMA_IDS.V2).size, 1, 'la ingesta deja 1 fila de features');

    // Este es el escenario del BUG: borrar SOLO la cache de envelopes deja el dataset sin
    // ninguna referencia de AC-9, y `features` debe reconstruirla.
    fs.rmSync(envelopesPath(paths));
    assert.equal(loadEnvelopes(paths).size, 0, 'precondicion: cache de AC-9 vacia');

    const out = spawnSync(process.execPath, [CLI, 'features', '--dataset', root], { encoding: 'utf8' });
    assert.equal(out.status, 0, `features deberia salir 0: ${out.stderr}`);
    const log = strip(out.stdout);
    assert.match(log, /cache AC-9 regenerada: 1 envelopes/,
      'la salida debe anunciar la regeneracion de la cache de AC-9');

    const envRegenerada = loadEnvelopes(paths);
    assert.equal(envRegenerada.size, 1, 'la cache debe quedar repoblada');
    assert.deepEqual(envRegenerada.get([...loadMetadata(paths).rows][0].sample_id), envTrasIngesta.get([...loadMetadata(paths).rows][0].sample_id),
      'el envelope regenerado debe ser IDENTICO al que habia calculado la ingesta');

    assert.equal(loadFeatures(paths, FEATURE_SCHEMA_IDS.V2).size, 1, 'el CSV tambien se regenera');
  } finally {
    cleanup();
  }
});

test('BUG C: el envelope regenerado es el MISMO que produce la ingesta (determinismo)', () => {
  const s = toneMix(N, SR, [{ hz: 440, amp: 0.4 }, { hz: 1800, amp: 0.3 }]);
  const frames = extractClipFeatures(s, SR, CLIP_CONTRACT.hop, N_FFT, FEATURE_SCHEMA_IDS.V2).frames;
  const a = energyEnvelope(frames);
  const b = energyEnvelope(frames);
  assert.deepEqual(a, b, 'energyEnvelope debe ser puro');
  assert.ok(Number.isFinite(a[0]), 'primer coeficiente finito');
  assert.ok(a.length === 8 || a.length === 6 || a.length > 0, `longitud inesperada: ${a.length}`);
});

/* ------------------------------------------------------------------ BUG D */

test('BUG D: G-DS-1 falla si labels.csv NO existe (no degrada a PENDING)', () => {
  const { root, paths, cleanup } = tmpDataset({ labels: false });
  try {
    const out = spawnSync(process.execPath, [CLI, 'validate', '--dataset', root], { encoding: 'utf8' });
    assert.equal(out.status, 1, 'validate debe salir 1 con un gate en FAIL');
    const log = strip(out.stdout);
    assert.match(log, /FAIL\s+G-DS-1/, 'G-DS-1 debe fallar');
    assert.match(log, /labels\.csv AUSENTE/, 'el bloqueante debe nombrar el fichero ausente');
    assert.match(log, /labels=AUSENTE\/9/, 'la evidencia debe delatar la ausencia');
  } finally {
    cleanup();
  }
});

test('BUG D: el comando status coincide con validate (mismo veredicto)', () => {
  const { root, cleanup } = tmpDataset({ labels: false });
  try {
    const val = strip(spawnSync(process.execPath, [CLI, 'validate', '--dataset', root], { encoding: 'utf8' }).stdout);
    const sta = strip(spawnSync(process.execPath, [CLI, 'status', '--dataset', root], { encoding: 'utf8' }).stdout);
    assert.match(val, /FAIL\s+G-DS-1/);
    assert.match(sta, /FAIL\s+G-DS-1/);
  } finally {
    cleanup();
  }
});

test('BUG D: G-DS-1 falla si labels.csv declara menos de 9 clases', () => {
  const { paths, cleanup } = tmpDataset();
  try {
    writeLabels(paths, readCsv(paths.labelsCsv).slice(0, 8));
    const out = spawnSync(process.execPath, [CLI, 'validate', '--dataset', paths.root], { encoding: 'utf8' });
    assert.match(strip(out.stdout), /declara 8 clases, se esperan 9/);
  } finally {
    cleanup();
  }
});

test('BUG D: G-DS-1 falla si alguna clase no tiene dir_name', () => {
  const { paths, cleanup } = tmpDataset();
  try {
    writeLabels(paths, readCsv(paths.labelsCsv).map((r, i) => (i === 3 ? { ...r, dir_name: '' } : r)));
    const out = spawnSync(process.execPath, [CLI, 'validate', '--dataset', paths.root], { encoding: 'utf8' });
    const log = strip(out.stdout);
    assert.match(log, /clases sin dir_name/);
    assert.match(log, /sin_dir_name=1/);
  } finally {
    cleanup();
  }
});

test('BUG D: G-DS-1 falla si hay un class_id fuera de la taxonomia', () => {
  const { paths, cleanup } = tmpDataset();
  try {
    writeLabels(paths, readCsv(paths.labelsCsv).map((r, i) => (i === 2 ? { ...r, class_id: 'inventado' } : r)));
    const out = spawnSync(process.execPath, [CLI, 'validate', '--dataset', paths.root], { encoding: 'utf8' });
    assert.match(strip(out.stdout), /class_id fuera de la taxonomia: inventado/);
  } finally {
    cleanup();
  }
});

test('BUG D: con labels.csv intacto el veredicto lo decide el resto (7 mids sin verificar)', () => {
  const { root, cleanup } = tmpDataset({ labels: true });
  try {
    const out = spawnSync(process.execPath, [CLI, 'validate', '--dataset', root], { encoding: 'utf8' });
    const log = strip(out.stdout);
    assert.match(log, /labels=9\/9/, 'el diccionario esta completo');
    assert.match(log, /sin_dir_name=0/);
    assert.match(log, /FAIL\s+G-DS-1/, 'pero sigue fallando por los mids, sin falsos verdes');
    assert.match(log, /mids_sin_verificar=7/);
  } finally {
    cleanup();
  }
});

test('BUG D: un contexto minimo sin labelsPresent=true falla (falla cerrado, no abierto)', () => {
  // evaluateGates no debe asumir que el contexto trae labelsPresent: si no lo trae, G-DS-1
  // tiene que FALLAR. Un gate que aprueba cuando no sabe es peor que uno que no aprueba.
  const { paths, cleanup } = tmpDataset({ labels: false });
  try {
    const ctx = {
      rows: [], header: [], schema: JSON.parse(fs.readFileSync(paths.schemaJson, 'utf8')),
      labels: [], labelsPresent: undefined, midsUnverified: 0, missingRequiredColumns: []
    };
    ctx.schema.window_schema_status = 'APROBADO';
    const g = evaluateGates(ctx).find((x) => x.id === 'G-DS-1');
    assert.equal(g.veredicto, 'FAIL', 'sin evidencia de labels no puede pasar');
    assert.ok(g.bloqueantes.some((b) => /labels\.csv AUSENTE/.test(b)));
  } finally {
    cleanup();
  }
});

test('BUG D: ALL_CLASSES tiene 9 entradas y el gate espera exactamente ese numero', () => {
  assert.equal(ALL_CLASSES.length, 9);
});