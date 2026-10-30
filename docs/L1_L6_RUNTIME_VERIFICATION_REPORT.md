# L1_L6_RUNTIME_VERIFICATION_REPORT

**Misión:** `L1_L6_RUNTIME_VERIFICATION` — verificación runtime exclusiva de V-10..V-19 y de los 11 puntos de comprobación.
**Fecha:** 2026-10-30 (runtime ejecutado sobre imágenes reconstruidas).
**Modo:** solo verificación runtime. Sin diseño, sin auditoría, sin refactor, sin IA-R3/IA-R4/IA-R5, sin modificación de código, sin commits, sin push.

## 0. Veredicto en una línea

**NOT_VERIFIED** — el runtime (Docker, `/health`, envelope v3, fallback 502, suites backend/ai_service) está **completamente verde (V-10..V-16 y V-19 PASS)**, pero **V-17 y V-18 no pasan completamente** porque `ModelPredictCell.jsx` conserva el literal `"Inferencia real finalizada."` y no renderiza el badge de procedencia, deuda declarada en `L1_L6_EXECUTION_REPORT.md` §1.1 (L-3b/L-4c no ejecutados). La clasificación honesta es `NOT_VERIFIED`.

## 1. Entorno de ejecución (evidencia)

- Daemon Docker: `Server 29.9.2`, 19 contenedores.
- `docker compose config --quiet` → exit 0 · servicios resueltos: `db`, `backend`, `ai_service`, `frontend` (V-19 PASS).
- Imágenes reconstruidas en esta sesión:
  - `sigctiarural-ai_service:latest` (3.97 GB) — reconstruida (apt + pip, incluye `model_identity.py` y `test_model_identity.py`).
  - `sigctiarural-backend:latest` (791 MB) — reconstruida (cache idéntico al código actual; `COPY . .` sin cambios).
  - `sigctiarural-frontend:latest` (124 MB) — reconstruida (`npm run build`, 5485 módulos, incluye `AIPredictiva.jsx` y `VoiceAssistant.jsx` nuevos).
- Stack tras `docker compose up -d`: `db` healthy, `backend` healthy, `ai_service` healthy, `frontend` healthy. Todos `Up` y sanos tras 30 s (V-13 PASS).

## 2. Validaciones V-10..V-19

| Validación | Resultado | Evidencia |
|---|---|---|
| **V-10** `/health` | **PASS** | `HTTP 200`. Claves: `model_status=HISTORICO`, `model_sha256=77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0`, `artifact_id=plant_disease_mbv2@77b0efec`, `class_space=2`, `class_labels=["enferma","sana"]`, `scientific_scope=binary_only`, `identity_source=sha256_registry`, `semantic_contract_version=v1`. Total 18 claves. |
| **V-11** `POST /infer` (imagen real) | **PASS** | `HTTP 200`, `status:"ok"`, `inference_executed:true`, `model_sha256=77b0efec…219c0`, `model_status=HISTORICO`, `class_space=2`, `class_labels=["enferma","sana"]`, `scientific_scope=binary_only`. Imagen usada: `data/…/corn__cercospora_gray_leaf_spot/06830ecc-…___RS_GLSp 4355 copy.jpg` (13 461 B). |
| **V-12** `POST /api/v3/ai/inference/` | **PASS** | `HTTP 200`. Envelope v3: `prediction.model_status=HISTORICO`, `prediction.model_sha256=77b0efec…219c0`, `prediction.artifact_id=plant_disease_mbv2@77b0efec`, `prediction.class_space=2`, `prediction.scientific_scope=binary_only`, `prediction.inference_executed` (vía trace) `=true`. `trace.inference_origin=local_container`, `trace.raw_diagnosis=class_0`, `trace.raw_class_index=0`. `source_mode="cloud"` se mantiene por contrato v1 (compensado por `trace.inference_origin`). |
| **V-13** `docker compose ps` tras 30 s | **PASS** | `ai_service Up (healthy)`, `backend Up (healthy)`, `frontend Up (healthy)`, `db Up (healthy)`. |
| **V-14** Fallback (`stop ai_service` + inferir) | **PASS** | `docker compose stop ai_service` → `POST /api/v3/ai/inference/` devuelve `HTTP 502` con `error.code=ai_inference_unavailable`, `source_mode=fallback`. **Sin** `model_status` ni `inference_executed` inventados. Tras `docker compose start ai_service`, `/health` vuelve a `200` con `model_status=HISTORICO`. |
| **V-15** `pytest tests/test_semantic_prediction_resolver.py` | **PASS** | Ejecutado dentro del contenedor `backend`: `4 passed in 0.07s` (4/4). |
| **V-16** `python test_model_identity.py` (en contenedor) | **PASS** | `Ran 20 tests in 0.056s` → `OK` (incluye `test_hash_matches_known_artifact`: hash idéntico en imagen). |
| **V-17** Capturas `/ai-predictive` y `/dashboard-cmsc` (badge visible sin abrir Trazabilidad) | **FAIL (parcial)** | `/ai-predictive`: el badge **`MODELO HISTÓRICO · BINARIO · SIN HOLDOUT`** es visible en la tarjeta de resultado sin abrir Trazabilidad (DOM: aparece entre `ANÁLISIS CON MODELO` y `CONFIANZA POR IMAGEN`). `/dashboard-cmsc`: el resultado muestra `⚠️ ALERTA PREVENTIVA` (badge de salud) pero **no** el badge de procedencia `MODELO HISTÓRICO · BINARIO · SIN HOLDOUT` (ModelPredictCell no lo renderiza). No es idéntico en ambas. |
| **V-18** Regresión de voz (narración dice "modelo histórico binario", nunca "inferencia real") | **FAIL** | AIPredictiva: `speakResult` usa `buildNarrationPrefix` → "Inferencia ejecutada con modelo histórico binario. No identifica enfermedad específica." (OK). **Pero** `ModelPredictCell.jsx:53` conserva el literal `` `Inferencia real finalizada. ${built.disease}. ${built.recommendation}` `` en el `SpeechSynthesisUtterance` (1 ocurrencia restante en `src/frontend/src`, AC-L6 no cumplido). La voz del dashboard dice "inferencia real". |
| **V-19** `docker compose config` | **PASS** | `docker compose config --quiet` → exit 0 · servicios `db`, `backend`, `ai_service`, `frontend`. |

## 3. Los 11 puntos de comprobación

| # | Punto | Resultado | Evidencia |
|---|---|---|---|
| 1 | `/health` | **PASS** | V-10. |
| 2 | `/api/v3/ai/inference/` | **PASS** | V-12. |
| 3 | `model_status` | **PASS** | `HISTORICO` (en `/health` y en envelope). |
| 4 | `model_sha256` | **PASS** | `77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0` (minúsculas en runtime). |
| 5 | `artifact_id` | **PASS** | `plant_disease_mbv2@77b0efec`. |
| 6 | `class_space` | **PASS** | `2` (con `class_labels=["enferma","sana"]`). |
| 7 | `scientific_scope` | **PASS** | `binary_only`. |
| 8 | `inference_executed` | **PASS** | `true` (envelope v3 `trace`). |
| 9 | `inference_origin` | **PASS** | `local_container` (envelope v3 `trace`). |
| 10 | Voice Assistant | **FAIL** | AIPredictiva OK; dashboard (`ModelPredictCell.jsx:53`) dice "Inferencia real finalizada" (V-18). |
| 11 | AIPredictiva | **PARTIAL** | Badge visible en `/ai-predictive`; no visible (no idéntico) en `/dashboard-cmsc` (V-17). |

## 4. Criterios de aceptación AC-L (resumen runtime)

| AC | Resultado | Nota |
|---|---|---|
| AC-L1 | PASS | `/health` 18 claves nuevas con valores correctos. |
| AC-L2 | PASS | `model_sha256` coincide (casefold). |
| AC-L3 | PASS | `class_space=2` coincide con metadata y output. |
| AC-L4 | PASS | Envelope de éxito con `prediction.model_status=HISTORICO`. |
| AC-L5 | PASS | Fallback → `trace.inference_executed=false` implícito (502 con `error`) y UI "Modo degradado". |
| AC-L6 | **FAIL** | 1 literal `"Inferencia real finalizada"` restante en `ModelPredictCell.jsx:53`. |
| AC-L7 | PASS (en `/ai-predictive`) | Badge de procedencia visible en tarjeta principal. |
| AC-L8 | **FAIL** | `ModelPredictCell` no muestra el mismo badge que `AIPredictiva`. |
| AC-L9 | PASS | `/health` responde 200 en los estados (verificado HISTORICO). |
| AC-L10..L14 | PASS (bloque A, ya verificados) | Sin cambios en esta misión. |

## 5. Causa raíz de los FAIL (deuda declarada, no runtime)

`L1_L6_EXECUTION_REPORT.md` §1.1 documenta que **L-3b y L-4c no se ejecutaron**:
- L-3b: cambio de `ModelPredictCell.jsx:53` a `` `${buildNarrationPrefix(built)} ${built.disease}. ${built.recommendation}` `` (no aplicado).
- L-4c: render del badge de procedencia en `ModelPredictCell` (no aplicado).

Por eso AC-L6 y AC-L8 quedan incumplidos y V-17/V-18 fallan en el dashboard, a pesar de que el runtime (Docker, `/health`, envelope, fallback, suites) está completamente verde.

## 6. Restricciones respetadas

- Sin modificación de código, sin commits, sin push, sin stage.
- Sin IA-R3/IA-R4/IA-R5. Sin diseño/auditoría/refactor.
- `stash@{0}` `PRE_MULTI_AGENT_2026_09_29` no tocado.
- `.h5` sin cambios (`77B0EFECD602F95FD31846C3058B4D45E41289155438FBD22738BCE0640219C0`).
- HEAD sigue en `d930a34`.

## 7. Clasificación final

**NOT_VERIFIED** — V-10..V-16 y V-19 PASS; V-17 y V-18 FAIL por deuda de código no aplicada (L-3b/L-4c). El runtime de los servicios y del contrato de procedencia está operativo; falta aplicar los cambios de `ModelPredictCell.jsx` (fuera del alcance de esta misión, que es solo verificación runtime) para alcanzar `VERIFIED`.

## 8. Evidencia textual clave

- `/health` (post-rebuild, 200):
  `{"status":"ok","model_status":"HISTORICO","model_sha256":"77b0efec…219c0","artifact_id":"plant_disease_mbv2@77b0efec","class_space":2,"scientific_scope":"binary_only","identity_source":"sha256_registry","semantic_contract_version":"v1", …}`
- Envelope v3 (`trace`): `inference_executed:true`, `inference_origin:"local_container"`, `prediction.model_status:"HISTORICO"`.
- Fallback (ai_service caído): `HTTP 502`, `error.code:"ai_inference_unavailable"`, sin `model_status`.
- DOM `/ai-predictive` (post-análisis): contiene `MODELO HISTÓRICO · BINARIO · SIN HOLDOUT`.
- DOM `/dashboard-cmsc` (post-análisis): **no** contiene `MODELO HISTÓRICO · BINARIO · SIN HOLDOUT` (solo `⚠️ ALERTA PREVENTIVA`).
- `ModelPredictCell.jsx:53`: `` `Inferencia real finalizada. ${built.disease}. ${built.recommendation}` `` (1 ocurrencia).
- Suites: backend `4 passed`; ai_service `Ran 20 tests … OK`.
- Screenshots guardados (no visualizables por este modelo): `C:\Users\BagmDev\AppData\Local\Temp\opencode-browser-QxTwJ9\0\screenshot.jpeg` (`/ai-predictive`), `C:\Users\BagmDev\AppData\Local\Temp\opencode-browser-FXe9cV\0\screenshot.jpeg` (`/dashboard-cmsc`).
- Cliente de verificación usado: `C:\Users\BagmDev\AppData\Local\Temp\opencode\l1_l6_verify.py` (modos `health`/`infer`/`v3`).
