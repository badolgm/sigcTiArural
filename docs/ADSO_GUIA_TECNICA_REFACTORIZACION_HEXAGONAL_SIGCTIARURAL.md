# GUÍA TÉCNICA COMPLETA DE REFACTORIZACIÓN A ARQUITECTURA HEXAGONAL / CLEAN ARCHITECTURE
## Proyecto: SIGC&T Rural (sigcTiArural)
### Guía de Estudio para Análisis y Desarrollo de Software (ADSO - SENA)

**Fecha de creación del documento:** 2026 (basado en sesiones de refactorización)
**Rama actual:** `feature/hex-refactor/phase-00-prep-baseline`
**Autor del análisis y ejecución:** Basado en trabajo colaborativo con Arquitecto de Software Senior
**Versión del documento:** 1.0 - Estado post-Fase 0
**Propósito:** Documento técnico exhaustivo como guía de estudio y manual de continuidad para retomar el proyecto. Nivel avanzado técnico para ADSO.

---

## 1. OBJETIVO GENERAL DEL PROYECTO Y DE LA REFACTORIZACIÓN

### 1.1 Objetivo del Proyecto SIGC&T Rural
Desarrollar una **plataforma web híbrida (Cloud + Edge)** que integra:
- IoT (sensores, robots en BeagleBone Black)
- Inteligencia Artificial (TensorFlow Cloud + TFLite Edge para diagnóstico de enfermedades en plantas)
- Educación técnica interactiva (laboratorios virtuales 3D de robótica, electrónica, matemáticas, telecom, ciencia de datos)
- Impacto social en zonas rurales de Colombia (alineado con ODS de la ONU y proyectos productivos SENA ADSO)

**Stack actual (2026):**
- Backend: Django 4.2 + DRF (monolito con intento parcial hexagonal)
- Frontend: React 18 + Vite + Three.js + Zustand (monolitos de labs muy grandes)
- AI Service: FastAPI + TensorFlow (MobileNetV2)
- DB: PostgreSQL 15 (con legacy MySQL)
- Infra: Docker Compose (5 servicios)
- Edge: Placeholders vacíos (BBB cluster documentado pero no implementado en código)

**Estado general antes de refactor:** Funcional para demos educativas, pero con alto acoplamiento, deuda técnica, zero tests, y no lista para producción real (seguridad, escalabilidad, mantenimiento).

### 1.2 Objetivo Específico de la Refactorización
**Refactorizar progresivamente el proyecto hacia Arquitectura Hexagonal (Ports & Adapters) combinada con Clean Architecture**, manteniendo **todas las funcionalidades existentes** (nunca romper lo que funciona).

**Principios rectores (del plan):**
- Strangler Fig Pattern + Branch by Abstraction + Migración Incremental.
- "Python puro" en el dominio (sin dependencias de Django, FastAPI, etc.).
- Testabilidad como primera clase (pytest sin DB para dominio).
- Documentación como código (actualizar bitácora, MASTERDOC, diagramas en cada fase).
- Verificación obligatoria por fase (docker up, curls, pytest, flujos UI manuales).
- Ramas por cambio importante + commits atómicos + `git add -p`.

**Meta final:** Proyecto 100% listo para producción (prod server, security, env vars estrictas, tests con cobertura, CI básico, sin legacy, full hexagonal en backend, frontend limpio, auth real, edge listo para hardware).

---

## 2. ARQUITECTURA DESEADA: HEXAGONAL + CLEAN ARCHITECTURE

### 2.1 ¿Qué es la Arquitectura Deseada?
**Hexagonal Architecture (Ports and Adapters / Onion / Clean Architecture adaptada)** para un sistema multi-servicio (Django + FastAPI + React + Edge).

**Diagrama conceptual de capas (adaptado del plan y C4 existente):**

```
[Interfaces / Adapters de Entrada]
  - Django Views (thin controllers, solo orquestan)
  - DRF Serializers (DTOs de entrada/salida)
  - FastAPI endpoints (AI)
  - Frontend React (adapters HTTP)

          ↓ (usa puertos)

[Application Layer / Use Cases]
  - Orchestrators (LaboratorioService, RobotCommandUseCase, etc.)
  - DTOs de aplicación

          ↓ (usa puertos de salida)

[Domain Layer (Core / Hexágono - Python Puro, sin framework)]
  - Entities / Value Objects (SensorReadingEntity, RobotAggregate, etc.)
  - Domain Services (LaboratorioService puro)
  - Domain Events
  - Ports (Interfaces abstractas):
    - RepositoryPort (list_recent_readings, save_telemetry...)
    - AIServicePort (predecir_enfermedad, obtener_sugerencias)
    - NotificationPort
    - EventBusPort (futuro)
  - Strategies / Factories (para los 4 laboratorios: robotica, agricultura, electronica, telecom)

          ↑ (implementados por)

[Infrastructure / Adapters de Salida]
  - Django ORM Adapter (mappers Entidad <-> Model)
  - FastAPI AI Adapter (HTTP client + fallback)
  - Console / Email / WebSocket Notification Adapter
  - MQTT Adapter (para edge futuro)
  - InMemory Adapter (para tests)

[Frameworks & Drivers (outermost)]
  - Django (models, migrations, admin, wsgi/asgi)
  - DRF
  - FastAPI + Uvicorn
  - React + Vite
  - PostgreSQL
  - Docker
```

**Características clave de esta arquitectura en el contexto del proyecto:**
- **Dominio aislado:** `src/backend/core/domain/` o `src/backend/api/logic/domain/` (mover/refinar) **no importa nada de Django**. Se puede testear con `pytest` puro.
- **Inyección de Dependencias explícita:** Composition Root en views/urls o un contenedor simple (no new() dentro de dominio).
- **Strangler Fig:** Endpoints legacy (V1 ViewSets directos a models) coexisten con V2/V3 que usan la capa hexagonal. Migración vertical por bounded context (Telemetry, Robots, Labs, etc.).
- **Mappers obligatorios:** Nunca exponer Django Models al dominio. Adapter de persistencia hace la traducción.
- **Bounded Contexts candidatos:** 
  - IoT / Telemetría (SensorReading, Robot, Commands)
  - Laboratorios Educativos (estrategias por tipo)
  - IA (predicción de enfermedades)
  - Usuarios / Auth (futuro)
- **Multi-servicio:** El AI Service es un adapter externo (HTTP). Edge (MQTT) será otro puerto.
- **Frontend:** Adoptar Feature-Sliced o Clean-Arch adaptada (entities, use-cases/adapters, ui). Extraer lógica de simulación de los labs gigantes (SchematicEditor ~80kB, ElectronicsLab ~74kB).
- **Production-ready cross-cutting:** Structured logging, error handling ports, config centralizada (pydantic-settings o django-environ), security (JWT real, CORS estricto, rate limiting), observability (healthchecks, /metrics básico).

**Ventajas para este proyecto (educativo + productivo + edge):**
- Testabilidad alta del dominio (simulaciones de labs, lógica de estrés hídrico, etc.) sin levantar DB ni Docker.
- Flexibilidad: Cambiar PostgreSQL por otro DB solo tocando adapter + migraciones.
- Mantenibilidad: Lógica de los 4 laboratorios centralizada y extensible (nuevo lab = nueva estrategia en factory).
- Resiliencia: Fallbacks en adapters (IA down → sugerencias básicas locales).
- Alineado con ADSO SENA: Demuestra principios SOLID, patrones (Strategy, Factory, Repository, Adapter), separación de concerns, TDD/characterization tests.

**Estado actual vs deseado (resumen técnico):**
- Existe `src/backend/api/logic/` con domain/ports/adapters (introducido Mayo 2026 como Strangler Fig).
- Cobertura real ~15-25%. Solo 2 endpoints V2 usan la lógica hexagonal.
- Legacy anémico domina (models.py como data bags, views directas a ORM, sim data duplicada).
- Sin entidades ricas, sin mappers reales, sin DI container, sin tests (hasta Fase 0).

---

## 3. PLAN DE REFACTORIZACIÓN (EXPLICACIÓN DETALLADA)

El plan está documentado en `docs/HEXAGONAL_REFACTOR_PLAN.md` (creado/actualizado en esta sesión).

**Metodología global:** 
- Strangler Fig Pattern (mantener legacy funcionando, introducir nueva impl "al lado").
- Vertical slices por bounded context (no big-bang).
- Cada fase: rama dedicada, cambios pequeños, verificación obligatoria (docker, curls, pytest, UI manual), commit atómico, actualización de bitácora + diagramas.
- Ramas: `feature/hex-refactor/phase-XX-...`

### 3.1 Fases del Plan (resumidas y expandidas)

**FASE 0 — Preparación, Baseline y Saneamiento Inmediato (P0 - Crítica) - COMPLETADA EN ESTA SESIÓN**
- Objetivo: Línea base segura + andamiaje.
- Realizado (detallado en sección 5):
  - Fix crítico /infer en FastAPI (removido Request param que causaba FastAPIError con Pydantic).
  - Actualización requirements backend (pytest).
  - Creación estructura tests: `src/backend/tests/`, `pytest.ini`, `tests/domain/test_factories.py`, `tests/domain/test_services.py` (characterization tests puros).
  - Creación y mejoras iterativas de `scripts/verify_refactor.ps1` (y .sh): contenedores robustos (docker ps + parseo), curl.exe, detección de no-running, pytest friendly, contadores $passed/$warnings/$failed + resumen final con colores.
  - Saneamiento menor (.gitignore implícito vía cambios).
  - Verificación: tests pasan, script ejecutable, contenedores healthy.
- Criterios de done: `pytest src/backend/tests/ -q` pasa, script da resumen útil, /infer devuelve JSON correcto.
- Rama: feature/hex-refactor/phase-00-prep-baseline (actual).

**FASE 1 — Consolidar y Mejorar el Núcleo Hexagonal Existente (P0 - Alta)**
- Mover/refinar `api/logic/` → estructura más limpia (`core/domain`, `application/`, `infrastructure/`).
- Definir Entities ricas + Value Objects.
- Mejorar Ports (métodos específicos por aggregate).
- Mappers en adapters.
- Mover sim data a dominio (eliminar duplicados en views).
- Tests exhaustivos (>70% cobertura dominio).
- Actualizar READMEs y docs.

**FASE 2 — Migrar Lógica de Negocio Principal (P1)**
- Vertical slices: Telemetry, Robots+Telemetry, Commands.
- Crear Use Cases en application layer.
- Vistas legacy → thin (delegan a use cases).
- Actualizar adapters.
- Tests de integración (mocks o test DB).
- Mantener legacy funcionando.

**FASE 3 — Capa de Infraestructura, Adaptadores y Composition Root (P1)**
- Extraer adapters a `infrastructure/`.
- Mappers bidireccionales reales.
- Composition Root simple (container.py o dependencies.py).
- Soporte InMemory para tests.
- Config centralizada.

**FASE 4 — Servicio de IA, Notificaciones y Resiliencia (P1)**
- Cablear adapter IA completo (incluyendo /suggest si aplica).
- Implementar adapters reales de notificaciones (WebSocket básico, etc.).
- Circuit breaker / retry en adapters externos.
- Tests de resiliencia (IA down → fallback).

**FASE 5 — Refactor Progresivo del Frontend (P2 - Alta complejidad)**
- Adoptar Feature-Sliced Design o Clean-Arch para React.
- Estructura: shared/, entities/, features/ (labs como features), widgets/, pages/, adapters/api/.
- Extraer lógica de simulación de labs gigantes (priorizar Electronics/Schematic).
- Centralizar API client (con manejo de env, errores).
- Actualizar hooks/stores para usar adapters.
- Mantener UI idéntica (demos paralelas si necesario).

**FASE 6 — Autenticación, Autorización y Protección (P2)**
- Añadir simplejwt (o similar).
- Endpoints reales login/register.
- Proteger vistas (IsAuthenticated + permisos).
- Actualizar frontend AuthContext.
- Modo demo configurable por env (para no romper demos educativas).
- Port CurrentUser si necesario.

**FASE 7 — Edge Computing, Ingesta y Eventos (P3)**
- Diseñar puertos: SensorIngestionPort, RobotCommandPort, EdgeInferencePort.
- Implementar adapters MQTT cuando hardware disponible.
- Event Bus (Redis/RabbitMQ) para async (alertas, telemetría).
- No bloquear otras fases.

**FASE 8 — Pruebas, Observabilidad, Hardening, Deprecación y Cierre (P0 ongoing)**
- Cobertura meta: >60% backend domain/application, >40% overall.
- E2E ligeros (puppeteer ya en deps).
- Prod ready:
  - Backend: gunicorn + Daphne (o uvicorn workers) en Dockerfile (no runserver).
  - SECRET_KEY real, DEBUG=False por default, ALLOWED_HOSTS estricto.
  - Whitenoise o similar para static.
  - Rate limiting, structured logging (structlog).
- Eliminar legacy (solo después de verificación full).
- Quitar db-mysql si no se usa.
- Actualizar TODOS diagramas + MASTERDOC + README.
- Healthchecks robustos, métricas básicas.
- Documento final "Arquitectura Objetivo Alcanzada" + lecciones.

**Cronograma aproximado (del plan):** Fase 0 (1 sem), 1 (1.5 sem), 2-3 (2-3 sem), 4-6 (3-4+ sem), 7 variable, 8 (2 sem). Total ~4.5-7 meses part-time.

**Herramientas recomendadas:** pytest + pytest-django (gradual), ruff, mypy gradual en core/domain, etc.

---

## 4. ESTADO ACTUAL DEL PROYECTO (INVENTARIO TÉCNICO DETALLADO - JUNIO 2026)

### 4.1 Rama y Cambios Recientes
- **Rama actual:** `feature/hex-refactor/phase-00-prep-baseline` (up-to-date con origin en algunos commits previos).
- **Cambios en esta sesión de refactor (Fase 0):**
  - `src/ai_models/fastapi_app.py`: Reemplazo completo de `async def infer(...)` para eliminar `request: Optional[Request] = None` (causaba `FastAPIError: Invalid args for response field` con Pydantic/Starlette). Versión minimalista solo con `file: Optional[UploadFile]`.
  - `src/backend/requirements.txt`: Agregada sección de Testing con `pytest>=7.4`.
  - `src/backend/pytest.ini`: Nueva configuración (pythonpath=., testpaths=tests, sin forzar Django aún).
  - `src/backend/tests/`: Estructura completa creada:
    - `tests/__init__.py`, `tests/conftest.py`, `tests/domain/__init__.py`
    - `tests/domain/test_factories.py`: 5 tests characterization (ROBOTICA, case-insensitive, TELECOM, error ValueError, instancias frescas).
    - `tests/domain/test_services.py`: 5 tests (default, cambiar_laboratorio, ejecutar_analisis estructura, simulacion default 24, manejo error init). Ajustes para characterization real (service no forwardea 'horas').
  - `scripts/verify_refactor.ps1`: Creado e **mejorado iterativamente** (varias rondas):
    - Reemplazo total `curl` → `curl.exe` (alias PowerShell conflictivo).
    - Detección contenedores robusta (try/catch, Trim/Where-Object, -contains, docker ps directo para evitar warning "version: obsolete").
    - Manejo explícito $LASTEXITCODE en backend tests (mensaje claro "container probably not running").
    - Pytest section: chequeo comando + módulo, fallback python -m pytest, mensajes ultra amigables con comandos exactos de instalación.
    - Contadores globales `$passed`, `$warnings`, `$failed`.
    - Resumen final al final del script con conteos + "=== Resumen Fase 0 ===" coloreado (rojo/amarillo/verde).
  - `scripts/verify_refactor.sh`: Versión básica creada para Linux/macOS.
  - `src/ai_models/test_leaf.jpg`: Imagen de prueba generada para /infer.
- **Git status actual (al momento de este documento):** Cambios unstaged/modificados en requirements, fastapi_app, verify.ps1; untracked: tests/, pytest.ini, verify.sh, test_leaf.jpg.
- **Commits relacionados:** f23516a (docs: agregar plan), 2eaa425 (ARCH final hexagonal previo), etc. Rama dedicada para Fase 0.

### 4.2 Inventario Técnico por Componente (Estado Junio 2026)

**Backend (Django):**
- Estructura: `src/backend/api/` (models anémicos, views legacy + V2 parcial, serializers, urls mixtas, logic/ con domain/ports/adapters).
- `logic/domain/`: 4 estrategias + services + factories + interfaces (puro Python, usa random/datetime para sims).
- `logic/ports/`: RepositoryInterface, AIServicePort, NotificationPort (abstractos).
- `logic/adapters/`: DjangoRepository (usa strings 'api.Model' + apps.get_model - frágil), FastAPI_AIAdapter (con fallback), ConsoleNotification.
- Problemas: Acoplamiento alto, duplicación sim data, sin mappers, sin entidades ricas, sin DI real, views no thin.
- Tests: **Nuevo en Fase 0** - 10 characterization tests puros en `tests/domain/`. pytest.ini configurado.
- Settings: DEBUG=True, ALLOWED_HOSTS=['*'], SECRET_KEY dev inseguro, sin simplejwt, sin whitenoise, WSGI (no ASGI completo aunque docs mencionan Channels).
- Requirements: Actualizado con pytest. Falta gunicorn, etc.
- Migrations: 2 existentes (SensorReading + Robot/Telemetry/Command).
- Users app: Casi vacío.

**AI Service (FastAPI):**
- `src/ai_models/fastapi_app.py`: /health, /assist (voz+PG), /analyze-circuit, **/infer arreglado en Fase 0** (solo file multipart, reutiliza load_latest_model + preprocess_image, mock estable "Tomato_Early_blight", escribe INFER_LOG).
- Problema previo: Faltaba /infer (causaba fallback siempre). Ahora funcional.
- Modelo: plant_disease_mbv2.h5 (MobileNetV2), metadata binario ("enferma"/"sana") pero entrenamiento full PlantVillage.
- Reqs: Pesado (tensorflow-cpu, etc.). Usa psycopg2 directo (bypass backend en algunos casos).
- Dockerfile: Multi-stage con ffmpeg, etc.

**Frontend (React):**
- Estructura monolítica: pages/, labs/ (archivos gigantes), components/, stores (zustand para electronics), hooks (useRoboticsApi), services/cloud.js (mezcla mocks y externos).
- Problemas: Lógica de simulación + UI mezclada en labs (SchematicEditor 80kB+, Electronics 74kB+), hardcode URLs, auth demo-only, no centralizado API client.
- Sin tests frontend visibles.
- Vite + Tailwind + Three.js + ReactFlow + Recharts.

**Infra y DevOps:**
- docker-compose.yml: 5 servicios (db postgres, db-mysql legacy, backend, ai_service, frontend nginx). Warning "version: obsolete".
- Backend Dockerfile: usa runserver (dev).
- AI Dockerfile: uvicorn.
- Scripts: verify_refactor.ps1 (mejorado), docker_maintain.ps1, generate-*.mjs, physics_sim.py, etc.
- No CI visible, no prod deployment config (gunicorn, env strict, etc.).
- .env.example básico.

**Documentación:**
- Extremadamente rica: MASTERDOC.md, PLAN_MAESTRO.md, INFORME_ANALISIS_Y_PLAN_DE_ACCION.md (bitácora con sesiones Mayo 2026 hexagonal), diagrams/ (C4, ER, UML), architecture/, uml/, reports/.
- HEXAGONAL_REFACTOR_PLAN.md actualizado con Fase 0.
- Drift docs vs código (Channels mencionado pero no en reqs).

**Otros:**
- Edge: 3 carpetas con archivos 0 bytes.
- No tests E2E frontend (puppeteer en deps root pero no usado).
- Base de datos: schema_postgresql.sql, import scripts.

**Estado de Fase 0 (criterios del plan):**
- Tests: `pytest src/backend/tests/domain/ -q` → pasa (10 tests).
- Verify script: Ejecutable, da conteos + resumen coloreado.
- /infer: Funciona (retorna JSON con diagnosis/confidence/status).
- Contenedores: Verificables con script.
- No se tocó legacy ni UI.

---

## 5. CAMBIOS DE REFACTORIZACIÓN REALIZADOS (DETALLE TÉCNICO)

### 5.1 Cambios en Código Fuente
- **AI Service (fix integración crítica):**
  - Archivo: `src/ai_models/fastapi_app.py`
  - Antes: infer aceptaba Request para base64 + file (causaba error Pydantic al startup del contenedor).
  - Después: Solo `file: Optional[UploadFile] = File(default=None)`. Lógica minimalista: read → preprocess → predict (o mock) → result con log a INFER_LOG.
  - Compatibilidad: Mantiene formato esperado por adapter backend y frontend AIPredictiva.
  - Diff clave: Removida rama elif request, simplificado if file is None, mock estable.

- **Backend Domain Tests (characterization - primer paso hacia testabilidad):**
  - Nueva estructura completa en `src/backend/tests/`.
  - `test_factories.py`: Tests puros que verifican comportamiento actual de LaboratorioStrategyFactory (incluyendo error ValueError y case insensitivity).
  - `test_services.py`: Tests de LaboratorioService (delegación a estrategias, estructura de resultados, longitud simulaciones). Ajustes para reflejar que el service actual **no forwardea** parámetros a la estrategia (characterization real, no idealizada).
  - Importan directamente de `api.logic.domain.*` (funciona con pythonpath en pytest.ini).
  - Sin Django: Corren en aislamiento.

- **Requirements y Config de Tests:**
  - `src/backend/requirements.txt`: Sección Testing agregada.
  - `src/backend/pytest.ini`: Config básica (testpaths=tests, pythonpath=., addopts para quiet + short tb). Comentado DJANGO_SETTINGS para futuro.

### 5.2 Scripts Utilizados y Creados/Mejorados
- **scripts/verify_refactor.ps1** (principal, mejorado en múltiples iteraciones):
  - Estructura: 5 secciones numeradas + resumen final.
  - Mejoras aplicadas:
    - curl → curl.exe explícito (con comentario detallado sobre alias PowerShell).
    - Contenedores: try/catch + parseo robusto (Trim, Where-Object, -contains) + fallback a docker ps directo (evita warning version:).
    - Backend tests: Chequeo explícito $LASTEXITCODE → mensaje claro "container probably not running".
    - Pytest: Doble chequeo (Get-Command + python -c import), fallback python -m pytest, mensajes con comandos exactos de pip + venv.
    - Contadores: $passed, $warnings, $failed incrementados en cada check.
    - Resumen final: Conteos + "=== Resumen Fase 0 ===" con color dinámico (basado en failed/warnings).
  - Uso: `.\scripts\verify_refactor.ps1` o con `-StartServices`.
  - También genera test_leaf.jpg si falta.

- **scripts/verify_refactor.sh**: Versión bash básica (contenedores, curls, pytest).

- Otros scripts existentes (usados/referenciados): docker_maintain.ps1, generate-diagrams.mjs, run_local_*.ps1, etc. (para docs y mantenimiento).

### 5.3 Cambios en Estructura y Config
- Creación de `src/backend/tests/domain/` con characterization tests (primera base para >60% cobertura futura).
- Actualizaciones menores en .gitignore (implícito por cambios previos en sesión).

### 5.4 Documentación Actualizada
- `docs/HEXAGONAL_REFACTOR_PLAN.md`: Plan completo incorporado/actualizado con Fase 0 ejecutada.
- Este documento (el que estás leyendo).

---

## 6. ESTADO PARA LLEGAR AL OBJETIVO PLANTEADO

**Progreso general:** ~10-15% del refactor hexagonal + prep para producción (solo Fase 0 completada + algunos fixes previos de labs).

**Lo que está "listo" (post Fase 0):**
- Integración IA básica funcional (/infer estable).
- Tests unitarios puros del dominio (10 tests characterization).
- Script de verificación robusto para Windows (con resumen automático).
- Base de pytest configurada.
- Rama y commits atómicos.
- Conocimiento claro del plan y gaps.

**Brechas mayores (ver sección 7 para backlog exhaustivo):**
- Arquitectura: Solo ~20% hexagonal real (legacy domina, sin mappers, sin entities, sin composition root).
- Tests: 0 cobertura en adapters, views, integración E2E, frontend.
- Producción: DEBUG, runserver, sin auth real, sin gunicorn, CORS abierto, sin logging estructurado, db-mysql legacy, sin CI/CD.
- Frontend: Monolitos de código (imposible mantener).
- Edge: 0% código (solo docs).
- Seguridad/Auth: Demo-only.
- Docs drift vs código.

**Métricas actuales (aprox):**
- Cobertura tests: ~0% (solo los 10 nuevos de dominio).
- Endpoints usando hexagonal: 2 de muchos.
- Archivos legacy vs nuevo: Mayoría legacy.
- Listo para prod: No (crítico para seguridad y estabilidad).

---

## 7. TODO ABSOLUTO: TODO LO QUE FALTA PARA 100% LISTO PARA PRODUCCIÓN + ARQUITECTURA COMPLETA

**Categorizado por prioridad y área. Cada ítem incluye archivos aproximados a tocar y estimación.**

### 7.1 Arquitectura Hexagonal (Core - Bloqueante para todo lo demás)
- [ ] Mover/refinar `api/logic/` a estructura limpia (`core/domain`, `application/`, `infrastructure/persistence/django/`, `interfaces/web/api/`).
  - Archivos: Nueva estructura + mappers.
- [ ] Definir Entities ricas + VOs (SensorReadingEntity, Robot, Telemetry, Command aggregates con invariantes).
- [ ] Mejorar Ports (métodos query/command específicos, no solo listar_todos(string)).
- [ ] Implementar mappers completos en todos adapters (nunca pasar Models al dominio).
- [ ] Composition Root real (dependencies.py o container).
- [ ] Mover toda lógica de simulación/generación histórica a estrategias de dominio (eliminar de views.py legacy).
- [ ] Actualizar V2 views para usar use cases puros.
- [ ] Refactor AI adapter y ports para /suggest si se usa.

### 7.2 Migración de Lógica de Negocio (Backend Legacy → Hexagonal)
- [ ] Vertical slice 1: Telemetry (history V1/V2, models → entities).
- [ ] Vertical slice 2: Robots + RobotTelemetry.
- [ ] Vertical slice 3: RobotCommand (escritura, comandos a edge).
- [ ] Crear Use Cases en application layer.
- [ ] Hacer vistas legacy thin (solo llaman application + devuelven DTOs).
- [ ] Actualizar urls para mantener legacy + nuevo.
- [ ] Tests de integración por slice (con mocks de ports o test DB).

### 7.3 Infraestructura y Adaptadores
- [ ] Extraer todos adapters a infrastructure/.
- [ ] Soporte InMemoryRepository para tests puros.
- [ ] Config centralizada (pydantic o django settings limpio).
- [ ] Adapter de notificaciones real (al menos WebSocket básico vía Channels o Redis).

### 7.4 AI Service y Resiliencia
- [ ] Completar wiring de /suggest o integrarlo en dominio.
- [ ] Circuit breaker/retry en AI adapter (tenacity).
- [ ] Tests de resiliencia (simular AI down).
- [ ] Posiblemente mover infer logic si se quiere (pero mantener FastAPI como adapter).

### 7.5 Frontend (Limpieza masiva - uno de los mayores dolores)
- [ ] Adoptar estructura Feature-Sliced / Clean (shared/ui, entities, features/labs/*, adapters/api).
- [ ] Centralizar API client (con baseURL desde env, interceptors de error, auth).
- [ ] Extraer lógica de simulación de ElectronicsLab + SchematicEditor (mover a features/electronics/model o similar).
- [ ] Refactor labs grandes en fases (empezar por los más pequeños).
- [ ] Actualizar useRoboticsApi, cloud.js, useLabStore para usar adapters limpios.
- [ ] Auth real (integrar con backend JWT).
- [ ] Tests unitarios de features/adapters (vitest o jest).
- [ ] Resolver hardcodes de URLs y mezcla prod/local.

### 7.6 Autenticación, Seguridad y Protección (Crítico para prod)
- [ ] Añadir djangorestframework-simplejwt a requirements.
- [ ] Endpoints reales /auth/login, /auth/register (o usar allauth).
- [ ] Proteger todos los endpoints (IsAuthenticated, permisos por rol si aplica).
- [ ] Actualizar frontend AuthContext para usar tokens reales (access+refresh).
- [ ] Mantener "modo demo" por env (VITE_DEMO_MODE o similar) para no romper demos educativas.
- [ ] CORS estricto (no * en prod).
- [ ] Rate limiting básico.
- [ ] SECRET_KEY real vía env (nunca default).
- [ ] ALLOWED_HOSTS estricto.
- [ ] HTTPS en prod (nginx o proxy).

### 7.7 DevOps, Producción y Hardening (100% listo para prod)
- [ ] Backend Dockerfile: Cambiar CMD a gunicorn + Daphne/uvicorn workers (no runserver).
- [ ] Añadir gunicorn, whitenoise (o collectstatic config) a requirements.
- [ ] Settings: DEBUG=False por default, logging estructurado (structlog o django-structlog).
- [ ] Healthcheck endpoint robusto + /metrics básico (para docker/orchestrator).
- [ ] Quitar db-mysql del compose (o documentar por qué legacy).
- [ ] Variables de entorno estrictas (.env.example completo, validación en settings).
- [ ] .dockerignore completo.
- [ ] CI básico (GitHub Actions: lint, tests, build images) - scripts ya existen para generar reports.
- [ ] Deployment docs actualizados (DEPLOYMENT.md ya existe, expandir con prod).
- [ ] Monitoreo básico (logs centralizados).
- [ ] Backup scripts para DB (ya hay algo en scripts).
- [ ] Eliminar pycache del repo (actualizar .gitignore si falta).
- [ ] Actualizar docker-compose para prod (perfiles o override).

### 7.8 Testing y Calidad
- [ ] Cobertura completa de adapters (mocks).
- [ ] Tests de integración (con test DB o pytest-django).
- [ ] E2E frontend (puppeteer/playwright - ya hay deps).
- [ ] Aumentar tests de dominio (agregar para todas las estrategias, edge cases de simulaciones).
- [ ] pytest-django cuando se necesite.
- [ ] Cobertura report (pytest-cov) + meta >60% domain.
- [ ] Linting/formatting (ruff + pre-commit).
- [ ] mypy gradual en core/domain.

### 7.9 Edge Computing e Integraciones
- [ ] Implementar código real en src/embedded/ (mqtt_broker, tflite_api, sensor_reader) - actualmente 0 bytes.
- [ ] Puertos para ingesta MQTT y comandos.
- [ ] Adapter MQTT real.
- [ ] Event bus (Redis pub/sub recomendado) para async.
- [ ] Integración real con hardware BBB cuando esté disponible (test con mocks primero).
- [ ] Actualizar docs EDGE_SETUP.md si es necesario.

### 7.10 Documentación y Continuidad
- [ ] Actualizar MASTERDOC.md, diagrams/, C4, ER con estado post-refactor (cada fase).
- [ ] Actualizar INFORME_ANALISIS_Y_PLAN_DE_ACCION.md con entrada de Fase 0 + siguientes.
- [ ] Actualizar README.md (estado real "Hexagonal incipiente X%", link a esta guía).
- [ ] Este documento (mantenerlo vivo).
- [ ] Guía de contribución (cómo correr tests, verify script, cómo agregar nuevo lab).
- [ ] Screenshots/ videos de verificación (usar puppeteer si existe).
- [ ] Actualizar PLAN_MAESTRO.md con progreso real.

### 7.11 Otros / Limpieza
- [ ] Remover código legacy una vez slices migrados (con feature flags o fecha de deprecación).
- [ ] Consolidar URLs hardcodeadas (frontend, AI adapter, etc.) en config central.
- [ ] Revisar y limpiar notebooks vs prod model (metadata vs entrenamiento full).
- [ ] Posible separación de bounded contexts en paquetes si crece (core_iot, core_labs, etc.).
- [ ] Performance: Optimizar simulaciones pesadas (Electronics).
- [ ] Accesibilidad y responsive en frontend (ya es mobile-first pero revisar labs grandes).
- [ ] Licencia, contribs, SENA artifacts actualizados si aplica.

**Total estimado de ítems faltantes:** 60+ tareas técnicas detalladas. Prioridad: Arquitectura + Seguridad + Tests + Prod Docker primero. Luego Frontend + Edge.

**Criterio final de "100% listo":**
- `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up` funciona sin warnings críticos.
- `pytest --cov=src/backend --cov-fail-under=60`.
- Todos los curls del verify script dan OK sin warnings.
- DEBUG=False, SECRET_KEY desde env, auth real protegida.
- Cobertura de los 4 laboratorios + IoT + IA en dominio hexagonal.
- Frontend con features limpios y tests.
- Edge con código funcional (mocks o real).
- Docs 100% sincronizados.
- Script verify da "¡Todo bien!" en verde.

---

## 8. GUÍA PARA RETOMAR EL PROYECTO (CÓMO CONTINUAR)

1. **Checkout y setup inicial:**
   ```powershell
   git checkout feature/hex-refactor/phase-00-prep-baseline
   cd "C:\Users\Devbadolgm\WorkSpace\ProjectsAndDatasets\Clon-sigcTiArural\sigcTiArural"
   # Instalar deps
   cd src\backend
   python -m pip install -r requirements.txt
   # (Opcional) venv
   ```

2. **Verificar estado actual (obligatorio siempre):**
   ```powershell
   # Desde raíz
   .\scripts\verify_refactor.ps1
   # O con servicios:
   .\scripts\verify_refactor.ps1 -StartServices
   ```
   - Esperar "Uvicorn running" en logs de ai_service.
   - El script debe mostrar conteos y "=== Resumen Fase 0 ===" en verde (si todo bien).

3. **Correr tests de dominio:**
   ```powershell
   cd src\backend
   python -m pytest tests/domain/ -q --tb=short
   ```

4. **Próximo paso recomendado (después de Fase 0):**
   - Revisar este documento completo.
   - Leer `docs/HEXAGONAL_REFACTOR_PLAN.md` (especialmente FASE 1).
   - Crear nueva rama: `feature/hex-refactor/phase-01-consolidate-domain`.
   - Comenzar por consolidar el núcleo hexagonal (ver sección 3 de este doc).
   - Actualizar INFORME_ANALISIS_Y_PLAN_DE_ACCION.md con "Inicio Fase 1".
   - Usar siempre `git add -p` y verificar con el script.

5. **Convenciones de trabajo:**
   - Nunca romper legacy hasta que el slice esté migrado + verificado.
   - Cada fase: actualizar este documento + plan + bitácora.
   - Verificación mínima por cambio: pytest + verify script + curls manuales + UI si aplica.
   - Commits: "chore(hex): ...", "feat(hex): ...", "fix(hex): ...".
   - Si hay dudas técnicas: consultar diagrams/ y MASTERDOC.md.

6. **Cómo saber que estás en el camino correcto:**
   - Los tests de dominio crecen.
   - El verify script muestra más "OK" y menos warnings.
   - Las vistas legacy empiezan a delegar (no contienen lógica).
   - No hay "import django" dentro de domain/.

**Ruta exacta de este documento:**
`C:\Users\Devbadolgm\WorkSpace\ProjectsAndDatasets\Clon-sigcTiArural\sigcTiArural\docs\ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`

---

## 9. REFERENCIAS Y ANEXOS

- Plan principal: `docs/HEXAGONAL_REFACTOR_PLAN.md`
- Bitácora histórica: `docs/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md`
- Arquitectura visual: `docs/diagrams/`, `docs/uml/`, `docs/architecture/`
- MASTERDOC y PLAN_MAESTRO (visión general y roadmap).
- Código clave actual:
  - Dominio: `src/backend/api/logic/domain/`
  - Tests: `src/backend/tests/domain/`
  - Verify: `scripts/verify_refactor.ps1`
  - AI fixed: `src/ai_models/fastapi_app.py`
- Diagramas C4 existentes muestran la visión "ideal" vs actual.

**Notas finales para ADSO:**
Este proyecto es un excelente caso de estudio real de:
- Deuda técnica vs refactor incremental.
- Aplicación de patrones de arquitectura en un stack mixto (Django + React + microservicio AI).
- Importancia de characterization tests antes de refactor grande.
- Strangler Fig en práctica.
- Diferencia entre "funciona para demo" y "listo para producción".

Mantén este documento vivo. Cuando retomes, actualiza la sección de estado y agrega tu nombre/fecha en "Progreso".

**Fin del documento.**

*Documento generado como guía técnica exhaustiva para ADSO. Actualizar en cada fase de refactorización.*## 10. PROGRESO AUTÓNOMO - 02 de Junio 2026

**Fecha/hora de la sesión:** 02 de Junio 2026 (durante la interacción actual como Arquitecto Autónomo)
**Rama de trabajo:** eature/hex-refactor/phase-00-prep-baseline
**Enfoque:** Tareas de bajo riesgo únicamente (documentación, testing characterization, pulido de scripts, mejoras de calidad sin impacto en lógica de negocio). Metodología conservadora con validaciones frecuentes vía git status, git diff y erify_refactor.ps1.

### Tareas seguras identificadas y ejecutadas (basado en análisis de Sección 7)

De **7.8 Testing y Calidad** (prioridad alta para esta sesión):
- Agregar más characterization tests de dominio (para todas las estrategias y edge cases de procesar).
- Agregar soporte de cobertura (pytest-cov) de forma segura (solo en requirements e ini, sin forzar en todos los runs).

De **7.10 Documentación y Continuidad**:
- Mantener vivo "este documento" agregando esta sección 10 (sin modificar contenido previo, solo append al final).

De pulido general (bajo riesgo):
- Mejorar el script scripts/verify_refactor.ps1 específicamente en la sección de contenedores para ignorar mejor los warnings de "version: obsolete" de docker-compose (filtro más robusto en la tubería).

**NO se ejecutaron** (por riesgo):
- Cualquier tarea de 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 7.9 (mover carpetas, entities, mappers, cambios en legacy views, dockerfiles, settings prod, edge impl, etc.).
- Modificaciones a lógica de negocio, vistas, models o adapters existentes.

### Comandos y acciones ejecutadas (en orden, con resultados)

1. **Confirmación inicial de estado (baseline):**
   `powershell
   cd "C:\Users\Devbadolgm\WorkSpace\ProjectsAndDatasets\Clon-sigcTiArural\sigcTiArural"
   git branch --show-current
   git status --short
   `
   Resultado: En rama correcta. Cambios previos staged/untracked de Fase 0 (tests, script, requirements, etc.). Ningún cambio en lógica de negocio.

   `powershell
   .\scripts\verify_refactor.ps1
   `
   Resultado (resumido):
   - [2] ERROR en contenedores (esperado, Docker no tenía servicios relevantes corriendo en este entorno; mostró warning de version pero se manejó en catch).
   - [3] AI: 2 OKs (health e infer con test image) ->  incrementado.
   - [4] Backend: 2 ERRORs (contenedores no up) -> .
   - [5] pytest: corrió 10 tests (en ese momento) + output.
   - Resumen: 3 passed, 0 warnings, 3 failed (luego actualizado).

2. **Mejora de testing - agregar pytest-cov (seguro, solo dep dev):**
   `powershell
   # Edit via tool (search_replace for precision)
   `
   Actualizado src/backend/requirements.txt agregando:
   `
   pytest-cov>=4.0
   `
   (Bajo la sección de Testing).

3. **Actualizar pytest.ini para cobertura y mejores opciones:**
   `powershell
   # Edit via search_replace
   `
   Cambios:
   - addopts incluye --cov=api --cov-report=term-missing --cov-report=html
   - Agregados comentarios explicando uso futuro y nota sobre correr desde src/backend.
   - Cambiado cov de "src/backend" a "api" para que funcione correctamente cuando se ejecuta pytest desde el directorio backend/ (los tests importan como "api.*").

4. **Ejecutar tests para validar (frecuente):**
   `powershell
   cd "C:\Users\Devbadolgm\WorkSpace\ProjectsAndDatasets\Clon-sigcTiArural\sigcTiArural\src\backend"
   python -m pytest tests/domain/ -q --tb=no -o "addopts=-q --tb=no"
   `
   Resultado: 19 passed in 0.08s (antes eran ~10; se agregaron nuevos sin romper nada).

   Con cov (después de pip install temporal):
   `powershell
   python -m pip install -q pytest-cov
   python -m pytest ... --cov=api ...
   `
   Resultado: 19 passed. (Nota: warning de coverage porque el módulo "api" se importa desde los tests; en uso real con PYTHONPATH correcto funciona. No se rompió la suite.)

5. **Agregar más characterization tests (seguro, solo tests):**
   - Edit de src/backend/tests/domain/test_factories.py (append al final):
     Agregados 5 tests nuevos:
     - test_obtener_estrategia_agricultura
     - test_obtener_estrategia_electronica
     - test_obtener_estrategia_telecomunicaciones_full
     - test_todos_los_tipos_son_subclases_de_strategy
   - Edit de src/backend/tests/domain/test_services.py (append):
     Agregados 5 tests nuevos para procesar de las estrategias (casos determinísticos de estres, estabilidad, estructura) + smoke test para los 4 tipos:
     - test_agricultura_procesar_estres_critico
     - test_agricultura_procesar_estres_moderado
     - test_electronica_procesar_estabilidad
     - test_telecom_procesar_estructura
     - test_todos_los_servicios_retornan_dict_con_estado
   Total ahora: **19 tests de dominio** (caracterización del comportamiento actual de factories y services/estrategias, incluyendo random pero verificando keys/estructura/rangos donde aplica).

6. **Pulido del script verify_refactor.ps1 (bajo riesgo, solo mejora de robustez y comentarios):**
   - Edit via search_replace en la sección [2] Check container status:
     - Agregado comentario explícito sobre el warning "version: obsolete".
     - Mejorado el pipeline de  para filtrar explícitamente líneas con 'WARNING|obsolete|level=warning' (además del 2>).
     - Esto hace la detección más robusta incluso cuando docker-compose emite warnings a stderr/stdout.
   - No se tocaron otras secciones críticas (curl.exe ya estaba, contadores, etc.).
   - Validación post-edit:
     `powershell
     git diff scripts/verify_refactor.ps1
     .\scripts\verify_refactor.ps1   # (se ejecutó para chequear que no se rompió la salida)
     `

7. **Validaciones frecuentes de no-breakage (metodología):**
   - Múltiples git status --short
   - git diff --no-color --shortstat
   - .\scripts\verify_refactor.ps1 (varias veces)
   - python -m pytest tests/domain/ ... (con override de addopts para no depender de cov en el shell actual)
   - Ningún cambio afectó lógica de negocio, vistas, AI core (más allá de lo ya arreglado), o estructura de carpetas.

**Resultados de validación:**
- Todos los 19 tests de dominio pasan consistentemente.
- El script de verificación se ejecuta sin errores de sintaxis y produce el resumen final (aunque con errores esperados por falta de contenedores Docker en el entorno de esta sesión).
- No se introdujeron breaking changes (git diff muestra solo adiciones en tests/ini/requirements y pulido en script).
- Cobertura: Los nuevos tests cubren más paths de procesar en agricultura, electronica y telecom (además de los existentes para robotica y factories).

### Resumen de lo avanzado en esta sesión autónoma
- **Testing:** +9 characterization tests (ahora cubren los 4 laboratorios de forma más completa). Soporte de pytest-cov añadido de forma no intrusiva.
- **Script:** 1 mejora significativa de robustez en detección de contenedores (mejor filtrado de warnings de docker-compose).
- **Documentación:** Esta sección 10 agregada (siguiendo la regla de solo append al final del documento).
- **Total de "pruebas/checks" impactados positivamente:** Mayor cobertura de dominio + script más confiable contra warnings comunes.
- **Riesgo:** Cero para funcionalidades existentes (solo tests, config de test, pulido de script de verificación, y append a docs).

### Pendiente / No tocado (por reglas)
- Todo lo listado en 7.1-7.7, 7.9 (alto riesgo estructural o de prod).
- Actualizaciones a otros documentos (MASTERDOC, INFORME, README) — se documenta aquí pero no se ejecutó para mantener foco en "este documento".
- Cualquier cambio que requiera aprobación explícita del usuario.

### Próximos pasos recomendados (basado en Sección 8 del documento)
1. Instalar deps actualizadas: cd src\backend && pip install -r requirements.txt
2. cd src\backend && python -m pytest tests/domain/ -q --cov=api --cov-report=term-missing (ahora con cov).
3. Ejecutar .\scripts\verify_refactor.ps1 -StartServices cuando los contenedores estén disponibles.
4. Proceder a Fase 1 (consolidar núcleo hexagonal) solo después de revisión y aprobación.
5. Actualizar esta sección 10 con nuevo progreso cuando se retome.

**Fin de la sección 10 (agregada el 02 de Junio 2026 siguiendo instrucciones estrictas).**

*Todo el trabajo se realizó con git status/diff/verify frecuentes. Ninguna funcionalidad de negocio o endpoint legacy fue modificada.*

### Progreso adicional en esta sesión (bajo riesgo, continuando la sesión anterior)

**Tareas ejecutadas (conservadoras, Sección 7.8 y pulido de script):**

1. **Mejora de tests de dominio (agregados 5 nuevos tests enfocados en edge cases de procesar):**
   - Edit via search_replace en src/backend/tests/domain/test_services.py (append al final del archivo).
   - Nuevos tests:
     - test_agricultura_procesar_con_imagen_analizada (verifica que enfermedad está en la lista actual cuando imagen_analizada=True)
     - test_agricultura_procesar_boundary_estres (characterization exacta de los thresholds >35/<30 Crítico, >30/<45 Moderado, resto Bajo)
     - test_agricultura_sugerencia_riego_boundary (hum < 50 actual behavior, incluyendo ==50)
     - test_electronica_procesar_nodos_boundary_estabilidad (nodos <10 Alta, >=10 Compleja)
     - test_electronica_procesar_empty_componentes (comportamiento actual con lista vacía, sin división por cero)
   - Total tests de dominio ahora: **24** (19 previos +5).
   - Enfoque: characterization (verificar comportamiento actual del código, no lo "ideal").

2. **Fix de test existente:**
   - Ajustado test_agricultura_procesar_boundary_estres para reflejar fielmente la lógica actual del if/elif (evitando expectativas incorrectas que fallaban).

3. **Pulido de scripts/verify_refactor.ps1:**
   - Mejoras en sección [4] Backend: mensajes de ERROR ahora incluyen comando accionable explícito (docker-compose up -d backend or use -StartServices flag).
   - Mejoras en sección [2] contenedores: mensajes de WARNING ahora accionables (start with: docker-compose up -d  or rerun script with -StartServices).
   - Mejora grande en "Resumen final":
     - Agregado encabezado "Checks ejecutados en esta verificación:" para claridad.
     - Agregada "Nota:" explicando qué secciones contribuyen a los conteos (2,3,4) y que pytest (5) es separado.
     - En el bloque de "Hay errores graves": ahora incluye "Acción recomendada: ..." con comando concreto.
     - Similar para warnings.
     - Agregados comentarios en el código para los cambios.
   - Validación: el script ahora produce output más útil y amigable cuando servicios no corren.

**Comandos y validaciones ejecutadas frecuentemente:**
`powershell
cd "C:\Users\Devbadolgm\WorkSpace\ProjectsAndDatasets\Clon-sigcTiArural\sigcTiArural"
git branch --show-current
git status --short
git diff --no-color --shortstat
git diff --no-color -U0 src/backend/tests/domain/test_services.py scripts/verify_refactor.ps1
cd src\backend
python -m pytest tests/domain/ -q --tb=no -o "addopts=-q --tb=no"
cd ..
.\scripts\verify_refactor.ps1
`
- Resultados: siempre 24 tests passing (........................ [100%]).
- Verify script muestra los nuevos mensajes accionables y resumen mejorado.
- git diff muestra solo adiciones en el test file y cambios en el script (sin tocar lógica de negocio).

**Resultados de validación:**
- Todos los nuevos tests son characterization puros y pasan.
- El script es más útil para el usuario cuando los contenedores no están levantados (mensajes guían la acción).
- Resumen final ahora explica mejor los números y da consejos accionables.
- 0 riesgo: solo tests y pulido de mensajes en script de verificación.

**Pendiente esta sesión:** Nada más (se respetó el límite de 4-6 tests nuevos; se enfocó en agricultura/electronica edges).

**Próximo:** Actualizar Sección 10 del documento con este log (append only).

**Fin del log de esta sesión adicional.**

### Progreso en esta sesión final segura (bajo riesgo)

**Opción elegida:** Combinación de A (tests), B (script), C (config testing).

**Tareas ejecutadas:**

1. **Opción A - Tests de dominio (agregados 4 nuevos tests de characterization):**
   - Edit via search_replace en src/backend/tests/domain/test_services.py (append al final).
   - Nuevos tests enfocados en edges débiles de procesar():
     - 	est_agricultura_procesar_bajo_estres (caso bajo estrés: temp bajo, hum alto -> Bajo, no riego)
     - 	est_agricultura_procesar_critico_con_imagen (combinación estrés crítico + imagen_analizada=True, verifica lista de enfermedades)
     - 	est_electronica_procesar_nodos_zero (nodos=0 edge, estabilidad y cálculo)
     - 	est_electronica_procesar_multi_component_sum (cálculo de corriente con múltiples componentes: suma v / nodos)
   - Total tests de dominio ahora: **28** (antes 24 en la sesión previa).
   - Validación: python -m pytest tests/domain/ -q --tb=no -o "addopts=-q --tb=no" → 28 passed.

2. **Opción B - Pulido del script scripts/verify_refactor.ps1:**
   - Mejora en la sección de resumen final:
     - Agregado al inicio: Estado general:  OK /  Warnings /  Errores (más visual y claro de un vistazo).
     - Mejorada la estructura del resumen con explicaciones adicionales.
     - Los mensajes de acción recomendada ya estaban mejorados de sesión previa; se mantuvo y se alineó con el nuevo "Estado general".
   - Validación: ejecutado el script, se ve "Estado general: ..." en la salida.
   - Agregados comentarios en el código para los cambios de esta sesión.

3. **Opción C - Config de Testing:**
   - Creado nuevo archivo src/backend/.coveragerc (simple y limpio) con:
     - source = api
     - omit para tests, migrations, pycache
     - exclude_lines para pragma, main, etc.
     - precision y show_missing.
   - Esto complementa el pytest-cov y el ini actualizado de sesiones previas.
   - No se modificó pytest.ini en esta sesión (ya estaba bien de antes).

**Validaciones frecuentes realizadas:**
- git status --short
- git diff --no-color --shortstat
- git diff --no-color -U0 src/backend/tests/domain/test_services.py scripts/verify_refactor.ps1
- cd src\backend; python -m pytest tests/domain/ -q --tb=no -o "addopts=-q --tb=no" (28 passed)
- cd ..; .\scripts\verify_refactor.ps1 (para ver el "Estado general:" en acción)

**Resultados:**
- 28 tests de dominio pasando consistentemente.
- Script de verificación ahora tiene "Estado general" más visible al inicio del resumen.
- .coveragerc creado para mejorar reportes de cobertura en el futuro.
- 0 riesgo: solo adiciones de tests, un archivo de config nuevo, y pulido de mensajes en script de verificación (sin tocar lógica de negocio ni producción).
- git diff muestra cambios solo en los archivos de tests, script y el nuevo .coveragerc.

**Próximos pasos (cuando se retome, bajo aprobación para fases siguientes):**
- Instalar deps: pip install -r src/backend/requirements.txt (incluye pytest-cov)
- Usar: pytest --cov=api --cov-report=term-missing (usará .coveragerc)
- Ejecutar verify con -StartServices cuando Docker esté disponible.
- Documentar esta sesión en la Sección 10 (append only, hecho a continuación).

**Fin del log de esta sesión final segura.**

---

### Refuerzo de la última sesión segura (Opción A + C) — una ronda más de bajo riesgo

**Contexto:** Se continúa directamente desde la entrada anterior (que reportaba 28 tests de dominio + .coveragerc inicial + pulido de Estado general en script). Se ejecuta **solo una ronda más** como se instruyó, eligiendo la combinación más valiosa: A (tests, recomendada) + C (config), manteniendo B ya cubierto.

**Reglas seguidas estrictamente:**
- Solo bajo riesgo: adiciones de tests characterization + mejora menor de config de testing.
- Cero cambios a lógica de producción, cero movimiento de archivos, cero toques a ai_models/fastapi_app.py, views, adapters, etc.
- Validación frecuente con `git diff`, `pytest` y `scripts/verify_refactor.ps1`.
- Al final: solo append (esta entrada).

**Opción A — Tests de characterization (agregados 3 nuevos, enfocados en casos débiles):**
- Edit: append puro al final de `src/backend/tests/domain/test_services.py` (anchor = último test previo + search_replace).
- Los 3 tests nuevos (cumplen "entre 3 y 5", "prioriza casos que aún estén débiles", "más casos de `procesar()` en agricultura y electrónica, o smoke tests de integración entre factory + service"):
  1. `test_agricultura_procesar_default_inputs_critico` — inputs vacíos `{}` (defaults temp=0/hum=0/imagen=False). Caracteriza exactamente: hum<30 dispara `if` → "Crítico", `sugerencia_riego=True`, `enfermedad=None`. Cubre el borde de defaults del `procesar` de agricultura que no estaba explícitamente testeado.
  2. `test_robotica_procesar_echoes_input_exactly` — robotica (el default y más simple) hace echo literal del payload recibido en `"resultado"`, con estado/tipo fijos. Caracteriza el comportamiento actual de `robotica.py:13-17` (sin transformación).
  3. `test_factory_and_service_integration_smoke` — smoke explícito de integración factory + service. Para los 4 tipos de laboratorio:
     - Obtiene estrategia vía `LaboratorioStrategyFactory.obtener_estrategia(tipo)` y llama `.procesar(...)` directamente.
     - Crea `LaboratorioService(tipo)` (que internamente usa la factory) y llama `.ejecutar_analisis(...)`.
     - Verifica que ambos caminos producen el mismo `"tipo"` esperado por cada estrategia (y que son dicts).
     - Esto lockea el wiring actual (factory → concrete strategy → service delegation) antes de cualquier refactor de puertos/adapters en fases posteriores.
- Total tests de dominio ahora: **31** (28 previos en la sesión + 3 de este refuerzo).
- Estilo 100% characterization: asserts replican comportamiento observado (incluyendo random membership donde aplica, thresholds exactos del if/elif, etc.). No se "mejora" nada.

**Opción C — Config de Testing:**
- `.coveragerc` ya existía (creado limpio en trabajo previo de la sesión, ?? en git).
- Se mejoró ligeramente (bajo riesgo, solo config de test):
  - Agregado `branch = True` bajo `[run]` → ahora los reportes muestran columna "Branch" y BrPart (útil para ver cobertura de los if/elif de `procesar`).
  - Agregada sección `[html]\ndirectory = htmlcov`.
  - Comentarios explícitos "Fase 0: simple coverage config for characterization tests of domain strategies."
- Complementa perfectamente el `addopts` con `--cov` de `src/backend/pytest.ini` y el `pytest-cov` en requirements.
- Resultado visible: en corridas posteriores de pytest/verify se ve "Branch" y Cover ligeramente más alto.

**Validaciones frecuentes realizadas (después de .coveragerc, después de cada test nuevo, y al final):**
```powershell
# Estado inicial de la ronda
git status --short
git branch --show-current
cd src\backend
python -m pytest tests/domain/test_services.py tests/domain/test_factories.py -q --tb=no
cd ..
git diff --no-color --shortstat -- src/backend/tests/domain/test_services.py src/backend/.coveragerc

# Después de edits
git diff --no-color -U0 -- src/backend/tests/domain/test_services.py | Select-String '^\+def test_'
python -m pytest ... (ver 31 dots)
.\scripts\verify_refactor.ps1   # (captura Estado general + los 31 tests ejecutados internamente en secc.5 + coverage branch)
```

**Resultados de las validaciones:**
- pytest (directo): `............................... [100%]` → **31 tests** pasando. Cobertura con branch activado (agricultura 66.67%, services 87.50%, factories 100%, robotica/electronica 100%).
- `.\scripts\verify_refactor.ps1`: 
  - "Estado general: 3 OK / 0 Warnings / 3 Errores" (secc 2/4 fallan por contenedores off, como se espera; mensajes accionables presentes).
  - Secc.3 AI: /health y /infer OK (diagnosis Tomato_Early_blight).
  - Secc.5: ejecuta pytest internamente y muestra los 31 tests + coverage actualizado con branch.
- git: solo inserciones (test_services +~ nuevas líneas de tests + .coveragerc nuevo/enhanced). Cero deletions en código fuente. (LF/CRLF warnings normales en Windows, sin impacto).
- 0 breakage: el endpoint /infer sigue estable (verificado por el script), tests de factories/services intactos.

**Valor de esta ronda (última segura):**
- Aumenta la malla de seguridad characterization específicamente donde se recomendó (procesar edges + smoke factory+service).
- Mejora la visibilidad de cobertura para cuando se empiece a mover código a carpetas core/ports en Fase 1+.
- Mantiene el repo en estado "Fase 0 lista para commit" con tests subiendo consistentemente (19→24→28→31 en el arco de sesiones autónomas seguras).
- Todo documentado, reproducible, append-only.

**Fin del refuerzo / última sesión segura.**

**Instrucciones de resume (actualizado para quien continúe):**
- Rama actual: `feature/hex-refactor/phase-00-prep-baseline`
- Estado: tests de dominio = 31, .coveragerc + pytest.ini listos, verify script maduro con Estado general, /infer estable, doc ADSO con histórico completo en Secc 10.
- Para continuar: `git status`, correr `pytest` y `./scripts/verify_refactor.ps1`, revisar Secc 7 del doc para backlog de alto valor (priorizar siempre tests nuevos primero), crear rama `feature/hex-refactor/phase-01-...` solo después de commit limpio de Fase 0 si se aprueba.
- Nunca borrar contenido previo de Secc 10; siempre append.

---

## 10.x PROGRESO FASE 1 - Sesión inicial en rama phase-01-consolidate-domain (bajo riesgo, autónoma)

**Fecha / contexto:** Inmediatamente después de completar y commitear Fase 0 (commit `da759a0 chore(hex): complete Fase 0 baseline`). Nueva rama `feature/hex-refactor/phase-01-consolidate-domain` creada desde phase-00. Primera sesión de consolidación del núcleo hexagonal existente.

**Análisis previo (Sección 7 - TODO ABSOLUTO):**
- Se leyó completa la Secc 7 (líneas ~378-500).
- Se identificaron **solo** ítems de bajo riesgo alineados con "Fase 1: Consolidar y Mejorar el Núcleo Hexagonal Existente":
  - 7.8 Testing y Calidad (principal): "Aumentar tests de dominio (agregar para todas las estrategias, edge cases de simulaciones)", "Cobertura report (pytest-cov)".
  - 7.10 Documentación: mantener el doc vivo, guía de contribución (tests, verify, cómo agregar lab).
  - Pulido de script de verificación y configs de testing (mensajes, Fase awareness, visibilidad de tests de dominio).
- **Excluidos explícitamente** (alto riesgo, prohibidos en esta sesión):
  - 7.1 Arquitectura (mover api/logic/ → core/, entities ricas, composition root, mover lógica de views).
  - 7.2 Migración legacy, vertical slices, use cases, vistas thin.
  - 7.3+ Extract adapters, cambios en docker-compose, prod hardening, auth, frontend masivo, etc.
- Criterio: cambios solo en tests/, scripts/verify, pytest.ini/.coveragerc, y append en Sec 10. Validación obligatoria tras cada paso.

**Tareas ejecutadas (ordenadas, conservadoras, 4 ítems principales):**

1. **Aumentar tests de dominio characterization (6 nuevos tests, + de 31 a 37)**:
   - Archivo: `src/backend/tests/domain/test_services.py` (append al final).
   - Nuevos tests (todos characterization puros):
     - `test_todos_labs_historico_genera_exactly_24_registros` (loop 4 labs, len==24).
     - `test_agricultura_historico_estructura_y_sensor`, `test_robotica_...`, `test_electronica_...`, `test_telecom_...` (estructura de keys + sensor tag específico de cada generar_historico_simulado).
     - `test_cambiar_laboratorio_multiple_switches_affect_procesar_and_historico` (switch repetido, verifica que procesar["tipo"] y historico["sensor"] cambian consistentemente).
   - Valor: cubre paths que estaban en missing (agricultura/telecom generar loops ahora ~100% en domain), lockea comportamiento de service como holder de estrategia, contribuye directamente a Sec 7.8.
   - Estilo mantenido: observar primero (python -c), asertar lo actual (no ideal).

2. **Pulir scripts/verify_refactor.ps1 (Fase 1 awareness + mensajes)**:
   - Actualizado header y comentarios top para "Fase 1: Consolidate Domain Core".
   - Título de ejecución: "=== Hex Refactor Verification (Fase 1: Consolidate Domain) ===" + línea de foco + referencia a Sec 7.8.
   - [5] pytest: agregado note "Domain tests output + coverage above. Growing safety net...".
   - Resumen final: todos los bloques renombrados a "=== Resumen Verificación (Fase 1: Consolidate Domain Core) ===" (error/warn/success).
   - Success message actualizado: "Domain core + services checks passed. Fase 1 progress on characterization tests (see Sec 7.8)".
   - Nota explícita sobre el warning 'version: obsolete' de docker-compose (pre-existente, filtrado, no tocar compose por reglas de riesgo).
   - Cambios: ~25 ins / 12 del (mensajes y docs, cero lógica de chequeos rota).

3. **Mejorar configs de testing (pytest.ini + .coveragerc)**:
   - `src/backend/pytest.ini`: comentarios actualizados a "Fase 1: Consolidate Domain Core", referencia a Sec 7.8, explicación del rol de characterization tests para el núcleo.
   - `src/backend/.coveragerc`: comentarios expandidos explicando que los nuevos tests llevaron domain strategies a 100% coverage, cómo usar con verify [5], "Low-risk only".
   - Sin cambios funcionales que afecten corridas.

4. **Mejorar documentación interna (guía de contribución incipiente + fase)**:
   - `src/backend/tests/domain/test_services.py`: docstring de módulo expandido con:
     - Fase 1 focus items (Sec 7.8).
     - "How to add a test for a new lab (future)" paso a paso (observar, asertar current, run pytest+verify, nunca mejorar comportamiento).
     - Nota de que estos tests son la safety net para extracciones futuras.
   - `src/backend/tests/domain/test_factories.py`: docstring actualizado + referencia al header de services para cómo agregar.
   - Esto avanza el ítem 7.10 "Guía de contribución (cómo correr tests, verify script, cómo agregar nuevo lab)" de forma segura (dentro del código de tests, sin nuevo archivo grande).

**Archivos modificados (solo estos):**
- src/backend/tests/domain/test_services.py (principal: +6 tests + docs)
- scripts/verify_refactor.ps1 (mensajes + fase)
- src/backend/pytest.ini
- src/backend/.coveragerc
- src/backend/tests/domain/test_factories.py (docs)

**Validaciones frecuentes realizadas (tras cada edit significativo + final):**
```powershell
git branch --show-current          # feature/hex-refactor/phase-01-consolidate-domain
git status --short
git diff --no-color --shortstat -- <archivo(s) tocado(s)>
cd src\backend
python -m pytest tests/domain/ -q --tb=no
( python -m pytest ... --collect-only ... | count ::test_ )   # 37
cd ..
.\scripts\verify_refactor.ps1     # captura headers Fase 1, notes Sec 7.8, 37 dots en output interno, coverage domain mejorado
```
- Después de tests: collected 37, dots 37, domain strategies ahora 100% (agri/telecom/robotica/electronica/factories), total cov ~33.76% (mejora visible).
- Después de script/configs: verify muestra "Hex Refactor Verification (Fase 1...)", "Resumen Verificación (Fase 1...)", notes de Sec 7.8 y domain core.
- git diff siempre mostró solo inserciones en archivos de tests/script/configs (nada de api/logic/*.py, views, compose, etc.).
- AI /infer y otros checks del verify siguen OK (sin tocarlos).
- 0 errores, 0 breakage.

**Resultados cuantitativos:**
- Tests de dominio: **37** (crecimiento sostenido, safety net más gruesa para el núcleo existente).
- Cobertura de los 4 strategies + factory: **100%** (gracias a tests de historico + switches).
- Script y configs ahora "hablan" de Fase 1 y guían hacia los TODOs de Sec 7.
- Rama limpia para continuar (o commit intermedio).

**Qué quedó pendiente (para próximas sesiones autónomas o con aprobación):**
- Más tests de dominio si se quiere (e.g. más edges de procesar, tests directos de strategies si se exponen, tests de adapters con mocks - pero adapters pueden considerarse infra).
- Pulido adicional del verify (parsear el número exacto de tests del output de pytest y reportarlo en el estado general; soportar mejor cuando se corre con -StartServices).
- Crear archivo docs separado tipo `TESTING_GUIDE.md` o `CONTRIBUTING.md` (bajo riesgo, pero se priorizó actualizar in-place + append en Sec 10).
- Cuando se apruebe: empezar ítems de 7.8 más avanzados o primeros pasos muy controlados de 7.1/7.3 (siempre con tests primero, en slices pequeños).
- Actualizar el "resume instructions" del final de Sec 10 (lo haremos en esta append o siguiente; rama ahora es phase-01).
- Commit limpio de esta sesión cuando se decida (mensaje tipo "test+script: Fase 1 consolidate - 37 domain tests, verify Fase 1 polish, config/docs updates").

**Próximos (sujeto a decisión del usuario / fin de sesión):**
- Revisar git diff completo.
- Posible `git add -A ; git commit -m "test,script,config: Fase 1 session 1 - strengthen domain characterization (31→37), Fase1 polish in verify + docs (Sec 7.8)"`
- Luego decidir si más trabajo autónomo en phase-01 o avanzar a items de mayor valor con revisión.

Todo cumplió reglas estrictas: bajo riesgo, nada que rompa, validaciones constantes, solo append al final de Sec 10.

**Fin de la entrada de sesión Fase 1 inicial.**

---

## 10.y PROGRESO FASE 1 - Segunda sesión autónoma intensa (testing agresivo + calidad + docs/script polish)

**Contexto y rama:** Continuación directa en `feature/hex-refactor/phase-01-consolidate-domain` después de la primera sesión Fase 1 (que llevó tests de 31→37 + configs + script inicial Fase1 + docs internas). Esta sesión se enfocó en "trabajar con intensidad" en tareas de bajo riesgo de 7.8 y 7.10 hasta máximo avance seguro posible sin detenerse pronto.

**Análisis de Sección 7 (recordatorio de foco):**
- **7.8 Testing y Calidad** (principal, citado textualmente): 
  - "Aumentar tests de dominio (agregar para todas las estrategias, edge cases de simulaciones)."
  - Casos de error y validaciones.
  - Cobertura report (pytest-cov) + meta >60% domain (logramos 100% en el núcleo de strategies + services).
- **7.10 Documentación y Continuidad**:
  - "Este documento (mantenerlo vivo)" → solo append a Sec 10.
  - "Guía de contribución (cómo correr tests, verify script, cómo agregar nuevo lab)" → avanzado vía docstrings detalladas + ejemplos en tests + mejoras en verify.
- Se excluyeron todos los ítems de alto riesgo (7.1 mover carpetas/core, 7.2 slices/legacy, docker/prod, auth, frontend, etc.) per reglas estrictas.

**Tareas ejecutadas (intensas, iterativas, validadas tras cada batch):**

1. **Aumentar tests de dominio de forma agresiva pero segura (de 37 → 48 tests, +11 netos gracias a parametrize granular + nuevos)**:
   - Archivo principal: `src/backend/tests/domain/test_services.py` (append de ~9 nuevos tests + fixes de imports/params).
   - Enfoque exacto pedido:
     - **Edge cases de `generar_historico_simulado()` en todas las estrategias**:
       - `test_estrategias_historico_directo_edges_para_todas_las_labs`: via factory, prueba horas=[0,1,5,24,48] para las 4 labs; verifica len exacto + keys.
       - `test_estrategias_historico_directo_horas_negativo_o_cero_devuelve_lista_vacia`: caracteriza que range(<=0) → [] en todas (comportamiento actual de los 4 generar).
     - **Casos de error y validaciones** (lockean la falta actual de defensas en el núcleo):
       - `test_cambiar_laboratorio_invalido_levanta_valueerror`
       - `test_ejecutar_analisis_agricultura_datos_no_numericos_levanta_typeerror_actual` (TypeError en '>' de agri.procesar)
       - `test_ejecutar_analisis_electronica_componentes_invalidos_levanta_attributeerror_actual` (falla en .get cuando componentes no es lista de dicts)
       - `test_factory_obtener_estrategia_no_tolera_espacios_en_nombre` (whitespace after upper() → ValueError actual)
     - **Más cobertura de switches y comportamientos de la Factory**:
       - Reutilizó/expandió switches en historico/procesar.
       - Factory edges de casing/espacios.
     - **Guard/branch faltante en service**:
       - `test_obtener_simulacion_historica_fallback_lista_vacia_si_estrategia_sin_metodo`: hack privado para forzar el path `return []` del hasattr en services.py:21 (ahora services 100%).
     - Bonus smoke: `test_todos_labs_procesar_con_input_minimo_no_rompe`
   - Calidad/organización (7.8 + 7.10):
     - Migración de 1 test antiguo + nuevos a usar fixtures de conftest (DRY).
     - Parametrize en factories (`test_todos_los_tipos...` ahora 4 items en vez de 1 loop; más granular, mejor reporte).
     - ~48 tests total (dots confirman).
   - Resultado cobertura (verificado): **todas las strategies + factories + services 100%** (solo queda la línea abstractmethod pass en interfaces, inevitable sin instanciar ABC).

2. **Mejoras de calidad en tests existentes + organización**:
   - Actualización de varios headers de comentarios antiguos ("Additional characterization...") con notas de Fase 1, Sec 7.8 y sugerencias de parametrize futuro.
   - Mejora de docstrings en tests clave (más claros, mencionan "characterization of current...", referencias a código fuente).
   - `src/backend/tests/conftest.py`: expandido con fixture `make_lab_service` + `lab_service` + docstring detallada para Fase 1 (guía de uso + ref a Sec 7.8). Avanza la "guía de contribución".

3. **7.10 + pulido script de verificación (robusto)**:
   - `scripts/verify_refactor.ps1`: 
     - Captura de output de pytest en [5], re-emisión para que usuario vea dots/cov, **parseo robusto del # exacto de tests vía longitud de la línea de dots** (cumple el TODO pendiente de la sesión anterior: "Pulido adicional del verify (parsear el número exacto de tests del output de pytest y reportarlo en el estado general)").
     - Reporta "Domain tests: 48 passed (see dots/coverage above)" tanto en [5] como en el Resumen Verificación (Fase 1).
     - Comentarios actualizados con ref a Sec 7.8/7.10, historico edges, error paths, parametrize.
   - Esto hace el script mucho más útil para visibilidad del safety net de dominio sin depender de docker.

4. **Documentación y continuidad**:
   - Múltiples actualizaciones de docstrings y comentarios inline en tests, conftest, script y (implícitamente) esta entrada.
   - Todo mantiene el estilo "characterization primero, observar con python -c, nunca asumir mejor comportamiento".
   - Avance tangible en "Guía de contribución (cómo correr tests, verify script, cómo agregar nuevo lab)" vía los ejemplos y notas en los archivos de test.

**Archivos modificados esta sesión (solo bajo riesgo):**
- src/backend/tests/domain/test_services.py (tests nuevos + calidad)
- src/backend/tests/domain/test_factories.py (parametrize para calidad)
- src/backend/tests/conftest.py (fixtures + docs)
- scripts/verify_refactor.ps1 (parseo de conteo + docs Fase1)
- (doc final append)

**Validaciones frecuentes (después de cada cambio/batch importante):**
```powershell
git branch --show-current
git status --short
git diff --no-color --shortstat -- <files>
cd src\backend
python -m pytest tests/domain/ -q --tb=no
python -m pytest tests/domain/ --cov=api/logic/domain --cov-report=term-missing -q --tb=no   # chequeo de 100%
(collect count via Select-String ::test_ | measure)
cd ..
.\scripts\verify_refactor.ps1   # chequea que reporte el # actualizado de domain tests + headers Fase 1
```
- Ejemplos de resultados intermedios/finales: collected 37→45→48, dots matching, services.py coverage 87.5%→100% (gracias al test del fallback), verify consistentemente "Domain tests: 48 passed...", "Fase 1: Consolidate Domain", AI /infer OK.
- 0 fallos, 0 cambios a lógica de negocio (solo se observaron comportamientos actuales vía python -c y se lockearon).
- git diff siempre solo adiciones en tests/conftest/script (nada de api/logic/*.py productivo, nada de views, nada de compose).

**Resultados clave:**
- Tests de dominio: **48** (crecimiento significativo + cobertura máxima alcanzable en el núcleo existente de forma low-risk).
- Cobertura domain: **100%** en agricultura/robotica/electronica/telecom/factories/services (solo abstract interface pass queda fuera).
- Script de verificación ahora reporta dinámicamente el conteo exacto de tests de dominio en el resumen (mejora accionable).
- Docs internas mucho más ricas (guía de cómo agregar, refs a Sec 7.8, calidad via fixtures/parametrize).
- Todo 100% characterization, reversible, sin riesgo.

**Qué quedó pendiente (para próximas sesiones low-risk o con aprobación explícita):**
- Aún más tests si se desea (e.g. más variaciones de datos en historico para caracterizar los cálculos de temp/hum con random/time, o tests de rendimiento triviales, pero ya cubrimos los edges de len/horas/errores principales).
- Posible creación de docs/ separado (TESTING_GUIDE.md o similar) como se mencionó en sesión previa (bajo riesgo pero se priorizó in-place + append).
- Actualizar "resume instructions" al final de esta nueva entrada.
- Commit de los cambios acumulados en la rama (recomendado: "test,script,docs: Fase 1 session 2 - 37→48 domain tests (historico edges 0/1/48/neg + error cases + guard), fixtures + parametrize quality, verify exact count parse + Sec7.8/7.10 docs").
- Cuando listo: decidir si más autónomo low-risk o pasar a tareas de Sec 7 con revisión (siempre tests primero).

**Próximos (sujeto a user):**
- Revisar diffs completos.
- Ejecutar las validaciones finales una vez más.
- Append de esta entrada (hecho).
- Posible commit + continuar o branch para siguiente.

Cumplió **todas** las reglas estrictas: solo bajo riesgo (tests + docs + script de verificación), validaciones después de **cada** cambio significativo, nada de mover/tocar prod logic, solo append al final de Sec 10.

**Fin de la segunda sesión autónoma intensa de Fase 1 (testing + docs).**



