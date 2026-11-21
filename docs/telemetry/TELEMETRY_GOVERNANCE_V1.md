# GOBERNANZA TELEMÉTRICA V1 — SIGCT-RURAL (TERCER PILAR)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T21:44:20-05:00
> - Origen: misión `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/telemetry/TELEMETRY_GOVERNANCE_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: gobernanza oficial de telemetría. No crea sensores, streams, lecturas, modelos ni código.

**Misión:** `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1`
**Naturaleza:** contrato **declarativo y ejecutable**. Cierra el tercer pilar fundamental del ecosistema: **audio ✅ · visión ✅ · telemetría ✅**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Estado:** **OFICIAL — DISEÑADO**. Los contratos existen; su materialización requiere misiones explícitas.
**Conjunto de 5 documentos:** este es el padre.

| Documento | Autoridad |
|---|---|
| `TELEMETRY_GOVERNANCE_V1.md` | Identificadores, integración con `observation_id`, principios, fuentes |
| `TELEMETRY_TAXONOMY_V1.md` | Las 24 métricas base, 6 familias, unidades SI, rangos, `scene`/dominio |
| `TELEMETRY_LABELING_POLICY_V1.md` | Asignación de `quality_flag`, validación, ventanas, calibración, acuerdos |
| `TELEMETRY_OOD_POLICY_V1.md` | Sentinela `lectura_desconocida`: asignación, promoción, rechazo, curación |
| `TELEMETRY_DATASET_ROADMAP_V1.md` | Versiones, fases, gates y los 25 riesgos a 1.000.000.000 de lecturas |

**Subordinación:** Constitución V1.0.1 → Carta IA V1.0.1 → D-003 → Gobernanza Multimodal V1 → Masterplan V1 → Observation Platform V1 → **esta gobernanza** → documentos telemétricos especializados.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante de honestidad:** los **7 estados canónicos** (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`) no se amplían. Una lectura no cambia de estado por estar bien formateada.
> **Invariante de identidad:** **`OBSERVATION_ID` no se modifica**. Todo ID telemétrico es hijo o vista de él.
> **Invariante de ausencia:** **`NO_DATA` ≠ 0 · `NO_DATA` ≠ NULL · `NO_DATA` es un estado gobernado.**

---

# 0. Propósito y alcance

Audio y visión ya tienen gobernanza oficial. El último dominio fundamental sin gobernar es la telemetría. Este documento y sus cuatro hermanos la cierran **sin reabrir la arquitectura general** y **sin crear una sola raíz nueva**.

**Lo que SÍ define:**

1. Seis identificadores: `TELEMETRY_ID`, `METRIC_ID`, `STREAM_ID`, `WINDOW_ID`, `CALIBRATION_ID`, `SENSOR_ID`.
2. Las **24 métricas base** del Masterplan §7.2, con unidades SI y rangos de plausibilidad, clasificadas en las 6 familias de la misión.
3. El estado gobernado `NO_DATA` y su distinción dura de `0` y de `null`.
4. La sentinela oficial `lectura_desconocida` con promoción, rechazo y curación.
5. La integración a `OBSERVATION_ID` y al `ObservationPackage` sin romper la plataforma.
6. Los 25 riesgos de escalar a **1.000.000.000** de lecturas.

**Lo que NO hace (explícitamente):**

| No hace | Detalle |
|---|---|
| No hace código | Ningún `.js`, `.py`, `.jsx`, servicio ni firmware |
| No hace IA | No hay inferencia, predicción ni LLM en la lectura |
| No hace modelos | No hay `model_id`, `model_run_id` ni `prediction_id` nuevos |
| No hace sensores | No se compra, configura ni implementa ningún dispositivo |
| No implementa | No se crean streams, ni se calibran equipos, ni se capturan lecturas |
| No crea datasets | No se materializa ningún directorio de telemetría |
| No modifica la plataforma | `SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md` queda intacto |
| No modifica el Masterplan | `SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md` queda intacto |

> Todo lo aquí descrito está en estado **`DISENO`**, salvo los contratos ratificados de la plataforma. Ninguna métrica nace con lecturas: todas nacen con 0.

---

# 1. Principios de la gobernanza telemétrica

| ID | Principio | Consecuencia |
|---|---|---|
| **TG-1** | **Observación como raíz** | Toda lectura cuelga de `observation_id`; ninguna se crea sin ella. |
| **TG-2** | **`NO_DATA` es un estado, no un valor** | Nunca se codifica como `0`, nunca como `null`, nunca como fila ausente. |
| **TG-3** | **Cero medido es información** | `0` solo se escribe si el instrumento midió cero. |
| **TG-4** | **Unidad canónica SI** | Si el instrumento usa otra, se declara conversión y se conserva el original. |
| **TG-5** | **Rango antes que descarto** | Fuera de rango ⇒ `suspect` con nota; nunca se elimina en silencio. |
| **TG-6** | **Tiempo explícito** | `captured_at` + `timezone` + `window_s` obligatorios en toda lectura. |
| **TG-7** | **Calibración declarada** | `calibration_id` obligatorio en T3; `N/A` explícito en T0. |
| **TG-8** | **Original intacto** | Toda corrección crea una nueva versión con `supersedes`; nunca se reescribe. |
| **TG-9** | **OOD telemétrico es veredicto** | `lectura_desconocida` no es una métrica de contenido y no sube confianza. |
| **TG-10** | **REF nunca es verdad de campo** | T2 (`clima-externo`) se reporta como `REF`; no entra en evaluación propia. |
| **TG-11** | **Correlación por evento** | La relación con audio/imagen/video va por `event_id`, no por proximidad de timestamps. |
| **TG-12** | **Sin misión, sin ejecución** | Gobernar no autoriza implementar sensores ni streams. |

---

# 2. Los seis identificadores

## 2.1 Catálogo

| ID solicitado | Prefijo | Naturaleza | Depende de | Estado |
|---|---|---|---|---|
| `TELEMETRY_ID` | `telemetry_` | Asset telemétrico bajo la observación | `observation_id` | **Ratificado** (Platform §3.5) |
| `METRIC_ID` | (token) | Vocabulario canónico de métrica | `telemetry_domain_id` | **Ratificado** (Masterplan §7.2) |
| `STREAM_ID` | `stream_` | Serie temporal de una métrica | `telemetry_id` + `sensor_id` | **Nuevo, `DISENO`** |
| `WINDOW_ID` | `win_` | Ventana de agregación temporal | `stream_id` | **Nuevo, `DISENO`** |
| `CALIBRATION_ID` | `cal_` | Registro de calibración del instrumento | `sensor_id` | **Nuevo, `DISENO`** |
| `SENSOR_ID` | `sensor_` | Identidad del instrumento | ninguna (entidad de referencia) | **Nuevo, `DISENO`** |

> Regla común: ninguno de estos IDs es raíz. El `SENSOR_ID` es una entidad de referencia reutilizable; **no contiene observaciones** y por eso no compite con `OBSERVATION_ID`.

## 2.2 `TELEMETRY_ID` — `telemetry_<YYYYMMDD>_<stream>_<seq>`

| Campo | Obligación | Función |
|---|---|---|
| `telemetry_id` · `observation_id` | OBLIGATORIAS | Identidad y pertenencia (Platform FS-5) |
| `metric_id` | OBLIGATORIA | Qué se midió |
| `quality_flag` | OBLIGATORIA | `ok` · `suspect` · `NO_DATA` |
| `value` / `value_state` | OBLIGATORIAS | Uno de los dos; nunca ambos vacíos, nunca `null` |
| `unit_si` · `source_tier` · `sensor_source` | OBLIGATORIAS | TG-4, TEL-5 |
| `captured_at` · `timezone` · `window_s` | OBLIGATORIAS | TEL-4 |
| `calibration_id` | OBLIGATORIA | `N/A` explícito en T0 (TEL-6) |
| `state` | OBLIGATORIA | 7 estados canónicos; `REAL-LOCAL` para manual verificable |

**Regla TLM-1:** un `telemetry_id` pertenece a **exactamente una** observación. Otra observación puede referenciarlo por ID, nunca copiarlo.

## 2.3 `METRIC_ID` — token canónico

`metric_id` **no es un ID de ocurrencia**: es un token de vocabulario (`temperatura_ambiente`, `ph`, `caudal`). No lleva fecha ni secuencia. Las 24 métricas canónicas están en `TELEMETRY_TAXONOMY_V1.md` §3, copiadas del Masterplan §7.2 sin modificar rangos ni unidades.

**Regla MET-1:** un `metric_id` nunca se renombra. Un cambio de nombre se gestiona con `alias_of` y bump de `taxonomy_version` (TEL-9).

## 2.4 `STREAM_ID` — `stream_<YYYYMMDD>_<sensor_id>_<seq3>`

| Campo | Obligación | Función |
|---|---|---|
| `stream_id` · `sensor_id` | OBLIGATORIAS | Serie y procedencia |
| `metric_id` | OBLIGATORIA | Una métrica por stream |
| `observation_ids[]` | OBLIGATORIA | Observaciones que alimentan la serie |
| `cadence_s` · `window_s` | OBLIGATORIAS | Ritmo y ventana declarados |
| `state` | OBLIGATORIA | Estado heredado de las lecturas (mínimo honesto) |

**Regla STR-1:** un stream **no crea una observación**: es una vista agregada de lecturas que ya cuelgan de observaciones. Si se elimina un stream, las lecturas permanecen (NADA DESAPARECE).

## 2.5 `WINDOW_ID` — `win_<YYYYMMDD>_<start>_<end>`

| Campo | Obligación | Función |
|---|---|---|
| `window_id` · `stream_id` | OBLIGATORIAS | Identidad y serie |
| `start_at` · `end_at` · `timezone` | OBLIGATORIAS | Fronteras explícitas |
| `window_s` | OBLIGATORIA | Duración en segundos |
| `aggregation` | OBLIGATORIA | Método declarado (`last` · `mean` · `sum` · `count`) |
| `reading_ids[]` | OBLIGATORIA | Conjunto de `telemetry_id` incluidos |
| `NO_DATA_policy` | OBLIGATORIA | Cómo se trata la ausencia dentro de la ventana (§4) |

**Regla WIN-1:** una ventana **nunca convierte `NO_DATA` en cero**. El aggregation se calcula solo sobre lecturas con `quality_flag=ok|suspect`; las `NO_DATA` se cuentan aparte en `no_data_count`.

## 2.6 `CALIBRATION_ID` — `cal_<YYYYMMDD>_<sensor_id>_<seq2>`

| Campo | Obligación | Función |
|---|---|---|
| `calibration_id` · `sensor_id` | OBLIGATORIAS | Registro e instrumento |
| `calibrated_at` · `valid_until` | OBLIGATORIAS | Vigencia |
| `method` · `reference` | OBLIGATORIAS | Método y patrón declarados |
| `offset` · `scale` | OBLIGATORIAS | Corrección aplicada |
| `state` | OBLIGATORIA | `DISENO` hasta calibración real |

**Regla CAL-1:** en T0, `calibration_id=N/A` es **explícito y válido**; no se inventa un `cal_` para simular calibración. Si `valid_until` venció, la lectura es `suspect`, nunca `ok` (CAL-2).

## 2.7 `SENSOR_ID` — `sensor_<tipo>_<seq>`

| Campo | Obligación | Función |
|---|---|---|
| `sensor_id` | OBLIGATORIA | Identidad estable del instrumento |
| `sensor_source` | OBLIGATORIA | `manual` · `device` · `external` · `specialized` |
| `source_tier` | OBLIGATORIA | `T0` · `T1` · `T2` · `T3` |
| `model` · `serial` | CONDICIONALES | Declarados en T1/T3; en T0 se nombra el medidor manual |
| `calibration_ids[]` | DERIVADO | Historial de calibración, sin borrar el anterior |

**Regla SEN-1:** `sensor_<tipo>_<seq>` es opaco: no codifica precisión, unidad ni estado. Cambiar de sensor crea un nuevo `sensor_id`; las lecturas antiguas siguen apuntando al anterior (TG-8).

---

# 3. Integración a `OBSERVATION_ID` (sin nuevas raíces)

## 3.1 Principio

La plataforma ya define en su §3.5 que la telemetría es un asset `telemetry_` colgado de `observation_id`, guardado en `obs_.../telemetry/`, y que el `ObservationPackage` incluye descriptores de `telemetry_`. Esta gobernanza **no cambia nada de eso**: solo fija los contratos internos de la lectura.

```
  observation_id  (raíz — NO se modifica)
        │
        └── telemetry_20261120_temp_000        ← asset (Platform §3.5)
              │
              ├── metric_id = temperatura_ambiente
              ├── value = 24.0 · unit_si = °C · quality_flag = ok
              ├── sensor_id = sensor_manual_001 · calibration_id = N/A
              ├── captured_at + timezone + window_s
              ├── stream_id → win_...  (vistas, NO raíces)
              └── event_id (opcional) → crosswalk con audio/imagen/video
                        │
                        ▼
  ObservationPackage  (inmutable — Platform §3.6)
     · bloque Assets: descriptores telemetry_ (ID, metric_id, value, quality_flag)
     · bloque Eventos: event_ids[] (un solo ancla)
     · NO bytes crudos por defecto · NO predicciones · NO veredictos
```

## 3.2 Reglas de integración

| ID | Regla |
|---|---|
| OBT-1 | Toda lectura se guarda en `obs_.../telemetry/` según Platform FS-1/FS-3. **No se crea otra raíz.** |
| OBT-2 | `stream_id`, `window_id` y `sensor_id` son **vistas/entidades de referencia**; ninguno aparece como raíz de un paquete. |
| OBT-3 | El `ObservationPackage` referencia `telemetry_id`; nunca lo redefine ni lo copia. |
| OBT-4 | `NO_DATA` viaja en el bloque de assets **como estado explícito**, jamás como `0` ni como campo omitido. |
| OBT-5 | La correlación multimodal va por `event_id`; un mismo evento reúne audio, imagen y telemetría sin duplicar anclas. |
| OBT-6 | `docsByObservation` sigue siendo derivado por lectura; la telemetría no escribe en el KH. |
| OBT-7 | El paquete sin telemetría es válido (CAP-2): `telemetry_ids=[]`, sin inventar lecturas. |
| OBT-8 | Ningún ID telemétrico cambia `observation_id`. Requisito del criterio de éxito. |
| OBT-9 | Esta gobernanza **no modifica** el documento de la plataforma; solo lo especializa. |

## 3.3 Comprobación de no-rotura

| Comprobación | Resultado esperado |
|---|---|
| Hash de `SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md` | Idéntico antes y después de esta misión |
| Hash de `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1.md` | Idéntico |
| Hash de `SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md` | Idéntico |
| Estructura `obs_.../telemetry/` | Idéntica a Platform §4.1 |
| Flujo de 7 pasos | Idéntico a Platform §3 |
| `OBSERVATION_ID` | Sin cambios en los 5 documentos |

## 3.4 Veredictos ACP — vocabulario unificado

El ACP consume el `ObservationPackage` por `observation_id`. La telemetría **no crea veredictos nuevos**: usa los cinco de la Carta IA, sin ampliarlos.

| Veredicto | Cuándo aplica a telemetría |
|---|---|
| `RESOLVED` | Todas las métricas esperadas tienen `quality_flag=ok`; observación entregada con telemetría completa. |
| `PARTIAL` | Hay `NO_DATA`, `suspect`, `posicion` redactada o telemetría opcional ausente (CAP-2): la observación sigue siendo válida. |
| `NO_DATA` | La consulta pide telemetría y el paquete no contiene ningún `telemetry_id`, o todas las métricas están en estado gobernado `NO_DATA`. |
| `BLOCKED` | `null`, `0` disfrazado de ausencia, unidad inválida, `prediction_id` o calibración que no resuelve. |
| `UNANSWERABLE` | La pregunta requiere una métrica fuera de las 24 canónicas y no hay evidencia gobernada para responderla (ni OOD promocionado). |

**Regla ACPT-1:** `NO_DATA` (veredicto) y `NO_DATA` (`quality_flag`/estado gobernado) comparten token pero no confunden dominios: el primero responde a una pregunta, el segundo describe una lectura.
**Regla ACPT-2:** la telemetría **nunca** fabrica `RESOLVED` rellenando ausencias; `NO_DATA` jamás se imputa (ND-4).
**Regla ACPT-3:** `UNANSWERABLE` no es un sexto estado de honestidad; es un veredicto. Los 7 estados canónicos permanecen intactos.

---

# 4. `NO_DATA`: estado gobernado

> **Invariante central del pilar.** Esta sección es la autoridad. Los otros documentos la remiten; no la redefinen.

## 4.1 Distinción dura

| Concepto | Representación | Significado | Permitido |
|---|---|---|---|
| **Cero medido** | `quality_flag=ok`, `value=0` | El instrumento midió cero | ✅ |
| **Bajo rango** | `quality_flag=suspect`, `value=<n>`, `note=<razón>` | Se midió, fuera de plausibilidad | ✅ |
| **`NO_DATA`** | `quality_flag=NO_DATA`, `value_state=NO_DATA`, `no_data_reason=<código>` | **No se midió** | ✅ |
| **`null`** | `value=null`, campo vacío u omitido | Ausencia no gobernada | ❌ **PROHIBIDO** |
| **Fila ausente** | Sin `telemetry_id` | Pérdida silenciosa | ❌ **PROHIBIDO** |
| **`0` como ausencia** | `value=0` sin medición | Falsificación | ❌ **PROHIBIDO** |

## 4.2 Contrato de la lectura `NO_DATA`

| Campo | Valor obligatorio |
|---|---|
| `telemetry_id` | Presente (la lectura existe como registro) |
| `metric_id` | Presente (se sabe qué **no** se midió) |
| `quality_flag` | `NO_DATA` |
| `value_state` | `NO_DATA` |
| `value` | **No se emite como número** (ni `0`, ni `null`) |
| `no_data_reason` | Uno de: `not_measured` · `sensor_offline` · `out_of_window` · `no_consent` · `instrument_unavailable` · `unresolved_metric` |
| `captured_at` · `timezone` · `window_s` | Presentes (cuándo se esperaba la lectura) |
| `sensor_id` · `source_tier` | Presentes |
| `state` | Heredado; `NO_DATA` **no** es un estado de honestidad nuevo |

**Regla ND-1:** `NO_DATA` **nunca** se agrega como cero. En promedios se excluye y se reporta `no_data_count` separado (WIN-1).

**Regla ND-2:** un `NO_DATA` no degrada automáticamente la observación: la observación sigue siendo válida (CAP-2), pero el bloque se reporta como `NO_DATA`/`PARTIAL` en ACP (ACP-5).

**Regla ND-3:** un `NO_DATA` **nunca** se convierte en `lectura_desconocida`. Son cosas distintas: ausencia vs. valor no resoluble (§OOD).

**Regla ND-4:** rellenar `NO_DATA` con promedios, interpolación o inferencia está prohibido (TG-2, VG-11). Eso sería fabricación (P-IA-5).

## 4.3 Fixture de rechazo

| Fixture | Resultado esperado |
|---|---|
| `value=0` + `quality_flag=NO_DATA` | `BLOCKED` (ND-1) |
| `value=null` en cualquier lectura | `BLOCKED` (§4.1) |
| Fila omitida para una métrica esperada | `NO_DATA` con `no_data_reason=not_measured` (nunca silencio) |
| Promedio que incluye `NO_DATA` como 0 | `BLOCKED` (WIN-1) |
| `NO_DATA` interpolado | `BLOCKED` (ND-4) |

---

# 5. Fuentes y dominios (herencia del Masterplan)

| `source_tier` | Nombre | Honestidad | Uso |
|---|---|---|---|
| `T0` | Manual / laptop | `REAL-LOCAL` | Captura del aprendiz; base de V1 |
| `T1` | Dispositivo local | `REAL-LOCAL` según evidencia | Streams en investigación |
| `T2` | Externa (`clima-externo`) | **`REF`** | Contexto climático; jamás verdad de campo (TEL-7) |
| `T3` | Especializada | `DISENO` hasta calibración | Sensores avanzados; ningún gate de V1 depende de ellos (TEL-12) |

| Eje del Masterplan (§7.1) | Estado en esta gobernanza |
|---|---|
| `telemetry_domain_id` (8 valores) | **Conservado íntegro**: `AMBIENTAL` · `SUELO` · `AGUA` · `INFRAESTRUCTURA` · `MAQUINARIA` · `BIOLOGICO` · `DISPOSITIVO` · `EXTERNO` |
| `metric_id` | **Conservado íntegro**: 24 tokens de §7.2 |
| `source_tier` | **Conservado íntegro**: T0..T3 |
| `quality_flag` | **Conservado íntegro + gobernado**: `ok` · `suspect` · `NO_DATA` |

> La misión pide 6 familias (AMBIENTE, SUELO, AGUA, ANIMAL, INFRAESTRUCTURA, ENERGÍA). Se satisfacen como **`metric_family`**, un eje **aditivo de reporte**, sin borrar ni reemplazar los 8 `telemetry_domain_id` del Masterplan. Es anti-pérdida: 8 dominios originales + 6 familias de agregación. Detalle en `TELEMETRY_TAXONOMY_V1.md` §2.

---

# 6. OOD telemétrico (resumen — contrato completo en `TELEMETRY_OOD_POLICY_V1.md`)

| Elemento | Definición |
|---|---|
| Sentinela | `lectura_desconocida` |
| Naturaleza | **Veredicto**, no `metric_id` de contenido |
| `quality_flag` | `suspect` con `ood_reason`; **nunca** `ok` |
| Estado | **`DISENO`** — no materializada |
| Asignación | Solo por revisión gobernada; nunca por modelo, nunca para llenar cupos |
| Promoción | Misión de gobernanza + bump de `metric_id` + `supersedes` |
| Rechazo | Calidad/integridad inválida ⇒ `BLOCKED`/`ROTO`, no OOD |
| Curación | Versión nueva con `supersedes`; original intacto; estado no sube |

---

# 7. Escalabilidad

Los **25 mayores riesgos de escalar a 1.000.000.000 de lecturas**, con severidad, umbral y mitigación, están en `docs/telemetry/TELEMETRY_DATASET_ROADMAP_V1.md` §9 como **única fuente de verdad**. Los otros cuatro documentos remiten allí. Puntos de atención principales:

- Relojes y zonas horarias (millones de lecturas con `timezone` inconsistente).
- Deriva de calibración y de unidades.
- `NO_DATA` colapsado a `0` en agregaciones.
- Explosión de cardinalidad de `stream_id`/`window_id`.
- Correlación espuria por timestamps sin `event_id`.
- Privacidad de `posicion` (lat/lon).

---

# 8. Gates (definidos, NO ejecutados)

| Gate | Condición | Estado |
|---|---|---|
| **G-TG-1** | Seis identificadores ratificados con cardinalidad | `DISENO` |
| **G-TG-2** | 24 métricas base con unidades y rangos intactos | `DISENO` |
| **G-TG-3** | 6 familias aditivas sin borrar los 8 dominios | `DISENO` |
| **G-TG-4** | `NO_DATA` ≠ 0 ≠ NULL verificado en fixtures | `DISENO` |
| **G-TG-5** | Sentinela `lectura_desconocida` aprobada por misión | `DISENO` |
| **G-TG-6** | Integración a `ObservationPackage` sin cambios en la plataforma | `DISENO` |
| **G-TG-7** | 10 dominios validados en T0 sin hardware T3 | `DISENO` |
| **G-TG-8** | Fixtures de rechazo (§4.3 y política) pasan | `DISENO` |

---

# 9. Cierre

Esta gobernanza cierra el tercer pilar. Seis IDs, 24 métricas gobernadas, `NO_DATA` como estado, sentinela OOD y una integración estrictamente aditiva a `OBSERVATION_ID`.

**Criterio de éxito:** completar audio ✅ · visión ✅ · telemetría ✅ **sin romper** Multimodal Governance V1 ni Observation Platform V1. Se satisface porque ningún ID telemétrico es raíz: todos cuelgan de la observación o son vistas/entidades de referencia.

**Estado honesto:** **OFICIAL y DISEÑADA**. Sin código, sensores, streams, lecturas, modelos ni IA. Sin modificar la plataforma, el masterplan ni la gobernanza acústica/visual. Sin commit, push, merge ni tag. Los 8 gates permanecen abiertos.

---

*Fin de la gobernanza telemétrica padre. Complementa —nunca sustituye— la Observation Platform V1, la gobernanza multimodal V1, el Masterplan V1, la gobernanza acústica V2, la gobernanza visual V1, la Constitución, la Carta IA y D-003.*
