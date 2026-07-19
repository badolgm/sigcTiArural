# AI SCIENTIFIC CORRECTION DESIGN

## Fecha

2026-07-16

## Objetivo

Diseñar la corrección completa de la cadena:

`plant_disease_mbv2.h5`
`↓`
`semantic_prediction_resolver.py`
`↓`
`AIPredictiva.jsx`

para eliminar diagnósticos no respaldados por la salida real del modelo, restaurar trazabilidad científica y separar con claridad:

- inferencia real
- simulación
- robot mode

Este documento no implementa cambios. Solo define el rediseño correcto.

---

## 1. Principio rector

La regla científica obligatoria debe ser esta:

> **Ninguna capa del sistema puede mostrar una enfermedad específica si el modelo real no la produce explícitamente como salida verificable.**

Aplicado al estado actual:

- el modelo real auditado solo soporta dos clases:
  - `class_0`
  - `class_1`
- por tanto, ninguna capa debe mostrar:
  - `Tizón Temprano`
  - `Tizón Tardío`
  - `Alternaria solani`
  - `Phytophthora infestans`
  - u otra patología específica

salvo que exista un modelo o una taxonomía upstream que las produzca realmente.

---

## 2. Cómo debe mostrarse `class_0`

## 2.1 Significado correcto

`class_0` debe interpretarse estrictamente como:

- **muestra compatible con condición no saludable**
- o, si se quiere ser más explícito:
- **indicador binario de condición enferma**

## 2.2 Cómo debe mostrarse al usuario

El usuario no debe ver:

- `Tizón Temprano`
- `Alternaria solani`
- `Patología identificada`

El usuario debe ver un mensaje de este tipo:

### Título principal

- `Condición no saludable detectada`

### Subtítulo

- `Clasificación binaria del modelo: enferma`

### Estado visual

- `warning`

### Recomendación

- `El modelo actual solo determina condición binaria enferma/sana. Se recomienda validación agronómica manual antes de emitir diagnóstico específico.`

## 2.3 Qué no debe inferirse

De `class_0` no debe inferirse:

- especie exacta
- enfermedad exacta
- agente causal exacto
- protocolo específico para un patógeno concreto

---

## 3. Cómo debe mostrarse `class_1`

## 3.1 Significado correcto

`class_1` debe interpretarse estrictamente como:

- **muestra compatible con condición saludable**

## 3.2 Cómo debe mostrarse al usuario

El usuario no debe ver:

- `Tomato Healthy`
- `Tomate saludable`

si la especie real no es verificable.

Debe ver:

### Título principal

- `Condición saludable detectada`

### Subtítulo

- `Clasificación binaria del modelo: sana`

### Estado visual

- `healthy`

### Recomendación

- `Mantener monitoreo preventivo. La clasificación actual es binaria y no identifica especie ni taxonomía específica.`

## 3.3 Qué no debe inferirse

De `class_1` no debe inferirse:

- que la planta es tomate
- que la muestra pertenece a un cultivo específico
- ausencia total de riesgo fitosanitario
- validación taxonómica completa

---

## 4. Qué textos deben eliminarse

Los siguientes textos deben eliminarse del flujo oficial de inferencia real porque no están respaldados por la salida binaria auditada:

1. `Tizón Temprano (Alternaria solani)`
2. `Tizón Tardío (Phytophthora infestans)`
3. `Tomato Early Blight`
4. `Tomato Late Blight`
5. `Tomato Healthy`
6. `Potato Early Blight`
7. recomendaciones específicas de fungicidas o protocolos para patógenos concretos
8. cualquier frase que implique:
   - identificación de especie
   - identificación de patógeno
   - severidad patológica específica

### Regla de limpieza

Todo texto específico de enfermedad debe quedar:

- fuera del flujo de inferencia real
- reservado solo para simulación o demo etiquetada explícitamente como simulación

---

## 5. Qué partes de `AIPredictiva.jsx` son legacy

Las piezas legacy del archivo son estas:

## 5.1 `PLANT_DISEASE_DB`

Motivo:

- contiene taxonomía específica que no proviene del modelo real actual
- mezcla base experta con flujo oficial de inferencia

## 5.2 `processDiagnosis()`

Motivo:

- es una capa de interpretación local no alineada con el contrato oficial actual
- puede producir resultados visuales desconectados del backend oficial

## 5.3 `robotMode` actual

Motivo:

- usa escenarios simulados con códigos explícitos:
  - `Tomato_Late_blight`
  - `Tomato_Healthy`
  - `Tomato_Early_blight`
- eso es una demo, no inferencia real

## 5.4 `speakResult()` en su redacción actual

Motivo:

- usa expresiones como:
  - `Patología identificada`
  - `Alerta fitosanitaria`
- que suponen mayor especificidad que la realmente soportada por el modelo binario

## 5.5 Mezcla de modos en un solo componente

Motivo:

- el componente combina:
  - flujo real de upload
  - fallback legacy
  - simulación
  - robot mode

sin separación visual ni semántica suficiente.

---

## 6. Cómo separar inferencia real, simulación y robot mode

La separación correcta debe ser explícita y visible.

## 6.1 Inferencia real

Debe ser un modo separado llamado, por ejemplo:

- `Modo Inferencia Real`

Características:

- consume exclusivamente `POST /api/v3/ai/inference/`
- muestra solo salida oficial del backend
- no usa `PLANT_DISEASE_DB`
- no usa códigos demo
- no usa nombres de enfermedades específicas si el modelo no las produce

## 6.2 Simulación

Debe ser un modo separado llamado:

- `Modo Simulación`

Características:

- no consume inferencia real
- usa escenarios demo explícitos
- puede mostrar taxonomía específica si se etiqueta como escenario sintético
- debe quedar marcado visualmente con un badge:
  - `SIMULACIÓN`

## 6.3 Robot mode

Debe ser un modo separado llamado:

- `Modo Robot Demo`

Características:

- no debe presentarse como inferencia científica real
- puede reutilizar escenarios predefinidos
- debe indicar:
  - `flujo automatizado de demostración`
  - `sin valor diagnóstico oficial`

## 6.4 Regla UI obligatoria

El usuario debe poder distinguir de inmediato:

1. `REAL`
2. `SIMULACIÓN`
3. `ROBOT DEMO`

sin ambigüedad ni reutilización de textos entre modos.

---

## 7. Cómo recuperar trazabilidad científica

La trazabilidad debe reconstruirse de extremo a extremo.

## 7.1 Trazabilidad mínima obligatoria

El resultado visible debe incluir siempre:

1. `source_mode`
2. `raw_diagnosis`
3. `raw_class_index`
4. `confidence`
5. `model_id`
6. `model_version`
7. `semantic_contract_version`

## 7.2 Jerarquía de verdad

La UI debe reflejar esta jerarquía:

1. salida cruda del modelo
2. interpretación semántica controlada
3. texto de usuario final

No al revés.

## 7.3 Regla de transformación

Toda transformación semántica debe poder responder:

- qué recibió
- qué produjo
- por qué lo produjo

## 7.4 Regla científica

Si el modelo no respalda taxonomía específica, la capa semántica debe conservar esa incertidumbre en lugar de ocultarla.

---

## 8. Cómo rediseñar `semantic_prediction_resolver.py`

El resolver debe dejar de actuar como “inventor de taxonomía” y pasar a ser un **normalizador trazable**.

## 8.1 Responsabilidad correcta del resolver

Debe:

- normalizar el contrato
- conservar trazabilidad
- traducir el espacio de clases real a un lenguaje de producto compatible con el modelo

No debe:

- inventar enfermedades específicas
- deducir especie si el modelo no la entrega
- ocultar que la clasificación es binaria

## 8.2 Diseño propuesto

El resolver debe trabajar con un mapa explícito del espacio real del modelo:

```text
class_0 -> unhealthy_binary
class_1 -> healthy_binary
```

## 8.3 Estructura semántica propuesta para `class_0`

Debe emitir algo conceptualmente equivalente a:

```json
{
  "prediction_code": "plant_condition.binary.unhealthy",
  "prediction_label": "Condición no saludable detectada",
  "plant_species": "unknown",
  "condition_name": "unhealthy",
  "condition_group": "binary_condition",
  "health_state": "warning",
  "severity": "undetermined",
  "recommended_action": "Validar manualmente la muestra. El modelo actual no identifica enfermedad específica."
}
```

## 8.4 Estructura semántica propuesta para `class_1`

Debe emitir algo conceptualmente equivalente a:

```json
{
  "prediction_code": "plant_condition.binary.healthy",
  "prediction_label": "Condición saludable detectada",
  "plant_species": "unknown",
  "condition_name": "healthy",
  "condition_group": "binary_condition",
  "health_state": "healthy",
  "severity": "none",
  "recommended_action": "Mantener observación preventiva. El modelo actual no identifica especie ni diagnóstico específico."
}
```

## 8.5 Campo adicional recomendado

El resolver debe añadir un campo explícito como:

- `scientific_scope`

con valores como:

- `binary_only`
- `taxonomic`

En el estado actual, debe ser:

- `binary_only`

## 8.6 Comportamiento ante clases no soportadas

Si aparece una clase fuera del espacio conocido:

- debe marcar `unknown`
- no debe hacer downgrade a enfermedad concreta

---

## 9. Cómo debe verse el resultado final al usuario

La vista final debe dejar de parecer un sistema taxonómico específico y pasar a parecer un sistema científicamente honesto.

## 9.1 Para `class_0`

### Cabecera

- `Condición no saludable detectada`

### Subcabecera

- `Clasificación binaria del modelo`

### Estado

- `Advertencia`

### Bloque de explicación

- `El modelo actual clasifica la muestra como no saludable, pero no identifica la enfermedad específica ni la especie del cultivo.`

### Bloque técnico visible

- `Clase cruda: class_0`
- `Confianza: XX%`
- `Modelo: plant_disease_mbv2`
- `Alcance científico: clasificación binaria`

## 9.2 Para `class_1`

### Cabecera

- `Condición saludable detectada`

### Subcabecera

- `Clasificación binaria del modelo`

### Estado

- `Saludable`

### Bloque de explicación

- `El modelo actual clasifica la muestra como saludable, pero no identifica especie ni taxonomía específica.`

### Bloque técnico visible

- `Clase cruda: class_1`
- `Confianza: XX%`
- `Modelo: plant_disease_mbv2`
- `Alcance científico: clasificación binaria`

## 9.3 Para modos no reales

Simulación y robot mode deben verse claramente distintos:

- badge `SIMULACIÓN`
- badge `ROBOT DEMO`
- texto visible:
  - `Este resultado no corresponde a inferencia científica oficial`

---

## 10. Rediseño visual recomendado para `AIPredictiva`

El componente debe dividir conceptualmente la pantalla en cuatro zonas:

## 10.1 Zona de modo activo

Debe mostrar:

- `REAL`
- `SIMULACIÓN`
- `ROBOT DEMO`

## 10.2 Zona de resultado semántico oficial

Debe mostrar solo el contrato oficial del backend.

## 10.3 Zona de trazabilidad técnica

Debe mostrar:

- clase cruda
- confianza
- modelo
- source mode
- alcance científico

## 10.4 Zona de advertencia metodológica

Debe mostrar una nota fija cuando el modelo sea binario:

- `El sistema actual no identifica enfermedades específicas; solo clasifica condición binaria saludable/no saludable.`

---

## 11. Qué debe desaparecer del flujo oficial

Deben salir completamente del flujo oficial de upload real:

1. `PLANT_DISEASE_DB`
2. `processDiagnosis()`
3. textos con patógenos específicos
4. recomendaciones agronómicas específicas de enfermedad
5. cualquier referencia a:
   - tomate
   - papa
   - alternaria
   - late blight

si no vienen de una fuente científica real del modelo.

---

## 12. Plan de rediseño por capas

## 12.1 Capa modelo

No cambiar en esta fase de diseño.

Condición que se asume:

- el modelo actual sigue siendo binario

## 12.2 Capa semántica

Redefinir el resolver para alinearlo al espacio real del modelo.

## 12.3 Capa frontend

Separar claramente:

- flujo real
- simulación
- demo robot

## 12.4 Capa de contrato

Hacer explícito en el contrato que el alcance actual es binario.

---

## 13. Diseño de corrección mínimo

El diseño mínimo correcto sería:

1. `class_0` -> `Condición no saludable detectada`
2. `class_1` -> `Condición saludable detectada`
3. eliminar taxonomía específica del flujo real
4. exponer trazabilidad técnica en UI
5. marcar demo/simulación de forma visible

---

## 14. Diseño de corrección ideal

El diseño ideal sería:

1. mantener el modelo binario claramente etiquetado como binario
2. rediseñar el resolver como capa de normalización trazable
3. rediseñar `AIPredictiva` en tres modos separados
4. introducir visualmente alcance científico y nivel de certeza
5. impedir por contrato que una capa inferior o superior invente taxonomía
6. preparar una futura evolución a modelo multiclase sin contaminar el flujo actual

---

## 15. Conclusión final

La corrección científica correcta no consiste en “mejorar el texto” sino en **alinear estrictamente el lenguaje del sistema con el alcance real del modelo**.

Por tanto:

- `class_0` debe mostrarse como condición binaria no saludable
- `class_1` debe mostrarse como condición binaria saludable
- toda enfermedad específica debe salir del flujo oficial actual
- `semantic_prediction_resolver.py` debe rediseñarse como traductor trazable, no como taxonomizador especulativo
- `AIPredictiva.jsx` debe separar claramente inferencia real, simulación y robot mode

Diagnóstico de diseño final:

- la salida real del modelo debe mandar
- la semántica debe obedecerla
- la UI debe explicarla sin exagerarla
