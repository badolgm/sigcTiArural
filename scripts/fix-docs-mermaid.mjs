import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'docs', 'MASTERDOC.md'),
  path.join(process.cwd(), 'docs', 'MASTERDOC_v4.2_DAS.md'),
  path.join(process.cwd(), 'docs', 'PLAN_MAESTRO_v4.2.md'),
];

const starters = [
  { key: 'mermaidgraph TD', head: 'graph TD' },
  { key: 'mermaidflowchart TD', head: 'flowchart TD' },
  { key: 'mermaidflowchart', head: 'flowchart' },
  { key: 'mermaidsequenceDiagram', head: 'sequenceDiagram' },
  { key: 'mermaidclassDiagram', head: 'classDiagram' },
  { key: 'mermaidstateDiagram', head: 'stateDiagram' },
  { key: 'mermaiderDiagram', head: 'erDiagram' },
];

function processContent(content) {
  const lines = content.split(/\r?\n/);
  let out = [];
  let insideMermaid = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!insideMermaid) {
      const starter = starters.find(s => line.includes(s.key));
      if (starter) {
        // Insert fence start and the diagram header
        out.push('```mermaid');
        out.push(starter.head);
        insideMermaid = true;
        // Preserve the rest of the line (minus the starter) if any
        const rest = line.replace(starter.key, '').trim();
        if (rest) out.push(rest);
        continue;
      }
      out.push(line);
    } else {
      // End the mermaid block before next section header or horizontal rule
      const isHeader = /^\s*#{1,6}\s/.test(line) || /^\s*---\s*$/.test(line);
      if (isHeader) {
        out.push('```');
        insideMermaid = false;
        out.push(line);
      } else {
        out.push(line);
      }
    }
  }
  if (insideMermaid) out.push('```');
  return out.join('\n');
}

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn(`Skip missing file: ${file}`);
    continue;
    }
  const original = fs.readFileSync(file, 'utf8');
  const processed = processContent(original);
  if (processed !== original) {
    fs.writeFileSync(file, processed, 'utf8');
    console.log(`Formatted mermaid fences in ${file}`);
  } else {
    console.log(`No changes for ${file}`);
  }
}