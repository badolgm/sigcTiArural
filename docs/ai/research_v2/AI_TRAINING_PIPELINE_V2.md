# AI_TRAINING_PIPELINE_V2

## Fecha

2026-07-16

## Objetivo

Diseñar el pipeline completo de entrenamiento para la primera versión multiclase de SIGCT-Rural V2, usando como baseline auditado:

- `21,160` imágenes
- `16` clases
- especies objetivo:
  - tomate
  - papa
  - maíz

Este documento no entrena, no implementa y no modifica código. Solo define la arquitectura y la estrategia científica del pipeline.

---

## 1. Resumen ejecutivo

La primera versión multiclase V2 debe diseñarse como un pipeline de laboratorio controlado, orientado a producir:

1. un baseline multiclase científicamente trazable
2. un benchmark comparativo entre arquitecturas compactas y medias
3. un modelo exportable a estrategia edge
4. una línea base para evolución posterior a datasets de campo

Decisión de diseño:

- **arquitectura candidata principal:** `EfficientNet-B0`
- **arquitectura candidata secundaria:** `MobileNetV3-Large`

Razonamiento:

- `EfficientNet-B0` ofrece mejor equilibrio entre precisión, eficiencia y costo de entrenamiento para `16` clases con `21,160` imágenes
- `MobileNetV3-Large` ofrece mejor proyección a despliegue edge, especialmente si luego se cuantiza para `TensorFlow Lite`

Arquitecturas de comparación obligatoria:

- `ResNet50` como benchmark robusto clásico
- `ConvNeXt-Tiny` como benchmark de mayor capacidad para laboratorio/cloud

Conclusión ejecutiva:

- el modelo recomendado para entrenamiento principal es `EfficientNet-B0`
- el modelo recomendado para despliegue extremo edge y compatibilidad potencial con BeagleBone Black es `MobileNetV3` cuantizado

---

## 2. Arquitectura candidata principal

## Recomendación principal

- `EfficientNet-B0`

## Justificación

`EfficientNet-B0` es la mejor arquitectura principal para la V2 inicial porque:

1. mantiene buena relación precisión/costo
2. es más eficiente que `ResNet50`
3. suele comportarse muy bien en clasificación foliar
4. es lo suficientemente compacta para servir como puente entre cloud y edge
5. permite una ruta clara hacia variantes mayores si el dataset crece

## Papel dentro del pipeline

- baseline principal de laboratorio
- modelo de referencia oficial de la primera V2 multiclase
- benchmark central para comparar con `MobileNetV3`, `ResNet50` y `ConvNeXt`

---

## 3. Arquitectura candidata secundaria

## Recomendación secundaria

- `MobileNetV3-Large`

## Justificación

`MobileNetV3-Large` debe ser la arquitectura secundaria porque:

1. está más alineada con despliegue edge
2. es apta para conversión posterior a `TensorFlow Lite`
3. reduce costo de inferencia
4. es la mejor candidata a continuidad operacional en hardware restringido

## Papel dentro del pipeline

- benchmark edge-first
- candidato principal a exportación compacta
- posible base del modelo productivo si la caída de precisión frente a `EfficientNet-B0` es pequeña

---

## 4. Comparación de arquitecturas

## 4.1 `MobileNetV3`

### Ventajas

- muy eficiente
- excelente para edge
- menor latencia
- cuantización sencilla

### Desventajas

- menor capacidad representacional que `EfficientNet` y `ConvNeXt`
- puede perder rendimiento en clases finas o desbalanceadas

### Rol recomendado

- despliegue edge
- benchmark operativo
- candidato BeagleBone/gateway

## 4.2 `EfficientNet`

### Ventajas

- excelente equilibrio entre costo y precisión
- buen desempeño en clasificación vegetal
- escalabilidad por familia

### Desventajas

- algo más costoso que `MobileNetV3`
- no tan ligero para edge extremo como `MobileNetV3-Small`

### Rol recomendado

- baseline principal V2
- modelo de referencia inicial

## 4.3 `ResNet50`

### Ventajas

- arquitectura robusta y probada
- benchmark clásico y estable
- fuerte capacidad de extracción de features

### Desventajas

- mayor costo computacional
- menos eficiente que `EfficientNet-B0`
- peor proyección a edge

### Rol recomendado

- baseline comparativo clásico
- control experimental

## 4.4 `ConvNeXt-Tiny`

### Ventajas

- alta capacidad
- mejor rendimiento potencial en clasificación fina
- buen benchmark de laboratorio moderno

### Desventajas

- costo computacional superior
- menos realista para edge en V2 inicial
- mayor riesgo de sobreajuste si el pipeline no está bien regularizado

### Rol recomendado

- benchmark cloud/laboratorio
- techo superior experimental

## 4.5 Dictamen comparativo final

Orden recomendado:

1. `EfficientNet-B0`
2. `MobileNetV3-Large`
3. `ResNet50`
4. `ConvNeXt-Tiny`

---

## 5. Pipeline de preparación

## 5.1 Entrada

Fuente aprobada para V2 inicial:

- `PlantVillage-Dataset-master/raw/color`
- subconjunto filtrado a `16` clases
- total esperado: `21,160` imágenes

## 5.2 Etapas del pipeline

### Etapa 1. Filtrado semántico

- conservar solo clases de tomate, papa y maíz aprobadas
- excluir `grayscale`
- excluir `segmented`
- excluir material auxiliar

### Etapa 2. Normalización taxonómica

- mapear nombres de carpetas a taxonomía EIARC V2
- separar:
  - `species`
  - `condition_group`
  - `condition_name`
  - `health_state`

### Etapa 3. Curación mínima

- verificar integridad de imagen
- remover archivos corruptos si aparecieran
- detectar duplicados y near-duplicates

### Etapa 4. Metadatos de entrenamiento

Por muestra deben existir, como mínimo:

- `sample_id`
- `source_dataset`
- `species`
- `condition_name`
- `health_state`
- `annotation_quality`

### Etapa 5. Redimensionamiento y estandarización

Recomendación inicial:

- tamaño base: `224x224`
- normalización por canal compatible con imagenet pretraining

### Etapa 6. Partición científica

- `train`
- `validation`
- `test`
- `real_world_holdout` futuro externo

---

## 6. Estrategia de augmentation

La augmentación debe acercar el laboratorio al campo, sin destruir morfología diagnóstica.

## 6.1 Augmentations recomendadas

1. `horizontal flip` controlado
2. rotación leve: `-20° a +20°`
3. `random crop` suave
4. jitter moderado de brillo/contraste/saturación
5. leve blur gaussiano
6. compresión JPEG simulada
7. pequeñas variaciones de escala

## 6.2 Augmentations condicionadas

1. cambio de fondo leve o padding contextual si se hace de forma controlada
2. ruido de sensor o móvil
3. shadow simulation moderada

## 6.3 Augmentations prohibidas o de alto riesgo

1. rotaciones extremas que alteren estructura biológica
2. color jitter agresivo que borre signos diagnósticos
3. mixup/cutmix sin validación previa
4. transformaciones que creen artefactos irreales

## 6.4 Política recomendada

- augmentación moderada en `train`
- ninguna augmentación en `validation` y `test`

---

## 7. Control de desbalance

El desbalance auditado obliga a una estrategia explícita.

## 7.1 Hallazgos críticos del dataset

Clases problemáticas:

- `Potato___healthy` -> `152`
- `Tomato___Tomato_mosaic_virus` -> `373`
- `Tomato___Septoria_leaf_spot` -> `443`
- `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` -> `513`

## 7.2 Estrategia recomendada

### Nivel 1. Weighted loss

Usar ponderación por clase en la función de pérdida.

### Nivel 2. Sampler balanceado

Usar `class-balanced sampling` o equivalente en entrenamiento.

### Nivel 3. Augmentación dirigida

Aplicar augmentación adicional en clases minoritarias, sin exceder realismo.

### Nivel 4. Métricas por clase

No aceptar resultados globales buenos con clases minoritarias colapsadas.

## 7.3 Estrategias que no deben ser la primera opción

1. oversampling ingenuo masivo
2. undersampling agresivo de clases grandes
3. sintetizar datos sin control científico

---

## 8. Métricas científicas

## 8.1 Métricas primarias

1. `macro F1`
2. `balanced accuracy`
3. `recall por clase`
4. `precision por clase`

## 8.2 Métricas secundarias

1. `top-1 accuracy`
2. matriz de confusión
3. `per-class support`
4. `calibration error`
5. `weighted F1`

## 8.3 Métrica de aceptación mínima

El criterio central no debe ser solo `accuracy`, sino:

- macro F1 alto
- recall aceptable en clases minoritarias
- calibración razonable

## 8.4 Regla de publicación

Un modelo no debe promoverse si:

- falla en clases minoritarias
- depende de una sola especie para sostener la métrica global
- tiene mala calibración

---

## 9. Estrategia Train / Validation / Test

## 9.1 Split recomendado

- `Train`: `70%`
- `Validation`: `15%`
- `Test`: `15%`

## 9.2 Regla crítica

No hacer split aleatorio ingenuo a nivel de archivo sin control de duplicados o correlaciones.

## 9.3 Estrategia recomendada

### Paso 1

Detectar duplicados y near-duplicates antes del split.

### Paso 2

Hacer split estratificado por clase.

### Paso 3

Reservar una futura capa de `real_world_holdout` completamente separada del baseline PlantVillage.

## 9.4 Validación científica

- `validation` para selección de modelo e hiperparámetros
- `test` solo para cierre experimental
- `real_world_holdout` para validez externa futura

---

## 10. Estrategia Edge AI

## 10.1 Objetivo

Garantizar que el pipeline produzca un artefacto potencialmente desplegable fuera de cloud.

## 10.2 Recomendación

El pipeline debe terminar con evaluación de exportabilidad a:

- `TensorFlow Lite`
- cuantización `float16`
- cuantización `int8` cuando sea viable

## 10.3 Candidato edge principal

- `MobileNetV3`

## 10.4 Candidato edge secundario

- `EfficientNet-B0` compactado o variante reducida, solo si el costo de inferencia es aceptable

## 10.5 Restricción operativa

El edge de primera ola debe orientarse a:

- inferencia puntual
- baja latencia
- consumo controlado

no a entrenamiento ni a batch continuo pesado.

---

## 11. Estrategia Cloud AI

## 11.1 Objetivo

Usar cloud o estación potente para:

- entrenamiento
- comparación de arquitecturas
- selección de hiperparámetros
- versionado de modelos

## 11.2 Rol cloud

1. entrenamiento de `EfficientNet-B0`
2. benchmark con `ResNet50`
3. benchmark con `ConvNeXt-Tiny`
4. almacenamiento de artefactos
5. evaluación completa y reproducible

## 11.3 Resultado esperado

Cloud produce:

- modelo maestro validado
- benchmark comparativo
- candidato exportable a edge

---

## 12. Modelo recomendado para BeagleBone Black

## Recomendación directa

- `MobileNetV3-Small` o `MobileNetV3-Large` cuantizado a `TensorFlow Lite`

## Justificación

La BeagleBone Black no es un objetivo realista para:

- `ResNet50`
- `ConvNeXt-Tiny`
- entrenamiento local

El candidato realista es un modelo compactado, con preferencia:

1. `MobileNetV3-Small` si la restricción de hardware es extrema
2. `MobileNetV3-Large` si el gateway intermedio soporta mejor memoria/latencia

## Nota crítica

La BeagleBone Black debe tratarse más como:

- nodo de adquisición
- nodo de control
- inferencia compacta eventual

que como host principal de visión intensiva.

---

## 13. Coste computacional

## 13.1 Bajo

- `MobileNetV3`

## 13.2 Medio

- `EfficientNet-B0`

## 13.3 Medio-alto

- `ResNet50`

## 13.4 Alto

- `ConvNeXt-Tiny`

## 13.5 Orden de eficiencia

De menor a mayor costo:

1. `MobileNetV3`
2. `EfficientNet-B0`
3. `ResNet50`
4. `ConvNeXt-Tiny`

---

## 14. Tiempo estimado de entrenamiento

Las estimaciones dependen de hardware, tamaño de batch y estrategia de fine-tuning.

## 14.1 En GPU de consumo media

Supuesto:

- una GPU tipo `RTX 3060 / 4060 / 4070`
- imagen `224x224`
- fine-tuning con transfer learning

### Estimación por arquitectura

- `MobileNetV3`: `1 a 3 horas`
- `EfficientNet-B0`: `2 a 5 horas`
- `ResNet50`: `3 a 6 horas`
- `ConvNeXt-Tiny`: `4 a 10 horas`

## 14.2 En CPU solamente

- viable solo para pruebas pequeñas o sanity checks
- no recomendable para benchmark serio

### Estimación CPU

- `MobileNetV3`: `8 a 20 horas`
- `EfficientNet-B0`: `12 a 30 horas`
- `ResNet50`: `18 a 40 horas`
- `ConvNeXt-Tiny`: `24+ horas`

## 14.3 Observación

La primera V2 debe planificarse sobre GPU, aunque sea de gama media.

---

## 15. Hardware recomendado

## 15.1 Entrenamiento mínimo aceptable

- CPU moderna de múltiples núcleos
- `32 GB RAM`
- GPU con al menos `8 GB VRAM`
- SSD rápido

## 15.2 Entrenamiento recomendado

- `RTX 4070` o equivalente
- `32 a 64 GB RAM`
- SSD NVMe

## 15.3 Entrenamiento ideal para benchmark completo

- GPU con `12 GB+ VRAM`
- `64 GB RAM`
- almacenamiento SSD/NVMe con espacio para artefactos y experimentos

## 15.4 Edge / inferencia

- gateway Linux con soporte `TensorFlow Lite`
- BeagleBone Black solo para despliegue compacto y eventual

---

## 16. Riesgos científicos

## 16.1 Riesgo 1. Sesgo de laboratorio

`PlantVillage` tiene fondos limpios y condiciones controladas.

Impacto:

- buena métrica offline
- mala generalización a campo

## 16.2 Riesgo 2. Desbalance de clases

Clases minoritarias pueden colapsar.

Impacto:

- precisión global engañosa
- baja sensibilidad en clases relevantes

## 16.3 Riesgo 3. Fuga de información

Si se mezclan duplicados o variantes derivadas entre `train` y `test`.

Impacto:

- métricas infladas

## 16.4 Riesgo 4. Sobreajuste a especie dominante

Tomate tiene más clases y más masa de datos que otras especies objetivo.

Impacto:

- el modelo parece multiclase robusto, pero depende desproporcionadamente de tomate

## 16.5 Riesgo 5. Mala calibración

Un modelo puede acertar top-1 pero estar mal calibrado.

Impacto:

- confianza engañosa
- mala trazabilidad para recomendación futura

## 16.6 Riesgo 6. Suposición excesiva de edge readiness

Un modelo bueno en cloud puede no ser viable en hardware restringido.

Impacto:

- ruptura entre laboratorio y despliegue

---

## 17. Pipeline completo recomendado

## Fase 1. Dataset curation

1. extraer las `16` clases
2. validar integridad
3. eliminar material no elegible
4. estandarizar taxonomía

## Fase 2. Split científico

1. detectar duplicados
2. partición `70/15/15`
3. preservar estratificación por clase

## Fase 3. Baseline training

1. entrenar `EfficientNet-B0`
2. entrenar `MobileNetV3-Large`

## Fase 4. Benchmark comparativo

1. `ResNet50`
2. `ConvNeXt-Tiny`

## Fase 5. Evaluación científica

1. macro F1
2. balanced accuracy
3. recall por clase
4. calibración
5. matriz de confusión

## Fase 6. Edge assessment

1. exportabilidad
2. cuantización
3. costo de inferencia

## Fase 7. Selección final

1. modelo maestro de laboratorio
2. modelo candidato edge
3. plan de validación en campo

---

## 18. Respuestas directas solicitadas

## 1. Arquitectura candidata principal

- `EfficientNet-B0`

## 2. Arquitectura candidata secundaria

- `MobileNetV3-Large`

## 3. Comparación `MobileNetV3 / EfficientNet / ResNet50 / ConvNeXt`

- `MobileNetV3`: mejor para edge
- `EfficientNet-B0`: mejor equilibrio global
- `ResNet50`: benchmark clásico robusto
- `ConvNeXt-Tiny`: benchmark más costoso y potente de laboratorio

## 4. Pipeline de preparación

- filtrado semántico
- curación mínima
- taxonomía EIARC
- estandarización
- split científico

## 5. Estrategia de augmentation

- flips, rotaciones suaves, jitter moderado, blur leve, compresión controlada

## 6. Control de desbalance

- weighted loss
- sampler balanceado
- augmentación dirigida

## 7. Métricas científicas

- macro F1
- balanced accuracy
- recall y precision por clase
- matriz de confusión
- calibración

## 8. Estrategia Train/Validation/Test

- `70/15/15`
- split estratificado
- control anti-fuga

## 9. Estrategia Edge AI

- exportar a `TensorFlow Lite`
- cuantización
- modelo compacto

## 10. Estrategia Cloud AI

- entrenamiento
- benchmark
- versionado
- selección final

## 11. Modelo recomendado para BeagleBone Black

- `MobileNetV3` cuantizado

## 12. Coste computacional

- bajo a alto:
  - `MobileNetV3`
  - `EfficientNet-B0`
  - `ResNet50`
  - `ConvNeXt-Tiny`

## 13. Tiempo estimado de entrenamiento

- de `1 a 10 horas` en GPU media según arquitectura

## 14. Hardware recomendado

- GPU de `8 GB+ VRAM`
- `32 GB RAM` mínimo
- SSD/NVMe

## 15. Riesgos científicos

- sesgo de laboratorio
- desbalance
- fuga de información
- sobreajuste a tomate
- mala calibración
- falsa sensación de edge readiness

---

## 19. Conclusión final

El pipeline correcto para la primera versión multiclase SIGCT-Rural V2 debe comenzar con `EfficientNet-B0` como baseline principal y `MobileNetV3-Large` como baseline edge-first, usando el subconjunto auditado de `21,160` imágenes y `16` clases.

Diagnóstico final de diseño:

- `EfficientNet-B0` es la mejor arquitectura central
- `MobileNetV3` es la mejor opción para transición a edge
- `ResNet50` y `ConvNeXt-Tiny` deben usarse como benchmarks, no como primera elección operativa
- el riesgo científico dominante sigue siendo la generalización a campo fuera de `PlantVillage`
