# M2 ONNX Export Record

**mission:** `AI_R2_EXECUTION` · **date:** 2026-10-14
**model:** `M2_efficientnet_b0` (EfficientNet-B0) · **role:** `challenger` · gate `M1_BASELINE_M2_CHALLENGER`
**serving_strategy:** `AI_SERVING_ONNX` — **exportado ≠ servido · servir != promover**

---

## 1. Artefacto exportado

| Campo | Valor |
|---|---|
| Ruta | `benchmark/runs/M2_efficientnet_b0/exports/model.onnx` |
| Tamaño | 16 102 181 B (15,36 MiB) |
| SHA-256 | `4BD657B363407D4012F013589A5469DCA57B9C5E347A9EA54E1F6E57A3274EC3` |
| Origen | `checkpoints/best.pth` |
| SHA-256 origen | `3FDF86A7AAED770EFB582D2D3F0921D0B688F5E38E04F8125A927E4FBDFFABC3` |
| Época del checkpoint | 32 |
| Parámetros | 4 028 044 |
| Directorio gitignored | sí (`benchmark/runs/`, `.gitignore:20`) |

## 2. Entorno de export (fiel a entrenamiento — P-A)

| Componente | Versión |
|---|---|
| PyTorch | **2.11.0+cpu** (igual que entrenamiento `2.11.0+cu128`, variante CPU) |
| torchvision | **0.26.0** (igual que entrenamiento) |
| numpy | 2.4.6 |
| onnx | 1.23.2 |
| onnxruntime | 1.31.0 |

> Entorno aislado en `…\Temp\opencode\air2\` (fuera del repo). El `.onnx` se exporta en CPU;
> la arquitectura y los pesos no dependen del dispositivo.

## 3. Contrato ONNX

| Campo | Valor |
|---|---|
| Input | `input` · `float32` · `[batch, 3, 224, 224]` (NCHW) |
| Output | `logits` · `float32` · `[batch, 16]` (**sin softmax**) |
| Opset | 17 |
| IR version | 8 |
| Batch dinámico | sí (`dynamic_axes` en eje 0 de input y output) |
| Nodos | 239 |
| Exporter | TorchScript-based `torch.onnx.export` (`dynamo=False`) |
| `onnx.checker` | OK |

## 4. Paridad (G-NEW-A) — RESULTADO

**Golden set:** 256 imágenes (16 primeras por clase) · `golden_set.json`

| Métrica | Valor |
|---|---|
| `max_abs_diff` (logits) | **1.5736e-04** |
| `mean_abs_diff` (logits) | 4.782e-06 |
| `argmax_agreement` | **1.0000** (0 desacuerdos / 256) |
| `max_abs_diff_softmax` | 1.4603e-06 |

**Validación completa:** 3 373 imágenes

| Métrica | PyTorch | ONNX |
|---|---|---|
| `argmax_agreement` | — | **1.0000** |
| `macro_f1` | 0.9936878552054299 | 0.9936878552054299 |
| `accuracy` | 0.9955529202490365 | 0.9955529202490365 |

| Criterio G-NEW-A | Umbral | Resultado | Estado |
|---|---|---|---|
| `max_abs_diff` golden | ≤ 1e-3 | 1.57e-04 | ✅ |
| `argmax_agreement` golden | = 1.0 | 1.0 | ✅ |
| `argmax_agreement` validación | ≥ 0.999 | 1.0 | ✅ |
| `Δ macro_f1` | ≤ 0.001 | 0.0 | ✅ |

**G-NEW-A = PASS.** El `macro_f1` ONNX **coincide exactamente** con `report/validation_metrics.json`
(0.9936878552054299), lo que confirma que el grafo exportado reproduce el modelo entrenado.

## 5. Artefactos de export

| Archivo | SHA-256 |
|---|---|
| `exports/model.onnx` | `4BD657B363407D4012F013589A5469DCA57B9C5E347A9EA54E1F6E57A3274EC3` |
| `exports/golden_set.json` | `B5994A72530678C494184ADA83CFEDDEFD31862209E48925ED8022A1F5AFE192` |
| `exports/export_record.json` | `08B80B70AD812D81E0DE8E38F434E956A0821794C7881F7C528C3EE76817C43D` |
| `exports/parity_report.json` | `52030240368AA764DA578128080B925A61751F0D5307CB900DB24AA5A7CABC78` |

Índice: `benchmark/runs/M2_efficientnet_b0/exports/CHECKSUMS.sha256` (4 líneas, LF, ASCII).

---

**NO servido · NO promovido · no versionado (ruta gitignored) · gate `M1_BASELINE_M2_CHALLENGER` intacto.**
