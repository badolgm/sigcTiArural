# SIGCTiArural · Benchmark V1 — Resultado M1 (MobileNetV2)

> **STATUS: ✅ APROBADO · BASELINE OFICIAL SIGCTiArural V2+**
> M1 queda **congelado** como benchmark oficial de referencia. No se re-entrena. Continuación: **M2 (EfficientNet-B0)**.

---

## Resultado oficial (validation)

| Métrica | Valor | Gate | Resultado |
|---|---|---|---|
| **macro-F1** | **0.9899** | ≥ 0.955 | ✅ PASS |
| **ECE** | **0.0313** | ≤ 0.10 | ✅ PASS |
| **balanced_accuracy** | 0.9898 | — | informe |
| **weighted_f1** | 0.9902 | — | informe |

- **Hardware:** Google Colab + **GPU T4**.
- **Dataset:** `agriculture_images_tomato-potato-corn` v1 · 22.488 / 16 clases / 3 especies · split 15.741/3.373/3.374 (seed 42).
- **Modelo:** MobileNetV2 (torchvision, pretrained ImageNet, cabeza 16) · **2.24M params (medidos)**.
- **Configuración canónica:** CE ponderada · WeightedRandomSampler · AdamW 3e-4 (wd 1e-4) · CosineAnnealing T=40 · batch 64 · 224px · early stop patience 8.
- **Diagnóstico:** sin evidencia de fuga (0.9899 < 1.0) ni de bug (≥ 0.90); supera ampliamente los gates.

## Lo que deja validado M1

1. Dataset V2+ (corpus + split oficial).
2. Pipeline ETL (Extracción→Transformación→Carga).
3. Pipeline de entrenamiento (AMP, samplers, checkpoints, early stop).
4. Infraestructura Colab + T4.
5. Notebook como artefacto de software (sin errores estructurales).
6. Gates de aceptación superados (macro-F1 ≥ 0.955, ECE ≤ 0.10).
7. MobileNetV2 = **línea base oficial** del benchmark (control).

## Dossier del experimento (esta carpeta)

| Documento | Contenido |
|---|---|
| `README.md` | Este resumen oficial (GitHub). |
| `INFORME_TECNICO_CIENTIFICO_M1_APA7.md` | Informe completo en formato académico APA 7. |
| `MASTERDOC_EXPERIMENTO_M1.md` | Registro maestro del experimento (maestro de trazabilidad). |
| `TABLA_COMPARATIVA_M1_M5.md` | Comparativa M1–M5 (referencias para los modelos siguientes). |
| `EVIDENCIA_EJECUCION_M1.md` | Evidencia de ejecución, inventario de artefactos y guía de extracción. |
| `CORRECCIONES_PARA_M2.md` | Correcciones preparadas para la siguiente versión. |

## Artefactos generados por el run

Generados en el runtime Colab en `/content/M1_mobilenetv2_001/` (persistencia pendiente de extracción → ver `EVIDENCIA_EJECUCION_M1.md`):

- `best.pth` · `last.pth` (checkpoints entrenados)
- `metrics.csv` (curva por epoch)
- `validation_metrics.json`
- `test_metrics.json` (si se ejecutó el single-use)
- PNG: `train_val_curves.png`, `confusion_matrix.png`, `roc_1vRest.png`, `pr_per_class.png`, `calibration.png`, `error_analysis.png`

## Siguientes pasos

1. Extraer y persistir los artefactos del runtime a Drive (ver `EVIDENCIA_EJECUCION_M1.md` §3).
2. Incorporar correcciones v2 al notebook (ver `CORRECCIONES_PARA_M2.md`).
3. **M2 — EfficientNet-B0**: misma política canónica; registrar en `TABLA_COMPARATIVA_M1_M5.md` al aprobar.

---

*Honestidad de estado: los valores publicados corresponden a la ejecución oficial de M1 y se preservan como invariante de dominio.*