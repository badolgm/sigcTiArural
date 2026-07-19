// markdownRenderUtils.js — reutilizado explícitamente de src/frontend/src/pages/DocsMasterdoc.jsx
// (slugify, anchorizeHeadings) — misma lógica, sin reescribir, adaptada a módulo compartido
// para el Knowledge Hub (FASE 8D).

const stripTags = (html) => html.replace(/<[^>]*>/g, '').trim();

export const slugify = (text) => stripTags(text)
  .toLowerCase()
  .normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

export const anchorizeHeadings = (html) => {
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

// Reutilizado de DocsMasterdoc.jsx: convierte bloques ```mermaid``` renderizados
// por marked en <div class="mermaid"> para que el paquete mermaid local los procese.
export const markMermaidBlocks = (renderedHtml) => renderedHtml.replace(
  /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
  '<div class="mermaid">$1</div>'
);
