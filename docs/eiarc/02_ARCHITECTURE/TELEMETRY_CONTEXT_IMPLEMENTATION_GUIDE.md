# Telemetry Context Implementation Guide

## Fecha

2026-07-12

## Versión

v1.0.0

## Objetivo

Preparar la primera intervención real de código para `Telemetry Context` sin modificar todavía el código, definiendo exactamente qué archivos tocar, qué líneas modificar, qué dependencias validar, qué pruebas ejecutar, qué rollback aplicar y cuál debe ser el primer Pull Request recomendado.

## Referencias

- [TELEMETRY_CONTEXT_REFACTOR_PLAN.md](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/eiarc/02_ARCHITECTURE/TELEMETRY_CONTEXT_REFACTOR_PLAN.md)
- [TELEMETRY_CONTEXT_TARGET_ARCHITECTURE.mmd](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/eiarc/03_DIAGRAMS/TELEMETRY_CONTEXT_TARGET_ARCHITECTURE.mmd)
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

## Resumen ejecutivo

La primera intervención real de código debe ser pequeña, vertical y reversible.

El alcance recomendado del PR1 es:

1. endurecer el contrato de `GET /api/v3/telemetry/history/`
2. hacer que `Dashboard.jsx` consuma ese endpoint oficial
3. convertir `TelemetryPanel.jsx` en consumidor presentacional del contrato oficial
4. no tocar todavía modelo, repositorio, mapper, entidad ni puerto

Eso deja un primer slice usable de extremo a extremo sin abrir todavía:

- IoT robótico
- telemetría 3D
- nuevos campos de dominio
- cambios de persistencia
- alias de routing sin versión

## 1. Archivos a modificar en PR1

## 1.1 Sí modificar en PR1

1. [src/backend/api/views.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py)
2. [src/frontend/src/components/TelemetryPanel.jsx](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx)
3. [src/frontend/src/pages/Dashboard.jsx](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx)

## 1.2 No modificar en PR1, solo validar

1. [src/backend/api/urls.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/urls.py)
2. [src/backend/api/models.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py)
3. [src/backend/api/serializers.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/serializers.py)
4. [src/backend/infrastructure/config/dependencies.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/config/dependencies.py)
5. [src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py)
6. [src/backend/infrastructure/persistence/django/mappers/sensor_reading_mapper.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/persistence/django/mappers/sensor_reading_mapper.py)
7. [src/backend/core/domain/entities/sensor_reading.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/domain/entities/sensor_reading.py)
8. [src/backend/core/ports/repositories/sensor_reading_repository.py](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/ports/repositories/sensor_reading_repository.py)

## 2. Cambios exactos archivo por archivo

## 2.1 `src/backend/api/views.py`

### Cambio

Refactorizar `TelemetryHistoryV3View.get()` para que deje de devolver una lista plana legacy y devuelva el envelope oficial del contexto.

### Líneas candidatas a modificar

- [views.py:L79-L107](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L79-L107)

### Subcambios exactos

1. Mantener:
   - lectura de `tipo_lab` [views.py:L83](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L83)
   - construcción de `LabService` [views.py:L85-L89](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L85-L89)
   - obtención del repositorio [views.py:L92](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L92)
   - lectura de `repository.get_all(limit=24)` [views.py:L93](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L93)

2. Reemplazar:
   - el bloque de armado de `data = []` [views.py:L95-L104](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L95-L104)
   - la devolución directa de simulación [views.py:L106-L107](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L106-L107)

3. El nuevo comportamiento debe devolver:
   - `context`
   - `contract_version`
   - `source_mode`
   - `lab_type`
   - `count`
   - `items`

4. Cada item debe contener:
   - `reading_id`
   - `sensor_id`
   - `timestamp`
   - `temperature`
   - `humidity`

### Qué no cambiar aquí

- V1 [views.py:L29-L62](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L29-L62)
- V2 [views.py:L141-L170](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L141-L170)
- endpoints IA V2/V3
- ViewSets de robótica

### Riesgo

- medio

### Motivo del riesgo

- puede romper consumidores que hoy esperan `[{ time, temp, humidity, sensor }]`

### Rollback si falla

1. restaurar el shape actual de respuesta de `TelemetryHistoryV3View`
2. mantener V3 apuntando al mismo repositorio
3. dejar `Dashboard.jsx` y `TelemetryPanel.jsx` sin consumir V3 nuevo hasta corregir contrato

## 2.2 `src/frontend/src/components/TelemetryPanel.jsx`

### Cambio

Transformar el componente desde simulación autónoma a componente presentacional que recibe datos oficiales del `Dashboard`.

### Líneas candidatas a modificar

- [TelemetryPanel.jsx:L1](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L1)
- [TelemetryPanel.jsx:L39-L61](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L39-L61)
- [TelemetryPanel.jsx:L75-L80](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L75-L80)

### Subcambios exactos

1. Reemplazar la firma del componente:
   - de `const TelemetryPanel = () => {` [TelemetryPanel.jsx:L39](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L39)
   - a un componente que reciba props equivalentes a:
     - `items`
     - `sourceMode`
     - `loading`
     - `error`

2. Eliminar:
   - `useState`/`useEffect` de simulación [TelemetryPanel.jsx:L1](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L1), [TelemetryPanel.jsx:L41-L61](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L41-L61)

3. Reemplazar los displays:
   - hoy: `temp`, `hum`, `soil`, `light`, `co2` [TelemetryPanel.jsx:L76-L80](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L76-L80)
   - PR1: mostrar solo datos del contrato oficial:
     - última temperatura
     - última humedad
     - `sensor_id`
     - fuente (`source_mode`)
     - timestamp o etiqueta temporal derivada

4. Manejar estados explícitos:
   - `loading`
   - `error`
   - lista vacía

### Qué no cambiar aquí

- `DigitalDisplay` [TelemetryPanel.jsx:L11-L37](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/components/TelemetryPanel.jsx#L11-L37)
- look & feel general del panel

### Riesgo

- medio-bajo

### Motivo del riesgo

- el riesgo es visual/UX, no estructural

### Rollback si falla

1. restaurar componente autónomo actual
2. dejar `Dashboard.jsx` sin pasar props nuevas
3. mantener panel como demo temporal mientras se corrige el consumo oficial

## 2.3 `src/frontend/src/pages/Dashboard.jsx`

### Cambio

Convertir `Dashboard.jsx` en orquestador del consumo del endpoint oficial V3 y en adaptador hacia `TelemetryPanel` y la serie gráfica existente.

### Líneas candidatas a modificar

- [Dashboard.jsx:L1](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L1)
- [Dashboard.jsx:L22-L30](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L22-L30)
- [Dashboard.jsx:L75-L77](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L75-L77)
- [Dashboard.jsx:L104-L105](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L104-L105)
- [Dashboard.jsx:L117-L123](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L117-L123)

### Subcambios exactos

1. En imports [Dashboard.jsx:L1-L5](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L1-L5):
   - ampliar `React` para usar `useEffect`, `useMemo` y `useState` si hace falta

2. En el estado del componente [Dashboard.jsx:L75-L77](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L75-L77):
   - agregar estado para:
     - envelope de telemetría
     - loading
     - error

3. Agregar efecto de carga:
   - fetch a `GET /api/v3/telemetry/history/`
   - consumo del envelope oficial
   - fallback controlado solo si el endpoint falla

4. Reemplazar el uso actual del panel:
   - de `<TelemetryPanel />` [Dashboard.jsx:L105](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L105)
   - a `<TelemetryPanel ...props />`

5. Adaptar la serie para `GlobalChart`:
   - mantener el componente `GlobalChart`
   - transformar `items[]` del contrato oficial a la forma gráfica esperada
   - usar `defaultChartData` [Dashboard.jsx:L22-L30](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L22-L30) solo como fallback de presentación

### Qué no cambiar aquí

- `initialNodes` [Dashboard.jsx:L15-L20](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/frontend/src/pages/Dashboard.jsx#L15-L20)
- tarjetas de integraciones futuras
- noticias y enlaces
- `LoginModal`

### Riesgo

- medio

### Motivo del riesgo

- es el punto donde backend nuevo y UI se encuentran; si falla, el panel y la gráfica pueden quedarse sin datos

### Rollback si falla

1. mantener `TelemetryPanel` en modo demo
2. dejar `GlobalChart` usando `defaultChartData`
3. retirar solo el fetch nuevo, no el resto de la página

## 2.4 `src/backend/api/urls.py`

### Cambio en PR1

- **sin cambios**

### Líneas a validar

- [urls.py:L19-L20](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/urls.py#L19-L20)
- [urls.py:L27-L32](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/urls.py#L27-L32)

### Qué validar

1. que `/v3/telemetry/history/` siga publicado
2. que V1 y V2 sigan vivos como compatibilidad

### Riesgo

- bajo

## 2.5 `src/backend/api/models.py`

### Cambio en PR1

- **sin cambios**

### Líneas a validar

- [models.py:L4-L14](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py#L4-L14)

### Qué validar

1. `SensorReading` sigue siendo suficiente para el slice 1
2. no intentar meter `soil`, `light`, `co2` en este PR

### Riesgo

- bajo

## 2.6 `src/backend/api/serializers.py`

### Cambio en PR1

- **sin cambios recomendados**

### Líneas a validar

- [serializers.py:L4-L7](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/serializers.py#L4-L7)

### Qué validar

1. que el PR1 siga usando respuesta manual en `APIView`
2. dejar serializers de envelope para PR posterior si hacen falta

### Riesgo

- bajo

## 2.7 `src/backend/infrastructure/config/dependencies.py`

### Cambio en PR1

- **sin cambios**

### Líneas a validar

- [dependencies.py:L13-L14](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/config/dependencies.py#L13-L14)

### Qué validar

1. `get_sensor_reading_repository()` sigue resolviendo correctamente

### Riesgo

- bajo

## 2.8 `src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py`

### Cambio en PR1

- **sin cambios**

### Líneas a validar

- [django_sensor_reading_repository.py:L19-L23](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py#L19-L23)

### Qué validar

1. `get_all(limit=24)` ya cubre la necesidad del slice

### Riesgo

- bajo

## 2.9 `src/backend/infrastructure/persistence/django/mappers/sensor_reading_mapper.py`

### Cambio en PR1

- **sin cambios**

### Líneas a validar

- [sensor_reading_mapper.py:L13-L22](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/infrastructure/persistence/django/mappers/sensor_reading_mapper.py#L13-L22)

### Qué validar

1. el dominio sigue exponiendo exactamente los cuatro datos del slice

### Riesgo

- bajo

## 2.10 `src/backend/core/domain/entities/sensor_reading.py`

### Cambio en PR1

- **sin cambios**

### Líneas a validar

- [sensor_reading.py:L15-L24](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/domain/entities/sensor_reading.py#L15-L24)

### Qué validar

1. la entidad ya encapsula el slice mínimo
2. no introducir nuevas invariantes en PR1

### Riesgo

- bajo

## 2.11 `src/backend/core/ports/repositories/sensor_reading_repository.py`

### Cambio en PR1

- **sin cambios**

### Líneas a validar

- [sensor_reading_repository.py:L12-L21](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/core/ports/repositories/sensor_reading_repository.py#L12-L21)

### Qué validar

1. el puerto actual es suficiente
2. no agregar query methods nuevos en PR1

### Riesgo

- bajo

## 3. Orden exacto de implementación

1. modificar `src/backend/api/views.py`
2. validar que `/api/v3/telemetry/history/` responde con el nuevo envelope
3. modificar `src/frontend/src/pages/Dashboard.jsx`
4. modificar `src/frontend/src/components/TelemetryPanel.jsx`
5. validar que `GlobalChart` sigue pintando datos sin tocarlo
6. smoke test manual de la página Dashboard
7. dejar `urls.py`, `models.py`, `serializers.py`, `dependencies.py`, `repository`, `mapper`, `entity`, `port` sin cambios en PR1

## 4. Dependencias que validar

## Backend

1. imports V3 en [views.py:L67-L76](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/views.py#L67-L76)
2. resolución de `LabService`
3. resolución de `get_sensor_reading_repository()`
4. existencia de lecturas `SensorReading` en DB o funcionamiento correcto del modo simulado
5. publicación de ruta V3 en [urls.py:L27-L32](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/urls.py#L27-L32)

## Frontend

1. que `Dashboard.jsx` pueda resolver `fetch` contra `/api/v3/telemetry/history/`
2. que `TelemetryPanel.jsx` reciba props coherentes
3. que `GlobalChart` siga aceptando la forma adaptada
4. que la build de Vite siga pasando

## 5. Pruebas a ejecutar

## Backend

1. prueba dirigida de pytest:

```bash
cd src/backend
pytest tests -k "persistence or adapters"
```

2. prueba completa de backend:

```bash
cd src/backend
pytest
```

3. smoke test HTTP manual del endpoint oficial:

```bash
GET /api/v3/telemetry/history/
```

Validar:

- status `200`
- presencia de `context`
- presencia de `contract_version`
- presencia de `source_mode`
- presencia de `items`
- items con `sensor_id`, `timestamp`, `temperature`, `humidity`

## Frontend

1. lint:

```bash
cd src/frontend
npm run lint
```

2. build:

```bash
cd src/frontend
npm run build
```

3. smoke test visual manual en Dashboard:

- panel muestra datos del contrato oficial
- no muestra `soil`, `light`, `co2`
- la gráfica sigue renderizando
- si no hay datos reales, se ve estado simulado explícito

## 6. Rollback recomendado si algo falla

## Rollback 1. Falla el contrato backend

Acción:

1. restaurar `TelemetryHistoryV3View` a la lista plana anterior
2. dejar V1/V2 intactos
3. no desplegar cambio frontend consumidor

## Rollback 2. Falla el consumo frontend

Acción:

1. restaurar `TelemetryPanel.jsx` a modo demo
2. restaurar `Dashboard.jsx` para usar `defaultChartData`
3. mantener backend V3 nuevo si ya quedó correcto y compatible

## Rollback 3. Falla la integración completa

Acción:

1. volver backend V3 al shape anterior
2. volver Dashboard y TelemetryPanel al estado previo
3. reabrir la intervención como dos PR separados:
   - backend contract
   - frontend consumer

## 7. Riesgo por cambio

| Archivo | Riesgo | Tipo de riesgo |
|---|---|---|
| `src/backend/api/views.py` | Medio | compatibilidad de contrato |
| `src/frontend/src/pages/Dashboard.jsx` | Medio | integración backend/UI |
| `src/frontend/src/components/TelemetryPanel.jsx` | Medio-Bajo | representación visual y estados |
| `src/backend/api/urls.py` | Bajo | solo validación |
| `src/backend/api/models.py` | Bajo | sin cambios |
| `src/backend/api/serializers.py` | Bajo | sin cambios |
| `dependencies.py` | Bajo | solo validación |
| `repository` / `mapper` / `entity` / `port` | Bajo | sin cambios |

## 8. Primer Pull Request recomendado

## Nombre recomendado

`feat(telemetry): promote v3 telemetry contract and wire dashboard consumer`

## Alcance recomendado del PR

### Incluye

- cambio de respuesta en `TelemetryHistoryV3View`
- consumo desde `Dashboard.jsx`
- conversión de `TelemetryPanel.jsx` a consumidor presentacional

### No incluye

- cambios de modelos
- cambios de repositorio
- cambios de routing
- alias `/api/telemetry/history/`
- nuevos campos de telemetría
- cambios en robótica o 3D

## Criterio de aceptación del PR

1. `GET /api/v3/telemetry/history/` responde con envelope oficial
2. `Dashboard.jsx` consume ese endpoint
3. `TelemetryPanel.jsx` deja de inventar telemetría local
4. el panel muestra solo datos reales del slice 1
5. la gráfica sigue funcionando
6. V1 y V2 permanecen disponibles

## Conclusión

La guía recomienda un PR1 pequeño y de extremo a extremo:

- backend: `views.py`
- frontend: `Dashboard.jsx` y `TelemetryPanel.jsx`

Todo lo demás debe quedar sin tocar en esta primera intervención. Esa es la mejor forma de convertir el plan de `Telemetry Context` en una primera entrega real, con riesgo controlado y rollback simple.
