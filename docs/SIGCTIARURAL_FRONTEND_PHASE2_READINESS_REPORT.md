# SIGCTIARURAL_FRONTEND_PHASE2_READINESS_REPORT

**Fecha:** 2026-10-12
**Rama:** `feature/cmsc-f3c-v1-implementation`
**Misión:** `FRONTEND_PHASE2_READINESS` — **SOLO VALIDACIÓN** (no modifica código, no commits, no push)
**Base:** `docs/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_EXECUTION_PLAN.md` + `…_PHASE1_REPORT.md`
**Alcance:** clasificación honesta de 14 módulos antes de ejecutar Phase 2
**Dictamen:** **READY_FOR_PHASE2 (condicionado)** — ver §9

---

## 0. MÉTODO Y EVIDENCIA

Verificación en disco (no memoria), sobre `src/frontend/` (Vite + React 18, build verde en Phase 1):

| Hecho verificado | Valor | Fuente |
|---|---|---|
| Rutas `<Route>` en `App.jsx` | **18** | `App.jsx` |
| `AuthGuard` importado en `App.jsx` | **NO** (0 usos) | grep |
| Consumidores de `useAuth` | `AuthGuard.jsx`, `LoginModal.jsx` | grep |
| Knowledge Hub registry | **51 docs / 6 categorías** (research-v2=18, eiarc-architecture=13, project-core=7, knowledge-base=6, historical=4, eiarc-foundation=3) | `knowledgeRegistry.generated.json` |
| `cloud.js` | clúster **fabricado** + fallback; `open-meteo` real externo | `services/cloud.js` |
| `useRoboticsApi.js` | `http://localhost:8000/api` (host roto) | `hooks/useRoboticsApi.js` |
| `acousticBridge.js` | `http://127.0.0.1:8766` (local-only) | `orchestration/acousticBridge.js` |
| `cmscAdapters.js` | 5 puertos de lectura; estados honestos, no fabrica | `services/cmscAdapters.js` |
| `AIPredictiva` | modos `real` / `simulation` / `robot_demo` con `DEMO_SCENARIOS` | `pages/AIPredictiva.jsx` |
| `DataScienceLab` | Pyodide + Plotly (CDN); SSE `API_BASE/events` | `pages/DataScienceLab.jsx` |
| Hardware Catalog | se autodeclara "referencia y diseño" | `HardwareCatalogPage.jsx:25,111` |
| CMSC `/dashboard-cmsc` | S30 real-local + SignalRiver + OrchestrationZone + `BenchmarkCell` + `AcpCell` DISEÑO | `CmscDashboard.jsx` |
| Estado de 80 señales | catálogo declarativo S01..S80 | `cmsc/signalCatalog.js` |

---

## 1. MÓDULOS TOTALMENTE REALES

| Módulo | Por qué es REAL | Caveat |
|---|---|---|
| **Knowledge Hub** | 51 docs reales servidos por `import.meta.glob` en build; visor operacional; conteo derivado del registry | Ninguno |
| **Bridge (acústico)** | Cliente real de `127.0.0.1:8766`; health/stats/ingest contra el motor `ingestWav` | **Local-only** (no viaja en contenedor) |
| **Dataset acústico** | Operativo vía bridge; conteos reales de `/stats`; no decide veredictos | Depende del bridge local |
| **Hardware Catalog** | Datos de referencia reales; se autodeclara "referencia y diseño, no telemetría" | No es telemetría en vivo (correcto) |
| **cmscAdapters** | Contrato de lectura real; devuelve `REAL/ROTO/SIM/DISENO` honesto, nunca fabrica | Depende de backend (`/api/v3/...`) |

---

## 2. MÓDULOS PARCIALMENTE REALES

| Módulo | Parte REAL | Parte no-real |
|---|---|---|
| **Dashboard** | Envelope V3 (`/api`), badge `LIVE/SIM`, clima Open-Meteo | Clúster BBB `SIM` (métricas fabricadas en `cloud.js`), fallback "Placeholder de integración" |
| **CMSC** | S30 mic FFT (`REAL-LOCAL`), SignalRiver, adaptadores de lectura, harness honesto | S81/S82 `DISEÑO`, ACP inerte (`AcpCell` =DISENO), Benchmark = evidencia M1/M2 (decisión PENDIENTE) |
| **IA Predictiva** | Modo `real` consume `/api/v3/ai/inference/` (o 8081) | Modos `simulation`/`robot_demo` = `DEMO_SCENARIOS` (demo declarada); activo agrícola descalificado |
| **Workbench (MMC)** | UI real (`MathModelingCell`, `MmcJsxGraphBoard`, parser), jsxgraph vendorizado | Salida científica etiquetada `SIM`; no resuelve con evidencia física |
| **Telemetría** | Real si el backend responde (V3 envelope) | Fallback `S13` sintético si no hay filas; `cloud.js` fabrica el clúster |
| **Laboratorios** | Herramientas reales (Falstad real-local, Pyodide real, WebSDR real-local, S30 mic) | Insumos/salidas `SIM` por diseño; piezas ROTO (RobotTelemetry cliente, DataScience SSE) |
| **DataScienceLab** | Pyodide + Plotly reales (CDN); UI de consola | `API_BASE/events` (SSE) deprecado/ROTO; `onrender` por defecto; S40 `ROTO` |

---

## 3. MÓDULOS / COMPONENTES EN SIMULACIÓN

No hay ningún **módulo completo** de solo-simulación; la simulación está **declarada** en componentes:

| Componente | Simulación | Estado |
|---|---|---|
| **Clúster BBB** (dentro de Dashboard/TopNav) | Métricas fabricadas (`cpu`, `temp`, `Enfermedad Detectada`) | `SIM` (saneo R2, etiquetado) |
| **Salidas de Laboratorios** (Falstad/Pyodide/DFT/robótica) | Cómputo/simulación, no medición | `SIM` declarado (S32–S37, S51, S53–S54) |
| **`DEMO_SCENARIOS`** (IA Predictiva) | Escenarios de demostración | Demo declarada |

---

## 4. MÓDULOS PLACEHOLDER

| Módulo | Naturaleza | Estado |
|---|---|---|
| **Auth** | `AuthGuard` sin usar; rutas sin proteger; `Login`/`Register`/`Admin2FA` con 0 refs; solo `LoginModal` (desde Dashboard) | `HUÉRFANO`/inerte |
| **cloud.js** | Clúster **fabricado** + `fetchBackendHealth` a Render; `open-meteo` real | `PARCIAL/PLACEHOLDER` (fabrica datos) |
| **useRoboticsApi** | Cliente a `localhost:8000` (backend real en 8010) | `ROTO` (0 telemetría) |

---

## 5. QUÉ MÓDULOS NO DEBEN TOCARSE

Regla de la misión (no-injerencia) — **fuera de Phase 2** salvo orden explícita:

**CMSC · Dashboard · Laboratorios · Hardware Catalog · Knowledge Hub · IA Predictiva (parte funcional) · Dataset acústico · Bridge backend · backend (`src/backend`)**

Además, por canon del proyecto: `SensorReading`/`RobotTelemetry`, Telemetry Context, BBB, Labs, Knowledge Hub, IA existente.

> Nota: dentro de estos hay piezas `ROTO`/`DISEÑO` que **no se corrigen** en Phase 2 sin misión dedicada.

---

## 6. QUÉ MÓDULOS PUEDEN ENTRAR A PHASE 2

**Sí entran (seguros, placeholder/parcial, sin tocar modules prohibidos):**

| # | Módulo | Acción candidata Phase 2 | Por qué es seguro |
|---|---|---|---|
| 1 | **Auth** | Decidir: cablear `AuthGuard` **o** cuarentena declarada (P4 del plan) | No hay auth real; decisión de gobernanza, reversible |
| 2 | **useRoboticsApi** | Corregir host (`localhost:8000` → `/api` relativo) o retirar declarado | Servicio aislado; ya declarado `ROTO` |
| 3 | **cloud.js** | Reemplazar clúster fabricado por estado `ROTO/SIN_DATOS` honesto | Servicio de datos sin lógica de negocio |
| 4 | **DataScienceLab** | Desacoplar `onrender` por defecto; SSE deprecado a estado honesto | Módulo aislado; ya `ROTO` |
| 5 | **Dashboard (solo fallback)** | Cambiar "Placeholder de integración" por estado honesto | Solo etiqueta de dato; no toca la estructura |
| 6 | **Bundle** | `manualChunks` para `three`/`mermaid`/`cytoscape` (P5) | Rendimiento, no corrección |
| 7 | **Build Docker + smoke** | P6/P7 (validación de despliegue) | Cierra la condición de oficialización |

**No entran (requieren misión dedicada):** CMSC, Laboratorios, Knowledge Hub, Hardware Catalog, Bridge, Dataset, IA Predictiva funcional.

---

## 7. RIESGO POR MÓDULO

| Módulo | Riesgo Phase 2 | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| Auth | Cablear mal bloquea rutas; retirar deja deuda de gobernanza | Media | Alto (UX/acceso) | Decisión de producto de Bernardo; `AuthGuard` aditivo |
| useRoboticsApi | Cambio de host sin backend vivo → 0 datos | Media | Bajo | Relativo a `/api` (proxy) o `ROTO` honesto |
| cloud.js | Fabricar datos se lee como telemetría real | Alta | Medio (honestidad) | Estado honesto; nunca clúster inventado |
| DataScienceLab | CDN externo rompe offline; SSE inexistente | Media | Bajo-medio | Estado honesto + marcado REF |
| Dashboard fallback | Etiqueta de placeholder confunde | Baja | Bajo | Solo texto de estado |
| Bundle/rendimiento | Chunks >500 kB (index 3.12 MB) | Alta | Bajo (rendimiento) | `manualChunks` |
| **Prohibidos (CMSC/Dashboard/Labs/KH/Dataset/Bridge)** | Romper real-local o diseño | — | **Alto** | **NO tocar en Phase 2** |

Riesgo global de Phase 2: **MEDIO-BAJO**, porque se limita a placeholders y decisiones de gobernanza.

---

## 7.A SIN RIESGO (aditivo puro)
- Documentar variables/endpoints; estados honestos de texto; cuarentena declarada; ignores/config.

## 7.B REQUIERE PRUEBAS OBLIGATORIAS
- Auth (flujo), useRoboticsApi (host), cloud.js (degradación), DataScienceLab, Docker build + smoke remoto, bundle.

---

## 8. PRIORIDAD POR MÓDULO

| Prioridad | Módulo | Justificación |
|---|---|---|
| **P0 — bloqueante de despliegue** | Build Docker real + smoke remoto (`/api`) | Última condición del `EXECUTION_PLAN` para `GO_FRONTEND_OFICIAL` |
| **P1 — gobernanza de estado** | **Auth** | Estado ambiguo (rutas abiertas) |
| **P1 — honestidad de datos** | **cloud.js** (clúster fabricado) | Fabricar datos viola la invariante de honestidad |
| **P1 — corrección funcional** | **useRoboticsApi** (host) | Cliente roto declarado |
| **P2 — calidad** | **DataScienceLab** (SSE/CDN/onrender) | Módulo aislado con deuda |
| **P2 — UX honesta** | **Dashboard fallback** | Etiquetas de placeholder |
| **P3 — rendimiento** | **Bundle** (`manualChunks`) | Warning >500 kB |
| **P4 — reservado** | CMSC, Laboratorios, Hardware Catalog, Knowledge Hub, IA funcional, Dataset, Bridge | Requieren misión dedicada |

---

## 7.C RIESGO POR MÓDULO (resumen semáforo)

```
Auth .......................... 🔴 gobernanza (decidir)
cloud.js ...................... 🔴 fabrica datos (honestidad)
useRoboticsApi ................ 🟠 host roto
DataScienceLab ................ 🟡 SSE/CDN
Dashboard (fallback) .......... 🟡 etiqueta placeholder
Bundle ........................ 🟢 rendimiento
CMSC / Labs / KH / HW / Dataset / Bridge .. ⛔ NO TOCAR (por misión)
```

---

## 9. DICTAMEN

**READY_FOR_PHASE2 (condicionado).**

- La Fase 1 dejó el frontend con **build verde**, gate de lint operativo y módulos deprecados en
  cuarentena. La evidencia en disco permite clasificar los 14 módulos sin ambigüedad.
- **Riesgo global bajo-medio**: Phase 2 puede avanzar sobre un subconjunto acotado (Auth,
  useRoboticsApi, cloud.js, DataScienceLab, fallback de Dashboard, bundle) **sin tocar** CMSC,
  Dashboard (estructura), Laboratorios, Hardware Catalog, Knowledge Hub, IA funcional, Dataset ni
  Bridge.
- **Condiciones para `READY_FOR_PHASE2` pleno:**
  1. Decisión de Bernardo sobre **Auth** (cablear vs cuarentena).
  2. Autorización explícita para tocar `cloud.js` y `useRoboticsApi` (fuera de las reglas P1 de la
     fase anterior).
  3. Orden de ejecución P6 **build Docker real + P7 smoke remoto** como cierre de despliegue.
- El resto de módulos permanece **congelado por regla**; su deuda (`S40 ROTO`, `S50 ROTO`,
  `S81/S82 DISEÑO`, clúster `SIM`) queda **declarada**, no oculta.

---

## ANEXO — Matriz de clasificación (14 módulos)

| Módulo | REAL | PARCIAL | SIM | PLACEHOLDER/ROTO | Fase 2 |
|---|---|---|---|---|---|
| Dashboard | · | ● | ○ (clúster) | ○ (fallback) | Solo fallback |
| CMSC | · | ● | ○ (S35-S37) | ○ (S81/S82/ACP) | NO |
| Knowledge Hub | ● | · | · | · | NO |
| Laboratorios | · | ● | ○ | ○ (S40/S50) | NO |
| Hardware Catalog | ● | · | · | · | NO |
| IA Predictiva | · | ● | ○ (demo) | · | NO (funcional) |
| Workbench (MMC) | · | ● | ○ (salida) | · | NO |
| Bridge | ● (local-only) | · | · | · | NO |
| Dataset acústico | ● | · | · | · | NO |
| Telemetría | · | ● | ○ (S13) | · | Parcial (fallback) |
| Auth | · | · | · | ● (inerte) | **SÍ** |
| cloud.js | · | ○ | · | ● (fabrica) | **SÍ** |
| DataScienceLab | · | ● | · | ○ (S40 ROTO) | **SÍ** |
| useRoboticsApi | · | · | · | ● (ROTO) | **SÍ** |

`●` principal · `○` secundario · `·` no aplica

---

**SOLO VALIDACIÓN. Sin modificar código · sin commits · sin push.**
