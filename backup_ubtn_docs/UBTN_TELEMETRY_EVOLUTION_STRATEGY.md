# 🔄 UBTN — Estrategia de Evolución de Telemetría e Ingestion (ADR-17)

## Universal Biological Telemetry Node — Cómo convive, crece y se separa del resto del ecosistema

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 (diseño — sin implementación) |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔷 Diseño — formaliza `ADR-UBTN-17` |
| **Decisión** | Banco de reglas para **NO romper** el backplane de telemetría existente mientras `BiologicalTelemetry` evoluciona |

---

## 1. Propósito

La telemetría del ecosistema hoy vive en `Telemetry Context` (`SensorReading`, `sensor_reading`). Con UBTN llega un segundo flujo, con payload y dominio distintos, que **no debe**:

- mutar el dominio `telemetry` existente,
- compartir `SensorReading` ni el schema `sensor_reading`,
- introducir columnas "comodín" en tablas V1–V3,
- deuda irreversible de contratos (rompe estabilidad del API V4/V1).

Esta estrategia establece **cómo se ingiere, dónde se versiona y cuándo se separan** físicamente el flujo ambiental (V1) del flujo biológico (V4/UBTN), respetando ADR-UBTN-01..20.

---

## 2. Antecedentes (¿por qué existe?)

| Señal | Situación hoy (sin UBTN) |
|---|---|
| Único contexto de ingesta | `Telemetry Context` consume todo lo IoT vía EventBus |
| Schema rígido | `sensor_reading` captura una sola semántica de lectura |
| ADR-UBTN-09/10/11 | el modelo biológico NACE con VOs, firma y envelope V4 propios |

**Necesidad emergente:** mantener coherencia, no propagar FUD ("cambiar telemetry rompe todo"), y planear el día 1 sin bloquear V1.

---

## 3. Principios de Evolución (Política)

| # | Principio | Consecuencia exigible |
|---|---|---|
| P1 | **No-migración retroactiva** | nada de `sensor_reading` cambia por UBTN |
| P2 | **Separación por contexto, no por tabla ad-hoc** | UBTN es lag: responsabilidad propia; el ingreso es por adapter MQTT bio |
| P3 | **Inmutabilidad de contratos publicados** | envelope V4 estable; nuevas versiones se agregan, no se mutan campos (ADD NOT REPLACE) |
| P4 | **Convención de origen explícita** | toda señal al bus declara `source_context` (`bio`, `telemetry`, ...) |
| P5 | **Contratos versionados por semver dentro del envelope** | `contract_version` es parte del payload, no del tópico |
| P6 | **Deprecación dirigida y documentada** | NUNCA eliminar sin ADR + ventana de compatibilidad |
| P7 | **Dual-track seguro** | telemetry y bio pueden coexistir en el bus desde el día 1 sin colisión |

---

## 4. Modelo de Ingestion en Capas (vista de diseño)

```mermaid
flowchart TB
    subgraph EDGE["Edge / Wearable"]
        FW[Firmware ESP32<br/>emit /reading y /burst]
    end
    subgraph GATEWAY["BBB Gateway (broker + bridge)"]
        BR[Broker Mosquitto<br/>ubtn/# QoS 0/1 + LWT]
        BRIDGE[MQTT Bridge ubtn/ → Backend]
    end
    subgraph BACK["Backend Django + shared_kernel"]
        ADAPT[MqttBiologicalIngestionAdapter<br/>(ACL bio)]
        BUS[EventBusPort<br/>LabSignal source=bio]
        REPO[BiologicalReadingRepositoryPort]
    end
    subgraph TTY["Infra compartida existente"]
        TBUS[EventBus común (Shared Kernel infra)]
    end

    FW -->|"topic ubtn/{node}/reading JSON"| BR
    FW -->|"/burst"| BR
    BR --> BRIDGE
    BRIDGE --> ADAPT
    ADAPT --> BUS
    BUS --> TBUS
    ADAPT --> REPO
```

**Patrón clave:** el adapter de ingestión es la **única puerta** entre el borde MQTT y el dominio bio (ACL); el EventBus es compartido como infraestructura (Shared Kernel §4.6 de `UBTN_CONTEXT_MAP.md`), jamás como esquema de datos.

---

## 5. Política de Naming de Tópicos y Canales

| Elemento | Regla |
|---|---|
| Tópico de ingesta | `ubtn/{node_id}/reading`, `ubtn/{node_id}/burst`, `ubtn/{node_id}/status`, `ubtn/{node_id}/alert` |
| Tópicos de comando (del backend al nodo) | `ubtn/cmd/{node_id}` (QoS 1, RETAIN=false) |
| `source_context` en LabSignal | `bio` siempre en UBTN |
| `signal_type` | `biological_reading`, `physiological_alert`, `node_status` |
| Versionado | `"contract_version": "4.0"` en el método `items[].meta` (envelope V4) |

> No se mezclan tópicos `sensor_reading` (telemetry V1) con `ubtn/#` (bio V4). Fuente: `UBTN_DATA_CONTRACTS.md` §4 y `UBTN_MQTT_ARCHITECTURE.md`.

---

## 6. Rutas de Evolución del Dato

| Etapa | Estado | Evolución |
|---|---|---|
| U0 (hoy) | ❌ sin dato | solo diseño; nada se ingiere aún |
| U1/U2 | 🟢 prototipo | adapter de ingesta + persistence en bucket/esquema bio propio (`subset_reading`) |
| U3 | 🟢 MVP | envelope V4 activo + alertas mínimas (umbral por especie) |
| U4 | 🟡 analítica | CUI series → AI, lecturas históricas, export por ventana |
| U5 | 🔮 escala | si el volumen lo exige, `subset_reading` → timeseries columnar (ADR-18 C) |
| U6 | 🔮 gobernanza | event sourcing de ONLY-EVENTOS (auditoría), nunca reemplazo de la fuente |

**Nota de la ruta:** esta secuencia equivale al mapeo de fases U1–U6 del roadmap; cada salida exige pasar el `gate` correspondiente (riesgo detenido en `UBTN_RISK_ANALYSIS.md`).

---

## 7. Banco de Reglas para Equipos (Manifiesto de Ingestion)

1. **Si necesitas un dato de `telemetry`, úsalo como query; nunca copies su VO dentro de bio.**
2. **Si necesitas publicar un evento, hazlo con `source_context` declarado.**
3. **Si el contrato público cambia, es una VERSIÓN nueva, no una mutación de campos.**
4. **No renombres un tópico; deprecátalo con un ADR.**
5. **Nunca desacoples el edge de la fuente sin alertar al runbook** (`UBTN_OPERATIONS_RUNBOOK.md`).
6. **La deduplicación es responsabilidad del reactor** (firma `reading_signature`), no del emisor.
7. **Cada flujo nuevo se mapea a Implementación → demo → gate antes de ampliar la promesa.**
8. **En caso de duda, se consulta `UBTN_DATA_CONTRACTS.md` (fuente de verdad del contrato).**

---

## 8. Relación con el API Público (V4/V1)

| API | Postura |
|---|---|
| `sensor_reading` (V1) | no tocar; coexistirá |
| `bio/v4/reading`, `bio/v4/subject`, `bio/v4/node` | recursos **nuevos**, estilo API V4 (no camuflados en V1) |
| `bio/v4/alert` | read-model de alertas |

> Regla anti-regresión (active): verificar en el checklist `UBTN_ARCHITECTURE.md §6` que el API nuevo **no** muta, renombra ni extrapola los DTO V1.

---

## 9. Referencias

- [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §3.5 (contexto bio).
- [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) — envelope V4 y señales.
- [`UBTN_CONTEXT_MAP.md`](UBTN_CONTEXT_MAP.md) §4.6 — shared kernel infra vs modelo.
- [`UBTN_DATABASE_EVOLUTION.md`](UBTN_DATABASE_EVOLUTION.md) — rutas de persistencia (ADR-18).
- [`UBTN_ADR_INDEX.md`](UBTN_ADR_INDEX.md) — registro de decisiones (ADR-17).
- [`UBTN_ROADMAP.md`](UBTN_ROADMAP.md) — fases U1–U6.

---

*Estrategia de evolución — diseño sin implementación. Defiende la invariante "no romper telemetry", no es una licencia para fusionar dominios.*