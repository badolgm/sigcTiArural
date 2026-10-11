#!/usr/bin/env node
/**
 * CMSC Acoustic Bridge · Tramo B (implementación 2026-10-09)
 *
 * Puente HTTP local 127.0.0.1:8766 entre el navegador (Vite 5174) y el motor de
 * ingesta canónico. Reutiliza EXCLUSIVAMENTE ingestWav() de src/ingest.js: un único
 * motor para CLI y UI. El bridge NO decide estados: ejecuta el motor y devuelve su
 * veredicto (accepted / quarantine / rejected) tal cual.
 *
 * Endpoints:
 *   GET  /health   -> estado del servicio + raíz del dataset
 *   GET  /stats    -> conteos REALES desde metadata.csv / raw/ / features/
 *   POST /ingest   -> multipart/form-data (wav + manifest [+ dry_run]) -> verdict
 *
 * Seguridad (solo local):
 *   - bind 127.0.0.1 · puerto BRIDGE_PORT (por defecto 8766)
 *   - CORS restringido a BRIDGE_ORIGIN (default localhost:5174 / 127.0.0.1:5174)
 *   - límite de body (DEFAULT_MAX_BODY = 8 MB)
 *   - el WAV entrante se escribe en tmp; nunca se confía en el filename
 *
 * Uso: node tools/cmsc-data-logger/bridge/server.js
 */
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatasetPaths, defaultDatasetRoot } from '../src/dataset.js';
import { ingestWav } from '../src/ingest.js';
import { ALL_CLASSES, LOGGER_VERSION, MISSION } from '../src/constants.js';
import { datasetStats } from '../src/stats.js';

const HOST = '127.0.0.1';
const PORT = Number(process.env.BRIDGE_PORT || 8766);
const MAX_BODY = 8 * 1024 * 1024;
const ALLOWED_ORIGINS = (process.env.BRIDGE_ORIGIN || 'http://localhost:5174,http://127.0.0.1:5174')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const log = (...args) => console.log(`[${new Date().toISOString()}]`, ...args);

class BodyTooLarge extends Error {}

/* ------------------------------------------------------------- multipart */

function parsePart(headers, content) {
  const ct = /content-type:\s*([^\r\n]+)/i.exec(headers);
  const cd = /content-disposition:\s*([^\r\n]+)/i.exec(headers);
  const name = cd ? /name="([^"]+)"/.exec(cd[1])?.[1] : undefined;
  const filename = cd ? /filename="([^"]+)"/.exec(cd[1])?.[1] : undefined;
  return { name, filename, contentType: ct ? ct[1].trim() : undefined, data: content };
}

function parseMultipart(body, boundary) {
  const parts = [];
  const token = Buffer.from(`--${boundary}`);
  let idx = body.indexOf(token);
  while (idx !== -1) {
    let p = idx + token.length;
    if (body[p] === 0x2d && body[p + 1] === 0x2d) break; // boundary de cierre
    if (body[p] === 0x0d && body[p + 1] === 0x0a) p += 2;
    else break;
    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), p);
    if (headerEnd === -1) break;
    const headerBlock = body.slice(p, headerEnd).toString('utf8');
    const contentStart = headerEnd + 4;
    const lead = Buffer.from(`\r\n${token}`);
    const next = body.indexOf(lead, contentStart);
    if (next === -1) break;
    parts.push(parsePart(headerBlock, body.slice(contentStart, next)));
    idx = body.indexOf(token, next + 2);
  }
  return parts;
}

/* ---------------------------------------------------------------- resp */

function send(res, status, payload, origin) {
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '600');
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (payload === null) {
    res.end();
    return;
  }
  res.end(JSON.stringify(payload));
}

/* ----------------------------------------------------------------- routers */

function handleHealth(res, origin) {
  const root = process.env.BRIDGE_DATASET || defaultDatasetRoot();
  const datasetReady = fs.existsSync(path.join(root, 'metadata', 'metadata.csv'));
  send(res, 200, {
    ok: true,
    service: 'cmsc-acoustic-bridge',
    version: LOGGER_VERSION,
    mission: MISSION,
    datasetRoot: root,
    datasetReady
  }, origin);
}

function handleStats(res, origin) {
  const root = process.env.BRIDGE_DATASET || defaultDatasetRoot();
  send(res, 200, { ok: true, ...datasetStats(root) }, origin);
}

function handleIngest(req, res, body, origin) {
  const ct = req.headers['content-type'] || '';
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(ct);
  if (!m) return send(res, 400, { ok: false, error: 'multipart/form-data sin boundary' }, origin);

  const parts = parseMultipart(body, m[1] || m[2]);
  const wav = parts.find((p) => p.name === 'wav');
  const manifestPart = parts.find((p) => p.name === 'manifest');
  const dryPart = parts.find((p) => p.name === 'dry_run');
  if (!wav || !manifestPart) {
    return send(res, 400, { ok: false, error: 'faltan campos wav/manifest' }, origin);
  }
  const dryRun = /^(1|true)$/i.test(String(dryPart?.data || ''));

  let manifest;
  try {
    manifest = JSON.parse(manifestPart.data.toString('utf8'));
  } catch (e) {
    return send(res, 400, { ok: false, error: `manifest no es JSON válido: ${e.message}` }, origin);
  }

  const clip = manifest.clips?.[0] ?? manifest;
  const classId = clip.class_id;
  if (!classId || !ALL_CLASSES.includes(classId)) {
    return send(res, 400, { ok: false, error: `class_id inválido: ${classId}` }, origin);
  }

  const required = ['session_id', 'place_id', 'operator_id', 'device_id'];
  const missing = required.filter((k) => !String(clip[k] ?? '').trim());
  if (missing.length) {
    return send(res, 400, { ok: false, error: `campos obligatorios faltantes: ${missing.join(', ')}` }, origin);
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
    resample_method: clip.resample_method || 'none',
    hour_local: clip.hour_local,
    weather_note: clip.weather_note
  };

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cmsc-bridge-'));
  const wavPath = path.join(tmp, 'take.wav');
  try {
    fs.writeFileSync(wavPath, wav.data);
    const datasetRoot = process.env.BRIDGE_DATASET || defaultDatasetRoot();
    const datasetPaths = new DatasetPaths(datasetRoot);
    const result = ingestWav({
      datasetRoot,
      paths: datasetPaths,
      wavPath,
      classId,
      ctx,
      resampleMethod: 'cubic',
      dryRun,
      log: () => {}
    });
    send(res, 200, {
      ok: true,
      service: 'cmsc-acoustic-bridge',
      dryRun,
      verdict: result.verdict,
      sample_id: result.sample_id ?? null,
      failed: result.failed ?? [],
      checks: result.checks ?? [],
      features44: result.features44 ?? 0,
      elapsed_ms: result.elapsedMs
    }, origin);
  } catch (err) {
    log('ingest error:', err.message);
    send(res, 500, { ok: false, error: err.message }, origin);
  } finally {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch { /* best-effort cleanup */ }
  }
}

/* --------------------------------------------------------------- request */

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    };
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        fail(new BodyTooLarge(`body supera ${MAX_BODY} bytes`));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks));
    });
    req.on('error', fail);
  });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    log(`origen no permitido: ${origin} · ${req.method} ${req.url}`);
    return send(res, 403, { ok: false, error: `origen no permitido: ${origin}` });
  }

  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
  const route = url.pathname;

  if (req.method === 'OPTIONS') return send(res, 204, null, origin);
  if (req.method === 'GET' && route === '/health') return handleHealth(res, origin);
  if (req.method === 'GET' && route === '/stats') return handleStats(res, origin);
  if (req.method === 'POST' && route === '/ingest') {
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      return send(res, e instanceof BodyTooLarge ? 413 : 400, { ok: false, error: e.message }, origin);
    }
    return handleIngest(req, res, body, origin);
  }
  return send(res, 404, { ok: false, error: `ruta no encontrada: ${req.method} ${route}` }, origin);
});

server.listen(PORT, HOST, async () => {
  const root = process.env.BRIDGE_DATASET || defaultDatasetRoot();
  const ready = fs.existsSync(path.join(root, 'metadata', 'metadata.csv'));
  log(`cmsc-acoustic-bridge v${LOGGER_VERSION} · http://${HOST}:${PORT}`);
  log(`mission ${MISSION} · dataset ${root}`);
  log(`dataset ${ready ? 'LISTO' : 'NO ENCONTRADO'} · CORS ${ALLOWED_ORIGINS.join(', ')}`);
});