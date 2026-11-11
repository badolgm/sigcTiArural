# DOCUMENTATION_GOVERNANCE_REVIEW

**Misión:** revisión de gobernanza documental tras la aprobación de las decisiones D-L1, D-L1b, D-L2 y D-L3.
**Fecha:** 2026-11-04.
**Alcance:** cluster L1-L6 (procedencia/modelo) + cluster Docker-ready (validación runtime) + documentos directamente afectados por las decisiones aprobadas. El resto de `docs/` se considera fuera de alcance de esta revisión (se mantiene su clasificación previa).
**Restricciones respetadas:** sin commit, sin push, sin merge, sin modificar código, sin generar documentación nueva innecesaria. Único entregable: este archivo.

## 1. Decisiones tomadas como APROBADAS (referencia)

| Decisión | Contenido | Estado |
|---|---|---|
| D-L1 | Vocabulario unificado a `HISTORICO` (runtime) con `status_alias: HISTORICAL` (registro). | APROBADA (implementada) |
| D-L1b | S74: solo `nota` + `model_status` separado; no re-etiquetar `estado` por decreto. | APROBADA (implementada) |
| D-L2 | `/health` responde siempre 200; la alarma es el valor del campo (no 503). | APROBADA (implementada) |
| D-L3 | Botón `INFERENCIA REAL` renombrado a `ANÁLISIS CON MODELO`. | APROBADA (implementada) |

## 2. Qué documentación existente debe actualizarse

| Documento | Acción requerida | Razón |
|---|---|---|
| `docs/L1_L6_EXECUTION_REPORT.md` | Añadir sección "Decisiones aprobadas (D-L1..D-L3)" con fecha y referencia a `CMSC_DISCLOSURE_ALIGNMENT_REPORT.md`. | Hoy describe L-3b/L-4c como no ejecutados; tras la misión de alineación ya están cerrados (AC-L6/AC-L8 PASS). |
| `docs/L1_L6_RUNTIME_VERIFICATION_REPORT.md` | Reclassificar V-17/V-18 de FAIL a PASS y clausurar como `VERIFIED` (supersede por el reporte de alineación). | Las validaciones fallaron por deuda de código ya cerrada en `CMSC_DISCLOSURE_ALIGNMENT`. |
| `docs/model_registry.agriculture_v2.yaml` (datos) | Ya actualizado con `HISTORICO`/alias; verificar `status_alias` presente. | D-L1. (Fuera de docs/ pero referenciado.) |
| `docs/DEPLOYMENT.md` | Reescribir (O-3) o archivar; hoy 61 líneas, 21/08/2026, obsoleto. | L-5/D-L5 depende de esta reescritura. |

## 3. Qué documentos quedan obsoletos

| Documento | Motivo |
|---|---|
| `docs/L1_L6_RUNTIME_DISCLOSURE_PLAN.md` | Era el documento de decisión (D-L1..D-L4 pendientes). Las decisiones están aprobadas e implementadas; su contenido de "pendiente de firma" ya no aplica. |
| `docs/DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` | Intermedio; superseded por `DOCKER_READY_FINAL_DECISION_REPORT.md` / `DOCKER_READY_CLOSURE_REPORT.md`. |
| `docs/DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT.md` | Intermedio de bloqueadores; los bloqueadores se resolvieron en `L1_L6_RUNTIME_VERIFICATION` + alineación. |
| `docs/PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` | Superseded por `VISUAL_VALIDATION_FINAL_REPORT.md` + `L1_L6_RUNTIME_VERIFICATION_REPORT.md`. |
| `docs/DEPLOYMENT.md` | Obsoleto por fecha y contenido (61 líneas, 21/08/2026). |

## 4. Qué documentos pueden fusionarse

| Fusión recomendada | Justificación |
|---|---|
| `L1_L6_EXECUTION_PLAN.md` + `L1_L6_EXECUTION_REPORT.md` → un único `L1_L6_EXECUTION_REPORT.md` | El plan (V-1..V-19, AC-L1..AC-L14) y la ejecución son la misma cadena; mantener dos archivos duplica contexto. |
| `L1_L6_RUNTIME_DISCLOSURE_PLAN.md` + `L1_L6_RUNTIME_VERIFICATION_REPORT.md` → absorber la tabla de decisiones aprobadas en el reporte de verificación. | La planificación de disclosure queda cerrada; la verificación es el estado final. |
| `DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` + `DOCKER_READY_FINAL_DECISION_REPORT.md` → uno solo (`DOCKER_READY_FINAL_DECISION_REPORT.md`). | Evitar dos "decisiones" paralelas. |
| `VISUAL_VALIDATION_FINAL_REPORT.md` + `L1_L6_RUNTIME_VERIFICATION_REPORT.md` | La validación visual es parte de V-17/V-18. |

## 5. Qué documentación no aporta valor permanente

| Documento | Motivo |
|---|---|
| `docs/CONTINUITY_RUNBOOK.md` (2.5 KB) | Runbook genérico, superseded por `CONTINUITY_MASTER.md`. |
| `docs/INDICE_PROYECTO.md` (1.4 KB) | Índice estático desactualizado; el índice real es el Knowledge Hub (51 docs). |
| `docs/ECOSYSTEM_IDENTITY.md` | Superseded por `SIGCTIARURAL_VISION_ALIGNMENT.md` y `SIGCTIARURAL_CANONICAL_PHILOSOPHY_EVOLUTION_v1.md`. |
| `docs/SIGCTIARURAL_ESTADO_SESION_2026-09-14.md` | Bitácora de sesión, valor histórico solo. |
| `docs/STAGE_FREEZE_20261013.txt` | Nota de freeze, sin valor permanente. |

## 6. Clasificación final (cluster L1-L6 + Docker-ready)

| Documento | Clasificación |
|---|---|
| `L1_L6_EXECUTION_REPORT.md` | **KEEP** (actualizar con decisiones aprobadas) |
| `L1_L6_RUNTIME_VERIFICATION_REPORT.md` | **KEEP** (reclasificar V-17/V-18 a PASS) |
| `CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` | **KEEP** (estado final de alineación) |
| `PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md` | **KEEP** (procedencia canónica) |
| `L1_L6_EXECUTION_PLAN.md` | **MERGE** → en `L1_L6_EXECUTION_REPORT.md` |
| `L1_L6_RUNTIME_DISCLOSURE_PLAN.md` | **MERGE** → en `L1_L6_RUNTIME_VERIFICATION_REPORT.md` |
| `L1_L6_RUNTIME_DISCLOSURE_PLAN.md` (tras merge) | **ARCHIVE** |
| `DOCKER_READY_FINAL_DECISION_REPORT.md` | **KEEP** |
| `DOCKER_READY_CLOSURE_REPORT.md` | **KEEP** |
| `DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` | **ARCHIVE** |
| `DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT.md` | **ARCHIVE** |
| `DOCKER_OFFICIAL_EXECUTION_PLAN.md` | **ARCHIVE** |
| `DOCKER_READY_REMEDIATION_PLAN.md` | **ARCHIVE** |
| `DOCKER_READY_R1_R4_EXECUTION_PLAN.md` | **ARCHIVE** |
| `DOCKER_READY_R1_R4_REPORT.md` | **ARCHIVE** |
| `PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` | **ARCHIVE** |
| `VISUAL_VALIDATION_FINAL_REPORT.md` | **MERGE** → en `L1_L6_RUNTIME_VERIFICATION_REPORT.md` |
| `ARCHITECTURE_EVIDENCE_FREEZE_REPORT.md` | **ARCHIVE** |
| `CANONICAL_DOCUMENTATION_ALIGNMENT.md` | **KEEP** |
| `DEPLOYMENT.md` | **OBSOLETE** (reescribir en O-3) |
| `CONTINUITY_RUNBOOK.md` | **OBSOLETE** |
| `INDICE_PROYECTO.md` | **OBSOLETE** |
| `ECOSYSTEM_IDENTITY.md` | **OBSOLETE** |
| `SIGCTIARURAL_ESTADO_SESION_2026-09-14.md` | **OBSOLETE** |
| `STAGE_FREEZE_20261013.txt` | **OBSOLETE** |

## 7. Nota de alcance

Esta revisión cubre únicamente el cluster afectado por las decisiones D-L1..D-L3 (procedencia/modelo IA) y el cluster Docker-ready. La gobernanza del resto de `docs/` (CMSC, acústico, UBTN, datasets) se mantiene bajo sus documentos canónicos existentes (`CMSC_CANONICAL_STATE_v1.md`, `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md`, etc.) y no se reclasifica aquí.

## 8. Restricciones respetadas

- Sin commit, sin push, sin merge, sin modificar código.
- Sin generar documentación nueva innecesaria (solo este archivo).
- HEAD `d930a34`; `stash@{0}` intacto.

## 9. Integración ASUS ↔ Toshiba (2026-11-04) completada

| Elemento | Estado | Detalle |
|---|---|---|
| **C-02** | **RESUELTO PASS** | Arquitectura implementada y validada técnicamente. |
| **Clasificación KEEP** | 4 adoptados | `ARCHITECTURE_AUDIT_VALIDATION.md`, `ARCHITECTURE_ACTION_MATRIX.md`, `ARCHITECTURE_ACTION_REVIEW.md`, `C02_EXECUTION_PACKAGE.md` → `docs/architecture/` (canónico). |
| **Clasificación MERGE** | 1 fusionado | `C02_IMPLEMENTATION_STRATEGY.md` → absorción en `HEXAGONAL_REFACTOR_PLAN.md` (requiere autorización explícita). |
| **Clasificación ARCHIVE** | 7 preservados | `ARCHITECTURE_AUDIT.md`, `TOSHIBA_AUDIT_SPRINT_CLOSURE.md`, `DOCUMENTATION_LANGUAGE_NORMALIZATION.md`, `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md`, `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md`, `TOSHIBA_EXPORT_MANIFEST.md`, `TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` → in situ, rol histórico. |
| **Clasificación LOCAL_EVIDENCE_ONLY** | 1 fuera de GitHub | `ARCHITECTURE_GOVERNANCE_REVIEW.md` → evidencia local, no publicada en GitHub. |
| **Backlog oficial actualizado** | C-02 = RESUELTO | 4 KEEP + 1 MERGE + 7 ARCHIVE + 1 LOCAL_EVIDENCE_ONLY. Sin auditorías nuevas, sin hallazgos nuevos, sin reanálisis de C-02. |
