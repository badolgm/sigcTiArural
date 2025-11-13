#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const reportPath = 'docs/MASTER_REPORT_SIGCTRURAL.md';
const masterdocPath = 'docs/MASTERDOC.md';
const readmePath = 'README.md';
const outMd = 'docs/MASTER_REPORT_FULL.md';

function safeRead(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (e) {
    console.warn(`[WARN] No se pudo leer ${path}: ${e.message}`);
    return `\n> [No se encontró ${path}]\n`;
  }
}

const header = `# SIGC&T Rural — Reporte Maestro Completo (PDF consolidado)\n\n` +
`Este documento consolida el reporte maestro, el MASTERDOC y el README en un único PDF.\n\n` +
`<script src="../node_modules/mermaid/dist/mermaid.min.js"></script>\n` +
`<script>mermaid.initialize({ startOnLoad: true, securityLevel: 'loose', flowchart: { htmlLabels: true }, theme: 'neutral' });</script>\n\n` +
`## Tabla de Contenidos\n` +
`- Reporte Maestro (Estado y Plan)\n` +
`- MASTERDOC (Documento de Arquitectura de Software)\n` +
`- README del repositorio\n\n`;

const report = safeRead(reportPath);
const masterdoc = safeRead(masterdocPath);
const readme = safeRead(readmePath);

const combined = [
  header,
  '\n',
  report,
  '\n\n<div class="page-break"></div>\n\n',
  '# Anexo A — MASTERDOC (DAS)\n\n',
  masterdoc,
  '\n\n<div class="page-break"></div>\n\n',
  '# Anexo B — README del Repositorio\n\n',
  readme,
].join('');

writeFileSync(outMd, combined);
console.log(`Generado Markdown combinado en ${outMd}`);
console.log('Para generar PDF: npx md-to-pdf docs/MASTER_REPORT_FULL.md --stylesheet docs/styles/report.css');