import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/+esm';

// Utilidad: reescribe rutas relativas de imágenes a URLs absolutas (GitHub Raw)
const toRawUrl = (rel) => `https://raw.githubusercontent.com/badolgm/sigcTiArural/main/docs/${rel}`;
const rewriteRelativeUrls = (md) => {
  // Patrones de imágenes/links dentro de docs
  const folders = ['diagrams/', 'database/', 'uml/', 'edge/'];
  let out = md;
  folders.forEach((folder) => {
    // Markdown: ![alt](folder/file.ext)
    const mdImg = new RegExp(`(!\[[^\]]*\]\()(?:${folder})([^)]+)\)`, 'g');
    out = out.replace(mdImg, (m, p1, p2) => `${p1}${toRawUrl(folder + p2)})`);
    // HTML img src="folder/file.ext"
    const htmlImg = new RegExp(`(src=")(?:${folder})([^"]+)(")`, 'g');
    out = out.replace(htmlImg, (m, p1, p2, p3) => `${p1}${toRawUrl(folder + p2)}${p3}`);
  });
  // Limpia placeholders "Mostrar imagen"
  out = out.replace(/Mostrar imagen/gi, '');
  return out;
};

// Utilidades: tabla de contenidos y anclas
const stripTags = (html) => html.replace(/<[^>]*>/g, '').trim();
const slugify = (text) => stripTags(text)
  .toLowerCase()
  .normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

const anchorizeHeadings = (html) => {
  const toc = [];
  let out = html;
  out = out.replace(/<h([1-6])(?![^>]*id=)[^>]*>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    const text = stripTags(inner);
    const slug = slugify(text);
    toc.push({ level: Number(lvl), text, slug });
    return `<h${lvl} id="${slug}">${inner}</h${lvl}>`;
  });
  const existing = [...out.matchAll(/<h([1-6])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({
    level: Number(m[1]), slug: m[2], text: stripTags(m[3]),
  }));
  existing.forEach((h) => { if (!toc.find((t) => t.slug === h.slug)) toc.push(h); });
  return { html: out, toc };
};

const DocsMasterdoc = () => {
  const [html, setHtml] = useState('<p>Cargando MASTERDOC...</p>');
  const [error, setError] = useState(null);
  const [toc, setToc] = useState([]);
  const [tocOpen, setTocOpen] = useState(true);
  const [mode, setMode] = useState('html'); // 'html' | 'md'

  useEffect(() => {
    const ensureCss = () => {
      if (!document.getElementById('gh-md-css')) {
        const link = document.createElement('link');
        link.id = 'gh-md-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-dark.min.css';
        document.head.appendChild(link);
      }
    };
    ensureCss();

    const fetchAndRender = async () => {
      try {
        const candidates = [
          'https://raw.githubusercontent.com/badolgm/sigcTiArural/main/docs/MASTERDOC.md',
          'https://raw.githubusercontent.com/badolgm/sigcTiArural/main/docs/MASTERDOC_legacy.md',
        ];
        let mdText = null;
        for (const url of candidates) {
          const res = await fetch(url);
          if (res.ok) { mdText = await res.text(); break; }
        }
        if (!mdText) throw new Error('No se pudo obtener el MASTERDOC');

        const preprocessed = rewriteRelativeUrls(mdText);
        let rendered = marked.parse(preprocessed);
        rendered = rendered.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, '<div class="mermaid">$1<\/div>');
        const { html: withAnchors, toc: generatedToc } = anchorizeHeadings(rendered);
        setHtml(withAnchors);
        setToc(generatedToc);

        try {
          const mermaid = await import('https://cdn.jsdelivr.net/npm/mermaid/+esm');
          mermaid.initialize({ startOnLoad: false, theme: 'dark' });
          setTimeout(() => { mermaid.run({ querySelector: '.mermaid' }); }, 50);
        } catch (e) {
          console.warn('Mermaid no disponible:', e);
        }
      } catch (e) {
        setError(e.message);
        setHtml('<p>No se pudo cargar el documento.</p>');
      }
    };

    fetchAndRender();
  }, []);

  return (
    <div style={{ padding: '24px', color: '#eafffb', background: '#0b1220', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '16px', textShadow: '0 0 10px #00e5ff' }}>
        📚 MASTERDOC v4.3 (DAS)
      </h1>
      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '12px' }}>Error: {error}</div>
      )}
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ color: '#9de8ff' }}>Modo de visualización:</span>
        <button
          onClick={() => setMode('html')}
          style={{ background: mode==='html'?'#0f253f':'#0a1a2f', color: '#cff7ff', border: '1px solid #1f2a44', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
        >HTML estático</button>
        <button
          onClick={() => setMode('md')}
          style={{ background: mode==='md'?'#0f253f':'#0a1a2f', color: '#cff7ff', border: '1px solid #1f2a44', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
        >Render Markdown</button>
      </div>
      {mode === 'html' && (
        <iframe
          title="MASTERDOC HTML"
          src="https://raw.githubusercontent.com/badolgm/sigcTiArural/main/docs/MASTERDOC.html"
          style={{ width: '100%', height: '80vh', border: '1px solid #1f2a44', borderRadius: '10px', background: '#0a1a2f' }}
        />
      )}
      {mode === 'md' && (
        <>
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
            className="markdown-body"
            style={{
              background: '#0f1629',
              border: '1px solid #1f2a44',
              borderRadius: '12px',
              padding: '28px',
              boxShadow: '0 0 20px rgba(0,229,255,0.15)',
              maxWidth: '1000px',
              margin: '0 auto',
              lineHeight: 1.75,
              fontSize: '16px',
              letterSpacing: '0.2px',
              overflowX: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </>
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
        className="markdown-body"
        style={{
          background: '#0f1629',
          border: '1px solid #1f2a44',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 0 20px rgba(0,229,255,0.15)',
          maxWidth: '1000px',
          margin: '0 auto',
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

export default DocsMasterdoc;