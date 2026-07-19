# TRAE Independent Repository Audit

## Alcance y metodología

- [VERIFICADO] Esta auditoría se realizó en modo estático: no se ejecutaron contenedores, no se levantaron servicios, no se ejecutaron scripts `.ps1` o `.sh`, no se hicieron migraciones, no se modificó código existente y no se ejecutaron comandos destructivos.
- [VERIFICADO] Se analizaron `README.md`, `docs/` (sin leer `docs/architect_master/`), `src/`, `docker-compose.yml`, `schema_postgresql.sql`, `package.json`, `package-lock.json`, `config/` y `scripts/`.
- [VERIFICADO] No se leyó `HANDOFF_TRAE_sigcTiArual.md` ni el handoff abierto en el IDE, por restricción explícita.
- [VERIFICADO] El código tuvo prioridad sobre la documentación para reconstruir el estado real.
- [NO VERIFICABLE] Cualquier afirmación que dependa de ejecución real, conectividad externa, arranque de servicios, estado de despliegue o validez de datos en tiempo real se clasifica como `NO VERIFICABLE`.

## 1. Estado general del proyecto

- [VERIFICADO] El repositorio es un monorepo híbrido con al menos cuatro áreas principales implementadas en árbol: `src/backend` (Django/DRF), `src/frontend` (React/Vite), `src/ai_models` (FastAPI/TensorFlow) y `src/embedded` (edge).
- [VERIFICADO] El estado real del sistema es el de un proyecto educativo/demo técnicamente ambicioso pero incompleto, con mezcla de componentes productivos, prototipos, mocks y documentación extensa.
- [VERIFICADO] Existe un intento real de refactorización hacia arquitectura hexagonal/modular en backend, pero convive con una capa legacy todavía activa.
- [VERIFICADO] La carpeta `src/embedded` existe, pero sus tres scripts principales están vacíos: `mqtt_broker.py`, `tflite_api.py` y `sensor_reader.py` tienen 0 bytes.
- [VERIFICADO] El directorio `config/` existe, pero `config/settings.ini` está vacío y no actúa como fuente efectiva de configuración.
- [VERIFICADO] El repositorio contiene herramientas de documentación y reporte en Node.js en raíz; el `package.json` principal no representa la aplicación de negocio, sino tooling documental.
- [DESACTUALIZADO] La documentación principal presenta el sistema como una plataforma madura con varias capacidades operativas ya disponibles; el código muestra una implementación parcial con múltiples fronteras aún no cerradas.

## 2. Arquitectura detectada

- [VERIFICADO] La arquitectura detectada es un monolito Django con dos capas coexistentes: una legacy directamente acoplada al ORM (`src/backend/api`) y una capa parcial de puertos/adaptadores (`src/backend/core`, `src/backend/infrastructure` y `src/backend/api/logic`).
- [VERIFICADO] Existen dos líneas hexagonales simultáneas: la legacy parcial en `src/backend/api/logic/*` y una reorganización más nueva en `src/backend/core/*` + `src/backend/infrastructure/*`.
- [VERIFICADO] Las rutas activas del backend siguen entrando por controladores en `src/backend/api/views.py`; la capa `interfaces/web/api` existe como esqueleto, pero no es la entrada principal en uso.
- [VERIFICADO] Los endpoints legacy y refactorizados conviven en paralelo: `/api/telemetry/history/`, `/api/v2/...` y `/api/v3/...`.
- [VERIFICADO] La refactorización no está cerrada: los ViewSets principales de robots siguen usando `ModelViewSet` sobre modelos Django con `AllowAny`.
- [VERIFICADO] La composición real se aproxima más a un "modular monolith en transición" que a una arquitectura hexagonal completa.
- [PLANIFICADO] La documentación de refactorización define como objetivo un monolito modular con bounded contexts y puertos claros, pero ese estado objetivo no está completado.
- [DESACTUALIZADO] README y varias piezas documentales afirman arquitectura hexagonal como estado presente; el código solo la implementa de forma parcial y desigual.

## 3. Backend

- [VERIFICADO] El backend usa Django + DRF con configuración en `src/backend/sigct_backend/settings.py`.
- [VERIFICADO] `DEBUG=True`, `ALLOWED_HOSTS=['*']` y `CORS_ALLOW_ALL_ORIGINS=True` están activos en configuración.
- [VERIFICADO] El backend usa PostgreSQL como base principal en settings; no hay configuración activa de SQLite en el código observado.
- [VERIFICADO] La app `users` está declarada en `INSTALLED_APPS`, pero en el repositorio solo contiene `__init__.py`; no hay implementación real de autenticación propia.
- [VERIFICADO] Los endpoints efectivos observables en código son:
  - `/api/robots/`
  - `/api/robot-telemetry/`
  - `/api/robot-commands/`
  - `/api/telemetry/history/`
  - `/api/v2/telemetry/history/`
  - `/api/v2/ai/crop-advice/`
  - `/api/v3/telemetry/history/`
  - `/api/v3/ai/crop-advice/`
- [VERIFICADO] No existen en `urls.py` endpoints reales de auth (`/api/auth/login/`, `/api/auth/register/`, `/api/auth/refresh/`, `/api/auth/me/`).
- [VERIFICADO] No se observan dependencias ni configuración de JWT real (`djangorestframework-simplejwt`) en `src/backend/requirements.txt`.
- [VERIFICADO] Tampoco se observan `channels`, `daphne` ni WebSockets Django reales en dependencias o settings.
- [VERIFICADO] Los modelos de negocio reales existentes en ORM son `SensorReading`, `Robot`, `RobotTelemetry` y `RobotCommand`.
- [VERIFICADO] La capa V3 ya usa entidades y value objects (`SensorReading`, `Temperature`, `Humidity`, `SensorId`) y un repositorio/mapeador concreto.
- [VERIFICADO] La capa V2 legacy sigue usando `apps.get_model` con strings tipo `'api.SensorReading'`, lo que mantiene acoplamiento a Django.
- [VERIFICADO] La seguridad HTTP de los ViewSets es mínima: los recursos de robots y telemetría usan `AllowAny`.
- [VERIFICADO] El repositorio contiene pruebas en `src/backend/tests/` para dominio, adaptadores e infraestructura.
- [NO VERIFICABLE] No se puede confirmar en esta auditoría estática que las pruebas pasen, que la capa V3 importe correctamente en runtime o que las consultas ORM funcionen con datos reales.
- [DESACTUALIZADO] La documentación de API y README anuncian autenticación JWT operativa; el backend real no la implementa.

## 4. Frontend

- [VERIFICADO] El frontend es React 18 + Vite 5, con Tailwind, Three.js, Zustand, React Router, React Flow, Recharts, Framer Motion y Lucide.
- [VERIFICADO] La aplicación contiene páginas principales para dashboard, catálogo de laboratorios, IA predictiva, laboratorio de ciencia de datos y páginas de documentación embebida.
- [VERIFICADO] El dashboard mezcla datos reales externos y datos simulados:
  - salud de backend desde URLs cloud hardcodeadas en `src/frontend/src/services/cloud.js`
  - clima desde Open-Meteo
  - telemetría del panel central completamente simulada en `src/frontend/src/components/TelemetryPanel.jsx`
- [VERIFICADO] `AuthContext.jsx` intenta consumir `/api/auth/login/`, pero si falla entra en modo demo y persiste `demo-token` en `localStorage`.
- [VERIFICADO] La autenticación del frontend es principalmente simulada; el token demo se acepta aunque el backend no tenga auth real.
- [VERIFICADO] `useRoboticsApi.js` asume una respuesta paginada con `data.results`, pero el backend observado no configura paginación DRF; un `ModelViewSet` estándar devolvería una lista simple salvo configuración adicional no encontrada.
- [VERIFICADO] `AIPredictiva.jsx` envía archivos a `http://localhost:8000/infer`, pero el endpoint `/infer` vive en el microservicio FastAPI en el puerto 8081, no en Django.
- [VERIFICADO] `DataScienceLab.jsx` espera `EventSource` en `/events` y enlace a `/metrics`, usando por defecto una URL que apunta al backend cloud, no al servicio de IA.
- [VERIFICADO] El microservicio FastAPI expone `/events`, pero no expone `/metrics`.
- [VERIFICADO] Existen varias páginas de documentación que cargan archivos Markdown locales desde `docs/`, lo cual convierte al frontend también en un visor interno de documentación.
- [VERIFICADO] Hay una presencia amplia de placeholders e integraciones futuras en el dashboard y catálogo.
- [NO VERIFICABLE] No se puede confirmar en análisis estático que todas las rutas de React rendericen correctamente o que el build final no falle.
- [DESACTUALIZADO] La narrativa de “telemetría en tiempo real” y “auth integrada” está por delante de la implementación real del frontend-backend.

## 5. Inteligencia Artificial

- [VERIFICADO] Existe un microservicio FastAPI en `src/ai_models/fastapi_app.py`.
- [VERIFICADO] El servicio expone al menos estos endpoints reales:
  - `GET /health`
  - `POST /infer`
  - `POST /assist`
  - `GET /events`
  - `POST /analyze-circuit`
- [VERIFICADO] No existe un endpoint `/suggest`, aunque los adaptadores del backend V2/V3 lo consumen y las pruebas lo asumen.
- [VERIFICADO] En ausencia de `/suggest`, la lógica del backend cae a fallback local para sugerencias de productividad.
- [VERIFICADO] La inferencia de imágenes carga el modelo más reciente `.h5`/`.keras` desde `src/ai_models/production_models`.
- [VERIFICADO] El repositorio contiene un modelo entrenado `plant_disease_mbv2.h5` y un `model_metadata.json`.
- [VERIFICADO] `model_metadata.json` define clases semánticas (`"enferma"`, `"sana"`), pero `/infer` devuelve `diagnosis = "class_{idx}"` cuando el modelo corre realmente.
- [VERIFICADO] Esa salida genérica no coincide con el mapeo semántico esperado por `AIPredictiva.jsx`, que trabaja con clases tipo `Tomato_Early_blight` o `Tomato_Healthy`.
- [VERIFICADO] El servicio de voz usa `speech_recognition`, `gTTS`, `pydub` y acceso directo a PostgreSQL con `psycopg2`.
- [VERIFICADO] El microservicio de IA consulta la tabla `api_sensorreading` directamente por SQL, saltándose al backend Django y al dominio hexagonal.
- [VERIFICADO] El servicio publica eventos SSE leyendo el log `data/logs/infer_log.jsonl`.
- [VERIFICADO] El servicio crea directorios de modelos y logs en runtime si no existen.
- [VERIFICADO] La dependencia `mysql-connector-python` está en `src/ai_models/requirements.txt`, pero el código observado de IA se conecta a PostgreSQL, no a MySQL.
- [PLANIFICADO] La documentación de IA menciona `/models`, `image_url`, `metrics` y una canalización más completa; eso no está plenamente implementado en el servicio real observado.
- [NO VERIFICABLE] No se puede validar aquí la calidad real del modelo, precisión, latencia, exactitud de inferencia o disponibilidad de librerías de voz/TensorFlow en despliegue.
- [DESACTUALIZADO] La documentación de pipeline y algunos reportes describen una API de IA distinta a la que realmente expone `fastapi_app.py`.

## 6. IoT y Edge

- [VERIFICADO] La capa edge está documentada ampliamente en `docs/EDGE_SETUP.md` y diagramas relacionados.
- [VERIFICADO] El código real de edge en `src/embedded` no está implementado: los tres archivos principales están vacíos.
- [VERIFICADO] El frontend representa nodos BBB y cluster edge, pero gran parte del comportamiento es visual, simulado o derivado de servicios cloud externos.
- [VERIFICADO] Existen contratos y documentación de robótica en `docs/architecture/robotics_contracts.md`, pero el backend no implementa exactamente esos endpoints contractuales.
- [VERIFICADO] El repositorio incluye archivos conceptuales adicionales, como `scripts/newton_bridge.py`, que actúan como puente/mock de simulación, no como integración operativa demostrada.
- [PLANIFICADO] Gateway MQTT, inferencia TFLite en BBB y captura real de sensores aparecen como plan o guía operativa, no como implementación verificable en código.
- [NO VERIFICABLE] No se puede verificar existencia física del cluster BBB, sensores, ROS2, Omniverse ni operación edge real.
- [DESACTUALIZADO] La documentación edge describe una pila funcional que el código del repositorio no respalda actualmente.

## 7. Docker e infraestructura

- [VERIFICADO] `docker-compose.yml` existe y define cinco servicios: `db`, `db-mysql`, `backend`, `ai_service` y `frontend`.
- [VERIFICADO] PostgreSQL 15 es la base principal de compose.
- [VERIFICADO] MySQL 8 sigue definido como servicio legacy residual.
- [VERIFICADO] El backend depende de `db`; el AI service también depende de `db`; el frontend depende de `backend`.
- [VERIFICADO] El Dockerfile del backend arranca con `python manage.py runserver 0.0.0.0:8000`, es decir, modo desarrollo.
- [VERIFICADO] El Dockerfile del frontend hace build de Vite y sirve con Nginx, incluyendo fallback SPA a `index.html`.
- [VERIFICADO] El Dockerfile del servicio de IA arranca con Uvicorn.
- [VERIFICADO] El servicio de IA crea `/app/production_models` y `/app/data/logs`, pero el código Python resuelve modelos/logs respecto a la raíz del repo; la coherencia exacta de rutas en contenedor depende del layout final.
- [VERIFICADO] Los scripts de continuidad y verificación (`continuity_check.ps1`, `verify_refactor.sh`) están orientados a arrancar o validar servicios, por lo que son tooling operativo, no parte del runtime de negocio.
- [PLANIFICADO] Producción endurecida con gunicorn/daphne, métricas, CI/CD y despliegue cloud consistente aparece en documentación, pero no se observa implementada en este repo.
- [NO VERIFICABLE] No se puede confirmar que `docker-compose.yml` arranque correctamente sin ejecutar contenedores.
- [DESACTUALIZADO] `docs/DEPLOYMENT.md` afirma que el repo no incluye `docker-compose.yml`; esa afirmación ya no es cierta.

## 8. Base de datos

- [VERIFICADO] El código backend está orientado a PostgreSQL, y `schema_postgresql.sql` es un dump PostgreSQL real.
- [VERIFICADO] `schema_postgresql.sql` contiene `api_sensorreading` y tablas auth/admin de Django.
- [VERIFICADO] `schema_postgresql.sql` no contiene tablas `api_robot`, `api_robottelemetry` ni `api_robotcommand`.
- [VERIFICADO] En cambio, `src/backend/api/models.py` y la migración `0002_robot_robotcommand_robottelemetry.py` sí definen esos modelos/tablas.
- [VERIFICADO] Esto indica desalineación entre el esquema SQL versionado y el estado actual del ORM/migraciones.
- [VERIFICADO] La migración `0001_initial.py` fue generada por Django 6.0 según su encabezado, mientras que `requirements.txt` fija Django `<5.0` y `0002` fue generada por Django 5.2.10.
- [VERIFICADO] Ese drift de versiones de generador sugiere inconsistencias de entorno entre momentos de desarrollo.
- [VERIFICADO] Settings usa `DATABASE_URL` si existe; en caso contrario arma conexión PostgreSQL manual por variables de entorno.
- [VERIFICADO] Hay hallazgo de seguridad/configuración: existen valores por defecto inseguros embebidos para `SECRET_KEY` y contraseña de base de datos en settings y microservicio de IA. No se muestran aquí por completo.
- [NO VERIFICABLE] No se puede validar el contenido real de una base en ejecución, ni si el dump corresponde al entorno actualmente desplegado.
- [DESACTUALIZADO] La documentación que menciona SQLite como opción por defecto no coincide con el código backend observado.

## 9. Estado de la documentación

- [VERIFICADO] La documentación del repositorio es abundante, estructurada y cubre arquitectura, despliegue, API, IA, edge, continuidad, UML/C4 y planes de refactorización.
- [VERIFICADO] La documentación más confiable respecto al estado real es la que reconoce explícitamente la transición parcial y las deudas, en especial:
  - `docs/HEXAGONAL_REFACTOR_PLAN.md`
  - `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`
- [VERIFICADO] Existen múltiples piezas documentales que son más aspiracionales que descriptivas del estado actual.
- [VERIFICADO] `docs/API_REFERENCE.md` documenta auth JWT, recursos `/api/v1/*` y endpoints que no existen en `api/urls.py`.
- [VERIFICADO] `docs/AI_PIPELINE.md` apunta a rutas que no existen (`src/backend/ai_service/fastapi_app.py`) y a endpoints no implementados (`GET /models`).
- [VERIFICADO] `docs/DEPLOYMENT.md` contradice el estado actual del repo en al menos dos puntos: dice que no hay `docker-compose.yml` y sugiere SQLite por defecto.
- [VERIFICADO] `docs/EDGE_SETUP.md` describe instalación y operación de BBB/MQTT/TFLite, pero el código edge correspondiente no está implementado.
- [VERIFICADO] `docs/reports/continuity_status.md` registra una verificación end-to-end histórica, pero en esta auditoría solo puede tomarse como evidencia documental, no como hecho actual comprobado.
- [PLANIFICADO] El corpus documental de arquitectura objetivo y continuidad parece pensado para guiar fases futuras de consolidación.
- [NO VERIFICABLE] No puede confirmarse aquí que los runbooks sigan siendo ejecutables o que sus resultados históricos reflejen el estado presente.
- [DESACTUALIZADO] Una porción significativa de README, API docs, deployment docs y reportes HTML está desfasada respecto a la implementación actual.

## 10. Riesgos principales

- [VERIFICADO] Riesgo alto de desalineación contrato frontend-backend:
  - auth simulado en frontend sin endpoints reales en backend
  - hook de robótica esperando paginación no evidenciada
  - `AIPredictiva` apuntando al puerto equivocado por defecto
  - `DataScienceLab` esperando `/metrics` inexistente
- [VERIFICADO] Riesgo alto de seguridad por defaults inseguros, `DEBUG=True`, CORS abierto, hosts abiertos y recursos expuestos con `AllowAny`.
- [VERIFICADO] Riesgo alto de divergencia documental: varias decisiones operativas o de arquitectura podrían tomarse sobre documentos que ya no reflejan el código.
- [VERIFICADO] Riesgo medio-alto de deuda de integración por coexistencia de dos líneas hexagonales parciales (`api/logic` y `core/infrastructure`).
- [VERIFICADO] Riesgo medio-alto de integridad de datos por drift entre `schema_postgresql.sql`, modelos y migraciones.
- [VERIFICADO] Riesgo alto de que las sugerencias IA en backend sean siempre fallback local, porque `/suggest` no existe.
- [VERIFICADO] Riesgo alto de que la capa edge sea percibida como implementada cuando en realidad solo existe como documentación.
- [NO VERIFICABLE] No se puede medir aquí el riesgo operativo real de despliegue, consumo de recursos, latencia ni fallos en producción.

## 11. Deuda técnica identificada

- [VERIFICADO] Duplicación de arquitectura backend durante la transición (`api/logic` vs `core/infrastructure`).
- [VERIFICADO] Persistencia legacy acoplada mediante `apps.get_model` y nombres string.
- [VERIFICADO] Seguridad de desarrollo expuesta en configuración.
- [VERIFICADO] Contratos HTTP rotos o incompletos entre módulos del mismo monorepo.
- [VERIFICADO] Documentación desactualizada en varias capas críticas.
- [VERIFICADO] Servicio de IA acoplado directamente a PostgreSQL en vez de pasar por puertos del backend.
- [VERIFICADO] Componentes edge vacíos pese a existir como área formal del repositorio.
- [VERIFICADO] `config/settings.ini` vacío y dispersión de configuración entre Docker, env vars y código hardcodeado.
- [VERIFICADO] Drift de versiones de Django entre encabezados de migraciones y dependencias fijadas.
- [VERIFICADO] Dependencias probablemente residuales o no justificadas por código actual, como MySQL en compose/IA.
- [NO VERIFICABLE] No se puede cuantificar cobertura real, fallos de lint, fallos de build ni deuda de performance sin ejecución.

## 12. Componentes verificados

- [VERIFICADO] Backend Django/DRF con modelos `SensorReading`, `Robot`, `RobotTelemetry`, `RobotCommand`.
- [VERIFICADO] API legacy y rutas v2/v3 coexistentes.
- [VERIFICADO] Núcleo hexagonal parcial con entidades, value objects, puertos, mappers y repositorio Django en la línea `core/infrastructure`.
- [VERIFICADO] Suite de pruebas backend presente en árbol.
- [VERIFICADO] Frontend React/Vite con dashboard, laboratorios, páginas de docs, IA predictiva y laboratorio de ciencia de datos.
- [VERIFICADO] Microservicio FastAPI con `/health`, `/infer`, `/assist`, `/events` y `/analyze-circuit`.
- [VERIFICADO] Modelo IA `.h5` y metadatos asociados presentes en repositorio.
- [VERIFICADO] Docker Compose y tres Dockerfiles principales presentes.
- [VERIFICADO] Dump PostgreSQL presente en `schema_postgresql.sql`.
- [VERIFICADO] Tooling documental/reporting en Node.js presente en raíz y scripts.
- [VERIFICADO] Carpeta `config/` presente, aunque con contenido operativo insuficiente.

## 13. Componentes planificados

- [PLANIFICADO] Autenticación real con JWT y endpoints `/api/auth/*`.
- [PLANIFICADO] Consolidación completa de arquitectura hexagonal/modular.
- [PLANIFICADO] Reemplazo del backend Docker en modo dev por servidor de producción.
- [PLANIFICADO] Métricas, hardening, observabilidad y CI/CD.
- [PLANIFICADO] Endpoint `/suggest` y mejora del cableado IA-backend.
- [PLANIFICADO] Edge operativo con MQTT, TFLite y sensores reales en BBB.
- [PLANIFICADO] Métricas SSE/analytics más completas para el laboratorio de ciencia de datos.
- [PLANIFICADO] Eliminación futura de MySQL legacy cuando deje de ser necesario.
- [PLANIFICADO] Modularización profunda del frontend y extracción de lógica de laboratorios grandes.

## 14. Componentes no verificables

- [NO VERIFICABLE] Que los contenedores arranquen correctamente.
- [NO VERIFICABLE] Que el frontend compile y renderice sin errores.
- [NO VERIFICABLE] Que las pruebas realmente pasen hoy.
- [NO VERIFICABLE] Que el modelo IA produzca diagnósticos correctos.
- [NO VERIFICABLE] Que existan despliegues cloud activos y alineados con el repo.
- [NO VERIFICABLE] Que el cluster BBB físico exista, esté operativo o use este código exacto.
- [NO VERIFICABLE] Que los runbooks y reportes de continuidad sigan reflejando el estado actual del sistema.

## Conclusión ejecutiva

- [VERIFICADO] El estado real del repositorio es el de una plataforma educativa y experimental en transición, con backend funcional parcial, frontend rico pero mixto entre demo y consumo real, microservicio de IA operativo a nivel de código, capa edge no implementada y documentación extensa pero parcialmente desactualizada.
- [VERIFICADO] La afirmación más precisa sobre la arquitectura actual es: **monolito Django con refactorización hexagonal parcial + frontend React con fuerte componente demo/simulación + microservicio FastAPI de IA + edge documentado pero no implementado**.
- [VERIFICADO] Los componentes más adelantados en implementación son backend, frontend e IA cloud.
- [VERIFICADO] Los componentes más atrasados o no implementados son auth real, edge físico/código, endurecimiento de infraestructura y alineación documental.
