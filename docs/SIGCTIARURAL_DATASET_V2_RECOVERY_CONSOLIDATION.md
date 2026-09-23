# SIGCTiArural — DATASET V2 RECOVERY CONSOLIDATION (Baseline Oficial Recuperado)

**Documento:** SIGCTIARURAL_DATASET_V2_RECOVERY_CONSOLIDATION
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `5a079f4`
**Tipo:** Consolidación documental de la RECUPERACIÓN del Dataset V2 desde el origen físico real (MISIÓN DATASET V2 RECOVERY CONSOLIDATION).
**Modo:** DOCUMENTACIÓN. Se actualizaron 6 documentos de la cadena V2 + 1 inventario research_v2. NO se tocó el dataset original (`D:\RespaldoData\PlantVillage-Dataset`), NO se submuestreó, NO se eliminó ninguna imagen, NO se hizo commit.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado (real/referencia/simulación/diseño). NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
**Decisión adoptada por Bernardo:** **Opción A** — el Dataset V2 oficial se ajusta a la realidad física del origen recuperado. **NO submuestrear, NO eliminar imágenes.**

---

## 0. Decisión consolidada

> El Dataset V2 deja de definirse por el valor objetivo del inventario de diseño (21.160) y pasa a definirse por el **conteo físico verificado** del origen recuperado: **22.488 imágenes / 16 clases / 3 especies**.

**Origen oficial:** `D:\RespaldoData\PlantVillage-Dataset` — repo oficial `spMohanty/PlantVillage-Dataset`.
- `raw/color` = **54.305 archivos** (54.303 `.jpg` + 1 `.jpeg` + 1 `.png`) · **38 clases** · **~0.79 GB**.
- Subset V2 (16 clases) = **22.488** (única divergencia: `Tomato___Septoria_leaf_spot` 1.771 vs 443 del inventario; las otras 15 clases coinciden 1:1).
- Pressure conservador: subset a copiar ocupa **~0.32 GB**; disco C: **19.06 GB libres** (margen >50×). Sin necesidad de Kaggle ni descarga.

---

## 1. ¿Qué documentos quedaron desactualizados?

| Documento | Tipo | Estado antes | Estado tras esta misión |
|---|---|---|---|
| `SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` | Plan | 21.160/16/3; Septoria 443; minoritarias obsoletas | ✅ Actualizado (22.488) |
| `SIGCTIARURAL_DATASET_V2_EXECUTION_PLAN.md` | Plan operativo | 21.160; origen "no existe"; pasos de descarga | ✅ Actualizado (22.488 + origen recuperado) |
| `SIGCTIARURAL_DATASET_V2_INVENTORY.md` | Inventario V2 | "dataset NO EXISTE"; bloqueante #1 | ✅ Actualizado (recuperado 22.488) |
| `SIGCTIARURAL_DATASET_V2_READINESS_REPORT.md` | Readiness | PlantVillage NO EXISTE; bloqueante total | ✅ Actualizado (recuperado, F0 sin descarga) |
| `SIGCTIARURAL_PHASE0_EXECUTION_GUIDE.md` | Guía Fase 0 | conteo 21.160; Kaggle; source_root inexistente | ✅ Actualizado (22.488; origen real) |
| `SIGCTIARURAL_PHASE0_EXECUTION_CHECKLIST.md` | Checklist F0 | gates 21.160; Kaggle prioritario | ✅ Actualizado (22.488; origen local) |
| `AGRICULTURE_AI_V2_DATASET_INVENTORY.md` (research_v2) | Inventario canónico research_v2 | 21.160 (tabla clave) | ✅ Actualizado con bloque de consolidación (NADA DESAPARECE) |

**Documentos que quedan desactualizados y NO se tocaron en esta misión** (fuera del alcance de los 6 + 1; requieren misión/sincronización separada):
- `SIGCTIARURAL_PHASE0_READYCHECK.md` — referencia gate 21.160 y bloqueante Kaggle (líneas 44, 103).
- `AI_TRAINING_PIPELINE_V2.md` (`docs/ai/research_v2/`) — línea 294 con Septoria 443.
- `AI_DATASET_DISCOVERY_AND_AUDIT.md` (`docs/ai/research_v2/`) — 52.977/443 del audit global.
- `AI_DATASET_STRATEGY_V2.md` (`docs/ai/research_v2/`) — conteos del scope original.
- `AI_CONTEXT_V2_REMEDIATION_REPORT.md` (`docs/ai/research_v2/`) — referencias numéricas V2.
- `AI_PIPELINE.md` (`docs/`) — rutas/conteos heredados.
- `MASTER_PROJECT_INVENTORY_AUDIT.md` (`docs/project_knowledge_base/governance/`) — inventario maestro global.
- **Los 5 manifests canónicos** (`docs/ai/manifests/*.yaml`) — declaran `expected_images: 21160`; **NO se modifican en esta misión** (artefactos de gobernanza; actualización = decisión separada de Bernardo).

---

## 2. ¿Qué debe corregirse?

1. **`raw_source_manifest.agriculture_v2_dataset_v1.yaml`** (canónico): `expected_images: 21160` → **22488** y `source_root` → `D:\RespaldoData\PlantVillage-Dataset` (decisión gobernada; NO es parte de esta misión).
2. **PHASE0_READYCHECK + research_v2** listados en §1: sincronizar conteos a 22.488 cuando Bernardo lo ordene.
3. **Fase 0 (mecánica, próximo paso):** copiar las 16 carpetas de `raw/color` → `data/datasets/agriculture_images_tomato-potato-corn/v1/RAW/` con rename canónico, verificar conteos 22.488, generar `CHECKSUMS.sha256`, congelar RAW. **Ya no depende de Kaggle ni credenciales.**
4. **Minoritarias a `double_reviewed`:** cambiar el set vigente (ver §3) en labels_v1.csv y specs derivadas.

---

## 3. ¿Qué métricas cambian?

| Métrica | Antes (inventario diseño) | **Ahora (físico verificado)** |
|---|---|---|
| Total imágenes | 21.160 | **22.488** (+1.328 = +6.3%) |
| Clases | 16 | **16** (sin cambio) |
| Especies | 3 | **3** (sin cambio) |
| `Tomato___Septoria_leaf_spot` | 443 (2.09%) | **1.771 (7.88%)** — ya NO es minoritaria |
| `Tomato___Leaf_Mold` | 952 (4.50%) | **952 (4.23%)** — nueva 4ª minoritaria |
| `tomato__yellow_leaf_curl_virus` | 5.357 (25.32%) | **5.357 (23.82%)** |
| Potato healthy | 152 (0.72%) | **152 (0.68%)** — sigue clase mínima |
| Promedio por clase | 1.322,5 | **1.405,5** |
| Ratio max/min | 35.24× | **35.24×** (sin cambio: mismas clases min/max) |
| Peso subset 16 clases | ~1.0–2.5 GB (estimado) | **~0.32 GB (verificado)** |
| Disco requerido | ≥ 20 GB | **~1 GB (19.06 GB libres en C:)** |

**Nuevas 4 clases minoritarias (doble revisión + PR obligatoria):**
1. `potato__healthy` — 152 (0.68%)
2. `tomato__mosaic_virus` — 373 (1.66%)
3. `corn__cercospora_gray_leaf_spot` — 513 (2.28%)
4. `tomato__leaf_mold` — 952 (4.23%)

---

## 4. ¿Qué NO cambia?

- **Identidad y estructura:** `agriculture_images_tomato-potato-corn` v1 (taxonomy_v1 · label_schema_v1 · split_v1), 16 clases cerradas, 3 especies (Tomato 9 / Potato 3 / Corn 4).
- **Taxonomía y exclusión:** solo `raw/color`; prohibidos `grayscale` / `segmented` / `generated_for_paper` / `Tomato___Spider_mites Two-spotted_spider_mite`.
- **Split spec:** 70/15/15, seed 42, `stratified_group_split`, anti-fuga (dedup + pHash), `split_v1` inmutable.
- **Benchmark spec:** 4 arquitecturas + MobileNetV2 como control negativo; macro-F1 (primaria), ECE (puerta), curvas ROC/PR/calibración por clase.
- **Manifiestos de diseño:** los 5 YAML siguen siendo autoridad de gobierno (solo pendiente `expected_images`/`source_root`).
- **Invariante científico:** bootstrap de laboratorio ≠ validez de campo; `real_world_holdout_v1` intocable.
- **Formato del pipeline:** resize 224 en entrenamiento (no en dataset), batch 32, weighted loss + class-balanced sampling + minority augmentation (sin undersampling ciego).
- **Gobernanza:** datasets versionados por manifiesto + checksum, no por git; commits de código siguen prohibidos sin orden explícita.

---

## 5. Nuevo baseline oficial — "Dataset V2 Oficial Recuperado"

```
Identidad:        agriculture_images_tomato-potato-corn  v1  (taxonomy_v1 · labels_v1 · split_v1)
Estado:           REAL (físico verificado 2026-09-23)
Imágenes RGB:     22.488
Clases:           16   ·  Especies: 3  (Tomato 9 · Potato 3 · Corn 4)
Origen:           D:\RespaldoData\PlantVillage-Dataset\raw\color
                  (repo oficial spMohanty/PlantVillage-Dataset; 54.305 archivos/38 clases/~0.79 GB)
Subset a copiar:  ~0.32 GB ·  solo las 16 clases del scope
Divergencia única: Tomato___Septoria_leaf_spot = 1.771 (vs 443 inventario)  →  resta 15/15 clases = 1:1
Minoritarias:     potato__healthy=152 · mosaic_virus=373 · cercospora_gray_leaf_spot=513 · leaf_mold=952
Ratio desbalance: 35.24× (max YLCV 5.357 / min potato healthy 152)
Exclusiones:      grayscale · segmented · generated_for_paper · Spider-mites
Split:            70/15/15 · seed 42 · stratified_group_split · anti-fuga
Benchmark:        EfficientNet-B0 · MVoNetV3-Large+TFLite · ResNet50 · ConvNeXt-Tiny (+MVoNetV2 control)
Salida:           labels_v1.csv (22.488 filas) · split_lists/*.csv · curated/ · CHECKSUMS.sha256
```

**Definición formal del "Dataset V2 Oficial Recuperado":**
> Es el subconjunto de 16 clases de `raw/color` del PlantVillage recuperado en `D:\RespaldoData\PlantVillage-Dataset`, con **22.488 imágenes** verificadas físicamente, **sin submuestreo**, **sin eliminación de imágenes** y sin re-negociación del scope taxonómico (las 16 clases y 3 especies del diseño V2 se mantienen idénticas). El baseline oficial deja de ser un objetivo declarado (21.160) y pasa a ser un **hecho físico medido** (22.488), con `Tomato___Septoria_leaf_spot` = 1.771 como única clase divergente respecto al inventario de diseño. Todo el resto de la cadena documental (split, benchmark, manifests de diseño, exclusions, invariante bootstrap≠campo) permanece sin cambios.

---

## RESULTADO FINAL

1. **Bloqueante de origen: RESUELTO.** PlantVillage existe físicamente en la máquina (`D:\RespaldoData\PlantVillage-Dataset`); no requiere Kaggle, credenciales ni descarga.
2. **Baseline oficial consolidado:** **22.488/16/3** — Opción A (sin submuestreo, sin borrado de imágenes).
3. **Cadena documental V2 actualizada (7 docs):** MASTERPLAN · EXECUTION_PLAN · INVENTORY (V2 + research_v2) · READINESS_REPORT · PHASE0_GUIDE · PHASE0_CHECKLIST.
4. **Pendiente gobernado:** actualización de `expected_images`/`source_root` en el `raw_source_manifest` canónico (decisión de Bernardo) y sincronización de los docs listados en §1 (misión separada).
5. **Próximo paso operativo:** **FASE 0 mecánica** — copiar las 16 clases a `v1/RAW/` con rename canónico, verificar 22.488/16, `CHECKSUMS.sha256`, congelar; luego F1 labels → F2 split → F3 curated → F4 benchmark.
6. **Sin commits** (regla del proyecto): los 7 archivos modificados quedan en working tree esperando orden de Bernardo.

---

*Consolidación de la recuperación del Dataset V2. Modo DOCUMENTACIÓN: actualización de 7 documentos de la cadena (NADA DESAPARECE: se agregaron bloques de actualización preservando los valores históricos). Sin implementación, sin código, sin tocar el dataset original, sin commits.*