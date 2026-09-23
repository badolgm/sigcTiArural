# AGRICULTURE_AI_V2_DATASET_INVENTORY

## Fecha

2026-07-16

## Objetivo

Inventariar el dataset aprobado para `Agriculture AI V2` (baseline multiclase inicial) a partir de la auditoría física de PlantVillage, sin entrenar modelos y sin ejecutar pipelines de entrenamiento.

Fuente de verdad:

- `AI_DATASET_DISCOVERY_AND_AUDIT.md`
- Subconjunto aprobado: `21,160` imágenes RGB, `16` clases, especies `tomate/papa/maíz`

**ACTUALIZACIÓN 2026-09-23 (RECOVERY CONSOLIDATION):** subconjunto verificado físicamente en el origen recuperado `D:\RespaldoData\PlantVillage-Dataset\raw\color` → **22.488** imágenes RGB / 16 clases / 3 especies. Delta +1.328 vs este inventario: **100% en `Tomato___Septoria_leaf_spot`** (1.771 en el origen, no 443); las otras 15 clases coinciden 1:1. Detalle completo en `SIGCTIARURAL_DATASET_V2_RECOVERY_CONSOLIDATION.md` (docs/). Este documento conserva el inventario histórico (NADA DESAPARECE); los valores vigentes son los consolidados.

---

## 1. Fuente física auditada

Ruta auditada del dataset local:

- `C:\Users\Devbadolgm\Development\workspace\DatosProyectos\PlantVillage-Dataset-master\raw\color` (histórica, inexistente en máquina actual)
- **Origen recuperado (2026-09-23):** `D:\RespaldoData\PlantVillage-Dataset\raw\color` (54.305 archivos / 38 clases / ~0.79 GB)

Exclusiones explícitas del baseline:

- `raw/grayscale`
- `raw/segmented`
- `generated_for_paper`
- clases fuera de tomate/papa/maíz
- `Tomato___Spider_mites Two-spotted_spider_mite`

---

## 2. Especies incluidas

1. `Tomato`
2. `Potato`
3. `Corn_(maize)`

Total especies del baseline: `3`

---

## 3. Clases finales y conteo por clase

Total imágenes: `21,160` (inventario histórico) → **`22,488` vigente** (consolidado 2026-09-23)

| # | Clase (PlantVillage raw/color) | Conteo | Conteo consolidado (vigente) |
|---:|---|---:|---:|
| 1 | Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot | 513 | 513 |
| 2 | Corn_(maize)___Common_rust_ | 1,192 | 1,192 |
| 3 | Corn_(maize)___healthy | 1,162 | 1,162 |
| 4 | Corn_(maize)___Northern_Leaf_Blight | 985 | 985 |
| 5 | Potato___Early_blight | 1,000 | 1,000 |
| 6 | Potato___healthy | 152 | 152 |
| 7 | Potato___Late_blight | 1,000 | 1,000 |
| 8 | Tomato___Bacterial_spot | 2,127 | 2,127 |
| 9 | Tomato___Early_blight | 1,000 | 1,000 |
| 10 | Tomato___healthy | 1,591 | 1,591 |
| 11 | Tomato___Late_blight | 1,909 | 1,909 |
| 12 | Tomato___Leaf_Mold | 952 | 952 |
| 13 | Tomato___Septoria_leaf_spot | 443 | **1,771** (+1,328) |
| 14 | Tomato___Target_Spot | 1,404 | 1,404 |
| 15 | Tomato___Tomato_mosaic_virus | 373 | 373 |
| 16 | Tomato___Tomato_Yellow_Leaf_Curl_Virus | 5,357 | 5,357 |

**Nota (2026-09-23):** única divergencia = `Tomato___Septoria_leaf_spot` (443 → 1,771). Suma vigente = **22,488**.

---

## 4. Distribución y desbalance

## 4.1 Indicadores del baseline (vigentes desde 2026-09-23)

- imágenes totales: `22,488` (histórico: `21,160`)
- clases: `16`
- promedio por clase: `1,405.50` (histórico: `1,322.50`)
- clase mínima: `Potato___healthy` (`152`, `0.68%`)
- clase máxima: `Tomato___Tomato_Yellow_Leaf_Curl_Virus` (`5,357`, `23.82%`)
- ratio max/min (dentro del baseline): `35.24x` (sin cambio: min y max idénticos)

## 4.2 Clases minoritarias críticas (vigentes desde 2026-09-23)

Estas clases requieren control explícito de desbalance en el benchmark:

1. `Potato___healthy` (`152`)
2. `Tomato___Tomato_mosaic_virus` (`373`)
3. `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` (`513`)
4. `Tomato___Leaf_Mold` (`952`) — nueva 4ª minoritaria; `Tomato___Septoria_leaf_spot` (1,771) salió del grupo crítico

## 4.3 Clases dominantes críticas

Estas clases dominan el dataset y pueden sesgar métricas globales:

1. `Tomato___Tomato_Yellow_Leaf_Curl_Virus` (`5,357`)
2. `Tomato___Bacterial_spot` (`2,127`)
3. `Tomato___Late_blight` (`1,909`)
4. `Tomato___healthy` (`1,591`)

---

## 5. Calidad y observaciones

## 5.1 Observaciones positivas

1. estructura por carpetas consistente
2. dataset RGB original disponible en `raw/color`
3. cobertura completa de la taxonomía V2 inicial (tomate/papa/maíz)

## 5.2 Observaciones de riesgo

1. sesgo de laboratorio (fondos limpios, condiciones controladas)
2. desbalance severo en clases minoritarias, especialmente `Potato___healthy`
3. nombres de clases con espacios y convenciones heterogéneas (impacta binding taxonómico)
4. riesgo de fuga de información si se mezclaran variantes derivadas (`grayscale`, `segmented`), motivo por el cual se excluyen

## 5.3 Dictamen de uso

- Apto como dataset bootstrap para benchmark controlado de laboratorio.
- No apto por sí solo para declarar validez de campo.

---

## 6. Conclusión final

El dataset `Agriculture AI V2` inicial queda formalmente inventariado como un subconjunto de PlantVillage:

- `22,488` imágenes (vigente, consolidado 2026-09-23; histórico `21,160`)
- `16` clases
- `3` especies

El siguiente paso correcto (fuera del alcance de este documento) es materializar manifests, taxonomía, label schema, split y framework de calidad para iniciar un benchmark científico con control de desbalance y evaluación por clase.
