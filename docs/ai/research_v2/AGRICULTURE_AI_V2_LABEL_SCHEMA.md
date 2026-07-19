# AGRICULTURE_AI_V2_LABEL_SCHEMA

## Fecha

2026-07-16

## Objetivo

Materializar el esquema oficial de etiquetas para el baseline `Agriculture AI V2` inicial:

- `agriculture_v2_label_schema_v1`

Este esquema define los campos y valores mínimos para etiquetar muestras, garantizar compatibilidad con taxonomía y asegurar trazabilidad científica.

---

## 1. Identidad del esquema

- label_schema_version: `agriculture_v2_label_schema_v1`
- taxonomy_version_target: `agriculture_v2_taxonomy_v1`
- context: `agriculture`
- modality: `computer_vision`

---

## 2. Campos obligatorios

## 2.1 Campos del sample

1. `sample_id`
2. `taxonomy_version`

## 2.2 Campos taxonómicos

3. `species`
4. `condition_group`
5. `condition_name`
6. `health_state`

## 2.3 Campos de gobierno

7. `annotation_quality`
8. `validation_source`

---

## 3. Definición formal de cada campo

## 3.1 `sample_id`

- tipo: string
- regla: identificador estable y único de muestra dentro de `dataset_version`

## 3.2 `taxonomy_version`

- tipo: string
- regla: debe ser exactamente `agriculture_v2_taxonomy_v1` para el baseline V2 inicial

## 3.3 `species`

- tipo: enum
- valores permitidos:
  - `tomato`
  - `potato`
  - `corn`

## 3.4 `condition_group`

- tipo: enum
- valores permitidos:
  - `healthy`
  - `disease`

## 3.5 `condition_name`

- tipo: enum (cerrado por taxonomía)
- valores permitidos (V2 inicial):
  - `healthy`
  - `early_blight`
  - `late_blight`
  - `leaf_mold`
  - `septoria_leaf_spot`
  - `bacterial_spot`
  - `target_spot`
  - `mosaic_virus`
  - `yellow_leaf_curl_virus`
  - `cercospora_gray_leaf_spot`
  - `common_rust`
  - `northern_leaf_blight`

Regla:

- la combinación `(species, condition_group, condition_name)` debe existir en la taxonomía.

## 3.6 `health_state`

- tipo: enum
- valores permitidos:
  - `healthy`
  - `warning`

Regla:

- `healthy` solo es consistente con condition_group `healthy`
- `warning` solo es consistente con condition_group `disease`

## 3.7 `annotation_quality`

- tipo: enum
- valores permitidos:
  - `expert_validated`
  - `field_validated`
  - `weak_label`
  - `synthetic_label`

Recomendación para este baseline:

- `weak_label` (por provenir de PlantVillage sin validación de campo SIGCT-Rural)

## 3.8 `validation_source`

- tipo: enum
- valores permitidos:
  - `expert`
  - `field_observation`
  - `sensor_rule`
  - `historical_event`

Recomendación para este baseline:

- `historical_event` no aplica
- `field_observation` no aplica
- usar `expert` solo si se valida un subset manualmente

---

## 4. Reglas de validación del esquema

1. si `taxonomy_version != agriculture_v2_taxonomy_v1`, no es válido para baseline V2 inicial
2. si `species` no está en {tomato,potato,corn}, no es válido
3. si `(species, condition_name)` no existe en taxonomía, no es válido
4. si `condition_group=healthy` y `health_state!=healthy`, no es válido
5. si `condition_group=disease` y `health_state!=warning`, no es válido

---

## 5. Relación con manifests

Este esquema está referenciado por:

- [taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests/taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml)
- [split_manifest.agriculture_v2_split_v1.yaml](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests/split_manifest.agriculture_v2_split_v1.yaml)
- [baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests/baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml)

---

## 6. Conclusión

El esquema `agriculture_v2_label_schema_v1` queda materializado como contrato mínimo de etiquetas para iniciar benchmark científico de `Agriculture AI V2` sin ambigüedad taxonómica.
