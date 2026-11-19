# ASUS_TOSHIBA_INTEGRATION_FILE_ROUTING

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-18T22:10:46-05:00
> - Origen: docs/ASUS_TOSHIBA_INTEGRATION_FILE_ROUTING.md
> - Destino: docs/historical/ASUS_TOSHIBA_INTEGRATION_FILE_ROUTING.md (HISTORICAL)

**Propósito:** Documentar exactamente qué archivos se añadirían al repositorio oficial y cuáles permanecerían archivados, basándose en la clasificación final ya aprobada. Sin commit, sin push, sin merge.

**Fecha:** 2026-11-04.
**Clasificación final aprobada:**
- KEEP
- MERGE
- ARCHIVE
- LOCAL

---

## 1. KEEP — Archivos que se añaden al repositorio oficial

**Clasificación:** KEEP
**Ubicación destino:** `docs/architecture/` (canónico bajo `docs/`, versionable en GitHub)
**Acceso:** Público en GitHub

| Nombre archivo | Origen | Acción | Contenido |
|---|---|---|---|
| `ARCHITECTURE_AUDIT_VALIDATION.md` | Sprint Toshiba | Añadir al repositorio | Evidencia técnica de validación de arquitectura |
| `ARCHITECTURE_ACTION_MATRIX.md` | Sprint Toshiba | Añadir al repositorio | Matriz de priorización y trazabilidad |
| `ARCHITECTURE_ACTION_REVIEW.md` | Sprint Toshiba | Añadir al repositorio | Registro de cumplimiento y cierre |
| `C02_EXECUTION_PACKAGE.md` | Sprint Toshiba | Añadir al repositorio | Paquete de ejecución de C-02 |

**Total KEEP:** 4 archivos añadidos al repositorio oficial.

---

## 2. MERGE — Archivo que se fusiona en destino existente

**Clasificación:** MERGE
**Archivo origen:** `C02_IMPLEMENTATION_STRATEGY.md`
**Archivo destino:** `docs/HEXAGONAL_REFACTOR_PLAN.md`
**Acción:** Fusionar el contenido de estrategia de implementación de C-02 al plan rector de refactor hexagonal.
**Restricción:** Requiere autorización explícita de proyecto. No se ejecuta automáticamente.

**Contenido que se fusionaría:**
- Los puntos estratégicos de implementación de C-02 definidos en `C02_IMPLEMENTATION_STRATEGY.md`
- Incorporación como sección estructurada al final de `HEXAGONAL_REFACTOR_PLAN.md`
- Referencia cruzada: `C02 (2026-11-04): implementado PASS`

**Total MERGE:** 1 archivo origen fusionado en 1 archivo destino (lógico, no físico).

---

## 3. ARCHIVE — Archivos que permanecen archivados en el repositorio

**Clasificación:** ARCHIVE
**Ubicación:** Permanecen en sus rutas actuales con rol de evidencia histórica; no se mueven a directorios activos.
**Acceso:** Consultas posteriores; no publicación activa.

| Nombre archivo | Ruta actual | Rol archivado |
|---|---|---|
| `ARCHITECTURE_AUDIT.md` | `docs/architecture/ARCHITECTURE_AUDIT.md` | Auditoría completada — evidencia histórica |
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | `docs/TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | Cierre administrativo del sprint |
| `DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | `docs/DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | Normalización de lenguaje completada |
| `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | `docs/DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | Remediación de lenguaje completada |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | `docs/TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | Revisión de consolidación del sprint |
| `TOSHIBA_EXPORT_MANIFEST.md` | `docs/TOSHIBA_EXPORT_MANIFEST.md` | Manifiesto de paquetes exportados del sprint |
| `TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | `docs/TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | Plan de ejecución de la consolidación |

**Total ARCHIVE:** 7 archivos archivados en rutas actuales.

---

## 4. LOCAL — Archivos que permanecen fuera del repositorio oficial

**Clasificación:** LOCAL
**Ubicación:** Fuera del árbol versionado de GitHub; evidencia local del sprint.
**Acceso:** Interno al proyecto; no publicado en GitHub.

| Nombre archivo | Ruta | Rol local |
|---|---|---|
| `ARCHITECTURE_GOVERNANCE_REVIEW.md` | Fuera de GitHub | Revisión de gobernanza del sprint; uso interno |

**Total LOCAL:** 1 archivo fuera del repositorio oficial.

---

## 5. Resumen de routing

| Clasificación | Cantidad | Acción | Repositorio |
|---|---|---|---|
| KEEP | 4 | Añadir al repositorio | `docs/architecture/` (GitHub) |
| MERGE | 1 | Fusionar en destino | `docs/HEXAGONAL_REFACTOR_PLAN.md` (lógico) |
| ARCHIVE | 7 | Permanecer en rutas actuales | Sin publicación activa |
| LOCAL | 1 | Permanecer fuera | Fuera de GitHub |

**Total archivos contemplados:** 13

---

## 6. Restricciones respetadas

- Sin commit.
- Sin push.
- Sin merge (el MERGE de `C02_IMPLEMENTATION_STRATEGY.md` → `HEXAGONAL_REFACTOR_PLAN.md` requiere autorización explícita posterior).
- Sin análisis nuevos.
- Sin auditorías nuevas.
- Sin revisiones nuevas.
- Clasificación tomada tal cual está aprobada.

---

## 7. Próximos pasos (solo planificación, sin ejecución)

1. **KEEP:** Los 4 archivos KEEP se añadirían a `docs/architecture/` en un commit posterior con autorización.
2. **MERGE:** La fusión `C02_IMPLEMENTATION_STRATEGY.md` → `HEXAGONAL_REFACTOR_PLAN.md` se ejecutaría con orden explícita de proyecto.
3. **ARCHIVE:** Los 7 archivos ARCHIVE permanecerían en sus rutas actuales sin cambios.
4. **LOCAL:** `ARCHITECTURE_GOVERNANCE_REVIEW.md` permanecería fuera de GitHub, disponible internamente.

---

**Fin del routing de archivos.** Esta documentación especifica exactamente la destino de cada archivo bajo la clasificación aprobada, sin ejecutar operaciones de repositorio.