# ROADMAP TELEMÉTRICO V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T21:44:20-05:00
> - Origen: misión `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/telemetry/TELEMETRY_DATASET_ROADMAP_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: define fases, gates, integración y los 25 riesgos a 1.000.000.000 de lecturas. No crea streams, no captura, no entrena.

**Misión:** `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1`
**Naturaleza:** documentación oficial de **gobernanza de roadmap telemétrico**. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Fuentes:** `TELEMETRY_GOVERNANCE_V1.md` · `TELEMETRY_TAXONOMY_V1.md` · `TELEMETRY_LABELING_POLICY_V1.md` · `TELEMETRY_OOD_POLICY_V1.md` · `docs/governance/SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md` · Masterplan §7.
**No hace:** no crea directorios de telemetría, no emite lecturas, no configura sensores, no entrena, no hace commits.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Fuente única de los 25 riesgos:** este documento §9. Los otros cuatro documentos remiten aquí.
> **Invariante:** `NO_DATA` ≠ 0 · `NO_DATA` ≠ NULL · `OBSERVATION_ID` intacto.

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Lecturas telemétricas emitidas | **0** |
| Streams creados | **0** |
| Sensores calibrados | **0** |
| Fases cerradas | **0 / 8** |
| Escala objetivo | **1.000.000.000 lecturas** (objetivo de diseño, **no medido**) |
| Modelos / IA | **Ninguno** |

> Un roadmap no es un stream. Aquí se fija el camino; ejecutar cada fase requiere misión explícita.

---

# 1. Integración con la plataforma (sin nueva raíz)

## 1.1 Modelo aditivo

```
  OBSERVATION_ID  (raíz única, inmutable — Platform V1)
        │
        ├── audio/       ──► SIGCT_RURAL_ACOUSTIC v1  (INTACTO)
        ├── image/       ──► SIGCT_RURAL_VISUAL v1    (DISENO)
        ├── video/       ──► contenedores + frame_ids[]
        └── telemetry/   ──► telemetry_  (asset — Platform §3.5)
                                ├── metric_id      (24 canónicas)
                                ├── quality_flag   (ok · suspect · NO_DATA)
                                ├── sensor_id · calibration_id
                                ├── stream_id → win_  (VISTAS, no raíces)
                                └── event_id → crosswalk multimodal
```

## 1.2 Barreras de no mezcla

| Barrera | Regla |
|---|---|
| Física | Todo bajo `obs_.../telemetry/`; ninguna raíz nueva. |
| De esquema | `telemetry_v1_taxonomy` ≠ `acoustic_*` ≠ `visual_v1_taxonomy`. |
| De calidad | `NO_DATA` jamás se convierte en `0` (TG-2). |
| De honestidad | T2 `REF`, T0/T1 `REAL-LOCAL`, simulado `SIM`: nunca en el mismo split. |
| De OOD | `desconocido_telemetria` ≠ `desconocido` ≠ `desconocido_visual`. |
| De reporting | `metric_family` (6) es agregado; `telemetry_domain_id` (8) es el eje original. |

---

# 2. Estructura física prevista (NO creada)

```
data/
├── datasets/
│   ├── sigct_rural_acoustic/v1/        ← INTACTO
│   └── (NO creado) telemetría           ← la telemetría NO necesita dataset separado
│
└── observations/v1/obs_<session>_<seq4>/
    ├── audio/
    ├── image/
    ├── video/
    ├── telemetry/                       ← Platform §4.1, sin cambios
    │   ├── telemetry_20261120_temp_000.json
    │   ├── telemetry_20261120_hum_000.json
    │   └── telemetry_manifest.json     ← sha256 · métricas · flags
    ├── metadata/
    │   ├── observation.json
    │   ├── observation_package.json    ← descriptores telemetry_
    │   └── delivery_manifest.yaml      ← PENDING_ACCEPTANCE
    └── reports/                         ← ACP/KH futuros; captura no escribe
```

> La telemetría **no propone un dataset nuevo**: vive como asset dentro de la observación. Es la forma más fuerte de no romper la plataforma.

---

# 3. Fases (definidas, NO ejecutadas)

> Se numeran **F0..F7** para no confundirlas con los `source_tier` `T0..T3`.

| Fase | Nombre | Objetivo | Gate de salida |
|---|---|---|---|
| **F0** | Gobernanza | 5 documentos visibles con D-004.6 | G-TD-1 |
| **F1** | Contrato de lectura | 24 métricas + `NO_DATA` gobernado en `ObservationPackage` | G-TD-2 |
| **F2** | T0 manual | Temperatura/humedad manuales en 10 dominios, sin hardware T3 | G-TD-3 |
| **F3** | Calibración | `cal_` en T3; `N/A` explícito en T0 | G-TD-4 |
| **F4** | Streams y ventanas | `stream_`/`win_` como vistas, sin nueva raíz | G-TD-5 |
| **F5** | OOD gobernado | `lectura_desconocida` por misión, sin cupos | G-TD-6 |
| **F6** | Escala piloto | 1.000.000 lecturas con integridad verificada | G-TD-7 |
| **F7** | Escala milmillonaria | 1.000.000.000 con 25 riesgos mitigados | G-TD-8 |

## 3.1 Reglas de fase

| ID | Regla |
|---|---|
| PH-1 | Ninguna fase arranca sin misión explícita (TG-12). |
| PH-2 | Un gate no se cierra por estimación: requiere evidencia verificable. |
| PH-3 | Gate fallido ⇒ retroceso con nota; **nada se borra**. |
| PH-4 | Cada fase entrega por `delivery_manifest`; nunca escribe en `datasets/`. |
| PH-5 | F7 **no implica IA**: escalar lecturas no es entrenar. |
| PH-6 | El orden es aditivo; fases futuras no reescriben las anteriores. |

---

# 4. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado hoy |
|---|---|---|
| **G-TD-1** | 5 documentos telemétricos visibles con D-004.6 | `DISENO` |
| **G-TD-2** | 24 métricas y `NO_DATA` ≠ 0 ≠ NULL en `ObservationPackage` | `DISENO` |
| **G-TD-3** | T0 ejecutable en 10 dominios sin T3 | `DISENO` |
| **G-TD-4** | Calibración `N/A` en T0 y vigente en T3 | `DISENO` |
| **G-TD-5** | Streams/ventanas sin nueva raíz y sin `AS_ZERO` | `DISENO` |
| **G-TD-6** | Sentinela OOD aprobada, nunca a demanda | `DISENO` |
| **G-TD-7** | 1.000.000 lecturas, 100 % integridad verificada | `DISENO` |
| **G-TD-8** | 1.000.000.000 lecturas, 25 riesgos mitigados | `DISENO` |

> La existencia de este roadmap **no cierra ningún gate**.

---

# 5. Compatibilidad con Observation Platform V1 y Multimodal V1

| Requisito | Cumplimiento |
|---|---|
| `OBSERVATION_ID` inmutable (OB-1..5) | Todo cuelga de la misma raíz; F4 agrupa por `observation_id`. |
| 7 pasos de captura (Platform §3) | Sin cambios; se especializa el paso 5 (§3.5). |
| `telemetry_` por métrica (Platform §3.5) | Contrato idéntico: ID, `metric_id`, `quality_flag`, unidad, ventana, instrumento. |
| `NO_DATA` ≠ 0 (P5-2, TEL-3) | Reforzado como estado gobernado (padre §4). |
| `ObservationPackage` inmutable (§3.6) | Descriptores `telemetry_`, nunca bytes ni inferencia. |
| Handoff por `delivery_manifest` (P7) | Cada fase entrega por manifiesto; `PENDING_ACCEPTANCE`. |
| Dataset acústico intacto (CO-1..6) | Sin escritura en `datasets/`. |
| ACP/KH por `observation_id` | Sin cambio: `docsByObservation` derivado, sin doble escritura. |
| 7 estados canónicos | No se amplían; F0..F7 son estados de **proceso**. |
| `EVENT_ID` como crosswalk (EV-1..3) | Correlación por `event_id`, no por timestamps (TEL-11). |

---

# 6. Validación de los 10 dominios (obligatoria)

> Todos ejecutables con **T0** (laptop + medidor manual). Ningún gate depende de T3 (TEL-12).

| Dominio | Métricas T0 | Métricas T3 (`NO_DATA` en T0) | Veredicto |
|---|---|---|---|
| **Invernaderos** | `temperatura_ambiente` · `humedad_relativa` · `ph` manual · `luminosidad` | `co2` · `radiacion_uv` | ✅ T0 cubre |
| **Agricultura** | `temperatura_ambiente` · `humedad_relativa` · `ph` · `conductividad` | `humedad_suelo` · `temperatura_suelo` | ✅ T0 cubre |
| **Ganadería** | `temperatura_ambiente` · `humedad_relativa` · `nivel_agua` | — | ✅ T0 cubre |
| **Porcicultura** | `temperatura_ambiente` · `humedad_relativa` | amonio (fuera de las 24 ⇒ `NO_DATA`/propuesta T3) | ✅ honesto |
| **Avicultura** | `temperatura_ambiente` · `humedad_relativa` · `luminosidad` | — | ✅ T0 cubre |
| **Apicultura** | `actividad_vuelo` (visual T0) · `temperatura_ambiente` | `peso_colmena` (aditivo) | ✅ T0 cubre |
| **Acuicultura** | `temperatura_agua` · `ph` · `nivel_agua` (foto del medidor) | `oxigeno_disuelto` · `turbidez` | ✅ T0 cubre |
| **Forestal** | `temperatura_ambiente` · `humedad_relativa` · `lluvia_mm` (T2 `REF`) | `posicion` T1 · clima T2 `REF` | ✅ con `REF` etiquetado |
| **Entornos rurales** | `temperatura_ambiente` · `humedad_relativa` · `lluvia_mm` | `viento_velocidad` · `presion_atmosferica` | ✅ T0/T2 cubren |
| **Entornos urbanos** | `temperatura_ambiente` · `ruido observado` (audio) | `posicion` **redactada** (POS-2) | ✅ con privacidad |

> **Regla DOMT-1:** si una métrica solo existe en T3, se declara `NO_DATA` con `instrument_unavailable`. Nunca se inventa `0` (TG-2). Ninguno de los 10 dominios queda descubierto.

---

# 7. Graduación de escala y honestidad

| Hito | Lecturas | Estado honesto |
|---|---:|---|
| Hoy | 0 | **Medido** |
| F2 | ~10.000 | **Planificado** |
| F6 | 1.000.000 | **Planificado** |
| F7 | 1.000.000.000 | **Objetivo de diseño, NO medido** |

> No se afirma almacenamiento, costo ni caudal como dato real. Toda estimación se marca **`ESTIMADO`** y se recalcula con datos de F6 antes de F7.

---

# 8. Criterios de éxito

| # | Requisito | Sección | Estado |
|---|---|---|---|
| 1 | Integración sin nueva raíz | §1 · §5 | ✅ |
| 2 | Estructura física sin romper la plataforma | §2 | ✅ |
| 3 | Fases y gates verificables | §3 · §4 | ✅ |
| 4 | 10 dominios validados en T0 | §6 | ✅ |
| 5 | Consumo ACP/KH por `observation_id` | §5 | ✅ |
| 6 | **25 riesgos a 1.000.000.000 lecturas** | §9 | ✅ |
| 7 | Sin streams, sensores, lecturas ni IA materializados | §0 | ✅ |
| 8 | `OBSERVATION_ID` intacto | §1 · §5 | ✅ |

---

# 9. Los 25 mayores riesgos de escalar a 1.000.000.000 de lecturas

> **Única fuente de verdad.** Severidad: 🔴 bloqueante · 🟡 alto. Cada riesgo tiene umbral y mitigación. Ninguno se resuelve con IA.

| # | Riesgo | Sev. | Umbral | Mitigación |
|---|---|---|---|---|
| **R-01** | **Relojes y zonas horarias inconsistentes** entre sensores T1/T3. | 🔴 | 1 lectura sin `timezone` | `captured_at` + `timezone` + `window_s` obligatorios (TEL-4); `CLOCK_SUSPECT`; sin normalización silenciosa. |
| **R-02** | **`NO_DATA` colapsado a `0`** en agregaciones a escala. | 🔴 | 1 ventana con `AS_ZERO` | WIN-1/2; exclusión + `no_data_count`; `BLOCKED` si aparece `0` con `NO_DATA`. |
| **R-03** | **`null` o filas ausentes** como ausencia no gobernada. | 🔴 | 1 `value=null` | Padre §4.1/4.2; `value_state=NO_DATA` + `no_data_reason`; fila siempre presente. |
| **R-04** | **Deriva de calibración**: miles de `cal_` vencidos aún `ok`. | 🔴 | 1 lectura T3 con `valid_until` vencido en `ok` | CAL-2 + `CAL_EXPIRED`; `suspect` automático; historial `supersedes`. |
| **R-05** | **Unidades heterogéneas** sin factor de conversión declarado. | 🔴 | 1 `unit_original` sin `conversion_factor` | UNI-1/2; SI canónico + original conservado; `UNKNOWN_UNIT` ⇒ OOD gobernado. |
| **R-06** | **`metric_id` inventado** por operadores o integraciones. | 🔴 | 1 `metric_id` fuera de las 24 | AVT-1; enum cerrado; `BLOCKED`; extensión solo por bump (EXT-1). |
| **R-07** | **Deriva de taxonomía**: alias no publicados entre versiones. | 🔴 | 2 `taxonomy_version` activas sin crosswalk | MET-1 / EXT-2/4; `alias_of` + crosswalk en el mismo cambio. |
| **R-08** | **Reenvíos idempotentes** duplicando lecturas. | 🟡 | 2 IDs con misma huella y timestamp | `DUPLICATE_CANDIDATE` (AN-4); marcar, **no fusionar**; curación gobernada. |
| **R-09** | **Explosión de cardinalidad** de `stream_`/`win_`. | 🔴 | 1 stream sin `observation_ids[]` | STR-1/WIN-1; vistas derivadas, nunca raíces; lapseado controlado. |
| **R-10** | **Llegada fuera de orden** de lecturas. | 🟡 | 1 `captured_at` anterior al vecino | `CLOCK_SUSPECT`; orden por timestamp declarado, nunca por orden de llegada. |
| **R-11** | **Ventanas solapadas o con huecos** mal declarados. | 🔴 | `end_at − start_at` ≠ `window_s` | §3.1 del policy; consistencia obligatoria; `STREAM_GAP` conservado. |
| **R-12** | **Correlación espuria** por proximidad de timestamps. | 🔴 | 1 cruce multimodal sin `event_id` | TEL-11 / OBT-5 / AL-3: solo `event_id` correlaciona. |
| **R-13** | **REF (T2) mezclado con verdad de campo**. | 🔴 | 1 fila T2 en evaluación propia | TEL-7 / TG-10; `state=REF`; `clima-externo` nunca entra en splits propios. |
| **R-14** | **`SIM` mezclado con `REAL`** en el mismo split. | 🔴 | 1 fila `SIM` en split REAL | TEL-8; separación física de estados; 7 estados sin ampliación. |
| **R-15** | **Deriva física del sensor** no detectada. | 🔴 | Desplazamiento sostenido sin `CAL_` | `RATE_SPIKE` + recalibración `supersedes`; mínimo honesto por stream. |
| **R-16** | **Precisión inflada** (decimales ficticios). | 🟡 | 1 valor con más decimales que `precision_declarada` | TEL-11 / UNI-3; `PRECISION_EXCEEDED` ⇒ `suspect`. |
| **R-17** | **Privacidad de `posicion`** (lat/lon) filtrada. | 🔴 | 1 paquete ACP con coordenadas exactas | POS-1..4; redacción a `place_id`; `PARTIAL` si aplica. |
| **R-18** | **OOD emitido a demanda** para llenar cupos. | 🔴 | 1 captura con `lectura_desconocida` como objetivo | TG-9 / TOD-A7; veredicto humano, sin cupos. |
| **R-19** | **`NO_DATA` interpolado** por relleno estadístico. | 🔴 | 1 valor imputado | ND-4 / TLP-7; prohibido; `BLOCKED`. |
| **R-20** | **Anomalías descartadas silenciosamente**. | 🔴 | 1 `suspect` eliminado | AN-1 / TEL-2; conservar con `anomaly_code`. |
| **R-21** | **Costo de almacenamiento y reprocesamiento** a 1e9. | 🟡 | Estimación presentada como dato real | Marcar `ESTIMADO`; recalcular en F6; lotes y agregados declarados. |
| **R-22** | **Rehidratación imposible** por renombrar campos. | 🔴 | 1 campo renombrado sin alias | TG-8 / EXT-2 / MIG-1; IDs opacos, `supersedes`, alias. |
| **R-23** | **Calibración falsificada** (`cal_` inventado en T0). | 🔴 | 1 `cal_` con `reference=unknown` en `ok` | CAL-1/5; `N/A` explícito en T0; `DISENO` si patrón desconocido. |
| **R-24** | **κ fabricado** para aparentar acuerdo. | 🔴 | κ numérico con 0 pares | KAPT-1..5; `PENDING`; `BLOCKED` sin `n_pairs`. |
| **R-25** | **Escalar interpretado como autorización de IA/modelos**. | 🔴 | 1 `model_id`/`prediction_id` en lecturas | TG-2 / PH-5 / AVT-10; escalar datos ≠ entrenar; misión de gobernanza propia. |

## 9.1 Distribución de severidad

| Severidad | Cantidad | IDs |
|---|---:|---|
| 🔴 Bloqueante | 21 | R-01..R-07, R-09, R-11..R-15, R-17..R-20, R-22..R-25 |
| 🟡 Alto | 4 | R-08, R-10, R-16, R-21 |
| 🟢 Moderado | 0 | — |

> Nota de conteo: 21 bloqueantes + 4 altos = 25. La fila 🟢 se mantiene en 0 para hacer explícito que no hay riesgos menores ignorables.

---

# 10. Fixtures de rechazo del roadmap

| Fixture | Resultado esperado |
|---|---|
| Ventana con `AS_ZERO` | `BLOCKED` (R-02) |
| `value=null` | `BLOCKED` (R-03) |
| `cal_` vencido en `ok` | `SUSPECT` (R-04) |
| `metric_id` fuera de 24 | `BLOCKED` (R-06) |
| Fila T2 en split propio | `BLOCKED` (R-13) |
| Fila `SIM` con `REAL` | `BLOCKED` (R-14) |
| `posicion` sin redacción | `PARTIAL` (R-17) |
| `NO_DATA` interpolado | `BLOCKED` (R-19) |
| `suspect` eliminado | `BLOCKED` (R-20) |
| κ con 0 pares | `BLOCKED` (R-24) |
| `prediction_id` en lectura | `BLOCKED` (R-25) |

---

# 11. Cierre

El roadmap define ocho fases desde la gobernanza hasta 1.000.000.000 de lecturas **sin crear hoy un solo stream**, sin sensores, sin lecturas y sin IA. La telemetría vive como asset de la observación: no propone dataset propio ni raíz nueva. Los 10 dominios son ejecutables en T0, y los 25 riesgos tienen umbral y mitigación verificables.

**Criterio de éxito:** completar el tercer pilar —audio ✅ · visión ✅ · telemetría ✅— sin romper Multimodal Governance V1 ni Observation Platform V1. Se cumple porque cada fase cuelga de la misma raíz y ninguna mitigación exige reescribir el pasado: todo se resuelve con `supersedes`, alias, bumps y manifiestos.

**Estado honesto:** **`DISENO`**, 0/8 gates, 0 lecturas, 0 streams, 0 modelos. Sin commit, push, merge ni tag.

---

*Fin del roadmap telemétrico. Complementa —nunca sustituye— la gobernanza telemétrica V1, la taxonomía, la política de etiquetado, la política OOD, la Observation Platform V1, el Masterplan V1 y las gobernanzas acústica y visual.*
