# ROADMAP DEL LIBRO MAYOR DE EVIDENCIA V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T23:17:50-05:00
> - Origen: misión `SIGCTIARURAL_EVIDENCE_LEDGER_V1` (documento nuevo)
> - Destino: `docs/governance/EVIDENCE_LEDGER_ROADMAP_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: fases, gates, escala y los 30 riesgos del Ledger. No crea base de datos, API, UI, IA ni código.

**Misión:** `SIGCTIARURAL_EVIDENCE_LEDGER_V1`
**Naturaleza:** documentación oficial de **gobernanza de roadmap**. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Fuentes:** `SIGCTIARURAL_EVIDENCE_LEDGER_V1.md` · `EVIDENCE_LEDGER_ENTITY_MODEL_V1.md` · Observation Registry V1 · Observation Platform V1 §7 · F3E §3.3 y §4 · Carta IA P-IA-1..7.
**No hace:** no implementa registro, no crea asignador de IDs, no define endpoints, no captura, no entrena, no commitea.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Fuente única de los 30 riesgos:** este documento §9. Los otros dos documentos remiten aquí.
> **Invariante:** fuente oficial de evidencia **sin cambiar `observation_id` ni `OBSERVATION_REGISTRY_V1`**.

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Fases cerradas | **0 / 8** |
| Evidencias registradas por el Ledger | **0** |
| Cadenas / versiones / relaciones materializadas | **0 / 0 / 0** |
| Base de datos, API, UI, IA, esquema físico | **0** |
| Escala objetivo | 100.000 evidencias · 1.000.000 assets · 10 años — **objetivo de diseño, NO medido** |
| Dataset acústico v1 | **Intacto** (7 muestras, `schema.json` 1.3.0) |
| Observation Registry V1 | **Intacto** (3 documentos, sin modificación) |

> Un roadmap no es un libro mayor. Aquí se fija el camino; ejecutar cada fase requiere misión explícita.

---

# 1. Qué se escala y qué no

| Dimensión | Hoy | Objetivo | Cómo se mide sin romper la raíz |
|---|---:|---:|---|
| Evidencias | 0 en Ledger | **100.000** | Conteo por `evd_` único; siempre con `observation_id` (AUT-1). |
| Assets de origen | 0 en Ledger | **1.000.000** | Conteo por `asset_id`; huella propia por versión de bytes (AS-2). |
| Cadena de custodia | 0 | 10 años | Entradas `evdchain_` encadenadas por huella; retención declarada (AUL-10). |
| Versiones | 0 | 1..N por evidencia | `evdver_` + `supersedes`; sin reescritura (EVER-1). |
| Relaciones | 0 | 0..N por entidad | `evdrel_` tipadas, sin inferencia (EREL-1). |
| Reportes anclados | 0 | 0..N por evidencia | `evidence_id[]` + `evidence_version_ids[]` (REP-1). |

**Regla ESC-1:** escalar **no** significa implementar. Ninguna fase autoriza código, almacenamiento, servicios ni IA.
**Regla ESC-2:** los conteos objetivo son **`ESTIMADO`/diseño**, nunca datos medidos.
**Regla ESC-3:** el Ledger escala **debajo** del Registry: crecer en evidencias no agrega observaciones nuevas por decreto.

---

# 2. Fases (definidas, NO ejecutadas)

| Fase | Nombre | Objetivo | Gate de salida |
|---|---|---|---|
| **F0** | Gobernanza | 3 documentos visibles con D-004.6 y subordinación al Registry V1 | G-EL-1 |
| **F1** | Identificadores | 4 IDs definidos, ninguno raíz de observación | G-EL-2 |
| **F2** | Autoría | Productor gobernado declarado; ACP y LLM excluidos por regla dura | G-EL-3 |
| **F3** | Grafo y custodia | Relación observation/asset/event/evidence + cadena encadenada | G-EL-4, G-EL-5 |
| **F4** | Escenarios y append-only | 6 escenarios sin borrado + principio AP oficial | G-EL-6 |
| **F5** | Consumo | ACP/KH de solo lectura y `report_id` con anclas y versión | G-EL-7 |
| **F6** | Escalera y escala | 4 escalones sin salto; 100.000 / 1.000.000 con raíz intacta | G-EL-8 |
| **F7** | Preservación | 10 años, migración de formatos y registrador relevado sin cambio de ID | G-EL-9 |

## 2.1 Reglas de fase

| ID | Regla |
|---|---|
| PH-1 | Ninguna fase arranca sin misión explícita; este roadmap **no la da**. |
| PH-2 | Un gate no se cierra por documentación: requiere evidencia verificable y fixtures. |
| PH-3 | Gate fallido ⇒ nueva versión del plan con `supersedes`; nada se borra. |
| PH-4 | Cada fase entrega por `delivery_manifest` en `PENDING_ACCEPTANCE` (P7-2). |
| PH-5 | F6 y F7 **no implican** IA, entrenamiento ni inferencia (AUT-5). |
| PH-6 | El orden es aditivo: fases futuras no reescriben contratos anteriores ni el Registry. |

---

# 3. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado hoy |
|---|---|---|
| **G-EL-1** | 3 documentos visibles con D-004.6 y subordinación al Registry V1 | `DISENO` |
| **G-EL-2** | 4 IDs nuevos sin competir con `observation_id` | `DISENO` |
| **G-EL-3** | Autoría declarada; ACP consume y LLM interpreta, ninguno crea | `DISENO` |
| **G-EL-4** | Cadena observation→asset→event→evidence verificable sin inferencia | `DISENO` |
| **G-EL-5** | Cadena de custodia encadenada por `prev_chain_sha256` | `DISENO` |
| **G-EL-6** | 6 escenarios sin borrado y append-only como principio oficial | `DISENO` |
| **G-EL-7** | ACP/KH de solo lectura; `report_id` con anclas y versiones | `DISENO` |
| **G-EL-8** | 4 escalones sin salto y 30 riesgos registrados | `DISENO` |
| **G-EL-9** | Escala y preservación sin cambiar `observation_id` ni el Registry V1 | `DISENO` |

> La existencia de este roadmap **no cierra ningún gate**.

---

# 4. Compatibilidad con los contratos existentes

| Contrato | Requisito | Cumplimiento del Ledger |
|---|---|---|
| Registry V1 (RA-1..RA-10) | `observation_id` opaco, estable, autoridad única | §2 y §4 del padre; ningún ID nuevo es raíz. |
| Registry V1 (OV-1..OV-3) | Versión por `supersedes`; bytes cambian de `asset_id` | EVER-1..EVER-4. |
| Registry V1 (OR-1..OR-4) | Relaciones declaradas, sin inferencia ni ciclos | EREL-1..EREL-5. |
| Registry V1 (ACR-1..ACR-10) | ACP lee Registry → Ledger → KH; no escribe | AEL-1..AEL-12. |
| Platform V1 (ACP-1..8) | Veredictos cerrados; `NO_DATA` sin relleno | AEL-5, AEL-6. |
| Platform V1 (KH-1..6) | `docsByObservation` derivado; promoción gobernada | KEL-1..KEL-10. |
| Platform V1 (PL-5/7) | Paquete derivado; handoff `PENDING_ACCEPTANCE` | Etapas 3 y 4 de la custodia. |
| F3E §3.3 | Envelope con estado y confianza heredados | §1.1 y EVER-4; sin subida de estado. |
| F3E §4 | Ledger destino primario; Hangar promueve; registry se regenera | KEL-3, KEL-4. |
| Carta IA | P-IA-5 no fabricación · P-IA-6 humano decide · ACP no escribe | AUT-5, AUT-3, AEL-7. |
| 7 estados canónicos | No ampliar, no mejorar por decreto | Invariante del padre, EVER-4, EREL-5. |
| 5 veredictos ACP | Vocabulario cerrado; `HIPÓTESIS` inactivo (G-IA-1) | AEL-5, REP-1. |

---

# 5. La escala sin cambiar la raíz

| Escenario de cambio | ¿Cambia `observation_id`? | ¿Cambia `OBSERVATION_REGISTRY_V1`? | Mecanismo del Ledger |
|---|---|---|---|
| Audio v1 → v2 → v3 | **No** | **No** | `evdver_` con crosswalk; herencia v1 intacta (EID-2). |
| Aparecen imagen, video o telemetría | **No** | **No** | Nuevos `asset_id` y evidencias colgadas de la misma raíz. |
| Se corrige una evidencia | **No** | **No** | `CORRECTED` + `supersedes`; mismo `evidence_id`. |
| Se retira una evidencia | **No** | **No** | Marcador `RETIRED`; sin borrado. |
| Se controvierte una evidencia | **No** | **No** | `DISPUTED` + ambas versiones visibles. |
| Se reemplaza / divide / combina | **No** | **No** | IDs nuevos con `evdrel_` de linaje. |
| Cambia el proveedor de LLM | **No** | **No** | El LLM interpreta; nunca es autor (AUT-5). |
| El ACP emite un reporte | **No** | **No** | `report_id` solo referencia; no escribe (REP-3). |
| El KH promociona un doc | **No** | **No** | `PROMOTED` + regeneración del registry (KEL-3). |
| Se escala a 100.000 evidencias | **No** | **No** | Cada evidencia con ancla y huella propias (AUT-1). |
| Se migra el almacenamiento a 10 años | **No** | **No** | Manifiestos y cadenas, sin foreign keys físicas (AP-5). |

---

# 6. Derivación a datasets futuros

| Regla | Garantía |
|---|---|
| Proyección de solo lectura (DS-1..3, padre Registry §13) | El histórico no se reescribe; el dataset acústico v1 sigue intacto. |
| Tres anclas por fila | `source_observation_id` · `source_asset_id` · `source_evidence_id` + versión. |
| `PENDING_ACCEPTANCE` | Ninguna UI afirma `accepted` (P7-2). |
| Bump de taxonomía ⇒ otra proyección | v1, v2 y v3 conviven con crosswalk (EID-2). |
| `REF` y `SIM` separados de `REAL` | Ninguna fuente externa ni simulada entra en evaluación propia (AEL-10). |
| Evidencia retirada o controvertida | Se excluye de proyecciones de evaluación con razón declarada, no se borra. |

> El Ledger **no crea datasets**: permite derivarlos sin romper el histórico ni el Registry.

---

# 7. Fixtures de rechazo del roadmap

| Fixture | Resultado esperado |
|---|---|
| Fase iniciada sin misión explícita | `BLOCKED` (PH-1) |
| Gate cerrado solo porque "el documento existe" | `BLOCKED` (PH-2) |
| `observation_id` cambiado tras una corrección de evidencia | `BLOCKED` (ESC / RA-5) |
| `OBSERVATION_REGISTRY_V1` editado en nombre del Ledger | `BLOCKED` (subordinación, G-EL-1) |
| Evidencia creada por ACP | `BLOCKED` (AUT-5, R-01) |
| Evidencia creada por LLM / `Interprete` | `BLOCKED` (AUT-5, P-IA-5, R-02) |
| Búsqueda con fecha sin `timezone` | `BLOCKED` (BS-3) |
| Búsqueda `LIKE` sobre ID opaco | `BLOCKED` (BS-2/6) |
| Cadena con huella rota | `BLOCKED` (AUL-2) |
| Reporte con `RESOLVED` y cero anclas | `BLOCKED` (REP-2) |
| Escala presentada como dato medido | `BLOCKED` (ESC-2) |
| Modelo de IA creado en nombre del Ledger | `BLOCKED` (PH-5, R-29) |

---

# 8. Criterios de éxito

| # | Requisito de la misión | Sección | Estado |
|---|---|---|---|
| 1 | 4 identificadores definidos | Padre §2 · Modelo §1..§6 | ✅ |
| 2 | Qué es y qué no es una evidencia | Padre §1 | ✅ |
| 3 | Quién puede / quién no puede crear | Padre §3 | ✅ |
| 4 | ACP no crea; ACP consume | Padre §3.2, AEL-7 | ✅ |
| 5 | LLM no crea; LLM interpreta | Padre §3.2, AUT-5 | ✅ |
| 6 | Relación observation/asset/event/evidence | Padre §4 | ✅ |
| 7 | Cadena de custodia | Padre §5 | ✅ |
| 8 | 6 escenarios gobernados | Padre §6 · Modelo D-EL7 | ✅ |
| 9 | Append-only como principio oficial | Padre §7 | ✅ |
| 10 | Consumo ACP y KH | Padre §8 · §9 | ✅ |
| 11 | `report_id` ↔ `evidence_id` | Padre §10 | ✅ |
| 12 | Observación → evidencia → reporte → conocimiento | Padre §11 · Modelo D-EL8 | ✅ |
| 13 | **30 riesgos** | §9 | ✅ |
| 14 | Sin cambiar `observation_id` ni el Registry V1 | §5 · §7 | ✅ |

---

# 9. Los 30 riesgos más importantes del Ledger

> **Única fuente de verdad.** Severidad: 🔴 bloqueante · 🟡 alto. Cada riesgo tiene umbral y mitigación. Ninguno se resuelve con IA.

| # | Riesgo | Sev. | Umbral | Mitigación |
|---|---|---|---|---|
| **R-01** | **ACP crea evidencia** (escribe en el Ledger). | 🔴 | 1 entrada con `produced_by = acp` | ACP-3, ACR-6, AUT-5: el ACP solo consume y produce `report_id`. |
| **R-02** | **LLM / `Interprete` crea evidencia**. | 🔴 | 1 evidencia con autoría de modelo | Carta IA §8, IA-2, P-IA-5: interpreta, no fabrica; el humano registra. |
| **R-03** | Sub-agente, sistema de razonamiento o modelo predictivo escribe en el Ledger. | 🔴 | 1 escritura desde IA-1..IA-6 | Carta IA sujetos gobernados; AUT-3; registrador gobernado exclusivo. |
| **R-04** | Evidencia sin `observation_id`. | 🔴 | 1 `evd_` sin ancla | AUT-1, EID-5: `BLOCKED`; no existe evidencia huérfana. |
| **R-05** | Evidencia **mejora el estado** de su observación. | 🔴 | 1 versión con estado superior | F3E-2, EVER-4: herencia y degradación conservadora. |
| **R-06** | Confianza **inflada** al agregar evidencias. | 🔴 | 1 confianza superior al `MIN` | ACP-4, AEL-4, REP-7: `MIN` × cobertura × penalidad. |
| **R-07** | **Borrado físico** de evidencia o cadena. | 🔴 | 1 `evd_`/`evdchain_` ausente | AP-1, PRES-1: append-only; el error se corrige con otra entrada. |
| **R-08** | **Reescritura in-place** de una versión. | 🔴 | 1 `evdver_` con huella cambiada | EVER-1, VER-1: versión nueva con `supersedes`; `BLOCKED`. |
| **R-09** | Huella rota o cadena reordenada. | 🔴 | 1 `prev_chain_sha256` discontinuo | ECH-3, AUL-2: `BLOCKED`; verificación por huella. |
| **R-10** | **Falso productor**: UI, script ad-hoc o cliente crea evidencia. | 🔴 | 1 evidencia sin `produced_by` gobernado | AUT-2/AUT-3; registrador gobernado con actor, rol y razón. |
| **R-11** | Fuente `REF` presentada como evaluación propia. | 🔴 | 1 fila `REF` en split propio | EID-4, AEL-10, TG-10: `original_id`, licencia y separación física. |
| **R-12** | `NO_DATA` imputado o tratado como cero. | 🔴 | 1 imputación o `value=0` como ausencia | Gobernanza telemétrica §4, AEL-6: estado gobernado, sin relleno. |
| **R-13** | `report_id` sin ancla de observación/evidencia. | 🔴 | 1 reporte sin `anclas[]` | ACP-1, LLM-1, REP-6: `BLOCKED`. |
| **R-14** | Reporte **modifica** la evidencia que leyó. | 🔴 | 1 entrada de cadena originada en un reporte | REP-3, AEL-7: el ACP no escribe; solo referencia. |
| **R-15** | **Doble escritura** de `docsByEvidence`. | 🔴 | 2 índices con la misma relación | KH-1, MP-8, KEL-5: derivado por lectura, fuente única. |
| **R-16** | `doc_id` copia bytes o envelope del paquete. | 🔴 | 1 documento con datos del Ledger | KH-3, KEL-4: referencia al registry, nunca copia. |
| **R-17** | Promoción al KH **sin Hangar de Autenticidad**. | 🔴 | 1 `doc_id` creado por escritura directa | F3E §4, KEL-3: gobernanza y regeneración del registry. |
| **R-18** | Disputa resuelta por inferencia, votos o timestamp. | 🔴 | 1 `CONTRADICTS` cerrado sin entrada humana | AEL-8, D-EL5-2, ASC-4: `PARTIAL` hasta decisión humana. |
| **R-19** | Retirada convertida en borrado. | 🔴 | 1 evidencia retirada sin marcador | Escenario 2, AP-9: `RETIRED` como dato, original legible. |
| **R-20** | División o combinación sin linaje declarado. | 🔴 | 1 `evd_` nueva sin `SPLIT_INTO`/`COMBINED_FROM` | EREL-2/4, D-EL7-2: linaje obligatorio, sin ciclos. |
| **R-21** | Ciclos en relaciones de corrección o reemplazo. | 🟡 | 1 arista que apunta a un sucesor | EREL-4, D-EL3-1: arista `BLOCKED`, evidencia intacta. |
| **R-22** | Fechas sin zona horaria en custodia o búsqueda. | 🟡 | 1 `at`/`captured_at` sin `timezone` | CUS-1, BS-3: `BLOCKED` sin zona. |
| **R-23** | `domain` ambiguo o como texto libre. | 🟡 | 1 consulta con `domain` libre | BS-4/5: subfacets declarados; sin inferencia desde clases. |
| **R-24** | Escala sin índices lógicos declarados. | 🟡 | 1 búsqueda sin campo indexado | §1, PH-2: índices por ID, observación, sesión, lugar, estado. |
| **R-25** | Obsolescencia de formatos a 10 años. | 🟡 | 1 formato propietario sin salida abierta | MP-13, AP-5: formatos abiertos y exportación trazable. |
| **R-26** | Privacidad de `posicion` y personas sin consentimiento. | 🔴 | 1 vista con coordenadas exactas | POS-2/3, P3-3, CUS-6, BS-9: redacción y `PARTIAL`. |
| **R-27** | Auditoría sin actor ni razón. | 🔴 | 1 entrada sin `actor_id` o `reason` | AUL-1, CUS-1: `BLOCKED`; registrar ≠ auditor. |
| **R-28** | Concurrencia de roles en una misma evidencia. | 🟡 | 1 actor con tres roles sin doble revisión | AUL-3, AUD-3: separación de funciones. |
| **R-29** | **Scope creep**: convertir el Ledger en base de datos, API, UI o IA. | 🔴 | 1 esquema SQL, endpoint, pantalla o modelo creado | Padre §0/§1, PH-5: gobernanza declarativa; misión propia. |
| **R-30** | **Cambiar `observation_id` o el Registry V1** en nombre del Ledger. | 🔴 | 1 línea de los 3 documentos del Registry modificada | Subordinación, G-EL-1, ESC: el Ledger es hijo, nunca reescribe su raíz. |

## 9.1 Distribución de severidad

| Severidad | Cantidad | IDs |
|---|---:|---|
| 🔴 Bloqueante | 24 | R-01..R-20, R-26, R-27, R-29, R-30 |
| 🟡 Alto | 6 | R-21, R-22, R-23, R-24, R-25, R-28 |
| 🟢 Moderado | 0 | — |

> Conteo verificable: 24 + 6 = 30. La fila 🟢 se mantiene en 0 para declarar que no hay riesgos menores ignorables.

---

# 10. Cierre

El roadmap lleva el Ledger de la gobernanza a la preservación a 10 años en ocho fases, con nueve gates y 30 riesgos focalizados. La escala a 100.000 evidencias y 1.000.000 de assets se resuelve con las mismas reglas que hoy: evidencia hija de una observación, autoría gobernada, cadena append-only y relaciones declaradas. **Ninguna fase cambia `observation_id` ni `OBSERVATION_REGISTRY_V1`.**

**Criterio de éxito:** fuente oficial de evidencia del ecosistema sin modificar la raíz ni el contrato del Registry. Se satisface **en el plano contractual**; su verificación operativa queda para F6/F7 bajo misión explícita.

**Estado honesto:** **`DISENO`**, 0/8 fases, 0/9 gates, 0 instancias, 0 base de datos, 0 API, 0 UI, 0 IA. Sin modificar el Registry V1, la Platform V1, el Masterplan V1 ni las gobernanzas de audio, visión y telemetría. Sin commit, push, merge ni tag.

---

*Fin del roadmap del Ledger. Complementa —nunca sustituye— la gobernanza del Libro Mayor de Evidencia V1, el modelo de entidades del Ledger, el Observation Registry V1 y la Observation Platform V1.*
