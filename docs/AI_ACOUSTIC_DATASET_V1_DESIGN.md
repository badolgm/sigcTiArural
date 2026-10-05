# AI ACOUSTIC DATASET V1 & DATA LOGGER — DISEÑO

**Misión:** CMSC_ACOUSTIC_DATASET_AND_MODEL_V1 · **FASE 2 (dataset maestro) + FASE 3 (data logger)**
**Fecha:** 2026-10-02 · **HEAD:** `83b6089` · **Estado:** SOLO DISEÑO — sin código, sin captura, sin descarga
**Regla de honestidad:** todo lo aquí descrito **no existe todavía**. Es el plano del corpus propio que
puede llevar a S81 de `DISENO` a `REAL-LOCAL`. Módulo vacío = `DISENO`, nunca adorno.

**Hereda de:**
- `docs/AI_ACOUSTIC_DATASET_REVIEW.md` (FASE 1: los públicos son proxies, no el dataset).
- `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md` (contrato `acoustic.feat.v1`, 22 features, S81/S82).
- Gobernanza del dataset agrícola real: `data/datasets/agriculture_images_tomato-potato-corn/v1/`
  (`manifests/`, `labels/`, `split_lists/`, `CHECKSUMS.sha256`, `dataset_card.md`).

---

# PARTE A — `SIGCT_RURAL_ACOUSTIC_DATASET_V1`

## A.1 Identidad

| Campo | Valor |
|---|---|
| `dataset_id` | `sigct_rural_acoustic` |
| `dataset_version` | `v1` |
| `context` | `acoustic_env` (entorno rural/agropecuario) |
| `modality` | `audio` |
| `source_signal` | **S30** (micrófono local, `REAL-LOCAL`) |
| `feature_schema` | `acoustic.feat.v1` (22 features) + agregación `acoustic.feat.window.v1` |
| `taxonomy_version` | `acoustic_v1_taxonomy` |
| `label_schema_version` | `acoustic_v1_label_schema` |
| `origin` | **propio** (capturado en campo/lab con `CMSC_DATA_LOGGER_V1`) |
| `git` | **fuera de git** (política `/data/` ya vigente en el repositorio) |
| `estado` | ⚠️ `DISENO` — 0 muestras al día de hoy |

## A.2 Unidad de muestra (clip contract) — congelado

| Parámetro | Valor propuesto | Razón |
|---|---|---|
| Formato | WAV PCM 16-bit | sin pérdida, nativo de `AudioContext`/`MediaRecorder` si se exporta WAV |
| Canales | 1 (mono) | el motor FFT de S30 analiza mono; evita divergencia |
| `sample_rate` | **44.100 Hz** (fijo; fallback `DEFAULT_SAMPLE_RATE`) | misma resolución espectral que `spectralEngine.js` |
| Duración de clip | **3,0 s** | ≥2 ventanas de análisis; estándar en ESC-50/urban |
| Ventana de análisis | 4096 muestras (~92,9 ms) = `N_FFT` | idéntico al instrumento |
| Hop entre frames | 2048 muestras (~46,4 ms) | 50% solape, ~65 frames por clip |
| Etiqueta | una de 9 clases | ver A.4 |

> **Nota de honestidad:** el "STFT" del instrumento es un espectrograma *rolling* (ver FEATURE_MAP §5).
> Para el dataset, la extracción de features se define **frame a frame** sobre el WAV, reproducible en
> Python y en JS, y luego se **agrega** (A.3). No se depende del render de UI.

## A.3 De 22 features (frame) a vector de clip — `acoustic.feat.window.v1`

El esquema congelado `acoustic.feat.v1` es **por frame**. Un clasificador por clip necesita un vector de
longitud fija. Propuesta (a aprobar por Bernardo):

```
Por cada clip de 3 s → ~65 frames × 22 features
Agregación temporal: { mean, std } por feature   → 22 × 2 = 44 dimensiones
(extensión opcional: + min, + max              → 22 × 4 = 88 dimensiones)
```

> **Regla:** la agregación **no inventa features nuevas**. Solo resume las 22 verificadas en el tiempo.
> Se versiona como `acoustic.feat.window.v1` y viaja en `meta.window_schema`. Si se aprueba, es contrato
> congelado igual que `acoustic.feat.v1`. Si no, la alternativa es clasificar **por frame** con voto
> mayoritario temporal (más simple de contrato, menos preciso).

## A.4 Taxonomía de 9 clases (`acoustic_v1_taxonomy`)

| `class_id` | Nombre | Definición operativa | Fuente pública de apoyo |
|---|---|---|---|
| `silencio` | SILENCIO | piso de ruido del entorno, sin evento dominante | **propia** (no existe en público) |
| `viento` | VIENTO | flujo de aire, rugosidad de banda ancha de baja frecuencia | ESC-50 `wind`, FSD50K `Wind` |
| `lluvia` | LLUVIA | precipitación sobre superficie/techo | ESC-50 `rain`, FSD50K `Rain` |
| `agua` | AGUA | curso/goteo/oleaje de agua | ESC-50 `water_drops`/`sea_waves`, FSD50K `Water` |
| `insectos` | INSECTOS | estridulación/actividad de insectos | BirdCLEF+ `Insecta`, Xeno-canto, ESC-50 `insects`/`crickets` |
| `ave` | AVE | vocalización de aves | Xeno-canto / BirdCLEF, ESC-50 `chirping_birds`/`rooster`/`crow` |
| `voz` | VOZ | voz humana (habla, no música) | Speech Commands, FSD50K `Speech` |
| `motor` | MOTOR | motor/maquinaria en operación | SONYC-UST, UrbanSound8K `engine_idling` |
| `ruido_desconocido` | RUIDO DESCONOCIDO | evento audible no clasificable / OOD | bucket **propio** |

**Regla de etiquetado:**
- **Clase única por clip** en v1 (single-label). El multilabel se difiere a v2.
- Un clip con dos eventos simultáneos se asigna a la clase **dominante** y se anota `contaminated:true`
  con las clases secundarias en `secondary_classes`.
- `ruido_desconocido` es **bucket OOD**, no una clase natural: nunca se fuerza un clip ambiguo a una
  clase viva.

## A.5 Ontología y binding (`taxonomy_binding_manifest`)

Cada clase CMSC se mapea a la ontología AudioSet (referencia, no uso de audio):

| CMSC | AudioSet (mid / display) orientativo | Uso |
|---|---|---|
| viento | `/m/03m9d0z` (Wind) | mapeo de apoyo |
| lluvia | `/m/06mb1jj` (Rain) | mapeo de apoyo |
| agua | `/m/0838f` (Water) | mapeo de apoyo |
| insectos | `/m/03vt0` (Insect) | mapeo de apoyo |
| ave | `/m/020d1` (Bird) | mapeo de apoyo |
| voz | `/m/09x0r` (Speech) | mapeo de apoyo |
| motor | `/m/02mk9` (Engine) | mapeo de apoyo |

> Los `mid` orientativos deben **verificarse** contra `yamnet_class_map.csv` antes de usarse (FASE 1b).
> El binding es para transferencia/negativos, no para el ground truth del CMSC.

## A.6 Esquema de metadatos por clip (`acoustic_v1_label_schema`)

`labels/acoustic_labels_v1.csv` — una fila por muestra:

| Columna | Tipo | Descripción |
|---|---|---|
| `sample_id` | string | `ac_<YYYYMMDD>_<HHMMSS>_<seq>` |
| `file` | string | ruta relativa WAV |
| `sha256` | string | integridad del WAV |
| `duration_s` | float | 3.0 esperado |
| `sample_rate` | int | 44100 |
| `channels` | int | 1 |
| `class_id` | enum | una de las 9 |
| `class_name` | string | nombre legible |
| `secondary_classes` | string | CSV de clases concurrentes (puede ir vacío) |
| `contaminated` | bool | evento múltiple |
| `confidence_annotator` | float | 0..1 (acuerdo de etiquetado) |
| `place_id` | string | sitio/parcela/lab |
| `environment` | enum | `campo` · `invernadero` · `lab` · `interior` |
| `session_id` | string | sesión de grabación (clave anti-leakage) |
| `device_id` | string | micrófono/dispositivo |
| `timestamp` | ISO-8601 | inicio del clip |
| `hour_local` | int | 0–23 (franja horaria, útil para S82) |
| `weather_note` | string | opcional (viento/lluvia reales) |
| `license` | enum | `PROPIO` en v1; `CC-BY`/`CC-BY-SA`/`CC0`/`CC-BY-NC` para material público |
| `source` | enum | `cmcs_logger` · `fsd50k` · `esc50` · `xeno_canto` · `speech_commands` · `sonyc` |
| `annotator_id` | string | etiquetador |
| `annotation_round` | int | 1 = primera, 2 = verificación |

## A.7 Estructura en disco (espejo de la gobernanza agrícola)

```
data/datasets/sigct_rural_acoustic/v1/
├── RAW/                         # clips originales, intocados
│   └── <class_id>/*.wav
├── curated/
│   ├── train/ <class_id>/*.wav
│   ├── validation/ <class_id>/*.wav
│   └── test/ <class_id>/*.wav
├── holdout/
│   └── real_world_holdout_v1/   # sesiones/sitios NUNCA vistos (vacío al inicio)
├── labels/
│   └── acoustic_labels_v1.csv
├── manifests/
│   ├── raw_source_manifest.acoustic_v1.yaml
│   ├── curation_manifest.acoustic_v1.yaml
│   ├── taxonomy_binding_manifest.acoustic_v1.yaml
│   ├── split_manifest.acoustic_v1.yaml
│   └── baseline_experiment_manifest.acoustic_v1.yaml
├── split_lists/
│   ├── train.csv
│   ├── validation.csv
│   └── test.csv
├── features/                    # opcional: acoustic_features_v1.csv (cache)
├── CHECKSUMS.sha256
└── dataset_card.md
```

> **No versionado en git** (política `/data/`). Los **manifiestos** son el único artefacto que puede
> copiarse a `docs/ai/manifests/` (como ya se hace con el dataset agrícola).

## A.8 Split y anti-leakage

| Regla | Valor |
|---|---|
| Ratios | **70 / 15 / 15** |
| Estratificación | por `class_id` |
| `random_seed` | **42** (misma disciplina del dataset V2+) |
| **Group split** | agrupar por `(session_id, place_id)` — **jamás** partir clips de la misma sesión/sitio entre train y test |
| Anti-leakage | hash exacto + niveles de energía por frame (detección de clips duplicados) |
| Holdout de campo | reservar 1–2 sitios/horarios completos como `real_world_holdout_v1` |
| Prohibido | mezclar el mismo `device_id` entre train y test **sin** validar transferencia de dispositivo |

> Esta es la regla clave contra el **domain shift** (riesgo R3). El test debe medir *generalización a
> entorno/sesión nuevos*, no memorización.

## A.9 Objetivos de volumen (mínimos viables)

| Clase | Mínimo v1 | Objetivo v1 | Ideal |
|---:|---:|---:|---:|
| silencio | 150 | 300 | 600 |
| viento | 150 | 300 | 600 |
| lluvia | 150 | 300 | 600 |
| agua | 150 | 300 | 600 |
| insectos | 150 | 300 | 600 |
| ave | 150 | 300 | 600 |
| voz | 150 | 300 | 600 |
| motor | 150 | 300 | 600 |
| ruido_desconocido | 150 | 300 | 600 |
| **Total** | **1.350** | **2.700** | **5.400** |

- 3 s × 44,1 kHz × 16 bit ≈ **264 KB/clip** → 1.350 clips ≈ **356 MB** (viable local).
- Balance 1:1:1… es requisito de v1 (evita repetición del desbalance 35:1 del dataset agrícola).
- **Preferir diversidad de sitio/sesión sobre número absoluto de clips.**

## A.10 Manifiestos (esqueleto YAML)

### `raw_source_manifest.acoustic_v1.yaml`
```yaml
schema_version: "1.0"
manifest_type: "raw_source_manifest"
dataset_id: "sigct_rural_acoustic"
dataset_version: "v1"
context: "acoustic_env"
modality: "audio"
sources:
  - source: "cmcs_logger"
    kind: "primary"
    license: "PROPIO"
    collected_by: "SIGCT-Rural / CMSC"
  - source: "fsd50k"
    kind: "reference"
    license: "CC-BY (per-clip verified)"
  - source: "esc50"
    kind: "reference"
    license: "CC-BY-NC 3.0"
  - source: "xeno_canto"
    kind: "reference"
    license: "per-recording (ND excluded)"
notes:
  - "Ninguna fuente pública sustituye al corpus propio (ver AI_ACOUSTIC_DATASET_REVIEW.md)."
```

### `split_manifest.acoustic_v1.yaml`
```yaml
schema_version: "1.0"
manifest_type: "split_manifest"
split_version: "acoustic_v1_split"
context: "acoustic_env"
modality: "audio"
inputs:
  dataset_id: "sigct_rural_acoustic"
  dataset_version: "v1"
  curation_manifest: "curation_manifest.acoustic_v1.yaml"
ratios: { train: 0.70, validation: 0.15, test: 0.15 }
stratification_rules:
  - "Stratify by class_id"
  - "Group by (session_id, place_id) — no partition mixing"
anti_leakage_rules:
  - "Exact file hash deduplication"
  - "Near-duplicate detection (frame energy correlation)"
  - "Reserve real_world_holdout_v1 for unseen places/hours"
reproducibility:
  random_seed: 42
  split_algorithm: "stratified_group_split"
outputs_expected:
  - "split_lists/train.csv"
  - "split_lists/validation.csv"
  - "split_lists/test.csv"
quality_gates:
  - "No class absent in any partition"
  - "Report per-class counts per partition"
  - "Block if leakage detected across partitions"
```

## A.11 Gates de dataset

| Gate | Criterio | Bloquea |
|---|---|---|
| **G-DS-1** | Taxonomía + esquema de metadatos aprobados por Bernardo | construcción |
| **G-DS-2** | ≥150 clips/clase propios y balanceados | entrenamiento v1 |
| **G-DS-3** | Group split sin fuga (`session_id`,`place_id`) + holdout de sitio reservado | evaluación creíble |
| **G-DS-4** | `dataset_card.md` + `CHECKSUMS.sha256` + 5 manifiestos presentes | gobernanza |
| **G-DS-5** | Verificación de licencias (columna `license`) en todo material público | legal |
| **G-DS-6** | Acuerdo de anotación (2 rondas) ≥ umbral acordado | calidad de etiqueta |

---

# PARTE B — `CMSC_DATA_LOGGER_V1` (diseño)

Herramienta de captura y etiquetado del corpus propio. **No se implementa aquí.**

## B.1 Objetivo

Convertir la señal real de S30 en muestras etiquetadas, trazables y balanceadas, sin salir del entorno
local del CMSC, con **cero subida de audio** a ningún servicio.

## B.2 Dos variantes (a decidir por Bernardo)

### Variante A — Logger web en CMSC (recomendada para captura de campo con UI)
- Reutiliza `getUserMedia` ya usado por `SpectralAnalysisInstrument`.
- `MediaRecorder` o `AudioWorklet`/`ScriptProcessor` → WAV PCM mono 44,1 kHz.
- UI de etiquetado: elegir `class_id`, `place_id`, `environment`, `session_id`, `device_id`, notas.
- Exportación: ZIP de WAV + `acoustic_labels_v1.csv` (descarga local) o **File System Access API**
  (escritura directa a `data/datasets/...` en el equipo del investigador).
- **Privacidad:** todo local; sin red; sin almacenar en navegador más allá de la sesión.

### Variante B — Logger CLI (Python) para volcado y curación
- Script de captura/ingesta desde WAVs existentes, deduplicación, hash, split y manifiestos.
- Reutiliza el **patrón de gobernanza** del dataset agrícola (`split_report.json`, `CHECKSUMS.sha256`).
- Recorta/valida formato y sample rate; genera `features/acoustic_features_v1.csv` con el mismo esquema.

> **Recomendación:** **A para captura, B para curación**. Ambos escriben el **mismo** esquema de metadatos
> (A.6), de modo que el notebook maestro (FASE 6) sea agnóstico al origen.

## B.3 Flujo de captura (7 pasos)

```
1. Abrir logger → elegir clase/entorno/sitio/sesión/device
2. Grabar 3 s (cuenta atrás)  →  WAV mono 44.1k
3. Vista previa: waveform + espectro (reutiliza el motor FFT de S30 si es Variante A)
4. Confirmar/rechazar etiqueta (validación humana)
5. Guardar WAV + fila en acoustic_labels_v1.csv (con sha256)
6. Balance en vivo: contador por clase (avisar si desbalance > 1.5:1)
7. Al cerrar sesión: generar CHECKSUMS.sha256 + actualizar dataset_card.md
```

## B.4 Controles de honestidad y ética

| Control | Regla |
|---|---|
| Sin audio en la nube | 100% local; ninguna subida |
| Sin audio crudo persistente del usuario | si se captura voz, sin retención del habla identificable |
| Consentimiento | registro de quién captura y con qué fin (campo `annotator_id`) |
| Separación lab/campo | `environment` obligatorio; el split no mezcla |
| Ground truth | etiqueta humana con 2 rondas; nunca pseudo-etiquetas en v1 |
| Balance | objetivo 1:1:1…; bloquear sesgo 35:1 |

## B.5 Integración con el instrumento (aditiva, NO romper)

- El logger **reutiliza** el motor de features; **no** modifica `SpectralAnalysisInstrument.jsx`,
  Hero, Workbench V6, Dashboard ni estilos.
- Si se implementa como ruta propia (`/dashboard-cmsc/acoustic-logger` o panel), debe ser **aditiva**
  y registrada en la navegación sin tocar las 15 rutas actuales de `App.jsx` (misma disciplina F3C).
- El punto de enganche de lectura del `frame` (hook/event-bus) es el definido en
  `AI_ACOUSTIC_ARCHITECTURE_V1.md` §6.

## B.6 Entregables del logger

| Artefacto | Formato |
|---|---|
| Clips WAV | `RAW/<class_id>/*.wav` |
| Etiquetas | `labels/acoustic_labels_v1.csv` |
| Checksums | `CHECKSUMS.sha256` |
| Caché de features | `features/acoustic_features_v1.csv` |
| Manifiestos | 5 YAML (A.10) |
| Tarjeta | `dataset_card.md` |

---

## RIESGOS (FASE 2/3)

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| DD1 | Dataset desbalanceado/sesgado a un solo sitio | 🔴 | balance 1:1 + group split por sitio/sesión |
| DD2 | Licencias públicas mal documentadas | 🔴 | columna `license` obligatoria; excluir `ND`; marcar `NC` |
| DD3 | Privacidad de voz | 🔴 | local-only, sin retención de habla, consentimiento |
| DD4 | Deriva de esquema features↔dataset | 🟠 | `acoustic.feat.v1` + `window.v1` congelados y versionados |
| DD5 | Sample rate/dispositivo inconsistente | 🟠 | SR 44,1k fijo + `device_id`; validar transferencia |
| DD6 | El logger "crea" capacidad que no existe | 🟠 | estado `DISENO`; 0 clips hoy; sin UI real hasta misión explícita |
| DD7 | Confundir `REF` con `REAL-LOCAL` | 🔴 | el estado solo sube con corpus propio (A.11 gate G-DS-2/3) |

## Próximo paso

FASE 4/5 (`AI_ACOUSTIC_MODEL_BENCHMARK.md`): protocolo de benchmark y recomendación de **Model V1**
sobre este dataset y el esquema `acoustic.feat.window.v1`.

> **Regla final:** el CMSC no tiene hoy ni un segundo de audio etiquetado. Este documento lo dice y
> diseña cómo conseguirlo; no finge que ya existe.
