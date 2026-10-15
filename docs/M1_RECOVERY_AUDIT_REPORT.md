# Auditoría de Recuperación — M1 (MobileNetV2)

**Documento:** `M1_RECOVERY_AUDIT_REPORT`
**Misión:** `M1_RECOVERY_AUDIT` (solo búsqueda forense y auditoría)
**Fecha:** 2026-10-14
**Reglas respetadas:** sin entrenamiento · sin generación de modelos · sin export ONNX · sin modificar código · sin commits · sin push.
**Continúa:** `docs/M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md` (`M2_RECOVERED`).

---

## 0. Dictamen

> ## `M1_PARTIAL`

**Las métricas y la evidencia científica de M1 están íntegramente recuperadas** (embebidas en el notebook canónico + dossiers documentales). **Los pesos/checkpoints NO existen en ningún soporte**: M1 no es reconstruible como modelo servible sin re-entrenar.

---

## 1. A — Qué artefactos reales de M1 existen

### 1.1 Pesos (checkpoints)
**NINGUNO.** No existe `best.pth`, `last.pth`, `.pt`, `.onnx` de M1 en ningún soporte del equipo.

### 1.2 Evidencia en el notebook `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb` (crudo del run)
| Evidencia | Contenido | Celda |
|---|---|---|
| Entorno | torch `2.11.0+cu130` · torchvision `0.26.0` · sklearn 1.6.1 · numpy 2.1.3 · **Tesla T4** | 11–12 |
| Dataset | `DATA_ROOT=/content/drive/MyDrive/SIGCTiArural/datasets/v1/curated` · 16 clases · train 15741 · val 3373 · test 3374 · total 22488 | 13–14 |
| Arquitectura | MobileNetV2 · **2 244 368 params** (2.24M total/trainable) + desglose por módulo | 18–19 |
| **Histórico de entrenamiento** | **40 epochs completas** (train_f1, val_f1, val_ece, lr, tiempo por época) | 24 |
| Cierre de entrenamiento | **`FIN: best_val_macro_f1=0.9899 @ epoch 38 · duración total 2.78 h`** | 24 |
| Métricas de validación | `macro_f1=0.9899` · `ece 0.0313` · `bal_acc 0.9898` · `weighted_f1 0.9902` | 25 |
| Tabla per-class (16) | P/R/F1 por clase + gate PASS | 28 |
| Peor F1 + parejas de confusión | 5 peores clases + top-8 pares off-diagonal | 29 |
| Test | celda protegida `RUN_FINAL_TEST=False` (test NO ejecutado) | 35 |
| Figuras embebidas | **9 PNG** (dataset card ×2, arquitectura, curvas/CM ×3, ROC/PR/calibración ×3) | 16,19,26,27,29 |

### 1.2 Inventario documental (`Documentacion/IA/Benchmark_M1_MobileNetV2/`)
`README.md` · `INFORME_TECNICO_CIENTIFICO_M1_APA7.md` · `MASTERDOC_EXPERIMENTO_M1.md` · `TABLA_COMPARATIVA_M1_M5.md` · `EVIDENCIA_EJECUCION_M1.md` · `CORRECCIONES_PARA_M2.md`.
Estados: **APROBADO · CONGELADO · BASELINE OFICIAL** — `experiment_id agriculture_v2_baseline_v2` / run `M1_mobilenetv2_001`.

## 2. B — Qué artefactos faltan

| Artefacto | Estado |
|---|---|
| `checkpoints/best.pth` | ❌ **FALTANTE (pesos perdidos)** |
| `checkpoints/last.pth` | ❌ **FALTANTE (pesos perdidos)** |
| `metrics.csv` (fichero) | ❌ faltante como fichero → ✅ recuperable del notebook (histórico 40 épocas) |
| `validation_metrics.json` (fichero) | ❌ faltante como fichero → ✅ recuperable (celdas 25/28/29) |
| `config.json` | ❌ faltante (metadatos reconstruibles de docs+notebook) |
| `test_metrics.json` | ❌ no existe (test single-use **no ejecutado**, `RUN_FINAL_TEST=False`) |
| 6 PNG (`plots/`) | ⚠️ no como ficheros; ✅ 9 figuras embebidas en el notebook |
| `model_card.md` (MobileNetV2) | ❌ no existe |

Estructura física en repo: `benchmark/runs/M1_mobilenetv2_001/{checkpoints,plots,report}` = **carpetas vacías** (gitignored; `git log` no registra contenido alguno).

## 3. C — Evidencia en el notebook

SÍ y es la fuente primaria más rica:
- **Histórico completo de entrenamiento** (40 épocas: `train_f1`, `val_f1`, `val_ece`, `lr`, tiempos).
- **Cierre exacto:** `best_val_macro_f1=0.9899 @ epoch 38` · duración **2.78 h** (dato que los dossiers marcaban "pendiente").
- **Métricas de validación** (macro_f1 0.9899 · ECE 0.0313 · bal_acc 0.9898 · W-F1 0.9902) y **desglose per-class de 16 clases** con P/R/F1.
- **Matriz de confusión** (visual, embebida) + **pares de confusión más frecuentes**.
- **9 figuras embebidas** (dataset card, arquitectura, curvas, CM, ROC, PR, calibración, error).
- **Sin pesos** y **sin test** (`RUN_FINAL_TEST=False`).

## 3.D — Qué evidencia existe en Drive

**Ninguna de M1.** El único export de Drive presente es **M2** (`runs-20261015T023028Z-1-001`, con solo `M2_efficientnet_b0`). No hay carpeta `M1_mobilenetv2_001` en Drive. El run M1 escribió en `/content/M1_mobilenetv2_001` (efímero) y **nunca se copió a Drive** (protocolo §3 de `EVIDENCIA_EJECUCION_M1.md` no ejecutado).

## 4. E — Qué evidencia existe en backups

**Ninguna.** Verificado:
- `.local_backups/` → solo `CMSC_MMC_2026_10_02`, `CMSC_SPECTRAL_FIX_2026_10_02`, `FRONTEND_HIGIENE_2026_10_12`, `Ollama_Quen.txt`. Sin M1.
- `stash@{0}` → `PRE_MULTI_AGENT_2026_09_29` (CMSC), sin relación con M1.
- Sin `*.pth/*.pt/*.onnx` en `Documents`, `Downloads`, `Desktop`, `OneDrive`.
- `%TEMP%\m2_smoke` → scaffold vacío (dataset sintético + dirs vacíos), sin M1.

## 5. F — Qué métricas pueden recuperarse

**TODAS las de validación** (son canónicas y están trazadas):

| Métrica (validation, best @ epoch 38) | Valor |
|---|---|
| macro-F1 | **0.9899** |
| ECE | **0.0313** |
| balanced_accuracy | 0.9898 |
| weighted_f1 | 0.9902 |
| best epoch | **38** |
| duración | **2.78 h** |
| params | **2 244 368** |

Más: histórico 40 épocas, per-class 16, peor-F1 y pares de confusión. **No recuperable:** `test_metrics.json` (test nunca ejecutado).

## 6. G — Qué checkpoints pueden recuperarse

**NINGUNO.** No hay pesos de M1 en disco, Drive, backups ni notebook. El checkpoint **no está embebido** en el `.ipynb` (solo la evidencia textual/visual).

## 7. H — ¿Puede reconstruirse M1 sin volver a entrenar?

| Dimensión | Reconstruible sin re-entrenar |
|---|---|
| Métricas / evidencia científica | ✅ **SÍ** (notebook + dossiers) |
| Historial y curvas | ✅ **SÍ** (notebook) |
| **Modelo servible (pesos)** | ❌ **NO** — pesos perdidos |
| Predicciones / inferencia | ❌ **NO** sin re-entrenar |
| Test metrics | ❌ **NO** (nunca ejecutado) |

Conclusión: **M1 es reconstruible como *evidencia*, NO como *modelo*.**

## 8. Clasificación

> ## `M1_PARTIAL`

- No es `M1_LOST`: la evidencia científica y las métricas canónicas están **completas y trazadas**.
- No es `M1_RECOVERED`: **faltan los pesos** → no hay modelo servible/auditable a nivel de tensores.

---

## 9. Preservación (NADA DESAPARECE)

- El **notebook embebe la única copia viva** del histórico y las figuras de M1 → tratarlo como artefacto canónico protegido.
- M1 documental (`Documentacion/IA/Benchmark_M1_MobileNetV2/`) intacto.
- `benchmark/runs/M1_mobilenetv2_001/` (dirs vacíos) se conserva como **registro del contrato**, no como artefacto.

## 10. Recomendaciones (sin ejecutar)

1. Extraer del notebook a ficheros (`metrics_m1.csv`, `validation_metrics_m1.json`, PNGs) bajo gobernanza, **sin re-entrenar** — misión posterior.
2. Si se necesita M1 servible, el re-entrenamiento **requiere orden explícita** (violaría el congelado del baseline).
3. `plant_disease_mbv2.h5` **no** sustituye a M1 (histórico, `ROTO`, doble normalización).
