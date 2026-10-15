# PLANT_DISEASE_MODEL_PROVENANCE_REPORT

## Informe forense de procedencia — `plant_disease_mbv2.h5`

- **Misión:** `PLANT_DISEASE_MODEL_PROVENANCE_REPORT`
- **Alcance:** SOLO trazabilidad/forensia. NO se modificó código, NO se entrenó, NO se generaron modelos, NO se instalaron dependencias, NO hubo commits ni push.
- **HEAD auditado:** `9109050` (`feature/cmsc-f3c-v1-implementation`)
- **Reglas aplicadas:** NO SUPONER · NO INFERIR · NO CONCLUIR SIN EVIDENCIA. Toda afirmación se ancla a un artefacto (archivo, hash, commit, binario). Lo que no tiene evidencia se declara explícitamente como **SIN EVIDENCIA**.

---

## 1. Resumen ejecutivo

La procedencia del modelo `src/ai_models/production_models/plant_disease_mbv2.h5` es **parcialmente trazable**.

Se identificó con evidencia **el generador y la receta**:

1. El **script** `src/ai_models/train_plant_disease_mobilenet.py` construye exactamente la arquitectura almacenada en el `.h5` (MobileNetV2 congelada + `Rescaling(1/127.5, offset=-1)` + `GlobalAveragePooling2D` + `Dropout(0.2)` + `Dense(softmax)`).
2. El **script de construcción de dataset** `import_local_dataset.py` (archivado en git, borrado del árbol en `0d81b06`) define el dataset de entrenamiento: subconjunto **Tomate** de PlantVillage, **binario** (`sana`/`enferma`), split 80/20.
2. El **artefacto** (`.h5` + `model_metadata.json`) fue introducido en el commit `f773212`.

Sin embargo, **NO existe ninguna evidencia de la corrida de entrenamiento** (log, métricas, history, checkpoint, dataset materializado). Por tanto la procedencia es **incompleta**: se conoce el "cómo se debió construir", no el registro de que se construyó así.

**Pregunta explícita — ¿existe evidencia que conecte `plant_disease_mbv2.h5` con el dataset `agriculture_images_tomato-potato-corn/v1`?**
**NO.** Ver §4.

**Clasificación final: `MODEL_PARTIALLY_TRACEABLE`** (§6).

---

## 2. Inventario de entidades auditadas

| Entidad | Ruta | Evidencia | Estado |
|---|---|---|---|
| Modelo | `src/ai_models/production_models/plant_disease_mbv2.h5` | 9 431 432 B · SHA-256 `77B0EFECD602F95FD31846C3058B4D45E41289155438FBD22738BCE0640219C0` | EXISTE |
| Metadatos | `src/ai_models/production_models/model_metadata.json` | SHA-256 `8C7A5B5B5AB25E4C97D2263C10D824CC4FD1DF73BF0C69D5DD701A8D0A7D47CF` · `{"classes":["enferma","sana"],"framework":"tensorflow_fixed"}` | EXISTE |
| Script generador | `src/ai_models/train_plant_disease_mobilenet.py` | SHA-256 `84AA3F855316F80296F300AE07E664258930815D8EDC86A356B42C188688A5FE` · 91 líneas | EXISTE |
| Script de dataset | `import_local_dataset.py` (raíz) | añadido en `0ff1050`, **eliminado en `0d81b06`** (no existe en disco, solo en historial git) | SOLO HISTÓRICO |
| Notebook | `src/ai_models/notebooks/plant_disease_training.ipynb` | 0 bytes; añadido en `1344bee` (2025-11-02) | VACÍO |
| Notebook alterno | `src/ai_models/notebooks/train_plant_disease_mobilenet.py` | usa `preprocess_input` ([-1,1] per-canal), epochs=5, sin metadata | EXISTE (NO generó el `.h5`) |
| Dataset del modelo | `data/datasets/plant_disease/{train,val}/{sana,enferma}` | **NO existe en disco** (`Test-Path` = False) | AUSENTE |
| Dataset v1 (16 clases) | `data/datasets/agriculture_images_tomato-potato-corn/v1/` | 22 488 imgs · 16 clases · creado 2026-09-23 | EXISTE (NO del `.h5`) |

---

## 3. Preguntas A–I (con evidencia / sin evidencia)

### A. ¿Cuál es el dataset del modelo?

**CON EVIDENCIA (receta, no materialización).** El modelo fue entrenado con la salida de `import_local_dataset.py`, que construye:

```
data/datasets/plant_disease/
  train/{sana,enferma}/   # 80 %
  val/{sana,enferma}/     # 20 %
```

- Fuente: `PlantVillage-Dataset-master/raw/color` (ruta Windows `C:/Users/bagm2/workspace_toshibaKingston/projectsbadolgm/...`).
- Filtro: **solo tomate** (`folder_name.startswith("Tomato___")`).
- Etiqueta binaria: contiene `"healthy"` → `sana`; en caso contrario → `enferma`.
- Split: 80/20 por carpeta, con `random.shuffle` (sin semilla).
- El `.h5` fue entrenado con `--data-root` por defecto `data/datasets/plant_disease` (línea 48 del script), y `image_dataset_from_directory` infiere las clases de los subdirectorios → **2 clases**.

Evidencia cruzada: `model_metadata.json` declara `classes=["enferma","sana"]` → **coincide** con el orden alfabético de subdirectorios del dataset binario.

**SIN EVIDENCIA:** la materialización concreta del dataset (número exacto de imágenes, fecha de copia, contenido por clase). El directorio no existe hoy.

### B. ¿Qué notebook lo originó?

**SIN EVIDENCIA — y además evidencia en contra.** Ningún notebook generó el `.h5`.

- `plant_disease_training.ipynb` está **vacío (0 bytes)** desde `1344bee` (2025-11-02).
- Los notebooks existentes (`SIGCTIARURAL_M1_MobileNetV2.ipynb`, `SIGCTIARURAL_M2_EfficientNetB0.ipynb`) son **PyTorch**, 16 clases, y producen `.pth`, no un `.h5` Keras.
- El generador probado es el **script** `train_plant_disease_mobilenet.py` (§3.C), no un notebook.

### C. ¿Qué framework?

**CON EVIDENCIA.** Keras/TensorFlow.

- El `.h5` contiene atributos `backend`, `keras_version`, `model_config`, `training_config` y grupos `model_weights`, `optimizer_weights` (formato nativo Keras).
- `training_config`: `loss="sparse_categorical_crossentropy"`, `metrics=["accuracy"]`, `optimizer=Adam (lr=1e-3)`.
- `model_config`: capas `InputLayer → Rescaling → Functional(mobilenetv2_1.00_224, trainable=false) → (…GAP, Dropout…) → Dense(2, softmax)`.
- Versión declarada: `keras_version = 3.13.0` (única cadena de 3 componentes en el binario; coherente con el uso de `DTypePolicy` en el `model_config`).
- Contraste: **NO** es PyTorch (los notebooks M1/M2 y `benchmark/src/models.py` son PyTorch, `num_classes=16`).

### D. ¿Qué clases?

**CON EVIDENCIA.** 2 clases: **`enferma` (índice 0)** y **`sana` (índice 1)**.

- `model_metadata.json`: `["enferma","sana"]`.
- `Dense` final: `activation="softmax"`, unidades = 2.
- Coincide con la construcción del dataset binario (§3.A).

### D.bis. Contexto de origen del dataset del `.h5` (evidencia adicional)

El script de construcción **contenía la semilla del colapso por desbalance**. A partir de los conteos de las clases de tomate presentes en `v1` (que refleja el subconjunto de tomate de PlantVillage, sin `Spider_mites`):

| Grupo | Clases (tomate) | Imágenes |
|---|---|---|
| `sana` | `healthy` | 1 591 |
| `enferma` | bacterial_spot 2 127 · early_blight 1 000 · late_blight 1 909 · leaf_mold 952 · septoria_leaf_spot 1 771 · target_spot 1 404 · mosaic_virus 373 · yellow_leaf_curl_virus 5 357 | **14 893** |

Relación de desbalance ≈ **14 893 : 1 591 ≈ 9.4 : 1**. Con backbone congelada + `epochs=3`, la salida esperada es el **colapso a la clase mayoritaria** (`enferma` = `class_0`), consistente con el comportamiento degenerado confirmado en `docs/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md`. *(Nota: el script de importación incluye además `Tomato___Spider_mites…`, ausente en v1; el desbalance real es aún mayor.)*

### D. ¿Cuántas epochs?

**SIN EVIDENCIA DIRECTA.** El `.h5` **no almacena el número de épocas** (el `training_config` no incluye `epochs`). El único dato disponible es el **valor por defecto del script**: `--epochs default=3` (línea 49, comentario: *"3 épocas es suficiente para probar rápido"*).

El contador real del optimizador (`adam/iteration`) **existe en el binario** (grupo `optimizer_weights`, datasets `adam/iteration`, `adam/dense_kernel_velocity`, etc.), es decir **el modelo SÍ fue entrenado** (no es un modelo sin entrenar), pero su valor numérico **no pudo leerse**: el contenedor Docker (con `h5py`) dejó de estar disponible durante la auditoría y el host no tiene `h5py` ni TensorFlow, y no se autorizó instalar dependencias. Por tanto, `epochs=3` es **el default del script, no un hecho verificado de la corrida**.

### E. ¿Qué métricas?

**SIN EVIDENCIA.** No existe en el repositorio ningún archivo de métricas de esta corrida: ni `validation_metrics.json`, ni `history.csv`, ni matriz de confusión, ni `model_card.md`. `docs/AI_PREDICTION_VALIDATION_AUDIT.md` (2026-07-16) y `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` (2026-09-20) documentan el **comportamiento degenerado** del modelo (colapso a `class_0`), pero **no son el registro de la corrida de entrenamiento**.

### F. ¿Qué checkpoints?

**SIN EVIDENCIA de checkpoints de corrida.** El repositorio contiene **un único** `.h5` (el artefacto productivo). No hay `best.pth`, `last.pth`, `checkpoint*.h5`, ni history de entrenamiento asociado a este modelo. Los `{best,last}.pth` documentados pertenecen a M1/M2 (PyTorch, otro linaje). La ausencia de logs de checkpoints confirma que **no se conservó registro de la ejecución**.

### F bis. ¿Qué evidencia git existe?

**CON EVIDENCIA.** El `.h5` **no fue producido en el repositorio**; fue **añadido ya construido**:

- `plant_disease_mbv2.h5` y `model_metadata.json` fueron añadidos en commit **`f773212`** — `2026-01-18 22:21:52 -0500`, autor/committer **Bernardo Gómez `<badolfogm@gmail.com>`**, mensaje *"feat: migración completa a PostgreSQL, soporte Nginx SPA y estabilización de Docker"* (`Bin 0 -> 9431432 bytes`).
- Es el **ÚNICO** `.h5`/`.ckpt`/`.pth` jamás añadido al historial del repositorio.
- `src/ai_models/production_models/` **solo** fue tocado por ese commit.
- **Línea de tiempo de scripts (evidencia de la receta):**
  - `8af6c52` (2025-12-30): versión inicial del script con `mobilenet_v2.preprocess_input` y `epochs` default 5.
  - `0ff1050` (2026-01-02): reescritura del script (**38 inserciones / 47 borrados**) a `layers.Rescaling(1./127.5, offset=-1)` y `epochs` default 3 (`"CORRECCIÓN APLICADA … error 'Unknown layer: TrueDivide'"`); añade además `import_local_dataset.py`.
  - `f773212` (2026-01-18): se commitea el `.h5` + metadata.

**Correlación artefacto↔script (evidencia fuerte):** el `model_config` interno del `.h5` tiene `Rescaling` con `scale=0.00784313725490196` = `1./127.5` y `offset=-1`, **idéntico** al literal del script post-`0ff1050`. La variante notebook (`preprocess_input`) no produciría esa capa. Conclusión: **el `.h5` corresponde al script de raíz en su versión post-`0ff1050`**, corrido entre el 2026-01-02 y el 2026-01-18.

### G. ¿Qué evidencia documental?

**CON EVIDENCIA (contexto, no corrida):**

| Documento | Fecha | Aporte |
|---|---|---|
| `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` (línea 403) | — | Afirma metadatos binarios `enferma/sana` y **"entrenado sobre el conjunto completo PlantVillage"** — afirmación **inexacta** frente al script real (solo tomate) |
| `docs/ai/research_v2/AI_DATASET_STRATEGY_V2.md` | 2026-07-16 | Declara: modelo **binario**; `PlantVillage` **no materializado** en el repo; `PlantVillage` como *bootstrap*, no dataset de verdad |
| `docs/ai/research_v2/AI_PREDICTION_VALIDATION_AUDIT.md` | 2026-07-16 | Confirma modelo binario y comportamiento degenerado |
| `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` | 2026-09-20 | Auditoría forense IA V5 |
| `docs/SIGCTIARURAL_PLANTVILLAGE_RECOVERY_PLAN.md` | — | Plan de recuperación |
| `docs/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` | actual | `MODEL_RETRAIN_REQUIRED` |
| `docs/PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md` | actual | `DATASET_UNRELATED_TO_MODEL` |

Ninguno documenta la **corrida** (quién/cuándo/cuántas épocas/métricas).

### H. ¿Cadena de trazabilidad reconstruible?

| Eslabón | ¿Evidencia? | Ancla |
|---|---|---|
| Autor de la corrida de entrenamiento | **SIN EVIDENCIA** | no hay log; solo se conoce el committer del artefacto (`f773212`) |
| Notebook de origen | **SIN EVIDENCIA (negativo)** | el único notebook está vacío; M1/M2 son PyTorch |
| Script generador | **SÍ** | `train_plant_disease_mobilenet.py` (match de arquitectura) |
| Receta del dataset | **SÍ (en historial git)** | `import_local_dataset.py` (`0ff1050`→borrado `0d81b06`) |
| Dataset materializado | **NO** | `data/datasets/plant_disease` ausente |
| Corrida (log/métricas) | **NO** | 0 `history`, 0 `config.json`, 0 `validation_metrics.json` |
| Checkpoints | **NO** | único `.h5` = el productivo |
| Épocas reales | **NO** | solo default del script (=3); `adam/iteration` no leído |
| Commit de incorporación | **SÍ** | `f773212` (2026-01-18) |

---

## 4. Pregunta explícita — ¿el modelo está ligado a `agriculture_images_tomato-potato-corn/v1`?

### Respuesta: **NO**

No existe ningún artefacto que conecte `plant_disease_mbv2.h5` con el dataset `v1`. Evidencia de la desconexión:

| Dimensión | `.h5` (binario) | `v1` (16 clases) |
|---|---|---|
| Fecha de creación | commit `f773212` **2026-01-18** | manifiestos **2026-09-23** (~8 meses después) |
| Framework | Keras/TensorFlow (`.h5`) | PyTorch (`.pth`, M1/M2) |
| Taxonomía | 2 clases `{enferma,sana}` | 16 clases `species__condition` |
| Cultivo | solo tomate | tomate (9) + papa (3) + maíz (4) |
| Ruta de datos | `data/datasets/plant_disease` | `.../v1/curated` |
| Consumidor | `fastapi_app.py` (binario) | notebooks M1/M2 (`num_classes=16`) |
| Regla de split | 80/20 por carpeta, sin semilla | 70/15/15 con semilla 42 |

Ambos **derivan de PlantVillage**, pero son **construcciones independientes**. `v1` es el dataset de M1/M2 (PyTorch, 16 clases) y fue creado meses después del `.h5`. Ningún script, manifiesto o registro vincula el artefacto Keras con `v1`.

---

## 5. Cadena de procedencia (con y sin evidencia)

```
[PlantVillage raw/color]                     (fuente; no materializada hoy)
        │  import_local_dataset.py  (0ff1050, solo-histórico)   ← EVIDENCIA: receta
        ▼
[data/datasets/plant_disease/{train,val}/{sana,enferma}]        ← SIN EVIDENCIA: no existe
        │  train_plant_disease_mobilenet.py (0ff1050, epochs def=3) ← EVIDENCIA: generador
        ▼
[plant_disease_mbv2.h5]  RESCALING(1/127.5,-1)+MobileNetV2 frozen+Dense(2) ← EVIDENCIA: artefacto
        │  commit f773212 (2026-01-18, Bernardo Gómez)          ← EVIDENCIA: incorporación
        ▼
[src/ai_models/production_models/plant_disease_mbv2.h5]        ← EXISTE (hash 77B0…19C0)

   ⚠ Eslabones SIN EVIDENCIA: quién ejecutó la corrida, cuándo exactamente,
     cuántas épocas, sobre cuántas imágenes, con qué métricas, con qué checkpoint.
   ⚠ NO HAY conexión con agriculture_images_tomato-potato-corn/v1.
```

---

## 6. Clasificación final

# `MODEL_PARTIALLY_TRACEABLE`

**Justificación (con evidencia):**

- **A favor de la trazabilidad (probado):** existe el artefacto (hash), el **script generador** con coincidencia exacta de arquitectura (`Rescaling` 1/127.5 y offset −1), la **receta del dataset** (script de importación en historial git), el **commit de incorporación** (`f773212`) y la **presencia de estado del optimizador** que prueba que el modelo fue entrenado.
- **En contra de la trazabilidad completa (no probado):** no existe **ningún registro de la corrida** — ni log, ni métricas, ni checkpoints, ni dataset materializado, ni épocas reales. El dataset (`plant_disease`) no existe y la fuente original (PlantVillage) no está en disco. El autor de la corrida no está documentado.

Se concluye **parcial**: la *intención y la maquinaria* están documentadas y correlacionan; la *ejecución* no está registrada. No procede `MODEL_NOT_TRACEABLE` (hay generador y receta probados) ni `MODEL_TRACEABLE` (falta toda la evidencia de la corrida).

---

## 7. Declaración explícita de lo NO evidenciado

1. **Autor/ejecutor de la corrida de entrenamiento:** SIN EVIDENCIA.
2. **Fecha exacta de la corrida:** SIN EVIDENCIA (acotada a 2026-01-02 … 2026-01-18 por commits).
3. **Número de épocas reales:** SIN EVIDENCIA (default del script = 3, no verificado).
4. **Número de imágenes del dataset binario:** SIN EVIDENCIA (directorio ausente).
5. **Métricas de la corrida:** SIN EVIDENCIA (0 artefactos de métricas).
6. **Checkpoints de la corrida:** SIN EVIDENCIA (único `.h5` = el productivo).
7. **Semilla de split:** SIN EVIDENCIA (el script usa `random.shuffle` sin semilla).
8. **Contador del optimizador (`adam/iteration`):** PRESENTE en el binario pero **no leído** (Docker no disponible; host sin `h5py`/TensorFlow; sin autorización para instalar).
9. **Vínculo con `agriculture_images_tomato-potato-corn/v1`:** SIN EVIDENCIA — y evidencia en contra (§4).

**Corrección documental derivada:** la afirmación del ADSO (*"entrenado sobre el conjunto completo PlantVillage"*) es **inexacta** según el script real (`import_local_dataset.py` filtra **solo tomate** y colapsa a binario). Debe anotarse como referencia histórica no verificada.

---

## 8. Riesgos

| ID | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| R1 | El `.h5` es el único artefacto de su tipo; su pérdida imposibilita recomputar la procedencia | ALTA | Conservar (regla NADA DESAPARECE); hash registrado en §2 |
| R2 | Sin dataset ni métricas, no es posible auditar ni recalibrar el modelo | ALTA | `MODEL_RETRAIN_REQUIRED` (ver reporte de recovery) |
| R3 | Documentación (ADSO) describe el modelo con datos inexactos | MEDIA | Corregir/anotar la afirmación; no tratarla como contrato |
| R4 | `import_local_dataset.py` solo existe en historial git (borrado en `0d81b06`) | MEDIA | Preservar en el historial; NO reescribir ese commit |
| R5 | Scripts divergentes (`Rescaling` vs `preprocess_input`) pueden inducir a error futuro | MEDIA | Fijar el script de raíz como canónico del `.h5`; documentar la divergencia |

---

## 9. Referencias (evidencia primaria)

- `src/ai_models/production_models/plant_disease_mbv2.h5` — SHA-256 `77B0…19C0`, 9 431 432 B.
- `src/ai_models/production_models/model_metadata.json` — SHA-256 `8C7A…47CF`.
- `src/ai_models/train_plant_disease_mobilenet.py` — SHA-256 `84AA…A5FE`.
- `import_local_dataset.py` — `git show 0ff1050:import_local_dataset.py`; borrado en `0d81b06` (2026-07-19).
- Commits: `1344bee` (2025-11-02) · `8af6c52` (2025-12-30) · `0ff1050` (2026-01-02) · `f773212` (2026-01-18) · `0d81b06` (2026-07-19).
- `docs/ai/research_v2/AI_DATASET_STRATEGY_V2.md` · `docs/ai/research_v2/AI_PREDICTION_VALIDATION_AUDIT.md` · `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` · `docs/SIGCTIARURAL_PLANTVILLAGE_RECOVERY_PLAN.md` · `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`.
- Auditorías hermanas: `docs/PLANT_DISEASE_MODEL_RECOVERY_REPORT.md` · `docs/PLANT_DISEASE_DATASET_TRACEABILITY_AUDIT.md`.

---

Fin del informe. Ningún archivo de código, dataset, modelo o configuración fue modificado; no hubo commits ni push.
