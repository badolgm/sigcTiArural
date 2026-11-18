# TOSHIBA_EXPORT_MANIFEST.md — SIGC&T Rural

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: TOSHIBA_EXPORT_MANIFEST.md
> - Destino: docs/TOSHIBA_EXPORT_MANIFEST.md

**Rama:** `toshiba/architecture-audit`  
**Fecha:** 2026-11-04  
**Estado del Sprint Toshiba:** COMPLETO  
**Instrucción:** Manifiesto de exportación de conocimiento. No nuevas auditorías. No nuevos hallazgos. No nuevas estrategias. No modificación de código.

---

## Conocimiento oficial del proyecto

Estos documentos contienen información única no cubierta por documentación canónica existente y con valor operativo para futuros sprints. Se recomienda su conservación como conocimiento oficial del proyecto.

| Documento | Clasificación | Valor permanente | Dependencias | Riesgo de pérdida | Documento receptor | Motivo | Recomendación |
|---|---|---|---|---|---|---|---|
| `ARCHITECTURE_AUDIT_VALIDATION.md` | KEEP | Alto | Ninguna | Alto | Ninguno | Único registro de validación técnica con evidencia hash SHA-256, números de línea y ejecución en contenedor para cada hallazgo Crítico y Alto. Confirma 12 hallazgos, 1 parcial, 0 falsos positivos. | Conservar como conocimiento oficial. Candidato a publicación en GitHub. |
| `ARCHITECTURE_ACTION_MATRIX.md` | KEEP | Alto | Ninguna | Alto | Ninguno | Matriz de acciones con 5 categorías (CRITICAL, HIGH PRIORITY, MEDIUM TERM, FUTURE REFACTOR, NO ACTION) y 13 hallazgos distribuidos. Incluye secuencia sugerida de ejecución. Backlog técnico utilizable. | Conservar como conocimiento oficial. Candidato a publicación en GitHub. |
| `ARCHITECTURE_ACTION_REVIEW.md` | KEEP | Alto | Ninguna | Alto | Ninguno | Decisiones de ingeniería para los 6 hallazgos CRITICAL y HIGH PRIORITY: 4 PLAN_NEXT_SPRINT (C-02, C-03, C-04, C-05), 2 ACCEPT_TECHNICAL_DEBT (C-01, A-01). | Conservar como conocimiento oficial. Candidato a publicación en GitHub. |
| `C02_EXECUTION_PACKAGE.md` | KEEP | Alto | Ninguna | Alto | Ninguno | Paquete de ejecución completo de C-02 (Composition Root no conectado al arranque): archivos exactos a modificar, cambios esperados, diff conceptual, orden de implementación, riesgos por paso, rollback, validación detallada, criterios de aceptación, impacto sobre bounded contexts. | Conservar como conocimiento oficial. Candidato a publicación en GitHub. Listo para revisión de gobernanza documental y ejecución posterior autorizada. |

---

## Evidencia histórica

Estos documentos constatan que el Sprint de Auditoría Toshiba se ejecutó y cerró formalmente. Su valor es histórico, no operativo vigente.

| Documento | Clasificación | Valor permanente | Dependencias | Riesgo de pérdida | Documento receptor | Motivo | Recomendación |
|---|---|---|---|---|---|---|---|
| `ARCHITECTURE_AUDIT.md` | ARCHIVE | Medio | Ninguna | Medio | Ninguno | Informe de auditoría punto-en-tiempo. Su contenido (estado AS-IS, DDD, Hexagonal, SOLID, POO, Bounded Contexts, duplicación, deuda técnica) está cubierto parcialmente por `docs/MASTERDOC.md` §1 y `docs/HEXAGONAL_REFACTOR_PLAN.md`. | Archivar como evidencia histórica. No subir como documentación activa a GitHub sin revisión de gobernanza que determine si se fusiona con MASTERDOC. |
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | ARCHIVE | Medio | Ninguna | Medio-Bajo | Ninguno | Acta formal de cierre del sprint: qué se auditó, validó, confirmó, qué no requiere acción, hallazgos por categoría, recomendación de ejecución, backlog propuesto. El contenido clave está en los documentos KEEP. | Archivar como evidencia histórica de cierre formal del sprint. |

---

## Documentos a fusionar

Estos documentos contienen información derivada que debe consolidarse con documentación existente antes de considerar su publicación.

| Documento | Clasificación | Valor permanente | Dependencias | Riesgo de pérdida | Documento receptor | Motivo | Recomendación |
|---|---|---|---|---|---|---|---|
| `C02_IMPLEMENTATION_STRATEGY.md` | MERGE | Medio | `docs/HEXAGONAL_REFACTOR_PLAN.md` (FASE 3), `docs/MASTERDOC.md` §1 | Medio | `docs/HEXAGONAL_REFACTOR_PLAN.md` | Estrategia específica de C-02 (Composition Root). El concepto de conectar el composition root ya está contemplado en `HEXAGONAL_REFACTOR_PLAN.md` FASE 3 y `MASTERDOC.md` §1. No es conocimiento nuevo independiente. | Consolidar con `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3 bajo revisión de gobernanza documental. No subir como documento independiente de arquitectura sin esa consolidación. |

---

## Documentos a archivar

Estados intermedios del proceso del sprint sin valor operativo permanente.

| Documento | Clasificación | Valor permanente | Dependencias | Riesgo de pérdida | Documento receptor | Motivo | Recomendación |
|---|---|---|---|---|---|---|---|
| `DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | ARCHIVE | Medio-Bajo | Ninguna | Medio-Bajo | Ninguno | Propuesta de normalización de lenguaje identificando 18 expresiones en 5 documentos. Documento de trabajo del proceso de remediación. | Archivar como evidencia del proceso de normalización de lenguaje. |
| `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | ARCHIVE | Medio-Bajo | Ninguna | Medio-Bajo | Ninguno | Reporte de ejecución de las normalizaciones (20 cambios en 3 documentos). Documento de trabajo del proceso de remediación. | Archivar como evidencia de ejecución de la remediación de lenguaje. |

---

## Documentos de soporte local

Clasificaciones de gobernanza en punto de tiempo con valor para el revisor del sprint, no para operación futura.

| Documento | Clasificación | Valor permanente | Dependencias | Riesgo de pérdida | Documento receptor | Motivo | Recomendación |
|---|---|---|---|---|---|---|---|
| `ARCHITECTURE_GOVERNANCE_REVIEW.md` | LOCAL_EVIDENCE_ONLY | Medio | Ninguna | Medio | Ninguno | Clasificación de hallazgos como Documentado/Resuelto/Pendiente/Obsoleto/Nuevo y asignación de prioridades (CRÍTICO REAL, ALTA, MEDIA, BAJA). Evidencia local de clasificación de gobernanza en punto de tiempo. | Mantener como soporte local. No prioridad para subir a GitHub. Si se sube, como documentación interna de sprint cerrada. |

---

## Recomendación de publicación

El conocimiento oficial del proyecto (KEEP) está listo para publicación tras revisión de gobernanza documental:

1. `ARCHITECTURE_AUDIT_VALIDATION.md` — registro de validación técnica con evidencia verificable.
2. `ARCHITECTURE_ACTION_MATRIX.md` — backlog técnico de arquitectura.
3. `ARCHITECTURE_ACTION_REVIEW.md` — decisiones de ingeniería para próximos sprints.
4. `C02_EXECUTION_PACKAGE.md` — paquete de ejecución C-02 listo para ejecución posterior autorizada.

El documento a fusionar (MERGE) requiere consolidación previa con `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3 antes de considerar su publicación.

---

## Recomendación para GitHub

Los siguientes documentos son candidatos a subir a GitHub como conocimiento oficial del proyecto, tras confirmar mediante revisión de gobernanza documental que:

- No duplican documentación canónica existente (`README.md`, `docs/MASTERDOC.md`, `AGENTS.md`, `docs/HEXAGONAL_REFACTOR_PLAN.md`, `docs/CONTINUITY_RUNBOOK.md`).
- No contienen información sensible de otros proyectos (VETNA, PostgreSQL, RabbitMQ, Redis no fueron tocados durante el sprint).
- Utilizan lenguaje institucional y de gobernanza del proyecto, sin referencias a procesos externos ni a validación por agente no institucional.

**Candidatos a publicación:**

| Prioridad | Documento | Clasificación |
|---|---|---|
| 1 | `ARCHITECTURE_AUDIT_VALIDATION.md` | KEEP |
| 2 | `ARCHITECTURE_ACTION_MATRIX.md` | KEEP |
| 3 | `ARCHITECTURE_ACTION_REVIEW.md` | KEEP |
| 4 | `C02_EXECUTION_PACKAGE.md` | KEEP |

**No candidatos a publicación independiente:**

| Documento | Clasificación | Motivo |
|---|---|---|
| `ARCHITECTURE_AUDIT.md` | ARCHIVE | Evidencia histórica, contenido cubierto parcialmente por MASTERDOC y HEXAGONAL_REFACTOR_PLAN. |
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | ARCHIVE | Acta de cierre de sprint, valor histórico. |
| `C02_IMPLEMENTATION_STRATEGY.md` | MERGE | Requiere consolidación con HEXAGONAL_REFACTOR_PLAN FASE 3 primero. |
| `ARCHITECTURE_GOVERNANCE_REVIEW.md` | LOCAL_EVIDENCE_ONLY | Clasificación de gobernanza en punto de tiempo, valor para revisor del sprint. |
| `DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | ARCHIVE | Documento de trabajo del proceso de normalización. |
| `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | ARCHIVE | Documento de trabajo del proceso de remediación. |

---

**Fin del manifiesto de exportación. No se modificó código. No hay commits, pushes ni merges. Todos los archivos están listos para revisión de gobernanza documental.**