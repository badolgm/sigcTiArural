// docsBySignal v1 · selector de lectura registry ± mapa.
// Única fuente: knowledgeRegistry.generated.json (51 docs, 6 categorías).
// Regla F3E-3: vista derivada, cero punteros escritos en ninguno de los lados.
import registry from '../knowledge-hub/registry/knowledgeRegistry.generated.json';
import { SIGNAL_CATALOG } from '../pages/cmsc/signalCatalog.js';

const DOCS = Array.isArray(registry?.documents) ? registry.documents : [];

const CATEGORY_ORDER = ['project-core', 'eiarc-architecture', 'eiarc-foundation', 'research-v2', 'knowledge-base', 'historical'];

// Palabras clave por señal, derivadas del SIGNAL_MAP y de los tags del registry.
const SIGNAL_KEYWORDS = {
  S10: ['temp', 'temperatura', 'humidity', 'humedad', 'telemetry', 'sensor'],
  S11: ['humidity', 'humedad', 'temp', 'temperatura', 'telemetry'],
  S20: ['ubtn', 'bio', 'physiology', 'animal', 'ganado', 'abeja'],
  S30: ['audio', 'telecom', 'microphone', 'acoustic', 'signal', 'fft'],
  S50: ['robo', 'robotics', 'robot'],
  S61: ['ai', 'inference', 'infer', 'disease', 'vision', 'plant'],
  S70: ['dataset', 'benchmark', 'agriculture', 'mnv', 'mobilenet', 'efficientnet', 'm2'],
  S72: ['benchmark', 'mnv', 'm1', 'mobilenet'],
  S73: ['benchmark', 'm2', 'efficientnet'],
  S74: ['model', 'plant_disease', 'mbv2'],
  S79: ['knowledge', 'registry']
};

function keywordMatches(doc) {
  const haystack = [
    ...(doc.tags || []),
    doc.canonical_path || '',
    doc.title || '',
    doc.category || ''
  ].join(' ').toLowerCase();
  return (terms) => terms.some((t) => haystack.includes(t.toLowerCase()));
}

function buildIndex() {
  const index = {};
  SIGNAL_CATALOG.forEach((signal) => {
    index[signal.signal_id] = [];
  });
  const matcher = keywordMatches;
  DOCS.forEach((doc) => {
    let linked = false;
    Object.entries(SIGNAL_KEYWORDS).forEach(([signalId, terms]) => {
      const tokens = new RegExp(signalId, 'i');
      const direct = tokens.test([doc.tags || [], doc.canonical_path || '', doc.title || ''].join(' '));
      if (direct || matcher(doc)(terms)) {
        index[signalId].push(doc);
        linked = true;
      }
    });
    if (linked) {
      index.S79.push(doc);
    }
  });
  return index;
}

const DOC_INDEX = buildIndex();

export function allRegistryDocs() {
  return DOCS;
}

export function docsBySignal(signalId) {
  const docs = DOC_INDEX[signalId] || [];
  return [...docs];
}

export function categoryCounts() {
  const counts = {};
  CATEGORY_ORDER.forEach((cat) => (counts[cat] = 0));
  DOCS.forEach((doc) => {
    if (counts[doc.category] !== undefined) {
      counts[doc.category] += 1;
    } else {
      counts[doc.category] = 1;
    }
  });
  return counts;
}

export function categorySummary() {
  const counts = categoryCounts();
  return CATEGORY_ORDER.map((cat) => ({ category: cat, count: counts[cat] || 0 }))
    .filter((c) => c.count > 0);
}

export function totalDocs() {
  return DOCS.length;
}