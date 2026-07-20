// docLoader.js — Knowledge Hub (FASE 8D MVP, expandido en FASE 8E)
// Carga contenido Markdown LOCAL en build-time con import.meta.glob (Vite).
// NO hace fetch a raw.githubusercontent.com ni a ningún CDN.
//
// A partir de FASE 8E, la resolución ya no es un mapa fijo de 2 documentos:
// se resuelve dinámicamente contra `canonical_path` tal como está declarado
// en knowledgeRegistry.generated.json, para soportar el ecosistema completo
// (project-core, eiarc-foundation, eiarc-architecture, knowledge-base,
// historical, research-v2) sin tocar esta lógica cada vez que crezca el registry.

import registry from '../registry/knowledgeRegistry.generated.json';

// Desde src/frontend/src/knowledge-hub/services/docLoader.js, la raíz del repo
// está 5 niveles arriba: services -> knowledge-hub -> src -> frontend -> src -> (repo root)
const modules = import.meta.glob(
  [
    '../../../../../README.md',
    '../../../../../SIGCT_RURAL_SYSTEM_BOOT.md',
    '../../../../../docs/MASTERDOC.md',
    '../../../../../docs/PLAN_MAESTRO.md',
    '../../../../../docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md',
    '../../../../../docs/EDGE_SETUP.md',
    '../../../../../docs/API_REFERENCE.md',
    '../../../../../docs/eiarc/**/*.md',
    '../../../../../docs/project_knowledge_base/*.md',
    '../../../../../docs/historical/*.md',
    '../../../../../docs/ai/research_v2/*.md',
  ],
  { query: '?raw', import: 'default', eager: true }
);

// Índice normalizado (barras hacia adelante) de todo lo que import.meta.glob resolvió.
const contentByNormalizedKey = {};
Object.entries(modules).forEach(([key, content]) => {
  contentByNormalizedKey[key.replace(/\\/g, '/')] = content;
});

const resolveContentByCanonicalPath = (canonicalPath) => {
  const normalized = canonicalPath.replace(/\\/g, '/');
  const matchKey = Object.keys(contentByNormalizedKey).find((k) => k.endsWith(normalized));
  return matchKey ? contentByNormalizedKey[matchKey] : null;
};

export function loadDocument(docId) {
  const doc = registry.documents.find((d) => d.id === docId);
  if (!doc) {
    throw new Error(`docLoader: "${docId}" no existe en knowledgeRegistry.generated.json.`);
  }
  const content = resolveContentByCanonicalPath(doc.canonical_path);
  if (!content) {
    throw new Error(`docLoader: no se pudo cargar "${doc.canonical_path}" (docId: "${docId}") — verificar el patrón de import.meta.glob.`);
  }
  return content;
}

export function isKnownDocument(docId) {
  return registry.documents.some((d) => d.id === docId);
}
