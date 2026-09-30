# CMSC F3A — Plano de Interconexión del Ecosistema (Blueprint v1)

| Campo | Valor |
|---|---|
| Estado del documento | **DISEÑO v1 (arquitectura de integración)** — sin implementación |
| Fase | **F3A (Interconexión) del roadmap CMSC** `MASTERPLAN_v1` / `DASHBOARD_IMPLEMENTATION_STRATEGY_v1` |
| Fecha | 2026-09-27 |
| Rama | `feature/ubtn-biological-telemetry` (HEAD `18b95b1`, sin commits) |
| Modo | SOLO DISEÑAR Y DOCUMENTAR — NO implementar, NO commits, NO modificar componentes, NO tocar backend/IA/Telemetry Context |
| Documentos base | `CMSC_SIGNAL_MAP_v1.md` · `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` · `CMSC_DASHBOARD_IMPLEMENTATION_STRATEGY_v1.md` |
| Regla suprema | NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA |
| Lema F3A | **Envolver y conectar, jamás sustituir** |

---

## 1. Propósito y alcance

F3A es la fase que **conecta** el ecosistema: hace explícita y trazable la red por la que cada señal fluye desde su sensor hasta el conocimiento verificado y el impacto (`Señal → Productor → Consumidor → Modelador → IA → KH → ACP → Usuario`). Esta fase **no fabrica señal alguna**: la señal nace en los laboratorios ya existentes y en la telemetría ya existente. F3A solo la **nombra, la enruta, la honra**.

### Qué hace F3A
- Inventaríar (verificado en código) cada fuente de señal, consumidor, modelador y generador de conocimiento existente.
- Definir **puertos de lectura** (contrato de interconexión) por los que un laboratorio expone y consume datos, **sin cambiar su código**.
- Diseñar la evolución **aditiva y compatible** de `useLabStore`.
- Definir la red completa Señal→Impacto y los **adaptadores mínimos** que la materializarán.
- Fijar los **gates** que aprueban F3A y habilitan F3B.

### Qué NO hace F3A (prohibiciones explícitas)
- NO refactorizar, reescribir ni migrar ningún laboratorio.
- NO crear laboratorios nuevos (el Lab Espectral sigue siendo una **capacidad transversal**, no un lab independiente).
- NO tocar `SchematicEditor` (motor legado oculto en cuarentena), ni backend, ni modelos, ni `SensorReading`/`RobotTelemetry`, ni Docker, ni BBB.
- NO eliminar archivos. Nada que exista hoy se borra o se reemplaza.

---

## 2. Principios de interconexión

1. **La señal es el bien central, no el laboratorio.** Los labs existen para producir, consumir y modelar señales; la red se ordena alrededor de las señales.
2. **Aditividad**: toda conexión nueva se introduce como capa de lectura/enlace/envoltura; ninguna clave existente se elimina ni se re-semantiza.
3. **Honestidad de estado**: toda señal que circule lleva su estado canónico (`REAL` / `REAL-LOCAL` / `SIM` / `DISENO` / `ROTO` / `HUERFANO`). Un dato simulado jamás se presenta como real y viceversa.
4. **Trazabilidad KH**: todo resultado que produzca conocimiento debe enlazarse al registro de documentos del KH, nunca duplicarse.
5. **Compatibilidad**: `useLabStore` sigue siendo la "mochila de datos" federada; los puertos nuevos son columnas nuevas, no cambios de clave.
6. **Sin fabricaciones**: si una señal prometida no existe, se declara como `DISENO`/`HUERFANO`, no se inventa.

---

## 3. Inventario verificado de fuentes reales (evidencia de archivo)

Leyenda: **ESTADO** = REAL / REAL-LOCAL / SIM / DISENO / ROTO / HUERFANO.

| # | Componente | Rol actual | Señal que toca | Estado del dato |
|---|---|---|---|---|
| 1 | `ElectronicsLab.jsx` | Producir señales de circuito (genera VIN/VOUT con `useLabStore`) | Señal eléctrica simulada (circuito del SchematicEditor) | `SIM` — simulación activa visible |
| 2 | `AdvancedMathLabV2.jsx:5` | Modelar la señal de Electrónica (lee `state.electronicsData`) | Puente vivo **Elect → Math** | `SIM` — modelado sobre simulación |
| 3 | `TelecomLab.jsx` (Spectrum) | Capturar audio real del micrófono (`getUserMedia` + `AnalyserNode.fftSize=2048`) | **S30 micrófono — única señal acústica REAL** del ecosistema | `REAL-LOCAL` — solo en el navegador, sin persistencia |
| 4 | `TelecomLab.jsx` (Radio) | Enlace/visual de radio (BBB) | RF (plan/prevista) | `DISENO` — prometida, no operativa |
| 5 | `RoboticsLab.jsx` | Orquestación simulación física + telemetría | `RobotTelemetry` (PHYSICS-BOT-01 vía `useRoboticsApi`) | `ROTO`/`REAL-LOCAL` — host mal configurado (ver #18) |
| 6 | `RoboticsLab.jsx` (Gemelos Digitales) | Omniverse/Newton/ROS2 | N/A | `DISENO` — tarjetas a herramientas externas |
| 7 | `EmbeddedLab.jsx` | Simuladores embebidos embebidos vía iframes externos | Plan `UBTN` (S73) | `DISENO` — no implementado; UBTN 100% diseño |
| 8 | `DataScienceLab.jsx` | Pyodide (Python en navegador) + Plotly + SSE `/events` | Datos públicos (iris) + inferencia IA en vivo | `SIM` — experimentos; exitoso en vivo |
| 9 | `AIPredictiva.jsx` | Inferencia IA (`/api/v3/ai/inference/`), modos `real`/`simulation`/`robot_demo` | Imagen de hoja (clasificación binaria) | `SIM` en demos (declarado) — modelo productivo degenerado (`plant_disease_mbv2.h5`) |
| 10 | `KnowledgeHubLayout.jsx` + `knowledgeRegistry.generated.json` | Grafo de conocimiento (51 docs, 6 categorías) | Conocimiento verificado / canónico | `REAL` — registro activo |
| 11 | `cloud.js` `fetchClusterNodesReal` | Métricas de clúster BBB | S04 (cluster) | `SIM` — fabricado (no consulta BBB real) |
| 12 | `cloud.js` `fetchTelemetrySeriesReal` | "Telemetría" del frontend | **Dato clima externo Open-Meteo** | `REAL-LOCAL` (clima, NO rural) — **etiquetado actualmente como telemetría = falta de honestidad a corregir en F3A/F3B** |
| 13 | `useRoboticsApi.js:3` | Cliente telemetría robot | `RobotTelemetry` | `ROTO` — host fijo `http://localhost:8000/api` (backend real 8010, y política de entorno) |
| 14 | `useLabStore.js` (`bridgeStatus`) | Campo `connected:true` de BRIDGE sin ningún consumidor | N/A | `HUERFANO` — reclama conexión inexistente (no se borra; se etiqueta en F3B) |
| 15 | Backend/FastAPI (8010) + `ai_service` (8081) + PostgreSQL | APIs vivas en Docker | SensorReading V3 (temp/humedad) | `REAL` — operativo en backend, **NO consumido por el frontend nuevo (5174)** |
| 16 | Frontend legacy Docker (5173) | Baseline visual (TFLite, BBB, telemetría histórica) | SensorReading histórico + MQTT en su época | `REAL` — referencia congelada |
| 17 | Frontend nuevo Vite (5174) | Laboratorio activo de evolución CMSC | Ninguna señal real aún (no hay socket/SSE hacia 8010) | `HUERFANO` en el origen: 5174 hoy es un frontend sin datos |
| 18 | `VITE_AI_API_BASE` (DataScienceLab) | Apunta a `https://sigct-backend.onrender.com` (deploy remoto) | Inferencia IA | `REAL-LOCAL`/`ROTO` — host inconsistente con el cluster local |
| 19 | KH categoría `research-v2` (18 docs) | Resultados de investigación del ecosistema | Conocimiento reciente | `REAL` |

**Conclusión dura del inventario (honestidad):**
- Solo **3 señales con existencia real** hoy: (a) micrófono Telecom en navegador (`REAL-LOCAL`), (b) `SensorReading` V3 temp/humedad en backend (`REAL`, sin consumidor en el frontend nuevo), (c) `RobotTelemetry` en backend (`REAL`, con el cliente roto por host).
- El resto del "ecosistema de señales" es `SIM`, `DISENO` o `HUERFANO`.
- La red F3A debe **conectar lo real, nombrar lo simulado y etiquetar lo roto**; jamás simular conexión donde no la hay.

---

## 4. Flujo canónico de la señal (Q1)

La cadena de valor que F3A hace explicita en el ecosistema (todos los eslabones son **vistas/lécturas**, no �componentes nuevos):

```
SENSOR / FUENTE
 ├─ SensorReading V3 (temp/humedad) ............ REAL backend
 ├─ RobotTelemetry (PHYSICS-BOT-01) ............. REAL backend (cliente ROTO)
 ├─ Micrófono Telecom (fftSize=2048) ............ REAL-LOCAL navegador
 ├─ Circuito ElectronicsLab ..................... SIM
 ├─ Datos públicos (iris) / SSE inferencia ...... SIM / REAL-LOCAL
 └─ Open-Meteo clima ............................ REAL-LOCAL (etiquetar como clima, NO rural)
        │
        ▼  [adquisición: puertos de lectura — ver §10]
   CAPA DE SEÑALES (lectura unificada con estado honesto)
        │
        ▼  [consumo: quién necesita cada señal — ver §5/c]
 CAPRES CONSUMIDORES (Elect→Math, DataScience→IA, Señal→Espectral)
        │
        ▼  [modelado: transformar la señal — ver §5/d]
   MODELADORES (MathV2: FFT/derivadas sobre Elect; Espectral(transversal): FFT/STFT/Wavelets)
        │
        ▼  [IA: predicción/clasificación/anomalías — ver §5/e]
   MOTORES IA (AIPredictiva; benchmarks M1/M2 ya congelados como referencia)
        │
        ▼  [conocimiento: registrar, no duplicar — ver §7]
   KNOWLEDGE HUB (registry 51 docs / research-v2)
        │
        ▼  [interpretación: ACP — ver §8]
   ACP (Monólogo del científico; capa de conversación, fallback seguro)
        │
        ▼
   IMPACTO (Dashboard CMSC: río de señal, termómetro de honestidad, acción)
```

Regla de paso: **cada eslabón recibe la señal + su estado**; si un eslabón transforma la señal (modelado), el nuevo estado se deriva del anterior (ej. `SIM`→`SIM-modelado`, `REAL`→`REAL-modelado`).

---

## 5. Matriz de roles por laboratorio (Q2–Q5)

### Q2 — Productores de señal

| Productor | Señal que produce | Estado | Destino previsto en F3A |
|---|---|---|---|
| ElectronicsLab | Formas de onda VIN/VOUT, simulación de circuito | SIM | AdvancedMathLabV2 (ya conectado), Espectral (transversal), KH |
| TelecomLab (mic) | S30 señal acústica (FFT en `AnalyserNode`) | REAL-LOCAL | Espectral (transversal), KH, ACP |
| DataScienceLab | Datasets públicos procesados, métricas SSE | SIM | KH, ACP |
| Backend (SensorReading) | Temp/humedad V3 | REAL | Telemetría del Dashboard CMSC |
| Backend (RobotTelemetry) | Pose/estado robot | REAL | Robótica + Telemetría |
| Open-Meteo (clima) | Serie climática externa | REAL-LOCAL | Etiquetar como clima (NO rural) antes de mostrarlo |
| UBTN (S73) | Señal biométrica (diseño) | DISENO | Nodo futuro; hoy solo sentinela en el mapa |

### Q3 — Consumidores de señal

| Consumidor | Señal que consume | Uso |
|---|---|---|
| AdvancedMathLabV2 | `electronicsData` de Elect | Modela la señal del circuito |
| DataScienceLab | SSE `/events` de IA | Grafo de confianza/clases en vivo |
| AIPredictiva | Imagen + inferencia | Diagnóstico vegetal (binario) |
| Dashboard CMSC (futura vista) | Todas las señales con estado | Visualización en río + termómetro |

### Q4 — Modeladores de señal

| Modelador | Señal de entrada | Transformación | Estado |
|---|---|---|---|
| AdvancedMathLabV2 | Elect (VIN/VOUT) | Matemáticas de la señal (FFT presente, derivadas/integral/PID en arXiv de su cosecha) | SIM |
| Lab Espectral (capacidad transversal, vista `/cmsc/espectral`) | S30 micrófono, señales del río | FFT / STFT / Wavelets / Espectrogramas / Bioacústica | Diseño F3A→F3C (no es lab independiente) |
| Benchmark IA (M1 MobileNetV2 · M2 EfficientNet-B0) | Imágenes Dataset V2+ | Clasificación | Referencia congelada (decisión final pendiente) |

### Q5 — Generadores de conocimiento

| Generador | Qué produce | Se registra en | Catálogo KH |
|---|---|---|---|
| Misiones IA/ML (M1/M2) | Manifiestos de benchmark | `Documentacion/IA/*` | research-v2 (p. ej. `ESTADO_ACTUAL_BENCHMARKS`) |
| Auditoría forense (2026-09-27) | Veredicto de rescate, señal como evidencia | `Documentacion/Arquitectura/*` | eiarc-architecture |
| Labs (Elect/Math/Telecom) | Resultados de simulación/acústica | Se decide en F3B (autenticidad de resultados) | knowledge-base |
| ACP | Interpretación del científico | Respuestas contextuales | Se enlaza con routeMap |

**Columna KH vacía (hallazgo del RESTRUCTURING_PLAN):** ningún laboratorio escribe hoy al KH; `knowledgeRegistry.generated.json` es un **grafo de lectura**, no un destino de escritura. F3A conecta la **lectura**; la **escritura** de evidencias de labs es F3B/F3C (con hangares de autenticidad para no contaminar `research-v2`).

---

## 6. Evolución de `useLabStore` sin romper compatibilidad (Q6)

El store actual (`useLabStore.js:9`) es la "mochila de datos" federada con las claves:
`electronicsData {active, signals{vin,vout,time}, schematic{nodes,edges}, simulationResults{history,analysis,netlist}, params{vinAmp,vinFreq,vcc,rc}, lastUpdate}` y acciones `setSimulationResults` / `setSchematic` / `setElectronicsSignal` / `setBridgeStatus` / `reset`.

Hallazgos verificados:
- **Consumidor único real hoy:** `AdvancedMathLabV2.jsx:5` (lee `electronicsData`). Ningún otro lab escribe/lee.
- **`bridgeStatus` (`connected:true`) es huérfano**: nadie lo consume. No se borra, se etiqueta.

### Diseño de evolución aditiva (F3A → F3B)
1. **No se toca ninguna clave existente.** Todo selector de señales es una **rama nueva** del estado.
2. Se añade una sección declarativa **`signalRegistry`** (no-operativa en F3A, a poblar en F3B) con la forma:
   - `id` (identificador de señal, alineado a `CMSC_SIGNAL_MAP` S-IDs)
   - `source` (componente productor)
   - `status` (REAL/REAL-LOCAL/SIM/DISENO/ROTO/HUERFANO)
   - `consumers` (componentes que la leen)
   - `path` (pub de acceso futuro: store / SSE / fetch)
3. Los **puertos de lectura** (§10) son funciones de **propósitos de lectura, no escrituras** en F3A — leen el estado existente sin mutarlo.
4. `setBridgeStatus` queda congelado (no se borra); F3B propone renombrar `bridgeStatus` a `honestyStatus` con migración controlada **solo si todos los consumidores aprueban el cambio** (hoy no hay ninguno).

Criterio de no-rotura: **ninguna clave existente cambia de forma ni de semántica en F3A.**

---

## 7. Integración del Knowledge Hub sin duplicar (Q10)

- El KH es **grafo de lectura** (`knowledgeRegistry.generated.json`, 51 docs, 6 categorías: project-core 7 · eiarc-architecture 13 · eiarc-foundation 3 · research-v2 18 · knowledge-base 6 · historical 4). Fuente de verdad: `canonical_path`; ruta front: `/knowledge/doc/:docId`.
- **Regla de no-duplicación**: la red F3A **enlaza documentos existentes**, no crea nuevos. Cada enlace de señal→conocimiento referencia `document.id` del registry.
- **Puerto KH-F3A**: un selector `docsBySignal(signalId)` que devuelve los documentos cuyo contenido describe o se genera a partir de esa señal (leyendo `tags`/`category` del registry). Implementación F3B; en F3A basta el **contrato** (contrato de lectura, sin código).
- Los docs de esta misión (`CMSC_*`) deben **aparecer en el registry** en F3B para que el mapa científico los muestre (el registry es generado; el proceso de regeneración es un artefacto del KH — revisión de política, no código de labs).
- Lo que NO se duplica: manifiestos de benchmark, planes maestros, mapas de señal. El KH solo los cita.

---

## 8. Incorporación de señales (Q11)

| Señal | Origen | Estado hoy | Puertos previstos en F3A/F3B |
|---|---|---|---|
| Temp/humedad V3 (`SensorReading`) | Backend 8010 · PostgreSQL | REAL (sin consumidor en 5174) | Adaptador SSE/fetch hacia Dashboard CMSC; honestidad: mostrar como telemetría REAL |
| `RobotTelemetry` | Backend · `useRoboticsApi` | REAL (cliente con host ROTO) | Corregir política de URL (`VITE_API_URL` apuntando a 8010) — ver §12 riesgo R3 |
| S30 micrófono | Navegador (TelecomLab) | REAL-LOCAL efímero | Captura explícita → señal `acoustic` con timestamp → Espectral(transversal) |
| RF / espectros | TelecomLab (Radio) y MathV2 (FFT duplicada) | DISENO / SIM | Resolver duplicidad FFT Telecom↔MathV2 vía **capacidad trasversal compartida** (F3C), sin borrar ninguna vista |
| Clima Open-Meteo | `cloud.js` | REAL-LOCAL | **Re-etiquetar como `clima-externo`, NO como telemetría rural** (o quitar de la telemetría) |
| Cluster BBB | `cloud.js` | SIM fabricado | Etiquetar `SIM` visiblemente; **no presentar como real** |
| UBTN (S73) | Diseño | DISENO | Nodo futuro en el mapa; no se implementa en F3A |
| Señales futuras | Cualquier fuente nueva | DISENO | Entran por el mismo contrato de puertos (aditividad) sin modificar labs |

**Principio:** toda señal incorporable a la red necesita: (1) un **productor identificado**, (2) un **estado honesto**, (3) un **puerto de lectura**. Sin eso, no entra a la red.

---

## 9. Red completa Señal→Productor→Consumidor→Modelador→IA→KH→ACP→Usuario (Q12)

```
                ┌──────────────────────────────────────────────────────────────┐
                │                    CAPA DE SEÑALES (read-only)               │
                │  sensor-real  ·  robot-real · mic-real-local · sim · diseno │
                └───────────────────────────────┬──────────────────────────────┘
                                 lee (puertos §10) │ estado honesto adjunto
                 ┌───────────────┬───────────────┼───────────────┬───────────────┐
                 ▼               ▼               ▼               ▼               ▼
   ELECTRO lab    TELECOM lab    MATH V2 lab    DATA SCIENCE     IA PREDICTIVA
   produce SIM    produce REAL   consume/hace   consume SSE     consume imagen
   (VIN/VOUT)     (S30 acústica) FFT/derivadas  /HACE plots     /produce diagnóstico
        │               │              │              │                 │
        └───────────────┴──────────────┴──────────────┴─────────────────┘
                          │ (resultados con estado)
                          ▼
                ┌─────────────────────────────────┐
                │  KNOWLEDGE HUB (51 docs, 6 cat) │  ← lecturas, sin duplicación
                └─────────────────────────────────┘
                          │
                          ▼
                ┌───────────────────────────────────┐
                │ ACP · Monólogo del científico      │  ← interpretación + acción
                │ (fallback por capas con routeMap)  │
                └───────────────────────────────────┘
                          │
                          ▼
                ┌───────────────────────────────────────────────┐
                │ IMPACTO · Dashboard CMSC (F3E)                │
                │ río de señal · termómetro de honestidad · acción│
                └───────────────────────────────────────────────┘
```

Detalles estructurales de la red:
- La **capa de señales** es solo lectura; ningún lab modifica la señal de otro directamente.
- Cada transformación (producción→modelado→IA→conocimiento→interpretación) **añade una capa** al estado; no reemplaza la anterior.
- El **ACP** se alimenta de la capa de señales + KH; sus respuestas son interpretación, no fabricación (si no hay señal, responde `DISENO`/`no-data` — con el fallback `/assist` vigente preservado).
- El **usuario final** llega por el Dashboard CMSC (evolución de `/labs` según `DASHBOARD_IMPLEMENTATION_STRATEGY`).

---

## 10. Puertos de lectura (contrato de interconexión — Q14)

Los adaptadores mínimos de F3A son **funciones de morfología-lectura** que conectan la capa de señales con los componentes existentes **sin tocar su código**. Contrato (diseño):

| Puerto | Origen | Qué lee | Salida (a construir en F3B) |
|---|---|---|---|
| P-LAB-01 | `useLabStore.electronicsData` | Señal VIN/VOUT + parámetros del circuito | Filas `{id, signal, status:'SIM', route:'lab:eletron', ts}` |
| P-LAB-02 | TelecomLab Spectrum | Buffer actual del `AnalyserNode` (S30) | Serie acústica con `status:'REAL-LOCAL'`, FFT disponible |
| P-LAB-03 | RoboticsLab / `useRoboticsApi` | Telemetría del robot (una vez saneado el host) | Filas `{id:'robot_telemetry', status:'REAL'}` o `ROTO` si el host falla |
| P-BE-01 | Backend 8010 (SensorReading) | Temp/humedad V3 | Serie `REAL` con bando de sensores |
| P-WEATHER-01 | `cloud.js` clima | Serie Open-Meteo | Serie `REAL-LOCAL` etiquetada `clima-externo` (NO rural) |
| P-IA-01 | `AIPredictiva` / SSE | Última inferencia | `{image, diagnosis, confidence, status}` con clasificación binaria honesta |
| P-KH-01 | `knowledgeRegistry.generated.json` | `docsBySignal(signalId)` | Lista de `document.id` vinculados a la señal |

Reglas del contrato:
1. Todo puerto devuelve **señal + estado + trazabilidad (route)**.
2. Ningún puerto escribe en el store en F3A (solo lectura).
3. Si el origen no responde, el puerto devuelve estado `ROTO`/`DISENO` — **jamás fabrica**.

---

## 11. Componentes reutilizables (Q13)

Reutilización = lectura + enlace + envoltura (nunca sustitución). Componentes verificados:

| Componente | Reutilización en F3A | Evidencia |
|---|---|---|
| `TelecomLab.jsx` (Spectrum) | Única fuente acústica real del ecosistema — se envuelve como productor `S30` | WebAudio `AnalyserNode.fftSize=2048` |
| `AdvancedMathLabV2.jsx` | Modelador vivo de señal (puente Elect→Math) | lee `electronicsData` |
| `ElectronicsLab.jsx` | Productor de señal eléctrica SIM | `useLabStore` + SchematicEditor oculto |
| `useLabStore.js` | Mochila federada; base del `signalRegistry` | claves existentes congeladas |
| `KnowledgeHubLayout.jsx` + registry | Grafo de conocimiento (lectura) | 51 docs, 6 categorías |
| `AIPredictiva.jsx` | Motor de inferencia (reorganizar: honestidad de modos) | modos real/sim/demo declarados |
| `DataScienceLab.jsx` | Sandbox Python + SSE en vivo | Pyodide + Plotly + `/events` |
| `TopNav.jsx` | Enrutado de navegación (host para el acceso CMSC) | nav actual |
| `Dashboard.jsx` | Host visual del río de señal (F3E) | layout actual |
| `LabCatalog.jsx` + `lab-data.js` | Catálogo académico de labs (advertencia: NO es el mapa científico) | categorías actuales |
| M1/M2 benchmarks | Referencia científica del área IA congelada | manifiestos `Documentacion/IA/*` |
| `Telemetry3DScene` (lazy) | Visual 3D de telemetría robot | RoboticsLab |

---

## 12. Riesgos de interconexión y mitigaciones (Q15)

| ID | Riesgo | Severidad | Mitigación F3A |
|---|---|---|---|
| R1 | `fetchTelemetrySeriesReal` (Open-Meteo) presentado como telemetría rural = **engaño de estado** | Alta | Re-etiquetar `clima-externo` REAL-LOCAL; termómetro de honestidad lo declara en el Dashboard |
| R2 | `fetchClusterNodesReal` (fabricado) muestra métricas BBB como si existieran | Alta | Etiquetar `SIM`; bloquear presentación como real hasta conectar BBB |
| R3 | `useRoboticsApi.js:3` fija `http://localhost:8000/api` (host inexistente con backend en 8010) | Alta | Política de entorno `VITE_API_URL` → 8010 (diseño; verificación de puerto primero) |
| R4 | `SchematicEditor` (motor legado) oculto; no romper su envoltura | Media | No tocar; ya está tras `SHOW_LEGACY_ENGINE_TOGGLE=false` |
| R5 | Duplicidad FFT entre TelecomLab y MathV2 | Media | Capacidad transversal compartida (Espectral) en F3C; ninguna vista se borra |
| R6 | `bridgeStatus.connected:true` huérfano sugiere puente inexistente | Media | Etiquetar `HUERFANO`; No borrar; renombrar solo cuando no haya consumidores (hoy cero) |
| R7 | 5174 = frontend sin señales reales conectadas (sin SSE/fetch a 8010) | Alta | F3A define contratos; F3B implementa los adaptadores de los puertos §10 |
| R8 | Escribir al KH sin delimitación (contaminar `research-v2`) | Media | F3A solo lectura; escritura de labs es F3B/F3C con hangares de autenticidad |
| R9 | `AIPredictiva` demo (fotos Wikimedia) podría leerse como inferencia oficial | Media | Ya declara "Escenario demostrativo"; el modo de honestidad se refuerza en el Dashboard |
| R10 | Fractura del store al añadir ramas | Baja | Aditividad estricta: ninguna clave existente cambia (§6) |

---

## 13. Gates de aprobación F3A → salida a F3B (Q16)

F3A se considera **APROBADO** cuando se cumplan todos estos gates (verificables por documento, no por código):

- **G-01** Plano de interconexión aprobado y trazable a los 16 ejes de la misión (Q1..Q16) — este documento.
- **G-02** Nombres, estados y roles de cada laboratorio/servicio **verificados en código** (tabla §3) sin ambigüedad.
- **G-03** Contrato de puertos de lectura (§10) revisado y sin conflictos con los componentes existentes.
- **G-04** Riesgos R1..R10 con mitigación asignada y aceptación de la capa de honestidad.
- **G-05** Documentos adjuntos (`SIGNAL_MAP`, `RESTRUCTURING_PLAN`, `DASHBOARD_IMPLEMENTATION_STRATEGY`, `FORENSIC_AUDIT`) incorporados como entrada del plano; **sin implementación alguna en el working tree más allá de documentación**.
- **G-06** Ningún commit realizado; HEAD `18b95b1` intacto; working tree solo con docs (más el working tree ya existente del snapshot del 2026-09-27).

Aprobado F3A ⇒ se habilita **F3B (capas de adaptadores de puertos + saneamiento de honestidad R1/R2/R3)** del roadmap F3A→F3B→F3C→F3D→F3E→F4 con orden explícita y misión nueva.

---

## 14. Honestidad final y huérfanos no tocados

- **Lo que este plano NO hace:** no fabrica señal, no muta datos, no crea labs, no toca backend/IA/telemetry, no borra nada.
- **Señales que el ecosistema promete pero hoy no entrega:** UBTN (S73) `DISENO`; RF `DISENO`; MQTT `NO-OPERATIVO`; cluster BBB `SIM`; telemetría "rural" del clima `REAL-LOCAL-etiqueta-errónea`. Todas quedan **nombradas y etiquetadas**, nunca fabricadas.
- **Puentes que ya existen y se preservan:** `AdvancedMathLabV2 → electronicsData` (Elect→Math) es el único puente vivo; se extiende, no se sustituye.
- **Siguientes entregables documentales (misma línea, sin código):** nada adicional salvo orden de Bernardo. El próximo paso real es F3B bajo misión explícita.

---

*Fin del plano F3A v1 — diseñado para conectar lo real, nombrar lo simulado y etiquetar lo roto. La señal es el bien central; el ecosistema es su red.*