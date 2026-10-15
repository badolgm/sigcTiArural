# IA PREDICTIVA — RECOVERY PLAN

> **Proyecto:** SIGCT-Rural
> **Misión:** `IA_PREDICTIVA_RECOVERY_PLAN`
> **Entrada:** `docs/IA_PREDICTIVA_REALITY_REPORT.md` → dictamen **`IA_NO_OPERATIVA`**
> **Objetivo:** recuperar la IA Predictiva.
> **Naturaleza:** SOLO plan técnico. **NO se modifica código en esta fase. Sin commits. Sin push.**
> **Fecha:** 2026-10-13

---

## 0. Dictamen y clasificación

**Clasificación del plan: `MEDIUM_FIX`.**

Razón: recuperar la IA Predictiva **no** se logra solo levantando servicios (eso sería `FAST_FIX`): el modelo productivo está **descalificado por doble normalización** (`fastapi_app.py:192` vs `train_plant_disease_mobilenet.py:26`), por lo que hay que **tocar código de inferencia** + **revalidar el modelo** y **reportar métricas honestas**. Pero tampoco es `MAJOR_FIX`, porque no se reescribe arquitectura ni se requiere un modelo nuevo para "operar": la cadena completa existe y el modelo `.h5` (9,4 MB) está presente.

- **FAST_FIX** (solo ops): levantar servicios → la cadena "responde", pero devuelve resultados inválidos (modelo degenerado). **Insuficiente.**
- **MEDIUM_FIX (este plan)**: infra + fix de normalización (1 punto) + revalidación + configuración + honestidad de estados. **Recomendado.**
- **MAJOR_FIX** (futuro, fuera de este plan): reentrenamiento con dataset real y modelo multiclase validado (ECE/matriz de confusión). Se declara como frontera.

---

## 1. Análisis de componentes (estado real verificado)

| # | Componente | Archivo | Estado real | Rol en la recuperación |
|---|-----------|---------|-------------|------------------------|
| 1 | **Backend Django** | `src/backend/api/views.py:330` (`AIInferenceV3View`), `api/urls.py:43` | **CAÍDO** (ECONNREFUSED :8010). Código correcto; endpoint guardado por `AI_INFERENCE_V3_AVAILABLE` (`views.py:92-99`). | Arrancar + migrar. |
| 2 | **AI Service (FastAPI)** | `src/ai_models/fastapi_app.py` | **CAÍDO** (ECONNREFUSED :8081). Imagen con `.h5` (`.dockerignore` no lo excluye). | Arrancar. |
| 3 | **FastAPIAIAdapter** | `infrastructure/external/ai_service/fastapi_ai_adapter.py` | OK. `base_url` default `http://ai_service:8081` (`:15`); `/infer` con retry (`:34-42`). | Verificar alcance (Docker vs host). |
| 4 | **FastAPI `/infer`** | `fastapi_app.py:212-278` | OK. Devuelve `diagnosis`, `confidence`, `class_index`, `model`, `status`. | Arrancar; validar `status:"ok"`. |
| 5 | **`plant_disease_mbv2.h5`** | `src/ai_models/production_models/` | Presente (9.431.432 B). Metadatos `["enferma","sana"]`. **Descalificado** (pred. degenerada). | Revalidar tras fix. |
| 6 | **`Rescaling` (modelo)** | `train_plant_disease_mobilenet.py:26` | Capa **interna** del modelo: `Rescaling(1./127.5, offset=-1)` ⇒ el modelo **espera [0,255]**. | **No tocar** (es correcto). |
| 7 | **`preprocess_input` (inferencia)** | `fastapi_app.py:192` | **Causa del bug**: aplica `mobilenet_v2.preprocess_input` ⇒ segunda normalización ⇒ doble. | **Corregir aquí.** |
| 8 | **SemanticPredictionResolver** | `infrastructure/external/ai_service/semantic_prediction_resolver.py` | OK. Mapea `class_index` 0→enferma, 1→sana; `scientific_scope: binary_only`. | Verificar contrato; menor: `source_mode` puede decir "cloud" (`:116`). |

**Diagnóstico raíz confirmado (doble normalización):**
- Entrenamiento: entrada `[0,255]` → `Rescaling` interno → `[-1,1]`. (`train_plant_disease_mobilenet.py:26`)
- Inferencia: entrada `[0,255]` → `mobilenet_v2.preprocess_input` → `[-1,1]` → **`Rescaling` interno otra vez** → `[-1,1]` remapeado mal. (`fastapi_app.py:192`)
- Efecto: entrada fuera de distribución ⇒ `argmax` colapsa ⇒ un solo `class_index` ⇒ `confidence` ficticia.

---

## 2. Orden exacto de recuperación

Ejecutar **en este orden** (cada fase con su validación antes de avanzar). **No modificar código hasta R2.**

### R0 — Infraestructura (sin código)
1. Levantar PostgreSQL: `docker compose up -d db` (ya está `healthy`).
2. Levantar backend y AI Service: `docker compose up -d --build backend ai_service`.
3. Aplicar migraciones (el Dockerfile del backend **no** las corre): `docker compose exec backend python manage.py migrate`.
4. Validar arranque: `docker compose ps`, `docker compose logs --tail=50 backend ai_service`.

### R1 — Diagnóstico en vivo (sin código)
5. `GET http://localhost:8081/health` → confirmar `status:ok`, `tensorflow:true`, `model_loaded:plant_disease_mbv2.h5`.
6. `POST http://localhost:8010/api/v3/ai/inference/` sin `file` → esperar `400 invalid_request` (ruta viva).
7. Ejecutar la **prueba de degeneración** (ver §6 S4): dos imágenes distintas ⇒ **mismo** `class_index` ⇒ confirma el defecto.

### R2 — Corrección de la doble normalización (código, cambio mínimo)
8. Editar **solo** `fastapi_app.py` `preprocess_image` (`:187-195`): eliminar `mobilenet_v2.preprocess_input` y devolver la imagen en `[0,255]` (float32) + batch. (Detalle en §3.)
9. Rebuild del AI Service: `docker compose up -d --build ai_service`.

### R3 — Revalidación del modelo
10. Repetir la prueba de degeneración (S4): ahora las dos imágenes deben dar `class_index` **distinto**.
11. Si siguen colapsando ⇒ el modelo no es recuperable por preprocessing ⇒ escala a **MAJOR_FIX** (reentrenar), declarar `ROTO` y no publicar resultados.

### R4 — Configuración y alcance
12. Confirmar `AI_SERVICE_URL`: en Docker el default `http://ai_service:8081` es correcto (misma red). Para ejecución **host** definir `AI_SERVICE_URL=http://localhost:8081`.
13. Confirmar que el frontend llega al backend: relativo `/api/v3/ai/inference/` (proxy Vite/nginx) o absoluto `http://localhost:8010/...` (solo host local).

### R5 — Honestidad de estado y cierre
14. Etiquetar el modelo como `operativo (binario, no validado científicamente)` hasta tener métricas; mantener `scientific_scope: binary_only` y mensaje de advertencia.
15. Registrar evidencia (§8) y, si Bernardo lo autoriza en misión aparte, commit.

---

## 3. Qué servicios deben arrancar

| Servicio | Contenedor | Puerto host | Comando | Dependencia |
|----------|-----------|-------------|---------|-------------|
| PostgreSQL | `sigctiarural_postgres_db` | `5544` | `docker compose up -d db` | — (ya up) |
| **Backend Django** | `sigctiarural_backend` | `8010` | `docker compose up -d --build backend` | db (healthy) |
| **AI Service FastAPI** | `sigctiarural_ai_service` | `8081` | `docker compose up -d --build ai_service` | db (healthy) |
| Frontend (opcional) | `sigctiarural_frontend` | `5173` | dev Vite en `5173` **ya activo** | backend |

Notas:
- El `backend` de compose **no** declara `depends_on: ai_service`; el adapter reintenta (`tenacity`) ⇒ tolera arranque desordenado.
- El AI Service instala `tensorflow-cpu>=2.15.0` ⇒ **primer build pesado** (minutos, >1 GB).
- `.env` ya define `DB_NAME/DB_USER/DB_PASSWORD`, `BACKEND_PORT=8010`, `AI_PORT=8081` ⇒ no requiere edición para arrancar.

---

## 4. Cómo corregir la doble normalización

**Punto único de corrección:** `src/ai_models/fastapi_app.py`, función `preprocess_image` (`:187-195`).

**Regla de oro:** aplicar **exactamente una** normalización, y que sea la que espera el modelo. El modelo ya normaliza internamente (`Rescaling`), por tanto **la inferencia debe entregar `[0,255]` crudo**.

Cambio conceptual (sin escribirlo aún):
- **Eliminar** la línea `arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)` (`:192`).
- **Conservar** un cast a `float32` y el `np.expand_dims(arr, axis=0)`.
- Resultado: `arr` en `[0,255]` → modelo aplica su `Rescaling` → `[-1,1]` (una sola vez).

Alternativas descartadas:
- Quitar el `Rescaling` del modelo y reexportar: pierde coherencia con el entrenamiento y exige reconstruir el grafo (mayor riesgo).
- Reentrenar sin `Rescaling` y con `preprocess_input`: es **MAJOR_FIX** (otra misión).

**Confirmación de coherencia:** `mobilenet_v2.preprocess_input(x) == x/127.5 - 1` y `Rescaling(1/127.5, -1)(x) == x/127.5 - 1`. Son idénticos ⇒ hoy se aplican dos veces. El fix deja una sola.

---

## 5. Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación |
|----|--------|:----:|:------:|-----------|
| R1 | Modelo degenerado **más allá** del preprocessing (solo 3 épocas) | Media/Alta | Alto | Tras R2, prueba S4; si persiste ⇒ MAJOR_FIX (reentrenar). No publicar resultados como válidos. |
| R2 | Build de `ai_service` pesado/falla por RAM (TF-CPU) | Media | Medio | Build con Docker Desktop con recursos suficientes; reintentar; monitorear logs. |
| R3 | `AI_SERVICE_URL` no resuelve en host (`ai_service` solo intra-Docker) | Media | Medio | Ejecutar todo en Docker, o setear `AI_SERVICE_URL=http://localhost:8081`. |
| R4 | Migraciones no aplicadas ⇒ 500 en backend | Media | Alto | `docker compose exec backend python manage.py migrate` (R0.3). |
| R5 | URLs absolutas `localhost` rompen acceso remoto | Baja (local) | Medio | Usar default relativo `/api/...`; documentar para despliegue. |
| R6 | Divergencia train/inferencia si el modelo real no siguió el script versionado | Baja | Alto | Validar con imágenes etiquetadas conocidas; si no acierta, reentrenar (MAJOR). |
| R6b| CORS si front en `:5174` (no está en la lista) | Baja | Bajo | En `DEBUG=True` hay `CORS_ALLOW_ALL_ORIGINS` (`settings.py:181`); el proxy `/api` evita CORS igualmente. |
| R7 | `source_mode:"cloud"` para modelo local = semántica confusa | Alta | Bajo | Corregir después (`semantic_prediction_resolver.py:116`); cosmético. |
| R8 | `confidence` alta pero inválida induce falsa confianza científica | Alta | Alto | Bloquear publicación de `confidence` como métrica; declarar `binary_only` + estado honesto (R5). |
| R9 | Logs `infer_log.jsonl` con datos históricos mezclan antes/después del fix | Baja | Bajo | Marcar checkpoint temporal en evidencia; no mezclar en validación. |

---

## 6. Validaciones

| ID | Validación | Criterio de aceptación |
|----|-----------|------------------------|
| V1 | Servicios arriba | `docker compose ps` muestra backend y ai_service `Up`/`healthy`. |
| V2 | Health IA | `GET :8081/health` → `{status:"ok", tensorflow:true, model_loaded:"plant_disease_mbv2.h5"}`. |
| V3 | Ruta backend viva | `POST :8010/api/v3/ai/inference/` sin archivo → `400` con `code:"invalid_request"`. |
| V4 | MIME | Archivo no-imagen → `400 unsupported_media_type`. |
| V5 | Inferencia OK | `POST` con imagen real → `200`, `source_mode:"cloud"`, `prediction.confidence > 0`, `trace.raw_class_index ∈ {0,1}`. |
| V6 | **No degeneración** | Dos imágenes distintas (enferma/sana) → `class_index` **distintos**. |
| V7 | Contrato semántico | `prediction.scientific_scope == "binary_only"`, `semantic_contract_version == "v1"`. |
| V8 | Coherencia UI | Modo `real` en `/ai-predictive` muestra resultado con paneles de confianza y trazabilidad. |
| V9 | Regresión backend | `GET :8010/api/v3/telemetry/history/` y `/api/v3/ai/crop-advice/` siguen respondiendo (no se rompió el bloque V3). |
| V10 | Honestidad | Ningún documento/UI afirma enfermedad específica ni `confidence` validada. |

---

## 7. Smoke tests

**S1 — Health del AI Service**
```
curl http://localhost:8081/health
# esperado: {"status":"ok","tensorflow":true,"voice":...,"model_loaded":"plant_disease_mbv2.h5"}
```

**S2 — Backend vivo (sin archivo)**
```
curl -i -X POST http://localhost:8010/api/v3/ai/inference/
# esperado: HTTP 400 {"...","error":{"code":"invalid_request",...}}
```

**S3 — Inferencia real (muestra de campo)**
```
curl -s -X POST http://localhost:8010/api/v3/ai/inference/ -F "file=@src/ai_models/test_leaf.jpg;type=image/jpeg"
# esperado: 200 con prediction{confidence, model_version, scientific_scope:"binary_only"} y trace{raw_class_index}
```

**S4 — Prueba de degeneración (clave)**
```
# con DOS imágenes de clases conocidas distintas
curl ... /inference/ -F file=@muestra_enferma.jpg
curl ... @infer con /api/v3/ai/inference/ y 'sana'
# criterio: raw_class_index DISTINTOS tras R2; si son iguales ⇒ modelo no recuperable (MAJOR_FIX)
```

**S5 — E2E UI (humano)**
- Abrir `http://localhost:5173/ai-predictive` → modo `INFERENCIA REAL` → cargar imagen → verificar render de resultado + barra de certeza + trazabilidad.

**S4b — (opcional) Directo al adapter**
```
docker compose exec backend python -c "from infrastructure.external.ai_service.fastapi_ai_adapter import FastAPIAIAdapter; import sys; print(FastAPIAIAdapter().predecir_enfermedad(open('test_leaf.jpg','rb').read()))"
```

Artefacto disponible para pruebas: `src/ai_models/test_leaf.jpg` (1.413 B).

---

## 8. Evidencia requerida

1. **Infra:** salida de `docker compose ps` (backend + ai_service `Up/healthy`).
2. **Health IA:** JSON de `GET :8081/health` (con `model_loaded`).
3. **Ruta backend:** respuesta `400` de `POST /api/v3/ai/inference/` (ruta viva).
4. **Inferencia real:** JSON `200` de `POST` con imagen (con `prediction` y `trace`).
5. **No degeneración:** dos respuestas `200` con `raw_class_index` distintos + nombres de las imágenes usadas.
6. **Diff exacto del fix** (`fastapi_app.py`, localStorage) — pendiente de misión de código.
7. **Log interno:** entradas nuevas en `data/logs/infer_log.jsonl` con `timestamp` posterior al fix (checkpoint).
8. **UI:** captura de pantalla del resultado en modo `real` (validación humana).
9. **Estado honesto:** nota de estado del modelo (`operativo binario / no validado`) y `scientific_scope: binary_only`.
10. **Rollback probado:** evidencia de reversión documentada (§9).

---

## 9. Rollback

- **Infra:** `docker compose stop backend ai_service` (no destructivo).
- **Código (fix de normalización):** revertir el único cambio en `preprocess_image` (`git diff` → `git checkout -- src/ai_models/fastapi_app.py`), rebuild `ai_service`.
- **Datos:** el fix no toca BD; ninguna migración de datos. `infer_log.jsonl` es append-only (preservado).
- El modelo `.h5` **no se modifica** en este plan.

---

## Clasificación final

**`MEDIUM_FIX`**

Recuperar la IA Predictiva requiere: **(R0)** levantar `db`+`backend`+`ai_service` y migrar; **R1** diagnosticar; **R2** corregir la **doble normalización** en `fastapi_app.py:192` (punto único); **R3** revalidar que el modelo no colapse; **R4** fijar `AI_SERVICE_URL`; **R5** declarar honestamente el estado. Es más que un FAST_FIX (el modelo devuelve resultados inválidos sin el fix de código) y menos que un MAJOR_FIX (la arquitectura existe y el modelo es recuperable si el preprocessing era la única causa). Si la prueba de no-degeneración falla tras R2, el plan **escala a MAJOR_FIX** (reentrenamiento con dataset real y modelo validado).

*Sin modificar código, sin commits, sin push.*
