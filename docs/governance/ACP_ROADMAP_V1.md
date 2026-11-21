# ROADMAP DEL ACP CONSUMIDOR V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T23:30:38-05:00
> - Origen: misión `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1` (documento nuevo)
> - Destino: `docs/governance/ACP_ROADMAP_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: fases, gates, coherencia y los 40 riesgos del ACP. No crea agente, IA, LLM, prompt, RAG, embedding, API, UI ni base de datos.

**Misión:** `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1`
**Naturaleza:** documentación oficial de **gobernanza de roadmap**. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Fuentes:** `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md` · `ACP_ENTITY_MODEL_V1.md` · Carta IA V1.0.1 · F4 · Platform V1 · Registry V1 · Evidence Ledger V1.
**No hace:** no implementa consumidor, no crea IDs operativos, no define endpoints, no entrenar, no capturar, no commitea.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Fuente única de los 40 riesgos:** este documento §9. Los otros dos documentos remiten aquí.
> **Invariante:** arquitectura oficial del ACP como consumidor estricto, **sin crear hechos**, **sin crear evidencia**, **sin modificar Registry ni Ledger** y **sin romper `observation_id` como raíz única**.

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Fases cerradas | **0 / 9** |
| Gates cerrados | **0 / 9** |
| Queries / trazas / reportes | **0 / 0 / 0** |
| Agentes / IA / LLM / prompts / RAG / embeddings | **0 / 0 / 0 / 0 / 0 / 0** |
| API / UI / base de datos | **0 / 0 / 0** |
| Escrituras del ACP en Registry / Ledger / KH | **0 / 0 / 0** |
| Veredictos permitidos | 5 canónicos; `HIPÓTESIS` inactivo (G-IA-1) |
| Documentos existentes modificados | **0** |

> Un roadmap no es un consumidor. Aquí se fija el camino; ejecutar cada fase requiere misión explícita.

---

# 1. Fases (definidas, NO ejecutadas)

| Fase | Nombre | Objetivo | Gate de salida |
|---|---|---|---|
| **F0** | Gobernanza | 3 documentos visibles con D-004.6 y subordinación al Ledger V1 | G-ACP-1 |
| **F1** | IDs de proceso | 4 IDs definidos, ninguno compite con las 3 raíces | G-ACP-2 |
| **F2** | Reglas críticas | 6 invariantes de consumo con fixtures de rechazo | G-ACP-3 |
| **F3** | Ciclo | 7 pasos en orden obligatorio, sin realimentación de fuentes | G-ACP-4 |
| **F4** | Veredictos | 5 veredictos cerrados; `HIPÓTESIS` inactivo | G-ACP-5 |
| **F5** | Confianza | `C = MIN × cobertura × penalidad`; nunca por encima de la evidencia más débil | G-ACP-6 |
| **F6** | Modelo y reglas | 10 diagramas + 15+15+15+15 reglas presentes | G-ACP-7 |
| **F7** | Riesgos | 40 riesgos con severidad, umbral, mitigación y fixture | G-ACP-8 |
| **F8** | Coherencia y preservación | Coherencia con 8 documentos y cero escritura en Registry/Ledger | G-ACP-9 |

## 1.1 Reglas de fase

| ID | Regla |
|---|---|
| PH-1 | Ninguna fase arranca sin misión explícita; este roadmap **no la da**. |
| PH-2 | Un gate no se cierra porque el documento exista: requiere fixtures y verificación. |
| PH-3 | Gate fallido ⇒ nueva versión del plan con `supersedes`; nada se borra. |
| PH-4 | Toda entrega declara qué leyó, qué filtros aplicó y qué veredicto emitió (AAUD-2/3/4). |
| PH-5 | Ninguna fase autoriza agente, IA, LLM, prompt, RAG, embedding, API, UI ni base de datos. |
| PH-6 | El orden es aditivo: fases futuras no reescriben contratos anteriores ni el Registry. |

---

# 2. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado hoy |
|---|---|---|
| **G-ACP-1** | 3 documentos visibles con D-004.6 y subordinación al Ledger V1 | `DISENO` |
| **G-ACP-2** | 4 IDs de proceso sin competencia con `observation_id`/`evidence_id`/`event_id` | `DISENO` |
| **G-ACP-3** | 6 reglas críticas verificables con fixtures de rechazo | `DISENO` |
| **G-ACP-4** | Ciclo de 7 pasos con orden obligatorio y sin realimentación | `DISENO` |
| **G-ACP-5** | 5 veredictos cerrados; `HIPÓTESIS` inactivo (G-IA-1) | `DISENO` |
| **G-ACP-6** | `C = MIN × cobertura × penalidad` y regla de evidencia más débil | `DISENO` |
| **G-ACP-7** | 10 diagramas + 15+15+15+15 reglas presentes | `DISENO` |
| **G-ACP-8** | 40 riesgos con severidad, umbral, mitigación y fixture | `DISENO` |
| **G-ACP-9** | Coherencia con 8 documentos + cero escritura en Registry/Ledger | `DISENO` |

> La existencia de este roadmap **no cierra ningún gate**.

---

# 3. Los cuatro bloques de 15 reglas

| Bloque | Rango | Ubicación | Función |
|---|---|---|---|
| Consumo | `ACS-1..ACS-15` | Padre §15 | Orden de lectura, no escritura, no inferencia, exactitud. |
| Confianza | `ACF-1..ACF-15` | Padre §9.2 | `MIN`, cobertura, penalidad, degradación. |
| Trazabilidad | `ATR-1..ATR-15` | Padre §14.1 | Afirmación → ancla → evidencia → observación → traza. |
| Auditoría | `AAUD-1..AAUD-15` | Padre §16 | Actor, razón, fixtures, retención, hallazgos `BLOCKED`. |

**Total:** 60 reglas declaradas, todas `DISENO`. Ninguna se implementa en esta misión.

---

# 4. Coherencia total con los 8 documentos canonizados

| # | Documento | Contrato acatado por el ACP | Estado |
|---|---|---|---|
| 1 | Acoustic Governance V2 | `legacy_sample_id`, `sha256`, 9 clases, `window.v2` 44 dims, OOD sin cupos. | ✅ Sin cambio |
| 2 | Vision Governance V1 | `scene_id` de contexto, clases atómicas, 25 riesgos visuales. | ✅ Sin cambio |
| 3 | Telemetry Governance V1 | `NO_DATA ≠ 0 ≠ NULL`, sentinela `lectura_desconocida`, 24 métricas. | ✅ Sin cambio |
| 4 | Multimodal Governance V1 | OB-1..5: `observation_id` raíz, opaco e inmutable. | ✅ Sin cambio |
| 5 | Multimodal Masterplan V1 | OBS-10..14: autoridad única y 10 años sin refactor de la raíz. | ✅ Sin cambio |
| 6 | Observation Platform V1 | ACP-1..8, KH-1..6, `ObservationPackage`, `PENDING_ACCEPTANCE`. | ✅ Sin cambio |
| 7 | Observation Registry V1 | ACR-1..10, KHR-1..8, versión por `supersedes`, sin inferencia. | ✅ Sin cambio |
| 8 | Evidence Ledger V1 | AEL-1..12, KEL-1..10, REP-1..8; ACP no crea evidencia. | ✅ Sin cambio |

**Adicionales intactos:** Carta IA V1.0.1 (P-IA-1..7, H1-H10, C-4/5/6, N-1/N-2, G-IA-1), F4 (núcleo determinista + slot `Interprete`), Constitución V1.0.1 y D-003.

---

# 5. Escenarios de cambio sin romper la raíz

| Escenario | ¿Cambia `observation_id`? | ¿Escribe el ACP? | Comportamiento |
|---|---|---|---|
| Audio v1 → v2 → v3 | **No** | **No** | Lee versión vigente por `supersedes`; cita la anterior como histórico. |
| Aparece visión o telemetría | **No** | **No** | Lee nuevos `asset_id` colgados de la misma raíz. |
| Evidencia corregida | **No** | **No** | Ancla `evidence_version_ids[]` de la corrección. |
| Evidencia retirada | **No** | **No** | Degrada a `NO_DATA`/`BLOCKED`; no borra ni finge. |
| Evidencia controvertida | **No** | **No** | `PARTIAL` con ambas anclas; no elige ganador. |
| Cambia el proveedor de lenguaje | **No** | **No** | El slot no es fuente de verdad (ACF-7). |
| El ACP emite un reporte | **No** | **No en fuentes** | `acprep_` + `acpt_`; no realimenta Registry ni Ledger. |
| El KH promociona un doc | **No** | **No** | El ACP propone; el KH decide (KHA-2). |
| Escala a muchas queries | **No** | **No** | Cada traza append-only con su propia huella. |

---

# 6. Criterios de éxito de la misión

| # | Requisito | Sección | Estado |
|---|---|---|---|
| 1 | Qué es / qué no es ACP | Padre §1 | ✅ |
| 2 | Responsabilidad exacta | Padre §2 | ✅ |
| 3 | Qué puede / no puede leer | Padre §3 | ✅ |
| 4 | Qué puede / no puede producir | Padre §4 | ✅ |
| 5 | ACP no crea observaciones/eventos/evidencia | Padre §5 CR-1..3 | ✅ |
| 6 | ACP no modifica Registry ni Ledger; solo consume | Padre §5 CR-4..6 | ✅ |
| 7 | 4 IDs definidos sin competir con raíces | Padre §6 · Modelo D-ACP2 | ✅ |
| 8 | Ciclo pregunta→registry→ledger→filtro→análisis→respuesta→report | Padre §7 · Modelo D-ACP3 | ✅ |
| 9 | 5 veredictos, sin nuevos | Padre §8 · Modelo D-ACP5 | ✅ |
| 10 | Confianza `MIN`, nunca por encima de la evidencia débil | Padre §9 · Modelo D-ACP6 | ✅ |
| 11 | Conflictos y SUPERSEDED/RETRACTED/CORRECTED/DISPUTED | Padre §10 · Modelo D-ACP7 | ✅ |
| 12 | `NO_DATA` sin relleno ni inferencia | Padre §11 · Modelo D-ACP8 | ✅ |
| 13 | Anclas obligatorias; sin ancla = `BLOCKED` | Padre §12 | ✅ |
| 14 | KH: ACP propone, KH decide | Padre §13 · Modelo D-ACP10 | ✅ |
| 15 | Trazabilidad respuesta→afirmación→ancla→evidencia→observación | Padre §14 · Modelo D-ACP9 | ✅ |
| 16 | 10 diagramas ASCII | Modelo D-ACP1..D-ACP10 | ✅ |
| 17 | 15+15+15+15 reglas | §3 | ✅ |
| 18 | 40 riesgos con severidad, umbral, mitigación y fixture | §9 | ✅ |
| 19 | Coherencia con 8 documentos | §4 | ✅ |
| 20 | Sin modificar documentos existentes ni raíces | §5 · §7 | ✅ |

---

# 7. Fixtures de rechazo globales

| Fixture | Resultado esperado |
|---|---|
| Fase iniciada sin misión explícita | `BLOCKED` (PH-1) |
| Gate cerrado solo porque existe el documento | `BLOCKED` (PH-2) |
| `observation_id` cambiado por una respuesta del ACP | `BLOCKED` (R-35) |
| Archivo existente modificado en nombre de esta misión | `BLOCKED` (R-36) |
| ACP escribe en Registry o Ledger | `BLOCKED` (R-04/R-05) |
| Agente, IA, LLM, prompt, RAG o embedding creado aquí | `BLOCKED` (R-34) |
| `git add` / commit / push / merge / tag ejecutado | `BLOCKED` (fuera de alcance) |

---

# 8. Cierre operativo honesto

El ACP hoy es un **contrato de consumo**, no un servicio. Puede razonarse y auditarse en papel: qué lee, qué no lee, qué produce, qué veredictos emite, cómo calcula confianza, cómo trata conflictos, cómo ancla afirmaciones y cómo propone al KH sin promover. Su ejecución requiere misión explícita, gates propios y la misma preservación que gobierna al Registry y al Ledger.

---

# 9. Los 40 riesgos más importantes del ACP

> **Única fuente de verdad.** Severidad: 🔴 bloqueante · 🟡 alto. Cada riesgo define **sev**, **umbral**, **mitigación** y **fixture de rechazo**. Ninguno se resuelve creando IA ni escribiendo en las fuentes.

| # | Riesgo | Sev. | Umbral | Mitigación | Fixture de rechazo |
|---|---|---|---|---|---|
| **R-01** | ACP crea `observation_id` a partir de una query. | 🔴 | 1 query convertida en observación | CR-1, ACS-3: la query solo produce `acpq_`. | Query con salida `obs_...` ⇒ `BLOCKED`. |
| **R-02** | ACP crea `event_id` por correlación. | 🔴 | 1 `event_id` emitido por el ACP | CR-2, ACS-4: el evento es ocurrencia real declarada. | Correlación por timestamp con `event_id` nuevo ⇒ `BLOCKED`. |
| **R-03** | ACP crea evidencia en el Ledger. | 🔴 | 1 `evd_` / `evdver_` / `evdchain_` escrito | CR-3, AUT-5, AEL-7: solo consume. | Entrada de cadena con actor `ACP` ⇒ `BLOCKED`. |
| **R-04** | ACP modifica Observation Registry. | 🔴 | 1 escritura en `obsver_`/`obshist_`/`obsrel_` | CR-4, ACR-6: cero escritura. | ACP cierra una versión ⇒ `BLOCKED`. |
| **R-05** | ACP modifica Evidence Ledger. | 🔴 | 1 escritura en `evdver_`/`evdchain_`/`evdrel_` | CR-5, AEL-7: solo lectura. | ACP corrige una versión ⇒ `BLOCKED`. |
| **R-06** | ACP promueve conocimiento al KH. | 🔴 | 1 `doc_id` creado por el ACP | KHA-2/4: ACP propone, KH decide. | `doc_id` con autoría ACP ⇒ `BLOCKED`. |
| **R-07** | Veredicto nuevo o `HIPÓTESIS` activo. | 🔴 | 1 veredicto fuera de los 5 | VER-1, AAUD-9, G-IA-1. | `INFERRED` / `HIPÓTESIS` ⇒ `BLOCKED`. |
| **R-08** | Confianza superior a la evidencia más débil. | 🔴 | `C > MIN(anclas)` | ACF-1/2, AAUD-7: regla dura. | `C=0.9` con ancla `0.4` ⇒ `BLOCKED`. |
| **R-09** | Confianza calculada por promedio, máximo o suma. | 🔴 | 1 cálculo no-MIN | ACF-3/4/5. | `C=avg(...)` en traza ⇒ `BLOCKED`. |
| **R-10** | Relleno de `NO_DATA`. | 🔴 | 1 imputación, promedio o modelo completando ausencia | ND-2, AAUD-8, P-IA-5. | `NO_DATA` con valor ⇒ `BLOCKED`. |
| **R-11** | Inferencia de `NO_DATA` desde otras observaciones. | 🔴 | 1 derivación de ausencia | ND-3, ACS-12. | Vecindario usado como dato ⇒ `BLOCKED`. |
| **R-12** | `NO_DATA` convertido en `0`, `null` o fila ausente. | 🔴 | 1 conversión | ND-4; Telemetría V1 §4. | `value=0` como ausencia ⇒ `BLOCKED`. |
| **R-13** | Afirmación sin ancla. | 🔴 | 1 afirmación sin `ancla_id` | ANC-1/2, ATR-3: `BLOCKED`. | Reporte `RESOLVED` con texto sin ID ⇒ `BLOCKED`. |
| **R-14** | Ancla insuficiente (`event_id`, `doc_id`, `report_id`, IDs ACP). | 🔴 | 1 ancla no válida como sustento | ATR-5, §12.3. | `doc_id` como única ancla ⇒ `BLOCKED`. |
| **R-15** | No resolver versión vigente por `supersedes`. | 🔴 | 1 uso de "la última fila" | ACS-6, EVER-2, VER-3. | Responder con versión `valid_to != null` ⇒ `BLOCKED`. |
| **R-16** | Disputa resuelta por votos, fecha o confianza. | 🔴 | 1 `DISPUTED` cerrado sin entrada humana | CONF-1..4, ASC-4. | `PARTIAL` forzado; ganador por fecha ⇒ `BLOCKED`. |
| **R-17** | `RETRACTED`/`RETIRED` usado como ancla vigente. | 🔴 | 1 afirmación anclada a retirada | §10, AEL-9. | Ancla retirada ⇒ `NO_DATA`/`BLOCKED`. |
| **R-18** | No declarar `evidence_version_ids[]` en el reporte. | 🔴 | 1 reporte sin versión leída | REP-8, ATR-6, AEL-3. | Reporte sin versión ⇒ `PARTIAL`/`BLOCKED`. |
| **R-19** | Traza reescrita in-place. | 🔴 | 1 `acpt_` con huella cambiada | ATR-10, AAUD-13: append-only. | Edición de traza ⇒ `BLOCKED`. |
| **R-20** | Traza sin actor ni razón. | 🔴 | 1 entrada sin `actor_id`/`reason` | AAUD-1/4, CUS-1. | Traza sin razón ⇒ hallazgo `BLOCKED`. |
| **R-21** | Fecha sin `timezone`. | 🟡 | 1 `at`/`requested_at` sin zona | ACS-9, BS-3. | Fecha sin zona ⇒ `BLOCKED`. |
| **R-22** | Búsqueda `LIKE`, prefijo o fuzzy sobre ID opaco. | 🟡 | 1 consulta no exacta | ACS-8, BS-2/6. | `LIKE 'obs%'` ⇒ `BLOCKED`. |
| **R-23** | Inferencia de relaciones por timestamp. | 🟡 | 1 arista inferida | ACS-7, OR-1, TEL-11. | Co-ocurrencia sin `event_id` ⇒ `PARTIAL`. |
| **R-24** | LLM / `Interprete` como fuente de verdad. | 🔴 | 1 ancla con autoría de modelo | LECT-1, Carta IA R-9.3. | LLM citado como ancla ⇒ `BLOCKED`. |
| **R-25** | Prompt, RAG o embedding como fuente. | 🟡 | 1 artefacto no gobernado citado | §3.2, límite de misión. | Vector store citado ⇒ `BLOCKED`. |
| **R-26** | `posicion` o personas sin consentimiento sin redactar. | 🔴 | 1 vista con coordenadas exactas | ACS-11, CUS-6, ACP-6. | Vista sin redacción ⇒ `PARTIAL`/`BLOCKED`. |
| **R-27** | Evidencia `REF` presentada como evaluación propia. | 🔴 | 1 fila `REF` sin etiqueta | ACS-13, AEL-10, EID-4. | `REF` como `REAL` ⇒ `BLOCKED`. |
| **R-28** | Filtro implícito o discriminación inventada. | 🟡 | 1 filtro no declarado | AAUD-3, ACS-10. | Filtro ausente en traza ⇒ hallazgo `BLOCKED`. |
| **R-29** | Reporte realimenta Registry o Ledger. | 🔴 | 1 escritura originada en `acprep_` | CIC-2, CR-4/5. | Reporte que cierra versión ⇒ `BLOCKED`. |
| **R-30** | ACP resuelve conflicto documental. | 🔴 | 1 D-003 decidido por el ACP | KHA-6, KHR-8. | ACP elige documento canónico ⇒ `BLOCKED`. |
| **R-31** | Doble escritura de `docsByEvidence`. | 🟡 | 2 índices con la misma relación | KHA-5, KEL-5, MP-8. | Índice duplicado ⇒ `BLOCKED`. |
| **R-32** | `doc_id` copia bytes o envelope del Ledger. | 🔴 | 1 documento con datos del paquete | KEL-4, KHA-4. | Envelope copiado ⇒ `BLOCKED`. |
| **R-33** | Escala sin índices lógicos declarados. | 🔴 | 1 búsqueda sin campo indexado | §1 y PH-2 del Registry aplicable. | Query sin índice declarado ⇒ `BLOCKED`. |
| **R-34** | Scope creep: crear agente, IA, LLM, prompt, RAG, embedding, API, UI o DB. | 🔴 | 1 artefacto de los prohibidos | Límite duro de la misión, PH-5. | Archivo de agente/prompt/SQL ⇒ `BLOCKED`. |
| **R-35** | Cambiar `observation_id` en nombre del ACP. | 🔴 | 1 raíz reescrita | Invariante de raíz, R-30 del Ledger. | `observation_id` distinto tras respuesta ⇒ `BLOCKED`. |
| **R-36** | Modificar documento existente (Platform, Registry, Ledger, gobernanzas, Carta IA). | 🔴 | 1 línea cambiada fuera de los 3 nuevos | Coherencia §4, G-ACP-9. | Diff en documento existente ⇒ `BLOCKED`. |
| **R-37** | Operar con gates abiertos sin misión explícita. | 🔴 | 1 fase iniciada sin orden | PH-1, PH-2, G-ACP-1..9. | Arranque sin misión ⇒ `BLOCKED`. |
| **R-38** | Auditoría sin fixtures de rechazo. | 🟡 | 1 hallazgo sin fixture | AAUD-15, G-IA-3, G-ACP-8. | Hallazgo sin fixture ⇒ `PARTIAL`. |
| **R-39** | Pérdida de traza a 10 años por compactación destructiva. | 🟡 | 1 `acpt_` eliminado | AAUD-14, AP-5. | Traza faltante ⇒ `BLOCKED`. |
| **R-40** | Confundir ACP con un agente autónomo con herramientas. | 🔴 | 1 ejecución de lab o apertura de puerto desde el ACP | F4 §6: consulta, cruza, devuelve; no ejecuta. | ACP ejecutando una herramienta ⇒ `BLOCKED`. |

## 9.1 Distribución de severidad

| Severidad | Cantidad | IDs |
|---|---:|---|
| 🔴 Bloqueante | 32 | R-01..R-20, R-24, R-26, R-27, R-29, R-30, R-32, R-33, R-34, R-35, R-36, R-37, R-40 |
| 🟡 Alto | 8 | R-21, R-22, R-23, R-25, R-28, R-31, R-38, R-39 |
| 🟢 Moderado | 0 | — |

> Conteo verificable: 32 + 8 = 40. La fila 🟢 se mantiene en 0 para declarar que no hay riesgos menores ignorables.

---

# 10. Cierre

El roadmap lleva el ACP de la gobernanza a la coherencia total en nueve fases, con nueve gates, 60 reglas y 40 riesgos. La arquitectura oficial queda como **consumidor estricto** de Registry y Ledger: lee en orden, nunca escribe, nunca crea hechos ni evidencia, degrade honestamente y preserva la raíz. El ACP propone; el KH decide. `observation_id` sigue siendo la raíz única del ecosistema.

**Criterio de éxito:** satisfecho **en el plano contractual**. Su verificación operativa queda para F8 bajo misión explícita.

**Estado honesto:** **`DISENO`**, 0/9 fases, 0/9 gates, 0 artefactos operativos, 0 agente, 0 IA, 0 LLM, 0 prompt, 0 RAG, 0 embedding, 0 API, 0 UI, 0 base de datos. Sin modificar ningún documento existente. Sin commit, push, merge ni tag.

---

*Fin del roadmap del ACP. Complementa —nunca sustituye— `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md`, `ACP_ENTITY_MODEL_V1.md`, la Carta IA, F4, la Observation Platform V1, el Observation Registry V1 y el Evidence Ledger V1.*
