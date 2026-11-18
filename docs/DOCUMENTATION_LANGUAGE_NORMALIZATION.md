# DOCUMENTATION_LANGUAGE_NORMALIZATION.md — SIGC&T Rural

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: DOCUMENTATION_LANGUAGE_NORMALIZATION.md
> - Destino: docs/DOCUMENTATION_LANGUAGE_NORMALIZATION.md

**Rama:** `toshiba/architecture-audit`  
**Fecha:** 2026-11-04  
**Alcance:** 9 documentos generados durante el Sprint de Auditoría Toshiba  
**Instrucción:** Solo propuesta de normalización. No modificar documentos. No hacer commit. No hacer push. No hacer merge.

---

## Objetivo

Identificar expresiones en los documentos generados durante el Sprint Toshiba que hacen referencia explícita a IA, revisión humana, mecanismo de generación o lenguaje no apropiado para documentación permanente del proyecto, y proponer reemplazos con lenguaje institucional, técnico y de gobernanza consistente con SIGCT-Rural.

---

## Expresiones encontradas y recomendaciones

### 1. "decisión humana posterior"

| Documento | Línea | Texto actual | Texto recomendado | Justificación |
|---|---|---|---|---|
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | 13 | "decisiones humanas posteriores sobre cuándo y cómo ejecutar cada acción" | "decisiones de gobernanza posteriores sobre cuándo y cómo ejecutar cada acción" | Elimina referencia a persona humana; sustituye por instancia de decisión del proyecto (gobernanza). |
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | 285 | "El backlog técnico queda listo para decisión humana posterior sobre cuándo y cómo ejecutar cada acción." | "El backlog técnico queda listo para decisión de gobernanza posterior sobre cuándo y cómo ejecutar cada acción." | Igual que arriba; "decisión humana" no es apropiado en documentación permanente. |

---

### 2. "Listo para revisión humana" / "listo para revisión humana"

| Documento | Línea | Texto actual | Texto recomendado | Justificación |
|---|---|---|---|---|
| `C02_EXECUTION_PACKAGE.md` | 5 | "Estado: Aprobado conceptualmente · Listo para revisión humana" | "Estado: Aprobado conceptualmente · Listo para revisión arquitectónica" | "Revisión humana" implica persona física; "revisión arquitectónica" es instancia técnica del proyecto. |
| `C02_EXECUTION_PACKAGE.md` | 276 | "Fin del paquete de ejecución C-02. No se escribió código. No se modificó nada. Listo para revisión humana." | "Fin del paquete de ejecución C-02. No se escribió código. No se modificó nada. Listo para revisión arquitectónica." | Igual que arriba. |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 36 | "Conocimiento oficial (paquete de ejecución listo para humano)" | "Conocimiento oficial (paquete de ejecución listo para revisión técnica)" | "Listo para humano" es coloquial y referencia persona; "listo para revisión técnica" es institucional. |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 48 | "No subir como documentación activa a GitHub sin revisión humana que determine si se fusiona con MASTERDOC." | "No subir como documentación activa a GitHub sin revisión técnica que determine si se fusiona con MASTERDOC." | Elimina referencia a persona humana. |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 96 | "Consolidar (MERGE) con docs/HEXAGONAL_REFACTOR_PLAN.md FASE 3 en revisión humana posterior." | "Consolidar (MERGE) con docs/HEXAGONAL_REFACTOR_PLAN.md FASE 3 en revisión técnica posterior." | Igual que arriba. |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 164 | "...bajo revisión humana que decida si se fusiona o se descarta." | "...bajo revisión técnica que decida si se fusiona o se descarta." | Igual que arriba. |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 170 | "...tras revisión humana que confirme que no duplican documentación canónica..." | "...tras revisión técnica que confirme que no duplican documentación canónica..." | Igual que arriba. |

---

### 3. "aprobada por un humano"

| Documento | Línea | Texto actual | Texto recomendado | Justificación |
|---|---|---|---|---|
| `C02_EXECUTION_PACKAGE.md` | 58 | "El archivo apps.py se crea únicamente durante la ejecución aprobada por un humano." | "El archivo apps.py se crea únicamente durante la ejecución autorizada por el proyecto." | "Aprobado por un humano" referencia persona; "autorizada por el proyecto" es instancia de gobernanza. |
| `C02_EXECUTION_PACKAGE.md` | 232 | "Un humano ha revisado y aprobado los cambios en settings.py y apps.py." | "Se ha revisado y aprobado los cambios en settings.py y apps.py." | Elimina sujeto "humano"; se deja la acción de revisión/aprobación sin agente específico. |

---

### 4. "revisor humano" / "que un humano decida" / "que un humano revise"

| Documento | Línea | Texto actual | Texto recomendado | Justificación |
|---|---|---|---|---|
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 63 | "Su valor es para el revisor humano que quiera entender el criterio de clasificación usado." | "Su valor es para el revisor técnico que quiera entender el criterio de clasificación usado." | "Revisor humano" → "revisor técnico". |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 71 | "Debe conservarse para que un humano decida qué ejecutar en próximos sprints." | "Debe conservarse para que el proyecto decida qué ejecutar en próximos sprints." | "Que un humano decida" → "que el proyecto decida". |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 101 | "Es el único documento listo para ejecución humana de C-02." | "Es el único documento listo para ejecución técnica de C-02." | "Ejecución humana" → "ejecución técnica". |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 103 | "Listo para que un humano revise y ejecute C-02 sin generar nueva documentación." | "Listo para que el proyecto revise y ejecute C-02 sin generar nueva documentación." | "Que un humano revise" → "que el proyecto revise". |

---

### 5. "generados" (referencia a mecanismo de generación)

| Documento | Línea | Texto actual | Texto recomendado | Justificación |
|---|---|---|---|---|
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 5 | "Estado: Sprint Toshiba completado · 8 entregables generados" | "Estado: Sprint Toshiba completado · 8 entregables elaborados" | "Generados" puede leerse como referencia a mecanismo automático de generación; "elaborados" es neutro e institucional. |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | 12 | "Se revisaron los 8 entregables generados durante el Sprint de Auditoría Toshiba..." | "Se revisaron los 8 entregables elaborados durante el Sprint de Auditoría Toshiba..." | Igual que arriba. |

---

## Resumen de cambios propuestos

| Categoría de expresión | Cantidad de ocurrencias | Documentos afectados |
|---|---|---|
| "decisión humana" | 2 | TOSHIBA_AUDIT_SPRINT_CLOSURE.md |
| "revisión humana" / "listo para revisión humana" | 7 | C02_EXECUTION_PACKAGE.md, TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md |
| "aprobado por un humano" / "Un humano ha revisado" | 2 | C02_EXECUTION_PACKAGE.md |
| "revisor humano" / "que un humano decida" / "que un humano revise" | 4 | TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md |
| "ejecución humana" | 1 | TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md |
| "generados" (mecanismo de generación) | 2 | TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md |
| **Total** | **18** | **5 documentos** |

---

## Documentos sin expresiones problemáticas

Los siguientes documentos no contienen referencias a IA como proceso de generación, revisión humana, ni mecanismo de generación:

- `ARCHITECTURE_AUDIT.md`
- `ARCHITECTURE_AUDIT_VALIDATION.md`
- `ARCHITECTURE_ACTION_MATRIX.md`
- `ARCHITECTURE_ACTION_REVIEW.md`
- `C02_IMPLEMENTATION_STRATEGY.md`

Nota: En `ARCHITECTURE_AUDIT.md` (L71) y `ARCHITECTURE_GOVERNANCE_REVIEW.md` (L123, L188) aparecen referencias a "IA" como dominio del servicio de inteligencia artificial del proyecto (`adaptadores de IA`, `IA service`, `smoke test de IA`). Estas son terminología legítima del dominio del sistema (servicio de IA de predicción de enfermedades de plantas) y **no** hacen referencia al proceso de generación de documentación, por lo que no se proponen cambios.

---

## Criterio de lenguaje institucional

Las expresiones reemplazadas siguen el patrón:

| Referencia a evitar | Sustitución institucional |
|---|---|
| decisión humana | decisión de gobernanza / decisión de proyecto |
| revisión humana | revisión técnica / revisión arquitectónica |
| aprobado por un humano | autorizado por el proyecto |
| un humano ha revisado | se ha revisado (sin agente) |
| revisor humano | revisor técnico |
| que un humano decida | que decida el proyecto |
| que un humano revise | que revise el proyecto |
| ejecución humana | ejecución técnica |
| generados | elaborados |

---

**Fin de la propuesta de normalización. No se modificó ningún documento.**