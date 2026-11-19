# TOSHIBA_AUDIT_SPRINT_CLOSURE.md — SIGC&T Rural

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: TOSHIBA_AUDIT_SPRINT_CLOSURE.md
> - Destino: docs/historical/TOSHIBA_AUDIT_SPRINT_CLOSURE.md

**Repositorio:** sigcTiArural  
**Rama:** `toshiba/architecture-audit`  
**Fecha de cierre:** 2026-11-04  
**Estado del sistema al cierre:** Operativo (Docker, PostgreSQL, Backend, Frontend, AI Service)  
**Sprint de auditoría:** COMPLETO

---

## 1. Resumen ejecutivo

El Sprint de Auditoría Toshiba se cierra formalmente sin haber modificado código, sin commits, sin push y sin merge. El objetivo era convertir el estado de arquitectura del repositorio en un backlog técnico utilizable para decisiones de gobernanza posteriores.

Se auditarón los hallazgos de arquitectura previamente documentados en `ARCHITECTURE_AUDIT.md`, se validó cada uno contra el código real (archivos, líneas, hashes, ejecución en contenedor) y se clasificó en gobernanza y matriz de acción.

**Resultado final:** 12 hallazgos confirmados · 1 hallazgo parcial · 0 falsos positivos.

**Clasificación final:**

| Categoría | Cantidad | Hallazgos |
|---|---|---|
| CRITICAL | 2 | C-01, C-02 |
| HIGH PRIORITY | 4 | C-03, C-04, C-05, A-01 |
| MEDIUM TERM | 4 | A-02, A-03, A-07, A-08 |
| FUTURE REFACTOR | 3 | A-04, A-05, A-06 |

**Decisión de ingeniería (ARCHITECTURE_ACTION_REVIEW.md):**

| Decisión | Cantidad | Hallazgos |
|---|---|---|
| PLAN_NEXT_SPRINT | 4 | C-02, C-03, C-04, C-05 |
| ACCEPT_TECHNICAL_DEBT | 2 | C-01, A-01 |
| ACT_NOW | 0 | — |
| NO_ACTION | 0 | — |

---

## 2. Qué se auditó

Se audita la arquitectura de backend y frontend del repositorio `sigcTiArural` (rama `feature/cmsc-f3c-v1-implementation`, ahora `toshiba/architecture-audit`), sin incluir `vendor/` ni `node_modules`.

**Áreas cubiertas:**
- Estructura de directorios backend (`src/backend/`): 172 archivos Python (~5.2 kLOC sin migraciones ni tests)
- Estructura de directorios frontend (`src/frontend/src/`): 89 archivos JS/JSX (~16.8 kLOC)
- AI service (`src/ai_models/`): 6 archivos Python (~1.1 kLOC)
- `docker-compose.yml`, Dockerfiles, `.env.example`
- Documentación canónica: `README.md`, `docs/MASTERDOC.md`, `docs/HEXAGONAL_REFACTOR_PLAN.md`, `AGENTS.md`, docstrings de código, runbooks y bitácoras

**Dimensiones de análisis:** DDD, Hexagonal (Ports & Adapters), SOLID, POO, Bounded Contexts, dependencias, acoplamientos, código duplicado y deuda técnica.

---

## 3. Qué se validó

Cada hallazgo de `ARCHITECTURE_AUDIT.md` se verificó directamente contra el código y el entorno en ejecución:

| Hallazgo | Método de validación | Resultado |
|---|---|---|
| C-01 | Comparación hash SHA-256 de `core/domain/` vs `contexts/telemetry/domain/` | Entidades, VOs y excepciones IDÉNTICAS; strategies/services/factories solo en `core/` |
| C-02 | Búsqueda de `wire_all` en `wsgi.py`, `settings.py`, `apps.py` | No invocado en arranque; docstring de `wiring.py` lo confirma |
| C-03 | Lectura de `api/urls.py` (try/except ImportError) y ejecución en contenedor (`HEXAGONAL_V3_AVAILABLE = True`) | Mecanismo frágil pero actualmente operativo |
| C-04 | Lectura de `cmscAdapters.js` líneas 110-117 (`readRobotStatus` retorna `estado: 'ROTO'`) | Confirmado; funcionalidad de robótica bloqueada en dashboard CMSC |
| C-05 | Conteo de archivos `*.test.*` / `*.spec.*` en `src/frontend/` | 0 archivos; sin script `test` en `package.json` |
| A-01 | Comparación de `api/logic/domain/*`, `core/domain/strategies/*`, `contexts/labs/domain/strategies/*` | 3 implementaciones paralelas con bases distintas |
| A-02 | Lectura de `infrastructure/config/dependencies.py` vs `contexts/telemetry/infrastructure/config/dependencies.py` | Dos sistemas de DI con comportamiento distinto (TESTING) |
| A-03 | Medición de LOC de componentes frontend | SchematicEditor 1788, ElectronicsLab 1266, AdvancedMathLabV2 1100 |
| A-04 | Lectura de `api/views.py` (434 líneas, mezcla V1/V2/V3) | Confirmado |
| A-05 | Lectura de `api/views.py` líneas 459-460 (instanciación directa de adaptadores) | Confirmado |
| A-06 | Lectura de `cloud.js` líneas 8-11 (URLs hardcodeadas de Render) | Confirmado |
| A-07 | Comparación de los dos `django_sensor_reading_repository.py` excluyendo imports | Cuerpo IDÉNTICO |
| A-08 | Búsqueda de usos de `api.logic` en conftest, tests y adaptadores | Dependencia activa sin deprecación |

**Resultado:** 12 hallazgos confirmados, 1 parcial (C-03: mecanismo riesgoso pero actualmente funcional), 0 falsos positivos.

---

## 4. Qué se confirmó

Se confirmó que todos los hallazgos permanecen vigentes en el estado actual del sistema:

1. **C-01:** Dominio de telemetría duplicado byte-a-byte entre `core/` y `contexts/telemetry/`.
2. **C-02:** Composition root (`wiring.py`) no conectado al arranque de Django.
3. **C-03:** Endpoints V3 registrados con `try/except ImportError` silencioso.
4. **C-04:** `readRobotStatus()` hardcodeado como ROTO en el frontend.
5. **C-05:** Frontend sin tests automatizados.
6. **A-01:** Tres implementaciones paralelas de estrategias de laboratorio.
7. **A-02:** Dos sistemas de inyección de dependencias con comportamiento distinto.
8. **A-03:** God components en frontend (>1000 LOC).
9. **A-04:** `api/views.py` mega-módulo que mezcla V1/V2/V3.
10. **A-05:** Vistas V2 instancian adaptadores concretos en lugar de inyectar puertos.
11. **A-06:** `cloud.js` hardcodea URLs de producción de Render.
12. **A-07:** Persistencia duplicada (dos repositorios Django idénticos, solo imports distintos).
13. **A-08:** `api/logic` y `contexts` coexisten sin fecha de remoción ni deprecación.

---

## 5. Qué NO requiere acción

Ninguno de los 13 hallazgos validados está en estado de "no acción". Todos requieren alguna forma de atención futura (planificar o aceptar deuda técnica).

No se identificó ningún hallazgo obsoleto ni resuelto. El sistema operativo actual no tiene fallos críticos bloqueantes derivados de estos hallazgos.

---

## 6. Hallazgos CRITICAL

### C-01 — Duplicación exacta de dominio (core vs telemetry)

- **Archivos:** `src/backend/core/domain/entities/sensor_reading.py`, `src/backend/contexts/telemetry/domain/entities/sensor_reading.py`, `src/backend/core/domain/value_objects/{temperature,humidity,sensor_id}.py`, `src/backend/contexts/telemetry/domain/value_objects/{temperature,humidity,sensor_id}.py`
- **Evidencia:** Hash SHA-256 idéntico en entidades y value objects.
- **Impacto real:** Dos copias del dominio de telemetría; cambios en una no se propagan a la otra.
- **Riesgo real:** Divergencia silenciosa de datos de negocio si se modifica solo una copia.
- **Complejidad:** Alta.
- **Decisión:** ACCEPT_TECHNICAL_DEBT (ciclo de refactor futuro).

### C-02 — Composition Root no conectado al arranque

- **Archivos:** `src/backend/sigct_backend/wiring.py`, `src/backend/sigct_backend/wsgi.py`, `src/backend/sigct_backend/settings.py`
- **Evidencia:** Docstring de `wiring.py`: "Deliberadamente NO se invoca todavía desde wsgi/asgi/settings". `grep wire_all` no aparece en archivos de arranque.
- **Impacto real:** El EventBus puede no estar cableado en producción; la interconexión Telemetry → Labs puede quedar inoperante.
- **Riesgo real:** Medio. Señal `sensor_reading` no llega garantizada a `OnSensorReadingHandler`.
- **Complejidad:** Media.
- **Decisión:** PLAN_NEXT_SPRINT.

---

## 7. Hallazgos HIGH PRIORITY

### C-03 — Imports silenciosos V3

- **Archivos:** `src/backend/api/urls.py` (líneas 30-42), `src/backend/api/views.py` (líneas 70-100)
- **Evidencia:** Bloques `try/except ImportError: pass`; `HEXAGONAL_V3_AVAILABLE = True` verificado en contenedor.
- **Impacto real:** Superficie API V3 puede desactivarse sin log si un import falla en un futuro deploy.
- **Riesgo real:** Bajo-medio (actualmente operativo, pero frágil).
- **Complejidad:** Media.
- **Decisión:** PLAN_NEXT_SPRINT.

### C-04 — Robótica ROTO

- **Archivo:** `src/frontend/src/services/cmscAdapters.js` (líneas 110-117, invocación línea 126)
- **Evidencia:** `readRobotStatus()` retorna `estado: 'ROTO'` con nota autodescriptiva; puerto 8000 vs 8010.
- **Impacto real:** Telemetría de robots no se surface en dashboard CMSC.
- **Riesgo real:** Bajo (funcionalidad bloqueada, resto del sistema operativo).
- **Complejidad:** Media.
- **Decisión:** PLAN_NEXT_SPRINT.

### C-05 — Frontend sin tests

- **Archivos:** `src/frontend/` (0 archivos `*.test.*` / `*.spec.*`), `src/frontend/package.json` (sin script `test`)
- **Evidencia:** Conteo directo de archivos de prueba.
- **Impacto real:** Sin red de seguridad para refactor de componentes; regresiones silenciosas posibles.
- **Riesgo real:** Bajo en operación actual; alto para futuros cambios de UI.
- **Complejidad:** Media.
- **Decisión:** PLAN_NEXT_SPRINT (requisito previo antes de refactor frontend).

### A-01 — Tres estrategias paralelas de laboratorio

- **Archivos:** `src/backend/api/logic/domain/*`, `src/backend/core/domain/strategies/*`, `src/backend/contexts/labs/domain/strategies/*`
- **Evidencia:** `robotica.py`, `agricultura.py`, `electronica.py`, `telecom.py` en 3 ubicaciones con lógica casi idéntica.
- **Impacto real:** Lógica de simulación triplicada; confusión sobre capa canónica.
- **Riesgo real:** Bajo-latente (divergencia futura si se modifica solo una).
- **Complejidad:** Alta.
- **Decisión:** ACCEPT_TECHNICAL_DEBT (ciclo de refactor futuro).

---

## 8. Hallazgos MEDIUM TERM

### A-02 — Dos sistemas de DI con comportamiento distinto

- **Archivos:** `src/backend/infrastructure/config/dependencies.py`, `src/backend/contexts/telemetry/infrastructure/config/dependencies.py`
- **Impacto real:** Tests pueden usar repositorio distinto al de producción sin declaración explícita.
- **Complejidad:** Media.

### A-03 — God components en frontend

- **Archivos:** `src/frontend/src/labs/SchematicEditor.jsx` (1788 LOC), `ElectronicsLab.jsx` (1266), `AdvancedMathLabV2.jsx` (1100)
- **Impacto real:** Baja mantenibilidad; alto riesgo de regresión sin tests (agravado por C-05).
- **Complejidad:** Alta.

### A-07 — Persistencia duplicada (solo imports distintos)

- **Archivos:** `src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py`, `src/backend/contexts/telemetry/infrastructure/persistence/django/django_sensor_reading_repository.py`
- **Evidencia:** Cuerpo IDÉNTICO excluyendo líneas `from/import`.
- **Complejidad:** Media.

### A-08 — `api/logic` y `contexts` coexisten sin deprecación

- **Archivos:** `src/backend/api/logic/`, `src/backend/contexts/`
- **Impacto real:** Migración V1→V2→V3 a medio camino; `api/logic` sigue activo sin marcador de deprecación.
- **Complejidad:** Alta.

---

## 9. Hallazgos FUTURE REFACTOR

### A-04 — `api/views.py` mega-módulo

- **Archivo:** `src/backend/api/views.py` (434 líneas, mezcla V1/V2/V3)
- **Complejidad:** Media.

### A-05 — Vistas V2 instancian adaptadores concretos

- **Archivo:** `src/backend/api/views.py` (líneas 459-460)
- **Complejidad:** Media.

### A-06 — `cloud.js` hardcodea URLs de producción

- **Archivo:** `src/frontend/src/services/cloud.js` (líneas 8-11)
- **Complejidad:** Baja.

---

## 10. Recomendación de ejecución para próximos sprints

**Orden sugerido:**

1. **Sprint siguiente:** C-02 → C-03 → C-04 → C-05 (todos PLAN_NEXT_SPRINT, complejidad media cada uno).
2. **Sprint posterior:** A-02 → A-07 (MEDIUM TERM, complejidad media).
3. **Refactor futuro:** A-04 → A-05 → A-06 → A-03 → A-08 (complejidad media-alta; A-03 y A-08 requieren C-05 resuelto primero).
4. **Deuda técnica aceptada:** C-01 y A-01 (alta complejidad, sin impacto operativo inmediato, consolidar en ciclo dedicado).

---

## Backlog propuesto

### SPRINT SIGUIENTE

| ID | Hallazgo | Acción | Complejidad |
|---|---|---|---|
| C-02 | Composition Root no conectado | Conectar `wire_all()` al arranque de Django | Media |
| C-03 | Imports silenciosos V3 | Reemplazar `try/except` por imports explícitos con fallo rápido | Media |
| C-04 | Robótica ROTO | Corregir puerto/cliente de robótica (8000 → 8010) o conectar cliente real | Media |
| C-05 | Frontend sin tests | Añadir Vitest/React Testing Library y script `test` en `package.json` | Media |

### SPRINT POSTERIOR

| ID | Hallazgo | Acción | Complejidad |
|---|---|---|---|
| A-02 | Dos sistemas de DI | Unificar en un solo módulo con perfiles prod/test | Media |
| A-07 | Persistencia duplicada | Eliminar repositorio sobrante y redirigir imports | Media |

### REFACTOR FUTURO

| ID | Hallazgo | Acción | Complejidad | Dependencia previa |
|---|---|---|---|---|
| A-04 | Mega-module views.py | Separar views por versión en módulos propios | Media | C-03 |
| A-05 | Adaptadores concretos en vistas | Inyectar dependencias vía composition root | Media | C-02, A-02 |
| A-06 | URLs hardcodeadas | Mover a variables de entorno resueltas en runtime | Baja | — |
| A-03 | God components frontend | Descomponer en componentes responsables únicos | Alta | C-05 |
| A-08 | api/logic sin deprecación | Marcar como deprecado, definir fecha de remoción, migrar consumidores | Alta | A-01 |

### DEUDA TÉCNICA ACEPTADA

| ID | Hallazgo | Motivo de aceptación | Complejidad | Cuándo revisar |
|---|---|---|---|---|
| C-01 | Dominio duplicado core vs telemetry | Alta complejidad; no afecta operación actual; copias idénticas hoy | Alta | En ciclo de consolidación de dominio dedicado |
| A-01 | Tres estrategias paralelas | Alta complejidad; no afecta operación actual; lógica casi idéntica hoy | Alta | En ciclo de consolidación de estrategias dedicado |

---

## Cierre formal

El Sprint de Auditoría Toshiba se considera **COMPLETO**.

**Restricciones respetadas:**
- No se modificó código.
- No se hizo commit.
- No se hizo push.
- No se hizo merge.
- No se crearon ramas nuevas.
- No se movieron archivos.
- No se eliminaron archivos.
- No se abrieron nuevas investigaciones.

**Entregables elaborados en la rama `toshiba/architecture-audit`:**
1. `ARCHITECTURE_AUDIT.md` — Auditoría de arquitectura.
2. `ARCHITECTURE_AUDIT_VALIDATION.md` — Validación de hallazgos.
3. `ARCHITECTURE_GOVERNANCE_REVIEW.md` — Clasificación de gobernanza.
4. `ARCHITECTURE_ACTION_MATRIX.md` — Matriz de acciones.
5. `ARCHITECTURE_ACTION_REVIEW.md` — Decisiones de ingeniería.
6. `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` — Cierre formal y backlog (este documento).

El backlog técnico queda listo para decisión de gobernanza posterior sobre cuándo y cómo ejecutar cada acción.