# GUÍA TÉCNICA DE REFACTORIZACIÓN A ARQUITECTURA HEXAGONAL / CLEAN ARCHITECTURE

## Proyecto: SIGC&T Rural (sigcTiArural)
### Guía de Estudio — Análisis y Desarrollo de Software (ADSO - SENA)

**Última actualización registrada:** 06 de julio de 2026
**Rama de referencia más reciente:** `feature/refactor-modular-contexts`
**Versión del documento:** 2.0 — Consolidado y reorganizado cronológicamente
**Propósito:** Documento técnico de estudio y manual de continuidad para el proyecto SIGC&T Rural. Reúne el objetivo del proyecto, la arquitectura objetivo, el plan de refactorización, el inventario técnico y la bitácora histórica de avance, ordenada por fecha.

---

## ÍNDICE

1. Objetivo General del Proyecto y de la Refactorización
2. Arquitectura Objetivo: Hexagonal + Clean Architecture
3. Plan de Refactorización por Fases
4. Inventario Técnico del Proyecto
5. Cambios de Refactorización Realizados (Detalle Técnico — Fase 0)
6. Estado de Avance Hacia el Objetivo Planteado
7. Backlog Técnico para Producción (TODO Completo)
8. Bitácora Histórica de Avance (orden cronológico)
9. Guía para Retomar el Proyecto
10. Glosario Técnico
11. Referencias y Anexos
12. Declaración de Cierre — Fase 0

---

## 1. OBJETIVO GENERAL DEL PROYECTO Y DE LA REFACTORIZACIÓN

### 1.1 Objetivo del Proyecto SIGC&T Rural

Desarrollar una **plataforma web híbrida (Cloud + Edge)** que integra:

- IoT (sensores, robots en BeagleBone Black).
- Inteligencia Artificial aplicada (TensorFlow Cloud + TFLite Edge para diagnóstico de enfermedades en plantas).
- Educación técnica interactiva (laboratorios virtuales 3D de robótica, electrónica, matemáticas, telecomunicaciones y ciencia de datos).
- Impacto social en zonas rurales de Colombia, alineado con los ODS de la ONU y los proyectos productivos SENA ADSO.

**Stack tecnológico actual:**

- Backend: Django 4.2 + DRF (monolito con un intento parcial de arquitectura hexagonal).
- Frontend: React 18 + Vite + Three.js + Zustand (módulos de laboratorios muy extensos, pendientes de dividir).
- Servicio de IA: FastAPI + TensorFlow (MobileNetV2).
- Base de datos: PostgreSQL 15 (con una instancia MySQL heredada).
- Infraestructura: Docker Compose (5 servicios).
- Edge: Carpetas y contratos documentados, pendientes de implementación (clúster de BeagleBone Black).

**Estado general antes de la refactorización:** Funcional para demostraciones educativas, pero con alto acoplamiento, deuda técnica considerable, ausencia total de pruebas automatizadas y sin cumplir los requisitos mínimos para producción (seguridad, escalabilidad, mantenibilidad).

### 1.2 Objetivo Específico de la Refactorización

Refactorizar progresivamente el proyecto hacia **Arquitectura Hexagonal (Ports & Adapters)** combinada con **Clean Architecture**, manteniendo siempre las funcionalidades existentes (regla principal: nunca romper lo que ya funciona).

**Principios rectores del plan:**

- Strangler Fig Pattern + Branch by Abstraction + migración incremental.
- Dominio en "Python puro" (sin dependencias de Django, FastAPI, etc.).
- Testabilidad como primera prioridad (pytest sin base de datos para el dominio).
- Documentación como código: actualizar bitácora, documento maestro y diagramas en cada fase.
- Verificación obligatoria por fase: `docker up`, `curl`, `pytest`, flujos de UI manuales.
- Ramas por cambio importante, commits atómicos y uso de `git add -p`.

**Meta final:** Proyecto 100% listo para producción — servidor de producción, variables de entorno estrictas, cobertura de pruebas adecuada, integración continua básica, sin código heredado innecesario, arquitectura hexagonal completa en backend, frontend modular, autenticación real y capa edge lista para hardware.

---

## 2. ARQUITECTURA OBJETIVO: HEXAGONAL + CLEAN ARCHITECTURE

### 2.1 Definición en el contexto del proyecto

**Arquitectura Hexagonal (Ports and Adapters)** aplicada a un sistema multi-servicio compuesto por Django, FastAPI, React y una capa Edge.

**Diagrama conceptual de capas:**

```
[Interfaces / Adaptadores de Entrada]
  - Django Views (controladores delgados, solo orquestan)
  - DRF Serializers (DTOs de entrada/salida)
  - Endpoints FastAPI (servicio de IA)
  - Frontend React (adaptadores HTTP)

          ↓ (usa puertos)

[Capa de Aplicación / Casos de Uso]
  - Orquestadores (LaboratorioService, RobotCommandUseCase, etc.)
  - DTOs de aplicación

          ↓ (usa puertos de salida)

[Capa de Dominio (Núcleo Hexagonal - Python Puro, sin framework)]
  - Entidades / Value Objects (SensorReadingEntity, RobotAggregate, etc.)
  - Servicios de Dominio (LaboratorioService puro)
  - Eventos de Dominio
  - Puertos (interfaces abstractas):
    - RepositoryPort (list_recent_readings, save_telemetry...)
    - AIServicePort (predecir_enfermedad, obtener_sugerencias)
    - NotificationPort
    - EventBusPort (a futuro)
  - Estrategias / Fábricas (para los 4 laboratorios: robótica, agricultura, electrónica, telecomunicaciones)

          ↑ (implementados por)

[Infraestructura / Adaptadores de Salida]
  - Adaptador Django ORM (mapeo Entidad <-> Modelo)
  - Adaptador FastAPI de IA (cliente HTTP + mecanismo de respaldo)
  - Adaptador de notificaciones (consola / correo / WebSocket)
  - Adaptador MQTT (para la capa edge, a futuro)
  - Adaptador en memoria (para pruebas)

[Frameworks y Drivers (capa más externa)]
  - Django (modelos, migraciones, admin, WSGI/ASGI)
  - Django REST Framework
  - FastAPI + Uvicorn
  - React + Vite
  - PostgreSQL
  - Docker
```

**Características clave de esta arquitectura para el proyecto:**

- **Dominio aislado:** ubicado en `src/backend/core/domain/` (o su equivalente en reorganización, `src/backend/api/logic/domain/`), sin ninguna dependencia de Django. Debe poder probarse con `pytest` puro.
- **Inyección de dependencias explícita:** un "composition root" en las vistas/urls o un contenedor simple (sin instanciación directa dentro del dominio).
- **Strangler Fig:** los endpoints heredados (ViewSets V1 con acceso directo a modelos) conviven con versiones V2/V3 que usan la capa hexagonal. Migración vertical por contexto delimitado (Telemetría, Robots, Laboratorios, etc.).
- **Mappers obligatorios:** nunca exponer los modelos de Django al dominio; el adaptador de persistencia realiza la traducción.
- **Contextos delimitados (bounded contexts) — lista definitiva (reconciliada 20-jul-2026):**

  Reconciliación cerrada entre los candidatos técnicos previos de este documento, la lista de `HEXAGONAL_REFACTOR_PLAN.md` (sección superada, ver ese archivo), los 7 "contextos oficiales" de `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`, y la identidad canónica del proyecto en `docs/ECOSYSTEM_IDENTITY.md` (fuente de verdad para qué es y qué no es un dominio del ecosistema).

  | Contexto | Tipo | Evidencia de código ya existente | Riesgo de construcción |
  |---|---|---|---|
  | Laboratorios | Código (bounded context) | `api/logic/domain/{agricultura,electronica,robotica,telecom}.py` + `core/domain/strategies/{...}_strategy.py` — duplicado en 2 capas, el más maduro | Bajo |
  | Telemetría | Código (bounded context) | `core/domain/entities/sensor_reading.py` + value objects (`sensor_id`, `temperature`, `humidity`) + `sensor_reading_repository.py` | Bajo |
  | IA (`ai_advisory`) | Código (bounded context) | `infrastructure/external/ai_service/{fastapi_ai_adapter,semantic_prediction_resolver}.py` | Medio |
  | Identidad | Código (bounded context) | `src/backend/users/` — solo `__init__.py`, vacío | Alto |
  | Conocimiento (absorbe "Cursos") | Código (bounded context, futuro) | Solo frontend (`src/frontend/src/knowledge-hub/`) — cero backend | Alto |
  | IoT | Código (bounded context, distinto de Telemetría — gobierna dispositivos, no datos) | Ninguna — `src/embedded/bbb_*/` en 0 bytes | Muy alto (depende de hardware físico no disponible) |
  | Investigación | Documental/proceso — transversal, no un contexto | N/A por diseño (ver README.md, diagrama C4) | No aplica |
  | Gobernanza | Documental/proceso | N/A — vive en `docs/eiarc/` y `SIGCT_RURAL_SYSTEM_BOOT.md` | No aplica |
  | Notificaciones | Infraestructura transversal (no es contexto) | `infrastructure/external/notifications/console_notification_adapter.py` | N/A — se mantiene como `shared_kernel` |
  | Deployment | Infraestructura/DevOps (no es contexto) | `docker-compose.yml`, Dockerfiles, `.env.example`, `scripts/*.ps1`/`*.sh` — configuración, no dominio | N/A |
  | EIARC | Marco de gobierno / meta-capa (no es un contexto par) | N/A — audita y da coherencia a los demás, no aporta entidades propias | N/A |

  **Cursos** se absorbe dentro de **Conocimiento** — no es un contexto propio: el Principio 3 de `docs/ECOSYSTEM_IDENTITY.md` describe cursos y recursos académicos curados como la misma responsabilidad de curación (seleccionar, curar, referenciar), sin reglas de negocio distintivas propias.

  **Orden de construcción recomendado (Días 8-10):** 1º Laboratorios, 2º Telemetría — ambos con evidencia de código madura y riesgo bajo de romper lo existente (Strangler Fig puro, sin lógica nueva que inventar). Identidad, Conocimiento e IoT quedan fuera de esta fase: los dos primeros requieren dominio nuevo desde cero, el tercero depende de hardware físico no disponible. El puerto de entrada de Telemetría debe diseñarse agnóstico a IoT (Principio 1 de `docs/ECOSYSTEM_IDENTITY.md`), para no bloquear su construcción hoy ni asumir que IoT ya existe.
- **Multi-servicio:** el servicio de IA es un adaptador externo (HTTP). La capa Edge (MQTT) será otro puerto.
- **Frontend:** adoptar una organización tipo Feature-Sliced o Clean Architecture adaptada (entities, use-cases/adapters, ui), extrayendo la lógica de simulación de los laboratorios más grandes (SchematicEditor ~80kB, ElectronicsLab ~74kB).
- **Aspectos transversales de producción:** logging estructurado, manejo de errores mediante puertos, configuración centralizada (pydantic-settings o django-environ), seguridad (JWT real, CORS estricto, limitación de tasa), observabilidad (healthchecks, métricas básicas).

**Ventajas de esta arquitectura para el proyecto (educativo + productivo + edge):**

- Alta testabilidad del dominio (simulaciones de laboratorios, lógica de estrés hídrico, etc.) sin necesidad de base de datos ni de Docker.
- Flexibilidad: cambiar de motor de base de datos afecta solo al adaptador y a las migraciones.
- Mantenibilidad: la lógica de los 4 laboratorios queda centralizada y es extensible (un nuevo laboratorio implica una nueva estrategia en la fábrica).
- Resiliencia: mecanismos de respaldo en los adaptadores (si el servicio de IA falla, se ofrecen sugerencias básicas locales).
- Alineación con los objetivos de ADSO SENA: aplica principios SOLID, patrones de diseño (Strategy, Factory, Repository, Adapter), separación de responsabilidades y pruebas de caracterización (TDD).

**Comparación estado actual vs. estado deseado:**

- Existe `src/backend/api/logic/` con dominio/puertos/adaptadores, introducido en mayo de 2026 bajo el patrón Strangler Fig.
- Cobertura real de pruebas: entre 15% y 25%. Solo 2 endpoints V2 usan la lógica hexagonal.
- Predomina el modelo anémico: `models.py` como simples contenedores de datos, vistas con acceso directo al ORM, datos de simulación duplicados.
- Faltan entidades ricas, mappers reales, contenedor de inyección de dependencias y pruebas (hasta antes de la Fase 0).

---

## 3. PLAN DE REFACTORIZACIÓN POR FASES

El plan completo está documentado en `docs/HEXAGONAL_REFACTOR_PLAN.md`.

**Metodología general:**

- Patrón Strangler Fig: mantener el código heredado funcionando e introducir la nueva implementación en paralelo.
- Slices verticales por contexto delimitado (sin cambios masivos de una sola vez).
- Cada fase requiere: rama dedicada, cambios pequeños, verificación obligatoria (Docker, `curl`, pytest, revisión manual de UI), commit atómico y actualización de bitácora y diagramas.
- Convención de ramas: `feature/hex-refactor/phase-XX-...`

### 3.1 Fases del plan

**FASE 0 — Preparación, Línea Base y Saneamiento Inmediato (prioridad crítica) — COMPLETADA**
- Objetivo: establecer una línea base segura y el andamiaje de pruebas.
- Detalle completo en la Sección 5.
- Criterios de cierre: `pytest src/backend/tests/ -q` pasa correctamente, el script de verificación entrega un resumen útil, el endpoint `/infer` responde con el JSON esperado.
- Rama: `feature/hex-refactor/phase-00-prep-baseline`.

**FASE 1 — Consolidar y Mejorar el Núcleo Hexagonal Existente (prioridad alta)**
- Mover y refinar `api/logic/` hacia una estructura más limpia (`core/domain`, `application/`, `infrastructure/`).
- Definir entidades ricas y value objects.
- Mejorar los puertos (métodos específicos por agregado).
- Mappers en los adaptadores.
- Trasladar los datos de simulación al dominio (eliminando duplicados en las vistas).
- Pruebas exhaustivas (meta: más del 70% de cobertura en el dominio).
- Actualizar README y documentación relacionada.

**FASE 2 — Migrar Lógica de Negocio Principal (prioridad media-alta)**
- Slices verticales: Telemetría, Robots + Telemetría, Comandos.
- Crear casos de uso en la capa de aplicación.
- Convertir las vistas heredadas en controladores delgados que delegan a los casos de uso.
- Actualizar adaptadores.
- Pruebas de integración (mocks o base de datos de prueba).
- Mantener el código heredado operativo durante la migración.

**FASE 3 — Capa de Infraestructura, Adaptadores y Composition Root (prioridad media-alta)**
- Extraer los adaptadores a `infrastructure/`.
- Mappers bidireccionales reales.
- Composition root simple (`container.py` o `dependencies.py`).
- Soporte de adaptador en memoria para pruebas.
- Configuración centralizada.

**FASE 4 — Servicio de IA, Notificaciones y Resiliencia (prioridad media-alta)**
- Completar el cableado del adaptador de IA (incluyendo `/suggest` si aplica).
- Implementar adaptadores reales de notificaciones (WebSocket básico, etc.).
- Circuit breaker / reintentos en adaptadores externos.
- Pruebas de resiliencia (comportamiento cuando el servicio de IA no responde).

**FASE 5 — Refactor Progresivo del Frontend (prioridad media, alta complejidad)**
- Adoptar Feature-Sliced Design o Clean Architecture para React.
- Estructura propuesta: `shared/`, `entities/`, `features/` (laboratorios como features), `widgets/`, `pages/`, `adapters/api/`.
- Extraer la lógica de simulación de los laboratorios más grandes (priorizando Electrónica / Editor de Esquemas).
- Centralizar el cliente de API (manejo de entorno y errores).
- Actualizar hooks y stores para usar los nuevos adaptadores.
- Mantener la interfaz idéntica durante la migración.

**FASE 6 — Autenticación, Autorización y Protección (prioridad media)**
- Incorporar `simplejwt` (o equivalente).
- Endpoints reales de login/registro.
- Proteger vistas (`IsAuthenticated` + permisos).
- Actualizar el `AuthContext` del frontend.
- Modo demo configurable por variable de entorno (para no interrumpir las demostraciones educativas).
- Puerto `CurrentUser` si es necesario.

**FASE 7 — Edge Computing, Ingesta y Eventos (prioridad baja, no bloqueante)**
- Diseñar los puertos: `SensorIngestionPort`, `RobotCommandPort`, `EdgeInferencePort`.
- Implementar adaptadores MQTT cuando el hardware esté disponible.
- Bus de eventos (Redis/RabbitMQ) para procesamiento asíncrono (alertas, telemetría).
- No debe bloquear el avance de las demás fases.

**FASE 8 — Pruebas, Observabilidad, Hardening, Depreciación y Cierre (prioridad crítica, continua)**
- Meta de cobertura: más del 60% en dominio/aplicación del backend, más del 40% general.
- Pruebas E2E ligeras (Puppeteer ya está entre las dependencias).
- Preparación para producción:
  - Backend: gunicorn + Daphne (o uvicorn workers) en el Dockerfile, no `runserver`.
  - `SECRET_KEY` real, `DEBUG=False` por defecto, `ALLOWED_HOSTS` estricto.
  - Whitenoise (o equivalente) para archivos estáticos.
  - Limitación de tasa, logging estructurado (structlog).
- Eliminar código heredado (solo después de verificación completa).
- Retirar la base de datos MySQL legacy si ya no se usa.
- Actualizar todos los diagramas, el documento maestro y el README.
- Healthchecks robustos y métricas básicas.
- Documento final "Arquitectura Objetivo Alcanzada" con lecciones aprendidas.

**Cronograma aproximado:** Fase 0 (1 semana), Fase 1 (1.5 semanas), Fases 2-3 (2-3 semanas), Fases 4-6 (3-4+ semanas), Fase 7 (variable), Fase 8 (2 semanas). Total estimado: 4.5 a 7 meses en dedicación parcial.

**Herramientas recomendadas:** pytest + pytest-django (adopción gradual), ruff, mypy gradual en `core/domain`, entre otras.

---

## 4. INVENTARIO TÉCNICO DEL PROYECTO

### 4.1 Rama y Cambios de la Fase 0

- **Rama:** `feature/hex-refactor/phase-00-prep-baseline`.
- **Cambios realizados en esta fase:**
  - `src/ai_models/fastapi_app.py`: reemplazo completo de la función `infer` para eliminar el parámetro `request: Optional[Request] = None`, que causaba un error de tipo `FastAPIError` con Pydantic/Starlette. Se dejó una versión minimalista que solo recibe `file: Optional[UploadFile]`.
  - `src/backend/requirements.txt`: se agregó la sección de pruebas con `pytest>=7.4`.
  - `src/backend/pytest.ini`: nueva configuración (`pythonpath=.`, `testpaths=tests`, sin forzar Django todavía).
  - `src/backend/tests/`: estructura completa creada, incluyendo `tests/__init__.py`, `tests/conftest.py`, `tests/domain/__init__.py`, `tests/domain/test_factories.py` (5 pruebas de caracterización) y `tests/domain/test_services.py` (5 pruebas iniciales).
  - `scripts/verify_refactor.ps1`: creado y mejorado en varias iteraciones — reemplazo de `curl` por `curl.exe`, detección robusta de contenedores, manejo explícito de `$LASTEXITCODE`, mensajes accionables, contadores globales de aprobados/advertencias/fallidos y resumen final coloreado.
  - `scripts/verify_refactor.sh`: versión básica para Linux/macOS.
  - `src/ai_models/test_leaf.jpg`: imagen de prueba generada para el endpoint `/infer`.
- **Estado del control de versiones al cierre de la fase:** cambios sin confirmar en `requirements`, `fastapi_app.py` y `verify.ps1`; archivos nuevos sin seguimiento: `tests/`, `pytest.ini`, `verify.sh`, `test_leaf.jpg`.
- **Commits relacionados:** `f23516a` (documentación: agregar plan), `2eaa425` (arquitectura hexagonal previa), entre otros, en la rama dedicada de la Fase 0.

### 4.2 Inventario por Componente

**Backend (Django):**
- Estructura: `src/backend/api/` (modelos anémicos, vistas heredadas + V2 parcial, serializadores, urls mixtas, `logic/` con dominio/puertos/adaptadores).
- `logic/domain/`: 4 estrategias + servicios + fábricas + interfaces (Python puro).
- `logic/ports/`: `RepositoryInterface`, `AIServicePort`, `NotificationPort` (abstractos).
- `logic/adapters/`: `DjangoRepository` (usa referencias por string a modelos, lo cual es frágil), `FastAPI_AIAdapter` (con mecanismo de respaldo), `ConsoleNotification`.
- Problemas identificados: acoplamiento alto, duplicación de datos de simulación, ausencia de mappers y entidades ricas, sin inyección de dependencias real, vistas no delgadas.
- Pruebas: 10 pruebas de caracterización puras en `tests/domain/` (nuevas en la Fase 0). `pytest.ini` configurado.
- Configuración: `DEBUG=True`, `ALLOWED_HOSTS=['*']`, `SECRET_KEY` de desarrollo insegura, sin `simplejwt`, sin whitenoise, WSGI (no ASGI completo, aunque la documentación menciona Channels).
- Requisitos: actualizados con pytest; falta gunicorn y otras dependencias de producción.
- Migraciones: 2 existentes (SensorReading y Robot/Telemetry/Command).
- Aplicación de usuarios: prácticamente vacía.

**Servicio de IA (FastAPI):**
- `src/ai_models/fastapi_app.py`: endpoints `/health`, `/assist` (voz + procesamiento), `/analyze-circuit`, y `/infer` (corregido en la Fase 0), que reutiliza `load_latest_model` y `preprocess_image`, con predicción simulada estable ("Tomato_Early_blight") y registro en `INFER_LOG`.
- Problema previo: faltaba `/infer`, lo que forzaba siempre el mecanismo de respaldo. Ahora funcional.
- Modelo: `plant_disease_mbv2.h5` (MobileNetV2), con metadatos binarios ("enferma"/"sana") pero entrenado sobre el conjunto completo PlantVillage.
- Dependencias pesadas (tensorflow-cpu, etc.). Usa `psycopg2` directo en algunos casos, sin pasar por el backend.
- Dockerfile multi-stage con ffmpeg, entre otros.

**Frontend (React):**
- Estructura monolítica: `pages/`, `labs/` (archivos muy grandes), `components/`, stores (Zustand para electrónica), hooks (`useRoboticsApi`), `services/cloud.js` (mezcla de datos simulados y servicios externos).
- Problemas: lógica de simulación mezclada con UI en los laboratorios (SchematicEditor 80kB+, Electronics 74kB+), URLs codificadas de forma fija, autenticación solo de demostración, sin cliente de API centralizado.
- Sin pruebas de frontend visibles.
- Stack: Vite + Tailwind + Three.js + ReactFlow + Recharts.

**Infraestructura y DevOps:**
- `docker-compose.yml`: 5 servicios (Postgres, MySQL heredado, backend, servicio de IA, frontend con nginx). Advertencia de versión obsoleta en el archivo de compose.
- Dockerfile del backend: usa `runserver` (modo desarrollo).
- Dockerfile del servicio de IA: usa uvicorn.
- Scripts existentes: `verify_refactor.ps1` (mejorado), `docker_maintain.ps1`, generadores de diagramas, simulación de física, etc.
- Sin integración continua visible, sin configuración de despliegue de producción (gunicorn, variables de entorno estrictas, etc.).
- `.env.example` básico.

**Documentación:**
- Muy completa: documento maestro, plan maestro, informe de análisis y bitácora con sesiones de mayo de 2026 sobre el trabajo hexagonal, diagramas (C4, ER, UML), arquitectura, etc.
- `HEXAGONAL_REFACTOR_PLAN.md` actualizado con la Fase 0.
- Existe cierto desfase entre documentación y código (por ejemplo, se menciona Channels pero no está en los requisitos).

**Otros:**
- Edge: 3 carpetas con archivos de 0 bytes (solo estructura, sin implementación).
- Sin pruebas E2E de frontend (Puppeteer está en las dependencias raíz pero no se usa).
- Base de datos: `schema_postgresql.sql` y scripts de importación disponibles.

**Estado de la Fase 0 según los criterios del plan:**
- Pruebas: `pytest src/backend/tests/domain/ -q` se ejecuta correctamente (10 pruebas).
- Script de verificación: ejecutable, entrega conteos y resumen coloreado.
- `/infer`: funciona (retorna JSON con diagnóstico, confianza y estado).
- Contenedores: verificables mediante el script.
- No se modificó código heredado ni la interfaz de usuario.

---

## 5. CAMBIOS DE REFACTORIZACIÓN REALIZADOS (DETALLE TÉCNICO — FASE 0)

### 5.1 Cambios en Código Fuente

- **Servicio de IA (corrección crítica de integración):**
  - Archivo: `src/ai_models/fastapi_app.py`.
  - Antes: `infer` aceptaba un objeto `Request` para manejar tanto base64 como archivo, lo cual causaba un error de Pydantic al iniciar el contenedor.
  - Después: solo recibe `file: Optional[UploadFile] = File(default=None)`. Lógica simplificada: lectura → preprocesamiento → predicción (o mecanismo de respaldo) → resultado con registro en `INFER_LOG`.
  - Se mantiene compatibilidad con el formato esperado por el adaptador del backend y por el componente `AIPredictiva` del frontend.

- **Pruebas de dominio del backend (caracterización — primer paso hacia la testabilidad):**
  - Nueva estructura completa en `src/backend/tests/`.
  - `test_factories.py`: pruebas puras que verifican el comportamiento actual de `LaboratorioStrategyFactory` (incluyendo el error `ValueError` esperado y la insensibilidad a mayúsculas/minúsculas).
  - `test_services.py`: pruebas de `LaboratorioService` (delegación a estrategias, estructura de resultados, longitud de las simulaciones). Los casos reflejan el comportamiento real y actual del servicio (no un comportamiento idealizado).
  - Ambos módulos importan directamente de `api.logic.domain.*`, habilitado por la configuración de `pythonpath` en `pytest.ini`.
  - Se ejecutan en aislamiento, sin depender de Django.

- **Requisitos y configuración de pruebas:**
  - `src/backend/requirements.txt`: sección de pruebas agregada.
  - `src/backend/pytest.ini`: configuración básica (`testpaths=tests`, `pythonpath=.`, opciones para salida silenciosa y trazas cortas). Configuración de Django comentada para uso futuro.

### 5.2 Scripts Creados y Mejorados

- **`scripts/verify_refactor.ps1`** (principal, mejorado en múltiples iteraciones):
  - Estructura de 5 secciones numeradas más un resumen final.
  - Mejoras aplicadas: uso explícito de `curl.exe` (evitando el alias conflictivo de PowerShell); detección robusta de contenedores mediante `try/catch` y filtrado; verificación explícita de `$LASTEXITCODE` en las pruebas de backend con mensajes claros cuando el contenedor no está activo; doble verificación de pytest con mensajes de instalación exactos; contadores globales de aprobados, advertencias y fallidos; resumen final con color dinámico según el resultado.
  - Uso: `.\scripts\verify_refactor.ps1` o con el parámetro `-StartServices`.
  - También genera `test_leaf.jpg` si no existe.

- **`scripts/verify_refactor.sh`**: versión básica para entornos bash (verificación de contenedores, `curl` y pytest).

- Otros scripts existentes referenciados: `docker_maintain.ps1`, generadores de diagramas, scripts de ejecución local, entre otros, usados para documentación y mantenimiento.

### 5.3 Cambios en Estructura y Configuración

- Creación de `src/backend/tests/domain/` con pruebas de caracterización (base inicial para alcanzar más del 60% de cobertura a futuro).
- Actualizaciones menores en `.gitignore`.

### 5.4 Documentación Actualizada

- `docs/HEXAGONAL_REFACTOR_PLAN.md`: plan completo incorporado y actualizado con la Fase 0 ejecutada.
- El presente documento.

---

## 6. ESTADO DE AVANCE HACIA EL OBJETIVO PLANTEADO

**Progreso general:** aproximadamente 10-15% del refactor hexagonal completo más la preparación para producción (Fase 0 completada, junto con algunas correcciones previas en los laboratorios).

**Lo que ya está listo (posterior a la Fase 0):**
- Integración básica de IA funcional (`/infer` estable).
- Pruebas unitarias puras de dominio (10 pruebas de caracterización iniciales).
- Script de verificación robusto para Windows, con resumen automático.
- Base de configuración de pytest lista.
- Rama y commits atómicos establecidos.
- Conocimiento claro del plan completo y de las brechas pendientes.

**Brechas principales (ver Sección 7 para el backlog completo):**
- Arquitectura: solo aproximadamente 20% hexagonal real (predomina el código heredado, sin mappers, sin entidades ni composition root).
- Pruebas: sin cobertura en adaptadores, vistas, integración E2E ni frontend.
- Producción: `DEBUG` activo, uso de `runserver`, sin autenticación real, sin gunicorn, CORS abierto, sin logging estructurado, base de datos MySQL heredada, sin integración/despliegue continuo.
- Frontend: módulos de código muy extensos, difíciles de mantener.
- Edge: 0% de código implementado (solo documentación).
- Seguridad/Autenticación: solo modo demostración.
- Desfase entre documentación y código.

**Métricas aproximadas en este punto:**
- Cobertura de pruebas: cercana al 0% (solo las 10 pruebas nuevas de dominio).
- Endpoints que usan la capa hexagonal: 2 de muchos.
- Proporción de archivos heredados frente a nuevos: mayoría heredados.
- Listo para producción: no (crítico en seguridad y estabilidad).

---

## 7. BACKLOG TÉCNICO PARA PRODUCCIÓN (TODO COMPLETO)

Categorizado por área. Cada ítem representa una tarea pendiente identificada durante el análisis del proyecto.

### 7.1 Arquitectura Hexagonal (núcleo — bloqueante para el resto)
- [ ] Mover/refinar `api/logic/` a una estructura limpia (`core/domain`, `application/`, `infrastructure/persistence/django/`, `interfaces/web/api/`).
- [ ] Definir entidades ricas y value objects (SensorReadingEntity, Robot, Telemetry, Command, con sus invariantes).
- [ ] Mejorar los puertos (métodos de consulta/comando específicos, no solo un `listar_todos(string)` genérico).
- [ ] Implementar mappers completos en todos los adaptadores (nunca exponer modelos al dominio).
- [ ] Composition root real (`dependencies.py` o contenedor equivalente).
- [ ] Mover toda la lógica de simulación/generación histórica a estrategias de dominio (eliminarla de las vistas heredadas).
- [ ] Actualizar las vistas V2 para usar casos de uso puros.
- [ ] Refactorizar el adaptador y los puertos de IA para `/suggest`, si se usa.

### 7.2 Migración de Lógica de Negocio (Backend heredado → Hexagonal)
- [ ] Slice vertical 1: Telemetría (histórico V1/V2, modelos → entidades).
- [ ] Slice vertical 2: Robots + RobotTelemetry.
- [ ] Slice vertical 3: RobotCommand (escritura, comandos hacia edge).
- [ ] Crear casos de uso en la capa de aplicación.
- [ ] Convertir las vistas heredadas en controladores delgados (solo invocan la aplicación y devuelven DTOs).
- [ ] Actualizar las urls manteniendo en paralelo lo heredado y lo nuevo.
- [ ] Pruebas de integración por slice (con mocks de puertos o base de datos de prueba).

### 7.3 Infraestructura y Adaptadores
- [ ] Extraer todos los adaptadores a `infrastructure/`.
- [ ] Soporte de repositorio en memoria para pruebas puras.
- [ ] Configuración centralizada (pydantic o settings de Django limpios).
- [ ] Adaptador real de notificaciones (al menos WebSocket básico vía Channels o Redis).

### 7.4 Servicio de IA y Resiliencia
- [ ] Completar el cableado de `/suggest` o integrarlo en el dominio.
- [ ] Circuit breaker/reintentos en el adaptador de IA (tenacity).
- [ ] Pruebas de resiliencia (simulación de caída del servicio de IA).
- [ ] Evaluar mover la lógica de inferencia si se decide, manteniendo FastAPI como adaptador.

### 7.5 Frontend (una de las tareas de mayor esfuerzo)
- [ ] Adoptar estructura Feature-Sliced/Clean (`shared/ui`, `entities`, `features/labs/*`, `adapters/api`).
- [ ] Centralizar el cliente de API (URL base desde entorno, interceptores de error, autenticación).
- [ ] Extraer la lógica de simulación de ElectronicsLab y SchematicEditor.
- [ ] Refactorizar los laboratorios grandes por fases, comenzando por los más pequeños.
- [ ] Actualizar `useRoboticsApi`, `cloud.js` y `useLabStore` para usar los nuevos adaptadores.
- [ ] Autenticación real (integración con JWT del backend).
- [ ] Pruebas unitarias de features/adaptadores (vitest o jest).
- [ ] Resolver URLs codificadas de forma fija y la mezcla entre entorno productivo y local.

### 7.6 Autenticación, Seguridad y Protección (crítico para producción)
- [ ] Añadir `djangorestframework-simplejwt` a los requisitos.
- [ ] Endpoints reales `/auth/login` y `/auth/register` (o usar allauth).
- [ ] Proteger todos los endpoints (`IsAuthenticated`, permisos por rol si aplica).
- [ ] Actualizar el `AuthContext` del frontend para usar tokens reales (access + refresh).
- [ ] Mantener un "modo demo" configurable por entorno para no interrumpir las demostraciones educativas.
- [ ] CORS estricto (sin comodín `*` en producción).
- [ ] Limitación de tasa básica.
- [ ] `SECRET_KEY` real desde variable de entorno (nunca un valor por defecto).
- [ ] `ALLOWED_HOSTS` estricto.
- [ ] HTTPS en producción (nginx o proxy).

### 7.7 DevOps, Producción y Hardening
- [ ] Dockerfile del backend: cambiar el comando a gunicorn + Daphne/uvicorn workers (no `runserver`).
- [ ] Añadir gunicorn y whitenoise (o configuración de `collectstatic`) a los requisitos.
- [ ] `DEBUG=False` por defecto y logging estructurado (structlog o django-structlog).
- [ ] Endpoint de healthcheck robusto y métricas básicas (para Docker/orquestador).
- [ ] Retirar MySQL del compose (o documentar por qué se mantiene).
- [ ] Variables de entorno estrictas (`.env.example` completo, validación en settings).
- [ ] `.dockerignore` completo.
- [ ] Integración continua básica (GitHub Actions: lint, pruebas, construcción de imágenes).
- [ ] Documentación de despliegue actualizada (expandir `DEPLOYMENT.md` con el escenario de producción).
- [ ] Monitoreo básico (logs centralizados).
- [ ] Scripts de respaldo para la base de datos.
- [ ] Eliminar archivos de caché de Python del repositorio (actualizar `.gitignore` si falta).
- [ ] Actualizar `docker-compose` para producción (perfiles o archivo de override).

### 7.8 Pruebas y Calidad
- [ ] Cobertura completa de adaptadores (mocks).
- [ ] Pruebas de integración (con base de datos de prueba o pytest-django).
- [ ] E2E de frontend (Puppeteer/Playwright, dependencias ya disponibles).
- [ ] Aumentar las pruebas de dominio (todas las estrategias, casos extremos de simulación).
- [ ] Adoptar pytest-django cuando se requiera.
- [ ] Reporte de cobertura (pytest-cov) con meta superior al 60% en dominio.
- [ ] Linting y formato (ruff + pre-commit).
- [ ] mypy de adopción gradual en `core/domain`.

### 7.9 Edge Computing e Integraciones
- [ ] Implementar código real en `src/embedded/` (`mqtt_broker`, `tflite_api`, `sensor_reader`), actualmente vacío.
- [ ] Puertos para ingesta MQTT y comandos.
- [ ] Adaptador MQTT real.
- [ ] Bus de eventos (se recomienda Redis pub/sub) para procesamiento asíncrono.
- [ ] Integración real con hardware BeagleBone Black cuando esté disponible (probar primero con mocks).
- [ ] Actualizar `EDGE_SETUP.md` si es necesario.

### 7.10 Documentación y Continuidad
- [ ] Actualizar documento maestro, diagramas, C4 y modelo ER con el estado posterior a cada fase de refactorización.
- [ ] Actualizar el informe de análisis y plan de acción con cada nueva fase.
- [ ] Actualizar el README con el estado real del avance hexagonal y enlace a esta guía.
- [ ] Mantener este documento vivo.
- [ ] Guía de contribución (cómo ejecutar pruebas, el script de verificación, cómo agregar un nuevo laboratorio).
- [ ] Capturas o videos de verificación.
- [ ] Actualizar el plan maestro con el progreso real.

### 7.11 Otros / Limpieza General
- [ ] Retirar el código heredado una vez migrados los slices correspondientes (con banderas de características y fecha de depreciación).
- [ ] Consolidar URLs codificadas de forma fija (frontend, adaptador de IA, etc.) en configuración central.
- [ ] Revisar y limpiar los notebooks frente al modelo de producción.
- [ ] Evaluar separar los contextos delimitados en paquetes independientes si el proyecto crece.
- [ ] Optimizar el rendimiento de simulaciones pesadas (electrónica).
- [ ] Revisar accesibilidad y diseño responsive en el frontend, especialmente en los laboratorios más grandes.
- [ ] Actualizar licencias, contribuciones y materiales SENA si aplica.

**Total estimado de tareas pendientes:** más de 60 tareas técnicas detalladas. Prioridad sugerida: arquitectura + seguridad + pruebas + Docker de producción primero; luego frontend y edge.

**Criterio final de "100% listo para producción":**
- `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up` funciona sin advertencias críticas.
- `pytest --cov=src/backend --cov-fail-under=60` se ejecuta correctamente.
- Todas las verificaciones del script de verificación resultan exitosas, sin advertencias.
- `DEBUG=False`, `SECRET_KEY` desde entorno, autenticación real protegida.
- Cobertura completa de los 4 laboratorios más IoT e IA en el dominio hexagonal.
- Frontend con features limpios y pruebas.
- Edge con código funcional (mocks o real).
- Documentación 100% sincronizada con el código.
- El script de verificación reporta un resultado totalmente satisfactorio.

---

## 8. BITÁCORA HISTÓRICA DE AVANCE (ORDEN CRONOLÓGICO)

Esta sección reúne, en orden de fecha, el registro de las sesiones de trabajo realizadas sobre el proyecto. Cada entrada documenta únicamente tareas de bajo riesgo (pruebas de caracterización, scripts de verificación, configuración de pruebas y documentación), sin modificar lógica de negocio en producción, siguiendo la metodología Strangler Fig descrita en la Sección 3.

### 8.1 — 02 de junio de 2026: Fase 0, consolidación de pruebas y scripts

**Rama de trabajo:** `feature/hex-refactor/phase-00-prep-baseline`.
**Enfoque de la sesión:** tareas de bajo riesgo únicamente — documentación, pruebas de caracterización y pulido de scripts, sin impacto en la lógica de negocio. Validación frecuente mediante `git status`, `git diff` y `verify_refactor.ps1`.

**Tareas priorizadas (según el backlog de la Sección 7):**
- De *Pruebas y Calidad*: aumentar las pruebas de caracterización de dominio para todas las estrategias y casos extremos; incorporar soporte de cobertura (pytest-cov) sin forzarlo en todas las ejecuciones.
- De *Documentación y Continuidad*: mantener viva esta guía técnica.
- Pulido general: mejorar el filtrado de advertencias de "version: obsolete" de docker-compose en el script de verificación.

**Tareas explícitamente no ejecutadas por riesgo:** cualquier tarea de arquitectura (mover carpetas, entidades, composition root), migración de vistas legacy, cambios en Dockerfiles, configuración de producción o implementación de la capa edge.

**Trabajo realizado, en orden:**

1. **Confirmación de estado inicial (línea base):** verificación de la rama activa y del estado de git; ejecución de `verify_refactor.ps1`, que en este entorno reportó 2 errores esperados (contenedores no activos), 2 verificaciones correctas del servicio de IA (`/health` e `/infer` con imagen de prueba) y ejecución de 10 pruebas de dominio.

2. **Incorporación de `pytest-cov`** (dependencia de desarrollo, bajo riesgo): agregado a `src/backend/requirements.txt`.

3. **Actualización de `pytest.ini`** para habilitar cobertura: se añadieron las opciones `--cov=api --cov-report=term-missing --cov-report=html`, junto con comentarios explicativos.

4. **Ampliación de pruebas de dominio, primera ronda:** se agregaron pruebas adicionales sobre `generar_historico_simulado()` para todas las estrategias, incluyendo casos con 0, 1, 5, 24 y 48 horas, y el caso de horas negativas o cero (que caracteriza el retorno de una lista vacía). Total de pruebas: **24**.

5. **Pulido adicional del script de verificación:** mensajes más claros y accionables cuando los contenedores no están activos; conteos globales de aprobados, advertencias y fallidos.

6. **Segunda ronda de pruebas de dominio** (4 nuevas, orientadas a casos débiles de `procesar()`): comportamiento bajo estrés hídrico bajo en agricultura, combinación de estrés crítico con imagen analizada, caso de electrónica con cero nodos, y cálculo de corriente con múltiples componentes. Total de pruebas: **28**.

7. **Mejora del resumen del script de verificación:** se agregó un bloque de "Estado general" (aprobados/advertencias/errores) al inicio del resumen, para una lectura más rápida.

8. **Configuración de cobertura (`.coveragerc`):** creación de un archivo simple con `source = api`, exclusiones para pruebas, migraciones y caché, y opciones de precisión. Complementa `pytest-cov` y la configuración de `pytest.ini`.

9. **Ronda de refuerzo de pruebas (3 nuevas):** casos de valores por defecto vacíos en agricultura (caracterizando el umbral que dispara el estado "Crítico"), comportamiento de eco literal en robótica (sin transformación del payload recibido), y una prueba de integración tipo *smoke* que verifica que la fábrica de estrategias y el servicio de laboratorio producen resultados consistentes para los 4 tipos de laboratorio. Total de pruebas: **31**.

10. **Mejora de `.coveragerc`:** se agregó `branch = True` bajo `[run]` para visualizar cobertura de ramas condicionales, y una sección `[html]` con directorio de salida `htmlcov`.

**Resultado de las validaciones de esta sesión:**
- 31 pruebas de dominio pasando de forma consistente.
- Cobertura con análisis de ramas activada: agricultura 66.67%, servicios 87.50%, fábricas y el resto de estrategias 100%.
- El script de verificación reporta el nuevo bloque de "Estado general" correctamente.
- Cero cambios en lógica de producción; únicamente adiciones en pruebas, configuración de cobertura y mensajes del script.

**Continuación de la sesión — inicio de la Fase 1 (rama `feature/hex-refactor/phase-01-consolidate-domain`):**

Tras el cierre y commit de la Fase 0, se creó la nueva rama de la Fase 1 para consolidar el núcleo hexagonal existente, manteniendo el mismo criterio de bajo riesgo (solo pruebas, scripts y documentación; ningún cambio en `api/logic/`, vistas, adaptadores, Dockerfiles o configuración de producción).

1. **Ampliación de pruebas de dominio (6 nuevas, de 31 a 37):** se agregaron pruebas que verifican que los 4 laboratorios generan exactamente 24 registros históricos, la estructura de las claves y del identificador de sensor específico de cada laboratorio, y el efecto de cambios repetidos de laboratorio sobre `procesar()` e histórico.
2. **Actualización del script de verificación** con referencias explícitas a la Fase 1 ("Consolidate Domain Core") y al backlog de pruebas y calidad.
3. **Actualización de comentarios en `pytest.ini` y `.coveragerc`** indicando que las estrategias de dominio alcanzaron el 100% de cobertura gracias a las nuevas pruebas.
4. **Mejora de la documentación interna** de los módulos de prueba, con una guía paso a paso sobre cómo agregar pruebas para un nuevo laboratorio en el futuro.

**Resultado:** 37 pruebas de dominio, cobertura del 100% en las 4 estrategias y en la fábrica, script y configuraciones alineados con el enfoque de la Fase 1.

**Segunda sesión de la Fase 1 (misma rama, continuación intensiva de pruebas y calidad):**

1. **Ampliación agresiva de pruebas (de 37 a 48):** nuevos casos sobre bordes de `generar_historico_simulado()` (0, 1, 5, 24, 48 horas y valores negativos o cero en todas las estrategias); casos de error y validaciones que documentan la falta actual de manejo defensivo en el núcleo (`ValueError` al cambiar a un laboratorio inválido, `TypeError` al procesar datos no numéricos en agricultura, `AttributeError` al procesar componentes inválidos en electrónica, sensibilidad a espacios en blanco en la fábrica); una prueba que cubre el camino de retorno de lista vacía cuando una estrategia no implementa el método esperado.
2. **Mejora de calidad en las pruebas existentes:** migración de pruebas a fixtures compartidas en `conftest.py`, parametrización de las pruebas de fábrica para un reporte más granular.
3. **Mejora del script de verificación:** parseo automático del número exacto de pruebas de dominio ejecutadas, mostrado tanto en la sección de pytest como en el resumen final.
4. **Documentación:** actualización de docstrings y comentarios en los módulos de prueba, `conftest.py` y el script, documentando el enfoque de caracterización utilizado.

**Resultado:** 48 pruebas de dominio, cobertura del 100% en agricultura, robótica, electrónica, telecomunicaciones, fábricas y servicios (solo queda fuera la línea abstracta de la interfaz base, inevitable sin instanciar la clase abstracta). Cero cambios en lógica de producción durante toda la sesión.

---

### 8.2 — 04 de junio de 2026: Rediseño hacia Monolito Modular por Contextos

**Contexto:** con el núcleo hexagonal ya consolidado y con 48 pruebas de caracterización protegiendo el comportamiento actual, se realizó un diagnóstico de la arquitectura para definir el rumbo estructural definitivo del backend.

**Diagnóstico:**

El proyecto mantenía dos implementaciones paralelas del mismo dominio:
- `api/logic/` (V2): `domain/{agricultura,electronica,robotica,telecom}.py` + `factories.py` + `adapters/` + `ports/` — patrón Strategy + Factory, pero con dominio y adaptadores en el mismo espacio de nombres, acoplado a Django desde el propio nombre del paquete.
- `core/` (V3): `domain/{entities,exceptions,factories,services,strategies,value_objects}/` + `ports/{repositories,services}/` + `application/{commands,queries}/` — arquitectura hexagonal más estricta, con dominio puro sin imports de Django.

`urls.py` exponía ambas versiones simultáneamente (`v2/` y `v3/`) con un mecanismo de respaldo silencioso. Esta convivencia representaba deuda técnica activa: dos fuentes de verdad para "qué es un laboratorio", con el riesgo de que una corrección se aplicara en una implementación y no en la otra.

**Decisión arquitectónica: ni hexagonal "pura" como un solo núcleo global, ni microservicios desde ya.**

- Una arquitectura hexagonal como un único núcleo de dominio gigante repite el error de mezclar bajo un mismo `domain/` conceptos que no comparten un lenguaje ubicuo coherente: "laboratorio de robótica", "modelo de IA de enfermedades de plantas", "telemetría de sensores embebidos" y "cursos" son dominios distintos que deberían evolucionar de forma independiente. Esto es el antipatrón conocido como "hexágono dios".
- Migrar a microservicios completos tampoco se justifica en esta etapa: implica un costo operativo (descubrimiento de servicios, transacciones distribuidas, observabilidad, versionado de contratos) sin un beneficio real todavía, dado el tamaño del equipo y la ausencia de necesidad de escalar cada dominio de forma independiente.
- **Solución adoptada: Monolito Modular con límites hexagonales por contexto delimitado.** Cada contexto de código (laboratorios, telemetría, IA, identidad — ver la lista definitiva reconciliada más abajo en este mismo capítulo) es un hexágono independiente —con su propio `domain/`, `ports/`, `application/` e `infrastructure/`— pero todos se despliegan en el mismo proceso Django, excepto los que ya tienen una frontera física real (como el servicio de IA, que corresponde a otro runtime y otro ciclo de vida de despliegue). "Cursos" no es un contexto propio: se absorbe dentro de Conocimiento (ver lista definitiva).
- **Justificación:** los puertos de cada contexto son exactamente el punto de corte donde se podría extraer un microservicio real el día que el volumen o el equipo lo justifiquen. Por ejemplo, cuando la ingesta de telemetría IoT crezca lo suficiente, el `SensorReadingRepositoryPort` ya existiría, y bastaría con cambiar el adaptador de Django ORM por un cliente gRPC/HTTP sin tocar el dominio. Se diseña para poder separar en microservicios en el futuro, sin hacerlo antes de que sea necesario.

**Estructura objetivo propuesta:**

```
src/backend/
├── contexts/
│   ├── labs/                          # Contexto: laboratorios (agricultura, electrónica, robótica, telecom)
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value_objects/
│   │   │   ├── strategies/            # Patrón Strategy: 1 por tipo de laboratorio
│   │   │   ├── factories/
│   │   │   └── exceptions/
│   │   ├── ports/
│   │   │   ├── repositories.py
│   │   │   └── notification_port.py
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   └── queries/
│   │   └── infrastructure/
│   │       └── persistence/django/
│   │
│   ├── telemetry/                     # Contexto: ingesta IoT (separado de labs, cambia por razones distintas)
│   │   ├── domain/
│   │   ├── ports/
│   │   ├── application/
│   │   └── infrastructure/
│   │
│   ├── ai_advisory/                   # Contexto: puente hacia el servicio de IA (FastAPI externo)
│   │   ├── domain/
│   │   ├── ports/                     # AIServicePort — adaptador real: fastapi_ai_adapter.py
│   │   └── application/
│   │
│   └── identity/                      # users/ actual, reorganizado de igual forma
│
├── interfaces/                        # Capa de entrada única, Django REST
│   └── web/api/
│       ├── labs/urls.py
│       ├── telemetry/urls.py
│       └── ai_advisory/urls.py
│
├── shared_kernel/                     # Solo lo que genuinamente comparten todos los contextos
│   └── result.py
│
└── sigct_backend/                     # settings.py, wsgi, configuración Django — sin lógica de dominio
```

Diferencia clave frente a la estructura anterior: `core/` deja de existir como una única carpeta plana; se divide en `contexts/{labs,telemetry,ai_advisory,identity}/`, cada uno con su propio hexágono completo. `api/logic/` se elimina por completo tras migrar su lógica — no se fusiona con `core/`, se retira — manteniendo ambas versiones activas solo durante la migración (máximo 1-2 sprints), con la versión V2 marcada como `@deprecated` y con fecha de remoción definida (nunca indefinida).

**Plan de migración (orden secuencial):**
1. Congelamiento de `api/logic/`: no se escribe código nuevo ahí, salvo correcciones críticas si algo se rompe en producción durante la migración.
2. Mover `core/` → `contexts/labs/` primero, por concentrar la mayor parte de la lógica real y ser el contexto más maduro.
3. Extraer `telemetry` de `labs`: `sensor_reading.py` vivía dentro del mismo `core/domain`, pero conceptualmente corresponde a ingesta, no a simulación de laboratorio.
4. Reescribir `urls.py`/`views.py`, eliminando la bandera `HEXAGONAL_V3_AVAILABLE` y el mecanismo de respaldo silencioso — con una única versión activa, ese `try/except` deja de ser necesario.
5. Migrar las pruebas (`tests/domain/test_factories.py` y `test_services.py`, con 48 pruebas y 100% de cobertura) para que apunten a `contexts.labs.domain`, sin eliminarlas.
6. Retirar `api/logic/` una vez migrado y verificado con las pruebas existentes.

**Preparación operativa de la sesión:**
- Configuración de identidad de git local al repositorio del proyecto.
- Sincronización verificada contra `origin/main` antes de iniciar cualquier cambio, para evitar conflictos de fusión.
- Registro en bitácora del inicio de esta etapa, bajo el principio de "cero daño": estado *pre-migración* (consolidación hacia Monolito Modular), objetivo de migrar de `api/logic` (V2) y `core/` (V3) hacia `contexts/` (Monolito Modular), con estrategia "puente" activa (no se elimina código hasta validar las pruebas en la nueva estructura).
- Creación de la rama de trabajo aislada `refactor/migracion-contexts` para no tocar nada directamente sobre `main`.
- Marcado con `@deprecated`: en lugar de borrar `api/logic` de inmediato, se planificó inyectar un decorador en sus clases principales, de modo que cualquier uso residual del código antiguo genere una advertencia clara en consola o en los logs.
- Registro puntual: creación de `src/backend/utils/deprecation.py` para instrumentar el código heredado. Estado: operativo.

**Cierre conceptual de la sesión:** esta refactorización no se plantea como un ejercicio académico aislado, sino como la materialización práctica de los principios de separación de responsabilidades y Diseño Dirigido por el Dominio (DDD) en un entorno real. La meta no es solo que el sistema funcione, sino que el código resulte mantenible, auditable y escalable, transformando el proyecto SIGC&T Rural de un monolito frágil a un sistema modular capaz de evolucionar junto con las necesidades del sector rural colombiano.

---

### 8.3 — 04 de julio de 2026: Estabilización e Integración con Infraestructura Real

**Estado:** integración con infraestructura real verificada.

**1. Diagnóstico y corrección de rumbo:**

Durante las iteraciones previas se presentaron fallos recurrentes (`OperationalError`, `ModuleNotFoundError`) debido a una desconexión entre la configuración de las pruebas y el estado real de la infraestructura en el entorno local (Windows/Mingw64).

- **Error de concepción identificado:** se intentó desacoplar la prueba de integración forzando el uso de SQLite en memoria. Esto constituyó un error de arquitectura, ya que el componente en cuestión (`DjangoRepository`) es un adaptador de infraestructura cuya responsabilidad explícita es comunicarse con el motor de persistencia real (PostgreSQL). Forzar un mock en este punto anulaba la validez de la prueba de integración.
- **Corrección aplicada:** se confirmó que la infraestructura de contenedores (`sigctiarural_postgres_db`, puerto 5544) estaba operativa. La solución consistió en configurar correctamente las variables de entorno de la sesión de ejecución (`DB_NAME`, `DB_USER`, etc.) para que el ORM de Django pudiera establecer la conexión con el contenedor.

**2. Ejecución y resultados de la prueba:**

Tras corregir la ruta de ejecución y las variables de entorno, se validó la integridad de la capa de persistencia:

- Entorno: Python 3.14.3, Django 4.2.30 (versión presente en el entorno global en ese momento), pytest 9.0.3.
- Comando: `python -m pytest tests/test_persistence_infra.py -W always`.
- Resultado: 2 pruebas aprobadas en 0.88 s.
- Conclusión: los adaptadores de persistencia quedaron correctamente conectados a la base de datos real.

**3. Vulnerabilidad identificada: regresión de dependencias**

Se identificó un riesgo relevante de "contaminación cruzada" en el entorno de desarrollo. Al instalar `requirements.txt` de forma global, el intérprete de Python del sistema sufrió una regresión de Django 6.0.3 a Django 4.2.30. Esto podía afectar a otros proyectos presentes en la misma máquina que dependieran de versiones más recientes de Django.

**Acción correctiva:** se determinó que el aislamiento del proyecto mediante un entorno virtual (`venv`) era obligatorio, tanto para proteger la estabilidad de sigcTiArural como la de otros proyectos en el mismo equipo.

**4. Hoja de ruta de resiliencia aplicada:**

- **Fase A — Aislamiento del entorno:**
  ```bash
  # 1. Dentro de src/backend, crear el entorno virtual
  python -m venv .venv

  # 2. Activar el venv (Git Bash)
  source .venv/Scripts/activate

  # 3. Reinstalar dependencias limpias solo en este venv
  pip install --upgrade pip
  pip install -r requirements.txt
  ```

- **Fase B — Validación del mecanismo de depreciación (código heredado):** una vez ejecutadas las pruebas en un entorno controlado, se validó que el decorador `@deprecated` funcionara correctamente, confirmando que al ejecutar `pytest -W always` se mostrara el resumen de advertencias esperado. En caso contrario, se revisaría el import del decorador en `persistence.py` y que el método decorado fuera efectivamente el invocado por la prueba.

- **Fase C — Consolidación de la arquitectura:** una vez validado el mecanismo de depreciación, se procedió con la inyección de dependencias para el código nuevo, manteniendo el Monolito Modular con límites hexagonales:
  - Capa de dominio: sin dependencias externas (Python puro).
  - Capa de adaptadores: donde residen los `DjangoRepository`, que se comunican con el exterior mediante las interfaces definidas en la capa de puertos.
  - Capa de infraestructura: gestión de configuraciones, Docker y despliegue.

**Estado al cierre de esta sesión:** la infraestructura responde correctamente, las pruebas de integración son satisfactorias y el camino hacia la refactorización modular está despejado. La prioridad inmediata siguiente fue el aislamiento mediante `venv` para proteger la estabilidad del entorno de desarrollo.

---

### 8.4 — 04 de julio de 2026: Informe de Hallazgos y Plan de Acción

**Hallazgos principales:**
- Estado de los servicios (Docker): backend expuesto en `localhost:8010`, servicio de IA en `8081`, frontend en `5173`, Postgres en `5544`. Se detectaron además otros contenedores presentes en la misma máquina, ajenos a este proyecto (por ejemplo, un servicio en el puerto 8000).
- Pruebas de backend: 58 aprobadas, 3 advertencias (relacionadas con la depreciación de adaptadores heredados).
- Servicio de IA: responde correctamente en `/health`.
- Backend: una verificación sobre `localhost:8000` devolvió "Not Found", porque el backend del proyecto realmente corre en el puerto 8010; existe un conflicto de puertos entre distintos proyectos en la misma máquina.
- Los scripts de verificación (`continuity_check.ps1` y `verify_refactor.ps1`) asumían el puerto 8000 de forma fija, generando falsos negativos en entornos donde los puertos se reasignan dinámicamente.
- El archivo `.env` contenía credenciales en texto plano, lo cual debe evitarse al hacer commit.
- La documentación y los planes (README, documento maestro, RUNBOOK, plan maestro, plan de refactorización hexagonal, pipeline de IA) se encontraban completos y coherentes entre sí, aunque con algunas referencias inconsistentes a la ruta del servicio de IA en distintos documentos (pendientes de unificar).

**Riesgos identificados:**
- La automatización que asume puertos fijos provoca falsos fallos o alertas.
- Exposición de credenciales si el archivo `.env` llega a incluirse en un commit.
- Las referencias inconsistentes a rutas del servicio de IA pueden confundir a nuevos colaboradores.

**Plan de acción (priorizado, mínimo y seguro):**
1. Corregir los scripts de verificación para detectar puertos de forma dinámica (variable de entorno → docker compose → valor por defecto), aplicando primero en `continuity_check.ps1` y luego en `verify_refactor.ps1`.
2. Añadir `.env.example` y agregar `.env` a `.gitignore`; rotar credenciales si ya fueron expuestas públicamente.
3. Unificar en la documentación las referencias de ruta del servicio de IA (eligiendo una sola: `src/backend/ai_service` o `src/ai_models`).
4. Ejecutar verificaciones de salud locales y registrar evidencia: `docker compose ps`, `curl` al backend real (puerto detectado) y al servicio de IA, y ejecución de pytest en `src/backend`.
5. Confirmar los cambios de scripts y ejemplos, manteniendo la bitácora del proyecto actualizada.

**Cambio concreto aplicado — autodetección de puertos en `continuity_check.ps1`:**

```powershell
# --- Autodetección de puertos (entorno -> docker compose -> valor por defecto) ---
function Get-PortForService {
    param($envName, $composeService, $containerPort, $defaultPort)

    if ($env:$envName) { return $env:$envName }

    try {
        $out = docker compose port $composeService $containerPort 2>$null
        if ($out -and $out -match ":(\d+)$") { return $matches[1] }
    } catch { }

    return $defaultPort
}

$backendPort = Get-PortForService -envName "BACKEND_PORT" -composeService "backend" -containerPort 8000 -defaultPort 8000
$aiPort      = Get-PortForService -envName "AI_PORT" -composeService "ai_service" -containerPort 8081 -defaultPort 8081

Write-Host "Detected ports -> backend:$backendPort ai:$aiPort" -ForegroundColor Gray

# Reemplazo de las comprobaciones de endpoints por:
$backendResp = curl.exe -s --max-time 5 "http://localhost:$backendPort/api/telemetry/history/" 2>$null
$aiResp      = curl.exe -s --max-time 5 "http://localhost:$aiPort/health" 2>$null
```

---

### 8.5 — 06 de julio de 2026: Estado Verificado Más Reciente

**Proyecto:** SIGC&T Rural (sigcTiArural).
**Rama activa:** `feature/refactor-modular-contexts`.
**Último commit validado:** `faf32ef`.

**Estado de sincronización:**
- Documentación sincronizada entre GitHub y los distintos entornos de desarrollo utilizados.
- Documento maestro actualizado.
- Plan maestro actualizado.
- `INDICE_PROYECTO.md` disponible.
- `continuity_check.ps1` disponible.

**Próximas validaciones técnicas pendientes:**
- `docker-compose.yml`
- `persistence.py`
- `settings.py`
- `pytest.ini`
- `conftest.py`

**Notas:** la documentación se encuentra sincronizada entre los entornos de desarrollo utilizados. Aún no se han incorporado a la rama los cambios técnicos pendientes de validación descritos arriba.

---

## 9. GUÍA PARA RETOMAR EL PROYECTO

1. **Verificación y preparación inicial:**
   ```powershell
   git checkout feature/refactor-modular-contexts
   cd src\backend
   python -m pip install -r requirements.txt
   # Se recomienda usar un entorno virtual (venv) para aislar dependencias
   ```

2. **Verificar el estado actual (obligatorio siempre):**
   ```powershell
   # Desde la raíz del proyecto
   .\scripts\verify_refactor.ps1
   # O levantando servicios:
   .\scripts\verify_refactor.ps1 -StartServices
   ```
   - Esperar el mensaje "Uvicorn running" en los logs del servicio de IA.
   - El script debe mostrar los conteos y el resumen de la verificación en verde si todo está correcto.

3. **Ejecutar las pruebas de dominio:**
   ```powershell
   cd src\backend
   python -m pytest tests/domain/ -q --tb=short
   ```

4. **Próximo paso recomendado:**
   - Revisar este documento completo.
   - Leer `docs/HEXAGONAL_REFACTOR_PLAN.md`, en particular la fase en curso.
   - Continuar la migración hacia la estructura `contexts/` descrita en la Sección 8.2.
   - Completar las validaciones técnicas pendientes listadas en la Sección 8.5.
   - Actualizar la bitácora del proyecto con el inicio de la siguiente etapa.
   - Usar siempre `git add -p` y verificar con el script correspondiente.

5. **Convenciones de trabajo:**
   - Nunca romper el código heredado hasta que el slice correspondiente esté migrado y verificado.
   - En cada fase: actualizar este documento, el plan y la bitácora.
   - Verificación mínima por cambio: pytest + script de verificación + pruebas manuales de endpoints + revisión de UI si aplica.
   - Convención de mensajes de commit: `chore(hex): ...`, `feat(hex): ...`, `fix(hex): ...`.
   - Ante dudas técnicas: consultar los diagramas y el documento maestro.

6. **Señales de que el trabajo va por buen camino:**
   - Las pruebas de dominio siguen creciendo.
   - El script de verificación muestra más resultados correctos y menos advertencias.
   - Las vistas heredadas comienzan a delegar en la capa de aplicación (dejan de contener lógica propia).
   - No existe ningún `import django` dentro de `domain/`.

---

## 10. GLOSARIO TÉCNICO

- **Bounded Context (Contexto Delimitado):** frontera lógica dentro de la cual un modelo de dominio es válido y coherente.
- **Strangler Fig Pattern:** estrategia de migración que consiste en rodear el sistema heredado con nuevas funcionalidades hasta que el sistema antiguo pueda ser retirado por completo.
- **Composition Root:** punto único de la aplicación donde se inyectan las dependencias (equivalente al "cerebro" del hexágono).
- **Hexagon/Core (Núcleo Hexagonal):** el núcleo de la aplicación, agnóstico respecto a cualquier framework, base de datos o interfaz externa.
- **Characterization Tests (Pruebas de Caracterización):** pruebas que documentan el comportamiento actual del código heredado, aunque no sea el ideal, con el fin de garantizar que no se introduzcan regresiones durante la refactorización.

---

## 11. REFERENCIAS Y ANEXOS

- Plan principal: `docs/HEXAGONAL_REFACTOR_PLAN.md`.
- Bitácora histórica (secundaria a `docs/MASTERDOC.md` §5 — ver regla de precedencia en `SIGCT_RURAL_SYSTEM_BOOT.md` §18.9): `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md`.
- Arquitectura visual: `docs/diagrams/`, `docs/uml/`, `docs/architecture/`.
- Documento maestro y plan maestro (visión general y hoja de ruta).
- Código clave:
  - Dominio: `src/backend/api/logic/domain/` (en migración hacia `contexts/labs/domain/`).
  - Pruebas: `src/backend/tests/domain/`.
  - Script de verificación: `scripts/verify_refactor.ps1`.
  - Servicio de IA corregido: `src/ai_models/fastapi_app.py`.
- Los diagramas C4 existentes muestran la visión "ideal" frente al estado actual del proyecto.

**Notas finales para ADSO:**

Este proyecto constituye un caso de estudio real de:
- Deuda técnica frente a refactorización incremental.
- Aplicación de patrones de arquitectura en un stack mixto (Django + React + microservicio de IA).
- Importancia de las pruebas de caracterización antes de emprender una refactorización de gran escala.
- El patrón Strangler Fig llevado a la práctica.
- La diferencia entre un sistema que "funciona para una demostración" y uno "listo para producción".

Se recomienda mantener este documento vivo: al retomar el proyecto, actualizar la Sección 8 con la fecha y el resumen del progreso correspondiente.

---

## 12. DECLARACIÓN DE CIERRE — FASE 0

El proyecto ha sido instrumentado. La línea base es segura, las pruebas están configuradas y el plan de migración se encuentra documentado. El sistema cuenta con seguimiento técnico continuo mediante pruebas de caracterización y scripts de verificación.

**Fin del documento técnico.**
**Generado bajo los estándares ADSO-SENA 2026.**

**Bernardo Adolfo Gómez Montoya**

---