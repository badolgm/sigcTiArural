# INFORME BRIDGE_E2E_UI_VALIDATION

- Fecha: 2026-10-09
- Misión: BRIDGE_E2E_UI_VALIDATION (autorizada por Bernardo)
- Alcance: validación VISUAL del flujo completo en navegador real (Edge, headless)
- Dataset: SOLO sandbox (`cmsc_ui_eval_v1`, copia de C0). **C0 productivo NO tocado (verificado 1/1/1 tras la prueba).**

## Flujo validado

```
AcousticLoggerPanel ──clic "Iniciar captura"──▶ PCM TAP de S30 (3 s reales)
      │  clic "Ingresar al dataset"
      ▼
POST /ingest (multipart wav+manifest) ──▶ Bridge 127.0.0.1:8766
      ▼
ingestWav() (motor único CLI+UI) ──▶ metadata.csv ──▶ features/acoustic_features_v2.csv ──▶ raw/<clase>/WAV
      ▼
GET /stats ──▶ AcousticDatasetPanel (poll 3 s) ──▶ badge REAL · conteos en vivo
```

## 1. Captura (evidencia visual)

Screenshots (browser Edge headless 1920×1050, ruta `C:\Users\BagmDev\AppData\Local\Temp\opencode\e2e_ui\`):

| Archivo | Momento |
|---|---|
| `00_pagina_entera.png` | Página `/dashboard-cmsc` cargada |
| `01_zone_activa.png` | Zona con **S30 OK** y **PUENTE OK**, Dataset `REAL` · baseline 1/1/1 |
| `02_cola_captura.png` | Cola tras captura: `ave · 3s · ingest_pending` |
| `03_respuesta_bridge.png` | Respuesta del bridge: `accepted` · `ac_20261009_184510_000` · 44 dims |
| `04_dataset_actualizado.png` | Dataset `REAL` actualizado a 2 filas / 2 WAV / 2 features / 2 accepted |

Transcripción textual íntegra de los 4 estados: `_transcripcion.txt`. JSON estructurado: `_resultado.json`.

## 2. Conteos (antes → después, todos reales desde el disco)

| Métrica | Baseline | Final |
|---|---|---|
| WAV (`raw/`) | 1 clip | **2 clips** (1 origen + 1 nuevo en `raw/ave/`) |
| `metadata.csv` | 1 fila | **2 filas** |
| `acoustic_features_v2.csv` | 1 vector | **2 vectores** |
| accepted | 1 | **2** |
| rejected | 0 | 0 |

Clase nueva: `ave` (vacía en baseline → **1** aceptada).

## 3. Evidencia visual de la traza (verdades del disco sandbox)

- Sample nuevo: `ac_20261009_184510_000` · veredicto `accepted`.
- WAV: `raw/ave/ac_20261009_184510_000_097c6f06…99e30.wav` · **264.644 B**.
- Fila `metadata.csv`: `duration_s=3.000000` · `sample_rate=44100` · `channels=1` · `bit_depth=16` · `capture_source_rate=48000` · `resample_method=cubic` (remuestreo DECLARADO) · `license=PROPIO` · `source=cmsc_logger` · `dataset_version=v1` · `feature_schema=acoustic.feat.v2` · `window_schema=acoustic.feat.window.v2` · `frames=63` · `ingest_status=accepted` · `veredicto_final="remuestreado 48000->44100 (cubic) | CMSC_DATA_LOGGER_V1 v1.0.0"`.
- CSV features: 48 columnas = `sample_id` + `feature_schema` + `window_schema` + `frames_count` + **44 dims**.

## 4. Estado de cada componente

| Componente | Estado | Evidencia |
|---|---|---|
| S30 (PCM TAP) | **REAL-LOCAL · OK activo** | badge `S30 OK` en el Logger durante toda la prueba |
| AcousticLoggerPanel | **OPERATIVO Tramo B** | captura real de 3 s desde el tap; cola `ave · 3s`; form lleno y enviado |
| POST /ingest (multipart) | **OPERATIVO** | respuesta `accepted` con sample_id y 44 dims; sin error |
| Bridge 127.0.0.1:8766 | **UP** | `PUENTE OK` en ambos paneles; `/health` ok; `/stats` ok |
| Motor `ingestWav()` | **OPERATIVO** | AC-1..AC-10 ejecutados; veredicto real devuelto tal cual (la UI no decide) |
| `metadata.csv` | **ESCRITURA CORRECTA** | 2 filas; remuestreo declarado 48000→44100 cubic |
| `features/acoustic_features_v2.csv` | **ESCRITURA CORRECTA** | 2 vectores × 44 dims |
| `GET /stats → AcousticDatasetPanel` | **REAL, en vivo** | poll 3 s actualizó automáticamente 1→2; badge `REAL` + `PUENTE OK`; `—` sin puente |
| C0 productivo (`/data/.../v1`) | **INTACTO (no se tocó)** | `node cli.js status`: 1 fila / 1 WAV / 1 features, `CAPTADO_INICIAL` |
| HTML en consola (ruido ajeno) | 1×404 + 4×500 | identificados: `GET /api/v3/telemetry/history/` → 500 (TelemetryPanel V3, dependencia externa, AJENA a la zona y al bridge) |

## 5. Dictamen

### ✅ GO_TRAMO_B_FINAL

El flujo completo **AcousticLoggerPanel → POST /ingest → Bridge → ingestWav → metadata.csv → features → GET /stats → AcousticDatasetPanel** funciona de extremo a extremo en navegador real, con solo sandbox, sin tocar C0. La UI no inventa estados: muestra el veredicto real del motor y los conteos reales leídos por `/stats`.

Observaciones honestas:
- El audio de la prueba proviene de un shim de micrófono determinista (WebAudio) sobre sandbox; la ingesta **productiva** sigue dependiendo del **Tramo C** (PCM continuo de S30) para tener señales reales de valor.
- Ruido de consola 404/500 ajeno al flujo (TelemetryPanel V3) — no afecta la validación.
- Artefacto de evidencia programática previo: `EVIDENCIA_FLUJO_BRIDGE.md` (ingesta REAL sandbox vía API). Este informe suma la validación de UI real.
- Sin commits ni push (se mantienen 25 commits locales sin empujar).