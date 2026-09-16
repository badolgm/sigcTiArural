# SIGCTIARURAL_PRESERVATION_AUDIT — Auditoría crítica de la preservación del ecosistema

**Familia:** Refactorización Global · **Gate:** U0 → U0.5 → Preservación + Expansión (MISIÓN 7)
**Estado:** `referencia` (auditoría con reconciliación aplicada)
**Método:** auditoría cruzada con inspección directa del filesystem (`src/frontend/src/**`) y las
familias documentales U0.5/UBTN. **No se escribió código ni se tocó `src/`.**

---

## 1. Propósito de esta auditoría

Cazar, con lupa de preservación:
1. **Elementos olvidados** en los planes de rediseño.
2. **Funcionalidades que podrían perderse** durante una refactorización.
3. **Conocimiento oculto** sin inventariar.
4. **Laboratorios huérfanos** (sin presencia clara en la cadena/navegación).
5. **Hardware sin representación** en la interfaz.
6. **Riesgos de simplificación excesiva** (donde "ordenar" pueda significar "borrar").

Veredicto a la luz de la **REgla Suprema (NADA DESAPARECE)**.

---

## 2. Hallazgos

### PA-01. Autenticación latente — riesgo de "limpieza" (olvidado)
Existe código de auth completo **no ruteado** en `App.jsx`: `AuthContext.jsx`, `AuthGuard.jsx`,
`pages/Login.jsx`, `pages/Register.jsx`, `pages/Admin2FA.jsx`, y `LoginModal` (este sí activo en el
Dashboard como gate `onRequireAuth`). Riesgo: un refactor de rutas podría "limpiar" páginas no
enlazadas. **Reconciliación:** inventariadas como `latente`/preservadas (`COMPONENT_MAP` §2.1/§2.3,
`PRESERVATION_STRATEGY` §3.5.1); ruteo pendiente de decisión del dueño (`IMPLEMENTATION_READINESS` §4).

### PA-02. Banner `SYSTEM ONLINE` (debug) y doble indicador de clúster (olvidado)
Existe un banner fijo `SYSTEM ONLINE: {path}` (debug visible en producción) **y** el dot de estado
del clúster en la TopNav. Ambos son artefactos actuales. **NO se eliminan** (regla suprema); se
catalogan como "artefacto de depuración legado" (`PRESERVATION_STRATEGY` §3.6). Nota de riesgo:
debe decidir el dueño si lo quita — no la refactorización.

### PA-03. Voice Assistant — `routeMap` nunca se reduce (funcionalidad que podría perderse)
Los 12 comandos de voz viven en `App.jsx` (`handleNavigation`, `routeMap`). Un refactor que reescriba
la navegación podría olvidar comandos. **Reconciliación:** regla inmutable "ampliar, nunca reducir"
(`NAVIGATION_EVOLUTION` §4, `PRESERVATION_STRATEGY` §3.4).

### PA-04. `pages/_deprecated/*` — conocimiento oculto (olvidado)
5 páginas migradas: `DocsReadme`, `DocsPlanMaestro`, `DocsMasterdoc`, `DocsEdgeSetup`,
`DocsApiReference`. Son **legado** no ruteado. Riesgo de "garbage collect". **Reconciliación:**
preservadas como legado histórico (`PRESERVATION_STRATEGY` §3.6, `COMPONENT_MAP` §2.1).

### PA-05. Generador del `knowledgeRegistry.generated.json` no inventariado (conocimiento oculto)
El registro (51 docs operativos) es **generado**; el script generador no está identificado en el
inventario del filesystem inspeccionado. Riesgo: futura ampliación de schema (bn/json) romper el
generador sin saberlo. **Reconciliación:** `IMPLEMENTATION_READINESS` §3 exige ampliación aditiva y
no romper el registro existente; se agrega a la lista de protección en `PRESERVATION_STRATEGY` §5
(item 4 ya cubre `knowledgeRegistry.generated.json`). **Acción pendiente:** localizar y nombrar el
script generador en `COMPONENT_MAP` (sin tocar) en una revisión futura.

### PA-06. Hardware sin representación real en la interfaz (hardware sin representación)
Tiles de dashboard sí representan: RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV. **No tienen
representación**: ESP32 (referencia real en piscicultura/Colombia), Jetson Nano/Xavier NX, STM32.
**Reconciliación:** tabla de inventario hardware (`COMPONENT_MAP` §5) los lista; en el Hardware
Catalog (diseño) entran como entradas `referencia`/`vacío` — nunca desaparecen. La regla "dejar de
ser el centro pero seguir existiendo" aplica a BBB (ver PA-09).

### PA-07. Electrónica / Falstad / SchematicEditor — migración reciente frágil (puede perderse)
`ElectronicsLab` usa `SchematicEditor.jsx` (legacy) vía `legacySchematicEditorAdapter.js`, y
`FalstadPanel.jsx` vía `falstadAdapter.js` contra `circuitSimulationPort.js` (Día 18/19). Riesgo: un
refactor "limpio" que reescriba el lab lo rompa. **Reconciliación:** puerto/adaptadores preservados
(`COMPONENT_MAP` §2.2, `EVOLUTION_MATRIX` §3.6 — P2: preservar, migrar a WASM en largo plazo).

### PA-08. Estados simulados sin procedencia = alarmas falsas (riesgo honestidad)
`Dashboard.jsx` / `TopNav.jsx` tienen nodos por defecto con `status: 'alert'` (BBB-02) e
`'offline'` (BBB-03) como **dato fallback**; con BBB de 0 bytes esto es una "alarma falsa"
educativamente dañina. **Reconciliación:** estado honesto `referencia` (GR-09) y rotulado simulado
(`DASHBOARD_REIMAGINED_V2` §10, `IMPLEMENTATION_READINESS` §3 "Estado honesto de BBB").

### PA-09. Riesgo de simplificación excesiva: ocultar al BBC (y a BBB)
Un rediseño "más limpio" puede enterrar los 3 BBB en un submenú o borrar sus tiles. **Regla: los
BBB siguen en "Operación", visibles, con su dot TopNav** (`DASHBOARD_REIMAGINED_V2` §10.2 fila 1;
`EVOLUTION_MATRIX` §3.15). "Dejan de ser el centro" ≠ "dejan de verse".

### PA-10. Riesgo de simplificación excesiva: el selector de persona esconde la vista general
Si el Dashboard filtrado por persona reemplaza la vista general, usuarios actuales pierden el hábito.
**Reconciliación:** selector **opcional/aditivo**; sin persona seleccionada se ve la vista general
actual (`NAVIGATION_EVOLUTION` §6).

### PA-11. Duplicidad de fuente de datos de telemetría (riesgo de mantenimiento, no de pérdida)
`App.jsx` carga `fetchClusterNodesReal`/`fetchTelemetrySeriesReal` (cloud.js) **y** `Dashboard.jsx`
hace su propia consulta V3 (`/api/v3/telemetry/history/`) con fallback V1/V2. Ninguno se pierde;
ambos se preservan ($3 de PRESERVATION_STRATEGY). Se registra como riesgo de mantenimiento a
documentar en U1, **no** como motivo para eliminar alguna vía.

### PA-12. Laboratorios fuera del namespace `/labs/*` (laboratorios "casi huérfanos")
`AdvancedMathLab`, `AdvancedMathLabV2`, `DataScienceLab` viven como rutas top-level fuera de
`/labs/*`. No están huérfanos (LabCatalog los enlaza), pero en la nueva navegación deben seguir
enlazados y visibles en el breadcrumb de la cadena (`NAVIGATION_EVOLUTION` §5); se preserva su
ruta.

---

## 3. Hallazgos cero-riesgo (verificados, no se pierde nada)

| Elemento | Dónde queda en la v2 |
|---|---|
| BBB-01/02/03 + dot + ClusterCard | Operación (Dashboard) + TopNav dot |
| TelemetryPanel / GlobalChart / Telemetry3DScene / V3 fallback | Sección Telemetría |
| 4 labs canónicos + robótica 3D + catálogo | Sección Laboratorios + breadcrumb |
| AdvancedMath V1/V2, DataScience | Laboratorios experiencia/STEM |
| Knowledge Hub 51 docs + registro | Sección Conocimiento (ampliado) |
| Voice Assistant (12 comandos) | Preservado y ampliado |
| LoginModal gate | Preservado (Dashboard) |
| `lab-data.js`, `useLabStore`, `useRoboticsApi`, `cloud.js`, `ErrorBoundary` | Preservados |
| `electronics/*` ports + adapters (Falstad) | Preservados |
| Ruta 404 → Dashboard | Preservada |
| Familias UBTN (26), EIARC (legado), históricas | Preservadas y catalogadas |

---

## 4. Riesgos de simplificación excesiva (filtro: NA-DA-DES-APA-RE-CE)

| Riesgo | Señal de que pasa | Regla que lo impide |
|---|---|---|
| "Mejoro" el dashboard y borro los tiles de integraciones | Tile desaparece del árbol | Realojar en Hardware Catalog (no borrar) |
| "Apruebo" y expurgo páginas sin ruta | `Login/Register/Admin2FA/_deprecated` se borran | Son latente/legado; no se tocan |
| "Simplifico" la navegación | Un item del TopNav o comando de voz desaparece | Ampliar, nunca reducir |
| "Quito estado falso" y borro el dato | Se pierde info de BBB | El dato se muestra como `referencia` |
| "Hago la clave por persona" y oculto la general | Agricultor o seleccionador sin ver vista general | Selector opcional; vista general default |
| "Hago limpio" y reescribo el lab de electrónica | Adaptadores de Falstad/SchematicEditor se pierden | Puerto/adapters preservados |

---

## 5. Matriz de reconciliación (fixes aplicados en ESTA misión)

| Código | Fix aplicado | Archivo |
|---|---|---|
| R-01 | "Agricultural" → "Agricultura" (lab canónico) | `EVOLUTION_MATRIX` §3.4 |
| R-02 | "matríz" → "matriz" | `PRESERVATION_STRATEGY` §7 |
| R-03 | Inventario completo verificado del frontend (páginas, labs, components, hooks, services, knowledge-hub, auth) | `COMPONENT_MAP` §2 |
| R-04 | Reconcilia la actualización de Misión 4 (NO ELIMINAR NADA) con el §10 anti-catálogo | `DASHBOARD_REIMAGINED_V2` §10/§10.2 |

---

## 6. Deuda abierta (para el dueño — no bloquea el diseño)

| Deuda | Acción esperada | Fuente |
|---|---|---|
| D-A: Política de Auth (¿rutear Login/Register/Admin2FA? roles) | Decisión del dueño; ruteo en U1 | PA-01 / IMPLEMENTATION_READINESS §4 |
| D-B: Banner `SYSTEM ONLINE` (¿mantener o quitar?) | Decisión del dueño (no la refactorización) | PA-02 |
| D-C: Localizar script generador del `knowledgeRegistry` y nombrarlo | Actualizar COMPONENT_MAP en revisión posterior | PA-05 |
| D-A-7: Decisión MVP UBTN (NTC/DS18B20 vs HR/RR MAX30102) | Cierre de ADR-UBTN en U1 | UBTN_AUDIT_REVIEW A-7 |
| D-E: Jetson/STM32/FPGA/MiniPC con rol documentado | Decisión de inclusión en el modelo de aprendizaje | GHL-01..05 / PA-06 |

---

## 7. Veredicto de la auditoría

> **Se puede preservar TODO.** Todos los hallazgos identificados ya están inventariados y
> garantizados por la familia de diseño: `PRESERVATION_STRATEGY` (qué se preserva), `COMPONENT_MAP`
> (inventario verificado), `EVOLUTION_MATRIX` (secuencia por módulo), `NAVIGATION_EVOLUTION`
> (hábitos intactos), `DASHBOARD_REIMAGINED_V2` §10 (regla NO ELIMINAR NADA — actualizado),
> `IMPLEMENTATION_READINESS` (qué toca y qué no toca).
>
> **Condición de aprobación del gate U1:** ninguna implementación puede iniciarse si no pasa el
> checklist de `IMPLEMENTATION_READINESS` §6 y no conserva §3 de `PRESERVATION_STRATEGY` (lupa:
> PA-01..PA-12 marcados como preservados).
>
> **Riesgo residual controlado:** los únicos "bloqueos" no son de diseño, son de **decisión**: Auth
> (D-A), banner debug (D-B), A-7 UBTN (D-A-7) y rol de Jetson/STM32/FPGA (D-E).
>
> **Frase que la Misión pide poder afirmar al final:** *"SIGCTiArural v2 es más grande, más
> ordenado y más potente que v1. No se perdió absolutamente nada de lo que hacía valioso a
> SIGCTiArural."* — Con la evidencia de esta auditoría, **esa afirmación puede hacerse con
> honestidad.**

---

## 8. Referencias

- [`SIGCTIARURAL_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) — regla suprema e inventario inviolable.
- [`SIGCTIARURAL_COMPONENT_MAP.md`](SIGCTIARURAL_COMPONENT_MAP.md) — inventario verificado del filesystem.
- [`SIGCTIARURAL_EVOLUTION_MATRIX.md`](SIGCTIARURAL_EVOLUTION_MATRIX.md) — secuencia de evolución.
- [`SIGCTIARURAL_NAVIGATION_EVOLUTION.md`](SIGCTIARURAL_NAVIGATION_EVOLUTION.md) — hábitos y voz.
- [`SIGCTIARURAL_IMPLEMENTATION_READINESS.md`](SIGCTIARURAL_IMPLEMENTATION_READINESS.md) — checklist U1.
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — §10 NO ELIMINAR NADA.