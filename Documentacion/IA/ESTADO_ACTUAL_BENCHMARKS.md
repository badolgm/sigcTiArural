# SIGCTiArural · ESTADO ACTUAL BENCHMARKS — Cierre de jornada

> **Fecha de cierre:** 2026-09-27 · **Rama:** `feature/ubtn-biological-telemetry` · **HEAD:** `18b95b1` · Working tree con modificaciones sin commitear (por orden: RAM fix del notebook M2, documentos de sesión).
> Este documento es el punto único de continuidad para retomar sin pérdida de contexto.

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
- ✅ Commit realizado (`91dc25e` feat · `fa8e6a4` fix · `18b95b1` docs).
- ✅ Push realizado a `feature/ubtn-biological-telemetry`.
- ✅ Smoke test superado (19/19 celdas ejecutadas sin excepción en torch CPU 2.14, dataset sintético).
- ✅ **RAM fix aplicado (2026-09-24)** — ver sección *Corrección RAM (2026-09-24)*.
- ✅ **EJECUTADO OFICIALMENTE (2026-09-27)** — corrida oficial en Colab T4 con Dataset V2+ real. **Challenger validado.**

**Resultados oficiales M2 (corrida oficial 2026-09-27, validation, run `M2_efficientnet_b0`):**

| Métrica | Valor | Gate | Resultado |
|---|---|---|---|
| **Macro-F1** | **0.9937** | ≥ 0.955 | PASS |
| **Balanced Accuracy** | **0.9943** | — | informe |
| **ECE** | **0.0332** | ≤ 0.10 | PASS |
| **Weighted-F1** | **0.9956** | — | informe |
| **Best Epoch** | **32** | — | — |
| **Duración** | **≈ 4.66 h** | — | T4 Colab |

**Conclusiones del run:**
- ✅ **RAM fix validado** (corrida completa sin OOM de RAM CPU).
- ✅ **benchmark/src fallback validado** (activo cuando no hay `benchmark/src` en Drive, sin impacto científico).
- ✅ **Smoke test validado** en corrida real.
- ✅ **Validation Gates PASS** (macro-F1 ≥ 0.955 · ECE ≤ 0.10).

**Estado del arte (2026-09-27):**
- **M1 (MobileNetV2) = BASELINE OFICIAL** (congelado, no se re-entrena).
- **M2 (EfficientNet-B0) = CHALLENGER VALIDADO** (ejecutado oficialmente).
- **Decisión benchmark final PENDIENTE** (¿EfficientNet-B0 supera a MobileNetV2? → P4).

**Corrección RAM (2026-09-24):**
El intento de corrida en Colab T4 falló con **"Tu sesión ha fallado porque se ha usado toda la memoria RAM disponible"** (OOM de **RAM CPU** del runtime, no de VRAM). Auditoría forense determinó la causa raíz y se aplicó la corrección mínima autorizada (celdas 10, 20, 21 y 23 del notebook):

- `train_loader` / `val_loader` / `test_loader`: `num_workers=2 → 0` y `pin_memory=True → False` (elimina workers+prefetch sobre Drive FUSE; solo paralelismo de I/O, no altera entrenamiento ni métricas).
- Tras cada `plt.savefig(...)+plt.show()` se añadió `plt.close(fig)` en las 6 figuras (`train_val_curves`, `confusion_matrix`, `roc_1vRest`, `pr_per_class`, `calibration`, `error_analysis`) para liberar figuras/arrays y evitar acumulación si se re-ejecutan celdas.
- Validación post-parche: JSON válido, sintaxis/balance OK, `git diff` = solo las 9 ediciones autorizadas (11 ins/9 del), smoke test 19/19 OK de nuevo. Configuración científica intacta (SEED=42, BATCH=64, EPOCHS=40, PATIENCE=8, AdamW 3e-4/1e-4, CosineAnnealing, gates ≥0.955 / ≤0.10, `RUN_FINAL_TEST=False`).
- **Estado git:** el RAM fix está **SIN commitear** en el working tree (`notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb`). Commitear solo con orden explícita.
- Nota de mitigación adicional: si el run ya arrancó una vez, borrar `runs/M2_efficientnet_b0/metrics.csv` (modo append) antes de la corrida oficial.

**Auditoría benchmark/src (2026-09-24):** completada — **fallback aprobado** · **riesgo científico nulo**. Documento: `Documentacion/IA/AUDITORIA_BENCHMARK_SRC_FALLBACK.md`.

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
## PENDIENTES
## ════════════════════════════════

### PRIORIDAD 1 — Corrida oficial ✅ COMPLETADA
Ejecutada en **Colab T4** con Dataset V2+ real el **2026-09-27**. Resultados registrados arriba (macro-F1 0.9937 · balanced_acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · best epoch 32 · ≈4.66 h). Playbook previo ya no aplica (restart runtime / borrar metrics.csv / verificar DATA_ROOT eran precorrida).

### PRIORIDAD 2 — Recopilar artefactos ✅ COMPLETADA (documental)
Artefactos generados en `runs/M2_efficientnet_b0/` (config.json, validation_metrics.json, M2_VS_M1.json/.md, best/last.pth, metrics.csv, PNG). Resultados registrados en este documento para el análisis comparativo.

### PRIORIDAD 3 — Análisis científico M2 vs M1 (en curso)
Evaluar en `TABLA_COMPARATIVA_M1_M5.md`, con Δ con signo **M2 − M1**:
- Macro-F1 · ECE · Balanced Accuracy
- Parámetros · Tiempo por época · Coste computacional · Viabilidad edge

### PRIORIDAD 4 — Decisión benchmark PENDIENTE
**¿EfficientNet-B0 supera a MobileNetV2?**
- **SI** → nuevo candidato principal (`baseline_master_candidate`); documentar en `TABLA_COMPARATIVA_M1_M5.md` y manifiestos.
- **NO** → MobileNetV2 continúa como baseline dominante.
- Hasta la decisión: **M1 = baseline oficial · M2 = challenger validado**.

---

## ════════════════════════════════
## REPOSITORIO
## ════════════════════════════════

- **Rama actual:** `feature/ubtn-biological-telemetry`
- **Working tree:** modificaciones sin commitear (por orden) → `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` (RAM fix), `AGENTS.md`, `ESTADO_ACTUAL_BENCHMARKS.md`; nuevos: `AUDITORIA_BENCHMARK_SRC_FALLBACK.md`, `Documentacion/Arquitectura/FRONTEND_EXECUTION_STRATEGY.md`, `Documentacion/Arquitectura/CMSC_MASTERPLAN_v1.md`, `Documentacion/Arquitectura/CMSC_SIGNAL_MAP_v1.md`, `Documentacion/Arquitectura/CMSC_UI_ARCHITECTURE_v1.md`, `Documentacion/Arquitectura/CMSC_CANONICAL_STATE_v1.md`.
- **HEAD:** `18b95b1`
- **Benchmark (2026-09-27):** **M1 = baseline oficial (congelado)** · **M2 = EJECUTADO OFICIALMENTE (challenger validado)** — macro-F1 0.9937 · balanced_acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · best epoch 32 · ≈4.66 h. **Decisión final PENDIENTE (P4)**.
- **Frontend (2026-09-25):** hallazgo validado — `5173` = frontend **legacy** Docker (imagen 22-ago-2026, referencia) · `5174` = frontend **nuevo en evolución** (Vite Dev Server, laboratorio activo). Referencia canónica: `Documentacion/Arquitectura/FRONTEND_EXECUTION_STRATEGY.md`.
- **CMSC (2026-09-25):** diseño v1 del Centro de Modelado, Simulación y Ciencias Computacionales (núcleo científico; lab espectral pendiente, semilla Hackathon; multiagente; agnóstico). Referencia: `Documentacion/Arquitectura/CMSC_MASTERPLAN_v1.md`.
- **Mapa de señales (2026-09-25):** inventario total S01..S80 del ecosistema con estados honestos (solo 2 señales reales persistentes: temp/humedad V3 y RobotTelemetry; modelo productivo degenerado; UBTN en diseño). Referencia: `Documentacion/Arquitectura/CMSC_SIGNAL_MAP_v1.md` — prerrequisito para NO refactorizar el lab matemático.
- **Arquitectura de UI CMSC (2026-09-25):** experiencia visual/funcional del dashboard científico (Dashboard + vistas señales/espectral/matemática/IA/KH/ACP; texto/voz; integración labs/telemetría/agentes) — solo diseño, sin tocar componentes. Referencia: `Documentacion/Arquitectura/CMSC_UI_ARCHITECTURE_v1.md`.

**Commits registrados en esta cadena (relevant, asc → desc):**

| Commit | Fecha | Contenido |
|---|---|---|
| `18b95b1` | 2026-09-23 | **docs(session):** consolidar estado benchmark + plan de continuidad (AGENTS.md + ESTADO_ACTUAL_BENCHMARKS.md) |
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
9. **Intento de corrida Colab T4 (2026-09-24)** — falló con OOM de **RAM CPU** del runtime ("Tu sesión ha fallado porque se ha usado toda la memoria RAM disponible"). No es fallo del modelo: la causa raíz fue acumulación de memoria (DataLoaders con workers+prefetch sobre Drive FUSE y figuras matplotlib sin cerrar).
10. **RAM fix aplicado (2026-09-24)** — `num_workers=0` + `pin_memory=False` en los 3 DataLoaders y `plt.close(fig)` tras las 6 figuras (celdas 10, 20, 21, 23). Smoke test re-ejecutado 19/19 OK; diff mínimo (11 ins/9 del). **Sin commitear** (por orden).
11. **Corrida oficial M2 ejecutada (2026-09-27)** — EfficientNet-B0 entrenado en Colab T4 con Dataset V2+ real: macro-F1 0.9937 · Balanced Accuracy 0.9943 · ECE 0.0332 · Weighted-F1 0.9956 · best epoch 32 · ≈4.66 h. RAM fix validado · benchmark/src fallback validado · smoke test validado · validation gates PASS. **M2 = challenger validado · M1 = baseline oficial · decisión benchmark final PENDIENTE.**

---

*Honestidad de estado: M1 = resultado oficial fijo (baseline congelado); M2 = experimento EJECUTADO OFICIALMENTE (challenger validado, gates PASS). Decisión benchmark final pendiente (P4): M1 vs M2.*