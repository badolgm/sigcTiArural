# SIGCT_MEMORY_F06_5_STAGING_MODEL

**Fecha:** 2026-10-11
**Base:** F00-F06 + memory_inventory.json
**Objetivo:** Fase staging (solo diseño)


## 1. NÚMERO DE CHUNKS ESPERADOS
- P0 (docs_core): 297 docs -> ~800-1100 chunks (estimado 2.5-3.7 chunks/doc)
- P1 evidence: ~92 -> ~200-250
- P1 benchmark: ~15 -> ~30-40
**Total estimado:** ~1000-1300 chunks iniciales.


## 2. ESTRATEGIA DE CHUNKING REAL
- Headers Markdown (#, ##, ###)
- YAML/JSON: bloques lógicos (no partir llaves sueltas)
- Overlap 50-100 tokens
- Target 500-800 tokens
- Min 50, max ~1000 tokens


## 3. TAMAÑO ESTIMADO
- staging/*.jsonl: ~5-10 MB (texto plano)
- embeddings cache (futuro): ~15-30 MB
- total staging pequeño.


## 4. VALIDACIÓN DE CHUNKS
- Longitud min/max.
- No chunks vacíos.
- Encabezado coherente.
- chunk_id único.
- source_path válido.


## 5. ARTEFACTOS INTERMEDIOS
- .staging/chunks_core.jsonl (P0)
- .staging/chunks_evidence.jsonl (P1)
- .staging/chunks_benchmark.jsonl (P1)
- .staging/staging_manifest.json (metadata)
- .staging/corpus_snapshot.json (F00 snapshot)


## 6. FORMATO STAGING
JSONL (un objeto por línea). Cada registro = chunk listo para embedding.
Campos: chunk_id, source_path, category, text, header, chunk_index, metadata{...}


## 7. ESTRATEGIA DE CARGA A QDRANT
1. Leer staging JSONL.
2. Generar embeddings (batch).
3. Upsert por chunk_id.
4. Verificar conteo.
5. No overwrite existente (idempotente).
6. Gobernado.

**ENTREGABLE F06.5. SOLO DISEÑO.**
