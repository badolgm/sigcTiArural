# AI_MLOPS_AND_TRAINING_GOVERNANCE_V2

## Fecha

2026-07-16

## Objetivo

Diseñar el sistema completo de gobierno científico, MLOps, entrenamiento, validación y operación multimodal de SIGCT-Rural V2 bajo estándares EIARC.

Este documento no entrena modelos, no implementa código y no descarga datasets. Solo establece el diseño rector para:

- agricultura inteligente
- salud animal
- telemetría predictiva
- audio intelligence
- señales de laboratorio
- sensores IoT
- collares inteligentes
- Knowledge AI
- Feature Engineering
- Edge AI
- Cloud AI

---

## 1. Resumen ejecutivo

SIGCT-Rural V2 no debe operar como una colección de notebooks y modelos aislados. Debe funcionar como una plataforma científica gobernada por cuatro pilares:

1. `Data Governance Layer`
2. `Scientific Training Governance`
3. `MLOps Platform Layer`
4. `Cloud-Edge Operational Layer`

La regla central es esta:

- ningún dato entra sin taxonomía
- ningún experimento vale sin trazabilidad
- ningún modelo se promueve sin validación científica
- ningún despliegue edge o cloud puede romper la semántica EIARC

Diagnóstico rector:

- `PlantVillage` y el baseline visual actual sirven como bootstrap
- la V2 exige gobierno unificado para visión, audio, señales, series temporales y multimodalidad
- la fuente de verdad semántica sigue siendo EIARC, no el `class_index`

---

## 2. Principios rectores

## 2.1 Trazabilidad científica

Toda predicción, feature, etiqueta, métrica y recomendación debe poder rastrearse a:

- dataset versión
- taxonomía versión
- experimento versión
- modelo versión
- contexto EIARC

## 2.2 Separación entre investigación y operación

Deben existir fronteras claras entre:

- exploración científica
- entrenamiento formal
- validación científica
- promoción a registro
- despliegue productivo

## 2.3 Gobierno multimodal

Visión, audio, señales, telemetría y conocimiento no deben gobernarse por artefactos distintos e incompatibles. Deben converger en un marco único de:

- metadatos
- taxonomía
- versionado
- evidencia

## 2.4 Cloud-edge coherente

Cloud y edge pueden usar modelos distintos, pero deben compartir:

- contrato semántico
- taxonomía EIARC
- trazabilidad de versión

## 2.5 Reproducibilidad obligatoria

Ningún resultado científico debe aceptarse si no puede reconstruirse desde:

- datos
- notebook o pipeline
- configuración
- seed
- artefactos de evaluación

---

## 3. Data Governance Layer

## 3.1 Propósito

Gobernar el ciclo de vida completo del dato desde su captura hasta su uso en entrenamiento, validación y monitoreo.

## 3.2 Capacidades obligatorias

1. clasificación del dato por contexto
2. versionado de datasets
3. versionado de etiquetas
4. versionado de taxonomías EIARC
5. control de calidad
6. trazabilidad de procedencia
7. reglas de retención y auditoría

## 3.3 Dominios gobernados

- `agriculture`
- `animal_health`
- `telemetry`
- `audio_intelligence`
- `lab_signals`
- `knowledge_ai`

## 3.4 Estados de gobernanza del dato

Cada dataset o tabla debe clasificarse como:

1. `raw`
2. `staged`
3. `curated`
4. `feature_ready`
5. `evaluation_ready`
6. `archived`

---

## 4. Cómo debe organizarse el Data Lake

## 4.1 Diseño lógico

El Data Lake debe organizarse por tres ejes:

1. `context`
2. `modality`
3. `lifecycle_stage`

## 4.2 Estructura recomendada

```text
data_lake/
  agriculture/
    images/
      raw/
      staged/
      curated/
      evaluation_ready/
    telemetry_context/
      raw/
      curated/
  animal_health/
    collars/
      raw/
      curated/
    signals/
      raw/
      curated/
    audio/
      raw/
      curated/
  telemetry/
    sensors/
      raw/
      staged/
      curated/
      feature_ready/
  lab_signals/
    raw/
    curated/
    feature_ready/
  knowledge_ai/
    documents/
      raw/
      curated/
      indexed/
  shared/
    taxonomies/
    label_schemas/
    manifests/
    splits/
    registries/
```

## 4.3 Reglas de organización

1. `raw` es inmutable
2. `staged` contiene limpieza mínima reproducible
3. `curated` contiene datos ya alineados a taxonomía
4. `feature_ready` contiene features versionadas
5. `evaluation_ready` contiene splits y gold sets

## 4.4 Reglas de naming

Cada dataset debe llevar:

- `context`
- `modality`
- `species_or_entity`
- `taxonomy_version`
- `label_schema_version`
- `dataset_version`

Ejemplo:

```text
agriculture_images_tomato-potato-corn_taxonomy-v1_labels-v1_dataset-v1
```

---

## 5. Dataset Versioning Strategy

## 5.1 Regla principal

Un dataset no se define por carpeta, sino por un manifiesto versionado.

## 5.2 Qué debe contener un manifiesto de dataset

1. `dataset_id`
2. `dataset_version`
3. `context`
4. `modality`
5. `source_list`
6. `taxonomy_version`
7. `label_schema_version`
8. `split_version`
9. `curation_rules`
10. `known_limitations`

## 5.3 Tipos de versión

### Major

Cambios incompatibles:

- cambio de taxonomía
- cambio fuerte de especies o clases

### Minor

Cambio compatible:

- nuevas muestras
- nueva curación
- mejora de metadatos

### Patch

Corrección puntual:

- eliminación de archivos corruptos
- ajuste menor de manifiesto

## 5.4 Regla de promoción

Un dataset solo debe pasar de `curated` a `evaluation_ready` si:

- tiene manifiesto
- tiene taxonomía cerrada
- tiene split versionado
- tiene reporte de calidad

---

## 6. Cómo deben versionarse etiquetas

## 6.1 Regla principal

Las etiquetas no deben vivir implícitas en nombres de carpeta o notas humanas. Deben vivir en un `label_schema` versionado.

## 6.2 Estructura mínima del label schema

1. `label_schema_version`
2. `context`
3. `allowed_fields`
4. `allowed_values`
5. `validation_rules`
6. `annotation_quality_levels`

## 6.3 Campos obligatorios por modalidad

### Agricultura

- `species`
- `condition_group`
- `condition_name`
- `health_state`
- `annotation_quality`
- `validation_source`

### Audio animal

- `species`
- `event_type`
- `acoustic_condition`
- `annotation_quality`

### Telemetría

- `sensor_id`
- `target_variable`
- `anomaly_label`
- `risk_level`

## 6.4 Regla crítica

Una etiqueta solo puede ser usada en entrenamiento si:

- existe en el `label_schema_version`
- es compatible con la `taxonomy_version`

---

## 7. Cómo deben versionarse taxonomías EIARC

## 7.1 Regla principal

La taxonomía EIARC debe versionarse como artefacto independiente y canónico.

## 7.2 Componentes de una taxonomía

1. `taxonomy_version`
2. `context`
3. `entity_tree`
4. `condition_groups`
5. `condition_names`
6. `semantic_codes`
7. `deprecation_rules`

## 7.3 Regla de evolución

La taxonomía puede:

- agregar clases
- deprecar clases
- fusionar clases

pero nunca romper silenciosamente la trazabilidad histórica.

## 7.4 Política de compatibilidad

Cada modelo debe declarar explícitamente:

- `taxonomy_version_supported`
- `label_schema_version_supported`

---

## 8. ETL Architecture

## 8.1 Propósito

Convertir fuentes heterogéneas en datasets curados, trazables y reproducibles.

## 8.2 Capas ETL

### Extract

- ingesta desde sensores, imágenes, audio, collares, logs y documentos

### Transform

- limpieza
- normalización
- enriquecimiento de metadatos
- alineación a taxonomía

### Load

- persistencia en `staged`, `curated`, `feature_ready` o `indexed`

## 8.3 ETL por modalidad

### Visión

- verificar formato
- extraer metadata
- validar etiqueta
- asociar taxonomía

### Audio

- normalizar frecuencia de muestreo
- segmentar eventos
- calcular metadatos acústicos

### Señales y telemetría

- sincronizar timestamps
- imputar faltantes de forma controlada
- agregar ventanas
- etiquetar eventos

### Knowledge AI

- parsear documentos
- indexar secciones
- extraer metadatos documentales

## 8.4 Reglas ETL

1. toda transformación debe ser reproducible
2. toda transformación debe quedar registrada
3. el ETL nunca debe mutar `raw`

---

## 9. EDA Strategy

## 9.1 Propósito

La EDA debe responder preguntas científicas, no solo producir gráficas.

## 9.2 EDA obligatoria por dataset

1. distribución por clase
2. calidad e integridad
3. balance de clases
4. valores faltantes
5. outliers
6. duplicados y near-duplicates
7. drift entre fuentes
8. cobertura taxonómica

## 9.3 EDA por modalidad

### Visión

- distribución por especie y condición
- resolución
- canal de color
- artefactos visuales

### Telemetría y señales

- estacionalidad
- autocorrelación
- missingness
- drift de sensor

### Audio

- duración
- frecuencia dominante
- energía
- ruido de fondo
- evento por especie

## 9.4 Salida esperada

Cada EDA debe producir:

- conclusiones
- riesgos
- decisiones de exclusión o curación

---

## 10. Feature Engineering Framework

## 10.1 Propósito

Transformar observaciones crudas en variables útiles y gobernadas.

## 10.2 Tipos de features

### Visión

- embeddings visuales
- descriptores de textura
- severidad estimada

### Telemetría

- rolling mean
- rolling std
- lag features
- slopes
- change points

### Collares y señales

- actividad agregada
- ratio de inmovilidad
- amplitud
- energía
- frecuencia dominante

### Audio

- MFCC
- spectral centroid
- bandwidth
- zero crossing rate
- chroma
- energía temporal

## 10.3 Reglas

1. cada feature debe tener definición formal
2. cada feature debe tener versión
3. cada feature debe tener unidad o interpretación

---

## 11. Cómo transformar señales en features

## 11.1 Señales temporales

Pipeline recomendado:

1. sincronización
2. limpieza
3. denoising
4. segmentación en ventanas
5. extracción de features
6. etiquetado contextual

## 11.2 Features recomendadas

- media
- desviación
- energía
- entropía
- kurtosis
- skewness
- FFT peaks
- power spectral density
- wavelet coefficients

## 11.3 Regla crítica

Las ventanas deben estar alineadas al fenómeno real, no solo a conveniencia computacional.

---

## 12. Signal Processing Framework

## 12.1 Propósito

Dar soporte formal al análisis de señales fisiológicas, ambientales y de laboratorio.

## 12.2 Pipeline

1. adquisición
2. calibración
3. sincronización
4. filtrado
5. segmentación
6. extracción de features
7. validación de señal
8. publicación a Feature Store

## 12.3 Técnicas recomendadas

- filtros pasa-bajo/pasa-banda
- FFT
- STFT
- wavelets
- detección de picos
- change point detection
- smoothing robusto

## 12.4 Aplicaciones

- telemetría predictiva
- collares inteligentes
- señales de laboratorio
- biomarcadores acústicos o vibracionales

---

## 13. Audio Intelligence Framework

## 13.1 Propósito

Diseñar una línea de IA basada en audio para especies animales y entornos rurales instrumentados.

## 13.2 Fuentes de audio objetivo

- abejas
- bovinos
- porcinos
- aves

## 13.3 Cómo analizar audio

### Abejas

Objetivos:

- estrés de colonia
- actividad anómala
- cambios acústicos por perturbación

Features:

- energía por banda
- espectro dominante
- variabilidad temporal
- embeddings acústicos

### Bovinos

Objetivos:

- vocalización de estrés
- alerta de malestar
- eventos de actividad anómalos

Features:

- MFCC
- patrones de vocalización
- duración
- intensidad
- frecuencia dominante

### Porcinos

Objetivos:

- detección de estrés
- tos o eventos respiratorios
- ruido anormal de corral

Features:

- eventos impulsivos
- espectrogramas
- embeddings acústicos
- detección de patrones repetitivos

### Aves

Objetivos:

- actividad normal
- eventos anómalos
- densidad acústica
- signos tempranos de estrés ambiental

Features:

- tasa de eventos
- densidad espectral
- variabilidad temporal
- embeddings por ventana

## 13.4 Framework recomendado

1. segmentación por ventanas
2. extracción de MFCC y espectrogramas
3. modelo baseline CNN o CRNN
4. agregación temporal por evento
5. validación contextual por especie

---

## 14. Time Series Framework

## 14.1 Propósito

Gestionar forecasting, anomalía y score de riesgo para telemetría y salud animal.

## 14.2 Componentes

1. forecasting univariante
2. forecasting multivariante
3. anomaly detection
4. risk scoring
5. event prediction

## 14.3 Modelos alineados a la arquitectura V2

- `Prophet`
- `ARIMA/SARIMA`
- `XGBoost`
- `LSTM`
- `GRU`
- `TCN`
- `Temporal Fusion Transformer`

## 14.4 Reglas

1. split temporal estricto
2. no mezclar futuro en entrenamiento
3. métricas por horizonte temporal

---

## 15. Computer Vision Framework

## 15.1 Propósito

Gobernar entrenamiento, validación y promoción de modelos visuales agrícolas y futuros modelos visuales animales.

## 15.2 Etapas

1. curación del dataset
2. definición taxonómica
3. split científico
4. entrenamiento baseline
5. benchmark comparativo
6. calibración
7. validación real

## 15.3 Arquitecturas iniciales

- `EfficientNet-B0`
- `MobileNetV3`
- `ResNet50`
- `ConvNeXt-Tiny`

## 15.4 Regla científica

No aceptar una clase específica si no está respaldada por:

- taxonomía
- dataset
- validación

---

## 16. Multimodal Fusion Framework

## 16.1 Propósito

Combinar imagen, telemetría, series temporales, señales, audio y conocimiento para mejorar diagnóstico y recomendación.

## 16.2 Diseño por fases

### Fase 1

- score-level fusion

### Fase 2

- feature-level fusion

### Fase 3

- dual tower / multimodal transformer

## 16.3 Entradas potenciales

- embedding visual
- embedding acústico
- features tabulares
- features temporales
- contexto documental

## 16.4 Reglas

1. la fusión no debe romper trazabilidad
2. cada modalidad debe conservar evidencia separable
3. el sistema debe poder explicar qué modalidad influyó

---

## 17. Cómo construir un Feature Store

## 17.1 Propósito

Centralizar features reutilizables, versionadas y trazables.

## 17.2 Componentes

1. catálogo de features
2. definiciones formales
3. pipeline de materialización
4. offline store
5. online store opcional

## 17.3 Estructura mínima del catálogo

Para cada feature:

1. `feature_name`
2. `feature_version`
3. `source_dataset_version`
4. `transformation_definition`
5. `unit_or_scale`
6. `owner_context`

## 17.4 Regla de acceso

Los modelos no deben recalcular features críticas ad hoc dentro de notebooks aislados si esas features ya están promovidas al store.

---

## 18. Experiment Tracking Strategy

## 18.1 Propósito

Registrar todo experimento de forma comparable y reproducible.

## 18.2 Campos mínimos por experimento

1. `experiment_id`
2. `research_question`
3. `context`
4. `dataset_version`
5. `taxonomy_version`
6. `label_schema_version`
7. `feature_set_version`
8. `model_architecture`
9. `hyperparameters`
10. `seed`
11. `metrics`
12. `artifacts`

## 18.3 Cómo gobernar experimentos

1. cada experimento debe responder una hipótesis concreta
2. no ejecutar notebooks “exploratorios” sin registrar contexto
3. no comparar modelos entrenados con datasets distintos sin declararlo

## 18.4 Resultado esperado

Un tablero de experimentos comparable por:

- contexto
- dataset
- arquitectura
- métrica

---

## 19. Cómo comparar modelos

## 19.1 Regla principal

Dos modelos solo son comparables si comparten:

- dataset_version
- split_version
- taxonomy_version
- label_schema_version
- objective

## 19.2 Comparación obligatoria

1. rendimiento global
2. rendimiento por clase
3. calibración
4. costo de inferencia
5. tamaño del modelo
6. robustez por entorno

## 19.3 Cómo usar curvas y métricas

### ROC

Útil para:

- clasificación binaria
- one-vs-rest en multiclase

### PR Curve

Útil para:

- clases minoritarias
- anomalía y detección de eventos

### Calibration Curve

Útil para:

- evaluar confiabilidad probabilística

### Confusion Matrix

Útil para:

- error por clase
- confusiones taxonómicas

### Macro F1

Métrica central para:

- multiclase desbalanceado

### AUROC

Métrica útil para:

- binario
- one-vs-rest
- salud animal y anomalía

---

## 20. Model Registry Strategy

## 20.1 Propósito

Registrar modelos candidatos, aprobados, deprecados y archivados.

## 20.2 Estados del registry

1. `candidate`
2. `validated`
3. `approved`
4. `production`
5. `deprecated`
6. `archived`

## 20.3 Metadatos obligatorios

1. `model_id`
2. `model_version`
3. `context`
4. `modality`
5. `dataset_version`
6. `taxonomy_version`
7. `label_schema_version`
8. `feature_set_version`
9. `training_experiment_id`
10. `scientific_scope`
11. `deployment_target`

## 20.4 Cómo seleccionar modelos para producción

Un modelo solo puede pasar a `production` si:

- supera umbrales científicos
- pasa validación en vida real
- tiene inferencia viable para su target
- tiene trazabilidad completa

---

## 21. Training Governance Model

## 21.1 Propósito

Evitar entrenamiento caótico, irreproducible o científicamente débil.

## 21.2 Fases obligatorias

1. `proposal`
2. `dataset approval`
3. `experiment approval`
4. `training execution`
5. `scientific review`
6. `validation review`
7. `registry decision`

## 21.3 Comité lógico de aprobación

En términos de rol, debe intervenir:

- arquitectura IA
- gobierno de datos
- validación científica del dominio
- operación/MLOps

## 21.4 Regla crítica

No entrenar un modelo “porque se puede”. Todo entrenamiento debe responder:

- qué pregunta científica resuelve
- qué datos usa
- qué métricas justifican promoción

---

## 22. Model Validation Framework

## 22.1 Capas de validación

1. validación offline
2. validación por clase o evento
3. validación por modalidad
4. validación de calibración
5. validación operacional
6. validación real de campo

## 22.2 Cómo validar modelos en vida real

### Agricultura

- imágenes reales de campo
- distintos dispositivos
- luz variable
- fondo complejo

### Salud animal

- correlato entre collar, observación humana y evento clínico

### Telemetría

- predicción vs realidad temporal
- anomalía vs evento observado

### Audio

- evento acústico validado por especie
- validación contextual y humana cuando aplique

---

## 23. Scientific Validation Framework

## 23.1 Propósito

Garantizar que el modelo no solo funcione técnicamente, sino científicamente.

## 23.2 Componentes

1. hipótesis de investigación
2. validez del dataset
3. validez del split
4. validez de métricas
5. validez externa
6. limitaciones declaradas

## 23.3 Regla de publicación científica interna

Todo resultado debe declarar:

- alcance
- limitaciones
- sesgos
- generalización esperada

---

## 24. Model Monitoring Framework

## 24.1 Propósito

Monitorear salud del modelo después del despliegue.

## 24.2 Señales mínimas de monitoreo

1. latencia
2. tasa de error
3. distribución de entradas
4. distribución de predicciones
5. confidence drift
6. cobertura de clases
7. feedback o confirmación posterior

## 24.3 Monitoreo por modalidad

### Visión

- calidad de imagen
- resolución
- cambios de dispositivo

### Audio

- ruido de fondo
- clipping
- cambios de ambiente acústico

### Telemetría

- missingness
- cambio de rango
- drift de sensor

---

## 25. Data Drift Detection

## 25.1 Objetivo

Detectar si la distribución de datos entrantes cambia respecto a entrenamiento.

## 25.2 Estrategias recomendadas

- PSI
- KS test
- distribución por feature
- embedding drift
- comparación por dispositivo o sensor

## 25.3 Aplicaciones

- cultivos de otra región
- nuevos teléfonos o cámaras
- nuevos sensores
- nuevas estaciones del año

---

## 26. Concept Drift Detection

## 26.1 Objetivo

Detectar si la relación entre entrada y salida cambió.

## 26.2 Señales de drift conceptual

1. caída sostenida de métricas reales
2. cambio en error por clase
3. degradación de calibración
4. aumento de revisiones humanas negativas

## 26.3 Reacción recomendada

1. abrir incidente científico
2. congelar promoción automática
3. revisar dataset
4. activar retraining plan

---

## 27. Notebook Architecture

## 27.1 Propósito

Evitar notebooks monolíticos, no reproducibles y sin foco.

## 27.2 Cómo diseñar notebooks científicos

Deben separarse por propósito:

1. `00_dataset_discovery`
2. `01_eda`
3. `02_feature_engineering`
4. `03_baseline_training`
5. `04_model_comparison`
6. `05_calibration_and_validation`
7. `06_error_analysis`
8. `07_export_and_edge_assessment`

## 27.3 Reglas

1. un notebook, una pregunta científica
2. sin lógica crítica duplicada si ya existe en pipeline
3. salida en artefactos guardables
4. seeds y versiones explícitas

## 27.4 Estructura interna recomendada

1. objetivo
2. inputs
3. supuestos
4. ejecución
5. resultados
6. conclusiones
7. riesgos

---

## 28. Research Workflow

## 28.1 Flujo recomendado

1. formular hipótesis
2. aprobar dataset y taxonomía
3. ejecutar EDA
4. definir features y baseline
5. entrenar benchmark
6. validar científicamente
7. documentar hallazgos
8. decidir promoción o nueva iteración

## 28.2 Regla de cierre

Una línea de investigación solo se considera cerrada si deja:

- informe de resultados
- artefactos
- métricas
- limitaciones
- decisión final

---

## 29. Cómo diseñar MLOps para SIGCT-Rural

## 29.1 Capa de datos

- Data Lake por contexto y modalidad
- manifests
- dataset registry
- split registry

## 29.2 Capa de features

- Feature Store
- catálogo versionado
- pipelines reproducibles

## 29.3 Capa de experimentos

- tracking
- comparación
- artefactos

## 29.4 Capa de modelos

- Model Registry
- promotion workflow
- rollback y deprecación

## 29.5 Capa de serving

- cloud serving
- edge serving
- semantic resolution layer común

## 29.6 Capa de observabilidad

- monitoring
- data drift
- concept drift
- incidentes científicos

---

## 30. Cómo integrar Edge AI y Cloud AI

## 30.1 Cloud AI

Responsable de:

- entrenamiento
- benchmark
- fusión multimodal pesada
- registry
- monitoreo central

## 30.2 Edge AI

Responsable de:

- inferencia compacta
- baja latencia
- tolerancia parcial a desconexión
- captura contextual

## 30.3 Regla de integración

Cloud publica a edge:

- modelo compactado
- taxonomía versión
- label schema versión
- thresholds
- semantic contract

## 30.4 Regla semántica

Aunque edge y cloud usen modelos distintos, ambos deben emitir:

- mismo `scientific_scope`
- misma taxonomía EIARC
- misma trazabilidad mínima

---

## 31. Cómo preservar trazabilidad científica

## 31.1 Cadena mínima de trazabilidad

```text
raw data
-> dataset manifest
-> split version
-> feature version
-> experiment id
-> model version
-> validation report
-> deployment target
```

## 31.2 Campos obligatorios en predicción o evaluación

- `model_id`
- `model_version`
- `dataset_version`
- `taxonomy_version`
- `label_schema_version`
- `scientific_scope`
- `source_mode`

---

## 32. Cómo documentar resultados científicos

## 32.1 Artefactos mínimos por línea de trabajo

1. objetivo
2. dataset usado
3. taxonomía y labels
4. metodología
5. métricas
6. limitaciones
7. conclusiones
8. decisión

## 32.2 Ubicación recomendada

Debe existir una línea documental de investigación dentro del ecosistema del Knowledge Hub o documentación técnica del proyecto.

## 32.3 Regla de evidencia

Toda afirmación relevante debe quedar soportada por:

- tabla
- gráfico
- matriz
- reporte reproducible

---

## 33. Roadmap completo de investigación

## Fase 0. Gobierno fundacional

1. cerrar taxonomías EIARC V2
2. cerrar esquemas de etiquetas
3. definir manifests y versiones

## Fase 1. Baseline agrícola

1. dataset V2 inicial
2. benchmark visual
3. validación multiclase

## Fase 2. Telemetría predictiva

1. dataset temporal curado
2. forecasting
3. anomalía y riesgo

## Fase 3. Collares y salud animal

1. dataset instrumentado
2. features temporales
3. clasificación y anomalía

## Fase 4. Audio Intelligence

1. captura por especie
2. eventos acústicos
3. baseline de clasificación o detección

## Fase 5. Señales de laboratorio

1. diseño de señales objetivo
2. preprocessing
3. features y baseline

## Fase 6. Knowledge AI

1. indexación
2. recuperación
3. soporte explicativo

## Fase 7. Fusión multimodal

1. score fusion
2. feature fusion
3. multimodal models

## Fase 8. MLOps operativo completo

1. registry
2. monitoring
3. drift
4. rollback
5. gobierno continuo

---

## 34. Respuestas directas solicitadas

## 1. Cómo debe organizarse el Data Lake

- por contexto, modalidad y ciclo de vida

## 2. Cómo deben versionarse datasets

- por manifiesto versionado con semver lógico

## 3. Cómo deben versionarse etiquetas

- mediante `label_schema_version`

## 4. Cómo deben versionarse taxonomías EIARC

- como artefactos canónicos independientes con compatibilidad explícita

## 5. Cómo diseñar notebooks científicos

- un notebook por pregunta científica, con estructura fija y artefactos reproducibles

## 6. Cómo diseñar pipelines ETL

- extract, transform, load reproducibles, sin mutar `raw`

## 7. Cómo analizar señales

- sincronización, filtrado, segmentación, extracción de features y validación

## 8. Cómo analizar audio

- segmentación, espectrogramas, MFCC, embeddings y validación contextual por especie

## 9. Cómo transformar señales en features

- ventanas temporales + estadística + frecuencia + wavelets + contexto

## 10. Cómo construir un Feature Store

- catálogo versionado, offline store y materialización reproducible

## 11. Cómo comparar modelos

- solo con mismas versiones de datos, splits y taxonomías

## 12. Cómo usar ROC, PR Curve, Calibration Curve, Confusion Matrix, Macro F1, AUROC

- ROC y AUROC para binario/ovr
- PR Curve para clases minoritarias
- Calibration Curve para confiabilidad
- Confusion Matrix para error por clase
- Macro F1 como métrica central de multiclase desbalanceado

## 13. Cómo gobernar experimentos

- por hipótesis, dataset aprobado, tracking y revisión científica

## 14. Cómo seleccionar modelos para producción

- umbrales científicos + validación real + viabilidad operacional + trazabilidad

## 15. Cómo validar modelos en vida real

- con datos reales de campo, correlato humano y eventos observados

## 16. Cómo diseñar MLOps para SIGCT-Rural

- data layer + feature layer + experiment layer + model layer + serving + observabilidad

## 17. Cómo integrar Edge AI y Cloud AI

- cloud entrena y gobierna; edge infiere y captura; ambos comparten semántica EIARC

## 18. Cómo preservar trazabilidad científica

- cadena completa de versiones desde dato crudo hasta predicción

## 19. Cómo documentar resultados científicos

- con reportes reproducibles, métricas, limitaciones y decisión final

## 20. Roadmap completo de investigación

- gobierno
- agricultura
- telemetría
- salud animal
- audio
- señales
- Knowledge AI
- fusión multimodal
- MLOps operativo

---

## 35. Conclusión final

SIGCT-Rural V2 debe operar como un sistema científico gobernado, no como una suma de modelos dispersos. La arquitectura correcta de MLOps y entrenamiento exige:

- Data Lake organizado y versionado
- taxonomías EIARC canónicas
- Feature Store versionado
- experiment tracking disciplinado
- Model Registry con estados de promoción
- validación científica real
- monitoreo de drift y desempeño
- continuidad cloud-edge con semántica común

Diagnóstico final:

- la V2 ya tiene una base documental suficiente para diseñar un sistema completo de gobierno científico
- el siguiente salto correcto no es entrenar indiscriminadamente, sino construir esta disciplina operativa sobre los contextos ya definidos
