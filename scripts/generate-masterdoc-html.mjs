#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const root = process.cwd();
const mdPath = path.join(root, 'docs', 'MASTERDOC.md');
const mdRel = path.join('docs', 'MASTERDOC.md');
const htmlPath = path.join(root, 'docs', 'MASTERDOC.html');

if (!fs.existsSync(mdPath)) {
  console.error('No existe docs/MASTERDOC.md');
  process.exit(1);
}

// 1) Generar HTML desde Markdown con Marked
const md = fs.readFileSync(mdPath, 'utf8');
let body = marked.parse(md);

const injectHead = `\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-dark.min.css">\n  <style>\n    body { background:#0b1220; color:#eafffb; }\n    .markdown-body {\n      background:#0f1629; border:1px solid #1f2a44; border-radius:12px; padding:28px;\n      box-shadow:0 0 20px rgba(0,229,255,0.15); max-width:1000px; margin:24px auto;\n      line-height:1.75; font-size:16px; letter-spacing:0.2px;\n    }\n    pre code { font-size: 14px; }\n    img { max-width: 100%; }\n  </style>`;
let html = `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>MASTERDOC</title>${injectHead}\n</head>\n<body>\n<div class="markdown-body">${body}</div>\n</body>\n</html>`;

// Convertir bloques mermaid en divs para renderizado
html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, '<div class="mermaid">$1</div>');

// Inyectar Mermaid y auto-render
const injectMermaid = `\n<script type="module">\n  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/+esm';\n  mermaid.initialize({ startOnLoad: true, theme: 'dark' });\n  mermaid.run({ querySelector: '.mermaid' });\n</script>`;
html = html.replace(/<\/body>/i, `${injectMermaid}\n</body>`);

// 3) Guardar HTML final y limpiar temporal
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`HTML generado en ${htmlPath}`);