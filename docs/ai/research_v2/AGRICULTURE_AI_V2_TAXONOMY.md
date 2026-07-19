# AGRICULTURE_AI_V2_TAXONOMY

## Fecha

2026-07-16

## Objetivo

Materializar la taxonomía canónica del baseline `Agriculture AI V2` inicial, denominada:

- `agriculture_v2_taxonomy_v1`

Esta taxonomía enlaza el subconjunto `PlantVillage raw/color` (16 clases) con clases canónicas EIARC V2, preservando trazabilidad y evitando dependencia de `class_index`.

---

## 1. Identidad de la taxonomía

- taxonomy_version: `agriculture_v2_taxonomy_v1`
- context: `agriculture`
- modality: `computer_vision`
- scope: `tomate`, `papa`, `maíz`
- classes: `16`

---

## 2. Modelo conceptual

Cada entrada taxonómica se define por:

- `context`
- `species`
- `condition_group`
- `condition_name`
- `health_state`
- `semantic_code`

Reglas de la V1:

- `condition_group` ∈ {`healthy`, `disease`}
- `health_state` ∈ {`healthy`, `warning`}
- `semantic_code` se construye como:
  - `agriculture.{species}.{condition_group}.{condition_name}`

---

## 3. Taxonomía canónica (16 clases)

| canonical_class_id | species | condition_group | condition_name | health_state | semantic_code |
|---|---|---|---|---|---|
| tomato__healthy | tomato | healthy | healthy | healthy | agriculture.tomato.healthy.healthy |
| tomato__early_blight | tomato | disease | early_blight | warning | agriculture.tomato.disease.early_blight |
| tomato__late_blight | tomato | disease | late_blight | warning | agriculture.tomato.disease.late_blight |
| tomato__leaf_mold | tomato | disease | leaf_mold | warning | agriculture.tomato.disease.leaf_mold |
| tomato__septoria_leaf_spot | tomato | disease | septoria_leaf_spot | warning | agriculture.tomato.disease.septoria_leaf_spot |
| tomato__bacterial_spot | tomato | disease | bacterial_spot | warning | agriculture.tomato.disease.bacterial_spot |
| tomato__target_spot | tomato | disease | target_spot | warning | agriculture.tomato.disease.target_spot |
| tomato__mosaic_virus | tomato | disease | mosaic_virus | warning | agriculture.tomato.disease.mosaic_virus |
| tomato__yellow_leaf_curl_virus | tomato | disease | yellow_leaf_curl_virus | warning | agriculture.tomato.disease.yellow_leaf_curl_virus |
| potato__healthy | potato | healthy | healthy | healthy | agriculture.potato.healthy.healthy |
| potato__early_blight | potato | disease | early_blight | warning | agriculture.potato.disease.early_blight |
| potato__late_blight | potato | disease | late_blight | warning | agriculture.potato.disease.late_blight |
| corn__healthy | corn | healthy | healthy | healthy | agriculture.corn.healthy.healthy |
| corn__cercospora_gray_leaf_spot | corn | disease | cercospora_gray_leaf_spot | warning | agriculture.corn.disease.cercospora_gray_leaf_spot |
| corn__common_rust | corn | disease | common_rust | warning | agriculture.corn.disease.common_rust |
| corn__northern_leaf_blight | corn | disease | northern_leaf_blight | warning | agriculture.corn.disease.northern_leaf_blight |

---

## 4. Notas de trazabilidad

## 4.1 Relación con PlantVillage

La relación exacta entre nombres de carpeta PlantVillage y `canonical_class_id` queda fijada en:

- [taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/ai/manifests/taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml)

## 4.2 Regla de compatibilidad

Un modelo entrenado bajo esta taxonomía debe declarar explícitamente:

- `taxonomy_version_supported = agriculture_v2_taxonomy_v1`

## 4.3 Regla de evolución

La V1 es cerrada. Cualquier cambio de clases o renombrado requiere:

- `agriculture_v2_taxonomy_v2`

---

## 5. Conclusión

La taxonomía `agriculture_v2_taxonomy_v1` queda materializada y lista para:

- binding de etiquetas
- split versionado
- benchmark científico controlado
