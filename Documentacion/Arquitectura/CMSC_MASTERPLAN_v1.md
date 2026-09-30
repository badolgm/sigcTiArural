# SIGCTiArural · CMSC — Centro de Modelado, Simulación y Ciencias Computacionales

> **Categoría:** Documentación canónica de arquitectura · Visión estratégica.
> **Versión:** v1.0 | **Fecha:** 2026-09-25 · **Rama:** `feature/ubtn-biological-telemetry`
> **Tipo:** DISEÑO · ARQUITECTURA · GOBERNANZA · ROADMAP. **No se implementa, no se modifica código, no se refactorizan componentes.**
> **Naturaleza:** documento oficial de la identidad del laboratorio de matemáticas transformado en el **núcleo científico del ecosistema**.

---

## 0. Propósito y posición en el ecosistema

Este documento elimina la visión del laboratorio de matemáticas como herramienta aislada y lo reemplaza conceptualmente por el **Centro de Modelado, Simulación y Ciencias Computacionales (CMSC)**.

El CMSC NO es:
- ❌ una calculadora científica.
- ❌ un widget de gráficas.
- ❌ un lab aislado del resto del dashboard.

El CMSC ES:
- ✅ el núcleo científico donde **toda señal del ecosistema se modela, se simula y se interpreta**.
- ✅ el eslabón donde **Matemáticas, Física, Electrónica, Señales, Telecomunicaciones, Informática e IA convergen**.
- ✅ la puerta de entrada del **flujo continuo de datos** (Sensores → Telemetría → Matemáticas → Señales → IA → Knowledge Hub → Agentes → Usuario).

**Identidad rectora (heredada de `docs/SIGCTIARURAL_VISION_ALIGNMENT.md`):**
> SIGCTiArural NO es agricultura. NO es un dashboard. NO es una calculadora. Es **Ciencia, Tecnología, Investigación, IA, IoT, Telemetría, Educación y Conocimiento**. El CMSC es la expresión estructural de esa identidad.

---

## 1. Visión del CMSC

**Declaración de visión:**
> El CMSC es el centro científico del ecosistema SIGCTiArural: un espacio unificado donde cualquier señal proveniente de la telemetría, la electrónica, las telecomunicaciones, la robótica, la bioacústica o el hardware en general puede **modelarse matemáticamente, simularse en computador, analizarse espectralmente e interpretarse con IA**, dejando siempre evidencia trazable que alimenta el Knowledge Hub y, a través de los agentes, llega al usuario.

**Principios fundacionales:**

| # | Principio | Implicación |
|---|---|---|
| C1 | **La señal es el bien más preciado** | Toda entrada del CMSC proviene de una señal (eléctrica, acústica, biométrica, ambiental, RF). El CMSC no inventa datos: los recibe, los modela y los interpreta. |
| C2 | **Modelo → Simulación → Interpretación** | Pipe tríadico invariante: primero se modela (matemática), luego se simula (computación), luego se interpreta (IA + contexto). Cualquier funcionalidad fuera de esta triada se descarta. |
| C3 | **Nada se elimina** | El laboratorio actual de matemáticas (Dr. Binary, series de Fourier, Laplace, Wavelets) se **preserva y evoluciona** dentro del CMSC, jamás se sustituye por otra cosa. |
| C4 | **Agnosticismo total** | El CMSC es agnóstico a hardware, software y LLM: no depende de ningún proveedor obligatorio (ver §6). |
| C5 | **Evidencia trazable** | Todo resultado (simulación, espectro, transformada, inferencia) es una *evidencia* que se conecta al Knowledge Hub y al proyecto que la produce (regla suprema: todo se conecta). |
| C6 | **Honestidad de estado** | El CMSC distingue siempre `real / simulación / referencia / diseño`. Un espectro synthetic no se muestra como medición de campo. |

---

## 2. Relación del CMSC con las disciplinas del ecosistema

El CMSC es el **punto de convergencia** de todas las disciplinas. No las reemplaza: las *organiza*.

| Disciplina | Rol dentro del CMSC | Anclaje existente en el ecosistema |
|---|---|---|
| **Matemáticas** | Núcleo formal: series, transformadas (Fourier/Laplace/STFT), wavelets, álgebra lineal, optimización, modelado paramétrico, ecuaciones diferenciales | `AdvancedMathLab.jsx` / `AdvancedMathLabV2.jsx` ("Dr. Binary"), `mathHelpers.js`, `/advanced-math`, `/advanced-math-v2` |
| **Física** | Modelado de fenómenos medibles (ondas, temperatura, movimientos, períodos, resonancia) — el CMSC le da el espacio formal que hoy falta (GLC-01) | modelado paramétrico en STEM (`UBTN_LAB_INTEGRATION.md` §8) |
| **Electrónica** | Acondicionamiento de señal, circuitos, filtros, muestreo (FA/ADC), impedancias | `ElectronicsLab.jsx`, Falstad (`CircuitSimulationPort`), `SchematicEditor.jsx`, `useLabStore` |
| **Señales** | Análisis espectral (FFT/STFT), filtrado, ruido, muestreo, reconstrucción, demodulación | `TelecomLab.jsx` (WebAudio FFT), señales de `useLabStore`, `RealSignalAnalysis` |
| **Telecomunicaciones** | Transporte de la señal (modulación, espectro RF, enlace, protocolos) | `TelecomLab.jsx`, `WebSDR` |
| **Informática** | Computación interactiva, implementación (numpy/scipy/Pyodide), estructura de datos de señales, serialización CSV/JSON | `DataScienceLab.jsx` (consola Pyodide), `data-science` |
| **IA** | Interpretación de patrones sobre señales y espectros (clasificación, anomalía, regresión) | `AIPredictiva.jsx` (inferencia), SSE `/events`, endpoint `/api/v3/ai/inference/` |
| **Machine Learning** | Modelos sobre features extraídos en el CMSC (benchmark V1/V2, M1 baseline MobileNetV2, M2 EfficientNet-B0) | `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md`, `benchmark/src` |
| **Deep Learning** | Redes profundas para interpretación de espectrogramas (CNN), bioacústica (CRNN), señal temporal (TCN) | `docs/ai/research_v2` (diseño), programa IA Research V2 |
| **Telemetría** | Proveedor de la señal real (V1/V2/V3, `source_mode` live/sim) | `TelemetryPanel.jsx`, `/api/v3/telemetry/history/`, Telemetry Context |
| **Knowledge Hub** | Destino de la evidencia y fuente del contexto (RAG) para interpretación | `/knowledge` (51 docs), `knowledgeRegistry.generated.json`, Knowledge AI |

---

## 3. Flujo continuo de datos (el "río" del ecosystem)

El CMSC es el **cauce por donde fluye** la cadena completa. Flujo canónico:

```
Sensores
   │  (adquisición: ESP32/Arduino/BBB, I2C/SPI/UART/GPIO, ADS1292R/MAX30102/dht)
   ▼
Telemetría
   │  (V1/V2/V3, MQTT QoS, source_mode live/sim, SSE)
   ▼
Matemáticas (CMSC)
   │  (modelado: series, transformadas, wavelets, álgebra)
   ▼
Señales (CMSC)
   │  (análisis espectral: FFT, STFT, espectrogramas, filtrado)
   ▼
IA
   │  (interpretación: inferencia, patrones, anomalías, confianza)
   ▼
Knowledge Hub
   │  (evidencia documentada, contexto RAG, trazabilidad)
   ▼
Agentes
   │  (Agente Científico Principal + sub-agentes coordinan la respuesta)
   ▼
Usuario
   (texto · voz · asistentes externos · APIs · automatización)
```

**Reglas de flujo:**
1. El flujo es **unidireccional en el tiempo** pero **circular en el conocimiento**: una interpretación IA puede retroalimentar un nuevo modelado (medir → interpretar → actuar → volver a medir).
2. **Cada eslabón deja evidencia.** Nada se transforma sin huella (invariante de trazabilidad).
3. **El CMSC no es un stock:** no almacena datos muertos; procesa y conecta. La persistencia la gobierna el backend/Telemetry Context; el CMSC consume y produce análisis.
4. **Etiquetado honesto en cada eslabón:** `real / sim / referencia / diseño`.

---

## 4. Laboratorio de Análisis Espectral (pendiente estratégico)

### 4.1 Origen
Este laboratorio es un **pendiente estratégico abierto** motivado por el **Hackathon actual**. El ecosistema ya produce y consume señales (WebAudio FFT en Telecom, señales de electrónica, telemetría), pero **no existe un espacio científico unificado de análisis espectral**. El CMSC lo incorpora como primer hito de capacidad diferenciadora.

### 4.2 Técnicas núcleo

| Técnica | Señal aplicable | Ejemplos de uso en SIGCTiArural |
|---|---|---|
| **FFT** (Transformada Rápida de Fourier) | eléctrica, acústica, vibratoria | espectro de señal de electrónica, armónicos de red, tonos de telecom |
| **STFT** (Short-Time Fourier Transform) | no estacionaria | evolución temporal de la frecuencia (vibración de motor, habla) |
| **Wavelets** | transitoria, multi-resolución | picos de ECG/EEG, detección de transitorios RF — ya presente en Dr. Binary |
| **Espectrogramas** | audio/visualización | representación tiempo-frecuencia de grabaciones (WebAudio, WebSDR) |
| **Bioacústica** | audio natural | detección de vocalizaciones animales, diagnóstico acústico de salud animal (línea UBTN/CA) |
| **RF** | radiofrecuencia | espectro de WebSDR, análisis de enlace LoRa/WiFi, interferencias |
| **Audio** | sonido | reconocimiento de voz (VAD), eventos acústicos, ruido industrial |
| **Vibraciones** | mecánica | firmas de vibración de actuadores (Robótica), diagnóstico de motores |

### 4.3 Relación con el Hackathon
- El Hackathon actual es la **semilla de validación**: los participantes trabajan sobre señales reales del ecosistema (voz, espectro, telemetría) y sus resultados se convierten en **primeros módulos candidatos** del Laboratorio de Análisis Espectral.
- Condición: todo material del Hackathon que migre al CMSC entra por **gate de gobernanza** (honestidad de estado, trazabilidad, sin romper la triada Modelo→Simulación→Interpretación).

### 4.4 Estado
**PENDIENTE ESTRATÉGICO** — documentado y priorizado, **no implementado**. Su backlog vive aquí y en la familia UBTN (Research Backlog: audio/signals). No se inicia sin gate de aprobación explícito.

---

## 5. Arquitectura Multiagente

### 5.1 Agente Científico Principal
El CMSC es coordinado por el **Agente Científico Principal (ACP)** — el orquestador que recibe la consulta del usuario (texto, voz, API o automatización), la descompone y delega a los sub-agentes especializados, y consolida la respuesta con evidencia.

### 5.2 Sub-agentes especializados

| Agente | Dominio | Responsabilidad |
|---|---|---|
| **Agente Matemático** | modelado formal | selecciona el modelo (serie, transformada, ecuación), lo ejecuta y explica el porqué matemático |
| **Agente Física** | fenómenos | traduce la señal a fenómeno físico (onda, resonancia, temperatura), valida unidades y márgenes |
| **Agente Electrónica** | acondicionamiento | interpreta el circuito/etapa de adquisición (filtros, ADC, ganancia) que produjo la señal |
| **Agente Señales** | análisis espectral | aplica FFT/STFT/wavelets/espectrograma y devuelve features (frecuencia dominante, energía, picos) |
| **Agente IA** | interpretación | corre la inferencia/con modelo, reporta confianza y class/patrón detectado |
| **Agente Investigación** | conocimiento | consulta el Knowledge Hub (RAG), cita documentos oficiales y enlaza la evidencia al expediente/proyecto |

### 5.3 Reglas de coordinación (gobernanza de agentes)

1. **El ACP nunca inventa:** toda respuesta del ACP combina al menos un output de un sub-agente con un ancla documental.
2. **Confianza explícita:** si el Agente IA responde, la `confidence` se muestra siempre; si no hay inferencia, se muestra `—` (regla de honestidad).
3. **Traza de agente:** cada sub-agente introduce una línea de trazabilidad (`AGENTE: señales → FFT → f0=24.3 Hz · FUENTE: lab-telecom`).
4. **Fallback agnóstico:** ningún agente depende de un LLM concreto (ver §6). Si un proveedor no está disponible, otro asume el mismo rol de interfaz (patrón agnóstico).
5. **Sin estado duplicado:** los agentes leen stores/pipelines existentes (`useLabStore`, `fetchTelemetry*`, registry KH) — no crean copias de datos.

---

## 6. Sistema agnóstico (hardware, software y LLM)

El CMSC se diseña bajo **agnosticismo estricto**, heredado del principio P4 de identidad (`docs/SIGCTIARURAL_VISION_ALIGNMENT.md`):

### 6.1 Hardware agnóstico
- La capacidad se expresa por **rol** (gateway, inferencia, adquisición, sensor), no por marca/modelo (BBB-01/02/03 quedan como *instancias*, jamás como identidad).
- El CMSC consume señales desde cualquier fuente: BBB, ESP32, Arduino, Raspberry, Jetson, FPGA, Mini PC, sensores UBTN.
- El modelo de aprendizaje por hardware (`SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md`) sigue siendo la referencia; el CMSC es su intérprete.

### 6.2 Software agnóstico
- El cómputo del CMSC usa **estándares abiertos**: numpy/scipy/numba (Python), Pyodide en navegador, contratos JSON/CSV para señales, REST/SSE para flujo.
- Sin dependencia funcional de software propietario. Los módulos pueden correr en el navegador, en el backend o en el borde, según disponibilidad.

### 6.3 LLM agnóstico
- La capa de lenguaje del ACP es una **interfaz** (protocolo), no una implementación.
- Compatible con proveedores de forma intercambiable:
  - **Open Source** (local: llama.cpp, Ollama, HF Transformers)
  - **Modelos Locales** (self-hosted, Mini PC / Jetson)
  - **Modelos Cloud** (API externa opcional)
- **Regla:** ningún despliegue debe *requerir* un proveedor cloud obligatorio. El runtime mínimo es local/self-hosted. La elección se configura por entorno, no se hardcodea.

### 6.4 Consecuencia de diseño
Cualquier módulo del CMSC que **dependa obligatoriamente de un proveedor, una marca o un SDK cerrado** se rechaza en la auditoría de gobernanza del CMSC.

---

## 7. Interacción futura

El CMSC debe ser alcanzable por múltiples superficies, todas orquestadas por el ACP:

| Superficie | Descripción | Estado esperado |
|---|---|---|
| **Texto** | Consultas escritas ("analiza el espectro de la señal B", "¿qué frecuencia domina?") | Voz/routeMap ya existen; el CMSC extiende el comando a científicos |
| **Voz** | Asistente de voz (ya existe `VoiceAssistant.jsx` + `routeMap`) ampliado al vocabulario del CMSC | ampliación aditiva (nunca reducción) |
| **Asistentes externos** | Integración con agentes/chatbots externos vía API (patrón agnóstico LLM) | futuro, tras gate |
| **APIs** | Endpoints REST/SSE para que el CMSC sea consumible por el backend, labs y herramientas | futuro, tras gate |
| **Automatización** | Pipelines que disparan análisis automáticos al recibir señal (ej. nueva telemetría → espectro → inferencia → evidencia) | futuro, tras gate |

---

## 8. Roadmap

Cuatro fases, cada una con gate de aprobación explícito, sin implementación previa a la orden.

### Fase 1 — Fundamentación del CMSC (visión formalizada)
- ✅ Documentación canónica (`CMSC_MASTERPLAN_v1.md`) que consolida la identidad del centro.
- Formalizar el rol del lab actual de matemáticas como **núcleo** del CMSC (preservación + evolución de Dr. Binary).
- Mapa de señales del ecosistema: qué señales existen hoy (telemetría, electrónica, telecom, robótica) y qué análisis se les puede aplicar ya con las herramientas actuales.
- **Gate F1:** roadmap revisado por el dueño (Bernardo) e identidad CMSC aceptada.

### Fase 2 — Cimientos del Laboratorio de Análisis Espectral
- Diseñar el laboratorio espectral (4.2) como **primera capacidad diferenciadora** del CMSC, alimentado por el Hackathon.
- Inventario de técnicas y módulos candidatos (FFT/STFT/wavelets/espectrograma) reutilizando WebAudio, `useLabStore` y consola Pyodide — sin backend nuevo.
- Borrador de la arquitectura multiagente (contrato ACP ↔ sub-agentes, sin implementación).
- **Gate F2:** selección de los primeros módulos por prioridad y aprobación de diseño.

### Fase 3 — Integración horizontal
- Conectar el CMSC al **flujo continuo de datos** (3): telemetría real entra al centro, produce evidencia espectral, la evidencia enlaza al Knowledge Hub.
- Implementación piloto de un sub-agente completo (Agente Señales → FFT → features → KH) sobre una señal del sistema.
- Data Science y Telemetría anclados al CMSC (cierre de GLC-06).
- **Gate F3:** una señal real recorriendo el flujo completo de forma trazable y honesta.

### Fase 4 — Multiagente y superficies de interacción
- ACP funcional orquestando los 6 sub-agentes con ancla documental.
- Superficies: texto + voz funcionales; APIs y automatización bajo diseño.
- Consulta de conocimiento (RAG sobre Knowledge Hub) integrada a la respuesta del ACP.
- **Gate F4:** CMSC estable = candidato a servir como núcleo navegable y a dockerizarse (siempre tras aprobación).

> Los avances del **Hackathon actual** pueden acelerar el ingreso de módulos en Fase 2; la aceleración no elude los gates de gobernanza.

---

## 9. Relación con documentos canónicos existentes

| Documento | Relación con el CMSC |
|---|---|
| `docs/SIGCTIARURAL_VISION_ALIGNMENT.md` | Identidad rectora (P2 labs comunicados, P4 agnosticismo, P6 trazabilidad) |
| `docs/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` | El CMSC es el eslabón Matemáticas/Física del grafo; cierra GLC-01 parcialmente (Física) y GLC-06 (DataScience) |
| `docs/SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md` | Spec visual donde el CMSC es la representación de la cadena de conocimiento |
| `docs/SIGCTIARURAL_RESEARCH_EXPERIMENTATION_LAYER.md` | Primitivas de investigación (expediente, experimento, señal, modelo) que el CMSC consume/produce |
| `Documentacion/Arquitectura/FRONTEND_EXECUTION_STRATEGY.md` | Puerto/rol del frontend (5173 legacy / 5174 evolución) donde el CMSC vivirá |
| `docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md` | Estado real de la IA que el CMSC interpreta (modelo binario, benchmark M1/M2, gates) |
| `docs/UBTN_LAB_INTEGRATION.md` | Bioacústica/bioseñal como fuente de señal del CMSC (gated por diseño UBTN) |
| `docs/SIGCTIARURAL_PRESERVATION_STRATEGY.md` | Regla suprema: el lab de matemáticas se preserva dentro del CMSC, nada desaparece |

---

## 10. No-regresión (qué NO rompe el CMSC)

1. El lab actual de matemáticas (rutas `/advanced-math`, `/advanced-math-v2`, componentes Dr. Binary) **se preserva íntegro**; el CMSC lo envuelve conceptualmente, no lo sustituye en su versión actual.
2. Backend, Docker, Telemetry Context, `SensorReading`/`RobotTelemetry`, BBB, Knowledge Hub e IA existente **no se modifican** por este documento.
3. No se crean stores, rutas ni endpoints en esta fase de diseño.
4. El vocabulario honesto (`real/sim/referencia/diseño`, `source_mode`, `confidence`, `fase`) se respeta en todo análisis.
5. Se mantiene la prohibición de "dashboard IoT genérico": el CMSC NO es un conjunto de tiles de nodos; es un centro de análisis con modelo científico.

---

## 11. Conclusión

El laboratorio de matemáticas de SIGCTiArural deja de ser una herramienta aislada y se convierte en el **Centro de Modelado, Simulación y Ciencias Computacionales (CMSC)**: el corazón científico donde la señal del ecosistema se modela, se simula y se interpreta, con evidencia trazable que conecta sensores, telemetría, matemáticas, señales, IA, conocimiento, agentes y usuario.

El CMSC es agnóstico (hardware/software/LLM), multiagente (ACP + 6 sub-agentes), honesto (estados reales) y aditivo (**nada se elimina, todo se conecta, todo evoluciona**).

**Pendiente estratégico:** Laboratorio de Análisis Espectral (FFT, STFT, Wavelets, Espectrogramas, Bioacústica, RF, Audio, Vibraciones), resultado del Hackathon actual — documentado y priorizado en Fase 2, sin implementación.

---

*Honestidad de estado: documento de DISEÑO v1. Cero código implementado. El CMSC es la visión oficial; su materialización requiere gates de aprobación explícitos (F1→F4).*