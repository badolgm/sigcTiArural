# SIGCT_MEMORY_F01_EMBEDDING_STRATEGY

**Fecha:** 2026-10-11
**Base:** SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md + memory_inventory.json (404 artefactos)
**Objetivo:** Diseñar estrategia embeddings (solo diseño, sin implementar)


## 1. MODELO DE EMBEDDINGS
- **Recomendado:** nomic-embed-text-v2-moe (multilingüe, long-context eficiente) O text-embedding-3-small (general).
- **Criterios:** tamaño razonable, dominio técnico (inglés/español mixto), costo/local viable.
- **Local-first:** preferir modelo local (Ollama) para on-device/privacidad.
- **Dimensiones:** según modelo elegido (mantener fijo por colección).
- **Regla:** mismo modelo para todas las colecciones v1.


## 2. ARTEFACTOS A INDEXAR PRIMERO
**Prioridad P0 (MVP):** Knowledge + Architecture (documentación canónica)
- Knowledge: 238 (KH registry + docs)
- Architecture: 52 (CMSC + hexagonal/DDD)
- Governance: 7 (AGENTS/MASTERDOC)
**P1:** Operations (34) + Benchmark (15) + Dataset (58)

**Orden:** Governance+Architecture+Knowledge (297) -> resto 107.


## 3. ESTRATEGIA DE CHUNKING
- **Técnica:** semántico por headers (Markdown) + solapamiento pequeño.
- **Tamaño:** 500-800 tokens, overlap 50-100.
- **Reglas:** no partir código YAML/JSON estructurado (chunk por bloque lógico).
- **Markdown:** dividir por #, ##, ### respetando contexto.
- **Límite:** evitar chunks <50 tokens.


## 4. METADATOS RECOMENDADOS
Cada chunk debe incluir:
- source_path, category, ext, chunk_id, chunk_index, title/header, version
- tags (architecture/dataset/governance/etc)
- scope (canonical|evidence|ops)
- language (es/en)
- checksum_sha256 (futuro)
- created_at/indexed_at
**Principio:** metadatos permiten filtrado + trazabilidad.


## 5. ESTRUCTURA DE COLECCIONES QDRANT
- **docs_core** (P0): Governance+Architecture+Knowledge — canónico.
- **docs_evidence** (P1): Operations (trazas bridge/tramo C) + Dataset manifiestos.
- **docs_benchmark** (P1): Benchmark/M1/M2.
**Vector config:** unified embedding model + distancia cosine.
**Naming:** sigct_memory_{collection}_v1.


## 6. MANEJO DOCUMENTOS GRANDES
- >5k líneas: chunk agresivo por secciones.
- YAML/JSON grandes: preservar estructura (split por documento/array lógico).
- PDFs (no presentes inventario) — excluir MVP.
- Evitar truncado destructivo.
- Métrica: chunks/doc <= 20 (ideal) salvo excepciones.


## 7. VERSIONADO
- **model_version:** embedding model + hash.
- **corpus_version:** F00 inventory hash (snapshot).
- **collection_version:** v1 por colección.
- **reindex:** solo explícito (gobernado).
- **idempotencia:** chunk_id estable (path+index+hash).


## 8. RIESGOS
- Over-chunking destruye contexto.
- Under-chunking baja precisión.
- Embeddings cost/local.
- Drift modelo (versionado obligatorio).
- Indexar no-canónicos (bloquear).
- Volumen 404 docs pequeño (controlado).


## 9. ARQUITECTURA CARGA INICIAL
1. F00 inventory (snapshot).
2. Selector P0 (Governance+Architecture+Knowledge).
3. Extractor Markdown/YAML/JSON.
4. Chunker (headers+overlap).
5. Embedder (modelo local).
6. Loader Qdrant (colección docs_core).
7. Verificación conteo chunks.
**Read-only:** ACP consulta vía MemoryQueryPort.


## 10. ROADMAP F01
| Paso | Acción | Estado |
|---|---|---|
| F01.1 | Definir modelo + dims | Diseño |
| F01.2 | Definir chunker reglas | Diseño |
| F01.3 | Definir metadatos schema | Diseño |
| F01.4 | Definir colecciones | Diseño |
| F01.5 | Validar con 5-10 docs P0 | Diseño/validación conceptual |
| F01.6 | Aprobar antes implementación | Pendiente |

**SIN IMPLEMENTAR. SOLO DISEÑO.**
