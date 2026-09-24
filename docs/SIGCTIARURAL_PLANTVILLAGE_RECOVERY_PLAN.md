# SIGCTiArural — PLANTVILLAGE RECOVERY PLAN (Materialización desde copia existente)

**Documento:** SIGCTIARURAL_PLANTVILLAGE_RECOVERY_PLAN
**Clasificación:** ⚙️ **SOLO LECTURA + PLANIFICACIÓN OPERATIVA** · NO CANÓNICO (operativo)
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `5a079f4`
**Modo:** SOLO LECTURA + PLANIFICACIÓN OPERATIVA. **NO DESCARGAR · NO MODIFICAR DATASET ORIGINAL · NO ELIMINAR ARCHIVOS · NO COMMITS.**
**Base de lectura:** READINESS_REPORT (§1.15 bloqueante de origen, §5 estructura v1) · EXECUTION_PLAN (§1-2, §4) · DATASET_V2_MASTERPLAN · 5 manifests (especialmente `raw_source_manifest`) · `AGRICULTURE_AI_V2_DATASET_INVENTORY` · taxonomía_v1/label_schema_v1.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado. NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
**Dato de contraste:** el bloqueante histórico del READINESS_REPORT era "el origen no existe en esta máquina"; este plan lo resuelve con la copia local confirmada en `D:\RespaldoData\PlantVillage-Dataset`.

---

## 0. HECHO NUEVO CONFIRMADO (verificado 2026-09-23)

| Atributo | Valor |
|---|---|
| Ubicación | `D:\RespaldoData\PlantVillage-Dataset` |
| Naturaleza | Clon del repositorio oficial **spMohanty/PlantVillage-Dataset** (README cita Mohanty, Hughes & Salathé 2016, DOI 10.3389/fpls.2016.01419) |
| Estado de solo lectura | ✅ intacta (no modificada, no eliminada, no movida) |
| Requiere descarga | **NO** — fuente oficial local, fin del bloqueante de Kaggle/credenciales |

---

## 1. ESTRUCTURA EXACTA DEL DATASET ENCONTRADO

```
D:\RespaldoData\PlantVillage-Dataset\
├── raw/
│   ├── color/        ✅ 38 carpetas clase · 54.305 archivos (~0,79 GB) ← USAR
│   ├── grayscale/    ⚠️ derivada oficial (NO usar para V2)
│   └── segmented/    ⚠️ derivada oficial (NO usar para V2)
├── generated_for_paper/  ⚠️ figuras .eps del paper (NO son datos)
├── leaf_grouping/        ⚠️ mapas/nombres por hoja (NO datos de imagen)
├── data_distribution_for_SVM/  ⚠️ particiones train/test pre-hechas (NO usar)
├── utils/                 ⚠️ herramientas
├── leaf-map.json          ⚠️ mapa de nombres (referencia)
├── README.md · .gitignore
└── scripts: _generate_data.sh · generate_data_{color,grayscale,segmented}-{20-80,40-60,50-50,60-40,80-20}.sh ·
    create_data_distribution.py · create_db.py · generate_data_for_SVM.py · generate_lmdb.sh ·
    generate_mapstring.py · run_all.sh · slurm-*.out
```

**Dictamen de identidad:** corresponde al **PlantVillage esperado** (repo oficial spMohanty completo). No es un espejo corrompido ni un subset: `raw/color` contiene las 38 clases del dataset original de 54.305 imágenes en resolución/tamaño nativos.

---

## 2. CLASES REALES PRESENTES Y CONTEOS EXACTOS (medido, no estimado)

### 2.1 Conteo global `raw/color` (verificado)

| Métrica | Valor medido |
|---|---|
| Archivos totales | **54.305** (54.303 `.jpg` + 1 `.jpeg` + 1 `.png`) |
| Carpetas clase | **38** |
| Tamaño | ~0,79 GB |
| Archivos no-imagen dentro de clases V2 | 0 |

### 2.2 Mapeo de las 16 clases V2 → carpetas fuente (medido)

| # | Carpeta fuente (`raw/color`) | Clase canónica `species__condition` | Conteo copia | Conteo inventario canónico | Estado |
|---|---|---|---|---|---|
| 1 | `Tomato___healthy` | `tomato__healthy` | 1.591 | 1.591 | ✅ |
| 2 | `Tomato___Early_blight` | `tomato__early_blight` | 1.000 | 1.000 | ✅ |
| 3 | `Tomato___Late_blight` | `tomato__late_blight` | 1.909 | 1.909 | ✅ |
| 4 | `Tomato___Leaf_Mold` | `tomato__leaf_mold` | 952 | 952 | ✅ |
| 5 | `Tomato___Septoria_leaf_spot` | `tomato__septoria_leaf_spot` | **1.771** | **(443)** | ⚠️ **DIVERGENTE** |
| 6 | `Tomato___Bacterial_spot` | `tomato__bacterial_spot` | 2.127 | 2.127 | ✅ |
| 7 | `Tomato___Target_Spot` | `tomato__target_spot` | 1.404 | 1.404 | ✅ |
| 8 | `Tomato___Tomato_mosaic_virus` | `tomato__mosaic_virus` | 373 | 373 | ✅ |
| 9 | `Tomato___Tomato_Yellow_Leaf_Curl_Virus` | `tomato__yellow_leaf_curl_virus` | 5.357 | 5.357 | ✅ |
| 10 | `Potato___healthy` | `potato__healthy` | 152 | 152 | ✅ |
| 11 | `Potato___Early_blight` | `potato__early_blight` | 1.000 | 1.000 | ✅ |
| 12 | `Potato___Late_blight` | `potato__late_blight` | 1.000 | 1.000 | ✅ |
| 13 | `Corn_(maize)___healthy` | `corn__healthy` | 1.162 | 1.162 | ✅ |
| 14 | `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` | `corn__cercospora_gray_leaf_spot` | 513 | 513 | ✅ |
| 15 | `Corn_(maize)___Common_rust_` | `corn__common_rust` | 1.192 | 1.192 | ✅ |
| 16 | `Corn_(maize)___Northern_Leaf_Blight` | `corn__northern_leaf_blight` | 985 | 985 | ✅ |
| | **TOTAL** | | **22.488** | **(21.160)** | ⚠️ **+1.328** |

### 2.3 Análisis de la divergencia (hallazgo crítico, registrado con honestidad)

- **La diferencia de 1.328 imágenes proviene ENTERAMENTE de `Tomato___Septoria_leaf_spot`.**
- 1.771 (copia) − 443 (inventario) = **1.328** = diferencia exacta total.
- Las otras 15 clases **coinciden 100%** con el inventario canónico (min 152 Potatoh · max 5.357 TomatoYLCV · ratio 35,24× → verificable con la copia: 5.357/152 = 35,24× ✓).
- Interpretación: el inventario canónico fue auditado sobre una variante **reducida** de la clase Septoria (443), o sobre un subset; esta copia contiene la clase **completa oficial** (1.771, valor del dataset spMohanty).
- **Implicación de gobernanza:** la apertura del `raw_source_manifest` contra esta nueva fuente puede resultar en **dataset V2 de 22.488 imágenes** (versión completa) en vez de 21.160 (versión auditada), o en **submuestreo de Septoria a 443** para preservar el conteo canónico. **NO es decisión de esta misión** (solo lectura + planificación); es un **GATE de Bernardo** (§5.4).

---

## 3. COMPATIBILIDAD CON DATASET V2 CANÓNICO

| Requisito canónico | Estado con esta copia |
|---|---|
| Identidad `agriculture_images_tomato-potato-corn_taxonomy-v1_labels-v1_dataset-v1` | ✅ compatible |
| 3 especies (tomate, papa, maíz) | ✅ presentes (38 clases → 9+3+4 V2) |
| 16 clases | ✅ las 16 cartelas V2 existen con nombres oficiales |
| Fuente `raw/color` (excluir grayscale/segmented/generated_for_paper) | ✅ `raw/color` aislado e intacto — exclusiones exactas definidas (§4.3) |
| Clase Spider-mite excluida | ✅ `Tomato___Spider_mites Two-spotted_spider_mite` queda fuera de las 16 |
| `labels_v1.csv` derivable (8 campos) | ✅ sample_id → archivos exactos enumerados |
| Tamaño (~1–2 GB esperado) | ✅ 0,32 GB subset (~1,5 GB con estructura v1 completa) |
| Anti-fuga pHash + split 70/15/15 seed 42 | ✅ independiente de la fuente (pipeline posterior) |
| **Contaje 21.160** | ⚠️ la copia da **22.488** por Septoria completa → GATE §5.4 |

---

## 4. RESPUESTAS A LAS 6 PREGUNTAS DE LA MISIÓN

### P1. ¿La copia encontrada corresponde al PlantVillage esperado?
**SÍ.** Es el repositorio oficial **spMohanty/PlantVillage-Dataset** completo (README con cita del paper 2016, estructura `raw/{color,grayscale,segmented}`, `leaf-map.json`, scripts `generate_data_*`, `generated_for_paper`). Las 16 clases V2 existen con los nombres oficiales exactos (guiiones bajos y paréntesis incluidos) y 15 de 16 coincide 1:1 con el inventario canónico.

### P2. ¿Qué carpetas deben utilizarse?
**Solo** `D:\RespaldoData\PlantVillage-Dataset\raw\color`, y **solo las 16 carpetas** de la tabla §2.2. Las demás carpetas de `color` (22 clases fuera de alcance V2, ej. Orange, Soybean, Grape, Apple… — que quedarán para extensiones futuras del contexto Agricultura) **no se copian** en el RAW v1 (pueden referenciarse como existentes sin tocar).

### P3. ¿Qué carpetas deben excluirse?
| Excluir | Razón |
|---|---|
| `raw/grayscale` | Derivada oficial, prohibida por `curation_manifest` (SOLO color) |
| `raw/segmented` | Ídem |
| `raw/color` clases fuera de las 16 | Fuera de taxonomía_v1 |
| `Tomato___Spider_mites Two-spotted_spider_mite` | Exclusión explícita del inventario |
| `generated_for_paper/` | Figuras `.eps` del paper, no datos |
| `leaf_grouping/` · `data_distribution_for_SVM/` · `utils/` · `leaf-map.json` · scripts/sh/slurm | No son imágenes; la distribución SVM pre-hecha NO debe usarse (split propio V2 gana) |

### P4. ¿Dónde está exactamente `raw/color`?
`D:\RespaldoData\PlantVillage-Dataset\raw\color` (38 carpetas clase, verificado: 54.305 archivos). **Punto de origen único e inmutable** de la materialización.

### P5. ¿Cómo construir `data/datasets/agriculture_images_tomato-potato-corn/v1/RAW/` sin tocar la copia original?
**Copiando (nunca moviendo, nunca limpiando).** El destino es el árbol definido en `EXECUTION_PLAN §2` dentro del repo:

```
sigcTiArural\data\datasets\agriculture_images_tomato-potato-corn\v1\
├── RAW\                            # ← SE POBLA POR COPIA (ReadOnly en origen)
│   ├── tomato__healthy\ …          # 16 carpetas con nombres canónicos species__condition
│   └── corn__northern_leaf_blight\
├── curated\ (train/validation/test)      # se genera DESPUÉS del split (Fase posterior)
├── split_lists\ {train,validation,test}.csv
├── labels\ labels_v1.csv
├── holdout\ real_world_holdout_v1\ (vacía e intocable)
├── manifests\ (5 YAML, hash = canónico)
├── dataset_card.md · split_report.md · CHECKSUMS.sha256
```

Reglas de inmutabilidad (del Execution Plan): RAW inmutable tras verificación; `curated/` se genera UNA vez; `holdout/` jamás se particiona; binarios NO versionados por git (manifiesto + checksum son la versión).

### P6. ¿Cuál es el procedimiento exacto?
Ver §5 (procedimiento en fases, con comandos PowerShell *propuestos* — **planificados, no ejecutados** en esta misión).

---

## 5. PROCEDIMIENTO EXACTO (PLANIFICACIÓN — NO EJECUTADO)

> MODO: planificación operativa. Los comandos se especifican para su ejecución en fase autorizada por Bernardo; **no se ejecutan en esta misión**. No se modifica el origen (`-LiteralPath` + `Copy-Item`, nunca `Move-Item`).

### Fase F0R — Reconciliación de fuente (GATE de Bernardo)
1. Decidir el conteo objetivo de `tomato__septoria_leaf_spot`:
   - **Opción A (recomendada):** usar la **clase completa oficial (1.771)** → dataset V2 = **22.488/16/3**. Requiere actualizar el `raw_source_manifest` (versión de apertura del raw, cambio documentado con justificación científica) y el conteo en label/split spec. Volumen +0,32 GB, sin costo adicional.
   - **Opción B (conservadora):** **submuestrear Septoria a 443** para conservar el 21.160/16/3 canónico (seed 42, selección determinista). Preserva el número exacto publicado pero descarta 1.328 imágenes válidas.
2. Verificar contra `raw_source_manifest.agriculture_v2_dataset_v1.yaml` (hash de carpetas/estado declarado) y registrar el dictamen.

### Fase F1R — Creación del árbol y copia RAW (24 carpetas → 16)
```
1. mkdir -p data\datasets\agriculture_images_tomato-potato-corn\v1\RAW
2. para cada par (origen → destino) de la tabla §2.2:
     New-Item -ItemType Directory -Path v1\RAW\<species>__<condition>
     Copy-Item -LiteralPath "<D:\RespaldoData\...\raw\color\<CarpetaOrigen>*" `
               -Destination v1\RAW\<species>__<condition>\ -Recurse
3. Renombrado de archivos a sample_id (patrón del label schema):
     <species>__<condition>__<n>.<ext>   (n = índice secuencial con ZeroPadding)
     → se materializa con un script de copia+renombre determinista (lista previa generada, nunca in-place).
```

### Fase F2R — Verificación de integridad
1. Conteo por clase destino vs tabla §2.2 (correcto esperado: 22.488 o 21.160 según GATE).
2. Extensiones: 100% imagen; 0 no-imagen.
3. `CHECKSUMS.sha256` (raíz v1 + por carpeta), registrado en `dataset_card.md`.
4. No fuga de clases: 16 carpetas exactas, sin Spider-mite, sin grayscale/segmented.

### Fase F3R — Etiquetado y split (depende del GATE F0R)
1. `labels_v1.csv` (8 campos): derivado de la taxonomía + lista de archivos; etiquetas fuente → `source_dataset_audited`; 4 clases minoritarias (potato healthy, tomato mosaic, septoria **según conteo elegido**, corn gray) → `double_reviewed`.
2. Dedup exacto + pHash (anti-fuga), split 70/15/15 stratificado seed 42 → `split_lists/`.
3. Generar `curated/` UNA vez; `split_report.md` con censos por clase × partición.

### Fase F4R — Cierre y gobernanza
- `dataset_card.md`, manifiestos en `v1/manifests/` (hash = canónico), `real_world_holdout_v1/` reservada vacía.
- Sin commits (gobernanza del repo). Los binarios NO se versionan; se versiona el manifiesto + checksum + split CSV.

**Estimación de espacio:** subset 16 clases 0,32 GB → `v1` completo estimado ~1,5 GB. C:\ libre hoy: **19,06 GB** → viable sin problema (levanta el NO GO por disco de Fase 0).

---

## 6. RAZÓN POR LA QUE ESTE PLAN DESBLOQUEA LA FASE 0

| Bloqueante histórico (READINESS_REPORT §1, §4) | Estado con esta misión |
|---|---|
| Origen PlantVillage no existe en esta máquina | ✅ RESUELTO — `D:\RespaldoData\PlantVillage-Dataset` confirmado |
| Sin `.kaggle/kaggle.json` para descargar | ✅ NO NECESARIO — fuente local, droga Kaggle fuera |
| Disco 19,9 GB ajustado | ✅ 0,32 GB subset → confortable |
| Contaje 21.160 por confirmar | ⚠️ 22.488 real (Septoria completa) → GATE Bernardo §5.4 |

---

## 7. RESULTADO FINAL

### ¿Puede Dataset V2 construirse a partir de esta copia existente? → **SÍ**

**Justificación:**
- ✅ **Identidad verificada:** copia oficial spMohanty/PlantVillage-Dataset completa, `raw/color` con las 16 clases V2 en sus nombres canónicos exactos.
- ✅ **Conteos:** 15/16 clases coinciden 1:1 con el inventario canónico (min 152 · max 5.357 · ratio 35,24× verificables en la copia).
- ✅ **Exclusiones:** grayscale, segmented, generated_for_paper, Spider-mite, 22 clases fuera de alcance → definidas y aislables sin tocar el origen.
- ✅ **Vía de materialización:** copia (nunca movimiento) hacia `data/datasets/agriculture_images_tomato-potato-corn/v1/RAW/`, con renombrado determinista a sample_id y checksum — inmutable y trazable.
- ✅ **Recursos:** 0,32 GB subset · 19,06 GB libres → sin bloqueante de disco ni de descarga.
- ✅ **Honestidad preservada:** la única divergencia (Septoria: 1.771 vs 443) está documentada y su resolución (22.488 completo vs 21.160 remuestreado) se delega explícitamente a Bernardo en el GATE F0R. NADA se presenta como validez de campo: el RAW es bootstrap de laboratorio.

**Condiciones del SI:**
1. Aprobación de Bernardo sobre el conteo de Septoria (§5.4, Opción A o B).
2. Ejecución autorizada de F1R–F4R (esta misión es SOLO LECTURA + PLANIFICACIÓN).
3. Verificación final contra `raw_source_manifest` y actualización del manifiesto si se opta por 22.488.

---

## 8. Anexo — Comandos propuestos para fase autorizada (NO ejecutados)

```powershell
# F1R — ejemplo de copia de UNA clase (repetir para las 16 con mapeo §2.2)
$src = "D:\RespaldoData\PlantVillage-Dataset\raw\color\Tomato___healthy"
$dst = "data\datasets\agriculture_images_tomato-potato-corn\v1\RAW\tomato__healthy"
New-Item -ItemType Directory -Path $dst -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $src '*') -Destination $dst -Force

# F2R — verificación de conteo por clase destino
Get-ChildItem -LiteralPath $dst -File | Measure-Object | Select-Object -ExpandProperty Count

# F2R — checksum de carpeta (después de estabilizar RAW)
Get-FileHash -LiteralPath (Join-Path $dst '*') -Algorithm SHA256 | Export-Csv v1\CHECKSUMS.sha256 -NoTypeInformation
```

*(Estos comandos son referencia de plan; su ejecución requiere orden explícita de Bernardo. Ningún archivo del origen fue modificado, movido o eliminado durante esta misión. Sin commits.)*