# AGRICULTURE_AI_V2_BENCHMARK_READINESS

## Fecha

2026-07-16

## Objetivo

Verificar que `Agriculture AI V2` quedó listo (a nivel de artefactos de gobierno y especificaciones) para iniciar un benchmark científico controlado.

Este documento no entrena, no ejecuta modelos y no materializa splits en disco. Solo verifica que los prerequisitos documentales y de gobernanza están cerrados.

---

## 1. Artefactos requeridos

## 1.1 Inventario del dataset

- [AGRICULTURE_AI_V2_DATASET_INVENTORY.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/AGRICULTURE_AI_V2_DATASET_INVENTORY.md)

Estado: `OK`

## 1.2 Manifests

Ubicación:

- [docs/ai/manifests](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests)

Manifests mínimos:

1. [raw_source_manifest.agriculture_v2_dataset_v1.yaml](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests/raw_source_manifest.agriculture_v2_dataset_v1.yaml)
2. [curation_manifest.agriculture_v2_dataset_v1.yaml](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests/curation_manifest.agriculture_v2_dataset_v1.yaml)
3. [taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests/taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml)
4. [split_manifest.agriculture_v2_split_v1.yaml](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests/split_manifest.agriculture_v2_split_v1.yaml)
5. [baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests/baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml)

Estado: `OK`

## 1.3 Taxonomía materializada

- [AGRICULTURE_AI_V2_TAXONOMY.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/AGRICULTURE_AI_V2_TAXONOMY.md)

Estado: `OK`

## 1.4 Label schema materializado

- [AGRICULTURE_AI_V2_LABEL_SCHEMA.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/AGRICULTURE_AI_V2_LABEL_SCHEMA.md)

Estado: `OK`

## 1.5 Split specification materializado

- [AGRICULTURE_AI_V2_SPLIT_SPECIFICATION.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/AGRICULTURE_AI_V2_SPLIT_SPECIFICATION.md)

Estado: `OK`

## 1.6 Data quality framework materializado

- [AGRICULTURE_AI_V2_DATA_QUALITY_FRAMEWORK.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/AGRICULTURE_AI_V2_DATA_QUALITY_FRAMEWORK.md)

Estado: `OK`

---

## 2. Prerequisitos de dataset para benchmark

## 2.1 Existencia física del dataset

El dataset base es externo al repo y debe existir en:

- `C:\Users\Devbadolgm\Development\workspace\DatosProyectos\PlantVillage-Dataset-master\raw\color`

Estado: `ASUMIDO OK` (confirmado previamente por auditoría física; no se re-ejecuta inventario aquí).

## 2.2 Exclusiones correctas (anti-fuga)

Se confirma que la especificación excluye variantes derivadas:

- `raw/grayscale`
- `raw/segmented`

Estado: `OK`

---

## 3. Prerequisitos científicos mínimos

## 3.1 Métrica primaria

- `Macro F1`

Estado: `OK` (fijado en baseline experiment manifest).

## 3.2 Métricas secundarias

- `balanced_accuracy`
- `per_class_recall`
- `per_class_precision`
- `weighted_f1`
- `confusion_matrix`

Estado: `OK`

## 3.3 Curvas obligatorias

- ROC one-vs-rest
- PR por clase
- calibration curve + ECE

Estado: `OK`

---

## 4. Riesgos que permanecen abiertos (no bloqueantes)

1. sesgo de laboratorio PlantVillage (no campo)
2. desbalance severo de clases minoritarias (especialmente `Potato___healthy`)
3. ausencia de `real_world_holdout` dentro del baseline inicial (se planifica como siguiente fase)

Estos riesgos afectan validez de campo, no el benchmark controlado de laboratorio.

---

## 5. Decisión final GO / NO GO

Decisión:

## GO

Justificación:

1. el dataset objetivo está inventariado y el subconjunto está cerrado (16 clases, 21.160 imágenes)
2. la taxonomía `agriculture_v2_taxonomy_v1` está materializada
3. el label schema `agriculture_v2_label_schema_v1` está materializado
4. el split `agriculture_v2_split_v1` está especificado con reglas anti-fuga
5. los manifests están completos y referencian versiones consistentes
6. el framework de calidad define gates mínimos previos a entrenamiento

Condición operativa para iniciar benchmark:

- materializar el split (train/validation/test) a partir del split spec y ejecutar el pipeline de entrenamiento/benchmark en la fase siguiente (fuera del alcance actual).
