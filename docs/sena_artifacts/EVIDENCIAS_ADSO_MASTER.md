# EVIDENCIAS ADSO MASTER

## 1. Propósito del documento

Consolidar en un solo artefacto las evidencias técnicas, documentales y académicas disponibles para la entrega final de SIGC&T Rural como Proyecto Productivo ADSO.

## 2. Criterio de consolidación

Este documento organiza la evidencia existente en cinco bloques:

1. evidencia institucional y académica
2. evidencia técnica de arquitectura y software
3. evidencia funcional
4. evidencia de despliegue y continuidad
5. evidencia edge y de hardware

## 3. Evidencia institucional y académica

| Evidencia | Archivo base | Estado |
|---|---|---|
| Identificación del proyecto como Proyecto Productivo SENA | `README.md` | Disponible |
| Documento maestro académico-técnico | `docs/MASTERDOC.md` | Disponible |
| Plan maestro del proyecto | `docs/PLAN_MAESTRO.md` | Disponible |
| Mapa operativo del proyecto | `INDICE_PROYECTO.md` | Disponible |
| Guía técnica ADSO | `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` | Disponible |
| Matriz de evidencias | `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md` | Disponible |
| Auditoría de preparación para graduación | `SENA_GRADUATION_READINESS_AUDIT.md` | Disponible |

## 4. Evidencia de arquitectura y diseño

### 4.1 Documentos arquitectónicos base

- `docs/MASTERDOC.md`
- `docs/PLAN_MAESTRO.md`
- `docs/architect_master/03_DOCUMENT_TRUTH_MATRIX.md`
- `docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md`
- `docs/eiarc/01_FOUNDATION/*`
- `docs/eiarc/02_ARCHITECTURE/*`

### 4.2 Diagramas reutilizables para entrega y sustentación

- `docs/diagrams/architecture.mmd`
- `docs/diagrams/c4_context.mmd`
- `docs/diagrams/c4_components.mmd`
- `docs/diagrams/c4_containers.mmd`
- `docs/diagrams/c4_deployment.mmd`
- `docs/diagrams/package_layers.mmd`
- `docs/database/er_schema.mmd`
- `docs/database/class_db_models.mmd`
- `docs/uml/activity_model_training.mmd`
- `docs/diagrams/use_cases.mmd`
- `docs/diagrams/class_lab_catalog.mmd`

### 4.3 Evidencia de gobierno documental

- `MASTER_PROJECT_INVENTORY_AUDIT.md`
- `PROJECT_ARCHIVE_MANIFEST.md`
- `PROJECT_RECORDS_REGISTER.md`
- `DOCUMENT_RETENTION_POLICY.md`
- `PROJECT_STRUCTURE_SNAPSHOT.md`

## 5. Evidencia de implementación de software

### 5.1 Backend

Archivos base:

- `src/backend/api/views.py`
- `src/backend/api/urls.py`
- `src/backend/api/models.py`
- `src/backend/infrastructure/`
- `src/backend/core/`

Evidencia asociada:

- coexistencia V1, V2 y V3 documentada en `docs/MASTERDOC.md`
- inventario y clasificación en `MASTER_PROJECT_INVENTORY_AUDIT.md`
- diagnóstico de telemetría en `docs/eiarc/02_ARCHITECTURE/TELEMETRY_DATABASE_DIAGNOSTIC.md`

### 5.2 Frontend

Archivos base:

- `src/frontend/src/pages/Dashboard.jsx`
- `src/frontend/src/pages/AIPredictiva.jsx`
- `src/frontend/src/components/TelemetryPanel.jsx`

Evidencia asociada:

- dashboard centralizado declarado como objetivo académico completado
- frontend clasificado como `Exists` al 90% en `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md`

### 5.3 Inteligencia artificial

Archivos base:

- `src/ai_models/fastapi_app.py`
- `src/ai_models/production_models/plant_disease_mbv2.h5`
- `src/ai_models/notebooks/`
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`
- `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py`

Evidencia asociada:

- `docs/AI_PIPELINE.md`
- `docs/project_knowledge_base/KB-003-AI-INTEGRATION-AUDIT.md`
- `docs/eiarc/02_ARCHITECTURE/AI_PR1_CODE_REVIEW.md`

## 6. Evidencia funcional disponible

### 6.1 Objetivos académicos con respaldo documental

| Objetivo | Soporte documental | Estado reportado |
|---|---|---|
| O-01 Dashboard Centralizado | `README.md`, `docs/MASTERDOC.md` | Completado |
| O-02 Modelo de IA | `README.md`, `docs/MASTERDOC.md` | Completado |
| O-03 Laboratorio Hardware | `README.md`, `docs/MASTERDOC.md` | En progreso |
| O-04 Biblioteca Educativa | `README.md` | En progreso |
| O-05 Cumplimiento ADSO | `README.md`, `docs/MASTERDOC.md` | En progreso |

### 6.2 Endpoints y componentes funcionales ya documentados

- Telemetría V1: `GET /api/telemetry/history/`
- Telemetría V2: `GET /api/v2/telemetry/history/`
- Telemetría V3: `GET /api/v3/telemetry/history/`
- IA V2: `GET /api/v2/ai/crop-advice/`
- IA V3: `POST /api/v3/ai/inference/`
- IA service: `GET /health`, `POST /infer`

Fuentes:

- `src/backend/api/urls.py`
- `src/backend/api/views.py`
- `src/ai_models/fastapi_app.py`

## 7. Evidencia de pruebas y validación

### 7.1 Scripts y pruebas existentes

- `scripts/continuity_check.ps1`
- `scripts/verify_refactor.ps1`
- `scripts/verify_refactor.sh`
- `test_endpoints.py`
- `src/backend/test_endpoints.py`

### 7.2 Evidencia registrada en documentación

- `docs/CONTINUITY_RUNBOOK.md` registra 50 tests pasados en la capa de dominio.
- `docs/MASTERDOC.md` registra 58 tests pasando en backend.
- `docs/reports/continuity_status.md` existe como registro de continuidad.

## 8. Evidencia de despliegue y operación

### 8.1 Despliegue local documentado

- `docs/DEPLOYMENT.md`
- `docker-compose.yml`

### 8.2 Servicios definidos en Compose

- `db` (PostgreSQL)
- `db-mysql` (legado)
- `backend`
- `ai_service`
- `frontend`

### 8.3 Continuidad operativa

- `docs/CONTINUITY_RUNBOOK.md`
- `scripts/continuity_check.ps1`
- `scripts/verify_refactor.ps1`

## 9. Evidencia edge y hardware

### 9.1 Documentación disponible

- `docs/EDGE_SETUP.md`
- `src/embedded/`
- referencias edge en `README.md`
- referencias de fase hardware en `docs/PLAN_MAESTRO.md`

### 9.2 Configuración documentada del clúster

- BBB-01 Gateway MQTT
- BBB-02 IA Edge con TensorFlow Lite
- BBB-03 Sensores
- DHT22
- sensor de humedad de suelo
- cámara USB
- switch/router

## 10. Evidencias críticas que deben acompañar la sustentación

Estas evidencias ya cuentan con respaldo documental en el repositorio y deben formar parte explícita del paquete de presentación:

1. visión general del proyecto
2. objetivos académicos ADSO
3. arquitectura del sistema
4. modelo de datos
5. despliegue local con Docker
6. dashboard funcional
7. IA funcional
8. continuidad y pruebas
9. evidencia del enfoque edge/hardware

## 11. Trazabilidad documental recomendada para revisión del instructor

| Tema | Documento principal | Documento complementario |
|---|---|---|
| Identidad del proyecto | `README.md` | `PROYECTO_FORMATIVO_FINAL.md` |
| Arquitectura | `docs/MASTERDOC.md` | `docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md` |
| Roadmap y cierre ADSO | `docs/PLAN_MAESTRO.md` | `SENA_GRADUATION_READINESS_AUDIT.md` |
| Evidencias | `EVIDENCIAS_ADSO_MASTER.md` | `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md` |
| Sustentación | `PRESENTACION_SUSTENTACION.md` | `README.md` |
| Despliegue | `DEPLOYMENT_FINAL.md` | `docker-compose.yml` |
| API | `API_DELIVERY_PACKAGE.md` | `src/backend/api/urls.py` |

## 12. Declaración final

El repositorio de SIGC&T Rural ya dispone de una masa documental y técnica suficiente para construir un paquete de evidencias ADSO coherente. Este documento consolida esa base y la deja organizada para revisión del instructor, entrega final y sustentación académica.
