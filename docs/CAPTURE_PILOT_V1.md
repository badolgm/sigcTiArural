# CAPTURE_PILOT_V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: CAPTURE_PILOT_V1.md
> - Destino: docs/CAPTURE_PILOT_V1.md

## Plan operativo

**Objetivo:** capturar 80 clips reales del dataset acústico SIGCT-Rural v1.
**Clases vivas (8):** silencio, viento, lluvia, agua, insectos, ave, voz, motor.
**Clase excluida:** ruido_desconocido (bucket OOD, no se captura a demanda).

---

## session_id propuestos

| session_id |
|------------|
| PILOT_01   |
| PILOT_02   |
| PILOT_03   |
| PILOT_04   |
| PILOT_05   |
| PILOT_06   |
| PILOT_07   |
| PILOT_08   |
| PILOT_09   |
| PILOT_10   |

## place_id propuestos

| place_id |
|----------|
| PLACE_A  |
| PLACE_B  |
| PLACE_C  |

Asignación cíclica: PILOT_01=PLACE_A, PILOT_02=PLACE_B, PILOT_03=PLACE_C, PILOT_04=PLACE_A, etc.

---

## Distribución exacta por clase

| Clase | Clips totales | Clips por sesión | Sesiones |
|-------|---------------|------------------|----------|
| silencio | 10 | 1 | 10 |
| viento | 10 | 1 | 10 |
| lluvia | 10 | 1 | 10 |
| agua | 10 | 1 | 10 |
| insectos | 10 | 1 | 10 |
| ave | 10 | 1 | 10 |
| voz | 10 | 1 | 10 |
| motor | 10 | 1 | 10 |
| **Total** | **80** | **8** | **10** |

---

## Flujo completo

**S30 → Bridge Logger → POST /ingest → metadata.csv → acoustic_features_v2.csv → split → validate**

1. **S30:** micrófono local captura WAV PCM 16-bit, mono, 44.100 Hz, segmento de 3,0 s.
2. **Bridge Logger:** `tools/cmsc-data-logger/bridge/server.js` expone `POST /ingest` en `127.0.0.1:8766`.
3. **POST /ingest:** envía el WAV y el JSON de metadata por multipart/form-data.
4. **metadata.csv:** el logger valida AC-1..AC-10 y escribe la fila con `ingest_status` y `qc_status`.
5. **acoustic_features_v2.csv:** el logger regenera el vector de 44 dims del clip aceptado.
6. **split:** `node src/cli.js split` distribuye los clips por `(session_id, place_id)` en `train.csv`, `validation.csv`, `test.csv`.
7. **validate:** `node src/cli.js validate` evalúa G-DS-1..G-DS-6 sobre el estado actual.

---

## Metadata mínima obligatoria por captura

| Campo | Descripción |
|-------|-------------|
| sample_id | identificador único del clip |
| class_id | clase según labels.csv (silencio/viento/lluvia/agua/insectos/ave/voz/motor) |
| dir_name | nombre de carpeta asociada a class_id |
| session_id | PILOT_01..PILOT_10 |
| place_id | PLACE_A / PLACE_B / PLACE_C |
| capture_date | fecha de captura |
| capture_time | hora de captura |
| capture_source | origen de la captura (S30) |
| capture_source_rate | tasa de muestreo de origen del dispositivo |
| resample_method | método de remuestreo aplicado (si corresponde) |
| duration_s | duración del clip (3,0) |
| sample_rate | tasa de muestreo del artefacto destino (44100) |
| bit_depth | profundidad de bits (16) |
| channels | número de canales (1) |
| file_name | nombre del archivo WAV |
| sha256 | hash SHA-256 del WAV |
| file_size_bytes | tamaño del WAV en bytes |
| file_path_raw | ruta del WAV en raw/ |
| ingest_status | estado de ingesta (accepted/rejected/quarantine) |
| qc_status | estado de control de calidad (pass/fail) |
| operator_id | identificador del operador |
| tool_version | versión del logger (CMSC_DATA_LOGGER_V1) |
| tool_name | nombre del herramienta (cmsc-data-logger) |

---

## Proceso de doble revisión aplicable al piloto

1. **Revisor 1:** verifica metadata completa, integridad del WAV, clase asignada y calidad de audio. Asigna `ingest_status` y `qc_status`.
2. **Revisor 2:** verifica de forma independiente los mismos campos sin conocer el veredicto del Revisor 1.
3. **Coincidencia:** si ambos revisores coinciden en `accepted`, el clip queda aceptado.
4. **Discrepancia:** si discrepan, se clasifica como `disputed` y se resuelve por un tercero o se marca `disputed_resolved` tras acuerdo.
5. **Regla:** solo clips con `ingest_status=accepted` y `qc_status=pass` cuentan hacia los 80 clips objetivo.
6. **Alcance:** 100% de los 80 clips pasan por doble revisión.

---

## Número exacto de clips por sesión

**8 clips por sesión** (1 clip de cada una de las 8 clases vivas).
**10 sesiones** en total (80 clips).

---

## Criterio para declarar exitoso el piloto

- 80 clips aceptados (10 por cada una de las 8 clases vivas).
- 100% de los 80 clips revisados por doble revisión.
- 0 clips en estado `disputed` sin resolver.
- `qc_status=pass` en todos los 80 clips aceptados.
- `metadata.csv` con 80 filas y `acoustic_features_v2.csv` con 80 vectores de 44 dims.

---

## Criterio para pasar del piloto a expansión

- Piloto declarado exitoso según el criterio anterior.
- Pipeline S30 → Bridge Logger → POST /ingest → metadata.csv → acoustic_features_v2.csv → split → validate funcionando sin errores.
- Listo para ampliar de 80 a 150 clips por clase (G-DS-2).

---

## Riesgos operativos del piloto

- Disponibilidad del operador para completar las 10 sesiones.
- Condiciones ambientales no controladas en exteriores (viento, tráfico, voz humana de fondo).
- Saturación del micrófono S30 en fuentes sonoras intensas (motor, lluvia fuerte).
- Dificultad para capturar `silencio` sin ruido de fondo residual en interiores urbanos.
- Baja predictibilidad de presencia vocal de aves en la ventana de 3,0 s.
- Remuestreo no declarado si el dispositivo entrega 48 kHz en lugar de 44.100 Hz.
