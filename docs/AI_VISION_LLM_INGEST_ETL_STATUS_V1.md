# Estado técnico vivo · Visión · LLM · Ingesta agnóstica · ETL/EDA

> **Naturaleza del documento:** índice operativo y estado verificado a 2026-11-24.
> **NO es una nueva autoridad canónica.** No reescribe, no sustituye y no modifica los
> documentos que enlaza. En conflicto, prevalece la jerarquía de
> [D-003](DOCUMENTATION_ARCHITECTURE_DECISION_V1.md) (`docs/` es el único *source of truth*).
> Responde cuatro preguntas concretas: **qué modelos y LLMs existen hoy**, **qué datasets
> se usan**, **cómo entra la señal de hardware cualquiera hacia la persistencia** y
> **cómo se auditan ETL/EDA/trazabilidad**.
>
> **Rama:** `feat/ml-vision-audio-pipeline`. **Sin commit ni push.** Sin tocar puertos,
> Docker, `data/`, `benchmark/`, stash ni tags.

---

## 0. Regla de lectura: honestidad primero

| Estado | Significado en este documento |
|---|---|
| `REAL-LOCAL` | Captura propia autorizada **y** inferencia ejecutada por el servicio oficial. Nunca se emite `REAL`. |
| `LOCAL` | Archivo/clip leído en disco o procesado en el navegador. No es campo, no es cámara. |
| `SIM` | Demo sintético o fallback determinista. Nunca se etiqueta como inferencia. |
| `NO_DATA` | Falta captura, autorización, inferencia o evidencia verificable. |
| `ROTO` | Transporte fallido, artefacto no disponible o resumen no utilizable. |
| `REF` | Fuente externa de referencia/investigación. Jamás entra en splits propios. |
| `DISENO` | Gobernado en documentos, no materializado ni ejecutado. |

**Dos separationes que no se cruzan:** (1) procedencia del artefacto (`model_status`) ≠
ejecución de inferencia (`inference_executed`) ≠ origen del resultado (`source_mode`);
(2) *servir* un artefacto ≠ *promoverlo* sobre M1.

---

## 1. Qué existe hoy (matriz rápida)

| Capacidad | Estado | Evidencia verificable | No confundir con |
|---|---|---|---|
| Servicio de inferencia FastAPI `:8081` | `REAL-LOCAL` cuando hay frame autorizado + inferencia | `src/ai_models/fastapi_app.py` → `/infer` | Un `/health` HTTP 200: solo dice que el proceso responde |
| M1 MobileNetV2 | Baseline oficial **congelado** | macro-F1 `0.9899` · ECE `0.0313` | Un modelo desplegado |
| M2 EfficientNet-B0 | Challenger validado, **no promovido** | macro-F1 `0.9937` · ECE `0.0332` > `0.0313` | "Mejor F1" ⇒ promoción (no procede) |
| Artefacto legacy `plant_disease_mbv2.h5` | `HISTORICO` / descalificado | doble normalización, `binary_only`, 2 clases | El baseline M1 (sin pesos en disco) |
| Contrato v1 binario | Vigente por defecto | `enferma` / `sana` | Identificación de enfermedad |
| Contrato v2 multiclase 16 | Tolerado en resolver + UI, **investigación** | `canonical_class_id`, taxonomía `agriculture_v2_taxonomy_v1` | Validación de campo |
| Clip WebM local multi-frame | `LOCAL` | SHA-256 + métricas deterministas + frames en memoria | Cámara real o diagnóstico de video |
| Asistente de voz S62 | Operativo con fallback determinista | `sigct-voice-context-v1`, headers `X-SIGCT-*` | Un LLM propio entrenado |
| Ingesta acústica C0 | Pipeline reproducible, fuera de git | WAV + `metadata.csv` + features + checksums | Tablas `api_sensorreading` / `api_robot*` |
| Capa REF acústica | `DISENO` / `REF` | Catálogo y planes H1–H3 | Datos ya descargados |

---

## 2. Visión: contratos, taxonomía y descubrimiento de capacidades

### 2.1 Estados del contrato

- **v1 (`binary_only`)**: dos clases, artefacto `HISTORICO` por hash. Es el comportamiento
  por defecto y el que conserva compatibilidad hacia atrás.
- **v2 (`agriculture_multiclass16`)**: 16 `canonical_class_id` (maíz, papa y tomate) con
  `plant_species`, `condition_name`, `health_state` y `taxonomy_version`. El backend los
  resuelve en `semantic_prediction_resolver.py` y el runtime declara la identidad del
  artefacto por SHA-256 en `model_identity.py` (`M2_CLASS_LABELS`).
- El frontend detecta v2 por `semantic_contract_version === 'v2'` **o** presencia de
  `canonical_class_id`. Si falta, cae al contrato binario sin inventar nada.

### 2.2 Espejo de taxonomía (este turno)

`src/frontend/src/services/aiTaxonomy.js` es un **espejo de solo lectura** de los 16
bindings canónicos, para mostrar `Maíz · Roya común` en lugar de un `class_1` opaco.
Un id no declarado devuelve `null`: no se reetiqueta ni se inventa clase. La autoridad
sigue siendo [`taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml`](ai/manifests/taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml)
y [`model_registry.agriculture_v2.yaml`](ai/manifests/model_registry.agriculture_v2.yaml)
(AC-L13: el hash del runtime y el del manifiesto deben coincidir).

### 2.3 Descubrimiento sin invocar modelos

`/health` incorpora `semantic_capabilities`: contrato vigente, `class_space`, etiquetas
declaradas, estado del artefacto, configuración del LLM (booleano y nombre de modelo,
**nunca la clave**), límites de frames por petición y contratos de clip/ingesta. Esto
permite que un cliente degrade su UI sin lanzar inferencia ni llamar a un proveedor.

### 2.4 Clip local (multi-frame)

`clipEvidence.js` lee el WebM solo en memoria, valida la cabecera EBML, calcula SHA-256
y muestrea frames durante reproducción acelerada (el contenedor no tiene `Cues`). El
envío al endpoint oficial requiere autorización explícita, se limita a 3 frames y cada
respuesta describe **solo su frame**. Los promedios no son una predicción nueva.

→ Gobernanza: [cierre M1/M2](ai/M1_M2_GOVERNANCE_CLOSURE_REPORT.md) ·
[registro de artefacto M2](ai/artifacts/M2_ARTIFACT_RECORD.md) ·
[roadmap de dataset visual](vision/VISION_DATASET_ROADMAP_V1.md).

---

## 3. LLMs: qué hay, qué falta y cómo se degrada

**No existe un LLM entrenado por el proyecto.** El modelo de gobernanza es un *slot*
`Interprete` intercambiable, subordinado a la Constitución y a la
[Carta de Gobernanza IA](CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md); el ACP es orquestador,
no chatbot, y la verdad está en registros + evidencia + Knowledge Hub.

| Opción | Estado | Cómo se activa |
|---|---|---|
| Proveedor remoto / nube | `DISENO` — pendiente de asignar | `SIGCT_VOICE_LLM_URL` + `SIGCT_VOICE_LLM_MODEL` + `SIGCT_VOICE_LLM_KEY` |
| LLM local | `DISENO` — pendiente de asignar | Mismo contrato de entorno; el slot no depende de proveedor |
| Regla determinista `KEYWORD_RULE` | **Vigente por defecto** | Sin las tres variables: `llm_used=false`, `status=NOT_CONFIGURED` |

El resumen que viaja a `/assist` es acotado (`buildVoiceContext`): señal S35, visión,
clip y ahora ingest declarada. La navegación exige **token cerrado** del servidor **y**
ruta existente en el frontend (`safeNavigate`). Todo valor de estado desconocido degrada
a `NO_DATA`; el clip leído de disco se degrada de `REAL-LOCAL` a `LOCAL` en el servidor.
Las trazas `X-SIGCT-*` (modo, LLM, intención, contexto, clip) se exponen al navegador.

**Pendiente:** decidir proveedor (nube o local), modelo, cuotas, política de datos y
gate de salida. Hasta entonces, cualquier respuesta sin LLM se reporta como regla.

→ [Constitución §8/§9](CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md) ·
[Carta IA §8/§14](CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md).

---

## 4. Datasets: propios, locales y de referencia

### 4.1 Visión

Dataset V2+ congelado: **22.488 imágenes / 16 clases**, split **15.741 / 3.373 / 3.374**
(seed 42), **holdout 0** (gate G-3b pendiente). Base: PlantVillage y derivados auditados
según el plan original. M1 y M2 se entrenaron con esta política canónica.

### 4.2 Acústico C0 (propio)

`data/datasets/sigct_rural_acoustic/v1/` (fuera de git): `schema.json` **1.3.0**, **42
columnas** (25 obligatorias + 5 de herramienta + 9 opcionales + 3 derivadas), 9 clases v1,
features `acoustic.feat.v2` → **44 dims** (mean+std). Tabla maestra `metadata.csv`;
`features/`, `split_lists/` y `CHECKSUMS.sha256` son derivados regenerables.

> **Hallazgo de lectura, 2026-11-24 (no ejecutado, no modificado):** el disco presenta
> **290 filas / 290 WAV**, con `ingest_status` = 281 `accepted` + 9 `quarantine`, las 290
> en `partition=unassigned`. `split_report.json` declara `state=EXECUTED` con un solo grupo
> (`train=1`, `validation=0`, `test=0`) y `sg4_holdout_reserved=false`.
> **No se cierra G-DS-3:** el informe no puede elevar partitions sin WAV en los splits.
> El snapshot «8 muestras accepted» de `AGENTS.md` (2026-11-23) queda como registro
> fechado; la discrepancia requiere decisión de gobernanza y actualización del estado
> canónico en su momento. Este turno **no tocó `data/`**.

### 4.3 Referencia externa (`REF`)

Catálogo acústico gobernado: ESC-50, FSD50K (selectivo CC0/CC-BY), Xeno-canto (filtro
`ND`), SONYC-UST, Speech Commands y AudioSet (**solo ontología/YAMNet**). BirdCLEF
diferido; UrbanSound8K excluido. Lote H3 ≈9.500 clips **diseñado, no descargado**.
Regla dura: ningún clip REF entra en `train|validation|test` de C0.

→ [estrategia híbrida](AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md) ·
[catálogo REF](AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md) ·
[gobernanza acústica §11](AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md) ·
[taxonomía v2 (`DISENO`)](acoustic/README.md).

---

## 5. Ingesta agnóstica de hardware hacia base de datos

### 5.1 Tres mundos que hoy no comparten contrato

| Mundo | Entrada | Persistencia | Trazabilidad |
|---|---|---|---|
| Telemetría Django | `/v3/telemetry/readings/` | PostgreSQL vía ORM (`api_sensorreading`) | `source_mode`, `contract_version`; sin `device_id` ni hash |
| Robótica Django | API de comandos/telemetría | `api_robot*`, tablas separadas | `payload` / `result_log` |
| Logger acústico CMSC | captura local / bridge | CSV + WAV + features en `data/` | SHA-256, AC-1..10, G-DS-*, tabla de huellas |

El hardware especializado (BBB, ESP32, robots) es **aditivo, nunca obligatorio**: la
captura en PC/campo ya es una fuente válida. Principio fundacional: agnosticismo
hardware/software.

### 5.2 Envelope declarativo implementado (este turno)

`src/frontend/src/services/ingestEnvelope.js` → contrato `sigct-ingest-envelope-v1`.
Normaliza **cualquier fuente** a un mismo envelope:

- `source`: `sourceId`, `deviceId` (`NO_DECLARADO` si no se declara; nunca se inventa),
  `kind`, `modality`, `origin`, `declaredPath`, `fileName`, `sha256`, `bytes`, `mimeType`.
- `ingestStatus`: `SIN_DATOS` · `PENDIENTE_AUTORIZACION` · `PENDIENTE_INFERENCIA` ·
  `OBSERVACION_LOCAL` · `ACEPTADO_MUESTRA` · `RECHAZADO`.
- `qcStatus`: `PENDING` salvo error (`FAIL`). **`QC_CIENTIFICO` siempre `PENDING`**: no
  se simula curación ni doble anotación.
- `lineage`: `CAPTURA → [EXTRACCION_LOCAL] → AUTORIZACION → TRANSPORTE → INFERENCIA →
  PERSISTENCIA(NO_REALIZADA) → EVIDENCIA`.
- `persistence`: `IN_MEMORY_SESSION`, `databaseWrite: false`, `datasetWrite: false`.

Está cableado en `visionEvidence.js` (campo `ingest`, observación `INGESTA` y traza) y se
publica en el canal S62. **Es una declaración, no una escritora de BD.**

### 5.3 Contrato propuesto hacia persistencia (`DISENO`, no implementado)

Para cerrar el gap sin romper modelos existentes, toda ingesta futura debería declarar:
`source_id` · `device_id` · `modality` · `ingest_status` · `qc_status` · `provenance` ·
`sha256` · `contract_version` · `observed_at` · `operator_id`. Un **registro declarativo
de dispositivos/fuentes** (`device_id → modalidad → contrato → estado honesto`), espejo del
Signal Registry ya diseñado, evitaría que un `device_id` arbitrario falsifique procedencia.
Ninguna de estas tablas se creó en este turno.

→ [Observation Platform](governance/SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md) ·
[Multimodal Masterplan](governance/SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md) ·
[Evidence Ledger](governance/SIGCTIARURAL_EVIDENCE_LEDGER_V1.md).

---

## 6. ETL / EDA y trazabilidad científica

### 6.1 Reglas invariantes

1. **`raw` nunca se muta.** Todo derivado (`features/`, `split_lists/`, `manifest.csv`,
   `CHECKSUMS.sha256`) se regenera desde la tabla maestra.
2. **Hash en el mismo cambio.** Si cambia un contrato, se actualizan su SHA-256 y su
   `schema_version` en la misma edición (regla de invalidación, §11 de gobernanza).
3. **El repo versiona la dirección y la huella**, no el binario. Los pesos y datasets
   grandes quedan gitignored.
4. **Ningún snapshot histórico eleva el estado** de un artefacto.

### 6.2 Pipelines reproducibles

- **Audio C0:** `capture/index.html` → CLI `ingest` (o bridge local) → WAV en
  `raw/<clase>/` → `metadata.csv` (42 columnas) → `acoustic_features_v2.csv` (44 dims)
  → envolventes AC-9 → checksums → `validate` (AC-1..10 + G-DS-1..6) / `status`.
- **M2 (mejor lineage):** dataset v1 → split seed 42 → notebook → run → export → copia
  verificada → gobernanza versionada. Autoridad de métricas: `validation_metrics.json`.
- **REF:** `DESCARGAR → VALIDAR → FILTRAR → NORMALIZAR → FEATUREIZAR → INVENTARIAR →
  CONSUMIR`. Diseñado, no ejecutado.
- **Telemetría:** hoy no hay ETL/EDA reproducible; la lectura en frontend consume la API
  y `LabSignal` muere en el bus en memoria. **Gap abierto.**

### 6.3 Auditoría

| Capa | Mecanismo | Límite honesto |
|---|---|---|
| Visión | `X-SIGCT-*`, `semantic_capabilities`, veredicto `visionEvidence` | No certifica campo |
| Audio C0 | `sample_id`, sha256, AC-1..10, G-DS-*, §11 | AC-9 `PROVISIONAL`; κ `PENDING` |
| Anotación | `annotator_id`, `review_annotator_id`, `agreement` | Doble anotación real pendiente |
| Modelos | hash por artefacto + manifiestos + acta M1/M2 | M1 sin pesos; holdout vacío |
| Ingesta (nuevo) | envelope `sigct-ingest-envelope-v1` | Declarativa, en memoria, sin persistencia |

→ [MLOps/EDA V2](ai/research_v2/AI_MLOPS_AND_TRAINING_GOVERNANCE_V2.md) ·
[ETL → PostgreSQL (`DISEÑO`)](ESC50_TO_S81_MAPPING_V1.md) ·
[gobernanza acústica §11](AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md).

---

## 7. Roadmap y gates (sin saltos)

| Ítem | Estado | Condición de cierre |
|---|---|---|
| AI-R2 export ONNX con paridad | `DONE` | Registro de artefacto y hash verificados |
| AI-R3 servicio neutral ONNX | `PENDING` | Servir v2 sin mezclar con v1 |
| AI-R4 API v2 + frontend | `PENDING` (tolerancia ya implementada) | Declaración formal del contrato en el sobre y gate firmado |
| AI-R5 validación con holdout | `PENDING` | Holdout real; hoy `0` muestras |
| G-DS-1..6 | Abiertos | 7 mids `UNVERIFIED`, AC-9 sin calibrar, κ `PENDING`, split coherente |
| LLM nube/local | `DISENO` | Decisión de proveedor, modelo y política de datos |
| Ingesta agnóstica → BD | `DISENO` | Catálogo de fuentes + envelope persistente + migración gobernada |

**Promoción de M2: no procede.** ECE `0.0332 > 0.0313`. Mostrar 16 clases en la UI es
una capacidad de servicio, no un cambio de baseline.

---

## 8. Cambios de código de este turno (rastreables)

| Archivo | Cambio aditivo | Contrato intacto |
|---|---|---|
| `src/frontend/src/services/aiTaxonomy.js` (nuevo) | Espejo de 16 clases + `describeCanonicalClass` + `buildTaxonomyView` | Sin default export; fail-closed en id desconocido |
| `src/frontend/src/services/ingestEnvelope.js` (nuevo) | Envelope `sigct-ingest-envelope-v1` | Sin escritura en BD/dataset |
| `src/frontend/src/services/visionEvidence.js` | Campo `ingest`, observación `INGESTA`, traza de ingest | Exports y veredicto intactos |
| `src/frontend/src/pages/AIPredictiva.jsx` | Etiquetas v2 en español + filas de trazabilidad | Mismos exports nombrados y `default export` |
| `src/ai_models/fastapi_app.py` | `semantic_capabilities` en `/health` | `/infer`, `/assist` y headers sin cambios |

**No tocados:** `AdvancedMathLabV2.jsx`, `MmcMathematicsCore.jsx`,
`MmcSignal3DProjection.jsx`, `useLabStore.js`, `UsbFrameProbePanel.jsx`, `data/`,
`benchmark/`, `tools/`, puertos, Docker, stash y tags.
