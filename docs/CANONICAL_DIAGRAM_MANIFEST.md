# Manifiesto de Diagramas Canónicos — SIGC&T Rural

**Fecha:** 2026-10
**Origen:** F5 de `ARCHITECTURE_EVIDENCE_FREEZE_REPORT.md` (misión `ARCHITECTURE_EVIDENCE_FREEZE`)
**Autor del proyecto:** Bernardo Adolfo Gómez Montoya
**Estado:** vigente (índice). No reescribe diagramas; solo declara cuál es la fuente única por tema.

> **Regla de oro:** un tema → un artefacto canónico. El resto se conserva por trazabilidad (NADA DESAPARECE) pero queda marcado como histórico/obsoleto y NO debe usarse como referencia. Este manifiesto sustituye al obsoleto `docs/architect_master/04_DIAGRAM_AUDIT.md`.

---

## 1. Esquema de datos (ERD / EER)

| Rol | Artefacto | Estado |
| :--- | :--- | :--- |
| **CANÓNICO** | `docs/database/er_schema_v8.mmd` | Vigente. Derivado campo por campo de `src/backend/api/models.py` + `src/backend/api/migrations/` (fuente de verdad del esquema, `MASTERDOC.md §2.9`). |
| Histórico | `docs/database/er_schema.svg` | **OBSOLETO** (entidades USER/PROJECT/TELEMETRY/COURSE). Marcado en el archivo. |
| Histórico | `docs/database/class_db_models.svg` | **OBSOLETO** (User/Project/Telemetry/ImageSample). Marcado en el archivo. |
| Histórico | `docs/database/ModelEER_Sigct-rural.mwb` | **OBSOLETO** (MySQL Workbench; el stack migró a PostgreSQL). |
| Histórico | `schema_postgresql.sql` (raíz) | Volcado histórico (solo `api_sensorreading` + 10 built-ins; `0002` no materializada). NO es fuente de verdad. |
| Canónico (datos EIARC) | `docs/eiarc/03_DIAGRAMS/EIARC_CANONICAL_DATA_MODEL.mmd` (+ `.md`) | Vigente para el modelo de datos EIARC a nivel de contexto. |

## 2. Context Map (EIARC)

| Rol | Artefacto | Estado |
| :--- | :--- | :--- |
| **CANÓNICO (raíz)** | `docs/eiarc/03_DIAGRAMS/SIGCT_RURAL_CONTEXT_MAP_V8.mmd` | Vigente. Convención de 3 niveles (🟢 núcleo / 🔷 soporte / ⚪ periferia). |
| Canónico (vista EIARC) | `docs/eiarc/03_DIAGRAMS/EIARC_CONTEXT_MAP.mmd` | Vigente. |
| Canónico (interacción) | `docs/eiarc/03_DIAGRAMS/EIARC_CONTEXT_INTERACTION.mmd` | Vigente. |
| Canónico (código→contexto) | `docs/eiarc/03_DIAGRAMS/EIARC_CODE_TO_CONTEXT_MAP.mmd` | Vigente (**v1.1.0**, 2026-10: incluye `contexts/**` y `shared_kernel/**`). |
| Canónico (dominio) | `docs/eiarc/03_DIAGRAMS/EIARC_DOMAIN_MAP.mmd` | Vigente. |
| Fuente textual | `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` | Vigente (definición formal de los 7 contextos). |
| _Faltante_ | Context Map **AS-IS** del hex real (contexts + shared_kernel + core + infrastructure + api/logic) | **No existe** — ver `SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT.md`. Propuesta, no creada. |

## 3. Arquitectura hexagonal AS-IS

| Rol | Artefacto | Estado |
| :--- | :--- | :--- |
| **CANÓNICO (texto)** | `docs/MASTERDOC.md §1` (§1.1 tabla de 4 estructuras; §1.2 dirección técnica) | Vigente (actualizado 2026-10). |
| Canónico (contrato) | `docs/HEXAGONAL_REFACTOR_PLAN.md` + `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` | Vigente (Strangler Fig, `EventBusPort`). |
| Evidencia AS-IS | `docs/SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT.md`, `docs/REAL_ARCHITECTURE_REPORT.md` | Vigente (informes de auditoría). |
| Histórico | `docs/architecture/README.md` | Describe hex V2; **pendiente actualización a V3/contexts**. |

## 3-bis. Arquitectura hexagonal EIARC (vistas por contexto)

`docs/eiarc/03_DIAGRAMS/`: `EIARC_ARCHITECTURE_OVERVIEW.mmd` · `PRODUCTIVE_CONTEXTS_V8.mmd` · `TELEMETRY_IOT_ARCHITECTURE_V8.mmd` · `TELEMETRY_CONTEXT_TARGET_ARCHITECTURE.mmd` · `LABORATORY_ARCHITECTURE_V8.mmd` · `AI_ML_ARCHITECTURE_V8.mmd` · `AI_CONTEXT_TARGET_ARCHITECTURE.mmd` · `KNOWLEDGE_HUB_ARCHITECTURE_V8.mmd` · `EIARC_AI_CANONICAL_FLOW.mmd` · `EIARC_TRANSFORMATION_ROADMAP.mmd`. Todos vigentes.

## 4. `docs/uml/` (UML clásico)

| Artefacto | Estado |
| :--- | :--- |
| `class_backend.svg` | **OBSOLETO** (User/Project/Telemetry/ImageSample/Course). Marcado en el archivo. |
| `activity_model_training.*`, `deployment_cloud_edge.*`, `package_layers.*`, `sequence_data_ingest.*`, `sequence_user_auth.*`, `state_alerting.*` | Histórico. Conservar; verificar antes de reutilizar. |
| `component_system.svg` | **DUPLICADO** de `docs/diagrams/_archive/component_system.svg`. |

## 5. `docs/diagrams/`

| Artefacto | Estado |
| :--- | :--- |
| `c4_context.mmd`, `class_lab_catalog.mmd`, `sequence_navigation.mmd`, `use_cases.mmd` (+ svg) | Vigentes. |
| `architecture.svg` | Histórico (no hay `architecture.mmd`). |
| `_archive/*.svg` (activity_model_training, component_system, package_layers, sequence_user_auth, state_alerting) | Archivados. Conservar. |

## 6. Referencias rotas conocidas

`docs/architect_master/03`–`06` citan artefactos que **no existen**:

- `docs/diagrams/architecture.mmd`, `c4_containers.mmd`, `c4_components.mmd`, `c4_deployment.mmd`
- `docs/database/er_schema.mmd`, `class_db_models.mmd`

Acción: los documentos `03`–`06` son artefactos históricos (ver §7). No se recrean los `.mmd`; sus equivalentes vigentes son los de `docs/eiarc/03_DIAGRAMS/` y `docs/database/er_schema_v8.mmd`.

## 7. `docs/architect_master/` (histórico)

- `03_DOCUMENT_TRUTH_MATRIX.md` — histórico; **corregido** 2026-10 (fuente de verdad del esquema).
- `04_DIAGRAM_AUDIT.md`, `05_FINAL_ARCHITECTURE_BASELINE.md`, `06_EVIDENCE_STATUS_MATRIX.md` — **auto-declarados obsoletos** (nota FASE 5C). Reemplazados por este manifiesto y por `docs/eiarc/03_DIAGRAMS/*_V8.mmd`.
- `01`, `02`, `07`, `08` — consultar con criterio; no canónicos.

## 8. Regla de mantenimiento

1. Todo diagrama nuevo se registra en este manifiesto con su rol (canónico / histórico) y su fuente de generación.
- Un mismo tema no puede tener dos canónicos: si aparece un segundo, se marca el anterior como histórico en el mismo cambio.
- Los artefactos obsoletos se marcan (comentario XML en SVG/XML, nota en Markdown); **no se borran**.

---

*Bernardo Adolfo Gómez Montoya — 2026*
