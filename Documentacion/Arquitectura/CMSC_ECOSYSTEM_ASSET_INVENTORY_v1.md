# CMSC — Inventario de Activos Científicos del Ecosistema SIGCTiARURAL (v1)

- **Fecha**: 2026-09-29 (verificación de disco y runtime)
- **Naturaleza**: INVENTARIO v1 · arqueología de activos · SOLO LECTURA. Sin código, sin commits, sin refactorización.
- **Lente**: ecosistema knowledge-centric (Dato → Información → Conocimiento → Impacto), compatible con `SIGCTIARURAL_CANONICAL_PHILOSOPHY_EVOLUTION_v1.md`; las señales son una fuente de datos, el conocimiento es el propósito.
- **Documentos compañeros**: `CMSC_SIGNAL_MAP_v1.md` (S01..S80), `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md`, `CMSC_LABS_RESTRUCTURING_PLAN_v1.md`, `CMSC_F3A_INTERCONNECTION_BLUEPRINT_v1.md`, `CMSC_F3B_SIGNAL_PRODUCERS_ECOSYSTEM_v1.md`, `CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md`, `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md`.
- **Regla rectora**: NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA. El inventario no crea ni borra nada: clasifica lo que existe con estado honesto.
- **Memoria de contexto**: HEAD `18b95b1` (feature/ubtn-biological-telemetry, 2026-09-27); working tree SIN commits; `stash@{0}` PRE_MULTI_AGENT_2026_09_29 conservada por decisión de Bernardo.

---

## 1. Propósito y método

1. Responder la pregunta final: **¿cuál es el inventario real de activos científicos disponibles hoy en SIGCTiARURAL?**
2. Clasificar TODO el ecosistema en 10 categorías con estado (Existe / Operacional / Simulado / Diseño).
3. Anclar cada activo a evidencia verificable (ruta:línea o directorio real).
4. Diferenciar lo existente en disco, lo que realmente funciona hoy (runtime) y lo diseñado sin código.

Método de verificación (2026-09-29): inspección directa de directorios y archivos, conteo de árboles, lectura de archivos canónicos y verificación de rutas de runtime. No se ejecutó servicio alguno ni se modificó nada.

**Estados de inventario**:

| Estado | Significado |
|---|---|
| `EXISTE` | El activo existe físicamente en disco (archivo, imagen, documento, modelo). |
| `OPERACIONAL` | Además de existir, funciona hoy en el ecosistema (backend, frontend 5174, servicio, visor). |
| `SIMULADO` | Funciona pero produce/consume señal sintética o fabricada, con etiqueta honesta. |
| `DISEÑO` | Solo documentado, 0% código ejecutable en disco. |
| `ROTO` | Existe pero no funciona (cadena rota, endpoint muerto, cliente apuntando a puerto equivocado). |

---

## 2. Resumen ejecutivo (una sola mirada)

| # | Categoría | Valor real hoy | Valor diseñado/planeado |
|---|---|---|---|
| 1 | Señales físicas | 2 persistentes + 6 reales en vivo/local | UBTN, BBB, MQTT, bioacústica (diseño) |
| 2 | Fuentes de telemetría | HTTP V3, LabSignal, RobotTelemetry, Open-Meteo | Bridge MQTT, broker, firmware |
| 3 | Datasets | Dataset agrícola 22.488 imgs / 16 clases / 3 especies, CONGELADO | Holdout real, V3+ |
| 4 | Documentos científicos | 273 en `docs/` + 26 de Documentacion + 3 notebooks | Evidencia futura al KH |
| 5 | Activos de conocimiento | 51 docs KH registrados en 6 categorías | RAG, búsqueda, grafo, Evidence Ledger |
| 6 | Modelos matemáticos | Math V2 (transformadas), Falstad solver, mathHelpers | Modelos de series (Prophet/ARIMA/LSTM) |
| 7 | Simulaciones | 5 estrategias backend + Falstad + physics_sim + Math V2 | Lab Análisis Espectral (Fase 2) |
| 8 | Modelos IA | 1 modelo productivo siendo científico descalificado | M2 promoción, M3..M5, TFLite, series, bioacústica |
| 9 | Benchmarks | M1 baseline aprobada + M2 challenger ejecutado, decisión pendiente | M3..M5, decisión final |
| 10 | Activos experimentales | SSE infer log real, test_leaf, scripts | Firmware BBB 0 bytes, holdout vacío |

**Síntesis honesta**: existen 2 señales reales persistentes (temp/humedad V3 y telemetría de robot), 1 señal acústica real en vivo (micrófono Telecom, `REAL-LOCAL`), 1 dataset real congelado, 1 modelo IA real científicamente descalificado, 51 documentos de conocimiento legibles y el benchmark M1 (aprobado, sin artefactos en disco) + M2 (ejecutado, sin artefactos en repo). El resto del ecosistema es simulación o diseño.

---

## 3. Categoría 1 — Señales físicas

Inventario por dominio (canónico en `CMSC_SIGNAL_MAP_v1.md` §2; 12 tipos):

| Dominio | Real hoy | Simulado | Diseño (0%) |
|---|---|---|---|
| Físicas | `S10/S11` temp/humedad V3 · `S03` clima externo | `S13` sintéticas V1/V2 · `S33` electrónica | sensores UBTN físicos |
| Digitales | `S01` envelope V3 · `S12` sensor_id/ts · `S15` LabSignal | `S04` cluster fabricado | contrato UBTN `S23` |
| Lógicas | `S14` source_mode · `S52` RobotCommand | `S05` badge LIVE derivado | flags UBTN |
| Biológicas | — | — | `S20/S21` ECG/PPG/SpO2/IMU (100% diseño) |
| Acústicas | `S30` mic Telecom FFT · `S62` voz asistente | — | bioacústica CNN/CRNN `S77` |
| Espectrales | `S30` FFT real en vivo | `S35` transformadas Math V2 | Lab Análisis Espectral Fase 2 |
| RF | `S31` WebSDR (iframe) | `S34` telecom sintética | Receptor RF propio |
| Mecánicas | `S50` trayectoria robot persistida | `S51` physics_sim · `S53` métricas aleatorias | vibración IMU UBTN |
| Imágenes | `S60` entrada hoja 224×224 | — | TFLite edge, M3+ |
| Matemáticas | — | `S35` Fourier/Laplace/Wavelets | modelos de series diseñados |
| Documentales | `S79` 51 docs KH · `S80` manifiestos | — | RAG, grafo |
| IA | `S61` inferencia /infer · `S63` SSE infer log | `S05` demos confianza fabricada | ACP + subagentes |

**Evidencia de las señales reales**: `src/frontend/src/pages/Dashboard.jsx:176-202` (S01), `services/cloud.js:36-49` (S03), `src/backend/api/models.py:4-14` y `views.py:118-174` (S10/S11), `shared_kernel/event_bus/domain/lab_signal.py:9-34` (S15), `TelecomLab.jsx:16,23-36` (S30), `models.py:41-52` (S50), `fastapi_app.py:171-195` y `:212-278` (S60/S61), `:293-395` (S62), `:397-411` (S63).

---

## 4. Categoría 2 — Fuentes de telemetría

| Fuente | Estado | Evidencia |
|---|---|---|
| `SensorReading` HTTP V3 (temperature / humidity / sensor_id / timestamp) | OPERACIONAL (backend 8010, persistencia PostgreSQL) | `src/backend/api/models.py:4-14` · `views.py:118-174` · entidades `contexts/telemetry/domain/entities/sensor_reading.py` y `core/domain/entities/sensor_reading.py` |
| Envelope V3 `source_mode: live/simulated/fallback` | OPERACIONAL (etiqueta de ruta) | `views.py:102-174,261-285,315-327` |
| `LabSignal` evento de dominio (bus en memoria) | OPERACIONAL (in-process) | `shared_kernel/event_bus/domain/lab_signal.py:9-34` |
| `RobotTelemetry` persistida (batería, modo, XYZ, velocidad) | OPERACIONAL en backend; **cliente frontend ROTO** | `models.py:41-52` · `hooks/useRoboticsApi.js:3` apunta a `localhost:8000/api` (real = 8010) |
| Open-Meteo (clima externo) | OPERACIONAL (externa, re-etiquetada `clima-externo`) | `services/cloud.js:36-49` |
| Sintéticas V1/V2 (si no hay filas) | SIMULADO | `views.py:33-66,412-441` |
| Cluster/nodos (métricas fabricadas CPU/temp/red) | SIMULADO | `services/cloud.js:25-33` |
| `physics_sim.py` trayectoria helicoidal (POST 1/s) | SIMULADO | `scripts/physics_sim.py:8-64` |
| Estrategias `electronics` / `telecom` / `robotics` | SIMULADO (domain strategies) | `core/domain/strategies/electronics_strategy.py:14-41` · `telecom_strategy.py:15-35` · `robotics_strategy.py:13-34` |
| Broker MQTT, TFLite API, sensor reader IoT | DISEÑO (3 archivos de 0 bytes) | `src/embedded/bbb_01_gateway/mqtt_broker.py` · `bbb_02_ia_edge/tflite_api.py` · `bbb_03_sensors/sensor_reader.py` |

Medio de transporte: no hay broker MQTT en Docker Compose ni WebSockets; `wire_all()` del EventBus no se invoca al arranque (auditoría forense §5). La única vía real persistente es HTTP V3.

---

## 5. Categoría 3 — Datasets

| Activo | Estado | Evidencia verificada |
|---|---|---|
| Dataset agrícola (tomate/papa/maíz, 16 clases) | **EXISTE + CONGELADO** | `data/datasets/agriculture_images_tomato-potato-corn/v1/` |
| RAW original | EXISTE | `v1/RAW/` → **22.488 archivos** en 16 carpetas de clase |
| Curated con split real | EXISTE | `v1/curated/train` 15.741 · `validation` 3.373 · `test` 3.374 (**22.488**, seed 42, sin fugas por dedup SHA-256) |
| Etiquetas | EXISTE | `v1/labels/labels_v1.csv` (1 archivo) |
| Split lists | EXISTE | `v1/split_lists/` → 5 archivos: `split_report.json` · `split_report.md` · `test.csv` · `train.csv` · `validation.csv` |
| Manifiestos de gobernanza | EXISTE | `v1/manifests/` → 8 YAML (raw_source v1/v2, curation v1/v2, taxonomy v1, split v1, baseline v1/v2) |
| Holdout de mundo real | PLANEADO | `v1/holdout/real_world_holdout_v1/` → **0 archivos** |
| Dataset V3+ | DISEÑO | sin evidencia en disco |

Nota de honestidad: la carpeta física se llama `v1` pero la gobernanza del benchmark la trata como Dataset V2/V2+ (label schema validado y split re-generado). No existe carpeta `v2` separada en disco; la semántica "V2+" vive en los manifiestos y en `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md`. El dataset es **el activo más sólido del ecosistema**: íntegro, congelado y trazable.

---

## 6. Categoría 4 — Documentos científicos

| Conjunto | Cantidad | Estado | Ubicación |
|---|---|---|---|
| Documentación estratégica y de ingeniería | 273 archivos (132 en raíz + subcarpetas) | EXISTE | `docs/` |
| Docs EIARC (fundación + arquitectura + diagramas) | 3 + 13 + 16 | EXISTE | `docs/eiarc/` |
| Docs research_v2 | 18 | EXISTE | `docs/ai/research_v2/` |
| Manifiestos AI | 8 | EXISTE | `docs/ai/manifests/` |
| Docs project knowledge base | 6 | EXISTE | `docs/project_knowledge_base/` |
| Docs históricos | 4 | EXISTE | `docs/historical/` |
| Documentación IA/benchmark (activa) | 8 (6 Benchmark_M1 + ESTADO_ACTUAL + AUDITORIA) | EXISTE | `Documentacion/IA/` |
| Documentación de Arquitectura CMSC | 18 | EXISTE (untracked) | `Documentacion/Arquitectura/` |
| Notebooks de entrenamiento | 3 (M1, M2, plant_disease_training) | EXISTE | `notebooks/`, `src/ai_models/notebooks/` |
| Respaldo documental UBTN | 60 | EXISTE (preservación) | `backup_ubtn_docs/` |

Los 51 documentos registrados en el Knowledge Hub son el subconjunto canónico publicado en el visor (se detallan en Categoría 5). El resto de `docs/` es fuente primaria sin indexar.

---

## 7. Categoría 5 — Activos de conocimiento

| Activo | Estado | Evidencia |
|---|---|---|
| Registry generado del KH | OPERACIONAL (visor `/knowledge`) | `src/frontend/src/knowledge-hub/registry/knowledgeRegistry.generated.json` |
| 51 documentos en 6 categorías | OPERACIONAL (solo visor, sin búsqueda/RAG/grafo) | ids enumerados en §7.1 |
| Visor documental | OPERACIONAL | `KnowledgeHubLayout`, `MarkdownDocumentView`, `docLoader` (frontend 5174) |
| Investigación RAG/búsqueda/grafo | DISEÑO | `CMSC_F3E` roadmap F3E-1..F3E-4 |
| Evidence Ledger + Hangar de Autenticidad | DISEÑO | `CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md` |

**Estado honesto del conocimiento**: el KH es hoy un repositorio de lectura (sumidero documental), no recibe evidencia nueva de labs ni de IA; la columna KH de la matriz de continuidad está vacía para todos los labs (ver Categoría 10 y `CMSC_LABS_RESTRUCTURING_PLAN_v1.md:175`).

### 7.1 Los 51 documentos del registry

| Categoría | Cantidad | ids |
|---|---|---|
| project-core | 7 | readme · masterdoc · plan_maestro · system_boot · adso_guia · edge_setup · api_reference |
| eiarc-foundation | 3 | eiarc_mission · eiarc_scope · eiarc_vision |
| eiarc-architecture | 13 | eiarc_ai_context_implementation_guide · eiarc_ai_context_refactor_plan · eiarc_ai_pr1_code_review · eiarc_ai_semantic_contract · eiarc_canonical_data_model · eiarc_canonical_principles · eiarc_contexts · eiarc_implementation_blueprint · eiarc_transformation_plan · eiarc_telemetry_context_implementation_guide · eiarc_telemetry_context_refactor_plan · eiarc_telemetry_database_diagnostic · eiarc_telemetry_pr1_code_review |
| knowledge-base | 6 | kb_001_trae_independent_repository_audit · kb_002_readme_reality_check · kb_003_ai_integration_audit · kb_004_ai_semantic_contract_audit · kb_005_eiarc_ai_canonical_model · kb_006_pending_changes_audit |
| historical | 4 | historical_informe_analisis_y_plan_de_accion · historical_readme_reality_check · historical_trae_ai_integration_audit · historical_trae_independent_repository_audit |
| research-v2 | 18 | readme del programa + 17 de gobernanza/ejecución: readiness · dataset_inventory · data_quality · execution_plan · label_schema · notebook_roadmap · split_specification · taxonomy · architecture · implementation_audit · remediation_report · dataset_discovery · dataset_strategy · mlops_governance · prediction_validation_audit · scientific_correction_design · training_pipeline |

---

## 8. Categoría 6 — Modelos matemáticos

| Modelo | Estado | Evidencia |
|---|---|---|
| AdvancedMathLab V2 (Dr. Binary: Fourier, Laplace, Wavelets, phase portraits) | OPERACIONAL (motor moderno, `SIM`) | `labs/AdvancedMathLabV2.jsx:234-267,391` |
| AdvancedMathLab V1 (motor legado) | ROTO (oculto, `SHOW_LEGACY_ENGINE_TOGGLE=false`) | preservar en git, rol absorbido por V2 |
| Solver eléctrico electrónico (Falstad + solver Python local) | OPERACIONAL (`SIM`) | `ElectronicsLab.jsx:316-325,451,944-966` · `FalstadPanel.jsx` · `adapters/falstadAdapter.js:186-191` |
| `mathHelpers` (implementación matemática compartida) | OPERACIONAL | `labs/mathHelpers.js` (soporta V1/V2) |
| Modelos de series diseñados (Prophet, ARIMA/SARIMA, XGBoost, LSTM, GRU, TCN, TFT) | DISEÑO | `docs/ai/research_v2/..._MLOPS...:672-700` (señal `S76`) |
| Análisis espectral (FFT/STFT/Wavelets) | DISEÑO (Fase 2 CMSC) | `CMSC_MASTERPLAN_v1.md` · `CMSC_SIGNAL_MAP_v1.md` §5 |

**Veredicto forense aplicable**: el lab matemático es **modelador de señales** (no calculadora) — Opción B del plan de reestructuración (`CMSC_LABS_RESTRUCTURING_PLAN_v1.md:181-183`). Ningún modelo matemático se reescribe.

---

## 9. Categoría 7 — Simulaciones

| Simulación | Estado | Evidencia |
|---|---|---|
| Estrategia de electrónica backend (voltaje, corriente, temperatura sintéticos) | SIMULADO | `core/domain/strategies/electronics_strategy.py:14-41` |
| Estrategia de telecom (frecuencia_dominante, snr, signal_strength, noise_floor) | SIMULADO | `core/domain/strategies/telecom_strategy.py:15-35` |
| Estrategia de robótica (temp/humedad "Simulado Domain v2") | SIMULADO | `core/domain/strategies/robotics_strategy.py:13-34` |
| Trayectoria robótica helicoidal | SIMULADO | `scripts/physics_sim.py:8-64` |
| Métricas de cluster fabricadas | SIMULADO | `services/cloud.js:25-33` · badge `LIVE` derivado `Dashboard.jsx:219-224,360-370` |
| Señales sintéticas V1/V2 de telemetría | SIMULADO | `views.py:33-66,412-441` |
| Transformadas matemáticas en navegador (Dr. Binary) | SIMULADO | `AdvancedMathLabV2.jsx:234-267` |
| Falstad (circuitos) | SIMULADO | `FalstadPanel.jsx` |
| Osciloscopio/THD | SIMULADO | `ElectronicsLab.jsx:316-325,944-966` |
| Consola DataScience (Pyodide) | PARCIAL/ROTO | `pages/DataScienceLab.jsx:5,62-92` (SSE deprecado) |
| Esquema JSON del editor | HÍBRIDO (entrada real de archivo) | `SchematicEditor.jsx:773,1817` (en cuarentena) |

Toda simulación lleva estado honesto; ninguna se oculta como real.

---

## 10. Categoría 8 — Modelos de IA

| Modelo | Estado | Evidencia |
|---|---|---|
| `plant_disease_mbv2.h5` (productivo, binario enferma/sana) | EXISTE, **científicamente descalificado** (colapsa a class_0 ~0.99) | `src/ai_models/production_models/plant_disease_mbv2.h5` · `model_metadata.json` (`classes: enferma/sana`, `framework: tensorflow_fixed`) · `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md:98-103,153-158` |
| M1 MobileNetV2 (baseline oficial, 16 clases) | APROBADO/CONGELADO, **sin artefactos reconstruibles en disco** | `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md:29-47` · `benchmark/runs/M1_mobilenetv2_001/` (carpetas vacías: checkpoints, plots, report) |
| M2 EfficientNet-B0 (challenger) | EJECUTADO OFICIALMENTE, **sin artefactos en repo** (solo en ESTADO_ACTUAL; la carpeta `runs/M2_efficientnet_b0` no existe en disco) | `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` · contradicción C6 en `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` |
| Reglas de conversación y umbrales (no-ML) | OPERACIONAL | `ai_models/conversation_context.py:217-243` · `fastapi_app.py:97-155,416-443` |
| Servicio de inferencia y voz (FastAPI, puerto 8081) | OPERACIONAL | `ai_models/fastapi_app.py` (endpoints `/infer`, `/assist`, `/events`, `/analyze-circuit`) |
| Scripts y notebook de entrenamiento | EXISTE | `train_plant_disease_mobilenet.py` · `notebooks/plant_disease_training.ipynb` · `benchmark/src/{datasets,eval,metrics,models,train}.py` |
| Modelos diseñados M3..M5 (ResNet50, ConvNeXt-Tiny, MobileNetV3) | DISEÑO | `ESTADO_ACTUAL_BENCHMARKS.md` |
| TFLite edge | DISEÑO | `src/embedded/bbb_02_ia_edge/tflite_api.py` (0 bytes) |
| Series temporales, bioacústica, Signal Intelligence | DISEÑO | señales `S76/S77/S78` en `CMSC_SIGNAL_MAP_v1.md` |

El único modelo con peso físico en el repo es el degenerado; los pesos de M1 y M2 no están materializados en el repositorio (M1 en Colab sin recolección; M2 en Drive/Colab, recolección pendiente).

---

## 11. Categoría 9 — Benchmarks

| Activo | Estado | Evidencia |
|---|---|---|
| M1 MobileNetV2 — baseline oficial | APROBADO/CONGELADO (macro-F1 0.9899 · ECE 0.0313 · balanced_acc 0.9898) | 6 docs en `Documentacion/IA/Benchmark_M1_MobileNetV2/` · `ESTADO_ACTUAL_BENCHMARKS.md` |
| M2 EfficientNet-B0 — challenger | EJECUTADO 2026-09-27 (macro-F1 0.9937 · balanced 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · epoch 32 · ~4.66 h), gates PASS | `ESTADO_ACTUAL_BENCHMARKS.md` · notebook `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` |
| Decisión M1 vs M2 | **PENDIENTE** (gate G1 del readiness) | `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` |
| Código fuente del benchmark | EXISTE | `benchmark/` → `config.yaml` · `README.md` · `requirements.txt` · `src/{datasets,eval,metrics,models,train}.py` |
| Directorios de corridas | EXISTE (vacíos) | `benchmark/runs/M1_mobilenetv2_001/` |
| Manifiestos de experimento (v1/v2) | EXISTE | `data/datasets/.../v1/manifests/*.yaml` (baseline_experiment_manifest.v1 y .v2) |
| Tabla comparativa M1 vs M5 | EXISTE (cuerpo, sin cerrar) | `Documentacion/IA/Benchmark_M1_MobileNetV2/TABLA_COMPARATIVA_M1_M5.md` |

El benchmark es el único proceso científico cerrado del ecosistema: política canónica, split sin fugas, validación y gates. Su espina pendiente es la decisión final y la materialización de artefactos M1/M2 en el repo.

---

## 12. Categoría 10 — Activos experimentales

| Activo | Estado | Evidencia |
|---|---|---|
| SSE `infer_log.jsonl` (colas de evidencia de inferencias) | OPERACIONAL | `fastapi_app.py:397-411` |
| Imagen de prueba para inferencia | EXISTE | `src/ai_models/test_leaf.jpg` |
| Firmware IoT/BBB (broker, tflite, sensor reader) | DISEÑO (3 archivos, 0 bytes) | `src/embedded/bbb_0*.py` |
| `newton_bridge.py` (puente de cálculo) | EXISTE | `scripts/newton_bridge.py` |
| `physics_sim.py` (simulador de trayectoria) | SIMULADO | `scripts/physics_sim.py:8-64` |
| SchematicEditor | EN CUARENTENA (8 commits, sin señal) | `labs/SchematicEditor.jsx` |
| DataScienceLab | HUÉRFANO (~10 meses sin commits) | `pages/DataScienceLab.jsx` |
| Backup documental UBTN | PRESERVADO | `backup_ubtn_docs/` (60 archivos) |
| Holdout de mundo real | PLANEADO (0 archivos) | `v1/holdout/real_world_holdout_v1/` |
| Señales UBTN (BODY_TEMP, HR, RR, SpO2, ECG/PPG, IMU, colmena) | DISEÑO (100%) | `docs/UBTN_DOMAIN_MODEL.md:90-119` · catálogo `docs/UBTN_SENSOR_CATALOG.md:5-19` |

---

## 13. La cadena Dato → Información → Conocimiento → Impacto HOY

| Eslabón | Qué existe | Qué falta |
|---|---|---|
| Dato | SensorReading V3 persistido · RobotTelemetry · dataset 22.488 · mic FFT · foto hoja | Sensores físicos desplegados, MQTT |
| Información | Envelope V3 · LabSignal · estrategias de labs · análisis espectral local · inferencias SSE | Cableado labs→KH |
| Conocimiento | 51 docs KH (visor) · 18 research_v2 · manifiestos · baseline M1 cifrado | Búsqueda, RAG, grafo, Evidence Ledger |
| Impacto | Alerta S.O.S. por umbrales · diagnóstico AIPredictiva · telemetría del Dashboard | ACP, automatización, decisiones |

---

## 14. Inventario respondido (respuesta a la pregunta final)

**¿Cuál es el inventario real de activos científicos disponibles hoy en SIGCTiARURAL?**

| Categoría | Activos verificados en disco hoy |
|---|---|
| Señales físicas reales | 2 persistentes (temp/hum V3, RobotTelemetry) + FFT mic en vivo + clima externo + WebSDR + entrada de imagen + voz |
| Fuentes de telemetría operacionales | 5 (HTTP V3, LabSignal, RobotTelemetry API, Open-Meteo, sintéticas fallback) |
| Datasets existentes | 1 congelado (22.488 imgs / 16 clases / 3 especies, split 15.741/3.373/3.374, seed 42) |
| Documentos científicos | 273 `docs/` + 8 `Documentacion/IA` + 18 `Documentacion/Arquitectura` + 3 notebooks + 60 backup UBTN |
| Conocimiento registrado | 51 docs KH operacionales en 6 categorías (7+3+13+6+4+18) |
| Modelos matemáticos operacionales | Math V2, mathHelpers, solver Falstad (simulados) |
| Simulaciones operacionales | 5 estrategias backend + physics_sim + Falstad + Math V2 |
| Modelos IA | 1 peso real (descalificado) + M1 aprobado (sin pesos) + M2 ejecutado (sin pesos) + servicio 8081 |
| Benchmarks | M1 aprobado/congelado + M2 challenger ejecutado + fuente completa + manifiestos; decisión final PENDIENTE |
| Experimentales | SSE infer log, test_leaf, puente newton, firmware 0 bytes, SchematicEditor cuarentena, UBTN diseño |

**Veredicto**: el ecosistema tiene **1 dataset real íntegro**, **2 señales reales persistentes** (más la única señal acústica local en vivo), **1 modelo IA real pero descalificado**, **51 documentos de conocimiento legibles**, **2 corridas de benchmark (una aprobada, una validada)** y **un servicio de IA y voz operacional**. Todo lo demás es simulación honesta o diseño documentado. El inventario confirma que CMSC puede arrancar con datos y señales reales limitados pero suficientes para el primer slice (F3C v1), siempre con honestidad de estado.

---

## 15. Honestidad final

1. Documento de SOLO LECTURA: no se modificó, no se implementó, no se committeó nada. HEAD `18b95b1` intacto; `stash@{0}` intacta.
2. Fuentes de verdad: `CMSC_SIGNAL_MAP_v1.md`, `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md`, `CMSC_LABS_RESTRUCTURING_PLAN_v1.md`, verificación directa de disco el 2026-09-29 y `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md`.
3. Este inventario es la base de clasificación para cualquier misión futura: todo nuevo activo debe indicar su categoría y su estado honesto (actualizar este documento, jamás borrar).

*Documento de inventario. Sin implementación. Cero commits.*