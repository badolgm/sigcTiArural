# AI ACOUSTIC MODEL BENCHMARK — v1 (DISEÑO)

**Misión:** CMSC_ACOUSTIC_DATASET_AND_MODEL_V1 · **FASE 4 (benchmark de modelos) + FASE 5 (Model V1)**
**Fecha:** 2026-10-02 · **HEAD:** `83b6089` · **Estado:** SOLO DISEÑO — sin entrenar, sin descargar, sin inferir
**Regla de honestidad:** ningún resultado aquí es real. Las tablas son **plantillas vacías** con el formato
de gobernanza del benchmark M1/M2. Un modelo no se promueve por prosa, solo por artefactos y métricas.

**Hereda de:**
- `docs/AI_ACOUSTIC_DATASET_REVIEW.md` (FASE 1)
- `docs/AI_ACOUSTIC_DATASET_V1_DESIGN.md` (FASE 2/3: dataset + logger + `acoustic.feat.window.v2`)
- `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md` (contrato `acoustic.feat.v2`)
- `docs/AI_MODEL_INVENTORY.md` (pipeline de métricas reutilizable: `benchmark/src/metrics.py`, `eval.py`)

---

## 1. Marco de gobernanza (mismo patrón que M1/M2)

Un modelo solo existe si existen **sus artefactos**:

```
runs/<run_id>/
├── config.json                # esquema, datos, hiperparámetros, seed
├── metrics.csv                # por época + final
├── validation_metrics.json    # métricas finales + calibración + por clase
├── checkpoints/best.*         # pesos
├── model_card.md              # tarjeta de modelo
└── M_A_VS_*.json / .md        # comparativa contra baseline
```

> `benchmark/runs/` está en `.gitignore` por diseño: los pesos **no** se versionan. Por tanto, el
> `model_card.md` + `validation_metrics.json` (sí versionables en `docs/`) son la **prueba** de un modelo.

**Estados del modelo** (alineados con el canon CMSC):
`DISENO` (no existe) → `SIM` (heurística/reglas) → `REF` (solo público) → `REAL-LOCAL` (propio validado).

---

## 2. Protocolo de evaluación

### 2.1 Datos
- **Capa REF:** ESC-50 (benchmark cerrado 6 clases), FSD50K (pre-entrenamiento), Xeno-canto (AVE/INSECTOS),
  Speech Commands (VOZ), SONYC (MOTOR).
- **Capa target:** `SIGCT_RURAL_ACOUSTIC_DATASET_V1` (propio).
- Split: `stratified_group_split` por `(session_id, place_id)`, seed 42 (FASE 2).
- **Nunca** dividir aleatoriamente clips de la misma sesión/sitio (fuga).

### 2.2 Esquema de entrada
- v1: `acoustic.feat.window.v2` (44 dims = mean+std de las 22 features) o 88 con min+max.
- Alternativa profunda: log-mel spectrogram (64 mel × frames) derivado del mismo WAV.

### 2.3 Métricas obligatorias
| Métrica | Reutiliza | Rol |
|---|---|---|
| `macro_f1` | `benchmark/src/metrics.py` | métrica principal (clases balanceadas) |
| `balanced_accuracy` | idem | robusto a desbalance residual |
| `per_class_f1` + `confusion_matrix` | `eval.py` | diagnóstico |
| `ECE` (calibración) | `metrics.py` | confianza de S81 creíble |
| `latency_ms` (inferencia) | nuevo | viabilidad en navegador/Edge |
| `model_size_bytes` | nuevo | peso offline |
| `ood_auroc` (RUIDO DESCONOCIDO) | nuevo | detección de fuera-de-dominio |

### 2.4 Protocolos
1. **Ref-benchmark:** ESC-50 (6 clases) con 5-fold estratificado → compara **arquitecturas**, no capacidad.
2. **Target-benchmark:** train/val/test propio con group split → mide **capacidad real**.
3. **Cross-domain:** entrenar en REF, evaluar en target y viceversa → cuantifica domain shift (R3).
4. **Leave-one-place-out:** dejar un sitio entero fuera → prueba de generalización.

---

## 3. Candidatos del benchmark (`MA` = Model Acoustic)

| ID | Modelo | Entrada | Por qué compite | Estado tecnológico |
|---|---|---|---|---|
| **MA-0** | `rules-v0` (umbrales) | 22 features | baseline determinista, 0 aprendizaje | diseñado en `ARCHITECTURE_V1` |
| **MA-1** | Logistic Regression | `window.v2` (44) | baseline lineal, interpretable | sklearn, trivial |
| **MA-2** | Random Forest | `window.v2` | baseline no lineal robusto | sklearn |
| **MA-3** | HistGradientBoosting / LightGBM | `window.v2` | fuerte en tabular, muy barato | sklearn/LightGBM |
| **MA-4** | MLP pequeño (1–2 capas) | `window.v2` | puente tabular↔red | sklearn/Keras/ONNX |
| **MA-5** | CNN sobre log-mel | mel 64×T | captura estructura tiempo-frecuencia | PyTorch |
| **MA-6** | YAMNet + cabeza lineal (transfer) | waveform 16k / embeddings 1024 | profesor AudioSet, **TFLite/TF.js** | TensorFlow Hub |
| **MA-7** | AST / PANNs CNN14 / ConvNeXt (fine-tune) | mel | techo de accuracy (alto costo) | PyTorch |

**Datos verificados para dimensionar MA-6/MA-7 (2026-10-02):**
- **YAMNet:** MobileNetV1, **3,7 M pesos**, 521 clases, entrada 960 ms @16 kHz, embeddings 1024; TFLite
  disponible para Web/Mobile.
- **PANNs CNN14:** **80,8 M params**, 42,2 G multi-adds/10 s, mAP 0,431 AudioSet.
- **AST:** ~**86–88 M params**, mAP ~0,459 AudioSet.
- **PaSST/ConvNeXt-Tiny:** ~**28–88 M params**, mAP ~0,471 AudioSet.
> Conclusión de tamaño: MA-7 **no** es viable en navegador; solo servidor. MA-6 sí (TFLite).

---

## 4. Plantilla de resultados (VACÍA — no ejecutada)

### 4.1 Benchmark de referencia (ESC-50, 6 clases) — `REF`

| ID | Modelo | macro-F1 | bal-acc | ECE | latency_ms | size MB | method |
|---|---|---:|---:|---:|---:|---:|---|
| MA-0 | rules-v0 | — | — | — | — | — | `rules-v0` |
| MA-1 | LogReg | — | — | — | — | — | `ml-v1` |
| MA-2 | RandomForest | — | — | — | — | — | `ml-v1` |
| MA-3 | HistGB | — | — | — | — | — | `ml-v1` |
| MA-4 | MLP | — | — | — | — | — | `ml-v1` |
| MA-5 | CNN mel | — | — | — | — | — | `ml-v1` |
| MA-6 | YAMNet+head | — | — | — | — | — | `transfer` |
| MA-7 | AST/PANNs | — | — | — | — | — | `transfer` |

### 4.2 Benchmark target (dataset propio, 9 clases) — `REAL-LOCAL`

| ID | Modelo | macro-F1 | bal-acc | ECE | per-class F1 (9) | ood_auroc | latency_ms | size MB |
|---|---|---:|---:|---:|---|---:|---:|---:|
| MA-0..7 | — | — | — | — | — | — | — | — |

### 4.3 Comparativa de calibración (plantilla)

| Modelo | ECE antes | método | ECE después | Δ |
|---|---:|---|---:|---:|
| — | — | temperature scaling | — | — |
| — | — | isotonic | — | — |

### 4.4 Cross-domain (plantilla)

| Train → Test | macro-F1 | bal-acc | Nota |
|---|---:|---:|---|
| ESC-50 → target | — | — | mide domain shift |
| target → ESC-50 | — | — | transferencia inversa |
| leave-one-place-out | — | — | generalización de sitio |

---

## 5. Criterios de ranking

Puntuación ponderada (0–100) por modelo:

| Componente | Peso | Umbral de aceptación |
|---|---:|---|
| `macro_f1` (target) | 40% | ≥ 0,80 para ML; ≥ 0,70 para rules-v0 |
| `balanced_accuracy` | 15% | ≥ 0,80 |
| `ECE` (calibración) | 15% | ≤ 0,10 |
| `latency_ms` en navegador | 10% | ≤ 250 ms por clip |
| `size MB` (offline) | 10% | ≤ 15 MB para cliente |
| `ood_auroc` | 10% | ≥ 0,80 (bucket RUIDO DESCONOCIDO) |

**Reglas duras (de gobernanza, no de precisión):**
1. Sin `validation_metrics.json` y `model_card.md` → **no existe** el modelo.
2. Un modelo entrenado **solo** con público es `REF`, aunque tenga F1 alto.
3. `confidence` de S81 = probabilidad calibrada real; `ECE > 0,15` **bloquea** la promoción.
4. `latency` de un modelo que no corre local (navegador/Edge) **no** puede ser `REAL-LOCAL` en S81.

---

## 6. FASE 5 — Recomendación de **Model V1**

### 6.1 Restricciones reales del ecosistema
- Inferencia **100% cliente** en Fase 1 acústica (`ARCHITECTURE_V1` §6.7): navegador, offline.
- Bundle actual no debe engordar (carga dinámica).
- Datos propios escasos al inicio (150–300/clase).
- Necesidad de `confidence` calibrada (sistema de honestidad).

### 6.2 Recomendación en dos niveles

**Nivel A — `ml-v1-tabular` (V1 oficial recomendado)**
- Modelo: **HistGradientBoosting (MA-3)** o **Logistic Regression (MA-1)** como fallback interpretable
  sobre `acoustic.feat.window.v2`.
- Export: **ONNX** (`skl2onnx`) → `onnxruntime-web` (WASM), carga por `import()` dinámico.
- Ventajas: entrena en minutos, **offline**, tamaño < 2 MB, `confidence` calibrable (Platt/isotonic),
  interpretable (importancias), corre sin GPU.
- Techo: limitado por features de resumen; no captura patrones finos de mel.

**Nivel B — `ml-v1-cnn-mel` (cuando haya ≥300/clase y gate superado)**
- Modelo: **CNN pequeña sobre log-mel** (entrena desde cero) **o** **YAMNet + cabeza** (transfer).
- Export cliente: TensorFlow.js / TFLite-WASM para MA-6; ONNX para CNN propia.
- Ventajas: mayor techo (RAW overlap, texturas espectrales).
- Coste: más datos, más cómputo, posible dificultad de bundle.

### 6.3 Decisión propuesta
> **V1 = `ml-v1-tabular`** por ser el único que cumple simultáneamente: offline, barato, calibrable y
> honesto con el volumen de datos inicial. **`ml-v1-cnn-mel`** se reserva para V2 tras validar el pipeline.

### 6.4 Artefactos de Model V1 (a producir en misión futura)
| Artefacto | Ruta | Versionable |
|---|---|---|
| Esquema congelado | `acoustic.feat.window.v2` en `docs/` | ✅ |
| Pesos | `runs/MA3_tabular/checkpoints/best.onnx` | ❌ (gitignore) |
| Métricas | `runs/MA3_tabular/validation_metrics.json` | ✅ (copia en docs) |
| Tarjeta | `docs/ai/model_cards/acoustic_clf_v1.md` | ✅ |
| Normalización | `mean/std` por feature (JSON) | ✅ |

### 6.5 Gate de promoción de S81

| Gate | Criterio | Resultado |
|---|---|---|
| **G-M-1** | baseline `rules-v0` reproducido y documentado | S81 = `SIM` |
| **G-M-2** | `ml-v1-tabular` supera a `rules-v0` en macro-F1 y ECE | S81 = `REAL-LOCAL` (si datos propios) |
| **G-M-3** | ECE ≤ 0,10 tras calibración | confianza creíble |
| **G-M-4** | latency ≤ 250 ms y size ≤ 15 MB en navegador | viable offline |
| **G-M-5** | `leave-one-place-out` ≥ umbral acordado | generaliza de sitio |
| **G-M-6** | dataset propio ≥150/clase (G-DS-2) | datos suficientes |

> **Sin G-M-2 ∧ G-DS-2, S81 permanece en `REF`/`SIM`.** El modelo "existe" solo si están sus artefactos.

---

## 7. Riesgos

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| DM1 | Sobreajuste al sitio/mic de grabación | 🔴 | group split por sesión/sitio + leave-one-place-out |
| DM2 | Presentar `REF` como `REAL-LOCAL` | 🔴 | gate G-M-2 + campo `source` en el modelo |
| DM3 | `confidence` sin calibrar | 🟠 | ECE obligatorio + calibración; bloqueo si >0,15 |
| DM4 | Modelo pesado rompe el bundle/offline | 🟠 | ONNX/WASM con `import()`; límite 15 MB |
| DM5 | Desbalance de clases | 🟠 | pesos de clase/sampler; benchmark balanceado |
| DM6 | OOD (RUIDO DESCONOCIDO) mal modelado | 🟠 | `ood_auroc` obligatorio; umbral de rechazo |
| DM7 | Reproducibilidad (seed, datos) | 🟡 | seed 42 + manifiestos + `config.json` |
| DM8 | Métricas M1/M2 "en prosa" se repiten | 🔴 | prohibido documentar métricas sin artefacto |

## Próximo paso

FASE 7 (`AI_ACOUSTIC_S81_INTEGRATION.md`): cómo entra el Model V1 en S81, el dashboard, el Knowledge Hub
y el ACP sin romper nada.

> **Regla final:** este documento no declara ningún ganador porque **no se ha entrenado nada**. Fija el
> tablero, las reglas y el criterio. El ganador lo dirá `validation_metrics.json`, no la narrativa.
