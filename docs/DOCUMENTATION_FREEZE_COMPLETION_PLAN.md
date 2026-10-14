# DOCUMENTATION_FREEZE_COMPLETION_PLAN

> **Misión:** `DOCUMENTATION_FREEZE_COMPLETION_PLAN`.
> **Base:** `CANONICAL_DOCUMENTATION_ALIGNMENT.md` · `CANONICAL_ARCHITECTURE_FINAL_REPORT.md`.
> **Objetivo:** determinar **cómo cerrar C-1, C-2, C-3 y C-4 sin tocar código**.
> **Naturaleza:** plan de cierre documental. **Sin código · sin commits · sin push.**
> **Regla:** NADA DESAPARECE — solo se actualiza/marca; no se borra.

**Los 4 pendientes (del FINAL_REPORT §C):**

| Id | Pendiente | Tipo |
|---|---|---|
| **C-1** | Context Map **AS-IS** del hex real (`contexts` + `shared_kernel` + `core` + `infrastructure` + `api/logic` + `api/`) | Artefacto **nuevo** (`docs/`, `.mmd`) |
| **C-2** | **ERD reconciliado contra la BD viva** (declarar la brecha código ↔ BD) | Artefacto **nuevo** (`docs/database/`) |
| **C-3** | `docs/architecture/README.md` → **V3/`contexts`** (hoy describe hex V2) | **Actualización** de doc |
| **C-4** | Diagrama `docs/MASTERDOC.md §1` (hoy "V3 — capa objetivo"; sin `contexts`/`EventBus`) | **Actualización** de doc canónico |

---

## 1. Qué artefactos faltan

| Id | Artefacto faltante | Contenido mínimo requerido | Origen de datos |
|---|---|---|---|
| **C-1** | **Context Map AS-IS** — `docs/eiarc/03_DIAGRAMS/SIGCT_RURAL_CONTEXT_MAP_AS_IS.mmd` (nombre propuesto) | Nodos: `contexts/telemetry`, `contexts/labs`, `shared_kernel/event_bus`, `core/*`, `infrastructure/*`, `api/logic/*`, `api/models.py`, `api/views.py`; aristas reales (imports + bus) | `REAL_ARCHITECTURE_REPORT` §2/§11 + grafo de imports (estático) |
| **C-2** | **ERD reconciliado** (`docs/database/ERD_RECONCILIATION.md` + nota en `database/README.md`) | Tabla objetivo (`models.py`+`migrations/`) vs tablas **reales** en la BD (`\dt`); declarar si existe `api_robot*` | `G1` + **BD viva** (runtime) |
| **C-3** | `docs/architecture/README.md` revisado | Sustituir descripción hex **V2** por **V3/`contexts`** + `shared_kernel`; nota de estados | `REAL_ARCHITECTURE_REPORT`, `MASTERDOC §1.1` |
| **C-4** | `docs/MASTERDOC.md §1` (diagrama + rótulo) | Rótulo correcto + diagrama que **nombre `contexts` + `EventBus`** (o nota explícita) | `MASTERDOC §1.2` (ya actualizado en F2) |

> **Artefactos de apoyo que NO faltan** (ya existen): `CANONICAL_DIAGRAM_MANIFEST.md` (donde se registra C-1), `er_schema_v8.mmd` (ERD del **código**), `REAL_ARCHITECTURE_REPORT`, `G1_SCHEMA_CONSISTENCY_REPORT`.

---

## 2. Qué evidencia falta

| Id | Evidencia necesaria | ¿Disponible hoy? |
|---|---|---|
| **C-1** | **Grafo de imports real** (`contexts`, `shared_kernel`, `core`, `infrastructure`, `api/logic`, `api`) + punto de cableado (`wiring.py`) | ✅ Sí — estática (`grep`/AST del código, sin ejecutar) |
| **C-2** | **Esquema de la BD viva**: ¿existen `api_robot`, `api_robottelemetry`, `api_robotcommand`? (la migración `0002` aplicada?) | ❌ **No** — requiere **Docker + PostgreSQL arriba** (hoy caído) |
| **C-3** | Divergencias V2↔V3↔contexts (ya documentadas) | ✅ Sí — `REAL_ARCHITECTURE_REPORT` §1/§11 |
| **C-4** | Estado real de `contexts/` + `EventBus` (ya documentado) | ✅ Sí — `MASTERDOC §1.1` (fila añadida en F2) + `REAL_ARCHITECTURE_REPORT` |

**Evidencia adicional deseable (no bloqueante):** confirmar por `git log` la fecha/commit de materialización de `contexts/labs` y `shared_kernel/event_bus`.

---

## 3. Qué depende de Docker

- **C-2** (verificación del esquema de la BD viva): **depende directamente** de Docker/PostgreSQL.
- **Verificación de runtime en general** (build oficial, `/api/v3/*` servido por `contexts` o `core` — ambigüedad B-4 del FINAL_REPORT): **depende de Docker**.
- **Nada más** de C-1/C-3/C-4 depende de Docker (son documentales/estáticos).

---

## 4. Qué depende de la base de datos viva

- **Solo C-2.** Concretamente: la lista real de tablas (`\dt`) para confirmar/negar `Robot*` y cerrar la discrepancia **A-4 / G1 D-1 / R-1**.
- Si la BD viva **no** tiene `Robot*`: el cierre de C-2 es declarar la brecha + plan de migración (documental), **sin** ejecutar migraciones.
- Si **sí** tiene `Robot*`: se actualiza `er_schema_v8.mmd` solo si hay discrepancia (según regla "el código gana").

---

## 5. Qué NO requiere Docker (cerrable ahora, sin tocar código)

| Id | ¿Cerrable ahora? | Acción (documental) |
|---|---|---|
| **C-1** | ✅ **Sí** | Derivar el grafo del código (estático) y escribir el `.mmd` **AS-IS**; registrarlo en `CANONICAL_DIAGRAM_MANIFEST.md` |
| **C-3** | ✅ **Sí** | Reescribir `docs/architecture/README.md` a V3/`contexts` |
| **C-4** | ✅ **Sí** | Corregir rótulo y diagrama/nota de `MASTERDOC §1` |
| **C-2** | ⚠️ **Parcial** | Solo **provisional**: publicar el informe de brecha `PROVISIONAL` (con datos de G1), marcado "pendiente de verificación en runtime"; **no** cerrarlo |

> **C-1, C-3 y C-4 se pueden cerrar al 100 % sin Docker.** C-2 queda en **cerrable-solo-provisional** hasta tener BD viva.

---

## 6. Qué NO debe hacerse todavía

1. **No ejecutar R2** (absorber `core`, retirar `api/logic`) — fuera de alcance.
2. **No iniciar SIGCT Memory** ni instalar **Qdrant/Ollama**.
3. **No iniciar Docker replacement** ni declarar frontend oficial.
4. **No ejecutar migraciones** ni tocar la BD.
5. **No fabricar** el ERD reconciliado (C-2) sin evidencia de runtime (sería verdad inventada) — solo **provisional**.
6. **No borrar** ningún artefacto histórico/obsoleto.

---

## 7. Cómo cerrar cada pendiente sin tocar código

### C-1 — Context Map AS-IS (cerrable ahora)
1. Extraer nodos/aristas reales del árbol `src/backend/` (estático): `contexts/`, `shared_kernel/`, `core/`, `infrastructure/`, `api/logic/`, `api/`, `wiring.py`.
2. Redactar `docs/` `.mmd` AS-IS (hexagonal real) — **sin** modificar código.
3. Declararlo en `docs/CANONICAL_DIAGRAM_MANIFEST.md` (rol: canónico AS-IS) y referenciarlo desde `MASTERDOC §1`.
4. **Riesgo:** que un futuro refactor lo deje desactualizado → nota de "vigente a 2026-10" + regla de invalidación.

### C-2 — ERD reconciliado (bloqueado por BD viva)
1. **Ahora:** emitir `docs/database/` informe **PROVISIONAL** con la brecha conocida (código sí `Robot*`; dump no) — datos de `G1`.
2. **Con Docker arriba:** `\dt` en PostgreSQL → confirmar tablas reales → promover de `PROVISIONAL` a `VERIFICADO`.
3. **No** ejecutar `migrate`; si falta `0002`, documentar la decisión (no aplicarla).

### C-3 — `architecture/README.md` (cerrable ahora)
1. Sustituir la descripción V2 por V3 + `contexts` + `shared_kernel`.
2. Añadir tabla de estados honesta (REAL / TRANSICIÓN / LEGACY).
3. Enlazar a `MASTERDOC §1`, `REAL_ARCHITECTURE_REPORT` y al Context Map AS-IS (C-1).

### C-4 — `MASTERDOC §1` (cerrable ahora)
1. Corregir rótulo "V3 — capa objetivo" → "capa V3 (transición)".
2. Añadir a la fila ya existente (F2) una nota/sub-diagrama que nombre `contexts` + `EventBus`.
3. Verificar coherencia con C-1 y §1.2.

---

## 8. Orden recomendado de cierre (sin código)

```
C-1  Context Map AS-IS (estático)        [ahora]
C-3  architecture/README.md → V3/contexts [ahora]
C-4  MASTERDOC §1 rótulo/diagrama         [ahora]
C-2  ERD reconciliado:
     → PROVISIONAL (ahora, con datos G1)
     → VERIFICADO   [cuando Docker + PostgreSQL estén arriba]
```

**Dependencia:** C-3 y C-4 deberían referenciar C-1 (crear C-1 primero). C-2 es independiente pero se promueve solo con runtime.

---

## 9. Dictamen

- **C-1, C-3, C-4: cerrables** al 100 % **sin Docker y sin tocar código** (solo documentación/`.mmd`).
- **C-2:** cerrable **solo provisionalmente**; el cierre definitivo **depende de Docker + BD viva**.
- **Con C-1/C-3/C-4 cerrados + C-2 provisional**, el `CANONICAL_ARCHITECTURE_FINAL_REPORT` pasa de `ARCHITECTURE_FREEZE_INCOMPLETE` a **`ARCHITECTURE_FREEZE_COMPLETE (condicionado a runtime para C-2 definitivo)`**.

**Requisito de ejecución:** el cierre real requiere **misión explícita** (crear C-1 y editar C-3/C-4). Este documento es el **plan**, no la ejecución.

---

**Sin código · sin commits · sin push · sin migraciones · sin R2 · sin Qdrant.**
*Bernardo Adolfo Gómez Montoya — 2026*
