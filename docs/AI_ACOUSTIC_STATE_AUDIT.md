# AI ACOUSTIC — AUDITORÍA DE ESTADO REAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-18T22:10:46-05:00
> - Origen: docs/AI_ACOUSTIC_STATE_AUDIT.md
> - Destino: docs/AI_ACOUSTIC_STATE_AUDIT.md (KEEP; sin movimiento)
> - Nota: permanece en `docs/` como **KEEP vigente**, pendiente de una futura consolidación del bounded context acústico (`docs/bounded-contexts/acoustic-dataset/`, aún no materializado).

**Misión:** `AI_ACOUSTIC_STATE_AUDIT`
**Naturaleza:** auditoría de **SOLO LECTURA** sobre lo que ya existe en el repositorio y en disco. **No** busca datasets, **no** investiga repositorios, **no** descarga nada.
**Fecha:** 2026-11-17 (America/Bogota)
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `5308d79`
**Método:** inventario de `data/datasets/sigct_rural_acoustic/`, `docs/AI_ACOUSTIC_*`, `docs/ESC50_TO_S81_MAPPING_V1.md`, `benchmark/`, `notebooks/`, `src/`, `tools/cmsc-data-logger/` + ejecución de comandos **read-only** (`node tools/cmsc-data-logger/src/cli.js status`, `git ls-files`, `git log`).
**Regla de honestidad:** toda afirmación va anclada a un fichero, un conteo real o un commit. Lo no evidenciado se declara como tal.

**Restricciones respetadas:** sin modificar código · sin entrenar · sin descargar · sin crear datasets · sin alterar Docker · sin rebuild · sin commit · sin push · sin mover archivos. El **único** artefacto creado es este documento.

---

## 0. DICTAMEN — CLASIFICACIÓN FINAL

# `PARCIALMENTE OPERATIVO`

**Justificación en una frase:** la **mitad de adquisición** de la línea acústica (`S30 → Logger → Bridge → Dataset → Features → Split → Gates`) está **implementada, integrada en `/dashboard-cmsc`, probada E2E y commiteada**, con datos y artefactos reales; la **mitad de inteligencia** (`Modelo → S81 → S82 → Knowledge Hub`) **no está implementada** y está **bloqueada por falta de corpus propio (captura de campo)** y por un gate de gobernanza abierto (`G-DS-1`).

### Veredicto por capa (para que el veredicto global no oculte matices)

| Capa | Estado real | Evidencia |
|---|---|---|
| Adquisición (`S30` PCM + Logger + Bridge) | **OPERATIVO** | `docs/AUDIT_TRAMO_BC.md` (`GO_TRAMO_BC_PRODUCTION`), `docs/INFORME_TRAMO_C_FINAL.md` (`GO_TRAMO_C_FINAL`), `docs/INFORME_BRIDGE_E2E_UI.md` (`GO_TRAMO_B_FINAL`) |
| Dataset C0 (propio) | **OPERATIVO pero vacío** | `cli status`: `CAPTADO_INICIAL`, **1 fila / 1 WAV / 1 feature** |
| Features (C0 y C1) | **OPERATIVO** | `acoustic_features_v2.csv` (1 vector) · `acoustic_features_ref_window_v2.csv` (**428** vectores × 44 dims) |
| Split / Gates | **OPERATIVO** | `split_lists/split_report.json` (`state: EXECUTED`, 2026-11-10) |
| Capa REF (C1, ESC-50) | **OPERATIVO (inventariado)** | `reference/esc50/` **428** clips aceptados, `reference_status: INVENTARIADO` |
| Modelo acústico | **NO EXISTE** | ningún `.h5/.pt/.onnx/.pkl` acústico en el repo; `rules-v0` es heurística, no modelo aprendido |
| S81 / S82 | **DOCUMENTADO, no implementado, BLOQUEADO** | `AcousticFlowStepper.jsx` los declara `DISENO`; no hay `AcousticClassifier` en `src/` |
| Backend/API acústico | **NO EXISTE** | `src/ai_models/fastapi_app.py` solo expone `/health`, `/infer`, `/assist`, `/events`, `/analyze-circuit` (agrícola/voz) |
| Frontend (presentación de clasificación) | **NO EXISTE** | la zona integrada cubre captura/dataset; la franja de consumidores muestra `bloqueada: …` |
| Knowledge Hub acústico | **DOCUMENTADO, no implementado** | sin evidencia acústica promovida; Ledger en diseño |

> Si el criterio fuera estrictamente «existe una demo E2E con un modelo acústico entrenado», el veredicto de la **línea completa** sería `BLOQUEADO`. Se elige `PARCIALMENTE OPERATIVO` porque una parte sustancial y verificable **sí funciona de punta a punta hoy** (captura real → ingesta → dataset → features → split → gates), y ese tramo es precisamente lo que desbloquea lo demás.

---

## 1. Qué datasets acústicos existen realmente

Existen **dos** capas físicas bajo `data/datasets/sigct_rural_acoustic/` (fuera de git, política `/data/`, `.gitignore:68`):

### 1.1 C0 — corpus propio `v1/` (S81)

| Elemento | Valor real |
|---|---|
| Estado | `CAPTADO_INICIAL` (`cli status`) |
| Filas `metadata/metadata.csv` | **1** (+ cabecera de 42 columnas) |
| WAV en `raw/` | **1** (`raw/silencio/ac_20261006_215109_000_*.wav`, `silencio`, `accepted`) |
| Vectores de features | **1** × 44 dims (`features/acoustic_features_v2.csv`) |
| Envelopes AC-9 | 1 (`features/acoustic_envelopes_v1.json`) |
| `split_lists` | `train.csv`=1 · `validation.csv`=0 · `test.csv`=0 · `holdout`=0 |
| `holdout/real_world_holdout_v1/` | reservado, **vacío por diseño** (`holdout_samples.csv` solo cabecera) |
| Taxonomía | 9 clases (`metadata/labels.csv`) |
| `schema_version` | **1.3.0** (42 columnas) |

### 1.2 C1 — capa de referencia `reference/` (solo ESC-50)

| Elemento | Valor real |
|---|---|
| Fuentes materializadas | **1 de 8**: `reference/esc50/` |
| Clips aceptados (`raw/<clase>/`) | **428** (viento 38 · lluvia 40 · agua 115 · insectos 79 · ave 119 · motor 37) |
| Clips rechazados | **12** (AC-REF 1..8) |
| Features REF | **428** × 44 dims (`features/acoustic_features_ref_window_v2.csv`) |
| Contrato | `manifest_ref.esc50.yaml` (5.617 líneas) · `metadata/ref_esc50.csv` (23 col) · `metadata/mapping_esc50_to_v1.csv` (11 filas) · `metadata/esc50_author_meta.csv` |
| `reference_status` | `INVENTARIADO` (**no** `CONSUMIBLE`; pendiente gates `G-REF-*`) |
| Licencias | `CC BY-NC 3.0` (global) + `CC-BY` (subconjunto ESC-10); `license_nc` marcado |
| Material bruto en `ingest/staging/` | `ESC-50.zip` (**645.695.005 B ≈ 616 MB**) + `ESC-50-master/` extraído (2.000 wav) + `_draft_archive_2026_10_08/` (500 wav) |

**NO existen** (declarados solo en documentación): FSD50K, Xeno-canto, SONYC-UST, Speech Commands, BirdCLEF (diferido por decisión), AudioSet (solo ontología, sin audio). El resto del repo (`data/datasets/agriculture_images_tomato-potato-corn/`) es **agrícola**, no acústico.

---

## 2. Qué taxonomía existe realmente

**Taxonomía vigente `acoustic_v1_taxonomy` — 9 clases** (`v1/metadata/labels.csv`, `class_index` 0..8):

| idx | `class_id` | `dir_name` | OOD | `audi_set_mid` |
|---:|---|---|:--:|---|
| 0 | silencio | silencio | — | *(vacío)* |
| 1 | viento | viento | — | /m/03m9d0z |
| 2 | lluvia | lluvia | — | /m/06mb1jj |
| 3 | agua | agua | — | /m/0838f |
| 4 | insectos | insectos | — | /m/03vt0 |
| 5 | ave | ave | — | *(UNVERIFIED)* |
| 6 | voz | voz | — | *(UNVERIFIED)* |
| 7 | motor | motor | — | *(UNVERIFIED)* |
| 8 | **ruido_desconocido** | **desconocido** | ✅ | *(UNVERIFIED)* |

**Binding ESC-50 → S81** (`docs/ESC50_TO_S81_MAPPING_V1.md` + `reference/esc50/metadata/mapping_esc50_to_v1.csv`): política `canonical_h2_section_6`, **11 clases ESC-50 → 6 clases v1**:

`wind→viento` · `rain→lluvia` · `water_drops/sea_waves/pouring_water→agua` · `crickets/insects→insectos` · `chirping_birds/rooster/crow→ave` · `engine→motor`.

- **Cobertura real: 6/9 clases.** Faltan por diseño: `voz` (ESC-50 no tiene habla), `silencio` (REAL-LOCAL exclusivo) y `ruido_desconocido` (bucket OOD).
- **39/50 clases ESC-50 descartadas** por no mapear a la taxonomía v1 (documentado en el mapeo §4).
- La taxonomía **v1 está congelada**: cualquier clase nueva (`abejas`, `paisaje rural`) exigiría `acoustic_v2_taxonomy` + `dataset_version v2` (no ejecutado).

---

## 3. Qué pipeline acústico fue implementado

### 3.1 Pipeline canónico (implementado y validado)

```
S30 (SpectralAnalysisInstrument, PCM continuo Float32)
  → pcmTapRef  →  AcousticLoggerPanel (cola de tomas 3,0 s)
  → POST /ingest (multipart WAV+JSON)
  → bridge 127.0.0.1:8766 (server.js)
  → ingestWav() (motor ÚNICO, compartido CLI+UI)
  → raw/<clase>/WAV  +  metadata/metadata.csv  +  features/acoustic_features_v2.csv
  → split (group por session_id+place_id, holdout site_c)
  → validate (gates G-DS-1..6, checks AC-1..AC-10, SG-1..5)
```

**Módulos reales del motor** (`tools/cmsc-data-logger/src/`): `cli.js` (43.967 B), `ingest.js`, `features.js` (22 features/frame), `fft.js` (radix-2 4096 + Hann), `resample.js` (48k→44.1k declarado), `gates.js` (G-DS-1..6), `dataset.js`, `rules-v0.js` (baseline heurístico), `constants.js`, `synth.js`, `stats.js`, `bridge/server.js`, `capture/index.html`, `capture/captureContract.js`. Suite de pruebas: `test/{pipeline,schema-v2,bugfixes,parity,rules-v0}.test.mjs`.

### 3.2 Pipeline REF (implementado para ESC-50)

`reference/esc50/ingest/esc50_pilot_pipeline.mjs` (22.994 B): reutiliza los módulos congelados del logger (`features.js`, `window.js`, `wav.js`, `resample.js`, `constants.js`) para normalizar y featureizar ESC-50 en la capa C1. **Nunca escribe en C0.**

### 3.3 Frontend (implementado e integrado)

`src/frontend/src/pages/cmsc/`:
- `SpectralAnalysisInstrument.jsx` + `spectralEngine.js` (S30, `REAL-LOCAL`) + `public/worklets/pcm-capture-processor.js` (Tramo C, AudioWorklet con fallback ScriptProcessor).
- `orchestration/acousticBridge.js` (cliente `BRIDGE_URL`, `postIngest`, `getStats`, `encodeWavPcm16`).
- `orchestration/AcousticLoggerPanel.jsx` · `AcousticDatasetPanel.jsx` (poll `/stats` 3 s) · `AcousticFlowStepper.jsx` · `AcousticConsumersStrip.jsx` · `AcousticFirstResultCard.jsx` · `OrchestrationZoneV2.jsx` (integra todo en `/dashboard-cmsc`).

---

## 4. Qué artefactos fueron generados

### 4.1 C0 (`v1/`) — generados por el logger

`metadata/metadata.csv` (1 fila, 42 col) · `metadata/labels.csv` (9) · `metadata/schema.json` (1.3.0) · `metadata/manifest.csv` · `metadata/places.csv` · `features/acoustic_features_v2.csv` (1×44) · `features/acoustic_envelopes_v1.json` · `split_lists/{train,validation,test}.csv` + `split_report.json` · 5 manifiestos YAML (`manifests/`) · `holdout/real_world_holdout_v1/{README.md,holdout_samples.csv}` · `CHECKSUMS.sha256` (1 WAV) · `dataset_card.md` · `README.md`.

### 4.2 C1 (`reference/esc50/`) — generados por el piloto H3

428 WAV normalizados (mono 44,1 kHz PCM16, ventana central 3,0 s) · `manifest_ref.esc50.yaml` (428 clips) · `metadata/ref_esc50.csv` (23 col) · `metadata/mapping_esc50_to_v1.csv` (11) · `metadata/esc50_author_meta.csv` · `features/acoustic_features_ref_window_v2.csv` (428×44) · `ingest/pilot_list.csv` (440) · `ingest/reject-list.csv` (12) · `ingest/download.log` · `checksums.sha256` (40.766 B) · `PILOT_REPORT.md` (`GO_ESC50_INVENTARIADO`) · `README.md` · `source_card.md`.

### 4.3 Notebooks

| Notebook | Celdas | Ejecutado | Evidencia |
|---|---|---|---|
| `notebooks/CMSC_AI_ACOUSTIC_DATASET_NOTEBOOK_V1.ipynb` | 35 (22 código) | **SÍ** — 22/22 `execution_count`, 31 outputs | Ejecutado 2026-10-09T01:36:32Z; EDA C0/C1, ETL en memoria, PCA (SVD), **evaluación `rules-v0` sobre C1**, roadmap ML |
| `notebooks/CMSC_AI_ACOUSTIC_V1.ipynb` | 23 (10 código) | **NO** — 0 outputs | Plantilla de diseño (no ejecutada) |

> `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb` y `..._M2_EfficientNetB0.ipynb` son **agrícolas**, no acústicos.

### 4.4 Benchmark / modelos

`benchmark/runs/{M1_mobilenetv2_001, M2_efficientnet_b0}/` contienen artefactos **agrícolas** (16 clases): `best.pth`, `last.pth`, `exports/model.onnx`, `validation_metrics.json`, plots, `model_card`. **Ninguno es acústico.** El único otro peso del repo es `src/ai_models/production_models/plant_disease_mbv2.h5` (**ROTO**, histórico, agrícola).

---

## 5. Qué partes están únicamente documentadas (sin código)

Todo lo que sigue es **diseño/documentación canónica**; **no** tiene implementación en `src/`:

- `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md` — contratos de `featureExtractor` / `AcousticClassifier` / `AnomalyDetector`.
- `docs/AI_ACOUSTIC_S81_INTEGRATION.md` — ficha de registro de **S81**/S82 en `signalCatalog` (propuesta, no aplicada).
- `docs/AI_ACOUSTIC_MODEL_BENCHMARK.md` — candidatos `MA-0..MA-7`; tablas **plantilla vacía**; estados de modelo (`DISENO→SIM→REF→REAL-LOCAL`).
- `docs/AI_ACOUSTIC_ROADMAP_V1.md` — Sprints 1..6 con gates.
- `docs/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` / `_REFERENCE_LAYER_ARCHITECTURE_V1.md` / `_REFERENCE_DATASET_CATALOG.md` / `_REFERENCE_INGESTION_PLAN_V1.md` / `_H3_EXECUTION_READINESS_V1.md` / `_H3_DECISION_PACKAGE_FINAL.md` — estrategia C0/C1/C2, árbol `reference/`, gobernanza REF, plan de ingesta, paquete de decisión D5 (aplicado al `schema.json`).
- `docs/ESC50_TO_S81_MAPPING_V1.md` — mapeo canónico + **§6 ETL a PostgreSQL** (DISEÑO, explícitamente «no se ejecuta»).
- `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` §11 — trazabilidad de contratos (hashes).
- **S81, S82 y el Knowledge Hub acústico**: `DISENO`. No existe `AcousticClassifier`, ni `featureExtractor` en frontend, ni endpoint `/classify-audio`, ni Ledger acústico.

---

## 6. Qué partes ejecutan código real

| Componente | Evidencia de ejecución |
|---|---|
| `cli.js` (motor de ingesta) | `node tools/cmsc-data-logger/src/cli.js status` → salida real (ver §6.1) |
| `ingestWav()` | probado E2E con verdictos reales `accepted` y 44 dims (`docs/EVIDENCIA_FLUJO_BRIDGE.md`, `docs/INFORME_BRIDGE_E2E_UI.md`) |
| `features.js` + `fft.js` + `resample.js` | producen los CSV de 44 dims (C0 y C1) |
| `gates.js` | `cli status` reporta G-DS-1..6 con veredictos reales |
| `bridge/server.js` | `GET /health`, `GET /stats`, `POST /ingest` en `127.0.0.1:8766` (CORS whitelist) |
| `stats.js` | conteos en vivo leídos por `AcousticDatasetPanel` |
| `esc50_pilot_pipeline.mjs` | generó los 428 clips C1 + manifiesto + features + checksums |
| S30 + worklet + paneles | `GO_TRAMO_BC_PRODUCTION` / `GO_TRAMO_C_FINAL` (validación visual en navegador real) |
| Notebook de dataset | 22 celdas ejecutadas con outputs |

### 6.1 Evidencia en vivo (2026-11-17)

```
=== STATUS · CMSC_DATA_LOGGER_V1 ===
  raiz      : ...\data\datasets\sigct_rural_acoustic\v1
  esquema   : v1.3.0 · 42 columnas
  estado    : CAPTADO_INICIAL
  filas     : 1 en metadata.csv
  WAV       : 1 en raw/ · 0 en holdout/
  features  : 1 clips con 44 dims (acoustic.feat.v2)
  envelopes : 1 referencias para AC-9
  accepted 1
  silencio 1 · (resto 0)
Gates: G-DS-1 FAIL · G-DS-2 FAIL · G-DS-3 PASS · G-DS-4 PASS · G-DS-5 PASS · G-DS-6 FAIL
```

> Nota: `G-DS-3/4/5` pasan con **1 muestra** porque son gates de *estructura/split/licencia*, no de *volumen*. `G-DS-1` (mids AudioSet `UNVERIFIED`) y `G-DS-6` (acuerdo de anotación) y `G-DS-2` (≥150/clase) permanecen abiertos.

---

## 7. Qué modelos acústicos existen o existieron

**Ninguno.** No existe ningún artefacto de modelo acústico entrenado (`.h5/.pt/.pth/.onnx/.pkl/.joblib`) en el repo.

- `rules-v0` (`tools/cmsc-data-logger/src/rules-v0.js` + test `rules-v0.test.mjs`; port Python en el notebook §9) es un **baseline heurístico determinista por umbrales**, **no** un modelo aprendido. Su primera evaluación sobre audio real externo (C1) —registrada en el notebook— concluye que **no generaliza**: la mayoría de clips ESC-50 caen en `RUIDO DESCONOCIDO` (bucket OOD).
- El diseño prevé `ml-v1-tabular` (HistGB/LogReg → ONNX, ≤15 MB, offline, ECE ≤0,10) como Model V1 y `ml-v1-cnn-mel` para V2 (`docs/AI_ACOUSTIC_MODEL_BENCHMARK.md`). **Ninguno entrenado.**
- Regla vigente: «sin `validation_metrics.json` + `model_card.md`, un modelo **no existe**». No hay ninguno acústico.

---

## 8. Qué componentes faltan para una demo funcional E2E

`Dataset → Features → Modelo → Backend/API → Frontend/Laboratorio`

| Eslabón | Estado | Qué existe | Qué falta |
|---|---|---|---|
| **Dataset** | ⚠️ Parcial | C0 `CAPTADO_INICIAL` (**1 clip**) + C1 428 REF | **Corpus C0 suficiente** (≥150/clase viva; hoy 1/1350) |
| **Features** | ✅ | `acoustic.feat.v2`/`window.v2` (44 dims) en C0 y C1; paridad JS↔Python | Nada estructural; se regenera por comando |
| **Modelo** | ❌ | Solo `rules-v0` (heurística) | Un modelo aprendido (`ml-v1-tabular`) + `validation_metrics.json` + `model_card.md` |
| **Backend/API** | ❌ | `ai_service` sirve **agrícola** (`/infer` ONNX/TF) y voz (`/assist`) | Endpoint acústico (p. ej. `/classify-audio`) **o** inferencia 100% cliente |
| **Frontend/Laboratorio** | ⚠️ Parcial | S30 real + Logger/Dataset integrados en `/dashboard-cmsc` | Presentación de clasificación S81 (label + `confidence` + `método` + badge honesto) y S82 |

**Conclusión:** la demo E2E está a **tres piezas** de existir: (1) corpus C0 suficiente, (2) un modelo con artefactos, (3) un punto de inferencia + presentación. La pieza (1) es la raíz: sin audio propio no hay (2) ni (3) que merezcan la pena.

---

## 9. Motivo por el cual se pausó el workstream acústico y si sigue vigente

### 9.1 Evidencia del estado de pausa

- La última **captura real** es **1 clip** (E1, `silencio`, 2026-10-06). Todo lo posterior son pruebas sobre **sandbox/copias** (Tramo B/C) o **material externo** (ESC-50 C1).
- `docs/FIELD_CAPTURE_RUN_001_REPORT.md` (2026-10-05): *«Captura real de campo: PENDIENTE · Muestras reales: 0 · PILOT-1..7: PENDIENTE»*.
- `docs/PILOT_CAPTURE_CHECKLIST.md`: *«CHECKLIST · NO EJECUTADO»*.
- La capa REF se detuvo en su límite de diseño: ESC-50 = 6/9 clases y `reference_status: INVENTARIADO` (no `CONSUMIBLE`).
- Los últimos trabajos de la línea son **documentales**: `D5_EXECUTION` (2026-10-07), `H3_DECISION_PACKAGE_FINAL` (2026-10-07) y `ESC50_TO_S81_MAPPING_V1` (**2026-11-15**, commit `3afa041`).
- La atención de la sesión se desplazó a la **línea agrícola** (M2 / ONNX / AI-R3 / AI-R4, commits `b747288`, `449c969`, `5308d79`) y a la **gobernanza documental** (D-003, cierre ASUS, sprint de seguridad).

### 9.2 Causa raíz

1. **Bloqueo por datos (físico).** S81 requiere un corpus **C0 propio**; el único camino que cierra los gates es **capturar audio en campo**, lo que exige presencia física con micrófono en 3 sitios. La infraestructura está lista, pero **el campo no se ha ejecutado**.
2. **Gate de gobernanza abierto.** `G-DS-1` = `FAIL` (7 clases con `audi_set_status = UNVERIFIED` en `labels.csv`); exige una **misión de verificación de mids** antes de promover S81.
3. **Techo de la capa REF.** ESC-50 (y toda fuente pública) **no puede** ser el dataset de S81: no cubre `voz`, `silencio` ni `ruido_desconocido`, y por gobernanza **nunca** entra en `train/validation/test` de C0.
4. **Prioridad organizativa.** El esfuerzo se reasignó a otras misiones sin cerrar el piloto de campo.

### 9.3 ¿Sigue vigente el motivo? — **SÍ, en lo esencial**

- **Vigente:** los puntos 1–3 siguen intactos hoy (verificado: 1 clip C0, `G-DS-1 FAIL`, ESC-50 REF-only).
- **No bloqueante / no técnico:** el punto 4 es organizativo; **nada está roto**. La pausa no fue por un fallo de arquitectura, ni de FFT, ni de IA: **faltó audio**.
- **Matiz:** el bloqueo ya **no es de diseño**. Existe la conclusión oficial: *«no falta arquitectura, no falta FFT, no falta IA. Falta audio… falta capturar, no falta diseñar»* (`AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` §6).

---

## 10. Siguiente paso de MAYOR impacto para reactivar la línea (sin abrir nuevos frentes)

### Recomendación: **ejecutar la captura del piloto C0 en campo**, usando la infraestructura ya construida y validada

**Acción:** `CMSC_ORCHESTRATION_V2_FIELD_CAPTURE_RUN_001` — capturar el **piloto de ~80–100 clips** (10 por clase viva, 8 clases, ≥3 `place_id`), con el flujo ya operativo `S30 → Logger → Bridge → Dataset → Features → Split → Gates`, y **cerrar `G-DS-1`** en la misma misión (verificar los 7 mids AudioSet `UNVERIFIED`).

**Por qué es el de mayor impacto:**
- Es el **único** desbloqueo real: todos los eslabones ausentes (modelo, S81, S82, KH) son **downstream** de tener corpus C0. Sin audio, cualquier otro avance es decorativo.
- **No abre frentes nuevos:** no descarga datasets, no investiga fuentes, no crea estructura (ya existe), no toca Docker, no requiere código nuevo (el motor `ingestWav` + bridge + paneles están probados E2E).
- Convierte estados de forma verificable: `dataset_state` `CAPTADO_INICIAL → CURADO/SPLITEADO` por evidencia, y sienta la base para que un `ml-v1-tabular` (REF-bootstrap → C0-eval) pueda existir con artefactos.

**Secuencia mínima (todo con activos existentes):**
1. Verificar los 7 `audi_set_mid` (misión de gobernanza corta) → **`G-DS-1` PASS**.
2. Captura de campo: ~80–100 clips en 3 sitios, 100 % doble revisión → **`G-DS-2` avanza**, `G-DS-6` se cierra.
3. `split` + `validate` → `split_report.json` con holdout reservado.
4. (Después, y solo después) entrenar `ml-v1-tabular` con **evaluación exclusiva en C0**, C1 como pre-entrenamiento REF.

**Qué NO hacer (para no degradar la honestidad):**
- **No** entrenar S81 sobre ESC-50/C1 (prohibido por gobernanza; 6/9 clases y dominio distinto).
- **No** presentar `rules-v0` como “IA” (el propio notebook demuestra que no generaliza a C1; como mucho `S81 = SIM` etiquetado).
- **No** abrir FSD50K/Xeno-canto/SONYC/Speech Commands/BirdCLEF/AudioSet antes de tener C0: la línea se reactiva **capturando**, no acumulando referencias externas.

> **Alternativa de menor impacto (no recomendada como primer paso):** reanudar H1–H3 (más fuentes REF). Añade material externo pero **no** desbloquea S81 (sigue sin C0) y consume esfuerzo en ingesta que hoy no cambia ningún estado de la línea.

---

## 11. CLASIFICACIÓN FINAL (obligatoria)

> ### `PARCIALMENTE OPERATIVO`

**Evidencia concreta que la justifica:**

1. **Opera de verdad (adquisición):** `cli status` (2026-11-17) devuelve `CAPTADO_INICIAL`, **1 fila / 1 WAV / 1 feature**; el flujo `S30 → Logger → Bridge → ingestWav → metadata/features` está validado E2E (`GO_TRAMO_B_FINAL`, `GO_TRAMO_C_FINAL`, `GO_TRAMO_BC_PRODUCTION`) e integrado en `/dashboard-cmsc`.
2. **Artefactos reales en disco:** C0 (metadata 42 col, features 44 dims, split ejecutado 2026-11-10, checksums) y C1 (`reference/esc50/`, **428** clips + features + manifiesto + checksums).
3. **Código real y probado:** motor `tools/cmsc-data-logger` (suite de tests), bridge `127.0.0.1:8766`, S30 PCM AudioWorklet, paneles de la Zona V2, pipeline ESC-50.
4. **Falta la mitad de inteligencia:** **no existe** modelo acústico, **no existe** `AcousticClassifier`, **no existe** endpoint acústico en `ai_service`, **no existe** presentación S81/S82. Todo eso es `DISENO`.
5. **Bloqueo identificado y vigente:** corpus C0 insuficiente (1/1350) + `G-DS-1 FAIL` (7 mids `UNVERIFIED`); S81/S82/KH declarados `DISENO` en `AcousticFlowStepper.jsx`/`AcousticConsumersStrip.jsx`.

**Desglose honesto:** `Adquisición = OPERATIVO` · `Features = OPERATIVO` · `Capa REF ESC-50 = OPERATIVO (inventariado)` · `Modelo/S81/S82/KH/Backend acústico = BLOQUEADO (no implementado)`.

---

## 12. No-acciones e invariantes respetadas

- **Sin** modificar código · **sin** entrenar · **sin** descargar · **sin** crear datasets · **sin** alterar Docker · **sin** rebuild · **sin** commit · **sin** push · **sin** mover archivos.
- **Sin** tocar `v1/` (schema/labels/metadata/features) ni `reference/esc50/`.
- **Sin** tocar S30, frontend, backend, benchmark, Knowledge Hub, IA existente ni gobernanza.
- El **único** artefacto creado es este documento: `docs/AI_ACOUSTIC_STATE_AUDIT.md`.
- Estado git: rama `feature/cmsc-f3c-v1-implementation`, HEAD `5308d79`, sin cambios de índice por esta misión.

> **Cierre:** la línea acústica no está rota ni abandonada por un defecto técnico; está **a mitad de camino y esperando audio real**. Lo construido funciona y lo que falta está identificado, acotado y desbloqueable sin abrir un solo frente nuevo.
