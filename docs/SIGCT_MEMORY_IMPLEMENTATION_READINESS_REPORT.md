# SIGCT_MEMORY_IMPLEMENTATION_READINESS_REPORT

**Misión:** `SIGCT_MEMORY_IMPLEMENTATION_READINESS`
**Proyecto:** SIGCT-Rural · **Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `415ee2b`
**Fecha:** 2026-10-13
**Naturaleza:** SOLO EVALUACIÓN. **NO implementar · NO Qdrant · NO Ollama · sin modificar código · sin commits · sin push.**

**Contexto consolidado:** `DATABASE_RECONCILED` ✅ · `FRONTEND_OFFICIALIZATION_PHASE_2` ✅ ·
`GO_FRONTEND_OFFICIALIZATION_CONDICIONADO` ✅

**Referencias analizadas:**
`SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN` · `SIGCT_MEMORY_IMPLEMENTATION_01` · `SIGCT_MEMORY_F01…F06.5` ·
`docs/memory_inventory.json` (F00, 404 artefactos) · `scripts/memory_inventory.py` ·
DeepLearning.AI + Qdrant *"Building AI Assistants with On-Device Memory"* (`sc-on-device-ai-memory`, Qdrant
Edge) · Qdrant *"Memory at the Edge: On-Device Vector Search"*.

---

## 0. HALLAZGO SÍNTESIS

SIGCT Memory está **100 % diseñado y 0 % implementado**. El estado coincide exactamente con lo que declara
`IMPLEMENTATION_01` (`GO_SIGCT_MEMORY_V1`, condicionado). El único artefacto *ejecutable real* es el
**inventario F00** (`memory_inventory.json`, 404 artefactos + `memory_inventory.py`). Todo lo demás
(contratos, colecciones, adaptadores, API, staging) son **documentos de diseño**.

---

## 1. QUÉ COMPONENTES YA EXISTEN

| Componente | Ubicación | Estado honesto | Relevancia para Memory |
|---|---|---|---|
| Plan maestro + 8 docs de fase | `docs/SIGCT_MEMORY_*.md` | **DISEÑO** (completo) | Contratos F0–F6.5 |
| Inventario F00 | `docs/memory_inventory.json` | **REAL** (404 artefactos) | Corpus base + snapshot |
| Script inventario F00 | `scripts/memory_inventory.py` | **REAL** (funcional) | Base del selector P0 |
| Knowledge Hub | `src/frontend/src/knowledge-hub/**` | **OPERACIONAL** (51 docs, 6 cat.) | Fuente primaria (P0) |
| `docLoader.js` | `knowledge-hub/services/` | **OPERACIONAL** | Patrón de carga/build-time |
| `docsBySignal.js` | `src/frontend/src/services/` | **OPERACIONAL** (lectura) | Índice señal↔doc (read-only) |
| Voice Assistant | `components/VoiceAssistant.jsx` (+ `useAiVoiceAssist`) | **REAL** (MediaRecorder → `/assist`) | Canal de voz S62 |
| AI Service `/assist` | `src/ai_models/fastapi_app.py:293` | **REAL** (STT Google + TTS gTTS) | Puente voz existente |
| CMSC signal catalog | `pages/cmsc/signalCatalog.js` (S01–S80) | **OPERACIONAL** | Metadatos/clasificación |
| CMSC discovery + honesty | `knowledgeDiscovery.js`, `honesty.js`, `HonestyBadge/…` | **OPERACIONAL** | Vocabulario honesto + patrón read-only |
| ACP (stub UI) | `pages/cmsc/AcpCell.jsx` | **DISEÑO** (UI sin lógica) | Consumidor futuro de Memory |
| Backend DDD hexagonal | `src/backend/{api,core,infrastructure,contexts,shared_kernel}` | **PARCIAL** (base sólida) | Andamiaje para BC nuevo |
| Shared Kernel EventBus | `shared_kernel/event_bus/` (`EventBusPort`,`InMemoryEventBus`,`LabSignal`) | **REAL** | Patrón de bus para eventos Memory |
| Docker base | `docker-compose.yml` (db, backend, ai_service, frontend) | **REAL** | Base para `docker-compose.memory.yml` |

**No existe:** Qdrant, Ollama, embeddings, `sigct.memory` (BC), API `/api/v1/memory/*`, staging `.jsonl`,
`docker-compose.memory.yml`, Evidence Ledger operativo, cache on-device (BBB).

---

## 2. QUÉ COMPONENTES FALTAN

| # | Componente faltante | Fase | Bloqueante MVP |
|---|---|---|---|
| 1 | **Decisión del modelo de embeddings** (F01 deja 2 opciones abiertas; dims sin fijar) | F0/F1 | 🔴 Sí |
| 2 | **Qdrant local** (6333/6334) + volumen persistente | F3/F06 | 🔴 Sí |
| 3 | **Ollama** + `nomic-embed-text-v2-moe` | F01/F06 | 🔴 Sí |
| 4 | **BC `sigct.memory`** (domain/app/ports/adapters) | F03/F04 | 🔴 Sí |
| 5 | **Puertos** `MemoryQuery/Ingestion/Recall/Forget` (solo contratos hoy) | F03 | 🔴 Sí |
| 6 | **Adaptadores** `QdrantAdapter` + `OnDeviceMemoryAdapter` | F03 | 🔴 Sí |
| 7 | **Etapa staging** (`.staging/*.jsonl` + `staging_manifest.json`) | F06.5 | 🔴 Sí |
| 8 | **Scripts** `memory_select_p0 / chunk / embed / load_qdrant / validate` | F06 | 🔴 Sí |
| 9 | **API** `GET /health`, `POST /query`, `GET /collections` (+ admin gobernado) | F05 | 🔴 Sí |
| 10 | **`docker-compose.memory.yml`** (aislado, no fusionar) | F06 | 🟡 No (dev local) |
| 11 | **Seguridad admin** (mTLS/IP + aprobación; read-only público) | F05 | 🟡 No |
| 12 | **Tests** de puertos/adaptadores; validación conteo chunks | F06 | 🟡 No |
| 13 | **ACP real** (hoy stub) | F05/CMSC | 🟡 No |
| 14 | **Evidence Ledger** (S81/S82) — para colección `docs_evidence` | F3E | 🟡 No (P1) |
| 15 | **Cache on-device BBB** (pull-only, offline) | F02/F04 | 🟢 Futuro |
| 16 | **Integración Alexa** (canal externo) | F05 | 🟢 Futuro |

---

## 3. QUÉ PUEDE REUTILIZARSE DEL PROYECTO QDRANT

> Verificado contra la referencia real (DeepLearning.AI + Qdrant Edge). Los elementos citados
> **coinciden** con lo ya especificado en F02/F03/F04 → el diseño del proyecto es **fielmente traducible**.

| Primitiva Qdrant (Edge) | Descripción | Encaje en SIGCT Memory |
|---|---|---|
| **Shard = directorio local** (una colección) | Motor embebido sin servicio, persistencia en carpeta | Colecciones `sigct_memory_*_v1` (F02 §1), sin depender de cloud |
| **Vectores dense + sparse (híbrido/BM25)** | Combinación semántica + léxica | Mejora sobre el "cosine puro" de F02 (recomendable adoptar híbrido) |
| **Payload filters** | Filtrado por metadatos en la búsqueda | Directo a F02 §3 (`category/scope/tags/language`) y F03 §10 |
| **Distance = Cosine** | Métrica ya definida | F01 §5 / F02 §1 (idéntico) |
| **Points con id estable** (UUID v5) | Idempotencia de ingesta | F02 §2 (`UUID v5: path+chunk_index`) — ya alineado |
| **Snapshots / versionado** | Snapshots de colección | F02 §4/§5 (reindex vN, no overwrite) |
| **Forget / delete by payload** | Borrado selectivo gobernado | `ForgetPort.forget-path/collection` (F03 §4) |
| **Soft-forgetting (freshness / half-life)** | Re-rank por recencia (half-life, freshness_weight) | **Aportación nueva** → `docs_evidence`/noticias; no está en F01–F06 |
| **Sync queue (pull-only)** | Sincronización opcional hacia/desde edge | Encaja con estrategia BBB pull-only (F02 §7) |
| **Memoria objeto+texto (CLIP)** | Reconocer objetos sin reentrenar | **Fuera del MVP** (SIGCT indexa documentación, no objetos), pero disponible a futuro |
| **Threshold de reconocimiento** | Umbral de similitud calibrable | Aplicable al `top_k`/filtro de relevancia de `MemoryQueryPort` |

**Conclusión:** el "proyecto Qdrant" aporta el **motor de recuperación completo**; SIGCT sólo necesita
envolverlo en adaptadores hexagonales, no reimplementar búsqueda vectorial.

---

## 4. QUÉ PUEDE REUTILIZARSE DEL FRONTEND

| Activo frontend | Reutilización en Memory |
|---|---|
| `components/VoiceAssistant.jsx` + `useAiVoiceAssist` (S62) | **Canal de voz ya real** (captura + `/assist`). Punto de entrada "Voz → ACP → Memory". |
| `config/endpoints.js` → `resolveEndpoint` | Resolver la base de `/api/v1/memory/*` (dev proxy / nginx / ARG Docker). |
| `pages/cmsc/honesty.js` + `HonestyBadge` + `HonestyThermometer` | Etiquetar honestamente cada resultado de memoria (scope/estado/confianza). |
| `services/docsBySignal.js` | Patrón de **índice de lectura derivado** (sólo lectura, nunca escribe la fuente). |
| `pages/cmsc/knowledgeDiscovery.js` + `EvidencePanel.jsx` | Plantilla UX de "lectura pura de registry" → reutilizable para panel Memory. |
| `knowledge-hub/pages/KnowledgeHubLayout.jsx` + `MarkdownDocumentView.jsx` | Render de resultados (chunks) con formato documento. |
| `ErrorBoundary` / `TopNav` / layout CMSC | Envoltorio existente; **no crear página nueva** (regla CMSC_ORCHESTRATION_V2). |

> **Regla de oro respetada:** la memoria se integra como **capacidad dentro del CMSC existente**, no como
> app/página nueva.

---

## 5. QUÉ PUEDE REUTILIZARSE DEL KNOWLEDGE HUB

| Activo KH | Reutilización | Verificación |
|---|---|---|
| `knowledgeRegistry.generated.json` | **Fuente primaria P0** (51 docs, 6 cat.) → selector F00 | ✅ 51 docs / 6 categorías confirmado |
| Metadatos por doc (`canonical_path`,`category`,`tags`,`level`,`document_type`,`source_of_truth`) | **Chunk metadata** directo (F01 §4) | ✅ schema observado |
| `registry.documents[].canonical_path` | Resolución de contenido (F01 §2) | ✅ |
| `docLoader.js` (`import.meta.glob` build-time) | Patrón de carga local sin CDN | ✅ |
| 6 categorías (`project-core`,`eiarc-architecture`,`eiarc-foundation`,`research-v2`,`knowledge-base`,`historical`) | Mapean a colección `docs_core` (canónico) | ✅ |
| KH como **fuente de verdad documental** | Memory **deriva** (never-write-to-source) | ✅ coherente con F02 §9/F03 §6 |

**Nota de coherencia:** el inventario F00 declara **404 artefactos** para el corpus completo; el KH es un
subconjunto canónico (51). El MVP F0 usa **297** (Governance+Architecture+Knowledge) según F01 §2; conviene
verificar el desglose 404 vs 297 (ver §9, riesgo R4).

---

## 6. QUÉ PUEDE REUTILIZARSE DEL CMSC

| Activo CMSC | Reutilización |
|---|---|
| `signalCatalog.js` (S01–S80, `clase_senal`/`dominio`/`estado`/`puerto`/`confianza`) | Metadatos de chunk (tags/scope/language) + trazabilidad señal↔doc. |
| `honesty.js` (canon de estados REAL/REF/SIM/DISEÑO/ROTO…) | Vocabulario único para reportar resultados de memoria sin mejorar su estado. |
| `knowledgeDiscovery.js` | Patrón "computa lectura, no escribe" → espejo para `MemoryQueryPort`. |
| `EvidencePanel.jsx`, `LatestEvidence.jsx` | UX de sustento documental (sustento vs vacío). |
| `AcpCell.jsx` + `useAiVoiceAssist` | **Consumidor stub** del `MemoryQueryPort` (el ACP es el consumidor avanzado — F03 §7). |
| `signalRiver.js` / `LiveSignalStrip.jsx` | Metáfora de flujo (señal→evidencia) reutilizable para visualizar recall. |
| F3E *Evidence Ledger* (diseño) | Encaja con la colección `docs_evidence` (F01 §5). |
| Regla `CMSC_ORCHESTRATION_V2` | Memory es **etapa/capacidad del CMSC**, no página nueva. |

---

## 7. ARQUITECTURA FINAL — Voz · Memoria · Embeddings · Qdrant · Alexa

```
                          CANAL EXTERNO                         CANAL LOCAL
        ┌─────────────────────────┐                ┌──────────────────────────────┐
        │  Alexa (voz externa)     │                │  VoiceAssistant.jsx (S62)     │
        │  CANAL — sin persistir    │                │  MediaRecorder → POST /assist │
        └──────────────┬───────────┘                └───────────────┬──────────────┘
                       │  intent (texto)                            │  audio
                       ▼                                            ▼
             ┌──────────────────────────────────────────────────────────────┐
             │  ACP — Orquestador Científico (READ-ONLY, F4)                  │
             │  AcpCell.jsx (stub) + intérprete determinista (fallback)       │
             └───────────────────────────┬────────────────────────────────────┘
                                          │  MemoryQueryPort.query(filters)   [SOLO LECTURA]
                                          ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │  BC sigct.memory  (DDD + Hexagonal)                                           │
   │  Domain: MemoryChunk · CorpusSnapshot · Collection · Policy                    │
   │  Ports:  MemoryQueryPort · MemoryIngestionPort · MemoryRecallPort · ForgetPort │
   │  Adapters: QdrantAdapter · OnDeviceMemoryAdapter                              │
   └───────────────┬───────────────────────────────────────────────┬─────────────┘
                   │  dense+sparse (cosine, payload filter)         │  pull-only (futuro)
                   ▼                                                ▼
   ┌───────────────────────────────────┐          ┌───────────────────────────────┐
   │  QDRANT (shard local)             │          │  BBB 192.168.7.2 (Edge)        │
   │  ├ sigct_memory_docs_core_v1      │          │  On-Device cache (offline)     │
   │  ├ sigct_memory_docs_evidence_v1  │          │  sc-on-device-ai-memory        │
   │  └ sigct_memory_docs_benchmark_v1 │          │  NUNCA escribe la fuente       │
   └───────────────▲───────────────────┘          └───────────────────────────────┘
                   │  embeddings (768d, local)
   ┌───────────────┴───────────────────┐
   │  OLLAMA · nomic-embed-text-v2-moe │  ← modelo local (privacidad, offline)
   └───────────────▲───────────────────┘
                   │  indexado GOBERNADO (batch, nunca ad-hoc)
   ┌───────────────┴───────────────────┐
   │  Staging .jsonl  →  MemoryIndex    │  ← P0: 297 docs (Governance+Arch+Knowledge)
   │  Fuente: KH registry + docs/ + manifiestos (metadatos, JAMÁS binarios/WAV/pesos) │
   └────────────────────────────────────┘

   READ-ONLY en todo el plano de consumo.  Escritura SOLO por el plano gobernado de ingesta.
```

**Invariantes (heredados del canon):**
1. La memoria es **repositorio derivado de lectura**; nunca fuente de verdad primaria.
2. **Never-write-to-source**: KH / CMSC / BCs no se tocan.
3. **No indexar** WAV/binarios/pesos/secrets.
4. Público **read-only**; admin **gobernado** (aprobación explícita).
5. `model_version` + `corpus_version` + `collection_version` en toda respuesta.
6. Alexa = **canal**, no cerebro; sin persistir prompts sensibles.

---

## 7-bis. ARQUITECTURA DELTA — qué falta construir para llegar a ese diagrama

```
[EXISTE]  KR registry + docs + inventario F00 + KH + voz + CMSC(catálogo/honesty) + backend hex
[FALTA]   ┌ 1 modelo embeddings (decisión)        ┌ 2 Qdrant local
          ┌ 3 Ollama + nomic                      ┌ 4 BC sigct.memory (domain/app/ports/adapters)
          ┌ 5 staging scripts + .jsonl            ┌ 6 MemoryQueryPort + API /api/v1/memory/*
          ┌ 7 docker-compose.memory.yml           ┌ 8 seguridad admin
          ┌ 9 ACP real (consumidor)               ┌ 10 Evidence Ledger (P1)
```

---

## 8. ROADMAP REAL DE IMPLEMENTACIÓN

> Alineado con F06/F06.5 y el orden "instalar → staging → API → validar" de `IMPLEMENTATION_01`.
> Cada fase requiere **misión y autorización explícitas** (no implementar hoy).

| Fase | Objetivo | Entregable | Gate de salida |
|---|---|---|---|
| **M0 · Decisiones** | Fijar modelo embeddings + dims + distancia + `top_k` | Acta de decisión | G-M1 aprobado |
| **M1 · Infra local** | Ollama + `nomic-embed-text-v2-moe`; Qdrant 6333/6334 + volumen + healthcheck | `docker-compose.memory.yml` + health OK | G-M2 health |
| **M2 · BC hexagonal** | Scaffold `sigct.memory` (domain/app/ports/adapters) + tests de contrato | 4 puertos + 2 adaptadores (fakes) | G-M3 hexagonal puro |
| **M3 · Staging** | Selector P0 (297 docs) → chunk (500–800) → `.staging/*.jsonl` + manifest | JSONL + validaciones (chunks únicos/no vacíos) | G-M4 validación chunk |
| **M4 · Ingesta gobernada** | Embed batch + load `docs_core` (idempotente, UUID v5) + snapshot F00 | Colección v1 + conteo esperado=real | G-M5 conteo |
| **M5 · Query read-only** | `MemoryQueryPort.query/health` + API `POST /query`,`GET /health`,`GET /collections` | API read-only | G-M6 filtros OK |
| **M6 · Integración CMSC/ACP** | Panel Memory en `/dashboard-cmsc` (read-only) + ACP consume el puerto | UI read-only + ACP | G-M7 no-escribe |
| **M7 · MVP** | `docs_core` operativo extremo-a-extremo | MVP doc | G-M8 checklist MVP |
| **M8 · P1** | `docs_evidence` (Operations+Dataset) + `docs_benchmark` | 2 colecciones P1 | gobernado |
| **M9 · Edge/Voz** | BBB pull-only cache; Alexa como canal | Diseño → piloto | futuro |

**Estimación de recursos (de `IMPLEMENTATION_01`):** RAM ~2–4 GB mín. / 6–8 GB rec.; Disco ~2–5 GB
(modelo + staging + Qdrant). ASUS Windows/WSL2 OK. OCI OK (no exponer admin). BBB = futuro.

---

## 9. RIESGOS Y LÍMITES

| ID | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| R1 | **Gobernanza:** AGENTS prohíbe tocar IA existente / implementar sin misión; esta misión prohíbe Qdrant/Ollama | 🔴 Alta | Levantar gate de autorización explícita (misión de código) |
| R2 | Indexar binarios/WAV/pesos/secrets | 🔴 Alta | Filtro F00 (extensión) + lista negra + validación pre-ingesta |
| R3 | Drift del modelo de embeddings (reindexado silencioso) | 🟡 Media | `model_version` obligatorio; reindex sólo explícito |
| R4 | **Discrepancia de conteo** (404 inventario vs 297 P0 vs 51 KH) | 🟡 Media | Verificar desglose antes de M3 |
| R5 | RAM insuficiente (Qdrant + Ollama) | 🟡 Media | Sólo P0 inicial; modelos pequeños |
| R6 | Escritura accidental a KH/CMSC | 🔴 Alta | Puertos read-only + tests "no-escribe" (G-M7) |
| R7 | Fuga de metadatos sensibles | 🟡 Media | Redacción `.env`/secrets; API read-only público |
| R8 | Dependencia única de Qdrant | 🟢 Baja | Adaptadores hexagonales permiten sustituir motor |
| R9 | Admin público | 🔴 Alta | mTLS/IP + aprobación (F05 §8) |

---

## 10. DICTAMEN

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  READY_FOR_MEMORY_IMPLEMENTATION  (a nivel de DISEÑO/CONTRATOS)               │
│  — CONDICIONADO —                                                             │
│  La EJECUCIÓN de código NO puede iniciar hasta levantar 5 gates:              │
│                                                                               │
│   G-M1  Decisión del modelo de embeddings + dimensiones (F01 abierto)         │
│   G-M2  Autorización de gobernanza (levantar freeze; orden de misión)         │
│   G-M3  Aprobación del corpus P0 (verificar 404 vs 297 vs 51)                 │
│   G-M4  Instalar Qdrant + Ollama (FUERA de esta misión, prohibido hoy)        │
│   G-M5  Definir seguridad admin (read-only público / admin gobernado)         │
│                                                                               │
│  Conforme a esta misión: NO se implementa, NO se instala Qdrant ni Ollama.    │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Justificación
- **El diseño está completo y es implementable**: F00–F06.5 cubren contratos, colecciones, dominio,
  API, staging, rollback y checklist MVP; el inventario F00 es un artefacto **real** (404 artefactos).
- **Los prerrequisitos de fuente existen**: Knowledge Hub operacional (51 docs), voz real (`/assist`,
  S62), CMSC (catálogo/honestidad), backend hexagonal con Shared Kernel EventBus.
- **El motor Qdrant es traducible 1:1**: shard local, dense+sparse, payload filters, cosine, idempotencia,
  forget y sync pull-only **coinciden** con F02/F03/F04.
- **Pero no hay implementación**: 0 Qdrant, 0 Ollama, 0 BC, 0 API, 0 staging → no puede "comenzar"
  a codificar sin los gates G-M1…G-M5, y la gobernanza lo prohíbe en esta misión.

### Recomendación de siguiente misión (no ejecutada)
`SIGCT_MEMORY_M0_DECISIONS`: producir el acta de decisiones (modelo de embeddings, dims, corpus P0
verificado, política admin) **sin instalar nada**. Es el único paso desbloqueable hoy.

---

**NO implementado · NO Qdrant · NO Ollama · sin modificar código · sin commits · sin push.**
