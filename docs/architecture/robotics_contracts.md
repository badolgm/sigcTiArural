# 🤖 Contratos de Interfaz Robótica (JSON Contracts)

Este documento define la estructura de datos (payloads) para la comunicación entre los robots físicos/simulados y el backend de SIGC&T Rural.

## 1. Telemetría del Robot (Robot -> Servidor)
Endpoint: `POST /api/robot/telemetry/`

El robot debe enviar periódicamente (ej: cada 1s o 5s) su estado actual.

```json
{
  "robot_id": "RBT-001",
  "battery_level": 87.5,        // Porcentaje (0-100)
  "status": "idle",             // Enum: 'idle', 'moving', 'working', 'charging', 'error'
  "position": {
    "x": 12.5,
    "y": 5.0,
    "z": 0.0,
    "yaw": 1.57                 // Orientación en radianes
  },
  "velocity": {
    "linear": 0.5,              // m/s
    "angular": 0.1              // rad/s
  },
  "timestamp": "2026-01-23T10:30:00Z"
}
```

## 2. Comandos de Control (Servidor -> Robot)
Endpoint: `GET /api/robot/{robot_id}/commands/pending/`

El robot consulta comandos pendientes o los recibe vía WebSocket/MQTT.

```json
{
  "command_id": "cmd_987654",
  "type": "NAVIGATE_TO",        // Enum: 'NAVIGATE_TO', 'STOP', 'ACTIVATE_TOOL', 'RETURN_HOME'
  "priority": "high",           // Enum: 'low', 'normal', 'high', 'emergency'
  "payload": {
    "target_x": 45.0,
    "target_y": 12.5,
    "max_speed": 1.0
  },
  "created_at": "2026-01-23T10:35:00Z"
}
```

## 3. Confirmación de Ejecución (Robot -> Servidor)
Endpoint: `PUT /api/robot/commands/{command_id}/status/`

```json
{
  "status": "completed",        // Enum: 'received', 'in_progress', 'completed', 'failed'
  "result_message": "Destination reached successfully.",
  "battery_consumed": 2.1
}
```
