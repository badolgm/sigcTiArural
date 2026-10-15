# AI-R4 Semantic Contract Plan

**mission:** `AI_R4_SEMANTIC_CONTRACT_PLAN` · **date:** 2026-10-14
**base:** `AI_R3_ONNXRUNTIME_SERVING_PLAN` · `docs/AI_R2_EXECUTION_REPORT.md` (`AI_R2_COMPLETE`) · `M2_RECOVERED` · `AI_CANON_HYBRID`
**objetivo:** resolver la semántica completa de las **16 clases canónicas** (fin del `binary_only`).
**estado:** **`AI_R4_READY`** (condicionado a D4-A · D4-B · D4-C · D4-D)

> **NO implementado · NO commits · NO push.** Este documento es diseño. No toca CMSC, Knowledge Hub, Docker, OCI ni SIGCT Memory.

---

## 0. Diagnóstico (estado real verificado)

| Objeto | Hallazgo |
|---|---|
| `SemanticPredictionResolver` | `CLASS_DEFINITIONS` **binario fijo**: `0=enferma`, `1=sana`; `scientific_scope="binary_only"` hardcodeado; `semantic_contract_version="v1"`. Único punto de extensión ya previsto: `get_class_definitions()` (con `TODO(Día 13+/multiclase)`). |
| API v3 (`AIInferenceV3View`) | Envuelve en `contract_version="v1"`, `operation="plant_diagnosis"`, `source_mode`, `prediction`, `trace` (con `raw_diagnosis`, `raw_class_index`). |
| `labels_v1.csv` | 22 488 filas · `taxonomy_version=agriculture_v2_taxonomy_v1` · columnas `species, condition_group, condition_name, health_state, annotation_quality, validation_source` (`annotation_quality=double_reviewed`). |
| `taxonomy_binding_manifest…taxonomy_v1.yaml` | **16 entradas** con `canonical_class_id`, `semantic_code`, `species`, `condition_group`, `condition_name`, `health_state`, y nombre PlantDisease original. **Fuente de verdad semántica.** |
| `class_index_map` (verificado AI-R1/R2) | Orden `ImageFolder` (alfabético) = orden de salida de M2. **No coincide con el orden del manifest** → el puente es el índice. |
| `AIPredictiva.jsx` | Consume `prediction.*` y `trace.*`; `getClassificationLabel(rawClassIndex)` **hardcodea binario**, `SPECIES_LABELS={unknown}`, `description="…solo clasificacion binaria…"`, `scientificScope` default `binary_only`. **Exporta 4 símbolos** reutilizados por CMSC. |
| `ModelPredictCell.jsx` (CMSC) | Importa de `AIPredictiva.jsx`: `AI_INFERENCE_URL`, `buildInfoFromOfficialResponse`, `getStatusPresentation`. **Acoplamiento CMSC → AIPredictiva.** |

**Conclusión:** hoy el servicio devuelve `class_0..class_15`, pero el resolver y la UI lo colapsan a binario → **etiquetas incorrectas**. AI-R4 reemplaza el mapa binario por el mapa de 16 y eleva el contrato a **v2**.

---

## 1. Contract v2 completo

Bump: `contract_version` **v1→v2** · `semantic_contract_version` **v1→v2** · `scientific_scope` **`binary_only`→`multiclass16`**.

### 1.1 Envelope (respuesta `POST /api/v3/ai/inference/`)

```json
{
  "context": "ai",
  "contract_version": "v2",
  "operation": "plant_diagnosis",
  "source_mode": "cloud | fallback | mock",
  "prediction": { "...": "§1.2" },
  "trace": {
    "provider": "fastapi_ai_service",
    "raw_diagnosis": "class_15",
    "raw_class_index": 15,
    "processing_time": "0.12s",
    "upstream_status": "ok",
    "upstream_detail": null,
    "model_contract_version": "agriculture_v2_multiclass16",
    "model_sha256": "4BD657B3…74EC3"
  }
}
```

### 1.2 `prediction` (v2)

| Campo | v1 | v2 | Nota |
|---|---|---|---|
| `prediction_code` | `plant_condition.binary.*` | **`agriculture.<species>.<group>.<condition>`** | = `semantic_code` del manifest |
| `prediction_label` | "Condicion …" | **"<Especie> — <condición>"** | legible |
| `plant_species` | `unknown` | **`tomato\|potato\|corn`** | del manifest |
| `condition_name` | `unhealthy\|healthy` | **`cercospora_gray_leaf_spot\|…\|healthy`** | del manifest |
| `condition_group` | `binary_condition` | **`disease\|healthy`** | del manifest |
| `health_state` | `warning\|healthy` | **`warning\|healthy`** | idéntico (sin `critical` en taxonomía v1) |
| `severity` | `undetermined\|none` | **`undetermined\|none`** | sin cambio de alcance clínico |
| `recommended_action` | genérico binario | **por clase, no clínico** | plantilla research-scope |
| `confidence` | float | float | sin cambio |
| `model_id` | `plant_disease_classifier` | `plant_disease_classifier` | sin cambio |
| `model_version` | del nombre `.h5` | **de `model` del servicio** (`model.onnx`) | sin cambio de forma |
| `semantic_contract_version` | `v1` | **`v2`** | bump |
| `scientific_scope` | `binary_only` | **`multiclass16`** | bump |
| **(nuevo)** `canonical_class_id` | — | `corn__common_rust` | trazabilidad |
| **(nuevo)** `class_index` | — | `0..15` | eco del índice |
| **(nuevo)** `taxonomy_version` | — | `agriculture_v2_taxonomy_v1` | gobernanza |

> **Compatibilidad:** todos los nombres de campos de `_PREDICTION_FIELDS` se **conservan**; sólo cambian valores y se **añaden** 3 campos. Ningún consumidor existente rompe por *forma*.

### 1.3 `source_mode`
Sin cambio de lógica: `error` upstream ⇒ `fallback`; `model=="mock"` ⇒ `mock`; resto ⇒ `cloud`.

---

## 2. Mapeo de las 16 clases

Fuente: `taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml` × `class_index_map` (orden `ImageFolder`).

| idx | `canonical_class_id` | species | group | condition_name | health_state | `semantic_code` |
|---|---|---|---|---|---|---|
| 0 | `corn__cercospora_gray_leaf_spot` | corn | disease | cercospora_gray_leaf_spot | warning | `agriculture.corn.disease.cercospora_gray_leaf_spot` |
| 1 | `corn__common_rust` | corn | disease | common_rust | warning | `agriculture.corn.disease.common_rust` |
| 2 | `corn__healthy` | corn | healthy | healthy | healthy | `agriculture.corn.healthy.healthy` |
| 3 | `corn__northern_leaf_blight` | corn | disease | northern_leaf_blight | warning | `agriculture.corn.disease.northern_leaf_blight` |
| 4 | `potato__early_blight` | potato | disease | early_blight | warning | `agriculture.potato.disease.early_blight` |
| 5 | `potato__healthy` | potato | healthy | healthy | healthy | `agriculture.potato.healthy.healthy` |
| 6 | `potato__late_blight` | potato | disease | late_blight | warning | `agriculture.potato.disease.late_blight` |
| 7 | `tomato__bacterial_spot` | tomato | disease | bacterial_spot | warning | `agriculture.tomato.disease.bacterial_spot` |
| 8 | `tomato__early_blight` | tomato | disease | early_blight | warning | `agriculture.tomato.disease.early_blight` |
| 9 | `tomato__healthy` | tomato | healthy | healthy | healthy | `agriculture.tomato.healthy.healthy` |
| 10 | `tomato__late_blight` | tomato | disease | late_blight | warning | `agriculture.tomato.disease.late_blight` |
| 11 | `tomato__leaf_mold` | tomato | disease | leaf_mold | warning | `agriculture.tomato.disease.leaf_mold` |
| 12 | `tomato__mosaic_virus` | tomato | disease | mosaic_virus | warning | `agriculture.tomato.disease.mosaic_virus` |
| 13 | `tomato__septoria_leaf_spot` | tomato | disease | septoria_leaf_spot | warning | `agriculture.tomato.disease.septoria_leaf_spot` |
| 14 | `tomato__target_spot` | tomato | disease | target_spot | warning | `agriculture.tomato.disease.target_spot` |
| 15 | `tomato__yellow_leaf_curl_virus` | tomato | disease | yellow_leaf_curl_virus | warning | `agriculture.tomato.disease.yellow_leaf_curl_virus` |

Distribución: **tomato 9 · corn 4 · potato 3**; **3 healthy · 13 disease**. `UNKNOWN_FALLBACK` se conserva para índices/alias no mapeados.

**Punto crítico:** el índice **no** es el orden del manifest; se fija por `class_index_map` (orden de entrenamiento). El resolver debe indexar por **`class_index`** y, como salvaguarda, validar contra `canonical_class_id` si el servicio lo aporta.

---

## 3. Cambios backend

Todos en `src/backend/infrastructure/external/ai_service/` y `src/backend/api/` — **nada de CMSC/KB/frontend/Docker**.

1. **`semantic_prediction_resolver.py` (núcleo):**
   - Sustituir `CLASS_DEFINITIONS` binario por **`CLASS_DEFINITIONS_V2`** con **16 entradas** (§2), + `UNKNOWN_FALLBACK` (sin cambio).
   - `get_class_definitions()` → devolver v2 (único punto de cambio, ya previsto).
   - `semantic_contract_version` → `"v2"`; `scientific_scope` → `"multiclass16"`.
   - Añadir `canonical_class_id`, `class_index`, `taxonomy_version` a `_PREDICTION_FIELDS`.
   - **Detección de modo (clave):** si `trace.model_contract_version` es `binary`/ausente → aplicar mapa v1 (compatibilidad con el `.h5`/AI-R3 en transición); si es `…multiclass16` ⇒ mapa v2. Evita etiquetar mal durante el despliegue escalonado.
- Ningún cambio en `AIServicePort`/`FastAPIAIAdapter` (contrato HTTP intacto).

## 3.1 `views.py` (`AIInferenceV3View`)
- `contract_version`: `"v1"` → `"v2"` (envelope).
- `trace`: añadir `model_contract_version` y `model_sha256` desde el `/health` del servicio (o echo del payload).
- Mantener `source_mode`, manejo de errores (400/502) y forma general.

## 3.2 Recomendaciones (`recommended_action`)
- 16 textos **research-scope**, no clínicos, derivados de `condition_group`/`health_state` (p. ej. `healthy` → "Mantener monitoreo preventivo"; `disease` → "Señal de alerta fitosanitaria: validar la muestra con inspección local; el modelo es de investigación y no sustituye diagnóstico profesional.").

## 3.3 Dependencia con AI-R3
La semántica de 16 clases **solo es correcta si el servicio sirve M2** (AI-R3). Si convive el `.h5` binario (fallback), el resolver **debe** detectar el modo (§3) para no mapear mal. **AI-R3 y AI-R4 deben desplegarse coordinados** para que el end-to-end sea correcto.

---

## 4. Cambios frontend

Solo `src/frontend/src/pages/AIPredictiva.jsx` (y **ninguno** en CMSC si se preservan las exportaciones).

| Punto | Cambio |
|---|---|
| `getClassificationLabel(rawClassIndex)` | Dejar de asumir binario. Usar `prediction.prediction_label` / `canonical_class_id`. Mantener firma o migrar a `(info)`. |
| `SPECIES_LABELS` | Añadir `tomato→Tomate`, `potato→Papa`, `corn→Maíz` (hoy sólo `unknown`). |
| `description` | Reemplazar texto "solo clasificacion binaria…" por alcance multiclase **de investigación** (PlantDisease, no campo). |
| `scientificScope` default | `binary_only` → `multiclass16`. |
| `buildInfoFromOfficialResponse` | Leer `canonical_class_id`, `taxonomy_version`; **tolerante** a respuesta v1 (fallback binario) → sin romper. |
| `DEMO_SCENARIOS` | Escenarios demo: actualizar etiquetas a multiclase (o marcarlos `demonstration_only`, ya lo están). |
| `getStatusPresentation` | Sin cambio (`healthy/warning/critical` ya soportados). |

**Invariante de compatibilidad CMSC:** se **mantienen exportados** con la **misma firma** `AI_INFERENCE_URL`, `buildInfoFromOfficialResponse`, `getStatusPresentation`, `getModePresentation`, `getClassificationLabel` → `ModelPredictCell.jsx` sigue funcionando y, de hecho, **mejora automáticamente** (mostrará especie/enfermedad específica) sin editar CMSC.

---

## 5. Riesgos

| ID | Riesgo | Sev | Mitigación |
|---|---|---|---|
| R4-1 | Índice ↔ `canonical_class_id` desalineado (orden de entrenamiento) | 🔴 | Usar `class_index_map` verificado; assert 16/16; validar `canonical_class_id` si llega |
| R4-2 | UI hardcodea binario (`getClassificationLabel`, `SPECIES_LABELS`, `description`) | 🔴 | Actualizar los puntos §4; default a `unknown` si falta |
| R4-3 | CMSC `ModelPredictCell` acoplado a exports de `AIPredictiva` | 🟠 | Mantener firmas/exports; cambio aditivo |
| R4-4 | Bump `contract_version v1→v2` (consumidores EIARC/tests) | 🟠 | Bump único y documentado; tests actualizados; tolerancia en builders |
| R4-4b | Fallback `.h5` binario coexistiendo (R3) → mapeo erróneo | 🔴 | Detección de modo por `model_contract_version` (§3) |
| R4-5 | `recommended_action` con apariencia clínica (responsabilidad) | 🟠 | Textos no prescriptivos, research-scope, con "no sustituye diagnóstico profesional" |
| R4-6 | `plant_species: unknown` legacy no coincide con las nuevas | 🟡 | Fallback a `unknown`/labels; tolerancia v1 |
| R4-7 | `test_semantic_prediction_resolver.py` fija binario | 🟠 | Actualizar fixtures a v2 + conservar casos v1 (coexistencia) |
| R4-8 | Alcance científico sobrevalorado (PlantDisease ≠ campo) | 🟠 | `scientific_scope` **no** asciende a "field/production"; se mantiene research |
| R4-9 | `health_state` sin `critical` | 🟢 | Rama UI `critical` queda inerte; honesto |
| R4-10 | Ruido del manifest (encoding) | 🟢 | Leer como UTF-8; no depender de comentarios |

---

## 6. Rollback

- **Backend:** `get_class_definitions()` es el **único switch** → bandera `SEMANTIC_CONTRACT=v1|v2` (default según `model_contract_version`). Rollback = forzar `v1` (comportamiento binario previo) sin tocar código.
- **Envelope:** revertir `contract_version` `v2→v1` (1 línea).
- **Frontend:** builders **tolerantes a v1/v2** → reapuntar la UI al modo binario sin deploy estructural.
- **Sin migraciones de datos.** Sin cambios en DB. Reversible por flag + `git revert`.

---

## 7. Compatibilidad

| Sistema | Impacto | Veredicto |
|---|---|---|
| **CMSC** | `ModelPredictCell.jsx` importa 3 símbolos de `AIPredictiva.jsx`. | ✅ Si se preservan exportaciones/firmas (aditivo), CMSC **no se edita** y mejora su resultado. No tocar rutas CMSC ni `HonestyBadge`/`signalCatalog`. |
| **Knowledge Hub** | Sin acoplamiento runtime. | ✅ El nuevo contrato se documenta (doc/manifest en `docs/ai/`), **sin escritura** al Hub. |
| **Docker** | Rebuild de `backend` y `frontend`; `ai_service` ya servido por AI-R3. Sin nuevos servicios ni puertos. | ✅ Sin cambios de orquestación salvo los ya introducidos por AI-R3 (volumen del ONNX). |
| **OCI** | Sin artefactos OCI nuevos; contrato interno de la app. | ✅ No aplica / sin impacto. |
| **SIGCT Memory** | Sin dependencia del contrato semántico de imagen. | ✅ No tocado. |

---

## 8. Clasificación

**`AI_R4_READY` (condicionado a D4-A · D4-B · D4-C · D4-D).**

**Justificación:** el mapa de 16 clases está **completamente disponible y verificado** (manifest + `class_index_map`); el resolver ya expone un **único punto de extensión** (`get_class_definitions`); los builders del frontend están **centralizados** y CMSC sólo depende de **exportaciones estables**. El cambio es **aditivo en forma** (campos nuevos, valores nuevos) y **reversible por bandera**.

**Condiciones:**
- **D4-A** — Congelar nombres del contrato v2 (campos nuevos `canonical_class_id`/`class_index`/`taxonomy_version`; `scientific_scope="multiclass16"`).
- **D4-B** — Aprobar los 16 `recommended_action` (texto **no clínico**, research-scope).
- **D4-C** — Desplegar AI-R3 (M2 ONNX) de forma **coordinada**; el resolver debe incluir detección de modo (`model_contract_version`) para el fallback binario.
- **D4-D** — Actualizar `test_semantic_prediction_resolver.py` (v2) conservando casos v1.

> Nota honesta: el contrato puede implementarse ya, pero **el resultado end-to-end sólo será correcto** si AI-R3 está desplegado (clases de 16). Sin D4-C, la clasificación sería `AI_R4_NOT_READY`.

---

## 8.1 No ejecutado
Sin implementación · sin cambios en `semantic_prediction_resolver.py`/`views.py`/`AIPredictiva.jsx`/CMSC · sin tests modificados · sin commits · sin push.
