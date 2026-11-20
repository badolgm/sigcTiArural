# DOCUMENTATION_REPOSITORY_CONSOLIDATION_MASTERPLAN_V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: docs/DOCUMENTATION_REPOSITORY_CONSOLIDATION_MASTERPLAN.md
> - Destino: docs/DOCUMENTATION_REPOSITORY_CONSOLIDATION_MASTERPLAN.md

## Plan de consolidación documental canónica del ecosistema SIGCT-Rural

**Estado:** Solo planificación. Sin ejecutar migraciones. Sin mover archivos. Sin renombrar. Sin borrar. Sin git add. Sin commit. Sin push.

---

## FASE 1 – INVENTARIO TOTAL

> **Nota de reconciliación LOTE-1 (2026-11-18):** este inventario es el **snapshot original previo a la ejecución** (296 archivos). Tras LOTE-1 (commit `82d26cf`), 18 documentos de las familias `SIGCT_MEMORY_*` (11), `SIGCTIARURAL_RESEARCH_*` (3) y `CMSC_*` (4) residen en las carpetas canónicas `docs/memory/`, `docs/research/` y `docs/cmsc/`. El inventario se conserva como evidencia del estado previo.
>
> **Nota de reconciliación LOTE-3 (2026-11-18):** 17 documentos de la familia de gobernanza IA y benchmark (`AI_R1_*`…`AI_R5_*`, `M1_*`, `M1_M2_*`, `M2_*`, `H5_AI_GOVERNANCE_CLOSURE_REPORT`, `R5_AI_SERVING_STRATEGY_REPORT`) fueron **trasladados** de `docs/` a `docs/ai/` mediante `git mv` (**sin commit**). Las filas de este inventario que aún los muestran en `docs/` se conservan como snapshot del estado previo a la ejecución.
>
> **Nota de reconciliación UNCLASSIFIED-5 (2026-11-18):** 5 documentos previamente sin clasificar quedaron clasificados (D-007) y reubicados mediante `git mv` (**sin commit**): `TOSHIBA_CLOSURE_REPORT_20261117.md`, `DOCUMENTATION_DECISION_ALIGNMENT_REPORT.md`, `PRE_COMMIT_CLASSIFICATION.md` y `PRE_COMMIT_FORENSIC_REVIEW.md` → `docs/historical/` (HISTORICAL); `DOCUMENTATION_DECISION_ALIGNMENT_REPORT_V1.md` → `docs/reports/` (KEEP). Las filas de este inventario que aún los muestran en `docs/` se conservan como snapshot del estado previo a la ejecución.
>
> **Nota de reconciliación LOTE-4A (2026-11-18):** 12 documentos clasificados **ARCHIVE** con destino explícito `docs/historical/` en FASE 4 fueron **trasladados** de `docs/` a `docs/historical/` mediante `git mv` (**sin commit**). Las filas de este inventario que aún los muestran en `docs/` se conservan como snapshot del estado previo a la ejecución. `ECOSYSTEM_IDENTITY.md` quedó **excluido** de LOTE-4A; **resuelto (2026-11-19)** por `ECOSYSTEM_IDENTITY_RECONCILIATION` como `REFERENCE` (fundacional), sin movimiento.
>
> **Nota de reconciliación CAPTURE_PILOT_MERGE (2026-11-18):** el plan raíz `CAPTURE_PILOT_V1.md` (pre-merge, untracked) fue **fusionado** en el documento canónico `docs/CAPTURE_PILOT_V1.md` (absorción de su contenido de gobernanza, sin pérdida). El original se **preserva** en `docs/historical/CAPTURE_PILOT_V1_PRE_MERGE.md` (D-007). Modelo oficial de captura: **10 sesiones × 8 clips = 80 clips** (`PILOT_01..PILOT_10` / `PLACE_A/B/C`).
>
> **Nota de reconciliación INTEGRATION-5 (2026-11-18):** los **5 documentos pendientes auditados** quedan integrados conforme a la clasificación de Bernardo (D-007). **KEEP (sin movimiento, en `docs/`):** `AI_ACOUSTIC_INTEGRATION_PATH.md` y `AI_ACOUSTIC_STATE_AUDIT.md` (KEEP vigentes, pendientes de una futura consolidación del bounded context acústico; **no** se creó ninguna carpeta nueva). **HISTORICAL:** `ASUS_INTEGRATION_EXECUTION_PLAN.md` y `ASUS_TOSHIBA_INTEGRATION_FILE_ROUTING.md` → `docs/historical/`. **REPORT:** `SECURITY_SPRINT_01_REPORT.md` → `docs/reports/`. Cabecera **D-004.6** aplicada a los 5; referencias **D-005** reconciliadas en `AGENTS.md`, la matriz y este masterplan. Las filas de este inventario que aún los muestran en `docs/` se conservan como snapshot del estado previo a la ejecución. El movimiento físico permanece **sin commit** hasta orden explícita de Bernardo.
>
> **Nota de reconciliación ECOSYSTEM_IDENTITY_RECONCILIATION (2026-11-19):** se elimina la contradicción de clasificación sobre `docs/ECOSYSTEM_IDENTITY.md`. FASE 1 lo marca `REFERENCE` (inventario, línea 92); FASE 4 lo marcaba `ARCHIVE` (tabla de migración). **Clasificación final: `REFERENCE` (fundacional); el documento permanece en `docs/` (sin movimiento).** La tabla de migración de FASE 4 se corrige de `docs/historical/` · ARCHIVE a `docs/ECOSYSTEM_IDENTITY.md` · REFERENCE. Cabecera **D-004.6** añadida con la clasificación explícita y los documentos que lo operacionalizan (`SIGCTIARURAL_VISION_ALIGNMENT.md`, `SIGCTIARURAL_CANONICAL_PHILOSOPHY_EVOLUTION_v1.md`, `CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md`). Referencias **D-005** sin cambios (el documento no se mueve). Registro **D-007** en `DOCUMENTATION_ARCHITECTURE_DECISION_V1.md` (lista de documentos que jamás deben perderse), la matriz y este masterplan. **Sin commit** hasta orden explícita de Bernardo.

### Raíz `docs/` — 296 archivos `.md`

| Ruta actual | Nombre archivo | Estado |
|---|---|---|
| `docs/` | `ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` | UNKNOWN |
| `docs/` | `AGENTS.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_ARCHITECTURE_V1.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_CAPTURE_OPERATOR_GUIDE.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_DATASET_REVIEW.md` | UNKNOWN |
| `docs/` | `AI_ACOUSTIC_DATASET_V1_DESIGN.md` | UNKNOWN |
| `docs/` | `AI_ACOUSTIC_FEATURE_MAP.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_H3_DECISION_PACKAGE_FINAL.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_H3_EXECUTION_READINESS_V1.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_MODEL_BENCHMARK.md` | UNKNOWN |
| `docs/` | `AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_REFERENCE_INGESTION_PLAN_V1.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md` | CANONICAL |
| `docs/` | `AI_ACOUSTIC_ROADMAP_V1.md` | UNKNOWN |
| `docs/` | `AI_ACOUSTIC_S81_INTEGRATION.md` | CANONICAL |
| `docs/` | `AI_CANON_IMPLEMENTATION_DECISION_REPORT.md` | CANONICAL |
| `docs/` | `AI_CANONICAL_STRATEGY_DECISION_REPORT.md` | CANONICAL |
| `docs/` | `AI_MODEL_INVENTORY.md` | CANONICAL |
| `docs/` | `AI_PIPELINE.md` | UNKNOWN |
| `docs/` | `API_REFERENCE.md` | REFERENCE |
| `docs/` | `ARCHITECTURE_AUDIT_VALIDATION.md` | CANONICAL |
| `docs/` | `ARCHITECTURE_EVIDENCE_FREEZE_REPORT.md` | HISTORICAL |
| `docs/` | `ARCHITECTURE_FREEZE_CLOSURE_REVIEW.md` | HISTORICAL |
| `docs/` | `ARCHITECTURE_ACTION_MATRIX.md` | CANONICAL |
| `docs/` | `ARCHITECTURE_ACTION_REVIEW.md` | CANONICAL |
| `docs/` | `AUDIT_TRAMO_BC.md` | HISTORICAL |
| `docs/` | `BACKEND_RUNTIME_VALIDATION_REPORT.md` | HISTORICAL |
| `docs/` | `BACKLOG_REALITY_CHECK_V1.md` | CANONICAL |
| `docs/` | `CANONICAL_ARCHITECTURE_FINAL_REPORT.md` | CANONICAL |
| `docs/` | `CANONICAL_ARCHITECTURE_MASTER_REPORT.md` | CANONICAL |
| `docs/` | `CANONICAL_CONSISTENCY_AUDIT_V1.md` | CANONICAL |
| `docs/` | `CANONICAL_DIAGRAM_MANIFEST.md` | CANONICAL |
| `docs/` | `CANONICAL_DOCUMENTATION_ALIGNMENT.md` | CANONICAL |
| `docs/` | `CANONICAL_PROJECT_STATE_20261109.md` | CANONICAL |
| `docs/` | `CMSC_CONTINUATION_PROMPT.md` | UNKNOWN |
| `docs/` | `CMSC_DECISION_LOG.md` | UNKNOWN |
| `docs/` | `CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` | CANONICAL |
| `docs/` | `CMSC_PROJECT_STATUS_2026_10_05.md` | HISTORICAL |
| `docs/` | `CONTINUITY_MASTER.md` | CANONICAL |
| `docs/` | `CONTINUITY_RUNBOOK.md` | OUTDATED |
| `docs/` | `DATASET_C0_EXECUTION_PLAN_v1.md` | UNKNOWN |
| `docs/` | `DATASET_STATUS_REPORT.md` | CANONICAL |
| `docs/` | `DEPLOYMENT.md` | OBSOLETE |
| `docs/` | `DEPLOYMENT_AWS.md` | HISTORICAL |
| `docs/` | `DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT.md` | OBSOLETE |
| `docs/` | `DOCKER_OFFICIAL_EXECUTION_PLAN.md` | OBSOLETE |
| `docs/` | `DOCKER_READY_CLOSURE_REPORT.md` | CANONICAL |
| `docs/` | `DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` | OBSOLETE |
| `docs/` | `DOCKER_READY_FINAL_DECISION_REPORT.md` | CANONICAL |
| `docs/` | `DOCKER_READY_R1_R4_EXECUTION_PLAN.md` | OBSOLETE |
| `docs/` | `DOCKER_READY_R1_R4_REPORT.md` | OBSOLETE |
| `docs/` | `DOCKER_READY_REMEDIATION_PLAN.md` | OBSOLETE |
| `docs/` | `DOCKER_RUNTIME_AND_DATABASE_VALIDATION_REPORT.md` | HISTORICAL |
| `docs/` | `DOCUMENTATION_FREEZE_COMPLETION_PLAN.md` | HISTORICAL |
| `docs/` | `DOCUMENTATION_FREEZE_EXECUTION_REPORT.md` | HISTORICAL |
| `docs/` | `DOCUMENTATION_GOVERNANCE_REVIEW.md` | CANONICAL |
| `docs/` | `DOCUMENTATION_CONSOLIDATION_PLAN.md` | CANONICAL |
| `docs/` | `ECOSYSTEM_IDENTITY.md` | REFERENCE |
| `docs/` | `EDGE_SETUP.md` | REFERENCE |
| `docs/` | `EVIDENCIA_FLUJO_BRIDGE.md` | HISTORICAL |
| `docs/` | `FIELD_CAPTURE_RUN_001_REPORT.md` | HISTORICAL |
| `docs/` | `FIELD_DATA_COLLECTION_PROTOCOL.md` | UNKNOWN |
| `docs/` | `FIELD_PILOT_EXECUTION_PLAN.md` | UNKNOWN |
| `docs/` | `FRONTEND_OFFICIALIZATION_PHASE_2_EXECUTION_PLAN.md` | HISTORICAL |
| `docs/` | `FRONTEND_OFFICIALIZATION_PHASE_2_REPORT.md` | HISTORICAL |
| `docs/` | `G1_SCHEMA_CONSISTENCY_REPORT.md` | UNKNOWN |
| `docs/` | `GO_NO_GO_EXECUTIVE_REVIEW.md` | HISTORICAL |
| `docs/` | `GOVERNANCE_RULES.md` | CANONICAL |
| `docs/` | `H5_AI_GOVERNANCE_CLOSURE_REPORT.md` | HISTORICAL |
| `docs/` | `HEXAGONAL_REFACTOR_PLAN.md` | CANONICAL |
| `docs/` | `historical\INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` | HISTORICAL |
| `docs/` | `historical\README_REALITY_CHECK.md` | HISTORICAL |
| `docs/` | `historical\TRAE_AI_INTEGRATION_AUDIT.md` | HISTORICAL |
| `docs/` | `historical\TRAE_INDEPENDENT_REPOSITORY_AUDIT.md` | HISTORICAL |
| `docs/` | `IA_PREDICTIVA_EXECUTION_READINESS_REPORT.md` | UNKNOWN |
| `docs/` | `IA_PREDICTIVA_F0_F3_REPORT.md` | UNKNOWN |
| `docs/` | `IA_PREDICTIVA_F4_REPORT.md` | UNKNOWN |
| `docs/` | `IA_PREDICTIVA_REALITY_REPORT.md` | UNKNOWN |
| `docs/` | `IA_PREDICTIVA_RECOVERY_EXECUTION_PLAN.md` | UNKNOWN |
| `docs/` | `IA_PREDICTIVA_RECOVERY_PLAN.md` | UNKNOWN |
| `docs/` | `INDICE_PROYECTO.md` | OBSOLETE |
| `docs/` | `INFORME_BRIDGE_E2E_UI.md` | HISTORICAL |
| `docs/` | `INFORME_TRAMO_C_FINAL.md` | HISTORICAL |
| `docs/` | `INITIAL_CAPTURE_EVIDENCE.md` | HISTORICAL |
| `docs/` | `INITIAL_METADATA_AUDIT.md` | HISTORICAL |
| `docs/` | `KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md` | CANONICAL |
| `docs/` | `KNOWLEDGE_HUB_MIGRATION_PLAN.md` | CANONICAL |
| `docs/` | `L1_L6_EXECUTION_PLAN.md` | OBSOLETE |
| `docs/` | `L1_L6_EXECUTION_REPORT.md` | CANONICAL |
| `docs/` | `L1_L6_RUNTIME_DISCLOSURE_PLAN.md` | OBSOLETE |
| `docs/` | `L1_L6_RUNTIME_VERIFICATION_REPORT.md` | CANONICAL |
| `docs/` | `M1_M2_ARTIFACT_RECOVERY_REPORT.md` | HISTORICAL |
| `docs/` | `M1_M2_GOVERNANCE_CLOSURE_REPORT.md` | HISTORICAL |
| `docs/` | `M1_RECOVERY_AUDIT_REPORT.md` | HISTORICAL |
| `docs/` | `M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md` | HISTORICAL |
| `docs/` | `MASTERDOC.md` | CANONICAL |
| `docs/` | `PILOT_ACCEPTANCE_CRITERIA.md` | UNKNOWN |
| `docs/` | `PILOT_CAPTURE_CHECKLIST.md` | UNKNOWN |
| `docs/` | `PILOT_REVIEW_CHECKLIST.md` | UNKNOWN |
| `docs/` | `PLAN_MAESTRO.md` | REFERENCE |
| `docs/` | `PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md` | HISTORICAL |
| `docs/` | `PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md` | HISTORICAL |
| `docs/` | `PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` | HISTORICAL |
| `docs/` | `PRE_COMMIT_CLASSIFICATION.md` | HISTORICAL |
| `docs/` | `PRE_COMMIT_FORENSIC_REVIEW.md` | HISTORICAL |
| `docs/` | `PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` | OBSOLETE |
| `docs/` | `project_knowledge_base\governance\BACKUP_CONTENT_INDEX.md` | CANONICAL |
| `docs/` | `project_knowledge_base\governance\BACKUP_VERIFICATION_REPORT.md` | CANONICAL |
| `docs/` | `project_knowledge_base\governance\DOCUMENT_RETENTION_POLICY.md` | CANONICAL |
| `docs/` | `project_knowledge_base\governance\MASTER_PROJECT_INVENTORY_AUDIT.md` | CANONICAL |
| `docs/` | `project_knowledge_base\governance\PROJECT_ARCHIVE_MANIFEST.md` | CANONICAL |
| `docs/` | `project_knowledge_base\governance\PROJECT_BACKUP_MANIFEST.md` | CANONICAL |
| `docs/` | `project_knowledge_base\governance\PROJECT_RECORDS_REGISTER.md` | CANONICAL |
| `docs/` | `project_knowledge_base\governance\PROJECT_STRUCTURE_SNAPSHOT.md` | CANONICAL |
| `docs/` | `project_knowledge_base\KB-001-TRAE-INDEPENDENT-REPOSITORY-AUDIT.md` | CANONICAL |
| `docs/` | `project_knowledge_base\KB-002-README-REALITY-CHECK.md` | CANONICAL |
| `docs/` | `project_knowledge_base\KB-003-AI-INTEGRATION-AUDIT.md` | CANONICAL |
| `docs/` | `project_knowledge_base\KB-004-AI-SEMANTIC-CONTRACT-AUDIT.md` | CANONICAL |
| `docs/` | `project_knowledge_base\KB-005-EIARC-AI-CANONICAL-MODEL.md` | CANONICAL |
| `docs/` | `project_knowledge_base\KB-006-PENDING-CHANGES-AUDIT.md` | CANONICAL |
| `docs/` | `R1_DEPENDENCY_INVERSION_AUDIT.md` | UNKNOWN |
| `docs/` | `R5_AI_SERVING_STRATEGY_REPORT.md` | UNKNOWN |
| `docs/` | `R6_R7_EXECUTION_PLAN.md` | UNKNOWN |
| `docs/` | `REAL_ARCHITECTURE_REPORT.md` | UNKNOWN |
| `docs/` | `REALITY_RECONSTRUCTION_AUDIT_V1.md` | CANONICAL |
| `docs/` | `RECOMMENDATIONS_CONSOLIDATION.md` | UNKNOWN |
| `docs/` | `reports\AI_SERVICE_EXECUTION_READINESS.md` | HISTORICAL |
| `docs/` | `reports\continuity_status.md` | HISTORICAL |
| `docs/` | `sena_artifacts\API_DELIVERY_PACKAGE.md` | HISTORICAL |
| `docs/` | `sena_artifacts\DEPLOYMENT_FINAL.md` | HISTORICAL |
| `docs/` | `sena_artifacts\EVIDENCIAS_ADSO_MASTER.md` | HISTORICAL |
| `docs/` | `sena_artifacts\PRESENTACION_SUSTENTACION.md` | HISTORICAL |
| `docs/` | `sena_artifacts\PROYECTO_FORMATIVO_FINAL.md` | HISTORICAL |
| `docs/` | `sena_artifacts\README_DELIVERABLES_INDEX.md` | HISTORICAL |
| `docs/` | `sena_artifacts\SENA_GRADUATION_READINESS_AUDIT.md` | HISTORICAL |
| `docs/` | `session_plans\_archive\SESSION_PLAN_2025-12-08_DJANGO_MINIMO.md` | HISTORICAL |
| `docs/` | `SIGCT_MEMORY_F01_EMBEDDING_STRATEGY.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_F02_QDRANT_ARCHITECTURE.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_F03_QUERY_ARCHITECTURE.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_F04_DOMAIN_MODEL.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_F05_API_ARCHITECTURE.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_F06_5_STAGING_MODEL.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_F06_IMPLEMENTATION_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_IMPLEMENTATION_01.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_IMPLEMENTATION_READINESS_REPORT.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_M0_DECISION_ACTA.md` | UNKNOWN |
| `docs/` | `SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARUAL_DESIGN_PARITY_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARUAL_HARDWARE_DETAIL_LAYER.md` | UNKNOWN |
| `docs/` | `SIGCTIARUAL_U2_3_DEVICE_MAP.md` | UNKNOWN |
| `docs/` | `SIGCTIARUAL_U2_ROADMAP_DECISION.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_AI_ONBOARDING_GUIDE.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_AI_RECOVERY_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_BBB_TELEMETRY_READINESS.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_BBB03_DEPLOYMENT_GUIDE.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_BBB03_EXECUTION_PLAYBOOK.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_BENCHMARK_V1_EXECUTION_PLAYBOOK.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_BENCHMARK_V1_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_CANONICAL_ENGINEERING_REVIEW.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_CAPABILITIES_UX_REVIEW.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_COMPONENT_MAP.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_DASHBOARD_PARITY_REVIEW.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_DATASET_GOVERNANCE_IMPACT_REVIEW.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DATASET_V2_BASELINE_FREEZE.md` | CANONICAL |
| `docs/` | `SIGCTIARURAL_DATASET_V2_BUILD_PLAYBOOK.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DATASET_V2_EXECUTION_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DATASET_V2_INVENTORY.md` | CANONICAL |
| `docs/` | `SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` | CANONICAL |
| `docs/` | `SIGCTIARURAL_DATASET_V2_MATERIALIZATION_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_ROADMAP.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DATASET_V2_PLUS_MVP.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DATASET_V2_READINESS_REPORT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DATASET_V2_RECOVERY_CONSOLIDATION.md` | CANONICAL |
| `docs/` | `SIGCTIARURAL_DEPENDENCY_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DEPENDENCY_DOWNGRADE_PREP.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_DEVICE_MAP_LINK_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_ECOSYSTEM_ALIGNMENT_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_ECOSYSTEM_CONSOLIDATION_AUDIT_v1.md` | CANONICAL |
| `docs/` | `SIGCTIARURAL_ECOSYSTEM_DATA_GOVERNANCE_ALIGNMENT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_ECOSYSTEM_MATURITY_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_ESTADO_SESION_2026-09-14.md` | HISTORICAL |
| `docs/` | `SIGCTIARURAL_EVOLUTION_MATRIX.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_F1_COMMIT_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_F1_PRECOMMIT_REVIEW.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_FRONTEND_ARCHITECTURE_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_FRONTEND_LOCAL_STRATEGY.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_FRONTEND_OFFICIALIZATION_EXECUTION_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_FRONTEND_OFFICIALIZATION_PHASE1_REPORT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_FRONTEND_PHASE2_READINESS_REPORT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_HARDWARE_CATALOG_REVIEW.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_HARDWARE_REGISTRY_ARCHITECTURE.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_HEALTH_REPORT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_IMPLEMENTATION_READINESS.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_LAB_PRESERVATION_STRATEGY.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_LEARNING_LAYER_ARCHITECTURE.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_MIGRATION_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_MULTIDATASET_FEASIBILITY_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_NAVIGATION_EVOLUTION.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_PAGE_MAPPING.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_PHASE0_EXECUTION_CHECKLIST.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_PHASE0_EXECUTION_GUIDE.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_PHASE0_READYCHECK.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_PLANTVILLAGE_RECOVERY_PLAN.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_PRESERVATION_AUDIT.md` | HISTORICAL |
| `docs/` | `SIGCTIARURAL_PRESERVATION_STRATEGY.md` | HISTORICAL |
| `docs/` | `SIGCTIARURAL_RC1_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_RC2_CONSOLIDATION.md` | CANONICAL |
| `docs/` | `SIGCTIARURAL_RC2_FREEZE.md` | CANONICAL |
| `docs/` | `SIGCTIARURAL_RC2_READINESS.md` | CANONICAL |
| `docs/` | `SIGCTIARURAL_REFACTORING_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_REFACTORING_GUARDRAILS.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_RESEARCH_EXPERIMENTATION_LAYER.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_RESEARCH_PRODUCTION_LAYER.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_RESEARCH_PRODUCTION_VISION.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_ROUTE_EVOLUTION.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_STATE_SYNC_REPORT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_STRATEGIC_ACCELERATION.md` | REFERENCE |
| `docs/` | `SIGCTIARURAL_U1_0_BASELINE.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_U1_BOOTSTRAP.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_U1_GO_NO_GO.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_U1_REVIEW.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_U2_1_EXECUTIVE_LAYER.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_U3_5_UX_REVIEW.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_U4_2_CONTENT_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_UX_03_NAVIGATION_AUDIT.md` | UNKNOWN |
| `docs/` | `SIGCTIARURAL_VISION_ALIGNMENT.md` | REFERENCE |
| `docs/` | `UBTN_ADR_INDEX.md` | REFERENCE |
| `docs/` | `UBTN_AGGREGATE_DESIGN.md` | REFERENCE |
| `docs/` | `UBTN_ARCHITECTURE.md` | REFERENCE |
| `docs/` | `UBTN_AUDIT_REVIEW.md` | REFERENCE |
| `docs/` | `UBTN_BBB_EDGE_GATEWAY.md` | REFERENCE |
| `docs/` | `UBTN_CONTEXT_MAP.md` | REFERENCE |
| `docs/` | `UBTN_DATA_CONTRACTS.md` | REFERENCE |
| `docs/` | `UBTN_DATABASE_EVOLUTION.md` | REFERENCE |
| `docs/` | `UBTN_DOMAIN_MODEL.md` | REFERENCE |
| `docs/` | `UBTN_EDGE_AI_STRATEGY.md` | REFERENCE |
| `docs/` | `UBTN_EVENT_STORMING.md` | REFERENCE |
| `docs/` | `UBTN_FIELD_DEPLOYMENT_GUIDE.md` | REFERENCE |
| `docs/` | `UBTN_FRONTEND_UX_STRATEGY.md` | REFERENCE |
| `docs/` | `UBTN_HARDWARE_ROADMAP.md` | REFERENCE |
| `docs/` | `UBTN_INDEX.md` | REFERENCE |
| `docs/` | `UBTN_LAB_INTEGRATION.md` | REFERENCE |
| `docs/` | `UBTN_MQTT_ARCHITECTURE.md` | REFERENCE |
| `docs/` | `UBTN_OPERATIONS_RUNBOOK.md` | REFERENCE |
| `docs/` | `UBTN_RESEARCH_BACKLOG.md` | REFERENCE |
| `docs/` | `UBTN_RESEARCH_GAPS.md` | REFERENCE |
| `docs/` | `UBTN_RISK_ANALYSIS.md` | REFERENCE |
| `docs/` | `UBTN_ROADMAP.md` | REFERENCE |
| `docs/` | `UBTN_SECURITY_MODEL.md` | REFERENCE |
| `docs/` | `UBTN_SENSOR_CATALOG.md` | REFERENCE |
| `docs/` | `UBTN_TELEMETRY_EVOLUTION_STRATEGY.md` | REFERENCE |
| `docs/` | `UBTN_USE_CASES.md` | REFERENCE |
| `docs/` | `VISUAL_VALIDATION_FINAL_REPORT.md` | OBSOLETE |

**Subdirectorios de `docs/`:**
- `docs/ai/` — 54 archivos (artifacts, research_v2, debug-ai-model-loader.md, AI_PIPELINE.md)
- `docs/architecture/` — 3 archivos (README.md, robotics_contracts.md, simulation_stack.md)
- `docs/architect_master/` — 8 archivos (01_REPOSITORY_AUDIT.md a 08_DEVELOPMENT_ROADMAP_2026_2027.md)
- `docs/database/` — 1 archivo (README.md)
- `docs/eiarc/` — 16 archivos (01_FOUNDATION/, 02_ARCHITECTURE/)
- `docs/historical/` — 4 archivos
- `docs/project_knowledge_base/` — 14 archivos (governance/, KB-001 a KB-006)
- `docs/reports/` — 2 archivos
- `docs/sena_artifacts/` — 7 archivos
- `docs/session_plans/` — 1 archivo (_archive/)

---

### Raíz `Documentacion/` — 45 archivos `.md`

#### `Documentacion/Arquitectura/` — 37 archivos

| Ruta actual | Nombre archivo | Estado |
|---|---|---|
| `Documentacion/Arquitectura/` | `ACTA_APROBACION_F3A.md` | HISTORICAL |
| `Documentacion/Arquitectura/` | `ACTA_APROBACION_F3B.md` | HISTORICAL |
| `Documentacion/Arquitectura/` | `BENCHMARK_GATE_DECISION_TEMPLATE.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_AI_ACOUSTIC_RULES_V0_DESIGN.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_CANONICAL_STATE_v1.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `CMSC_CANONICAL_STATES_APPENDIX_V1.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `CMSC_DASHBOARD_IMPLEMENTATION_STRATEGY_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_DOCUMENTATION_RELEASE_NOTE_v1.md` | HISTORICAL |
| `Documentacion/Arquitectura/` | `CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `CMSC_F3A_INTERCONNECTION_BLUEPRINT_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_F3B_SIGNAL_PRODUCERS_ECOSYSTEM_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_F3C_DASHBOARD_CONSTRUCTION_STRATEGY_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_F3C_V1_IMPLEMENTATION_BLUEPRINT.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_F3D_SIGNAL_NAVIGATION_STRATEGY_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_F4_ACP_ARCHITECTURE_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `CMSC_IMPLEMENTATION_SNAPSHOT_PROCEDURE.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `CMSC_MASTERPLAN_v1.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `CMSC_ORCHESTRATION_V2_DESIGN.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `CMSC_SESSION_CLOSEOUT_2026_10_02.md` | HISTORICAL |
| `Documentacion/Arquitectura/` | `CMSC_SIGNAL_MAP_v1.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `CMSC_UI_ARCHITECTURE_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `FRONTEND_EXECUTION_STRATEGY.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `MMC_WORKBENCH_V1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `SIGCTIARURAL_CANONICAL_PHILOSOPHY_EVOLUTION_v1.md` | UNKNOWN |
| `Documentacion/Arquitectura/` | `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | CANONICAL |
| `Documentacion/Arquitectura/` | `SIGNAL_REGISTRY_V1_OPERATIONAL_PROCEDURE.md` | CANONICAL |

#### `Documentacion/IA/` — 8 archivos

| Ruta actual | Nombre archivo | Estado |
|---|---|---|
| `Documentacion/IA/` | `AUDITORIA_BENCHMARK_SRC_FALLBACK.md` | HISTORICAL |
| `Documentacion/IA/Benchmark_M1_MobileNetV2/` | `CORRECCIONES_PARA_M2.md` | HISTORICAL |
| `Documentacion/IA/Benchmark_M1_MobileNetV2/` | `EVIDENCIA_EJECUCION_M1.md` | HISTORICAL |
| `Documentacion/IA/Benchmark_M1_MobileNetV2/` | `INFORME_TECNICO_CIENTIFICO_M1_APA7.md` | HISTORICAL |
| `Documentacion/IA/Benchmark_M1_MobileNetV2/` | `MASTERDOC_EXPERIMENTO_M1.md` | HISTORICAL |
| `Documentacion/IA/Benchmark_M1_MobileNetV2/` | `README.md` | HISTORICAL |
| `Documentacion/IA/Benchmark_M1_MobileNetV2/` | `TABLA_COMPARATIVA_M1_M5.md` | HISTORICAL |
| `Documentacion/IA/` | `ESTADO_ACTUAL_BENCHMARKS.md` | CANONICAL |

---

## FASE 2 – DETECCIÓN DE DUPLICADOS

### Tabla de duplicados y relaciones

| Documento A | Documento B | Relación | Justificación |
|---|---|---|---|
| `docs/CANONICAL_PROJECT_STATE_20261109.md` | `Documentacion/Arquitectura/CMSC_CANONICAL_STATE_v1.md` | SOLAPAMIENTO_TEMATICO | Ambos documentan estado canónico del proyecto; uno es la versión oficial vigente (2026-11-09), el otro es diseño previo sin estado operativo. |
| `docs/DOCUMENTATION_GOVERNANCE_REVIEW.md` | `Documentacion/Arquitectura/CMSC_DOCUMENTATION_RELEASE_NOTE_v1.md` | SOLAPAMIENTO_TEMATICO | Ambos tratan gobernanza documental y liberación de documentos; uno es la revisión vigente, el otro es nota de liberación histórica. |
| `docs/CONTINUITY_MASTER.md` | `docs/CONTINUITY_RUNBOOK.md` | COMPLEMENTARIO | No son duplicados; uno es la maestría, el otro el runbook operativo. `COMPLEMENTARIO` describe la **relación**, no la clasificación: la clasificación vigente del runbook es `OUTDATED` (no `OBSOLETE`), según `docs/historical/OBSOLETE_VALIDATION.md`. |
| `docs/MASTERDOC.md` | `Documentacion/Arquitectura/CMSC_MASTERPLAN_v1.md` | SOLAPAMIENTO_TEMATICO | Ambos cubren plan maestro; `MASTERDOC.md` es el documento canónico vigente, `CMSC_MASTERPLAN_v1.md` es diseño de workbench. |
| `docs/ESTADO_ACTUAL_BENCHMARKS.md` | `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` | DUPLICADO_EXACTO | Mismo nombre y contenido equivalente en ambas raíces. |
| `docs/REALITY_RECONSTRUCTION_AUDIT_V1.md` | `Documentacion/Arquitectura/SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | SOLAPAMIENTO_TEMATICO | Ambos tratan auditoría forense del ecosistema; uno es reconstrucción de realidad, el otro es arqueología forense. |
| `docs/architecture/ARCHITECTURE_AUDIT_VALIDATION.md` | `docs/architecture/ARCHITECTURE_AUDIT.md` | SUPERSEDES | El primero es validación técnica con evidencia hash; el segundo es informe de auditoría punto-en-tiempo (ARCHIVE). |
| `docs/architecture/ARCHITECTURE_ACTION_MATRIX.md` | `docs/architecture/ARCHITECTURE_ACTION_REVIEW.md` | COMPLEMENTARIO | Matriz de acciones vs registro de decisiones de ingeniería; no son duplicados. |

**Documentos snapshots / planes ya ejecutados (candidatos a HISTORICAL):**
- `docs/DOCKER_READY_R1_R4_EXECUTION_PLAN.md` — plan ejecutado
- `docs/DOCKER_READY_R1_R4_REPORT.md` — reporte ejecutado
- `docs/L1_L6_EXECUTION_PLAN.md` — plan ejecutado (OBSOLETE)
- `docs/L1_L6_RUNTIME_DISCLOSURE_PLAN.md` — plan ejecutado (OBSOLETE)
- `docs/VISUAL_VALIDATION_FINAL_REPORT.md` — reporte final ejecutado (OBSOLETE)
- `docs/FIELD_CAPTURE_RUN_001_REPORT.md` — reporte de captura ejecutado (HISTORICAL)
- `docs/INITIAL_CAPTURE_EVIDENCE.md` — evidencia inicial ejecutada (HISTORICAL)

**Runbooks repetidos:**
- `docs/CONTINUITY_MASTER.md` y `docs/CONTINUITY_RUNBOOK.md` - complementarios, no repetidos; clasificación vigente del runbook: `OUTDATED` (procedimiento vigente, estado verificado stale), no `OBSOLETE`.

---

## FASE 3 – ARQUITECTURA DOCUMENTAL OBJETIVO

### Estructura final propuesta (única estructura canónica)

```
docs/
├── state/                              ← Estado canónico del proyecto (CANONICAL_PROJECT_STATE, MASTERDOC)
├── governance/                         ← Gobernanza documental (DOCUMENTATION_GOVERNANCE_REVIEW, GOVERNANCE_RULES)
├── architecture/                       ← Arquitectura de software (Hexagonal, refactor, EIARC)
│   ├── hexagonal/
│   ├── eiarc/
│   └── labs/
├── bounded-contexts/                   ← Bounded Contexts del ecosistema SIGCT-Rural
│   ├── acoustic-dataset/               ← Dataset acústico SIGCT-Rural (gobernanza, estrategia, referencia, features)
│   ├── ai-runtime/                     ← Runtime IA (benchmark M1/M2, modelos, pipeline, ONNX)
│   ├── telemetry/                      ← Telemetría (UBTN, sensor reading, robot telemetry)
│   ├── identity/                       ← Identidad del ecosistema (ECOSYSTEM_IDENTITY, VISION_ALIGNMENT)
├── cmsc/                               ← Centro de Modelado, Simulación y Ciencias Computacionales (CMSC_*) [canónico LOTE-1]
├── memory/                             ← SIGCT Memory (embedding, Qdrant, query, dominio, API) [canónico LOTE-1]
├── research/                           ← Cadena científica de investigación (vision, production layer, experimentation layer) [canónico LOTE-1]
├── deployment/                         ← Despliegue e infraestructura (Docker, R1-R5, healthchecks)
├── runbooks/                           ← Continuidad operativa (CONTINUITY_MASTER, CONTINUITY_RUNBOOK)
├── datasets/                           ← Datasets (PlantVillage, dataset acústico, splits, holdout)
├── ai/                                 ← IA general (investigación, MLOps, training, context V2)
├── decisions/                          ├── Decisiones de ingeniería (ARCHITECTURE_ACTION_REVIEW, benchmark decisions)
├── reports/                            ← Informes de ejecución, validación, realidad, forense
├── historical/                         ← Evidencia de sprints cerrados (historical/, sena_artifacts/, session_plans/)
├── capture/                            ← Captura de datos (FIELD_CAPTURE, PILOT, initial capture)
├── knowledge-base/                     ← Knowledge Hub (implementation spec, migration plan, records)
├── project-knowledge-base/             ← KB-001 a KB-006, project inventory, backup manifests
└── UBTN/                               ← UBTN (ADR, architecture, edge, MQTT, hardware, use cases)
```

> **Nota de reconciliación LOTE-1 (2026-11-18):** las carpetas `docs/memory/`, `docs/research/` y `docs/cmsc/` son **estructura canónica aprobada** (commit `82d26cf`). No son subcarpetas de `bounded-contexts/`. El destino `docs/bounded-contexts/cmsc/` queda **eliminado** de este plan porque nunca se materializó.

### Bounded Contexts reales según SIGCTIARURAL

| Bounded Context | Contenido principal | Ejemplo de documentos |
|---|---|---|
| `cmsc` (primer nivel `docs/cmsc/`) | Centro de Modelado, Simulación y Ciencias Computacionales | CMSC_*, MMC_WORKBENCH, F3A-F4 |
| `acoustic-dataset` | Dataset acústico SIGCT-Rural v1 | AI_ACOUSTIC_*, schema, labels, manifests |
| `ai-runtime` | Runtime de IA y benchmark | M1/M2, EfficientNet, MobileNet, ONNX, metrics |
| `telemetry` | Telemetría y señales | SensorReading, RobotTelemetry, UBTN, signal map |
| `identity` | Identidad del ecosistema | VISION_ALIGNMENT, ECOSYSTEM_IDENTITY, PHILOSOPHY_EVOLUTION |
| `governance` | Gobernanza documental y de proyecto | DOCUMENTATION_GOVERNANCE_REVIEW, GOVERNANCE_RULES |
| `capture` | Captura de datos de campo | FIELD_CAPTURE, PILOT, initial capture |
| `laboratory` | Laboratorios (Math, Electronics, Telecom, etc.) | MathV2, ElectronicsLab, TelecomLab, Signal Registry |

---

## FASE 4 – MAPA DE MIGRACIÓN

### Tabla completa de migración (planificación, sin ejecutar)

| Archivo actual | Ubicación destino | Acción |
|---|---|---|
| `docs/CANONICAL_PROJECT_STATE_20261109.md` | `docs/state/CANONICAL_PROJECT_STATE_20261109.md` | KEEP |
| `docs/MASTERDOC.md` | `docs/state/MASTERDOC.md` | KEEP |
| `docs/CONTINUITY_MASTER.md` | `docs/runbooks/CONTINUITY_MASTER.md` | KEEP |
| `docs/CONTINUITY_RUNBOOK.md` | `docs/CONTINUITY_RUNBOOK.md` | KEEP |
| `docs/DOCUMENTATION_GOVERNANCE_REVIEW.md` | `docs/governance/DOCUMENTATION_GOVERNANCE_REVIEW.md` | KEEP |
| `docs/GOVERNANCE_RULES.md` | `docs/governance/GOVERNANCE_RULES.md` | KEEP |
| `docs/HEXAGONAL_REFACTOR_PLAN.md` | `docs/architecture/hexagonal/HEXAGONAL_REFACTOR_PLAN.md` | KEEP |
| `ARCHITECTURE_ACTION_MATRIX.md` | `docs/architecture/ARCHITECTURE_ACTION_MATRIX.md` | KEEP |
| `ARCHITECTURE_ACTION_REVIEW.md` | `docs/architecture/ARCHITECTURE_ACTION_REVIEW.md` | KEEP |
| `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | KEEP |
| `docs/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` | KEEP |
| `docs/AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md` | KEEP |
| `docs/AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md` | KEEP |
| `docs/AI_ACOUSTIC_REFERENCE_INGESTION_PLAN_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_REFERENCE_INGESTION_PLAN_V1.md` | KEEP |
| `docs/AI_ACOUSTIC_H3_EXECUTION_READINESS_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_H3_EXECUTION_READINESS_V1.md` | KEEP |
| `docs/AI_ACOUSTIC_H3_DECISION_PACKAGE_FINAL.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_H3_DECISION_PACKAGE_FINAL.md` | KEEP |
| `docs/AI_ACOUSTIC_FEATURE_MAP.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_FEATURE_MAP.md` | KEEP |
| `docs/AI_ACOUSTIC_S81_INTEGRATION.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_S81_INTEGRATION.md` | KEEP |
| `docs/AI_MODEL_INVENTORY.md` | `docs/bounded-contexts/ai-runtime/AI_MODEL_INVENTORY.md` | KEEP |
| `docs/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md` | `docs/bounded-contexts/ai-runtime/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md` | KEEP |
| `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` | `docs/bounded-contexts/ai-runtime/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` | KEEP |
| `docs/DOCKER_READY_FINAL_DECISION_REPORT.md` | `docs/deployment/DOCKER_READY_FINAL_DECISION_REPORT.md` | KEEP |
| `docs/KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md` | `docs/knowledge-base/KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md` | KEEP |
| `docs/KNOWLEDGE_HUB_MIGRATION_PLAN.md` | `docs/knowledge-base/KNOWLEDGE_HUB_MIGRATION_PLAN.md` | KEEP |
| `docs/REALITY_RECONSTRUCTION_AUDIT_V1.md` | `docs/reports/REALITY_RECONSTRUCTION_AUDIT_V1.md` | KEEP |
| `docs/BACKLOG_REALITY_CHECK_V1.md` | `docs/reports/BACKLOG_REALITY_CHECK_V1.md` | KEEP |
| `docs/CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` | `docs/cmsc/CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` | KEEP |
| `docs/L1_L6_EXECUTION_REPORT.md` | `docs/reports/L1_L6_EXECUTION_REPORT.md` | KEEP |
| `docs/L1_L6_RUNTIME_VERIFICATION_REPORT.md` | `docs/reports/L1_L6_RUNTIME_VERIFICATION_REPORT.md` | KEEP |
| `docs/CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` | `docs/cmsc/CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/CMSC_CANONICAL_STATE_v1.md` | `docs/state/CMSC_CANONICAL_STATE_v1.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/CMSC_CANONICAL_STATES_APPENDIX_V1.md` | `docs/state/CMSC_CANONICAL_STATES_APPENDIX_V1.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/CMSC_MASTERPLAN_v1.md` | `docs/cmsc/CMSC_MASTERPLAN_v1.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/CMSC_ORCHESTRATION_V2_DESIGN.md` | `docs/cmsc/CMSC_ORCHESTRATION_V2_DESIGN.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/CMSC_SIGNAL_MAP_v1.md` | `docs/cmsc/CMSC_SIGNAL_MAP_v1.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md` | `docs/cmsc/CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/CMSC_IMPLEMENTATION_SNAPSHOT_PROCEDURE.md` | `docs/cmsc/CMSC_IMPLEMENTATION_SNAPSHOT_PROCEDURE.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/SIGNAL_REGISTRY_V1_OPERATIONAL_PROCEDURE.md` | `docs/cmsc/SIGNAL_REGISTRY_V1_OPERATIONAL_PROCEDURE.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | `docs/historical/SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/FRONTEND_EXECUTION_STRATEGY.md` | `docs/deployment/FRONTEND_EXECUTION_STRATEGY.md` | MOVE (desde `Documentacion/Arquitectura/`) |
| `docs/ESTADO_ACTUAL_BENCHMARKS.md` | `docs/bounded-contexts/ai-runtime/ESTADO_ACTUAL_BENCHMARKS.md` | MOVE (desde `Documentacion/IA/`) |
| `Documentacion/IA/Benchmark_M1_MobileNetV2/*` | `docs/bounded-contexts/ai-runtime/benchmark-m1-m2/*` | MOVE (desde `Documentacion/IA/`) |
| `Documentacion/IA/AUDITORIA_BENCHMARK_SRC_FALLBACK.md` | `docs/bounded-contexts/ai-runtime/AUDITORIA_BENCHMARK_SRC_FALLBACK.md` | MOVE (desde `Documentacion/IA/`) |
| `docs/DEPLOYMENT.md` | `docs/historical/DEPLOYMENT.md` | ARCHIVE |
| `docs/INDICE_PROYECTO.md` | `docs/historical/INDICE_PROYECTO.md` | ARCHIVE |
| `docs/ECOSYSTEM_IDENTITY.md` | `docs/ECOSYSTEM_IDENTITY.md` | REFERENCE |
| `docs/DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` | `docs/historical/DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` | ARCHIVE |
| `docs/DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT.md` | `docs/historical/DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT.md` | ARCHIVE |
| `docs/DOCKER_OFFICIAL_EXECUTION_PLAN.md` | `docs/historical/DOCKER_OFFICIAL_EXECUTION_PLAN.md` | ARCHIVE |
| `docs/DOCKER_READY_CLOSURE_REPORT.md` | `docs/deployment/DOCKER_READY_CLOSURE_REPORT.md` | KEEP |
| `docs/DOCKER_READY_R1_R4_EXECUTION_PLAN.md` | `docs/historical/DOCKER_READY_R1_R4_EXECUTION_PLAN.md` | ARCHIVE |
| `docs/DOCKER_READY_R1_R4_REPORT.md` | `docs/historical/DOCKER_READY_R1_R4_REPORT.md` | ARCHIVE |
| `docs/DOCKER_READY_REMEDIATION_PLAN.md` | `docs/historical/DOCKER_READY_REMEDIATION_PLAN.md` | ARCHIVE |
| `docs/L1_L6_EXECUTION_PLAN.md` | `docs/historical/L1_L6_EXECUTION_PLAN.md` | ARCHIVE |
| `docs/L1_L6_RUNTIME_DISCLOSURE_PLAN.md` | `docs/historical/L1_L6_RUNTIME_DISCLOSURE_PLAN.md` | ARCHIVE |
| `docs/PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` | `docs/historical/PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` | ARCHIVE |
| `docs/VISUAL_VALIDATION_FINAL_REPORT.md` | `docs/historical/VISUAL_VALIDATION_FINAL_REPORT.md` | ARCHIVE |
| `docs/DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | `docs/historical/DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | ARCHIVE |
| `docs/DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | `docs/historical/DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | ARCHIVE |
| `ARCHITECTURE_AUDIT.md` | `docs/architecture/ARCHITECTURE_AUDIT.md` | ARCHIVE |
| `docs/TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | `docs/historical/TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | ARCHIVE |
| `docs/TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | `docs/historical/TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | ARCHIVE |
| `docs/TOSHIBA_EXPORT_MANIFEST.md` | `docs/historical/TOSHIBA_EXPORT_MANIFEST.md` | ARCHIVE |
| `docs/TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | `docs/historical/TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | ARCHIVE |
| `docs/historical/*` | `docs/historical/*` | KEEP |
| `docs/sena_artifacts/*` | `docs/historical/sena_artifacts/*` | MOVE (dentro de docs/) |
| `docs/session_plans/*` | `docs/historical/session_plans/*` | MOVE (dentro de docs/) |
| `Documentacion/Arquitectura/*` (todos los 37) | `docs/cmsc/` o `docs/deployment/` o `docs/historical/` | MOVE (planificado) |
| `Documentacion/IA/*` (todos los 8) | `docs/bounded-contexts/ai-runtime/` | MOVE (planificado) |
| `Documentacion/` (directorio raíz vacío) | — | DELETE_CANDIDATE |

### LOTE-3 ejecutado (2026-11-18) — familia IA/benchmark → `docs/ai/`

El traslado de los **17 documentos** de gobernanza IA y benchmark a `docs/ai/` quedó **ejecutado** mediante `git mv` (**sin commit**):

- `AI_R1_*` (3) · `AI_R2_*` (2) · `AI_R3_*` (4) · `AI_R4_*` (1) · `AI_R5_HOLDOUT_STRATEGY_REPORT` (1) · `M1_M2_*` (2) · `M1_RECOVERY_AUDIT_REPORT` (1) · `M2_ARTIFACT_FORENSIC_VALIDATION_REPORT` (1) · `H5_AI_GOVERNANCE_CLOSURE_REPORT` (1) · `R5_AI_SERVING_STRATEGY_REPORT` (1).

El destino `docs/bounded-contexts/ai-runtime/` previsto para esta familia **no fue materializado**; el destino canónico adoptado es `docs/ai/`. Referencias D-005 reconciliadas (12 entrantes + 14 internas) y movimiento registrado en `DOCUMENTATION_MIGRATION_MATRIX.md` § *Reconciliación LOTE-3*. El movimiento físico permanece **sin commit** hasta orden explícita de Bernardo.

### UNCLASSIFIED-5 ejecutado (2026-11-18) — 5 documentos Toshiba/pre-commit

Los **5 documentos previamente sin clasificar** del cierre Toshiba y de la auditoría pre-commit quedan clasificados (D-007) y reubicados por `UNCLASSIFIED-5` mediante `git mv` (**sin commit**):

| Documento | Origen | Destino final | Acción |
|---|---|---|---|
| `TOSHIBA_CLOSURE_REPORT_20261117.md` | `docs/` | `docs/historical/` | HISTORICAL |
| `DOCUMENTATION_DECISION_ALIGNMENT_REPORT.md` | `docs/` | `docs/historical/` | HISTORICAL |
| `DOCUMENTATION_DECISION_ALIGNMENT_REPORT_V1.md` | `docs/` | `docs/reports/` | KEEP |
| `PRE_COMMIT_CLASSIFICATION.md` | `docs/` | `docs/historical/` | HISTORICAL |
| `PRE_COMMIT_FORENSIC_REVIEW.md` | `docs/` | `docs/historical/` | HISTORICAL |

Cabecera **D-004.6** añadida/actualizada en los 5; referencias **D-005** reconciliadas en `AGENTS.md` y en los propios documentos; movimiento registrado en `DOCUMENTATION_MIGRATION_MATRIX.md` § *Reconciliación UNCLASSIFIED-5*. El movimiento físico permanece **sin commit** hasta orden explícita de Bernardo.

### LOTE-4A ejecutado (2026-11-18) — 12 documentos ARCHIVE → `docs/historical/`

Los **12 documentos clasificados ARCHIVE** con destino explícito `docs/historical/` en FASE 4 quedan reubicados por `LOTE-4A` mediante `git mv` (**sin commit**):

| Documento | Origen | Destino final | Acción |
|---|---|---|---|
| `DEPLOYMENT.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `INDICE_PROYECTO.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `L1_L6_EXECUTION_PLAN.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `L1_L6_RUNTIME_DISCLOSURE_PLAN.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `VISUAL_VALIDATION_FINAL_REPORT.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `TOSHIBA_EXPORT_MANIFEST.md` | `docs/` | `docs/historical/` | ARCHIVE |
| `TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | `docs/` | `docs/historical/` | ARCHIVE |

Cabecera **D-004.6** añadida a 6 documentos y destino actualizado en los otros 6; **D-005** aplicado en **modo registro** (`AGENTS.md`, matriz, este masterplan y `CANONICAL_PROJECT_STATE_20261109.md`; sin tocar `src/ai_models/model_identity.py` ni referencias distribuidas en documentos canónicos); movimiento registrado en `DOCUMENTATION_MIGRATION_MATRIX.md` § *Reconciliación LOTE-4A* (con 4 filas nuevas). **Excluido de LOTE-4A:** `ECOSYSTEM_IDENTITY.md` — **resuelto (2026-11-19)** por `ECOSYSTEM_IDENTITY_RECONCILIATION` como `REFERENCE` (fundacional), sin movimiento, y **publicado** en `dbd9e45`. El movimiento físico de los 12 documentos LOTE-4A quedó registrado en la serie de commits `1eaa537` → `dbd9e45`; ya no está pendiente de commit.

### INTEGRATION-5 ejecutado (2026-11-18) — 5 documentos pendientes auditados

Los **5 documentos pendientes auditados** quedan integrados conforme a la clasificación de Bernardo (**sin commit**):

| Documento | Origen | Destino final | Acción |
|---|---|---|---|
| `AI_ACOUSTIC_INTEGRATION_PATH.md` | `docs/` | `docs/` (sin movimiento) | KEEP |
| `AI_ACOUSTIC_STATE_AUDIT.md` | `docs/` | `docs/` (sin movimiento) | KEEP |
| `ASUS_INTEGRATION_EXECUTION_PLAN.md` | `docs/` | `docs/historical/` | HISTORICAL |
| `ASUS_TOSHIBA_INTEGRATION_FILE_ROUTING.md` | `docs/` | `docs/historical/` | HISTORICAL |
| `SECURITY_SPRINT_01_REPORT.md` | `docs/` | `docs/reports/` | REPORT |

**KEEP vigentes:** `AI_ACOUSTIC_INTEGRATION_PATH.md` y `AI_ACOUSTIC_STATE_AUDIT.md` permanecen en `docs/`, pendientes de una futura consolidación del bounded context acústico (`docs/bounded-contexts/acoustic-dataset/`, aún no materializado). **No** se creó ninguna carpeta nueva.

Cabecera **D-004.6** añadida a los 5 documentos (autor · timestamp · origen · destino gobernado); **D-005** reconciliado en `AGENTS.md`, la matriz y este masterplan; movimiento registrado en `DOCUMENTATION_MIGRATION_MATRIX.md` § *Reconciliación INTEGRATION-5* (con 5 filas nuevas). El movimiento físico permanece **sin commit** hasta orden explícita de Bernardo.

### ECOSYSTEM_IDENTITY_RECONCILIATION ejecutado (2026-11-19) — corrección ARCHIVE → REFERENCE

Se elimina la contradicción de clasificación sobre `docs/ECOSYSTEM_IDENTITY.md`. **No se mueve, no se archiva, no se altera su contenido fundacional.**

| Documento | Clasificación previa (FASE 4) | Clasificación final | Ubicación |
|---|---|---|---|
| `ECOSYSTEM_IDENTITY.md` | ARCHIVE → `docs/historical/` | **REFERENCE (fundacional)** | `docs/ECOSYSTEM_IDENTITY.md` (sin movimiento) |

**Fundamento:** FASE 1 lo clasifica `REFERENCE`; `docs/historical/OBSOLETE_VALIDATION.md` corrigió su estado a `OUTDATED` (no `OBSOLETE`); `docs/CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md` lo declara fuente histórica y fundacional vigente en sus principios. Es citado activamente como vértice de identidad por `README.md`, `SIGCT_RURAL_SYSTEM_BOOT.md`, onboarding y documentos canónicos (~35 referencias activas).

Cabecera **D-004.6** añadida con clasificación explícita `REFERENCE` y documentos que lo operacionalizan (`SIGCTIARURAL_VISION_ALIGNMENT.md`, `SIGCTIARURAL_CANONICAL_PHILOSOPHY_EVOLUTION_v1.md`, `CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md`); **D-005** sin cambios (el documento no se mueve); **D-007** registrado en `DOCUMENTATION_ARCHITECTURE_DECISION_V1.md`, la matriz y este masterplan. **Sin commit** hasta orden explícita de Bernardo.

---

## FASE 5 – FUENTE DE VERDAD

**Opción elegida: A) `docs/`**

**Justificación:**

1. `docs/` contiene `CANONICAL_PROJECT_STATE_20261109.md`, declarado explícitamente como "Fuente: Estado extraído de commits, tags, documentación canónica y consensos de sesión" con fecha 2026-11-09.
2. `docs/` contiene los documentos identificados como "Fuentes de verdad (canónicas, priority 1)" en §8 de `CANONICAL_PROJECT_STATE_20261109.md`: `AGENTS.md`, `CMSC_CANONICAL_STATE_v1.md`, `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md`, `DOCUMENTATION_GOVERNANCE_REVIEW.md`, `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md`.
3. `docs/` contiene los documentos KEEP (conocimiento oficial adoptado): `ARCHITECTURE_AUDIT_VALIDATION.md`, `ARCHITECTURE_ACTION_MATRIX.md`, `ARCHITECTURE_ACTION_REVIEW.md`, `C02_EXECUTION_PACKAGE.md`.
4. `docs/` tiene estructura ya organizada por subdominios temáticos (`ai/`, `architecture/`, `eiarc/`, `historical/`, `project_knowledge_base/`, `reports/`, `sena_artifacts/`, etc.).
5. `Documentacion/` no tiene estado canónico propio, no contiene un documento equivalente a `CANONICAL_PROJECT_STATE_20261109.md`, y sus documentos están clasificados como LEGACY en `DOCUMENT_ROOT_GOVERNANCE_V1.md`.
6. El flujo de consulta recomendado en `CANONICAL_PROJECT_STATE_20261109.md` §204-208 apunta exclusivamente a archivos dentro de `docs/`.

**Conclusión:** `docs/` es la única carpeta que debe convertirse en SOURCE OF TRUTH. `Documentacion/` debe ser migrada y luego retirada como fuente paralela de verdad.

---

## FASE 6 – IMPACTO Y RIESGO

### Riesgos identificados

| Riesgo | Clasificación | Descripción |
|---|---|---|
| Enlaces rotos en `AGENTS.md` | ALTO | `AGENTS.md` referencia rutas absolutas dentro de `docs/` (ej. `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md`, `docs/MASTERDOC.md`, `docs/CONTINUITY_MASTER.md`). Mover archivos invalidaría estas referencias. |
| Referencias cruzadas entre documentos | ALTO | Muchos documentos en `docs/` se citan entre sí (ej. `CANONICAL_PROJECT_STATE_20261109.md` referencia `docs/DOCUMENTATION_GOVERNANCE_REVIEW.md`, `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md`). |
| Rutas rotas en README | MEDIO | El `README.md` del repositorio raíz puede apuntar a documentos bajo `docs/` o `Documentacion/`. |
| Documentación citada por runbooks | MEDIO | `CONTINUITY_RUNBOOK.md` y `CONTINUITY_MASTER.md` pueden referenciar documentos que se moverían. |
| Riesgos para gobernanza | ALTO | `DOCUMENTATION_GOVERNANCE_REVIEW.md` clasifica documentos como KEEP/MERGE/ARCHIVE/OBSOLETE; mover sin actualizar la clasificación rompe la gobernanza documental. |
| Riesgos para DDD | MEDIO | Los Bounded Contexts definidos en el plan objetivo deben mapearse correctamente a las nuevas rutas de archivos. |
| Riesgos para Hexagonal | MEDIO | `HEXAGONAL_REFACTOR_PLAN.md` y `ARCHITECTURE_AUDIT_VALIDATION.md` contienen referencias internas que deben mantenerse consistentes. |
| Pérdida de historial Git | MEDIO | Mover archivos sin `git mv` pierde el rastreo de cambios en Git. La misión prohíbe `git mv`, por lo que cualquier movimiento futuro debe usar `git mv` para preservar historial. |
| Documentos únicos en `Documentacion/` | ALTO | Algunos documentos de `Documentacion/` (ej. `CMSC_CANONICAL_STATE_v1.md`, `ESTADO_ACTUAL_BENCHMARKS.md`) contienen información no duplicada en `docs/` y serían perdidos si se descartara la raíz sin migración cuidadosa. |

---

## FASE 7 – PLAN DE EJECUCIÓN

### FASE A — Inventario y validación de duplicados

- **Objetivos:** Confirmar el inventario total de ambos árboles, validar duplicados detectados, identificar documentos únicos en `Documentacion/`.
- **Documentos afectados:** Todos los 296 archivos de `docs/` y los 45 de `Documentacion/`.
- **Riesgos:** Pasar por alto documentos únicos en `Documentacion/` que no tienen equivalente en `docs/`.
- **Validaciones necesarias:** Comparar nombres de archivo, contenido temático, y verificar que no existen duplicados exactos pasados por alto.

### FASE B — Preparación de estructura objetivo

- **Objetivos:** Crear la estructura de directorios objetivo en `docs/` (state/, governance/, architecture/, bounded-contexts/, deployment/, runbooks/, datasets/, ai/, decisions/, reports/, historical/, capture/, knowledge-base/, project-knowledge-base/, UBTN/) sin mover archivos aún.
- **Documentos afectados:** Ningún archivo se mueve; solo se crean directorios vacíos.
- **Riesgos:** Crear directorios que no se usarán finalmente, o omitir directorios necesarios.
- **Validaciones necesarias:** Revisar que la estructura cubre todos los Bounded Contexts identificados y que no sobran directorios vacíos innecesarios.

### FASE C — Migración de documentos KEEP y CANONICAL

- **Objetivos:** Mover los documentos clasificados como KEEP y CANONICAL desde sus ubicaciones actuales (incluyendo `Documentacion/`) a sus destinos definitivos en `docs/`.
- **Documentos afectados:** Todos los documentos KEEP (4) y CANONICAL (aprox. 50) identificados en la Fase 1.
- **Riesgos:** Romper enlaces internos, perder historial Git si no se usa `git mv`, omitir referencias cruzadas.
- **Validaciones necesarias:** Verificar que cada archivo movido mantenga su contenido intacto, verificar que las referencias internas en otros documentos sigan siendo válidas (o planificar su actualización en una fase posterior).

### FASE D — Migración de documentos HISTORICAL, OBSOLETE, ARCHIVE y LOCAL_ONLY

- **Objetivos:** Mover documentos históricos, obsoletos y de archivo a `docs/historical/`. Mantener documentos LOCAL_ONLY fuera del repositorio versionado.
- **Documentos afectados:** Documentos ARCHIVE (7 de Toshiba + 2 de ASUS + otros identificados), OBSOLETE, LOCAL_ONLY.
- **Riesgos:** Mezclar documentos históricos con documentos vigentes, perder trazabilidad de decisiones pasadas.
- **Validaciones necesarias:** Verificar que ningún documento clasificado como HISTORICAL o OBSOLETE quede mezclado con documentos KEEP o CANONICAL en la estructura final.

---

## CRITERIO DE ÉXITO

Al finalizar la consolidación (cuando se autorice ejecutar):

1. **Fuente de verdad:** `docs/` es la única carpeta fuente de verdad; `Documentacion/` queda retirada como fuente paralela.
2. **Documentos que permanecen:** Todos los documentos CANONICAL y KEEP en `docs/` bajo su nueva estructura DDD/Hexagonal/Bounded Contexts.
3. **Documentos que se mueven:** Todos los documentos de `Documentacion/` hacia sus destinos en `docs/` según el mapa de migración (FASE 4).
4. **Documentos que se fusionan:** Documentos con solapamiento temático identificado en FASE 2 (ej. `CANONICAL_PROJECT_STATE_20261109.md` con `CMSC_CANONICAL_STATE_v1.md`).
5. **Documentos que se archivan:** Documentos OBSOLETE y HISTORICAL movidos a `docs/historical/`.
6. **Estructura final:** Compatible con DDD, Hexagonal Architecture y Bounded Contexts, con `bounded-contexts/` conteniendo `cmsc/`, `acoustic-dataset/`, `ai-runtime/`, `telemetry/`, `identity/`, `governance/`, `capture/`, `laboratory/`.
7. **Ejecución sin riesgo:** La migración se realiza por fases (A→D), con validaciones en cada fase, usando `git mv` para preservar historial, y sin modificar código, backend, frontend ni Docker.

---

**Archivo generado:** `docs/DOCUMENTATION_REPOSITORY_CONSOLIDATION_MASTERPLAN.md`

Sin ejecutar migraciones. Sin mover archivos. Sin modificar repositorio. Sin acciones Git.

---

## ANEXO — Modelo de dominios documentales (absorbido de `SIGCT_DOCUMENT_ARCHITECTURE_V1.md`)

> Contenido absorbido por **MERGE-REMAINING-DOCUMENTS** (2026-11-17). **No crea gobernanza nueva**: registra el modelo de dominios, fuentes de verdad y reglas de arquitectura documental que el documento origen derivó del canon existente. No se duplica aquí la clasificación documento-por-documento (FASE 1), el mapa de migración (FASE 4) ni la fuente de verdad (FASE 5).

### 1. Dominios documentales oficiales

| Dominio | Alcance |
|---|---|
| Estado canónico del proyecto | Fotografía de estado, HEAD, ramas, tags, decisiones cerradas, backlog abierto |
| Identidad y cadencias del proyecto | Identidad del ecosistema, estado git, decisiones, cadencias operativas |
| Arquitectura de software | Hexagonal, refactor, EIARC, labs, señal, diagrama maestro |
| Gobernanza documental | Clasificación KEEP/MERGE/ARCHIVE/OBSOLETE, reglas de documentación |
| Dataset acústico SIGCT-Rural | Gobernanza, estrategia híbrida, referencia, features, splits, gates G-DS-1..6 |
| Benchmark IA (M1/M2) | Ejecución, artefactos, model cards, comparación, métricas |
| Despliegue e infraestructura | Docker readiness, bloques R1-R5, despliegue AWS, healthchecks |
| Knowledge Hub | Especificación, migración, registros, categorías de documentos |
| Continuidad operativa | Maestría del proyecto, runbook, estado de continuidad |
| Ecosistema y forense | Auditoría forense, evolución cronológica, veredicto de rescate |

### 2. Fuente de verdad de cada dominio

| Dominio | Fuente de verdad (canónica) | Ubicación |
|---|---|---|
| Estado canónico del proyecto | `CANONICAL_PROJECT_STATE_20261109.md` | `docs/` |
| Identidad y cadencias | `AGENTS.md` | Raíz del repositorio |
| Arquitectura de software | `CANONICAL_ARCHITECTURE_MASTER_REPORT.md` + `HEXAGONAL_REFACTOR_PLAN.md` + `docs/eiarc/` | `docs/` |
| Gobernanza documental | `DOCUMENTATION_GOVERNANCE_REVIEW.md` + `GOVERNANCE_RULES.md` | `docs/` |
| Dataset acústico | `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | `docs/` |
| Benchmark IA (M1/M2) | artefactos, model cards y execution reports | `docs/ai/` |
| Despliegue e infraestructura | `DOCUMENTATION_GOVERNANCE_REVIEW.md` §7 + `DEPLOYMENT.md` L-5 | `docs/` |
| Knowledge Hub | `KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md` + `KNOWLEDGE_HUB_MIGRATION_PLAN.md` | `docs/` |
| Continuidad operativa | `CONTINUITY_MASTER.md` + `CONTINUITY_RUNBOOK.md` | `docs/` |
| Ecosistema y forense | `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | `docs/` |

**Regla derivada:** cada dominio tiene exactamente un documento canónico prioritario; los documentos de `Documentacion/` son referencia de diseño y **no** son fuente de verdad de ningún dominio.

### 3. Flujo de consulta canónica

| Necesidad | Ruta de consulta |
|---|---|
| Estado general del proyecto | `AGENTS.md` → `CANONICAL_PROJECT_STATE_20261109.md` |
| Arquitectura del ecosistema | `CANONICAL_ARCHITECTURE_MASTER_REPORT.md` → `HEXAGONAL_REFACTOR_PLAN.md` → `docs/eiarc/` |
| Gobernanza documental | `DOCUMENTATION_GOVERNANCE_REVIEW.md` → `GOVERNANCE_RULES.md` |
| Dataset acústico | `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` → `AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` |
| Benchmark IA | `docs/ai/` (artefactos, model cards, reportes M1/M2) |
| Docker y despliegue | `DOCUMENTATION_GOVERNANCE_REVIEW.md` §7 → `DEPLOYMENT.md` L-5 |
| Knowledge Hub | `KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md` → `KNOWLEDGE_HUB_MIGRATION_PLAN.md` |
| Continuidad | `CONTINUITY_MASTER.md` → `CONTINUITY_RUNBOOK.md` |

El origen registra además una ruta abreviada de cinco pasos (estado general → dataset acústico → Docker readiness → documentación clasificada → implementación CMSC) y una consulta por dominio CMSC (`CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` → `CMSC_F3A_INTERCONNECTION_BLUEPRINT_v1.md`), coherente con la tabla anterior.

### 4. Documentos que gobiernan el ecosistema

El origen los tomó del canon, no de una clasificación propia, y por eso **no se re-enumeran aquí**:

- **Fuentes de verdad priority 1** (5 documentos) y **priority 2** (16 documentos): las declaradas en `CANONICAL_PROJECT_STATE_20261109.md` §8 y §9.2.
- **Documentos KEEP** (4): `ARCHITECTURE_AUDIT_VALIDATION.md`, `ARCHITECTURE_ACTION_MATRIX.md`, `ARCHITECTURE_ACTION_REVIEW.md`, `C02_EXECUTION_PACKAGE.md`.
- **Documentos de prioridad crítica y de preservación obligatoria:** D-006 y D-007 de `DOCUMENTATION_ARCHITECTURE_DECISION_V1.md`.

### 5. Documentos derivados

**Definición:** documentos generados a partir de las fuentes de verdad canónicas que **no** constituyen decisión independiente de arquitectura ni de gobernanza y, por tanto, **no gobiernan**.

| Categoría | Documentos representativos |
|---|---|
| Informes de ejecución y validación | `C02_POST_IMPLEMENTATION_VALIDATION.md`, `AI_R1_EXECUTION_REPORT.md`, `AI_R2_EXECUTION_REPORT.md`, `AI_R3_EXECUTION_READINESS_REPORT.md`, `AI_R3_R4_EXECUTION_PLAN.md`, `AI_R4_SEMANTIC_CONTRACT_PLAN.md`, `AI_R5_HOLDOUT_STRATEGY_REPORT.md` |
| Reportes de artefactos y forense | `M2_ARTIFACT_RECORD.md`, `M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md`, `M1_M2_ARTIFACT_RECOVERY_REPORT.md`, `M1_RECOVERY_AUDIT_REPORT.md` |
| Planes de ejecución derivados | `C02_EXECUTION_PACKAGE.md`, `C02_IMPLEMENTATION_STRATEGY.md` (MERGE hacia `HEXAGONAL_REFACTOR_PLAN.md`), `AI_R1_ARTIFACT_IMPLEMENTATION_PLAN.md`, `DOCKER_READY_R1_R4_EXECUTION_PLAN.md`, `DOCKER_READY_REMEDIATION_PLAN.md` |
| Informes de cierre y validación | `DOCKER_READY_CLOSURE_REPORT.md`, `DOCKER_READY_FINAL_DECISION_REPORT.md`, `H5_AI_GOVERNANCE_CLOSURE_REPORT.md`, `M1_M2_GOVERNANCE_CLOSURE_REPORT.md` |
| Informes de realidad y backlog | `REALITY_RECONSTRUCTION_AUDIT_V1.md`, `BACKLOG_REALITY_CHECK_V1.md` |
| Informes de piloto y captura | `PILOT_CAPTURE_CHECKLIST.md`, `PILOT_REVIEW_CHECKLIST.md`, `PILOT_ACCEPTANCE_CRITERIA.md`, `FIELD_CAPTURE_RUN_001_REPORT.md`, `FIELD_DATA_COLLECTION_PROTOCOL.md`, `FIELD_PILOT_EXECUTION_PLAN.md`, `INITIAL_CAPTURE_EVIDENCE.md`, `INITIAL_METADATA_AUDIT.md` |
| Informes de dataset y modelo | `DATASET_STATUS_REPORT.md`, `PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md`, `PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md`, `PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` |
| Informes de validación y verificación | `L1_L6_EXECUTION_REPORT.md`, `L1_L6_RUNTIME_VERIFICATION_REPORT.md`, `CMSC_DISCLOSURE_ALIGNMENT_REPORT.md`, `VISUAL_VALIDATION_FINAL_REPORT.md` |

La lista es una lectura del estado por archivo ya registrado en FASE 1; **no reclasifica** ningún documento.

### 6. Documentos históricos

El origen coincide con la clasificación ya recogida en FASE 1 y FASE 4: los 7 documentos **ARCHIVE** del sprint Toshiba (`ARCHITECTURE_AUDIT.md`, `TOSHIBA_AUDIT_SPRINT_CLOSURE.md`, `DOCUMENTATION_LANGUAGE_NORMALIZATION.md`, `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md`, `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md`, `TOSHIBA_EXPORT_MANIFEST.md`, `TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md`), las carpetas históricas (`docs/historical/`, `docs/sena_artifacts/`, `docs/session_plans/_archive/`) y los documentos de punto en el tiempo (`DOCUMENTATION_FREEZE_COMPLETION_PLAN.md`, `DOCUMENTATION_FREEZE_EXECUTION_REPORT.md`, `CMSC_SESSION_CLOSEOUT_2026_10_02.md` —ubicado en `Documentacion/Arquitectura/`—, `SIGCTIARURAL_ESTADO_SESION_2026-09-14.md`, `STAGE_FREEZE_20261013.txt`). `TOSHIBA_EXECUTIVE_MATRIX.md` se retira de esta lista: no existe en disco ni en Git; su contenido queda cubierto por `docs/historical/TOSHIBA_CLOSURE_REPORT_20261117.md` y `docs/historical/TOSHIBA_EXPORT_MANIFEST.md` (referencias canónicas válidas). No se creó ningún archivo nuevo.

### 7. Reglas de arquitectura documental

1. **Una sola fuente de verdad por dominio:** cada dominio tiene exactamente un documento canónico prioritario definido en `CANONICAL_PROJECT_STATE_20261109.md` §8-9.
2. **`docs/` es la raíz activa:** toda documentación vigente reside y se consulta desde `docs/`.
3. **`Documentacion/` es legacy:** no aporta fuentes de verdad; su contenido es referencia de diseño previo sin estatus canónico.
4. **Los documentos derivados no gobiernan:** informes de ejecución, validación, cierre y planes derivados no establecen reglas de arquitectura ni de gobernanza.
5. **Los documentos históricos no se modifican:** son evidencia de estado previo y no participan en el flujo de consulta vigente.
6. **No reorganizar sin autorización:** cualquier migración de `Documentacion/` a `docs/`, o reestructuración interna de `docs/`, requiere autorización explícita y una misión de consolidación documental separada.

### 8. Nota de consistencia (verificada 2026-11-17)

La fila de **FASE 2** que declara `docs/ESTADO_ACTUAL_BENCHMARKS.md` ↔ `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` como `DUPLICADO_EXACTO` **no se corresponde con el árbol real**: `docs/ESTADO_ACTUAL_BENCHMARKS.md` no existe. El inventario absorbido (y la propia clasificación D-006, que marca el documento como `SUPERSEDED`) confirman **0 duplicados exactos** entre ambas raíces. Se deja constancia sin reescribir la fila original: el recuento vigente de duplicados exactos es **0**.
