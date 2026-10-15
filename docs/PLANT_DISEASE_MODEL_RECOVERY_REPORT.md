# PLANT_DISEASE_MODEL_RECOVERY_REPORT

**Misión:** `PLANT_DISEASE_MODEL_RECOVERY`
**Modo:** SOLO DIAGNÓSTICO (read-only). **NO** se modificó, entrenó ni generó ningún modelo.
**Fecha:** 2026-10-13
**HEAD:** `9109050` (`feat(frontend): complete officialization phases 1 and 2`)
**Artefacto diagnosticado:** `src/ai_models/production_models/plant_disease_mbv2.h5` (9 431 432 B)
**Servicios usados:** `ai_service` (contenedor, `:8081`) para inspección read-only del modelo en caliente.
**Clasificación final:** **`MODEL_RETRAIN_REQUIRED`** (ver §H)

> Regla suprema aplicada: NADA DESAPARECE · honestidad de estado. Este reporte **no** implementa, entrena ni genera modelos; solo diagnostica con evidencia verificable.

---

## 0. Resumen ejecutivo

El modelo `plant_disease_mbv2.h5` es una **sonda lineal** (backbone MobileNetV2 **congelado** con pesos ImageNet + cabeza `Dense(2)` entrenable) que **colapsa a `class_0`** para cualquier entrada. La inspección en caliente confirma:

- Solo **2 562** parámetros son entrenables (la cabeza); **2 257 984** están congelados (backbone).
- La cabeza fue entrenada con **`epochs=3`** (script de producción), sobre un dataset **bidimensional `{enferma, sana}`** que **ya no existe en disco**.
- **No hay métricas, `history`, ni `model_card`** que documenten la corrida.
- La doble normalización detectada en la auditoría IA (y corregida en F4) **no es la causa de la degeneración**; es un bug real ya resuelto, pero persiste el colapso → el problema es de **pesos**, no de preprocesado ni de configuración.

**No hay corrección de inferencia/config que restaure la discriminación.** La única vía es **reentrenar** la cabeza (y opcionalmente afinar el backbone). La arquitectura y el backbone son correctos ⇒ **no** requiere rebuild.

---

## 1. Metodología (read-only, reproducible)

1. Inspección del modelo en contenedor vía `ai_service` (`PYTHONPATH=/app`, import de `fastapi_app`), sin escribir en el repo:
   - `count_params()`, `trainable_weights`/`non_trainable_weights`.
   - Recorrido de capas y `trainable` flags.
   - Pesos de la capa `Dense` final (kernel/bias).
2. Búsqueda exhaustiva de artefactos de entrenamiento en host: dataset, `.h5`/`.keras`, `metrics/history/model_card/*.json`.
3. Lectura de los **dos** scripts de entrenamiento y del preparador de dataset.
4. Contraste con el dataset canónico de agricultura (`data/datasets/agriculture_images_tomato-potato-corn/v1`).

Ningún archivo del repo fue modificado; la sonda se ejecutó desde `/tmp` del contenedor y se eliminó.

---

## 2. Evidencia — anatomía del modelo (inspección en caliente)

| Atributo | Valor verificado |
|---|---|
| Parámetros totales | **2 260 546** |
| Parámetros entrenables | **2 562** (solo cabeza) |
| Parámetros no entrenables | **2 257 984** (backbone congelado) |
| Nº de capas (top-level) | 6 |
| Arquitectura | `InputLayer → Rescaling → Functional(mobilenetv2_1.00_224) → GlobalAveragePooling2D → Dropout → Dense` |
| `Rescaling` (interna) | `scale ≈ 0.00784313725490196` (=1/127.5), `offset = -1` → **espera entrada en [0,255]** |
| `Dropout` | 0.2 |
| `Dense` final | `units=2`, `activation=softmax`; kernel `(1280,2)`, `‖kernel‖=3.3752`, bias `[+0.0148, -0.0148]` |
| `backbone.trainable` | **`False`** |
| Flags de cabeza | `GlobalAveragePooling2D:True · Dropout:True · Dense:True` |
| Clases declaradas (`model_metadata.json`) | `["enferma","sana"]` (binario), `framework: "tensorflow_fixed"` |

**Lectura del sesgo de la cabeza:** kernel de norma pequeña (3.3752 sobre 2 560 pesos ⇒ RMS ≈ 0.067) y sesgo casi nulo (±0.0148). Es una cabeza **débilmente ajustada** cuya separación no logra cruzar la frontera de decisión para las clases → coherente con el colapso observado.

---

## 3. Evidencia — degeneración funcional (heredada de F4)

Tras corregir la doble normalización (F4), con `pre_range = 0.0–255.0` confirmado:

| Entrada sintética | `argmax` | Conducta |
|---|---|---|
| rojo | class_0 | sin cambio |
| azul | class_0 | sin cambio |
| blanco | class_0 | sin cambio |
| negro | class_0 | sin cambio |

Cuatro entradas de espectro visual opuesto producen **la misma clase** con alta confianza (≈0.80–0.99). No hay discriminación: el modelo no separa el espacio de entrada. La prueba E2E oficial (`:8010` → `:8081`) clasifica `test_leaf.jpg` como `class_0` (conf ≈0.9555) con `scientific_scope: binary_only`.

---

## 4. Evidencia — procedencia del modelo (script, dataset, métricas)

### 4.1 Existen DOS scripts de entrenamiento divergentes

| Script | Preprocesado | `epochs` default | Guarda metadata |
|---|---|---|---|
| `src/ai_models/train_plant_disease_mobilenet.py` (3443 B) | **`Rescaling`** interna (espera [0,255]) | **3** | **Sí** (`tensorflow_fixed`) |
| `src/ai_models/notebooks/train_plant_disease_mobilenet.py` (2340 B) | `mobilenet_v2.preprocess_input` (espera [-1,1]) | 5 | No |

El `model_metadata.json` del artefacto declara `framework: "tensorflow_fixed"`, etiqueta emitida **únicamente** por el primer script ⇒ el modelo productivo proviene de la variante **`Rescaling` + `epochs=3`**. Esto valida que la corrección F4 (eliminar la segunda normalización) es **coherente con el contrato de entrenamiento del modelo**. La divergencia entre ambos scripts es un riesgo de gobernanza (§F).

### 4.2 El dataset de entrenamiento NO existe

- El script de producción por defecto usa `data/datasets/plant_disease/{train,val}`.
- **`data/datasets/plant_disease` NO EXISTE.** Búsquedas por `plant_disease`, `enferma`, `sana`, `PlantVillage` en el repo no lo ubican.
- El origen externo `D:\RespaldoData\PlantVillage-Dataset` **tampoco está disponible** (`Test-Path` = `False`).
- Existe **otro** dataset canónico: `data/datasets/agriculture_images_tomato-potato-corn/v1` → **16 clases** (`species__condition`), **22 488 imágenes** en `RAW/`, con `curated/{train,validation,test}`, `labels/labels_v1.csv` (4.67 MB) y 8 manifiestos. **Su taxonomía es multiclase, NO la binaria `{enferma,sana}` del modelo.** Es una fuente distinta y no es el insumo de la corrida degenerada.

> Conclusión de procedencia: el modelo se entrenó sobre un dataset binario que **ya no existe** y cuya naturaleza/distribución es **irreconstruible desde el repo**.

### 4.3 No hay métricas ni trazabilidad de la corrida

Búsqueda de `*metrics*.json`, `history`, `model_card`, `val*`, `report*` → **0 hallazgos**. La corrida no dejó evidencia cuantitativa (accuracy, loss, matriz de confusión, balance de clases). Incumple el invariante del ecosistema "sin `validation_metrics.json` + `model_card.md` un modelo NO existe".

---

## 5. Análisis — por qué colapsa

1. **Cabeza entrenable mínima + entrenamiento insuficiente.** Con el backbone congelado, `Dense(2)` es una regresión logística sobre features ImageNet; `epochs=3` es insuficiente para converger la frontera, máxime con clases potencialmente desbalanceadas.
2. **Backbone congelado es correcto en principio.** MobileNetV2/ImageNet es un extractor válido; no es la causa.
2. **Sesgo de clase mayoritaria.** `argmax=class_0` constante es el patrón clásico de una cabeza que aprendió a predecir la clase mayoritaria (o una frontera degenerada) por desbalance y/o pocas épocas.
3. **No es el preprocesado.** F4 eliminó la doble normalización (bug real) y el colapso persistió ⇒ descarta la normalización como causa raíz de la degeneración (era causa de un factor ~[-1,−1] de error de escala, ya resuelto).
4. **No hay recuperación por inferencia.** Ningún umbral, temperatura, reordenación de clases ni cambio de config convierte una cabeza colapsada en discriminante: el problema está en los **pesos**.

---

## 6. Respuestas A–H

**A) Naturaleza y alcance del daño.**
Daño localizado: **solo la cabeza de clasificación** (2 562 params) es degenerada. El backbone (2.26 M params, ImageNet) está **intacto** y el archivo `.h5` **carga correctamente**. No hay corrupción de archivo ni error de arquitectura.

**B) Causa raíz.**
Entrenamiento insuficiente de la cabeza sobre un dataset binario **hoy inexistente**: `epochs=3`, backbone congelado, sin evidencia de balanceo ni clases ponderadas, sin métricas. La doble normalización (bug real, corregido en F4) **no es** la causa de la degeneración.

**C) ¿Recuperable sin reentrenar?**
**NO.** No existe ajuste de inferencia, umbral, temperatura, orden de clases o configuración que restaure la discriminación: los pesos de la cabeza son degenerados. La única vía es reentrenar la cabeza.

**D) ¿Rebuild?**
**NO requiere rebuild.** La arquitectura (MobileNetV2 + GAP + Dropout + Dense softmax) es correcta y estándar; el backbone es pesos ImageNet válidos; el archivo es legible.

**E) Reentrenamiento mínimo viable.**
Reentrenar **solo la cabeza** (backbone congelado) sobre un dataset binario `{enferma,sana}` **balanceado**, con:
- `epochs` ≥ 20 con *early stopping* (paciencia 3–5) sobre `val_loss`;
- `class_weight` balanceado (o muestreo balanceado);
- `Adam lr=1e-3`;
- guardado obligatorio de `validation_metrics.json` + `model_card.md`.

Dado que el dataset de la corrida no existe, el **insumo mínimo** debe reconstruirse. Vía reproducible disponible en el repo: derivar el binario desde el dataset canónico de 16 clases (`data/datasets/.../v1`), mapeando `*__healthy → sana` y el resto `→ enferma` (2 clases), o usar la fuente PlantVillage oficial si Bernardo la reubica.

**F) Épocas e hiperparámetros recomendados.**
- **Sonda lineal (backbone congelado):** `epochs` **20–30** con early stopping, `lr=1e-3`, `class_weight`, `batch_size=32`.
- **Opción afinado:** congelar todo menos el último bloque de MobileNetV2 y entrenar **5–10** épocas a `lr=1e-4` → mejor separación a bajo costo.

**G) Cambios mínimos vs ideales.**
- **Mínimo:** reconstruir dataset binario balanceado + reentrenar cabeza + emitir métricas/card. Costo de cómputo bajo (head-only con features cacheadas ≈ minutos en CPU; con generadores ≈ 1–3 h).
- **Ideal:** consolidar **un único** script y **un único** contrato de preprocesado (hoy hay dos divergentes), reconstruir el binario de forma determinista desde el dataset canónico, añadir evaluación + calibración + `model_card`, y alinear con el pipeline de benchmarks del ecosistema (M1/M2). Considerar si se quiere un modelo **16-clases** (alineado al dataset canónico y a M1/M2) en lugar de binario.

**H) Clasificación y veredicto.**
**`MODEL_RETRAIN_REQUIRED`.** La cabeza está degenerada y no es recuperable sin entrenamiento; la arquitectura/backbone son válidos y el archivo carga ⇒ no es `MODEL_REBUILD_REQUIRED`; los pesos no admiten corrección sin entrenamiento ⇒ no es `MODEL_RECOVERABLE`.

---

## 7. Los 9 puntos de análisis (consolidado)

| # | Punto | Dictamen |
|---|---|---|
| 1 | Naturaleza del daño | Cabeza `Dense(2)` colapsada; archivo y backbone sanos |
| 2 | Causa raíz | `epochs=3` sobre dataset binario ausente/desbalanceado |
| 3 | ¿La normalización? | Bug real (corregido en F4), **descartado** como causa del colapso |
| 4 | ¿Corrupción de archivo? | No; `.h5` carga y produce salidas |
| 5 | ¿Arquitectura incorrecta? | No; MobileNetV2+GAP+Dropout+Dense correcta |
| 6 | ¿Backbone dañado? | No; ImageNet congelado intacto |
| 7 | ¿Recuperable sin entrenar? | **No** |
| 8 | ¿Reentrenamiento o rebuild? | **Reentrenamiento** (no rebuild) |
| 9 | ¿Insumo disponible? | **No**: dataset binario y métricas ausentes; hay que reconstruir el binario |
| 10 | Costo | Bajo para head-only; el bloqueante es reconstruir el dataset, no el cómputo |

---

## 8. Riesgos y observaciones de gobernanza

- **R1 — Datos ausentes:** el dataset de la corrida binaria no existe; sin él no hay reentrenamiento ni auditoría de balance.
- **R2 — Doble script divergente:** dos contratos de preprocesado (`Rescaling` vs `preprocess_input`) = riesgo de reproducir el bug de normalización. Unificar antes de reentrenar.
- **R3 — Sin métricas/card:** la corrida incumple el invariante del ecosistema; el reentrenamiento debe emitirlas.
- **R4 — Modelo "fantasma":** `model_metadata.json` declara `{enferma,sana}` pero no hay artefacto de split/dataset que lo respalde.

---

## 9. No tocado (declaración de honestidad)

- **No** se modificó, entrenó ni generó ningún modelo.
- **No** se tocó `src/ai_models/fastapi_app.py` (el fix F4 permanece como estaba, sin commit).
- **No** se tocó el dataset canónico ni el dataset acústico; **no** se copió/movió/borró nada.
- **No** se hicieron commits ni push. `stash@{0}`, backups y `.dockerignore` intactos.
- El `.h5` auditado, `data/datasets/.../v1` y `D:\RespaldoData` (ausente) quedaron sin cambios.

---

## 10. Anexo — comandos de verificación (read-only, reproducibles)

```powershell
# Anatomía del modelo en caliente (sin escribir en el repo)
docker compose exec -T -e PYTHONPATH=/app -w /app ai_service python <sonda>   # count_params / capas / Dense
# Existencia de dataset e insumos
Test-Path "data\datasets\plant_disease"                                        # -> False
Test-Path "data\datasets\agriculture_images_tomato-potato-corn\v1"             # -> True (16 clases, 22488)
Test-Path "D:\RespaldoData\PlantVillage-Dataset"                               # -> False
```
