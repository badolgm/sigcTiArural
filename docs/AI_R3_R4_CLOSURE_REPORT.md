# AI-R3 + AI-R4 — Reporte de cierre y trazabilidad

**Misión:** `ASUS_DOCUMENTATION_CIERRE_AI-R3_AI-R4`
**Naturaleza:** SOLO documentación/trazabilidad. **NO implementa · NO modifica código · NO activa ONNX · NO commits · NO push.**
**Fecha:** 2026-11-15 (America/Bogota)
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `449c969`
**Precedentes:** `docs/AI_R3_ONNXRUNTIME_SERVING_PLAN.md` · `docs/AI_R3_EXECUTION_READINESS_REPORT.md` (`NOT_SAFE_TO_EXECUTE` en aislamiento) · `docs/AI_R4_SEMANTIC_CONTRACT_PLAN.md` (`AI_R4_READY`) · `docs/AI_R3_R4_EXECUTION_PLAN.md` (`SAFE_TO_EXECUTE`) · `docs/AI_R2_EXECUTION_REPORT.md` (`AI_R2_COMPLETE`)
**Regla:** toda afirmación anclada a commit/disco/repo; lo no evidenciado se declara como tal.

---

## 0. Dictamen

# `READY_FOR_ONNX_ACTIVATION = TRUE`

AI-R3 y AI-R4 quedan **mutuamente consistentes** y **auditados con ejecución real end-to-end** (ambos modos). El motor ONNX está **implementado pero dormido**; la activación es un **único interruptor** (`AI_BACKEND=onnx`) y **no fue accionado**.

> **Frontera dura:** este cierre **no activa** ONNX, **no** cierra AI-R5 (`real_world_holdout_v1` sigue vacío) y **no** habilita el Evidence Ledger. Ver §6.

---

## 1. Objetivos

### 1.1 AI-R3 — ruta ONNX de servicio, dormida

Introducir un **segundo motor de inferencia (ONNX Runtime)** en `ai_service` **sin activarlo**:

- `AI_BACKEND=tf` (default) sirve el `.h5` histórico como hoy → **comportamiento observable idéntico**.
- `AI_BACKEND=onnx` sirve `model.onnx` (M2) → lo activa AI-R4/Fase 4.
- `auto` **descartado a propósito**; valor desconocido **cae a `tf`** (fail-safe: nunca enciende ONNX solo).
- El `.onnx` se **inyecta en runtime** (bind mount read-only); **no se hornea** (G-NEW-C).

### 1.2 AI-R4 — contrato semántico multiclase (v2)

Eliminar el `binary_only` y resolver las **16 clases canónicas**:

- El resolver del backend **detecta el modo (v1/v2)** por el contrato del modelo, **sin heurísticas frágiles**.
- Se **conserva v1** íntegro (compatibilidad hacia atrás).
- La presentación de UI se vuelve **mode-aware** (especie + enfermedad), preservando los exports que consume CMSC.

**Principio de orden (de `AI_R3_R4_EXECUTION_PLAN`):** *el consumidor del contrato nuevo se despliega antes que el productor del dato nuevo.* Así **nunca existe una ventana** en que el modelo multiclase corra bajo el resolver binario (cierra **R-EXEC-1** por construcción).

---

## 2. Commits asociados

| Misión | Commit | Fecha | Mensaje | Diffstat |
|---|---|---|---|---|
| AI-R3 | `b747288` | 2026-11-15 | `feat(ai): implement AI-R3 dormant ONNX serving path` | 4 archivos · **+229 / −20** |
| AI-R4 | `449c969` | 2026-11-15 | `feat(ai): implement AI-R4 multiclass semantic contract` | 5 archivos · **+586 / −21** |

**HEAD de cierre:** `449c969a81a0ffb52adbc3d3179abc8b939be010` (no pusheado).
**Base previa de la línea AI:** `9109050` (`feat(frontend): complete officialization phases 1 and 2`).

---

## 3. Archivos modificados

### 3.1 AI-R3 (`b747288`)

| Archivo | Cambio | Propósito |
|---|---|---|
| `docker-compose.yml` | `+8` | Env `AI_BACKEND=${AI_BACKEND:-tf}` · `AI_MODEL_PATH=${AI_MODEL_PATH:-/app/models/model.onnx}` + bind mount `:ro` del `.onnx` |
| `src/ai_models/fastapi_app.py` | `+160/−` | `AI_BACKEND` (parse fail-closed) · `_load_onnx_model` · `_load_tf_model` · `load_latest_model()` · `_preprocess_image_onnx` · `_softmax` · identidad/contrato de artefacto |
| `src/ai_models/model_identity.py` | `+78/−` | `_candidate_files(..., include_onnx=False)` (aditivo, default retrocompatible) · selección explícita de artefacto |
| `src/ai_models/requirements.txt` | `+3` | Pin `onnxruntime==1.31.0` |

### 3.2 AI-R4 (`449c969`)

| Archivo | Cambio | Propósito |
|---|---|---|
| `src/ai_models/fastapi_app.py` | `+4` | **R4-PLU:** `_identity_fields` añade `model_contract_version` a `/infer` (eco de `_model_contract_version()`) |
| `src/backend/api/views.py` | `+9/−` | Envelope V3 publica `contract_version`; trace añade `model_contract_version`/`model_sha256`; ramas de error permanecen `"v1"` |
| `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py` | `+366` | `CLASS_DEFINITIONS_V2` · `_resolve_contract_mode` · `_resolve_model_contract_version` (coexistencia v1/v2) |
| `src/backend/tests/test_semantic_prediction_resolver.py` | `+184` | 15 tests (4 v1 + 11 v1/v2) |
| `src/frontend/src/pages/AIPredictiva.jsx` | `+44/−` | Presentación mode-aware; `SPECIES_LABELS` ampliado; `getClassificationLabel(idx, prediction)`; 7 exports intactos (línea 790) |

---

## 4. Riesgos

### 4.1 Riesgos encontrados (heredados de la readiness/plan) y su estado

| ID | Riesgo | Sev | Estado tras AI-R3+R4 |
|---|---|---|---|
| **R-EXEC-1** | **Regresión semántica en vivo:** resolver binario (`0=enferma`,`1=sana`) vs M2 (16 clases) → `class_1` = `corn__common_rust` (enfermedad) se mostraría "sana" | 🔴 | **MITIGADO por construcción.** El resolver v2 se despliega antes de activar; `AI_BACKEND=tf` mantiene el `.h5`. Verificado E2E en ambos modos (§7). |
| **R-EXEC-2** | Rebuild de imagen por cambio en `requirements.txt` ⇒ capa `pip install` invalidada ⇒ re-descarga TF (~600 MB+) | 🟠 | **Mitigado.** Pin único (`onnxruntime==1.31.0`); disco suficiente. |
| **R-EXEC-3** | `onnxruntime` ausente en repo/contenedor | 🟠 | **Mitigado.** Pin en `requirements.txt` + guard `ONNX_AVAILABLE` (no rompe si falta). |
| **R-EXEC-4** | Convivencia `.h5` + `.onnx` y selección por `mtime` (impredecible) | 🟡 | **Mitigado.** Selección **explícita por `AI_BACKEND`**; `MODELS_DIR` sigue con globs `.h5`/`.keras` → el `.onnx` montado **no secuestra** la ruta `tf`. |
| **R-EXEC-5** | Preprocesado divergente (`.h5` sin normalizar vs M2 ImageNet) | 🟠 | **Mitigado.** `_preprocess_image_onnx` replica AI-R2 (Resize 256 → CenterCrop 224 → `[0,1]` → Normalize ImageNet → NCHW). Ruta `.h5` **intacta**. |
| **R-EXEC-6** | Logits sin softmax ⇒ `confidence` incorrecta | 🟡 | **Mitigado.** `_softmax` aplicado sobre logits ONNX. |
| **R-EXEC-7** | Healthcheck de compose depende de `/health == 200` | 🟢 | **Mitigado.** Cambios **aditivos**; `/health` sigue **siempre 200** (la alarma viaja en `model_status`). |
| **R-EXEC-8** | Proyecto compose no listado por el nombre esperado | 🟡 | **Operativo, no tocado.** Verificar `-f <ruta> -p <proyecto>` al reconstruir. |

### 4.2 Riesgos mitigados por el diseño conjunto

- **Cierre de R-EXEC-1** (el de severidad 🔴): el resolver entiende **v1 y v2** y el modo se decide por el **contrato del modelo**, no por heurísticas de índice. La transición real ocurre en **un solo interruptor**.
- **Aislamiento del interruptor:** `AI_BACKEND` inválido/ausente → `tf`. ONNX no puede encenderse "solo".
- **No horneado del binario:** el `.onnx` vive fuera del contexto de build y entra por bind mount `:ro` → la imagen no crece ni filtra el artefacto.

### 4.3 Riesgos residuales declarados (no bloqueantes)

- **OBS-1** y **OBS-2** (ver §5) — cosmético / prerrequisito operativo.
- **R-EXEC-8** — operativo de despliegue.

---

## 5. Hallazgos relevantes y observaciones abiertas

### 5.1 Hallazgos

| ID | Hallazgo | Evidencia |
|---|---|---|
| H1 | **Detección de modo fail-closed:** desconocido/ausente → `v1`. | `semantic_prediction_resolver.py` `_resolve_contract_mode` |
| H2 | **v2 se detecta por contrato:** `model_contract_version == "agriculture_v2_multiclass16"`, con fallback (`class_space == 16` + `.onnx`). | `_resolve_model_contract_version` |
| H3 | **R4-PLU elimina heurísticas frágiles:** `/infer` ahora transporta `model_contract_version`. | `fastapi_app.py:357` (`_identity_fields`) |
| H4 | **v2 correcto en imágenes reales:** 16/16 clases de `curated/validation` clasificadas correctamente. | Prueba E2E con `TestClient` (§7.2) |
| H5 | **`/health.semantic_contract_version` queda en `"v1"` incluso bajo ONNX** (constante, no derivada del modo). | `model_identity.py:55` → `fastapi_app.py:438`/`:332` (**OBS-1**) |
| H6 | **ONNX no horneado** (bind mount `:ro`); artefacto gitignored. | `docker-compose.yml` · `.gitignore:20` |
| H7 | **`class_index_map` coincide exactamente con `CLASS_DEFINITIONS_V2`** (16/16). | `exports/export_record.json` |
| H8 | **Acoplamiento CMSC intacto:** únicos importadores de `AIPredictiva.jsx` son `App.jsx:17` (default) y `ModelPredictCell.jsx:6` (5 named); 7 exports preservados. | `grep` + build |
| H9 | **`.h5` preexistente ROTO** (doble-normalización → colapsa a `class_0`); **no** modificado por R3/R4. | `fastapi_app.py` `preprocess_image` (rama `tf` intacta) |

### 5.2 Observaciones abiertas

| ID | Observación | Impacto | Bloqueante |
|---|---|---|---|
| **OBS-1** | `semantic_contract_version` de `/health` **desalineado** respecto a `model_contract_version` bajo ONNX (`"v1"` constante vs `agriculture_v2_multiclass16`). **No lo consume ningún código** (el frontend usa `trace.model_contract_version`; el resolver deriva de `model_contract_version`/`class_space`). | Cosmético / latente (segunda verdad semántica en `/health`) | **NO** |
| **OBS-2** | El modelo ONNX está **gitignored** (`.gitignore:20` → `benchmark/runs/`) y no se hornea; **debe existir físicamente en el host de despliegue** al activar. Si falta, `_load_onnx_model` no encuentra candidato y **no sirve un modelo equivocado** (falla segura → identidad `unknown`/v1). | Operativo | **NO** |
| **OBS-3** | `.h5` colapsa predicciones a `class_0` (doble-normalización "ROTO", histórico). | Preexistente; sin cambios por R3/R4 | **NO** |

---

## 6. Compatibilidad v1 / v2 · Rollback · Estado final

### 6.1 Compatibilidad v1 (TensorFlow · `.h5` histórico)

`AI_BACKEND=tf` (default). Evidencia E2E:

| Campo | Valor observado |
|---|---|
| `/health.model_backend` | `tf` |
| `/health.model_loaded` | `plant_disease_mbv2.h5` |
| `/health.model_contract_version` | `binary_only` |
| `/health.class_space` | `2` |
| `/health.class_labels` | `["enferma","sana"]` |
| `/health.model_status` / `superseded_by` | `HISTORICO` / `M2_efficientnet_b0_001` |
| `/health.model_sha256` | `77b0efec…0219c0` |
| Backend E2E (`/api/v3/ai/inference/`) | HTTP **200** · `contract_version=v1` · `prediction_code=plant_condition.binary.unhealthy` · `semantic_contract_version=v1` · `canonical_class_id=None` · trace `model_contract_version=binary_only` |

**Resultado:** v1 **operativo e idéntico** al estado previo. ✔

### 6.2 Compatibilidad v2 (ONNX · M2)

`AI_BACKEND=onnx`. Evidencia E2E:

| Campo | Valor observado |
|---|---|
| `/health.model_backend` | `onnx` |
| `/health.model_loaded` | `model.onnx` |
| `/health.model_contract_version` | `agriculture_v2_multiclass16` |
| `/health.class_space` | `16` |
| `/health.model_sha256` | `4bd657b3…74ec3` |
| `/infer` (16 imgs reales) | **16/16** argmax coincide con la carpeta |
| Backend E2E (`/api/v3/ai/inference/`) | HTTP **200** · `contract_version=v2` · `prediction_code=agriculture.tomato.disease.septoria_leaf_spot` · `canonical_class_id=tomato__septoria_leaf_spot` · `taxonomy_version=agriculture_v2_taxonomy_v1` · trace `model_contract_version=agriculture_v2_multiclass16` |

**Resultado:** v2 **funcional y semánticamente correcto**. ✔

### 6.3 Rollback validado

| Vía | Procedimiento | Resultado |
|---|---|---|
| En proceso | Forzar `model_backend="onnx"` + `model_name="model.onnx"`, luego `load_latest_model()` con `AI_BACKEND=tf` | Devuelve `tf` + `plant_disease_mbv2.h5` ✔ |
| En servicio | Parar uvicorn ONNX · reiniciar con env borrado | `/health` → `model_backend=tf` ✔ |

**Rollback = `AI_BACKEND=tf`** (un valor de entorno; no requiere rebuild ni migración). ✔

### 6.4 Prerrequisitos de activación (registro explícito)

1. **Verificar existencia física de:**
   `benchmark/runs/M2_efficientnet_b0/exports/model.onnx`
   (16 102 181 B · SHA-256 `4BD657B363407D4012F013589A5469DCA57B9C5E347A9EA54E1F6E57A3274EC3`) — hoy gitignored, debe existir en el host de despliegue.
2. **Cambiar:** `AI_BACKEND=onnx` (interruptor único; opcionalmente `AI_MODEL_PATH` si la ruta difiere).
3. **Ejecutar validaciones finales** (A1..A8 del plan; mínimo: `/health` = `onnx`/`agriculture_v2_multiclass16`, E2E v2, 16/16 de sanidad, gates).
4. **Mantener rollback:** `AI_BACKEND=tf` (revierte a v1 sin rebuild).

### 6.5 Estado final del sistema

| Componente | Estado |
|---|---|
| AI-R3 | **COMPLETADO** |
| AI-R4 | **COMPLETADO** |
| TensorFlow v1 | **OPERATIVO** |
| ONNX v2 | **IMPLEMENTADO** |
| ONNX activado | **NO** |
| Rollback | **VALIDADO** |
| CMSC | **VALIDADO** |
| Frontend | **VALIDADO** |
| Backend | **VALIDADO** |

**Registro de estado de misiones:**

| Elemento | Estado |
|---|---|
| AI-R3 | ✅ |
| AI-R4 | ✅ |
| `READY_FOR_ONNX_ACTIVATION` | ✅ TRUE |
| AI-R5 | ⏳ (`real_world_holdout_v1` pendiente — **0 archivos**) |
| Evidence Ledger | ⏳ |

### 6.6 Validaciones de cierre (evidencia)

| Validación | Resultado |
|---|---|
| Working tree AI (`src/ai_models`, `src/backend`, `src/frontend`) | **limpio** (`git diff HEAD` vacío) |
| Suite backend | **240 passed** |
| `vite build` (frontend) | **✓** (~23 s) |
| ESLint `AIPredictiva.jsx` | **0 errores** (2 warnings preexistentes) |
| Importadores/exports de `AIPredictiva.jsx` | **7 exports intactos** · 2 importadores preservados |
| Puerto 8081 | **libre** (servicios de auditoría detenidos) |

---

## 7. Invariantes respetadas

- **NO** se activó ONNX · **NO** commit · **NO** push.
- **NO** se modificó `AGENTS.md`, `docs/CANONICAL_PROJECT_STATE_20261109.md`, `docs/CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md`, `docs/CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md`, `docs/MAPA_MAESTRO_ECOSISTEMA_SIGCT_RURAL_V1.md`, `docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md` (D-003).
- CMSC · Knowledge Hub · Docker Oficial · OCI · SIGCT Memory — **sin cambios**.
- Este documento es **el único artefacto creado** en esta misión.

---

## 8. Recomendación del siguiente paso técnico

| Opción | Descripción | Recomendación |
|---|---|---|
| **A. Activación ONNX controlada** | Fase 4 del plan: verificar `.onnx` en host → `AI_BACKEND=onnx` → validaciones A1..A8 → mantener `AI_BACKEND=tf` como rollback. | **Recomendada si el objetivo es servir M2 (16 clases).** Es reversible con un valor de entorno, no requiere rebuild y cierra R-EXEC-1 por construcción. |
| **B. AI-R5** | Cerrar `real_world_holdout_v1` (captura real + diagnóstico fitopatológico; ≥30/clase, ≥480 totales; hoy **0**). | **Recomendada como siguiente hito de calidad**, pero es **operación de campo** (no de código) y **no** depende de la activación ONNX. |

**Orden sugerido:** **A (activación controlada)** para materializar el valor ya auditado, y **B (AI-R5)** en paralelo/como hito siguiente para medir la brecha laboratorio→campo. La activación **no** cierra AI-R5 ni habilita el Evidence Ledger.

> **Cierre:** `AI-R3 ✅ · AI-R4 ✅ · READY_FOR_ONNX_ACTIVATION ✅` — sin activación, sin push, sin cambios de gobernanza.
