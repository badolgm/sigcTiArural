# SIGCTiArural · Auditoría del mecanismo de reutilización canónica `benchmark/src` (fallback notebook M2)

> **Fecha:** 2026-09-24 · **Rama:** `feature/ubtn-biological-telemetry` · **HEAD:** `18b95b1`
> **Alcance:** auditar el mecanismo de carga de `benchmark/src` usado por `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` y validar la equivalencia funcional del fallback inline.
> **Metodología:** comparación de AST (árbol semántico), comparación línea a línea y validación numérica con entradas idénticas.

---

## 1. Resumen ejecutivo

El notebook `SIGCTIARURAL_M2_EfficientNetB0.ipynb` necesita funciones canónicas del módulo `benchmark/src` para garantizar que M2 usa **exactamente las mismas fórmulas, métricas y configuraciones que M1** (comparabilidad científica 1:1).

Al ejecutarse en Colab, el notebook busca `benchmark/src` en dos rutas (Drive primaria, local secundaria). Cuando **no lo encuentra**, activa un **fallback**: una copia inline de las funciones canónicas embebida en la celda 6 del propio notebook.

Esta auditoría demuestra que **el fallback inline es funcionalmente equivalente a `benchmark/src`** para las tres funciones utilizadas por el notebook (`evaluate`, `expected_calibration_error`, `class_weights`). No existen divergencias de fórmulas, métricas, retornos ni configuraciones.

---

## 2. Arquitectura del mecanismo

El notebook implementa una pirámide de carga con tres niveles, evaluados en este orden:

### Ruta primaria — `DRIVE_ROOT/benchmark/src`
```
DRIVE_ROOT = /content/drive/MyDrive/SIGCTiArural
candidato  = DRIVE_ROOT + /benchmark/src
```
Si existe la carpeta, se usa como fuente única de funciones canónicas.

### Ruta secundaria — `/content/benchmark/src`
Si la primaria existe, el contenido se copia a `/content/benchmark` (`shutil.copytree`) y se importa como paquete local:
```python
sys.path.insert(0, "/content")
import datasets as bm_datasets, metrics as bm_metrics, models as bm_models
```
Este segundo nivel sirve como punto de montaje estable dentro del runtime de Colab (independiente del sistema de archivos de Drive).

### Ruta fallback — copia inline canónica
Si **ninguna** de las rutas anteriores existe, se ejecuta la copia inline embebida en la celda 6:
```python
# FALLBACK: copia inline idéntica a benchmark/src (mismas fórmulas EXACTAS que M1)
```
Define `evaluate`, `expected_calibration_error` y `class_weights` y las expone vía `SimpleNamespace`:
```python
bm_metrics  = SimpleNamespace(evaluate=evaluate, expected_calibration_error=expected_calibration_error)
bm_datasets = SimpleNamespace(class_weights=class_weights)
bm_models   = None
```

### Flujo completo
```
celda 6:
  ¿existe DRIVE_ROOT/benchmark/src ?
  ├── SÍ → copytree → import datasets/metrics/models → BM_REUSE = True
  └── NO └→ ¿existe /content/benchmark/src ?
               ├── SÍ → import directo → BM_REUSE = True
               └── NO → FALLBACK inline → SimpleNamespace → BM_REUSE = False
```
`bm_models` puede ser `None` en el fallback **sin impacto**: el notebook construye el modelo directamente con `torchvision.models.efficientnet_b0` (celda 12) y nunca importa `bm_models` en el flujo de entrenamiento.

---

## 3. Auditoría de equivalencia

Se compararon las tres funciones utilizadas por el notebook contra sus implementaciones oficiales en `benchmark/src/`:

| Función | Origen oficial | Usada en notebook (celda) |
|---|---|---|
| `evaluate()` | `benchmark/src/metrics.py` | 16, 19, 27 |
| `expected_calibration_error()` | `benchmark/src/metrics.py` | 6 (fallback), 16, 19, 27 |
| `class_weights()` | `benchmark/src/datasets.py` | 10 |

### 3.1 Comparación AST (árbol semántico)
Se construyó y comparó el árbol de sintaxis abstracta de cada implementación (normalizando alias `_np`→`np`, `_th`→`torch` y eliminando docstrings):

- **`evaluate()`** — **AST idéntico** entre la versión oficial e inline.
- **`expected_calibration_error()`** — AST equivalente; única diferencia estructural es un **refactor cosmético**: la oficial asigna `ece = np.sum(...)` y luego `return float(ece)`; la inline hace `return float(np.sum(...))` (inlining de la variable intermedia). Misma operación, mismo resultado.
- **`class_weights()`** — AST equivalente; misma categoría de refactor: la oficial asigna `weights = n / (counts * num_classes)` y luego `return torch.tensor(weights,...)`; la inline devuelve directamente `torch.tensor(n / (counts * num_classes),...)`. Misma fórmula exacta.

### 3.2 Validación semántica
Se confirmó que ambas versiones:
- Comparten **mismas firmas** y parámetros (incluido `n_bins=15` por defecto).
- Usan **mismas dependencias** (`numpy`, `torch`, `sklearn.metrics` con `f1_score`, `balanced_accuracy_score`, `precision_recall_fscore_support`, `confusion_matrix`).
- Devuelven **mismos tipos y estructura de resultados** (`macro_f1`, `weighted_f1`, `balanced_accuracy`, `per_class_precision/recall/f1`, `confusion_matrix`, `ece`; tensores `torch.float32`).
- Aplican **mismos flags** (`zero_division=0`, `minlength=num_classes`, `errstate(divide="ignore", invalid="ignore")`).

### 3.3 Validación numérica
Se ejecutaron ambas versiones con **entradas idénticas** (200 muestras · 16 clases · seed fija; más un caso borde de ECE con confidencias extremas 0.0/1.0/0.9999/0.5/0.0001):

| Prueba | Resultado oficial vs inline |
|---|---|
| `evaluate(probs, y_true)` | **IDENTICOS** (todos los campos) |
| `expected_calibration_error(...)` | **IDENTICOS** |
| `class_weights(targets, C)` | **IDENTICOS** (con `torch.equal`) |
| ECE caso borde | **IDENTICOS** |

**Resultado global: EQUIVALENCIA FUNCIONAL COMPLETA.**

---

## 4. Riesgo científico

**RIESGO CIENTÍFICO = NULO**

La equivalencia demostrada (AST + semántica + numérica) garantiza que usar el fallback inline o importar `benchmark/src` produce **los mismos resultados**:

- **Mismas fórmulas** — ECE con bins de ancho igual, `1/n`-normalized class weights, macro/weighted F1 y balanced accuracy de `sklearn`.
- **Mismas métricas** — identidad bit a bit en las salidas verificadas.
- **Mismos retornos** — estructura de dict y tipos idénticos.
- **Mismas configuraciones** — mismas firmas, defaults y flags (`zero_division=0`, `n_bins=15`, `dtype=torch.float32`).

**Consecuencia:** M1 y M2 continúan siendo **estrictamente comparables**. Cualquier métrica de validation de M2 (macro-F1, ECE, balanced accuracy, weighted-F1) se genera bajo la misma política canónica que el baseline M1, independientemente de que el notebook haya usado la ruta Drive o el fallback.

---

## 5. Rendimiento

Usar `benchmark/src` o el fallback inline **no produce diferencias significativas de rendimiento** en el benchmark:

- Ambas versiones ejecutan las mismas operaciones vectorizadas (`numpy`/`sklearn`) sobre tensores ya materializados en memoria.
- El fallback inline no añade sobrecarga de I/O (ya vive en la celda del notebook) y el import desde `/content/benchmark` es un único coste de arranque despreciable.

El tiempo dominante del benchmark sigue estando en:
- **carga del dataset** (ImageFolder sobre Drive, 22.488 imágenes),
- **entrenamiento** (epochs sobre GPU T4),
- **validación** y
- **generación de métricas/gráficas**.

El mecanismo de carga de funciones canónicas es, en la práctica, **cero sobrecarga** frente a esos costes.

---

## 6. Riesgo de gobernanza

El único riesgo identificado es la **duplicación de código**:

- El fallback inline y `benchmark/src` son hoy equivalentes, pero son **dos copias** de la misma lógica que evolucionan de forma independiente.
- **Posible divergencia futura:** si `benchmark/src` evoluciona (nueva fórmula, nuevo flag, nueva métrica) y el fallback no se sincroniza, ambos dejarían de ser equivalentes en silencio.
- **Mitigación recomendada:** mantener la política "el fallback es una copia congelada de `benchmark/src`", sincronizarla en cada cambio, y (opcionalmente) materializar la copia en Drive para que el notebook prefiera la ruta primaria.
- La presente auditoría queda como **traza de referencia** para validar esa equivalencia en el futuro sin repetir todo el análisis.

---

## 7. Recomendación oficial

| Aspecto | Clasificación |
|---|---|
| **Estado del fallback** | **APROBADO** — fallback canónico válido |
| **Bloqueo de la corrida oficial M2** | **NO bloquea** — el notebook puede ejecutarse tal cual |
| **Subir `benchmark/src` a Drive** | **RECOMENDADO** pero **NO OBLIGATORIO** |

- **APROBADO**: la equivalencia funcional completa (AST + semántica + numérica) valida el fallback como fuente métrica legítima.
- **NO OBLIGATORIO**: la corrida oficial no depende de subir nada a Drive; el fallback basta.
- **RECOMENDADO**: subir `benchmark/src` (o al menos `datasets.py` + `metrics.py`) a `Drive/SIGCTiArural/benchmark/src` elimina la duplicación y convierte Drive en fuente única — el notebook ya la detecta y reutiliza automáticamente (celda 6).

---

## 8. Impacto sobre M2

**Conclusión explícita:**

> La corrida oficial de `SIGCTIARURAL_M2_EfficientNetB0.ipynb` puede ejecutarse **inmediatamente**. No existen bloqueos técnicos ni científicos asociados al fallback.

- El fallback es equivalente a `benchmark/src` para las funciones utilizadas.
- El risk científico es nulo; M2 vs M1 siguen siendo estrictamente comparables.
- El desempeño no se ve afectado por el mecanismo de carga.
- La única condición operativa es la ya documentada para la corrida oficial: montar Drive, verificar `DATA_ROOT` y (si el run ya comenzó antes) borrar `runs/M2_efficientnet_b0/metrics.csv` antes de la corrida.

---

*Honestidad de estado: esta auditoría valida la equivalencia del fallback used durante el desarrollo y smoke test de M2. No modifica código, notebook, dataset, benchmark ni realiza commits.*