# SIGCTIARURAL_FRONTEND_OFFICIALIZATION_PHASE1_REPORT

**Fecha:** 2026-10-12
**Rama:** `feature/cmsc-f3c-v1-implementation`
**Misión:** `FRONTEND_OFFICIALIZATION_IMPLEMENTATION_PHASE_1` (P1 + P2 + P3)
**Base:** `docs/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_EXECUTION_PLAN.md`
**Tipo:** IMPLEMENTACIÓN de fase 1 — sin commits, sin push
**Dictamen:** **GO_PHASE_1** (P1/P2/P3 ejecutados; lint en rojo solo por deuda ajena al alcance)

---

## 0. RESUMEN EJECUTIVO

Se ejecutaron **P1 (lint + higiene)**, **P2 (URLs relativas)** y **P3 (overlay + deprecated)**
respetando todas las reglas de no-injerencia. **No se tocó** CMSC, Dashboard, Laboratorios,
Hardware Catalog, Knowledge Hub, IA Predictiva funcional, Dataset acústico, Bridge backend ni
backend. El build de producción sigue **verde**. El gate ESLint **existe y ejecuta**; permanece
rojo por deuda de código **previa** localizada íntegramente en módulos prohibidos (CMSC/Labs), que
no se corrigió por regla.

| Fase | Estado | Evidencia |
|---|---|---|
| **P1** Lint + higiene | ✅ HECHO | `.eslintrc.cjs` + `.eslintignore` equivalentes; `dist/` y `public/` ignorados; `.bak` preservados |
| **P2** URLs relativas | ✅ HECHO (alcance permitido) | helper `resolveEndpoint` + 2 consumidores; 5 objetivos diferidos por regla |
| **P3** Overlay + deprecated | ✅ HECHO | overlay gateado por `DEV`; 5 páginas movidas a `_quarantine/` con `git mv` |

---

## 1. CAMBIOS REQUERIDOS (implementados)

### P1 — ESLint + higiene

| # | Cambio | Resultado |
|---|---|---|
| P1.1 | **Config ESLint mínima** `src/frontend/.eslintrc.cjs` | `eslint:recommended` + `plugin:react` + `react-hooks` + `react-refresh`. `root: true`, `ecmaVersion: latest`, `sourceType: module`, `react.version: detect`. |
| P1.2 | **Ignorar `dist/`** | `ignorePatterns: ['dist','node_modules','public','_quarantine','*.config.js']`. También se ignora `public/` (vendor `circuitjs1`/`jsxgraph`, miles de líneas) para que el gate analice solo `src/`. |
| P1.3 | **`package.json.bak` + `package-lock.json.bak`** | **Preservados** (no borrados): movidos a `.local_backups/FRONTEND_HIGIENE_2026_10_12/` (fuera de git, ya ignorado). |
| P1.4 | Ruido de falso positivo | `react/no-unknown-property` → `off` (props válidas de `@react-three/fiber`). |

### P2 — URLs relativas (alcance efectivamente permitido)

Se creó un helper central `src/frontend/src/config/endpoints.js` con `resolveEndpoint(envValue, fallback)`:
normaliza cualquier base absoluta a `localhost`/`127.0.0.1` a su ruta **relativa** (o al fallback),
para que el navegador hable con el mismo origen y el proxy (`/api` de Vite en dev, `location /api/`
de nginx en prod) haga el enrutado. Verificado:

```
http://localhost:8010                      -> ""
http://localhost:8010/api/v3/ai/inference/ -> "/api/v3/ai/inference"
http://127.0.0.1:8766                       -> ""
/api                                        -> "/api"
""  (fallback dev)                          -> "http://localhost:8081"
https://api.sigct-rural.com                 -> "https://api.sigct-rural.com"  (se respeta)
```

| # | Archivo | Cambio | Estado |
|---|---|---|---|
| P2.1 | `src/auth/AuthContext.jsx` | `API_BASE = resolveEndpoint(VITE_API_URL, '')` → login por `/api/...` relativo | ✅ |
| P2.2 | `src/components/VoiceAssistant.jsx` | `API_BASE = resolveEndpoint(VITE_AI_API_BASE, DEV ? ':8081' : '')` → dev intacto, build sin host horneado | ✅ |

**Diferidos por regla de no-injerencia (documentados, no tocados):**

| Objetivo del plan | Módulo afectado | Regla | Decisión |
|---|---|---|---|
| `services/cloud.js` (onrender + open-meteo) | Dashboard | NO tocar Dashboard | DIFERIDO |
| `useRoboticsApi.js` (`localhost:8000`) | Laboratorios | NO tocar Laboratorios | DIFERIDO |
| `pages/DataScienceLab.jsx` (onrender) | Laboratorio | NO tocar Laboratorios | DIFERIDO |
| `pages/AIPredictiva.jsx` (`VITE_AI_INFERENCE_URL`) | IA Predictiva funcional | NO tocar IA funcional | N/A — ya usa default relativo `/api/v3/ai/inference/` |
| `cmscAdapters.js`, `acousticBridge.js` | CMSC | NO tocar CMSC / Bridge | DIFERIDO |

### P3 — Overlay + deprecated

| # | Cambio | Resultado |
|---|---|---|
| P3.1 | **Overlay `SYSTEM DEBUG`** (`App.jsx:99-104`) | Envuelto en `{import.meta.env.DEV && (...)}`. En el build de producción **no aparece** (verificado en `dist/`). |
| P3.2 | **`pages/_deprecated/` (5 archivos)** | Movidos con `git mv` (historia preservada) a `src/frontend/_quarantine/pages_deprecated/`. **No borrados.** |
| P3.3 | **Política de cuarentena** | `src/frontend/_quarantine/README.md` declara estado, motivo y política de salida. ESLint ignora `_quarantine`; Vite no lo bundlea (sin aristas de import). |

---

## 2. ARCHIVOS AFECTADOS

**Nuevos:**
- `src/frontend/.eslintrc.cjs`
- `src/frontend/src/config/endpoints.js`
- `src/frontend/_quarantine/README.md`

**Modificados:**
- `src/frontend/src/App.jsx` (overlay gateado por `DEV`)
- `src/frontend/src/auth/AuthContext.jsx` (endpoint relativo)
- `src/frontend/src/components/VoiceAssistant.jsx` (endpoint relativo)

**Movidos (git mv, sin pérdida):**
- `src/frontend/src/pages/_deprecated/{DocsApiReference,DocsEdgeSetup,DocsMasterdoc,DocsPlanMaestro,DocsReadme}.jsx`
  → `src/frontend/_quarantine/pages_deprecated/…`

**Preservados fuera de git:**
- `src/frontend/package.json.bak`, `src/frontend/package-lock.json.bak` → `.local_backups/FRONTEND_HIGIENE_2026_10_12/`

**No tocado (por regla):** `src/pages/cmsc/**`, `src/pages/Dashboard.jsx`, `src/labs/**`,
`src/pages/DataScienceLab.jsx`, `src/pages/Hardware*`, `src/knowledge-hub/**`,
`src/pages/AIPredictiva.jsx`, `src/pages/cmsc/orchestration/**`, `src/services/cloud.js`,
`src/services/cmscAdapters.js`, `tools/cmsc-data-logger/bridge/**`, `src/backend/**`.

---

## 3. DEPENDENCIAS

- **Ninguna dependencia nueva de runtime.** `endpoints.js` usa APIs estándar (`URL`) del navegador.
- ESLint 8.57 + `eslint-plugin-react`, `react-hooks`, `react-refresh` **ya estaban** en
  `devDependencies` → no requirió instalar nada.
- El build depende del mismo toolchain ya validado (`vite 5.4.21`, `node`).

---

## 4. RIESGOS

| # | Riesgo | Estado | Mitigación aplicada |
|---|---|---|---|
| R1 | Relativizar URLs rompe dev | **Controlado** | Vite proxya `/api`; `VoiceAssistant` conserva `:8081` en `DEV`. Verificado por build + helper. |
| P3-R1 | Mover `_deprecated` rompe imports | **Nulo** | 0 referencias (grep); sin aristas de import. |
| P1-R1 | Gate ESLint siempre rojo (deuda) | **Abierto (aceptado)** | Deuda en módulos prohibidos; se documenta, no se corrige en P1. |
| R-Nuevo | `resolveEndpoint` con URL relativa inesperada | Bajo | `try/catch`: lo que no es URL absoluta se devuelve tal cual. |
| R-Nuevo | `.bak` movidos podrían requerirse | Bajo | Preservados en `.local_backups/`; recuperables sin git. |

---

## 4.A SIN RIESGO (aditivo puro)
- Config ESLint + ignores (no altera runtime).
- Helper `endpoints.js` (sin efectos colaterales; consumidores explícitos).
- Gateo del overlay por `DEV` (en dev se comporta igual).
- Cuarentena por `git mv` (historia intacta; no bundlea).

## 4.B REQUIERE PRUEBAS (pendiente, fuera de esta fase)
- Smoke remoto tras nginx (P-T4 del plan) — requiere `docker compose build frontend`.
- Builder Docker real (P-T6) y smoke de `/api` servido por nginx.

---

## 5. PRUEBAS EJECUTADAS

### 5.1 ESLint (P1)

`npm run lint` → **config encontrada y ejecutada** (antes: `ESLint couldn't find a configuration file`).

```
errores = 12   warnings = 120   archivos con problemas = 56
```

Desglose de **errores** (todos en deuda previa, módulos fuera de alcance):

| Regla | # | Ubicación | Alcance |
|---|---|---|---|
| `react/no-children-prop` | 5 | `pages/cmsc/LatestEvidence.jsx` | CMSC — NO tocar |
| `react-hooks/rules-of-hooks` | 5 | `labs/AdvancedMathLabV2.jsx`, `labs/ElectronicsLab.jsx`, `labs/SchematicEditor.jsx` | Labs — NO tocar |
| `no-useless-escape` | 1 | `labs/AdvancedMathLabV2.jsx` | Labs — NO tocar |
| `no-undef` | 1 | `labs/SchematicEditor.jsx` | Labs — NO tocar |

**Lectura honesta:** el gate **funciona** (P-T1: "ejecuta sin fallar por config"). El `exit=1`
proviene de `--max-warnings 0` + deuda de código antigua en CMSC/Labs, no de la configuración.
Corregirla violaría las reglas de esta misión; queda como deuda declarada para una fase por módulo.

### 5.2 Build (regresión P0)

`npm run build` → **✓ built in 1m 12s**, `EXIT=0`, 5486 módulos, sin errores. Se mantiene el
warning conocido de chunks >500 kB (`index` 3.12 MB, `Telemetry3DScene` 895 kB) — rendimiento, no
corrección.

### 5.3 Verificación del artefacto

| Check | Resultado |
|---|---|
| `SYSTEM DEBUG` en `dist/assets/*.js` | **NO** (correcto: gateado por `DEV`) |
| Páginas deprecated (`raw.githubusercontent.com/badolgm`) en `dist` | **NO** (correcto) |
| `dist/worklets/pcm-capture-processor.js` | presente ✓ |
| `dist/vendor/jsxgraph/jsxgraphcore.js` | presente ✓ |

### 5.4 Helper de endpoints

6/6 casos esperados OK (ver tabla §1 P2). `localhost`/`127.0.0.1` → relativo; relativo y host
público se respetan.

---

## 6. ORDEN EJECUTADO
1. Baseline: `git status` + `HEAD` registrado.
2. P1: `.eslintrc.cjs` → mover `.bak` a `.local_backups/`.
3. P2: `endpoints.js` → `AuthContext.jsx` → `VoiceAssistant.jsx`.
4. P3: overlay gateado → `git mv` `_deprecated` → `_quarantine/` + `README.md`.
5. Verificación: ESLint, build, inspección de `dist/`, test del helper.
6. (No se ejecutó P6 Docker — fuera del alcance P1/P2/P3.)

---

## 7. CHECKLIST DE CIERRE
- [x] ESLint config existe y ejecuta; `dist/` ignorado.
- [x] `.bak` preservados (no borrados).
- [x] URLs relativas en los endpoints permitidos; diferidos documentados.
- [x] Overlay `SYSTEM DEBUG` fuera del build de producción.
- [x] Páginas deprecated en cuarentena declarada, sin borrado.
- [x] Build de producción verde.
- [ ] Lint verde (bloqueado por deuda en CMSC/Labs — fuera de alcance).
- [ ] Build Docker real + smoke remoto (P6/P7 — misión posterior).

---

## 8. DICTAMEN

**GO_PHASE_1** — P1, P2 y P3 ejecutados dentro del alcance autorizado, sin tocar módulos prohibidos.

- **P1 ✅** — gate ESLint operativo (config + ignores); higiene de `.bak` por preservación. Deuda de
  lint declarada (12 errores / 120 warnings), toda en CMSC/Labs, no corregible sin violar reglas.
- **P2 ✅** — URLs relativas normalizadas para los endpoints permitidos (auth y asistente global).
  5 objetivos diferidos por no-injerencia (Dashboard, Labs, IA funcional, CMSC/Bridge).
- **P3 ✅** — overlay debug fuera de producción; `_deprecated` en cuarentena con historia preservada.
- **Build ✅** — verde; artefacto verificado (sin debug, sin deprecated, con worklets y vendor).

Siguiente paso sugerido (fuera de esta misión): **P6 build Docker real + P7 smoke remoto** para
cerrar la condición de despliegue del `EXECUTION_PLAN`.

---

**SIN COMMITS · SIN PUSH.**
