# SIGCTiArural · CMSC — Estado Canónico (Punto de Recuperación Definitivo)

> **Categoría:** Documentación canónica de arquitectura · Consolidación de la iniciativa CMSC.
> **Versión:** v1.0 | **Fecha:** 2026-09-25 · **Rama:** `feature/ubtn-biological-telemetry` · **HEAD:** `18b95b1`
> **Tipo:** CONSOLIDACIÓN CANÓNICA — SOLO DOCUMENTACIÓN. **No implementar · no modificar código/frontend/backend/notebooks · no refactors · no commits.**
> **Rol:** Este documento es el **documento principal de recuperación** de la iniciativa CMSC. Cualquier IA, desarrollador o Bernardo debe leerlo para retomar exactamente el mismo punto sin volver a investigar nada.

---

## 1. Resumen ejecutivo

**Qué es el CMSC.** El CMSC — **Centro de Modelado, Simulación y Ciencias Computacionales** — es la transformación conceptual del laboratorio de matemáticas ("Dr. Binary") de una herramienta aislada al **núcleo científico del ecosistema SIGCTiArural**: el espacio donde toda señal (telemetría, electrónica, telecomunicaciones, robótica, audio, bioacústica, imágenes) se **modela matemáticamente, se simula en computador, se analiza espectralmente y se interpreta con IA**, dejando evidencia trazable que alimenta el Knowledge Hub y — vía agentes — llega al usuario.

**Por qué existe.** SIGCTiArural **no es agricultura, no es un dashboard, no es una calculadora**: es Ciencia, Tecnología, Investigación, IA, IoT, Telemetría, Educación y Conocimiento (`docs/SIGCTIARURAL_VISION_ALIGNMENT.md`). El CMSC es la expresión estructural de esa identidad: matemáticas como **centro de modelado**, no como calculadora.

**Cómo transforma el laboratorio actual.**
- El laboratorio actual (**`AdvancedMathLab.jsx` / `AdvancedMathLabV2.jsx`**, series de Fourier, Laplace, wavelets, phase portraits) **se preserva íntegro** y se convierte en el **eslabón Matemáticas** del flujo del ecosistema.
- La transformación es **envolvente y aditiva**: el CMSC organiza el acceso y el encadenamiento hacia Señales → IA → Knowledge Hub → Agentes; **no reimplementa** las matemáticas existentes.
- Pilar rector heredado: **triada Modelo → Simulación → Interpretación** y **NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.**

**Estado global de la iniciativa:** Fases **F1 y F2 completadas** (documental), **F3 y F4 pendientes** (integración + multiagente). Cero código implementado. Ver §11.

---

## 2. Estado actual del proyecto

### 2.1 Frontend Legacy — 5173
- **Frontend Dockerizado** (`sigctiarural_frontend`, imagen 22-ago-2026, nginx, build congelado).
- Contenido: Dashboard Científico Edge, MQTT, BBB, TFLite, Telemetría histórica.
- **NO representa el estado actual del frontend.** Uso: comparaciones, baseline visual, validaciones retrospectivas.

### 2.2 Frontend Nuevo — 5174
- **Vite Dev Server local** (HMR, `--strictPort`, puerto 5174), fuente actual de desarrollo en `src/frontend/src`.
- Contenido: Dashboard en evolución, Hardware, Proyectos, Conocimiento, Laboratorios, IA Predictiva, Knowledge Hub.
- Representa la **dirección estratégica**.
- `ERR_CONNECTION_REFUSED` en 5174 = Vite apagado (sin proceso), **nunca** un bug de la app.
- Arranque (Variante A, sin tocar el repo): `Set-Location "src\frontend"; npm install --legacy-peer-deps; npm run dev -- --port 5174 --strictPort`.

### 2.3 M2 ejecutado oficialmente (corrida completada 2026-09-27)
- **M2 (EfficientNet-B0)** **EJECUTADO OFICIALMENTE** en Colab T4 con Dataset V2+ real: auditado, corregido (gráficos/persistencia/torch.amp), **RAM fix aplicado** (num_workers=0 / pin_memory=False / plt.close(fig)×6), smoke-test 19/19 OK.
- **Resultados oficiales:** macro-F1 **0.9937** · Balanced Accuracy **0.9943** · ECE **0.0332** · Weighted-F1 **0.9956** · best epoch **32** · duración **≈ 4.66 h**.
- **Conclusiones del run:** ✅ RAM fix validado · ✅ benchmark/src fallback validado · ✅ smoke test validado · ✅ validation gates PASS (macro-F1 ≥ 0.955 · ECE ≤ 0.10).
- **Estado:** **M2 = CHALLENGER VALIDADO** · **M1 = BASELINE OFICIAL** · **decisión benchmark final PENDIENTE** (P4).
- **Pendiente documental:** el RAM fix del notebook `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` **NO está committeado** (working tree). Commitear solo con orden.
- **Nota honesta:** los artefactos M2 (`runs/M2_efficientnet_b0/`: config.json, validation_metrics.json, M2_VS_M1.json/.md, best/last.pth, metrics.csv, PNG) residen en el entorno de corrida (Drive/Colab); si no están aún devueltos al repo, la recopilación física es tarea pendiente. Los **resultados numéricos ya son oficiales y están registrados** en `ESTADO_ACTUAL_BENCHMARKS.md`.

### 2.4 Benchmark vigente
- **Dataset V2+** recuperado y validado: 22.488 imágenes / 16 clases / 3 especies (tomate-papa-maíz), split 15.741/3.373/3.374, seed 42. **Congelado.**
- **M1 (MobileNetV2) = BASELINE OFICIAL**: macro-F1 0.9899 · ECE 0.0313 · balanced_acc 0.9898. **Aprobado y congelado** — no se re-entrena. Sin artefactos reconstruibles en disco (número documentado, corrida no reconstruible desde Git).
- **M2 (EfficientNet-B0) = CHALLENGER VALIDADO**: ejecutado oficialmente (2026-09-27) — macro-F1 0.9937 · balanced_acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · best epoch 32 · ≈4.66 h. **Decisión benchmark final pendiente** (M1 vs M2).
- **Modelo productivo `plant_disease_mbv2.h5`** (runtime, binario enferma/sana): **degenerado** — colapsa a `class_0` con confianza ~0.99 incluso ante entradas no vegetales (severidad crítica auditada). Toda inferencia real reporta `health_state:"warning"`.

### 2.5 Knowledge Hub
- **Implementado parcial (real):** visor documental navegable en el frontend nuevo (`/knowledge`, `/knowledge/doc/:docId`), **51 documentos** en registry, de los cuales **18** son `research_v2`, agrupados en 6 categorías vía `import.meta.glob` (build) + `knowledgeRegistry.generated.json`.
- **No existe aún:** búsqueda full-text, índice semántico, RAG, grafo de relaciones, timeline, control de versiones, registro de consultas.

### 2.6 Estado documental (working tree, 2026-09-25, sin commits)
- **Modificados:** `AGENTS.md`, `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md`, `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` (RAM fix).
- **Nuevos (sin commitear):** `Documentacion/IA/AUDITORIA_BENCHMARK_SRC_FALLBACK.md`; `Documentacion/Arquitectura/` con `FRONTEND_EXECUTION_STRATEGY.md`, `CMSC_MASTERPLAN_v1.md`, `CMSC_SIGNAL_MAP_v1.md`, `CMSC_UI_ARCHITECTURE_v1.md`, `CMSC_CANONICAL_STATE_v1.md` (este documento).
- **Runtime (2026-09-25):** `postgres` Up · `backend` Up 8010 · `ai_service` Up 8081 · `frontend` Up 5173 (legacy) · Vite 5174 activo.

---

## 3. Documentos canónicos

| Documento | Propósito | Estado | Dependencias |
|---|---|---|---|
| `CMSC_CANONICAL_STATE_v1.md` | **Punto de recuperación definitivo de la iniciativa CMSC** (este documento) | v1 · consolidado | todos los demás |
| `CMSC_MASTERPLAN_v1.md` | Visión e identidad del CMSC (núcleo científico; agnosticismo; multiagente; roadmap F1-F4) | v1 · diseño | VISION_ALIGNMENT, LAB_CONNECTIVITY_MODEL |
| `CMSC_SIGNAL_MAP_v1.md` | Inventario total de señales del ecosistema (S01..S80); prerrequisito para NO refactorizar el lab matemático | v1 · diseño | MASTERPLAN §4 |
| `CMSC_UI_ARCHITECTURE_v1.md` | Arquitectura visual/funcional del dashboard CMSC (experiencia de usuario, sin tocar componentes) | v1 · diseño | MASTERPLAN + SIGNAL_MAP |
| `FRONTEND_EXECUTION_STRATEGY.md` | Coexistencia de frontends (5173 legacy Docker vs 5174 evolución); estrategia de ejecución | v1 · validado | hallazgo 2026-09-25 |
| `AUDITORIA_BENCHMARK_SRC_FALLBACK.md` | Auditoría del fallback inline del notebook M2 vs `benchmark/src` (equivalencia AST + numérica; riesgo NULO) | v1 · auditado | `benchmark/src`, notebook M2 |
| `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` | Continuidad consolidada del programa IA/ML (M1/M2, dataset, plan P1-P4) | vigente | benchmark, notebook M2 |
| `AGENTS.md` | Estado del proyecto, reglas de gobernanza y cómo retomar | vigente | — |
| (`docs/`) `SIGCTIARURAL_VISION_ALIGNMENT.md`, `SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md`, `SIGCTIARURAL_RESEARCH_EXPERIMENTATION_LAYER.md`, `SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md`, familia `UBTN_*`, `docs/ai/research_v2/` (18), `docs/ai/manifests/` | Anclas de identidad, conectividad de labs, capa de investigación, hardware, UBTN, programa IA | históricas/vigentes | — |

---

## 4. Visión consolidada CMSC

- **El CMSC es el núcleo científico del ecosistema**, NO una calculadora, NO un lab aislado, NO un widget de gráficas.
- **El CMSC NO es** un dashboard IoT genérico (prohibido por identidad); es un **centro de análisis con modelo científico**.
- **Bien central:** la **señal** (eléctrica, acústica, biométrica, ambiental, RF). El CMSC no inventa datos: los recibe, los modela y los interpreta.
- **Pipe tríadico invariante:** **Modelo → Simulación → Interpretación**. Cualquier funcionalidad fuera de la triada se descarta.
- **Principios:** C1 señal como bien central · C2 triada · C3 nada se elimina · C4 agnosticismo total · C5 evidencia trazable · C6 honestidad de estado (`real / sim / referencia / diseño`).
- **Flujo canónico:** `Sensores → Telemetría → Matemáticas → Señales → IA → Knowledge Hub → Agentes → Usuario`.
- **Reglas de flujo:** unidireccional en el tiempo, circular en conocimiento; cada eslabón deja evidencia; el CMSC no es un stock; etiquetado honesto en cada eslabón.
- **Prohibición explícita:** el lab de matemáticas (Dr. Binary) **se preserva**; el CMSC lo envuelve. No se refactoriza sin plano maestro (ver §10).

---

## 5. Mapa de señales (resumen ejecutivo de `CMSC_SIGNAL_MAP_v1.md`)

- **Número de señales:** **80** (S01..S80), inventario total del ecosistema.
- **Tipos (12 clases):** Físicas, Digitales, Lógicas, Biológicas, Acústicas, Espectrales, RF, Mecánicas/vibración, Imágenes (visión), Matemáticas, Documentales, IA (interpretación).
- **Dominios cubiertos:** Dashboard, Telemetría, Hardware/IoT, Labs, Robótica, AI Service, Benchmark/Dataset, Investigación.
- **Hallazgos clave (honestidad):**
  - **Solo 2 señales reales persistentes hoy:** tempery humedad V3 (`SensorReading`, PostgreSQL) y `RobotTelemetry` (batería/modo/XYZ/velocidad).
  - El **micrófono Telecom** = única señal acústica real con DSP local (WebAudio/FFT en navegador).
  - **Señales simuladas:** V1/V2 sintético, `physics_sim.py` (trayectoria helicoidal), estrategias backend (agricultura/robótica/telecom/electrónica), Falstad/solver de circuitos, Dr. Binary (series/transformadas), escenarios IA demo (conf 0.97/0.96).
  - **Señales de diseño (0% código):** UBTN completo (canales BODY_TEMP/HR/RR/SpO2/ECG/PPG/IMU/colmena...), MQTT, object storage, firmware BBB/ESP32.
  - **Modelos reales:** `plant_disease_mbv2.h5` (degenerado); **M1** baseline 16 clases (aprobado, no desplegado); **M2** EJECUTADO OFICIALMENTE (challenger validado, no desplegado); series (Prophet/ARIMA/LSTM/TCN/TFT), audio/bioacústica (CNN/CRNN), salud animal (XGBoost/LSTM) = **diseño**.
  - **Oportunidades documentadas por señal:** predicción, clasificación, correlación, anomalías, modelado matemático (mapa §6).
- **Prerrequisito:** sin el plano maestro de señales **NO iniciar refactorización del laboratorio matemático**.

---

## 6. Arquitectura visual (resumen ejecutivo de `CMSC_UI_ARCHITECTURE_v1.md`)

Experiencia del **Dashboard CMSC** sobre el frontend en evolución (5174). **Solo arquitectura de experiencia; no toca componentes actuales.** Rutas de diseño:

| Vista | Ruta de diseño | Contenido |
|---|---|---|
| **Dashboard principal CMSC** | `/dashboard-cmsc` | resumen del río científico, señales vivas con badge honesto, última evidencia, termómetro de honestidad |
| **Vista de señales** | `/cmsc/senales` | catálogo vivo S01..S80, filtros por tipo/dominio/estado, ficha por señal (origen/destino/frecuencia/contexto/labs/modelos) |
| **Vista espectral** | `/cmsc/espectral` | Laboratorio Análisis Espectral: FFT, STFT, Wavelets, Espectrogramas, Bioacústica, RF, Vibraciones, Imágenes en frecuencia, Telemetría en frecuencia |
| **Vista matemática** | `/cmsc/matematica` | matemáticas como centro de modelado; envuelve a Dr. Binary (no reimplementa) |
| **Vista IA** | `/cmsc/ia` | inferencia (contrato EIARC + confidence + source_mode), mapa modelo→señal, estado benchmark, honestidad del modelo degenerado |
| **Vista Knowledge Hub** | `/cmsc/knowledge` | KH real (51 docs) como destino de evidencia; búsqueda/RAG/grafo marcados como futuro |
| **Vista ACP** | `/cmsc/acp` | consola de consulta multimodal + panel de orquestación multiagente (traza de agente) — marcado DISEÑO |

- **Layout huésped común:** TopNav existente + **Cinta del río científico** (Sensores›Telemetría›Matemáticas›Señales›IA›KH›Agentes›Usuario) + panel principal + **panel de evidencia** (señal originante · estado honesto · técnicas · modelos · anclas KH · traza).
- **Experiencias texto y voz:** barra de consulta científica con intents (señal/espectro/frecuencia/temperatura/modelo/lab); voz preserva `VoiceAssistant.jsx` actual y al fallback agnóstico; fallback actual preservado si el ACP no responde.
- **Código de estado visual:** REAL = sólido cian/verde · SIM = punteado · REF = ícono libro · DISEÑO = difuminado + "pendiente".
- **Guardarraíl:** ningún archivo de `src/frontend/src/**` se modifica por este diseño (solo envoltura de UX futura, con gates).

---

## 7. Arquitectura multiagente

### 7.1 Definición
El CMSC es coordinado por el **Agente Científico Principal (ACP)**: orquestador que recibe la consulta (texto/voz/API/automatización), la descompone, delega a los 6 sub-agentes y consolida la respuesta con evidencia.

### 7.2 Sub-agentes y responsabilidades
| Agente | Dominio | Responsabilidad | Alimentado por vista |
|---|---|---|---|
| **Agente Matemático** | modelado formal | selecciona el modelo (serie/transformada/ecuación), lo ejecuta, explica el porqué | Vista matemática |
| **Agente Física** | fenómenos | traduce la señal a fenómeno físico, valida unidades/márgenes | Vista de señales |
| **Agente Electrónica** | acondicionamiento | interpreta la etapa de adquisición (filtros/ADC/ganancia) que produjo la señal | Vista de señales |
| **Agente Señales** | análisis espectral | aplica FFT/STFT/wavelets/espectrograma; entrega features (f0, energía, picos) | Vista espectral |
| **Agente IA** | interpretación | corre inferencia con modelo, reporta confidence y clase/patrón | Vista IA |
| **Agente Investigación** | conocimiento | consulta Knowledge Hub (RAG), cita documentos, enlaza evidencia | Vista Knowledge |

### 7.3 Contratos de gobernanza
1. **El ACP nunca inventa:** toda respuesta combina un output de sub-agente con ancla documental.
2. **Confianza explícita:** `confidence` siempre visible; si no hay inferencia → `—`.
3. **Traza de agente:** `AGENTE: señales → FFT → f0=24.3 Hz · FUENTE: lab-telecom`.
4. **Fallback agnóstico:** sin dependencia de un LLM concreto.
5. **Sin estado duplicado:** los agentes leen stores/pipelines existentes (`useLabStore`, `fetchTelemetry*`, registry KH).
6. **Contrato de evidencia (futuro):** `señal_id → origen → técnica → modelo → resultado → confidence → ancla KH → traza`.

### 7.4 Estado actual vs futuro
- **Estado actual (2026-09-25):** **diseño puro, 0% código.** No existe clase/registry/router/colas/memoria/RAG del ACP ni de sub-agentes ni orquestación voz → agentes. Los agentes no están conectados a ningún endpoint.
- **Estado futuro:** borrador multiagente en **F2** (completada en documental) como contrato; **piloto de 1 sub-agente en F3**; **ACP funcional en F4** (integración con superficies texto/voz).

---

## 8. Laboratorio de Análisis Espectral

### 8.1 Declaración oficial
**PENDIENTE ESTRATÉGICO** — documentado y priorizado, **NO implementado**. Es la primera capacidad diferenciadora del CMSC y la semilla del **Hackathon actual**.

### 8.2 Origen
Motivado por el Hackathon actual: el ecosistema ya produce y consume señales (WebAudio FFT en Telecom, señales de electrónica, telemetría), pero **no existe un espacio científico unificado de análisis espectral**. El CMSC lo incorpora como hito de capacidad.

### 8.3 Alcance (técnicas núcleo)
| Técnica | Señal aplicable | Uso en SIGCTiArural |
|---|---|---|
| **FFT** | eléctrica, acústica, vibratoria | micrófono Telecom (S30), telecom sintética (S34), trayectoria robot (S51) |
| **STFT** | no estacionaria | audio/VAD, señales fisiológicas UBTN (S20) → espectrograma |
| **Wavelets** | transitoria, multi-resolución | ECG/EEG (S21, diseño), transitorios RF — ya en Dr. Binary (S35) |
| **Espectrogramas** | audio/visualización | WebAudio, WebSDR (S31) |
| **Audio** | sonido | reconocimiento de voz (VAD), eventos acústicos |
| **RF** | radiofrecuencia | WebSDR (S31), enlace LoRa/WiFi (S34) |
| **Bioacústica** | audio natural | vocalizaciones de bovinos/porcinos/aves/abejas (research_v2 Audio, diseño) |
| **Vibraciones** | mecánica | firmas de actuadores (Robótica), IMU UBTN (S21) |
| (+ expansión) **Imágenes en frecuencia** / **Telemetría en frecuencia** | imagen 2D / serie temporal | textura de hojas (S60) · periodograma/PSD de temp/humedad y robot (S10/S11/S50) |

### 8.4 Condición de ingreso
Todo material del Hackathon que migre al CMSC entra **por gate de gobernanza**: honestidad de estado, trazabilidad y respeto de la triada Modelo→Simulación→Interpretación.

---

## 9. Sistema agnóstico

El CMSC se diseña bajo **agnosticismo estricto** (principio P4 de identidad):

| Eje | Principio obligatorio |
|---|---|
| **Hardware** | Capacidad expresada por **rol** (gateway/inferencia/adquisición/sensor), no por marca. BBB-01/02/03 = instancias, jamás identidad. Consume señales desde BBB, ESP32, Arduino, Raspberry, Jetson, FPGA, Mini PC, sensores UBTN |
| **Software** | Cómputo sobre estándares abiertos: numpy/scipy/numba, Pyodide (navegador), contratos JSON/CSV, REST/SSE. Sin dependencia funcional de software propietario; ejecutable en navegador, backend o borde |
| **LLM** | La capa de lenguaje del ACP es una **interfaz (protocolo)**, no implementación. Compatible intercambiablemente con **Open Source** (Ollama, Hugging Face), **modelos locales/self-hosted**, y **modelos cloud** opcionales |
| **Cloud / Local / Open Source** | **Ningún despliegue debe requerir un proveedor cloud obligatorio.** Runtime mínimo = local/self-hosted. La elección se configura por entorno, no se hardcodea |
| **Rechazo** | Cualquier módulo del CMSC que dependa obligatoriamente de un proveedor, marca o SDK cerrado **se rechaza** en la auditoría de gobernanza |

---

## 10. Lo que NO debe hacerse (hasta completar fases previas)

**Prohibido tocar / implementar hoy** (todo requiere gate + orden explícita):

| Acción | Por qué |
|---|---|
| **Refactorizar laboratorios** | Regla de la misión: sin el plano maestro de señales (`CMSC_SIGNAL_MAP_v1.md`) NO se refactoriza el laboratorio matemático |
| **Tocar `AdvancedMathLab` / `AdvancedMathLabV2`** | El CMSC los **preserva**; las matemáticas actuales (Dr. Binary) se envuelven, no se sustituyen. NADA DESAPARECE |
| **Implementar ACP** | Es 0% código y está en fase de diseño (contrato de UI especificado). Gate F4 |
| **Implementar multiagente** | Igual que ACP: contrato de gobernanza definido, cero implementación. Gate F4 |
| (general) **Backend, Docker, Telemetry Context, SensorReading/RobotTelemetry, BBB, Knowledge Hub, IA existente** | Prohibidos por regla suprema del proyecto (AGENTS.md) |

**Orden de ejecución respetada:** F1 (visión) ✅ → F2 (mapa + UI + estado canónico) ✅ → F3 (integración horizontal, 1 piloto de sub-agente) ⬜ → F4 (ACP + superficies) ⬜ → luego dockerización del frontend e imágenes.

---

## 11. Gates

| Fase | Contenido | Estado |
|---|---|---|
| **F1 — Fundamentación del CMSC** | `CMSC_MASTERPLAN_v1.md` (visión oficial, identidad, princípios) | ✅ **completado** |
| **F2 — Mapa y arquitectura** | `CMSC_SIGNAL_MAP_v1.md` (inventario S01..S80) + `CMSC_UI_ARCHITECTURE_v1.md` (experiencia) + `CMSC_CANONICAL_STATE_v1.md` (recuperación) | ✅ **completado** |
| **F3 — Integración horizontal** | Vista de señales funcional + Lab Análisis Espectral + piloto 1 sub-agente (Señales → FFT → features → KH) sobre una señal real | ⬜ **pendiente** |
| **F4 — Multiagente y superficies** | ACP funcional + 6 sub-agentes + texto/voz/API/automatización + Vista IA + Vista Knowledge conectadas | ⬜ **pendiente** |

**Regla:** ningún gate se abre sin aprobación y sin orden explícita de Bernardo. Todo avance respeta honestidad de estado.

---

## 12. Punto exacto de recuperación

### 12.1 Si mañana (o en una semana / un mes / seis meses) se retoma

**Primer documento a leer (siempre):**
1. **`Documentacion/Arquitectura/CMSC_CANONICAL_STATE_v1.md`** (este documento) = punto único de entrada a la iniciativa CMSC y al estado del proyecto.
2. `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` = continuidad del programa IA/ML (P1-P4) si la tarea es IA.
3. `Documentacion/Arquitectura/FRONTEND_EXECUTION_STRATEGY.md` = **si la tarea toca frontend** (5173 vs 5174, nunca confundir).

**Documentos a abrir por área (orden de profundidad):**
- **IA/ML:** `ESTADO_ACTUAL_BENCHMARKS.md` → `AUDITORIA_BENCHMARK_SRC_FALLBACK.md` → `CMSC_MASTERPLAN_v1.md` §7/§9.
- **Arquitectura CMSC:** `CMSC_MASTERPLAN_v1.md` → `CMSC_SIGNAL_MAP_v1.md` → `CMSC_UI_ARCHITECTURE_v1.md` → (este documento ya leído).
- **Frontend:** `FRONTEND_EXECUTION_STRATEGY.md` → rutas reales en `src/frontend/src/App.jsx`.
- **Identidad/labs:** `docs/SIGCTIARURAL_VISION_ALIGNMENT.md` → `docs/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` → `docs/SIGCTIARURAL_RESEARCH_EXPERIMENTATION_LAYER.md`.

### 12.2 Decisiones ya tomadas (NO volver a discutir)
- El lab de matemáticas = **núcleo del CMSC**; Dr. Binary **se preserva** íntegro.
- **M1 = baseline oficial congelado** (macro-F1 0.9899 · ECE 0.0313 · balanced_acc 0.9898); no se re-entrena.
- **Dataset V2+ congelado** (22.488/16/3, split 15.741/3.373/3.374, seed 42).
- **M2 (EfficientNet-B0) = CHALLENGER VALIDADO**: EJECUTADO OFICIALMENTE (2026-09-27), política canónica + correcciones G + RAM fix (validado) — macro-F1 0.9937 · balanced_acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · best epoch 32 · ≈4.66 h · validation gates PASS.
- **5173 = legacy referencia · 5174 = evolución activa.** Nunca implementar ni corregir el legacy.
- El **modelo productivo está degenerado** (colapsa class_0) → no se presenta como válido sin honestidad.
- **Solo 2 señales reales persistentes** (V3 temp/hum y RobotTelemetry); el resto es simulación/diseño — descrito en el mapa de señales.
- **ACP/multiagente = diseño puro**; sin implementación hasta F4.
- **Lab Análisis Espectral = pendiente estratégico** (semilla Hackathon); sin implementación hasta F3.
- **Agnosticismo total** (HW/SW/LLM): sin dependencia obligatoria de proveedor.
- **UBTN = 100% diseño** (0% código).

### 12.3 Qué NO debe volver a discutirse / revisitarse
- La **arquitectura del lab de matemáticas**: no refactorizar (se preserva por regla supersema).
- **La identidad del ecosistema** (no es agricultura/dashboard/calculadora): ya resuelta en `VISION_ALIGNMENT.md`.
- **Los fundamentos del benchmark** (política canónica, correcciones G, dataset congelado): ya resueltos en `ESTADO_ACTUAL_BENCHMARKS.md`.
- **La coexistencia de frontends** y la causa de `ERR_CONNECTION_REFUSED`: ya resuelta y documentada.
- **La degeneración del modelo productivo**: hecho auditado, ya aceptado (no re-auditar sin orden).

### 12.4 Trabajo pendiente inmediato (si se retoma IA)
- **P1 ✅ COMPLETADO** — Corrida oficial M2 ejecutada en Colab T4 (best epoch 32 · ≈4.66 h). No re-ejecutar.
- **P2 (mayormente completado)** — Recopilar/verificar artefactos de `runs/M2_efficientnet_b0/` (config.json, validation_metrics.json, M2_VS_M1.json/.md, best/last.pth, metrics.csv, PNG) si no fueron aún devueltos del entorno de corrida (Drive/Colab).
- **P3/P4 ⬜ PENDIENTE** — Análisis científico M2 vs M1 y **decisión benchmark final** en `TABLA_COMPARATIVA_M1_M5.md` + manifiestos. Hasta entonces: **M1 = baseline oficial · M2 = challenger validado**.
- **Pendiente documental:** commitear RAM fix del notebook + los documentos nuevos + actualizaciones — **solo con orden explícita**.

---

*CONSOLIDACIÓN CANÓNICA v1 · La iniciativa CMSC queda cerrada documentalmente. Sin dependencias de memoria, de chats, de OpenCode ni de GPT: la recuperación completa vive en estos documentos canónicos. Honestidad de estado como invariante: todo lo aquí declarado es verificable en el repositorio y en los documentos referenciados.*