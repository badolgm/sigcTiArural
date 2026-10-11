/**
 * Estadísticas reales del dataset (Tramo B · bridge + CLI).
 *
 * Lecturas SOLO LECTURA sobre data/datasets/sigct_rural_acoustic/v1:
 *   - metadata.csv es la tabla maestra (ingest_status por fila)
 *   - raw/ cuenta los WAV realmente presentes por clase
 *   - features/acoustic_features_v2.csv cuenta los vectores (schema vigente)
 *
 * NADA aquí inventa conteos: si un archivo no existe, el número queda sin dato.
 * La raíz se resuelve por defecto igual que el logger (dataset.js#defaultDatasetRoot).
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatasetPaths, loadMetadata, loadFeatures } from './dataset.js';
import { ALL_CLASSES, DEFAULT_FEATURE_SCHEMA_ID } from './constants.js';

function countWavsDeep(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) n += countWavsDeep(p);
    else if (e.name.toLowerCase().endsWith('.wav')) n++;
  }
  return n;
}

function loadSchemaVersion(paths) {
  try {
    if (!fs.existsSync(paths.schemaJson)) return null;
    return JSON.parse(fs.readFileSync(paths.schemaJson, 'utf8')).schema_version ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {string} root raíz del dataset
 * @returns {object} conteos reales por clase + totales
 */
export function datasetStats(root) {
  const paths = new DatasetPaths(root);
  const exists = fs.existsSync(paths.metadataCsv);

  const byClass = {};
  for (const id of ALL_CLASSES) byClass[id] = { accepted: 0, rejected: 0, quarantine: 0, other: 0, wav: 0 };

  const summary = { accepted: 0, rejected: 0, quarantine: 0, other: 0 };
  let totalRows = 0;

  if (exists) {
    const { rows } = loadMetadata(paths);
    totalRows = rows.length;
    for (const r of rows) {
      const c = byClass[r.class_id];
      const st = r.ingest_status;
      if (!c) {
        summary.other++;
        continue;
      }
      if (st === 'accepted') { c.accepted++; summary.accepted++; }
      else if (st === 'rejected') { c.rejected++; summary.rejected++; }
      else if (st === 'quarantine') { c.quarantine++; summary.quarantine++; }
      else { c.other++; summary.other++; }
    }
  }

  let totalWavs = 0;
  for (const id of ALL_CLASSES) {
    try {
      byClass[id].wav = countWavsDeep(paths.rawFor(id));
    } catch {
      byClass[id].wav = 0;
    }
    totalWavs += byClass[id].wav;
  }

  let features = 0;
  try {
    features = loadFeatures(paths, DEFAULT_FEATURE_SCHEMA_ID).size;
  } catch {
    features = 0;
  }

  return {
    dataset: 'sigct_rural_acoustic/v1',
    root,
    exists,
    schema_version: loadSchemaVersion(paths),
    totalRows,
    wavs: totalWavs,
    features,
    byClass,
    summary
  };
}