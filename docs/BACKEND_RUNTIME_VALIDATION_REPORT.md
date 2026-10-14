# BACKEND_RUNTIME_VALIDATION_REPORT

**Misión:** `BACKEND_RUNTIME_VALIDATION`
**Fecha:** 2026-10-12 (America/Bogota)
**Objetivo:** cerrar **B-3** (`wire_all()`), **B-4** (`/api/v3/*`) y **RF-5** (fallback silencioso).
**Naturaleza:** validación de runtime. **Sin modificar código · sin commits · sin push.**

**Entorno:** `sigctiarural_backend` (Django 4.2.30) levantado con `docker compose up -d backend`, `0.0.0.0:8010->8000`. Al terminar se **detuvo** y se limpiaron las 2 filas de prueba (ver §6). DB restaurada a **0 filas**.

---

## 1. Cómo arranca realmente Django

- `manage.py` / `wsgi.py` fijan `DJANGO_SETTINGS_MODULE=sigct_backend.settings` y llaman `get_wsgi_application()`.
- Arranque real = `python manage.py runserver 0.0.0.0:8000` (CMD del `Dockerfile`). **No hay `AppConfig.ready()`**: no existe ningún `apps.py` en el árbol.
- `INSTALLED_APPS` (settings.py:51): `django.contrib.*` + `rest_framework` + `corsheaders` + **`api`** + **`users`**. `users/` contiene **solo `__init__.py`** (RF-4: app sin código/modelos).
- Enrutado: `sigct_backend/urls.py` → `api/urls.py`, que monta **V1** (`DefaultRouter`: robots/telemetry/commands + auth), **V2** (`v2/telemetry/history`, `v2/ai/crop-advice`) y **V3** dentro de `try/except ImportError`.
- **No hay hook de arranque que cablee el bus** (ni `ready()`, ni `wsgi`/`asgi`/`settings`).

## 2. ¿Se ejecuta `wire_all()`? (B-3)

**NO en el arranque. SÍ de forma diferida (lazy), en el primer POST de ingesta.**

- `wire_all` solo se invoca en `contexts/telemetry/infrastructure/config/dependencies.py:42`, dentro de `get_telemetry_event_bus()` (decorado `@lru_cache(maxsize=1)`).
- `get_telemetry_event_bus()` solo se usa en `TelemetryIngestV3View.post` ⇒ **el bus se construye y cablea en la 1ª petición a `POST /api/v3/telemetry/readings/`**, no al boot.
- **Prueba runtime (end-to-end):** tras un POST con `temperature=40, humidity=20` (umbral crítico), el log del contenedor mostró la alerta emitida por `OnSensorReadingHandler` → `LaboratorioService(AGRICULTURA)` → `ConsoleNotificationAdapter`:

  ```
  🔔 [ALERTA ALTA]: ALERTA S.O.S RURAL: Estrés Hídrico/Térmico Crítico - ...
  ```

  Esto **confirma** que el bus quedó cableado (Telemetry publica `sensor_reading` → Labs lo recibe).

## 3. ¿`/api/v3/*` usa `contexts/*` o `core/*`? (B-4)

**AMBOS (mezcla). Confirmado en código y en runtime.**

| Endpoint | Implementación servida | Capa |
|---|---|---|
| `GET /api/v3/telemetry/history/` | `core.domain.services.LabService` + `infrastructure.config.dependencies.get_sensor_reading_repository` | **LEGACY (core/infrastructure)** |
| `GET /api/v3/ai/crop-advice/` | `infrastructure` repo + `get_ai_service` | **LEGACY (core/infrastructure)** |
| `POST /api/v3/ai/inference/` | `infrastructure` ai adapter + `SemanticPredictionResolver` | **LEGACY (core/infrastructure)** |
| `POST /api/v3/telemetry/readings/` | `contexts.telemetry` (`RegistrarLecturaSensorCommand` + repo de contexto + `get_telemetry_event_bus`) | **NUEVA (contexts)** |

Evidencia runtime:
- `GET /api/v3/telemetry/history/` → `200`, `source_mode:"simulated"`, `sensor_id:"Simulado (Domain v2)"` (**core**).
- `GET /api/v3/ai/crop-advice/` → `404 {"error":"No hay datos..."}` (ruta **existe**; **core**).
- `POST /api/v3/telemetry/readings/` → `201`, `source_mode:"live"`, `reading_id:1208` (**contexts**).
- Cross-check de persistencia compartida: el `GET history` (repo de **core/infrastructure**) devolvió la lectura escrita por el POST (repo de **contexts**) → ambos leen/escriben `api.models.SensorReading`.

> **Conclusión B-4:** `/api/v3/*` **mezcla** dos arquitecturas — consultas/IA por `core`+`infrastructure`; ingesta por `contexts`. Confirma el riesgo **R-4** y que V3 no es "contexts-only".

## 4. Qué fallback se activa (RF-5)

**Dos capas de fallback SILENCIOSO (peligro) + un fallback EXPLÍCITO (honesto):**

1. **`api/views.py:71-99`** — `try: <imports de core/infrastructure/contexts> except ImportError: HEXAGONAL_V3_AVAILABLE=False` (y análogo `AI_INFERENCE_V3_AVAILABLE`). Si falla **cualquier** import del bloque, las clases V3 **nunca se definen**.
2. **`api/urls.py:30-46`** — `try: from .views import ...V3View ... except ImportError: pass`. Si las clases no existen, las rutas **no se registran** → `/api/v3/*` responde **404** sin warning ni log. Indistinguible de "ruta inexistente". **Este es el fallback silencioso de RF-5.**
3. **Explícito (no silencioso):** `TelemetryIngestV3View` devuelve `source_mode:"fallback"` con `400 invalid_payload` o `500 storage_error` — aquí la degradación es **declarada** (honestidad de estado).

**Estado actual verificado:** `HEXAGONAL_V3_AVAILABLE = True` (los tres endpoints V3 respondieron 200/201/404-con-cuerpo, no 404-de-ruta).

## 5. Riesgos

| # | Riesgo | Sev. | Detalle |
|---|---|---|---|
| RF-5 | **Fallback silencioso** `try/except ImportError` (2 capas) | 🟠 | Un error de import/config borra `/api/v3/*` como **404 mudo**. No hay log ni health-check que lo detecte. |
| B-4 / R-4 | V3 mezcla `core` y `contexts` | 🟠 | Consultas/IA en legacy, ingesta en contexts. Retirar `core` (R2/R5b) **rompe** history/advice/inference. |
| B-3 | `wire_all()` diferido, no en arranque | 🟡 | Solo cablea al 1er ingest. Si otro consumidor construye el bus sin `get_telemetry_event_bus()`, podría no quedar cableado. |
| R-2 | `laboratorio_service.py:9` importa `api.logic` (**import muerto**) | 🔴 | Funciona porque `api.logic` existe; **R3** (retirar `api/logic`) lo rompería. |
| R-3 | `contexts/telemetry` acoplado directo a `api.models` | 🟠 | Aceptado, pero duplicado con `core`+`infrastructure`. |
| RF-4 | `users` en `INSTALLED_APPS` sin código | 🟡 | App fantasma. |

## 6. Evidencia (comandos y resultados)

- `docker compose up -d backend` → `Up ... 0.0.0.0:8010->8000/tcp`; logs: `System check identified no issues`, `Django version 4.2.30`.
- `GET /api/v3/telemetry/history/?tipo=ROBOTICA` → **200**, `source_mode:"simulated"`.
- `GET /api/v3/ai/crop-advice/` → **404** con cuerpo JSON (ruta existe).
- `POST /api/v3/telemetry/readings/` (válido) → **201**, `source_mode:"live"`, `reading_id:1208`.
- `GET /api/v3/telemetry/history/` tras el POST → **200**, `source_mode:"live"`, `count:1` (persistencia compartida).
- `POST` crítico (40/20) → **201** + log `🔔 [ALERTA ALTA]: ALERTA S.O.S RURAL...` (prueba de `wire_all` + bus).
- **Limpieza:** `DELETE FROM api_sensorreading WHERE sensor_id IN ('BRT-01','BRT-ALERT')` → tabla restaurada a **0 filas**; `docker compose stop backend` → backend detenido (estado previo).

> **Impacto en datos:** se crearon 2 filas de prueba (`BRT-01`, `BRT-ALERT`) durante la validación y **se eliminaron**; la BD queda en **0 filas**, idéntica a antes. No se tocó código ni migraciones.

---

## Dictamen

**B-3, B-4 y RF-5: CERRADOS (validados con evidencia de runtime).**

- **B-3** — `wire_all()` **no** corre en el arranque; corre **lazy** en el 1er `POST /api/v3/telemetry/readings/`. Probado end-to-end (alerta impresa).
- **B-4** — `/api/v3/*` usa **`core`+`infrastructure`** para history/advice/inference y **`contexts.telemetry`** para ingest. Mezcla confirmada (R-4).
- **RF-5** — **dos** capas de fallback silencioso (`views.py` + `urls.py`) que pueden convertir `/api/v3/*` en 404 mudo; más un fallback explícito honesto en ingest.

> **Cierre = validado/caracterizado con evidencia**, NO "corregido". Cambiar el comportamiento (cablear `wire_all` en arranque, eliminar el fallback silencioso, unificar V3) es **código** y queda fuera de esta misión.

**Sin modificar código · sin commits · sin push.**
*Bernardo Adolfo Gómez Montoya — 2026*
