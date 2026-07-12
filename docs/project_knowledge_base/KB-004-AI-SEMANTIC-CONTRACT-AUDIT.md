# KB-004 - AI Semantic Contract Audit

## Fecha

2026-07-12

## Objetivo

Registrar formalmente la reconstrucción de la intención arquitectónica del contrato semántico entre modelo, FastAPI, frontend IA y README, identificando desalineaciones y definiendo la fuente de verdad conceptual.

## Fuente

- Análisis semántico derivado de:
  - `src/frontend/src/pages/AIPredictiva.jsx`
  - `src/ai_models/fastapi_app.py`
  - `src/ai_models/production_models/model_metadata.json`
  - `README.md`

## Hallazgos

### Comportamiento originalmente diseñado

- La experiencia de `AIPredictiva.jsx` fue diseñada para recibir etiquetas agrícolas semánticas de negocio.
- El frontend contiene una base de conocimiento explícita para enfermedades y estados agrícolas concretos.
- El README describe una IA de clasificación de enfermedades de plantas con semántica de dominio, no una salida técnica basada en índices.

### Semánticas actualmente coexistentes

- El metadato del modelo declara `classes = ["enferma", "sana"]`.
- FastAPI devuelve `diagnosis = class_{idx}` cuando ejecuta inferencia real.
- El frontend espera claves como `Tomato_Early_blight`, `Tomato_Late_blight`, `Tomato_Healthy` o `Potato_Early_blight`.
- El README habla de una taxonomía más amplia, incluyendo 38 enfermedades.

### Mapeo perdido

- Existe evidencia fuerte de un mapeo faltante entre:
  - `class_index`
  - la clase efectiva del modelo
  - el nombre semántico que debería consumir el frontend
- FastAPI expone `class_index`, pero no lo resuelve contra una taxonomía o metadato estable.
- El frontend, al no recibir esa resolución, intenta adivinar y cae a fallback genérico.

### Componente más desalineado

- El frontend está alineado con la intención de producto, pero no con la API real.
- El modelo y sus metadatos observados no respaldan ni el contrato del frontend ni la narrativa del README.
- El componente más desalineado funcionalmente es FastAPI, porque hoy publica una semántica interna de inferencia en vez de un contrato de dominio estable.

### Fuente de verdad conceptual

- La fuente de verdad no debería ser el frontend, porque no debe inventar taxonomía.
- Tampoco debería ser el README, porque hoy opera como visión y no como contrato operativo.
- La fuente de verdad debe ser una taxonomía semántica versionada y explícita, gobernada como artefacto canónico del dominio IA.

## Conclusiones

- El sistema no tiene hoy una única verdad semántica para IA.
- Conviven cuatro niveles semánticos incompatibles:
  - metadato del modelo
  - salida técnica del servicio
  - expectativa del frontend
  - narrativa del README
- La ruptura real no es solo de integración técnica, sino de contrato conceptual.

## Impacto para SIGCT-Rural

- SIGCT-Rural no puede consolidar una experiencia de diagnóstico confiable mientras la semántica de las predicciones no sea única y estable.
- Sin un contrato unificado, la UX puede mostrar resultados técnicamente válidos pero agronómicamente ambiguos o incorrectos.
- Esto afecta usabilidad, trazabilidad y confianza operativa del diagnóstico fitosanitario.

## Impacto para EIARC

- Este hallazgo es central para EIARC: demuestra la necesidad de un contrato semántico único gobernado por arquitectura, no por conveniencia de implementación.
- EIARC debe asumir el rol de definir cómo un índice de modelo se transforma en significado estable de negocio.
- También legitima la creación de una taxonomía versionada y compartida entre cloud, edge, backend, frontend y documentación.
