# AI_R3_R4_EXECUTION_PLAN

**Misión:** `AI_R3_R4_EXECUTION_PLAN`
**Naturaleza:** SOLO diseño/planificación. **NO implementa · NO modifica código · NO ejecuta · NO commits · NO push · NO OCI.**
**Contexto:** `AI_R1_EXECUTED` ✅ · `AI_R2_COMPLETE` ✅ · `M2_RECOVERED` ✅ · `AI_CANON_HYBRID` ✅ · `AI_R3_EXECUTION_READINESS_REPORT` → **`NOT_SAFE_TO_EXECUTE`** por **R-EXEC-1** (resolver binario ↔ M2 multiclase).
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-14 (America/Bogota) · **Regla:** toda afirmación anclada a disco/repo; lo no evidenciado se declara.

---

## 0. Dictamen

# `SAFE_TO_EXECUTE`

La ejecución **conjunta** `AI-R3 + AI-R4`, **en el orden de §1**, elimina **R-EXEC-1** por construcción: el resolver pasa a **detectar el modo por `model_contract_version`** y se despliega **antes** de activar M2, de modo que **nunca existe una ventana** en la que el modelo multiclase corra bajo el resolver binario. Cada fase intermedia es **retrocompatible** (observablemente idéntica al estado actual) y la transición real ocurre en **un único interruptor** (§1 · Fase 4).

Dos decisiones operativas condicionan el GO (§1.1): **D-JOINT-A** (inyección del `.onnx`: volumen vs horneado) y **D-JOINT-B** (recomendada: R3 dormido hasta Fase 4).

> **Frontera dura:** `SAFE_TO_EXECUTE` habilita **R3+R4**, **no** `R5_CLOSED` (sigue bloqueado por G-3b/holdout y por el artefacto M1 ausente — §8).

---

## 1. Orden exacto

Principio: **el consumidor del contrato nuevo se despliega antes que el productor del dato nuevo.** El resolver (R4-backend) entiende v1 y v2; el `ai_service` (R3) solo empieza a emitir v2 cuando se activa.

```
Fase 0  Snapshot / etiquetado           (sin código)
Fase 1  R4-BACKEND  resolver+contrato   (desplegar backend)     → observable: sin cambio (sigue v1/.h5)
Fase 2  R3          ai_service dormido  (desplegar ai_service)  → observable: sin cambio (AI_BACKEND=tf)
Fase 3  R4-FRONTEND presentación        (desplegar frontend)    → observable: sin cambio (sigue binario)
Fase 4  ACTIVACIÓN  AI_BACKEND=onnx     (1 interruptor)         → observable: M2 16 clases, contrato v2
Fase 5  VALIDACIÓN  A1..A8                       → veredicto de cierre
```

### Fase 0 — Snapshot / etiquetado (sin código)
1. `git tag pre-air3r4-<fecha>` sobre `9109050` (rollback de código).
2. `docker tag sigctiarural-ai_service:latest sigctiarural-ai_service:pre-air3` (rollback de imagen).
3. Registrar imagen `54bbaf867683` como referencia.
4. `docker compose -p <proyecto> -f docker-compose.yml ps` para fijar el nombre real del proyecto (R-EXEC-8).

### Fase 1 — R4-BACKEND (resolver + contrato), desplegado primero
- `semantic_prediction_resolver.py`: **detección de modo** (`model_contract_version`); mapa **16 clases** desde `taxonomy_binding_manifest…yaml`/`labels_v1.csv`; `get_class_definitions()` data-driven; `semantic_contract_version` v1→**v2** solo en modo multiclase.
- `views.py` (`AIInferenceV3View`): `contract_version` **ecoa el modo** (`v2` si multiclase, `v1` si binario); forma `prediction`/`trace`/`source_mode` intacta.
- `tests/test_semantic_prediction_resolver.py`: ampliar fixtures (conservar binario + añadir multiclase).
- **Desplegar backend.** Con el `.h5` aún servido (sin `model_contract_version`), el resolver opera en **modo v1 binario** → **cero cambio observable**.

### Fase 2 — R3 ai_service **dormido**, desplegado segundo
- `requirements.txt`: +`onnxruntime` (mantener TF, D3-C).
- `fastapi_app.py`: carga de `.onnx` + `softmax`; preprocesado M2 (`Resize256+CenterCrop224+Normalize(ImageNet)`); **selección explícita** por `AI_BACKEND`/`AI_MODEL_PATH` (**no `mtime`**, R-EXEC-4); `/health` **aditivo** (`model_loaded`, `model_backend`, **`model_contract_version`**, `scientific_scope`).
- `docker-compose.yml` (`ai_service`): `environment: AI_BACKEND=tf` (dormido) + **volumen read-only** del `.onnx` (§1.1 D-JOINT-A) + `DEPLOY`.
- `.dockerignore` (ai_models): excluir `production_models/*.h5` de la **imagen** (conservado en repo — `NADA DESAPARECE`).
- **Desplegar ai_service.** `AI_BACKEND=tf` ⇒ sirve el `.h5` como hoy → **cero cambio observable**.

### Fase 3 — R4-FRONTEND (presentación), desplegado tercero
- `AIPredictiva.jsx`: `getClassificationLabel` modo-aware (`0/1` si binario, 16 clases si v2); `SPECIES_LABELS` a 3 especies; retirar el texto “solo clasificación binaria” en modo v2; `scientificScope` desde `trace`/`prediction`.
- **Preservar los 5 exports** (`AI_INFERENCE_URL`, `buildInfoFromOfficialResponse`, `getStatusPresentation`, `getModePresentation`, `getClassificationLabel`) → **CMSC `ModelPredictCell.jsx` intacto**.
- **Desplegar frontend.** El contrato sigue en v1/binario hasta Fase 4 → UI muestra lo mismo que hoy.

### Fase 4 — ACTIVACIÓN (el único interruptor)
- `docker-compose.yml`: `AI_BACKEND=onnx` → `docker compose up -d ai_service`.
- El `ai_service` emite `model_contract_version: multiclass16` → el resolver (ya desplegado) cambia a **v2** → `/api/v3/ai/inference/` devuelve **16 clases** → la UI (ya desplegada) las presenta.
- **R-EXEC-1 no puede ocurrir:** el binario nunca interpreta 16 clases.

### Fase 5 — VALIDACIÓN
Ejecutar A1..A8 (§6). Si algún PASS falla → rollback de fase (§5).

### 1.1 Decisiones operativas (condicionan el GO)
| ID | Decisión | Recomendación |
|---|---|---|
| **D-JOINT-A** | Inyección del `.onnx`: **volumen read-only** (toca `docker-compose.yml` bloque `ai_service`) vs `COPY` selectivo (hornea) | **Volumen** — no hornea (G-NEW-C), `NADA DESAPARECE` |
| **D-JOINT-B** | ¿R3 nace dormido (`AI_BACKEND=tf`) hasta Fase 4? | **Sí** — elimina cualquier ventana de mislabel |
| **D-JOINT-C** | `contract_version`: eco del modo (v1↔v2) vs bump global fijo a v2 | **Eco del modo** — honesto durante la transición |
| **D-JOINT-D** | Deviaton: servir **M2** (no “M1 default + M2 flag” del R5), porque **M1 no tiene artefacto** | **Declarar** la desviación; M1 sigue `M1_PARTIAL` |

---

## 2. Archivos afectados

| # | Archivo | Fase | Cambio | Tipo |
|---|---|---|---|---|
| 1 | `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py` | 1 | detección de modo + mapa 16 clases | edición |
| 2 | `src/backend/api/views.py` | 1 | `contract_version` eco del modo | edición aditiva |
| 3 | `src/backend/tests/test_semantic_prediction_resolver.py` | 1 | fixtures v1 + v2 | edición |
| 4 | `src/ai_models/requirements.txt` | 2 | +`onnxruntime`, conserva TF | edición |
| 5 | `src/ai_models/fastapi_app.py` | 2 | carga ONNX, preproc M2, softmax, `AI_BACKEND`, `/health` aditivo | edición |
| 6 | `src/ai_models/.dockerignore` | 2 | excluir `production_models/*.h5` de la imagen | edición |
| 7 | `docker-compose.yml` (`ai_service`) | 2/4 | `environment: AI_BACKEND` + volumen `:ro` | **decisión D-JOINT-A** |
| 8 | `src/frontend/src/pages/AIPredictiva.jsx` | 3 | presentación modo-aware (preserva 5 exports) | edición |

**NO se toca:** `src/frontend/.../ModelPredictCell.jsx` · `SemanticPredictionResolver` consumers de CMSC · `ai_service` endpoints `/assist` (R4 nginx) · `backend`/`frontend`/`db` fuera de #1-3 · artefactos M2 en `benchmark/runs/` (gitignored) · `.h5` versionado (se conserva).

---

## 3. Compatibilidad

| Eje | Estado | Nota |
|---|---|---|
| **Backend v1 (hoy)** | ✅ intacto | Fase 1 despliega el resolver y **sigue resolviendo v1** mientras el `.h5` no emita `model_contract_version` |
| **`.h5` histórico** | ✅ conservado | Sale del *serving* (`AI_BACKEND=onnx`), no del repo (`NADA DESAPARECE`) |
| **CMSC (`ModelPredictCell.jsx`)** | ✅ intacto | Los 5 exports de `AIPredictiva.jsx` se preservan |
| **Knowledge Hub** | ✅ sin escritura | Ningún cambio de docs/registry |
| **OCI / SIGCT Memory** | ✅ sin acción | No se crea registry ni SBOM; la Memory solo guardaría canon, no el `.onnx` |
| **EIARC `/assist`, `/api`** | ✅ intacto | El cambio es **interno** al `ai_service` |
| **Contrato público** | ✅ aditivo | Misma forma `prediction`/`trace`/`source_mode`; solo cambia el **valor** de `contract_version`/índices |
| **Consumidores binarios** | ⚠️ declarado | Deben leer `contract_version`; el Frontend Oficial se adapta en Fase 3 |
| **Docker** | ✅ rebuild scope | Solo `ai_service` (F2) + `backend` (F1) + `frontend` (F3); `db` sin cambios |

---

## 4. Riesgos

| ID | Riesgo | Sev | Mitigación |
|---|---|---|---|
| **R-EXEC-1** | Resolver binario ↔ M2 multiclase | 🔴 | **Eliminado por el orden** (resolver v2 desplegado antes de activar M2) |
| **R-J1** | Bug en la detección de modo → fallback silencioso | 🔴 | Test unitario de ambos modos; `/health` expone `model_contract_version`; validación A4 |
| **R-J2** | Preprocesado M2 divergente (Resize256/CC224/ImageNet) | 🔴 | Paridad dorada ya PASS en R2; validar logits servidos (§6 A1) |
| **R-JEXEC-2** | Rebuild de imagen re-descarga TF (imagen 3.97 GB · disco 13 GB) | 🟠 | D3-C conserva TF; disco suficiente; vigilar con `docker system df` |
| **R-J1b** | Rebuild backend/frontend re-descarga deps | 🟡 | `backend` 791 MB / `frontend` 124 MB; margen OK |
| **R-J2b** | `AI_BACKEND` mal propagado → sigue sirviendo `.h5` | 🟡 | `/health` evidencia `model_backend`; A2 |
| **R-J3** | Convivencia `.h5`+`.onnx` con selección por `mtime` | 🟡 | Selección **explícita** (R-EXEC-4) |
| **R-J4** | Etiquetas largas 16 clases rompen layout CMSC | 🟡 | Truncado/abreviatura en presentación; no cambia exports |
| **R-J5** | `contract_version` eco invierte por bug | 🟡 | Tests de los dos modos (F1) |
| **R-J6** | Rebuild con proyecto compose equivocado | 🟡 | Fijar `-p <proyecto> -f` (Fase 0.4) |
| **R-J7** | `NADA DESAPARECE`: borrar el `.h5` | 🟠 | No se elimina; solo sale del *serving*; A6 |

---

## 4.1 Riesgo residual aceptado (declarado)
Servir **M2** mientras **M1 está `M1_PARTIAL`** no cierra el gate de promoción (M1 sigue baseline canónico). **Servir ≠ promover** (`AI_CANON_HYBRID`). Se declara en el reporte de ejecución.

---

## 5. Rollback

**Por fase (preferido) y global (imagen/tag).**

| Nivel | Acción | Coste |
|---|---|---|
| **Fase 4 (activación)** | `AI_BACKEND=tf` + `up -d ai_service` → vuelve a `.h5`/v1 | 1 comando |
| **Fase 3 (frontend)** | `git checkout pre-air3r4 -- src/frontend/src/pages/AIPredictiva.jsx` + rebuild frontend | bajo |
| **Fase 2 (ai_service)** | Retirar volumen + `AI_BACKEND=tf`; o `docker tag pre-air3 → latest` + `up -d` | bajo |
| **Fase 1 (backend)** | `git checkout pre-air3r4 -- src/backend/...` + rebuild backend | bajo |
| **Global** | `git reset --hard pre-air3r4` + rebuild de las 3 imágenes desde tags `pre-air3` | medio |
| **Datos** | **Sin migraciones; sin `down -v`.** El `.h5` permanece | nulo |

Invariante: el sistema **siempre** puede volver a la línea histórica `.h5` etiquetada `HISTÓRICO`.

---

## 6. Validaciones (criterios de aceptación)

| # | Validación | PASS |
|---|---|---|
| **A1** | Paridad ONNX↔servido | logits coinciden (≤1e-3) en N muestras doradas |
| **A2** | `/health` honesto | `model_backend=onnx`, `model_loaded`=id ONNX, `model_contract_version=multiclass16`, `scientific_scope` multiclase |
| **A3** | `/infer` multiclase | `class_index` ∈ 0..15; `softmax` aplicado; label coherente con `taxonomy_binding_manifest…yaml` |
| **A4** | Contrato API | `contract_version:"v2"` **con M2**; **`"v1"` con `.h5`** (eco del modo) |
| **A5** | Frontend | muestra especie·condición; sin texto “solo binario” en v2; `fallback`/`mock` honestos |
| **A6** | `.h5` fuera de la imagen | `docker run … ls production_models` → sin `*.h5`; repo lo conserva |
| **A7** | No-regresión Docker | `backend`/`frontend`/`db`/`/assist`/`/api` intactos (R1–R4) |
| **A8** | Gobernanza | ningún artefacto presenta el `.h5` como oficial (H5 no reabre) |
| **A9** | **Holdout (G-3b)** | 🔴 **NO satisfacible hoy** — `real_world_holdout_v1` = **0** |

**Test de modo (nuevo, Fase 1):** `model_contract_version` ausente → v1 (0/1); presente `multiclass16` → v2 (0..15). Ambos en `test_semantic_prediction_resolver.py`.

---

## 7. Gates que quedarían cerrados

| Gate | Descripción | Antes | Tras R3+R4 |
|---|---|---|---|
| **G-NEW-A** | Paridad ONNX | ✅ | ✅ (ya) |
| **G-NEW-B** | Gobernanza modelo | ✅ | ✅ (ya) |
| **G-NEW-C** | Modelo inyectado, no horneado | ⏳ | **✅ CERRADO** (volumen + `.dockerignore`) |
| **G-2** | Export ONNX + paridad | ✅ | ✅ (ya) |
| **G-3** | Contrato 16 clases | ⏳ | **✅ CERRADO** (Fase 1/4) |
| **G-5** | Frontend multiclase | ❌ | **✅ CERRADO** (Fase 3) |
| **G-1** | Promoción M1 vs M2 | ✅ decisión | ✅ (**servir M2**; M1 baseline intacto) |
| **G-3b** | Validación con holdout | ❌ | ❌ **ABIERTO** (`holdout=0`) |

**R-EXEC-1** queda **resuelto** (eliminado por orden). **G-3b** permanece **abierto**.

---

## 8. Requisitos para declarar `R5_CLOSED`

`R5_CLOSED` **NO** puede declararse con R3+R4 solos. Requiere la **misión `AI-R5`** (holdout) y el cierre de P1–P4:

| # | Prerrequisito R5 | Estado tras R3+R4 | ¿Bloquea R5_CLOSED? |
|---|---|---|---|
| **P1** | Artefactos M1/M2 materializados | M2 ✅ / **M1 `M1_PARTIAL`** | ⚠️ Parcial (servir M2 autorizado) |
| **P2** | Gate G-1 resuelto o decisión de servir | ✅ decisión (`D-serve=M2`) | No |
| **P3** | `real_world_holdout` > 0 (G-3b) | 🔴 **= 0** | **SÍ (bloqueante)** |
| **P4** | Cadena ONNX (export + paridad) | ✅ (`AI-R2`) | No |

**Cierre R5 = R3+R4 (R5.1–R5.4) + R5.5 (holdout) + A1–A9.** Con R3+R4 se cierran **R5.1–R5.4** (G-2/G-3/G-5/G-NEW-C); **R5.5 (G-3b/A9)** y **R5.6 (`R5_CLOSED`)** exigirán misión **`AI-R5`** con `real_world_holdout > 0` y `validation_metrics.json` + `model_card` publicados.

**Secuencia recomendada:**
```
AI-R3+R4 (este plan, SAFE_TO_EXECUTE) ─► cierra R5.1–R5.4/G-2·G-3·G-5·G-NEW-C
        └─► AI-R5 (holdout > 0 + métricas) ─► cierra G-3b/A9 ─► R5.6 ─► R5_CLOSED ─► DOCKER_READY
```

---

## 9. Clasificación

# `SAFE_TO_EXECUTE`

**Motivo:** secuencia **consumidor-antes-que-productor** + **interruptor único** ⇒ **R-EXEC-1 imposible por construcción**. Cada fase es retrocompatible y reversible; `A1–A8` verificables.

**Condiciones del GO:** `D-JOINT-A` (volumen vs horneado) · `D-JOINT-B` (R3 dormido, recomendado) · declarar la desviación `D-JOINT-D` (servir M2).

**Frontera:** habilita **R5.1–R5.4**, **no** `R5_CLOSED`.

---

## 10. No ejecutado
Sin cambios de código · sin instalar dependencias · sin rebuild · sin tocar contenedores · sin commits · sin push · sin OCI.

## 11. Referencias (evidencia)
- `docs/AI_R3_EXECUTION_READINESS_REPORT.md` (`NOT_SAFE_TO_EXECUTE` · R-EXEC-1)
- `docs/AI_R3_ONNXRUNTIME_SERVING_PLAN.md` (`AI_R3_READY` · D3-A/B/C)
- `docs/AI_R4_SEMANTIC_CONTRACT_PLAN.md` (`AI_R4_READY` · D4-A/B/C/D)
- `docs/R5_AI_SERVING_STRATEGY_REPORT.md` (`R5_NOT_READY` · P1–P4 · A1–A9 · G-1..G-5)
- `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` (`AI_CANON_HYBRID` · `AI_SERVING_ONNX`)
- `docs/AI_R2_EXECUTION_REPORT.md` · `docs/ai/artifacts/M2_ONNX_EXPORT_RECORD.md`
- `src/ai_models/{fastapi_app.py,requirements.txt,.dockerignore,Dockerfile}` · `docker-compose.yml`
- `src/backend/{api/views.py,infrastructure/external/ai_service/semantic_prediction_resolver.py,tests/test_semantic_prediction_resolver.py}`
- `src/frontend/src/pages/AIPredictiva.jsx` · `docs/ai/manifests/taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml`
- `data/datasets/agriculture_images_tomato-potato-corn/v1/holdout/real_world_holdout_v1` → **0 ficheros**

**Sin implementar · sin modificar código · sin commits · sin push · sin OCI.**
