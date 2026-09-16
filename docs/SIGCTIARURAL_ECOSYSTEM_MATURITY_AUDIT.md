# SIGC&T Rural — Auditoría de Madurez del Ecosistema (RC-2A)

**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Tipo:** AUDITORÍA desde la misión científica/tecnológica — NO UX, NO diseño, NO Dashboard.
**Evidencia:** rutas/componentes y datos de `src/frontend/src` verificados (docs, registry, catálogos). No se modificó nada.

---

## 1. Áreas CIENTÍFICAS representadas

| Área | Dónde vive | Profundidad real |
|---|---|---|
| **Matemáticas** | `labs/AdvancedMathLab.jsx` (+V2) | 8 subáreas (cuántico, EDs, variable compleja, álgebra lineal, tensores, transformadas, lógica/conjuntos) con 8 recursos de investigación (Qiskit, PennyLane, Cirq, arXiv…) |
| **Máquinas cuánticas / QML** | AdvancedMathLab | PennyLane (Quantum ML), Qiskit — bibliotecas reales, enlaces oficiales |
| **Electrónica** | `labs/ElectronicsLab.jsx` (+ FalstadPanel/SchematicEditor) | Simulador de circuitos Falstad, editor de esquemas, puerto de simulación |
| **Telecomunicaciones** | `labs/TelecomLab.jsx` | Laboratorio de telecomunicaciones dedicado |
| **Robótica** | `labs/RoboticsLab.jsx` (+ Telemetry3DScene) | Escena 3D + API robot-telemetry (`PHYSICS-BOT-01`) |
| **Biología/agricultura aplicada** | `pages/AIPredictiva.jsx` | Sanidad foliar (tomate): clasificación binaria con `confidence` y `model_version` |
| **Ciencia de datos** | `pages/DataScienceLab.jsx` | Python en navegador (Pyodide) + SSE de métricas reales |
| **Sistemas embebidos** | `labs/EmbeddedLab.jsx` | TFLite + TFLite-Micro (Agricultura + IA) |

**Ciencia representada: SÍ, en 8 frentes** — pero viven casi todos en los laboratorios, no en la superficie del ecosistema.

## 2. Áreas TECNOLÓGICAS representadas

| Área | Evidencia |
|---|---|
| **Edge computing** | BBB (Gateway/MQTT + IA Edge/TFLite + IoT) — clúster operable |
| **Telemetría V3** | `/api/v3/telemetry/history/`, `source_mode` live/sim, Open-Meteo (datos reales), TelemetryPanel + GlobalChart |
| **Hardware (10 plataformas)** | catalog-data.js: BBB, ESP32 ×2, STM32, ARDUINO, RPI, JETSON, FPGA, MINI-PC, CUSTOM-HW con `reference/construction` honesto |
| **Roadmap (5)** | RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV (integración futura) |
| **IoT/MQTT** | `edge_setup`, `api_reference`, protocolos en fichas |
| **Frontend/arquitectura** | Hexagonal/DDD (docs EIARC 13 + MB 6), Contexts IA y Telemetría implementados |
| **Robótica / RV** | Asset 3D + telemetría del robot físico |

**Tecnología: la más fuerte del ecosistema.** Es la capa mejor instrumentada (BBB + telemetría + hardware + labs).

## 3. Áreas de INVESTIGACIÓN visibles

| Nivel | Evidencia |
|---|---|
| **18 docs research_v2** | Agricultura-IA (taxonomía, dataset inventory, calidad, split, benchmark, execution plan) + IA (arquitectura, pipelines, MLOps, validación, corrección científica) |
| **6 KB audits** | KB-001..006 (auditorías de repositorio, IA, contratos, modelo canónico) |
| **13 docs EIARC-architecture** | Contextos, blueprint, refactor plans, code reviews |
| **4 históricos** | Informes de análisis y auditorías previas |
| **Protocolo de experimento reales** | `scientific_scope: binary_only`, `model_version`, `confidence` en respuestas de inferencia; SSE `/events` con `top_class_index` |

**Investigación: ES rica (78+ docs)** — pero en la superficie del ecosistema solo se ve como "recuento de Conocimiento" (51). No hay vitrina de investigación, datasets, ni experimentos en la capa visible.

## 4. Áreas de PRODUCCIÓN AUSENTES

**La ausencia más grave del ecosistema.** Grep por `produccion|rendimiento|yield|cosecha|siembra|parcela|suelo|irriga` en `src/frontend` → **0 matches**.

| Ausente | Estatus |
|---|---|
| Producción agrícola (cultivos, rendimiento, cosecha) | ❌ 0% |
| Parcelas / campo / suelo | ❌ 0% |
| Riego / sensores de campo desplegados | ❌ 0% |
| Dato productivo real | ❌ 0% |
| Lo más cercano | 🟡 Sanidad foliar (clasificación enferma/sana) + datasets de diseño en research_v2 — **sin despliegue productivo** |

**Lectura honesta:** SIGCTiArural hoy es un ecosistema de **instrumentación científica + investigación y aprendizaje**, con la cadena *ciencia→producción* incompleta. La producción es la terminal que falta para cerrar el ciclo "señal → decisión de campo".

## 5. Cómo representar la cadena sin romper arquitectura

```
HARDWARE ──► TELEMETRÍA ──► LABS ──► ML ──► IA ──► PRODUCCIÓN
```

**Regla de oro (ya verificada en `SIGCTIARURAL_RESEARCH_EXPERIMENTATION_LAYER.md`):** cada eslabón se representa con PRIMITIVAS DE PRESENTACIÓN que leen datos ya existentes; nunca se crean stores/datos/endpoints nuevos.

| Eslabón | Primitiva visual | Fuente real (sin inventar) |
|---|---|---|
| Hardware | chips/fichas con `fase` (operativo/diseño) | catalog-data.js (10 + 5 roadmap) |
| Telemetría | serie temporal compacta + `source_mode` | `/api/v3/telemetry/history/` + Open-Meteo |
| Labs | acceso rápido con contadores honestos | lab routes existentes (8) |
| ML | ficha de modelo: `model_version` + `confidence` + `binary_only` | response de inferencia real |
| IA | recomendación con `confidence %` + límite ("Escenario demostrativo") | AIPredictiva (`getStatusPresentation`) |
| Producción | **VÍNCULO con límite** ("en diseño") — no módulo falso | research_v2 (ejecución/datasets) + estado `diseño` de proyectos |

**Sin romper arquitectura =**
- Una sola fuente de verdad por dato (catálogo/telemetría/inferencia/docs).
- Las primitivas reciben data por props/context (como TelemetryPanel/GlobalChart/ClusterCard).
- Sin rutas nuevas: los eslabones enlazan a las páginas completas existentes.
- Vocabulario honesto obligatorio (`source_mode`, `fase`, `confidence`, "sin despliegue hoy").
- La cadena se dibuja como **flujo de contexto** (H→T→L→ML→IA→P), no como módulos falsos.

> Producción debe aparecer SOLO como "terminal en diseño" (proyecto AGRICULTURA-INTELIGENTE = `diseño`, datasets = plan). Mostrarla como productiva sería mentira.

## 6. Qué falta para percibirse como ECOSISTEMA y no como Dashboard

**Diagnóstico:** hoy la plataforma se percibe como "Dashboard BBB + páginas" porque la riqueza real (investigación, datos, experimentación) está **detrás de rutas**; el Dashboard expone instrumentación (hardware/telemetría) y aprendizaje (conocimiento/labs), pero **no expone el ciclo científico**.

| Falta | Precisamente qué |
|---|---|
| **Vitrina de investigación** | Expedientes con fase (hipótesis→validación), dominio y enlace a research_v2 (no solo "51 docs") |
| **Vitrina de experimentación** | Registros de ejecución con `confidence`/`top_class_index` (SSE) y veredicto — legibles en superficie |
| **Vitrina de datasets** | Ficha de dataset real (`n_muestras`, `split`, calidad) desde `_dataset_inventory` |
| **El ciclo completo dibujado** | Flujo H→T→L→ML→IA→(P en diseño) como cadena visible, no 6 módulos sueltos |
| **Terminal de producción** | Vínculo honesto "en diseño" + estado del proyecto agrícola (no dato productivo falso) |
| **Métrica de ecosistema** | Indicadores de ciencia (experimentos, datasets, docs, precisión) — ya hay datos para calcularlos |

**Criterio de "percepción de ecosistema":** cuando desde la superficie se pueda *seguir el ciclo completo* — seleccionar un hardware → ver su telemetría → abrir su lab → aplicarle un modelo → recibir una recomendación con confianza → y constatar el estado real (operativo/diseño/producción) — la plataforma se percibe como ecosistema, no como tablero.

---

## Veredicto de madurez del ecosistema (no de UX)

| Eje | Madurez | Comentario |
|---|---|---|
| Tecnología (hardware+telemetría+edge) | 🟢 90% | El corazón instrumentado |
| Ciencia aplicada (labs) | 🟢 85% | 8 labs reales con recursos oficiales |
| Aprendizaje/Conocimiento | 🟢 90% | 51 docs + learning layer oficial |
| Investigación (profundidad) | 🟢 80% | 78+ docs, pero invisible en superficie |
| Experimentación/ML | 🟡 65% | Real (SSE/confidence) pero sin vitrina |
| IA | 🟡 70% | Inferencia real binaria, honesta |
| **Producción** | 🔴 **5%** | **Ausente (terminal del ciclo)** |
| **Percepción de ecosistema (vs dashboard)** | 🟡 **60%** | Falta el ciclo visible completo |

**Conclusión estratégica:** la plataforma ya ES un ecosistema de ciencia y tecnología en **tecnología, ciencia y conocimiento**; el salto a *percibirse* como ecosistema (y no como Dashboard) viene de **exponer la capa de investigación/experimentación/datos en la superficie** (ítems 6) y de decidir deliberadamente si la **terminación de producción** entra como "en diseño" honesto o se espera a datos reales. Solo auditoría — nada implementado.