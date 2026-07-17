# API DELIVERY PACKAGE

## 1. Propósito

Consolidar el paquete final de APIs entregables de SIGC&T Rural para revisión técnica, entrega académica ADSO y sustentación, usando el estado real del código como fuente.

## 2. Alcance del paquete

Este documento cubre dos superficies API:

1. **API backend Django/DRF**
2. **Microservicio de IA en FastAPI**

No se incluyen aquí contratos no implementados o endpoints solo aspiracionales.

## 3. Base operativa del paquete

### Backend Django

- Código fuente: `src/backend/api/urls.py`
- Implementación principal: `src/backend/api/views.py`
- Prefijo operativo usado en scripts y documentación: `/api/`

### AI Service

- Código fuente: `src/ai_models/fastapi_app.py`
- Base URL local por defecto: `http://localhost:8081`

## 4. Endpoints del backend entregados

### 4.1 Endpoints legacy/compatibilidad

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/telemetry/history/` | Historial legacy de telemetría |
| `GET/POST/PUT/DELETE` | `/api/robots/` | CRUD de robots |
| `GET/POST/PUT/DELETE` | `/api/robot-telemetry/` | CRUD de telemetría de robots |
| `GET/POST/PUT/DELETE` | `/api/robot-commands/` | CRUD de comandos de robots |

### 4.2 Endpoints V2

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v2/telemetry/history/` | Historial de telemetría V2 por laboratorio |
| `GET` | `/api/v2/ai/crop-advice/` | Sugerencias agrícolas a partir del último reading |

### 4.3 Endpoints V3

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v3/telemetry/history/` | Historial de telemetría V3 con envelope |
| `GET` | `/api/v3/ai/crop-advice/` | Advice V3 desde capa hexagonal |
| `POST` | `/api/v3/ai/inference/` | Inferencia oficial del AI Context con contrato EIARC simplificado |

## 5. Contratos backend entregados

### 5.1 Telemetría V1

**Ruta:** `GET /api/telemetry/history/`

**Respuesta tipo:**

```json
[
  {
    "time": "14:30",
    "temp": 24.2,
    "humidity": 65.1,
    "sensor": "S1"
  }
]
```

**Comportamiento**

- si hay lecturas en `SensorReading`, devuelve hasta 24
- si no hay lecturas, genera datos simulados

### 5.2 Telemetría V2

**Ruta:** `GET /api/v2/telemetry/history/?tipo=ROBOTICA`

**Respuesta tipo:**

```json
[
  {
    "time": "14:30",
    "temp": 24.2,
    "humidity": 65.1,
    "sensor": "S1 (ROBOTICA V2)"
  }
]
```

**Parámetro**

- `tipo`: `ROBOTICA`, `TELECOMUNICACIONES`, `AGRICULTURA`, `ELECTRONICA`

### 5.3 Telemetría V3

**Ruta:** `GET /api/v3/telemetry/history/?tipo=ROBOTICA`

**Respuesta tipo:**

```json
{
  "context": "telemetry",
  "contract_version": "v1",
  "source_mode": "live",
  "lab_type": "ROBOTICA",
  "count": 24,
  "items": [
    {
      "reading_id": 1,
      "sensor_id": "S1",
      "timestamp": "2026-07-16T10:15:00-05:00",
      "temperature": 24.2,
      "humidity": 65.1
    }
  ]
}
```

**Comportamiento**

- `source_mode = live` si la lectura viene del repositorio real
- `source_mode = simulated` si proviene de simulación del dominio
- `timestamp` normalizado a ISO-8601

### 5.4 AI Crop Advice V2

**Ruta:** `GET /api/v2/ai/crop-advice/`

**Respuesta tipo:**

```json
{
  "datos_analizados": {
    "temperature": 24.2,
    "humidity": 65.1,
    "sensor_id": "S1"
  },
  "ia_feedback": {
    "message": "..."
  }
}
```

### 5.5 AI Crop Advice V3

**Ruta:** `GET /api/v3/ai/crop-advice/`

**Respuesta tipo:**

```json
{
  "datos_analizados": {
    "temperature": 24.2,
    "humidity": 65.1,
    "sensor_id": "S1"
  },
  "ia_feedback": {
    "message": "..."
  }
}
```

### 5.6 AI Inference V3

**Ruta:** `POST /api/v3/ai/inference/`

**Entrada**

- `multipart/form-data`
- campo obligatorio: `file`

**Tipos permitidos**

- `image/jpeg`
- `image/png`
- `image/webp`

**Respuesta exitosa tipo:**

```json
{
  "context": "ai",
  "contract_version": "v1",
  "operation": "plant_diagnosis",
  "source_mode": "live",
  "prediction": {
    "prediction_code": "plant_disease_detected",
    "prediction_label": "Diagnóstico vegetal",
    "health_state": "affected"
  },
  "trace": {
    "provider": "fastapi_ai_service",
    "raw_diagnosis": "class_0",
    "raw_class_index": 0,
    "processing_time": "0.54s",
    "upstream_status": "ok"
  }
}
```

**Errores estructurados**

Si falta el archivo:

```json
{
  "context": "ai",
  "contract_version": "v1",
  "operation": "plant_diagnosis",
  "source_mode": "fallback",
  "error": {
    "code": "invalid_request",
    "message": "No fue posible completar la inferencia oficial.",
    "detail": "El campo 'file' es obligatorio."
  }
}
```

Si el upstream falla:

```json
{
  "context": "ai",
  "contract_version": "v1",
  "operation": "plant_diagnosis",
  "source_mode": "fallback",
  "error": {
    "code": "ai_inference_unavailable",
    "message": "No fue posible completar la inferencia oficial.",
    "detail": "..."
  }
}
```

## 6. Endpoints del microservicio IA entregados

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del microservicio y del modelo cargado |
| `POST` | `/infer` | Inferencia de imagen con modelo `.h5/.keras` |
| `POST` | `/assist` | Asistente de voz/contexto |

## 7. Contratos del AI Service entregados

### 7.1 Health

**Ruta:** `GET /health`

**Respuesta tipo:**

```json
{
  "status": "ok",
  "tensorflow": true,
  "voice": true,
  "model_loaded": "plant_disease_mbv2.h5"
}
```

### 7.2 Infer

**Ruta:** `POST /infer`

**Entrada**

- `multipart/form-data`
- campo: `file`

**Respuesta tipo con modelo real:**

```json
{
  "diagnosis": "class_0",
  "confidence": 0.9953,
  "class_index": 0,
  "model": "plant_disease_mbv2.h5",
  "processing_time": "6.17s",
  "status": "ok"
}
```

**Respuesta degradada o fallback:**

```json
{
  "diagnosis": "Tomato_Early_blight",
  "confidence": 0.5,
  "class_index": 0,
  "model": "fallback",
  "processing_time": "0.44s",
  "status": "error"
}
```

## 8. Paquete de validación funcional

### Validación backend

```bash
curl http://localhost:8010/api/telemetry/history/
curl http://localhost:8010/api/v2/telemetry/history/
curl http://localhost:8010/api/v3/telemetry/history/
curl http://localhost:8010/api/v2/ai/crop-advice/
```

### Validación AI Service

```bash
curl http://localhost:8081/health
curl -F "file=@src/ai_models/test_leaf.jpg" http://localhost:8081/infer
```

### Validación desde scripts existentes

- `test_endpoints.py`
- `src/backend/test_endpoints.py`
- `scripts/verify_refactor.ps1`

## 9. Observaciones de entrega

1. Este paquete documenta únicamente APIs verificables en código.
2. No se incluyen endpoints JWT u OpenAPI no materializados en el estado real del backend.
3. El contrato formal OpenAPI V3 sigue pendiente como deuda documental ya registrada en `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md`.

## 10. Fuentes utilizadas

- `src/backend/api/urls.py`
- `src/backend/api/views.py`
- `src/ai_models/fastapi_app.py`
- `docs/API_REFERENCE.md`
- `docs/MASTERDOC.md`
- `docs/PLAN_MAESTRO.md`
- `MASTER_PROJECT_INVENTORY_AUDIT.md`
- `SENA_GRADUATION_READINESS_AUDIT.md`

## 11. Declaración final

SIGC&T Rural queda entregado con un paquete API realista y verificable que cubre telemetría, advice agrícola, inferencia de IA, salud del microservicio y endpoints de compatibilidad necesarios para frontend, validación operativa y sustentación académica.
