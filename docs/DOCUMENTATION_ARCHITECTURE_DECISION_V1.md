# DOCUMENTATION ARCHITECTURE DECISION V1

## Estado

APROBADO

## Fecha

2026-11-10

## Propósito

Explicar el modelo documental oficial del proyecto SIGCTIARURAL.

## Decision D-001

SOURCE OF TRUTH

docs/

Justificación: docs/ es el repositorio Git principal del proyecto con 269+ archivos, el que utilizan los desarrolladores y el sistema CI/CD. Contiene documentación operativa, de gobernanza, estado canónico, arquitectura vigente y decisiones. Es la fuente única para resolver conflictos documentales y consultas operacionales, y el **punto único de entrada oficial** del proyecto (ver `CANONICAL_PROJECT_STATE_20261109.md` §8, sección «Gobernanza»). El repositorio `Documentacion/` (memoria técnica especializada TOSHIBA) se conserva y se referencia, pero **no** constituye un segundo punto de entrada.

## Decision D-002

Documentacion/

LEGACY CMSC ARCHITECTURE REPOSITORY

Justificación: Documentacion/ se preserva como repositorio de arquitectura y diseño CMSC puros. No es fuente primaria para operaciones del proyecto. Su función es preservar trazabilidad histórica, documentación fundacional CMSC, blueprints, diseños conceptuales y documentación de referencia. Entra en proceso de absorción controlada hacia docs/.

## Decision D-003

Política de resolución de conflictos documentales.

Si existe contradicción, la jerarquía es:

1. docs/
2. CANONICAL_PROJECT_STATE_20261109.md
3. AGENTS.md
4. DOCUMENTATION_GOVERNANCE_REVIEW.md
5. MASTERDOC.md
6. Documentacion/

Explicación: La resolución comienza por la fuente de verdad canonical (docs/), luego se consulta el estado canónico oficial, luego las reglas de agente, luego la gobernanza documental, luego el masterdoc y por último el repositorio legacy para contexto histórico. Nunca se consulta Documentacion/ antes que docs/ en conflictos operacionales.

## Decision D-004

Comportamiento obligatorio para futuras IA y agentes.

Reglas:

1. Consultar siempre docs/ primero para cualquier duda documental.
2. Nunca usar Documentacion/ como fuente para decisiones operacionales.
3. Validar cualquier cambio contra AGENTS.md antes de ejecutarlo.
4. Cross-checkear siempre contra CANONICAL_PROJECT_STATE_20261109.md.
5. Respetar la jerarquía D-003 ante cualquier contradicción.
6. Marcar cualquier documentación migrada con el timestamp y autor en metadatos.
7. Nunca eliminar documentos de Documentacion/ sin autorización explícita.

Ejemplos:

- ✅ Consultar docs/DOCUMENTATION_GOVERNANCE_REVIEW.md para reglas de governance
- ✅ Consultar docs/CANONICAL_PROJECT_STATE_20261109.md para estado proyecto
- ✅ Revisar AGENTS.md antes de cualquier migración
- ❌ No consultar Documentacion/Architecture/CMSC_MASTERPLAN_v1.md para decisiones de governance
- ❌ No asumir que Documentacion/ es source of truth para conflictos

Qué consultar primero: docs/ (source of truth)
Qué no hacer: No usar Documentacion/ para resolver conflictos operacionales

## Decision D-005

Estrategia oficial de migración.

Gradual.

Controlada.

Reversible.

Nunca masiva.

Cada movimiento debe:

- tener justificación documentada
- preservar historial Git
- actualizar referencias en todos los docs
- validarse contra AGENTS.md
- validarse contra CANONICAL_PROJECT_STATE_20261109.md
- validarse contra DOCUMENTATION_GOVERNANCE_REVIEW.md

## Decision D-006

Documentos prioridad crítica.

- CMSC_MASTERPLAN_v1.md
- CMSC_CANONICAL_STATE_v1.md
- CMSC_SIGNAL_MAP_v1.md
- CMSC_UI_ARCHITECTURE_v1.md
- CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md
- FRONTEND_EXECUTION_STRATEGY.md
- ESTADO_ACTUAL_BENCHMARKS.md

**Alcance (aclaración R1 · cierre CR-A).** Los documentos CMSC listados tienen **prioridad de preservación**. **NO implican autoridad normativa.** **NO sustituyen D-001, D-002 ni D-003.** Su autoridad depende del **estado vigente** determinado por la reconciliación **G-02**:

| Documento | Estado (G-02) |
|---|---|
| `CMSC_MASTERPLAN_v1.md` | HISTORICAL |
| `CMSC_UI_ARCHITECTURE_v1.md` | HISTORICAL |
| `ESTADO_ACTUAL_BENCHMARKS.md` | SUPERSEDED |
| `CMSC_SIGNAL_MAP_v1.md` | REFERENCE |
| `CMSC_CANONICAL_STATE_v1.md` | ACTIVE |
| `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` | ACTIVE |
| `FRONTEND_EXECUTION_STRATEGY.md` | ACTIVE |

Ningún documento listado se elimina. La prohibición de D-004 sobre `CMSC_MASTERPLAN_v1.md` para decisiones de governance **permanece vigente**.

## Decision D-007

Documentos que jamás deben perderse.

- AGENTS.md
- CANONICAL_PROJECT_STATE_20261109.md
- MASTERDOC.md
- DOCUMENTATION_GOVERNANCE_REVIEW.md
- DOCUMENTATION_REPOSITORY_CONSOLIDATION_MASTERPLAN.md
- DOCUMENTATION_MIGRATION_MATRIX.md
- AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md
- HEXAGONAL_REFACTOR_PLAN.md

## Decision D-008

Reglas de preservación histórica.

- Documentacion/ nunca se elimina físicamente
- Todo movimiento debe tener registro en Git
- Los blueprints y diseños conceptuales se conservan en Documentacion/ durante fase de transición
- Los documentos de governance crítica se espejan en docs/ durante transición
- Se mantiene historial Git completo de todos los movimientos

## Decision D-009

Reglas para AGENTS.md.

AGENTS.md debe mantenerse alineado:

1. Siempre reflejar la decisión D-001 (SOURCE OF TRUTH = docs/)
2. Incluir bloque "DOCUMENTATION GOVERNANCE" con las reglas clave
3. Actualizarse whenever se toma decisión de migración documental
4. Mantener la jerarquía D-003 visible y visible
5. Qualquier nuevo documento documental debe referenciarse en AGENTS.md

## Decision D-010

Reglas para futuros copilotos, agentes eIA.

Instrucciones explícitas:

1. Al iniciar, leer obligatoriamente DOCUMENTATION_ARCHITECTURE_DECISION_V1.md
2. La source of truth es siempre docs/, nunca Documentacion/ para conflictos
3. Migraciones solo graduales, controladas y reversibles
4. Consultar lista D-007 antes de cualquier operación crítica
5. Seguir política D-004 sin excepción
6. Reportar cualquier contradicción a través de canales governance

## Compatibilidad

Explicar compatibilidad con:

- AGENTS.md: Decision D-009 especifica cómo mantenerse alineado; bloque "DOCUMENTATION GOVERNANCE" integrado
- CANONICAL_PROJECT_STATE_20261109.md: Decision D-001 compatible; estado canónico declara docs/ como punto de entrada
- MASTERDOC.md: Decision D-003 jerarquía compatible con sección Masterdoc
- DOCUMENTATION_GOVERNANCE_REVIEW.md: Decision D-003 jerarquía compatible; governance review validada
- DOCUMENTATION_REPOSITORY_CONSOLIDATION_MASTERPLAN.md: Decision D-005 estrategia compatible; masterplan validado
- DOCUMENTATION_MIGRATION_MATRIX.md: Decision D-005 estrategia compatible; matriz validada

## Resolución final

El debate:

docs/
vs
Documentacion/

queda oficialmente cerrado.

Con la decisión D-001 (docs/ = source of truth) y D-002 (Documentacion/ = LEGACY CMSC Architecture Repository), la clasificación institucional queda definitiva. Cualquier IA, agente o copiloto futuro debe seguir la jerarquía D-003 ante cualquier contradocumental. La migración gradual y Documentacion/ como repositorio legacy garantiza trazabilidad y preservación histórica sin riesgos de pérdida de información.

## Compatibilidad con AGENTS.md

Bloque listo para insertar en AGENTS.md (máximo 30 líneas):

```
# DOCUMENTATION GOVERNANCE

Source of truth: docs/ (Decision D-001). Documentacion/ is LEGACY CMSC Architecture Repository (Decision D-002). Policy of resolution: hierarchy D-003 (docs/ > CANONICAL_PROJECT_STATE > AGENTS.md > DOCUMENTATION_GOVERNANCE_REVIEW > MASTERDOC > Documentacion/). No massive migrations (Decision D-005). Priority documents: D-006. Critical documents: D-007. AGENTS.md rules: D-009. IA/agents follow D-010. Debate docs/ vs Documentacion/ officially closed. Gradual, controlled and reversible migration with Git traceability.
```

## Compatibilidad con CANONICAL_PROJECT_STATE_20261109.md

Decision D-001 compatible: estado canónico declara docs/ como punto único de entrada. Decision D-003 jerarquía consistente con sección Masterdoc. Decision D-006 documentos prioritarios listados en estado canónico.

## Compatibilidad con MASTERDOC.md

Decision D-003 jerarquía compatible con sección Masterdoc. Decision D-006 documentos prioritarios incluyen Masterdoc.

## Compatibilidad con DOCUMENTATION_GOVERNANCE_REVIEW.md

Decision D-003 jerarquía compatible; governance review validada. Decision D-006 documentos prioritarios incluyen governance review.

## Compatibilidad con DOCUMENTATION_REPOSITORY_CONSOLIDATION_MASTERPLAN.md

Decision D-005 estrategia compatible; masterplan validado. Decision D-005 estrategia gradual/controlada/reversible masterplan.

## Compatibilidad con DOCUMENTATION_MIGRATION_MATRIX.md

Decision D-005 estrategia compatible; matriz validada. Decision D-005 acción gradual/controlada/reversible matriz.

## Resolución final

El debate:

docs/
vs
Documentacion/

queda oficialmente cerrado.

Con la decisión D-001 (docs/ = source of truth) y D-002 (Documentacion/ = LEGACY CMSC Architecture Repository), la clasificación institucional queda definitiva. Cualquier IA, agente o copiloto futuro debe seguir la jerarquía D-003 ante cualquier contradocumental. La migración gradual y Documentacion/ como repositorio legacy garantiza trazabilidad y preservación histórica sin riesgos de pérdida de información.

---
*Decision Arquitectural Oficial V1. Institucionaliza la gobernanza documental para SIGCTIARURAL. Aprobado con ajustes. Sin modificaciones al repositorio, sin migraciones ejecutadas, sin commits.*