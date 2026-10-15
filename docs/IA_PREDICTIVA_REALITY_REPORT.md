# IA PREDICTIVA — REALITY REPORT

> **Proyecto:** SIGCT-Rural
> **Misión:** `IA_PREDICTIVA_REALITY_AUDIT`
> **Objeto:** `src/frontend/src/pages/AIPredictiva.jsx` y su cadena de inferencia
> **Naturaleza:** SOLO auditoría/lectura. **No se modificó código. Sin commits. Sin push.**
> **Fecha:** 2026-10-13
> **Hallazgo humano de origen:** la interfaz carga y renderiza, pero la funcionalidad de IA no es operativa.

---

## 0. Resumen

`AIPredictiva.jsx` es una página React de 585 líneas, con 3 modos (`real`, `simulation`, `robot_demo`) y una ruta activa `/ai-predictive` (`App.jsx:120`). La UI funciona; los modos demo funcionan (datos locales). **El modo `real` (la IA predictiva propiamente dicha) NO es operativo hoy**: los dos servicios de los que depende —Backend Django `:8010` y AI Service FastAPI `:8081`— **no están en ejecución**, y el modelo productivo está **descalificado por un defecto de normalización**.

**Clasificación final:** **`IA_NO_OPERATIVA`**.

---

## 1. Arquitectura de la cadena (diseño real)

```
Navegador (AIPredictiva.jsx, modo 'real')
   │  POST multipart 'file' + client_context=aipredictiva
   ▼
Frontend Vite dev  →  proxy '/api' → http://localhost:8010   (vite.config.js:25-30)
   ▼
Backend Django  POST /api/v3/ai/inference/                    (api/urls.py:43 · views.py:330)
   │  get_ai_inference_service() → FastAPIAIAdapter
   ▼
Adapter requests.post  {AI_SERVICE_URL}/infer                 (fastapi_ai_adapter.py:15,36)
   │  AI_SERVICE_URL default = 'http://ai_service:8081'       (fastapi_ai_adapter.py:15)
   ▼
AI Service FastAPI  POST /infer → plant_disease_mbv2.h5       (fastapi_app.py:212)
   ▲
   └── SemanticPredictionResolver (class_0/1 → semántica binaria)  (semantic_prediction_resolver.py)
```

La cadena es **arquitectónicamente real** (no simulada), pero tiene **dos eslabones caídos en runtime** y un **defecto de modelo**.

---

## 2. Modos de la página

| Modo | Origen de datos | Red | Estado |
|------|-----------------|-----|--------|
| `real` | `plant_disease_mbv2.h5` vía `/api/v3/ai/inference/` | **Sí** | **No operativo** (servicios caídos) |
| `simulation` | `DEMO_SCENARIOS` (constante local) | No | Funciona (demo declarada) |
| `robot_demo` | `DEMO_SCENARIOS` (misma fuente) | No | Funciona (demo declarada) |

- Modos declarados en `AIPredictiva.jsx:5-9`.
- `real`: `handleUpload()` (`AIPredictiva.jsx:230-271`) hace `fetch(AI_INFERENCE_URL, POST FormData)`.
- `simulation`/`robot_demo`: `useEffect` con `setInterval` que rota `DEMO_SCENARIOS` (`AIPredictiva.jsx:273-313`), sin red.
- `DEMO_SCENARIOS` (`AIPredictiva.jsx:11-36`): 2 escenarios hardcodeados (`class_0` conf 0.9721, `class_1` conf 0.9644) con imágenes de **Wikimedia Commons**.

---

## 3. Endpoints consumidos / expuestos

| Endpoint | Dónde | Estado en código | Estado en runtime |
|----------|-------|------------------|-------------------|
| `POST /api/v3/ai/inference/` (consumido por el front) | `AIPredictiva.jsx:3,239` | Definido (`api/urls.py:43`, `views.py:330`) | **No responde** (backend caído) |
| `POST {AI_SERVICE_URL}/infer` (backend→IA) | `fastapi_ai_adapter.py:36` | Definido | **No responde** (servicio caído) |
| `GET /api/v3/ai/crop-advice/` | `api/urls.py:34` | Definido | No responde |
| `GET /api/v3/telemetry/history/` | `api/urls.py:33` | Definido | No responde |
| `POST /api/v3/telemetry/readings/` | `api/urls.py:35` | Definido | No responde |
| `GET /health` (IA) | `fastapi_app.py:201` | Definido | No responde |
| `POST /assist` (voz) | `fastapi_app.py:293` | Definido | No responde |

---

## 4. Runtime — Docker

- `docker ps` en el entorno: **solo** `sigctiarural_postgres_db` y `sigctiarural_mysql_db` están arriba.
- **NO hay contenedores** `sigctiarural_backend`, `sigctiarural_ai_service`, `sigctiarural_frontend`.
- `docker-compose.yml` sí define `backend` (`:8010→8000`, líneas 45-67) y `ai_service` (`:8081`, líneas 68-83), pero **no están levantados**.
- El frontend que renderiza es un **Vite dev server en `:5173`** (proceso node escuchando), no un contenedor.

---

## 5. Runtime — Backend / AI Service (verificación en vivo)

Pruebas HTTP ejecutadas en el runtime actual:

| Prueba | Resultado |
|--------|-----------|
| `GET  http://localhost:8081/health` | **ECONNREFUSED** (no conecta) |
| `POST http://localhost:8010/api/v3/ai/inference/` | **ECONNREFUSED** |
| `GET  http://localhost:8010/api/v3/ai/crop-advice/` | **ECONNREFUSED** |
| `GET  http://localhost:8010/api/v3/telemetry/history/` | **ECONNREFUSED** |
| `GET  http://localhost:5173/` | **200 OK** (el front sí responde) |

**Interpretación:** el frontend está arriba; **Backend y AI Service están caídos**. En consecuencia, `fetch('/api/v3/ai/inference/')` recorre el proxy de Vite hacia `localhost:8010` y falla por conexión rechazada → la UI muestra "No fue posible completar la inferencia oficial."

---

## 6. Estado del modelo productivo (defecto confirmado)

- Archivo: `src/ai_models/production_models/plant_disease_mbv2.h5` (**9,43 MB, real**, no vacío).
- Metadatos: `{"classes": ["enferma","sana"], "framework":"tensorflow_fixed"}` (`model_metadata.json`).
- Entrenamiento: `train_plant_disease_mobilenet.py` — MobileNetV2 congelada + `Dense(2, softmax)`, **3 épocas** (`:49`).

### Defecto de doble normalización (root cause) 🔴

- **Entrenamiento:** el modelo **incluye** `layers.Rescaling(scale=1./127.5, offset=-1)` como primera capa (`train_plant_disease_mobilenet.py:26`). Por tanto el modelo espera entrada cruda **`[0, 255]`** y normaliza internamente a `[-1, 1]`.
- **Inferencia:** `preprocess_image` aplica **además** `tf.keras.applications.mobilenet_v2.preprocess_input(arr)` (`fastapi_app.py:192`), que también mapea `[0,255] → [-1,1]`.
- **Resultado:** doble normalización → la entrada real queda fuera de la distribución de entrenamiento → **predicción degenerada** (colapsa a una sola clase). El modelo es **`ROTO`/descalificado**: la `confidence` que devuelve (p. ej. 0.97) **no es científicamente válida**.

Evidencia cruzada: `train_plant_disease_mobilenet.py:26` (Rescaling interno) vs `fastapi_app.py:187-195` (preprocess doble).

---

## 7. Coherencia de configuración de la cadena

- `AI_SERVICE_URL` **no está definida** en ningún `.env` ni en `docker-compose.yml`. El adapter usa el default `http://ai_service:8081` (`fastapi_ai_adapter.py:15`), hostname **resoluble solo dentro de la red Docker**.
- El backend (compose) **no declara** `AI_SERVICE_URL` en su bloque `environment` (`docker-compose.yml:54-63`), pero al estar en la misma red que `ai_service` el default funciona **en Docker**.
- En ejecución **local (host)** el hostname `ai_service` **no resuelve** → el adapter devuelve `error` → el view responde **502 `ai_inference_unavailable`**.
- Dependencias presentes: `requests` y `tenacity` están en `src/backend/requirements.txt` → el guard `AI_INFERENCE_V3_AVAILABLE` (`views.py:92-99`) debería activar la ruta.

---

## 8. Expectativa funcional (diseño vs realidad)

| Expectativa (diseño) | Realidad hoy |
|----------------------|--------------|
| Subir imagen de hoja → diagnóstico binario honesto (`enferma`/`sana`) con `confidence`, `model_version`, `scientific_scope: binary_only` | **No ocurre**: servicios caídos + modelo descalificado |
| Contrato EIARC `prediction`/`trace` con `source_mode` | Implementado en código, no ejercitable en runtime |
| Modos demo declarados como demostrativos | **Cumple** (UI lo declara) |

---

## Respuestas A–G

## A. Qué funciona
- La página `AIPredictiva.jsx` renderiza completa (header, panel de imagen, panel de diagnóstico, trazabilidad); ruta `/ai-predictive` activa.
- Los modos **`simulation`** y **`robot_demo`** operan (datos locales, animación, TTS del navegador).
- El flujo de UI del modo `real` (selector de archivo, preview, botón, manejo de errores, barra de confianza 0–100 %) está implementado.
- **En el código**: el endpoint backend, el adapter, el resolver semántico, el endpoint FastAPI `/infer` y el archivo de modelo `.h5` existen y están completos.

**B. Qué no funciona**
- **El modo `real` no funciona.** Backend `:8010` y AI Service `:8081` están **caídos** (ECONNREFUSED verificado).
- No hay contenedores `backend` ni `ai_service` levantados.
- El modelo productivo es **degenerado** (doble normalización) → aunque todo estuviera arriba, la inferencia sería **no confiable**.
- La cadena está rota en **2 de 3 saltos operativos** (backend caído; ai_service caído) y **1 defecto de modelo**.

---

## C. Qué es simulación
- Modos `simulation` y `robot_demo`: `DEMO_SCENARIOS` locales (`AIPredictiva.jsx:11-36`), sin red, con imágenes de Wikimedia y confidences ficticias (0.97/0.96). Se autodeclaran demostrativos en la UI.

## D. Qué es demo
- `robot_demo` (mismo mecanismo que `simulation`, con badge rojo). No hay robot real ni telemetría involucrada.
- Los valores de `confidence` de los escenarios demo son constantes de demostración, no medidas.

## E. Qué es IA real
- **En arquitectura/código:** el pipeline `AIPredictiva → POST /api/v3/ai/inference/ → adapter → FastAPI /infer → plant_disease_mbv2.h5` es una cadena de inferencia real (no simulada), con contrato EIARC (`prediction`/`trace`) y resolver semántico.
- **En operación:** no existe IA real funcional hoy. El modelo está descalificado y los servicios están caídos. Es una IA **real-en-código, no-operativa-en-runtime y con modelo roto**.

## F. Qué servicio falta
1. **AI Service FastAPI (`:8081`)** — no está corriendo (contenedor `ai_service` no levantado). **Faltante operativo #1.**
2. **Backend Django (`:8010`)** — no está corriendo (contenedor `backend` no levantado). **Faltante operativo #2.**
3. Contenedores `backend` y `ai_service` de `docker-compose.yml` (levantar el stack completo).
4. Config: `AI_SERVICE_URL` no definida (depende del default `http://ai_service:8081`, válido solo intra-Docker).

## G. Qué debe corregirse
1. **Levantar la infraestructura runtime**: `backend` y `ai_service` (docker compose up o equivalente). Sin esto, el modo `real` jamás funcionará.
2. **Corregir la doble normalización** (una sola, coherente con el entrenamiento):
   - Opción A: en `fastapi_app.py:192`, dejar de aplicar `mobilenet_v2.preprocess_input` (el modelo ya hace `Rescaling` internamente).
   - Opción B: quitar el `Rescaling` del modelo y reconstruirlo sin reentrenar (pierde los pesos aprendidos sobre esa capa; no recomendado).
   - Recomendado: **Opción A** (cambio mínimo en inferencia, sin reentrenar).
3. **Revalidar el modelo**: fue entrenado con 3 épocas (`train_plant_disease_mobilenet.py:49`) y con un defecto de inferencia; recalcular métricas reales y **no publicar `confidence` como válida** hasta verificarlo. Declarar honestamente su estado (`ROTO`/descalificado) mientras no se valide.
4. **Definir `AI_SERVICE_URL`** explícita por entorno (host dev vs Docker) para que el backend alcance el servicio en cualquier runtime.
5. **Honestidad de estados**: el front ya degrada con mensaje de error en modo `real`; mantener esa degradación y evitar cualquier apariencia de resultado científico cuando la cadena no esté verificada.
6. Menor: `SemanticPredictionResolver._resolve_source_mode` puede devolver `"cloud"` para un modelo local (`semantic_prediction_resolver.py:116`) — semántica confusa, no crítica.

---

## Clasificación (una sola)

**`IA_NO_OPERATIVA`**

Justificación: la interfaz y los modos demo son funcionales, pero la **funcionalidad de IA predictiva real no opera** (Backend y AI Service caídos en runtime; cadena rota; modelo productivo descalificado por doble normalización). No es `IA_REAL` (no funciona), no es `IA_PARCIAL` (ningún componente de IA real funciona hoy), y no es `IA_SIMULADA` (la arquitectura de inferencia es real, no fabricada).

---

## Evidencia (archivos / líneas)

- `src/frontend/src/pages/AIPredictiva.jsx:3` (URL default), `:5-9` (modos), `:11-36` (demo), `:230-271` (real), `:273-313` (simulación/demo).
- `src/frontend/src/App.jsx:120` (`/ai-predictive`).
- `src/frontend/vite.config.js:25-30` (proxy `/api` → `localhost:8010`).
- `src/backend/api/urls.py:40-46` (ruta inference) · `:30-38` (V3).
- `src/backend/api/views.py:92-99` (guard `AI_INFERENCE_V3_AVAILABLE`) · `329-402` (`AIInferenceV3View`).
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py:15,36` (URL/`/infer`).
- `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py` (mapeo binario).
- `src/ai_models/fastapi_app.py:187-195` (preprocess), `:192` (bug), `:212-278` (`/infer`).
- `src/ai_models/train_plant_disease_mobilenet.py:26,49` (Rescaling interno, 3 épocas).
- `src/ai_models/production_models/{plant_disease_mbv2.h5,model_metadata.json}`.
- `docker-compose.yml:45-67` (backend), `:68-83` (ai_service), `:84-99` (frontend).
- Runtime: `docker ps` (solo `sigctiarural_postgres_db` y `sigctiarural_mysql_db`); puertos `8010/8081` sin escucha; `5173` = Vite dev.
