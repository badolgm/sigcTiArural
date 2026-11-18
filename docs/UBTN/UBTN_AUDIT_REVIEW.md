# 🧪 UBTN — Informe de Auditoría Crítica de la Familia Documental

## Universal Biological Telemetry Node — Revisión independiente (no complaciente) del estado de diseño

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔴 Hallazgos → llamado a reconciliación (Ver §5, "Reconciliación") |
| **Alcance** | 25 documentos UBTN + 1 índice (ver §2). Código: 0 líneas chequeadas (política de no-regresión). |

> **Mandato del auditor:** crítica real, no complaciente. Este informe NO endulza el estado: la familia está **fuerte en cobertura e intención** pero tiene **3 hallazgos altos**, **3 medios** y **varios bajos** que deben resolverse o quedar explícitos como deuda aceptada.

---

## 1. Metodología

1. Inventario completo de la familia (13 docs iniciales + 12 nuevos + índice).
2. Criterios: coherencia de vocabulario, referencias cruzadas reales (sección citada existe), no contradicción entre decisiones, alineamiento ADR ↔ documento, verificación de "promesas prematuras" (P2), tipografía/errores de redacción.
3. Verificación técnica cruzada: nombre de entidades/VOs, QoS/RETAIN declarado, set de sensores vs canales del MVP, escalado de broker, dependencias exteriores (RBAC/FacilityId).
4. Severidad: 🔴 alta (rompe coherencia de diseño) · 🟠 media (riesgo de mala implementación) · 🟡 baja (redacción/referencia).

---

## 2. Inventario Auditado (25 + índice)

| # | Documento | Rol en la familia |
|---|---|---|
| 1 | `UBTN_INDEX.md` | índice + árbol + trazabilidad |
| 2 | `UBTN_ARCHITECTURE.md` | arquitectura base + no-regresión + ADR 01–06 |
| 3 | `UBTN_ADR_INDEX.md` | registro de decisiones 01–16 |
| 4 | `UBTN_DOMAIN_MODEL.md` | DDD táctico |
| 5 | `UBTN_USE_CASES.md` | casos por especie |
| 6 | `UBTN_SENSOR_CATALOG.md` | hardware/radios |
| 7 | `UBTN_DATA_CONTRACTS.md` | contratos JSON |
| 8 | `UBTN_EDGE_AI_STRATEGY.md` | edge/MQTT/buffer/TinyML/IA |
| 9 | `UBTN_BBB_EDGE_GATEWAY.md` | gateway BBB-01 |
| 10 | `UBTN_RISK_ANALYSIS.md` | riesgos RSK-* |
| 11 | `UBTN_LAB_INTEGRATION.md` | labs/STEM |
| 12 | `UBTN_RESEARCH_BACKLOG.md` | backlog RI-* |
| 13 | `UBTN_ROADMAP.md` | fases U0–U7 |
| 14 | `UBTN_CONTEXT_MAP.md` | mapa de contextos DDD |
| 15 | `UBTN_AGGREGATE_DESIGN.md` | agregados/consistencia |
| 16 | `UBTN_EVENT_STORMING.md` | hot-spots/provisioning/umbral |
| 17 | `UBTN_TELEMETRY_EVOLUTION_STRATEGY.md` | ADR-17, dual-track |
| 18 | `UBTN_MQTT_ARCHITECTURE.md` | broker/tópicos/LWT/QoS |
| 19 | `UBTN_DATABASE_EVOLUTION.md` | ADR-18 persistencia |
| 20 | `UBTN_HARDWARE_ROADMAP.md` | variantes V1–V4 |
| 21 | `UBTN_FRONTEND_UX_STRATEGY.md` | ADR-20, UI/UX |
| 22 | `UBTN_SECURITY_MODEL.md` | ADR-19 seguridad |
| 23 | `UBTN_OPERATIONS_RUNBOOK.md` | operación día a día |
| 24 | `UBTN_FIELD_DEPLOYMENT_GUIDE.md` | escenarios de campo |
| 25 | `UBTN_RESEARCH_GAPS.md` | gaps físicos/biológicos |

**Total:** 26 con este informe. Doc auditado: `UBTN_DEPLOYMENT_GUIDE`… (ver §6 nota de nombre).

---

## 3. Hallazgos

| ID | S | Hallazgo | Evidencia | Acción |
|---|---|---|---|---|
| **A-1** | 🔴 | **Drift de nombres: `CollarDevice` vs `BiologicalNode`** | ADR-08 renombró `CollarDevice`→`BiologicalNode` (DOMAIN_MODEL §3.3), pero ARCHITECTURE §3.5.3, §4.4.5 (CollarDevice), ROADMAP §5.1/§5.4, BBB §Identidad, ADR_INDEX ADR-02 y vinculación de invariantes todavía citan `CollarDevice` como si existiera hoy | Renombrar en todos (conservando nota histórica "antes CollarDevice") |
| **A-2** | 🔴 | **Contradicción de QoS/RETAIN en tópico `status`** | BBB §4: `status` QoS 0 "no persistente"; EDGE_AI §3.2: QoS 0 "no persistente" + nota en la misma §3.2 "status con RETAIN" (contradicción interna); DATA_CONTRACTS §5: "QoS 0 — no persistente". El diseño nuevo (MQTT_ARCHITECTURE §4/§3) define QoS 1 + retained y usa LWT como fuente de estado; la versión anterior es incoherente y no sirve al LWT | Alinear BBB, EDGE_AI, DATA_CONTRACTS a QoS 1 + retained (re-decisión documentada en MQTT_ARCHITECTURE §4) |
| **A-3** | 🟠 | **Referencias de sección erróneas en ADR_INDEX** | ADR-08 "detalle DOMAIN §7" → la decisión real está en §8 (forma factor) y §10 (ADR); ADR-12 "fuente SENSOR §6" → el contenido de transporte está en SENSOR §4/§7; ADR-02 cita el puerto `CollarDeviceRepositoryPort` (debe ser `BiologicalNodeRepositoryPort`) | Corregir referencias y nombre de puerto |
| **A-4** | 🟠 | **Contrato `alert` duplicado y tópico inconsistente** | DATA_CONTRACTS §6 define `alert` (vía `physiological_alert` + notificación); EDGE_AI §3.2 y BBB §4 citan `ubtn/alert` global; el diseño nuevo (MQTT_ARCH £3, EVENT_STORMING §3.5) usa `ubtn/{node}/alert` + read-model API. Tres lugares sin consenso de tópico | Estandarizar `ubtn/{node_id}/alert` (mirror) y notar que la fuente de verdad son los eventos `physiological_alert`, el rastro API en read-model |
| **A-5** | 🟠 | **Promesas P2 referenciadas como si fueran cercanas** | TinyML (ADR-14) y timeseries (ADR-18.puerta C) aparecen en ROADMAP/DOMAIN como "evolución", pero dependen de gaps físicos (P3 consumo, P4 LoRa) sin validar según RESEARCH_GAPS. El presupuesto no separa "línea base" de "expansión" | ROADMAP y EDGE_AI ya aclaran que son futuro gated; añadir nota explícita en ROADMAP §8 y DOMAIN §10 de que ADR-14 solo madura con RI cerrados |
| **A-6** | 🟠 | **Dos deudas de diseño no resueltas explícitas** | (1) Broker único = SPOF (RSK). (2) RBAC finito depende de `FacilityId` de un contexto Identity que aún no existe (SECURITY_MODEL §6, GOBERNANZA); mientras tanto FacilityId es local | Aceptado en RUNBOOK RR-003 y SECURITY_MODEL §6 con nota de "deuda abierta hasta Identity" |
| **A-7** | 🟠 | **Set de sensores (ADR-13) no cubre el "MVP temperatura" (ADR-05)** | ADR-05 recomienda validar "temperatura corporal" en MVP; el set base ADR-13 es `ADS1292R+MAX30102+MPU6050`, sin termistor/NTC en ese set. El mapa de canal (SENSOR §6) muestra `BODY_TEMP` solo vía "NTC/sensor temp" que NO está en ADR-13 | Decidir: (a) añadir NTC/DS18B20 al set MVP, o (b) redefinir MVP a RT (HR/RR/ECG) cubierto por el set actual. Requiere ADR |
| **A-8** | 🟡 | **Tipografía/redacción en docs nuevos** | `UBTN_MQTT_ARCHITECTURE §4` "(retained, pun% update)"; `UBTN_OPERATIONS_RUNBOOK §2` "bridge reconéctase"; `UBTN_DATABASE_EVOLUTION §9` self-reference sin nombre de archivo; otras | Limpiar en reconciliación |

---

## 4. Lectura Crítica (resumen ejecutivo no complaciente)

1. **La familia es coherente en intención; el drift de nombres (A-1) ya fue reconciliado** y el único bloqueo real para "código-ready" en U1 es **A-7** (variable del MVP): un equipo nuevo ya lee un solo árbol de clases (`BiologicalNode`) tras la reconciliación.
2. **La contradicción QoS/RETAIN (A-2) es exactamente el tipo de defecto que causa bugs de ops en campo:** si el operador cree que `status` es transitorio y el firmware lo trabaja como retained, el estado del nodo es ambigua. **Se resuelve a favor de QoS 1 + retained** (soporta LWT y la fuente de verdad del evento `NodoEstadoCambiado`).
3. **La tensión MVP (A-7) es la más molesta del plan:** ADR-05 "temperatura" se recomendó cuando el set de hardware era otro; hoy recomendaría RT (HR) que el set actual cubre con MAX30102. **Es honesto re-leer ADR-05 y cerrar la elección en U1.** (Pendiente de debate; no es decisivo para la fase de diseño, es decisivo para la implementación del prototipo.)
4. **La deuda de escalado (broker/PBK) y la dependencia de Identity (RBAC) están aceptadas pero deben permanecer visibles en el runbook y la seguridad** (como quedó), no escondidas en notas.
5. **Punto fuerte:** la nueva capa (CONTEXT_MAP, AGGREGATE, EVENT_STORMING, MQTT, DB, HARDWARE, SECURITY, UX, RUNBOOK, DEPLOY, GAPS) **fija los baselines** (QoS/RETAIN de `status`, tópico `alert`, naming `BiologicalNode`, referencias de sección) que la fase de reconciliación aplicará a los documentos previos; el árbol documental no se rompe.

---

## 5. Reconciliación (estado de acciones)

| ID | Acciones de reconciliación | Estado |
|---|---|---|
| A-1 | Renombrar `CollarDevice`→`BiologicalNode` en ARCHITECTURE/ROADMAP/BBB/ADR_INDEX | ✅ hecho — notas históricas "antes CollarDevice" conservadas |
| A-2 | Alinear status a QoS 1 + retained en BBB, EDGE_AI, DATA_CONTRACTS | ✅ hecho — baseline MQTT_ARCH §4; nota en cada doc |
| A-3 | Corregir referencias ADR_INDEX y puerto (ADR-02) | ✅ hecho — referencias de sección y `BiologicalNodeRepositoryPort` |
| A-4 | Estandarizar tópico `alert` en todos los docs | ✅ hecho — `ubtn/{node_id}/alert` (mirror); `ubtn/alert` global deprecado |
| A-5 | Añadir nota de dependencia en ROADMAP/DOMAIN | ✅ hecho — gate de gaps en DOMAIN_MODEL §10, ROADMAP y ADR_INDEX |
| A-6 | Visibilidad en RUNBOOK/SECURITY (hecho) | ✅ deuda aceptada y visibilizada (OPR-002, SECURITY §6) |
| A-7 | Decidir MVP (NTC o RT) + ADR | ⏳ deuda abierta — decisión en U1 antes de comprar hardware; nota en ADR_INDEX/ROADMAP U7/ARCHITECTURE §7 |
| A-8 | Corrección tipográfica | ✅ hecho — barrido en los 12 docs nuevos |

---

## 6. Notas y Limitaciones

- **Nomenclatura del campo:** durante la escritura de 12 nuevos docs se usó consistentemente `BiologicalNode`, `NodeId`, `FacilityId` — la familia NUEVA es coherente entre sí; los hallazgos A-1/A-2/A-4 son específicos de los docs PREVIOS (a excepción de A-8 en nuevos).
- **El nombre `UBTN_DEPLOYMENT_GUIDE`** (mencionado prematuramente) es `UBTN_FIELD_DEPLOYMENT_GUIDE.md` (corregido en inventario §2).
- Esta auditoría NO considera código (no hay); la no-regresión se mantiene en ARCH §6.

---

## 7. Referencias

- [`UBTN_INDEX.md`](UBTN_INDEX.md) — árbol y trazabilidad.
- [`UBTN_ADR_INDEX.md`](UBTN_ADR_INDEX.md) — ADR citados en A-2/A-3/A-7.
- [`UBTN_MQTT_ARCHITECTURE.md`](UBTN_MQTT_ARCHITECTURE.md) — baseline QoS/RETAIN (re-decisión).
- [`UBTN_SENSOR_CATALOG.md`](UBTN_SENSOR_CATALOG.md) §6-7 — set y canales (A-7).
- [`UBTN_OPERATIONS_RUNBOOK.md`](UBTN_OPERATIONS_RUNBOOK.md) — deuda de escalado (A-6).
- [`UBTN_SECURITY_MODEL.md`](UBTN_SECURITY_MODEL.md) §6 — deuda RBAC/Identity (A-6).

---

*Auditoría crítica de diseño — sin implementación. La familia permanece en U0; los hallazgos altos A-1/A-2 están reconciliados y **A-7 queda como deuda abierta** que debe resolverse (decisión de MVP) antes de la compra de hardware del prototipo en U5/U7.*