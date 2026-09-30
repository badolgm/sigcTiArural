# SIGCTiArural · Estrategia de Ejecución del Frontend

> **Categoría:** Documentación canónica de continuidad.
> **Fecha:** 2026-09-25 · **Rama:** `feature/ubtn-biological-telemetry` · **HEAD:** `18b95b1`
> **Propósito:** fijar la trazabilidad formal de la coexistencia entre el Frontend Legacy Dockerizado y el Frontend Nuevo en Evolución, para evitar pérdida de contexto y auditorías sobre el frontend equivocado.
> **Regla de lectura:** este documento define PUERTOS y ROLES. Cualquier auditoría, prueba visual o decisión de frontend debe consultarlo primero.

---

## 0. HALLAZGO VALIDADO (2026-09-25, inspección real)

Se confirmó mediante inspección directa (HTTP, módulos, nginx, procesos, git) que:

1. **`http://localhost:5173` NO corresponde al frontend nuevo.** Es el **Frontend Legacy Dockerizado**, servido desde una imagen Docker construida el **22-ago-2026** (`docker inspect` → `Created: 2026-08-22T01:05Z`). Contenido observado: Dashboard Científico Edge, MQTT, BBB, TFLite, Telemetría histórica — build legacy congelado.
2. **`http://localhost:5174` es el entorno destinado al Frontend Nuevo en Evolución** (Vite Dev Server). El frontend nuevo vive en `src/frontend/src` e incluye: Dashboard en evolución, Hardware (catálogo + detalle), Proyectos, Conocimiento, Laboratorios, IA Predictiva y Knowledge Hub.
3. **El puerto 5174 NO fallaba por error de aplicación.** `ERR_CONNECTION_REFUSED` = no existía proceso escuchando (Vite Dev Server apagado). Verificado por `netstat`: puerto libre. No era un defecto de código.

Línea de tiempo que explica la divergencia:

| Fecha | Evento | Evidencia |
|---|---|---|
| 22-ago-2026 01:02 | Imagen `sigctiarural-frontend` construida (nginx sirve estáticos) | `docker inspect Created: 2026-08-22T01:05Z` |
| 15-sep-2026 | Commit `87fc001` feat(rc2): freeze dashboard + capa científica | `git log` |
| 21-sep-2026 | Commit `b031f28` feat(ui): telemetría + paneles colapsables | `git log` |
| 22-ago → 21-sep | **9 archivos fuente cambiaron tras el build**: `App.jsx`, `Dashboard.jsx`, `TopNav.jsx`, `TelemetryPanel.jsx`, `HardwareCatalogPage.jsx`, `HardwareDetailPage.jsx`, `ProjectsPage.jsx`, `catalog-data.js`, `projects-data.js` | `git log --since=2026-08-22` |

> La imagen Docker es **inmutable** (sin volumen para `src/frontend`): el contenedor NO refleja los cambios locales posteriores (ver `docs/SIGCTIARURAL_FRONTEND_LOCAL_STRATEGY.md` §1).

---

## 1. Historia del frontend

El frontend de SIGCTiArural es una aplicación **React 18 + Vite 5 + Tailwind** con rutas SPA. Su evolución pasa por tres estados:

1. **Frontend Legacy (estable)** — el "Dashboard Científico Edge" histórico: MQTT, BBB (BBB-01/02/03), TFLite, Telemetría. Conjunto de componentes preservados por la regla suprema (NADA DESAPARECE).
2. **Frontend en Evolución (activo)** — la Dashboard que integra las misiones de preservación/expansión y transición a la Dashboard Ganadora: Hardware Catalog, Proyectos con evidencia trazable, paneles colapsables, Knowledge Hub contextual, IA Predictiva.
3. **Frontend Ganadora (objetivo)** — spec visual `docs/SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md` (diseño U0.5). La evolución implementa hoy ≈50% de la visión (ver `docs/SIGCTIARURAL_DASHBOARD_PARITY_REVIEW.md`).

Referencias de diseño/estrategia ya existentes (no duplicadas aquí):
- `docs/SIGCTIARURAL_VISION_ALIGNMENT.md` — identidad.
- `docs/SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md` — spec visual de la Dashboard Ganadora.
- `docs/SIGCTIARURAL_FRONTEND_LOCAL_STRATEGY.md` — entorno local aislado (Variante A/B).
- `docs/SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md` — plan de migración (7 fases).
- `docs/SIGCTIARURAL_FRONTEND_ARCHITECTURE_AUDIT.md` — auditoría arquitectónica.

---

## 2. Diferencia 5173 vs 5174 (EL MAPA QUE NO DEBE CONFUNDIRSE)

| Elemento | **5173** | **5174** |
|---|---|---|
| **Rol** | Frontend **LEGACY Dockerizado** · referencia estable | Frontend **NUEVO en Evolución** · laboratorio activo |
| **Qué sirve** | Build estático (imagen Docker del 22-ago-2026) | Código fuente en vivo (`src/frontend/src/**`) vía Vite |
| **Tipo de servidor** | **nginx** (`docker-compose.yml` servicio `frontend`, puerto 5173→80) | **Vite Dev Server** (proceso local `node`, HMR) |
| **Refleja cambios de código** | **NO** (imagen inmutable, sin volumen) | **SÍ** (hot reload en vivo) |
| **Evidencia de contenido** | `/src/App.jsx` ⇒ devuelve `index.html` (SPA fallback de nginx), NO el módulo | `/src/App.jsx` ⇒ devuelve el **módulo JS transformado** (`import.meta.hot`), rutas nuevas presentes |
| **Novedad observable** | Dashboard Científico Edge, MQTT, BBB, TFLite, Telemetría histórica | Rutas `/hardware-catalog`, `/proyectos`, `/hardware/:id`; paneles colapsables (`aria-expanded`), Knowledge Hub, Labs |
| **Comando de arranque** | `docker compose up -d frontend` | `npm run dev -- --port 5174 --strictPort` (desde `src/frontend`) |
| **Uso recomendado** | comparaciones · baseline visual · validaciones retrospectivas | desarrollo diario · pruebas visuales · validación de la evolución |

**PRINCIPIO QUE NO CONFUNDIR:** Frontend Dockerizado ≠ Frontend Activo de Desarrollo. El Docker (5173) es una **fotografía congelada**; el activo de desarrollo (5174) es el **estado vivo**.

---

## 3. Rol de Docker

- Docker (via `docker-compose.yml`) orquesta el ecosistema completo: `db`, `db-mysql`, `backend`, `ai_service`, `frontend`.
- El servicio `frontend` usa `src/frontend/Dockerfile` (multi-stage: `node:18-alpine` → `npm run build` → **nginx** sirve estáticos). Solo expone `FRONTEND_PORT=5173`.
- **El frontend Docker NO tiene volumen** (`docker-compose.yml` solo monta `./src/backend:/app`). La imagen es **inmutable**: los cambios locales en `src/frontend` NO afectan al contenedor.
- Docker es la **referencia estable** (runtime de producción equivalente a un build) y la línea de **reemplazo controlado** cuando la Evolución alcance madurez.
- Regla operativa: **NUNCA usar el puerto 5173 para el dev server** (colisión; `--strictPort` lo garantiza).

---

## 4. Rol de Vite

- Vite es el **entorno de desarrollo** del frontend nuevo: hot reload, transformación de módulos en vivo, source maps y proxy `/api` → `http://localhost:8010` (backend Docker).
- Config: `src/frontend/vite.config.js` — `host: true`, puerto por defecto 5173 (por eso se fuerza **5174** con `--strictPort`), `fs.allow` incluye `repoRoot` (necesario para que el Knowledge Hub lea `README.md` y `docs/**` vía `import.meta.glob`), proxy `/api` → `VITE_BACKEND_PROXY_TARGET` (default `localhost:8010`).
- **Variante A (sin tocar el repo):** `npm install --legacy-peer-deps` (espejo del Dockerfile) + `npm run dev -- --port 5174 --strictPort`. Verificado operativo el 2026-09-25 (VITE v5.4.21, ready en 2140 ms).
- Vite lee las APIs solo de forma **lectura** contra backend/IA Docker (`localhost:8010` / `localhost:8081`), sin modificar Docker.

---

## 5. Frontend Legacy

- **Definición:** la aplicación que sirve la imagen Docker del 22-ago-2026 en `http://localhost:5173`.
- **Contenido:** Dashboard Científico Edge, MQTT, BBB (BBB-01/02/03), TFLite, Telemetría histórica, componentes del sistema previo.
- **Por qué existe aún:** la regla suprema preserva todo (NADA DESAPARECE); es el **baseline visual** y la **referencia de comparación** hasta que el reemplazo controlado esté aprobado.
- **Papel en auditorías:** cualquier auditoría debe saber que 5173 NO representa el estado actual de desarrollo. Usar SOLO para comparar contra la evolución.
- Los componentes legacy NO se eliminan: se **conservan e integran** en la evolución (diseño `docs/SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md`).

---

## 6. Dashboard en Evolución (Frontend Nuevo)

- **Definición:** la aplicación que arranca el Vite Dev Server en `http://localhost:5174`, desde `src/frontend/src`.
- **Estado de parity vs Dashboard Ganadora:** ≈ **50 %** implementado (`docs/SIGCTIARURAL_DASHBOARD_PARITY_REVIEW.md`, 2026-09-15: 6/21 IMPLEMENTADO · 9/21 PARCIAL · 6/21 FALTANTE).
- **Lo que ya contiene (verificado en código):**
  - Rutas SPA nuevas y activas: `/hardware-catalog`, `/hardware/:id`, `/proyectos`, además de `/dashboard`, `/labs`, `/knowledge`, `/ai-predictive`, `/data-science`.
  - Paneles colapsables del ecosistema (`Dashboard.jsx` L138 `aria-expanded`; `b031f28` 21-sep-2026).
  - Hardware Catalog con detalle por plataforma y estados honestos (`referencia/diseño/vacío`).
  - Proyectos con evidencia trazable (`ProjectsPage.jsx`, `projects-data.js`).
  - Knowledge Hub operativo (51 docs), cadena del ecosistema navegable, BBB preservados en Operación.
  - Voz (VoiceAssistant + routeMap), Login/Auth latente, Redirect `/` → `/dashboard`.
- **Lo que falta (parity):** selector de persona, evidencia reciente trazable, capacidades como tarjetas con estado, operación colapsable con brokers/APIs/tests, detalle de aprendizaje en el catálogo, UBTN como eslabón (gated), telemetría con bioseñal IA (gated).

---

## 7. Estrategia futura

| Fase | Descripción |
|---|---|
| **A · Desarrollo activo** | Trabajar en **5174** (laboratorio activo). 5173 permanece intacto como referencia. Cualquier validación visual de la evolución se hace sobre 5174. |
| **B · Alcance de estado estable** | Cuando la Dashboard en Evolución supere el gate (parity y prueba visual aprobada por Bernardo), se **dockeriza** siguiendo `docs/SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md` (7 fases, feature flags y rollback). |
| **C · Despliegue** | La imagen actualizada reemplaza la app servida por nginx; el Legacy pasa a ser sólo histórico (nunca borrado). |
| **D · Cloud** | El build dockerizado es la base para el despliegue cloud (ver `docs/SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md` y guías de deploy). |

**Cronología de reemplazo (conclusión explícita):**
> Mientras continúe el desarrollo: **5173 = referencia estable · 5174 = laboratorio activo**. Cuando el Dashboard en Evolución alcance estado estable: **5174 → Docker → Cloud → reemplazo controlado del legacy**.

---

## 8. Condiciones para dockerizar (5174 → Docker)

1. **Aprobación explícita** de Bernardo de la versión en evolución (prueba visual sobre 5174).
2. Cumplir los **gates del plan de migración** (`docs/SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md`): feature flags, rollback y validación de rutas preservadas.
3. `npm run build` y `npm run lint` en limpio (sin warnings) sobre `src/frontend`.
4. Verificar que la imagen Docker se **reconstruye con los cambios actuales** (¡el punto que falló hoy: la imagen del 22-ago no incluía los commits de sep!).
5. Confirmar que el proxy `/api` y las URLs `VITE_API_URL`/`VITE_AI_API_BASE`/`VITE_AI_INFERENCE_URL` quedan inyectados correctamente en build.
6. Regresión contra 5173 (legacy) para no romper funciones preservadas (telemetría, BBB, Knowledge Hub).

---

## 9. Condiciones para despliegue cloud

1. Imagen Docker **actualizada y validada** (sección 8) como artefacto único de despliegue.
2. Base de datos y backend con migraciones aplicadas y healthchecks en pasarela.
3. Variables de entorno no comprometidas (`SECRET_KEY`, credenciales DB) vía secrets del proveedor.
4. CORS/ALLOWED_HOSTS alineados con el dominio público.
5. Estrategia de **honestidad de estado** (labels `real/referencia/simulación/diseño`) intacta en la UI.
6. Plan de rollback definido (mantener el artefacto Legacy como respaldo hasta estabilización).

---

## 10. Conclusión (para futuras auditorías)

- **5173 = Frontend Legacy Dockerizado** — referencia histórica, build congelado (22-ago-2026). NO representa el estado actual del desarrollo.
- **5174 = Frontend Nuevo en Evolución** — fuente actual de desarrollo, laboratorio activo, dirección estratégica de SIGCTiArural.
- **No confundir Frontend Dockerizado con Frontend Activo de Desarrollo.**
- **`ERR_CONNECTION_REFUSED` en 5174** nunca es un bug de la app: significa que el Vite Dev Server no está corriendo. Arrancarlo con Variante A:
  ```powershell
  Set-Location "src\frontend"
  npm install --legacy-peer-deps
  npm run dev -- --port 5174 --strictPort
  ```
- **Documentos de referencia:** `docs/SIGCTIARURAL_FRONTEND_LOCAL_STRATEGY.md`, `docs/SIGCTIARURAL_DASHBOARD_PARITY_REVIEW.md`, `docs/SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`, `docs/SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md`.

---

*Honestidad de estado: 5173 = referencia estable (legacy congelada) · 5174 = laboratorio activo de la evolución. Porte ESG4: mapeo de puertos/roles conforme a la inspección real del 2026-09-25.*