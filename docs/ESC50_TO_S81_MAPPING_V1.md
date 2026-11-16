# ESC50 → S81 · MAPEO CANÓNICO V1

**Misión:** `ESC50_TO_S81_MAPPING_V1` · **Fecha:** 2026-11-15 · **Estado:** SOLO ANÁLISIS / MAPEO — sin descarga, sin entrenamiento, sin cambios de código, sin commits.
**Ubicación:** `docs/` (SOURCE OF TRUTH). **Naturaleza:** documento de referencia; **no** modifica gobernanza, `schema.json`, `labels.csv`, manifiestos ni el dataset.

**Base verificada (leída en disco / fuente primaria):**
- Fuente primaria ESC-50: `meta/esc50.csv` oficial (GitHub `karoldvl/ESC-50`), 2.000 filas / 50 clases / 40 clips por clase / 5 s c/u.
- Capa REF local ya materializada: `data/datasets/sigct_rural_acoustic/reference/esc50/` (piloto H3, 428 clips aceptados / 12 rechazados).
- Contrato canónico de mapeo: `reference/esc50/metadata/mapping_esc50_to_v1.csv` (11 filas) + `manifest_ref.esc50.yaml` + `PILOT_REPORT.md` + `source_card.md`.
- Taxonomía S81: `v1/metadata/labels.csv` (9 clases, `class_index` 0..8) y `v1/metadata/schema.json` v1.3.0 (42 columnas).

**Regla de honestidad (C0 vs C1):** ESC-50 es **capa de REFERENCIA (C1)**. **NUNCA** entra en `train`/`validation`/`test` de C0 (S81). Sirve como *pre-entrenamiento / bootstrap*. La evaluación y el entrenamiento productivo de S81 deben salir del corpus propio (`cmsc_logger`, particiones C0). Hoy ese corpus C0 tiene **1 muestra**.

---

## 1. Catálogo completo de clases ESC-50 (50/50)

50 clases · 40 clips c/u · 2.000 clips · 5,0 s · WAV PCM 16-bit · mono · 44.100 Hz · 5 folds (400/fold) · licencia CC BY-NC 3.0 (subconjunto ESC-10 CC BY).
`✔` = pertenece a ESC-10 (licencia CC BY).

| # | `category_esc50` | clips | ESC-10 | → `class_mapped_v1` |
|---:|---|---:|:---:|---|
| 0 | dog | 40 | ✔ | — |
| 1 | rooster | 40 | ✔ | **ave** |
| 2 | pig | 40 | — | — |
| 3 | cow | 40 | — | — |
| 4 | frog | 40 | — | — |
| 5 | cat | 40 | — | — |
| 6 | hen | 40 | — | — |
| 7 | insects | 40 | — | **insectos** |
| 8 | sheep | 40 | — | — |
| 9 | crow | 40 | — | **ave** |
| 10 | rain | 40 | ✔ | **lluvia** |
| 11 | sea_waves | 40 | ✔ | **agua** |
| 12 | crackling_fire | 40 | ✔ | — |
| 13 | crickets | 40 | — | **insectos** |
| 14 | chirping_birds | 40 | — | **ave** |
| 15 | water_drops | 40 | — | **agua** |
| 16 | wind | 40 | — | **viento** |
| 17 | pouring_water | 40 | — | **agua** |
| 18 | toilet_flush | 40 | — | — |
| 19 | thunderstorm | 40 | — | — |
| 20 | crying_baby | 40 | ✔ | — |
| 21 | sneezing | 40 | ✔ | — |
| 22 | clapping | 40 | — | — |
| 23 | breathing | 40 | — | — |
| 24 | coughing | 40 | — | — |
| 25 | footsteps | 40 | — | — |
| 26 | laughing | 40 | — | — |
| 27 | brushing_teeth | 40 | — | — |
| 28 | snoring | 40 | — | — |
| 29 | drinking_sipping | 40 | — | — |
| 30 | door_wood_knock | 40 | — | — |
| 31 | mouse_click | 40 | — | — |
| 32 | keyboard_typing | 40 | — | — |
| 33 | door_wood_creaks | 40 | — | — |
| 34 | can_opening | 40 | — | — |
| 35 | washing_machine | 40 | — | — |
| 36 | vacuum_cleaner | 40 | — | — |
| 37 | clock_alarm | 40 | — | — |
| 38 | clock_tick | 40 | ✔ | — |
| 39 | glass_breaking | 40 | — | — |
| 40 | helicopter | 40 | ✔ | — |
| 41 | chainsaw | 40 | ✔ | — |
| 42 | siren | 40 | — | — |
| 43 | car_horn | 40 | — | — |
| 44 | engine | 40 | — | **motor** |
| 45 | train | 40 | — | — |
| 46 | church_bells | 40 | — | — |
| 47 | airplane | 40 | — | — |
| 48 | fireworks | 40 | — | — |
| 49 | hand_saw | 40 | — | — |

---

## 2. Mapeo ESC-50 → clases S81

### 2.1 Clases con proxy en ESC-50 (6)

| ESC-50 `category_esc50` | → S81 `class_id` | `class_index` |
|---|---|---|
| wind | **viento** | 1 |
| rain | **lluvia** | 2 |
| water_drops, sea_waves, pouring_water | **agua** | 3 |
| crickets, insects | **insectos** | 4 |
| chirping_birds, rooster, crow | **ave** | 5 |
| engine | **motor** | 7 |

### 2.2 Clases S81 SIN proxy en ESC-50 (3)

| S81 `class_id` | `class_index` | Motivo |
|---|---|---|
| **voz** | 6 | ESC-50 **no contiene habla/vocalización humana**. Sus clases humanas (`crying_baby`, `laughing`, `coughing`, `sneezing`, `breathing`, `snoring`, `clapping`, `footsteps`, `drinking_sipping`, `brushing_teeth`) **no son habla** y no representan VOZ; incluirlas contaminaría la clase. VOZ se nutre de Speech Commands v2 / FSD50K Speech (C1), no de ESC-50. |
| **silencio** | 0 | No existe en dataset público. **REAL-LOCAL exclusivo.** |
| **ruido_desconocido** | 8 | Bucket **OOD** (`is_ood_bucket=true`); no se captura a demanda ni se alimenta de fuentes externas. |

**Mapeo canónico:** 11 clases ESC-50 → 6 clases vivas de S81. Este binding es **el ya vigente** (`mapping_esc50_to_v1.csv`, `mapping_policy = canonical_h2_section_6`) y **no se altera** en este documento.

---

## 3. Muestras por clase

### 3.1 Por clase S81 (capa REF local, piloto H3)

Seleccionadas = 11 categorías × 40 = **440** (objetivo del piloto = **500**; déficit vs objetivo = **72**, por límite de mapeo). Aceptadas (AC-REF 1..8) = **428**. Rechazadas = **12**.

| S81 `class_id` | Seleccionadas | Aceptadas | Rechazadas | Origen ESC-50 (rechazos) |
|---|---:|---:|---:|---|
| viento | 40 | **38** | 2 | wind ×2 |
| lluvia | 40 | **40** | 0 | — |
| agua | 120 | **115** | 5 | water_drops ×3, pouring_water ×2 |
| insectos | 80 | **79** | 1 | insects ×1 |
| ave | 120 | **119** | 1 | crow ×1 |
| motor | 40 | **37** | 3 | engine ×3 |
| voz | 0 | **0** | 0 | (sin proxy) |
| silencio | 0 | **0** | 0 | (REAL-LOCAL) |
| ruido_desconocido | 0 | **0** | 0 | (OOD) |
| **TOTAL** | **440** | **428** | **12** | |

### 3.2 Detalle de los 12 rechazos (AC-REF)

| ref_clip_id | archivo | categoría ESC-50 | clase v1 | motivo |
|---|---|---|---|---|
| esc50_000008 | 1-16746-A-15.wav | water_drops | agua | silent:peak<0.001 |
| esc50_000043 | 1-47709-A-16.wav | wind | viento | clipping:ratio>=0.01 |
| esc50_000050 | 1-50661-A-44.wav | engine | motor | clipping:ratio>=0.01 |
| esc50_000066 | 1-61221-A-17.wav | pouring_water | agua | spectral:no_audible_peak |
| esc50_000133 | 2-126433-A-17.wav | pouring_water | agua | spectral:no_audible_peak |
| esc50_000189 | 3-115382-A-44.wav | engine | motor | clipping:ratio>=0.01 |
| esc50_000196 | 3-124925-A-9.wav | crow | ave | silent:peak<0.001 |
| esc50_000252 | 3-164592-A-15.wav | water_drops | agua | silent:peak<0.001 |
| esc50_000262 | 3-246513-A-16.wav | wind | viento | clipping:ratio>=0.01 |
| esc50_000266 | 4-133895-A-7.wav | insects | insectos | silent:peak<0.001 |
| esc50_000326 | 4-186962-A-44.wav | engine | motor | clipping:ratio>=0.01 |
| esc50_000438 | 5-261433-A-15.wav | water_drops | agua | silent:peak<0.001 |

> La mayoría de rechazos `silent:peak<0.001` provienen de la **ventana central 1000–4000 ms**: clips cuyo evento audible cae fuera del centro se pierden. Limitación declarada, no defecto del mapeo.

---

## 4. Clases descartadas (39/50)

No mapean a ninguna clase viva de S81 (ver §2.2). Motivos por grupo:

**A. Sonidos humanos / voz-adyacentes (10)** — no son habla; VOZ no se alimenta de ESC-50:
`breathing`, `brushing_teeth`, `clapping`, `coughing`, `crying_baby`, `drinking_sipping`, `footsteps`, `laughing`, `sneezing`, `snoring`.

**B. Animales fuera de taxonomía (7)** — no corresponden a AVE/INSECTOS:
`cat`, `cow`, `dog`, `frog`, `hen`, `pig`, `sheep`.

**C. Domésticos / urbanos / mecánicos (20)** — sin clase viva equivalente (no son MOTOR):
`airplane`, `can_opening`, `car_horn`, `chainsaw`, `church_bells`, `clock_alarm`, `clock_tick`, `door_wood_creaks`, `door_wood_knock`, `fireworks`, `glass_breaking`, `hand_saw`, `helicopter`, `keyboard_typing`, `mouse_click`, `siren`, `toilet_flush`, `train`, `vacuum_cleaner`, `washing_machine`.

**D. Fuego / meteorología no cubierta (2):**
`crackling_fire`, `thunderstorm` (thunderstorm ≠ lluvia; se excluye para no contaminar).

> Nota honesta: `crackling_fire`, `thunderstorm` y varios de (C) podrían discutirse como futuros OOD o clases nuevas, pero **cambiar la taxonomía v1 está prohibido** (requeriría `acoustic_v2_taxonomy`). Se descartan.

---

## 5. Cobertura final

| Métrica | Valor |
|---|---|
| Clases S81 cubiertas por ESC-50 | **6 / 9 = 66,7 %** |
| Clases S81 "con proxy externo" cubiertas (VIENTO·LLUVIA·AGUA·INSECTOS·AVE·VOZ·MOTOR) | **6 / 7 = 85,7 %** (falta VOZ) |
| Clases ESC-50 utilizadas | **11 / 50 = 22,0 %** |
| Clips ESC-50 utilizados (aceptados) | **428 / 2.000 = 21,4 %** |
| Clases S81 NO cubiertas | **voz** (sin habla en ESC-50) · **silencio** (REAL-LOCAL) · **ruido_desconocido** (OOD) |

**Veredicto (heredado, sin cambios):** ESC-50 **NO es apto como dataset de S81 por sí solo** (no cubre `voz`, `silencio` ni `ruido_desconocido`). Es **apto como bootstrap / pre-entrenamiento C1** para las 6 clases cubiertas, **siempre** fuera de las particiones C0. El corpus propio (`cmsc_logger`) sigue siendo **obligatorio** para las 9 clases.

---

## 6. Diseño ETL → PostgreSQL (DISEÑO, no se ejecuta)

**Principio:** ESC-50 se carga en tablas de **referencia** (`acoustic_reference_*`). S81 entrena/evalúa **solo** contra la tabla C0 (`acoustic_c0_sample`). Ambas viven en el mismo PostgreSQL pero **jamás** se mezclan: una vista de barrera lo garantiza.

### 6.1 Modelo relacional

```sql
-- Fuente de referencia (una fila por source_id)
CREATE TABLE acoustic_reference_source (
  source_id         text PRIMARY KEY,              -- 'esc50'
  origin_dataset    text NOT NULL,
  origin_url        text NOT NULL,
  partition         text NOT NULL DEFAULT 'reference'
                      CHECK (partition = 'reference'),
  taxonomy_context  text NOT NULL,                 -- 'v1'
  reference_status  text NOT NULL
                      CHECK (reference_status IN
                        ('PLANIFICADO','DESCARGADO','VALIDADO','FILTRADO',
                         'INVENTARIADO','CONSUMIBLE')),
  license_default   text NOT NULL,
  schema_version    text NOT NULL,                 -- esquema C0: '1.3.0' (el manifiesto REF declara su propio schema_version '1.0')
  capture_date      timestamptz NOT NULL
);

-- Diccionario de mapeo (11 filas para esc50)
CREATE TABLE acoustic_class_mapping (
  source_id         text NOT NULL REFERENCES acoustic_reference_source(source_id),
  category_esc50    text NOT NULL,                 -- 'wind'
  class_mapped_v1   text NOT NULL
                      CHECK (class_mapped_v1 IN
                        ('silencio','viento','lluvia','agua','insectos',
                         'ave','voz','motor','ruido_desconocido')),
  mapping_policy    text NOT NULL,                 -- 'canonical_h2_section_6'
  taxonomy_version  text NOT NULL,
  PRIMARY KEY (source_id, category_esc50)
);

-- Clips de referencia (428 aceptados + 12 rechazados = 440)
CREATE TABLE acoustic_reference_clip (
  ref_clip_id       text PRIMARY KEY,              -- 'esc50_000001'
  source_id         text NOT NULL REFERENCES acoustic_reference_source(source_id),
  original_filename text NOT NULL,
  raw_path          text NOT NULL,                 -- 'raw/ave/esc50_000001.wav'
  category_esc50    text NOT NULL,
  class_mapped_v1   text,                          -- NULL si se descarta la categoría
  license           text NOT NULL,
  license_nc        boolean NOT NULL DEFAULT false,
  fold              smallint,                      -- 1..5
  esc10             boolean NOT NULL DEFAULT false,
  duration_s        numeric(4,2) NOT NULL DEFAULT 3.00,
  sample_rate       integer NOT NULL DEFAULT 44100,
  channels          smallint NOT NULL DEFAULT 1,
  bit_depth         smallint NOT NULL DEFAULT 16,
  window_origin     text NOT NULL DEFAULT 'central',
  window_start_ms   integer,
  window_end_ms     integer,
  frames_count      smallint NOT NULL DEFAULT 63,
  sha256            char(64) NOT NULL UNIQUE,      -- clave de idempotencia
  ingest_status     text NOT NULL CHECK (ingest_status IN ('accepted','rejected')),
  reject_reason     text,                          -- NULL si accepted
  ac_ref_passed     boolean,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON acoustic_reference_clip (source_id, class_mapped_v1)
  WHERE ingest_status = 'accepted';

-- Vector de features (44 dims, window.v2)
CREATE TABLE acoustic_reference_feature (
  ref_clip_id     text PRIMARY KEY
                    REFERENCES acoustic_reference_clip(ref_clip_id) ON DELETE CASCADE,
  feature_schema  text NOT NULL,                   -- 'acoustic.feat.v2'
  window_schema   text NOT NULL,                   -- 'acoustic.feat.window.v2'
  frames_count    smallint NOT NULL,
  vector          double precision[] NOT NULL
                    CHECK (array_length(vector, 1) = 44)
);
```

### 6.2 Barrera C0/C1 (obligatoria)

```sql
-- Tabla maestra C0 (corpus propio; hoy 1 fila). source ∈ {cmsc_logger}.
-- CHECK: la partición C0 NUNCA es 'reference'.
ALTER TABLE acoustic_c0_sample
  ADD CONSTRAINT c0_partition_not_reference
  CHECK (partition IN ('unassigned','train','validation','test','holdout'));

-- Vista de entrenamiento de S81: SOLO corpus propio, SOLO particiones C0.
CREATE VIEW v_s81_training_set AS
  SELECT s.*
  FROM   acoustic_c0_sample s
  WHERE  s.source = 'cmsc_logger'
    AND  s.ingest_status = 'accepted'
    AND  s.partition IN ('train','validation','test');
```

La referencia **no aparece** en `v_s81_training_set`. Para pre-entrenamiento (bootstrap) se usa una vista separada y explícita `v_s81_reference_pretrain` (marcada `REF`), nunca la de entrenamiento/evaluación.

### 6.3 Pasos ETL (idempotente, transaccional)

1. **EXTRACT** — leer `manifest_ref.esc50.yaml` (428 aceptadas; +12 rechazadas documentadas en `PILOT_REPORT.md` §3), `mapping_esc50_to_v1.csv` (11 filas) y `reference/esc50/features/acoustic_features_ref_window_v2.csv` (428 filas × 44 dims + 4 columnas de metadatos).
2. **TRANSFORM** — validar contra `schema.json` 1.3.0: `partition='reference'`, `source='esc50'`, licencia en lista permitida (`CC BY-NC 3.0`, `CC-BY`), `duration_s=3.0`, `sample_rate=44100`, `channels=1`, `frames_count=63`, `vector` de 44 dims. Marcar `license_nc=true` para CC BY-NC.
3. **LOAD** — `INSERT ... ON CONFLICT (sha256) DO UPDATE` (idempotencia por hash). Una sola transacción; si falla cualquier fila, rollback total.
4. **VERIFY** — ejecutar las consultas de §6.4; abortar si algún conteo no cuadra.
5. **GATE** — `reference_status` permanece `INVENTARIADO`; solo pasa a `CONSUMIBLE` al cerrar los gates `G-REF-*`. **El ETL no promueve estado por sí mismo.**

### 6.4 Consultas de verificación

```sql
-- 428 aceptados
SELECT count(*) FROM acoustic_reference_clip WHERE ingest_status='accepted';
-- 38/40/115/79/119/37
SELECT class_mapped_v1, count(*) FROM acoustic_reference_clip
 WHERE ingest_status='accepted' GROUP BY 1 ORDER BY 1;
-- 12 rechazados
SELECT count(*) FROM acoustic_reference_clip WHERE ingest_status='rejected';
-- Fuga C0↔C1 = 0 (invariante)
SELECT count(*) FROM acoustic_reference_clip r
  JOIN acoustic_c0_sample c USING (sha256);
```

---

## 7. Esquema de metadatos `S81_V1`

Contrato de entrada que S81 consume. Alineado con `schema.json` v1.3.0 (42 columnas = 25 OBLIGATORIA + 5 OBLIGATORIA_HERRAMIENTA + 9 OPCIONAL + 3 DERIVADA) y con `labels.csv`.

### 7.1 Identidad y linaje

| Campo | Tipo | Gobierno | Nota |
|---|---|---|---|
| `sample_id` | string | OBLIGATORIA | `^ac_[0-9]{8}_[0-9]{6}_[0-9]{3,}$` |
| `file` | string | OBLIGATORIA | ruta POSIX bajo `v1/` (empieza por `raw/`) |
| `sha256` | string(64) | OBLIGATORIA_HERRAMIENTA | integridad |
| `dataset_version` | string | OBLIGATORIA | `v1` |
| `taxonomy_version` | string | OBLIGATORIA | `acoustic_v1_taxonomy` |
| `label_schema_version` | string | OBLIGATORIA | `acoustic_v1_label_schema` |
| `license` | enum | OBLIGATORIA | `PROPIO`\|`CC0`\|`CC-BY`\|`CC-BY-SA`\|`CC-BY-NC` (ND prohibido) |
| `source` | enum | OBLIGATORIA | `cmsc_logger` (C0) · fuentes REF en C1 |

### 7.2 Etiqueta (target de S81)

| Campo | Tipo | Gobierno | Nota |
|---|---|---|---|
| `class_id` | enum | OBLIGATORIA | 9 clases (§7.6) |
| `class_index` | int 0..8 | DERIVADA | binding §7.6 (target del clasificador) |
| `secondary_classes` | string | OPCIONAL | CSV de clases concurrentes |
| `confidence_annotator` | float 0..1 | OPCIONAL | confianza subjetiva (≠ acuerdo) |

### 7.3 Captura y trazabilidad

| Campo | Tipo | Gobierno |
|---|---|---|
| `session_id` | string (`ses_<YYYYMMDD>_<place_id>`) | OBLIGATORIA |
| `take_index` | int | OBLIGATORIA |
| `place_id` | string | OBLIGATORIA |
| `environment` | enum (`campo`\|`invernadero`\|`lab`\|`interior`) | OBLIGATORIA |
| `device_id` | string | OBLIGATORIA |
| `operator_id` | string | OBLIGATORIA |
| `capture_source_rate` | int | OBLIGATORIA |
| `resample_method` | enum (`none`\|`linear`\|`cubic`\|`soxr_hq`\|`browser_audiocontext`) | OBLIGATORIA |
| `timestamp` | ISO-8601 con offset | OBLIGATORIA |
| `hour_local` | int 0..23 | OPCIONAL (insumo S82) |
| `weather_note` | string | OPCIONAL |
| `latitude` / `longitude` | float | OPCIONAL |

### 7.4 QA y revisión

| Campo | Tipo | Gobierno |
|---|---|---|
| `annotator_id` | string | OBLIGATORIA |
| `annotation_round` | int (1\|2) | OBLIGATORIA |
| `review_annotator_id` | string | OPCIONAL (vacío si round=1) |
| `agreement` | enum (`single_reviewed`\|`double_reviewed_agree`\|`double_reviewed_disagree`\|`disputed_resolved`) | OBLIGATORIA |
| `ingest_status` | enum (`raw`\|`accepted`\|`rejected`\|`quarantine`) | OBLIGATORIA |
| `qc_status` | enum (`pending`\|`pass`\|`quarantine`) | OBLIGATORIA |
| `contaminated` | bool | OPCIONAL |
| `notes` | string | OPCIONAL |

### 7.5 Features y partición

| Campo | Tipo | Gobierno |
|---|---|---|
| `feature_schema` | string (`acoustic.feat.v2`) | OBLIGATORIA |
| `window_schema` | string (`acoustic.feat.window.v2`) | OBLIGATORIA |
| `frames_count` | int (63) | DERIVADA |
| `feature_vector` | float[44] | DERIVADA (mean+std, §7.7) |
| `partition` | enum (`unassigned`\|`train`\|`validation`\|`test`\|`holdout`\|`reference`) | OBLIGATORIA |
| `split_group_key` | string (`session_id::place_id`) | DERIVADA |
| `curated_path` | string | DERIVADA |

### 7.6 Binding de clases (target S81)

| `class_index` | `class_id` | `dir_name` | OOD |
|---:|---|---|:---:|
| 0 | silencio | silencio | — |
| 1 | viento | viento | — |
| 2 | lluvia | lluvia | — |
| 3 | agua | agua | — |
| 4 | insectos | insectos | — |
| 5 | ave | ave | — |
| 6 | voz | voz | — |
| 7 | motor | motor | — |
| 8 | ruido_desconocido | **desconocido** | ✔ |

### 7.7 Contrato de features (entrada del modelo)

- `acoustic.feat.v2` = 22 features; `acoustic.feat.window.v2` = **44 dims** = `mean(22) ‖ std(22)`, `std_ddof=0`, 63 frames/clip (N_FFT 4096, hop 2048, Hann).
- Clip: WAV PCM 16-bit · mono · 44.100 Hz · 3,0 s (`≈264.644 B`).
- Salida del clasificador: `class_index` 0..8 + probabilidad calibrada (ECE objetivo ≤ 0,10).
- Sin `validation_metrics.json` + `model_card.md`, un modelo **no existe**.

---

## 8. Invariantes y límites de este documento

1. **ESC-50 = C1 (referencia).** No entra en `train`/`validation`/`test` de C0 (S81). Solo bootstrap/pre-entrenamiento.
2. **El mapeo es el canónico vigente** (`canonical_h2_section_6`, 11→6). No se modificó gobernanza, `schema.json`, `labels.csv` ni manifiestos.
3. **Sin descarga, sin entrenamiento, sin código, sin commits.** Este documento es referencia; no autoriza la ejecución del ETL de §6.
4. **Taxonomía v1 congelada.** Cualquier clase nueva (p. ej. `abejas`, `paisaje rural`) requiere `acoustic_v2_taxonomy` y `dataset_version v2`.
5. **Corpus propio obligatorio.** ESC-50 no cubre `voz`, `silencio` ni `ruido_desconocido`; el corpus `cmsc_logger` sigue siendo la única fuente de evaluación de S81.

**Trazabilidad de contratos (no se duplican):** rutas + `schema_version` + SHA-256 de los contratos **C0** viven en `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` §11. Los contratos **REF** (`reference/esc50/metadata/mapping_esc50_to_v1.csv`, `reference/esc50/manifest_ref.esc50.yaml`, `reference/esc50/features/acoustic_features_ref_window_v2.csv`) **aún NO están registrados en §11**; su huella queda pendiente de una misión de gobernanza aparte. Este documento referencia, no copia.
