# IA PREDICTIVA — F4 EXECUTION REPORT

> **Proyecto:** SIGCT-Rural
> **Misión:** `IA_PREDICTIVA_F4_EXECUTION`
> **Base:** `IA_PREDICTIVA_F0_F3_REPORT` (bug confirmado en `fastapi_app.py:192`)
> **Alcance:** ejecutar **solo F4** (corregir la doble normalización) + pruebas controladas.
> **Restricciones respetadas:** NO tocar CMSC/Dashboard/KH/Hardware/Labs/Dataset/Bridge/frontend/PostgreSQL/arquitectura · NO commits · NO push.
> **Fecha:** 2026-10-13

---

## 1. Cambio realizado

**Archivo único:** `src/ai_models/fastapi_app.py` — función `preprocess_image` (`:187-195`).

```diff
 def preprocess_image(img_data: bytes, target_size=(224, 224)):
+    # El modelo ya incluye Rescaling(1/127.5, -1): recibe [0,255] y normaliza internamente.
+    # No aplicar segunda normalización aquí (evita el bug de doble normalización).
     image = Image.open(io.BytesIO(img_data)).convert("RGB")
     image = image.resize(target_size)
-    arr = np.array(image)
-    if TF_AVAILABLE:
-        arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
-    else:
-        arr = (arr / 127.5) - 1.0
+    arr = np.array(image).astype("float32")
     return np.expand_dims(arr, axis=0)
```

**Justificación verificada:** la capa interna del modelo es
`Rescaling(scale=0.00784313725490196 = 1/127.5, offset=-1)` ⇒ el modelo **espera `[0,255]`**.
El entrenamiento (`train_plant_disease_mobilenet.py:26`) también usa `Rescaling` e
`image_dataset_from_directory` (entrada `[0,255]`) — **nunca** `preprocess_input`.
Por tanto había **dos** normalizaciones; se eliminó la de inferencia y queda **una sola** (la interna).

- `AI_SERVICE_URL` sin cambios (default `http://ai_service:8081` correcto en Docker).
- `backend` no tocado · PostgreSQL no tocado · ningún otro archivo modificado.
- Rebuild: `docker compose up -d --build ai_service` (sin volumen ⇒ requiere `--build`).

**Evidencia del fix:** la sonda post-fix reporta `pre_range 0.0 255.0` (antes: `-1.0 1.0`), es decir, ahora se entrega `[0,255]` crudo.

---

## 2. Resultado health

```
GET :8081/health -> 200
{"status":"ok","tensorflow":true,"voice":true,"model_loaded":"plant_disease_mbv2.h5"}
```
✅ Sin cambios respecto al estado operativo (modelo cargado, TF activo).

---

## 3. Resultado inferencia (E2E)

```
POST :8010/api/v3/ai/inference/  (-F file=@src/ai_models/test_leaf.jpg)
```
Respuesta (contrato EIARC intacto):
```json
{"context":"ai","operation":"plant_diagnosis",
 "prediction":{"prediction_code":"plant_condition.binary.unhealthy",
               "confidence":0.9555,
               "model_version":"plant_disease_mbv2",
               "semantic_contract_version":"v1",
               "scientific_scope":"binary_only"},
 "trace":{"provider":"fastapi_ai_service","raw_diagnosis":"class_0",
          "raw_class_index":0,"processing_time":"2.31s","upstream_status":"ok"}}
```
✅ La cadena `backend → adapter → ai_service → modelo → resolver` **opera** y devuelve `200` con contrato válido.

---

## 4. Resultado prueba de degeneración

Sonda read-only (4 imágenes mutuamente extremas) **después** del fix:

| Imagen | pre_range | argmax | conf | probs |
|--------|:---------:|:------:|:----:|-------|
| red   | 0.0 – 255.0 | **0** | 0.9993 | [0.9993, 0.0007] |
| blue  | 0.0 – 255.0 | **0** | 0.8782 | [0.8782, 0.1218] |
| white | 255.0 – 255.0 | **0** | 0.8652 | [0.8652, 0.1348] |
| black | 0.0 – 0.0 | **0** | 0.9951 | [0.9951, 0.0049] |

**Comparación pre/post F4:**

| | pre_range (entrada al modelo) | argmax (4 imágenes) | resultado |
|--|:-----------------------------:|:-------------------:|-----------|
| **Antes (F0–F3)** | `-1.0 .. 1.0` doblemente normalizado → banda real ~`-1.008..-0.992` | 0 en las 4 | degenerado |
| **Después (F4)** | `0.0 .. 255.0` (una sola normalización, la interna) | **0 en las 4** | **sigue degenerado** |

**Lectura honesta:**
- ✅ El **bug de doble normalización quedó corregido**: el modelo recibe ahora `[0,255]` y aplica su `Rescaling` una sola vez.
- ❌ El **modelo NO discrimina**: 4 entradas mutuamente distintas (rojo/azul/blanco/negro) siguen dando `class_0`. La `confidence` varía (0.865–0.999) pero **nunca cruza a `class_1`**.
- Causa: el modelo es **subentrenado/degenerado** (`--epochs` default = **3**, `train_plant_disease_mobilenet.py:49`). La doble normalización era **un** defecto; el modelo tiene **otro** (calidad de entrenamiento). ⇒ Escala a **`MAJOR_FIX`** (reentrenar con dataset real y validar).

---

## 5. Clasificación final

## `IA_PARCIAL`

**Razón:** la **infraestructura de IA es real y quedó operativa** (servicios `backend`+`ai_service` arriba, endpoint `:8010` con contrato EIARC válido, `health` OK, **bug de doble normalización corregido y verificado**, cadena E2E funcional). Pero la **capacidad predictiva no es confiable**: el modelo no discrimina (colapso a `class_0`), por lo que sus resultados **no son científicamente válidos**.

- No es `IA_NO_OPERATIVA`: el pipeline opera y el defecto de código del reporte anterior quedó resuelto.
- No es `IA_REAL`: las predicciones no son discriminativas ni validadas.
- No es `IA_SIMULADA`: no hay datos demo; la inferencia es real (solo que el modelo es degenerado).

**Próximo (fuera de F4):** `MAJOR_FIX` = reentrenar/reemplazar el modelo (dataset balanceado, ≥15–30 épocas, `validation_metrics.json` + `model_card.md`), mantener `scientific_scope: binary_only` y **no publicar `confidence`** como válida hasta revalidar.

---

## Estado y aislamiento

| Ítem | Estado |
|------|--------|
| Código modificado | **Solo** `src/ai_models/fastapi_app.py` (+ `.dockerignore` preexistente, ajeno) |
| CONTENEDORES SIGCT | `backend`(8010) · `ai_service`(8081) · `postgres`(5544) · `mysql`(3316) — Up |
| CMSC/Dashboard/Labs/Hardware/KH/Dataset/Bridge/frontend/PostgreSQL | **No tocados** |
| `stash@{0}` | Intacto |
| Commits / push | **Ninguno** |
| Sonda temporal | Eliminada (host y contenedor) |

*Sí se modificó código (1 archivo) y se ejecutaron pruebas controladas. Sin commits, sin push.*
