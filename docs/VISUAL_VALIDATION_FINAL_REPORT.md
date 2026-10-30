# VISUAL_VALIDATION_FINAL_REPORT

**Misión:** `PROJECT_RESUME_AND_VISUAL_VALIDATION`
**Fecha:** 2026-10-30
**Rama:** `feature/cmsc-f3c-v1-implementation`
**HEAD:** `d930a34` — `docs(governance): consolidate AI, Docker and memory decisions`
**Árbol de trabajo:** LIMPIO · único untracked `STAGE_FREEZE_20261013.txt`
**Modo:** SOLO auditoría y validación. **Cero** cambios de código, cero archivos tocados, cero commits, cero push, cero OCI, cero MEMORY.

---

## 1. Alcance, método y límite de evidencia (honestidad)

Se validó el **estado funcional actual** leyendo el código y los artefactos en disco, y consultando el runtime.

**Hallazgo de entorno determinante:** al momento de la auditoría **Docker Desktop está apagado** y **ningún puerto del stack responde**:

| Puerto | Servicio | Estado |
|---|---|---|
| 5173 | frontend Docker (legacy oficial) | ❌ cerrado |
| 5174 | Vite dev (evolución) | ❌ cerrado |
| 8010 | backend Django | ❌ cerrado |
| 8081 | `ai_service` FastAPI | ❌ cerrado |
| 8766 | bridge acústico (Node, host) | ❌ cerrado |
| 4180 | preview producción | ❌ cerrado |

```
docker ps  →  failed to connect to the docker API at npipe://.../dockerDesktopLinuxEngine
docker compose config  →  OK (sintaxis válida; servicios: db, ai_service, backend, frontend)
```

**Consecuencia honesta:** **no se tomó ninguna captura ni se hizo clic en la UI en esta sesión.** La validación es **estructural/funcional sobre el código real + evidencia en disco**, y la ejecución en vivo se marca explícitamente como **NO re-verificada hoy**. Las pruebas manuales que reportó Bernardo (IA Predictiva y Voz) son evidencia de primera mano y se usan como tal, identificadas como tales.

Esto **no invalida** el dictamen de los 10 módulos: cada estado se apoya en código verificable, no en memoria.

---

## 2. Resumen de los 10 módulos

| # | Módulo | Estado | Evidencia |
|---|---|---|---|
| 1 | Dashboard | ✅ OPERATIVO | ruta `/dashboard` + V3 real (solo lectura) |
| 2 | CMSC Científico | ✅ OPERATIVO | ruta `/dashboard-cmsc` + 26 componentes + 3 señales reales |
| 3 | Hardware | ✅ OPERATIVO | `/hardware-catalog` + `/hardware/:id` estático |
| 4 | Laboratorios | ⚠️ PARCIAL | 7 labs; RoboticsLab `ROTO` declarado |
| 5 | Knowledge Hub | ✅ OPERATIVO | 51 docs / 6 categorías, `import.meta.glob` |
| 6 | IA Predictiva V5 | ✅ OPERATIVO | cadena real hasta `.h5` (ver §3) |
| 7 | Voice Assistant | ✅ OPERATIVO | `/assist` real, voz verificada por Bernardo |
| 8 | Bridge | ⚠️ PARCIAL | código completo; proceso apagado; **fuera de compose** |
| 9 | Backend | ✅ OPERATIVO | 3 capas V1/V2/V3 + `/health` + `/v3/ai/inference/` |
| 10 | Docker | ❌ FALLA (hoy) | daemon apagado; artefactos ✅ |

---

## 3. Detalle por módulo

### 1. Dashboard — ✅ OPERATIVO

**Funciona**
- Ruta `/dashboard` registrada en `App.jsx:118`, envuelta por `TopNav` + `VoiceAssistant` (`App.jsx:159`).
- Datos reales por lectura: `SensorReading` V3 (`/api/v3/telemetry/history/`), `TelemetryPanel`, `GlobalChart`, `ClusterCard`.
- Ruteo centralizado en `routeMap` (`App.jsx:73`) reutilizado por voz y navegación.

**No funciona / limitado**
- Sin runtime hoy no se verificó render ni consola.
- `cloud.js` conserva endpoints `*.onrender.com` como *fallback* de disponibilidad (residual V8, no bloqueante).

**Riesgos**
- Es la puerta de entrada: si falla el backend, el dashboard cae a fallback y **no lo dice con suficiente énfasis** en algunos paneles.

**Impide Docker Ready**
- Nada propio. Depende de `backend` healthy (ya declarado en compose).

---

### 2. CMSC Científico — ✅ OPERATIVO

**Funciona**
- Ruta aditiva `/dashboard-cmsc` (`App.jsx:139`) → `CmscDashboard embedded`.
- **26 componentes** en `src/frontend/src/pages/cmsc/` (Hero, `SignalRiver`, `OrchestrationZoneV2`, Logger, Dataset, `AcpCell`, `BenchmarkCell`, `LabDoors`, `ModelPredictCell`, instrumento espectral, etc.).
- Honestidad implementada: `HonestyBadge` + `HonestyThermometer` + `signalCatalog.js` con estados `REAL/REAL-LOCAL/ROTO/DISEÑO`.
- Flujo S30 → Logger → Dataset → S81 → S82 → KH representado en `AcousticFlowStepper`.

**No funciona / limitado**
- **S30 (micrófono)** es `REAL-LOCAL` pero sólo cuando el navegador lo permite; no se re-verificó hoy.
- **Bridge en `SIN_PUENTE`** (correcto por diseño cuando el proceso Node no corre).
- S81/S82 permanecen `DISEÑO` (honesto y declarado).

**Riesgos**
- El panel acústico depende de un proceso **externo al compose** (ver módulo 8) → en Docker Oficial la orquestación acústica queda **sin puente** por diseño actual.

**Impide Docker Ready**
- El bridge no está containerizado ni declarado en compose.

---

### 3. Hardware — ✅ OPERATIVO

**Funciona**
- `/hardware-catalog` (`HardwareCatalogPage.jsx`) y `/hardware/:id` (`HardwareDetailPage.jsx`) con datos estáticos, sin dependencia de red.

**No funciona / limitado**
- Contenido estático: no consulta inventario real ni telemetría por dispositivo.

**Riesgos**
- Bajo. Riesgo de expectativa: el catálogo **no** es un inventario vivo.

**Impide Docker Ready**
- Nada.

---

### 4. Laboratorios — ⚠️ PARCIAL

**Funciona** (7 labs en `src/frontend/src/labs/` + rutas `App.jsx:127-132`)
- `TelecomLab` — FFT real sobre micrófono (`REAL-LOCAL`), motor propio `spectralEngine.js`.
- `ElectronicsLab` — simulador SPICE + Falstad vendorizado (mismo origen).
- `AdvancedMathLabV2` — instrumentos matemáticos (`SIM`).
- `EmbeddedLab`, `DataScienceLab` (sandbox Pyodide), `AdvancedMathLab` V1, `RoboticsLab`.

**No funciona / limitado**
- **`RoboticsLab` = `ROTO`** declarado en `signalCatalog.js`: el cliente apunta a `localhost:8000`, pero el backend real vive en `8010`. Es un fallo de host, no de backend.
- `AdvancedMathLab` V1 marcado `ROTO`/obsoleto frente a V2.
- Los labs son `SIM` en su mayoría; sólo Telecom es `REAL-LOCAL`.

**Riesgos**
- Un lab declarado `ROTO` puede leerse como "el ecosistema no funciona": conviene que el badge sea **imposible de ignorar** (ya lo es en CMSC, no en la vista clásica de labs).

**Impide Docker Ready**
- No bloquea técnicamente (está declarado), pero `localhost:8000` **horneado** en el cliente de robótica es un residuo de host que contradice "mismo-origen".

---

### 5. Knowledge Hub — ✅ OPERATIVO

**Funciona**
- Rutas `/knowledge` y `/knowledge/doc/:docId` (`App.jsx:135-136`).
- Registro generado **verificado en disco**: `src/frontend/src/knowledge-hub/registry/knowledgeRegistry.generated.json` → **51 documentos** en **6 categorías**: `research-v2` 18 · `eiarc-architecture` 13 · `project-core` 7 · `knowledge-base` 6 · `historical` 4 · `eiarc-foundation` 3.
- `docLoader.js` usa `import.meta.glob` sobre `docs/**` y `README.md` (por eso el build de Docker necesita contexto raíz — ya resuelto en `docker-compose.yml`).

**No funciona / limitado**
- Sin RAG ni Evidence Ledger (ambos `DISEÑO`, declarado).
- El contenido depende de que el build tenga los `.md` presentes; **si se cambia el contexto del build, el KH se vacía silenciosamente**.

**Riesgos**
- Fuga de contenido: los `.md` del repo quedan dentro de la imagen del frontend (comportamiento actual, aceptado).

**Impide Docker Ready**
- Nada. Es de los módulos mejor cerrados.

---

### 6. IA Predictiva V5 — ✅ OPERATIVO → ver §4 (análisis profundo)

### 7. Voice Assistant — ✅ OPERATIVO → ver §5 (análisis profundo)

---

### 8. Bridge (acústico) — ⚠️ PARCIAL

**Funciona**
- `tools/cmsc-data-logger/bridge/server.js` existe: Node ESM **cero dependencias**, bind `127.0.0.1`, puerto `8766`, `GET /health`, `GET /stats`, `POST /ingest`, CORS whitelist, límite 8 MB.
- Reutiliza **exclusivamente** `ingestWav()` del motor canónico (una sola ruta de ingesta).
- Cliente: `src/frontend/src/pages/cmsc/orchestration/acousticBridge.js` (`BRIDGE_URL = http://127.0.0.1:8766`) con `bridgeHealth`, `postIngest`, `getStats`, `encodeWavPcm16`.
- Script `npm run bridge` en `tools/cmsc-data-logger/package.json:20`.

**No funciona / limitado**
- **El proceso no está corriendo** (8766 cerrado). La UI muestra `SIN_PUENTE` — honesto.
- **No existe en `docker-compose.yml`** (servicios: `db`, `ai_service`, `backend`, `frontend`).
- `BRIDGE_URL` está **hardcodeado** a `127.0.0.1:8766`; no lee `VITE_*`.

**Riesgos**
- En Docker Oficial, un usuario con el navegador en otra máquina **no tiene puente** (127.0.0.1 apunta a su propia máquina). Es coherente con "local-only", pero **rompe la promesa de stack completo en contenedor**.
- La ingesta productiva sigue bloqueada hasta **Tramo C** (PCM continuo de S30); el tap actual es 8-bit/4096/RAF solapado.

**Impide Docker Ready**
- **Nuevo bloqueador potencial**: si el flujo acústico se considera parte del producto Docker, el bridge debe containerizarse o declararse explícitamente "fuera de Docker".

---

### 9. Backend — ✅ OPERATIVO

**Funciona**
- `src/backend/api/urls.py`: `/api/health/` (liveness **sin DB**, añadido para el healthcheck), `auth/*`, `telemetry/history/`, `v2/telemetry/history/`, `v2/ai/crop-advice/`, y **V3**: `v3/telemetry/history/`, `v3/ai/crop-advice/`, `v3/telemetry/readings/`, **`v3/ai/inference/`**.
- Arquitectura hexagonal: `AIInferenceV3View` → `get_ai_inference_service()` → `FastAPIAIAdapter` → `http://ai_service:8081/infer` → `SemanticPredictionResolver` → envelope `contract_version="v1"`, `operation="plant_diagnosis"`, `scientific_scope="binary_only"`.
- Producción: `gunicorn sigct_backend.wsgi:application --workers 3 --timeout 120` en `src/backend/Dockerfile`.

**No funciona / limitado**
- Resolver **binario** (0=enferma, 1=sana, resto → `UNKNOWN_FALLBACK`). Cualquier modelo multiclase queda mal etiquetado hasta AI-R4.
- `AI_SERVICE_URL` no está en `.env`: fuera de compose el backend buscaría `ai_service` (DNS inexistente) y la inferencia caería a `fallback`.

**Riesgos**
- **R-EXEC-1** (activo si se sirve M2 antes de R4): `class_1` = `corn__common_rust` se etiqueta como "sana".
- `DJANGO_DEBUG=true` en `.env` actual.

**Impide Docker Ready**
- F5 (serving canónico) sigue abierto: el contenedor sirve el `.h5` histórico.

---

### 10. Docker — ❌ FALLA (hoy) · artefactos ⚠️

**Funciona (artefactos, verificado en disco)**
- `docker compose config` **valida sin errores**.
- 4 servicios (`db`, `ai_service`, `backend`, `frontend`) con `restart: unless-stopped` y `healthcheck` reales:
  - db: `pg_isready`
  - backend: `urlopen('http://127.0.0.1:8000/api/health/')`
  - ai_service: `urlopen('http://127.0.0.1:8081/health')`
  - frontend: `wget --spider http://127.0.0.1/`
- `depends_on` con `condition: service_healthy` (frontend espera backend **y** ai_service).
- Mismo-origen: nginx `location /api/ → backend:8000`, `location = /assist → ai_service:8081` (`client_max_body_size 25m`), SPA fallback.
- `db-mysql` aislado en `profiles: ["legacy"]` (no arranca con `up`).
- `.env` presente con 16 claves (incluye `BACKEND_PORT=8010`, `AI_PORT=8081`, `FRONTEND_PORT=5173`).

**No funciona hoy**
- **Docker Desktop apagado** → `docker ps` inaccesible → **no hay stack**. Todo el ecosistema está caído por entorno, no por código.
- No se puede verificar `model_loaded` en `/health`, ni el healthcheck de los 4 contenedores, ni el E2E.

**Riesgos**
- Rebuild de `ai_service` (si AI-R3 añade `onnxruntime`) **invalida la capa `pip install`** → re-descarga de TensorFlow; con pocos GB libres es el riesgo R-JEXEC-2.
- `.env` con `DJANGO_DEBUG=true` no debe viajar a un despliegue real.

**Impide Docker Ready**
- Runtime apagado + los faltantes del §6.

---

## 4. A. IA PREDICTIVA V5 — ¿usa realmente `plant_disease_mbv2.h5`?

### 4.1 Cadena completa verificada en código

```
AIPredictiva.jsx  (etiqueta UI "IA Predictiva v5.0", línea 329)
   └─ POST  /api/v3/ai/inference/          (AI_INFERENCE_URL, línea 3)
        └─ AIInferenceV3View               (src/backend/api/views.py:330)
             └─ FastAPIAIAdapter           (AI_SERVICE_URL ?? http://ai_service:8081)
                  └─ POST :8081/infer      (multipart campo "file")
                       └─ model.predict()  sobre plant_disease_mbv2.h5
                            └─ SemanticPredictionResolver  (class_index → enferma/sana)
```

**Sí: es el `.h5` real.** No hay mock ni escenario en la ruta `mode: 'real'`; los `DEMO_SCENARIOS` existen sólo para los botones de demo y se distinguen explícitamente.

### 4.2 El artefacto, verificado por bytes (no por memoria)

| Propiedad | Valor verificado |
|---|---|
| Archivo | `src/ai_models/production_models/plant_disease_mbv2.h5` |
| Tamaño | **9 431 432 B** |
| SHA-256 | `77B0EFECD602F95FD31846C3058B4D45E41289155438FBD22738BCE0640219C0` |
| Fecha | 2026-08-21 17:14 |
| Input | `[null, 224, 224, 3]` (NHWC, batch dinámico) → **acepta cualquier tamaño de imagen** |
| Normalización | capa **`Rescaling` (1)** interna |
| Backbone | 17 × `DepthwiseConv2D` + 10 × `Add` + 4 × `ZeroPadding2D` → **MobileNetV2-like** |
| Salida | `dense units = 2` + **`softmax` (1)** |
| Metadata | `model_metadata.json` → `{"classes": ["enferma","sana"], "framework": "tensorflow_fixed"}` |

**Conclusión arquitectónica:** es un **clasificador binario de 2 clases con softmax**, no un sigmoide de 1 unidad. Esto es la pieza que explica exactamente el comportamiento observado.

### 4.3 ¿Las respuestas observadas son coherentes?

**Sí, y son la firma esperada de este modelo.**

- `/infer` hace `idx = argmax(preds)` y `confidence = max(preds)` → la confianza es **la probabilidad de la clase ganadora**.
- `class_0` → `enferma`; `class_1` → `sana` (`CLASS_DEFINITIONS` + `getClassificationLabel`).
- **Hoja enferma → 99–100 %** = el modelo satura con seguridad en `class_0`.
- **Hoja sana → ~62 %** = el modelo acierta (`class_1`) pero con margen mucho menor. Es el patrón típico de un binario **desbalanceado** (el dataset de entrenamiento probablemente tiene más "enferma" que "sana"), donde la clase sana se decide con menos certeza.
- **No es aleatorio:** un clasificador aleatorio daría ~50 % estable en ambas; aquí hay una asimetría sistemática y reproducible.

**Un matiz importante y honesto:** el arreglo de **doble normalización** (`fastapi_app.py:188-190`, comentario explícito "El modelo ya incluye Rescaling(1/127.5,-1); no aplicar segunda normalización") es lo que devolvió la funcionalidad. **Ese cambio está en `d930a34`.** Antes, el `preprocess_input` de MobileNetV2 normalizaba por segunda vez y colapsaba el modelo (`ROTO`). **Lo que Bernardo está viendo funcionar es el resultado de ese fix**, no una coincidencia.

### 4.4 ¿Clasifica en tiempo real?

- **Sí, por imagen individual:** una pasada forward (`model.predict(processed, verbose=0)`), `processing_time` reportado en la respuesta, log JSONL en `data/logs/infer_log.jsonl`.
- **No es vídeo/streaming:** es *single-frame on demand*. Llamarlo "tiempo real" es correcto en el sentido de "inferencia síncrona en el request", no de vídeo continuo.
- **Latencia:** dominada por TensorFlow **CPU** (`tensorflow-cpu>=2.15`) dentro del contenedor. Es aceptable para foto, insuficiente para vídeo.

### 4.5 Dictamen A

> **✅ SÍ usa `plant_disease_mbv2.h5` real, clasifica en tiempo real por frame, y el comportamiento observado (99–100 % enferma / ~62 % sana) es exactamente el esperado de un softmax binario desbalanceado. Funcionalidad real, no simulada.**

**Límites que deben quedar escritos junto al resultado:**
1. **Alcance binario:** no identifica enfermedad ni especie (`scientific_scope: binary_only`, `plant_species: unknown`). La UI ya lo dice.
2. **Sin validación de campo:** G-3b abierto (`real_world_holdout_v1` = 0). El 99–100 % / 62 % es **anecdótico**, no una métrica publicada. No debe presentarse como precisión del modelo.
3. **Es un artefacto HISTÓRICO** según el canon (`H5_CLOSED`), servido por autorización `D-serve`, no el modelo canónico.
4. **No hay log en disco** de esas pruebas (`infer_log.jsonl` no existe en el host) → si se hicieron en Docker, el log vive **dentro del contenedor** y se pierde al recrearlo. **Evidencia no persistida.**

---

## 5. B. VOICE ASSISTANT — componentes, riesgo y protección

### 5.1 Componentes reales

| Capa | Componente | Detalle |
|---|---|---|
| UI | `src/frontend/src/components/VoiceAssistant.jsx` | `getUserMedia` + `MediaRecorder` (webm/opus, ogg, mp4) |
| UI (CMSC) | `AcpCell.jsx:6` → `useAiVoiceAssist` | **mismo** hook `/assist`, reutilización aditiva |
| Endpoint dev | `http://localhost:8081/assist` | `resolveEndpoint(VITE_AI_API_BASE, DEV ? :8081 : '')` |
| Endpoint prod | `/assist` **mismo-origen** | nginx → `ai_service:8081` (25 MB) |
| Backend IA | `fastapi_app.py` `/assist` | `pydub` decodifica → `speech_recognition` → `gTTS` |
| STT | `recognizer.recognize_google(language="es-ES")` | **requiere Internet** |
| TTS | `gTTS` (Google) | **requiere Internet** |
| Contexto | `ConversationMemory` + `get_latest_sensor_data_pg()` | Postgres **opcional** (dual `db` / `localhost`) |
| Dependencias | `SpeechRecognition`, `gTTS`, `pydub`, `psycopg2-binary` + `ffmpeg`, `libespeak-dev` | en `requirements.txt` y `Dockerfile` |

**Respuesta:** el servidor devuelve **MP3 binario**; el frontend hace `response.blob()` → `new Audio(url).play()`. El bucle es **voz→voz** (no devuelve texto a la UI).

### 5.2 ¿Hay riesgo de perderlo en AI-R3 o AI-R4?

| Misión | Riesgo | Nivel | Motivo |
|---|---|---|---|
| **AI-R3** | **MEDIO-ALTO** | `ai_service` es el **mismo contenedor** que sirve el modelo | Se toca `fastapi_app.py`, `requirements.txt`, `Dockerfile`. Cualquier `pip` que elimine TF o reemplace el preprocesado puede arrastrar `/assist` |
| **AI-R4** | **BAJO** | sólo `semantic_prediction_resolver.py`, `views.py`, `AIPredictiva.jsx` | No toca `/assist` ni la voz |
| **AI-R3 hecho en solitario** | **CRÍTICO** | R-EXEC-1 | 16 clases con resolver binario → `corn__common_rust` etiquetado "sana" |
| **Riesgo de red** | **MEDIO** | `recognize_google` + `gTTS` | Sin egress a Internet la voz deja de responder (no es un bug de código) |
| **Riesgo de dependencia** | **MEDIO** | `VOICE_AVAILABLE` | Si `speech_recognition`/`gtts`/`pydub`/`psycopg2` fallan al importar → `/assist` devuelve **503** |

**Punto clave:** la voz **no depende del modelo**. `VOICE_AVAILABLE` sólo mira `sr`, `gTTS`, `AudioSegment`, `psycopg2`. Por eso puede sobrevivir a AI-R3 **si y sólo si** no se recortan esas dependencias ni se rompe el endpoint.

### 5.3 Cómo protegerlo (plan, no ejecutado)

**P0 — Congelar lo que funciona (antes de tocar nada)**
1. `git tag -a AI_V5_BINARY_WORKING -m "IA Predictiva V5 + Voice operativos (h5 77B0EFEC…, d930a34)"`.
2. Registrar el **digest de la imagen** actual de `ai_service` y del frontend (rollback instantáneo sin rebuild).
3. Guardar el SHA-256 del `.h5` (`77B0EFEC…19C0`) junto al tag.

**P1 — Blindar `/assist`**
4. Prohibir por norma de misión: tocar el bloque `/assist`, `ConversationMemory`, `get_latest_sensor_data_pg`, `generar_audio_error`.
5. Mantener en `requirements.txt` **siempre**: `SpeechRecognition`, `gTTS`, `pydub`, `psycopg2-binary`; y en `Dockerfile`: `ffmpeg`, `libespeak-dev`.
6. Mantener en nginx: `location = /assist` con `client_max_body_size 25m`.

**P2 — Test de regresión obligatorio (nuevo, a ejecutar antes y después de R3)**
7. **A-VOICE-1:** `POST /assist` con WAV sintético → respuesta `audio/mpeg` con **bytes > 0**.
8. **A-VOICE-2:** `GET /health` → `voice: true` (no `false`).
9. **A-INIT-1:** `POST /infer` con imagen sintética → `status:"ok"` y `model:"plant_disease_mbv2.h5"` **antes** de R3, para tener la línea base.

**P3 — Aditivo, nunca sustitutivo**
10. Añadir `onnxruntime` **sin quitar** `tensorflow-cpu`.
11. Selector por entorno: `AI_BACKEND=tf|onnx` (por defecto `tf`). El `.h5` **permanece** en la imagen como fallback.
12. `Dockerfile` y `MODELS_DIR` no deben borrar `production_models/*.h5`.

**P4 — Orden obligatorio (ya definido en `AI_R3_R4_EXECUTION_PLAN`)**
13. **F1 R4-backend → F2 R3 dormido → F3 R4-frontend → F4 activación → F5 validación.**
14. **Nunca** activar ONNX sin resolver v2 desplegado (elimina R-EXEC-1 por construcción).

**P5 — Evidencia persistida**
15. Montar `data/logs/` del `ai_service` como volumen (hoy `infer_log.jsonl` vive dentro del contenedor y **se pierde**).
16. Montar `data/datasets/` del bridge/logger como volumen si se containeriza.

---

## 6. Gate DOCKER_READY — clasificación y faltantes exactos

# ❌ DOCKER_NOT_READY

No es una opinión: es el mismo veredicto del cierre previo (`docs/DOCKER_READY_CLOSURE_REPORT.md` §8), y **hoy se agrava** porque el runtime está apagado.

### 6.1 Lo que ya está CERRADO (no reabrir)

| Tramo | Estado |
|---|---|
| R1–R4 (higiene, readiness, backend prod, mismo-origen) | ✅ `DOCKER_READY_R1R4` |
| Frontend oficialización (`resolveEndpoint`, sin `localhost` horneado) | ✅ |
| IA canónica (`AI_CANON_HYBRID`, `H5_CLOSED`, `M1_BASELINE_M2_CHALLENGER`, `M2_RECOVERED`) | ✅ |
| AI-R1 · AI-R2 (ONNX + paridad) | ✅ |
| AI-R3 · AI-R4 · AI-R5 | ✅ **READY** (diseño, **no ejecutados**) |

### 6.2 Lo que FALTA para cerrar el gate (lista exacta)

| # | Faltante | Bloquea | Naturaleza | ¿Se puede cerrar sin código? |
|---|---|---|---|---|
| **F1** | Tag de release reproducible (semver + SHA) | R6 | Ops | Sí |
| **F2** | `docs/DEPLOYMENT.md` oficial (4 servicios, healthchecks, gunicorn, mismo-origen, `/assist`, perfiles, secretos) | R6 | Documental | **Sí (solo doc)** |
| **F3** | `compose.resolved.yml` como artefacto versionado | R6 | Ops | Sí (`docker compose config` ya lo genera) |
| **F4** | Decisión: registry push ¿R6 o OCI? | R6 | Gobernanza | Bernardo |
| **F5** | Serving canónico (ONNX) **o** etiquetado `HISTÓRICO` explícito en runtime | **Global** | Código | **No** |
| **F6** | G2/G4/G8/G13/G15 ejecutadas y verdes | R7 | Verificación | No (requiere daemon) |
| **F7** | Validación visual humana: 16 capturas + DevTools | R7.5 | Humana | No (requiere runtime) |
| **F8** | De-cloud `cloud.js` / `lab-data.js` (opcional) | residual | Código | No |
| **G-3b** | `real_world_holdout_v1` ≥ 30/clase + κ ≥ 0.80 + métricas | Global científico | Captura real | **No** |

### 6.3 Bloqueadores nuevos detectados en esta auditoría

| # | Hallazgo | Impacto |
|---|---|---|
| **N1** | **`bridge` no está en `docker-compose.yml`** y `BRIDGE_URL` está hardcodeado a `127.0.0.1:8766` | El flujo acústico **no existe** en Docker Oficial. Debe declararse "fuera de Docker" o containerizarse. **Hoy no está declarado en ninguna de las dos formas** |
| **N2** | **`infer_log.jsonl` no persiste** (sin volumen; no existe en host) | Evidencia de inferencia se pierde al recrear el contenedor |
| **N3** | **`DJANGO_DEBUG=true`** en `.env` | No debe viajar a despliegue real |
| **N4** | **`localhost:8000` horneado** en el cliente de robótica | Contradice mismo-origen; declarado `ROTO` pero sigue en el bundle |
| **N5** | **`AI_SERVICE_URL` ausente de `.env`** | Si el backend corre en host (no compose), la inferencia cae a `fallback` sin explicar por qué |
| **N6** | **Docker Desktop apagado** | No es un defecto del proyecto, pero hoy **impide toda validación visual y E2E** |

### 6.4 Ruta mínima para declarar DOCKER_READY

```
Paso 0  Levantar Docker Desktop  →  docker compose up -d  →  esperar 4 healthy
Paso 1  F2 docs/DEPLOYMENT.md oficial           (solo documentación, sin código)
Paso 2  F3 compose.resolved.yml versionado      (comando, sin código)
Paso 3  F6 ejecutar G2/G4/G8/G13/G15            (verificación)
Paso 4  F7 las 16 capturas + DevTools           (humana)
Paso 5  F1 tag de release                       (ops)
Paso 6  F5 decidir: ONNX (misión AI-R3+R4)  ó  etiquetar HISTÓRICO en runtime
Paso 7  F4 decisión registry vs OCI            (Bernardo)
Paso 8  Declarar DOCKER_READY
```

**Estimación honesta:** con el runtime arriba, **F1+F2+F3 solos no requieren escribir código** y desbloquean R6. **F5 y G-3b sí requieren trabajo real** (misión de código y captura de campo).

---

## 7. Riesgos consolidados (estado actual)

| ID | Riesgo | Severidad | Estado |
|---|---|---|---|
| RV-1 | R-EXEC-1: activar M2 con resolver binario mislabela `class_1` | 🔴 Crítico | **Latente** (M2 no servido) |
| RV-2 | Perder la IA V5 funcional al ejecutar R3 | 🟠 Alto | Mitigable con tag + `AI_BACKEND=tf` |
| RV-3 | Perder la voz al recortar dependencias en R3 | 🟠 Alto | Mitigable con A-VOICE-1/2 |
| RV-4 | Bridge inexistente en Docker | 🟠 Alto | **No mitigado ni declarado** |
| RV-5 | `.h5` es HISTÓRICO y sin holdout: el 99 %/62 % no es precisión | 🟡 Medio | Declarado en UI, no en métricas |
| RV-6 | Voz depende de Internet (Google STT/TTS) | 🟡 Medio | Inherente al diseño actual |
| RV-7 | Rebuild `ai_service` + poco disco | 🟡 Medio | Vigilar `docker system df` |
| RV-8 | Logs de inferencia no persistidos | 🟡 Medio | Nuevo (N2) |

---

## 8. Veredicto

```
┌─────────────────────────────────────────────────────────────────────────┐
│  IA Predictiva V5      ✅ REAL — usa plant_disease_mbv2.h5 (softmax×2)  │
│  Voice Assistant       ✅ REAL — /assist + Google STT/TTS + Postgres    │
│  Ecosistema funcional  ✅ en código, ⚠️ NO re-verificado en vivo hoy    │
│  Docker runtime        ❌ APAGADO (daemon no accesible)                 │
│                                                                         │
│  CLASIFICACIÓN GLOBAL:     DOCKER_NOT_READY                             │
└─────────────────────────────────────────────────────────────────────────┘
```

**En una frase:** la funcionalidad que Bernardo vio funcionar es **real y reproducible** (`.h5` binario con `Rescaling` interna + softmax de 2 unidades, servido por Docker vía `/api/v3/ai/inference/`), no una simulación; y **no se pierde** si AI-R3 se ejecuta dormido (`AI_BACKEND=tf`) y AI-R4 va primero. `DOCKER_READY` sigue bloqueado por **F1–F8 + G-3b**, con **N1 (bridge fuera de compose)** como bloqueador nuevo que hasta hoy no estaba declarado en ninguna dirección.

**Sin cambios de código · sin archivos tocados · sin commits · sin push · sin OCI · sin MEMORY.**
