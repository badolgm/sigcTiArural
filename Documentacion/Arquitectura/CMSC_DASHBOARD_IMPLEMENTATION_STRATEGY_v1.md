# SIGCTiArural · CMSC — Estrategia de Implementación del Dashboard (Implementation Strategy)

> **Categoría:** Documentación canónica de arquitectura · Estrategia evolutiva (Fase 3 CMSC).
> **Versión:** v1.0 | **Fecha:** 2026-09-27 · **Rama:** `feature/ubtn-biological-telemetry`
> **Tipo:** DISEÑO · ESTRATEGIA · ARQUITECTURA EVOLUTIVA. **NO implementar · NO modificar código · NO modificar componentes · NO refactors · NO commits.**
> **Precedencia:** deriva de `CMSC_MASTERPLAN_v1.md` (visión), `CMSC_SIGNAL_MAP_v1.md` (señales), `CMSC_UI_ARCHITECTURE_v1.md` (experiencia), `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` (labs), `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` (arqueología), `docs/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` (cadena), `docs/SIGCTIARURAL_VISION_ALIGNMENT.md` (identidad).
> **Regla de oro:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.

---

## 0. Propósito y contexto (el punto de partida verificado)

El análisis forense y la reestructuración de labs ya concluyeron. Los hechos verificados que anclan esta estrategia:

1. **AdvancedMathLabV2 NO es calculadora**: es **modelador de señales** (veredicto B de `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` §12).
2. **TelecomLab contiene la única señal acústica real** del ecosistema (micrófono → WebAudio FFT, S30).
3. **ElectronicsLab es el laboratorio más vivo** (11 commits, la única conexión inter-lab real vía `useLabStore`).
4. **El puente Elect→Math existió** y sigue vivo: `ElectronicsLab.jsx` → `useLabStore` → `AdvancedMathLabV2.jsx`.
5. **`useLabStore` fue el primer intento de federación** (store global "mochila de datos", `useLabStore.js:1-111`).
6. **CMSC no es una idea nueva**: es la formalización de una visión que lleva años intentando emerger (la misma cadena Señales→Electrónica→Matemáticas→Telecom aparece en `ECOSYSTEM_IDENTITY.md:31`, `VISION_ALIGNMENT.md:20-43`, `LAB_CONNECTIVITY_MODEL.md:19-32`).
7. Rutas reales actuales (verificadas en `App.jsx:110-148`): `/dashboard`, `/labs` (LabCatalog), `/ai-predictive`, `/data-science`, `/hardware-catalog`, `/hardware/:id`, `/proyectos`, `/labs/robotics`, `/advanced-math`, `/advanced-math-v2`, `/lab-embedded`, `/lab-telecom`, `/lab-electronics`, `/knowledge`, `/knowledge/doc/:docId`.
8. La navegación actual es **plana** (TopNav con 6 destinos: Dashboard · Laboratorios · Hardware · IA Predictiva · Proyectos · Conocimiento). El idioma del ecosistema —la señal— no tiene ningún eslabón de navegación propio.

**Pregunta rectora de todo el documento:**
> ¿Cómo llegar a la imagen objetivo del CMSC **sin destruir, sin reescribir, sin perder, sin duplicar**, preservando por completo el conocimiento acumulado?

**La respuesta corta (se desarrolla en §7-§13):**
> **Envolver y conectar, jamás sustituir.** El CMSC no reemplaza ningún `.jsx`: añade una capa de lectura (`uso de stores` y `fetch` existentes), una capa de navegación (`cinta del río` + `selector de señales`) y una capa de evidencia (`panel derecho` + enlace a KH). Todo lo que ya existe queda exactamente donde está; el CMSC lo *atraviesa* con la señal como hilo conductor.

---

## 1. Pregunta 1 — ¿Cómo debe evolucionar la ruta `/labs`?

### 1.1 Estado actual (verificado)
`/labs` renderiza `LabCatalog.jsx` (página de grilla) que consume `lab-data.js` (categorías: Robótica, Sistemas Embebidos, Matemáticas Avanzadas, Física y Electrónica, Telecomunicaciones, Agricultura+IA, Ciencia de Datos, Cursos, SENA y Universidades/OCW, Documentación Técnica, Web3 & Blockchain, Ingeniería de Sistemas & DevOps). Es un **catálogo académico plano** (categorías → cards con enlaces externos + rutas internas). La categoría "Documentación Técnica" ya se excluye de la grilla (`LabCatalog.jsx:118-129`) porque se reubicó al Knowledge Hub.

### 1.2 Hallazgo de diseño
`/labs` hoy es el **único nodo de navegación que agrupa los laboratorios** pero lo presenta como directorio de recursos, no como grafo de conocimiento. Los enlaces `to` internos usan rutas sin `/` inicial (`lab-embedded`, `advanced-math-v2`...) que funcionan solo por el fallback de `handleNavigation` (`App.jsx:90-92`), no por el router real.

### 1.3 Decisión evolutiva
`/labs` **se preserva como CATÁLOGO ACADÉMICO** (recursos externos, cursos, OCW) pero **pierde el protagonismo de laboratorio**: los laboratorios científicos pasan a vivir bajo la navegación por señal del CMSC. Evolución en dos niveles sin tocar código:

| Nivel | Ruta | Rol tras la evolución | Conserva |
|---|---|---|---|
| 1 | `/labs` (LabCatalog) | Catálogo académico + acceso directo a los labs existentes (inalterado) | Todas las categorías de `lab-data.js` |
| 2 | `/dashboard-cmsc` + `/cmsc/*` (nuevas, futuras) | Mapa científico del ecosistema, navegación por señal, vistas espectral/matemática/IA/KH/ACP | Nada se pierde: los labs se enlazan desde la vista |

**Regla:** `/labs` **no se reescribe**; se le añade contexto. La primera impresión científica se traslada a `/dashboard-cmsc` (diseño), y `/labs` queda como "entrada académica" no como el corazón del ecosistema.

### 1.4 Mini-roadmap de `/labs`
1. **Hoy:** catálogo plano (inalterado).
2. **Tras gate CMSC:** enlace de la grilla de laboratorios a sus vistas `/cmsc/*` correspondientes (aditivo).
3. **Tras F3D:** `/labs` muestra un "modo mapa" opcional que repinta las categorías como eslabones de la cadena, consumiendo la misma `lab-data.js` (sin reescribirla).

---

## 2. Pregunta 2 — ¿Qué debe ocurrir en la primera entrada al CMSC?

### 2.1 Situación actual
Hoy el primer contacto es `/dashboard` (`Dashboard.jsx`): sidebar de navegación, cards de capacidad (`CAPABILITY_CARDS`), acceso rápido a labs (`LAB_QUICK_ACCESS`, `Dashboard.jsx:29-37`), cluster de nodos BBB (metadatos fabricados, `cloud.js:25-33` — S04 simulación) y gráfico de telemetría (que en `cloud.js:36-49` es **clima externo Open-Meteo** etiquetado como si fuera telemetría rural — el CMSC lo marcará como S03 "clima externo", NO rural).

### 2.2 Primera entrada al CMSC (diseño)
Al entrar por primera vez a `/dashboard-cmsc`, el usuario ve, **sin inventar**, por este orden:

1. **Identidad correcta:** "CMSC — Centro de Modelado, Simulación y Ciencias Computacionales" (no "dashboard IoT").
2. **La cinta del río científico** (hilo conductor visual, definida en `CMSC_UI_ARCHITECTURE_v1.md` §2): `Sensores › Telemetría › Matemáticas › Señales › IA › Knowledge Hub › Agentes › Usuario`.
3. **El termómetro de honestidad:** "de las 80 señales inventariadas, 2 son reales persistentes hoy (S10/S11 temp/hum y S50 robot); el resto es simulación, referencia o diseño" — leído del mapa de señales, no calculado.
4. **Las 2 señales reales vivas** (temp/humedad V3, RobotTelemetry) y la única acústica real local (micrófono S30) — con badge honesto.
5. **Las puertas a los labs** (que ya existen) y a las vistas `/cmsc/*` (futuras) como eslabones de la cadena.
6. **La última evidencia** registrada (hasta que exista, se muestra el estado "sin evidencia documental automática hoy" — honestidad).

### 2.3 Regla de oro de la primera entrada
> El CMSC **no** se presenta con nodos, tiles de infraestructura ni alertas fabricadas. Se presenta con **señal, flujo y honestidad**: qué señal existe, cómo fluye y qué ciencia se le puede aplicar ya.

---

## 3. Pregunta 3 — ¿Cómo transformar CATÁLOGO DE LABORATORIOS → MAPA CIENTÍFICO DEL ECOSISTEMA?

### 3.1 La transformación conceptual
| Hoy (catálogo plano) | Objetivo (mapa científico) |
|---|---|
| Categorías acadentas en cards | Eslabones de la cadena con estados honestos |
| Labs como cajas aisladas | Labs como nodos que producen/consumen señales |
| Enlaces externos sin jerarquía | Recursos etiquetados por eslabón al que sirven |
| "Agricultura + IA" como categoría | IA y Agricultura como eslabones del río |
| "Documentación Técnica" excluida | Documentación = evidencia del KH (eslabón Conocimiento) |

### 3.2 Mecanismo (sin tocar `lab-data.js`)
El mapa se construye **sobre** los datos existentes mediante 3 lecturas cruzadas (patrón de lectura, en diseño):

1. **Fuente navidad (labs):** `lab-data.js` (categorías + rutas) — se lee, no se duplica.
2. **Fuente señal (mérito):** `CMSC_SIGNAL_MAP_v1.md` S01..S80 — qué señal produce/consume cada lab.
3. **Fuente cadena (grafo):** `LAB_CONNECTIVITY_MODEL.md` §4 — la topología Matemáticas→Física→Electrónica→Telecom→Embebidos→IoT→IA→Agricultura→Proyectos→Impacto.

**Salida visual (diseño):** cada eslabón de la cadena es un **nodo clicable** que:
- muestra su señal(es) con badge honesto (`REAL` / `SIM` / `REF` / `DISEÑO`);
- enlaza al lab real existente (`/lab-electronics`, `/lab-telecom`, `/advanced-math-v2`, `/labs/robotics`, `/lab-embedded`, `/data-science`, `/ai-predictive`);
- muestra "conectado a / desconectado de" según la matriz de continuidad (`CMSC_LABS_RESTRUCTURING_PLAN_v1.md` §11 — la columna KH vacía = cableado faltante).

### 3.3 Prohibición
**No** se reescribe `LabCatalog.jsx`, **no** se altera `lab-data.js`, **no** se crea un nuevo componente que duplique su contenido. El mapa es una **capa de presentación** que consolídea fuentes existentes. Si el config de `lab-data.js` cambia, el mapa lo refleja automáticamente.

---

## 4. Pregunta 4 — ¿Cómo representar Señal→Telemetría→Modelado→Señales→IA→Knowledge Hub→Impacto?

### 4.1 Las 3 cadenas existentes (todas convergen)
El ecosistema ya expresa esta secuencia 3 veces; el CMSC las unifica:

| Origen | Cadena |
|---|---|
| `ECOSYSTEM_IDENTITY.md:31` | Señales → Electrónica → Matemáticas → Telecom |
| `VISION_ALIGNMENT.md:20-43` | Conocimiento → Labs → Hardware → Protocolos → Telemetría → IA → Proyectos → Impacto |
| `LAB_CONNECTIVITY_MODEL.md:19-32` | Matemáticas → Física → Electrónica → Telecom → Embebidos → IoT → IA → Agricultura → Proyectos → Impacto |
| Mapa maestro (río CMSC, `SIGNAL_MAP` §4.2) | Sensores → Telemetría → Matemáticas → Señales → IA → Knowledge Hub → Agentes → Usuario |

### 4.2 Representación unificada (concepto "río")
La secuencia de la pregunta se renderiza como **cinta horizontal de 7-8 eslabones**, donde el eslabón activo se ilumina según la vista actual:

```
Señal → Telemetría → Modelado → Señales → IA → Knowledge Hub → Impacto
  │        │           │          │       │         │            │
 (lab)   (V3/SSE)   (MathV2)   (FFT)   (inf.)    (51 docs)    (proyecto)
```

- Cada eslabón es clicable a su vista `/cmsc/*` o al recurso real.
- Debajo de cada eslabón se muestra **su estado honesto agregado**: p.ej. `Señales → S30 REAL local`, `IA → plant_disease DEGENERADO`, `KH → 51 docs visor`.
- El eslabón **Impacto** enlaza a `/proyectos` (proyectos reales y en diseño).

### 4.3 Representación por señal (traza de la señal)
Dentro de la ficha de cada señal (→ §8), la misma cinta se re-dibuja **por señal**: la señal `S30` (micrófono) muestra "obtenida en TelecomLab (REAL) → analizable por FFT (CMSC espectral diseño) → sin modelo IA hoy (—) → sin ancla KH (—)" — cada hueco es un cableado faltante, no un dato inventado.

---

## 5. Pregunta 5 — ¿Qué labs como LABORATORIOS y cuáles como CAPACIDADES TRANSVERSALES?

### 5.1 Criterio de clasificación
Un **LABORATORIO** es un espacio con ruta propia que produce/consume una señal concreta y puede profundizar en ella interactivamente. Una **CAPACIDAD TRANSVERSAL** es un servicio/dominio que opera sobre muchas señales a la vez, sin ruta de laboratorio propia.

### 5.2 Clasificación final

| Entidad | Tipo | Rol en el ecosistema |
|---|---|---|
| **ElectronicsLab** (`/lab-electronics`) | 🧪 LABORATORIO | Señal eléctrica simulada (S32/S33), raíz de la cadena |
| **AdvancedMathLabV2** (`/advanced-math-v2`) | 🧪 LABORATORIO | Modelador de señales (S35), no calculadora |
| **TelecomLab** (`/lab-telecom`) | 🧪 LABORATORIO | Única señal acústica real (S30), FFT en vivo |
| **RoboticsLab** (`/labs/robotics`) | 🧪 LABORATORIO | Trayectoria/mecánica (S50/S51) |
| **EmbeddedLab** (`/lab-embedded`) | 🧪 LABORATORIO | Diseño hardware (S39, referencia externa) |
| **DataScienceLab** (`/data-science`) | 🧪 LABORATORIO | Análisis de datos (S40, parcial/roto) |
| **AdvancedMathLab V1** | 🗄️ Archivo | Preservado en git, `ROTO`/`HUERFANO` |
| **SchematicEditor** | 🗄️ Archivo | Preservado, en cuarentena |
| **IA Predictiva** | ⚙️ CAPACIDAD TRANSVERSAL | Interpretación sobre señales (S60/S61) — actúa transversalmente sobre imágenes; el "lab" de IA es un front del servicio. |
| **Knowledge Hub** | ⚙️ CAPACIDAD TRANSVERSAL | Destino de evidencia + fuente de contexto (S79) — no es un lab, es el eslabón Conocimiento. |
| **Telemetría (V3)** | ⚙️ CAPACIDAD TRANSVERSAL | Canal de adquisición (S10/S11/S14) — atraviesa todo el ecosistema, no es un lab. |
| **Lab Análisis Espectral** | ⚙️ CAPACIDAD TRANSVERSAL | FFT/STFT/wavelets sobre TODAS las señales — ver §6. |
| **ACP + sub-agentes** | ⚙️ CAPACIDAD TRANSVERSAL | Orquestación sobre todas las vistas — ver §7. |
| **Señales (navegación)** | ⚙️ CAPACIDAD TRANSVERSAL | El selector de señales S01..S80 es global, no de un lab. |

### 5.3 Consecuencia de navegación
- Los **laboratorios** aparecen como **nodos del mapa** (por señal que producen).
- Las **capacidades transversales** aparecen como **capas**: el selector de señales, la IA, el KH, el espectro y el ACP no compiten espacio con los labs; se aplican *encima* de ellos. Esto resuelve la confusión actual en la que "Agricultura + IA" y "Documentación Técnica" se tratan como categorías de catálogo.

---

## 6. Pregunta 6 — ¿Dónde debe vivir el análisis espectral?

### 6.1 Argumentación
El análisis espectral **no es un laboratorio más**: es la técnica que unifica las señales. Razones verificadas:

1. **Es transversal por naturaleza:** FFT/STFT/wavelets se aplican a audio (S30), telemetría (S10/S11), robot (S50), circuitos (S33), RF (S34) — no a una sola señal. Tratarlo como lab aislado repetiría el patrón huérfano (TelecomLab 328 días muerto, ver `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` §3).
2. **Ya habita en dos lugares pero sin unificar:** TelecomLab tiene FFT real (WebAudio) y AdvancedMathLabV2 tiene transformadas matemáticas (S35). La duplicidad FFT Telecom/MathV2 (hallada en reestructuración §9.1) se resuelve **unificando la presentación**, no borrando ninguno.
3. **Es la primera capacidad diferenciadora del CMSC** (masterplan §4, pendiente estratégico semilla Hackathon).

### 6.2 Decisión: **AMBAS, con jerarquía**
> El análisis espectral vive como **capacidad transversal del CMSC** con **vista propia** (`/cmsc/espectral`), y **no** como laboratorio independiente de ruta. Esa vista es el "Laboratorio de Análisis Espectral" conceptual: agrega paneles FFT/STFT/wavelets/espectrograma/bioacústica/RF/vibraciones/telemetría en frecuencia, **consumiendo las fuentes existentes** (AnalyserNode de Telecom, `useLabStore`, señales del mapa, `fetchTelemetry*`).

| Aspecto | Decisión | Por qué |
|---|---|---|
| ¿Lab independiente `/lab-espectral`? | NO | duplicaría el patrón huérfano; compite con Telecom/MathV2 |
| ¿Capacidad del CMSC con vista `/cmsc/espectral`? | SÍ (primera capacidad) | transversal, agregadora, sin borrar las FFT actuales |
| ¿Reusa TelecomLab FFT? | SÍ (enlace/lectura, sin tocar) | es la única señal acústica real; se conecta, no se copia |
| ¿Reusa MathV2 transformadas? | SÍ (enlace) | wavelets ya existen en Dr. Binary (S35) |

**Regla espectral:** la vista espectral **nunca inventa señales**; selecciona del mapa S01..S80 la señal a analizar y aplica la técnica correspondiente (honestidad de estado por panel).

---

## 7. Pregunta 7 — ¿Cómo introducir el ACP sin romper nada existente?

### 7.1 Estado actual (verificado)
- El ACP es **0% código** (diseño puro, `CMSC_CANONICAL_STATE` §7.4).
- Existen ya: `VoiceAssistant.jsx` con `routeMap` (`App.jsx:67-93`), `POST /assist` en backend (S62), conversación con keywords (`conversation_context.py`, S65).
- No existe clase/registry/router/cola/memoria/RAG del ACP ni de sub-agentes.

### 7.2 Estrategia de introducción por capas (sin tocar lo existente)

| Capa | Qué se introduce | Qué se preserva |
|---|---|---|
| **Capa 0 — Vista inerte (diseño, tras gate)** | `/cmsc/acp` renderiza la consola de consulta + panel de orquestación **vacíos pero con la especificación visible** (estado `DISEÑO`) | Todo lo actual |
| **Capa 1 — Leer agentes de datos (prototipo)** | El panel del ACP **lee los flujos existentes sin escribir**: muestra qué agente *podría* actuar sobre la señal seleccionada (del mapa), con estado `DISEÑO` | `fetchTelemetry*`, `useLabStore`, registry KH, `/infer` — solo lectura |
| **Capa 2 — Sub-agente piloto (F3)** | Un sub-agente (Señales → FFT → features → KH) que **ejecuta análisis real** sobre una señal real (S30) y muestra la traza | TelecomLab intacto; el sub-agente es una función nueva, aditiva |
| **Capa 3 — ACP orquestador (F4)** | ACP que descompone la consulta en 6 sub-agentes y consolida con ancla KH | Texto/voz actuales como superficie; fallback a `routeMap` y `/assist` si el ACP no responde |

### 7.3 Regla anti-ruptura
1. **Nada se mueve de sitio.** El ACP jamás intercepta rutas existentes ni sustituye `VoiceAssistant.jsx`.
2. **El ACP nunca inventa**: sin ancla KH o sin resultado de sub-agente → muestra `—`.
3. **Fallback agnóstico preservado**: si el ACP no está disponible, `POST /assist` y `routeMap` siguen respondiendo como hoy.
4. **Sin estado duplicado**: el ACP lee (`useLabStore`, `fetchTelemetry*`, registry KH), no crea copias (masterplan §5.3.5).

---

## 8. Pregunta 8 — ¿Cómo introducir la navegación por señales?

### 8.1 Concepto
La navegación por señales es la **nueva columna vertebral** del CMSC: en lugar de navegar por laboratorios, el usuario navega por *qué señal* le interesa (Audio, Temperatura, Humedad, RobotTelemetry, RF, Bioacústica, Vibración, Imágenes) y el ecosistema le muestra **dónde vive, qué se le puede hacer y qué se sabe de ella**.

### 8.2 Introducción en 3 capas (evolutiva)

| Capa | Contenido | Fuente de datos |
|---|---|---|
| **Selector global de señales** (en la cinta del río) | Desplegable/tiras de tipos: Audio, Temperatura, Humedad, RobotTelemetry, RF, Bioacústica, Vibración, Imágenes | Mapa señales S01..S80 (documento canónico) |
| **Vista de señales** `/cmsc/senales` (diseño) | Catálogo vivo filtrable por tipo/dominio/estado; ficha por señal (origen/destino/frecuencia/labs/modelos) | `CMSC_SIGNAL_MAP_v1.md` §3 |
| **Ficha de señal con traza** | Al elegir `Audio` → S30 (micrófono) → TelecomLab + vista espectral; al elegir `Temperatura` → S10/S11 → Telemetría V3 + vista matemática (modelado) | mapa + stores + fetch |

### 8.3 Mapeo señal → tipo → receptor (de `SIGNAL_MAP` §2)

| Tipo | Señales | Dónde vive hoy | Análisis CMSC aplicable |
|---|---|---|---|
| Audio | S30, S62, S77(diseño) | TelecomLab (mic), `/assist` (voz) | FFT, espectrograma, VAD, bioacústica |
| Temperatura | S10, S33, S03(externa) | V3 Postgres, Electronics, Open-Meteo | PSD, series, umbrales |
| Humedad | S11, S03 | V3 Postgres | PSD, series |
| RobotTelemetry | S50, S51 | `/api/robot-telemetry/`, `physics_sim.py` | FFT de trayectoria, periodograma |
| RF | S31, S34 | WebSDR, telecom sintética | espectro de banda, SNR |
| Bioacústica | S77 (diseño) | research_v2 | embeddings, CNN/CRNN |
| Vibración | S50, S21(diseño) | robot, IMU UBTN | firmas espectrales |
| Imágenes | S60, S70/S71 | AIPredictiva, dataset | CNN, textura en frecuencia |

**Regla:** el selector de señales es **global y único** (una fuente de verdad = el mapa). Ninguna vista duplica la lista de señales con config hardcodeada propia.

---

## 9. Pregunta 9 — ¿Cómo reutilizar los laboratorios actuales en lugar de reemplazarlos?

### 9.1 Principio
**Reutilización = lectura + enlace + envoltura.** Nunca copia, nunca reescritura, nunca paráfrasis del estado.

### 9.2 Matriz de reutilización (qué ya existe y cómo se consume)

| Activo existente | Cómo lo reutiliza el CMSC | Modo |
|---|---|---|
| `useLabStore` (store federado, `useLabStore.js:9-111`) | Es el **primer bus de federación**: el CMSC lo lee para la señal Elect→Math | lectura |
| `ElectronicsLab.jsx` → `setElectronicsSignal` | La señal eléctrica (S32/S33) alimenta la vista espectral/matemática | lectura + enlace |
| `AdvancedMathLabV2.jsx` (Dr. Binary, S35) | El modelado de señales se expone en `/cmsc/matematica` | enlace directo |
| `TelecomLab.jsx` (S30, FFT real) | Vista espectral consume el espectro del micrófono como `REAL·LOCAL` | lectura (AnalyserNode) + enlace |
| `RoboticsLab.jsx` (S50/S51) | Vista espectral: FFT de trayectoria | lectura (`useRoboticsApi`) + enlace |
| `DataScienceLab.jsx` (Pyodide, S40) | Consola de análisis anclada al eslabón "datos" (nota: S40 está parcial/roto, se exhibe honestamente) | enlace + badge |
| `AIPredictiva.jsx` + `/infer` (S60/S61) | Vista IA consume inferencia real + confidence + EIARC | lectura (fetch) |
| `KnowledgeHubLayout.jsx` + registry (51 docs) | Vista knowledge + panel de evidencia enlazan docs reales | lectura (registry) |
| `VoiceAssistant.jsx` + `routeMap` | Superficie de voz/texto fallback del ACP | enlace, sin tocar |
| `GlobalChart.jsx` / `clusterNodes` | Gráficos y estado honesto de red (¡no como identidad!) | lectura |
| `página Dashboard.jsx` (`CAPABILITY_CARDS`, `LAB_QUICK_ACCESS`) | Modelo de tiles/cards reutilizable como patrón visual para la cinta | inspiración del patrón |

### 9.3 Anti-patrones prohibidos
- ❌ No crear "TelecomLab v2" para el espectro — usar el existente.
- ❌ No duplicar `useLabStore` con un store CMSC nuevo que copie señales — leer el existente.
- ❌ No envolver `AdvancedMathLabV2` con un montaje que reimplemente Fourier — enlazar al real.

---

## 10. Pregunta 10 — ¿Qué partes del dashboard ganador (CMSC) pueden construirse con componentes que ya existen?

Inventario de componentes existentes (verificados en `src/frontend/src/`) y su uso directo:

| Componente existente | Uso CMSC |
|---|---|
| `pages/Dashboard.jsx` (estructura de tiles/cards, `CAPABILITY_CARDS`, `LAB_QUICK_ACCESS`) | Patrón de layout para el **Dashboard CMSC** (resumen del río, puertas de labs) |
| `components/GlobalChart.jsx` | Gráficas de señales (temp/humedad/robot) en vistas |
| `components/TelemetryPanel.jsx` | Lectura de telemetría V3 (envelope S01) en el eslabón Telemetría |
| `components/TopNav.jsx` (navItems, loader) | Barra superior conservada; se añade entrada "CMSC" (aditivo) |
| `components/VoiceAssistant.jsx` (+ `routeMap`) | Superficie texto/voz y fallback del ACP |
| `knowledge-hub/...` (layout, `MarkdownDocumentView`, registry) | Vista de conocimiento + panel de evidencia (docs reales) |
| `services/cloud.js` (`fetchTelemetrySeriesReal`, `fetchBackendHealth`) | Fuente de señal (con etiqueta honesta S03 clima/telemetría) y salud backend |
| `hooks/useRoboticsApi.js` | Señal robótica S50 (⚠️ corrige puerto hardcodeado `localhost:8000` → politítica `VITE_API_URL`/8010, ver `CMSC_UI_ARCHITECTURE` §12.1) |
| `stores/useLabStore.js` | Señal Elect→Math (federación) |
| `labs/TelecomLab.jsx` (AnalyserNode FFT) | Señal espectral S30 real local |
| `labs/AdvancedMathLabV2.jsx`, `labs/mathHelpers.js` | Modelado matemático S35 |
| `labs/ElectronicsLab.jsx` (+ `electronics/ports/circuitSimulationPort.js`, `falstadAdapter.js`) | Señal eléctrica S32/S33 |
| `data/lab-data.js` | Fuente del mapa de laboratorios (lectura) |
| `data/catalog-data.js`, `data/projects-data.js` | Hardware (por capacidad) y proyectos (eslabón impacto) |
| Estilo: `NEON_COLORS` (`App.jsx:28-33`, `lab-data.js:3-9`) | Continuidad visual (cian/verde/rojo, fondo `#0a0a0a`) |

**Conclusión Q10:** **~15 de las piezas** del dashboard ganador ya existen como componentes y servicios. Lo que falta (→ §11) son **capas de organización**, no elementos base.

---

## 11. Pregunta 11 — ¿Qué partes NO existen aún?

Lista honesta de lo que no está en el código (verificado en el árbol de `src/frontend/src/`):

| Pieza faltante | Dónde debería existir | Naturaleza |
|---|---|---|
| **Cinta del río científico** (hilo visual Sensores→…→Usuario) | `components/` (nuevo) | navegación |
| **Selector global de señales** (tiras por tipo: audio/temp/hum/RF/vibra…) | `components/` o en la cinta | navegación |
| **Vista `Dashboard CMSC`** (`/dashboard-cmsc`) | `pages/` | página nueva |
| **Vista de señales** (`/cmsc/senales`, catálogo S01..S80) | `pages/` | página nueva |
| **Vista espectral** (`/cmsc/espectral`, FFT/STFT/wavelets/espectrograma) | `pages/` | página nueva |
| **Vista matemática CMSC** (`/cmsc/matematica`, envoltura de Dr. Binary) | `pages/` | página nueva |
| **Vista IA CMSC** (`/cmsc/ia`, benchmark + mapa modelo→señal) | `pages/` | página nueva |
| **Vista Knowledge CMSC** (`/cmsc/knowledge`, evidencia conectada) | `pages/` | página nueva |
| **Vista ACP** (`/cmsc/acp`, consola + traza) | `pages/` | página nueva |
| **Panel de evidencia** (side del layout huésped) | `components/` | componente nuevo |
| **Badges de honestidad universales** (`REAL/SIM/REF/DISEÑO`) | `components/` | componente nuevo |
| **Termómetro de honestidad** (contadores por estado) | `components/` + fuente config | componente nuevo |
| **Registro/índice de evidencia** (señal→técnica→resultado→ancla KH) | `data/` o servicio | dato nuevo (contrato EVIDENCIA) |
| **RAG/búsqueda/grafo del KH** | backend/servicio | especificado, NO existe → se marca `DISEÑO` |
| **Motor multiagente (ACP + 6 sub-agentes)** | servicio externo agnóstico | 0% código → `DISEÑO` |
| **Técnicas espectrales unificadas (STFT, wavelets UI, espectrograma)** | vista espectral | solo Telecom FFT existe |

> **Nota crítica de honestidad:** la mayoría de "piezas faltantes" son **capas de organización** sobre activos existentes. El salto real de código es: la cinta, el selector de señales, las vistas `/cmsc/*`, el índice de evidencia y (futuro) el motor de agentes. Nada de esto se implementa sin gate + orden (§12).

---

## 12. Pregunta 12 — Roadmap preciso (F3A→F3E, F4)

Gates numerados. Cada fase es **diseño/aprobación > luego implementación con orden explícita**. Los pasos here descritos son el "qué" que una misión aprobada ejecutará.

### 12.1 F3A — INTERCONECTAR (cableado de señal, primero)
Objetivo: que una señal real fluya por la cadena con traza honesta — sin UI nueva.
- **Contenido (diseñado, sin ejecutar):**
  1. Índice de evidencia mínimo (contrato `señal_id → técnica → resultado → confidence → ancla KH`) como **dato config** consumible por frontend.
  2. Conectar Telecom (S30) como primera señal real al índice (`REAL·LOCAL` micrófono).
  3. Conectar temp/humedad V3 (S10/S11) vía `fetchTelemetrySeriesReal` con etiqueta honesta (no clima).
  4. Corregir política de puertos de robótica (`useRoboticsApi` hardcodeado `localhost:8000` → `VITE_API_URL`/8010) — **solo documento de especificación**, ejecución con orden.
- **Gate F3A:** la señal S30 (o S10) recorriendo el flujo completo de forma trazable y honesta en el prototipo.

### 12.2 F3B — ORGANIZAR (jerarquía labs vs capacidades)
Objetivo: reposicionar la navegación para que el ecosistema se lea como mapa, sin tocar `/labs`.
- **Contenido:**
  1. Especificar la **clasificación** (§5) como fuente de navegación (labs = nodos · capacidades = capas).
  2. Diseñar la transformación de `/labs` de catálogo a mapa (modo mapa opcional, §1.4).
  3. Definir el **layout huésped** conceptual (topnav + cinta + panel principal + panel evidencia + VoiceAssistant) según `CMSC_UI_ARCHITECTURE` §1.3.
- **Gate F3B:** aprobación del mapa de navegación y el layout huésped.

### 12.3 F3C — CMSC DASHBOARD (vista principal)
Objetivo: la primera impresión científica (`/dashboard-cmsc`).
- **Contenido:**
  1. Dashboard CMSC con: resumen del río, señales vivas (2 reales + S30 local), última evidencia, puertas de labs, termómetro de honestidad (§2).
  2. Badges honestidad universales y termómetro como componentes nuevos.
- **Gate F3C:** `/dashboard-cmsc` mostrando estado honesto real del ecosistema (leído del mapa + fetch existentes).

### 12.4 F3D — SIGNAL NAVIGATION (navegación por señales)
Objetivo: la señal como columna vertebral.
- **Contenido:**
  1. Selector global de señales (tiras por tipo: audio/temp/humedad/RF/bioacústica/vibración/imágenes/telemetría).
  2. Vista `/cmsc/senales`: catálogo vivo S01..S80, filtros por tipo/dominio/estado, ficha por señal con traza.
  3. Vista `/cmsc/espectral`: paneles FFT/STFT/wavelets sobre las señales del mapa (reusando AnalyserNode/`useLabStore`), con código de honestidad espectral.
- **Gate F3D:** navegar por "Audio" → S30 → Telecom + espectro real; por "Temperatura" → V3 → modelado.

### 12.5 F3E — KNOWLEDGE INTEGRATION (conocimiento como destino de evidencia)
Objetivo: cierre conceptual de la cadena hacia el KH.
- **Contenido:**
  1. Vista `/cmsc/knowledge`: envoltura que añade "evidencias de este tema" y "señales relacionadas" a los 51 docs reales.
  2. Panel de evidencia (side) conectando señal → resultado → doc KH (sin RAG; RAG marcado `DISEÑO`).
  3. Vista `/cmsc/matematica` envolvente de Dr. Binary y vista `/cmsc/ia` (mapa modelo→señal + benchmark M1/M2).
- **Gate F3E:** una evidencia real (ej. espectro S30) enlazada a un doc del KH; mapa modelo→señal mostrando `—` donde no hay modelo (honestidad).

### 12.6 F4 — ACP (orquestación multiagente)
Objetivo: el CMSC como consola del científico.
- **Contenido:**
  1. Vista `/cmsc/acp`: consola de consulta (texto+voz) + panel de orquestación con traza de agente.
  2. Motor ACP agnóstico (LLM intercambiable, runtime local/self-hosted) + sub-agentes leyendo stores/fetch existentes.
  3. Superficies: texto + voz conectadas al ACP **con fallback preservado** a `routeMap`/`/assist`.
  4. (Diseño) APIs y automatización marca futura.
- **Gate F4:** CMSC estable respondiendo "analiza el espectro del micrófono" con traza completa y ancla KH — candidato a dockerización (siempre tras aprobación).

### 12.7 Orden de precedencia y no-regresión
- **F3A primero:** sin señal trazable no hay nada que mostrar. **F3B/F3C en paralelo** (organización + primera vista). **F3D después de F3C** (la navegación por señal necesita el lenguaje visual del dashboard). **F3E cuando existan evidencias** del F3A. **F4 al final**.
- Cada gate requiere **aprobación explícita de Bernardo**; ningún paso se implementa por este documento (solo estrategia).

---

## 13. Respuesta final — cómo llegar a la imagen objetivo sin destruir

> **Imagen objetivo:** un usuario entra al CMSC y **no ve laboratorios aislados**: ve un **ecosistema vivo** donde una misma señal viaja por Matemáticas → Electrónica → Telecom → Robótica → IA → Knowledge Hub → ACP, sin abandonar nunca el flujo de conocimiento.

### 13.1 La respuesta en una frase
> **Preservar todo lo construido, conectar lo que ya se tocaba, y añadir una capa de organización (navegación por señal + cinta del río + evidencia) que haga visible la cadena que siempre estuvo en la visión — sin reescribir ni un solo laboratorio.**

### 13.2 Los 5 compromisos anti-destrucción
1. **Sin reescribir:** ningún `.jsx` existente se modifica; las vistas `/cmsc/*` y `/dashboard-cmsc` son **componentes/páginas nuevos** que *leen* stores, `fetch` y registry existentes (Q10).
2. **Sin perder:** `/labs` (LabCatalog) y `lab-data.js` se conservan íntegros como catálogo académico; los labs V1 y SchematicEditor quedan en git como archivo (regla NADA DESAPARECE).
3. **Sin duplicar:** una única fuente de señal (el mapa S01..S80), un único store federado (`useLabStore`), un único KH (`registry`). El CMSC etiqueta, no replica (Q9 anti-patterns).
4. **Sin romper:** el ACP y los sub-agentes **añaden** comportamiento con fallback preservado (`routeMap`, `/assist`); la voz y el dashboard actuales continúan funcionando (Q7).
5. **Con honestidad en cada pixel:** todo dato muestra `REAL` / `SIM` / `REF` / `DISEÑO`; las señales sin modelo muestran `—`; el modelo degenerado, el clima externo y las simulaciones se etiquetan sin ocultamiento (Q2, Q4).

### 13.3 La ruta en un párrafo
Cablea primero una señal real (S30 espectral o S10 telemetría) hasta el índice de evidencia (**F3A**); organiza la navegación labs-vs-capacidades y aprueba el layout huésped (**F3B**); materializa el `/dashboard-cmsc` con termómetro de honestidad y badges (**F3C**); convierte la señal en columna vertebral con las vistas de señales y espectral (**F3D**); enlaza la evidencia al Knowledge Hub real (**F3E**); y solo entonces levanta el ACP sobre los 6 sub-agentes con fallback agnóstico (**F4**). El resultado: **todo lo que existe sigue existiendo, y por primera vez se ve conectado.**

---

## 14. No-regresión (qué NO hace esta estrategia)

1. No modifica un solo archivo de `src/frontend/src/**`.
2. No crea rutas, stores, endpoints ni componentes (es diseño; cualquier ejecución requiere gate + orden).
3. No toca backend, Docker, Telemetry Context, `SensorReading`/`RobotTelemetry`, BBB, Knowledge Hub ni IA existente.
4. No desbloquea `AdvancedMathLab` V1 ni `SchematicEditor` (permanecen en cuarentena/archivo).
5. No promueve el modelo degenerado `plant_disease_mbv2.h5` (se etiqueta honestamente).
6. No cambia la identidad (NO es "dashboard IoT genérico").

---

## 15. Trazabilidad documental

| Concepto de la estrategia | Ancla |
|---|---|
| Veredicto lab matemático = modelador | `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` §12 |
| Telecom = señal acústica real | `CMSC_SIGNAL_MAP_v1.md` S30 · `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` §10.4 |
| useLabStore = federación inicial | `useLabStore.js:1-111` · `CMSC_MASTERPLAN_v1.md` §9 |
| Lab Espectral = pendiente estratégico F2 | `CMSC_MASTERPLAN_v1.md` §4 · `CMSC_SIGNAL_MAP_v1.md` §5 |
| Cinta del río / layout huésped | `CMSC_UI_ARCHITECTURE_v1.md` §1.2-1.3 |
| Vista de señales / espectral / matemática / IA / KH / ACP | `CMSC_UI_ARCHITECTURE_v1.md` §3-§8 |
| Multiagente ACP + 6 sub-agentes | `CMSC_MASTERPLAN_v1.md` §5 · `CMSC_UI_ARCHITECTURE_v1.md` §8 |
| Agnosticismo / honradez de estado | `CMSC_MASTERPLAN_v1.md` §6 + C6 · `VISION_ALIGNMENT.md` P4/P6 |
| Cadena de 10 eslabones / labs | `docs/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` §2-§4 |
| Vision de cadena / labs comunicados | `docs/SIGCTIARURAL_VISION_ALIGNMENT.md` §2 · P2 |
| Rutas actuales preservadas | `App.jsx:110-148` · `TopNav.jsx:24-31` |
| Modelo degenerado / honestidad IA | `SIGNAL_MAP` S74 · `CMSC_UI_ARCHITECTURE` §6 |

---

*Documento de DISEÑO v1 — Estrategia de implementación evolutiva del Dashboard CMSC. Sin código, sin commits. HEAD de referencia: `18b95b1` (feature/ubtn-biological-telemetry, 2026-09-27).*