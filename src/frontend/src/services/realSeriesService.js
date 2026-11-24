/**
 * Cliente HTTP del puente MMC ↔ backend para cálculo sobre series reales.
 *
 * Contrato:
 *   GET  /api/v3/cmsc/acoustic-envelopes/            → catálogo C0 REAL-LOCAL
 *   GET  /api/v3/cmsc/acoustic-envelopes/?sample_id=… → una envolvente C0
 *   POST /api/v3/cmsc/real-series-calculus/           → operador fail-closed
 *
 * Vite solo proxifica `/api` al backend (8010). El bridge acústico (8766) NO
 * se expone aquí: sus datos se importan a mano como JSON, sin fetch directo.
 */
const API_ROOT = '/api/v3/cmsc';

const requestJson = async (url, options) => {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json', ...(options?.body ? { 'Content-Type': 'application/json' } : {}) },
    ...options
  });
  let body;
  try {
    body = await response.json();
  } catch (err) {
    throw new Error(`respuesta no JSON del backend (${response.status})`);
  }
  if (!response.ok || body?.ok === false) {
    throw new Error(body?.error || `backend respondió ${response.status}`);
  }
  return body;
};

export const loadEnvelopeCatalog = () => requestJson(`${API_ROOT}/acoustic-envelopes/`);

export const loadEnvelopeSample = (sampleId) => {
  const id = String(sampleId ?? '');
  if (!id) throw new Error('sample_id requerido');
  return requestJson(`${API_ROOT}/acoustic-envelopes/?sample_id=${encodeURIComponent(id)}`);
};

export const computeRealSeries = (payload) => requestJson(
  `${API_ROOT}/real-series-calculus/`,
  { method: 'POST', body: JSON.stringify(payload) }
);
