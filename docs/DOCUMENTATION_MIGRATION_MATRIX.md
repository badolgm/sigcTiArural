# DOCUMENTATION_MIGRATION_MATRIX_V1.md

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: docs/DOCUMENTATION_MIGRATION_MATRIX.md
> - Destino: docs/DOCUMENTATION_MIGRATION_MATRIX.md

## Matriz de migración documental — SIGCT-Rural

**Estado:** Solo planificación. Sin ejecutar acciones. Sin mover archivos. Sin modificar repositorio. Sin acciones Git.

**Acciones permitidas:** KEEP, MOVE, MERGE, ARCHIVE, DELETE_CANDIDATE.

---

## Matriz completa de migración

| # | Archivo actual | Ubicación destino | Acción | Justificación |
|---|---|---|---|---|
| 1 | `docs/CANONICAL_PROJECT_STATE_20261109.md` | `docs/state/CANONICAL_PROJECT_STATE_20261109.md` | KEEP | Fuente de verdad canónica del proyecto |
| 2 | `docs/MASTERDOC.md` | `docs/state/MASTERDOC.md` | KEEP | Documento maestro del ecosistema |
| 3 | `docs/CONTINUITY_MASTER.md` | `docs/runbooks/CONTINUITY_MASTER.md` | KEEP | Runbook de continuidad operativa |
| 4 | `docs/CONTINUITY_RUNBOOK.md` | `docs/runbooks/CONTINUITY_RUNBOOK.md` | KEEP | Runbook operativo |
| 5 | `docs/DOCUMENTATION_GOVERNANCE_REVIEW.md` | `docs/governance/DOCUMENTATION_GOVERNANCE_REVIEW.md` | KEEP | Clasificación KEEP/MERGE/ARCHIVE/OBSOLETE |
| 6 | `docs/GOVERNANCE_RULES.md` | `docs/governance/GOVERNANCE_RULES.md` | KEEP | Reglas de gobernanza |
| 7 | `docs/HEXAGONAL_REFACTOR_PLAN.md` | `docs/architecture/hexagonal/HEXAGONAL_REFACTOR_PLAN.md` | KEEP | Plan de refactor hexagonal |
| 8 | `docs/ARCHITECTURE_ACTION_MATRIX.md` | `docs/decisions/ARCHITECTURE_ACTION_MATRIX.md` | KEEP | Matriz de acciones de arquitectura |
| 9 | `docs/ARCHITECTURE_ACTION_REVIEW.md` | `docs/decisions/ARCHITECTURE_ACTION_REVIEW.md` | KEEP | Registro de decisiones de ingeniería |
| 10 | `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | KEEP | Gobernanza dataset acústico |
| 11 | `docs/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` | KEEP | Estrategia híbrida dataset acústico |
| 12 | `docs/AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md` | KEEP | Arquitectura capa referencia |
| 13 | `docs/AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md` | KEEP | Catálogo datasets referencia |
| 14 | `docs/AI_ACOUSTIC_REFERENCE_INGESTION_PLAN_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_REFERENCE_INGESTION_PLAN_V1.md` | KEEP | Plan de ingesta referencia |
| 15 | `docs/AI_ACOUSTIC_H3_EXECUTION_READINESS_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_H3_EXECUTION_READINESS_V1.md` | KEEP | Alistamiento ejecución H3 |
| 16 | `docs/AI_ACOUSTIC_H3_DECISION_PACKAGE_FINAL.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_H3_DECISION_PACKAGE_FINAL.md` | KEEP | Paquete decisión H3 |
| 17 | `docs/AI_ACOUSTIC_FEATURE_MAP.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_FEATURE_MAP.md` | KEEP | Mapa de features acústicas |
| 18 | `docs/AI_ACOUSTIC_S81_INTEGRATION.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_S81_INTEGRATION.md` | KEEP | Integración S81 acústica |
| 19 | `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_ARCHITECTURE_V1.md` | MOVE | Arquitectura acústica V1 |
| 20 | `docs/AI_ACOUSTIC_CAPTURE_OPERATOR_GUIDE.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_CAPTURE_OPERATOR_GUIDE.md` | MOVE | Guía operador captura acústica |
| 21 | `docs/AI_ACOUSTIC_DATASET_REVIEW.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_DATASET_REVIEW.md` | MOVE | Revisión dataset acústico |
| 22 | `docs/AI_ACOUSTIC_DATASET_V1_DESIGN.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_DATASET_V1_DESIGN.md` | MOVE | Diseño dataset acústico V1 |
| 23 | `docs/AI_ACOUSTIC_MODEL_BENCHMARK.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_MODEL_BENCHMARK.md` | MOVE | Benchmark modelo acústico |
| 24 | `docs/AI_ACOUSTIC_ROADMAP_V1.md` | `docs/bounded-contexts/acoustic-dataset/AI_ACOUSTIC_ROADMAP_V1.md` | MOVE | Roadmap acústico V1 |
| 25 | `docs/AI_MODEL_INVENTORY.md` | `docs/bounded-contexts/ai-runtime/AI_MODEL_INVENTORY.md` | KEEP | Inventario modelos IA |
| 26 | `docs/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md` | `docs/bounded-contexts/ai-runtime/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md` | KEEP | Decisión implementación canon IA |
| 27 | `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` | `docs/bounded-contexts/ai-runtime/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` | KEEP | Decisión estrategia canon IA |
| 28 | `docs/DOCKER_READY_FINAL_DECISION_REPORT.md` | `docs/deployment/DOCKER_READY_FINAL_DECISION_REPORT.md` | KEEP | Decisión final Docker ready |
| 29 | `docs/KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md` | `docs/knowledge-base/KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md` | KEEP | Especificación Knowledge Hub |
| 30 | `docs/KNOWLEDGE_HUB_MIGRATION_PLAN.md` | `docs/knowledge-base/KNOWLEDGE_HUB_MIGRATION_PLAN.md` | KEEP | Plan migración Knowledge Hub |
| 31 | `docs/REALITY_RECONSTRUCTION_AUDIT_V1.md` | `docs/reports/REALITY_RECONSTRUCTION_AUDIT_V1.md` | KEEP | Auditoría reconstrucción realidad |
| 32 | `docs/BACKLOG_REALITY_CHECK_V1.md` | `docs/reports/BACKLOG_REALITY_CHECK_V1.md` | KEEP | Chequeo realidad backlog |
| 33 | `docs/CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` | `docs/bounded-contexts/cmsc/CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` | KEEP | Alineación divulgación CMSC |
| 34 | `docs/L1_L6_EXECUTION_REPORT.md` | `docs/reports/L1_L6_EXECUTION_REPORT.md` | KEEP | Reporte ejecución L1-L6 |
| 35 | `docs/L1_L6_RUNTIME_VERIFICATION_REPORT.md` | `docs/reports/L1_L6_RUNTIME_VERIFICATION_REPORT.md` | KEEP | Verificación runtime L1-L6 |
| 36 | `docs/AI_PIPELINE.md` | `docs/bounded-contexts/ai-runtime/AI_PIPELINE.md` | MOVE | Pipeline IA |
| 37 | `docs/architect_master/01_REPOSITORY_AUDIT.md` | `docs/architecture/architect_master/01_REPOSITORY_AUDIT.md` | MOVE | Auditoría repositorio |
| 38 | `docs/architect_master/02_SIGCTRURAL_CANONICAL_MODEL.md` | `docs/architecture/architect_master/02_SIGCTRURAL_CANONICAL_MODEL.md` | MOVE | Modelo canónico SIGCT-Rural |
| 39 | `docs/architect_master/03_DOCUMENT_TRUTH_MATRIX.md` | `docs/architecture/architect_master/03_DOCUMENT_TRUTH_MATRIX.md` | MOVE | Matriz verdad documental |
| 40 | `docs/architect_master/04_DIAGRAM_AUDIT.md` | `docs/architecture/architect_master/04_DIAGRAM_AUDIT.md` | MOVE | Auditoría diagramas |
| 41 | `docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md` | `docs/architecture/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md` | MOVE | Línea base arquitectura final |
| 42 | `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md` | `docs/architecture/architect_master/06_EVIDENCE_STATUS_MATRIX.md` | MOVE | Matriz estado evidencia |
| 43 | `docs/architect_master/07_ARCHITECT_MASTER_SUMMARY.md` | `docs/architecture/architect_master/07_ARCHITECT_MASTER_SUMMARY.md` | MOVE | Resumen arquitecto maestro |
| 44 | `docs/architect_master/08_DEVELOPMENT_ROADMAP_2026_2027.md` | `docs/architecture/architect_master/08_DEVELOPMENT_ROADMAP_2026_2027.md` | MOVE | Roadmap desarrollo 2026-2027 |
| 45 | `docs/architecture/README.md` | `docs/architecture/README.md` | KEEP | README arquitectura |
| 46 | `docs/architecture/robotics_contracts.md` | `docs/architecture/robotics_contracts.md` | KEEP | Contratos robótica |
| 47 | `docs/architecture/simulation_stack.md` | `docs/architecture/simulation_stack.md` | KEEP | Stack simulación |
| 48 | `docs/database/README.md` | `docs/datasets/database/README.md` | MOVE | README base de datos |
| 49 | `docs/eiarc/01_FOUNDATION/EIARC_MISSION.md` | `docs/architecture/eiarc/01_FOUNDATION/EIARC_MISSION.md` | MOVE | Misión EIARC |
| 50 | `docs/eiarc/01_FOUNDATION/EIARC_SCOPE.md` | `docs/architecture/eiarc/01_FOUNDATION/EIARC_SCOPE.md` | MOVE | Alcance EIARC |
| 51 | `docs/eiarc/01_FOUNDATION/EIARC_VISION.md` | `docs/architecture/eiarc/01_FOUNDATION/EIARC_VISION.md` | MOVE | Visión EIARC |
| 52 | `docs/eiarc/02_ARCHITECTURE/AI_CONTEXT_IMPLEMENTATION_GUIDE.md` | `docs/architecture/eiarc/02_ARCHITECTURE/AI_CONTEXT_IMPLEMENTATION_GUIDE.md` | MOVE | Guía implementación contexto IA |
| 53 | `docs/eiarc/02_ARCHITECTURE/AI_CONTEXT_REFACTOR_PLAN.md` | `docs/architecture/eiarc/02_ARCHITECTURE/AI_CONTEXT_REFACTOR_PLAN.md` | MOVE | Plan refactor contexto IA |
| 54 | `docs/eiarc/02_ARCHITECTURE/AI_PR1_CODE_REVIEW.md` | `docs/architecture/eiarc/02_ARCHITECTURE/AI_PR1_CODE_REVIEW.md` | MOVE | Code review PR1 IA |
| 55 | `docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md` | `docs/architecture/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md` | MOVE | Contrato semántico IA EIARC |
| 56 | `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md` | `docs/architecture/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md` | MOVE | Modelo datos canónico EIARC |
| 57 | `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_PRINCIPLES.md` | `docs/architecture/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_PRINCIPLES.md` | MOVE | Principios canónicos EIARC |
| 58 | `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` | `docs/architecture/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` | MOVE | Contextos EIARC |
| 59 | `docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md` | `docs/architecture/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md` | MOVE | Blueprint implementación EIARC |
| 60 | `docs/eiarc/02_ARCHITECTURE/EIARC_TRANSFORMATION_PLAN.md` | `docs/architecture/eiarc/02_ARCHITECTURE/EIARC_TRANSFORMATION_PLAN.md` | MOVE | Plan transformación EIARC |
| 61 | `docs/eiarc/02_ARCHITECTURE/TELEMETRY_CONTEXT_IMPLEMENTATION_GUIDE.md` | `docs/architecture/eiarc/02_ARCHITECTURE/TELEMETRY_CONTEXT_IMPLEMENTATION_GUIDE.md` | MOVE | Guía implementación contexto telemetría |
| 62 | `docs/eiarc/02_ARCHITECTURE/TELEMETRY_CONTEXT_REFACTOR_PLAN.md` | `docs/architecture/eiarc/02_ARCHITECTURE/TELEMETRY_CONTEXT_REFACTOR_PLAN.md` | MOVE | Plan refactor contexto telemetría |
| 63 | `docs/eiarc/02_ARCHITECTURE/TELEMETRY_DATABASE_DIAGNOSTIC.md` | `docs/architecture/eiarc/02_ARCHITECTURE/TELEMETRY_DATABASE_DIAGNOSTIC.md` | MOVE | Diagnóstico base de datos telemetría |
| 64 | `docs/eiarc/02_ARCHITECTURE/TELEMETRY_PR1_CODE_REVIEW.md` | `docs/architecture/eiarc/02_ARCHITECTURE/TELEMETRY_PR1_CODE_REVIEW.md` | MOVE | Code review PR1 telemetría |
| 65 | `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` | `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` | KEEP | Informe análisis y plan acción |
| 66 | `docs/historical/README_REALITY_CHECK.md` | `docs/historical/README_REALITY_CHECK.md` | KEEP | README realidad check |
| 67 | `docs/historical/TRAE_AI_INTEGRATION_AUDIT.md` | `docs/historical/TRAE_AI_INTEGRATION_AUDIT.md` | KEEP | Auditoría integración IA TRAE |
| 68 | `docs/historical/TRAE_INDEPENDENT_REPOSITORY_AUDIT.md` | `docs/historical/TRAE_INDEPENDENT_REPOSITORY_AUDIT.md` | KEEP | Auditoría repositorio independiente TRAE |
| 69 | `docs/project_knowledge_base/governance/BACKUP_CONTENT_INDEX.md` | `docs/project-knowledge-base/governance/BACKUP_CONTENT_INDEX.md` | MOVE | Índice contenido backup |
| 70 | `docs/project_knowledge_base/governance/BACKUP_VERIFICATION_REPORT.md` | `docs/project-knowledge-base/governance/BACKUP_VERIFICATION_REPORT.md` | MOVE | Reporte verificación backup |
| 71 | `docs/project_knowledge_base/governance/DOCUMENT_RETENTION_POLICY.md` | `docs/project-knowledge-base/governance/DOCUMENT_RETENTION_POLICY.md` | MOVE | Política retención documentos |
| 72 | `docs/project_knowledge_base/governance/MASTER_PROJECT_INVENTORY_AUDIT.md` | `docs/project-knowledge-base/governance/MASTER_PROJECT_INVENTORY_AUDIT.md` | MOVE | Auditoría inventario maestro proyecto |
| 73 | `docs/project_knowledge_base/governance/PROJECT_ARCHIVE_MANIFEST.md` | `docs/project-knowledge-base/governance/PROJECT_ARCHIVE_MANIFEST.md` | MOVE | Manifiesto archivo proyecto |
| 74 | `docs/project_knowledge_base/governance/PROJECT_BACKUP_MANIFEST.md` | `docs/project-knowledge-base/governance/PROJECT_BACKUP_MANIFEST.md` | MOVE | Manifiesto backup proyecto |
| 75 | `docs/project_knowledge_base/governance/PROJECT_RECORDS_REGISTER.md` | `docs/project-knowledge-base/governance/PROJECT_RECORDS_REGISTER.md` | MOVE | Registro registros proyecto |
| 76 | `docs/project_knowledge_base/governance/PROJECT_STRUCTURE_SNAPSHOT.md` | `docs/project-knowledge-base/governance/PROJECT_STRUCTURE_SNAPSHOT.md` | MOVE | Snapshot estructura proyecto |
| 77 | `docs/project_knowledge_base/KB-001-TRAE-INDEPENDENT-REPOSITORY-AUDIT.md` | `docs/project-knowledge-base/KB-001-TRAE-INDEPENDENT-REPOSITORY-AUDIT.md` | MOVE | KB-001 auditoría repo independiente TRAE |
| 78 | `docs/project_knowledge_base/KB-002-README-REALITY-CHECK.md` | `docs/project-knowledge-base/KB-002-README-REALITY-CHECK.md` | MOVE | KB-002 realidad check README |
| 79 | `docs/project_knowledge_base/KB-003-AI-INTEGRATION-AUDIT.md` | `docs/project-knowledge-base/KB-003-AI-INTEGRATION-AUDIT.md` | MOVE | KB-003 auditoría integración IA |
| 80 | `docs/project_knowledge_base/KB-004-AI-SEMANTIC-CONTRACT-AUDIT.md` | `docs/project-knowledge-base/KB-004-AI-SEMANTIC-CONTRACT-AUDIT.md` | MOVE | KB-004 auditoría contrato semántico IA |
| 81 | `docs/project_knowledge_base/KB-005-EIARC-AI-CANONICAL-MODEL.md` | `docs/project-knowledge-base/KB-005-EIARC-AI-CANONICAL-MODEL.md` | MOVE | KB-005 modelo canónico IA EIARC |
| 82 | `docs/project_knowledge_base/KB-006-PENDING-CHANGES-AUDIT.md` | `docs/project-knowledge-base/KB-006-PENDING-CHANGES-AUDIT.md` | MOVE | KB-006 auditoría cambios pendientes |
| 83 | `docs/DEPLOYMENT.md` | `docs/historical/DEPLOYMENT.md` | ARCHIVE | Obsoleto (61 líneas, 21/08/2026) |
| 84 | `docs/INDICE_PROYECTO.md` | `docs/historical/INDICE_PROYECTO.md` | ARCHIVE | Índice estático desactualizado |
| 85 | `docs/ECOSYSTEM_IDENTITY.md` | `docs/historical/ECOSYSTEM_IDENTITY.md` | ARCHIVE | Superseded por VISION_ALIGNMENT |
| 86 | `docs/DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` | `docs/historical/DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` | ARCHIVE | Superseded por decisión final |
| 87 | `docs/DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT.md` | `docs/historical/DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT.md` | ARCHIVE | Bloqueadores resueltos |
| 88 | `docs/DOCKER_OFFICIAL_EXECUTION_PLAN.md` | `docs/historical/DOCKER_OFFICIAL_EXECUTION_PLAN.md` | ARCHIVE | Plan ejecutado |
| 89 | `docs/DOCKER_READY_CLOSURE_REPORT.md` | `docs/historical/DOCKER_READY_CLOSURE_REPORT.md` | ARCHIVE | Reporte cierre ejecutado |
| 90 | `docs/DOCKER_READY_R1_R4_EXECUTION_PLAN.md` | `docs/historical/DOCKER_READY_R1_R4_EXECUTION_PLAN.md` | ARCHIVE | Plan R1-R4 ejecutado |
| 91 | `docs/DOCKER_READY_R1_R4_REPORT.md` | `docs/historical/DOCKER_READY_R1_R4_REPORT.md` | ARCHIVE | Reporte R1-R4 ejecutado |
| 92 | `docs/DOCKER_READY_REMEDIATION_PLAN.md` | `docs/historical/DOCKER_READY_REMEDIATION_PLAN.md` | ARCHIVE | Plan remediación ejecutado |
| 93 | `docs/DOCKER_RUNTIME_AND_DATABASE_VALIDATION_REPORT.md` | `docs/historical/DOCKER_RUNTIME_AND_DATABASE_VALIDATION_REPORT.md` | MOVE | Reporte validación runtime Docker |
| 94 | `docs/DOCUMENTATION_FREEZE_COMPLETION_PLAN.md` | `docs/historical/DOCUMENTATION_FREEZE_COMPLETION_PLAN.md` | ARCHIVE | Plan freeze documentación |
| 95 | `docs/DOCUMENTATION_FREEZE_EXECUTION_REPORT.md` | `docs/historical/DOCUMENTATION_FREEZE_EXECUTION_REPORT.md` | ARCHIVE | Reporte ejecución freeze |
| 96 | `docs/DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | `docs/historical/DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | ARCHIVE | Normalización completada |
| 97 | `docs/DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | `docs/historical/DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | ARCHIVE | Remediación completada |
| 98 | `docs/ARCHITECTURE_AUDIT.md` | `docs/historical/ARCHITECTURE_AUDIT.md` | ARCHIVE | Auditoría completada |
| 99 | `docs/TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | `docs/historical/TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | ARCHIVE | Cierre sprint Toshiba |
| 100 | `docs/TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | `docs/historical/TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | ARCHIVE | Revisión consolidación Toshiba |
| 101 | `docs/TOSHIBA_EXPORT_MANIFEST.md` | `docs/historical/TOSHIBA_EXPORT_MANIFEST.md` | ARCHIVE | Manifiesto exportación Toshiba |
| 102 | `docs/TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | `docs/historical/TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | ARCHIVE | Plan consolidación Toshiba |
| 103 | `docs/sena_artifacts/API_DELIVERY_PACKAGE.md` | `docs/historical/sena_artifacts/API_DELIVERY_PACKAGE.md` | MOVE | Artefacto SENA histórico |
| 104 | `docs/sena_artifacts/DEPLOYMENT_FINAL.md` | `docs/historical/sena_artifacts/DEPLOYMENT_FINAL.md` | MOVE | Despliegue final SENA |
| 105 | `docs/sena_artifacts/EVIDENCIAS_ADSO_MASTER.md` | `docs/historical/sena_artifacts/EVIDENCIAS_ADSO_MASTER.md` | MOVE | Evidencias ADSO SENA |
| 106 | `docs/sena_artifacts/PRESENTACION_SUSTENTACION.md` | `docs/historical/sena_artifacts/PRESENTACION_SUSTENTACION.md` | MOVE | Presentación SENA |
| 107 | `docs/sena_artifacts/PROYECTO_FORMATIVO_FINAL.md` | `docs/historical/sena_artifacts/PROYECTO_FORMATIVO_FINAL.md` | MOVE | Proyecto formativo SENA |
| 108 | `docs/sena_artifacts/README_DELIVERABLES_INDEX.md` | `docs/historical/sena_artifacts/README_DELIVERABLES_INDEX.md` | MOVE | Índice entregables SENA |
| 109 | `docs/sena_artifacts/SENA_GRADUATION_READINESS_AUDIT.md` | `docs/historical/sena_artifacts/SENA_GRADUATION_READINESS_AUDIT.md` | MOVE | Auditoría graduación SENA |
| 110 | `docs/session_plans/_archive/SESSION_PLAN_2025-12-08_DJANGO_MINIMO.md` | `docs/historical/session_plans/SESSION_PLAN_2025-12-08_DJANGO_MINIMO.md` | MOVE | Plan sesión Django mínimo |
| 111 | `docs/PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md` | `docs/datasets/PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md` | MOVE | Auditoría trazabilidad dataset |
| 112 | `docs/PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md` | `docs/datasets/PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md` | MOVE | Procedencia modelo enfermedad planta |
| 113 | `docs/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` | `docs/datasets/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` | MOVE | Recuperación modelo enfermedad planta |
| 114 | `docs/DATASET_C0_EXECUTION_PLAN_v1.md` | `docs/datasets/DATASET_C0_EXECUTION_PLAN_v1.md` | MOVE | Plan ejecución dataset C0 |
| 115 | `docs/DATASET_STATUS_REPORT.md` | `docs/datasets/DATASET_STATUS_REPORT.md` | KEEP | Reporte estado dataset |
| 116 | `docs/EVIDENCIA_FLUJO_BRIDGE.md` | `docs/reports/EVIDENCIA_FLUJO_BRIDGE.md` | MOVE | Evidencia flujo bridge |
| 117 | `docs/FIELD_CAPTURE_RUN_001_REPORT.md` | `docs/capture/FIELD_CAPTURE_RUN_001_REPORT.md` | MOVE | Reporte captura campo run 001 |
| 118 | `docs/FIELD_DATA_COLLECTION_PROTOCOL.md` | `docs/capture/FIELD_DATA_COLLECTION_PROTOCOL.md` | MOVE | Protocolo recolección datos campo |
| 119 | `docs/FIELD_PILOT_EXECUTION_PLAN.md` | `docs/capture/FIELD_PILOT_EXECUTION_PLAN.md` | MOVE | Plan ejecución piloto campo |
| 120 | `docs/INITIAL_CAPTURE_EVIDENCE.md` | `docs/capture/INITIAL_CAPTURE_EVIDENCE.md` | MOVE | Evidencia captura inicial |
| 121 | `docs/INITIAL_METADATA_AUDIT.md` | `docs/capture/INITIAL_METADATA_AUDIT.md` | MOVE | Auditoría metadata inicial |
| 122 | `docs/PILOT_ACCEPTANCE_CRITERIA.md` | `docs/capture/PILOT_ACCEPTANCE_CRITERIA.md` | MOVE | Criterios aceptación piloto |
| 123 | `docs/PILOT_CAPTURE_CHECKLIST.md` | `docs/capture/PILOT_CAPTURE_CHECKLIST.md` | MOVE | Checklist captura piloto |
| 124 | `docs/PILOT_REVIEW_CHECKLIST.md` | `docs/capture/PILOT_REVIEW_CHECKLIST.md` | MOVE | Checklist revisión piloto |
| 125 | `docs/UBTN_ADR_INDEX.md` | `docs/UBTN/UBTN_ADR_INDEX.md` | MOVE | Índice ADR UBTN |
| 126 | `docs/UBTN_AGGREGATE_DESIGN.md` | `docs/UBTN/UBTN_AGGREGATE_DESIGN.md` | MOVE | Diseño agregado UBTN |
| 127 | `docs/UBTN_ARCHITECTURE.md` | `docs/UBTN/UBTN_ARCHITECTURE.md` | MOVE | Arquitectura UBTN |
| 128 | `docs/UBTN_AUDIT_REVIEW.md` | `docs/UBTN/UBTN_AUDIT_REVIEW.md` | MOVE | Auditoría UBTN |
| 129 | `docs/UBTN_BBB_EDGE_GATEWAY.md` | `docs/UBTN/UBTN_BBB_EDGE_GATEWAY.md` | MOVE | Gateway edge BBB UBTN |
| 130 | `docs/UBTN_CONTEXT_MAP.md` | `docs/UBTN/UBTN_CONTEXT_MAP.md` | MOVE | Mapa contexto UBTN |
| 131 | `docs/UBTN_DATA_CONTRACTS.md` | `docs/UBTN/UBTN_DATA_CONTRACTS.md` | MOVE | Contratos datos UBTN |
| 132 | `docs/UBTN_DATABASE_EVOLUTION.md` | `docs/UBTN/UBTN_DATABASE_EVOLUTION.md` | MOVE | Evolución base de datos UBTN |
| 133 | `docs/UBTN_DOMAIN_MODEL.md` | `docs/UBTN/UBTN_DOMAIN_MODEL.md` | MOVE | Modelo dominio UBTN |
| 134 | `docs/UBTN_EDGE_AI_STRATEGY.md` | `docs/UBTN/UBTN_EDGE_AI_STRATEGY.md` | MOVE | Estrategia IA edge UBTN |
| 135 | `docs/UBTN_EVENT_STORMING.md` | `docs/UBTN/UBTN_EVENT_STORMING.md` | MOVE | Event storming UBTN |
| 136 | `docs/UBTN_FIELD_DEPLOYMENT_GUIDE.md` | `docs/UBTN/UBTN_FIELD_DEPLOYMENT_GUIDE.md` | MOVE | Guía despliegue campo UBTN |
| 137 | `docs/UBTN_FRONTEND_UX_STRATEGY.md` | `docs/UBTN/UBTN_FRONTEND_UX_STRATEGY.md` | MOVE | Estrategia UX frontend UBTN |
| 138 | `docs/UBTN_HARDWARE_ROADMAP.md` | `docs/UBTN/UBTN_HARDWARE_ROADMAP.md` | MOVE | Roadmap hardware UBTN |
| 139 | `docs/UBTN_INDEX.md` | `docs/UBTN/UBTN_INDEX.md` | MOVE | Índice UBTN |
| 140 | `docs/UBTN_LAB_INTEGRATION.md` | `docs/UBTN/UBTN_LAB_INTEGRATION.md` | MOVE | Integración laboratorio UBTN |
| 141 | `docs/UBTN_MQTT_ARCHITECTURE.md` | `docs/UBTN/UBTN_MQTT_ARCHITECTURE.md` | MOVE | Arquitectura MQTT UBTN |
| 142 | `docs/UBTN_OPERATIONS_RUNBOOK.md` | `docs/UBTN/UBTN_OPERATIONS_RUNBOOK.md` | MOVE | Runbook operaciones UBTN |
| 143 | `docs/UBTN_RESEARCH_BACKLOG.md` | `docs/UBTN/UBTN_RESEARCH_BACKLOG.md` | MOVE | Backlog investigación UBTN |
| 144 | `docs/UBTN_RESEARCH_GAPS.md` | `docs/UBTN/UBTN_RESEARCH_GAPS.md` | MOVE | Brechas investigación UBTN |
| 145 | `docs/UBTN_RISK_ANALYSIS.md` | `docs/UBTN/UBTN_RISK_ANALYSIS.md` | MOVE | Análisis riesgos UBTN |
| 146 | `docs/UBTN_ROADMAP.md` | `docs/UBTN/UBTN_ROADMAP.md` | MOVE | Roadmap UBTN |
| 147 | `docs/UBTN_SECURITY_MODEL.md` | `docs/UBTN/UBTN_SECURITY_MODEL.md` | MOVE | Modelo seguridad UBTN |
| 148 | `docs/UBTN_SENSOR_CATALOG.md` | `docs/UBTN/UBTN_SENSOR_CATALOG.md` | MOVE | Catálogo sensores UBTN |
| 149 | `docs/UBTN_TELEMETRY_EVOLUTION_STRATEGY.md` | `docs/UBTN/UBTN_TELEMETRY_EVOLUTION_STRATEGY.md` | MOVE | Estrategia evolución telemetría UBTN |
| 150 | `docs/UBTN_USE_CASES.md` | `docs/UBTN/UBTN_USE_CASES.md` | MOVE | Casos de uso UBTN |
| 151 | `docs/SIGCTIARURAL_CAPABILITIES_UX_REVIEW.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_CAPABILITIES_UX_REVIEW.md` | MOVE | Revisión capacidades UX |
| 152 | `docs/SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md` | MOVE | Capacidades vs hardware |
| 139 | `docs/SIGCTIARURAL_COMPONENT_MAP.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_COMPONENT_MAP.md` | MOVE | Mapa componentes |
| 140 | `docs/SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md` | MOVE | Matriz migración componentes |
| 141 | `docs/SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS.md` | MOVE | Análisis gap dashboard |
| 142 | `docs/SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md` | MOVE | Modelo navegación dashboard |
| 143 | `docs/SIGCTIARURAL_DASHBOARD_PARITY_REVIEW.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_DASHBOARD_PARITY_REVIEW.md` | MOVE | Revisión paridad dashboard |
| 144 | `docs/SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md` | MOVE | Dashboard reimaginado V2 |
| 145 | `docs/SIGCTIARURAL_DATASET_GOVERNANCE_IMPACT_REVIEW.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_DATASET_GOVERNANCE_IMPACT_REVIEW.md` | MOVE | Impacto gobernanza dataset |
| 146 | `docs/SIGCTIARURAL_DATASET_V2_BASELINE_FREEZE.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_BASELINE_FREEZE.md` | MOVE | Baseline freeze dataset V2 |
| 147 | `docs/SIGCTIARURAL_DATASET_V2_BUILD_PLAYBOOK.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_BUILD_PLAYBOOK.md` | MOVE | Playbook build dataset V2 |
| 148 | `docs/SIGCTIARURAL_DATASET_V2_EXECUTION_PLAN.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_EXECUTION_PLAN.md` | MOVE | Plan ejecución dataset V2 |
| 149 | `docs/SIGCTIARURAL_DATASET_V2_INVENTORY.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_INVENTORY.md` | MOVE | Inventario dataset V2 |
| 150 | `docs/SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` | MOVE | Masterplan dataset V2 |
| 151 | `docs/SIGCTIARURAL_DATASET_V2_MATERIALIZATION_PLAN.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_MATERIALIZATION_PLAN.md` | MOVE | Plan materialización dataset V2 |
| 152 | `docs/SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_AUDIT.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_AUDIT.md` | MOVE | Auditoría adquisición dataset V2+ |
| 153 | `docs/SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_ROADMAP.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_ROADMAP.md` | MOVE | Roadmap adquisición dataset V2+ |
| 154 | `docs/SIGCTIARURAL_DATASET_V2_PLUS_MVP.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_PLUS_MVP.md` | MOVE | MVP dataset V2+ |
| 155 | `docs/SIGCTIARURAL_DATASET_V2_READINESS_REPORT.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_READINESS_REPORT.md` | MOVE | Reporte alistamiento dataset V2 |
| 156 | `docs/SIGCTIARURAL_DATASET_V2_RECOVERY_CONSOLIDATION.md` | `docs/datasets/SIGCTIARURAL_DATASET_V2_RECOVERY_CONSOLIDATION.md` | MOVE | Recuperación consolidación dataset V2 |
| 157 | `docs/SIGCTIARURAL_DEPENDENCY_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_DEPENDENCY_AUDIT.md` | MOVE | Auditoría dependencias |
| 158 | `docs/SIGCTIARURAL_DEPENDENCY_DOWNGRADE_PREP.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_DEPENDENCY_DOWNGRADE_PREP.md` | MOVE | Preparación downgrade dependencia |
| 159 | `docs/SIGCTIARURAL_DEVICE_MAP_LINK_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_DEVICE_MAP_LINK_AUDIT.md` | MOVE | Auditoría mapa dispositivo enlace |
| 160 | `docs/SIGCTIARURAL_ECOSYSTEM_ALIGNMENT_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_ECOSYSTEM_ALIGNMENT_AUDIT.md` | MOVE | Auditoría alineación ecosistema |
| 161 | `docs/SIGCTIARURAL_ECOSYSTEM_CONSOLIDATION_AUDIT_v1.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_ECOSYSTEM_CONSOLIDATION_AUDIT_v1.md` | MOVE | Auditoría consolidación ecosistema |
| 162 | `docs/SIGCTIARURAL_ECOSYSTEM_DATA_GOVERNANCE_ALIGNMENT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_ECOSYSTEM_DATA_GOVERNANCE_ALIGNMENT.md` | MOVE | Alineación gobernanza datos ecosistema |
| 163 | `docs/SIGCTIARURAL_ECOSYSTEM_MATURITY_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_ECOSYSTEM_MATURITY_AUDIT.md` | MOVE | Auditoría madurez ecosistema |
| 164 | `docs/SIGCTIARURAL_ESTADO_SESION_2026-09-14.md` | `docs/historical/SIGCTIARURAL_ESTADO_SESION_2026-09-14.md` | MOVE | Estado sesión 2026-09-14 |
| 165 | `docs/SIGCTIARURAL_EVOLUTION_MATRIX.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_EVOLUTION_MATRIX.md` | MOVE | Matriz evolución |
| 166 | `docs/SIGCTIARURAL_F1_COMMIT_PLAN.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_F1_COMMIT_PLAN.md` | MOVE | Plan commit F1 |
| 167 | `docs/SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md` | MOVE | Primer sensor real F1 |
| 168 | `docs/SIGCTIARURAL_F1_PRECOMMIT_REVIEW.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_F1_PRECOMMIT_REVIEW.md` | MOVE | Revisión pre-commit F1 |
| 169 | `docs/SIGCTIARURAL_FRONTEND_ARCHITECTURE_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_FRONTEND_ARCHITECTURE_AUDIT.md` | MOVE | Auditoría arquitectura frontend |
| 170 | `docs/SIGCTIARURAL_FRONTEND_LOCAL_STRATEGY.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_FRONTEND_LOCAL_STRATEGY.md` | MOVE | Estrategia frontend local |
| 171 | `docs/SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md` | MOVE | Plan migración frontend |
| 172 | `docs/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT.md` | MOVE | Auditoría oficialización frontend |
| 173 | `docs/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_EXECUTION_PLAN.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_EXECUTION_PLAN.md` | MOVE | Plan ejecución oficialización frontend |
| 174 | `docs/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_PHASE1_REPORT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_PHASE1_REPORT.md` | MOVE | Reporte fase 1 oficialización frontend |
| 175 | `docs/SIGCTIARURAL_FRONTEND_PHASE2_READINESS_REPORT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_FRONTEND_PHASE2_READINESS_REPORT.md` | MOVE | Reporte alistamiento fase 2 frontend |
| 176 | `docs/SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md` | MOVE | Plan implementación catálogo hardware |
| 177 | `docs/SIGCTIARURAL_HARDWARE_CATALOG_REVIEW.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_HARDWARE_CATALOG_REVIEW.md` | MOVE | Revisión catálogo hardware |
| 178 | `docs/SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md` | MOVE | Modelo aprendizaje hardware |
| 179 | `docs/SIGCTIARURAL_HARDWARE_REGISTRY_ARCHITECTURE.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_HARDWARE_REGISTRY_ARCHITECTURE.md` | MOVE | Arquitectura registro hardware |
| 180 | `docs/SIGCTIARURAL_HEALTH_REPORT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_HEALTH_REPORT.md` | MOVE | Reporte salud |
| 181 | `docs/SIGCTIARURAL_IMPLEMENTATION_READINESS.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_IMPLEMENTATION_READINESS.md` | MOVE | Alistamiento implementación |
| 182 | `docs/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` | `docs/bounded-contexts/laboratory/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` | MOVE | Modelo conectividad laboratorio |
| 183 | `docs/SIGCTIARURAL_LAB_PRESERVATION_STRATEGY.md` | `docs/bounded-contexts/laboratory/SIGCTIARURAL_LAB_PRESERVATION_STRATEGY.md` | MOVE | Estrategia preservación laboratorio |
| 184 | `docs/SIGCTIARURAL_LEARNING_LAYER_ARCHITECTURE.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_LEARNING_LAYER_ARCHITECTURE.md` | MOVE | Arquitectura capa aprendizaje |
| 185 | `docs/SIGCTIARURAL_MIGRATION_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_MIGRATION_AUDIT.md` | MOVE | Auditoría migración |
| 186 | `docs/SIGCTIARURAL_MULTIDATASET_FEASIBILITY_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_MULTIDATASET_FEASIBILITY_AUDIT.md` | MOVE | Auditoría factibilidad multidataset |
| 187 | `docs/SIGCTIARURAL_NAVIGATION_EVOLUTION.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_NAVIGATION_EVOLUTION.md` | MOVE | Evolución navegación |
| 188 | `docs/SIGCTIARURAL_PAGE_MAPPING.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_PAGE_MAPPING.md` | MOVE | Mapeo páginas |
| 189 | `docs/SIGCTIARURAL_PHASE0_EXECUTION_CHECKLIST.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_PHASE0_EXECUTION_CHECKLIST.md` | MOVE | Checklist ejecución fase 0 |
| 190 | `docs/SIGCTIARURAL_PHASE0_EXECUTION_GUIDE.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_PHASE0_EXECUTION_GUIDE.md` | MOVE | Guía ejecución fase 0 |
| 191 | `docs/SIGCTIARURAL_PHASE0_READYCHECK.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_PHASE0_READYCHECK.md` | MOVE | Readycheck fase 0 |
| 192 | `docs/SIGCTIARURAL_PLANTVILLAGE_RECOVERY_PLAN.md` | `docs/datasets/SIGCTIARURAL_PLANTVILLAGE_RECOVERY_PLAN.md` | MOVE | Plan recuperación PlantVillage |
| 193 | `docs/SIGCTIARURAL_PRESERVATION_AUDIT.md` | `docs/historical/SIGCTIARURAL_PRESERVATION_AUDIT.md` | MOVE | Auditoría preservación |
| 194 | `docs/SIGCTIARURAL_PRESERVATION_STRATEGY.md` | `docs/historical/SIGCTIARURAL_PRESERVATION_STRATEGY.md` | MOVE | Estrategia preservación |
| 195 | `docs/SIGCTIARURAL_RC1_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_RC1_AUDIT.md` | MOVE | Auditoría RC1 |
| 196 | `docs/SIGCTIARURAL_RC2_CONSOLIDATION.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_RC2_CONSOLIDATION.md` | KEEP | Consolidación RC2 |
| 197 | `docs/SIGCTIARURAL_RC2_FREEZE.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_RC2_FREEZE.md` | KEEP | Freeze RC2 |
| 198 | `docs/SIGCTIARURAL_RC2_READINESS.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_RC2_READINESS.md` | KEEP | Alistamiento RC2 |
| 199 | `docs/SIGCTIARURAL_REFACTORING_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_REFACTORING_AUDIT.md` | MOVE | Auditoría refactorización |
| 200 | `docs/SIGCTIARURAL_REFACTORING_GUARDRAILS.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_REFACTORING_GUARDRAILS.md` | MOVE | Guardrails refactorización |
| 201 | `docs/SIGCTIARURAL_RESEARCH_EXPERIMENTATION_LAYER.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_RESEARCH_EXPERIMENTATION_LAYER.md` | MOVE | Capa experimentación investigación |
| 202 | `docs/SIGCTIARURAL_RESEARCH_PRODUCTION_LAYER.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_RESEARCH_PRODUCTION_LAYER.md` | MOVE | Capa producción investigación |
| 203 | `docs/SIGCTIARURAL_RESEARCH_PRODUCTION_VISION.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_RESEARCH_PRODUCTION_VISION.md` | MOVE | Visión producción investigación |
| 204 | `docs/SIGCTIARURAL_ROUTE_EVOLUTION.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_ROUTE_EVOLUTION.md` | MOVE | Evolución rutas |
| 205 | `docs/SIGCTIARURAL_STATE_SYNC_REPORT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_STATE_SYNC_REPORT.md` | MOVE | Reporte sincronización estado |
| 206 | `docs/SIGCTIARURAL_STRATEGIC_ACCELERATION.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_STRATEGIC_ACCELERATION.md` | MOVE | Aceleración estratégica |
| 207 | `docs/SIGCTIARURAL_U1_0_BASELINE.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_U1_0_BASELINE.md` | MOVE | Línea base U1.0 |
| 208 | `docs/SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md` | MOVE | Resolución bloqueadores U1 |
| 209 | `docs/SIGCTIARURAL_U1_BOOTSTRAP.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_U1_BOOTSTRAP.md` | MOVE | Bootstrap U1 |
| 210 | `docs/SIGCTIARURAL_U1_GO_NO_GO.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_U1_GO_NO_GO.md` | MOVE | Go/No-Go U1 |
| 211 | `docs/SIGCTIARURAL_U1_REVIEW.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_U1_REVIEW.md` | MOVE | Revisión U1 |
| 212 | `docs/SIGCTIARURAL_U2_1_EXECUTIVE_LAYER.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_U2_1_EXECUTIVE_LAYER.md` | MOVE | Capa ejecutiva U2.1 |
| 213 | `docs/SIGCTIARURAL_U3_5_UX_REVIEW.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_U3_5_UX_REVIEW.md` | MOVE | Revisión UX U3.5 |
| 214 | `docs/SIGCTIARURAL_U4_2_CONTENT_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_U4_2_CONTENT_AUDIT.md` | MOVE | Auditoría contenido U4.2 |
| 215 | `docs/SIGCTIARURAL_UX_03_NAVIGATION_AUDIT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_UX_03_NAVIGATION_AUDIT.md` | MOVE | Auditoría navegación UX 03 |
| 216 | `docs/SIGCTIARURAL_VISION_ALIGNMENT.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_VISION_ALIGNMENT.md` | MOVE | Alineación visión |
| 217 | `docs/SIGCT_MEMORY_F01_EMBEDDING_STRATEGY.md` | `docs/ai/SIGCT_MEMORY_F01_EMBEDDING_STRATEGY.md` | MOVE | Estrategia embedding F01 |
| 218 | `docs/SIGCT_MEMORY_F02_QDRANT_ARCHITECTURE.md` | `docs/ai/SIGCT_MEMORY_F02_QDRANT_ARCHITECTURE.md` | MOVE | Arquitectura Qdrant F02 |
| 219 | `docs/SIGCT_MEMORY_F03_QUERY_ARCHITECTURE.md` | `docs/ai/SIGCT_MEMORY_F03_QUERY_ARCHITECTURE.md` | MOVE | Arquitectura consulta F03 |
| 220 | `docs/SIGCT_MEMORY_F04_DOMAIN_MODEL.md` | `docs/ai/SIGCT_MEMORY_F04_DOMAIN_MODEL.md` | MOVE | Modelo dominio F04 |
| 221 | `docs/SIGCT_MEMORY_F05_API_ARCHITECTURE.md` | `docs/ai/SIGCT_MEMORY_F05_API_ARCHITECTURE.md` | MOVE | Arquitectura API F05 |
| 222 | `docs/SIGCT_MEMORY_F06_5_STAGING_MODEL.md` | `docs/ai/SIGCT_MEMORY_F06_5_STAGING_MODEL.md` | MOVE | Modelo staging F06.5 |
| 223 | `docs/SIGCT_MEMORY_F06_IMPLEMENTATION_PLAN.md` | `docs/ai/SIGCT_MEMORY_F06_IMPLEMENTATION_PLAN.md` | MOVE | Plan implementación F06 |
| 224 | `docs/SIGCT_MEMORY_IMPLEMENTATION_01.md` | `docs/ai/SIGCT_MEMORY_IMPLEMENTATION_01.md` | MOVE | Implementación memoria 01 |
| 225 | `docs/SIGCT_MEMORY_IMPLEMENTATION_READINESS_REPORT.md` | `docs/ai/SIGCT_MEMORY_IMPLEMENTATION_READINESS_REPORT.md` | MOVE | Reporte alistamiento implementación memoria |
| 226 | `docs/SIGCT_MEMORY_M0_DECISION_ACTA.md` | `docs/ai/SIGCT_MEMORY_M0_DECISION_ACTA.md` | MOVE | Acta decisión M0 memoria |
| 227 | `docs/SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md` | `docs/ai/SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md` | MOVE | Masterplan ejecución memoria V1 |
| 228 | `docs/SIGCTIARUAL_DESIGN_PARITY_AUDIT.md` | `docs/ai/SIGCTIARUAL_DESIGN_PARITY_AUDIT.md` | MOVE | Auditoría paridad diseño |
| 229 | `docs/SIGCTIARUAL_HARDWARE_DETAIL_LAYER.md` | `docs/ai/SIGCTIARUAL_HARDWARE_DETAIL_LAYER.md` | MOVE | Capa detalle hardware |
| 230 | `docs/SIGCTIARUAL_U2_3_DEVICE_MAP.md` | `docs/ai/SIGCTIARUAL_U2_3_DEVICE_MAP.md` | MOVE | Mapa dispositivo U2.3 |
| 231 | `docs/SIGCTIARUAL_U2_ROADMAP_DECISION.md` | `docs/ai/SIGCTIARUAL_U2_ROADMAP_DECISION.md` | MOVE | Decisión roadmap U2 |
| 232 | `docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md` | `docs/ai/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md` | MOVE | Estado del arte IA/ML |
| 233 | `docs/SIGCTIARURAL_AI_ONBOARDING_GUIDE.md` | `docs/ai/SIGCTIARURAL_AI_ONBOARDING_GUIDE.md` | MOVE | Guía onboarding IA |
| 234 | `docs/SIGCTIARURAL_AI_RECOVERY_PLAN.md` | `docs/ai/SIGCTIARURAL_AI_RECOVERY_PLAN.md` | MOVE | Plan recuperación IA |
| 235 | `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` | `docs/ai/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` | MOVE | Auditoría forense IA V5 |
| 236 | `docs/SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT.md` | `docs/ai/SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT.md` | MOVE | Auditoría reconciliación arquitectura |
| 237 | `docs/SIGCTIARURAL_BBB_TELEMETRY_READINESS.md` | `docs/bounded-contexts/telemetry/SIGCTIARURAL_BBB_TELEMETRY_READINESS.md` | MOVE | Alistamiento telemetría BBB |
| 238 | `docs/SIGCTIARURAL_BBB03_DEPLOYMENT_GUIDE.md` | `docs/bounded-contexts/telemetry/SIGCTIARURAL_BBB03_DEPLOYMENT_GUIDE.md` | MOVE | Guía despliegue BBB03 |
| 239 | `docs/SIGCTIARURAL_BBB03_EXECUTION_PLAYBOOK.md` | `docs/bounded-contexts/telemetry/SIGCTIARURAL_BBB03_EXECUTION_PLAYBOOK.md` | MOVE | Playbook ejecución BBB03 |
| 240 | `docs/SIGCTIARURAL_BENCHMARK_V1_EXECUTION_PLAYBOOK.md` | `docs/bounded-contexts/ai-runtime/SIGCTIARURAL_BENCHMARK_V1_EXECUTION_PLAYBOOK.md` | MOVE | Playbook ejecución benchmark V1 |
| 241 | `docs/SIGCTIARURAL_BENCHMARK_V1_PLAN.md` | `docs/bounded-contexts/ai-runtime/SIGCTIARURAL_BENCHMARK_V1_PLAN.md` | MOVE | Plan benchmark V1 |
| 242 | `docs/SIGCTIARURAL_CANONICAL_ENGINEERING_REVIEW.md` | `docs/bounded-contexts/identity/SIGCTIARURAL_CANONICAL_ENGINEERING_REVIEW.md` | MOVE | Revisión ingeniería canónica |
| 243 | `docs/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` | `docs/bounded-contexts/laboratory/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` | MOVE | Modelo conectividad laboratorio |
| 244 | `docs/SIGCTIARURAL_LAB_PRESERVATION_STRATEGY.md` | `docs/bounded-contexts/laboratory/SIGCTIARURAL_LAB_PRESERVATION_STRATEGY.md` | MOVE | Estrategia preservación laboratorio |
| 245 | `docs/AGENTS.md` | `docs/AGENTS.md` | KEEP | Identidad y cadencias del proyecto (raíz) |

---

## Documentos de `Documentacion/` a migrar

| # | Archivo actual | Ubicación destino | Acción | Justificación |
|---|---|---|---|---|
| 246 | `Documentacion/Arquitectura/CMSC_CANONICAL_STATE_v1.md` | `docs/state/CMSC_CANONICAL_STATE_v1.md` | MOVE | Estado canónico CMSC, único en Documentacion/ |
| 247 | `Documentacion/Arquitectura/CMSC_CANONICAL_STATES_APPENDIX_V1.md` | `docs/state/CMSC_CANONICAL_STATES_APPENDIX_V1.md` | MOVE | Apéndice estados canónicos CMSC |
| 248 | `Documentacion/Arquitectura/CMSC_MASTERPLAN_v1.md` | `docs/bounded-contexts/cmsc/CMSC_MASTERPLAN_v1.md` | MOVE | Masterplan CMSC |
| 249 | `Documentacion/Arquitectura/CMSC_ORCHESTRATION_V2_DESIGN.md` | `docs/bounded-contexts/cmsc/CMSC_ORCHESTRATION_V2_DESIGN.md` | MOVE | Diseño orquestación V2 CMSC |
| 250 | `Documentacion/Arquitectura/CMSC_SIGNAL_MAP_v1.md` | `docs/bounded-contexts/cmsc/CMSC_SIGNAL_MAP_v1.md` | MOVE | Mapa de señales CMSC |
| 251 | `Documentacion/Arquitectura/CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md` | `docs/bounded-contexts/cmsc/CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md` | MOVE | Inventario activos ecosistema CMSC |
| 252 | `Documentacion/Arquitectura/CMSC_IMPLEMENTATION_SNAPSHOT_PROCEDURE.md` | `docs/bounded-contexts/cmsc/CMSC_IMPLEMENTATION_SNAPSHOT_PROCEDURE.md` | MOVE | Procedimiento snapshot implementación CMSC |
| 253 | `Documentacion/Arquitectura/SIGNAL_REGISTRY_V1_OPERATIONAL_PROCEDURE.md` | `docs/bounded-contexts/cmsc/SIGNAL_REGISTRY_V1_OPERATIONAL_PROCEDURE.md` | MOVE | Procedimiento operativo registro de señales |
| 254 | `Documentacion/Arquitectura/SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | `docs/historical/SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | MOVE | Auditoría forense ecosistema (único en Documentacion/) |
| 255 | `Documentacion/Arquitectura/FRONTEND_EXECUTION_STRATEGY.md` | `docs/deployment/FRONTEND_EXECUTION_STRATEGY.md` | MOVE | Estrategia ejecución frontend |
| 256 | `Documentacion/Arquitectura/CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` | `docs/bounded-contexts/cmsc/CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` | MOVE | Revisión alistamiento implementación CMSC |
| 257 | `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` | `docs/bounded-contexts/ai-runtime/ESTADO_ACTUAL_BENCHMARKS.md` | MOVE | Estado actual benchmarks (único en Documentacion/IA/) |
| 258 | `Documentacion/IA/Benchmark_M1_MobileNetV2/CORRECCIONES_PARA_M2.md` | `docs/bounded-contexts/ai-runtime/benchmark-m1-m2/CORRECCIONES_PARA_M2.md` | MOVE | Correcciones para M2 |
| 259 | `Documentacion/IA/Benchmark_M1_MobileNetV2/EVIDENCIA_EJECUCION_M1.md` | `docs/bounded-contexts/ai-runtime/benchmark-m1-m2/EVIDENCIA_EJECUCION_M1.md` | MOVE | Evidencia ejecución M1 |
| 260 | `Documentacion/IA/Benchmark_M1_MobileNetV2/INFORME_TECNICO_CIENTIFICO_M1_APA7.md` | `docs/bounded-contexts/ai-runtime/benchmark-m1-m2/INFORME_TECNICO_CIENTIFICO_M1_APA7.md` | MOVE | Informe técnico científico M1 |
| 261 | `Documentacion/IA/Benchmark_M1_MobileNetV2/MASTERDOC_EXPERIMENTO_M1.md` | `docs/bounded-contexts/ai-runtime/benchmark-m1-m2/MASTERDOC_EXPERIMENTO_M1.md` | MOVE | Masterdoc experimento M1 |
| 262 | `Documentacion/IA/Benchmark_M1_MobileNetV2/README.md` | `docs/bounded-contexts/ai-runtime/benchmark-m1-m2/README.md` | MOVE | README benchmark M1 |
| 263 | `Documentacion/IA/Benchmark_M1_MobileNetV2/TABLA_COMPARATIVA_M1_M5.md` | `docs/bounded-contexts/ai-runtime/benchmark-m1-m2/TABLA_COMPARATIVA_M1_M5.md` | MOVE | Tabla comparativa M1-M5 |
| 264 | `Documentacion/IA/AUDITORIA_BENCHMARK_SRC_FALLBACK.md` | `docs/bounded-contexts/ai-runtime/AUDITORIA_BENCHMARK_SRC_FALLBACK.md` | MOVE | Auditoría fallback fuente benchmark |

---

## Documentos únicos en `Documentacion/` sin equivalente en `docs/`

Los siguientes 22 documentos existen **únicamente** en `Documentacion/` y no tienen equivalente en `docs/`. Deben migrarse para evitar pérdida de información:

| # | Archivo | Contenido único | Destino |
|---|---|---|---|
| 1 | `CMSC_CANONICAL_STATE_v1.md` | Estado canónico CMSC | `docs/state/` |
| 2 | `CMSC_CANONICAL_STATES_APPENDIX_V1.md` | Apéndice estados CMSC | `docs/state/` |
| 3 | `CMSC_MASTERPLAN_v1.md` | Masterplan CMSC | `docs/bounded-contexts/cmsc/` |
| 4 | `CMSC_ORCHESTRATION_V2_DESIGN.md` | Diseño orquestación V2 | `docs/bounded-contexts/cmsc/` |
| 5 | `CMSC_SIGNAL_MAP_v1.md` | Mapa señales CMSC | `docs/bounded-contexts/cmsc/` |
| 6 | `CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md` | Inventario activos CMSC | `docs/bounded-contexts/cmsc/` |
| 7 | `CMSC_IMPLEMENTATION_SNAPSHOT_PROCEDURE.md` | Procedimiento snapshot | `docs/bounded-contexts/cmsc/` |
| 8 | `SIGNAL_REGISTRY_V1_OPERATIONAL_PROCEDURE.md` | Procedimiento registro señales | `docs/bounded-contexts/cmsc/` |
| 9 | `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | Auditoría forense ecosistema | `docs/historical/` |
| 10 | `FRONTEND_EXECUTION_STRATEGY.md` | Estrategia frontend | `docs/deployment/` |
| 11 | `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` | Alistamiento implementación CMSC | `docs/bounded-contexts/cmsc/` |
| 12 | `ESTADO_ACTUAL_BENCHMARKS.md` | Estado actual benchmarks | `docs/bounded-contexts/ai-runtime/` |
| 13-22 | `Benchmark_M1_MobileNetV2/*` (10 archivos) | Benchmark M1/M2 detallado | `docs/bounded-contexts/ai-runtime/benchmark-m1-m2/` |
| 23 | `AUDITORIA_BENCHMARK_SRC_FALLBACK.md` | Auditoría fallback fuente | `docs/bounded-contexts/ai-runtime/` |

---

## Resumen de acciones

| Acción | Cantidad |
|---|---|
| KEEP | 46 |
| MOVE | 195 |
| ARCHIVE | 15 |
| MERGE | 0 (pendiente de revisión de duplicados temáticos) |
| DELETE_CANDIDATE | 1 (`Documentacion/` directorio raíz vacío después de migración) |

---

**Archivo generado:** `docs/DOCUMENTATION_MIGRATION_MATRIX.md`

Sin ejecutar acciones. Sin mover archivos. Sin modificar repositorio. Sin acciones Git.
