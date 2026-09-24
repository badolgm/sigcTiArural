# MASTERDOC — Experimento M1 · MobileNetV2

**Documento:** MASTERDOC_EXPERIMENTO_M1 (C) · **Registro maestro del experimento**
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry`
**Estado:** ✅ **APROBADO — BASELINE OFICIAL SIGCTiArural V2+** (congelado)
**Fuente rectora:** `baseline_experiment_manifest.agriculture_v2_baseline_v2.yaml` · `curation_manifest.agriculture_v2_dataset_v2.yaml` · `split_report.md`

---

## 1. Identidad del experimento

| Atributo | Valor |
|---|---|
| **experiment_id** | `agriculture_v2_baseline_v2` / run `M1_mobilenetv2_001` |
| **Arquitectura** | MobileNetV2 (torchvision, pretrained ImageNet, cabeza 16) |
| **Rol** | control clásico · referencia del benchmark |
| **Nombre técnico** | 2.244.368 params totales (medidos) · 19 capas + drop + head linear |
| **Dataset** | `agriculture_images_tomato-potato-corn` v1 (22.488 / 16 clases / 3 especies) |
| **Split** | train 15.741 · validation 3.373 · test 3.374 (seed 42, estratificado) |
| **Hardware** | Google Colab + **GPU T4** |
| **Honestidad de estado** | resultado = **real** (validación). Test single-use: pendiente o pendiente de publicar |

## 2. Configuración canónica (idéntica a `benchmark/config.yaml`)

| Parámetro | Valor |
|---|---|
| batch_size | 64 |
| epochs | 40 (early stop patience 8 en macro-F1 val) |
| optimizer | AdamW · lr 3e-4 · weight_decay 1e-4 |
| scheduler | CosineAnnealingLR (T_max=40, eta_min=lr·0.01) |
| loss | CrossEntropyLoss ponderada (w_c = N/(n_c·16)) |
| sampler | WeightedRandomSampler (replacement=True) |
| image_size | 224 (Resize 256 → crop) · val/test CenterCrop |
| Aumentación | RandomResizedCrop, HLip/VFlip, Rotation(15), ColorJitter |
| fp16 AMP | autocast + GradScaler (GPU) |
| seed | 42 (pipeline + split) |
| transfer | pretrained ImageNet (IMAGENET1K_V1) |

## 3. Hipótesis (marco del notebook)

| # | Hipótesis | Criterio de rechazo | Veredicto |
|---|---|---|---|
| H1 | Diagnóstico sano del pipeline (split/labels/balanceo) | macro-F1 val < 0.90 o ≈ 1.0 | ✅ **No rechazada** (0.9899, < 1.0) |
| H2 | Pipeline fuga-free (dedup SHA-256 + pHash) | |Δ macro-F1 (test−val)| > 0.05 | ✅ sin evidencia de fuga en val |
| H3 | Balanceo preserva minoritarias | F1 minoritaria < 0.80 | ✅ (0.9899 global; desglose per-class en extracción) |
| H4 | Control bien calibrado | ECE val > 0.10 | ✅ **No rechazada** (0.0313) |
| H5 | Mayor capacidad no supera al control en > 0.005 | Δ > 0.005 en ≥ 2 arquitecturas | ⏳ a decidir en M2–M5 |

- **Nota honesta:** el resultado val (0.9899) supera la banda proyectada 0.955–0.970 por saturación del dataset; es consistente con un control bien entrenado y no activa sospecha de fuga (se esperaría ≈ 1.0 perfecto).

## 4. Resultados oficiales (validation)

| Métrica | Valor | Gate | PASS |
|---|---|---|---|
| macro-F1 | **0.9899** | ≥ 0.955 | ✅ |
| ECE | **0.0313** | ≤ 0.10 | ✅ |
| balanced_accuracy | 0.9898 | — | informe |
| weighted_f1 | 0.9902 | — | informe |

### Decisiones de aceptación
1. Dataset V2+ validado. 2. ETL validado. 3. Pipeline de entrenamiento validado. 4. Infraestructura Colab + T4 validada. 5. Sin errores estructurales del notebook. 6. Gates superados. 7. **MobileNetV2 = baseline oficial.**

### Lo que NO se hizo (registro de honestidad)
- No se re-entrenó el modelo ni se afinaron hiperparámetros tras el resultado.
- El test set no se utilizó para decisiones intermedias (regla de oro).

## 5. Inventario de artefactos del run

| Artefacto | Ubicación (runtime) | Estado |
|---|---|---|
| `best.pth` · `last.pth` | `/content/M1_mobilenetv2_001/` | pendiente de extracción |
| `metrics.csv` (epoch-by-epoch) | ídem | pendiente de extracción |
| `validation_metrics.json` | ídem | pendiente de extracción |
| `test_metrics.json` | ídem | solo si se ejecutó single-use |
| PNG (6): curvas, CM, ROC, PR, calibración, error | ídem | pendiente de extracción |

> **Alerta operativa:** `/content` es efímero en Colab. Extraer antes de cerrar sesión (protocolo en `EVIDENCIA_EJECUCION_M1.md` §3). Causa-raíz auditada en `CORRECCIONES_PARA_M2.md` (persistencia en Drive).

## 6. Trazabilidad y gobernanza

- Manifiestos v2 vigentes: raw source · curation · baseline experiment (`..._v2.yaml`).
- Registro futuro: al evaluar test single-use y al consolidar M2, actualizar `benchmark_report.md` y `model_cards/MobileNetV2.md`.
- Invariantes de dominio: honestidad de estado, macro-F1 + ECE como gates, test single-use, política idéntica entre arquitecturas.

## 7. Enlaces del dossier

- Informe APA 7 → `INFORME_TECNICO_CIENTIFICO_M1_APA7.md`
- Resumen GitHub → `README.md`
- Comparativa → `TABLA_COMPARATIVA_M1_M5.md`
- Evidencia → `EVIDENCIA_EJECUCION_M1.md`
- Correcciones → `CORRECCIONES_PARA_M2.md`