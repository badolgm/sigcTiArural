# SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN

**Fecha:** 2026-10-11
**Alcance:** SOLO PLAN MAESTRO EJECUTABLE (sin implementar, sin modificar codigo, sin commits, sin push)
**Fuente de verdad obligatoria:** AGENTS.md, MASTERDOC.md, docs/SIGCTIARURAL_ECOSYSTEM_CONSOLIDATION_AUDIT_v1.md, guias acusticas, notebook V1, CMSC actual
**Arquitectura:** DDD + Arquitectura Hexagonal + Bounded Contexts (SIGCT-Rural, no generico)


## 1. OBJETIVO
SIGCT_MEMORY_V1 = cerebro persistente del ecosistema SIGCT-Rural. Basado en https://github.com/https-deeplearning-ai/sc-on-device-ai-memory (DeepLearning.AI + Qdrant + On Device Memory), adaptado a DDD + Hexagonal + BCs del proyecto.


## 2. ENCAJE EN ARQUITECTURA DDD ACTUAL
SIGCT Memory es un **Bounded Context de Soporte (Knowledge/Memory)** que lee (no invade) dominios existentes:
- Domain: Knowledge (KH existente) + Evidence (futuro Ledger S81/S82)
- Application: Casos uso consulta/indexado gobernado (lectura)
- Infrastructure: Qdrant + On-Device Memory (adaptadores hexagonales)
- Ports/Adapters: puerto MemoryQueryPort (lectura ACP/KH), MemoryIndexPort (indexado controlado).
**Principio:** memoria es repositorio de lectura derivada (evidencia+documentación), nunca fuente de verdad primaria.


## 3. BOUNDED CONTEXT NUEVO
**Nombre:** sigct.memory (Bounded Context: Persistent Episodic Memory)
- **Responsabilidad:** indexado controlado de artefactos verificables, recuperación semántica para ACP/KH.
- **Reglas:** leer solo (no modifica docs/KH/BCs), indexado por batch gobernado, nunca WAV/binaries.
- **Ubicación propuesta (conceptual):** src/domain/memory / src/application/memory / src/infrastructure/memory (hexagonal) — NO crear aún.


## 4. COMPONENTES ACTUALES QUE ALIMENTARÁN MEMORIA
- **Knowledge Hub** (knowledgeRegistry.generated.json, 51 docs) — primario.
- **AGENTS.md / MASTERDOC.md** — reglas/canon.
- **docs/AI_ACOUSTIC_* + CMSC_* + informes bridge/tramo C** — trazabilidad.
- **Notebook acústico V1** — metodología.
- **Dataset acústico C0/C1** — metadatos/manifiestos (no WAV).
- **Dataset agrícola + M1/M2** — metodología/resultados (no pesos).
- **Logger/Bridge/Stats** — evidencia operacional.
- **CMSC/S30** — contexto señal.
**NO alimentan:** pesos (.h5/.pth/.onnx), WAV, binarios, secrets.


## 5. QUÉ INDEXAR / NO INDEXAR
**SÍ:** Markdown canónico, JSON manifiestos (metadatos), YAML gobernanza, dataset_card.md, AGENTS/MASTERDOC relevantes, evidencias Tramo B+C, registry KH.
**NO:** WAV/RAW, .h5/.pth/.onnx, .zip, node_modules, runs/, sandbox Temp, .env, logs sensibles.
**Regla:** verificable + trazable.


## 6. INTEGRACIÓN CON ELEMENTOS EXISTENTES
- **AGENTS/MASTERDOC:** chunk por sección, metadatos (fuente,sección).
- **Notebooks:** solo markdown/README + contratos (no celdas ejecutables pesadas).
- **Dataset acústico C0/C1:** metadatos/manifiestos (no audio).
- **Dataset agrícola:** solo descripción/metadatos (no imágenes masivas).
- **Knowledge Hub:** leer registry + docs; memoria es derivada.
- **CMSC:** ACP consulta memoria vía puerto (lectura).


## 7-10. PAPEL DE BBB, ALEXA, OCI, QDRANT
- **BBB (192.168.7.2):** edge opcional (on-device cache) — futuro, no bloquea MVP.
- **Alexa:** interfaz voz externa (canal). ACP/KH responden; memoria consulta.
- **OCI:** almacenamiento/registry (contenedores) — despliegue, no núcleo memoria.
- **Qdrant:** vector DB (colecciones por dominio: docs, evidence, manifests).
**On Device Memory (sc-on-device-ai-memory):** cache/local retrieval + política offline-first.


## 11. ROADMAP POR FASES (SIN IMPLEMENTAR)
| Fase | Objetivo | Entregable | Gate |
|---|---|---|---|
| F0 | Contratos hexagonales (Ports) + esquema colecciones Qdrant | Contratos + spec colecciones | Aprobación documental |
| F1 | Corpus documental (KH+AGENTS+MASTERDOC+CMSC+AI_Acústica) — mapeo chunks | Corpus mapeado (JSON) | Verificable |
| F2 | Evidence (manifiestos C0/C1) — solo metadatos | Mapping evidencia | Gobernado |
| F3 | Adaptadores Qdrant (lectura/escritura controlada) — diseño/contratos | Diseño adaptadores | Hexagonal puro |
| F4 | On-Device Memory (políticas cache, offline) | Diseño integración | Offline-first |
| F5 | Integración ACP (puerto consulta, read-only) | Contrato ACP<->Memory | Solo lectura |
| F6 | MVP funcional (consulta KH/docs) | MVP doc | No binarios |


## 12. DEPENDENCIAS
- sc-on-device-ai-memory (referencia, estudio) — adaptar, no fork ciego.
- Qdrant (vector)
- On Device Memory (cache)
- Hexagonal/DDD existente.
- Knowledge Hub operativo.


## 13. RIESGOS
- Indexar binarios (bloquear)
- Escritura directa a fuentes (prohibido)
- Fuga de WAV/metadatos sensibles (filtrar)
- Desalineación con BCs (invadir dominios)
- Dependencia única Qdrant (mantenible)
- Sobre-indexado código (evitar)


## 14. MVP MÍNIMO FUNCIONAL
- **Objetivo:** Consultar documentación canónica (KH+AGENTS+MASTERDOC+CMSC+AI acústica) vía puerto read-only.
- **Alcance:** Colección docs en Qdrant + On-Device cache.
- **Fuera MVP:** ACP pleno, S81/S82, Alexa, BBB edge, OCI deploy.


## 15. DIAGRAMA TEXTUAL COMPLETO
\\\
SIGCT-RURAL (DDD+HEXAGONAL)
¦
+-- BCs existentes (no invadidos)
¦   +-- cmsc.* (CMSC/S30/Workbench)
¦   +-- acoustic.* (Logger/Bridge/Dataset C0/C1/S81*/S82*)
¦   +-- knowledge.* (Knowledge Hub)
¦   +-- telemetry.* (parcial)
¦
+-- BC NUEVO: sigct.memory (Persistent Episodic Memory)
    +-- Domain: MemoryEntity, MemoryChunk, Policy
    +-- Application: MemoryIndexService (gobernado), MemoryQueryService (read-only)
    +-- Ports (hexagonal): MemoryIndexPort, MemoryQueryPort
    +-- Adapters: QdrantAdapter, OnDeviceMemoryAdapter
        +-- Fuentes indexables: KH registry + docs/ + manifests (metadatos)
            (excluye WAV/binarios/pesos/secrets)
\\\`n

## 16. ORDEN EXACTO DE EJECUCIÓN
1. **F0** Contratos + colecciones (doc).
2. **F1** Corpus KH+docs (mapeo).
3. **F2** Manifiestos metadatos.
4. **F3** Diseño QdrantAdapter (puertos).
5. **F4** Diseño OnDeviceMemoryAdapter.
6. **F5** Contrato ACP->Memory (read-only).
7. **F6** MVP docs.

## 17. QUÉ CONSTRUIR PRIMERO / NO
**Primero:** F0+F1 (contratos + corpus).
**NO construir todavía:** ACP pleno, S81/S82, Alexa/BBB edge/OCI deploy, escritura masiva, indexado binarios.

**ENTREGABLES A-F COMPLETOS. SIN IMPLEMENTAR. SIN MODIFICAR CÓDIGO. SIN COMMITS. SIN PUSH. SOLO PLAN MAESTRO EJECUTABLE.**
