# SIGCTiArural — DATASET V2 MATERIALIZATION PLAN (Diseño de Materialización Física)

**Documento:** SIGCTIARURAL_DATASET_V2_MATERIALIZATION_PLAN
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `5a079f4`
**Tipo:** Plan exacto de diseño para convertir la copia recuperada en **Dataset V2 operativo** (MISIÓN DATASET V2 MATERIALIZATION PLAN).
**Modo:** SOLO DISEÑO DOCUMENTAL. No se modifica ningún archivo existente, no se copia todavía, no se entrena, no se commit.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado (real/referencia/simulación/diseño). NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
**Entrada:** Dataset V2 Oficial Recuperado **22.488/16/3** · `D:\RespaldoData\PlantVillage-Dataset` (ver `SIGCTIARURAL_DATASET_V2_RECOVERY_CONSOLIDATION.md`).
**Autoridad operativa:** los 5 manifests de `docs/ai/manifests/` (`raw_source` · `curation` · `taxonomy_binding` · `split` · `baseline_experiment`).

---

## 0. Identidad del artefacto objetivo

```
dataset_id:      agriculture_images_tomato-potato-corn
dataset_version: v1
imágenes:        22.488 RGB (.jpg/.jpeg/.png)
clases:          16  ·  especies: 3  (Tomato 9 · Potato 3 · Corn 4)
estado:          RAW (diseño) → CURATED (operativo)   [bootstrap de laboratorio, NO validez de campo]
taxonomy:        agriculture_v2_taxonomy_v1
label_schema:    agriculture_v2_label_schema_v1
split:           agriculture_v2_split_v1  (70/15/15 · seed 42 · stratified_group_split · anti-fuga)
experiment:      agriculture_v2_baseline_v1 (4 arquitecturas + control MobileNetV2)
```

El dataset "operativo" = artefacto versionable bajo `data/datasets/.../v1/` **con**: `RAW/` congelado + `labels_v1.csv` + `split_lists/*.csv` + `curated/{train,val,test}/` + `CHECKSUMS.sha256` + `dataset_card.md` + manifests copiados. Todo lo demás (entrenamiento/benchmark) es misión posterior separada.

---

## 1. Origen y estado verificado (fuente de la copia)

| Atributo | Valor verificado (2026-09-23) |
|---|---|
| Raíz origen | `D:\RespaldoData\PlantVillage-Dataset` (repo oficial `spMohanty/PlantVillage-Dataset`) |
| Subset a copiar | `raw/color` |
| Contenido `raw/color` | **54.305 archivos** (54.303 `.jpg` + 1 `.jpeg` + 1 `.png`) · **38 clases** · **~0.79 GB** |
| Subset del scope V2 | **16 clases = 22.488 archivos** (únicas copiadas) |
| Divergencia vs manifiesto | `Tomato___Septoria_leaf_spot` = **1.771** en origen (manifiesto declara 443) → sumas 22.488 |
| Clases excluidas del scope | 22 carpetas (Apple, Blueberry, Cherry, Grape, Orange, Peach, Pepper, Raspberry, Soybean, Squash, Strawberry, Spider-mites) |
| Tamaño estimado RAW v1 | **~0.32 GB** (acciones: solo 16 carpetas · fuentes: 79 KB/promedio orientativo → verificar en M1) |
| Disco destino | `C:` libres **19.06 GB** (margen >50× sobre el dataset) |

**Nota de gobernanza previa (decisión de Bernardo, pendiente):**
- `raw_source_manifest` declara `source_root` y `subset_root` de la máquina vieja (`C:\Users\Devbadolgm\...`) y `expected_images: 21160`.
- En la ejecución real (misión de materialización operativa) se **actualizará** `source_root` → `D:\RespaldoData\PlantVillage-Dataset`, `subset_root` → `...\raw\color` y `expected_images` → `22488`. La copia canónica de `docs/ai/manifests/` se mantiene intacta (el manifiesto del dataset en `v1/manifests/` describe el artefacto físico).

---

## 2. Mapeo de clases PlantVillage → canónico (regla del taxonomy_binding_manifest)

Regla: `original_class_name` (nombre de carpeta, delimiter `___`) se copia a carpeta canónica **`species__condition`**. Verificado contra `taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml`.

| # | Carpeta origen (`raw/color`) | Conteo origen | Carpeta destino `RAW/` | species | condition |
|---|---|---|---|---|---|
| 1 | `Tomato___Bacterial_spot` | 2.127 | `tomato__bacterial_spot` | tomato | bacterial_spot |
| 2 | `Tomato___Early_blight` | 1.000 | `tomato__early_blight` | tomato | early_blight |
| 3 | `Tomato___healthy` | 1.591 | `tomato__healthy` | tomato | healthy |
| 4 | `Tomato___Late_blight` | 1.909 | `tomato__late_blight` | tomato | late_blight |
| 5 | `Tomato___Leaf_Mold` | 952 | `tomato__leaf_mold` | tomato | leaf_mold |
| 6 | `Tomato___Septoria_leaf_spot` | **1.771** | `tomato__septoria_leaf_spot` | tomato | septoria_leaf_spot |
| 7 | `Tomato___Target_Spot` | 1.404 | `tomato__target_spot` | tomato | target_spot |
| 8 | `Tomato___Tomato_mosaic_virus` | 373 | `tomato__mosaic_virus` | tomato | mosaic_virus |
| 9 | `Tomato___Tomato_Yellow_Leaf_Curl_Virus` | 5.357 | `tomato__yellow_leaf_curl_virus` | tomato | yellow_leaf_curl_virus |
| 10 | `Potato___Early_blight` | 1.000 | `potato__early_blight` | potato | early_blight |
| 11 | `Potato___healthy` | 152 | `potato__healthy` | potato | healthy |
| 12 | `Potato___Late_blight` | 1.000 | `potato__late_blight` | potato | late_blight |
| 13 | `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` | 513 | `corn__cercospora_gray_leaf_spot` | corn | cercospora_gray_leaf_spot |
| 14 | `Corn_(maize)___Common_rust_` | 1.192 | `corn__common_rust` | corn | common_rust |
| 15 | `Corn_(maize)___healthy` | 1.162 | `corn__healthy` | corn | healthy |
| 16 | `Corn_(maize)___Northern_Leaf_Blight` | 985 | `corn__northern_leaf_blight` | corn | northern_leaf_blight |

**Total: 22.488** · 16 carpetas destino · 16 de 16 mapeos 1:1 según manifiesto. No hay clase de origen duplicada ni sin mapear.

**Exclusiones que deben resultar ausentes en `RAW/`:** `raw/grayscale`, `raw/segmented`, `generated_for_paper`, `Tomato___Spider_mites Two-spotted_spider_mite` (1.676 en origen — NO se copia), y las otras 21 especies fuera del scope.

---

## 3. Estructura exacta destino (`data/datasets/...`)

```
data/
└── datasets/                                  [NO versionado por git; .gitignore:62 excluye /data/]
    └── agriculture_images_tomato-potato-corn/
        └── v1/
            ├── RAW/                            ← copia congelada (16 carpetas canónicas, 22.488)
            │   ├── tomato__bacterial_spot/             (2.127)
            │   ├── tomato__early_blight/               (1.000)
            │   ├── tomato__late_blight/                (1.909)
            │   ├── tomato__leaf_mold/                  (   952)
            │   ├── tomato__septoria_leaf_spot/         (1.771)
            │   ├── tomato__target_spot/                (1.404)
            │   ├── tomato__yellow_leaf_curl_virus/     (5.357)
            │   ├── tomato__mosaic_virus/               (   373)
            │   ├── tomato__healthy/                    (1.591)
            │   ├── potato__early_blight/               (1.000)
            │   ├── potato__late_blight/                (1.000)
            │   ├── potato__healthy/                    (   152)
            │   ├── corn__cercospora_gray_leaf_spot/    (   513)
            │   ├── corn__common_rust/                  (1.192)
            │   ├── corn__northern_leaf_blight/         (   985)
            │   └── corn__healthy/                      (1.162)
            ├── labels/
            │   └── labels_v1.csv                       ← 22.488 filas, 8 campos
            ├── split_lists/
            │   ├── train.csv                           (70%)
            │   ├── validation.csv                      (15%)
            │   └── test.csv                            (15%)
            ├── curated/
            │   ├── train/        (species__condition, físicos o symlinks)
            │   ├── validation/
            │   └── test/
            ├── holdout/
            │   └── real_world_holdout_v1/              ← vacío e intocable (datos de campo futuros)
            ├── manifests/                              ← copia de los 5 YAML canónicos
            │   ├── raw_source_manifest.agriculture_v2_dataset_v1.yaml
            │   ├── curation_manifest.agriculture_v2_dataset_v1.yaml
            │   ├── taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml
            │   ├── split_manifest.agriculture_v2_split_v1.yaml
            │   └── baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml
            ├── dataset_card.md
            ├── split_report.md
            └── CHECKSUMS.sha256
```

Reglas estructurales:
1. `RAW/` **inmutable** una vez congelado (read-only; el split no lo reescribe).
2. `curated/` se genera UNA vez desde `split_v1`; no se regenera para probar configuraciones.
3. `holdout/` jamás se copia a ninguna partición.
4. Los manifests canónicos viven en `docs/ai/manifests/`; la copia en `v1/manifests/` es referencia operativa (hash YAML == canónico, salvo `source_root`/`expected_images` actualizados en el local).

---

## 4. Cadena de materialización (fases M0–M7)

### M0 · Preparación y verificación de origen
| Paso | Acción | Criterio de éxito |
|---|---|---|
| M0.1 | Verificar origen | `Test-Path "D:\RespaldoData\PlantVillage-Dataset\raw\color"` = True; 38 carpetas |
| M0.2 | Verificar espacio | `(Get-PSDrive C).Free/1GB` ≥ 5 GB (dataset ~0.32 GB + margen) |
| M0.3 | Crear árbol `v1/` | 8 entradas: `RAW`, `curated/{train,validation,test}`, `split_lists`, `labels`, `holdout/real_world_holdout_v1`, `manifests` |
| M0.4 | Copiar 5 manifests | `Copy-Item docs/ai/manifests/*.yaml → v1/manifests/` (5/5) |
| M0.5 | Actualizar manifiesto local | En `v1/manifests/raw_source_manifest...`: `source_root`/`subset_root` → ruta real origen; `expected_images` → `22488` (decisión gobernada, registrada en dicferencia) |
| M0.6 | Reservar holdout | Crear `v1/holdout/real_world_holdout_v1/` vacío, documentar intocabilidad |

### M1 · Copia `raw/color` → `v1/RAW/` (rename canónico)
| Paso | Acción | Comando / evidencia |
|---|---|---|
| M1.1 | Copiar las 16 carpetas | Por cada clase §2: `Copy-Item <raw/color/<orig>> → v1/RAW/<canónico>/ -Recurse` |
| M1.2 | Renombrar a `species__condition` | Según tabla §2; nombres exactos del taxonomy_binding_manifest |
| M1.3 | Verificar exclusiones | `Get-ChildItem v1/RAW -Directory` = 16 · ausentes: Spider-mites, grayscale, segmented, generated |
| M1.4 | Verificar extensiones | `Get-ChildItem v1/RAW -Recurse -File | Group-Object Extension` → solo `.jpg/.jpeg/.png` (0 `.tif/.bmp/.txt`) |
| M1.5 | Conteo global | `(Get-ChildItem v1/RAW -Recurse -File).Count` = **22.488** |
| M1.6 | Conteo por clase | Tabla §2 == conteo real por carpeta (1:1) |
| M1.7 | Gate duro | Si cualquier conteo ≠ esperado o hay exclusión presente → **STOP** antes de seguir; nunca parchear conteos |

### M2 · `labels_v1.csv` (especificación exacta)
Campos canónicos (8) según `agriculture_v2_label_schema_v1`:

| Campo | Tipo / valor |
|---|---|
| `sample_id` | Identificador único por imagen: `<canonical_class_id>/<basename>` (basename conserva extensión) |
| `taxonomy_version` | `agriculture_v2_taxonomy_v1` |
| `species` | enum: `tomato` / `potato` / `corn` |
| `condition_group` | enum: `healthy` / `disease` |
| `condition_name` | enum cerrado de las 16 (de §2) |
| `health_state` | `healthy` / `warning` |
| `annotation_quality` | `source` para 15 clases; `double_reviewed` para las 4 minoritarias |
| `validation_source` | `source_dataset_audited` para 15 clases; `double_reviewed` para las 4 minoritarias |

Generación: mecánica desde `RAW/` + taxonomía (filas derivadas de los archivos reales; **nunca** inventando muestras). Reglas:
- 22.488 filas exactas; `sample_id` únicos; todas las clases presentes.
- **4 minoritarias marcadas `double_reviewed`:** `potato__healthy` (152) · `tomato__mosaic_virus` (373) · `corn__cercospora_gray_leaf_spot` (513) · `tomato__leaf_mold` (952).
- Verificación: `(Import-Csv labels_v1.csv).Count` = 22.488 · sin `sample_id` duplicados · enum cerrado.

### M3 · Anti-fuga (dedup + pHash) — antes del split
| Paso | Acción | Criterio |
|---|---|---|
| M3.1 | Dedup exacto | Hash SHA-256 por archivo; detectar duplicados intra-clase; **reportar n duplicados** |
| M3.2 | Near-dup pHash | Detectar clústeres perceptuales (umbral a fijar, p. ej. hamming ≤ 5–10) |
| M3.3 | Agrupar | Cada grupo near-dup completo va a UNA partición (regla anti-leakage del split_manifest) |
| M3.4 | Reporte | `split_report.md` incluirá: n duplicados exactos, n grupos pHash, n imágenes agrupadas |

Confirmación en uso de la política: el manifiesto ordena dedup antes del split y **no mezclar** variantes derivadas (grayscale/segmented ya excluidas en M1).

### M4 · `split_v1` (70/15/15 · seed 42 · stratified_group_split)
- Algoritmo sancionado: `stratified_group_split` con grupos = clústeres de anti-fuga (M3).
- Estratificación por `canonical_class_id` preservando proporciones por clase.
- Ratio: train 0.70 / validation 0.15 / test 0.15.
- Seed: **42** (reproducibilidad determinista).
- Salidas: `split_lists/{train,validation,test}.csv` con `sample_id, partition, canonical_class_id`.
- **Gates de calidad (del split_manifest):**
  1. Ninguna clase ausente de una partición (salvo clase extremadamente pequeña — reportar explícitamente).
  2. Conteos por clase × partición publicados en `split_report.md`.
  3. **BLOQUEAR** si se detecta fuga (mismo sample en más de una partición / hashes cruzados).
- Cifras esperadas (orientativas): train ≈ 15.741 · validation ≈ 3.373 · test ≈ 3.374 (se calcularán exactas del 16-clase stratified real).

### M5 · `curated/` (inputs de entrenamiento)
- Materializar `curated/{train,validation,test}/<species__condition>/` según membresías de `split_lists/*.csv`.
- Mecanismo permitido: **copias físicas** o **symlinks** (decisión operativa; se documentará en `split_report.md`).
- Regla: estructura por clase replicando taxonomía (lista de archivos efectivos = membresía del split; sin muestras extra).
- Verificación: total archivos == 22.488 (si se copia todo) o conteos por partición consistentes con `split_lists`.

### M6 · Checksums y congelado
| Paso | Acción | Criterio |
|---|---|---|
| M6.1 | `CHECKSUMS.sha256` | Hash SHA-256 **por archivo** de `RAW/` (22.488 líneas) |
| M6.2 | Referencia del CSV | SHA del propio `CHECKSUMS.sha256` guardado como referencia |
| M6.3 | Congelado | `RAW/` read-only (atributos); verificar `git status` NO lista `data/` (untracked por diseño) |
| M6.4 | Redondeabilidad | Los hashes quedan legibles y computables (re-hash = estable) |

### M7 · Cierre y `dataset_card.md`
| Paso | Acción |
|---|---|
| M7.1 | `dataset_card.md` — ficha científica (esquema §7) |
| M7.2 | `split_report.md` — conteos por clase × partición, dedup/pHash, anti-fuga verificado |
| M7.3 | Verificación final del artefacto — checklist completo §8 |
| M7.4 | Estado del mundo: `Dataset V2 v1 operativo` (RAW congelado + labels + split + curated + checksums + card) |

---

## 5. Anti-fuga en detalle (pin moderno de honestidad)

La fuga es el riesgo de invalidar el benchmark. Este plan la trata en 3 capas:
1. **Pre-copia:** excluir variantes derivadas (grayscale/segmented/generated) y clases fuera del scope — imposible mezclarlas.
2. **Pre-split:** dedup exacto por SHA-256 + near-dup por pHash; los grupos van en bloque a una partición (regla `anti_leakage_rules` del split_manifest).
3. **Post-split:** gate bloqueante — verificación de 0 hashes cruzados entre particiones y de que ninguna imagen aparezca en más de un `split_lists/*.csv`.

Gates que detienen la cadena si fallan: M1.7 (conteos), M5 (membresías), M4-gate3 (fuga). Cualquier falla → corrección en el paso anterior, jamás parcheo de conteos.

---

## 6. Checksums: álgebra y cobertura

| Artefacto | Cobertura hash | Formato |
|---|---|---|
| `RAW/` completo | SHA-256 por archivo (22.488) | `CHECKSUMS.sha256` |
| Manifiestos `v1/manifests/` | SHA-256 por YAML | en `CHECKSUMS.sha256` (sección manifests) o archivo aparte |
| `labels_v1.csv` | SHA-256 del CSV | registrado en `dataset_card.md` |
| `split_lists/*.csv` | SHA-256 por CSV | registrado en `split_report.md` |
| Dataset v1 (como versión) | repositorio de hash de carpeta + manifiesto | gobernanza MLOps (MASTERPLAN §9) |

La invariante: dado `CHECKSUMS.sha256` + `v1/manifests/`, se puede **reproducir y verificar** el dataset completo en cualquier máquina sin depender de la ruta original.

---

## 7. Esquema de `dataset_card.md`

```
# Dataset Card — agriculture_images_tomato-potato-corn·v1 (bootstrap de laboratorio)

1. Identidad           dataset_id, version, taxonomy, label_schema, split, experiment
2. Procedencia         origen D:\RespaldoData\PlantVillage-Dataset (spMohanty), raw/color,
                       fecha recuperación 2026-09-23, divergencia Septoria 1.771
3. Inventario          22.488 imágenes · 16 clases · 3 especies · tablas por clase y ppct
4. Métricas de diseño  ratio 35.24× · min potato__healthy 152 · max YLCV 5.357
5. Exclusiones         grayscale/segmented/generated/Spider-mites + 21 especies fuera de scope
6. Anti-fuga           dedup SHA-256 + pHash; grupos en una partición; 0 cruces verificados
7. Split               train/val/test 70/15/15 · seed 42 · conteos por clase × partición
8. Checksums           CHECKSUMS.sha256; hash de labels y split_lists; referencia
9. Limitaciones        bootstrap de laboratorio ≠ validez de campo (invariante de honestidad)
10. Trazabilidad       manifiestos canónicos + raw_source actualizado (expected_images 22488)
11. Autores/revisión   gobernanza SIGCTiArural; revisión de minoritarias (double_reviewed)
```

---

## 8. Checklist de aceptación del Dataset V2 operativo

| # | Gate | Criterio |
|---|---|---|
| 1 | Origen íntegro | 38 carpetas en origen; subset 16 clases = 22.488 (verificado) |
| 2 | RAW mapeado | 16 carpetas canónicas exactas (tabla §2); 0 clases sin mapear |
| 3 | Exclusiones | 0 grayscale/segmented/generated/Spider-mites; 0 especies fuera de scope |
| 4 | Extensiones | 100% `.jpg/.jpeg/.png` |
| 5 | Conteos | global 22.488; por clase = tabla §2 (1:1) |
| 6 | labels_v1.csv | 22.488 filas · 8 campos · enum cerrado · minoritarias double_reviewed |
| 7 | Anti-fuga | dedup + pHash reportados; 0 duplicados intra-partición; 0 cruces |
| 8 | split_v1 | 70/15/15 · seed 42 · stratified_group_split · classes presentes |
| 9 | curated | total/membresías consistentes con split_lists |
| 10 | Checksums | CHECKSUMS.sha256 generado y verificado; RAW read-only |
| 11 | dataset_card/split_report | presentes y coherentes |
| 12 | manifests locales | 5/5 YAML, hash = canónico salvo source_root/expected_images |
| 13 | git | `git status` no lista `data/` (untracked por diseño) |
| 14 | No-falsification | bootstrap declarado como laboratorio; jamás como validez de campo |

---

## 9. Resultado esperado al ejecutar M0–M7

```
🟢 data/datasets/agriculture_images_tomato-potato-corn/v1/RAW/      → 22.488 · 16 clases · congelado
🟢 data/datasets/.../v1/labels/labels_v1.csv                        → 22.488 filas · 8 campos
🟢 data/datasets/.../v1/split_lists/*.csv                           → train/validation/test (70/15/15)
🟢 data/datasets/.../v1/curated/{train,validation,test}/            → inputs listos para benchmark
🟢 data/datasets/.../v1/manifests/                                  → 5 YAML (raw_source actualizado)
🟢 data/datasets/.../v1/CHECKSUMS.sha256 + dataset_card.md + split_report.md
🔴 Benchmark (4 modelos) y demás fases → misión posterior, separada (NO entrenar aquí)
```

---

## 10. RESPONDE la misión

1. **Copia desde `raw/color`:** tabla §2 (16 carpetas, rename canónico `species__condition`, 22.488) con verificación M1 y gate duro M1.7.
2. **`data/datasets/.../v1/RAW/`:** estructura exacta §3; inmutable post-checksum.
3. **`labels_v1.csv`:** especificación M2 (8 campos, 22.488 filas, minoritarias `double_reviewed`).
4. **`split_v1`:** M4 (70/15/15, seed 42, `stratified_group_split`, gates de calidad).
5. **Anti-fuga:** capa triple §5 (exclusiones pre-copia · dedup/pHash pre-split · gate de cruces post-split).
6. **Checksums:** §6 (`CHECKSUMS.sha256` por archivo + cobertura de manifests/labels/splits).
7. **`dataset_card`:** esquema §7 (ficha científica completa con limitación bootstrap ≠ campo).
8. **Benchmark inputs:** M5 `curated/{train,val,test}/` + `v1/manifests/` + `experiment_id agriculture_v2_baseline_v1` (4 arquitecturas + control MobileNetV2) — listos para la misión de entrenamiento separada.

**Pregunta pendiente para Bernardo (antes de ejecutar):** en M0.5, confirmar la actualización del manifiesto local: `source_root → D:\RespaldoData\PlantVillage-Dataset`, `subset_root → ...\raw\color`, `expected_images → 22488`. Es la única decisión gobernada que el plan necesita para que el manifiesto del dataset describa el artefacto físico real.

---

*Plan de diseño de materialización física del Dataset V2. Modo SOLO DISEÑO DOCUMENTAL: sin modificar archivos existentes, sin copiar, sin entrenar, sin commits. Ejecución M0–M7 en misión operativa posterior, con orden explícita de Bernardo.*