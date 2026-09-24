# Evidencia de Ejecución — Experimento M1 (MobileNetV2)

**Documento:** EVIDENCIA_EJECUCION_M1 (E)
**Propósito:** registrar las métricas oficiales, inventariar los artefactos producidos por el run y proporcionar el protocolo de extracción/persistencia desde el runtime Colab.

---

## 1. Registro oficial de métricas (validation, tal como fueron declaradas)

| Métrica | Valor | Gate | PASS |
|---|---|---|---|
| **macro-F1** | **0.9899** | ≥ 0.955 | ✅ |
| **ECE** | **0.0313** | ≤ 0.10 | ✅ |
| **balanced_accuracy** | 0.9898 | — | informe |
| **weighted_f1** | 0.9902 | — | informe |

**Diagnóstico:** desempeño válido (≥ 0.90, < 1.0) — sin señal de fuga ni de bug de pipeline.

## 2. Inventario de artefactos producidos por el run

Todos generados en el directorio construido por el notebook:

```
/content/M1_mobilenetv2_001/
├── best.pth            # checkpoint (mejor macro-F1 val) -> keys: epoch, model_state_dict,
│                       #   optimizer_state_dict, macro_f1_val, ece_val
├── last.pth            # checkpoint de la última epoch -> keys: epoch, model_state_dict, macro_f1_val
├── metrics.csv         # columnas: epoch,train_loss,train_macro_f1,val_loss,val_macro_f1,val_ece,lr,time_s
├── validation_metrics.json   # keys: macro_f1, weighted_f1, balanced_accuracy,
│                             #   per_class_precision[16], per_class_recall[16], per_class_f1[16],
│                             #   confusion_matrix[16][16], ece
├── test_metrics.json   # (mismo esquema) SOLO si se ejecutó la celda #13 (RUN_FINAL_TEST=True)
├── train_val_curves.png
├── confusion_matrix.png
├── roc_1vRest.png
├── pr_per_class.png
├── calibration.png
└── error_analysis.png
```

## 3. Protocolo de extracción (ejecutar ANTES de cerrar la sesión Colab)

`/content` es **efímero**: al cerrar el runtime se pierde todo. En una celda nueva de Colab (sin volver a entrenar):

```python
import shutil, os
SRC = "/content/M1_mobilenetv2_001"
DST = "/content/drive/MyDrive/SIGCTiArural/runs/M1_mobilenetv2_001"
os.makedirs(DST, exist_ok=True)
shutil.copytree(SRC, DST, dirs_exist_ok=True)
print("Copiado a Drive:", os.listdir(DST))
```

> En la versión corregida para M2, el guardado apuntará directamente a Drive (ver `CORRECCIONES_PARA_M2.md`).

## 4. Elementos pendientes de incorporar (honestidad de estado)

Al momento de redactar este dossier, los siguientes datos viven en el runtime y **aún no se han incorporado** a este repositorio:

| Elemento | Estado | Dónde se completa |
|---|---|---|
| mejor epoch | pendiente (en `best.pth`/`metrics.csv`) | §3 tras extracción |
| per-class F1/P/R (16 filas) | pendiente (`validation_metrics.json`) | §3 tras extracción |
| curvas train/val | pendiente (PNG) | §3 tras extracción |
| matriz de confusión + heatmap de errores | pendiente (PNG/JSON) | §3 tras extracción |
| ROC · PR · calibración | pendiente (PNG) | §3 tras extracción |
| test single-use | NO ejecutado/declarado → no documento | celda #13 (RUN_FINAL_TEST) |

**Regla:** no se inventan valores; este documento se actualizará con los archivos extraídos, o en su defecto conservará el estado "pendiente" como registro honesto.

## 5. Cierre del run (verificación de trazabilidad)

- experiment_id: `agriculture_v2_baseline_v2` · run `M1_mobilenetv2_001`
- Notebook: `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb` · hardware: Colab + T4
- Gates superados → run **APROBADO · CONGELADO** (no re-entrenar).