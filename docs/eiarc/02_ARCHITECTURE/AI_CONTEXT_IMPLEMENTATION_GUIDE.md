# AI Context Implementation Guide

## Fecha

2026-07-12

## Version

v1.0.0

## Objetivo

Definir la guia tecnica oficial del PR1 del AI Context de EIARC, limitada a la introduccion del endpoint `POST /api/v3/ai/inference/`, su contrato exacto de request y response, el resolver semantico de `prediction_code`, los cambios exactos por archivo, los riesgos, el rollback, las pruebas y el orden de implementacion.

## Referencias

- `docs/eiarc/02_ARCHITECTURE/AI_CONTEXT_REFACTOR_PLAN.md`
- `docs/eiarc/03_DIAGRAMS/AI_CONTEXT_TARGET_ARCHITECTURE.mmd`
- `docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md`
- `src/backend/api/urls.py`
- `src/backend/api/views.py`
- `src/backend/core/ports/services/ai_service_port.py`
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`
- `src/ai_models/fastapi_app.py`
- `src/ai_models/production_models/model_metadata.json`
- `src/frontend/src/pages/AIPredictiva.jsx`

## 1. Alcance del PR1

El PR1 del AI Context debe hacer una sola cosa de forma oficial y verificable:

- introducir una fachada backend versionada para diagnostico de imagen en `POST /api/v3/ai/inference/`

El PR1 **si incluye**:

1. endpoint oficial versionado en backend
2. uso del puerto de IA ya existente
3. resolver semantico backend para publicar `prediction_code`
4. adaptacion de `AIPredictiva.jsx` al nuevo endpoint
5. envelope oficial `context = ai`

El PR1 **no incluye**:

1. cambios en modelos TensorFlow
2. cambios en `VoiceAssistant.jsx`
3. cambios en `DataScienceLab.jsx`
4. persistencia nueva en base de datos
5. rediseño de `/assist`, `/events` o `/analyze-circuit`

## 2. Estado actual verificado

### 2.1 Backend

- `src/backend/api/urls.py` expone hoy `GET /api/v2/ai/crop-advice/` y `GET /api/v3/ai/crop-advice/`, pero no diagnostico de imagen.
- `src/backend/api/views.py` ya tiene el patron V3 con `TelemetryHistoryV3View` y `AICropAdviceV3View`, por lo que el nuevo endpoint debe seguir esa misma estrategia.
- `src/backend/core/ports/services/ai_service_port.py` ya define `predecir_enfermedad`.
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py` ya encapsula la llamada a `/infer`.

### 2.2 Servicio tecnico IA

- `src/ai_models/fastapi_app.py` publica hoy `diagnosis = class_{idx}` cuando el modelo corre de verdad.
- la salida incluye `class_index`.
- `model_metadata.json` contiene `["enferma", "sana"]`, lo que no es suficiente como taxonomia de negocio.

### 2.3 Frontend

- `src/frontend/src/pages/AIPredictiva.jsx` llama hoy a `http://localhost:8000/infer`.
- la semantica de negocio esta embebida en `PLANT_DISEASE_DB`.
- el fallback mock puede ocultar problemas reales de contrato.

## 3. Endpoint oficial del PR1

## 3.1 Endpoint

- `POST /api/v3/ai/inference/`

## 3.2 Responsabilidad

1. recibir una imagen desde frontend
2. delegar inferencia al microservicio tecnico
3. transformar la salida tecnica en contrato semantico EIARC
4. devolver un envelope estable, versionado y trazable

## 3.3 Politica de compatibilidad

- `POST /infer` sigue existiendo, pero solo como endpoint interno del microservicio IA
- `POST /api/v3/ai/inference/` pasa a ser la puerta publica oficial para diagnostico de imagen

## 4. Contrato exacto request/response

## 4.1 Request oficial

### Metodo

- `POST`

### Content-Type

- `multipart/form-data`

### Campos requeridos

1. `file`
   - tipo: archivo binario de imagen
   - formatos objetivo iniciales: `image/jpeg`, `image/png`, `image/webp`

### Campos opcionales

1. `source_mode`
   - tipo: string
   - valores permitidos en PR1: `cloud`, `mock`
   - uso: solo informativo; backend sigue controlando el source mode real publicado

2. `client_context`
   - tipo: string
   - valor sugerido para PR1: `aipredictiva`

### Ejemplo de request

```http
POST /api/v3/ai/inference/
Content-Type: multipart/form-data

file=<imagen-hoja.jpg>
client_context=aipredictiva
```

## 4.2 Response oficial exitosa

```json
{
  "context": "ai",
  "contract_version": "v1",
  "operation": "plant_diagnosis",
  "source_mode": "cloud",
  "prediction": {
    "prediction_code": "plant_disease.tomato.early_blight",
    "prediction_label": "Tomato Early Blight",
    "plant_species": "tomato",
    "condition_name": "early_blight",
    "condition_group": "disease",
    "health_state": "warning",
    "severity": "medium",
    "confidence": 0.88,
    "recommended_action": "Podar hojas inferiores afectadas. Aplicar fungicida organico. Rotacion de cultivos.",
    "model_id": "plant_disease_classifier",
    "model_version": "plant_disease_mbv2",
    "semantic_contract_version": "v1"
  },
  "trace": {
    "provider": "fastapi_ai_service",
    "raw_diagnosis": "class_0",
    "raw_class_index": 0,
    "processing_time": "0.12s",
    "upstream_status": "ok"
  }
}
```

## 4.3 Response oficial de error

```json
{
  "context": "ai",
  "contract_version": "v1",
  "operation": "plant_diagnosis",
  "source_mode": "fallback",
  "error": {
    "code": "ai_inference_unavailable",
    "message": "No fue posible completar la inferencia oficial.",
    "detail": "Error conectando con IA Service"
  }
}
```

## 4.4 Reglas del contrato

1. `prediction_code` es obligatorio en respuestas exitosas.
2. `class_index` no sale al nivel raiz ni dentro de `prediction`; solo vive en `trace`.
3. `confidence` oficial se publica dentro de `prediction`.
4. `semantic_contract_version` es obligatorio.
5. `source_mode` refleja la procedencia publicada por backend, no lo que pida el frontend.

## 5. Resolver semantico de `prediction_code`

## 5.1 Objetivo

Convertir la salida tecnica actual:

- `diagnosis = class_N`
- `class_index = N`
- o algun fallback textual del servicio

en una salida estable de negocio:

- `prediction_code`
- `prediction_label`
- `plant_species`
- `condition_name`
- `condition_group`
- `health_state`
- `severity`
- `recommended_action`

## 5.2 Estrategia del PR1

El PR1 no debe depender de nuevas tablas ni de reentrenamiento del modelo. Debe introducir una taxonomia semantica de transicion en backend.

## 5.3 Artefacto recomendado

Crear un nuevo archivo backend de resolucion semantica, por ejemplo:

- `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py`

Su responsabilidad:

1. recibir el payload crudo devuelto por FastAPI
2. aplicar reglas de resolucion por `diagnosis`, `class_index` y fallback
3. devolver un objeto semantico canónico

## 5.4 Interfaz logica sugerida

```python
resolve_prediction(raw_result: dict) -> dict
```

## 5.5 Mapeo inicial recomendado para PR1

### Casos explicitamente soportados

| Entrada tecnica | prediction_code | prediction_label | plant_species | condition_name | health_state | severity |
|---|---|---|---|---|---|---|
| `Tomato_Early_blight` | `plant_disease.tomato.early_blight` | `Tomato Early Blight` | `tomato` | `early_blight` | `warning` | `medium` |
| `Tomato_Late_blight` | `plant_disease.tomato.late_blight` | `Tomato Late Blight` | `tomato` | `late_blight` | `critical` | `high` |
| `Tomato_Healthy` | `plant_health.tomato.healthy` | `Tomato Healthy` | `tomato` | `healthy` | `healthy` | `none` |
| `Potato_Early_blight` | `plant_disease.potato.early_blight` | `Potato Early Blight` | `potato` | `early_blight` | `warning` | `medium` |

### Casos tecnicos heredados

| Entrada tecnica | Resolucion PR1 |
|---|---|
| `class_0` | mapear segun taxonomia transicional definida por arquitectura |
| `class_1` | mapear segun taxonomia transicional definida por arquitectura |
| `enferma` | resolver a una categoria generica de enfermedad si no hay mejor evidencia |
| `sana` | resolver a una categoria generica saludable |

## 5.6 Regla de degradacion controlada

Si no puede determinarse una taxonomia exacta, el resolver no debe inventar una enfermedad especifica. Debe devolver una salida canónica degradada, por ejemplo:

```json
{
  "prediction_code": "plant_condition.unknown",
  "prediction_label": "Unknown Plant Condition",
  "plant_species": "unknown",
  "condition_name": "unknown",
  "condition_group": "anomaly",
  "health_state": "unknown",
  "severity": "unknown",
  "recommended_action": "Revisar muestra y validar taxonomia semantica"
}
```

## 6. Cambios exactos por archivo

## 6.1 Backend

### 1. `src/backend/api/urls.py`

#### Cambio requerido

- registrar `path('v3/ai/inference/', AIInferenceV3View.as_view(), name='ai-inference-v3')`

#### Motivo

- establecer la ruta publica oficial del AI Context

#### Riesgo

- bajo

### 2. `src/backend/api/views.py`

#### Cambio requerido

1. importar el puerto/adapter ya usado por V3
2. crear `AIInferenceV3View(APIView)`
3. aceptar `POST`
4. leer `request.FILES['file']`
5. enviar bytes al servicio de IA
6. invocar el resolver semantico
7. devolver el envelope `context = ai`

#### Motivo

- el archivo ya contiene el patron V3 del backend
- es el punto natural para introducir el nuevo endpoint oficial

#### Riesgo

- medio

### 3. `src/backend/core/ports/services/ai_service_port.py`

#### Cambio requerido

- mantener `predecir_enfermedad(self, imagen_bytes: bytes) -> Dict[str, Any]`
- opcionalmente documentar de forma mas precisa que devuelve payload crudo del servicio externo

#### Motivo

- el puerto actual ya sirve para PR1
- no hace falta ampliar la interfaz para este primer corte

#### Riesgo

- bajo

### 4. `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`

#### Cambio requerido

1. conservar llamada a `/infer`
2. asegurar que el metodo `predecir_enfermedad` devuelva consistentemente el payload crudo o un error estructurado
3. no mezclar resolucion semantica dentro del adapter

#### Motivo

- el adapter debe seguir siendo un boundary tecnico, no el lugar de la semantica de negocio

#### Riesgo

- bajo

### 5. Nuevo archivo: `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py`

#### Cambio requerido

- crear el resolvedor de taxonomia transicional

#### Motivo

- sacar la semantica del frontend
- no contaminar `views.py` con tablas de mapeo grandes

#### Riesgo

- medio

### 6. Opcional para el PR1: `src/backend/infrastructure/config/dependencies.py`

#### Cambio requerido

- no obligatorio si el resolver se instancia localmente
- si se quiere mantener coherencia DI, puede agregarse un `get_semantic_prediction_resolver()`

#### Motivo

- mantener la pauta hexagonal del backend

#### Riesgo

- bajo

## 6.2 Frontend

### 7. `src/frontend/src/pages/AIPredictiva.jsx`

#### Cambio requerido

1. reemplazar `const API_BASE = 'http://localhost:8000';`
2. consumir `/api/v3/ai/inference/`
3. dejar de leer `data.diagnosis` como fuente principal
4. leer `data.prediction.*`
5. transformar la UI para usar el envelope oficial
6. reducir el rol de `PLANT_DISEASE_DB` a compatibilidad temporal o eliminarlo si el contrato oficial ya trae todos los campos mostrados

#### Motivo

- eliminar dependencia directa del frontend con el servicio tecnico
- hacer que la UI consuma el contrato semantico del AI Context

#### Riesgo

- medio

## 7. Orden exacto de implementacion

1. crear el resolvedor semantico en backend
2. crear `AIInferenceV3View` en `views.py`
3. registrar `v3/ai/inference/` en `urls.py`
4. ajustar el adapter solo si hace falta estabilizar forma de error
5. adaptar `AIPredictiva.jsx` al envelope oficial
6. ejecutar pruebas backend y frontend
7. validar manualmente el flujo con imagen real y con error de servicio

## 8. Riesgos del PR1

### Riesgo 1. Taxonomia incompleta

El modelo y `model_metadata.json` no traen una taxonomia de negocio suficiente. El PR1 depende de una taxonomia transicional definida por arquitectura.

### Riesgo 2. Resolver semantico engañoso

Si el mapeo fuerza enfermedades especificas cuando solo existe evidencia de `class_N`, se puede fabricar una semantica falsa. El PR1 debe priorizar degradacion controlada antes que precision inventada.

### Riesgo 3. Ruptura de UI

`AIPredictiva.jsx` hoy espera `diagnosis` y `confidence`. Cambiar al envelope oficial exige adaptar la lectura de datos y la presentacion.

### Riesgo 4. Mezcla de responsabilidades

Si el adapter empieza a resolver taxonomia, se perdera la separacion entre transporte externo y semantica de negocio.

### Riesgo 5. Fallbacks que ocultan errores

El frontend actual puede seguir aparentando exito aunque la inferencia oficial falle. El PR1 debe dejar visible el error oficial o marcar claramente `source_mode = fallback`.

## 9. Rollback

## 9.1 Rollback minimo

Si el PR1 falla, el rollback debe hacerse en este orden:

1. retirar `path('v3/ai/inference/', ...)` de `urls.py`
2. retirar `AIInferenceV3View` de `views.py`
3. retirar el resolver semantico nuevo
4. restaurar `AIPredictiva.jsx` al flujo anterior

## 9.2 Criterio de rollback

Aplicar rollback si ocurre cualquiera de estos eventos:

1. `AIPredictiva.jsx` deja de mostrar resultados aunque el servicio tecnico responda
2. el backend responde 500 sistematicamente en `POST /api/v3/ai/inference/`
3. el resolver publica semantica incorrecta de forma masiva
4. el endpoint nuevo impacta negativamente endpoints V2 o V3 existentes

## 10. Pruebas requeridas

## 10.1 Pruebas backend

1. request exitosa con archivo valido
2. request sin archivo
3. error de comunicacion con el servicio IA
4. respuesta cruda con `diagnosis = class_0`
5. respuesta cruda con `diagnosis = Tomato_Early_blight`
6. respuesta cruda no mapeable
7. verificacion de envelope oficial con `context = ai`

## 10.2 Pruebas frontend

1. `AIPredictiva.jsx` envia `multipart/form-data` al nuevo endpoint
2. muestra `prediction_label`
3. muestra `recommended_action`
4. muestra confianza usando `prediction.confidence`
5. maneja respuesta de error oficial sin caer silenciosamente a falso exito

## 10.3 Validacion de compatibilidad

1. `GET /api/v3/ai/crop-advice/` sigue intacto
2. `POST /infer` sigue operativo como dependencia interna
3. `VoiceAssistant.jsx` y `DataScienceLab.jsx` no son afectados por el PR1

## 11. Casos de prueba sugeridos

### Caso A. Diagnostico con salida semantica conocida

- input: imagen de hoja enferma
- upstream: `Tomato_Early_blight`
- esperado: `prediction_code = plant_disease.tomato.early_blight`

### Caso B. Diagnostico con salida tecnica `class_0`

- input: imagen valida
- upstream: `class_0`
- esperado: resolucion segun taxonomia transicional o degradacion controlada

### Caso C. Servicio IA fuera de linea

- esperado: response de error oficial o `source_mode = fallback`, sin exito silencioso

### Caso D. Request invalido

- input: request sin `file`
- esperado: `400`

## 12. Orden recomendado por commits del PR1

1. commit 1: resolver semantico
2. commit 2: endpoint backend `v3/ai/inference/`
3. commit 3: integracion `AIPredictiva.jsx`
4. commit 4: pruebas

## 13. Conclusiones

1. El PR1 correcto del AI Context no es tocar el modelo, sino crear la fachada oficial `POST /api/v3/ai/inference/`.
2. El contrato exacto debe publicar `prediction_code` y mover `class_index` a `trace`.
3. El resolver semantico debe vivir en backend y operar como taxonomia transicional controlada.
4. `AIPredictiva.jsx` debe pasar a consumir el endpoint oficial EIARC y dejar de depender de `/infer`.
5. El PR1 es viable con riesgo medio si se mantiene el alcance acotado y se protege la semantica con degradacion controlada.
