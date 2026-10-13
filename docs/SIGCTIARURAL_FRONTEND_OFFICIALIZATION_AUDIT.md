# SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT

**Fecha:** 2026-10-11
**Rama:** `feature/cmsc-f3c-v1-implementation` (33 commits adelante de `origin`)
**Tipo:** SOLO AUDITORÍA — sin modificar código, sin commits, sin push
**Fuente de verdad auditada:** `src/frontend/` (Vite + React 18), puerto dev 5173/5174

---

## 0. MÉTODO Y EVIDENCIA

Verificación en disco (2026-10-11), no memoria:

- `src/frontend/src/**` = **93 archivos** `.js/.jsx` · **16.984 líneas**.
- `npm run build` = **✓ built in 44.45s**, sin errores (1 warning de chunks >500 kB).
- `src/frontend/dist/` se regeneró y contiene `worklets/`, `vendor/`, `assets/`.
- `App.jsx` = 18 entradas `<Route>`; `main.jsx` monta `App`.
- Docker: **daemon no disponible** en esta máquina (`npipe:...dockerDesktopLinuxEngine` no encontrado) → no se pudo ejecutar el contenedor.
- `vite.config.js` = puerto por defecto **5173** (el 5174 se pasa por CLI con `--strictPort`, no está en el archivo).
- Conteos: Knowledge Hub registry = **51 docs / 6 categorías** (coincide con AGENTS); vendor público = `circuitjs1`, `jsxgraph`; worklet = `pcm-capture-processor.js`.

---

## 1. ANÁLISIS POR MÓDULO

| # | Módulo | Archivos clave (verificados) | Estado honesto | Listo |
|---|---|---|---|---|
| 1 | Dashboard | `pages/Dashboard.jsx` (715), `components/TelemetryPanel.jsx`, `GlobalChart.jsx`, `Telemetry3DScene.jsx` | REAL parcial — usa datos reales con **fallback placeholder** | SÍ (con matices) |
| 2 | CMSC | `pages/CmscDashboard.jsx`, `pages/cmsc/**` (25), `SpectralAnalysisInstrument.jsx`, `spectralEngine.js` | REAL-LOCAL (S30) + DISEÑO (S81/S82) | SÍ |
| 3 | Knowledge Hub | `knowledge-hub/pages/KnowledgeHubLayout.jsx`, `services/docLoader.js`, `registry/knowledgeRegistry.generated.json` | REAL (documental, 51 docs) | SÍ |
| 4 | Hardware Catalog | `pages/HardwareCatalogPage.jsx`, `HardwareDetailPage.jsx`, `data/catalog-data.js` | REFERENCIA/DISEÑO (se declara así) | SÍ (funcional) |
| 5 | IA Predictiva | `pages/AIPredictiva.jsx` (538), `VITE_AI_INFERENCE_URL` | PARCIAL — modos `INFERENCIA REAL / SIMULACION / ROBOT DEMO` | PARCIAL |
| 6 | Workbench (MMC) | `pages/cmsc/MathModelingCell.jsx`, `MmcHero.jsx`, `MmcMathematicsCore.jsx`; vendor `jsxgraph` | REAL (UI) — salida etiquetada SIM | SÍ (UI) |
| 7 | Bridge | `pages/cmsc/orchestration/acousticBridge.js` (`http://127.0.0.1:8766`) | REAL **solo local** | SÍ (local-only) |
| 4b | Dataset acústico | `orchestration/AcousticLoggerPanel.jsx` (492), `AcousticDatasetPanel.jsx`, `AcousticFlowStepper.jsx` | REAL (operativo vía bridge) | SÍ (con bridge) |
| 9 | Telemetría | `components/TelemetryPanel.jsx`, `services/cloud.js` | PARCIAL — real si backend responde; si no, fallback fabricado | PARCIAL |
| 10 | Navegación global | `App.jsx` (18 rutas), `components/TopNav.jsx`, `VoiceAssistant.jsx` | REAL | SÍ |
| 11 | Dependencias | `package.json` (react 18, three/@react-three, jsxgraph, katex, mermaid, recharts, zustand) | OK; 3D pesado | SÍ |
| 12 | Docker actual | `Dockerfile`, `docker-compose.yml` (`frontend: 5173:80`), `.dockerignore` | Config válida, **no re-ejecutada** | POR VALIDAR |

---

## A. QUÉ MÓDULOS ESTÁN LISTOS

Listos y verificados en disco/build:

1. **Navegación global** — `App.jsx` con 18 rutas, 404 honrado, `AuthProvider` + `Router`. Rutas legacy intactas (envolver, no sustituir).
2. **CMSC** — `CmscDashboard.jsx` (233) con `SignalRiver`, `SignalCatalogView`, `SpectralAnalysisInstrument`, `MmcHero`, `OrchestrationZoneV2`, trío `ModelPredictCell`/`LabDoors`/`BenchmarkCell`. Integra Tramo B (Bridge client) y Tramo C (worklet).
3. **Knowledge Hub** — registry de 51 docs / 6 categorías cargado por `import.meta.glob` en build; visor operacional.
4. **Hardware Catalog / Detail** — funcional, se autodeclara "referencia y diseño".
5. **Workbench (MMC)** — `MathModelingCell`, `MmcJsxGraphBoard`, `MmcMathematicsCore`, `equationParser.js` (463); jsxgraph vendorizado con licencias.
6. **Bridge client + Dataset acústico UI** — `acousticBridge.js` (health/stats/ingest), `AcousticLoggerPanel`, `AcousticDatasetPanel`, `AcousticFlowStepper`, `AcousticFirstResultCard`.
7. **Tramo C** — `public/worklets/pcm-capture-processor.js` presente y **copiado a `dist/worklets/`** en el build verificado.

## B. QUÉ SIGUE SIENDO PLACEHOLDER

1. **Dashboard clúster/series** — `services/cloud.js` retorna un clúster **fabricado** (`BBB-02` CPU 62 %, "Enfermedad Detectada", etc.) si `fetchClusterNodesReal` falla; `Dashboard.jsx:93,101,109` marcan banners `'Placeholder de integración'`. Es honesto visualmente, pero el dato no es real.
2. **Auth inerte** — `AuthGuard.jsx` está definido pero **0 usos reales**; las rutas de `App.jsx` **no están protegidas**. `pages/Login.jsx`, `Register.jsx`, `Admin2FA.jsx` existen con **0 referencias**. `LoginModal` solo se invoca desde `Dashboard.jsx`.
3. **Debug overlay global** — `App.jsx:99-104` pinta `SYSTEM DEBUG · {location.pathname}` fijo arriba (`opacity-50`). Elemento de desarrollo; no debe ir a un frontend "oficial".
4. **`pages/_deprecated/`** — 5 archivos (`DocsApiReference`, `DocsEdgeSetup`, `DocsMasterdoc`, `DocsPlanMaestro`, `DocsReadme`) con **0 referencias**.
5. **IA Predictiva** — 538 líneas con modos mezclados (`real`, `simulation`, `robot_demo`); depende de `VITE_AI_INFERENCE_URL`.

## C. QUÉ SIGUE SIENDO DISEÑO

1. **S81 Acoustic Intelligence / S82 Anomaly Detector** — DISEÑO dentro del CMSC; no hay backend de clasificación acústica.
2. **ACP** — `AcpCell.jsx` presente como vista inerte / DISEÑO.
3. **Modelo productivo agrícola** — `AIPredictiva` consume 8081, pero el activo en disco está descalificado; el módulo es demostrativo.
4. **`BenchmarkCell`** — muestra evidencia M1/M2 (decisión PENDIENTE), no infiere nada.
5. **Telemetría V3 / RobotTelemetry** — sin consumidor pleno en este frontend (RobotTelemetry con cliente histórico roto).

## D. QUÉ ROMPE EL REEMPLAZO (frontend viejo → oficial)

Riesgos reales que deben resolverse antes de declarar el reemplazo:

1. **Bridge es localhost-only** — `acousticBridge.js` fija `http://127.0.0.1:8766`. El puerto 8766 es un **puente local de escritorio**, NO viaja en el contenedor. Un frontend servido en Docker/remoto mostrará Logger/Dataset offline. Debe ser **degradación honesta declarada**, no un fallo.
2. **URLs absolutas fuera del proxy nginx** — `AuthContext.jsx` y `AIPredictiva.jsx` usan `VITE_API_URL`/`VITE_AI_INFERENCE_URL` absolutos (`http://localhost:8010`, `http://localhost:8081`). El `Dockerfile` sí define `location /api → backend:8000`, pero el frontend NO usa `/api` relativo → **no funciona fuera de la máquina del desarrollador**.
3. **API externa hardcodeada** — `cloud.js` consulta `sigct-backend.onrender.com` y `api.open-meteo.com` directamente desde el navegador (CORS/red pueden fallar; no hay proxy).
4. **Puerto dev colisiona con el contenedor** — `vite.config.js` usa 5173, igual que el mapeo Docker `5173:80`. La convención real (AGENTS) es 5174 `--strictPort` por CLI. Confusión 5173 legacy vs 5174 evolución.
5. **Contexto de build amplio** — el `Dockerfile` copia la raíz y depende de `README.md`, `SIGCT_RURAL_SYSTEM_BOOT.md` y `docs/**` (`.dockerignore` ya los repermite). Si esos cambian de ruta, el Knowledge Hub rompe el build.
6. **Sin auth real** — declarar "oficial" un frontend con rutas sin proteger es una decisión de gobernanza pendiente.
7. **Chunk principal 3.1 MB** (gzip 875 kB) y `Telemetry3DScene` 894 kB — rendimiento, no corrección.

## E. QUÉ PRUEBAS FALTAN

1. **Build Docker real** — `docker compose build frontend` + `up` (hoy el daemon no corría; solo se validó `vite build` local).
2. **Smoke remoto** — abrir el frontend servido por nginx desde OTRA máquina y verificar `/api` real (revelará el problema D-2).
3. **E2E flujo CMSC** — S30 → Logger → Bridge (`/ingest` real) → Dataset (`/stats`) → panel; en dev y en build.
4. **Bridge offline/online** — UI sin `8766` escuchando (degradación honesta) y con él.
5. **Permisos de micrófono** — worklet `pcm-capture-processor.js` en 5174 con HTTPS/localhost y fallback ScriptProcessor.
6. **Rutas legacy 1×1** — los 18 `<Route>` renderizando sin excepción (`ErrorBoundary` no debe atrapar ninguna).
7. **Knowledge Hub** — los 51 docs resuelven; ausencia de docs no rompe el build.
8. **Auth** — decidir y probar el flujo (login real o retirada declarada).
9. **Lint** — `npm run lint` (no ejecutado en esta auditoría).

## F. QUÉ DEBE ENTRAR AL DOCKER NUEVO

- El `dist/` producido por `vite build` (ya validado, incluye `worklets/` y `vendor/`).
- `public/` estático → `dist/` (`worklets/pcm-capture-processor.js`, `vendor/circuitjs1`, `vendor/jsxgraph`).
- `nginx.conf` con `try_files ... /index.html` (SPA) **y caveat**: hoy el `/api` existe pero el frontend no lo usa (ver D-2).
- Variables de build correctas: `VITE_API_URL`, `VITE_AI_API_BASE`, `VITE_AI_INFERENCE_URL` (hoy apuntan a localhost).
- **NO entra:** `tools/cmsc-data-logger/**`, `bridge/server.js`, `node_modules`, `dist` en el contexto (ya excluidos por `.dockerignore`).

## G. QUÉ DEBE MORIR DEL FRONTEND VIEJO

- `pages/_deprecated/**` (5 archivos, 0 referencias).
- `pages/Login.jsx`, `Register.jsx`, `Admin2FA.jsx` y `components/AuthGuard.jsx` → decidir: cablear o retirar (hoy inertes).
- Overlay `SYSTEM DEBUG` de `App.jsx` (elemento de desarrollo).
- Duplicidad de ruta `/labs/robotics` (nueva) frente a `/lab-*` legacy: consolidar en el mapa de navegación.
- Clúster fabricado de `cloud.js` cuando no hay backend → reemplazar por estado `ROTO`/`sin datos` honesto.

---

## H. DICTAMEN

**GO_FRONTEND_OFICIAL_CONDICIONADO** — y **NO_GO** para el *reemplazo del contenedor* hasta cerrar D y E.

Justificación honesta:

- **GO** para declarar `feature/cmsc-f3c-v1-implementation` → `src/frontend/` (Vite) como **fuente de verdad oficial de desarrollo**. La app compila sin errores (44.45s), los 18 módulos/route existen y los módulos CMSC/KH/Workbench/Bridge/Dataset están funcionales.
- **NO_GO** para declararlo **frontend oficial desplegado** (reemplazo del Docker 5173 histórico) porque:
  1. El build Docker no se ha ejecutado (daemon caído).
  2. Las URLs absolutas a `localhost` rompen el acceso remoto (D-2).
  3. El Bridge/Dataset es local-only y debe declararse como tal.
  4. Auth y `_deprecated` están sin resolver (gobernanza).

**Condiciones de cierre (bloqueantes):** D-1..D-7 y pruebas E-1..E-9. Al cerrarlas, el dictamen pasa a **GO_FRONTEND_OFICIAL**.

---

**SOLO AUDITORÍA. Sin modificar código · sin commits · sin push.**
