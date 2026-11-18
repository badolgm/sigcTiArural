# ARCHITECTURE_AUDIT_VALIDATION.md — Validación de hallazgos

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: ARCHITECTURE_AUDIT_VALIDATION.md
> - Destino: docs/architecture/ARCHITECTURE_AUDIT_VALIDATION.md

**Rama:** `toshiba/architecture-audit`
**Fecha:** 2026-11-04
**Alcance:** hallazgos Críticos (C-01..C-05) y Altos (A-01..A-08) de `ARCHITECTURE_AUDIT.md`.
**Método:** verificación directa con archivos, líneas y ejecución en contenedor. Sin modificar código.

---

## Críticos

### C-01 — Duplicación exacta de dominio (`core` vs `contexts/telemetry`)

- **Archivos:** `src/backend/core/domain/entities/sensor_reading.py`, `src/backend/contexts/telemetry/domain/entities/sensor_reading.py`, `src/backend/core/domain/value_objects/{temperature,humidity,sensor_id}.py`, `src/backend/contexts/telemetry/domain/value_objects/{temperature,humidity,sensor_id}.py`, `src/backend/core/domain/exceptions/domain_exceptions.py`, `src/backend/contexts/telemetry/domain/exceptions/domain_exceptions.py`.
- **Evidencia:** hash SHA-256 idéntico para `sensor_reading.py`, `temperature.py`, `humidity.py`, `sensor_id.py`, `domain_exceptions.py`. Comparación de árboles: `entities/`, `value_objects/`, `exceptions/` → IDENTICAL; `strategies/`, `services/`, `factories/` solo existen en `core/` (NO COUNTERPART en contexts).
- **Impacto real:** el dominio de telemetría existe dos veces; solo la parte común es idéntica, el resto (estrategias, servicios, factories) solo vive en `core/`. Cualquier cambio en la parte común debe hacerse en dos lugares.
- **Clasificación:** **CONFIRMADO** (parcial: la identidad exacta aplica solo a entidades/VOs/excepciones; strategies/services/factories solo en `core`).

### C-02 — Composition root no conectado al arranque

- **Archivos:** `src/backend/sigct_backend/wiring.py` (define `wire_all`), `src/backend/sigct_backend/wsgi.py`, `src/backend/sigct_backend/settings.py`. No existe `asgi.py` ni `apps.py`.
- **Evidencia:** `grep wire_all` solo aparece en `wiring.py`, `contexts/telemetry/infrastructure/config/dependencies.py` (vía `get_telemetry_event_bus`), `verify_dia16_17_pilot.py` y tests. `wsgi.py` y `settings.py` no referencian `wiring` ni `event_bus`.
- **Impacto real:** el EventBus solo se cablea si alguien invoca `get_telemetry_event_bus()` (que internamente llama `wire_all`). En producción (gunicorn + wsgi) el bus puede no estar cableado salvo que un request dispare esa dependencia. La interconexión Telemetry→Labs no está garantizada al arranque.
- **Clasificación:** **CONFIRMADO**.

### C-03 — Endpoints v3 registrados con `try/except ImportError` silencioso

- **Archivos:** `src/backend/api/urls.py` líneas 30-42; `src/backend/api/views.py` líneas 70-100 (`HEXAGONAL_V3_AVAILABLE`).
- **Evidencia:** `urls.py` envuelve los imports en `try/except ImportError: pass`. En el contenedor real, `HEXAGONAL_V3_AVAILABLE = True` y `AI_INFERENCE_V3_AVAILABLE = True` (verificado vía `manage.py shell`), por lo que los endpoints v3 **sí están registrados** hoy.
- **Impacto real:** mecanismo frágil y silencioso; hoy funcional, pero cualquier rotura de import desactivaría v3 sin log. Riesgo latente, no fallo actual.
- **Clasificación:** **PARCIAL** (mecanismo real y riesgoso, pero actualmente operativo).

### C-04 — `readRobotStatus()` hardcodea estado ROTO

- **Archivo:** `src/frontend/src/services/cmscAdapters.js` líneas 110-117.
- **Evidencia:**
  ```
  export function readRobotStatus() {
    return { ok: false, estado: 'ROTO', signalId: 'S50',
      nota: 'El cliente de robótica apunta a localhost:8000; el backend real vive en 8010...' };
  }
  ```
  Invocado en `readLiveSignals()` línea 126 (`Promise.resolve(readRobotStatus())`).
- **Impacto real:** el dashboard CMSC declara robótica permanentemente ROTA; la telemetría de robots no se surface. Es una decisión documentada (honestidad de estado), pero bloquea la funcionalidad de robótica en el dashboard.
- **Clasificación:** **CONFIRMADO** (comportamiento intencional/documentado, pero limitación real).

### C-05 — Frontend sin tests

- **Evidencia:** `Get-ChildItem src/frontend -Recurse -File | Where Name -match '\.(test|spec)\.'` → 0 archivos. `src/frontend/package.json` no define script `test`.
- **Impacto real:** sin red de seguridad para refactor del frontend; cualquier cambio en componentes gigantes es de alto riesgo.
- **Clasificación:** **CONFIRMADO**.

---

## Altos

### A-01 — Tres implementaciones paralelas de estrategias de laboratorio

- **Archivos:**
  - `src/backend/api/logic/domain/{agricultura,electronica,robotica,telecom}.py`
  - `src/backend/core/domain/strategies/{agriculture,electronics,robotics,telecom}_strategy.py`
  - `src/backend/contexts/labs/domain/strategies/{agricultura,electronica,robotica,telecom}.py`
- **Evidencia:** `api/logic/domain/robotica.py` y `contexts/labs/.../robotica.py` son idénticos salvo import (`ProcesadorLaboratorioStrategy`); `agricultura.py` idéntico salvo import (`from .base` vs `from .interfaces`). `core/` usa base `LabStrategy` y nombres en inglés, pero misma lógica.
- **Impacto real:** duplicación de lógica de simulación; divergencia silenciosa si se modifica solo una.
- **Clasificación:** **CONFIRMADO**.

### A-02 — Dos sistemas de DI con comportamiento distinto

- **Archivos:** `src/backend/infrastructure/config/dependencies.py` (siempre `DjangoSensorReadingRepository`) vs `src/backend/contexts/telemetry/infrastructure/config/dependencies.py` (InMemory si `settings.TESTING`).
- **Evidencia:** primer módulo no considera `TESTING`; segundo sí. Ambos exponen `get_sensor_reading_repository()` con firmas compatibles pero semántica distinta.
- **Impacto real:** tests pueden usar un repositorio distinto al de producción sin que el código lo declare; confusión sobre cuál es el canónico.
- **Clasificación:** **CONFIRMADO**.

### A-03 — God components en frontend

- **Archivos:** `src/frontend/src/labs/SchematicEditor.jsx` (1788 líneas), `ElectronicsLab.jsx` (1266), `AdvancedMathLabV2.jsx` (1100).
- **Evidencia:** medición directa de líneas.
- **Impacto real:** baja mantenibilidad, alto riesgo de regresión, difícil de testear.
- **Clasificación:** **CONFIRMADO**.

### A-04 — `api/views.py` mega-módulo

- **Archivo:** `src/backend/api/views.py` (434 líneas).
- **Evidencia:** contiene V1 (RobotViewSet, RobotTelemetryViewSet, RobotCommandViewSet), V2 (TelemetryHistoryView, TelemetryHistoryV2View, AICropAdviceView) y V3 (TelemetryHistoryV3View, AICropAdviceV3View, TelemetryIngestV3View, AIInferenceV3View) en un solo archivo.
- **Impacto real:** violación de SRP; mezcla versiones y arquitecturas.
- **Clasificación:** **CONFIRMADO**.

### A-05 — Vistas V2 instancian adaptadores concretos

- **Archivo:** `src/backend/api/views.py` líneas 459-460.
- **Evidencia:**
  ```
  self.ai_adapter = FastAPI_AIAdapter()
  self.repository = DjangoRepository()
  ```
- **Impacto real:** violación de DIP; no se puede sustituir adaptador sin modificar la vista.
- **Clasificación:** **CONFIRMADO**.

### A-06 — `cloud.js` hardcodea URLs de producción

- **Archivo:** `src/frontend/src/services/cloud.js` líneas 8-11.
- **Evidencia:** `'https://sigct-backend.onrender.com/health'`, `'https://sigct-backend.onrender.com/api/health'`, `'https://api.sigct-rural.com/api/health/'`.
- **Impacto real:** build acoplado a infraestructura externa; no portable a otros entornos sin rebuild.
- **Clasificación:** **CONFIRMADO**.

### A-07 — Persistencia duplicada (solo imports distintos)

- **Archivos:** `src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py` y `src/backend/contexts/telemetry/infrastructure/persistence/django/django_sensor_reading_repository.py`.
- **Evidencia:** comparación excluyendo líneas `from/import` → IDENTICAL.
- **Impacto real:** doble mantenimiento; cambio en uno no se propaga automáticamente.
- **Clasificación:** **CONFIRMADO**.

### A-08 — `api/logic` y `contexts` coexisten sin deprecación

- **Evidencia:** `grep api.logic` encuentra usos en `contexts/telemetry/infrastructure/compat/legacy_sensor_reading_adapter.py`, `contexts/labs/domain/services/laboratorio_service.py`, tests y `tests/conftest.py`. No hay marcador de deprecación en `api/logic`.
- **Impacto real:** la migración V2→V3 está a medio camino; `api/logic` sigue siendo dependencia activa.
- **Clasificación:** **CONFIRMADO**.

---

## Resumen de clasificación

| ID | Clasificación |
|---|---|
| C-01 | CONFIRMADO (parcial) |
| C-02 | CONFIRMADO |
| C-03 | PARCIAL |
| C-04 | CONFIRMADO |
| C-05 | CONFIRMADO |
| A-01 | CONFIRMADO |
| A-02 | CONFIRMADO |
| A-03 | CONFIRMADO |
| A-04 | CONFIRMADO |
| A-05 | CONFIRMADO |
| A-06 | CONFIRMADO |
| A-07 | CONFIRMADO |
| A-08 | CONFIRMADO |

**Falsos positivos:** 0.
**Parciales:** 1 (C-03).
**Confirmados:** 12.

**Nota:** C-03 y C-04 son comportamientos intencionales/documentados (honestidad de estado y slice v1), pero representan limitaciones reales del sistema actual. Ningún hallazgo fue refutado.