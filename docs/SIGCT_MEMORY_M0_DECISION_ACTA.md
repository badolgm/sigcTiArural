# SIGCT MEMORY — M0 DECISION ACTA

> **Proyecto:** SIGCT-Rural · Ecosistema de conocimiento verificable
> **Iniciativa:** SIGCT Memory (memoria semántica RAG local, gobernada)
> **Misión:** `SIGCT_MEMORY_M0_DECISIONS`
> **Fase:** M0 — Decisiones de gobierno y diseño (cierre de gates de decisión)
> **Naturaleza:** SOLO acta de decisiones. **No implementa, no instala, no toca código, Docker, OCI, Qdrant ni Ollama. Sin commits. Sin push.**
> **Fecha:** 2026-10-13
> **Baseline de hechos:** `docs/memory_inventory.json` (404 artefactos) · `src/frontend/src/knowledge-hub/registry/knowledgeRegistry.generated.json` (51 docs, `source_version=local-workspace-mvp-expanded`) · estado consolidado previo (`DATABASE_RECONCILED`, Frontend Phases 1–2, Docker/PostgreSQL validados, capacidades preservadas).

---

## 0. Resumen ejecutivo

La fase de consolidación arquitectónica ha concluido y SIGCT Memory quedó **100 % diseñada y 0 % implementada** (F00–F06.5 + `IMPLEMENTATION_01`). El objetivo de M0 es **cerrar las decisiones** que bloqueaban los gates de gobierno G-M1/G-M3/G-M5, de modo que la implementación (M1+) pueda autorizarse en una misión futura **sin reabrir diseño**.

Este acta resuelve las 8 decisiones solicitadas:

| ID | Decisión | Resultado |
|----|----------|-----------|
| M0-1 | Modelo de embeddings | **`nomic-embed-text-v2-moe`** (fallback `bge-m3`) |
| M0-2 | Dimensionalidad | **768** (Matryoshka 512 opcional; fallback 1024) |
| M0-3 | Estrategia de recuperación | **Híbrida** (dense + sparse BM25, fusión RRF) |
| M0-4 | Corpus P0 exacto | **138 docs canónicos indexables** (clasificación 404 → 138/63/183/20) |
| M0-5 | Política de indexación | Whitelist estricta; HISTÓRICO y NO INDEXABLE fuera de P0 |
| M0-6 | Política de seguridad | ACP/Voz **read-only**; admin restringido; nunca secretos/WAV/pesos |
| M0-7 | Colecciones | `docs_core` · `evidence` · `benchmark` · `memory_admin` |
| M0-8 | Roadmap definitivo | **M1 → M9** (infra → ... → edge/voz) |

El acta termina con **`MEMORY_GATES_READY`** (gates de decisión cerrados). La implementación sigue requiriendo una **misión explícita de código** (G-M2) y la instalación de infraestructura (G-M4), ambas fuera del alcance de M0.

---

## 1. Ámbito, reglas e invariantes

**Reglas de esta misión (obligatorias):**
- NO implementar · NO instalar · NO tocar código · NO tocar Docker · NO tocar OCI · NO instalar Qdrant · NO instalar Ollama.
- Sin commits, sin push. Entregable = este documento.

**Invariantes heredados del canon SIGCT-Rural:**
- Honestidad de estado: todo artefacto declara qué es real / referencia / simulación / diseño.
- NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
- SIGCT Memory es una **capacidad** dentro de `/dashboard-cmsc` (no una página, ruta ni aplicación nueva).
- El ACP **lee y orquesta**, nunca inventa evidencia; la Voz es **canal** del ACP, no sustituto.
- Privacidad y soberanía de datos: recuperación **local/offline** por defecto.

**Corrección de baseline registrada (honestidad de datos):**
`memory_inventory.json` clasifica de forma **naíva** (keyword-based, default `Knowledge`) e incluye backups, configuración y código como si fueran conocimiento. M0-4 **reclasifica** los 404 artefactos con reglas de gobierno; los conteos de este acta sustituyen a los del inventario a efectos de indexación.

---

## M0-1 · Modelo de embeddings

**Recomendación: `nomic-embed-text-v2-moe` (local, vía Ollama).**

### Comparativa

| Criterio | `nomic-embed-text` (v1.5) | **`nomic-embed-text-v2-moe`** | `bge-m3` (BAAI) | `jina-embeddings-v3` | `sentence-transformers` (MiniLM/mpnet) |
|---|---|---|---|---|---|
| Dimensiones | 768 | **768** (Matryoshka 256/512/768) | 1024 | 1024 | 384 / 768 |
| Multilingüe | Parcial (EN-optimizado) | **Sí (100+ idiomas)** | Sí (fuerte) | Sí | Solo variantes `multilingual` |
| Contexto | 8192 | ~512–8192 (verificar) | 8192 | Largo (~8k) | 256–512 |
| Runtime local | Ollama nativo | **Ollama nativo (MoE, eficiente CPU/GPU)** | Ollama nativo | No nativo (HF/servicio) | Librería (servicio propio) |
| Licencia | Apache-2.0 | **Apache-2.0** | MIT | **CC BY-NC 4.0 (no comercial) 🔴** | Apache/MIT según modelo |
| Soberanía de datos | Local | **Local** | Local | Depende de despliegue | Local |

### Justificación

1. **Local/offline:** cumple la soberanía de datos; no requiere API externa ni enviar documentos fuera del entorno.
2. **Multilingüe real:** el corpus es mayoritariamente en español; las variantes EN-only degradan la recuperación semántica.
3. **Eficiencia en hardware modesto:** variante Mixture-of-Experts → menor cómputo activo por token, apto para CPU / RAM acotada (2–8 GB).
4. **Nativo en Ollama:** encaja con el contrato de despliegue previsto y evita un servicio de embeddings adicional.
5. **Dimensión razonable (768):** permite además truncar a 512 (Matryoshka) bajo presión de RAM sin cambiar de modelo.

### Descartados
- **`jina-embeddings-v3`:** licencia **CC BY-NC 4.0** (no comercial) → riesgo legal para un producto del ecosistema. 🔴
- **`sentence-transformers` puro:** no es un modelo sino una librería; menor calidad multilingüe por defecto y exige servicio/Worker propio. Se conserva como **referencia** de comparación, no como elección.
- **`nomic-embed-text` v1.5:** válido como **fallback mínimo**, pero con cobertura multilingüe inferior a v2-moe.

**Fallback declarado (si la calidad multilingüe no alcanza en evaluación M4): `bge-m3` (1024 dims, licencia MIT).**

> ⚠️ Verificación obligatoria en M1 (gate G-M1): confirmar en el registro de Ollama la disponibilidad, **dimensiones exactas** y **ventana de contexto** de las variantes antes de fijar la colección. Un cambio de modelo o dimensión obliga a **reindexado total** y a un nuevo `embedding_version`.

---

## M0-2 · Dimensionalidad

**Recomendación: 768 dimensiones** (con opción de truncado Matryoshka a 512 si la RAM lo exige en M1).

### Justificación
- **Corpus pequeño:** 138 documentos canónicos → del orden de `1.500–3.000` chunks. La dimensión no es cuello de botella de calidad.
- **Equilibrio calidad/almacenamiento/RAM:** 768 es el default de `nomic-embed-text-v2-moe`; 1024 (bge-m3) añade ~33 % de almacenamiento sin ganancia garantizada en este dominio.
- **Coste estimado:** ≈3.000 chunks × 768 dims × 4 B ≈ **9 MB** (float32) · ≈2–3 MB con cuantización int8. Insignificante frente a la infraestructura disponible.
- **Flexibilidad:** Matryoshka permite 512/256 sin cambiar de modelo (solo re-vectorizar o truncar, según política).

### Política de dimensión
- La dimensión es **propiedad de la colección** y se fija al crearla.
- Cambiar modelo o dimensión ⇒ **reindexado completo** + bump de `embedding_version` (los vectores de dimensiones distintas no son mezclables).
- Distancia recomendada: **coseno** (los embeddings normalizados favorecen coseno).

---

## M0-3 · Estrategia de recuperación

**Recomendación: HÍBRIDA — dense (semántico) + sparse (BM25) con fusión RRF.**

### Justificación
El corpus técnico mezcla dos necesidades:
- **Semántica / lenguaje natural:** “¿cómo fluye la señal al conocimiento?”, “qué estado tiene el dataset acústico”.
- **Léxica / identificadores exactos:** `S81`, `G-DS-1`, `F3C`, `window.v2`, `P-LAB-02`, `cmsc_logger`, nombres de clase (`silencio`, `ruido_desconocido`), rutas de archivo.

Los identificadores exactos son **malos vecinos** para embeddings densos. BM25 + RRF recupera esos aciertos léxicos que el dense solo pierde.

### Diseño
- **Dense:** `nomic-embed-text-v2-moe` (768, coseno).
- **Sparse:** BM25 / modelo sparse ligero (p. ej. `bge`/SPLADE-like o BM25 clásico) — decisión fina en M2.
- **Fusión:** **RRF** (Reciprocal Rank Fusion), robusto y sin calibración de pesos.
- Qdrant Edge soporta colecciones con vector dense + sparse y fusión nativa.

### Fallback declarado
Si el pipeline sparse complica el MVP, **dense-only** es aceptable como primer corte (**gate M5**), manteniendo el sparse como mejora M7. La estrategia objetivo aprobada es **híbrida**.

---

## M0-4 · Corpus P0 exacto

### Taxonomía de clasificación

| Clase | Significado | ¿Indexable? | Destino |
|-------|-------------|-------------|---------|
| **CANÓNICO** | Fuente de verdad vigente (gobernanza, arquitectura, KH, diseño IA/CMSC) | **Sí** | `docs_core` (P0) |
| **EVIDENCE** | Evidencia trazable y artefactos (manifiestos, dataset, benchmark, informes) | **Sí** | `evidence` / `benchmark` (P1) |
| **HISTÓRICO** | Preservado pero superado (backups, auditorías de sesión, fases cerradas UBTN) | No en MVP (reservado `docs_archive`) | Excluido |
| **OBSOLETO** | Reemplazado/errado (debug, duplicados de backup) | **No** | Excluido |
| **NO INDEXABLE** | Código, configuración, binarios, secretos, medios | **No** | Excluido |

### Clasificación de los 404 artefactos

| Clase | Nº | Notas |
|-------|----|-------|
| **CANÓNICO** | **138** | Columna vertebral = KH registry (51) + `Documentacion/Arquitectura/*` (29) + `docs/eiarc/*` + `docs/AI_ACOUSTIC_*` (15) + `docs/CMSC_*` + gobernanza (`AGENTS.md`, `MASTERDOC.md`, `GOVERNANCE_RULES`, KB governance) |
| **EVIDENCE** | **63** | `data/datasets/**` (31 manifiestos/metadata) + `docs/ai/manifests/*` (8) + `Documentacion/IA/*` (8) + `benchmark/*` (2) + informes/evidencia de campo |
| **HISTÓRICO** | **183** | `backup_ubtn_docs/*` (58) + `docs/historical/*` (4) + `docs/{sena_artifacts,architect_master,reports,session_plans}` (18) + `UBTN_*` (~25) + auditorías/planes de sesión `SIGCTIARURAL_*` |
| **NO INDEXABLE** | **20** | 13 `src/**` (código) + 6 config (`package*.json`, `docker-compose.yml`, `puppeteer-config.json`, `config.yaml`) + 1 `tools/` |
| **OBSOLETO** | (incluidos en HISTÓRICO/NO INDEXABLE: `debug-ai-model-loader.md`, duplicados en `backup_ubtn_docs/*`) | — |
| **Total** | **404** | Coincide con `memory_inventory.json` |

### P0 exacto = 138 documentos canónicos indexables

El P0 se define como la **unión deduplicada** de:

1. **Knowledge Hub registry (51)** — `source_of_truth` declarado:
   - `project-core` (7): `SIGCT_RURAL_SYSTEM_BOOT.md`, `docs/PLAN_MAESTRO.md`, `docs/MASTERDOC.md`, `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`, `README.md`, `docs/API_REFERENCE.md`, `docs/EDGE_SETUP.md`.
   - `eiarc-architecture` (13) · `eiarc-foundation` (3) · `knowledge-base` (6) · `research-v2` (18) · `historical` (4).
2. **Arquitectura CMSC/Workspace** — `Documentacion/Arquitectura/*` (29): `CMSC_*` (Masterplan, Signal Map, F3A→F4, Orchestration V2, Canonical State, UI, Release Note…), `MMC_WORKBENCH_V1.md`, `FRONTEND_EXECUTION_STRATEGY.md`, `SIGNAL_REGISTRY_V1_OPERATIONAL_PROCEDURE.md`, `ACTA_APROBACION_F3A/F3B.md`, `CMSC_CANONICAL_STATES_APPENDIX_V1.md`, `BENCHMARK_GATE_DECISION_TEMPLATE.md`, `SIGCTIARURAL_CANONICAL_PHILOSOPHY_EVOLUTION_v1.md`, `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md`.
3. **Diseño IA Acústica** — `docs/AI_ACOUSTIC_*` (15) y `docs/CMSC_*` (3).
4. **Gobernanza y núcleo** — `AGENTS.md`, `README.md`, `SIGCT_RURAL_SYSTEM_BOOT.md`, `KNOWLEDGE_HUB_ARCHITECTURE.md`, `docs/GOVERNANCE_RULES.md`, `docs/SIGCTIARURAL_ECOSYSTEM_DATA_GOVERNANCE_ALIGNMENT.md`, `docs/project_knowledge_base/governance/*` (7), `docs/ECOSYSTEM_IDENTITY.md`, `docs/CONTINUITY_MASTER.md`, `docs/AI_MODEL_INVENTORY.md`, `docs/AI_PIPELINE.md`.

> La lista completa es materializable por regla en M3 (unión deduplicada de los bloques 1–4); el conteo gobernado final es **138 documentos canónicos**.

---

## M0-5 · Política de indexación

### ENTRA (indexable)
- Documentos **CANÓNICO** del P0 (`docs_core`): `.md` de gobernanza, arquitectura, KH, diseño IA/CMSC.
- **Evidencia estructurada** (`evidence`): `.yaml`/`.json`/`.csv` de manifiestos, metadata de dataset, informes trazables.
- **Benchmark** (`benchmark`): `Documentacion/IA/*`, `benchmark/*`, métricas M1/M2.

### NO ENTRA (nunca)
- **Código fuente** (`src/**`, `tools/**`): no es conocimiento; se referencia por ruta, no se indexa.
- **Configuración** (`package*.json`, `docker-compose.yml`, `config.yaml`, `puppeteer-config.json`).
- **Binarios y medios**: `*.wav`, `*.raw`, `*.h5`, `*.pth`, `*.onnx`, `*.zip`, imágenes, datasets crudos.
- **Secretos**: `.env*`, claves, tokens, credenciales de BD.
- **Histórico/OBSOLETO** en MVP: `backup_ubtn_docs/**`, `docs/historical/**`, informes de sesión/auditorías superadas, `debug-*`.
- **Ruido generado**: `node_modules/**`, `dist/**`, `runs/**`, `.venv/**`, `__pycache__/**`, `.local_backups/**`.

### Reglas de gobernanza de ingesta
- **Regla de exclusión dura:** si un artefacto es ambiguo, se **excluye** por defecto (fail-closed).
- **Regla de procedencia:** todo chunk indexado conserva `canonical_path`, `category`, `status`, `source_of_truth`, `embedding_version`.
- **Regla de invalidez:** si un documento canónico cambia de ruta o de estado, se **reindexa** el ítem (nunca se deja huérfano silencioso).
- **Reanudable/idempotente:** la ingesta se ejecuta por lotes con reanudación (contrato del modelo de staging F06.5).

---

## M0-6 · Política de seguridad

| Actor | Puede consultar | Límites |
|-------|-----------------|---------|
| **ACP** | `docs_core` + `evidence` + `benchmark` | **Solo lectura.** `top_k` acotado; filtros por `category`/`status`; **sin** acceso a `memory_admin`; nunca escribe en Qdrant. |
| **VoiceAssistant** | Igual que ACP, **a través del ACP** | Solo lectura; `top_k` reducido (respuesta breve); sin persistir consultas ni resultados; sin acceso a admin. |
| **Dashboard CMSC (UI)** | Vista derivada (lectura vía API read-only) | No accede directamente a Qdrant; consume el puerto de lectura. |
| **Administración (ingesta/snapshot/forget)** | `memory_admin` | **Restringido:** solo procesos internos autorizados; allowlist de origen + token/mTLS + aprobación humana. No expuesto a UI de usuario. |

### Reglas duras de seguridad
- **Nunca** se indexan secretos, `.env`, credenciales ni medios crudos (ver M0-5).
- **Sin escritura** desde ACP/Voice: escritura únicamente por el pipeline de ingesta gobernado.
- **Sin acceso a admin** desde canales de usuario (ACP/Voz/web).
- **Auditoría:** toda operación de ingesta/borrado/snapshot queda registrada en `memory_admin` (decisiones, `decision_date`, responsable).
- **Fail-closed:** ante duda de permisos, se deniega.

---

## M0-7 · Colecciones

| Colección | Propósito | Contenido | Vector | Consultable por |
|-----------|-----------|-----------|--------|------------------|
| **`docs_core`** | Conocimiento canónico del ecosistema | Los **138 docs P0** (gobernanza, arquitectura EIARC/CMSC, KH, diseño IA) | dense 768 + sparse (híbrido) | ACP, Voz |
| **`evidence`** | Evidencia trazable y artefactos | Manifiestos, metadata de dataset, informes de campo/bridge (63 EVIDENCE) | dense 768 + sparse | ACP (no Voz por defecto) |
| **`benchmark`** | Resultados de benchmark | `Documentacion/IA/*`, `benchmark/*`, métricas M1/M2, `AGRICULTURE_AI_V2_*` | dense 768 + sparse | ACP |
| **`memory_admin`** | **Control de gobierno de la memoria** (NO es colección de recuperación) | Inventario, acta M0, runbook, registros de ingesta/snapshot/borrado, versiones (`embedding_version`, `corpus_version`) | (metadatos; sin búsqueda semántica de usuario) | **Solo interno** (nunca ACP/Voz) |

**Diseño:** cada colección fija su dimensión y `embedding_version` al crearse. `memory_admin` es una **colección de control de gobernanza** (auditoría y operación), **fuera** del plano de consulta de usuarios; su aislamiento es requisito de seguridad (M0-6).

---

## M0-8 · Roadmap definitivo de implementación

> Cada fase requiere **misión y autorización explícitas**. M0 no autoriza ninguna.

| Fase | Nombre | Objetivo | Gate de salida |
|------|--------|----------|----------------|
| **M1** | **Infraestructura local** | Verificar/instalar **Qdrant** + **Ollama** (fuera del alcance de M0); confirmar modelo/dims (cierra G-M1). | Qdrant y Ollama responden en local; `nomic-embed-text-v2-moe` disponible (768). |
| **M2** | **Contexto hexagonal** | Crear Bounded Context `sigct_memory` (dominio + puertos) siguiendo el andamiaje DDD hexagonal existente. | BC aislado, sin acoplarse a contextos vecinos. |
| **M3** | **Staging gobernado** | Modelo de staging (F06.5): lotes, reanudable, deduplicación, `embedding_version`. | Ingesta idempotente verificada. |
| **M4** | **Ingesta gobernada** | Indexar los **138 docs P0** con reglas M0-4/M0-5; clasificación por regla. | `docs_core` poblada; 0 artefactos prohibidos. |
| **M5** | **API read-only** | Superficie de consulta (híbrida o dense-only como primer corte) con `top_k` y filtros. | Consulta determinista y auditable. |
| **M6** | **Integración CMSC + ACP** | Capacidad de memoria dentro de `/dashboard-cmsc`; ACP lee vía `MemoryQueryPort`. | ACP responde con citas trazables; sin escritura. |
| **M7** | **MVP** | Voz (VoiceAssistant) + evidencia/benchmark + híbrida completa. | Flujo Voz→ACP→Memory end-to-end. |
| **M8** | **P1** | Indexar `evidence` y `benchmark`; triage `HISTÓRICO` a `docs_archive`. | Cobertura P1 gobernada. |
| **M9** | **Edge / soberanía** | Despliegue local/edge; endurecimiento de seguridad (M0-6). | Operación offline verificada. |

**Recursos estimados:** RAM 2–4 GB (MVP) / 6–8 GB (P1+voz) · disco 2–5 GB.

---

## 1. Trazabilidad y gates

| Gate | Descripción | Estado tras M0 |
|------|-------------|----------------|
| **G-M1** | Modelo/dimensión de embeddings decididos | ✅ **CERRADO** (M0-1/M0-2) — verificación de registro en M1 |
| **G-M2** | Autorización de gobernanza para ingesta | ⏳ Pendiente (misión explícita futura) |
| **G-M3** | Corpus y política de indexación verificados | ✅ **CERRADO** (M0-4/M0-5) |
| **G-M4** | Instalación de Qdrant + Ollama | ⏳ Pendiente (M1, fuera de alcance de M0) |
| **G-M5** | Política de seguridad y colecciones | ✅ **CERRADO** (M0-6/M0-7) |

Los gates de **decisión** (G-M1, G-M3, G-M5) quedan cerrados. Los gates de **ejecución** (G-M2 autorización, G-M4 instalación) corresponden a misiones futuras y **no son decisiones de gobierno pendientes**, sino autorizaciones normales de implementación.

---

## 2. Veredicto

Todas las decisiones M0 solicitadas están resueltas, justificadas y trazadas contra el corpus real (404 artefactos) y el Knowledge Hub (51 docs). No queda ninguna decisión abierta que bloquee el diseño. La implementación permanece **expresamente no autorizada** por esta misión y requiere una misión de código explícita (G-M2) más la instalación de infraestructura (M1 / G-M4).

**MEMORY_GATES_READY**
