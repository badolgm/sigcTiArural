# README Reality Check

## Metodología

- Comparación estática entre `README.md` y el código real del repositorio.
- Se clasificó cada afirmación como:
  - `VERIFICADA`
  - `PARCIAL`
  - `PLANIFICADA`
  - `DESACTUALIZADA`
- La evidencia prioriza código, dependencias, rutas, Dockerfiles y esquema SQL.

## Resumen ejecutivo

- El `README.md` describe correctamente el stack base del proyecto, pero sobredimensiona el nivel real de madurez del sistema.
- Lo más desalineado está en: autenticación JWT, WebSockets/Channels, Edge operativo con BeagleBone/TFLite, modelo de datos documentado, endpoints de instalación/verificación y algunos componentes del laboratorio de ciencia de datos.
- La imagen más fiel del repositorio hoy es: **backend Django/DRF con refactor hexagonal parcial, frontend React/Vite rico en demos, microservicio FastAPI de IA operativo y capa Edge documentada pero no implementada**.

## Afirmaciones contrastadas

| # | Afirmación del README | Ubicación README | Clasificación | Evidencia |
|---|---|---|---|---|
| 1 | El proyecto usa `Python 3.10+`, `Django 4.2+`, `React 18+`, `PostgreSQL 15`, `Docker Compose`, `TensorFlow 2.15+`. | `README.md:14-22` | `VERIFICADA` | `src/backend/requirements.txt:7` fija `Django>=4.2.16,<5.0`; `src/frontend/package.json:17-19` usa `react 18` y `react-router-dom`; `docker-compose.yml:6` usa `postgres:15`; `src/ai_models/requirements.txt:7` usa `tensorflow-cpu>=2.15.0`; `src/ai_models/requirements.txt:2` usa `uvicorn[standard]`. |
| 2 | La arquitectura del proyecto es hexagonal. | `README.md:11`, `196-224` | `PARCIAL` | Hay capas hexagonales reales en `src/backend/api/logic/*`, `src/backend/core/*` y `src/backend/infrastructure/*`, pero la entrada principal sigue conviviendo con vistas legacy y ViewSets ORM directos en `src/backend/api/urls.py:12-22`. |
| 3 | La plataforma es híbrida Cloud/Edge. | `README.md:26`, `72-80`, `160`, `173-189` | `PARCIAL` | Existe backend cloud, frontend y microservicio IA. Pero la capa Edge real no está implementada: `mqtt_broker.py`, `tflite_api.py` y `sensor_reader.py` tienen `0` bytes. |
| 4 | Existe “IA dual”: TensorFlow en cloud y TensorFlow Lite en Edge sobre BeagleBone Black. | `README.md:78-80`, `460-466`, `514-516` | `DESACTUALIZADA` | Cloud sí existe con FastAPI + TensorFlow (`src/ai_models/fastapi_app.py:43-46`, `158-179`, `206-244`). Edge TFLite no está implementado en código: archivos embedded vacíos (`src/embedded/*`, longitudes 0). Tampoco hay artefactos `.tflite` versionados en `src/ai_models/production_models/`. |
| 5 | El dashboard ofrece telemetría IoT “en tiempo real” con latencia `<2s`. | `README.md:146` | `PARCIAL` | Hay polling en frontend de robótica cada 1 segundo en `src/frontend/src/hooks/useRoboticsApi.js:37-41`, pero gran parte del dashboard usa datos simulados o externos, por ejemplo `TelemetryPanel` es 100% simulado y el estado cloud usa endpoints hardcodeados. No hay evidencia estática de latencia `<2s`. |
| 6 | Hay “Autenticación JWT + HTTPS + CORS configurado”. | `README.md:150`, `307`, `965` | `DESACTUALIZADA` | CORS sí está configurado (`src/backend/sigct_backend/settings.py:138`). Pero no hay JWT real: `src/backend/requirements.txt:1-32` no incluye `simplejwt`, y `src/backend/api/urls.py:17-31` no define endpoints `/api/auth/*`. El frontend cae a `demo-token` si falla login real (`src/frontend/src/auth/AuthContext.jsx:17-44`). Tampoco hay configuración HTTPS en el backend observado. |
| 7 | La comunicación incluye `API REST + WebSockets`. | `README.md:151`, `239-253`, `305-306`, `1020` | `DESACTUALIZADA` | Sí hay API REST en `src/backend/api/urls.py:17-31`. Pero no hay `channels` ni `daphne` en `src/backend/requirements.txt:1-32`, ni configuración ASGI/Channels en settings. |
| 8 | El frontend usa `React + TailwindCSS (Mobile-First)`. | `README.md:152`, `289-298` | `VERIFICADA` | `src/frontend/package.json:17-19` usa React 18; `25-36` incluye `tailwindcss`, `postcss` y Vite. |
| 9 | El backend usa `Django REST Framework`. | `README.md:303-304` | `VERIFICADA` | `src/backend/requirements.txt:9` incluye `djangorestframework`; `src/backend/api/urls.py:2` usa `DefaultRouter`. |
| 10 | El backend usa `Django Channels` y `Daphne`. | `README.md:305-306` | `DESACTUALIZADA` | No aparecen en `src/backend/requirements.txt:1-32`; el backend corre con `runserver` en Docker (`src/backend/Dockerfile:16-17`). |
| 11 | El backend usa JWT con `djangorestframework-simplejwt`. | `README.md:307` | `DESACTUALIZADA` | No está en dependencias (`src/backend/requirements.txt:1-32`) ni en rutas (`src/backend/api/urls.py:17-31`). |
| 12 | El frontend usa `Axios` como HTTP client. | `README.md:297` | `DESACTUALIZADA` | `src/frontend/package.json:12-24` no incluye `axios`; el código usa `fetch` nativo, por ejemplo `AuthContext.jsx:17`, `AIPredictiva.jsx:129`, `useRoboticsApi.js:15`, `DataScienceLab.jsx:65`. |
| 13 | La IA usa `FastAPI + Uvicorn`. | `README.md:318`, `782`, `799` | `VERIFICADA` | `src/ai_models/requirements.txt:1-2` incluye `fastapi` y `uvicorn[standard]`; `src/ai_models/Dockerfile:30` arranca con `uvicorn`; `src/ai_models/fastapi_app.py:43` crea la app FastAPI. |
| 14 | La IA usa `SpeechRecognition` y audio conversacional. | `README.md:321`, `472-479` | `VERIFICADA` | `src/ai_models/requirements.txt:8-10` incluye `SpeechRecognition`, `gTTS`, `pydub`; `src/ai_models/fastapi_app.py:280-398` implementa `/assist` y `GET /events`; `126-149` consulta lecturas recientes en PostgreSQL. |
| 15 | La síntesis TTS del asistente usa `pyttsx3 (TTS local)`. | `README.md:476` | `DESACTUALIZADA` | El código usa `gTTS`, no `pyttsx3`: `src/ai_models/fastapi_app.py:30`, `268-273`, `373-378`; `src/ai_models/requirements.txt:9` incluye `gTTS`. |
| 16 | La IA usa `OpenCV (cv2)`. | `README.md:322` | `DESACTUALIZADA` | No hay `opencv-python` en `src/ai_models/requirements.txt:1-13`, ni import `cv2` en `src/ai_models/fastapi_app.py:18-25`. |
| 17 | La base de datos principal es PostgreSQL 15 con ORM Django y migraciones. | `README.md:329-333` | `VERIFICADA` | `docker-compose.yml:5-20` usa PostgreSQL 15; `src/backend/sigct_backend/settings.py:89-109` configura PostgreSQL; `schema_postgresql.sql:26-45` contiene tabla `api_sensorreading`. |
| 18 | El modelo de datos principal incluye `USER -> ROBOT`, `USER -> SENSOR_READING`, `JSONB` flexible y ownership del robot. | `README.md:368-435` | `DESACTUALIZADA` | Los modelos reales no implementan `owner_id` en `Robot` ni `user_id` en `SensorReading`; `Robot` usa `robot_id` como PK string (`src/backend/api/models.py:20-39`) y `SensorReading` solo tiene `sensor_id`, `temperature`, `humidity`, `timestamp` (`4-14`). El dump SQL solo confirma `api_sensorreading`, no las tablas robóticas (`schema_postgresql.sql:26-45`, `326-330`). |
| 19 | El microservicio IA ofrece clasificación de enfermedades y notebooks de entrenamiento. | `README.md:443-480` | `VERIFICADA` | Hay notebooks en `src/ai_models/notebooks/`; el servicio expone `POST /infer` en `src/ai_models/fastapi_app.py:206-244`; existe un modelo `.h5` en `src/ai_models/production_models/`. |
| 20 | El modelo cloud tiene `38 clases`, `92.5% accuracy`, formato `.h5` de `150 MB`. | `README.md:449-456` | `PARCIAL` | Existe un modelo `.h5` y un pipeline de entrenamiento, pero el repositorio no permite verificar estáticamente `38 clases`, accuracy `92.5%` ni tamaño exacto operativo. Además `model_metadata.json` no refleja 38 clases sino `["enferma", "sana"]`. |
| 21 | El Edge usa `BBB-01 Gateway MQTT`, `BBB-02 IA Edge Flask`, `BBB-03 Sensores/OpenCV`. | `README.md:487-516` | `DESACTUALIZADA` | Solo existe la estructura de carpetas; los tres scripts principales están vacíos (0 bytes). No hay implementación Flask edge ni MQTT operativa en `src/embedded/`. |
| 22 | El laboratorio de robótica tiene visualización 3D y telemetría viva. | `README.md:533-539` | `PARCIAL` | El stack 3D sí está presente (`src/frontend/package.json:13-14,22`). Pero la telemetría viva depende de hooks que asumen respuesta paginada (`src/frontend/src/hooks/useRoboticsApi.js:15-24`) y del backend actual no se desprende ese contrato. |
| 23 | El laboratorio de matemáticas usa `Pyodide` y `Plotly`. | `README.md:543-549` | `VERIFICADA` | `src/frontend/src/pages/DataScienceLab.jsx:3-5` carga `Pyodide` y `Plotly` desde CDN; `33-59` ejecuta Python en navegador. |
| 24 | El laboratorio de ciencia de datos usa `Scikit-learn en navegador` y `Jupyter embebido`. | `README.md:553-559` | `DESACTUALIZADA` | `DataScienceLab.jsx` carga Pyodide y Pandas, pero no hay evidencia de `scikit-learn` ni notebook embebido/Jupyter (`src/frontend/src/pages/DataScienceLab.jsx:10-19`, `33-59`, `94-127`). |
| 25 | La demo en vivo está en `http://localhost:5173/labs`. | `README.md:564` | `VERIFICADA` | Existe la ruta `/labs` en `src/frontend/src/App.jsx` y el frontend en Docker expone `80` mapeado por Compose a `5173` (`docker-compose.yml:76-84`). |
| 26 | La instalación híbrida rápida usa backend local + DB en Docker y es un flujo soportado. | `README.md:582-619` | `PARCIAL` | El repo sí soporta backend local y DB Docker conceptualmente (`settings.py:89-109`, `docker-compose.yml:5-38`). Pero el README indica `DB_PORT=5432`, mientras el `docker-compose.yml` publica PostgreSQL como `5544` por defecto (`docker-compose.yml:13`). |
| 27 | La instalación Docker expone frontend en `5173`, backend en `8000`, AI en `8081`. | `README.md:663-669` | `PARCIAL` | AI y frontend coinciden (`docker-compose.yml:65-66`, `81-82`), pero el backend en compose se publica por defecto en `8010:8000`, no en `8000` (`docker-compose.yml:48-49`). |
| 28 | Existe `API Docs` en `http://localhost:8000/api/docs/`. | `README.md:667` | `DESACTUALIZADA` | No hay rutas `/api/docs/` ni integración Swagger/ReDoc en `src/backend/api/urls.py:17-31` ni en `src/backend/sigct_backend/urls.py` observado previamente. |
| 29 | El endpoint de verificación local es `curl http://localhost:8000/api/health/`. | `README.md:737-741` | `DESACTUALIZADA` | No existe `/api/health/` en `src/backend/api/urls.py:17-31`. |
| 30 | El servicio IA responde `{"status":"ready","model":"loaded"}` en `/health`. | `README.md:785-789` | `DESACTUALIZADA` | El contrato real de `/health` devuelve `status`, `tensorflow`, `voice`, `model_loaded`: `src/ai_models/fastapi_app.py:195-203`. |
| 31 | El backend en Docker está listo para producción. | `README.md:621-660` | `PARCIAL` | Hay una ruta Docker funcional en estructura, pero el backend sigue ejecutándose con `runserver`, no con servidor de producción (`src/backend/Dockerfile:16-17`). |
| 32 | La estructura del proyecto mostrada en README representa fielmente el árbol actual. | `README.md:877-945` | `PARCIAL` | La estructura base coincide en alto nivel (`src/backend`, `src/frontend`, `src/ai_models`, `src/embedded`, `docker-compose.yml`, `schema_postgresql.sql`). Pero omite carpetas reales importantes y simplifica el backend refactorizado actual (`core`, `infrastructure`, `interfaces`) que sí existen. |
| 33 | “Sistema de autenticación JWT” aparece como completado. | `README.md:958-969`, especialmente `965` | `DESACTUALIZADA` | No hay auth JWT real en backend (`src/backend/requirements.txt:1-32`, `src/backend/api/urls.py:17-31`), y el frontend usa fallback demo (`src/frontend/src/auth/AuthContext.jsx:29-44`). |
| 34 | “Tests unitarios y de integración” están en progreso. | `README.md:974-980`, especialmente `979` | `VERIFICADA` | Existen pruebas reales en `src/backend/tests/` para dominio, persistencia y adaptadores; no se afirma que estén completas, solo en progreso. |
| 35 | “WebSockets” en backend están activos/en progreso dentro del roadmap 2026. | `README.md:1018-1021` | `PLANIFICADA` | El roadmap lo presenta como trabajo en curso, y el código actual aún no lo implementa: no hay `channels`/`daphne`/rutas websocket en dependencias ni configuración. |

## Hallazgos clave

### 1. Lo más confiable del README

- Stack base del proyecto.
- Existencia de backend Django, frontend React y microservicio IA en FastAPI.
- Uso de PostgreSQL y Docker Compose.
- Existencia de notebooks y componente de voz.
- Presencia de laboratorios interactivos y frontend con capacidades 3D.

### 2. Lo más desactualizado

- JWT como funcionalidad completada.
- WebSockets/Channels/Daphne como parte activa del backend.
- Edge operativo con BeagleBone, MQTT y TFLite.
- Contrato real de algunos endpoints de instalación/verificación.
- Modelo de datos documentado con relaciones `USER -> ROBOT` y `USER -> SENSOR_READING`.
- Uso de Axios, OpenCV, pyttsx3, scikit-learn en navegador y Jupyter embebido.

### 3. Lo más “parcial”

- Arquitectura hexagonal: existe, pero no domina todo el backend.
- Plataforma Cloud/Edge: cloud sí, edge no implementado.
- Dashboard en tiempo real: mezcla polling real, datos externos y simulaciones.
- Instalación Docker: la estructura existe, pero varios puertos y expectativas del README no coinciden exactamente con `docker-compose.yml`.

## Conclusión

El `README.md` es útil como documento de intención y de visión del proyecto, pero no como fuente única de verdad operativa. Para describir el estado real actual, debe considerarse **parcialmente confiable**: acierta en el stack y en la existencia de los módulos principales, pero sobredeclara seguridad, tiempo real, Edge, autenticación, contratos API y nivel de completitud arquitectónica.
