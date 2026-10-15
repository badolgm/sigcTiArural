# Validación Forense de Artefactos M2

**Documento:** `M2_ARTIFACT_FORENSIC_VALIDATION_REPORT`
**Misión:** `M2_ARTIFACT_FORENSIC_VALIDATION` (solo validación de artefactos)
**Fecha:** 2026-10-14
**Reglas respetadas:** sin entrenamiento · sin conversión ONNX · sin modificar código · sin commits · sin push. Solo lectura.
**Supersede (para M2):** `docs/M1_M2_ARTIFACT_RECOVERY_REPORT.md` (que declaraba M2 `UNVERIFIED`). M1 permanece **no recuperado**.

---

## 0. Dictamen

> ## `M2_RECOVERED`

Los artefactos son **auténticos, internos y consistentes**, y **corresponden al run canónico M2 (EfficientNet-B0)** del notebook `SIGCTIARURAL_M2_EfficientNetB0.ipynb`. Todas las métricas coinciden bit a bit con lo declarado en el canon (`macro-F1 0.9937 · ECE 0.0332 · W-F1 0.9956 · BalAcc 0.9943 · best epoch 32`).

**Ubicación física (fuera del repo):**
`C:\Users\BagmDev\DevBadolgm\Proyectos\Locales\Archivos-sigctiArural\runs-20261015T023028Z-1-001\runs\M2_efficientnet_b0`
(carpeta con sello Google Drive/Colab `runs-<fecha>Z-1-001`, creada 2026-10-14 21:31 — export de Drive.)

---

## 1. A — ¿Qué contienen exactamente?

13 archivos · 65 665 990 B.

| Archivo | Bytes | Contenido | SHA-256 |
|---|---|---|---|
| `config.json` | 391 | metadatos de arquitectura y run | `4E04643F…F80F80D` |
| `metrics.csv` | 2 868 | curvas por epoch (8 columnas) | `0CF9C046…65A882F6` |
| `checkpoints/best.pth` | 48 768 106 | modelo + optimizer + métricas | `3FDF86A7…BDFFABC3` |
| `checkpoints/last.pth` | 16 391 461 | modelo (solo pesos) | `1996F105…65D9E221F4` |
| `report/validation_metrics.json` | 3 510 | métricas canónicas + CM 16×16 | `DD13897C…E4CA64AA` |
| `report/M2_VS_M1.json` | 1 005 | comparación M1/M2 | `88037503…0E3EC8A6A9` |
| `report/M2_VS_M1.md` | 472 | comparación (markdown) | `3241E49C…FB9CD3160B4` |
| `plots/train_val_curves.png` | 86 250 | curva train/val | `13EF562A…B9AAC52C8D` |
| `plots/confusion_matrix.png` | 129 055 | matriz de confusión | `F41BF344…CBEBD1FB2099` |
| `plots/roc_1vRest.png` | 45 278 | ROC 1-vs-rest | `95C0610C…A902054B5A2433` |
| `plots/pr_per_class.png` | 40 923 | PR por clase | `48B6CDCA…EEC768122D4E308` |
| `plots/calibration.png` | 59 401 | calibración (ECE) | `AD17D240…9406F7F40F5BB2` |
| `plots/error_analysis.png` | 137 270 | análisis de errores | `94DC6F5D…4BE0AF51212F` |

**Detalle de checkpoints (inspección del pickle torch):**

| | `best.pth` | `last.pth` |
|---|---|---|
| Claves top-level | `epoch`, `model_state_dict`, `optimizer_state_dict`, `macro_f1_val`, `ece_val` | `epoch`, `model_state_dict`, `macro_f1_val` |
| `epoch` | **32** | **40** |
| `macro_f1_val` | **0.9936878552054299** | 0.9925313209691962 |
| `ece_val` | **0.03321474453997425** | (no incluye) |
| Tensores en `model_state_dict` | 360 | 360 |
| Params (sin buffers) | **4 028 044** | **4 028 044** |
| 1er tensor | `features.0.0.weight (32,3,3,3)` | idem |
| Clasificador | `classifier.1.weight (16,1280)` | idem |

**`config.json`:** `arquitectura EfficientNet-B0` · `run M2_efficientnet_b0_001` · `n_params 4028044` · `macs 384555232` · `flops 769110464` · `size_fp32_mb 16.11` · `input 224x224x3` · `total_time_s 16781.3` (≈4.66 h) · `mean_time_epoch_s 419.5` · `best_epoch 32` · `best_val_macro_f1 0.9936878552054299`.

**`validation_metrics.json`:** `macro_f1 0.9936878552054299` · `weighted_f1 0.9955578564108665` · `balanced_accuracy 0.9943169418974069` · `per_class_precision/recall/f1` (16) · `confusion_matrix 16×16` · `ece 0.03321474453997425`.

## 2. B — ¿Corresponden al notebook `SIGCTIARURAL_M2_EfficientNetB0.ipynb`?

**SÍ — correspondencia exacta, elemento por elemento:**

| Seña del notebook | Artefacto | ✅ |
|---|---|---|
| `OUT = …/runs/M2_efficientnet_b0` con `checkpoints/`, `report/`, `plots/` | estructura del directorio | ✅ |
| `torch.save({epoch, model_state_dict, optimizer_state_dict, macro_f1_val, ece_val}, checkpoints/best.pth)` | claves de `best.pth` | ✅ idénticas |
| `torch.save({epoch, model_state_dict, macro_f1_val}, checkpoints/last.pth)` | claves de `last.pth` | ✅ idénticas |
| `report/validation_metrics.json` (impreso en celda ejecutada) | presente | ✅ |
| `plots/*.png` (6 savefig) | 6 PNG presentes | ✅ |
| EfficientNet-B0 · 16 clases · 224×224 | `n_params` 4 028 044 · `classifier (16,1280)` | ✅ |
| `size_fp32 ≈ 16.11 MB` (4 028 044×4 = 16 112 176 B) | `config.size_fp32_mb 16.11` | ✅ |
| `best_epoch 32` · `best_val_macro_f1 0.9937` | `config.json` + `best.pth` + `metrics.csv` | ✅ |

**Conclusión:** no es un artefacto improvisado ni de otro modelo; la firma (claves de guardado, nº de params, tamaños, best epoch) es la del notebook canónico.

## 3. C — ¿Qué métricas reales obtuvo M2?

Sobre **VALIDATION** (3 373 muestras = split canónico):

| Métrica | Valor |
|---|---|
| **macro-F1** | **0.993688** |
| **weighted-F1** | 0.995558 |
| **balanced accuracy** | 0.994317 |
| **accuracy** (derivada de la CM: 3 358/3 373) | 0.995553 |
| **ECE** | **0.033215** |
| Muestras en CM | **3 373** ✅ (coincide con el split canónico) |

Entrenamiento: 40 epochs · best epoch **32** · media 419.5 s/epoch · total **16 781.3 s ≈ 4.66 h**.

## 4. D — ¿Cuál fue el mejor checkpoint?

**`checkpoints/best.pth` — epoch 32** · `macro_f1_val = 0.9937` · `ece_val = 0.0332` · **con** `optimizer_state_dict` (por eso 48.8 MB). Es el checkpoint seleccionado por **macro-F1 de validación**. `last.pth` (epoch 40, 0.9925) es solo trazabilidad del early stop.

## 5. E — ¿Existe model selection?

**SÍ, y es honesta (solo validation):**

- Guardado de `best.pth` únicamente al mejorar `macro_f1_val`; `last.pth` cada epoch.
- `early stopping` por paciencia (best = 32; epochs 33–40 sin superar ⇒ parada en 40, coherente con `best_epoch 32` + 8).
- **Test single-use protegido:** `RUN_FINAL_TEST=False` ⇒ **no existe `test_metrics.json`** (la selección nunca vio test). Los PNG ROC/PR/calibración/error se calcularon sobre validation.
- **Anomalía de procedencia (no invalidante):** `metrics.csv` tiene **53 filas** con epochs **1–10 duplicados** ⇒ acumula ≥2 intentos previos (append) antes de la corrida final completa 1–40. El mejor (`0.9937` en epoch 32) y el último (`0.9925` en epoch 40) son inequívocos y coinciden con `best.pth`/`last.pth`.

## 6. F — ¿M2 es `RECOVERED` o `PARTIAL`?

> ## `M2_RECOVERED`

- Presentes y verificados **todos los artefactos producidos por el run**: `config.json`, `metrics.csv`, `validation_metrics.json` (con CM), `best.pth` (con optimizer), `last.pth`, **6/6 plots** y la comparación `M2_VS_M1`.
- Consistencia cruzada total: params = 4 028 044 (config = ambos checkpoints); `best_epoch` 32 en config = `metrics.csv` = `best.pth`; CM suma 3 373 = split de validación canónico; `0.9937/0.0332` idénticos al canon.
- **Residuales NO producidos por el run (por diseño):** `model_card.md` (entregable de gobernanza, humano) y `test_metrics.json` (test single-use postergado). No degradan la recuperación del run; si un gate exigiera `model_card.md` como parte del artefacto, bajaría a `M2_PARTIAL`.

## 7. G — ¿Queda cerrado el gate M1/M2?

**NO.** La recuperación **desbloquea** el gate, pero **no lo cierra**:

- `M2_VS_M1.json` declara a M2 «COMPETITIVO» (Δmacro-F1 **+0.0038** ≥ −0.005; ΔECE **+0.0019**), «se mantiene como `baseline_master_candidate`», y **explícitamente**: «la decisión final depende del test single-use».
- El **test single-use no se ejecutó** (protegido) ⇒ falta la evidencia de test.
- Falta la **decisión explícita de gobernanza** M1 vs M2 (baseline oficial vs promoción).
- Falta `model_card.md` de M2.

⇒ **Gate M1/M2: ABIERTO / PENDIENTE.** Estado: evidencia de comparación **verificable**, veredicto **sin cerrar**.

## 8. Consistencia y honestidad (hallazgos)

1. ✅ Métricas M2 idénticas al canon (`0.9937 / 0.0332 / 0.9956 / 0.9943 / epoch 32`).
2. ✅ Integridad: `best.pth`/`last.pth` son ZIP torch válidos; los 6 PNG tienen firma PNG correcta.
3. ✅ Tamaños coherentes con la arquitectura (fp32 16.11 MB; best con optimizer ≈48.8 MB; last ≈16.4 MB).
4. ✅ Split respetado: CM total = 3 373 = validation canónico (sin fuga de test).
5. ⚠️ `metrics.csv` con epochs 1–10 duplicados (varios intentos concatenados) — registro honesto, no invalida.
6. ❌ Falta `test_metrics.json` (test single-use no ejecutado — por diseño).
7. ❌ Falta `model_card.md`.
8. ⛔ M1 **sigue no recuperado** (su `benchmark/runs/M1_mobilenetv2_001/` local está vacío; su salida era efímera en `/content`).

## 9. Recomendaciones (solo propuesta, sin ejecutar)

1. **Preservar** el directorio M2 íntegro (hashes arriba) como artefacto canónico recuperado; mover o copiar bajo gobernanza con misión explícita (hoy fuera del repo).
2. Generar `model_card.md` de M2 (entregable de gobernanza, misión aparte).
3. Recuperar M1 (Drive `/content/M1_mobilenetv2_001` o re-extracción) — **sin** re-entrenar sin orden.
4. Antes de cerrar el gate M1/M2: ejecutar el **test single-use** bajo la celda protegida y emitir la **decisión de gobernanza**.
