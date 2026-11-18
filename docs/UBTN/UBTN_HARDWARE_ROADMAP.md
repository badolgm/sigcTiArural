# 🛰️ UBTN — Hardware Roadmap

## Universal Biological Telemetry Node — V1 a V4: costos, energía, forma y costo de cada variante

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 (diseño — sin implementación) |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔷 Diseño — costos referenciales y plan de ADR-13 |
| **Decisión** | 4 variantes de hardware V1–V4; la BBB Rev C es transversal (gateway/edge, no wearable) |

El catálogo sensorial está en `UBTN_SENSOR_CATALOG.md` (ADRs 12/13). **Este documento** ordena **cuándo**, **para qué perfil** y **a qué costo** se construye cada variante de hardware.

---

## 1. Visión General de Variantes

| Variante | Núcleo | Propósito | Fase | Tarjeta |
|---|---|---|---|---|
| **V1 · Demo/Lab** | ESP32 DevKit + MAX30102 + MPU6050 | laboratorio, STEM, pruebas de dominio | U1 | DevKit |
| **V2 · Collar aunque básico** | ESP32 + ADS1292R + MAX30102 + MPU6050 (pilas) | collar bovino/canino de campo mediano | U2 | custom (WROOM) |
| **V3 · Collar robusto** | ESP32 + igual sensores + LoRa SX1278 + BMS | collar rural con reserva LoRa | U3-U4 | custom IP66 |
| **V4 · Wearable pequeño** | ESP32-C3 + MAX86150 (alt) + MPU6050 | canino/felino pequeño, uso STEM | U5-U6 | **PCB compacta (≤ 30 mm)** |
| **Gateways/caminos** | BBB Rev C + ESP32 bridge LoRa→MQTT | broker + edge + bridge | U2+ | BBB RhodeSight Rev C |

---

## 2. Costo Referencial por Variante (USD, talleres 2025-26, ln = 100)

| Variante | MCU | Sensores | Radio | BMS/batería | Estructura | **Tot. unit.** |
|---|---|---|---|---|---|---|
| V1 Demo | 4–6 | 8–10 | Wi-Fi (t) | 3–5 | 2–4 | **~18–25** |
| V2 Collar | 4–6 | 20–28 | Wi-Fi + BT | 6–9 | 6–10 | **~38–55** |
| V3 Collar LoRa | 4–6 | 20–28 | LoRa 5–8 | 8–12 | 10–18 | **~50–70** |
| V4 Wearable | 3–5 (C3) | 12–16 (MAX86150 alt) | BLE option | 5–8 | 8–14 | **~40–55** |

> Costo de **prototipo único** (ln=1): +50–80% por piezas sueltas y PCB-Lot small. Para 10 unidades ln ya baja ~30%.

---

## 3. Presupuesto Energético y Autonomía

| Modo | Consumo |
|---|---|
| Deep sleep (nodo) | ~10–40 µA |
| Wifi TX burst (MAX) | 200–400 mA (picos) |
| LoRa TX | 60–120 mA (SX1276) |
| BLE ADV | ~5–15 mA |

| Variante | Batería | Estimación de autonomía |
|---|---|---|
| V1 Demo | LiPo 500 mAh | 12–24 h (modo demo, lectura 1 s/10 min) |
| V2 Collar | LiPo 1200–2000 mAh | 5–12 días (2 lecturas/min) |
| V3 Collar LoRa | LiPo 2000–3300 mAh | 2–4 semanas (LoRa reserva) |
| V4 Wearable | LiPo 250–400 mAh | 1–3 días (BLE dominante) |

**Práctica de diseño (silenciosa pero esencial):** 2 pines en el conector del collar para **medición de batería en runtime** (voltaje + tag carga) → alimenta el `status.battery_percent` del envelope V4 (§8 de `UBTN_MQTT_ARCHITECTURE.md`).

---

## 4. Gate por Variante

| Gate | Cómo se decide | BLOCKER |
|---|---|---|
| V1 → llegar a U2 | laboratorio valida: fiabilidad de lectura, dedup, velocidad | lectura con ruido >20% descarte → NO pasar |
| V2 → campo mediano | 10 nodos × 7 días en finca demo | MQTT >1% pérdida; broker sin monitoreo |
| V3 → rural | pruebas de rango LoRa ≥800 m con obstáculos | fallo de rango o consumo no tolerado |
| V4 → wearable | biomecánica de 30 mm y comodidad validada | any tema de tamaño/PII |

> Cada gate se alinea con `UBTN_RISK_ANALYSIS.md` (riesgos de hardware R-0x) y con `UBTN_FIELD_DEPLOYMENT_GUIDE.md`.

---

## 5. Relación con la BBB Rev C

| Rol | HW elemento | Nota |
|---|---|---|
| Broker MQTT | Mosquitto (docker) sobre BBB | gateway del campo |
| Bridge | MQTT bridge + buffer | offline-first |
| LoRa GW | radio USB / SX1276 en BBB | solo si V3 destaca |
| TinyML edge | BBB-02 (futuro) | reglas→modelos locales (ADR-14) |
| BBB-03 | sensores de corral (temperatura, PIR) | preparación animal, no wearable |

**Posicionamiento estratégico (ADR-14):** la BBB-02 aprenda primero en edge (reglas) y luego haga TinyML. La hardware V3/V4 conservan sensorial y el "edge" analítico crece en la BBB, NO en el MCU pequeño.

---

## 6. Rationale Documentos Clave

| Documento | qué aporta |
|---|---|
| `UBTN_SENSOR_CATALOG.md` | ficha técnica de cada transductor + ADR-12/13 |
| `UBTN_RESEARCH_BACKLOG.md` | ítems RI para validar sensores en animales reales |
| `UBTN_LAB_INTEGRATION.md` | protocolos de laboratorio para V1/V2 |
| `UBTN_FIELD_DEPLOYMENT_GUIDE.md` | cómo instalarlo en finca |

---

## 7. Referencias

- [`UBTN_SENSOR_CATALOG.md`](UBTN_SENSOR_CATALOG.md).
- [`UBTN_BBB_EDGE_GATEWAY.md`](UBTN_BBB_EDGE_GATEWAY.md).
- [`UBTN_ROADMAP.md`](UBTN_ROADMAP.md) (fases U1–U6).
- [`UBTN_RISK_ANALYSIS.md`](UBTN_RISK_ANALYSIS.md) (riesgos, umbrales de detención).
- [`UBTN_ADR_INDEX.md`](UBTN_ADR_INDEX.md) (ADR-12/13, 14).

---

*Hardware roadmap — costos y plan informativo. La fabricación real sigue su propio ADR y laboratorio (U1+).*