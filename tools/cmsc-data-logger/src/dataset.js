/**
 * Capa de dataset: rutas, CSV y escritura atomica.
 *
 * Reglas que este modulo NO puede romper:
 *   - metadata.csv es la tabla maestra. Nada mas es fuente de verdad.
 *   - features/ y manifest.csv son DERIVADOS regenerables.
 *   - La escritura es atomica (escritura temporal + rename): una captura interrumpida
 *     nunca deja una fila a medias en la tabla maestra.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  FEATURES_CSV_HEADER, ALL_CLASSES, WINDOW_SCHEMA_DIMS,
  DEFAULT_FEATURE_SCHEMA_ID, windowSchemaFor, schemaTag
} from './constants.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const TOOL_ROOT = path.resolve(HERE, '..');

/** Raiz del dataset. Por defecto data/datasets/sigct_rural_acoustic/v1 relativa al repo. */
export function defaultDatasetRoot() {
  return path.resolve(TOOL_ROOT, '..', '..', 'data', 'datasets', 'sigct_rural_acoustic', 'v1');
}

export class DatasetPaths {
  constructor(root) {
    this.root = root;
  }

  get metadataDir() { return path.join(this.root, 'metadata'); }
  get manifestsDir() { return path.join(this.root, 'manifests'); }
  get featuresDir() { return path.join(this.root, 'features'); }
  get rawDir() { return path.join(this.root, 'raw'); }
  get splitListsDir() { return path.join(this.root, 'split_lists'); }
  get holdoutDir() { return path.join(this.root, 'holdout', 'real_world_holdout_v1'); }

  get metadataCsv() { return path.join(this.metadataDir, 'metadata.csv'); }
  get labelsCsv() { return path.join(this.metadataDir, 'labels.csv'); }
  get manifestCsv() { return path.join(this.metadataDir, 'manifest.csv'); }
  get placesCsv() { return path.join(this.metadataDir, 'places.csv'); }
  get schemaJson() { return path.join(this.metadataDir, 'schema.json'); }
  get featuresCsv() { return this.featuresCsvFor(DEFAULT_FEATURE_SCHEMA_ID); }

  /** CSV de features de una version de esquema concreta. */
  featuresCsvFor(featureSchemaId) {
    return path.join(this.featuresDir, `acoustic_features_${schemaTag(featureSchemaId)}.csv`);
  }
  get checksums() { return path.join(this.root, 'CHECKSUMS.sha256'); }
  get splitReport() { return path.join(this.splitListsDir, 'split_report.json'); }

  rawFor(classId) {
    const dir = classDirName(classId);
    return path.join(this.rawDir, dir);
  }

  /** class_id -> nombre de carpeta, leyendo el binding canonico de labels.csv. */
  binding() {
    if (!this._binding) {
      const rows = readCsv(this.labelsCsv);
      const map = new Map();
      for (const r of rows) map.set(r.class_id, r.dir_name);
      this._binding = map;
    }
    return this._binding;
  }

  dirFor(classId) {
    const dir = this.binding().get(classId);
    if (!dir) throw new Error(`dirFor: class_id '${classId}' no existe en labels.csv`);
    return dir;
  }
}

/** Fallback de binding, usado solo si labels.csv no esta disponible. */
const FALLBACK_BINDING = new Map(ALL_CLASSES.map((c) => [c, c === 'ruido_desconocido' ? 'desconocido' : c]));

export function classDirName(classId) {
  return FALLBACK_BINDING.get(classId) ?? classId;
}

/* ------------------------------------------------------------------ CSV */

/** Parser CSV minimo con soporte de comillas dobles y campos con comas. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

/** Serializa filas a CSV con escape cuando hace falta. */
export function toCsv(rows) {
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(escape).join(',')).join('\n');
}

/** Lee un CSV como array de objetos usando la primera fila como cabecera. */
export function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8');
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = r[i] ?? '';
    });
    return obj;
  });
}

/** Cabecera de un CSV sin parsear todo el contenido. */
export function readCsvHeader(file) {
  const text = fs.readFileSync(file, 'utf8');
  const rows = parseCsv(text);
  return rows.length ? rows[0] : [];
}

/* ---------------------------------------------------------- escritura atomica */

/** Escribe en un temporal y renombra. Evita filas a medias si el proceso muere. */
export function writeFileAtomic(file, content) {
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, file);
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/* ------------------------------------------------------------- tabla maestra */

/** Carga la tabla maestra como objetos + el header. */
export function loadMetadata(paths) {
  if (!fs.existsSync(paths.metadataCsv)) {
    return { header: [], rows: [], missing: true };
  }
  const text = fs.readFileSync(paths.metadataCsv, 'utf8');
  const parsed = parseCsv(text);
  if (parsed.length === 0) return { header: [], rows: [], missing: false };
  const header = parsed[0];
  const rows = parsed.slice(1).map((r) => {
    const o = {};
    header.forEach((h, i) => { o[h] = r[i] ?? ''; });
    return o;
  });
  return { header, rows, missing: false };
}

/** Serializa la tabla maestra respetando el orden del header del esquema. */
export function saveMetadata(paths, header, rows) {
  const body = rows.map((row) => header.map((h) => row[h] ?? ''));
  writeFileAtomic(paths.metadataCsv, `${toCsv([header, ...body])}\n`);
}

/** Inserta o actualiza una fila por sample_id (idempotente). */
export function upsertMetadataRow(header, rows, row) {
  const idx = rows.findIndex((r) => r.sample_id === row.sample_id);
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...row };
    return { action: 'updated', row: rows[idx] };
  }
  rows.push(row);
  return { action: 'inserted', row };
}

/* ---------------------------------------------------------- tabla de features */

/**
 * Carga features como mapa sample_id -> objeto de 44 columnas.
 *
 * Cada version de esquema tiene su propio CSV: `acoustic_features_v1.csv` (congelado) y
 * `acoustic_features_v2.csv`. Nunca se mezclan filas de versiones distintas en un archivo,
 * de modo que entrenar nunca depende de filtrar.
 *
 * La cache de envelopes de AC-9 SI es compartida entre versiones: `energyEnvelope` usa el
 * indice 4 (`rms`), que es identico en v1 y v2.
 */
export function loadFeatures(paths, schemaId = DEFAULT_FEATURE_SCHEMA_ID) {
  const file = paths.featuresCsvFor(schemaId);
  if (!fs.existsSync(file)) return new Map();
  const map = new Map();
  for (const row of readCsv(file)) {
    map.set(row.sample_id, row);
  }
  return map;
}

/**
 * Escribe features/acoustic_features_<vN>.csv.
 * `records` es una lista de { sample_id, frame_count, values(44) }.
 * El archivo se reordena por sample_id para que el diff sea legible.
 */
export function saveFeatures(paths, records, schemaId = DEFAULT_FEATURE_SCHEMA_ID) {
  ensureDir(paths.featuresDir);
  const win = windowSchemaFor(schemaId);
  const sorted = [...records].sort((a, b) => String(a.sample_id).localeCompare(String(b.sample_id)));
  const lines = [FEATURES_CSV_HEADER.join(',')];
  for (const rec of sorted) {
    if (!Array.isArray(rec.values) || rec.values.length !== WINDOW_SCHEMA_DIMS) {
      throw new Error(
        `saveFeatures: ${rec.sample_id} tiene ${rec.values ? rec.values.length : 0} dims, se esperan ${WINDOW_SCHEMA_DIMS}`
      );
    }
    const cells = [
      rec.sample_id,
      rec.feature_schema ?? schemaId,
      rec.window_schema ?? win.id,
      rec.frame_count ?? ''
    ].join(',');
    lines.push(`${cells},${rec.values.map((v) => formatNumber(v)).join(',')}`);
  }
  writeFileAtomic(paths.featuresCsvFor(schemaId), `${lines.join('\n')}\n`);
}

function formatNumber(v) {
  if (!Number.isFinite(v)) return '0';
  // 10 decimales: suficiente para reproducir la feature, compacto para CSV legible.
  return String(Number(v.toFixed(10)));
}

/* ------------------------------------------------------------------ varios */

export function sha256Hex(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/** Timestamp ISO-8601 con offset local, como exige el esquema. */
export function nowIso() {
  const d = new Date();
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0');
  const mm = String(Math.abs(off) % 60).padStart(2, '0');
  return `${d.toISOString().slice(0, 19)}${sign}${hh}:${mm}`;
}

/** sample_id con el patron del esquema: ac_YYYYMMDD_HHMMSS_NNN */
export function buildSampleId(date = new Date()) {
  const p = (n, w = 2) => String(n).padStart(w, '0');
  const stamp = `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}_${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
  return `ac_${stamp}_000`;
}

/** Renumera el sufijo de un sample_id para evitar colisiones dentro del mismo segundo. */
export function bumpSampleId(baseId, n) {
  return baseId.replace(/_(\d{3})$/, `_${String(n % 1000).padStart(3, '0')}`);
}

/**
 * sample_id libre para un instante dado: si el sufijo ya esta ocupado, avanza.
 * Termina en cuanto encuentra hueco; el DatasetPaths real da la garantia de unicidad
 * mediante el AC-8 (sha256 duplicado -> rejected), no mediante este helper.
 */
export function uniqueSampleId(rows, date = new Date()) {
  const taken = new Set(rows.map((r) => r.sample_id));
  const base = buildSampleId(date);
  for (let n = 0; n < 1000; n++) {
    const candidate = bumpSampleId(base, n);
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error(`uniqueSampleId: los 1000 sufijos de ${base} estan ocupados`);
}

/* --------------------------------------------------------------- checksums */

/**
 * Reconstruye CHECKSUMS.sha256 a partir de los WAV realmente presentes en raw/.
 *
 * Es un indice de integridad, NO una fuente de verdad: si un WAV se pierde o se anade,
 * el archivo se regenera con `logger checksums`. Cada linea es `<sha256>  <ruta relativa>`.
 */
export function refreshChecksums(paths) {
  const entries = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    const names = fs.readdirSync(dir).sort();
    for (const name of names) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (name.toLowerCase().endsWith('.wav')) {
        const rel = path.relative(paths.root, full).split(path.sep).join('/');
        entries.push(`${sha256Hex(fs.readFileSync(full))}  ${rel}`);
      }
    }
  };
  walk(paths.rawDir);
  const header = [
    '# CHECKSUMS.sha256 · CMSC_DATA_LOGGER_V1',
    '# Indice de integridad de los WAV de raw/. Regenerable: `logger checksums`.',
    `# ${entries.length} WAV · generado ${nowIso()}`
  ].join('\n');
  writeFileAtomic(paths.checksums, entries.length ? `${header}\n${entries.join('\n')}\n` : `${header}\n`);
  return entries.length;
}

/* --------------------------------------- cache de sobres (derivado para AC-9) */

export function envelopesPath(paths) {
  return path.join(paths.featuresDir, 'acoustic_envelopes_v1.json');
}

/**
 * Sobres de energia por clip, cache derivada para que AC-9 (near-duplicate) tenga
 * referencias reales. Vive en features/ porque es DERIVADA y regenerable;.metadata.csv
 * se queda en las 42 columnas del contrato, sin meter un vector de 63 floats dentro.
 */
export function loadEnvelopes(paths) {
  const file = envelopesPath(paths);
  if (!fs.existsSync(file)) return new Map();
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return new Map(Object.entries(parsed.envelopes ?? {}));
  } catch {
    return new Map();
  }
}

export function saveEnvelopes(paths, map) {
  ensureDir(paths.featuresDir);
  const envelopes = {};
  for (const key of [...map.keys()].sort()) envelopes[key] = map.get(key);
  writeFileAtomic(
    envelopesPath(paths),
    `${JSON.stringify({
      schema: 'cmsc.acoustic.envelopes.v1',
      description: 'rms por frame (feature 4). Derivado regenerable; alimenta AC-9.',
      count: Object.keys(envelopes).length,
      envelopes
    }, null, 2)}\n`
  );
}