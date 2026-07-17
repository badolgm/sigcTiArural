# AGRICULTURE_AI_V2_NOTEBOOK_ROADMAP

## Fecha

2026-07-16

## Objetivo

Inventariar y fijar el roadmap de notebooks científicos requeridos para ejecutar `Agriculture AI V2` de forma controlada, reproducible y gobernada.

Este documento no crea notebooks ni ejecuta entrenamiento. Define el contrato de existencia, propósito, inputs y outputs esperados.

---

## 1. Principios del programa de notebooks

1. un notebook = una pregunta científica
2. todo notebook produce artefactos reproducibles
3. ningún notebook depende de `class_index` como semántica
4. todos los notebooks declaran:
   - `dataset_version`
   - `taxonomy_version`
   - `label_schema_version`
   - `split_version`

---

## 2. Lista oficial de notebooks (00–15)

## 00_agriculture_v2_program_bootstrap

- propósito: fijar constantes del programa (versiones, rutas, manifests)
- inputs:
  - manifests en `docs/ai/manifests/`
  - `AGRICULTURE_AI_V2_EXECUTION_PLAN.md`
- outputs:
  - `program_config.json`
  - `run_context.md`

## 01_agriculture_v2_dataset_discovery

- propósito: re-validar estructura de carpetas y conteos contra manifests (sin entrenar)
- inputs:
  - `raw_source_manifest`
  - dataset path externo
- outputs:
  - `dataset_discovery_report.md`
  - `per_class_counts.csv`

## 02_agriculture_v2_dataset_curation_and_manifest

- propósito: aplicar reglas de curación (inventario + descartes + duplicados) y producir reportes
- inputs:
  - `curation_manifest`
  - `data_quality_framework`
- outputs:
  - `data_quality_report.md`
  - `invalid_files.csv`
  - `duplicates_exact.csv`
  - `duplicates_near.csv`

## 03_agriculture_v2_taxonomy_binding

- propósito: materializar labels canónicos por muestra (binding PlantVillage -> EIARC)
- inputs:
  - `taxonomy_binding_manifest`
  - `AGRICULTURE_AI_V2_TAXONOMY.md`
  - `AGRICULTURE_AI_V2_LABEL_SCHEMA.md`
- outputs:
  - `labels_v1.csv`
  - `binding_report.md`

## 04_agriculture_v2_split_design

- propósito: materializar `train/validation/test` con reglas anti-fuga
- inputs:
  - `split_manifest`
  - `AGRICULTURE_AI_V2_SPLIT_SPECIFICATION.md`
  - `labels_v1.csv`
- outputs:
  - `train.csv`
  - `validation.csv`
  - `test.csv`
  - `split_report.md`

## 05_agriculture_v2_eda

- propósito: EDA mínimo orientado a riesgos (desbalance, clases minoritarias, muestras anómalas)
- inputs:
  - `labels_v1.csv`
  - `train/validation/test`
- outputs:
  - `eda_report.md`
  - `class_distribution_plots/`

## 06_agriculture_v2_augmentation_policy

- propósito: validar política de augmentation (conservadora) y registrar decisiones
- inputs:
  - `AGRICULTURE_AI_V2_EXECUTION_PLAN.md`
- outputs:
  - `augmentation_policy.json`
  - `augmentation_risk_notes.md`

## 07_agriculture_v2_baseline_efficientnet_b0

- propósito: entrenar y evaluar `EfficientNet-B0` bajo baseline experiment manifest
- inputs:
  - `baseline_experiment_manifest`
  - split materializado
- outputs:
  - `model_artifacts/efficientnet_b0/`
  - `metrics_efficientnet_b0.json`
  - `confusion_matrix_efficientnet_b0.csv`

## 08_agriculture_v2_baseline_mobilenetv3

- propósito: entrenar y evaluar `MobileNetV3-Large` (edge candidate)
- outputs:
  - `model_artifacts/mobilenetv3_large/`
  - `metrics_mobilenetv3_large.json`

## 09_agriculture_v2_baseline_resnet50

- propósito: entrenar y evaluar `ResNet50` (control)
- outputs:
  - `model_artifacts/resnet50/`
  - `metrics_resnet50.json`

## 10_agriculture_v2_baseline_convnext_tiny

- propósito: entrenar y evaluar `ConvNeXt-Tiny` (techo experimental)
- outputs:
  - `model_artifacts/convnext_tiny/`
  - `metrics_convnext_tiny.json`

## 11_agriculture_v2_model_comparison

- propósito: comparar modelos bajo reglas de comparabilidad estricta
- inputs:
  - métricas de 07–10
- outputs:
  - `benchmark_report.md`
  - `comparison_table.csv`

## 12_agriculture_v2_calibration_and_confidence

- propósito: analizar calibración, ECE y riesgo de sobreconfianza por clase
- outputs:
  - `calibration_report.md`
  - `calibration_curves/`

## 13_agriculture_v2_error_analysis

- propósito: análisis de errores, clases confundibles, top confusions, revisión cualitativa
- outputs:
  - `error_analysis_report.md`
  - `hard_cases/`

## 14_agriculture_v2_edge_assessment

- propósito: exportabilidad TFLite y estimación de costo de inferencia
- outputs:
  - `tflite_exports/`
  - `edge_viability_report.md`

## 15_agriculture_v2_real_world_validation_plan

- propósito: diseñar validación real en campo (holdout real, protocolo de captura)
- outputs:
  - `real_world_validation_plan.md`
  - `field_capture_protocol.md`

---

## 3. Artefactos mínimos del programa

Al finalizar el benchmark:

1. `benchmark_report.md`
2. `calibration_report.md`
3. `error_analysis_report.md`
4. `model_cards/`
5. `tflite_exports/` (si aplica)
6. `baseline_decision.md`

---

## 4. Conclusión

El roadmap de notebooks queda fijado y permite ejecutar `Agriculture AI V2` sin ambigüedad operacional, con trazabilidad por versiones y con separación clara entre:

- curación
- binding taxonómico
- split anti-fuga
- benchmark comparativo
- calibración
- evaluación edge
- plan de validación real
