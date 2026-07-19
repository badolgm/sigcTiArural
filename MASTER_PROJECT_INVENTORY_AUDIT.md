# MASTER PROJECT INVENTORY AUDIT

## Fecha

2026-07-15

## Objetivo

Realizar un inventario maestro completo del repositorio SIGCT-Rural, clasificando documentos, artefactos tecnicos, componentes de software y evidencias existentes o faltantes, sin proponer soluciones ni generar planificacion adicional.

## Alcance y metodo

- Analisis estatico del repositorio completo.
- Revision de `src/`, `docs/`, `config/`, `scripts/` y documentos raiz.
- Conteo de artefactos Markdown/Mermaid y contraste con documentos de verdad y matrices de evidencia ya existentes.
- Verificacion de duplicados exactos mediante hash SHA-256 sobre `*.md` y `*.mmd`.

## Panorama general verificable

- Artefactos Markdown/Mermaid detectados: `68`
  - Markdown: `58`
  - Mermaid: `10`
- El repositorio contiene una base documental amplia en `docs/`, una base de conocimiento formal en `docs/project_knowledge_base/`, una linea arquitectonica EIARC en `docs/eiarc/`, y varios artefactos raiz de auditoria, respaldo y cierre.
- El arbol de trabajo contiene cambios locales y documentos de cierre no versionados todavia, visibles en `git status --short`.

## 1. Documentos existentes

### 1.1 Raiz del repositorio

- `README.md`
- `README_REALITY_CHECK.md`
- `INDICE_PROYECTO.md`
- `HANDOFF_TRAE_sigcTiArual.md`
- `TRAE_INDEPENDENT_REPOSITORY_AUDIT.md`
- `TRAE_AI_INTEGRATION_AUDIT.md`
- `PROJECT_ARCHIVE_MANIFEST.md`
- `PROJECT_RECORDS_REGISTER.md`
- `DOCUMENT_RETENTION_POLICY.md`
- `PROJECT_STRUCTURE_SNAPSHOT.md`
- `PROJECT_BACKUP_MANIFEST.md`
- `BACKUP_CONTENT_INDEX.md`
- `BACKUP_VERIFICATION_REPORT.md`
- `debug-ai-model-loader.md`

### 1.2 Documentacion estructurada en `docs/`

- `docs/MASTERDOC.md`
- `docs/PLAN_MAESTRO.md`
- `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`
- `docs/API_REFERENCE.md`
- `docs/AI_PIPELINE.md`
- `docs/CONTINUITY_RUNBOOK.md`
- `docs/DEPLOYMENT.md`
- `docs/DEPLOYMENT_AWS.md`
- `docs/EDGE_SETUP.md`
- `docs/HEXAGONAL_REFACTOR_PLAN.md`
- `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md`
- `docs/architect_master/` con 8 documentos maestros
- `docs/project_knowledge_base/` con 6 KB
- `docs/eiarc/` con 26 artefactos entre fundacion, arquitectura y diagramas
- `docs/diagrams/`, `docs/uml/`, `docs/database/`, `docs/reports/`, `docs/edge/`, `docs/architecture/`, `docs/sena_artifacts/`, `docs/session_plans/`

## 2. Documentos duplicados

### 2.1 Duplicados exactos

No se detectaron duplicados exactos entre `*.md` y `*.mmd` por hash SHA-256.

### 2.2 Duplicados funcionales o derivados

Se detectaron familias documentales derivadas, no duplicados exactos:

- `TRAE_INDEPENDENT_REPOSITORY_AUDIT.md` y `docs/project_knowledge_base/KB-001-TRAE-INDEPENDENT-REPOSITORY-AUDIT.md`
  - Evidencia: `KB-001` declara como fuente `TRAE_INDEPENDENT_REPOSITORY_AUDIT.md`.
- `README_REALITY_CHECK.md` y `docs/project_knowledge_base/KB-002-README-REALITY-CHECK.md`
  - Evidencia: `KB-002` formaliza el contraste del `README.md`.
- `TRAE_AI_INTEGRATION_AUDIT.md` y `docs/project_knowledge_base/KB-003-AI-INTEGRATION-AUDIT.md`
  - Evidencia: `KB-003` formaliza la auditoria de integracion IA.

## 3. Documentos redundantes

Se identifican redundancias de funcion, no duplicacion literal:

- Familia de respaldo y archivo:
  - `PROJECT_ARCHIVE_MANIFEST.md`
  - `PROJECT_BACKUP_MANIFEST.md`
  - `BACKUP_CONTENT_INDEX.md`
  - `BACKUP_VERIFICATION_REPORT.md`
  - `PROJECT_STRUCTURE_SNAPSHOT.md`
  - `PROJECT_RECORDS_REGISTER.md`
  - `DOCUMENT_RETENTION_POLICY.md`
  - Evidencia: todos son metadocumentos de respaldo, archivo, retencion, estructura o verificacion.
- Familia de continuidad y bitacora:
  - `HANDOFF_TRAE_sigcTiArual.md`
  - `docs/CONTINUITY_RUNBOOK.md`
  - `docs/reports/continuity_status.md`
  - `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md`
- Familia de auditoria y realidad documental:
  - `README_REALITY_CHECK.md`
  - `TRAE_INDEPENDENT_REPOSITORY_AUDIT.md`
  - `docs/architect_master/03_DOCUMENT_TRUTH_MATRIX.md`
  - `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md`

## 4. Documentos unicos

Son unicos por funcion y no muestran documento par equivalente en el repositorio:

- `docs/MASTERDOC.md`
- `docs/PLAN_MAESTRO.md`
- `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`
- `docs/eiarc/01_FOUNDATION/*`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md`
- `docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md`
- `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md`
- `docs/API_REFERENCE.md`
- `docs/AI_PIPELINE.md`

## 5. Documentos criticos

Se clasifican como criticos los que el propio repositorio posiciona como fuente de verdad, continuidad, arquitectura oficial o conocimiento canonico:

- `docs/MASTERDOC.md`
  - Evidencia: `INDICE_PROYECTO.md` lo define como fuente de verdad tecnica y de arquitectura.
- `docs/PLAN_MAESTRO.md`
  - Evidencia: `INDICE_PROYECTO.md` lo define como roadmap y fases del proyecto.
- `INDICE_PROYECTO.md`
  - Evidencia: se autodefine como mapa operativo del proyecto.
- `HANDOFF_TRAE_sigcTiArual.md`
  - Evidencia: consolida estado, deuda tecnica y chequeos pendientes.
- `docs/project_knowledge_base/KB-001` a `KB-006`
  - Evidencia: registran hallazgos formales y auditorias estructurales.
- `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md`
  - Evidencia: gobiernan contextos, mapeo de codigo y fuente de verdad del esquema.
- `docs/architect_master/03_DOCUMENT_TRUTH_MATRIX.md`
- `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md`
  - Evidencia: clasifican fuentes de verdad y estado de evidencias.

## 6. Documentos historicos

Se clasifican como historicos los que preservan trazabilidad, auditoria pasada o cierre/archivo:

- `TRAE_INDEPENDENT_REPOSITORY_AUDIT.md`
- `TRAE_AI_INTEGRATION_AUDIT.md`
- `README_REALITY_CHECK.md`
- `docs/project_knowledge_base/KB-*`
- `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md`
  - Evidencia: se define como bitacora de intervencion tecnica append-only.
- `PROJECT_ARCHIVE_MANIFEST.md`
- `PROJECT_RECORDS_REGISTER.md`
- `DOCUMENT_RETENTION_POLICY.md`
- `PROJECT_STRUCTURE_SNAPSHOT.md`
- `PROJECT_BACKUP_MANIFEST.md`
- `BACKUP_CONTENT_INDEX.md`
- `BACKUP_VERIFICATION_REPORT.md`
- `debug-ai-model-loader.md`

## 7. Documentos que haran parte de la entrega SENA

Se incluyen aqui los que mencionan explicitamente SENA, ADSO, Proyecto Productivo o estan bajo artefactos SENA:

- `README.md`
  - Evidencia: badge `Proyecto Productivo SENA` y seccion `Contexto Academico SENA`.
- `docs/MASTERDOC.md`
  - Evidencia: `Institucion: SENA - Tecnologia en ADSO`.
- `docs/PLAN_MAESTRO.md`
  - Evidencia: titulo `EIARC ADSO` y referencia a `Proyecto Productivo ADSO - SENA`.
- `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`
  - Evidencia: subtitulo `Guia de Estudio — ADSO - SENA`.
- `docs/sena_artifacts/README.md`
  - Evidencia: ubicacion bajo `docs/sena_artifacts/`.
- `docs/session_plans/SESSION_PLAN_2025-12-29.md`
  - Evidencia: forma parte del bloque de documentacion academica/labs reconocido por `06_EVIDENCE_STATUS_MATRIX`.

## 8. Documentos que NO hacen parte de la entrega SENA

Se clasifican fuera de entrega SENA por ser operativos, de respaldo, de auditoria tecnica interna o de cierre:

- `PROJECT_ARCHIVE_MANIFEST.md`
- `PROJECT_RECORDS_REGISTER.md`
- `DOCUMENT_RETENTION_POLICY.md`
- `PROJECT_STRUCTURE_SNAPSHOT.md`
- `PROJECT_BACKUP_MANIFEST.md`
- `BACKUP_CONTENT_INDEX.md`
- `BACKUP_VERIFICATION_REPORT.md`
- `debug-ai-model-loader.md`
- `docs/eiarc/02_ARCHITECTURE/AI_PR1_CODE_REVIEW.md`
- `docs/eiarc/02_ARCHITECTURE/TELEMETRY_DATABASE_DIAGNOSTIC.md`
- `docs/eiarc/02_ARCHITECTURE/TELEMETRY_PR1_CODE_REVIEW.md`
  - Evidencia: por titulo y objetivo son artefactos de auditoria, diagnostico o cierre operativo, no piezas academicas declaradas.

## 9. Artefactos tecnicos esenciales

- `src/backend/`
  - Evidencia: backend Django/DRF, modelos, vistas, puertos y adaptadores.
- `src/frontend/`
  - Evidencia: frontend React/Vite, paginas `Dashboard.jsx` y `AIPredictiva.jsx`.
- `src/ai_models/`
  - Evidencia: `fastapi_app.py`, `Dockerfile`, modelo `.h5`, metadata y notebooks.
- `docker-compose.yml`
  - Evidencia: define servicios principales del despliegue local.
- `schema_postgresql.sql`
  - Evidencia: snapshot del esquema relacional.
- `src/backend/api/urls.py` y `src/backend/api/views.py`
  - Evidencia: publican endpoints legacy, V2 y V3.
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`
- `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py`
- `src/frontend/src/pages/Dashboard.jsx`
- `src/frontend/src/pages/AIPredictiva.jsx`

## 10. Artefactos tecnicos obsoletos

- `schema_postgresql.sql` como fuente primaria del modelo
  - Evidencia: `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md` establece que el dump SQL esta desactualizado y que la fuente de verdad recomendada son las migraciones.
- Secciones aspiracionales del `README.md`
  - Evidencia: `README_REALITY_CHECK.md` marca afirmaciones desactualizadas sobre JWT, modelo de datos, estructura y madurez real.
- Fallbacks y convivencias legacy documentadas como deuda
  - Evidencia: `HANDOFF_TRAE_sigcTiArual.md`, `README_REALITY_CHECK.md` y `docs/architect_master/03_DOCUMENT_TRUTH_MATRIX.md` registran coexistencia V1/V2/V3, fallbacks silenciosos y adaptadores legacy.

## 11. Componentes de software terminados

Terminados en el sentido de presencia de codigo, ruta de integracion y evidencia documental existente:

- Frontend build base
  - Evidencia: `06_EVIDENCE_STATUS_MATRIX` lo clasifica `Exists` al 90%.
- Microservicio IA como pieza de software existente
  - Evidencia: `src/ai_models/fastapi_app.py`, `production_models/plant_disease_mbv2.h5`, `docs/AI_PIPELINE.md`, `06_EVIDENCE_STATUS_MATRIX` lo clasifica `Exists (parcial, artefactos presentes)`.
- Conjunto documental EIARC ya materializado
  - Evidencia: 26 artefactos bajo `docs/eiarc/`.

## 12. Componentes parcialmente terminados

- Arquitectura hexagonal backend
  - Evidencia: `README_REALITY_CHECK.md` la clasifica `PARCIAL`; coexisten capas hexagonales y vistas ORM legacy.
- Telemetry Context V3
  - Evidencia: `Dashboard.jsx` consume `/api/v3/telemetry/history/`; `views.py` expone V3; `TELEMETRY_DATABASE_DIAGNOSTIC.md` muestra que la ruta existia pero dependia de migraciones pendientes.
- AI Context V3
  - Evidencia: `AIPredictiva.jsx` consume `/api/v3/ai/inference/`; `urls.py` publica la ruta; `AI_PR1_CODE_REVIEW.md` audita hallazgos del PR1.
- Contratos API V3
  - Evidencia: `06_EVIDENCE_STATUS_MATRIX` los clasifica `Incomplete / Missing contract file`.
- Edge / BeagleBone
  - Evidencia: `06_EVIDENCE_STATUS_MATRIX` lo clasifica `Incomplete / Missing deployables`.
- Seguridad / configuracion
  - Evidencia: `06_EVIDENCE_STATUS_MATRIX` lo clasifica `Incomplete`.
- Runbooks de continuidad
  - Evidencia: `06_EVIDENCE_STATUS_MATRIX` los clasifica `Incomplete`.

## 13. Componentes sin terminar

- CI/CD pipeline
  - Evidencia: `06_EVIDENCE_STATUS_MATRIX` lo clasifica `Missing (planificado)`.
- Despliegue Cloud+Edge integral
  - Evidencia: `06_EVIDENCE_STATUS_MATRIX` marca el diagrama/despliegue como `Incomplete` y edge como `Missing deployables`.
- Identity Context real
  - Evidencia: `EIARC_IMPLEMENTATION_BLUEPRINT.md` lo describe como debil y mayormente mockeado.
- IoT Context operativo independiente
  - Evidencia: `EIARC_CODE_TO_CONTEXT_MAP.mmd` lo marca `parcial y placeholder`.

## 14. Evidencias existentes

- Matriz formal de evidencias:
  - `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md`
- Matriz de verdad documental:
  - `docs/architect_master/03_DOCUMENT_TRUTH_MATRIX.md`
- Auditoria integral del repositorio:
  - `TRAE_INDEPENDENT_REPOSITORY_AUDIT.md`
  - `docs/project_knowledge_base/KB-001-TRAE-INDEPENDENT-REPOSITORY-AUDIT.md`
- Contraste README vs codigo:
  - `README_REALITY_CHECK.md`
  - `docs/project_knowledge_base/KB-002-README-REALITY-CHECK.md`
- Auditorias de IA:
  - `TRAE_AI_INTEGRATION_AUDIT.md`
  - `docs/project_knowledge_base/KB-003`, `KB-004`, `KB-005`
  - `docs/eiarc/02_ARCHITECTURE/AI_PR1_CODE_REVIEW.md`
- Evidencia de telemetria:
  - `docs/eiarc/02_ARCHITECTURE/TELEMETRY_DATABASE_DIAGNOSTIC.md`
  - `docs/eiarc/02_ARCHITECTURE/TELEMETRY_PR1_CODE_REVIEW.md`
- Evidencia de despliegue y continuidad:
  - `docs/CONTINUITY_RUNBOOK.md`
  - `docs/reports/continuity_status.md`

## 15. Evidencias faltantes

Tomadas exclusivamente de `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md`:

- Contrato formal de API V3
  - Estado: `Incomplete / Missing contract file`
- Despliegue Cloud+Edge materializado
  - Estado: `Incomplete`
- Edge deployables reproducibles
  - Estado: `Incomplete / Missing deployables`
- Cobertura y separacion suficiente de pruebas
  - Estado: `Incomplete`
- Pipeline CI/CD
  - Estado: `Missing (planificado)`
- Seguridad/JWT/TLS/Secrets verificables
  - Estado: `Incomplete`
- Runbooks de produccion plenamente actualizados
  - Estado: `Incomplete`

## Respuesta de cierre inventarial

### Que se conserva

- `docs/MASTERDOC.md`, `docs/PLAN_MAESTRO.md`, `docs/project_knowledge_base/`, `docs/eiarc/`, `docs/architect_master/`, `src/backend/`, `src/frontend/`, `src/ai_models/`, `docker-compose.yml`, `schema_postgresql.sql` como snapshot historico.

### Que se entrega

- Los documentos explicitamente academicos/SENA y la documentacion tecnica base del proyecto:
  - `README.md`
  - `docs/MASTERDOC.md`
  - `docs/PLAN_MAESTRO.md`
  - `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`
  - `docs/sena_artifacts/`
  - documentacion de apoyo en `docs/uml/`, `docs/diagrams/`, `docs/database/`

### Que es historico

- Auditorias TRAE, KBs, bitacoras, code reviews, diagnosticos, manifiestos de backup/archivo y notas de debug.

### Que ya no debe volver a tocarse

- Backups y manifiestos de cierre ya creados:
  - `PROJECT_ARCHIVE_MANIFEST.md`
  - `PROJECT_RECORDS_REGISTER.md`
  - `DOCUMENT_RETENTION_POLICY.md`
  - `PROJECT_STRUCTURE_SNAPSHOT.md`
  - `PROJECT_BACKUP_MANIFEST.md`
  - `BACKUP_CONTENT_INDEX.md`
  - `BACKUP_VERIFICATION_REPORT.md`
- Artefactos historicos de auditoria ya cerrados:
  - `TRAE_*`
  - `docs/project_knowledge_base/KB-*`
  - `docs/eiarc/*CODE_REVIEW.md`
  - `docs/eiarc/02_ARCHITECTURE/TELEMETRY_DATABASE_DIAGNOSTIC.md`

## Conclusiones

1. El repositorio posee una masa documental amplia, con fuente de verdad distribuida entre `MASTERDOC`, `PLAN_MAESTRO`, `architect_master`, `project_knowledge_base` y `eiarc`.
2. No hay duplicados exactos entre documentos Markdown/Mermaid, pero si existen familias claramente derivadas o redundantes por funcion.
3. Lo mas estable y conservable hoy es la documentacion canonica, la base de conocimiento, la linea EIARC y el codigo fuente principal.
4. Lo estrictamente historico esta bien delimitado en auditorias, bitacoras, manifiestos y artefactos de cierre.
5. Las evidencias faltantes ya estan explicitadas por el propio repositorio, principalmente en contratos API, CI/CD, seguridad, edge deployable y madurez de pruebas.
