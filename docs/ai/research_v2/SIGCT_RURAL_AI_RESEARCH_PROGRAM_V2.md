# SIGCT_RURAL_AI_RESEARCH_PROGRAM_V2

## Fecha

2026-07-16

## Objetivo

Definir la hoja de ruta oficial de investigación, experimentación y desarrollo científico de SIGCT-Rural V2 para los próximos años, cubriendo:

- Agriculture AI
- Animal Health AI
- Telemetry AI
- Audio Intelligence
- Signal Intelligence
- Knowledge AI
- Multimodal Fusion AI

Este documento no implementa, no entrena y no programa. Solo diseña el programa científico rector.

---

## 1. Resumen ejecutivo

SIGCT-Rural V2 debe evolucionar como un **programa de investigación aplicada multimodal**, no como una colección de iniciativas aisladas. La prioridad no es entrenar muchos modelos rápidamente, sino construir una secuencia científica acumulativa, trazable y útil para:

- agricultura inteligente
- salud animal
- telemetría predictiva
- inteligencia acústica
- señales instrumentadas
- recomendación explicable
- continuidad documental vía Knowledge AI

Diagnóstico programático:

1. la primera investigación debe arrancar con `Agriculture AI` porque ya existe baseline, dataset bootstrap auditado y ruta técnica clara
2. la segunda línea debe ser `Telemetry AI`, porque el contexto Telemetry ya es el slice funcional más maduro del sistema
3. la tercera línea debe ser `Animal Health AI`, porque requiere más captura propia y validación contextual
4. `Audio Intelligence`, `Signal Intelligence` y `Multimodal Fusion` deben desarrollarse como líneas de mediano plazo con fuerte dependencia de instrumentación y datasets propios

El programa debe producir cuatro tipos de valor:

1. valor científico
2. valor operacional
3. valor arquitectónico
4. valor académico SENA

---

## 2. Principios del programa

## 2.1 Principio de continuidad

Toda línea nueva debe apoyarse en artefactos previos ya formalizados:

- arquitectura V2
- estrategia de datasets
- auditoría física de PlantVillage
- gobierno científico y MLOps

## 2.2 Principio de acumulación

Cada línea debe dejar:

- datasets
- notebooks
- reportes
- benchmarks
- validaciones
- decisiones

## 2.3 Principio de validación real

Un resultado de laboratorio no equivale a validez de campo. Toda línea debe contemplar validación progresiva en entornos reales.

## 2.4 Principio EIARC

Todo resultado debe converger en:

- taxonomía versionada
- contrato semántico
- trazabilidad científica

## 2.5 Principio de utilidad institucional

La investigación debe servir simultáneamente a:

- el producto SIGCT-Rural
- la línea EIARC
- la evidencia académica SENA

---

## 3. Estructura general del programa

El programa se organiza en siete líneas principales y seis programas transversales.

## 3.1 Líneas principales

1. `Agriculture AI`
2. `Animal Health AI`
3. `Telemetry AI`
4. `Audio Intelligence`
5. `Signal Intelligence`
6. `Knowledge AI`
7. `Multimodal Fusion`

## 3.2 Programas transversales

1. programa científico de notebooks
2. programa de experimentos
3. programa de benchmarks
4. programa de validación científica
5. programa de captura de datos
6. programa de datasets propios

---

## 4. Línea de investigación Agriculture AI

## 4.1 Objetivo

Construir el primer baseline multiclase científicamente gobernado para salud vegetal y evolucionarlo hacia diagnóstico multimodal con ambiente y contexto agronómico.

## 4.2 Preguntas de investigación

1. qué arquitectura clasifica mejor las `16` clases V2 iniciales
2. cuánto se degrada el modelo fuera de `PlantVillage`
3. qué combinación de imagen + contexto ambiental mejora generalización
4. cómo estimar severidad sin perder trazabilidad

## 4.3 Prioridad

- **máxima**

## 4.4 Experimentos críticos

1. benchmark `EfficientNet-B0` vs `MobileNetV3` vs `ResNet50` vs `ConvNeXt-Tiny`
2. evaluación de calibración
3. error analysis por especie y clase
4. validación en imágenes reales de campo
5. comparación entre solo imagen y multimodal imagen + ambiente

## 4.5 Entregables

- baseline multiclase V2
- reporte comparativo
- taxonomía agrícola V2 validada
- gold set de validación real

---

## 5. Línea de investigación Animal Health AI

## 5.1 Objetivo

Desarrollar modelos para detección de actividad, anomalía y riesgo en animales a partir de collares, telemetría y señales fisiológicas o conductuales.

## 5.2 Preguntas de investigación

1. qué patrones de collar diferencian actividad normal de anormal
2. qué features temporales anticipan eventos de riesgo
3. cómo correlacionar eventos de collar con observación humana
4. qué modelos son robustos con datos escasos y ruidosos

## 5.3 Prioridad

- **alta**, pero posterior a Agriculture AI y Telemetry AI

## 5.4 Experimentos críticos

1. clasificación de actividad por ventanas
2. anomalía conductual con `XGBoost` y `LSTM`
3. correlación collar + telemetría ambiental
4. validación con eventos observados

## 5.5 Entregables

- dataset instrumentado inicial
- esquema de etiquetas conductuales
- benchmark tabular y secuencial

---

## 6. Línea de investigación Telemetry AI

## 6.1 Objetivo

Convertir telemetría operacional y ambiental en forecasting, detección de anomalías y score de riesgo.

## 6.2 Preguntas de investigación

1. qué baseline temporal ofrece mejor forecasting
2. qué variables anticipan fallos o estados anómalos
3. cómo detectar drift en sensores
4. cómo convertir telemetría en alertas accionables

## 6.3 Prioridad

- **muy alta**

## 6.4 Experimentos críticos

1. `Prophet` vs `ARIMA` vs `XGBoost`
2. `LSTM/GRU/TCN` para forecasting multivariante
3. detección de anomalías con reglas vs modelos
4. score de riesgo operacional

## 6.5 Entregables

- dataset temporal canónico
- baseline de forecasting
- baseline de anomalía
- dashboard científico de evaluación temporal

---

## 7. Línea de investigación Audio Intelligence

## 7.1 Objetivo

Desarrollar capacidades de análisis acústico para especies animales y entornos rurales instrumentados.

## 7.2 Subdominios

- abejas
- bovinos
- porcinos
- aves

## 7.3 Preguntas de investigación

1. qué eventos acústicos son útiles por especie
2. qué features capturan mejor estrés o anomalía
3. cuándo conviene CNN espectral vs CRNN vs embeddings
4. cómo validar audio con contexto real

## 7.4 Prioridad

- **media**

## 7.5 Experimentos críticos

1. clasificación por espectrograma
2. detección de eventos acústicos anómalos
3. comparación MFCC vs embeddings aprendidos
4. correlación audio + telemetría + observación

## 7.6 Entregables

- esquema de eventos acústicos por especie
- baseline acústico por subdominio
- protocolo de captura y etiquetado

---

## 8. Línea de investigación Signal Intelligence

## 8.1 Objetivo

Diseñar analítica avanzada para señales de laboratorio, señales fisiológicas y señales temporales instrumentadas.

## 8.2 Preguntas de investigación

1. qué transformaciones capturan mejor fenómenos útiles
2. cómo detectar cambios de régimen
3. qué features dominan por tipo de señal
4. cómo unificar señales heterogéneas en un mismo marco EIARC

## 8.3 Prioridad

- **media**

## 8.4 Experimentos críticos

1. comparación dominio temporal vs frecuencia
2. wavelets vs FFT en señales específicas
3. detección de eventos y change points
4. fusión señal + telemetría

## 8.5 Entregables

- catálogo de features de señal
- baseline de modelos por tipo de señal
- protocolos de procesamiento

---

## 9. Línea de investigación Knowledge AI

## 9.1 Objetivo

Convertir el Knowledge Hub y la base documental en un sistema de apoyo científico, explicativo y operacional para SIGCT-Rural.

## 9.2 Preguntas de investigación

1. cómo indexar conocimiento técnico con trazabilidad
2. cómo soportar recomendaciones explicables
3. cómo recuperar protocolos y taxonomías relevantes
4. cómo asistir a futuras IA sin perder contexto

## 9.3 Prioridad

- **alta**, pero después de consolidar baseline agrícola y telemetría

## 9.4 Experimentos críticos

1. embeddings documentales locales
2. benchmarking de recuperación semántica
3. grounding de recomendaciones con evidencia documental
4. soporte a análisis de incidentes y continuidad

## 9.5 Entregables

- índice semántico de Knowledge Hub
- benchmark de recuperación
- capa de explicación trazable

---

## 10. Línea de investigación Multimodal Fusion

## 10.1 Objetivo

Fusionar visión, telemetría, señales, audio y conocimiento para mejorar diagnóstico, scoring y recomendación.

## 10.2 Preguntas de investigación

1. qué combinación de modalidades aporta valor real
2. cuándo la fusión mejora y cuándo solo complejiza
3. cómo explicar la contribución de cada modalidad
4. qué estrategia sirve primero: score fusion o feature fusion

## 10.3 Prioridad

- **alta a mediano plazo**, no como primera línea

## 10.4 Experimentos críticos

1. score fusion imagen + telemetría
2. feature fusion collar + ambiente
3. audio + telemetría en salud animal
4. recomendación + Knowledge AI + scores predictivos

## 10.5 Entregables

- baseline de fusión simple
- benchmark multimodal
- marco de explicabilidad multimodal

---

## 11. Qué investigar primero

Orden recomendado de investigación:

1. `Agriculture AI`
2. `Telemetry AI`
3. `Knowledge AI`
4. `Animal Health AI`
5. `Audio Intelligence`
6. `Signal Intelligence`
7. `Multimodal Fusion`

## Justificación

### Agriculture AI primero

- ya existe bootstrap auditado
- ya existe pipeline V2 inicial
- ya existe necesidad inmediata de pasar de binario a multiclase

### Telemetry AI después

- ya existe madurez funcional del contexto
- es el segundo slice con mayor potencial predictivo transversal

### Knowledge AI temprano

- multiplica continuidad, explicación y reutilización de resultados

---

## 12. Qué investigar después

Después de consolidar agricultura y telemetría:

1. construir datasets propios de campo
2. instrumentar collares y salud animal
3. abrir línea de audio
4. consolidar señales y multimodalidad

---

## 13. Programa científico de notebooks

## 13.1 Principio

Un notebook debe responder una pregunta científica concreta.

## 13.2 Estructura oficial propuesta

### Programa común

1. `00_program_bootstrap`
2. `01_dataset_discovery`
3. `02_eda`
4. `03_feature_engineering`
5. `04_baseline_training`
6. `05_model_comparison`
7. `06_calibration_and_validation`
8. `07_error_analysis`
9. `08_real_world_validation`
10. `09_edge_assessment`

## 13.3 Notebooks por línea

### Agriculture AI

- taxonomía y dataset
- benchmark multiclase
- error analysis por especie
- validación real de campo

### Telemetry AI

- EDA temporal
- forecasting baseline
- anomaly detection baseline
- drift analysis

### Animal Health AI

- collar signal EDA
- activity classification
- anomaly detection

### Audio Intelligence

- acoustic EDA
- feature extraction
- event classification

### Knowledge AI

- corpus discovery
- embedding benchmark
- retrieval evaluation

---

## 14. Programa de experimentos

## 14.1 Estructura

Cada línea debe tener:

1. experimentos exploratorios
2. experimentos baseline
3. experimentos comparativos
4. experimentos de validación externa

## 14.2 Experimentos críticos globales

1. benchmark agrícola multiclase
2. benchmark de forecasting telemétrico
3. clasificación de actividad animal
4. baseline acústico por especie
5. recuperación semántica sobre Knowledge Hub
6. primera fusión imagen + telemetría

---

## 15. Programa de benchmarks

## 15.1 Agriculture AI

- `MobileNetV3`
- `EfficientNet-B0`
- `ResNet50`
- `ConvNeXt-Tiny`

## 15.2 Telemetry AI

- `Prophet`
- `ARIMA/SARIMA`
- `XGBoost`
- `LSTM`
- `GRU`
- `TCN`

## 15.3 Animal Health AI

- `XGBoost`
- `LightGBM`
- `RandomForest`
- `LSTM`
- `GRU`

## 15.4 Audio Intelligence

- CNN sobre espectrogramas
- CRNN
- embeddings acústicos + clasificador tabular

## 15.5 Knowledge AI

- embeddings locales
- reranking
- evaluación de recuperación semántica

---

## 16. Programa de validación científica

## 16.1 Capas

1. validación offline
2. validación por clase o evento
3. validación por contexto
4. validación de calibración
5. validación real

## 16.2 Métricas de éxito

### Agriculture AI

- macro F1
- balanced accuracy
- recall por clase
- calibración

### Telemetry AI

- MAE
- RMSE
- sMAPE
- detection delay

### Animal Health AI

- F1 por evento
- AUROC
- PR-AUC

### Audio Intelligence

- macro F1
- event detection precision/recall

### Knowledge AI

- retrieval precision
- recall@k
- grounded explanation quality

---

## 17. Programa de captura de datos

## 17.1 Agricultura

- imágenes de campo reales
- captura por dispositivo real
- metadatos de parcela, fecha y condición

## 17.2 Salud animal

- collares inteligentes
- eventos observados
- contexto ambiental

## 17.3 Telemetría

- series continuas
- eventos de fallo
- etiquetas de anomalía

## 17.4 Audio

- captura por especie
- condiciones controladas y de campo
- anotación de eventos acústicos

## 17.5 Señales

- protocolos por tipo de sensor
- sincronización temporal
- validación instrumental

---

## 18. Programa de datasets propios

## 18.1 Dataset agrícola propio

Debe construirse primero para:

- tomate
- papa
- maíz

## 18.2 Dataset pecuario propio

Debe incluir:

- collar
- contexto
- etiqueta conductual
- eventos de validación

## 18.3 Dataset acústico propio

Debe organizarse por:

- especie
- evento
- contexto
- validación humana

## 18.4 Dataset telemétrico propio

Debe incluir:

- series limpias
- eventos
- ventanas
- etiquetas de riesgo

---

## 19. Programa de Feature Engineering

## 19.1 Objetivo

Construir un catálogo reusable de features por modalidad.

## 19.2 Prioridades

1. features temporales para telemetría
2. features de collar
3. features acústicas
4. features multimodales

## 19.3 Entregables

- catálogo versionado
- definiciones formales
- reportes de importancia y estabilidad

---

## 20. Programa de Edge AI

## 20.1 Objetivo

Llevar inferencia compacta a escenarios de borde sin romper trazabilidad.

## 20.2 Prioridades

1. Agriculture AI compacto
2. Telemetry AI ligero
3. reglas inteligentes de señales

## 20.3 Hardware y despliegue

- BeagleBone Black como nodo restringido
- gateways Linux como edge principal más realista
- `TensorFlow Lite` y modelos compactados

## 20.4 Entregables

- benchmark de inferencia edge
- exportabilidad
- consumo estimado

---

## 21. Programa de Cloud AI

## 21.1 Objetivo

Centralizar entrenamiento, benchmark, fusión multimodal y gobierno científico.

## 21.2 Responsabilidades

- entrenamiento pesado
- comparación de modelos
- registry
- monitoreo
- análisis retrospectivo

## 21.3 Entregables

- baseline maestro por línea
- registro de modelos
- reportes consolidados

---

## 22. Programa de publicaciones técnicas

## 22.1 Artefactos técnicos

Cada línea debe producir:

1. note técnica
2. benchmark report
3. validation report
4. lessons learned

## 22.2 Línea de documentación

Debe integrarse con:

- documentación raíz
- arquitectura EIARC
- Knowledge Hub

## 22.3 Regla

No cerrar una línea de investigación sin documentación reproducible.

---

## 23. Programa de evidencias SENA

## 23.1 Objetivo

Traducir investigación técnica en evidencias académicas válidas.

## 23.2 Evidencias esperadas

1. reportes de experimento
2. capturas de dashboards o resultados
3. trazabilidad de datasets
4. resultados comparativos
5. diagramas de arquitectura y pipeline
6. evidencias de hardware e instrumentación

## 23.3 Integración

Debe apoyarse en:

- `docs/sena_artifacts/`
- entregables finales ADSO
- documentación de cierre

---

## 24. Qué notebooks deben existir

Mínimos obligatorios:

1. `00_program_bootstrap`
2. `01_dataset_discovery`
3. `02_eda`
4. `03_feature_engineering`
5. `04_baseline_training`
6. `05_model_comparison`
7. `06_calibration_and_validation`
8. `07_error_analysis`
9. `08_real_world_validation`
10. `09_edge_assessment`
11. notebooks específicos por línea:
   - agricultura
   - telemetría
   - animal health
   - audio
   - knowledge AI
   - multimodal fusion

---

## 25. Qué datasets deben construirse

## 25.1 Prioridad 1

- dataset agrícola propio de campo para tomate, papa y maíz

## 25.2 Prioridad 2

- dataset telemétrico canónico con ventanas y eventos

## 25.3 Prioridad 3

- dataset de collares inteligentes

## 25.4 Prioridad 4

- dataset acústico por especie

## 25.5 Prioridad 5

- datasets regionales de cacao, café y banano

---

## 26. Qué laboratorios de SIGCT-Rural usar

El programa debe aprovechar el ecosistema actual de SIGCT-Rural:

1. `Dashboard` como capa de observabilidad y visualización
2. `Telemetry Context` como laboratorio natural para forecasting y anomalía
3. `AI Context` como laboratorio de visión y fusión
4. laboratorios instrumentados y sensores IoT como base de captura
5. `Knowledge Hub` como infraestructura de continuidad documental y científica

---

## 27. Cómo aprovechar activos existentes

## 27.1 Señales

- features temporales
- detección de eventos
- análisis de régimen

## 27.2 Audio

- detección de estrés
- clasificación de eventos acústicos
- correlación con entorno

## 27.3 Telemetría

- forecasting
- anomalía
- risk scoring

## 27.4 Visión artificial

- clasificación multiclase
- severidad
- soporte visual multimodal

## 27.5 Collares inteligentes

- actividad
- inactividad anómala
- correlato conductual

## 27.6 Sensores IoT

- contexto ambiental
- señales predictivas
- validación de recomendaciones

## 27.7 Knowledge Hub

- grounding documental
- explicación de modelos
- preservación de continuidad científica

---

## 28. Qué experimentos son críticos

1. benchmark agrícola V2 inicial
2. validación real de imágenes de campo
3. baseline telemétrico de forecasting
4. baseline telemétrico de anomalía
5. clasificación de actividad con collares
6. baseline acústico por especie
7. retrieval semántico sobre Knowledge Hub
8. primera fusión imagen + telemetría

---

## 29. Qué métricas validan éxito

## Agricultura

- macro F1
- balanced accuracy
- recall por clase
- calibration error

## Telemetría

- MAE
- RMSE
- sMAPE
- detection delay

## Salud animal

- F1 por evento
- AUROC
- PR-AUC

## Audio

- macro F1
- precision/recall por evento

## Knowledge AI

- recall@k
- precisión de grounding
- utilidad explicativa

## Multimodal Fusion

- mejora significativa frente a unimodal
- estabilidad de calibración
- explicabilidad por modalidad

---

## 30. Qué riesgos científicos existen

1. sesgo de laboratorio
2. datasets propios insuficientes
3. etiquetas débiles o ambiguas
4. fuga de información
5. mala calibración
6. drift de sensor o dispositivo
7. multimodalidad prematura sin datos suficientes
8. exceso de complejidad sin ganancia real

---

## 31. Qué entregables producir

Cada línea debe producir:

1. documento de investigación
2. benchmark report
3. validation report
4. dataset manifest o plan de dataset
5. notebook set
6. matriz de riesgos
7. decisión de continuidad

---

## 32. Roadmap a 1 año

## Meta central

Consolidar los fundamentos científicos y producir los primeros baselines serios.

## Hitos

1. baseline agrícola V2 inicial
2. dataset agrícola propio mínimo
3. baseline de telemetría predictiva
4. diseño y arranque de dataset de collares
5. arquitectura inicial de Knowledge AI
6. programa formal de notebooks y benchmarks

---

## 33. Roadmap a 3 años

## Meta central

Expandir desde baselines unimodales a sistemas integrados validados en entornos reales.

## Hitos

1. datasets propios más robustos
2. Agriculture AI con validación de campo más madura
3. Telemetry AI operacional
4. Animal Health AI funcional
5. primeras capacidades de Audio Intelligence
6. primer benchmark de multimodal fusion
7. Model Registry y monitoring más maduros

---

## 34. Roadmap a 5 años

## Meta central

Convertir SIGCT-Rural V2 en una plataforma EIARC multimodal madura y sostenible.

## Hitos

1. multimodal fusion útil y explicable
2. integración madura cloud-edge
3. línea regional de cultivos ampliada:
   - cacao
   - café
   - banano
4. audio y señales incorporados al stack de decisión
5. Knowledge AI plenamente integrado
6. operación científica sostenida con datasets y validación continua

---

## 35. Respuestas directas solicitadas

## 1. Qué investigar primero

- `Agriculture AI`

## 2. Qué investigar después

- `Telemetry AI`
- `Knowledge AI`
- luego `Animal Health AI`

## 3. Qué experimentos son críticos

- benchmark agrícola
- validación real de campo
- forecasting telemétrico
- anomalía telemétrica
- baseline de collares
- baseline acústico
- retrieval semántico
- primera fusión multimodal

## 4. Qué notebooks deben existir

- bootstrap
- discovery
- EDA
- feature engineering
- baseline training
- model comparison
- calibration and validation
- error analysis
- real world validation
- edge assessment

## 5. Qué datasets deben construirse

- agrícola propio
- telemétrico canónico
- collares
- acústico por especie
- datasets regionales de segunda ola

## 6. Qué métricas validan éxito

- macro F1
- balanced accuracy
- recall por clase
- AUROC
- PR-AUC
- MAE/RMSE/sMAPE
- calibration error

## 7. Qué riesgos científicos existen

- sesgo de laboratorio
- baja calidad de labels
- drift
- multimodalidad prematura

## 8. Qué entregables producir

- reportes
- benchmarks
- validaciones
- manifests
- notebooks
- evidencias SENA

## 9. Qué laboratorios de SIGCT-Rural usar

- Dashboard
- Telemetry Context
- AI Context
- laboratorios IoT instrumentados
- Knowledge Hub

## 10. Cómo aprovechar activos

- señales para features y eventos
- audio para estrés y clasificación acústica
- telemetría para forecasting y riesgo
- visión artificial para diagnóstico vegetal
- collares para actividad y anomalía
- sensores IoT para contexto
- Knowledge Hub para grounding y continuidad

---

## 36. Conclusión final

SIGCT-Rural V2 debe asumir formalmente que su futuro no es una sola IA visual, sino un **programa de investigación multimodal** con una secuencia clara:

1. consolidar `Agriculture AI`
2. consolidar `Telemetry AI`
3. construir datasets propios
4. abrir `Animal Health AI`
5. abrir `Audio Intelligence` y `Signal Intelligence`
6. integrar `Knowledge AI`
7. avanzar hacia `Multimodal Fusion`

Diagnóstico final:

- la primera fase debe ser pragmática y acumulativa
- la segunda fase debe ser integradora
- la tercera fase debe ser multimodal, edge-cloud y científicamente validada

Este documento fija la hoja de ruta oficial de investigación de SIGCT-Rural para los próximos años.
