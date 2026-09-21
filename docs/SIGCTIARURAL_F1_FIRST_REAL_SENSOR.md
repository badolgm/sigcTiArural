# SIGCTiArural — FASE F1 · Primer Dato Real de Sensor (Diseño)

Estado: **REAL / IMPLEMENTADO Y COMMITEADO** · Fecha diseño: 2026-09-20 · Commit: `941a55d` (feat f1, 2026-09-21) · Rama: `feature/ubtn-biological-telemetry`
Origen: `docs/SIGCTIARURAL_BBB_TELEMETRY_READINESS.md` (brecha F1: no existe endpoint de ingesta).
Estado anterior: **DISEÑO / FASE F1** — este documento especificó el camino mínimo; fue implementado y commiteado sin alteración del contrato (F1.1: 60/60 tests). El diseño original se conserva íntegro abajo como referencia.
Alcance: **BBB-03 → HTTP POST → Telemetry V3 → Dashboard LIVE.** Sin MQTT, sin bridge, sin código BBB (pendiente de ejecución física).

---

## 0. Camino mínimo (decisión de diseño)

```text
BBB-03 (físico o simulado)
  │  HTTP POST  (en vez de MQTT para F1)
  ▼
POST /api/v3/telemetry/readings/   ← ÚNICO componente nuevo (view + ruta)
  ▼  construye SensorReading (value objects existentes validan)
RegistrarLecturaSensorCommand (YA existe) → SensorReadingRepositoryPort (YA existe)
  ▼
DjangoSensorReadingRepository (YA existe) → PostgreSQL
  ▼  EventBus LabSignal(sensor_reading)  (YA existe, wire_all) → labs (opcional, no bloquea)
GET /api/v3/telemetry/history/  (YA existe) → source_mode:"live"
  ▼
Dashboard (Vite 5173) → 🟢 LIVE con temperature/humidity reales (YA listo)
```

**Principio clave:** F1 es **un solo archivo nuevo/no-rompedor** (`views.py` + 1 línea en `urls.py`), porque el dominio
telemetry, el puerto, el repositorio, el comando y el frontend **ya existen y ya están probados**. El gap NO está en el
dominio: está solo en **exponer una puerta de entrada HTTP**.

---

## 1. Qué endpoint debemos crear

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/v3/telemetry/readings/` |
| **Nombre** | `TelemetryIngestV3View` |
| **Contrato salida** | Envelope V3 coherente con `TelemetryHistoryV3View` (`context`, `contract_version`, `source_mode`, `item`) |
| **Status éxito** | `201 Created` |
| **Status error** | `400` (payload inválido / fuera de rango / fecha futura), `415` no aplica (content-type JSON) |
| **Auth** | `AllowAny` (igual que las demás V3 de telemetría; la autenticación de dispositivos se decide más adelante) |

Razón de la ruta: sigue la convención ya existente de recursos bajo `/api/v3/telemetry/` (`history`, `ai/crop-advice`,
`ai/inference`) y usa una colección verbalmente clara: `readings` = "registrar lecturas". Es consistente con
`POST /api/v4/bio/readings/` que el diseño UBTN ya proyectó (paralelismo, sin tocar el contexto bio).

### Formato de petición (content-type `application/json`)
```json
{
  "sensor_id": "BBB-03",
  "temperature": 24.5,
  "humidity": 61.0,
  "timestamp": "2026-09-20T10:00:00.000Z"
}
```
`timestamp` es **opcional**: si se omite, el dominio usa `datetime.now()` (default de `SensorReading`).

### Formato de respuesta (éxito, envelope V3)
```json
{
  "context": "telemetry",
  "contract_version": "v1",
  "operation": "register_reading",
  "source_mode": "live",
  "item": {
    "reading_id": 42,
    "sensor_id": "BBB-03",
    "timestamp": "2026-09-20T10:00:00.000Z",
    "temperature": 24.5,
    "humidity": 61.0
  }
}
```

### Formato de respuesta (error de validación, 400)
```json
{
  "context": "telemetry",
  "contract_version": "v1",
  "operation": "register_reading",
  "source_mode": "fallback",
  "error": {
    "code": "invalid_payload",
    "message": "Lectura no registrada: datos fuera de contrato.",
    "detail": "Temperatura fuera de rango (-50°C a 60°C): 99.0°C"
  }
}
```

---

## 2. Dónde debe vivir (DDD · Hexagonal · Ports & Adapters)

Cada capa queda en su carpeta, **reutilizando lo existente** y creando solo lo mínimo. Matriz de trazabilidad:

| Capa Hexagonal | ¿Existe? | Ubicación en F1 |
|---|---|---|
| **Entidad** `SensorReading` | ✅ Existe | `src/backend/contexts/telemetry/domain/entities/sensor_reading.py` — **intacta** |
| **Value Objects** `Temperature` / `Humidity` / `SensorId` | ✅ Existen y validan | `contexts/telemetry/domain/value_objects/` — **intactos** |
| **Exceptiones de Dominio** (`DomainException`, `Invalid*Error`) | ✅ Existen | `contexts/telemetry/domain/exceptions/` — **intactas** |
| **Use Case (Command)** `RegistrarLecturaSensorCommand` | ✅ Existe | `contexts/telemetry/application/commands/` — **reutilizado tal cual** |
| **Puerto de salida** `SensorReadingRepositoryPort` | ✅ Existe | `contexts/telemetry/ports/sensor_reading_repository.py` — **intacto** |
| **Adaptador persistencia** `DjangoSensorReadingRepository` | ✅ Existe | `contexts/telemetry/infrastructure/persistence/django/` — **intacto** |
| **Composition root repositorio** `get_sensor_reading_repository()` | ✅ Existe | `contexts/telemetry/infrastructure/config/dependencies.py` — **intacto** |
| **Adaptador eventos** `InMemoryEventBus` + `wire_all()` | ✅ Existe | `shared_kernel/event_bus/…` + `sigct_backend/wiring.py` — **reutilizados** |
| **Adaptador HTTP de entrada** `TelemetryIngestV3View` | ❌ **NUEVO** | `src/backend/api/views.py` (dentro de `if HEXAGONAL_V3_AVAILABLE:`) |
| **Ruta** `v3/telemetry/readings/` | ❌ **NUEVA** | `src/backend/api/urls.py` (bloque `try:` V3) |

**Regla de arquitectura aplicada:** el view (capa de interfaz) es un **adaptador de entrada**: parsea JSON de transporte,
construye entidades de dominio (delegando la validación en los value objects), e invoca el use case. El view **no toca
modelos Django directamente** ni el repositorio; depende de la abstracción y del command. El dominio permanece
inocente de HTTP y de Django (inversión de dependencias ya establecida en `contexts/telemetry/README` del Día 9).

### `TelemetryIngestV3View` — forma de referencia (DISEÑO, no implementar)
```python
# api/views.py  (dentro de if HEXAGONAL_V3_AVAILABLE:)
class TelemetryIngestV3View(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # 1. Validación estructural del payload (capa de transporte)
        try:
            sensor_id_raw = request.data["sensor_id"]
            temperature_raw = float(request.data["temperature"])
            humidity_raw = float(request.data["humidity"])
        except (KeyError, TypeError, ValueError) as exc:
            return Response({... envelope error 400 ...}, status=400)

        # 2. Construcción de Entidad -> value objects validan rango (dominio)
        try:
            reading = SensorReading(
                sensor_id=SensorId(sensor_id_raw),
                temperature=Temperature(temperature_raw),
                humidity=Humidity(humidity_raw),
                timestamp=self._parse_timestamp(request.data.get("timestamp")),
            )
        except DomainException as exc:
            return Response({... envelope error 400 ...}, status=400)
        except ValueError as exc:          # timestamp futuro (SensorReading.__post_init__)
            return Response({... envelope error 400 ...}, status=400)

        # 3. Use Case (persistir + publicar LabSignal) vía composición
        command = RegistrarLecturaSensorCommand(
            repository=get_sensor_reading_repository(),
            event_bus=get_telemetry_event_bus(),      # bus cableado con wire_all()
        )
        guardada = command.ejecutar(reading)

        # 4. Respuesta envelope V3
        return Response({... 201 ...}, status=201)
```

---

## 3. Qué Use Case debe existir

**`RegistrarLecturaSensorCommand` — YA EXISTE y es exactamente el use case requerido**
(`contexts/telemetry/application/commands/registrar_lectura_sensor_command.py`).

- Entrada: `SensorReading` (entidad de dominio ya validada).
- Salida: entidad persistida + `LabSignal(signal_type="sensor_reading")` publicada en el `EventBusPort`.
- **NO se crea ningún use case nuevo.** Se reutiliza idéntico: persiste (repository.save) y publica la señal que el
  handler `OnSensorReadingHandler` (labs) puede escuchar — lo cual ya funciona en `verify_dia16_17_pilot.py`.

Si se deseara aislar el mapeo payload→entidad en una capa intermedia, la opción (documentada, diferida) es un
**Application Service** `IngestSensorReadingService` que reciba `dict` plano y construya la entidad; para F1 MVP esto
queda en el view (adapter HTTP) porque el mapeo es directo 4 campos → 4 value objects y no añade lógica de negocio.

---

## 4. Qué puerto debe existir

**`SensorReadingRepositoryPort` — YA EXISTE** (`contexts/telemetry/ports/sensor_reading_repository.py`).

- `save(reading: SensorReading) -> SensorReading` — usado por el command.
- `get_all(limit) / get_by_id(id)` — ya usados por `TelemetryHistoryV3View` y el adapter legacy.
- **No se crea ningún puerto nuevo.** El command depende de esta abstracción; el view nunca la toca directamente.

---

## 5. Qué adaptador debe existir

| Adaptador | Tipo | ¿Existe? | Rol en F1 |
|---|---|---|---|
| `TelemetryIngestV3View` | **Entrada (HTTP)** | ❌ Nuevo | Traduce JSON → entidad → command → envelope V3 |
| `DjangoSensorReadingRepository` | Salida (persistencia) | ✅ | Persiste en PostgreSQL (vía `get_sensor_reading_repository`) |
| `InMemoryEventBus` + `wire_all()` | Salida (eventos) | ✅ | Publica `LabSignal(sensor_reading)`; cableado con la composición root |
| `LegacySensorReadingRepositoryAdapter` | Compat (legacy) | ✅ | No afectado (sigue sirviendo a V2) |

**Único adaptador a crear: el view de entrada.** Para el EventBus, se reutiliza el composition root existente
`wire_all(bus)` invocándolo a mano (mismo patrón ya probado en `verify_dia16_17_pilot.py`), instanciado una sola vez
por proceso vía `lru_cache`/módulo (`get_telemetry_event_bus()` en `contexts/telemetry/infrastructure/config/dependencies.py`).
No se toca `sigct_backend/wiring.py` (ya es correcto e idempotente por bus).

---

## 6. Qué estructura JSON debe enviar BBB-03

**Payload mínimo (F1, sin MQTT):** BBB-03 hace `POST application/json` con estos 4 campos:

```json
{
  "sensor_id": "BBB-03",
  "temperature": 24.5,
  "humidity": 61.0,
  "timestamp": "2026-09-20T10:00:00.000Z"
}
```

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| `sensor_id` | `string` | ✅ | No vacío; normalizado con `strip()`. Identifica el nodo real (convención `BBB-*`) |
| `temperature` | `number` (float) | ✅ | En °C; rango `[-50.0, 60.0]` |
| `humidity` | `number` (float) | ✅ | % relativo; rango `[0.0, 100.0]` |
| `timestamp` | `string` ISO-8601 | ⬜ | Opcional; **no en el futuro**; si falta → `datetime.now()` |

**Decisión importante (honestidad):** el payload que hoy publica el ejemplo heredado de `EDGE_SETUP.md`
(`{"nodo_id":"BBB-03","sensor_tipo":"temperatura","valor":24.5}`) **NO es compatible** con este contrato y **se
descarta de F1**. El script real de BBB-03 (fase posterior) publicará este 4-campos. Nada se rompe: no hay código BBB hoy.

---

## 7. Cómo validar `sensor_id` / `temperature` / `humidity` / `timestamp`

La validación es **de dominio**, no de serializer: se delega en los **value objects existentes** que ya tienen las
invariantes y sus tests. El view solo hace captura de *parseo* (números), no de rango.

| Campo | Validación | Mecanismo | Excepción lanzada |
|---|---|---|---|
| `sensor_id` | No vacío + `strip()` | `SensorId(value)` (frozen) | `InvalidSensorIdError` |
| `temperature` | `-50.0 <= value <= 60.0` | `Temperature(value)` (frozen) | `InvalidTemperatureError` |
| `humidity` | `0.0 <= value <= 100.0` | `Humidity(value)` (frozen) | `InvalidHumidityError` |
| `timestamp` | ISO-8601 + no futuro | `SensorReading.__post_init__` | `ValueError("La fecha y hora no puede estar en el futuro")` |
| tipos | float convertible | parse del view: `float(payload["temperature"])` | `TypeError`/`ValueError` → 400 |

Todas las excepciones de dominio heredan de `DomainException`; se capturan en el view y se traducen a la respuesta con
`error` envelope `{code:"invalid_payload", detail:<mensaje de la excepción>}`. La entidad `SensorReading` **no se toca**:
su `__post_init__` ya valida timestamp y los VOs el resto. Se escriben tests nuevos solo para el **view** (integración
HTTP), reutilizando los tests de dominio existentes (`tests/contexts/telemetry/test_*.py`).

---

## 8. Cómo convertir ese payload en `SensorReading`

Mapeo 1:1 en el view (ver §2, forma de referencia):

```python
reading = SensorReading(
    sensor_id=SensorId(payload["sensor_id"]),
    temperature=Temperature(payload["temperature"]),
    humidity=Humidity(payload["humidity"]),
    timestamp=parsed_timestamp,     # opcional; isoformat → datetime; default now()
)
```

1. Los constructores de value objects disparan las invariantes (Tabla §7).
2. `SensorReading.__post_init__` valida que el `timestamp` no sea futuro.
3. La entidad ya construida y válida se pasa al **command** (que no vuelve a validar rango, solo persiste y publica).
4. `DjangoSensorReadingRepository.save()` → `SensorReadingMapper.to_django()` mapea VOs → columnas (`sensor_id`/`temperature`/`humidity`/`timestamp`) — este mapper **ya existe** y no cambia.

**Cero cambios a `SensorReading`, a los VOs o al mapper.** La dirección de conversión (payload → entidad → Django) usa
exactamente los buckets de construcción ya probados por `verify_dia16_17_pilot.py` y `tests/contexts/telemetry/`.

---

## 9. Cómo probar localmente sin una BBB física

### 9.1. Levantar el stack
```bash
# postgres YA corre (healthy). Solo falta el backend (hoy Exited).
docker compose up -d --build backend
# Frontend: Vite dev ya escucha en 5173 (proxy /api → 8010) — no requiere contenedor frontend.
```

### 9.2. Probar el endpoint de ingesta (PowerShell)
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8010/api/v3/telemetry/readings/ `
  -ContentType "application/json" `
  -Body '{"sensor_id":"BBB-03","temperature":24.5,"humidity":61.0,"timestamp":"2026-09-20T10:00:00.000Z"}'
# Esperado: 201 + envelope V3 con reading_id asignado y source_mode:"live"
```

### 9.3. Verificar que la lectura es visible por el flujo que consume la Dashboard
```powershell
Invoke-RestMethod -Uri http://localhost:8010/api/v3/telemetry/history/ -Method Get
# Esperado: source_mode:"live" · items[0].sensor_id == "BBB-03" · temperature/humidity reales
```

### 9.4. Dashboard
Abrir `http://localhost:5173` → Telemetría: badge debe pasar de `⚪ SIM` a **🟢 LIVE**, y `TelemetryPanel`/`GlobalChart`
deben pintar los valores de BBB-03 (cadena de datos de la lectura, sin `defaultChartData`).

### 9.5. Simular BBB-03 sin hardware (prueba continua)
Script de un bucle (bash/PowerShell) que haga POST cada `N` segundos con variación pequeña de temperatura, para ver la
serie crecer en la gráfica:
```powershell
1..30 | ForEach-Object {
  $t = 24.0 + (Get-Random -Minimum -1 -Maximum 1)
  $h = 61.0 + (Get-Random -Minimum -2 -Maximum 2)
  Invoke-RestMethod -Method Post -Uri http://localhost:8010/api/v3/telemetry/readings/ `
    -ContentType "application/json" `
    -Body (@{ sensor_id="BBB-03"; temperature=$t; humidity=$h } | ConvertTo-Json)
  Start-Sleep -Seconds 5
}
```

### 9.6. Verificación de regresión
- `GET /api/v3/telemetry/history/` y `/v2/telemetry/history/` siguen respondiendo (V2 usa el adapter legacy → intacto).
- Tests existentes: `pytest tests/contexts/telemetry tests/api -q` → sin roturas.
- `git status` limpio salvo por los 2 archivos de nuevas rutas/vistas + tests.

---

## 10. Qué cambios exactos requiere el backend

Enumeración exhaustiva (todo lo demás del repositorio queda intacto):

| # | Archivo | Cambio | Tipo |
|---|---|---|---|
| 1 | `src/backend/api/views.py` | Añadir `TelemetryIngestV3View.post()` dentro de `if HEXAGONAL_V3_AVAILABLE:` (parse → construir entidad → command → 201) | ✚ Nuevo |
| 2 | `src/backend/api/urls.py` | En el bloque `try:` de V3, añadir `path('v3/telemetry/readings/', TelemetryIngestV3View.as_view(), name='telemetry-ingest-v3')` | ✚ Línea |
| 3 | `src/backend/contexts/telemetry/infrastructure/config/dependencies.py` | (Opcional, recomendado) helper `get_telemetry_event_bus()` con `lru_cache` que construya `InMemoryEventBus` + invoque `wire_all(bus)` una vez | ✚ Helper |
| 4 | `src/backend/tests/api/test_telemetry_ingest_v3_view.py` | Tests: POST válido → 201 + lectura persistida; campos faltantes → 400; rango inválido → 400; timestamp futuro → 400 | ✚ Tests |

**No se modifica:** `SensorReading`, value objects, mapper, repositorios, puertos, command, handler labs, wiring,
`TelemetryHistoryV3View`, V2 views, modelos, migraciones, `docker-compose.yml`, `.env`, frontend.

> Como `Manage.py`/settings no cambia y no hay migraciones nuevas (`SensorReading` ya existe desde `0001_initial.py`),
> F1 no requiere `makemigrations`. El backend viejo Exited se reconstruye con el mismo Dockerfile (solo copia el código
> bind-mount en `./src/backend:/app`).

---

## 11. Validación de restricciones de la misión

| Restricción | Cómo se respeta |
|---|---|
| ✅ Respeta DDD | La validación reglas de negocio vive en value objects/entidad; el use case orquesta; el view no contiene lógica de dominio |
| ✅ Respeta Hexagonal | Entrada = adaptador HTTP (view); salida = `SensorReadingRepositoryPort` + `EventBusPort`, inyectados; el dominio no conoce HTTP/Django |
| ✅ Respeta Bounded Contexts | Todo el cambio vive en `api` (interfaz) + `contexts/telemetry`; **no toca** `contexts/bio`, `contexts/labs` (salvo escuchar la señal que ya emite el command), ni UBTN docs |
| ✅ No toca UBTN | No se crea nada en `contexts/bio`, no se materializa contrato V4, no se escribe `ubtn_bridge.py` |
| ✅ No toca `SensorReading` existente | Entidad intacta; se construye con los constructores actuales |
| ✅ No rompe Telemetry Context | V1/V2/V3 servir; repositorios y mapper intactos; el command es el mismo que ya usa el piloto |
| ✅ Mínimo | 1 vista + 1 ruta (obligatorio); 1 helper opcional; 1 archivo de tests |

---

## 12. Resultado final

**¿Cuál es el paso más pequeño posible para que la Dashboard muestre 🟢 LIVE con temperatura y humedad reales?**

> **Crear `TelemetryIngestV3View` (POST `/api/v3/telemetry/readings/`) + registrar la ruta en `urls.py`, reutilizando
> `RegistrarLecturaSensorCommand` + `SensorReading` + `get_sensor_reading_repository()`, y levantar el backend.**
> Ningún otro componente nuevo: dominio, puerto, adaptadores, tests de dominio, dashboard y frontend ya existen y ya
> generan `source_mode:"live"` cuando hay una `SensorReading` persistida. BBB-03 (físico o script simulado) solo hace
> un `POST` HTTP con `{sensor_id, temperature, humidity, timestamp}`.

**¿En cuánto tiempo puede lograrse?**
- **Código del endpoint + ruta + tests (una sesión con el patrón ya auditado): ≈ 1–2 horas.**
- **Verificación end-to-end local (build backend → POST → history `live` → Dashboard 🟢 LIVE; script simulado):**
  ≈ **30–60 minutos** adicionales (el `docker compose up -d --build backend` es el único paso pesado).
- **Con una BBB física (futura fase, script `sensor_reader.py` + POST):** plus ≈ 1 sesión de hardware.

**Total conservador F1: ~2–3 horas** para ver el primer dato real en la Dashboard (sin BBB física; con simulación por HTTP).

---

## 13. Referencias
- Auditoría origen: `docs/SIGCTIARURAL_BBB_TELEMETRY_READINESS.md` (brecha F1-F7).
- Código reutilizado: `contexts/telemetry/**` (Día 9), `sigct_backend/wiring.py`, `verify_dia16_17_pilot.py`,
  `api/views.py` (patrón de V3), `api/urls.py`.
- Docs alineados: `docs/local/PLAN_DIA16-17_INTERCONEXION.md`, `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`.
- Contexto operativo: `AGENTS.md`.

*Diseño de fase — sin implementación en esta rama. Se materializa solo si Bernardo lo ordena como misión nueva.*