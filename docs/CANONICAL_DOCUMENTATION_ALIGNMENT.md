# CANONICAL_DOCUMENTATION_ALIGNMENT

> **Misión:** `CANONICAL_DOCUMENTATION_ALIGNMENT`.
> **Objetivo:** declarar qué documentación es **CANÓNICA**, **HISTÓRICA** u **OBSOLETA**, detectar **duplicados**, decidir **dónde vive** cada artefacto (`docs/` vs `docs/historical/`) y qué debe / no debe **indexar SIGCT Memory**.
> **Naturaleza:** índice de gobierno documental. **No mueve, no reescribe, no borra** archivos. **Sin código · sin commits · sin push.**
> **Base:** `ARCHITECTURE_EVIDENCE_FREEZE_REPORT`, `CANONICAL_DIAGRAM_MANIFEST.md`, `CANONICAL_ARCHITECTURE_MASTER_REPORT`, `CANONICAL_ARCHITECTURE_FINAL_REPORT` + inventario real de `docs/` (**327 archivos**: 259 `.md` · 28 `.mmd` · 21 `.svg` · 8 `.yaml` · 3 `.html` · 2 `.png` · 2 `.json` · 1 `.css` · 1 `.docx` · 1 `.py` · 1 `.mwb`).

**Principio rector:** *un tema → un artefacto canónico*; **NADA DESAPARECE** (lo histórico/obsoleto se **marca y conserva**, no se borra).

---

## 1. Documentación CANÓNICA (fuente de verdad / normativa)

| Categoría | Artefacto | Rol |
|---|---|---|
| **Canon maestro** | `docs/MASTERDOC.md` (§1 AS-IS, §2.9 esquema, §3 EIARC) | Normativo raíz |
| **Identidad / visión** | `docs/ECOSYSTEM_IDENTITY.md` | Identidad del ecosistema |
| **Reglas** | `docs/GOVERNANCE_RULES.md` | Reglas de gobierno |
| **Consolidación arquitectónica** | `docs/CANONICAL_ARCHITECTURE_MASTER_REPORT.md` · `docs/CANONICAL_ARCHITECTURE_FINAL_REPORT.md` | Verdad consolidada + dictamen freeze |
| **Evidencia congelada** | `docs/ARCHITECTURE_EVIDENCE_FREEZE_REPORT.md` · `docs/REAL_ARCHITECTURE_REPORT.md` · `docs/G1_SCHEMA_CONSISTENCY_REPORT.md` · `docs/R1_DEPENDENCY_INVERSION_AUDIT.md` · `docs/SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT.md` · `docs/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT.md` | Informes de verdad verificada |
| **Índice de diagramas** | `docs/CANONICAL_DIAGRAM_MANIFEST.md` | Un tema → un artefacto |
| **Refactor** | `docs/HEXAGONAL_REFACTOR_PLAN.md` · `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` | Contrato de refactor |
| **EIARC (fundación)** | `docs/eiarc/01_FOUNDATION/EIARC_VISION.md` · `EIARC_SCOPE.md` | Definición oficial |
| **EIARC (arquitectura)** | `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` · `EIARC_CANONICAL_PRINCIPLES.md` · `EIARC_CANONICAL_DATA_MODEL.md` | 7 contextos + principios + modelo |
| **EIARC (diagramas)** | `docs/eiarc/03_DIAGRAMS/*_V8.mmd` + `EIARC_CODE_TO_CONTEXT_MAP.mmd` (v1.1.0) · `SIGCT_RURAL_CONTEXT_MAP_V8.mmd` | Canónicos por manifest |
| **Esquema** | `docs/database/er_schema_v8.mmd` · `docs/database/README.md` | ERD canónico |
| **Continuidad** | `docs/CONTINUITY_MASTER.md` (§12 vigente) · `docs/CONTINUITY_RUNBOOK.md` | Handoff operativo |
| **IA acústica (gobernanza)** | `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` · `AI_ACOUSTIC_FEATURE_MAP.md` · `AI_ACOUSTIC_CAPTURE_OPERATOR_GUIDE.md` · `AI_ACOUSTIC_ARCHITECTURE_V1.md` | Contratos vigentes S30/S81/S82 |
| **IA (manifiestos)** | `docs/ai/manifests/*.yaml` (8) | Gobernanza de datasets |
| **Knowledge Hub** | `docs/KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md` | Spec canónica del Hub |
| **SIGCT Memory (diseño)** | `docs/SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md` · `SIGCT_MEMORY_IMPLEMENTATION_01.md` · `SIGCT_MEMORY_F01..F06.5` | Diseño aprobado (no implementado) |
| **Frontend** | `docs/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT.md` | Dictamen `GO_CONDICIONADO` |
| **Proyecto (estado)** | `docs/DATASET_STATUS_REPORT.md` · `docs/INDICE_PROYECTO.md` | Estado consolidado |

---

## 2. Documentación VIGENTE de REFERENCIA (no normativa, consultable)

Estos artefactos **no son fuente de verdad** pero se mantienen en `docs/` (uso operativo, históricamente recientes):
`docs/ai/research_v2/*` (18, etapa investigación IA v2) · `docs/project_knowledge_base/**` (KB + governance) · `docs/reports/AI_SERVICE_EXECUTION_READINESS.md` · `docs/reports/continuity_status.md` · `docs/AI_MODEL_INVENTORY.md` · `docs/AI_PIPELINE.md` · `docs/API_REFERENCE.md` · `docs/DEPLOYMENT.md` · `docs/DEPLOYMENT_AWS.md` · `docs/EDGE_SETUP.md` · diagramas vigentes `docs/diagrams/{c4_context,class_lab_catalog,sequence_navigation,use_cases}.mmd` (+svg).

---

## 3. Documentación HISTÓRICA (conservar; NO usar como referencia)

| Grupo | Artefactos | Motivo |
|---|---|---|
| Reconciliación/auditorías previas | `docs/PILOT_*`, `docs/FIELD_*`, `docs/INITIAL_CAPTURE_EVIDENCE.md`, `docs/INITIAL_METADATA_AUDIT.md`, `docs/AUDIT_TRAMO_BC.md`, `docs/EVIDENCIA_FLUJO_BRIDGE.md`, `docs/INFORME_BRIDGE_E2E_UI.md`, `docs/INFORME_TRAMO_C_FINAL.md`, `docs/FIELD_CAPTURE_RUN_001_REPORT.md` | Evidencia de etapa cerrada |
| Estado de sesión | `docs/SIGCTIARURAL_ESTADO_SESION_2026-09-14.md`, `SIGCTIARURAL_STATE_SYNC_REPORT.md`, `SIGCTIARURAL_HEALTH_REPORT.md`, `CMSC_PROJECT_STATUS_2026_10_05.md` | Snapshots puntuales |
| Evolución U1/U2/U3/U4 | `docs/SIGCTIARURAL_U1_*`, `U2_*`, `U3_5_*`, `U4_2_*`, `SIGCTIARURAL_EVOLUTION_MATRIX.md`, `SIGCTIARURAL_NAVIGATION_EVOLUTION.md`, `SIGCTIARURAL_ROUTE_EVOLUTION.md`, `SIGCTIARURAL_PAGE_MAPPING.md` | Etapas superadas |
| F1 sensor O.K. | `docs/SIGCTIARURAL_F1_*` (3) | Hito cerrado (referenciable) |
| Refactor previo | `docs/SIGCTIARURAL_RC1_AUDIT.md`, `RC2_CONSOLIDATION.md`, `RC2_FREEZE.md`, `RC2_READINESS.md`, `SIGCTIARURAL_REFACTORING_AUDIT.md`, `SIGCTIARURAL_MIGRATION_AUDIT.md`, `SIGCTIARURAL_REFACTORING_GUARDRAILS.md` | Pre-`contexts/` |
| Preservación | `docs/SIGCTIARURAL_PRESERVATION_AUDIT.md`, `PRESERVATION_STRATEGY.md`, `LAB_PRESERVATION_STRATEGY.md` | Auditorías de conservación |
| UBTN (diseño) | `docs/UBTN_*.md` (~27) | **DISEÑO** (no implementado) |
| MMD/xxx antiguos | `docs/uml/*` salvo marcados, `docs/diagrams/architecture.svg`, `docs/diagrams/_archive/*`, `docs/reports/_archive/*`, `docs/session_plans/_archive/*`, `docs/edge/*` | Diagramas/etapas previas |
| architect_master | `docs/architect_master/01,02,07,08` | Previos a `contexts/`; consultar con criterio |

> **Nota:** "HISTÓRICO" = conservado por trazabilidad; **no** es referencia vigente. Una misión de reubicación puede mover todo este bloque a `docs/historical/` **sin borrar**.

---

## 4. Documentación OBSOLETA (marcada; NO usar)

| Artefacto | Motivo | Marca |
|---|---|---|
| `docs/database/er_schema.svg` | Entidades retiradas (USER/PROJECT/TELEMETRY/COURSE) | XML `OBSOLETO` (F1) |
| `docs/database/class_db_models.svg` | User/Project/Telemetry/ImageSample | XML `OBSOLETO` (F1) |
| `docs/uml/class_backend.svg` | Modelo de clases pre-V8 | XML `OBSOLETO` (F1) |
| `docs/database/ModelEER_Sigct-rural.mwb` | MySQL Workbench (stack migró a PostgreSQL) | Sección "obsoletos" `database/README.md` (F1) |
| `docs/architect_master/04_DIAGRAM_AUDIT.md` | Auto-declarado obsoleto (FASE 5C) | Nota en archivo (F4) |
| `docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md` | Idem | Nota en archivo (F4) |
| `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md` | Idem | Nota en archivo (F4) |
| `schema_postgresql.sql` (raíz, no en `docs/`) | Volcado histórico desactualizado | `database/README.md` + `MASTERDOC §2.9` |

> Todos se **conservan** (NADA DESAPARECE). Ninguno debe citarse como referencia.

---

## 5. Duplicados detectados

| # | Duplicado | Ubicaciones | Acción propuesta |
|---|---|---|---|
| D-1 | `component_system.svg` | `docs/uml/component_system.svg` + `docs/diagrams/_archive/component_system.svg` | Conservar 1 en `historical/`; marcar el otro |
| D-2 | `class_backend.svg` | `docs/uml/class_backend.svg` + `docs/diagrams/_archive/class_backend.svg` | Idem (además obsoleto) |
| D-3 | **KB-001..003** duplican `docs/historical/` | `docs/project_knowledge_base/KB-001..003` ↔ `docs/historical/{TRAE_INDEPENDENT_REPOSITORY_AUDIT,README_REALITY_CHECK,AI_INTEGRATION_AUDIT}` | Dejar una copia; marcar la otra como espejo |
| D-4 | SVG en `docs/diagrams/` **y** `docs/uml/` | `activity_model_training`, `package_layers`, `sequence_user_auth`, `state_alerting` | Consolidar en `docs/historical/diagrams/` |
| D-5 | Snapshots de estado solapados | `ESTADO_SESION_2026-09-14`, `STATE_SYNC_REPORT`, `continuity_status.md` | Prevalecer `CONTINUITY_MASTER.md`; el resto a histórico |

---

## 5-bis. Contradicciones y ambigüedades documentales restantes

- **C-1 (residual):** diagrama `MASTERDOC §1` rotulado *"V3 — capa objetivo"* dibuja `core/` y no nombra `contexts/` ni `EventBus` → **pendiente actualizar** (A-3 del FINAL_REPORT).
- **C-2 (residual):** `docs/architecture/README.md` describe hexágono **V2**; solo lleva nota de vigencia → **pendiente actualizar a V3/contexts**.
- **A-1 (ambigüedad):** `docs/PLAN_MAESTRO.md` vs `docs/MASTERDOC.md` — dos "maestros"; el canónico es `MASTERDOC.md`; `PLAN_MAESTRO.md` queda ambiguo.
- **A-2 (ambigüedad):** `docs/INDICE_PROYECTO.md` y `docs/CMSC_CONTINUATION_PROMPT.md` / `CMSC_DECISION_LOG.md` — estatus no fijado; recomendar anclarlos al canon CMSC (`Documentacion/Arquitectura/`).
- **A-3 (ambigüedad):** `docs/ai/research_v2/*` conviven con canon IA acústica → declarar `research_v2` como histórico de la etapa agrícola v2.

---

## 6. Ubicación: qué vive en `docs/` vs `docs/historical/`

**Regla propuesta (no ejecutada):** `docs/` = **canónico + vigente de referencia**. `docs/historical/` = **todo lo histórico y obsoleto**, preservando subestructura. Nada se borra.

| Destino | Contenido |
|---|---|
| **`docs/`** (permanece) | §1 (CANÓNICO) + §2 (referencia vigente: `ai/research_v2`, `project_knowledge_base`, `reports/*`, `API_REFERENCE`, `DEPLOYMENT*`, `EDGE_SETUP`, manifiestos IA, diagramas vigentes) |
| **`docs/historical/`** (destino propuesto) | §3 (HISTÓRICO) + §4 (OBSOLETO) + `_archive/` + snapshots de estado + `UBTN_*` (hasta implementación) + `uml/*` históricos + `architect_master/01,02,04,05,06,07,08` + `PLAN_MAESTRO.md` (tras marcar) + espejos duplicados |
| **`docs/eiarc/`** | Permanece íntegro (canónico) |
| **`docs/database/`** | Permanecen `er_schema_v8.mmd` + `README.md`; los 3 SVG + `.mwb` → histórico/obsoleto (ya marcados) |
| **Raíz (`schema_postgresql.sql`)** | **No** mover a `docs/`; es dump de raíz = histórico declarado |

> **Importante:** esta tabla es **propuesta**. La reubicación real requiere **misión explícita** (implica `git mv` + actualizar referencias). No se ejecuta aquí.

---

## 7. Indexación en SIGCT Memory

**Regla (masterplan §5):** indexar solo lo **verificable + trazable**; **jamás** binarios ni secretos.

### 7.1 SÍ indexar (contenido semántico para ACP/KH)

| Grupo | Artefactos |
|---|---|
| Canon normativo | §1 completo (`MASTERDOC`, `ECOSYSTEM_IDENTITY`, `GOVERNANCE_RULES`, informes de evidencia, manifiestos de diagramas, EIARC fundación/arquitectura, `er_schema_v8`, `CONTINUITY_MASTER`, gobernanza acústica, especificación KH, diseño SIGCT Memory, **este reporte**) |
| Manifiestos / gobernanza | `docs/ai/manifests/*.yaml` (8) + `docs/database/README.md` |
| Evidencia operativa | `docs/EVIDENCIA_FLUJO_BRIDGE.md`, `INFORME_BRIDGE_E2E_UI.md`, `DATASET_STATUS_REPORT.md` (metadatos, no audio) |
| Registro KH | `src/frontend/src/knowledge-hub/registry/knowledgeRegistry.generated.json` (51 docs) |
| Referencia vigente (opcional, baja prioridad) | `docs/ai/research_v2/*` (metodología), `docs/reports/*.md`, `API_REFERENCE.md` |

### 7.2 NO indexar

| Excluir | Motivo |
|---|---|
| `.mmd`/`.svg`/`.png` como **binario** (indexar solo su **descripción** en el manifest) | No aportan texto recuperable útil / ruido |
| `*.svg` obsoletos (`er_schema.svg`, `class_db_models.svg`, `class_backend.svg`) | Contaminan la recuperación con verdad falsa |
| `ModelEER_Sigct-rural.mwb`, `*.docx`, `*.html` de `_archive/` | Binarios/archivos de archivo |
| Todo §3/§4 (histórico/obsoleto) **salvo** un índice textual | Evitar promover datos superados |
| `runs/`, `node_modules/`, `.env`, `*.h5/.pth/.onnx`, WAV/RAW, `.zip`, sandbox/Temp, logs | Política de privacidad (masterplan §5) |

**Regla de oro de indexación:** indexar solo lo **CANÓNICO (§1)**; lo histórico se **enlaza por índice**, nunca se embebe como conocimiento vigente.

---

## 7-bis. Indexación — separación de conjuntos (resumen operativo)

- **CONJUNTO INDEXABLE (P0):** §1 completo + manifiestos + `knowledgeRegistry.generated.json`.
- **CONJUNTO INDEXABLE (P1, opcional):** §2 referencia vigente (metodología).
- **CONJUNTO EXCLUIDO:** §3 histórico + §4 obsoleto + duplicados §5 + binarios (§7.2).

---

## 8. Dictamen

**`DOCUMENTATION_ALIGNED`** — la documentación admite una clasificación **canónico / histórico / obsoleto / pendiente** sin contradicciones de fondo, y con un conjunto canónico claramente delimitado.

**Integración ASUS ↔ Toshiba (2026-11-04) resuelta:**
- C-02 = RESUELTO PASS (arquitectura, implementado y validado).
- 4 documentos KEEP adoptados en `docs/architecture/` (ARQUITECTURA).
- 1 MERGE: `C02_IMPLEMENTATION_STRATEGY.md` → absorción en `HEXAGONAL_REFACTOR_PLAN.md`.
- 7 documentos ARCHIVE preservados en rutas actuales.
- 1 documento LOCAL_EVIDENCE_ONLY fuera de GitHub.

**Pendiente para `DOCUMENTATION_FROZEN`:**
1. Actualizar `MASTERDOC §1` (diagrama) y `docs/architecture/README.md` a `contexts`/V3 (C-1, C-2).
2. Fijar estatus de `PLAN_MAESTRO.md`, `INDICE_PROYECTO.md`, `CMSC_*` (A-1, A-2).
3. Generar artefactos faltantes C-1/C-2 del `CANONICAL_ARCHITECTURE_FINAL_REPORT` (Context Map AS-IS, ERD reconciliado).
4. Misión explícita de **reubicación** a `docs/historical/` (no destructiva).

**No requiere** — para este dictamen — ejecutar R2, ni Memory, ni Qdrant, ni reemplazo Docker.

---

**Sin mover, reescribir ni borrar archivos · sin código · sin commits · sin push.**
*Bernardo Adolfo Gómez Montoya — 2026*
