// acousticBridge.js · cliente del puente acústico local (Tramo B)
//
// El bridge acústico (tools/cmsc-data-logger/bridge/server.js) es la ÚNICA vía por la
// que la UI puede ejecutar la ingesta real: recibe el WAV + manifest, invoca el mismo
// motor que el CLI (ingestWav) y devuelve su veredicto. La UI jamás decide
// accepted/quarantine/rejected por su cuenta: solo refleja la respuesta.
//
// Convención de puerto: 127.0.0.1:8766 (BRIDGE_PORT). Local-only.

export const BRIDGE_URL = 'http://127.0.0.1:8766';

export function encodeWavPcm16(samples, sampleRate) {
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const w = (o, s) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, 'RIFF');
  v.setUint32(4, 36 + n * 2, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, 'data');
  v.setUint32(40, n * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    o += 2;
  }
  return buf;
}

export async function bridgeHealth(timeoutMs = 1500) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(`${BRIDGE_URL}/health`, { signal: ctrl.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Envía una toma al bridge para ingesta real (o dry-run).
 * @param {ArrayBuffer} wavBytes WAV PCM16 ya codificado (encodeWavPcm16)
 * @param {object} packet manifest de captura (cmsc.acoustic.capture.v1)
 * @returns {Promise<object>} { ok, verdict, sample_id, failed, checks, ... } o error
 */
export async function postIngest(wavBytes, packet, { dryRun = false } = {}) {
  const form = new FormData();
  form.append('wav', new Blob([wavBytes], { type: 'audio/wav' }), 'take.wav');
  form.append('manifest', JSON.stringify(packet));
  if (dryRun) form.append('dry_run', '1');

  let res;
  try {
    res = await fetch(`${BRIDGE_URL}/ingest`, { method: 'POST', body: form });
  } catch (e) {
    return { ok: false, error: 'bridge no disponible', reason: e.message };
  }

  let data = null;
  try {
    data = await res.json();
  } catch { /* body no JSON */ }

  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}`, reason: data?.error || '' };
  }
  return { ok: true, ...data };
}

/** Conteos reales del dataset (leídos por el bridge desde el disco). */
export async function getStats() {
  const res = await fetch(`${BRIDGE_URL}/stats`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}