// knowledgeDiscovery v2 · capa de descubrimiento CMSC (solo lectura).
// Deriva CONCLUSIONES, INCERTIDUMBRES, OPORTUNIDADES y PRÓXIMOS PASOS en frases humanas.
// Los IDs y métricas quedan como ancla discreta, jamás como protagonista.
// Contrato F3E: vista derivada, cero escritura; basis única registry + SIGNAL_CATALOG.
import { SIGNAL_CATALOG } from './signalCatalog.js';
import { docsBySignal, totalDocs } from '../../services/docsBySignal.js';
import { HONESTY_STATES } from './honesty.js';

const DOMINIOS = [...new Set(SIGNAL_CATALOG.map((s) => s.dominio))].sort();

export const CATEGORY_LABELS = {
  'project-core': 'Proyecto',
  'eiarc-architecture': 'Arquitectura',
  'eiarc-foundation': 'Fundación',
  'research-v2': 'Investigación',
  'knowledge-base': 'Base de conocimiento',
  'historical': 'Histórico'
};

const getDocs = (signalId) => docsBySignal(signalId);
const byId = (signalId) => SIGNAL_CATALOG.find((s) => s.signal_id === signalId);

export function knowledgeStats() {
  return DOMINIOS.map((dominio) => {
    const senales = SIGNAL_CATALOG.filter((s) => s.dominio === dominio);
    let soporteDocs = 0;
    let conSustento = 0;
    senales.forEach((s) => {
      const n = getDocs(s.signal_id).length;
      soporteDocs += n;
      if (n > 0) conSustento += 1;
    });
    return { dominio, senales: senales.length, soporteDocs, conSustento };
  }).sort((a, b) => b.soporteDocs - a.soporteDocs);
}

export function computedGaps(limit = 6) {
  const prio = (estado) => HONESTY_STATES.indexOf(estado);
  return SIGNAL_CATALOG.filter((s) => getDocs(s.signal_id).length === 0)
    .sort((a, b) => prio(a.estado) - prio(b.estado) || a.signal_id.localeCompare(b.signal_id))
    .slice(0, limit);
}

export function knowledgeTotals() {
  return {
    docs: totalDocs(),
    senales: SIGNAL_CATALOG.length,
    conEvidencia: SIGNAL_CATALOG.filter((s) => getDocs(s.signal_id).length > 0).length
  };
}

export function researchBoard() {
  const totals = knowledgeTotals();
  const gaps = computedGaps(12);
  const m1 = byId('S72');
  const m2 = byId('S73');

  const conclusions = [];
  const uncertainties = [];
  const opportunities = [];
  const nextSteps = [];

  const tele = [byId('S10'), byId('S11')].filter(Boolean);
  if (tele.length === 2) {
    conclusions.push({
      id: 'c-telemetria',
      frase: 'El campo reporta temperatura y humedad en vivo: el dashboard consume lecturas reales y persistidas que ya sustentan análisis.',
      veredicto: 'REAL',
      ancla: ['S10', 'S11'],
      docCount: tele.reduce((acc, s) => acc + getDocs(s.signal_id).length, 0)
    });
  }

  const s30 = byId('S30');
  if (s30) {
    conclusions.push({
      id: 'c-acustica',
      frase: 'La única señal de sonido real del ecosistema es el micrófono del laboratorio, rodeado de un instrumento FFT propio en vivo.',
      veredicto: 'REAL-LOCAL',
      ancla: ['S30'],
      docCount: getDocs('S30').length
    });
  }

  const s61 = byId('S61');
  if (s61) {
    conclusions.push({
      id: 'c-ia',
      frase: 'La IA predictiva responde consultas de diagnóstico vegetal en vivo y deja un registro trazable de cada inferencia.',
      veredicto: 'REAL',
      ancla: ['S61'],
      docCount: getDocs('S61').length
    });
  }

  if (m1 && m2 && m1.confianza && m2.confianza) {
    conclusions.push({
      id: 'c-benchmark',
      frase: `Dos modelos fueron validados sobre el mismo dataset congelado: el challenger alcanza F1 ${m2.confianza}, por encima del baseline ${m1.confianza}.`,
      veredicto: 'PENDIENTE',
      ancla: ['S72', 'S73'],
      docCount: getDocs('S72').length + getDocs('S73').length
    });
  }

  if (m1 && m2) {
    uncertainties.push({
      id: 'u-benchmark',
      frase: 'Aún no se decide cuál de los dos modelos se convierte en el estándar oficial del ecosistema.',
      veredicto: 'PENDIENTE',
      ancla: ['S72', 'S73']
    });
  }

  const s74 = byId('S74');
  if (s74) {
    uncertainties.push({
      id: 'u-s74',
      frase: 'El modelo que estuvo desplegado colapsa toda muestra a una sola clase: su diagnóstico no es confiable.',
      veredicto: 'ROTO',
      ancla: ['S74']
    });
  }

  const s50 = byId('S50');
  if (s50) {
    uncertainties.push({
      id: 'u-s50',
      frase: 'La telemetría del robot no se lee hoy: el cliente apunta a un puerto distinto del backend real.',
      veredicto: 'ROTO',
      ancla: ['S50']
    });
  }

  const vivasSinDocs = SIGNAL_CATALOG.filter(
    (s) => (s.estado === 'REAL' || s.estado === 'REAL-LOCAL') && getDocs(s.signal_id).length === 0
  );
  if (vivasSinDocs.length > 0) {
    uncertainties.push({
      id: 'u-vivas',
      frase: `Hay ${vivasSinDocs.length} señal${vivasSinDocs.length !== 1 ? 'es' : ''} viva${vivasSinDocs.length !== 1 ? 's' : ''} sin respaldo documental: su papel científico todavía no está escrito.`,
      veredicto: 'HUERFANO',
      ancla: vivasSinDocs.slice(0, 3).map((s) => s.signal_id)
    });
  }

  if (gaps.length > 0) {
    const top = gaps.slice(0, 3).map((g) => g.name).join(' · ');
    opportunities.push({
      id: 'o-gaps',
      frase: `${gaps.length} señales del mapa no tienen evidencia documentada (${top}). Cada una es terreno abierto para registrar descubrimiento.`,
      veredicto: 'DISENO',
      ancla: gaps.slice(0, 3).map((g) => g.signal_id)
    });
  }

  const enDiseno = ['S20', 'S77', 'S78'].map(byId).filter(Boolean);
  if (enDiseno.length > 0) {
    opportunities.push({
      id: 'o-diseno',
      frase: 'Fisiología animal, bioacústica y análisis espectral predictivo están en diseño: son las próximas líneas de investigación declaradas.',
      veredicto: 'DISENO',
      ancla: enDiseno.map((s) => s.signal_id)
    });
  }

  nextSteps.push({
    id: 'n-benchmark',
    frase: 'Decidir el estándar oficial de IA entre M1 y M2 con acta de gobernanza.',
    veredicto: 'PENDIENTE',
    ancla: ['S72', 'S73']
  });

  nextSteps.push({
    id: 'n-ledger',
    frase: 'Registrar la evidencia del instrumento espectral en el Ledger de autenticidad (F3E).',
    veredicto: 'DISENO',
    ancla: ['S30']
  });

  nextSteps.push({
    id: 'n-robot',
    frase: 'Reparar el cliente de robótica para recuperar la lectura de telemetría real.',
    veredicto: 'ROTO',
    ancla: ['S50']
  });

  return { conclusions, uncertainties, opportunities, nextSteps, totals, gaps };
}