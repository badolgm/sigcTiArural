# AI PREDICTION VALIDATION AUDIT

## Fecha

2026-07-16

## Objetivo

Determinar en qué punto exacto se distorsiona la predicción real del sistema de IA, auditando el flujo completo:

- modelo `plant_disease_mbv2.h5`
- microservicio `FastAPI` en `src/ai_models/fastapi_app.py`
- adaptador backend
- `semantic_prediction_resolver.py`
- endpoint oficial `POST /api/v3/ai/inference/`
- render final en `src/frontend/src/pages/AIPredictiva.jsx`

Este documento no implementa correcciones. Solo identifica dónde se produce la inconsistencia entre la predicción real y el diagnóstico mostrado.

---

## 1. Resumen ejecutivo

### Hallazgo principal

La inconsistencia se produce en **dos niveles diferentes**:

1. **Nivel modelo/microservicio**
   - el modelo cargado es binario y devuelve `class_0` / `class_1`
   - en las pruebas auditadas, el modelo colapsa sistemáticamente hacia `class_0` con alta confianza, incluso para entradas no vegetales

2. **Nivel diagnóstico visual observado**
   - el backend oficial actual **no convierte `class_0` en “Tizón Temprano”**
   - el backend oficial actual lo convierte en **`Plant Disease Detected`**
   - por tanto, si la interfaz muestra `TIZÓN TEMPRANO (ALTERNARIA SOLANI)`, esa salida **no coincide con el flujo oficial actual del código auditado**

### Conclusión de causa raíz

La causa raíz más probable del problema observado es una combinación de:

- **colapso del modelo binario hacia `class_0`**
- **resolución semántica insuficiente que degrada `class_0` a un diagnóstico genérico**
- y, adicionalmente, **una desalineación entre el runtime visual observado y el flujo oficial actual del frontend fuente**, porque la UI fuente auditada no debería mostrar “Tizón Temprano” al consumir el endpoint oficial actual

---

## 2. Flujo auditado

El flujo real auditado es:

```text
Imagen
-> /infer (FastAPI)
-> diagnosis = class_N
-> class_index = N
-> backend Django /api/v3/ai/inference/
-> SemanticPredictionResolver
-> prediction.prediction_label
-> AIPredictiva.jsx
-> detailedInfo.disease
```

---

## 3. Resultado real devuelto por `/infer`

## 3.1 Implementación real en `fastapi_app.py`

El endpoint `POST /infer` hace:

1. preprocesa imagen a `224x224`
2. ejecuta `model.predict(...)`
3. toma `idx = np.argmax(preds)`
4. devuelve:
   - `diagnosis = f"class_{idx}"`
   - `class_index = idx`
   - `confidence = max(preds)`

Evidencia de implementación:

- [fastapi_app.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/ai_models/fastapi_app.py)

### Hallazgo crítico

El microservicio **no devuelve una enfermedad agrícola explícita** cuando el modelo real está activo. Devuelve:

- `class_0`
- `class_1`

Es decir:

- el nombre semántico de la enfermedad **no sale del modelo**
- sale de capas posteriores o de fallbacks

## 3.2 Respuesta auditada sobre `test_leaf.jpg`

Respuesta real observada:

```json
{"diagnosis":"class_0","confidence":0.9953,"class_index":0,"model":"plant_disease_mbv2.h5","processing_time":"0.34s","status":"ok"}
```

### Conclusión

Para una hoja real del repositorio, el modelo no devolvió:

- `Tomato_Early_blight`
- `Tomato_Late_blight`
- `Tomato_Healthy`
- `Potato_Early_blight`

Devolvió:

- `class_0`

---

## 4. Cómo se transforma cada clase existente

## 4.1 Clases existentes reales del modelo

El archivo `src/ai_models/production_models/model_metadata.json` declara:

```json
{"classes": ["enferma", "sana"], "framework": "tensorflow_fixed"}
```

Además, la inspección del modelo cargado mostró:

- `input_shape = (None, 224, 224, 3)`
- `output_shape = (None, 2)`

### Conclusión

El modelo auditado tiene **solo 2 clases reales**:

1. `class_0`
2. `class_1`

No existen clases reales auditadas:

- `class_2`
- `class_3`
- `class_4`
- etc.

## 4.2 Transformación de `class_0`

En `semantic_prediction_resolver.py`:

- si `class_index == 0`
- o si `diagnosis == "enferma"`

se transforma a:

```json
{
  "prediction_code": "plant_condition.generic.diseased",
  "prediction_label": "Plant Disease Detected",
  "plant_species": "unknown",
  "condition_name": "diseased",
  "condition_group": "disease",
  "health_state": "warning",
  "severity": "medium"
}
```

### Conclusión

`class_0` **no se transforma** a:

- `Tomato_Early_blight`
- `Tizón Temprano`

Se transforma a:

- `Plant Disease Detected`

## 4.3 Transformación de `class_1`

En `semantic_prediction_resolver.py`:

- si `class_index == 1`
- o si `diagnosis == "sana"`

se transforma a:

```json
{
  "prediction_code": "plant_health.generic.healthy",
  "prediction_label": "Plant Healthy",
  "plant_species": "unknown",
  "condition_name": "healthy",
  "condition_group": "normality",
  "health_state": "healthy",
  "severity": "none"
}
```

## 4.4 Transformación de `class_2` y superiores

No existen en el modelo auditado. Si aparecieran por corrupción o inconsistencia, el resolver terminaría en:

```json
{
  "prediction_code": "plant_condition.unknown",
  "prediction_label": "Unknown Plant Condition",
  "health_state": "unknown"
}
```

### Conclusión

Las únicas clases realmente soportadas por el `.h5` auditado son:

- `class_0`
- `class_1`

---

## 5. Si existe mapping hardcodeado

## 5.1 Sí existe mapping hardcodeado en el frontend

`AIPredictiva.jsx` contiene un diccionario local:

- `PLANT_DISEASE_DB`

con entradas hardcodeadas:

- `Tomato_Late_blight`
- `Tomato_Early_blight`
- `Tomato_Healthy`
- `Potato_Early_blight`

Y las descripciones en español:

- `Tizón Tardío (Phytophthora infestans)`
- `Tizón Temprano (Alternaria solani)`
- `Ninguna (Planta Saludable)`

### Conclusión

Sí existe un catálogo hardcodeado en React.

## 5.2 Sí existe mapping hardcodeado en el resolver semántico

`semantic_prediction_resolver.py` contiene:

- `EXPLICIT_DIAGNOSIS_MAP`

para:

- `Tomato_Early_blight`
- `Tomato_Late_blight`
- `Tomato_Healthy`
- `Potato_Early_blight`

### Conclusión

Sí existe mapping hardcodeado también en backend.

---

## 6. Si existe fallback fijo

## 6.1 Sí existe fallback fijo en `fastapi_app.py`

Si TensorFlow no está disponible o el modelo no carga:

- `diagnosis = "Tomato_Early_blight"`
- `confidence = 0.87`
- `idx = 0`

Si ocurre excepción en `/infer`, el endpoint devuelve:

```json
{
  "diagnosis": "Tomato_Early_blight",
  "confidence": 0.5,
  "class_index": 0,
  "model": "fallback",
  "status": "error"
}
```

### Conclusión

Sí existe un fallback fijo que puede inyectar `Tomato_Early_blight`.

## 6.2 Sí existe fallback local antiguo en el frontend

La función `processDiagnosis()`:

- busca el `rawDiagnosis` en `PLANT_DISEASE_DB`
- si no existe y detecta “healthy” o “sana”, usa `Tomato_Healthy`
- de lo contrario devuelve un objeto local genérico `warning`

### Conclusión

Sí existe un camino frontend legacy/fallback.

---

## 7. Si existe diagnóstico fijo en React

### Respuesta

**Sí existe capacidad de diagnóstico fijo en React, pero no en el camino oficial actual de upload.**

### Evidencia

El texto “Tizón Temprano (Alternaria solani)” existe en:

- `PLANT_DISEASE_DB['Tomato_Early_blight']`

Pero el flujo de upload actual hace:

```javascript
setResult(data);
const info = processOfficialPrediction(data.prediction, data.source_mode);
```

Es decir:

- usa `prediction.prediction_label`
- no usa `processDiagnosis()` en el flujo normal de upload

### Conclusión

El React fuente auditado **no debería mostrar “Tizón Temprano”** cuando consume correctamente el backend oficial actual.

Si lo muestra en runtime, las explicaciones más probables son:

1. `robotMode` estaba activo
2. el runtime servido no coincide con el archivo fuente auditado
3. existe un bundle frontend viejo en ejecución
4. se está usando una ruta legacy o simulada fuera del flujo oficial esperado

---

## 8. Si la UI ignora parte del resultado real

### Respuesta

**Sí.**

### Evidencia

La UI actual:

- usa `prediction.prediction_label`
- usa `prediction.health_state`
- usa `prediction.recommended_action`

Pero ignora para presentación principal:

- `trace.raw_diagnosis`
- `trace.raw_class_index`
- la distribución completa de probabilidades del modelo
- cualquier taxonomía más fina que no haya sido resuelta

### Conclusión

La UI no inventa la predicción oficial, pero **oculta el hecho crítico** de que el modelo realmente solo está entregando `class_0` / `class_1`.

---

## 9. Si `semantic_prediction_resolver.py` altera el resultado

### Respuesta

**Sí.**

### Tipo de alteración

No fabrica “Tizón Temprano”, pero sí:

- convierte `class_0` en `Plant Disease Detected`
- convierte `class_1` en `Plant Healthy`
- elimina la visibilidad directa del espacio real de clases del modelo

### Conclusión

El resolver **altera y coarseniza** la salida del modelo.

No es la fuente de “Alternaria solani” en el flujo oficial actual, pero sí es responsable de desacoplar la UI de la salida cruda del modelo.

---

## 10. Si el modelo devuelve siempre la misma clase

## 10.1 Evidencia empírica auditada

Se probaron tres entradas auditadas:

1. `src/ai_models/test_leaf.jpg`
2. imagen sintética roja sólida
3. imagen sintética ajedrezada no vegetal

Resultados observados en `/infer`:

- `test_leaf.jpg` -> `class_0` con `0.9953`
- `solid_red.jpg` -> `class_0` con `0.9954`
- `checker.jpg` -> `class_0` con `0.9876`

Además, la inspección directa de logits/probabilidades mostró:

- `test_leaf.jpg` -> `[0.9953, 0.0047]`
- `solid_red.jpg` -> `[0.9954, 0.0046]`
- `checker.jpg` -> `[0.9876, 0.0124]`

## 10.2 Conclusión

Con la evidencia auditada:

- el modelo **muestra un colapso muy fuerte hacia `class_0`**
- no se observó `class_1` en ninguna de las entradas probadas
- el comportamiento sobre entradas no vegetales confirma que el problema no está restringido a hojas reales

No se puede afirmar matemáticamente “siempre” para todo input posible, pero sí:

- **la hipótesis de colapso del modelo hacia una sola clase queda fuertemente respaldada**

---

## 11. Resultado real del modelo

## 11.1 Resultado real del microservicio

El resultado real del modelo es binario:

- `class_0`
- `class_1`

En las pruebas auditadas, el resultado real observado fue:

- `class_0`

## 11.2 Resultado real del backend oficial

El backend oficial transforma `class_0` en:

- `prediction_label = "Plant Disease Detected"`
- `prediction_code = "plant_condition.generic.diseased"`

### Conclusión

El resultado real del sistema oficial auditado no es:

- `Tizón Temprano`

Es:

- `class_0` a nivel modelo
- `Plant Disease Detected` a nivel contrato oficial

---

## 12. Resultado final mostrado al usuario

## 12.1 Según el código fuente auditado

Con el flujo oficial actual, el usuario debería ver algo equivalente a:

- `Plant Disease Detected`
- estado `warning`
- especie `unknown`

## 12.2 Según el comportamiento observado reportado

El usuario está viendo:

- `TIZÓN TEMPRANO (ALTERNARIA SOLANI)`

### Conclusión

Hay una discrepancia real entre:

- el código fuente auditado
- y el runtime visual observado

---

## 13. Diferencias encontradas

### Diferencia 1. El modelo es binario, no taxonómico

El `.h5` auditado tiene 2 salidas:

- `enferma`
- `sana`

No tiene clases explícitas auditadas de:

- `Tomato_Early_blight`
- `Tomato_Late_blight`
- `Potato_Early_blight`

### Diferencia 2. El microservicio no devuelve enfermedad específica

Devuelve:

- `class_0` / `class_1`

### Diferencia 3. El resolver no devuelve “Alternaria”

Devuelve:

- `Plant Disease Detected`

### Diferencia 4. El frontend fuente oficial no debería pintar “Tizón Temprano” en upload normal

Eso solo aparece en:

- `PLANT_DISEASE_DB`
- `processDiagnosis()`
- `robotMode`
- fallbacks legacy

### Diferencia 5. El runtime observado parece no coincidir con el flujo oficial fuente actual

La observación del usuario y el código auditado no encajan exactamente.

---

## 14. Causa raíz más probable

### Causa raíz más probable

La causa raíz más probable es:

1. **el modelo cargado no es un clasificador multiclase fitosanitario específico, sino un clasificador binario `enferma/sana`**
2. **ese modelo está colapsando de facto hacia `class_0`**
3. **la capa semántica actual no puede recuperar taxonomía específica desde esa salida binaria**
4. **el diagnóstico visual específico “Tizón Temprano” proviene de caminos hardcodeados legacy o de una UI/runtime no alineada con el flujo fuente actual**

---

## 15. Componente responsable

## Responsable primario

- `plant_disease_mbv2.h5`

Motivo:

- su espacio real de salida es binario
- su comportamiento auditado está colapsado a `class_0`

## Responsable secundario

- `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py`

Motivo:

- traduce `class_0` a una categoría genérica y pierde granularidad científica

## Responsable terciario probable del diagnóstico visual observado

- `src/frontend/src/pages/AIPredictiva.jsx`

Motivo:

- contiene catálogos hardcodeados y caminos legacy/simulados que sí pueden producir textos como “Tizón Temprano”
- aunque el flujo de upload fuente actual no debería usar ese camino

---

## 16. Nivel de severidad

### Severidad

**Critical**

### Justificación

1. compromete la validez diagnóstica del sistema
2. mezcla salida binaria con taxonomía agrícola específica
3. permite mostrar al usuario un diagnóstico potencialmente no sustentado por el modelo real
4. afecta la validez científica y la trazabilidad del resultado

---

## 17. Qué archivo debe corregirse

## Corrección mínima

El archivo prioritario a corregir sería:

- `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py`

porque hoy convierte una salida binaria en una narrativa semántica insuficientemente trazable.

## Corrección estructural principal

El punto estructural real no es un solo archivo, sino:

- `src/ai_models/production_models/plant_disease_mbv2.h5`

porque la raíz científica del problema está en el espacio de salida y el comportamiento del modelo.

## Corrección de coherencia visual

También debe revisarse:

- `src/frontend/src/pages/AIPredictiva.jsx`

para eliminar ambigüedad entre:

- flujo oficial
- flujo legado
- modo robot
- catálogo local hardcodeado

---

## 18. Impacto sobre validez científica

El impacto es **grave**.

### Motivos

1. un modelo binario no justifica un diagnóstico fitopatológico específico
2. presentar “Alternaria solani” sin que el modelo real la prediga rompe trazabilidad científica
3. la capa semántica actual no distingue entre:
   - clasificación binaria
   - taxonomía de enfermedad específica
4. el sistema puede inducir decisiones agronómicas específicas a partir de una señal no específica

### Conclusión

El estado actual compromete la validez científica del diagnóstico presentado al usuario final.

---

## 19. Plan mínimo de corrección

Sin entrar a implementar, el plan mínimo sería:

1. hacer visible en backend y frontend la salida real del modelo:
   - `class_index`
   - `raw_diagnosis`
2. impedir que una salida binaria se presente como patología específica
3. revisar `semantic_prediction_resolver.py` para que `class_0` y `class_1` no simulen taxonomía que el modelo no sostiene
4. revisar `AIPredictiva.jsx` para eliminar o aislar del flujo oficial:
   - `processDiagnosis()`
   - `PLANT_DISEASE_DB` en el camino de upload real
   - cualquier ambigüedad entre modo robot y modo oficial

---

## 20. Plan ideal de corrección

Sin implementar todavía, el plan ideal sería:

1. definir contrato explícito entre espacio de clases del modelo y contrato semántico oficial
2. alinear `model_metadata.json`, `.h5`, resolver semántico y UI a una única taxonomía verificable
3. si el modelo seguirá siendo binario:
   - publicar solo `enferma/sana`
   - no publicar enfermedades específicas
4. si se requiere diagnóstico específico:
   - usar un modelo cuya salida real corresponda a esas enfermedades
5. separar completamente:
   - simulación/robot mode
   - fallback legacy
   - inferencia oficial real
6. garantizar que la UI siempre muestre:
   - salida semántica oficial
   - trazabilidad del resultado crudo

---

## 21. Diagnóstico final

Diagnóstico final consolidado:

- el modelo real auditado es binario y produce `class_0` / `class_1`
- en las pruebas auditadas colapsa consistentemente a `class_0`
- el backend oficial actual transforma eso en `Plant Disease Detected`
- el texto específico “Tizón Temprano (Alternaria solani)” no está respaldado por la salida real auditada del modelo ni por el flujo oficial actual del resolver
- si ese texto aparece en runtime, la fuente más probable es:
  - fallback hardcodeado
  - camino legacy/simulado del frontend
  - o desalineación entre el frontend servido y el código fuente auditado

### Respuesta corta a la pregunta central

La predicción real se distorsiona primero en el **modelo**, que colapsa a una salida binaria insuficiente, y luego se **desacopla visualmente** cuando capas de frontend/fallback permiten presentar diagnósticos específicos que el modelo real auditado no sostiene.
