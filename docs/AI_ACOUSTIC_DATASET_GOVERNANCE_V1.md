# AI ACOUSTIC DATASET — GOBERNANZA, ESTRUCTURA Y PREPARACIÓN v1

**Misión:** `CMSC_DATASET_GOVERNANCE_AND_STRUCTURE_V1` · **Fecha/hora:** **2026-10-04 · 04:02** (America/Bogota, UTC-05:00) · **HEAD:** `83b6089` (sin commits de esta misión)
**Ventana:** el cierre de sesión previo (`CMSC_SESSION_CLOSEOUT_2026_10_02`) fue el 2026-10-02 · 22:29; esta misión arranca tras ese corte.
**Estado del dataset:** **`PREPARADO_VACIO`** — estructura y gobernanza creadas · **0 muestras**
**Naturaleza:** preparación real. Sin capturar audio, sin descargar datasets, sin entrenar, sin implementar IA.

**Documento canónico de esta misión.** Especificación instantiated en
`data/datasets/sigct_rural_acoustic/v1/` (**fuera de git**, política `/data/` — `.gitignore:68`).

**Audita:** `docs/AI_ACOUSTIC_DATASET_V1_DESIGN.md` (362 líneas).
**Hereda de:** `AI_ACOUSTIC_FEATURE_MAP.md` · `AI_ACOUSTIC_ARCHITECTURE_V1.md` · `AI_ACOUSTIC_DATASET_REVIEW.md` ·
`AI_ACOUSTIC_MODEL_BENCHMARK.md` · gobernanza real de `data/datasets/agriculture_images_tomato-potato-corn/v1/`.

---

# 0. RESUMEN EJECUTIVO

La misión cambió el dataset acústico de **diseño** a **preparación real**, sin falsificar nada:

| Dimensión | Antes (diseño) | Ahora (preparación) |
|---|---|---|
| Árbol en disco | descrito en prosa (A.7) | **creado y verificado**: 46 directorios, 20 archivos |
| Contrato de datos | 21 columnas en tabla de prosa | **`schema.json` 1.2.0** con 42 columnas tipadas y gobernadas |
| Tabla maestra | `labels/acoustic_labels_v1.csv` (nombre) | **`metadata/metadata.csv`** + 5 columnas obligatorias nuevas |
| Taxonomía | 9 clases en tabla | **`labels.csv`** con binding `class_id ↔ dir_name` y estado AudioSet |
| Manifiestos | 5 YAML bosquejados | **5 YAML completos** con checks de aceptación AC-1..AC-9 |
| Gates | 6 criterios de una línea | **6 gates verificables** con evidencia y verificador |
| Split | ratios declarados | **`split_lists/` + `split_report.json`** con `NO_EJECUTADO` honesto |
| Estado | implícito | **`dataset_state` explícito** con máquina de 5 estados |
| Muestras | 0 | **0** (sigue siendo 0, y ahora está dicho por artefacto, no por memoria) |

**Auditoría (FASE 1): 14 observaciones.** 5 de severidad 🔴, 6 🟠, 3 🟡/🟢.
**8 se resolvieron en esta misión** (contrato y nomenclatura). **1 se resolvió documentando el binding.**
**4 requieren decisión de Bernardo** (§7), y la más urgente es `OBS-09` (dimensión de entrada de S81).

**Veredicto:** el diseño es sólido y no se rompe en ningún punto; sus debilidades son de **nomenclatura,
expresividad del esquema y verificabilidad de los gates**, no de arquitectura. Todo eso se corrige sin
tocar una sola línea de la arquitectura ya aprobada.

---

# 1. FASE 1 — AUDITORÍA DEL DISEÑO

Cada observación lleva: evidencia verificable en el código o el documento, severidad y resolución.

| ID | Observación | Evidencia | Sev. | Resolución |
|---|---|---|---|---|
| **OBS-01** | **Conflicto de estructura** entre el diseño (A.7: `RAW/`, `curated/`, `labels/`) y la estructura de misión (`raw/`, `train|validation|test/`, `metadata/`). | `AI_ACOUSTIC_DATASET_V1_DESIGN.md:133-160` vs misión FASE 2 | 🟠 | **Resuelto.** La estructura de misión es canónica. `curated/` queda **supersedido**; `labels/acoustic_labels_v1.csv` pasa a `metadata/metadata.csv`. **Cero migración** (0 archivos). Se registra errata; el diseño no se reescribe (§7 D-4). |
| **OBS-02** | **La estructura de misión omite 3 artefactos que los gates necesitan**: `split_lists/`, `holdout/` y `CHECKSUMS.sha256`. Omitirlos habría debilitado G-DS-3 y G-DS-4 en silencio. | A.8 (group split + holdout) · A.11 G-DS-4 | 🔴 | **Resuelto.** Los tres se crearon igual. Un gate sin artefacto verificable no es un gate. |
| **OBS-03** | **Carpeta `desconocido/` ≠ `class_id` `ruido_desconocido`.** Doble vocabulario para la misma clase. | Misión FASE 2 vs diseño A.4 | 🟡 | **Resuelto por binding explícito** en `labels.csv` (`dir_name`) y `schema.json` (`class_directories.map`). **PENDIENTE** decidir si se unifican en v2 (D-3). |
| **OBS-04** | **Aritmética de frames incorrecta.** El diseño dice "~65 frames por clip"; con 3,0 s = 132.300 muestras, N_FFT 4096 y hop 2048: `floor((132300-4096)/2048)+1` = **63** (64 con relleno de cola). | `spectralEngine.js:1` (`N_FFT = 4096`) + cálculo propio | 🟡 | **Resuelto.** `schema.json` declara `frames_count: 63` y documenta el caso con relleno. |
| **OBS-05** | **Typo de dominio: `cmcs_logger`** (en A.6 y A.10) en lugar de `cmsc_logger`. Se escribiría literalmente en los metadatos. | `AI_ACOUSTIC_DATASET_V1_DESIGN.md:129,210` | 🟡 | **Resuelto.** Valor canónico `cmsc_logger` en esquema, labels y manifiestos. El typo queda documentado como errata. |
| **OBS-06** | **Remuestreo no declarado — riesgo de dishonestidad de estado.** El diseño fija 44.100 Hz, pero los navegadores entregan habitualmente 48.000 Hz. Sin columnas de procedencia, el dataset declararía una tasa que no tiene. | A.2 (`sample_rate` 44.100 fijo) vs `getUserMedia` en `FEATURE_MAP §1` | 🔴 | **Resuelto.** 2 columnas obligatorias nuevas: `capture_source_rate` y `resample_method` (con valor `none` explícito). `resample_method` es obligatoria **aunque valga `none`**: negar el remuestreo es un dato. |
| **OBS-07** | **El `hop` se presenta como si fuera una constante del motor.** `spectralEngine.js` no define hop: corre por `requestAnimationFrame` con `N_FFT = 4096`, `DEFAULT_SAMPLE_RATE = 44100` y 3 `FREQ_BANDS`. | `spectralEngine.js:1-12` · A.2 ("Hop entre frames 2048") | 🟠 | **Resuelto por corrección de categoría.** El hop es un parámetro **offline del dataset** (extracción por frames), no una constante del instrumento en vivo. `schema.json` lo ubica en `clip_contract`. |
| **OBS-08** | **Doble fuente de verdad de la ubicación:** columna `file` + carpeta de clase + nombre de archivo. Tres representations que pueden divergir. | A.6 (`file`) + A.7 (`RAW/<class_id>/`) | 🟡 | **Resuelto.** `file` es autoritativo; la carpeta de clase + nombre son **reconstruibles**. La curación valida `file` ↔ `class_id` ↔ carpeta (AC-10). |
| **OBS-09** | **`acoustic.feat.window.v1` sigue `PROPUESTO (a aprobar por Bernardo)`**, pero es la **dimensión de entrada de S81**. Sin decidirlo no se puede construir el corpus de forma compatible con el clasificador. | A.3 · `ARCHITECTURE_V1 §4` (probabilidades por clase ⇒ asume vector fijo) | 🔴 | **PENDIENTE BERNARDO (D-1).** Es la decisión más urgente de esta misión. 3 opciones en §7. |
| **OBS-10** | **`features/` previsto como `.csv`;** con 5.400 clips × ~50 columnas el CSV es frágil de tipar para consumo en Python y `onnxruntime-web`. | A.7/B.6 (`acoustic_features_v1.csv`) | 🟢 | **Resuelto.** Se conserva el nombre base y se adopta `.parquet`. Decidir con 0 muestras es gratis; con 5.400 es una migración. |
| **OBS-11** | **G-DS-6 exige acuerdo de anotación, pero el esquema no tiene segundo anotador ni valor de acuerdo.** `confidence_annotator` (0..1) **no** es acuerdo inter-anotador: es confianza subjetiva. Gate imposible de verificar. | A.6 (`confidence_annotator`, `annotation_round`) vs A.11 G-DS-6 | 🔴 | **Resuelto.** Columnas nuevas `review_annotator_id` (opcional, vacía en ronda 1) y `agreement` (obligatoria, enum de 4 valores). `confidence_annotator` queda como opcional y **declarado que no es acuerdo**. |
| **OBS-12** | **Umbral de near-duplicate sin definir.** "correlación de niveles de energía por frame" no es un criterio verificable sin número. | A.8 (anti-leakage) · A.11 G-DS-3 | 🟠 | **Resuelto parcialmente.** Umbral **0.98 propuesto y declarado SIN CALIBRAR**; AC-9 bloquea al primer conflicto real. Calibrar con material real antes de cerrar G-DS-3 (D-2). |
| **OBS-13** | **Los `mid` de AudioSet nunca se verificaron.** El diseño los llama "orientativos" y delega la verificación a una "FASE 1b" que no existe como artefacto. | A.5 (nota de verificación) · A.11 G-DS-1 | 🟠 | **Resuelto por honestidad.** `labels.csv` y `taxonomy_binding_manifest` marcan cada `mid` como `UNVERIFIED`. Verificar es parte explícita de G-DS-1. **No se afirma enlace verificado que no se verificó.** |
| **OBS-14** | **El dataset no tenía estado legible por máquina.** "0 muestras" estaba escrito en prosa; ninguna herramienta podía leerlo. Riesgo directo: un reporte futuro podría afirmar avance sin evidencia. | A.1 (`estado: DISENO`) | 🟠 | **Resuelto.** `dataset_state` declarado en los **10 artefactos de control** (`schema.json` + 5 manifiestos YAML + `split_report.json` + `dataset_card.md` + 2 README) y máquina de 5 estados (§3.5). Por diseño **no** va en los CSV de datos ni en `CHECKSUMS.sha256`: son datos, no estado. |

## 1.1 Hallazgos positivos (lo que NO se rompe)

1. **Taxonomía bien pensada.** 9 clases, single-label en v1, `contaminated` + `secondary_classes` para multitag diferido, y `ruido_desconocido` correctamente tratado como **bucket OOD** que "nunca se fuerza a una clase viva". Es una decisión de diseño acertada.
2. **Anti-leakage con group split** por `(session_id, place_id)` + holdout de sitio. Es la defensa real contra domain shift; muchos datasets académica la omiten.
3. **`acoustic.feat.v1` es 100 % verificable en el código real.** Las 22 features tienen origen en `spectralEngine.js`; las 6 derivadas (`spectralBandwidthNorm`, `spectralRolloffNorm`, `zeroCrossingRate`, `crestFactor`, `spectralFlux`, `profileEntropy`) son cálculo trivial sobre datos ya disponibles. No hay feature imaginada.
4. **Los gates ya estaban en el lugar correcto.** G-DS-1..6 apuntaban a taxonomía, volumen, split, gobernanza, licencias y acuerdo. Lo que faltaba era su **expresividad verificable**, no su enfoque.
5. **Ética de voz y privacidad** ya estaban resueltas (local-only, sin retención de habla, consentimiento).
6. **Consistencia con el dataset agrícola** en la disciplina de manifiestos, `CHECKSUMS.sha256`, `dataset_card.md` y `split_report.json`. Copiar una gobernanza que ya funciona es mejor que inventar una nueva.

## 1.2 Lo que la auditoría **no** auditó (y por qué)

- **No** se verificó ninguna fuente pública contra su portal (FSD50K/ESC-50/Xeno-canto): la misión prohíbe descargar. La revisión FASE 1 (`AI_ACOUSTIC_DATASET_REVIEW.md`) ya lo hizo por búsqueda.
- **No** se midió nada de audio: no existe audio. Cualquier cifra acá sería inventada.
- **No** se entrenó ni se ejecutó el extractor.

---

# 2. FASE 2 — ESTRUCTURA FÍSICA CREADA

## 2.1 Árbol verificado

```
data/datasets/sigct_rural_acoustic/v1/          ← 46 directorios · 20 archivos
├── raw/<9 clases>/                            # 9  · introducción intocada
├── train/<9 clases>/                          # 9  · materialización curada
├── validation/<9 clases>/                     # 9  · materialización curada
├── test/<9 clases>/                           # 9  · materialización curada
├── holdout/real_world_holdout_v1/             # 1+1 · RESERVADA, vacía por diseño
├── metadata/                                  # gobernanza (6 archivos)
├── manifests/                                 # 5 manifiestos YAML
├── split_lists/                               # 3 CSV + split_report.json
├── features/                                  # caché derivada (vacía)
├── CHECKSUMS.sha256                           # integridad (generado con la 1ª ingesta)
├── dataset_card.md
└── README.md
```

**Clases (9):** `silencio` · `viento` · `lluvia` · `agua` · `insectos` · `ave` · `voz` · `motor` · `desconocido`

## 2.2 Artefactos creados (20)

| Ruta | Rol | Gobierno |
|---|---|---|
| `README.md` | mapa de la estructura + 7 reglas de la casa | OBLIGATORIA |
| `dataset_card.md` | tarjeta con inventario, distribución, licencias, riesgos | OBLIGATORIA |
| `metadata/schema.json` | **contrato legible por máquina** (42 columnas, gov., clip contract, versionado) | OBLIGATORIA |
| `metadata/README.md` | mapa obligatorio / obligatorio-herramienta / opcional / derivado | OBLIGATORIA |
| `metadata/metadata.csv` | **tabla maestra** (0 filas) | OBLIGATORIA |
| `metadata/labels.csv` | diccionario de 9 clases + binding + estado AudioSet | OBLIGATORIA |
| `metadata/manifest.csv` | inventario de artefactos (derivado) | DERIVADA |
| `metadata/places.csv` | vocabulario de sitios (opcional) | OPCIONAL |
| `manifests/raw_source_manifest.acoustic_v1.yaml` | procedencia y licencias | OBLIGATORIA |
| `manifests/curation_manifest.acoustic_v1.yaml` | reglas de ingesta + AC-1..AC-10 | OBLIGATORIA |
| `manifests/taxonomy_binding_manifest.acoustic_v1.yaml` | taxonomía + ontología + objetivos | OBLIGATORIA |
| `manifests/split_manifest.acoustic_v1.yaml` | ratios, anti-fuga, SG-1..SG-5 | OBLIGATORIA |
| `manifests/baseline_experiment_manifest.acoustic_v1.yaml` | precondiciones G-DS + protocolo de validación | OBLIGATORIA |
| `split_lists/{train,validation,test}.csv` | listas de partición (cabeceras) | OBLIGATORIA |
| `split_lists/split_report.json` | evidencia de split, `NO_EJECUTADO` | OBLIGATORIA |
| `features/README.md` | contrato del caché derivado | OBLIGATORIA |
| `holdout/real_world_holdout_v1/README.md` | política de reserva de sitio | OBLIGATORIA |
| `CHECKSUMS.sha256` | integridad (placeholder declarado) | OBLIGATORIA_HERRAMIENTA |

## 2.3 Lo que **NO** se creó (y por qué es lo correcto)

| No creado | Motivo |
|---|---|
| WAV de ejemplo | No hay audio. Un WAV sintético como "ejemplo" es un dato falso en un dataset científico. |
| `features/acoustic_features_v2.csv` | No hay audio de entrada. |
| Filas en `metadata.csv` / `manifest.csv` / `split_lists/*.csv` | No hay audio. |
| `CHECKSUMS.sha256` con líneas | Checksums de archivos inexistentes son-fiction. |
| Gráficas, espectrogramas, reportes de conteo | Prohibido por la regla de honestidad. |

---

# 3. FASE 3 — GOBERNANZA

## 3.1 Qué es obligatorio / opcional / derivado

**Obligatorio** (sin esto el gate no pasa):
`metadata/metadata.csv` (1 fila/muestra) · `metadata/labels.csv` (9) · `metadata/schema.json` ·
`metadata/README.md` · `dataset_card.md` · `CHECKSUMS.sha256` · 5 manifiestos YAML ·
`split_lists/` (3 CSV + report) · `raw/` con 9 carpetas · `holdout/real_world_holdout_v1/` reservada.

**Obligatorio producido por herramienta** (la calcula la ingesta; si no puede, el clip no entra):
`metadata.csv`: `sha256` · `duration_s` · `sample_rate` · `channels` · `bit_depth`.

**Opcional** (puede ir vacío, nunca bloquea):
`secondary_classes` · `contaminated` · `confidence_annotator` · `hour_local` · `weather_note` ·
`latitude` · `longitude` · `notes` · `review_annotator_id` (vacía si ronda 1) ·
`metadata/places.csv` completo (si no existe, `place_id` sigue siendo string libre obligatorio).

**Derivado** (se regenera; nunca fuente de verdad):
`metadata/manifest.csv` · `train|validation|test/` · columnas `curated_path` · `frames_count` ·
`split_group_key` · `features/acoustic_features_v2.csv` · `split_lists/split_report.json` ·
`CHECKSUMS.sha256`.

> **Regla de oro de la gobernanza:** si un derivado se pierde, se regenera. Si `metadata.csv` se pierde,
> el dataset se pierde. Por eso es el único artefacto que debe respaldarse aparte y el único que se
> versiona (copia a `docs/ai/manifests/` **al liberar**, no antes).

## 3.2 Columnas de `metadata.csv` (42 = 30 obligatorias + 9 opcionales + 3 derivadas)

Verificado por máquina contra `schema.json` **v1.2.0** y la cabecera de `metadata.csv` (idénticas, **42/42**).

**30 obligatorias** — 25 de dominio (`OBLIGATORIA`):

`sample_id` · `file` · `partition` · `class_id` · `session_id` · `take_index` · `place_id` · `environment` ·
`device_id` · `capture_source_rate` · `resample_method` · `annotator_id` · `operator_id` · `annotation_round` ·
`agreement` · `timestamp` · `license` · `source` · `dataset_version` · `taxonomy_version` ·
`label_schema_version` · `feature_schema` · `window_schema` · `ingest_status` · `qc_status`

…más 5 que la herramienta debe poder calcular y verificar (`OBLIGATORIA_HERRAMIENTA`):

`sha256` · `duration_s` · `sample_rate` · `channels` · `bit_depth`

**9 opcionales** (`OPCIONAL`): `review_annotator_id` · `secondary_classes` · `contaminated` ·
`confidence_annotator` · `hour_local` · `weather_note` · `latitude` · `longitude` · `notes`

**3 derivadas** (`DERIVADA`, se rellenan por proceso, nunca a mano): `curated_path` · `frames_count` · `split_group_key`

**Las 6 columnas que la auditoría añadió** (OBS-06, OBS-11): `capture_source_rate` · `resample_method` ·
`take_index` · `review_annotator_id` · `agreement` · `window_schema`.

> **Por qué `review_annotator_id` es opcional y `agreement` es obligatoria:** el_logger no sabe quién va a
> revisar; el revisor sí. Si no hay segunda revisión, `agreement` queda vacío y **G-DS-6 no cierra** — que es
> exactamente la presión que el gate debe ejercer. `confidence_annotator` es la confianza declarada por el
> anotador y **no** es acuerdo inter-anotador (OBS-11).

## 3.3 Taxonomía y binding (`metadata/labels.csv`)

9 filas. Cada clase lleva `class_id`, `class_name`, `dir_name`, `class_index`, `is_ood_bucket`,
`definition`, `audi_set_mid`, `audi_set_status`, `public_support`, `notes`.

| class_id | dir_name | idx | OOD | AudioSet mid | Estado mid |
|---|---|---:|---|---|---|
| `silencio` | `silencio` | 0 | no | — | none |
| `viento` | `viento` | 1 | no | `/m/03m9d0z` | `UNVERIFIED` |
| `lluvia` | `lluvia` | 2 | no | `/m/06mb1jj` | `UNVERIFIED` |
| `agua` | `agua` | 3 | no | `/m/0838f` | `UNVERIFIED` |
| `insectos` | `insectos` | 4 | no | `/m/03vt0` | `UNVERIFIED` |
| `ave` | `ave` | 5 | no | `/m/020d1` | `UNVERIFIED` |
| `voz` | `voz` | 6 | no | `/m/09x0r` | `UNVERIFIED` |
| `motor` | `motor` | 7 | no | `/m/02mk9` | `UNVERIFIED` |
| `ruido_desconocido` | **`desconocido`** | 8 | **sí** | — | none |

**Único desajuste `class_id ≠ dir_name`:** el bucket OOD. Es intencional por orden de misión (FASE 2 lo
nomina `desconocido/`) y queda **explícitamente enlazado** para que ninguna herramienta lo adivine.

## 3.4 Reglas de versionado

| Cambio | `schema_version` | `dataset_version` |
|---|---|---|
| Columnas obligatorias: nombre, orden o conjunto | **2.0.0** | **v2** (directorio nuevo) |
| Columna opcional o derivada nueva | 1.x.0 | v1 |
| Añadir o quitar una clase | nueva `taxonomy_version` | **v2** |
| Cambiar el clip contract (SR, duración, N_FFT, hop) | 2.0.0 | **v2** (invalida features) |
| Corregir un valor por defecto o una nota | 1.0.x | v1 |

**Ninguna versión reescribe la anterior:** las previas se conservan como directorios hermanos.
Esto replica el precedente agrícola (`v1` y `v2` coexisten).

## 3.5 Máquina de estados del dataset (`dataset_state`)

| Estado | Condición verificable |
|---|---|
| `PREPARADO_VACIO` | Estructura + gobernanza creadas; `metadata.csv` con 0 filas. **← estado actual** |
| `CAPTADO_INICIAL` | ≥1 fila en `metadata.csv` con `qc_status=pass` |
| `CURADO` | `manifest.csv` = `metadata.csv` en conteo; AC-1..AC-10 aplicados; `CHECKSUMS.sha256` generado |
| `SPLITEADO` | `split_report.json` con `verdict=PASS` y SG-1..SG-5 en verde |
| `PUBLICADO` | ≥1 modelo con `validation_metrics.json` + `model_card.md` y gate G-M-2 cerrado |

**Regla dura:** el estado lo suben **filas en `metadata.csv` y gates ejecutados**, nunca una decisión
documental. Un documento que dice "avanzado" sin filas se contradice a sí mismo.

## 3.6 Checks de aceptación (`curation_manifest`, AC-1..AC-10)

| ID | Check | On fail |
|---|---|---|
| AC-1 | `sample_rate == 44100` | `quarantine` |
| AC-2 | `channels == 1` | `quarantine` |
| AC-3 | `abs(duration_s - 3.0) ≤ 0.01` | `quarantine` |
| AC-4 | `bit_depth == 16` | `quarantine` |
| AC-5 | el clip no es mudo (`max|x| ≥ 0.001`) | `quarantine` |
| AC-6 | sin clipping (< 1 % de muestras saturadas) | `quarantine` |
| AC-7 | coherencia espectral: ≥1 pico en 20 Hz–20 kHz | `quarantine` |
| AC-8 | `sha256` único en el dataset | `rejected` |
| AC-9 | near-duplicate: correlación del sobre de energía > 0.98 | `quarantine` |
| AC-10 | `file` es coherente con `class_id` y con la carpeta real | `quarantine` |

**Enrutamiento:** `raw/` → `raw/<clase>/` tras QC; `rejected` con evento audible desconocido →
`raw/desconocido/` con `ingest_status=rejected`. **Nada se borra** (regla suprema).

---

# 4. FASE 4 — QUALITY GATES FINALES (G-DS-1..G-DS-6)

Cada gate declara: criterio **verificable**, **cómo se verifica**, **evidencia** que lo prueba y **qué bloquea**.

## G-DS-1 — Taxonomía y esquema aprobados
| | |
|---|---|
| **Criterio** | (a) 9 clases con `class_id`/`dir_name` enlazados en `labels.csv`; (b) `schema.json` v1.0.0 con 29 columnas obligatorias (24 de dominio + 5 de herramienta); (c) **decisión de Bernardo sobre `window_schema`** (OBS-09/D-1); (d) cada `audi_set_mid` marcado `UNVERIFIED` o verificado contra `yamnet_class_map.csv`; (e) autorización explícita de esta misión. |
| **Verificador** | `python tools/validate_dataset.py --gate G-DS-1` (a validar) **o** inspección de `schema.json` + `labels.csv` + acta de aprobación. |
| **Evidencia** | `metadata/schema.json` · `metadata/labels.csv` · `manifests/taxonomy_binding_manifest.acoustic_v1.yaml` |
| **Bloquea** | construcción del corpus. **También bloquea S81**: sin dimensión de entrada no hay clasificador. |
| **Estado** | 🔴 **PENDIENTE** — solo falta (c) y la autorización. (a),(b),(d) cumplidos. |

## G-DS-2 — ≥150 clips/clase propios, balanceados y con QC verde
| | |
|---|---|
| **Criterio** | Para cada una de las 8 clases vivas: `count(metadata.csv WHERE class_id=c AND qc_status='pass') ≥ 150`. Balance: `max/min ≤ 1.5` entre clases vivas. Todo con `source=cmsc_logger` y `license=PROPIO`. `ruido_desconocido`: sin objetivo de captura. |
| **Verificador** | Conteo sobre `metadata.csv` + `split_report.json → counts.per_class`. |
| **Evidencia** | `metadata.csv` · `manifests/curation_manifest.acoustic_v1.yaml → counts.per_class` |
| **Bloquea** | entrenamiento de v1; subes de `S81` a `REAL-LOCAL`. |
| **Estado** | 🔴 **NO CUMPLIDO — 0/150 en 8 clases.** |

## G-DS-3 — Split sin fuga + holdout reservado
| | |
|---|---|
| **Criterio** | (a) `∅ = ⋂ split_group_key(train, validation, test)`; (b) `⋂ sha256(train, validation, test) = ∅`; (c) ninguna clase ausente en ninguna partición; (d) `holdout/real_world_holdout_v1/` con ≥1 `place_id` ausente de train/validation/test; (e) umbral near-dup **calibrado** con material real (OBS-12). |
| **Verificador** | `split_report.json` con SG-1..SG-5 en verde y `verdict: PASS`. |
| **Evidencia** | `split_lists/*.csv` · `split_lists/split_report.json` · `holdout/real_world_holdout_v1/` |
| **Bloquea** | evaluación creíble (cualquier macro-F1 sobre un split con fuga no significa nada). |
| **Estado** | 🔴 **NO CUMPLIDO** (sin datos). (e) requiere además una misión de calibración. |

## G-DS-4 — Gobernanza completa y verificable
| | |
|---|---|
| **Criterio** | Existen y son parseables: `schema.json` · `metadata/README.md` · `labels.csv` (9 filas) · `dataset_card.md` · `CHECKSUMS.sha256` (1 línea por WAV) · 5 manifiestos YAML · 3 CSV de split + `split_report.json`. Cada CSV con cabecera no vacía. |
| **Verificador** | Parseo JSON/YAML/CSV + recuento de líneas de `CHECKSUMS.sha256` = `count(metadata.csv)`. |
| **Evidencia** | Los 20 archivos del §2.2. |
| **Bloquea** | trazabilidad; auditoría; publicación de manifiestos a `docs/ai/manifests/`. |
| **Estado** | 🟠 **PARCIAL** — la capa de gobierno está completa; `CHECKSUMS.sha256` con contenido y las filas de `metadata.csv` dependen del primer WAV. |

## G-DS-5 — Licencias verificadas
| | |
|---|---|
| **Criterio** | (a) Toda fila tiene `license` de la lista cerrada `PROPIO · CC0 · CC-BY · CC-BY-SA · CC-BY-NC`; (b) `ND` y "desconocida" **inexistentes**; (c) todo material público con licencia verificada **por clip** (no por dataset); (d) `NC` marcado explícitamente; (e) v1: solo `source=cmsc_logger`. |
| **Verificador** | `SELECT DISTINCT license, source FROM metadata.csv` contra la lista cerrada + auditoría manual de clips públicos. |
| **Evidencia** | `manifests/raw_source_manifest.acoustic_v1.yaml → sources[].license` · columna `license` |
| **Bloquea** | uso legal; publicación. |
| **Estado** | 🟢 **CUMPLIBLE / NO APLICABLE TODAVÍA** — v1 es 100 % propio por diseño; no hay material público capturado. |

## G-DS-6 — Acuerdo de anotación
| | |
|---|---|
| **Criterio** | (a) 100 % de las muestras con `agreement ∈ {double_reviewed_agree, double_reviewed_disagree, disputed_resolved}`; (b) κ de Cohen **≥ 0,70** por clase; (c) todo `disputed_resolved` con `review_annotator_id` y `notes`; (d) todo `double_reviewed_disagree` sin uso de `confidence_annotator` como sustituto (OBS-11). |
| **Verificador** | Matriz de confusión entre `annotator_id` (ronda 1) y `review_annotator_id` (ronda 2) → κ. |
| **Evidencia** | `metadata.csv` columnas `agreement`, `annotator_id`, `review_annotator_id` |
| **Bloquea** | confianza de la etiqueta; sin esto un modelo aprende ruido humano. |
| **Estado** | 🔴 **NO CUMPLIDO.** **Nota de coste:** 2 rondas sobre 1.350 muestras = 2.700 etiquetados. En el **piloto de 100 se exige 100 % doble revisión** (es lo que hay que validar primero). |

## 4.1 Mapa gate → dependencia

```
G-DS-1 ──┬──> construcción del corpus ──> G-DS-2 ──┬──> G-DS-3 ──> G-DS-4 ──> G-DS-6
         │                                       │                      │
         └──> dimensión de entrada de S81       └──>Dominio de ref.      └──> G-M-2..6 → S81: REAL-LOCAL
              (sin esto, S81 no puede existir)
G-DS-5 ───────────────────────> uso legal (transversal)
```
**Ciclo honesto:** G-DS-1 depende de D-1 (`window_schema`); D-1 depende de la dimensión de features; el
dataset depende de G-DS-1. **Decidir D-1 abre todo el camino.**

---

# 5. FASE 5 — PLAN DE PRIMERAS 100 MUESTRAS (PILOTO)

## 5.1 Interpretación del alcance

La misión pide "las primeras 100 muestras" distribuidas en 8 clases (lista explícita: `silencio`, `viento`,
`lluvia`, `agua`, `insectos`, `ave`, `voz`, `motor`). Interpretación: **100 clips aceptados en total sobre
las 8 clases vivas**. `ruido_desconocido` **queda fuera por diseño** (§5.6).

## 5.2 Asignación

| Clase | Aceptados | Vacantes (×1,5) | Sesiones | Lugares distintos | Motivo de la asignado |
|---|---:|---:|---:|---:|---|
| `silencio` | 12 | 18 | 2 | 2 | abundante, se recorta al final si sobra |
| `viento` | 12 | 18 | 2 | 2 | abundante |
| `lluvia` | 12 | 18 | 2 | 2 | **oportunista**: depende del clima |
| `agua` | 13 | 20 | 2 | 2 | difícil de conseguir en horario seco |
| `insectos` | 13 | 20 | 2 | 2 | estridulación estacional; necesita noche |
| `ave` | 13 | 20 | 2 | 2 | requiere huerta/arbustos; más ruido de fondo |
| `voz` | 13 | 20 | 2 | 2 | requiere consentimiento; colisiona con `motor` |
| `motor` | 12 | 18 | 2 | 2 | horario laborable |
| **TOTAL** | **100** | **152** | **16** | **≥3** | — |

**Presupuesto de audio:** 152 vacantes × 3,0 s ≈ **7,6 min de audio bruto**, pero **el tiempo real no es la
captura**: es el etiquetado y el QC. Estimación honesta de reloj: ~12 min por sesión (montaje, 12–20 tomas,
previsualización, etiqueta, verificación) → **~3 h de trabajo de campo + ~3 h de etiquetado/QC**.

## 5.3 Duración y formato

| Parámetro | Valor | Origen |
|---|---|---|
| Duración de clip | **3,0 s** (tolerancia ±0,01 s) | `schema.json → clip_contract.duration_s` |
| Formato | WAV PCM 16-bit mono 44.100 Hz | AC-1..AC-4 |
| Tasa de captura | la nativa del micrófono (típicamente 48.000 Hz) | OBS-06 |
| Remuestreo | a 44.100 Hz **declarado** en `capture_source_rate` + `resample_method` | OBS-06 |
| Segmentación | clips de 3,0 s **sin solape**, `take_index` correlativo por sesión | anti-duplicados |
| Distance entre tomas | ≥ 5 s (varying el azimut/orientación del micrófono) | diversidad real |

## 5.4 Criterios por clase

| Clase | Criterio de inclusión | Criterio de exclusión |
|---|---|---|
| `silencio` | micrófono activo, sin evento dominante; se registra el piso de ruido del entorno | cualquier pico > 0,05 en 3 s (entonces no es silencio) |
| `viento` | flujo audible continuo, banda ancha baja; `weather_note` si es viento verificable | presencia de lluvia, agua o voz dominantes |
| `lluvia` | precipitación audible; `weather_note` con hora e intensidad | **jamás simular lluvia con aspersor** (sería dato falso) |
| `agua` | goteo, curso u oleaje | precipitación dispersa simultánea (`contaminated=true`) |
| `insectos` | estridulación audible; `hour_local` obligatorio (típicamente nocturno) | voz o motor dominantes |
| `ave` | vocalización; registrar especie en `notes` si es identificable | estridulación dominante → `contaminated` + `secondary_classes=insectos` |
| `voz` | habla, **no música**; consentimiento registrado; sin retención de habla identificable | música, motor,TV |
| `motor` | motor/maquinaria en operación; registrar `hour_local` | voz o lluvia dominantes |

## 5.5 Reglas transversales

1. **Group split estricto desde el día 1.** El piloto se ejecuta con **3 lugares**:
   `site_a` → train · `site_b` → train · **`site_c` → holdout reservado**.
   El split por clips no existe en el piloto: se declara el lugar, no se mezclan sitios. (Volver a barajar
   clips de un sitio destruye el propósito del holdout.)
2. **Validation sale de un grupo de sesión, no de un sitio**, para no perder el único lugar no usado.
3. **100 % doble revisión** en el piloto (`agreement` obligatoria) — es lo que valida G-DS-6 antes de
   pagar 2.700 etiquetados.
4. **Todo clip pasa AC-1..AC-10** antes de `ingest_status=accepted`; si falla, `quarantine`.
5. **`window_schema` no bloquea el piloto.** Las features son derivadas; se pueden recalcular cuando se
   decida D-1. **Capturar audio sí urge: el audio no se puede reconstruir.**
6. **Consentimiento y privacidad:** clase `voz` requiere `annotator_id` + nota de consentimiento; nada de
   habla identificable queda retenido.

## 5.6 Por qué `desconocido` no entra en las 100

`ruido_desconocido` es un **bucket OOD**: no se puede "capturar" a demanda. Se llena con:
(a) clips rechazados o ambiguos durante la curación, (b) eventos genuinamente nuevos durante la captura de
campo, (c) audio de referencia con licencia incompatible (`ND`). Meterlo en el piloto falsearía la
proporción de clases y daría una falsa sensación de balance. **Carpeta creada y vacía, como corresponde.**

## 5.7 Criterios de éxito del piloto

| ID | Criterio | Verificable |
|---|---|---|
| PILOT-1 | 100 clips aceptados con `qc_status=pass` | conteo en `metadata.csv` |
| PILOT-2 | ≥3 `place_id`, ≥2 sesiones por clase | `metadata.csv` |
| PILOT-3 | 100 % con `agreement` resuelta (ningún `single_reviewed`) | `metadata.csv` |
| PILOT-4 | 0 fugas: 0 `sha256` duplicados, 0 near-dup aceptados | AC-8/AC-9 + `manifest.csv` |
| PILOT-5 | 100 % con `capture_source_rate` y `resample_method` declarados | `metadata.csv` |
| PILOT-6 | `holdout/` contiene material de `site_c` y ningún `site_c` está en train | `split_report.json` |
| PILOT-7 | `dataset_state` sube a `CAPTADO_INICIAL` **solo por evidencia** | máquina de §3.5 |

**Lo que el piloto NO es:** no cumple G-DS-2 (100 ≠ 150 por clase), no produce features, no produce modelo,
no cambia el estado de S81. Su único objetivo es **validar logger + QC + split + anotación antes de pagar
la captura masiva.**

---

# 6. ESTADO CONSOLIDADO

| Activo | Estado | Evidencia |
|---|---|---|
| `sigct_rural_acoustic/v1` | **`PREPARADO_VACIO`** | 46 directorios · 20 archivos · 0 muestras |
| Gobernanza del dataset | **`REAL`** | `schema.json` 1.0.0 · `labels.csv` 9 · 5 manifiestos · README de gobierno |
| Taxonomía `acoustic_v1_taxonomy` | **`REAL`** (declarada) | 9 clases con binding verificado |
| Contrato de clip | **`REAL`** (declarado) | 3,0 s · 44,1 kHz · mono · 16 bit · N_FFT 4096 · hop 2048 · 63 frames |
| Split | **`NO_EJECUTADO`** | `split_report.json → state: NO_EJECUTADO` |
| Features | **`DISENO`** | sin audio de entrada |
| S30 | **`REAL-LOCAL`** | sin cambios en esta misión |
| S81 | **`DISENO`** | bloqueada por G-DS-1 (D-1) y G-DS-2 |
| S82 | **`DISENO`** | depende de S81 |
| Modelo acústico | **no existe** | — |
| Gates G-DS | 0/6 cerrados | 1 parcial, 1 cumplible, 4 pendientes |

**La conclusión oficial se mantiene y se afila:** no falta arquitectura, no falta FFT, no falta IA.
**Falta audio.** Y ahora falta menos: falta *capturar*, no falta *diseñar*.

---

# 7. DECISIONES PENDIENTES DE BERNARDO

| ID | Decisión | Urgencia | Por qué bloquea |
|---|---|---|---|
| **D-1** | ~~**`window_schema`**~~ **RESUELTA 2026-10-04 y REVISADA 2026-10-05: opción (a) `acoustic.feat.window.v2`, mean+std → 44 dims.** Ver §7.1. | ✅ Cerrada | Era la dimensión de entrada de S81. La agregación no cambió en la revisión: cambió la feature 21 que se promedia. |
| **D-2** | **Umbral near-duplicate** (propuesta 0.98, sin calibrar). | 🟠 | G-DS-3 no es verificable sin número. Se calibra con los primeros 200 clips reales. |
| **D-3** | **Unificar `class_id` y `dir_name`** (hoy `ruido_desconocido` ≠ `desconocido`). | 🟡 | Higiene de prefijos. Recomiendo `desconocido` como carpeta y `ruido_desconocido` como `class_id` **permanente**, porque el binding está explícito y documentado y `class_id` debe coincidir con la etiqueta de S81. Uniformarlos es opcional. |
| **D-4** | **Publicar erratas en `AI_ACOUSTIC_DATASET_V1_DESIGN.md`** (OBS-01, -04, -05, -07, -10). | 🟡 | Hoy existe un documento canónico y otro vigente con estructuras distintas. Ambos son verdad parcial: el diseño describe la intención original, la gobernanza describe lo construido. Se resuelve con un §14 "Reconciliation" en el diseño. |

## 7.1 `acoustic.feat.v2` — revisión de la feature 21 (2026-10-05)

**Decisión de gobernanza, ejecutada.** El esquema `acoustic.feat.v1` queda **CONGELADO**;
`acoustic.feat.v2` pasa a ser el vigente.

**Qué se corrigió.** La feature 21, `profileEntropy`, tenía dos defectos independientes:

1. Usaba `db[i] ** 2`. `db[i]` está en **dBFS** (logarítmico): el cuadrado de un logaritmo no es
   potencia. El espectro quedaba aplanado y casi toda señal recibía entropía cercana a 1.
2. Repartía 96 bandas de **21 bins fijos** sobre 2048 bins, así que los **32 bins de
   21,71–22,05 kHz se descartaban**.

**Cómo.** v2 usa `magnitudes[i] ** 2` (potencia lineal real) y reparte los 2048 bins en 96 bandas
con **bordes fraccionarios**, sin truncar. Detalle y cifras en `AI_ACOUSTIC_FEATURE_MAP.md` §5.

**Impacto, medido y acotado:**

| Señal | v1 | **v2** |
|---|---|---|
| Silencio digital | 1,0000 | **0,0000** |
| Tono 1 kHz | 0,9893 | **0,0000** |
| Ruido blanco | 0,9979 | **0,9901** |
| Ruido rosa | 0,9218 | **0,5143** |

De las 44 dims cambian **solo 2**: `mean_profileEntropy` (índice 21) y `std_profileEntropy`
(índice 43). Las otras 42 son idénticas, y los 22 nombres de feature y su orden **no cambian**.
Verificado por `tools/cmsc-data-logger/test/schema-v2.test.mjs`.

**Por qué era bloqueante, no cosmética.** En v1 el silencio (1,00) y el ruido blanco (0,998) eran
prácticamente indistinguibles. Una feature que no separa el silencio del ruido no puede alimentar un
clasificador: S81 habría aprendido de un artefacto numérico. Como G-DS-1 exige `window_schema`
`APROBADO` y el dataset no tiene ni una muestra, la fórmula defectuosa habría quedado congelada
*antes* de capturar, y corregirla después habría exigido tirar el corpus entero.

**Estado del dataset y de las gates tras la revisión:**

- `metadata.csv`: **0 filas**. `dataset_state`: `PREPARADO_VACIO`. Sin cambio.
- Raíz del dataset: **se conserva en `v1`**. La regla de versionado exigiría `dataset_version v2`
  ante un cambio de esquema, pero `metadata.csv` tiene 0 filas: **no existe ni un artefacto v1 que
  versionar ni que invalidar**. En la primera captura, las feature_rows se sellarán con
  `acoustic.feat.v2` y la raíz pasará a `v2`, conservando esta `v1` como registro de la gobernanza
  previa. Declarado en `metadata/schema.json` → `feature_schema_history.acoustic.feat.v2.dataset_root_note`.
- `feature_storage.path`: `features/acoustic_features_v2.csv`. Un CSV por versión; nunca se mezclan
  geometrías en un mismo fichero.
- **G-DS-1 sigue en `FAIL`**, y debe seguir así: 7 clases con `audi_set_status=UNVERIFIED`.
  La revisión del esquema **no** cierra ninguna gate. G-DS-2..6 siguen `PENDING`.

**Lo que esta revisión NO hizo** (y sigue sin hacer): no capturó ni generó una sola muestra, no entrenó
ningún modelo, no tocó S81/S82 (siguen `DISENO`), no modificó el frontend, y no creó commits ni push.
La cache de envelopes de AC-9 (`features/acoustic_envelopes_v1.json`) es **compartida** entre v1 y v2
porque `energyEnvelope` lee el índice 4 (`rms`), idéntico en ambos esquemas.

### Correcciones de bug detectadas en la misma auditoría

| Bug | Síntoma | Corrección |
|---|---|---|
| **BUG B** | `signalStats.meanAbs` mentía sobre el nombre: calculaba `sumSq / n`, que es la media de **potencias**, no de valores absolutos. | Renombrado a `meanPower`. **El valor no cambia**; solo el nombre, que era falso. Prueba: `meanPower == rms²`. |
| **BUG C** | `features` solo reescribía el CSV de features y **no** la cache de envelopes de AC-9, que solo mantenía `ingest`. Borrar el derivado y ejecutar `features` dejaba AC-9 sin una sola referencia, y todo clip aceptado caía en "cuasi-duplicado". | `features` regenera ambos derivados y anuncia cuántos envelopes reconstruye. Un derivado que no se puede regenerar no es regenerable. |
| **BUG D** | G-DS-1 pasaba con `labels.csv` **AUSENTE**: el `existsSync` degradaba a `[]`, así que `midsUnverified = 0` y el gate daba PASS pese a declarar "9 clases enlazadas" en su criterio. Falso verde en un gate de taxonomía. | `labelsPresent` distingue "no existe" de "existe vacío". G-DS-1 bloquea si falta el fichero, si no hay 9 clases, si alguna no tiene `dir_name` o si algún `class_id` está fuera de la taxonomía. Sin evidencia de labels, **falla cerrado**. |

Cobertura de pruebas tras la revisión: **76/76** (`pipeline` 47 + `schema-v2` 17 + `bugfixes` 12) y
selftest **21/21**.

---

# 8. PRÓXIMA MISIÓN

## **`CMSC_DATA_LOGGER_V1`** (implementación)

**Por qué esta y no otra:** el dataset está preparado pero vacío; el único camino que activa los 6 gates es
capturar audio. El logger es la herramienta que convierte S30 (señal real ya operativa) en muestras
etiquetadas, y el piloto de 100 (§5) es su prueba de aceptación.

**Alcance mínimo:**
1. `CMSC_DATA_LOGGER_V1` Variante A (web, `getUserMedia` → WAV PCM mono 44,1 kHz, **con remuestreo declarado**)
   + Variante B (CLI Python para ingesta, hashing, QC, split, manifiestos).
2. Escritura de `raw/<clase>/` + fila en `metadata.csv` con las 29 columnas obligatorias.
3. `featuresExtractor` offline implementing `acoustic.feat.v2` + paridad JS↔Python.
4. Ejecución del **piloto de 100** con `dataset_state` subiendo solo por evidencia.

**Restricciones que se mantienen:** sin `Hero`, sin `Dashboard`, sin `Workbench V6`, sin
`SpectralAnalysisInstrument`, sin backend, sin push. Todo aditivo en `pages/cmsc/acoustic/`.
**No** habilita aún `useSpectralFrame()` en el instrumento: esa es una misión aparte y opcional (el logger
usa `getUserMedia` por su cuenta).

---

# 9. RIESGOS

| ID | Riesgo | Sev. | Mitigación aplicada |
|---|---|---|---|
| DG1 | Estructura vacía se confunde con dataset existente | 🔴 | `dataset_state` declarado en los 10 artefactos de control; 0 filas declaradas; tarjeta con 0 inventario |
| DG2 | Remuestreo no declarado → metadata falsa | 🔴 | OBS-06: 2 columnas obligatorias + regla de honestidad |
| DG3 | G-DS-6 incumple por falta de campo de acuerdo | 🔴 | OBS-11: `review_annotator_id` + `agreement` |
| DG4 | Split con fuga → métrica sin significado | 🔴 | Group split + holdout reservado + SG-1..SG-5 |
| DG5 | Dimensión de S81 decidida tarde | 🔴 | D-1 marcado como máxima urgencia |
| DG6 | Sobreconfianza: "el dataset está listo" | 🔴 | `0 muestras` repetido en cada artefacto; §6 |
| DG7 | Licencias públicas mal documentadas | 🔴 | G-DS-5 con lista cerrada; `ND` prohibido |
| DG8 | Sesgo a un solo sitio/device | 🟠 | 3 sitios desde el piloto; `device_id` + `place_id` obligatorios |
| DG9 | Captura oportunista de `lluvia` se sustituye por audio simulado | 🔴 | Prohibido simular; se reprograma |
| DG10 | Coste de 2 rondas × 1.350 muestras | 🟠 | Piloto con 100 % doble revisión antes de escalar |
| DG11 | Deriva entre documentos de dataset | 🟡 | Este documento es canónico; D-4 pendiente |
| DG12 | Coste de almacenamiento (≈357 MB mínimo) | 🟢 | Local, viable; sin límite |

---

# 10. ENTREGABLES DE LA MISIÓN

| # | Entregable | Dónde |
|---|---|---|
| 1 | Auditoría del diseño (14 observaciones) | §1 |
| 2 | Estructura física creada (46 dirs · 20 archivos) | §2 |
| 3 | Gobernanza definida (schema + labels + manifest + card + README) | §3 · `metadata/` |
| 4 | Quality gates finales G-DS-1..6 + AC-1..10 + SG-1..5 | §4 · manifiestos |
| 5 | Plan de primeras 100 muestras | §5 |
| 6 | Bitácora actualizada (3 documentos) | `AGENTS.md` · `CONTINUITY_MASTER.md` · `MASTERDOC.md` |
| 7 | Estado consolidado | §6 |
| 8 | Próxima misión recomendada | §8 |

**No-acciones confirmadas:** sin captura · sin descarga · sin entrenamiento · sin implementación de IA ·
sin inferencia · sin tocar `Hero`/`Dashboard`/`Workbench V6`/`SpectralAnalysisInstrument` · sin push · sin commit.

> **Regla final aplicada:** se preparó la casa, pero **la casa está vacía y lo dice**.
> Un dataset acústico con 0 muestras y 0 gráficas inventadas es el único punto de partida honesto.

---

# 11. TRAZABILIDAD DE LOS CONTRATOS (añadido 2026-10-05)

## 11.1 Por qué existe esta sección

El árbol del dataset vive **fuera de git** (`.gitignore:68` ignora `/data/`). Eso es lo correcto para los
WAV, pero deja los **contratos de gobernanza** en el mismo Visibility bucket que los datos binarios: si el
árbol local se pierde, se pierde también el vocabulario del proyecto.

La solución deliberada **no es duplicar los ficheros**. Duplicar `schema.json` o `labels.csv` en `docs/`
crearía **dos fuentes de verdad** que divergirían sin aviso, que es exactamente lo que el canon prohíbe
(`NADA SE DESAPARECE · TODO SE PRESERVA`, y `metadata.csv` es *la* fuente de verdad).

Lo que se versiona en este documento es **la dirección y la huella** del contrato, no el contrato.

## 11.2 Qué se versiona y qué no

| | Artefacto | ¿En git? | Razón |
|---|---|---|---|
| **Norma** | este documento (`docs/`) | ✅ sí | Es la especificación; el resto la referencia |
| **Puntero + huella** | esta tabla | ✅ sí | Prueba qué contrato se usó, sin copiarlo |
| **Contrato legible por máquina** | `metadata/schema.json` | ❌ no | Fuente única; se regenera desde la norma |
| **Taxonomía** | `metadata/labels.csv` | ❌ no | Fuente única |
| **Manifiestos** | `manifests/*.yaml` (5) | ❌ **todavía** | Se copian a `docs/ai/manifests/` **al liberar (G-DS-4)**, no antes |
| **Datos** | `raw/` `train/` `validation/` `test/` `holdout/` | ❌ no | ≈357 MB de WAV |
| **Derivados** | `features/` `split_lists/` `manifest.csv` `CHECKSUMS.sha256` | ❌ no | Regenerables con `cmsc-data-logger` |

## 11.3 Huellas SHA-256 (verificadas 2026-10-05, dataset en `PREPARADO_VACIO`)

Raíz: `data/datasets/sigct_rural_acoustic/v1/`

| Ruta | `schema_version` | SHA-256 |
|---|---|---|
| `metadata/schema.json` | `sigct_rural_acoustic_schema` **1.2.0** | `63cd50fca188ec3d0edb2e378ba34325f6b3b24fce0809336ad533fad29ea1d2` |
| `metadata/labels.csv` | `acoustic_v1_label_schema` | `bdd25ae307768ab491c882258b3f9727cdf00e5956f18eead9422f7a94656198` |
| `manifests/raw_source_manifest.acoustic_v1.yaml` | `1.0` | `8f048392a685df6c25c6e30cf93b190e8d6734663f950bdf7d4396968e4b60da` |
| `manifests/curation_manifest.acoustic_v1.yaml` | `1.0` | `b295114d9b51482a8082cd53ed4532c6cfffffb363019a24c1f9e95f13c4921f` |
| `manifests/taxonomy_binding_manifest.acoustic_v1.yaml` | `1.0` | `7ed450f22f1d7353dec262db01c30e8485757032ed35044a3760e5990a845852` |
| `manifests/split_manifest.acoustic_v1.yaml` | `1.0` | `32fd3f8d25c55b72d26a217ed77f8aa8475ab6f765bc36d8efb8c04c10ec61d5` |
| `manifests/baseline_experiment_manifest.acoustic_v1.yaml` | `1.0` | `a54575b64423d5e558c715faba18671dac814244810c904900bf89171ddd2f59` |

**Cómo verificar (PowerShell, sin instalar nada):**

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "data\datasets\sigct_rural_acoustic\v1\metadata\schema.json"
```

**Regla de invalidación:** si un hash de esta tabla **no** coincide, el contrato local ha cambiado sin que
este documento lo refleje. Eso **no es un fallo automático**: es la señal de que hay que (a) actualizar la
tabla en el mismo cambio y (b) anotar el `schema_version` nuevo. Un hash que cambia sin bump de versión es
una inconsistencia que G-DS-1 debe rechazar.

## 11.4 Invariante que esta sección protege

> El repo versiona *la dirección y la huella* del contrato. El contrato tiene **una sola** fuente de verdad:
> `metadata/` en local. Si algún día se decide versionar el fichero en lugar de su huella, debe ser una
> decisión de gobernanza explícita — no una copia silenciosa.