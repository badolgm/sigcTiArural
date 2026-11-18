# SIGCT_MEMORY_F02_QDRANT_ARCHITECTURE

**Fecha:** 2026-10-11
**Base:** SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN + F01 + memory_inventory.json
**Objetivo:** Diseño arquitectónico Qdrant (solo diseño)


## 1. ESTRUCTURA EXACTA DE COLECCIONES
| Colección | Scope | Contenido | Vector | Distance |
|---|---|---|---|---|
| sigct_memory_docs_core_v1 | canónico | Governance+Architecture+Knowledge (297) | según modelo F01 | Cosine |
| sigct_memory_docs_evidence_v1 | evidencia | Operations+Dataset manifiestos (92) | idem | Cosine |
| sigct_memory_docs_benchmark_v1 | benchmark | Benchmark (15) | idem | Cosine |
**Regla:** 1 modelo, 1 dim config por v1.


## 2. PAYLOADS
Campos mínimos:
- id (UUID v5 estable: path+chunk_index)
- vector (embedding)
- payload: { text, source_path, category, ext, chunk_id, chunk_index, header, title, version, tags[], scope, language, corpus_version, model_version, indexed_at }
**No payload binario.**


## 3. METADATA
Global: corpus_version (hash F00), model_version, collection_version.
Por punto: indexed_at ISO8601, checksum_sha256 (chunk/source opcional).
Indexación por payload (category, scope, tags, language) para filtros.


## 4. VERSIONADO
- collection name incluye _v1.
- corpus_version immutable snapshot.
- reindex => nueva vN (no overwrite masivo).
- chunk_id estable.


## 5. ESTRATEGIA DE REINDEXACIÓN
- Solo explícita (gobernada).
- Validar F00 snapshot.
- Crear colección vN si cambia corpus/model.
- Verificación: conteo chunks esperado vs real.
- NO borrar v1 hasta validación vN.


## 6. ESTRATEGIA DE BORRADO
- Nunca borrar por lotes ad-hoc.
- Borrado selectivo por source_path (gobernado).
- Borrado colección completa solo tras aprobación.
- Mantener histórico v1-vN.


## 7. ESTRATEGIA BBB
- On-device cache (sc-on-device-ai-memory) en BBB 192.168.7.2 (futuro).
- Sincronización pull-only (lectura).
- No escritura directa.
- Offline-first.


## 8. ESTRATEGIA CMSC
- Consulta vía MemoryQueryPort (read-only).
- Filtrado por category=Architecture/Knowledge.
- Contexto acotado a chunks relevantes.
- No modifica CMSC.


## 9. ESTRATEGIA KNOWLEDGE HUB
- Memory deriva de KH+docs (no invade).
- KH permanece fuente documental.
- Indexado controlado (registry + canónicos).
- Never-write-to-source.


## 10. ESTRATEGIA ALEXA
- Canal voz (externo).
- ACP/KH responden; memoria consulta read-only.
- Sin persistencia de prompts sensibles.
- Respeto honestidad estado.

**ENTREGABLE F02. SIN IMPLEMENTAR.**
