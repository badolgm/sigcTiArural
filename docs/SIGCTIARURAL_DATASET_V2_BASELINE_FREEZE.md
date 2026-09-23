# SIGCTiArural — Dataset V2 Baseline Freeze

**Documento:** SIGCTIARURAL_DATASET_V2_BASELINE_FREEZE
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `5a079f4`
**Tipo:** Congelamiento oficial del **Dataset V2 Recuperado** como baseline reproducible.
**Modo:** SOLO DOCUMENTACIÓN. NO se entrena, NO se ejecuta modelo, NO benchmark. No se modifica ningún artefacto v1.
**Actualización (gobernanza D1, 2026-09-23):** se formalizó la capa **manifiestos v2** (NUEVOS) con conteos/root reales y se registró **MobileNetV2** como modelo de control oficial en el benchmark — sin tocar los manifests históricos v1. Ver §3.4 y §7.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado (real/referencia/simulación/diseño). NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.

---

## 1. Baseline oficial

> **Dataset V2 Oficial (Recuperado)** = `agriculture_images_tomato-potato-corn` · **v1**
>
> **22.488 imágenes · 16 clases · 3 especies** · bootstrap de laboratorio (PlantVillage `raw/color`).
> Estado de honestidad: **REAL** (materializado físicamente en `data/datasets/.../v1/` y verificado por integridad SHA-256).

| Atributo | Valor |
|---|---|
| dataset_id / version | `agriculture_images_tomato-potato-corn` · `v1` |
| taxonomía | `agriculture_v2_taxonomy_v1` (16 canonical_class_id `species__condition`) |
| label_schema | `agriculture_v2_label_schema_v1` |
| split | `agriculture_v2_split_v1` (70/15/15 · seed 42 · stratified por clúster) |
| origen | `D:\RespaldoData\PlantVillage-Dataset\raw\color` |
| referencia de benchmark | `agriculture_v2_baseline_v1` (no ejecutado — diseño listo) |
| procedencia honestidad | laboratorio ≠ validez de campo |

---

## 2. Conteos oficiales

### 2.1 Por especie
| Especie | Clases | Imágenes |
|---|---:|---:|
| Tomato | 9 | 16.484 |
| Potato | 3 | 2.152 |
| Corn | 4 | 3.852 |
| **Total** | **16** | **22.488** |

### 2.2 Por clase
| canonical_class_id | Total | % | train | val | test |
|---|---:|---:|---:|---:|---:|
| tomato__yellow_leaf_curl_virus | 5.357 | 23.82 | 3.750 | 803 | 804 |
| tomato__bacterial_spot | 2.127 | 9.46 | 1.489 | 319 | 319 |
| tomato__late_blight | 1.909 | 8.49 | 1.336 | 287 | 286 |
| tomato__septoria_leaf_spot | 1.771 | 7.87 | 1.240 | 265 | 266 |
| tomato__healthy | 1.591 | 7.07 | 1.114 | 238 | 239 |
| tomato__target_spot | 1.404 | 6.24 | 983 | 211 | 210 |
| corn__common_rust | 1.192 | 5.30 | 834 | 179 | 179 |
| corn__healthy | 1.162 | 5.17 | 814 | 174 | 174 |
| tomato__early_blight | 1.000 | 4.45 | 700 | 150 | 150 |
| potato__early_blight | 1.000 | 4.45 | 700 | 150 | 150 |
| potato__late_blight | 1.000 | 4.45 | 700 | 150 | 150 |
| corn__northern_leaf_blight | 985 | 4.38 | 689 | 148 | 148 |
| tomato__leaf_mold | 952 | 4.23 | 666 | 143 | 143 |
| corn__cercospora_gray_leaf_spot | 513 | 2.28 | 359 | 77 | 77 |
| tomato__mosaic_virus | 373 | 1.66 | 261 | 56 | 56 |
| potato__healthy | 152 | 0.68 | 106 | 23 | 23 |
| **Total** | **22.488** | 100 | **15.741** | **3.373** | **3.374** |

### 2.3 Atributos derivados
- Ratio min/max: **35.24×** (min `potato__healthy` 152 · max `tomato__yellow_leaf_curl_virus` 5.357)
- Minoritarias `double_reviewed` (4 clases, 2.032 imágenes): potato__healthy · tomato__mosaic_virus · corn__cercospora_gray_leaf_spot · tomato__leaf_mold
- Extensiones: 22.487 `.JPG` + 1 `.jpeg` · tamaño v1 total 667.57 MB (RAW ~337 MB · curated 330.36 MB)

---

## 3. Checksums oficiales (SHA-256 — verificados 2026-09-23)

### 3.1 Integridad RAW
`CHECKSUMS.sha256` contiene **22.488** entradas de archivo de `RAW/` + 5 de labels/splits. **Re-hash completo verificado: 22.488/22.488 coinciden.**

### 3.2 Hashes de artefactos canónicos
| Artefacto | SHA-256 |
|---|---|
| `CHECKSUMS.sha256` | `938d89256dcfb27e6151b0c309820c12e3a066a6af2314dd84f1abf59398500d` |
| `dataset_card.md` | `1dfa549cd7f61287748035c8aa685cf989a88b9f6dc28773ea7b234d18d3edc7` |
| `labels/labels_v1.csv` | `8d3ec5a4683313b3b6c6dab1cacdd698612e9fcd7e7010a00d779ebd7652e7e3` |
| `split_lists/train.csv` | `cd6a1ce715f041a334ec3d0cbb2386fa2473db109643099ef8a572a7cbb6da56` |
| `split_lists/validation.csv` | `b87816743181d210a757fe203c75d81cf1423ff0e8d09fc052db1a6c89d07b07` |
| `split_lists/test.csv` | `3dbe6a5dbf8952be08f3c6b843d052607ad3b49f4322906dc2ec59ebcff97f2b` |
| `split_lists/split_report.json` | `574c160ec5cb046fe9d814ff2563acf9eaa8745e51923884e13d4d2026b09ded` |
| `split_lists/split_report.md` | `201ee208287c12ce3e69893c9936dcd8a25a168c2809f01553cc106f69abb822` |

### 3.3 Manifiestos canónicos (copia local == canónico)
| Manifiesto | SHA-256 |
|---|---|
| `baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml` | `f20ba6a5f8db24a0a984d2127ee94332681fc7106cb495b19fa78ce90a12b2a8` |
| `curation_manifest.agriculture_v2_dataset_v1.yaml` | `79c44f84ca293f9d582935bea312717802d19920040cfcd658138fc50710afb5` |
| `raw_source_manifest.agriculture_v2_dataset_v1.yaml` | `c770a202e055d700855427a34781ed13198957f5378074e3147b0791e699b277` |
| `split_manifest.agriculture_v2_split_v1.yaml` | `48bfe1ac1253919bfb846aaa4c6a77f7e041728b4610d26bd9b2e6db4394837b` |
| `taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml` | `28f65f97a6e4aa078e3a7232169fcba4f905735fde24c3421a7ac2106744d63f` |

### 3.4 Manifiestos v2 — capa de gobernanza D1 (vigentes, no tocan los v1)

Resolución de la decisión D1 (ver `SIGCTIARURAL_DATASET_GOVERNANCE_IMPACT_REVIEW.md` G2): se materializaron **manifiestos v2** que actualizan conteos reales y registran el control del benchmark. Los **v1 quedan intactos** como registro histórico canónico.

| Manifiesto v2 (NUEVO) | Cambio vs v1 | Estado |
|---|---|---|
| `raw_source_manifest.agriculture_v2_dataset_v2.yaml` | `expected_images` 21160 → **22488**; `source_root/subset_root` → **`D:\RespaldoData\PlantVillage-Dataset` / `raw\color`** (origen físico recuperado, verificado 38 carpetas) | ✅ vigente |
| `curation_manifest.agriculture_v2_dataset_v2.yaml` | `scope_statement` 21.160 → **22.488**; `expected_totals.images` → **22488**; **Tomato___Septoria_leaf_spot 443 → 1.771** (delta real de recuperación) | ✅ vigente |
| `baseline_experiment_manifest.agriculture_v2_baseline_v2.yaml` | Añade **MobileNetV2 (role: control, ~2.24M params)** = primer modelo a entrenar `M1_mobilenetv2_001`; apunta a `raw_source v2` | ✅ vigente |
| `split_manifest.agriculture_v2_split_v1.yaml` | Sin cambios (split real 15.741/3.373/3.374 ya correcto en v1) | sigue v1 |
| `taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml` | Sin cambios (16 bindings intactos) | sigue v1 |

Referencias cruzadas de los v2: `curation v2 → raw_source v2` · `baseline v2 → raw_source v2`. Copia local sincronizada en `v1/manifests/` (hash idéntico verificado).

---

## 4. Split oficial

- **version:** `agriculture_v2_split_v1`
- **ratio:** 70 / 15 / 15 · **seed 42** · **método:** stratified por clúster (clase dominante), grupos anti-fuga íntegros
- **particiones:** train 15.741 · validation 3.373 · test 3.374 = 22.488
- **anti-fuga aplicada:** dedup SHA-256 (14 grupos / 28 archivos duplicados) + pHash 64-bit (Hamming ≤ 8); **0 cruces entre particiones** verificados
- **clases en las 3 particiones:** 16/16 (order de classes idéntico train==val==test)
- **artefactos:** `split_lists/{train,validation,test}.csv` · `split_report.{md,json}`

---

## 5. Política de inmutabilidad

| Regla | Estado |
|---|---|
| RAW | **CONGELADO**: 22.488/22.488 archivos read-only; escritura denegada (verificado) |
| labels_v1.csv | INMUTABLE: no se reetiqueta, no se reordena, no se regenariza (hash fijado) |
| split v1 | INMUTABLE: no se cambian membresías; regenerar split = versionado NUEVO (v2) |
| curated/ | NO se re-materializa para pruebas; RAW es la fuente canónica |
| manifests v1 | CANÓNICOS: no se editan; cualquier ajuste = manifiesto nuevo (v2/v2+) |
| CHECKSUMS.sha256 | inmutable; sirve de prueba de no-regresión |
| ERROR de honestidad | cualquier alteración de la huella ≡ breaking change del baseline → exige nuevo congelamiento |

**Regeneración de integridad (procedimiento):** `python` re-hashing `CHECKSUMS.sha256` sobre `RAW/` → si alguna línea difiere, el dataset fue alterado → se investiga; si intencional, se crea `v2` (nunca se edita v1).

---

## 6. Relación con Dataset V2+

Postura: **Dataset V2 es el baseline congelado; V2+ es una extensión aditiva que CONVIVE, nunca lo reemplaza.**

| Aspecto | Dataset V2 (baseline) | Dataset V2+ (extensión)
|---|---|---|
| Naturaleza | Canónico congelado | Aditivo, en evaluación |
| Origen | PlantVillage `raw/color` (22.488/16/3) | + datos adicionales (procedencia a definir) |
| Split | `split_v1` fijado | nuevo `split_v2+` (re-aplica anti-fuga al corpus combinado) |
| Comparabilidad | línea base de laboratorio | requiere re-ejecución con mismo ranking de métricas (decisión G5) |
| Manifiestos | v1 canónicos (no se tocan) | manifiestos v2+ nuevos (G2) |
| Inmutabilidad | **V1 permanece congelado siempre** | V2+ nunca se monta encima de V1 |
| Gobernanza | cerrado | pendiente: G1 versionado, G3 taxonomía, G4 procedencia, G5 comparabilidad (ver `SIGCTIARURAL_DATASET_GOVERNANCE_IMPACT_REVIEW.md`) |

**Ancla:** todo entrenamiento/benchmark nuevo se refiere a V2 como referencia; cualquier afirmación de "mejor que baseline" SOLO es válida comparando bajo el mismo `evaluation_policy` (macro-F1, ECE, curvas) y sobre el mismo split re-ejecutado.

---

## 7. Estado y trazabilidad

- **Ruta:** `data/datasets/agriculture_images_tomato-potato-corn/v1/` (fuera de git por `.gitignore:62 /data/`; git no versiona datasets grandes)
- **Cadena de construcción:** MATERIALIZATION_PLAN → BUILD_PLAYBOOK (B1–B5 ejecutados 2026-09-23) → BENCHMARK_V1_PLAN/EXECUTION_PLAYBOOK (diseño) → benchmark/ (pipeline implementado, sin entrenar)
- **Gobernanza D1 (2026-09-23):** manifests v2 creados (`raw_source v2` expected_images 22488 + source_root real, `curation v2` conteos reales Septoria 1771, `baseline v2` → MobileNetV2 control). v1 históricos intactos. **GO emitido para `M1_mobilenetv2_001`** (pendiente única decisión de entrenar).
- **Estado de honestidad de cada pieza:** Dataset = REAL · Benchmark = diseño/pipeline listo (sin resultados) · Modelos = no entrenados

---

## 8. RESPONDE la misión

**¿Queda oficialmente congelado como baseline reproducible?**

# **SI**

El Dataset V2 Oficial (22.488/16/3) queda congelado como baseline reproducible: datos integrales verificados (22.488/22.488 checksums), labels y splits con hash fijado, RAW en read-only, manifests canónicos inmutables, y política de inmutabilidad documentada (§5). Cualquier evolución futura (V2+) es aditiva y separada.

---

*Documento de congelamiento oficial del Dataset V2 como baseline reproducible. Modo SOLO DOCUMENTACIÓN: no se entrenó, no se ejecutó modelo, no se hizo benchmark, no se modificó ningún artefacto.*