# DATASET_C0_EXECUTION_PLAN_v1

**Fecha:** 2026-10-11
**Alcance:** SOLO PLAN OPERATIVO DE EJECUCION C0 (sin codigo, sin commits, sin push)
**Base:** docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md, estado dataset v1 (CAPTADO_INICIAL)

## 1. SITUACION ACTUAL DEL DATASET C0
- Estado: CAPTADO_INICIAL (1 muestra real registrada)
- Ruta: data/datasets/sigct_rural_acoustic/v1/
- metadata.csv: 2 lineas (cabecera + 1 fila)
- features/acoustic_features_v2.csv: 2 lineas (cabecera + 1 vector, 44 dims)
- labels.csv: 10 lineas (cabecera + 9 clases)
- schema.json: 1.3.0
- Fuente: cmsc_logger + PROPIO
- window_schema: acoustic.feat.window.v2 (44 dims) — D-1 CERRADA


## 2. NUMERO ACTUAL DE MUESTRAS POR CLASE (C0)
| class_id | class_name | dir_name | is_ood_bucket | ACTUAL (qc_status=pass) |
|---|---|---|---|---|
| silencio | SILENCIO | silencio | false | 1 |
| viento | VIENTO | viento | false | 0 |
| lluvia | LLUVIA | lluvia | false | 0 |
| agua | AGUA | agua | false | 0 |
| insectos | INSECTOS | insectos | false | 0 |
| ave | AVE | ave | false | 0 |
| voz | VOZ | voz | false | 0 |
| motor | MOTOR | motor | false | 0 |
| ruido_desconocido | RUIDO DESCONOCIDO | desconocido | true | 0 |

**Total aceptadas (C0): 1.** Objetivo NO definido para ruido_desconocido (bucket OOD, no se captura a demanda).


## 3. NUMERO OBJETIVO POR CLASE
G-DS-2: >= 150 clips/clase propios, con qc_status='pass', para **cada una de las 8 clases vivas**. Balance: max/min <= 1.5.

| class_id | objetivo |
|---|---|
| silencio | 150 |
| viento | 150 |
| lluvia | 150 |
| agua | 150 |
| insectos | 150 |
| ave | 150 |
| voz | 150 |
| motor | 150 |
| ruido_desconocido | sin objetivo de captura (se llena con rechazados/ambiguos) |

**Faltan ~1199 clips aceptados** (1 ya existe).


## 4. QUE CLASES CAPTURAR PRIMERO
1. **silencio** (ya 1) — consolidar procedimiento (lugar/franja) sin duplicar.
2. **voz** — fácil controlado, baja ambigüedad.
3. **motor** — estable, facilita validación.
4. **viento/agua/lluvia** — oportunistas según clima.
5. **insectos/ave** — requieren horarios/ubicación (notas).
6. **ruido_desconocido** — NUNCA forzar; solo si aparece en QC/rechazos.

**Prioridad inmediata:** voz/motor (progreso medible bajo control).


## 5. PLAN OPERATIVO PROXIMOS 3 DIAS
- **Día 1:** Verificar S30+Bridge operativos. Capturar 10-15 clips (voz/motor). Validar ingestWav + metadata + features.
- **Día 2:** Capturar 15-25 clips priorizando clases controladas. Revisión QC (AC-1..10).
- **Día 3:** Capturar 15-25 clips. Consolidar conteos, revisar near-dup (AC-9) y generar evidencias.

**Meta 3 días:** >= 40 clips aceptados (progresivo).


## 6. PLAN OPERATIVO SPRINT 1 (1-2 SEMANAS)
- **Semana 1:** Alcanzar ~400-600 aceptados distribuidos (evitar sobre-cargar 1 clase). Forzar diversidad place_id/session_id.
- **Semana 2:** Completar hacia 1200 aceptados, balance max/min<=1.5. Ejecutar calibración near-dup (D-2) con 200 reales (FPR<=1%, detección>=95%).
- **Objetivo Sprint 1:** >= 1000 aceptados, 6-8 clases >100.


## 7. CIERRE DE GATES G-DS-1..6
| Gate | Estado actual | Acción para cerrar | Evidencia requerida |
|---|---|---|---|
| G-DS-1 | PENDIENTE (D-1 cerrada; (c) resuelto) | Verificar schema 1.3.0 + labels.csv (9 clases) + taxonomy_binding. | schema.json + labels.csv + manifiesto taxonomía |
| G-DS-2 | NO CUMPLIDO (1/150) | Alcanzar >=150/clase viva (8 clases), qc_status=pass, source=cmsc_logger, license=PROPIO, balance<=1.5. | metadata.csv + counts.per_class |
| G-DS-3 | NO CUMPLIDO | Split reproducible (SG-1..SG-5), holdout place_id ausente, calibración near-dup 200 reales + cláusula si pendiente. | split_lists/* + split_report.json + holdout |
| G-DS-4 | PARCIAL | Completar filas en metadata + generar CHECKSUMS.sha256 (1 por WAV) = count. 5 YAML parseables. | CHECKSUMS.sha256 + 20 artefactos |
| G-DS-5 | CUMPLIBLE | v1 100% propio. Verificar lista cerrada, ND inexistente. | license/distinct + raw_source_manifest |
| G-DS-6 | NO CUMPLIDO | Requiere acuerdo inter-anotador (agreement + review_annotator_id). Si ronda 1 simple, agreement vacío => NO cierra (según gobernanza). Definir protocolo de doble revisión antes de cerrar. | agreement/review_annotator_id + protocolo |


## 8. EVIDENCIAS A PRODUCIR
- metadata.csv (creciente, cabecera 42 cols)
- features/acoustic_features_v2.csv (vector por clip)
- CHECKSUMS.sha256 (por WAV)
- manifests/*.yaml (raw/curation/baseline/split/taxonomy)
- split_lists/*.csv + split_report.json (cuando >=N para split)
- dataset_card.md actualizado con conteos
- Evidencias Tramo B/C ya existentes (docs/*bridge/tramo C)


## 9. VERIFICACIONES DIARIAS
- Conteo aceptados/clase (qc_status=pass)
- Balance max/min
- G-DS-1..6 estado
- CHECKSUMS coherente (WAV vs líneas)
- features 44 dims por fila
- Bridge/S30 operativos
- C0 productivo intacto


## 10. MÉTRICAS A USAR
| Métrica | Umbral/meta |
|---|---|
| Aceptados totales | >=150/clase viva (objetivo G-DS-2) |
| Balance | max/min <= 1.5 |
| QC verde | 100% aceptados con qc_status=pass |
| Place_id diversidad | >=3 por clase (recomendado) |
| Near-dup FPR (calib 200 reales) | <=1% |
| Near-dup TPR (re-tomas) | >=95% |

## ENTREGABLE FINAL
- A. Estado dataset: CAPTADO_INICIAL (1 aceptado)
- B. Roadmap captura: voz/motor -> oportunistas -> bioacústicos
- C. Roadmap validación: AC-1..10 + near-dup
- D. Roadmap cierre gates: G-DS-2 primero (volumen), luego G-DS-3 (split+near-dup calib), G-DS-6 (acuerdo) |
- E. Cuello botella único: G-DS-2 (alcanzar 150/clase) — bloquea G-DS-3 completo y avance a S81.

**SIN IMPLEMENTAR CÓDIGO. SIN CREAR MÁS DOCUMENTOS. SIN COMMITS. SOLO PLAN OPERATIVO.**
