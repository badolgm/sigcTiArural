# AI_DATASET_DISCOVERY_AND_AUDIT

## Fecha

2026-07-16

## Objetivo

Auditar físicamente el dataset local `PlantVillage-Dataset-master` disponible en:

`C:\Users\Devbadolgm\Development\workspace\DatosProyectos\PlantVillage-Dataset-master`

sin entrenar modelos, sin implementar pipelines y sin modificar el dataset.

El objetivo es determinar:

- cantidad real de imágenes
- estructura física
- especies presentes
- clases presentes
- distribución por clase
- nivel de desbalance
- compatibilidad con la taxonomía EIARC V2
- subconjunto recomendado para la V2 inicial

---

## 1. Resumen ejecutivo

El dataset auditado corresponde al repositorio clásico `PlantVillage-Dataset`, con estructura física válida y tres variantes principales de imagen:

- `raw/color`
- `raw/grayscale`
- `raw/segmented`

Hallazgos centrales:

1. el dataset está físicamente disponible
2. la variante científicamente más útil para SIGCT-Rural V2 inicial es `raw/color`
3. `raw/color` contiene:
   - `52,977` imágenes
   - `38` clases
   - `14` especies/grupos botánicos
4. la taxonomía V2 inicial definida en `AI_DATASET_STRATEGY_V2.md` encuentra cobertura completa para:
   - tomate
   - papa
   - maíz
5. el subconjunto compatible con la V2 inicial queda en:
   - `16 clases`
   - `21,160` imágenes RGB
6. el dataset presenta desbalance importante:
   - clase mínima: `Potato___healthy` con `152`
   - clase máxima: `Orange___Haunglongbing_(Citrus_greening)` con `5,507`
   - ratio máximo/mínimo: `36.23x`
7. el dataset está **apto como bootstrap de laboratorio**, pero **no apto por sí solo para entrenamiento productivo V2**

---

## 2. Estructura física real

## 2.1 Estructura de alto nivel observada

Se detectó la siguiente estructura principal:

- `raw/`
- `leaf_grouping/`
- `generated_for_paper/`
- `data_distribution_for_SVM/`
- `utils/`
- scripts auxiliares de generación y mapeo

## 2.2 Subconjuntos reales dentro de `raw/`

La carpeta `raw/` contiene tres variantes:

1. `color`
2. `grayscale`
3. `segmented`

Según el `README.md` propio del dataset:

- `color`: imágenes RGB originales
- `grayscale`: versión en escala de grises
- `segmented`: hoja segmentada con corrección de color

## 2.3 Conteo físico por subconjunto

- `raw/color` -> `52,977` imágenes
- `raw/grayscale` -> `48,741` imágenes
- `raw/segmented` -> `44,633` imágenes

### Total físico en `raw`

- `146,351` imágenes derivadas

## 2.4 Conclusión estructural

Para SIGCT-Rural V2 inicial:

- `raw/color` debe considerarse la fuente primaria
- `grayscale` y `segmented` no deben mezclarse ingenuamente con `color` en entrenamiento base

---

## 3. Cuántas imágenes hay

## Respuesta directa

### Conteo físico total del dataset útil en `raw`

- `146,351` imágenes

### Conteo del subconjunto RGB original

- `52,977` imágenes

### Recomendación de lectura

Si la pregunta se orienta a entrenamiento V2 inicial, la cifra correcta a usar es:

- `52,977` imágenes RGB en `raw/color`

porque:

- son las imágenes originales
- evitan mezclar versiones derivadas del mismo material

---

## 4. Cuántas clases hay

## Respuesta directa

En `raw/color` existen:

- `38` clases

## 4.1 Especies o grupos botánicos presentes

Se detectaron `14` grupos:

1. `Apple`
2. `Blueberry`
3. `Cherry_(including_sour)`
4. `Corn_(maize)`
5. `Grape`
6. `Orange`
7. `Peach`
8. `Pepper,_bell`
9. `Potato`
10. `Raspberry`
11. `Soybean`
12. `Squash`
13. `Strawberry`
14. `Tomato`

## 4.2 Distribución de clases por especie

- `Tomato` -> `10` clases
- `Apple` -> `4`
- `Corn_(maize)` -> `4`
- `Grape` -> `4`
- `Potato` -> `3`
- `Cherry_(including_sour)` -> `2`
- `Peach` -> `2`
- `Pepper,_bell` -> `2`
- `Strawberry` -> `2`
- `Blueberry` -> `1`
- `Orange` -> `1`
- `Raspberry` -> `1`
- `Soybean` -> `1`
- `Squash` -> `1`

---

## 5. Qué clases coinciden con la taxonomía V2

La V2 inicial definida en `AI_DATASET_STRATEGY_V2.md` exige:

- tomate
- papa
- maíz

Con un total recomendado de `16 clases`.

## 5.1 Coincidencia exacta detectada

Las `16` clases V2 iniciales están presentes físicamente:

### Maíz

1. `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` -> `513`
2. `Corn_(maize)___Common_rust_` -> `1,192`
3. `Corn_(maize)___healthy` -> `1,162`
4. `Corn_(maize)___Northern_Leaf_Blight` -> `985`

### Papa

5. `Potato___Early_blight` -> `1,000`
6. `Potato___healthy` -> `152`
7. `Potato___Late_blight` -> `1,000`

### Tomate

8. `Tomato___Bacterial_spot` -> `2,127`
9. `Tomato___Early_blight` -> `1,000`
10. `Tomato___healthy` -> `1,591`
11. `Tomato___Late_blight` -> `1,909`
12. `Tomato___Leaf_Mold` -> `952`
13. `Tomato___Septoria_leaf_spot` -> `443`
14. `Tomato___Target_Spot` -> `1,404`
15. `Tomato___Tomato_mosaic_virus` -> `373`
16. `Tomato___Tomato_Yellow_Leaf_Curl_Virus` -> `5,357`

## 5.2 Total compatible con V2 inicial

- `16 clases`
- `21,160` imágenes RGB

## Conclusión

La cobertura de la V2 inicial es:

- **completa a nivel de clases objetivo**
- **incompleta a nivel de balance y representatividad de campo**

---

## 6. Qué clases sobran

## Respuesta directa

Sobran para la **V2 inicial** todas las clases fuera de:

- tomate
- papa
- maíz

### Clases extra detectadas

1. `Apple___Apple_scab`
2. `Apple___Black_rot`
3. `Apple___Cedar_apple_rust`
4. `Apple___healthy`
5. `Blueberry___healthy`
6. `Cherry_(including_sour)___healthy`
7. `Cherry_(including_sour)___Powdery_mildew`
8. `Grape___Black_rot`
9. `Grape___Esca_(Black_Measles)`
10. `Grape___healthy`
11. `Grape___Leaf_blight_(Isariopsis_Leaf_Spot)`
12. `Orange___Haunglongbing_(Citrus_greening)`
13. `Peach___Bacterial_spot`
14. `Peach___healthy`
15. `Pepper,_bell___Bacterial_spot`
16. `Pepper,_bell___healthy`
17. `Raspberry___healthy`
18. `Soybean___healthy`
19. `Squash___Powdery_mildew`
20. `Strawberry___healthy`
21. `Strawberry___Leaf_scorch`
22. `Tomato___Spider_mites Two-spotted_spider_mite`

## Observación crítica

`Tomato___Spider_mites Two-spotted_spider_mite` pertenece a tomate, pero sobra para la V2 inicial porque la taxonomía aprobada aún no la incluyó.

---

## 7. Qué clases faltan

## 7.1 Faltantes para la V2 inicial

Para la V2 inicial de `16 clases`:

- **no falta ninguna clase**

## 7.2 Faltantes para la V2 ampliada

Sí faltan completamente las especies y clases de segunda ola:

### Cacao

- `healthy`
- `moniliasis`
- `black_pod`
- `witches_broom`

### Café

- `healthy`
- `coffee_leaf_rust`
- `cercospora_leaf_spot`
- `anthracnose`

### Banano

- `healthy`
- `black_sigatoka`
- `yellow_sigatoka`
- `fusarium_wilt`

## Conclusión

`PlantVillage` cubre bien la primera ola V2, pero no cubre la expansión regional definida para:

- cacao
- café
- banano

---

## 8. Distribución por clase y desbalance

## 8.1 Indicadores globales de `raw/color`

- promedio por clase: `1,394.13`
- mediana por clase: `1,052`
- ratio máximo/mínimo: `36.23x`

## 8.2 Clases más pequeñas

1. `Potato___healthy` -> `152`
2. `Apple___Cedar_apple_rust` -> `275`
3. `Peach___healthy` -> `360`
4. `Raspberry___healthy` -> `371`
5. `Tomato___Tomato_mosaic_virus` -> `373`

## 8.3 Clases más grandes

1. `Orange___Haunglongbing_(Citrus_greening)` -> `5,507`
2. `Tomato___Tomato_Yellow_Leaf_Curl_Virus` -> `5,357`
3. `Soybean___healthy` -> `5,090`
4. `Peach___Bacterial_spot` -> `2,297`
5. `Tomato___Bacterial_spot` -> `2,127`

## 8.4 Desbalance relevante para V2 inicial

Dentro del subconjunto V2 inicial, los mayores riesgos son:

- `Potato___healthy` con `152`
- `Tomato___Tomato_mosaic_virus` con `373`
- `Tomato___Septoria_leaf_spot` con `443`
- `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` con `513`

### Conclusión

El subconjunto V2 inicial es usable, pero presenta desbalance suficiente para exigir:

- estrategia de partición cuidadosa
- control de pesos o sampling en entrenamiento futuro
- validación por clase obligatoria

---

## 9. Calidad de carpetas

## 9.1 Calidad estructural general

La estructura es usable y coherente con el `README.md` del dataset.

## 9.2 Observaciones positivas

1. existe separación clara entre `color`, `grayscale` y `segmented`
2. las clases están organizadas por carpeta
3. la nomenclatura `Species___Condition` es consistente en la mayoría de casos
4. no se detectaron imágenes RGB en cero bytes

## 9.3 Observaciones de calidad

1. hay nombres de carpetas con espacios, comas y sufijos irregulares
2. existen diferencias de estilo como:
   - guiones bajos
   - espacios
   - paréntesis
   - sufijos de especie compuestos
3. algunas clases tienen nombres muy largos y poco limpios para contrato de producto
4. la coexistencia de `color`, `grayscale` y `segmented` puede introducir fuga de información si se mezclan mal

## 9.4 Hallazgo físico adicional

Se detectó un archivo vacío en el árbol del dataset:

- `utils/__init__.py`

Esto no afecta el dataset de imágenes utilizable.

---

## 10. Qué imágenes deben descartarse

## 10.1 Descartes obligatorios para V2 inicial

Deben descartarse del baseline V2 inicial:

1. todas las imágenes de `raw/grayscale`
2. todas las imágenes de `raw/segmented`
3. imágenes auxiliares de `generated_for_paper/`
4. cualquier material no perteneciente a `raw/color`
5. clases fuera del alcance V2 inicial

## 10.2 Descartes semánticos para V2 inicial

Deben salir del dataset inicial:

- todas las clases no pertenecientes a tomate, papa o maíz
- `Tomato___Spider_mites Two-spotted_spider_mite` hasta que la taxonomía oficial V2 la incorpore explícitamente

## 10.3 Descartes metodológicos futuros

En una fase de curación más fina deberían descartarse además:

- duplicados o near-duplicates entre particiones
- capturas corruptas o borrosas
- imágenes no foliares si aparecieran
- clases extremadamente pequeñas si no alcanzan umbral mínimo científico

---

## 11. Qué dataset quedaría para V2 inicial

## Respuesta directa

El dataset recomendado para la V2 inicial quedaría así:

### Fuente

- `raw/color`

### Especies

- `Tomato`
- `Potato`
- `Corn_(maize)`

### Clases

- `16`

### Imágenes

- `21,160`

## 11.1 Lectura científica

Este subconjunto:

- coincide exactamente con la taxonomía inicial aprobada en `AI_DATASET_STRATEGY_V2.md`
- evita contaminación por especies fuera del alcance
- conserva el máximo alineamiento con el roadmap V2

## 11.2 Limitación crítica

Aunque este subconjunto es coherente para baseline V2:

- sigue siendo un dataset de laboratorio
- no incluye contexto real de campo
- no basta por sí solo para validación productiva

---

## 12. Nivel de preparación para entrenamiento

## Respuesta corta

El nivel de preparación es:

- **Medio para baseline de laboratorio**
- **Bajo para entrenamiento productivo real**

## 12.1 Fortalezas

1. cobertura completa de la V2 inicial tomate/papa/maíz
2. estructura de carpetas clara
3. cantidad suficiente para arrancar un baseline multiclase
4. consistencia razonable de nombres de clase

## 12.2 Debilidades

1. desbalance notable entre clases
2. dominio de laboratorio con fondos limpios
3. ausencia de validación real de campo en este corpus
4. faltan cacao, café y banano
5. faltan metadatos agronómicos enriquecidos
6. faltan particiones científicas ya curadas para EIARC V2

## 12.3 Dictamen final de readiness

### Para laboratorio

- `GO condicionado`

Motivo:

- sirve para baseline V2 inicial

### Para producción o validación fuerte

- `NO-GO`

Motivo:

- falta complementar con datos reales de campo, validación experta y gobernanza de particiones

---

## 13. Respuestas directas solicitadas

## 1. Cuántas imágenes hay

- `146,351` imágenes físicas en `raw`
- `52,977` imágenes RGB originales en `raw/color`

## 2. Cuántas clases hay

- `38` clases en `raw/color`

## 3. Qué clases coinciden con la taxonomía V2

- coinciden las `16` clases de tomate, papa y maíz definidas para la V2 inicial

## 4. Qué clases sobran

- sobran `22` clases fuera del alcance V2 inicial, incluyendo manzana, uva, naranja, durazno, pimentón, soya, fresa, etc.

## 5. Qué clases faltan

- para la V2 inicial no falta ninguna
- para la expansión regional faltan cacao, café y banano

## 6. Qué imágenes deben descartarse

- `grayscale`
- `segmented`
- material de `generated_for_paper`
- clases fuera del alcance V2 inicial

## 7. Qué dataset quedaría para V2 inicial

- `raw/color`
- `16 clases`
- `21,160` imágenes

## 8. Nivel de preparación para entrenamiento

- medio para baseline de laboratorio
- bajo para producción real

---

## 14. Conclusión final

El dataset `PlantVillage-Dataset-master` auditado está físicamente sano, estructuralmente usable y científicamente suficiente para construir el **baseline controlado de la V2 inicial** en tomate, papa y maíz.

Sin embargo, el diagnóstico final es inequívoco:

- el dataset **sí alcanza** para una V2 inicial de laboratorio
- el dataset **no alcanza** por sí solo para una V2 científicamente validada en campo
- la transición correcta para SIGCT-Rural V2 es:
  - conservar `raw/color`
  - extraer el subconjunto de `16 clases`
  - complementar posteriormente con datos reales de campo y validación experta
