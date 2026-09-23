# SIGCTiArural — DATASET V2 BUILD PLAYBOOK (Ejecución Exacta RAW → Benchmark Inputs)

**Documento:** SIGCTIARURAL_DATASET_V2_BUILD_PLAYBOOK
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `5a079f4`
**Tipo:** Playbook operativo de construcción del Dataset V2 v1 (MISIÓN DATASET V2 BUILD PLAN).
**Modo:** SOLO DISEÑO DOCUMENTAL. No se modifica ningún dato en esta misión; los comandos y scripts aquí especificados se ejecutarán en misión operativa posterior con orden explícita de Bernardo.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado (real/referencia/simulación/diseño). NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
**Fuente:** `SIGCTIARURAL_DATASET_V2_MATERIALIZATION_PLAN.md` (diseño M0–M7) · manifiestos canónicos (`docs/ai/manifests/*.yaml`).

---

## 1. Objetivo

Ejecutar la cadena exacta:

```
D:\RespaldoData\PlantVillage-Dataset\raw\color
   │ (copia 16 clases + rename canónico)
   ▼
data/datasets/agriculture_images_tomato-potato-corn/v1/RAW/
   │ (labels_v1.csv desde RAW + taxonomía)
   ▼
labels/labels_v1.csv
   │ (dedup exacto + pHash → stratified_group_split 70/15/15 seed 42)
   ▼
split_lists/{train,validation,test}.csv
   │ (materializar según membresías)
   ▼
curated/{train,validation,test}/<species__condition>/
   │ (estructura lista para benchmark + manifests + checksums)
   ▼
Benchmark inputs (v1 completo operativo)
```

**Resultado final:** Dataset V2 v1 operativo = `RAW/` congelado + `labels_v1.csv` + `split_lists/*.csv` + `curated/` + `manifests/` + `CHECKSUMS.sha256` + `dataset_card.md` + `split_report.md`. **El entrenamiento/quenchmark queda fuera de este playbook.**

---

## 2. Entradas inmutables (verificadas)

| Entrada | Valor |
|---|---|
| Origen | `D:\RespaldoData\PlantVillage-Dataset\raw\color` |
| Contenido origen | 54.305 archivos (54.303 .jpg + 1 .jpeg + 1 .png) · 38 clases · ~0.79 GB |
| Subset scope | 16 clases · **22.488** archivos |
| Divergencia conocida | `Tomato___Septoria_leaf_spot` = **1.771** (manifiesto declara 443) |
| Disco destino | `C:` libre ≈ 19.06 GB |
| Tamaño previsto `RAW/` | ~0.32 GB |

Mapeo 16 clases (idéntico al MATERIALIZATION_PLAN §2) y estructura destino (idéntica a §3) son la **autoridad de fuente**; este playbook operativiza su ejecución.

---

## 3. Decisiones gobernadas requeridas ANTES de ejecutar (M0.5)

| # | Decisión | Default propuesto |
|---|---|---|
| D1 | Actualizar `v1/manifests/raw_source_manifest...`: `source_root` → `D:\RespaldoData\PlantVillage-Dataset`, `subset_root` → `...\raw\color`, `expected_images` → `22488` | Aceptado (manifiesto del dataset describe el artefacto físico) |
| D2 | Mecanismo de `curated/`: copias físicas vs symlinks | Copias físicas (portable; deja `RAW/` intocable) |
| D3 | Umbral pHash (distancia de Hamming) | ≤ 8 (configurable en script, reportado) |
| D4 | Extensión permitida en conteo | `.jpg` `.jpeg` `.png` (incluida la 1 `.png` y la 1 `.jpeg` reales) |

Si D1 no se aprueba, el playbook se detiene antes de B1 (el manifiesto local debe reflejar la realidad o se ejecuta con el valor declarado 21160 y se documenta la divergencia — NO recomendado).

---

## 4. Fases de ejecución (B1–B6)

### B1 · Copia `raw/color` → `v1/RAW/` (rename canónico)

**Precondición (B0):** árbol `v1/` creado (`RAW`, `labels`, `split_lists`, `curated/{train,validation,test}`, `holdout/real_world_holdout_v1`, `manifests`), 5 manifests copiados.

```
$src = "D:\RespaldoData\PlantVillage-Dataset\raw\color"
$v1  = "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1"
$raw = "$v1\RAW"

# Mapeo (orig -> canon) — 16 líneas, extraídas de taxonomy_binding_manifest
$map = @(
  @{o="Tomato___Bacterial_spot";                          c="tomato__bacterial_spot"}
  @{o="Tomato___Early_blight";                            c="tomato__early_blight"}
  @{o="Tomato___healthy";                                 c="tomato__healthy"}
  @{o="Tomato___Late_blight";                             c="tomato__late_blight"}
  @{o="Tomato___Leaf_Mold";                               c="tomato__leaf_mold"}
  @{o="Tomato___Septoria_leaf_spot";                      c="tomato__septoria_leaf_spot"}
  @{o="Tomato___Target_Spot";                             c="tomato__target_spot"}
  @{o="Tomato___Tomato_mosaic_virus";                     c="tomato__mosaic_virus"}
  @{o="Tomato___Tomato_Yellow_Leaf_Curl_Virus";           c="tomato__yellow_leaf_curl_virus"}
  @{o="Potato___Early_blight";                            c="potato__early_blight"}
  @{o="Potato___healthy";                                 c="potato__healthy"}
  @{o="Potato___Late_blight";                             c="potato__late_blight"}
  @{o="Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot"; c="corn__cercospora_gray_leaf_spot"}
  @{o="Corn_(maize)___Common_rust_";                      c="corn__common_rust"}
  @{o="Corn_(maize)___healthy";                           c="corn__healthy"}
  @{o="Corn_(maize)___Northern_Leaf_Blight";              c="corn__northern_leaf_blight"}
)

foreach ($m in $map) {
  New-Item -ItemType Directory -Force -Path "$raw\$($m.c)" | Out-Null
  Copy-Item -Path "$src\$($m.o)\*" -Destination "$raw\$($m.c)\" -Recurse -Force
}
```

**Gates B1 (STOP si falla):**
| # | Verificación | Comando | Criterio |
|---|---|---|---|
| B1.1 | Solo 16 carpetas | `(Get-ChildItem $raw -Directory).Count` | 16 |
| B1.2 | Nombres canónicos | listado == tabla §2 del MATERIALIZATION_PLAN | 16/16 exactos |
| B1.3 | Sin exclusiones | `Get-ChildItem $raw -Recurse -Directory` no contiene Spider-mites/grayscale/segmented/generated | 0 |
| B1.4 | Extensiones | `Get-ChildItem $raw -Recurse -File | Group-Object Extension` | solo .jpg/.jpeg/.png |
| B1.5 | Conteo global | `(Get-ChildItem $raw -Recurse -File).Count` | **22.488** |
| B1.6 | Conteos por clase | tabla §2 1:1 | cada carpeta == esperado |

### B2 · `labels_v1.csv` (22.488 filas · 8 campos)

Esquema fijo (label_schema_v1): `sample_id, taxonomy_version, species, condition_group, condition_name, health_state, annotation_quality, validation_source`.

Regla de derivación:
- `sample_id` = `<canonical>/<basename>` (basename conserva extensión) — único por construcción.
- `taxonomy_version` = `agriculture_v2_taxonomy_v1`.
- `species`/`condition_group`/`condition_name`/`health_state` = desde mapeo §2 (taxonomy_binding_manifest).
- `annotation_quality` y `validation_source` = `source_dataset_audited`, **excepto** las 4 minoritarias → `double_reviewed`:
  - `potato__healthy` (152) · `tomato__mosaic_virus` (373) · `corn__cercospora_gray_leaf_spot` (513) · `tomato__leaf_mold` (952).

**Diseño de generación (script auxiliar, se ejecutará en misión operativa):** iterar archivos de `RAW/` (16 carpetas), mapear a canónico, emitir 8 columnas a `v1/labels/labels_v1.csv` (UTF-8, cabecera). Prohibido inventar filas: el CSV deriva 1 a 1 de los archivos presentes.

**Gates B2:**
| Verificación | Comando | Criterio |
|---|---|---|
| Filas | `(Import-Csv "$v1\labels\labels_v1.csv").Count` | 22.488 |
| sample_id únicos | `Import-Csv ... \| Group-Object sample_id \| Where Count -gt 1` | 0 grupos |
| Enum cerrado | `condition_name` ⊆ 16 valores | 0 desconocidos |
| Minoritarias | filas con `double_reviewed` == 2.032 | conteo (152+373+513+952) |

### B3 · Anti-fuga + `split_v1`

**Diseño (script Python + skearn, se ejecutará en misión operativa):**
1. **Dedup exacto:** SHA-256 de cada archivo → pares duplicados; marcar y reportar `n_duplicates_exact`.
2. **Near-dup (pHash):** hash perceptual por imagen; clústeres con distancia Hamming ≤ D3; **grupo completo va a UNA partición**.
3. **Split:** `stratified_group_split` por `canonical_class_id` · seed 42 · 70/15/15.
4. **Salida:** `split_lists/{train,validation,test}.csv` con columnas `sample_id, partition, canonical_class_id`.
5. **`split_report.md`:** conteos por clase × partición; n duplicados exactos; n grupos pHash; verificación anti-fuga.

**Gates B3 (bloqueante si falla):**
| Verificación | Criterio |
|---|---|
| Sin clases ausentes en ninguna partición | 16 clases presentes en train/val/test |
| Sin cruces | ningún `sample_id` en más de una partición |
| Sin hashes cruzados | 0 duplicados exactos entre particiones |
| Reproducibilidad | seed 42 fija; regenerar da el mismo split |

**Conteos esperados por clase (70/15/15 orientativos; el split real puede variar ±1 por clase):**

| Clase | Total | train (70%) | validation (15%) | test (15%) |
|---|---:|---:|---:|---:|
| tomato__bacterial_spot | 2.127 | 1.489 | 319 | 319 |
| tomato__early_blight | 1.000 | 700 | 150 | 150 |
| tomato__healthy | 1.591 | 1.114 | 239 | 239 |
| tomato__late_blight | 1.909 | 1.336 | 286 | 286 |
| tomato__leaf_mold | 952 | 666 | 143 | 143 |
| tomato__septoria_leaf_spot | 1.771 | 1.240 | 266 | 266 |
| tomato__target_spot | 1.404 | 983 | 211 | 211 |
| tomato__mosaic_virus | 373 | 261 | 56 | 56 |
| tomato__yellow_leaf_curl_virus | 5.357 | 3.750 | 804 | 804 |
| potato__early_blight | 1.000 | 700 | 150 | 150 |
| potato__healthy | 152 | 106 | 23 | 23 |
| potato__late_blight | 1.000 | 700 | 150 | 150 |
| corn__cercospora_gray_leaf_spot | 513 | 359 | 77 | 77 |
| corn__common_rust | 1.192 | 834 | 179 | 179 |
| corn__northern_leaf_blight | 985 | 690 | 148 | 148 |
| corn__healthy | 1.162 | 813 | 174 | 174 |
| **Total** | **22.488** | **≈15.741** | **≈3.373** | **≈3.374** |

*Los valores de la tabla son expectativa aritmética; la autoridad es el `split_report.md` generado con seed 42.*

### B4 · `curated/` (materialización de particiones)

Según membresía `split_lists/*.csv` (decisión D2 = copias físicas):

```
.\build_curated.ps1   # por fila: copiar <RAW>/<canonical>/<basename> → <curated>/<partition>/<canonical>/<basename>
```

**Gates B4:**
| Verificación | Criterio |
|---|---|
| Total curated | train+val+test == 22.488 |
| Consistentes con split_lists | cuentas por partición == split_report.md |
| Clases por partición | 16 por partición (idéntico a B3) |
| Sin archivos sobrantes | cada archivo en curated pertenece a su partición |

### B5 · Benchmark inputs + cierre

| Paso | Acción |
|---|---|
| B5.1 | Verificar `v1/manifests/` 5/5 YAML; hash == canónico salvo D1 |
| B5.2 | `CHECKSUMS.sha256`: SHA-256 por archivo de `RAW/` (22.488) + sección manifests/labels/splits |
| B5.3 | Congelar `RAW/` (read-only) |
| B5.4 | `git status --short data` → vacío (data/ untracked por diseño) |
| B5.5 | Redactar `dataset_card.md` (esquema MATERIALIZATION_PLAN §7) + `split_report.md` |
| B5.6 | Registrar experiment_id `agriculture_v2_baseline_v1` como preparado para F4 (sin entrenar) |

**Entradas finales para benchmark (los "benchmark inputs"):**
- `curated/train|validation|test/` (datos por clase)
- `labels/labels_v1.csv` (membresía completa)
- `split_lists/*.csv` (particiones oficiales)
- `manifests/` (5 YAML; `split_manifest` con resumen de conteos del materializado)
- `CHECKSUMS.sha256`, `dataset_card.md`, `split_report.md`

---

## 5. Ejecución en orden (secuencia total)

```
B0 preparación ─► B1 copia ─► Gates B1 ─► B2 labels ─► Gates B2
    ─► B3 anti-fuga + split ─► Gates B3 ─► B4 curated ─► Gates B4
    ─► B5 cierre (checksums + card + report + congelado) ─► B5 gates ─► DONE
```

Regla de avance: **no se pasa a la siguiente fase con una gate en rojo.** Falla → corregir en la fase exacta (sin parchear conteos; RAW se re-copia/verifica en limpio si hace falta).

---

## 6. Puntos de retorno (rollback)

| Fase | Punto de retorno seguro |
|---|---|
| B1 | Rehacer copia de carpeta afectada (RAW re-copiable desde origen; borrado local solo si verificación falla y se re-copia en limpio) |
| B2 | Regenerar CSV desde RAW (función pura: archivos → filas) |
| B3 | Regenerar split con seed 42 (determinista); nunca cambiar membresías a mano |
| B4 | Re-generar desde split_lists (copias físicas reproducibles) |
| B5 | Re-hash + re-congelado; manifests re-copiables del canónico |

**Punto de no retorno:** ninguna — el dataset es reproducible desde `raw/color` + taxonomía + manifiestos + seeds.

---

## 7. Viaje de verificación final (arte).

```
[ ] B1.5 global = 22.488  ·  B1.6 por clase = tabla §2
[ ] B2 filas = 22.488 · únicos 22.488 · minoritarias double_reviewed = 2.032
[ ] B3 ningún cruce · 16 clases por partición · seed 42
[ ] B4 train+val+test = 22.488
[ ] B5 CHECKSUMS.sha256 completo · RAW read-only · 5 manifests copiados · git limpio de data/
[ ] dataset_card.md + split_report.md presentes
[ ] Bootstrap declarado como laboratorio (NO validez de campo)
```

---

## 8. RESPONDE la misión

1. **RAW:** B1 — copia 16 clases con rename canónico, gates de exclusión/extensiones/conteos (22.488), mapeo §2.
2. **labels_v1.csv:** B2 — 8 campos, 22.488 filas derivadas de archivos, 4 minoritarias `double_reviewed` (2.032 filas).
3. **split_v1:** B3 — stratificated 70/15/15 seed 42 con `stratified_group_split`; tabla de conteos esperados por clase incluida.
4. **curated/:** B4 — copias físicas desde membresías; gates de consistencia.
5. **Benchmark inputs:** B5 — curated + labels + splits + manifests + checksums + card + report; `experiment_id` listo, sin entrenar.
6. **Nota operativa:** en la ejecución real se requiere la decisión D1 (manifiesto local fuente real) y orden de Bernardo.

---

*Playbook de construcción del Dataset V2 v1. Modo SOLO DISEÑO DOCUMENTAL: sin modificación de datos, sin ejecución, sin entrenamiento, sin commits. Ejecución B0–B5 en misión operativa posterior.*