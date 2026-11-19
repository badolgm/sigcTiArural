# CAPTURE_PILOT_V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: CAPTURE_PILOT_V1.md
> - Destino: docs/CAPTURE_PILOT_V1.md
> - Fusión (D-004.6 · D-005 · D-007): absorbido el contenido de gobernanza de `CAPTURE_PILOT_V1.md` (raíz, pre-merge) en la misión `CAPTURE_PILOT_MERGE_EXECUTION` (2026-11-18). El original se preserva sin pérdida en `docs/historical/CAPTURE_PILOT_V1_PRE_MERGE.md`.

## Plan operativo

**Objetivo:** capturar 80 clips reales del dataset acústico SIGCT-Rural v1.
**Clases vivas (8):** silencio, viento, lluvia, agua, insectos, ave, voz, motor.
**Clase excluida:** ruido_desconocido (bucket OOD, no se captura a demanda).

**Modelo oficial de sesiones (decisión de Bernardo, 2026-11-18):** **10 sesiones × 8 clips/sesión = 80 clips**. Nomenclatura oficial `PILOT_01..PILOT_10` y `PLACE_A/B/C`.

> **Nota de reconciliación del modelo de sesiones (2026-11-18).** El plan raíz pre-merge usaba un modelo distinto: 8 sesiones (`pilot_s01..pilot_s08`) × 10 clips, con sitios `site_a/site_b/site_c` y una asignación clase→sesión propia. Ese modelo queda **superado** por el modelo oficial de 10 sesiones × 8 clips; se conserva aquí como contexto histórico para no perder información. El resto del contenido de gobernanza del plan raíz — DG1–DG11, checklist completo G-DS, `window_schema`, `dataset_state`, `split_report.json`, `partition`, `license`, `source`, campos opcionales, criterio de expansión de 5 condiciones, tabla de transición 1→80→150, estimaciones temporales y riesgos con severidad — se absorbe en las secciones siguientes.

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
3. **POST /ingest:** envía el WAV y el JSON de metadata (42 columnas) por multipart/form-data.
4. **metadata.csv:** el logger valida AC-1..AC-10 y escribe la fila con `ingest_status` y `qc_status`.
5. **acoustic_features_v2.csv:** el logger regenera el vector de 44 dims del clip aceptado.
6. **split:** `node src/cli.js split` distribuye los clips por `(session_id, place_id)` en `train.csv`, `validation.csv`, `test.csv`; holdout `PLACE_C` reservado (`partition=holdout`).
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

### Campos absorbidos del plan raíz

**Obligatorias adicionales (sin estas, el clip queda rejected):**

| Campo | Descripción |
|-------|-------------|
| file | nombre del archivo WAV (`ac_YYYYMMDD_HHMMSS_NNN_hash.wav`) |
| partition | enum (train/validation/test; `holdout` = `PLACE_C` solo) |
| timestamp | ISO-8601 (hora UTC de captura) |
| license | string (`PROPIO`; obligatorio en el piloto) |
| source | string (`cmsc_logger`) |

**Herramienta (llenado automático, no humano):** `sha256`, `duration_s`, `sample_rate`, `channels`, `bit_depth`.

**Opcionales (no bloquean si ausentes):** `review_annotator_id`, `secondary_classes`, `contaminated`, `confidence_annotator`, `hour_local`, `weather_note`, `latitude`, `longitude`, `notes`.

---

## Proceso de doble revisión aplicable al piloto

1. **Revisor 1:** verifica metadata completa, integridad del WAV, clase asignada y calidad de audio. Asigna `ingest_status` y `qc_status`.
2. **Revisor 2:** verifica de forma independiente los mismos campos sin conocer el veredicto del Revisor 1.
3. **Coincidencia:** si ambos revisores coinciden en `accepted`, el clip queda aceptado.
4. **Discrepancia:** si discrepan, se clasifica como `disputed` y se resuelve por un tercero o se marca `disputed_resolved` tras acuerdo.
5. **Regla:** solo clips con `ingest_status=accepted` y `qc_status=pass` cuentan hacia los 80 clips objetivo.
6. **Alcance:** 100% de los 80 clips pasan por doble revisión.

### Campos de acuerdo (`agreement`) — absorbidos del plan raíz

1. **Primera anotación:** `agreement = single`, `review_annotator_id = operador_A`.
2. **Segunda anotación (operador B independiente):**
   - `agreement = double_reviewed_agree` si coincide.
   - `agreement = double_reviewed_disagree` si no coincide.
3. **Meta del piloto:** 100% de los clips deben tener `agreement = double_reviewed_agree`.
4. **Sin `double_reviewed_agree` en todas las filas → G-DS-6 permanece FAIL.**

Ejemplo `metadata.csv`:

```
sample_id, agreement, review_annotator_id
ac_20261109_01, double_reviewed_agree, operador_A
ac_20261109_02, double_reviewed_agree, operador_B
```

---

## Número exacto de clips por sesión

**8 clips por sesión** (1 clip de cada una de las 8 clases vivas).
**10 sesiones** en total (80 clips).

### Estimaciones temporales (absorbidas del plan raíz)

> Estimaciones heredadas del plan raíz pre-merge (modelo 8 sesiones × 10 clips); se conservan como referencia indicativa.

- Tiempo estimado por sesión: ~12 minutos (montaje + 12–20 tomas + previsualización + etiqueta + verificación).
- Total tiempo de campo: ~96 minutos.
- Total tiempo de etiquetado/QC: ~3 horas.

---

## Criterio para declarar exitoso el piloto

- 80 clips aceptados (10 por cada una de las 8 clases vivas).
- 100% de los 80 clips revisados por doble revisión.
- 0 clips en estado `disputed` sin resolver.
- `qc_status=pass` en todos los 80 clips aceptados.
- `metadata.csv` con 80 filas y `acoustic_features_v2.csv` con 80 vectores de 44 dims.

### Checklist completo G-DS (absorbido del plan raíz)

CHECKLIST PASSED (todos obligatorios):

- [ ] 80 clips capturados en `raw/<clase>/` con WAV PCM 16-bit mono 44,1 kHz 3,0 s.
- [ ] `metadata.csv`: 81 líneas (1 header + 80 filas) con 42 columnas llenas.
- [ ] Todas las filas: `license = PROPIO` ∧ `source = cmsc_logger`.
- [ ] Todas las filas: `agreement = double_reviewed_agree` (G-DS-6 PASS).
- [ ] `window_schema = window.v2` en todas las filas (G-DS-1 técnico OK).
- [ ] `acoustic_features_v2.csv`: 80 registros · 44 dims cada uno.
- [ ] `split_report.json`: `split_ejecutado = true`, 0 fugas, holdout `PLACE_C` reservado.
- [ ] `validate`: G-DS-3 PASS, G-DS-4 PASS, G-DS-5 PASS.
- [ ] `dataset_state` sube de `PREPARADO_VACIO` a `CAPTADO_INICIAL` (≥1 clip accepted).

SI TODO CHECKLIST PASSED → piloto exitoso.

---

## Criterio para pasar del piloto a expansión

- Piloto declarado exitoso según el criterio anterior.
- Pipeline S30 → Bridge Logger → POST /ingest → metadata.csv → acoustic_features_v2.csv → split → validate funcionando sin errores.
- Listo para ampliar de 80 a 150 clips por clase (G-DS-2).

### Condiciones necesarias (absorbidas del plan raíz)

Condiciones necesarias (todas):

- [ ] G-DS-2 gateway: ≥80 clips aceptados con QC pass.
- [ ] G-DS-6: 100% `agreement = double_reviewed_agree`.
- [ ] G-DS-3: `split_ejecutado = true` ∖ 0 fugas.
- [ ] G-DS-5: `license = PROPIO` ∧ `source = cmsc_logger` en 100%.
- [ ] G-DS-1 técnico: `window_schema` APROBADO (mids pendientes de autorización de misión).

Transición:

- Pilot → Expansión: cuando se cumplan las 5 condiciones.
- Acción: escalar el patrón de sesiones hasta alcanzar 150 clips/clase.
- Nuevo objetivo: 1.200 clips totales (150 × 8 clases), balance max/min ≤ 1,5.

SI MENOS DE 3 de 5 condiciones NO se cumplen → piloto concluido, requiere reforzamiento.

---

## Riesgos operativos del piloto

- Disponibilidad del operador para completar las 10 sesiones.
- Condiciones ambientales no controladas en exteriores (viento, tráfico, voz humana de fondo).
- Saturación del micrófono S30 en fuentes sonoras intensas (motor, lluvia fuerte).
- Dificultad para capturar `silencio` sin ruido de fondo residual en interiores urbanos.
- Baja predictibilidad de presencia vocal de aves en la ventana de 3,0 s.
- Remuestreo no declarado si el dispositivo entrega 48 kHz en lugar de 44.100 Hz.

### Matriz de riesgos de gobernanza DG1–DG11 (absorbida del plan raíz)

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| DG1: Estructura vacía se confunde con dataset existente | 🔴 | dataset_state declarado en 10 artefactos de control; 0 filas declaradas |
| DG2: Remuestreo no declarado → metadata falsa | 🔴 | OBS‑06: 2 columnas obligatorias + regla de honestidad |
| DG3: G‑DS‑6 incumple por falta de campo de acuerdo | 🔴 | OBS‑11: review_annotator_id + agreement; 100% doble revisión |
| DG4: Split con fuga → métrica sin significado | 🔴 | Group split + holdout reservado + SG‑1..SG‑5 |
| DG5: Dimensión S81 decidida tarde | 🔴 | D‑1 cerrada 2026‑10‑05 |
| DG6: Sobreconfianza: "dataset listo" | 🔴 | 0 muestras repetido en cada artefacto; §6 |
| DG7: Licencias públicas mal documentadas | 🔴 | G‑DS‑5 lista cerrada; ND prohibido |
| DG8: Sesgo a un solo sitio/device | 🟠 | 3 sitios desde pilot; device_id + place_id obligatorios |
| DG9: Captura oportunista de lluvia simulada | 🔴 | Prohibido simular; reprogramar |
| DG10: Coste 2 rondas × 1.350 muestras | 🟠 | Pilot 100% doble revisión antes escalar |
| DG11: Deriva documentos dataset | 🟡 | Este doc es canónico; D‑4 cerrada 2026‑10‑06 |

---

## Transición pilot → expansión (absorbida del plan raíz)

| De | A | Requerimiento |
|----|---|----------------|
| 1 clip | 80 clips | Capturar 79 clips adicionales Tramo C, validar QC AC‑1..AC‑10 |
| 80 clips | 150 clips/clase | Capturar 70 clips adicionales por clase; balancear max/min ≤ 1.5; doble revisión 100% |

---

## Nota final

Este documento es el plan operativo de captura pilot V1. 80 clips reales. Sin nuevas auditorías, sin investigaciones nuevas, sin nuevos hallazgos. Formato: plan operativo, pasos ejecutables, sin teoría, sin documentación histórica, sin nuevos hallazgos.
