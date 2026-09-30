# CMSC — Procedimiento de Snapshot Documental Estable (v1)

| Campo | Valor |
|---|---|
| Documento | CMSC_IMPLEMENTATION_SNAPSHOT_PROCEDURE |
| Fecha | 2026-09-29 |
| Misión | CMSC_GOVERNANCE_GATE_CLOSURE_V1 |
| Naturaleza | Gobernanza · procedimiento de snapshot. Sin código, sin commits. |
| Resuelve | Condición 8 del Blueprint §5 (snapshot documental estable previo al código) y base del rollback Blueprint §14 |

---

## 1. Objeto

Definir cómo capturar un snapshot documental estable, previo a cualquier implementación F3C, que sirva de punto de restauración (Blueprint §14.4) y de estado de referencia para la reversibilidad estructural del slice (Blueprint §14).

## 2. Contenido del snapshot

| Bloque | Qué se incluye |
|---|---|
| Documentación canónica | Los documentos de `Documentacion/Arquitectura/` (18 previos + los 6 de gobernanza) y `Documentacion/IA/` |
| Sources de referencia | notebooks, documentos de benchmark y manifiestos |
| Estado git | HEAD `18b95b1`, rama `feature/ubtn-biological-telemetry`, working tree documental |
| Capa de recuperación | `stash@{0}` PRE_MULTI_AGENT_2026_09_29, conservada (decisión Bernardo 2026-09-29) |

## 3. Pasos del procedimiento

| Paso | Acción | Criterio de éxito |
|---|---|---|
| 1 | Verificar HEAD `18b95b1` y rama (git log --oneline -1) | sin commits nuevos |
| 2 | Inventariar untracked de `Documentacion/Arquitectura/` y `Documentacion/IA/` | lista cerrada de archivos |
| 3 | Confirmar `stash@{0}` presentada y su contenido (árbol no-trackeados y modificados) | NO ejecutar drop ni clear |
| 4 | Generar índice de snapshot (lista de archivos + checksums) | índice versionado y verificable |
| 5 | Registrar el snapshot como puerta de inicio | solo se implementa con snapshot registrado |

## 4. Regla de conservación (decisión de Bernardo 2026-09-29)

1. `stash@{0}` es capa adicional de recuperación y se mantiene mientras los 16+ documentos de Arquitectura sean untracked y no exista commit consolidado.
2. Prohibido `git stash drop` y `git stash clear`.
3. El snapshot del §3 ES la capa canónica de restauración; la stash es el respaldo interino.

## 5. Relación con el rollback del slice

El snapshot (paso 5) habilita la reversión básica del Blueprint §14:1 — retirar `CmscDashboard.jsx`, capas `pages/cmsc/`, `cmscAdapters.js`, `docsBySignal.js` y revirter las 3 modificaciones aditivas de `App.jsx`, `TopNav.jsx` y `useLabStore.js`. El snapshot garantiza que el árbol previo es recuperable sin migración.

## 6. Cierre

Procedimiento definido. El snapshot se ejecutará como paso 0 de la misión de implementación F3C v1, antes de la primera línea de código.

---

*Procedimiento operativo. Sin ejecución. Sin código. HEAD `18b95b1` y stash conservados.*