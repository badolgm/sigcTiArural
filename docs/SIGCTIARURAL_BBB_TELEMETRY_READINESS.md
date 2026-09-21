# SIGCTiArural — BBB → Dashboard Telemetry Readiness

Estado: **REAL / AUDITORÍA** · Fecha: 2026-09-20 · Rama: `feature/ubtn-biological-telemetry`
Método: revisión de código fuente, docker-compose, estado de contenedores y documentación Edge/UBTN (NO se modificó nada).
Objetivo: determinar exactamente qué falta para que **BBB-01, BBB-02 y BBB-03** empiecen a alimentar la Dashboard con datos reales.

> **BLOQUE DE ACTUALIZACIÓN — 2026-09-21 (STATE SYNCHRONIZATION).** La brecha **F1** reportada abajo (“no existe endpoint de ingesta”) quedó **cerrada e implementada** el 2026-09-21: `TelemetryIngestV3View` (`POST /api/v3/telemetry/readings/`) commiteado en `941a55d`, backend sirviendo en 8010, suite backend 60/60. El resto de brechas (F2/MQTT, F3 bridge, F4 brokers, F5 wire_all en arranque, F6/F7 nodos BBB) **siguen vigentes** tal como se auditan en este documento; la cadena BBB-01/02 queda pendiente, y BBB-03 depende de la ejecución del playbook (`SIGCTIARURAL_BBB03_EXECUTION_PLAYBOOK.md`).

---

## 1. Resumen ejecutivo

Hoy la cadena **BBB → Dashboard** está rota en el eslabón central: **no existe ningún mecanismo de ingestión** que
convierta una lectura de sensor (venga por MQTT o por HTTP) en una fila `SensorReading` que la Dashboard pueda leer.

- El **backend solo sirve lecturas (GET)**. No hay un solo endpoint `POST`/ingesta para `SensorReading`.
- Los **3 scripts BBB están a 0 bytes** (`mqtt_broker.py`, `tflite_api.py`, `sensor_reader.py`); **no existe `ubtn_bridge.py`**.
- **No hay adaptador MQTT** en Django: `requirements.txt` no incluye `paho-mqtt`.
- **`docker-compose.yml` no define ningún broker Mosquitto** para el cluster. (Existen contenedores Mosquitto corriendo en la
  máquina — `eiarc_mqtt`, puertos 1883/9001 — pero pertenecen a otro stack, EIARC; no son del cluster.)
- Los tres nodos BBB visible en la Dashboard (**BBB-01/02/03 con `initialNodes`**) están **hardcodeados/simulados** en
  `Dashboard.jsx:48-52`; no consumen MQTT.
- `wire_all()` (EventBus telemetry→labs) **no está enganchado al arranque de Django** (wsgi/asgi/settings/apps); solo se
  invoca a mano (tests / `verify_dia16_17_pilot.py`).

**Lo real que SÍ existe** para el camino directo (sin MQTT): endpoint de lectura V3, dominio telemetry completo (value
objects + entidad + puerto + repositorios), modelo Django `SensorReading` con migraciones, y el frontend listo para
mostrar `source_mode:'live'`.

---

## 2. Estado de la cadena actual (auditado 2026-09-20)

| Eslabón | Estado REAL | Evidencia |
|---|---|---|
| Docker `postgres` / `mysql` | 🟢 Up (healthy) · 5544 / 3316 | `docker ps` |
| Docker `frontend` / `backend` / `ai_service` | 🔴 **Exited (255) 3 días** | `docker ps` |
| Broker MQTT del cluster | 🔴 **NO existe** en `docker-compose.yml` | grep mqtt → 0 matches config |
| Adaptador MQTT en Django | 🔴 **NO existe** (`paho-mqtt` absent) | `requirements.txt:1-33` |
| Endpoint ingesta `SensorReading` (POST) | 🔴 **NO existe** (solo GET history) | `api/urls.py:18-45` |
| Scripts edge `bbb_*/` | 🔴 **0 bytes** (3 stubs) | `src/embedded/**` (0 B c/u) |
| `ubtn_bridge.py` (MQTT→HTTPS) | 🔴 **No existe** | glob 0 matches |
| `wire_all()` en arranque Django | 🔴 **No llamado** (solo manual) | `sigct_backend/wiring.py:25-31` |
| Endpoint lectura `GET /api/v3/telemetry/history/` | 🟢 Funciona (200 envelope V3, simulado si vacío) | `api/views.py:90-162` |
| Dominio telemetry (VOs + entidad + puerto + repos) | 🟢 Implementado y con tests | `contexts/telemetry/**` (1393 líneas dir) |
| Modelo Django `SensorReading` + migraciones | 🟢 Existente (`0001_initial.py`) | `api/models.py:4-14` |
| Frontend dashboard V3 | 🟢 Listo: `fetchTelemetryEnvelope()` → `/api/v3/telemetry/history/`, badge 📡 LIVE si `source_mode==='live'` | `Dashboard.jsx:64-87,219` |
| `RobotTelemetryViewSet` (POST `/api/robot-telemetry/`) | 🟢 Única ingesta REST existente (modelo robot: battery/position) | `api/views.py:19-22` |
| Contratos UBTN (MQTT tópicos/JSON) | 🔷 Diseño (V4; `context:'bio'`); NO implementar | `docs/UBTN_DATA_CONTRACTS.md:24` |

---

## 3. Respuestas

### 1. Qué existe
- **Backend hexagonal V3 telemetry**: `contexts/telemetry/{domain,application,infrastructure,ports}` con
  `Temperature` (-50…60 °C), `Humidity` (0…100 %), `SensorId`, entidad `SensorReading`, `SensorReadingRepositoryPort`,
  repos Django + InMemory (usado cuando `settings.TESTING`).
- **Lectura (GET)**: `GET /api/v3/telemetry/history/` (envelope `{context:"telemetry", contract_version:"v1",
  source_mode:"live|simulated", lab_type, count, items[]}`). Si no hay lecturas → datos sintéticos con `source_mode:"simulated"`.
- **Escritura de sensor**: solo vía **ORM directo** (`create_test_data.py`, Django shell/admin) — NO por API.
- **Escritura de robot**: `POST /api/robot-telemetry/` (ModelViewSet, modelo de robot, no de sensor ambiental).
- **EventBus piloto**: `RegistrarLecturaSensorCommand` → `LabSignal(sensor_reading)` → `OnSensorReadingHandler` (labs),
  cableado a mano por `wire_all()` (funciona en tests e `verify_dia16_17_pilot.py`).
- **Docs operacionales**: `EDGE_SETUP.md` (setup físico 3 BBB + ejemplo de publicación `sigct/sensors/...`),
  `UBTN_MQTT_ARCHITECTURE.md`, `UBTN_BBB_EDGE_GATEWAY.md`, `UBTN_DATA_CONTRACTS.md` (diseño V4), `docs/edge/architecture_edge.mmd`.
- **Broker disponible en la máquina (externo al cluster)**: `eiarc_mqtt` = `eclipse-mosquitto:2`, listener 1883
  (`allow_anonymous true`) + 9001 — útil solo para pruebas manuales del transporte, NO para producción del cluster.

### 2. Qué falta
| # | Bloqueante | Grado |
|---|---|---|
| F1 | **Endpoint de ingesta de lecturas de sensor** (POST `SensorReading`: `sensor_id`, `temperature`, `humidity`, `timestamp`) | 🔴 Crítico |
| F2 | **Adaptador o bridge MQTT→HTTP** (consumir tópico, traducir, hacer POST al backend) | 🔴 Crítico (para ruta MQTT) |
| F3 | **Broker Mosquitto definido** para el cluster (docker-compose o en BBB-01 físico) | 🟠 Necesario (solo si se usa MQTT) |
| F4 | **Implementar los 3 scripts `bbb_*/`** (hoy 0 bytes) | 🟠 Crítico para datos reales físicos |
| F5 | **`paho-mqtt`** en requirements del backend si el adaptador MQTT vive en Django | 🟠 Dep. de F2 |
| F6 | **Enganchar `wire_all()`** en arranque si se quiere el puente telemetry→labs en runtime | 🟡 Opcional (funcionalidad labs) |
| F7 | **DC con `source_mode` fiable**: el connector `fetchTelemetryEnvelope()` ignora una respuesta sin `context==='telemetry'` o sin `items[]` | 🟢 Menor (ya maneja fallback) |

**Dato clave**: para que la Dashboard muestre datos reales **no hace falta MQTT de entrada sí o sí** — basta con un
endpoint de ingesta HTTP + un script en BBB-03 que haga `POST`. MQTT/BBB-01 es la ruta "corregida" del cluster, pero la
más corta para "primer dato real" es HTTP directo.

### 3. Qué debemos configurar en cada BBB
Basado en `EDGE_SETUP.md` y el rol vigente (gateway MQTT – IA edge – sensores):

| Nodo | Rol | Configuración mínima |
|---|---|---|
| **BBB-01** | Gateway MQTT | Instalar/arrancar `mosquitto`; config `listener 1883` + `allow_anonymous true` (LAN-lab); apuntar bridge al `CLOUD_API_URL`; habilitar servicio systemd |
| **BBB-02** | IA edge TFLite | `config.yaml` con ruta del modelo `.tflite`; arrancar `app.py`/API local; (rol futuro para anomalías, no bloquea la Dashboard) |
| **BBB-03** | Sensores + publicación | Usar GPIO P8_11 (DHT22); fijar IP del broker en `mqtt.Client().connect(<IP>,1883)`; tópico por variable; `sleep(10)` entre envíos |

> **Nota inbound**: los tres roles también pueden implementarse detrás del mismo backend vía HTTP POST en vez de MQTT
> si se quiere el dato real más rápido (ver §4 y §6).

### 4. Qué debemos instalar
| Nodo | Paquetes | Para qué |
|---|---|---|
| BBB-01 (bridge) | `mosquitto mosquitto-clients`, `python3-pip`, `paho-mqtt requests pyyaml` | broker + cliente bridge → backend |
| BBB-02 | `python3-pip`, `flask numpy pillow tflite-runtime` | servicio IA edge |
| BBB-03 | `python3-pip`, `Adafruit_DHT paho-mqtt` | lectura DHT22 + publicación |
| Backend (si adaptador MQTT en Django) | `paho-mqtt` (agregar a `requirements.txt`) | suscripción al tópico |

### 5. Qué servicio debe correr
1. **Backend Django** (`docker compose up -d backend`) — hoy Exited; sin él la Dashboard no tiene de dónde leer.
2. **Postgres** (ya corre) — persistencia de `SensorReading`.
3. **Broker MQTT** del cluster (a decidir): en BBB-01 físico (`systemctl start mosquitto`) **o** como servicio docker.
4. **Bridge MQTT→HTTP del cluster** (F2): proceso que suscriba `sigct/sensors/#` y haga `POST /api/v3/telemetry/readings/`
   (endpoint a crear) — o, ruta mínima, un cron/`systemd` en BBB-03 que haga POST directo.
5. **Frontend** (Vite dev 5173 ya corre; en Docker `frontend` está Exited) — lee el endpoint V3 vía proxy `/api`.

### 6. Qué formato JSON espera el backend
**Para lectura (lo que la Dashboard consume hoy):** envelope V3:
```json
{
  "context": "telemetry",
  "contract_version": "v1",
  "source_mode": "live | simulated",
  "lab_type": "ROBOTICA",
  "count": 24,
  "items": [
    { "reading_id": 1, "sensor_id": "BBB-03", "timestamp": "2026-09-20T10:00:00.000Z",
      "temperature": 24.5, "humidity": 61.0 }
  ]
}
```
**Para ingesta (modelo + dominio; el endpoint no existe aún):** el dominio solo admite
`{ "sensor_id": "...", "temperature": float [-50..60], "humidity": float [0..100], "timestamp": ISO8601 }`.
El payload MQTT heredado del ejemplo de `EDGE_SETUP.md` (`{nodo_id, sensor_tipo, valor, timestamp}`) **NO es compatible**
con el modelo; el bridge debe traducirlo a `sensor_id`/`temperature`/`humidity`.

**Contrato alternativo UBTN V4** (diseño, no implementar aún): envelope `{context:"bio", contract_version:"4.0",
source_mode, items:[{kind:"reading", schema:"reading_v1", device_id, subject_id, captured_at, reading_signature,
placement, quality, metrics:{CHANNEL:{value,unit,flags}}}]}` → futuro `POST /api/v4/bio/readings/`.

### 7. Cómo probarlo localmente
Paso a paso (sin BBB físico, todo Docker/local):
1. `docker compose up -d backend` (postgres ya está arriba). Confirmar `http://localhost:8010/api/v3/telemetry/history/` → 200.
2. Insertar una lectura real de prueba (simula lo que hará la ingesta):
   ```bash
   docker compose exec backend python create_test_data.py
   # o vía manage.py shell: api.models.SensorReading.objects.create(sensor_id="BBB-03", temperature=24.5, humidity=61.0)
   ```
3. `GET http://localhost:8010/api/v3/telemetry/history/` → `source_mode:"live"`, `items[]` con esa lectura.
4. Abrir Dashboard en Vite (5173) → badge debe pasar a **📡 LIVE** y TelemetryPanel/GlobalChart leer valores reales.
5. **Prueba del transporte MQTT** (opcional, sin tocar el cluster): usar el broker `eiarc_mqtt` en localhost:1883:
   ```bash
   docker exec eiarc_mqtt mosquitto_pub -t sigct/sensors/bbb03/temperatura \
     -m '{"nodo_id":"BBB-03","sensor_tipo":"temperatura","valor":24.5}'
   docker exec eiarc_mqtt mosquitto_sub -t sigct/sensors/bbb03/# -v
   ```
   Confirma el transporte; el salto a la Dashboard lo da el bridge/endpoint de ingesta (F1/F2).
6. Verificar `RobotTelemetryViewSet` (ruta de robot existente) si se quiere un flujo HTTP de escritura ya operativo.

### 8. Cuál es el primer dato real que debería aparecer en la Dashboard
**Una lectura `SensorReading` con `sensor_id="BBB-03"`, `temperature` real (DHT22 ≈ 24–28 °C) y `humidity` real
(≈ 50–80 %) persistida, servida por `GET /api/v3/telemetry/history/` con `source_mode:"live"`.**

En pantalla se verá, en orden:
1. `TelemetryPanel`: Temp. Aire y Humedad con valores no-sintéticos, etiqueta **🟢 LIVE** (hoy es `⚪ SIM`).
2. `TelemetryChart`: las primeras series dibujadas con esos mismos datos (no `defaultChartData`).
3. Contador "Lecturas (flujo)" ≠ 0 y sufijo `LIVE` en el mapa de nodos; BBB-03 deja de estar `offline` (dato duro).

---

## 4. Clasificación de brechas (resumen)

| Eslabón del dato | ¿Existe hoy? | Fuente para cerrar |
|---|---|---|
| BBB-03 lee sensor físico | 🔴 No (script 0 B) | Implementar `sensor_reader.py` (EDGE_SETUP §BBB-03) |
| Publicación MQTT `sigct/sensors/#` | 🔴 No (sin script) | Ejemplo de `EDGE_SETUP.md:88-112` |
| Broker Mosquitto del cluster | 🔴 No definido | docker-compose nuevo servicio o BBB-01 físico |
| Bridge MQTT→HTTP | 🔴 No existe | `ubtn_bridge.py` (diseño en `UBTN_BBB_EDGE_GATEWAY.md`) **o** camino HTTP directo |
| Endpoint ingesta `SensorReading` (POST) | 🔴 No existe | Comando + puerto nuevo en `contexts/telemetry` (PostSensorReading → repository) |
| `GET /v3/telemetry/history/` (Dashboard) | 🟢 Funciona | — |
| Dashboard consume envelope V3 | 🟢 Funciona | — |

---

## 5. Reglas de gobernanza aplicadas
- **Honestidad de estado**: todo lo marcado 🔷 (diseño) está señalado como "no implementar"; lo 🔴 solo identifica huecos
  de auditoría (esta sesión no implementa nada).
- **NO tocar** backend/Docker/Telemetry/BBB *salvo misión explícita* (AGENTS.md). Si se decide implementar F1→F7, debe
  ser una misión nueva con orden de Bernardo.
- La ruta MQTT UBTN (V4) no reemplaza al flujo V3 telemetry ambiental: son contextos distintos (`bio` vs `telemetry`).

---

## 6. Archivos de referencia
- Código backend: `src/backend/api/views.py` (V1/V2/V3 views) · `api/urls.py` · `api/models.py` · `api/serializers.py`
  · `contexts/telemetry/**` · `sigct_backend/wiring.py` · `create_test_data.py` · `verify_dia16_17_pilot.py`
- Frontend: `src/frontend/src/pages/Dashboard.jsx` (ver fetch V3) · `components/TelemetryPanel.jsx` · `hooks/useRoboticsApi.js`
- Edge (stubs 0 B): `src/embedded/bbb_01_gateway/mqtt_broker.py` · `bbb_02_ia_edge/tflite_api.py` · `bbb_03_sensors/sensor_reader.py`
- Infra: `docker-compose.yml` · `.env` (BACKEND_PORT 8010, AI_PORT 8081, FRONTEND_PORT 5173) · `src/frontend/vite.config.js`
- Docs: `docs/EDGE_SETUP.md` · `docs/UBTN_MQTT_ARCHITECTURE.md` · `docs/UBTN_BBB_EDGE_GATEWAY.md` ·
  `docs/UBTN_DATA_CONTRACTS.md` · `docs/edge/architecture_edge.mmd` · `docs/SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md`
- Auditorías previas relacionadas: `docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md` (tabla BBB) ·
  `docs/architect_master/05_*` (brecha MQTT/Docker) · `docs/UBTN_AUDIT_REVIEW.md`
- Evidencia runtime: `docker ps` (2026-09-20): postgres/mysql Up · `eiarc_mqtt` Up (1883/9001, ajeno al cluster) ·
  frontend/backend/ai_service Exited (3 días)