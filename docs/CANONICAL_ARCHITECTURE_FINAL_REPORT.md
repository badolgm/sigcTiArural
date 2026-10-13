# CANONICAL_ARCHITECTURE_FINAL_REPORT

> **Misión:** `CANONICAL_ARCHITECTURE_FINALIZATION` — **validación final** de la arquitectura canónica.
> **Alcance:** verificar `CANONICAL_ARCHITECTURE_MASTER_REPORT` contra las 8 fuentes fijadas y emitir **un único dictamen**.
> **Reglas:** NO implementar · NO commits · **NO push** · sin diagramas nuevos · sin migraciones · sin R2 · sin Qdrant.
> **Fecha:** 2026-10-12.

**Fuentes validadas (1→8):** `CANONICAL_ARCHITECTURE_MASTER_REPORT` · `MASTERDOC.md` · `CONTINUITY_MASTER.md` · `EIARC_CONTEXTS.md` · `SIGCT_RURAL_CONTEXT_MAP_V8.mmd` · `er_schema_v8.mmd` · `REAL_ARCHITECTURE_REPORT` · `G1_SCHEMA_CONSISTENCY_REPORT` · `R1_DEPENDENCY_INVERSION_AUDIT`. (Apoyo: `ARCHITECTURE_EVIDENCE_FREEZE_REPORT`, `SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT`, `SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT`.)

---

## 0. Resultado de validación (matriz de consistencia)

| Fuente | ¿Coherente con `CANONICAL_ARCHITECTURE_MASTER_REPORT`? | Observación |
|---|---|---|
| `MASTERDOC.md §1.1/§1.2/§2.9` | ✅ Sí | §1.1 incluye ya la fila "Contextos DDD sobre Shared Kernel" (F2); §2.9 = fuente de verdad del esquema; §1.2 confirma `contexts/{telemetry,labs}` materializados |
| `CONTINUITY_MASTER.md §12` | ✅ Sí | Registra el ciclo (reconciliación/G1/R1) y F1–F6 |
| `EIARC_CONTEXTS.md` | ✅ Sí | 7 contextos oficiales; el reporte los declara TO-BE |
| `SIGCT_RURAL_CONTEXT_MAP_V8.mmd` | ✅ Sí | Context Map raíz; convención 3 niveles 🟢🔷⚪ |
| `er_schema_v8.mmd` | ✅ Sí | ERD canónico derivado del código; misma regla "código gana" |
| `REAL_ARCHITECTURE_REPORT` | ✅ Sí | AS-IS del código = base del §1 del reporte |
| `G1_SCHEMA_CONSISTENCY_REPORT` | ✅ Sí | Fuente de verdad esquema; dump histórico |
| `R1_DEPENDENCY_INVERSION_AUDIT` | ✅ Sí | Import muerto `contexts/labs → api.logic` |

**Verificación de hechos en disco (2026-10-12):** `src/backend/contexts/` = **solo** `labs` + `telemetry` (confirmado) · `src/backend/shared_kernel/event_bus/` existe (ports/domain/infrastructure) · `src/backend/interfaces/` = **0 bytes** · `wire_all` **no invocado** en `wsgi/asgi/settings/apps` (solo en `verify_dia16_17_pilot.py` y su definición en `wiring.py:44`).

> **Conclusión de la matriz:** el `CANONICAL_ARCHITECTURE_MASTER_REPORT` es **coherente** con las 8 fuentes. No hay contradicción de fondo sobre arquitectura ni sobre fuente de verdad. Quedan **residuales** de rotulación/nomenclatura y **artefactos faltantes**, que se detallan abajo.

---

## A. Contradicciones restantes

| # | Contradicción | Fuentes | Gravedad | Estado |
|---|---|---|---|---|
| A-1 | **Ninguna** sobre la fuente de verdad del esquema | Zanjada: `MASTERDOC §2.9` + `G1` + `er_schema_v8` + `architect_master/03` (corregido en F4) | — | ✅ **RESUELTA** |
| A-2 | **`README` §BD** decía "ERD retirado, no reproducir" vs `er_schema_v8.mmd` existente | `README:458-460` vs `docs/database/README.md:12` | 🟠 | ✅ **RESUELTA en F2** |
| A-3 | **Diagrama `MASTERDOC §1`** rotulado *"V3 — capa objetivo"* dibuja `core/` + `FastAPI_AIAdapter` y **no nombra `contexts/` ni el `EventBus`**; la capa objetivo real (según §1.2 y el reporte §2) es `contexts`+`shared_kernel` | `MASTERDOC:82-110` vs `MASTERDOC:137` / `CANONICAL_ARCHITECTURE_MASTER_REPORT §2` | 🟠 | ❌ **RESIDUAL** |
| A-4 | **Discrepancia código→BD viva:** `er_schema_v8.mmd` (y `models.py`+`migrations/`) incluyen `Robot*`, pero el dump publicado no los tiene | `G1 §1.1, D-1, R-1` | 🔴 | ⏳ **ABIERTA (no verificable: Docker caído)** |
| A-5 | **`README` raíz §BD** corregido por F2, pero el resto del `README` puede aún describir la estructura legacy | `README` vs reporte §2 | 🟡 | ⚠️ **Parcial (verificar)** |

> **Nota:** la misión no ejecuta correcciones. A-3/A-4/A-5 quedan como hallazgos de validación.

---

## B. Ambigüedades restantes

| # | Ambigüedad | Detalle | Consecuencia |
|---|---|---|---|
| B-1 | **Nomenclatura de contextos** | `MASTERDOC §1.2:137` nombra `contexts/{labs,telemetry,ai_advisory,identity}`; EIARC/report usa **AI** e **Identity**; el directorio real solo tiene `labs`+`telemetry` | ¿Cuál vocabulario gobierna trabajo nuevo? No zanjado |
| B-2 | **¿AI es contexto o microservicio?** | Código: `src/ai_models/` FastAPI (runtime independiente); MASTERDOC §1.2 lo lista como contexto `ai_advisory` | Riesgo de crear `contexts/ai` innecesario |
| B-3 | **"IMPLEMENTADO-NO-CABLEADO" de Labs** | `wiring.py` declara el cableado Telemetry→Labs, pero `wire_all()` **no se invoca al arranque** | La capa Labs **no recibe** señales reales en producción; estado efectivo ambiguo |
| B-4 | **V3 servido por `contexts` o por `core/`** | Endpoints V3 envueltos en `try/except ImportError` con fallback silencioso | No se sabe, sin runtime, qué implementación sirve `/api/v3/*` |
| B-5 | **`AIServicePort` canónico** | 3 copias (`api/logic/ports`, `core/ports`, y propuesta `shared_kernel/services/`) | Contrato único **pendiente** hasta ejecutar R1 |
| B-6 | **EIARC (7 TO-BE) vs `contexts/` (2 REAL)** | El reporte los declara "no excluyentes", pero conviven dos vocabularios | Ambigüedad de gobierno del mapa |
| B-7 | **`architect_master/01-02`** | El freeze los marca "referencia válida" aunque son **pre-`contexts/`** | Estatus ambiguo (histórico vs vigente) |

---

## C. Artefactos pendientes de congelar

| # | Artefacto | Motivo | Ubicación esperada | Ref |
|---|---|---|---|---|
| C-1 | **Context Map AS-IS** (hexagonal real) | No existe `.mmd` del AS-IS con `contexts`+`shared_kernel`+`core`+`infrastructure`+`api/logic` y sus aristas | `docs/` (F7, fuera de alcance) | Freeze §D |
| C-2 | **ERD reconciliado contra la BD viva** | El ERD canónico (código) incluye `Robot*`; el dump no | `docs/database/` (F7) | G1, Freeze §D |
| C-3 | **`docs/architecture/README.md` → V3/`contexts`** | Aún describe el hexágono **V2**; solo lleva "nota de vigencia" | `docs/architecture/README.md` | Freeze §B |
| C-4 | **`MASTERDOC §1` diagrama** (mostrar `contexts`+`EventBus`) | Ver A-3 | `docs/MASTERDOC.md` | A-3 |
| C-5 | **Estatus de `EIARC_ARCHITECTURE_OVERVIEW.mmd`, `EIARC_DOMAIN_MAP.mmd`, `docs/UBTN_CONTEXT_MAP.md`** | Listados en freeze §0 pero **no clasificados** A/B/C | `docs/eiarc/03_DIAGRAMS/`, `docs/` | Freeze §0 |
| C-6 | **Verdad de la BD viva** | No verificable con daemon Docker caído | runtime | G1 R-8 |

---

## D. Riesgos aún abiertos

**Reconciliación de código (RECONCILIATION §5):** R-1 divergencia de comportamiento 🔴 · **R-2 dependencia invertida `contexts/labs → api.logic`** 🔴 · R-3 acoplamiento directo al ORM 🟠 · R-4 V3 mezcla `core`+`contexts` 🟠 · R-5 retiro prematuro rompe V2/tests 🟠 · R-5b retiro de `core` rompe V3+`infrastructure` 🔴 · R-6 `interfaces/` fantasma 🟡 · R-7 tests ancla de legacy 🟠 · **R-8 "big bang"** 🔴.

**Esquema (G1 §7):** **R-1 la BD viva puede no tener `Robot*`** 🔴 · R-2 dump tomado como verdad 🟠 · R-8 decisión sin datos (Docker caído) 🟠.

**Gobierno/artefactos:** RF-1 falta Context Map AS-IS + ERD reconciliado · RF-2 contratos de gobernanza acústica **fuera de git** · RF-3 `db-mysql` residuo · RF-4 app `users` sin código · **RF-5 `try/except ImportError` oculta fallos de configuración** 🟠.

**Frontend (FRONTEND §H):** `NO_GO` al reemplazo Docker hasta cerrar **D-1..D-7 + E-1..E-9** (URLs `localhost` absolutas, Bridge local-only, auth inerte).

**CMSC/acústico:** Tramo C con **evidencia pendiente de cierre formal**; Dataset C0 `CAPTADO_INICIAL` con `G-DS-1 FAIL` y `G-DS-2..6 PENDING` (cuello **G-DS-2**).

**Transversal:** daemon Docker caído → **sin verificación de runtime ni de la BD real**.

---

## E. Qué puede declararse CANÓNICO · DEFINITIVO · CONGELADO

### E.1 CANÓNICO (una fuente de verdad por tema — establecido y coherente)

| Tema | Artefacto canónico |
|---|---|
| ERD | `docs/database/er_schema_v8.mmd` |
| Context Map raíz | `docs/eiarc/03_DIAGRAMS/SIGCT_RURAL_CONTEXT_MAP_V8.mmd` |
| Contextos EIARC | `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` (+ `EIARC_CONTEXT_MAP.mmd`, `EIARC_CONTEXT_INTERACTION.mmd`) |
| Fuente de verdad del esquema | `src/backend/api/models.py` + `migrations/` (`MASTERDOC §2.9`) |
| Hexagonal AS-IS verificado | `MASTERDOC §1.1` + `REAL_ARCHITECTURE_REPORT` |
| Reglas de refactor | `HEXAGONAL_REFACTOR_PLAN.md` + `ADSO_GUIA_TECNICA…md` |
| Índice de diagramas | `docs/CANONICAL_DIAGRAM_MANIFEST.md` |
| Consolidación arquitectónica | `docs/CANONICAL_ARCHITECTURE_MASTER_REPORT.md` |

### E.2 DEFINITIVO (decisiones cerradas; no requieren más debate)

- **Fuente de verdad del esquema** = `models.py` + `migrations/`; `schema_postgresql.sql` = histórico.
- **Definición de los 7 contextos EIARC** (Telemetry, AI, Labs, Knowledge, Identity, IoT, Deployment).
- **Dirección TO-BE:** converger a `contexts` + `shared_kernel`; absorber `core`; retirar `api/logic`/V1/V2.
- **Frontend fuente de desarrollo oficial** = `src/frontend/` (Vite) — **condicionado**.
- **Principio:** el código gana sobre el diagrama.

### E.3 CONGELADO

- Evidencia arquitectónica (inventario A/B/C/D/E/F de `ARCHITECTURE_EVIDENCE_FREEZE_REPORT`).
- Consolidación documental **F1–F6** (marcado de obsoletos, alineación MASTERDOC/README, `EIARC_CODE_TO_CONTEXT_MAP` v1.1.0, `architect_master/03` corregido, manifest de diagramas, CONTINUITY §12).
- Estado oficial consolidado (§0 del maestro).

### E.4 NO puede declararse aún

- **DEFINITIVO del código:** el TO-BE **no está realizado** (R1–R5 pendientes; `core`/`api/logic` presentes).
- **DEFINITIVO de la BD viva:** no verificada (Docker caído; `Robot*` en duda).
- **CONGELADO de los artefactos C-1..C-6** (faltantes/estatus desconocido).

---

## F. Pendiente antes de Docker Oficial / OCI / SIGCT Memory Implementation

### F.1 Antes de **Docker Oficial** (reemplazo del contenedor 5173)
1. Cerrar condiciones **D-1..D-7** del frontend (URLs relativas al entorno, `.env` real, auth, `_deprecated`, clúster fabricado, overlay DEBUG).
2. Aprobar pruebas **E-1..E-9** (incluye build Docker con daemon arriba — hoy **no verificado**).
3. **Bridge/Dataset** dejan de ser `local-only` o se declaran explícitamente no-oficiales en producción.
4. Verificar `/api/v3/*` servido por la capa correcta (resolver B-3/B-4).

### F.2 Antes de **OCI**
1. Todo lo de F.1 + **gestión de secretos** (fuera del repo) y configuración por entorno.
2. Imágenes **reproducibles** (build determinista) y plan de despliegue aislado (**sin exponer admin** de Memory).
3. Resolver RF-3 (`db-mysql` residuo) y RF-5 (fallback silencioso).

### F.3 Antes de **SIGCT Memory Implementation**
1. **Misión explícita** de implementación (hoy solo **diseñado F00–F06.5**).
2. Instalación **Ollama + `nomic-embed-text-v2-moe`** y **Qdrant** (orden §3 de `SIGCT_MEMORY_IMPLEMENTATION_01`).
3. `MemoryQueryPort` (read-only) + staging `.staging/*.jsonl` + ingesta batch P0 → `docs_core`; **sin admin expuesto**, **sin** indexar pesos/WAV/binarios/secrets.
4. Base estable: **registry KH (51 docs)** congelado y gobernanza de Evidence Ledger **antes** de indexar.

---

## DICTAMEN

# ARCHITECTURE_FREEZE_INCOMPLETE

**Fundamento (honestidad de estado):** la **consolidación documental y de evidencia está COMPLETA** (fuente de verdad fijada, vigentes/obsoletos identificados, F1–F6 ejecutados, maestro coherente con las 8 fuentes). Sin embargo, el **freeze arquitectónico como un todo NO puede declararse cerrado** porque:

1. **Faltan artefactos canónicos** (Context Map AS-IS, ERD reconciliado contra la BD viva) — C-1, C-2.
2. **Rotulación/estatus residual** en `MASTERDOC §1` y `architecture/README.md` — A-3, C-3, C-4.
3. **Runtime no verificado** (daemon Docker caído); la BD viva y el build oficial quedan sin prueba — C-6, F.1.2.
4. **Reconciliación de código R1–R5 pendiente** → el TO-BE no está realizado (no es "definitivo" a nivel de código).

**Lo declarable ahora:** el núcleo canónico (E.1), las decisiones definitivas (E.2) y el estado congelado documental (E.3) son válidos y quedan como **base congelada de referencia**. Lo pendiente (C y F) **no bloquea** el avance documental, pero **sí impide** declarar el freeze cerrado.

**Para pasar a `ARCHITECTURE_FREEZE_COMPLETE`** basta: (i) generar C-1/C-2 (F7, misión aparte), (ii) actualizar C-3/C-4, (iii) verificar runtime con Docker arriba. **No requiere** ejecutar R2, ni Memory, ni Qdrant.

---

**Sin modificar código · sin commits · sin push · sin diagramas nuevos · sin migraciones · sin R2 · sin Qdrant.**
*Bernardo Adolfo Gómez Montoya — 2026*
