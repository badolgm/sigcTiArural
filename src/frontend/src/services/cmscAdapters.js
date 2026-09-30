// Adaptadores de lectura CMSC v1 (cmscAdapters).
// Contrato F3A §10: cada puerto devuelve señal + estado + trazabilidad.
// Ningún puerto escribe en el store; si el origen no responde => ROTO/DISENO honesto, jamás fabrica.
import { fetchTelemetrySeriesReal, fetchClusterNodesReal } from './cloud.js';

const HISTORY_ENDPOINTS = [
  import.meta.env.VITE_TELEMETRY_HISTORY_URL?.trim(),
  '/api/v3/telemetry/history/'
].filter(Boolean);

const ENVELOPE_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// P-BE-01 · SensorReading V3 (S10/S11) · solo lectura
export async function readTelemetryV3() {
  for (const url of HISTORY_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(url, ENVELOPE_TIMEOUT_MS);
      if (!response.ok) continue;
      const data = await response.json();
      if (data?.context === 'telemetry' && Array.isArray(data?.items)) {
        return {
          ok: true,
          estado: 'REAL',
          signalId: 'S10',
          signalIds: ['S10', 'S11'],
          sourceMode: data?.source_mode || 'unknown',
          count: data?.count || data.items.length,
          items: data.items
        };
      }
    } catch (error) {
      // intentar siguiente endpoint
    }
  }
  return {
    ok: false,
    estado: 'ROTO',
    signalId: 'S10',
    signalIds: ['S10', 'S11'],
    nota: 'Sin respuesta del envelope V3 en los endpoints conocidos'
  };
}

// P-WEATHER-01 · Open-Meteo (S03) · re-etiquetada clima-externo
export async function readWeather() {
  try {
    const data = await fetchTelemetrySeriesReal();
    if (!data || !data.length) {
      return { ok: false, estado: 'DISENO', signalId: 'S03', nota: 'Open-Meteo no respondió' };
    }
    return {
      ok: true,
      estado: 'REAL-LOCAL',
      signalId: 'S03',
      etiqueta: 'clima-externo',
      points: data.length,
      entries: data
    };
  } catch (error) {
    return { ok: false, estado: 'ROTO', signalId: 'S03', nota: 'Fallo en la lectura de clima' };
  }
}

// P-LAB-02 · S30 mic Telecom · lector declarativo (no duplica el analizador)
export async function readMicSpectrumStatus() {
  return {
    ok: true,
    estado: 'REAL-LOCAL',
    signalId: 'S30',
    disponibilidad: 'Solo dentro de /lab-telecom (WebAudio AnalyserNode)',
    nota: 'El slice envuelve la señal por lectura; el analizador FFT vive en TelecomLab y no se duplica'
  };
}

// Saneo R2 · cluster BBB (S04) · etiqueta SIM visible
export async function readClusterLabeled() {
  let nodes = [];
  try {
    nodes = await fetchClusterNodesReal();
  } catch (error) {
    nodes = [];
  }
  if (!nodes || !nodes.length) {
    return { ok: false, estado: 'ROTO', signalId: 'S04', nota: 'Sin respuesta del health backend' };
  }
  return {
    ok: true,
    estado: 'SIM',
    signalId: 'S04',
    nodes: nodes.map((n) => ({
      ...n,
      _honestidad: 'SIM',
      _nota: 'Métricas de health y fabricadas: jamás se muestran como telemetría real de campo'
    }))
  };
}

// Saneo R3 · robot (S50) · ROTO honesto determinista (no llama al cliente roto)
export function readRobotStatus() {
  return {
    ok: false,
    estado: 'ROTO',
    signalId: 'S50',
    nota: 'El cliente de robótica apunta a localhost:8000; el backend real vive en 8010. La corrección de host sale del slice v1'
  };
}

// Orquestador del panel de señales vivas
export async function readLiveSignals() {
  const results = await Promise.allSettled([
    readTelemetryV3().catch(() => ({ ok: false, estado: 'ROTO', signalId: 'S10', nota: 'lectura fallida' })),
    readWeather().catch(() => ({ ok: false, estado: 'ROTO', signalId: 'S03', nota: 'lectura fallida' })),
    readMicSpectrumStatus(),
    readClusterLabeled().catch(() => ({ ok: false, estado: 'ROTO', signalId: 'S04', nota: 'lectura fallida' })),
    Promise.resolve(readRobotStatus())
  ]);

  return results.map((r) => (r.status === 'fulfilled' ? r.value : { ok: false, estado: 'ROTO', nota: 'fallo inesperado' }));
}