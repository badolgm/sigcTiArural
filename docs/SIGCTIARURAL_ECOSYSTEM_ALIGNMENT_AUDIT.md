# SIGC&T Rural — Auditoría de Alineación con el Ecosistema Científico-Tecnológico

**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Tipo:** AUDITORÍA ESTRATÉGICA — no se implementó ni eliminó nada.
**Ámbito:** evolución del frontend vs. misión fundamental (Ciencia, Tecnología, Investigación, IA, ML, Labs, Telemetría, Producción, Conocimiento, Hardware).

---

## Balance de cobertura por área (verificado contra `src/frontend/src`)

| Área | Presencia en Dashboard (primer nivel) | Profundidad real (páginas/datos) | Evaluación |
|---|---|---|---|
| **Telemetría** | Mapa (Nodos BBB) · 4 KPIs · Estado del Sistema | 3 nodos BBB, `/api/v3`, TelemetryPanel, GlobalChart, fuentes live/sim | 🟢 Muy bien representada (eje central) |
| **Hardware** | Mapa (Disponible + Roadmap) · KPI (10 plataformas) · strip conectado | 10 fichas con recursos oficiales + learning layer; 5 roadmap | 🟢 Muy bien representada |
| **Conocimiento** | KPI (51 docs) · chip · Estado del Sistema | Knowledge Hub: 51 docs en 6 categorías | 🟢 Muy bien representada |
| **Labs** | 7 accesos rápidos · chip Capacidades | 8 laboratorios reales (robótica, embebidos, telecom, electrónica, matemáticas, data science, UBTN) | 🟢 Bien representada |
| **IA / ML** | Chips secundarios · nodo BBB-02 (TFLite) | `/ai-predictive` (inferencia real), `/data-science` (Pyodide+SSE), 18 docs research_v2, JETSON/ESP32-S3 edge AI | 🟡 Presente pero relegada a segundo plano |
| **Investigación** | Solo recuento de docs | 18 docs research_v2 + 13 eiarc-architecture + 6 KB audits | 🟡 Subrepresentada en Dashboard |
| **Ciencia (matemática, telecom, electrónica)** | Solo chips de labs | 12 categorías académicas, 8 labs de ciencia aplicada | 🟡 Subrepresentada en Dashboard |
| **Producción agrícola** | **ausente** (0 matches de produccion/yield/cosecha/parcela/suelo/irriga) | Solo IA de sanidad foliar (demo) y datasets en diseño | 🔴 **No representada** |

---

## 1. ¿La plataforma sigue representando un ECOSISTEMA DE CIENCIA Y TECNOLOGÍA?

**SÍ, y con mayor integridad que la etapa inicial.** El dashboard actual es un ecosistema operable, no una vitrina:

- **Ciencia aplicada:** 8 laboratorios funcionales (no decorativos) con recursos oficiales verificados.
- **Tecnología viva:** clúster BBB con 3 roles reales (Gateway/MQTT, IA Edge/TFLite, IoT), telemetría con `source_mode` honesto (live/sim), no simulada como real.
- **Investigación:** 18 documentos de programa de investigación IA + datasets + pipelines de entrenamiento documentados.
- **Conocimiento:** hub de 51 documentos (arquitectura, misión, investigaciones, auditorías).
- **Aprendizaje:** Learning Layer con `resources[]` oficiales en 5 de las 10 fichas de hardware.

**Conclusión:** la plataforma ES un ecosistema de ciencia y tecnología. La instrumentación (BBB, sensores, telemetría, labs) existe y está presente en el primer nivel del Dashboard.

---

## 2. ¿Qué áreas científicas están subrepresentadas?

1. **Producción agrícola** 🔴 — la más crítica: el proyecto se llama "SIGC&T **Rural**" y su filo es agrícola (Agricultura Inteligente, nodo UBTN), pero **no hay ni un módulo de producción**: rendimiento, cultivos, parcelas, suelo, riego. El único contenido agrícola real es sanidad foliar (categorización enferma/sana, demo) y datasets en diseño.
2. **Ciencia de datos como disciplina en Dashboard** 🟡 — existe el laboratorio (`/data-science`) pero no aflora al primer nivel (sin KPI de experimentos, sin métrica de datasets).
3. **Investigación como área** 🟡 — 18 docs de investigación existen pero el Dashboard los muestra solo como el "recuento de Conocimiento" (51); no hay acceso directo a "Investigación activa" ni a datasets/campo.
4. **Ciencia pura (matemáticas avanzadas, hardware cuántico/QML)** — presente en labs (PennyLane, Qiskit) pero invisible desde el Dashboard.

---

## 3. ¿Qué áreas aparecen demasiado?

- **Hardware y telemetría** 🟡: aparecen en casi todos los bloques del primer nivel (Mapa completo, 4 KPIs, Estado del Sistema, strip Hardware Conectado, módulo operación). Esto **no es un defecto de contenido** — es el corazón instrumentado del ecosistema — pero **satura el primer pliegue**, dejando poco espacio para ciencia, producción y experimentación.
- **Conocimiento / Entidad propia** 🟢 leve: la "entidad" (51 docs, mayoría de arquitectura y auditorías EIARC) tiende a autoreferenciarse en el Dashboard (conteo de docs) y en chips; es legítimo (evidencia de gobernanza), solo debe evitar convertirse en el mensaje principal.

**Lectura estratégica:** la sobre-representación de hardware/telemetría es consecuencia de la misión actual implementada; el próximo eje científico (producción, datasets, experimentación) es el que está faltando en el mismo nivel de profundidad.

---

## 4. ¿Qué partes del sistema original debemos proteger especialmente?

Orden de protección (riesgo de pérdida del norte):

1. **BBB + Telemetría** — el núcleo vivo; es la diferencia entre "plataforma simulada" y "ecosistema real". ❌ No debe cosificarse a stickers ni perderse en chips.
2. **El vocabulario honesto** (`operativo / referencia / diseño`, `source_mode` live/sim, banners "Placeholder") — es la integridad científica de la plataforma; romperlo la degrada a demo.
3. **Conjunto de datos y MLOps (research_v2)** — 18 docs; base de la IA real del proyecto (datasets, splits, pipelines, gobernanza).
4. **Labs reales** — 8 laboratorios con material oficial; son la parte "educativa" de la misión.
5. **El Mapa de Dispositivos** como única ventana jerárquica del ecosistema (ya consolidado en U4.2/U4.3).
6. **La IA Predictiva honesta** — inferencia real con `scientific_scope: binary_only` y `confidence`; protege contra la IA decorativa.

---

## 5. ¿Qué elementos visuales pueden hacer perder el norte científico?

1. 🟠 **Estética "gaming" de fondo** (glow neón excesivo, `textShadow` fuerte, `animate-pulse` en títulos) — comunica "app futurista" más que "laboratorio científico". Riesgo real de percepción: la plataforma puede leerse como demo de diseño, no como instrumentación.
2. 🟠 **Acumulación de emojis como semántica** (💠🛒🧩🗞️🔌 en títulos) — útil a nivel de eco (visual scan rápido) pero si se acumula desordena el mensaje.
3. 🟡 **Micro-chips repetidos** — el nuevo patrón de franjas ejecutivas (U4.1/U4.3) reduce ruido honestamente, pero si se extiende demasiado fragmenta la jerarquía.
4. 🟠 **Sobreresaltado de "SISTEMA OPERATIVO"** (badge glow pulsante) — transmite "producción perfecta"; debe matizarse para no sobreprometer estado operativo.
5. 🟡 **C1: barra de identidad** — si se describiera solo como "SIGC&T" sin el sustantivo "Rural/Science", se pierde el ámbito agrícola-científico. El subtítulo del Header ("Ecosistema de ciencia y tecnología") es correcto y debe permanecer.
6. 🕹🟠 **Chips hardware por doquier** — el strip "Hardware Conectado" + Mapa + KPI plataformas triplica el peso de hardware visualmente; el norte se mantiene solo porque el hardware es contenido real, no filler.

---

## 6. ¿La Dashboard está promoviendo aprendizaje, investigación y experimentación?

**SÍ, en tres capas distintas, con matices:**

- **Aprendizaje: SÍ, directo** — Learning Layer (`resources[]` en 5 fichas: courses, videos, research, datasets, repos), 8 labs con material oficial, Knowledge Hub.
- **Investigación: SÍ, profunda pero no visible** — 18 docs de programa de investigación + dataset governance + ML experimentos (Jean-Marc/Joseph para p-models?). El Dashboard solo muestra el recuento; no hay superficie que invite a "leer la investigación".
- **Experimentación: SÍ, en la práctica** — `/data-science` (notebook Python en el navegador con Pyodide), `/ai-predictive` (inferencia con escenarios), `AdvancedMathLab` (Qiskit/PennyLane). **Falta en Dashboard:** no existen métricas de "experimentos ejecutados", "precisión del modelo", "datasets disponibles"; la experimentación vive "detrás de una puerta", no en el tablero.

---

## Veredicto de alineación

**🟢 ALINEADA con la misión fundamental**, con dos fisuras estratégicas:

| Dimensión | Estado |
|---|---|
| Instrumentación/telemetría real | ✅ Esencia protegida y primaria |
| Aprendizaje | ✅ Capa completa y oficial |
| Investigación | ✅ Riqueza documental alta, ✋ oculta del primer nivel |
| Ciencia aplicada (labs) | ✅ Fuerte en rutas, ✋ subrepresentada en Dashboard |
| IA/ML | ✅ Prototipo honesto, ✋ segundo plano |
| **Producción rural** | ❌ **Ausente — el vacío más grave** para un proyecto "Rural" |
| Percepción visual | 🟠 Riesgo de leerse como demo neón, no como laboratorio |

**Debe protegerse ante todo:** BBB/telemetría, vocabulario honesto, datasets/MLOps y labs reales.
**Debe crecer a continuación:** una superficie de **producción agrícola** (parcela/cultivos/rendimiento) y/o dar a **investigación y experimentación** su propia vitrina en primer nivel (datasets, precisión del modelo, experimentos) — sin tocar lo ya validado.

**Estado:** solo auditoría. Ningún archivo se modificó en esta misión.