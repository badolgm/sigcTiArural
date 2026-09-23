# SIGCTiArural — PLAN DE EJECUCIÓN DATASET V2 (Operativo)

**Documento:** SIGCTIARURAL_DATASET_V2_EXECUTION_PLAN
**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Tipo:** Operativización del `SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` — plan ejecutable, no diseño.
**Regla:** NO IMPLEMENTAR · NO GENERAR CÓDIGO · NO MODIFICAR DOCUMENTOS EXISTENTES · SOLO OPERATIVIZAR. Este documento NO genera código: especifica exactamente qué ejecutar, para que la fase de implementación sea mecánica.

**Coherencia:** todos los identificadores (IDs de dataset, taxonomy_v1, label_schema_v1, split_v1, experiment_id) están verificados contra los artefactos existentes: `docs/ai/manifests/` (5 YAML) y `docs/ai/research_v2/` (execution plan, split spec, label schema, benchmark readiness).

**Actualización 2026-09-23 (RECOVERY CONSOLIDATION):** baseline ajustado al estado físico real = **22.488/16/3** (origen `D:\RespaldoData\PlantVillage-Dataset`); delta +1.328 íntegro en `Tomato___Septoria_leaf_spot` (1.771). Ver `SIGCTIARURAL_DATASET_V2_RECOVERY_CONSOLIDATION.md`.

---

## 1. ¿Cuál es exactamente el dataset bootstrap?

**Identidad canónica:** `agriculture_images_tomato-potato-corn_taxonomy-v1_labels-v1_dataset-v1`
(=`agriculture_images_tomato-potato-corn` versión `v1` — verificado en manifiestos y en `AI_DATASET_STRATEGY_V2.md §4.4`).

**Contenido exacto (cerrado, sin reinterpretación):**
- **22.488 imágenes RGB** (solo `raw/color`), tamaño original PlantVillage, sin escalar a 224 en el dataset (el resize es del pipeline).
- **16 clases** de la `agriculture_v2_taxonomy_v1`:
  - Tomato (9): healthy, early_blight, late_blight, leaf_mold, septoria_leaf_spot, bacterial_spot, target_spot, mosaic_virus, yellow_leaf_curl_virus.
  - Potato (3): healthy, early_blight, late_blight.
  - Corn (4): healthy, cercospora_gray_leaf_spot, common_rust, northern_leaf_blight.
- **3 especies:** tomato, potato, corn.
- Ratio de desbalance global: **35.24×** (min `Potato___healthy` = 152; max `Tomato___Tomato_Yellow_Leaf_Curl_Virus` = 5.357).

**Exclusiones obligatorias:** `raw/grayscale`, `raw/segmented`, `generated_for_paper`, clase Spider-mite (`Tomato___Spider_mites Two-spotted_spider_mite`), y todo lo no listado en las 16 clases.

**Origen físico:** subset del directorio auditado `PlantVillage-Dataset-master/raw/color` (máquina anterior `Devbadolgm`). **Actualizado 2026-09-23 (RECOVERY CONSOLIDATION):** el origen fue **recuperado en `D:\RespaldoData\PlantVillage-Dataset`** (repo oficial spMohanty, `raw/color` = 54.305 archivos / 38 clases, ~0.79 GB). El subconjunto V2 de 16 clases suma **22.488**; validar contra el `raw_source_manifest` antes de todo (el manifiesto canónico aún declara `expected_images: 21160` — pendiente de actualización gobernada).

**Naturaleza:** bootstrap para benchmark de laboratorio controlado. NO declara validez de campo (invariante de honestidad).

---

## 2. ¿Cuál es la estructura exacta de directorios?

```
data/
└── datasets/
    └── agriculture_images_tomato-potato-corn/
        ├── v1/
        │   ├── RAW/                          # copia inmutable del origen (solo raw/color, 16 clases)
        │   │   ├── tomato__healthy/
        │   │   ├── tomato__early_blight/
        │   │   ├── ...                       # 16 carpetas clase
        │   │   └── corn__northern_leaf_blight/
        │   ├── curated/                      # datasets finales por split (archivos físicos listos para train)
        │   │   ├── train/   (70%)
        │   │   ├── validation/ (15%)
        │   │   └── test/    (15%)
        │   ├── split_lists/                  # CSVs de membresía (verificado: outputs esperados)
        │   │   ├── train.csv                 # sample_id, partition, canonical_class_id
        │   │   ├── validation.csv
        │   │   └── test.csv
        │   ├── labels/
        │   │   └── labels_v1.csv             # tabla maestra de etiquetas (label schema completo)
        │   ├── holdout/
        │   │   └── real_world_holdout_v1/    # INTOCABLE, fuera de train/val/test (ver §7)
        │   └── manifests/                    # copia de los YAML canónicos que aplican a este dataset
        │       ├── raw_source_manifest.agriculture_v2_dataset_v1.yaml
        │       ├── curation_manifest.agriculture_v2_dataset_v1.yaml
        │       ├── taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml
        │       ├── split_manifest.agriculture_v2_split_v1.yaml
        │       └── baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml
        └── CHECKSUMS.sha256                 # hashes de carpeta → representación binaria versionable
```

**Reglas de estructura:**
1. `RAW/` es inmutable tras la primera verificación (checksum).
2. `curated/` se genera UNA vez desde el split_v1; no se regenera para "probar otra configuración".
3. `holdout/` nunca se copia a otra partición.
4. Los manifiestos viven canonicamente en `docs/ai/manifests/`; la copia en `v1/manifests/` es referencia operativa (checksum del YAML igual al canónico).

---

## 3. ¿Qué manifiestos necesitamos?

**Ya existen los 5 canónicos** (`docs/ai/manifests/`). NO crear nuevos; usar los existentes y verificar su integridad:

| Manifiesto | Archivo verificado | Rol operativo |
|---|---|---|
| raw_source | `raw_source_manifest.agriculture_v2_dataset_v1.yaml` | Declara origen exacto del raw y su estado (auditado) |
| curation | `curation_manifest.agriculture_v2_dataset_v1.yaml` | Define exclusiones y reglas de limpieza |
| taxonomy_binding | `taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml` | Conecta clases → taxonomy_v1 |
| split | `split_manifest.agriculture_v2_split_v1.yaml` | Ratios 70/15/15, seed 42, anti-fuga, `stratified_group_split` |
| baseline_experiment | `baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml` | 4 modelos, macro-F1, ECE, edge policy, artefactos esperados |

**Único instante de nuevos manifests:** cuando se genere `split_v1` materializado (train/validation/test.csv), el `split_manifest` se actualiza con el resumen de conteos por clase/partición (versionando el materializado, no el diseño). Regla: el materializado no cambia el `split_version`; un cambio de particiones sería `split_v2` con justificación científica.

---

## 4. ¿Qué archivos metadata necesitamos?

| Archivo | Contenido | Rol |
|---|---|---|
| `labels_v1.csv` | `sample_id`, `taxonomy_version`, `species`, `condition_group`, `condition_name`, `health_state`, `annotation_quality`, `validation_source` | Tabla maestra de etiquetas (ver §5) |
| `split_lists/{train,validation,test}.csv` | `sample_id`, `partition`, `canonical_class_id` | Membresía por partición (output esperado del split) |
| `dataset_card.md` | Resumen: identidad, 22.488/16/3, conteos por clase, ratio 35.24×, exclusiones, checksums | Ficha científica legible (tipo model card para datos) |
| `CHECKSUMS.sha256` | Hash por archivo/carpeta v1 + hash de partículas curated | Trazabilidad de integridad |
| `split_report.md` | Conteos por clase × partición, resultados de dedup (n duplicados exactos, n grupos pHash), verificación de anti-fuga | Transparencia del split |
| `environment_manifest.yml` (si aplica en fase ejecución) | Versiones TF/Keras, seed, hardware, cuda | Reproducibilidad (diseñar; materializar solo si la ejecución lo requiere) |

---

## 5. ¿Cómo será el label schema?

**Usar el canónico `agriculture_v2_label_schema_v1`** (`AGRICULTURE_AI_V2_LABEL_SCHEMA.md`) — NO crear otro.

Campos (8): `sample_id` (string único), `taxonomy_version` (=`agriculture_v2_taxonomy_v1`), `species` (enum: tomato/potato/corn), `condition_group` (enum: healthy/disease), `condition_name` (enum cerrado por taxonomía — las 16), `health_state` (healthy/warning), `annotation_quality` (por muestra), `validation_source` (por muestra).

**Regla de ejecución:** el `labels_v1.csv` se deriva de la taxonomía + lista de archivos recuperados; las etiquetas fuente se toman tal cual del dataset auditado (annotation_quality y validation_source = `source_dataset_audited`), salvo las 4 clases minoritarias que requieren doble revisión (potato healthy, tomato mosaic, corn gray leaf spot, tomato leaf mold; septoria 1.771 ya no es minoritaria tras consolidación) → en esas, `validation_source=double_reviewed`.

---

## 6. ¿Cómo se realizará el split_v1?

**Algoritmo sancionado por el `split_manifest.agriculture_v2_split_v1.yaml`:**
1. **Input:** 22.488 samples con `canonical_class_id`, tras dedup.
2. **Dedup exactos** (eliminar hash idénticos) antes de particionar.
3. **Near-duplicate (pHash):** detectar grupos near-dup; el grupo completo va a UNA partición (anti-fuga).
4. **Estratificación primaria:** por `canonical_class_id` (preserva proporciones por clase).
5. **Ratios:** train 70% / validation 15% / test 15%.
6. **Seed:** 42. **Algoritmo:** `stratified_group_split`.
7. **No mezclar** variantes grayscale/segmented (ya excluidas por curation).

**Gates de calidad (del manifiesto):**
- No queda clase ausente en ninguna partición (excepto ciases extremadamente pequeñas, reportado explícitamente).
- Reporte de conteos por clase × partición en `split_report.md`.
- **Bloqueo** si se detecta fuga (duplicados entre particiones).

---

## 7. ¿Cómo se conservará el holdout?

**`real_world_holdout_v1`** (diseñado en Execution Plan §9.3 y split spec — regla anti-fuga):
- **Ubicación:** `data/datasets/agriculture_images_tomato-potato-corn/v1/holdout/real_world_holdout_v1/`.
- **Naturaleza:** datos de campo reales **propios**, ajenos al PlantVillage — sirven para validar si el bootstrap generaliza.
- **Regla de intocabilidad:** jamás se copia dentro de train/validation/test; jamás se usa en entrenamiento ni en hyper-parámetro selection; solo en evaluación final externa.
- **Acceso:** solo el dueño científico (Bernardo / gobernanza) puede mover archivos dentro; cada acceso se registra.
- **Estado hoy:** carpeta vacía (reservada) — se puebla con las primeras capturas de campo del programa propio.

---

## 8. ¿Cómo se realizará el benchmark?

**Definido por `baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml`** (experiment_id `agriculture_v2_baseline_v1`):

| Modelo | Rol | Verificación requerida |
|---|---|---|
| EfficientNet-B0 | `baseline_master_candidate` | Entrenar + evaluar |
| MobileNetV3-Large | `baseline_edge_candidate` | Entrenar + evaluar + **exportar a TFLite float16/int8** |
| ResNet50 | `classic_control` | Entrenar + evaluar |
| ConvNeXt-Tiny | `experimental_ceiling` | Entrenar + evaluar |

**Política de entrenamiento (del manifiesto):** 224×224, transfer learning (backbones congelados/imagenet según spec pipeline), batch 32, class balancing = weighted_loss + class_balanced_sampling + minority_augmented_sampling. NO: undersampling ciego, oversampling ciego, mixup/cutmix/rotaciones extremas agresivas como primera línea.
**Hardware objetivo (diseño):** GPU RTX 3060/4060/4070 (1–10 h/modelo) o CPU 8–40h+ (min 32 GB RAM).
**Comparabilidad:** solo entre modelos con el mismo dataset/split/taxonomía (`agriculture_v2_split_v1`).

---

## 9. ¿Cómo se evaluará MobileNetV2?

**Contexto:** NO está en el benchmark oficial (es el heredado colapsado). Su papel en este plan es evaluativo de control:

1. **Congelar el modelo actual** `plant_disease_mbv2.h5` (sin reentrenar).
2. **Evaluarlo sobre el test set del split_v1** (22.488 auditada → test 15%) con las mismas métricas del benchmark.
3. **Reporte de brecha:** comparar su macro-F1/ECE frente a las 4 arquitecturas — sustenta la decisión de retirar o conservar el binario.
4. **Documentar su colapso** (class_1 inalcanzable, confianza degenerada) como baseline negativo histórico.
5. **No tocar** path de inferencia ni archivo `.h5` (regla suprema: se documenta, no se corrige).

**Entregable:** sección "MobileNetV2 (control negativo)" en el `benchmark_report.md`.

---

## 10. ¿Cómo se evaluará MobileNetV3?

**Rol:** `baseline_edge_candidate` — evaluación doble (precisión + embarcabilidad):
1. **Metas de precisión:** iguales al benchmark (macro-F1 primaria, ECE, curvas ROC/PR/calibración).
2. **Edge assessment** (notebook `14_edge_assessment` del roadmap):
   - Exportar a **TFLite float16** e **int8** (política del manifiesto).
   - Medir **latencia** y **tamaño** del modelo cuantizado.
   - Validar **paridad de precisión** cuantizado vs float (pérdida de macro-F1 cuantizada < umbral a definir en ejecución).
   - Documentar viabilidad en **BBB** (objetivo: inferencia compacta, NO entrenamiento) vs demostrar si es viable en ESP32 (esperado NO por RAM — mantener reglas en el collar).
3. **Decisión:** es el candidato edge si cumple gates; de lo contrario se documenta el gap y se remite al plan UBTN (post-U7).

---

## 11. ¿Cómo se registrarán métricas?

**Estructura de registro (design, implementación futura que ejecute el plan):**
- **Ubicación:** `data/datasets/agriculture_images_tomato-potato-corn/v1/results/` (o `reports/benchmark/` según convención).
- **Formato maestro:** `metrics/experiment_metrics.csv` — una fila por (experiment_id, model, split_version) con todas las métricas.
- **Traza canónica:** experiment_id (`agriculture_v2_baseline_v1`) + dataset_version + split_version + taxonomy_version + seed → garantiza comparación válida (regla MLOps §19).
- **Identidad de artefacto:** cada modelo guardado con nombre `{family}_{metric}_{split_version}_{seed}.h5` (ej. `efficientnet_b0_{macroF1}_{split_v1}_42.h5`).
- **Tarjetas:** `model_cards/` por modelo (verificado como output esperado en el manifiesto), incluida clase `real_world_holdout` no usada en entrenamiento.

---

## 12. ¿Cómo se registrará macro-F1?

**macró-F1 = métrica primaria** (del manifiesto `evaluation_policy.primary_metric: macro_f1`):
```
macro_f1 = mean( F1_clase over 16 clases )   # F1 = 2·precision·recall/(precision+recall), promedio no ponderado
```
**Registro obligatorio por modelo:**
1. `macro_f1` global (reportada en el CSV maestro y en la cabecera del benchmark_report).
2. `per_class_f1` para las 16 clases (para diagnóstico de minoritarias).
3. `balanced_accuracy`, `per_class_recall`, `per_class_precision`, `weighted_f1`, `confusion_matrix` (secundarias del manifiesto).
4. Curvas ROC(ovr) y PR por clase guardadas en `curves/roc/` y `curves/pr/`.

---

## 13. ¿Cómo se registrará ECE?

**ECE = puerta de promoción** (obligatorio por calendario, `calibration_required: true`):
1. **Cálculo:** expected calibration error sobre test set — agrupar predicciones por bin de confianza (estándar 10–15 bins) y medir |confianza media − precisión bin| promedio.
2. **Reporte:** `calibration_report.md` + curva `curves/calibration/`.
3. **Regla de decisión (del manifiesto y execution plan):** un modelo con buen macro-F1 pero mal ECE **NO es promovible**.
4. **Registro por clase:** ECE por clase para las minoritarias (dónde la calibración suele fallar).

---

## 14. ¿Cuál es el GO / NO GO?

**Estado actual de GO (verificado contra `AGRICULTURE_AI_V2_BENCHMARK_READINESS.md §5`):**

| Decide | Verdict | Condición |
|---|---|---|
| **Benchmark de laboratorio** | **GO** | Solo tras materializar dataset v1 + split_v1 + cerrar gobernanza de haz |
| **Validez de campo** | **NO-GO** | Falta dataset propio de campo, validación experta y de holdout |
| **Producir con el modelo** | **NO-GO** | Requiere home validity + recalibración en campo + contrato v2 |

**Checklist de GO para ARRANCAR el benchmark (todas deben ser ✓):**
- [ ] Dataset `v1/RAW/` recuperado y verificado contra raw_source_manifest + checksum.
- [ ] `labels_v1.csv` completo (16 clases, 22.488 filas) y taxonomía cerrada.
- [ ] `split_v1` materializado (train/validation/test.csv) con gates de calidad ✓ y `split_report.md`.
- [ ] Dedup/pHash aplicado; cero fugas reportadas.
- [ ] Entorno reproducible (TF/Keras, seed 42, hardware declarado).
- [ ] Manifiestos copiados a `v1/manifests/` con hash idéntico al canónico.

**NO-GO (arranque bloqueado) si:** no se puede recuperar el origen del raw auditado, o el checksum falla, o la taxonomía no cierra en 16 clases.

---

## 15. ¿Qué debe hacer Bernardo exactamente?

**Orden mecánica (sin reinterpretación) — fase de ejecución futura:**
1. **Usar el raw recuperado**: el origen ya está localizado (`D:\RespaldoData\PlantVillage-Dataset\raw\color`, 2026-09-23); copiar SOLO las 16 clases del scope a `v1/RAW/`.
2. **Verificar** con checksum contra `raw_source_manifest` (si falla → NO-GO y reportar).
3. **Generar `labels_v1.csv`** desde taxonomía (script mecánico, 16 clases).
4. **Correr dedup + pHash** y producir `split_lists/*.csv` (70/15/15, seed 42, stratified_group_split).
5. **Generar `curated/{train,validation,test}/`** (copias físicas o symlinks según convención) + `split_report.md`.
6. **Publicar** `dataset_card.md` y `CHECKSUMS.sha256`; actualizar el split_manifest materializado.
7. **Ejecutar benchmark** (4 modelos; EfficientNet-B0, MobileNetV3-Large, ResNet50, ConvNeXt-Tiny) con sampling/métricas/intercepción según manifiesto.
8. **Evaluar MobileNetV2** como control negativo sobre test.
9. **Exportar MobileNetV3 a TFLite** float16/int8 + edge assessment.
10. **Publicar** `benchmark_report.md`, `calibration_report.md`, `error_analysis_report.md`, `model_cards/`, `confusion_matrices/`, `curves/` (outputs esperados del manifiesto).
11. **Decidir baseline** (master + edge) y reportar el estado GO/NO-GO para siguiente fase (campo).

**Lo que Bernardo NO debe hacer:** modificar manifiestos canónicos, tocar `main`/ramas ajenas, presentar el bootstrap como válido en campo, usar el holdout en entrenamiento.

---

## CHECKLIST EJECUTABLE (pegar en consola de la sesión de ejecución)

```
[ ] 1. Recuperar origen PlantVillage raw/color (máquina/Kaggle/backup) → data/datasets/agriculture_images_tomato-potato-corn/v1/RAW/
[ ] 2. Verificar checksum/estructura contra raw_source_manifest.agriculture_v2_dataset_v1.yaml
[ ] 3. Generar labels_v1.csv (22.488 filas, taxonomy_v1, agriculture_v2_label_schema_v1)
[ ] 4. Dedup exactos + pHash near-dup (anti-fuga) — reportar n duplicados
[ ] 5. split_v1: 70/15/15, seed 42, stratified_group_split → split_lists/{train,validation,test}.csv
[ ] 6. Gates split: clases presentes en 3 particiones, conteos por clase, cero fugas → split_report.md
[ ] 7. Construir curated/{train,validation,test}/ según membresía
[ ] 8. Crear dataset_card.md (22.488/16/3, ratio 35.24×, sin validez de campo) + CHECKSUMS.sha256
[ ] 9. Reservar v1/holdout/real_world_holdout_v1/ (vacío, intocable)
[ ] 10. Copiar manifiestos canónicos a v1/manifests/ y verificar hash = canónico
[ ] 11. Entorno: TF/Keras pinned, seed 42, GPU/CPU declarado
[ ] 12. Correr EfficientNet-B0 (baseline_master_candidate) → métricas
[ ] 13. Correr MobileNetV3-Large (baseline_edge_candidate) → métricas + TFLite float16/int8 + latencia
[ ] 14. Correr ResNet50 (classic_control) → métricas
[ ] 15. Correr ConvNeXt-Tiny (experimental_ceiling) → métricas
[ ] 16. Correr MobileNetV2 heredado SOLO como control negativo (test) — sin retoques
[ ] 17. Registrar metrics CSV (macro_f1, balanced_accuracy, recalls, ECE, matrices)
[ ] 18. Generar curvas ROC(ovr), PR, calibración + calibration_report.md con ECE por bin/clase
[ ] 19. Publicar benchmark_report.md + error_analysis_report.md + model_cards/
[ ] 20. Decidir baseline master+edge + veredicto GO/NO-GO campo → actualizar registro
```

---

## RESULTADO FINAL

- **Requisito mínimo de arranque:** copiar a `v1/RAW/` el origen ya recuperado (22.488/16/3) con checksum. Todo lo demás está especificado al nivel de instrucción mecánica.
- **Salida tangible:** dataset v1 materializado (RAW + curated + split_lists + labels + checksums), benchmark de 4 arquitecturas + control MobileNetV2, reportes de evaluación (benchmark/calibration/error) y baseline master+edge decidido.
- **Independencia:** quien ejecute este checklist NO necesita releer ningún otro documento salvo los manifiestos (son la autoridad operativa).
- **Invariante preservado:** honestidad (bootstrap ≠ campo), trazabilidad (IDs versionados), inmutabilidad (RAW, split, holdout).

*Plan de ejecución operativo Dataset V2. Solo diseño/operativización; sin código, sin modificación de documentos existentes, sin commits.*