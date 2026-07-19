# AI_CONTEXT_V2_REMEDIATION_REPORT

## Fecha

2026-07-16

## Objetivo

Registrar la remediación aplicada a los hallazgos confirmados por:

- [AI_CONTEXT_V2_IMPLEMENTATION_AUDIT.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/AI_CONTEXT_V2_IMPLEMENTATION_AUDIT.md)

Alcance de la remediación:

1. eliminar fallbacks legacy incompatibles con el modelo binario actual
2. completar la trazabilidad visible en frontend
3. fijar explícitamente la decisión EIARC sobre `raw_result.status == "error"`

---

## 1. Archivos modificados

1. [fastapi_app.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/ai_models/fastapi_app.py)
2. [AIPredictiva.jsx](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/AIPredictiva.jsx)
3. [views.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py)

---

## 2. Cambios realizados

## 2.1 Remediación del microservicio FastAPI

Archivo:

- [fastapi_app.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/ai_models/fastapi_app.py#L231-L278)

Cambio aplicado:

- se eliminó cualquier fallback con enfermedad específica (`Tomato_Early_blight`)
- cuando no hay modelo disponible o TensorFlow no está cargado:
  - `diagnosis = "unknown"`
  - `class_index = -1`
  - `confidence = 0.0`
  - `status = "error"`
  - `detail = ...`
- cuando ocurre excepción:
  - se devuelve fallback técnico explícito y trazable
  - sin semántica fitopatológica ficticia

Resultado:

- desaparece el diagnóstico legacy incompatible con el modelo binario
- el microservicio sigue siendo trazable
- ya no contamina `trace.raw_diagnosis` con una enfermedad inventada

## 2.2 Remediación de trazabilidad frontend

Archivo:

- [AIPredictiva.jsx](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/AIPredictiva.jsx#L129-L152)
- [AIPredictiva.jsx](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/AIPredictiva.jsx#L516-L557)

Cambio aplicado:

- `buildInfoFromOfficialResponse()` ahora captura:
  - `semantic_contract_version`
  - `prediction_code`
  - `condition_group`
- el panel de trazabilidad ahora muestra:
  - `prediction_code`
  - `raw_diagnosis`
  - `raw_class_index`
  - `condition_group`
  - `confidence`
  - `model_version`
  - `scientific_scope`
  - `semantic_contract_version`
  - `source_mode`

Resultado:

- la UI oficial ya expone la clave primaria semántica
- la UI oficial ya expone la versión del contrato
- se completa la gobernanza visible esperada por EIARC

## 2.3 Decisión EIARC sobre `raw_result.status == "error"`

Archivo:

- [views.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L221-L259)

Decisión adoptada:

- `status="error"` del upstream **no se convierte automáticamente en error duro**
- se mantiene como `source_mode = fallback` cuando no existe `raw_result.error`
- se registra explícitamente:
  - `upstream_status`
  - `upstream_detail`

Justificación:

- conforme a [EIARC_AI_SEMANTIC_CONTRACT.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md#L212-L215), `source_mode=fallback` no invalida el contrato
- el problema auditado no era la existencia de fallback, sino la semántica ficticia que transportaba
- al reemplazar esa semántica por `unknown`, el fallback vuelve a ser consistente con EIARC

---

## 3. Problemas corregidos

## 3.1 Problema 1 corregido

Antes:

- el microservicio técnico podía publicar `Tomato_Early_blight` en rutas de fallback/mock

Ahora:

- solo publica `unknown` con `status="error"` y `detail`

Estado:

- **corregido**

## 3.2 Problema 2 corregido

Antes:

- el frontend no hacía visible `prediction_code`
- el frontend no hacía visible `semantic_contract_version`

Ahora:

- ambos se muestran en el panel de trazabilidad
- también se hace visible `condition_group`

Estado:

- **corregido**

## 3.3 Observación de riesgo medio resuelta de forma explícita

Antes:

- la decisión sobre `status="error"` del upstream estaba implícita

Ahora:

- la decisión está codificada explícitamente:
  - `fallback` válido EIARC
  - con trazabilidad reforzada
  - sin diagnóstico ficticio

Estado:

- **resuelto**

---

## 4. Validación contra EIARC

## 4.1 Compatibilidad con `prediction_code`

Cumple:

- [EIARC_AI_SEMANTIC_CONTRACT.md:L188-L194](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md#L188-L194)

Razón:

- el consumidor UI ya muestra `prediction_code`

## 4.2 Compatibilidad con versionado explícito del contrato

Cumple:

- [EIARC_AI_SEMANTIC_CONTRACT.md:L208-L210](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md#L208-L210)

Razón:

- el consumidor UI ya muestra `semantic_contract_version`

## 4.3 Compatibilidad con `source_mode=fallback`

Cumple:

- [EIARC_AI_SEMANTIC_CONTRACT.md:L212-L215](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md#L212-L215)

Razón:

- se preserva `fallback` como modo válido
- el fallback ya no inyecta una enfermedad específica incompatible con el modelo real

## 4.4 Compatibilidad con corrección científica aprobada

Cumple:

- [AI_SCIENTIFIC_CORRECTION_DESIGN.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/AI_SCIENTIFIC_CORRECTION_DESIGN.md)

Razón:

- se eliminó el diagnóstico ficticio específico del flujo técnico fallback
- se refuerza la trazabilidad visible extrema a extremo

---

## 5. Validaciones ejecutadas

1. diagnósticos del editor:
   - `fastapi_app.py`: sin errores
   - `AIPredictiva.jsx`: sin errores
   - `views.py`: sin errores
2. búsqueda en `fastapi_app.py`:
   - no quedan referencias a `Tomato_Early_blight`
   - no quedan referencias a diagnósticos específicos legacy
3. búsqueda en `AIPredictiva.jsx`:
   - `prediction_code` presente
   - `semantic_contract_version` presente
   - `condition_group` presente

---

## 6. GO / NO GO final

## Decisión

**GO**

## Justificación

1. ya no existen diagnósticos fitopatológicos ficticios en el fallback técnico auditado
2. la interfaz oficial ya publica trazabilidad científica completa para el alcance actual:
   - `prediction_code`
   - `semantic_contract_version`
   - `condition_group`
   - `raw_diagnosis`
   - `raw_class_index`
   - `confidence`
   - `model_version`
   - `scientific_scope`
   - `source_mode`
3. el backend, el resolver y el frontend quedan consistentes con el alcance binario actual
4. la decisión sobre `fallback` queda alineada con EIARC y ya no rompe coherencia científica

---

## 7. Conclusión final

La remediación convierte el dictamen previo `NO-GO` en `GO` sin introducir una arquitectura nueva ni reabrir decisiones cerradas. El sistema queda alineado con los criterios de éxito definidos:

- trazabilidad científica completa
- coherencia binaria completa
- eliminación de diagnósticos ficticios
- cumplimiento del contrato EIARC
- consistencia entre frontend, backend y resolver semántico
