# 🧩 UBTN — Integración con el Ecosistema SIGC&T Rural

## Universal Biological Telemetry Node — Conexión con Robótica, Telecomunicaciones, Electrónica, IA, Agricultura y Aprendizaje STEM

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 (integración — sin implementación) |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔷 Diseño — mapa de integración sin código |
| **Enfoque** | Cómo el UBTN se conecta (o conectará) con cada línea del ecosistema sin romperlas |

---

## 1. Propósito y Principio

El ecosistema SIGC&T Rural es **un solo sistema modular** (ver `docs/ECOSYSTEM_IDENTITY.md`): "una señal capturada en un laboratorio puede fluir hacia otros dominios". El UBTN sigue esa regla: su señal biométrica **fluye** hacia Robótica, Telecomunicaciones, Electrónica, IA, Agricultura y el piso educativo STEM, sin que ninguna línea existente se modifique.

> ⛔ Restricción: este documento describe **puntos de integración**; no se programa ningún adaptador en esta rama.

---

## 2. Mapa General de Integración

```mermaid
flowchart TB
    U[UBTN — BiologicalTelemetry<br/>BiologicalReading / Node / Subject]
    U -->|LabSignal biological_reading| BUS[EventBusPort]
    BUS --> LAB[Labs Context]
    LAB --> AGR[Agricultura]
    LAB --> ELE[Electrónica]
    BUS -.-> DTEL[Telecomunicaciones]
    RO[Robótica] -->|contextualiza ambiente de cultivo/corral| U
    U -->|series limpias (CUI)| AI[AI Context — Animal Health AI]
    AI -->|alerta predictiva| OP[Operario/Productor]
    AGR -->|estrategias de cultivo| U
    ELE -->|diseño de front-end/electrodos| U
    DTEL -->|visualiza flujo MQTT/LoRa| U
    RO -->|detección de eventos (ej. derrames/visitas)| U
    STEM[Piso Educativo STEM] -->|datos reales en el aula| U
```

---

## 3. Integración con Robótica

| Punto | Relación | Diseño |
|---|---|---|
| Contexto de entorno | Robots de campo y UBTN comparten el mismo corral/cultivo | `RobotTelemetry` y `BiologicalReading` conviven sin fusionarse (dos flujos: ambiente/actuador + individuo) |
| Eventos correlacionados | Visita/nocturnidad/derrame detectada por robótica puede correlacionarse con estrés animal (actividad) | Query cruzada en analítica para correlacionar series; **sin acoplar dominios** |
| Comandos ignorados | El UBTN no recibe comandos de robots | No existe relación de control; solo analítica correlacional |
| Frontera telemetría | `RobotTelemetry` = telemetría del actuador; `BiologicalReading` = telemetría del individuo | Ramas paralelas del mismo árbol de monitoreo |

---

## 4. Integración con Telecomunicaciones

| Punto | Relación | Diseño |
|---|---|---|
| Visualización de flujo MQTT | El laboratorio de Telecomunicaciones puede **ver el flujo `ubtn/#`** en tiempo real | tópicos MQTT documentados (`UBTN_DATA_CONTRACTS.md`); sin tocar el lab |
| Enseñanza de protocolos | LoRa/WiFi/BLE del UBTN como casos prácticos de capa física/enlace | Material STEM (ver §7) |
| Metrología de enlace | RSSI/SNR de cada nodo en `status` sirve para estudiar cobertura rural | métrica `signal_quality` en contrato `status` |
| Gateway real | BBB-01 ya ejerce de gateway; los alumnos ven el borde real | integración con la línea edge existente |

---

## 5. Integración con Electrónica

| Punto | Relación | Diseño |
|---|---|---|
| Diseño de front-end analógico | Los estudiantes diseñan el **acondicionamiento de señal** (electrodos, fotodetector, filtros) | en el editor de esquemas de `ElectronicsLab` (actividad STEM), **replicable en hardware del UBTN** |
| Validación de componentes en simulación | ADS1292R/MAX30102/MPU6050 como casos de estudio en simulación de circuitos | sin cambios en el lab; solo contenido educativo |
| Metrología de señal | Parámetros eléctricos (SNR, offset, ruido) se miden igual que en circuitos del lab | conjunto de prácticas de señal biométrica (ver §7) |
| Hardware gateway | BBB-01/02/03 son plataformas de electrónica de borde | se conserva en la rama edge (sin tocar el resto) |

---

## 6. Integración con IA

| Punto | Relación | Diseño |
|---|---|---|
| **Origen de datos** | IA Predictiva (Animal Health AI) consume **series limpias** del UBTN | vía CUI/queries; **sin acoplar el subdominio bio** (`UBTN_EDGE_AI_STRATEGY.md` §6) |
| **AIServicePort** | El puerto existente se reutiliza/extiende para biometrías | sin romper el diagnóstico de plantas |
| **Alertas** | IA predictiva → alerta al productor (fusión umbral+modelo) | `physiological_alert` + explicación |
| **Gobernanza** | Se respeta la gobernanza de IA V2 y la regla alerta ≠ diagnóstico | ADR-UBTN-16, RSK-REG-02 |
| **Feature engineering** | medias móviles, variabilidad, tendencias por especie | U6 |

---

## 7. Integración con Agricultura

| Punto | Relación | Diseño |
|---|---|---|
| EventBus | Agricultura ya consume `sensor_reading`; podrá recibir `biological_reading` como evento adicional | suscripción nueva en `wiring.py`; el handler existente **no se toca** (ADR-UBTN-03) |
| Estrategia de dominio | `LaboratorioStrategyFactory` (labs) registra nuevas estrategias por línea productiva | extensión sin modificar las 4 estrategias existentes |
| Economía de la finca | indicadores biométricos del hato se unen al tablero de cultivo | correlación productiva (sin fusión de modelos) |
| Fenología/ambiente | temperatura/humedad ambiental (telemetría) + T° corporal (UBTN) → índice de estrés térmico | consulta cruzada por sujeto y estación |

---

## 8. Integración con el Piso Educativo (Aprendizaje STEM)

### 8.1 Triple enfoque STEM del UBTN

| Enfoque | Actividad educativa |
|---|---|
| **Ciencias** | Rangos fisiológicos por especie = biología real; comprender homeostasis, fiebre, estrés térmico |
| **Tecnología** | Flujo completo: sensor → MQTT → cloud → dashboard; programación del nodo (ESP32) |
| **Matemáticas** | series de tiempo, medias móviles, detección de tendencia; cálculo de frecuencia cardíaca desde ECG/PPG |
| **Física** | IMU (aceleración/rotación) para modelar movimiento; ruido y SNR en señales |

### 8.2 Modalidades

1. **Laboratorio guiado:** los alumnos ven la señal de un nodo simulado en el dashboard (`source_mode=simulated`).
2. **Datos reales del corral/colmena/estanque:** observación longitudinal de una finca educativa.
3. **Proyecto integrador ADSO:** un curso diseña un nodo (Electrónica + Telecom + Software) como ejercicio replicable.

### 8.3 Nueva capa de conocimiento

- El UBTN se suma al Knowledge Hub como **familia documental** (docs UBTN) y como **caso de laboratorio** (series biométricas).
- Bitácora STEM: cada práctica registra evidencia y mediciones (métrica de trazabilidad educativa).

---

## 9. Matriz de Integración por Contexto (resumen)

| Contexto/Línea | Canal de integración | Cambio requerido | Riesgo |
|---|---|---|---|
| Robótica | analítica correlacional (sin acoplar) | ninguno | — |
| Telecomunicaciones | tópicos MQTT didácticos + `signal_quality` | documentación/nada | — |
| Electrónica | prácticas de front-end; diseño de placa | contenido educativo | — |
| IA | CUI de series; `AIServicePort` extensible | line-up nuevo handler sin tocar existente | RSK-INT-01 |
| Agricultura | nueva suscripción `biological_reading` | adición en wiring (Fase U3) | RSK-TEC-01 |
| STEM | material didáctico + datos reales | contenido educativo | — |
| Knowledge Hub | familia documental UBTN | índice + trazabilidad (ver UBTN_INDEX) | — |

---

## 10. Referencias

- [`docs/ECOSYSTEM_IDENTITY.md`](ECOSYSTEM_IDENTITY.md) — identidad canónica del ecosistema.
- [`UBTN_EDGE_AI_STRATEGY.md`](UBTN_EDGE_AI_STRATEGY.md) — IA predictiva y edge.
- [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) — señal `biological_reading`.
- [`PLAN_MAESTRO.md`](PLAN_MAESTRO.md) — Fase 6 (robótica), Fase 9 (expansión productiva) y piso STEM.
- `README.md` §Laboratorios — líneas Robótica/Electrónica/Telecom/Agricultura.

---

*Mapa de integración — sin implementación. Ninguna línea existente se modifica.*