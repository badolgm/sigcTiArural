# Evidencia del flujo — AcousticLoggerPanel → Bridge → /ingest → metadata.csv → acoustic_features_v2.csv

**Misión:** CMSC_ACOUSTIC_BRIDGE_IMPLEMENTATION (Tramo B) · **Fecha:** 2026-10-09 · **Sandbox:** C:/Users/BagmDev/AppData/Local/Temp/opencode/cmsc_evid_v1

> La ingesta de esta evidencia es REAL (sin dry_run) pero sobre una **copia** del dataset (BRIDGE_DATASET). El dataset productivo (`data/datasets/sigct_rural_acoustic/v1`) queda intacto.

## 0. Arranque del bridge
```
[2026-10-09T23:21:31.622Z] cmsc-acoustic-bridge v1.0.0 · http://127.0.0.1:8766
[2026-10-09T23:21:31.624Z] mission CMSC_DATA_LOGGER_V1 · dataset C:/Users/BagmDev/AppData/Local/Temp/opencode/cmsc_evid_v1
[2026-10-09T23:21:31.624Z] dataset LISTO · CORS http://localhost:5174, http://127.0.0.1:5174
```

## 1. GET /health → servicio LISTO
```json
{
  "ok": true,
  "service": "cmsc-acoustic-bridge",
  "version": "1.0.0",
  "mission": "CMSC_DATA_LOGGER_V1",
  "datasetRoot": "C:/Users/BagmDev/AppData/Local/Temp/opencode/cmsc_evid_v1",
  "datasetReady": true
}
```

## 2. GET /stats · línea base del sandbox (heredada de C0: E1)
```json
{
  "rows": 1,
  "wavs": 1,
  "features": 1,
  "summary": {
    "accepted": 1,
    "rejected": 0,
    "quarantine": 0,
    "other": 0
  },
  "schema_version": "1.3.0"
}
```

## 3. POST /ingest (real, sin dry_run) — el MISMO endpoint que llama AcousticLoggerPanel
### 3.1 toma → `ave` (tono 1 kHz)
HTTP 200
```json
{
  "ok": true,
  "dryRun": false,
  "verdict": "accepted",
  "sample_id": "ac_20261009_182131_000",
  "features44": 44,
  "checks": [
    "AC-1:true",
    "AC-2:true",
    "AC-3:true",
    "AC-4:true",
    "AC-5:true",
    "AC-6:true",
    "AC-7:true",
    "AC-8:true",
    "AC-9:true",
    "AC-10:true"
  ]
}
```

### 3.2 toma → `motor` (tono 60 Hz)
HTTP 200
```json
{
  "ok": true,
  "dryRun": false,
  "verdict": "accepted",
  "sample_id": "ac_20261009_182131_001",
  "features44": 44
}
```

## 4. GET /stats · después (1+2 filas · conteos en vivo)
```json
{
  "rows": 3,
  "wavs": 3,
  "features": 3,
  "summary": {
    "accepted": 3,
    "rejected": 0,
    "quarantine": 0,
    "other": 0
  },
  "byClass_ave": {
    "accepted": 1,
    "rejected": 0,
    "quarantine": 0,
    "other": 0,
    "wav": 1
  },
  "byClass_motor": {
    "accepted": 1,
    "rejected": 0,
    "quarantine": 0,
    "other": 0,
    "wav": 1
  }
}
```

## 5. metadata.csv · 2 últimas filas (accepted)
```
header: (3 filas totales)
sample_id=ac_20261009_182131_000 | file=raw/ave/ac_20261009_182131_000_8839a9ef6498d3baa7846c3c8e0a30a3e4d39d8311830b0e4fad0ba281911491.wav | partition=unassigned | class_id=ave | ingest_status=accepted | feature_schema=acoustic.feat.v2 | window_schema=acoustic.feat.window.v2 | license=PROPIO | source=cmsc_logger | sha256=8839a9ef6498d3ba… | agreement=single_reviewed
sample_id=ac_20261009_182131_001 | file=raw/motor/ac_20261009_182131_001_86ef3bde2878ced613f9af323b9c449e32fec5078b55ea6487accf03ea1abe40.wav | partition=unassigned | class_id=motor | ingest_status=accepted | feature_schema=acoustic.feat.v2 | window_schema=acoustic.feat.window.v2 | license=PROPIO | source=cmsc_logger | sha256=86ef3bde2878ced6… | agreement=single_reviewed
```

## 6. features/acoustic_features_v2.csv · última fila (44 dims)
```
vectores en csv: 3
sample_id: ac_20261009_182131_001
identidad: feature_schema=acoustic.feat.v2 · window_schema=acoustic.feat.window.v2 · frames_count=
dims: 44 (expectativa 44, schema acoustic.feat.window.v2) · first: 0.0029296875, 1, 0.0029366454 · last: 0.7036236996, 2.34e-8
```

## 7. WAV persistido en raw/<clase>/
```
raw/ave/ → 1 WAV → ac_20261009_182131_000_8839a9ef6498d3baa7846c3c8e0a30a3e4d39d8311830b0e4fad0ba281911491.wav (258 KiB)
raw/motor/ → 1 WAV → ac_20261009_182131_001_86ef3bde2878ced613f9af323b9c449e32fec5078b55ea6487accf03ea1abe40.wav (258 KiB)
```

## 8. Resumen del artefacto de evidencia
- Filas metadata.csv tras la prueba: **3** (E1 + 2 nuevas) · verdicts: 3 accepted · checks de ingesta AC-1..AC-10 ejecutados por el motor `ingestWav()` (el mismo del CLI).
- C0 productivo **NO modificado** (la prueba corrió sobre el sandbox).