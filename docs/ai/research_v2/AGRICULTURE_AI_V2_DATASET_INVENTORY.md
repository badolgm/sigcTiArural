# AGRICULTURE_AI_V2_DATASET_INVENTORY

## Fecha

2026-07-16

## Objetivo

Inventariar el dataset aprobado para `Agriculture AI V2` (baseline multiclase inicial) a partir de la auditoría física de PlantVillage, sin entrenar modelos y sin ejecutar pipelines de entrenamiento.

Fuente de verdad:

- `AI_DATASET_DISCOVERY_AND_AUDIT.md`
- Subconjunto aprobado: `21,160` imágenes RGB, `16` clases, especies `tomate/papa/maíz`

---

## 1. Fuente física auditada

Ruta auditada del dataset local:

- `C:\Users\Devbadolgm\Development\workspace\DatosProyectos\PlantVillage-Dataset-master\raw\color`

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

Total imágenes: `21,160`

| # | Clase (PlantVillage raw/color) | Conteo | % |
|---:|---|---:|---:|
| 1 | Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot | 513 | 2.43 |
| 2 | Corn_(maize)___Common_rust_ | 1,192 | 5.63 |
| 3 | Corn_(maize)___healthy | 1,162 | 5.49 |
| 4 | Corn_(maize)___Northern_Leaf_Blight | 985 | 4.66 |
| 5 | Potato___Early_blight | 1,000 | 4.73 |
| 6 | Potato___healthy | 152 | 0.72 |
| 7 | Potato___Late_blight | 1,000 | 4.73 |
| 8 | Tomato___Bacterial_spot | 2,127 | 10.05 |
| 9 | Tomato___Early_blight | 1,000 | 4.73 |
| 10 | Tomato___healthy | 1,591 | 7.52 |
| 11 | Tomato___Late_blight | 1,909 | 9.02 |
| 12 | Tomato___Leaf_Mold | 952 | 4.50 |
| 13 | Tomato___Septoria_leaf_spot | 443 | 2.09 |
| 14 | Tomato___Target_Spot | 1,404 | 6.64 |
| 15 | Tomato___Tomato_mosaic_virus | 373 | 1.76 |
| 16 | Tomato___Tomato_Yellow_Leaf_Curl_Virus | 5,357 | 25.32 |

---

## 4. Distribución y desbalance

## 4.1 Indicadores del baseline

- imágenes totales: `21,160`
- clases: `16`
- promedio por clase: `1,322.50`
- clase mínima: `Potato___healthy` (`152`, `0.72%`)
- clase máxima: `Tomato___Tomato_Yellow_Leaf_Curl_Virus` (`5,357`, `25.32%`)
- ratio max/min (dentro del baseline): `35.24x`

## 4.2 Clases minoritarias críticas

Estas clases requieren control explícito de desbalance en el benchmark:

1. `Potato___healthy` (`152`)
2. `Tomato___Tomato_mosaic_virus` (`373`)
3. `Tomato___Septoria_leaf_spot` (`443`)
4. `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` (`513`)

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

- `21,160` imágenes
- `16` clases
- `3` especies

El siguiente paso correcto (fuera del alcance de este documento) es materializar manifests, taxonomía, label schema, split y framework de calidad para iniciar un benchmark científico con control de desbalance y evaluación por clase.
