# AGRICULTURE_AI_V2_SPLIT_SPECIFICATION

## Fecha

2026-07-16

## Objetivo

Materializar el diseño de partición oficial del baseline `Agriculture AI V2` inicial:

- `agriculture_v2_split_v1`

Esta especificación define ratios, reglas de estratificación, anti-fuga, control de duplicados y control de near-duplicates.

No materializa aún la lista final de samples por partición; solo fija el diseño gobernado.

---

## 1. Identidad del split

- split_version: `agriculture_v2_split_v1`
- dataset_version: `agriculture_images_tomato-potato-corn_taxonomy-v1_labels-v1_dataset-v1`
- taxonomy_version: `agriculture_v2_taxonomy_v1`
- label_schema_version: `agriculture_v2_label_schema_v1`

---

## 2. Ratios oficiales

- Train: `70%`
- Validation: `15%`
- Test: `15%`

---

## 3. Regla de estratificación

## 3.1 Estratificación primaria

Estratificar por:

- `canonical_class_id`

Objetivo:

- preservar proporciones por clase

## 3.2 Estratificación secundaria recomendada

Si se agregan metadatos a futuro:

- estratificar también por `species`

---

## 4. Anti-fuga (leakage) y control de duplicados

## 4.1 Principio

No se permite que la misma imagen, o imágenes near-duplicate, existan simultáneamente en particiones diferentes.

## 4.2 Control de duplicados exactos

Antes del split:

1. calcular hash por archivo
2. agrupar duplicados exactos
3. conservar un representante o agruparlos como unidad de split

Regla:

- un grupo de duplicados no puede dividirse entre particiones

## 4.3 Control de near-duplicates

Antes del split:

1. calcular `perceptual hash` (pHash) por imagen
2. agrupar imágenes con distancia baja (umbral definido en el framework de calidad)
3. mantener el grupo entero dentro de una sola partición

Regla:

- un grupo de near-duplicates no puede dividirse entre particiones

---

## 5. Reproducibilidad

## 5.1 Random seed oficial

- `42`

## 5.2 Algoritmo recomendado

- `stratified_group_split`

Donde:

- el grupo es el cluster de duplicados/near-duplicates
- la estratificación es por clase

---

## 6. Validaciones obligatorias post-split

## 6.1 Validación de distribución

1. conteo por clase por partición
2. porcentaje por clase por partición
3. verificación de que no se pierden clases

## 6.2 Validación de fuga

1. verificar que no hay hashes repetidos entre particiones
2. verificar que no hay near-duplicates cruzados entre particiones si se ejecutó pHash

## 6.3 Validación mínima por clase

Si una clase es extremadamente pequeña (ej. `Potato___healthy`):

- reportar explícitamente riesgos de estabilidad de métricas en validation/test
- no ajustar el split para ocultar el problema; se debe registrar como limitación del dataset

---

## 7. Entregables esperados del split

Al materializarlo, debe producir:

- `train.csv`
- `validation.csv`
- `test.csv`

Campos mínimos por fila:

- `sample_id`
- `canonical_class_id`
- `original_class_name`
- `source_path`
- `taxonomy_version`
- `label_schema_version`
- `split_version`

---

## 8. Conclusión

El split `agriculture_v2_split_v1` queda definido como un split estratificado por clase con control anti-fuga por duplicados y near-duplicates, listo para ser materializado en la fase de benchmark.
