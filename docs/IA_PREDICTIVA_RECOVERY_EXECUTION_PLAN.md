# IA PREDICTIVA — RECOVERY EXECUTION PLAN

> **Proyecto:** SIGCT-Rural
> **Misión:** `IA_PREDICTIVA_RECOVERY_EXECUTION_PLAN`
> **Base:** `docs/IA_PREDICTIVA_REALITY_REPORT.md` → **`IA_NO_OPERATIVA`** · diseño en `docs/IA_PREDICTIVA_RECOVERY_PLAN.md`
> **Naturaleza:** SOLO preparación de ejecución. **NO modificar código. NO commits. NO push.**
> **Fecha:** 2026-10-13

Este documento es el **runbook operativo** (comandos exactos y tiempos) que aterriza el plan de recuperación. Los comandos se ejecutan desde la raíz del repo.

---

## 0. Clasificación

**`MEDIUM_FIX`.**

- `FAST_FIX` cubriría solo R0–R1 (levantar y diagnosticar): la cadena responde, pero el modelo devuelve resultados **inválidos**.
- Este plan exige **1 corrección de código** (normalización) + **revalidación** → `MEDIUM_FIX`.
- Escala a `MAJOR_FIX` **solo si** la revalidación (F3) confirma que el modelo sigue degenerado y hay que reentrenar.

---

## 1. Orden exacto de recuperación

Secuencia estricta; cada fase valida antes de avanzar. Las fases **F4 y F5** son las únicas que tocarían código (F4) y cierran con evidencia (F5).

| Fase | Acción | Toca código | Bloquea a |
|------|--------|:-----------:|-----------|
| **F0** | Reconocimiento previo (sin arrancar) | No | F1 |
| **F1** | Levantar `db` → `backend` → `ai_service` + migrar | No | F2 |
| **F2** | Diagnóstico y comprobación de doble normalización | No | F4 |
| **F3** | Prueba de no-degeneración (gate de decisión) | No | F4 / MAJOR |
| **F4** | **(Futura misión)** corregir `preprocess_image` + rebuild | **Sí** | F5 |
| **F5** | Revalidación final + evidencia + estado honesto | No | cierre |

> **F0–F3 y F5 = este plan (read-only). F4 = misión de código aparte, autorizada por Bernardo.**

---

## 2. Cómo levantar `backend` y `ai_service`

### F0 — Reconocimiento (previo, no arranca nada)
```
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Test-Path .env                      # requerido: define DB_*, *_PORT, DJANGO_DEBUG, SECRET_KEY
docker compose config --services    # debe listar: db, db-mysql, backend, ai_service, frontend
```
Verificar que `db` (`sigctiarural_postgres_db`) está `Up (healthy)`. `.env` ya existe con valores válidos.

### F1.1 — Base de datos (ya arriba; si no)
```
docker compose up -d db
docker compose ps db        # esperar "(healthy)"
```

### F1.2 — Backend Django (`:8010`)
```
docker compose up -d --build backend
docker compose logs -f --tail=50 backend
```
- El backend **monta** `./src/backend:/app` (volumen) ⇒ cambios de código no exigen rebuild.
- Arranca con `python manage.py runserver 0.0.0.0:8000` (`src/backend/Dockerfile`).
- Build rápido (~1–3 min; solo `pip install -r requirements.txt` + `libpq-dev/gcc`).

### F1.3 — AI Service FastAPI (`:8081`)
```
docker compose up -d --build ai_service
docker compose logs -f --tail=100 ai_service
```
- **Sin volumen montado** ⇒ cualquier cambio de código exige `--build` de nuevo.
- Instala `tensorflow-cpu>=2.15.0` (`src/ai_models/requirements.txt`) ⇒ **imagen >1 GB**, primer build pesado.
- Entrypoint `uvicorn fastapi_app:app --host 0.0.0.0 --port 8081`.

### F1.4 — Migraciones Django (el Dockerfile NO las corre)
```
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py showmigrations --plan | Select-String "\[ \]"
```
Si hay migraciones sin aplicar ⇒ `[ ]`. Esperado tras migrar: todas `[X]`.

### F1.5 — Verificación de arranque
```
docker compose ps                    # backend y ai_service "Up"
curl.exe http://localhost:8081/health
curl.exe -i -X POST http://localhost:8010/api/v3/ai/inference/
```
Cierre F1: `health` → `status:"ok"`, `model_loaded:"plant_disease_mbv2.h5"`; el `POST` sin archivo → `400 invalid_request`.

---

## 3. Cómo validar el modelo

Validación en dos planos: **carga del modelo** (¿está vivo?) y **comportamiento** (¿discrimina?).

### V-a Carga (integridad del artefacto)
```
docker compose exec ai_service python -c "import os,glob; p='/app/production_models'; print(os.path.exists(p+'/plant_disease_mbv2.h5'), os.path.getsize(p+'/plant_disease_mbv2.h5')); print([f for f in os.listdir(p)])"
```
Esperado: tamaño **9.431.432 B** y presencia de `model_metadata.json` (65 B, `classes:["enferma","sana"]`).

### V-b Health declarativo
```
curl.exe http://localhost:8081/health
```
Esperado: `tensorflow:true` y `model_loaded` con el nombre del `.h5`. Si `tensorflow:false` ⇒ falló la importación (ver logs).

### V-c Inspección de la primera capa (confirma `Rescaling` interno)
```
docker compose exec ai_service python -c "import tensorflow as tf; m=tf.keras.models.load_model('/app/production_models/plant_disease_mbv2.h5', compile=False); print([l.__class__.__name__ for l in m.layers[:3]])"
```
Esperado: primera capa `Rescaling` ⇒ el modelo **espera `[0,255]`**. Esta es la prueba de que la inferencia NO debe normalizar.

### V-bis Contrato semántico (backend)
```
curl.exe -s -X POST http://localhost:8010/api/v3/ai/inference/ -F "file=@src/ai_models/test_leaf.jpg;type=image/jpeg"
```
Verificar en el JSON: `prediction.scientific_scope == "binary_only"`, `prediction.model_version`, `trace.raw_class_index ∈ {0,1}`, `source_mode`.

**Criterio de modelo "operativo":** carga OK + responde `200` + `raw_class_index` **varía** con la imagen (ver §4 / F3).

---

## 4. Cómo comprobar la doble normalización

Tres niveles, de barato a concluyente. **Todos son de solo lectura** (no editan el repo).

### Nivel 1 — Estático (lectura de código)
```
Select-String -Path "src\ai_models\fastapi_app.py" -Pattern "preprocess_input"        # linea ~192
Select-String -Path "src\ai_models\train_plant_disease_mobilenet.py" -Pattern "Rescaling"  # linea ~26
```
Evidencia del defecto: **dos** normalizaciones idénticas en la ruta.

### Nivel 2 — Aritmético (identidad de las funciones)
`mobilenet_v2.preprocess_input(x) = x/127.5 - 1` y `Rescaling(scale=1./127.5, offset=-1)(x) = x/127.5 - 1`.
Son **la misma** transformación ⇒ la inferencia la aplica una vez y el modelo la aplica **otra** ⇒ `x → (x/127.5-1)/127.5-1`.
Comprobación rápida (sin tocar el repo, dentro del contenedor):
```
docker compose exec ai_service python -c "import numpy as np; x=np.array([0.,127.5,255.],dtype='float32'); once=x/127.5-1; print('once=',once); print('twice=',once/127.5-1)"
```
`once ∈ [-1,0,1]` (rango esperado por el modelo); `twice` cae fuera del rango aprendido ⇒ saturación.

### Nivel 3 — Dinámico (observable de colapso) — **concluyente**
Con **dos imágenes de clases conocidas distintas** (una `enferma`, una `sana`):
```
curl.exe -s -X POST http://localhost:8010/api/v3/ai/inference/ -F "file=@<muestra_enferma>.jpg;type=image/jpeg" > out_A.json
curl.exe -s -X POST http://localhost:8010/api/v3/ai/inference/ -F "file=@<muestra_sana>.jpg;type=image/jpeg"    > out_B.json
Select-String -Path out_A.json,out_B.json -Pattern "confidence"   # extraer raw_class_index / confidence
```
- **Si ambos dan el mismo `raw_class_index`** ⇒ entrada fuera de distribución (doble normalización confirmada).
- Si aún no hay muestras propias, usar `test_leaf.jpg` + una imagen sintética neutra para observar el colapso (menos concluyente que dos clases reales).

> Resultado esperado **antes** del fix: colapso. Resultado esperado **después** de F4: `raw_class_index` distintos.

---

## 5. Qué archivos tocaría una futura corrección (F4)

| Prioridad | Archivo | Cambio esperado | Requiere rebuild |
|:--------:|---------|-----------------|:---------------:|
| **Primario** | `src/ai_models/fastapi_app.py` (`preprocess_image`, `:187-195`) | Eliminar `mobilenet_v2.preprocess_input` (`:192`); entregar `[0,255]` float32 + batch | **Sí** (`ai_service`) |
| Secundario (opcional) | `src/ai_models/production_models/model_metadata.json` | Declarar `input_range:[0,255]` / `preprocessing` para trazabilidad | No (solo dato) |
| Secundario (cosmético) | `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py` (`:116`) | `source_mode` no debería decir `"cloud"` para modelo local | No (backend montado) |
| Solo si MAJOR_FIX | `src/ai_models/train_plant_disease_mobilenet.py` (`:26`, `:49`) | Reentrenamiento / dataset real / épocas | Sí |

**No se toca** en la corrección: `docker-compose.yml` (salvo `AI_SERVICE_URL` para host), BD (0 migraciones de datos), frontend (`AIPredictiva.jsx` intacto), el `.h5` (no se sobreescribe).

**Nota de build:** `backend` tiene volumen ⇒ edit → restart; `ai_service` **no** ⇒ edit → `docker compose up -d --build ai_service`.

---

## 6. Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación |
|----|--------|:----:|:------:|-----------|
| R1 | Modelo degenerado **por causa adicional** al preprocessing (solo 3 épocas) | Media/Alta | Alto | F3 decide; si persiste ⇒ MAJOR_FIX. No publicar resultados. |
| R2 | Build `ai_service` (TF-CPU) lento/falla por RAM/disco | Media | Medio | Recursos Docker ≥4 GB; reintentar; ver logs del build. |
| R3 | Migraciones sin aplicar ⇒ 500 backend | Media | Alto | F1.4 obligatorio. |
| R4 | `AI_SERVICE_URL`: en host `ai_service` no resuelve | Media | Medio | Todo en Docker (default correcto) o `AI_SERVICE_URL=http://localhost:8081`. |
| R5 | Divergencia train/inferencia si el `.h5` no siguió el script | Baja | Alto | Validar con muestras etiquetadas; si no acierta ⇒ reentrenar. |
| R6 | `confidence` alta induce falsa validez científica | Alta | Alto | Declarar `binary_only` + estado honesto; no publicar `confidence` como métrica. |
| R7 | `infer_log.jsonl` mezcla antes/después del fix | Baja | Bajo | Marcar checkpoint temporal; no usar logs previos en validación. |
| R8 | Puertos ocupados (8010/8081) por procesos host | Baja | Bajo | `docker compose ps` + `Get-NetTCPConnection -LocalPort 8010,8081`. |
| R9 | Backend sin `depends_on ai_service` ⇒ 502 en primer request | Media | Bajo | El adapter reintenta (`tenacity`); reintentar el smoke. |
| R10 | CORS si front en `:5174` (no listado) | Baja | Bajo | `DEBUG=True` ⇒ `CORS_ALLOW_ALL_ORIGINS` (`settings.py:181`); proxy `/api` evita CORS. |

---

## 7. Tiempo estimado por fase técnica

Estimaciones en entorno de desarrollo local con imágenes ya construidas parcialmente.

| Fase | Actividad | Tiempo estimado | Notas |
|------|-----------|:---------------:|-------|
| **F0** | Reconocimiento (`docker ps`, `compose config`) | **2–5 min** | Sin build. |
| **F1** | Levantar `db` (ya up) + build/up `backend` | **2–5 min** | Backend build ligero. |
| F1 (cont.) | Build + up `ai_service` (TF-CPU) | **8–20 min ¹ᵉʳ build** · **1–3 min** rebuild con cache | Descarga de wheels TF. |
| F1 | Migraciones Django | **< 1 min** | Idempotente. |
| F1 | Verificación arranque | **2 min** | Health + 400. |
| F2 | Diagnóstico + comprobación doble normalización (N1–N3) | **10–20 min** | Nivel 3 requiere 2 imágenes. |
| F3 | Prueba de no-degeneración (gate) | **5–10 min** | Decide FAST/MEDIUM/MAJOR. |
| F4 | **(futura)** fix + rebuild `ai_service` | edición **min** + build **1–3 min** | Fuera de este plan. |
| F5 | Revalidación + evidencia + estado | **20–40 min** | Incluye captura UI humana. |

**Total F0–F3 + F5 (este plan, sin F4):** ≈ **45–90 min** (dominado por el primer build de `ai_service`).
**Con F4 (misión de código):** +≈ **10–15 min**.

---

## Clasificación final

**`MEDIUM_FIX`**

- **F0–F3 y F5** son **read-only**: levantar `db`+`backend`+`ai_service`, migrar, diagnosticar y comprobar el defecto. No tocan código.
- **F4** (futura misión autorizada) toca **un solo punto primario**: `src/ai_models/fastapi_app.py:192`.
- Escala a **`MAJOR_FIX`** únicamente si F3 demuestra que el modelo colapsa aun con el preprocessing correcto (⇒ reentrenamiento).

*Sin modificar código, sin commits, sin push.*
