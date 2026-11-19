> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-18T21:54:36-05:00
> - Origen: CAPTURE_PILOT_V1.md (raíz)
> - Destino: docs/historical/CAPTURE_PILOT_V1_PRE_MERGE.md
> - Motivo: original **pre-merge** preservado por la misión `CAPTURE_PILOT_MERGE_EXECUTION` (2026-11-18). Su contenido de gobernanza fue absorbido en `docs/CAPTURE_PILOT_V1.md` (documento canónico). Se preserva sin pérdida (NADA DESAPARECE). No se elimina.

---

CAPTURE_PILOT_V1
================

1. Session IDs propuestos

   pilot_s01 ... pilot_s08
   Place IDs: site_a, site_b, site_c (3 ubicaciones distintas)

2. Distribución exacta por clase

   Total: 80 clips reales (10 clips × 8 clases)

   - silencio: 10 clips (pilot_s01 + pilot_s02, site_a)
   - viento: 10 clips (pilot_s01 + pilot_s02, site_a)
   - lluvia: 10 clips (pilot_s03 + pilot_s04, site_b)
   - agua: 10 clips (pilot_s03 + pilot_s04, site_b)
   - insectos: 10 clips (pilot_s05 + pilot_s06, site_c)
   - ave: 10 clips (pilot_s07, site_a)
   - voz: 10 clips (pilot_s07, site_a)
   - motor: 10 clips (pilot_s08, site_b)

3. Flujo completo S30 → Validación

   S30 (micrófono REAL-LOCAL)
     ↓
   Bridge Logger (127.0.0.1:8766, Node ESM)
     ↓
   POST /ingest (multipart: WAV + JSON 42 columnas)
     ↓
   metadata.csv (fila atomica, 42 columnas llenas)
     ↓
   acoustic_features_v2.csv (44 dimensiones mean+std, regenerable)
     ↓
   split (group por session_id + place_id + holdout site_c)
     ↓
   validate (G-DS-1..G-DS-6 evaluación)

4. Metadata mínima obligatoria por captura

   Obligatorias (sin estas, clip rejected):
   - sample_id: string (UUID o ac_YYYYMMDD_HHMMSS_NNN_hash)
   - file: string (ac_YYYYMMDD_HHMMSS_NNN_hash.wav)
   - partition: enum (train/validation/test; holdout=site_c solo)
   - class_id: enum (silencio/viento/lluvia/agua/insectos/ave/motor)
   - session_id: string (pilot_s01 .. pilot_s08)
   - place_id: enum (site_a/site_b/site_c)
   - timestamp: ISO-8601 (hora UTC captura)
   - capture_source_rate: number (44100 declarante)
   - resample_method: string (none si nativo 44.1k)
   - license: string (PROPIO; obligatorio en pilot)
   - source: string (cmsc_logger)

   Herramienta (llenado auto, no humano):
   - sha256, duration_s, sample_rate, channels, bit_depth

   Opcionales (no bloquean si ausentes):
   - review_annotator_id, secondary_classes, contaminated,
     confidence_annotator, hour_local, weather_note, latitude,
     longitude, notes

5. Proceso de doble revisión aplicable al piloto

   Flujo double_review:
   1. Primera anotación: agreement = single, review_annotator_id = operador_A
   2. Segunda anotación (operador B independiente):
      - agreement = double_reviewed_agree si coincide
      - agreement = double_reviewed_disagree si no coincide
   3. Meta pilot: 100% clips deben tener agreement = double_reviewed_agree
   4. Sin double_reviewed_agree en todas las filas → G-DS-6 permanece FAIL

   Ejemplo metadata.csv:
   sample_id, agreement, review_annotator_id
   ac_20261109_01, double_reviewed_agree, operador_A
   ac_20261109_02, double_reviewed_agree, operador_B

6. Número exacto de clips por sesión

   - 10 clips por sesión
   - 8 sesiones total (pilot_s01 .. pilot_s08)
   - Tiempo estimado por sesión: ~12 minutos (montaje + 12-20 tomas + previsualización + etiqueta + verificación)
   - Total tiempo campo: ~96 minutos
   - Total tiempo etiquetado/QC: ~3 horas

7. Criterio para declarar exitoso el piloto

   CHECKLIST PASSED (todos obligatorios):

   [ ] 80 clips capturados en raw/<clase>/ con WAV PCM 16-bit mono 44.1kHz 3.0 s
   [ ] metadata.csv: 81 líneas (1 header + 80 filas) con 42 columnas preenchidas
   [ ] Todas las filas: license = PROPIO ∧ source = cmsc_logger
   [ ] Todas las filas: agreement = double_reviewed_agree (G-DS-6 PASS)
   [ ] window_schema = window.v2 en todas las filas (G-DS-1 técnico OK)
   [ ] acoustic_features_v2.csv: 80 registros · 44 dims cada uno
   [ ] split_report.json: split_ejecutado = true, 0 fugas, holdout site_c reservado
   [ ] validate: G-DS-3 PASS, G-DS-4 PASS, G-DS-5 PASS
   [ ] dataset_state sube de PREPARADO_VACIO a CAPTADO_INICIAL (≥1 clip accepted)

   SI TODO CHECKLIST PASSED → piloto exitoso

8. Criterio para pasar del piloto a expansión

   Condiciones necesarias (todas):

   [ ] G-DS-2 gateway: ≥80 clips aceptados con QC pass
   [ ] G-DS-6: 100% agreement = double_reviewed_agree
   [ ] G-DS-3: split_ejecutado = true ∖ 0 fugas
   [ ] G-DS-5: license = PROPIO ∧ source = cmsc_logger en 100%
   [ ] G-DS-1 técnico: window_schema APROBADO (mids pendientes autorización misión)

   Transición:
   - Pilot → Expansión: cuando cumplan las 5 condiciones
   - Acción: duplicar patrón 8 sesiones → 48 sesiones para 150 clips/clase
   - Nuevo objetivo: 1.200 clips totales (150 × 8 clases), balance max/min ≤ 1.5

   SI MENOS DE 3 de 5 condiciones NO se cumplen → piloto concluido, requiere reforzamiento

9. Riesgos operativos del piloto

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

10. Transición pilot → expansión

    | De | A | Requerimiento |
    |----|---|----------------|
    | 1 clip | 80 clips | Capturar 79 clips adicionales Tramo C, validar QC AC‑1..AC‑10 |
    | 80 clips | 150 clips/clase | Capturar 70 clips adicionales por clase; balancear max/min ≤ 1.5; doble revisión 100% |

Nota final: Este documento es el plan operativo de captura pilot V1. 80 clips reales. Sin nuevas auditorías, sin investigaciones nuevas, sin nuevos hallazgos. Formato: plan operativo, pasos ejecutables, sin teoría, sin documentación histórica, sin nuevos hallazgos.