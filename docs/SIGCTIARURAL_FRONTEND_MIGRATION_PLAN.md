# SIGCTIARURAL_FRONTEND_MIGRATION_PLAN — Plan de migración del frontend a la Dashboard Ganadora

**Familia:** Refactorización Global · **Gate:** U0.5 → U1 (transición a la Dashboard Ganadora)
**Estado:** `referencia` (plan de diseño — **sin código**)
**Referencia oficial:** **Dashboard Ganadora** = [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md). No se diseñan nuevas visiones.

---

## 1. Propósito

Responder: **¿Cómo migrar el frontend actual a la Dashboard Ganadora, fase por fase, sin romper
usuarios, rutas ni laboratorios?** La regla suprema **NADA DESAPARECE** y el principio de
**evolución por ampliación** gobiernan cada fase. Este plan es la hoja de ruta que se ejecutará
en el gate U1 cuando el dueño lo apruebe — hoy es documento de diseño.

---

## 2. Principios de la migración (inamovibles)

1. **Fases aditivas**: cada fase añade, ninguna quita. Al terminar cada fase todo lo anterior sigue
   funcionando (rutas, páginas, labs, datos).
2. **Sombra hasta aprobar**: el nuevo contenido vive junto al actual (feature-flag / URL nueva),
   nunca reemplazando la vista de producción de inmediato.
3. **Rutas congeladas**: no se modifica ninguna ruta existente durante la migración
   (ver [`ROUTE_EVOLUTION`](SIGCTIARURAL_ROUTE_EVOLUTION.md)).
4. **Componentes viven o se realojan, no se borran** (ver [`COMPONENT_MIGRATION_MATRIX`](SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md)).
5. **Un lab por fase**: el orden de migración no toca dos labs al mismo tiempo.
6. **Gate por fase**: cada fase tiene criterio de aceptación verificable y rollback trasparente.
7. **Cero backend**: ninguna fase depende de cambios en `src/backend` (contextos, APIs, wiring)
   ni en los contratos `SensorReading`/`Telemetry`/`RobotTelemetry`.

---

## 3. Fase 0 — Congelar y baselinear (no tocar nada)

**Objetivo:** tener un punto de partida verificable antes de migrar.

| Paso | Detalle |
|---|---|
| 0.1 | Registrar `git status --porcelain` + `git diff --stat` del estado actual (solo docs). |
| 0.2 | Verificar que `npm run build` / arranque del frontend funciona HOY (baseline). |
| 0.3 | Snapshot visual del Dashboard, TopNav, LabCatalog y cada lab (para comparar tras cada fase). |
| 0.4 | Confirmar la lista de rutas activas (App.jsx) y el inventario de `COMPONENT_MIGRATION_MATRIX`. |
| 0.5 | Congelar: ninguna edición a `Dashboard.jsx`, `TopNav.jsx`, `LabCatalog.jsx`, labs, `lab-data.js`, `App.jsx` durante el diseño (todo esto es hoy; la migración empieza en U1). |

**Criterio de aceptación:** snapshot + baseline registrados. **Rollback:** no aplica (no se tocó nada).

---

## 4. Fase 1 — Cáscara aditiva (TopNav + rutas nuevas)

**Objetivo:** ampliar la navegación sin tocar ninguna página existente.
**Corresponde a:** `NAVIGATION_EVOLUTION` Fase A; EVOLUTION_MATRIX P0.

| Acción prevista (diseño; código en U1) | Impacto en lo existente |
|---|---|
| Añadir items `Hardware` y `Proyectos` (y opcional `Data Science`) al `TopNav` | Ningún item se quita ni reordena |
| Añadir `routeMap` de `Voice Assistant` con nuevas rutas (`hardware`, `proyectos`) | `routeMap` nunca se reduce |
| Añadir rutas nuevas `/hardware-catalog` y `/proyectos` en `App.jsx` | Todas las rutas existentes intactas |
| Lógica auth: NO se toca (sigue `latente`) | Ningún cambio |

**Criterio de aceptación:** todos los links actuales del TopNav funcionan; las 12 rutas actuales
responden; voz habla las 12 rutas actuales + las 2 nuevas. **Rollback:** quitar los items nuevos.

---

## 5. Fase 2 — Hardware Catalog (nuevo, aditivo)

**Objetivo:** crear la vista de Hardware Catalog **sin tocar el Dashboard**.
**Corresponde a:** EVOLUTION_MATRIX P1; [MISIÓN 6](SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md).

| Acción prevista | Impacto |
|---|---|
| Nueva página en `/hardware-catalog` (frontend-only; datos en módulo estilo `lab-data` nuevo o JSON estático) | Ninguno en Dashboard |
| Entradas: BBB-01/02/03 (preservados, sección Operación/Referencia) + ESP32, STM32, Arduino, Raspberry, Jetson, FPGA, MiniPC (estado `referencia`/`vacío`) | Ninguno |
| **Realojar** (no borrar) los 5 tiles "Integraciones Futuras" (RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV) como entradas de catálogo con sus enlaces intactos | El Dashboard de producción sigue mostrando los tiles tal cual hasta la Fase 3 las reubique al catálogo |

**Criterio de aceptación:** `/hardware-catalog` muestra todas las entradas con estado honesto
(`referencia`/`vacío`), BBB incluidos; los 5 tiles originales siguen en el Dashboard actual.
**Rollback:** quitar la ruta nueva.

---

## 6. Fase 3 — Reorganización del Dashboard (Operación + Telemetría)

**Objetivo:** transformar el contenido del Dashboard hacia la Ganadora sin cambiar la ruta
`/dashboard` y sin borrar widgets.
**Corresponde a:** DASHBOARD_REIMAGINED_V2 §3-§10; EVOLUTION_MATRIX P0.

| Acción prevista | Componentes preservados |
|---|---|
| Reestructurar `Dashboard.jsx` en secciones: **Operación** (BBB-01/02/03) y **Telemetría** (V3 + gráfica) | `ClusterCard`, `GlobalChart`, `TelemetryPanel`, `Telemetry3DScene`, `LoginModal`, `TELEMETRY_ENDPOINTS` (V3 + fallback), `initialNodes`, `defaultChartData` — todos **PRESERVAR** |
| Al final de esta fase, los 5 tiles "Integraciones Futuras" se **realojan** en `/hardware-catalog` (sus datos/enlaces pasan al catálogo; el tile del Dashboard queda como acceso al catálogo, no se borra el contenido) | Datos y enlaces de RPI-05/FPGA-X/ARDUINO/ALEXA/DRONE intactos en el catálogo |
| Añadir breadcrumb de la cadena (Conocimiento → … → Proyectos) de forma aditiva | No cambia nada existente |
| Selector de persona: se prepara (Fase 4), NO aquí | – |

**Criterio de aceptación:** `/dashboard` carga igual de rápido; BBB y telemetría visibles; los tiles
siguen accesibles (desde catálogo); sin pérdida de datos. **Rollback:** restore de `Dashboard.jsx`
desde la snapshot (git del branch, sin push).

---

## 7. Fase 4 — Selector de persona (opcional, aditivo)

**Corresponde a:** NAVIGATION_MODEL M4; EVOLUTION_MATRIX P1.

| Acción prevista | Impacto |
|---|---|
| Nuevo widget opcional (persistencia `localStorage`) para elegir persona (Estudiante ADSO, Instructor, Investigador, Desarrollador; Agricultor* gated) | Ninguno: sin persona seleccionada se ve la vista general actual |
| La IA por persona filtra/reordena el Dashboard **sin eliminar** secciones | Ninguno |

**Criterio de aceptación:** el Dashboard general es el default; elegir persona cambia el orden
visual, no oculta nada para quien no interactúa. **Rollback:** quitar widget.

---

## 8. Fase 5 — Proyectos Reales (vista)

**Corresponde a:** DASHBOARD_REIMAGINED_V2 §8; EVOLUTION_MATRIX P1.

| Acción prevista | Impacto |
|---|---|
| Rellenar `/proyectos` con casos de uso/capacidades de la cadena (fuente estática o Knowledge Hub) | Ninguno |
| Conectar breadcrumb final de la cadena | Ninguno |

**Criterio de aceptación:** `/proyectos` muestra proyectos/casos reales; ninguna página se rompe.

---

## 9. Fase 6 — Capacidades con decisión del dueño (UBTN + Auth)

**Ambas NO se implementan sin decisión explícita** (ver `IMPLEMENTATION_READINESS` §4/§6):

| Capacidad | Dependencia de decisión | Diseño de referencia |
|---|---|---|
| Vista conceptual UBTN (bioseñal sin falso estado) | A-7 (MVP) + gate U1 | DASHBOARD_REIMAGINED_V2 §6/§10.2; `UBTN_FRONTEND_UX_STRATEGY` |
| Rutear Auth (Login/Register/Admin2FA) | Política de roles del dueño (D-A) | IMPLEMENTATION_READINESS §4 |

---

## 10. Fase 7 — Consolidación y verificación de guardarraíles

| Verificación | Cómo |
|---|---|
| Guardarraíles GR-01..GR-12 | Checklist GR (`REFACTORING_GUARDRAILS`) |
| Regla NADA DESAPARECE | Releer `PRESERVATION_STRATEGY` §3 y `COMPONENT_MIGRATION_MATRIX` (ningún componente PRESERVAR deprecado sin notificación) |
| Rutas intactas | Recorrido manual de las 12 rutas originales + hash de `routeMap` |
| Contratos intactos | `git diff` de `src/backend` = vacío; `SensorReading`/`Telemetry` sin tocar |
| Sin alarmas falsas | EE estado honesto (`referencia`/`vacío`) en catálogo y Operación |

**Criterio de aceptación:** cumplir las 7 respuestas del Resultado Esperado de la Misión:
(1) archivos React existentes, (2) componentes que sobreviven, (3) componentes que cambian,
(4) cómo migrar, (5) en qué orden, (6) qué NO tocar, (7) cómo llegar a la Dashboard Ganadora.

---

## 11. Nota de gobernanza

- Este plan se ejecuta **solo con autorización explícita del dueño** y en el branch de trabajo (nunca `main`).
- **Este documento es diseño**: no se escribe ninguna línea de código ni se hace commit en este gate.
- Cualquier desviación de una fase (orden, extracción o alcance) requiere re-audit (MISIÓN 8) + bitácora.

---

## 12. Referencias

- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — **Dashboard Ganadora**.
- [`SIGCTIARURAL_NAVIGATION_EVOLUTION.md`](SIGCTIARURAL_NAVIGATION_EVOLUTION.md) — hábitos y fase A/B/C.
- [`SIGCTIARURAL_EVOLUTION_MATRIX.md`](SIGCTIARURAL_EVOLUTION_MATRIX.md) — prioridades P0/P1/P2.
- [`SIGCTIARURAL_ROUTE_EVOLUTION.md`](SIGCTIARURAL_ROUTE_EVOLUTION.md) — rutas compatibles/redirects.
- [`SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md`](SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md) — catálogo.
- [`SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md`](SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md) — clasificación de cada archivo.
- [`SIGCTIARURAL_IMPLEMENTATION_READINESS.md`](SIGCTIARURAL_IMPLEMENTATION_READINESS.md) — checklist gate U1.