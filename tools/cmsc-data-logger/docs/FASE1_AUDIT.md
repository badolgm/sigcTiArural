# CMSC_DATA_LOGGER_V1 — Auditoría FASE 1 (pre-implementación)

> Ejecutado: 2026-10-04 · HEAD `83b6089` · **cero escrituras en el dataset durante la auditoría**

## Resultado

| Area | Estado | Nota |
|---|---|---|
| Estructura de directorios | ✅ COHERENTE | 46 dirs · 20 files · 9 clases en `raw/train/validation/test` |
| `metadata/schema.json` | ⚠️ **2 hallazgos** | falta `operator_id`; `window_schema_status` pendiente |
| `metadata/metadata.csv` | ✅ COHERENTE | 41 columnas idénticas al schema · 0 filas |
| `metadata/labels.csv` | ✅ COHERENTE | 9 clases + binding `class_id`↔`dir_name` |
| 5 manifiestos YAML | ✅ PARSEAN | `dataset_state` presente en los 5 |
| `split_lists/` | ✅ COHERENTE | reporte `NO_EJECUTADO` · leakage `null` = NO MEDIDO |
| `features/` | ⚠️ **1 hallazgo** | declara `.parquet` pero no hay escritor posible sin dependencias |
| `CHECKSUMS.sha256` | ✅ Correcto vacío | placeholder declarado, 0 líneas de datos |

## Hallazgos que bloquean la implementación

### H-1 · `operator_id` no existe en el esquema — **BLOQUEANTE**
La misión exige registrar `operator_id` en FASE 3. El esquema v1.0.0 tiene `annotator_id` (quien
etiqueta) y `device_id` (qué equipo), pero **no tiene quién opera la captura**. Son tres roles
distintos: un mismo `annotator_id` puede no ser quien sostuvo el micrófono.

**Resolución:** añadir `operator_id` como `OBLIGATORIA` → `schema.json` **1.1.0** (con changelog).

### H-2 · `window_schema_status = PROPUESTO_PENDIENTE_APROBACION` — **BLOQUEANTE**
D-1 estaba abierto. La misión lo **aprueba**: `FEATURE_SCHEMA_V1` = 44 dims = `mean(feature)` +
`std(feature)` sobre las 22 features oficiales.

**Resolución:** `window_schema_status = APROBADO_2026_10_04`, `window_schema_dims = 44`, y
`metadata.csv` deja de exigir una decisión pendiente. G-DS-1 pierde su último bloqueante.

### H-3 · `features` declara `.parquet` sin escritor posible — **NO BLOQUEANTE**
`curation_manifest` y `schema.json` apuntan a `features/acoustic_features_v1.parquet`. Escribir
Parquet sin dependencias exige un escritor completo; el proyecto no tiene `pyarrow` ni runtime
Java con Parquet, y la misión prohíbe descargar/añadir stacks pesados.

**Resolución:** formato **CSV** (`features/acoustic_features_v1.csv`), 44 columnas + `sample_id` +
3 de contexto. Es texto plano: auditable, diffeable, portable, cero dependencias. El cambio queda
**declarado** en el esquema y en el manifiesto (no silencioso), con la nota de que Parquet era la
intención de diseño y queda como `v2` si el volumen lo justifica.

## Verificaciones mecánicas ejecutadas

- 5/5 manifiestos YAML parsean (`yaml.safe_load`) y declaran `dataset_state: PREPARADO_VACIO`.
- `schema.json`: 41 columnas = 29 obligatorias (24 + 5) + 9 opcionales + 3 derivadas; suma 41.
- Cabecera de `metadata.csv` **idéntica** a los nombres del schema (41/41).
- `labels.csv`: 9 filas, una por `class_id`, cada una con `dir_name`.
- `split_report.json`: `state=NO_EJECUTADO`, `verdict=PENDING`, `counts.total=0`.
- **0 WAV** en `raw/`, `train/`, `validation/`, `test/`.
- `git check-ignore` confirma `/data/` ignorado por `.gitignore:68`.

## Veredicto

**El dataset es apto para ingestión** tras aplicar H-1, H-2 y H-3. Sin esos tres cambios el logger
tendría que inventar un campo (violando la honestidad de estado) o mentir sobre el esquema aplicado.