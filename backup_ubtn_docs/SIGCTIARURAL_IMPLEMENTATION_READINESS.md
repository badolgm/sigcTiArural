# SIGCTIARURAL_IMPLEMENTATION_READINESS — Estado de preparación para implementación

**Familia:** Refactorización Global · **Gate:** U0 → U0.5 → Preservación + Expansión
**Estado:** `referencia` (evaluación, no implementación)
**Regla rectora:** **NADA DESAPARECE.** Sin código, sin commits, sin tocar `main` ni `src/` en este gate.

---

## 1. Propósito

Determinar **qué está listo, qué no está listo, qué puede implementarse ya y qué no debe
tocarse aún**, para que al pasar al gate U1 (Fase 8+ del PLAN_MAESTRO) se sepa exactamente qué
tiene luz verde y qué sigue bloqueado. Este documento es la **puerta de entrada** entre el diseño
U0.5 y la implementación U1.

---

## 2. Veredicto general del Gate U0.5

| Dimensión | Veredicto |
|---|---|
| Diseño (identidad, componentes, guardianes, dashboard reimaginado) | **VALIDADO** (familia SIGCTIARURAL U0.5 + Misión Crítica) |
| Implementación (código en `src/`) | **BLOQUEADA** — prohibido tocar `src/` hasta gate U1 |
| Reorganización visual del Dashboard | **LISTA PARA DISEÑAR** (Fase A: aditiva, sin romper nada) |
| Rutas nuevas (`/hardware-catalog`, `/proyectos`) | **LISTAS PARA DISEÑAR** (aditivas) |
| Selector de persona | **LISTO PARA DISEÑAR** (aditivo; MVP: 3 personas, Agricultor gated) |
| Evidencia funcional (trazabilidad, papelera) | **NO LISTO** — requiere nuevo modelo de dominio + contexto + puerto |
| Auth completo (rutear) | **NO LISTO** — decisión explícita pendiente (política GIA) |
| Hardware real (BBB con datos) | **NO LISTO** — BBB = referencia, 0 bytes; no hay fuente de datos reales |
| UBTN en interfaz | **NO LISTO** — requiere resolución de A-7 + gate U1 |

---

## 3. Qué está listo para implementar (puede tener luz verde en U1)

Los siguientes elementos tienen diseño validado, guardarraíles verificados y **no requieren
modificar contratos de dominio, Telemetry, SensorReading ni `src/backend`**:

| Ítem | Por qué está listo | Prerequisitos para U1 |
|---|---|---|
| **TopNav ampliado** (+Hardware, +Proyectos, +Data Science) | Diseñado (`NAVIGATION_EVOLUTION` Fase A); aditivo; sin cambio de rutas existentes | Solo diseño en App.jsx + TopNav.jsx; sin tocar backend |
| **Ruta `/hardware-catalog`** | Diseñada (entry aditiva en App.jsx); datos catálogo = `lab-data.js` + entradas manuales | Diseño en App.jsx, componente nuevo frontend-only; sin backend nuevo |
| **Ruta `/proyectos`** | Diseñada (entry aditiva en App.jsx) | Diseño en App.jsx; componente nuevo frontend-only |
| **Voice Assistant ampliado** | Diseñado (`NAVIGATION_EVOLUTION` §4); solo añadir comandos al `routeMap` | Sin cambio de contratos |
| **Reorganización interna de Dashboard** (secciones Operación + Telemetría) | Diseñada (`DASHBOARD_REIMAGINED_V2` §10); todos los componentes preservados | Reestructurar JSX; sin cambio de datos ni contratos |
| **Realojar tiles "Integraciones Futuras" como entradas de catálogo** | Diseñado (`DASHBOARD_REIMAGINED_V2` §10.2); identidad/enlaces preservados | Transformar data; sin cambio funcional |
| **Selector de persona (MVP: Estudiante/Investigador/Desarrollador)** | Diseñado (`NAVIGATION_MODEL` M4); aditivo; dato local (`localStorage`) | Componente nuevo; sin backend |
| **Knowledge Hub ampliado** (añadir familias UBTN/SIGCTIARURAL al índice) | Diseñado; schema bn/json compatible | Script de generación del registro (ampliación, no ruptura) |
| **Breadcumb en cadena pedagógica** | Diseñado (`NAVIGATION_EVOLUTION` §5) | JSX aditivo; sin backend |
| **Estado honesto de BBB** (`referencia`, no fake) | Validado (`REFACTORING_GUARDRAILS` GR-09) | Solo cambio de etiqueta/visual |
| **Simulación de UBTN** (vista conceptual, sin falso estado) | Diseñada (`DASHBOARD_REIMAGINED_V2` §10.2, tabla) | Componente nuevo; sin backend real (diseño U0) |

---

## 4. Qué NO está listo (requiere trabajo previo o decisión)

| Ítem | Por qué NO está listo | Qué falta |
|---|---|---|
| **Evidencia funcional** (papelera funcional, trazabilidad del usuario) | No existe modelo de dominio (`EvidenciaTracking`), no hay contexto, no hay puerto | Diseñar `EvidenceTracking` (Entity), `EvidenceRepositoryPort`, y decisiones de donde vive el archivo en disco /storage |
| **Auth completo** (rutear Login/Register/Admin2FA) | Código existe (`AuthContext`, `AuthGuard`, `LoginModal`, `Register`, `Login`, `Admin2FA`) pero NO está ruteado; la política de quién puede qué es GIA (decisión del dueño) | Decisión explícita del dueño sobre política de roles; rutear tras esa decisión |
| **Hardware real en BBB** (datos de sensores en vivo) | Los 3 BBB tienen scripts de 0 bytes; la integración física está "en progreso" | Scripts reales + conexión a hardware; sin esto BBB sigue siendo `referencia` |
| **UTBN en interfaz** (bioseñal como ruta funcional) | Requiere resolución de A-7 (MVP: NTC/HR) + gate U1 + `BiologicalNodeRepositoryPort` | Decisión A-7, diseño del puerto y contexto (U1) |
| **Proyectos Reales** (ruta funcional con datos reales) | Ruta puede crearse ya (§3), pero no hay fuente de datos de proyectos | Necesita fuente de datos (JSON estático, Knowledge Hub o API nueva) |
| **Contexto/port Hardware** (`HardwareContext` + `HardwareCatalogRepositoryPort`) | No existe en backend | Diseñar y crear contexto (U1+); sin esto Hardware Catalog = datos estáticos |
| **Decoder de eventos para UBTN** | ADR-08 aún no cerrado (ver UBTN_ARCHITECTURE) | Cierre ADR-08 |
| **Jetson/STM32/FPGA/MiniPC con rol real** | Sin inventariar en backend; solo hardware de referencia | Decisión de inclusión + documentación |
| **Agricultor como persona activa** | Gated por MVP real (sin trazabilidad de evidencia funcional) | Se activa cuando evidencia funcione |

---

## 5. Qué NO debe tocarse NUNCA en este gate (prohibiciones absolutas)

Estas prohibiciones se heredan de la Misión y se confirman aquí:

| Prohibido | Razón |
|---|---|
| `src/backend/` (contextos, APIs, wiring, puertos) | Requiere gate U1 + migración; tocarlo sin migración rompe el sistema |
| `src/frontend/src/` (código productivo) | Hasta tener aprobación del dueño y gate U1 |
| `SensorReading`, `Telemetry`, `RobotTelemetry` | Contratos de dominio inviolables (regla de la Misión) |
| `EventBus`, `wiring.py` | Plomería entre contextos; romperla rompe todo |
| 4 estrategias de labs (`agricultura.py`, `robotica.py`, `telecom.py`, `electronica.py`) | Labs canónicos operativos |
| `knowledgeRegistry.generated.json` (sin ampliar correctamente) | Registro de 51 docs; solo ampliar con script compatible |
| `src/embedded/` (BBB scripts) | Sin modificar; referencia |
| `main` branch | Prohibido |
| Commits/push/merge/rebase/PR | Prohibido |

---

## 6. Checklist de prerrequisitos para gate U1 (cuando se abra)

Antes de que cualquier implementación de la refactorización comience, se debe:

- [ ] Tener **aprobación explícita** del dueño del proyecto para modificar `src/`.
- [ ] Tener **política de auth** decidida (quién puede qué; rutear o no).
- [ ] Tener **decisión A-7** (MVP UBTN) cerrada.
- [ ] Tener **branch dedicada** (no `main`) con migración documentada si hay cambios de contrato.
- [ ] Tener **tests de regresión** del sistema actual (o al menos smoke tests).
- [ ] Revisar este documento + `PRESERVATION_AUDIT` + `REFACTORING_AUDIT` para confirmar que
  nada de §3 de `PRESERVATION_STRATEGY` se rompió.
- [ ] Confirmar que `git status --porcelain` y `git diff --stat` no muestran cambios fuera de
  lo documentado.

---

## 7. Gobernanza

- Este documento se actualiza cada vez que cambia el estado de un ítem (§3 → §4 o viceversa).
- Cualquier cambio de un elemento de §5 requiere aprobación del dueño + ADR + bitácora.
- **No hay implementación** en este gate; §3 y §4 son indicadores de preparación para el gate U1.

---

## 8. Referencias

- [`SIGCTIARURAL_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) — qué se preserva (inviolable).
- [`SIGCTIARURAL_COMPONENT_MAP.md`](SIGCTIARURAL_COMPONENT_MAP.md) — inventario completo.
- [`SIGCTIARURAL_EVOLUTION_MATRIX.md`](SIGCTIARURAL_EVOLUTION_MATRIX.md) — secuencia por módulo.
- [`SIGCTIARURAL_NAVIGATION_EVOLUTION.md`](SIGCTIARURAL_NAVIGATION_EVOLUTION.md) — evolución de navegación.
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) — GR-01..GR-12.
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — spec visual.