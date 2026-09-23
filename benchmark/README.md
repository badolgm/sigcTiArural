# Benchmark V1 — SIGCTiArural (Dataset V2 Recuperado)

Benchmark oficial `agriculture_v2_baseline_v1` sobre `agriculture_images_tomato-potato-corn` v1
(22.488 imágenes · 16 clases · 3 especies). Pipeline real, no diseño.

## Arquitecturas
| Modelo | Rol |
|---|---|
| mobilenet_v2 | control (primer run: M1_mobilenetv2_001) |
| mobilenet_v3_large | baseline_edge_candidate |
| efficientnet_b0 | baseline_master_candidate |
| resnet50 | classic_control |
| convnext_tiny | experimental_ceiling |

## Estructura
```
benchmark/
├── config.yaml            # hiperparámetros canónicos
├── requirements.lock
├── src/
│   ├── datasets.py        # ImageFolder + transforms + WeightedRandomSampler
│   ├── metrics.py         # macro-F1 · balanced_acc · ECE · CM · per-class
│   ├── models.py          # factory pretrained + head 16
│   ├── train.py           # entrenamiento + early stop + AMP + checkpoint
│   └── eval.py            # evaluación final + curvas ROC/PR/calibración
└── runs/
    └── M1_mobilenetv2_001/
        ├── config.json
        ├── metrics.csv
        ├── checkpoints/{best,last}.pth
        ├── plots/
        └── report/metrics_validation.json
```

## Uso
```powershell
# 0. entorno (ya creado en esta máquina con PyTorch CPU)
#    Si se ejecuta en máquina con GPU NVIDIA, reinstalar con CUDA:
#    py -3.11 -m venv .venv  (o reusar) ; .\.venv\Scripts\Activate.ps1
#    pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu124
#    pip install -r requirements.txt

# 1. entrenar primer modelo (control), con Python del venv
.\.venv\Scripts\python.exe src\train.py --model mobilenet_v2 --config config.yaml `
  --run-id M1_mobilenetv2_001 `
  --data-root "..\data\datasets\agriculture_images_tomato-potato-corn\v1\curated" --seed 42

# 2. evaluar sobre validation (y test una sola vez al final)
.\.venv\Scripts\python.exe src\eval.py --run-id M1_mobilenetv2_001 --partition validation `
  --data-root "..\data\datasets\agriculture_images_tomato-potato-corn\v1\curated"
```

## Entorno actual (2026-09-23)
- Máquina sin GPU NVIDIA (solo Intel UHD integrada) → PyTorch **CPU** (`torch==2.5.1+cpu`); `cuda_available=False`.
- El código es CUDA-ready: detecta GPU automáticamente y usa AMP si hay CUDA. Para el benchmark oficial con tiempos razonables se requiere **RTX 3060+** (playbook de ejecución).

## Nota
- Los experimentos corren desde `benchmark/` (los `runs/` se guardan relativos a cwd); `train.py` y `eval.py` usan rutas relativas `runs/<run-id>`. Ejecutar los comandos con `workdir` = `benchmark/`.

## Reglas
- test set: 1 uso final (prohibido iterar contra él).
- seed 42 (mismo que split).
- No modifica RAW ni manifests; data/ fuera de git (.gitignore:62).