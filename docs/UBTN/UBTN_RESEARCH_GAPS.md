# 🔬 UBTN — Research Gaps (Gaps de Investigación)

## Universal Biological Telemetry Node — Qué NO se sabe aún / Qué validar físicamente / Qué diferir

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 (diseño — sin implementación) |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔷 Diseño — consolida y prioriza `UBTN_RESEARCH_BACKLOG.md` para la fase de prototipo |

> Este documento NO repite el backlog; separa **lo que el papel no resuelve** de lo que sí. Prioriza experimentos físicos medibles antes de ampliar la deuda de diseño.

---

## 1. Categorías de Gap

| Categoría | Qué cubre | ¿Es bloqueante de diseño? |
|---|---|---|
| G-FÍSICO | someter sensores en animales reales, RSSI, consumo | SÍ (para V2+) |
| G-BIOLÓGICO | rangos reales por especie/línea base | SÍ (para umbrales U3) |
| G-RED | comportamiento de MQTT/LoRa en topografías | parcial |
| G-PERSISTENCIA | volumen, latencias p95/p99, idx dimension | parcial (evaluar en U4) |
| G-GOBERNANZA | política de retención, consentimiento multiactor | SÍ (ADR-16 reactivada en U6) |
| G-ALTA | IA interpretable sobre series biológicas | diferida a U4–U5 |

---

## 2. Gaps Físicos Prioritarios (Someter a hardware)

| Gap | Diseño actual | Experimentación necesaria | Fase |
|---|---|---|---|
| P1 · Colocación óptima del electrodo | collar cervical como default | prueba de colocación (cuello vs oreja) en bovino: SNR de ECG | U2 |
| P2 · Movimiento como artefacto | MPU6050 como auxiliar | separar artefacto de movemento de señal cardíaca | U2 |
| P3 · Consumo real por modo | energía teórica | medición en laboratorio con osciloscopio (µA real deep sleep) | U1 |
| P4 · Rango LoRa rural | 1–5 km (teórico) | prueba con obstáculos, vegetación y polaridad | U2-U3 |
| P5 · Batería en runtime | TAG de voltaje | validar curva y umbrales (10/5%) | U2 |
| P6 · Sudor/piel en contacto | asumido | fricción del collar en calor subtropical (nivel seguridad) | U3 |

**Regla:** todo gap físico abre un RI en `UBTN_RESEARCH_BACKLOG.md` y **NO pasa el gate de la variante** hasta validar.

---

## 3. Gaps Biológicos (Rangos y líneas base)

| Gap | Impacto | Método propuesto | Fuente de rango actual |
|---|---|---|---|
| B1 · Línea base bovino en trópico | umbral de HR/RR mal calibrado → falsas alertas | telemetría 7 días de 10 reses en clima dado | tabla referencial `UBTN_USE_CASES.md` |
| B2 · Frecuencia cardiaca por carrera | confusión HR (artifacto) | gold estándar ECG vs MPU6050 (V2) | literatura |
| B3 · Rangos canino/felino en valle | simil B1 para mascotas | pilotos pequeños en clínica | literatura + observación |
| B4 · Apícola real (temp/humedad) | la colmena objetivo macro | registros de 30 días (sin interferir panal) | `UBTN_USE_CASES.md` apícola |
| B5 · Equino por sudor | señal degradada | test de placa en zona sudor | — |

> Cada línea base validada se conecta a `PhysiologicalThresholdService` (diseño de umbral, U3) y a política de gobernanza ADR-16.

---

## 4. Gaps de Red y Persistencia

| Gap | Diseño | Qué medir | Puerta |
|---|---|---|---|
| R1 · Broker a escala | broker único BBB (PRF) | comportamiento con 40 nodos concurrentes | U3 → U4 |
| R2 · Bridge offline a granel | buffer QoS1 | pérdida/duplicación con 12 h de corte | U3 |
| R3 · Latencia de `subset_reading` | PG jsonb | p95 con 1M–10M filas, con/sin índice | U4 |
| R4 · Burst a escala | bucket S3 | costo/velocidad de recarga por burst | U3 (si burst real) |
| D1 · Gobernanza de retención | 90 días por defecto | ACUERDO multiactor: productor/vet/universidad | U6 (ADR-16) |

---

## 5. Gaps de IA (Diferidos, NO bloqueantes ahora)

| Gap | Decisión | Por qué diferir |
|---|---|---|
| IA1 · Modelo de estrés interpretable | TinyML BBB-02 edge-first (ADR-14) | primero reglas validadas (U3) democratizan señal |
| IA2 · Series etiquetadas | sin gold estándar hoy | etiquetado post-validación clínica (U5) |
| IA3 · Privacidad del modelo | pseudonimización + local | PCA/revisar en U6 |

---

## 6. Matriz de "NO hacer todavía" (anti-patterns)

| Acción | Riesgo | Cuándo será viable |
|---|---|---|
| Comprar sensores "de catálogo" sin normativa | gasto muerto | solo tras RI-P3 |
| Definir umbrales definitivos por especie | falsas alertas | después B1–B5 |
| Abrir puerta C (timeseries) en diseño | deuda irreversible | ≥ 10 M filas (ADR-18) |
| Escalar broker a miles de nodos | PRF | tras R1–R2 |
| TinyML sin reglas validadas | modelo opaco e inseguro | tras U3 |

---

## 7. Regla de Cierre de Gap

Cada gap cierra con **evidencia física** (medición, prueba de campo, ADR) y registro en `UBTN_RESEARCH_BACKLOG.md` moviendo el RI P2 → P1 → done. Un gap P1 abierto **blockea** el gate de la fase correspondiente en `UBTN_RISK_ANALYSIS.md`.

---

## 8. Referencias

- [`UBTN_RESEARCH_BACKLOG.md`](UBTN_RESEARCH_BACKLOG.md) — ítems RI / prioridades.
- [`UBTN_USE_CASES.md`](UBTN_USE_CASES.md) — rangos referenciales base.
- [`UBTN_HARDWARE_ROADMAP.md`](UBTN_HARDWARE_ROADMAP.md) — gates de variante.
- [`UBTN_RISK_ANALYSIS.md`](UBTN_RISK_ANALYSIS.md) — umbrales de detención.
- [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) — TinyML (diferido).
- [`UBTN_ADR_INDEX.md`](UBTN_ADR_INDEX.md) — ADR-14, 16, 18.

---

*Research gaps — qué no se sabe físicamente, en orden de prioridad de experimento. Nunca se "cierra por diseño".*