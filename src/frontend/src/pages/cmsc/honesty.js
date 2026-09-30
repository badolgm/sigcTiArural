// Canon único de estados de honestidad (CMSC_CANONICAL_STATES_APPENDIX_V1)
// Siete estados: REAL · REAL-LOCAL · SIM · DISENO · ROTO · HUERFANO · REF
// Fuente única de la leyenda de badges, termómetro y fichas de señal.

export const HONESTY_STATES = ['REAL', 'REAL-LOCAL', 'SIM', 'DISENO', 'ROTO', 'HUERFANO', 'REF'];

export const HONESTY_META = {
  'REAL': { color: '#39FF14', label: 'Real' },
  'REAL-LOCAL': { color: '#00FFa0', label: 'Real local' },
  'SIM': { color: '#FFB300', label: 'Simulada' },
  'DISENO': { color: '#66A3FF', label: 'Diseño' },
  'ROTO': { color: '#FF3131', label: 'Rota' },
  'HUERFANO': { color: '#9CA3AF', label: 'Huérfana' },
  'REF': { color: '#AA66FF', label: 'Referencia' }
};

export const NEON = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  alert: '#FF3131',
  darkBackground: '#0a0a0a'
};

export function honestyMeta(estado) {
  return HONESTY_META[estado] || { color: '#9CA3AF', label: estado || 'Desconocido' };
}

export function formatConfidence(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }
  return Number(value).toFixed(4);
}