# ROADMAP DEL KNOWLEDGE HUB V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T00:06:52-05:00
> - Origen: misión `SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1` (documento nuevo)
> - Destino: `docs/governance/KNOWLEDGE_HUB_ROADMAP_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: fases, gates, coherencia y los 40 riesgos del Knowledge Hub. No crea base de datos, UI, API, IA, agente, LLM, prompt, RAG, embedding ni vector store.

**Misión:** `SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1`
**Naturaleza:** documentación oficial de **gobernanza de roadmap**. Contrato **`DISENO`**.
**Fecha:** 2026-11-21 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Fuentes:** `SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1.md` · `KNOWLEDGE_HUB_ENTITY_MODEL_V1.md` · Constitución V1.0.1 · Carta IA V1.0.1 · D-003 · Platform V1 · Registry V1 · Ledger V1 · ACP V1.
**No hace:** no implementa KH, no crea IDs operativos, no define endpoints, no escribe en fuentes, no commitea.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Fuente única de los 40 riesgos:** este documento §9. Los otros dos documentos remiten aquí.
> **Invariante:** autoridad de canonización bajo D-003, **sin modificar `observation_id`**, **sin escribir Registry ni Ledger** y **sin romper la trazabilidad observación → evidencia → reporte → conocimiento**.

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Fases cerradas | **0 / 9** |
| Gates cerrados | **0 / 9** |
| Promociones gobernadas (`docprom_`) | **0** |
| Regeneraciones gobernadas | **0** |
| Documentos del registro maestro clasificados | **45 filas (declarativas, `DISENO`)** |
| IDs nuevos operativos | **0 / 5** |
| Base de datos / índice / UI / API | **0 / 0 / 0 / 0** |
| IA / agente / LLM / prompt / embedding / vector store / RAG | **0 / 0 / 0 / 0 / 0 / 0 / 0** |
| Escrituras del KH en Registry / Ledger / ACP | **0 / 0 / 0** |
| Borrados o reescrituras históricas | **0** |
| Documentos existentes modificados | **0** |

> Un roadmap no es un Knowledge Hub. Aquí se fija el camino; ejecutar cada fase requiere misión explícita y cierre de gates.

---

# 1. Fases (definidas, NO ejecutadas)

| Fase | Nombre | Objetivo | Gate de salida |
|---|---|---|---|
| **F0** | Gobernanza | 3 documentos visibles con D-004.6 y subordinación a D-003 | G-KH-1 |
| **F1** | IDs | 5 IDs definidos, ninguno compite con las 3 raíces | G-KH-2 |
| **F2** | Estados | 6 estados documentales ortogonales a honestidad y veredictos | G-KH-3 |
| **F3** | Ciclo | 6 pasos en orden obligatorio y 15 condiciones de promoción | G-KH-4 |
| **F4** | Autoría | ACP propone / KH decide / LLM interpreta / Ledger provee | G-KH-5 |
| **F5** | Registro maestro | 6 clases, 45 filas, 4 vistas derivadas sin doble escritura | G-KH-6 |
| **F6** | Modelo y reglas | 10 diagramas + 5 bloques de 15 reglas presentes | G-KH-7 |
| **F7** | Riesgos | 40 riesgos con severidad, umbral, mitigación y fixture | G-KH-8 |
| **F8** | Coherencia y preservación | Coherencia con 9 documentos, raíz intacta, cero borrado | G-KH-9 |

## 1.1 Reglas de fase

| ID | Regla |
|---|---|
| PH-1 | Ninguna fase arranca sin misión explícita; este roadmap **no la da**. |
| PH-2 | Un gate no se cierra porque el documento exista: requiere fixtures y verificación. |
| PH-3 | Gate fallido ⇒ nueva versión del plan con `supersedes`; nada se borra. |
| PH-4 | Toda entrega declara qué anclas leyó, qué revisó y qué decidió (KAU-1/2/3). |
| PH-5 | Ninguna fase autoriza IA, agente, LLM, prompt, embedding, vector store, RAG, API, UI ni base de datos. |
| PH-6 | El orden es aditivo: fases futuras no reescriben contratos anteriores ni fuentes. |
| PH-7 | Toda regeneración de registry conserva el snapshot anterior (KREG-4). |
| PH-8 | Toda promoción lleva decisión humana; la IA nunca decide (AUT-2, P-IA-6). |

---

# 2. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado hoy |
|---|---|---|
| **G-KH-1** | 3 documentos visibles con D-004.6 y subordinación a D-003 | `DISENO` |
| **G-KH-2** | 5 IDs sin competencia con `observation_id`/`evidence_id`/`event_id` | `DISENO` |
| **G-KH-3** | 6 estados documentales, ortogonales a 7 estados y 5 veredictos | `DISENO` |
| **G-KH-4** | Ciclo de 6 pasos y 15 condiciones de promoción verificables | `DISENO` |
| **G-KH-5** | ACP propone / KH decide / LLM interpreta / Ledger provee | `DISENO` |
| **G-KH-6** | Registro maestro con 6 clases y 4 vistas derivadas, sin doble escritura | `DISENO` |
| **G-KH-7** | 10 diagramas + 5 bloques de 15 reglas presentes | `DISENO` |
| **G-KH-8** | 40 riesgos con severidad, umbral, mitigación y fixture | `DISENO` |
| **G-KH-9** | Coherencia con 9 documentos + raíz y trazabilidad intactas | `DISENO` |

> La existencia de este roadmap **no cierra ningún gate**.

---

# 3. Los cinco bloques de 15 reglas

| Bloque | Rango | Ubicación | Función |
|---|---|---|---|
| Promoción | `KPR-1..KPR-15` | Padre §13 | Origen en `promotion_candidate`, autoría, condiciones, decisión. |
| Trazabilidad | `KTR-1..KTR-15` | Padre §14 | Retroceso knowledge→report→evidence→observation. |
| Obsolescencia | `KOB-1..KOB-15` | Padre §15 | `deprecated_on`, `superseded_by`, `retired_on`, sin borrado. |
| Auditoría | `KAU-1..KAU-15` | Padre §16 | Actor, revisor, huella, fixtures, retención. |
| Canonización | `KCN-1..KCN-15` | Padre §17 | D-003, único canónico, regeneración, sin implementación. |

**Total:** 75 reglas. Ninguna autoriza ejecución.

---

# 4. Secuencia de promoción (declarativa)

```
  candidato ACP  ->  Hangar  ->  D-003  ->  humano  ->  decision
       |              |           |          |            |
       +--- KPR-1 ----+--- KPR-6 -+--- KPR-7 +-- KPR-8 ----+
                                Decisiones: ADMITTED | DEFERRED | REJECTED
                                          |
                                    entrada PROMOTED
                                          |
                                    regeneracion KREG-1..10
                                          |
                                    DOC_ID + 4 vistas derivadas
```

---

# 5. Matriz de autoría

| Actor | Crea | No crea | Fundamento |
|---|---|---|---|
| Knowledge Hub | Promoción, `doc_id`, versión, cadena, regeneración | Observación, evidencia, reporte, hecho | §5.1, KCN-14 |
| ACP | `ACP_REPORT_ID` con `promotion_candidate` | Conocimiento, `doc_id` | KHA-2/3, KPR-2 |
| LLM / `Interprete` | Interpretación | Conocimiento | KPR-3, P-IA-5 |
| Evidence Ledger | Evidencia y custodia | Conocimiento | KPR-4, KEL-2 |
| Observation Registry | Identidad y trazabilidad | Conocimiento | KHR-5 |
| Revisor humano | Decisión registrada | Hechos ni evidencia | AUT-2, P-IA-6 |

---

# 6. Políticas de preservación (resumen operativo)

| Política | Marcadores | Prohibición |
|---|---|---|
| Obsolescencia | `deprecated_on` + razón | Borrar o reescribir (KOB-1/2/9) |
| Supersedes | `supersedes` · `superseded_by` · `valid_from/valid_to` | Dos vigentes sin cadena (KSUP-4) |
| Retiro | `retired_on` · `replaced_by` | Eliminar evidencia de origen (KRET-5) |
| Regeneración | `REGENERATED` + `prev_chain_sha256` | Editar registry a mano (KREG-1, KEL-3) |

---

# 7. Coherencia con gobernanzas previas

| # | Documento | Contrato acatado | Estado |
|---|---|---|---|
| 1 | Acoustic Governance V2 | `legacy_sample_id`, 61 `class_id`, `sha256`, OOD sin cupos | ✅ Sin cambio |
| 2 | Vision Governance V1 | `scene_id`, clases atómicas, 25 riesgos | ✅ Sin cambio |
| 3 | Telemetry Governance V1 | `NO_DATA ≠ 0 ≠ NULL`, 24 métricas | ✅ Sin cambio |
| 4 | Multimodal Governance V1 | OB-1..5; `OBSERVATION_ID` raíz | ✅ Sin cambio |
| 5 | Multimodal Masterplan V1 | OBS-10..14; 10 años sin refactor | ✅ Sin cambio |
| 6 | Observation Platform V1 | KH-1..6; `docsByObservation` derivado | ✅ Sin cambio |
| 7 | Observation Registry V1 | ACR-1..10, KHR-1..8; sin inferencia | ✅ Sin cambio |
| 8 | Evidence Ledger V1 | AEL-1..12, KEL-1..10; Ledger provee | ✅ Sin cambio |
| 9 | ACP Consumer Architecture V1 | CR-1..6, KHA-1..10; ACP propone, KH decide | ✅ Sin cambio |

**Adicionales intactos:** Constitución V1.0.1, Carta IA V1.0.1 (P-IA-1..7), D-003 (jerarquía y conflictos) y F3E (Hangar y regeneración).

---

# 8. Criterio de éxito y cierre

Se satisface en el plano contractual: arquitectura oficial del KH con cinco IDs subordinados, seis estados documentales, seis escenarios sin borrado, registro maestro de 45 filas, cuatro vistas derivadas, 75 reglas y 40 riesgos, sin tocar raíces ni fuentes.

**Estado honesto:** contrato **`DISENO`**; 0 fases y 0 gates cerrados; sin implementación; sin commit, push, merge ni tag.

---

# 9. Los 40 riesgos más importantes del Knowledge Hub

> **Única fuente de verdad.** Severidad: 🔴 bloqueante · 🟡 alto. Cada riesgo define **sev**, **umbral**, **mitigación** y **fixture de rechazo**. Ninguno se resuelve creando IA ni escribiendo en las fuentes.

| # | Riesgo | Sev. | Umbral | Mitigación | Fixture de rechazo |
|---|---|---|---|---|---|
| **R-01** | KH crea un `OBSERVATION_ID`. | 🔴 | 1 `obs_` emitido por el KH | §3: ningún ID compite con la raíz; KCN-14. | Salida `obs_...` del KH ⇒ `BLOCKED`. |
| **R-02** | KH crea `EVIDENCE_ID` o escribe en el Ledger. | 🔴 | 1 `evd_`/`evdver_`/`evdchain_` escrito | KEL-1, KAU-10: solo lectura. | Entrada de cadena con actor KH ⇒ `BLOCKED`. |
| **R-03** | KH modifica el Observation Registry. | 🔴 | 1 escritura en `obsver_`/`obsrel_` | KHR-7, KAU-10: cero escritura. | KH cierra versión de observación ⇒ `BLOCKED`. |
| **R-04** | KH crea o modifica un `ACP_REPORT_ID`. | 🔴 | 1 reporte escrito por el KH | KHA-4, CIC-2: el KH no realimenta. | Reporte con autoría KH ⇒ `BLOCKED`. |
| **R-05** | ACP promueve conocimiento. | 🔴 | 1 `docprom_` con autoría ACP | KHA-2, KPR-2: ACP propone, KH decide. | Promoción firmada por ACP ⇒ `BLOCKED`. |
| **R-06** | LLM promueve conocimiento. | 🔴 | 1 decisión de LLM | KPR-3, P-IA-5: LLM interpreta. | `reviewer_id = llm` ⇒ `BLOCKED`. |
| **R-07** | Promoción automática sin humano. | 🔴 | 1 `ADMITTED` sin `reviewer_id` | AUT-2, KPR-7, P-IA-6. | `ADMITTED` sin revisor ⇒ `BLOCKED`. |
| **R-08** | Promoción sin `hangar_verdict`. | 🔴 | 1 `ADMITTED` sin Hangar | KPR-6, KID-12, F3E §4. | `hangar_verdict = null` admitido ⇒ `BLOCKED`. |
| **R-09** | Promoción sin `d003_check`. | 🔴 | 1 `ADMITTED` sin chequo D-003 | KPR-6, KCN-1/7. | Conflicto documental sin D-003 ⇒ `BLOCKED`. |
| **R-10** | Promoción sin ancla de observación. | 🔴 | 1 `docprom_` sin `observation_ref` | KTR-1/2, KID-11. | Promoción huérfana ⇒ `BLOCKED`. |
| **R-11** | Promoción sin ancla de evidencia vigente. | 🔴 | 1 `docprom_` con `evidence_id` retirado | KPR-9, CMP-2. | Evidencia `RETIRED` en promoción ⇒ `BLOCKED`. |
| **R-12** | Promoción sin `ACP_REPORT_ID`. | 🔴 | 1 `docprom_` sin `report_ref` | KPR-1, KTR-2. | Candidato sin reporte ⇒ `BLOCKED`. |
| **R-13** | Decisión fuera de las 3 permitidas. | 🔴 | 1 `AUTO_ADMITTED` o similar | KID-11, KPR-8. | `AUTO_*` ⇒ `BLOCKED`. |
| **R-14** | Estado honesto mejorado por canonización. | 🔴 | 1 `DISENO` mostrado como `REAL` | KPR-11, KCN-11, KH-6. | Badge `REAL` sobre `SIM` ⇒ `BLOCKED`. |
| **R-15** | Confianza elevada por encima del `MIN`. | 🔴 | `C > MIN(anclas)` | KPR-10, KAU-8, ACF-2. | `C=0.9` con ancla `0.4` ⇒ `BLOCKED`. |
| **R-16** | Veredicto nuevo o `HIPÓTESIS` activo. | 🔴 | 1 veredicto fuera de 5 | KPR-12, KAU-9, G-IA-1. | `INFERRED` / `HIPÓTESIS` ⇒ `BLOCKED`. |
| **R-17** | `NO_DATA` rellenado o convertido en 0/null. | 🔴 | 1 imputación en promoción | VIEW-3, ND-2, KPR-11. | `NO_DATA = 0` ⇒ `BLOCKED`. |
| **R-18** | Borrado histórico de un documento. | 🔴 | 1 `DELETE` o archivo eliminado | Regla suprema, EST-1, KAU-12. | Falta de versión previa ⇒ `BLOCKED`. |
| **R-19** | Reescritura histórica. | 🔴 | 1 texto original modificado in-place | KID-6, KOB-9, ESC-1. | Diff sobre versión cerrada ⇒ `BLOCKED`. |
| **R-20** | Pérdida de trazabilidad. | 🔴 | 1 promoción sin cadena inversa | KTR-13/15, KAU-12. | Sin `report_ref` ⇒ `BLOCKED`. |
| **R-21** | Edición manual del registry. | 🔴 | 1 cambio sin regeneración | KREG-1, KCN-8, KEL-3. | Snapshot sin `REGENERATED` ⇒ `BLOCKED`. |
| **R-22** | Doble escritura del puente KH ↔ observación. | 🔴 | 1 vista escrita por separado | KH-1, KHR-1, KREG-6. | `docsByObservation` persistido ⇒ `BLOCKED`. |
| **R-23** | Segundo índice competing con el maestro. | 🔴 | 1 fuente adicional de verdad | MASTER-1, MP-8, KREG-6. | Dos registros maestros ⇒ `BLOCKED`. |
| **R-24** | Búsqueda por similitud, embedding o RAG. | 🔴 | 1 consulta fuzzy/vectorial | VIEW-2, ACS-8, BS-2. | `LIKE`/embedding en vista ⇒ `BLOCKED`. |
| **R-25** | `doc_id` copiando bytes del `ObservationPackage`. | 🔴 | 1 paquete duplicado en el KH | KH-3, KID-3, KTR-9. | `doc_id` con WAV embebido ⇒ `BLOCKED`. |
| **R-26** | Dos `CANONICAL` en conflicto. | 🔴 | 2 canónicos para un mismo asunto | EST-4, KCN-2, D-003. | Conflicto sin resolución ⇒ `BLOCKED`. |
| **R-27** | Conflicto resuelto por fecha, votos o confianza. | 🔴 | 1 resolución no-D-003 | ESC-3, KOB-11, KHR-8. | `supersedes` por timestamp ⇒ `BLOCKED`. |
| **R-28** | Ciclo de `supersedes` o `REPLACES`. | 🔴 | 1 arista circular | KID-10, KSUP-3, KOB-13. | Ciclo detectado ⇒ `BLOCKED`. |
| **R-29** | Dos versiones vigentes sin cadena. | 🔴 | 2 `valid_to = null` | KSUP-4, KID-5. | Sin `superseded_by` ⇒ `BLOCKED`. |
| **R-30** | Retiro sin `replaced_by` ni razón. | 🔴 | 1 `retired_on` sin motivo | KRET-1/2, KOB-4. | Retiro mudo ⇒ `BLOCKED`. |
| **R-31** | `ARCHIVED` presentado como vigente. | 🔴 | 1 consumo normativo de archivo | EST-1, KOB-6. | Cita vigente de `ARCHIVED` ⇒ `BLOCKED`. |
| **R-32** | `REFERENCE_ONLY` presentado como evaluación propia. | 🔴 | 1 `REF` sin etiqueta | EST-3, KCN-12. | Legacy citado como propio ⇒ `BLOCKED`. |
| **R-33** | Huella rota en cadena o registry. | 🔴 | 1 `prev_chain_sha256` inválido | KID-8, KAU-7, KREG-8. | Hash distinto ⇒ `BLOCKED`. |
| **R-34** | Auditor que promueve o corrige. | 🔴 | 1 mismo actor en 2 roles | KAU-3/4, AUT-3. | `auditor_id = reviewer_id` ⇒ `BLOCKED`. |
| **R-35** | Registrador que interpreta. | 🔴 | 1 registrador emitiendo veredicto | AUT-2, KAU-3. | Veredicto del registrador ⇒ `BLOCKED`. |
| **R-36** | Snapshot de registry sobrescrito. | 🔴 | 1 snapshot anterior ausente | KREG-4, PH-7. | Sin snapshot previo ⇒ `BLOCKED`. |
| **R-37** | Regeneración cambiando estados o veredictos. | 🔴 | 1 estado mejorado al regenerar | KREG-7, KCN-11. | `SIM` → `REAL` en regeneración ⇒ `BLOCKED`. |
| **R-38** | Falta de `timezone` en promoción o cadena. | 🟡 | 1 fecha sin zona | KTR-11, CMP-14, ACS-9. | `at` sin `zzz` ⇒ `REJECTED` en verificación. |
| **R-39** | División o fusión sin linaje declarado. | 🟡 | 1 `SPLIT_INTO`/`MERGED_FROM` sin fuente | ESC-2, D-KH7. | Fusión sin fuentes ⇒ `BLOCKED`. |
| **R-40** | Retención insuficiente o compactación destructiva. | 🟡 | < 10 años o compactación | KAU-14, KOB-14. | Política de borrado ⇒ `BLOCKED`. |

## 9.1 Distribución de severidad

| Severidad | Cantidad | IDs |
|---|---|---|
| 🔴 Bloqueante | 37 | R-01..R-37 |
| 🟡 Alto | 3 | R-38, R-39, R-40 |

## 9.2 Regla de verificación

Todo riesgo se verifica con su fixture de rechazo **antes** de cerrar G-KH-8. Un riesgo sin fixture verificable no se considera mitigado. Ninguna mitigación autoriza crear IA, agente, LLM, API, UI ni base de datos.

---

*Fin del roadmap del Knowledge Hub V1. Complementa la arquitectura padre y el modelo de entidades sin modificar raíces, fuentes ni documentos existentes.*
