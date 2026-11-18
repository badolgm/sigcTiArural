# SIGCT_MEMORY_IMPLEMENTATION_01

**Fecha:** 2026-10-11
**Base única:** F00–F06.5
**Arquitectura:** DDD + Hexagonal + BC sigct.memory


## FASE 1: VALIDACIÓN
| Ítem | Estado | Observación |
|---|---|---|
| F00 inventory (404) | OK | Base sólida |
| F01 chunking | OK | 500-800+overlap |
| F02 colecciones | OK | docs_core/evidence/benchmark |
| F03 puertos | OK | Query/Ingestion/Recall/Forget read-only/gobernado |
| F04 dominio | OK | BC sigct.memory claro |
| F05 API | OK | pública read-only + admin gobernado |
| F06 implementación | OK | roadmap claro |
| F06.5 staging | OK | JSONL + validaciones |
**VALIDACIÓN GLOBAL: OK**


## FASE 2: MVP MÍNIMO
- **BC:** sigct.memory hexagonal.
- **Qdrant:** local 6333/6334.
- **Embeddings:** Ollama nomic-embed-text-v2-moe.
- **Ingesta:** batch P0 -> docs_core.
- **Query:** MemoryQueryPort read-only.
- **Staging:** .staging/*.jsonl.
- **Sin admin expuesto.**


## FASE 3: ORDEN INSTALACIÓN
1. **Obligatorio primero:** Ollama + modelo embeddings.
2. **Segundo:** Qdrant (local/dev).
3. **Tercero:** scripts ingest staging.
4. **Cuarto:** API read-only + adaptadores.
5. **Quinto:** validaciones.

## COMPONENTES
- **Obligatorios:** Ollama, nomic-embed-text-v2-moe, Qdrant, scripts staging, MemoryQueryPort.
- **Opcionales:** docker-compose.memory.yml, BBB on-device, OCI.
- **NO usar:** embeddings externos no-local (por privacidad), overwrite masivo, admin público.


## RECURSOS / COMPATIBILIDAD
- **RAM:** ~2-4 GB mínimo, recomendado 6-8 GB (Qdrant + Ollama).
- **Disco:** ~2-5 GB (modelo + staging + Qdrant).
- **ASUS (actual):** Windows/WSL2 OK.
- **OCI:** OK (contenedores aislados, no exponer admin).
- **BBB (192.168.7.2):** futuro (on-device cache), no bloquea MVP.

## RIESGOS
- RAM limitado -> usar solo P0 inicial.
- Red limitada (no aplica local).
- Modelo grande -> nomic-embed-text-v2-moe aceptable local.
- Overwrite -> evitar.

## CHECKLIST MVP
- [ ] Ollama + modelo listo
- [ ] Qdrant health OK
- [ ] staging generado
- [ ] docs_core cargado
- [ ] MemoryQueryPort read-only OK
- [ ] Versiones coherentes

## DICTAMEN
**GO_SIGCT_MEMORY_V1** (condicionado a cumplir checklist, sin instalar aún).

**ENTREGABLE A-F COMPLETO. SOLO PLAN. NO IMPLEMENTAR/INSTALAR/COMMIT/PUSH.**
