# FIELD DATA COLLECTION PROTOCOL

**Misión:** `CMSC_ORCHESTRATION_V2_FIELD_PILOT_EXECUTION`  
**Fecha:** 2026-10-05  
**Estado:** PROTOCOLO · NO EJECUTADO  
**Base:** `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` §5 + `FIELD_PILOT_EXECUTION_PLAN.md`

---

## 0. ESTADO HONESTO

| Elemento | Estado |
|---|---|
| Protocolo definido | ✅ |
| Infraestructura lista | ✅ |
| **Datos de campo** | ⏳ **PENDIENTE** |
| **100 muestras reales** | ⏳ **PENDIENTE** |

---

## 1. PROTOCOLO DE CAPTURA

### 1.1 Preparación de sesión

1. Verificar micrófono conectado y funcionando.
2. Verificar batería del dispositivo.
3. Definir `session_id` (convención: `pilot_YYYY_MM_DD_<lugar>_<secuencia>`).
4. Definir `place_id` (`site_a`, `site_b` o `site_c`).
5. Definir `operator_id`.
6. Definir `device_id`.
7. Seleccionar clase objetivo.
8. Seleccionar entorno (`campo`, `invernadero`, `lab`, `interior`).

### 1.2 Captura

1. Iniciar S30 (SpectralAnalysisInstrument).
2. Verificar que S30 está activo (badge `S30 OK`).
3. Completar campos obligatorios en el Logger.
4. Iniciar captura.
5. Verificar progreso (muestras/tiempo).
6. Al completar 3.0s, el paquete está listo.
7. Guardar WAV + JSON.

### 1.3 Post-captura

1. Verificar que el paquete está en la cola.
2. Verificar que el estado es `ingest_pending`.
3. Anotar cualquier incidencia en `notes`.
4. Si la toma no es válida, descartar (no guardar).

---

## 2. PROTOCOLO DE METADATA

### 2.1 Campos obligatorios

| Campo | Tipo | Ejemplo |
|---|---|---|
| `class_id` | string | `"silencio"` |
| `session_id` | string | `"pilot_2026_10_05_site_a_01"` |
| `place_id` | string | `"site_a"` |
| `operator_id` | string | `"bernardo"` |
| `device_id` | string | `"mic_s30_laptop01"` |
| `take_index` | number | `1` |
| `timestamp` | string | `"2026-10-05T14:30:00.000Z"` |
| `capture_source_rate` | number | `48000` |
| `channels` | number | `1` |
| `duration_s` | number | `3.0` |
| `environment` | string | `"campo"` |
| `annotator_id` | string | `"bernardo"` |

### 2.2 Campos opcionales

| Campo | Tipo | Ejemplo |
|---|---|---|
| `hour_local` | string | `"14"` |
| `weather_note` | string | `"despejado, viento leve"` |
| `notes` | string | `"estado del sitio, ruido de fondo"` |
| `latitude` | string | `"4.7110"` |
| `longitude` | string | `"-74.0721"` |
| `secondary_classes` | string | `"insectos"` |
| `contaminated` | boolean | `true` |
| `confidence_annotator` | string | `"0.85"` |

---

## 3. PROTOCOLO DE CALIDAD

### 3.1 Criterios de aceptación de toma

| Criterio | Descripción |
|---|---|
| Duración exacta | 3.0s ±0.01 |
| Sin clipping | < 1% muestras saturadas |
| No mudo | `max|x| ≥ 0.001` |
| Coherencia espectral | ≥ 1 pico en 20 Hz – 20 kHz |
| Sin duplicados | `sha256` único |

### 3.2 Criterios de rechazo de toma

| Criterio | Descripción |
|---|---|
| Duración incorrecta | ≠ 3.0s ±0.01 |
| Clipping | ≥ 1% muestras saturadas |
| Mudo | `max|x| < 0.001` |
| Sin pico espectral | No hay pico en 20 Hz – 20 kHz |
| Duplicado | `sha256` ya existe |

---

## 4. PROTOCOLO DE HOLDOUT

### 4.1 Reglas

1. `site_c` es 100% holdout desde el día 1.
2. Ningún clip de `site_c` entra en train/validation/test.
3. El holdout evalúa generalización a sitio no visto.
4. El holdout se valida con `split_report.json`.

### 4.2 Verificación

```bash
node tools/cmsc-data-logger/src/cli.js split --holdout-place site_c
node tools/cmsc-data-logger/src/cli.js pilot-validate
```

**PILOT-6:** `holdout/` contiene material de `site_c` y ningún `site_c` está en train.

---

## 5. PROTOCOLO DE DOBLE REVISIÓN

### 5.1 Ronda 1

1. `operator_id` captura y etiqueta.
2. `annotator_id` = `operator_id`.
3. `agreement` = `single_reviewed`.

### 5.2 Ronda 2

1. `review_annotator_id` revisa sin ver ronda 1.
2. Registra `agreement`:
   - `double_reviewed_agree` → Ambos coinciden.
   - `double_reviewed_disagree` → No coinciden.
   - `disputed_resolved` → Resuelto por tercero.

### 5.3 Comando

```bash
node tools/cmsc-data-logger/src/cli.js review \
  --sample <sample_id> \
  --annotator <review_annotator_id> \
  --agreement <agreement>
```

---

## 6. PROTOCOLO DE INGESTA

### 6.1 Flujo

```
WAV + JSON descargado → CLI ingest-browser → Dataset
```

### 6.2 Comando

```bash
node tools/cmsc-data-logger/src/cli.js ingest-browser \
  --manifest <manifest.json> \
  --wav <clip.wav>
```

### 6.3 Respuesta del CLI

```json
{
  "verdict": "accepted",
  "sample_id": "ac_20261005_143000_001",
  "failed": [],
  "checks": [...]
}
```

### 6.4 Reglas

1. El paquete descargado es `ingest_pending`.
2. Solo el CLI puede cambiar el estado.
3. La UI no altera estados sin respuesta del CLI.
4. `accepted` → El clip entra al dataset.
5. `quarantine` → El clip se preserva con motivo.
6. `rejected` → El clip se preserva con motivo.

---

## 7. PROTOCOLO DE ALMACENAMIENTO

### 7.1 Estructura del dataset

```
data/datasets/sigct_rural_acoustic/v1/
├── raw/<clase>/
│   └── <sample_id>_<sha256>.wav
├── metadata/
│   └── metadata.csv
├── features/
│   └── acoustic_features_v2.csv
├── split_lists/
│   ├── train.csv
│   ├── validation.csv
│   └── test.csv
├── holdout/
│   └── real_world_holdout_v1/
│       └── holdout_samples.csv
└── CHECKSUMS.sha256
```

### 7.2 Reglas

1. El dataset vive fuera de git (`.gitignore:68`).
2. `metadata.csv` es la única fuente de verdad.
3. Los derivados (`features/`, `split_lists/`, `CHECKSUMS.sha256`) se regeneran.
4. Nada se borra. Los rechazados y cuarentenas se preservan con motivo.

---

## 8. PROTOCOLO DE EVIDENCIA

### 8.1 Artefactos de evidencia

| Artefacto | Qué prueba |
|---|---|
| `metadata.csv` | 100 muestras con metadata completa |
| `split_report.json` | Group split ejecutado sin fuga |
| `CHECKSUMS.sha256` | Integridad de los WAV |
| `pilot-validate` | PILOT-1..7 PASS |

### 8.2 Comandos de verificación

```bash
# Estado del dataset
node tools/cmsc-data-logger/src/cli.js status

# Gates
node tools/cmsc-data-logger/src/cli.js validate

# Split
node tools/cmsc-data-logger/src/cli.js split --holdout-place site_c

# Piloto
node tools/cmsc-data-logger/src/cli.js pilot-validate
```

---

## CONCLUSIÓN

**El protocolo está definido. La infraestructura está lista. El campo decide.**

**NO se afirma que los datos existen. Se afirma que el protocolo está listo para producirlos.**

---

**Estado del documento:** PROTOCOLO · LISTO PARA EJECUCIÓN  
**No autoriza:** captura real, commits, push, merge  
**Próximo paso:** Ejecución del piloto en campo
