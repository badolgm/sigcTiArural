# 02_SIGCTRURAL_CANONICAL_MODEL

Documento canónico del proyecto SIGC&T Rural (fuente oficial de verdad).
Basado exclusivamente en la inspección estática verificada (01_REPOSITORY_AUDIT.md y documentos presentes en `docs/`).

1. Visión del sistema

- Plataforma web híbrida (Cloud + Edge) para integrar IoT, IA y educación técnica, enfocada en agricultura sostenible y laboratorios educativos.

2. Problema que resuelve

- Proveer un sistema integrado para adquisición y visualización de telemetría, diagnóstico asistido por IA, laboratorios virtuales y herramientas educativas para zonas rurales con conectividad intermitente.

3. Objetivos

- Dashboard en tiempo real de telemetría.
- Modelos IA para diagnóstico de plantas (Cloud + Edge).
- Laboratorios interactivos (3D, robótica, electrónica, telecomunicaciones).
- Arquitectura modular y migración a Hexagonal/Clean Architecture.

4. Usuarios

- Agricultores (visualización y diagnóstico).
- Estudiantes SENA (laboratorios y contenidos educativos).
- Administradores/Operadores (gestión del sistema).
- Investigadores/técnicos (entrenamiento y despliegue de modelos IA).

5. Módulos (inventario funcional)

AS-IS (según código y docs):
- Frontend (React + Vite): UI, visualización 3D, dashboards.
- Backend (Django): API REST, WebSockets, endpoints legacy y nuevas versiones V2/V3.
- IA (FastAPI): microservicio de inferencia y asistente de voz, modelos en `src/ai_models/production_models`.
- Edge (embedded): código para BeagleBone Black (`src/embedded/`) con gateway, IA edge y sensores.
- Persistencia: PostgreSQL 15 (schema en `schema_postgresql.sql`).
- Scripts y documentación: `scripts/`, `docs/`.

6. Arquitectura general

AS-IS:
- Híbrida Cloud/Edge. Stack: React frontend, Django monolítico con refactor parcial, servicio IA FastAPI, PostgreSQL en contenedor Docker.
- Orquestación primaria por Docker Compose (servicios: db, db-mysql legado, backend, ai_service, frontend).

TO-BE (documentado en planes):
- Modular Monolith con límites hexagonales por bounded contexts; dominio puro separado en `core/`, adaptadores en `infrastructure/`, y composition root bien definido.

7. Frontend

AS-IS:
- `src/frontend/` con Vite, React 18, TailwindCSS, Three.js y dependencias para visualización y labs.
- Scripts para desarrollo y build en `src/frontend/package.json`.

TO-BE:
- Mantener frontend como capa de presentación desacoplada; exponer APIs v3 estables; refactor por features/contexts si procede.

8. Backend

AS-IS:
- `src/backend/` con coexistencia de capas: legacy (V1), refactor V2 (`api/logic/`) y dominio V3 (`core/`).
- `src/backend/api/views.py` expone V1, V2 y condicionalmente V3.
- `src/backend/infrastructure/config/dependencies.py` actúa como composition root simple.

TO-BE:
- Consolidar dominio en `src/backend/core/`, transformar `api/` en adaptadores finos, eliminar acoplamientos directos al ORM desde controladores.

9. IA

AS-IS:
- Servicio IA en `src/ai_models/` (FastAPI) con modelos `.h5` y notebooks de entrenamiento.
- Adaptador FastAPI en backend para solicitar sugerencias/productividad.

TO-BE:
- Servicio IA desplegado y gestionado como microservicio independiente con ciclo de vida propio; adaptación de endpoints para resiliencia (timeout, Circuit Breaker, mocks locales de fallback si IA no disponible).

10. IoT

AS-IS:
- Contratos y código para BeagleBone Black en `src/embedded/` (gateway MQTT, IA edge, sensores).
- Documentación de arquitectura Edge en `docs/edge/` y README.
- No hay definición de servicios MQTT en `docker-compose.yml` (brecha entre docs y despliegue).

TO-BE:
- Definir patrón de despliegue para Edge: mantener fuera del orquestador central o documentar claramente la integración (MQTT broker, sincronización y seguridad).

11. Base de datos

AS-IS:
- PostgreSQL 15 es la base principal; `schema_postgresql.sql` contiene tablas Django y `api_sensorreading`.
- `docker-compose.yml` expone PostgreSQL en `5544:5432`.
- Servicio `db-mysql` aparece como legado en Compose.

TO-BE:
- Mantener PostgreSQL; eliminar o justificar MySQL legado; asegurar migraciones y backups automatizados (pg_dump scripts documentados).

12. Infraestructura

AS-IS:
- Docker Compose orquesta los servicios principales; `.env.example` provee plantilla de variables.
- Documentación de despliegue en `docs/DEPLOYMENT.md` y `docs/DEPLOYMENT_AWS.md`.

TO-BE:
- Formalizar pipeline de CI/CD (GitHub Actions indicado como planificado), seguridad de contenedores, y separación de infra para Edge/Cloud.

13. Arquitectura hexagonal actual

AS-IS (implementada parcialmente):
- `src/backend/core/` contiene dominio puro (entities, value_objects, services).
- `src/backend/api/logic/` implementa puertos/adapters V2.
- `src/backend/infrastructure/` contiene adaptadores de persistencia (Django) y adaptadores externos (FastAPI IA, notificaciones).
- Endpoints V3 registrados condicionalmente; `dependencies.py` devuelve implementaciones concretas.

Limitaciones AS-IS:
- Fallback silencioso para V3 (ImportError) que puede ocultar fallos.
- `dependencies.py` es simple y no provee inyección universales ni configuración por contexto.

TO-BE (objetivo descrito en docs):
- Estructura clara: `core/domain`, `application`/use-cases, `ports`, `infrastructure/adapters`, y `interfaces/web` con composition root robusta.
- Retirar o encapsular versiones legacy (V1/V2) hasta su deprecación controlada.

14. Arquitectura objetivo

- Modular Monolith hexagonal por bounded contexts: laboratorios, telemetría, IA, cursos, usuarios.
- Dominio probado con `pytest` sin dependencia de DB; adaptadores sustituidos por mocks en pruebas de dominio.
- IA como microservicio independiente; Edge como nodos autónomos con sincronización.

15. Componentes legacy

- Vistas y ViewSets acopladas a ORM en `src/backend/api/views.py` (V1).
- Servicio `db-mysql` en `docker-compose.yml` (legado).
- Código de mezcla de dominio y persistencia en algunos módulos de `api/logic/`.

16. Componentes estratégicos

- `src/backend/core/` (dominio puro) — pieza estratégica para la migración.
- `src/backend/infrastructure/` adaptadores (Django ORM, FastAPI IA, notificaciones) — puntos de integración críticos.
- `src/ai_models/` — servicio IA con modelos preentrenados.
- `src/frontend/` — interfaz y laboratorios (valor de usuario directo).

17. Roadmap técnico (sugerido y alineado con documentación)

Fase 0 — Consolidación y saneamiento
- Asegurar línea base de tests y limpieza de .gitignore y dependencias.

Fase 1 — Consolidar dominio
- Mover lógica a `src/backend/core/`, añadir mappers y eliminar acoplamientos en `api/`.

Fase 2 — Tests y quality gates
- Escribir pruebas unitarias en `core/domain` y adaptadores; configurar CI (GitHub Actions).

Fase 3 — Retiro de legacy
- Plan de retirada de V1/V2 con criterios de aceptación y ventanas de despliegue.

Fase 4 — Infra y seguridad
- Revisar `docker-compose.yml`, eliminar servicios obsoletos, endurecer puertos, habilitar backups y monitoring.

Fase 5 — Edge & IA
- Definir patrón de despliegue para Edge (fuera/integrado) y madurar el servicio IA como microservicio gestionado.

18. Estado actual del proyecto (verificado)

- Rama de trabajo: `feature/refactor-modular-contexts`.
- Estado: migración intermedia hacia arquitectura hexagonal; coexistencia de V1/V2/V3.
- Archivos totales verificados: ~306. Documentación extensa presente (`docs/` ~74 archivos).
- Modo de trabajo: inspección estática, sin ejecución ni modificación.

---

AS-IS vs TO-BE (resumen rápido)

- Edge: AS-IS documentado pero no desplegado en Compose → TO-BE: decidir despliegue Edge fuera o integrado.
- MySQL: AS-IS servicio legado presente → TO-BE: eliminar o justificar su existencia.
- APIs: AS-IS V1/V2 coexistentes con V3 condicional → TO-BE: consolidar y exponer V3 estable, retirar V1/V2.
- Configuración: AS-IS `config/settings.ini` vacío y `.env.example` presente → TO-BE: una única fuente de configuración clara y documentada.


> Documento generado a partir de 01_REPOSITORY_AUDIT.md y la documentación encontrada en `docs/`. No se han ejecutado comandos ni realizado modificaciones al código.