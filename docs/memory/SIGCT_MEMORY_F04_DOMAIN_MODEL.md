# SIGCT_MEMORY_F04_DOMAIN_MODEL

**Fecha:** 2026-10-11
**Base:** F00-F03
**Objetivo:** Modelo de dominio DDD (solo diseño)


## 1. ENTIDADES
- **MemoryChunk**: id, text, sourcePath, header, chunkIndex, checksum.
- **CorpusSnapshot**: id, version, items[], generatedAt.
- **Collection**: name, version, modelVersion, count.
- **QuerySession**: id, query, filters, requester.


## 2. VALUE OBJECTS
- **SourcePath**, **ChunkId**, **EmbeddingModel**, **CorpusVersion**, **CollectionVersion**, **Filters**, **Language**.


## 3. AGGREGATES
- **MemoryCorpus** (raíz): gestiona snapshot + chunks canónicos.
- **MemoryIndex** (raíz): ingesta gobernada.
- **MemoryRecall** (raíz): consulta read-only.


## 4. BOUNDED CONTEXT
**sigct.memory** (Persistent Episodic Memory)
- Domain: entidades+VOs+agregados.
- Application: servicios (IndexService, QueryService).
- Infra: Qdrant/OnDevice adapters.
- Puertos: MemoryQuery/Ingestion/Recall/Forget.


## 5. EVENTOS
- CorpusIndexed, ChunkIndexed, QueryExecuted (lectura), MemoryForgotten (gobernado).


## 6. CASOS DE USO
- Indexar corpus (gobernado), Consultar memoria (read-only), Olvidar por ruta (gobernado), Verificar snapshot.


## 7. RELACIONES
MemoryCorpus -> MemoryChunk. MemoryIndex gestiona agregados. MemoryRecall consulta.


## 8. OWNERSHIP
BC sigct.memory dueño de modelo memoria. KH/CMSC/ACP lectores (no dueños).


## 9. UBIQUITOUS LANGUAGE
chunk, corpus, snapshot, collection, recall, indexado gobernado, read-only, never-write-to-source, evidencia verificable.

**ENTREGABLE F04. SIN IMPLEMENTAR.**
