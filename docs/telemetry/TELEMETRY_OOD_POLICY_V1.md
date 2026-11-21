# POLÍTICA OOD TELEMÉTRICA V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T21:44:20-05:00
> - Origen: misión `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/telemetry/TELEMETRY_OOD_POLICY_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: define la sentinela `lectura_desconocida` y sus criterios de asignación, promoción, rechazo y curación. No crea la sentinela, no emite lecturas, no implementa.

**Misión:** `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1`
**Naturaleza:** doctrina oficial de **out-of-distribution telemétrico**. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Autoridad:** `TELEMETRY_GOVERNANCE_V1.md` §6 · `TELEMETRY_TAXONOMY_V1.md` §6.
**Patrones hermanos:** `docs/acoustic/ood_policy_v2.md` (`evento_desconocido`) · `docs/vision/VISION_OOD_POLICY_V1.md` (`evento_visual_desconocido`).
**No modifica:** gobernanza acústica, gobernanza visual, plataforma ni datasets.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante:** OOD telemétrico es un **veredicto de incertidumbre**, no una métrica, no un `NO_DATA`, no una anomalía y no un estado de honestidad (TG-9).

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Sentinela `lectura_desconocida` | **`DISENO` — NO creada** |
| Lecturas que la usan hoy | **0** |
| Se emite a demanda | **NO** |
| Se genera por modelo | **NO** |
| Promociones ejecutadas | **Ninguna** |
| `metric_id` nuevo creado aquí | **Ninguno** |

> Existe el **contrato**; la sentinela se materializará solo por misión explícita y tras verificación.

---

# 1. La sentinela

## 1.1 Identidad

| Campo | Valor |
|---|---|
| `sentinel_id` | `lectura_desconocida` |
| Naturaleza | **Veredicto** de no-resolución semántica |
| ¿Es `metric_id`? | **NO** — no entra en la tabla de las 24 métricas |
| `quality_flag` | `suspect` + `ood_reason` — **nunca** `ok`, **nunca** `NO_DATA` |
| `is_ood_bucket` | `true` (declarado en contrato) |
| `dir_name` | `desconocido_telemetria` (estable, sin colisión con audio ni visión) |
| Estado | `DISENO` (no creada) |
| `confidence` | No aplica; **nunca sube** por OOD |

## 1.2 Qué significa

*"Se recibió una lectura, pero no se puede resolver a ninguna de las 24 `metric_id` canónicas ni a una conversión gobernada con suficiente certeza."*

Es incertidumbre **semántica**: el valor existe, pero **no sabemos qué mide**.

## 1.3 Qué NO significa (distinciones duras)

| No es | Es en su lugar |
|---|---|
| **`NO_DATA`** | Ausencia gobernada: no se midió (padre §4). OOD sí se recibió. |
| **Cero** | `value=0` medido con `quality_flag=ok`. |
| **Anomalía** | `suspect` con `anomaly_code`: se sabe qué métrica es y está fuera de rango. |
| **Calibración vencida** | `CAL_EXPIRED`: se sabe qué mide, falta calibración vigente. |
| **Modelo dudó** | No hay modelo en este pilar; un `prediction_id` ⇒ `BLOCKED`. |
| **Unidad rara pero convertible** | Se aplica UNI-2 con `unit_original` y `conversion_factor`. |
| **Métrica nueva** | Se propone por bump de gobernanza (§3), no por OOD permanente. |

### Tabla comparativa (autoridad)

| Situación | `quality_flag` | `metric_id` | `no_data_reason` / `ood_reason` | Categoría |
|---|---|---|---|---|
| No se leyó el sensor | `NO_DATA` | Presente | `not_measured` | Ausencia |
| `humedad_relativa=142 %` | `suspect` | `humedad_relativa` | `OUT_OF_RANGE` | Anomalía |
| `cal_` vencido | `suspect` | Presente | `CAL_EXPIRED` | Calibración |
| Llega `73 °F` | `ok` | `temperatura_ambiente` | `UNIT_CONVERTED` | Conversión |
| Llega `sensor_x: 0x1F` sin crosswalk | `suspect` | **No resoluble** | `UNRESOLVED_METRIC` | **OOD** |
| Llega `prediction_id` | `BLOCKED` | — | — | Prohibido |

---

# 2. Criterios de asignación

## 2.1 Cuándo se asigna

Se asigna `lectura_desconocida` solo si **todas**:

| # | Condición |
|---|---|
| TOD-A1 | Existe un `telemetry_id` con payload recibido (no es ausencia). |
| TOD-A2 | El `sensor_id` es conocido o declarado como `sensor_unknown`. |
| TOD-A3 | Se intentó resolver `metric_id` contra las 24 canónicas y contra alias vigentes: **ninguno aplica**. |
| TOD-A4 | Se intentó conversión de unidad gobernada (UNI-2) y **no fue posible**. |
| TOD-A5 | El valor no es `null`, no es `0` disfrazado y no trae `prediction_id`. |
| TOD-A6 | Un revisor humano escribió `notes` explicando qué se recibió y por qué no encaja. |
| TOD-A7 | Si hay `posicion`, se respeta redacción (POS-2/3). |

## 2.2 Cuándo NO se asigna

| Situación | Acción correcta |
|---|---|
| No llegó la lectura | `NO_DATA` con `not_measured` — **no** OOD |
| Llegó fuera de rango pero se sabe qué es | `suspect` + `OUT_OF_RANGE` |
| Unidad convertible | Conversión UNI-2 con original conservado |
| `cal_` vencido | `suspect` + `CAL_EXPIRED` |
| Duda entre `ph` de suelo y de agua | `ph` con `domain_secondary` (EJE-3), **no** OOD |
| Sensor nuevo con crosswalk pendiente | `DISENO` + propuesta de `metric_id` por gobernanza |
| Se quiere llenar el bucket | **Prohibido**: OOD no se emite a demanda (TG-9) |

## 2.3 `ood_reason` (lista cerrada)

| Código | Significado |
|---|---|
| `UNRESOLVED_METRIC` | Ninguna de las 24 métricas explica el payload |
| `UNKNOWN_UNIT` | Unidad no convertible con factor declarado |
| `UNKNOWN_SCHEMA` | Formato de payload no gobernado |
| `UNMAPPED_SENSOR` | `sensor_id` sin crosswalk a métrica |
| `AMBIGUOUS_PAYLOAD` | Dos métricas plausibles sin criterio para decidir |

## 2.4 Veredicto de asignación

| Veredicto | Significado |
|---|---|
| `OOD_ASSIGNED` | Cumple TOD-A1..A7; registrado con justificación. |
| `SUSPECT_KNOWN` | Sí se resolvió la métrica; era anomalía o calibración. |
| `NO_DATA` | No se recibió lectura. |
| `REVIEW` | Duda; segundo revisor decide. |
| `BLOCKED` | `null`, `0` disfrazado o `prediction_id`. |

---

# 3. Criterios de promoción

> Promoción = convertir una lectura OOD en un **`metric_id` canónico nuevo**. Es el único camino para que el vocabulario crezca sin romper `OBSERVATION_ID`.

| # | Criterio |
|---|---|
| TOD-P1 | ≥ N lecturas OOD independientes del mismo concepto (N lo fija misión; hoy **no definido ⇒ sin promoción**). |
| TOD-P2 | Diversidad: ≥ 2 `sensor_id` y ≥ 2 `observation_id` (no concentrado en un solo origen). |
| TOD-P3 | Doble revisión humana con `agreement=FULL`. |
| TOD-P4 | `notes` descriptivas + `metric_id` candidato + `unit_si` + rango propuesto + `metric_family` (una de las 6). |
| TOD-P5 | **Misión de gobernanza explícita** aprobando el nuevo `metric_id` (EXT-1). |
| TOD-P6 | `taxonomy_version` actualizada y crosswalk de alias publicado en el mismo cambio. |
| TOD-P7 | La sentinela y las notas OOD **se conservan**: `ood_origin=true` y `supersedes` al registro anterior. |
| TOD-P8 | El estado **no sube**: `DISENO`/`REAL-LOCAL` se hereda; `REAL` exige gates propios. |

## 3.1 Reglas de promoción

| ID | Regla |
|---|---|
| PROMT-1 | Promover **nunca borra** la evidencia OOD que originó la métrica. |
| PROMT-2 | Promover **nunca modifica** `OBSERVATION_ID`. |
| PROMT-3 | El candidato no puede ser una métrica compuesta: prohibido `temperatura_con_humedad` (análogo a NC-1). |
| PROMT-4 | Si el candidato es compuesto, se **rechaza** y se descompone en métricas existentes + `event_id`. |
| PROMT-5 | Promoción sin misión de gobernanza es inválida y se revierte por nueva versión, nunca por borrado. |
| PROMT-6 | La nueva métrica nace con 0 lecturas y estado `DISENO`. |

---

# 4. Criterios de rechazo

> Rechazo = registro **no apto** para OOD ni para el dataset. Distinto de OOD.

| # | Criterio |
|---|---|
| TOD-R1 | `sha256`/integridad del payload no coincide (Platform P6-1/5). |
| TOD-R2 | `value=null` o `quality_flag` vacío. |
| TOD-R3 | `0` usado como ausencia (TG-2). |
| TOD-R4 | `prediction_id` presente (TG-2 / AVT-10). |
| TOD-R5 | `metric_id` compuesto (`temperatura_con_humedad`). |
| TOD-R6 | Asignación OOD sin `notes` (TOD-A6). |
| TOD-R7 | OOD usado cuando existía conversión de unidad posible (TOD-A4). |
| TOD-R8 | `posicion` sin redacción requerida (POS-2/3). |
| TOD-R9 | Fuente T2 sin declaración `REF` (TEL-7). |

## 4.1 Destino del rechazo

| Destino | Cuándo |
|---|---|
| `quarantine` | Recuperable con curación (R1, R5, R6, R7, R9) |
| `BLOCKED` | `null`, `0` disfrazado, `prediction_id` (R2..R4) |
| `ROTO` | Corrupción irreversible |
| `PARTIAL` + redacción | Privacidad (R8) |

> El rechazo **nunca elimina** el registro ni su observación: se conserva con nota (TG-8, CURT-2).

---

# 5. Criterios de curación

| ID | Regla |
|---|---|
| TOD-C1 | Toda cura crea nueva versión con `supersedes`; el OOD original sigue consultable. |
| TOD-C2 | Si se resuelve a métrica existente, se anota y el original conserva `ood_origin=true`. |
| TOD-C3 | Si se propone métrica nueva, sigue §3; no se autocrea. |
| TOD-C4 | Si se confirma OOD, se enriquece `notes` y se mantiene `dir_name` estable. |
| TOD-C5 | La curación **no sube** `state` ni `confidence` (CURT-4). |
| TOD-C6 | `NO_DATA` **nunca** se cura a OOD ni viceversa (ND-3): son dominios distintos. |
| TOD-C7 | El bucket acumula candidatos hasta promoción; nunca se vacía (NADA DESAPARECE). |

## 5.1 Ciclo de vida completo

```
  payload recibido
       │  ninguna de las 24 métricas lo resuelve (TOD-A1..A7)
       ▼
  lectura_desconocida   [DISENO · 0 lecturas · no emitida a demanda]
       │
       ├──► rechazo por integridad (§4) ──► quarantine / BLOCKED / ROTO
       │
       ├──► cura a métrica existente (§5.2) ──► ood_origin=true
       │
       └──► promoción a métrica nueva (§3) ──► taxonomy bump + supersedes
                    │
                    ▼
            observación SIGUE siendo la misma  (OBSERVATION_ID intacto)
```

---

# 6. Convivencia con OOD de audio y visión

| Aspecto | Audio v2 | Visión v1 | Telemetría v1 |
|---|---|---|---|
| Sentinela | `evento_desconocido` | `evento_visual_desconocido` | `lectura_desconocida` |
| Naturaleza | Clase bucket | Veredicto | Veredicto |
| `quality_flag` | n/a | n/a | `suspect` + `ood_reason` |
| `dir_name` | `desconocido` | `desconocido_visual` | `desconocido_telemetria` |
| Estado | Operativo en contrato | `DISENO` | `DISENO` |
| Regla común | No se captura a demanda | No se captura a demanda | No se emite a demanda |

> Si en el futuro se unifican sentinelas, se hará con `alias_of` y bump, **nunca borrando** `lectura_desconocida`.

---

# 7. Fixtures de rechazo (deben fallar)

| Fixture | Resultado esperado |
|---|---|
| OOD asignado a `NO_DATA` | `REJECTED` — usar `not_measured` (§1.3) |
| OOD asignado a `humedad_relativa=142` | `SUSPECT_KNOWN` + `OUT_OF_RANGE` (§2.2) |
| OOD asignado sin `notes` | `REJECTED` (TOD-R6) |
| OOD generado por `prediction_id` | `BLOCKED` (TOD-R4) |
| `lectura_desconocida` como `metric_id` | `REJECTED` (§1.1) |
| `metric_id=temperatura_con_humedad` promovido | `REJECTED` (PROMT-3) |
| Bucket OOD "limpiado" al promover | Prohibido (PROMT-1 / TOD-C7) |
| Promoción sin misión de gobernanza | Inválida (TOD-P5) |
| `quality_flag=ok` con `ood_reason` | `BLOCKED` (§1.1) |
| `posicion` sin redacción en OOD | `PARTIAL` (TOD-R8) |

---

# 8. Gates (definidos, NO ejecutados)

| Gate | Condición | Estado |
|---|---|---|
| **G-TO-1** | Sentinela aprobada por misión de gobernanza | `DISENO` |
| **G-TO-2** | `dir_name=desconocido_telemetria` sin colisión | `DISENO` |
| **G-TO-3** | Distinción OOD / `NO_DATA` / anomalía verificada | `DISENO` |
| **G-TO-4** | Criterios TOD-A1..A7 en un lote real | `DISENO` |
| **G-TO-5** | Promoción con misión + bump + `supersedes` | `DISENO` |
| **G-TO-6** | Curación sin pérdida ni subida de estado | `DISENO` |

---

# 9. Cierre

`lectura_desconocida` es la sentinela oficial: veredicto humano de incertidumbre semántica, **no** métrica, **no** `NO_DATA`, **no** anomalía. Se asigna solo tras agotar las 24 métricas y la conversión de unidades; se promociona solo por gobernanza; se rechaza por integridad; se cura sin borrar. Nace **`DISENO`** con **0 lecturas**.

**Estado honesto:** doctrina **`DISENO`**. Sin sentinela materializada, sin lecturas emitidas, sin código, sin sensores, sin IA. Sin modificar la plataforma ni las gobernanzas de audio y visión. Sin commit, push, merge ni tag.

---

*Fin de la política OOD telemétrica. Complementa —nunca sustituye— la gobernanza telemétrica V1, la taxonomía, la política de etiquetado y las políticas OOD de audio y visión.*
