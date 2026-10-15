# AI-R3 ONNXRuntime Serving Plan

**mission:** `AI_R3_ONNXRUNTIME_SERVING_PLAN` · **date:** 2026-10-14
**base:** `docs/AI_R2_EXECUTION_REPORT.md` (`AI_R2_COMPLETE`, G-NEW-A PASS)
**alcance:** diseño de AI-R3 (servir `model.onnx` con `onnxruntime` reemplazando el `.h5` histórico).
**EXPLÍCITO:** **NO se implementa · NO se toca código · NO commits · NO push.**

**Clasificación: `AI_R3_READY` (condicionado a D3-A · D3-B · D3-C)** — ver §5.

---

## 0. Alcance / no-alcance

**Dentro de AI-R3:** sustituir en `ai_service` el motor de inferencia `.h5` (TensorFlow) por **ONNX Runtime**
cargando `model.onnx` (M2), preservando la **forma** del contrato de `/infer` y endureciendo `/health`.

**Fuera (AI-R4 y posteriores):** el **espacio de clases** (M2 = 16 vs. el resolver binario del backend), la
API v2, el frontend, la validación de holdout. **NO tocar:** CMSC · Dashboard · Labs · Knowledge Hub ·
Docker Oficial (compose/red) · OCI · SIGCT Memory.

---

## 1. Análisis de los 7 objetos

### 1.1 `ai_service`
- Microservicio FastAPI (puerto 8081). Endpoints: `/health`, `/infer`, `/assist` (voz), `/events` (SSE), `/analyze-circuit`.
- **Solo `/infer` usa el modelo.** `/assist`, `/events`, `/analyze-circuit` son independientes de TF/ONNX.
- Sirve hoy `plant_disease_mbv2.h5` (binario **histórico, `scientific_scope: binary_only`**).
- El `.h5` **SÍ está versionado** en git (`git ls-files` lo confirma) → existe precedente de binario en repo.

## 1.2 `fastapi_app.py` (441 líneas · análisis puntual)

| Línea(s) | Elemento | Estado relevante para AI-R3 |
|---|---|---|
| 28-37 | import voz/psycopg2 | independiente de IA de imagen |
| 70-89 | `find_repo_root`, `MODELS_DIR` | detecta `*.h5`/`*.keras` por `glob`; **no contempla `*.onnx`** |
| 171-185 | `load_latest_model()` | TF Keras por `mtime` del `.h5` más reciente |
| 187-193 | `preprocess_image()` | `resize((224,224))` + `float32`, **sin normalización** (el `.h5` trae `Rescaling(1/127.5,-1)` interno) |
| 199-207 | `/health` | devuelve `tensorflow`, `voice`, `model_loaded`; **sin versión de contrato de modelo** |
| 210-276 | `/infer` | `model.predict()` → ya son **probabilidades**; responde `diagnosis="class_{idx}"`, `class_index`, `confidence`, `model`, `processing_time`, `status`; log JSONL |
| 279-389 | `/assist`, `/events` | autónomos |

**Dos diferencias críticas M2 vs `.h5`:**
1. **Preprocesado:** el `.h5` **no** normaliza (Rescaling interno); M2 **exige** `Resize(256)+CenterCrop(224)+Normalize(ImageNet)`. → hay que introducir una ruta de preprocesado distinta.
2. **Salida:** el `.h5` entrega **softmax**; el ONNX entrega **`logits` crudos** → AI-R3 debe aplicar `softmax` para conservar la semántica de `confidence`.

## 1.3 `requirements.txt` (210 B)

`fastapi==0.115.5 · uvicorn[standard]==0.32.0 · python-multipart · requests>=2.31 · numpy>=1.24 · Pillow>=10.0 · tensorflow-cpu>=2.15.0 · SpeechRecognition · gTTS · pydub · mysql-connector-python · psycopg2-binary · lcapy`
→ **no incluye `onnxruntime`.** `numpy`/`Pillow` ya están (necesarios para preprocesado y SDR).

## 1.4 `Dockerfile` (30 líneas)

`python:3.11-slim` → `COPY requirements.txt` → `pip install -r requirements.txt` → **`COPY . .`** → `EXPOSE 8081` → `CMD uvicorn fastapi_app:app`.
`.dockerignore` = `venv/ __pycache__/ *.pyc .pytest_cache/ .env`.
**Consecuencia:** todo lo que deba estar en la imagen ha de hallarse **dentro del contexto `./src/ai_models`** o **inyectarse por volumen**. El `model.onnx` vive en `benchmark/runs/M2_efficientnet_b0/exports/` → **fuera del contexto** (y ruta **gitignored**).

## 1.5 `onnxruntime`

- **No instalado** en ningún entorno del proyecto (confirmado en AI-R2).
- Disponible `onnxruntime` 1.31.0 (CPU). Wheel CPU ~decenas de MB, sin CUDA.
- API mínima: `InferenceSession(path, providers=["CPUExecutionProvider"])` + `sess.run(["logits"], {"input": x})`.

## 1.6 `model.onnx` (AI-R2 — `AI_R2_COMPLETE`)

| Campo | Valor |
|---|---|
| Ruta | `benchmark/runs/M2_efficientnet_b0/exports/model.onnx` (**gitignored**) |
| SHA-256 | `4BD657B363407D4012F013589A5469DCA57B9C5E347A9EA54E1F6E57A3274EC3` |
| Bytes | 16 102 181 |
| Input | `input` float32 `[batch,3,224,224]` (NCHW) |
| Output | `logits` float32 `[batch,16]` (**sin softmax**) |
| Opset / batch | 17 · dinámico |
| Paridad | G-NEW-A PASS · `argmax` 1.0 · `Δmacro_f1` 0.0 |
| Clases | **16** (`class_index_map` `ImageFolder` sorted) |

## 1.7 `contract_version`

- El `contract_version: "v1"` que aparece en `views.py` es el **contrato de respuesta del BACKEND** (contextos `telemetry`/`ai`), **no** un campo del `ai_service`.
- El backend (`SemanticPredictionResolver`) mapea **binario**: `0 → enferma`, `1 → sana`, resto → `unknown`, y fija `semantic_contract_version: "v1"`, `scientific_scope: binary_only`.
- El `ai_service` no expone ninguna versión de contrato de modelo en `/health`.
→ **AI-R3 debe AÑADIR (aditivo) un identificador de contrato de modelo**, p. ej. `model_contract_version` + `model_sha256`, sin romper los campos actuales.

## 2. Respuestas

### 2.1 Cómo sustituir el `.h5` histórico
- **No borrar el `.h5`** (regla `NADA DESAPARECE`): se conserva como artefacto histórico (`HISTORICAL`).
- Introducir **selección de backend por entorno** (`AI_BACKEND=onnx|tf|auto`, default `auto`).
  - `auto`: si existe un `.onnx` válido → ONNX; si no → `.h5` (comportamiento actual intacto).
- Extender el descubrimiento de `MODELS_DIR` para incluir `*.onnx`.
- La ruta `.h5` permanece **operativa y reversible** durante AI-R3 (ver §2.5).
- Retirar `tensorflow-cpu` del `requirements.txt` queda **fuera de AI-R3** (se propone como limpieza de AI-R4, tras validar).

### 2.2 Cómo cargar ONNX
```
import onnxruntime as ort
session = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
# contrato: input "input" [N,3,224,224] float32 -> output "logits" [N,16]
logits = session.run(["logits"], {"input": batch})[0]
probs  = softmax(logits)          # replicar semántica del .h5
idx    = int(probs.argmax()); confidence = float(probs.max())
```
- **Preprocesado M2:** `Resize(256) → CenterCrop(224) → ToTensor → Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])`, `float32`, `NCHW`.
- Verificar en carga: shape de entrada/salida y, opcionalmente, `sha256` contra el registrado.

### 2.3 Cambios mínimos
Solo `src/ai_models/`; **5 puntos**, ninguno en backend/frontend/CMSC:
1. `requirements.txt`: **+`onnxruntime`** (Pillow/numpy ya presentes).
2. `fastapi_app.py`: loader conmutable (`onnx`/`tf`/`auto`) + `MODELS_DIR` reconocer `*.onnx`.
3. `fastapi_app.py`: `preprocess_image` con rama M2 (normalización ImageNet) seleccionada por backend.
4. `fastapi_app.py`: `infer` → rama ONNX (`run` + `softmax`) conservando **exactamente** la forma de la respuesta (`diagnosis`, `confidence`, `class_index`, `model`, `processing_time`, `status`).
5. `/health`: añadir campos **aditivos** (`model_backend`, `model_contract_version`, `model_sha256`, `onnxruntime`) manteniendo `tensorflow`/`voice`/`model_loaded`.
- **Inyección del modelo** (§2.7): volumen read-only en `docker-compose.yml` (**G-NEW-C: no horneado**) o copia al contexto si se opta por hornear (menos recomendado).
- **CERO** cambios en `views.py`, `semantic_prediction_resolver.py`, frontend o CMSC.

### 2.4 Riesgos

| ID | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| R3-1 | **Espacio de clases 16 vs binario** en el backend (`CLASS_DEFINITIONS` 0=enferma,1=sana) → etiquetas semánticamente erróneas | 🔴 Alta | AI-R3 conserva la **forma** del contrato; el **mapeo semántico es AI-R4** (bump de `semantic_contract_version`). **Condición D3-B.** |
| R3-2 | **Preprocesado divergente** (`.h5` sin normalizar vs M2 ImageNet) | 🟠 Media | Dos ramas de `preprocess_image` atadas al backend activo; verificado en AI-R2 (paridad exacta con normalización). |
| R3-3 | **Logits vs softmax** (`confidence` correcta) | 🟠 Media | Aplicar `softmax` en la rama ONNX. |
| R3-4 | **Modelo fuera del contexto Docker** (`benchmark/runs` gitignored, `COPY . .`) | 🟠 Media | Volumen read-only `...:model.onnx:ro` + `AI_MODEL_PATH`; o copia explícita al contexto. **Condición D3-A.** |
| R3-5 | **Doble normalización** (jar Python/Pillow cambia resize) | 🟡 Baja | Fijar `Resize(256)`/`CenterCrop(224)` en preprocesado; no reusar el preprocesado del `.h5`. |
| R3-6 | Peso de imagen (si se retira TF) | 🟢 Baja | Quitar `tensorflow-cpu` solo en AI-R4; en AI-R3 coexisten ambos. |
| R3-7 | `onnxruntime` ausente en el build | 🟢 Baja | Pin en `requirements.txt`. |
| R3-8 | Healthcheck de compose espera `200` | 🟢 Baja | Mantener `/health` → `200` y campos previos. |
| R3-9 | Convivencia de modelos (`mtime`) | 🟡 Baja | Selección explícita por `AI_BACKEND`/`AI_MODEL_PATH`; no solo por `mtime`. |

### 2.5 Rollback
- **Sin migración de datos.** Tres niveles, de menor a mayor:
  1. **Runtime:** `AI_BACKEND=tf` (o retirar el volumen) → vuelve al `.h5`. Segundos, sin rebuild.
  2. **Imagen:** rebuild previo (`git revert` del bloque AI-R3 en `fastapi_app.py`/`requirements.txt`).
  3. **Contenedor:** `docker compose up -d --build ai_service` con la versión anterior.
- El `.h5` **nunca se elimina** → el estado anterior siempre es alcanzable.
- El ONNX (ruta gitignored) no afecta a git; revertirlo es trivial.

### 2.6 Health endpoint
Propuesta **aditiva** (compatibilidad hacia atrás):
```json
{
  "status": "ok",
  "tensorflow": true,
  "voice": true,
  "model_loaded": "model.onnx",
  "model_backend": "onnx",
  "onnxruntime": "1.31.0",
  "model_contract_version": "agriculture_v2_multiclass16",
  "model_sha256": "4BD657B3…74EC3"
}
```
- Conserva `tensorflow`, `voice`, `model_loaded` (el healthcheck `urlopen(...).status==200` sigue válido).
- `model_contract_version` permite al backend (AI-R4) **detectar** el espacio de clases sin adivinar.

### 2.7 Compatibilidad con Docker Oficial
- **Build context = `./src/ai_models`** + `COPY . .`: el `model.onnx` (en `benchmark/runs/…`) **no entra solo**.
- **Recomendado (G-NEW-C):** volumen read-only en `docker-compose.yml`:
  ```
  ai_service:
    environment:
      - AI_BACKEND=onnx
      - AI_MODEL_PATH=/app/models/model.onnx
    volumes:
      - ./benchmark/runs/M2_efficientnet_b0/exports/model.onnx:/app/models/model.onnx:ro
  ```
  → el binario **no se hornea** en la imagen; se inyecta en runtime. Coherente con `AI_SERVING_ONNX` y con la política de pesos fuera de git.
- **Alternativa (menos recomendada):** copiar `model.onnx` a `src/ai_models/production_models/` (dentro del contexto) → se hornearía y requeriría versionar un binario de 16 MB (como hoy el `.h5`).
- **No requiere** cambiar puertos, red ni dependencias del stack Docker Oficial. `/health` mantiene `200`.
- `Dockerfile` **no necesita cambios** si se usa volumen; sí lo necesita (añadir `onnxruntime`) vía `requirements.txt`.

### 2.8 `contract_version`
- **No tocar** el `contract_version: "v1"` del backend en AI-R3 (es el contrato EIARC de la respuesta del backend).
- **Añadir** en el servicio: `model_contract_version: "agriculture_v2_multiclass16"` (+ `model_sha256`).
- El bump de `semantic_contract_version` (binary → multiclass16) y el `CLASS_DEFINITIONS` de 16 clases son **AI-R4**, acoplados a esta nueva señal.

## 3. Diff mínimo propuesto (NO aplicado)
- `requirements.txt`: `+ onnxruntime` (línea nueva; resto intacto).
- `fastapi_app.py`: (a) `MODELS_DIR` reconoce `*.onnx`; (b) `load_latest_model()` conmutable por `AI_BACKEND`; (c) `preprocess_image(..., backend)`; (d) rama ONNX en `/infer` con `softmax`; (e) campos aditivos en `/health`. **Cambio neto ≈ +40/-8 líneas, sin tocar líneas de respuesta/log.**
- `docker-compose.yml`: bloque `ai_service` + `environment` (2 vars) + `volumes` (1 línea).
- **No** se tocan `views.py`, `semantic_prediction_resolver.py`, frontend, CMSC, KB, Docker Oficial (salvo el bloque `ai_service`), OCI ni SIGCT Memory.

## 4. Condiciones (decisiones previas a ejecutar)
- **D3-A · Inyección del modelo:** volumen read-only (recomendado, no horneado) vs copia al contexto.
- **D3-B:** `ai_service` servirá **M2 (16 clases)** conservando la **forma** de `/infer`; el **mapeo semántico** se difiere a **AI-R4** (obligatorio antes de que la UI muestre diagnóstico).
- **D3-C:** mantener `tensorflow-cpu` durante AI-R3 (convivencia) y retirarlo en AI-R4 (limpieza opcional).

## 5. Clasificación

**`AI_R3_READY`** (condicionado a **D3-A · D3-B · D3-C**).

Justificación: el cambio es **mínimo, localizado en `src/ai_models/`, aditivo y reversible**; el artefacto ONNX está
cerrado con paridad exacta (AI-R2); el contrato de `/infer` se conserva (la forma no cambia). La única frontera dura
es **semántica** (R3-1): servir M2 sin actualizar el resolver del backend produce etiquetas binarias erróneas → por eso
AI-R3 **habilita** el servir y **AI-R4** resuelve la semántica; ambas misiones deben coordinarse antes de **usar** el
diagnóstico en UI.

> Nota honesta: si se exigiera que el diagnóstico end-to-end quede correcto tras AI-R3 **en solitario**, la
> clasificación sería `AI_R3_NOT_READY` por R3-1. El plan adopta la separación de responsabilidades (R3=servir, R4=semántica)
> habilitada por `model_contract_version`.

## 5.1 No ejecutado
Sin implementación · sin modificación de código · sin `onnxruntime` instalado en el repo · sin cambios en `ai_service`/Docker/CMSC/KB/OCI/Memory · sin commits · sin push.
