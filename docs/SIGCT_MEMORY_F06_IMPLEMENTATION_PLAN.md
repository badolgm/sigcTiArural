# SIGCT_MEMORY_F06_IMPLEMENTATION_PLAN

**Fecha:** 2026-10-11
**Base:** F00-F05
**Objetivo:** Plan de implementación (solo diseño)


## 1. ORDEN EXACTO DE INSTALACIÓN
1. F00 snapshot verificado.
2. F01-F05 aprobados.
3. Qdrant local (container/dev).
4. Modelo embeddings local (Ollama).
5. Puertos/adaptadores hexagonales.
6. Ingesta batch P0 (docs_core).
7. Validaciones.
8. MVP read-only.


## 2. DEPENDENCIAS
- Qdrant (qdrant/qdrant)
- Ollama (nomic-embed-text-v2-moe)
- Python (infra/ingest) o Node (API) — hexagonal.
- Docker (opcional).
Sin instalar ahora.


## 3. QDRANT LOCAL
- Puerto 6333 HTTP, 6334 gRPC (default).
- Volumen persistente.
- Healthcheck.
- Solo dev/local.


## 4. ESTRATEGIA DOCKER
- docker-compose.memory.yml (separado, no fusionar con compose productivo).
- Servicios: qdrant + memory-api (cuando exista).
- Redes aisladas.
- Volúmenes locales.


## 5. ESTRATEGIA LINUX
- Docker compose o systemd.
- Ollama local.
- Permisos mínimos.


## 6. ESTRATEGIA WINDOWS
- Docker Desktop o WSL2.
- Ollama Windows/WSL2.
- Rutas Windows respetadas.


## 7. ESTRATEGIA OCI
- Contenedores Qdrant + API en red interna.
- Volúmenes gestionados.
- Solo lectura API pública.
- No exponer admin.
- Fuera MVP ahora.


## 8. SCRIPTS REQUERIDOS
- scripts/memory_select_p0.py (selector F00)
- scripts/memory_chunk.py (chunker)
- scripts/memory_embed.py (embeddings)
- scripts/memory_load_qdrant.py (carga gobernada)
- scripts/memory_validate.py (validación)
Solo diseño, no crear ahora.


## 9. INGESTIÓN INICIAL
- P0: docs_core (297 docs) -> chunks -> embed -> load.
- Validar conteo.
- Versionado corpus/model.
- Gobernado.


## 10. VALIDACIONES
- Qdrant health OK.
- Colecciones existen v1.
- Conteo chunks esperado vs real.
- Filtros funcionan.
- Query read-only OK.
- Versiones coherentes.


## 11. ROLLBACK
- Mantener v1 hasta validar vN.
- No overwrite.
- Forget gobernado.
- Snapshot F00 disponible.


## 12. MVP FUNCIONAL
- docs_core cargado.
- MemoryQueryPort operativo read-only.
- ACP/CMSC consulta vía puerto.
- Validaciones OK.
- Sin admin expuesto.

**ENTREGABLE F06. SOLO DISEÑO.**
