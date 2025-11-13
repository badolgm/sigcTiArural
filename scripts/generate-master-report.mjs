#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

const diagrams = [
  { in: 'docs/diagrams/architecture.mmd', out: 'docs/diagrams/architecture.svg' },
  { in: 'docs/diagrams/class_lab_catalog.mmd', out: 'docs/diagrams/class_lab_catalog.svg' },
  { in: 'docs/diagrams/sequence_navigation.mmd', out: 'docs/diagrams/sequence_navigation.svg' },
  { in: 'docs/diagrams/use_cases.mmd', out: 'docs/diagrams/use_cases.svg' },
];

function run(cmd) {
  console.log('> ' + cmd);
  execSync(cmd, { stdio: 'inherit' });
}

// Detectar navegador local y escribir configuración de Puppeteer
const candidates = [
  'C\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
  'C\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
  'C\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
  'C\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
];
let executablePath = null;
for (const p of candidates) {
  if (existsSync(p)) {
    executablePath = p;
    break;
  }
}
const puppeteerConfigPath = 'docs/puppeteer-config.json';
const puppeteerConfig = {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  ...(executablePath ? { executablePath } : {}),
};
writeFileSync(puppeteerConfigPath, JSON.stringify(puppeteerConfig, null, 2));

// Renderizar diagramas Mermaid a SVG
diagrams.forEach(({ in: input, out }) => {
  if (!existsSync(input)) {
    console.warn(`[WARN] No existe ${input}`);
  }
  run(`npx --yes @mermaid-js/mermaid-cli -p ${puppeteerConfigPath} -i ${input} -o ${out}`);
});

// Generar PDF desde Markdown
run(`npx --yes md-to-pdf docs/MASTER_REPORT_SIGCTRURAL.md --stylesheet docs/styles/report.css`);

console.log('\nDocumento PDF generado en docs/MASTER_REPORT_SIGCTRURAL.pdf');