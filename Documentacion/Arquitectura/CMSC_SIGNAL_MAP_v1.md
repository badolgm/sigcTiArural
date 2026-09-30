# SIGCTiArural · CMSC — Mapa Maestro de Señales del Ecosistema (Signal Map)

> **Categoría:** Documentación canónica de arquitectura · Plano maestro de señales (Fase 1 CMSC).
> **Versión:** v1.0 | **Fecha:** 2026-09-25 · **Rama:** `feature/ubtn-biological-telemetry`
> **Tipo:** DISEÑO · INVENTARIO · MAPA. **No se implementa, no se modifica código, no se refactorizan componentes.**
> **Precedencia:** Este documento es **prerrequisito** de cualquier refactorización del laboratorio matemático. Sin saber qué señales existen, qué fluyen y qué conocimiento producen, NO se toca el lab.

---

## 0. Propósito

Construir el **inventario total de señales del ecosistema SIGCTiArural** y su mapa de flujo, conforme al Centro de Modelado, Simulación y Ciencias Computacionales (CMSC, `Documentacion/Arquitectura/CMSC_MASTERPLAN_v1.md`).

Permita el documento proyectar:

1. qué señales existen hoy (y su honestidad: real / simulación / referencia / diseño);
2. cómo fluyen (Sensores → Telemetría → Matemáticas → Señales → IA → Knowledge Hub → Agentes → Usuario);
3. qué laboratorios las consumen, qué modelos IA se les aplican (o se les podrían aplicar), y qué conocimiento producen.

**Regla de oro del inventario:** cada señal lleva **estado de honestidad** verificable (`real / sim / referencia / diseño`). Un espectro synthetic no se presenta como medición de campo.

---

## 1. Inventario total de señales por dominio del ecosistema

### 1.1 Dashboard (frontend nuevo, `src/frontend/src`)
| # | Señal | Estado | Evidencia |
|---|---|---|---|
| S01 | Envelope de telemetría V3 (`context/source_mode/lab_type/count/items`) | real (API) | `src/frontend/src/pages/Dashboard.jsx:176-202` |
| S02 | Serie temporal del gráfico (construida desde V3) | real | `Dashboard.jsx:226-235,553-567` |
| S03 | Clima externo Open-Meteo | real externa (NO rural) | `services/cloud.js:36-49` |
| S04 | Cluster/nodos (health backend + métricas fabricadas CPU/temp/red) | simulación | `services/cloud.js:25-33` |
| S05 | Badge "LIVE" (derivado de `source_mode==='live'`, no verifica sensor físico) | real-envelope | `Dashboard.jsx:219-224,360-370` |
| S06 | Contador docs/research_v2 del KH | real | `Dashboard.jsx:209-218` |

### 1.2 Telemetría (backend + PostgreSQL)
| # | Señal | Estado | Evidencia |
|---|---|---|---|
| S10 | `SensorReading.temperature` (`api/`) | **real (HTTP V3 persistida)** + sim si no hay filas | `src/backend/api/models.py:4-14` · `views.py:118-174` |
| S11 | `SensorReading.humidity` | real (V3) + sim | idem |
| S12 | `sensor_id` + `timestamp` | real | idem |
| S13 | Datos sintéticos V1/V2 (sin filas → genera) | simulación | `views.py:33-66,412-441` |
| S14 | Envelope V3 `source_mode: live/simulated/fallback` | real (etiqueta de ruta) | `views.py:102-174,261-285,315-327` |
| S15 | `LabSignal` (evento de dominio, bus en memoria, inmutable) | real (in-process) | `shared_kernel/event_bus/domain/lab_signal.py:9-34` |

### 1.3 Hardware / IoT / UBTN
| # | Señal | Estado | Evidencia |
|---|---|---|---|
| S20 | **BODY_TEMP, HEART_RATE, RESPIRATORY_RATE, SPO2, ECG/PPG, IMU, rumia, actividad, colmena (temp/peso/agua)** | **diseño (0% código)** | `docs/UBTN_DOMAIN_MODEL.md:90-119` |
| S21 | Sensores propuestos: ADS1292R (ECG), MAX30102 (PPG/SpO2), MPU6050 (IMU), MAX86150, DS18B20/NTC (pendiente A-7) | diseño | `docs/UBTN_SENSOR_CATALOG.md:5-19` |
| S22 | MQTT (MQTT 5, QoS 0/1, LWT, retained) | diseño (sin broker en compose) | `docs/UBTN_MQTT_ARCHITECTURE.md:7-104` |
| S23 | Contrato lectura UBTN (`reading_signature`, `out_of_range`, `low_quality`, `flat_line`, `noise`) | diseño | `docs/UBTN_DATA_CONTRACTS.md:48-81` |
| S24 | Ráfagas ECG/PPG (object storage) | diseño | `docs/UBTN_DATA_CONTRACTS.md:85-116` |
| S25 | Firmware BBB/ESP32 (mqtt_broker, tflite_api, sensor_reader) | diseño (scripts vacíos) | `src/embedded/bbb_*.py` |

### 1.4 Labs (frontend)
| # | Señal | Estado | Evidencia |
|---|---|---|---|
| S30 | FFT/espectro del micrófono (Telecom) | **real (WebAudio+Canvas)** | `src/frontend/src/labs/TelecomLab.jsx:16,23-36,68-71` |
| S31 | Bandas RF WebSDR (encapsulado externo) | real externa | WebSDR (iframe) |
| S32 | Voltaje/corriente/temperatura de circuitos (Falstad + solver Python local) | simulación | `labs/ElectronicsLab.jsx:316-325,451,944-966` · FalstadPanel.jsx · adapters/falstadAdapter.js:186-191 |
| S33 | Señales sintéticas de electrónica backend (voltaje, corriente, temperatura) | simulación | `src/backend/core/domain/strategies/electronics_strategy.py:14-41` |
| S34 | Telecom sintética (`frecuencia_dominante`, `snr`, `signal_strength`, `noise_floor`) | simulación | `src/backend/core/domain/strategies/telecom_strategy.py:15-35` |
| S35 | Series de Fourier / Laplace / Wavelets / phase portraits (Dr. Binary) | simulación matemática en navegador | `labs/AdvancedMathLabV2.jsx:234-267,391` |
| S36 | Señales de `useLabStore` (signals, history, analysis, netlist) | híbrido (sim + metadata falstad) | `stores/useLabStore.js:54-64` |
| S37 | Osciloscopio/THD (Electronics) | simulación | `ElectronicsLab.jsx:316-325,944-966` |
| S38 | Esquema JSON del editor (`SchematicEditor.jsx`) | híbrido (entrada real de archivo) | `SchematicEditor.jsx:773,1817` |
| S39 | Embebidos: enlaces Wokwi/Plotly/Pyodide (externos encapsulados) | referencia externa | EmbeddedLab (librerías externas) |
| S40 | Consola DataScience (Pyodide) sin SSE usable (endpoint cloud deprecado) | parcial/roto | `pages/DataScienceLab.jsx:5,62-92` |

### 1.5 Robotics
| # | Señal | Estado | Evidencia |
|---|---|---|---|
| S50 | `RobotTelemetry`: batería, modo, posición XYZ, velocidad lineal, timestamp | **real (persistida)** | `src/backend/api/models.py:41-52` |
| S51 | Trayectoria helicoidal sintética (`physics_sim.py`, POST 1/s) | simulación | `scripts/physics_sim.py:8-64` |
| S52 | `RobotCommand` (comandos; ViewSet autenticado) | real (API) | `views.py:16-31` |
| S53 | Métricas aleatorias de robótica (frontend) | simulación | `hooks/useRoboticsApi.js` |
| S54 | Robotics strategy backend (temp/humedad "Simulado Domain v2") | simulación | `core/domain/strategies/robotics_strategy.py:13-34` |

### 1.6 AI Service (`src/ai_models`, puerto 8081)
| # | Señal | Estado | Evidencia |
|---|---|---|---|
| S60 | Imagen hoja → 224×224 RGB → `plant_disease_mbv2.h5` (binario enferma/sana) | **real (único modelo en disco)** | `fastapi_app.py:171-195` · `production_models/model_metadata.json` |
| S61 | Inferencia `/infer` (multipart `file` → `diagnosis class_N`, confidence, class_index) | real | `fastapi_app.py:212-278` |
| S62 | Voz `/assist`: audio webm→wav → STT (recognize_google) → gTTS audio | **real** (depende de Google) | `fastapi_app.py:293-395` |
| S63 | `/events` SSE = tail de `infer_log.jsonl` (evidencia de inferencias) | real | `fastapi_app.py:397-411` |
| S64 | `/analyze-circuit` ({nodes} → respuesta determinista) | real (reglas) | `fastapi_app.py:416-443` |
| S65 | Conversación: memoria en proceso + umbrales (temp>30, hum<30) sobre `SensorReading` | real (reglas, no ML) | `fastapi_app.py:97-155` · `conversation_context.py:217-243` |
| S66 | ASR con fallback silencioso de imports | real limitado | `fastapi_app.py:27-37` |

### 1.7 Benchmark / Dataset / Research
| # | Señal | Estado | Evidencia |
|---|---|---|---|
| S70 | Dataset agrícola v1: 22.488 imgs / 16 clases / 3 especies (tomate/papa/maíz) | **real, congelado** | `data/datasets/agriculture_images_tomato-potato-corn/v1/dataset_card.md` |
| S71 | Split 15.741/3.373/3.374 (seed 42), sin fugas (dedup SHA-256) | real, congelado | `split_lists/split_report.md` |
| S72 | M1 MobileNetV2 torchvision, 16 clases, 2.244.368 params, macro-F1 0.9899 · ECE 0.0313 | **baseline aprobado/congelado** (artefactos no reconstruibles en disco) | `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md:29-47` |
| S73 | M2 EfficientNet-B0 (4.028.044 params) | **ejecutado oficialmente 2026-09-27 (challenger validado, gates PASS)** | `ESTADO_ACTUAL_BENCHMARKS.md`, §2.3 CMSC_CANONICAL |
| S74 | `plant_disease_mbv2.h5` productivo (degenerado: colapsa a class_0 ~0.99) | real, científico descalificado | `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md:98-103,153-158` |
| S75 | Líneas research_v2 (7): Agriculture · Animal Health · Telemetry · Audio · Signal · Knowledge AI · Multimodal Fusion | diseño/gobernanza (agr. ejecutada) | `docs/ai/research_v2/SIGCT_RURAL_AI_RESEARCH_PROGRAM_V2.md:101-329` |
| S76 | Modelos diseñados de series: Prophet, ARIMA/SARIMA, XGBoost, LSTM, GRU, TCN, TFT | diseño | `..._MLOPS...:672-700` |
| S77 | Audio/bioacústica: CNN/CRNN + MFCC + espectrogramas (bovinos/porcinos/aves/abejas) | diseño | `..._MLOPS...:585-668` |
| S78 | Signal Intelligence: wavelets vs FFT, change points | diseño | `..._MLOPS...:549-581` |
| S79 | Site: 51 docs KH, de los cuales 18 `research_v2` | real (solo visor) | `knowledge-hub/registry/knowledgeRegistry.generated.json` |
| S80 | Manifiestos YAML (raw_source v2, curation v2, taxonomy v1, split v1, baseline v2) | real (deriva referencial v1/v2 a reconciliar) | `docs/ai/manifests/` |

---

## 2. Clasificación según tipo

| Clase | Señales | Flujo representativo |
|---|---|---|
| **Físicas** | Temperatura (`S10`), Humedad (`S11`), Clima externo (`S03`), Voltaje/Corriente (`S32`, `S33`) | Sensor → Telemetría → Lab Electronica/Agricultura |
| **Digitales** | Envelope V3 (`S01`), SensorId/Timestamp (`S12`), LabSignal (`S15`), análisis de circuitos (`S64`) | Backend → Frontend |
| **Lógicas** | `source_mode` (`S14`), badges de estado (`S05`), flags UBTN (`S23`), RobotCommand (`S52`) | Control/estado |
| **Biológicas** | BODY_TEMP/HR/RR/SpO2/ECG/PPG/IMU/rumia (`S20`, `S21`) | **diseño UBTN** |
| **Acústicas** | Micrófono Telecom (`S30`), Voz asistente (`S62`), (bioacústica `S77` = diseño) | Mic → WebAudio/ STT |
| **Espectrales** | FFT/STFT/Wavelets (`S30`, `S35`, `S78`) | Señal → transformada → features |
| **RF** | WebSDR (`S31`), telecom sintética (`S34`) | Antena → espectro |
| **Mecánicas/vibración** | Trayectoria robot (`S50`-`S51`), (vibraciones = Fase 2 CMSC) | Robot → telemetría |
| **Imágenes (visión)** | Hoja 224×224 (`S60`), Dataset V2 (`S70`-`S71`) | Imagen → CNN → diagnosis |
| **Matemáticas** | Series de Fourier/Laplace/Wavelets (`S35`), osciloscopio/THD (`S37`) | Fórmula → visualización |
| **Documentales** | Docs KH 51 (`S79`), manifiestos (`S80`), infer log (`S63`) | Documento → evidencia |
| **IA (interpretación)** | salida `/infer` (`S61`), contrato EIARC (`semantic_prediction_resolver`), confianza | Modelo → significado → usuario |

---

## 3. Definición detallada por señal (ficha)

Formato por señal: **Origen · Destino · Frecuencia · Contexto · Laboratorios · Modelos IA**.

### S10/S11 — Temperatura / Humedad ambiental
- **Origen:** `POST /api/v3/telemetry/readings/` (HTTP, cualquier cliente; no hay sensor físico evidencia) o síntesis V1/V2/V3 si no hay filas.
- **Destino:** PostgreSQL `api_sensorreading` → Dashboard / TelemetryPanel / DataScience / Voz (`/assist` umbrales). Labs: AGRICULTURA (vía `OnSensorReadingHandler`).
- **Frecuencia:** por ingesta (sin cadencia fija; sin MQTT).
- **Contexto:** bien más preciado del CMSC (Fase 1): única serie real persistida del ecosistema.
- **Modelos IA:** umbrales actuales (no ML); diseño: Prophet/ARIMA/LSTM/GRU/TCN/TFT (Telemetry AI).

### S15 — LabSignal (evento de dominio)
- **Origen:** Event Bus en memoria (patrón domain events) tras persistir lectura.
- **Destino:** `OnSensorReadingHandler` → `LaboratorioService(AGRICULTURA)` → posible alerta S.O.S. (nivel estrés crítico).
- **Frecuencia:** por lectura (síncrono, sin cola).
- **Contexto:** vínculo backend entre telemetría y labs (conde decibel).
- **Modelos IA:** ninguno (infraestructura).

### S20-S24 — Señales biológicas UBTN
- **Origen:** **diseño** — sensores ADS1292R/MAX30102/MPU6050 sobre ESP32/BBB → MQTT 5 → bridge → object storage (ECG/PPG bursts).
- **Destino:** contexto `bio` (future `/api/v4/bio/`), no `SensorReading`.
- **Frecuencia:** MQTT readings (diseño) + bursts ECG/PPG referenciados.
- **Contexto:** capa biológica del CMSC; A-7 pendiente (BODY_TEMP DS18B20 vs HR/RR).
- **Modelos IA:** XGBoost/LSTM anomalía conductual; CNN/CRNN bioacústica (diseño).

### S30 — Espectro del micrófono (Telecom)
- **Origen:** `getUserMedia` → WebAudio `AnalyserNode`.
- **Destino:** FFT/Canvas en `TelecomLab.jsx`.
- **Frecuencia:** 44.1 kHz muestreo; FFT en tiempo real (frame rate navegador).
- **Contexto:** única señal acústica real analizada con DSP en frontend (sin subir al server).
- **Modelos IA:** futuro CRNN bioacústica; VAD (detección de voz) — Fase 2 CMSC.

### S50/S51 — Telemetría robótica
- **Origen:** `RobotTelemetry` persistida (API REST) · sim trayectoria `physics_sim.py` (1 POST/s).
- **Destino:** `/api/robot-telemetry/` → hooks frontend → panel Robótica.
- **Frecuencia:** sim: ~1 Hz; real sin evidencia física.
- **Contexto:** posición XYZ/velocidad = señal mecánica (candidata a análisis espectral de trayectorias).
- **Modelos IA:** diseño — anomalía de trayectoria (LSTM), clasificación de movimiento (IMU).

### S60/S61 — Imagen de hoja e inferencia binaria
- **Origen:** archivo de imagen (multipart `file`, MIME jpeg/png/webp) → FastAPI `/infer` → Django `/api/v3/ai/inference/`.
- **Destino:** resolver semántico EIARC → `{prediction_code, plant_species, health_state, severity, confidence, model_id, ...}` → AIPredictiva.
- **Frecuencia:** bajo demanda (un request por imagen).
- **Contexto:** única vía IA a modelo entrenado real; el modelo productivo colapsa (class_0 wins) → señal degenerada.
- **Modelos IA:** plant_disease_mbv2.h5 (runtime) · M1 (baseline 16c, no desplegado) · M2 (ejecutado oficialmente, challenger).

### S62 — Voz del asistente
- **Origen:** micrófono navegador (MediaRecorder) → multipart `audio` → `/assist`.
- **Destino:** STT `recognize_google` es-ES → reglas de intent (`conversation_context.py`) → TTS gTTS → audio MPEG → navegador.
- **Frecuencia:** por comando.
- **Contexto:** interacción de voz real pero no agéntica (sin conocimiento, sin laboratorios, sin CMSC).
- **Modelos IA:** no-ML (keywords + hardcode confianza 0.9/0.8/0.5).

### S70-S73 — Dataset agrícola y benchmark
- **Origen:** dataset v1 materializado (22.488/16/3); M1 entrenado (artefactos no en repo); M2 ejecutado oficialmente (resultados en ESTADO_ACTUAL_BENCHMARKS).
- **Destino:** evaluación científica (manifiestos) + (futuro) promoción a runtime.
- **Frecuencia:** estático (congelado); M2 single-use test pendiente de decisión; decisión benchmark final pendiente.
- **Contexto:** señal de imagen = input del único benchmark real aprobado del ecosistema.
- **Modelos IA:** MobileNetV2 (M1) · EfficientNet-B0 (M2) · Futuros M3/M4/M5 (ResNet50, ConvNeXt-Tiny, MobileNetV3).

### S79 — Documentos del Knowledge Hub
- **Origen:** `import.meta.glob` de markdown en build; registry generado estático.
- **Destino:** `/knowledge` · `/knowledge/doc/:docId` (visor, sin búsqueda/RAG/grafo).
- **Frecuencia:** por build.
- **Contexto:** 51 docs reales (18 research_v2) = materia prima del Agente Investigación y del RAG futuro.
- **Modelos IA:** Knowledge AI (embeddings + RAG) — diseño.

---

## 4. Mapa de flujo: Señal → Laboratorio → Modelo → Knowledge Hub → Agente → Usuario

### 4.1 Caminos REALES hoy
```
Imagen de hoja (S60)
   ↓
AIPredictiva (Lab IA)
   ↓
plant_disease_mbv2.h5 (S61) → resolver EIARC → {health_state, severity, confidence}
   ↓
(sin KH: no queda evidencia documental automática)
   ↓
(agente: no existe)
   ↓
Usuario (diagnosis + confianza + badge demo/real)

Temp/Humedad (S10/S11)
   ↓
POST V3 → PostgreSQL → LabSignal (S15)
   ↓
Lab AGRICULTURA (nivel de estrés) → alerta S.O.S.
   ↓
Dashboard / TelemetryPanel (envelope V3, badge LIVE)
   ↓
Usuario (gráfico, sin modelo aún — umbrales en /assist)

Micrófono (S30)
   ↓
TelecomLab (FFT en navegador) 
   ↓
Visualización de espectro (sin modelo, sin KH)
   ↓
Usuario
```

### 4.2 Camino CANÓNICO del CMSC (objetivo, Fase 3-4)
```
Sensores (S10, S20, S30, S50) — señal real o diseño
   ↓
Telemetría / LabSignal (S15) — bus de evidencia
   ↓
Matemáticas (Dr. Binary, S35) — modelado
   ↓
Señales (FFT/STFT/Wavelets; S30/S78 + Lab Análisis Espectral) — features espectrales
   ↓
IA (S61/S76/S77) — interpretación con confidence + contraste con modelos
   ↓
Knowledge Hub (S79) — evidencia registrada + RAG (Agente Investigación)
   ↓
Agentes (ACP + 6 sub-agentes; CMSC §5)
   ↓
Usuario (texto · voz · API · automatización)
```

---

## 5. Laboratorio de Análisis Espectral — visión expandida

Pendiente estratégico (semilla del Hackathon actual; Fase 2 CMSC). Mapa técnico de dominio:

| Técnica | Entrada señal | Salida | Candidato en el ecosistema |
|---|---|---|---|
| **FFT** | muestras en el tiempo | espectro de magnitud/fase | micrófono Telecom (`S30`), telemetría (`S10`), circuitos (`S33`), trayectoria robot (`S51`) |
| **STFT** | señal no estacionaria | espectrograma (t-f) | audio/VAD, señales fisiológicas UBTN (`S20`), bioacústica (`S77`) |
| **Wavelets** | transitorios | descomposición multiescala | ECG/EEG (`S21`), transitorios RF, detección de picos (ya en Dr. Binary `S35`) |
| **Audio** | onda sonora 44.1k | features (MFCC, energía, zero-crossing) | AMBOS microphone (`S30`, `S62`) |
| **RF** | espectro radio | ocupación de banda, SNR, ruido de piso | WebSDR (`S31`), telecom (`S34`) |
| **Bioacústica** | grabaciones de campo | espectrograma + embeddings + clasificación | research_v2 Audio (`S77`) — diseño |
| **Vibraciones** | señal mecánica (acelerómetro/IMU) | firmas espectrales de vibración | IMU UBTN (`S21`), trayectoria robot (`S50`) |
| **Imágenes en frecuencia** | imagen 2D | espectro 2D / descriptores wavelet | hojas (`S60`) — análisis textural complementario a CNN |
| **Telemetría en frecuencia** | serie temporal | periodograma/PSD, componentes dominantes, ciclidad | temp/humedad (`S10`/`S11`), robot (`S50`) — detection de ciclos diurnos/agrícolas |

**Regla Fase 2:** los módulos se seleccionan desde este inventario (señal real que ya produce el ecosistema) y entran por gate (honestidad + trazabilidad + triada Modelo→Simulación→Interpretación).

---

## 6. Oportunidades identificadas por señal

| Oportunidad | Señal(es) objetivo | Modelo propuesto | Fuente |
|---|---|---|---|
| **Predicción** | `S10/S11` temp/humedad | Prophet vs ARIMA/SARIMA vs XGBoost; LSTM/GRU/TCN; TFT | research_v2 Telemetry AI |
| **Predicción** | `S50` trayectoria robot | LSTM/GRU movimiento | Telemetry AI · Robótica |
| **Clasificación** | `S60` imagen hoja | M1 (MobileNetV2 16c) → M2 (EfficientNet-B0) → M3+ | benchmark Agriculture |
| **Clasificación** | `S20` conducta animal | XGBoost + LSTM (anomaly) | Animal Health AI |
| **Clasificación** | `S30/S77` audio/bioacústica | CNN espectral vs CRNN + MFCC | Audio Intelligence |
| **Clasificación** | `S31` RF / `S34` telecom | señal → espectro → clasificación de banda/enlace | Signal Intelligence |
| **Correlación** | `S10` ∧ `S20` (clima-conducta) ∧ `S50` | regresión multivariada / TFT | Multimodal Fusion (diseño) |
| **Correlación** | `S70` ∧ `S60` (dataset-condiciones) | embeddings gemelos (dual tower) | Multimodal Fusion |
| **Anomalías** | `S10/S11` telemetría | umbrales actuales → LSTM reconstruction / isolación forest | Telemetry AI |
| **Anomalías** | `S21` ECG/PPG | detección de arritmia (CRNN) | UBTN · Signal AI |
| **Anomalías** | `S79` series de labs | change points + wavelets | Signal Intelligence |
| **Modelado matemático** | `S35` Fourier/Laplace/Wavelets | symbolic regression / ajuste paramétrico | CMSC Matemáticas |
| **Modelado matemático** | `S15` LabSignal/eventos | proceso estocástico (Poisson), state machines | CMSC Matemáticas |

---

## 7. Cómo el CMSC alimentará a los agentes (futuro, Fase 4)

### Agente Científico Principal (ACP)
- Entrada: consulta de Usuario (texto/voz/API/automatización).
- Orquesta: descompone la consulta → delega → consolida con **evidencia** (ancla documental + confidence + traza de agente).

### 7.1 Alimentación por sub-agente (desde este mapa)
| Agente | Señal(es) que consume | Qué produce | Ancla |
|---|---|---|---|
| **Agente Matemático** | `S35` (series/transformadas), `S15` (eventos) | modelo formal seleccionado + porqué matemático | Dr. Binary · CMSC §5.2 |
| **Agente Física** | `S10/S11` (termo-higrometría), `S50` (mecánica), `S20` (fisiológica) | interpretación física (onda, resonancia, unidades) | Lab Connectivity (GLC-01) |
| **Agente Electrónica** | `S32/S33` (voltaje/corriente), `S38` (esquema), `S15` | etapa de adquisición (filtros/ADC/ganancia) que produjo la señal | ElectronicsLab · Falstad |
| **Agente Señales** | `S30` (audio), `S34` (telecom), `S50` (trayectoria), `S10` (serie) | features espectrales (f0, energía, picos, STFT) | Lab Análisis Espectral Fase 2 |
| **Agente IA** | `S60/S61` (imagen→inferencia), `S72/S73` (benchmark) | predicción + `confidence` + `source_mode` honesto | EIARC · AIPredictiva |
| **Agente Investigación** | `S79` (51 docs), `S80` (manifiestos), `S63` (infer log) | respaldo documental + RAG (citas oficiales) + registro de evidencia | Knowledge Hub |

### 7.2 Contrato de evidencia (futuro)
```
señal_id  →  origen(fuente)  →  técnica (FFT/STFT/...)
         →  modelo (no se inventa)  →  resultado (features/métricas)
         →  confidence (o '—')  →  ancla KH (doc/registro)
         →  traza a usuario
```
Este contrato se cumple en **todas** las superficies (texto, voz, asistentes externos, APIs, automatización).

---

## 8. Cuadro de honestidad global (síntesis)

| Modalidad | Real | Simulación | Diseño (0% código) |
|---|---|---|---|
| Telemetría | HTTP V3 → `SensorReading` (temp/hum) | V1/V2 sintético; strategies | MQTT→BBB firmware |
| Robótica | `RobotTelemetry` persistida | `physics_sim.py`, métricas aleatorias | robots físicos |
| Audio/Voz | Mic Telecom FFT · `/assist` STT/TTS | — | bioacústica (CNN/CRNN) |
| Espectro | WebAudio AnalyserNode (real-time, local) | telecom/electrónica sintética | Lab Análisis Espectral (Fase 2) |
| IA | `plant_disease_mbv2.h5` (degenerado) · SSE | demo scenarios (conf 0.97/0.96) | ACP + 6 sub-agentes · M2+ |
| Imágenes | Dataset V2+ 22.488 imgs · M1 (baseline, no desplegado) | — | M2..M5, TFLite edge |
| Documental | 51 docs KH · 18 research_v2 · manifiestos | — | RAG · búsqueda · grafo |
| Bio (UBTN) | — | — | 100% (A-7 pendiente) |

---

## 9. Conclusiones y restricciones

1. **Solo dos señales reales persistentes** hoy: temp/humedad V3 (`S10/S11`) y robot-telemetry (`S50`). El resto del valor proviene de micrófono local, WebSDR, dataset iminguines y simulación.
2. **El inventario es el plano maestro** para el CMSC; sin él **no iniciar refactorización del laboratorio matemático** (regla de la misión).
3. **El Lab Análisis Espectral se alimentará de señales ya existentes** (audio, telecom, robot, telemetría) — no necesita hardware nuevo para arrancar.
4. **Nada se elimina**: el mapa preserva simulación y diseño como estados honestos; la evolución de una señal (diseño→real) solo ocurre con evidencia (física o documentada).
5. Cualquier futuro módulo (lab, modelo, agente) debe **declarar qué señal del inventario consume** y bajo qué estado de honestidad.

---

*Documento de DISEÑO v1, inventario de señales del ecosistema. Cero código implementado. La refactorización del laboratorio matemático queda BLOQUEADA hasta aprobación del CMSC según este plano maestro y los gates del roadmap (F1→F4).*