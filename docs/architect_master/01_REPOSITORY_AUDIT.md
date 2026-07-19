# 01_REPOSITORY_AUDIT

> **Nota de obsolescencia (FASE 5C — migración documental V8):** este documento es un artefacto histórico de auditoría previo a la consolidación arquitectónica V8. Las referencias a diagramas en `docs/diagrams/`, `docs/uml/` y `docs/database/` citadas en este archivo pueden estar desactualizadas. La fuente vigente de diagramas canónicos es `docs/eiarc/03_DIAGRAMS/*_V8.mmd`. Ver FASE 5 / 5A / 5B para el detalle de la migración. Este documento se conserva intacto por trazabilidad histórica.

## 1. Resumen ejecutivo

Informe de inspección estática del repositorio `sigcTiArural` en la rama `feature/refactor-modular-contexts`. El análisis se basó en la revisión de los archivos y carpetas clave: `README.md`, `docs/`, `src/`, `config/`, `schema_postgresql.sql` y `docker-compose.yml`. Se confirma que el repositorio ya incluye una migración en curso hacia una arquitectura hexagonal, con coexistencia de componentes legacy y nuevos adaptadores.

## 2. Estructura general del repositorio

Repositorio principal:
- Archivos raíz: `.env.example`, `.gitignore`, `README.md`, `docker-compose.yml`, `schema_postgresql.sql`, `package.json`, `package-lock.json`, `INDICE_PROYECTO.md`, `LICENSE`, `test_endpoints.py`.
- Carpetas clave de nivel superior: `config/`, `docs/`, `scripts/`, `src/`, `preview/`, `_local_docs_backup/`.

## 3. Inventario de carpetas

Carpetas principales detectadas:
- `config/` (configuración, actualmente `settings.ini` vacío)
- `docs/` (documentación técnica y diagramas)
- `src/` (código fuente)
- `src/backend/` (backend Django + refactorización hexagonal)
- `src/frontend/` (frontend React + Vite)
- `src/ai_models/` (microservicio de IA FastAPI + modelos TensorFlow)
- `src/embedded/` (código relacionado con BeagleBone Black / Edge)
- `scripts/` (automatización y generación de reportes)
- `preview/` (vista previa estática)
- `_local_docs_backup/` (documentos de respaldo locales)

## 4. Inventario tecnológico

Tecnologías identificadas:
- Backend: Python 3.10+, Django 4.2+, Django REST Framework, Django Channels, Daphne.
- Frontend: React 18, Vite, TailwindCSS, Three.js, React Router v6, Zustand, Recharts.
- IA: TensorFlow 2.15+, FastAPI, Uvicorn, SpeechRecognition, gTTS, pydub, PIL.
- Base de datos: PostgreSQL 15.
- Infraestructura: Docker Compose, contenedores `db`, `db-mysql`, `backend`, `ai_service`, `frontend`.
- Utilidades de documentación: Mermaid CLI, http-server, md-to-pdf, puppeteer.

## 5. Arquitectura detectada

Arquitectura general:
- Arquitectura híbrida Cloud/Edge con backend Django, microservicio IA FastAPI y frontend React.
- Se evidencia un enfoque de “modular monolith” con intención de migración hacia Hexagonal Architecture / Clean Architecture.
- El repositorio contiene múltiples capas: `src/backend/api/logic/` (V2), `src/backend/core/` (V3) y adaptadores de infraestructura en `src/backend/infrastructure/`.
- `docker-compose.yml` describe un stack de 5 servicios y conserva un servicio MySQL heredado no utilizado por el backend principal.

## 6. Componentes frontend

Componentes frontend detectados:
- `src/frontend/package.json` y `src/frontend/vite.config.js`.
- `src/frontend/src/` con `App.jsx`, `main.jsx`, `index.css`, y carpetas: `auth/`, `components/`, `data/`, `hooks/`, `labs/`, `pages/`, `services/`, `stores/`.
- Frontend React con destino a `5173` y despliegue a `5173:80` en Docker.
- Uso de bibliotecas de visualización 3D y gráficos: `three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion`, `recharts`.

## 7. Componentes backend

Componentes backend detectados:
- Backend Django en `src/backend/` con `Dockerfile` propio.
- Backend principal Django en `src/backend/sigct_backend/` con `settings.py`, `urls.py`, `wsgi.py`.
- API Django REST en `src/backend/api/` con `views.py`, `models.py`, `serializers.py`, `urls.py`.
- Migración y pruebas en `src/backend/api/migrations/`, `src/backend/tests/`.
- Capas de refactorización:
  - `src/backend/api/logic/` contiene `domain/`, `ports/`, `adapters/` para la implementación V2/V3.
  - `src/backend/core/` contiene dominio puro, puertos y servicios para la arquitectura hexagonal objetivo.
- Servidor de IA interno se comunica como adaptador de backend mediante `infrastructure/config/dependencies.py`.

## 8. Componentes IA

Componentes IA detectados:
- `src/ai_models/fastapi_app.py` como servicio FastAPI de inferencia y voz.
- `src/ai_models/production_models/plant_disease_mbv2.h5` y `model_metadata.json`.
- Notebooks de entrenamiento en `src/ai_models/notebooks/`.
- `src/ai_models/train_plant_disease_mobilenet.py` para entrenamiento de modelos MobileNet.
- Adaptador FastAPI IA en `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`.
- Servicio de IA expuesto en Docker por el contenedor `ai_service` en el puerto `8081`.

## 9. Componentes IoT

Componentes IoT detectados:
- `src/embedded/` con subcarpetas:
  - `bbb_01_gateway/` (gateway MQTT y sincronización)
  - `bbb_02_ia_edge/` (inferencia local TFLite)
  - `bbb_03_sensors/` (lectura de sensores y cámara)
- `README.md` y docs indican uso de BeagleBone Black y MQTT.
- `docker-compose.yml` y docs mencionan arquitectura edge + cloud; sin embargo, el despliegue directo de MQTT/edge no está definido en `docker-compose.yml`.

## 10. Base de datos detectada

Base de datos principal:
- PostgreSQL 15, con `db` en Docker Compose.
- Esquema SQL completo en `schema_postgresql.sql` con tablas de Django auth y `api_sensorreading`.
- `docker-compose.yml` expone `5544:5432` y configura `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.
- También existe servicio `db-mysql` en Docker Compose, aparentemente legado y no referido por backend.

## 11. Infraestructura y despliegue detectados

Infraestructura detectada:
- Docker Compose orquestra servicios: `db`, `db-mysql`, `backend`, `ai_service`, `frontend`.
- Backend y frontend construidos vía Dockerfiles en `src/backend/` y `src/frontend/`.
- Servicio IA con Dockerfile en `src/ai_models/`.
- Existe `.env.example` como plantilla de variables de entorno.
- `docs/DEPLOYMENT.md` y `docs/DEPLOYMENT_AWS.md` sugieren documentación adicional de despliegue.

## 12. Estado de la refactorización hexagonal

Estado identificado:
- Existe un camino de refactorización activo en la rama `feature/refactor-modular-contexts`.
- El backend contiene elementos legacy, V2 y V3:
  - `src/backend/api/views.py` mantiene V1 legacy con `ModelViewSet` y vistas acopladas al ORM.
  - `src/backend/api/logic/` representa una implementación V2 de adaptación hexagonal parcial.
  - `src/backend/core/` presenta la intención de dominio puro y puertos/servicios independientes.
- `src/backend/api/urls.py` expone rutas V1, V2 y V3 en paralelo.
- `src/backend/infrastructure/config/dependencies.py` actúa como composition root simple.
- El `docs/HEXAGONAL_REFACTOR_PLAN.md` y `docs/MASTERDOC.md` documentan el plan y el estado actual.
- El estado actual es de migración intermedia: coexistencia de capas y componentes legacy, con una dirección técnica clara pero sin eliminación completa de código antiguo.

## 13. Inventario de documentación encontrada

Documentación principal encontrada:
- `README.md`
- `docs/MASTERDOC.md`
- `docs/PLAN_MAESTRO.md`
- `docs/HEXAGONAL_REFACTOR_PLAN.md`
- `docs/AI_PIPELINE.md`
- `docs/API_REFERENCE.md`
- `docs/DEPLOYMENT.md`
- `docs/DEPLOYMENT_AWS.md`
- `docs/EDGE_SETUP.md`
- `docs/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md`
- `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`
- `docs/architecture/`, `docs/database/`, `docs/diagrams/`, `docs/edge/`, `docs/uml/`.

## 14. Diagramas existentes encontrados

Diagramas detectados en `docs/diagrams/` y `docs/uml/`:
- `docs/diagrams/c4_context.mmd` / `.svg`
- `docs/diagrams/c4_containers.mmd` / `.svg`
- `docs/diagrams/c4_components.mmd` / `.svg`
- `docs/diagrams/c4_deployment.mmd` / `.svg`
- `docs/diagrams/architecture.mmd` / `.svg`
- `docs/diagrams/architecture_edge.svg`
- `docs/diagrams/sequence_navigation.mmd` / `.svg`
- `docs/diagrams/use_cases.mmd` / `.svg`
- `docs/diagrams/state_alerting.svg`
- `docs/uml/` con diagramas de `deployment_cloud_edge`, `component_system`, `sequence_data_ingest`, `state_alerting`, entre otros.
- `docs/database/er_schema.svg` y `docs/database/class_db_models.svg`.

## 15. Componentes legacy identificados

Componentes legacy detectados:
- `src/backend/api/views.py` con vistas legacy y `ModelViewSet` acopladas al ORM.
- Servicio MySQL `db-mysql` en `docker-compose.yml` sin uso aparente por el backend actual.
- Código de migración pre-Postgres visible en la orquestación Docker.
- Posibles dependencias legadas en `src/backend/api/models.py` y `src/backend/api/logic/` que aún mezclan lógica de dominio con acceso directo a persistencia.

## 16. Componentes nuevos identificados

Componentes nuevos detectados:
- `src/backend/core/` como dominio puro y puertos/servicios hexagonales.
- `src/backend/infrastructure/` con adapters para Django ORM, FastAPI IA y notificaciones.
- Nuevos endpoints V3 en `src/backend/api/views.py` y `src/backend/api/urls.py`.
- `src/ai_models/` como microservicio IA independiente con inferencia y voz.
- `src/embedded/` que documenta la intención de Edge Computing para BeagleBone Black.

## 17. Riesgos técnicos

Riesgos técnicos identificados:
- Coexistencia de tres versiones de API (`V1`, `V2`, `V3`) aumenta la deuda técnica y el riesgo de inconsistencias.
- Fallback silencioso `try/except ImportError` para V3 puede ocultar errores de despliegue y dar falsas señales de disponibilidad.
- Servicio MySQL heredado en Docker Compose sin uso real puede causar mantenimiento innecesario.
- `config/settings.ini` vacío sugiere configuración incompleta o no utilizada.
- `src/ai_models/fastapi_app.py` depende de librerías pesadas (TensorFlow, speech) y tiene lógica de conexión a Postgres que podría no ser válida en todos los entornos.
- La actual orquestación Docker expone múltiples puertos y puede requerir ajustes de seguridad para producción.

## 18. Riesgos documentales

Riesgos documentales detectados:
- Documentación extensa, pero la existencia de secciones planificadas en `MASTERDOC.md` y `HEXAGONAL_REFACTOR_PLAN.md` indica que parte del contenido puede ser aspiracional más que implementado.
- Posible divergencia entre documentación y código actual debido a la migración activa.
- Documentación de despliegue (`DEPLOYMENT.md`, `DEPLOYMENT_AWS.md`) no fue verificada en ejecución; su validez depende de la implementación real en Docker y el entorno.
- El uso de términos como “estado verificado” en documentos técnicos exige confirmación práctica, no solo teoría.

## 19. Vacíos arquitectónicos encontrados

Vacíos detectados:
- Falta de una capa de orquestación clara para `V3` en el backend; la definición de `core/` existe pero no está totalmente consolidada.
- No se observan pruebas unitarias o de integración claramente asociadas a los adaptadores V3; la carpeta `tests/` existe, pero su cobertura real no se ha medido.
- Ausencia de un contenedor de configuración de dependencias más robusto y centralizado; el `dependencies.py` es un comienzo, pero falta inyección de dependencias sistemática.
- No hay evidencia directa de políticas de seguridad en el backend (JWT, CORS, rate limiting) implementadas más allá de la documentación.
- El servicio de Edge Computing está documentado pero no aparece en el `docker-compose.yml`; hay brecha entre la intención Edge y el despliegue actual.

## 20. Recomendaciones para la siguiente fase

Recomendaciones:
- Consolidar la refactorización hexagonal moviendo toda lógica de dominio a `src/backend/core/` y limitar `src/backend/api/` a adaptadores y endpoints.
- Declarar una hoja de ruta clara de retirada de `V1` y `V2` en favor de `V3`, con fechas y criterios de aceptación.
- Eliminar o documentar explícitamente el servicio `db-mysql` si no se usa, para reducir ruido en Docker Compose.
- Completar la configuración de `config/settings.ini` o eliminar el archivo si no se utiliza; centralizar la configuración en `.env.example` y `django-environ`.
- Verificar que `src/ai_models/fastapi_app.py` sea un servicio independiente con su propio ciclo de despliegue y no un componente acoplado al backend.
- Revisar y sincronizar la documentación con el código actual, priorizando `README.md`, `docs/MASTERDOC.md` y `docs/HEXAGONAL_REFACTOR_PLAN.md`.
- Añadir pruebas unitarias para `core/domain`, `core/ports` y adaptadores de infraestructura, en lugar de depender solamente de pruebas de integración del API.
- Evaluar el uso de Docker Compose para Edge vs. cloud y definir si los nodos Edge deben estar fuera del orquestador central.

---

> Nota: este informe se generó mediante inspección estática del repositorio y no implicó ejecución de código ni cambios en el contenido existente.