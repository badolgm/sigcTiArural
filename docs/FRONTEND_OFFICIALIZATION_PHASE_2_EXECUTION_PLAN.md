# FRONTEND_OFFICIALIZATION_PHASE_2_EXECUTION_PLAN

**Fecha:** 2026-10-13
**Rama:** `feature/cmsc-f3c-v1-implementation`
**Misión:** `FRONTEND_OFFICIALIZATION_PHASE_2`
**Base:** `docs/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_EXECUTION_PLAN.md` + `…_PHASE1_REPORT.md` + `…_PHASE2_READINESS_REPORT.md`
**Tipo:** SOLO PLAN — sin modificar código, sin commits, sin push
**Dictamen previo:** `GO_PHASE_1 ✅` · `READY_FOR_PHASE2 ✅` · `DATABASE_RECONCILED ✅`

---

## 0. CONTEXTO Y DECISIONES DE GOBIERNO

### 0.1 Arquitectura congelada
Phase 1 entregó build verde, gate ESLint operativo, URLs relativas en `AuthContext` y `VoiceAssistant`, overlay `SYSTEM DEBUG` gateado por `DEV`, y `_deprecated/` en cuarentena. La arquitectura **no se modifica** en Phase 2.

### 0.2 Decisión de Auth (QUARANTINE)
`AuthGuard`, `Login`, `Register`, `Admin2FA` **permanecen en cuarentena**. **NO se implementa autenticación**, **NO se convierte Auth en requisito del frontend oficial**. Esta decisión elimina el bloqueo P4 del plan original.

### 0.3 Regla de no-injerencia (NO TOCAR)
Los siguientes módulos quedan **fuera de alcance** por regla expresa:

> CMSC · Dashboard (estructura) · Laboratorios · Knowledge Hub · Hardware Catalog · Bridge · Dataset acústico · Workbench · IA funcional

Solo se permite tocar **fallbacks de texto/estado** dentro de Dashboard, y los servicios/hooks/páginas explícitamente listados en el objetivo (cloud.js, useRoboticsApi, DataScienceLab).

---

## A. CAMBIOS EXACTOS A REALIZAR

### A.1 `services/cloud.js` — honestidad de datos (P1)

**Problema:** `fetchClusterNodesReal()` **fabrica** métricas del clúster BBB (`cpu: '25%'`, `temp: '41°C'`, `'Enfermedad Detectada'`) incluso cuando el backend está caído. Esto viola la invariante de honestidad del proyecto.

**Cambios exactos:**

| # | Línea actual | Cambio |
|---|---|---|
| A.1.1 | `fetchClusterNodesReal()` retorna array con `data: { cpu, temp, network, diagnosis }` fabricados | Reemplazar por un array de nodos con estado **honesto**: si `health.ok` → reutilizar `name`/`role` pero **sin** métricas fabricadas (usar `'N/D'`); si no → `status: 'offline'` y `data` vacío. No inventar CPU/temperatura. |
| A.1.2 | `sourceLabel` = `'Cloud Backend (OK)'` / `'Cloud Backend (Down)'` | Mantener etiqueta pero cambiar `name` a `'Gateway / Cloud (estado honesto)'`. |
| A.1.3 | `fetchBackendHealth()` URLs onrender | **Mantener** (son endpoints reales remotos, no localhost). No tocar. |
| A.1.4 | `fetchTelemetrySeriesReal()` Open-Meteo | **Mantener** (dato real externo). No tocar. |

**Regla clave:** nunca retornar datos inventados. Si no hay fuente real, el nodo declara `status: 'offline'` y métricas `'N/D'`.

---

### A.2 `hooks/useRoboticsApi.js` — host relativo (P1)

**Problema:** `API_BASE_URL = 'http://localhost:8000/api'` está hardcodeado. El backend real corre en `8010` y esta URL no viaja en contenedor (host roto).

**Cambios exactos:**

| # | Línea actual | Cambio |
|---|---|---|
| A.2.1 | `const API_BASE_URL = 'http://localhost:8000/api';` | Reemplazar por `const API_BASE_URL = resolveEndpoint(import.meta.env.VITE_API_URL, '/api');` usando el helper de Phase 1 (`src/frontend/src/config/endpoints.js`). |
| A.2.2 | import | Añadir `import { resolveEndpoint } from '../config/endpoints.js';` |
| A.2.3 | `fetch(`${API_BASE_URL}/robot-telemetry/?...`)` | Mantener path; ahora será `/api/robot-telemetry/...` (relativo, resuelto por proxy Vite/nginx). |
| A.2.4 | Polling 1000ms | Mantener. No tocar. |

**Resultado:** el hook usa la misma base relativa que el resto del frontend; el proxy de Vite (`/api → localhost:8010`) y nginx (`/api/ → backend:8000`) hacen el enrutado.

---

### A.3 `pages/DataScienceLab.jsx` — desacoplar onrender + SSE honesto (P2)

**Problema:** `API_BASE` cae por defecto a `https://sigct-backend.onrender.com` (host remoto horneado), y el SSE `${API_BASE}/events` está deprecado/ROTO (señal S40 en `signalCatalog.js`).

**Cambios exactos:**

| # | Línea actual | Cambio |
|---|---|---|
| A.3.1 | `const API_BASE = import.meta.env.VITE_AI_API_BASE \|\| 'https://sigct-backend.onrender.com';` | Reemplazar por `const API_BASE = resolveEndpoint(import.meta.env.VITE_AI_API_BASE, '/api');` |
| A.3.2 | import | Añadir `import { resolveEndpoint } from '../config/endpoints.js';` |
| A.3.3 | `connectEvents()` SSE a `${API_BASE}/events` | Mantener el intento, pero el `catch` ya cierra el `EventSource`; añadir estado visual honesto cuando falle (el botón ya muestra `'Conectado'`/`'Conectar métricas (SSE)'`; el `es.onerror` ya setea `eventsConnected=false`). **No inventar datos** en el gráfico. |
| A.3.4 | Pyodide/Plotly CDN (`PYODIDE_SRC`, `PLOTLY_SRC`) | **Mantener** (dependencias reales desde CDN). No tocar. |
| A.3.5 | `API_BASE` en `<a href={.../metrics}>` | Ahora será `/api/metrics` (relativo). Correcto. |

---

### A.4 Dashboard — solo fallbacks de texto (P2)

**Problema:** `futureNodes` usa `banner: 'Placeholder de integración'`, etiqueta ambigua. La estructura del Dashboard **NO se toca**; solo se corrigen etiquetas de estado.

**Cambios exactos:**

| # | Ubicación | Cambio |
|---|---|---|
| A.4.1 | `Dashboard.jsx:93` — `futureNodes[].banner = 'Placeholder de integración'` | Cambiar a `'Roadmap · no integrado'` (estado honesto de diseño). |
| A.4.2 | `Dashboard.jsx:574-576` — mensaje de error de telemetría | Mantener ("La grafica se oculto porque la telemetria oficial no esta disponible.") — ya es honesto. No tocar. |

**Regla:** ninguna modificación a la estructura visual, rutas, datos del clúster operativo ni componentes importados. Solo texto de estado en `futureNodes`.

---

### A.5 Bundle optimization — `manualChunks` (P3)

**Problema:** build de Phase 1 reportó chunks >500 kB (`index` 3.12 MB, `Telemetry3DScene` 895 kB). Es un warning de rendimiento, no de corrección.

**Cambios exactos** en `vite.config.js`:

| # | Cambio |
|---|---|
| A.5.1 | Añadir bloque `build: { rollupOptions: { output: { manualChunks: {...} } } }` dentro del `return` de `defineConfig`. |
| A.5.2 | `manualChunks` separa: `three-vendor` (`three`, `@react-three/fiber`, `@react-three/drei`), `mermaid`, `reactflow`, `recharts`, `jsxgraph`, `framer-motion`, `react-vendor` (`react`, `react-dom`, `react-router-dom`). |

**No toca:** `server` config, `proxy`, `fs.allow`.

---

### A.6 Docker frontend readiness (P0 — despliegue)

**Problema:** el `Dockerfile` y `docker-compose.yml` ya existen, pero los `build args` de compose inyectan URLs `localhost` que el helper `resolveEndpoint` normaliza. Se debe **verificar** que el build Docker produce un artefacto funcional, no modificar arquitectura.

**Cambios exactos:**

| # | Archivo | Cambio |
|---|---|---|
| A.6.1 | `docker-compose.yml:92-94` | **Verificar** que `VITE_API_URL`, `VITE_AI_API_BASE`, `VITE_AI_INFERENCE_URL` con defaults `localhost` se normalicen correctamente por `resolveEndpoint`. No requiere cambio de código si la normalización funciona. |
| A.6.2 | `Dockerfile` | **Verificar** que el stage de build compile con las ARGs. No modificar estructura (nginx config ya es correcta: `/api/ → backend:8000`, SPA fallback). |
| A.6.3 | `.dockerignore` | **Verificar** que excluye `node_modules` y `dist` (ya lo hace). No tocar. |

**Si la verificación falla:** ajustar solo los defaults de `docker-compose.yml` a rutas relativas (ej. `VITE_API_URL:-/api`), no tocar el `Dockerfile`.

---

### A.7 Smoke tests (P0 — validación de despliegue)

**Problema:** no existe infraestructura de smoke tests. Phase 1 dejó pendiente `P6 build Docker real + P7 smoke remoto`.

**Cambios exactos:**

| # | Cambio |
|---|---|
| A.7.1 | Crear script `src/frontend/scripts/smoke-frontend.sh` (o `.ps1` para Windows) que: (1) levante el contenedor frontend, (2) haga `curl http://localhost:5173/` y verifique `200`, (3) verifique que `/api/health` responde (o 404 honesto si backend no está), (4) verifique que el HTML contiene `<div id="root">`. |
| A.7.2 | El script debe ser **no-destructivo**: `docker compose up -d frontend` + esperas + `curl` + `docker compose down`. |
| A.7.3 | No instalar dependencias nuevas (usar `curl` nativo). |

**El smoke test es de infraestructura, no de código de aplicación.** No toca `src/`.

---

## B. ARCHIVOS AFECTADOS

### Modificados

| Archivo | Tipo de cambio | Justificación |
|---|---|---|
| [cloud.js](file:///C:/Users/BagmDev/DevBadolgm/Proyectos/GitHub/sigcTiArural/src/frontend/src/services/cloud.js) | Lógica de `fetchClusterNodesReal` | Eliminar fabricación de métricas (honestidad) |
| [useRoboticsApi.js](file:///C:/Users/BagmDev/DevBadolgm/Proyectos/GitHub/sigcTiArural/src/frontend/src/hooks/useRoboticsApi.js) | `API_BASE_URL` → `resolveEndpoint` | Host relativo |
| [DataScienceLab.jsx](file:///C:/Users/BagmDev/DevBadolgm/Proyectos/GitHub/sigcTiArural/src/frontend/src/pages/DataScienceLab.jsx) | `API_BASE` → `resolveEndpoint` | Desacoplar onrender |
| [Dashboard.jsx](file:///C:/Users/BagmDev/DevBadolgm/Proyectos/GitHub/sigcTiArural/src/frontend/src/pages/Dashboard.jsx) | `futureNodes[].banner` (texto) | Estado honesto |
| [vite.config.js](file:///C:/Users/BagmDev/DevBadolgm/Proyectos/GitHub/sigcTiArural/src/frontend/vite.config.js) | `build.rollupOptions.output.manualChunks` | Rendimiento de bundle |

### Creados

| Archivo | Tipo |
|---|---|
| `src/frontend/scripts/smoke-frontend.sh` | Script de smoke test (infraestructura) |

### Verificados (sin cambio esperado)

| Archivo | Acción |
|---|---|
| [Dockerfile](file:///C:/Users/BagmDev/DevBadolgm/Proyectos/GitHub/sigcTiArural/src/frontend/Dockerfile) | Verificar build |
| [docker-compose.yml](file:///C:/Users/BagmDev/DevBadolgm/Proyectos/GitHub/sigcTiArural/docker-compose.yml) | Verificar build args |
| [.dockerignore](file:///C:/Users/BagmDev/DevBadolgm/Proyectos/GitHub/sigcTiArural/.dockerignore) | Verificar exclusiones |
| [endpoints.js](file:///C:/Users/BagmDev/DevBadolgm/Proyectos/GitHub/sigcTiArural/src/frontend/src/config/endpoints.js) | Reutilizar helper (sin cambio) |

### NO TOCADOS (por regla)

`src/pages/cmsc/**`, `src/labs/**`, `src/knowledge-hub/**`, `src/pages/Hardware*`, `src/pages/AIPredictiva.jsx`, `src/services/cmscAdapters.js`, `src/pages/Workbench*`, `src/auth/**` (quarantine), `tools/cmsc-data-logger/bridge/**`, `src/backend/**`.

---

## C. RIESGOS

### C.1 Riesgos por módulo

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | `cloud.js` sin métricas rompe `cmscAdapters.readClusterLabeled()` que espera `data.cpu` | Media | Medio (CMSC) | `cmscAdapters` ya usa `n.data?.cpu` con fallback `'—'` en Dashboard; mantener compatibilidad devolviendo `data: {}` vacío (lectura segura con `?.`) |
| R2 | `useRoboticsApi` con `/api` relativo devuelve 0 datos si backend no expone `/robot-telemetry` | Alta | Bajo (ya está ROTO) | El hook ya maneja `error` + `loading`; RoboticsLab muestra "Esperando flujo" honesto |
| R3 | `DataScienceLab` SSE a `/api/events` no existe en backend | Alta | Bajo (S40 ROTO) | El `onerror` ya cierra el EventSource y pone `eventsConnected=false`; no se inventan datos |
| R4 | `manualChunks` rompe la carga lazy de `Telemetry3DScene` | Baja | Medio | Verificar que `React.lazy` siga funcionando tras el split; el chunk `three-vendor` se comparte |
| R5 | Build Docker falla por falta de `docs/**` en contexto | Baja | Alto | `.dockerignore` ya repermite `docs/**`; verificar en build real |
| R6 | Smoke test falla por backend no disponible | Alta | Bajo | El smoke test solo verifica que el frontend sirve y que `/api` existe como proxy; no exige respuesta 200 del backend |

### C.2 Sin riesgo (aditivo puro)
- Cambio de texto en `futureNodes[].banner` (solo etiqueta).
- `manualChunks` es configuración de build, no altera runtime.
- Script de smoke test no toca `src/`.

### C.3 Riesgo global de Phase 2
**MEDIO-BAJO.** Todos los cambios están acotados a servicios/hooks de datos y configuración de build. No se tocan módulos prohibidos ni se altera la arquitectura.

---

## D. RESULTADO ESPERADO

| Item | Estado esperado tras Phase 2 |
|---|---|
| `cloud.js` | Clúster BBB con estado honesto (sin métricas fabricadas); Open-Meteo intacto |
| `useRoboticsApi` | Usa `/api` relativo; si backend no responde, `error` + `loading=false` honestos |
| `DataScienceLab` | `API_BASE` relativo (`/api`); SSE intenta conectar y falla honestamente sin inventar datos |
| Dashboard | `futureNodes` etiquetados "Roadmap · no integrado" (sin "Placeholder") |
| Bundle | Sin warnings de chunks >500 kB; chunks separados por librería pesada |
| Docker | `docker compose build frontend` exitoso; contenedor sirve en `:5173`; `/api` proxyeado |
| Smoke tests | Script ejecutable que verifica `200` en `/` y presencia de `#root` |
| Build de producción | Verde (EXIT=0) |
| ESLint | Gate ejecuta (deuda en CMSC/Labs permanece documentada, fuera de alcance) |

---

## E. PRUEBAS NECESARIAS

### E.1 Pruebas unitarias/manuales (por módulo)

| ID | Prueba | Comando/Acción | Criterio de aceptación |
|---|---|---|---|
| T-1 | Helper `resolveEndpoint` | Reutilizar los 6 casos de Phase 1 | `localhost:8000` → `/api`; vacío → fallback |
| T-2 | `cloud.js` honestidad | `fetchClusterNodesReal()` con backend down | Retorna nodos con `status:'offline'`, `data` sin métricas fabricadas |
| T-3 | `useRoboticsApi` host | Inspeccionar URL del fetch en DevTools | Es `/api/robot-telemetry/...` (no `localhost:8000`) |
| T-4 | `DataScienceLab` SSE | Click "Conectar métricas" con backend sin `/events` | Botón vuelve a "Conectar"; gráfico vacío (sin datos inventados) |
| T-5 | Dashboard fallback | Renderizar `/dashboard` | `futureNodes` muestra "Roadmap · no integrado" |

### E.2 Pruebas de build

| ID | Prueba | Comando | Criterio |
|---|---|---|---|
| T-6 | Build de producción | `npm run build` (en `src/frontend/`) | EXIT=0; sin warnings de chunks >500 kB |
| T-7 | Build Docker | `docker compose build frontend` | Imagen construida sin error |
| T-8 | Levantar frontend Docker | `docker compose up -d frontend` | Contenedor `sigctiarural_frontend` corriendo |
| T-9 | Smoke test | `bash src/frontend/scripts/smoke-frontend.sh` | `200` en `/`, HTML contiene `<div id="root">` |
| T-10 | Proxy `/api` | `curl http://localhost:5173/api/health` | Respuesta del backend (o 404/502 si backend no está — el proxy existe) |

### E.3 Pruebas de regresión (no romper lo existente)

| ID | Prueba | Criterio |
|---|---|---|
| T-11 | 18 rutas renderizan sin excepción | `ErrorBoundary` no atrapa errores en rutas principales |
| T-12 | CMSC `readClusterLabeled()` | Sigue funcionando con `data: {}` (usa `?.`) |
| T-13 | Knowledge Hub | 51 docs resuelven; build no rompe `import.meta.glob` |
| T-14 | Overlay `SYSTEM DEBUG` | Ausente en build de producción |
| T-15 | ESLint ejecuta | `npm run lint` no falla por config (deuda permitida) |

---

## F. ORDEN EXACTO DE EJECUCIÓN

Cada paso es **independiente y reversible**. Se ejecutan de menor a mayor riesgo.

```
P0  Baseline: git status + git rev-parse HEAD + npm run build (verde)
 │
 ├─► P1  cloud.js (honestidad)                          [A.1]
 │        └─ prueba T-2
 │
 ├─► P2  useRoboticsApi (host relativo)                 [A.2]
 │        └─ prueba T-1, T-3
 │
 ├─► P3  DataScienceLab (API_BASE relativo)             [A.3]
 │        └─ prueba T-4
 │
 ├─► P4  Dashboard fallback (texto)                     [A.4]
 │        └─ prueba T-5
 │
 ├─► P5  Bundle optimization (manualChunks)             [A.5]
 │        └─ prueba T-6
 │
 ├─► P6  Docker readiness (verificación)                [A.6]
 │        └─ prueba T-7, T-8
 │
 └─► P7  Smoke tests (script + ejecución)               [A.7]
          └─ prueba T-9, T-10, T-11..T-15
```

### F.1 Detalle del orden

| Paso | Acción | Depende de | Verificación |
|---|---|---|---|
| **P0** | Registrar baseline: `git status`, `git rev-parse HEAD`, confirmar `npm run build` verde | — | Captura de estado |
| **P1** | Modificar `cloud.js`: eliminar fabricación de métricas en `fetchClusterNodesReal` | P0 | T-2 |
| **P2** | Modificar `useRoboticsApi.js`: `resolveEndpoint` para `API_BASE_URL` | P0 | T-1, T-3 |
| **P3** | Modificar `DataScienceLab.jsx`: `resolveEndpoint` para `API_BASE` | P0 | T-4 |
| **P4** | Modificar `Dashboard.jsx`: `futureNodes[].banner` → "Roadmap · no integrado" | P0 | T-5 |
| **P5** | Modificar `vite.config.js`: `manualChunks` | P0 | T-6 |
| **P6** | Verificar `docker compose build frontend` + `up -d` | P1-P5 | T-7, T-8 |
| **P7** | Crear y ejecutar `smoke-frontend.sh` | P6 | T-9, T-10, T-11..T-15 |

### F.2 Puertas de decisión (Go/No-Go)

- **Después de P1-P5:** `npm run build` debe ser verde. Si no, revertir el paso que rompió.
- **Después de P6:** el contenedor debe servir en `:5173`. Si falla, diagnosticar build args (no tocar Dockerfile a menos que sea estrictamente necesario).
- **Después de P7:** smoke test debe retornar `200` en `/`. Si falla, revisar nginx config (no modificar a menos que sea el único camino).

---

## G. ENTREGABLES DE PHASE 2

1. `docs/FRONTEND_OFFICIALIZATION_PHASE_2_EXECUTION_PLAN.md` (este documento) — **SOLO PLAN**.
2. Tras ejecución: `docs/FRONTEND_OFFICIALIZATION_PHASE_2_REPORT.md` (reporte de ejecución con evidencia).
3. Script `src/frontend/scripts/smoke-frontend.sh`.

---

## H. DICTAMEN DEL PLAN

**GO_PHASE_2_PLAN** — El plan está completo, acotado y alineado con las reglas de no-injerencia. Los 7 objetivos están descompuestos en cambios exactos (A), archivos (B), riesgos mitigados (C), resultados (D), pruebas (E) y orden (F).

**Condiciones para ejecutar:**
1. Confirmación de Bernardo de que el alcance (7 items) es el correcto.
2. Confirmación de que Auth permanece en cuarentena (no se toca).
3. Confirmación de que solo se tocan los archivos listados en §B.

**Sin modificar código · sin commits · sin push.**
