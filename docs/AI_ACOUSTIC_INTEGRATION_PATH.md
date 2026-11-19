# AI ACÚSTICA — CAMINO DE INTEGRACIÓN COMO CAPACIDAD DEL ECOSISTEMA

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-18T22:10:46-05:00
> - Origen: docs/AI_ACOUSTIC_INTEGRATION_PATH.md
> - Destino: docs/AI_ACOUSTIC_INTEGRATION_PATH.md (KEEP; sin movimiento)
> - Nota: permanece en `docs/` como **KEEP vigente**, pendiente de una futura consolidación del bounded context acústico (`docs/bounded-contexts/acoustic-dataset/`, aún no materializado).

**Misión:** `AI_ACOUSTIC_INTEGRATION_PATH`
**Naturaleza:** análisis de **integración** y **ruta de trabajo** (SOLO LECTURA + diseño). **No** captura, **no** descarga, **no** entrena, **no** crea datasets, **no** rediseña taxonomías, **no** investiga fuentes nuevas.
**Fecha:** 2026-11-17 (America/Bogota)
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `5308d79`
**Base:** `docs/AI_ACOUSTIC_STATE_AUDIT.md` (dictamen `PARCIALMENTE OPERATIVO`), `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md`, `docs/AI_ACOUSTIC_S81_INTEGRATION.md`, `docs/ESC50_TO_S81_MAPPING_V1.md`, `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md`.
**Regla de honestidad:** cada afirmación va anclada a un fichero, ruta, conteo o commit. Lo no evidenciado se declara como tal.

**Restricciones respetadas:** sin modificar código · sin entrenar · sin descargar · sin crear datasets · sin alterar Docker · sin rebuild · sin commit · sin push · sin mover archivos. El **único** artefacto creado es este documento.

---

## 0. CORRECCIÓN DE RUMBO — la acústica es una CAPACIDAD, no el producto

**SIGCT-Rural NO es un proyecto de captura acústica.** Es un ecosistema tecnológico rural. La línea acústica es **una capacidad** entre otras. Por tanto este documento **no** propone capturar, no propone datasets, no propone taxonomías: propone **cómo enchufar lo que ya existe** al resto del ecosistema.

### 0.1 Mapa de capacidades del ecosistema (todas del mismo rango)

| Capacidad | Productor(es) reales hoy | Consumidor natural | Estado honesto |
|---|---|---|---|
| Agricultura (fitosanidad) | `S60` imagen → `/infer` → `S61` | `AIPredictiva`, `ModelPredictCell` | REAL (modelo `plant_disease_mbv2.h5` **ROTO**; M1/M2 REF) |
| IoT / Telemetría | `S10`/`S11` `SensorReading` V3 | `Dashboard`, `DataScienceLab` | REAL |
| Telecom / RF | `S30` (FFT), `S31` (WebSDR) | `TelecomLab` | REAL-LOCAL |
| Robótica | `S50` `RobotTelemetry` | `RoboticsLab` | ROTO (cliente a `localhost:8000`) |
| Electrónica / energía | `S32`/`S33` (Falstad/backend) | `ElectronicsLab` | SIM |
| Conocimiento / LMS | `S79` registry (51 docs) | `/knowledge`, ACP | REAL (visor); Ledger DISEÑO |
| **Acústica ambiental** | **`S30` PCM + Logger + Dataset C0 + C1 ESC-50** | **`/dashboard-cmsc`, KH, ACP** | **PARCIALMENTE OPERATIVO** |

> La pregunta correcta no es *«¿cómo completamos el proyecto acústico?»* sino *«¿cómo hace la acústica lo que ya hacen agricultura y telemetría: exponer una señal, un procesamiento, una salida consumible y un estado honesto?»*.

### 0.2 Definición operativa de «capacidad consumible»

Una línea de trabajo se vuelve **capacidad** cuando cumple **seis requisitos**, todos verificables:

| # | Requisito | Qué significa | ¿Lo cumple la acústica hoy? |
|---|---|---|---|
| R1 | **Productor identificado** | Una señal con origen declarado en `signalCatalog` | ⚠️ `S30` sí; `S81`/`S82` **no registradas** |
| R2 | **Procesamiento** | Un transformador declarado (features → clasificación) | ⚠️ features sí (`acoustic.feat.v2`); clasificador **no** |
| R3 | **Salida consumible** | Un contrato/envelope con `source_mode` + `trace` | ❌ no existe salida acústica |
| R4 | **Estado honesto** | Badge `REAL/REAL-LOCAL/SIM/DISENO/ROTO/HUERFANO/REF` junto al valor | ⚠️ captura sí; consumidores `DISENO` |
| R5 | **Registro en el índice** | Entrada en `signalCatalog` + `docsBySignal` | ❌ falta entrada S81/S82 y keywords |
| R6 | **Puerto de acceso** | Puerto declarado (`P-*`) para consumidores | ⚠️ `P-LAB-02` (S30) existe; `P-IA-01` no cubre acústica |

**Conclusión del marco:** la acústica cumple **R1/R2/R4 parcialmente** (mitad de adquisición) y **falla R3/R5/R6** (mitad de inteligencia). Convertirla en capacidad = **cerrar R3, R5 y R6 sin abrir R1/R2 nuevos**, reutilizando los activos existentes.

---

## 1. Superficie de integración existente (lo que ya está enchufable)

### 1.1 Backend (Django hexagonal) — `src/backend/`

| Elemento | Ruta real | Patrón reutilizable |
|---|---|---|
| Router raíz | `api/urls.py` | `path('v3/ai/inference/', AIInferenceV3View)` |
| Vista de inferencia | `api/views.py` `AIInferenceV3View` (L330) | Envelope `context/contract_version/operation/source_mode/prediction/trace` + `model_sha256` |
| Resolver de contrato | `infrastructure/external/ai_service/semantic_prediction_resolver.py` | V1/V2 (`model_contract_version`) |
| Adaptador ai_service | `api/logic/adapters/ai_service.py` | `get_ai_inference_service()` |
| Ingesta telemetría | `api/views.py` `TelemetryIngestV3View` | `POST` con envelope v1 |

**Servicio IA (`src/ai_models/fastapi_app.py`, puerto 8081):** `/health`, `/infer` (imagen agrícola ONNX/TF), `/assist` (voz), `/events` (SSE), `/analyze-circuit`. **No hay endpoint acústico.**

### 1.2 Puente local acústico (Tramo B) — `tools/cmsc-data-logger/bridge/server.js`

`127.0.0.1:8766` · `GET /health` · `GET /stats` · `POST /ingest` (multipart) · CORS whitelist. Reutiliza **`ingestWav()`** (motor único). **Es una herramienta de desarrollo local, no un endpoint de producto**: hoy el frontend depende de que ese proceso esté corriendo en la máquina del usuario.

### 1.3 Frontend — `src/frontend/src/`

| Elemento | Fichero | Rol de integración |
|---|---|---|
| Rutas | `App.jsx` (15 rutas; `/dashboard-cmsc` L139; `routeMap` L73) | Punto de entrada y navegación por voz |
| Catálogo de señales | `pages/cmsc/signalCatalog.js` (**52 entradas S01..S80**) + `SignalCatalogView.jsx` | Índice declarativo; **falta S81/S82** |
| Zona de orquestación | `pages/cmsc/orchestration/OrchestrationZoneV2.jsx` | Contenedor acústico dentro de `/dashboard-cmsc` |
| Flujo acústico | `orchestration/AcousticFlowStepper.jsx` | 7 etapas S30→Logger→Dataset→Validación→S81→S82→KH |
| Consumidores | `orchestration/AcousticConsumersStrip.jsx` | S81/S82/KH declarados `DISENO` con motivo |
| Logger/Dataset | `orchestration/AcousticLoggerPanel.jsx`, `AcousticDatasetPanel.jsx`, `acousticBridge.js` | Captura + conteos en vivo (`/stats`) |
| Primera evidencia | `orchestration/AcousticFirstResultCard.jsx` | Primer resultado acústico |
| Presentación IA | `pages/cmsc/ModelPredictCell.jsx` | **Consumidor natural** de una clasificación (ya presenta S61 con badge) |
| Instrumento | `SpectralAnalysisInstrument.jsx` + `spectralEngine.js` | S30 `REAL-LOCAL` (FFT radix-2 4096 + Hann) |
| Honestidad | `HonestyBadge.jsx`, `honesty.js`, `HonestyThermometer.jsx` | Canon de 7 estados |
| Evidencia | `EvidencePanel.jsx`, `LatestEvidence.jsx` | Superficie de presentación de evidencia |

### 1.4 Knowledge Hub — `src/frontend/src/`

- `knowledge-hub/registry/knowledgeRegistry.generated.json` — **51 docs · 6 categorías** (project-core 7 · eiarc-architecture 13 · eiarc-foundation 3 · research-v2 18 · knowledge-base 6 · historical 4).
- `services/docsBySignal.js` — puente señal↔documento por lectura (fuente única, F3E-3). **Hoy indexa `S30` con keywords `audio/telecom/microphone/acoustic/signal/fft`; NO tiene `S81` ni `S82`.**

### 1.5 Dataset y artefactos reales (fuera de git, `/data/`)

| Capa | Contenido real | Estado |
|---|---|---|
| C0 `v1/` | 1 fila / 1 WAV (`silencio`) / 1 feature (44 dims) / 1 envelope | `CAPTADO_INICIAL` |
| C1 `reference/esc50/` | **428 clips** (6 clases) + features (428×44) + manifiesto + checksums | `INVENTARIADO` (REF) |
| Taxonomía | 9 clases (`labels.csv`), binding ESC-50→6 clases | congelada |
| Gates | G-DS-1 FAIL · G-DS-2 FAIL · G-DS-3/4/5 PASS · G-DS-6 FAIL | 0/6 cerrados |

---

## 2. PREGUNTA 1 — Cómo convertir la línea acústica en una capacidad consumible

La acústica se vuelve capacidad cuando **cada consumidor del ecosistema puede leerla por el mismo camino que lee agricultura o telemetría**. Se necesitan **cuatro piezas** (todas aditivas, ninguna requiere datos nuevos):

### 2.1 Pieza A — Ficha de capacidad (registro declarativo)

Añadir **`S81`** y **`S82`** a `signalCatalog.js` como entradas nuevas (sin tocar S01..S80), con la ficha ya redactada en `docs/AI_ACOUSTIC_S81_INTEGRATION.md` §1:

| Campo | S81 (Acoustic Intelligence) | S82 (Anomaly Detector) |
|---|---|---|
| `clase_senal` | `IA` | `EXPERIMENTAL` |
| `dominio` | `Acústicas` | `Acústicas` |
| `estado` honesto hoy | `DISENO` | `DISENO` |
| `origen` | `featureExtractor` + `AcousticClassifier` sobre `S30` | modelo no supervisado sobre `acoustic.feat.v2` |
| `puerto` | `P-LAB-02` | `P-LAB-02` |
| `consumidores` | `ModelPredictCell`, KH, ACP | `EvidencePanel`, KH |
| `metodo` | `none` \| `rules-v0` \| `ml-v1` | `none` \| `baseline-v0` |

> **Valor inmediato:** registrar `DISENO` hace la capacidad **visible y navegable** en el Signal Explorer sin prometer un modelo. La degradación automática ya está prevista (`estado` cae a `DISENO` sin modelo).

### 2.2 Pieza B — Contrato de salida (envelope de capacidad)

Definir la salida acústica con el **mismo sobre** que la inferencia agrícola (`AIInferenceV3View`), para que frontend, KH y ACP la traten igual:

```jsonc
{
  "context": "acoustic",
  "contract_version": "v1",
  "operation": "acoustic_classification",
  "source_mode": "live | sim | fallback | no-model",
  "prediction": {
    "label": "viento",              // una de las 9 clases o null
    "class_index": 1,
    "confidence": 0.71,             // calibrada 0..1, null si no hay modelo
    "probabilities": { "...": 0.0 },
    "taxonomy_version": "acoustic_v1_taxonomy",
    "model_version": "none | acoustic-clf-v1",
    "model_sha256": null
  },
  "trace": {
    "signal_id": "S81",
    "producer": "S30",
    "feature_schema": "acoustic.feat.window.v2",   // 44 dims
    "method": "none | rules-v0 | ml-v1",
    "processing_time": 0.004,
    "model_contract_version": null
  }
}
```

Reglas duras heredadas de `AI_ACOUSTIC_S81_INTEGRATION.md` §3: el badge va **siempre** junto al valor; sin modelo → `label:null`, `confidence:null`, badge `DISENO`; `source_mode` **nunca** miente (una heurística se declara `sim`, jamás `live`).

### 2.3 Pieza C — Puertos de lectura (cómo lo consume cada actor)

| Puerto | Consumidor | Qué lee | Estado hoy |
|---|---|---|---|
| `P-LAB-02` | `TelecomLab` / instrumento | PCM de `S30` | ✅ existe |
| **`P-ACU-01`** (nuevo, propuesto) | `ModelPredictCell` | clasificación S81 (envelope §2.2) | ❌ falta |
| **`P-ACU-02`** (nuevo, propuesto) | `EvidencePanel` / KH | evidencia acústica (envelope F3E) | ❌ falta |
| `P-KH-01` | `/knowledge` | documentos vía `docsBySignal` | ✅ existe (falta keyword S81) |
| `P-IA-01` | ACP / voz | inferencias y eventos | ✅ existe (no cubre acústica) |

> No se inventan puertos por inventar: se **declaran** dos puertos nuevos para que la capacidad sea direccionable. Alternativa de menor ceremonia: reutilizar `P-LAB-02` para la salida S81 y `P-IA-01` para el ACP, sin crear puertos. **Decisión de Bernardo.**

### 2.4 Pieza D — Puente al Knowledge Hub (sin duplicar)

1. Añadir keywords `S81`/`S82` en `docsBySignal.js` (`SIGNAL_KEYWORDS`), del mismo modo que hoy existe `S30: ['audio','telecom',...]`.
2. La evidencia acústica se escribe al **Evidence Ledger** (destino primario) y se presenta por **vista derivada** — nunca punteros en ambos lados (regla F3E-3).
3. La promoción a `knowledge-base`/`research-v2` pasa por el **Hangar de Autenticidad**, no por escritura ad-hoc.

### 2.5 Resultado: la matriz de capacidad queda así

| Requisito (§0.2) | Pieza que lo cierra | Estado tras integrar (sin datos nuevos) |
|---|---|---|
| R1 Productor | Pieza A | ✅ `S81`/`S82` registradas |
| R2 Procesamiento | Pieza B + `rules-v0`/modelo | ⚠️ `rules-v0` (SIM) hasta que exista `ml-v1` |
| R3 Salida consumible | Pieza B | ✅ envelope v1 |
| R4 Estado honesto | Piezas A+B | ✅ badge junto al valor |
| R5 Registro | Pieza A + D | ✅ catálogo + `docsBySignal` |
| R6 Puerto | Pieza C | ✅ `P-ACU-01/02` (o reutilización) |

**La acústica pasa de «mitad operativa suelta» a «capacidad declarada, direccionable y honesta» — con cero datos nuevos.**

---

## 3. PREGUNTA 2 — Qué endpoints faltan

Hoy la capacidad acústica **no tiene ningún endpoint de producto**. El único acceso es el **puente local** `127.0.0.1:8766` (herramienta de desarrollo). Faltan, en orden de necesidad:

| # | Endpoint propuesto | Método | Propósito | Espeja | Bloqueo |
|---|---|---|---|---|---|
| E1 | `/api/v3/acoustic/status/` | `GET` | Estado de la capacidad: `dataset_state`, conteos, gates, taxonomía — **backend-owned** | `GET /stats` del bridge | ninguno |
| E2 | `/api/v3/acoustic/taxonomy/` | `GET` | 9 clases + binding ESC-50→v1 (solo lectura) | `labels.csv` | ninguno |
| E3 | `/api/v3/acoustic/classify/` | `POST` | Clasificar una ventana 3,0 s → envelope §2.2 | `AIInferenceV3View` | requiere clasificador (E3a) |
| E4 | `/api/v3/acoustic/evidence/` | `GET` (SSE) | Feed de evidencia para KH/ACP | `/events` de `ai_service` | requiere Ledger |
| E5 | `/api/v3/acoustic/features/` | `POST` | Extraer `acoustic.feat.window.v2` (44 dims) | `features.js` | opcional (puede ser cliente) |

**Sub-decisión E3a — dónde corre la clasificación:**

| Opción | Ventaja | Coste | Honestidad |
|---|---|---|---|
| **Cliente** (`onnxruntime-web` / port JS de `rules-v0`) | Sin backend; offline; privacidad (no sube audio) | Engorda bundle (import dinámico, ≤15 MB) | ✅ |
| **Backend** (`ai_service` 8081) | Un solo motor; paridad con `ingestWav` | Requiere endpoint + despliegue | ✅ |
| **Híbrido** (cliente `ml-v1`, backend fallback) | Mejor de ambos | Más superficie | ✅ |

> **Recomendación:** E3 en **cliente** para la demo (privacidad + cero backend), con E3 backend como evolución. E1/E2 sí conviene backend-owns: son estado y taxonomía, no audio.

**Lo que NO falta (ya existe y se reutiliza):**
- `GET /stats` y `POST /ingest` del bridge → base de E1.
- `ingestWav()` → motor único de features/QC (E5).
- `AIInferenceV3View` → plantilla exacta del sobre (E3).
- `/events` (SSE) de `ai_service` → plantilla de E4.

---

## 4. PREGUNTA 3 — Qué pantallas faltan

La Zona de Orquestación acústica **ya está integrada** en `/dashboard-cmsc` para captura/dataset. Falta la **mitad de presentación de inteligencia**:

| # | Pantalla / componente | Fichero propuesto | Estado hoy | Qué falta |
|---|---|---|---|---|
| U1 | Entradas `S81`/`S82` en el catálogo | `pages/cmsc/signalCatalog.js` | ❌ ausentes | 2 entradas (ficha §2.1) |
| U2 | Vista del catálogo con S81/S82 | `SignalCatalogView.jsx` | ✅ existe (sin S81) | Se puebla sola al registrar |
| U3 | Panel de clasificación acústica | `pages/cmsc/acoustic/AcousticClassificationPanel.jsx` (nuevo) o extender `ModelPredictCell.jsx` | ❌ no existe | label + `confidence` + `método` + badge + probabilidades |
| U4 | Primera evidencia acústica real | `orchestration/AcousticFirstResultCard.jsx` | ⚠️ existe como tarjeta | Conectar a E3/E4 |
| U5 | Franja de consumidores con estados reales | `orchestration/AcousticConsumersStrip.jsx` | ⚠️ hoy fijo `DISENO` | Leer estado de E1 |
| U6 | Vista de evidencia acústica en KH | `EvidencePanel.jsx` + `docsBySignal` | ⚠️ genérico | Keywords S81/S82 + Ledger |
| U7 | S82 anomalías (cold-start) | `pages/cmsc/acoustic/AnomalyPanel.jsx` (nuevo) | ❌ no existe | Baseline + thresholds (bloqueado) |
| U8 | Navegación por voz a la capacidad | `App.jsx` `routeMap` | ⚠️ sin clave acústica | `'acoustic': '/dashboard-cmsc'` (1 línea) |

**Regla de UI (heredada):** no se crea una ruta nueva ni se toca el layout global. Todo entra **dentro** de `/dashboard-cmsc` por adición (`OrchestrationZoneV2`), y el catálogo/KH se pueblan al registrar la ficha. **Cero rutas nuevas.**

**Reutilización probada:** `ModelPredictCell.jsx` ya presenta una inferencia (S61) con `label`/`confidence`/badge — es el molde exacto para U3. No hay que inventar patrón.

---

## 5. PREGUNTA 4 — Qué artefactos ML faltan

**Hecho duro:** no existe **ningún** artefacto de modelo acústico en el repo (ni `.h5/.pt/.pth/.onnx/.pkl/.joblib`). `rules-v0` es una heurística determinista, no un modelo aprendido, y el notebook de dataset ya demostró que **no generaliza a C1** (la mayoría de clips ESC-50 caen en `RUIDO DESCONOCIDO`).

Artefactos que faltan para que un modelo acústico **exista** (regla vigente: *sin `validation_metrics.json` + `model_card.md`, un modelo no existe*):

| # | Artefacto | Formato | Origen | Bloqueo |
|---|---|---|---|---|
| M1 | Modelo entrenado `acoustic-clf-v1` | `ml-v1-tabular` → ONNX (≤15 MB) | `HistGB`/`LogReg` sobre `window.v2` (44 dims) | **corpus C0** (1/1350) |
| M2 | Métricas de validación | `validation_metrics.json` (macro-F1, ECE, balanced-acc, matriz) | split C0 (`group` por `session_id`+`place_id`) | **corpus C0** |
| M3 | Ficha de modelo | `model_card.md` (datos, método, límites, licencias) | gobernanza | **corpus C0** |
| M4 | Normalización versionada | `feature_norm.json` (`mean`/`std` por feature de `window.v2`) | cómputo sobre train C0 | **corpus C0** |
| M5 | Huella y contrato | `model_sha256` + `model_contract_version` | export ONNX | **corpus C0** |
| M6 | Clasificador (código) | `AcousticClassifier` (cliente y/o backend) | diseño `AI_ACOUSTIC_ARCHITECTURE_V1.md` | ninguno (es código, no dato) |
| M7 | Extractor de features (paridad) | `featureExtractor.js` ↔ `features.js` | `acoustic.feat.window.v2` | ninguno |
| M8 | Ficha de dataset C1 | `REFERENCE_DATASET_CARD.md` | gobernanza C1 | ninguno |
| M9 | Baseline de anomalías | `baseline_v0.json` + thresholds | estadística sobre C0 | **corpus C0** |

**Lo único desbloqueado sin datos nuevos:** M6, M7 y M8 (son código/ficha, no requieren corpus). **Todo lo demás (M1–M5, M9) está bloqueado por corpus C0**, que exige captura de campo — **explícitamente fuera del alcance de esta misión**.

> **Lo que SÍ existe y se reutiliza como bootstrap REF (no como dataset de S81):** C1 `reference/esc50/` (**428 clips, 6/9 clases**). Por gobernanza, **ningún clip externo entra en `train/validation/test` de S81**; C1 sirve como pre-entrenamiento/`REF` y su evaluación **jamás** se presenta como desempeño de S81.

---

## 6. PREGUNTA 5 — Camino mínimo a una demostración funcional

Dado el mandato (**sin capturas, sin datasets, sin fuentes nuevas, sin entrenamiento**), la demo honesta se escalona en **tres niveles**. El nivel que **sí** es alcanzable hoy es D0+D1.

### 6.1 Nivel D0 — Capacidad de adquisición (YA EXISTE, verificada)

```
S30 (micrófono) → Logger → Bridge → ingestWav → metadata/features → split → gates
                                    ↓
                     visible en /dashboard-cmsc (Zona de Orquestación V2)
```

- **Estado:** `GO_TRAMO_B_FINAL` · `GO_TRAMO_C_FINAL` · `GO_TRAMO_BC_PRODUCTION`; `cli status` = `CAPTADO_INICIAL`, 1/1/1.
- **Qué demuestra:** la capacidad **captura, ingiere, featureiza y audita** con datos reales.
- **Qué NO demuestra:** clasificación (no hay modelo).

### 6.2 Nivel D1 — Capacidad de clasificación declarada (MÍNIMO alcanzable, sin datos nuevos)

Es el **camino mínimo a una demostración funcional** dentro de las prohibiciones. Pasos, todos aditivos y con activos existentes:

| Paso | Acción | Activo existente | Artefacto nuevo |
|---|---|---|---|
| 1 | Registrar `S81`/`S82` en `signalCatalog.js` | `AI_ACOUSTIC_S81_INTEGRATION.md` §1 | 2 entradas |
| 2 | Añadir keywords `S81`/`S82` a `docsBySignal.js` | patrón `S30` ya presente | ~4 líneas |
| 3 | Exponer `rules-v0` como clasificador `method:'rules-v0'`, `source_mode:'sim'` | `tools/cmsc-data-logger/src/rules-v0.js` (+ port Python en el notebook) | `AcousticClassifier` (M6) |
| 4 | Presentar en U3/U4 con badge `SIM` y nota *«heurística, no generaliza (ver notebook)»* | `ModelPredictCell.jsx` | panel U3 |
| 5 | Conectar la franja de consumidores a `GET /stats` (E1) | `acousticBridge.js` | U5 |
| 6 | (Opcional) 1 clave en `routeMap`: `'acoustic': '/dashboard-cmsc'` | `App.jsx` L73 | 1 línea |

**Resultado de D1:** una demo **E2E y honesta** donde el usuario **habla al micrófono, ve la captura, ve una clasificación etiquetada `SIM` con su método y su límite declarado, y encuentra la documentación enlazada en el KH**. Es exactamente el patrón de `S64` («análisis por reglas, sin ML») que el ecosistema ya usa.

> **Lo que D1 NO es:** no es S81. No promueve ningún estado a `REAL-LOCAL`. `rules-v0` se declara `SIM` con su limitación a la vista. La honestidad se preserva porque el badge y el método viajan junto al valor.

### 6.3 Nivel D2 — Capacidad real (BLOQUEADO por diseño, fuera de esta misión)

Requiere corpus C0 (captura de campo) → M1–M5. **Prohibido por el mandato actual.** No se planifica aquí; se registra como dependencia.

### 6.4 Ruta crítica resumida

```
D0 (existe)  →  D1 (mínimo: registrar + clasificar SIM + presentar + enlazar)  →  D2 (bloqueado: corpus C0)
     │                        │                                                        │
  adquisición            capacidad consumible                                    modelo real
  OPERATIVA              (sin datos nuevos)                                       (fuera de alcance)
```

**El camino mínimo es D1**: convierte la acústica en capacidad **sin abrir un solo frente nuevo**.

---

## 7. Arquitectura de integración propuesta (una vista)

```
                 ┌─────────────────────── SIGCT-Rural (ecosistema) ───────────────────────┐
                 │                                                                        │
  S30 PCM ──────►│  CAPACIDAD ACÚSTICA                                                    │
  (REAL-LOCAL)   │   Pieza A: ficha S81/S82 en signalCatalog ──► SignalCatalogView        │
                 │   Pieza B: envelope v1 (context/contract/source_mode/prediction/trace) │
                 │   Pieza C: P-ACU-01 (ModelPredictCell) · P-ACU-02 (EvidencePanel)      │
                 │   Pieza D: docsBySignal ──► Knowledge Hub (vista derivada)            │
                 │                    │                                                   │
                 │                    ▼                                                   │
                 │   ModelPredictCell ◄── E3 /classify (cliente o backend)               │
                 │   EvidencePanel   ◄── E4 /evidence (SSE)                               │
                 │   ACP             ◄── dieta: solo verificado (NO_DATA si no hay)       │
                 └────────────────────────────────────────────────────────────────────────┘
```

**Principios (no romper):** solo lectura de `S30`; aditivo puro; desacople por cadencia (2–5 Hz, no `rAF`); hook opcional `onFrame`; honestidad con `HonestyBadge`/`source_mode`; KH sin duplicar; cero rutas nuevas.

---

## 8. Qué NO hacer (para no degradar la honestidad)

1. **No** presentar `rules-v0` como IA real: el propio notebook demuestra que no generaliza. Como mucho `S81 = SIM`.
2. **No** entrenar ni evaluar S81 sobre ESC-50/C1 (prohibido por gobernanza; 6/9 clases y dominio distinto).
3. **No** promocionar `S81` a `REAL-LOCAL` sin `validation_metrics.json` + `model_card.md` (regla M).
4. **No** abrir FSD50K/Xeno-canto/SONYC/Speech Commands/BirdCLEF/AudioSet (prohibido: sin fuentes nuevas).
5. **No** crear rutas, dashboards ni laboratorios nuevos: la capacidad vive **dentro** de `/dashboard-cmsc`.
6. **No** tocar `v1/`, `reference/esc50/`, S30, benchmark, IA existente ni el canon de estados.
7. **No** escribir punteros en ambos lados señal↔KH (F3E-3): vista derivada, fuente única.

---

## 9. Riesgos de integración

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| IA-1 | Presentar heurística como IA real | 🔴 | `method`+`source_mode`+badge `SIM`; fixtures de rechazo |
| IA-2 | Endpoint acústico depende del bridge local | 🟠 | E1/E2 backend-owned; el bridge queda como herramienta de dev |
| IA-3 | Confundir C1 (REF) con dataset de S81 | 🔴 | C1 nunca en splits C0; evaluar solo C0 |
| IA-4 | Duplicar evidencia señal↔KH | 🟠 | `docsBySignal` fuente única |
| IA-5 | Engordar el bundle con runtime ML | 🟠 | `import()` dinámico; ≤15 MB; WebWorker |
| IA-6 | Estado S81 «promocionado» sin artefactos | 🔴 | gate G-M-2 + artefactos M2/M3 |
| IA-7 | Privacidad de voz | 🔴 | inferencia local; sin retención; sin subida |
| IA-8 | Declarar puertos nuevos sin necesidad | 🟡 | alternativa: reutilizar `P-LAB-02`/`P-IA-01` (decisión Bernardo) |

---

## 10. No-acciones e invariantes respetadas

- **Sin** modificar código · **sin** entrenar · **sin** descargar · **sin** crear datasets · **sin** alterar Docker · **sin** rebuild · **sin** commit · **sin** push · **sin** mover archivos.
- **Sin** capturas de campo · **sin** datasets nuevos · **sin** rediseño de taxonomía · **sin** expansión de ESC-50 · **sin** investigación de fuentes nuevas.
- **Sin** tocar `v1/` (schema/labels/metadata/features), `reference/esc50/`, S30, frontend, backend, benchmark, Knowledge Hub ni IA existente.
- El **único** artefacto creado es este documento: `docs/AI_ACOUSTIC_INTEGRATION_PATH.md`.
- Estado git: rama `feature/cmsc-f3c-v1-implementation`, HEAD `5308d79`, sin cambios de índice por esta misión.

---

## 11. Respuestas en una frase (resumen ejecutivo)

| Pregunta | Respuesta |
|---|---|
| **1. Capacidad consumible** | Cerrar R3/R5/R6 (salida + registro + puerto) con 4 piezas aditivas: ficha `S81`/`S82`, envelope v1, puertos `P-ACU-01/02`, keywords en `docsBySignal`. Sin datos nuevos. |
| **2. Endpoints que faltan** | `GET /api/v3/acoustic/status/`, `GET /api/v3/acoustic/taxonomy/`, `POST /api/v3/acoustic/classify/`, `GET /api/v3/acoustic/evidence/` (SSE), opcional `POST /api/v3/acoustic/features/`. Hoy solo existe el puente local `8766`. |
| **3. Pantallas que faltan** | Entradas S81/S82 en `signalCatalog`, panel de clasificación (U3, molde `ModelPredictCell`), evidencia acústica en KH (U6), franja de consumidores real (U5), panel S82 (U7), clave de voz en `routeMap` (U8). **Cero rutas nuevas.** |
| **4. Artefactos ML que faltan** | Modelo `acoustic-clf-v1` (ONNX) + `validation_metrics.json` + `model_card.md` + `feature_norm.json` + `model_sha256` + `AcousticClassifier`/`featureExtractor` + ficha C1 + baseline anomalías. **Todos bloqueados por corpus C0 salvo el código y las fichas.** |
| **5. Camino mínimo a demo** | **D0 (existe) + D1 (registrar S81/S82 + clasificar con `rules-v0` etiquetado `SIM` + presentar con badge + enlazar en KH)**. D2 (modelo real) queda bloqueado por captura de campo, fuera del mandato. |

> **Cierre:** la acústica no necesita volver a empezar; necesita **dejar de ser un frente y pasar a ser una capacidad**. Todo lo necesario para eso ya está en el repositorio. Lo único que falta —un modelo real— depende de audio propio, y por eso queda explícitamente **fuera** de este camino: integrar hoy no exige capturar mañana.
