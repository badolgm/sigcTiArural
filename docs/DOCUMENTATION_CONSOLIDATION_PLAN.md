# DOCUMENTATION_CONSOLIDATION_PLAN

**Misión:** propuesta concreta de consolidación documental basada en `DOCUMENTATION_GOVERNANCE_REVIEW.md`.
**Fecha:** 2026-11-04.
**Restricciones:** no se mueven archivos, no se borran archivos, no se hace commit, no se hace push, no se modifica código. Este documento es únicamente una propuesta (plan de ejecución futura, sujeto a orden explícita de Bernardo).

## 0. Reglas de la propuesta

1. **No se elimina información.** Todo contenido de los documentos a fusionar/archivar se preserva en el receptor o se mantiene in situ (solo se cambia su rol).
2. **No se mueven archivos físicamente.** "Ubicación destino" indica el rol lógico; los archivos permanecen en `docs/` hasta una misión posterior con autorización.
3. **`KEEP`** = permanece como canónico, sin cambios de ubicación.
4. **`MERGE`** = su contenido se absorbe en el documento receptor; el original se marca como "fusionado" (no se borra).
5. **`ARCHIVE`** = se conserva in situ pero se reclasifica como histórico (cabecera `ARCHIVED`); no se usa como fuente viva.
6. **`OBSOLETE`** = no aporta valor; candidato a eliminación futura solo con autorización explícita.

## 1. Cluster L1-L6 (procedencia/modelo IA)

| # | Documento actual | Ubicación actual | Clasificación | Ubicación destino / rol | Documento receptor | Información preservada |
|---|---|---|---|---|---|---|
| 1 | `L1_L6_EXECUTION_PLAN.md` | `docs/L1_L6_EXECUTION_PLAN.md` | **MERGE** | Permanece in situ; rol = "plan histórico" | `docs/L1_L6_EXECUTION_REPORT.md` | V-1..V-19, AC-L1..AC-L14, criterios de aceptación, parche exacto pendiente (§6.2), riesgos R-L1..R-L14. |
| 2 | `L1_L6_EXECUTION_REPORT.md` | `docs/L1_L6_EXECUTION_REPORT.md` | **KEEP** | Canónico del cluster L1-L6 | (ninguno) | Ejecución realizada, cambios por archivo, enmiendas, deuda residual, anexos A/B. **Actualizar:** sección "Decisiones aprobadas D-L1..D-L3" + AC-L6/AC-L8 ahora PASS. |
| 3 | `L1_L6_RUNTIME_DISCLOSURE_PLAN.md` | `docs/L1_L6_RUNTIME_DISCLOSURE_PLAN.md` | **MERGE** | Permanece in situ; rol = "plan de disclosure histórico" | `docs/L1_L6_RUNTIME_VERIFICATION_REPORT.md` | Tabla de decisiones D-L1..D-L4, análisis de vocabulario, plan de disclosure, dependencias. |
| 4 | `L1_L6_RUNTIME_VERIFICATION_REPORT.md` | `docs/L1_L6_RUNTIME_VERIFICATION_REPORT.md` | **KEEP** | Canónico de verificación runtime | (ninguno) | V-10..V-19 con evidencia, 11 puntos de comprobación, AC-L1..AC-L14. **Actualizar:** V-17/V-18 → PASS, clasificación → `VERIFIED`. |
| 5 | `CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` | `docs/CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` | **KEEP** | Canónico de alineación CMSC | (ninguno) | Cambios exactos en `ModelPredictCell.jsx`, cierre AC-L6/AC-L8, validación no-rotura. |
| 6 | `PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md` | `docs/PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md` | **KEEP** | Canónico de procedencia del modelo | (ninguno) | Procedencia del artefacto `.h5`, SHA-256, `KNOWN_ARTIFACTS`, `status_alias`. |

## 2. Cluster Docker-ready (validación runtime)

| # | Documento actual | Ubicación actual | Clasificación | Ubicación destino / rol | Documento receptor | Información preservada |
|---|---|---|---|---|---|---|
| 7 | `DOCKER_READY_FINAL_DECISION_REPORT.md` | `docs/DOCKER_READY_FINAL_DECISION_REPORT.md` | **KEEP** | Canónico de decisión final Docker | (ninguno) | Decisión final de readiness Docker. |
| 8 | `DOCKER_READY_CLOSURE_REPORT.md` | `docs/DOCKER_READY_CLOSURE_REPORT.md` | **KEEP** | Canónico de cierre | (ninguno) | Cierre de criterios C-1..C-5, O-2..O-5. |
| 9 | `DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` | `docs/DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` | **ARCHIVE** | Permanece in situ; rol = "decisión intermedia" | `docs/DOCKER_READY_FINAL_DECISION_REPORT.md` | Criterios C-1..C-5, O-2..O-5 (absorbidos en el final). |
| 10 | `DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT.md` | `docs/DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT.md` | **ARCHIVE** | Permanece in situ; rol = "revisión de bloqueadores" | `docs/L1_L6_RUNTIME_VERIFICATION_REPORT.md` | Bloqueadores y su resolución. |
| 11 | `DOCKER_OFFICIAL_EXECUTION_PLAN.md` | `docs/DOCKER_OFFICIAL_EXECUTION_PLAN.md` | **ARCHIVE** | Permanece in situ; rol = "plan de ejecución oficial" | `docs/DOCKER_READY_FINAL_DECISION_REPORT.md` | Plan de ejecución Docker. |
| 12 | `DOCKER_READY_REMEDIATION_PLAN.md` | `docs/DOCKER_READY_REMEDIATION_PLAN.md` | **ARCHIVE** | Permanece in situ; rol = "plan de remediación" | `docs/DOCKER_READY_CLOSURE_REPORT.md` | Remediaciones aplicadas. |
| 13 | `DOCKER_READY_R1_R4_EXECUTION_PLAN.md` | `docs/DOCKER_READY_R1_R4_EXECUTION_PLAN.md` | **ARCHIVE** | Permanece in situ; rol = "plan R1-R4" | `docs/DOCKER_READY_CLOSURE_REPORT.md` | Plan de remediación R1-R4. |
| 14 | `DOCKER_READY_R1_R4_REPORT.md` | `docs/DOCKER_READY_R1_R4_REPORT.md` | **ARCHIVE** | Permanece in situ; rol = "reporte R1-R4" | `docs/DOCKER_READY_CLOSURE_REPORT.md` | Resultados R1-R4. |
| 15 | `PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` | `docs/PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` | **ARCHIVE** | Permanece in situ; rol = "validación visual previa" | `docs/VISUAL_VALIDATION_FINAL_REPORT.md` | Validación visual pre-Docker. |
| 16 | `VISUAL_VALIDATION_FINAL_REPORT.md` | `docs/VISUAL_VALIDATION_FINAL_REPORT.md` | **MERGE** | Permanece in situ; rol = "validación visual" | `docs/L1_L6_RUNTIME_VERIFICATION_REPORT.md` | Capturas y verificación visual V-17. |

## 3. Cluster de evidencia/arquitectura

| # | Documento actual | Ubicación actual | Clasificación | Ubicación destino / rol | Documento receptor | Información preservada |
|---|---|---|---|---|---|---|
| 17 | `ARCHITECTURE_EVIDENCE_FREEZE_REPORT.md` | `docs/ARCHITECTURE_EVIDENCE_FREEZE_REPORT.md` | **ARCHIVE** | Permanece in situ; rol = "freeze de evidencia" | `docs/CANONICAL_DOCUMENTATION_ALIGNMENT.md` | Freeze de evidencia arquitectónica. |
| 18 | `CANONICAL_DOCUMENTATION_ALIGNMENT.md` | `docs/CANONICAL_DOCUMENTATION_ALIGNMENT.md` | **KEEP** | Canónico de alineación documental | (ninguno) | Alineación canónica de documentación. |

## 4. Integración ASUS ↔ Toshiba (2026-11-04)

| # | Documento actual | Ubicación actual | Clasificación | Ubicación destino / rol | Documento receptor | Información preservada |
|---|---|---|---|---|---|---|
| 24 | `ARCHITECTURE_AUDIT_VALIDATION.md` | Sprint Toshiba | **KEEP** | Canónico de validación arquitectura | `docs/architecture/` | Evidencia técnica de validación de arquitectura. |
| 25 | `ARCHITECTURE_ACTION_MATRIX.md` | Sprint Toshiba | **KEEP** | Canónico de matriz de acciones | `docs/architecture/` | Matriz de priorización y trazabilidad. |
| 26 | `ARCHITECTURE_ACTION_REVIEW.md` | Sprint Toshiba | **KEEP** | Canónico de revisión de acciones | `docs/architecture/` | Registro de cumplimiento y cierre. |
| 27 | `C02_EXECUTION_PACKAGE.md` | Sprint Toshiba | **KEEP** | Canónico de paquete ejecución C-02 | `docs/architecture/` | Paquete de ejecución de C-02. |
| 28 | `C02_IMPLEMENTATION_STRATEGY.md` | Sprint Toshiba | **MERGE** | Absorbido en `HEXAGONAL_REFACTOR_PLAN.md` | `docs/HEXAGONAL_REFACTOR_PLAN.md` | Estrategia de implementación de C-02. |
| 29 | `ARCHITECTURE_AUDIT.md` | Sprint Toshiba | **ARCHIVE** | Permanecer in situ; rol histórico | Sitio actual | Auditoría completada — evidencia histórica. |
| 30 | `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | Sprint Toshiba | **ARCHIVE** | Permanecer in situ; rol cierre sprint | Sitio actual | Cierre administrativo del sprint. |
| 31 | `DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | Sprint Toshiba | **ARCHIVE** | Permanecer in situ; rol normalización completada | Sitio actual | Normalización de lenguaje documental. |
| 32 | `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | Sprint Toshiba | **ARCHIVE** | Permanecer in situ; rol remediación completada | Sitio actual | Reporte de remediación de lenguaje. |
| 33 | `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | Sprint Toshiba | **ARCHIVE** | Permanecer in situ; rol revisión consolidación | Sitio actual | Consolidación de conocimiento del sprint. |
| 34 | `TOSHIBA_EXPORT_MANIFEST.md` | Sprint Toshiba | **ARCHIVE** | Permanecer in situ; rol manifiesto exportación | Sitio actual | Manifiesto de paquetes exportados. |
| 35 | `TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | Sprint Toshiba | **ARCHIVE** | Permanecer in situ; rol plan ejecución | Sitio actual | Plan de ejecución de la consolidación. |
| 36 | `ARCHITECTURE_GOVERNANCE_REVIEW.md` | Fuera de GitHub | **LOCAL_EVIDENCE_ONLY** | Sin publicación GitHub; uso interno | Evidencia local | Revisión de gobernanza del sprint. |

## 5. Documentos de gobernanza (referencia, no se tocan)

| # | Documento actual | Ubicación actual | Clasificación | Ubicación destino / rol | Documento receptor | Información preservada |
|---|---|---|---|---|---|---|
| 25 | `AGENTS.md` | `AGENTS.md` (raíz) | **KEEP** | Canónico del proyecto | (ninguno) | Identidad, estado git, decisiones, cadencias. |
| 26 | `DOCUMENTATION_GOVERNANCE_REVIEW.md` | `docs/DOCUMENTATION_GOVERNANCE_REVIEW.md` | **KEEP** | Canónico de gobernanza | (ninguno) | Clasificación KEEP/MERGE/ARCHIVE/OBSOLETE. |
| 27 | `DOCUMENTATION_CONSOLIDATION_PLAN.md` | `docs/DOCUMENTATION_CONSOLIDATION_PLAN.md` | **KEEP** | Canónico de consolidación | (ninguno) | Esta propuesta. |

## 6. Nota de ejecución

- Ningún archivo se mueve ni se borra en esta misión.
- Las fusiones (`MERGE`) y archivados (`ARCHIVE`) requieren una misión posterior con autorización explícita de Bernardo.
- Los documentos `OBSOLETE` requieren confirmación antes de eliminación.
- El resto de `docs/` (CMSC, acústico, UBTN, datasets, etc.) se mantiene bajo sus documentos canónicos existentes y no se reclasifica aquí.

## 7. Restricciones respetadas

- Sin commit, sin push, sin merge, sin modificar código.
- Sin mover ni borrar archivos.
- Sin generar documentación nueva innecesaria (solo este archivo).
- HEAD `d930a34`; `stash@{0}` intacto.
