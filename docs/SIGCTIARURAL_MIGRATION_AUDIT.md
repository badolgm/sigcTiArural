# SIGCTIARURAL_MIGRATION_AUDIT — Auditoría mínima de la transición a la Dashboard Ganadora

**Familia:** Refactorización Global · **Gate:** U0.5 → U1 (transición a la Dashboard Ganadora)
**Estado:** `referencia` (informe de auditoría de diseño — sin código)
**Resultado:** listo para **Gate U1**· **Regla:** NADA DESAPARECE / la Ganadora es referencia oficial.

---

## 1. Contexto del experimento

Se auditaron los archivos reales de `src/frontend/src/**` (páginas, layouts, laboratorios,
componentes, hooks, store, servicios, datos, estilos) y las rutas de `App.jsx` para garantizar
que la transición a la Dashboard Ganadora (implícita en `DASHBOARD_REIMAGINED_V2`) cumpla:
sin pérdida de rutas, sin pérdida de componentes, sin pérdida de funcionalidades, sin cambios de
backend en este gate, y sin nuevas "visiones" de dashboard.

---

## 2. Riesgos de implementación (clasificados)

| # | Riesgo | Severidad | Dónde | Mitigación |
|---|---|---|---|---|
| R-01 | Reorganizar el Dashboard **rompe** `initialNodes` duplicado en `Dashboard.jsx` + `TopNav.jsx` (doble fuente de verdad BBB) | Alta | Dashboard/TopNav | Fase 3: consolidar SOLO en el módulo de datos del catálogo; regla: los dots de TopNav no cambian de fuente hasta equivalencia |
| R-02 | Bifurcación "Ganadora vs Actual" (dashboards concurrentes) divide la atención del usuario | Alta | Dashboard | La Ganadora **es** el `/dashboard` reescrito internamente, no una ruta nueva (Fase 3 con snapshot previo); sin bifurcación |
| R-03 | Falstad (iframe) + vendor `circuitjs1` se desincronizan si algo toca `public/vendor/**` o el puerto | Alta | ElectronicsLab | `NO TOCAR` (matriz §2.3); Falstad vendored congelado |
| R-04 | V3 telemetría (env) se reescribe sin el frontend → `TelemetryPanel`/`GlobalChart` rotos | Alta | Telemetría | Preservar contrato `{context:'telemetry', items[]}`; el endpoint `/api/v3/telemetry/history/` intacto |
| R-05 | Auth latente / LoginModal tocado sin decisión D-A → rompe gate de acciones | Media | AuthContext/AuthGuard/LoginModal | No se toca en este gate; D-A pendiente del dueño |
| R-06 | `useRoboticsApi`/`RobotTelemetry` tocado al integrar telemetría | Media | DataScience/IA/robótica | PROHIBIDO tocar; preservación por Misión de Preservación (PA-08) |
| R-07 | Crear `catalog-data.js` y no mapearlo con `lab-data.js` (dos catálogos) | Media | Hardware/`/labs` | §5 del plan Hardware: `catalog-data` solo para hardware; `lab-data` intacto |
| R-08 | Vínculos/aliases de VoiceAssistant no cubren nueva ruta → asistentes muertos | Media | VoiceAssistant | Ampliar `routeMap` aditivo (nunca reducción de 12 comandos) |
| R-09 | Banner debug `SYSTEM ONLINE` pegando al nuevo diseño | Baja | App.jsx | Decisión dueño (PA-02), preservación mientras tanto |
| R-10 | Persona/agricultor gated rompe flujo no-logado | Baja | Ganadora §Persona | Si se activa: default General; Agricultor* solo tras login (decisión) |
| R-11 | Estilos neón nuevos pisan `index.css` actual | Baja | CSS | Clases **aditivas**; nada de `index.css` se reescribe sin diff aprobado |
| R-12 | Dime Route evolution: mover tiles → catálogo si `Dashboard.jsx` se toca antes de snapshot | Media | Dashboard | La Fase 3 realoja con **copia de datos**; el catálogo vive independiente hasta el cambio |

---

## 3. Dependencias ocultas (no evidentes a simple vista)

| Dependencia oculta | Archivos | Riesgo si se ignora |
|---|---|---|
| `circuitjs1` vendored bajo `public/` (Falstad iframe) | `public/vendor/circuitjs1/**` | Electrónica muere (iframe 404) |
| `mathHelpers.js` compartido por V1/V2 | `labs/mathHelpers.js` | Solo cambiarlo divide ambos labs |
| Tuplas `desiredOrder`/`labCategories` en `lab-data.js` son el *único* contrato de LabCatalog | `data/lab-data.js` + `LabCatalog.jsx` | Quitar categoría desordena el grid y rompe vínculos |
| Dots de estado duplicados (Dashboard + TopNav) | `Dashboard.jsx` y `TopNav.jsx` | Un fetch por duplicado → latencia/estado falso detectado por GR-09 |
| Enlaces **reales** (raspberrypi.com, amd.com+yosys, docs.arduino.cc, Alexa, PX4/ArduPilot) para tiles | Dashboard `futureNodes` | Se pierden al realojar si no se copian primero |
| Register/Login las `_deprecated` guardan lógica de plantilla de demo | `pages/_deprecated/*` | Migrar ciegamente reescribe; mantener intactas (no ruteadas) |
| `useLabStore.js` global side-navigation persistente | `stores/useLabStore.js` | Tocar esta store al mover labs rompe selección persistida |
| `services/cloud.js` (env wrapper) usado por telemetría | `services/cloud.js` | No tocar offline/onboarding paths sin contrato |
| `AuthContext.jsx` inyecta `chevron` en TopNav + guard | `auth/AuthContext.jsx` + `App.jsx` | Movimiento TopNav puede romper persistencia auth |
| `knowledge-hub/**` (7 archivos) rebanan datos dinámicos | `knowledge-hub/*` | Si el flujo toca los docs del Knowledge Hub, se rompen las tarjetas |

---

## 4. Componentes / rutas / funcionalidades que quedan en riesgo de ser olvidados

| Olvidado | Peso | Dónde va en la Ganadora |
|---|---|---|
| **DataScienceLab con Pyodide/D3** (IA) | Medio | Sección Laboratorios + eslabón IA |
| **AI Predictiva** (`/ai-predictive`) | Medio | Eslabón IA (nunca como surplus) |
| **Knowledge Hub** (7 archivos) | Medio | `/knowledge*` ampliado (familias + SIGCTIARURAL) |
| **VoiceAssistant routeMap** (12 comandos) | Bajo | Ampliar (no reducir) |
| **SchematicEditor legacy** (sin adapter se aísla) | Bajo | Falstad merge (adapters NO TOCAR) |
| **Telemetry3DScene** | Bajo | Sección Telemetría (la 3D se conserva) |
| **Backend Agricultura (`agricultura.py`)** | Medio | Factory/Strategy de labs intacto |
| **Logs/estado con contratos de Robotics** | Bajo | `useRoboticsApi` intacto |
| **Register/Login/Admin2FA** (latentes) | Bajo | No ruteados; decisión D-A (preservar código) |
| **Telemetría biológica UBTN (diseño U0)** | Medio | Gated (A-7 + decisión) |

---

## 5. Radiografía de decisiones pendientes (bloquean U1, no bloquean diseño)

| Decisión | Qué desbloquea | Estado |
|---|---|---|
| D-A política Auth | Rutear `/login|register|admin-2fa`, gate de persona | Pendiente dueño |
| D-A-7 MVP UBTN (NTC/DS18B20 vs HR/RR MAX30102) | Vista UBTN (Fase 6) | Pendiente dueño |
| D-B banner `SYSTEM ONLINE` | Limpieza del banner (PA-02) | Pendiente dueño |
| D-C localizar script generador `knowledgeRegistry.generated.json` | Ampliación del índice | Pendiente dueño |
| D-D (nuevo) crear `catalog-data.js` en QA vs generar en backend | Fase 2 Hardware Catalog | Pendiente dueño |

---

## 6. Veredicto del auditor

- **Listo para Gate U1** en lo que a *diseño* se refiere: la transición se puede ejecutar **sin
  fuerza bruta**, con **rutas congeladas**, con **componentes preservados** y con **realojos
  aditivos**.
- Los **bloqueadores no son técnicos sino de decisión**: D-A, D-B, D-C, D-A-7 y **D-D**. Sin ellos,
  las Fases 4-6 del `FRONTEND_MIGRATION_PLAN` quedan en pausa; las Fases 1-3 (dashboard, catalog,
  breadcrumb) pueden avanzar.
- **Verificación de no-pérdida:** las tres preguntas de la Misión (¿qué NO tocar?, ¿qué sobrevive?,
  ¿qué se crea?) se responden explícitamente en `COMPONENT_MIGRATION_MATRIX`, `GAP_ANALYSIS` y
  `ROUTE_EVOLUTION`; este informe las audita como **cerradas** (sin `sin_cubrir`).

---

## 7. Acciones recomendadas después de U1 (puente a implementación)

1. ADR para **D-D** (fuente de `catalog-data.js`) y **D-A** (Auth) → ambos antes de Fase 2/4.
2. Snapshot funcional del Dashboard **antes** de la Fase 3 (R-01/R-02/R-12).
3. Suite de regresión manual de 14 rutas + 12 comandos de voz + V3 telemetría en cada fase.
4. Actualizar bitácoras (SYSTEM_BOOT/MASTERDOC/PLAN_MAESTRO/README) al cerrar la misión.

---

## 8. Referencias

- [`SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md`](SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md) — fases.
- [`SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md`](SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md) — clasificación.
- [`SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS.md`](SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS.md) — existe/falta/sobra/ampliar.
- [`SIGCTIARURAL_ROUTE_EVOLUTION.md`](SIGCTIARURAL_ROUTE_EVOLUTION.md) — rutas/redirecciones.
- [`SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md`](SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md) — catálogo.
- [`SIGCTIARURAL_PRESERVATION_AUDIT.md`](SIGCTIARURAL_PRESERVATION_AUDIT.md) — PA-01..PA-12.
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) — GR-01..12.