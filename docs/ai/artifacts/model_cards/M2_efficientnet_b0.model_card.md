# Model Card — M2 EfficientNet-B0

**id:** `M2_efficientnet_b0`
**role:** `challenger`  (gate vigente: `M1_BASELINE_M2_CHALLENGER`)
**tipo:** clasificador de imágenes (computer vision) · **estado:** artefacto materializado (AI-R1, 2026-10-14)
**artifact_record:** `docs/ai/artifacts/M2_ARTIFACT_RECORD.md`

---

## 1. Detalles del modelo

| Campo | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 |
| Framework | PyTorch (`state_dict`) |
| Parámetros | 4 028 044 (4,03 M) |
| Input | `224x224x3` (float32) |
| Preprocesado | torchvision: Resize(224) · ToTensor · Normalize(mean/std ImageNet) |
| MACs | 384 555 232 |
| FLOPs (aprox) | 769 110 464 |
| Tamaño | fp32 16,11 MB · fp16 8,06 MB · int8 ~4 028 KB |
| Salida | `logits[16]` → `argmax` |

## 2. Uso previsto

- **Propósito:** candidato a baseline maestro de clasificación de enfermedades de cultivos; comparación con M1 (MobileNetV2).
- **Alcance:** investigación/laboratorio (bootstrap PlantDisease + dataset v1). **No** validez de campo.
- **NO usar para:** decisiones agronómicas en producción sin validación de dominio (holdout vacío).

## 3. Datos de entrenamiento

| Campo | Valor |
|---|---|
| Dataset | `agriculture_images_tomato-potato-corn` v1 (22 488 imgs) |
| Taxonomía | `agriculture_v2_taxonomy_v1` · 16 clases · 3 especies |
| Split | `agriculture_v2_split_v1` · seed 42 · train 15 741 / validation 3 373 / test 3 374 |
| Entrada entrenamiento | `curated/train` (ImageFolder) |
| Nota | `holdout/real_world_holdout_v1` **vacío** (0 muestras) |

## 4. Métricas (VALIDATION · autoridad `report/validation_metrics.json`)

| Métrica | Valor |
|---|---|
| **macro_f1** | **0.9936878552054299** |
| weighted_f1 | 0.9955578564108665 |
| balanced_accuracy | 0.9943169418974069 |
| **ece** | **0.03321474453997425** |
| accuracy | 3358 / 3373 = 0.995553 |
| best epoch | 32 (total 40) |
| test | **no ejecutado** (single-use reservado) |

**Comparación con baseline (VALIDATION):**

| Modelo | Macro-F1 | ECE | BalAcc | W-F1 | Params (M) |
|---|---|---|---|---|---|
| M1 MobileNetV2 | 0.9899 | **0.0313** | 0.9898 | 0.9902 | 2,24 |
| **M2 EfficientNet-B0** | **0.9937** | 0.0332 | **0.9943** | 0.9956 | 4,03 |

> M2 mejora macro-F1 (+0,0038) y BalAcc (+0,0045) con **ECE ligeramente peor** (+0,0019) y ~79,5 % más parámetros. Competitivo; **no** superior en calibración.

## 5. `class_index_map` (orden `ImageFolder`, alfabético)

| idx | clase | idx | clase |
|---|---|---|---|
| 0 | corn__cercospora_gray_leaf_spot | 8 | tomato__early_blight |
| 1 | corn__common_rust | 9 | tomato__healthy |
| 2 | corn__healthy | 10 | tomato__late_blight |
| 3 | corn__northern_leaf_blight | 11 | tomato__leaf_mold |
| 4 | potato__early_blight | 12 | tomato__mosaic_virus |
| 5 | potato__healthy | 13 | tomato__septoria_leaf_spot |
| 6 | potato__late_blight | 14 | tomato__target_spot |
| 7 | tomato__bacterial_spot | 15 | tomato__yellow_leaf_curl_virus |

> ⚠️ Distinto del orden de filas de `labels_v1.csv`.

## 5b. Métricas por clase (VALIDATION)

| idx | clase | precision | recall | f1 | support |
|---|---|---|---|---|---|
| 0 | corn__cercospora_gray_leaf_spot | 0.9487 | 0.9610 | 0.9548 | 77 |
| 1 | corn__common_rust | 1.0000 | 1.0000 | 1.0000 | 179 |
| 2 | corn__healthy | 1.0000 | 1.0000 | 1.0000 | 174 |
| 3 | corn__northern_leaf_blight | 0.9796 | 0.9730 | 0.9763 | 148 |
| 4 | potato__early_blight | 1.0000 | 1.0000 | 1.0000 | 150 |
| 5 | potato__healthy | 1.0000 | 1.0000 | 1.0000 | 23 |
| 6 | potato__late_blight | 1.0000 | 1.0000 | 1.0000 | 150 |
| 7 | tomato__bacterial_spot | 0.9938 | 1.0000 | 0.9969 | 319 |
| 8 | tomato__early_blight | 0.9804 | 1.0000 | 0.9901 | 150 |
| 9 | tomato__healthy | 0.9917 | 1.0000 | 0.9958 | 238 |
| 10 | tomato__late_blight | 1.0000 | 0.9861 | 0.9930 | 288 |
| 11 | tomato__leaf_mold | 1.0000 | 1.0000 | 1.0000 | 143 |
| 12 | tomato__mosaic_virus | 1.0000 | 1.0000 | 1.0000 | 56 |
| 13 | tomato__septoria_leaf_spot | 1.0000 | 0.9962 | 0.9981 | 265 |
| 14 | tomato__target_spot | 0.9953 | 0.9953 | 0.9953 | 211 |
| 15 | tomato__yellow_leaf_curl_virus | 1.0000 | 0.9975 | 0.9988 | 803 |

*(support = fila del `confusion_matrix`; suma 3 373)*

## 6. Linaje

`dataset v1 → split v1 (seed 42) → notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb → run M2_efficientnet_b0_001 → benchmark/runs/M2_efficientnet_b0/`.
Cadena completa en `M2_ARTIFACT_RECORD.md §2b`.

## 7. Hashes (integridad)

| Archivo | SHA-256 (prefijo…sufijo) |
|---|---|
| `checkpoints/best.pth` | `3FDF86A7…BDFFABC3` |
| `checkpoints/last.pth` | `1996F105…65D9E221F4` |
| `config.json` | `4E04643F…F80F80D` |
| `report/validation_metrics.json` | `DD13897C…E4CA64AA` |

Lista completa (13): `benchmark/runs/M2_efficientnet_b0/CHECKSUMS.sha256`.

## 7b. Artefacto ONNX (AI-R2, 2026-10-14)

| Campo | Valor |
|---|---|
| Ruta | `benchmark/runs/M2_efficientnet_b0/exports/model.onnx` |
| SHA-256 | `4BD657B363407D4012F013589A5469DCA57B9C5E347A9EA54E1F6E57A3274EC3` |
| Tamaño | 16 102 181 B |
| Contrato | `input` float32 `[batch,3,224,224]` → `logits` float32 `[batch,16]` (sin softmax) |
| Opset / batch | 17 · dinámico |
| Entorno | torch 2.11.0+cpu · torchvision 0.26.0 · onnx 1.23.2 · onnxruntime 1.31.0 |
| Paridad (G-NEW-A) | **PASS** · `max_abs_diff` 1.57e-04 · `argmax_agreement` 1.0 (256 y 3 373) · `Δmacro_f1` 0.0 |
| Registro | `docs/ai/artifacts/M2_ONNX_EXPORT_RECORD.md` |

> Exportado, **no servido**. Pendiente AI-R3 (integración `onnxruntime` en `ai_service`).

## 8. Limitaciones y sesgos

- Bootstrap **PlantDisease** (láminas de laboratorio) → no representa campo real.
- `holdout` **vacío** → sin evaluación de dominio.
- ECE > M1; desbalance: `potato__healthy` con support 23.
- **test single-use no ejecutado** → métricas de promoción pendientes.
- Clase con menor F1: `corn__cercospora_gray_leaf_spot` (0.9548).

## 9. Uso ético / alcance

Herramienta de investigación. No sustituye diagnóstico fitosanitario profesional. No usar como base de decisión agronómica sin validación local.

---

**Artefacto materializado en `benchmark/runs/M2_efficientnet_b0/` (no versionado) · NO servido · NO promovido · gate `M1_BASELINE_M2_CHALLENGER` intacto.**
