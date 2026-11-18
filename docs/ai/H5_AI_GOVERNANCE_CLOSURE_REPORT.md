# H5_AI_GOVERNANCE_CLOSURE_REPORT

## Cierre de gobernanza H5 — Línea oficial de IA vs. línea histórica

- **Misión:** `H5_AI_GOVERNANCE_CLOSURE`
- **Base:** `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` → clasificación **`AI_CANON_HYBRID`**
- **Antecedente Docker:** `docs/DOCKER_READY_R1_R4_REPORT.md` → `DOCKER_READY_R1R4` · bloqueador único restante = **H5**
- **Definición operativa de H5** (`docs/DOCKER_READY_REMEDIATION_PLAN.md` §R5): ambigüedad sobre **qué IA es la oficial**, con el `ai_service` sirviendo el `.h5` degenerado.
- **Naturaleza:** SOLO gobernanza y documentación. **NO** se modifica código · **NO** commits · **NO** push.
- **HEAD de referencia:** `9109050` (`feature/cmsc-f3c-v1-implementation`).
- **Regla:** toda afirmación se ancla a evidencia en disco/git. Lo no evidenciado se declara.

---

## 0. Dictamen

# `H5_CLOSED` — cierre de gobernanza

**H5 queda CERRADO a nivel de gobernanza de IA.** La ambigüedad sobre *qué línea de IA es la oficial* está resuelta y queda registrada de forma inequívoca:

- **Línea canónica** = `M1/M2` sobre `agriculture_images_tomato-potato-corn/v1` (contrato de servicio neutral de framework).
- **Línea histórica** = `plant_disease_mbv2.h5` + `model_metadata.json` + scripts de entrenamiento binarios.

Motivo de cierre: H5 era un bloqueador de **gobernanza** (falta de canon), no de implementación. Ese canon existe desde `AI_CANONICAL_STRATEGY_DECISION_REPORT` (`AI_CANON_HYBRID`); este informe lo **declara cerrado**, clasifica los artefactos y fija el impacto. Ninguna afirmación del ecosistema presenta ya el `.h5` como línea oficial multiclase: el runtime expone `scientific_scope: binary_only` (`semantic_prediction_resolver.py:74`) y la UI lo rotula como binario.

> **Condición de validez (reversión):** si en el futuro algún artefacto (UI, `/infer`, doc, diagrama) presentara el `.h5` como el **modelo oficial multiclase**, H5 se **reabre** automáticamente.

### Qué NO reabre H5 (residual declarado)

Los siguientes puntos son **implementación posterior** (gates propios), no gobernanza H5:

| Residual | Gate | Naturaleza |
|---|---|---|
| Export ONNX de M1/M2 + adapter neutral en `ai_service` | `G-2` | implementación (código) |
| Elevar `semantic_contract_version` y resolver a 16 clases | `G-3` | implementación (código) |
| Re-etiquetado runtime `HISTÓRICO` en `/infer` | `G-5` | implementación (código) |
| Decisión de promoción M1→M2 | `G-1` | gobernanza (gate de benchmark, **PENDIENTE**) |
| `real_world_holdout` antes de publicar | `G-3b` | gobernanza |
| Reubicar `.h5` a carpeta histórica (sin borrar) | `G-4` | housekeeping |

**Estos residuos NO dependen del cierre H5 y no lo contradicen.** H5 cierra la *pregunta de canon*; los gates anteriores son el *cómo* desplegarlo.

---

## 1. Artefactos que quedan CANÓNICOS

### 1.1 Línea canónica (rol)
**`M1/M2` sobre `agriculture_images_tomato-potato-corn/v1`.** Única línea con dataset gobernado, taxonomía de 16 clases, splits reproducibles y métricas auditables.

| Artefacto | Rol canónico | Evidencia en disco/repo | Estado artefactos |
|---|---|---|---|
| **M1 — MobileNetV2** | **Baseline oficial congelado** (referencia inmutable) | `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb` (792.372 B, con outputs) · `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` · `AGENTS.md` | Macro-F1 0.9899 · ECE 0.0313 · balanced 0.9898. **`.pth` NO en disco** (REFERENCIADO-AUSENTE) |
| **M2 — EfficientNet-B0** | **Challenger validado** (candidato a promoción; decisión **PENDIENTE**) | `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` (647 230 B, con outputs) · `ESTADO_ACTUAL_BENCHMARKS.md` | Macro-F1 0.9937 · balanced 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · best epoch 32. Artefactos en **Drive** `runs/M2_efficientnet_b0/`, **no en repo** |
| **Dataset `agriculture_images_tomato-potato-corn/v1`** | **Dataset canónico** | Disco: **existe** (`Test-Path` = `True`); git: **0 archivos** (`/data/` ignorado) | 22 488 imgs · 16 clases (`species__condition`) · 3 especies · split 15 741/3 373/3 374 seed 42 · `dataset_card.md` · `labels/labels_v1.csv` · `CHECKSUMS.sha256` · 8 manifiestos · `holdout/real_world_holdout_v1` (0) |

**Precisión honesta:** lo canónico es la **línea y los roles** (M1 baseline / M2 challenger). Los **checkpoints no están materializados en el repositorio** hoy (M1 ausente; M2 en Drive). La evidencia canónica en repo son **notebooks con outputs + métricas registradas**, no pesos.

**Contrato canónico de servicio (declarado):** neutral de framework (`{prediction, trace, source_mode}`), exportable a **ONNX/ONNX Runtime** para desacoplar frontend/Docker/edge del framework de entrenamiento. Materia del gate `G-2` (no implementado aquí).

---

## 2. Artefactos HISTÓRICOS

> **Regla NADA DESAPARECE:** no se borran; se conservan con su hash y sus reportes forenses como evidencia de por qué se retiran del canon.

| # | Artefacto | Ruta | Evidencia / identidad | Razón |
|---|---|---|---|---|
| 1 | **`plant_disease_mbv2.h5`** | `src/ai_models/production_models/plant_disease_mbv2.h5` | **9 431 432 B** · SHA-256 `77B0EFECD602F95FD31846C3058B4D45E41289155438FBD22738BCE0640219C0` · **versionado en git** | Degenerado: colapsa a `class_0` (~0.99) en toda entrada (`SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md:98-103,153-158`) |
| 2 | **`model_metadata.json`** | `src/ai_models/production_models/model_metadata.json` | **65 B** · `{"classes": ["enferma", "sana"], "framework": "tensorflow_fixed"}` · versionado | Metadatos de la línea binaria; taxonomía insuficiente |
| 3 | **Scripts de entrenamiento binarios (TF/Keras)** | `src/ai_models/train_plant_disease_mobilenet.py` · `src/ai_models/notebooks/train_plant_disease_mobilenet.py` · `src/ai_models/notebooks/prepare_plant_disease_dataset.py` | apuntan a `data/datasets/plant_disease` (**no existe**); escribe `.h5` + metadata | Pipeline de la línea retirada |
| 4 | (`adicional`) Notebook vacío | `src/ai_models/notebooks/plant_disease_training.ipynb` | **0 bytes** | DISEÑO/histórico vacío |
| 5 | (`adicional`, runtime) Rótulo binario | `semantic_prediction_resolver.py:74` (`scientific_scope: binary_only`) · `AIPredictiva.jsx` (textos) | En código vivo | **HISTÓRICO al generalizar el contrato a 16 clases** (gate `G-3`/`G-5`, requiere código) |

**No históricos — VIGENTES:** `v1` · notebooks M1/M2 · `benchmark/` · manifiestos · `fastapi_app.py` (infra), `conversation_context.py`, `/assist` (voz), `/events` (SSE).

---

## 3. DOCUMENTOS que deben actualizarse

> Este informe **no los modifica** (misión documental de cierre, sin tocar código ni docs existentes). Los enumera como **plan de actualización** para una misión documental posterior.

### 3.1 Gobernanza / estado (prioridad ALTA — fuente de verdad)
| Documento | Cambio requerido |
|---|---|
| `AGENTS.md` (sección IA / benchmark) | Registrar `H5_CLOSED` + línea canónica M1/M2+v1 · `.h5` = HISTÓRICO |
| `docs/MASTERDOC.md` (§ IA) | Canon IA + estado H5 |
| `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` | Fijar canon M1/M2 (ya tiene métricas) + nota `.h5` histórico |
| `docs/AI_MODEL_INVENTORY.md` | Añadir sección explícita **CANÓNICO / HISTÓRICO** (§1 y §8) |
| `README.md` | §IA (líneas 85, 111, 202, 481, 810, 838): "clasificación binaria implementada" → **HISTÓRICO**; apuntar a canon M1/M2/v1 |

### 3.2 Estado de ecosistema (CMSC)
- `Documentacion/Arquitectura/CMSC_CANONICAL_STATE_v1.md` (L51, L103) — reetiquetar `.h5` histórico.
- `Documentacion/Arquitectura/CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md` (L194-196) — ídem.
- `Documentacion/Arquitectura/CMSC_SIGNAL_MAP_v1.md` (S60/S74; L83, L98, L171, L204, L327) — marcar histórico.
- `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` · `CMSC_F3A_INTERCONNECTION_BLUEPRINT_v1.md` · `CMSC_F3B_SIGNAL_PRODUCERS_ECOSYSTEM_v1.md` · `CMSC_UI_ARCHITECTURE_v1.md` — alinear etiqueta.

### 3.3 Arquitectura / pipeline IA
- `docs/AI_PIPELINE.md` (L19, "colocar `.h5`/`.keras`") — reencuadrar.
- `docs/eiarc/02_ARCHITECTURE/AI_CONTEXT_REFACTOR_PLAN.md` · `AI_CONTEXT_IMPLEMENTATION_GUIDE.md` · `AI_CONTEXT_V2_ARCHITECTURE.md` · `docs/ai/research_v2/AI_CONTEXT_V2_IMPLEMENTATION_AUDIT.md` — referencian `model_metadata.json` como fuente; marcar histórico.
- `docs/ai/research_v2/AI_DATASET_STRATEGY_V2.md` (L25, L50-51) · `AI_SCIENTIFIC_CORRECTION_DESIGN.md` · `AI_PREDICTION_VALIDATION_AUDIT.md` — alinear.

### 3.4 Forenses (conservar, no reescribir)
`docs/PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md` · `PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` · `PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md` · `SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` — **evidencia**, se conservan tal cual (NADA DESAPARECE).

---

## 4. Diagramas a actualizar

| Diagrama | Ubicación | Cambio requerido |
|---|---|---|
| **AI_ML_ARCHITECTURE_V8** | `docs/eiarc/03_DIAGRAMS/AI_ML_ARCHITECTURE_V8.mmd` | L26 "Real: MobileNetV2 binario" y L29 "Real: 1 (binario)" → **Canónico: M1/M2 sobre v1** · **HISTÓRICO: `.h5` binario** |
| **AI_CONTEXT_TARGET_ARCHITECTURE** | `docs/eiarc/03_DIAGRAMS/AI_CONTEXT_TARGET_ARCHITECTURE.mmd` | Nodo `META["model_metadata.json"]` (L27) → `model_card` canónico; marcar `model_metadata.json` histórico |
| **EIARC_AI_CANONICAL_FLOW** | `docs/eiarc/03_DIAGRAMS/EIARC_AI_CANONICAL_FLOW.mmd` | Añadir nota: los "Classification Models" **canónicos** = M1/M2/v1; el `.h5` no es el modelo oficial |
| **activity_model_training** | `docs/uml/activity_model_training.mmd` | L2-4, L9, L12 ("modelo en producción `.h5`") → canon M1/M2; `.h5` histórico |
| **architecture_edge** | `docs/edge/architecture_edge.mmd` | Alinear TF/TFLite con canon (edge derivado de M1/M2 vía ONNX/TFLite) |
| (`verificar`) **c4_context** | `docs/diagrams/c4_context.mmd` | Confirmar si menciona el modelo IA y alinear |

---

## 5. Impacto en Docker Oficial

1. **H5 deja de bloquear.** El único bloqueador "no controlable" (`DOCKER_READY_REMEDIATION_PLAN` §5: «Bloqueador único no controlable: R5/H5») queda **cerrado por gobernanza** (Vía B: el `.h5` no se presenta como oficial). No se requiere la decisión M1/M2 para desbloquear.
2. **`ai_service` (R1–R4 ya ejecutado) se mantiene como está.** Sigue sirviendo el `.h5` **declarado histórico** — evidencia runtime: `GET :8081/health` → `{"status":"ok","tensorflow":true,"voice":true,"model_loaded":"plant_disease_mbv2.h5"}`. La honestidad se preserva (`scientific_scope: binary_only`).
3. **Imagen contiene el `.h5`.** `.dockerignore` no lo excluye (`AI_MODEL_INVENTORY §6`). **Recomendación post-H5 (no ejecutada):** al migrar a la línea canónica (G-2/G-3), excluir el `.h5` del build; hasta entonces se conserva (NADA DESAPARECE) con etiqueta HISTÓRICO.
4. **Contrato público intacto.** `/api/v3/ai/inference/`, `prediction/trace` y `source_mode` no cambian; el Frontend Oficial no requiere cambios por este cierre.
5. **Camino a `DOCKER_READY` global.** Tras H5, los pendientes son **R6** (tag/registry/`docs/DEPLOYMENT.md`) y **R7** (verificación E2E + validación visual humana) — **no** gobernanza de IA. La **Vía A** (ONNX + portar M1/M2 al `ai_service`) es evolución posterior (gates G-2/G-3), fuera del cierre de H5.

---

## 6. Trazabilidad (evidencia)

- `src/ai_models/production_models/plant_disease_mbv2.h5` — 9 431 432 B · SHA-256 `77B0EFEC…19C0` · `git ls-files` lo lista (versionado).
- `src/ai_models/production_models/model_metadata.json` — 65 B.
- `data/datasets/agriculture_images_tomato-potato-corn/v1` — disco `True` · `git ls-files data/` = 0.
- `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb` (792 372 B) · `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` (647 230 B).
- `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py:74` (`scientific_scope: binary_only`).
- `docs/DOCKER_READY_REMEDIATION_PLAN.md` §R5 (Vía A / Vía B) · §5.
- `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` (§7-§8, gates G-1..G-5).
- `docs/DOCKER_READY_R1_R4_REPORT.md` §4bis (H5 declarado no tocado) · `docs/AI_MODEL_INVENTORY.md`.

---

## 7. Preguntas del enunciado (respuesta directa)

1. **CANÓNICOS:** `M1` (baseline congelado) · `M2` (challenger validado, promoción PENDIENTE) · dataset `agriculture_images_tomato-potato-corn/v1` — línea M1/M2 sobre v1, contrato neutral (ONNX).
2. **HISTÓRICOS:** `plant_disease_mbv2.h5` · `model_metadata.json` · scripts binarios (`train_plant_disease_mobilenet.py` ×2, `prepare_plant_disease_dataset.py`) · (`+` notebook 0 bytes y rótulo `binary_only`).
3. **Documentos a actualizar:** `AGENTS.md`, `MASTERDOC.md`, `ESTADO_ACTUAL_BENCHMARKS.md`, `AI_MODEL_INVENTORY.md`, `README.md`, docs CMSC (`CMSC_CANONICAL_STATE_v1`, `CMSC_ECOSYSTEM_ASSET_INVENTORY_v1`, `CMSC_SIGNAL_MAP_v1`, …), docs EIARC AI_CONTEXT, `AI_PIPELINE.md`; forenses se conservan.
4. **Diagramas a actualizar:** `AI_ML_ARCHITECTURE_V8.mmd`, `AI_CONTEXT_TARGET_ARCHITECTURE.mmd`, `EIARC_AI_CANONICAL_FLOW.mmd`, `activity_model_training.mmd`, `architecture_edge.mmd`, (verificar `c4_context.mmd`).
5. **Impacto Docker Oficial:** H5 desbloqueado (Vía B); `ai_service` sigue sirviendo el `.h5` histórico honestamente; imagen conserva el `.h5` (recomendación post-H5); contrato público intacto; pendientes R6/R7 (no IA). Vía A = implementación posterior (G-2/G-3).

---

## 8. Dictamen

# `H5_CLOSED`

**Cierre de gobernanza.** Canon de IA decidido y registrado (`AI_CANON_HYBRID` → línea M1/M2 sobre `v1`; `.h5`/metadata/scripts = HISTÓRICO). H5 deja de bloquear Docker Oficial. Residual = implementación (G-2/G-3/G-5) y gate M1/M2 (G-1), **no** gobernanza H5.

> Sin modificar código · sin commits · sin push. Este informe solo **declara y clasifica**; las actualizaciones de documentos y diagramas (§3, §4) quedan como **misión documental explícita posterior**.
