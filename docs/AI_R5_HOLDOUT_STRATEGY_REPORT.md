# AI_R5_HOLDOUT_STRATEGY_REPORT

**Misión:** `AI_R5_HOLDOUT_STRATEGY`
**Naturaleza:** SOLO diseño/estrategia. **NO implementa · NO mueve archivos · NO entrena · NO captura · NO commits · NO push.**
**Contexto:** `AI_R3_R4_EXECUTION_PLAN` (`SAFE_TO_EXECUTE`) · **G-3b ABIERTO** · `holdout/real_world_holdout_v1` = **0 archivos**.
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-14 (America/Bogota) · **Regla:** toda afirmación anclada a disco/repo; lo no evidenciado se declara.

---

## 0. Dictamen

# `AI_R5_READY`

La **estrategia canónica del holdout real está definida y es ejecutable** (§1–§8), y responde las 8 preguntas. **La ejecución es una operación de campo**, no de código: requiere **captura real + diagnóstico fitopatológico** (proceso humano externo), exactamente como el precedente acústico declaró `PROTOCOLO · LISTO PARA EJECUCIÓN` con `site_c` reservado.

> **Frontera dura:** `AI_R5_READY` = la **estrategia** está lista. **G-3b permanece ABIERTO** hasta que exista el holdout materializado y validado (§8). Hoy: `real_world_holdout_v1` = **0**.

**Fundamento de honestidad:** el dataset es **bootstrap de laboratorio** (PlantVillage `raw/color`, hoja cuadrada) y su propia `dataset_card.md` §10 lo declara **≠ validez de campo**. El holdout real es el instrumento que **mide esa brecha**.

---

## 1. Tamaño mínimo

**Principio:** el holdout mide **generalización a dominio nuevo** (campo ≠ laboratorio). Debe ser **pequeño pero suficiente** para reportar por-clase con incertidumbre declarada, no para entrenar.

### 1.1 Tamaño por niveles

| Nivel | Por clase | Total (16) | Uso | Incertidumbre por clase (95%, p≈0.9) |
|---|---|---|---|---|
| **Mínimo absoluto (gate G-3b)** | **30** | **480** | Abre el gate con métricas **declaradas** | ±0.107 → **reporta con IC, no concluyente por clase** |
| **Recomendado (publicación)** | **50** | **800** | Métricas publicables | ±0.083 |
| **Objetivo robusto** | **100** | **1 600** | Cierre de calidad | ±0.059 |

**Umbral de gate:** **≥ 30 por clase y ≥ 480 totales**. Por debajo ⇒ `holdout_state: INSUFICIENTE` (no cierra G-3b).
**Recomendación:** apuntar a **50/clase (800)**; 100/clase (1 600) si la logística lo permite.

### 1.2 Regla de completitud
- **16/16 clases** deben estar presentes (paridad con `taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml`).
- Clase con **< 15** muestras ⇒ se marca `LOW_SUPPORT` y **no** contribuye al macro-F1 oficial (se reporta aparte). No se admite ausencia de clase.

### 1.3 Ancla de esfuerzo
El split de entrenamiento ya es **desbalanceado** (ratio 35.24×; `potato__healthy` = 152). El holdout **no** replica ese desbalance: se **estratifica por clase** (§2) para poder medir la clase rara.

---

## 2. Distribución por clases

**Regla:** **estratificación balanceada** (cuota igual por `canonical_class_id`), con **piso por especie** (tomato 9 / corn 4 / potato 3). No se replica la prevalencia de entrenamiento en la captura; la prevalencia solo se usa para una **métrica ponderada secundaria** (§7).

| canonical_class_id | especie | cuota mín. | rec. | robusto |
|---|---|---|---|---|
| `tomato__bacterial_spot` | tomato | 30 | 50 | 100 |
| `tomato__early_blight` | tomato | 30 | 50 | 100 |
| `tomato__healthy` | tomato | 30 | 50 | 100 |
| `tomato__late_blight` | tomato | 30 | 50 | 100 |
| `tomato__leaf_mold` | tomato | 30 | 50 | 100 |
| `tomato__mosaic_virus` | tomato | 30 | 50 | 100 |
| `tomato__septoria_leaf_spot` | tomato | 30 | 50 | 100 |
| `tomato__target_spot` | tomato | 30 | 50 | 100 |
| `tomato__yellow_leaf_curl_virus` | tomato | 30 | 50 | 100 |
| `corn__cercospora_gray_leaf_spot` | corn | 30 | 50 | 100 |
| `corn__common_rust` | corn | 30 | 50 | 100 |
| `corn__healthy` | corn | 30 | 50 | 100 |
| `corn__northern_leaf_blight` | corn | 30 | 50 | 100 |
| `potato__early_blight` | potato | 30 | 50 | 100 |
| `potato__healthy` | potato | 30 | 50 | 100 |
| `potato__late_blight` | potato | 30 | 50 | 100 |
| **TOTAL** | | **480** | **800** | **1 600** |

**Índice→clase (fijo, orden `ImageFolder`):** el mapeo de 16 clases ya verificado (§ `model_card` §5) es la **autoridad** de la evaluación; el holdout **no** redefine índices.

---

## 3. Reglas de muestreo

1. **Fuente independiente:** captura **propia en campo** (o colaboración con técnicos/fitopatólogos, p. ej. SENA). **Prohibido** reutilizar PlantVillage, sus mirrors o imágenes de entrenamiento.
2. **Dominio nuevo:** hojas/plantas en condiciones de campo real (fondo, iluminación, ángulo, oclusión, planta completa), no montaje de laboratorio.
3. **Agrupación por sesión:** cada unidad de captura se agrupa por **`(site_id, plant_id, session_id)`**; **toda una sesión cae entera en el holdout** (§4).
4. **Diversidad mínima:** ≥ **3 sitios** distintos y ≥ **2 dispositivos** distintos; ≥ 1 sitio fuera del municipio de entrenamiento si es posible.
5. **Diagnóstico confirmado:** toda imagen lleva **etiqueta diagnóstica de referencia** (fitopatólogo o técnico entrenado) con **nivel de confianza del anotador**; sin confirmación ⇒ `unlabeled` (no entra al set oficial).
6. **Reserva congelada:** una vez capturado el mínimo, el holdout se **congela** (checksums) y **no** se vuelve a muestrear tras conocer las métricas (§5.6). Nada de ajuste contra el holdout.
7. **Rechazo de ambiguos:** duda diagnóstica ⇒ **cuarentena**, no se cuenta (se preserva, `NADA DESAPARECE`).

---

## 4. Reglas de no fuga

**Objetivo:** demostrar que **ninguna** imagen de holdout tocó entrenamiento/validación/test.

| Regla | Umbral | Herramienta |
|---|---|---|
| **NF-1 Duplicado exacto** | SHA-256 de holdout ∩ (RAW ∪ curated ∪ RAW_) = **∅** | `CHECKSUMS.sha256` |
| **NF-2 Near-duplicate** | pHash 64-bit, Hamming **≤ 8** contra **todas** las particiones = **0 grupos** cruzados | pHash (mismo algoritmo del split) |
| **NF-3 Agrupación por sesión** | Ningún `(site, plant, session)` compartido entre holdout y particiones | metadatos de sesión |
| **NF-4 Variantes excluidas** | Sin `grayscale`/`segmented`/`generated_for_paper` (política de curación) | inspección |
| **NF-5 Aislamiento físico** | `holdout/real_world_holdout_v1/` **read-only**, fuera de `curated/` y de los splits | filesystem |
| **NF-6 Inmutabilidad de splits** | `split_lists/{train,validation,test}.csv` **no se tocan** | hash de los 3 CSV |
| **NF-7 Registro de exclusión** | Toda imagen descartada por near-dup se lista con su motivo | `holdout_exclusions.csv` |

> **Invariante:** si NF-1..NF-4 fallan ⇒ **el holdout no es válido** y no cierra G-3b.

---

## 5. Reglas de validación

### 5.1 Etiquetado
- **Doble revisión ciega** (2 anotadores independientes) + **adjudicación** por fitopatólogo en desacuerdo.
- **Acuerdo mínimo:** **Cohen κ ≥ 0.80** sobre la muestra revisada; si κ < 0.80 ⇒ re-etiquetar la clase afectada.
- **`annotation_quality`** por imagen: `diagnosed` (fitopatólogo) · `double_reviewed_agree` · `disputed_resolved`.
- **`confidence_annotator` ∈ [0,1]** obligatorio.

### 5.2 Calidad técnica (rechazo)
| Check | Umbral |
|---|---|
| Resolución mínima | lado corto ≥ **256 px** |
| Nitidez | varianza del Laplaciano ≥ umbral (a calibrar) |
| Exposición | no saturada (>2 % clipping) ni subexpuesta |
| Formato | JPEG/PNG RGB (o conservar original + copia normalizada) |
| Integridad | SHA-256 único |

### 5.3 Evaluación
- El holdout es **externo e intocable durante el entrenamiento** (regla del `MASTERPLAN` §138, `Execution Plan` §9.3).
- Se evalúa con el **ONNX canónico M2 (contrato neutral)** — el mismo `.onnx` de AI-R2 — y con **M1** si se materializa. **Mismo holdout congelado** para comparar modelos.
- **Cero ajuste** de hiperparámetros, umbrales o selección de modelo a partir del holdout.

### 5.4 Estados del holdout
`PREPARADO_VACIO` (**hoy**) → `CAPTURANDO` → `INSUFICIENTE`/`CONGELADO` → `VALIDADO` (no-leakage + κ) → `EVALUADO` (métricas publicadas).

### 5.4bis Protocolo reutilizable
Reutilizar el modelo del `FIELD_DATA_COLLECTION_PROTOCOL.md` (precedente acústico: `site` como unidad de holdout, doble revisión, checksums, `pilot-validate`), adaptado a **imágenes + diagnóstico fitopatológico**.

---

## 6. Evidencia requerida

| # | Artefacto | Qué prueba |
|---|---|---|
| E1 | `holdout/real_world_holdout_v1/*.{jpg,png}` | El material existe (≥480) |
| 2 | `holdout/real_world_holdout_v1/labels_holdout_v1.csv` | Etiquetas por imagen (`sample_id, canonical_class_id, species, condition_name, health_state, annotation_quality, confidence_annotator, session_id`) |
| E3 | `holdout/real_world_holdout_v1/holdout_manifest.yaml` | Procedencia: sitios, dispositivos, fechas, operadores, versión de protocolo, `taxonomy_version` |
| E4 | `holdout/real_world_holdout_v1/CHECKSUMS.sha256` | Integridad + insumo NF-1 |
| E5 | `holdout/real_world_holdout_v1/holdout_leakage_report.yaml` | NF-1..NF-4 ejecutados (SHA-256 + pHash + sesión) |
| E6 | `holdout/real_world_holdout_v1/holdout_agreement_report.yaml` | κ + doble revisión |
| E7 | `holdout/real_world_holdout_v1/holdout_exclusions.csv` | Descartados con motivo (NADA DESAPARECE) |
| E8 | `benchmark/runs/<model>/report/validation_metrics_holdout.json` | Métricas finales (§7) |
| E9 | `.../report/holdout_report.md` | Informe legible + veredicto |
| E10 | `docs/ai/artifacts/model_cards/<model>.model_card.md` (§ holdout) | Métrica externa anexada al card |
| E11 | `docs/AI_R5_HOLDOUT_GOVERNANCE_REPORT.md` | **Cierre de G-3b** (§8) |
| E12 | `real_world_validation_plan.md` + `field_capture_protocol.md` | Los previstos por el notebook `15_agriculture_v2_real_world_validation_plan` |

---

## 6.1 Estructura objetivo (no creada en esta misión)
```
holdout/real_world_holdout_v1/
├── images/<canonical_class_id>/*.jpg
├── labels_holdout_v1.csv
├── holdout_manifest.yaml
├── holdout_leakage_report.yaml
├── holdout_agreement_report.yaml
├── holdout_exclusions.csv
└── CHECKSUMS.sha256
```

---

## 7. Métricas finales

**Primaria (macro, balanceada por clase estratificada):**
- **macro-F1** · **balanced accuracy** · **accuracy**.

**Por clase:** precision · recall · F1 · **support** (16 filas, índice 0..15).
**Matriz de confusión 16×16** (mismos índices que `model_card` §5).

**Secundarias:**
- `weighted_f1` (por prevalencia **de campo** del holdout).
- **ECE** (calibración) — comparar con `0.0332` de validación interna.
- **Δmacro-F1** = `macro_f1(holdout) − macro_F1(validation=0.9937)` → **mide la brecha lab→campo**.
- **IC 95 %** por clase y macro (Wilson/bootstrap).
- Métricas **por especie** (tomato/corn/potato).

**Umbrales de veredicto (propuesta, a ratificar por Bernardo — D5-D):**
| Veredicto | Criterio |
|---|---|
| `HOLDOUT_PASS` | macro-F1 ≥ **0.80** ∧ ninguna clase < **0.60** ∧ ECE ≤ **0.10** |
| `HOLDOUT_DEGRADADO` | 0.60 ≤ macro-F1 < 0.80 (mide la brecha; **no** invalida el modelo, lo documenta) |
| `HOLDOUT_FAIL` | macro-F1 < 0.60 (el canon de serving debe revisarse) |

> **Nota honesta:** un `HOLDOUT_DEGRADADO` **no** cierra el camino; obliga a **declarar** que la validez de campo es menor que la de laboratorio (invariante de honestidad). El objetivo de R5 es **medir**, no maquillar.

---

## 7.1 Métricas de referencia (estado actual, laboratorio)
M2 @ validation (3 373, seed 42): **macro-F1 0.9937** · balanced 0.9943 · weighted-F1 0.9956 · ECE 0.0332. El holdout se contrasta **contra** esto; la **caída** es el resultado científico.

---

## 8. Cómo cerrar G-3b

**G-3b = "`real_world_holdout` > 0 antes de publicar"** (`H5_AI_GOVERNANCE_CLOSURE_REPORT` §0).

**Checklist de cierre (todos obligatorios):**

| # | Condición | Evidencia |
|---|---|---|
| **G3b-1** | Holdout **materializado** ≥ 30/clase y ≥ 480 total, 16/16 clases | E1, E2 |
| **G3b-2** | **Procedencia** declarada (sitios, dispositivos, fechas, operadores) | E3 |
| **G3b-3** | **Integridad** (checksums) | E4 |
| **G3b-4** | **Sin fuga** (NF-1..NF-4) verificada | E5 |
| **G3b-5** | **Doble revisión + κ ≥ 0.80** | E6 |
| **G3b-6** | **Métricas finales** publicadas (macro-F1 + por clase + confusion + ECE) | E8, E9 |
| **G3b-7** | **Model card** anexa la métrica externa | E10 |
| **G3b-8** | **Informe de gobernanza** firmado | E11 |

**Acción de cierre:** `docs/AI_R5_HOLDOUT_GOVERNANCE_REPORT.md` declara **`G-3b CLOSED`** (marca el cambio de estado y la fecha). El holdout queda **congelado read-only**.

**Al cerrar G-3b → R5.5** (validación con holdout + métricas) **y R5.6** (`R5_CLOSED`) quedan habilitados.

### 8.1 Condiciones externas a G-3b (declaradas)
- **Captura real** (presencia física + diagnóstico) = la misión de ejecución; **la estrategia está lista, los datos no existen**.
- **`R5_CLOSED`** sigue requiriendo **P1** (M1 `M1_PARTIAL`; se sirve M2), **P2** (decisión de servir ✅) y **P4** (ONNX ✅). **R5.1–R5.4** los cierra `AI_R3_R4_EXECUTION_PLAN`. **R5.5/R5.6** los habilita **G-3b**.

---

## 9. Clasificación

# `AI_R5_READY`

**Motivo:** las 8 preguntas quedan respondidas y verificables contra el dataset/taxonomía/split reales; el pipeline de holdout replica patrones ya probados (protocolo de campo acústico + anti-fuga del split v1). **La estrategia está lista para ejecución.**

**No ejecutado por diseño:** captura, movimiento de archivos, entrenamiento, evaluación, commits, push.

---

## 9.1 Decisiones abiertas (para Bernardo)
| ID | Decisión | Recomendación |
|---|---|---|
| **D5-A** | Tamaño de gate | **30/clase (480)** mínimo; apuntar a 50/clase |
| **D5-B** | Fuente de captura (propia vs colaboración SENA) | Colaboración con fitopatólogo para el ground truth |
| **D5-C** | Autoridad de etiqueta | Fitopatólogo adjudica; κ ≥ 0.80 |
| **D5-D** | Umbrales `HOLDOUT_PASS` | macro-F1 ≥ 0.80, ninguna clase < 0.60, ECE ≤ 0.10 |

---

## 9.2 No ejecutado
Sin cambios de código · sin mover/crear archivos · sin captura · sin entrenamiento · sin commits · sin push · sin OCI. `holdout/real_world_holdout_v1` sigue **vacío (0)**.

---

## 10. Referencias (evidencia)
- `data/datasets/agriculture_images_tomato-potato-corn/v1/dataset_card.md` (§5 distribución, §7 anti-fuga, §10 limitación campo)
- `.../v1/labels/labels_v1.csv` (22 488 filas; `validation_source`: 20 498 `source_dataset_audited` + 1 990 `double_reviewed`)
- `.../v1/split_lists/split_report.md` + `split_report.json` (15 741/3 373/3 374 · seed 42)
- `.../v1/holdout/real_world_holdout_v1/` = **0 archivos** (reservado intocable)
- `docs/ai/manifests/taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml` (16 classes)
- `docs/ai/manifests/split_manifest.agriculture_v2_split_v1.yaml` (anti-fuga: SHA-256 + pHash ≤ 8 + grupo)
- `benchmark/runs/M2_efficientnet_b0/report/validation_metrics.json` (macro-F1 0.9937 · ECE 0.0332)
- `docs/ai/artifacts/model_cards/M2_efficientnet_b0.model_card.md` (§5 índice→clase, §5b métricas, §7b ONNX)
- `docs/H5_AI_GOVERNANCE_CLOSURE_REPORT.md` §0 (`G-3b`), §3 (`real_world_holdout` 0)
- `docs/R5_AI_SERVING_STRATEGY_REPORT.md` (§8 P1–P4, A9 G-3b)
- `docs/ai/research_v2/AI_DATASET_STRATEGY_V2.md` §14.5 · `AI_TRAINING_PIPELINE_V2.md` §246,382 · `AGRICULTURE_AI_V2_EXECUTION_PLAN.md` §5.5 · `AGRICULTURE_AI_V2_NOTEBOOK_ROADMAP.md` §15
- `docs/SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` §138,245,247 (holdout intocable / κ / anti-fuga)
- `docs/FIELD_DATA_COLLECTION_PROTOCOL.md` (precedente: holdout por sitio, doble revisión, checksums)

**Sin implementar · sin mover archivos · sin entrenar · sin commits · sin push.**
