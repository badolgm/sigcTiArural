# R5_AI_SERVING_STRATEGY_REPORT

**Misión:** `R5_AI_SERVING_STRATEGY`
**Naturaleza:** SOLO estrategia/diseño. **NO implementa · NO entrena · NO modifica código · NO genera modelos · NO commits · NO push · NO OCI.**
**Contexto:** `H5_CLOSED` (gobernanza) · `AI_CANON_HYBRID` · M1 baseline · M2 challenger · `plant_disease_mbv2.h5` HISTÓRICO.
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-13 (America/Bogota) · **Regla:** toda afirmación anclada a disco/repo; lo no evidenciado se declara.

---

## 0. Dictamen

# `R5_NOT_READY`

**La estrategia definitiva está definida y es ejecutable** (§1–§7), **pero R5 no puede ejecutarse hoy**: los **checkpoints M1/M2 no existen en disco** (§8, P1), el **gate G-1 (M1 vs M2) sigue PENDIENTE** (P2), el **`real_world_holdout` está a 0** (P3) y **no hay cadena ONNX** (P4). R5 = alinear el *serving* al canon; sin artefactos canónicos no hay qué servir.

> **Matiz honesto:** existe un **interim desbloqueado** (Vía B-runtime §7.0) que hace al `ai_service` **honesto** sin M1/M2 — pero eso es *etiquetado*, **no** servir la línea canónica. Este reporte define la **Vía A (canónica ONNX M1/M2)** que es el objeto real de R5.

---

## 1. Estado actual (evidencia verificada)

| Componente | Evidencia | Hecho |
|---|---|---|
| **Servicio IA** | `src/ai_models/fastapi_app.py:161-185` | FastAPI; `load_latest_model()` elige el `.h5`/`.keras` **más reciente** por `mtime`; hoy carga `plant_disease_mbv2.h5` |
| **Inferencia** | `fastapi_app.py:210-263` | `/infer` → `{diagnosis:"class_{idx}", confidence, class_index, model, processing_time, status}`; preprocesa a 224×224 **sin doble normalización** (`:187-193`) |
| **Health** | `fastapi_app.py:199-207` | `"model_loaded":"plant_disease_mbv2.h5"` (histórico) |
| **Docker IA** | `src/ai_models/Dockerfile:1-30` | `python:3.11-slim` + ffmpeg/espeak; `COPY . .` (**hornea el modelo**); `uvicorn` |
| **Deps IA** | `src/ai_models/requirements.txt:1-13` | `tensorflow-cpu>=2.15` + voz (`SpeechRecognition`,`gTTS`,`pydub`) + `lcapy` (lab electrónica) |
| **Contrato backend** | `api/urls.py:45` · `api/views.py:335-402` | `POST /api/v3/ai/inference/` (`AIInferenceV3View`) → adapter → resolver → `{contract_version:"v1", prediction, trace, source_mode}` |
| **Resolver** | `semantic_prediction_resolver.py:4-75` | Mapa **binario hardcodeado** clases `0/1`; `semantic_contract_version:"v1"`, `scientific_scope:"binary_only"` |
| **Adaptador** | `fastapi_ai_adapter.py:34-42` | `POST http://ai_service:8081/infer` (retry); `AI_SERVICE_URL` |
| **Frontend** | `AIPredictiva.jsx:3,58-62,129-153` | Consume `prediction.*` + `trace.raw_class_index`; rotula **“solo clasificación binaria”** |
| **Pesos M1/M2** | `glob *.pt/*.pth/*.onnx` → **∅** | **M1 sin `.pth`; M2 en Drive `runs/M2_efficientnet_b0/`** (no en repo). Único `.h5` = histórico |
| **Dataset canónico** | `H5_CLOSED §1.1` | `agriculture_images_tomato-potato-corn/v1` — 22 488 imgs · 16 clases · split seed 42 · holdout 0 |

---

## 2. Q1 — Cómo pasar de `.h5` histórico a M1/M2 canónicos

**Principio:** no se “convierte” el `.h5` (está degenerado); se **sustituye la vía de serving** por la línea canónica, **desacoplando el contrato del framework** (`AI_CANON_HYBRID` §3/§7.3).

**Secuencia de sustitución (una sola vez, atómica):**

1. **Materializar el artefacto canónico** — recuperar los checkpoints: M1 (PyTorch `state_dict`) y M2 (`runs/M2_efficientnet_b0/`). Sin artefacto no hay serving.
2. **Elegir el modelo servido** — por `AI_CANON_HYBRID`, la **línea** es M1/M2; el **desempate de promoción** es el gate G-1. Estrategia recomendada: servir **M1 (baseline) como `default`** y **M2 (challenger) tras feature-flag**, ambos sobre la misma cadena ONNX → honesto con el gate pendiente.
3. **Exportar a ONNX** (§3) — neutralizar el framework (PyTorch fuera del perímetro declarado TF).
4. **Reemplazar la carga en `ai_service`** — `load_latest_model()` deja de buscar `.h5`; pasa a cargar **el `.onnx` vigente** + su `model_card`.
5. **Retirar el `.h5` del *serving*, no del repo** — **NADA DESAPARECE**: el `.h5` permanece versionado con su hash; se **excluye de la imagen** (§4) y se etiqueta `HISTÓRICO`.
6. **Generalizar el contrato a 16 clases** (§5) — `semantic_contract_version` v1→v2; `scientific_scope` `binary_only`→multiclase.
7. **Cerrar con holdout** (§7, G-3b) antes de publicar.

**Invariante:** durante toda la transición, el `ai_service` **nunca** presenta el `.h5` como oficial (regla de reversión H5: §H5 §0).

---

## 3. Q2 — Estrategia ONNX

**Objetivo:** contrato de inferencia **neutral de framework**; `ai_service` sirve ONNX Runtime; el framework de entrenamiento (PyTorch) queda fuera del runtime de producción.

| Aspecto | Definición estratégica |
|---|---|
| **Origen** | PyTorch (M1 MobileNetV2 / M2 EfficientNet-B0). Export con `torch.onnx.export` |
| **Opset** | Fijar **opset 17** (estable, ampliamente soportado por `onnxruntime` CPU) |
| **Entrada** | `float32 [N,3,224,224]` dinámico en batch; mismo tamaño que `fastapi_app.py:187` |
| **Preprocesado (CRÍTICO)** | Replicar **exactamente** la normalización del notebook (ImageNet mean/std de torchvision). El bug histórico del `.h5` fue *doble normalización* (`fastapi_app.py:188-189` ya lo evita) → **paridad obligatoria** |
| **Runtime** | `onnxruntime` (CPU) — reemplaza `tensorflow-cpu` en `requirements.txt` (menor tamaño, más rápido de arrancar) |
| **Salida** | `logits[16]` → `argmax` → `class_index 0..15`; orden = `labels_v1.csv` |
| **Metadatos** | `model_card.md` + `validation_metrics.json` + `labels_v1.csv` (autoridad del mapa índice→clase) — **un modelo sin estos NO existe** (regla del proyecto) |
| **Paridad dorada** | Test obligatorio: misma imagen → logits PyTorch ≈ ONNX ≈ servido (tolerancia ≤1e-3) |
| **Edge (futuro)** | Mismo `.onnx` → conversión a TFLite/otros en perímetro (fuera de R5) |

**Variantes:** si la paridad de opset falla, fallback a export vía `onnx` + `onnxsim`; nunca servir un ONNX no verificado.

---

## 4. Q3 — Estrategia Docker

**Principio:** la imagen sirve **runtime neutral (ONNX)** y **no hornea artefactos pesados**; el modelo se inyecta como **artefacto versionado**.

| Cambio | Estrategia |
|---|---|
| **`requirements.txt`** | Quitar `tensorflow-cpu`; añadir `onnxruntime`. Mantener voz (`SpeechRecognition`/`gTTS`/`pydub`) y `lcapy` (lab). Reduce imagen y arranque |
| **`fastapi_app.py`** | `load_latest_model()` → cargar `*.onnx` (+ `model_card`) en vez de `*.h5/*.keras`; `/health` reporta `model_loaded:<onnx-id>` y `scientific_scope` |
| **Artefacto** | Modelo **fuera de la imagen**: volumen/bind o `COPY` selectivo del `.onnx` elegido. **No** `COPY . .` de `production_models/` |
| **`.dockerignore`** | Excluir `*.h5`/`*.keras` del contexto de build de la IA (conservando el archivo en repo — NADA DESAPARECE) |
| **Healthcheck** | `GET /health` → `{status:ok, model_loaded, scientific_scope}` (el de `docker-compose.yml:85-90` sigue válido) |
| **Consistencia con R1–R4** | No altera `backend`/`frontend`/`db`; solo `ai_service` (imagen + requirements + carga) |
| **Contrato público** | nginx `/assist` (R4) intacto; `/api` proxy intacto; el cambio es **interno** al `ai_service` |

**Nota honesta:** hoy `src/ai_models/Dockerfile:21` (`COPY . .`) **hornea el modelo**. Migrar a artefacto inyectado es parte de R5.

---

## 5. Q4 — Estrategia API

**Principio:** **evolucionar el contrato, no romperlo**; el consumidor oficial (`/api/v3/ai/inference/`) conserva su forma y **generaliza** el contenido de binario a multiclase.

| Superficie | Estado (`v1` binario) | Estrategia (`v2` multiclase) |
|---|---|---|
| **Ruta** | `POST /api/v3/ai/inference/` | **Sin cambio** |
| **`contract_version`** | `"v1"` | `"v2"` (bump explícito) |
| **`semantic_contract_version`** | `"v1"` (`resolver:73`) | `v2` multiclase |
| **`scientific_scope`** | `"binary_only"` (`resolver:74`) | p.ej. `"multiclass_species_condition_16"` |
| **`prediction`** | 2 clases (`resolver:4-33`) | 16 clases (`species__condition`) — **data-driven** desde `labels_v1.csv` |
| **`prediction_code/label/species/condition`** | genéricos `binary.*` | por especie+condición reales |
| **`model_id/model_version`** | `plant_disease_classifier` + nombre `.h5` | `m1`/`m2` + versión ONNX |
| **`trace.raw_class_index`** | `0/1` | `0..15` (**forma igual**) |
| **`source_mode`** | `cloud`/`mock`/`fallback` | **Sin cambio** (regla EIARC: `fallback` preserva contrato) |
| **Punto único de cambio** | `resolver.py:82-93` (`get_class_definitions` con TODO) | Cargar definiciones desde `labels_v1.csv`/`model_card` (ya previsto en el TODO del resolver) |

**Cambio interno `/infer`:** devuelve `raw_class_index` 0..15 y `model` = id ONNX; `diagnosis` puede mantenerse `class_{idx}` (compat) o pasar a label multiclase (**a decidir**).

**Compatibilidad:** clientes que asumían binario deben consumir `contract_version`/`semantic_contract_version`; el Frontend Oficial se adapta (§6). El contrato previo **no se elimina por decreto**: se versiona.

---

## 6. Q5 — Estrategia Frontend

**Principio:** cambios de **presentación**, no de lógica de red; la UI deja de decir “binario” y muestra **especie + condición + severidad** (dato real del contrato v2).

| Archivo | Cambio |
|---|---|
| `AIPredictiva.jsx:58-62` (`getClassificationLabel`) | De casos `0/1` → mapa multiclase (índice→`especie · condición`) |
| `AIPredictiva.jsx:47-49` (`SPECIES_LABELS`) | Ampliar a las 3 especies + condiciones del `v1` |
| `AIPredictiva.jsx:141` (texto “solo clasificación binaria”) | **HISTÓRICO** → texto multiclase honesto |
| `AIPredictiva.jsx:147-148` (badges `scientific_scope`/`semantic_contract_version`) | Mostrar valores v2; badge `HISTÓRICO` si el backend reporta modelo histórico |
| **Consumo** | Sigue leyendo `prediction.*` + `trace.raw_class_index` (misma forma) → **sin reescritura de fetch** |
| **Honestidad UI** | Si `source_mode=fallback`/`mock`, mantener rótulos de simulación (ya implementado) |

**Dependencia:** `AIPredictiva.jsx` es UI congelada por misión — el cambio requiere misión explícita de frontend (gate G-5). Este reporte **no lo ejecuta**.

---

## 7. Q6 — Estrategia OCI

**OCI = registry/firma/SBOM (fuera de alcance aquí; `missions` lo prohíbe).** Relación de R5 con OCI:

1. **R5 no necesita OCI** — sirve ONNX dentro del contenedor existente; OCI es transporte/distribución posterior.
2. **Artefacto neutralizado** — al servir ONNX, la imagen es **agnóstica del framework** → apta para firmar/versionar como cualquier imagen en un futuro registry.
3. **Modelo como artefacto aparte** — el `.onnx` (con SHA-256 + `model_card`) podría versionarse como artefacto OCI independiente; **no se implementa** ahora.
4. **Alineación con `SIGCT Memory`** (mencionada en `AI_CANON_HYBRID`): la Memory excluye binarios; solo guardará **metadatos/canon**, no el `.onnx`.
5. **Regla:** R5 **no** crea registry, **no** firma, **no** genera SBOM. Solo deja la imagen en estado *listo-para-OCI*.

---

## 8. Q7 — Roadmap R5

**Prerrequisitos (bloqueantes, §9):**
- **P1** Artefactos M1/M2 materializados (M1 `.pth` ausente; M2 en Drive).
- **P2** Gate **G-1** (M1 vs M2) resuelto **o** decisión de servir M1 `default` + M2 flag.
- **P3** `real_world_holdout` > 0 antes de publicar (G-3b).
- **P4** Cadena ONNX (export + paridad) inexistente hoy.

**Fases (cada una = misión explícita, no ejecutada aquí):**

| Fase | Trabajo | Salida | Gate |
|---|---|---|---|
| **R5.0** | Prerrequisitos P1/P2/P3 | checkpoints locales + decisión de modelo | G-1 / G-3b |
| **R5.1** | Export ONNX (M1 y/o M2) + `model_card`/`labels` | `.onnx` verificado + test de paridad dorada | G-2 |
| **R5.2** | `ai_service`: runtime ONNX + carga `.onnx` + `/health` | imagen sirve ONNX; `.h5` fuera de la imagen | G-2 |
| **R5.3** | Backend: resolver **16 clases** data-driven + `contract_version v2` | `/api/v3/ai/inference/` multiclase | G-3 |
| **R5.4** | Frontend: presentación multiclase + retiro rótulo binario | UI v2 honesta | G-5 |
| **R5.5** | Validación con `real_world_holdout` + métricas publicadas | `validation_metrics.json` + `model_card` | G-3b |
| **R5.6** | Cierre R5 → habilita `DOCKER_READY` global | `R5_CLOSED` | — |

**Interim (Vía B-runtime, desbloqueado, opcional):** etiquetar el `.h5` como `HISTÓRICO` explícito en `/infer` + UI (gate G-5) — hace al `ai_service` honesto **sin** M1/M2, pero **no** satisface “servir el canon”. No sustituye a R5.

**Diagrama:**
```
.h5 (HISTÓRICO, hoy) ──┐
                       │  R5.0 artefactos + gate
M1/M2 (canónico) ──────┼─► R5.1 ONNX ─► R5.2 ai_service ─► R5.3 API v2 ─► R5.4 Frontend ─► R5.5 holdout ─► R5.6 R5_CLOSED
                       │                                             │
                       └─ interim G-5: etiqueta HISTÓRICO (desbloqueado, no canon)
```

---

## 9. Bloqueadores y riesgos

**Bloqueadores (P1–P4, §8):** su ausencia es la causa exacta de `R5_NOT_READY`.

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| RR1 | **Sin checkpoints M1/M2 en disco** → nada que servir | 🔴 Crítico | P1: materializar antes de tocar serving |
| RR2 | **Paridad de preprocesado** (doble normalización, mean/std) → predicciones inválidas | 🔴 Crítico | Test de paridad dorada PyTorch↔ONNX↔servido |
| RR3 | **Quemar el gate G-1** eligiendo M1 o M2 por decreto | Alta | Servir M1 `default` + M2 flag; NO declarar promoción |
| RR4 | **Romper consumidores** al pasar a 16 clases | Media | Bump `contract_version`/`semantic_contract_version`; forma estable |
| RR5 | **Publicar sin holdout** (G-3b) | Alta | Bloquear R5.5 sin `real_world_holdout` |
| RR6 | **Hornear el modelo** en la imagen (tamaño/drift) | Media | Artefacto inyectado; `.dockerignore` excluye `.h5`/`.keras` |
| RR7 | **Regresión Docker** (imagen IA más pesada/menos estable) | Media | `onnxruntime` reemplaza a TF (menos peso); healthcheck intacto |
| RR8 | **NADA DESAPARECE** — borrar el `.h5` | Alta | Conservar versionado + hash; solo sale del *serving* |
| RR9 | **Confundir interim G-5 con R5** | Media | El interim es etiquetado, no canon; se declara |

---

## 10. Rollback

- **Código/serving:** revertir `ai_service` a la carga `.h5` mediante el tag de respaldo (`git checkout <tag> -- src/ai_models/**`), reconstruir **solo** `ai_service`.
- **Contrato API:** volver `contract_version` a `v1`/`semantic_scope binary_only` (resolver previo). Los consumidores v2 se degradan al contrato anterior.
- **Frontend:** revertir `AIPredictiva.jsx` (UI congelada) desde git.
- **Artefacto:** conservar el `.h5` versionado (nunca se borra) → rollback trivial a la línea histórica **etiquetada HISTÓRICO**.
- **Datos/volúmenes:** R5 **no** toca DB ni volúmenes; sin `down -v`.

---

## 11. Validaciones (criterios de aceptación)

| # | Validación | Criterio PASS |
|---|---|---|
| A1 | Paridad ONNX | logits PyTorch ≈ ONNX ≈ servido (≤1e-3) en N muestras |
| A2 | `/health` honesto | `model_loaded` = id ONNX canónico; `scientific_scope` multiclase |
| A3 | `/infer` multiclase | `raw_class_index` ∈ 0..15; label coherente con `labels_v1.csv` |
| A4 | Contrato v3 | `contract_version:"v2"`; forma `prediction/trace/source_mode` intacta |
| A5 | Frontend | muestra especie·condición; **sin** texto “binario”; fallback/mock honestos |
| A6 | `.h5` fuera de la imagen | `docker run ... ls` → sin `*.h5`; repo lo conserva |
| A7 | No-regresión Docker | `backend`/`frontend`/`db`/`/assist`/`/api` intactos (R1–R4) |
| A8 | Gobernanza | ningún artefacto presenta el `.h5` como oficial (H5 no reabre) |
| A9 | Holdout (G-3b) | `real_world_holdout` > 0 + métricas publicadas antes de R5.6 |

---

## 12. Veredicto

```
┌───────────────────────────────────────────────────────────────────────────┐
│  Estrategia:  DEFINIDA (Vía A ONNX M1/M2 · contrato neutral · 16 clases)   │
│  Ejecutable:  NO — bloqueada por P1 (sin weights) · P2 (gate G-1) ·        │
│                       P3 (holdout=0) · P4 (sin cadena ONNX)                │
│  Interim:     Vía B-runtime (etiqueta HISTÓRICO) disponible y desbloqueada │
│                                                                            │
│  CLASIFICACIÓN:  R5_NOT_READY                                              │
└───────────────────────────────────────────────────────────────────────────┘
```

**R5 será `R5_READY` cuando:** existan los `.onnx` de M1/M2 **con paridad verificada**, la decisión de promoción esté gobernada (G-1/G-3b), y `ai_service`+API+frontend sirvan 16 clases por contrato neutral — todo ello mediante misión explícita. Este reporte **no implementa, no entrena, no modifica código**.

---

## 13. Referencias (evidencia)

- `src/ai_models/fastapi_app.py:161-263` · `src/ai_models/Dockerfile:1-30` · `src/ai_models/requirements.txt:1-13`
- `src/backend/api/urls.py:45` · `src/backend/api/views.py:335-402`
- `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py:4-93` · `fastapi_ai_adapter.py:34-42`
- `src/frontend/src/pages/AIPredictiva.jsx:3,58-62,129-153`
- `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md:14,123-128,151-160` (`AI_CANON_HYBRID`, gates G-1..G-5)
- `docs/H5_AI_GOVERNANCE_CLOSURE_REPORT.md:45-58,120-128` (canónico/histórico, impacto Docker)
- `docker-compose.yml:77-98` (`ai_service`, healthcheck)

**Sin implementar · sin entrenar · sin modificar código · sin commits · sin push · sin OCI.**
