# SIGCTiArural · ESTADO ACTUAL BENCHMARKS — Cierre de jornada

> **Fecha de cierre:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · **HEAD:** `fa8e6a4` · Working tree **limpio**.
> Este documento es el punto único de continuidad para retomar mañana sin pérdida de contexto.

---

## ════════════════════════════════
## ESTADO DEL DATASET
## ════════════════════════════════

- Dataset **V2+ validado**.
- **22.488 imágenes**.
- **16 clases**.
- **3 especies**.
- Splits oficiales (seed 42):
  - `train`       = **15.741**
  - `validation`  = **3.373**
  - `test`        = **3.374**

> Invariante de dominio: Dataset V2+ **congelado** — no se modifica, no se re-particiona.

---

## ════════════════════════════════
## ESTADO M1
## ════════════════════════════════

**Modelo:** MobileNetV2 (torchvision, pretrained ImageNet, cabeza 16 · 2.244.368 params).

**Estado:**
- ✅ APROBADO
- 🔒 CONGELADO
- ✅ BASELINE OFICIAL (control del benchmark)

**Resultados oficiales (validation, run `M1_mobilenetv2_001`):**

| Métrica | Valor | Gate | Resultado |
|---|---|---|---|
| **Macro-F1** | **0.9899** | ≥ 0.955 | PASS |
| **ECE** | **0.0313** | ≤ 0.10 | PASS |
| Balanced Accuracy | 0.9898 | — | informe |
| Weighted-F1 | 0.9902 | — | informe |

**Documentación asociada:** `Documentacion/IA/Benchmark_M1_MobileNetV2/` (README, INFORME_TECNICO_CIENTIFICO_M1_APA7, MASTERDOC, TABLA_COMPARATIVA_M1_M5, EVIDENCIA_EJECUCION, CORRECCIONES_PARA_M2).

> **Regla:** M1 no se re-entrena, no se modifica, no se re-abre. Es referencia de comparación para M2.

---

## ════════════════════════════════
## ESTADO M2
## ════════════════════════════════

**Modelo:** EfficientNet-B0 (torchvision, pretrained ImageNet, cabeza 16 · **4.028.044 params medidos**).

**Notebook:** `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb`

**Estado actual:**
- ✅ Generado (29 celdas: 10 md + 19 code).
- ✅ Auditado (auditoría final 8 puntos: params, MACs/FLOPs, T4, CPU, Dataset V2+, rutas Drive, artefactos, sesión limpia).
- ✅ Corregido (bug `class_weights`/`evaluate`).
- ✅ Commit realizado (`91dc25e` feat · `fa8e6a4` fix).
- ✅ Push realizado a `feature/ubtn-biological-telemetry`.
- ✅ Smoke test superado (19/19 celdas ejecutadas sin excepción en torch CPU 2.14, dataset sintético).
- ⏳ **Listo para corrida oficial Colab T4 con Dataset V2+ real** (pendiente).

**Corrección aplicada (fix `fa8e6a4`):**
El fallback inline construía `bm_metrics`/`bm_datasets` con `type("bm", (), {...})()`, lo que convertía `class_weights` y `evaluate` en **métodos ligados** → `self` inyectado → `TypeError: takes 2 positional arguments but 3 were given`. Se reemplazó por `SimpleNamespace`:

```python
from types import SimpleNamespace as _SNS
bm_metrics = _SNS(evaluate=evaluate, expected_calibration_error=expected_calibration_error)
bm_datasets = _SNS(class_weights=class_weights)
```

**Garantías del notebook M2:**
- Política idéntica a M1 (seed 42, transforms, CE ponderada, WeightedRandomSampler, AdamW 3e-4/wd 1e-4, CosineAnnealing T=40, batch 64, 224px, patience 8).
- Correcciones del dossier: **AMP migrado a `torch.amp`** · salidas persistentes en **Drive** · guardado automático reanudable (`best.pth`/`last.pth`/`metrics.csv` con flush).
- Análisis automático **"M2 vs Baseline M1"** al final del run (`M2_VS_M1.json/.md`).
- Test set **single-use protegido** (`RUN_FINAL_TEST=False` en celda 14).

---

## ════════════════════════════════
## PENDIENTES PARA MAÑANA
## ════════════════════════════════

### PRIORIDAD 1 — Corrida oficial
Ejecutar `SIGCTIARURAL_M2_EfficientNetB0.ipynb` en **Colab T4** con Dataset V2+ real.
Playbook de lanzamiento:
1. Abrir el notebook · Runtime → **T4 GPU**.
2. Ejecutar todo · autorizar montaje Drive (celda 2).
3. Verificar `DATA_ROOT` = `/content/drive/MyDrive/SIGCTiArural/datasets/v1/curated` (16 carpetas/clase).
4. Si `benchmark/src` no está en Drive, el fallback **corregido** se activa solo.
5. Gate: `macro-F1 ≥ 0.955` · `ECE ≤ 0.10` en validation.
6. NO tocar celda 14 hasta decisión de test single-use.

### PRIORIDAD 2 — Recopilar artefactos (desde `runs/M2_efficientnet_b0/`)
- `config.json` · `validation_metrics.json` · `M2_VS_M1.json` · `M2_VS_M1.md`
- `best.pth` · `last.pth` · `metrics.csv`
- PNG: `train_val_curves` · `confusion_matrix` · `roc_1vRest` · `pr_per_class` · `calibration` · `error_analysis`

### PRIORIDAD 3 — Análisis científico M2 vs M1
Evaluar en `M2_VS_M1.md`, con Δ con signo **M2 − M1**:
- Macro-F1 · ECE · Balanced Accuracy
- Parámetros · Tiempo por época · Coste computacional · Viabilidad edge

### PRIORIDAD 4 — Decisión benchmark
**¿EfficientNet-B0 supera a MobileNetV2?**
- **SI** → nuevo candidato principal (`baseline_master_candidate`); documentar en `TABLA_COMPARATIVA_M1_M5.md` y manifiestos.
- **NO** → MobileNetV2 continúa como baseline dominante.

---

## ════════════════════════════════
## REPOSITORIO
## ════════════════════════════════

- **Rama actual:** `feature/ubtn-biological-telemetry`
- **Working tree:** limpio (sin modificaciones ni archivos sin trackear)
- **HEAD:** `fa8e6a4`

**Commits registrados en esta cadena (relevant, asc → desc):**

| Commit | Fecha | Contenido |
|---|---|---|
| `fa8e6a4` | 2026-09-23 | **fix(m2):** fallback `SimpleNamespace` (bug `class_weights`/`evaluate`) |
| `91dc25e` | 2026-09-23 | **feat(m2):** notebook EfficientNet-B0 |
| `4520451` | 2026-09-23 | docs(governance): consolidación recuperación/auditorías Dataset V2+ |
| `d6744f0` | 2026-09-23 | docs(m1): dossier y evidencia MobileNetV2 |
| `c148e86` | 2026-09-23 | docs(dataset-v2): finalizar alineación inventario |
| `9aebcb4` | 2026-09-23 | feat(benchmark): pipeline benchmark v1 |
| `902e55e` | 2026-09-23 | docs(dataset-v2): baseline recuperado 22.488/16/3 |
| `5a079f4` | 2026-09-22 | docs(dataset-v2): readiness + phase0 |

> No hay pushes a `main` (prohibido por regla suprema). Todo vive en `feature/ubtn-biological-telemetry`.

---

## ════════════════════════════════
## BITÁCORA (cronológica)
## ════════════════════════════════

1. **Recuperación Dataset V2+** — inventario recuperado y validado: 22.488/16/3, split oficial fijado (15.741/3.373/3.374, seed 42). Manifiestos y readiness consolidados (`902e55e`, `5a079f4`, `c148e86`).
2. **Consolidación baseline** — gobernanza del benchmark V1 unificada; baseline `agriculture_v2_baseline_v2` registrado (`4520451`, `9aebcb4`).
3. **Ejecución exitosa M1** — MobileNetV2 entrenado en Colab T4: macro-F1 0.9899 · ECE 0.0313 → **APROBADO y CONGELADO** como baseline oficial. Dossier M1 completo (`d6744f0`).
4. **Generación y auditoría M2** — notebook EfficientNet-B0 generado (29 celdas), auditado punto por punto (params, MACs corregidos por `groups`, T4/CPU, Dataset, rutas, artefactos, sesión limpia) (`91dc25e`).
5. **Bug `class_weights`/`evaluate`** — detectado en corrida real: el fallback `type("bm", (), {...})()` ligaba métodos e inyectaba `self` → TypeError que impedía arrancar el entrenamiento.
6. **Fix con SimpleNamespace** — reemplazados ambos wrappers por `SimpleNamespace`; notebook regenerado (`fa8e6a4`).
7. **Smoke test exitoso** — 19/19 celdas ejecutadas sin excepción en torch CPU con dataset sintético; DataLoaders, criterion, modelo (4.028.044 params · ~384 MMACs), entrenamiento 1 epoch, validation, exportaciones generadas.
8. **Estado listo para corrida oficial** — notebook commiteado, pusheado y validado; pendiente ejecución Colab T4 con Dataset V2+ real.

---

*Honestidad de estado: M1 = resultado oficial fijo; M2 = experimento ejecutado del que se valida el stack (smoke test) pero sin corrida oficial aún. Resultados M2 pendientes de la corrida Colab T4.*