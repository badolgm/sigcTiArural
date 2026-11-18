# ARCHITECTURE_ACTION_REVIEW.md — SIGC&T Rural

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: ARCHITECTURE_ACTION_REVIEW.md
> - Destino: docs/architecture/ARCHITECTURE_ACTION_REVIEW.md

**Rama:** `toshiba/architecture-audit`
**Fuente:** `ARCHITECTURE_ACTION_MATRIX.md` (solo hallazgos CRITICAL y HIGH PRIORITY)
**Fecha:** 2026-11-04
**Estado del sistema:** Operativo (Docker, PostgreSQL, Backend, Frontend, AI Service)

---

## Objetivo

Convertir los 6 hallazgos clasificados como CRITICAL y HIGH PRIORITY en decisiones de ingeniería concretas.

Para cada hallazgo se determina: ¿corregir ahora?, ¿aplazar?, ¿deuda técnica aceptable?, ¿riesgo real para el sistema operativo?, ¿puede esperar versión futura?, ¿complejidad aproximada?

**Resultado de la clasificación:**

| Categoría | Cantidad | Hallazgos |
|---|---|---|
| ACT_NOW | 0 | — |
| PLAN_NEXT_SPRINT | 4 | C-02, C-03, C-04, C-05 |
| ACCEPT_TECHNICAL_DEBT | 2 | C-01, A-01 |
| NO_ACTION | 0 | — |

Ningún hallazgo requiere acción inmediata sobre el sistema operativo actual. Ninguno se descarta definitivamente.

---

# ACT_NOW

Vacío. Ninguno de los 6 hallazgos bajo revisión requiere corrección inmediata sobre el sistema en ejecución.

**Motivo:** El sistema está operativo y estable (Docker, PostgreSQL, Backend, Frontend, AI Service todos healthy). Todos los hallazgos bajo revisión son de naturaleza latente (riesgo futuro) o de calidad de código (mantenibilidad), ninguno interrumpe la operación actual. Además, las restricciones de la misión prohíben modificar código.

---

# PLAN_NEXT_SPRINT

## C-02 — Composition Root no conectado al arranque

- **¿Debe corregirse ahora?** No. Aplazarse al próximo sprint.
- **¿Debe aplazarse?** Sí.
- **¿Es deuda técnica aceptable?** No. Es una omisión funcional real.
- **¿Existe riesgo real para el sistema operativo actual?** Medio. El EventBus (`shared_kernel/event_bus`) solo se cablea si se invoca `get_telemetry_event_bus()`, que internamente llama `wire_all()`. En producción (gunicorn + wsgi) no hay garantía de que el bus esté activo al arranque, por lo que la interconexión Telemetry → Labs (señal `sensor_reading` → `OnSensorReadingHandler`) puede quedar inoperante.
- **¿Puede esperar una versión futura?** Sí, pero es conveniente incluirlo en el próximo sprint porque restaura un comportamiento diseñado que hoy no está garantizado.
- **Complejidad aproximada:** Media. Conectar `wire_all()` al arranque de Django (`AppConfig.ready()` o `wsgi.py`) y validar idempotencia para no duplicar suscripciones.
- **Archivos:** `src/backend/sigct_backend/wiring.py`, `src/backend/sigct_backend/wsgi.py`, `src/backend/sigct_backend/settings.py`.
- **Recomendación:** Conectar el composition root al arranque en el próximo sprint, con pruebas que verifiquen que el bus está cableado y que las suscripciones no se duplican.

## C-03 — Imports silenciosos V3

- **¿Debe corregirse ahora?** No. Aplazarse al próximo sprint.
- **¿Debe aplazarse?** Sí.
- **¿Es deuda técnica aceptable?** No. Es un riesgo de regresión silenciosa.
- **¿Existe riesgo real para el sistema operativo actual?** Bajo-medio. Hoy los endpoints V3 están operativos (`HEXAGONAL_V3_AVAILABLE = True` verificado en contenedor). Si un import deja de resolverse en un futuro deploy, V3 se desactiva sin log visible, perdiendo superficie API sin aviso.
- **¿Puede esperar una versión futura?** Sí, pero debería incluirse pronto porque el patrón `try/except ImportError: pass` oculta fallos.
- **Complejidad aproximada:** Media. Reemplazar los bloques `try/except` por imports explícitos con fallo rápido y mensaje de error claro.
- **Archivos:** `src/backend/api/urls.py` (líneas 30-42), `src/backend/api/views.py` (líneas 70-100, `HEXAGONAL_V3_AVAILABLE`).
- **Recomendación:** Registrar endpoints V3 de forma explícita; fallar rápido con error claro si un import falla, en lugar de silenciarlo.

## C-04 — Robótica ROTO

- **¿Debe corregirse ahora?** No. Aplazarse al próximo sprint.
- **¿Debe aplazarse?** Sí.
- **¿Es deuda técnica aceptable?** Parcial. Está documentado como honestidad de estado intencional, pero bloquea funcionalidad.
- **¿Existe riesgo real para el sistema operativo actual?** Bajo. El dashboard CMSC declara robótica permanentemente ROTA (`estado: 'ROTO'`, `signalId: 'S50'`). La telemetría de robots no se surface. El resto del sistema opera normalmente.
- **¿Puede esperar una versión futura?** Sí, pero el próximo sprint es el momento natural para corregir el puerto del cliente (8000 → 8010) o conectar el cliente real.
- **Complejidad aproximada:** Media. Corregir el puerto de conexión del cliente de robótica o conectar el cliente real; actualmente es una decisión de honestidad documentada.
- **Archivos:** `src/frontend/src/services/cmscAdapters.js` (líneas 110-117, función `readRobotStatus`; línea 126 invocación en `readLiveSignals`).
- **Recomendación:** Corregir el host/puerto del cliente de robótica en el próximo sprint para restaurar la funcionalidad en el dashboard CMSC.

## C-05 — Frontend sin tests

- **¿Debe corregirse ahora?** No. Aplazarse al próximo sprint.
- **¿Debe aplazarse?** Sí.
- **¿Es deuda técnica aceptable?** No para mediano plazo. Es un bloqueador de refactor seguro.
- **¿Existe riesgo real para el sistema operativo actual?** Bajo. No afecta la operación actual, pero impide detectar regresiones en cambios de UI.
- **¿Puede esperar una versión futura?** Sí, pero es un requisito previo antes de abordar A-03 (god components) y A-04 (mega-module), ya que sin tests cualquier refactor de frontend es de alto riesgo.
- **Complejidad aproximada:** Media. Añadir Vitest/React Testing Library y configurar script `test` en `src/frontend/package.json`.
- **Archivos:** `src/frontend/` (0 archivos `*.test.*` / `*.spec.*`), `src/frontend/package.json`.
- **Recomendación:** Establecer suite de pruebas frontend en el próximo sprint, antes de cualquier refactor de componentes existentes.

---

# ACCEPT_TECHNICAL_DEBT

## C-01 — Duplicación exacta de dominio (core vs telemetry)

- **¿Debe corregirse ahora?** No. Aplazarse a un ciclo de refactor futuro.
- **¿Debe aplazarse?** Sí, a futuro refactor.
- **¿Es deuda técnica aceptable?** Sí, por ahora. Es deuda de mantenibilidad, no de operación.
- **¿Existe riesgo real para el sistema operativo actual?** Bajo-latente. Las copias son hash-idénticas hoy (`sensor_reading.py`, `temperature.py`, `humidity.py`, `sensor_id.py`, `domain_exceptions.py`). El riesgo es divergencia futura si alguien modifica una copia y no la otra.
- **¿Puede esperar una versión futura?** Sí. No afecta la operación actual; se aborda en un ciclo de consolidación de dominio.
- **Complejidad aproximada:** Alta. Elegir fuente canónica, migrar todos los importadores, eliminar la copia sobrante sin romper V2/V3 en producción.
- **Archivos:** `src/backend/core/domain/`, `src/backend/contexts/telemetry/domain/`.
- **Recomendación:** Aceptar como deuda técnica por ahora. Documentar cuál es la fuente canónica y planificar la consolidación en un ciclo de refactor dedicado, con pruebas que impidan divergencia.

## A-01 — Tres estrategias paralelas de laboratorio

- **¿Debe corregirse ahora?** No. Aplazarse a un ciclo de refactor futuro.
- **¿Debe aplazarse?** Sí, a futuro refactor.
- **¿Es deuda técnica aceptable?** Sí, por ahora. Es deuda de duplicación de código.
- **¿Existe riesgo real para el sistema operativo actual?** Bajo-latente. Las tres implementaciones (`api/logic/domain/*`, `core/domain/strategies/*`, `contexts/labs/domain/strategies/*`) son casi idénticas hoy. El riesgo es divergencia de comportamiento si se modifica solo una.
- **¿Puede esperar una versión futura?** Sí. No afecta la operación actual; se aborda en un ciclo de consolidación de estrategias de dominio.
- **Complejidad aproximada:** Alta. Consolidar en una única jerarquía de estrategias y deprecadas las otras dos, migrando todos los consumidores.
- **Archivos:** `src/backend/api/logic/domain/*`, `src/backend/core/domain/strategies/*`, `src/backend/contexts/labs/domain/strategies/*`.
- **Recomendación:** Aceptar como deuda técnica por ahora. Planificar la consolidación en un ciclo de refactor dedicado, definiendo cuál es la implementación canónica.

---

# NO_ACTION

Vacío. Ninguno de los 6 hallazgos bajo revisión se descarta definitivamente. Todos requieren alguna forma de atención futura (planificar o aceptar deuda).

---

## Resumen de decisiones

| Hallazgo | Decisión | Razón principal |
|---|---|---|
| C-01 | ACCEPT_TECHNICAL_DEBT | Divergencia latente, alta complejidad, no afecta operación actual |
| C-02 | PLAN_NEXT_SPRINT | Afecta comportamiento real (EventBus), complejidad media, restaurable |
| C-03 | PLAN_NEXT_SPRINT | Riesgo de regresión silenciosa en API, complejidad media, actualmente funciona |
| C-04 | PLAN_NEXT_SPRINT | Funcionalidad de robótica bloqueada, complejidad media, fix de configuración |
| C-05 | PLAN_NEXT_SPRINT | Bloqueador de refactor seguro frontend, complejidad media, requisito previo |
| A-01 | ACCEPT_TECHNICAL_DEBT | Duplicación de código, alta complejidad, no afecta operación actual |

**Orden sugerido de ejecución:** C-02 → C-03 → C-04 → C-05 (PLAN_NEXT_SPRINT), seguidos de C-01 y A-01 en un ciclo de refactor dedicado (ACCEPT_TECHNICAL_DEBT).

---

**Fin de la revisión de acción. No se modificó código. No hay commits, pushes ni merges.**