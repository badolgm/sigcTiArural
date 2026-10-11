import json
import os
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
INCLUDE_PATTERNS = ['.md', '.json', '.yaml', '.yml']
EXCLUDE_DIRS = {'.git', 'node_modules', '__pycache__', 'build', 'dist', '.local_backups', '.venv', 'venv'}
EXCLUDE_FILES = {'memory_inventory.json'}

def classify(path: Path) -> str:
    p = str(path).lower()
    if 'knowledgehub' in p or 'knowledge' in p:
        return 'Knowledge'
    if 'architecture' in p or 'cmsc' in p:
        return 'Architecture'
    if 'dataset' in p:
        return 'Dataset'
    if 'benchmark' in p or 'm1' in p or 'm2' in p:
        return 'Benchmark'
    if 'bridge' in p or 'tramo' in p or 'logger' in p or 'audit' in p or 'operation' in p:
        return 'Operations'
    if 'governance' in p or 'agents' in p or 'masterdoc' in p:
        return 'Governance'
    return 'Knowledge'

items = []
for root, dirs, files in os.walk(REPO):
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
    for f in files:
        if f in EXCLUDE_FILES:
            continue
        ext = Path(f).suffix
        if ext not in INCLUDE_PATTERNS:
            continue
        fp = Path(root) / f
        rel = str(fp.relative_to(REPO)).replace('\\', '/')
        try:
            size = fp.stat().st_size
        except:
            size = 0
        items.append({
            'path': rel,
            'size_bytes': size,
            'ext': ext,
            'category': classify(fp),
            'indexable': True
        })

items.sort(key=lambda x: x['path'])

inventory = {
    'version': 'F00-v1.0',
    'total': len(items),
    'by_category': {},
    'by_ext': {},
    'items': items
}
for it in items:
    inventory['by_category'][it['category']] = inventory['by_category'].get(it['category'], 0) + 1
    inventory['by_ext'][it['ext']] = inventory['by_ext'].get(it['ext'], 0) + 1

out = REPO / 'docs' / 'memory_inventory.json'
out.write_text(json.dumps(inventory, indent=2, ensure_ascii=False), encoding='utf-8')
print('OK')
