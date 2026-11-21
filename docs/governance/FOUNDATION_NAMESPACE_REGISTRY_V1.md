# REGISTRO OFICIAL DE NAMESPACES DEL FOUNDATION STACK V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T12:12:00-05:00
> - Origen: misión `SIGCTIARURAL_FOUNDATION_REMEDIATION_V1` (documento nuevo)
> - Destino: `docs/governance/FOUNDATION_NAMESPACE_REGISTRY_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: registro de **resolución de colisiones**, subordinado a los 10 documentos auditados. No es gobernanza nueva, no crea IDs de dominio, taxonomías ni modalidades.

**Complemento de:** `SIGCTIARURAL_FOUNDATION_REMEDIATION_V1.md`
**Fecha:** 2026-11-21 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Objetivo (R2):** garantizar **un significado único por prefijo** y **un significado único por código** dentro de `FOUNDATION STACK CANONICAL BASELINE V1`.

> **Regla de oro:** el registro **desambigua** lo ya escrito. No inventa prefijos, no renombra entidades y no borra alias históricos. Donde una resolución requiere cambiar un documento, queda como recomendación con `supersedes`, no como edición ejecutada.

---

# 1. Registro de prefijos

| Prefijo | Significado único | Dueño | Capa | Estado | Nota |
|---|---|---|---|---|---|
| `obs_` | Identificador de la **observación raíz** | Multimodal V1 → Registry V1 | Raíz | VIGENTE | Ningún otro prefijo puede emitirlo. |
| `obsver_` | Versión inmutable de una observación | Registry V1 | Registry | VIGENTE | Hija de `obs_`. |
| `obshist_` | Entrada de historia de una observación | Registry V1 | Registry | VIGENTE | Hija de `obs_`. |
| `obsrel_` | Relación tipada entre observaciones | Registry V1 | Registry | VIGENTE | Hija de `obs_`. |
| `audio_` | Asset de audio observado | Multimodal V1 §3.2 / Acoustic V2 | Dominio | VIGENTE | Puente `legacy_sample_id` pendiente (H-01, fuera de alcance). |
| `image_` | Asset de imagen observada | Multimodal V1 §3.2 / Visión V1 | Dominio | VIGENTE | — |
| `video_` | Asset contenedor de video observado | Multimodal V1 §3.2 / Visión V1 | Dominio | VIGENTE | — |
| `telemetry_` | Asset telemétrico observado | Multimodal V1 §3.2 / Telemetría V1 | Dominio | VIGENTE | — |
| `doc_` | **`DOC_ID` del Knowledge Hub**: conocimiento promovido | KH V1 | KH | VIGENTE | Resolución de H-04. El asset documental **no** usa este prefijo. |
| `evt_` | **`EVENT_ID`**: ocurrencia real | Multimodal V1 §3.3 | Dominio | VIGENTE | Resolución de H-05. `VISUAL_EVENT_ID` no es ID propio. |
| `evd_` | Evidencia derivada de una observación | Ledger V1 | Ledger | VIGENTE | Hija de `obs_`; no es raíz. |
| `evdver_` | Versión append-only de evidencia | Ledger V1 | Ledger | VIGENTE | Hija de `evd_`. |
| `evdchain_` | Cadena de custodia de evidencia | Ledger V1 | Ledger | VIGENTE | Hija de `evd_`. |
| `evdrel_` | Relación tipada de evidencia | Ledger V1 | Ledger | VIGENTE | Hija de `evd_`. |
| `acps_` | Sesión de interacción del ACP | ACP Entity Model | ACP | VIGENTE | No sustenta evidencia. |
| `acpq_` | Pregunta del ACP | ACP Entity Model | ACP | VIGENTE | No es ocurrencia. |
| `acpt_` | Decisión/traza del ACP | ACP Entity Model | ACP | VIGENTE | Append-only. |
| `acprep_` | **Materialización física** del reporte ACP | ACP Entity Model | ACP | VIGENTE | Resolución de H-06: equivale a `report_id`. |
| `report_` | **Identificador lógico** del reporte ACP | Carta IA C-5 → Platform ACP-3 | ACP | VIGENTE | Un solo productor: ACP. |
| `docprom_` | Registro de promoción del KH | KH V1 | KH | VIGENTE | Anterior a `doc_`. |

**Garantía NSP-01:** 20 prefijos, 20 significados, un dueño por prefijo. No hay prefijo con doble dueño en la baseline V1.

---

# 2. Registro de códigos

| Código | Significado único | Dueño | Calificación | Nota |
|---|---|---|---|---|
| `ND-2` | **`NO_DATA` no se imputa**: prohibido rellenarlo con inferencia, promedio, vecindario o modelo | ACP + telemetría + KH | GLOBAL | Resolución de H-13. |
| `ND-4` | Un `NO_DATA` no degrada automáticamente la observación | Telemetría V1 | TELEMETRIA | Código ya existente; sustituye al uso local de `ND-2`. |
| `C-5` | Calificación obligatoria en dos contextos (ver §3.3) | Carta IA / Freeze | CALIFICADO | `IA:C-5` y `DOC:C-5`. |
| `R-01` | Calificación obligatoria por capa (ver §3.4) | 4 roadmaps | CALIFICADO | `REG-R-01` · `LED-R-01` · `ACP-R-01` · `KH-R-01`. |
| `ACP-3` | ACP no escribe en Ledger ni KH; produce `report_id` | Platform V1 | PLATFORM | Referencia a `IA:C-5`. |
| `MP-8` | Fuente única, vistas derivadas | Masterplan V1 | MASTERPLAN | Equivalente a `MG-7`. |
| `MG-7` | Fuente única, índices derivados | Multimodal V1 | MULTIMODAL | Equivalente a `MP-8`. |
| `F3E-9` | ACP propone · Ledger guarda · KH canóniza por gobernanza | F3E legacy | REFERENCE_ONLY | Bajo D-003; canonización pendiente (H-08). |
| `OBS-10..14` | Raíz inmutable, 10 años sin refactor | Masterplan V1 | MASTERPLAN | No se reabre. |
| `ANC-3` | Toda respuesta ACP lleva ancla `observation_id` | ACP V1 | ACP | Sin ancla ⇒ `NO_DATA`. |
| `REP-8` | Reporte sin `evidence_version_ids[]` es `PARTIAL` | Ledger V1 | LEDGER | Regla de trazabilidad. |
| `ATR-13` | Retroceso posible desde `doc_id` hasta la observación | ACP Entity Model | ACP | Sin doble escritura. |
| `KCN-14` | KH no crea `OBSERVATION_ID` | KH V1 | KH | Salida `obs_` ⇒ `BLOCKED`. |
| `KEL-1` | KH solo lee el Ledger | Ledger V1 / KH V1 | KH | Salida `evd_` ⇒ `BLOCKED`. |

**Garantía:** todo código citado en la baseline V1 tiene un único significado **después de calificación**. Los usos sin calificar se leen como `LEGACY_ALIAS` y se preservan.

---

# 3. Resolución de colisiones

## 3.1 `doc_` — doble dueño (H-04)

| Antes | Después |
|---|---|
| `ASSET_ID` documental (bytes + `sha256`) y `DOC_ID` del KH compartían prefijo. | `doc_` = solo `DOC_ID`. El asset documental **no recibe prefijo nuevo**: se representa como asset de una modalidad ya ratificada, o queda fuera del stack hasta decisión futura. |

**Preservación:** las apariciones históricas de `doc_` como asset se marcan `LEGACY_ALIAS`; no se borra texto.

## 3.2 `evt_` — doble dueño (H-05)

| Antes | Después |
|---|---|
| `EVENT_ID` y `VISUAL_EVENT_ID` usaban `evt_`. | `evt_` = solo `EVENT_ID`. La vista visual es un campo derivado (`event_id` + `view=visual`), sin ID propio. |

## 3.3 `C-5` — dos dominios (H-14)

| Calificación | Significado | Fuente |
|---|---|---|
| `IA:C-5` | Provocar el registro de evidencia vía productor gobernado; LLM/ACP no es autor de hechos | Carta IA `:85` |
| `DOC:C-5` | Estatus de 3 diagramas en el freeze arquitectónico | `ARCHITECTURE_FREEZE_CLOSURE_REVIEW.md:24` |

Platform `:484` se lee como `IA:C-5`. No se crea un código nuevo: se califica el existente.

## 3.4 `R-01` — cuatro significados (H-15)

| Calificación | Significado | Fuente |
|---|---|---|
| `REG-R-01` | Autoridad duplicada: dispositivo genera `observation_id` | Registry roadmap `:188` |
| `LED-R-01` | ACP crea evidencia | Ledger roadmap `:197` |
| `ACP-R-01` | Riesgo ACP equivalente (verificado en el roadmap ACP) | ACP roadmap |
| `KH-R-01` | KH crea `OBSERVATION_ID` | KH roadmap `:176` |

## 3.5 `ND-2` — dos obligaciones (H-13)

`ND-2` conserva el significado global (no imputar). La regla de telemetría se lee como `ND-4`, código ya presente en ese documento. No se crea un código nuevo.

## 3.6 `report_` / `acprep_` — triple denominación (H-06)

| Nivel | Forma | Dueño |
|---|---|---|
| Lógico | `report_id` (`report_`) | Carta IA C-5 / Platform ACP-3 |
| Físico | `acprep_` | ACP Entity Model |
| Narrativo | "reporte ACP" | Texto corriente |

**Un reporte · dos representaciones · un productor (ACP) · un consumidor (KH).**

---

# 4. Reglas redundantes: fuente única por invariante

| Invariante | Fuente única | Referencias derivadas (se leen, no se editan) |
|---|---|---|
| `OBSERVATION_ID` es raíz única | Multimodal V1 OB-1..5 + Masterplan OBS-10..14 | Platform §7 · Registry RA-3 · Ledger §1 · ACP ANC-3 · KH KCN-14 |
| Fuente única, vistas derivadas | Masterplan `MP-8` | Multimodal `MG-7` · KH `KH-1`, `KHR-*`, `KEL-*`, `KHA-*`, `KCN-*` |
| ACP no crea evidencia | Platform `ACP-3` + Ledger `R-01` | ACP `CR-3`, `ACS-3` · Carta `IA:C-5` |
| KH no crea evidencia ni raíz | KH `KCN-14` + `KEL-1` | Ledger `KEL-1` · roadmap KH `R-01`/`R-02` |
| `NO_DATA` no se imputa | ACP `ND-2` | Telemetría `ND-4` · KH `VIEW-3` · roadmap KH `R-17` |
| Promoción por gobernanza | F3E-9 (REFERENCE_ONLY) | Platform `KH-2` · KH `KPR-*` · `docprom_` |

**Total rastreado:** 49 declaraciones redundantes, 6 invariantes, 6 fuentes única. Ninguna declaración se elimina: todas pasan a ser **referencias por lectura**.

---

# 5. Reglas de interpretación obligatoria

1. **Ledger §4:** donde diga "cuatro identificadores raíz", léase **"cuatro identificadores derivados de la raíz"**. El cuerpo del documento (`EVIDENCE_ID` como hija) prevalece sobre el rótulo.
2. **Masterplan §3.1:** "independientes" significa **independientes en su ciclo de vida, nunca en su ancla**. Todo `report_id` referencia ≥1 `observation_id`.
3. **Visión `VISUAL_EVENT_ID`:** es una **vista**, no una entidad con ID propio.
4. **Jerarquía D-003:** si dos reglas calificadas entran en conflicto, prevalece la de mayor rango documental.

---

# 6. Cierre

**Garantía cumplida en la baseline V1:** 20 prefijos con significado único · 14 códigos con significado único tras calificación · 6 colisiones resueltas · 49 reglas redundantes reconducidas a 6 fuentes únicas. Ningún prefijo, código, ID, taxonomía ni modalidad nuevo fue creado. Ningún documento existente fue modificado. Sin `git add`, `commit`, `push`, `merge` ni `tag`.

**Estado honesto:** registro **OFICIAL de resolución**, no gobernanza nueva. Las correcciones textuales que requieran `supersedes` quedan recomendadas, no ejecutadas.

---

*Fin del registro de namespaces del Foundation Stack V1. Complementa la remediación y preserva íntegramente los documentos auditados.*
