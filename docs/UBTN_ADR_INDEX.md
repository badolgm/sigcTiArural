# 📑 UBTN — Índice de Decisiones Arquitectónicas (ADR)

## Universal Biological Telemetry Node — Registro Central de ADRs

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 (registro de diseño — sin implementación) |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔷 Registro activo (Fase U0, diseño) — sin código nuevo |
| **Alcance** | Todas las decisiones de arquitectura, datos, hardware, edge e integración del UBTN |

---

## 1. Propósito y Gobernanza del Registro

Este documento es el **registro central (índice)** de las Decisiones Arquitectónicas (ADRs) del UBTN. Su función es triple:

1. **Inventario único y trazable** de toda decisión de diseño UBTN, con estado y documento de origen.
2. **Puerta de control del gate U0:** ninguna decisión marcada como *Propuesta* se considera aprobada hasta la ratificación del gate de salida de la Fase U0 (roadmap) y el cierre de las Fases 7-8 del `PLAN_MAESTRO.md`.
3. **Prevención de regresión:** al documentar la *alternativa rechazada* de cada ADR, se evita reabrir debates ya zanjados y se protege la invariante de no-tocar `SensorReading` y el Telemetry Context.

**Reglas de mantenimiento del registro:**

- Cada ADR tiene un `ID` secuencial (`ADR-UBTN-NN`) que **no se reutiliza**.
- Un ADR que cambia de decisión se **supera** (estado `Superado por ADR-UBTN-MM`), nunca se edita retroactivamente.
- Toda ADR nueva debe aparecer primero en el documento de dominio que la motiva y después ser indexada aquí.
- Al aprobarse el diseño (gate U0), los estados `Propuesta` pasan a `Aprobada` en una única edición del registro.

### 1.1 Leyenda de estados

| Estado | Significado |
|---|---|
| 🟡 **Propuesta** | Decisión de diseño registrada en U0; pendiente del gate de aprobación. |
| ✅ **Aprobada** | Ratificada formalmente (gate U0 o posterior). A partir de aquí, obligatoria para implementación. |
| 🔁 **Superada** | Reemplazada por otra ADR. Se conserva con trazabilidad. |

---

## 2. Estado de las Decisiones

> **Nota de coherencia:** los ADR `01–06` provienen de [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §7; los ADR `07–16` de los documentos de diseño de la fase de profundización; los ADR `17–20` se registran en la fase de arquitectura profunda (MISIÓN CRÍTICA). Todos en estado `Propuesta` hasta el gate de aprobación de U0. Referencias de sección corregidas por auditoría (ver `UBTN_AUDIT_REVIEW.md` A-1/A-3).

| ID | Título corto | Estado | Fuente (decisión) | Fuente (detalle) |
|---|---|---|---|---|
| **ADR-UBTN-01** | Bounded context `bio` hermano del Telemetry Context (no fundir con `SensorReading`) | 🟡 Propuesta | [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §3.1 y §7 | §7. Tabla resumida |
| **ADR-UBTN-02** | Puertos y repositorios propios del subdominio (`BiologicalReadingRepositoryPort`, `BiologicalNodeRepositoryPort`, `BioAlertPort`) | 🟡 Propuesta | [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §3.6-3.7 y §7 | §7. Tabla resumida |
| **ADR-UBTN-03** | Nueva señal EventBus `biological_reading` (source `bio`); `sensor_reading` intacta | 🟡 Propuesta | [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §2.3, §3.8 y §7 | §7. Tabla resumida |
| **ADR-UBTN-04** | BBB-01 como Gateway UBTN (evolución, no placa nueva) | 🟡 Propuesta | [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §4.3 y §7; [`UBTN_BBB_EDGE_GATEWAY.md`](UBTN_BBB_EDGE_GATEWAY.md) §1 | §7. Tabla resumida |
| **ADR-UBTN-05** | MVP de una sola variable vital end-to-end (*variable en revisión por auditoría A-7*) | 🟡 Propuesta | [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §7; [`PLAN_MAESTRO.md`](PLAN_MAESTRO.md) §9.2 | §7. Tabla resumida |
| **ADR-UBTN-06** | Umbrales fisiológicos primero, ML/DL después | 🟡 Propuesta | [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §4.5 y §7; [`PLAN_MAESTRO.md`](PLAN_MAESTRO.md) §9.3 | §7. Tabla resumida |
| **ADR-UBTN-07** | Catálogo abierto de canales biométricos (`BiologicalMetric` dinámico por canal) | 🟡 Propuesta | [`UBTN_DOMAIN_MODEL.md`](UBTN_DOMAIN_MODEL.md) §4.3 | §10. Decisiones Registradas |
| **ADR-UBTN-08** | Forma factor del nodo según especie + renombre `CollarDevice`→`BiologicalNode` (collar / tag / bolo ruminal / nodo de colmena / boya de estanque) | 🟡 Propuesta | [`UBTN_DOMAIN_MODEL.md`](UBTN_DOMAIN_MODEL.md) §3.3 y §8; [`UBTN_USE_CASES.md`](UBTN_USE_CASES.md) §9 | §10. Decisiones Registradas |
| **ADR-UBTN-09** | `metrics` en JSONB versionado con contrato por canal; las series de alta frecuencia (`burst`) en contrato aparte | 🟡 Propuesta | [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) §3-4; [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §5.3-5.4 | §10. Decisiones Registradas |
| **ADR-UBTN-10** | Identidad y deduplicación por `(device_id, captured_at, reading_signature)` | 🟡 Propuesta | [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) §3; [`UBTN_BBB_EDGE_GATEWAY.md`](UBTN_BBB_EDGE_GATEWAY.md) §2.2 | §10. Decisiones Registradas |
| **ADR-UBTN-11** | Envelope V4 con `context`, `contract_version`, `source_mode`, `items` (mismo estilo del contrato telemetry V3) | 🟡 Propuesta | [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) §2 | §10. Decisiones Registradas |
| **ADR-UBTN-12** | MQTT 5 como protocolo base nodo↔broker con TLS/PSK; LoRaWAN como lazo opcional de reserva rural; `status` QoS 1 + RETAIN | 🟡 Propuesta | [`UBTN_SENSOR_CATALOG.md`](UBTN_SENSOR_CATALOG.md) §4 y §7; [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) §3.2 | §7. Decisiones Registradas |
| **ADR-UBTN-13** | Set biométrico base `ADS1292R + MAX30102 + MPU6050`; `MAX86150` como opción de consolidación | 🟡 Propuesta | [`UBTN_SENSOR_CATALOG.md`](UBTN_SENSOR_CATALOG.md) §7 | §7. Decisiones Registradas |
| **ADR-UBTN-14** | Edge-first: umbrales y reglas en gateway/BBB, TinyML (TFLite/MicroPython) como evolución posterior en BBB-02 (depende de gaps físicos — ver `UBTN_RESEARCH_GAPS.md`) | 🟡 Propuesta | [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) §5 | §9. Decisiones Registradas |
| **ADR-UBTN-15** | `Offline-first` con buffer *store-and-forward* local (SQLite + reintento/backoff) en la ruta edge | 🟡 Propuesta | [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) §4; [`UBTN_BBB_EDGE_GATEWAY.md`](UBTN_BBB_EDGE_GATEWAY.md) §2.2 | §9. Decisiones Registradas |
| **ADR-UBTN-16** | Gobernanza de dato biométrico: minimización, retención, consentimiento de manejo animal y pseudonimización de `AnimalSubject` | 🟡 Propuesta | [`UBTN_RISK_ANALYSIS.md`](UBTN_RISK_ANALYSIS.md) §5.1 y §7 | §7. Decisión registrada |
| **ADR-UBTN-17** | Política de evolución de telemetría: no-migración retroactiva, dual-track `bio`∥`telemetry`, respeto de contratos publicados | 🟡 Propuesta | [`UBTN_TELEMETRY_EVOLUTION_STRATEGY.md`](UBTN_TELEMETRY_EVOLUTION_STRATEGY.md) §3-6 | §9. Referencias y reglas |
| **ADR-UBTN-18** | Persistencia: línea base PG (PG jsonb en `subset_reading`) + bucket de objetos para burst; timeseries columnar solo con umbral (>10 M filas / latencia demostrada) | 🟡 Propuesta | [`UBTN_DATABASE_EVOLUTION.md`](UBTN_DATABASE_EVOLUTION.md) §2-6 | §9. Referencias |
| **ADR-UBTN-19** | Seguridad: TLS + identidad por dispositivo (HMAC por timestamp/sesión), RBAC finito, pseudonimización; PKI/CA es evolución U6, no requisito de arranque | 🟡 Propuesta | [`UBTN_SECURITY_MODEL.md`](UBTN_SECURITY_MODEL.md) §3-7 | §9. Referencias |
| **ADR-UBTN-20** | UX/frontend: consume API V4 sin estado duplicado; alertas como read-model; sin diagnóstico en la UI | 🟡 Propuesta | [`UBTN_FRONTEND_UX_STRATEGY.md`](UBTN_FRONTEND_UX_STRATEGY.md) §1-4 | §7. Referencias |

---

## 3. Trazabilidad de Decisiones por Documento

| Documento UBTN | ADRs soportados | Foco |
|---|---|---|
| `UBTN_ARCHITECTURE.md` | 01, 02, 03, 04, 05, 06 | Análisis del contexto existente, posicionamiento DDD, hardware base, MQTT, IA predictiva, no-regresión |
| `UBTN_DOMAIN_MODEL.md` | 01, 02, 03, 07, 08 | Modelado táctico DDD: agregados, VOs, eventos, agregación por especie |
| `UBTN_SENSOR_CATALOG.md` | 12, 13 | Comparativa técnica de plataformas y sensores biométricos |
| `UBTN_DATA_CONTRACTS.md` | 03, 09, 10, 11 | Contratos JSON versionados e identidad/deduplicación |
| `UBTN_EDGE_AI_STRATEGY.md` | 04, 06, 12, 14, 15 | Gateway, MQTT, resiliencia, TinyML y IA predictiva |
| `UBTN_BBB_EDGE_GATEWAY.md` | 04, 10, 15 | Nodo de borde: bridge, buffer, tópicos, seguridad |
| `UBTN_USE_CASES.md` | 05, 08, 12, 13 | Casos de uso por especie y forma factor |
| `UBTN_RISK_ANALYSIS.md` | 16 | Registro de riesgos y controles, regulatorio y de datos |
| `UBTN_LAB_INTEGRATION.md` | — (integración, sin ADR propia) | Vínculos con Robótica/Telecom/Electrónica/IA/Agricultura/STEM |
| `UBTN_RESEARCH_BACKLOG.md` | 07, 08, 12, 13 (futuras revisiones) | Backlog de investigación priorizado |
| `UBTN_CONTEXT_MAP.md` | 01, 03, 17 | Mapa de contextos y relaciones entre dominios |
| `UBTN_AGGREGATE_DESIGN.md` | 07, 10 | Límites de consistencia, raíces y eventos |
| `UBTN_EVENT_STORMING.md` | 08, 10, 15 | Hot-spots de provisioning y umbral/alerta |
| `UBTN_TELEMETRY_EVOLUTION_STRATEGY.md` | 17 | Dual-track, no-migración, naming/tópicos |
| `UBTN_MQTT_ARCHITECTURE.md` | 12 | Broker, tópicos, QoS/RETAIN, LWT, bridge |
| `UBTN_DATABASE_EVOLUTION.md` | 18 | Persistencia B/C/D y umbrales de escalado |
| `UBTN_HARDWARE_ROADMAP.md` | 13, 14 | Variantes V1–V4, costos, autonomía |
| `UBTN_FRONTEND_UX_STRATEGY.md` | 20 | UX por perfil, sin estado duplicado |
| `UBTN_SECURITY_MODEL.md` | 19, 16 | Cifrado, identidad, RBAC, privacidad |
| `UBTN_OPERATIONS_RUNBOOK.md` | 15, 16 | Playbooks OPR/RR y políticas de operación |
| `UBTN_FIELD_DEPLOYMENT_GUIDE.md` | 13, 16 | Escenarios y SOP de puesta en marcha |
| `UBTN_RESEARCH_GAPS.md` | 05, 14, 18 | Gaps físicos/biológicos y anti-patterns |
| `UBTN_AUDIT_REVIEW.md` | — (auditoría) | Hallazgos y reconciliación de la familia |

---

## 4. Detalle de Decisiones Registradas en esta Fase (Resumen Ejecutivo)

### ADR-UBTN-07 — Catálogo abierto de canales biométricos
**Decisión:** `BiologicalReading` modela su contenido como un mapa de canales (`SensorChannel → BiologicalMetric`), no como campos fijos. Cada canal declara `value`, `unit`, `physiological_range`, `sample_rate_hz`.
**Alternativa rechazada:** un esquema de columnas fijas por variable (rompe la evolución sin migración ante nuevos sensores).
**Detalle:** [`UBTN_DOMAIN_MODEL.md`](UBTN_DOMAIN_MODEL.md) §4.3 y §10.

### ADR-UBTN-08 — Forma factor por especie (+ renombre a `BiologicalNode`)
**Decisión:** el UBTN se generaliza de "collar" a "nodo universal" con form factors: collar (rumiantes/canino/felino/equino), arete/tag (ovino/caprino), bolo ruminal (bovino, futuro), nodo de colmena (apicultura) y boya/lanza de estanque (piscicultura). La entidad `CollarDevice` se renombra a `BiologicalNode` (extensión por forma factor; nombre histórico conservado).
**Alternativa rechazada:** modelar únicamente collares (excluye apicultura/piscicultura del subdominio).
**Detalle:** [`UBTN_DOMAIN_MODEL.md`](UBTN_DOMAIN_MODEL.md) §3.3, §8 y §10; [`UBTN_USE_CASES.md`](UBTN_USE_CASES.md) §9.

### ADR-UBTN-09 — JSONB + contrato de ráfaga aparte
**Decisión:** telemetría periódica en `metrics` JSONB (contrato `reading_v1`); series de alta frecuencia en contrato/canal dedicado `burst` (ECG/PPG) para no inflar la tabla periódica.
**Alternativa rechazada:** guardar muestras de alta frecuencia como filas de lectura periódica.
**Detalle:** [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) §3-4 y §10.

### ADR-UBTN-10 — Identidad deduplicable
**Decisión:** toda lectura transporta `(device_id, captured_at, reading_signature)`; el backend rechaza duplicados de forma idempotente (protege el flujo store-and-forward).
**Alternativa rechazada:** confiar en el "al menos una vez" del MQTT QoS 1 sin deduplicación.
**Detalle:** [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) §3 y §10.

### ADR-UBTN-11 — Envelope V4
**Decisión:** los endpoints bio reutilizan el envelope del estilo telemetry V3 (`context`, `contract_version`, `source_mode`, `items`) para coherencia operativa.
**Alternativa rechazada:** un estilo de API propio sin precedente en el ecosistema.
**Detalle:** [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) §2 y §10.

### ADR-UBTN-12 — MQTT 5 base + LoRaWAN de reserva (+ `status` QoS 1/RETAIN)
**Decisión:** el lazo nodo↔broker usa MQTT 5 sobre WiFi con TLS/PSK. LoRaWAN (SX1276/78) queda como lazo alternativo de bajo consumo en zonas sin WiFi/BLE y con gateway LoRa dedicado. El tópico `status` opera con QoS 1 y RETAIN para soportar LWT como fuente de estado (reconciliación `UBTN_AUDIT_REVIEW.md` A-2).
**Alternativa rechazada:** LoRaWAN como protocolo único (latencias y capacidad limitadas para ráfagas ECG; complejidad de alimentación).
**Detalle:** [`UBTN_SENSOR_CATALOG.md`](UBTN_SENSOR_CATALOG.md) §4 y §7; [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) §3.2.

### ADR-UBTN-13 — Set biométrico base
**Decisión:** núcleo de sensores: `ADS1292R` (ECG 2 canales), `MAX30102` (PPG/SpO₂), `MPU6050` (IMU 6 ejes) sobre ESP32. `MAX86150` documentado como alternativa de consolidación ECG+PPG para nodos más livianos.
**Alternativa rechazada:** consolidar todo en un único IC sin flexibilidad de canales ni respaldo de proveedor.
**Detalle:** [`UBTN_SENSOR_CATALOG.md`](UBTN_SENSOR_CATALOG.md) §7.

### ADR-UBTN-14 — Edge-first intensidad de cómputo
**Decisión:** primero umbrales/reglas evaluados en edge y cloud; TinyML (TFLite) como capa evolutiva en BBB-02, sin bloquear el MVP.
**Alternativa rechazada:** embarcar inferencia ML en el primer slice vertical.
**Dependencia:** la apertura de TinyML requiere cerrar gaps físicos P3/P4 (`UBTN_RESEARCH_GAPS.md`) — ver auditoría A-5.
**Detalle:** [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) §5 y §9.

### ADR-UBTN-15 — Offline-first
**Decisión:** la ruta edge es `offline-first`: buffer local con reenvío ordenado y retroactivo, sin pérdida bajo conectividad intermitente.
**Alternativa rechazada:** entrega síncrona tolerante a fallo (descarta lecturas sin red).
**Detalle:** [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) §4 y §9.

### ADR-UBTN-16 — Regulación de dato biométrico
**Decisión:** el dato biométrico animal se trata con minimización (solo variables necesarias), retención definida, consentimiento de manejo animal y `AnimalSubject` pseudonimizado por `external_id` local (sin datos de propietario en el campo de sujeto).
**Alternativa rechazada:** almacenar datos personales del propietario junto con la serie del sujeto.
**Detalle:** [`UBTN_RISK_ANALYSIS.md`](UBTN_RISK_ANALYSIS.md) §5.1 y §7.

### ADR-UBTN-17 — Política de evolución de telemetría (no-migración retroactiva)
**Decisión:** `BiologicalTelemetry` y `Telemetry Context` coexisten (dual-track); no-migración retroactiva de `sensor_reading`; contratos publicados inmutables (ADD not REPLACE); toda señal declara `source_context`.
**Alternativa rechazada:** fusionar dominios o migrar V1 al esquema nuevo.
**Detalle:** [`UBTN_TELEMETRY_EVOLUTION_STRATEGY.md`](UBTN_TELEMETRY_EVOLUTION_STRATEGY.md) §3-8.

### ADR-UBTN-18 — Persistencia (PG jsonb + bucket; columnar es evolución medida)
**Decisión:** línea base = `subset_reading` (PG jsonb) + bucket de objetos para `burst` (`samples_uri`). Puerta C (timeseries columnar) SOLO si >10 M filas o latencia de analítica >2 s en >60% de queries; apertura asíncrona, nunca `ALTER` masivo en caliente.
**Alternativa rechazada:** migrar a columnar desde el día 1 sin datos ni umbral.
**Detalle:** [`UBTN_DATABASE_EVOLUTION.md`](UBTN_DATABASE_EVOLUTION.md) §2-6.

### ADR-UBTN-19 — Seguridad del dato biométrico
**Decisión:** TLS 1.2+ en transporte MQTT; identidad de dispositivo por `NodeId`+secret (con token por timestamp/sesión anti-replay); RBAC finito (Productor/Veterinario/Estudiante/Admin) con dependencia de `FacilityId` (pendiente Identity); pseudonimización de `AnimalSubject`. PKI/CA es evolución U6.
**Alternativa rechazada:** MQTT plano en WAN; identidad sin revocación escalable.
**Detalle:** [`UBTN_SECURITY_MODEL.md`](UBTN_SECURITY_MODEL.md) §2-7.

### ADR-UBTN-20 — Frontend/UX de telemetría biométrica
**Decisión:** el frontend consume la API V4 (sin estado duplicado), las alertas son read-model (`GET /bio/v4/alert`), y la UI declara "alerta ≠ diagnóstico" (ADR-16).
**Alternativa rechazada:** espejo local de series o suscripción directa al bus MQTT.
**Detalle:** [`UBTN_FRONTEND_UX_STRATEGY.md`](UBTN_FRONTEND_UX_STRATEGY.md) §1-4.

---

## 5. Decálogo de Decisiones Protegidas (No-Diverge)

Estas decisiones están **protegidas** y cualquier propuesta de cambio requiere un ADR de superación explícito:

1. No modificar `SensorReading` ni sus VOs.
2. No reutilizar la señal `sensor_reading` para biometrías.
3. No extender `SensorReadingRepositoryPort`.
4. No romper la composición de `wiring.py` (solo adición de suscripciones).
5. No crear migraciones/tablas/endpoints en esta rama (solo diseño).
6. No trabajar sobre `main`.
7. No iniciar implementación (Fases U1+) sin pasar el gate U0 y sin cierre de Fases 7-8 del `PLAN_MAESTRO.md`.
8. Un solo MVP (variable vital) end-to-end antes de escalar a multivariable.
9. Umbrales fisiológicos por especie antes que modelos ML/DL.
10. El dato biométrico del animal se trata con las reglas de minimización del ADR-UBTN-16.

---

## 6. Bitácora del Registro ADR

| Fecha | Evento |
|---|---|---|
| 2026-09-13 | Registro central ADR creado en Fase U0. ADRs 01-06 re-indexados desde `UBTN_ARCHITECTURE.md` §7; ADRs 07-16 registrados desde los documentos de diseño de esta fase. Todos en estado Propuesta. Sin código nuevo. |
| 2026-09-13 | **MISIÓN CRÍTICA:** registrados ADRs 17-20 (evolución de telemetría, persistencia, seguridad, UX). Renombrado `CollarDeviceRepositoryPort`→`BiologicalNodeRepositoryPort` (ADR-02/ADR-08). Corregidas referencias de sección por auditoría (ADR-07→§4.3, ADR-08→§3.3/§8, ADR-09/10→§3-4, ADR-12→§4 del catálogo). Nota de variable MVP abierta (A-7) y dependencia de gaps para TinyML (A-5). Sin código nuevo. |

---

*Registro de diseño — sin implementación. Actualizar junto con la aprobación del gate U0.*