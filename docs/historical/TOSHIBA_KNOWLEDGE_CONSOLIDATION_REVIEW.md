# TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md — SIGC&T Rural

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md
> - Destino: docs/historical/TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md

**Rama:** `toshiba/architecture-audit`  
**Fecha:** 2026-11-04  
**Estado:** Sprint Toshiba completado · 8 entregables elaborados  
**Instrucción:** Consolidar conocimiento. No nuevas auditorías. No nuevos hallazgos. No nuevos planes. No nuevas estrategias. No nueva documentación de arquitectura.

---

## Resumen Ejecutivo

Se revisaron los 8 entregables elaborados durante el Sprint de Auditoría Toshiba y se cruzaron contra la documentación canónica existente (`README.md`, `docs/MASTERDOC.md`, `AGENTS.md`, `docs/HEXAGONAL_REFACTOR_PLAN.md`, `docs/CONTINUITY_RUNBOOK.md`, `AI_SERVICE_*`, `backup_ubtn_docs/`). El objetivo fue evitar documentación duplicada y determinar el destino de cada archivo: conocimiento oficial (KEEP), consolidar con existente (MERGE), archivo histórico (ARCHIVE), o evidencia local sin persistencia (LOCAL_EVIDENCE_ONLY).

**Resultado de la clasificación:**

| Clasificación | Cantidad | Documentos |
|---|---|---|
| KEEP | 4 | ARCHITECTURE_AUDIT_VALIDATION.md, ARCHITECTURE_ACTION_MATRIX.md, ARCHITECTURE_ACTION_REVIEW.md, C02_EXECUTION_PACKAGE.md |
| MERGE | 1 | C02_IMPLEMENTATION_STRATEGY.md |
| ARCHIVE | 2 | ARCHITECTURE_AUDIT.md, TOSHIBA_AUDIT_SPRINT_CLOSURE.md |
| LOCAL_EVIDENCE_ONLY | 1 | ARCHITECTURE_GOVERNANCE_REVIEW.md |

---

## Tabla de Consolidación

| # | Documento | Clasificación | Destino recomendado | Valor permanente |
|---|---|---|---|---|
| 1 | `ARCHITECTURE_AUDIT.md` | ARCHIVE | Evidencia histórica del estado de auditoría | Medio — punto de referencia del estado AS-IS |
| 2 | `ARCHITECTURE_AUDIT_VALIDATION.md` | KEEP | Conocimiento oficial (registro de validación) | Alto — evidencia hash y línea por hallazgo |
| 3 | `ARCHITECTURE_GOVERNANCE_REVIEW.md` | LOCAL_EVIDENCE_ONLY | Evidencia local de clasificación de gobernanza | Medio — clasificación en punto de tiempo |
| 4 | `ARCHITECTURE_ACTION_MATRIX.md` | KEEP | Conocimiento oficial (backlog técnico) | Alto — matriz de acciones CRITICAL/HIGH/MEDIUM/FUTURE |
| 5 | `ARCHITECTURE_ACTION_REVIEW.md` | KEEP | Conocimiento oficial (decisiones de ingeniería) | Alto — decisiones ACT_NOW/PLAN_NEXT_SPRINT/ACCEPT_TECHNICAL_DEBT |
| 6 | `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | ARCHIVE | Evidencia histórica del cierre de sprint | Medio — acta de cierre formal |
| 7 | `C02_IMPLEMENTATION_STRATEGY.md` | MERGE | Consolidar con `docs/HEXAGONAL_REFACTOR_PLAN.md` (FASE 3) | Medio — estrategia específica de C-02 |
| 8 | `C02_EXECUTION_PACKAGE.md` | KEEP | Conocimiento oficial (paquete de ejecución listo para revisión técnica) | Alto — paquete de ejecución C-02 listo para revisión |

---

## Detalle por Documento

### 1. ARCHITECTURE_AUDIT.md — ARCHIVE

- **Valor permanente:** Medio. Documenta el estado AS-IS de la arquitectura (DDD, Hexagonal, SOLID, POO, Bounded Contexts, dependencias, acoplamiento, duplicación, deuda técnica) con métricas base (172 archivos backend, 89 frontend, 6 AI, 27 tests, 0 tests frontend).
- **Riesgo de pérdida:** Medio. Si se pierde, se pierde el punto de referencia AS-IS del sprint Toshiba, pero el estado AS-IS ya está documentado en `docs/MASTERDOC.md` §1 (Arquitectura Hexagonal - Estado Verificado) y `docs/HEXAGONAL_REFACTOR_PLAN.md`.
- **Cruzado contra existente:** `MASTERDOC.md` §1 ya documenta la coexistencia V1/V2/V3, la duplicación de lógica, y el diagrama AS-IS. `HEXAGONAL_REFACTOR_PLAN.md` ya documenta "Lógica de simulación duplicada" y "URLs hardcodeadas". El auditoría confirma pero no añade arquitectura nueva.
- **Justificación ARCHIVE:** Es un informe de auditoría punto-en-tiempo. Su contenido está cubierto parcialmente por documentación canónica existente. Se conserva como evidencia histórica del estado auditado, no como conocimiento operativo vigente.
- **Destino:** Archivado. No subir como documentación activa a GitHub sin revisión técnica que determine si se fusiona con MASTERDOC.

### 2. ARCHITECTURE_AUDIT_VALIDATION.md — KEEP

- **Valor permanente:** Alto. Contiene evidencia verificable (hash SHA-256, números de línea, ejecución en contenedor) para cada hallazgo Crítico y Alto. Confirma 12 hallazgos, 1 parcial, 0 falsos positivos.
- **Riesgo de pérdida:** Alto. Sin este documento, no existe registro consolidado de qué se validó, cómo y con qué evidencia. Los hashes de duplicación (core vs telemetry) no están en ningún otro documento.
- **Cruzado contra existente:** Ningún documento existente contiene los hashes SHA-256 de los archivos duplicados ni la confirmación de ejecución en contenedor de `HEXAGONAL_V3_AVAILABLE = True`. `AGENTS.md` menciona duplicación pero sin evidencia hash.
- **Justificación KEEP:** Es el único registro de validación técnica del sprint. Debe conservarse como conocimiento oficial para que futuros revisores sepan qué se confirmó y con qué evidencia.
- **Destino:** Conocimiento oficial. Candidato a subir a GitHub como registro de auditoría validada.

### 3. ARCHITECTURE_GOVERNANCE_REVIEW.md — LOCAL_EVIDENCE_ONLY

- **Valor permanente:** Medio. Clasifica hallazgos como Documentado/Resuelto/Pendiente/Obsoleto/Nuevo y asigna prioridades (CRÍTICO REAL, ALTA, MEDIA, BAJA).
- **Riesgo de pérdida:** Medio-Bajo. Es una clasificación de gobernanza en un punto de tiempo. Si se pierde, las decisiones de priorización aún están en `ARCHITECTURE_ACTION_REVIEW.md` y `ARCHITECTURE_ACTION_MATRIX.md`.
- **Cruzado contra existente:** `MASTERDOC.md` §1 menciona "No hay fecha de remoción fijada para V1 y V2 - pendiente definir" pero no tiene esta matriz de gobernanza Documentado/Resuelto/Pendiente/Obsoleto/Nuevo. `AGENTS.md` no tiene esta clasificación.
- **Justificación LOCAL_EVIDENCE_ONLY:** Es evidencia local de cómo se clasificó la gobernanza durante el sprint Toshiba. No es conocimiento operativo del proyecto; es un informe intermedio. Su valor es para el revisor técnico que quiera entender el criterio de clasificación usado.
- **Destino:** Evidencia local. No prioridad para subir a GitHub. Si se sube, como documentación interna de sprint cerrada.

### 4. ARCHITECTURE_ACTION_MATRIX.md — KEEP

- **Valor permanente:** Alto. Matriz de acciones con 5 categorías (CRITICAL, HIGH PRIORITY, MEDIUM TERM, FUTURE REFACTOR, NO ACTION) y 13 hallazgos distribuidos. Incluye secuencia sugerida de ejecución.
- **Riesgo de pérdida:** Alto. Es el backlog técnico resultante del sprint. Sin él, no hay registro estructurado de qué se debe hacer con cada hallazgo.
- **Cruzado contra existente:** `docs/HEXAGONAL_REFACTOR_PLAN.md` tiene fases (FASE 1..3) pero no esta clasificación CRITICAL/HIGH/MEDIUM/FUTURE/NO ACTION ni la secuencia sugerida. `docs/CONTINUITY_RUNBOOK.md` tiene pasos de continuidad pero no esta matriz de acciones.
- **Justificación KEEP:** Es el backlog técnico utilizable del sprint. Debe conservarse para que el proyecto decida qué ejecutar en próximos sprints.
- **Destino:** Conocimiento oficial. Candidato a subir a GitHub como backlog de arquitectura.

### 5. ARCHITECTURE_ACTION_REVIEW.md — KEEP

- **Valor permanente:** Alto. Contiene las decisiones de ingeniería para los 6 hallazgos CRITICAL y HIGH PRIORITY: 0 ACT_NOW, 4 PLAN_NEXT_SPRINT (C-02, C-03, C-04, C-05), 2 ACCEPT_TECHNICAL_DEBT (C-01, A-01), 0 NO_ACTION.
- **Riesgo de pérdida:** Alto. Sin este documento no queda registrado por qué C-01 y A-01 se aceptan como deuda técnica y por qué C-02..C-05 van al próximo sprint.
- **Cruzado contra existente:** Ningún documento existente contiene estas decisiones de ingeniería tomadas durante el sprint Toshiba.
- **Justificación KEEP:** Registro de decisiones de ingeniería. Esencial para que el equipo futuro entienda el criterio de priorización aplicado.
- **Destino:** Conocimiento oficial. Candidato a subir a GitHub.

### 6. TOSHIBA_AUDIT_SPRINT_CLOSURE.md — ARCHIVE

- **Valor permanente:** Medio. Acta formal de cierre del sprint: qué se auditó, validó, confirmó, qué no requiere acción, hallazgos por categoría, recomendación de ejecución, backlog propuesto (SPRINT SIGUIENTE, SPRINT POSTERIOR, REFACTOR FUTURO, DEUDA TÉCNICA ACEPTADA).
- **Riesgo de pérdida:** Medio-Bajo. El contenido clave (hallazgos, clasificación, backlog) está en los otros documentos KEEP. Este es el acta de cierre.
- **Cruzado contra existente:** `docs/CONTINUITY_RUNBOOK.md` tiene concepto de "punto de chequeo obligatorio" y "siguiente paso recomendado", pero no un acta de cierre de sprint de auditoría.
- **Justificación ARCHIVE:** Es un documento de cierre de sprint. Su valor es histórico (constatar que el sprint se cerró formalmente). No es conocimiento operativo vigente.
- **Destino:** Archivado. Evidencia de que el sprint se cerró formalmente.

### 7. C02_IMPLEMENTATION_STRATEGY.md — MERGE

- **Valor permanente:** Medio. Estrategia de implementación de C-02 (Composition Root no conectado al arranque): causa raíz, archivos afectados, dependencias, bounded contexts impactados, componentes afectados, riesgos, estrategia de implementación, rollback, validación, complejidad.
- **Riesgo de pérdida:** Medio. Si se pierde, se pierde la estrategia específica de C-02, pero el concepto de conectar el composition root ya está en `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3 ("Introducir un Composition Root simple...") y `docs/MASTERDOC.md` §1 (tabla Composition Root).
- **Cruzado contra existente:** `HEXAGONAL_REFACTOR_PLAN.md` FASE 3 ya contempla el Composition Root. `MASTERDOC.md` §1 documenta el wiring.py y `wire_all`. Este documento es una estrategia específica para C-02 que se solapa con planes existentes.
- **Justificación MERGE:** No es conocimiento nuevo independiente; es una estrategia derivada que debería consolidarse con la documentación existente de `HEXAGONAL_REFACTOR_PLAN.md` (FASE 3) si el proyecto decide fusionarla. Por sí sola no justifica persistencia como documento independiente de arquitectura.
- **Destino:** Consolidar (MERGE) con `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3 en revisión técnica posterior. No subir como documento independiente de arquitectura sin esa consolidación.

### 8. C02_EXECUTION_PACKAGE.md — KEEP

- **Valor permanente:** Alto. Paquete de ejecución completo de C-02: archivos exactos a modificar (settings.py, apps.py), cambios esperados por archivo, diff conceptual, orden de implementación, riesgos por paso, rollback detallado, validación detallada, criterios de aceptación, condiciones para declarar resuelto, impacto sobre Telemetry/Labs/Shared Kernel/Event Bus.
- **Riesgo de pérdida:** Alto. Es el único documento listo para ejecución técnica de C-02. Sin él, no hay especificación ejecutable del hallazgo CRITICAL seleccionado para el próximo sprint.
- **Cruzado contra existente:** Ningún documento existente tiene este nivel de detalle de ejecución para C-02 (archivos exactos, diff conceptual, rollback, criterios de aceptación).
- **Justificación KEEP:** Es el artefacto más accionable del sprint. Listo para que el proyecto revise y ejecute C-02 sin generar nueva documentación.
- **Destino:** Conocimiento oficial. Candidato a subir a GitHub como paquete de ejecución C-02.

---

## Cruzado contra Documentación Existente

| Documento Toshiba | ¿Solapa con README? | ¿Solapa con MASTERDOC? | ¿Solapa con AGENTS.md? | ¿Solapa con HEXAGONAL_REFACTOR_PLAN? | Decisión |
|---|---|---|---|---|---|
| ARCHITECTURE_AUDIT.md | Parcial (arquitectura en transición) | Sí (§1 V1/V2/V3, duplicación) | No | Sí (duplicación, URLs hardcodeadas) | ARCHIVE |
| ARCHITECTURE_AUDIT_VALIDATION.md | No | No | No | No | KEEP |
| ARCHITECTURE_GOVERNANCE_REVIEW.md | No | Parcial (V1/V2 pendiente) | No | No | LOCAL_EVIDENCE_ONLY |
| ARCHITECTURE_ACTION_MATRIX.md | No | No | No | Parcial (fases de refactor) | KEEP |
| ARCHITECTURE_ACTION_REVIEW.md | No | No | No | No | KEEP |
| TOSHIBA_AUDIT_SPRINT_CLOSURE.md | No | No | No | No | ARCHIVE |
| C02_IMPLEMENTATION_STRATEGY.md | No | Parcial (wiring.py, composition root) | No | Sí (FASE 3 Composition Root) | MERGE |
| C02_EXECUTION_PACKAGE.md | No | No | No | No | KEEP |

---

## Riesgo de Duplicación

Los documentos con mayor riesgo de duplicación son:

1. **ARCHITECTURE_AUDIT.md** — solapa con `MASTERDOC.md` §1 y `HEXAGONAL_REFACTOR_PLAN.md` en la descripción del estado AS-IS (V1/V2/V3, duplicación, wiring). Clasificación ARCHIVE evita que se perciba como documentación activa duplicada.
2. **C02_IMPLEMENTATION_STRATEGY.md** — solapa con `HEXAGONAL_REFACTOR_PLAN.md` FASE 3. Clasificación MERGE obliga a revisar si se fusiona o se descarta antes de subir.
3. **ARCHITECTURE_GOVERNANCE_REVIEW.md** — solapa conceptualmente con la sección "pendiente definir" de MASTERDOC, pero aporta la matriz Documentado/Resuelto/Pendiente/Obsoleto/Nuevo que no existe. Clasificación LOCAL_EVIDENCE_ONLY limita su exposición.

Los documentos KEEP (VALIDATION, ACTION_MATRIX, ACTION_REVIEW, C02_EXECUTION_PACKAGE) no tienen solapamiento directo con documentación existente y aportan información única (hashes, validación en contenedor, backlog, decisiones de ingeniería, paquete de ejecución).

---

## Destino Recomendado para GitHub

| Subir a GitHub como documento activo | No subir (evidencia local / archivo) |
|---|---|
| ARCHITECTURE_AUDIT_VALIDATION.md | ARCHITECTURE_AUDIT.md |
| ARCHITECTURE_ACTION_MATRIX.md | TOSHIBA_AUDIT_SPRINT_CLOSURE.md |
| ARCHITECTURE_ACTION_REVIEW.md | ARCHITECTURE_GOVERNANCE_REVIEW.md |
| C02_EXECUTION_PACKAGE.md | C02_IMPLEMENTATION_STRATEGY.md (requiere MERGE previo) |

**Criterio:** Suben los documentos con información única no cubierta por documentación canónica existente y con valor operativo (validación, backlog, decisiones, ejecución). No suben los de archivo histórico ni los que requieren consolidación previa con documentos existentes.

---

## Criterios de Clasificación Aplicados

| Criterio | KEEP | MERGE | ARCHIVE | LOCAL_EVIDENCE_ONLY |
|---|---|---|---|---|
| Información única no en docs existentes | ✅ | ❌ | ❌ | ❌ |
| Valor operativo (backlog, decisiones, ejecución) | ✅ | ⚠️ | ❌ | ❌ |
| Solapamiento con docs existentes | ❌ | ✅ | ✅ | ⚠️ |
| Valor histórico de sprint cerrado | ❌ | ❌ | ✅ | ⚠️ |
| Evidencia de clasificación interna | ❌ | ❌ | ❌ | ✅ |

---

## Recomendación Final

1. **Mantener como conocimiento oficial del proyecto (KEEP):** `ARCHITECTURE_AUDIT_VALIDATION.md`, `ARCHITECTURE_ACTION_MATRIX.md`, `ARCHITECTURE_ACTION_REVIEW.md`, `C02_EXECUTION_PACKAGE.md`. Estos son los únicos entregables con información no cubierta por documentación existente y con valor operativo para futuros sprints.

2. **Consolidar con existente (MERGE):** `C02_IMPLEMENTATION_STRATEGY.md` con `docs/HEXAGONAL_REFACTOR_PLAN.md` FASE 3, bajo revisión técnica que decida si se fusiona o se descarta.

3. **Archivar como evidencia histórica (ARCHIVE):** `ARCHITECTURE_AUDIT.md`, `TOSHIBA_AUDIT_SPRINT_CLOSURE.md`. Sirven como constancia de que el sprint se ejecutó y cerró, pero no son conocimiento operativo vigente.

4. **Evidencia local sin persistencia prioritaria (LOCAL_EVIDENCE_ONLY):** `ARCHITECTURE_GOVERNANCE_REVIEW.md`. Clasificación de gobernanza en punto de tiempo; su valor es para el revisor del sprint, no para operación futura.

5. **Preparar para revisión ASUS ↔ TOSHIBA:** Los 4 documentos KEEP + el paquete C-02 son los candidatos para subir a GitHub tras revisión técnica que confirme que no duplican documentación canónica y que no contienen información sensible de otros proyectos (VETNA, PostgreSQL, RabbitMQ, Redis no tocados).

---

**Fin de la revisión de consolidación de conocimiento. No se modificó código. No hay commits, pushes ni merges. No se generó nueva documentación de arquitectura.**