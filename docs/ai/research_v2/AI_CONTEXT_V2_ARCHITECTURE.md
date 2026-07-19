# AI_CONTEXT_V2_ARCHITECTURE

## Fecha

2026-07-16

## Objetivo

Definir la arquitectura objetivo de IA de SIGCT-Rural V2 como evolución del AI Context actual hacia una plataforma multimodal, científicamente trazable y operacionalmente compatible con EIARC.

Este documento no implementa cambios, no entrena modelos y no descarga datasets. Solo diseña la arquitectura objetivo.

---

## 1. Resumen ejecutivo

El estado actual del AI Context confirma que:

- el modelo `plant_disease_mbv2.h5` es binario
- la trazabilidad científica ya fue corregida a nivel semántico y de UI
- el siguiente paso correcto no es seguir expandiendo el binario actual, sino diseñar una **arquitectura V2 multimodal**

La arquitectura objetivo V2 debe separar la IA en ocho bloques coordinados:

1. `Agriculture AI Context`
2. `Animal Health AI Context`
3. `Telemetry AI Context`
4. `Feature Engineering Layer`
5. `Computer Vision Layer`
6. `Time Series Prediction Layer`
7. `Recommendation Engine`
8. `Knowledge AI Layer`

La idea central es esta:

- la V1 actual resuelve inferencia puntual de imagen con semántica mínima
- la V2 debe combinar visión, series temporales, telemetría, eventos edge, conocimiento estructurado y recomendaciones explicables

---

## 2. Principios rectores V2

## 2.1 Principio de trazabilidad científica

Ninguna recomendación diagnóstica o prescriptiva debe exceder el alcance real del modelo que la produce.

## 2.2 Principio multimodal

La IA no debe depender de una sola fuente. Debe poder integrar:

- imagen
- telemetría
- series temporales
- sensores ambientales
- eventos pecuarios
- conocimiento documental

## 2.3 Principio cloud-edge

La V2 debe permitir:

- inferencia rápida y robusta en edge
- entrenamiento, recalibración y analítica avanzada en cloud

## 2.4 Principio de desacoplamiento semántico

Los modelos pueden cambiar, pero la semántica publicada a negocio debe seguir gobernada por el contrato EIARC.

## 2.5 Principio de modularidad por contexto

Agricultura, salud animal, telemetría y conocimiento no deben convivir como scripts aislados, sino como subcontextos coordinados dentro del AI Context.

---

## 3. Arquitectura objetivo

## 3.1 Vista de alto nivel

```text
Fuentes de datos
-> Ingesta y normalización
-> Feature Engineering Layer
-> Motores de inferencia especializados
-> Semantic Resolution Layer
-> Recommendation Engine
-> Knowledge AI Layer
-> Publicación vía contratos EIARC
```

## 3.2 Fuentes de entrada

### Agricultura

- PlantVillage
- imágenes de hojas y cultivos reales
- históricos agrícolas
- sensores ambientales
- telemetría de cultivo

### Salud animal

- collares inteligentes
- acelerometría
- temperatura corporal
- actividad
- eventos de alimentación y movimiento
- históricos pecuarios

### Telemetría

- sensores IoT
- temperatura
- humedad
- pH
- gases
- presión
- series temporales de operación

### Conocimiento

- Knowledge Hub
- documentos técnicos
- catálogos de síntomas
- taxonomías
- runbooks
- lineamientos agronómicos y pecuarios

## 3.3 Componentes estructurales

### Capa 1. Data Ingestion

Responsable de:

- capturar datos desde edge y cloud
- normalizar formatos
- validar calidad mínima
- enrutar a pipelines correctos

### Capa 2. Feature Engineering Layer

Responsable de:

- extraer variables derivadas
- construir ventanas temporales
- fusionar sensores, contexto y metadata biológica
- preparar tensores y features tabulares

### Capa 3. Specialized Inference Engines

Incluye:

- `Computer Vision Layer`
- `Time Series Prediction Layer`
- modelos tabulares y multimodales

### Capa 4. Semantic Resolution Layer

Responsable de:

- traducir salida cruda a contrato semántico EIARC
- mantener trazabilidad
- controlar alcance científico

### Capa 5. Recommendation Engine

Responsable de:

- transformar predicciones en acciones sugeridas
- combinar reglas, umbrales y conocimiento experto
- distinguir recomendación automática de recomendación asistida

### Capa 6. Knowledge AI Layer

Responsable de:

- enriquecer inferencias con conocimiento documental
- justificar recomendaciones
- soportar RAG técnico y continuidad operativa

---

## 4. Agriculture AI Context

## 4.1 Propósito

Diagnosticar condición vegetal, predecir evolución fitosanitaria, detectar estrés y sugerir acciones agronómicas a partir de imagen, ambiente y contexto histórico.

## 4.2 Subcapacidades

1. clasificación de salud vegetal
2. diagnóstico multiclase de enfermedades
3. detección de estrés hídrico o térmico
4. estimación de severidad
5. recomendación agronómica explicable

## 4.3 Modelos recomendados

### Fase base

- `MobileNetV3`
- `EfficientNet-B0/B1`
- `ResNet50`

Uso recomendado:

- clasificación multiclase de enfermedades vegetales
- despliegue edge con versiones compactas

### Fase intermedia

- `ConvNeXt-Tiny`
- `EfficientNetV2-S`
- `ViT-Base` para experimentación cloud

Uso recomendado:

- mayor precisión en clasificación fina
- evaluación comparativa en laboratorio

### Fase avanzada

- visión multimodal con fusión de imagen + ambiente
- arquitectura dual tower:
  - CNN/ViT para imagen
  - MLP/Transformer tabular para sensores

## 4.4 Datasets recomendados

### Base inicial

- `PlantVillage`

Rol:

- bootstrap de clasificación de enfermedades vegetales

### Complementos recomendados

- imágenes reales propias de SIGCT-Rural
- datasets de hojas en condiciones de campo
- colecciones de estrés foliar y deficiencia nutricional
- históricos agrícolas internos etiquetados

## 4.5 Riesgo principal

`PlantVillage` por sí solo no basta para producción porque introduce sesgo de laboratorio y fondos limpios.

---

## 5. Animal Health AI Context

## 5.1 Propósito

Detectar anomalías de comportamiento y salud animal combinando collares inteligentes, sensores fisiológicos, telemetría y series históricas pecuarias.

## 5.2 Subcapacidades

1. detección de anomalía conductual
2. clasificación de actividad
3. alerta temprana de estrés o enfermedad
4. predicción de deterioro fisiológico
5. soporte a decisión zootécnica

## 5.3 Modelos recomendados

### Modelos base para edge

- `XGBoost`
- `LightGBM`
- `RandomForest`

Uso:

- clasificación tabular rápida
- señales derivadas de collares y sensores

### Modelos secuenciales

- `LSTM`
- `GRU`
- `Temporal Convolutional Networks`

Uso:

- detección de cambios de patrón
- predicción temporal de actividad y salud

### Modelos avanzados

- `Temporal Fusion Transformer`
- `Informer`

Uso:

- predicción multihorizonte
- priorización cloud para series complejas

## 5.4 Datasets recomendados

### Internos

- históricos pecuarios de SIGCT-Rural
- señales de collares inteligentes
- eventos veterinarios y productivos

### Externos recomendados

- datasets académicos de comportamiento bovino/caprino/porcino basados en acelerometría
- datasets de actividad animal con etiquetas de postura, movimiento y alimentación

## 5.5 Estrategia de dataset

Este contexto debe depender más de datos propios instrumentados que de datasets públicos genéricos, porque la validez operacional depende del tipo de animal, sensor y contexto local.

---

## 6. Telemetry AI Context

## 6.1 Propósito

Convertir telemetría ambiental y operacional en alertas predictivas, pronósticos, score de riesgo y eventos de mantenimiento inteligente.

## 6.2 Subcapacidades

1. forecasting de temperatura, humedad y variables ambientales
2. detección de drift y anomalías
3. predicción de riesgo operativo
4. clasificación de estado del sistema
5. soporte a mantenimiento predictivo

## 6.3 Modelos recomendados

### Baseline

- `Prophet`
- `ARIMA/SARIMA`
- `XGBoost` sobre features temporales

### Modelos robustos

- `LSTM`
- `GRU`
- `TCN`

### Modelos avanzados cloud

- `Temporal Fusion Transformer`
- `N-BEATS`
- `PatchTST`

## 6.4 Datasets recomendados

- IoT Telemetry de SIGCT-Rural
- históricos de sensores ambientales
- históricos de eventos y fallos
- datasets públicos de smart agriculture y smart livestock telemetry

---

## 7. Feature Engineering Layer

## 7.1 Responsabilidad

Es la capa crítica que permite fusionar datos heterogéneos en una representación útil para los modelos.

## 7.2 Features agrícolas recomendadas

- medias móviles de temperatura y humedad
- déficit de presión de vapor estimado
- tasa de cambio diaria
- contexto de estación o ciclo
- metadata de cultivo
- señales de iluminación y riego

## 7.3 Features pecuarias recomendadas

- nivel de actividad
- patrones circadianos
- ratio de inmovilidad
- variabilidad térmica
- episodios de aceleración
- frecuencia de alimentación o desplazamiento

## 7.4 Features de telemetría recomendadas

- rolling mean
- rolling std
- slope
- lag features
- diferencias de primer y segundo orden
- índices de estabilidad

## 7.5 Componentes de ingeniería recomendados

- pipeline de limpieza
- extractor de ventanas temporales
- normalizador por dispositivo
- catálogo de features versionado
- store de features canónico

---

## 8. Computer Vision Layer

## 8.1 Responsabilidad

Procesar imagen agrícola y eventualmente imagen animal para producir:

- clasificación
- detección
- segmentación
- estimación de severidad visual

## 8.2 Arquitecturas recomendadas

### Clasificación

- `MobileNetV3`
- `EfficientNet`
- `ConvNeXt`

### Detección

- `YOLOv8n/s`
- `YOLOv9-tiny` o equivalentes compactos

### Segmentación

- `U-Net`
- `DeepLabV3+`

## 8.3 Estrategia V2

### Fase 1

- clasificación multiclase vegetal

### Fase 2

- detección de lesiones

### Fase 3

- segmentación y estimación de severidad por área afectada

---

## 9. Time Series Prediction Layer

## 9.1 Responsabilidad

Modelar comportamiento temporal de:

- sensores ambientales
- telemetría de animales
- actividad de dispositivos
- variables agronómicas

## 9.2 Capacidades objetivo

1. forecasting
2. anomaly detection
3. early warning
4. risk scoring
5. scenario simulation

## 9.3 Diseño recomendado

### Edge

- modelos compactos y reglas de alerta

### Cloud

- modelos de mayor costo para entrenamiento y recalibración

### Publicación

- resultados resumidos a contrato semántico:
  - normal
  - warning
  - critical
  - unknown

---

## 10. Recommendation Engine

## 10.1 Propósito

Transformar salidas predictivas en acciones útiles, justificadas y operacionalmente seguras.

## 10.2 Diseño recomendado

El Recommendation Engine debe ser híbrido:

1. componente basado en reglas
2. componente basado en modelos
3. capa de validación por contexto
4. capa de explicación

## 10.3 Entradas

- predicción semántica
- confianza
- severidad
- contexto ambiental
- contexto histórico
- conocimiento documental

## 10.4 Salidas

- recommended_action
- priority_level
- justification
- uncertainty_note

## 10.5 Regla de seguridad

Ninguna recomendación de alto impacto debe publicarse sin indicar:

- evidencia base
- nivel de confianza
- alcance científico

---

## 11. Knowledge AI Layer

## 11.1 Propósito

Dar soporte contextual, explicativo y documental a la IA operativa.

## 11.2 Diseño recomendado

La capa debe funcionar como RAG local/gobernado sobre el Knowledge Hub.

## 11.3 Fuentes

- `docs/eiarc/`
- `docs/project_knowledge_base/`
- `docs/sena_artifacts/`
- `MASTERDOC`
- `PLAN_MAESTRO`
- taxonomías y catálogos curados

## 11.4 Casos de uso

1. explicación de por qué se emitió una recomendación
2. recuperación de protocolos operativos
3. consulta de taxonomías agronómicas y pecuarias
4. asistencia a operadores y futuras IA

## 11.5 Modelos recomendados

### Embeddings

- modelos de embeddings livianos para búsqueda semántica local

### Reranking

- reranker pequeño en cloud o backend central

### LLM de apoyo

- LLM solo para explicación y síntesis
- nunca como sustituto del motor predictivo principal

---

## 12. Modelos recomendados

## 12.1 Agriculture AI

- `MobileNetV3`
- `EfficientNet-B0/B1`
- `EfficientNetV2-S`
- `ConvNeXt-Tiny`
- `YOLOv8n/s`
- `U-Net`

## 12.2 Animal Health AI

- `XGBoost`
- `LightGBM`
- `RandomForest`
- `LSTM`
- `GRU`
- `Temporal Fusion Transformer`

## 12.3 Telemetry AI

- `Prophet`
- `ARIMA/SARIMA`
- `XGBoost`
- `LSTM`
- `TCN`
- `N-BEATS`
- `PatchTST`

## 12.4 Knowledge AI

- embeddings locales
- reranker ligero
- LLM de soporte para explicación y consulta documental

---

## 13. Datasets recomendados

## 13.1 Agricultura

- `PlantVillage`
- datasets de campo de enfermedades vegetales
- datasets de estrés hídrico/nutricional
- imágenes y telemetría propias de SIGCT-Rural

## 13.2 Salud animal

- históricos pecuarios internos
- collares inteligentes
- datasets académicos de actividad y anomalía animal
- eventos veterinarios etiquetados

## 13.3 Telemetría

- series históricas IoT internas
- datasets públicos de smart farming
- datasets de anomalías temporales multivariadas

## 13.4 Conocimiento

- Knowledge Hub estructurado
- documentos internos versionados
- catálogos curados de síntomas, acciones y taxonomías

---

## 14. Roadmap de entrenamiento

## Fase 0. Gobierno del dato

1. definir taxonomías canónicas
2. definir etiquetas y criterios de calidad
3. versionar datasets
4. definir métricas por contexto

## Fase 1. Agriculture V2

1. baseline multiclase con `PlantVillage`
2. validación cruzada
3. fine-tuning con muestras reales propias
4. compactación para edge

## Fase 2. Telemetry AI

1. construir dataset temporal limpio
2. entrenar baseline forecast y anomalía
3. comparar modelos clásicos vs secuenciales
4. publicar scores semánticos

## Fase 3. Animal Health AI

1. instrumentar collares y eventos
2. generar labels de comportamiento y anomalía
3. entrenar baseline tabular
4. evolucionar a secuencial

## Fase 4. Recommendation Engine

1. reglas determinísticas
2. validación de expertos
3. calibración de recomendaciones
4. trazabilidad y explicación

## Fase 5. Knowledge AI

1. indexación del Knowledge Hub
2. embeddings y recuperación
3. integración con recomendaciones y operación

## Fase 6. Multimodal fusion

1. fusionar visión + ambiente
2. fusionar telemetría + comportamiento animal
3. introducir score multimodal de riesgo

---

## 15. Prioridad de implementación

Orden recomendado:

1. `Agriculture AI Context`
2. `Telemetry AI Context`
3. `Recommendation Engine`
4. `Knowledge AI Layer`
5. `Animal Health AI Context`
6. `Feature Store / Feature Engineering` completo
7. `Multimodal Fusion`

## Justificación

### Agricultura primero

- ya existe microservicio IA
- ya existe flujo UI
- ya existe necesidad de evolucionar del binario a multiclase

### Telemetría segundo

- el contexto Telemetry ya es el slice más maduro del sistema
- aporta valor predictivo transversal

### Salud animal después

- requiere más captura propia de datos y etiquetado contextual

---

## 16. Coste computacional

## 16.1 Bajo

- `XGBoost`
- `LightGBM`
- `RandomForest`
- `Prophet`
- modelos CNN pequeños cuantizados

## 16.2 Medio

- `EfficientNet-B1`
- `LSTM/GRU`
- `YOLOv8n`
- embeddings locales

## 16.3 Alto

- `ViT`
- `ConvNeXt` mayores
- `Temporal Fusion Transformer`
- segmentación compleja
- fusión multimodal entrenada end-to-end

## 16.4 Recomendación operativa

### Edge

- inferencia compacta
- cuantización
- batching mínimo

### Cloud

- entrenamiento
- validación
- recalibración
- experimentación comparativa

---

## 17. Estrategia para BeagleBone Black

## 17.1 Rol recomendado

La BeagleBone Black no debe ser tratada como nodo de entrenamiento, sino como:

- nodo de adquisición
- preprocesador
- ejecutor de reglas
- inferencia edge muy compacta

## 17.2 Qué sí debe hacer

- adquirir telemetría
- ejecutar reglas y thresholds
- inferencia ultra liviana cuantizada si es estrictamente necesario
- buffer local y publicación de eventos

## 17.3 Qué no debe hacer

- entrenar redes profundas
- servir modelos pesados de visión
- ejecutar pipelines multimodales complejos

## 17.4 Estrategia edge específica

- usar `TensorFlow Lite`, `ONNX Runtime` o runtimes livianos
- priorizar modelos pequeños y tabulares
- inferencia eventual, no continua, en visión
- dejar el trabajo pesado a cloud o gateway más capaz

---

## 18. Estrategia Cloud AI

## 18.1 Responsabilidades cloud

- entrenamiento
- fine-tuning
- evaluación comparativa
- versionado de modelos
- model registry
- embeddings y búsqueda semántica
- inferencia avanzada multimodal

## 18.2 Arquitectura cloud recomendada

- entrenamiento offline
- model registry
- feature store
- serving central
- observabilidad de inferencia

## 18.3 Publicación a edge

La nube debe publicar:

- modelos compactados
- thresholds
- taxonomías
- contratos semánticos
- reglas de recomendación

---

## 19. Estrategia Edge AI

## 19.1 Responsabilidades edge

- captura local
- inferencia de baja latencia
- resiliencia offline parcial
- alertas rápidas
- compresión y envío de eventos

## 19.2 Jerarquía recomendada

### Nivel 1. Sensor / microcontrolador

- adquisición
- reglas simples

### Nivel 2. BeagleBone / gateway

- agregación local
- feature extraction básica
- inferencia compacta

### Nivel 3. Cloud

- análisis profundo
- entrenamiento
- orquestación semántica

## 19.3 Regla de consistencia

Cloud y edge pueden usar modelos distintos, pero deben converger en el mismo contrato semántico EIARC.

---

## 20. Métricas científicas

## 20.1 Agricultura

- accuracy
- macro F1
- recall por clase
- precision por clase
- balanced accuracy
- confusion matrix
- calibration error

## 20.2 Detección y segmentación

- mAP
- IoU
- Dice score
- precisión por lesión

## 20.3 Telemetría y series temporales

- MAE
- RMSE
- MAPE
- sMAPE
- precision/recall en anomalías
- detection delay

## 20.4 Salud animal

- F1 por evento
- AUROC
- PR-AUC
- recall de anomalía
- false alarm rate

## 20.5 Recomendación

- precisión de recomendación validada por experto
- tasa de aceptación operativa
- tasa de falsa recomendación crítica
- trazabilidad explicativa completa

## 20.6 Métricas transversales

- latencia edge
- latencia cloud
- disponibilidad
- drift de datos
- drift de concepto
- cobertura de trazabilidad

---

## 21. Roadmap operativo resumido

## Etapa 1. Consolidación V2 agrícola

- pasar de binario a multiclase trazable
- mantener semántica EIARC estable

## Etapa 2. IA temporal y telemétrica

- forecasting
- anomalías
- riesgo

## Etapa 3. IA pecuaria

- collares inteligentes
- salud animal

## Etapa 4. Recommendation Engine gobernado

- reglas + ML + explicación

## Etapa 5. Knowledge AI

- RAG local sobre Knowledge Hub

## Etapa 6. Multimodal fusion

- visión + sensores + conocimiento + contexto histórico

---

## 22. Conclusión final

La arquitectura V2 correcta para SIGCT-Rural no debe crecer como un único modelo más grande, sino como una **plataforma de IA multimodal compuesta por contextos especializados y unificada por semántica EIARC**.

Diagnóstico de diseño final:

- el modelo binario actual debe considerarse un punto de partida, no la base final
- la prioridad real es `Agriculture AI Context` multiclase con trazabilidad científica
- `Telemetry AI Context` debe convertirse en el segundo gran motor predictivo
- `Animal Health AI Context` debe apoyarse en datos propios de collares y eventos
- `Knowledge AI Layer` debe cerrar el ciclo de continuidad, explicación y soporte operativo
- cloud y edge deben coexistir, pero publicar siempre la misma semántica de negocio
