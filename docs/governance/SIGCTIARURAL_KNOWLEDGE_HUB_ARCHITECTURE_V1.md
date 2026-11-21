# ARQUITECTURA DEL KNOWLEDGE HUB V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T00:06:52-05:00
> - Origen: misión `SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1` (documento nuevo)
> - Destino: `docs/governance/SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: arquitectura y gobernanza del Knowledge Hub. No crea base de datos, UI, API, IA, agente, LLM, embedding, vector store ni RAG.

**Misión:** `SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1`
**Naturaleza:** contrato **declarativo**. Define la autoridad de canonización, promoción, obsolescencia y preservación documental; no su implementación.
**Fecha:** 2026-11-21 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Estado:** **OFICIAL — DISEÑADO**. La arquitectura existe; materializar el KH requiere misión explícita y gates propios.
**Conjunto de 3 documentos:** este es el padre.

| Documento | Autoridad |
|---|---|
| `SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1.md` | Definición, IDs, ciclo, estados, políticas, registro maestro, vistas derivadas y 75 reglas |
| `KNOWLEDGE_HUB_ENTITY_MODEL_V1.md` | **10 diagramas ASCII**, cardinalidades, estados y fixtures de rechazo |
| `KNOWLEDGE_HUB_ROADMAP_V1.md` | Fases, gates, coherencia y los 40 riesgos |

**Subordinación:** Constitución V1.0.1 → Carta IA V1.0.1 → **D-003** → CANONICAL_PROJECT_STATE → AGENTS → Gobernanza Multimodal V1 → Masterplan V1 → Platform V1 → Registry V1 → Ledger V1 → ACP V1 → **este KH** → documentos especializados.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante de raíz:** `OBSERVATION_ID` sigue siendo la **raíz única** del ecosistema. Ningún ID definido aquí compite con `OBSERVATION_ID`, `EVIDENCE_ID` ni `EVENT_ID`.
> **Invariante de autoría:** **ACP no crea conocimiento: ACP propone; Knowledge Hub decide.** **LLM no crea conocimiento: LLM interpreta.** **Evidence Ledger no crea conocimiento: Ledger provee evidencia.**
> **Invariante de honestidad:** los **7 estados canónicos** (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`) no se amplían ni se mejoran por decreto.
> **Invariante de veredicto:** los **5 veredictos ACP** (`RESOLVED` · `PARTIAL` · `NO_DATA` · `BLOCKED` · `UNANSWERABLE`) son vocabulario cerrado. `HIPÓTESIS` sigue **inactivo**, PENDIENTE de G-IA-1.
> **Invariante de preservación:** **prohibido el borrado histórico, la reescritura histórica y la pérdida de trazabilidad.** Todo cambio se representa con `supersedes` · `superseded_by` · `deprecated_on` · `retired_on` · `replaced_by`.
> **Invariante de no-ejecución:** no se crea base de datos, UI, API, IA, agente, LLM, embedding, vector store ni RAG. Todo eso queda **`DISENO`** y fuera de alcance.

---

# 0. Propósito y límite

El ecosistema ya puede capturar, identificar, trazar, versionar, custodiar, analizar y producir reportes. Le falta la **autoridad que convierte un reporte anclado en conocimiento canónico**, y que decide cuándo ese conocimiento se promueve, se versiona, se declara obsoleto, se retira o se preserva.

**Lo que SÍ define esta arquitectura:** qué es el KH, la diferencia entre observación/evidencia/reporte/conocimiento, sus cinco IDs, el ciclo de promoción, quién puede y quién no puede promover, condiciones mínimas, estados documentales, políticas de obsolescencia/supersedes/retiro/regeneración, seis escenarios, el registro maestro, las cuatro vistas derivadas, la trazabilidad y 75 reglas.

**Lo que NO hace — límite duro:**

| No hace | Detalle |
|---|---|
| No implementa código | Ningún `.js`, `.py`, `.jsx`, servicio ni firmware. |
| No crea base de datos ni índice físico | Define un registro maestro lógico, no tablas. |
| No crea UI ni API | Define vistas derivadas, no pantallas ni endpoints. |
| No crea IA ni agente | Ningún modelo, sub-agente ni orquestador nuevo. |
| No crea LLM, prompt, embedding ni vector store | El KH no genera lenguaje ni recupera por similitud. |
| No implementa RAG | Prohibido recuperar por similitud; se resuelve por ancla exacta. |
| No modifica documentos existentes | Platform, Registry, Ledger, ACP, gobernanzas y Carta IA quedan intactos. |
| No cambia raíces | `observation_id`, `evidence_id` y `event_id` no se alteran. |
| No decide conflictos documentales por encima de D-003 | D-003 es la autoridad (KHR-8, KEL-9, KHA-6). |

> Estado honesto: hoy existen **0 promociones gobernadas por esta arquitectura**, **0 `docprom_`** y **0 regeneraciones gobernadas**. El KH documental real (registry de 51 documentos en 6 categorías) sigue operativo como referencia, sin ser modificado por esta misión.

---

# 1. Qué es y qué NO es un Knowledge Hub

## 1.1 Definición oficial

El **Knowledge Hub (KH)** es la **función gobernada de canonización** del ecosistema: decide, bajo D-003 y supervisión humana, qué reporte anclado asciende a conocimiento, qué documento lo representa, en qué estado documental vive, cuándo se declara obsoleto, cuándo se retira y cómo se regenera su registry sin borrar historia.

**En una frase:** *el KH no produce conocimiento: lo admite, lo nombra, lo custodia y lo retira con trazabilidad completa hacia la observación que lo originó.*

| Característica | Valor |
|---|---|
| Naturaleza | Autoridad de canonización y preservación documental; **no** es IA, **no** es buscador. |
| Entrada | `ACP_REPORT_ID` con `promotion_candidate` y anclas (KHA-3), más evidencia del Ledger. |
| Decisión | Promover o no promover, bajo **Hangar de Autenticidad** y **D-003**. |
| Salida | `DOC_ID` por referencia + entrada en el registro maestro + regeneración derivada. |
| Memoria | `DOC_CHAIN_ID` append-only; snapshots de registry preservados. |
| Límite | No crea observación, evidencia, reporte ni hecho. |

## 1.2 Qué NO es

| ❌ NO es | Detalle |
|---|---|
| Una base de datos de conocimiento | El registry es una vista derivada, no almacén de verdad. |
| Un RAG, vector store o buscador semántico | No hay embeddings ni similitud; se resuelve por ID exacto. |
| Un generador de contenido | No redacta conocimiento por iniciativa propia. |
| Un LLM ni un prompt | No interpreta ni conversa; eso es del slot `Interprete`. |
| El ACP | El ACP propone; el KH decide (KHA-2). |
| El Evidence Ledger | El Ledger provee evidencia; el KH promueve (KEL-2). |
| Un sustituto de D-003 | D-003 resuelve conflictos documentales; el KH los acata. |
| Un archivo que borra | `ARCHIVED` es un estado, nunca sinónimo de eliminación. |
| Una fuente por encima de `docs/` | La jerarquía D-003 coloca a `docs/` primero. |

---

# 2. Observación, Evidencia, Reporte, Conocimiento y Documento

| Nivel | ID | Naturaleza | Quién lo crea | Estado que lleva | Mutabilidad |
|---|---|---|---|---|---|
| **Observación** | `OBSERVATION_ID` | Hecho capturado gobernado | Captura/productor de observación | 7 estados de honestidad | Raíz inmutable; metadatos versionados |
| **Evidencia** | `EVIDENCE_ID` | Artefacto reproducible derivado | Productor gobernado + registrador | Hereda estado y confianza | Identidad inmutable; versiones `evdver_` |
| **Reporte** | `ACP_REPORT_ID` / `report_id` | Interpretación anclada con veredicto | ACP (IA-1) | 5 veredictos canónicos | Inmutable; no modifica fuentes |
| **Conocimiento** | `DOC_PROMOTION_ID` | Afirmación verificada admitida por el KH | Knowledge Hub (bajo D-003) | Estado documental + traza | Promoción append-only |
| **Documento canónico** | `DOC_ID` | Artefacto documental que representa al conocimiento | KH por regeneración del registry | 6 estados documentales | Versionado, nunca reescrito |

**Distinción crítica:** el **conocimiento** es la afirmación admitida; el **documento canónico** es su representación legible. Un documento puede quedar `SUPERSEDED` sin que el conocimiento desaparezca: el conocimiento se reconstruye por su cadena de promoción.

**Regla DIF-1:** ningún nivel mejora el estado de honestidad del anterior.
**Regla DIF-2:** ningún nivel puede saltarse. De reporte a documento sin promoción ⇒ `BLOCKED`/`PARTIAL`.
**Regla DIF-3:** `DOC_ID` es referencia al registry, nunca copia de bytes del paquete (KH-3, KEL-4).

---

# 3. Los cinco identificadores del KH

> **Regla de no-competencia:** ninguno de los cinco es raíz. Son IDs de **promoción y documento**; siempre referencian `observation_id` y/o `evidence_id` como anclas.

| ID solicitado | Prefijo | Naturaleza | Depende de | Estado |
|---|---|---|---|---|
| `DOC_ID` | `doc_` | Identidad del documento en el registry | Promoción admitida | **Nuevo, `DISENO`** |
| `DOC_VERSION_ID` | `docver_` | Versión inmutable del contenido declarativo del documento | `doc_id` | **Nuevo, `DISENO`** |
| `DOC_CHAIN_ID` | `docchain_` | Cadena append-only de custodia documental | `doc_id` | **Nuevo, `DISENO`** |
| `DOC_RELATION_ID` | `docrel_` | Arista tipada y dirigida entre documentos y entidades gobernadas | entidades existentes | **Nuevo, `DISENO`** |
| `DOC_PROMOTION_ID` | `docprom_` | Acto gobernado de admisión de conocimiento | `ACP_REPORT_ID` + anclas | **Nuevo, `DISENO`** |

> Los `doc_id` ya existentes en el registry real (51 documentos) **se conservan tal cual**. El prefijo `doc_` es declarativo y no obliga a renombrarlos: nunca se reescribe un ID por adoptar esta arquitectura (DIF-3, PRES-1 del Ledger).

## 3.1 `DOC_ID`

Contiene: `doc_id` · `title` · `category` · `state` · `observation_refs[]` · `evidence_refs[]` · `report_ref[]` · `promotion_ref` · `version_ref` · `chain_ref` · `checksum` · `at` + `timezone`.

**Regla KID-1:** un `doc_id` sin `promotion_ref` no es canónico; es a lo sumo `REFERENCE_ONLY`.
**Regla KID-2:** no codifica estado, taxonomía ni versión; un cambio de estado crea versión, no nueva raíz.
**Regla KID-3:** es referencia al registry; jamás transporta bytes del `ObservationPackage`.

## 3.2 `DOC_VERSION_ID`

Contiene: `version_id` · `doc_id` · `seq4` · `supersedes` · `superseded_by` · `manifest_sha256` · `valid_from` · `valid_to` · `reason` · `actor_id`.

**Regla KID-4:** corregir un documento produce `seq4+1` con `supersedes`; la versión anterior permanece legible.
**Regla KID-5:** la versión vigente se resuelve por `supersedes` + vigencia, nunca por "la última fila".
**Regla KID-6:** cambiar bytes crea otra versión; nunca una reescritura in-place.

## 3.3 `DOC_CHAIN_ID`

Contiene: `chain_id` · `doc_id` · `seq6` · `action` · `actor_id` · `actor_role` · `at` + `timezone` · `before` · `after` · `reason` · `prev_chain_sha256` · `entry_sha256`.

**Acciones cerradas:** `PROMOTED` · `REGENERATED` · `CERTIFIED` · `UPDATED` · `SUPERSEDED` · `DEPRECATED` · `RETIRED` · `ARCHIVED` · `SPLIT` · `MERGED` · `DISPUTED` · `INVALIDATED` · `EXPORTED`.

**Regla KID-7:** la cadena es append-only; no existe `DELETE` ni `UPDATE`.
**Regla KID-8:** huella rota ⇒ `BLOCKED`; la cadena no se reordena.

## 3.4 `DOC_RELATION_ID`

**Tipos cerrados:** `DERIVED_FROM` · `SUPPORTS` · `PROMOTED_BY` · `SUPERSEDES` · `DEPRECATES` · `RETIRES` · `REPLACES` · `SPLIT_INTO` · `MERGED_FROM` · `CONTRADICTS` · `REFERENCES` · `PRECEDED_BY` · `ANCHORED_TO`.

**Regla KID-9:** toda arista exige `declared_by`, `reason`, `at` y `timezone`; nunca se infiere por fecha ni similitud.
**Regla KID-10:** `SUPERSEDES`, `REPLACES`, `SPLIT_INTO` y `MERGED_FROM` no forman ciclos; ciclo ⇒ `BLOCKED`.

## 3.5 `DOC_PROMOTION_ID`

Contiene: `promotion_id` · `report_ref` · `evidence_refs[]` · `observation_ref` · `candidate_doc_id` · `decision` · `reviewer_id` · `hangar_verdict` · `d003_check` · `reason` · `at` + `timezone` · `promotion_sha256`.

**Regla KID-11:** `decision` solo admite `ADMITTED` · `DEFERRED` · `REJECTED`; no se inventa `AUTO_ADMITTED`.
**Regla KID-12:** sin `hangar_verdict` y `d003_check`, la promoción es `BLOCKED`.

---

# 4. Ciclo completo de promoción

```
  [1] OBSERVACION   observation_id (Registry)  -- estado honesto heredado
        │
        ▼
  [2] EVIDENCIA     evidence_id[] (Ledger)     -- version vigente + custodia
        │
        ▼
  [3] REPORTE       ACP_REPORT_ID               -- veredicto + anclas + MIN
        │  promotion_candidate (KHA-3)
        ▼
  [4] PROMOCION     DOC_PROMOTION_ID            -- Hangar + D-003 + humano
        │
        ▼
  [5] CONOCIMIENTO  afirmacion admitida         -- traza completa, sin mejora
        │
        ▼
  [6] DOCUMENTO     DOC_ID + regeneracion       -- registry derivado, nunca edicion a mano
```

| Paso | Entrada | Acción permitida | Salida | Prohibición |
|---|---|---|---|---|
| 1 | `observation_id` | Leer existencia y versión vigente | Ancla raíz | Crear observación. |
| 2 | `evidence_id[]` | Leer versión vigente y custodia | Evidencia anclada | Crear evidencia. |
| 3 | `ACP_REPORT_ID` | Leer veredicto, anclas y confianza | Candidato de promoción | Modificar reporte. |
| 4 | Candidato | Revisar Hangar, D-003 y humano | `DOC_PROMOTION_ID` | Promover sin revisión. |
| 5 | Promoción admitida | Registrar afirmación admitida | Conocimiento trazable | Elevar estado o confianza. |
| 6 | Conocimiento | Regenerar registry desde registro maestro | `DOC_ID` + vistas derivadas | Escritura ad-hoc. |

**Regla CIC-1:** el orden es obligatorio. No se puede pasar del paso 3 al 6 sin promoción (KH-2, KEL-2, KHA-2).
**Regla CIC-2:** el paso 6 **no realimenta** los pasos 1, 2 ni 3: el KH no escribe en Registry, Ledger ni ACP.

---

# 5. Quién puede y quién no puede promover

## 5.1 SÍ puede promover

La **Autoridad de Canonización del Knowledge Hub**, actuando bajo **D-003** y con **supervisión humana verificable**. Puede materializarse en un proceso de gobernanza documental, pero siempre con revisión de autenticidad y decisión humana registrada.

| Actor | Condición | Límite |
|---|---|---|
| **Knowledge Hub** | Evalúa `promotion_candidate`, verifica anclas, aplica Hangar y D-003. | No crea evidencia ni reportes; decide, no fabrica. |
| **Hangar de Autenticidad** | Verifica reproducibilidad, huella, licencia y consistencia (F3E §4). | Emita `hangar_verdict`; no reemplaza a D-003. |
| **Revisor humano gobernado** | Aprueba o rechaza con `reviewer_id` y `reason`. | No puede promover su propio candidato sin contraste (KAU-3). |
| **Registrador documental** | Asigna `doc_id` y escribe la entrada `PROMOTED`. | No interpreta; solo registra lo decidido. |

**Regla AUT-1:** toda promoción lleva `reviewer_id`, `hangar_verdict`, `d003_check` y `reason`.
**Regla AUT-2:** la decisión humana es obligatoria (P-IA-6: la IA propone; el humano decide).
**Regla AUT-3:** promover no es publicar: la publicación es regeneración del registry.

## 5.2 NO puede promover

| Actor | Veredicto | Fundamento |
|---|---|---|
| **ACP** | **NO CREA CONOCIMIENTO. PROPONE.** | KHA-2, KHA-3, ACP-3. |
| **LLM / `Interprete`** | **NO CREA CONOCIMIENTO. INTERPRETA.** | Carta IA P-IA-5, R-9.3. |
| **Evidence Ledger** | **NO CREA CONOCIMIENTO. PROVEE EVIDENCIA.** | KEL-2, AEL-12. |
| **Observation Registry** | No promueve; provee identidad y trazabilidad. | KHR-5, RA-1. |
| **UI, dashboard, script ad-hoc** | No promueve. | Solo solicita; carece de autoridad. |
| **Modelo, agente, sub-agente IA-1..IA-6** | No promueve. | Carta IA sujetos gobernados. |
| **Fuente `REF` o legacy `Documentacion/`** | No promueve como conocimiento propio. | EID-4, D-003, D-001. |
| **El KH por inferencia o similitud** | No promueve. | Sin ancla exacta no existe promoción (KID-9). |

---

# 6. Condiciones mínimas de promoción

Un documento solo puede ser promovido si cumple **todas**:

| # | Condición | Verificación |
|---|---|---|
| 1 | `observation_id` válido y vigente | Registry por ID exacto. |
| 2 | `evidence_id[]` vigente por `supersedes` | Ledger, versión exacta. |
| 3 | `ACP_REPORT_ID` con anclas y `evidence_version_ids[]` | REP-8, ATR-6. |
| 4 | Veredicto de los 5 canónicos | VER-1; sin `HIPÓTESIS` activo. |
| 5 | Confianza `≤ MIN(anclas)` | ACF-2, KHA-9. |
| 6 | Estado honesto heredado, sin mejora | F3E-2, KH-6. |
| 7 | Sin `DISPUTED`, `RETIRED` ni `ROTO` aplicable | §10 del Ledger y §10 del ACP. |
| 8 | Huella verificada (`sha256`) en assets y evidencia | PL-10, AUL-2. |
| 9 | Licencia y consentimiento declarados | POS-2/3, ACP-6, CUS-6. |
| 10 | Revisión del Hangar de Autenticidad | F3E §4. |
| 11 | Chequeo D-003 sin conflicto documental | KHR-8, KEL-9, KHA-6. |
| 12 | Aprobación humana con `reviewer_id` y `reason` | AUT-2, P-IA-6. |
| 13 | `domain` como facet declarado, no texto libre | BS-4/5. |
| 14 | Fechas con `timezone` | BS-3, ACS-9. |
| 15 | Registro maestro actualizado antes de regenerar | KCN-9. |

**Regla CMP-1:** si falta una condición, la decisión es `DEFERRED` o `REJECTED` con razón; nunca `ADMITTED` implícito.
**Regla CMP-2:** una condición Once admitida no se reescribe: un cambio posterior crea versión o entrada nueva.

---

# 7. Estados oficiales de un documento

> Estos **6 estados documentales** son ortogonales a los **7 estados de honestidad** y a los **5 veredictos ACP**. Un documento `CANONICAL` puede sustentar una afirmación `SIM`; el estado documental no mejora la señal.

| Estado | Significado | Visible | Mutabilidad | Marcadores |
|---|---|---|---|---|
| **CANONICAL** | Fuente oficial vigente bajo D-003. | Sí, como vigente | Versionable | `valid_to = null` |
| **ACTIVE** | Documento operativo en uso, no aún canónico. | Sí, como activo | Versionable | `supersedes` opcional |
| **SUPERSEDED** | Tuvo vigencia, fue reemplazado por versión/doc posterior. | Sí, como histórico | Solo lectura | `superseded_by`, `valid_to` |
| **RETIRED** | Retirado por decisión gobernada; ya no se usa como vigente. | Sí, con marcador | Solo lectura | `retired_on`, `replaced_by` opcional |
| **ARCHIVED** | Preservado para contexto histórico; no normativo. | Sí, en archivo | Solo lectura | `archived_on` |
| **REFERENCE_ONLY** | Referencia fundacional o legacy; nunca sustento propio. | Sí, etiquetado | Solo lectura | `reference_scope` |

**Regla EST-1:** `ARCHIVED` **nunca** significa borrado.
**Regla EST-2:** `RETIRED` **nunca** elimina la evidencia que lo sustentó.
**Regla EST-3:** `REFERENCE_ONLY` **nunca** se presenta como evaluación propia.
**Regla EST-4:** solo puede existir **un** `CANONICAL` por asunto y dominio bajo D-003; dos canónicos en conflicto ⇒ `BLOCKED`.
**Regla EST-5:** todo cambio de estado produce entrada en `DOC_CHAIN_ID`.

---

# 8. Políticas oficiales

## 8.1 Obsolescencia

| ID | Regla |
|---|---|
| KOP-1 | Un documento se declara obsoleto con `deprecated_on` y razón; nunca desaparece. |
| KOP-2 | La obsolescencia es declarativa: requiere `actor_id`, `at` y `timezone`. |
| KOP-3 | Declarar obsoleto no invalida la evidencia de origen. |
| KOP-4 | Todo `deprecated_on` propone un sucesor o declara explícitamente que no lo tiene. |
| KOP-5 | El estado obsoleto preferido es `SUPERSEDED` si hay relevo; `ARCHIVED` si solo es contexto. |
| KOP-6 | Un documento obsoleto sigue resoluble por su `doc_id` y su versión. |
| KOP-7 | Los consumidores deben poder reconstruir la versión vigente en cualquier fecha. |
| KOP-8 | Nunca se usa `RETIRED` como sinónimo de "ya no me gusta". |
| KOP-9 | La obsolescencia no reescribe el texto original. |
| KOP-10 | Un mandato superior (Constitución, Carta IA, D-003) no se declara obsoleto por misión de gobernanza subordinada. |

## 8.2 Supersedes

| ID | Regla |
|---|---|
| KSUP-1 | `supersedes` apunta a la versión/doc inmediatamente anterior. |
| KSUP-2 | `superseded_by` se escribe en el predecesor; ambos quedan legibles. |
| KSUP-3 | `supersedes` a un sucesor forma ciclo ⇒ `BLOCKED`. |
| KSUP-4 | Dos versiones vigentes sin cadena ⇒ `BLOCKED`. |
| KSUP-5 | Corregir crea versión; reemplazar crea documento nuevo con `REPLACES`. |
| KSUP-6 | La versión vigente se resuelve por vigencia y cadena, no por orden de filas. |
| KSUP-7 | El contenido de la versión anterior nunca se reescribe. |
| KSUP-8 | Un bump de taxonomía cambia versión, no `observation_id` ni `evidence_id`. |

## 8.3 Retiro

| ID | Regla |
|---|---|
| KRET-1 | Retirar es declarar `retired_on`, motivo y autor; no es borrar. |
| KRET-2 | `replaced_by` es obligatorio si existe relevo; si no, se declara `null` con razón. |
| KRET-3 | El documento retirado sigue siendo citado como histórico. |
| KRET-4 | Los consumidores degradan: no usan un retirado como ancla vigente. |
| KRET-5 | El retiro no cambia la evidencia ni el reporte que lo sustentaron. |
| KRET-6 | Un retiro por evidencia inválida se registra en el Ledger como propuesta de relación, no como escritura del KH. |
| KRET-7 | Retirar un `CANONICAL` exige nuevo `CANONICAL` o declaración de vacío gobernado. |
| KRET-8 | Ningún retiro elimina `DOC_CHAIN_ID`. |

## 8.4 Regeneración

| ID | Regla |
|---|---|
| KREG-1 | El registry documental se **regenera** desde el registro maestro; nunca se edita a mano (KEL-3). |
| KREG-2 | Toda regeneración produce entrada `REGENERATED` con `prev_chain_sha256`. |
| KREG-3 | La regeneración declara `observation_refs[]` derivados (KH-4, KHR-4). |
| KREG-4 | El snapshot anterior se conserva; no se sobrescribe. |
| KREG-5 | `docsByObservation`, `docsByEvidence`, `knowledgeByObservation` y `knowledgeByEvidence` se reconstruyen por lectura. |
| KREG-6 | No se crea un segundo índice: fuente única = registro maestro (MP-8, KHR-1, KEL-5). |
| KREG-7 | La regeneración no cambia estados de honestidad ni veredictos. |
| KREG-8 | Toda regeneración lleva huella del snapshot y `at` + `timezone`. |
| KREG-9 | Si hay conflicto documental sin resolver, se regenera solo después de D-003. |
| KREG-10 | Regenerar no autoriza implementación, UI, API ni IA. |

---

# 9. Los seis escenarios

| Escenario | IDs que cambian | Marcadores | IDs que NO cambian | Resultado |
|---|---|---|---|---|
| **Se actualiza** | `docver_`, `docchain_` | `supersedes` · `superseded_by` · `valid_from/valid_to` | `doc_id`, `observation_id` | Nueva versión vigente; anterior legible. |
| **Se divide** | N `doc_id` nuevos, `docrel_`, `docchain_` | `SPLIT_INTO` · `DERIVED_FROM` | `observation_id`, `doc_id` original | Linaje declarado; original intacto. |
| **Se fusiona** | `doc_id` nuevo, `docrel_`, `docchain_` | `MERGED_FROM` · `REPLACES` opcional | `observation_id`, documentos fuente | Huella propia; fuentes intactas. |
| **Se retira** | `docchain_`, `docrel_` | `retired_on` · `replaced_by` | `doc_id`, `observation_id`, evidencia | Marcador visible; sin borrado. |
| **Se controvierte** | `docchain_`, `docrel_` | `CONTRADICTS` · `DISPUTED` | Ningún documento se elimina | Ambas partes visibles; D-003 decide. |
| **Se invalida** | `docchain_`, `docver_`, `docrel_` | `INVALIDATED` · `retired_on` · `replaced_by` | `observation_id`, `evidence_id`, `report_id` | Degrada consumidores; traza intacta. |

> **Regla ESC-1:** en ningún escenario se borra, se reescribe ni se cambia `observation_id`.
> **Regla ESC-2:** corregir/actualizar conserva `doc_id`; dividir/fusionar crea IDs nuevos **con linaje declarado**.
> **Regla ESC-3:** controvertir nunca resuelve por fecha, votos ni confianza: resuelve D-003 con nueva entrada.

---

# 10. Registro maestro de documentos

> **Alcance declarado:** el registro maestro cubre la **cadena de gobernanza canónica y sus dependencias vigentes**, más reglas agregadas para el corpus legacy. Todo documento del ecosistema queda cubierto por una de las seis clases; los agregados `docs/historical/` → `ARCHIVED` y `Documentacion/` → `REFERENCE_ONLY` clasifican su totalidad sin reclasificar documento por documento (D-001, D-003).

| # | Documento | Ruta | Estado | Ancla / razón |
|---|---|---|---|---|
| 1 | Constitución V1.0.1 | `docs/CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md` | **CANONICAL** | Fundacional; misión, visión, propósito y principios. |
| 2 | Carta de Gobernanza IA V1.0.1 | `docs/CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md` | **CANONICAL** | Gobernanza IA; subordinada a la Constitución. |
| 3 | Decisión de Arquitectura Documental V1 | `docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md` | **CANONICAL** | D-001..D-010; autoridad de conflictos documentales. |
| 4 | Estado Canónico del Proyecto | `docs/CANONICAL_PROJECT_STATE_20261109.md` | **CANONICAL** | Nivel 2 de la jerarquía D-003. |
| 5 | Reglas del agente | `AGENTS.md` | **ACTIVE** | Nivel 3 de D-003; operación y continuidad. |
| 6 | Mapa Maestro del Ecosistema V1 | `docs/MAPA_MAESTRO_ECOSISTEMA_SIGCT_RURAL_V1.md` | **REFERENCE_ONLY** | Solo navegación; no crea gobernanza. |
| 7 | Identidad del Ecosistema | `docs/ECOSYSTEM_IDENTITY.md` | **REFERENCE_ONLY** | Fundacional vigente; no ARCHIVE (reconciliación 2026-11-19). |
| 8 | Gobernanza Documental | `docs/DOCUMENTATION_GOVERNANCE_REVIEW.md` | **REFERENCE_ONLY** | Nivel 4 de D-003. |
| 9 | MASTERDOC | `docs/MASTERDOC.md` | **REFERENCE_ONLY** | Nivel 5 de D-003. |
| 10 | Gobernanza Acústica V2 (índice) | `docs/acoustic/README.md` | **CANONICAL** | Padre acústico; seis documentos gobernados. |
| 11 | Taxonomía acústica v2 | `docs/acoustic/taxonomy_v2.md` | **ACTIVE** | 61 `class_id`; ancla al índice V2. |
| 12 | Política de etiquetado acústico v2 | `docs/acoustic/labeling_policy_v2.md` | **ACTIVE** | ALAB-1..10. |
| 13 | Clases secundarias v2 | `docs/acoustic/secondary_classes_v2.md` | **ACTIVE** | SC-1..12. |
| 14 | Política OOD v2 | `docs/acoustic/ood_policy_v2.md` | **ACTIVE** | OO-1..9; `evento_desconocido`. |
| 15 | Protocolo de anotación v2 | `docs/acoustic/annotation_protocol_v2.md` | **ACTIVE** | AN-AC-1..10; κ `PENDING`. |
| 16 | Roadmap dataset acústico v2 | `docs/acoustic/dataset_v2_roadmap.md` | **ACTIVE** | G-RM-0..6; `v2/` no materializado. |
| 17 | Gobernanza de Visión V1 | `docs/vision/VISION_GOVERNANCE_V1.md` | **CANONICAL** | Padre visual; `scene_id` y clases atómicas. |
| 18 | Taxonomía de Visión V1 | `docs/vision/VISION_TAXONOMY_V1.md` | **ACTIVE** | 8 `scene_id`; clases atómicas. |
| 19 | Política de etiquetado visual | `docs/vision/VISION_LABELING_POLICY_V1.md` | **ACTIVE** | Reglas de anotación visual. |
| 20 | Política OOD visual | `docs/vision/VISION_OOD_POLICY_V1.md` | **ACTIVE** | Sentinela y rechazo gobernado. |
| 21 | Roadmap de dataset visual | `docs/vision/VISION_DATASET_ROADMAP_V1.md` | **ACTIVE** | 25 riesgos; sin dataset materializado. |
| 22 | Gobernanza de Telemetría V1 | `docs/telemetry/TELEMETRY_GOVERNANCE_V1.md` | **CANONICAL** | Padre telemétrico; `NO_DATA` y 6 IDs. |
| 23 | Taxonomía de Telemetría V1 | `docs/telemetry/TELEMETRY_TAXONOMY_V1.md` | **ACTIVE** | 24 métricas y 6 familias. |
| 24 | Política de etiquetado telemétrico | `docs/telemetry/TELEMETRY_LABELING_POLICY_V1.md` | **ACTIVE** | Reglas de etiquetado. |
| 25 | Política OOD telemétrica | `docs/telemetry/TELEMETRY_OOD_POLICY_V1.md` | **ACTIVE** | `lectura_desconocida` como `DISENO`. |
| 26 | Roadmap de dataset telemétrico | `docs/telemetry/TELEMETRY_DATASET_ROADMAP_V1.md` | **ACTIVE** | 25 riesgos; 10 dominios. |
| 27 | Gobernanza Multimodal V1 | `docs/governance/SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1.md` | **CANONICAL** | OB-1..5; raíz `OBSERVATION_ID`. |
| 28 | Modelo de entidades multimodal | `docs/governance/multimodal_entity_model_v1.md` | **ACTIVE** | D-1..D-10. |
| 29 | Masterplan Multimodal V1 | `docs/governance/SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md` | **CANONICAL** | OBS-10..14; 10 años sin refactor de raíz. |
| 30 | Observation Platform V1 | `docs/governance/SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md` | **CANONICAL** | ACP-1..8, KH-1..6, `ObservationPackage`. |
| 31 | Observation Registry V1 | `docs/governance/SIGCTIARURAL_OBSERVATION_REGISTRY_V1.md` | **CANONICAL** | ACR-1..10, KHR-1..8; identidad y trazabilidad. |
| 32 | Modelo de entidades del Registry | `docs/governance/OBSERVATION_REGISTRY_ENTITY_MODEL_V1.md` | **ACTIVE** | D-R1..D-R8. |
| 33 | Roadmap del Registry | `docs/governance/OBSERVATION_REGISTRY_ROADMAP_V1.md` | **ACTIVE** | Fases y 30 riesgos. |
| 34 | Evidence Ledger V1 | `docs/governance/SIGCTIARURAL_EVIDENCE_LEDGER_V1.md` | **CANONICAL** | AEL-1..12, KEL-1..10, REP-1..8. |
| 35 | Modelo de entidades del Ledger | `docs/governance/EVIDENCE_LEDGER_ENTITY_MODEL_V1.md` | **ACTIVE** | D-EL1..D-EL8. |
| 36 | Roadmap del Ledger | `docs/governance/EVIDENCE_LEDGER_ROADMAP_V1.md` | **ACTIVE** | Fases y 30 riesgos. |
| 37 | ACP Consumer Architecture V1 | `docs/governance/SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md` | **CANONICAL** | CR-1..6, ACS/ACF/ATR/AAUD, KHA-1..10. |
| 38 | Modelo de entidades del ACP | `docs/governance/ACP_ENTITY_MODEL_V1.md` | **ACTIVE** | D-ACP1..D-ACP10. |
| 39 | Roadmap del ACP | `docs/governance/ACP_ROADMAP_V1.md` | **ACTIVE** | Fases y 40 riesgos. |
| 40 | Knowledge Hub Architecture V1 | `docs/governance/SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1.md` | **CANONICAL** | Este documento; autoridad de canonización. |
| 41 | Modelo de entidades del KH | `docs/governance/KNOWLEDGE_HUB_ENTITY_MODEL_V1.md` | **ACTIVE** | D-KH1..D-KH10. |
| 42 | Roadmap del KH | `docs/governance/KNOWLEDGE_HUB_ROADMAP_V1.md` | **ACTIVE** | Fases y 40 riesgos. |
| 43 | Estrategia F3E de integración del conocimiento | `Documentacion/Arquitectura/CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md` | **REFERENCE_ONLY** | Origen del Hangar; legacy TOSHIBA bajo D-003. |
| 44 | Corpus histórico | `docs/historical/` | **ARCHIVED** | Preservado, no normativo, nunca borrado. |
| 45 | Repositorio legacy de arquitectura | `Documentacion/` | **REFERENCE_ONLY** | Nivel 6 de D-003; contexto histórico. |

**Regla MASTER-1:** el registro maestro es la **única fuente** para derivar el registry y las cuatro vistas.
**Regla MASTER-2:** clasificar no reescribe el documento clasificado; es una declaración gobernada.
**Regla MASTER-3:** un cambio de clasificación produce versión y entrada de cadena, nunca edición silenciosa.

---

# 11. Vistas derivadas

> Las cuatro vistas se **derivan por lectura** del registro maestro. No se escriben por separado: fuente única, sin doble escritura (KH-1, MP-8, KHR-1, KEL-5, KHA-5).

| Vista | Definición | Entrada | Salida | Regla |
|---|---|---|---|---|
| `docsByObservation(observation_id)` | Documentos que citan esa observación en `observation_refs[]`. | `observation_id` exacto | `doc_id[]` + estado documental + versión | N:M derivado (KH-5, KHR-3). |
| `docsByEvidence(evidence_id)` | Documentos cuyo `promotion_ref` ancla esa evidencia. | `evidence_id` exacto | `doc_id[]` + `DOC_PROMOTION_ID` | N:M derivado (KEL-6). |
| `knowledgeByObservation(observation_id)` | Cadenas de conocimiento (promoción→reporte→evidencia) trazables a esa observación. | `observation_id` exacto | `DOC_PROMOTION_ID[]` + traza | No es un índice nuevo: proyección del registro maestro. |
| `knowledgeByEvidence(evidence_id)` | Cadenas de conocimiento ancladas a esa evidencia. | `evidence_id` exacto | `DOC_PROMOTION_ID[]` + traza | Misma fuente, distinto filtro. |

**Regla VIEW-1:** `docsBy*` responde "qué documentos"; `knowledgeBy*` responde "qué afirmaciones admitidas".
**Regla VIEW-2:** búsqueda exacta por ID; prohibido `LIKE`, prefijo, fuzzy, embedding y similitud (BS-2, ACS-8).
**Regla VIEW-3:** resultado vacío es `NO_DATA` gobernado, nunca error silencioso.
**Regla VIEW-4:** ninguna vista eleva estados ni confianza: muestra lo heredado.
**Regla VIEW-5:** toda vista se regenera con el registry; nunca se edita a mano.

---

# 12. Trazabilidad completa del conocimiento

```
  CONOCIMIENTO   DOC_PROMOTION_ID -> DOC_ID (estado documental)
        │
        ▼
  REPORTE        ACP_REPORT_ID (veredicto + anclas + MIN)
        │
        ▼
  EVIDENCIA      evidence_id + evdver_ vigente + evdchain_ + sha256
        │
        ▼
  OBSERVACIÓN    observation_id en Registry + asset_ids[] + event_ids[]
```

| Regla | Garantía |
|---|---|
| Todos los niveles llevan ID exacto y versión. | Reconstrucción sin sistema externo. |
| `DOC_PROMOTION_ID` conserva `report_ref`, `evidence_refs[]` y `observation_ref`. | Retroceso completo. |
| `DOC_CHAIN_ID` es append-only con `prev_chain_sha256`. | Integridad de la custodia documental. |
| Los snapshots de registry se preservan. | Estado en cualquier fecha. |
| `doc_id` es referencia, nunca copia. | Sin duplicación de bytes (KH-3). |

---

# 13. Quince reglas de promoción (`KPR-1..KPR-15`)

| ID | Regla |
|---|---|
| **KPR-1** | Toda promoción nace de un `promotion_candidate` de `ACP_REPORT_ID`. |
| **KPR-2** | ACP propone; **Knowledge Hub decide** (KHA-2). |
| **KPR-3** | LLM no crea conocimiento; solo interpreta (P-IA-5). |
| **KPR-4** | Ledger no crea conocimiento; solo provee evidencia (KEL-2). |
| **KPR-5** | Se exigen las 15 condiciones mínimas del §6. |
| **KPR-6** | Sin `hangar_verdict` y `d003_check`, promoción `BLOCKED`. |
| **KPR-7** | Sin aprobación humana con `reviewer_id` y `reason`, promoción `BLOCKED`. |
| **KPR-8** | Decisión solo `ADMITTED` · `DEFERRED` · `REJECTED`. |
| **KPR-9** | Evidencia `DISPUTED`/`RETIRED` no puede sustentar promoción vigente. |
| **KPR-10** | La confianza nunca se eleva: `≤ MIN(anclas)`. |
| **KPR-11** | El estado honesto se hereda; `DISENO`/`REF` nunca se muestran como `REAL`. |
| **KPR-12** | Los 5 veredictos son cerrados; `HIPÓTESIS` inactivo (G-IA-1). |
| **KPR-13** | `doc_id` es referencia al registry, nunca copia de bytes. |
| **KPR-14** | Toda promoción produce entrada `PROMOTED` en `DOC_CHAIN_ID`. |
| **KPR-15** | Promover no publica: la publicación es regeneración gobernada. |

# 14. Quince reglas de trazabilidad (`KTR-1..KTR-15`)

| ID | Regla |
|---|---|
| **KTR-1** | Conocimiento → reporte → evidencia → observación, sin saltos. |
| **KTR-2** | Cada promoción conserva `report_ref`, `evidence_refs[]` y `observation_ref`. |
| **KTR-3** | `DOC_ID` declara `observation_refs[]` derivados (KH-4). |
| **KTR-4** | Se cita la versión exacta de evidencia consultada. |
| **KTR-5** | `DOC_CHAIN_ID` registra cada cambio con actor, razón y zona horaria. |
| **KTR-6** | La traza es append-only con `prev_chain_sha256`. |
| **KTR-7** | La traza sobrevive a correcciones posteriores. |
| **KTR-8** | Los reportes antiguos siguen anclados a las versiones que leyeron. |
| **KTR-9** | `docsBy*` y `knowledgeBy*` son proyecciones, no fuentes. |
| **KTR-10** | Búsqueda exacta por ID; sin inferencia por fecha ni similitud. |
| **KTR-11** | Toda fecha exige `timezone`. |
| **KTR-12** | Un `doc_id` sin promoción no es trazable como conocimiento. |
| **KTR-13** | El retroceso es posible desde cualquier vista hasta la observación. |
| **KTR-14** | Los snapshots de registry permiten reconstruir el estado en una fecha. |
| **KTR-15** | Pérdida de trazabilidad ⇒ `BLOCKED`, nunca "se arregla" reescribiendo. |

# 15. Quince reglas de obsolescencia (`KOB-1..KOB-15`)

| ID | Regla |
|---|---|
| **KOB-1** | Obsolescencia se declara con `deprecated_on` y razón. |
| **KOB-2** | Nunca implica borrado ni reescritura. |
| **KOB-3** | `supersedes`/`superseded_by` son obligatorios cuando hay relevo. |
| **KOB-4** | `retired_on` y `replaced_by` son obligatorios en retiro. |
| **KOB-5** | `SUPERSEDED` conserva la versión anterior legible. |
| **KOB-6** | `ARCHIVED` es preservación, no eliminación. |
| **KOB-7** | `REFERENCE_ONLY` nunca se usa como sustento propio. |
| **KOB-8** | Un canónico retirado exige nuevo canónico o vacío gobernado declarado. |
| **KOB-9** | Los marcadores son datos, no borrados. |
| **KOB-10** | La obsolescencia no cambia la evidencia de origen. |
| **KOB-11** | Los conflictos se resuelven por D-003, no por antigüedad. |
| **KOB-12** | Un sucesor declara su predecesor; un predecesor declara su relevo. |
| **KOB-13** | Sin ciclos de `supersedes`/`REPLACES`. |
| **KOB-14** | Los formatos abiertos garantizan legibilidad a 10 años. |
| **KOB-15** | Declarar obsoleto un documento fundacional requiere autoridad superior a la misión que lo declara. |

# 16. Quince reglas de auditoría (`KAU-1..KAU-15`)

| ID | Regla |
|---|---|
| **KAU-1** | Toda promoción declara `actor_id`, `reviewer_id`, `at` y `timezone`. |
| **KAU-2** | Registra qué anclas se consultaron y en qué versión. |
| **KAU-3** | Registrador, revisor y auditor son roles distintos. |
| **KAU-4** | Auditar es solo lectura: el auditor no promueve ni corrige. |
| **KAU-5** | Toda regeneración produce `REGENERATED` con huella. |
| **KAU-6** | Toda exportación produce `EXPORTED` con destino y huella. |
| **KAU-7** | Huella rota ⇒ `BLOCKED`. |
| **KAU-8** | Confianza elevada por encima del `MIN` ⇒ `BLOCKED`. |
| **KAU-9** | Veredicto nuevo o `HIPÓTESIS` activo ⇒ `BLOCKED`. |
| **KAU-10** | Escritura del KH en Registry o Ledger ⇒ `BLOCKED`. |
| **KAU-11** | Promoción efectuada por ACP o LLM ⇒ `BLOCKED`. |
| **KAU-12** | Borrado o reescritura histórica ⇒ `BLOCKED`. |
| **KAU-13** | Un hallazgo se corrige con entrada nueva, nunca tachando la anterior. |
| **KAU-14** | Retención mínima: 10 años, sin compactación destructiva. |
| **KAU-15** | Todo hallazgo se verifica con fixture de rechazo (G-KH-8). |

# 17. Quince reglas de canonización (`KCN-1..KCN-15`)

| ID | Regla |
|---|---|
| **KCN-1** | D-003 gobierna la jerarquía documental; el KH la acata. |
| **KCN-2** | Solo un `CANONICAL` por asunto y dominio. |
| **KCN-3** | `CANONICAL` requiere promoción admitida y registry regenerado. |
| **KCN-4** | La existencia de evidencia no canoniza (KH-2, KEL-2). |
| **KCN-5** | La existencia de un reporte no canoniza (KHA-2). |
| **KCN-6** | El Hangar de Autenticidad es puerta, no sustituto de D-003. |
| **KCN-7** | Los conflictos documentales los resuelve D-003 (KHR-8). |
| **KCN-8** | El registry se regenera, nunca se edita a mano (KEL-3). |
| **KCN-9** | El registro maestro se actualiza antes de regenerar. |
| **KCN-10** | Las vistas derivadas se reconstruyen por lectura, sin doble escritura. |
| **KCN-11** | Los 7 estados honestos se presentan tal cual (KH-6). |
| **KCN-12** | `REF` y legacy nunca se canonizan como evaluación propia. |
| **KCN-13** | Todo cambio de canonización produce versión y cadena. |
| **KCN-14** | La canonización no crea hechos, evidencia ni reportes. |
| **KCN-15** | Canonizar no autoriza implementación, UI, API ni IA. |

---

# 18. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado |
|---|---|---|
| **G-KH-1** | 3 documentos visibles con D-004.6 y subordinación a D-003 | `DISENO` |
| **G-KH-2** | 5 IDs definidos, ninguno compite con las 3 raíces | `DISENO` |
| **G-KH-3** | 6 estados documentales definidos y ortogonales a los 7 estados | `DISENO` |
| **G-KH-4** | Ciclo de 6 pasos y condiciones de promoción verificables | `DISENO` |
| **G-KH-5** | ACP propone / KH decide / LLM interpreta / Ledger provee | `DISENO` |
| **G-KH-6** | Registro maestro con 6 clases y 4 vistas derivadas sin doble escritura | `DISENO` |
| **G-KH-7** | 10 diagramas + 5 bloques de 15 reglas presentes | `DISENO` |
| **G-KH-8** | 40 riesgos con severidad, umbral, mitigación y fixture | `DISENO` |
| **G-KH-9** | Coherencia con 9 documentos y raíz/trazabilidad intactas | `DISENO` |

---

# 19. Validación de coherencia

| # | Documento | Contrato acatado | Estado |
|---|---|---|---|
| 1 | Acoustic Governance V2 | `legacy_sample_id`, `sha256`, 61 `class_id`, OOD sin cupos. | ✅ Sin cambio |
| 2 | Vision Governance V1 | `scene_id`, clases atómicas, 25 riesgos. | ✅ Sin cambio |
| 3 | Telemetry Governance V1 | `NO_DATA ≠ 0 ≠ NULL`, `lectura_desconocida`, 24 métricas. | ✅ Sin cambio |
| 4 | Multimodal Governance V1 | OB-1..5; `observation_id` raíz. | ✅ Sin cambio |
| 5 | Multimodal Masterplan V1 | OBS-10..14; 10 años sin refactor. | ✅ Sin cambio |
| 6 | Observation Platform V1 | KH-1..6; `docsByObservation` derivado. | ✅ Sin cambio |
| 7 | Observation Registry V1 | ACR-1..10, KHR-1..8; sin inferencia. | ✅ Sin cambio |
| 8 | Evidence Ledger V1 | AEL-1..12, KEL-1..10; ACP no crea evidencia. | ✅ Sin cambio |
| 9 | ACP Consumer Architecture V1 | CR-1..6, KHA-1..10; ACP propone, KH decide. | ✅ Sin cambio |

**Adicionales intactos:** Carta IA (P-IA-1..7), F3E (Hangar y regeneración), D-003 (jerarquía y conflictos) y Constitución V1.0.1.

---

# 20. Cierre

**Criterio de éxito:** obtener la arquitectura oficial del Knowledge Hub y del sistema de canonización y obsolescencia documental del ecosistema SIGCT-Rural, sin modificar `observation_id`, sin modificar el Observation Registry, sin modificar el Evidence Ledger y sin romper la trazabilidad completa observación → evidencia → reporte → conocimiento. Se satisface en el plano contractual: cinco IDs subordinados, seis estados documentales, seis escenarios sin borrado, registro maestro, cuatro vistas derivadas, 75 reglas y 40 riesgos.

**Estado honesto:** **OFICIAL y DISEÑADO**. Sin base de datos, UI, API, IA, agente, LLM, embedding, vector store ni RAG. Sin modificar ningún documento existente. Sin commit, push, merge ni tag. Los 9 gates permanecen abiertos.

---

*Fin de la arquitectura del Knowledge Hub V1. Complementa —nunca sustituye— la Constitución, la Carta IA, D-003, la Observation Platform V1, el Observation Registry V1, el Evidence Ledger V1 y la ACP Consumer Architecture V1.*
