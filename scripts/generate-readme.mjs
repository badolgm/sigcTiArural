import fs from 'fs';
import path from 'path';

const root = process.cwd();
const docsDir = path.join(root, 'docs');
const headerPath = path.join(docsDir, 'README_HEADER.md');
const outPath = path.join(root, 'README.md');

function listMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function relativeFromDocs(p) {
  return path.relative(docsDir, p).replace(/\\/g, '/');
}

function isRelativePath(href) {
  // Do not rewrite anchors, absolute URLs, or root-absolute paths
  if (!href) return false;
  const trimmed = href.trim();
  if (trimmed.startsWith('#')) return false;
  if (/^[a-zA-Z]+:\/\//.test(trimmed)) return false; // http, https, mailto, etc.
  if (trimmed.startsWith('/')) return false; // repo root absolute
  return true;
}

function toRepoRootPath(relFilePosix, href) {
  // relFilePosix: e.g. "architecture/README.md"; href: e.g. "images/diag.png"
  const baseDir = relFilePosix.includes('/') ? relFilePosix.substring(0, relFilePosix.lastIndexOf('/')) : '';
  const joined = [ 'docs', baseDir, href ].filter(Boolean).join('/');
  // Normalize path segments like ./ and ../ in a light way
  const parts = joined.split('/');
  const stack = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') { if (stack.length) stack.pop(); continue; }
    stack.push(part);
  }
  return stack.join('/');
}

function rewriteMarkdownPaths(content, relFilePosix) {
  // Rewrite Markdown image links: ![alt](href)
  const imgMD = /!\[[^\]]*\]\(([^)]+)\)/g;
  content = content.replace(imgMD, (m, href) => {
    if (!isRelativePath(href)) return m;
    const newHref = toRepoRootPath(relFilePosix, href);
    return m.replace(href, newHref);
  });
  // Rewrite standard Markdown links: [text](href)
  const linkMD = /\[[^\]]+\]\(([^)]+)\)/g;
  content = content.replace(linkMD, (m, href) => {
    if (!isRelativePath(href)) return m;
    const newHref = toRepoRootPath(relFilePosix, href);
    return m.replace(href, newHref);
  });
  // Rewrite HTML <img src="...">
  const imgHTML = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  content = content.replace(imgHTML, (m, href) => {
    if (!isRelativePath(href)) return m;
    const newHref = toRepoRootPath(relFilePosix, href);
    return m.replace(href, newHref);
  });
  return content;
}

function main() {
  if (!fs.existsSync(headerPath)) {
    console.error(`Header not found: ${headerPath}`);
    process.exit(1);
  }

  const header = fs.readFileSync(headerPath, 'utf8');
  const allDocs = listMarkdownFiles(docsDir)
    .filter(p => path.resolve(p) !== path.resolve(headerPath))
    .sort((a, b) => relativeFromDocs(a).localeCompare(relativeFromDocs(b)));

  let compiled = '';
  compiled += header.trimEnd() + '\n\n';
  compiled += '<!-- AUTO-GENERATED: A continuación se integra la documentación completa del repositorio. No editar manualmente esta sección. -->\n\n';

  for (const file of allDocs) {
    const rel = relativeFromDocs(file);
    const raw = fs.readFileSync(file, 'utf8');
    const content = rewriteMarkdownPaths(raw, rel);
    compiled += `\n\n---\n\n`;
    compiled += `# ${rel}\n\n`;
    compiled += content.trimEnd() + '\n';
  }

  fs.writeFileSync(outPath, compiled, 'utf8');
  const lines = compiled.split('\n').length;
  console.log(`README generado en ${outPath}`);
  console.log(`Docs integrados: ${allDocs.length}`);
  console.log(`Líneas totales: ${lines}`);
}

main();