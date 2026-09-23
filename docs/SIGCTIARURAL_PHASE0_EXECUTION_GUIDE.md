# SIGCTiArural — PHASE 0 EXECUTION GUIDE (Materialización del Dataset Bootstrap V2)

**Documento:** SIGCTIARURAL_PHASE0_EXECUTION_GUIDE
**Fecha:** 2026-09-22 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `86d545e`
**Tipo:** Guía operativa de ejecución de la **FASE 0** (adquisición + base física del Dataset V2) para correr en **ASUS**.
**Modo:** SOLO LECTURA + PLANIFICACIÓN. No se implementó, no se creó código, no se modificó ningún archivo salvo este documento, no se commiteó.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado. NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
**Base de lectura:** MASTERPLAN · EXECUTION_PLAN · INVENTORY · READINESS_REPORT (todos leídos).

---

## 1. Contexto y objetivo de la Fase 0

La auditoría de readiness concluyó: diseño V2 **100% completo** (5 manifests, taxonomía, label schema, split spec, GO laboratorio) y **materialización física 0%**. El cuello de botella es **DATA**. La opción seleccionada fue **A — Materializar Dataset V2**.

**FASE 0 = bloques previos sin los cuales nada del split (F2), la curación (F1/F3) ni el benchmark (F4/F5) es ejecutable.** Su único entregable tangible es el **directorio físico `v1/`** con la estructura base, más el `RAW/` descargado, verificado y congelado.

**Identidad de destino (bootstrap):**
- `agriculture_images_tomato-potato-corn` · versión `v1` · máx `agriculture_v2_*`
- **21.160 imágenes** RGB (extensión .jpg/.jpeg/.png) · **16 clases** · **3 especies**
- Especies: Tomato (9), Potato (3), Corn/maize (4)
- Clase excluida de Tomato: `Tomato___Spider_mites Two-spotted_spider_mite`
- Subset análizado: **solo `raw/color`** (prohibido grayscale/segmented/generated)
- Origen canónico según manifest: `PlantVillage-Dataset-master/raw/color`

---

## 2. Estructura física exacta de carpetas (a crear en ASUS)

**Raíz recomendada:** dentro del repo SIGCTiArural clonado, `data/datasets/...` (el `.gitignore:62` ya excluye `/data/`, por lo que **NUNCA** entra a git; se versiona por manifiesto + checksum, regla MLOps del MASTERPLAN §9).

```
data/
└── datasets/
    └── agriculture_images_tomato-potato-corn/
        └── v1/
            ├── RAW/                          ← 🟢 único bloque materializado en Fase 0
            │   ├── tomato__bacterial_spot/           (2.127)
            │   ├── tomato__early_blight/             (1.000)
            │   ├── tomato__late_blight/              (1.909)
            │   ├── tomato__leaf_mold/                (   952)
            │   ├── tomato__septoria_leaf_spot/       (1.771)
            │   ├── tomato__target_spot/              (1.404)
            │   ├── tomato__yellow_leaf_curl_virus/   (5.357)
            │   ├── tomato__mosaic_virus/             (   373)
            │   ├── tomato__healthy/                  (1.591)
            │   ├── potato__early_blight/             (1.000)
            │   ├── potato__late_blight/              (1.000)
            │   ├── potato__healthy/                  (   152)
            │   ├── corn__cercospora_gray_leaf_spot/  (   513)
            │   ├── corn__common_rust/                (1.192)
            │   ├── corn__northern_leaf_blight/       (   985)
            │   └── corn__healthy/                    (1.162)
            └── manifests/
                ├── raw_source_manifest.agriculture_v2_dataset_v1.yaml   ← copia + actualización source_root a ASUS
                ├── curation_manifest.agriculture_v2_dataset_v1.yaml
                ├── taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml
                ├── split_manifest.agriculture_v2_split_v1.yaml
                └── baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml
```

Nota sobre el mapeo de nombres: LOS nombres de carpeta de `RAW/` siguientes a la **nomenclatura canónica de la taxonomía `agriculture_v2_taxonomy_v1`** (species__condition), verificable contra `docs/ai/research_v2/AGRICULTURE_AI_V2_TAXONOMY.md` y el taxonomy_binding_manifest (que asigna `canonical_class_id → PlantVillage class name`). Los conteos entre paréntesis son los inventariados en `DATASET_V2_INVENTORY` y son **valores esperados de verificación**, NO se presumen: se comprueba que sumen 21.160.

**Carpetas creadas pero VACÍAS en esta fase** (se materializan en F1–F3):
`curated/`, `curated/train/`, `curated/validation/`, `curated/test/`, `split_lists/`, `labels/`, `holdout/`. Archivos de metadata (`dataset_card.md`, `split_report.md`, `CHECKSUMS.sha256`) se crean en F1 y F3 respectivamente.

---

## 3. Espacio requerido en disco (estimación honesta)

| Componente | Tamaño estimado | Notas |
|---|---|---|
| Zip descargado (Kaggle PlantVillage completo) | **2.5–3.5 GB** | Dataset Kaggle incluye color/grayscale/segmented |
| Descomprimido total (todas las variantes) | 8–12 GB | Se descarta lo no incluído tras extraer |
| **`RAW/` (solo 16 clases `raw/color`)** | **1.5–2.5 GB** | Lo único que se conserva |
| `manifests/` + estructura vacía | < 1 MB | Insignificante |

**Recomendación:**
- **Espacio libre mínimo: 20 GB** (descarga + extracción temporal + RAW).
- **Espacio recomendado: 30 GB** (margen para pipelines/cachés de TF y el dataset completo temporal si no se elimina el zip).
- **Se aconseja verificar antes: `Get-PSDrive C`** en la ASUS (DEBE mostrar ≥ 20 GB libres) — si ASUS tiene **SSD/NVMe con ≥ 30 GB libres**, ejecutar la Fase 0 en el disco de sistema; de lo contrario, en una segunda unidad de datos con la misma estructura `data\datasets\...` (mantener la misma ruta realtiva dentro del repo).

**Advertencia sobre el disco actual (C: 19.3 GB libres de 237):** la máquina de desarrollo (BagmDev) NO tiene margen seguro. La Fase 0 se ejecuta en **ASUS**, no aquí.

---

## 4. Ubicación recomendada del dataset (decisión)

**Opción elegida: `data/datasets/agriculture_images_tomato-potato-corn/v1/` dentro del repo clonado en ASUS.**

Justificación:
1. El `.gitignore` ya excluye `/data/` (no hay riesgo de commit accidental).
2. La estructura coincide con el Execution Plan §2 (árbol canónico `v1/`).
3. Mantiene coherencia entre código, manifiesto y datos: el pipeline F2–F4 leerá `data/datasets/.../v1/RAW/` sin rutas externas frágiles.
4. `raw_source_manifest` declara `allow_external_path: true` E indica una `source_root` que **no existe** (`C:\Users\Devbadolgm\...`) — como final de la Fase 0 se **actualiza `source_root` en la copia local de `manifests/` del dataset** a la ruta real de ASUS (la copia canónica en `docs/ai/manifests/` se mantiene intacta; el manifiesto del dataset es el que describe el artefacto físico).

Alternativa no elegida (documentada): rotar la ruta canónica original en ASUS (`C:\Users\<usuarioASUS>\Development\workspace\DatosProyectos\PlantVillage-Dataset-master`). Se rechaza por duplicar raíces y repetir el error de la ruta fija inexistente.

---

## 5. Procedimiento detallado (ejecutar en ASUS, con orden de Bernardo)

### Preparación
| Paso | Acción | Comando / evidencia |
|---|---|---|
| P0.1 | Clonar/quedarse al día en la rama `feature/ubtn-biological-telemetry` (HEAD `86d545e`) | `git -C <repo> status` limpio, salvo artefactos conocidos (`dashboard_rc2_ui.patch`) |
| P0.2 | Verificar espacio libre | `Get-PSDrive C` → LibreGB ≥ 20 |
| P0.3 | Crear estructura de carpetas | `data/datasets/agriculture_images_tomato-potato-corn/v1/{RAW,curated/{train,validation,test},split_lists,labels,holdout,manifests}` |
| P0.4 | Copiar los 5 manifests desde `docs/ai/manifests/` a `v1/manifests/` | `Copy-Item` + hash posterior |

### Descarga del origen (estrategia)
| Paso | Vía A (recomendada) | Vía B (fallback) |
|---|---|---|
| D0.1 | **Kaggle API**: preparar credencial `~/.kaggle/kaggle.json` (cuenta de Bernardo) | Descarga manual del zip de mirror alternativo |
| D0.2 | `kaggle datasets download -d abdallahalidev/plantvillage-dataset -p <tmp>` (dataset contenedor) | Navegador → descargar zip PlantVillage completo |
| D0.3 | Verificar SHA del zip descargado contra el publicado por Kaggle/dataset page | Ídem |
| D0.4 | Extraer zip a directorio temporal `<tmp>\PlantVillage-Dataset-master\` | 7-Zip/Expand-Archive |

**Regla de extracción:** se descarga el dataset completo (todas las variantes) para rehidratarlo bajo exactamente el árbol original del que deriva el manifiesto, pero **solo se consolida en `v1/RAW/` el subset `raw/color` con las 16 clases del scope** (9 Tomato + 3 Potato + 4 Corn). `raw/grayscale`, `raw/segmented` y `generated_for_paper` se descartan (policy de no-fuga del manifest: exclusions explícitas).

### Consolidación y congelado
| Paso | Acción | Evidencia |
|---|---|---|
| C0.1 | Por cada clase inclusión: mover/copiar `raw/color/<PlantVillage class name>/` → `v1/RAW/<canonical>/` renombrando según la taxonomía | Tabla de mapeo (taxonomy_binding_manifest) |
| C0.2 | Excluir explícitamente `Tomato___Spider_mites Two-spotted_spider_mite` | No existir carpeta en `RAW/` |
| C0.3 | Verificar extensiones: SOLO .jpg/.jpeg/.png (0 .png tf no permitidos) | `Get-ChildItem -Recurse | Group Extension` |
| C0.4 | Conteo global = 21.160; por clase = conteos del INVENTORY (tabla §2) | Suma por carpeta == valor esperado |
| C0.5 | Generar `v1/CHECKSUMS.sha256` (hash de cada archivo) | `Get-FileHash -Algorithm SHA256` |
| C0.6 | Marcar `RAW/` como **inmutable** (solo lectura) — el split (F2) NO debe reescribir `RAW/` | `attrib +R /S` o equivalente |
| C0.7 | Actualizar `source_root` en `v1/manifests/raw_source_manifest.*.yaml` → ruta real ASUS de `RAW/` | Commit de anotación de ruta NO hace falta; queda como metadata local del dataset |
| C0.8 | Registrar en AGENTS/bitácora el estado: `RAW materializado` (en la siguiente misión de sincronización documental) | Pendiente (no se toca nada hoy) |

---

## 6. Checklist de validación (puertas de la Fase 0)

| # | Gate | Criterio de éxito |
|---|---|---|
| 1 | Espacio | LibreGB ≥ 20 antes de descarga |
| 2 | Credencial Kaggle (Vía A) | `kaggle datasets list` responde sin error |
| 3 | Zip íntegro | SHA del zip == referencia |
| 4 | Árbol origen hidratado | Existe `...\PlantVillage-Dataset-master\raw\color\` |
| 5 | 16 carpetas de clase en `RAW/` | Cuenta = 16; nombres == canónicos |
| 6 | Exclusiones ausentes | 0 carpetas grayscale/segmented/generated; 0 `Spider_mites` |
| 7 | Extensiones válidas | 100% .jpg/.jpeg/.png |
| 8 | Conteo global | **Suma exacta = 21.160** |
| 9 | Conteos por clase | Coinciden con INVENTORY (incl. mínimo 152 `potato__healthy`, máximo 5.357 `tomato__yellow_leaf_curl_virus`) |
| 10 | Checksums | `CHECKSUMS.sha256` generado y redondeable |
| 11 | Manifests locales | 5 YAML presentes en `v1/manifests/`, hash YAML == copia canónica (salvo `source_root` actualizado) |
| 12 | Inmutabilidad | `RAW/` solo-lectura; carpeta `data/` NO trackeada por git (`git status` no la lista) |

**Puerta de calidad dura:** si las gates 5, 6, 8 ó 9 fallan → **STOP**: NO se avanza a F1. Se corrige el origen (re-descarga / re-mapeo) sin alterar `RAW/` (se re-descarga en limpio si fuera necesario). No se "parchean" conteos.

---

## 7. Riesgos de la Fase 0 y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Sin credencial Kaggle en ASUS (no existe `~/.kaggle/kaggle.json` en BagmDev) | Media | Retraso descarga Vía A | Bernardo crea API key; o Vía B (descarga manual) |
| Kaggle requiere torneo/condiciones (dataset puede requerir login) | Media | Bloqueo | Fallback Vía B zip manual/mirror (GitHub spMohanty/PlantVillage-Dataset) |
| Bytes del zip parciales por corte | Media | Datos corruptos | SHA vs referencia; `Expand-Archive` falla a la primera señal |
| Extracción completa > 12 GB en disco ASUS | Media | Insuficiencia | Verificar ≥ 20 GB; borrar zip+árbol temporal tras C0.5 |
| Error de mapeo de clase PlantVillage → canónico | Media | Contaminación taxonómica | Verificar contra taxonomy_binding_manifest; nunca inventar nombres |
| Incluir accidentalmente Tomato__Spider_mites | Baja | Rompe conteo 21.160 | Filtro explícito; gate 6 |
| Olvidar congelar RAW y que un pipeline reescriba | Baja | Invalida checksums | attrib +R S; gate 12 |
| `data/` entrando a git | Baja | Repo corrupto | `.gitignore:62` ya excluye; gate 12 |
| Fuente externa cambia el layout del dataset en el tiempo | Baja | Ruta rota | Inmutabilidad del dataset Kaggle; documentar versión descargada |
| Ejecutar Fase 0 en la máquina BagmDev (disco 19.3 GB) | Alta si se decide | No hay margen | **Ejecutar en ASUS**; no en BagmDev |

---

## 8. GO / NO GO de la Fase 0

**GO (paso a F1 — etiquetas):**
1. Puertas 1–12 del checklist en 🟢.
2. `RAW/` congelado con los 21.160 archivos y 16 carpetas canónicas.
3. `v1/CHECKSUMS.sha256` legible y computable.
4. `v1/manifests/` con 5 YAML (fuente canónica intacta; `source_root` local actualizado).
5. `git status` limpio de `data/` (sigue siendo untracked por diseño).

**NO GO (y no avanzar a F1 bajo ninguna condición):**
- Cualquier gate 5, 6, 8 ó 9 en 🔴.
- RAW modificable después de checksums.
- Disco con menos de 20 GB al iniciar la descarga.
- Descarga de un subset distinto al del manifiesto (p. ej. "todas las 38 clases") sin re-negociar el scope como documento formal.

---

## 9. Estado tras la Fase 0 (estado del mundo esperado)

```
🟢 data/datasets/agriculture_images_tomato-potato-corn/v1/RAW/   → 21.160, 16 clases, checksums, inmutable
🟢 data/datasets/agriculture_images_tomato-potato-corn/v1/manifests/ → 5 YAML (source_root local = ASUS)
🟡 v1/curated/ · v1/split_lists/ · v1/labels/ · v1/holdout/      → creadas y vacías (destino F1–F3)
🔴 Pipeline F1 (labels), F2 (split 70/15/15 seed 42), F3 (curated), F4 (benchmark) → pendientes de misión posterior
```

---

## 10. PREGUNTA FINAL — Primera acción de Bernardo al iniciar la Fase 0

**Respuesta (una sola acción concreta):**

> **Crear y validar la credencial de Kaggle API en la ASUS: generar la API Key desde la cuenta de Bernardo (`kaggle.com/settings/API → Create New Token`), colocar el archivo en `~\.kaggle\kaggle.json` y ejecutar `kaggle datasets list` para confirmar que la autenticación responde.**

Sin esta credencial, la Vía A de descarga (recomendada) no puede empezar ni verificar el dataset; es el único paso de la Fase 0 que depende exclusivamente de una acción humana antes de que cualquier comando de descarga/validación sea ejecutable.

---

*Guía de ejecución de la Fase 0 del Dataset V2 (Materialización del bootstrap). Modo SOLO LECTURA + PLANIFICACIÓN: sin implementación, sin código, sin modificación de archivos (solo creación de este documento), sin commits. Ejecución prevista en ASUS, con orden explícita de Bernardo.*