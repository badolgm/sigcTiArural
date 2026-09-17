# SIGCTiArural — Inteligencia Artificial y Machine Learning: Estado del Arte (State of the Art)

**Documento:** SIGCTIARURAL_AI_ML_STATE_OF_THE_ART
**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Naturaleza:** Auditoría científica (MISIÓN IA-01). SOLO AUDITAR. Sin implementación, sin modificaciones de código ni de documentación canónica.
**Principio supremo:** La documentación canónica es la fuente de verdad; el código es evidencia. Cada afirmación se rastrea al documento que la sustenta.

**Perímetro de evidencia:** `docs/AI_PIPELINE.md`; familia `docs/ai/research_v2/` (18 docs, 2026-07-16, autodeclaradas "no implementa, no entrena, no programa"); UBTN edge (estrategia, gateway, hardware, backlog, gaps, roadmaps); `docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md` y `AI_CONTEXT_V2_ARCHITECTURE.md`; artefactos físicos verificados en disco.

**Hecho global verificable:** todo documento V2 se declara diseño; todo el stack UBTN está en diseño (0 bytes de código embebido). El único modelo entrenado que existe en el repositorio es **`plant_disease_mbv2.h5` (9.431.432 bytes, MobileNetV2 binaria)**.

---

## 0. Resumen ejecutivo

SIGCTiArural tiene una **pila de IA documentalmente excepcional y materialmente mínima**: gobernanza MLOps de nivel industria, contratos semánticos EIARC y un programa de investigación en 7 líneas — todo en diseño — frente a una única materialización: un clasificador binario MobileNetV2 que **colapsa en una sola clase** con confianza 0.99 incluso ante entradas no vegetales (severidad crítica auditada). No existe ningún dataset físico en el repositorio. El cuello de botella científico no es la arquitectura IA (diseñada con rigor) sino **la ausencia de datos materializados y de ground truth etiquetado**.

---

## 1. Estado actual de la IA: real / demo / diseño

### Lo que existe REALMENTE (evidencia en disco)
| Artefacto | Evidencia | Función |
|---|---|---|
| Modelo binario `plant_disease_mbv2.h5` (MobileNetV2, Keras/TF) | Archivo verificado en disco | Clasificación `enferma`/`sana` |
| Servicio de inferencia FastAPI (`src/ai_models/fastapi_app.py`, endpoints `/health`, `/models`, `/infer`) | Archivo y logs de inferencia auditados | Inferencia HTTP sobre el `.h5` |
| Resolvedor semántico `semantic_prediction_resolver.py` (infrastructure backend) | En disco; ya implementa contrato `binary_only` (commits `565ad2e`, `57a40c4`) | Traducción trazable class_0/class_1 → significado |
| `model_metadata.json` (65 B; `{"classes":["enferma","sana"],"framework":"tensorflow_fixed"}`) | En disco | Identidad del modelo |
| `test_leaf.jpg` (una imagen de prueba) | En disco | Prueba manual |
| 5 manifiestos YAML de gobernanza (raw_source, curation, taxonomy_binding, split, baseline_experiment) | `docs/ai/manifests/` | Contratos de datos/diseño |
| Respuesta real auditada (2026-07-16): `{"diagnosis":"class_0","confidence":0.9953,"class_index":0,"model":"plant_disease_mbv2.h5","processing_time":"0.34s"}` | `AI_PREDICTION_VALIDATION_AUDIT.md §3.2` | Comportamiento observado |

### Lo que es DEMO / simulación
- `robotMode` de `AIPredictiva.jsx`: emite códigos demo (Tomato_Late_blight, Tomato_Healthy, Tomato_Early_blight) — "demo, no inferencia real" (`AI_SCIENTIFIC_CORRECTION_DESIGN.md §5.3`).
- Fallback hardcodeado en `fastapi_app.py`: si TF/modelo falla → `diagnosis="Tomato_Early_blight", confidence=0.87`; en excepción → `confidence=0.5, model="fallback", status="error"`.
- Escenarios simulados de AIPredictiva (conf 0.97/0.96) y SSE de DataScienceLab (confidence en vivo).
- **Desalineación grave auditada:** la UI mostró "TIZÓN TEMPRANO (ALTERNARIA SOLANI)" — texto NO soportado por el modelo real ni por la ruta oficial; proviene solo de `PLANT_DISEASE_DB` / `processDiagnosis()` / legado (`AI_PREDICTION_VALIDATION_AUDIT.md §1, §7, §21`).

### Lo que es DISEÑO (no implementado)
- Todo el programa `research_v2` (datasets, pipelines, MLOps, benchmark).
- Todo el stack UBTN edge (E0–E3, BBB-02 TinyML, firmware ESP32).
- Knowledge AI / RAG local; multimodal fusion; audio; señales.
- Corrección científica en su parte de UI (resolvedor ya corregido en código; la separación REAL/SIMULACIÓN/ROBOT DEMO y la depuración de `PLANT_DISEASE_DB` en la interfaz NO están implementadas).

---

## 2. Estado actual de Machine Learning

### Modelos que EXISTEN (entrenados)
| Modelo | Arquitectura | Entrenamiento | Datos | Métricas |
|---|---|---|---|---|
| `plant_disease_mbv2.h5` | MobileNetV2 (backbone imagenet congelado, GlobalAveragePooling2D, Dropout 0.2, Dense(2, softmax), 224×224, batch 32) | 1 corrida; epochs 3 (script) / 5 (notebook); adam; sparse_categorical_crossentropy | `data/datasets/plant_disease/{train,val}` — **ausente hoy** | **Ninguna reportada**; el ejemplo de nombre `plant_village_mbv2_acc91.h5` ("acc91") no tiene soporte documental |

### Modelos DISEÑADOS (cero corridas)
| Área | Arquitecturas diseñadas |
|---|---|
| Agricultura (benchmark V2 propuesto) | **EfficientNet-B0** (baseline principal), **MobileNetV3-Large** (edge baseline; Small para BBB), **ResNet50** (control clásico), **ConvNeXt-Tiny** (techo experimental); adyacentes: EfficientNetV2-S, YOLOv8n/s, U-Net |
| Telemetría | Prophet, ARIMA/SARIMA, XGBoost, LSTM, GRU, TCN, Temporal Fusion Transformer |
| Salud animal (collar) | XGBoost, LightGBM, RandomForest, LSTM, GRU (anomalía conductual) |
| Audio | CNN sobre espectrogramas, CRNN, embeddings acústicos + clasificador tabular |
| Multimodal (fase 3) | Score-level / feature-level fusion, dual tower / transformer multimodal |
| Señales | FFT, STFT, wavelets, change-point detection |

### Datasets que EXISTEN (físicamente)
**Ninguno.** No hay directorio `data/` raíz; no hay imágenes/archivos de dataset. Solo existen: el `.h5`, `model_metadata.json` y `test_leaf.jpg`.

### Datasets AUDITADOS / DISEÑADOS
- **PlantVillage (auditado, en otra máquina):** `C:\Users\Devbadolgm\...\PlantVillage-Dataset-master` (ruta inexistente en la máquina actual BagmDev); `raw/color` = 52.977 imágenes / 38 clases / 14 grupos botánicos; derivadas 146.351; desbalance 36.23×.
- **Subconjunto V2 agrícola (diseño, inventariado):** **21.160 RGB / 16 clases / 3 especies** (tomate, papa, maíz); ratio 35.24×; clases de riesgo (papa healthy=152, tomate mosaic=373, tomate septoria=443, maíz grey spot=513). Dictamen oficial: apto solo como **bootstrap de laboratorio**, no para validar campo (`AGRICULTURE_AI_V2_DATASET_INVENTORY.md §5.3`).
- **Split `agriculture_v2_split_v1` (70/15/15, estratificado, anti-fuga):** especificado; las listas `train/validation/test.csv` "se generan en una fase posterior" — **no materializadas**.
- **Ausentes por completo:** datasets propios de campo, ganado, collares, telemetría, y oleada regional cacao/café/banano.

### Qué falta (ML)
1. Materializar el dataset (split físico). 2. Ejecutar el benchmark (4 arquitecturas, macro-F1). 3. Calibración (ECE). 4. Datasets propios etiquetados. 5. Validación de campo / `real_world_holdout`. 6. Reemplazar el modelo binario colapsado.

---

## 3. Estado actual de Deep Learning

### Redes que EXISTEN (entrenadas)
| Red | Dónde | Estado |
|---|---|---|
| MobileNetV2 CNN (Keras/TF) | `plant_disease_mbv2.h5` | Implementada; **colapso monoclasse auditado** (severidad crítica) |

Colapso observado (3 entradas): `test_leaf.jpg`, `solid_red.jpg` (sintética) y `checker.jpg` (no vegetal) → todas class_0 con confianza 0.9876–0.9954; `class_1` nunca observada. `class_1` no es alcanzable en la práctica → el modelo degenera a un detector degenerado.

### Redes PLANTEADAS (diseño, cero ejecuciones)
- Visión: EfficientNet-B0/B1, EfficientNetV2-S, MobileNetV3-Large/Small, ResNet50, ConvNeXt-Tiny, YOLOv8n/s, U-Net.
- Secuencias/tabulares: LSTM, GRU, TCN, Temporal Fusion Transformer, Prophet, XGBoost.
- Audio (diseño): CNN espectrograma, CRNN.
- Multimodal (diseño): dual tower / transformer multimodal, fusion score/feature.

### Redes que FALTAN
- **Prácticamente todas las elegibles:** ninguna de las candidatas V2 tiene un solo entrenamiento, checkpoint ni métrica.
- No hay PyTorch en ninguna referencia del perímetro (framework exclusivo TF/Keras + TFLite).
- No hay redes de series temporales ni de salud animal materializadas (solo diseño en programa V2).

---

## 4. Estado actual de LLM

### Encaje documentado (diseño, una sola referencia explícita)
En `docs/ai/research_v2/AI_CONTEXT_V2_ARCHITECTURE.md` §11:
- **Knowledge AI capa de conocimiento:** "**RAG local/gobernado sobre el Knowledge Hub**" (búsqueda semántica sobre el registry de 51 docs).
- §11.5/§12.4: "**LLM de apoyo — solo para explicación y síntesis, nunca como sustituto del motor predictivo principal**"; embeddings locales ligeros + reranker pequeño.

### Roles en la documentación
| Rol preguntado | ¿Existe en los docs? |
|---|---|
| Como tutor | **No** — ningún doc define LLM-tutor |
| Como investigador | **No** — solo Knowledge/RAG local para síntesis |
| Como copiloto científico | **Parcial (diseño)** — síntesis/explicación sobre el KH, subordinado al motor predictivo |
| Como agente | **No** — los "robot" de la documentación son `robotMode` (demo UI), no agentes LLM |

### Hechos duros
- En todo el perímetro auditado (research_v2, pipeline, edge, UBTN): **cero menciones de HuggingFace, GPT/Llama, transformadores-NLP**. Los únicos "transformer" son temporales (Temporal Fusion Transformer) o multimodales (dual tower).
- No hay plan de infraestructura LLM (serving, GPUs, costos) ni dataset de instrucciones.
- **Lectura:** el proyecto trata los LLM como herramienta de *superficie explicativa* sobre el Knowledge Hub, no como motor del sistema. Coherente con su identidad (conocimiento verificable: el motor es la ciencia, no la generación).

---

## 5. Estado actual de Edge AI

### BBB (BeagleBone Black Rev C) — 512 MB RAM, Cortex-A8 1 GHz
| Nodo | Rol | Capacidad real | Estado |
|---|---|---|---|
| BBB-01 | Gateway (Mosquitto broker preexistente, `ubtn_bridge.py` MQTT→HTTPS, buffer SQLite store-and-forward) | Transporte; sin IA | Integración física "en progreso"; **código `src/embedded/bbb_*` = 0 bytes** |
| BBB-02 | Nodo de inferencia edge (futuro) — TFLite **y** ONNX Runtime | Detección de anomalías/estado, series cortas | Diseño (post-U7) |
| BBB-03 | Corral: ambiente (temp/humedad, cámara) | Sensórica | Diseño |

- Guía de diseño (research_v2): en BBB es realista MobileNetV3 **Small** (extremo) o **Large** (gateway); ResNet50/ConvNeXt-Tiny **no** son realistas en BBB.

### ESP32 (collares UBTN V1–V4) — 520 KB SRAM, ~240 MHz
- **Reglas ligeras por diseño (E0):** umbrales, filtrado, deep-sleep + burst. ADR-UBTN-14 = edge-first: reglas antes que TinyML (rechazó ML-on-board desde el MVP).
- TinyML (TFLite Micro/MicroPython) **deliberadamente rechazado en el MCU** por RAM (520 KB). El edge analítico crece en la BBB, no en el MCU (`UBTN_HARDWARE_ROADMAP.md §5`).
- Firmware = fase U5, no creado.

### Raspberry Pi
- **Sin capacidad IA documentada en el perímetro.** Solo aparece como entrada futura de catálogo; "Raspberry, Jetson, FPGA y Mini PC NO están inventariados" (`SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md`).

### Jetson (NVIDIA)
- **Sin claims de IA en los docs requeridos.** Referencias dispersas: "IA en el borde con GPU/CUDA/TensorRT", "UBNT (futura evolución de BBB-02)" — sin inventario, sin ficha, sin plan.

### UBTN — modelo de cómputo edge (E0→E3) — Todo diseño, 0%
| Etapa | Ubicación | Workload | Fase |
|---|---|---|---|
| E0 | ESP32 firmware | umbrales, filtrado, sleep/wake | U5 |
| E1 | BBB-01 bridge | umbrales por especie, medias móviles, calidad de señal | U3–U4 |
| E2 | BBB-02 (TFLite/ONNX) | clasificación de estado, anomalía serie corta | post-U7 |
| E3 | Nube (AI Context) | modelos pesados, benchmark, calibración | U6 |

Evolución sancionada: "Reglas interpretables (E1) → dataset etiquetado propio (U6) → baseline ML (U6) → benchmark vs umbrales (macro-F1) → TinyML (post-U7)".

---

## 6. Investigación: líneas científicas recurrentes

Líneas que aparecen **repetidamente** a través de los documentos (convergencia = prioridad implícita):

1. **Reglas primero, ML después** (ADR-UBTN-14, ADR-06, `RESEARCH_GAPS` IA1 diferido, `HARDWARE_ROADMAP §5`, backlog RI-12/13).
2. **Dato propio etiquetado como prerrequisito ausente** (RI-18, `EDGE_AI_STRATEGY §5.3`, gaps IA2 "no existe gold standard", Execution Plan Fase 6, veredicto "no listo para campo").
3. **Benchmark honesto macro-F1 contra umbrales** (edge strategy, execution plan §6/§7/§11, backlog RI-12) — no accuracy.
4. **Viabilidad/exportación a edge como eje de evaluación de primera clase** (BBB-02 TFLite, MobileNetV3-Large edge baseline, notebook `14_edge_assessment`, cuantización).
5. **Honestidad científica / alerta ≠ diagnóstico** (RSK-REG-02, `AI_SCIENTIFIC_CORRECTION_DESIGN` completo, contrato semántico "meaning beats form").
6. **Calibración + protección de clases minoritarias como puertas de promoción** (ECE obligatorio, exec plan §8/§10/§14).
7. **Gobernanza de datos: retención, consentimiento, seudonimización** (RI-17, gaps D1/G-GOBERNANZA, ADR-16).
8. **Deuda transversal Identity/FacilityId** (A-6, security model §6, guía de onboarding) — bloquea RBAC y vínculo nodo→finca.

---

## 7. Roadmap científico (IA · ML · Datasets · Investigación)

### Roadmap IA (programa rector V2 — 7 líneas, horizonte 1-3-5 años)
- Líneas: Agricultura (máx. prioridad, arranque) · Telemetría (muy alta, 2ª) · Knowledge AI (alta, temprana) · Salud Animal (alta, tras Agrícola+Tele) · Audio (media) · Señales (media) · Fusión Multimodal (alta a mediano plazo, NO primera).
- **1 año** (6 hitos): baseline agrícola V2 inicial; dataset agrícola propio mínimo; baseline telemetría predictiva; diseño/arranque dataset collares; arquitectura Knowledge AI inicial; programa notebooks+benchmarks.
- **3 años** (7 hitos): datasets propios robustos; Agrícola con validación de campo; Telemetría operacional; Salud Animal funcional; primeras capacidades Audio; primer benchmark fusión multimodal; Model Registry + monitoring maduros.
- **5 años** (6 hitos): fusión multimodal útil y explicable; cloud-edge maduro; línea regional cacao/café/banano; audio+señales en decisión; Knowledge AI integrado; operación científica sostenida.

### Roadmap ML (Execution Plan agrícola V2 — 6 fases, GO condicionado)
1. Finalizar dataset (freeze 16 clases, manifiestos, normalizar taxonomía) → 2. Split y gobernanza (dedup, split_v1, froze reglas) → 3. **Benchmark core (4 arquitecturas, macro-F1, ECE)** → 4. Evaluación científica → 5. Decisión baseline (master + edge) → 6. Validación de campo + dataset agrícola propio.
Gates GO/NO-GO ya definidos; el GO actual es **solo para benchmark de laboratorio controlado**.

### Roadmap datasets
PlantVillage bootstrap de laboratorio (materializar split_v1) → dataset agrícola propio mínimo (1 año) → datasets robustos + collares (3 años) → regional cacao/café/banano (5 años).

### Roadmap investigación (backlog UBTN y programa V2)
- **UBTN P0 (obligatorio, pre-MVP):** rangos fisiológicos por especie (RI-01), calibración de biometría por sitio (RI-02), protocolo bienestar/habituación (RI-03), form factor por especie (RI-04). Bloquean U2/U5/U6/U7.
- **P1 (post-MVP):** PPG sobre pelaje/movimiento, plataforma y sensor de comparación, bandas/norma LoRa-WiFi (CRC/MINTIC), presupuesto energético, detección por IMU (hipoactividad/rumia), dedup buffer, gobernanza biométrica, estrategia dataset de campo.
- **P2 (escalado):** bolo ruminal, baseline anomalía IA + benchmark vs umbrales (macro-F1), factibilidad TinyML BBB-02 (post-U7), vigilancia acústica de colmenas, sensores acuícolas, red LoRaWAN multi-gateway.
- MLOps (Fase 0→8): gobierno fundacional → baseline agrícola → telemetría → collares/salud → audio → señales → Knowledge AI → fusión multimodal → MLOps operativo completo.

---

## 8. Clasificación por madurez (VERDE / AMARILLO / ROJO)

### VERDE — funciona y tiene evidencia real
| Tema | Evidencia |
|---|---|
| Contrato semántico EIARC (12 campos, 9 reglas) | `EIARC_AI_SEMANTIC_CONTRACT.md` (canónico, v1.0.0) |
| Gobernanza MLOps documentada (4 pilares, registry, drift, validación) | `AI_MLOPS_AND_TRAINING_GOVERNANCE_V2.md` (diseño de nivel industria) |
| Manifiestos de datos (5 YAML) | `docs/ai/manifests/` |
| Resolvedor semántico `binary_only` corregido en código | commits `565ad2e`, `57a40c4` |
| Inferencia HTTP funcional (FastAPI) | logs auditados |
| Cultura de honestidad científica (alerta ≠ diagnóstico, badge REAL/SIM/ROBOT) | `AI_SCIENTIFIC_CORRECTION_DESIGN`, RSK-REG-02 |

### AMARILLO — parcial / demo / diseño avanzado con GO condicionado
| Tema | Detalle |
|---|---|
| Modelo binario MobileNetV2 | **Opera pero es defectuoso (ver ROJO)**; es la única materialización DL |
| Corrección científica | Resolvedor hecho; **UI (3 modos, quitar PLANT_DISEASE_DB) NO hecha** |
| Pipeline V2 agrícola | Diseño completo; GO **condicionado** a materializar split |
| Edge AI UBTN | Estrategia E0–E3 completa; código 0 bytes; integración BBB en progreso |
| Knowledge AI / RAG local | Diseño en `AI_CONTEXT_V2_ARCHITECTURE.md` |
| Programa research_v2 (18 docs) | Diseño de nivel programa; 0 entrenamientos |

### ROJO — crítico / inexistente / en conflicto
| Tema | Evidencia |
|---|---|
| **Dataset físico** | NO existe en el repositorio (PlantVillage solo auditado en otra máquina) |
| **Modelo binario colapsado** | Severidad **Crítica** auditada; class_1 inalcanzable; confianza 0.99 en basura |
| **Desalineación UI** | "Tizón Temprano (Alternaria solani)" mostrado sin soporte del modelo real |
| **Ground truth / gold standard** | No existe (ni agrícola ni biológico) |
| **Validación de campo** | NO-GO: "no listo para declarar validez de campo" |
| **Entrenamientos V2** | Cero corridas de las 4 arquitecturas candidatas |
| **MLOps operativo** | Tracking/registry/monitoring/drift/fusion-store: 0% implementado |
| **Hardware UBTN físico** | 0 fabricado; decisión MVP abierta (A-7) |
| **Identity/FacilityId** | Deuda transversal que bloquea RBAC |

---

## 9. El verdadero cuello de botella científico

**La DATA.** No existe ningún dataset físicamente materializado ni ground truth etiquetado en el repositorio, y sin datos:
- no hay entrenamiento multiclase (0 corridas),
- no hay validación de campo (NO-GO explícito),
- no hay gold standard biológico para collares (IA1/IA2 diferidos),
- la única "IA" es un binomio columnista colapsado.

La **arquitectura** (contrato semántico, gobernanza MLOps, pipeline, plan de validación) está **por delante** de la materialización — es un sistema documentalmente eclipsado por sus propios datos ausentes. Un segundo bloqueante transversal es la **deuda Identity/FacilityId**, pero es secundaria frente a la ausencia de datos.

---

## 10. La UNA cosa en la que invertir esfuerzo próximos meses

> **Materializar el primer dataset físico y ejecutar el benchmark de laboratorio agrícola V2** (Fases 1–3 del `AGRICULTURE_AI_V2_EXECUTION_PLAN.md`): concretar split_v1 (21.160/16/3), correr EfficientNet-B0 / MobileNetV3-Large / ResNet50 / ConvNeXt-Tiny con macro-F1 + ECE, y decidir el baseline master+edge.

**Justificación científica:**
1. **Es el único punto con GO explícito ya otorgado** (benchmark de laboratorio) — todo diseño previo está listo; el esfuerzo se invierte en el primer eslabón que genera evidencia medible.
2. **Desbloquea en cascada:** produce el primer modelo multiclase real → habilita MLOps registry/tracking con datos reales → permite el reemplazo del binario colapsado (crítico ROJO) → genera el patrón reproducible para telemetría/UBTN → establece el `real_world_holdout` para campo.
3. **Maximiza retorno con mínimo riesgo:** usa dataset existente (bootstrap sancionado), sin hardware nuevo, sin datos de campo imposibles de obtener hoy; el costo (GPU ≤ RTX 4070, 1–10 h por arquitectura) es minúsculo vs. el valor científico.
4. **Cumple la filosofía "reglas primero":** el benchmark sobre datos conocidos crea el baseline honesto (macro-F1 vs. umbrales) que UBTN (U6, RI-12) necesita copiar.

Alternativa si el foco fuese UBTN: **iniciar P0 (rangos fisiológicos por especie + calibración por sitio)**, pero no hay hardware físico ni datos animales — por eso la vía agrícola es la elegible inequívocamente en meses.

---

## 11. Resultado final

### ¿Qué tan lejos está SIGCTiArural de una IA realmente útil para agricultura, investigación y UBTN?
- **Agricultura:** razón **1 trimestre de investigación** (1–3 meses) para pasar de binario-colapsado a **baseline multiclase de laboratorio verificado** (macro-F1/ECE); **1–2 años** para utilidad de campo real (validación in situ + dataset propio).
- **Investigación (Knowledge AI/RAG):** puerta ya diseñada; útil a **mediano plazo (1–3 años)** sobre el KH de 51 docs, subordinada al motor predictivo.
- **UBTN:** **más lejos** — necesita reglas primero (P0-P1, U1–U5), hardware físico (0 hoy), dataset biológico etiquetado y, recién post-U7, TinyML en BBB-02. Horizonte realista **2–4 años** para detección de anomalías operacional.
- **Global:** la IA existe como **gobernanza y diseño**; falta casi toda la **evidencia empírica**.

### ¿Qué falta para pasar de Demo → Investigación → Sistema inteligente real?

| Transición | Qué falta |
|---|---|
| **Demo → Investigación** | (1) Materializar dataset + split_v1; (2) Ejecutar benchmark V2 (macro-F1, ECE, ROC/PR); (3) Decidir baseline master+edge; (4) Retirar texto/UI no soportado (corrección total); (5) MLOps tracking minimalista sobre corridas reales. *Ganancia: primera evidencia publicable.* |
| **Investigación → Sistema real** | (1) Dataset agrícola propio + `real_world_holdout`; (2) Validación de campo con expertos; (3) MLOps operativo (registry, monitoring, drift); (4) Modelo calibrado multiclase en producción con contrato semántico v2; (5) Edge export validado (BBB-02/TFLite); (6) Identity/FacilityId cerradas; (7) Para UBTN: reglas fisiológicas validadas → dataset collar → baseline anomalía (U6) → TinyML (post-U7). |

**Esencia de la brecha:** no falta inteligencia de diseño ni gobernanza — **faltan datos físicos, entrenamiento reproducible y validación empírica**. La pila IA de SIGCTiArural es un andamiaje de nivel investigador esperando su primera muestra de evidencia.

---

*Documento de auditoría del estado del arte IA/ML. MISIÓN IA-01. Sin implementación, sin modificación de código ni de documentación canónica, sin commits.*