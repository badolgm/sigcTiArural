# SIGCTiArural — Pre-Commit Review · F1 (Primer Sensor Real)

Estado: **REFERENCIA / AUDITORÍA DOCUMENTAL (pre-commit)** · Fecha: 2026-09-21 · Rama: `feature/ubtn-biological-telemetry`
Alcance: auditoría **pre-commit** de la implementación de F1 sobre el working tree. **NO se modificó ningún archivo.**
Método: lectura de diff `git diff HEAD` + lectura de dominio/aplicación/adaptadores/event bus + py_compile (sintaxis) de los 4 archivos backend. Resultados de runtime (F1.1, 60/60, probes, stress) ya registrados en `docs/SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md`.

> **BLOQUE DE ACTUALIZACIÓN — 2026-09-21 (STATE SYNCHRONIZATION, POST-COMMIT).** Veredicto de esta auditoría = **GO CON CONDICIONES**; el commit real quedó consolidado en `941a55d` (código F1 + 5 docs F1, **sin** `Dashboard.jsx`), cumpliendo la condición de que el diff RC-2/UX del frontend no se mezcle con F1. `Dashboard.jsx` y `dashboard_rc2_ui.patch` permanecen sin commitear, tal como este documento recomienda. DDD/Hexagonal: menciones de "pendiente de commit" en el texto abajo se conservan como registro pre-commit.

---

## 0. Alcance del delta F1

| Archivo | Estado | Qué aporta F1 |
|---|---|---|
| `src/backend/api/urls.py` | `M` (+3/-1) | Ruta `v3/telemetry/readings/` (`telemetry-ingest-v3`) dentro del `try ImportError` V3 existente |
| `src/backend/api/views.py` | `M` (+140) | `TelemetryIngestV3View` (adaptador HTTP de entrada) + imports de comando/VOs/excepciones + `logging` + `drf_exceptions` |
| `src/backend/contexts/telemetry/infrastructure/config/dependencies.py` | `M` (+28) | `get_telemetry_event_bus()` (factory EventBusPort + composition root `wire_all`) |
| `src/backend/tests/api/test_telemetry_ingest_v3_view.py` | `??` (nuevo, 295 líneas) | 17 tests de caracterización del adaptador (contrato V3 + bordes F1.1) |
| `src/frontend/src/pages/Dashboard.jsx` | `M` | **NO es delta F1.** `fetchTelemetryEnvelope`/contrato V3 ya venían del commit RC-2 `87fc001`. El diff pendiente son accordions/UX de RC-2 sin commitear (verificado: `git diff HEAD` no toca símbolos de telemetría V3) |

> El frontend ya consumía el envelope V3 (`telemetry-history-v3`, `source_mode`) desde RC-2. **F1 no toca frontend.**

---

## 1–10. Respuestas por pregunta

### 1. ¿Se respetó DDD? — SÍ (VERDE)
- La vista conoce **objetos de valor del dominio** (`SensorId`, `Temperature`, `Humidity`) y la **entidad** `SensorReading` del contexto.
- Validaciones de negocio viven en los VOs (rangos T/H, no-vacío) y entidad (timestamp no futuro), **no** en el adaptador. El adaptador solo traduce transporte → dominio.
- `RegistrarLecturaSensorCommand` (caso de uso) orquesta persistencia + publicación de `LabSignal`. El dominio de telemetry no fue modificado: la entidad, VOs, puertos, adaptadores y comando son los preexistentes.

### 2. ¿Se respetó Hexagonal? — SÍ (VERDE)
- **Entrada**: `TelemetryIngestV3View` es adaptador de entrada (APIView). Construye el comando con dependencias del composition root (`get_context_sensor_reading_repository`, `get_telemetry_event_bus`).
- **Aplicación**: `RegistrarLecturaSensorCommand` depende de **puertos** (`SensorReadingRepositoryPort`, `EventBusPort`), no de Django.
- **Salida**: `DjangoSensorReadingRepository` / `InMemorySensorReadingRepository` (TESTING) implementa el puerto; `InMemoryEventBus` implementa `EventBusPort` y el cableado con Labs lo define `sigct_backend/wiring.py` (composition root, único lugar de suscripción).
- Único matiz: la construcción de dependencias en la vista usa **service-locator** (`get_*_service()`), no inyección por constructor — patrón ya establecido en todo el backend (coherente, no regresión).

### 3. ¿Se reutilizó correctamente `RegistrarLecturaSensorCommand`? — SÍ (VERDE)
- Importado desde `contexts/telemetry/application/commands/` y ejecutado con `command.ejecutar(reading)`.
- **No** se duplicó la lógica de guardado ni de publicación de señal. El comando quedó intacto (0 cambios en application/).
- El orden correcto (persistir → publicar) y el aislamiento de fallos del suscriptor los garantiza `InMemoryEventBus.publish` (pre-existente).

### 4. ¿Se reutilizó correctamente `SensorReadingRepositoryPort`? — SÍ (VERDE)
- La vista obtiene el repositorio vía el factory del contexto, que respeta `settings.TESTING` → `InMemorySensorReadingRepository` en tests, `DjangoSensorReadingRepository` en runtime. Coherente con el patrón ya usado por `TelemetryHistoryV3View`.
- No se creó un puerto alternativo ni un "repo de vista".

### 5. ¿Se introdujo deuda técnica? — SÍ, MENOR (documentada)
- **AMARILLO (leve)**: `MAX_SENSOR_ID_LENGTH = 50` en la vista duplica el conocimiento de `api.models.SensorReading.sensor_id` (`max_length=50`). Es defensa válida y documentada (evita `DataError` en BD porque `SensorId` del dominio no limita longitud), pero deja un **contrato de dominio ≠ contrato de persistencia**: el dominio acepta IDs de cualquier longitud y el modelo solo 50. Si el modelo cambia, la constante debe seguirla a mano.
  - Mejora futura (no bloqueante): mover la limitación de longitud al VO `SensorId` o derivarla del modelo.
- **AMARILLO (leve)**: en el bloque de error de persistencia, `detail: str(exc)` expone el detalle interno de la excepción en la respuesta HTTP (`AllowAny`). Aceptable en fase lab/RC por trazabilidad, pero conviene ocultarlo en producción (log interno sí, response no).

### 6. ¿Se introdujo código temporal? — NO (VERDE)
- No hay datos de fake hardcodeados en producción, ni prints de depuración, ni banderas de demo. El único `sensor_id="BBB-03"` que aparece en tests es fixture y en el playbook es config del nodo (fuera del repo).
- Los helpers (`_parse_number`, `_parse_timestamp`, `_invalid_payload`, `handle_exception`) son definitivos y están cubiertos por tests.

### 7. ¿Existen shortcuts peligrosos? — NO (VERDE) con límite conocidos
- `AllowAny` en el endpoint es **consistente con todo el backend** (todas las vistas legacy son `AllowAny`) y F1 documenta el límite operativo (sin auth de dispositivo, sin throttling, sin dedup, sin retención) — gobernanza de campo, no shortcut oculto.
- `handle_exception` solo envuelve `ParseError`; el resto de excepciones DRF escapan al formato por defecto (no envelope). No es un fallo: el contrato V3 cubre los caminos de negocio y malformación; se anota como observación menor si se quiere envelope 100% uniforme.
- Sin `try/except` silenciosos amplios que oculten errores: el `except Exception` de persistencia registra con `logger.exception` y responde `storage_error` (honestidad de estado).

### 8. ¿Existe código muerto nuevo? — NO (VERDE)
- Todos los `@staticmethod` de la vista son usados. Los imports nuevos (`logging`, `drf_exceptions`, comando, VOs, `DomainException`, entidad aliased `TelemetrySensorReading`) tienen uso real en el delta.

### 9. ¿Existen imports innecesarios? — NO (VERDE)
- Backend: `logging` (usado en `logger.exception`), `drf_exceptions` (usado en `handle_exception`), cada símbolo de dominio/comando usado una vez.
- Tests: `pytest, reverse, timezone, timedelta, APIClient, SensorReading` — todos usados; no hay `json`/`datetime` sobrantes.
- (`SensorReadingSerializer` y `random` ya existían para legacy, fuera del delta F1.)

### 10. ¿Es digna de entrar al RC? — SÍ, con sello (GO CON CONDICIONES)
- Contrato V3 respetado (envelope `context/contract_version/operation/source_mode`, live/fallback honesto).
- 17 tests + 60/60 en suite API+contexts; probes runtime y stress documentados en F1 doc.
- Sin cambios a dominio, aplicación, puertos, adaptadores, migraciones o Docker del contexto. El único archivo de contextos tocado es el factory de dependencias, donde la adición es ortogonal y respeta la idempotencia de `wire_all`.

---

## Clasificación por capa

| Capa | Veredicto | Comentario |
|---|---|---|
| **Arquitectura** | 🟢 VERDE | Hexagonal completa: adaptador de entrada → puerto/comando → adaptadores de salida; composition root respetado |
| **Dominio** | 🟢 VERDE | Cero cambios; VOs y entidad intactos; invariantes validan en dominio |
| **Aplicación** | 🟢 VERDE | `RegistrarLecturaSensorCommand` reutilizado tal cual |
| **Infraestructura** | 🟢 VERDE (obs. AMARILLA leve) | Factory de event bus correcta (lru_cache + wire_all idempotente, import diferido sin acoplamiento); observación: duplicidad de `MAX_SENSOR_ID_LENGTH=50` |
| **Testing** | 🟢 VERDE | 17 casos + 60/60; cierra los hallazgos de F1.1 como tests permanentes |
| **Frontend** | 🟢 VERDE (fuera de delta) | No hubo cambios F1; ya LIVE-ready desde RC-2 |

---

## RESULTADO

# ✅ **GO CON CONDICIONES** (para commit F1)

No hay bloqueantes funcionales ni de arquitectura. Condiciones de staging y mejoras menores:

### Condición 1 — STAGING LIMPIO (requerido antes del commit)
- **NO incluir `src/frontend/src/pages/Dashboard.jsx`** en el commit F1: su diff pendiente corresponde a RC-2/UX sin commitear, **no** a F1. Mezclarlos contamina el commit y rompe el criterio "un commit, un alcance".
- Commit F1 recomendado: `api/urls.py`, `api/views.py`, `dependencies.py`, `test_telemetry_ingest_v3_view.py`, + los docs F1 no commiteados (`F1_FIRST_REAL_SENSOR`, `BBB_TELEMETRY_READINESS`, `BBB03_DEPLOYMENT_GUIDE`, `BBB03_EXECUTION_PLAYBOOK`) si Bernardo decide incluirlos en el mismo alcance (los 2 docs IA/ML del sesión anterior son alcance distinto).

### Condición 2 — OBSERVACIONES DE MEJORA (no bloqueantes, NO en este commit)
1. Unificar la restricción de longitud de `sensor_id`: mover `max_length=50` al VO `SensorId` (o derivar del modelo) para que dominio y persistencia coincidan y la vista no duplique conocimiento.
2. No exponer `detail: str(exc)` en la respuesta `storage_error` cuando haya plan de producción (mantenerlo en log).
3. (Opcional) Envolver al envelope las excepciones DRF distintas de `ParseError` para un contrato 100% uniforme.

### Condición 3 — RECORDATORIO DE GOBERNANZA
- `AllowAny` + sin throttling/dedup/HTTPS son **límites operativos deliberados** de F1 (documentados); dejar constancia en el mensaje de commit para que la revisión de RC conozca el perímetro.
- Ejecutar la suite completa antes de commit y dejar el resultado anotado.

**Verificación sintáctica del delta (local):** `py_compile` OK en los 4 archivos backend. Balance del test: la única llave desbalanceada es un literal dentro de un string JSON truncado de un test (falso positivo del regex de balance, confirmado por py_compile). Runtime 60/60 y stress ya validados en la sesión F1/F1.1.

**Veredicto final:** la implementación F1 es digna del RC, respeta DDD/Hexagonal, reutiliza comando y puerto sin tocar el núcleo, y está correctamente caracterizada por tests. **GO CON CONDICIONES** para commit, siendo la condición real **el staging limpio (excluir Dashboard.jsx)**.