# AI MODEL INVENTORY — SIGCT-Rural

**Misión:** CMSC_AI_ACOUSTIC_V1 · **FASE 3 · Recuperación de modelos**
**Fecha:** 2026-10-02 · **HEAD verificado:** `83b6089` · **Método:** solo lectura (rutas y tamaños en disco)
**Propósito:** saber qué IA existe realmente antes de construir el clasificador acústico S81.

> **Veredicto central:** el repositorio tiene gobernanza de ML de nivel industrial y **exactamente un
> peso de red neuronal materializado — que está científicamente descalificado**. Los modelos oficiales
> del benchmark (M1/M2) **no existen en disco**. El activo más sólido es el **dataset** (22.488 imágenes),
> pero está **fuera de git**.

---

## 1. Modelos entrenados en disco

### 1.1 ÚNICO modelo materializado — `plant_disease_mbv2.h5`

| Campo | Valor |
|---|---|
| Ruta | `src/ai_models/production_models/plant_disease_mbv2.h5` |
| Tamaño | 9.431.432 B (9,00 MiB) |
| Formato | HDF5 / Keras 2 (Functional) |
| Git | versionado (no ignorado) |
| Arquitectura | `mobilenetv2_1.00_224` congelado (weights=imagenet, `training=False`) + `GlobalAveragePooling` + `Dropout(0.2)` + `Dense(2, softmax)` |
| Entrada | `[None,224,224,3]`, `Rescaling(scale=1/127.5, offset=-1)` |
| Salida | 2 clases (`class_0`, `class_1`) |
| Metadatos | `src/ai_models/production_models/model_metadata.json` (65 B): `{"classes":["enferma","sana"],"framework":"tensorflow_fixed"}` |
| Estado | ❌ **ROTO / descalificado** — colapsa a `class_0` (~0.99) en toda entrada |
| Evidencia | `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md:100-103` (test_leaf → 0.9953 class_0; solid_red → 0.9954; checker → 0.9876; `class_1` nunca observada) |

**Causa mecánica del colapso (doble normalización):** el `.h5` ya incluye la capa `rescaling` a `[-1,1]`,
y además `src/ai_models/fastapi_app.py:192` aplica `mobilenet_v2.preprocess_input(arr)` (también `[-1,1]`).
La imagen recibe la normalización dos veces → el modelo ve un rango fuera de dominio.

> Este modelo **NO es M1 ni M2**: M1/M2 son MobileNetV2/EfficientNet-B0 de **16 clases en PyTorch**. Este es
> un binario de **2 clases en TensorFlow/Keras**. → **No sirve para la clasificación acústica.**

### 1.2 Artefactos del benchmark — REFERENCIADOS-AUSENTES

Contrato de salida definido en `benchmark/src/train.py:93-131`:

```
runs/<run_id>/config.json              ← ausente
runs/<run_id>/metrics.csv              ← ausente
runs/<run_id>/checkpoints/best.pth     ← ausente
runs/<run_id>/checkpoints/last.pth     ← ausente
runs/<run_id>/plots/                    ← directorio vacío
runs/<run_id>/report/                   ← directorio vacío
```

Estado real en disco:
- `benchmark/runs/M1_mobilenetv2_001/` → **3 directorios vacíos** (checkpoints, plots, report).
- `benchmark/runs/M2_efficientnet_b0/` → **NO existe**.
- `benchmark/requirements.lock` (citado en README) → **no existe**.
- `.gitignore:20` ignora `benchmark/runs/` → los pesos **nunca pudieron versionarse por diseño**.

### 1.3 Barrido de extensiones de modelo (todo el repo, sin `.git`/`node_modules`/`.venv`)

`.h5` **1** · `.keras` 0 · `.pth` 0 · `.pt` 0 · `.ckpt` 0 · `.onnx` 0 · `.tflite` 0 · `.pb` 0 · `.safetensors` 0 · `.pkl` 0 · `.joblib` 0 · `.bin` 0

- `src/embedded/bbb_02_ia_edge/tflite_api.py` → **0 bytes** (`DISENO`).
- Exports edge exigidos por manifiesto (`tflite_float16`, `tflite_int8`) → **REFERENCIADOS-AUSENTES**.

---

## 2. Notebooks

| Notebook | Bytes | Celdas | Con output | Estado |
|---|---:|---:|---:|---|
| `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb` | 792.372 | 37 | **16** | EXISTE / ejecutado (única evidencia de métricas M1) |
| `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` | 47.522 | 29 | **0** | EXISTE / **sin ejecutar** |
| `src/ai_models/notebooks/plant_disease_training.ipynb` | **0** | — | — | DISEÑO (vacío) |

- M1 (macro-F1 0.9899 · ECE 0.0313) está respaldado por **outputs del notebook**; el `.pth` nunca se recogió.
- M2 declara macro-F1 0.9937 · balanced 0.9943 · ECE 0.0332, pero **no contiene ningún output ni artefacto**:
  las métricas M2 viven **solo en prosa** (`Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md`).
- M1 y M2 documentan el **sesgo de laboratorio** (9 coincidencias PlantVillage, 26 `leaf` en M1).

---

## 3. Scripts de entrenamiento / evaluación

### 3.1 Pipeline benchmark PyTorch (`benchmark/src/`)

| Archivo | Bytes | Responsabilidad |
|---|---:|---|
| `train.py` | 5.787 | loop AMP, AdamW, cosine, early stop, `torch.save` best/last |
| `datasets.py` | 3.274 | `ImageFolder`, transforms, `WeightedRandomSampler`, seeds |
| `models.py` | 1.201 | factory: MobileNetV2/V3-Large, EfficientNet-B0, ResNet50, ConvNeXt-Tiny |
| `eval.py` | 4.126 | ROC OvR, PR, calibración, plots |
| `metrics.py` | 2.015 | macro/weighted F1, balanced acc, per-class, matriz de confusión, ECE |

`config.yaml` (249 B, **en realidad JSON**): `batch_size 64 · epochs 40 · patience 8 · lr 3e-4 · image_size 224 · weighted_loss true · class_balanced_sampling true`.

### 3.2 Pipeline TensorFlow producción (`src/ai_models/`)

| Archivo | Bytes | Detalle |
|---|---:|---|
| `fastapi_app.py` | 15.488 | servicio de inferencia (ver §6) |
| `train_plant_disease_mobilenet.py` | 3.443 | Keras MobileNetV2 congelado + `Rescaling`; escribe `.h5` + metadata |
| `notebooks/train_plant_disease_mobilenet.py` | 2.340 | variante anterior con `preprocess_input` |
| `notebooks/prepare_plant_disease_dataset.py` | 4.405 | ETL PlantVillage → `train_test_split` |

> **Discrepancia de datos:** ambos scripts TF apuntan a `data/datasets/plant_disease`, que **no existe**.
> El dataset real está en `data/datasets/agriculture_images_tomato-potato-corn/v1`.

---

## 4. Datasets

### 4.1 Activo real — `data/datasets/agriculture_images_tomato-potato-corn/v1/`

**NO versionado** (`.gitignore:68` → `/data/`; `git ls-files data/` = 0).

| Subárbol | Archivos | Bytes |
|---|---:|---:|
| `RAW/` (16 clases) | 22.488 | 346.407.515 |
| `curated/train/` | 15.741 | 242.255.796 |
| `curated/validation/` | 3.373 | 51.834.339 |
| `curated/test/` | 3.374 | 52.317.380 |
| `holdout/real_world_holdout_v1/` | **0** | — |
| **TOTAL** | **44.992** (RAW+copia) | **≈670 MB** |

- 16 clases, 3 especies (tomate, papa, maíz), split 70/15/15, seed 42.
- Desequilibrio severo: `potato__healthy` (106) vs `tomato__yellow_leaf_curl_virus` (3.750) → **35:1**.
- Trazabilidad: `dataset_card.md`, `CHECKSUMS.sha256` (3,4 MB), `labels/labels_v1.csv`, `split_lists/*.csv`, `split_report.json`.
- **8 manifiestos YAML** en `v1/manifests/` (y copia en `docs/ai/manifests/`).
- Upstream externo declarado: `D:\RespaldoData\PlantVillage-Dataset` (**fuera del repo**);
  la copia local tenía 38 clases / 54.305 archivos (~0,79 GB): la materialización fue una **selección**, no copia íntegra.

### 4.2 Datasets de audio

**No existen.** No hay corpus de audio, ni etiquetado de clases ambientales, ni grabaciones de referencia
para S81/S82. → Es la **brecha #1** para la IA acústica (ver riesgos).

---

## 5. Referencias PlantVillage / ML

- **170 archivos** con coincidencias (`PlantVillage`, `plant_disease`, `leaf`, `hoja`, `cultivo`, `enfermedad`).
- Concentración: `docs/` (68), `backup_ubtn_docs/` (15), `Documentacion/{IA,Arquitectura}` (10), dataset (12), backend (9), frontend (8).
- Bundles generados (`src/frontend/dist/assets/index-*.js`) embeben 65 `PlantVillage` → son artefactos de build **del simulador de circuitos**, no fuente.
- Datasets públicos referenciados: PlantVillage (`github.com/spMohanty/PlantVillage-Dataset`, `raw/color`).

---

## 6. Servicio IA

**`src/ai_models/fastapi_app.py`** (FastAPI, puerto **8081**, `docker-compose` servicio `ai_service`).

| Endpoint | Método | Función |
|---|---|---|
| `/health` | GET | `model_loaded`, `tensorflow`, `voice` |
| `/infer` | POST | inferencia de imagen (multipart) |
| `/assist` | POST | asistente conversacional + TTS |
| `/events` | GET | SSE desde `infer_log.jsonl` |
| `/analyze-circuit` | POST | reglas deterministas |

- **Carga** el `.h5` binario de 2 clases (`glob("*.h5")` + más reciente). **NO** carga M1/M2 (`.pth` PyTorch, incompatible).
- **Salida** `diagnosis = f"class_{idx}"` (sin semántica); el backend la resuelve (`class_0→enferma`, `class_1→sana`).
- **Voz:** `gTTS` (TTS de red). **No hay STT/LLM ni API keys.**
- **`.dockerignore` no excluye el `.h5`** → el modelo descalificado va dentro de la imagen.
- **No hay endpoints de audio** (clasificación acústica): campo totalmente ausente.

### 6.1 Contrato semántico (referencia reutilizable)

`src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py` (`POST /infer`, retry ×3 con tenacity)
+ `semantic_prediction_resolver.py` (`class_0→enferma`, `class_1→sana`). En error de contrato devuelve
`source_mode:"fallback"` + `raw_class_index` (regla EIARC). **Patrón aplicable al clasificador acústico.**

---

## 7. Documentación IA/ML relevante

- `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` — M1 congelado; M2 "ejecutado"; **decisión PENDIENTE** (declara HEAD obsoleto `fa8e6a4`).
- `Documentacion/IA/Benchmark_M1/` — informe APA7, MASTERDOC, correcciones M2, evidencia de ejecución, tabla M1–M5.
- `docs/ai/research_v2/` — programa V2 (18 docs, DISEÑO): `AI_TRAINING_PIPELINE_V2`, `AI_MLOPS_AND_TRAINING_GOVERNANCE_V2`, `AI_DATASET_STRATEGY_V2`, `AI_SCIENTIFIC_CORRECTION_DESIGN`, `AI_PREDICTION_VALIDATION_AUDIT`, `AGRICULTURE_AI_V2_*`, etc.
- `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` — colapso monoclasse; "SIMULACIÓN" vs "ROBOT DEMO" idénticos; badge "ONLINE" estático.
- `docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md` — *"pila documentalmente excepcional y materialmente mínima"*.
- `Documentacion/Arquitectura/CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md` — inventario canónico (confirma esta auditoría).

---

## 8. Estado real vs referenciado vs diseño

### EXISTE (en disco)
`plant_disease_mbv2.h5` (descalificado) · `model_metadata.json` · notebooks M1 (con outputs) y M2 (sin ejecutar) · 8 scripts de entrenamiento/eval · dataset v1 (~670 MB, fuera de git) · 8 manifiestos · checksums/splits · `fastapi_app.py` + Dockerfile/compose · adaptador + resolver backend · `benchmark/.venv` (torch 2.5.1+cpu).

### REFERENCIADO-AUSENTE
`runs/M1_*/checkpoints/{best,last}.pth`, metrics, config, plots · toda la corrida M2 · `/content/M1_*` (Colab efímero) · `requirements.lock` · `data/datasets/plant_disease` · `artifacts_expected` del manifiesto v2 (benchmark/calibration/error reports, model_cards, confusion_matrices, curves) · exports edge `tflite_float16/int8` · métricas M2 sin artefacto · dataset externo PlantVillage · holdout de campo.

### DISEÑO
Dataset V3+ y holdout de campo · modelos M3–M5 · Edge AI (`tflite_api.py`, MQTT, sensor reader = 0 bytes) · `plant_disease_training.ipynb` (0 bytes) · 18 docs research_v2 · ACP multiagente / Knowledge Graph / Evidence Ledger · modelos de series (Prophet/ARIMA/XGBoost/LSTM/GRU/TCN/TFT) · **clasificación acústica (no existe en absoluto)**.

---

## 9. Reutilizable para la IA acústica (S81/S82)

| Activo existente | Reutilizable |
|---|---|
| Patrón de contrato semántico (`fastapi_ai_adapter` + `semantic_prediction_resolver` + `source_mode`) | ✅ adoptar como contrato de `AcousticClassifier` |
| Esqueleto FastAPI + `/infer` + SSE `/events` + `infer_log.jsonl` | ✅ patrón para un futuro `/classify-audio` |
| Pipeline de evaluación (`benchmark/src/metrics.py`, `eval.py`: F1, ECE, calibración) | ✅ reusar métricas de clasificación acústica |
| Sistema de honestidad CMSC (badges, `estado`, `source_mode`) | ✅ obligatorio en S81/S82 |
| Motor FFT/STFT propio (`spectralEngine.js`) | ✅ ya produce las features (ver `AI_ACOUSTIC_FEATURE_MAP.md`) |
| `plant_disease_mbv2.h5` / M1 / M2 | ❌ **no reutilizables** para audio (dominio, clases y formato distintos) |
| Dataset agrícola de imágenes | ❌ no reutilizable para audio; sirve como **plantilla de gobernanza** de dataset |

## 10. Conclusión

No existe ningún modelo de audio ni dataset acústico. La IA acústica debe empezar **desde cero en datos
y modelo**, pero **no desde cero en arquitectura**: hereda el contrato semántico, el sistema de honestidad,
el pipeline de evaluación y el motor de features ya operativo. Ese es el andamiaje real sobre el que se
construye S81/S82 (ver `AI_ACOUSTIC_ARCHITECTURE_V1.md` y `AI_ACOUSTIC_ROADMAP_V1.md`).
