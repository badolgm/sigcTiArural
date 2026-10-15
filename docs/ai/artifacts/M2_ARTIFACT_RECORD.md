# M2_ARTIFACT_RECORD

**Tipo:** Registro de artefacto (gobernanza) · **NO** contiene binarios
**Modelo:** M2 — EfficientNet-B0 (challenger)
**Registrado:** 2026-10-14 · **Misión:** `AI_R1_EXECUTION`
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`

> El repositorio versiona **la dirección y la huella** del artefacto, nunca una copia.
> Los binarios viven en `benchmark/runs/` (ruta **ignorada** por git, `.gitignore:20`).

---

## 1. Ubicación del artefacto

| Campo | Valor |
|---|---|
| Ruta canónica (local, no versionada) | `benchmark/runs/M2_efficientnet_b0/` |
| Contrato de ruta | `benchmark/runs/<modelo>/` (espeja `M1_mobilenetv2_001/`) |
| `run_id` (interior, `config.json`) | `M2_efficientnet_b0_001` |
| Convención de nombre fijada (C4) | **`M2_efficientnet_b0`** (dir) · run `M2_efficientnet_b0_001` |
| Ignorado por git | Sí — `git check-ignore -v` → `.gitignore:20 benchmark/runs/` |
| Origen (export externo, read-only) | `…\Locales\Archivos-sigctiArural\runs-20261015T023028Z-1-001\runs\M2_efficientnet_b0` |
| Archivos | **13** (+ `CHECKSUMS.sha256` generado) · **65 665 990 B** |

## 2. Hashes (SHA-256 · autoridad = `CHECKSUMS.sha256` en el propio run)

Verificados **byte-a-byte** entre origen y destino (13/13 coinciden). Formato `sha256sum`, rutas relativas, ASCII/LF.

| # | SHA-256 | Bytes | Ruta relativa |
|---|---|---|---|
| 1 | `3FDF86A7AAED770EFB582D2D3F0921D0B688F5E38E04F8125A927E4FBDFFABC3` | 48 768 106 | `checkpoints/best.pth` |
| 2 | `1996F10558DAAB603C7DFB4BB1B638E9B5D8A1340C100992BC9E0665D9E221F4` | 16 391 461 | `checkpoints/last.pth` |
| 3 | `4E04643F8C76FC49B5EE4196E63AFB8B143D6169D610466C2EE7D78FCF80F80D` | 391 | `config.json` |
| 4 | `0CF9C046D0F01D25A69BEF2983610BC5113C46F52427B79F02AA40C465A882F6` | 2 868 | `metrics.csv` |
| 5 | `AD17D2403F32CD2906BD96FB8C17455E0BD73B01D8607F0FAB9406F7F40F5BB2` | 59 401 | `plots/calibration.png` |
| 6 | `F41BF344E4D3A5064D938C10688AE15BA99535CB76D280AC932CBCEBD1FB2099` | 129 055 | `plots/confusion_matrix.png` |
| 7 | `94DC6F5DDB83073B6F95DC9157CB3108108535BDA4E53651D8174BE0AF51212F` | 137 270 | `plots/error_analysis.png` |
| 8 | `48B6CDCA16BB23A6677709D508C26263CB3446553B884B7A5EEC768122D4E308` | 40 923 | `plots/pr_per_class.png` |
| 9 | `95C0610C302F7F5DE4D0F5D85032FFC73D7FD6D002C13E0613A902054B5A2433` | 45 278 | `plots/roc_1vRest.png` |
| 10 | `13EF562AAC0D9EEA7A9928BAE12E7E20784322C68D5D9C2B553182B9AAC52C8D` | 86 250 | `plots/train_val_curves.png` |
| 11 | `8803750344BFF6D91FDB6EB503FF1D5421933ED1F0D954CC3537490E3EC8A6A9` | 1 005 | `report/M2_VS_M1.json` |
| 12 | `3241E49CD547BD15630F662CE6411F9D69D4C8B22C66CB5A45408FB9CD3160B4` | 472 | `report/M2_VS_M1.md` |
| 13 | `DD13897CF1276A8C97E5A182B241D3FACE44A5496701F942C4AFF6BAE4CA64AA` | 3 510 | `report/validation_metrics.json` |

**Verificación:** `Get-FileHash -Algorithm SHA256` sobre `benchmark/runs/M2_efficientnet_b0/` → **13/13 = origen**; `CHECKSUMS.sha256` regenerado leyendo el destino (C2).

## 2b. Lineage (cadena de procedencia)

```
Dataset v1  agriculture_images_tomato-potato-corn (22 488 imgs · 16 clases · 3 especies)
   │        raw_source_manifest.agriculture_v2_dataset_v2.yaml
   ▼
Split v1    split_lists/{train,validation,test}.csv · seed 42 · estratificado (split_manifest.agriculture_v2_split_v1.yaml)
   │        train 15 741 · validation 3 373 · test 3 374 (+ holdout vacío)
   ▼
Entrenamiento  notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb
   │        ImageFolder(DATA_ROOT/curated/train) · 224px · transfer learning
   │        torch 2.x + torchvision · 40 epochs · best epoch 32 · 16 781,3 s (~4,66 h)
   ▼
Run M2_efficientnet_b0_001
   │        config.json · checkpoints/{best,last}.pth · metrics.csv · report/ · plots/
   ▼
Export externo (read-only)  …\Archivos-sigctiArural\runs-20261015T023028Z-1-001\runs\M2_efficientnet_b0
   ▼
Copia verificada            benchmark/runs/M2_efficientnet_b0/   ← (esta misión AI-R1)
   ▼
Gobernanza (versionada)     docs/ai/artifacts/M2_ARTIFACT_RECORD.md · model_cards/M2_efficientnet_b0.model_card.md · manifests/model_registry.agriculture_v2.yaml
```

- **Comparador:** M1 MobileNetV2 (`M1_mobilenetv2_001`, `M1_PARTIAL`) — baseline oficial congelado; pesos no recuperados.
- **Gate vigente:** `M1_BASELINE_M2_CHALLENGER`. **Servir ≠ promover**.
- **Nota de reproducibilidad:** el split (`seed 42`) y el `class_index_map` (orden `ImageFolder`, §4) hacen el run reproducible en tanto el dataset v1 esté intacto.

## 3. Métricas (autoridad = `report/validation_metrics.json`)

| Métrica (VALIDATION) | Valor |
|---|---|
| macro_f1 | 0.9936878552054299 |
| weighted_f1 | 0.9955578564108665 |
| balanced_accuracy | 0.9943169418974069 |
| ece | 0.03321474453997425 |
| best epoch | 32 |
| accuracy (CM) | 3358 / 3373 = 0.995553 |
| test | **no ejecutado** (single-use reservado) |

- CM 16×16 suma **3 373** = split de validación canónico (sin fuga de test). Diagonal 3 358; 15 errores.
- ⚠️ `metrics.csv` tiene **53 filas** (epochs 1–10 duplicados por appends previos). `best.pth` (epoch 32) y `last.pth` (epoch 40, solo pesos) son inequívocos.

## 4. `class_index_map` (autoridad = orden `torchvision.ImageFolder`, alfabético)

| idx | clase | idx | clase |
|---|---|---|---|
| 0 | corn__cercospora_gray_leaf_spot | 8 | tomato__early_blight |
| 1 | corn__common_rust | 9 | tomato__healthy |
| 2 | corn__healthy | 10 | tomato__late_blight |
| 3 | corn__northern_leaf_blight | 11 | tomato__leaf_mold |
| 4 | potato__early_blight | 12 | tomato__mosaic_virus |
| 5 | potato__healthy | 13 | tomato__septoria_leaf_spot |
| 6 | potato__late_blight | 14 | tomato__target_spot |
| 7 | tomato__bacterial_spot | 15 | tomato__yellow_leaf_curl_virus |

> ⚠️ Este orden **≠** el de las filas de `labels_v1.csv` (agrupadas por `sample_id`).

## 5. Rollback

| Acción | Efecto |
|---|---|
| Borrar `benchmark/runs/M2_efficientnet_b0/` | Restaura estado previo; dir ignorado → **sin historia git** |
| Export externo | **Intacto** (read-only) → fuente última garantizada |
| Docs | Revertibles con `git checkout` |
| Código/Docker/`ai_service` | **No tocados** → sin rollback funcional |

---

**AI-R1 EXECUTADO · NO ONNX · NO export · NO `ai_service` · NO API v2 · NO frontend · NO Docker · sin commits · sin push.**
