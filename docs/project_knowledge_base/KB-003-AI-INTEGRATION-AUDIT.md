# KB-003 - AI Integration Audit

## Fecha

2026-07-12

## Objetivo

Registrar formalmente la auditoría de integración entre `src/frontend/src/pages/AIPredictiva.jsx` y `src/ai_models/fastapi_app.py`, incluyendo endpoint consumido, endpoint expuesto, formato de intercambio, incompatibilidades y modos de fallo.

## Fuente

- `TRAE_AI_INTEGRATION_AUDIT.md`

## Hallazgos

### Contrato de transporte observado

- El frontend consume `POST http://localhost:8000/infer`.
- FastAPI expone `POST /infer`.
- El frontend envía `multipart/form-data` con campo `file`.
- FastAPI acepta `UploadFile` en el campo `file`.
- La respuesta de FastAPI es JSON.

### Contrato semántico observado

- FastAPI devuelve al menos:
  - `diagnosis`
  - `confidence`
  - `class_index`
  - `model`
  - `processing_time`
  - `status`
- El frontend necesita principalmente:
  - `diagnosis`
  - `confidence`
- El frontend espera que `diagnosis` sea una etiqueta agrícola real, no una clase genérica.

### Incompatibilidades detectadas

- La ruta relativa coincide (`/infer`), pero el host/puerto no están alineados por defecto.
- FastAPI devuelve `class_N` cuando corre el modelo real.
- El frontend está construido para interpretar claves como `Tomato_Early_blight`, `Tomato_Late_blight`, `Tomato_Healthy` y `Potato_Early_blight`.
- Cuando no puede mapear la respuesta, el frontend cae a un resultado genérico con “Cultivo Desconocido”.

### Modos de fallo

- Si FastAPI está levantado en un puerto distinto al esperado por el frontend, la funcionalidad falla aunque ambos servicios estén activos.
- Si FastAPI responde con `class_N`, la integración HTTP puede parecer correcta, pero la UX sigue rota semánticamente.
- El frontend tiene un fallback mock local que puede ocultar fallos reales de integración y hacer que la funcionalidad parezca operativa.

## Conclusiones

- El payload básico es compatible, pero la integración end-to-end no es confiable.
- Existen dos problemas independientes:
  - mapeo incorrecto del destino de red
  - desalineación semántica de `diagnosis`
- La presencia de fallback en frontend enmascara la severidad del problema real.

## Impacto para SIGCT-Rural

- La funcionalidad de diagnóstico IA puede aparentar estar disponible aunque no esté conectada al servicio correcto.
- Esto afecta directamente la confianza del usuario y la capacidad de validar IA real en entorno de demostración o piloto.
- El problema impacta una función visible del producto, por lo que su efecto reputacional es alto.

## Impacto para EIARC

- EIARC obtiene aquí un ejemplo concreto de separación entre compatibilidad de transporte y compatibilidad semántica.
- El hallazgo refuerza que una arquitectura de IA no puede declararse integrada solo porque `POST` y `JSON` funcionen.
- También sustenta la necesidad de contratos canónicos que impidan que un frontend dependa de semántica implícita o adivinada.
