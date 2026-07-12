# Telemetry Context Refactor Plan

## Fecha

2026-07-12

## Versión

v1.0.0

## Objetivo

Diseñar el primer Vertical Slice oficial de `Telemetry Context` para EIARC, usando únicamente el slice backend/frontend indicado, definiendo endpoint oficial, contrato oficial, estado actual, estado objetivo, estrategia V1 -> V2 -> V3, orden exacto de implementación, riesgos y criterios de conservación, eliminación y migración.

## Referencias

- [EIARC_IMPLEMENTATION_BLUEPRINT.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md)
- [EIARC_CONTEXTS.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md)
- [EIARC_CANONICAL_DATA_MODEL.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md)
- [KB-006-PENDING-CHANGES-AUDIT.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/project_knowledge_base/KB-006-PENDING-CHANGES-AUDIT.md)
- [views.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py)
- [urls.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/urls.py)
- [models.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py)
- [serializers.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/serializers.py)
- [dependencies.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/config/dependencies.py)
- [django_sensor_reading_repository.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py)
- [sensor_reading_mapper.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/persistence/django/mappers/sensor_reading_mapper.py)
- [sensor_reading.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/domain/entities/sensor_reading.py)
- [sensor_reading_repository.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/ports/repositories/sensor_reading_repository.py)
- [TelemetryPanel.jsx](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx)
- [Dashboard.jsx](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx)
- [cloud.js](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/services/cloud.js)
- [useRoboticsApi.js](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/hooks/useRoboticsApi.js)
- [Telemetry3DScene.jsx](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/Telemetry3DScene.jsx)

## Resumen ejecutivo

El primer Vertical Slice oficial de `Telemetry Context` debe construirse sobre el V3 ya existente, no desde V1 ni desde el frontend demo. La razón es sencilla:

- `views.py` ya contiene un endpoint hexagonal V3 para telemetría [views.py:L78-L107](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L78-L107)
- `urls.py` ya lo publica en `/v3/telemetry/history/` [urls.py:L27-L32](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/urls.py#L27-L32)
- el dominio mínimo ya existe en `SensorReading` con `sensor_id`, `temperature`, `humidity`, `timestamp` [sensor_reading.py:L8-L27](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/domain/entities/sensor_reading.py#L8-L27)
- el frontend actual está fragmentado entre simulación local, OpenMeteo y API robótica, así que no debe dictar el contrato

Decisión de arquitectura:

- **endpoint oficial inicial:** `GET /api/v3/telemetry/history/`
- **contrato oficial inicial:** histórico de lecturas de `SensorReading`
- **campos oficiales del slice 1:** `sensor_id`, `timestamp`, `temperature`, `humidity`

Todo lo demás que hoy aparece en `TelemetryPanel.jsx` (`soil`, `light`, `co2`) debe tratarse como demo/futuro, no como parte del contrato oficial del primer slice [TelemetryPanel.jsx:L41-L47](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L41-L47).

## 1. Endpoint oficial de telemetría

## 1.1 Endpoint oficial del primer slice

`GET /api/v3/telemetry/history/`

### Justificación

1. Ya existe y está conectado al repositorio hexagonal:
   - [views.py:L92-L104](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L92-L104)
   - [dependencies.py:L13-L14](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/config/dependencies.py#L13-L14)
   - [django_sensor_reading_repository.py:L19-L23](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py#L19-L23)

2. Ya representa la ruta de evolución V3 frente a V1 y V2:
   - V1: [views.py:L29-L62](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L29-L62)
   - V2: [views.py:L141-L170](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L141-L170)
   - V3: [views.py:L78-L107](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L78-L107)

3. Ya usa la entidad de dominio `SensorReading`, no el ORM directo:
   - [sensor_reading.py:L15-L19](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/domain/entities/sensor_reading.py#L15-L19)

## 1.2 Endpoint objetivo posterior

Cuando el refactor del slice esté estabilizado, el alias estable recomendado es:

`GET /api/telemetry/history/`

pero solo como consolidación posterior.  
Para iniciar FASE 5, el endpoint oficial debe seguir siendo el V3 existente para evitar un cambio simultáneo de arquitectura y routing.

## 2. Contrato oficial de telemetría

## 2.1 Estado actual del contrato

Hoy V1, V2 y V3 devuelven una lista plana con esta forma:

```json
[
  {
    "time": "14:30",
    "temp": 24.5,
    "humidity": 65.0,
    "sensor": "BBB-03"
  }
]
```

Evidencia:

- V1: [views.py:L36-L44](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L36-L44)
- V2: [views.py:L158-L167](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L158-L167)
- V3: [views.py:L95-L104](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L95-L104)

Ese contrato es útil para compatibilidad, pero es demasiado pobre como contrato oficial de contexto porque:

- no transporta `timestamp` completo
- no distingue `source_mode`
- no trae metadatos del contrato
- degrada `sensor_id` a una etiqueta decorada (`"{sensor_id} ({tipo_lab} V3)"`)

## 2.2 Contrato oficial objetivo del primer slice

El contrato oficial recomendado para el Vertical Slice 1 es:

```json
{
  "context": "telemetry",
  "contract_version": "v1",
  "source_mode": "live|simulated",
  "lab_type": "ROBOTICA",
  "count": 24,
  "items": [
    {
      "reading_id": 123,
      "sensor_id": "BBB-03",
      "timestamp": "2026-07-12T14:30:00Z",
      "temperature": 24.5,
      "humidity": 65.0
    }
  ]
}
```

## 2.3 Reglas del contrato oficial

1. `sensor_id` debe ser valor canónico, no etiqueta decorada
2. `timestamp` debe ser completo y serializable, no solo `HH:MM`
3. `temperature` y `humidity` son los únicos campos obligatorios del slice 1
4. `source_mode` debe indicar si la respuesta proviene de persistencia real o simulación
5. `lab_type` puede existir como contexto operativo, pero no debe contaminar `sensor_id`
6. `items` es la única colección oficial; la lista plana actual queda solo para compatibilidad temporal

## 2.4 Campos explícitamente fuera del contrato del slice 1

No pertenecen al contrato oficial inicial:

- `soil`
- `light`
- `co2`
- `battery_level`
- `position_x`, `position_y`, `position_z`

Razón:

- no pertenecen a `SensorReading` actual [models.py:L4-L14](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py#L4-L14)
- pertenecen a otras entidades o a simulación demo

## 3. Estado actual

## 3.1 Backend

### Lo bueno

- existe modelo persistido `SensorReading` [models.py:L4-L14](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py#L4-L14)
- existe entidad de dominio `SensorReading` [sensor_reading.py:L8-L27](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/domain/entities/sensor_reading.py#L8-L27)
- existe puerto de repositorio [sensor_reading_repository.py:L7-L21](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/ports/repositories/sensor_reading_repository.py#L7-L21)
- existe mapper [sensor_reading_mapper.py:L8-L38](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/persistence/django/mappers/sensor_reading_mapper.py#L8-L38)
- existe adaptador Django [django_sensor_reading_repository.py:L9-L30](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py#L9-L30)
- existe composition root básico [dependencies.py:L13-L14](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/config/dependencies.py#L13-L14)

### Lo problemático

- `views.py` mezcla V1, V2, V3 y robótica en un mismo archivo [views.py:L11-L199](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L11-L199)
- V3 sigue devolviendo el shape plano heredado [views.py:L95-L104](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L95-L104)
- cuando no hay datos, V1 y V3 devuelven simulación sin etiquetar explícitamente el modo [views.py:L46-L62](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L46-L62), [views.py:L106-L107](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L106-L107)

## 3.2 Frontend

### Lo bueno

- `Dashboard.jsx` ya separa panel de telemetría como componente propio [Dashboard.jsx:L104-L105](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L104-L105)
- existe un hook específico para telemetría robótica [useRoboticsApi.js:L5-L50](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/hooks/useRoboticsApi.js#L5-L50)
- existe una visualización 3D desacoplada por props [Telemetry3DScene.jsx:L29-L94](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/Telemetry3DScene.jsx#L29-L94)

### Lo problemático

- `TelemetryPanel.jsx` usa simulación local fija y no consume backend [TelemetryPanel.jsx:L39-L61](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L39-L61)
- `cloud.js` consume OpenMeteo y no el backend de telemetría [cloud.js:L36-L49](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/services/cloud.js#L36-L49)
- `useRoboticsApi.js` consume `/robot-telemetry/`, que pertenece a otro subdominio del contexto [useRoboticsApi.js:L13-L25](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/hooks/useRoboticsApi.js#L13-L25)
- no existe hoy un consumidor frontend explícito de `/api/v3/telemetry/history/`

## 4. Estado objetivo

El estado objetivo del primer Vertical Slice de `Telemetry Context` es este:

1. un único endpoint oficial de lectura histórica de telemetría
2. un único contrato oficial con `items` y metadatos
3. un único consumidor principal en frontend para Dashboard
4. simulación controlada solo como modo explícito, nunca como respuesta indistinguible
5. robótica y 3D consumen un contrato separado o especializado, no el contrato histórico general

## 5. Qué conservar

## Backend

- `SensorReading` como agregado mínimo actual
- la entidad de dominio `SensorReading`
- el puerto `SensorReadingRepositoryPort`
- el mapper `SensorReadingMapper`
- el adaptador `DjangoSensorReadingRepository`
- la composición `get_sensor_reading_repository()`
- la ruta V3 existente como base del slice

## Frontend

- `TelemetryPanel.jsx` como superficie visual
- `Dashboard.jsx` como orquestador de la página
- `Telemetry3DScene.jsx` como consumidor especializado de telemetría robótica
- `useRoboticsApi.js` como hook táctico separado del slice histórico

## 6. Qué eliminar

### Eliminar del camino oficial del slice

- V1 como endpoint de referencia arquitectónica
- V2 como endpoint de referencia arquitectónica
- simulación interna opaca en `TelemetryPanel.jsx`
- uso de OpenMeteo como fuente principal de “telemetría”
- decoración semántica de `sensor_id` con `({tipo_lab} V3)`

### Importante

“Eliminar” aquí significa **retirar del camino oficial**, no necesariamente borrar de inmediato del repositorio.

## 7. Qué migrar

1. migrar `TelemetryPanel.jsx` desde simulación local al endpoint oficial
2. migrar la serie principal del Dashboard desde `cloud.js` hacia telemetría del backend
3. migrar V3 desde lista plana hacia contrato con `items`
4. migrar V1 y V2 a estado `deprecated`
5. migrar el etiquetado de respuesta para diferenciar `live` y `simulated`

## 8. Orden exacto de implementación

## Etapa 1. Backend: fijar contrato oficial V3

1. declarar V3 como endpoint oficial del slice
2. encapsular la respuesta de V3 en un contrato con `context`, `contract_version`, `source_mode`, `lab_type`, `count`, `items`
3. dejar V1 y V2 sin cambio funcional, pero marcados como compatibilidad
4. evitar que `sensor_id` sea mutado o decorado en la respuesta oficial

## Etapa 2. Frontend: consumidor oficial de historia

5. introducir un consumidor de telemetría histórica en el frontend
6. hacer que `TelemetryPanel.jsx` consuma ese contrato oficial
7. hacer que `Dashboard.jsx` orqueste la carga oficial del panel y la serie histórica

## Etapa 3. Limpieza de fuentes rivales

8. retirar `cloud.js` del flujo principal de telemetría
9. mantener `useRoboticsApi.js` solo para visualización robótica especializada
10. declarar `Telemetry3DScene.jsx` fuera del contrato del slice histórico general

## Etapa 4. Retiro controlado de V1/V2

11. documentar V1 y V2 como `deprecated`
12. mover consumidores restantes a V3
13. dejar alias estable sin versión cuando el slice ya esté consolidado

## 9. Riesgos

## Riesgo 1. Romper consumidores actuales que esperan lista plana

Impacto:

- medio

Motivo:

- el frontend histórico y `GlobalChart` probablemente esperan listas planas de `{time,temp,humidity}`

Mitigación:

- mantener un período de compatibilidad
- introducir adaptación en frontend antes de retirar shape legado

## Riesgo 2. Mezclar telemetría histórica con telemetría robótica

Impacto:

- medio-alto

Motivo:

- `useRoboticsApi.js` y `Telemetry3DScene.jsx` consumen `RobotTelemetry`, no `SensorReading`

Mitigación:

- declarar dos read models distintos:
  - histórico ambiental
  - estado/posición robótica

## Riesgo 3. Tomar demo como verdad funcional

Impacto:

- alto

Motivo:

- `TelemetryPanel.jsx` hoy muestra `soil`, `light`, `co2` aunque esos campos no existen en backend [TelemetryPanel.jsx:L41-L47](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L41-L47)

Mitigación:

- reducir el primer slice a campos realmente persistidos

## Riesgo 4. Mantener simulación implícita sin trazabilidad

Impacto:

- alto

Motivo:

- hoy el cliente no puede distinguir con claridad si los datos son reales o simulados

Mitigación:

- `source_mode` obligatorio en el contrato oficial

## 10. Estrategia V1 -> V2 -> V3

## V1

Rol:

- legado directo con ORM y mock local

Acción:

- congelar
- no extender
- mantener solo por compatibilidad temporal

Evidencia:

- [views.py:L29-L62](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L29-L62)

## V2

Rol:

- transición refactorizada, pero aún acoplada al stack legacy `api.logic`

Acción:

- congelar
- no convertir en ruta oficial
- usar solo mientras migren consumidores

Evidencia:

- [views.py:L137-L170](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L137-L170)

## V3

Rol:

- única base válida para el Vertical Slice oficial

Acción:

- promover a oficial
- endurecer contrato
- conectar frontend

Evidencia:

- [views.py:L78-L107](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L78-L107)
- [urls.py:L27-L32](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/urls.py#L27-L32)

## 11. Decisión de diseño del Vertical Slice

El primer Vertical Slice oficial de `Telemetry Context` no debe intentar resolver todo “telemetry” del proyecto. Debe resolver solo esto:

- lecturas históricas de `SensorReading`
- exposición por endpoint V3
- consumo real en Dashboard/TelemetryPanel
- distinción clara entre dato real y simulado

No debe abarcar todavía:

- robótica 3D
- comandos de robots
- pH, radiación, CO2
- fuentes externas tipo OpenMeteo

## Conclusiones

1. El endpoint oficial inicial debe ser `GET /api/v3/telemetry/history/`.
2. El contrato oficial no debe seguir siendo una lista plana heredada; debe pasar a un envelope con `items` y metadatos.
3. El dominio oficial del primer slice debe limitarse a `SensorReading`.
4. `TelemetryPanel.jsx` y `cloud.js` son hoy los principales focos de desalineación funcional.
5. La estrategia correcta es promover V3, congelar V1/V2 y migrar primero el consumidor Dashboard antes de intentar expandir el dominio de telemetría.
