# MODELO DE ENTIDADES DEL LIBRO MAYOR DE EVIDENCIA V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T23:17:50-05:00
> - Origen: misión `SIGCTIARURAL_EVIDENCE_LEDGER_V1` (documento nuevo)
> - Destino: `docs/governance/EVIDENCE_LEDGER_ENTITY_MODEL_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: modelo conceptual del Ledger. Diagramas y cardinalidades; no crea esquema físico, base de datos ni código.

**Misión:** `SIGCTIARURAL_EVIDENCE_LEDGER_V1`
**Naturaleza:** modelo **conceptual** de entidades, relaciones y máquinas de estado. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Autoridad:** `docs/governance/SIGCTIARURAL_EVIDENCE_LEDGER_V1.md`
**Relación con modelos previos:** extiende `docs/governance/multimodal_entity_model_v1.md` (D-1..D-10) y `docs/governance/OBSERVATION_REGISTRY_ENTITY_MODEL_V1.md` (D-R1..D-R8) **sin reemplazarlos**. Las entidades `observation`, `asset` y `event` conservan su definición; aquí se añaden las cuatro entidades de gobierno de la evidencia.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante:** `observation_id` sigue siendo la única raíz. Las cuatro entidades nuevas son **hijas o vistas** de la evidencia derivada.
> **Invariante de autoría:** ACP lee; LLM interpreta; **ni uno ni otro crea evidencia**.

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Entidades heredadas gobernadas | **3** (`observation`, `asset`, `event`) — intactas |
| Entidades nuevas del Ledger | **4** (`evidence`, `version`, `chain`, `relation`) |
| Entidades referenciadas, no poseídas | **2** (`report`, `document`) — no se redefinen |
| Instancias reales en el Ledger | **0** |
| Esquemas físicos / tablas / API / IA | **0 / 0 / 0 / 0** |
| Diagramas | **8** (D-EL1..D-EL8) |

---

# 1. Inventario de entidades

| Entidad | ID | Cardenalidad | Mutabilidad | Estado hoy |
|---|---|---|---|---|
| Observación | `observation_id` | 1 (raíz, del Registry) | Identidad inmutable; metadatos versionados | Contrato ratificado |
| Asset | `asset_id` | 1:N de la observación | Bytes inmutables; corrección ⇒ nuevo ID | Ratificado / `DISENO` |
| Evento | `event_id` | N:M vía observaciones | Retiro ⇒ `SUPERSEDED_BY`, nunca borrado | Ratificado |
| Evidencia | `evd_` | 0:N de la observación | Identidad inmutable; contenido versionado | `DISENO` |
| Versión de evidencia | `evdver_` | 1:N de la evidencia | Append-only | `DISENO` |
| Cadena de custodia | `evdchain_` | 1:N entradas de la evidencia | Append-only | `DISENO` |
| Relación de evidencia | `evdrel_` | 0:N | Append-only, tipada | `DISENO` |
| Reporte | `report_id` | 0:N referencia desde evidencia | Gobernanza ACP; fuera del Ledger | `DISENO` |
| Documento | `doc_id` | 0:N referencia derivada | Gobernanza D-003 / KH | Referencia |

**Regla MEL-1:** el Ledger **no posee** reportes ni documentos: guarda los IDs por los que se resuelven.
**Regla MEL-2:** las cuatro entidades nuevas son **metadatos de evidencia**; ninguna transporta bytes de señal.
**Regla MEL-3:** una evidencia no puede existir sin `observation_id`. La cardinalidad mínima es 0, nunca "evidencia huérfana".

---

# 2. D-EL1 — Grafo de propiedad y gobierno

```
  OBSERVATION_REGISTRY_V1  (autoridad sobre la raiz)
             │ gobierna, sin reescribir
             ▼
  ┌───────────────────────────────────────────────────────────┐
  │ observation_id  (RAÍZ inmutable)                          │
  │   ├── asset_id (1:N)  · sha256 · modalidad                │
  │   ├── event_id (N:M)  · ocurrencia real                   │
  │   └── evd_ (0:N)      · derivada, estado heredado         │
  └──────────────┬────────────────────────────────────────────┘
                 │
     ┌───────────┼────────────┬──────────────────┐
     ▼           ▼            ▼                  ▼
  evdver_     evdchain_    evdrel_           report_id
 (1..N)      (entradas)    (aristas)         (ACP, fuera)
     │           │            │                  │
     └───────────┴────────────┴──────────────────┘
                        │
                        ▼
                     doc_id (KH, promocion gobernada)
```

**Lectura:** el Registry gobierna la raíz; el Ledger gobierna solo la evidencia derivada. Los assets cuelgan de la observación, no unos de otros. Los eventos son el único nodo que cruza observaciones. Reportes y documentos son referencias finales, no nodos poseídos.

---

# 3. D-EL2 — Identidad: raíz versus vistas

```
  observation_id  ────────────────────────────► (ÚNICA RAÍZ, 10 años)
        │
        └── evd_obs_20261120_..._0001  (identidad de evidencia, inmutable)
              │
              ├── evdver_<evd>_0001   (estado en T1, conservada)
              ├── evdver_<evd>_0002   (estado en T2, supersedes 0001)
              │
              ├── evdchain_<evd>_000001  (entrada append-only)
              ├── evdchain_<evd>_000002  (prev_sha256 encadenado)
              │
              └── evdrel_CORRECTS_000001 (arista a evidencia corregida)
```

| Regla | Consecuencia |
|---|---|
| La raíz no codifica versión | `evdver_` cambia sin tocar `observation_id` ni `evd_` (EVER-1). |
| La raíz no codifica taxonomía | Un bump v1→v2→v3 crea versión, no nueva evidencia (EID-2). |
| La raíz no codifica autoría | Cambia el productor, cambia la versión; el ID permanece. |
| Los IDs son opacos | Ningún consumidor los descompone (SRCH-6, BS-6). |

---

# 4. D-EL3 — Versión vigente y `supersedes`

```
  evdver_..._0001 ──supersedes──► evdver_..._0002 ──supersedes──► evdver_..._0003
   valid_to = T2                   valid_to = T3                   valid_to = null (VIGENTE)
   conservada                      conservada                      activa
```

| Campo | Regla |
|---|---|
| `seq4` | Monótono; nunca se reutiliza. |
| `supersedes` | Apunta a la versión inmediatamente anterior; la primera usa `null`. |
| `valid_from` / `valid_to` | Rango de vigencia; `valid_to` se **escribe**, no se borra la versión. |
| `manifest_sha256` | Huella de la versión; distinta huella ⇒ versión distinta. |
| Vigente | Se resuelve por `valid_to = null` **y** cadena coherente; nunca por "última fila" (EVER-2). |

**Regla D-EL3-1:** `supersedes` a una versión posterior es `BLOCKED` (ciclo, EREL-4).
**Regla D-EL3-2:** dos versiones con `valid_to = null` sin relación son `BLOCKED` (autoridad duplicada).
**Regla D-EL3-3:** toda versión hereda estado y confianza de la observación; ninguna los eleva (EVER-4, F3E-2).

---

# 5. D-EL4 — Cadena de custodia encadenada

```
  evdchain_<evd>_000001  action=PRODUCED           sha256=H1  prev=null
            │
  evdchain_<evd>_000002  action=INTEGRITY_CHECKED  sha256=H2  prev=H1
            │
  evdchain_<evd>_000003  action=SEALED             sha256=H3  prev=H2
            │
  evdchain_<evd>_000004  action=CONSUMED           sha256=H4  prev=H3  (report_id anclado)
            │
  evdchain_<evd>_000005  action=CORRECTED          sha256=H5  prev=H4  (nueva evdver_)
```

| Campo | Función |
|---|---|
| `action` | `PRODUCED` · `INTEGRITY_CHECKED` · `SEALED` · `DELIVERED` · `CONSUMED` · `CORRECTED` · `RETIRED` · `DISPUTED` · `REPLACED` · `SPLIT` · `COMBINED` · `PROMOTED` · `EXPORTED`. |
| `actor_id` · `actor_role` | Quién y en qué rol; registrar ≠ auditor ≠ productor autónomo (AUL-3). |
| `at` · `timezone` | Cuándo, con zona obligatoria. |
| `before` · `after` | Transición exacta; ambas siguen existiendo. |
| `reason` | Texto gobernado; sin razón la entrada es `BLOCKED`. |
| `evidence_ref[]` | IDs que sustentan la acción; nunca bytes. |
| `entry_sha256` · `prev_chain_sha256` | Integridad y orden; huella rota ⇒ `BLOCKED` (AUL-2). |

**Regla D-EL4-1:** no existe `UPDATE` ni `DELETE`. Un error se corrige con entrada `CORRECTED` que lo declara (AP-2).
**Regla D-EL4-2:** `CONSUMED` y `EXPORTED` son entradas; **consultar no lo es** (ECH-4, BS-8).

---

# 6. D-EL5 — Relaciones tipadas

| Tipo | `from → to` | Cardinalidad | Regla |
|---|---|---|---|
| `DERIVED_FROM` | evidencia → asset / observation | N:1 | Ancla obligatoria; sin ancla `BLOCKED` (EID-5). |
| `EVIDENCE_FOR` | evidencia → observación | N:1 | Hereda estado; no lo eleva. |
| `SUPPORTS` | evidencia → reporte | N:1 | Ancla del veredicto (REP-1). |
| `CORRECTS` | versión nueva → versión anterior | 1:1 | Sin ciclos; original intacto. |
| `RETIRES` | entrada → evidencia retirada | 1:1 | Sin borrado; consumidores degradan. |
| `CONTRADICTS` | evidencia → evidencia | N:M | Ambas visibles; veredicto `PARTIAL`. |
| `DISPUTES` | actor/entrada → evidencia | N:1 | Razón declarada, sin inferencia. |
| `REPLACES` | evidencia nueva → evidencia anterior | 1:1 | Linaje, nunca renombrado (EID-3). |
| `SPLIT_INTO` | evidencia original → evidencias nuevas | 1:N | Grupo de división declarado. |
| `COMBINED_FROM` | evidencia nueva → evidencias fuente | N:1 | Huella propia, fuentes intactas. |
| `REPORTED_BY` | reporte → observación | N:1 | Sentido heredado del Registry. |
| `PROMOTED_TO` | evidencia → doc_id | N:M | Promoción gobernada; referencia, no copia. |
| `PRECEDED_BY` | entidad → predecesora | 1:1 | Retiros y relevos. |

**Regla D-EL5-1:** toda arista lleva `declared_by`, `at`, `timezone` y `reason`; sin ellos no se materializa (EREL-1, AUL-5).
**Regla D-EL5-2:** `CONTRADICTS` **nunca** se decide por fecha, votos ni confianza: lo resuelve un humano con nueva entrada (ASC-4).
**Regla D-EL5-3:** cambiar el tipo de una relación produce otra con `supersedes`; no se edita (EREL-5).

---

# 7. D-EL6 — Máquina de estados del Ledger

> Los estados de **proceso** no se confunden con los **7 estados de honestidad** ni con los **5 veredictos ACP**.

```
   (sin evidencia)
        │ produccion gobernada (AUT-1/2)
        ▼
   PRODUCED ──► VERIFIED ──► SEALED ──► DELIVERED ──► CONSUMED
        │            │          │            │            │
        │            │          │            │            └─► PROMOTED
        │            │          │            └─► EXPORTED
        │            │          └─► RESEALED (correccion; supersedes)
        │            └─► AMENDED (entrada de custodia)
        └─► DISPUTED ──► RESOLVED_BY_HUMAN (nueva entrada; nunca edicion)
```

| Estado de proceso | Significado | No implica |
|---|---|---|
| `PRODUCED` | Existe `evidence_id` con envelope mínimo. | Que esté verificada o entregada. |
| `VERIFIED` | Huella recalculada coincide. | Mejor estado de honestidad. |
| `SEALED` | Vista inmutable del paquete (PL-5/6). | Que haya sido entregado. |
| `DELIVERED` | `delivery_manifest` en `PENDING_ACCEPTANCE`. | `accepted` — nunca se afirma (P7-2). |
| `CONSUMED` | Un `report_id` ancló la evidencia. | Que el ACP haya escrito en el Ledger (no escribe). |
| `AMENDED` | Entrada de custodia corrige un dato declarativo. | Reescritura de la versión previa. |
| `RESEALED` | Nuevo paquete tras corrección. | Borrado del paquete anterior. |
| `DISPUTED` | Existe contradicción declarada. | Que un bando gane por inferencia. |
| `RESOLVED_BY_HUMAN` | Humano gobernado resolvió con nueva entrada. | Que la entrada de disputa desaparezca. |
| `PROMOTED` | Pasó al KH por Hangar de Autenticidad. | Que el registry se haya editado a mano. |
| `EXPORTED` | Salió con destino y huella. | Pérdida del original (AP-6). |

**Regla D-EL6-1:** `AMENDED`, `RESEALED`, `DISPUTED` y `RESOLVED_BY_HUMAN` son **aditivos**; ninguno invalida la existencia del `evidence_id`.
**Regla D-EL6-2:** si un asset está `ROTO`, la evidencia hereda la degradación para visualización (MG-5); el proceso no "arregla" estados cambiando de versión.
**Regla D-EL6-3:** `RESOLVED_BY_HUMAN` es estado de **proceso**, no el veredicto ACP `RESOLVED`.

---

# 8. D-EL7 — Los seis escenarios como transformaciones

| Escenario | Entrada de cadena | Versión | Relación | Resultado visible |
|---|---|---|---|---|
| Se corrige | `CORRECTED` | `evdver_ +1` | `CORRECTS` | Nueva vigente; anterior legible; mismo `evidence_id`. |
| Se retira | `RETIRED` | `evdver_ +1` | `RETIRES` / `PRECEDED_BY` | Marcador visible; sin borrado; consumidores degradan. |
| Se controvierte | `DISPUTED` | ninguna (ambas quedan) | `CONTRADICTS` / `DISPUTES` | Veredicto `PARTIAL`; ninguna gana por inferencia. |
| Se reemplaza | `REPLACED` | `evdver_ +1` | `REPLACES` | Nuevo `evidence_id`; anterior histórica y resoluble. |
| Se divide | `SPLIT` | `evdver_ +1` por hija | `SPLIT_INTO` / `DERIVED_FROM` | N evidencias nuevas con grupo declarado; original intacta. |
| Se combina | `COMBINED` | `evdver_ +1` | `COMBINED_FROM` | Nueva evidencia con huella propia; fuentes intactas. |

**Regla D-EL7-1:** en los seis casos `observation_id` es idéntico antes y después. Es la **prueba de los 10 años** (OBS-13, MP-13).
**Regla D-EL7-2:** en corregir/retirar/controvertir el `evidence_id` no cambia; en reemplazar/dividir/combinar cambia **con linaje declarado** (EREL-2/4).

---

# 9. D-EL8 — Cuatro escalones y consumo

```
  observation_id ──► evidence_id ──► report_id ──► doc_id
   (Registry)         (Ledger)        (ACP)        (KH)
        │                │              │            │
        │                │              │            └─ docsByEvidence (derivado, lectura)
        │                │              └─ veredicto + anclas[] + MIN (no escribe)
        │                └─ estado y confianza HEREDADAS (F3E-2)
        └─ raiz inmutable, nunca reescrita por este Ledger
```

| Regla | Consecuencia |
|---|---|
| El Ledger resuelve existencia, versión y custodia; no interpreta. | ACP aporta veredicto; KH aporta promoción. |
| ACP y LLM leen e interpretan; no crean (AUT-5, AEL-7). | Ninguna salida de IA se convierte en evidencia por sí sola. |
| Las promociones son gobernadas (KEL-3). | El registry documental se regenera, nunca se edita a mano. |
| Toda fila derivada lleva anclas de origen. | La reconstrucción hacia atrás es posible (ASC-3). |
| Los conflictos documentales los resuelve D-003. | El Ledger no decide autoría documental. |

---

# 10. Fixtures de rechazo del modelo

| Fixture | Resultado esperado |
|---|---|
| Evidencia sin `observation_id` | `BLOCKED` (AUT-1, EID-5) |
| `evidence_id` creado por ACP o por LLM | `BLOCKED` (AUT-5, P-IA-5) |
| Evidencia con estado superior al de su observación | `BLOCKED` (EVER-4, F3E-2) |
| Confianza de reporte superior al `MIN` de anclas | `BLOCKED` (REP-7, ACP-4) |
| `evdver_` con `supersedes` a versión posterior | `BLOCKED` (D-EL3-1) |
| Dos versiones vigentes sin cadena | `BLOCKED` (D-EL3-2) |
| Entrada de cadena sin `reason` ni `prev_chain_sha256` | `BLOCKED` (CUS-1, AUL-2) |
| `CONTRADICTS` resuelto por timestamp o votos | `BLOCKED` (D-EL5-2, AEL-8) |
| Evidencia `REF` presentada como `PROPIO` | `BLOCKED` (EID-4, AEL-10) |
| Reporte con 0 anclas y veredicto `RESOLVED` | `BLOCKED` (REP-2) |
| `doc_id` con bytes del envelope | `BLOCKED` (KEL-4) |
| Evidencia borrada para "limpiar" la cadena | `BLOCKED` (AP-1, AP-5) |
| Modelo de IA creado en nombre del Ledger | `BLOCKED` (MEL-2, R-29) |

---

# 11. Cierre

El modelo añade cuatro entidades de gobierno —evidencia, versión, cadena y relación— a las tres entidades canónicas ya ratificadas. Ninguna es raíz de observación; todas preservan `observation_id` y el `OBSERVATION_REGISTRY_V1`. La cadena es append-only y se encadena por huellas; las relaciones son tipadas, declaradas y sin ciclos; ACP y KH leen, nunca escriben.

**Estado honesto:** **`DISENO`**, 0 instancias, 0 esquemas físicos, 0 API, 0 UI, 0 IA. Sin modificar el Registry V1 ni los modelos previos. Sin commit, push, merge ni tag.

---

*Fin del modelo de entidades del Ledger. Complementa —nunca sustituye— `OBSERVATION_REGISTRY_ENTITY_MODEL_V1.md`, `multimodal_entity_model_v1.md` y la gobernanza del Libro Mayor de Evidencia V1.*
