# POLÍTICA DE ETIQUETADO Y VALIDACIÓN TELEMÉTRICA V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T21:44:20-05:00
> - Origen: misión `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/telemetry/TELEMETRY_LABELING_POLICY_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: define `quality_flag`, validación, anomalías, ventanas, calibración y acuerdos. No valida lecturas reales, no calibra, no implementa.

**Misión:** `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1`
**Naturaleza:** documentación oficial de **gobernanza de etiquetado telemétrico**. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Fuentes de verdad:** `TELEMETRY_GOVERNANCE_V1.md` §4 (`NO_DATA`) · `TELEMETRY_TAXONOMY_V1.md` §3 (24 métricas) · Masterplan §7.3 (TEL-1..TEL-12).
**No modifica:** Masterplan, plataforma, gobernanza acústica ni visual.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante central:** **`NO_DATA` ≠ 0 · `NO_DATA` ≠ NULL · `NO_DATA` es un estado gobernado.**
> **Honestidad:** Cohen κ permanece **`PENDING`** hasta que existan pares reales de revisores. No se calcula κ simulado.

---

# 0. Propósito

En telemetría, "etiquetar" significa **asignar el `quality_flag` y declarar la validación** de una lectura. Esta política responde:

1. cuándo una lectura es `ok`, `suspect` o `NO_DATA`,
2. cómo se declara una anomalía sin borrarla,
3. cómo se agrega en ventanas sin convertir ausencia en cero,
4. cómo se goberna la calibración,
5. cómo se mide —y no se finge— el acuerdo entre revisores.

> **Límite TG-2:** esta política no crea lecturas ni sensores. Ningún valor puede venir de un modelo: un `prediction_id` en una lectura ⇒ `BLOCKED`.

---

# 1. `quality_flag` — definición operativa

## 1.1 Contrato

| Propiedad | Regla |
|---|---|
| Tipo | Enum cerrado: `ok` · `suspect` · `NO_DATA` |
| Cardinalidad | **Exactamente uno por lectura** |
| Obligatoriedad | Nunca vacío, nunca `null` (TG-2) |
| Inmutabilidad | Un flag asignado no se reescribe: la corrección crea nueva versión con `supersedes` |
| Trazabilidad | Toda lectura lleva `sensor_id` · `source_tier` · `captured_at` · `timezone` · `window_s` · `calibration_id` |

## 1.2 Árbol de decisión (autoridad)

```
  ¿Existe el registro telemetry_id?
        │ no  → PROHIBIDO: se crea NO_DATA con no_data_reason=not_measured
        ▼ sí
  ¿Se intentó medir?
        │ no  → quality_flag = NO_DATA  (value_state=NO_DATA, sin value numérico)
        ▼ sí
  ¿Hay unidad SI y formato válidos?
        │ no  → BLOCKED (unidad desconocida / null / prediction_id)
        ▼ sí
  ¿Está dentro del rango de §3 y la calibración vigente?
        │ no  → quality_flag = suspect + anomaly_code + nota
        ▼ sí
  quality_flag = ok
```

## 1.3 Reglas de asignación

| ID | Regla |
|---|---|
| **TLP-1 · Vocabulario cerrado** | `quality_flag` solo toma los 3 valores. No se inventa `estimated`, `interpolated` ni `fake`. |
| **TLP-2 · Cero es medición** | `value=0` solo con `quality_flag=ok` o `suspect`; jamás con `NO_DATA`. |
| **TLP-3 · Ausencia gobernada** | `NO_DATA` exige `no_data_reason` de la lista cerrada (padre §4.2). |
| **TLP-4 · Sospecha informativa** | Fuera de rango ⇒ `suspect` con `anomaly_code`; nunca se descarta ni se corrige en silencio (TEL-2). |
| **TLP-5 · REF separado** | T2 (`clima-externo`) lleva `state=REF`; `quality_flag` puede ser `ok` pero **no** se usa como verdad de campo. |
| **TLP-6 · Manual es real** | T0 manual es `REAL-LOCAL` con `sensor_source=manual`; no es `SIM` (P5-1). |
| **TLP-7 · Sin inferencia** | Interpolar, rellenar o predecir un valor está prohibido (ND-4). |
| **TLP-8 · Correlación por evento** | La relación con audio/imagen va por `event_id`, no por timestamp (TEL-11 / AL-3). |

---

# 2. Anomalías (dentro de `suspect`)

> Una **anomalía telemétrica** es una lectura **medida** que activa un código. No es OOD y no es `NO_DATA`.

| `anomaly_code` | Condición | Ejemplo |
|---|---|---|
| `OUT_OF_RANGE` | Valor fuera del rango de `TELEMETRY_TAXONOMY_V1.md` §3 | `humedad_relativa=142 %` |
| `CAL_EXPIRED` | `valid_until` vencido | `voltaje` con calibración de hace 2 años |
| `PRECISION_EXCEEDED` | Más decimales que la precisión declarada | 22,222222 °C con precisión 0,1 |
| `UNIT_CONVERTED` | Se aplicó conversión | °F → °C; se conserva `unit_original` |
| `RATE_SPIKE` | Salto brusco entre lecturas consecutivas del mismo stream | `co2` de 420 a 4800 ppm en 1 s |
| `STREAM_GAP` | Hueco temporal en el stream | 10 min sin lecturas esperadas |
| `CLOCK_SUSPECT` | `captured_at` inconsistente con la ventana | Marca de tiempo anterior al inicio |
| `DUPLICATE_CANDIDATE` | Misma huella y timestamp en dos IDs | Reenvío idempotente |

## 2.1 Reglas

| ID | Regla |
|---|---|
| AN-1 | Una anomalía **nunca elimina** la lectura: se conserva con `suspect` y código. |
| AN-2 | `RATE_SPIKE` y `STREAM_GAP` requieren `stream_id` y vecinos; sin ellos no se declaran. |
| AN-3 | `CLOCK_SUSPECT` se reporta con el `timezone` declarado; no se "corrige" el reloj. |
| AN-4 | `DUPLICATE_CANDIDATE` se marca, pero **no se fusiona**: dos IDs son dos registros hasta curación gobernada. |
| AN-5 | Una anomalía no sube ni baja el estado de honestidad de la observación. |

---

# 3. Ventanas y agregación (`WINDOW_ID`)

## 3.1 Contrato de ventana

| Campo | Regla |
|---|---|
| `window_id` | `win_<YYYYMMDD>_<start>_<end>` |
| `start_at` · `end_at` · `timezone` | Obligatorios |
| `window_s` | Obligatorio; consistente con `end_at − start_at` |
| `aggregation` | `last` · `mean` · `sum` · `count` — declarado, nunca inferido |
| `reading_ids[]` | Obligatorio; todo `telemetry_id` incluido |
| `ok_count` · `suspect_count` · `no_data_count` | Obligatorios; la suma debe ser `len(reading_ids)` |
| `no_data_policy` | `EXCLUDE` (por defecto) — nunca `AS_ZERO` |

## 3.2 Reglas de agregación

| ID | Regla |
|---|---|
| WIN-1 | El aggregation se calcula **solo** sobre `ok` y `suspect`; `NO_DATA` se excluye y se cuenta aparte. |
| WIN-2 | Está **prohibido** `no_data_policy=AS_ZERO` (sería falsificar, TG-2). |
| WIN-3 | Si `ok_count + suspect_count = 0`, la ventana se reporta como `NO_DATA`, con `value_state=NO_DATA`. |
| WIN-4 | `count` cuenta registros, no valores; incluye `NO_DATA` en `no_data_count`. |
| WIN-5 | Una ventana con `CLOCK_SUSPECT` se marca `suspect`; no se recalcula el tiempo. |
| WIN-6 | Cambiar `aggregation` crea una nueva ventana con `supersedes`; la anterior permanece. |

## 3.3 Ejemplo gobernado

```
  window_s = 60
  reading_ids = [t_000 (ok 24.0), t_001 (suspect 31.0), t_002 (NO_DATA not_measured)]
  ok_count=1 · suspect_count=1 · no_data_count=1
  aggregation=mean → value = (24.0 + 31.0) / 2 = 27.5   °C
  no_data_count = 1   ← se reporta, NO se cuenta como 0
  state = REAL-LOCAL heredado (mínimo de las lecturas included)
```

---

# 4. Calibración (`CALIBRATION_ID`)

| ID | Regla |
|---|---|
| CAL-1 | T0 declara `calibration_id=N/A` explícitamente; no se inventa un `cal_`. |
| CAL-2 | T3 exige `calibration_id` vigente; vencido ⇒ `suspect` con `CAL_EXPIRED`. |
| CAL-3 | `offset` y `scale` se declaran; la corrección se aplica conservando `value_original`. |
| CAL-4 | Una recalibración crea nuevo `cal_` con `supersedes`; el historial no se borra. |
| CAL-5 | `method` y `reference` son obligatorios; `reference=unknown` ⇒ `DISENO`, nunca `REAL`. |
| CAL-6 | Una lectura con `calibration_id` que no resuelve ⇒ `BLOCKED`. |
| CAL-7 | La calibración no cambia `observation_id`; es entidad de referencia (§2.6 del padre). |

---

# 5. Criterios de aceptación de una lectura

| ID | Criterio | Verificación |
|---|---|---|
| **AVT-1** | `metric_id` pertenece a las 24 canónicas | `TELEMETRY_TAXONOMY_V1.md` §3 |
| **AVT-2** | `unit_si` canónico (o conversión declarada) | UNI-1/UNI-2 |
| **AVT-3** | `quality_flag` ∈ 3 valores, nunca `null` | TLP-1/2/3 |
| **AVT-4** | `NO_DATA` lleva `no_data_reason`; `value` no es 0 ni null | Padre §4.2 |
| **AVT-5** | Rango y precisión declarados | §2 · §5 de taxonomía |
| **AVT-6** | `captured_at` + `timezone` + `window_s` presentes | TEL-4 |
| **AVT-7** | `sensor_id` · `source_tier` · `sensor_source` presentes | TEL-5 |
| **AVT-8** | `calibration_id` presente (`N/A` válido en T0) | CAL-1/2 |
| **AVT-9** | Si es T2, `state=REF`; si es T0 manual, `REAL-LOCAL` | TEL-7 / P5-1 |
| **AVT-10** | Sin `prediction_id` ni inferencia | TG-2 / TLP-7 |
| **AVT-11** | `observation_id` válido y sin nueva raíz | OBT-1/8 |
| **AVT-12** | `posicion` redactada en paquetes hacia ACP/KH | POS-2/3 |

## 5.1 Veredictos

| Veredicto | Significado |
|---|---|
| `ACCEPTED` | Cumple AVT-1..12 |
| `SUSPECT` | Medido con anomalía; conservado con nota |
| `NO_DATA` | No medido, gobernado; bloque reportado como `NO_DATA`/`PARTIAL` |
| `REVIEW` | Duda entre `suspect` y `NO_DATA`; segunda revisión decide |
| `BLOCKED` | `null`, `0` disfrazado, unidad inválida, `prediction_id`, calibración que no resuelve |

---

# 6. Acuerdos y Cohen κ (`PENDING`)

> No existen hoy pares de revisores independientes sobre lecturas telemétricas. κ **no se calcula**. Reportarlo sería fabricación (P-IA-5).

| Campo | Regla |
|---|---|
| `reviewer_id` | Opcional; segundo revisor humano |
| `agreement` | Categoría: `FULL` · `PARTIAL` · `NONE` · `PENDING` — **nunca número simulado** |
| `cohen_kappa` | **`PENDING`** hasta pares reales sobre la misma `telemetry_id` |
| `n_pairs` | Entero; κ sin `n_pairs > 0` ⇒ `BLOCKED` |

| ID | Regla |
|---|---|
| KAPT-1 | `cohen_kappa=PENDING` por defecto en todo el dominio telemétrico. |
| KAPT-2 | `NO_DATA` vs `0` es una divergencia **bloqueante**, no un desacuerdo menor: `agreement=NONE`. |
| KAPT-3 | El κ se calcula por `metric_id` y por `metric_family`, con `n_pairs` declarado. |
| KAPT-4 | Una corrección con `supersedes` recalcula sobre la versión vigente sin borrar la anterior. |
| KAPT-5 | `agreement=PENDING` con 0 pares y veredicto `NO_DATA` es el estado honesto actual. |

---

# 7. Curación no destructiva

| ID | Regla |
|---|---|
| CURT-1 | Corregir crea nueva lectura con `supersedes`; la original permanece. |
| CURT-2 | Nunca se reescribe `value`, `quality_flag` ni `no_data_reason` de una lectura existente. |
| CURT-3 | `NO_DATA` corregido a medido conserva el registro original con `ood_origin`/`nod_origin=true`. |
| CURT-4 | La curación **no sube** el estado de honestidad ni la confianza. |
| CURT-5 | Un `suspect` confirmado se mantiene; no se promueve a `ok` por conveniencia. |
| CURT-6 | La curación es misión futura; hoy solo se declara el contrato. |

---

# 8. Fixtures de rechazo (deben fallar)

| Fixture | Resultado esperado |
|---|---|
| `value=0` + `quality_flag=NO_DATA` | `BLOCKED` (TLP-2) |
| `value=null` | `BLOCKED` (TLP-1) |
| `NO_DATA` sin `no_data_reason` | `BLOCKED` (TLP-3) |
| `humedad_relativa=142` con `ok` | `SUSPECT` + `OUT_OF_RANGE` (TLP-4) |
| Ventana con `AS_ZERO` | `BLOCKED` (WIN-2) |
| Ventana con suma de conteos ≠ `len(reading_ids)` | `BLOCKED` (WIN-1) |
| T3 con `calibration_id` vencido en `ok` | `SUSPECT` + `CAL_EXPIRED` (CAL-2) |
| `calibration_id` inexistente | `BLOCKED` (CAL-6) |
| `cohen_kappa=0.91` con 0 pares | `BLOCKED` (KAPT-5) |
| `metric_id` fuera de las 24 | `BLOCKED` (AVT-1) |
| `prediction_id` en lectura | `BLOCKED` (AVT-10) |
| `posicion` sin redacción en ACP | `PARTIAL` (AVT-12) |

---

# 9. Gates (definidos, NO ejecutados)

| Gate | Condición | Estado |
|---|---|---|
| **G-TL-1** | `quality_flag` validado contra enum de 3 valores | `DISENO` |
| **G-TL-2** | `NO_DATA` ≠ 0 ≠ NULL en fixtures | `DISENO` |
| **G-TL-3** | Anomalías conservadas con código | `DISENO` |
| **G-TL-4** | Ventanas sin `AS_ZERO` y conteos consistentes | `DISENO` |
| **G-TL-5** | Calibración T0 `N/A` / T3 vigente | `DISENO` |
| **G-TL-6** | κ `PENDING` sin fabricación | `DISENO` |
| **G-TL-7** | Curación `supersedes` sin borrado | `DISENO` |

---

# 10. Cierre

Esta política convierte la taxonomía en reglas de uso: tres flags gobernados, ausencia nunca confundida con cero, anomalías conservadas, ventanas que excluyen `NO_DATA` sin falsificar, calibración honesta y κ **`PENDING`**.

**Estado honesto:** **`DISENO`**. No se validó ninguna lectura, no se calibró ningún sensor, no se calculó κ, no se implementó nada. Sin modificar la plataforma ni las gobernanzas de audio y visión. Sin commit, push, merge ni tag.

---

*Fin de la política de etiquetado telemétrico. Complementa —nunca sustituye— la gobernanza telemétrica V1 y la taxonomía telemétrica V1.*
