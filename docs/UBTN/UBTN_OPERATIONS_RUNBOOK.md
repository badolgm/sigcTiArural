# 🧰 UBTN — Operational Runbook

## Universal Biological Telemetry Node — Procedimientos para operar el sistema en producción (sense del día a día)

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 (diseño — sin implementación) |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔷 Diseño — playbooks del día a día, alineados con `UBTN_RISK_ANALYSIS.md` |

> **Metodología:** cada run lo numeramos `001`… con Objetivo/Checks/Pasos/Resultado. El sistema está en estado 🔷 diseño, por lo que estos playbooks se ejecutan cuando U2+ despega (prototipo/mvp).

---

## 1. Operaciones Rutinarias

### OPR-001 — Alta de un nuevo collar (provisioning QR)
1. [ ] Verificar el QR/imprimir etiqueta del `BiologicalNode` en `API /bio/v4/node/{id}`.
2. [ ] Ejecutar `VincularNodo {device_id, subject_id}` (admin UI).
3. [ ] Firmware recibe `ubtn/cmd/{id}` (provision) → status pasa a `online` con metadata.
4. [ ] Verificar LWT `status=online` retained + `battery_percent` en el panel.
**Resultado:** nodo registrado + vinculado; alerta de seguimiento si `status` no cambia en 60 s.

### OPR-002 — Baja de un animal (desvinculación)
1. [ ] `DesvincularNodo`; status del nodo → `maintenance`.
2. [ ] Dar de baja `AnimalSubject` (`active=false`) desde UI.
3. [ ] Confirmar que ya no se escriban filas en `subset_reading` para ese sujeto (log de stop).
4. [ ] Actualizar las alertas históricas → `baja` (no nuevas alertas).
**Resultado:** sin datos productivos nuevos; históricos accesibles por regulación (ADR-16).

### OPR-003 — Reemplazo de batería de nodo
1. [ ] Aviso de alerta "battery low" (umbral defensa `<20%`).
2. [ ] Enviar a `maintenance` (evita alertas fantasmas).
3. [ ] Cambiar LiPo; re-provisioning NO requerido (mismo NodeId) — solo `last_seen` se actualiza.
4. [ ] `online` + comprobar `battery_percent` > 80%.
**Resultado:** nodo re-servicio sin re-vincular.

---

## 2. Incidentes

| ID | Severidad | Síntoma | Runbook |
|---|---|---|---|
| INC-001 | alta | nodo offline > umbral | RR-001 |
| INC-002 | media | métricas carenciales (flat_line) | RR-002 |
| INC-003 | alta | broker MQTT caído | RR-003 |
| INC-004 | media | API/backend lento | RR-004 |
| INC-005 | baja | gaps de series (red) | RR-005 |

### RR-001 — Nodo offline (perdió conectividad)
1. [ ] Verificar `status` del nodo (debería pasar a `offline` por LWT).
2. [ ] Chequear Wi-Fi/LoRa del nodo (RSSI en `status` o test local).
3. [ ] Si es LoRa, probar alcance; si Wi-Fi, verificar AP.
4. [ ] Encender/colocar de nuevo; esperar LWT `online`.
5. [ ] Verificar que el buffer del bridge drenó (sin gap o gap menor al cuota).
**Resultado:** servicio restaurado; gap auditado (read-model de gaps).

### RR-002 — flat_line / señal degradada en canal
1. [ ] Consultar canal sospechoso (QualityPolicy → `flat_line` flag).
2. [ ] Revisar contacto piel/sensor y estado del collar (mordida, suciedad).
3. [ ] Si es V1 demo: revisar colocación en test de laboratorio.
4. [ ] Recalibrar/colocar de nuevo; esperar canal con valores variados.
**Resultado:** señal restaurada o nodo pasado a maintenance si hardware.

### RR-003 — Broker MQTT caído
1. [ ] Confirmar estado del servicio (`systemctl status mosquitto` en BBB).
2. [ ] Restaurar desde backup de config (Mosquitto es stateless: solo conf).
3. [ ] Levantar; el bridge se reconecta solo (clean_session=false persistente).
4. [ ] Verificar absorción de buffer (offline-first) con backoff.
**Resultado:** sin pérdida durable (QoS1 + buffer); métricas `$SYS` ok.

### RR-004 — API lenta
1. [ ] Monitorear queries p95 (persistencia §8 de `UBTN_DATABASE_EVOLUTION.md`).
2. [ ] Si `subset_reading` crece: particionar por mes desde U2.
3. [ ] Si sigue: revisar read-model de alertas (cache) y conexión a bucket.
4. [ ] Apertura de puerta C (timeseries) solo con ADR-18 + umbral >10 M filas.
**Resultado:** latencias reintroducidas en objetivo o evidencia para abrir C.

### RR-005 — Gaps de series por red
1. [ ] Ver ACKs/history del bridge; identificar huecos de firma.
2. [ ] Si es por cobertura, aceptar gap ≤ cuota de política (no accionar).
3. [ ] Si > cuota: revisar LWT offline o mantener respaldo LoRa.
**Resultado:** gap clasificado (tolerable/no) y accionado.

---

## 3. Políticas Runbook Mínimas (lo que el operador NO puede olvidar)

| Política | Valor |
|---|---|
| Umbral batería low (alerta) | `< 20%` |
| Umbral temerario (mantenimiento) | `< 5%` |
| Ventana sostenimiento de alerta | config por especie (ej. bovino > 3 min) |
| Retención de burst por defecto | 90 días (ADR-16) |
| Gap de series tolerado sin accionar | ≤ 5 min constante / 30 min ocasional |
| CPU de broker en saturación | > 80% por > 10 min → RR-003/RR-004 |

> Cuidado: estas políticas **son operativas en U2+**; hoy son referencia documental (no alteran datos).

---

## 4. Referencias

- [`UBTN_RISK_ANALYSIS.md`](UBTN_RISK_ANALYSIS.md) — umbrales de detención por fase.
- [`UBTN_MQTT_ARCHITECTURE.md`](UBTN_MQTT_ARCHITECTURE.md) — broker/bridge/LWT.
- [`UBTN_DATABASE_EVOLUTION.md`](UBTN_DATABASE_EVOLUTION.md) — particionado y monitoreo.
- [`UBTN_SECURITY_MODEL.md`](UBTN_SECURITY_MODEL.md) — revocación y authN de nodos.
- [`UBTN_FIELD_DEPLOYMENT_GUIDE.md`](UBTN_FIELD_DEPLOYMENT_GUIDE.md) — escenarios de despliegue.

---

*Operational Runbook — diseño documental. Ejecutable cuando la fase U2+ tiene sistema vivo; hoy es contrato de operación.*