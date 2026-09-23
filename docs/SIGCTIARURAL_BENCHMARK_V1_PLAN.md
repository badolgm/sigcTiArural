# SIGCTiArural — Benchmark V1 Plan (Diseño del Benchmark Oficial)

**Documento:** SIGCTIARURAL_BENCHMARK_V1_PLAN
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `5a079f4`
**Tipo:** Diseño del benchmark oficial del Dataset V2 Recuperado (22.488/16/3). **SOLO DISEÑO — NO se entrena, NO se ejecuta ningún modelo.**
**Modo:** NO modificar Dataset V2, NO modificar manifiestos canónicos v1, NO hacer commits.
**Fuente rectora:** `baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml` · `taxonomy_binding_manifest` · `split_report.md` (seed 42, 70/15/15).

---

## 0. Identidad del benchmark

| Atributo | Valor |
|---|---|
| **experiment_id** | `agriculture_v2_baseline_v1` |
| **dataset** | `agriculture_images_tomato-potato-corn` v1 (22.488 / 16 clases / 3 especies) |
| **Split** | train 15.741 · validation 3.373 · test 3.374 (seed 42, stratified por clúster) |
| **Inputs** | `curated/train|validation|test/` (copias físicas, RAW congelado intocado) |
| **Estado honestidad** | benchmark = `diseño` hasta ejecución; resultados serán `real` solo tras ejecutar |
| **Regla de oro** | el **test set se toca UNA sola vez al final** (prohibido iterar contra él) |

---

## 1. Arquitecturas oficiales (5)

| n | Arquitectura | Rol oficial (/fuente) | Parámetros aprox. | Coste rel. entreno |
|---|---|---|---|---|
| 1 | **EfficientNet-B0** | **baseline_master_candidate** (manifiesto §16) | ~5.3M | media |
| 2 | **MobileNetV3-Large** | **baseline_edge_candidate** (manifiesto §16, edge_policy) | ~5.5M | baja |
| 3 | **ResNet50** | **classic_control** (manifiesto §16) | ~25.6M | media-alta |
| 4 | **ConvNeXt-Tiny** | **experimental_ceiling** (manifiesto §16) | ~28.6M | alta |
| 5 | **MobileNetV2** | **control clásico (Control)** — ADD by esta misión | ~3.4M | baja |

**Nota de gobernanza (desviación explícita):** el manifiesto define 4 arquitecturas; esta misión añade MobileNetV2 como **control clásico de referencia** (costo mínimo, diagnóstico de pipeline). No se toca el manifiesto hoy; la incorporación al `baseline_experiment_manifest` queda **pendiente de decisión de Bernardo** y se registrará aparte.

**Pesos:** todos con pretrained ImageNet (transfer_learning=true, manifiesto §27).

---

## 2. Métricas oficiales

Primaria (manifiesto §34): **macro-F1**.

| Métrica | Descripción | Rol |
|---|---|---|
| **macro-F1** | media no ponderada de F1 por clase (una clase minoritaria vale igual) | **PRIMARIA** |
| **balanced_accuracy** | media de recall por clase | secundaria clave |
| **per_class_precision / per_class_recall** | tabla 16×2 (por clase) | diagnóstico de minoritarias |
| **weighted_f1** | F1 ponderado por soporte (perspectiva global) | secundaria |
| **confusion_matrix** | matriz 16×16 (por partición) | análisis de confusión entre especies |
| **ECE** (expected_calibration_error) | error de calibración de la probabilidad | **calibración** (§47) |
| **roc_one_vs_rest + pr_curve_per_class + calibration_curve** | curvas requeridas (manifiesto §42-45) | reporte completo |

**Punto de decisión (honestidad):** con dataset de laboratorio relativamente saturado, la diferencia de macro-F1 entre top arquitecturas suele ser pequeña; **el factor de discriminación final será ECE + coste edge**, no solo F1.

---

## 3. Estrategia de entrenamiento

### 3.1 Preprocesamiento (fijo para las 5)
- Resize a **224×224** (manifiesto §26) con interpolación bilineal.
- Normalización imagen-wise (no dataset-wise) por estrategia del pretrained (ImageNet mean/std).
- Mezcla de flips horizontales/verticales + rotación (±15°) + color jitter + scale-crop (receta estándar de laboratorio), **sin usar metadatos de clase como input**.

### 3.2 Clase balanceada (manifiesto §28-31 — 3 técnicas, en orden de prioridad)
1. **weighted_loss** (cross-entropy con pesos $w_c=\frac{N}{n_c \cdot |C|}$).
2. **class_balanced_sampling** (muestreo por clase con igual probabilidad por lote).
3. **minority_augmented_sampling** (sobre-muestreo aumentado de las 4 minoritarias: potato__healthy 152, tomato__mosaic_virus 373, corn__cercospora_gray_leaf_spot 513, tomato__leaf_mold 952).

### 3.3 Optimizador y schedule (idéntico en las 5 → comparabilidad justa)
- AdamW · lr inicial **3e-4** · weight decay **1e-4**.
- **Cosine annealing** + warmup 3 epochs.
- **Batch 64** (reducir a 32 si VRAM límite) — batch y seed iguales entre modelos.
- **Epochs 40** con **early stopping** en macro-F1 de validation, **patience 8**, restore best.
- Rotación de seed con `random_state=42` (mismo que split) para reproducibilidad.

### 3.4 Protocolo anti-sobreajuste al test
- El **test set queda congelado**: se usa exclusivamente al final para el reporte oficial.
- Toda decisión (early stop, lr, augment) se toma SOLO con validation.
- Determinismo: fijar seeds de numpy/torch/random y `cudnn.deterministic`.

### 3.5 Registro
- Por modelo: metrics finales, curvas, matrices, tiempos, hardware, config SHA.
- Se guardan: `checkpoints/best_{model}.pth` + `state_dict`, no solo finales.
- Checkpoint del **control MobileNetV2 primero** (sanity) se conserva como trazabilidad de pipeline.

### 3.6 Guard-rails
- Verificación previa: `labels_v1.csv`↔`curated`↔`split_lists` (ya validado 22.488/22.488 en B4).
- Sanity al arrancar: 1 epoch corto sobre 4 mini-batches de cada clase para detectar errores de class balancing antes de rollout completo.

---

## 4. Tiempo estimado (GPU)

Estimación por modelo (batch 64 · AMP · 15.741 train · 40 epochs incl. early-stop promedio ~28 epochs):

| GPU tier | MobileNetV2 (control) | MobileNetV3-Large | EfficientNet-B0 | ResNet50 | ConvNeXt-Tiny | **Total 5** |
|---|---|---|---|---|---|---|
| RTX 3060/3050 (~13 TFLOPS) | ~45 min | ~60 min | ~75 min | ~95 min | ~120 min | **~4.5–6 horas** |
| RTX 4070/4060 (~20 TFLOPS) | ~30 min | ~40 min | ~50 min | ~65 min | ~85 min | **~2.5–3.5 horas** |
| RTX 3090/A5000 (~35 TFLOPS) | ~18 min | ~25 min | ~32 min | ~42 min | ~55 min | **~1.5–2 horas** |

*Orden de magnitud; incluye evaluación en validation en cada epoch. En CPU (sin GPU) NO es viable (estaríamos en días/semana) — desestimado.*

---

## 5. Requisitos GPU

| Modelo | VRAM mínima (batch 64 · AMP) | VRAM cómoda (batch 128) |
|---|---|---|
| MobileNetV2 | 3–4 GB | 4 GB |
| MobileNetV3-Large | 4–5 GB | 6 GB |
| EfficientNet-B0 | 5–6 GB | 8 GB |
| ResNet50 | 7–9 GB | 12 GB |
| ConvNeXt-Tiny | 9–12 GB | 16 GB |

**Recomendación:** GPU con **≥ 12 GB VRAM** (p. ej. RTX 3060 12GB o superior) para correr los 5 con holgura. Con 8 GB: bajar batch a 32. Software: PyTorch + CUDA, FP16 AMP activado.

---

## 6. Resultados esperados

Rangos esperados **en validation** (referencia de literatura + saturación típica de PlantVillage en 16 clases sobre imágenes de hoja):

| Arquitectura | macro-F1 esperado (val) | ECE esperado | Observación |
|---|---|---|---|
| ConvNeXt-Tiny | 0.985 – 0.995 | 0.02 – 0.05 | candidato a ceiling |
| EfficientNet-B0 | 0.975 – 0.985 | 0.03 – 0.06 | baseline master |
| ResNet50 | 0.970 – 0.980 | 0.03 – 0.06 | control clásico |
| MobileNetV3-Large | 0.960 – 0.975 | 0.04 – 0.07 | edge candidate |
| MobileNetV2 | 0.955 – 0.970 | 0.04 – 0.08 | control |

**Advertencia honesta:**
- Es dataset de **laboratorio** (imágenes de hoja en fondo controlado) → SATURADO: todos pueden quedar muy cerca **entre sí**.
- El resultado **NO es validez de campo** (invariante de honestidad).
- Decisión final: **mejor balance macro-F1 + menor ECE + coste edge**, no solo mejor F1.
- Interestante a reportar: comportamiento de las **4 minoritarias** (se espera sean las de mayor contribución de error).

---

## 7. Orden de entrenamiento y justificación

**Primer modelo: MobileNetV2 (Control).**

**¿Por qué?**
1. **Coste mínimo** → valida el pipeline completo (preprocesado, balanceo, split, registro) ante de invertir horas en arquitecturas pesadas (fracción del coste si hay que corregir algo).
2. **Referencia clásica estable**: establece la **cota base (lower bound)** de macro-F1 del conjunto sobre el que comparar a las 4 oficiales.
3. Detección temprana de **fugas o errores de distribución** (if el control produce F1 ≥ 0.99 ya sobre val, sospecha de lógica de balanceo/información filtrada).
4. Es chekpoint de **sanity** del propio manifiesto (§3.6): 1 reviewer con peso, diagnostica sin esperar costes altos.

**Secuencia sugerida completa:**
1. **MobileNetV2 (control)** → sanity + línea base económica.
2. **EfficientNet-B0 (baseline_master_candidate)** → el benchmark oficial #1, promovible a baseline del proyecto.
3. **MobileNetV3-Large (edge candidate) + ResNet50 (classic_control)** → corroboran frontera edge/clásica.
4. **ConvNeXt-Tiny (experimental_ceiling)** → techo de capacidad al final (el más caro; solo tras validar pipeline).

---

## 8. Reportes a generar tras ejecución (diseño)

- `benchmark_report.md` (tabla macro-F1/ECE por modelo, ganador ponderado)
- `calibration_report.md` (ECE + temperature scaling por modelo)
- `error_analysis_report.md` (foco 4 minoritarias)
- `model_cards/confusion_matrices/curves/{roc,pr,calibration}/`
- Activos de decisión: promoción de `baseline_master_candidate` + `baseline_edge_candidate` finales.

---

## 9. RESPONDE la misión

**1-6 definidos** en secciones §1–§6.

**Primer modelo a entrenar: MobileNetV2 (Control).**
Razón operativa honesta: ilumina el pipeline completo (preprocessing→balanceo→split→registro) al coste mínimo, fija la cota base del conjunto, detecta fugas/distorsiones temprano y deja constancia de sanity antes de gastar horas en las 4 arquitecturas oficiales; EfficientNet-B0 (baseline_master_candidate) le sigue como primer resultado oficial promovible.

---

*Diseño del benchmark oficial `agriculture_v2_baseline_v1`. Modo SOLO DISEÑO: sin entrenamiento, sin ejecución, sin modificación del Dataset V2 ni manifests. Ejecución en misión operativa separada, con decisión de Bernardo (incl. GPU a usar y aprobación de añadir MobileNetV2 al manifiesto).*