# AI_CANONICAL_STRATEGY_DECISION_REPORT

## Decisión estratégica — Línea oficial de IA agrícola de SIGCT-Rural

- **Misión:** `AI_CANONICAL_STRATEGY_DECISION_REPORT`
- **Naturaleza:** SOLO decisión estratégica. NO entrenar · NO modificar código · NO generar modelos · NO commits · NO push.
- **HEAD auditado:** `9109050` (`feature/cmsc-f3c-v1-implementation`)
- **Regla:** toda afirmación se ancla a evidencia del repositorio (archivo:línea, commit, doc). Lo no evidenciado se declara.

---

## 0. Veredicto

# CLASIFICACIÓN: `AI_CANON_HYBRID`

**La línea oficial de IA agrícola es la línea científica `M1/M2` sobre el dataset gobernado `v1`, servida a través de un contrato de inferencia neutral de framework; el `.h5` binario queda HISTÓRICO.**

Precisión de la híbrida (para evitar ambigüedad):

1. **Línea canónica científica = `M1/M2` sobre `agriculture_images_tomato-potato-corn/v1`** (16 clases, gobernanza completa, checkpoints documentados).
2. **Dentro de esa línea**, `M1` permanece como **baseline oficial congelado** y `M2` como **challenger validado**; el desempate M1 vs M2 **NO se resuelve aquí**: queda gobernado por el gate de benchmark (`BENCHMARK_GATE_DECISION_TEMPLATE.md`).
3. **Contrato de servicio canónico = neutral de framework** (exportación a ONNX/ONNX Runtime): el Frontend Oficial, Docker Oficial, OCI, SIGCT Memory, Voice Assistant y ACP se acoplan al **contrato `prediction/trace`**, no al framework (TF ni PyTorch).
4. **`.h5` binario = HISTÓRICO** (degenerado, no regenerable).

No se elige `AI_CANON_M1` ni `AI_CANON_M2` en aislamiento porque la decisión M1↔M2 está **PENDIENTE por diseño** (gate). No se elige `AI_CANON_H5` porque el modelo está degenerado y es parcialmente trazable. La híbrida resuelve ambas cosas: canoniza la *línea* sin quemar el *gate*.

---

## 1. Las dos líneas (evidencia)

### Línea A — `.h5` binario (Keras/TensorFlow)
- Artefacto: `src/ai_models/production_models/plant_disease_mbv2.h5` (9 431 432 B, SHA-256 `77B0…19C0`) + `model_metadata.json` (`{"classes":["enferma","sana"],"framework":"tensorflow_fixed"}`).
- Servidor: `src/ai_models/fastapi_app.py` — `/health`, `/infer`, `/assist`, `/analyze-circuit`, `/events` (carga `*.h5`/`*.keras`).
- Contrato devuelto por `/infer`: `diagnosis = class_{idx}`, `class_index`, `confidence`, `model`, `processing_time`.
- Procedencia: `docs/PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md` → `MODEL_PARTIALLY_TRACEABLE`.
- Estado funcional: `docs/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` → `MODEL_RETRAIN_REQUIRED` (colapso a `class_0`).
- Relación con v1: `docs/PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md` → `DATASET_UNRELATED_TO_MODEL`.

### Línea B — `M1/M2` (PyTorch) sobre `v1`
- Dataset: `data/datasets/agriculture_images_tomato-potato-corn/v1/` — 22 488 imgs · 16 clases (`species__condition`) · curated 15 741/3 373/3 374 (seed 42) · `labels_v1.csv` · 8 manifiestos · `dataset_card.md` · `CHECKSUMS.sha256`.
- Notebooks: `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb` (baseline) y `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` (challenger); `DATA_ROOT = .../v1/curated`; `epochs 40`; 16 clases.
- Benchmarks (`AGENTS.md` · `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md`):
  - **M1** macro-F1 0.9899 · ECE 0.0313 · balanced_acc 0.9898 — **APROBADO/CONGELADO (baseline oficial)**.
  - **M2** macro-F1 0.9937 · balanced_acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · best epoch 32 — **EJECUTADO OFICIALMENTE (challenger validado)**.
- **Decisión M1 vs M2: PENDIENTE** (gate `BENCHMARK_GATE_DECISION_TEMPLATE.md`).

---

## 2. Ventajas del `.h5` actual (línea A)

1. **Único eslabón YA integrado de extremo a extremo.** Frontend → backend → `ai_service` → modelo: todo el cableado existe y está en producción (`api/logic/adapters/ai_service.py`, `infrastructure/external/ai_service/fastapi_ai_adapter.py:36`, `api/views.py` v3 inference).
2. **Compatibilidad Docker nativa.** `docker-compose.yml:68-80` construye `ai_service` desde `src/ai_models` con runtime TensorFlow; `load_latest_model()` (`fastapi_app.py:171-185`) ya selecciona `.h5`/`.keras`. Cero cambios de infraestructura.
3. **Formato de despliegue edge esperado.** La estrategia de perímetro declara "**framework exclusivo TF/Keras + TFLite**" (`docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md:95`, `:128`); el `.h5` es exportable a TFLite/ONNX sin cambiar de familia.
4. **Contrato semántico ya consumido.** El resolver backend (`semantic_prediction_resolver.py`) mapea `class_index` 0/1 a `prediction_code/health_state/…` y declara `scientific_scope: "binary_only"`. El Frontend Oficial ya pinta ese contrato.
5. **Artefacto real y presente** (hash verificado), a diferencia de M1 (sin artefactos en disco) — ventaja de disponibilidad inmediata.

**Balance:** la ventaja de la línea A es **de integración, no de calidad**. Es un canal perfectamente cableado sirviendo un modelo degenerado.

---

## 3. Ventajas de M1 (línea B, baseline)

1. **Baseline oficial congelado** (`AGENTS.md`): no se re-entrena, es la referencia estable de comparación.
2. **Mejores métricas que ninguna alternativa binaria** (macro-F1 0.9899, balanced_acc 0.9898, ECE 0.0313) sobre **datos gobernados**.
3. **Taxonomía real de 16 clases** (`v1`), no un binario colapsado → utilidad agronómica inmediata.
4. **Gobernanza completa**: split reproducible (seed 42), manifiestos, `dataset_card.md`, `CHECKSUMS.sha256`.
5. **Bajo consumo** (MobileNetV2) → candidato natural para edge/ONNX.

**Debilidad:** sin artefactos reconstruibles en disco hoy (`AGENTS.md`: "M1 REFERENCIADOS-AUSENTES") y framework PyTorch (fuera del perímetro TF declarado).

---

## 4. Ventajas de M2 (línea B, challenger)

1. **Mejores métricas de todo el ecosistema**: macro-F1 0.9937 · balanced_acc 0.9943 · weighted-F1 0.9956 (supera a M1).
2. **Challenger validado oficialmente** (ejecución registrada, best epoch 32) con **artefactos en `runs/M2_efficientnet_b0/`** (`validation_metrics.json`, `M2_VS_M1.json/.md`, checkpoints, PNG).
3. **Misma política canónica y mismo dataset `v1`** que M1 → comparabilidad limpia.
4. **Fundamento para el gate**: es el candidato con evidencia de superioridad para reemplazar al baseline.

**Debilidad:** ECE ligeramente peor que M1 (0.0332 vs 0.0313) y mayor coste computacional; framework PyTorch (fuera del perímetro TF declarado); decisión de promoción **PENDIENTE**.

---

## 5. Riesgos por opción

| Opción | Riesgos principales | Severidad |
|---|---|---|
| **A) `AI_CANON_H5`** | Canonizar un modelo **degenerado** (colapsa a `class_0`), **parcialmente trazable**, sin métricas ni dataset → decisiones agronómicas inválidas. Congelaría el error como oficial. | **CRÍTICA** |
| **B) `AI_CANON_M1`** | Ignora que **M2 supera a M1** y **quema un gate aún PENDIENTE**. Artefactos no presentes en disco → irreproducible hoy. PyTorch fuera del perímetro → requiere exportación. | ALTA |
| **C) `AI_CANON_M2`** | Igual que B: resuelve el gate por decreto, no por gobernanza. PyTorch fuera del perímetro; ECE ≤ M1; coste. | ALTA |
| **D) `AI_CANON_HYBRID`** | Complejidad de mantener **un contrato neutral** y dos artefactos coexistiendo; riesgo de deriva si no se formaliza el gate; requiere exportación ONNX. | MEDIA |

Riesgo transversal de A/B/C: **acoplar el contrato público al framework** (TF o PyTorch), replicando el problema actual (cambiar de modelo obliga a cambiar infraestructura).

---

## 6. Compatibilidad con los sistemas oficiales

| Sistema | Evidencia | `.h5` (A) | M1/M2 (B/C) | **HYBRID (D)** |
|---|---|---|---|---|
| **Frontend Oficial** (`AIPredictiva.jsx`) | Llama `VITE_AI_INFERENCE_URL` → `/api/v3/ai/inference/`; consume `prediction.*` y `trace.raw_class_index`; hoy rotula binario ("solo clasificacion binaria") | **Alta** (contrato ya binario) | **Media** (mismo contrato `prediction/trace`, pero el resolver debe pasar a 16 clases) | **Alta** (se conserva el contrato y se generaliza a 16 sin romper UI) |
| **Docker Oficial** (`docker-compose.yml`) | `ai_service` se construye desde `src/ai_models` (TF); `fastapi_app` carga `*.h5`/`*.keras` | **Nativa** | **Requiere rediseño** de serving (PyTorch no está en la imagen) | **Media-alta** vía ONNX Runtime en la imagen (añade runtime neutral) |
| **OCI** | `docs/SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md:59`: OCI = almacenamiento/registry de contenedores; "fuera MVP" (`:96`) | Neutro | Neutro | **Neutro** (el contenedor sirve igual cualquier runtime) |
| **SIGCT Memory** | `docs/SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md`: **excluye binarios** de modelo (`*.h5/*.keras/*.onnx`) y indexa documentación | Neutro (no indexa el modelo) | Neutro | **Favorable**: canonizar **documenta** la línea y alimenta la memoria con gobernanza, no con binarios |
| **Voice Assistant** | `src/frontend/src/components/VoiceAssistant.jsx:8,83,172` → `/assist` (STT/TTS en `ai_service`, `fastapi_app.py:291`) | Independiente (comparte contenedor) | Independiente | **Independiente** (la voz no depende del modelo de imagen) |
| **ACP** | Solo diseño (`CMSC_F4_ACP_ARCHITECTURE_v1.md`): lee evidencia/KH, no ejecuta labs | Neutro | Neutro | **Favorable**: el ACP consume un **contrato estable** `prediction/trace`, no un framework; mejora su trazabilidad |

**Lectura:** la línea A es la más integrada *hoy*; M1/M2 aislados exigen reingeniería de serving; la híbrida con **contrato neutral** maximiza compatibilidad sin acoplar a framework y alinea con la filosofía del ecosistema (desacople, gobernanza, memoria documental).

---

## 7. Qué debe ser CANÓNICO

### 7.1 Línea canónica
**`M1/M2` sobre `agriculture_images_tomato-potato-corn/v1`.** Es la única línea con dataset gobernado, taxonomía de 16 clases, splits reproducibles y métricas auditables.

### 7.2 Rol de cada modelo (dentro del canon)
- **M1 = baseline oficial congelado** (referencia inmutable de comparación).
- **M2 = challenger validado** (candidato a promoción).
- **PROMOCIÓN M1→M2: PENDIENTE** → se decide en el **gate de benchmark**, no aquí.

### 7.3 Contrato canónico de servicio
- Interfaz pública **neutral de framework**: `{ prediction: {prediction_code, prediction_label, plant_species, condition_name, condition_group, health_state, severity, recommended_action, confidence, model_id, model_version, scientific_scope, semantic_contract_version}, trace: {raw_diagnosis, raw_class_index}, source_mode }`.
- El modelo servido se exporta a **ONNX / ONNX Runtime** para desacoplar frontend/Docker/edge del entrenamiento (TF o PyTorch).
- `semantic_contract_version` se eleva de `v1 (binary_only)` a la versión multiclase correspondiente al **aprobarse** el gate.

### 7.4 Datos canónicos
`agriculture_images_tomato-potato-corn/v1` (16 clases) queda como dataset oficial; `real_world_holdout` permanece obligatorio antes de cualquier publicación (regla de `AI_DATASET_STRATEGY_V2.md`).

---

## 8. Qué debe quedar HISTÓRICO

1. **`plant_disease_mbv2.h5` + `model_metadata.json`** → **HISTÓRICO** (no se borra: regla NADA DESAPARECE). Se conserva con su hash y sus dos reportes forenses como evidencia de por qué fue retirado.
2. **Scripts de la línea binaria**: `train_plant_disease_mobilenet.py`, `notebooks/train_plant_disease_mobilenet.py`, `import_local_dataset.py` (solo historial git) → **HISTÓRICO** (no canónicos).
3. **Rótulo "binario" en la UI** (`scientific_scope: binary_only`, textos "solo clasificacion binaria") → **HISTÓRICO** una vez generalizado el contrato a 16 clases.
4. **`plant_disease_training.ipynb`** (0 bytes) → **HISTÓRICO/vacío**.
5. **No históricos, sino VIGENTES a conservar:** `v1`, notebooks M1/M2, `benchmark/`, `dataset_card.md`, manifiestos.

---

## 9. Justificación de la clasificación

- **A) `AI_CANON_H5` — RECHAZADA.** Canonizaría un modelo degenerado (`MODEL_RETRAIN_REQUIRED`), parcialmente trazable (`MODEL_PARTIALLY_TRACEABLE`) y no relacionado con `v1`. Sería institucionalizar un error.
- **B) `AI_CANON_M1` — PARCIAL.** M1 es baseline congelado, pero designarlo único canon **quemaría el gate pendiente** y **ignoraría que M2 supera a M1**.
- **C) `AI_CANON_M2` — PARCIAL.** M2 es el mejor validado, pero designarlo único canon también **resolvería el gate por decreto**, contra la gobernanza.
- **D) `AI_CANON_HYBRID` — ADOPTADA.** Canoniza la **línea** correcta (M1/M2 + `v1`), preserva **ambos roles** (baseline + challenger) sin quemar la decisión pendiente, y desacopla el servicio del framework mediante un **contrato neutral**. Es la única opción compatible simultáneamente con Frontend Oficial, Docker Oficial, OCI, SIGCT Memory, Voice Assistant y ACP sin reescribir el contrato público.

---

## 10. Decisiones/Gates que habilita esta estrategia (no resueltos aquí)

| ID | Gate/Decisión | Responsable | Estado |
|---|---|---|---|
| G-1 | Promoción M1 vs M2 (usa `BENCHMARK_GATE_DECISION_TEMPLATE.md`) | Bernardo | PENDIENTE |
| G-2 | Protocolo de exportación ONNX + runtime en `ai_service` | misión de implementación | DISEÑO |
| G-3 | Elevación de `semantic_contract_version` y ampliación del resolver a 16 clases | misión explícita | PENDING |
| G-3b | `real_world_holdout` antes de publicar | gobernanza | PENDING |
| G-4 | Reubicación de `plant_disease_mbv2.h5` a histórico (sin borrado) | misión de gobernanza | PENDIENTE |
| G-5 | Re-etiquetado de `scientific_scope` binario en UI | misión de frontend | PENDIENTE |

Todas requieren **misión explícita** y autorización; este reporte **no implementa ninguna**.

---

## 11. Resumen en una frase

El `.h5` binario gana en integración pero está degenerado; M1/M2 son la única línea con ciencia y gobernanza pero no deciden entre sí por gate. Por tanto: **`AI_CANON_HYBRID`** — línea oficial = M1/M2 sobre `v1`, M1 baseline / M2 challenger, servida por contrato neutral (ONNX); `.h5` y la línea binaria pasan a **HISTÓRICO**.

---

## 11bis. Preguntas del enunciado (respuesta directa)

1. **Ventajas del `.h5`**: única línea integrada E2E, Docker-native, edge-compatible (TF→TFLite), contrato binario ya consumido, artefacto presente. (Integración, no calidad.)
2. **Ventajas de M1**: baseline oficial congelado, métricas altas sobre datos gobernados, 16 clases, gobernanza completa, bajo coste.
3. **Ventajas de M2**: mejores métricas del ecosistema, challenger validado, artefactos versionados, comparabilidad con M1.
4. **Riesgos**: A crítico (canoniza error); B/C alto (queman gate + PyTorch fuera de perímetro); D medio (complejidad de contrato neutral).
5. **Compatibilidad**: A alta en todos; B/C media (+reingeniería); **D alta con contrato neutral** (favorable para Memory y ACP).
6. **CANÓNICO**: línea M1/M2 sobre `v1`; M1 baseline, M2 challenger; contrato neutral de framework.
7. **HISTÓRICO**: `.h5`, scripts binarios, `import_local_dataset.py`, rótulo binario, notebook vacío.

---

## 12. Referencias (evidencia)

- `src/ai_models/fastapi_app.py:171-193,210-276,291-393` (carga `.h5`, `/infer`, `/assist`).
- `docker-compose.yml:68-80` (`ai_service` desde `src/ai_models`).
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py:36` (POST `/infer`) · `src/backend/api/logic/adapters/ai_service.py:12`.
- `src/backend/.../semantic_prediction_resolver.py` (clases 0/1, `scientific_scope: binary_only`).
6. `src/frontend/src/pages/AIPredictiva.jsx:3,58-62,129-153` · `src/frontend/src/components/VoiceAssistant.jsx:8,83,172`.
7. `docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md:95,128,149,163` (perímetro TF/Keras+TFLite).
8. `docs/SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md:59,96` (OCI; exclusión de binarios).
9. `docs/UBTN_EDGE_AI_STRATEGY.md:36,128` (edge TFLite/ONNX).
10. `docs/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` · `docs/PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md` · `docs/PLANT_DISEASE_MODEL_PROVENANCE_REPORT.md`.
11. `AGENTS.md` (estado M1/M2, decisión benchmark PENDIENTE) · `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md`.
12. `docs/CMSC_F4_ACP_ARCHITECTURE_v1.md` (ACP lee contrato, no framework).

---

Fin del informe. Documento estratégico únicamente: no se modificó código, dataset, modelo ni configuración; sin commits ni push.
