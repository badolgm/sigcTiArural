# 🗺️ UBTN — Roadmap de Implementación

## Universal Biological Telemetry Node — Plan Faseado

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 (plan de ejecución — sin implementar) |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔲 Planificado (0% avance) |
| **Precedencia** | Subordinado a PLAN_MAESTRO Fases 7-8; la Fase 9 define el envión productivo EIARC |

---

## 1. Principios Rectores

1. **No regresión:** ningún paso modifica `SensorReading`, `RobotTelemetry`, el `EventBusPort` ni el flujo `sensor_reading` actual.
2. **Quirúrgico e incremental:** cada fase deja evidencia operativa (tests, logs, endpoint verificado, bitácora).
3. **Un MVP a la vez:** primero una sola variable vital validada end-to-end (recomendado: **temperatura corporal**) antes de escalar a HR/SpO₂/ECG/actividad.
4. **Hardware agnóstico:** el dominio no conoce ESP32/BBB por tipo; todo entra por puertos/adaptadores.
5. **Riesgo controlado:** pruebas aisladas por fase, rollback definido por fase (según patrón TELEMETRY_CONTEXT_IMPLEMENTATION_GUIDE.md).

---

## 2. Fases

### Fase U0 — Diseño y Gobernanza (ESTA RAMA) ✅ CERRADA EN DISEÑO

| Entregable | Estado |
|---|---|---|
| Análisis arquitectónico del Telemetry Context | ✅ Hecho en [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §2 |
| Propuesta DDD `BiologicalTelemetry` | ✅ Hecho en [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §3 y [`UBTN_DOMAIN_MODEL.md`](UBTN_DOMAIN_MODEL.md) |
| Investigación hardware (ESP32/ADS1292R/MAX30102/MPU6050/MAX86150/LoRa/BLE/BBB/MQTT) | ✅ Hecho en [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §4 y [`UBTN_SENSOR_CATALOG.md`](UBTN_SENSOR_CATALOG.md) |
| Gateway edge BBB | ✅ Hecho en [`UBTN_BBB_EDGE_GATEWAY.md`](UBTN_BBB_EDGE_GATEWAY.md) |
| Registro de riesgos | ✅ [`UBTN_RISK_ANALYSIS.md`](UBTN_RISK_ANALYSIS.md) |
| Casos de uso por especie | ✅ [`UBTN_USE_CASES.md`](UBTN_USE_CASES.md) |
| Contratos de datos JSON (diseño) | ✅ [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) |
| Estrategia edge e IA predictiva | ✅ [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) |
| Integración con el ecosistema (labs/STEM) | ✅ [`UBTN_LAB_INTEGRATION.md`](UBTN_LAB_INTEGRATION.md) |
| Backlog de investigación | ✅ [`UBTN_RESEARCH_BACKLOG.md`](UBTN_RESEARCH_BACKLOG.md) |
| Índice ADR + índice general + trazabilidad | ✅ [`UBTN_ADR_INDEX.md`](UBTN_ADR_INDEX.md), [`UBTN_INDEX.md`](UBTN_INDEX.md) |
| Roadmap | ✅ Este documento |
| Actualización README / MASTERDOC / PLAN_MAESTRO / onboarding IA | ✅ Rama actual |

**Gate de salida:** aprobación conceptual de la arquitectura y del MVP de temperatura corporal.

---

### Fase U1 — Scaffolding DDD + Dominio (código, sin persistencia real)

**Objetivo:** crear el esqueleto `contexts/bio/` con dominio puro, ports y repositorio in-memory; tests unitarios de dominio. **No toca nada del telemetry existente.**

| Tarea | Criterio de aceptación |
|---|---|
| Crear árbol `contexts/bio/` (domain/application/ports/infrastructure) | Estructura espejo de `contexts/telemetry/` |
| Value objects: `AnimalSubjectId`, `SubjectSpecies`, `BiologicalNodeId`, `SensorChannel`, `BodyTemperature`, `HeartRate`, `RespiratoryRate`, `SpO2`, `RuminationIndex`, `ActivityScore`, `AccelerometrySample` | `frozen=True`, rangos fisiológicos validados, excepciones de dominio |
| Entidades: `AnimalSubject`, `BiologicalNode`, `BiologicalReading` | Invariantes en `__post_init__` |
| `BioAlertPort` + `ConsoleBioAlertAdapter` | Espejo de `ConsoleNotificationAdapter` (labs) |
| `InMemoryBiologicalReadingRepository` | Igual estrategia que su homólogo de telemetría |
| Tests de dominio (`tests/contexts/bio/test_bio.py`) | Suite verde con pytest |

**Entregable de rama sugerido:** `feat(bio): scaffold DDD para BiologicalTelemetry (Fase U1)`.

**Riesgo:** Bajo (código nuevo aislado, sin protocolos).

---

### Fase U2 — Persistencia Django + API (primer slice vertical)

**Objetivo:** persistir `BiologicalReading` en PostgreSQL (tablas `bio_*`) y exponer el contrato oficial.

| Tarea | Criterio de aceptación |
|---|---|
| Modelos Django nuevos: `AnimalSubject`, `BiologicalNode`, `BiologicalReading` (metrics JSONB) | Migración `0001` nueva; **sin alterar** modelos existentes |
| `DjangoBiologicalReadingRepository` + mapper | Replica el patrón `DjangoSensorReadingRepository`/`SensorReadingMapper` |
| `BiologicalReadingRepositoryPort` + `BiologicalNodeRepositoryPort` | Contratos abstractos en `ports/` |
| Comando `RegistrarLecturaBiologicaCommand` | Persiste + publica `LabSignal("biological_reading")` |
| Comando `VincularNodoCommand` | Asocia nodo → sujeto con unicidad |
| Query `ListarLecturasPorSujetoQuery` | Serie ordenada por `(subject_id, timestamp)` |
| Endpoint contract: `GET/POST /api/v4/bio/readings/`, `GET /api/v4/bio/subjects/{id}/` | Envelope con `context`, `contract_version`, `source_mode`, `items` (mismo estilo que V3 telemetry) |
| Tests de integración | Suite pytest verde; smoke HTTP manual |

**Entregable de rama sugerido:** `feat(bio): persistencia Django y contrato API V4 (Fase U2)`.

**Rollback:** vista pendiente de creado; retirar rutas `/api/v4/bio/*` sin afectar V1-V3.

---

### Fase U3 — EventBus: suscripción y alertas fisiológicas

**Objetivo:** conectar `biological_reading` a suscripciones nuevas en el composition root y materializar la alerta por umbral.

| Tarea | Criterio de aceptación |
|---|---|
| `OnBiologicalReadingHandler` en `contexts/bio/application` (futuro) | Traduce `LabSignal` → predicado de umbral |
| `PhysiologicalThresholdService` | Tabla de rangos por especie; bateo con `BodyTemperature` etc. |
| Extensiones en `sigct_backend/wiring.py` | `subscribe("biological_reading", handler)` **sin quitar** `sensor_reading` |
| `BioAlertPort` → alerta de consola/log (y Fase U5 a producción) | La alerta S.O.S. biológica suena con datos reales (espejo del camino de `OnSensorReadingHandler`) |
| Tests de wiring/idempotencia | Verifica que `wire_all()` es idempotente y convive con la suscripción existente |

**Entregable de rama sugerido:** `feat(bio): suscripción EventBus y alertas por umbral (Fase U3)`.

**Riesgo:** Medio-bajo. El único archivo touchado fuera de `bio` es `wiring.py` (agregando líneas).

---

### Fase U4 — Ingesta Edge/MQTT (BBB-01 como Gateway UBTN)

**Objetivo:** llevar lecturas reales del collar hasta el backend vía MQTT.

| Tarea | Criterio de aceptación |
|---|---|
| `src/embedded/ubtn/gateway/` — bridge MQTT→HTTPS sobre BBB-01 | Ver [`UBTN_BBB_EDGE_GATEWAY.md`](UBTN_BBB_EDGE_GATEWAY.md) |
| `MqttBiologicalIngestionAdapter` en `contexts/bio/infrastructure/mqtt/` | Consume `ubtn/{device}/reading`, traduce payload → `BiologicalReading`, llama al comando |
| Topicos MQTT definidos (`reading`, `burst`, `status`, `cmd`, `alert`) | Mapa publicado en [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §4.4 |
| TLS/PSK en el lazo collar↔broker | Manual de configuración de seguridad en el repo del gateway |
| Buffer *store-and-forward* local | Lecturas no se pierden con conectividad intermitente |

**Entregable de rama sugerido:** `feat(bio): ingesta MQTT edge-to-cloud (Fase U4)`.

**Nota:** el pack de `src/embedded/bbb_*/` está en 0 bytes hoy (referencia). Esta fase materializa el primer código edge real del proyecto para UBTN.

---

### Fase U5 — Firmware del Collar UBTN (ESP32)

**Objetivo:** construir el wearable con los 3 sensores y publicación MQTT.

| Tarea | Criterio de aceptación |
|---|---|
| `src/embedded/ubtn/firmware/` (Arduino/ESP-IDF) | Lectura de ADS1292R (SPI), MAX30102 (I2C), MPU6050 (I2C) |
| Pipeline de baja potencia | Deep-sleep; telemetría periódica + ráfaga ECG/PPG a demanda |
| Payload MQTT JSON estable | Contrato de tópicos conforme a §4.4 de la arquitectura |
| Calibración de la variable del MVP (T° corporal **si se decide incluir NTC/DS18B20**, o HR/RR según A-7) | Comparación con referencia clínica; tabla de offset por ubicación del nodo |

**Entregable de rama sugerido:** `feat(bio): firmware collar UBTN ESP32 (Fase U5)`.

**Riesgo:** Alto (hardware real). Mitigación: banco de pruebas en laboratorio, records de calibración.

---

### Fase U6 — IA Predictiva (detección de anomalías)

**Objetivo:** evolucionar de umbrales a modelo predictivo, respetando la gobernanza de IA V2.

| Tarea | Criterio de aceptación |
|---|---|
| Export de series limpias desde `BiologicalTelemetry` | Sin acoplar el subdominio a `ai` (CUI limpio) |
| Feature engineering (medias móviles, variabilidad, tendencias) | Documentado por especie |
| Modelo baseline de anomalías (una variable) | Benchmark contra umbrales actuales (`macro-F1`) |
| Integración vía `AIServicePort` extensible | No rompe el diagnóstico de plantas existente |
| Alerta predictiva → productor | Mecanismo de retroalimentación explicable (PLAN_MAESTRO §9.3) |

**Entregable de rama sugerido:** `feat(bio): IA predictiva para telemetría biológica (Fase U6)`.

---

### Fase U7 — MVP End-to-End y Escalado

**Objetivo:** validar la variable elegida en un animal real: nodo/collar → BBB → cloud → persistencia → dashboard → alerta.

> ⚠️ **Nota de auditoría (A-7):** ADR-05 recomendó "temperatura corporal", pero el set base ADR-13 (ADS1292R+MAX30102+MPU6050) **no incluye** sensor de temperatura (NTC/DS18B20); `BODY_TEMP` solo aparece en el mapa de canal vía termistor dedicado. **Decisión abierta antes de U1:** (a) añadir NTC/DS18B20 al set del MVP, o (b) redirigir el MVP a HR/RR/ECG cubiertos por el set actual. Ver `UBTN_AUDIT_REVIEW.md` A-7.

| Tarea | Criterio de aceptación |
|---|---|
| Demostración vertical completa | Evidencia video/log end-to-end |
| Dashboard UBTN (React) | Consume `/api/v4/bio/*`; visión por sujeto |
| Sesión de validación con datos propios | Rango fisiológico BOVINE calibrado |
| Escalado controlado de variables | HR → SpO₂ → actividad → ECG morfología |

---

## 3. Tabla Resumen

| Fase | Nombre | Código | Persistencia | EventBus | Edge | Hardware | IA |
|---|---|---|---|---|---|---|---|
| U0 | Diseño y gobernanza | ✅ (doc) | — | — | — | — | — |
| U1 | Scaffolding DDD + dominio | 🔲 | in-memory | — | — | — | — |
| U2 | Persistencia Django + API | 🔲 | PostgreSQL (`bio_*`) | publica señal | — | — | — |
| U3 | Suscripción + alertas umbral | 🔲 | — | suscriptor nuevo | — | — | reglas |
| U4 | Ingesta MQTT/BBB | 🔲 | — | — | BBB-01 bridge | — | — |
| U5 | Firmware collar ESP32 | 🔲 | — | — | — | ADS1292R/MAX30102/MPU6050 | — |
| U6 | IA predictiva | 🔲 | — | — | — | — | ML/DL |
| U7 | MVP end-to-end y escalado | 🔲 | ✅ final | ✅ | ✅ | ✅ | ✅ |

---

## 4. Riesgos y Mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Falta de datos etiquetados/rangos fisiológicos confiables por especie | Media | Alto | Investigación previa (PLAN_MAESTRO 9.2); MVP de una variable con umbrales calibrados antes de ML |
| Hardware real (batería, señales ruidosas ECG/PPG) | Media | Medio | Banco de pruebas en laboratorio, calibración, registros de señal para diagnóstico |
| Ruido/impedancia en ADS1292R con electrónica wearable | Media | Medio | Diseño de electrodos, blindaje, filtrado digital en firmware, tasa de muestreo adecuada |
| Riesgo animal (estrés por collar) | Baja | Medio | Protocolo de bienestar, pruebas de habituación, diseño ergonómico |
| Expansión de alcance prematura | Alta | Alto | Gobernanza: un MVP por variable; no iniciar sin cierre de Fases 7-8 |
| Espectro Wi-Fi rural limitado | Media | Medio | Store-and-forward edge, posibles lazos LoRaWAN futuros |

---

## 5. Dependencias Externas al Plan

- **Cierre de Fases 7-8** del PLAN_MAESTRO (regla de precedencia: no abrir nueva línea arquitectónica antes de estabilizar).
- **Gobernanza de IA V2** (`docs/ai/research_v2/SIGCT_RURAL_AI_RESEARCH_PROGRAM_V2.md`) para la línea "Animal Health AI".
- **Hardware disponible** (BBB-01 operativo, collar definitivo, sensores de prueba).
- **Datos propios** de calibración (rango fisiológico de la especie del MVP).

---

## 6. Bitácora del Roadmap

| Fecha | Evento |
|---|---|
| 2026-09-13 | Creación del roadmap UBTN en rama `feature/ubtn-biological-telemetry`. Estado: U0 cerrado en diseño; U1-U7 planificadas (0%). Sin código nuevo. |

---

*Roadmap de diseño — no se implementa en esta rama. Alineado con PLAN_MAESTRO.md Fase 9.*