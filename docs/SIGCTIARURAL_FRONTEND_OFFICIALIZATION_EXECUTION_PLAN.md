# SIGCTIARURAL_FRONTEND_OFFICIALIZATION_EXECUTION_PLAN

**Fecha:** 2026-10-12
**Rama:** `feature/cmsc-f3c-v1-implementation` (HEAD `415ee2b`)
**Tipo:** SOLO PLAN — sin modificar código, sin commits, sin push
**Base:** `docs/SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT.md` (commit `c4e29be`)
**Fuente de verdad auditada:** `src/frontend/` (Vite 5 + React 18)
**Objetivo:** convertir el dictamen `GO_FRONTEND_OFICIAL_CONDICIONADO` de la auditoría en un plan
de ejecución verificable para declarar `src/frontend/` **frontend oficial desplegado** (reemplazo
controlado del Docker 5173 legacy).

---

## 0. MÉTODO Y EVIDENCIA (verificado en disco, 2026-10-12)

| Comprobación | Resultado | Fuente |
|---|---|---|
| `src/frontend/src/**` `.js/.jsx` | **93 archivos · 16.984 líneas** | conteo en disco |
| `vite.config.js` puerto | **5173** (5174 solo por CLI `--strictPort`) | `vite.config.js:22` |
| Proxy dev `/api` | `→ http://localhost:8010` (`VITE_BACKEND_PROXY_TARGET`) | `vite.config.js:15,25-30` |
| `.env*` en `src/frontend/` | **AUSENTES** (ningún `.env` en disco) | `Get-ChildItem` |
| `docker-compose.yml` frontend | `5173:80`, env defaults a `localhost:8010/8081` | `docker-compose.yml:84-97` |
| `Dockerfile` nginx | `/api/ → backend:8000`, SPA fallback | `Dockerfile:43-57` |
| `npm run lint` | **FALLA** — no existe config ESLint; además escanea `dist/` | ejecución local |
| `dist/` | existe y está en `.gitignore` (`:49`) | disco + `.gitignore` |
| Archivos `.bak` | `package.json.bak`, `package-lock.json.bak` presentes | disco |
| Vendor auto-hospedado | `public/vendor/{circuitjs1,jsxgraph}` + `public/worklets` | disco |
| CDNs externos en `index.html` | Google Fonts (Inter/Orbitron/Rajdhani), Font Awesome | `index.html:7-10` |
| Bridge acústico | `http://127.0.0.1:8766` (local-only) | `acousticBridge.js:10` |
| Overlay `SYSTEM DEBUG` | activo en todas las rutas | `App.jsx:99-104` |
| Auth | `AuthGuard` 0 usos; `Login`/`Register`/`Admin2FA` 0 refs; `LoginModal` solo en Dashboard | grep |
| `pages/_deprecated/` | 5 archivos, 0 referencias | grep |

**Conclusión de la evidencia:** la app compila y los módulos CMSC/KH/Workbench/Bridge/Dataset son
funcionales en dev, pero existen **4 clases de bloqueo** para el despliegue oficial: (1) URLs
absolutas a `localhost` incompatibles con acceso remoto; (2) ESLint inexistente (sin gate de
calidad); (3) higiene de repositorio (`.bak`, `_deprecated`, overlay debug); (4) gobernanza de
estado (Auth y local-only sin declarar). Este plan resuelve las 4 sin romper rutas ni módulos.

---

## 1. CAMBIOS REQUERIDOS

Regla rectora: **envolver · declarar · conectar · higienizar**. No se reescribe arquitectura, no se
borra ningún módulo funcional (NADA DESAPARECE), no se toca backend.

### 1.A Red de acceso (crítico — D-2)

| # | Cambio | Detalle | Clase |
|---|---|---|---|
| 1A.1 | **Consumir `/api` relativo** en `AuthContext.jsx` | hoy `VITE_API_URL` absoluto (`http://localhost:8010`) rompe fuera del dev; el nginx ya proxya `/api/`. Default a `''` (relativo) y dejar la var solo como override. | MODIFICAR |
| 1A.2 | **AIPredictiva** | `AI_INFERENCE_URL` ya cae a `/api/v3/ai/inference/`; asegurar que el default relativo prevalezca sobre el absoluto de compose. | VERIFICAR/ALINEAR |
| 1A.3 | **VoiceAssistant** `http://localhost:8081` | parametrizar a ruta relativa vía proxy (`/ai-api`) o declarar `SIN_ASISTENTE` honesto cuando no haya host. | MODIFICAR |
| 1A.4 | **`useRoboticsApi.js` `http://localhost:8000`** | host hardcodeado; alinear a `/api` relativo o re-etiquetar `ROTO` (ya declarado `ROTO` en `signalCatalog`). | MODIFICAR/DECLARAR |
| 1A.5 | **`services/cloud.js`** | `sigct-backend.onrender.com` + `open-meteo.com` directos; mover a `fetch` relativo tras proxy o declarar `REMOTA-DEGRADADA` con fallback honesto (no clúster fabricado). | MODIFICAR |
| 1A.6 | **nginx `/api` real** | confirmar que el frontend **use** `/api` tras 1A.1–1A.5 (hoy el bloque existe pero nadie lo usa). | VERIFICAR |

### 1.B Calidad y build

| # | Cambio | Detalle | Clase |
|---|---|---|---|
| 1B.1 | **Crear config ESLint** raíz de `src/frontend` (`.eslintrc.cjs`) | hoy `npm run lint` falla por ausencia; el `package.json` ya declara `eslint`, `eslint-plugin-react`, `-hooks`, `-refresh`. Añadir `ignorePatterns: ['dist','node_modules']`. | CREAR |
| 1B.2 | **Ignorar `dist/`** en ESLint | ESLint escanea `dist/` y falla; `.eslintignore` o `ignorePatterns`. | CREAR |
| 1B.3 | **`package.json.bak` / `package-lock.json.bak`** | residuos; retirar del árbol (mover a `.local_backups/` fuera de git, no borrar lógica). | HIGIENIZAR |
| 1B.4 | **Dividir bundle** (>500 kB) | `manualChunks` para `three`/`@react-three`, `mermaid`, `jsxgraph`, `recharts`. Rendimiento, no corrección. | OPCIONAL |

### 1.C Acceso remoto y local-only honesto

| # | Cambio | Detalle | Clase |
|---|---|---|---|
| 1C.1 | **Bridge local-only declarado** | `acousticBridge.js` 127.0.0.1:8766 jamás viaja en contenedor; la UI deve mostrar `SIN_PUENTE` honesto (ya hay badge `PUENTE OK/SIN_PUENTE`) y una nota permanente "captura/integración solo en máquina local". | VERIFICAR/DECLARAR |
| 1C.2 | **Variables de build** | documentar `VITE_API_URL`, `VITE_AI_API_BASE`, `VITE_AI_INFERENCE_URL`, `VITE_TELEMETRY_HISTORY_URL`; para despliegue remoto dejarlas VACÍAS (relativas) o apuntar al host público. | DOCUMENTAR |

### 1.D Gobernanza de estado (decidir, no dejar inerte)

| # | Cambio | Detalle | Clase |
|---|---|---|---|
| 1D.1 | **Overlay `SYSTEM DEBUG`** (`App.jsx:99-104`) | retirar en build oficial (o gatear por `import.meta.env.DEV`). | MODIFICAR |
| 1D.2 | **Auth** | decidir: **cablear** (`AuthGuard` en rutas sensibles) o **retirar declarado** (`Login`/`Register`/`Admin2FA`/`AuthGuard` a cuarentena). Hoy 0 usos = estado ambiguo. | DECIDIR |
| 1D.3 | **`pages/_deprecated/`** | 5 archivos con 0 refs y CDNs externos; mover a cuarentena declarada o retirar del build (no borrar historia: preservar en `.local_backups/`). | HIGIENIZAR |
| 1D.4 | **Duplicidad `/labs/robotics` vs `/lab-*`** | consolidar en el mapa de navegación (sin romper rutas legacy). | DECIDIR |
| 1D.5 | **Clúster fabricado** (`cloud.js` fallback) | reemplazar por estado `ROTO`/`SIN_DATOS` honesto. | MODIFICAR |

### 1.E Sin riesgo (aditivo puro — no requiere pruebas de regresión)

- Documentar variables y el "modo local-only" del bridge (solo texto/docs).
- Guardar `.bak` en `.local_backups/` (fuera de git).
- Añadir `.eslintrc.cjs` + `.eslintignore` (no altera runtime).
- Notas de estado en UI (texto honesto), sin cambiar lógica de datos.

---

## 2. ORDEN RECOMENDADO DE EJECUCIÓN

Cada paso es reversible y no rompe lo anterior. **No se declara oficial hasta cerrar el bloque 4.**

| Orden | Paso | Depende de | Verificación |
|---|---|---|---|
| **P0** | Congelar baseline: `git status`, `git rev-parse HEAD`, registrar `vite build` OK | — | captura de estado |
| **P1** | 1B.1–1B.3 ESLint + higiene `.bak` | — | `npm run lint` ejecuta (aunque reporte, ya no falla por config) |
| **P2** | 1A.1–1A.5 URLs relativas + 1D.5 clúster honesto | P1 | build dev + smoke `/api` |
| **P3** | 1D.1 overlay debug + 1D.3 `_deprecated` + 1D.4 duplicidad | P1 | 18 rutas renderizan |
| **P4** | 1D.2 decisión Auth (cablear o cuarentena) | P3 | flujo login o retirada declarada |
| **P5** | 1B.4 (opcional) división de bundle | P2 | build sin warning >500 kB |
| **P6** | **Build Docker real** (`docker compose build frontend` + `up`) | P2–P5 | contenedor sirve, `/api` responde |
| **P7** | **Smoke remoto** desde otra máquina | P6 | revela si 1A quedó bien |
| **P8** | Dictamen final `GO_FRONTEND_OFICIAL` | P7 | checklist §4 |

> **Docker ya está UP** (Engine 29.7.2), a diferencia del estado de la auditoría → P6 ya es ejecutable.

---

## 2.A Orden — justificación

Se higieniza primero (P1) para tener gate de lint antes de tocar red; se corrige red (P2) antes que
gobernanza visual (P3) porque es el bloqueo real de despliegue; la decisión de Auth (P4) es de
producto y no debe bloquear el hardening técnico; el build Docker (P6) es el primer punto donde el
`docker compose` (frontend `5173:80` + nginx `/api→backend:8000`) se ejerce con las URLs ya
relativas.

---

## 3. RIESGOS

### 3.D Riesgos de cambio

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| 3D.1 | Relativizar URLs rompe el dev server (que sí usa proxy `/api`) | Media | Dev sin datos | El proxy de Vite y el de nginx apuntan ambos a `/api`; mantener `VITE_*` como override para casos especiales |
| 3D.2 | `cloud.js` acepta el fallback fabricado como real | Alta | Honestidad de datos | Reemplazar por estado `ROTO`/`sin datos` (1D.5) antes de declarar oficial |
| 3D.3 | Retirar `_deprecated`/`.bak` elimina código | Baja | Pérdida | Mover a `.local_backups/` (fuera de git), nunca `rm` |
| 3D.4 | Nuevo ESLint produce cientos de errores | Media | Frena P1 | Fase 1 solo exige que **ejecute**; reglas mínimas, deuda registrada |
| 3D.5 | Decisión Auth bloquea a Bernardo | Media | P4 detenido | P1–P3 no dependen de Auth; el plan puede avanzar con Auth en cuarentena declarada |
| 3D.6 | `dist/` commiteado por error en el contexto Docker | Baja | Build sucio | `.dockerignore` ya excluye `dist` y `node_modules` |

### 3.E Sin riesgo (aditivo puro)

- `1B.3`, `1C.2`, `1D.3` (mover, no borrar), `1D.1` gateado por `DEV`, documentación de variables.
- Ninguno toca backend, contratos `SensorReading`/`RobotTelemetry`, ni rutas existentes.

### 3.F Requiere pruebas obligatorias

- Todo el bloque **1.A** (red), **1.D.2** (Auth), **1.C.1** (bridge offline/online), **1.B.4** (bundle).

---

## 4. PRUEBAS (checklist de cierre)

- [ ] **P-T1** `npm run lint` ejecuta sin fallar por config (deuda puede quedar visible).
- [ ] **P-T2** `vite build` OK; sin warning de chunks >500 kB (si 1B.4).
- [ ] **P-T3** `docker compose build frontend` + `up` → contenedor `sigctiarural_frontend` sirve en `:5173`.
- [ ] **P-T4** **Smoke remoto** desde otra máquina: `/api` responde (prueba 1A.1–1A.6).
- [ ] **P-T5** 18 `<Route>` renderizan sin excepción (`ErrorBoundary` no atrapa).
- [ ] **P-T6** Bridge offline → UI `SIN_PUENTE` honesta; online → `PUENTE OK` con `/ingest` + `/stats`.
- [ ] **P-T7** E2E CMSC: S30 → Logger → Bridge → Dataset (`/stats`) en dev y en build.
- [ ] **P-T8** Knowledge Hub: 51 docs resuelven; ausencia de docs no rompe build.
- [ ] **P-T9** Auth: login real **o** retirada declarada verificada.
- [ ] **P-T10** Worklet `pcm-capture-processor.js` en 5174 (HTTPS/localhost) con fallback.
- [ ] **P-T11** Sin overlay `SYSTEM DEBUG` en build oficial.

---

## 5. DICTAMEN

**GO_FRONTEND_OFICIAL_CONDICIONADO** — se mantiene el veredicto de la auditoría, ahora con plan de
ejecución cerrado y ordenado.

- **GO** para declarar `src/frontend/` **fuente de verdad oficial de desarrollo** (build OK,
 93 archivos/16.984 líneas, 18 rutas, módulos CMSC/KH/Workbench/Bridge/Dataset funcionales).
- **NO_GO** para **frontend oficial desplegado** (reemplazo del Docker 5173) hasta cerrar:
  - **bloque 1.A** (URLs relativas + smoke remoto P-T4),
  - **1.B.1/1.B.2** (gate de lint),
  - **1.D.1/1.D.3** (overlay debug, `_deprecated`),
  - **decisión 1.D.2** (Auth),
  - **P-T3** (build Docker real, hoy ya ejecutable porque Docker está UP).

Al completar §4, el dictamen pasa a **GO_FRONTEND_OFICIAL**.

---

**SOLO PLAN. Sin modificar código · sin commits · sin push.**
