# ANÁLISIS DE BRECHAS DEL FOUNDATION STACK V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T00:28:00-05:00
> - Origen: misión `SIGCTIARURAL_FOUNDATION_AUDIT_V1` (documento nuevo)
> - Destino: `docs/governance/FOUNDATION_GAP_ANALYSIS_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: análisis de solo lectura. No modifica documentos, no crea gobernanza, IDs ni taxonomías. No implementa código.

**Misión:** `SIGCTIARURAL_FOUNDATION_AUDIT_V1`
**Complemento de:** `docs/governance/SIGCTIARURAL_FOUNDATION_AUDIT_V1.md` y `FOUNDATION_DEPENDENCY_MAP_V1.md`
**Fecha:** 2026-11-21 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Convención de severidad:** 🔴 bloqueante para implementación · 🟡 alto · 🟢 observación no bloqueante.

> **Regla:** cada hallazgo propone una **recomendación**, no una corrección. Toda corrección futura requiere misión explícita, nueva versión y `supersedes` (KOB-2, KREG-1). Ningún ID de hallazgo crea gobernanza: `H-01..H-20` y `AR-01..AR-10` son **etiquetas de auditoría**, no identificadores de dominio.

---

# 1. Los 20 hallazgos más importantes

## 1.1 Raíz y contrato de identificadores

### H-01 · Audio sin raíz nativa 🔴
- **Documento afectado:** `docs/acoustic/README.md` y los 6 documentos de `docs/acoustic/` (Acoustic Governance V2).
- **Hecho:** 0 menciones de `observation_id` en `docs/acoustic/*.md`. El dominio opera con `sample_id` / `class_id` del dataset v1. El puente se declara **fuera** de la gobernanza acústica, en `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1.md:349` (`legacy_sample_id`).
- **Riesgo:** la primera flecha `OBSERVACIÓN → EVIDENCIA` no puede ejecutarse desde S30 sin una envoltura no materializada; el foundation stack queda desconectado de su productor de señal real.
- **Recomendación:** declarar, en una nueva versión de la gobernanza acústica, el mapeo `sample_id → legacy_sample_id → observation_id` como **envoltura de solo lectura**, sin reescribir el dataset ni los clips.

### H-02 · "Independencia" de `MODEL_ID` / `REPORT_ID` en el Masterplan 🟡
- **Documento afectado:** `SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md:108`.
- **Hecho:** el texto afirma que `MODEL_ID` y `REPORT_ID` "pueden existir de forma independiente", matizando la frase inmediatamente con "siempre referencian observaciones".
- **Riesgo:** lectura literal permite entidades sin ancla; contradice ANC-3 del ACP y REP-8 del Ledger (reporte sin anclas ⇒ `PARTIAL`).
- **Recomendación:** precisar en versión posterior "independientes en su ciclo de vida, **nunca** en su ancla": todo `report_id` exige ≥1 `observation_id`, y `MODEL_ID` referencia pero no sustituye.

### H-03 · Ledger §4 rotula "cuatro identificadores raíz" 🔴
- **Documento afectado:** `SIGCTIARURAL_EVIDENCE_LEDGER_V1.md:221`.
- **Hecho:** el encabezado dice "Relación entre los cuatro identificadores raíz" y el diagrama muestra a `EVIDENCE_ID` como hija, aunque la regla `:107` declara que ninguno de sus 4 IDs es raíz.
- **Riesgo:** un implementador puede inferir una segunda raíz (`EVIDENCE_ID`) y romper la invariante fundacional.
- **Recomendación:** corregir el rótulo a "cuatro identificadores **derivados** de la raíz" en una nueva versión con `supersedes`; no editar el cuerpo ya canónico.

### H-04 · Colisión de prefijo `doc_` 🔴
- **Documentos afectados:** Multimodal V1 §3.2 y KH V1 `:111`.
- **Hecho:** `doc_` identifica tanto un `ASSET_ID` documental (bytes observados, con `sha256`) como un `DOC_ID` del KH (conocimiento promovido). Dos dueños, dos semánticas.
- **Riesgo:** ambigüedad irreversible en almacenamiento y en trazabilidad: no se puede distinguir un archivo observado de un documento canónico por su ID.
- **Recomendación:** asignar un prefijo propio al asset documental (p. ej. `file_`) o al `DOC_ID` (p. ej. `kdoc_`) mediante nueva versión con tabla de migración; **no** reutilizar ninguno sin `supersedes`.

### H-05 · Colisión de prefijo `evt_` 🔴
- **Documentos afectados:** Multimodal V1 §3.3 y Visión V1 `:91`.
- **Hecho:** `EVENT_ID` usa `evt_<YYYYMMDD>_<place_id>_<seq4>`; `VISUAL_EVENT_ID` usa `evt_` como "vista" y declara no ser raíz nueva.
- **Riesgo:** dos entidades indistinguibles por prefijo; una vista puede interpretarse como ocurrencia real y viceversa.
- **Recomendación:** declarar `VISUAL_EVENT_ID` como **proyección derivada** con prefijo propio (p. ej. `vevt_`) o como campo sin ID propio; preservar `evt_` exclusivamente para `EVENT_ID`.

### H-06 · Triple denominación de `report_id` 🟡
- **Documentos afectados:** Carta IA C-5 (`:85`), Platform ACP-3 (`:484`), ACP entity model (`:28,82`).
- **Hecho:** el mismo eslabón se denomina `report_id`, `acprep_` y "reporte ACP" con tres dueños declarados; no hay tabla de equivalencia.
- **Riesgo:** un reporte puede emitirse con un prefijo y validarse con otro; la trazabilidad REP-8 se rompe.
- **Recomendación:** publicar una tabla de equivalencia contractual en nueva versión: `report_id` = identificador lógico; `acprep_` = su materialización en el ACP; un único productor (ACP) y un único consumidor (KH).

## 1.2 Ciclos y gobernanza

### H-07 · Ciclo declarativo ACP ↔ KH 🔴
- **Documentos afectados:** Platform `:483-484` y ACP `KHA-1..10` (`:406-409`).
- **Hecho:** ACP-2 lee `Registry → Ledger → KH registry`; simultáneamente, el KH requiere el `report_id` del ACP para promover. No hay frontera de snapshot.
- **Riesgo:** el ACP lee el estado del KH que él mismo contribuye a alimentar; resultados no reproducibles por dependencia temporal oculta.
- **Recomendación:** declarar una frontera explícita: ACP lee KH a `T0` (snapshot inmutable) y emite candidato en `T1`; o excluir el KH registry del orden de lectura del ACP y dejarlo solo como destino.

### H-08 · Clasificación de Mapa Maestro y F3E fuera de D-003 🟡
- **Documentos afectados:** `AGENTS.md`, `MAPA_MAESTRO_ECOSISTEMA_SIGCT_RURAL_V1.md`, `CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md`.
- **Hecho:** `AGENTS.md` declara al Mapa Maestro "documento canónico de navegación"; el registro maestro de esta auditoría lo clasifica `REFERENCE_ONLY`. F3E (bajo `Documentacion/`, nivel 6) define la regla de promoción F3E-9.
- **Riesgo:** conflicto de autoridad documental y dependencia de una regla canónica respecto de un documento legacy.
- **Recomendación:** bajo D-003, reconciliar la clasificación del Mapa Maestro (canonizar o reclasificar explícitamente) y trasladar F3E-9 a `docs/` con `supersedes`.

### H-09 · 49 reglas redundantes 🟡
- **Documentos afectados:** KH (`KH-1..6`, `KHR-1..8`, `KEL-1..10`, `KHA-1..10`, `KCN-1..15`) y equivalentes en Masterplan/Platform.
- **Hecho:** las mismas cuatro invariantes se restatean 49 veces con prefijos distintos; `MP-8` y `MG-7` duplican "fuente única", `ACP-3` y `CR-3` duplican "ACP no escribe".
- **Riesgo:** divergencia futura por mantenimiento: una corrección en una familia no se propaga a las otras.
- **Recomendación:** designar una **fuente única por invariante** y convertir las otras apariciones en referencias explícitas, sin borrar ninguna (preservación).

### H-10 · Stack sin instancia 🔴
- **Documentos afectados:** los 10 auditados + sus 4 roadmaps/modelos de entidad.
- **Hecho:** 0 observaciones, 0 evidencias, 0 reportes, 0 promociones; gates 0/9 en ACP y KH, 0 en Registry y Ledger.
- **Riesgo:** la coherencia está demostrada solo en papel; ningún verificador ha ejercitado la cadena completa.
- **Recomendación:** ejecutar un recorrido extremo a extremo real (1 observación → 1 evidencia → 1 reporte → 1 promoción) con fixtures de rechazo, bajo misión y gates propios, antes de cualquier implementación productiva.

### H-11 · `SUPERSEDED` / `RETIRED` nunca ejercitados 🟢
- **Documentos afectados:** KH V1 (modelo de obsolescencia) y registro maestro de 30 filas.
- **Hecho:** 0 documentos con esos estados; no hay `superseded_by` ni `retired_on` declarados en el corpus auditado.
- **Riesgo:** el mecanismo de corrección gobernada existe pero nunca se ha probado; una futura corrección podría hacerse por edición silenciosa.
- **Recomendación:** en la primera corrección real, usar `supersedes` y ejercitar el estado `SUPERSEDED` como prueba del mecanismo.

## 1.3 Colisiones de códigos y superficie de mantenimiento

### H-12 · 9 de 10 documentos sin versionar 🔴
- **Documento afectado:** todos salvo `docs/acoustic/README.md`.
- **Hecho:** `git ls-files` confirma `UNTRACKED` para los 9 restantes (governance ×7, vision ×1, telemetry ×1).
- **Riesgo:** la autoridad canónica no tiene procedencia Git: no hay hash, fecha de commit ni recuperación; contradice la política de `docs/` como único source of truth.
- **Recomendación:** versionar los 9 documentos sin reescribir su contenido, en una misión de gobernanza explícita (sin `git add` en esta auditoría).

### H-13 · `ND-2` con semánticas divergentes 🟡
- **Documentos afectados:** ACP `:341` y Telemetría `:268`.
- **Hecho:** en ACP, `ND-2` prohíbe rellenar `NO_DATA`; en Telemetría, `ND-2` dice que un `NO_DATA` no degrada la observación. La regla equivalente en telemetría es `ND-4`.
- **Riesgo:** un mismo código invoca dos obligaciones distintas según el documento leído.
- **Recomendación:** reservar `ND-2` para la regla global (no imputar) y renombrar la regla local de telemetría a `ND-4` en todas sus referencias, con tabla de equivalencia.

### H-14 · `C-5` con dueño fuera del stack y usos no relacionados 🔴
- **Documentos afectados:** Carta IA `:85`, `ARCHITECTURE_FREEZE_CLOSURE_REVIEW.md:24`, `CANONICAL_ARCHITECTURE_FINAL_REPORT.md:67`, Platform `:484`.
- **Hecho:** `C-5` significa "provocar el registro vía productor gobernado" en la Carta, pero "estatus de 3 diagramas" en el freeze arquitectónico; Platform lo cita sin definirlo.
- **Riesgo:** colisión entre gobernanza IA y gobernanza documental; una citación puede resolver al documento equivocado.
- **Recomendación:** calificar el código con namespace (`IA:C-5` vs `DOC:C-5`) o reasignar uno de los dos en nueva versión; añadir definición local en Platform.

### H-15 · `R-01` con cuatro significados 🔴
- **Documentos afectados:** `OBSERVATION_REGISTRY_ROADMAP_V1.md:188`, `EVIDENCE_LEDGER_ROADMAP_V1.md:197`, `KNOWLEDGE_HUB_ROADMAP_V1.md:176`, y un cuarto uso en el roadmap ACP.
- **Hecho:** "autoridad duplicada", "ACP crea evidencia", "KH crea `OBSERVATION_ID`" y riesgo equivalente del ACP comparten `R-01`.
- **Riesgo:** los 140 riesgos declarados usan un namespace `R-` compartido; agregar un risk ID sin prefijo de capa produce colisiones silenciosas.
- **Recomendación:** adoptar prefijos por capa (`REG-R-01`, `LED-R-01`, `ACP-R-01`, `KH-R-01`) en una nueva versión de los roadmaps, preservando los códigos antiguos como alias.

### H-16 · Platform define reglas para capas posteriores 🟡
- **Documento afectado:** `SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md` (`ACP-1..8` en `:482-489`, `KH-1..6` en `:495-500`).
- **Hecho:** la plataforma prescribe reglas detalladas para ACP y KH antes de que existan sus documentos canónicos, que luego las reiteran con otros prefijos.
- **Riesgo:** dos fuentes de autoridad para la misma capa; si Platform y ACP/KH divergen, no hay criterio de preeminencia.
- **Recomendación:** declarar explícitamente que Platform posee solo el **contrato de interfaz** y que la autoridad de reglas internas pertenece a ACP V1 / KH V1.

### H-17 · "Productor gobernado" / "registrador" / KH sin delimitación 🔴
- **Documentos afectados:** Carta IA C-5, Platform ACP-3, F3E-9, ACP KHA-*.
- **Hecho:** la cadena "lab produce → ledger guarda → KH presenta" es canónica, pero el actor que **provoca el registro** recibe tres nombres y no se define quién firma el registro.
- **Riesgo:** un ACP o un LLM podría autoatribuirse la acción de registrar sin violar literalmente ninguna regla escrita.
- **Recomendación:** fijar un único rol (productor gobernado del lab) con responsable humano declarado; ACP solo propone, KH solo presenta, LLM solo interpreta.

### H-18 · "Formato congelado" vs "puede cambiar" en el Masterplan 🟡
- **Documento afectado:** `SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md:108-109`.
- **Hecho:** la raíz se declara inmutable 10 años, pero el formato `obs_<YYYYMMDD>_<session_id>_<seq4>` se matiza como susceptible de cambio evolutionario.
- **Riesgo:** confundir inmutabilidad del **identificador** con inmutabilidad de la **gramática**; RA-3 exige que el ID sea opaco y no se parsee.
- **Recomendación:** separar literalmente dos invariantes: el valor `obs_` nunca cambia; la gramática es metadato de procedencia y su cambio no altera identificadores emitidos.

### H-19 · Ausencia de registro de decisiones de colisión 🟡
- **Documentos afectados:** los 10 auditados.
- **Hecho:** no existe una tabla `supersedes` / `alias` que liste las colisiones `doc_`, `evt_`, `ND-2`, `C-5`, `R-01` y su resolución prevista.
- **Riesgo:** cada corrección futura se decide ad hoc, sin trazabilidad de por qué un prefijo cambió.
- **Recomendación:** crear, en misión gobernada posterior, un registro de decisiones de colisión con `supersedes` y fecha; **no** crear ese registro en esta auditoría.

### H-20 · Auditoría autoclasificada `ACTIVE` sin versionar 🟢
- **Documentos afectados:** `SIGCTIARURAL_FOUNDATION_AUDIT_V1.md` y sus dos complementos.
- **Hecho:** el padre se clasifica `ACTIVE` en su registro maestro (fila 30), pero los tres documentos son nuevos y están sin versionar al cierre de la misión.
- **Riesgo:** coherencia interna: un diagnóstico que denuncia 9/10 documentos sin versionar nace él mismo sin versionar.
- **Recomendación:** al versionar el stack (H-12), incluir los tres documentos de auditoría en el mismo cambio y actualizar su estado a `CANONICAL` o `REFERENCE_ONLY` según D-003.

---

# 2. Los 10 mayores riesgos arquitectónicos remanentes

| # | Riesgo | Severidad | Documento / capa | Impacto si ocurre | Mitigación recomendada |
|---|---|---|---|---|---|
| **AR-01** | Segunda raíz accidental por `EVIDENCE_ID` | 🔴 | Ledger §4 (H-03) | Toda la cadena de trazabilidad pierde ancla única. | Corregir rótulo con `supersedes`; verificador de raíz en cada capa. |
| **AR-02** | Fuga de prefijos `doc_` / `evt_` a almacenamiento | 🔴 | Multimodal + KH + Visión (H-04, H-05) | No se distingue asset de documento ni evento de vista. | Prefijos únicos por dueño + tabla de migración. |
| **AR-03** | Ciclo ACP↔KH no acotado | 🔴 | Platform + ACP + KH (H-07) | Resultados ACP no reproducibles por lectura de estado mutado. | Snapshot `T0` para lectura KH; candidato en `T1`. |
| **AR-04** | Autoridad canónica sin procedencia Git | 🔴 | 9 documentos (H-12, H-20) | Pérdida o divergencia silenciosa del contrato. | Versionado íntegro sin reescritura. |
| **AR-05** | Cadena nunca ejecutada | 🔴 | Todo el stack (H-10) | Coherencia falsa: fallos de integración aparecen en producción. | E2E real con fixtures de rechazo y gates. |
| **AR-06** | ACP o LLM autoatribuyéndose el registro | 🔴 | Carta + Platform + F3E (H-17) | Violación de no-creación de evidencia sin violación literal. | Rol único con responsable humano y verificador de actor. |
| **AR-07** | Colisión de códigos de regla (`C-5`, `ND-2`, `R-01`) | 🟡 | Carta, Freeze, Telemetría, roadmaps (H-13/14/15) | Aplicación de la obligación equivocada. | Namespaces por capa + alias históricos. |
| **AR-08** | Divergencia por 49 reglas redundantes | 🟡 | KH y contratos de interfaz (H-09, H-16) | Una corrección no se propaga a las demás familias. | Fuente única por invariante + referencias. |
| **AR-09** | Corrección por edición silenciosa | 🟡 | Modelo de obsolescencia (H-11, H-19) | Se pierde la historia de por qué cambió un contrato. | Exigir `supersedes` y estados `SUPERSEDED`/`RETIRED`. |
| **AR-10** | Dependencia de F3E legacy para regla canónica | 🟡 | `Documentacion/Arquitectura/` nivel 6 (H-08) | Regla de promoción sin autoridad bajo D-003. | Canonizar F3E-9 en `docs/` con `supersedes`. |

---

# 3. Secuenciación recomendada (diagnóstico, no autorización)

| Orden | Acciones | Hallazgos atendidos | Condición de cierre |
|---|---|---|---|
| 1 | Versionar los 12 documentos pendientes (9 auditados sin versionar + 3 de auditoría) | H-12, H-20 | `git ls-files` sin `UNTRACKED` en el corpus |
| 2 | Corregir rótulos y prefijos con `supersedes` | H-01, H-03, H-04, H-05, H-06, H-18 | Tabla de equivalencia publicada |
| 3 | Resolver namespaces de códigos | H-13, H-14, H-15, H-19 | Sin código con dos dueños |
| 4 | Frontera ACP↔KH y rol de productor | H-07, H-16, H-17 | Snapshot declarado + verificador |
| 5 | Alinear D-003 y canonizar F3E-9 | H-08, H-10 (parcial), AR-10 | Clasificación coherente |
| 6 | Reducir redundancia y ejercitar obsolescencia | H-09, H-11 | 1 `supersedes` real ejecutado |
| 7 | E2E real con fixtures | H-10, AR-05 | 1 observación → 1 evidencia → 1 reporte → 1 promoción |

> Ninguna de estas acciones se ejecuta en esta misión. La secuencia es un diagnóstico de dependencias entre correcciones, no una autorización de implementación.

---

# 4. Cierre

**20 hallazgos** y **10 riesgos arquitectónicos remanentes** documentados con severidad, documento afectado, riesgo y recomendación. Todos los hallazgos H-01..H-11 están reflejados en el documento padre; H-12..H-20 desarrollan el resto del barrido. Los bloqueos B1..B4 del padre se sostienen en estos hallazgos: B1 (H-12/H-20), B2 (H-04/H-05/H-13/H-14/H-15), B3 (H-07/H-17), B4 (H-10/H-11).

**Estado honesto:** análisis **OFICIAL**, sin modificar documentos existentes, sin crear IDs de dominio, taxonomías ni gobernanzas, sin código, sin base de datos, API, UI, IA, agente, LLM, embedding ni RAG. Sin `git add`, `commit`, `push`, `merge` ni `tag`.

---

*Fin del análisis de brechas del Foundation Stack V1. Complementa —nunca sustituye ni modifica— los diez documentos auditados.*
