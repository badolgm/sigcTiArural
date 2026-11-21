# MODELO DE ENTIDADES DEL REGISTRO DE OBSERVACIONES V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T23:09:16-05:00
> - Origen: misión `SIGCTIARURAL_OBSERVATION_REGISTRY_V1` (documento nuevo)
> - Destino: `docs/governance/OBSERVATION_REGISTRY_ENTITY_MODEL_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: modelo conceptual del Registry. Diagramas y cardinalidades; no crea esquema físico, base de datos ni código.

**Misión:** `SIGCTIARURAL_OBSERVATION_REGISTRY_V1`
**Naturaleza:** modelo **conceptual** de entidades, relaciones y máquinas de estado. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Autoridad:** `docs/governance/SIGCTIARURAL_OBSERVATION_REGISTRY_V1.md`
**Relación con el modelo anterior:** extiende `docs/governance/multimodal_entity_model_v1.md` (D-1..D-10) **sin reemplazarlo**. Las tres entidades originales (`OBSERVATION_ID`, `ASSET_ID`, `EVENT_ID`) conservan su definición; aquí se añaden las cuatro entidades de gobierno del Registry.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante:** `observation_id` es la única raíz de evidencia. Los cuatro IDs nuevos son hijos o vistas.

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Entidades originales gobernadas | **3** (`observation`, `asset`, `event`) — intactas |
| Entidades nuevas del Registry | **4** (`registry_id`, `version`, `history`, `relation`) |
| Entidades referenciadas ya definidas | **2** (`report`, `document`) — no se redefinen |
| Instancias reales en el Registry | **0** |
| Esquemas físicos / tablas / API | **0** |
| Diagramas | **8** (D-R1..D-R8) |

---

# 1. Inventario de entidades

| Entidad | ID | Cardenalidad respecto a observación | Mutabilidad | Estado hoy |
|---|---|---|---|---|
| Observación | `observation_id` | 1 (raíz) | Identidad inmutable; metadatos versionados | Contrato ratificado |
| Asset | `asset_id` | 1:N | Bytes inmutables; corrección ⇒ nuevo ID | Ratificado / `DISENO` por modalidad |
| Evento | `event_id` | N:M vía observaciones | Retiro ⇒ `SUPERSEDED_BY`, nunca borrado | Ratificado |
| Época del registro | `reg_` | 1:N (muchas épocas, mismas raíces) | Vigencia con `valid_to`, nunca borrada | `DISENO` |
| Versión | `obsver_` | 1:N | Append-only | `DISENO` |
| Historia | `obshist_` | 1:N | Append-only | `DISENO` |
| Relación | `obsrel_` | 0:N | Append-only | `DISENO` |
| Reporte | `report_id` | 0:N (referencia) | Gobernanza ACP, fuera del Registry | `DISENO` |
| Documento | `doc_id` | 0:N (referencia derivada) | Gobernanza D-003 / KH | Referencia |

**Regla ME-1:** el Registry **no posee** reportes ni documentos: solo guarda el ID por el que se resuelven.
**Regla ME-2:** las cuatro entidades nuevas son **metadatos de gobierno**; ninguna transporta bytes de evidencia.

---

# 2. D-R1 — Grafo de propiedad y gobierno

```
                       ┌─────────────────────────────┐
                       │  reg_ (época de autoridad)   │
                       │  reg_20261120_sigct_001      │
                       └──────────────┬──────────────┘
                                      │ gobierna (1:N, sin cambiar raíz)
                                      ▼
                       ┌─────────────────────────────┐
                       │   observation_id  (RAÍZ)     │
                       │  obs_20261120_..._0001       │
                       └──────┬──────────────┬───────┘
                              │ 1:N          │ 1:N
              ┌───────────────┘              └────────────────┐
              ▼                                               ▼
     ┌────────────────┐                            ┌────────────────────┐
     │ asset_id (N)   │                            │ obsver_ (1..N)      │
     │ audio_/image_/ │                            │ versión vigente     │
     │ telemetry_/... │                            │ por supersedes      │
     └───────┬────────┘                            └─────────┬──────────┘
             │ 0:N (reconocen)                               │ 1:N
             ▼                                               ▼
     ┌────────────────┐                            ┌────────────────────┐
     │ event_id (N:M) │                            │ obshist_ (append)  │
     └───────┬────────┘                            └─────────┬──────────┘
             │ 0:N (evidencia)                               │ 0:N
             ▼                                               ▼
     ┌────────────────┐                            ┌────────────────────┐
     │ evidence_id[]  │                            │ obsrel_ (aristas)  │
     └───────┬────────┘                            └────────────────────┘
             ▼
     ┌────────────────┐        ┌────────────────┐
     │ report_id      │──►────►│ doc_id (KH)    │
     └────────────────┘        └────────────────┘
```

**Lectura:** el `reg_` gobierna, pero **no contiene** observaciones. Los assets no se encadenan entre sí: cuelgan de la raíz. Los eventos son el único nodo que cruza raíces. Los reportes y documentos son referencias finales, no nodos poseídos.

---

# 3. D-R2 — Identidad: raíz versus vistas

```
   observation_id  ──────────────────────────►  (ÚNICA RAÍZ, 10 años)
        │
        ├── obsver_<obs>_0001   ← vista del estado declarativo en T1
        ├── obsver_<obs>_0002   ← vista del estado declarativo en T2 (supersedes 0001)
        │
        ├── obshist_<obs>_000001  ← entrada append-only
        ├── obshist_<obs>_000002  ← entrada append-only (prev_sha256 encadenado)
        │
        └── obsrel_SUPERSEDES_000001  ← arista 0002 → 0001
```

| Regla | Consecuencia |
|---|---|
| La raíz no codifica versión | `obsver_` puede cambiar sin tocar `observation_id` (OBS-12). |
| La raíz no codifica época | `reg_` puede relevarse sin migrar observaciones (REG-1). |
| La raíz no codifica taxonomía | v1 → v2 → v3 es una versión, no una nueva raíz (OB-2). |
| La raíz es opaca | Ningún consumidor la descompone (OBS-10). |

---

# 4. D-R3 — Versión vigente y `supersedes`

```
  obsver_..._0001  ──supersedes──►  obsver_..._0002  ──supersedes──►  obsver_..._0003
   valid_to = T2                    valid_to = T3                    valid_to = null (VIGENTE)
   conservada                       conservada                       activa
```

| Campo | Regla |
|---|---|
| `seq4` | Monótono; nunca se reutiliza. |
| `supersedes` | Apunta a la versión inmediatamente anterior; la primera usa `null`. |
| `valid_from` / `valid_to` | Rango de vigencia; `valid_to` se **escribe**, no se borra la versión. |
| `manifest_sha256` | Huella de esa versión; distinta huella ⇒ versión distinta. |
| Vigente | Se resuelve por `valid_to = null` **y** cadena `supersedes` coherente; nunca por "última fila" (VER-4). |

**Regla D-R3-1:** un `supersedes` que apunta a una versión posterior es `BLOCKED` (ciclo).
**Regla D-R3-2:** dos versiones con `valid_to = null` sin relación son `BLOCKED` (autoridad duplicada).

---

# 5. D-R4 — Historia encadenada (append-only)

```
  obshist_<obs>_000001  entry_sha256 = H1   prev = null
            │
  obshist_<obs>_000002  entry_sha256 = H2   prev = H1
            │
  obshist_<obs>_000003  entry_sha256 = H3   prev = H2
```

| Campo | Función |
|---|---|
| `action` | Tipo de acción gobernada (`CREATED` · `VERSIONED` · `ASSET_MISSING` · `ASSET_CORRECTED` · `ANNOTATION_CURATED` · `EVENT_RETIRED` · `EXPORTED` …). |
| `actor_id` · `actor_role` | Quién y en qué rol (RA-9, AUD-3). |
| `at` · `timezone` | Cuándo, con zona obligatoria. |
| `before_version` · `after_version` | Transición exacta; ambas siguen existiendo. |
| `reason` | Texto gobernado; sin razón la entrada es `BLOCKED`. |
| `evidence_ref[]` | IDs que sustentan la acción; nunca bytes. |
| `entry_sha256` · `prev_history_sha256` | Integridad y orden; huella rota ⇒ `BLOCKED` (AUD-2). |

**Regla D-R4-1:** no existe `UPDATE` ni `DELETE`. Un error se corrige con entrada `VERSIONED` que lo declara (OH-2).
**Regla D-R4-2:** una exportación también es entrada; consultar no lo es (OH-4, SRCH-8).

---

# 6. D-R5 — Relaciones tipadas

| Tipo | `from → to` | Cardinalidad | Regla |
|---|---|---|---|
| `BELONGS_TO` | asset → observation | N:1 | AS-5: exactamente una propietaria. |
| `SUPERSEDES` | versión / evento / relación → predecesor | 1:1 | Sin ciclos (OR-3). |
| `CORRECTS` | asset nuevo → asset original | N:1 | Original intacto; huella distinta. |
| `SAME_EVENT_AS` | observación → observación | N:M | Debe pasar por `event_id` existente (OR-2). |
| `EVIDENCE_FOR` | evidence → observation | N:1 | No sube el estado de la señal. |
| `REPORTED_BY` | report → observation | N:1 | Requiere ancla (LLM-1). |
| `DOCUMENTS` | doc → observation | N:M | Derivado por lectura (KH-5). |
| `DERIVED_INTO` | observation → dataset/manifiesto | 1:N | Proyección de solo lectura (DS-1). |
| `CO_OCCURS_WITH` | evento → evento | N:M | Solo con `event_id` declarado. |
| `PRECEDED_BY` | entidad → predecesora | 1:1 | Para retiros y relevos. |

**Regla D-R5-1:** toda arista lleva `declared_by`, `at`, `timezone` y `reason`; sin ellos no se materializa (OR-1, AUD-5).
**Regla D-R5-2:** `CO_OCCURS_WITH` **nunca** se deriva de timestamps cercanos (TEL-11).
**Regla D-R5-3:** cambiar el tipo de una relación produce otra relación con `supersedes`; no se edita (OR-4).

---

# 7. D-R6 — Máquina de estados del Registry

> Los estados de **proceso** no se confunden con los **7 estados de honestidad** ni con los **5 veredictos ACP**.

```
   (sin entrada)
        │ asignación por autoridad única (RA-1/RA-2)
        ▼
   REGISTERED ────► VERSIONED ────► SEALED ────► DELIVERED
        │               │             │             │
        │               │             │             └─► EXPORTED
        │               │             └─► RESEALED (por corrección; supersedes)
        │               └─► CURATED (anotación, sin subir estado)
        └─► AMENDED (entrada de historia; nueva versión)
```

| Estado de proceso | Significado | No implica |
|---|---|---|
| `REGISTERED` | Existe la raíz y su versión inicial. | Que haya assets o evidencia. |
| `VERSIONED` | Hay una versión nueva con `supersedes`. | Que el estado de honestidad haya mejorado. |
| `SEALED` | `ObservationPackage` verificado por huella (Platform P6). | Que haya sido entregado. |
| `RESEALED` | Nuevo paquete tras corrección; el anterior permanece. | Que el anterior haya sido borrado. |
| `DELIVERED` | `delivery_manifest` en `PENDING_ACCEPTANCE` (P7-2). | `accepted` — la UI nunca lo afirma. |
| `CURATED` | Anotación corregida con `supersedes`. | Que κ dejó de ser `PENDING`. |
| `AMENDED` | Entrada de historia que corrige un dato declarativo. | Reescritura de la versión previa. |
| `EXPORTED` | Salió del Registry con destino y huella. | Pérdida del original (PRES-3). |

**Regla D-R6-1:** `AMENDED`, `CURATED` y `RESEALED` son **aditivos**; ninguno invalida la existencia de la raíz.
**Regla D-R6-2:** si un asset está `ROTO`, la observación degrada para visualización (MG-5); el proceso no puede "arreglar" ese estado cambiando de versión.

---

# 8. D-R7 — Los cinco escenarios como transformaciones

| Escenario | Entrada de historia | Versión | Relación | Resultado visible |
|---|---|---|---|---|
| Observación cambia | `VERSIONED` | `obsver_ +1` | `SUPERSEDES` | Nueva vigente; anterior legible. |
| Asset desaparece | `ASSET_MISSING` | `obsver_ +1` | — | Referencia y huella conservadas; `NO_DATA`, jamás silencio. |
| Asset corregido | `ASSET_CORRECTED` | `obsver_ +1` | `CORRECTS` | Nuevo `asset_id`; original intacto. |
| Anotación curada | `ANNOTATION_CURATED` | `obsver_ +1` | `SUPERSEDES` | `ood_origin` preservado; κ `PENDING`. |
| Evento retirado | `EVENT_RETIRED` | `obsver_ +1` | `PRECEDED_BY` | `SUPERSEDED_BY`; `event_id` sigue resoluble. |

**Regla D-R7-1:** en todos los casos `observation_id` es idéntico antes y después. Es la **prueba de los 10 años** aplicada a cada escenario (MP-13, OBS-14).

---

# 9. D-R8 — Consumo y procedencia derivada

```
   Registry ( por observation_id )
        │
        ├──► versión vigente ──► ObservationPackage (vista inmutable)
        │                              │
        │                              ├─► ACP ──► report_ (veredicto + anclas + MIN)
        │                              │              │
        │                              │              └─► KH ──► doc_ (promoción gobernada)
        │                              │
        │                              └─► docsByObservation (derivado por lectura)
        │
        └──► proyección a dataset futuro
                   · source_observation_id
                   · source_asset_id
                   · source_version_id
                   · delivery_manifest PENDING_ACCEPTANCE
```

| Regla | Consecuencia |
|---|---|
| El Registry resuelve existencia y versión; no interpreta. | ACP aporta el veredicto, KH la promoción. |
| Las proyecciones son de solo lectura. | El histórico no se reescribe (DS-3, DS-9). |
| Toda fila derivada lleva sus tres anclas de origen. | Re-derivación reproducible (DS-7). |
| Los conflictos documentales los resuelve D-003. | El Registry no decide autoría documental. |

---

# 10. Fixtures de rechazo del modelo

| Fixture | Resultado esperado |
|---|---|
| Dos `asset_id` apuntando a dos observaciones propietarias | `BLOCKED` (AS-5) |
| `obsver_` con `supersedes` a una versión posterior | `BLOCKED` (OR-3) |
| Dos versiones vigentes sin cadena | `BLOCKED` (D-R3-2) |
| Entrada de historia sin `reason` ni `prev_history_sha256` | `BLOCKED` (AUD-1/2) |
| Relación `SAME_EVENT_AS` sin `event_id` | `BLOCKED` (OR-2) |
| `CO_OCCURS_WITH` derivado por timestamps | `BLOCKED` (OR-1) |
| `REGISTERED` presentado como evidencia `REAL` | `BLOCKED` (estado de proceso ≠ honestidad) |
| `DELIVERED` mostrado como `accepted` | `BLOCKED` (P7-2) |
| `doc_id` con bytes del paquete | `BLOCKED` (KH-3) |
| Proyección a dataset sin `source_version_id` | `BLOCKED` (DS-2) |

---

# 11. Cierre

El modelo añade cuatro entidades de gobierno —época, versión, historia y relación— a las tres entidades canónicas ya ratificadas. Ninguna es raíz; todas preservan `observation_id`. La historia es append-only y encadenada por huellas; las relaciones son tipadas, declaradas y sin ciclos; los consumidores leen, nunca escriben.

**Estado honesto:** **`DISENO`**, 0 instancias, 0 esquemas físicos, 0 API, 0 UI. Sin modificar el modelo de entidades multimodal previo ni la Platform. Sin commit, push, merge ni tag.

---

*Fin del modelo de entidades del Registry. Complementa —nunca sustituye— `multimodal_entity_model_v1.md`, la gobernanza multimodal V1 y la Observation Platform V1.*
