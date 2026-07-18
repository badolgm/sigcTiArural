# 06_EVIDENCE_STATUS_MATRIX

> **Nota de obsolescencia (FASE 5C — migración documental V8):** este documento es un artefacto histórico de auditoría previo a la consolidación arquitectónica V8. Las entradas "Diagramas reutilizables" que citan archivos de `docs/diagrams/` pueden apuntar a rutas migradas o retiradas; ver FASE 5 / 5A / 5B. La fuente vigente de diagramas canónicos es `docs/eiarc/03_DIAGRAMS/*_V8.mmd`. Este documento se conserva intacto por trazabilidad histórica.

Matriz de estado de evidencias (fuente: `01_REPOSITORY_AUDIT.md`, `02_SIGCTRURAL_CANONICAL_MODEL.md`, `03_DOCUMENT_TRUTH_MATRIX.md`, `04_DIAGRAM_AUDIT.md`, `05_FINAL_ARCHITECTURE_BASELINE.md` y diagramas en `docs/`).

Nota: los directorios `DelaGUIA10/` y `DelaGUIA11/` no existen en el workspace; la matriz usa únicamente los artefactos verificados en los documentos y `docs/`.

Formato por evidencia:
- Evidencia: nombre
- Estado: Exists / Incomplete / Missing
- % Estimado: (aprox.)
- Artefactos disponibles: lista de archivos detectados
- Diagramas reutilizables: lista
- Documentos fuente: lista
- Riesgo de desarrollo: Alto/Medio/Bajo (breve razón)

---

1) Documento de Arquitectura (canon)
- Estado: Exists (consolidado en docs)
- % Estimado: 85%
- Artefactos disponibles: `docs/MASTERDOC.md`, `README.md`, `02_SIGCTRURAL_CANONICAL_MODEL.md`, `docs/architecture.mmd` (fuente)
- Diagramas reutilizables: `docs/diagrams/architecture.mmd`, `docs/diagrams/c4_context.mmd`, `docs/diagrams/c4_components.mmd`
- Documentos fuente: `docs/MASTERDOC.md`, `02_SIGCTRURAL_CANONICAL_MODEL.md`, `01_REPOSITORY_AUDIT.md`
- Riesgo: Medio — la documentación está rica pero hay discrepancias AS-IS vs despliegue (Edge vs Compose).

2) ERD / Modelo de Datos
- Estado: Exists (oficial)
- % Estimado: 95%
- Artefactos disponibles: `schema_postgresql.sql`, `docs/database/er_schema.mmd`, `docs/database/class_db_models.mmd`, `docs/database/ModelEER_Sigct-rural.mwb`
- Diagramas reutilizables: `docs/database/er_schema.svg`, `docs/database/class_db_models.svg`
- Documentos fuente: `schema_postgresql.sql`, `docs/MASTERDOC.md`, `01_REPOSITORY_AUDIT.md`
- Riesgo: Bajo — sincronizar `ModelEER` vs Postgres SQL (compatibilidad de tooling).

3) Diagrama de Contenedores / Despliegue (Cloud+Edge)
- Estado: Incomplete
- % Estimado: 50%
- Artefactos disponibles: `docker-compose.yml`, `docs/diagrams/c4_containers.mmd`, `docs/diagrams/c4_deployment.mmd`, `docs/diagrams/architecture_edge.svg`
- Diagramas reutilizables: `c4_containers.mmd`, `c4_deployment.mmd`, `deployment_cloud_edge.svg`
- Documentos fuente: `docker-compose.yml`, `docs/DEPLOYMENT.md`, `docs/MASTERDOC.md`
- Riesgo: Alto — diagramas muestran Edge/MQTT que no están materializados en Compose; requiere decisión de despliegue.

4) Contratos API (v3) y especificación de endpoints
- Estado: Incomplete / Missing contract file
- % Estimado: 30%
- Artefactos disponibles: `src/backend/api/urls.py`, `src/backend/api/views.py`, `02_SIGCTRURAL_CANONICAL_MODEL.md` (menciones), `docs/MASTERDOC.md` (alto nivel)
- Diagramas reutilizables: `docs/diagrams/c4_components.mmd` (component interaction)
- Documentos fuente: `src/backend/` code, `docs/HEXAGONAL_REFACTOR_PLAN.md`
- Riesgo: Alto — falta un contrato formal (OpenAPI / spec) para v3; necesario para integración frontend/IA/edge.

5) Pipeline IA / Entrenamiento y Artifacts
- Estado: Exists (parcial, artefactos presentes)
- % Estimado: 75%
- Artefactos disponibles: `src/ai_models/production_models/plant_disease_mbv2.h5`, `src/ai_models/notebooks/`, `src/ai_models/fastapi_app.py`
- Diagramas reutilizables: `docs/uml/activity_model_training.mmd`
- Documentos fuente: `docs/AI_PIPELINE.md`, `01_REPOSITORY_AUDIT.md`
- Riesgo: Medio — modelos y notebooks existen; falta definición operativa de lifecycle y SLAs.

6) Edge (BeagleBone) — Diseño y contratos
- Estado: Incomplete / Missing deployables
- % Estimado: 40%
- Artefactos disponibles: `src/embedded/` (gateway, tflite_api, sensors), `docs/edge/` docs, `docs/diagrams/architecture_edge.svg`
- Diagramas reutilizables: `architecture_edge.svg`, `docs/diagrams/deployment_cloud_edge.svg`
- Documentos fuente: `docs/EDGE_SETUP.md`, `docs/MASTERDOC.md`
- Riesgo: Alto — documentación existe pero falta despliegue reproducible y broker en Compose.

7) Tests y cobertura (backend/core)
- Estado: Incomplete
- % Estimado: 30%
- Artefactos disponibles: `src/backend/tests/` (tests de infra & dominio indicados), `pytest.ini`
- Diagramas reutilizables: none specific
- Documentos fuente: `docs/HEXAGONAL_REFACTOR_PLAN.md`, `01_REPOSITORY_AUDIT.md`
- Riesgo: Medio-Alto — pruebas existen pero cobertura y separación dominio vs infra insuficientes.

8) CI/CD pipeline
- Estado: Missing (planificado)
- % Estimado: 5%
- Artefactos disponibles: `docs/PLAN_MAESTRO.md` (menciona GitHub Actions planificado), no archivos de pipeline en repo
- Diagramas reutilizables: CI/CD diagram (falta)
- Documentos fuente: `docs/PLAN_MAESTRO.md`
- Riesgo: Alto — sin pipeline, riesgo para integraciones y despliegues.

9) Seguridad / Configuración (JWT, TLS, Secrets)
- Estado: Incomplete
- % Estimado: 35%
- Artefactos disponibles: `docs/MASTERDOC.md` (menciona JWT/CORS), `src/backend/sigct_backend/settings.py`, `.env.example`
- Diagramas reutilizables: `sequence_user_auth.mmd` (auth flow)
- Documentos fuente: `docs/MASTERDOC.md`, `README.md`
- Riesgo: Alto — políticas declaradas no verificadas ni automatizadas.

10) Documentación SENA / Labs deliverables
- Estado: Exists (documentación presente)
- % Estimado: 80%
- Artefactos disponibles: `docs/` (PLAN_MAESTRO.md, MASTERDOC.md, docs/session_plans/, docs/uml/, class_lab_catalog)
- Diagramas reutilizables: `class_lab_catalog.mmd`, `use_cases.mmd`, `activity_model_training.mmd`
- Documentos fuente: `docs/PLAN_MAESTRO.md`, `docs/MASTERDOC.md`, `docs/sena_artifacts/README.md`
- Riesgo: Bajo-Medio — material educativo abundante; verificar alineación con entregables formales.

11) Frontend build / static deliverable
- Estado: Exists
- % Estimado: 90%
- Artefactos disponibles: `src/frontend/package.json`, `src/frontend/vite.config.js`, `src/frontend/src/` code
- Diagramas reutilizables: `sequence_navigation.mmd`, `use_cases.mmd`
- Documentos fuente: `README.md`, `docs/MASTERDOC.md`
- Riesgo: Bajo — frontend presente; requiere contrato API formal.

12) Config playbooks / Runbooks (continuity)
- State: Incomplete
- % Estimado: 40%
- Artefactos available: `docs/CONTINUITY_RUNBOOK.md` (referenced in README), `scripts/`
- Diagrams reusable: deployment diagrams (after sync)
- Source docs: `README.md`, `docs/DEPLOYMENT.md`
- Development risk: Medium — runbooks exist but may need updates for production.

---

Síntesis de información disponible para resolver evidencias faltantes:
- El código fuente (backend, frontend, ai_models) ofrece la base técnica para generar contratos API, pruebas y despliegues reproducibles.
- Los diagramas existentes (`docs/diagrams/` y `docs/uml/`) cubren la mayoría de vistas conceptuales; varios requieren sincronización con `docker-compose.yml` y `src/`.
- Los notebooks y modelos en `src/ai_models/` permiten completar evidencias IA técnicas (training reproducible, modelos entregables).
- El `schema_postgresql.sql` y los diagramas DB habilitan completar la evidencia de datos/ERD.

---

Entrega: solo la matriz solicitada. No se generaron evidencias ni se modificaron archivos existentes.
