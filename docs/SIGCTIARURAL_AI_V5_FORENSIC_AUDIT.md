# SIGCTiArural — AI V5 Forensic Audit

Estado: **REAL / AUDITORÍA** · Fecha: 2026-09-20 · Rama: `feature/ubtn-biological-telemetry`
Método: revisión de código fuente + estado de ejecución en el entorno actual (no se modificó nada).
Objetivo: determinar exactamente qué partes de **IA Predictiva V5** funcionan de verdad y cuáles son simulación.

---

## 1. Resumen ejecutivo

IA Predictiva V5 es un **flujo de tres capas reales** (Frontend React → Django REST → FastAPI+TensorFlow) que en el
entorno actual **no es ejecutable de punta a punta por estado de despliegue**, y que cuando ejecutó la inferencia de
verdad (auditoría empírica previa, 2026-07-16) el modelo **colapsa sistemáticamente a `class_0` con confianza ~0.99**
incluso ante entradas no vegetales.

- **Lo que ES REAL:** el código de la tubería completa (frontend → Django v3 → FastAPI `/infer` → TensorFlow → resolver semántico), el archivo `plant_disease_mbv2.h5`, y la ejecución real de TensorFlow.
- **Lo que ES SIMULACIÓN (por diseño, honesta en UI):** los modos `SIMULACIÓN` y `ROBOT DEMO` del frontend (escenarios `DEMO_SCENARIOS` locales, `model_version: demo-simulator`, sin llamada a backend).
- **Lo que ES CIENTÍFICAMENTE DEGENERADO:** el modelo binario cargado (`plant_disease_mbv2.h5`) colapsa a una sola clase; `class_1` es inalcanzable en la práctica.

---

## 2. Mapa de la tubería auditada

```text
AIPredictiva.jsx (Frontend React, /ai-predictive)
  ├─ Modo REAL: <input file> → POST {VITE_AI_INFERENCE_URL}
  │     VITE_AI_INFERENCE_URL = env o '/api/v3/ai/inference/'
  ├─ Modo SIMULACIÓN: DEMO_SCENARIOS (frontend, cada 9 s)
  └─ Modo ROBOT DEMO: DEMO_SCENARIOS (frontend, cada 12 s)

Django (src/backend, puerto 8010)
  └─ api/urls.py: v3/ai/inference/ → AIInferenceV3View (views.py:190)
        ├─ valida MIME (jpeg/png/webp) y campo 'file'
        ├─ ai_adapter = get_ai_inference_service() (= get_ai_service → FastAPIAIAdapter)
        ├─ FastAPIAIAdapter.predecir_enfermedad() → POST http://ai_service:8081/infer (retry 3×)
        └─ SemanticPredictionResolver.resolve_prediction(raw)

FastAPI (src/ai_models, puerto 8081)
  └─ POST /infer (fastapi_app.py:212)
        ├─ load_latest_model() → plant_disease_mbv2.h5 (TF o MOCK)
        ├─ preprocess_image() → 224×224 → mobilenet_v2.preprocess_input
        ├─ model.predict() → argmax → class_N / confidence
        └─ si falla → {status:"error", model:"fallback", diagnosis:"unknown", confidence:0}
```

---

## 3. Respuestas pregunta por pregunta

### 3.1. Qué ocurre al pulsar `INFERENCIA REAL`
`AIPredictiva.jsx:338-343` llama `activateMode('real')`. No hace ninguna llamada de red; solo conmuta el estado UI:
habilita el `<input type="file" accept="image/*">` y el botón `EJECUTAR ANÁLISIS` (`:399-423`). Si no hay archivo
seleccionado, el botón queda `disabled`. La inferencia real **requiere siempre un POST posterior**.

### 3.2. Qué endpoint se llama
`AIPredictiva.jsx:3`:
`AI_INFERENCE_URL = import.meta.env.VITE_AI_INFERENCE_URL || '/api/v3/ai/inference/'`.
- Dev (Vite 5173): `<input>` → fetch `/api/v3/ai/inference/` → **proxy Vite a** `http://localhost:8010` (vite.config.js).
- Docker build: `VITE_AI_INFERENCE_URL=http://localhost:8010/api/v3/ai/inference/` (docker-compose.yml:92).
Método `POST`, `FormData` con `file` + `client_context=aipredictiva`.

### 3.3. Qué backend responde
El **microservicio Django** (`src/backend`, contenedor `sigctiarural_backend`, 8010) responde la ruta:
`path('v3/ai/inference/', AIInferenceV3View.as_view())` (api/urls.py:42).
`AIInferenceV3View` (api/views.py:190) delega en el adaptador que a su vez llama al **segundo backend**: FastAPI.

### 3.4. Qué archivo carga `plant_disease_mbv2.h5`
`fastapi_app.py:171-185` `load_latest_model()`:
- Busca `*.h5`/`*.keras` en `MODELS_DIR` (contenedor `/production_models` o `src/ai_models/production_models`).
- Carga el más reciente con `tf.keras.models.load_model(latest, compile=False)`.
- Estado real (2026-09-20): `plant_disease_mbv2.h5` existe, 9.431.432 bytes, mtime 2026-08-21.

### 3.5. Si TensorFlow ejecuta realmente
- `fastapi_app.py:164-169`: intenta `import tensorflow as tf` → `TF_AVAILABLE`.
- Si `TF_AVAILABLE && model is not None` → `model.predict(processed)` real (`:231-235`).
- **Sí ejecuta de verdad cuando el contenedor `ai_service` está levantado** (requirements: `tensorflow-cpu>=2.15.0`).
- Si TF no está instalado → `TF_AVAILABLE=False` y preprocess usa `(arr/127.5)-1.0`; `/infer` devuelve
  `diagnosis:"unknown", confidence:0.0, class_index:-1, status:"error"` (MOCK).

### 3.6. Si existe fallback demo (backend)
**NO existe fallback demo con diagnóstico inventado.** El bloque `except` de `/infer` (`:269-278`) devuelve
`{diagnosis:"unknown", confidence:0.0, class_index:-1, model:"fallback", status:"error", detail}`.
- Verificado: el fallback legacy `Tomato_Early_blight 0.87` **ya no está** en `fastapi_app.py` (corregido en revisión EIARC).
- Existe **fallback de disponibilidad** en el adaptador: `FastAPIAIAdapter.predecir_enfermedad` captura
  `requests.RequestException`/`ValueError` y devuelve `{error:"Error conectando con IA Service: …"}` (fastapi_ai_adapter.py:17-32).

### 3.7. Si existe demo-simulator
**No como servicio.** `demo-simulator` es una **constante de metadatos del frontend**:
`buildDemoInfo` (`AIPredictiva.jsx:167`) asigna `model_version:'demo-simulator'`,
`scientific_scope:'demonstration_only'`, `prediction_code:'demo.*'`. Solo se usa en modos `SIMULACIÓN` y `ROBOT DEMO`.

### 3.8. Qué ocurre al cargar una imagen
`handleFileSelect` (`:202-211`): fija `analysisMode='real'`, guarda el archivo, crea `URL.createObjectURL(file)` como
preview y limpia resultados previos. Al pulsar `EJECUTAR ANÁLISIS` → `handleUpload` (`:230-271`): arma FormData, hace
`fetch` POST y espera JSON. Si `response.ok` → `setResult` + `processOfficialPrediction`. Si `!ok` o `data.error` →
muestra `err.message`. No hay validación previa de contenido visual en el navegador (solo `accept="image/*"`).

### 3.9. Qué ocurre si la imagen NO es una planta
No existe ningún clasificador de "no-planta" en la tubería. Cualquier imagen se preprocesa a 224×224 y entra al modelo.
Evidencia empírica (2026-07-16, `docs/ai/research_v2/AI_PREDICTION_VALIDATION_AUDIT.md`):
- `test_leaf.jpg` → `class_0` con **0.9953** · `solid_red.jpg` (sintética) → `class_0` con **0.9954** · `checker.jpg` (no vegetal) → `class_0` con **0.9876**.
- `class_1` nunca fue observada; el modelo presenta **colapso monoclasse** → toda imagen se reporta como
  "Condición no saludable detectada" (`health_state: warning`).

### 3.10. Qué ocurre si el backend IA está apagado
- Estado verificado 2026-09-20: `sigctiarural_backend` y `sigctiarural_ai_service` están **Exited (255) 3 días**;
  solo `postgres`/`mysql` corren. El puerto 8010 y 8081 **no escuchan** (5173 = Vite dev).
- **Caso A (Django caído):** el `fetch` no conecta → `catch` → `setError(err.message)`, sin resultado.
- **Caso B (Django OK, FastAPI caído):** el adaptador reintenta 3 veces y devuelve `{error:"Error conectando con IA Service"}`
  → `AIInferenceV3View` responde **502** `source_mode:"fallback"`, código `ai_inference_unavailable` → el frontend muestra error.

### 3.11. Diferencia `SIMULACIÓN` vs `INFERENCIA REAL`

| Aspecto | INFERENCIA REAL | SIMULACIÓN |
|---|---|---|
| Entrada | Imagen del usuario (FormData) | `DEMO_SCENARIOS` fijos del frontend |
| Llamada de red | Sí: `/api/v3/ai/inference/` → Django → `/infer` | **No** (depende el `useEffect` de `:273-313`) |
| Modelo | `plant_disease_mbv2.h5` ejecutado por TF | `model_version:'demo-simulator'` |
| subject | `source_mode:'cloud'/simulated/fallback` según estado | `source_mode:'simulation'` |
| Resultado | Depende del modelo real | Confianzas fijas (0.9721 / 0.9644), imágenes de Wikimedia |
| Honestidad UI | Trazabilidad completa (prediction_code, raw_class_index…) | Aviso "Este modo es demostrativo" |

### 3.12. Diferencia `ROBOT DEMO` vs `SIMULACIÓN`
Ambos usan **el mismo** `DEMO_SCENARIOS` y **no llaman backend**. Diferencias solo de presentación:
- Intervalo de ciclo: SIMULACIÓN cada **9 s** (`:306`); ROBOT DEMO cada **12 s**.
- Estética: SIMULACIÓN = badge amarillo; ROBOT DEMO = badge rojo/ping (`:391-393`, `getModePresentation`).
- `source_mode`: `'simulation'` vs `'robot_demo'`.
- El `useEffect` de demo está **activo en ambos** (`:275`: `analysisMode === 'simulation' || 'robot_demo'`).
No hay robot real ni llamada a rosmaster/tópicos; es otro simulacro de escenarios con distinta máscara visual.

---

## 4. Clasificación final

### VERDE — Funciona (real, verificable)
| Elemento | Evidencia |
|---|---|
| Enrutado v3 Django → `AIInferenceV3View` + contrato v1 | views.py:190-262, urls.py:42 |
| Validación de archivo/MIME en backend | views.py:192-221 |
| Adaptador hacia FastAPI con retry (tenacity 3×) | fastapi_ai_adapter.py:34-42 |
| FastAPI `/infer` con carga real de modelo y `predict()` | fastapi_app.py:171-278 |
| Resolver semántico data-driven (class_0/class_1, contratos EIARC) | semantic_prediction_resolver.py, commits `565ad2e`,`57a40c4` |
| Tests del resolver y adaptador | tests/test_semantic_prediction_resolver.py, tests/test_adapters_infra.py |
| Modos demo del frontend (simulación honesta, aviso explícito) | AIPredictiva.jsx:273-313 |

### AMARILLO — Parcial / dependiente de despliegue
| Elemento | Motivo |
|---|---|
| Inferencia real de punta a punta | Envía el flujo completo pero **hoy no corre**: contenedores backend/ai_service detenidos |
| `source_mode:'cloud'` | El resolver lo etiqueta así solo si `model != mock/fallback` y status ok; depende de TF cargado |
| TF disponible | Solo si `tensorflow` instalado en el contenedor de IA |

### ROJO — Simulado / degenerado
| Elemento | Motivo |
|---|---|
| **Modelo binario `plant_disease_mbv2.h5`** | Colapso monoclasse auditado: `class_1` inalcanzable, confianza 0.9876–0.9954 incluso en imágenes no vegetales → no hay discriminación científica |
| `SIMULACIÓN` y `ROBOT DEMO` | Escenarios sintéticos `demo-simulator` sin backend (por diseño, honesto en UI) |
| Indicador "● SISTEMA ONLINE" del header (`AIPredictiva.jsx:333`) | Es estático; no consulta `/health` → puede decir ONLINE con backend caído |

---

## 5. Respuesta final

**¿Qué hace realmente hoy la IA Predictiva V5?**
Un pipeline de tres capas reales y bien diseñado (Frontend → Django v3 → FastAPI/TensorFlow) cuyo único modelo
materializado, `plant_disease_mbv2.h5`, **es un clasificador binario degenerado**: no discrimina sano/enfermo de forma
útil porque colapsa a `class_0` con confianza ~0.99 ante cualquier entrada. En el entorno actual tampoco es ejecutable
de punta a punta porque los contenedores `sigctiarural_backend` y `sigctiarural_ai_service` están detenidos.

**¿Qué es real?**
La ingeniería (código, contratos, resolver, tests, endpoínts v3) y el modelo entrenado pegado a TensorFlow.

**¿Qué es simulación?**
Los modos `SIMULACIÓN` y `ROBOT DEMO` (únicos netamente simulados, y así declarados en UI), y el badge estático de estado.

**¿Qué falta para que una fotografía de una planta produzca una inferencia científica real?**
1. **Un modelo no colapsado** (p.ej. el multiclase de Dataset V2, 16 clases, entrenado con macro-F1/ECE) que reemplace al binario degenerado.
2. **Un mecanismo de rechazo no-planta / OOD** (el actual no puede distinguir "no es planta").
3. **Despliegue y levantamiento de los contenedores** backend + ai_service (y `/health` real conectado al badge UI).
4. Datasets físicos + ground truth etiquetado: sin datos, el modelo real seguirá sin tener evidencia científica (cuello de botella = DATA, según `SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md`).
5. Revisitación de `SemanticPredictionResolver.get_class_definitions()` para leer `model_metadata.json` dinámicamente en lugar del mapa binario hardcodeado (TODO ya señalado en código).

---

## 6. Archivos auditados
- `src/frontend/src/pages/AIPredictiva.jsx` (583 líneas)
- `src/backend/api/views.py` (330 líneas) · `src/backend/api/urls.py`
- `src/backend/infrastructure/config/dependencies.py` · `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`
- `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py`
- `src/ai_models/fastapi_app.py` (443 líneas) · `src/ai_models/Dockerfile` · `src/ai_models/requirements.txt`
- `src/ai_models/production_models/plant_disease_mbv2.h5` (9.431.432 B) · `model_metadata.json`
- `docker-compose.yml` · `src/frontend/vite.config.js` · `.env`
- Referencia previa: `docs/ai/research_v2/AI_PREDICTION_VALIDATION_AUDIT.md` · `docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md`