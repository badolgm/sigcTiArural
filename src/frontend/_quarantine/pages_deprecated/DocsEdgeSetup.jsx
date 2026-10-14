import React, { useEffect, useState } from 'react';

// Importa marked desde CDN como módulo ESM (compatible con Vite)
// Nota: Usamos fuente confiable del propio repo/GitHub.
// Si en producción se requiere sanitización adicional, podemos añadir DOMPurify vía CDN.
// eslint-disable-next-line no-unused-vars
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/+esm';

const DocsEdgeSetup = () => {
  const [html, setHtml] = useState('<p>Cargando documento EDGE_SETUP...</p>');
  const [error, setError] = useState(null);

  useEffect(() => {
    const sourceUrl = 'https://raw.githubusercontent.com/badolgm/sigcTiArural/main/docs/EDGE_SETUP.md';
    fetch(sourceUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((md) => {
        const rendered = marked.parse(md);
        setHtml(rendered);
      })
      .catch((e) => {
        setError(e.message);
        setHtml('<p>No se pudo cargar el documento.</p>');
      });
  }, []);

  return (
    <div style={{ padding: '24px', color: '#eafffb', background: '#0b1220', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '16px', textShadow: '0 0 10px #39ff14' }}>
        📘 Guía EDGE_SETUP (SIGC&T)
      </h1>
      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '12px' }}>Error: {error}</div>
      )}
      <div
        className="markdown-body"
        style={{
          background: '#0f1629',
          border: '1px solid #1f2a44',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 0 20px rgba(57,255,20,0.15)',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default DocsEdgeSetup;