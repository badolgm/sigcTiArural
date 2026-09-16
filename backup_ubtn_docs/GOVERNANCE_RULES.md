# GOVERNANCE_RULES.md

Este archivo extrae, textualmente y sin resumir, el contenido de gobernanza de `SIGCT_RURAL_SYSTEM_BOOT.md` (16-jul-2026) que sigue vigente hoy. El resto de ese documento (estado operativo, incidentes, próxima acción obligatoria) quedó parcialmente superado por el trabajo verificado en las sesiones del 20/21-jul-2026 — ver la nota de cabecera en `SIGCT_RURAL_SYSTEM_BOOT.md` para el detalle sección por sección. Las tres piezas de abajo no dependían de ese estado operativo y siguen aplicando sin cambios.

---

## Checklist de cierre de sesión

*(Sección 16 de `SIGCT_RURAL_SYSTEM_BOOT.md`, textual)*

Antes de terminar una sesión, cualquier IA debe verificar:

1. si dejó evidencia persistida en archivos nuevos o actualizados
2. si el resultado quedó materializado físicamente en el repositorio
3. si documentó con claridad qué quedó resuelto
4. si documentó con claridad qué sigue abierto
5. si dejó explícita la siguiente acción recomendada
6. si evitó dejar decisiones ambiguas o dobles lecturas
7. si el estado final quedó alineado con las restricciones del usuario
8. si no abrió una nueva línea arquitectónica innecesaria

---

## Regla final de precedencia

*(Sección 18, punto 8 de `SIGCT_RURAL_SYSTEM_BOOT.md`, textual)*

Si dos fuentes parecen contradecirse, la precedencia correcta es:

1. documento específico más reciente del tema
2. documentos canónicos `docs/eiarc/02_ARCHITECTURE/`
3. código real y migraciones cuando el tema es comportamiento o esquema ejecutable
4. inventarios y auditorías generales
5. documentos históricos o dumps desactualizados

---

## Reglas de gobernanza documental — bitácora técnica y refactorización hexagonal (FASE 7L/7M)

*(Sección 18, punto 9 de `SIGCT_RURAL_SYSTEM_BOOT.md`, textual)*

Estas reglas resuelven de forma definitiva el conflicto de gobernanza identificado entre `docs/MASTERDOC.md` y `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md`, y formalizan el rol de `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`:

**REGLA 1** — `docs/MASTERDOC.md` (en particular su Sección 5, "Bitácora de Intervenciones Técnicas") es la **bitácora oficial** del proyecto. No existe otra bitácora con estatus canónico equivalente.

**REGLA 2** — Ante cualquier discrepancia entre `docs/MASTERDOC.md` y `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` (por ejemplo, cifras o cronologías divergentes sobre el mismo evento), **prevalece `docs/MASTERDOC.md`**. `INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` se conserva como documentación histórica secundaria por su valor de continuidad (contiene sesiones de trabajo, como las de 17-feb y 23-may-2026, no registradas en MASTERDOC), pero no tiene estatus de fuente de verdad.

**REGLA 3** — `docs/PLAN_MAESTRO.md` manda sobre el roadmap y el estado de fases del proyecto (qué fase está activa, completada o planificada).

**REGLA 4** — `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` manda sobre el detalle técnico de implementación de la refactorización hexagonal (backlog granular, estructura objetivo de `contexts/`, guía de reanudación) cuando ese detalle no está cubierto o es más granular que `docs/PLAN_MAESTRO.md`. Ante conflicto entre ambos sobre el **estado de una fase**, prevalece PLAN_MAESTRO.md (REGLA 3); ante conflicto sobre el **detalle técnico de una tarea**, prevalece ADSO_GUIA_TECNICA (REGLA 4).
