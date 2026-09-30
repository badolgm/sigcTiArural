# SIGCTiArural · CMSC — F3B Ecosistema de Productores de Señales (Blueprint v1)

| Campo | Valor |
|---|---|
| Estado del documento | **DISEÑO v1 · Arquitectura de sistema · Evolución controlada** — sin implementación |
| Fase | **F3B (Ecosistema de Productores de Señales)** del roadmap CMSC `MASTERPLAN_v1` / `F3A_INTERCONNECTION_BLUEPRINT_v1` |
| Fecha | 2026-09-27 |
| Rama | `feature/ubtn-biological-telemetry` (HEAD `18b95b1`, sin commits) |
| Modo | SOLO DISEÑAR Y DOCUMENTAR — NO implementar, NO commits, NO tocar laboratorios, NO refactorizar componentes |
| Documentos base | `CMSC_MASTERPLAN_v1.md` · `CMSC_SIGNAL_MAP_v1.md` (S01..S80, 12 dominios) · `CMSC_F3A_INTERCONNECTION_BLUEPRINT_v1.md` (puertos P-LAB/P-BE/P-WEATHER/P-IA/P-KH) · `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` (roles por lab) |
| Regla de oro | **LAS SEÑALES SON EL CENTRO, NO LOS LABORATORIOS** |
| Lema F3B | cualquier señal futura entra al CMSC **sin volver a rediseñar el ecosistema** |

---

## 1. Propósito y alcance de F3B

F3A demostró que ElectronicsLab, AdvancedMathLabV2, TelecomLab, Knowledge Hub, AI Predictiva y `useLabStore` son **consumidores y modeladores**. F3B completa la mitad faltante de la red: el **ecosistema formal de PRODUCTORES DE SEÑALES** — quién da nacimiento a cada señal, cómo se clasifica, cómo nace, cómo se conecta y cómo llega al CMSC.

El objetivo es que el ecosistema de SIGCTiArural deje de ser un conjunto de labs que producen aislados y se convierta en **una red con un cauce único**, donde cualquier señal futura (Audio, RF, Temperatura, Humedad, Video, Vibración, Bioacústica, IA) entra con un contrato común **sin rediseñar la arquitectura**.

### Qué hace F3B
- Define formalmente qué es un **productor de señal** (Q1).
- Establece la **taxonomía oficial** de productores, cruzada con los 12 dominios del SIGNAL_MAP (Q2).
- Modela la **vida de una señal** Nacimiento→Captura→Procesamiento→Modelado→IA→Conocimiento→Impacto (Q3).
- Asigna qué señales **deben llegar** a ElectronicsLab, MathV2, TelecomLab, IA Predictiva y KH (Q4-Q8) y cuáles alimentan al ACP (Q9).
- Construye el **mapa universal de la señal** (Q10).
- Define los constructos formales del ecosistema: **Signal Registry** (Q11), **Signal Lifecycle** (Q12), **Signal Governance** (Q13), **Signal Metadata** (Q14), **Signal Confidence** (Q15) y **Gates F3B** (Q16).

### Qué NO hace F3B
- NO implementa puertos, registros ni selectores (los puertos de F3A se materializan en F3C con orden explícita).
- NO modifica ningún laboratorio; NO toca backend/IA/Telemetry Context; NO borra ni re-semantiza claves de `useLabStore`.
- NO fabrica señal nueva: clasifica la que existe y proyecta la que vendrá.

---

## 2. Q1 — ¿Qué es un productor de señal?

**Definición formal:**

> **Productor de señal** es toda entidad que **da nacimiento** a una señal del ecosistema (un instrumento físico, un servicio externo, un modelo de simulación, un motor de IA, un registro persistido o un experimento), la **etiqueta** con su estado honesto y su metadata, y la **deposita en el cauce CMSC** a través de un **puerto de lectura** sin conocimiento del resto de la red.

### Componentes obligatorios de todo productor

| Componente | Qué es | Campo resultante |
|---|---|---|
| Identidad | ID único estable compatible con S-IDs del SIGNAL_MAP | `producer_id`, derivado de la señal |
| Fuente | Origen físico/lógico de la señal (micro, ADC, API, servicio, algoritmo) | `origin` |
| Clase | Una de las 8 clases de productor (§3) | `class` |
| Dominio | Uno de los 12 dominios semánticos del SIGNAL_MAP | `domain` |
| Estado honesto | `REAL` / `REAL-LOCAL` / `SIM` / `DISENO` / `ROTO` / `HUERFANO` (canon F3A) | `status` |
| Cadencia | Frecuencia natural o de emisión (`time-based`, `event-based`, `on-demand`) | `cadence` |
| Puerto de salida | Contrato por el que entrega la señal (P-BE-01, P-LAB-02, P-IA-01, ... de F3A §10) | `port` |
| Confianza | Valor de Signal Confidence (§15) | `confidence` |
| Metadata | Ficha normalizada (§14) enlazada a la ficha del SIGNAL_MAP | `metadata_ref` |

### Qué NO es productor
- **No es productor** un laboratorio en su rol de consumidor/modelador (Electronica consumiendo diseño eléctrico para visualizar, MathV2 modelando la señal de Electrónica).
- **No es productor** el CMSC: es el **cauce** que ordena, modela y conecta; no origina señal.
- Un mismo laboratorio puede ser **productor de unas señales y consumidor de otras**: el rol lo define la señal, no el lab.

---

## 3. Q2 — Taxonomía oficial de productores

### 3.1 Las 8 clases de señal (dimension: ORIGEN / cómo nace)

| Clase | Definición | Estado honesto típico | Ejemplos del ecosistema |
|---|---|---|---|
| **SEÑAL REAL** | Instrumento o sistema físico midiendo el mundo real | `REAL` / `REAL-LOCAL` | `SensorReading` V3 (S10/S11), `RobotTelemetry` (S50), micrófono Telecom (S30) |
| **SEÑAL REMOTA** | Servicio o fuente externa remota consultada por red | `REAL-LOCAL` (etiquetada externa) | Clima Open-Meteo (S03), WebSDR (S31), deploy remoto `sigct-backend.onrender.com` |
| **SEÑAL LOCAL** | Fuente que nace y reside en el entorno local (navegador/edge) | `REAL-LOCAL` | Microfono Teatro FFT (S30), SSE local, Pyodide sandbox (S40) |
| **SEÑAL SIMULADA** | Producida por un modelo de simulación o mock | `SIM` | Voltajes Falstad (S32), electrónica synth (S33), telecom synth (S34), cluster BBB fabricado (S04), trayectoria robot synth (S51) |
| **SEÑAL HISTÓRICA** | Registro persistido a lo largo del tiempo (memoria del ecosistema) | `REAL` (histórico) | Historial `api_sensorreading`, telemetría legacy 5173, `infer_log.jsonl` (S63), registry KH (S79) |
| **SEÑAL IA** | Salida de un motor de inferencia / modelo de ML | segun reitera la fuente (real si modelo desplegado; sim si demo) | `/infer` diagnosis+confidence (S61), features S60, salidas SSE (S61/S63) |
| **SEÑAL GENERADA** | Sintetizada por algoritmo/modelador a demanda | `GENERADA` / `SIM` | Series Fourier/Laplace/Wavelets de Dr. Binary (S35), osciloscopio/THD (S37), señal de prueba generada |
| **SEÑAL EXPERIMENTAL** | Producida por experimento académico, hackathon o data-science | `SIM` / `REAL-LOCAL` experimental | Datasets públicos del DataScienceLab (iris), ensayos research_v2 (S75), experimentos de hackathon |

### 3.2 Cruce con los 12 dominios del SIGNAL_MAP (dimension: SEMÁNTICA / qué representa)

| Clase \ Dominio | Físicas | Digitales | Lógicas | Biológicas | Acústicas | Espectrales | RF | Mecánicas | Imágenes | Matemáticas | Documentales | IA |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REAL | S10/S11, S50 | S12, S15 | S52 | — | S30 | — | — | S50 posa/tray | S60 foto | — | S63 log | S61 salida |
| REMOTA | S03 clima | — | S14 ruta | — | — | — | S31 WebSDR | — | — | — | S79/80 docs | — |
| LOCAL | — | S01 envelope | S05 badge | — | S30 mic | S30 FFT | — | — | — | S35 | — | S40 SSE local |
| SIMULADA | S33 térmica | S36 | S23 flags | S20/S21 (diseño UBTN) | S77 diseño | S35/S78 | S34 synth | S51 | — | S37 | S04 cluster | S61 demo |
| HISTÓRICA | S10/S11 hist | S12 hist | S52 hist | — | — | — | — | S50 hist | S70/S71 dataset | — | S79 registry | S63 infer_log |
| IA | — | — | S65 reglas | — | S62 voz/STT | — | — | — | S60 diagnosis | — | S61 | S61/S63 |
| GENERADA | — | S15 evento | — | — | S62 gTTS | S35 wavelets | S34 | — | — | S37 THD | — | — |
| EXPERIMENTAL | — | — | — | — | — | — | — | — | — | — | S75 research_v2 | — |

La celda puede estar vacía: no toda combinación existe. Una señal puede tener **clase primaria** (origen) y **clases secundarias** anotadas en metadata (ej. S11 = REAL primaria, HISTÓRICA cuando se lee del pasivo).

### 3.3 Productores actuales verificados (mapeo formal)

| Productor | Fuente física/lógica | Señal | Clase | Dominio | Estado honesto | Puerto F3A |
|---|---|---|---|---|---|---|
| Microfono Telecom | `getUserMedia` + `AnalyserNode` (2048) | S30 | REAL-LOCAL | Acústica + Espectral | `REAL-LOCAL` | P-LAB-02 |
| SensorReading V3 | Backend FastAPI 8010 · PostgreSQL | S10/S11/S12 | REAL | Físicas + Digitales | `REAL` (sin consumidor en 5174) | P-BE-01 |
| RobotTelemetry | Backend · `useRoboticsApi` hurtado `localhost:8000` | S50 | REAL | Mecánicas | `REAL` con cliente `ROTO` | P-LAB-03 |
| Open-Meteo (clima) | Servicio externo `cloud.js` | S03 | REMOTA (externa) | Físicas | `REAL-LOCAL` etiquetada `clima-externo` | P-WEATHER-01 |
| Datasets | Dataset V2 congelado + sets públicos | S70/S71 (+ iris) | HISTÓRICA / EXPERIMENTAL | Imágenes + Documentales | `REAL` dataset / `SIM` uso | P-KH-01 |
| AI outputs | AIPredictiva `/api/v3/ai/inference/` + SSE | S60/S61/S63 | IA | IA + Imágenes | `REAL` si modelo desplegado; `SIM` en demos | P-IA-01 |

### 3.4 Productores futuros (proyección formal, no implementación)

| Productor futuro | Señal proyectada | Clase probable | Dominio | Estado honesto hoy | Puerto preasignado |
|---|---|---|---|---|---|
| UBTN (sensor colmena / corporal) | S20-S24 | REAL (al desplegar), hoy DISENO | Biológicas + Físicas | `DISENO` (0% código) | P-BE-01 (vía backend) |
| BBB (broker + tflite) | S25 | REAL-LOCAL | Digitales + IA | `DISENO` (scripts vacíos) | P-BE-01 / P-IA-01 |
| ESP32 / Arduino | S21 sensores (temp/IMU/ECG) | REAL | Físicas + Biológicas | `DISENO` | P-BE-01 (MQTT→backend) |
| IoT + MQTT | S22 | REAL al desplegar broker | Digitales + Lógicas | `DISENO` (sin broker en compose) | P-BE-01 |
| RF (antena/sdr) | S31/S34 | REMOTA (SDR) / SIMULADA (synth) | RF | S31 `REAL` externa, S34 `SIM` | P-LAB-02 / P-WEATHER-01 |
| Audio/Bioacústica (aves/abejas/ganado) | S77 | REAL-LOCAL (mic) / EXPERIMENTAL (campo) | Acústicas | `DISENO` (CNN/CRNN diseño) | P-LAB-02 |
| Video (drones/observación) | derivada de S60/S70 | REAL | Imágenes | `DISENO` | P-IA-01 |
| Vibración | nueva (Fase 2 CMSC) | REAL | Mecánicas | `DISENO` | P-BE-01 |
| Abejas / Piscicultura / Ganadería | S20-colmena · tanques · S77 | EXPERIMENTAL / REAL | Biológicas + Acústicas | `DISENO`/`EXPERIMENTAL` | P-BE-01 / P-LAB-02 |
| Robótica (gemelos digitales) | S51-S54 | SIMULADA + REAL | Mecánicas + Digitales | S51 `SIM`, S50 `REAL` | P-LAB-03 |
| Investigación / research_v2 / Hackathons | S75-S78, S80 | EXPERIMENTAL | Documentales + IA + Espectrales | `DISENO`/`SIM` | P-KH-01 / P-IA-01 |

**Regla de ingreso de futuro productor:** exactamente 5 pasos, todos ya definidos en §16 — identificar (producer_id), clasificar (clase+dominio), etiquetar (estado honesto), conectar (puerto existente), registrar (Signal Registry). **Cero rediseño del ecosistema.**

---

## 4. Q3 — Modelo de vida de una señal

La vida de toda señal sigue 7 etapas. Cada etapa tiene actor, artefacto, puerto y estado.

| Etapa | Qué ocurre | Actor | Artefacto | Estado durante la etapa |
|---|---|---|---|---|
| 1. **NACIMIENTO** | La señal nace en el productor (lectura, captura, síntesis, inferencia) | Productor | paquete bruto (time, value, units) | estado honesto del productor |
| 2. **CAPTURA** | El cauce CMSC la recibe por un puerto de lectura y la envuelve en el Envelope Común de Señal (ECS: señal + estado + metadata + confianza) | Cauce CMSC (puertos P-*) | Envelope Común de Señal | igual al nacimiento (no se re-etiqueta) |
| 3. **PROCESAMIENTO** | Limpieza, unidades, muestreo, filtrado previo | Capa de procesamiento CMSC | señal normalizada | `REAL-procesada` / `SIM-procesada` |
| 4. **MODELADO** | Aplicación de matemática/transformadas (FFT, wavelets, derivadas) | AdvancedMathLabV2 / Lab Espectral (transversal) | features, espectros, modelos paramétricos | `...-modelada`, con `derived_from` |
| 5. **IA** | Interpretación/predicción sobre la señal o sus features | Motores IA (AIPredictiva, research_v2) | diagnosis, score, anomalía, confidence | `...-ia`, con `confidence` (§15) |
| 6. **CONOCIMIENTO** | La evidencia se documenta y enlaza al KH sin duplicar | Knowledge Hub | documento/enlace `docsBySignal(id)` | evidencia verificable |
| 7. **IMPACTO** | El usuario/interprete toma contexto y acción | ACP + Dashboard CMSC | respuesta interpretada, acción, visualización | estado final con trazabilidad completa |

Reglas de vida:
1. **No se salta etapa**: modelar antes que procesar está prohibido; la triada Modelo→Simulación→Interpretación del MASTERPLAN (C2) es un invariante.
2. **Provenance chain**: cada etapa guarda `derived_from` para reconstruir el recorrido de la señal.
3. **El estado honesto nunca mejora solo**: una señal `SIM` no deviene `REAL` por procesamiento; solo un nuevo nacimiento la puede re-clasificar.
4. **El envelope se transmite íntegro**: si un eslabón no entiende la señal, la pasa con su estado intacto (no la descarta).

---

## 5. Q4 — Señales que deben llegar a ElectronicsLab

| Señal | Clase | Dominio | Puerto | Uso |
|---|---|---|---|---|
| S32 Voltaje/corriente/temperatura (Falstad + solver) | SIMULADA | Físicas | P-LAB-01 | Diseño y acondicionamiento de circuitos |
| S33 sintética backend `electronics_strategy` | SIMULADA | Físicas | P-BE-01 | Referencia de validación |
| S38 esquema JSON del SchematicEditor | GENERADA/REAL (entrada) | Digitales | P-LAB-01 | Diagrama como señal de entrada |
| S36 `useLabStore` signals/history/analysis/netlist | SIMULADA/HÍBRIDA | Digitales | P-LAB-01 | Federación del store |
| S37 osciloscopio/THD | GENERADA | Matemáticas + Espectrales | P-LAB-01 | Medidas de distorsión |
| (futuro) ADC ESP32/Arduino — voltaje real | REAL | Físicas | P-BE-01 | Acondicionamiento de señal real |
| (futuro) Señal eléctrica de colmena (temp/peso/agua amplificada) | REAL | Físicas | P-BE-01 | Circuito de acondicionamiento |

Rol: ElectronicsLab es **consumidor/modelador de señales eléctricas** y **productor de S32/S33** (SIM) — la señal que modela, genera.

---

## 6. Q5 — Señales que deben llegar a AdvancedMathLabV2

| Señal | Clase | Dominio | Puerto | Modelado aplicable |
|---|---|---|---|---|
| S10/S11 temp/humedad V3 | REAL | Físicas | P-BE-01 | FFT, medias móviles, correlación, umbrales |
| S30 micrófono FFT | REAL-LOCAL | Acústica + Espectral | P-LAB-02 | Espectrogramas, STFT, wavelets |
| S32/S33 eléctrica | SIMULADA | Físicas | P-LAB-01 | Fourier, Laplace, derivadas, PID |
| S50/S51 robot | REAL/SIMULADA | Mecánicas | P-LAB-03 | Cinemática, trayectorias, derivadas de la pose |
| S35 series propias (Dr. Binary) | GENERADA | Matemáticas + Espectrales | P-LAB-01 | Fourier/Laplace/wavelets/phase portraits |
| (futuro) S77 bioacústica | EXPERIMENTAL | Acústicas | P-LAB-02 | MFCC, espectros, cambio de puntos (S78) |
| (futuro) vibración | REAL | Mecánicas | P-BE-01 | Análisis modal, PSD |

Rol: AdvancedMathLabV2 es el **modelador universal del cauce** — toda señal del ecosistema debería poder pasar por él; es el corazón matemático del CMSC (MASTERPLAN C2/C3).

---

## 7. Q6 — Señales que deben llegar a TelecomLab

| Señal | Clase | Dominio | Puerto | Uso |
|---|---|---|---|---|
| S30 micrófono | REAL-LOCAL | Acústica + Espectral | P-LAB-02 | Espectro en vivo (ya operativo) |
| S31 WebSDR | REMOTA | RF | P-LAB-02 | Encapsulado de radio externa |
| S34 telecom sintética (frecuencia_dominante, snr, signal_strength, noise_floor) | SIMULADA | RF | P-BE-01 | Validación de cadena RF |
| (futuro) RF antena/SDR propia | REAL/REMOTA | RF | P-LAB-02 / P-WEATHER-01 | Espectro RF de campo |
| (futuro) audios de campo (aves/abejas/ganado) | EXPERIMENTAL | Acústicas | P-LAB-02 | Bioacústica (S77) y detección sonora |
| (futuro) señal de voz del asistente | IA | Acústicas | P-IA-01 | STT/TTS (S62) |

Rol: TelecomLab es el **laboratorio frontera de las señales acústicas y RF** — receptor y analizador espectral; su micrófono es la semilla viva del Lab Espectral transversal.

---

## 8. Q7 — Señales que deben llegar a AI Predictiva

| Señal | Clase | Dominio | Puerto | Motor |
|---|---|---|---|---|
| S60/S61 imagen hoja → `/infer` | SEÑAL IA / REAL | Imágenes + IA | P-IA-01 | `plant_disease_mbv2.h5` (degenerado — honestidad `S74`) |
| S70/S71 Dataset V2+ (16 clases) | HISTÓRICA | Imágenes | P-KH-01 | M1 baseline / M2 challenger (congelados) |
| S63 SSE `/events` | IA | Documentales | P-IA-01 | Evidencia de inferencias |
| S65 conversación con umbrales sobre SensorReading | IA (reglas) | Digitales | P-BE-01 | Respuesta contextual (no ML) |
| (futuro) features del modelado (S35/S77/S78) | SEÑAL IA | Espectrales | P-IA-01 | Clasificación de espectros, bioacústica |
| (futuro) video/drones | SEÑAL IA | Imágenes | P-IA-01 | Detección y clasificación |
| (futuro) UBTN corporal | SEÑAL IA | Biológicas | P-IA-01 | Vector ECG/PPG, anomalías |

Rol: AI Predictiva es el **intérprete del cauce** — consume señales (imagen, features, series), produce señales IA con confianza explícita y jamás presenta un demo como inferencia oficial.

---

## 9. Q8 — Señales que deben llegar al Knowledge Hub

El KH **no duplica**, enlaza (regla F3A §7). Llegan las señales que generan **evidencia documentable**:

| Señal | Clase | Qué se registra | Categoría KH |
|---|---|---|---|
| S61/S63 inferencias IA | IA | Log de inferencias con metadata | research-v2 |
| S35 modelado matemático | GENERADA | Resultado/artefacto científico | knowledge-base |
| S30 espectros acústicos | REAL-LOCAL | Evidencia acústica (cuando se persiste) | knowledge-base |
| S10/S11 series históricas | HISTÓRICA | Resúmenes, correlaciones, anomalías | knowledge-base / research-v2 |
| S70/S71 dataset | HISTÓRICA | Dataset card, split report | research-v2 |
| S72/S73 M1/M2 | SEÑAL IA | Manifiestos de benchmark | research-v2 |
| S75-S78 research_v2 | EXPERIMENTAL | Líneas de investigación | research-v2 |
| S79/S80 docs y manifiestos | REMOTA/HISTÓRICA | Grafo de lectura (registry) | project-core / eiarc-architecture |

Regla: el Signal Registry (§11) es el **índice común** señal→documento, manteniendo la biyección sin duplicar contenido.

---

## 10. Q9 — Señales que deben alimentar el ACP

El ACP (Monólogo del científico) se alimenta de la **capa de señales + KH**; sus respuestas interpretan, no fabrican.

- Señales REAL / REAL-LOCAL: contexto factual verificable (temp V3, clima, espectro acústico).
- Señales HISTÓRICAS: tendencia y comparación (series temporales, benchmark).
- Señales IA: score + confidence para interpretación asistida.
- Señales SIM: respondidas **exclusivamente como simulación** (jamás como medición).
- Señales DISENO/SIN-DATO: respuesta honesta `DISENO` / `no-data`, con fallback `routeMap`/`/assist` preservado (F3A §9).
- Señales ROTO/HUERFANO: el ACP no las fabrica; informa del fallo del enlace.

Regla ACP-F3B: **ninguna respuesta del ACP supera en confianza a la señal que la sustenta** (§15).

---

## 11. Q10 — Mapa universal de la señal

```
                      ECOSISTEMA DE PRODUCTORES
   ┌───────────────────────────────────────────────────────────────────────────┐
   │  REAL            REMOTA          LOCAL         SIMULADA        HISTÓRICA   │
   │  SensorReading   Open-Meteo      Mic Telecom   ElectronicsLab  Registry KH │
   │  RobotTelemetry  WebSDR          Pyodide      Robot synth      api_sensor- │
   │  fut ESP32/ADC   fut RF/SDR      SSE local     cluster BBB     reading     │
   │  fut UBTN/video  —               fut bioac.     synth           infer_log   │
   └──────────────────────────────────┬─────────────────────────────────────────┘
                                      │  ⋯ cada productor entrega vía su puerto P-*
                                      ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │   CAUCE CMSC · ENVELOPE COMÚN DE SEÑAL (ECS)                               │
   │   señal + estado honesto + clase + dominio + metadata + confianza           │
   └──────────────────────────────────┬─────────────────────────────────────────┘
        ▼            ▼             ▼              ▼             ▼
   ELECTRONICS   TELECOM       MATHV2        DATA SCIENCE   IA PREDICTIVA
   consume SIM   consume REAL  modela todo   consume SSE/  consume imagen
   produce SIM   produce REAL  produce GEN   produce EXP   produce SEÑAL IA
        │            │             │              │              │
        └────────────┴─────────────┴──────────────┴──────────────┘
                                     │  (resultados con estado + proveniencia)
                                     ▼
                         KNOWLEDGE HUB (evidencia, sin duplicar)
                                     │
                                     ▼
                         ACP (interpretación honesta, fallback seguro)
                                     │
                                     ▼
                         IMPACTO · Dashboard CMSC (río de señal + termómetro)
```

Leyenda del mapa:
- **Productor → Cauce**: cada flecha es un **puerto de lectura** (P-*), no un nuevo componente.
- **Envelope Común de Señal (ECS)**: la señal viaja siempre envuelta (señal + estado + clase + dominio + metadata + confianza).
- **Clases** circulan dentro del ECS; los labs las **transforman**, no las borran.
- **Un solo cauce**: toda señal futura entra por la misma maqueta — cero rediseño.

---

## 12. Q11 — Signal Registry

**Definición:** el Signal Registry es el **índice declarativo central** de todas las señales del ecosistema — quién las produce, cómo se clasifican, qué estado tienen, por qué puerto entran y qué documentos las evidencian. Reemplaza el vacío actual (cada lab conoce su señal pero nadie conoce el grafo completo).

### Esquema por registro (diseño declarativo, no operativo en F3B)

| Campo | Tipo | Descripción |
|---|---|---|
| `signal_id` | string | ID canónico alineado a SIGNAL_MAP (S01..S80 + nuevas) |
| `name` | string | Nombre legible de la señal |
| `producer_id` | string | Identidad del productor (§2) |
| `class` | enum | `REAL` / `REMOTA` / `LOCAL` / `SIMULADA` / `HISTORICA` / `IA` / `GENERADA` / `EXPERIMENTAL` |
| `domain` | enum | 12 dominios del SIGNAL_MAP |
| `status` | enum | `REAL` / `REAL-LOCAL` / `SIM` / `DISENO` / `ROTO` / `HUERFANO` |
| `origin` | string | Fuente física/lógica detallada |
| `cadence` | enum | `time-based` / `event-based` / `on-demand` |
| `port` | string | Puerto F3A de entrada (P-*) |
| `consumers` | list | Componentes que la consumen |
| `metadata_ref` | ref | Ficha completa en §14 / en SIGNAL_MAP |
| `confidence` | number | Signal Confidence (§15), 0..1 |
| `docsBySignal` | list | IDs del KH que la evidencian (§9) |
| `lifecycle` | stage | Etapa actual de vida (§4/§12) |
| `revision` | string | Versionado de la ficha |

### Reglas del Signal Registry
1. **Declarativo y no-operativo** en F3B: es la especificación; la implementación es F3C.
2. **No borra**: una señal obsoleta se marca `HISTORICA` ajada / `REEVALUADA`, nunca se elimina.
3. **Single source of truth** para las preguntas "de dónde viene la señal" — consultable por labs, IA, KH y ACP.
4. Cada nueva señal futura se da de alta con el mismo esquema (criterio de éxito §16).

---

## 13. Q12 — Signal Lifecycle (definición formal)

**Definición:** el Signal Lifecycle es la **máquina de estados** formal que describe por qué etapas pasa cada señal, qué transiciones están permitidas y qué guardas (condiciones) protegen la honestidad.

### Macro-estados (fase de vida)

| Estado | Significado | Entrada desde |
|---|---|---|
| `RAW` | Nacida en el productor, aún sin envolver | Productor |
| `CAPTURED` | Envuelta en ECS por el cauce CMSC | `RAW` |
| `PROCESSED` | Normalizada (unidades, filtrado previo) | `CAPTURED` |
| `MODELED` | Transformada por el modelador (FFT, wavelets, features) | `PROCESSED` |
| `IA_SCORED` | Interpretada por IA con confianza | `MODELED` |
| `EVIDENCED` | Documentada enlazando al KH | `IA_SCORED` |
| `ACTED` | Interpretada por ACP / mostrada en Dashboard | `EVIDENCED` |

### Micro-transiciones y guardas

| Transición | Guarda obligatoria |
|---|---|
| `RAW → CAPTURED` | El envelope registra `status`, `class`, `domain`, `producer_id` |
| `CAPTURED → PROCESSED` | La señal no se repe tiqueta (procesar no cambia honestidad) |
| `PROCESSED → MODELED` | Hay método matemático aplicado y `derived_from` |
| `MODELED → IA_SCORED` | El modelo declara `confidence` y se acepta el dominio de entrada |
| `IA_SCORED → EVIDENCED` | Se enlaza documento KH sin duplicar; existe `docsBySignal` |
| `EVIDENCED → ACTED` | El ACP respeta la confianza de la señal (nunca la eleva) |

Invarantes del ciclo:
1. **Secuencia inmutada**: no se salta etapa (MASTERPLAN C2).
2. **No hay regresión de honestidad**: sim no se vuelve real; real degradado se marca `ROTO`.
3. **Interrupción permitida**: una señal puede detenerse en cualquier macro-estado; nunca se descarta.

---

## 14. Q13 — Signal Governance

**Definición:** la Signal Governance es el **conjunto de reglas, roles y decisiones** que garantiza que el ecosistema de productores es confiable: honesto, trazable y evolutivo sin ruptura.

### Roles de gobernanza

| Rol | Responsabilidad |
|---|---|
| **Productor** | Da de alta su señal, la clasifica y la etiqueta con honestidad |
| **Cauce CMSC** | Aplica los puertos, verifica el envelope, registra en Signal Registry |
| **Gobernanza de señal** | Aprueba nuevas señales, revisa cambios de clase/estado, resuelve conflictos |
| **Auditor de honestidad** | Verifica que ninguna señal SIM se presenta como REAL, y etiqueta `ROTO`/`HUERFANO` |
| **KH curator** | Enlaza evidencia sin duplicar; mantiene biyección señal→documento |

### Reglas de gobernanza
1. **Honestidad invariante**: cambio de estado de una señal es evento regulatorio, se registra.
2. **No borrado**: señales obsoletas van a `HISTORICA`, jamás se eliminan (regla suprema).
3. **Etiqueta, no borres** para `ROTO`/`HUERFANO` (p. ej. `bridgeStatus` de F3A §6; host del robot §3.3).
4. **Aditividad**: toda señal futura entra por puerto existente + alta en registry; jamás por hack.
5. **Sin saltos de confianza**: el ACP y los labs no elevan la confianza de una señal.
6. **Revisiones en manifiestos**: cambios de clasificación se registran en manifiestos (S80 style).
7. **Decisión documentada**: los gates F3B (§16) son el primer objeto de gobernanza aprobado.

---

## 15. Q14 — Signal Metadata

**Definición:** la Signal Metadata es la **ficha normalizada** que acompaña al envelope de cada señal, basada en el formato de ficha del SIGNAL_MAP (Origen · Destino · Frecuencia · Contexto · Laboratorios · Modelos IA) y extendida con los campos de gobernanza.

### Tarjeta canónica de señal (diseño)

```
signal_id:  S30
name:       Espectro del micrófono (TelecomLab)
producer_id: telecom-mic
class:      LIBRO·REAL-LOCAL  (clase primaria LOCAL; secundaria IA al derivarla)
domain:     acustica / espectral
status:     REAL-LOCAL
origin:     getUserMedia + AnalyserNode (fftSize=2048)
cadence:    time-based (frames del analizador)
units:      amplitud vs frecuencia (bin)
format:     float array (bins) · canvas
port:       P-LAB-02
consumers:  TelecomLab, MathV2, LabEspectral (transversal, futuro)
confidence: 0.80 (instrumento nativo pero no calibrado con referencia)
docsBySignal: [knowledge-base-acustica]
lifecycle:  CAPTURED
revision:   1
```

| Campo del envelope | Fuente |
|---|---|
| Identificación (`signal_id`, `name`, `producer_id`) | Signal Registry |
| Clasificación (`class`, `domain`) | Taxonomía §3 |
| Origen y cadencia (`origin`, `cadence`, `units`, `format`) | Ficha SIGNAL_MAP extendida |
| Estado (`status`) | Honestidad F3A |
| Conectividad (`port`, `consumers`) | Puertos F3A |
| Evidencia (`docsBySignal`) | KH §9 |
| Confianza (`confidence`) | §15 |

Regla de metadata: **la tarjeta acompaña a la señal en cada etapa del Lifecycle**; una transformación añade campos, no los sobrescribe.

---

## 16. Q15 — Signal Confidence

**Definición:** la Signal Confidence es la **medida declarada (0..1) de cuánto puede confiarse en una señal como evidencia**, evaluada por el productor y revisada por la gobernanza. No es exactitud del dato: es **fidelidad del origen**.

### Componentes de la confianza

| Componente | Qué mide | Ejemplo |
|---|---|---|
| Instrumental | Calidad del instrumento/canal de captura | mic nativo `0.8` vs sensor sin calibración `0.5` |
| Metodológica | Robustez del método de producción | synth reproducible `1.0` (sim, sin engaño) |
| Histórica | Estabilidad de la señal a lo largo del tiempo | serie persistida V3 `0.95` |
| Derivada | Trazabilidad de la cadena `derived_from` | features → modelo → score |

### Reglas de la confianza
1. **Nunca supera la fuente**: salida IA ≤ confianza de su señal de entrada.
2. **Se muestra siempre**: el envelope incluye `confidence` junto a `status`.
3. **Una señal `SIM` puede tener confianza alta** (el simulador es fiable como simulación) y aun así **jamás se presenta como real**: confianza y honestidad son ortogonales.
4. **Descriptor textual obligatorio**: toda confianza va con nota breve (calibrada / referencia / no calibrada).
5. `DISENO`/`ROTO`/`HUERFANO` no tienen confianza (no hay datos); se reporta ausencia.

---

## 17. Q16 — Gates F3B (aprobación y salida a F3C)

F3B se declara **APROBADO** cuando todos estos gates son verificables por documento (no por código):

- **G-01** Productor de señal formalmente definido (Q1) con componentes obligatorios (§2).
- **G-02** Taxonomía oficial de 8 clases cruzada con los 12 dominios del SIGNAL_MAP (Q2), sin contradicción con S-IDs.
- **G-03** Modelo de vida de 7 etapas (Q3) y Signal Lifecycle formal (Q12) compatibles con la triada del MASTERPLAN.
- **G-04** Asignación de señales a ElectronicsLab, MathV2, TelecomLab, IA Predictiva, KH y ACP (Q4-Q9) coherente con F3A §10 (puertos) y con el RESTRUCTURING_PLAN (roles).
- **G-05** Mapa universal de la señal (Q10) y Envelope Común de Señal definidos.
- **G-06** Signal Registry, Lifecycle, Governance, Metadata y Confidence definidos (Q11-Q15) y **declarativos, no operativos**.
- **G-07** Criterio de éxito demostrado en escenarios: colmena, RF, BBB, ESP32 y experimento entran sin rediseño (§18).
- **G-08** Sin commits; HEAD `18b95b1` intacto; working tree solo documental (más el snapshot del 2026-09-27).

Aprobado F3B ⇒ se habilita **F3C (implementación de puertos de lectura + Envelope Común de Señal + Signal Registry operativo)** con orden explícita y nueva misión. F3B **no autoriza por sí mismo ningún cambio de código**.

---

## 18. Criterio de éxito — cinco escenarios, cero rediseño

La prueba del ecosistema de productores: cualquier señal futura entra al cauce con 5 pasos invariantes (identificar → clasificar → etiquetar → conectar → registrar).

| Escenario | Señal | Pasos concretos | Resultado |
|---|---|---|---|
| Sensor de colmena | temp/peso/agua (S20-colmena) | productor UBTN · clase REAL · dominio Físicas · puerto P-BE-01 (MQTT→backend) · alta en registry | CMSC→MathV2→IA→KH→ACP→usuario |
| Sensor RF | espectro RF (S31/S34) | productor SDR/antena · clase REMOTA · dominio RF · puerto P-LAB-02/P-WEATHER-01 · alta en registry | Telecom→Lab Espectral→IA→KH→ACP |
| Dispositivo BBB | señales broker + tflite (S25) | productor BBB · clase REAL-LOCAL · dominio Digitales/IA · puerto P-BE-01/P-IA-01 · alta registry | CMSC→IA→KH→ACP |
| ESP32 | voltaje/IMU/temp (S21) | productor esp32 + ADC · clase REAL · dominio Físicas · puerto P-BE-01 · alta registry | Elect→MathV2→IA→KH→ACP |
| Experimento de laboratorio | bioacústica / experimento data-science | productor experimento/hackathon · clase EXPERIMENTAL · dominio Acústicas · puerto P-LAB-02/P-IA-01 · alta registry | DataScience→IA→KH→ACP |

En los 5 casos el recorrido es el del mapa universal (Q10): **PRODUCTOR → CMSC → LABORATORIOS → IA → KH → ACP → USUARIO** — con el mismo envelope, los mismos puertos y la misma gobernanza. **Cambia solo la señal, jamás la arquitectura.**

---

## 19. Honestidad final y próximo paso

- **Lo que F3B no hace:** no implementa, no toca laboratorios, no refactoriza, no fabrica señales, no altera `useLabStore`, no hace commits.
- **Estado real de productores hoy (verificado):** mic Telecom (REAL-LOCAL), SensorReading (REAL, sin consumidor), RobotTelemetry (REAL, cliente ROTO), Open-Meteo (REAL-LOCAL clima-externo), dataset V2 (HISTÓRICO), salidas IA (REAL/SIM según modelo). Todo lo demás es DISENO o HUERFANO.
- **Deuda de honestidad heredada** que F3C debe sanear (riesgos R1/R2/R3 de F3A): clima presentado como telemetría, cluster BBB fabricado, host del robot roto.
- **Próximo entregable documental:** ninguno adicional salvo orden de Bernardo. La siguiente misión real es **F3C (implementación con orden explícita)**.

---

*Fin del blueprint F3B v1 — el ecosistema de productores queda formalizado: las señales son el centro, los laboratorios son sus servidores, y cualquier señal futura entra al CMSC sin rediseñar el cauce.*