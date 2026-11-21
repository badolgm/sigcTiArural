# MODELO DE ENTIDADES DEL KNOWLEDGE HUB V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T00:06:52-05:00
> - Origen: misión `SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1` (documento nuevo)
> - Destino: `docs/governance/KNOWLEDGE_HUB_ENTITY_MODEL_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: modelo declarativo. No crea base de datos, UI, API, IA, agente, LLM, embedding, vector store ni RAG.

**Padre:** `SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1.md`
**Naturaleza:** 10 diagramas ASCII (`D-KH1`..`D-KH10`), cardinalidades, estados y fixtures de rechazo.
**Estado:** **OFICIAL — DISEÑADO**.

> **Invariante:** `OBSERVATION_ID` es la raíz única. Los IDs `doc_` nunca compiten con `OBSERVATION_ID`, `EVIDENCE_ID`, `EVENT_ID` ni `ACP_REPORT_ID`.
> **Invariante de no-ejecución:** los diagramas son contratos lógicos, no esquemas físicos ni implementación.

---

## D-KH1 — Cadena canónica completa

```
  OBSERVACION          EVIDENCIA           REPORTE           PROMOCION
  observation_id  -->  evidence_id[]  -->  ACP_REPORT_ID --> DOC_PROMOTION_ID
      (raíz)            (Ledger)           (ACP/IA-1)        (KH + humano)
                                                                    |
                                                                    v
  DOCUMENTO CANONICO <----------------- CONOCIMIENTO <---------------+
  DOC_ID (registro)                     afirmacion admitida
      |                                        ^
      +--------------- traza inversa ------------+
              DOC_PROMOTION_ID -> report_ref -> evidence_refs[] -> observation_ref
```

**Cardinalidad:** 1 observación → 0..N evidencias → 0..N reportes → 0..1 promoción por candidato → 1 documento.
**Fixture de rechazo:** promoción sin `report_ref` o sin `observation_ref` ⇒ `BLOCKED` (KTR-1, KTR-2).

---

## D-KH2 — Los cinco IDs y su subordinación

```
                    +----------------------+
                    |  OBSERVATION_ID      |  raíz inmutable (única)
                    +----------+-----------+
                               | ancla
             +-----------------+-----------------+
             v                                   v
     +---------------+                   +----------------+
     | EVIDENCE_ID   |                   | EVENT_ID       |
     | (Ledger)      |                   | (Registry)     |
     +-------+-------+                   +----------------+
             | evdver_                           ^
             |                                  |
     +-------v-------+                          |
     | ACP_REPORT_ID |  ancla ambos ------------+
     +-------+-------+
             | promotion_candidate (KHA-3)
             v
  +----------------------------+
  | DOC_PROMOTION_ID  docprom_ |  <-- decide KH, no ACP
  +------------+---------------+
               | produce
    +----------+-----------+---------------+---------------+
    v          v           v               v               v
 doc_      docver_     docchain_       docrel_        (vistas derivadas)
```

**Fixture de rechazo:** un `docprom_` sin ancla `observation_id` válida ⇒ `BLOCKED` (KID-11, KID-12).

---

## D-KH3 — Estructura de `DOC_ID`

```
  +-------------------------------------------------------------+
  | DOC_ID  doc_...                                             |
  +-------------------------------------------------------------+
  | title              : string                                |
  | category           : categoria KH declarada                |
  | state              : 6 estados documentales                |
  | observation_refs[] : OBSERVATION_ID[]   (derivado KH-4)     |
  | evidence_refs[]    : EVIDENCE_ID[]                          |
  | report_ref[]       : ACP_REPORT_ID[]                        |
  | promotion_ref      : DOC_PROMOTION_ID  (si falta: REFERENCE_ONLY)|
  | version_ref        : DOC_VERSION_ID vigente                |
  | chain_ref          : DOC_CHAIN_ID                           |
  | checksum           : sha256 del registro, NO del paquete    |
  | at + timezone      : obligatorios                           |
  +-------------------------------------------------------------+
```

**Regla:** `doc_id` es referencia al registry, nunca copia de bytes (KH-3, KID-3).
**Fixture de rechazo:** `doc_id` con `checksum` del `ObservationPackage` ⇒ `BLOCKED`.

---

## D-KH4 — Versión y cadena append-only

```
  DOC_VERSION_ID (docver_0001)          DOC_CHAIN_ID (docchain_)
  +----------------------+              +--------------------------+
  | seq4: 0001           |              | seq6: 000001  PROMOTED   |
  | supersedes: null     |<-------------| seq6: 000002  REGENERATED|
  | superseded_by: 0002  |              | seq6: 000003  CERTIFIED  |
  | manifest_sha256      |              | seq6: 000004  UPDATED    |
  | valid_from / valid_to|              | seq6: 000005  SUPERSEDED |
  | reason / actor_id    |              | seq6: 000006  DEPRECATED |
  +----------+-----------+              | ... prev_chain_sha256    |
             ^                          +--------------------------+
             | supersedes
  +----------+-----------+
  | DOC_VERSION_ID 0002  |
  | supersedes: 0001     |
  | vigente (valid_to=null)
  +----------------------+
```

**Regla:** no existe `DELETE`/`UPDATE`; corregir crea `seq4+1` (KID-4..8).
**Fixture de rechazo:** dos versiones vigentes sin `superseded_by` ⇒ `BLOCKED` (KSUP-4).

---

## D-KH5 — Promoción gobernada

```
  ACP_REPORT_ID (promotion_candidate)
          |
          v
  +---------------------- Hangar de Autenticidad ----------------------+
  | reproducibilidad | huella sha256 | licencia | consistencia       |
  +-----------------------------+-------------------------------------+
                                v
  +---------------------- D-003 --------------------------------------+
  | docs/ > CANONICAL_PROJECT_STATE > AGENTS > REVIEW > MASTERDOC > legacy|
  +-----------------------------+-------------------------------------+
                                v
  +---------------------- Revisor humano -----------------------------+
  | reviewer_id + reason (P-IA-6)                                    |
  +-----------------------------+-------------------------------------+
                                v
  DOC_PROMOTION_ID: decision = ADMITTED | DEFERRED | REJECTED
                                |
                                v
                    entrada PROMOTED en DOC_CHAIN_ID
```

**Fixture de rechazo:** `ADMITTED` sin `hangar_verdict`, `d003_check` o `reviewer_id` ⇒ `BLOCKED` (KPR-6, KPR-7, KID-12).

---

## D-KH6 — Seis estados documentales

```
  +-------------+     +--------+     +-------------+
  | REFERENCE_  |     | ACTIVE |     | CANONICAL   |
  | ONLY        |     |        |     | (1 por tema)|
  +------+------+     +---+----+     +------+------+
         |                |                |
         | promocion      | supersedes     | deprecated_on / retired_on
         v                v                v
  +------------------+  +------------------------+
  | ARCHIVED         |  | SUPERSEDED / RETIRED   |
  | (preservado,     |  | (legible, no vigente)  |
  |  nunca borrado)  |  +------------------------+
  +------------------+
```

**Regla:** los 6 estados documentales son ortogonales a los 7 estados de honestidad y a los 5 veredictos.
**Fixture de rechazo:** documento `ARCHIVED` presentado como vigente ⇒ `BLOCKED` (EST-1, KOB-6).

---

## D-KH7 — Seis escenarios de cambio

```
  ACTUALIZA   doc_id ----> docver_(n+1) [supersedes]  doc_id intacto
  DIVIDE      doc_id ----> doc_A + doc_B [SPLIT_INTO / DERIVED_FROM]
  FUSIONA     doc_A + doc_B ----> doc_C [MERGED_FROM / REPLACES]
  RETIRA      doc_id ----> [retired_on + replaced_by]  sin borrado
  CONTROVIERTE doc_A <--> doc_B [CONTRADICTS + DISPUTED] -> D-003
  INVALIDA    docver_ ----> [INVALIDATED + retired_on + replaced_by]
```

**Regla:** ningún escenario cambia `observation_id`, borra historia ni reescribe el original (ESC-1..3).
**Fixture de rechazo:** `SPLIT_INTO` sin `DERIVED_FROM`o `MERGED_FROM` sin fuentes declaradas ⇒ `BLOCKED`.

---

## D-KH8 — Registro maestro y regeneración

```
  +----------------------------------------------------------+
  | REGISTRO MAESTRO (única fuente)                          |
  | 45 filas: CANONICAL / ACTIVE / SUPERSEDED /              |
  | RETIRED / ARCHIVED / REFERENCE_ONLY                      |
  +---------------------------+------------------------------+
                              | regeneración (KREG-1..10)
                              v
  +----------------------------------------------------------+
  | knowledgeRegistry.generated.json (snapshot preservado)   |
  +---------------------------+------------------------------+
                              | lectura pura (sin doble escritura)
              +---------------+---------------+---------------+
              v               v               v               v
      docsByObservation  docsByEvidence  knowledgeByObs  knowledgeByEv
```

**Fixture de rechazo:** edición manual del registry ⇒ `BLOCKED` (KCN-8, KREG-1, KEL-3).

---

## D-KH9 — Vistas derivadas

```
  docsByObservation(oid) -----> doc_id[] + state + version
  docsByEvidence(eid)  -----> doc_id[] + DOC_PROMOTION_ID
  knowledgeByObservation(oid) -> DOC_PROMOTION_ID[] + traza completa
  knowledgeByEvidence(eid)    -> DOC_PROMOTION_ID[] + traza completa

  Todas: resolucion EXACTA por ID. Sin LIKE / fuzzy / embedding / similitud.
  Vacío => NO_DATA gobernado (nunca 0, nunca null inventado).
```

**Fixture de rechazo:** búsqueda por prefijo o similitud ⇒ `BLOCKED` (VIEW-2, ACS-8, BS-2).

---

## D-KH10 — Trazabilidad inversa y aislamiento de roles

```
  CONOCIMIENTO (DOC_PROMOTION_ID + DOC_ID)
        |
        | report_ref
        v
  REPORTE (ACP_REPORT_ID: veredicto + MIN + anclas)
        |
        | evidence_version_ids[]
        v
  EVIDENCIA (evidence_id + evdver_ + evdchain_ + sha256)
        |
        | observation_ref
        v
  OBSERVACION (observation_id en Registry)

  ROLES (separacion estricta):
  ACP --propone--> KH --decide--> Registrador --registra--> Auditor --lee-->
  LLM --interpreta--> ACP         Ledger --provee--> KH
  Prohibido: ACP promover | LLM promover | KH escribir Registry/Ledger
```

**Fixture de rechazo:** promoción ejecutada por ACP/LLM o KH escribiendo en Registry/Ledger ⇒ `BLOCKED` (KAU-10, KAU-11).

---

## Resumen de fixtures de rechazo

| Diagrama | Fixture de rechazo |
|---|---|
| D-KH1 | Promoción sin `report_ref` u `observation_ref`. |
| D-KH2 | `docprom_` sin ancla raíz válida. |
| D-KH3 | `doc_id` transportando bytes del paquete. |
| D-KH4 | Dos versiones vigentes sin `superseded_by`. |
| D-KH5 | `ADMITTED` sin Hangar, D-003 o revisor. |
| D-KH6 | `ARCHIVED` mostrado como vigente. |
| D-KH7 | `SPLIT_INTO`/`MERGED_FROM` sin linaje. |
| D-KH8 | Edición manual del registry. |
| D-KH9 | Búsqueda por similitud o prefijo. |
| D-KH10 | ACP/LLM promoviendo o KH escribiendo fuentes. |

---

*Fin del modelo de entidades del Knowledge Hub V1. Complementa la arquitectura padre sin redefinir raíces ni contratos existentes.*
