# AI_DATASET_STRATEGY_V2

## Fecha

2026-07-16

## Objetivo

Definir la estrategia científica completa de datasets para SIGCT-Rural V2, alineada con `AI_CONTEXT_V2_ARCHITECTURE.md`, sin entrenar modelos, sin implementar código y sin descargar datasets.

Este documento debe fijar:

- qué datos necesitamos
- cuáles ya están disponibles o referenciados
- cuáles faltan
- qué taxonomía inicial debe gobernar el modelo multiclase V2
- cómo validar científicamente los futuros modelos

---

## 1. Resumen ejecutivo

La estrategia correcta de datasets para SIGCT-Rural V2 debe partir de una realidad ya confirmada:

1. el modelo actual `plant_disease_mbv2.h5` es binario
2. en el repositorio actual **no está materializado** un dataset `PlantVillage-Dataset-master`
3. sí existen referencias documentales y tooling para preparar un dataset vegetal estandarizado
4. la V2 no debe depender de un único dataset de laboratorio, sino de una combinación de:
   - dataset base público
   - datos reales de campo
   - series temporales internas
   - telemetría IoT
   - datos instrumentados de collares
   - taxonomías y conocimiento canónico

Diagnóstico central de datos:

- **PlantVillage sirve como bootstrap, no como verdad de producción**
- la primera taxonomía V2 debe ser más pequeña, más gobernable y más alineada a SIGCT-Rural
- salud animal y telemetría deben depender prioritariamente de datos propios instrumentados

---

## 2. Estado actual de datos

## 2.1 Qué datos están verificados en el repositorio

Verificado en disco:

- `src/ai_models/production_models/plant_disease_mbv2.h5`
- `src/ai_models/production_models/model_metadata.json`
- `src/ai_models/test_leaf.jpg`
- notebooks y scripts de preparación/entrenamiento en `src/ai_models/notebooks/`
- script `prepare_plant_disease_dataset.py`

## 2.2 Qué datos están referenciados pero no materializados

Referenciado, pero no encontrado físicamente en el repo actual:

- `PlantVillage-Dataset-master`
- `data/datasets/PlantVillage-Dataset`
- `plantdisease_kaggle.zip`
- datasets internos agrícolas etiquetados
- datasets internos pecuarios etiquetados
- datasets internos de collares versionados
- datasets telemétricos curados para IA

## 2.3 Qué afirma la documentación histórica

El `README.md` afirma históricamente:

- `PlantVillage (54,305 imágenes)`
- `38 enfermedades (tomate, papa, maíz)`

Esto debe tratarse como:

- **referencia histórica/documental**
- no como evidencia de dataset presente en disco hoy

## 2.4 Conclusión de gobernanza

Para SIGCT-Rural V2 deben distinguirse tres estados de dato:

1. `VERIFICADO EN DISCO`
2. `REFERENCIADO / ESPERADO`
3. `FALTANTE`

---

## 3. Qué datasets agrícolas deben utilizarse

La estrategia agrícola V2 debe ser en capas.

## 3.1 Capa A. Dataset bootstrap público

### Dataset principal recomendado

- `PlantVillage`

Uso correcto:

- preentrenamiento o baseline multiclase
- pruebas controladas de arquitectura
- comparación inicial entre modelos

Razón:

- ya existe afinidad histórica con el proyecto
- es ampliamente usado
- permite iniciar taxonomías vegetales comunes

## 3.2 Capa B. Datasets de campo complementarios

Deben incorporarse datasets con:

- fondos reales
- iluminación no controlada
- hojas parcialmente ocultas
- ruido de campo
- variación por dispositivo

Tipos recomendados:

- datasets académicos de enfermedades vegetales en condiciones de campo
- colecciones de hojas en cultivo real
- imágenes propias tomadas por SIGCT-Rural

## 3.3 Capa C. Datasets internos SIGCT-Rural

Deben construirse como dataset prioritario V2:

- fotografías reales de cultivos objetivo
- contexto ambiental asociado
- fecha y ubicación
- estado fenológico
- validación por experto cuando exista

## 3.4 Capa D. Datasets de estrés y contexto

Además de enfermedad, la V2 debe capturar:

- estrés hídrico
- estrés térmico
- deficiencia nutricional
- daño mecánico
- presencia de plaga visible

Esto evita que el modelo aprenda un falso mundo “solo enfermedad vs sano”.

---

## 4. Qué datasets deben descartarse

No todo dataset agrícola sirve para V2.

## 4.1 Deben descartarse como fuente principal

1. datasets exclusivamente de laboratorio con fondos uniformes, si no tienen complemento de campo
2. datasets con etiquetas ambiguas o sin taxonomía verificable
3. datasets raspados sin procedencia clara
4. datasets con mezcla no controlada de múltiples enfermedades en una misma etiqueta
5. datasets duplicados o near-duplicate entre train y test
6. datasets sin licencia clara o sin posibilidad de trazabilidad
7. datasets con imágenes excesivamente procesadas o artificialmente limpiadas

## 4.2 Deben descartarse para la primera V2

1. clases agrícolas exóticas no alineadas con SIGCT-Rural
2. especies que no tengan relevancia operativa inicial
3. categorías con pocas muestras imposibles de validar científicamente

## 4.3 Regla práctica de descarte

Un dataset debe salir de la estrategia principal si falla cualquiera de estas condiciones:

- procedencia no verificable
- taxonomía no alineable a EIARC
- imposibilidad de partición científica correcta
- sesgo extremo de captura

---

## 5. Qué datasets complementan PlantVillage

`PlantVillage` no debe quedarse solo.

## 5.1 Complementos obligatorios

1. imágenes reales de campo por cultivo
2. imágenes con iluminación variable
3. hojas parcialmente dañadas, sucias o rotas
4. imágenes con fondos complejos
5. imágenes tomadas con móviles y cámaras edge reales

## 5.2 Complementos deseables

1. datasets de severidad de lesión
2. datasets de detección y segmentación de lesiones
3. datasets de estrés nutricional
4. datasets de estrés hídrico
5. datasets climáticos asociados a brotes

## 5.3 Complementos críticos por contexto SIGCT-Rural

1. telemetría ambiental asociada a la captura
2. fecha de toma
3. parcela o unidad productiva
4. validación humana del caso
5. trazabilidad del dispositivo capturador

---

## 6. Qué enfermedades agrícolas deben formar parte de la taxonomía inicial V2

La taxonomía inicial V2 no debe intentar cubrir todo el universo fitosanitario. Debe empezar con una taxonomía gobernable.

## 6.1 Regla de diseño de taxonomía inicial

La primera versión debe incluir:

- enfermedades frecuentes
- clases visualmente distinguibles
- clases con relevancia productiva
- clases que puedan sostenerse con datos

## 6.2 Taxonomía inicial recomendada V2

### Tomate

1. `healthy`
2. `early_blight`
3. `late_blight`
4. `leaf_mold`
5. `septoria_leaf_spot`
6. `bacterial_spot`
7. `target_spot`
8. `mosaic_virus`
9. `yellow_leaf_curl_virus`

### Papa

10. `healthy`
11. `early_blight`
12. `late_blight`

### Maíz

13. `healthy`
14. `cercospora_leaf_spot_gray_leaf_spot`
15. `common_rust`
16. `northern_leaf_blight`

### Cacao

17. `healthy`
18. `moniliasis`
19. `black_pod`
20. `witches_broom`

### Café

21. `healthy`
22. `coffee_leaf_rust`
23. `cercospora_leaf_spot`
24. `anthracnose`

### Banano

25. `healthy`
26. `black_sigatoka`
27. `yellow_sigatoka`
28. `fusarium_wilt`

## 6.3 Observación importante

Tomate, papa y maíz tienen mayor respaldo inicial por afinidad con `PlantVillage`.

Cacao, café y banano deben entrar como extensión V2 gobernada por datos propios y datasets de campo complementarios.

---

## 7. Qué especies agrícolas deben entrar en la primera versión

## 7.1 Primera versión recomendada

Debe entrar en V2 inicial:

1. tomate
2. papa
3. maíz

## 7.2 Segunda ola

Debe entrar después:

4. cacao
5. café
6. banano

## 7.3 Justificación

Tomate, papa y maíz:

- tienen respaldo histórico en el proyecto
- tienen mayor afinidad con `PlantVillage`
- permiten construir un baseline multiclase sólido

Cacao, café y banano:

- son estratégicos para contexto latinoamericano y rural
- pero requieren dataset más curado y contextual

---

## 8. Estrategia por cultivo

## 8.1 Tomate

### Fuente principal

- `PlantVillage`

### Complemento

- imágenes de campo reales
- variación por etapa fenológica

### Estrategia

- usar tomate como cultivo piloto principal
- construir baseline multiclase
- usarlo para validar taxonomía, pipeline y semántica

## 8.2 Papa

### Fuente principal

- `PlantVillage`

### Estrategia

- comenzar con `healthy`, `early_blight`, `late_blight`
- mantener conjunto pequeño y robusto

## 8.3 Maíz

### Fuente principal

- `PlantVillage`

### Estrategia

- priorizar enfermedades foliares visualmente claras
- complementar con campo por variación real de iluminación y cultivo

## 8.4 Cacao

### Fuente principal

- datasets de campo específicos y captura propia

### Estrategia

- no depender de datasets genéricos pequeños sin validación
- construir dataset interno progresivo con expertos y eventos reales

## 8.5 Café

### Fuente principal

- datasets de roya y manchas foliares
- captura propia

### Estrategia

- priorizar `coffee_leaf_rust`
- construir taxonomía pequeña y científicamente defendible

## 8.6 Banano

### Fuente principal

- datasets de sigatoka y fusariosis
- captura propia en condiciones de campo

### Estrategia

- arrancar con pocas clases de alto valor
- evitar sobreexpandir taxonomía antes de tener datos suficientes

---

## 9. Estrategia de datasets para salud animal

La estrategia animal no debe depender de visión solamente.

## 9.1 Tipos de datos requeridos

1. acelerometría
2. temperatura corporal o superficial
3. actividad
4. patrones de descanso
5. eventos de alimentación
6. localización o movimiento relativo
7. registros veterinarios
8. eventos productivos

## 9.2 Datasets recomendados

### Públicos

- datasets académicos de comportamiento animal con acelerometría
- datasets de clasificación de postura y actividad
- datasets de detección de anomalía conductual

### Internos

- históricos pecuarios SIGCT-Rural
- observaciones de comportamiento
- eventos clínicos o productivos

## 9.3 Regla de prioridad

En salud animal, los datos internos valen más que datasets públicos genéricos, porque:

- la señal depende del sensor
- la señal depende del tipo de animal
- la señal depende del contexto productivo

---

## 10. Estrategia de datasets para collares inteligentes

## 10.1 Qué señales deben capturarse

1. timestamp
2. id del animal
3. id del collar
4. aceleración triaxial
5. temperatura
6. actividad acumulada
7. eventos derivados
8. nivel de batería
9. pérdida de señal

## 10.2 Qué etiquetas deben construirse

1. reposo
2. actividad normal
3. alimentación
4. desplazamiento prolongado
5. inactividad anómala
6. estrés térmico sospechado
7. alerta veterinaria sospechada

## 10.3 Diseño del dataset

El dataset debe organizarse por ventanas temporales:

- 30 segundos
- 1 minuto
- 5 minutos
- 15 minutos

Cada ventana debe incluir:

- features agregadas
- estado observado
- etiqueta validada
- contexto ambiental

## 10.4 Requisito científico

Las etiquetas de collares no deben salir solo del sensor; deben apoyarse en:

- observación humana
- evento veterinario
- corroboración contextual

---

## 11. Estrategia de datasets de telemetría

## 11.1 Fuentes

- sensores ambientales
- estaciones IoT
- históricos de telemetría del sistema
- eventos operativos

## 11.2 Variables mínimas

1. temperatura
2. humedad
3. pH
4. gases relevantes
5. presión
6. timestamp
7. sensor_id
8. ubicación o contexto
9. estado operativo

## 11.3 Objetivos del dataset

1. forecasting
2. detección de anomalías
3. score de riesgo
4. predicción de eventos

## 11.4 Diseño recomendado

Debe existir una versión canónica tabular y otra por ventanas temporales:

- tabla cruda
- tabla agregada por ventana
- tabla de eventos
- tabla de etiquetas de anomalía/riesgo

## 11.5 Datasets públicos complementarios

Se pueden usar como apoyo:

- datasets de smart farming
- datasets multivariados de anomalías temporales

Pero no deben sustituir la telemetría real de SIGCT-Rural.

---

## 12. Diseño de taxonomía canónica EIARC

## 12.1 Estructura recomendada

La taxonomía V2 debe tener cuatro niveles:

1. `context`
2. `species_or_entity`
3. `condition_group`
4. `condition_name`

## 12.2 Ejemplo agrícola

```text
context: agriculture
species_or_entity: tomato
condition_group: disease
condition_name: early_blight
```

## 12.3 Ejemplo animal

```text
context: animal_health
species_or_entity: bovine
condition_group: behavior_anomaly
condition_name: prolonged_inactivity
```

## 12.4 Ejemplo telemetría

```text
context: telemetry
species_or_entity: greenhouse_sensor_network
condition_group: anomaly
condition_name: humidity_drift
```

## 12.5 Reglas de taxonomía

1. estable
2. versionada
3. sin depender de `class_index`
4. alineada al contrato EIARC
5. extensible a cloud y edge

---

## 13. Diseño de etiquetas oficiales

## 13.1 Campos mínimos por muestra

### Agricultura

- `sample_id`
- `capture_device`
- `capture_datetime`
- `source_dataset`
- `context`
- `species`
- `condition_group`
- `condition_name`
- `health_state`
- `severity`
- `annotation_quality`
- `validation_source`
- `environment_context`

### Salud animal

- `animal_id`
- `collar_id`
- `window_start`
- `window_end`
- `behavior_label`
- `anomaly_label`
- `validation_source`

### Telemetría

- `sensor_id`
- `window_start`
- `window_end`
- `target_variable`
- `forecast_label`
- `anomaly_label`
- `risk_level`

## 13.2 Etiquetas oficiales recomendadas

### annotation_quality

- `expert_validated`
- `field_validated`
- `weak_label`
- `synthetic_label`

### validation_source

- `expert`
- `field_observation`
- `sensor_rule`
- `historical_event`

### health_state

- `healthy`
- `warning`
- `critical`
- `unknown`

---

## 14. Diseño Train / Validation / Test

## 14.1 Regla general

No debe hacerse split aleatorio ingenuo cuando exista riesgo de fuga de información.

## 14.2 Agricultura

### Recomendación

- `Train`: 70%
- `Validation`: 15%
- `Test`: 15%

### Regla crítica

Separar por:

- parcela o sesión de captura
- dispositivo
- fecha

cuando existan esos metadatos

## 14.3 Salud animal

### Recomendación

Split por:

- animal
- periodo temporal
- dispositivo/collar

No mezclar ventanas del mismo evento entre train y test.

## 14.4 Telemetría

### Recomendación

Split temporal:

- train en periodo histórico más antiguo
- validation en periodo intermedio
- test en periodo más reciente

Nunca mezclar el futuro en entrenamiento.

## 14.5 Holdout de vida real

Además del test formal, debe existir:

- `real_world_holdout`

compuesto por muestras completamente separadas del pipeline de entrenamiento.

---

## 15. Estrategia de validación en vida real

## 15.1 Agricultura

La validación real debe usar:

- imágenes capturadas en campo
- condiciones variables de luz
- distintos fondos
- distintos dispositivos
- distintas etapas del cultivo

## 15.2 Salud animal

La validación real debe cruzar:

- señal de collar
- observación humana
- evento clínico o productivo

## 15.3 Telemetría

La validación real debe comparar:

- predicción vs valor real observado
- detección de anomalía vs evento operativo real

## 15.4 Regla de validación externa

Debe existir una capa de validación de expertos cuando el resultado implique:

- diagnóstico de enfermedad
- riesgo crítico animal
- recomendación agronómica/pecuaria sensible

---

## 16. Métricas científicas recomendadas

## 16.1 Agricultura

- macro F1
- recall por clase
- precision por clase
- balanced accuracy
- matriz de confusión
- calibration error

## 16.2 Severidad visual

- MAE
- weighted kappa
- IoU o Dice si hay segmentación

## 16.3 Salud animal

- F1 por evento
- AUROC
- PR-AUC
- recall de anomalía
- false alarm rate

## 16.4 Telemetría

- MAE
- RMSE
- MAPE o sMAPE
- precision/recall de anomalías
- detection delay

## 16.5 Métricas transversales

- robustez por dispositivo
- robustez por contexto de captura
- drift de datos
- drift de concepto
- cobertura de trazabilidad

---

## 17. Roadmap de datasets por prioridad

## Prioridad 1. Agricultura base V2

Objetivo:

- tomate
- papa
- maíz

Acciones de diseño:

- usar `PlantVillage` como bootstrap
- definir taxonomía reducida
- exigir complemento de campo

## Prioridad 2. Dataset real agrícola SIGCT-Rural

Objetivo:

- captura propia
- metadatos de campo
- validación contextual

## Prioridad 3. Telemetría AI

Objetivo:

- consolidar series temporales limpias
- eventos
- etiquetas de anomalía y riesgo

## Prioridad 4. Collares inteligentes

Objetivo:

- ventanas temporales
- comportamiento
- anomalías

## Prioridad 5. Salud animal validada

Objetivo:

- dataset multimodal con correlato veterinario y productivo

## Prioridad 6. Cacao, café y banano

Objetivo:

- expansión de taxonomía agrícola regional

---

## 18. Qué datos necesitamos

## 18.1 Agricultura

- imágenes multiclase por especie
- imágenes de campo
- metadatos de captura
- severidad
- validación experta o de campo

## 18.2 Animal Health

- señales de collares
- eventos observados
- histórico veterinario o productivo
- contexto ambiental

## 18.3 Telemetry

- series históricas limpias
- sensores sincronizados
- eventos etiquetados
- contexto operativo

## 18.4 Knowledge AI

- taxonomías curadas
- catálogos de síntomas
- acciones oficiales
- documentación indexable

---

## 19. Cuáles ya tenemos

## 19.1 Verificado

- modelo binario actual
- metadata binaria actual
- notebooks y scripts de preparación
- referencias históricas a `PlantVillage`

## 19.2 Parcialmente disponibles

- conocimiento documental
- arquitectura V2
- taxonomía semántica general EIARC

## 19.3 No verificado en disco

- dataset `PlantVillage` materializado
- datasets agrícolas reales propios
- datasets pecuarios etiquetados
- datasets de collares versionados
- datasets telemétricos curados para IA

---

## 20. Cuáles faltan

Faltan de forma explícita:

1. dataset agrícola real de campo versionado
2. taxonomía V2 agrícola curada y cerrada
3. datasets pecuarios etiquetados
4. datasets de collares por ventanas temporales
5. dataset telemétrico canónico para forecasting y anomalías
6. manifiestos de dataset versionados por contexto
7. protocolo de validación real en campo

---

## 21. Qué clases tendrá el modelo multiclase V2

## 21.1 V2 inicial recomendada

La primera versión multiclase V2 debe cubrir:

### Tomate

- `tomato__healthy`
- `tomato__early_blight`
- `tomato__late_blight`
- `tomato__leaf_mold`
- `tomato__septoria_leaf_spot`
- `tomato__bacterial_spot`
- `tomato__target_spot`
- `tomato__mosaic_virus`
- `tomato__yellow_leaf_curl_virus`

### Papa

- `potato__healthy`
- `potato__early_blight`
- `potato__late_blight`

### Maíz

- `corn__healthy`
- `corn__gray_leaf_spot`
- `corn__common_rust`
- `corn__northern_leaf_blight`

### Total inicial recomendado

- `16 clases`

## 21.2 V2 expansión

Luego agregar:

- cacao
- café
- banano

---

## 22. Cómo validar científicamente los futuros modelos

La validación científica de SIGCT-Rural V2 debe cumplir cinco niveles:

1. validación interna offline
2. validación por clase y por contexto
3. validación por dispositivo y entorno
4. validación temporal y de drift
5. validación real con expertos o evidencia de campo

## Regla final

Un modelo no debe considerarse listo para publicación si:

- solo funciona bien en `PlantVillage`
- no generaliza a campo
- no mantiene trazabilidad de taxonomía
- no preserva métricas por clase
- no resiste validación real

---

## 23. Conclusión final

La estrategia de datasets de SIGCT-Rural V2 debe construirse sobre una arquitectura de gobierno del dato, no sobre una suma improvisada de imágenes.

Diagnóstico final:

- `PlantVillage` debe usarse, pero no absolutizarse
- tomate, papa y maíz deben ser la primera ola multiclase
- cacao, café y banano deben entrar en una segunda ola regional
- salud animal y collares deben apoyarse principalmente en datos propios
- telemetría debe consolidarse como dataset temporal versionado
- la taxonomía canónica EIARC debe gobernar clases, etiquetas y validación
