ASUS DOCUMENTATION FINAL CLASSIFICATION
========================================

1. TABLA FINAL

| Archivo | Clasificación | Justificación | Acción recomendada |
|---|---|---|---|
| `docs/ASUS_GOVERNANCE_INTEGRATION_REVIEW.md` | **KEEP** | Valida la integración ASUS→Toshiba tramo B; decide "ASUS source of truth documental: SI CON RESERVAS"; clasifica 13 entregables Toshiba (4 KEEP+1MERGE+7ARCHIVE+1LOCAL_EVIDENCE_ONLY). Documento canonical de gobernanza. | Preservar en repositorio canonical |
| `docs/ASUS_INTEGRATION_EXECUTION_REPORT.md` | **KEEP** | Evidencia física validada: 13 archivos Toshiba (~65.7 MB), estructura dataset acústico (46 dir·20 arch), 1 WAV real (silencio), estado `PREPARADO_VACIO`. Reporte de evidencia técnica consolidada 2026-10-09. | Preservar en repositorio canonical |
| `docs/ASUS_WORKSTREAM_CLOSURE.md` | **KEEP** | Cierra el workstream ASUS: decisión benchmark M1 vs M2 (M1 baseline oficial congelado, M2 challenger validado macro-F1 0.9937, decisión pendiente por diseño). Cierra el workstream ASUS. | Preservar en repositorio canonical |
| `docs/OBSOLETE_VALIDATION.md` | **KEEP** | Validación específica que clasifica tres documentos (DEPLOYMENT.md, CONTINUITY_RUNBOOK.md, ECOSYSTEM_IDENTITY.md) determinando que son `OUTDATED` no `OBSOLETE`. Establece la diferencia entre OBSOLETE (nulo valor) vs OUTDATED (valor parcial, necesita actualización). Corrige clasificación previa de gobernanza que los había etiquetado como OBSOLETE. Contiene regla reutilizable: "un documento es OBSOLETE solo si TODO su contenido está superado y no aporta valor vigente". Valida por qué DEPLOYMENT.md, CONTINUITY_RUNBOOK.md, ECOSYSTEM_IDENTITY.md no deben clasificarse como OBSOLETE. | Preservar en repositorio canonical - autoridad para clasificación OBSOLETE/OUTDATED |
| `docs/ASUS_INTEGRATION_EXECUTION_PLAN.md` | **ARCHIVE** | Contiene planes operativos: GDS2_CAPTURE_PLAN_V1 y CAPTURE_PILOT_V1. 80 clips reales (10×8 clases), 8 sesiones (pilot_s01→pilot_s08), flujo S30→Bridge Logger→POST/ingest→metadata.csv→features→split→validate. Plan de misión, no core canonical. | Archivar fuera del commit canonical principal |
| `docs/ASUS_TOSHIBA_INTEGRATION_FILE_ROUTING.md` | **ARCHIVE** | Detalle de ruteo de archivos Toshiba entre equipos ASUS y Toshiba. Desde clasificación anterior: ARCHIVE ONLY. Información de detalle operativo preservada pero no núcleo canonical. | Archivar fuera del commit canonical principal |
| `CAPTURE_PILOT_V1.md` (raíz) | **OPERATIONAL_PLAN** | Plan operativo pilot V1: 80 clips reales (10×8 clases), 8 sesiones (pilot_s01→pilot_s08), place_ids site_a/site_b/site_c, distribución exacta por clase, flujo S30→Bridge Logger→POST/ingest→metadata.csv→acoustic_features_v2.csv→split→validate. Documento deplan de pilot ejecutado. | Documento operativo, no commit canonical inmediato |
| `COMMIT_CANDIDATES_V1.md` (raíz) | **LOCAL_ONLY** | Documento de planificación de sesión generado durante ejecución: qué archivar, qué commit. Material de trabajo interno, no documentación canonical del repositorio. | Mantener fuera del commit canonical, uso sesión solo |
| `STAGE_FREEZE_20261013.txt` (raíz) | **LOCAL_ONLY** | Marcador de congelación de sesión 2026-10-13. Indicador temporal de estado de sesión en curso, no documentación canonical del repositorio. | Mantener fuera del commit canonical, uso sesión solo |

2. RESUMEN EJECUTIVO

Cantidad total por clasificación:

- **KEEP:** 4 archivos (`ASUS_GOVERNANCE_INTEGRATION_REVIEW.md`, `ASUS_INTEGRATION_EXECUTION_REPORT.md`, `ASUS_WORKSTREAM_CLOSURE.md`, `OBSOLETE_VALIDATION.md`)
- **ARCHIVE:** 2 archivos (`ASUS_INTEGRATION_EXECUTION_PLAN.md`, `ASUS_TOSHIBA_INTEGRATION_FILE_ROUTING.md`)
- **OPERATIONAL_PLAN:** 1 archivo (`CAPTURE_PILOT_V1.md`)
- **LOCAL_ONLY:** 3 archivos (`COMMIT_CANDIDATES_V1.md`, `STAGE_FREEZE_20261013.txt`)

NOTA SOBRE OBSOLETE_VALIDATION.md: Esta clasificación KEEP se basa en que el documento establece la regla de diferenciación OBSOLETE vs OUTDATED con matriz de criterios, corrige una clasificación previa de gobernanza que había etiquetado los tres documentos referenciados como OBSOLETE (ahora clasificados adecuadamente como OUTDATED), y sirve como autoridad para esta distinción en el ecosistema. El documento mismo conclude: "Ninguno de los tres es OBSOLETE. Los tres conservan valor vigente y son candidatos a actualización/refresco, no a eliminación."

3. PROPUESTA DE COMMIT

Los siguientes archivos deberían incluirse en el próximo commit documental por ser KEEP (fuente de verdad canonical):

1. `docs/ASUS_GOVERNANCE_INTEGRATION_REVIEW.md` - Gobierno y decisiones de integración ASUS-Toshiba
2. `docs/ASUS_INTEGRATION_EXECUTION_REPORT.md` - Evidencia técnica validada de integración
3. `docs/ASUS_WORKSTREAM_CLOSURE.md` - Cierre workstream y decisión benchmark M1/M2
4. `docs/OBSOLETE_VALIDATION.md` - Regla de diferenciación OBSOLETE/OUTDATED y validación de clasificaciones documentales

**Total: 4 archivos KEEP para commit siguiente.**

4. EXCLUSIONES

Los siguientes archivos NO deberían entrar al próximo commit documental:

1. `docs/ASUS_INTEGRATION_EXECUTION_PLAN.md` - Plan operativo (ARCHIVE/OPERATIONAL_PLAN)
2. `docs/ASUS_TOSHIBA_INTEGRATION_FILE_ROUTING.md` - Ruteo de archivos (ARCHIVE)
3. `CAPTURE_PILOT_V1.md` - Plan pilot (OPERATIONAL_PLAN)
4. `COMMIT_CANDIDATES_V1.md` - Planificación sesión (LOCAL_ONLY)
5. `STAGE_FREEZE_20261013.txt` - Congelación sesión (LOCAL_ONLY)

**Total: 5 archivos excluidos del commit canonical.**

5. RIESGOS - Contraste entre documentos referenciados

| Contraste | Hallazgo | Evaluación |
|---|---|---|
| **GOVERNANCE_REVIEW vs OBSOLETE_VALIDATION** | GOVERNANCE_REVIEW.valida evidencias actuales de integración ASUS-Toshiba; OBSOLETE_VALIDATION.md contiene validaciones de clasificación documentales y regla OBSOLETE/OUTDATED | **Sin contradicción de fondo**: GOVERNANCE_REVIEW cierra tramo B integración; OBSOLETE_VALIDATION.md establece regla de clasificación documentale. El cambio de KEEP a KEEP (mantenerlo canonical) alinea ambas, ya que OBSOLETE_VALIDATION.md es la autoridad para esta distinción. |
| **CANONICAL_PROJECT_STATE vs GOVERNANCE_REVIEW** | Estado canónico refleja integración completada (M1/M2, dataset congelado); GOVERNANCE_REVIEW cierra tramo B ASUS-Toshiba | **Sin contradicción**: Diferentes iniciativas. CANONICAL_PROJECT_STATE_20261109.md §12 declara "SÍ condicionado" para CMSC implementación; GOVERNANCE_REVIEW.md cierra tramo B ASUS-Toshiba. Diferentes proyectos, consistentes. |
| **CONSOLIDATION_PLAN vs OBSOLETE_VALIDATION** | Consolidation plan 2026-09-29 agrupa 24 docs producidos; OBSOLETE_VALIDATION.md es validación de clasificación documentale | **Sin contradicción**: CONSOLIDATION_PLAN.md es el plan de ciclo completo; OBSOLETE_VALIDATION.md es documento de validación de clasificaciones, forma parte del historial sin conflicto. Su clasificación KEEP es coherente. |
| **Consistencia general** | 4 KEEP coherentes con estado proyecto: M1 baseline congelado, M2 challenger validado, G-DS-3 PASS, dataset structure verified, y ahora también regla OBSOLETE/OUTDATED definida y aplicada | **Totalmente consistente** sin contradicciones que requieran acción nueva. La clasificación KEEP de OBSOLETE_VALIDATION.md refuerza el marco de governance en lugar de crear conflicto. |

3. PROPUESTA DE COMMIT

Archivos que deberían incluirse en el próximo commit documental (clasificados como KEEP):

1. `docs/ASUS_GOVERNANCE_INTEGRATION_REVIEW.md` - Gobierno y decisiones de integración ASUS-Toshiba
2. `docs/ASUS_INTEGRATION_EXECUTION_REPORT.md` - Evidencia técnica validada de integración
3. `docs/ASUS_WORKSTREAM_CLOSURE.md` - Cierre workstream y decisión benchmark M1/M2
4. `docs/OBSOLETE_VALIDATION.md` - Regla de diferenciación OBSOLETE/OUTDATED y autoridad de validación documental

**Comando git recomendado:**
```
git add docs/ASUS_GOVERNANCE_INTEGRATION_REVIEW.md
git add docs/ASUS_INTEGRATION_EXECUTION_REPORT.md
git add docs/ASUS_WORKSTREAM_CLOSURE.md
git add docs/OBSOLETE_VALIDATION.md
```

4. EXCLUSIONES

Archivos que NO deberían entrar al próximo commit:

1. `docs/ASUS_INTEGRATION_EXECUTION_PLAN.md` - Plan operativo, no canonical core
2. `docs/ASUS_TOSHIBA_INTEGRATION_FILE_ROUTING.md` - Ruteo de archivos, detalle operativo ARCHIVE
3. `CAPTURE_PILOT_V1.md` - Plan pilot, OPERATIONAL_PLAN
4. `COMMIT_CANDIDATES_V1.md` - Planificación sesión, LOCAL_ONLY
5. `STAGE_FREEZE_20261013.txt` - Congelación sesión, LOCAL_ONLY

**Total: 5 archivos excluidos del commit canonical.**

5. RIESGOS - Contraste entre documentos referenciados

| Contraste | Hallazgo | Evaluación |
|---|---|---|
| **GOVERNANCE_REVIEW vs OBSOLETE_VALIDATION** | GOVERNANCE_REVIEW.valida evidencias actuales de integración ASUS-Toshiba; OBSOLETE_VALIDATION.md contiene regla OBSOLETE/OUTDATED y validación de clasificaciones documentales | **Sin contradicción de fondo**: GOVERNANCE_REVIEW cierra tramo B integración; OBSOLETE_VALIDATION.md establece regla de clasificación documentale y corrige clasificación previa. Mantener OBSOLETE_VALIDATION.md KEEP alinea ambas, ya que es la autoridad para esta distinción. |
| **CANONICAL_PROJECT_STATE vs GOVERNANCE_REVIEW** | Estado canónico refleja integración completada (M1/M2, dataset congelado); GOVERNANCE_REVIEW cierra tramo B ASUS-Toshiba | **Sin contradicción**: Diferentes iniciativas. CANONICAL_PROJECT_STATE_20261109.md §12 declara "SÍ condicionado" para CMSC implementación; GOVERNANCE_REVIEW.md cierra tramo B ASUS-Toshiba. Diferentes proyectos, consistentes. |
| **CONSOLIDATION_PLAN vs OBSOLETE_VALIDATION** | Consolidation plan 2026-09-29 agrupa 24 docs producidos; OBSOLETE_VALIDATION.md es validación de clasificación documentale | **Sin contradicción**: CONSOLIDATION_PLAN.md es el plan de ciclo completo; OBSOLETE_VALIDATION.md es documento de validación de clasificaciones, forma parte del historial sin conflicto. Su clasificación KEEP es coherente. |
| **Consistencia general** | 4 KEEP coherentes con estado proyecto: M1 baseline congelado, M2 challenger validado, G-DS-3 PASS, dataset structure verified, y ahora regla OBSOLETE/OUTDATED definida y aplicada | **Totalmente consistente** sin contradicciones que requieran acción nueva. La clasificación KEEP de OBSOLETE_VALIDATION.md refuerza el marco de governance en lugar de crear conflicto. |

---
*Clasificación final generada a partir de hallazgos documentados en: DOCUMENTATION_GOVERNANCE_REVIEW.md, DOCUMENTATION_CONSOLIDATION_PLAN.md, CANONICAL_PROJECT_STATE_20261109.md, ASUS_GOVERNANCE_INTEGRATION_REVIEW.md, ASUS_INTEGRATION_EXECUTION_REPORT.md, ASUS_WORKSTREAM_CLOSURE.md, OBSOLETE_VALIDATION.md. Clasificación OBSOLETE_VALIDATION.md ajustada a KEEP tras validación de su contenido y propósito. Sin modificar código, Docker, frontend, backend. Sin mover archivos. Sin commit. Sin push.*