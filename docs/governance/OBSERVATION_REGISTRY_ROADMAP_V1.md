# ROADMAP DEL REGISTRO DE OBSERVACIONES V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T23:09:16-05:00
> - Origen: misión `SIGCTIARURAL_OBSERVATION_REGISTRY_V1` (documento nuevo)
> - Destino: `docs/governance/OBSERVATION_REGISTRY_ROADMAP_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: fases, gates, escala y los 30 riesgos del Registry. No crea base de datos, API, UI ni código.

**Misión:** `SIGCTIARURAL_OBSERVATION_REGISTRY_V1`
**Naturaleza:** documentación oficial de **gobernanza de roadmap**. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Fuentes:** `SIGCTIARURAL_OBSERVATION_REGISTRY_V1.md` · `OBSERVATION_REGISTRY_ENTITY_MODEL_V1.md` · Observation Platform V1 · Masterplan V1 §3.2 y §11.
**No hace:** no implementa registro, no crea asignador de IDs, no define endpoints, no captura, no entrena, no commitea.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Fuente única de los 30 riesgos:** este documento §9. Los otros dos documentos remiten aquí.
> **Invariante:** `observation_id` intacto a 100.000 observaciones, 1.000.000 de assets y 10 años.

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Fases cerradas | **0 / 8** |
| Observaciones registradas por el Registry | **0** |
| Versiones / historias / relaciones materializadas | **0 / 0 / 0** |
| Base de datos, API, UI, esquema físico | **0** |
| Escala objetivo | 100.000 observaciones · 1.000.000 assets · 10 años — **objetivo de diseño, NO medido** |
| Dataset acústico v1 | **Intacto** (7 muestras, `schema.json` 1.3.0) |

> Un roadmap no es un registro. Aquí se fija el camino; ejecutar cada fase requiere misión explícita.

---

# 1. Qué se escala y qué no

| Dimensión | Hoy | Objetivo | Cómo se mide sin romper la raíz |
|---|---:|---:|---|
| Observaciones | 0 en Registry (7 muestras acústicas en dataset v1) | **100.000** | Conteo por `observation_id` único; sin reutilización (OB-3). |
| Assets | 0 en Registry | **1.000.000** | Conteo por `asset_id`; uno por modalidad y versión de bytes (AS-2). |
| Historia | 0 | **10 años** | Entradas `obshist_` encadenadas por huella; retención declarada (AUD-12). |
| Versiones | 0 | 1..N por observación | `obsver_` + `supersedes`; sin reescritura (VER-1). |
| Relaciones | 0 | 0..N por entidad | `obsrel_` tipadas; sin inferencia (OR-1). |

**Regla ESC-1:** escalar **no** significa implementar. Ninguna fase de este roadmap autoriza código, almacenamiento ni servicios.
**Regla ESC-2:** los conteos objetivo son **`ESTIMADO`/diseño**, nunca datos medidos.

---

# 2. Fases (definidas, NO ejecutadas)

| Fase | Nombre | Objetivo | Gate de salida |
|---|---|---|---|
| **F0** | Gobernanza | 3 documentos visibles con D-004.6 y autoridad declarada | G-ORR-1 |
| **F1** | Contrato de identificadores | 4 IDs definidos, ninguno raíz; resolución de los 5 IDs existentes | G-ORR-2 |
| **F2** | Autoridad de asignación | Regla de único escritor y reserva de bloques T0 (sin implementar) | G-ORR-3 |
| **F3** | Versión e historia | `obsver_` + `obshist_` append-only con huella encadenada | G-ORR-4 |
| **F4** | Relaciones y trazabilidad | 10 tipos de `obsrel_` y cadena completa hasta KH | G-ORR-5 |
| **F5** | Auditoría y búsqueda | 12 reglas de auditoría y 7 búsquedas obligatorias | G-ORR-6 |
| **F6** | Escala | 100.000 observaciones y 1.000.000 de assets con IDs sin cambios | G-ORR-7 |
| **F7** | Preservación | 10 años, migración de almacenamiento y formatos obsoletos | G-ORR-8 |

## 2.1 Reglas de fase

| ID | Regla |
|---|---|
| PH-1 | Ninguna fase arranca sin misión explícita; este roadmap **no la da**. |
| PH-2 | Un gate no se cierra por documentación: requiere evidencia verificable y fixtures. |
| PH-3 | Gate fallido ⇒ nueva versión del plan con `supersedes`; nada se borra. |
| PH-4 | Cada fase entrega por `delivery_manifest` en `PENDING_ACCEPTANCE` (P7-2). |
| PH-5 | F6 y F7 **no implican** IA, entrenamiento ni inferencia. |
| PH-6 | El orden es aditivo: fases futuras no reescriben contratos anteriores. |

---

# 3. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado hoy |
|---|---|---|
| **G-ORR-1** | 3 documentos visibles con D-004.6 | `DISENO` |
| **G-ORR-2** | 4 IDs nuevos sin competir con la raíz; 5 resolutores con fixtures | `DISENO` |
| **G-ORR-3** | Autoridad única y reserva de secuencia declaradas, sin asignador operativo inventado | `DISENO` |
| **G-ORR-4** | Versión vigente por `supersedes` e historia encadenada por huella | `DISENO` |
| **G-ORR-5** | Cadena observation→assets→eventos→evidencia→reportes→KH sin saltos inferidos | `DISENO` |
| **G-ORR-6** | Auditoría con actor/razón/zonas y 7 búsquedas exactas | `DISENO` |
| **G-ORR-7** | 100.000 / 1.000.000 con `observation_id` sin cambios | `DISENO` |
| **G-ORR-8** | Prueba de preservación a 5 y 10 años sin refactor | `DISENO` |

> La existencia de este roadmap **no cierra ningún gate**.

---

# 4. Compatibilidad con los contratos existentes

| Contrato | Requisito | Cumplimiento del Registry |
|---|---|---|
| Multimodal V1 (OB-1..5) | ID opaco, estable, sin reutilización | RA-1..RA-10; ninguna entidad nueva modifica la raíz. |
| Masterplan (OBS-10..14) | Autoridad única, 10 años sin refactor | §2 del padre; F2 y F7. |
| Platform V1 (PL-1..10) | Captura, empaqueta, entrega `PENDING_ACCEPTANCE` | El Registry **lee** el paquete; no lo reemplaza. |
| Platform §7 (ACP-1..8) | ACP lee y produce `report_id`; no escribe | ACR-1..10. |
| Platform §7 (KH-1..6) | `docsByObservation` derivado, sin doble escritura | KHR-1..8. |
| Gobernanza acústica v2 | `legacy_sample_id`, `sha256`, OOD sin cupos | DS-6; sin escritura en `v1/`. |
| Gobernanza visual v1 | `scene_id` de contexto, clases atómicas | SRCH-4: `domain.scene_id` como facet, nunca clase. |
| Gobernanza telemétrica v1 | `NO_DATA` ≠ 0 ≠ NULL, `event_id` correlaciona | SRCH-3/10; OR-2; sin imputación. |
| 7 estados canónicos | No ampliar, no mejorar por decreto | Invariante del padre; VER-6; D-R6-2. |
| 5 veredictos ACP | Vocabulario cerrado | AUD-7, ACR-5; sin veredictos nuevos. |

---

# 5. La escala sin cambiar la raíz

| Escenario de cambio (Masterplan §3.4) | ¿Cambia `observation_id`? | Mecanismo del Registry |
|---|---|---|
| Audio v1 → v2 → v3 | **No** | `obsver_` con crosswalk y `legacy_sample_id` (VER-3, DS-6). |
| Aparecen imagen y video | **No** | Nuevos `asset_id` colgados de la misma raíz (OB-4). |
| Aparece telemetría T3 | **No** | Nuevo `telemetry_` sin nueva raíz. |
| Cambia el proveedor de LLM | **No** | `model_id` es campo del `report_`, no ancla (ACR-6). |
| Cambia el esquema de 42 columnas | **No** | `schema_version` + versión hermana (VER-5). |
| Se migra el almacenamiento | **No** | IDs + huellas en manifiestos, sin foreign keys físicas (OBS-13). |
| Se corrige una etiqueta | **No** | Nuevo `annotation_id` con `supersedes` (escenario 4). |
| Cambia la época del registro (`reg_`) | **No** | REG-1: relevo de autoridad, no migración de identidad. |
| Un asset desaparece | **No** | Entrada `ASSET_MISSING`; referencia conservada (escenario 2). |
| Se escala a 1.000.000 de assets | **No** | Cada asset con dueño explícito y su propia huella (AS-1/5). |

---

# 6. Derivación a datasets futuros

| Regla | Garantía |
|---|---|
| Proyección de solo lectura (DS-1..3) | El histórico nunca se reescribe; el dataset acústico v1 sigue intacto. |
| Tres anclas por fila (DS-2) | `source_observation_id` · `source_asset_id` · `source_version_id`. |
| Manifiesto `PENDING_ACCEPTANCE` (DS-2) | Ninguna UI afirma `accepted` (P7-2). |
| Splits por `session_id`/`place_id` (DS-4) | Sin fuga de sesión; selección reproducible. |
| Bump de taxonomía ⇒ otra proyección (DS-5) | v1, v2 y v3 conviven con crosswalk. |
| Re-derivación determinista (DS-7) | Si el conjunto cambia sin razón declarada ⇒ `BLOCKED`. |
| `REF` y `SIM` separados (DS-8) | Ninguna fuente externa ni simulada entra en evaluación propia. |

> El Registry **no crea datasets**: solo permite derivarlos sin romper el histórico.

---

# 7. Fixtures de rechazo del roadmap

| Fixture | Resultado esperado |
|---|---|
| Fase iniciada sin misión explícita | `BLOCKED` (PH-1) |
| Gate cerrado solo porque "el documento existe" | `BLOCKED` (PH-2) |
| `observation_id` cambiado tras migración | `BLOCKED` (ESC / OBS-13) |
| `reg_` usado como ancla de ACP | `BLOCKED` (REG-2) |
| Búsqueda con fecha sin `timezone` | `BLOCKED` (SRCH-3) |
| Búsqueda `LIKE` sobre ID opaco | `BLOCKED` (SRCH-2/6) |
| `domain` como texto libre | `BLOCKED` (SRCH-4/5) |
| Proyección que escribe en `obs_.../` | `BLOCKED` (DS-3) |
| Proyección sin `source_version_id` | `BLOCKED` (DS-2) |
| Escala presentada como dato medido | `BLOCKED` (ESC-2) |

---

# 8. Criterios de éxito

| # | Requisito de la misión | Sección | Estado |
|---|---|---|---|
| 1 | Qué es y qué no es un Registry | Padre §1 | ✅ |
| 2 | Cuatro identificadores definidos | Padre §3 · Modelo §1..§6 | ✅ |
| 3 | Autoridad sobre `observation_id` | Padre §2 | ✅ |
| 4 | Resolución de 5 IDs | Padre §4 | ✅ |
| 5 | Trazación completa hasta KH | Padre §5 · Modelo D-R8 | ✅ |
| 6 | Historia sin borrado | Padre §6 · Modelo D-R4 | ✅ |
| 7 | Versionamiento | Padre §7 · Modelo D-R3 | ✅ |
| 8 | Cinco escenarios gobernados | Padre §8 · Modelo D-R7 | ✅ |
| 9 | Reglas de auditoría y 7 búsquedas | Padre §9 · §10 | ✅ |
| 10 | Consumo ACP y KH | Padre §11 · §12 | ✅ |
| 11 | Datasets derivados sin romper histórico | Padre §13 · §6 | ✅ |
| 12 | **30 riesgos** | §9 | ✅ |
| 13 | 100.000 / 1.000.000 / 10 años sin cambiar la raíz | §1 · §5 | ✅ |

---

# 9. Los 30 riesgos más importantes del Registry

> **Única fuente de verdad.** Severidad: 🔴 bloqueante · 🟡 alto. Cada riesgo tiene umbral y mitigación. Ninguno se resuelve con IA.

| # | Riesgo | Sev. | Umbral | Mitigación |
|---|---|---|---|---|
| **R-01** | **Autoridad duplicada**: el dispositivo genera `observation_id` por su cuenta. | 🔴 | 1 ID no emitido por el registrar | RA-2 / OBS-11: único escritor; reserva de bloques; sin generación aislada. |
| **R-02** | **Colisión de secuencia** en T0 con sincronización diferida. | 🟡 | 2 reservas solapadas | RA-2: bloques reservados y reconciliados; colisión ⇒ `BLOCKED`, nunca renombrado. |
| **R-03** | **Parseo de ID opaco** por un consumidor. | 🔴 | 1 consulta que descompone el ID | OBS-10 / SRCH-2/6: coincidencia exacta; ningún `LIKE` ni extracción de fecha. |
| **R-04** | **Reutilización, renombrado o fusión** de una raíz. | 🔴 | 1 `observation_id` repetido o alterado | OB-3 / RA-5: inmutable; la fusión se expresa con `obsrel_`, nunca con EDICIÓN de la raíz. |
| **R-05** | **Borrado físico de la historia**. | 🔴 | 1 entrada `obshist_` ausente | OH-1 / PRES-1: append-only; el error se corrige con otra entrada. |
| **R-06** | **Reescritura in-place** de una versión. | 🔴 | 1 `obsver_` con huella cambiada | OV-1 / VER-1: versión nueva con `supersedes`; huella rota ⇒ `BLOCKED`. |
| **R-07** | **Asset desaparecido tratado como si nunca existiera**. | 🔴 | 1 huella referenciada sin entrada `ASSET_MISSING` | Escenario 2 / OH-1: entrada y versión nuevas; `NO_DATA`, jamás silencio. |
| **R-08** | **Ciclos en `supersedes`**. | 🔴 | 1 arista que apunta a un sucesor | OR-3 / D-R3-1: validación de precedencia; ciclo ⇒ `BLOCKED`. |
| **R-09** | **Correlación por timestamp** en lugar de `event_id`. | 🔴 | 1 relación sin `event_id` declarado | OR-1/2 / TEL-11: `SAME_EVENT_AS` exige evento existente. |
| **R-10** | **Evento retirado y borrado**. | 🔴 | 1 `event_id` sin entrada `EVENT_RETIRED` | EV-5 / Escenario 5: `SUPERSEDED_BY`; el ID sigue resoluble. |
| **R-11** | **`report_id` sin ancla** de observación. | 🔴 | 1 reporte sin `observation_id` | ACP-1 / LLM-1 / ACR-6: se descarta; `BLOCKED`. |
| **R-12** | **ACP escribe** en Registry, Ledger o KH. | 🔴 | 1 escritura desde el ACP | ACP-3 / ACR-6: el ACP solo produce `report_id`. |
| **R-13** | **Doble escritura** de `docsByObservation`. | 🔴 | 2 índices con la misma relación | KH-1 / MP-8 / KHR-1: derivado por lectura, fuente única. |
| **R-14** | **`doc_id` copiado** en lugar de referenciado. | 🔴 | 1 documento con bytes del paquete | KH-3 / AS-3 / KHR-2: referencia al registry documental. |
| **R-15** | **Búsqueda fuzzy o inferida**. | 🔴 | 1 consulta con `LIKE`, prefijo o similitud | SRCH-2/5: exactitud y facets declarados; sin inferencia desde `class_id`. |
| **R-16** | **Fechas sin zona horaria** en búsqueda o historia. | 🟡 | 1 `captured_at` o `at` sin `timezone` | SRCH-3 / AUD-1: rango con zona; sin zona ⇒ `BLOCKED`. |
| **R-17** | **`domain` ambiguo** entre modalidad, dominio telemétrico, escena y categoría KH. | 🟡 | 1 consulta con `domain` libre | SRCH-4: subfacets explícitos; nunca texto libre. |
| **R-18** | **Escalada de estado** por curación o versión. | 🔴 | 1 versión con estado mejor que su ancla | MG-5 / VER-6 / D-R6-2: degradación conservadora, nunca mejora. |
| **R-19** | **Confianza inflada** al agregar observaciones. | 🔴 | 1 agregado con confianza superior al `MIN` | ACP-4 / ACR-4: `MIN` de anclas × cobertura × penalidad. |
| **R-20** | **`REF` mezclado con `REAL`** en una proyección. | 🔴 | 1 fila T2 en split propio | TG-10 / DS-8: separación física de estados y fuentes. |
| **R-21** | **`NO_DATA` rellenado** o interpretado como cero. | 🔴 | 1 imputación o `value=0` como ausencia | Padre telemétrico §4 / ACR-5: estado gobernado, sin inferencia. |
| **R-22** | **Huella no verificada** en una versión o entrada. | 🔴 | 1 `manifest_sha256`/`entry_sha256` ausente o distinto | OV-1 / AUD-2: `BLOCKED`; encadenamiento de historia. |
| **R-23** | **Migración con foreign keys físicas** que rompen IDs. | 🔴 | 1 ID reasignado al migrar | OBS-13 / VER-5 / PRES-4: manifiestos y versiones hermanas, sin claves físicas. |
| **R-24** | **Obsolescencia de formatos** a 10 años. | 🟡 | 1 formato propietario sin salida abierta | MP-13 / D-R6: formatos abiertos, exportación trazable (`EXPORTED`). |
| **R-25** | **Privacidad de `posicion`** y personas sin consentimiento. | 🔴 | 1 paquete o búsqueda con coordenadas exactas | POS-2/3 / P3-3 / SRCH-9: redacción y `PARTIAL`. |
| **R-26** | **Consentimiento no verificable** en consultas al KH. | 🔴 | 1 vínculo doc ↔ observación sin consent declarado | ACP-6 / KHR-6: bloque omitido, veredicto `PARTIAL`. |
| **R-27** | **Auditoría sin actor ni razón**. | 🔴 | 1 entrada sin `actor_id` o `reason` | AUD-1 / D-R4: `BLOCKED`; separación registrar ≠ auditor (AUD-3). |
| **R-28** | **Concurrencia de roles** (un mismo actor registrar, curar y auditar). | 🟡 | 1 actor con tres roles en la misma observación | AUD-3: separación de funciones y doble revisión. |
| **R-29** | **Escala sin índices declarados**: 100.000 / 1.000.000 incontrolables. | 🟡 | 1 búsqueda sin campo indexado declarado | §1 / PH-2: índices lógicos por ID, sesión, lugar, estado; evidencia antes del gate. |
| **R-30** | **Scope creep**: convertir el Registry en base de datos, API o UI. | 🔴 | 1 schema SQL, endpoint o pantalla creado en nombre del Registry | Padre §0 y §1: gobernanza declarativa; toda implementación requiere misión propia. |

## 9.1 Distribución de severidad

| Severidad | Cantidad | IDs |
|---|---:|---|
| 🔴 Bloqueante | 24 | R-01, R-03..R-15, R-18..R-23, R-25..R-27, R-30 |
| 🟡 Alto | 6 | R-02, R-16, R-17, R-24, R-28, R-29 |
| 🟢 Moderado | 0 | — |

> Conteo verificable: 24 + 6 = 30. La fila 🟢 se mantiene en 0 para declarar que no hay riesgos menores ignorables.

---

# 10. Cierre

El roadmap lleva el Registry de la gobernanza a la preservación a 10 años en ocho fases, con ocho gates y 30 riesgos focalizados. La escala a 100.000 observaciones y 1.000.000 de assets se resuelve con las mismas reglas que hoy: identificadores opacos, autoridad única, historia append-only y relaciones declaradas. **Ninguna fase cambia `observation_id`.**

**Criterio de éxito:** autoridad única capaz de gobernar esa escala y ese horizonte sin modificar la raíz. Se satisface **en el plano contractual**; su verificación operativa queda para F6/F7 bajo misión explícita.

**Estado honesto:** **`DISENO`**, 0/8 gates, 0 instancias, 0 base de datos, 0 API, 0 UI, 0 IA. Sin modificar la Platform, el Masterplan ni las gobernanzas de audio, visión y telemetría. Sin commit, push, merge ni tag.

---

*Fin del roadmap del Registry. Complementa —nunca sustituye— la gobernanza del Registro de Observaciones V1, el modelo de entidades del Registry, la Observation Platform V1 y el Masterplan V1.*
