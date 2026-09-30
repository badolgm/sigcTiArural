# SIGCTiArural · CMSC — Arquitectura de UI (Dashboard del Centro Científico)

> **Categoría:** Documentación canónica de arquitectura · Diseño de experiencia y arquitectura visual (Fase 2 CMSC).
> **Versión:** v1.0 | **Fecha:** 2026-09-25 · **Rama:** `feature/ubtn-biological-telemetry`
> **Tipo:** DISEÑO · ARQUITECTURA DE EXPERIENCIA · SOLO DOCUMENTACIÓN.
> **Norma:** NO implementar · NO modificar componentes actuales · NO crear rutas · NO hacer commits.
> **Precedencia:** deriva de `CMSC_MASTERPLAN_v1.md` (visión) y `CMSC_SIGNAL_MAP_v1.md` (señales S01..S80).

---

## 0. Propósito y ámbito

Este documento especifica la **arquitectura visual y funcional** del futuro **Dashboard CMSC** sobre el frontend en evolución (`5174`, `src/frontend/src`). Define, con propósito de diseño, cómo el ecosistema SIGCTiArural se presentará al usuario como centro científico.

**Qué NO es este documento:**
- No es un wireframe pixel-perfect ni una hoja de estilos.
- No prescribe componentes a codificar ahora.
- No toca ningún archivo de `src/frontend/src` (se respeta íntegro).

**Qué ES:**
- El **contrato de experiencia** que las fases de realización (F3-F4 y gates aprobados) deberán respetar.
- El **mapa de pantallas y flujos** del dashboard científico, alineado con la triada **Modelo → Simulación → Interpretación** y con el flujo **Sensores → Telemetría → Matemáticas → Señales → IA → Knowledge Hub → Agentes → Usuario**.

**Principios rectores (heredados):**
1. **La señal es el bien central** — cada pantalla nace de una señal del mapa maestro (`CMSC_SIGNAL_MAP_v1.md`).
2. **Honestidad de estado visible** — toda pantalla muestra `real / sim / referencia / diseño` con badge.
3. **NADA DESAPARECE** — el Dashboard actual, los labs y el Knowledge Hub MVP se preservan; el CMSC los envuelve y los vincula, no los sustituye.
4. **Agnosticismo** — sin dependencia de proveedores (HW/SW/LLM).
5. **Cero duplicidad de estado** — las pantallas consumen stores/pipelines existentes (`useLabStore`, `fetchTelemetry*`, registry KH).

---

## 1. Arquitectura de información global

### 1.1 Árbol de navegación del Dashboard CMSC (diseño)

```
/dashboard-cmsc                         → Dashboard principal CMSC
├── /cmsc/senales                       → Vista de señales (catálogo vivo S01..S80)
├── /cmsc/espectral                     → Vista espectral (Lab Análisis Espectral)
├── /cmsc/matematica                    → Vista matemática (modelado / Dr. Binary)
├── /cmsc/ia                            → Vista IA (inferencia + benchmark + interpretación)
├── /cmsc/knowledge                     → Vista Knowledge Hub (evidencia + conocimiento)
├── /cmsc/acp                           → Vista ACP (Agente Científico Principal)
└── (rutas existentes se mantienen intocadas: /dashboard, /labs, /advanced-math-*…)
```

### 1.2 Cinta del río científico (hilo conductor visual)

Cada pantalla del CMSC muestra una **barra de progreso del río** (el flujo del §3 del masterplan), con eslabones activos según la pantalla:

```
Sensores › Telemetría › Matemáticas › Señales › IA › Knowledge Hub › Agentes › Usuario
   └───────────●───────────●───────────●─────────●─────────●───────────●─────────●
```

- En **vista matemática** los eslabones Matemáticas están "encendidos"; del resto se muestra el estado real.
- La cinta es **estado honesto + navegación**: cada eslabón es clicable a su vista correspondiente.

### 1.3 Estructura visual por pantalla (patrón común)

Toda vista CMSC usa un **layout huésped** común (concepto, no componente):

```
┌──────────────────────────────────────────────────────────────┐
│ TOPNAV (existente, preservado)                                │
├──────────────────────────────────────────────────────────────┤
│ CINTA DEL RÍO CIENTÍFICO (navegación contextual)              │
├───────────────────────────────┬──────────────────────────────┤
│ PANEL PRINCIPAL               │ PANEL DE EVIDENCIA (side)     │
│ (contenido de la vista)       │ · señal originante            │
│                               │ · estado honesto (badge)      │
│                               │ · técnicas aplicadas          │
│                               │ · modelos IA relevantes       │
│                               │ · anclas al Knowledge Hub     │
│                               │ · traza de agentes (si ACP)   │
├───────────────────────────────┴──────────────────────────────┤
│ VOICEASSISTANT (existente, preservado, extendible — sin tocar)│
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Dashboard principal CMSC

**Ruta de diseño:** `/dashboard-cmsc`

**Propósito:** ofrecer, de un vistazo, el **estado científico del ecosistema**: qué señales fluyen, con qué estado de honestidad, qué análisis se pueden disparar y qué conocimiento producen.

### 2.1 Bloques funcionales

| Bloque | Descripción | Fuente (consumo, sin duplicar) |
|---|---|---|
| **Resumen del río** | Tarjetas por eslabón (Sensores→Usuario) con contador y estado | `CMSC_SIGNAL_MAP_v1.md` §4; `Dashboard.jsx` existe (no se toca) |
| **Señales vivas** | Grid de señales activas con badge honesto (`real/sim/ref/diseño`), última muestra y fuente | `fetchTelemetry*` (V3), `useRoboticsApi`, micrófono telecom |
| **Última evidencia** | Los 5 análisis/evidencias más recientes con ancla KH | registry KH + (futuro) registro de evidencia |
| **Puertas de laboratorios** | Acceso a las vistas espectral/matemática/IA/KH desde el flujo | rutas `/cmsc/*` |
| **Termómetro de honestidad** | Indicador agregado: cuántas señales son reales vs simuladas | derivado del mapa de señales |

### 2.2 Reglas de interacción
- Ninguna tarjeta es decorativa: **toda tarjeta es un enlace** a su vista o eslabón del río.
- El valor de una señal va acompañado **siempre** del badge de estado (`REAL`, `SIM`, `REF`, `DISEÑO`) — nunca solo del número.
- Si una señal reporta `source_mode` del backend, se muestra tal cual (no se recomputa).

---

## 3. Vista de señales

**Ruta de diseño:** `/cmsc/senales`

**Propósito:** catálogo vivo del inventario S01..S80, navegable y filtrável, que responde "**qué señales existen, qué señales fluyen, qué conocimiento producen**".

### 3.1 Funcionalidad
- **Listado por tipo** (12 clases del mapa: físicas, digitales, lógicas, biológicas, acústicas, espectrales, RF, mecánicas, imágenes, matemáticas, documentales, IA) y por **dominio** (dashboard, telemetría, hardware, labs, robótica, IA, benchmark).
- **Ficha de señal** (patrón común, sin duplicar): `origen · destino · frecuencia · contexto · laboratorios · modelos IA`, con badge de honestidad (mapeo directo del `CMSC_SIGNAL_MAP_v1.md` §3).
- **Filtros:** estado honesto, tipo, dominio, laboratorio consumidor, modelo IA aplicable.
- **Búsqueda** por id (`S10`), nombre o fuente.

### 3.2 Panel de evidencia (side)
Al seleccionar una señal → muestra la técnica que se le aplica (FFT/STFT/wavelets según el mapa §5), el o los labs que la consumen, y los modelos IA (reales/diseño) relacionados — todo leído del mapa, **sin crear datos nuevos**.

### 3.3 Reglas
- La vista **no muestra inventos**: si una señal no tiene modelo, se muestra `—` (regla de honestidad).
- Las señales `diseño` se presentan con su roadmap (ej. UBTN: "diseño 0% código") y enlace al ancla documental.

---

## 4. Vista espectral

**Ruta de diseño:** `/cmsc/espectral`

**Propósito:** expresión visual del **Laboratorio de Análisis Espectral** (pendiente estratégico, semilla Hackathon). Es la **vista diferenciadora** del CMSC.

### 4.1 Paneles
| Panel | Técnica | Señales de entrada (candidatas, mapa §5) |
|---|---|---|
| **FFT** | Transformada Rápida de Fourier | micrófono Telecom (S30), telecom sintética (S34), trayectoria robot (S51) |
| **STFT** | Tiempo-frecuencia | audio no estacionario, señales fisiológicas (S20) → espectrograma |
| **Wavelets** | Multi-resolución | ECG/EEG (S21, diseño), transitorios RF — ya conceptualizado en Dr. Binary (S35) |
| **Espectrograma** | visual t-f | audio (S30, S62), WebSDR (S31) |
| **Bioacústica** | espectrograma + embeddings | grabaciones de campo (S77, diseño research_v2) |
| **RF** | espectro de banda | WebSDR (S31), enlace LoRa/WiFi (S34) |
| **Vibraciones** | firmas mecánicas | IMU UBTN (S21), trayectoria robot (S50) |
| **Imágenes en frecuencia** | espectro 2D/descriptores | imagen de hoja (S60) — textura complementaria a CNN |
| **Telemetría en frecuencia** | periodograma/PSD | temp/humedad (S10/S11), ciclos diurnos |

### 4.2 Código de honestidad espectral
- Cada panel distingue: **espectro real** (web audio capture), **simulación** (datos sintéticos), **referencia** (dataset externo) y **diseño** (técnica planificada).
- El espectrograma generado por micrófono se marca `LIVE · LOCAL` (nunca sube al servidor hoy); el de dataset se marca `REF`.

### 4.3 Derivación de características (features)
La vista espectral calcula (concepto, no implementación) features que alimentan al **Agente Señales** y a futuros modelos:
`f0 · energía · PSD · picos · ancho de banda · SNR · componentes STFT/wavelet`.
Cada feature se muestra con su señal origen y la técnica aplicada (traza).

---

## 5. Vista matemática

**Ruta de diseño:** `/cmsc/matematica`

**Propósito:** posicionar las matemáticas como **centro de modelado** (no calculadora). Envuelve la experiencia de Dr. Binary sin tocar `AdvancedMathLab*`.

### 5.1 Secciones de diseño
| Sección | Contenido | Vínculo preservado |
|---|---|---|
| **Modelado de señal** | cargar/recibir una señal (del catálogo) y aplicarle series de Fourier, Laplace, wavelets | `/advanced-math-v2` (Dr. Binary) intacto |
| **Interpretación matemática** | el "porqué matemático" superficial + relación con física/electrónica | `mathHelpers.js`, `useLabStore` |
| **Matemáticas del CMSC** | mini-directorio de modelos matemáticos disponibles (triada Modelo→Simulación→Interpretación) | mapa señales + masterplan memset |
| **Matemática aplicada por señal** | para cada señal del mapa: qué modelo matemático aplica (correlación, series, transformadas) | `CMSC_SIGNAL_MAP_v1.md` §3 y §6 |

### 5.2 Regla de diseño
- La vista **no reimplementa** matemáticas: delega en labs existentes (lectura) y solo **organiza el acceso** y **explica el encadenamiento** hacia Señales → IA → KH.
- Badge honesto por nota: "modelo paramétrico aplicable (diseño)" vs "serie de Fourier visualizada (real, sim local)".

---

## 6. Vista IA

**Ruta de diseño:** `/cmsc/ia`

**Propósito:** unificar la **interpretación IA** del ecosistema: inferencia real, benchmark y mapeo de modelos a señales.

### 6.1 Paneles
| Panel | Descripción | Fuente |
|---|---|---|
| **Inferencia** | subir imagen de hoja → diagnóstico con confidence + source_mode + contrato EIARC | `/api/v3/ai/inference/` (igual que AIPredictiva, sin tocar) |
| **Mapa modelo→señal** | qué señales tienen modelo (M1 16c baseline oficial, M2 challenger ejecutado, runtime binario `plant_disease_mbv2.h5`) y cuáles no | `ESTADO_ACTUAL_BENCHMARKS.md`, mapa §3 |
| **Benchmark** | estado del programa científico: M1 aprobado/congelado, M2 ejecutado oficialmente, decisión final pendiente | `ESTADO_ACTUAL_BENCHMARKS.md` |
| **Honestidad de inferencia** | separación explícita REAL / DEMO / DISEÑO (incluye el badge de "modo demostrativo" que hoy ya existe) | `AI_V5_FORENSIC_AUDIT.md`, `AIPredictiva.jsx` (no tocada) |

### 6.2 Reglas
- **Toda predicción muestra confidence y su estado real** (`cloud/edge/fallback/mock` según EIARC).
- El **modelo productivo degenerado** (`plant_disease_mbv2.h5`) se etiqueta claramente en la UI (`scientific_scope: binary_only · riesgo auditado`) — honestidad sin ocultamiento.
- Los modelos de diseño aparecen como **diseño** con su gate.

---

## 7. Vista Knowledge Hub

**Ruta de diseño:** `/cmsc/knowledge`

**Propósito:** posicionar el Knowledge Hub real (51 docs, MVP visor) como **destino de evidencia y fuente de contexto** del CMSC — sin reemplazarlo.

### 7.1 Evolución de presentación (solo diseño de UX)
| Aspecto actual (MVP, no se toca) | Presentación CMSC (envoltura de UX) |
|---|---|
| `/knowledge` + `/knowledge/doc/:docId` (visor agrupado en 6 categorías) | Envoltura que añade: "evidencias de este tema" y "señales relacionados" |
| Sin búsqueda/RAG/grafo | Señales (*design outcomes*) de búsqueda y relaciones — marcadas como **futuro/design** |
| Docs → docs individuales | docs → docs **conectados a señales** (qué señal documenta / qué análisis la sustenta) |

### 7.2 Reglas
- **No implementar** búsqueda/RAG/grafo en esta fase: solo se especifica la experiencia que se quiere alcanzar.
- El panel de evidencia del layout huésped enlaza cada señal a sus resultados (`read: real; ver: `/cmsc/espectral`), y cada doc del KH se enlaza desde la ficha de señal.

---

## 8. Vista ACP (Agente Científico Principal)

**Ruta de diseño:** `/cmsc/acp`

**Propósito:** dar **visibilidad y control** al orquestador multiagente. Es la "consola del científico": el usuario ve cómo se descompone su pregunta, qué agente respondió y con qué evidencia.

### 8.1 Consola de consulta
- **Entrada única multimodal** (texto ya existente + voz ya existente combinables): campo de consulta + botón de micrófono.
- La consulta se envía al ACP (interfaz de diseño; aún no existe implementación — se marca `DISEÑO`).

### 8.2 Panel de orquestación (visualización)
Cuando el ACP procese (futuro), se muestra:
```
TU PREGUNTA:  "¿Qué frecuencia domina en la señal del micrófono?"
│
├─ [Agente Señales] → FFT sobre S30 → f0 = 243.0 Hz     · REAL · laboratorio telecom
├─ [Agente Matemático] → modelo de onda sinusoidal ajustado · SIM local
├─ [Agente IA] → sin modelo para audio (—)                · —
├─ [Agente Investigación] → ancla: doc/xxx (Knowledge Hub) · REF
└─ Respuesta consolidada (ACP) con traza + confidence
```

### 8.3 Contrato de visualización (genérico)
Cada fila de agente muestra: `AGENTE · técnica · resultado · estado honesto · ancla KH`. Sin resultado o sin ancla → muestra `—` (nunca inventa).

### 8.4 Estado del panel
**DISEÑO — sin implementación.** Es la especificación de UX que la Fase 4 deberá materializar. Su runtime es agnóstico (ver masterplan §6).

---

## 9. Experiencia texto

### 9.1 Superficie
- **Barra de consulta CMSC** flotante (conceptual) que permite preguntas científicas con vocabulario del dominio: señales, frecuencia, espectro, modelo, inferencia, laboratorio, documento.
- Reutiliza la intención existente de `conversation_context.py` (keywords) y la extiende **conceptualmente** a comandos científicos — **sin modificar** el código actual.

### 9.2 Ejemplos de intents (diseño)
| Pregunta del usuario | Flujo esperado (ACP) |
|---|---|
| "¿qué temperatura hay ahora?" | Telemetría real (V3) → Agente Física → agente Investigación (ancla) |
| "analiza el espectro del micrófono" | Agente Señales FFT (local) → respuesta con f0 |
| "¿cuál es el mejor modelo para hojas de tomate?" | Agente IA (M1/M2) + Agente Investigación (benchmark) |
| "abre robótica" | navegación (routeMap existente, preservado) |

### 9.3 Reglas
- La experiencia texto **responde con evidencia o dice que no sabe** (nunca inventa).
- Si no hay señal/modelo para la consulta → respuesta honesta "NO HAY MODELO PARA ESTA SEÑAL (diseño pendiente)" con enlace al mapa.

---

## 10. Experiencia voz

### 10.1 Superficie
- Preserva el `VoiceAssistant.jsx` actual (getUserMedia → `/assist` → STT/TTS) sin tocarlo.
- En la visión CMSC, la **misma superficie física** se conecta (futuro) al ACP, manteniendo fallback a la experiencia actual si el ACP no está disponible (patrón agnóstico + no regresión).

### 10.2 Flujo objetivo (diseño, Fase 4)
1. micrófono → STT (hoy `recognize_google`; mañana intercambiable, agnóstico LLM/local).
2. intención → ACP → descomposición en sub-agentes.
3. respuesta = **audio TTS** (siempre) + **panel visual de traza** (opcional) como hoy devuelve audio MPEG.
4. Si el ACP no responde → responde la lógica actual (keywords) — **fallback preservado** (honestidad de no romper lo existente).

### 10.3 Vocabulario voz CMSC (diseño)
"señal", "espectro", "frecuencia", "FFT", "onda", "temperatura", "humedad", "inferencia", "modelo", "laboratorio", "conocimiento", "documento", "robot".
Estos comandos futuros **complementan** (no reemplazan) el routeMap actual (`App.jsx:67-93`).

---

## 11. Integración con laboratorios

### 11.1 Principio
El dashboard CMSC **no duplica ni reemplaza** los laboratorios: los **organiza y atraviesa**. Cada vista CMSC enlaza a los labs existentes (`/advanced-math-v2`, `/lab-electronics`, `/lab-telecom`, `/labs/robotics`, `/lab-embedded`, `/data-science`, `/ai-predictive`).

### 11.2 Matriz de integración (señal → lab → vista CMSC)
| Señal (mapa) | Lab fuente | Vista CMSC que la presenta | Alimentación |
|---|---|---|---|
| S10/S11 telemetría | Dashboard/TelemetryPanel | Dashboard CMSC + Espectral (PSD) | `fetchTelemetry*` V3 |
| S30 micrófono | TelecomLab (FFT) | Vista espectral (FFT real local) | WebAudio AnalyserNode |
| S32/S33 circuitos | ElectronicsLab/Falstad | Vista matemática (modelado) | `useLabStore` |
| S35 Fourier/Laplace/Wavelets | AdvancedMathLabV2 (Dr. Binary) | Vista matemática | `useLabStore` |
| S50 trayectoria robot | RoboticsLab | Vista espectral (vibración/periodo) | `useRoboticsApi` |
| S60 imagen hoja | AIPredictiva | Vista IA | `/api/v3/ai/inference/` |
| S79 documentos | Knowledge Hub | Vista knowledge | registry KH |
| S62 voz | VoiceAssistant | Vista ACP + experiencia voz | `POST /assist` |

### 11.3 Guardarraíl
Ningún componente de `src/frontend/src/**` se modifica por este diseño. Toda conexión futura se hace **envolviendo** (layout huésped + enlaces), preservando las rutas y estados actuales.

---

## 12. Integración con telemetría

### 12.1 Consumo (no duplicación)
- El dashboard CMSC **lee los mismos endpoints** que hoy consume el frontend:
  - V3 lectura viva: `fetchTelemetrySeriesReal()` / `/api/v3/telemetry/history/`
  - envelope con `source_mode` (live/simulated/fallback) — mostrado **tal cual**.
  - robótica: `/api/robot-telemetry/` a través del canal correcto (pendiente de saneamiento de puertos: usar `VITE_API_URL`/proxy 8010, no `localhost:8000` hardcodeado).
- **No crea** un nuevo cliente de telemetría; declara qué consumidores existentes usar.

### 12.2 Semántica honesta del stream
- Badge en señal: `REAL (persistida)` si la lectura provino de ingesta V3; `SIM` si el backend generó sintético; `CLIMA EXTERNO` si proviene de Open-Meteo. **El CMSC no confunde clima externo con telemetría rural**.
- Si no hay filas y el backend responde sintético → la UI lo etiqueta "simulación (sin lecturas reales)" visiblemente.

### 12.3 Frecuencia objetivo (diseño)
- Visualización en vivo cuando `source_mode === 'live'` (polling conservador o SSE según lo que ya exista).
- Análisis espectral de la serie (PSD/periodograma) accesible en `vista espectral`.
- La cadencia real la define el backend; la UI solo **refleja** timestamps del envelope.

---

## 13. Integración con agentes

### 13.1 Principio
La UI del CMSC es el **escaparate de los agentes** (ACP + 6 sub-agentes), no su motor. El motor multiagente es una capa futura (Fase 4) totalmente agnóstica y externa a los componentes actuales.

### 13.2 Contrato de UI con agentes (interfaz de diseño)
```
Estado del ACP:   (pensando / respondiendo / fallback / offline)
Por cada agente:  nombre · técnica · resultado · estado honesto · ancla KH · traza
Consolidación:    respuesta + confidence o '—'
```

### 13.3 Mapa agente → vista CMSC (cuál vista informa a cada agente)
| Agente | UI que lo alimenta |
|---|---|
| Agente Matemático | Vista matemática (modelos disponibles) |
| Agente Física | Vista de señales (fenómeno + unidades) |
| Agente Electrónica | Vista de señales (etapa de adquisición) |
| Agente Señales | Vista espectral (features calculadas) |
| Agente IA | Vista IA (modelos e inferencia, confidence) |
| Agente Investigación | Vista Knowledge (docs y evidencias, RAG futuro) |

### 13.4 Guardarraíl
- **Sin agentes en esta fase**: la interfaz de la Vista ACP se especifica, pero permanece inerte (`DISEÑO`), igual que el resto del ecosistema multiagente (0% código).

---

## 14. Estética y lenguaje visual (directrices)

1. **Tema:** mantiene la estética neón del frontend en evolución (paleta `NEON_COLORS` en `App.jsx` — cian `#00FFFF`, verde `#39FF14`, alerta `#FF3131`, fondo `#0a0a0a`) **sin tocar el código**: la directriz es de continuidad visual.
2. **Códigos de estado visual universales:**
   - `REAL` = círculo sólido cian/verde + etiqueta.
   - `SIM` = contorno punteado + etiqueta.
   - `REF` = ícono de libro/documento.
   - `DISEÑO` = contorno borroso/difuminado + "pendiente".
3. **Tipografía:** continuar con la familia actual (Orbitron/mono en títulos científicos, ya usada en Dr. Binary).
4. **Iconografía por eslabón del río:** Sensores (🌡) · Telemetría (📡) · Matemáticas (ƒ) · Señales (∿) · IA (🧠) · KH (📚) · Agentes (◈) · Usuario (👤).
5. **Grid:** patrón de tarjetas denso, científico, con side-panel de evidencia siempre presente.

---

## 15. Trazabilidad con documentos canónicos (sin implementar)

| Concepto UI | Ancla documental |
|---|---|
| Río científico (cinta) | `CMSC_MASTERPLAN_v1.md` §3 |
| Señales S01..S80 | `CMSC_SIGNAL_MAP_v1.md` §1-§3 |
| Lab Análisis Espectral | `CMSC_MASTERPLAN_v1.md` §4 · `CMSC_SIGNAL_MAP_v1.md` §5 |
| Multiagente/ACP | `CMSC_MASTERPLAN_v1.md` §5 (6 sub-agentes) |
| Agnosticismo UI (sin proveedor) | `CMSC_MASTERPLAN_v1.md` §6 |
| Honestidad de inferencia | `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` · EIARC `semantic_prediction_resolver` |
| Frontend actual (5173/5174) | `FRONTEND_EXECUTION_STRATEGY.md` (5174 = evolución) |
| KH real (51 docs, visor) | `src/frontend/src/knowledge-hub/` (registry) |
| Voz asistente (real) | `src/ai_models/fastapi_app.py` `/assist` · `VoiceAssistant.jsx` |
| Rutas actuales preservadas | `src/frontend/src/App.jsx` (rutas existentes) |

---

## 16. Roadmap de realización de la UI (gates, sin ejecutar)

| Fase | Contenido UI | Gate |
|---|---|---|
| F2 → F3 | Layout huésped + cinta del río + **Vista de señales** funcional (lee mapa S01..S80) | aprobación del diseño + orden explícita |
| F3 | **Vista espectral** (FFT/STFT/wavelets sobre señales existentes) + **Vista matemática** envolvente | integración horizontal de una señal real |
| F4 | **Vista IA** + **Vista Knowledge** (evidencia conectada) + **Vista ACP** + superficies texto/voz conectadas al ACP | CMSC estable candidato a dockerizar |

> Ninguna de estas fases implica implementación hoy. Este documento **solo especifica la experiencia** conforme al Código de la misión (NO IMPLEMENTAR).

---

## 17. Conclusión

El Dashboard CMSC es la **expresión visual del centro científico**: un layout huésped que envuelve —sin romper— todo lo existente (labs, telemetría, KH, voz, IA), organizado por la cinta del río Sensores→Telemetría→Matemáticas→Señales→IA→KH→Agentes→Usuario, con honestidad de estado en cada pixel, evidencia siempre visible y cero duplicidad de estado.

Es la especificación de experiencia de la Fase 2 CMSC. **No hay código implementado ni componentes modificados.**

---

*Documento de DISEÑO v1 — Arquitectura de experiencia del Dashboard CMSC. Sin implementación, sin cambios de código, sin commieur. Vigentes los gates F2→F4 del masterplan y la regla suprema: NADA DESAPARECE·TODO SE PRESERVA·TODO SE CONECTA·TODO EVOLUCIONA.*