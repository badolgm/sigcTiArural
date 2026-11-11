# OBSOLETE_VALIDATION

**Misión:** validación específica de `DEPLOYMENT.md`, `CONTINUITY_RUNBOOK.md` y `ECOSYSTEM_IDENTITY.md` para determinar si son `OBSOLETE` u `OUTDATED`.
**Fecha:** 2026-11-04.
**Restricciones:** sin modificar archivos, sin commit, sin push, sin merge. Único entregable: este archivo.

## 1. Diferencia entre OBSOLETE y OUTDATED

| Criterio | OBSOLETE | OUTDATED |
|---|---|---|
| **Valor actual** | Nulo. El documento ya no sirve para ninguna decisión ni ejecución. | Parcial. Contiene información aún útil, pero desactualizada o incompleta. |
| **Superseded** | Totalmente. Otro documento lo reemplaza por completo y el original no aporta nada nuevo. | Parcialmente. Parte del contenido sigue vigente; otra parte fue superada. |
| **Acción recomendada** | Candidato a eliminación (solo con autorización explícita). | Candidato a actualización/refresco; no eliminar. |
| **Riesgo de borrar** | Bajo (si se confirma que nada lo referencia). | Alto (se perdería información aún vigente). |
| **Ejemplo típico** | Bitácora de sesión, nota de freeze, índice estático. | Documento con sección canónica reciente + cola histórica stale; runbook con procedimiento vigente pero estado antiguo. |

**Regla aplicada:** un documento es `OBSOLETE` solo si **todo** su contenido está superado y no aporta valor vigente. Si conserva **alguna** sección vigente, es `OUTDATED`.

## 2. Validación por documento

### 2.1 `docs/DEPLOYMENT.md`

- **Ubicación:** `docs/DEPLOYMENT.md`
- **Tamaño/fecha:** 5 374 bytes; canónico antepuesto el 2026-10-30 (L-5), contenido histórico del 2026-08-21.
- **Hallazgo:** el documento **ya fue corregido por delante** (sección canónica §1-§3, 2026-10-30) que declara el despliegue real (`docker-compose.yml`, servicios, puertos, healthchecks, contrato de procedencia L-1/L-2, rutas 5173/5174). La cola histórica (§"HISTÓRICO 2026-08-21") conserva afirmaciones hoy falsas ("el repositorio no incluye docker-compose.yml") pero está explícitamente marcada como histórica.
- **Valor vigente:** SÍ — la sección canónica es la referencia viva del despliegue Docker y del contrato de procedencia.
- **Clasificación:** **OUTDATED** (no OBSOLETE). El documento conserva valor vigente en su sección canónica; solo su cola histórica está stale. Acción recomendada: limpiar/extraer la cola histórica a un archivo de archivo, manteniendo la sección canónica.
- **Riesgo de borrar:** Alto (se perdería el contrato de despliegue vigente).

### 2.2 `docs/CONTINUITY_RUNBOOK.md`

- **Ubicación:** `docs/CONTINUITY_RUNBOOK.md`
- **Tamaño/fecha:** 2 502 bytes; estado verificado 2026-07-04.
- **Hallazgo:** describe un procedimiento de continuidad (`continuity_check.ps1`, `verify_refactor.ps1/.sh`) cuyos scripts **siguen existiendo** en `scripts/`. La procedura es operativa y reproducible. El estado reportado (50 tests, TensorFlow mock) está stale respecto al estado actual (suites backend 4/4, ai_service 20/20, Docker sano), pero el procedimiento en sí sigue siendo válido.
- **Valor vigente:** SÍ — el runbook operativo (comandos, chequeos, archivos clave) sigue siendo útil para retomar el proyecto.
- **Clasificación:** **OUTDATED** (no OBSOLETE). El procedimiento es vigente; solo el estado verificado y las referencias de fecha están stale. Acción recomendada: refrescar el estado verificado y la fecha; no eliminar.
- **Riesgo de borrar:** Medio (se perdería el procedimiento operativo de continuidad).

### 2.3 `docs/ECOSYSTEM_IDENTITY.md`

- **Ubicación:** `docs/ECOSYSTEM_IDENTITY.md`
- **Tamaño/fecha:** 7 467 bytes; 20 de julio de 2026. Se declara "Documento Canónico" de identidad.
- **Hallazgo:** contiene los 4 principios fundacionales (agnóstico de hardware/software, laboratorios comunicables, no LMS, no plataforma IoT), la definición de EIARC y el ciclo central del ecosistema. Estos principios **siguen siendo referenciados** por `AGENTS.md` y por `SIGCTIARURAL_VISION_ALIGNMENT.md` / `SIGCTIARURAL_CANONICAL_PHILOSOPHY_EVOLUTION_v1.md`, que evolucionan (no reemplazan) la identidad. El documento no es totalmente superado: es la fuente de los principios fundacionales.
- **Valor vigente:** SÍ — principios fundacionales y definición de EIARC siguen vigentes; solo la formulación de identidad fue evolucionada por documentos posteriores.
- **Clasificación:** **OUTDATED** (no OBSOLETE). Es fundacional y sigue referenciado; necesita una nota de "evolucionado por" apuntando a los documentos de visión/filosofía, pero no debe eliminarse.
- **Riesgo de borrar:** Alto (se perderían los principios fundacionales y la definición de EIARC).

## 3. Resumen de clasificación

| Documento | Clasificación | Justificación clave |
|---|---|---|
| `DEPLOYMENT.md` | **OUTDATED** | Sección canónica vigente (L-5) + cola histórica stale marcada. |
| `CONTINUITY_RUNBOOK.md` | **OUTDATED** | Procedimiento vigente; estado verificado stale. |
| `ECOSYSTEM_IDENTITY.md` | **OUTDATED** | Principios fundacionales vigentes; identidad evolucionada por docs posteriores. |

**Ninguno de los tres es OBSOLETE.** Los tres conservan valor vigente y son candidatos a actualización/refresco, no a eliminación.

## 4. Corrección respecto a `DOCUMENTATION_GOVERNANCE_REVIEW.md`

La revisión de gobernanza previa clasificó estos tres documentos como `OBSOLETE`. Esta validación específica corrige esa clasificación a `OUTDATED`, porque los tres conservan secciones vigentes:

- `DEPLOYMENT.md` → sección canónica de despliegue Docker (L-5).
- `CONTINUITY_RUNBOOK.md` → procedimiento operativo de continuidad.
- `ECOSYSTEM_IDENTITY.md` → principios fundacionales y definición de EIARC.

La clasificación `OBSOLETE` se reserva para documentos sin valor vigente (`INDICE_PROYECTO.md`, `STAGE_FREEZE_20261013.txt`, `SIGCTIARURAL_ESTADO_SESION_2026-09-14.md`).

## 5. Restricciones respetadas

- Sin modificar archivos, sin commit, sin push, sin merge.
- HEAD `d930a34`; `stash@{0}` intacto.
- Único entregable: este archivo (`OBSOLETE_VALIDATION.md`).
