# SIGCT_MEMORY_F03_QUERY_ARCHITECTURE

**Fecha:** 2026-10-11
**Base:** Plan maestro + F01 + F02
**Objetivo:** Diseño puertos hexagonales (solo diseño)


## 1. CONTRATO MemoryQueryPort (core)
\\\	ext
interface MemoryQueryPort {
  query(params: QueryParams): Promise<QueryResult>
  health(): Promise<HealthStatus>
}
\\\
QueryParams: query, top_k, filters{category,scope,tags,language}, collection_hint
QueryResult: chunks[], total, latency_ms, model_version, corpus_version


## 2. CONTRATO IngestionPort (gobernado)
\\\	ext
interface IngestionPort {
  ingestBatch(batch: IngestBatch): Promise<IngestResult>
  validateCorpus(snapshot: Snapshot): Promise<ValidationResult>
}
\\\
Solo batch controlado. Nunca ingesta ad-hoc.


## 3. CONTRATO RecallPort (lectura)
\\\	ext
interface RecallPort {
  recallByContext(context: Context): Promise<RecallResult>
  recallByPath(path: string, top_k?: number): Promise<RecallResult>
}
\\\
Lectura pura, sin mutación.


## 4. CONTRATO ForgetPort (gobernado)
\\\	ext
interface ForgetPort {
  forgetByPath(path: string): Promise<ForgetResult>
  forgetCollection(collection: string): Promise<ForgetResult> // requiere aprobación
}
\\\
Gobernado. Nunca borrado masivo silencioso.


## 5. INTEGRACIÓN CMSC
- Lector: MemoryQueryPort.query (read-only).
- Filtros: category in {Architecture,Knowledge}.
- Sin escribir CMSC/stores.
- Contexto acotado.


## 6. INTEGRACIÓN KNOWLEDGE HUB
- Derivada (lee KH).
- Never-write-to-source.
- Solo consulta.


## 7. INTEGRACIÓN ACP
- Único consumidor avanzado vía MemoryQueryPort.
- Read-only, filtros estrictos.
- Respeta honestidad/estado.


## 8. INTEGRACIÓN ALEXA
- Canal voz -> ACP -> Memory (read-only).
- Sin persistir prompts sensibles.


## 9. INTEGRACIÓN BBB
- On-device (sc-on-device-ai-memory), pull-only, offline-first.
- Cache acotado a docs_core.


## 10. FLUJOS DE CONSULTA
1. Query -> MemoryQueryPort -> Selector colección (hint/filtros) -> Qdrant -> Rerank opcional -> QueryResult.
2. Siempre read-only.
3. Metadatos de versión en respuesta.


## 11. FLUJOS DE MEMORIA
- **Ingestión:** gobernado (batch) -> validación corpus -> indexado -> verificación.
- **Recall:** lectura pura.
- **Forget:** gobernado + aprobación.
- **Synch BBB:** pull-only.

**ENTREGABLE F03. SIN IMPLEMENTAR.**
