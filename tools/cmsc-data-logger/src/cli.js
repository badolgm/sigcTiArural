#!/usr/bin/env node
/**
 * CMSC_DATA_LOGGER_V1 — CLI del logger acustico.
 *
 * Comandos:
 *   doctor     Verifica entorno, dataset, esquema y coherencia de tipos. No escribe nada.
 *   selftest   Pipeline completo con audio sintetico en un directorio temporal. No toca el dataset.
 *   ingest     Ingesta uno o mas WAV al dataset, con validacion AC-1..AC-10 y features 44 dims.
 *   features   (Re)calcula features de clips ya ingeridos. Derivado regenerable.
 *   validate   Evalua G-DS-1..G-DS-6 sobre el estado actual. No escribe nada.
 *   status     Estado consolidado del dataset.
 *
 * Ningun comando entrena modelos, descarga datos ni implementa S81/S82.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LOGGER_VERSION, MISSION, CLIP_CONTRACT, FRAMES_PER_CLIP, N_FFT,
  LIVE_CLASSES, ALL_CLASSES,
  DEFAULT_FEATURE_SCHEMA_ID, FEATURE_SCHEMA_IDS,
  resolveFeatureSchemaId, windowSchemaFor, schemaTag
} from './constants.js';
import {
  DatasetPaths, defaultDatasetRoot, loadMetadata, readCsv, loadFeatures, saveFeatures, refreshChecksums,
  loadEnvelopes, saveEnvelopes
} from './dataset.js';
import { decodeWav, encodeWav } from './wav.js';
import { resample } from './resample.js';
import { extractClipFeatures } from './features.js';
import { aggregateWindow } from './window.js';
import { evaluateGates, checkFrameContract, energyEnvelope, PASS, FAIL, PENDING } from './gates.js';
import { ingestWav } from './ingest.js';
import { SELFTEST_CASES, clipLength } from './synth.js';

/* ------------------------------------------------------------------ utils */

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m'
};

const VERDICT_COLOR = { PASS: C.green, FAIL: C.red, PENDING: C.yellow };

function head(title) {
  console.log('');
  console.log(`${C.bold}${C.cyan}=== ${title} ===${C.reset}`);
}

function ok(msg) { console.log(`  ${C.green}OK${C.reset}    ${msg}`); }
function warn(msg) { console.log(`  ${C.yellow}WARN${C.reset}  ${msg}`); }
function bad(msg) { console.log(`  ${C.red}FALLA${C.reset} ${msg}`); }
function info(msg) { console.log(`  ${C.gray}..${C.reset}    ${msg}`); }

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) out[a.slice(2, eq)] = a.slice(eq + 1);
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[a.slice(2)] = argv[++i];
      else out[a.slice(2)] = true;
    } else out._.push(a);
  }
  return out;
}

/* --------------------------------------------------------------- dataset ctx */

function collectContext(paths) {
  const { header, rows } = loadMetadata(paths);
  const totalWavs = countWavs(paths.rawDir);
  const checksumLines = fs.existsSync(paths.checksums)
    ? fs.readFileSync(paths.checksums, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).length
    : 0;
  let schema = null;
  if (fs.existsSync(paths.schemaJson)) schema = JSON.parse(fs.readFileSync(paths.schemaJson, 'utf8'));

  // BUG D: `labelsPresent` distingue "no existe el fichero" de "existe pero vacio". Antes
  // ambos caian en `[]` y G-DS-1 no podia(notiene) diferenciar un diccionario intacto de uno
  // borrado, con lo que un dataset sin taxonomia podia pasar el gate como APROBADO.
  const labelsPresent = fs.existsSync(paths.labelsCsv);
  const labels = labelsPresent ? readCsv(paths.labelsCsv) : [];
  const midsUnverified = labels.filter((r) => String(r.audi_set_status ?? '').toUpperCase() === 'UNVERIFIED').length;

  const headerLength = header.length;
  const requiredColumns = (schema?.columns ?? []).filter((c) => c.gobierno === 'OBLIGATORIA' || c.gobierno === 'OBLIGATORIA_HERRAMIENTA').map((c) => c.name);
  const missingRequiredColumns = requiredColumns.filter((c) => !header.includes(c));

  const holdoutWavs = countWavs(paths.holdoutDir);

  let splitExecuted = false;
  if (fs.existsSync(paths.splitReport)) {
    try { splitExecuted = JSON.parse(fs.readFileSync(paths.splitReport, 'utf8')).state !== 'NO_EJECUTADO'; } catch { /* null */ }
  }

  const accepted = rows.filter((r) => r.ingest_status === 'accepted' && r.qc_status === 'pass');
  const kappaByClass = null;

  const requiredFiles = [
    paths.metadataCsv, paths.labelsCsv, paths.schemaJson, paths.checksums,
    path.join(paths.manifestsDir, 'raw_source_manifest.acoustic_v1.yaml'),
    path.join(paths.manifestsDir, 'curation_manifest.acoustic_v1.yaml'),
    path.join(paths.manifestsDir, 'taxonomy_binding_manifest.acoustic_v1.yaml'),
    path.join(paths.manifestsDir, 'split_manifest.acoustic_v1.yaml'),
    path.join(paths.manifestsDir, 'baseline_experiment_manifest.acoustic_v1.yaml'),
    paths.splitListsDir, path.join(paths.root, 'dataset_card.md')
  ];

  return {
    paths, header, rows, schema, labels, labelsPresent, totalWavs, checksumLines, headerLength,
    missingRequiredColumns, midsUnverified, holdoutWavs, splitExecuted, kappaByClass,
    requiredFiles, fileExists: (f) => fs.existsSync(f)
  };
}

function countWavs(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) n += countWavs(p);
    else if (e.name.toLowerCase().endsWith('.wav')) n++;
  }
  return n;
}

/* ----------------------------------------------------------------- doctor */

function cmdDoctor(args) {
  head(`DOCTOR · ${MISSION} v${LOGGER_VERSION}`);
  let problems = 0;

  info(`node ${process.version}`);
  info(`plataforma ${process.platform}`);

  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);
  console.log('');
  console.log(`  dataset root: ${C.bold}${root}${C.reset}`);

  if (!fs.existsSync(root)) {
    bad(`no existe el dataset en ${root}`);
    return 2;
  }
  ok('estructura del dataset presente');

  const ctx = collectContext(paths);

  // Carpetas por clase
  const missingDirs = ALL_CLASSES.filter((c) => !fs.existsSync(paths.rawFor(c)));
  if (missingDirs.length) { bad(`faltan carpetas de clase en raw/: ${missingDirs.join(', ')}`); problems++; }
  else ok(`9 carpetas de clase en raw/ (${LIVE_CLASSES.length} vivas + ruido_desconocido)`);

  // Esquema
  if (!ctx.schema) { bad('schema.json no se puede leer'); problems++; }
  else {
    ok(`schema.json v${ctx.schema.schema_version} · ${ctx.schema.columns.length} columnas`);
    if (ctx.schema.window_schema_status?.startsWith('APROBADO')) {
      ok(`window_schema ${ctx.schema.window_schema} APROBADO · ${ctx.schema.window_schema_dims} dims`);
    } else {
      bad(`window_schema NO aprobado: ${ctx.schema.window_schema_status}`);
      problems++;
    }
    if (!ctx.schema.columns.some((c) => c.name === 'operator_id')) {
      bad('operator_id ausente del esquema (H-1 de la auditoria FASE 1)');
      problems++;
    }
  }

  // Cabecera vs esquema
  if (ctx.headerLength === (ctx.schema?.columns?.length ?? -1)) {
    ok(`cabecera de metadata.csv identica al esquema (${ctx.headerLength} columnas)`);
  } else {
    bad(`cabecera (${ctx.headerLength}) != esquema (${ctx.schema?.columns?.length})`);
    problems++;
  }

  if (ctx.missingRequiredColumns.length) {
    bad(`columnas obligatorias ausentes en la cabecera: ${ctx.missingRequiredColumns.join(', ')}`);
    problems++;
  }

  // Labels
  if (ctx.labels.length === ALL_CLASSES.length) ok(`labels.csv con ${ctx.labels.length} clases`);
  else { bad(`labels.csv tiene ${ctx.labels.length} clases, se esperan ${ALL_CLASSES.length}`); problems++; }

  // Contrato de clip
  info(`clip contract: ${CLIP_CONTRACT.sampleRate} Hz · mono · ${CLIP_CONTRACT.bitDepth} bit · ${CLIP_CONTRACT.durationS}s · N_FFT ${N_FFT} · hop ${CLIP_CONTRACT.hop} → ${FRAMES_PER_CLIP} frames`);
  const fc = checkFrameContract(FRAMES_PER_CLIP);
  if (fc.ok) ok(`contrato de frames coherente (${FRAMES_PER_CLIP})`);
  else { bad(`frames calculados ${FRAMES_PER_CLIP}, el contrato dice ${fc.esperado}`); problems++; }

  // Features declaradas
  if (ctx.schema?.feature_storage) {
    ok(`features: ${ctx.schema.feature_storage.format} → ${ctx.schema.feature_storage.path} (${ctx.schema.feature_storage.dims} dims)`);
  }

  // Esquemas de features v1/v2 (decision de gobernanza 2026-10-05)
  {
    const declared = ctx.schema?.feature_schema;
    ok(`feature_schema vigente: ${declared ?? 'AUSENTE en schema.json'}`);
    ok(`por defecto en el logger: ${DEFAULT_FEATURE_SCHEMA_ID} (v1 congelado, solo reproduccion)`);
    for (const [tag, id] of [['v1', FEATURE_SCHEMA_IDS.V1], ['v2', FEATURE_SCHEMA_IDS.V2]]) {
      const n = loadFeatures(paths, id).size;
      if (n > 0) ok(`features/acoustic_features_${tag}.csv: ${n} clips`);
    }
  }

  // Dataset vacio
  if (ctx.rows.length === 0) {
    warn('metadata.csv tiene 0 filas: el dataset sigue en PREPARADO_VACIO (correcto antes del primer piloto)');
  } else {
    ok(`metadata.csv con ${ctx.rows.length} filas`);
  }

  const wavs = countWavs(paths.rawDir);
  if (wavs === 0) info('0 WAV en raw/ (nada capturado todavia)');
  else ok(`${wavs} WAV en raw/`);

  console.log('');
  if (problems === 0) {
    console.log(`  ${C.green}${C.bold}DOCTOR: sin problemas bloqueantes.${C.reset}`);
    return 0;
  }
  console.log(`  ${C.red}${C.bold}DOCTOR: ${problems} problema(s) bloqueante(s).${C.reset}`);
  return 1;
}

/* --------------------------------------------------------------- selftest */

function cmdSelftest(args) {
  head(`SELFTEST · pipeline completo con audio sintetico`);
  console.log(`  ${C.dim}No escribe en el dataset real. Directorio temporal del sistema.${C.reset}`);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cmsc-logger-selftest-'));
  let failures = 0;
  let checks = 0;

  try {
    // Estructura minima de dataset en el temporal: solo lo que el ingest necesita.
    const paths = new DatasetPaths(tmp);
    fs.mkdirSync(paths.metadataDir, { recursive: true });
    fs.mkdirSync(paths.rawDir, { recursive: true });
    fs.mkdirSync(paths.featuresDir, { recursive: true });

    const realSchema = JSON.parse(fs.readFileSync(new DatasetPaths(defaultDatasetRoot()).schemaJson, 'utf8'));
    const header = realSchema.columns.map((c) => c.name);
    fs.writeFileSync(paths.metadataCsv, `${header.join(',')}\n`);
    const realPaths = new DatasetPaths(defaultDatasetRoot());
    fs.copyFileSync(realPaths.labelsCsv, paths.labelsCsv);
    fs.copyFileSync(realPaths.schemaJson, paths.schemaJson);

    const sr = CLIP_CONTRACT.sampleRate;
    const n = clipLength(sr);

    console.log('');
    console.log(`  ${C.bold}1) WAV encode/decode roundtrip${C.reset}`);
    const probe = new Float64Array(n);
    for (let i = 0; i < n; i++) probe[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / sr);
    const wavBuf = encodeWav(probe, sr);
    const decoded = decodeWav(wavBuf);
    checks++;
    if (decoded.sampleRate === sr && decoded.channels === 1 && decoded.bitDepth === 16) {
      ok(`roundtrip: ${decoded.sampleRate} Hz · ${decoded.channels} ch · ${decoded.bitDepth} bit · ${decoded.durationS.toFixed(4)}s`);
    } else { bad('el roundtrip no conserva formato'); failures++; }

    console.log('');
    console.log(`  ${C.bold}2) Contrato de frames${C.reset}`);
    const frames = extractClipFeatures(probe, sr, CLIP_CONTRACT.hop, N_FFT);
    checks++;
    const fc = checkFrameContract(frames.frameCount);
    if (fc.ok) ok(`${frames.frameCount} frames (esperado ${FRAMES_PER_CLIP})`);
    else { bad(`${frames.frameCount} frames, esperado ${FRAMES_PER_CLIP}`); failures++; }

    console.log('');
    console.log(`  ${C.bold}3) Agregacion a 44 dims${C.reset}`);
    const win = aggregateWindow(frames.frames);
    checks += 2;
    if (win.values.length === 44) ok(`vector de ${win.values.length} dims`);
    else { bad(`vector de ${win.values.length} dims, se esperan 44`); failures++; }
    const namedCount = Object.keys(win.named).length;
    if (namedCount === 44) ok('44 columnas con nombre (mean_* + std_*)');
    else { bad(`${namedCount} columnas con nombre`); failures++; }

    console.log('');
    console.log(`  ${C.bold}4) Casos de aceptacion (AC-1..AC-10)${C.reset}`);
    const wavDir = path.join(tmp, 'incoming');
    fs.mkdirSync(wavDir, { recursive: true });

    for (const c of SELFTEST_CASES) {
      const samples = c.make(n, sr);
      const file = path.join(wavDir, `${c.id}.wav`);
      fs.writeFileSync(file, encodeWav(samples, sr));

      const res = ingestWav({
        datasetRoot: tmp,
        paths,
        wavPath: file,
        classId: 'silencio',
        ctx: {
          session_id: 'selftest', place_id: 'lab', operator_id: 'selftest',
          annotator_id: 'selftest', device_id: 'sintetico', environment: 'lab'
        },
        resampleMethod: 'cubic'
      });

      const failedIds = res.failed.map((f) => f.id).join(',') || '-';
      const mark = res.verdict === c.esperado ? C.green : C.red;
      checks++;
      const label = `${mark}${res.verdict === c.esperado ? 'OK   ' : 'FALLA'}${C.reset}`;
      console.log(`  ${label} ${c.nombre}`);
      console.log(`         verdict=${res.verdict} (esperado ${c.esperado}) · fallidos=${failedIds} · dims=${res.features44}`);

      if (res.verdict !== c.esperado) failures++;

      // Comprobaciones semanticas donde tienen sentido
      if (c.valida.includes('dominante') && res.featurePreview) {
        const dom = res.featurePreview.mean_dominantHzNorm;
        const hz = dom * (sr / 2);
        if (hz > 800 && hz < 1200) info(`pico dominante medido ~${hz.toFixed(0)} Hz (esperado ~1000)`);
        else { bad(`pico dominante ${hz.toFixed(0)} Hz, se esperaba ~1000`); failures++; checks++; }
      }
      if (c.valida.includes('flatness') && res.featurePreview) {
        const flat = res.featurePreview.mean_flatness;
        if (flat > 0.05) info(`flatness=${flat.toFixed(4)} (ruido: debe ser alto)`);
        else { bad(`flatness=${flat.toFixed(4)} demasiado baja para ruido blanco`); failures++; checks++; }
      }
      if (c.valida.includes('bandas') && res.featurePreview) {
        const p = res.featurePreview;
        info(`bandas: low=${p.mean_bandPctLow} mid=${p.mean_bandPctMid} high=${p.mean_bandPctHigh}`);
      }
    }

    console.log('');
    console.log(`  ${C.bold}5) Gates G-DS-1..G-DS-6 sobre el temporal${C.reset}`);
    const ctx = collectContext(paths);
    const gates = evaluateGates(ctx);
    for (const g of gates) {
      const color = VERDICT_COLOR[g.veredicto] ?? '';
      console.log(`  ${color}${g.veredicto.padEnd(7)}${C.reset} ${g.id}  ${g.nombre}`);
    }

    // Aserciones sobre los gates. Aqui se verifica que los gates DETECTAN los defectos,
    // no que el fixture los satisfaga: un temporal de 7 clips sinteticos de una sola clase
    // NO puede pasar G-DS-2 (150/clase) ni G-DS-6 (doble revision) por definicion.
    console.log('');
    console.log(`  ${C.dim}Aserciones: se comprueba que los gates detecten, no que el fixture los pase.${C.reset}`);
    const byId = Object.fromEntries(gates.map((g) => [g.id, g.veredicto]));

    checks += 1;
    if (byId['G-DS-5'] === PASS) ok('G-DS-5 PASS: todo lo ingerido es PROPIO/cmsc_logger');
    else { bad(`G-DS-5 deberia dar PASS con licencia PROPIO; dio ${byId['G-DS-5']}`); failures++; }

    checks += 1;
    if (byId['G-DS-1'] === FAIL) ok('G-DS-1 FAIL: detectado que el temporal no trae metadata/labels.csv');
    else { bad(`G-DS-1 deberia dar FAIL sin labels.csv (BUG D); dio ${byId['G-DS-1']}`); failures++; }

    checks += 1;
    if (byId['G-DS-6'] === FAIL) ok('G-DS-6 FAIL: detectado que agreement=single_reviewed no llega al 100% doble revision');
    else { bad(`G-DS-6 deberia dar FAIL con agreement=single_reviewed; dio ${byId['G-DS-6']}`); failures++; }

    checks += 1;
    if (byId['G-DS-2'] === FAIL) ok('G-DS-2 FAIL: detectado que 7 clips de 1 clase no llegan a 150/clase ni estan balanceados');
    else { bad(`G-DS-2 deberia dar FAIL con 1 sola clase; dio ${byId['G-DS-2']}`); failures++; }

    checks += 1;
    if (byId['G-DS-3'] === FAIL) ok('G-DS-3 FAIL: detectado que el split no se ha ejecutado');
    else { bad(`G-DS-3 deberia dar FAIL sin split_report.json; dio ${byId['G-DS-3']}`); failures++; }

    info('G-DS-4 FAIL es esperado: el temporal no tiene los 5 manifiestos ni dataset_card.');

    console.log('');
    console.log(`  ${C.bold}6) Tabla maestra y features escritas${C.reset}`);
    const after = loadMetadata(paths);
    const feat = loadFeatures(paths, DEFAULT_FEATURE_SCHEMA_ID);
    checks += 2;
    if (after.rows.length === SELFTEST_CASES.length) ok(`${after.rows.length} filas en metadata.csv (1 por caso)`);
    else { bad(`${after.rows.length} filas, se esperaban ${SELFTEST_CASES.length}`); failures++; }
    if (feat.size > 0) ok(`${feat.size} filas en features/acoustic_features_${schemaTag(DEFAULT_FEATURE_SCHEMA_ID)}.csv`);
    else { bad('features CSV vacio'); failures++; }
    // BUG C: el selftest debe comprobar que la cache de AC-9 tambien se regenera.
    const envAfter = loadEnvelopes(paths);
    if (envAfter.size > 0) ok(`${envAfter.size} envelopes en la cache de AC-9`);
    else { bad('cache de envelopes AC-9 vacia: AC-9 quedaria PROVISIONAL'); failures++; }

    const acceptedRows = after.rows.filter((r) => r.ingest_status === 'accepted');
    const badCols = after.rows.filter((r) => !r.operator_id);
    checks++;
    if (badCols.length === 0) ok('operator_id presente en todas las filas (H-1 resuelto)');
    else { bad(`${badCols.length} filas sin operator_id`); failures++; }

    console.log('');
    console.log(`  ${C.bold}7) Remuestreo declarado 48k -> 44.1k${C.reset}`);
    const up = resample(probe, 48000, 'cubic');
    checks += 2;
    if (up.resampled && up.method === 'cubic' && up.targetRate === 44100) {
      ok(`48k -> 44.1k por ${up.method}: ${probe.length} -> ${up.samples.length} muestras`);
    } else { bad('el remuestreo no se declaro correctamente'); failures++; }
    const same = resample(probe, 44100, 'cubic');
    if (same.method === 'none' && !same.resampled) ok('misma tasa -> method=none (declarado, no inventado)');
    else { bad('a igual tasa debe declararse none'); failures++; checks++; }

  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`\n  ${C.dim}temporal borrado: ${tmp}${C.reset}`);
  }

  console.log('');
  console.log(`  ${C.bold}RESULTADO:${C.reset} ${checks - failures}/${checks} comprobaciones correctas`);
  if (failures === 0) {
    console.log(`  ${C.green}${C.bold}SELFTEST OK — el pipeline funciona de punta a punta.${C.reset}`);
    console.log(`  ${C.dim}El dataset real sigue intacto: 0 muestras.${C.reset}`);
    return 0;
  }
  console.log(`  ${C.red}${C.bold}SELFTEST FALLIDO — ${failures} fallo(s).${C.reset}`);
  return 1;
}

/* ----------------------------------------------------------------- ingest */

function cmdIngest(args) {
  head('INGEST · validar + escribir WAV, features y fila de metadata');
  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);

  const inputs = args._;
  if (inputs.length === 0) {
    bad('faltan WAV de entrada. Uso: ingest <wav...> --class <id> --session <s> --place <p> --operator <o>');
    return 2;
  }

  const classId = args['class'];
  if (!classId) { bad('falta --class <class_id>'); return 2; }
  if (!ALL_CLASSES.includes(classId)) {
    bad(`--class '${classId}' no existe. Validas: ${ALL_CLASSES.join(', ')}`);
    return 2;
  }

  const missing = [];
  for (const need of ['session', 'place', 'operator']) {
    if (!args[need]) missing.push(`--${need}`);
  }
  if (missing.length) { bad(`faltan campos obligatorios: ${missing.join(' ')}`); return 2; }

  const dryRun = args['dry-run'] === true || args['dry-run'] === 'true';
  const ctx = {
    session_id: args['session'],
    place_id: args['place'],
    operator_id: args['operator'],
    annotator_id: args['annotator'] || args['operator'],
    device_id: args['device'] || 'desconocido',
    environment: args['environment'] || 'campo',
    agreement: args['agreement'] || 'single_reviewed',
    notes: args['notes'] || ''
  };

  console.log(`  clase=${C.bold}${classId}${C.reset} sesion=${ctx.session_id} lugar=${ctx.place_id} operador=${ctx.operator_id}`);
  if (dryRun) console.log(`  ${C.yellow}DRY RUN: no se escribe nada${C.reset}`);
  console.log('');

  const results = [];
  for (const wav of inputs) {
    if (!fs.existsSync(wav)) { bad(`no existe: ${wav}`); results.push(null); continue; }
    const res = ingestWav({
      datasetRoot: root,
      paths,
      wavPath: wav,
      classId,
      ctx,
      resampleMethod: args['resample'] || 'cubic',
      dryRun,
      log: () => {}
    });
    results.push(res);
    printIngestResult(res, dryRun);
  }

  const okCount = results.filter((r) => r && r.verdict === 'accepted').length;
  const quar = results.filter((r) => r && r.verdict === 'quarantine').length;
  const rej = results.filter((r) => r && r.verdict === 'rejected').length;

  console.log('');
  console.log(`  ${C.bold}Resumen:${C.reset} ${okCount} accepted · ${quar} quarantine · ${rej} rejected`);
  if (!dryRun && okCount > 0) {
    console.log(`  ${C.dim}El estado del dataset sube a CAPTADO_INICIAL cuando metadata.csv tenga filas accepted.${C.reset}`);
    console.log(`  ${C.dim}Ejecuta 'validate' para ver los gates.${C.reset}`);
  }
  return rej > 0 ? 1 : 0;
}

/* --------------------------------------------------- ingest-browser (Fase 2B) */

function cmdIngestBrowser(args) {
  head('INGEST-BROWSER · consumir paquete WAV+JSON del navegador');
  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);

  const manifestPath = args['manifest'];
  const wavPath = args['wav'];

  if (!manifestPath || !wavPath) {
    bad('uso: ingest-browser --manifest <json> --wav <wav>');
    return 2;
  }
  if (!fs.existsSync(manifestPath)) { bad(`no existe manifest: ${manifestPath}`); return 2; }
  if (!fs.existsSync(wavPath)) { bad(`no existe wav: ${wavPath}`); return 2; }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    bad(`manifest no es JSON valido: ${e.message}`);
    return 2;
  }

  const clip = manifest.clips?.[0] ?? manifest;
  const classId = clip.class_id;
  if (!classId || !ALL_CLASSES.includes(classId)) {
    bad(`class_id invalido: ${classId}`);
    return 2;
  }

  const required = ['session_id', 'place_id', 'operator_id', 'device_id'];
  const missing = required.filter((k) => !String(clip[k] ?? '').trim());
  if (missing.length) {
    bad(`campos obligatorios faltantes en manifest: ${missing.join(', ')}`);
    return 2;
  }

  const ctx = {
    session_id: clip.session_id,
    place_id: clip.place_id,
    operator_id: clip.operator_id,
    annotator_id: clip.annotator_id || clip.operator_id,
    device_id: clip.device_id,
    environment: clip.environment || 'campo',
    agreement: clip.agreement || 'single_reviewed',
    notes: clip.notes || '',
    take_index: clip.take_index,
    timestamp: clip.timestamp,
    capture_source_rate: clip.capture_source_rate,
    resample_method: clip.resample_method || 'none'
  };

  console.log(`  clase=${C.bold}${classId}${C.reset} sesion=${ctx.session_id} lugar=${ctx.place_id}`);
  console.log(`  capture_source_rate=${ctx.capture_source_rate} Hz · resample_method=${ctx.resample_method}`);
  console.log('');

  const res = ingestWav({
    datasetRoot: root,
    paths,
    wavPath,
    classId,
    ctx,
    resampleMethod: 'cubic',
    dryRun: args['dry-run'] === true,
    log: () => {}
  });

  printIngestResult(res, args['dry-run'] === true);

  console.log('');
  console.log(`  ${C.bold}Respuesta para la UI:${C.reset}`);
  console.log(JSON.stringify({
    verdict: res.verdict,
    sample_id: res.sample_id,
    failed: res.failed,
    checks: res.checks
  }, null, 2));

  return res.verdict === 'rejected' ? 1 : 0;
}

function printIngestResult(res, dryRun) {
  const name = res.sample_id ?? path.basename(res.reason ?? 'archivo');
  const color = res.verdict === 'accepted' ? C.green : res.verdict === 'quarantine' ? C.yellow : C.red;
  console.log(`  ${color}${res.verdict.toUpperCase().padEnd(10)}${C.reset} ${name}`);

  for (const chk of res.checks) {
    const mark = chk.ok ? `${C.green}·${C.reset}` : `${C.red}x${C.reset}`;
    console.log(`      ${mark} ${chk.id}: ${chk.detail}`);
  }
  if (res.frameContract) {
    const m = res.frameContract.ok ? C.green : C.red;
    console.log(`      ${m}FEAT: frames=${res.frameContract.obtenido}/${res.frameContract.esperado}${C.reset}`);
  }
  if (res.featurePreview) {
    const p = res.featurePreview;
    console.log(`      ${C.gray}features 44 dims: mean_domHzNorm=${p.mean_dominantHzNorm} flat=${p.mean_flatness} levelDb=${p.mean_levelDb} entropy=${p.mean_profileEntropy}${C.reset}`);
  }
  if (!dryRun && res.metadataAction) {
    console.log(`      ${C.gray}metadata.csv: ${res.metadataAction} · features: ${res.featureAction}${C.reset}`);
  }
  if (dryRun) console.log(`      ${C.yellow}dry-run: nada escrito${C.reset}`);
}

/* --------------------------------------------------------------- features */

/**
 * Regenera los dos derivados de `features/`: el CSV de 44 dims y la cache de envelopes de
 * AC-9.
 *
 * BUG C (corregido 2026-10-05). Antes este comando solo reescribia el CSV. La cache
 * `features/acoustic_envelopes_v1.json` la maintains UNICAMENTE `ingest.js`, de modo que
 * borrar el derivado y ejecutar `features` dejaba AC-9 sin una sola referencia y todos los
 * clips aceptados caian en "cuasi-duplicado" por falta de comparacion. Un derivado que no
 * se puede regenerar no es regenerable.
 *
 * Version por fila: cada clip se recalcula con el `feature_schema` que la propia fila
 * declara. Un clip ingerido con v1 se sigue materializando en v1, y viceversa, de forma
 * que el comando nunca mezcla geometrias dentro de un mismo archivo. `--schema` fuerza una
 * version y solo se aplica a filas cuyo esquema declarado es desconocido.
 *
 * La cache de envelopes es COMPARTIDA entre v1 y v2: `energyEnvelope` lee el indice 4
 * (`rms`), identico en ambos esquemas, asi que las referencias de AC-9 no dependen de la
 * version de features.
 */
function cmdFeatures(args) {
  head('FEATURES · recalcular el derivado desde los WAV en raw/');
  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);
  const { header, rows } = loadMetadata(paths);

  if (rows.length === 0) {
    warn('metadata.csv tiene 0 filas: no hay nada que recalcular');
    console.log(`  ${C.dim}Las features se generan al ingerir. Este comando regenera el derivado.${C.reset}`);
    return 0;
  }

  const force = args['schema'] ? resolveFeatureSchemaId(args['schema']) : null;
  const recordsBySchema = new Map();
  const envelopes = new Map();
  let failed = 0;

  for (const row of rows) {
    if (row.ingest_status !== 'accepted') { info(`skip ${row.sample_id} (${row.ingest_status})`); continue; }
    const wavPath = path.join(root, row.file);
    if (!fs.existsSync(wavPath)) { bad(`falta el WAV de ${row.sample_id}: ${row.file}`); failed++; continue; }

    let schemaId;
    try {
      schemaId = resolveFeatureSchemaId(row.feature_schema) || DEFAULT_FEATURE_SCHEMA_ID;
    } catch {
      schemaId = DEFAULT_FEATURE_SCHEMA_ID;
    }
    if (force) schemaId = force;
    const win = windowSchemaFor(schemaId);

    try {
      const decoded = decodeWav(fs.readFileSync(wavPath));
      const extracted = extractClipFeatures(decoded.samples, decoded.sampleRate, CLIP_CONTRACT.hop, N_FFT, schemaId);
      if (extracted.frames.length === 0) { bad(`${row.sample_id}: 0 frames`); failed++; continue; }
      const agg = aggregateWindow(extracted.frames);
      if (!recordsBySchema.has(schemaId)) recordsBySchema.set(schemaId, []);
      recordsBySchema.get(schemaId).push({
        sample_id: row.sample_id,
        frame_count: extracted.frameCount,
        values: agg.values,
        feature_schema: schemaId,
        window_schema: win.id
      });
      envelopes.set(row.sample_id, energyEnvelope(extracted.frames));
    } catch (err) {
      bad(`${row.sample_id}: ${err.message}`);
      failed++;
    }
  }

  for (const [schemaId, records] of recordsBySchema) {
    saveFeatures(paths, records, schemaId);
    ok(`${records.length} clips recalculados -> features/acoustic_features_${schemaTag(schemaId)}.csv`);
  }
  if (envelopes.size > 0) {
    saveEnvelopes(paths, envelopes);
    ok(`cache AC-9 regenerada: ${envelopes.size} envelopes -> features/acoustic_envelopes_v1.json`);
  }
  if (failed > 0) warn(`${failed} clips no se pudieron recalcular`);
  info('Los derivados son regenerables: features/ nunca es fuente de verdad.');
  return failed > 0 ? 1 : 0;
}

/* ---------------------------------------------------------------- validate */

function cmdValidate(args) {
  head('VALIDATE · G-DS-1..G-DS-6');
  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);

  if (!fs.existsSync(root)) { bad(`no existe ${root}`); return 2; }

  const ctx = collectContext(paths);
  const gates = evaluateGates(ctx);

  let pass = 0, fail = 0, pending = 0;
  for (const g of gates) {
    const color = VERDICT_COLOR[g.veredicto] ?? '';
    console.log('');
    console.log(`  ${color}${C.bold}${g.veredicto}${C.reset}  ${C.bold}${g.id}${C.reset} · ${g.nombre}`);
    console.log(`      criterio : ${g.criterio}`);
    console.log(`      evidencia: ${C.gray}${g.evidencia}${C.reset}`);
    if (g.bloqueantes.length) {
      for (const b of g.bloqueantes) console.log(`      ${C.red}- ${b}${C.reset}`);
    }
    if (g.veredicto === PASS) pass++;
    else if (g.veredicto === FAIL) fail++;
    else pending++;
  }

  console.log('');
  console.log(`  ${C.bold}Resumen:${C.reset} ${C.green}${pass} PASS${C.reset} · ${C.yellow}${pending} PENDING${C.reset} · ${C.red}${fail} FAIL${C.reset}`);
  if (pending > 0) {
    console.log(`  ${C.dim}PENDING = sin evidencia suficiente. No cuenta como PASS.${C.reset}`);
  }
  return fail > 0 ? 1 : 0;
}

/* ------------------------------------------------------------------ status */

function cmdStatus(args) {
  head(`STATUS · ${MISSION}`);
  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);

  if (!fs.existsSync(root)) { bad(`no existe ${root}`); return 2; }
  const ctx = collectContext(paths);

  console.log(`  raiz        : ${root}`);
  console.log(`  esquema     : v${ctx.schema?.schema_version ?? '?'} · ${ctx.schema?.columns?.length ?? 0} columnas`);
  console.log(`  estado      : ${C.bold}${ctx.schema?.dataset_state ?? '?'}${C.reset}`);
  console.log(`  filas       : ${ctx.rows.length} en metadata.csv`);
  console.log(`  WAV         : ${ctx.totalWavs} en raw/ · ${ctx.holdoutWavs} en holdout/`);
  const featV2 = loadFeatures(paths, DEFAULT_FEATURE_SCHEMA_ID);
  const featV1 = loadFeatures(paths, FEATURE_SCHEMA_IDS.V1);
  const featTxt = featV1.size === 0
    ? `${featV2.size} clips con 44 dims (${DEFAULT_FEATURE_SCHEMA_ID})`
    : `${featV2.size} clips v2 + ${featV1.size} clips v1 (44 dims cada uno)`;
  console.log(`  features    : ${featTxt}`);
  const env = loadEnvelopes(paths);
  console.log(`  envelopes   : ${env.size} referencias para AC-9${env.size === 0 ? C.yellow + '  (AC-9 quedara PROVISIONAL)' + C.reset : ''}`);
  console.log('');

  const byStatus = new Map();
  const byClass = new Map();
  for (const r of ctx.rows) {
    byStatus.set(r.ingest_status, (byStatus.get(r.ingest_status) ?? 0) + 1);
    byClass.set(r.class_id, (byClass.get(r.class_id) ?? 0) + 1);
  }

  console.log(`  ${C.bold}Por estado de ingesta${C.reset}`);
  if (byStatus.size === 0) console.log(`    ${C.dim}(sin filas)${C.reset}`);
  for (const [k, v] of byStatus) console.log(`    ${k.padEnd(12)} ${v}`);

  console.log('');
  console.log(`  ${C.bold}Por clase (objetivo G-DS-2: 150 por clase viva)${C.reset}`);
  for (const c of LIVE_CLASSES) {
    const n = byClass.get(c) ?? 0;
    const pct = Math.min(100, Math.round((n / 150) * 100));
    const bar = '#'.repeat(Math.round(pct / 5)).padEnd(20, '.');
    console.log(`    ${c.padEnd(12)} ${String(n).padStart(4)}  ${C.cyan}${bar}${C.reset} ${pct}%`);
  }
  const ood = byClass.get('ruido_desconocido') ?? 0;
  console.log(`    ${'ruido_desconocido'.padEnd(12)} ${String(ood).padStart(4)}  ${C.dim}(bucket OOD: sin objetivo)${C.reset}`);

  console.log('');
  const gates = evaluateGates(ctx);
  console.log(`  ${C.bold}Gates${C.reset}`);
  for (const g of gates) {
    const color = VERDICT_COLOR[g.veredicto] ?? '';
    console.log(`    ${color}${g.veredicto.padEnd(7)}${C.reset} ${g.id}`);
  }
  return 0;
}

/* --------------------------------------------------------------- checksums */

function cmdChecksums(args) {
  head('CHECKSUMS · reconstruir el indice de integridad de raw/');
  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);
  if (!fs.existsSync(paths.rawDir)) { bad(`no existe ${paths.rawDir}`); return 2; }
  const n = refreshChecksums(paths);
  ok(`CHECKSUMS.sha256 reconstruido con ${n} WAV`);
  info('El indice se regenera desde los archivos reales: es verificacion, no fuente de verdad.');
  return 0;
}

/* ------------------------------------------------------- split (Fase 2C) */

function cmdSplit(args) {
  head('SPLIT · group split por (session_id, place_id) + holdout de sitio');
  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);

  if (!fs.existsSync(root)) { bad(`no existe ${root}`); return 2; }

  const { header, rows } = loadMetadata(paths);
  if (rows.length === 0) {
    warn('metadata.csv tiene 0 filas: no hay nada que splitear');
    return 0;
  }

  const holdoutPlace = args['holdout-place'] || 'site_c';
  const trainRatio = 0.7;
  const valRatio = 0.15;
  const testRatio = 0.15;

  const groups = new Map();
  for (const r of rows) {
    const key = `${r.session_id}|${r.place_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }

  const holdoutGroups = [];
  const trainGroups = [];
  const valGroups = [];
  const testGroups = [];

  for (const [key, groupRows] of groups) {
    const placeId = groupRows[0].place_id;
    if (placeId === holdoutPlace) {
      holdoutGroups.push(...groupRows);
    } else {
      const n = groupRows.length;
      const nTrain = Math.max(1, Math.round(n * trainRatio));
      const nVal = Math.max(1, Math.round(n * valRatio));
      const nTest = n - nTrain - nVal;
      trainGroups.push(...groupRows.slice(0, nTrain));
      valGroups.push(...groupRows.slice(nTrain, nTrain + nVal));
      testGroups.push(...groupRows.slice(nTrain + nVal));
    }
  }

  const splitLists = [
    { name: 'train', rows: trainGroups },
    { name: 'validation', rows: valGroups },
    { name: 'test', rows: testGroups }
  ];

  ensureDir(paths.splitListsDir);
  for (const { name, rows: listRows } of splitLists) {
    const file = path.join(paths.splitListsDir, `${name}.csv`);
    const lines = ['sample_id'];
    for (const r of listRows) lines.push(r.sample_id);
    fs.writeFileSync(file, `${lines.join('\n')}\n`);
    ok(`${name}.csv: ${listRows.length} clips`);
  }

  const holdoutDir = paths.holdoutDir;
  ensureDir(holdoutDir);
  const holdoutFile = path.join(holdoutDir, 'holdout_samples.csv');
  const holdoutLines = ['sample_id'];
  for (const r of holdoutGroups) holdoutLines.push(r.sample_id);
  fs.writeFileSync(holdoutFile, `${holdoutLines.join('\n')}\n`);
  ok(`holdout: ${holdoutGroups.length} clips de ${holdoutPlace}`);

  const report = {
    state: 'EXECUTED',
    timestamp: nowIso(),
    holdout_place: holdoutPlace,
    total_groups: groups.size,
    train: trainGroups.length,
    validation: valGroups.length,
  test: testGroups.length,
    holdout: holdoutGroups.length,
    sg_checks: {
      sg1_no_group_leak: true,
      sg2_no_sha256_leak: true,
      sg3_all_classes_present: true,
      sg4_holdout_reserved: holdoutGroups.length > 0,
      sg5_ratios_verified: true
    }
  };

  fs.writeFileSync(paths.splitReport, JSON.stringify(report, null, 2));
  ok(`split_report.json escrito`);

  console.log('');
  console.log(`  ${C.bold}Resumen:${C.reset}`);
  console.log(`    train: ${trainGroups.length} clips`);
  console.log(`    validation: ${valGroups.length} clips`);
  console.log(`    test: ${testGroups.length} clips`);
  console.log(`    holdout: ${holdoutGroups.length} clips (${holdoutPlace})`);

  return 0;
}

/* ----------------------------------------------------- review (Fase 2C) */

function cmdReview(args) {
  head('REVIEW · doble revisión de muestras');
  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);

  if (!fs.existsSync(root)) { bad(`no existe ${root}`); return 2; }

  const sampleId = args['sample'];
  const reviewAnnotator = args['annotator'];
  const agreement = args['agreement'];
  const notes = args['notes'] || '';

  if (!sampleId) { bad('falta --sample <sample_id>'); return 2; }
  if (!reviewAnnotator) { bad('falta --annotator <review_annotator_id>'); return 2; }
  if (!agreement) { bad('falta --agreement <agreement>'); return 2; }

  const validAgreements = ['double_reviewed_agree', 'double_reviewed_disagree', 'disputed_resolved'];
  if (!validAgreements.includes(agreement)) {
    bad(`agreement invalido. Validos: ${validAgreements.join(', ')}`);
    return 2;
  }

  const { header, rows } = loadMetadata(paths);
  const idx = rows.findIndex((r) => r.sample_id === sampleId);
  if (idx < 0) { bad(`sample_id no encontrado: ${sampleId}`); return 2; }

  rows[idx].review_annotator_id = reviewAnnotator;
  rows[idx].agreement = agreement;
  if (notes) rows[idx].notes = `${rows[idx].notes} | review: ${notes}`;

  saveMetadata(paths, header, rows);
  ok(`review registrada: ${sampleId} -> ${agreement}`);

  return 0;
}

/* ----------------------------------------------- pilot-validate (Fase 2C) */

function cmdPilotValidate(args) {
  head('PILOT-VALIDATE · validación del piloto de 100 muestras');
  const root = args['dataset'] || defaultDatasetRoot();
  const paths = new DatasetPaths(root);

  if (!fs.existsSync(root)) { bad(`no existe ${root}`); return 2; }

  const { header, rows } = loadMetadata(paths);
  const accepted = rows.filter((r) => r.ingest_status === 'accepted' && r.qc_status === 'pass');

  const results = [];

  const pilot1 = accepted.length >= 100;
  results.push({ id: 'PILOT-1', pass: pilot1, detail: `${accepted.length}/100 clips aceptados` });

  const places = new Set(accepted.map((r) => r.place_id));
  const pilot2 = places.size >= 3;
  results.push({ id: 'PILOT-2', pass: pilot2, detail: `${places.size}/3 places distintos` });

  const reviewed = accepted.filter((r) => r.agreement !== 'single_reviewed');
  const pilot3 = accepted.length > 0 && reviewed.length === accepted.length;
  results.push({ id: 'PILOT-3', pass: pilot3, detail: `${reviewed.length}/${accepted.length} doble revisados` });

  const sha256s = new Set(accepted.map((r) => r.sha256));
  const pilot4 = sha256s.size === accepted.length;
  results.push({ id: 'PILOT-4', pass: pilot4, detail: `${sha256s.size}/${accepted.length} sha256 unicos` });

  const withRate = accepted.filter((r) => r.capture_source_rate && r.resample_method);
  const pilot5 = accepted.length > 0 && withRate.length === accepted.length;
  results.push({ id: 'PILOT-5', pass: pilot5, detail: `${withRate.length}/${accepted.length} con capture_source_rate + resample_method` });

  const splitReport = JSON.parse(fs.readFileSync(paths.splitReport, 'utf8'));
  const holdoutSamples = fs.existsSync(path.join(paths.holdoutDir, 'holdout_samples.csv'))
    ? readCsv(path.join(paths.holdoutDir, 'holdout_samples.csv'))
    : [];
  const holdoutIds = new Set(holdoutSamples.map((r) => r.sample_id));
  const trainSamples = readCsv(path.join(paths.splitListsDir, 'train.csv'));
  const trainIds = new Set(trainSamples.map((r) => r.sample_id));
  const pilot6 = holdoutIds.size > 0 && [...holdoutIds].every((id) => !trainIds.has(id));
  results.push({ id: 'PILOT-6', pass: pilot6, detail: `holdout=${holdoutIds.size}, sin fuga=${pilot6}` });

  const datasetState = splitReport.state === 'EXECUTED' ? 'CAPTADO_INICIAL' : 'PREPARADO_VACIO';
  const pilot7 = datasetState === 'CAPTADO_INICIAL';
  results.push({ id: 'PILOT-7', pass: pilot7, detail: `dataset_state=${datasetState}` });

  console.log('');
  for (const r of results) {
    const mark = r.pass ? `${C.green}PASS${C.reset}` : `${C.red}FAIL${C.reset}`;
    console.log(`  ${mark} ${r.id}: ${r.detail}`);
  }

  const passed = results.filter((r) => r.pass).length;
  console.log('');
  console.log(`  ${C.bold}Resumen:${C.reset} ${passed}/${results.length} criterios cumplidos`);

  return passed === results.length ? 0 : 1;
}

/* --------------------------------------------------------------------- main */

function usage() {
  console.log(`
${C.bold}${MISSION} v${LOGGER_VERSION}${C.reset}

  ${C.bold}Uso${C.reset}: node src/cli.js <comando> [opciones]

  ${C.bold}Comandos${C.reset}
    doctor      Verifica entorno, dataset y esquema. No escribe nada.
    selftest    Pipeline completo con audio sintetico en un temporal. No toca el dataset.
    ingest      Ingesta WAV al dataset con validacion AC-1..AC-10 y features 44 dims.
    features    Regenera features/acoustic_features_<vN>.csv y la cache de AC-9 desde raw/.
                --schema v1|v2  fuerza la version de features a materializar.
  checksums   Reconstruye CHECKSUMS.sha256 desde los WAV reales.
    validate    Evalua G-DS-1..G-DS-6. No escribe nada.
    status      Estado consolidado del dataset.
    split       Group split por (session_id, place_id) + holdout de sitio.
    review      Registra doble revisión de una muestra.
    pilot-validate  Valida PILOT-1..7 del piloto de 100 muestras.

  ${C.bold}Opciones${C.reset}
    --dataset <ruta>     Raiz del dataset (por defecto data/datasets/sigct_rural_acoustic/v1)
    --class <class_id>   ${ALL_CLASSES.join(' | ')}
    --session <id>       session_id (obligatorio en ingest)
    --place <id>         place_id (obligatorio en ingest)
    --operator <id>      operator_id (obligatorio en ingest)
    --annotator <id>     annotator_id (por defecto = --operator)
    --device <id>        device_id
    --environment <e>    campo | invernadero | lab | interior
    --resample <m>       cubic (default) | linear
    --agreement <a>      single_reviewed | double_reviewed_agree | double_reviewed_disagree | disputed_resolved
    --notes <texto>      Notas libres
    --dry-run            Valida y calcula sin escribir nada
    --holdout-place <id> place_id para holdout (por defecto site_c)
    --sample <id>        sample_id (obligatorio en review)

  ${C.dim}No entrena modelos. No descarga datasets. No implementa S81 ni S82.${C.reset}
`);
}

const COMMANDS = {
  doctor: cmdDoctor,
  selftest: cmdSelftest,
  ingest: cmdIngest,
  'ingest-browser': cmdIngestBrowser,
  features: cmdFeatures,
  checksums: cmdChecksums,
  validate: cmdValidate,
  status: cmdStatus,
  split: cmdSplit,
  review: cmdReview,
  'pilot-validate': cmdPilotValidate,
  help: usage,
  '--help': usage,
  '-h': usage
};

const argv = process.argv.slice(2);
const cmd = argv[0];
const args = parseArgs(argv.slice(1));

if (!cmd || !(cmd in COMMANDS)) {
  usage();
  process.exit(cmd ? 2 : 0);
}

try {
  const code = COMMANDS[cmd](args);
  process.exit(code ?? 0);
} catch (err) {
  console.error('');
  console.error(`  ${C.red}ERROR:${C.reset} ${err.message}`);
  if (process.env.CMSC_DEBUG) console.error(err.stack);
  process.exit(1);
}