# IA PREDICTIVA — F0–F3 EXECUTION REPORT

> **Proyecto:** SIGCT-Rural
> **Misión:** `IA_PREDICTIVA_RECOVERY_F0_F3_EXECUTION`
> **Base:** `IA_PREDICTIVA_REALITY_REPORT` (`IA_NO_OPERATIVA`) · `IA_PREDICTIVA_RECOVERY_EXECUTION_PLAN` (`MEDIUM_FIX`) · `IA_PREDICTIVA_EXECUTION_READINESS_REPORT` (`SAFE_TO_EXECUTE`)
> **Alcance ejecutado:** **F0 · F1 · F2 · F3** — F4 **NO** ejecutada.
> **Restricciones respetadas:** NO modificar código · NO commits · NO push · NO tocar CMSC/Dashboard/Labs/Hardware/KH/Dataset/Bridge.
> **Fecha:** 2026-10-13

---

## Respuestas directas

| Pregunta | Respuesta |
|----------|-----------|
| **¿El bug queda confirmado?** | **SÍ.** Doble normalización confirmada estática, aritmética y dinámicamente. Modelo degenerado (4 imágenes distintas → misma clase @ ~0.995). |
| **¿La recuperación es segura?** | **SÍ.** F0–F3 ejecutadas sin modificar código ni tocar los 7 sistemas; solo se levantaron `backend` y `ai_service`. |
| **¿Puede iniciarse F4?** | **SÍ** (justificada), con 2 salvaguardas: (a) es la única edición de código y requiere misión aparte; (b) si tras el fix el modelo sigue colapsando (3 épocas), escala a `MAJOR_FIX`. |

---

## F0 — Reconocimiento

| Check | Resultado |
|-------|-----------|
| `.env` presente | ✅ Sí (define `DB_*`, `BACKEND_PORT=8010`, `AI_PORT=8081`) |
| `docker compose config --services` | `db, db-mysql, backend, ai_service, frontend` |
| Contenedores SIGCT antes | `sigctiarural_postgres_db` (healthy, `5544`) · `sigctiarural_mysql_db` (healthy, `3316`) |
| `backend` / `ai_service` antes | **Ausentes** (no levantados) |

---

## F1 — Levantar `backend` + `ai_service` + migrar

| Paso | Comando | Resultado |
|------|---------|-----------|
| Build+up backend | `docker compose up -d --build backend` | ✅ `sigctiarural_backend` Up (`0.0.0.0:8010->8000`) |
| Build+up ai_service | `docker compose up -d --build ai_service` | ✅ `sigctiarural_ai_service` Up (`0.0.0.0:8081->8081`) · build ≈4 min (TF-CPU) |
| `migrate --plan` | `showmigrations --plan` | ✅ **Todas `[X]`** (incl. `api.0001_initial`, `api.0002_robot_*`) |
| `migrate` | `manage.py migrate` | ✅ `No migrations to apply` (BD ya reconciliada) |
| Regresión backend | `GET :8010/api/v3/telemetry/history/` | ✅ `200` |

**Ningún servicio ajeno fue iniciado/detenido** (Vetna, EIARC, servsoftbagm intactos). Se usaron **args explícitos** (nunca `up` sin args, nunca `down -v`).

---

## F2 — Validar modelo + comprobar doble normalización

### F2.1 Modelo `.h5` dentro del contenedor ✅
```
/app/production_models -> ['plant_disease_mbv2.h5', 'model_metadata.json']
bytes 9431432
```

### F2.2 `/health` ✅
```
GET :8081/health -> 200 {"status":"ok","tensorflow":true,"voice":true,"model_loaded":"plant_disease_mbv2.h5"}
```

### F2.3 Doble normalización — ESTÁTICO ✅
| Normalización | Archivo:línea |
|---------------|---------------|
| Interna del modelo | `train_plant_disease_mobilenet.py:26` → `Rescaling(1./127.5, offset=-1)` |
| En inferencia | `fastapi_app.py:192` → `tf.keras.applications.mobilenet_v2.preprocess_input(arr)` |

### F2.4 Doble normalización — DINÁMICO (sonda read-only) ✅
Ejecución dentro de `ai_service` (script temporal `/tmp`, eliminado al terminar):
```
model plant_disease_mbv2.h5
first_layers ['InputLayer', 'Rescaling']      # el modelo normaliza internamente
preprocessed_range -1.0 1.0                   # preprocess_input ya llevó a [-1,1]
after_internal_Rescaling -1.0078 -0.9922      # 2ª normalización: banda ~0.0157
```
**Lectura:** `preprocess_input` entrega `[-1,1]`; el `Rescaling` interno lo vuelve a mapear ⇒ **banda ~[-1.008, -0.992]**. El modelo ve prácticamente **la misma entrada** para cualquier imagen ⇒ degeneración.

---

## F3 — Gate de degeneración

### F3.1 Cuatro imágenes distintas → misma clase ✅ (colapso confirmado)
```
red   tensor_range -1.0  1.0  argmax 0 conf 0.9954
blue  tensor_range -1.0  1.0  argmax 0 conf 0.9953
white tensor_range  1.0  1.0  argmax 0 conf 0.9945
black tensor_range -1.0 -1.0  argmax 0 conf 0.9957
expected_single_range -1.0 1.0
```
Cuatro entradas mutuamente extremas (rojo/azul/blanco/negro) ⇒ **misma clase `0` con ~99.5 %**. El `argmax` **no varía** ⇒ **modelo degenerado**.

### F3.2 Endpoint completo (contrato EIARC) ✅
`POST :8010/api/v3/ai/inference/` con `test_leaf.jpg`:
```json
{"prediction":{"scientific_scope":"binary_only","semantic_contract_version":"v1",
 "model_version":"plant_disease_mbv2","confidence":0.9953},\n "trace":{"provider":"fastapi_ai_service","raw_class_index":0,"upstream_status":"ok"}}
```
Directo a `:8081/infer` → `{"diagnosis":"class_0","confidence":0.9953,"class_index":0,"status":"ok"}`.
**Interpretación:** la cadena **funciona** (contrato EIARC correcto), pero **el resultado no discrimina** (todo → `class_0`).

### F3.2b Ruta viva / MIME ✅
`POST :8010/api/v3/ai/inference/` sin archivo → `400`.

### Veredicto del gate
**`DEGENERACIÓN CONFIRMADA`.** El modelo productivo no discrimina; su `confidence` (~0.995) **no es científicamente válida** hasta corregir la doble normalización (F4) y revalidar.

---

## No-regresión y aislamiento

| Sistema | Estado |
|---------|--------|
| **CMSC** | No tocado (cero cambios; `ModelPredictCell` no modificado). |
| **Dashboard** | No tocado; backend `:8010` ahora responde `200` (mejora, no rotura). |
| **Laboratorios** | No tocados. |
| **Hardware** | No tocado. |
| **Knowledge Hub** | No tocado. |
| **Dataset** | No tocado (`data/` intacto). |
| **Bridge** | No tocado (`:8766` sin arrancar, no requerido). |
| **Código** | `git status` sin cambios de código; HEAD `9109050` intacto. |
| **Ítems protegidos** | `stash@{0}` intacto; `.dockerignore` (uncommitted) sin tocar. |

**Estado final de contenedores SIGCT:** `backend` (8010) + `ai_service` (8081) + `postgres` (5544) + `mysql` (3316) — todos `Up`. Los 12 contenedores de otros proyectos, intactos.

---

## Veredicto

- **Bug confirmado:** ✅ **SÍ** — doble normalización (`fastapi_app.py:192` + `train_plant_disease_mobilenet.py:26`), con evidencia estática, aritmética (`[-1.008,-0.992]`) y dinámica (colapso).
- **Recuperación segura:** ✅ **SÍ** — F0–F3 ejecutadas sin editar código; los 7 sistemas protegidos intactos.
- **¿Puede iniciarse F4?** ✅ **SÍ**, en **misión de código aparte** (una línea: quitar `preprocess_input` en `fastapi_app.py:192`), con la salvaguarda de que, si el modelo sigue degenerado tras el fix (3 épocas), debe declararse `MAJOR_FIX` (reentrenamiento).

*Sin modificar código, sin commits, sin push. Sonda temporal eliminada.*
