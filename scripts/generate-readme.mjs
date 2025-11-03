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
    const content = fs.readFileSync(file, 'utf8');
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