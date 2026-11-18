# 📦 UBTN — Contratos de Datos (JSON)

## Universal Biological Telemetry Node — Esquemas de Diseño (NO implementar)

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 (contratos de diseño — sin implementación) |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔷 Diseño — los esquemas son propuesta; no se crean endpoints, tablas ni migraciones |
| **Envelope** | `context` + `contract_version` + `source_mode` + `items` (estilo telemetry V3) |

---

## 1. Propósito y Reglas

Define los contratos JSON que el ecosistema UBTN intercambiará entre **firmware → gateway → cloud** y entre **contextos** (EventBus). Los objetivos:

1. **Versionado explícito** (`contract_version`) para evolución sin romper consumidores (RSK-TEC-02).
2. **Idempotencia** por `reading_signature` para el flujo store-and-forward (ADR-UBTN-10).
3. **Envelope común** de estilo V3 para coherencia operativa del ecosistema (ADR-UBTN-11).
4. **Canales abiertos** en `metrics` (ADR-UBTN-07/09): nuevos sensores sin cambiar contrato base.

> ⛔ **NO IMPLEMENTAR.** Estos contratos se materializan en Fase U2 (API) y U4 (bridge/firmware) según el roadmap.

---

## 2. Envelope General (V4 URBTN)

```json
{
  "context": "bio",
  "contract_version": "4.0",
  "source_mode": "simulated | edge | device",
  "items": [ { "tipo de ítem según contrato" } ]
}
```

| Campo | Descripción |
|---|---|
| `context` | `"bio"` — contexto de origen (coherente con `source_context="bio"` del EventBus) |
| `contract_version` | versión semántica del esquema de ítems |
| `source_mode` | `simulated` (tests/demo), `edge` (reenviado por gateway), `device` (ingreso directo) |
| `items` | lista de ítems del contrato específico (lectura, ráfaga, status, alerta, comando) |

---

## 3. Contrato `reading` — Lectura biométrica periódica

**Tópico MQTT de origen:** `ubtn/{device}/reading` (QoS 1).

```json
{
  "context": "bio",
  "contract_version": "4.0",
  "source_mode": "edge",
  "items": [
    {
      "kind": "reading",
      "schema": "reading_v1",
      "device_id": "ubtn-esp32s3-0001",
      "subject_id": "bov-0421",
      "captured_at": "2026-09-13T14:22:00.000Z",
      "reading_signature": "sha256:6f4b…",
      "placement": "NECK",
      "quality": "good | poor",
      "metrics": {
        "BODY_TEMP": { "value": 38.6, "unit": "C", "flags": ["out_of_range"] },
        "HEART_RATE": { "value": 62, "unit": "bpm", "flags": [] },
        "ACTIVITY_SCORE": { "value": 45, "unit": "idx", "flags": [] }
      }
    }
  ]
}
```

**Reglas de diseño:**
- `metrics` es mapa `channel → metric` (ADR-UBTN-07); cada métrica con `value`, `unit` y `flags`.
- `reading_signature` = hash determinístico de `(device_id, captured_at, metrics)` — clave de deduplicación (ADR-UBTN-10).
- `flags` informativo: `out_of_range`, `low_quality`, `flat_line`, `noise`.
- Fecha en ISO-8601 UTC; nunca local sin zona.

---

## 4. Contrato `burst` — Ráfaga de alta frecuencia (ECG / PPG / IMU)

**Tópico MQTT de origen:** `ubtn/{device}/burst` (QoS 1).

```json
{
  "context": "bio",
  "contract_version": "4.0",
  "source_mode": "edge",
  "items": [
    {
      "kind": "burst",
      "schema": "burst_v1",
      "device_id": "ubtn-esp32s3-0001",
      "subject_id": "bov-0421",
      "captured_at": "2026-09-13T14:22:00.000Z",
      "reading_signature": "sha256:…",
      "channel": "ECG_RAW",
      "sample_rate_hz": 500,
      "duration_s": 30,
      "n_samples": 15000,
      "samples_uri": "s3://…/burst/…",
      "downsampled_meta": { "rr_interval_ms_avg": 960, "hr_estim": 62 }
    }
  ]
}
```

**Reglas de diseño:**
- El almacenamiento de muestras crudas se delega a un bucket/alamacén de objetos (`samples_uri`); el registro lleva metadatos para analítica.
- El payload MQTT del burst **no** transporta las 15 mil muestras por tópico: transporta metadatos y una referencia de objeto (ADR-UBTN-09).
- `downsampled_meta` da un cálculo inmediato (HR medio, RR) para alertas sin esperar el objeto.

---

## 5. Contrato `status` — Estado del nodo

**Tópico MQTT de origen:** `ubtn/{node_id}/status` (QoS 1 — **retained**; el último estado lo retiene el broker y el LWT del firmware lo alimenta).

> Reconciliación A-2: `status` pasa a ser `retained`, QoS 1. Anteriormente se declaró "QoS 0 — no persistente", lo que impedía que el LWT y el read-model de estado coincidieran. Ver `UBTN_MQTT_ARCHITECTURE.md` §3-4.

```json
{
  "context": "bio",
  "contract_version": "4.0",
  "source_mode": "device",
  "items": [
    {
      "kind": "status",
      "schema": "status_v1",
      "device_id": "ubtn-esp32s3-0001",
      "reported_at": "2026-09-13T14:20:00.000Z",
      "state": "online | offline | maintenance | provisioning | lost",
      "battery_percent": 84,
      "firmware_version": "0.1.0",
      "signal_quality": { "rssi_dbm": -62, "snr_db": 18 }
    }
  ]
}
```

---

## 6. Contrato `alert` — Alerta fisiológica / de nodo

**Dirección:** cloud/gateway → operario (notificación), y opcionalmente evento EventBus `physiological_alert`.

```json
{
  "context": "bio",
  "contract_version": "4.0",
  "source_mode": "edge",
  "items": [
    {
      "kind": "alert",
      "schema": "alert_v1",
      "alert_id": "alr-00087",
      "severity": "orange",
      "channel": "BODY_TEMP",
      "subject_id": "bov-0421",
      "device_id": "ubtn-esp32s3-0001",
      "value": 40.1,
      "threshold": 39.8,
      "sustained_min": 25,
      "raised_at": "2026-09-13T15:00:00.000Z",
      "message": "Fiebre: T° sostenida arriba del umbral BOVINE"
    }
  ]
}
```

---

## 7. Contrato de Enlace (Provisioning) — `link`

**Uso interno (comando `VincularNodoCommand`); no va por tópico principal.**

```json
{
  "context": "bio",
  "contract_version": "4.0",
  "source_mode": "device",
  "items": [
    {
      "kind": "link",
      "schema": "link_v1",
      "device_id": "ubtn-esp32s3-0001",
      "subject_id": "bov-0421",
      "form_factor": "COLLAR",
      "placement": "NECK",
      "linked_at": "2026-09-13T12:00:00.000Z"
    }
  ]
}
```

---

## 8. EventBus — Señales del Subdominio (contrato de eventos)

> Estos `signal_type` se publican desde el subdominio `bio` usando el `EventBusPort` neutral existente. **El flujo `sensor_reading` (Telemetría→Labs) queda intacto** (ADR-UBTN-03).

| `signal_type` | `source_context` | Payload clave |
|---|---|---|
| `biological_reading` | `bio` | `{ subject_id, device_id, timestamp, metrics (resumen) }` |
| `physiological_alert` | `bio` | `{ alert_id, channel, severity, subject_id, value, threshold }` |
| `node_status` | `bio` | `{ device_id, state, battery_percent }` |

---

## 9. Consumidores previstos y versionado

| Contrato | Consumidores | Estrategia de versionado |
|---|---|---|
| `reading` | `MqttBiologicalIngestionAdapter` → `RegistrarLecturaBiologicaCommand` | `reading_v1`; agregar campos sin romper; `contract_version` de envelope |
| `burst` | adaptador de ráfaga → `RegistrarRafagaBiologicaCommand` | `burst_v1` |
| `status` | monitoreo de nodos → `BiologicalNodeRepositoryPort.update_status` | `status_v1` |
| `alert` | `OnBiologicalReadingHandler`/`PhysiologicalThresholdService` → `BioAlertPort` | `alert_v1` |
| `link` | comando de provisioning | `link_v1` |

---

## 10. Decisiones Registradas (ADR)

| ID | Decisión | Alternativa rechazada | Justificación |
|---|---|---|---|
| ADR-UBTN-09 | `metrics` JSONB + `burst` en contrato/almacén aparte | muestras crudas en filas de lectura periódica | Rendimiento de serie periódica y descarga de ráfaga sin migrar esquema (RSK-TEC-03) |
| ADR-UBTN-10 | Deduplicación por `(device_id, captured_at, reading_signature)` | confiar en "al menos una vez" de QoS 1 | Protege el flujo store-and-forward (RSK-CON-03) |
| ADR-UBTN-11 | Envelope V4 con `context`/`contract_version`/`source_mode`/`items` | estilo API propio sin precedente | Coherencia operativa V1-V4 del ecosistema |

---

## 11. Referencias

- [`UBTN_ARCHITECTURE.md`](UBTN_ARCHITECTURE.md) §3.8 (comando + señal) y §4.4 (tópicos).
- [`UBTN_DOMAIN_MODEL.md`](UBTN_DOMAIN_MODEL.md) — origen de canales y métricas.
- [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) §3-4 (enlace y buffer).
- [`UBTN_BBB_EDGE_GATEWAY.md`](UBTN_BBB_EDGE_GATEWAY.md) §4 (tópicos) y §6 (criterios).

---

*Contratos de diseño — sin implementación. Los esquemas se materializan en Fases U2/U4 conforme al roadmap.*