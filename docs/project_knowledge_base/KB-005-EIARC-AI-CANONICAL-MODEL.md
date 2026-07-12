# KB-005 - EIARC AI Canonical Model

## Fecha

2026-07-12

## Objetivo

Formalizar el modelo canónico de arquitectura IA para SIGCT-Rural y EIARC, definiendo estado actual, estado objetivo, arquitectura multi-modelo futura y el contrato semántico único que debe gobernar el ecosistema.

## Fuente

- Análisis canónico derivado de:
  - modelo actual observado
  - `src/frontend/src/pages/AIPredictiva.jsx`
  - `src/ai_models/fastapi_app.py`
  - `src/ai_models/production_models/model_metadata.json`
  - `README.md`

## Hallazgos

### Estado actual

- El sistema tiene capacidad de inferencia, pero no un modelo canónico compartido.
- Coexisten varias semánticas incompatibles:
  - `enferma/sana` en metadatos
  - `class_N` en FastAPI
  - clases agrícolas concretas en el frontend
  - una taxonomía más ambiciosa en el README
- FastAPI hoy actúa como servicio técnico de inferencia, pero no como adaptador semántico de dominio.

### Estado objetivo SIGCT-Rural

- SIGCT-Rural debe operar con diagnósticos agrícolas comprensibles, accionables y consistentes.
- La unidad de valor no debe ser el índice técnico del modelo, sino un diagnóstico canónico con:
  - clase de cultivo
  - condición detectada
  - estado de salud
  - severidad
  - confianza
  - acción recomendada
- Cloud y edge deben poder producir resultados equivalentes a nivel semántico aunque usen modelos distintos.

### Estado objetivo EIARC

- EIARC debe gobernar un ecosistema multi-modelo, no un único modelo acoplado a una sola taxonomía implícita.
- Debe separar:
  - artefacto de inferencia
  - registro de modelos
  - resolución semántica
  - exposición de contrato estable
  - consumo por frontend, backend y edge
- SIGCT-Rural debe ser consumidor del contrato; EIARC, su autoridad arquitectónica.

### Arquitectura multi-modelo futura

- La arquitectura futura debe contemplar:
  - modelos de screening rápido
  - modelos de clasificación específica
  - modelos de severidad
  - modelos contextuales que integren imagen, telemetría e historial
- Debe existir un registro o catálogo capaz de declarar:
  - versión
  - familia de modelo
  - taxonomía de clases
  - compatibilidad cloud/edge
  - versión del contrato semántico
- Ningún consumidor aguas arriba debe depender directamente de `argmax`, orden interno de clases o `class_N`.

### Contrato semántico único para IA

- El contrato único debe estar definido por una taxonomía versionada y explícita.
- Toda predicción canónica debería poder expresar, al menos:
  - identificador de predicción
  - etiqueta humana estable
  - cultivo
  - condición
  - grupo de condición
  - estado de salud
  - severidad
  - confianza
  - acción recomendada
  - identificador y versión de modelo
  - modo de inferencia (`cloud`, `edge`, `fallback`)
  - versión del contrato semántico

## Conclusiones

- El problema principal actual no es solo de integración, sino de falta de canon arquitectónico para IA.
- SIGCT-Rural necesita una semántica única de diagnóstico.
- EIARC necesita un modelo de gobierno que permita reemplazar modelos sin romper el significado de negocio.
- La fuente de verdad futura debe ser una taxonomía semántica versionada y no la salida cruda del modelo, la UI o la documentación narrativa.

## Impacto para SIGCT-Rural

- Un modelo canónico permitiría que el diagnóstico fitosanitario sea estable, interpretable y trazable entre interfaces y despliegues.
- También habilitaría coherencia entre cloud, edge, dashboards, voz y recomendaciones agronómicas.
- Sin este canon, SIGCT-Rural seguirá expuesto a respuestas ambiguas, UX degradada y dificultad para escalar casos de uso.

## Impacto para EIARC

- Este documento define la razón de ser de EIARC en la capa IA: convertir diversidad de modelos en coherencia de dominio.
- EIARC gana aquí un principio rector: **los modelos pueden cambiar; el contrato semántico de negocio no**.
- Esto sienta base para gobierno de taxonomías, versionado de contratos, compatibilidad multi-entorno y evolución arquitectónica sin ruptura semántica.
