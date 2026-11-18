# TOSHIBA — INFORME DE RECONCILIACIÓN Y CIERRE DEFINITIVO

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: docs/TOSHIBA_FINAL_RECONCILIATION_REPORT.md
> - Destino: docs/TOSHIBA_FINAL_RECONCILIATION_REPORT.md

**Fecha:** 2026-11-15
**Alcance:** Reconciliación final Toshiba → Sprint Final. Sin auditorías nuevas, sin hallazgos nuevos por exploración, sin reapertura de decisiones cerradas.
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `004deb8`
**Acciones Git ejecutadas:** ninguna (0 add, 0 commit, 0 push, 0 mv).

**Documentos de referencia considerados:** `ARCHITECTURE_AUDIT.md` · `ARCHITECTURE_AUDIT_VALIDATION.md` · `ARCHITECTURE_GOVERNANCE_REVIEW.md`

---

## 1. CAMBIOS REALES DE CÓDIGO

### Estado verificado del árbol

| Archivo | Estado Git | Cambio real |
|---|---|---|
| `tools/cmsc-data-logger/src/cli.js` | `M` (modificado, sin commit) | `import` de `./dataset.js` ampliado con `ensureDir, nowIso` |
| `src/backend/sigct_backend/settings.py` | `M` (modificado, sin commit) | `'sigct_backend'` añadido a `INSTALLED_APPS` |
| `src/backend/sigct_backend/apps.py` | `??` (archivo nuevo, sin seguimiento) | `SigctBackendConfig.ready()` importa dependencias de telemetría y construye el event bus |

Diff efectivo (único en cada archivo modificado):

```diff
# tools/cmsc-data-logger/src/cli.js
-  loadEnvelopes, saveEnvelopes
+  loadEnvelopes, saveEnvelopes, ensureDir, nowIso

# src/backend/sigct_backend/settings.py
     # Aplicaciones del Proyecto
+    'sigct_backend',
     'api',
```

### Clasificación

| Cambio | Clasificación | Impacto funcional real |
|---|---|---|
| `cli.js` → `ensureDir, nowIso` | **MANTENER** | El comando `split` usaba `ensureDir` (L845/L855) y `nowIso` (L864) sin importarlos: fallaba con `ReferenceError` antes de escribir `split_report.json`. Con el import, `split` ejecuta y escribe `split_lists/{train,validation,test}.csv`, `holdout/holdout_samples.csv` y `split_report.json`. Verificado: `G-DS-3` y `G-DS-4` dan **PASS** en la corrida actual. Sin este import, el dataset no puede avanzar de `CAPTADO_INICIAL`. |
| `apps.py` (nuevo) + `settings.py` (`'sigct_backend'`) | **INTEGRAR** (indivisible) | Solo juntos tienen efecto. `settings.py` registra el paquete del proyecto como app; `apps.py` aporta el `ready()` que en el arranque de Django ejecuta `get_telemetry_event_bus()` → `InMemoryEventBus` + `sigct_backend.wiring.wire_all(bus)`. Efecto real: el bus de eventos de telemetría queda cableado una vez por proceso (`@lru_cache(maxsize=1)`), de modo que al publicar una `LecturaSensor` la señal `sensor_reading` alcanza `OnSensorReadingHandler` (contexts/labs) sin depender de que un llamador lo construya. Verificado: la ruta `contexts/telemetry/infrastructure/config/dependencies.py` existe y `get_telemetry_event_bus()` es importable desde ahí. |
| — | **DESCARTAR** | **Ninguno.** No hay cambio de código en revisión que deba descartarse. |

### Condición de integración (obligatoria, no ejecutada)

`settings.py` y `apps.py` **no son separables**. Si se commitea `settings.py` solo, `'sigct_backend'` queda registrado sin `ready()` y el cableado del bus **desaparece en silencio** (regresión funcional no detectable por tests del logger). Si se commitea `apps.py` solo, queda inerte. Deben entrar en el mismo commit y tras una verificación de arranque del backend (`manage.py check` / arranque de contenedor) — no ejecutada en esta misión por no autorizar ésta modificación ni despliegue.

---

## 2. CAMBIOS DOCUMENTALES

Clasificación de los documentos del alcance. Sin nueva documentación: las etiquetas provienen de `docs/DOCUMENTATION_GOVERNANCE_REVIEW.md`, `docs/CANONICAL_PROJECT_STATE_20261109.md` §4 y `docs/ASUS_DOCUMENTATION_FINAL_CLASSIFICATION.md`.

### 2.1 Referencias del alcance

| Documento | Clasificación | Estado |
|---|---|---|
| `ARCHITECTURE_AUDIT_VALIDATION.md` | **KEEP** | Adoptado. Destino canónico declarado: `docs/architecture/`. |
| `ARCHITECTURE_AUDIT.md` | **ARCHIVE** | Preservado in situ, rol histórico. No es fuente de verdad. |
| `ARCHITECTURE_GOVERNANCE_REVIEW.md` | **OBSOLETE** como fuente / evidencia local | Gobernanza lo fija fuera de GitHub (**LOCAL_EVIDENCE_ONLY**). No entra al árbol canónico. |

### 2.2 Documentos Toshiba/C-02 y ASUS pendientes de versionar

| Documento | Clasificación | Base |
|---|---|---|
| `ARCHITECTURE_ACTION_MATRIX.md` | **KEEP** | Gobernanza (4 adoptados) |
| `ARCHITECTURE_ACTION_REVIEW.md` | **KEEP** | Gobernanza (4 adoptados) |
| `C02_EXECUTION_PACKAGE.md` | **KEEP** | Gobernanza (4 adoptados) |
| `C02_POST_IMPLEMENTATION_VALIDATION.md` | **KEEP** | Evidencia técnica que sustenta C-02 READY FOR COMMIT |
| `C02_IMPLEMENTATION_STRATEGY.md` | **MERGE** | Absorción en `docs/HEXAGONAL_REFACTOR_PLAN.md` (requiere autorización explícita) |
| `C02_BACKLOG_CLOSEOUT.md` | **ARCHIVE** | Cierre administrativo de backlog, análogo a `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` |
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | **ARCHIVE** | Gobernanza (7 preservados) |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | **ARCHIVE** | Gobernanza (7 preservados) |
| `TOSHIBA_EXPORT_MANIFEST.md` | **ARCHIVE** | Gobernanza (7 preservados) |
| `TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | **ARCHIVE** | Gobernanza (7 preservados) |
| `TOSHIBA_EXECUTIVE_MATRIX.md` | **ARCHIVE** | Matriz ejecutiva de sprint cerrado |
| `TOSHIBA_ALIGNMENT_REPORT_V1.md` | **ARCHIVE** | Superado por la corrección ya aplicada en `cli.js` |
| `DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | **ARCHIVE** | Gobernanza (7 preservados) |
| `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | **ARCHIVE** | Gobernanza (7 preservados) |
| `STAGE_FREEZE_20261013.txt` | **OBSOLETE** | Gobernanza §clasificación; no entra al árbol versionado |
| `DOCUMENT_ROOT_GOVERNANCE_V1.md` | **MERGE** | Dictamen `docs/` vs `Documentacion/` absorbido por `docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md` (D-001/D-002) |
| `SIGCT_DOCUMENT_ARCHITECTURE_V1.md` | **MERGE** | Reconstrucción documental absorbida por `docs/DOCUMENTATION_REPOSITORY_CONSOLIDATION_MASTERPLAN.md` |
| `ASSET_INVENTORY_CHECK_V1.md` | **ARCHIVE** | Decisión previa: `LOCAL_ONLY` (nunca a Git) |
| `ASSET_RECOVERY_SEARCH_V1.md` | **ARCHIVE** | Decisión previa: `LOCAL_ONLY` (nunca a Git) |
| `CAPTURE_PILOT_V1.md` | **KEEP** | Decisión previa: `OPERATIONAL_PLAN`; documento operativo del piloto (destino matriz: `docs/capture/`) |
| `GDS2_CAPTURE_PLAN_V1.md` | **KEEP** | Decisión previa: `OPERATIONAL_PLAN`; no canónico, sí operativo |

### 2.3 Documentos ya creados dentro de `docs/`

| Documento | Clasificación |
|---|---|
| `docs/CANONICAL_PROJECT_STATE_20261109.md` | **KEEP** (fuente de verdad priority 1) |
| `docs/DOCUMENTATION_GOVERNANCE_REVIEW.md` | **KEEP** (fuente de verdad priority 1) |
| `docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md` | **KEEP** (decisión de gobernanza vigente) |
| `docs/DOCUMENTATION_REPOSITORY_CONSOLIDATION_MASTERPLAN.md` | **KEEP** |
| `docs/DOCUMENTATION_MIGRATION_MATRIX.md` | **KEEP** |
| `docs/ASUS_DOCUMENTATION_FINAL_CLASSIFICATION.md` | **KEEP** |
| `docs/REALITY_RECONSTRUCTION_AUDIT_V1.md` | **KEEP** |
| `docs/CANONICAL_CONSISTENCY_AUDIT_V1.md` | **KEEP** |
| `docs/BACKLOG_REALITY_CHECK_V1.md` | **KEEP** |

**Nota de ubicación (no es una decisión nueva):** por D-001, los documentos nuevos pertenecen a `docs/`. Los archivos `KEEP`/`ARCHIVE` listados en §2.2 están hoy en la raíz del repositorio porque preceden a esa decisión; su destino está fijado en `docs/DOCUMENTATION_MIGRATION_MATRIX.md` y su movimiento no forma parte de este informe.

---

## 3. HALLAZGOS ABIERTOS REALES

Solo los que impactan el Sprint Final. Verificados en esta sesión, no inferidos.

| # | Hallazgo | Clasificación | Evidencia | Impacto en el Sprint |
|---|---|---|---|---|
| H-01 | El comando `review` de `cli.js` invoca `saveMetadata(...)` (L925) y **`saveMetadata` no está importado** desde `./dataset.js` | **CRÍTICO** | `dataset.js` exporta `saveMetadata`; `cli.js` lo usa 1 vez y no lo importa. Ejecutar `review` lanzaría `ReferenceError`. | `review` es la única vía para registrar `double_reviewed_agree/disagree`. Sin él: `G-DS-6` y `PILOT-3` son inalcanzables y el dataset no sale de `CAPTADO_INICIAL` hacia `SPLITEADO`. Bloquea la prioridad #1 del sprint. |
| H-02 | `G-DS-2` en 1/150 por clase: 7 de 8 clases vivas en 0 | **ALTO** | `validate`: `total_aceptadas=1; por_clase={silencio:1, resto:0}; balance=INF` | S81/S82 no pueden pasar de `DISENO` aun con modelo. Único desbloqueo: captura real. |
| H-03 | `settings.py` + `apps.py` acoplados y **sin commit**; `apps.py` sin seguimiento | **ALTO** | `git status`: `M settings.py`, `?? apps.py` | Commit parcial = cableado del bus perdido en silencio, sin fallo visible en tests. Verificación de arranque pendiente. |
| H-04 | `G-DS-1` FAIL por 7 mids AudioSet `UNVERIFIED` | **MEDIO** | `validate`: `mids_sin_verificar=7` | Bloquea la declaración de taxonomía verificada; no bloquea captura ni features. |
| H-05 | `G-DS-6` no calculable: `kappa={}` por ausencia de etiquetas individuales por anotador | **MEDIO** | `validate`: `doble_revisadas=0 (0.0%)`, `kappa={}` | κ real exige cambio de representación de datos (decisión de gobernanza), no un cálculo. No se aproxima. |

**Nota:** `G-DS-3`, `G-DS-4` y `G-DS-5` están en **PASS** en la corrida de hoy (3 PASS / 3 FAIL). Cualquier afirmación de "0/6 cerrados" corresponde a un estado anterior y no al verificado.

---

## 4. HALLAZGOS CERRADOS (no volver a auditar)

| Área | Estado cerrado | Evidencia |
|---|---|---|
| Docker Ready | `READY_CONDITIONAL` — 5 servicios, healthchecks | `DOCKER_READY_FINAL_DECISION_REPORT.md` |
| Runtime Disclosure L1–L6 | VERIFICADO | `L1_L6_RUNTIME_VERIFICATION_REPORT.md` |
| CMSC Disclosure Alignment | CERRADA | `CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` |
| ASUS ↔ Toshiba C-02 | READY FOR COMMIT — 1 suscriptor, contenedores sanos | `C02_EXECUTION_PACKAGE.md`, `C02_POST_IMPLEMENTATION_VALIDATION.md` |
| Gobernanza documental (D-L1…D-L3) | CERRADAS | `docs/DOCUMENTATION_GOVERNANCE_REVIEW.md` §1 |
| `docs/` vs `Documentacion/` | CERRADO — `docs/` = SOURCE OF TRUTH | `docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md` (Resolución final) |
| M1 MobileNetV2 | BASELINE CONGELADO — macro-F1 0.9899 · ECE 0.0313 · balanced_acc 0.9898 | `docs/CANONICAL_PROJECT_STATE_20261109.md` |
| M2 EfficientNet-B0 | CHALLENGER VALIDADO — macro-F1 0.9937 · balanced_acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · epoch 32 | idem. **Decisión M1 vs M2 PENDIENTE por diseño** |
| Arquitectura DDD + Hexagonal + Bounded Contexts | CERRADA | `docs/HEXAGONAL_REFACTOR_PLAN.md`, `ARCHITECTURE_AUDIT_VALIDATION.md` |
| Logger: BUG B (`meanPower`), BUG C (envelopes AC-9), BUG D (labels ausente) | CORREGIDOS — 76/76 suite · 21/21 selftest | `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` |
| Alineación Toshiba de `cli.js` (`split` ejecuta) | APLICADA Y VERIFICADA — `G-DS-3`/`G-DS-4` PASS | esta corrida |
| Bridge navegador ↔ motor de ingesta | OPERATIVO — `/health` 200, `POST /ingest` 200 | `bridge/server.js` |

---

## 5. BACKLOG TOSHIBA PARA EL SPRINT FINAL

Máximo 10 ítems. Sin Docker, sin Runtime Disclosure, sin M1/M2, sin auditorías repetidas.

| # | Ítem | Prioridad | Área | Dependencia |
|---|---|---|---|---|
| 1 | Importar `saveMetadata` en `cli.js` (1 línea) y validar `review` con una muestra | CRÍTICO | Dataset acústico | Autorización de cambio de código |
| 2 | Verificación de arranque del backend con `'sigct_backend'` + `apps.py`, y commit conjunto de ambos | ALTO | Integración de código | Autorización de commit |
| 3 | Ejecutar el piloto de 80 clips (`CAPTURE_PILOT_V1`) con bridge activo | ALTO | Dataset acústico | Bridge en marcha + sesiones reales |
| 4 | Doble revisión real de las muestras capturadas vía `review --agreement` | ALTO | Dataset acústico | Ítem 1 |
| 5 | Producir el artefacto mínimo de verificación de los 7 AudioSet mids | MEDIO | Dataset acústico | Fuente primaria de cada mid |
| 6 | Decidir la representación de etiquetas por anotador para que κ sea calculable | MEDIO | Dataset acústico | Gobernanza de esquema (bump) |
| 7 | Fijar el contrato de lectura de S81/S82 (permanecen `DISENO`; no implementar) | MEDIO | AI Assistant | Ítem 3 |
| 8 | Mantener el estado honesto de laboratorios (sin refactor; gate pendiente) | MEDIO | Laboratorios | — |
| 9 | Consolidar el índice de entregables SENA desde `docs/sena_artifacts/` | MEDIO | Evidencias SENA | — |
| 10 | Insertar el bloque `DOCUMENTATION GOVERNANCE` en `AGENTS.md` (texto ya redactado) | MEDIO | Gobernanza | Autorización de edición de `AGENTS.md` |

---

## 6. RECOMENDACIÓN FINAL — qué debe llegar de Toshiba a ASUS antes del Sprint Final

**A. Código (lo que ASUS debe saber antes de tocar nada):**
1. El árbol **no está limpio**: 2 archivos modificados sin commit (`cli.js`, `settings.py`) y 1 archivo nuevo sin seguimiento (`apps.py`). No hay commit ni push pendientes de autorizar todavía.
2. `settings.py` y `apps.py` **viajan juntos o no viajan**. Un commit parcial produce una regresión silenciosa del cableado del event bus.
3. El comando `review` está **roto por import faltante** (`H-01`). ASUS no debe intentar `G-DS-6` ni `PILOT-3` hasta corregirlo: el fallo es de una línea, no de diseño.

**B. Dataset acústico (estado real, no el de AGENTS.md):**
4. `CAPTADO_INICIAL` · 1 fila · 1 WAV (`silencio`) · 1 features CSV (`acoustic.feat.v2`, 44 dims) · `schema_version` 1.3.0 · 42 columnas.
5. Gates reales de hoy: **`G-DS-3` PASS · `G-DS-4` PASS · `G-DS-5` PASS · `G-DS-1` FAIL · `G-DS-2` FAIL · `G-DS-6` FAIL**. La afirmación "0/6 cerrados" está desactualizada.
6. No existe modelo ni dataset acústico entrenable: S81/S82 son `DISENO` y deben seguir siéndolo.

**C. Decisiones que ASUS NO debe reabrir:**
7. Docker Ready, Runtime Disclosure, CMSC Disclosure Alignment, C-02, L1–L6, gobernanza documental, DDD/Hexagonal, M1 congelado y M2 validado. La decisión M1 vs M2 es **pendiente por diseño**, no un hallazgo abierto.
8. `docs/` es la única fuente de verdad; `Documentacion/` es legacy CMSC en absorción controlada. El debate está cerrado por `docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md`.

**D. Documentos:**
9. Clasificación vigente: **4 KEEP** (`ARCHITECTURE_AUDIT_VALIDATION`, `ARCHITECTURE_ACTION_MATRIX`, `ARCHITECTURE_ACTION_REVIEW`, `C02_EXECUTION_PACKAGE`), **1 MERGE** (`C02_IMPLEMENTATION_STRATEGY`), **7 ARCHIVE**, **1 LOCAL_EVIDENCE_ONLY** (`ARCHITECTURE_GOVERNANCE_REVIEW`).
10. Todo documento nuevo nace en `docs/`. Los archivos KEEP/ARCHIVE que hoy están en la raíz tienen destino fijado en `docs/DOCUMENTATION_MIGRATION_MATRIX.md`; su movimiento **no está autorizado** y no forma parte del Sprint Final.

**E. Condición de arranque del Sprint Final:** ítems 1 y 2 del backlog cerrados, y sesiones de captura reales disponibles. Sin esos dos, el sprint produciría documentos sin datos.

---

**Restricciones respetadas:** no se creó ninguna auditoría, no se abrió ningún hallazgo por exploración (los de §3 son defectos verificados en los archivos del alcance), no se reabrió ninguna decisión cerrada, no se modificó ningún archivo, no se generó ningún plan de refactorización, no se ejecutó `git add`, `commit`, `push`, `mv` ni despliegue.

**Archivo generado:** `docs/TOSHIBA_FINAL_RECONCILIATION_REPORT.md`
