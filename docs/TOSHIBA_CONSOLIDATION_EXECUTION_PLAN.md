# TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md — SIGC&T Rural

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md
> - Destino: docs/TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md

**Rama:** `toshiba/architecture-audit`  
**Fecha:** 2026-11-04  
**Base:** `TOSHIBA_EXPORT_MANIFEST.md` (clasificación aprobada)  
**Estado:** Plan de consolidación únicamente. No ejecutar nada. No mover archivos. No modificar documentos. No hacer commit, push ni merge.

---

## 1. Qué archivo absorberá a cuál

| Documento absorbente | Documento absorbido | Sección de absorción |
|---|---|---|
| `docs/HEXAGONAL_REFACTOR_PLAN.md` | `C02_IMPLEMENTATION_STRATEGY.md` | FASE 3 — Composition Root e inicialización del EventBus al arranque |

No hay otras absorciones planificadas. Los documentos KEEP, ARCHIVE y LOCAL_EVIDENCE_ONLY permanecen como archivos independientes.

---

## 2. Qué información exacta se preservará

### De `C02_IMPLEMENTATION_STRATEGY.md` hacia `docs/HEXAGONAL_REFACTOR_PLAN.md` (FASE 3)

La siguiente información se preservará en la absorción:

| Origen | Información | Destino en `docs/HEXAGONAL_REFACTOR_PLAN.md` |
|---|---|---|
| Sección "Causa raíz" | Composición root (`wiring.py`, `wire_all()`) no invocada en arranque de Django (`wsgi.py`/`settings.py`) | FASE 3 — Contexto y problema del composition root |
| Sección "Archivos afectados" | `wsgi.py`, `settings.py`, `apps.py` (nuevo), `wiring.py` (sin cambios), `dependencies.py` (sin cambios) | FASE 3 — Archivos involucrados en la conexión al arranque |
| Sección "Dependencias afectadas" | `InMemoryEventBus`, `EventBusPort`, `LabSignal`, `OnSensorReadingHandler`, `LaboratorioService`, `ConsoleNotificationAdapter`, `RegistrarLecturaSensorCommand`, `get_telemetry_event_bus()` | FASE 3 — Mapa de dependencias del EventBus |
| Sección "Estrategia de implementación" | Opción B: `AppConfig.ready()` en `sigct_backend/apps.py` que invoca `get_telemetry_event_bus()`; registro de `'sigct_backend'` en `INSTALLED_APPS` | FASE 3 — Estrategia de implementación recomendada |
| Sección "Estrategia de rollback" | Revertir `INSTALLED_APPS` y eliminar `apps.py`; sin migraciones de datos | FASE 3 — Procedimiento de rollback |
| Sección "Plan de validación" | 5 validaciones: bus cableado al arranque, idempotencia, flujo extremo a extremo, no regresión en tests, servicio operativo | FASE 3 — Criterios de validación |
| Sección "Estimación de complejidad" | Complejidad media, bajo riesgo de regresión, pocas horas de desarrollo | FASE 3 — Estimación de esfuerzo |

### Información que NO se absorbe (permanece en `C02_IMPLEMENTATION_STRATEGY.md`)

| Información | Motivo |
|---|---|
| Contexto general del hallazgo C-02 | Ya documentado en `ARCHITECTURE_AUDIT.md` y `ARCHITECTURE_AUDIT_VALIDATION.md` |
| Riesgos detallados por tipo | Parcialmente cubiertos en `docs/HEXAGONAL_REFACTOR_PLAN.md`; los específicos de C-02 permanecen en el archivo fuente |
| Veredicto de ejecución ("merece ejecución real en el próximo sprint") | Pertenece a `ARCHITECTURE_ACTION_REVIEW.md` (decisión de ingeniería) |

---

## 3. Qué documentos deberán permanecer activos

Los documentos con clasificación **KEEP** permanecen activos como conocimiento oficial del proyecto:

| Documento | Rol activo |
|---|---|
| `ARCHITECTURE_AUDIT_VALIDATION.md` | Registro de validación técnica de hallazgos de arquitectura (evidencia hash SHA-256, líneas, ejecución en contenedor) |
| `ARCHITECTURE_ACTION_MATRIX.md` | Backlog técnico de arquitectura con 5 categorías de acción y secuencia de ejecución |
| `ARCHITECTURE_ACTION_REVIEW.md` | Decisiones de ingeniería para los 6 hallazgos CRITICAL y HIGH PRIORITY |
| `C02_EXECUTION_PACKAGE.md` | Paquete de ejecución completo de C-02 listo para revisión de gobernanza documental y ejecución posterior autorizada |

---

## 4. Qué documentos pasarán a archivo histórico

Los documentos con clasificación **ARCHIVE** pasan a archivo histórico (evidencia de cierre de sprint y proceso de normalización):

| Documento | Motivo de archivo |
|---|---|
| `ARCHITECTURE_AUDIT.md` | Informe de auditoría punto-en-tiempo; contenido cubierto parcialmente por `docs/MASTERDOC.md` §1 y `docs/HEXAGONAL_REFACTOR_PLAN.md` |
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | Acta formal de cierre del sprint; valor histórico de constancia de ejecución y cierre |
| `DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | Documento de trabajo del proceso de normalización de lenguaje |
| `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | Documento de trabajo del proceso de remediación de lenguaje |

---

## 5. Qué documentos son candidatos a GitHub

Los documentos con clasificación **KEEP** son candidatos a publicación en GitHub tras revisión de gobernanza documental:

| Prioridad | Documento | Clasificación | Condición previa |
|---|---|---|---|
| 1 | `ARCHITECTURE_AUDIT_VALIDATION.md` | KEEP | Revisión de gobernanza: no duplicar documentación canónica, no información sensible de otros proyectos |
| 2 | `ARCHITECTURE_ACTION_MATRIX.md` | KEEP | Revisión de gobernanza: no duplicar documentación canónica, no información sensible de otros proyectos |
| 3 | `ARCHITECTURE_ACTION_REVIEW.md` | KEEP | Revisión de gobernanza: no duplicar documentación canónica, no información sensible de otros proyectos |
| 4 | `C02_EXECUTION_PACKAGE.md` | KEEP | Revisión de gobernanza: no duplicar documentación canónica, no información sensible de otros proyectos |

**No candidatos a publicación independiente:**

| Documento | Clasificación | Motivo |
|---|---|---|
| `ARCHITECTURE_AUDIT.md` | ARCHIVE | Evidencia histórica; contenido cubierto parcialmente por documentación existente |
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | ARCHIVE | Acta de cierre; valor histórico |
| `C02_IMPLEMENTATION_STRATEGY.md` | MERGE | Requiere consolidación con `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3 primero |
| `ARCHITECTURE_GOVERNANCE_REVIEW.md` | LOCAL_EVIDENCE_ONLY | Clasificación de gobernanza en punto de tiempo; valor para revisor del sprint |
| `DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | ARCHIVE | Documento de trabajo del proceso de normalización |
| `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | ARCHIVE | Documento de trabajo del proceso de remediación |

---

## 6. Riesgos de consolidación

| Riesgo | Descripción | Mitigación |
|---|---|---|
| **Duplicación de información** | Al absorber `C02_IMPLEMENTATION_STRATEGY.md` en `docs/HEXAGONAL_REFACTOR_PLAN.md`, podría crearse información redundante con secciones existentes de FASE 3. | Revisar sección existente de FASE 3 antes de escribir; conservar solo información nueva o complementaria. |
| **Pérdida de contexto de C-02** | Al absorber solo la estrategia de implementación, se podría perder el contexto general del hallazgo C-02 (causa raíz, impacto, decisión de ingeniería). | Mantener `C02_IMPLEMENTATION_STRATEGY.md` como archivo fuente hasta que la absorción esté completa y verificada; el contexto general permanece en `ARCHITECTURE_AUDIT.md`, `ARCHITECTURE_AUDIT_VALIDATION.md` y `ARCHITECTURE_ACTION_REVIEW.md`. |
| **Inconsistencia de versión** | Si `docs/HEXAGONAL_REFACTOR_PLAN.md` se actualiza con la absorción pero `C02_IMPLEMENTATION_STRATEGY.md` no se marca como absorbido, podría haber dos versiones contradictorias. | Marcar `C02_IMPLEMENTATION_STRATEGY.md` como "absorbido en docs/HEXAGONAL_REFACTOR_PLAN.md FASE 3" una vez completada la fusión. |
| **Pérdida de trazabilidad de decisiones** | Las decisiones de ingeniería de `ARCHITECTURE_ACTION_REVIEW.md` (PLAN_NEXT_SPRINT para C-02) podrían desvincularse de la implementación absorbida. | Conservar la referencia cruzada entre `ARCHITECTURE_ACTION_REVIEW.md` y `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3. |
| **Riesgo de publicación prematura** | Publicar `C02_EXECUTION_PACKAGE.md` en GitHub antes de completar la absorción de `C02_IMPLEMENTATION_STRATEGY.md` podría generar confusión sobre cuál es la versión vigente. | Completar la absorción MERGE antes de publicar `C02_EXECUTION_PACKAGE.md`. |

---

## 7. Orden recomendado de ejecución

| Paso | Acción | Documentos involucrados | Dependencia previa |
|---|---|---|---|
| 1 | Revisar sección existente de FASE 3 en `docs/HEXAGONAL_REFACTOR_PLAN.md` para identificar puntos de integración | `docs/HEXAGONAL_REFACTOR_PLAN.md` | Ninguna |
| 2 | Absorber información de `C02_IMPLEMENTATION_STRATEGY.md` en `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3 (causa raíz, archivos, dependencias, estrategia de implementación, rollback, validación, complejidad) | `C02_IMPLEMENTATION_STRATEGY.md`, `docs/HEXAGONAL_REFACTOR_PLAN.md` | Paso 1 |
| 3 | Marcar `C02_IMPLEMENTATION_STRATEGY.md` como absorbido (referencia cruzada en el archivo fuente) | `C02_IMPLEMENTATION_STRATEGY.md` | Paso 2 |
| 4 | Revisar de gobernanza documental de los 4 documentos KEEP para verificar no duplicación con documentación canónica y ausencia de información sensible de otros proyectos | `ARCHITECTURE_AUDIT_VALIDATION.md`, `ARCHITECTURE_ACTION_MATRIX.md`, `ARCHITECTURE_ACTION_REVIEW.md`, `C02_EXECUTION_PACKAGE.md` | Paso 3 |
| 5 | Publicar los 4 documentos KEEP en GitHub tras aprobación de la revisión de gobernanza | 4 documentos KEEP | Paso 4 |
| 6 | Archivar los 4 documentos ARCHIVE y el documento LOCAL_EVIDENCE_ONLY como evidencia de cierre de sprint | `ARCHITECTURE_AUDIT.md`, `TOSHIBA_AUDIT_SPRINT_CLOSURE.md`, `DOCUMENTATION_LANGUAGE_NORMALIZATION.md`, `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md`, `ARCHITECTURE_GOVERNANCE_REVIEW.md` | Paso 5 |

---

## Criterios de éxito de la consolidación

- `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3 contiene la información de `C02_IMPLEMENTATION_STRATEGY.md` sobre composición root, archivos afectados, dependencias, estrategia de implementación, rollback y validación.
- `C02_IMPLEMENTATION_STRATEGY.md` mantiene referencia cruzada a `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3 como versión consolidada.
- Los 4 documentos KEEP pasan revisión de gobernanza documental (no duplicación, sin información sensible de otros proyectos, lenguaje institucional).
- No se modificó código. No se crearon ramas. No hay commits, pushes ni merges.

---

**Fin del plan de consolidación. No se ejecutó nada. Todos los archivos permanecen en su ubicación original.**