# PRE_COMMIT_CLASSIFICATION

**Misión:** `PRE_COMMIT_CLASSIFICATION`
**Naturaleza:** SOLO análisis/clasificación. **NO modifica código · NO stage · NO commits · NO push.**
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050` · **adelante de origin:** **37 commits**
**Fecha:** 2026-10-14 (America/Bogota) · **Regla:** toda afirmación anclada a `git status/diff`.

---

## 0. Resumen

- **8 archivos modificados** (tracked, sin stage): `.dockerignore`, `.env.example`, `docker-compose.yml`, `src/ai_models/fastapi_app.py`, `src/backend/Dockerfile`, `src/backend/api/urls.py`, `src/backend/requirements.txt`, `src/frontend/Dockerfile` → **+59 / −15**.
- **40 untracked**: 37 `.md` en `docs/`, 1 dir `docs/ai/artifacts/`, 1 `docs/ai/manifests/model_registry.agriculture_v2.yaml`, 1 `src/backend/api/health.py`, 1 `STAGE_FREEZE_20261013.txt` (raíz).
- **Prohibido por canon:** este reporte **no** ejecuta nada. Los commits son **propuesta**.

> **Hallazgo clave:** los **8 archivos modificados NO fueron tocados en las misiones de esta sesión** (todas fueron SOLO diseño/documentación). Pertenecen a la **oficialización Docker R1–R4** y a un **fix de preprocesado del `.h5`**, ya presentes en el árbol de trabajo. Se clasifican tal cual; **no** se asume su autoría.

---

## 1. Evidencia

### 1.1 `git status` (modificados)
```
modified:   .dockerignore
modified:   .env.example
modified:   docker-compose.yml
modified:   src/ai_models/fastapi_app.py
modified:   src/backend/Dockerfile
modified:   src/backend/api/urls.py
modified:   src/backend/requirements.txt
modified:   src/frontend/Dockerfile
```

### 1.2 `git diff --stat`
```
.dockerignore                |  5 +++++
.env.example                 |  8 +++++---
docker-compose.yml           | 38 ++++++++++++++++++++++++++++++++------
src/ai_models/fastapi_app.py |  8 +++-----
src/backend/Dockerfile       |  2 +-
src/backend/api/urls.py      |  2 ++
src/backend/requirements.txt |  3 +++
src/frontend/Dockerfile      |  8 ++++++++
8 files changed, 59 insertions(+), 15 deletions(-)
```

### 1.3 Contenido de los diffs (síntesis)
| Archivo | Cambio real |
|---|---|
| `.dockerignore` | `!tools`, `!tools/cmsc-data-logger/src/**` (permite el bridge en la imagen) |
| `.env.example` | URLs de mismo-origen (`/api`) en vez de host cloud |
| `docker-compose.yml` | `restart`, **healthchecks** (backend/ai_service/frontend), `depends_on: service_healthy`, mysql `profile`, args Vite relativos |
| `src/ai_models/fastapi_app.py` | **elimina doble normalización** en `preprocess_image` (`[0,255]` → el modelo normaliza) |
| `src/backend/Dockerfile` | `runserver` → **gunicorn** (3 workers) |
| `src/backend/api/urls.py` | añade `path('health/', health)` |
| `src/backend/requirements.txt` | +`gunicorn==23.0.0` |
| `src/frontend/Dockerfile` | `location = /assist` → proxy a `ai_service:8081` |

### 1.4 Untracked
- **`src/backend/api/health.py`** (nuevo, endpoint liveness) — requerido por `urls.py` y el healthcheck.
- **`docs/ai/artifacts/`** → `M2_ARTIFACT_RECORD.md`, `M2_ONNX_EXPORT_RECORD.md`, `model_cards/M2_efficientnet_b0.model_card.md`.
- **`docs/ai/manifests/model_registry.agriculture_v2.yaml`** (nuevo; el resto de `manifests/` ya está versionado).
- **37 documentos `.md`** en `docs/` (lista completa en §2).
- **`STAGE_FREEZE_20261013.txt`** (raíz) → **snapshot diffstat** de un freeze del 13-oct; **artefacto temporal**.

---

## 2. Clasificación (A–E)

### A. Código productivo
| Archivo | Nota |
|---|---|
| `src/backend/api/health.py` | **NUEVO** — endpoint liveness `GET /api/health/` |
| `src/backend/api/urls.py` | ruta `health/` |

### B. Infraestructura Docker
| Archivo | Nota |
|---|---|
| `docker-compose.yml` | healthchecks + restart + depends_on + same-origin + mysql profile |
| `.dockerignore` | exponer `tools/cmsc-data-logger` |
| `.env.example` | URLs relativas mismo-origen |
| `src/backend/Dockerfile` | gunicorn |
| `src/frontend/Dockerfile` | proxy `/assist` |
| `src/backend/requirements.txt` | +gunicorn (dependencia del contenedor de producción) |

### 1bis. Puente A↔B
`src/backend/api/urls.py` + `health.py` + `requirements.txt`(gunicorn) existen **para** el healthcheck de `docker-compose.yml` ⇒ forman **una unidad** (se propone en el mismo commit que B).

### 2. Categoría **C — IA canónica**
| Archivo | Motivo |
|---|---|
| `src/ai_models/fastapi_app.py` | fix preprocesado del serving (IA) |
| `docs/ai/artifacts/M2_ARTIFACT_RECORD.md` | artefacto M2 |
| `docs/ai/artifacts/M2_ONNX_EXPORT_RECORD.md` | export ONNX (AI-R2) |
| `docs/ai/artifacts/model_cards/M2_efficientnet_b0.model_card.md` | model card M2 |
| `docs/ai/manifests/model_registry.agriculture_v2.yaml` | registro de modelos |
| `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` | `AI_CANON_HYBRID` |
| `docs/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md` | `AI_SERVING_ONNX` |
| `docs/AI_R1_ARTIFACT_IMPLEMENTATION_PLAN.md` | plan AI-R1 |
| `docs/AI_R1_EXECUTION_READINESS_REPORT.md` | readiness AI-R1 |
| `docs/AI_R1_EXECUTION_REPORT.md` | ejecución AI-R1 |
| `docs/AI_R2_ONNX_EXECUTION_PLAN.md` | plan AI-R2 |
| `docs/AI_R2_EXECUTION_REPORT.md` | ejecución AI-R2 |
| `docs/AI_R3_ONNXRUNTIME_SERVING_PLAN.md` | plan AI-R3 |
| `docs/AI_R3_EXECUTION_READINESS_REPORT.md` | readiness AI-R3 |
| `docs/AI_R3_R4_EXECUTION_PLAN.md` | plan conjunto R3+R4 |
| `docs/AI_R4_SEMANTIC_CONTRACT_PLAN.md` | plan AI-R4 |
| `docs/AI_R5_HOLDOUT_STRATEGY_REPORT.md` | estrategia holdout R5 |
| `docs/H5_AI_GOVERNANCE_CLOSURE_REPORT.md` | `H5_CLOSED` |
| `docs/R5_AI_SERVING_STRATEGY_REPORT.md` | `R5_NOT_READY` |
| `docs/M1_M2_ARTIFACT_RECOVERY_REPORT.md` | recuperación M1/M2 |
| `docs/M1_M2_GOVERNANCE_CLOSURE_REPORT.md` | `M1_BASELINE_M2_CHALLENGER` |
| `docs/M1_RECOVERY_AUDIT_REPORT.md` | auditoría M1 |
| `docs/M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md` | `M2_RECOVERED` |
| `docs/PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md` | forense (conservar) |
| `docs/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` | forense (conservar) |
| `docs/PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md` | forense (conservar) |

### 3. Categoría **D — Documentación** (operativa/estrategia, no-IA o transversal)
| Archivo |
|---|
| `docs/DOCKER_OFFICIAL_EXECUTION_PLAN.md` |
| `docs/DOCKER_READY_CLOSURE_REPORT.md` |
| `docs/DOCKER_READY_FINAL_DECISION_REPORT.md` |
| `docs/DOCKER_READY_R1_R4_EXECUTION_PLAN.md` |
| `docs/DOCKER_READY_R1_R4_REPORT.md` |
| `docs/DOCKER_READY_REMEDIATION_PLAN.md` |
| `docs/R6_R7_EXECUTION_PLAN.md` |
| `docs/IA_PREDICTIVA_REALITY_REPORT.md` |
| `docs/IA_PREDICTIVA_F0_F3_REPORT.md` |
| `docs/IA_PREDICTIVA_F4_REPORT.md` |
| `docs/IA_PREDICTIVA_RECOVERY_PLAN.md` |
| `docs/IA_PREDICTIVA_RECOVERY_EXECUTION_PLAN.md` |
| `docs/IA_PREDICTIVA_EXECUTION_READINESS_REPORT.md` |
| `docs/SIGCT_MEMORY_IMPLEMENTATION_READINESS_REPORT.md` |
| `docs/SIGCT_MEMORY_M0_DECISION_ACTA.md` |
| `docs/PRE_COMMIT_FORENSIC_REVIEW.md` |

### 4. Categoría **E — Temporales / no commitear**
| Archivo | Motivo |
|---|---|
| `STAGE_FREEZE_20261013.txt` | **snapshot diffstat temporal** en la raíz del repo; no es fuente canónica |

> **Recomendación E:** **no** stagear (o moverlo a `.local_backups/` / borrarlo como artefacto). No añadir a git.

---

## 4. Commits propuestos

> **3 commits.** Cada uno cohesivo y revertible. **NO ejecutados.**

### Commit 1 — Docker Oficial R1–R4 (grupos A + B)
**Mensaje:**
```
feat(docker): oficialización R1–R4 (healthchecks, gunicorn, same-origin, proxy /assist)

- compose: restart + healthchecks (backend/ai_service/frontend) + depends_on:service_healthy
- backend: gunicorn (prod) + endpoint GET /api/v1/health/
- frontend: proxy nginx /assist -> ai_service:8081
- env/vite: URLs relativas mismo-origen; mysql bajo profile
```
**Archivos:**
```
.dockerignore
.env.example
docker-compose.yml
src/backend/Dockerfile
src/backend/requirements.txt
src/backend/api/urls.py
src/backend/api/health.py
src/frontend/Dockerfile
```
**Riesgo:** bajo · **tipo:** código+infra · **unidad:** healthcheck↔health↔gunicorn.

### Commit 2 — IA canónica (grupo C)
**Mensaje:**
```
fix(ai): eliminar doble normalización en preprocesado del serving + registro canónico IA

- src/ai_models: preprocess_image sin segunda normalización ([0,255])
- docs/ai: model_registry + artifacts (M2, ONNX) + model_card
- docs: cadena de gobernanza IA (H5, M1/M2, AI-R1..R5, PLANT_DISEASE forenses)
```
**Archivos:**
```
src/ai_models/fastapi_app.py
docs/ai/artifacts/
docs/ai/manifests/model_registry.agriculture_v2.yaml
docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md
docs/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md
docs/AI_R1_ARTIFACT_IMPLEMENTATION_PLAN.md
docs/AI_R1_EXECUTION_READINESS_REPORT.md
docs/AI_R1_EXECUTION_REPORT.md
docs/AI_R2_ONNX_EXECUTION_PLAN.md
docs/AI_R2_EXECUTION_REPORT.md
docs/AI_R3_ONNXRUNTIME_SERVING_PLAN.md
docs/AI_R3_EXECUTION_READINESS_REPORT.md
docs/AI_R3_R4_EXECUTION_PLAN.md
docs/AI_R4_SEMANTIC_CONTRACT_PLAN.md
docs/AI_R5_HOLDOUT_STRATEGY_REPORT.md
docs/H5_AI_GOVERNANCE_CLOSURE_REPORT.md
docs/R5_AI_SERVING_STRATEGY_REPORT.md
docs/M1_M2_ARTIFACT_RECOVERY_REPORT.md
docs/M1_M2_GOVERNANCE_CLOSURE_REPORT.md
docs/M1_RECOVERY_AUDIT_REPORT.md
docs/M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md
docs/PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md
docs/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md
docs/PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md
```
**Riesgo:** bajo · **nota:** `fastapi_app.py` será re-tocado por `AI-R3`; commitear ahora es válido.

### Commit 3 — Documentación operativa (grupo D)
**Mensaje:**
```
docs(governance): planes/reportes Docker Oficial, IA Predictiva y SIGCT Memory
```
**Archivos:**
```
docs/DOCKER_OFFICIAL_EXECUTION_PLAN.md
docs/DOCKER_READY_CLOSURE_REPORT.md
docs/DOCKER_READY_FINAL_DECISION_REPORT.md
docs/DOCKER_READY_R1_R4_EXECUTION_PLAN.md
docs/DOCKER_READY_R1_R4_REPORT.md
docs/DOCKER_READY_REMEDIATION_PLAN.md
docs/R6_R7_EXECUTION_PLAN.md
docs/IA_PREDICTIVA_REALITY_REPORT.md
docs/IA_PREDICTIVA_F0_F3_REPORT.md
docs/IA_PREDICTIVA_F4_REPORT.md
docs/IA_PREDICTIVA_RECOVERY_PLAN.md
docs/IA_PREDICTIVA_RECOVERY_EXECUTION_PLAN.md
docs/IA_PREDICTIVA_EXECUTION_READINESS_REPORT.md
docs/SIGCT_MEMORY_IMPLEMENTATION_READINESS_REPORT.md
docs/SIGCT_MEMORY_M0_DECISION_ACTA.md
docs/PRE_COMMIT_FORENSIC_REVIEW.md
```
**Riesgo:** nulo (solo docs).

### Grupo E — NO commitear
```
STAGE_FREEZE_20261013.txt    (temporal; excluir o mover, no stage)
```

---

## 4.1 Orden sugerido
`Commit 1` → `Commit 2` → `Commit 3`. Independientes; cualquier orden es válido, pero 1→2→3 refleja dependencia conceptual (Docker sostiene el serving; IA luego docs).

---

## 5. Notas / riesgos / decisiones

| # | Nota |
|---|---|
| N1 | **Los 8 modificados no provienen de esta sesión** (misiones documentales). Confirmar autoría antes de commitear. |
| N2 | **`STAGE_FREEZE_20261013.txt`** parece un diffstat de un freeze previo del 13-10; **no** es contenido canónico → grupo E. |
| N3 | **CRLF→LF**: git avisa en `.env.example`, `docker-compose.yml`, `fastapi_app.py`, `urls.py`, `requirements.txt`. Sin impacto funcional. |
| N4 | `docs/ai/artifacts/` es **directorio nuevo** (3 archivos); `model_registry` es **nuevo** (los demás manifiestos ya eran tracked). |
| N5 | `gunicorn` y el healthcheck de backend son **co-dependientes**: separar `requirements.txt` de `docker-compose.yml` rompería el arranque. Van juntos (Commit 1). |
| N6 | La rama va **37 commits adelante de origin**; **push sigue prohibido** sin orden explícita. |
| N7 | `benchmark/runs/` (M2, ONNX) está **gitignored** → no aparece en `status`; correcto. |

---

## 6. No ejecutado
Sin stage · sin `git add` · sin commits · sin push · sin modificar código ni documentación. `git status` intacto.

---

## 7. Referencias (evidencia)
- `git status` · `git diff --stat` · `git diff` (8 archivos) · `git log --oneline -5`
- `src/backend/api/health.py` (nuevo) · `src/ai_models/fastapi_app.py` (fix)
- `.gitignore` (`:20 benchmark/runs/`, `docs/ai/**` permitido)
