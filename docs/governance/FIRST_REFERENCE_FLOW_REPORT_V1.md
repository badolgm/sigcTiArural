# PRIMER FLUJO DE REFERENCIA — DE OBSERVACIÓN A CONOCIMIENTO V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T16:09:40-05:00
> - Origen: misión `SIGCTIARURAL_FIRST_REFERENCE_FLOW_V1` (documento nuevo)
> - Destino: `docs/governance/FIRST_REFERENCE_FLOW_REPORT_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: materialización **documental** de la instancia de referencia. No crea gobernanzas, IDs de dominio, arquitecturas, registries, ledgers, ACP ni Knowledge Hubs. No implementa código.

**Misión:** `SIGCTIARURAL_FIRST_REFERENCE_FLOW_V1`
**Base:** `FOUNDATION STACK CANONICAL BASELINE V1` · rama/tag `foundation-stack-v1` · HEAD `c371d4f`
**Instancia utilizada:** `docs/governance/FOUNDATION_REFERENCE_INSTANCE_V1.md`
**Namespace aplicado:** `docs/governance/FOUNDATION_NAMESPACE_REGISTRY_V1.md`
**Fecha:** 2026-11-21 (America/Bogota, UTC-05:00)

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Rama / tag verificados | `foundation-stack-v1` / `foundation-stack-v1` |
| HEAD | `c371d4f` (`docs(governance): freeze foundation stack v1`) |
| Árbol Git al inicio | **limpio** (0 líneas en `git status --short --untracked-files=all`) |
| Documentos nuevos creados por esta misión | **1** (este reporte) |
| Documentos existentes modificados | **0** |
| IDs de dominio nuevos | **0** — se reutilizan las seis etiquetas de `FOUNDATION_REFERENCE_INSTANCE_V1.md` |
| Gobernanzas / arquitecturas / registries / ledgers / ACP / KH nuevos | **0** |
| Código, API, UI, BD, IA, LLM, RAG, embeddings, vectores | **0** |
| Observaciones, assets, evidencias, reportes o documentos **físicos** materializados | **0** |
| `git add` / `commit` / `push` / `merge` / `tag` | **0** |

> **Aclaración indispensable.** `OBS-0001`, `ASSET-0001`, `EVENT-0001`, `EVIDENCE-0001`, `REPORT-0001` y `DOC-0001` son las **etiquetas de referencia ya definidas** en la misión anterior. No usan los prefijos de producción (`obs_`, `audio_`/`image_`, `evt_`, `evd_`, `report_`/`acprep_`, `doc_`) y no se registran en ningún Registry, Ledger ni KH real. "Materializar" aquí significa **describirlos completamente dentro de este reporte**, no emitirlos.

---

# 1. Caso agrícola elegido

**Cultivo de tomate** — `class_id=tomate` (VISION_TAXONOMY_V1 §3.1, "ejemplo correcto").

| Elemento | Valor de ejemplo | Fuente canónica |
|---|---|---|
| Escena | `scene_cultivo` | VISION_TAXONOMY_V1 §4, 8 `scene_id` canónicos |
| Objeto observado | Planta de tomate, hoja basal | `class_id=tomate`, padre `planta` |
| Síntoma observado | `sintoma_foliar` (raíz canónica) | VISION_TAXONOMY_V1 §3.2 |
| Condición ambiental | `NO_DATA` | Telemetría no materializada en este flujo |
| Confirmación de patógeno | `NO_DATA` | Sin laboratorio; **no** se asciende a `mildiu` |

**Regla aplicada ENF-1:** la enfermedad se anota como objeto/síntoma con su propio `class_id` y su propia caja; queda prohibido componer `tomate_con_manchas`. Por eso se registran `class_id=tomate` y `class_id=sintoma_foliar` por separado.

**Estado de todo el caso:** `DISENO`. No hay píxeles, archivos ni lecturas reales.

---

# 2. Los seis nodos materializados

| Etiqueta | Rol en la cadena | Capa dueña | Estado | Ancla |
|---|---|---|---|---|
| `OBS-0001` | Observación raíz | Observation Platform / Registry | `DISENO` | Ninguna (raíz) |
| `ASSET-0001` | Asset de imagen observada | Platform / Multimodal | `DISENO` | `OBS-0001` |
| `EVENT-0001` | Ocurrencia real de la observación | Multimodal / dominio | `DISENO` | `OBS-0001` · `ASSET-0001` |
| `EVIDENCE-0001` | Evidencia mínima derivada | Evidence Ledger | `DISENO` | `OBS-0001` · `ASSET-0001` · `EVENT-0001` |
| `REPORT-0001` | Reporte ACP bajo snapshot `T0` | ACP | `DISENO` | `EVIDENCE-0001` |
| `DOC-0001` | Documento del Knowledge Hub en `T1` | KH | `DISENO` | `REPORT-0001` |

---

# 3. Descripción de cada nodo

## 3.1 `OBS-0001` — la observación

| Campo | Valor |
|---|---|
| `observation_id` (etiqueta de referencia) | `OBS-0001` |
| Descripción | Observación visual de una planta de tomate en parcela cultivada, con síntoma foliar visible en hoja basal. |
| `scene_id` | `scene_cultivo` |
| `captured_at` | `2026-11-21T10:15:00-05:00` — **valor de ejemplo**, no registro real |
| `place_id` | `parcela_tomate_01` — valor de contexto de ejemplo |
| Modalidad | Visual (imagen) |
| Estados heredables | `DISENO` |
| Regla de raíz | El ID se emite una sola vez; no se reescribe, no se parsea, no se sustituye por `asset`, `event`, `evidence`, `report` ni `doc` |

**Por qué es la raíz:** nace en el acto de observar. Los demás cinco nodos referencian `OBS-0001`; ninguno lo define.

## 3.2 `ASSET-0001` — los assets

| Asset | Descripción | Estado |
|---|---|---|
| `ASSET-0001` | Imagen JPEG de la hoja basal de tomate; `mime_type=image/jpeg`; `sha256=NO_DATA` (sin bytes materializados) | `DISENO` |
| Asset secundario | `NO_DATA` — no se crea otro asset para no introducir una etiqueta nueva | `NO_DATA` |
| Asset de telemetría | `NO_DATA` — condición ambiental no medida en este flujo | `NO_DATA` |

| Campo | Valor |
|---|---|
| `asset_id` (etiqueta de referencia) | `ASSET-0001` |
| `observation_id` | `OBS-0001` |
| `modality` | Imagen |
| `class_id` principal | `tomate` |
| `class_id` secundario | `sintoma_foliar` (bbox separada, ENF-1) |
| `provenance` | Captura de campo de ejemplo; `tool_version=NO_DATA` |
| Regla | Un asset sin observación no entra al stack (INS-04) |

> El `sha256` es `NO_DATA`, no `0` ni cadena vacía: no se fabrica una huella de un archivo inexistente. Esta limitación se propaga a la evidencia y al reporte como `PARTIAL`.

## 3.3 `EVENT-0001` — el evento

| Campo | Valor |
|---|---|
| `event_id` (etiqueta de referencia) | `EVENT-0001` |
| Descripción | Ocurrencia de síntoma foliar en una planta de tomate, en `parcela_tomate_01`, durante la franja de la observación. |
| `event_type` | `sintoma_foliar` — **vocabulario**, no identificador |
| Observaciones vinculadas | `OBS-0001` (1..N) |
| Asset vinculado | `ASSET-0001` |
| `place_id` | `parcela_tomate_01` |
| Regla | `EVENT-0001` es la ocurrencia; `lluvia`/`plaga`/`sintoma_foliar` como texto son `event_type`, nunca un ID (INS-05) |

> No se usa `VISUAL_EVENT_ID`: el registro de namespaces (NSP-03) reserva `evt_` para `EVENT_ID` y trata la vista visual como campo derivado sin ID propio.

## 3.4 `EVIDENCE-0001` — evidencia mínima

| Campo | Valor |
|---|---|
| `evidence_id` (etiqueta de referencia) | `EVIDENCE-0001` |
| Anclas | `OBS-0001` · `ASSET-0001` · `EVENT-0001` |
| Afirmación mínima | "Se observa un síntoma foliar en un cultivo de tomate en `scene_cultivo`." |
| `class_id` soportado | `sintoma_foliar` (raíz canónica) |
| No afirmado | Patógeno específico (`mildiu`, `roya`, `mancha_bacteriana`) = `NO_DATA` |
| Estado heredado | `DISENO` — **idéntico** al de la observación; no se mejora |
| Confianza | No se numera: sin archivo ni doble revisión, se deja como `NO_DATA` |
| `evidence_version_ids[]` | `NO_DATA` — versión real no emitida |
| Regla | La evidencia es hija de la raíz (NSP-05); el encabezado "cuatro identificadores raíz" del Ledger §4 se lee como "derivados" |

**Por qué es mínima:** no confirma enfermedad, no mide telemetría, no calcula métricas y no crea estado nuevo. Es suficiente para sustentar un reporte `PARTIAL`, no uno `RESOLVED`.

## 3.5 `REPORT-0001` — reporte ACP

| Campo | Valor |
|---|---|
| `report_id` (etiqueta de referencia) | `REPORT-0001` |
| Materialización real | `acprep_` (NSP-06: un reporte, dos representaciones, un productor) |
| Snapshot leído | `T0`: Registry@T0 + Ledger@T0 + KH@T0 |
| KH@T0 | Sin publicación previa ⇒ `NO_DATA` para ese tramo |
| Pregunta respondida | "¿Qué se observó en la parcela de tomate?" |
| Anclas | `EVIDENCE-0001`, vía `OBS-0001` |
| `evidence_version_ids[]` | `NO_DATA` ⇒ REP-8 obliga a `PARTIAL` |
| Veredicto | **`PARTIAL`** |
| Confianza | `MIN(anclas) × cobertura × penalización por estado no-REAL` — **expresión simbólica**, sin valor numérico inventado |
| Veredictos no usados | `RESOLVED` (sin versión de evidencia) · `NO_DATA` (sí hay una ancla) · `BLOCKED` / `UNANSWERABLE` (no aplica) |
| Regla | ACP no escribe en Registry ni Ledger; produce `report_id` (ACP-3 / `IA:C-5`) |

> El ACP **no crea** `EVIDENCE-0001`: solo la lee y produce `REPORT-0001`. No se invoca ningún LLM: la interpretación es determinista y anclada.

## 3.6 `DOC-0001` — documento del Knowledge Hub

| Campo | Valor |
|---|---|
| `doc_id` (etiqueta de referencia) | `DOC-0001` |
| Título | `Observación de síntoma foliar en cultivo de tomate — caso de referencia V1` |
| Fuente | `REPORT-0001` (candidato de promoción) |
| Instantánea | `T1` — publicación posterior a `T0` |
| Estado | `DISENO` |
| Clasificación sugerida | `ACTIVE` (documento de referencia, no gobernanza) |
| `promotion_candidate` | Sí, **promoción gobernada no ejecutada** |
| Registro generado | `knowledgeRegistry.generated.json` **no regenerado** |
| Salidas prohibidas | `obs_` y `evd_` desde el KH ⇒ `BLOCKED` (KCN-14 / KEL-1) |

> `DOC-0001` existe **como contenido de este reporte**, no como artefacto escrito en el KH. No se afirma que el conocimiento esté verificado: falta decisión humana gobernada.

---

# 4. Validación de las cinco capas

| Capa | Entrada → Salida | Comprobación | Resultado |
|---|---|---|---|
| Observation Platform | captura → `OBS-0001` + `ASSET-0001` | El paquete cuelga de la raíz; el asset es hijo | ✅ Coherente |
| Observation Registry | `OBS-0001` → versión e historia | ID no mutado; sin escritor externo | ✅ Coherente |
| Evidence Ledger | observación + asset + evento → `EVIDENCE-0001` | Estado heredado; no nueva raíz | ✅ Coherente |
| ACP | Registry@T0 + Ledger@T0 + KH@T0 → `REPORT-0001` | No crea evidencia; veredicto `PARTIAL` por `NO_DATA` | ✅ Coherente |
| Knowledge Hub | `REPORT-0001` → `DOC-0001` en `T1` | No emite `obs_`/`evd_`; sin realimentación de `T0` | ✅ Coherente |

**Resultado: 5/5 capas validadas.**

---

# 5. Matriz de trazabilidad

| De → Hacia | Ancla verificada |¿Se rompe? | Evidencia en este reporte |
|---|---|---|---|
| `OBS-0001` → `ASSET-0001` | `observation_id` en el asset | No | §3.2 |
| `OBS-0001` → `EVENT-0001` | observación vinculada | No | §3.3 |
| `OBS-0001`+`ASSET-0001`+`EVENT-0001` → `EVIDENCE-0001` | tres anclas | No | §3.4 |
| `EVIDENCE-0001` → `REPORT-0001` | `evidence_id` citado | No, pero **parcial** por `evidence_version_ids[] = NO_DATA` | §3.5 |
| `REPORT-0001` → `DOC-0001` | candidato de promoción | No, pero **no promovido** | §3.6 |
| `DOC-0001` → `OBS-0001` | retroceso por ancla (ATR-13) | No | §2 y §3.6 |

**Lectura:** la cadena es completa y retraceable. Dos tramos están marcados `PARTIAL`/`NO_DATA` por honestidad de datos, no por pérdida de ancla.

---

# 6. Rupturas y limitaciones detectadas

| # | Hallazgo | ¿Ruptura de trazabilidad? | Tratamiento |
|---|---|---|---|
| 1 | Sin bytes de imagen; `sha256 = NO_DATA` | **No** — la ancla existe; falta el contenido | `NO_DATA` explícito, nunca `0` ni hash inventado |
| 2 | Sin versión de evidencia emitida | **No** — debilita, no rompe | REP-8 ⇒ veredicto `PARTIAL` |
| 3 | KH@T0 sin publicación previa | **No** — snapshot vacío declarado | `NO_DATA` en ese tramo; sin inferencia |
| 4 | Promoción gobernada no ejecutada | **No** — el documento es referencia | `DOC-0001` en `DISENO`; registry no regenerado |
| 5 | Confianza sin valor numérico | **No** — se niega a inventar métrica | Expresión simbólica; penalidad por `DISENO` |
| 6 | Audio sin `observation_id` nativo (H-01) | **No ejercitado** — caso es visual | Fuera de alcance; no reabierto |

> **Rupturas estructurales: 0.** Seis nodos, seis anclas, un sentido, sin ciclo ACP↔KH y sin colisión de prefijo.

---

# 7. Veredicto final

> **SÍ — el Foundation Stack V1 ejecuta documentalmente un flujo completo de observación a conocimiento sin romper `OBSERVATION_ID` ni la trazabilidad.**

**Precisión obligatoria:** la ejecución es **de referencia**, no operativa. No se materializaron píxeles, archivos, hashes, versiones de evidencia, reportes en un ACP real ni documentos en un KH real. El veredicto demuestra que la cadena contractual es recorrible con `PARTIAL` honesto allí donde faltan datos, y que las seis etiquetas permanecen dentro de la línea base sin convertirse en IDs de dominio.

**Criterio de éxito:** cumplido. Cadena `OBS-0001 → ASSET-0001 → EVENT-0001 → EVIDENCE-0001 → REPORT-0001 → DOC-0001` validada en las cinco capas exigidas, con 0 rupturas estructurales y `OBSERVATION_ID` intacto como raíz única.

---

*Fin del primer flujo de referencia V1. Complementa —nunca sustituye ni modifica— la auditoría, la remediación, el registro de namespaces, la instancia de referencia y la línea base canónica del Foundation Stack V1.*
