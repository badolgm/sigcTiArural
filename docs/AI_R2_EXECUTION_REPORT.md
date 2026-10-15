# AI-R2 Execution Report

**mission:** `AI_R2_EXECUTION` · **date:** 2026-10-14
**precedente:** `docs/AI_R2_ONNX_EXECUTION_PLAN.md` (clasificación `AI_R2_READY`)
**decisión:** `D-serve = AUTORIZADO` (servir M2) · **alcance:** AI-R2.1 … AI-R2.5
**estado:** **`AI_R2_COMPLETE`** · gate `G-NEW-A = PASS`

---

## 0. Registro previo (versiones · hashes · entorno) — ANTES

**Artefacto origen (read-only, verificado):**

| Archivo | SHA-256 |
|---|---|
| `benchmark/runs/M2_efficientnet_b0/checkpoints/best.pth` | `3FDF86A7AAED770EFB582D2D3F0921D0B688F5E38E04F8125A927E4FBDFFABC3` |
| `benchmark/runs/M2_efficientnet_b0/checkpoints/last.pth` | `1996F10558DAAB603C7DFB4BB1B638E9B5D8A1340C100992BC9E0665D9E221F4` |

**Entorno de export (P-A/P-B cerradas):** entorno aislado en `…\Temp\opencode\air2\` (fuera del repo).

| Componente | Versión | Requisito del plan |
|---|---|---|
| PyTorch | `2.11.0+cpu` | = entrenamiento `2.11.0` ✅ |
| torchvision | `0.26.0` | = entrenamiento `0.26.0` ✅ |
| onnx | `1.23.2` | requerido (no existía) ✅ |
| onnxruntime | `1.31.0` | requerido (no existía) ✅ |
| numpy | `2.4.6` | — |

> Diferencia declarada: variante **CPU** vs entrenamiento **+cu128**. La arquitectura y los pesos no dependen del
> dispositivo; la paridad se mide dentro del mismo entorno (riesgo R2-1 acotado, ver §6).

## 1. ONNX generado — ✅

`benchmark/runs/M2_efficientnet_b0/exports/model.onnx` · **16 102 181 bytes** · `onnx.checker` OK.

- Reconstrucción: `efficientnet_b0(weights=None)` + `classifier[1]=Linear(1280,16)`; carga `["model_state_dict"]`
  con `strict=True`; `eval()`. Checkpoint **epoch 32**, **4 028 044** parámetros.
- Contrato: `input` float32 `[batch,3,224,224]` (NCHW) → `logits` float32 `[batch,16]` (**sin softmax**) ·
  opset **17** · IR **8** · batch dinámico · **239 nodos**.
- Exporter: TorchScript-based `torch.onnx.export` (`dynamo=False`).

## 2. Hash ONNX — ✅

```
model.onnx  =  4BD657B363407D4012F013589A5469DCA57B9C5E347A9EA54E1F6E57A3274EC3
```

Verificado de forma independiente (`Get-FileHash` = hash del script). Artefactos y hashes:

| Archivo (`exports/`) | SHA-256 |
|---|---|
| `model.onnx` | `4BD657B363407D4012F013589A5469DCA57B9C5E347A9EA54E1F6E57A3274EC3` |
| `golden_set.json` | `B5994A72530678C494184ADA83CFEDDEFD31862209E48925ED8022A1F5AFE192` |
| `export_record.json` | `08B80B70AD812D81E0DE8E38F434E956A0821794C7881F7C528C3EE76817C43D` |
| `parity_report.json` | `52030240368AA764DA578128080B925A61751F0D5307CB900DB24AA5A7CABC78` |

Índice: `exports/CHECKSUMS.sha256`.

## 3. Paridad — ✅

**Golden set (256 imgs · 16/clase · determinista):** `max_abs_diff` **1.5736e-04** · `mean_abs_diff` 4.78e-06 ·
`argmax_agreement` **1.0** (0/256 desacuerdos) · `max_abs_diff_softmax` 1.46e-06.

**Validación completa (3 373 imgs):**

| Métrica | PyTorch | ONNX | Δ |
|---|---|---|---|
| `argmax_agreement` | — | **1.0000** | — |
| `macro_f1` | 0.9936878552054299 | 0.9936878552054299 | **0.0** |
| `accuracy` | 0.9955529202490365 | 0.9955529202490365 | 0.0 |

El `macro_f1` ONNX **coincide exactamente** con `report/validation_metrics.json` → el grafo reproduce el modelo entrenado.

## 4. G-NEW-A — ✅ PASS

| Criterio | Umbral | Resultado |
|---|---|---|
| `max_abs_diff` golden | ≤ 1e-3 | 1.57e-04 ✅ |
| `argmax_agreement` golden | = 1.0 | 1.0 ✅ |
| `argmax_agreement` validación | ≥ 0.999 | 1.0 ✅ |
| `Δ macro_f1` | ≤ 0.001 | 0.0 ✅ |

## 5. G-NEW-B (identidad/gobernanza del modelo) — ✅ PASS

| Requisito | Estado |
|---|---|
| Model card | `docs/ai/artifacts/model_cards/M2_efficientnet_b0.model_card.md` (+ §7b ONNX) ✅ |
| `validation_metrics.json` | `benchmark/runs/M2_efficientnet_b0/report/validation_metrics.json` ✅ |
| Registro de modelo | `docs/ai/manifests/model_registry.agriculture_v2.yaml` (M2 con bloque `onnx` + roadmap AI-R2 `DONE`) ✅ |
| Registro de export | `docs/ai/artifacts/M2_ONNX_EXPORT_RECORD.md` ✅ |
| `class_index_map` | derivado de `ImageFolder` (sorted), 16/16, coherente con M1/M2 ✅ |

## 6. Riesgos (residuales)

| ID | Riesgo | Estado tras ejecución |
|---|---|---|
| R2-1 | Fidelidad de versión de export | **Acotado.** torch/tv = versión de entrenamiento; variante CPU declarada. |
| R2-2 | `state_dict` con prefijos inesperados | **Cerrado.** `strict=True` OK; epoch 32 = best. |
| R2-3 | Divergencia de preprocesado | **Cerrado.** Resize(256)+CenterCrop(224)+Normalize(ImageNet); paridad exacta. |
| R2-4 | Ejecución accidental de AI-R3 | **Cerrado.** `onnxruntime` solo en entorno de paridad; `ai_service` **no** tocado. |
| R2-5 | Logits vs softmax | **Cerrado.** Contrato = `logits` sin softmax, documentado. |
| R2-6 | Horneado del binario en imagen | **Cerrado.** `.onnx` fuera de `src/ai_models/`; en ruta gitignored. |
| R2-7 | Peso no ignorado por git | **Cerrado.** `benchmark/runs/` ignorado (`.gitignore:20`); verificado. |
| R2-8 | Sesgo de rendimiento CPU | **No evaluado** (no es objetivo de AI-R2; sin benchmark de latencia). |

## 7. Listo para AI-R3 — ✅ SÍ

**Criterios de entrada a AI-R3 satisfechos:** `.onnx` con hash fijo · contrato ONNX congelado · paridad exacta
(G-NEW-A) · model card + registry + registro de export presentes (G-NEW-B) · binario fuera del contexto Docker.

**Frontera AI-R2 ↔ AI-R3:** AI-R2 **no** integra `onnxruntime` en `src/ai_models`, **no** cambia `fastapi_app.py`,
`requirements.txt`, `Dockerfile` ni `docker-compose.yml`, y **no** sirve el modelo. Todo eso es AI-R3 (misión y
autorización explícitas).

---

## 7. (Registro de ejecución) AI-R2.1 … AI-R2.5

| Paso | Acción | Resultado |
|---|---|---|
| AI-R2.1 | Entorno de export aislado | torch 2.11.0+cpu · tv 0.26.0 · onnx 1.23.2 · onnxruntime 1.31.0 ✅ |
| AI-R2.2 | Reconstruir + cargar M2 | `strict=True`, epoch 32, 4 028 044 params ✅ |
| AI-R2.3 | Export ONNX | `model.onnx` 16 102 181 B, opset 17, batch dinámico ✅ |
| AI-R2.4 | Paridad dorada + validación | G-NEW-A PASS · Δmacro_f1 0.0 ✅ |
| AI-R2.5 | Gobernanza + trazabilidad | `export_record.json` · `golden_set.json` · `M2_ONNX_EXPORT_RECORD.md` · registry + model card ✅ |

**NO ejecutado (por diseño):** AI-R3 (`ai_service` neutral), AI-R4 (API v2/frontend), AI-R5 (holdout).

## 7.1 No tocado (invariantes respetadas)

CMSC · Dashboard · Labs · Knowledge Hub · Docker Oficial · OCI · SIGCT Memory — **sin cambios**.
Sin modificación de `src/ai_models/`, `docker-compose.yml`, código ni frontend. `best.pth`/`last.pth` intactos.
Sin `git add`, sin commits, sin push.

---

## Respuestas (resumen)

1. **ONNX generado:** sí — `exports/model.onnx`, 16 102 181 B, opset 17, batch dinámico.
2. **Hash ONNX:** `4BD657B3…74EC3`.
3. **Paridad:** exacta — `argmax` 1.0 en 256 y 3 373; `Δmacro_f1` 0.0; `max_abs_diff` 1.57e-04.
4. **G-NEW-A:** **PASS**.
5. **G-NEW-B:** **PASS** (model card + registry + export record + metrics).
6. **Riesgos:** R2-1 acotado (CPU declarado); R2-2…R2-7 cerrados; R2-7 confirmado por git; R2-8 no aplica.
7. **Listo para AI-R3:** **sí**, con frontera dura (no se tocó `ai_service`).
