# SIGCTiArural — DATASET V2 READINESS REPORT (Materialización Real)

**Documento:** SIGCTIARURAL_DATASET_V2_READINESS_REPORT
**Fecha:** 2026-09-22 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `86d545e` (docs sync F1, **push completado a GitHub**)
**Tipo:** Auditoría física + planificación del camino mínimo al **Primer Benchmark Multiclase** (MISIÓN DATASET V2 — MATERIALIZACIÓN REAL).
**Modo:** SOLO LECTURA + PLANIFICACIÓN. No se implementó, no se creó código, no se modificó ningún archivo salvo este reporte, no se commiteó.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado (real/referencia/simulación/diseño). NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.

**Actualización 2026-09-23 (RECOVERY CONSOLIDATION):** el bloqueante de origen quedó **RESUELTO** — PlantVillage recuperado en `D:\RespaldoData\PlantVillage-Dataset` (54.305 archivos en `raw/color`, 38 clases, ~0.79 GB). Baseline oficial = **22.488/16/3** (delta +1.328 en `Tomato___Septoria_leaf_spot` = 1.771; 15/16 clases coinciden con el inventario). Ver `SIGCTIARURAL_DATASET_V2_RECOVERY_CONSOLIDATION.md`.

---

## 1. Estado actual real (verificado en disco, 2026-09-22)

| Dominio | Estado | Evidencia física verificada |
|---|---|---|
| **Dataset PlantVillage** | ✅ **RECUPERADO (2026-09-23)** | Copia física del repo oficial spMohanty en `D:\RespaldoData\PlantVillage-Dataset` → `raw/color` = 54.305 archivos / 38 clases / ~0.79 GB. La ruta canónica vieja (`C:\Users\Devbadolgm\...`) sigue inexistente y queda superada por la recuperación |
| **Dataset V1** | ❌ NO EXISTE | No hay directorio raíz `data/` ni `data/datasets/` |
| **Dataset V2 (bootstrap 22.488/16/3)** | 🟠 **Origen RECUPERADO; v1/ aún en 0%** | El subconjunto de 16 clases existe físicamente en el origen recuperado (suma 22.488); 0 de 10 elementos de la estructura `v1/` (data/datasets) están creados |
| **Concepto/gobernanza V2** | ✅ 100% LISTO | 5 manifests YAML verificados en `docs/ai/manifests/` (raw_source 1.459 B, curation 2.360 B, taxonomy 5.175 B, split 1.415 B, baseline 1.758 B) |
| **GO benchmark laboratorio** | ✅ GO (condicionado) | `AGRICULTURE_AI_V2_BENCHMARK_READINESS.md §5` = **GO** condicionado a materializar split + ejecutar benchmark |
| **Modelo binario heredado** | ⚠️ EXISTE pero **colapsado** | `plant_disease_mbv2.h5` (9.431.432 B, mtime 2026-08-21); colapso monoclasse (class_1 inalcanzable, conf 0.99 incluso en no-planta) |
| **Runtime Docker** | ⚠️ **Desktop apagado HOY** | `docker ps` falla: daemon no arrancado (en sesión previa: postgres Up, backend Up en 8010; hoy sin stack) |
| **Disco C:** | ⚠️ 19.9 GB libres | Suficiente para dataset (~1–2 GB) y entrenamientos, pero estrecho para cachés TF/pipelines largos |

**Lectura global:** el diseño (manifiestos + taxonomía + label schema + split spec + benchmark GO) está **completo al 100%**; la materialización física de `v1/` sigue en **0%**. El bloqueante de origen quedó **RESUELTO** (2026-09-23); el siguiente paso real es copiar las 16 clases a `v1/RAW/` con checksum.

---

## 2. Activos reales encontrados (verificado)

### Modelos / pesos / checkpoints
| Artefacto | Ruta | Bytes | Estado |
|---|---|---|---|
| `plant_disease_mbv2.h5` | `src/ai_models/production_models/` | 9.431.432 | Único modelo entrenado; binario degenerado (control negativo histórico) |
| `model_metadata.json` | ídem | 65 | `{"classes":["enferma","sana"],"framework":"tensorflow_fixed"}` |
| `test_leaf.jpg` | `src/ai_models/` | 1.413 | Imagen de prueba manual |
| Checkpoints adicionales | — | — | **NADA más** (0 checkpoints, 0 `.keras`, 0 pesos multiclase) |
| Modelos benchmark V2 (4 arquitecturas) | — | 0 | Solo diseño en manifiesto; **cero corridas** |

### Pipelines / scripts / entrenamiento / benchmark
| Artefacto | Ruta | Bytes | Estado |
|---|---|---|---|
| `train_plant_disease_mobilenet.py` | `src/ai_models/` | 3.443 | Script de entrenamiento (binario heredado) |
| `prepare_plant_disease_dataset.py` | `src/ai_models/notebooks/` | 4.405 | Preparador de dataset (genérico, no V2) |
| `train_plant_disease_mobilenet.py` (notebooks) | `src/ai_models/notebooks/` | 2.340 | Variante de entrenamiento |
| `plant_disease_training.ipynb` | `src/ai_models/notebooks/` | **0** | **VACÍO** (0 bytes) — citado en inventory como "2.3 KB"; el contenido real vive en los `.py` |
| `fastapi_app.py` | `src/ai_models/` | 15.488 | Servicio de inferencia HTTP (FastAPI/TF) |
| Scripts de split/dedup/pHash | — | — | **NO EXISTEN** (solo especificación split_v1) |
| Scripts de benchmark (EfficientNet-B0 / MobileNetV3 / ResNet50 / ConvNeXt-Tiny) | — | — | **NO EXISTEN** |
| Framework de métricas (macro-F1, ECE, curvas) | — | — | **NO EXISTE** (solo espec en manifiesto) |
| Pipeline de entrenamiento V2 (`AI_TRAINING_PIPELINE_V2.md`) | `docs/ai/research_v2/` | — | Diseño; sin código executable |

**Resumen de activos:** gobernanza y especificación V2 (5 manifests + 18 docs research_v2) + 1 modelo heredado degenerado + 3 scripts de entrenamiento heredados + servicio de inferencia. **Cero** infraestructura de materialización/benchmark V2.

---

## 3. Activos faltantes (el gap completo)

| # | Activo faltante | Impacto |
|---|---|---|
| 1 | **PlantVillage `raw/color` (22.488/16/3)** | ✅ **RESUELTO (2026-09-23)** — origen recuperado en `D:\RespaldoData\PlantVillage-Dataset`; el subset de 16 clases suma 22.488. Pendiente: copia a `v1/RAW/` + checksum |
| 2 | Credencial Kaggle/mirror para descargar (#1) | 🔴 Bloqueante para la vía más corta (dataset público) |
| 3 | `data/datasets/` + árbol `v1/` (10 elementos) | 🔴 Sin estructura no hay materialización |
| 4 | `labels_v1.csv` (22.488 filas, 8 campos) | 🔴 Sin etiquetas no hay split |
| 5 | Dedup exactos + pHash (anti-fuga) | 🔴 Gate de calidad del split |
| 6 | `split_lists/{train,validation,test}.csv` (70/15/15, seed 42) | 🔴 Sin split no hay benchmark comparable |
| 7 | `curated/{train,validation,test}/` físico | 🟠 Entrada directa de entrenamiento |
| 8 | `dataset_card.md`, `CHECKSUMS.sha256`, `split_report.md`, `holdout/` | 🟠 Trazabilidad/integridad científica |
| 9 | Script de entrenamiento benchmark (4 arquitecturas) | 🟠 No existe ninguno |
| 10 | Script de métricas (macro-F1, ECE, ROC/PR/calibración) | 🟠 No existe ninguno |
| 11 | Entorno reproducible (TF pinned, seed 42, GPU desc.) | 🟠 No materializado |
| 12 | `plant_disease_training.ipynb` con contenido (0 B) | 🟡 En inocuidad; el `.py` sí existe |

**Lo que NO falta (ya existe y se reutiliza):** taxonomía_v1, label_schema_v1, split_spec, 5 manifests, benchmark GO, política de entrenamiento (weighted loss + class-balanced + minority-augmented), decisión de métricas (macro-F1 primaria, ECE puerta).

---

## 4. Riesgos (actualizados al 2026-09-22)

| Riesgo | Clase | Severidad | Mitigación |
|---|---|---|---|
| El raw PlantVillage no estaba en máquina conocida (RESUELTO 2026-09-23) | ~~CRÍTICO~~ → ✅ | ✅ Recuperado en `D:\RespaldoData\PlantVillage-Dataset` | Copiar 16 clases a `v1/RAW/`; verificar contra `raw_source_manifest` (22.488/16, exclusions) |
| Sin `.kaggle/kaggle.json` → no hay descarga automática | ALTO | 🟠 Retrasa Fase 0 | Bernardo crea cuenta/API key (o mirror alternativo) |
| **Docker Desktop apagado hoy** | ALTO | 🟠 No hay runtime para verificar nada | Re-arrancar Docker antes de ejecutar; registrar estado en AGENTS si se reactiva |
| Disco C: 19.9 GB libres | MEDIO | 🟠 Ajustado para pipelines | Dataset ~1–2 GB viable; limpiar antes de entrenar (TF+datos+cachés) |
| `plant_disease_training.ipynb` = 0 B (inconsistencia vs inventory 2.3 KB) | MEDIO | 🟡 Confusión de fuente | Registrar en este reporte; usar los `.py` como fuente real |
| Mezclar `raw/grayscale`/`segmented` si se descarga el completo | ALTO | 🟠 Invalida benchmark | Regla del manifiesto: SOLO `raw/color` |
| Fuga near-dup en split | ALTO | 🟠 Invalida métricas | pHash + dedup, gate bloqueante |
| Limpieza de datos mal hecha (doble muestreo de `ImagenesDx.csv` etc.) | BAJO | 🟡 Error de fuentes | Usar únicamente la vía del manifiesto |

---

## 5. Estructura de carpetas a crear (definitiva, del Execution Plan §2)

```
data/
└── datasets/
    └── agriculture_images_tomato-potato-corn/
        └── v1/
            ├── RAW/                          # copia inmutable raw/color (16 carpetas clase)
            ├── curated/
            │   ├── train/     (70%)
            │   ├── validation/(15%)
            │   └── test/      (15%)
            ├── split_lists/
            │   ├── train.csv
            │   ├── validation.csv
            │   └── test.csv
            ├── labels/
            │   └── labels_v1.csv
            ├── holdout/
            │   └── real_world_holdout_v1/    # vacía e intocable
            ├── manifests/                    # copia de los 5 YAML (hash = canónico)
            ├── dataset_card.md
            ├── split_report.md
            └── CHECKSUMS.sha256
```

**Estado hoy del árbol: 0 de 10 elementos existe** (ni siquiera `data/`). No se versiona por git (binarios); se versiona por manifiesto + checksum (regla MLOps del MASTERPLAN §9).

---

## 6. Camino mínimo al PRIMER BENCHMARK MULTICLASE

**Ecuación del problema:** el benchmark multiclase necesita `curated/` + script de benchmark + métricas; `curated/` necesita `split_lists/`; `split_lists/` necesita `labels_v1.csv`; `labels_v1.csv` necesita `RAW/`; `RAW/` necesita **descargar PlantVillage** (único paso no automatizable hoy).

**Ruta mínima (secuencial, irreversible):**

| Fase | Pasos | Requiere | Salida |
|---|---|---|---|
| **F0 Adquisición** | 1. Verificar origen recuperado (`D:\RespaldoData\PlantVillage-Dataset`) → 2. Copiar 16 clases a `v1/RAW/` → 3. Conteo 22.488/16 → 4. Exclusiones ausentes → 5. `CHECKSUMS.sha256` | Gobernanza (raw_source_manifest: `expected_images` 21160 → actualizar) | `v1/RAW/` verificado |
| **F1 Curation** | 7. Copiar 5 manifests a `v1/manifests/` → 8. `labels_v1.csv` (16 clases, 8 campos) → 9. Marcar 4 clases minoritarias `double_reviewed` | F0 | Etiquetas trazables |
| **F2 Split** | 10. Dedup exactos → 11. pHash near-dup → 12. `split_v1` 70/15/15 seed 42 → 13. Gates (clases en 3 particiones, 0 fugas) → 14. `split_report.md` | F1 | `split_lists/*.csv` |
| **F3 Materialización** | 15. `curated/{train,val,test}/` → 16. `dataset_card.md` → 17. reservar `holdout/` | F2 | `curated/` listo |
| **F4 Benchmark** | 18. Entorno TF pinned + seed 42 → 19. EfficientNet-B0 → 20. MobileNetV3-Large (+TFLite) → 21. ResNet50 → 22. ConvNeXt-Tiny → 23. Control MobileNetV2 en test | F3 + GPU/CPU declarada | macro-F1 + ECE por modelo |
| **F5 Evaluación** | 24. métricas CSV → 25. curvas ROC/PR/calibración → 26. `benchmark_report.md` + `calibration_report.md` → 27. decisión baseline master+edge | F4 | **Primer Benchmark Multiclase publicado** |

**Horizonte:** F0 es la única dependiente de decisión humana (días). F1–F5 son mecánicas una vez existe RAW (horas/semana). Total práctico al primer benchmark con dataset materializado: **~1 semana hábil** tras la descarga (con GPU RTX 3060–4070, 1–10 h/modelo según manifiesto).

**Restricción dura (invariante):** el camino NUNCA mezcla `grayscale`/`segmented`/`generated_for_paper`/clase Spider-mite; el split es inmutable (`split_v1`); el `holdout` nunca se usa en entrenamiento; el resultado se publica como **bootstrap de laboratorio**, jamás como validez de campo.

---

## 7. Respuestas a la misión

1. **Estado actual real:** diseño V2 100% listo (manifiestos, GO), materialización física de `v1/` **0%**, **origen PlantVillage RECUPERADO el 2026-09-23** (`D:\RespaldoData\PlantVillage-Dataset`, 22.488/16/3), Docker apagado hoy. Único modelo = binario colapsado. Push documental completado (HEAD `86d545e`).
2. **Activos reales encontrados:** 5 manifests YAML, 18 docs research_v2, `plant_disease_mbv2.h5` + metadata + `test_leaf.jpg`, 3 scripts de entrenamiento heredados, servicio FastAPI de inferencia. **Nada** de dataset, split, benchmark o checkpoints.
3. **Activos faltantes (actualizado 2026-09-23):** el origen ya NO falta (recuperado); restan: árbol `data/datasets/v1` completo (RAW materializado), labels, split, curated, scripts de benchmark y métricas, entorno TF reproducible.
4. **Riesgos:** bloqueante crítico del raw; sin credencial Kaggle; Docker apagado hoy; disco C. 19.9 GB; notebook VACÍO (0 B) que el inventory citó con 2.3 KB.
5. **Siguiente tarea concreta (actualizada 2026-09-23):** **FASE 0 — usar el origen ya recuperado**: verificar `D:\RespaldoData\PlantVillage-Dataset\raw\color` (54.305/38) y **copiar las 16 clases del scope → `data/datasets/agriculture_images_tomato-potato-corn/v1/RAW/`** con conteo 22.488/16 y exclusions cero; **actualizar `expected_images` del `raw_source_manifest` a 22488** (decisión gobernada). Sin Kaggle ni descarga.
6. **Camino mínimo:** F0 adquisición (Bernardo) → F1 curation → F2 split → F3 materialización → F4 benchmark 4 arquitecturas + control MobileNetV2 → F5 publicación `benchmark_report.md` (ruta completa en §6).

---

## 8. PREGUNTA FINAL — siguiente trabajo técnico real

### Respuesta: **Opción A — Materializar Dataset V2** — con FASE 0 de adquisición como su primer sub-paso

**Justificación técnica:**

1. **Es el único eslabón que destraba en cascada.** Sin dataset físico no hay labels → no hay split → no hay curated → no hay entrenamiento (B) → no hay benchmark (C). B y C son **consecuencias directas** de completar A; intentar B o C primero es imposible (no existe data de entrada).
2. **El GO ya está otorgado** (`BENCHMARK_READINESS §5`); lo único que separa a SIGCTiArural del primer resultado medible es **el artefacto físico ausente** (cuello de botella = DATA, confirmado por `AI_ML_STATE_OF_THE_ART §9`).
3. **Maximiza retorno por esfuerzo:** manifiestos, taxonomía, split spec y política de entrenamiento ya están resueltos — la inversión va íntegra al primer eslabón que produce **evidencia reproducible** (requisito ADSO y base de MLOps real).
4. **El sub-paso F0 es accionable HOY por Bernardo** (credencial Kaggle/mirror). Una vez descargado el raw, F1–F5 son mecánicas (una IA asistida completa sets/splits/benchmark con los scripts a crear en fase de implementación). Retrasar A solo pospone B, C y el reemplazo del binario colapsado.
5. **No es B/D por cuello de botella:** entrenar el primer modelo (B) está en el orden de ~7 días después de A, y "preparar benchmark" (C) es un subproducto de A (necesita dataset + split + scripts). Elegir B o C sin A = elegir un resultado que depende de A.

**Decisión final: A — materializar el Dataset V2, comenzando por la FASE 0 (adquisición del raw PlantVillage + credencial Kaggle/mirror).** Entrenamiento (B) y benchmark (C) se ejecutan en cascada inmediatamente después, según la ruta mínima de §6.

---

*Reporte de readiness de materialización Dataset V2. Modo SOLO LECTURA + PLANIFICACIÓN: sin implementación, sin código, sin modificación de archivos (solo creación de este reporte), sin commits.*