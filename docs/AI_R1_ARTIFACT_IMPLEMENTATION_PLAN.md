# AI_R1_ARTIFACT_IMPLEMENTATION_PLAN

**Misión:** `AI_R1_ARTIFACT_IMPLEMENTATION_PLAN`
**Naturaleza:** SOLO plan de ejecución. **NO implementa · NO entrena · NO exporta ONNX · NO modifica código · NO toca Docker · NO commits · NO push.**
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-14 · **Regla:** toda afirmación anclada a disco/git/docs; lo no evidenciado se declara.

---

## 0. Dictamen

> # Clasificación: `AI_R1_READY`

El plan de incorporación de AI-R1 está **completo y es ejecutable**: los **13 artefactos de M2 existen y están verificados** (`M2_RECOVERED`), el destino canónico **ya existe y está gitignored** (`benchmark/runs/`), el gate está cerrado (`M1_BASELINE_M2_CHALLENGER`) y la gobernanza está congelada (`AI_CANON_HYBRID`, `H5_CLOSED`). No hay prerrequisito técnico faltante para materializar el artefacto.

> **Condiciones declaradas (no bloquean los READY, sí condicionan la ejecución):** (a) la decisión `D-serve` (qué artefacto se sirve: M2 disponible vs re-entrenar M1) sigue **abierta** — AI-R1 materializa **M2** como artefacto canónico ejercitable; (b) `model_card.md` **no existe** → es **entregable de AI-R1**, no un bloqueador; (c) `test_metrics.json` no existe **por diseño** (test single-use reservado); (d) M1 **no es materializable** (`M1_PARTIAL`, sin pesos).

> **Precisión:** AI-R1 = *materializar y registrar* el artefacto (sin servir, sin exportar). Servir ≠ promover: materializar M2 **no** altera el gate (`M1 baseline / M2 challenger`).

---

## 0.1 Estado verificado (read-only)

| Elemento | Evidencia | Hecho |
|---|---|---|
| Artefactos M2 | `...\Archivos-sigctiArural\runs-20261015T023028Z-1-001\runs\M2_efficientnet_b0` | **13 archivos · 65 665 990 B** (externo al repo) |
| Integridad | `M2_ARTIFACT_FORENSIC_VALIDATION_REPORT` | ZIP torch válidos · 6/6 PNG con firma · métricas bit-a-bit del canon |
| Destino canónico | `benchmark/runs/M1_mobilenetv2_001/{checkpoints,plots,report}` | estructura de runs **ya existe** (dirs vacíos) |
| Ignore | `.gitignore:20` `benchmark/runs/` · `:68` `/data/` | `git check-ignore -v` confirma: **ambos ignorados** |
| Ignore de pesos | `.gitignore` | **NO** hay regla global `.pth`/`.pt`/`.onnx` → fuera de `benchmark/runs/` **(serían comiteables)** |
| `model_cards/` | `Get-ChildItem -Filter model_cards` | **no existe** ningún dir |
| Manifiestos | `docs/ai/manifests/*.yaml` (8) · `data/.../v1/manifests/*.yaml` (8) | gobernanza de dataset; sin registro de **modelos** |
| Orden de clases | `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` (`tvd.ImageFolder`) | índice = **orden alfabético** de carpetas (torchvision) — **≠** orden de filas de `labels_v1.csv` |
| Gate | `M1_M2_GOVERNANCE_CLOSURE_REPORT` | `M1_BASELINE_M2_CHALLENGER` (cerrado) |

---

## 1. Q1 — Cómo incorporar M2 recuperado al proyecto

**Principio: copiar (nunca mover), verificar byte-a-byte, registrar la huella — nunca binarios en git.**

1. **Preservar el origen (NADA DESAPARECE):** el export externo (`...\runs-20261015T023028Z-1-001\...`) queda **intacto y read-only** como rollback último.
2. **Copiar** el directorio completo a la ubicación canónica **ignorada**: `benchmark/runs/M2_efficientnet_b0/` (espeja el contrato de `M1_mobilenetv2_001/`).
3. **Verificar paridad de copia:** recalcular SHA-256 de los 13 archivos y comparar contra `M2_ARTIFACT_FORENSIC_VALIDATION_REPORT §0/§1` (debe ser **idéntico**).
4. **Verificar carga (read-only):** `torch.load(..., map_location="cpu")` de `best.pth`/`last.pth` → 360 tensores, 4 028 044 params, `best.pth.epoch=32`. **No** exportar, **no** convertir.
5. **Registrar en documentos versionados** (hashes, métricas, model card, manifiesto) — **no** subir los binarios.
6. **No tocar** `src/ai_models/` (evita el horneado del modelo en la imagen Docker).

> **Anti-patrón explícito:** colocar el `.pth` en `src/ai_models/` (queda en el `COPY . .` del Dockerfile → viaja dentro de la imagen) o en un dir **no** ignorado (sería comiteado).

## 2. Q2 — Ubicación oficial del artefacto

> ## `benchmark/runs/M2_efficientnet_b0/`

- **Motivo:** es el **árbol de salidas de run** del proyecto (`benchmark/runs/`), ya ignorado por git (`.gitignore:20`), y donde ya existe la ranura M1 (`M1_mobilenetv2_001/`). Mantiene los pesos **fuera de git** pero **dentro** del proyecto.
- **Nombre:** `M2_efficientnet_b0` (coincide con el `OUT` del notebook; el `run` id interno es `M2_efficientnet_b0_001` según `config.json`).

**Alternativas evaluadas y descartadas:**

| Ubicación | Veredicto |
|---|---|
| `src/ai_models/production_models/` | ❌ Se hornea en la imagen Docker (`Dockerfile:21 COPY . .`); semántica de *modelo servido* aún no procede |
| `data/datasets/agriculture_images_tomato-potato-corn/v1/` | ❌ Mezcla datos con modelos; contamina `dataset_card.md`/`CHECKSUMS` |
| Dir versionado en git | ❌ Los pesos **nunca** se versionan |
| Nuevo `models/` en raíz | ➖ Válido pero redundante; rompe la convención `benchmark/runs/` |

## 3. Q3 — Cómo registrar (hashes · métricas · labels · model card · procedencia)

| Qué | Dónde (autoridad única) | Formato |
|---|---|---|
| **Hashes** | `benchmark/runs/M2_efficientnet_b0/CHECKSUMS.sha256` (ignorado) **+** copia versionada en `docs/ai/artifacts/M2_ARTIFACT_RECORD.md` | `SHA256  rutarelativa` (13 líneas) |
| **Métricas** | Autoridad = `report/validation_metrics.json` (artefacto) | Los docs **apuntan** a él + su hash; **no** se duplica como segunda fuente |
| **Labels (índice→clase)** | Autoridad = `labels_v1.csv`; **mapa del modelo** = orden alfabético `ImageFolder` | Registrar `class_index_map` (16 entradas) en el model card; ⚠️ **verificar y fijar** |
| **Model card** | `docs/ai/artifacts/model_cards/M2_efficientnet_b0.model_card.md` | nuevo (plantilla §4) |
| **Provenance** | `docs/ai/artifacts/M2_ARTIFACT_RECORD.md` | ruta origen, fechas, notebook, run id, hashes, `M2_VS_M1`, decisión D-serve |
| **Índice de modelos** | `docs/ai/manifests/model_registry.agriculture_v2.yaml` | nuevo (id, rol, hash `best.pth`, métricas, estado) |

**Regla de trazabilidad (anti doble-verdad):** el repo versiona **la huella + la dirección** del artefacto, **nunca una copia** de los binarios ni de las métricas; los documentos apuntan al artefacto por SHA-256 (misma regla que la gobernanza acústica §11).

## 3. Q3b — Registro de métricas (valores a fijar, del artefacto)

| Métrica (VALIDATION) | Valor |
|---|---|
| macro-F1 | 0.9936878552054299 |
| weighted-F1 | 0.9955578564108665 |
| balanced_accuracy | 0.9943169418974069 |
| accuracy (CM 3 358/3 373) | 0.995553 |
| ECE | 0.03321474453997425 |
| best epoch | 32 |
| test | **no ejecutado** (`test_metrics.json` ausente por diseño) |

- CM 16×16 suma **3 373** = split de validación canónico (sin fuga de test).
- ⚠️ `metrics.csv` = 53 filas (epochs 1–10 duplicados por appends previos) — se registra la **anomalía de procedencia**, no se "limpia".

## 4. Q4 — Estructura AI-R1 (artefactos)

```
benchmark/runs/M2_efficientnet_b0/            # IGNORADO por git (pesos fuera de git)
├── checkpoints/
│   ├── best.pth          (48 768 106 B · epoch 32)
│   └── last.pth          (16 391 461 B · epoch 40)
├── report/
│   ├── validation_metrics.json   (autoridad de métricas)
│   ├── M2_VS_M1.json
│   └── M2_VS_M1.md
├── plots/                       (6 PNG)
├── config.json                  (arquitectura · params · MACs/FLOPs · best_epoch)
├── metrics.csv                  (histórico; nota de duplicados)
└── CHECKSUMS.sha256             # NUEVO (generado en AI-R1)

docs/ai/artifacts/                           # VERSIONADO (gobernanza, sin binarios)
├── M2_ARTIFACT_RECORD.md                    # NUEVO: hashes + provenance + repro
└── model_cards/
    └── M2_efficientnet_b0.model_card.md     # NUEVO

docs/ai/manifests/
└── model_registry.agriculture_v2.yaml       # NUEVO: índice de modelos
```

## 5. Q5 — Preparar M2 → ONNX (sin exportar todavía)

**Definiciones a fijar en AI-R1** (para que AI-R2 sea mecánico):

| Aspecto | Definición |
|---|---|
| Framework origen | PyTorch (pesos `state_dict`); arquitectura **EfficientNet-B0** (16 clases) |
| Entrada ONNX | `float32 [N,3,224,224]` · `dynamic_axes={'input':{0:'batch'}}` |
| Opset | **17** (objetivo; a validar en AI-R2) |
| Preprocesado | **Replicar exactamente** el transform del notebook (Resize 224 · ToTensor · Normalize con mean/std ImageNet de torchvision). Riesgo crítico: paridad (doble normalización prohibida) |
| Salida | `logits[16]` → `argmax` → `class_index 0..15` en **orden alfabético ImageFolder** |
| Sidecars | `model_card.md` + `validation_metrics.json` + `class_index_map` (autoridad del índice) |
| Runtime destino | `onnxruntime` CPU (**no** instalar aún) |
| Paridad dorada | test N muestras: PyTorch logits ≈ ONNX ≤1e-3 (criterio A1 de R5) |

**No se exporta, no se instala runtime, no se modifica código.** Solo se dejan asentados los parámetros del contrato.

## 6. Q6 — Qué archivos (entregables de AI-R1)

| # | Archivo | Acción |
|---|---|---|
| 1 | `benchmark/runs/M2_efficientnet_b0/**` (13) | **copiar** (verificado) |
| 2 | `benchmark/runs/M2_efficientnet_b0/CHECKSUMS.sha256` | **nuevo** |
| 3 | `docs/ai/artifacts/M2_ARTIFACT_RECORD.md` | nuevo |
| 4 | `docs/ai/artifacts/model_cards/M2_efficientnet_b0.model_card.md` | nuevo |
| 5 | `docs/ai/manifests/model_registry.agriculture_v2.yaml` | nuevo |
| 6 | `docs/AI_R1_ARTIFACT_IMPLEMENTATION_PLAN.md` | **este documento** |

## 6. Q6b — Plantilla `model_card.md` (M2)

```
id: M2_efficientnet_b0            role: challenger
framework: PyTorch (state_dict)   architecture: EfficientNet-B0
params: 4 028 044                 input: 3x224x224 (float32)
preprocess: torchvision Resize(224)+ToTensor+Normalize(imagenet)
dataset: agriculture_images_tomato-potato-corn/v1 (16 clases · split seed 42)
metrics(val): macro-F1 0.9937 · ECE 0.0332 · W-F1 0.9956 · BalAcc 0.9943 · best epoch 32
class_index_map: <16 entradas · orden ImageFolder>
provenance: notebook M2 · run M2_efficientnet_b0_001 · export 2026-10-15
artifact_sha256: best.pth 3FDF86A7…  last.pth 1996F105…
status: challenger (no promovido) · test single-use: NO ejecutado
limitations: bootstrap de laboratorio ≠ validez de campo · ECE > M1
```

## 7. Q7 — Documentos a actualizar

| Documento | Cambio | ¿Ahora? |
|---|---|---|
| `docs/AI_MODEL_INVENTORY.md` | Añadir sección **CANÓNICO/HISTÓRICO** + M2 presente (path+hash) | Sí (AI-R1) |
| `docs/ai/manifests/baseline_experiment_manifest.agriculture_v2_baseline_v2.yaml` | Enlazar `model_registry` / huella M2 | Sí |
| `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` | M2: artefactos **materializados** (no solo "en Drive") | Sí |
| `docs/DOCS_MAP.md` | Registrar los 3 documentos nuevos | Sí |
| `docs/M1_M2_GOVERNANCE_CLOSURE_REPORT.md` | Addendum: artefacto materializado | Opcional |
| `AGENTS.md` / `docs/MASTERDOC.md` | Estado IA | **Solo con orden explícita** |

> La lista de §3 de `H5_AI_GOVERNANCE_CLOSURE_REPORT` (docs CMSC/diagramas) es un frente **aparte**; no bloquea AI-R1.

## 8. Q8 — Riesgos

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| R1 | Copia corrupta/parcial | Alta | SHA-256 byte-a-byte vs informe forense |
| R2 | **Datos sensibles: los binarios se comitean** | 🔴 | Destino en `benchmark/runs/` (ignorado); revisar `git status` antes de cualquier commit |
| R3 | `.pth` fuera de `benchmark/runs/` | Alta | No hay regla global `.pth`; no colocar en otros dirs |
| R4 | Horneado en la imagen Docker | Alta | Nunca en `src/ai_models/` |
| R5 | **Orden de clases erróneo** | 🔴 | `class_index_map` = orden **ImageFolder** (alfabético) ≠ filas de `labels_v1.csv`; fijar y verificar |
| R6 | Paridad de preprocesado | Alta | Test dorado en AI-R2 (definido, no ejecutado) |
| R7 | Doble fuente de verdad (métricas) | Media | Docs apuntan al artefacto por hash; no duplicar |
| R8 | Servir M2 = "promoción por decreto" | Alta | Restatar: servir ≠ promover; gate sigue M1 baseline/M2 challenger |
| R9 | Pérdida del export origen | Media | Origen read-only intacto (NADA DESAPARECE) |
| R10 | `metrics.csv` con epochs duplicados | Baja | Registrar la anomalía; best/last inequívocos |
| R11 | M1 no materializable | Media | AI-R1 cubre **solo M2**; M1 = evidencia; materializar M1 exige re-entrenar (orden explícita) |

## 9. Q9 — Rollback

- **Materialización:** borrar `benchmark/runs/M2_efficientnet_b0/` → el **export origen** sigue intacto (rollback trivial). Sin efecto en git (dir ignorado).
- **Documentos:** revertir por git (`checkout`) — son texto versionado.
- **Código/runtime:** AI-R1 **no** toca código, Docker ni el `ai_service` → **sin rollback funcional**.
- **Garantía:** ninguna operación borra el artefacto origen; el rollback nunca pierde la evidencia (`NADA DESAPARECE`).

---

## 10. Roadmap (contexto)

| Fase | Nombre | Estado |
|---|---|---|
| **AI-R1** | **Preparación de artefacto** (este plan) | **PLANIFICADO — READY** |
| AI-R2 | Export ONNX + paridad dorada | Pendiente (misión explícita) |
| AI-R3 | `ai_service` neutral (onnxruntime, artefacto inyectado) | Pendiente |
| AI-R4 | API v2 (16 clases) + Frontend | Pendiente |
| AI-R5 | Validación canónica (holdout) + cierre R5 | Pendiente |

---

## 11. Clasificación

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   CLASIFICACIÓN:   AI_R1_READY                                                │
│                                                                               │
│   · M2 recuperado, verificado y disponible (13 archivos).                    │
│   · Destino canónico existe e ignorado (benchmark/runs/).                    │
│   · Gate cerrado (M1 baseline / M2 challenger).                               │
│   · Plan completo: ubicación, hashes, model card, registro, preparación ONNX. │
│                                                                               │
│   Condiciones: D-serve abierta · model_card por autorar · test reservado ·    │
│                M1 no materializable.                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

**NO implementado · NO entrenado · NO exportado (ONNX) · NO modificado (código) · sin commits · sin push.**

**Referencias:** `docs/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md` (`AI_SERVING_ONNX`) · `docs/M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md` (`M2_RECOVERED`) · `docs/M1_RECOVERY_AUDIT_REPORT.md` (`M1_PARTIAL`) · `docs/M1_M2_GOVERNANCE_CLOSURE_REPORT.md` (`M1_BASELINE_M2_CHALLENGER`) · `docs/H5_AI_GOVERNANCE_CLOSURE_REPORT.md` (`H5_CLOSED`) · `docs/R5_AI_SERVING_STRATEGY_REPORT.md` · `.gitignore:20,68` · `data/datasets/agriculture_images_tomato-potato-corn/v1/{dataset_card.md,labels/labels_v1.csv,manifests/*}` · `docs/ai/manifests/baseline_experiment_manifest.agriculture_v2_baseline_v2.yaml` · `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb`.
