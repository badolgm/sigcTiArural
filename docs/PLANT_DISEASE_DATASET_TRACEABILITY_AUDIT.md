# PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT

**Misión:** `PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT`
**Modo:** SOLO TRAZABILIDAD (read-only). **NO** se modificó código, **NO** se entrenó, **NO** se generó ningún modelo.
**Fecha:** 2026-10-13
**HEAD:** `9109050` (`feat(frontend): complete officialization phases 1 and 2`)
**Regla suprema:** NADA DESAPARECE · honestidad de estado · la documentación/artefacto es la fuente de verdad.

---

## 0. VEREDICTO

| Pregunta | Respuesta |
|---|---|
| ¿Qué dataset entrenó a `plant_disease_mbv2.h5`? | Un dataset **binario `{enferma,sana}`** consumido por el script Keras `src/ai_models/train_plant_disease_mobilenet.py`, cuya ruta declarada (`data/datasets/plant_disease`) **no existe**. Sin artefacto que lo respalde. |
| ¿`agriculture_images_tomato-potato-corn/v1` es el dataset usado por `plant_disease_mbv2.h5`? | **NO.** |
| ¿Entonces a qué pertenece `v1`? | Es el dataset de **M1/M2** (PyTorch, 16 clases): `SIGCTIARURAL_M1_MobileNetV2.ipynb` y `SIGCTIARURAL_M2_EfficientNetB0.ipynb`. |
| **Clasificación final** | **`DATASET_UNRELATED_TO_MODEL`** (v1 ↔ `plant_disease_mbv2.h5`). |

**Un matiz honesto:** ambos descienden de la misma **línea de origen PlantVillage**, pero `v1` es un artefacto **curado, 16-clases, de pipeline PyTorch**; el `.h5` es **binario, Keras/TF**. Compartir origen ≠ ser el mismo dataset. No existe ningún artefacto que conecte `v1` con el `.h5`.

---

## 1. Metodología (read-only)

1. Inventario en disco del árbol `data/datasets/agriculture_images_tomato-potato-corn/v1/` (RAW, curated, labels, manifests, split_lists).
2. Lectura de las **cabeceras** de `labels_v1.csv`, `train.csv`, `split_report.md`, `dataset_card.md`.
3. Lectura de los **8 manifiestos** YAML.
4. Extracción de celdas de los notebooks **M1** y **M2** (rutas de datos, clases, epochs, checkpoints, `OUT`).
5. Inspección **interna** del `.h5` con `h5py` (atributos `model_config` + `training_config`, grupos de pesos) dentro del contenedor `ai_service`.
6. Lectura de `benchmark/config.yaml` y `benchmark/src/models.py`.

No se ejecutó entrenamiento; la inspección del `.h5` fue de solo lectura y no dejó residuos.

---

## 2. Dataset `agriculture_images_tomato-potato-corn/v1` — inventario verificado

Ruta: `data/datasets/agriculture_images_tomato-potato-corn/v1/`

| Elemento | Evidencia |
|---|---|
| **RAW** | 16 carpetas `species__condition`; **22.488** archivos (recuento recursivo) |
| **curated** | `train/`, `validation/`, `test/` (16 clases cada uno) |
| **labels** | `labels_v1.csv` (4.671.072 B) — **22.488 filas** + cabecera; 8 campos: `sample_id, taxonomy_version, species, condition_group, condition_name, health_state, annotation_quality, validation_source` |
| **manifests** | 8 YAML: `raw_source_manifest` (v1/v2), `curation_manifest` (v1/v2), `baseline_experiment_manifest` (v1/v2), `split_manifest`, `taxonomy_binding_manifest` |
| **split_lists** | `train.csv` (15.741) · `validation.csv` (3.373) · `test.csv` (3.374) · `split_report.md` · `split_report.json`; seed 42, 70/15/15 estratificado |
| **CHECKSUMS.sha256 / dataset_card.md** | presentes |

### 2.1 Identidad y taxonomía (manifiestos)

- `dataset_id: agriculture_images_tomato-potato-corn`, `dataset_version: v1` (`raw_source_manifest…v1.yaml:4-5`).
- `modality: computer_vision`, `context: agriculture`.
- **16 clases**, 3 especies (tomato 9 · potato 3 · corn 4) — `dataset_card.md:20-22`.
- Taxonomía `agriculture_v2_taxonomy_v1` · label schema `agriculture_v2_label_schema_v1` · split `agriculture_v2_split_v1`.
- Origen declarado: `PlantVillage-Dataset` subset `raw/color` (`raw_source_manifest…v1.yaml:9-11,29`; `dataset_card.md:12`), recuperado 2026-09-23.

### 2.2 Etiquetas reales (muestra de `labels_v1.csv`)

```
sample_id,taxonomy_version,species,condition_group,condition_name,health_state,annotation_quality,validation_source
"corn__cercospora_gray_leaf_spot\...JPG",agriculture_v2_taxonomy_v1,corn,disease,cercospora_gray_leaf_spot,warning,double_reviewed,double_reviewed
```

`split_lists/train.csv`: `sample_id,partition,canonical_class_id` → `...,train,corn__cercospora_gray_leaf_spot`.

> Las etiquetas son **`species__condition` (16 valores)**, **nunca** `enferma`/`sana`.

### 2.3 Distribución (dataset_card.md / split_report.md)

`train 15.741 · validation 3.373 · test 3.374 = 22.488`; ratio min/max 35,24× (potato__healthy 152 vs tomato__yellow_leaf_curl_virus 5.357).

---

## 3. Trazabilidad M1 / M2 → dataset `v1`  (RELACIÓN DEMOSTRADA)

### 3.1 `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb`

| Atributo | Valor (evidencia) |
|---|---|
| Run | `M1_mobilenetv2_001` (línea 9,19) |
| Framework | **PyTorch/torchvision** (`ImageFolder`, `mobilenet_v2`) |
| **Ruta de datos** | `DATA_ROOT = /content/drive/MyDrive/SIGCTiArural/datasets/v1/curated` (líneas 183, 197 del bloque) |
| Carga | `ImageFolder(DATA_ROOT/"train"|"validation"|"test")` |
| Clases | **16** (cabeza `16 clases`) |
| batch / epochs | 64 / **40** (patience 8, macro-F1 val) |
| Checkpoints | `OUT/checkpoints/{best,last}.pth`; `OUT = "/content/M1_mobilenetv2_001"` (**efímero en Colab, no persistido**) |
| Salida de modelo | **`.pth` (PyTorch)** — no `.h5` |

### 3.2 `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb`

| Atributo | Valor (evidencia) |
|---|---|
| Run | `M2_efficientnet_b0_001` (líneas 10, 36) |
| Framework | **PyTorch/torchvision** (`efficientnet_b0`) |
| **Ruta de datos** | `DATA_ROOT = DRIVE_ROOT + "/datasets/v1/curated"`; `DRIVE_ROOT = /content/drive/MyDrive/SIGCTiArural` (líneas 196-197) |
| Clases | **16** |
| batch / epochs | 64 / **40** (patience 8) |
| `OUT` | `DRIVE_ROOT + "/runs/M2_efficientnet_b0"` (**persistido en Drive**) |
| Checkpoints/métricas | `runs/M2_efficientnet_b0/checkpoints/{best,last}.pth`, `report/validation_metrics.json` |
| Salida de modelo | **`.pth` (PyTorch)** — no `.h5` |

### 3.3 Pipeline canónico de benchmark

- `benchmark/config.yaml`: `batch_size 64 · epochs 40 · patience 8 · lr 3e-4 · image_size 224 · weighted_loss true · class_balanced_sampling true`.
- `benchmark/src/models.py:4` → `build_model(name, num_classes=16, …)` sobre `torchvision.models`. **Solo PyTorch, 16 clases.**

**Conclusión 3:** `agriculture_images_tomato-potato-corn/v1` es, inequívocamente, el dataset de **M1 y M2**.

---

## 4. Trazabilidad de `plant_disease_mbv2.h5` (Keras/TF)

### 4.1 Inspección interna del `.h5` (h5py, read-only)

- Atributos: `backend, keras_version, model_config, training_config`.
- Grupos: `model_weights`, `optimizer_weights`.
- `training_config`: `loss = "sparse_categorical_crossentropy"`, `metrics=["accuracy"]`, `optimizer=Adam lr=1e-3`. **Sin epochs, sin nombres de clase.**
- `model_config` = `Functional`, 6 capas: `InputLayer · Rescaling · Functional(mobilenetv2_1.00_224) · GlobalAveragePooling2D · Dropout · Dense`.

### 4.2 Contraste estructural

La topología de 6 capas con `Rescaling` (y **sin** `preprocess_input`) coincide exactamente con el script **Keras** `src/ai_models/train_plant_disease_mobilenet.py` (variante `Rescaling`), y **no** con la variante de notebook (`preprocess_input`). El `model_metadata.json` (`{"classes":["enferma","sana"],"framework":"tensorflow_fixed"}`) es emitido **solo** por ese script Keras.

### 4.3 Dataset declarado por el script del `.h5`

- `train_plant_disease_mobilenet.py` → `--data-root` default **`data/datasets/plant_disease`** (binario `{enferma,sana}`).
- **`data/datasets/plant_disease` NO EXISTE** (`Test-Path` = `False`). `data/datasets/` solo contiene `agriculture_images_tomato-potato-corn` y `sigct_rural_acoustic`.
- El preparador `prepare_plant_disease_dataset.py` genera etiquetas **`species__condition` (16)**, **no** `enferma/sana`. No existe script que produzca el binario.
- El origen externo `D:\RespaldoData\PlantVillage-Dataset` (`dataset_card.md:12`) tampoco está disponible en esta máquina.

---

## 5. Matriz de relación (contundente)

| Eje | `agriculture_images_tomato-potato-corn/v1` | `plant_disease_mbv2.h5` |
|---|---|---|
| Framework | PyTorch / torchvision | Keras / TensorFlow |
| Formato de modelo | `.pth` (checkpoint) | `.h5` |
| Clases | **16** (`species__condition`) | **2** (`enferma`/`sana`) |
| Ruta de datos | `/…/datasets/v1/curated` | `data/datasets/plant_disease` (ausente) |
| Consumidor probado | M1, M2 (`notebooks/*`) | `train_plant_disease_mobilenet.py` |
| Menciones cruzadas | M1/M2 no referencian `.h5` | El `.h5` no referencia `v1` |

**No existe ningún artefacto (manifest, labels, split, checksum, notebook) que conecte `v1` con `plant_disease_mbv2.h5`.**

---

## 6. Respuestas a los 6 puntos de la misión

1. **Qué dataset entrenó realmente a `plant_disease_mbv2.h5`:** un dataset **binario `{enferma,sana}`** invocado por el script Keras `train_plant_disease_mobilenet.py` desde `data/datasets/plant_disease`. Ese dataset **no existe en disco** y **no hay artefacto** de su construcción. La procedencia del binario es **irreconstruible** desde el repo.
2. **¿`agriculture_images_tomato-potato-corn/v1` es el dataset del `.h5`?**: **NO** (framework, nº de clases, esquema de etiqueta y rutas difieren).
3. **RAW / curated / labels / manifests / split_lists:** inventariados y verificados (§2). Corresponden a la taxonomía **16-clases `species__condition`**, con split seed 42 (15.741/3.373/3.374) y 8 manifiestos.
4. **Notebooks M1/M2:** usan `v1/curated` vía `ImageFolder`; PyTorch; 16 clases; epochs 40; checkpoints `.pth`. No producen ni mencionan el `.h5`.
5. **Rutas/clases/imágenes/epochs/checkpoints:**
   - M1/M2: `/content/drive/MyDrive/SIGCTiArural/datasets/v1/curated` · 16 clases · 22.488 imágenes · 40 epochs (patience 8) · `checkpoints/{best,last}.pth`.
   - `.h5`: `data/datasets/plant_disease` (ausente) · 2 clases · images desconocidas · 3 epochs (default) · sin checkpoints (guardado final `.h5`).
6. **Determinación:** **`DATASET_UNRELATED_TO_MODEL`**.

---

## 7. Conclusión y honestidad de estado

- `agriculture_images_tomato-potato-corn/v1` = **`DATASET_RELATED`** con **M1/M2** (PyTorch, 16-clases). Documentado y trazable de extremo a extremo (RAW → labels → split → curated → notebooks → checkpoints).
- `agriculture_images_tomato-potato-corn/v1` = **`DATASET_UNRELATED_TO_MODEL`** con **`plant_disease_mbv2.h5`**.
- El `.h5` productivo quedó **huérfano de dataset**: binario `{enferma,sana}`, origen no reproducible. Esto **refuerza y es coherente** con el veredicto previo `MODEL_RETRAIN_REQUIRED` (`docs/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md`): sin dataset de entrenamiento no hay auditoría ni recuperación; además, el artefacto disponible (v1) **no es** su insumo.
- **Nota de gobernanza:** que `v1` exista y sea sano **no rehabilita** al `.h5`. Se declara explícitamente para no inducir a confusión: *mismo dominio (PlantVillage), distinto artefacto y distinto pipeline*.

---

## 8. No tocado (declaración)

- No se modificó código ni documentación existente; este informe es un archivo nuevo (untracked).
- No se entrenó, no se generó modelo, no se tocó `v1/` ni el `.h5`.
- No se hicieron commits ni push. `stash@{0}`, backups y `.dockerignore` intactos.
- La sonda `h5py` se ejecutó en el contenedor y se eliminó (`/tmp`), sin residuos.
