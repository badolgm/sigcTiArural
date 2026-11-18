# ARCHITECTURE_ACTION_MATRIX.md — SIGC&T Rural

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: ARCHITECTURE_ACTION_MATRIX.md
> - Destino: docs/architecture/ARCHITECTURE_ACTION_MATRIX.md

**Rama:** `toshiba/architecture-audit`
**Fuentes:** `ARCHITECTURE_AUDIT.md` + `ARCHITECTURE_AUDIT_VALIDATION.md` + `ARCHITECTURE_GOVERNANCE_REVIEW.md`
**Fecha:** 2026-11-04
**Estado del sistema:** Operativo (Docker, PostgreSQL, Backend, Frontend, AI Service)

---

## Objetivo

Convertir los 13 hallazgos de arquitectura validados en un backlog técnico accionable, clasificado por categoría de acción.

**Regla:** No se corrige nada. No se genera nueva auditoría. No se modifica código. Este documento es solo planificación.

---

## Categorías de acción

| Categoría | Significado |
|---|---|
| **CRITICAL** | Afecta estabilidad, integridad de datos o operación en producción. Requiere atención inmediata. |
| **HIGH PRIORITY** | Afecta funcionalidad, confiabilidad o superficie API. Requiere atención pronto. |
| **MEDIUM TERM** | Afecta mantenibilidad y deuda técnica. Se programa para el mediano plazo. |
| **FUTURE REFACTOR** | Mejora de diseño sin impacto operativo inmediato. Se deja para un ciclo de refactor futuro. |
| **NO ACTION** | Conocido, documentado y aceptado; no requiere cambio de código. |

---

## Matriz de acciones

### CRITICAL

| ID | Hallazgo | Archivos clave | Líneas | Impacto real | Riesgo real | Complejidad |
|---|---|---|---|---|---|---|
| C-01 | Duplicación exacta de dominio (`core/` vs `contexts/telemetry/`) | `src/backend/core/domain/entities/sensor_reading.py` <br> `src/backend/contexts/telemetry/domain/entities/sensor_reading.py` <br> `src/backend/core/domain/value_objects/{temperature,humidity,sensor_id}.py` <br> `src/backend/contexts/telemetry/domain/value_objects/{temperature,humidity,sensor_id}.py` | Hash SHA-256 idéntico en entidades y VOs | Dos copias del dominio de telemetría; cambios en una no se propagan a la otra | Divergencia silenciosa de datos de negocio; inconsistencia entre capas | Alta |
| C-02 | Composition root no conectado al arranque | `src/backend/sigct_backend/wiring.py` <br> `src/backend/sigct_backend/wsgi.py` <br> `src/backend/sigct_backend/settings.py` | Docstring de `wiring.py`: "Deliberadamente NO se invoca todavía desde wsgi/asgi/settings" | EventBus puede no estar cableado en producción (gunicorn + wsgi) | Interconexión Telemetry → Labs inoperante; señal `sensor_reading` no llega a `OnSensorReadingHandler` | Media |

### HIGH PRIORITY

| ID | Hallazgo | Archivos clave | Líneas | Impacto real | Riesgo real | Complejidad |
|---|---|---|---|---|---|---|
| C-03 | Endpoints v3 registrados con `try/except ImportError` silencioso | `src/backend/api/urls.py` <br> `src/backend/api/views.py` | urls.py: 30-42; views.py: 70-100 (`HEXAGONAL_V3_AVAILABLE`) | Superficie API v3 puede desactivarse sin log si un import falla | Pérdida silenciosa de endpoints v3 en futuros deploys | Media |
| C-04 | `readRobotStatus()` hardcodea estado ROTO | `src/frontend/src/services/cmscAdapters.js` | 110-117 | Robótica declarada permanentemente ROTA en dashboard CMSC | Telemetría de robots inaccesible desde el frontend; percepción de sistema incompleto | Media |
| C-05 | Frontend sin tests | `src/frontend/` | 0 archivos `*.test.*` / `*.spec.*` | Sin red de seguridad para refactor de componentes gigantes | Regresiones silenciosas en cambios de UI; acoplado con A-03 | Media |
| A-01 | Tres implementaciones paralelas de estrategias de laboratorio | `src/backend/api/logic/domain/*` <br> `src/backend/core/domain/strategies/*` <br> `src/backend/contexts/labs/domain/strategies/*` | `robotica.py`, `agricultura.py`, `electronica.py`, `telecom.py` en 3 ubicaciones | Lógica de simulación triplicada con bases de clase distintas | Divergencia de comportamiento; confusión sobre capa canónica | Alta |

### MEDIUM TERM

| ID | Hallazgo | Archivos clave | Líneas | Impacto real | Riesgo real | Complejidad |
|---|---|---|---|---|---|---|
| A-02 | Dos sistemas de DI con comportamiento distinto | `src/backend/infrastructure/config/dependencies.py` <br> `src/backend/contexts/telemetry/infrastructure/config/dependencies.py` | dependencies.py de ambos módulos | Tests pueden usar repositorio distinto al de producción | Inconsistencia entorno prueba vs producción; confusión sobre composition root canónico | Media |
| A-03 | God components en frontend | `src/frontend/src/labs/SchematicEditor.jsx` <br> `src/frontend/src/labs/ElectronicsLab.jsx` <br> `src/frontend/src/labs/AdvancedMathLabV2.jsx` | 1788 / 1266 / 1100 líneas | Baja mantenibilidad; difícil de testear y entender | Cambios pueden romper funcionalidad no relacionada (agravado por C-05) | Alta |
| A-07 | Persistencia duplicada (solo imports distintos) | `src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py` <br> `src/backend/contexts/telemetry/infrastructure/persistence/django/django_sensor_reading_repository.py` | Ambos archivos; cuerpo IDÉNTICO excluyendo imports | Doble mantenimiento de repositorio Django | Cambio en uno no se propaga al otro | Media |
| A-08 | `api/logic` y `contexts` coexisten sin deprecación | `src/backend/api/logic/` <br> `src/backend/contexts/` | Usos activos en conftest.py, tests, adaptadores legacy | Migración V1→V2→V3 a medio camino; `api/logic` sigue activo sin marcador de deprecación | Confusión sobre capa para nuevo código; deuda de migración acumulada | Alta |

### FUTURE REFACTOR

| ID | Hallazgo | Archivos clave | Líneas | Impacto real | Riesgo real | Complejidad |
|---|---|---|---|---|---|---|
| A-04 | `api/views.py` mega-módulo | `src/backend/api/views.py` | 434 líneas; mezcla V1, V2, V3 | Violación de SRP; capas de versión mezcladas | Difícil de mantener y testear; acoplamiento entre versiones | Media |
| A-05 | Vistas V2 instancian adaptadores concretos | `src/backend/api/views.py` | 459-460 (`FastAPI_AIAdapter()`, `DjangoRepository()`) | Violación de DIP; vistas dependen de implementaciones concretas | Difícil sustituir adaptadores sin modificar la vista | Media |
| A-06 | `cloud.js` hardcodea URLs de producción | `src/frontend/src/services/cloud.js` | 8-11 (`https://sigct-backend.onrender.com/...`) | Build acoplado a infraestructura externa | Fallos en entornos no Render; dependencia de red externa | Baja |

### NO ACTION

Ninguno. Todos los 13 hallazgos validados requieren alguna forma de acción futura; ninguno está en estado de "aceptado sin acción".

---

## Resumen por categoría

| Categoría | Cantidad | Hallazgos |
|---|---|---|
| CRITICAL | 2 | C-01, C-02 |
| HIGH PRIORITY | 4 | C-03, C-04, C-05, A-01 |
| MEDIUM TERM | 4 | A-02, A-03, A-07, A-08 |
| FUTURE REFACTOR | 3 | A-04, A-05, A-06 |
| NO ACTION | 0 | — |

---

## Secuencia sugerida de ejecución

1. **CRITICAL (inmediato):** C-02 (conectar `wire_all` al arranque), C-01 (consolidar dominio duplicado).
2. **HIGH PRIORITY (próximo):** C-03 (fallo rápido en imports v3), C-04 (puerto/cliente robótica), C-05 (tests frontend), A-01 (consolidar estrategias).
3. **MEDIUM TERM (mediano plazo):** A-02 (unificar DI), A-07 (eliminar persistencia duplicada), A-08 (deprecación `api/logic`), A-03 (descomponer god components).
4. **FUTURE REFACTOR (ciclo futuro):** A-04 (separar views por versión), A-05 (inyección de dependencias en vistas V2), A-06 (variables de entorno para URLs).

---

**Fin de la matriz de acciones. No se modificó código. No hay commits, pushes ni merges.**