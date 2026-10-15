# AI_R2_ONNX_EXECUTION_PLAN

**Misión:** `AI_R2_ONNX_EXECUTION_PLAN` — diseñar la exportación M2 → ONNX
**Naturaleza:** SOLO plan. **NO exportar · NO modificar código · NO entrenar · NO commits · NO push.**
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-14
**Base:** `AI_CANON_IMPLEMENTATION_DECISION_REPORT` (`AI_SERVING_ONNX`) · `docs/R5_AI_SERVING_STRATEGY_REPORT.md` (`R5_NOT_READY`) · `docs/AI_R1_EXECUTION_REPORT.md` (`AI_R1_EXECUTED`)

---

## 0. Dictamen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   CLASIFICACIÓN:   AI_R2_READY  (condicionado a P-A · P-B · P-C)             │
│                                                                               │
│   El diseño es completo, mínimo y reversible. La ejecución está bloqueada    │
│   por 3 precondiciones NO satisfechas hoy (entorno de export inexistente).   │
│   Si P-A (fidelidad de versión) no puede cerrarse → degrada a NOT_READY.      │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Precondiciones (bloqueantes para ejecutar, no para planificar):**

| ID | Precondición | Estado hoy |
|---|---|---|
| **P-A** | Entorno de export con **torch/torchvision = versión de entrenamiento** (`2.11.0+cu128` / `0.26.0+cu128`) — o decisión explícita de aceptar delta documentado | ❌ No existe local |
| **P-B** | `onnx` + `onnxruntime` instalados | ❌ Ausentes en todo el entorno |
| **P-C** | Confirmación de `D-serve` (exportar **M2**) | ⏳ Abierta |

## 0.1 Evidencia verificada (read-only, hoy)

| Elemento | Evidencia | Hecho |
|---|---|---|
| Artefacto fuente | `benchmark/runs/M2_efficientnet_b0/checkpoints/best.pth` | hash `3FDF86A7…BDFFABC3` · 48 768 106 B ✅ |
| Arquitectura | notebook M2: `tv_models.efficientnet_b0(weights=IMAGENET1K_V1)` + `model.classifier[1]=nn.Linear(in_features,16)` | `classifier[1].in_features=1280` |
| Checkpoint | notebook: `torch.save({"epoch",...,"model_state_dict":...})` | **dict de training**, no state_dict puro → extraer `.model_state_dict` |
| Preprocesado (val) | notebook: `Resize(256) → CenterCrop(224) → ToTensor → Normalize(mean,std)` | `IMAGENET_MEAN=[0.485,0.456,0.406]` · `STD=[0.229,0.224,0.225]` |
| Entorno de entrenamiento | notebook | `torch 2.11.0+cu128` · `torchvision 0.26.0+cu128` |
| Entorno local 1 | `benchmark/.venv` | `torch 2.5.1+cpu` · `torchvision 0.20.1+cpu` |
| Entorno local 2 | system `py` (3.11.9) | `torch 2.14.0+cpu` · `torchvision 0.29.0+cpu` |
| `onnx` / `onnxruntime` | import en venv y system | **ausentes** |
| Datos de paridad | `curated/validation` | **3 373 imágenes · 16 clases** ✅ (`split_lists/validation.csv`, 3 373 filas) |
| `holdout` | `holdout/real_world_holdout_v1` | **0** (vacío) |
| `ai_service` | `fastapi_app.py` · `requirements.txt` · `Dockerfile` | sirve `.h5`/`.keras` con **TensorFlow**; **sin** torch/onnxruntime; `context: ./src/ai_models`; `COPY . .` |

## 1. Plan exacto: M2 → ONNX

| Paso | Acción | Notas |
|---|---|---|
| **1** | Provisionar entorno aislado (venv) con `torch==2.11.0`, `torchvision==0.26.0`, `onnx`, `onnxruntime` (CPU), `numpy`, `Pillow` | Registra versiones exactas (P-A) |
| **2** | Reconstruir arquitectura: `m=tv_models.efficientnet_b0(weights=None); m.classifier[1]=nn.Linear(1280,16)` | Sin pesos preentrenados: la arquitectura, no ImageNet |
| **3** | Cargar pesos: `sd=torch.load(".../best.pth",map_location="cpu",weights_only=False)["model_state_dict"]; m.load_state_dict(sd)` | `strict=True`; verificar `epoch=32` |
| **4** | `m.eval()` (Dropout/BN a modo inferencia) y `m.to("cpu")` | Evita exportar grafo de entrenamiento |
| **5** | `dummy=torch.randn(1,3,224,224)` | |
| **6** | `torch.onnx.export(m, dummy, "model.onnx", opset_version=17, input_names=["input"], output_names=["logits"], dynamic_axes={"input":{0:"batch"},"logits":{0:"batch"}}, do_constant_folding=True)` | CPU; logits crudos (sin softmax) |
| **7** | `onnx.checker.check_model("model.onnx")` + inspección de ops/opset/IR | Gate técnico |
| **8** | Paridad dorada (§5/§6) | Gate científico |
| **9** | Registrar hashes, export record, model card, registry (§8) | Gobernanza |
| **10** | Cierre + handoff a AI-R3 | |

**Contrato ONNX fijado:**
```
input  : "input"  float32 [N,3,224,224]   (NCHW, raw 0-1, ImageNet-normalized)
output : "logits" float32 [N,16]          (sin softmax; argmax = class_index)
opset  : 17   ·   IR/opset revisados por onnx.checker
runtime: onnxruntime CPU (no se instala en ai_service aún)
```

## 2. Requisitos previos

| # | Requisito | Cubre |
|---|---|---|
| R1 | `best.pth` (hash `3FDF86A7…`) disponible | ya ✅ |
| R2 | Ambiente con `torch 2.11.0`/`torchvision 0.26.0` (o delta documentado) | **P-A ❌** |
| R3 | `onnx` + `onnxruntime` instalados | **P-B ❌** |
| R4 | Set de imágenes de validación local (3 373) para paridad | ya ✅ |
| R5 | `class_index_map` verificado (16 clases, orden ImageFolder) | ya ✅ (`model_registry.yaml`) |
| R6 | Confirmación `D-serve` = exportar M2 | **P-C ⏳** |
| R7 | Disco libre (ONNX ≈16 MB) | 14,0 GB ✅ |
| R8 | Definición de la ruta de export **ignorada por git** | §9 |

## 3. Riesgos

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| R2-1 | **Fidelidad de entorno**: exportar con torch ≠ 2.11.0 produce grafo/numerics distintos a los de entrenamiento | 🔴 | P-A; o registrar delta y re-basar la paridad en el torch de export |
| R2-2 | **Op no soportada / opset**: EfficientNet-B0 usa SiLU (Swish) + SqueezeExcitation (GlobalAveragePool) | Media | opset ≥14 (se elige 17); `onnx.checker` lo confirma |
| R2-3 | **Preproceso divergente**: `Resize(256)+CenterCrop(224)+Normalize(ImageNet)` ≠ el `resize(224)` actual del `ai_service` | 🔴 | Replicar el transform de validación en el pipeline ONNX (AI-R3) |
| R2-4 | **NCHW↔NHWC**: ONNX espera NCHW; el `.h5` actual usaba NHWC | Alta | Contrato §1; validar en paridad |
| R2-5 | **Logits vs softmax**: exportar softmax altera la paridad | Media | Exportar **logits**; softmax fuera |
| R2-6 | **Dropout/BN en train mode** | Alta | `m.eval()` explícito (paso 4) |
| R2-7 | **Checkpoint = dict** (no state_dict puro) → `load_state_dict` falla | Alta | Extraer `["model_state_dict"]` |
| R2-8 | **Axes dinámicos ausentes** → batch=1 fijo | Baja | `dynamic_axes` (paso 6) |
| R2-9 | **Reproducibilidad**: entorno de export no congelado (sin lock) | Media | Fijar versiones + `export_record.json` |
| R2-10 | **Mismatch de versión de onnxruntime** vs opset exportado | Baja | onnxruntime reciente (soporta opset 17) |
| R2-11 | **Falsos verdes**: paridad sobre pocas muestras no representativas | Media | Golden set determinista + validación sobre las 3 373 |
| R2-12 | **Horneado en imagen Docker** si el `.onnx` cae en `src/ai_models/` | Alta | §9: ubicación ignorada; no deployar en AI-R2 |

## 4. Rollback

| Escenario | Acción | Efecto |
|---|---|---|
| Export inválido / paridad fallida | Borrar `exports/model.onnx` | `best.pth` intacto; sin git (ignorado) |
| Docs | `git checkout` de los `.md`/`.yaml` | Reversible |
| Código/runtime | **AI-R2 no toca código ni `ai_service`** | Sin rollback funcional |
| Último recurso | Re-exportar desde `best.pth` verificado | `best.pth` es la fuente de verdad permanente |

## 5. Paridad dorada

**Definición:** conjunto fijo de entrada + comparación PyTorch(eval, CPU) ↔ ONNX Runtime(CPU) con **un mismo tensor preprocesado**.

- **Golden set:** N muestras deterministas de `curated/validation` (p. ej. las primeras 256 por `sample_id` ordenado, o 16×16 = una por par (clase, orden)), con `sample_id` + hash de píxeles registrados.
- **Preprocesado único** (idéntico en ambos): `Resize(256) → CenterCrop(224) → ToTensor → Normalize(ImageNet)`.
- **Comparación:** logits PyTorch vs logits ONNX por muestra.
- **Extensión:** validación sobre las **3 373** imágenes → recomputar macro-F1/ECE del ONNX y comparar con `validation_metrics.json`.

## 6. Cómo validar PyTorch vs ONNX

```python
import numpy as np, onnxruntime as ort
# mismo tensor x (float32, [1,3,224,224], preprocesado idéntico)
torch_logits = model(x).detach().cpu().numpy()
sess = ort.InferenceSession("model.onnx", providers=["CPUExecutionProvider"])
onnx_logits = sess.run(["logits"], {"input": x.numpy()})[0]

d = np.abs(torch_logits - onnx_logits)
max_abs, mean_abs = d.max(), d.mean()
agree = (torch_logits.argmax(1) == onnx_logits.argmax(1))
```
**Métricas a reportar:**
- `max_abs_diff`, `mean_abs_diff` (sobre logits)
- `argmax_agreement` (global y por clase)
- softmax: `max_abs_diff` de probabilidades, `mean_abs_diff`
- (opcional) correlación / KL entre distribuciones
- (extensión) Δmacro-F1, ΔECE sobre las 3 373

## 7. Tolerancias aceptables

| Métrica | Umbral | Razón |
|---|---|---|
| `max_abs_diff` (logits) | **≤ 1e-3** | criterio **G-NEW-A** de R5 |
| `mean_abs_diff` (logits) | ≤ 1e-4 | margen de ruido numérico FP32 |
| `argmax_agreement` (golden) | **= 100 %** | cero discrepancias de clase en el set canónico |
| `argmax_agreement` (3 373) | ≥ 99,9 % | tolerancia de casos límite |
| `max_abs_diff` (probabilidades) | ≤ 1e-3 | consistencia de confianza |
| Δmacro-F1 (3 373) | ≤ 0,001 | integridad del benchmark |
| ΔECE | ≤ 0,002 | calibración |

> Si `max_abs_diff > 1e-3` → **no se aprueba** (G-NEW-A falla). Si `argmax_agreement < 100 %` en el golden set → reevaluar preprocesado, no tolerar.

## 8. Artefactos esperados

| # | Artefacto | Ubicación | Versionado |
|---|---|---|---|
| 1 | `model.onnx` (≈16 MB) | `benchmark/runs/M2_efficientnet_b0/exports/` | ❌ ignorado |
| 2 | hash del ONNX (14.ª entrada de `CHECKSUMS.sha256` o `exports/model.onnx.sha256`) | idem | ❌ ignorado |
| 3 | `export_record.json` (versiones, opset, firma, hash de `best.pth`) | `.../exports/` + resumen en docs | ✅ doc |
| 4 | `golden_set.json` (sample_ids + hashes de entrada + argmax esperado) | `docs/ai/artifacts/` | ✅ |
| 5 | `parity_report.json` + `parity_report.md` | `.../exports/` + `docs/ai/artifacts/` | ✅ doc |
| 6 | `docs/ai/artifacts/M2_ONNX_EXPORT_RECORD.md` | docs | ✅ |
| 7 | `model_card.md` (sección ONNX) + `model_registry.yaml` (entrada ONNX + hash) | docs | ✅ |

## 9. Ubicación oficial

| Elemento | Ubicación recomendada | Motivo |
|---|---|---|
| **Binario `.onnx`** | `benchmark/runs/M2_efficientnet_b0/exports/model.onnx` | junto al artefacto fuente; **ignorado** (`.gitignore:20`); **no** se hornea en Docker |
| **Gobernanza (texto)** | `docs/ai/artifacts/` + `docs/ai/manifests/` | versionado; registra huella + ruta, nunca binarios |
| **Deployment (futuro, AI-R3)** | inyección en `ai_service` bajo misión explícita (volumen o `.dockerignore`) | `context: ./src/ai_models` + `COPY . .` **hornearía** el `.onnx` si se coloca ahí → prohibido en AI-R2 |

> **Regla:** en AI-R2 el `.onnx` vive **fuera** del contexto de build de Docker. Igual que el `.pth`, fuera de git.

## 10. Impacto por componente

| Componente | AI-R2 | Futuro (AI-R3+) |
|---|---|---|
| **ai_service** | **CERO** | Alto: sustituir TF por `onnxruntime`; nuevo `preprocess_image` (Resize256+CenterCrop224+Normalize, NCHW); `load_latest_model()` → `.onnx`; respuesta con 16 clases + nombres (G-3); `health` con `tensorflow=false, onnx=true`. Requiere misión explícita |
| **Docker Oficial** | **CERO** (sin rebuild) | `requirements.txt`: quitar `tensorflow-cpu`, añadir `onnxruntime`; imagen **más pequeña**; gestión de inyección del `.onnx` (`.dockerignore`/volumen); re-tag → OCI |
| **OCI** | **CERO** | El `.onnx` + `export_record` podrían publicarse como artefacto OCI versionado (junto al release) |
| **SIGCT Memory** | **CERO** | Registrar metadatos del modelo (id, hash, métricas) en la memoria canónica; hoy no se toca |
| **ACP** | **CERO** | El ACP consume salidas del modelo; requiere `contract_version v2` (16 clases) y `class_index_map`; el ACP no interviene en la exportación |
| **VoiceAssistant** | **CERO** | Comparte `/assist` (voz) pero es independiente de `/infer`; solo cambia si se modifica el contrato `/infer` (AI-R4 frontend) |

---

## 11. Roadmap

| Fase | Nombre | Gate de salida |
|---|---|---|
| **AI-R2.1** | **Congelar entorno de export** (torch/torchvision de entrenamiento + `onnx`/`onnxruntime`; `export_record` con versiones) | P-A · P-B · P-C cerradas |
| **AI-R2.2** | **Reconstruir arquitectura + cargar `best.pth` + `eval()`** (verificación de `epoch=32`, `strict=True`) | carga OK |
| **AI-R2.3** | **Export ONNX** (opset 17, batch dinámico, logits) + `onnx.checker` | grafo válido |
| **AI-R2.4** | **Golden set + paridad** (PyTorch↔ONNX; tolerancias §7) + `parity_report` | **G-NEW-A PASS** |
| **AI-R2.5** | **Gobernanza**: hashes + `export_record` + model card + registry | G-NEW-B (model_card+metrics+labels) |
| **AI-R2.6** | **Handoff a AI-R3** (serving neutral) — sin tocar `ai_service` | diseño AI-R3 listo |
| **AI-R2_COMPLETE** | Cierre: ONNX canónico versionado por huella, paridad dorada PASS, docs sincronizadas | ✅ |

> Mapeo de gates: **G-NEW-A** = paridad ≤1e-3 (AI-R2.4) · **G-NEW-B** = model_card + `validation_metrics.json` + `labels_v1.csv` (AI-R2.5) · **G-NEW-C** = artefacto inyectado, no horneado (AI-R3).

## 12. Clasificación

```
CLASIFICACIÓN: AI_R2_READY  (condicionado a P-A · P-B · P-C)
Plan completo y reversible. Ejecución bloqueada por:
  P-A entorno de export fiel al entrenamiento (torch 2.11.0/0.26.0)
  P-B onnx + onnxruntime ausentes
  P-C confirmación D-serve (exportar M2)
Si P-A no se satisface → degradar a AI_R2_NOT_READY (sesgo de fidelidad).
```

---

**NO exportado · NO modificado (código) · NO entrenado · sin commits · sin push.**

**Referencias:** `docs/AI_R1_EXECUTION_REPORT.md` · `docs/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md` · `docs/R5_AI_SERVING_STRATEGY_REPORT.md` · `docs/ai/artifacts/model_cards/M2_efficientnet_b0.model_card.md` · `docs/ai/manifests/model_registry.agriculture_v2.yaml` · `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` · `src/ai_models/{fastapi_app.py,requirements.txt,Dockerfile}` · `benchmark/{requirements.txt,config.yaml}` · `.gitignore:20`.
