# ARCHITECTURE_EVIDENCE_FREEZE_REPORT

> **Misión:** `ARCHITECTURE_EVIDENCE_FREEZE`
> **Objetivo:** auditar **exclusivamente los artefactos arquitectónicos existentes** y congelar el estado de la evidencia antes de tocar nada.
> **NO** se generan diagramas nuevos · **NO** se modifica código · **NO** se ejecuta R2 · **NO** se ejecutan migraciones · **NO** commits · **NO** push.
> **Base:** `SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT` · `REAL_ARCHITECTURE_REPORT` · `G1_SCHEMA_CONSISTENCY_REPORT` · `R1_DEPENDENCY_INVERSION_AUDIT` · `SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT`.
> **Método:** lectura estática del árbol `docs/` (tracked, verificado por `git ls-files`; la auditoría no mueve ni reescribe archivos).

---

## 0. Inventario de artefactos arquitectónicos (mapa físico real)

| Grupo | Artefactos | Estado en git | Evidencia |
|---|---|---|---|
| **ERD/EER** | `docs/database/er_schema_v8.mmd` · `er_schema.svg` · `class_db_models.svg` · `ModelEER_Sigct-rural.mwb` · `README.md` | tracked | `git ls-files docs/database` |
| **Context Maps** | `docs/eiarc/03_DIAGRAMS/EIARC_CONTEXT_MAP.mmd` · `EIARC_CONTEXT_INTERACTION.mmd` · `SIGCT_RURAL_CONTEXT_MAP_V8.mmd` · `EIARC_CODE_TO_CONTEXT_MAP.mmd` · `EIARC_ARCHITECTURE_OVERVIEW.mmd` · `EIARC_DOMAIN_MAP.mmd` · `docs/UBTN_CONTEXT_MAP.md` | tracked | `git ls-files docs/eiarc` |
| **Modelo de datos EIARC** | `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md` + `docs/eiarc/03_DIAGRAMS/EIARC_CANONICAL_DATA_MODEL.mmd` | tracked | idem |
| **Canon maestro** | `docs/MASTERDOC.md` (§1 hex, §2.9 esquema, §3 EIARC planificado) | tracked | — |
| **Continuidad** | `docs/CONTINUITY_MASTER.md` (11 secciones) | tracked | — |
| **architect_master (matriz de verdad previa)** | `01_REPOSITORY_AUDIT` … `08_DEVELOPMENT_ROADMAP` | tracked | `git ls-files docs/architect_master` |
| **Hexagonal / refactor** | `docs/HEXAGONAL_REFACTOR_PLAN.md` · `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` · `docs/architecture/README.md` + `robotics_contracts.md` + `simulation_stack.md` | tracked | — |
| **Mermaid sueltos** | `docs/diagrams/*.mmd` (4) · `docs/uml/*.mmd` (7) · `docs/eiarc/03_DIAGRAMS/*.mmd` (17) · `docs/edge/architecture_edge.mmd` | tracked | `.mmd` totales en `docs/`: **31** |
| **Mermaid embebidos en `.md`** | 39 documentos contienen ```` ```mermaid ```` (incluye `MASTERDOC.md` ×2, `README.md` ×5, `EIARC_CONTEXTS.md` ×1, `architecture/README.md` ×1) | tracked | conteo por archivo |
| **SVG huérfanos/duplicados** | `docs/database/*.svg` · `docs/uml/class_backend.svg`, `component_system.svg` · `docs/diagrams/_archive/*` | tracked | `git ls-files` |

**Hecho de trazabilidad:** **ningún** artefacto de `docs/` está `untracked` — `git status --short -- docs` devolvió **vacío**; toda la evidencia está versionada. Los únicos archivos nuevos sin commit son los 4 informes de auditoría recientes (staged), no artefactos preexistentes.

---

## A. Qué artefactos siguen vigentes

### A.1 ERD / modelo de datos

| Artefacto | Por qué vigente | Evidencia |
|---|---|---|
| **`docs/database/er_schema_v8.mmd`** | Se autodeclara **ERD canónico V8**, generado *campo por campo* contra `api/models.py` + `api/migrations/` (0001, 0002); declara la regla "discrepancia se resuelve a favor del código". Cubre `Robot`, `RobotTelemetry`, `RobotCommand`, `SensorReading` | cabecera `er_schema_v8.mmd:1-11` |
| `docs/database/README.md` | Remite a `er_schema_v8.mmd` como **única fuente de verdad** y describe el adaptador hexagonal V2/V3 | `README.md:10-28` |
| `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md` + `.mmd` | Modelo de datos canónico a **nivel EIARC (TO-BE)**, con etiquetado honesto `current` (SR/RB/RT/RC) vs `future` (Prediction, Device, Sensor, LabSession…) | `EIARC_CANONICAL_DATA_MODEL.mmd:6,107-119` |

### A.2 Context Maps

| Artefacto | Por qué vigente | Evidencia |
|---|---|---|
| **`SIGCT_RURAL_CONTEXT_MAP_V8.mmd`** | **Context Map raíz V8**: "responde ¿qué es SIGCT-Rural a nivel de identidad completa"; fija la **convención de 3 niveles** (🟢 implementado · 🔷 objetivo oficial · ⚪ especulativo) y declara sus fuentes | `:1-16` |
| `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` | **Definición formal** de los 7 contextos EIARC oficiales (propósito, entidades, dependencias, evolución) + diagrama | `:1-35,251` |
| `EIARC_CONTEXT_MAP.mmd` · `EIARC_CONTEXT_INTERACTION.mmd` | Context Map EIARC e interacción/gobierno entre los 7 contextos (coherentes con `EIARC_CONTEXTS.md`) | `:1-72` / `:1-63` |

### A.3 Canon y reglas

| Artefacto | Por qué vigente | Evidencia |
|---|---|---|
| `docs/MASTERDOC.md` **§2.9** | Fija la **regla de fuente de verdad del esquema**: `models.py` + `migrations/`, con `schema_postgresql.sql` como referencia histórica | `MASTERDOC.md:213-221` |
| `docs/MASTERDOC.md` **§1 (69-79)** | Documenta el **estado real verificado** de las 3 capas coexistentes (V1/V2/V3) y el rol de cada una | `MASTERDOC.md:69-79` |
| `docs/HEXAGONAL_REFACTOR_PLAN.md` | Contrato técnico del refactor (**Strangler Fig + Branch by Abstraction**) con fases y principios | headings §1–§8 |
| `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` | Guía técnica con la Fase 0 real y el **contrato `EventBusPort`** | §2, §5, §8 |
| `docs/architect_master/01_REPOSITORY_AUDIT.md` y `02_SIGCTRURAL_CANONICAL_MODEL.md` | Auditoría de repositorio y **modelo canónico AS-IS/TO-BE** (siguen siendo referencia válida; previos a `contexts/`) | `02:1-65` |

---

## B. Qué artefactos requieren actualización

| Artefacto | Divergencia detectada | Evidencia |
|---|---|---|
| **`docs/MASTERDOC.md` §1.1/§1.2** | Dice que `contexts/{labs,telemetry,ai_advisory,identity}/` **"aún no materializada como carpetas"**; hoy **ya existen** `contexts/telemetry`, `contexts/labs` y `shared_kernel/event_bus` (REAL_ARCHITECTURE_REPORT). El diagrama §1 (83-109) dibuja `FastAPI_AIAdapter`/`core` como V3 y **no nombra** `contexts/` ni el `EventBus` | `MASTERDOC.md:77,83-109,136` |
| **`docs/eiarc/03_DIAGRAMS/EIARC_CODE_TO_CONTEXT_MAP.mmd`** | Mapea `src/backend/{api,core,infrastructure}` a contextos pero **omite** `contexts/telemetry`, `contexts/labs` y `shared_kernel/event_bus`, que son la estructura real de destino | `EIARC_CODE_TO_CONTEXT_MAP.mmd:8-65` |
| **`docs/HEXAGONAL_REFACTOR_PLAN.md` §2.3** | "Estructura Objetivo Propuesta" y el punto de chequeo predatan la materialización de `contexts/`; el estado de §1.2 no refleja la coexistencia de dos/tres estructuras hex paralelas | headings §1.2, §2.3 |
| **`README.md` §Base de Datos (458-460)** | Afirma que el ERD *"fue retirado… no se genera un ERD alternativo"*, cuando **`er_schema_v8.mmd` ya existe y está validado** | `README.md:458-460` vs `docs/database/README.md:12` |
| **`docs/CONTINUITY_MASTER.md`** | Es continuidad de **CMSC/MMC/IA acústica** (cortes 2026-10-04); no registra el ciclo de **auditoría arquitectónica** (reconciliación, G1, R1) | `CONTINUITY_MASTER.md:398-561` |
| **`docs/architecture/README.md`** | Describe el hexágono **V2** (`Django Views V2`, `LaboratorioService`) como presente; no menciona `contexts/` ni V3 | `architecture/README.md:16-38` |
| **`docs/architect_master/03_DOCUMENT_TRUTH_MATRIX.md`** | Fija la BD como **principal fuente de verdad = `schema_postgresql.sql`** — **contradice** `MASTERDOC §2.9` y `README:470` | `03:38-42` |

---

## C. Qué artefactos son obsoletos

| Artefacto | Por qué obsoleto | Evidencia |
|---|---|---|
| **`docs/database/er_schema.svg`** | Contiene **entidades retiradas**: `USER`, `PROJECT`, `TELEMETRY`, `COURSE` (8/13/5/8 ocurrencias). Su `.mmd` fuente ya no existe (removido en Fase 1 V8) → **SVG huérfano y falso** | grep sobre el SVG |
| **`docs/database/class_db_models.svg`** | Contiene `User`, `Project`, `Telemetry`, `ImageSample` (5/13/5/5). Su `.mmd` fue eliminado → huérfano | grep SVG |
| **`docs/uml/class_backend.svg`** | Contiene `User`, `Project`, `Telemetry`, `ImageSample`, `Course` → modelo de clases pre-V8 | grep SVG |
| **`docs/database/ModelEER_Sigct-rural.mwb`** | EER de **MySQL Workbench** (stack migrado a PostgreSQL en ene-2026); riesgo de tooling/entidades; `05_FINAL_ARCHITECTURE_BASELINE` ya pide "reconciliar antes de usar" | `database/README.md:17`; `05_FINAL_ARCHITECTURE_BASELINE.md:103-104` |
| **`docs/architect_master/04_DIAGRAM_AUDIT.md`** | **Se autodeclara obsoleto** (nota FASE 5C) y apunta a `docs/diagrams/*.mmd` que ya no existen | `04:3` |
| **`docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md`** | Idem: nota FASE 5C; sus decisiones Conservar/Actualizar/Reemplazar fueron reevaluadas | `05:3` |
| **`docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md`** | Idem: nota FASE 5C; cita diagramas migrados/retirados | `06:3` |
| **`docs/diagrams/*.svg` duplicados con `_archive/`** | `component_system.svg`, `class_backend.svg` aparecen en dos carpetas (`docs/diagrams/_archive/` y `docs/uml/`) — duplicidad ya señalada | `05:65-68,110-111` |

**Nota clave:** existen **referencias rotas** en los artefactos de `architect_master`: `03/04/05/06` citan `docs/diagrams/architecture.mmd`, `c4_containers.mmd`, `c4_components.mmd`, `c4_deployment.mmd`, `docs/database/er_schema.mmd`, `class_db_models.mmd` — **ninguno de esos `.mmd` existe hoy** (el `.mmd` único superviviente en `docs/diagrams/` es `c4_context.mmd`, `class_lab_catalog.mmd`, `sequence_navigation.mmd`, `use_cases.mmd`).

---

## D. Qué artefactos faltan

| Artefacto faltante | Por qué | Evidencia |
|---|---|---|
| **Context Map AS-IS hexagonal real** | No existe un artefacto que mapa `contexts/{telemetry,labs}` + `shared_kernel/event_bus` + `core/` + `infrastructure/` + `api/logic/` con sus aristas reales. EIARC describen el **TO-BE**; `REAL_ARCHITECTURE_REPORT` es la semilla, no el artefacto canónico | `REAL_ARCHITECTURE_REPORT` §Bounded Contexts |
| **ERD reconciliado contra la BD viva** | El ERD canónico (código) incluye `Robot*`, pero el **dump real** no los tiene (G1). Falta el artefacto que declare esa brecha | `G1_SCHEMA_CONSISTENCY_REPORT` |
| **Índice/manifest de diagramas canónicos** | `04_DIAGRAM_AUDIT` está obsoleto; no hay sustituto que diga, por tema, cuál `.mmd` es el canónico | `04:3` |
| **`docs/diagrams/vision/architecture/context/container/component` (`*.mmd` perdidos)** | Referenciados en `architect_master` pero ausentes en disco | ver C (referencias rotas) |
| **Actualización de `architecture/README.md` a V3/contexts** | Ver B | — |

---

## E. Qué debe convertirse en fuente de verdad

**Principio:** una sola fuente por tema, y el código gana sobre el diagrama.

| Tema | Fuente de verdad propuesta | Sustituye a |
|---|---|---|
| **Esquema de datos (ERD)** | `docs/database/er_schema_v8.mmd` **+** `api/models.py`/`migrations/` como autoridad final (`MASTERDOC §2.9`) | `er_schema.svg`, `class_db_models.svg`, `class_backend.svg`, `ModelEER.mwb`, `schema_postgresql.sql` |
| **Context Map raíz** | `docs/eiarc/03_DIAGRAMS/SIGCT_RURAL_CONTEXT_MAP_V8.mmd` | — |
| **Definición de contextos EIARC** | `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` (+ `EIARC_CONTEXT_MAP.mmd`, `EIARC_CONTEXT_INTERACTION.mmd`) | — |
| **Modelo de datos EIARC (TO-BE)** | `EIARC_CANONICAL_DATA_MODEL.md` | — |
| **Arquitectura hexagonal AS-IS** | `MASTERDOC.md §1` (actualizado con `contexts/`) + `SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT` | `architecture/README.md` (V2 obsoleto) |
| **Reglas de refactor** | `HEXAGONAL_REFACTOR_PLAN.md` + `ADSO_GUIA_TECNICA…md` | — |
| **Estado verificado real** (schema/BContexts) | `G1_SCHEMA_CONSISTENCY_REPORT`, `REAL_ARCHITECTURE_REPORT`, `R1_DEPENDENCY_INVERSION_AUDIT` | `architect_master/03..06` (históricos) |

**Conflictos de fuente de verdad a resolver:**
1. **Esquema:** `architect_master/03` declara `schema_postgresql.sql` como fuente; `MASTERDOC §2.9` + `README:470` declaran `models.py`+`migrations/`. → **Gana MASTERDOC §2.9** (decisión ya tomada por el proyecto; `03` queda histórico).
2. **ERD:** `README:458-460` dice "retirado, no reproducir"; `docs/database/README.md` ya publica `er_schema_v8.mmd`. → **Gana `er_schema_v8.mmd`**.
3. **Contextos:** EIARC define 7 contextos TO-BE; el código materializa 2 (`telemetry`, `labs`) + `shared_kernel`. → **No son excluyentes**: EIARC = objetivo, `contexts/` = realización parcial. La fuente AS-IS debe declararlos por separado.

---

## F. Orden recomendado de consolidación

**Regla de la misión: este orden decide qué hacer, no ejecuta; NO se generan diagramas nuevos.**

```
F0 (esta misión)  Congelar evidencia y decisiones — HECHO (este reporte)
F1  Declarar obsoletos los artefactos de datos retirados
    (er_schema.svg, class_db_models.svg, class_backend.svg, ModelEER.mwb → marcar histórico)
F2  Alinear MASTERDOC §1.1/§1.2 + README(§BD) con er_schema_v8.mmd y con contexts/
F3  Actualizar EIARC_CODE_TO_CONTEXT_MAP (incluir contexts/ + shared_kernel)   [solo edición de contenido documental, sin diagrama nuevo]
F4  Depurar architect_master/03..06 → marcar históricos + corregir la contradicción de fuente de verdad
F5  Publicar el índice/manifest de diagramas canónicos (un tema → un artefacto)
F6  Actualizar CONTINUITY_MASTER con el ciclo de auditoría arquitectónica (reconciliación/G1/R1)
--- (fuera de esta misión, tras aprobación) ---
F7  Generar los diagramas faltantes (Context Map AS-IS, ERD reconciliado)
```

**Justificación del orden:** primero se **fija qué es verdad** (A/E) y se **marca qué es obsoleto** (C); solo después se edita contenido (B) y, al final, se crean artefactos nuevos (D/F7). Así ningún artefacto nuevo se genera sobre una base en disputa.

---

## F. Cierre — dictamen de congelación

- **Evidencia congelada:** inventario completo de ERD/EER, Context Maps, MASTERDOC, CONTINUITY_MASTER, docs de arquitectura, docs hexagonales y los 31 `.mmd` + 39 `.md` con Mermaid, con estado por artefacto verificado contra git y contra los informes previos.
- **Núcleo vigente:** `er_schema_v8.mmd` (ERD), `SIGCT_RURAL_CONTEXT_MAP_V8.mmd` + `EIARC_CONTEXTS.md` (Context Map/contextos), `MASTERDOC §1/§2.9`, `HEXAGONAL_REFACTOR_PLAN`, `ADSO_GUIA…`.
- **Obsoletos concretos:** los 3 SVG de modelo, el `.mwb`, y `architect_master/04..06` (auto-declarados).
- **Contradicción principal:** la **fuente de verdad del esquema** (`schema_postgresql.sql` en `architect_master/03` vs `models.py`+`migrations/` en `MASTERDOC §2.9`) — requiere zanjarse antes de tocar R2.
- **Hecho de freeze:** ninguna evidencia arquitectónica está sin versionar; los 4 informes nuevos quedan **staged** para que decida Bernardo.

Sin generar diagramas nuevos. Sin modificar código. Sin ejecutar R2. Sin migraciones. Sin commits. Sin push.
