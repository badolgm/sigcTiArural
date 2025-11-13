#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import { join, basename, dirname, extname } from 'node:path';
import { spawn } from 'node:child_process';

const roots = [
  'docs/diagrams',
  'docs/uml',
  'docs/database',
  'docs/edge'
];

const puppeteerConfig = 'docs/puppeteer-config.json';

function findMmdFiles(dir) {
  const results = [];
  const items = readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = join(dir, it.name);
    if (it.isDirectory()) {
      results.push(...findMmdFiles(p));
    } else if (it.isFile() && extname(p).toLowerCase() === '.mmd') {
      results.push(p);
    }
  }
  return results;
}

function ensureMermaidCliInstalled() {
  try {
    const pkg = require('@mermaid-js/mermaid-cli');
    return !!pkg;
  } catch (e) {
    console.warn('[WARN] @mermaid-js/mermaid-cli no disponible como require, se usará npx mmdc');
    return false;
  }
}

const isWin = process.platform === 'win32';
const mmdcBin = join('node_modules', '.bin', isWin ? 'mmdc.cmd' : 'mmdc');

async function renderOne(inputPath) {
  const base = basename(inputPath, '.mmd');
  const dir = dirname(inputPath);
  const svgOut = join(dir, `${base}.svg`);
  const pngOut = join(dir, `${base}.png`);

  const argsCommon = ['-i', inputPath, '-c', puppeteerConfig, '--scale', '1.25', '--backgroundColor', 'transparent'];

  await new Promise((resolve, reject) => {
    const proc = spawn(mmdcBin, [...argsCommon, '-o', svgOut], { stdio: 'inherit', shell: isWin });
    proc.on('exit', code => code === 0 ? resolve() : reject(new Error(`mmdc svg failed: ${code}`)));
  });

  await new Promise((resolve, reject) => {
    const proc = spawn(mmdcBin, [...argsCommon, '-o', pngOut], { stdio: 'inherit', shell: isWin });
    proc.on('exit', code => code === 0 ? resolve() : reject(new Error(`mmdc png failed: ${code}`)));
  });
}

async function main() {
  ensureMermaidCliInstalled();
  const all = roots.flatMap(r => {
    try {
      return findMmdFiles(r);
    } catch (e) {
      console.warn(`[WARN] Directorio no accesible: ${r}`);
      return [];
    }
  });

  if (!all.length) {
    console.log('No se encontraron archivos .mmd');
    process.exit(0);
  }

  console.log(`Renderizando ${all.length} diagramas…`);
  for (const f of all) {
    console.log(`→ ${f}`);
    try {
      await renderOne(f);
    } catch (e) {
      console.error(`[ERROR] Falló renderizar ${f}: ${e.message}`);
    }
  }
  console.log('Listo. Diagramas actualizados (SVG y PNG).');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});