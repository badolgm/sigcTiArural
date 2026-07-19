import React from 'react';
import { Link, useParams } from 'react-router-dom';
import MarkdownDocumentView from '../components/MarkdownDocumentView.jsx';
import registry from '../registry/knowledgeRegistry.generated.json';

// KnowledgeHubLayout — FASE 8D (MVP) + FASE 8E (registry expandido, agrupación por categoría)
// Alcance: navegación única agrupada por categoría. Sin búsqueda, sin timeline,
// sin grafo de relaciones, sin backend.

// Orden y etiqueta visual de categorías — coincide con la taxonomía ya definida
// en KNOWLEDGE_HUB_ARCHITECTURE.md / IMPLEMENTATION_SPEC.md, más "research-v2"
// (hallazgo de FASE 8C: el programa de IA V2 no tenía categoría propia).
const CATEGORY_ORDER = [
  'project-core',
  'eiarc-foundation',
  'eiarc-architecture',
  'knowledge-base',
  'research-v2',
  'historical',
];

const CATEGORY_LABELS = {
  'project-core': '📌 Núcleo del Proyecto',
  'eiarc-foundation': '🌱 EIARC — Fundación',
  'eiarc-architecture': '🏗️ EIARC — Arquitectura',
  'knowledge-base': '🧠 Knowledge Base',
  'research-v2': '🔬 AI Research V2',
  historical: '🗄️ Histórico',
};

const groupByCategory = (documents) => {
  const groups = {};
  documents.forEach((doc) => {
    if (!groups[doc.category]) groups[doc.category] = [];
    groups[doc.category].push(doc);
  });
  return groups;
};

const KnowledgeHubLayout = () => {
  const { docId } = useParams();
  const activeDocId = docId || registry.documents[0]?.id;
  const doc = registry.documents.find((d) => d.id === activeDocId);
  const grouped = groupByCategory(registry.documents);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b1220' }}>
      <aside style={{
        width: '280px',
        flexShrink: 0,
        background: '#0a1a2f',
        borderRight: '1px solid #1f2a44',
        padding: '20px 12px',
        overflowY: 'auto',
        maxHeight: '100vh',
      }}>
        <h2 style={{ color: '#00e5ff', fontSize: '16px', marginBottom: '4px', textShadow: '0 0 8px #00e5ff' }}>
          📚 Knowledge Hub
        </h2>
        <p style={{ color: '#5f7a94', fontSize: '11px', marginBottom: '18px' }}>
          {registry.documents.length} documentos indexados
        </p>

        {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((category) => (
          <div key={category} style={{ marginBottom: '18px' }}>
            <div style={{
              color: '#6ea8c7',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '4px 8px',
              marginBottom: '4px',
              borderBottom: '1px solid #16233a',
            }}>
              {CATEGORY_LABELS[category] || category}
              <span style={{ float: 'right', color: '#3d5670', fontWeight: 400 }}>
                {grouped[category].length}
              </span>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {grouped[category].map((d) => (
                <Link
                  key={d.id}
                  to={`/knowledge/doc/${d.id}`}
                  title={d.canonical_path}
                  style={{
                    color: d.id === activeDocId ? '#0b1220' : '#cff7ff',
                    background: d.id === activeDocId ? '#00e5ff' : 'transparent',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {d.source_of_truth && <span style={{ color: d.id === activeDocId ? '#0b1220' : '#4ade80' }}>● </span>}
                  {d.title}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </aside>
      <main style={{ flexGrow: 1, minWidth: 0 }}>
        {doc ? (
          <MarkdownDocumentView docId={doc.id} title={doc.title} />
        ) : (
          <div style={{ padding: '24px', color: '#ff6b6b' }}>
            Documento no encontrado en el registry: {docId}
          </div>
        )}
      </main>
    </div>
  );
};

export default KnowledgeHubLayout;
