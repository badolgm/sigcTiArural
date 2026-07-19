import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { loadDocument } from '../services/docLoader.js';
import { anchorizeHeadings, markMermaidBlocks } from '../services/markdownRenderUtils.js';

// MarkdownDocumentView — MVP del Knowledge Hub (FASE 8D)
// Render 100% local: marked + mermaid como dependencias reales de npm,
// sin fetch a raw.githubusercontent.com ni imports desde CDN.
// Reutiliza explícitamente la lógica de TOC/anchors/mermaid ya presente en DocsMasterdoc.jsx.

let mermaidInitialized = false;

const MarkdownDocumentView = ({ docId, title }) => {
  const [html, setHtml] = useState('<p>Cargando documento...</p>');
  const [toc, setToc] = useState([]);
  const [tocOpen, setTocOpen] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    try {
      const rawMarkdown = loadDocument(docId);
      const parsed = marked.parse(rawMarkdown);
      const withMermaidBlocks = markMermaidBlocks(parsed);
      const { html: withAnchors, toc: generatedToc } = anchorizeHeadings(withMermaidBlocks);

      setHtml(withAnchors);
      setToc(generatedToc);

      if (!mermaidInitialized) {
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
        mermaidInitialized = true;
      }
      // Espera al próximo tick para que el HTML ya esté en el DOM antes de renderizar Mermaid.
      setTimeout(() => {
        mermaid.run({ querySelector: '.mermaid' }).catch((e) => {
          console.warn('Knowledge Hub: error renderizando Mermaid', e);
        });
      }, 50);
    } catch (e) {
      setError(e.message);
      setHtml('<p>No se pudo cargar el documento localmente.</p>');
    }
  }, [docId]);

  return (
    <div style={{ padding: '24px', color: '#eafffb', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', marginBottom: '16px', textShadow: '0 0 10px #00e5ff' }}>
        {title}
      </h1>

      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '12px' }}>Error: {error}</div>
      )}

      {toc.length > 0 && (
        <div style={{
          background: '#0a1a2f', border: '1px solid #1f2a44', borderRadius: '10px', marginBottom: '16px',
          boxShadow: '0 0 12px rgba(0,229,255,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
            <strong style={{ color: '#9de8ff' }}>Tabla de contenidos</strong>
            <button
              onClick={() => setTocOpen((v) => !v)}
              style={{ background: '#0f253f', color: '#cff7ff', border: '1px solid #1f2a44', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
            >{tocOpen ? 'Ocultar' : 'Mostrar'}</button>
          </div>
          {tocOpen && (
            <ul style={{ listStyle: 'none', margin: 0, padding: '8px 14px', maxHeight: '38vh', overflow: 'auto' }}>
              {toc.map((h, idx) => (
                <li key={idx} style={{ padding: '4px 0', marginLeft: `${(h.level - 1) * 12}px` }}>
                  <a href={`#${h.slug}`} style={{ color: '#bdf1ff', textDecoration: 'none' }}>{h.text}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div
        className="markdown-body knowledge-hub-markdown"
        style={{
          background: '#0f1629',
          border: '1px solid #1f2a44',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 0 20px rgba(0,229,255,0.15)',
          lineHeight: 1.75,
          fontSize: '16px',
          letterSpacing: '0.2px',
          overflowX: 'auto',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default MarkdownDocumentView;
