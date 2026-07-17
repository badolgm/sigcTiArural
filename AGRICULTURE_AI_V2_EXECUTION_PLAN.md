# AGRICULTURE_AI_V2_EXECUTION_PLAN

## Fecha

2026-07-16

## Objetivo

Definir la ejecución completa de `Agriculture AI V2` para la primera ola multiclase de SIGCT-Rural, sin entrenar todavía y sin implementar pipelines.

Alcance confirmado:

- `21,160` imágenes RGB
- `16` clases
- especies:
  - tomate
  - papa
  - maíz

Este documento fija:

- estructura final del dataset
- manifests requeridos
- taxonomía definitiva
- split definitivo
- benchmark definitivo
- arquitecturas candidatas
- class balancing
- augmentations
- calibración
- uso de ROC, PR y F1
- notebooks exactos
- artefactos esperados
- criterios `GO / NO GO`
- definición del primer baseline oficial

---

## 1. Resumen ejecutivo

La ejecución correcta de `Agriculture AI V2` debe tratarse como un programa controlado de baseline agrícola multiclase, no como un entrenamiento directo sobre carpetas de `PlantVillage`.

Decisiones rectoras:

1. el dataset fuente oficial inicial será el subconjunto RGB auditado de `16` clases y `21,160` imágenes
2. la taxonomía definitiva V2 inicial queda cerrada para tomate, papa y maíz
3. el baseline oficial inicial se define sobre `EfficientNet-B0`
4. el benchmark oficial debe incluir:
   - `EfficientNet-B0`
   - `MobileNetV3-Large`
   - `ResNet50`
   - `ConvNeXt-Tiny`
5. la métrica principal de decisión será `macro F1`, no `accuracy`
6. el criterio de éxito no será “mejor score global”, sino:
   - trazabilidad
   - desempeño por clase
   - calibración
   - viabilidad edge futura

Diagnóstico de readiness:

- el proyecto está listo para planificar y ejecutar el baseline de laboratorio
- no está listo para declarar validez de campo sin dataset propio complementario

---

## 2. Estructura final del dataset

## 2.1 Fuente raíz aprobada

Dataset fuente:

- `PlantVillage-Dataset-master/raw/color`

## 2.2 Exclusiones obligatorias

No forman parte del baseline oficial:

1. `raw/grayscale`
2. `raw/segmented`
3. `generated_for_paper`
4. clases fuera de tomate, papa y maíz
5. `Tomato___Spider_mites Two-spotted_spider_mite`

## 2.3 Estructura lógica final recomendada

```text
data_lake/
  agriculture/
    images/
      raw/
        plantvillage/
          color_original/
      staged/
        agriculture_v2_initial/
      curated/
        agriculture_v2_initial/
          taxonomy_v1/
            tomato/
            potato/
            corn/
      evaluation_ready/
        agriculture_v2_initial/
          split_v1/
            train/
            validation/
            test/
```

## 2.4 Estructura semántica por muestra

Cada muestra debe tener metadatos mínimos:

1. `sample_id`
2. `source_dataset`
3. `source_path`
4. `context = agriculture`
5. `species`
6. `condition_group`
7. `condition_name`
8. `health_state`
9. `annotation_quality`
10. `taxonomy_version`
11. `label_schema_version`

## 2.5 Dataset oficial V2 inicial

Identificador recomendado:

`agriculture_images_tomato-potato-corn_taxonomy-v1_labels-v1_dataset-v1`

---

## 3. Dataset manifests requeridos

## 3.1 Manifest 1. Raw Source Manifest

Propósito:

- declarar la fuente de origen auditada

Contenido mínimo:

1. `dataset_id`
2. `dataset_version`
3. `source_root`
4. `source_variant = raw/color`
5. `audit_reference`
6. `total_images_detected`
7. `excluded_subsets`

## 3.2 Manifest 2. Curation Manifest

Propósito:

- declarar qué se conserva y qué se excluye

Contenido mínimo:

1. clases incluidas
2. clases excluidas
3. reglas de limpieza
4. reglas de deduplicación
5. reglas de descarte

## 3.3 Manifest 3. Taxonomy Binding Manifest

Propósito:

- enlazar carpetas originales con taxonomía EIARC V2

Contenido mínimo:

1. `original_class_name`
2. `species`
3. `condition_group`
4. `condition_name`
5. `health_state`
6. `semantic_code`

## 3.4 Manifest 4. Split Manifest

Propósito:

- fijar el split definitivo

Contenido mínimo:

1. `split_version`
2. `train_ratio`
3. `validation_ratio`
4. `test_ratio`
5. `stratification_rules`
6. `duplicate_control_rules`

## 3.5 Manifest 5. Baseline Experiment Manifest

Propósito:

- fijar el primer baseline oficial

Contenido mínimo:

1. arquitectura
2. dataset_version
3. taxonomy_version
4. label_schema_version
5. metrics_target
6. calibration_required
7. edge_export_assessment

---

## 4. Taxonomía definitiva

## 4.1 Regla general

La taxonomía definitiva V2 inicial queda cerrada en `taxonomy_version = agriculture_v2_taxonomy_v1`.

## 4.2 Estructura taxonómica

Cada clase debe definirse como:

- `context`
- `species_or_entity`
- `condition_group`
- `condition_name`
- `health_state`
- `semantic_code`

## 4.3 Taxonomía definitiva V2 inicial

### Tomate

1. `tomato__healthy`
2. `tomato__early_blight`
3. `tomato__late_blight`
4. `tomato__leaf_mold`
5. `tomato__septoria_leaf_spot`
6. `tomato__bacterial_spot`
7. `tomato__target_spot`
8. `tomato__mosaic_virus`
9. `tomato__yellow_leaf_curl_virus`

### Papa

10. `potato__healthy`
11. `potato__early_blight`
12. `potato__late_blight`

### Maíz

13. `corn__healthy`
14. `corn__cercospora_gray_leaf_spot`
15. `corn__common_rust`
16. `corn__northern_leaf_blight`

## 4.4 Condition group

Regla inicial:

- `healthy`
- `disease`

## 4.5 Health state

Regla inicial:

- `healthy`
- `warning`

## 4.6 Semantic code recomendado

Ejemplo:

- `agriculture.tomato.disease.early_blight`
- `agriculture.potato.healthy.healthy`
- `agriculture.corn.disease.common_rust`

---

## 5. Split definitivo

## 5.1 Split oficial

Se fija:

- `Train = 70%`
- `Validation = 15%`
- `Test = 15%`

## 5.2 Regla de construcción

Debe ser:

- estratificado por clase
- controlado contra duplicados y near-duplicates
- reproducible por `split_version`

## 5.3 Split version recomendado

- `agriculture_v2_split_v1`

## 5.4 Regla anti-fuga

Antes de materializar el split:

1. detectar duplicados exactos
2. detectar near-duplicates si es posible
3. evitar que variantes muy cercanas caigan en distintas particiones

## 5.5 Holdout adicional

Se debe reservar conceptualmente un `real_world_holdout_v1` para la siguiente fase, pero no forma parte del baseline actual basado solo en PlantVillage.

---

## 6. Benchmark definitivo

## 6.1 Benchmark oficial

El benchmark definitivo inicial de `Agriculture AI V2` debe incluir:

1. `EfficientNet-B0`
2. `MobileNetV3-Large`
3. `ResNet50`
4. `ConvNeXt-Tiny`

## 6.2 Orden de prioridad

1. `EfficientNet-B0`
2. `MobileNetV3-Large`
3. `ResNet50`
4. `ConvNeXt-Tiny`

## 6.3 Objetivo del benchmark

Comparar:

1. rendimiento multiclase
2. desempeño por clase
3. calibración
4. costo computacional
5. viabilidad edge

## 6.4 Regla comparativa

Todos los modelos deben compararse con:

- mismo dataset_version
- mismo split_version
- misma taxonomy_version
- mismo label_schema_version

---

## 7. Arquitecturas candidatas

## 7.1 Candidata principal

- `EfficientNet-B0`

## 7.2 Candidata secundaria

- `MobileNetV3-Large`

## 7.3 Candidata clásica de control

- `ResNet50`

## 7.4 Candidata de techo experimental

- `ConvNeXt-Tiny`

## 7.5 Dictamen de selección

### Baseline maestro

- `EfficientNet-B0`

### Baseline edge-first

- `MobileNetV3-Large`

---

## 8. Estrategia de class balancing

## 8.1 Riesgo confirmado

Clases más sensibles:

- `Potato___healthy` -> `152`
- `Tomato___Tomato_mosaic_virus` -> `373`
- `Tomato___Septoria_leaf_spot` -> `443`
- `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` -> `513`

## 8.2 Estrategia oficial

1. `weighted loss`
2. `class-balanced sampling`
3. augmentación dirigida a minoritarias
4. métricas obligatorias por clase

## 8.3 Estrategias prohibidas como primera línea

1. undersampling agresivo
2. oversampling ciego masivo
3. síntesis artificial sin validación

## 8.4 Regla de aprobación

No aprobar un baseline con buen score global si colapsa clases minoritarias.

---

## 9. Estrategia de augmentations

## 9.1 Política general

Augmentación moderada, científicamente conservadora.

## 9.2 Augmentations aprobadas

1. `horizontal flip`
2. rotación suave `-20° a +20°`
3. `random crop` moderado
4. brillo/contraste/saturación moderados
5. leve blur gaussiano
6. compresión JPEG controlada
7. pequeñas variaciones de escala

## 9.3 Augmentations condicionadas

1. sombra leve
2. ruido de sensor
3. padding contextual controlado

## 9.4 Augmentations prohibidas

1. rotaciones extremas
2. color jitter agresivo
3. `mixup`
4. `cutmix`
5. artefactos irreales

## 9.5 Regla por split

- `train`: sí
- `validation`: no
- `test`: no

---

## 10. Estrategia de calibración

## 10.1 Objetivo

Evitar probabilidades sobreconfiadas en clases desbalanceadas.

## 10.2 Validación obligatoria

Todo modelo benchmark debe ser evaluado con:

1. `Calibration Curve`
2. `Expected Calibration Error`
3. análisis de confidence por clase

## 10.3 Reglas de diseño

1. calibrar después de seleccionar el mejor checkpoint por `validation`
2. no usar calibración para ocultar un modelo pobre
3. mantener evaluación pre y post calibración

## 10.4 Decisión operativa

Un modelo puede ser el mejor en `macro F1` pero no ser promovible si su calibración es mala.

---

## 11. Estrategia ROC, PR y F1

## 11.1 Métrica primaria oficial

- `Macro F1`

## 11.2 Métricas secundarias obligatorias

1. `Balanced Accuracy`
2. `Recall por clase`
3. `Precision por clase`
4. `Confusion Matrix`
5. `Weighted F1`

## 11.3 Uso de ROC

ROC se usará como:

- `one-vs-rest ROC` por clase

No debe ser la métrica principal de decisión.

## 11.4 Uso de PR Curve

PR Curve se usará de forma obligatoria para:

- clases minoritarias
- análisis de sensibilidad en clases raras

## 11.5 Regla científica

Si hay conflicto entre `accuracy` y `macro F1`, prevalece `macro F1`.

Si hay conflicto entre buen `macro F1` y mala calibración, el modelo no pasa directamente a baseline oficial promovible.

---

## 12. Notebooks exactos

## 12.1 Secuencia oficial

1. `00_agriculture_v2_program_bootstrap`
2. `01_agriculture_v2_dataset_discovery`
3. `02_agriculture_v2_dataset_curation_and_manifest`
4. `03_agriculture_v2_taxonomy_binding`
5. `04_agriculture_v2_split_design`
6. `05_agriculture_v2_eda`
7. `06_agriculture_v2_augmentation_policy`
8. `07_agriculture_v2_baseline_efficientnet_b0`
9. `08_agriculture_v2_baseline_mobilenetv3`
10. `09_agriculture_v2_baseline_resnet50`
11. `10_agriculture_v2_baseline_convnext_tiny`
12. `11_agriculture_v2_model_comparison`
13. `12_agriculture_v2_calibration_and_confidence`
14. `13_agriculture_v2_error_analysis`
15. `14_agriculture_v2_edge_assessment`
16. `15_agriculture_v2_real_world_validation_plan`

## 12.2 Regla de notebook

Cada notebook debe responder una pregunta científica única y dejar artefactos reproducibles.

---

## 13. Artefactos esperados

## 13.1 Artefactos de datos

1. raw source manifest
2. curation manifest
3. taxonomy binding manifest
4. split manifest
5. dataset quality report

## 13.2 Artefactos científicos

1. benchmark report
2. calibration report
3. confusion matrices
4. ROC one-vs-rest report
5. PR curves report
6. error analysis report

## 13.3 Artefactos de modelo

1. model cards
2. training experiment manifest
3. edge viability report
4. baseline decision report

## 13.4 Artefactos de continuidad

1. notebook inventory
2. lessons learned
3. recommendation for next phase

---

## 14. Criterios GO / NO GO

## 14.1 GO para ejecutar benchmark

Se autoriza ejecución del benchmark solo si:

1. el dataset quedó curado y manifestado
2. la taxonomía V2 inicial está cerrada
3. el split `v1` está materializado y versionado
4. existen reglas de balancing y augmentation cerradas
5. las métricas de decisión están fijadas

## 14.2 NO GO para benchmark

No se debe ejecutar si:

1. el split aún no controla duplicados
2. la taxonomía no está congelada
3. las clases incluidas siguen abiertas a discusión
4. no existe trazabilidad de manifest

## 14.3 GO para declarar baseline oficial

Un modelo puede declararse primer baseline oficial solo si:

1. supera a las otras arquitecturas en evaluación global o queda dentro de margen aceptable con mejor perfil operacional
2. mantiene `macro F1` competitivo
3. mantiene recall razonable en clases minoritarias
4. muestra calibración aceptable
5. deja trazabilidad completa

## 14.4 NO GO para baseline oficial

No se debe promover un modelo si:

1. depende de `accuracy` inflada
2. colapsa clases minoritarias
3. tiene mala calibración
4. no deja artefactos reproducibles

---

## 15. Definición del primer baseline oficial

## 15.1 Definición formal

El primer baseline oficial de `Agriculture AI V2` se define como:

- contexto: `agriculture`
- modalidad: `computer_vision`
- dataset: `agriculture_images_tomato-potato-corn_taxonomy-v1_labels-v1_dataset-v1`
- split: `agriculture_v2_split_v1`
- arquitectura principal: `EfficientNet-B0`
- métrica principal: `Macro F1`

## 15.2 Condiciones de existencia

Este baseline debe existir acompañado de:

1. model card
2. benchmark report
3. calibration report
4. confusion matrix report
5. baseline decision report

## 15.3 Baseline edge asociado

Debe definirse además un baseline complementario edge:

- arquitectura: `MobileNetV3-Large`
- objetivo: exportabilidad y evaluación de costo de inferencia

---

## 16. Programa de ejecución recomendado

## Fase 1. Dataset finalization

1. congelar subconjunto de `16` clases
2. generar manifests
3. normalizar taxonomía

## Fase 2. Split and governance

1. detectar duplicados
2. construir `split_v1`
3. congelar reglas de balancing y augmentation

## Fase 3. Benchmark core

1. `EfficientNet-B0`
2. `MobileNetV3-Large`
3. `ResNet50`
4. `ConvNeXt-Tiny`

## Fase 4. Scientific evaluation

1. macro F1
2. balanced accuracy
3. recall por clase
4. calibración
5. error analysis

## Fase 5. Baseline decision

1. decidir baseline maestro
2. decidir baseline edge
3. documentar limitaciones

## Fase 6. Next step

1. preparar validación de campo
2. diseñar dataset agrícola propio

---

## 17. Respuestas directas solicitadas

## 1. Estructura final del dataset

- `raw/color` filtrado a `16` clases
- gobernado por manifests
- promovido a `curated` y luego `evaluation_ready`

## 2. Dataset manifests requeridos

- raw source manifest
- curation manifest
- taxonomy binding manifest
- split manifest
- baseline experiment manifest

## 3. Taxonomía definitiva

- `agriculture_v2_taxonomy_v1`
- `16` clases de tomate, papa y maíz

## 4. Split definitivo

- `70/15/15`
- estratificado
- anti-fuga

## 5. Benchmark definitivo

- `EfficientNet-B0`
- `MobileNetV3-Large`
- `ResNet50`
- `ConvNeXt-Tiny`

## 6. Arquitecturas candidatas

- principal: `EfficientNet-B0`
- secundaria: `MobileNetV3-Large`
- control: `ResNet50`
- techo experimental: `ConvNeXt-Tiny`

## 7. Estrategia de class balancing

- weighted loss
- class-balanced sampling
- augmentación dirigida

## 8. Estrategia de augmentations

- moderada y conservadora
- sin augmentación en validation/test

## 9. Estrategia de calibración

- calibration curve
- ECE
- evaluación pre/post calibración

## 10. Estrategia ROC, PR y F1

- macro F1 como métrica principal
- ROC one-vs-rest
- PR obligatorio en clases minoritarias

## 11. Notebooks exactos

- `00` a `15` según secuencia oficial del plan

## 12. Artefactos esperados

- manifests
- reportes de benchmark
- matrices y curvas
- model cards
- baseline decision report

## 13. Criterios GO / NO GO

- GO solo con dataset, taxonomía, split y métricas congeladas
- NO GO si hay fuga, taxonomía abierta o trazabilidad incompleta

## 14. Definición del primer baseline oficial

- `EfficientNet-B0` sobre dataset V2 inicial gobernado y split `v1`

---

## 18. Conclusión final

`Agriculture AI V2` ya tiene suficiente base documental y científica para pasar a una fase de ejecución controlada de baseline. El orden correcto no es “entrenar de inmediato”, sino:

1. congelar dataset y manifests
2. cerrar taxonomía y split
3. ejecutar benchmark oficial
4. evaluar calibración y clases minoritarias
5. promover el primer baseline oficial

Diagnóstico final:

- el baseline oficial debe arrancar con `EfficientNet-B0`
- el baseline edge debe apoyarse en `MobileNetV3-Large`
- la siguiente frontera, después del baseline de laboratorio, debe ser validación con datos reales de campo
