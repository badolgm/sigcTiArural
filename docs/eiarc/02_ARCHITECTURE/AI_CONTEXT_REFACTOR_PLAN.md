# AI Context Refactor Plan

## Fecha

2026-07-12

## Version

v1.0.0

## Objetivo

Preparar la implementacion oficial del AI Context de EIARC mediante un plan tecnico que describa el estado actual, el contrato semantico actual y objetivo, las brechas, el endpoint oficial recomendado, las entidades necesarias, el orden exacto de implementacion, riesgos, dependencias y el PR1 recomendado.

## Referencias

- `docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md`
- `docs/project_knowledge_base/KB-003-AI-INTEGRATION-AUDIT.md`
- `docs/project_knowledge_base/KB-004-AI-SEMANTIC-CONTRACT-AUDIT.md`
- `docs/project_knowledge_base/KB-005-EIARC-AI-CANONICAL-MODEL.md`
- `src/ai_models/fastapi_app.py`
- `src/ai_models/production_models/model_metadata.json`
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`
- `src/backend/core/ports/services/ai_service_port.py`
- `src/backend/api/logic/adapters/ai_service.py`
- `src/backend/api/urls.py`
- `src/backend/api/views.py`
- `src/frontend/src/pages/AIPredictiva.jsx`
- `src/frontend/src/components/VoiceAssistant.jsx`
- `src/frontend/src/pages/DataScienceLab.jsx`

## Resumen ejecutivo

El AI Context ya existe como capacidad tecnica, pero no como contexto oficial EIARC. Hoy conviven cuatro capas con contratos distintos:

1. `FastAPI` como microservicio tecnico de inferencia y voz.
2. `backend Django` como consumidor parcial para sugerencias de cultivo.
3. `AIPredictiva.jsx` como consumidor directo de `/infer`.
4. `VoiceAssistant.jsx` y `DataScienceLab.jsx` como consumidores paralelos de capacidades del mismo servicio.

La conclusion principal es clara:

- el repositorio **no tiene todavia un endpoint oficial EIARC para diagnostico IA**
- el contrato publicado hoy es **tecnico y no semantico**
- el primer paso correcto no es cambiar modelos, sino **crear una fachada oficial de AI Context gobernada por backend**

## 1. Estado actual

### 1.1 Microservicio IA actual

`src/ai_models/fastapi_app.py` expone hoy varias capacidades:

- `GET /health`
- `POST /infer`
- `POST /assist`
- `GET /events`
- `POST /analyze-circuit`

Observaciones:

- `POST /infer` acepta `multipart/form-data` con campo `file`
- si TensorFlow y el modelo estan disponibles, publica `diagnosis = class_{idx}`
- si no, cae a valores mock o fallback
- el servicio mezcla inferencia agricola, voz, SSE y analisis de laboratorio en un mismo proceso

### 1.2 Backend actual

El backend expone hoy solo endpoints de consejo agricola:

- `GET /api/v2/ai/crop-advice/`
- `GET /api/v3/ai/crop-advice/`

Observaciones:

- no existe endpoint backend para diagnostico de imagen
- existen dos adaptadores hacia FastAPI:
  - `src/backend/api/logic/adapters/ai_service.py` en la rama legacy
  - `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py` en la rama mas alineada a hexagonal
- ambos adaptadores dependen del endpoint tecnico interno `/infer`

### 1.3 Frontend actual

#### AIPredictiva

`src/frontend/src/pages/AIPredictiva.jsx`:

- consume `POST http://localhost:8000/infer`
- interpreta `diagnosis` contra una base local `PLANT_DISEASE_DB`
- usa fallback mock cuando el backend falla
- contiene una semantica de negocio en frontend que hoy no esta gobernada por EIARC

#### VoiceAssistant

`src/frontend/src/components/VoiceAssistant.jsx`:

- consume `POST ${VITE_AI_API_BASE || http://localhost:8081}/assist`
- depende directamente del servicio tecnico de voz
- no pasa por backend ni por un facade contextual

#### DataScienceLab

`src/frontend/src/pages/DataScienceLab.jsx`:

- consume `GET ${VITE_AI_API_BASE || https://sigct-backend.onrender.com}/events`
- enlaza `metrics`, pero no hay evidencia del endpoint `/metrics` en `fastapi_app.py`
- espera estructura SSE con `data.result.top_class_index`, mientras el log de inferencia contiene `class_index`, `confidence`, `model` y `status`

### 1.4 Metadato de modelo actual

`src/ai_models/production_models/model_metadata.json` contiene:

- `classes = ["enferma", "sana"]`
- `framework = "tensorflow_fixed"`

Esto confirma que el metadato actual tampoco coincide con:

- `class_N` expuesto por FastAPI
- taxonomia agricola esperada por `AIPredictiva.jsx`
- contrato EIARC de diagnostico semantico

## 2. Contrato semantico actual

### 2.1 Contrato tecnico real de inferencia

Entrada actual:

- `POST /infer`
- `multipart/form-data`
- campo `file`

Salida actual:

- `diagnosis`
- `confidence`
- `class_index`
- `model`
- `processing_time`
- `status`

### 2.2 Contrato semantico realmente consumido

El significado de negocio actual no vive en un solo lugar:

- FastAPI publica `class_N` o una etiqueta mock
- `AIPredictiva.jsx` espera claves como `Tomato_Early_blight`
- `model_metadata.json` declara `enferma` y `sana`
- la documentacion EIARC exige `prediction_code`, `prediction_label`, `plant_species`, `condition_name`, `condition_group`, `health_state`, `severity`, `confidence`, `recommended_action`, `model_id`, `model_version`, `semantic_contract_version`, `source_mode`

### 2.3 Diagnostico del contrato actual

El contrato actual puede describirse asi:

- compatible a nivel HTTP
- incompatible a nivel semantico
- acoplado a implementacion interna
- contaminado por fallbacks de UI y servicio

## 3. Brechas detectadas

### 3.1 Brechas de arquitectura

1. No existe un endpoint oficial backend para diagnostico IA.
2. El frontend consume el servicio tecnico directamente.
3. Hay dos adaptadores backend para la misma dependencia externa.
4. El AI Context comparte proceso con voz, SSE y analisis de laboratorio.

### 3.2 Brechas de contrato

1. `class_index` y `class_N` siguen ocupando el lugar del significado de negocio.
2. No existe una capa de resolucion semantica explicita.
3. No existe versionado real del contrato publicado al frontend.
4. `DataScienceLab.jsx` espera una forma SSE distinta a la que realmente se produce.

### 3.3 Brechas de datos

1. El CDM EIARC todavia no tiene entidades persistidas para `Prediction`, `InferenceResult`, `Recommendation` y `ModelDescriptor`.
2. No existe registro canónico de taxonomia agricola.
3. No existe registro de `semantic_contract_version` publicado por IA.

### 3.4 Brechas operativas

1. `AIPredictiva.jsx` esta fijado a `http://localhost:8000`.
2. `VoiceAssistant.jsx` usa `8081`, mientras `AIPredictiva.jsx` usa `8000`.
3. La experiencia puede parecer funcional por fallbacks aunque el contrato real este roto.

## 4. Contrato semantico objetivo

## 4.1 Regla central

El contrato oficial del AI Context debe alinearse con `EIARC_AI_SEMANTIC_CONTRACT.md` y no con la salida cruda del modelo.

## 4.2 Envelope oficial recomendado

El endpoint oficial de diagnostico debe responder un envelope de contexto:

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
    "recommended_action": "Aplicar protocolo agronomico oficial",
    "model_id": "plant_disease_classifier",
    "model_version": "plant_disease_mbv2",
    "semantic_contract_version": "v1"
  },
  "trace": {
    "provider": "fastapi_ai_service",
    "raw_class_index": 0,
    "processing_time": "0.12s"
  }
}
```

## 4.3 Principios del contrato objetivo

1. `prediction_code` es la clave de interoperabilidad.
2. `prediction_label` es para UX, no para compatibilidad.
3. `class_index` deja de ser contrato publico y pasa a `trace`.
4. `source_mode` debe informar `cloud`, `edge`, `fallback` o `mock`.
5. todo diagnostico oficial debe publicar `semantic_contract_version`.

## 5. Endpoint oficial IA

## 5.1 Endpoint oficial recomendado

### Endpoint publico EIARC

- `POST /api/v3/ai/inference/`

### Responsabilidad

- recibir la solicitud oficial del frontend o de otros consumidores
- delegar la inferencia al microservicio tecnico
- resolver la salida tecnica contra el contrato semantico EIARC
- devolver un envelope estable y versionado

## 5.2 Endpoints internos permitidos

- `POST /infer` como endpoint interno del microservicio
- `POST /assist` como endpoint interno de voz
- `GET /events` como canal tecnico de observabilidad

## 5.3 Endpoints existentes a conservar temporalmente

- `GET /api/v2/ai/crop-advice/`
- `GET /api/v3/ai/crop-advice/`

Estos endpoints no deben considerarse el endpoint oficial de diagnostico del AI Context; son una capacidad derivada de recomendacion basada en sensores.

## 6. Entidades necesarias

Tomando como base `EIARC_CANONICAL_DATA_MODEL.md`, el AI Context necesita al menos las siguientes entidades canonicas:

1. `InferenceRequest`
   - representa la solicitud oficial de diagnostico
   - incluye origen, archivo o referencia, actor y timestamp

2. `Prediction`
   - representa la prediccion de negocio publicada
   - contiene `prediction_code`, `prediction_label`, `health_state`, `severity`

3. `InferenceResult`
   - agrega `Prediction`, `confidence`, `source_mode`, `processing_time`

4. `Recommendation`
   - accion agronomica asociada a una prediccion

5. `ModelDescriptor`
   - identifica `model_id`, `model_version`, familia y taxonomia soportada

6. `SemanticContractVersion`
   - representa el contrato EIARC consumido y publicado

7. `PredictionTaxonomy`
   - registro de equivalencia entre salida tecnica y significado canónico

8. `InferenceEvent`
   - evento observacional para SSE, metricas y auditoria

## 7. Orden exacto de implementacion

## Fase 1. Consolidacion del facade oficial

1. Definir el contrato oficial `POST /api/v3/ai/inference/`.
2. Hacer que el backend sea la unica puerta publica de diagnostico.
3. Mantener `POST /infer` como servicio interno, no como contrato de negocio.

## Fase 2. Resolucion semantica

4. Introducir un resolvedor semantico entre `class_index` y `prediction_code`.
5. Mover `PLANT_DISEASE_DB` fuera de `AIPredictiva.jsx` hacia un artefacto de dominio o configuracion canónica.
6. Publicar `semantic_contract_version` y `model_version`.

## Fase 3. Convergencia de adaptadores

7. Unificar el adaptador legacy `api.logic.adapters.ai_service.py` y el adaptador de infraestructura `infrastructure/external/ai_service/fastapi_ai_adapter.py`.
8. Conservar solo el puerto `core/ports/services/ai_service_port.py` como contrato backend.

## Fase 4. Convergencia de consumidores

9. Hacer que `AIPredictiva.jsx` consuma `/api/v3/ai/inference/`.
10. Replantear `VoiceAssistant.jsx` como subcapacidad del AI Context, pero sin mezclar su contrato con diagnostico de imagen.
11. Reconciliar `DataScienceLab.jsx` con un contrato de eventos real y estable.

## Fase 5. Observabilidad y trazabilidad

12. Publicar un formato oficial de `InferenceEvent`.
13. Alinear SSE y metricas con el resultado canonico, no con el log crudo del modelo.

## 8. Riesgos

1. **Riesgo de ruptura UX**
   - al eliminar el fallback semantico local del frontend puede quedar visible la desalineacion real del servicio

2. **Riesgo de mezcla de contratos**
   - si `AIPredictiva.jsx` y `DataScienceLab.jsx` siguen consumiendo contratos tecnicos distintos, el AI Context quedara fragmentado

3. **Riesgo de dependencia del modelo actual**
   - `model_metadata.json` hoy solo declara `enferma/sana`, por lo que la resolucion semantica necesita una taxonomia gobernada por arquitectura

4. **Riesgo de consolidar endpoints equivocados**
   - tratar `/infer` como endpoint publico perpetua el acoplamiento al microservicio tecnico

5. **Riesgo de convivir con duplicidad legacy**
   - dos adaptadores backend para la misma dependencia aumentan deuda tecnica y divergencia

## 9. Dependencias

1. `EIARC_AI_SEMANTIC_CONTRACT.md` como fuente de verdad del contrato de negocio.
2. Definicion de una taxonomia canónica de diagnosticos vegetales.
3. Registro de `model_id` y `model_version` verificable.
4. Parametrizacion por entorno de la URL del microservicio IA.
5. Un puerto backend unico para inferencia y recomendaciones.
6. Acuerdo de formato para eventos de observabilidad.

## 10. PR1 recomendado para AI Context

## Nombre sugerido

`PR1 - AI Context official inference facade`

## Objetivo del PR1

Crear la fachada oficial del AI Context sin cambiar todavia el modelo ni reescribir voz o laboratorios.

## Alcance recomendado

### Backend

1. crear `POST /api/v3/ai/inference/`
2. encapsular llamada a `/infer` dentro del backend
3. publicar envelope `context = ai`
4. incorporar `prediction_code`, `prediction_label`, `confidence`, `source_mode`, `model_id`, `model_version`, `semantic_contract_version`

### Frontend

5. hacer que `AIPredictiva.jsx` deje de llamar `http://localhost:8000/infer`
6. hacer que consuma exclusivamente `/api/v3/ai/inference/`
7. retirar la responsabilidad de taxonomia local como fuente principal de verdad

### No incluido en PR1

- no refactorizar `VoiceAssistant.jsx`
- no refactorizar `DataScienceLab.jsx`
- no modificar modelos de TensorFlow
- no rediseñar SSE completo

## Archivos candidatos para PR1

### Backend

- `src/backend/api/urls.py`
- `src/backend/api/views.py`
- `src/backend/core/ports/services/ai_service_port.py`
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`
- nuevo artefacto de resolucion semantica en backend

### Frontend

- `src/frontend/src/pages/AIPredictiva.jsx`

## Riesgo estimado del PR1

- Riesgo: medio
- Complejidad: media

Justificacion:

- toca integracion visible de IA
- pero se puede acotar a una sola experiencia frontend y a una sola fachada backend
- no obliga todavia a intervenir voz, labs ni modelos

## Conclusiones

1. El AI Context existe hoy como capacidad tecnica, no como contexto oficial EIARC.
2. El mayor problema actual no es de transporte, sino de significado.
3. El endpoint oficial correcto debe vivir en backend y publicar un contrato semantico estable.
4. `POST /infer` debe seguir existiendo como endpoint interno del microservicio, no como contrato publico del producto.
5. El PR1 correcto para AI Context es una fachada oficial de inferencia con resolucion semantica y un unico consumidor inicial: `AIPredictiva.jsx`.
