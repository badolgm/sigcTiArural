# SIGCTiArural — Benchmark V1 Execution Playbook (Preparación de Ejecución Real)

**Documento:** SIGCTIARURAL_BENCHMARK_V1_EXECUTION_PLAYBOOK
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `5a079f4`
**Tipo:** Playbook operativo para PREPARAR la ejecución real del benchmark `agriculture_v2_baseline_v1`. **Modo actual: SOLO PREPARACIÓN — NO se entrena, NO se modifica dataset, NO hay commits.**
**Fuente rectora:** `SIGCTIARURAL_BENCHMARK_V1_PLAN.md` · `baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml` · Dataset V2 v1 (curated/ 22.488).
**Primer modelo:** **MobileNetV2** (control clásico — configured en el manifiesto como sanity/lower-bound; adición pendiente de gobernanza).

---

## 0. Estado del pipeline de datos (verificado 2026-09-23)

| Artefacto | Estado |
|---|---|
| RAW (16 clases, congelado read-only) | ✅ 22.488 |
| labels_v1.csv (8 campos) | ✅ 22.488 filas |
| split_v1 (70/15/15 · seed 42) | ✅ 15.741 / 3.373 / 3.374 |
| curated/{train,validation,test}/ (copias físicas) | ✅ 22.488 |
| CHECKSUMS.sha256 | ✅ 22.488+5 |
| dataset_card.md | ✅ |
| **¡TORCH NO INSTALADO en este entorno!** | ⚠️ requerido (ver §4) |

---

## 1. Pipeline de entrenamiento (diseño)

```
curated/train|validation|test/ (16 carpetas clase)
   │  torch.utils.data.ImageFolder + transformed (ver §1.1)
   ▼
DataLoader (batch 64 · num_workers 4 · shuffle train)
   ▼
Model backbone pretrained (ImageNet) + clasificador 16
   ▼
Criterio: CrossEntropyLoss con pesos por clase (weighted_loss)
   │  w_c = N / (n_c · |C|)   [manifiesto §28-31]
   ▼
Optimizador AdamW (3e-4 · wd 1e-4) · CosineAnnealingLR + warmup 3 epochs
   ▼
40 epochs máx. · early stopping patience 8 en macro-F1 VAL · restore best
   ▼
Curvas: roc/1vRest · pr/clase · calibration · ConfusionMatrix(16×16)
   │  → ECE por clase y global
   ▼
Outputs: metrics.json + checkpoints + graficas en results/ (ver §5)
   ▼ (SOLO AL FINAL)
Evaluación sobre TEST (1 uso único) → benchmark_report.md
```

### 1.1 Transformaciones (idénticas en los 5 modelos)
- **Train:** Resize(256) → RandomResizedCrop(224) → RandomHorizontalFlip + RandomVerticalFlip → RandomRotation(±15°) → ColorJitter(0,2/0,2/0,2/0,05) → ToTensor → ImageNet-normalize.
- **Val/Test:** Resize(256) → CenterCrop(224) → ToTensor → ImageNet-normalize.
- `random_state` global fijado a 42 (mismo seed del split).

### 1.2 Reproducibilidad
- `torch.manual_seed(42)` + `torch.cuda.manual_seed_all(42)` + `numpy.random.seed(42)` + `random.seed(42)`.
- `torch.backends.cudnn.deterministic = True`.
- `torch.utils.data.RandomSampler` seedeado; no barajado en val/test.

---

## 2. Entorno recomendado

| Componente | Recomendación |
|---|---|
| **SO** | Windows 11 (actual) — compatible con PyTorch CUDA |
| **Python** | 3.11.9 (ya instalado) |
| **Gestión de env** | venv dedicado `benchmark_v1` (aislar de numpy/pandas instalados) |
| **Hardware mín.** | **GPU NVIDIA ≥ RTX 3060 12GB** (ver §3) |
| **Driver** | NVIDIA driver actualizado (≥ 55x para CUDA 12.4) |
| **CUDA toolchain** | vía librería torch (no requiere CUDA Toolkit separado) |
| **Directorio de trabajo** | `C:\Users\BagmDev\DevBadolgm\Proyectos\GitHub\sigcTiArural\benchmark\` (nuevo) |

---

## 3. RTX mínima

| Criterio | Mínimo | Recomendado |
|---|---|---|
| **GPU** | **RTX 3060 12GB** | RTX 4070+ / 3090 24GB |
| **VRAM para MobileNetV2 (batch 64·AMP)** | ~3–4 GB | ≥ 8 GB |
| **Tiempo estimado MobileNetV2 (40 ep.)** | ~45 min | ~20–30 min |
| **Batch recomendado** | 64 (bajar a 32 si VRAM < 8 GB) | 64 (128 si VRAM ≥ 16 GB) |
| **FP16 AMP** | Sí (acelera ~2× en RTX 30xx) | Sí |

Sin GPU → NO viable (MobileNetV2 en CPU ≈ 8–12 h). Artefacto de decisión: elegir GPU disponible y anotar en `run_config.json`.

---

## 4. Dependencias exactas

**Verificado hoy:** sklearn 1.6.1 · numpy 2.1.3 · pandas 3.0.5 · pillow 12.3.0 · matplotlib 3.11.2. **Falta torch.**

| Paquete | Versión exacta | Nota |
|---|---|---|
| torch | **2.5.1+cu124** (o 2.6+ cu12x) | instalar via `pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu124` |
| torchvision | 0.20.1 (emparejado) | trae EfficientNet/MobileNet/ResNet/ConvNeXt pretrained |
| scikit-learn | 1.6.1 (ya) | metrics (macro-F1, balanced_accuracy) |
| numpy | 2.1.3 (ya) | |
| pandas | 3.0.5 (ya) | reportes |
| pillow | 12.3.0 (ya) | ImageFolder input |
| matplotlib | 3.11.2 (ya) | curvas/matrices |
| netcal (opcional) | ≥ 0.7 | ECE robusto con binning McKee; si no, ECE manual con 15 bins |

**Instalación recomendada (venv):**
```
py -3.11 -m venv C:\Users\BagmDev\DevBadolgm\Proyectos\GitHub\sigcTiArural\benchmark\.venv
C:\Users\BagmDev\DevBadolgm\Proyectos\GitHub\sigcTiArural\benchmark\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu124
pip install scikit-learn numpy pandas pillow matplotlib netcal
pip freeze > requirements.lock
```

---

## 5. Estructura de resultados

```
benchmark/
├── .venv/
├── requirements.lock
├── src/
│   ├── train.py            # entrenamiento + early stop + checkpoint
│   ├── eval.py             # evaluación final sobre validation (y test al final)
│   ├── metrics.py          # macro-F1, balanced_acc, ECE, curvas, CM
│   ├── datasets.py         # ImageFolder + weighted sampler + transforms
│   └── config.yaml         # hyperparams canónicos (ver §8)
├── runs/
│   └── M1_mobilenetv2_001/          # primer experimento (ver §8)
│       ├── config.json
│       ├── metrics_train.csv        # epoch · loss · macro-F1
│       ├── metrics_val.csv
│       ├── checkpoints/
│       │   ├── best_val_epoch_XX.pth
│       │   └── last.pth
│       ├── plots/
│       │   ├── train_val_curves.png
│       │   ├── confusion_matrix.png
│       │   ├── roc_1vRest.png · pr_per_class.png · calibration.png
│       └── report/
│           ├── metrics_summary.json  # macro-F1/E CE/bal_acc (val)
│           └── per_class.csv         # precision/recall/F1 × 16 clases
├── benchmark_report.md                # tabla comparativa final (5 modelos)
└── calibration_report.md              # ECE + temperature scaling
```

**Nombres de carpeta de run:** patrón `{M}{n}_{modelo}_{trial:03d}` → `M1_mobilenetv2_001`.

---

## 6. Métricas (alineadas al manifiesto + plan)

| Métrica | Definición | Dónde |
|---|---|---|
| macro-F1 | mean(F1 per class), sin ponderar | primary (val · test final) |
| balanced_accuracy | mean(recall per class) | secondary |
| per_class precision/recall/F1 | 16 filas por clase | report/per_class.csv |
| weighted-F1 | F1 ponderado por soporte | secondary |
| Confusion Matrix | 16×16, normalizada por fila | plots |
| ECE | avg|conf−acc| en 15 bins, + McKee si netcal | primary calibración |
| ROC 1-vs-rest / PR per class / calibration | curvas requeridas por manifiesto §42-45 | plots |

**Primaria global:** macro-F1 validation para early stop; **decisión de benchmark** se hará sobre test final una sola vez.

---

## 7. Checkpointing

| Regla | Especificación |
|---|---|
| Guardado | `torch.save({'epoch', 'model_state_dict', 'optimizer_state_dict', 'macro_f1_val', 'ece_val', 'config'}, ...)` |
| Frecuencia | cada mejor macro-F1 val (patience 8) + `last.pth` al final de cada epoch |
| Restore | best por macro-F1 val al terminar (no last) |
| Nombre | `best_val_epoch_XX.pth` (XX = epoch) |
| Seed | embebido en state_dict para trazabilidad |
| Retención | conservar best + last; los 5 runs completos de los 5 modelos |

---

## 8. Primer experimento

**Run goal:** sanear pipeline + fijar lower bound (MobileNetV2).

| Clave | Valor |
|---|---|
| data_root | `<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\curated` |
| model | mobilenet_v2 (torchvision, pretrained=True) |
| num_classes | 16 |
| batch_size | 64 |
| epochs | 40 (early stop patience 8, macro-F1 val) |
| optim | AdamW lr 3e-4 · wd 1e-4 |
| sched | CosineAnnealingLR (T_max=40) + warmup 3 |
| loss | CE weighted (w_c = N/(n_c·16)) |
| sampler | WeightedRandomSampler (class_balanced) + minority_augmented_sampling |
| fp16 | AMP on |
| seed | 42 |
| run_id | M1_mobilenetv2_001 |
| gate éxito | macro-F1 val ≥ 0.955 (rango plan §6) y ECE val ≤ 0.10 |

**Criterio de producto mínima viable del 1er run:** run completo + plots + per_class + checkpoint + macro-F1 dentro de rango esperado. Si F1 val < 0.90 → sospechar bug de balanceo/labels → STOP y revisar (no iterar contra test).

---

## 9. RESPONDE — comando que ejecutará Bernardo

**Preparación (instalar entorno, 1 vez):**
```
py -3.11 -m venv C:\Users\BagmDev\DevBadolgm\Proyectos\GitHub\sigcTiArural\benchmark\.venv
C:\Users\BagmDev\DevBadolgm\Proyectos\GitHub\sigcTiArural\benchmark\.venv\Scripts\Activate.ps1
pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu124
pip install scikit-learn numpy pandas pillow matplotlib netcal
```

**Lanzamiento del primer entrenamiento (MobileNetV2):**
```
python C:\Users\BagmDev\DevBadolgm\Proyectos\GitHub\sigcTiArural\benchmark\src\train.py --model mobilenet_v2 --config config.yaml --run-id M1_mobilenetv2_001 --data-root "C:\Users\BagmDev\DevBadolgm\Proyectos\GitHub\sigcTiArural\data\datasets\agriculture_images_tomato-potato-corn\v1\curated" --seed 42
```

*(Los `src/*.py` se escribirán en la misión de ejecución operativa, no ahora — esta misión solo prepara el diseño.)*

---

*Playbook de preparación del benchmark v1. Modo actual: SOLO PREPARACIÓN/DISEÑO: sin entrenar, sin modificar dataset, sin manifests, sin commits. La ejecución real (escribir src/, instalar torch, lanzar runs) requiere orden explícita de Bernardo + decisión de GPU.*