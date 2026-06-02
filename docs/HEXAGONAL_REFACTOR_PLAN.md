# PLAN DETALLADO DE REFACTORIZACIÓN PROGRESIVA
## SIGC&T Rural → Arquitectura Hexagonal / Clean Architecture

**Proyecto:** sigcTiArural  
**Ubicación:** C:\Users\Devbadolgm\WorkSpace\ProjectsAndDatasets\Clon-sigcTiArural\sigcTiArural  
**Rama actual (inicio):** feature/laboratorios-integracion-2026  
**Fecha de análisis:** (Sesión actual - 2026)  
**Rol:** Arquitecto de Software Senior  
**Metodología:** Strangler Fig Pattern + Branch by Abstraction + Migración Incremental  
**Principio fundamental:** Nunca romper funcionalidades existentes. Todo cambio es verificable y reversible.

---

## 1. RESUMEN EJECUTIVO DEL ESTADO ACTUAL (Análisis Completo)

### 1.1 Estructura General del Proyecto (Monorepo)

```
sigcTiArural/
├── docker-compose.yml                 # 5 servicios: db(postgres), db-mysql(legacy), backend, ai_service, frontend
├── src/
│   ├── backend/                       # Django 4.2 + DRF (el "monolito" principal)
│   │   ├── api/                       # App Django principal
│   │   │   ├── models.py              # Modelos ORM (SensorReading, Robot, RobotTelemetry, RobotCommand) — Anémicos
│   │   │   ├── views.py               # ViewSets legacy + "V2 Hexagonal" parcial (solo 2 endpoints usan logic)
│   │   │   ├── serializers.py         # ModelSerializer directos
│   │   │   ├── urls.py                # Rutas mixtas (legacy + /v2/)
│   │   │   ├── logic/                 # **INTENTO PARCIAL DE HEXAGONAL (Mayo 2026)**
│   │   │   │   ├── domain/            # 4 estrategias (robotica, agricultura, electronica, telecom) + services + factory + interfaces
│   │   │   │   ├── ports/             # RepositoryInterface, AIServicePort, NotificationPort (abstractos)
│   │   │   │   └── adapters/          # DjangoRepository (string models), FastAPI_AIAdapter (HTTP + fallback), ConsoleNotificationAdapter
│   │   │   └── migrations/            # 2 migraciones
│   │   ├── sigct_backend/             # settings.py, urls, wsgi (DEBUG=True, AllowAll, sin Channels real)
│   │   ├── users/                     # Casi vacío (solo __init__)
│   │   ├── requirements.txt           # Mínimo + requests (sin daphne/channels/simplejwt)
│   │   └── Dockerfile
│   ├── frontend/                      # React 18 + Vite 5 + Tailwind + Three.js + Zustand + React Router v7
│   │   ├── src/
│   │   │   ├── pages/                 # Dashboard, Labs, AIPredictiva, Docs..., Login/Register
│   │   │   ├── labs/                  # **ENORMES** (SchematicEditor.jsx ~80kB, ElectronicsLab ~74kB, etc.)
│   │   │   ├── components/, hooks/, services/, stores/, auth/
│   │   │   └── data/
│   │   └── Dockerfile (multi-stage nginx SPA)
│   ├── ai_models/                     # FastAPI + TensorFlow
│   │   ├── fastapi_app.py             # /assist (voz+PG), /analyze-circuit, /health. **NO TIENE /infer**
│   │   ├── production_models/         # plant_disease_mbv2.h5 (MobileNetV2)
│   │   ├── notebooks/                 # Entrenamiento
│   │   └── requirements.txt           # tensorflow-cpu pesado + psycopg2 directo
│   └── embedded/                      # **PLACEHOLDERS VACÍOS** (0 bytes) — solo documentación
├── docs/                              # **EXTREMADAMENTE RICA** (C4, ER, UML, bitácora, MASTERDOC, PLAN_MAESTRO)
│   ├── INFORME_ANALISIS_Y_PLAN_DE_ACCION.md  # Bitácora append-only (incluye sesiones May 23 2026 de hexagonal)
│   ├── diagrams/, uml/, architecture/
│   └── MASTERDOC.md, PLAN_MAESTRO.md
├── scripts/                           # Generación de diagramas, reportes, mantenimiento Docker
└── docker-compose.yml, schema_postgresql.sql, run_*.ps1/.sh
```

### 1.2 Estado de la "Arquitectura Hexagonal" Actual

- **Reclamo vs Realidad:** README y MASTERDOC afirman "Arquitectura Hexagonal". En código existe una **implementación parcial de Strangler Fig** introducida ~23 Mayo 2026 (ver INFORME).
- **Cobertura real:** ~15-25%.
  - Solo `TelemetryHistoryV2View` y `AICropAdviceView` usan `LaboratorioService` + `DjangoRepository` + `FastAPI_AIAdapter`.
  - Los ViewSets principales (`RobotViewSet`, etc.) y `TelemetryHistoryView` (V1) siguen acoplados directamente a `models.py`.
  - Lógica de simulación duplicada (views.py vs domain/*.py).
- **Calidad de la capa actual (logic/):**
  - Pros: Strategy + Factory bien intencionados, domain "Python puro" (sin Django en la mayoría), puertos abstractos, fallback en adapter IA.
  - Contras graves:
    - `DjangoRepository` usa strings `'api.SensorReading'` + `apps.get_model` → acoplamiento fuerte y frágil.
    - No hay entidades de dominio ricas (solo DTOs y simuladores).
    - No hay mapeo Entidad ↔ ORM Model.
    - Los adapters no están inyectados vía contenedor de DI; se instancian a mano en vistas.
    - Notifications port existe pero sin uso real.
- **Drift Documentación-Código:** Docs mencionan Channels, daphne, JWT real, /infer, etc. que no existen en requirements/settings actuales.

### 1.3 Problemas Críticos Identificados (Priorizados)

1. **Acoplamiento alto y Anemic Domain** (core del problema).
2. **Integración IA rota/incompleta**: FastAPI no expone `/infer` (frontend y adapter lo esperan). AI service habla directo a Postgres (bypass total del dominio/backend).
3. **Zero tests** (ni unitarios, ni integración, ni characterization). Riesgo de regresión extremo.
4. **Frontend monolítico gigante**: Archivos de 70-80k líneas con lógica de simulación + UI + estado mezclados. Muy difícil de evolucionar.
5. **Auth inexistente en backend** (AllowAny universal, demo tokens en frontend).
6. **Endpoints legacy + V2 conviviendo sin estrategia clara de deprecación**.
7. **Infra deuda**: db-mysql legacy, pycache en git, runserver en Docker (no prod server), CORS abierto, DEBUG=True.
8. **Edge**: 0% implementado en código (solo docs).
9. **Duplicación y configuración dispersa**: URLs hardcodeadas en frontend (localhost vs prod vs cloud), múltiples formas de acceder a datos.
10. **Mantenibilidad docs vs impl**: Excelente documentación visual, pero se desincroniza fácilmente.

### 1.4 Activos Positivos (Aprovechar, No Tirar)

- Intento hexagonal ya existente (no empezar de cero).
- Dominio conceptual claro: 4 "laboratorios" como estrategias (buen bounded context candidato).
- Docker Compose funcional + multi-servicio.
- Riqueza de features educativas (3D, esquemáticos, voz, etc.) — preservar 100%.
- Bitácora + diagramas C4/ER/UML ya hechos.
- Stack maduro (aunque con drift).

### 1.5 Stack Técnico Real (vs Docs)

- **Backend:** Django 4.2 + DRF, psycopg2, requests. Sin Channels, sin simplejwt en reqs actuales.
- **Frontend:** React 18, Vite, Zustand, Three.js/r128 + @react-three, ReactFlow, Recharts, Lucide, Framer.
- **AI:** FastAPI + TF-CPU 2.15 (MobileNetV2), SpeechRecognition/gTTS/pydub, psycopg2 directo.
- **DB:** PostgreSQL 15 primario. MySQL 8 legacy en compose.
- **Edge:** Documentado (BBB + MQTT + TFLite) pero código vacío.
- **Dev:** Windows (PowerShell), Docker Compose, scripts .ps1/.sh.

---

## 2. ESTRATEGIA GENERAL Y PRINCIPIOS RECTORES

### 2.1 Patrón Principal: Strangler Fig (Higuera Estranguladora) + Branch by Abstraction

- Mantener **siempre** los endpoints y flujos legacy funcionando.
- Introducir nueva implementación "al lado" (V2, V3... o por feature flag/query param).
- Migrar consumidores (frontend primero en áreas nuevas, luego legacy) gradualmente.
- Solo eliminar código viejo cuando:
  1. Cobertura de tests > umbral.
  2. Verificación manual de flujos clave.
  3. Aprobación explícita del usuario.

### 2.2 Principios Obligatorios

1. **Zero Downtime Funcional** — Cada fase debe permitir `docker-compose up --build` y que el sistema siga usable.
2. **Python Puro en el Hexágono** — `domain/` y `application/` (o `core/`) **nunca** importan Django, FastAPI, React, requests, etc.
3. **Puertos primero** — Definir contratos (interfaces) antes de implementar adapters.
4. **Inyección de Dependencias explícita** — Composition Root en el "shell" (views/urls o un contenedor simple). Evitar `global` o instanciación dentro de dominio.
5. **Testabilidad como primera clase** — Domain debe poder testearse con `pytest` sin Django settings ni DB.
6. **Documentación como código** — Cada fase actualiza INFORME_ANALISIS..., MASTERDOC (sección de estado), y diagramas relevantes.
7. **Ramas Git por cambio importante** — Una rama por fase o sub-fase vertical (ej: `feature/hex-refactor/phase-01-telemetry-domain`).
8. **Cambios pequeños y verificables** — Nunca "big bang". Máximo una vertical (ej: solo Telemetry + History) por iteración.
9. **Verificación obligatoria por fase**:
   - `docker-compose up -d --build`
   - curl endpoints legacy + nuevos
   - Abrir frontend y ejercitar Dashboard + 2-3 labs clave + AI Predictiva
   - Revisión de logs (sin errores nuevos)
10. **Precaución extrema en comandos** — Siempre mostrar el comando exacto que se va a correr, pedir confirmación mental, usar `--dry-run` donde aplique, backups de DB antes de migraciones estructurales.

### 2.3 Estructura Objetivo Propuesta (Clean + Hexagonal Adaptada a Django)

Estructura final recomendada (migrar hacia ella incrementalmente):

```
src/backend/
├── core/                              # Paquete puro (instalable como lib si se desea)
│   ├── domain/
│   │   ├── entities/                  # SensorReading, Robot, Telemetry (value objects, aggregates)
│   │   ├── value_objects/
│   │   ├── services/                  # LaboratorioService, RobotCommandService, etc. (lógica orquestadora)
│   │   ├── strategies/                # Las actuales + más (o renombrar)
│   │   └── factories/
│   ├── application/                   # Use Cases / Interactors (orquestan puertos, transacciones)
│   │   ├── queries/
│   │   └── commands/
│   └── ports/
│       ├── repositories.py            # Abstract Repository (genérico o por aggregate)
│       ├── ai_service.py
│       ├── notification.py
│       └── event_bus.py (futuro)
├── infrastructure/
│   ├── persistence/
│   │   ├── django/                    # DjangoRepositoryImpl (mappers aquí)
│   │   └── models.py                  # Mover aquí o mantener en api/ (ver abajo)
│   ├── external/
│   │   ├── fastapi_ai_adapter.py
│   │   └── mqtt_... (futuro)
│   └── config/
├── interfaces/
│   └── web/
│       ├── api/                       # Django app "api" simplificada
│       │   ├── views.py               # **Solo** controladores delgados (llaman application layer)
│       │   ├── serializers.py         # DTOs de entrada/salida (o usar Pydantic/Dataclasses + adapt)
│       │   ├── urls.py
│       │   └── dependencies.py        # Composition root / inyección
│       └── admin.py (si se mantiene)
└── shared/                            # Cross-cutting (logging, exceptions, result types)
```

**Decisión clave sobre Models:** Mantener `models.py` + migraciones dentro de una app Django (`api` o `infrastructure_django`) porque Django lo exige para makemigrations/admin. Los mappers viven en `infrastructure/persistence/django/`.

Alternativa más simple (recomendada para empezar): mantener `api/models.py` y que el adapter de persistencia viva dentro de `infrastructure` pero importe models solo ahí.

### 2.4 Alcance de "Mantener Todas las Funcionalidades"

Se preservan **exactamente**:
- Todos los laboratorios interactivos (UI + simulaciones internas).
- Dashboard, telemetría, cluster status.
- Asistente de voz.
- Carga de imágenes + diagnóstico (aunque hoy mock).
- Documentación y páginas de docs.
- Flujos de auth demo (se endurecerán).
- Docker Compose actual + scripts de run local.
- Datos existentes en DB (no se tocan migraciones destructivas).

---

## 3. PLAN POR FASES (Prioridad, Tiempo, Riesgos)

### FASE 0 — Preparación, Baseline y Saneamiento Inmediato (Prioridad: P0 - Crítica)
**Duración estimada:** 3-5 días persona (part-time: 1 semana calendario)  
**Riesgo:** Bajo | **Impacto de no hacerla:** Alto (sin red de seguridad)

**Objetivo:** Establecer línea base segura, cerrar brechas que rompen integración ya, y preparar el "andamiaje" para las fases siguientes sin tocar lógica de negocio todavía.

**Alcance (qué SÍ):**
- Auditoría final + actualización de bitácora (INFORME).
- Creación de estructura de tests (pytest) + primeros characterization tests del dominio existente.
- **Fix crítico de IA:** Añadir endpoint `/infer` (y opcionalmente `/suggest`) al `fastapi_app.py` reutilizando el código de `preprocess_image` + `model.predict` ya existente. Hacer que el adapter del backend funcione end-to-end.
- Saneamiento menor: .gitignore para `__pycache__`, `*.pyc`, `.env`, `node_modules`, `dist`, etc. (verificar que no se rompa).
- Actualizar `src/backend/requirements.txt` con lo mínimo real (agregar `djangorestframework-simplejwt` si se planea auth pronto, pero no activar aún).
- Añadir script de verificación `scripts/verify_phase.sh` o `.ps1` (health checks + endpoints clave).
- Actualizar sección de arquitectura en MASTERDOC.md y README (estado real "Hexagonal incipiente 25%").
- Rama: `feature/hex-refactor/phase-00-prep-baseline`

**Qué NO tocar:**
- Ningún endpoint legacy.
- Ninguna UI de frontend.
- Ninguna lógica de simulación.

**Pasos detallados (orden estricto):**
1. `git checkout feature/laboratorios-integracion-2026`
2. `git checkout -b feature/hex-refactor/phase-00-prep-baseline`
3. Revisar y mejorar `.gitignore` (agregar pycache, .env, etc. si faltan).
4. En `src/ai_models/fastapi_app.py`: implementar ` @app.post("/infer") ` y `/suggest` (si es simple) usando la lógica de modelo ya cargada. Devolver formato compatible con lo que espera el adapter y el frontend.
5. Probar local: `cd src/ai_models && python -m uvicorn fastapi_app:app --port 8081` + curl.
6. Verificar que `AICropAdviceView` (V2) funcione contra el AI real (o su fallback).
7. Inicializar pytest en backend: crear `src/backend/tests/` (o `core/tests` futuro), `pytest.ini`, fixture simple. Escribir 2-3 tests que ejecuten `LaboratorioStrategyFactory` y estrategias sin Django.
8. Añadir `scripts/verify_refactor.ps1` (y .sh) que:
   - Levante db + backend + ai (o asuma que están).
   - Haga curl a /api/telemetry/history/ y /api/v2/...
   - Haga curl a AI /health y /infer (con imagen dummy si posible).
9. Commit atómico por subpaso.
10. Actualizar INFORME_ANALISIS... con "Fase 0 completada".
11. Push rama y (si aplica) abrir PR de preparación (solo para tracking).

**Comandos clave (cuidado):**
```powershell
# Siempre en PowerShell (Windows)
git status
git checkout -b feature/hex-refactor/phase-00-prep-baseline
# ... edits ...
git add -p   # Nunca git add . sin revisar
git commit -m "chore(hex): fase-00 baseline + fix /infer AI + pytest skeleton"
```

**Criterios de Done / Verificación:**
- `docker-compose up -d --build db ai_service` + backend local o full.
- `curl http://localhost:8081/infer` (con POST dummy) devuelve 200 o estructura válida.
- `pytest src/backend/tests/ -q` pasa (aunque pocos tests).
- No hay errores nuevos en logs de servicios.
- `git status` limpio + rama creada.

**Riesgos y Mitigaciones:**
- Que el modelo TF no cargue en infer nuevo → Mit: copiar exactamente la lógica de load + preprocess ya existente, usar try/except + mock response.
- Romper AI actual → Mit: el nuevo endpoint es aditivo; /assist y /health quedan intactos.

---

### FASE 1 — Consolidar y Mejorar el Núcleo Hexagonal Existente (P0 - Alta)
**Duración:** 5-8 días  
**Riesgo:** Medio-bajo (solo sobre código "nuevo")

**Objetivo:** Elevar la calidad del `logic/` actual a un nivel profesional antes de usarlo masivamente. Convertirlo en la "única fuente de verdad" para la lógica de laboratorios.

**Cambios principales:**
- Renombrar/mover `api/logic/` → `core/` (o `api/core/`) para desacoplar del paquete Django "api".
- Definir **Entidades de Dominio** ricas (dataclasses o clases simples con invariantes) para Telemetry, Reading, etc.
- Mejorar puertos: `RepositoryPort` más específico (métodos por aggregate: `list_recent_readings(sensor_id, limit)` en vez de `listar_todos(string)`).
- Implementar **mapeadores** (mappers) en adapters (nunca en dominio).
- Mover toda generación de datos simulados a las estrategias de dominio (eliminar duplicado en V1 view).
- Añadir tests exhaustivos de dominio (cobertura >70% de esta capa).
- Actualizar `logic/README.md` y crear `core/README.md`.

**Estructura intermedia recomendada (después de Fase 1):**
Mantener compatibilidad con imports existentes durante la transición (aliases o re-exports temporales).

**Verificación extra:** Ejecutar V2 views manualmente + tests de dominio.

**Riesgo principal:** Over-engineering del dominio demasiado pronto. Mit: mantener simple, solo lo necesario para soportar los 4 laboratorios + telemetry.

---

### FASE 2 — Migrar Lógica de Negocio Principal del Backend (Telemetry, Robots, Commands) (P1)
**Duración:** 7-12 días  
**Riesgo:** Medio-Alto (toque a endpoints usados por frontend)

**Objetivo:** Hacer que los ViewSets y vistas legacy deleguen o sean reemplazados por la capa de aplicación hexagonal. Introducir Use Cases.

**Sub-fases verticales (obligatorio hacer una por una):**
2.1 Solo Telemetry + History (V1 y V2).
2.2 Robots y Telemetría de robots.
2.3 Comandos de robot (escritura).

En cada sub-fase:
- Crear el Use Case correspondiente en `application/`.
- Actualizar el adapter de persistencia.
- Hacer que la vista sea un "controlador delgado".
- Añadir tests de integración (con test DB o mocks del repo).
- Actualizar frontend hook/service que lo consuma (o dejar para Fase 5).
- Verificar que endpoint legacy sigue respondiendo idéntico.

**Importante:** Usar "Branch by Abstraction" — mantener las clases legacy mientras existan consumidores.

**Riesgo alto:** Cambios en serialización o formato de respuesta que rompan UI. Mit: tests de contrato (snapshot o aserciones estrictas de response shape) + verificación manual en cada sub-fase.

---

### FASE 3 — Capa de Infraestructura, Adaptadores y Composition Root (P1)
**Duración:** 4-6 días

- Extraer adapters a `infrastructure/`.
- Implementar mapeo bidireccional real Entidad <-> Django Model.
- Introducir un Composition Root simple (puede ser un `container.py` o `dependencies.py` que se usa en views/urls).
- Soporte para múltiples adapters (ej: en tests usar InMemoryRepository).
- Config centralizada de adapters (settings + env).

---

### FASE 4 — Servicio de IA, Notificaciones y Resiliencia (P1)
**Duración:** 3-5 días

- Terminar de cablear el adapter de IA (incluyendo el /infer que se añadió en F0).
- Mover lógica de "sugerencias" al dominio si corresponde (o mantener como orquestado por use case).
- Implementar un adapter real de notificaciones (al menos WebSocket básico vía Django Channels o simple print + log estructurado). Evaluar si vale la pena introducir Redis aquí.
- Añadir circuit breaker simple o retry en adapters externos (usando tenacity o manual).
- Tests de resiliencia (adapter IA down → fallback).

---

### FASE 5 — Refactor Progresivo del Frontend hacia Arquitectura Limpia / Feature-Sliced (P2 - La más costosa)
**Duración estimada:** 10-18 días (posiblemente más por tamaño de archivos)  
**Riesgo:** Alto (UI compleja, archivos monolíticos)

**Estrategia recomendada (diferente a backend porque es SPA):**
- Adoptar **Feature-Sliced Design** (o Clean Architecture adaptada a React):
  - `src/shared/` (ui kit, lib, ports)
  - `src/entities/` o `src/domain/` (tipos, validaciones puras)
  - `src/features/` o `src/modules/` (labs como features: robotics, electronics, ai-predictive...)
  - `src/widgets/`, `src/pages/`
  - `src/adapters/` o `src/infrastructure/api/` (clientes HTTP tipados, stores de Zustand como "external state")
- **Nunca reescribir un lab gigante de golpe.** 
  - Extraer primero la lógica de simulación/negocio a archivos `domain/` o `model/` dentro del feature.
  - Crear adapters de API (`telemetry.adapter.js`, `robotics.adapter.js`).
  - Reemplazar fetches directos por adapters.
  - Para SchematicEditor y ElectronicsLab (los monstruos): plan de extracción por secciones (parser netlist, simulador, UI components).
- Mantener Zustand pero como implementación de un "store port".
- Actualizar servicios `cloud.js` → `infrastructure/api/`.

**Orden recomendado:**
1. Shared infrastructure (API client centralizado con env config correcto).
2. Features pequeñas (TelecomLab, EmbeddedLab).
3. Features medianas (RoboticsLab, Math).
4. Monstruos (Electronics + Schematic) — posiblemente la última subfase o incluso postergada.
5. Pages globales (Dashboard, AIPredictiva).

**Riesgo crítico:** Romper labs complejos que son el "valor diferencial" del proyecto. Mitigación: 
- Cada extracción debe tener una demo visual idéntica antes/después.
- Usar feature flags o rutas paralelas (`/labs/electronics-v2` temporal).
- Mucha revisión manual + screenshots.

**Estimación realista:** Esta fase puede llevar 1 mes calendario si se hace con cuidado.

---

### FASE 6 — Autenticación, Autorización y Protección de Endpoints (P2)
**Duración:** 4-7 días

- Añadir `djangorestframework-simplejwt` (si no está).
- Implementar endpoints reales de login/register (o usar Django allauth/simple si cabe).
- Proteger vistas (IsAuthenticated, permisos por rol).
- Actualizar AuthContext frontend para usar tokens reales (access + refresh).
- Port de "CurrentUser" si se necesita en dominio (para auditoría futura).
- 2FA stub (ya hay página Admin2FA).

**Nota:** Como el proyecto tiene fines educativos/demo, mantener un "modo demo sin auth" configurable por env (para no romper demos actuales).

---

### FASE 7 — Edge Computing, Ingesta de Datos y Eventos (P3 - Baja prioridad hasta hardware)
**Duración:** Variable (se puede hacer en paralelo cuando hardware disponible)

- Diseñar puertos para:
  - `SensorIngestionPort`
  - `RobotCommandPort` (MQTT o HTTP)
  - `EdgeInferencePort`
- Implementar adapters para el gateway (BBB-01) una vez que el código de embedded exista.
- Introducir Event Bus (Redis pub/sub o RabbitMQ) como puerto para alertas y telemetría asíncrona (desacopla Django de FastAPI aún más).

No bloquear otras fases por esto.

---

### FASE 8 — Pruebas, Observabilidad, Hardening, Deprecación y Cierre (P0 - Continua)
**Duración:** 5-8 días + ongoing

- Cobertura de tests (meta: >60% backend domain/application, >40% overall al final).
- Tests E2E ligeros (puppeteer ya está en deps de root, o Playwright).
- Configuración de producción real:
  - Gunicorn + Daphne (o Uvicorn workers) en Dockerfile backend.
  - Variables de entorno estrictas, SECRET_KEY real, DEBUG=False por default.
  - Rate limiting, structured logging.
- Eliminar código legacy (solo después de Fase 2+5 completas y verificación).
- Quitar `db-mysql` del compose si se confirma que no se usa.
- Actualizar TODOS los diagramas y MASTERDOC.
- Añadir healthchecks robustos, métricas básicas.
- Documento final de "Arquitectura Objetivo Alcanzada" + lecciones aprendidas.

---

## 4. CRONOGRAMA Y DEPENDENCIAS APROXIMADAS

```
Fase 0 (Prep)          [====]  1 sem
Fase 1 (Core Domain)   [======] 1.5 sem   ← depende de 0
Fase 2 (Migrate Biz)   [==========] 2-3 sem  ← depende de 1 (vertical por vertical)
Fase 3 (Infra)         [=====] 1 sem      ← puede solaparse un poco con 2
Fase 4 (IA + Notif)    [====] 1 sem
Fase 5 (Frontend)      [==================] 3-4+ sem  ← puede empezar en paralelo con Fase 2 (adapters API)
Fase 6 (Auth)          [======] 1.5 sem   ← depende de Fase 2
Fase 7 (Edge)          [variable]
Fase 8 (Hardening)     [=======] 2 sem    ← ongoing + cierre

Total estimado realista (part-time 4-6h/día): 4.5 - 7 meses calendario
(Asumiendo que el desarrollador principal es el mismo que ha hecho el trabajo previo)
```

**Fases que pueden paralelizarse con cuidado:**
- Fase 5 (frontend adapters) puede empezar tan pronto como Fase 1 entregue puertos estables.
- Fase 7 es casi independiente.

---

## 5. RIESGOS GLOBALES Y ESTRATEGIAS DE MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Regresión masiva en funcionalidades de laboratorios | Media-Alta | Muy Alto | Strangler + tests de contrato + verificación manual obligatoria por sub-fase + ramas separadas |
| Sobrecarga de la Fase 5 (frontend gigante) | Alta | Alto | Dividir en muchas sub-fases verticales; dejar los labs más grandes para el final o post-MVP; extraer solo lógica, no re-diseñar UI |
| Deriva entre documentación y código | Media | Medio | Tarea obligatoria "actualizar docs" al final de cada fase + script de verificación |
| Entorno Windows + Docker + TF timeouts | Media | Medio | Documentar comandos PS exactos; mantener scripts run_local_*.ps1 actualizados; no forzar TF en contenedores backend |
| Falta de tiempo / alcance del proyecto SENA | Alta | Alto | Priorizar Fases 0-4 + parte de 5 (dashboard + 2 labs). El resto como "mejora continua post-entrega" |
| Resistencia a eliminar código legacy | Media | Bajo-Medio | Usar "deprecated" warnings + fecha de remoción clara en comentarios |
| Complejidad de DI en Django | Media | Medio | Empezar simple (pasar puertos por constructor o función de fábrica en urls). Evaluar libs solo si el boilerplate duele mucho |
| AI Service como SPOF + bypass DB | Media | Alto | Fase 4 + hacer que AI use el backend vía adapter en vez de PG directo (o exponer solo lo necesario) |

---

## 6. HERRAMIENTAS Y PRÁCTICAS RECOMENDADAS (Graduales)

- **Testing:** pytest + pytest-django (solo para tests de integración). Factory Boy o model_bakery para fixtures.
- **Lint/Type:** ruff (reemplaza flake8/black/isort), mypy gradual (empezar por `core/domain`).
- **DI:** Manual primero. Si crece, `dependency-injector` o `punq`.
- **API Contracts:** Considerar OpenAPI + drf-spectacular más adelante.
- **Observability:** logging structured + structlog (barato de añadir).
- **DB:** Seguir con Django ORM en adapter. Evaluar SQLAlchemy solo si se abandona Django (improbable a corto plazo).
- **Frontend:** Mantener Zustand + React Query (o SWR) para data fetching en adapters.

---

## 7. PRÓXIMOS PASOS INMEDIATOS (POST-APROBACIÓN DEL PLAN)

1. Usuario revisa y aprueba este plan (o solicita ajustes en fases específicas).
2. Crear rama `feature/hex-refactor/phase-00-prep-baseline` desde la actual.
3. Ejecutar Fase 0 siguiendo los pasos al pie de la letra.
4. Al terminar Fase 0: `git push`, actualizar bitácora, reportar resultados + pedir aprobación para Fase 1.
5. Repetir el ciclo por fase.

**Regla de oro:** Antes de iniciar cualquier fase N+1, la fase N debe estar **100% verificada** y documentada.

---

## 8. NOTAS FINALES DEL ARQUITECTO

Este proyecto tiene una base excelente y una ambición alta (educación + IoT + IA + Edge + docs impecables). La refactorización **es viable y deseable**, pero debe hacerse con disciplina quirúrgica.

El trabajo ya realizado en Mayo 2026 (la carpeta `logic/`) es un **activo** muy valioso — la estrategia correcta es "terminar lo que se empezó" en lugar de "empezar de nuevo".

Estoy listo para:
- Ajustar el plan según tus prioridades (¿prefieres acelerar frontend o backend primero?).
- Ejecutar Fase 0 tan pronto como des "luz verde".
- Revisar cada diff antes de commit si lo deseas.

**Fin del Plan de la Fase de Análisis.**

---
*Documento generado como salida de la fase de planificación (plan mode). No se realizaron cambios en el código fuente del proyecto.*
