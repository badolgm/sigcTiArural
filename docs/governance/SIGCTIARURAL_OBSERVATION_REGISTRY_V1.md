# REGISTRO OFICIAL DE OBSERVACIONES V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T23:09:16-05:00
> - Origen: misión `SIGCTIARURAL_OBSERVATION_REGISTRY_V1` (documento nuevo)
> - Destino: `docs/governance/SIGCTIARURAL_OBSERVATION_REGISTRY_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: autoridad declarativa sobre la vida completa de una observación. No crea base de datos, API, UI ni código.

**Misión:** `SIGCTIARURAL_OBSERVATION_REGISTRY_V1`
**Naturaleza:** contrato **declarativo y ejecutable**. Establece **quién gobierna** la identidad, la historia y las relaciones de una observación durante **10 años**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Estado:** **OFICIAL — DISEÑADO**. El contrato existe; su materialización requiere misión explícita.
**Conjunto de 3 documentos:** este es el padre.

| Documento | Autoridad |
|---|---|
| `SIGCTIARURAL_OBSERVATION_REGISTRY_V1.md` | Autoridad, 4 IDs, resolución, trazabilidad, auditoría, búsqueda y consumidores |
| `OBSERVATION_REGISTRY_ENTITY_MODEL_V1.md` | Entidades, cardinalidades, relaciones tipadas y máquinas de estado |
| `OBSERVATION_REGISTRY_ROADMAP_V1.md` | Fases, gates, escala 100.000 / 1.000.000 / 10 años y los 30 riesgos |

**Subordinación:** Constitución V1.0.1 → Carta IA V1.0.1 → D-003 → Gobernanza Multimodal V1 → Masterplan V1 → Observation Platform V1 → gobernanzas acústica / visión / telemetría → **este Registry** → documentos especializados.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante de identidad:** **`observation_id` no se modifica**, ni ahora, ni en v2, ni en v3, ni tras migración, curación o cambio de proveedor (OBS-10..OBS-14).
> **Invariante de honestidad:** los **7 estados canónicos** (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`) no se amplían. Ninguna versión, relación ni agregación mejora un estado por decreto.
> **Invariante de veredicto:** los **5 veredictos ACP** (`RESOLVED` · `PARTIAL` · `NO_DATA` · `BLOCKED` · `UNANSWERABLE`) no se amplían.
> **Invariante de no-ejecución:** gobernar no autoriza implementar. Este documento **no es** una base de datos, una API ni una interfaz.

---

# 0. Propósito

El ecosistema ya sabe **describir** (Masterplan), **capturar** (Platform) y **empaquetar** (`ObservationPackage`). Le falta la autoridad que gobierne la **vida completa**: nacimiento, versiones, relaciones, historia, auditoría, búsqueda, entrega a consumidores y preservación a 10 años. Esa autoridad es este Registry.

**Lo que SÍ gobierna:** la identidad de la observación, el ciclo de vida de sus versiones, la resolución de los cinco IDs, la trazabilidad hasta el Knowledge Hub, la auditoría, la búsqueda y las reglas de derivación a datasets futuros.

**Lo que NO hace:**

| No hace | Detalle |
|---|---|
| No implementa código | Ningún `.js`, `.py`, `.jsx`, servicio, esquema SQL ni firmware |
| No crea base de datos | Define contratos; no crea tablas, índices físicos ni motores |
| No crea API | Define resolución **declarativa**, no endpoints ni rutas |
| No crea UI | Define reglas de búsqueda, no pantallas ni formularios |
| No captura ni empaqueta | Eso es de la Platform V1; este registro no la reescribe |
| No decide clasificaciones | No crea `class_id`, `event_type` ni `metric_id` nuevos |
| No escribe en ACP, Ledger ni KH | ACP-3 y KH-1: los consumidores son de solo lectura |
| No cambia `observation_id` | Ni por versión, ni por corrección, ni por migración |
| No modifica los documentos existentes | Platform, Masterplan y gobernanzas quedan intactos |

> Todo lo aquí descrito está en estado **`DISENO`**, salvo los contratos ya ratificados que se citan. Hoy existen **0 observaciones registradas por el Registry**, **0 versiones**, **0 relaciones** y **0 entradas de historia**.

---

# 1. Qué es y qué NO es un Observation Registry

| ✅ ES | ❌ NO ES |
|---|---|
| La **autoridad única** que asigna y custodia `observation_id` (OBS-11). | Un generador de IDs en el dispositivo (prohibido). |
| Un **índice lógico de existencia**: qué observación existe, en qué versión y con qué estado. | Un repositorio de bytes: los assets siguen en `obs_.../`. |
| Un **libro de historia append-only**: cada cambio deja huella con actor, razón y huella previa. | Un log editable, una bitácora que se limpia ni un `git log` reescrito. |
| Un **resolutor determinista** de `observation_id`, `asset_id`, `event_id`, `report_id` y `doc_id`. | Un buscador fuzzy que infiere relaciones por similitud o por fecha. |
| Un **mapa de relaciones tipadas** entre observaciones, assets, eventos, reportes y documentos. | Un grafo que deduce aristas por proximidad de timestamps (TEL-11). |
| Una **vista de lectura** para ACP y KH por `observation_id`. | Un productor de veredictos, evidencia ni conocimiento (ACP-3, KH-2). |
| Un **contrato de preservación** a 10 años con formatos abiertos y huellas. | Un sistema de almacenamiento con foreign keys físicas (OBS-13). |
| Una **gobernanza** aditiva a la Platform V1. | Una sustitución de la Platform, del Masterplan ni de D-003. |

**Frase definitoria:** *el Registry no guarda la evidencia; guarda la** verdad sobre la evidencia**: qué existe, qué cambió, quién lo cambió y cómo se conecta.*

---

# 2. Autoridad sobre `OBSERVATION_ID`

## 2.1 Quién

La autoridad es **el Registry**, entendido como la **función de registro gobernada** —no como un programa—. Hoy esa función existe solo como contrato: **`DISENO`**, sin asignador operativo.

| Rol | Autoridad sobre `observation_id` | Límite |
|---|---|---|
| **Registrar** (autoridad de registro) | **Único** que puede asignar un `observation_id` nuevo (OBS-11). | No puede borrar, renombrar ni fusionar. |
| **Curador** | Puede proponer versiones y correcciones con `supersedes`. | No puede cambiar el ID ni borrar la versión anterior. |
| **Auditor** | Lee historia y verifica huellas. | No escribe; no puede aprobar su propia acción. |
| **ACP / KH** | Solo leen por `observation_id`. | No asignan IDs, no escriben historia (ACP-3, KH-1). |
| **Dispositivo / cliente** | Puede **solicitar** una reserva de secuencia. | **Nunca** genera el ID de forma aislada (OBS-11). |

**Regla de separación:** registrar ≠ auditor. El curador nunca es el único aprobador de su propia cura.

## 2.2 Bajo qué reglas

| ID | Regla de autoridad |
|---|---|
| **RA-1** | El ID se asigna **en el nacimiento** (captura o importación gobernada), nunca después (OB-1). |
| **RA-2** | Un único escritor de la secuencia. En T0 sin conectividad se **reservan bloques** con sincronización diferida; el cliente no inventa IDs (OBS-11). |
| **RA-3** | El ID es **opaco**: ningún consumidor lo descompone para extraer fecha, lugar, modalidad ni versión (OBS-10). Aunque la gramática actual contenga componentes, estos son metadatos de procedencia, no semántica. |
| **RA-4** | No codifica taxonomía, versión, modalidad, hardware, modelo, país ni organización (OB-2, OBS-12). |
| **RA-5** | Nunca se reutiliza, renombra ni fusiona; sobrevive a migración, importación/exportación y cambio de esquema (OB-3, OBS-13). |
| **RA-6** | Crecer (nuevos assets) no cambia el ID (OB-4). Corregir crea versión nueva con el mismo ID (OBS-14). |
| **RA-7** | Toda herencia de v1 declara `legacy_sample_id`; la fila original no se toca (OB-5). |
| **RA-8** | El handoff al dataset ocurre por `delivery_manifest` en `PENDING_ACCEPTANCE`; la UI nunca afirma `accepted` (Platform P7-2). |
| **RA-9** | La autoridad se ejerce por **entradas de historia**: sin entrada, no hubo cambio gobernado. |
| **RA-10** | Esta autoridad es **declarativa hoy**: no hay asignador, cola ni reserva implementados. Cualquier afirmación operativa sería fabricación (P-IA-5). |

---

# 3. Los cuatro identificadores del Registry

## 3.1 Catálogo

| ID solicitado | Prefijo | Naturaleza | Depende de | Estado |
|---|---|---|---|---|
| `OBSERVATION_REGISTRY_ID` | `reg_` | Identidad de la **instancia/época** del registro | gobernanza | **Nuevo, `DISENO`** |
| `OBSERVATION_VERSION_ID` | `obsver_` | Versión inmutable del estado declarativo de una observación | `observation_id` | **Nuevo, `DISENO`** |
| `OBSERVATION_HISTORY_ID` | `obshist_` | Entrada append-only en la historia de una observación | `observation_id` | **Nuevo, `DISENO`** |
| `OBSERVATION_RELATION_ID` | `obsrel_` | Arista **tipada y dirigida** entre entidades gobernadas | entidades existentes | **Nuevo, `DISENO`** |

> **Regla de no-raíz:** ninguno de los cuatro es una raíz de evidencia. El `reg_` identifica la autoridad, no una observación; los otros tres son hijos o vistas de `observation_id`. **`OBSERVATION_ID` sigue siendo la única raíz.**

## 3.2 `OBSERVATION_REGISTRY_ID` — `reg_<YYYYMMDD>_<authority>_<seq3>`

Ejemplo: `reg_20261120_sigct_001`.

| Campo | Obligación | Función |
|---|---|---|
| `registry_id` · `governance_version` | OBLIGATORIAS | Identidad de la época del contrato |
| `authority` · `scope` | OBLIGATORIAS | `sigct` · `observations-v1` |
| `valid_from` · `valid_to` | OBLIGATORIAS | Vigencia; `valid_to` se escribe al cerrar época, nunca se borra |
| `sequence_policy` | OBLIGATORIA | Reserva de bloques T0 con sincronización diferida (RA-2) |
| `state` | OBLIGATORIA | `DISENO` hasta autoridad operativa |

**Regla REG-1:** cambiar de `reg_` (nueva época) **no cambia** ningún `observation_id`: es un relevo de autoridad, no una migración de identidad.
**Regla REG-2:** `reg_` nunca aparece como ancla de ACP ni de KH; el ancla sigue siendo `observation_id` (LLM-1, ACP-1).

## 3.3 `OBSERVATION_VERSION_ID` — `obsver_<observation_id>_<seq4>`

| Campo | Obligación | Función |
|---|---|---|
| `version_id` · `observation_id` | OBLIGATORIAS | Versión y raíz inmutable |
| `seq4` · `supersedes` | OBLIGATORIOS | Cadena append-only; la primera versión declara `supersedes=null` |
| `manifest_sha256` | OBLIGATORIA | Huella del manifiesto canónico de esa versión |
| `asset_ids[]` · `event_ids[]` · `annotation_ids[]` · `evidence_ids[]` · `doc_ids[]` | OBLIGATORIAS | Conjunto visible en esa versión |
| `state_distribution` · `confidence_declared` | OBLIGATORIAS | Termómetro de los 7 estados y confianza `MIN` (MG-5) |
| `valid_from` · `valid_to` · `reason` · `actor` | OBLIGATORIAS | Cuándo, por qué y quién |

**Regla OV-1:** una versión **nunca se reescribe**. Corregir produce `seq4+1` con `supersedes` apuntando a la anterior.
**Regla OV-2:** `valid_to` se **rellena** al cerrar una versión; no es un borrado. La versión anterior sigue resoluble y exportable.
**Regla OV-3:** la versión cambia metadatos y conjuntos referenciados; **los bytes de un asset nunca cambian de versión**: cambian de `asset_id` (AS-2).

## 3.4 `OBSERVATION_HISTORY_ID` — `obshist_<observation_id>_<seq6>`

| Campo | Obligación | Función |
|---|---|---|
| `history_id` · `observation_id` | OBLIGATORIAS | Entrada y raíz |
| `seq6` · `prev_history_sha256` | OBLIGATORIOS | Encadenamiento de huellas; la primera declara `null` |
| `action` | OBLIGATORIO | `CREATED` · `VERSIONED` · `ASSET_ADDED` · `ASSET_MISSING` · `ASSET_CORRECTED` · `ANNOTATION_CURATED` · `EVENT_RETIRED` · `REPORT_BOUND` · `DOC_LINKED` · `REGISTRY_RELAY` · `EXPORTED` |
| `actor_id` · `actor_role` · `at` · `timezone` | OBLIGATORIOS | Autoría verificable |
| `before_version` · `after_version` · `reason` · `evidence_ref[]` | OBLIGATORIOS | Qué cambió y por qué |
| `entry_sha256` | OBLIGATORIA | Integridad de la entrada |

**Regla OH-1:** la historia es **append-only**: no hay `UPDATE`, no hay `DELETE`, no hay "compactación" que descarte entradas.
**Regla OH-2:** un error se corrige con **otra entrada** que lo declara; nunca se tacha la anterior.
**Regla OH-3:** `prev_history_sha256` Rompe cualquier reordenación silenciosa; si no coincide, el veredicto es `BLOCKED`.
**Regla OH-4:** `EXPORTED` también es entrada: exportar no es un acto neutro, cambia el estado de divulgación.

## 3.5 `OBSERVATION_RELATION_ID` — `obsrel_<type>_<seq6>`

| Campo | Obligación | Función |
|---|---|---|
| `relation_id` · `type` | OBLIGATORIOS | Arista tipada |
| `from_id` · `to_id` | OBLIGATORIOS | Entidades existentes (por ID, nunca por copia) |
| `declared_by` · `at` · `timezone` · `reason` | OBLIGATORIOS | Declaración humana o gobernada |
| `state` | OBLIGATORIA | 7 estados canónicos; la relación no mejora estados |
| `supersedes` | OPCIONAL | Solo para relaciones que reemplazan a otra |

**Tipos cerrados:** `BELONGS_TO` · `SUPERSEDES` · `CORRECTS` · `SAME_EVENT_AS` · `EVIDENCE_FOR` · `REPORTED_BY` · `DOCUMENTS` · `DERIVED_INTO` · `CO_OCCURS_WITH` · `PRECEDED_BY`.

**Regla OR-1:** una relación **nunca se infiere** por similitud de fechas, nombres ni vectores: requerimos declaración y `reason` (TEL-11).
**Regla OR-2:** `SAME_EVENT_AS` **debe** pasar por un `event_id` existente; no se declara directamente entre assets.
**Regla OR-3:** `SUPERSEDES`/`CORRECTS` no crean ciclos: si `to_id` ya precede a `from_id`, la relación es `BLOCKED`.
**Regla OR-4:** las relaciones también son inmutables: cambiar una tipos create otra con `supersedes`.

---

# 4. Resolución de los cinco IDs

## 4.1 Contrato de resolución

Resolver es **leer y devolver un estado gobernado**, nunca adivinar. Todo resolutor es determinista, de solo lectura y devuelve: `existe` · `estado_actual` · `version_actual` · `referencias[]` · `veredicto`.

| ID consultado | Resuelve a | Regla de resolución | Si no existe |
|---|---|---|---|
| `observation_id` | Entrada del Registry + versión vigente | Coincidencia exacta; **nunca parseo** (OBS-10) | `NO_DATA` — nunca `NOT_FOUND` silencioso |
| `asset_id` | Exactamente una observación propietaria + `sha256` + cadena de sucesores | AS-5: un asset pertenece a una observación; se referencia por ID desde otras | `NO_DATA` con `asset_missing` si hubo entrada histórica; si nunca existió, `BLOCKED` |
| `event_id` | 1..N `observation_id` + `event_type` + estado del evento | EV-2: el evento cruza observaciones; `lluvia` es `event_type`, no ID | `NO_DATA` / `UNANSWERABLE` si la pregunta depende de un evento no gobernado |
| `report_id` | Veredicto + `anclas[]` + `observation_version_id` consumida | ACP-3: el reporte existe fuera del Registry y **referencia** la observación | `BLOCKED` si no trae `observation_id` (RA-8 / LLM-1) |
| `document_id` (`doc_id`) | Referencia al registry del KH + `observation_refs[]` derivados | KH-3/KH-5: referencia, nunca copia; N:M derivado | `PARTIAL` + `doc_missing`; nunca se fabrica el documento |

## 4.2 Fixtures de resolución

| Consulta | Resultado esperado |
|---|---|
| `asset_id` con dos observaciones propietarias | `BLOCKED` (AS-5 violado) |
| `event_id` resuelto por timestamp cercano sin `event_id` declarado | `BLOCKED` (OR-1) |
| `report_id` sin `observation_id` | `BLOCKED` (LLM-1) |
| `doc_id` que contiene bytes del paquete | `BLOCKED` (KH-3) |
| `observation_id` descompuesto en fecha/seq por el consumidor | `BLOCKED` (OBS-10) |
| `asset_id` ausente pero con `ASSET_MISSING` en historia | `NO_DATA` con historial, **no** silencio |

---

# 5. Trazabilidad completa

## 5.1 Cadena canónica

```
  OBSERVACIÓN            obs_...                    (raíz inmutable)
        │
        ▼
  ASSETS                 audio_ · image_ · video_ · telemetry_ · annotation_
        │                sha256 · modality · state · observation_id
        ▼
  EVENTOS                evt_...                    (cruzan observaciones por event_id)
        │
        ▼
  EVIDENCIA              evidence_id[]              (derivada, hoy vacía)
        │
        ▼
  REPORTES               report_...                 (ACP: veredicto + anclas + MIN)
        │
        ▼
  KNOWLEDGE HUB          doc_id                     (referencia + docsByObservation derivado)
```

## 5.2 Salto por salto

| Salto | ID que cruza | Regla de integridad | Si falla |
|---|---|---|---|
| Observación → Assets | `observation_id` | AS-1/AS-5: cada asset declara su dueño y huella | `BLOCKED` |
| Assets → Eventos | `event_id` | EV-2/EV-3: reconocimiento, no pertenencia; etiquetas ortogonales | `PARTIAL` |
| Eventos → Evidencia | `evidence_id` | Evidencia **derivada**, nunca sube el estado de la señal | `NO_DATA` |
| Evidencia → Reportes | `report_id` | LLM-1/ACP-4: ancla obligatoria, confianza `MIN` | `BLOCKED` |
| Reportes → KH | `doc_id` | KH-2/KH-3: promoción gobernada y referencia, no copia | `PARTIAL` |

**Regla TRZ-1:** la cadena se recorre **hacia adelante** por IDs y **hacia atrás** por las mismas anclas; no hay atajos por fecha, texto ni similitud.
**Regla TRZ-2:** un salto no escrito **no existe**: no se completan eslabones por inferencia.
**Regla TRZ-3:** la trazabilidad es **simétrica en lectura**: desde un `doc_id` se llega a la observación que lo sustenta, y desde la observación a sus documentos (KH-5).

---

# 6. Historia completa sin borrado

| Mecanismo | Función | Garantía |
|---|---|---|
| `OBSERVATION_VERSION_ID` | Cada estado declarativo es una versión nueva. | `supersedes` hacia atrás; la anterior sigue legible. |
| `OBSERVATION_HISTORY_ID` | Cada acción deja una entrada con actor, razón, antes/después y huella encadenada. | Append-only; OH-1/OH-2. |
| `OBSERVATION_RELATION_ID` | Los cambios de vínculo son relaciones nuevas, nunca ediciones. | OR-4. |
| `sha256` por versión y entrada | Detecta reordenación o reescritura. | OH-3 ⇒ `BLOCKED`. |
| Marcadores de retiro | `SUPERSEDED_BY`, `asset_missing`, `valid_to` existen **como datos**. | Nadie necesita borrar para corregir. |
| Formatos abiertos y manifiestos | Migración sin foreign keys físicas (OBS-13, MP-13). | 10 años sin refactorizar IDs. |

**Regla PRES-1:** no existe operación `DELETE` en el contrato. Lo que antes se borraba ahora se marca con una entrada y se conserva.
**Regla PRES-2:** los datos sensibles se **redactan en la vista**, nunca se eliminan del registro original (POS-2/3, P3-3).
**Regla PRES-3:** una exportación no vacía el registro: genera entrada `EXPORTED` y deja el original intacto.
**Regla PRES-4:** "limpiar" historia para ahorrar espacio es `BLOCKED`; el ahorro se logra con capas frías y manifiestos, no con pérdida (B-20).

---

# 7. Versionamiento

## 7.1 Tres ejes ortogonales

| Eje | Cambia | No cambia |
|---|---|---|
| **Versión de observación** (`obsver_`) | Metadatos, conjuntos referenciados, distribución de estados | `observation_id`, bytes de assets |
| **Identidad de asset** (`asset_id`) | Bytes, formato, huella | Dueño: la observación (AS-2/AS-5) |
| **Época del registro** (`reg_`) | Autoridad, política de secuencias, gobernanza | Ningún `observation_id` (REG-1) |

## 7.2 Reglas de bump

| ID | Regla |
|---|---|
| VER-1 | Toda versión nueva incrementa `seq4` y declara `supersedes`; nunca se sobrescribe `seq4` anterior. |
| VER-2 | `taxonomy_version`, `governance_version` y `schema_version` son campos **declarados**, no codificados en el ID (OBS-10/12). |
| VER-3 | Un bump de taxonomía (audio v1→v2→v3) **no** crea una nueva observación: crea versión con crosswalk y `legacy_sample_id`. |
| VER-4 | La versión vigente se resuelve por `supersedes` + `valid_from/valid_to`; **nunca** por "la última fila". |
| VER-5 | Versiones hermanas (migración de almacenamiento) mantienen la misma raíz y distinta huella; ambas se conservan. |
| VER-6 | Ninguna versión cambia un estado a mejor: hereda distribución y aplica degradación conservadora (MG-5). |

---

# 8. Qué ocurre en cinco escenarios

| Escenario | Acción gobernada | ID que cambia | ID que NO cambia | Reglas |
|---|---|---|---|---|
| **Una observación cambia** | Nueva versión con `supersedes`, entrada `VERSIONED`, paquete resealado | `obsver_`, `obshist_` | `observation_id` | VER-1, OBS-14, PL-5 |
| **Un asset desaparece** | Entrada `ASSET_MISSING`; referencia y huella conservadas; estado degrada, nunca se inventa reemplazo | `obshist_`, `obsver_` | `observation_id`, `asset_id` original | OH-1, MG-5, R-07 |
| **Un asset es corregido** | Nuevo `asset_id` con `sha256` propia; relación `CORRECTS`; versión nueva; original intacto | `asset_id`, `obsrel_`, `obsver_`, `obshist_` | `observation_id`, asset original | AS-2, OR-3, PRES-1 |
| **Una anotación es curada** | Nuevo `annotation_id` con `supersedes`; `ood_origin` preservado; κ sigue `PENDING` si no hay pares | `annotation_id`, `obsrel_`, `obshist_` | `observation_id`, anotación original | CU-3, KAPT-1, CURT-4 |
| **Un evento es retirado** | Marcado `SUPERSEDED_BY` con otro `event_id`; relación `PRECEDED_BY`; observaciones intactas | `obsrel_`, `obshist_` | `observation_id`, `event_id` retirado | EV-5, OR-4 |

> En los cinco casos la respuesta es la misma: **se añade, no se reemplaza**. Ningún escenario autoriza borrado, reescritura ni cambio de raíz.

---

# 9. Reglas de auditoría

| ID | Regla |
|---|---|
| AUD-1 | Toda entrada lleva `actor_id`, `actor_role`, `at`, `timezone`, `reason`, `before`, `after` y `entry_sha256`. |
| AUD-2 | La historia se encadena por `prev_history_sha256`; huella rota ⇒ `BLOCKED`. |
| AUD-3 | Registrar ≠ auditor; el curador no aprueba su propia cura en solitario. |
| AUD-4 | Auditar es **solo lectura**: el auditor no corrige, no cierra versiones ni retira eventos. |
| AUD-5 | Toda correlación se audita por `event_id`; una relate sin `reason` es `BLOCKED` (OR-1). |
| AUD-6 | Toda exportación produce entrada `EXPORTED` con destino y huella (PRES-3). |
| AUD-7 | Los veredictos de auditoría usan los 5 canónicos; no se inventa `AUDIT_OK` ni `CLEAN`. |
| AUD-8 | La auditoría verifica que la versión vigente coincide con `supersedes`, no con "la última fila" (VER-4). |
| AUD-9 | Se conservan huellas y manifiestos aunque el almacenamiento cambie (OBS-13). |
| AUD-10 | Un hallazgo se corrige con nueva entrada; cerrar un hallazgo **nunca** borra el hallazgo. |
| AUD-11 | La auditoría puede reconstruir el estado en cualquier fecha usando `valid_from/valid_to`, sin consultar un sistema externo. |
| AUD-12 | Retención mínima declarada: **10 años**; sin compactación destructiva (MP-13). |

---

# 10. Reglas de búsqueda

## 10.1 Contrato

| ID | Regla |
|---|---|
| SRCH-1 | La búsqueda es **de solo lectura** y devuelve IDs + estado + versión + veredicto, nunca bytes por defecto. |
| SRCH-2 | Coincidencia **exacta** por ID; está prohibido `LIKE`, prefijo, fuzzy ni inferencia (OBS-10). |
| SRCH-3 | Toda búsqueda temporal exige rango **y `timezone`**; una fecha sin zona es `BLOCKED`. |
| SRCH-4 | `domain` es un **facet declarado**, no texto libre: `domain.modality` · `domain.telemetry_domain_id` · `domain.scene_id` · `domain.kh_category`. |
| SRCH-5 | No se infiere dominio desde `class_id`, `event_type` ni similitud de nombres. |
| SRCH-6 | Los IDs se tratan como cadenas opacas: no se descomponen ni se ordenan por su texto. |
| SRCH-7 | Un resultado vacío es `NO_DATA` **governed**, nunca error silencioso ni lista inventada. |
| SRCH-8 | Toda consulta registra `query_id` lógico en historia solo si es exportada; consultar no muta (OH-4). |
| SRCH-9 | Los resultados respetan redacción: `posicion` y personas sin consentimiento se omiten en vistas hacia ACP/KH (P3-3, POS-2). |
| SRCH-10 | La búsqueda nunca cruza estados: filtrar `REAL` no devuelve `SIM`, `REF` ni `DISENO`. |

## 10.2 Ejemplos obligatorios

| # | Consulta | Nota |
|---|---|---|
| 1 | `observation_id = obs_20261120_invernadero01_0001` | Exacta; sin parseo del texto. |
| 2 | `asset_id = audio_20261120_180207_000` | Devuelve su única observación propietaria (AS-5). |
| 3 | `event_id = evt_20261120_campo07_0002` | Devuelve 1..N observaciones; `lluvia` sería `event_type`, no este ID. |
| 4 | `captured_at >= 2026-11-20T00:00:00-05:00 AND captured_at < 2026-11-21T00:00:00-05:00` | Rango con zona; sin zona ⇒ `BLOCKED`. |
| 5 | `domain.modality = TELEMETRY AND domain.telemetry_domain_id = AMBIENTAL` | Facet declarado; no se adivina desde `metric_id`. |
| 6 | `session_id = ses_20261120` | Procedencia; devuelve observaciones, no assets sueltos. |
| 7 | `place_id = campo_01` | Procedencia; en urbanos aplica redacción (SRCH-9). |

**Formato de respuesta (contrato):** `{ observation_id, version_id, state_distribution, confidence, matched_by, related_ids[], verdict }`. Un `NO_DATA` es una respuesta válida con `matched_by` y razón.

---

# 11. Cómo consume el ACP

| ID | Regla |
|---|---|
| ACR-1 | El ACP lee **Registry → Evidence Ledger → KH registry**, en ese orden (ACP-2). |
| ACR-2 | Toda afirmación factual lleva `observation_id` como ancla; sin ancla se descarta (ACP-1, LLM-1). |
| ACR-3 | El ACP resuelve la **versión vigente** por `supersedes`; nunca usa "la última fila" (VER-4). |
| ACR-4 | Confianza = `MIN` de anclas × cobertura × penalidad por estado no-`REAL`; el ACP nunca la sube (ACP-4). |
| ACR-5 | Veredictos permitidos: los 5 canónicos. `NO_DATA` jamás se rellena con inferencia (ACP-5/7). |
| ACR-6 | El ACP **no escribe** en Registry, Ledger ni KH: produce `report_id` con `anclas[]` (ACP-3). |
| ACR-7 | El reporte referencia `observation_version_id`; si la observación cambia con posterioridad, el reporte antiguo sigue anclado a su versión. |
| ACR-8 | Personas sin consentimiento ⇒ bloque omitido y `PARTIAL` (ACP-6). |
| ACR-9 | Si la pregunta exige una métrica/clase fuera de las taxonomías, el veredicto es `UNANSWERABLE`, no una invención. |
| ACR-10 | Hoy el ACP **no consume nada**: es consumidor futuro bajo misión y gates propios (ACP-8). |

---

# 12. Cómo consume el Knowledge Hub

| ID | Regla |
|---|---|
| KHR-1 | `docsByObservation(observation_id)` se **deriva por lectura** del Registry: fuente única, sin doble escritura (KH-1, MP-8). |
| KHR-2 | `doc_id` es una referencia al registry documental, nunca una copia del paquete (KH-3, AS-3). |
| KHR-3 | Relación N:M derivada: una observación sustenta muchos documentos y un documento muchas observaciones (KH-5). |
| KHR-4 | Al regenerar el registry, los documentos declaran `observation_refs[]` derivados (KH-4). |
| KHR-5 | La existencia de un paquete **no** convierte evidencia en conocimiento: hace falta promoción gobernada (KH-2). |
| KHR-6 | El KH muestra la distribución real de los 7 estados; jamás presenta `DISENO` como `REAL` (KH-6). |
| KHR-7 | El KH **no escribe** en el Registry. Si necesita corregir un vínculo, propone una relación `obsrel_` con `reason`. |
| KHR-8 | Los conflictos documentales se resuelven por **D-003**, no por el Registry (subordinación). |

---

# 13. Cómo derivan datasets futuros sin romper el histórico

| ID | Regla |
|---|---|
| DS-1 | Un dataset es una **proyección de solo lectura** del Registry por selectores declarados: `observation_id[]`, `state`, `source_tier`, `license`, `session_id`, `place_id`, `taxonomy_version`. |
| DS-2 | Cada fila derivada lleva `source_observation_id`, `source_asset_id`, `source_version_id` y `delivery_manifest` con `PENDING_ACCEPTANCE`; nunca copia la raíz. |
| DS-3 | La derivación **no escribe** en `obs_.../` ni en el dataset acústico v1 (CO-1..6). |
| DS-4 | Los splits se registran por `observation_id` y por `session_id`/`place_id`, para evitar fuga de sesión; la versión de origen queda en el manifiesto. |
| DS-5 | Un bump de taxonomía produce **otra proyección** con crosswalk; el dataset anterior no se reescribe (VER-3). |
| DS-6 | La herencia v1 conserva `legacy_sample_id`; la fila acústica original sigue intacta, con sus 7 muestras y su `sha256` (OB-5, MIG-1). |
| DS-7 | Re-derivar con los mismos selectores y manifiestos debe dar el mismo conjunto; si no, el veredicto es `BLOCKED`. |
| DS-8 | Los datos `REF` (T2) nunca entran en splits propios; `SIM` nunca se mezcla con `REAL` (TG-10, TEL-8). |
| DS-9 | El Registry **no es** el dataset: si un asset se corrige, el dataset antiguo queda como evidencia histórica y se deriva uno nuevo (AS-2, PRES-1). |
| DS-10 | Ninguna proyección autoriza IA, entrenamiento ni inferencia: eso requiere misión y gobernanza propias. |

---

# 14. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado |
|---|---|---|
| **G-OR-1** | 3 documentos visibles con D-004.6 | `DISENO` |
| **G-OR-2** | 4 identificadores definidos, ninguno raíz | `DISENO` |
| **G-OR-3** | Autoridad única y reserva de secuencia T0 declarada | `DISENO` |
| **G-OR-4** | 5 IDs resolubles con fixtures de rechazo | `DISENO` |
| **G-OR-5** | Cadena observation→assets→eventos→evidencia→reportes→KH verificable | `DISENO` |
| **G-OR-6** | Historia append-only con huella encadenada | `DISENO` |
| **G-OR-7** | 5 escenarios gobernados sin borrado | `DISENO` |
| **G-OR-8** | 7 búsquedas obligatorias y `timezone` exigido | `DISENO` |
| **G-OR-9** | ACP/KH de solo lectura y datasets por proyección | `DISENO` |
| **G-OR-10** | Escala 100.000 / 1.000.000 / 10 años sin cambiar IDs | `DISENO` |

---

# 15. Cierre

**Criterio de éxito:** obtener la autoridad única capaz de gobernar **100.000 observaciones**, **1.000.000 de assets** y **10 años de historia** **sin modificar `observation_id`**. Se satisface en el plano contractual: la raíz es opaca, la autoridad es única, la historia es append-only y todo cambio se expresa con `supersedes`, alias, manifiestos y relaciones tipadas. La verificación operativa de esa escala pertenece al roadmap y permanece `DISENO`.

**Estado honesto:** **OFICIAL y DISEÑADO**. Sin base de datos, API, UI, código,Captura ni IA. Sin modificar la Platform, el Masterplan, la gobernanza multimodal ni las de audio, visión y telemetría. Sin commit, push, merge ni tag. Los 10 gates permanecen abiertos.

---

*Fin del registro oficial de observaciones. Complementa —nunca sustituye— la Observation Platform V1, el Masterplan V1, la gobernanza multimodal V1, la Carta IA, la Constitución y D-003.*
