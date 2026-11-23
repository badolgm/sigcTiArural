import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MarkdownDocumentView from '../components/MarkdownDocumentView.jsx';
import registry from '../registry/knowledgeRegistry.generated.json';
import {
  ARCHITECTURE_EDGES,
  ARCHITECTURE_NODES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  FOUNDATION,
  STUDY_LAYERS,
  categoriesForDocs,
  docsForLayer,
  layerById,
  noiseDocs,
  studyTotals,
} from '../catalog/knowledgeStudyMap.js';

// KnowledgeHubLayout — Corte A+B (2026-11-23).
// Ruta de estudio por capas + filtro por categoría + apéndice plegable de auditorías
// de herramienta + interruptor Estudio / Índice completo. El renderer del documento
// (MarkdownDocumentView) y la fuente (registry + docLoader) NO se modifican.
// Las 51 entradas siguen accesibles: nadie se borra, sólo se reorganiza la lectura.

const DOCS = registry.documents;

const DocLink = ({ doc, active }) => (
  <Link to={`/knowledge/doc/${doc.id}`} className={`kh-doc${active ? ' is-active' : ''}`} title={doc.canonical_path}>
    <span className="kh-doc-title">
      {doc.source_of_truth && <span className="kh-sot" title="Fuente de verdad">● </span>}
      {doc.title}
    </span>
    <span className="kh-doc-meta">
      {CATEGORY_LABELS[doc.category] || doc.category} · {doc.document_type}
    </span>
  </Link>
);

const KnowledgeHubLayout = () => {
  const { docId } = useParams();
  const activeDocId = docId || DOCS[0]?.id;
  const doc = DOCS.find((d) => d.id === activeDocId);

  const [mode, setMode] = useState('estudio');
  const [activeLayerId, setActiveLayerId] = useState(STUDY_LAYERS[0].id);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [appendixOpen, setAppendixOpen] = useState(false);

  const totals = useMemo(() => studyTotals(DOCS), []);
  const layer = layerById(activeLayerId);
  const layerDocs = useMemo(() => docsForLayer(activeLayerId, DOCS), [activeLayerId]);
  const chips = useMemo(() => categoriesForDocs(layerDocs), [layerDocs]);
  const visibleDocs = useMemo(
    () => (categoryFilter === 'all' ? layerDocs : layerDocs.filter((d) => d.category === categoryFilter)),
    [layerDocs, categoryFilter],
  );
  const appendix = useMemo(() => noiseDocs(DOCS), []);
  const layerCounts = useMemo(
    () => STUDY_LAYERS.reduce((acc, item) => ({ ...acc, [item.id]: docsForLayer(item.id, DOCS).length }), {}),
    [],
  );
  const foundationDocs = useMemo(
    () => FOUNDATION.docIds.map((id) => DOCS.find((d) => d.id === id)).filter(Boolean),
    [],
  );
  const grouped = useMemo(() => {
    const groups = {};
    DOCS.forEach((d) => {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    });
    return groups;
  }, []);
  const nodeLabel = (id) => ARCHITECTURE_NODES.find((n) => n.id === id)?.label || id;

  const selectLayer = (id) => {
    setActiveLayerId(id);
    setCategoryFilter('all');
  };

  return (
    <div className="kh-shell">
      <style>{`
        .kh-shell {
          min-height: 100vh; box-sizing: border-box; padding-top: 72px;
          background: #f5f2ea; color: #1d2b36;
          font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        }
        .kh-top {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
          gap: 14px; padding: 16px 28px 14px; background: #fffdf8;
          border-bottom: 1px solid #d8d2c4;
        }
        .kh-eyebrow {
          font-size: 10px; letter-spacing: .18em; text-transform: uppercase;
          color: #a8621b; font-weight: 700;
        }
        .kh-title {
          margin: 3px 0 2px; font-family: Georgia, 'Times New Roman', serif;
          font-size: 25px; color: #1d2b36;
        }
        .kh-subtitle { margin: 0; font-size: 13px; color: #5c6b73; }
        .kh-stats { font-size: 12px; color: #5c6b73; margin-top: 6px; }
        .kh-stats b { color: #0e6f68; }
        .kh-switch { display: inline-flex; border: 1px solid #d8d2c4; border-radius: 9px; overflow: hidden; background: #fff; }
        .kh-switch button {
          border: 0; background: transparent; color: #5c6b73; cursor: pointer;
          padding: 9px 15px; font-size: 13px; font-weight: 600;
        }
        .kh-switch button.is-active { background: #0e6f68; color: #fff; }
        .kh-grid { display: grid; grid-template-columns: 306px minmax(0, 1fr); align-items: start; }
        .kh-side {
          position: sticky; top: 72px; height: calc(100vh - 72px); overflow-y: auto;
          background: #253642; color: #e8eef0; padding: 18px 13px 28px;
        }
        .kh-side h3 {
          margin: 0 0 4px; font-family: Georgia, serif; font-size: 16px; color: #fff;
        }
        .kh-side-note { margin: 0 0 16px; font-size: 11px; color: #9fb2bd; line-height: 1.5; }
        .kh-side-label {
          margin: 18px 0 8px; font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
          color: #9fb2bd; font-weight: 700;
        }
        .kh-layer {
          display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 8px;
          align-items: center; width: 100%; text-align: left; cursor: pointer;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.12);
          border-radius: 9px; padding: 9px 9px; margin-bottom: 6px; color: #e8eef0;
        }
        .kh-layer:hover { border-color: #e0b377; background: rgba(224,179,119,.08); }
        .kh-layer.is-active { border-color: #e0b377; background: rgba(224,179,119,.16); }
        .kh-layer-num {
          font-family: Georgia, serif; font-size: 17px; color: #e0b377; text-align: center;
        }
        .kh-layer strong { display: block; font-size: 12px; line-height: 1.25; }
        .kh-layer small { display: block; font-size: 10px; color: #9fb2bd; margin-top: 2px; }
        .kh-layer-count { font-size: 11px; color: #e0b377; }
        .kh-foundation { display: flex; flex-wrap: wrap; gap: 4px; }
        .kh-foundation a {
          font-size: 10px; color: #cfe0e6; text-decoration: none; padding: 3px 7px;
          border: 1px solid rgba(255,255,255,.14); border-radius: 20px;
        }
        .kh-foundation a:hover { color: #fff; border-color: #e0b377; }
        .kh-appendix-toggle {
          width: 100%; text-align: left; cursor: pointer; font-size: 11px; font-weight: 700;
          color: #e0b377; background: transparent; border: 1px dashed #7d8f99;
          border-radius: 8px; padding: 8px 9px;
        }
        .kh-appendix { margin-top: 6px; }
        .kh-main { min-width: 0; padding: 18px 26px 40px; }
        .kh-crumb { font-size: 11px; color: #a8621b; letter-spacing: .08em; text-transform: uppercase; }
        .kh-map {
          margin: 10px 0 16px; padding: 16px 20px 18px; background: #fffdf8;
          border: 1px solid #d8d2c4; border-left: 4px solid #0e6f68; border-radius: 12px;
        }
        .kh-map h2 {
          margin: 0 0 4px; font-family: Georgia, serif; font-size: 20px; color: #1d2b36;
        }
        .kh-question { margin: 0 0 12px; font-size: 13px; color: #5c6b73; font-style: italic; }
        .kh-flow { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; overflow-x: auto; padding-bottom: 6px; }
        .kh-edge {
          display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
          font-size: 11px; background: #f0ede3; border: 1px solid #ded8c9;
          border-radius: 20px; padding: 5px 9px;
        }
        .kh-edge .kh-arrow { color: #0e6f68; font-weight: 700; }
        .kh-edge .kh-rel { color: #a8621b; }
        .kh-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 14px; }
        .kh-col { background: #f8f6ef; border: 1px solid #e2ddd1; border-radius: 9px; padding: 11px 12px; }
        .kh-col h4 {
          margin: 0 0 8px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #0e6f68;
        }
        .kh-chip {
          display: inline-block; font-size: 11px; line-height: 1.4; margin: 0 4px 4px 0;
          padding: 3px 8px; border-radius: 5px; background: #fff; border: 1px solid #ded8c9; color: #344650;
        }
        .kh-outcomes { margin: 12px 0 0; padding-left: 18px; font-size: 12px; color: #344650; line-height: 1.6; }
        .kh-legend { margin-top: 10px; font-size: 10px; color: #7b8589; }
        .kh-body { display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 18px; align-items: start; }
        .kh-list {
          max-height: calc(100vh - 320px); min-height: 260px; overflow-y: auto;
          background: #fffdf8; border: 1px solid #d8d2c4; border-radius: 12px; padding: 12px;
        }
        .kh-filters { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
        .kh-filter {
          cursor: pointer; font-size: 10px; padding: 4px 8px; border-radius: 20px;
          border: 1px solid #d8d2c4; background: #fff; color: #5c6b73;
        }
        .kh-filter.is-active { background: #0e6f68; color: #fff; border-color: #0e6f68; }
        .kh-doc {
          display: block; text-decoration: none; border: 1px solid #e2ddd1; border-left: 3px solid #cfc8b8;
          border-radius: 8px; background: #fff; padding: 8px 10px; margin-bottom: 7px;
        }
        .kh-doc:hover { border-left-color: #a8621b; background: #fffaf0; }
        .kh-doc.is-active { border-left-color: #0e6f68; background: #eef6f3; }
        .kh-doc-title { display: block; font-size: 12px; line-height: 1.35; color: #1d2b36; }
        .kh-doc-meta { display: block; font-size: 10px; color: #7b8589; margin-top: 3px; }
        .kh-sot { color: #0e6f68; }
        .kh-empty { font-size: 12px; color: #7b8589; padding: 10px 2px; }
        .kh-group-title {
          margin: 14px 0 7px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
          color: #a8621b; border-bottom: 1px solid #e2ddd1; padding-bottom: 4px;
        }
        .kh-read { min-width: 0; background: #0f1629; border-radius: 12px; overflow: hidden; }
        .kh-note { font-size: 11px; color: #7b8589; margin-top: 12px; line-height: 1.6; }
        @media (max-width: 1120px) {
          .kh-grid { grid-template-columns: 1fr; }
          .kh-side { position: static; height: auto; }
          .kh-body { grid-template-columns: 1fr; }
          .kh-list { max-height: none; }
          .kh-cols { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="kh-top">
        <div>
          <div className="kh-eyebrow">Conocimiento aplicado · sigcTiArural</div>
          <h1 className="kh-title">Ingeniería de software, señales y evidencia</h1>
          <p className="kh-subtitle">Ruta de estudio: cómo funciona el dashboard y cómo se construyó el proyecto.</p>
          <div className="kh-stats">
            <b>{totals.total}</b> documentos indexados · <b>{totals.study}</b> en ruta de estudio ·{' '}
            <b>{totals.noise}</b> en apéndice de herramienta
          </div>
        </div>
        <div className="kh-switch" role="group" aria-label="Modo de navegación">
          <button type="button" className={mode === 'estudio' ? 'is-active' : ''} onClick={() => setMode('estudio')}>
            Estudio
          </button>
          <button type="button" className={mode === 'indice' ? 'is-active' : ''} onClick={() => setMode('indice')}>
            Índice completo ({totals.total})
          </button>
        </div>
      </header>

      <div className="kh-grid">
        <aside className="kh-side">
          <h3>Ruta de estudio</h3>
          <p className="kh-side-note">Cinco capas, de la captura de señales a la trazabilidad del conocimiento.</p>

          {STUDY_LAYERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`kh-layer${activeLayerId === item.id && mode === 'estudio' ? ' is-active' : ''}`}
              onClick={() => { selectLayer(item.id); setMode('estudio'); }}
            >
              <span className="kh-layer-num">{item.index}</span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
              <span className="kh-layer-count">{layerCounts[item.id] || 0}</span>
            </button>
          ))}

          <div className="kh-side-label">Punto de partida · cómo se construyó</div>
          <div className="kh-foundation">
            {foundationDocs.map((d) => (
              <Link key={d.id} to={`/knowledge/doc/${d.id}`} title={d.canonical_path}>{d.title}</Link>
            ))}
          </div>

          <div className="kh-side-label">Contexto de herramienta</div>
          <button
            type="button"
            className="kh-appendix-toggle"
            aria-expanded={appendixOpen}
            onClick={() => setAppendixOpen((open) => !open)}
          >
            {appendixOpen ? '▾' : '▸'} Apéndice — auditorías de herramienta ({appendix.length})
          </button>
          {appendixOpen && (
            <div className="kh-appendix">
              <p className="kh-side-note">No borradas: también están en Índice completo.</p>
              {appendix.map((d) => <DocLink key={d.id} doc={d} active={d.id === activeDocId} />)}
            </div>
          )}
        </aside>

        <main className="kh-main">
          {mode === 'estudio' ? (
            <>
              <div className="kh-crumb">Estudio / {layer.index} {layer.title}</div>
              <section className="kh-map" aria-label="Mapa de relaciones de la capa">
                <h2>Mapa de relaciones · {layer.title}</h2>
                <p className="kh-question">{layer.question}</p>
                <div className="kh-flow">
                  {ARCHITECTURE_EDGES.map((edge) => (
                    <span className="kh-edge" key={`${edge.from}-${edge.to}`}>
                      {nodeLabel(edge.from)} <span className="kh-arrow">→</span>{' '}
                      <span className="kh-rel">{edge.label}</span> <span className="kh-arrow">→</span>{' '}
                      {nodeLabel(edge.to)}
                    </span>
                  ))}
                </div>
                <div className="kh-cols">
                  <div className="kh-col">
                    <h4>Entidades</h4>
                    {layer.entities.map((item) => <span className="kh-chip" key={item}>{item}</span>)}
                  </div>
                  <div className="kh-col">
                    <h4>Módulos / clases</h4>
                    {layer.modules.map((item) => <span className="kh-chip" key={item}>{item}</span>)}
                  </div>
                  <div className="kh-col">
                    <h4>Contratos</h4>
                    {layer.contracts.map((item) => <span className="kh-chip" key={item}>{item}</span>)}
                  </div>
                </div>
                <ul className="kh-outcomes">
                  {layer.outcomes.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <div className="kh-legend">
                  Mapa conceptual declarativo. Los estados son honestos: REAL · REAL-LOCAL · REF · SIM · DISENO.
                  El asistente con contexto del Knowledge Hub y el ACP son evolución futura, no funcionalidad actual.
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="kh-crumb">Índice completo · todos los documentos del registry</div>
              <section className="kh-map">
                <h2>Índice documental</h2>
                <p className="kh-question">
                  Las {totals.total} entradas originales, agrupadas por su categoría canónica. Incluye el apéndice de auditorías.
                </p>
              </section>
            </>
          )}

          <div className="kh-body">
            <section className="kh-list" aria-label="Documentos de la capa">
              {mode === 'estudio' ? (
                <>
                  <div className="kh-filters">
                    <button
                      type="button"
                      className={`kh-filter${categoryFilter === 'all' ? ' is-active' : ''}`}
                      onClick={() => setCategoryFilter('all')}
                    >
                      Todas ({layerDocs.length})
                    </button>
                    {chips.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        className={`kh-filter${categoryFilter === chip.id ? ' is-active' : ''}`}
                        onClick={() => setCategoryFilter(chip.id)}
                        title={chip.label}
                      >
                        {chip.label} ({chip.count})
                      </button>
                    ))}
                  </div>
                  {visibleDocs.length ? (
                    visibleDocs.map((d) => <DocLink key={d.id} doc={d} active={d.id === activeDocId} />)
                  ) : (
                    <div className="kh-empty">No hay documentos para este filtro.</div>
                  )}
                  <p className="kh-note">
                    Algunos documentos aparecen en más de una capa: son puentes entre contratos, datos y validación.
                  </p>
                </>
              ) : (
                CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
                  <div key={cat}>
                    <div className="kh-group-title">{CATEGORY_LABELS[cat] || cat} ({grouped[cat].length})</div>
                    {grouped[cat].map((d) => <DocLink key={d.id} doc={d} active={d.id === activeDocId} />)}
                  </div>
                ))
              )}
            </section>

            <section className="kh-read" aria-label="Lectura del documento">
              {doc ? (
                <MarkdownDocumentView docId={doc.id} title={doc.title} />
              ) : (
                <div style={{ padding: '24px', color: '#ffb4a8' }}>
                  Documento no encontrado en el registry: {docId}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default KnowledgeHubLayout;
