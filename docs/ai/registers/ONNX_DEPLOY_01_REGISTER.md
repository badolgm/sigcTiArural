# ONNX-DEPLOY-01 — Registro de deuda técnica

**ID:** `ONNX-DEPLOY-01`
**Misión:** `ASUS — REGISTRO ONNX-DEPLOY-01`
**Naturaleza:** SOLO documentación/registro. **NO** modifica código · **NO** modifica `docker-compose` · **NO** rebuild · **NO** activa ONNX · **NO** commit · **NO** push.
**Fecha:** 2026-11-17 (America/Bogota)
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `3afa041`
**Regla:** toda afirmación anclada a disco / imagen / contenedor; lo no evidenciado se declara como tal.

---

## 0. Ficha del registro

| Campo | Valor |
|---|---|
| **ID** | `ONNX-DEPLOY-01` |
| **Título** | Ruta de servicio ONNX implementada pero dormida; imagen en ejecución anterior a AI-R3 |
| **Categoría** | Deuda técnica de **despliegue** (no es un fallo funcional) |
| **Estado** | **IDENTIFICADO** · **PENDIENTE** |
| **Severidad** | Media — **latente**; sin impacto funcional en el estado actual |
| **Bloqueante** | **No** |
| **Origen** | Validación post-despliegue AI-R3 + AI-R4 (2026-11-15) · análisis `ONNX-DEPLOY-ANALYSIS` (2026-11-17) |
| **Acción** | **Diferida por diseño** hasta autorización explícita |
| **Rollback** | `AI_BACKEND=tf` (un valor de entorno; sin rebuild) |

---

## 1. Resumen

La ruta de servicio **ONNX** (AI-R3) y el **contrato semántico multiclase v2** (AI-R4) están **implementados en el working tree** y **auditados con ejecución real end-to-end** (`READY_FOR_ONNX_ACTIVATION = TRUE`). Sin embargo:

- El artefacto **`model.onnx` existe** en el host, pero está **gitignored** y **no horneado** en la imagen.
- El **contenedor en ejecución es anterior a AI-R3** (imagen `2026-10-30`, commit AI-R3 `2026-11-15`): **no** tiene `onnxruntime`, **no** tiene el bind mount y **no** conoce `AI_BACKEND`.
- El runtime actual sigue sirviendo el modelo **histórico binario** (`.h5` + TensorFlow, `class_space=2`, `semantic_contract_version=v1`).

⇒ Se **decide NO activar ONNX todavía**. La activación no es un cambio técnico aislado: implica una **decisión científica y de gobernanza** (M2 sigue en condición *challenger*; AI-R5 sin cerrar). El hallazgo queda **registrado como deuda técnica identificada y pendiente**.

---

## 2. Hallazgos confirmados

### H1 — AI-R3 implementado correctamente ✅

Evidencia (working tree, sin cambios locales — `git status` limpio para estos ficheros):

- `AI_BACKEND=tf|onnx` presente en `src/ai_models/fastapi_app.py:175-178` (parse *fail-closed*: valor desconocido ⇒ `tf`).
- `_load_onnx_model()` — `src/ai_models/fastapi_app.py:244-263`.
- `_onnx_candidates()` / `_served_onnx_path()` — `fastapi_app.py:217-225` y `297-300` (selección **explícita**, nunca por `mtime`).
- `onnxruntime==1.31.0` declarado en `src/ai_models/requirements.txt:10`.
- Bind mount `:ro` + env en `docker-compose.yml:98-103`.
- Commit: `b747288` — `feat(ai): implement AI-R3 dormant ONNX serving path` (2026-11-15).

### H2 — AI-R4 implementado correctamente ✅

Evidencia (working tree; ficheros presentes):

- `_model_contract_version()` — `src/ai_models/fastapi_app.py:336-342` (`binary_only` | `agriculture_v2_multiclass16`).
- Resolver semántico v2 — `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py` (`CLASS_DEFINITIONS_V2`, `_resolve_contract_mode`).
- Soporte multiclase documentado y presentación *mode-aware* — `src/frontend/src/pages/AIPredictiva.jsx`.
- Tests: `src/backend/tests/test_semantic_prediction_resolver.py`.
- Commit: `449c969` — `feat(ai): implement AI-R4 multiclass semantic contract` (2026-11-15).

### H3 — El modelo ONNX existe ✅

| Campo | Valor |
|---|---|
| Ruta | `benchmark/runs/M2_efficientnet_b0/exports/model.onnx` |
| Tamaño | 16 102 181 B (15,36 MiB) |
| SHA-256 | `4BD657B363407D4012F013589A5469DCA57B9C5E347A9EA54E1F6E57A3274EC3` |
| Contrato | `input: float32 [batch,3,224,224]` → `logits: float32 [batch,16]` (sin softmax) · opset 17 |
| Paridad (G-NEW-A) | **PASS** · `max_abs_diff` 1.57e-04 · `argmax_agreement` 1.0 |
| Git | **ignorado** (`.gitignore:20` → `benchmark/runs/`) |

Registro: `benchmark/runs/M2_efficientnet_b0/exports/export_record.json` · `docs/ai/artifacts/M2_ONNX_EXPORT_RECORD.md`.

### H4 — El contenedor en ejecución es previo a AI-R3 ✅

| Evidencia | Valor observado |
|---|---|
| Imagen del contenedor | creada **`2026-10-30T07:25:34Z`** (commit AI-R3: `2026-11-15`) |
| `onnxruntime` en runtime | **ausente** (`ModuleNotFoundError: No module named 'onnxruntime'`) |
| `AI_BACKEND` en el contenedor | **no definido** (`printenv` no lo lista) |
| Mounts del contenedor | **vacíos** (`docker inspect .Mounts` → nada) |
| `/app/models/` | **no existe** |
| `/health` | **sin** `model_backend` / `onnxruntime` (código pre-AI-R3) |

### H5 — El runtime actual sigue sirviendo el modelo histórico ✅

`GET http://127.0.0.1:8081/health` (capturado 2026-11-17):

```json
{"status":"ok","tensorflow":true,"voice":true,
 "model_loaded":"plant_disease_mbv2.h5",
 "model_file":"plant_disease_mbv2.h5",
 "model_sha256":"77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0",
 "model_bytes":9431432,"model_mtime":"2026-08-21T22:14:27Z",
 "model_status":"HISTORICO","artifact_id":"plant_disease_mbv2@77b0efec",
 "identity_source":"sha256_registry","class_space":2,
 "class_labels":["enferma","sana"],"scientific_scope":"binary_only",
 "superseded_by":"M2_efficientnet_b0_001",
 "declared_in":"src/ai_models/model_identity.py","expires_on":"AI-R3+R4",
 "semantic_contract_version":"v1"}
```

⇒ Sirviendo: `plant_disease_mbv2.h5` · **TensorFlow** · `class_space=2` · `semantic_contract_version=v1`. Coincide con `AI_R3_R4_CLOSURE_REPORT.md` §6.1.

### H6 — `READY_FOR_ONNX_ACTIVATION` quedó confirmado ✅

`docs/ai/AI_R3_R4_CLOSURE_REPORT.md` §0: **`READY_FOR_ONNX_ACTIVATION = TRUE`** — motor ONNX *implementado pero dormido*; activación = **interruptor único** (`AI_BACKEND=onnx`), **no accionado**.

---

## 3. Decisión

**NO activar ONNX todavía.**

Motivos (registrados, no técnicos):

1. **AI-R5 pendiente** — `real_world_holdout_v1` sigue **vacío** (0 archivos): sin validación de campo.
2. **M2 continúa en condición *challenger*** — la decisión benchmark **M1 vs M2 sigue PENDIENTE**; M1 es el *baseline oficial congelado*.
3. **Activar ONNX implica decisión científica y de gobernanza**, no solo técnica: *servir M2 ≠ promover M2*.

---

## 4. Acción futura (cuando exista autorización explícita)

1. **Rebuild** `ai_service` (instala `onnxruntime` + código AI-R3/AI-R4).
2. **Verificar hash** de `model.onnx` (`4BD657B3…274EC3`) y su existencia física en el host.
3. **Activar** `AI_BACKEND=onnx`.
4. **Validar `/health`** → `model_backend=onnx` · `model_loaded=model.onnx` · `class_space=16` · `model_contract_version=agriculture_v2_multiclass16`.
5. **Validar `/infer`** (sanidad 16/16 sobre imágenes conocidas).
6. **Validar E2E backend** (`/api/v3/ai/inference/`) → `contract_version=v2`.
7. **Mantener rollback inmediato** a `AI_BACKEND=tf` (sin rebuild).

> Guardarraíles: activar **AI-R3 + AI-R4 en el mismo despliegue** (regla *consumidor antes que productor* ⇒ cierra R-EXEC-1) · no `git add -A` · sin commit/push sin orden explícita.

---

## 5. Deuda técnica declarada (registro)

| ID | Descripción | Estado | Bloqueante |
|---|---|---|---|
| **ONNX-DEPLOY-01** | Imagen `ai_service` en ejecución anterior a AI-R3; ruta ONNX dormida | **IDENTIFICADO / PENDIENTE** | No |
| ONNX-DEPLOY-01·OBS-1 | `semantic_contract_version` de `/health` queda `"v1"` constante bajo ONNX (segunda verdad semántica latente; no consumida) | Identificado | No |
| ONNX-DEPLOY-01·OBS-2 | `model.onnx` gitignored: **debe existir físicamente en el host** de despliegue al activar (si falta, falla en seguro) | Identificado | No |
| AI-R5 | `real_world_holdout_v1` vacío (0 archivos) | Pendiente | No |
| G-BENCH-M1/M2 | Decisión benchmark M1 vs M2 | Pendiente por diseño | No |

---

## 6. Confirmación de no-cambios operativos

- **NO** se modificó código (`src/ai_models`, `src/backend`, `src/frontend` intactos).
- **NO** se modificó `docker-compose.yml` (permanece en HEAD `3afa041`).
- **NO** se ejecutó **rebuild** de ninguna imagen.
- **NO** se activó ONNX (el contenedor sigue en `AI_BACKEND` por defecto = `tf`).
- **NO** hubo **commit** ni **push**.
- `git status` sin cambios nuevos en ficheros versionados (solo untracked preexistentes ajenos a esta misión).
- **Único entregable:** este archivo (`docs/ONNX_DEPLOY_01_REGISTER.md`).

### Anclas de evidencia

| Ancla | Valor |
|---|---|
| Rama / HEAD | `feature/cmsc-f3c-v1-implementation` · `3afa041` |
| Commit AI-R3 | `b747288` (2026-11-15) |
| Commit AI-R4 | `449c969` (2026-11-15) |
| Imagen `ai_service` | creada `2026-10-30T07:25:34Z` |
| Contenedores activos | `sigctiarural_ai_service` · `sigctiarural_backend` · `sigctiarural_postgres_db` (todos `healthy`) |
| ONNX | `benchmark/runs/M2_efficientnet_b0/exports/model.onnx` · `4BD657B3…274EC3` · 16 102 181 B |

---

**Registro:** `ONNX-DEPLOY-01` = **IDENTIFICADO · PENDIENTE** · sin activación · sin cambios operativos.
