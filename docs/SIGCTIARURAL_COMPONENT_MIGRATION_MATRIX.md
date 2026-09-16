# SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX — Clasificación de cada archivo del frontend

**Familia:** Refactorización Global · **Gate:** U0.5 → U1 (transición a la Dashboard Ganadora)
**Estado:** `referencia` (auditoría exhaustiva de `src/frontend/src` — sin código)
**Regla:** **NADA DESAPARECE** · clasificación: `PRESERVAR` / `AMPLIAR` / `MOVER` / `DEPRECAR` / `NO TOCAR`.

---

## 1. Clasificaciones (significado en esta familia)

| Clasificación | Significado | Qué se hace en el gate |
|---|---|---|
| **PRESERVAR** | El archivo se conserva exactamente como está | No se toca; se usa tal cual en la Ganadora |
| **AMPLIAR** | Se conserva y además recibe capacidad nueva | El archivo se modifica ADITIVAMENTE (añadir, nunca quitar) en U1 |
| **MOVER** | El archivo cambia de contenedor/página pero NO se altera su contenido | Se realoja (ruta/contenedor), con redirect si aplica |
| **DEPRECAR** | El archivo deja de tener presencia activa de navegación, pero permanece en el repo como legado | No se elimina; se cataloga (mismo trato que `_deprecated/*`) |
| **NO TOCAR** | Está fuera del alcance de la migración (dependencias, vendor, backend) | Prohibido modificarlo |

---

## 2. Matriz completa (`src/frontend/src/**`)

### 2.1. Núcleo de la aplicación

| Archivo | Clasificación | Destino en la Ganadora | Notas |
|---|---|---|---|
| `App.jsx` | **AMPLIAR** | Router único (Sombra `feature-flag`) | Añadir rutas `/hardware-catalog`, `/proyectos`; ampliar `routeMap` de voz; **jamás quitar** rutas existentes |
| `main.jsx` | **PRESERVAR** | Inicializador | Sin cambios |
| `index.css` | **AMPLIAR** | Estilos base | Se añaden clases aditivas; los estilos actuales (`card-float`, `neon-btn`, etc.) se conservan |
| `vite.config.js` | **PRESERVAR** | Build | Sin cambios |
| `tailwind.config.js` | **PRESERVAR** | Build | Sin cambios |

### 2.2. Páginas principales (`pages/`)

| Archivo | Clasificación | Destino | Notas |
|---|---|---|---|
| `Dashboard.jsx` | **AMPLIAR** (reorganizar, no reescribir) | Sección **Operación + Telemetría** dentro de `/dashboard` (Ganadora) | Preservar `initialNodes`, `defaultChartData`, `TELEMETRY_ENDPOINTS` (V3+fallback), `onRequireAuth`/`LoginModal`; realojar tiles al catálogo |
| `LabCatalog.jsx` | **AMPLIAR** | Sección **Laboratorios** con breadcrumb de la cadena | Mantener `desiredOrder`; añadir enlaces aditivos |
| `AIPredictiva.jsx` | **PRESERVAR** | Ruta `/ai-predictive` intacta (eslabón IA) | Sin cambios funcionales |
| `DataScienceLab.jsx` | **PRESERVAR** | Ruta `/data-science` (científico de datos) | Sin cambios |
| `Login.jsx` | **PRESERVAR** (latente) | Auth futura (decisión D-A) | No tocar; en repo |
| `Register.jsx` | **PRESERVAR** (latente) | Auth futura (decisión D-A) | No tocar |
| `Admin2FA.jsx` | **PRESERVAR** (latente) | Auth futura (decisión D-A) | No tocar |
| `_deprecated/Docs*.jsx` (5) | **DEPRECAR** (ya legado) | Knowledge Hub (contenido migrado); archivos en repo | No se tocan; presentes en `COMPONENT_MAP` como legado |

### 2.3. Laboratorios (`labs/`)

| Archivo | Clasificación | Destino | Notas |
|---|---|---|---|
| `RoboticsLab.jsx` | **PRESERVAR** | Lab Robótica (catálogo) | Sin cambios funcionales |
| `EmbeddedLab.jsx` | **PRESERVAR** | Lab Sistemas Embebidos (Programación) | Sin cambios funcionales |
| `TelecomLab.jsx` | **PRESERVAR** | Lab Telecomunicaciones | Sin cambios |
| `ElectronicsLab.jsx` | **PRESERVAR** | Lab Física y Electrónica | Sin cambios |
| `SchematicEditor.jsx` | **PRESERVAR** (legacy vía adapter) | Herramienta interna de Electronics | Migrar a WebAssembly en largo plazo (GR-07); hoy intacto |
| `FalstadPanel.jsx` (`electronics/FalstadPanel.jsx`) | **PRESERVAR** | Panel de simulación Falstad | Sin cambios |
| `electronics/ports/circuitSimulationPort.js` | **NO TOCAR** | Puerto hexagonal | No modificar |
| `electronics/adapters/falstadAdapter.js` | **NO TOCAR** | Adapter | No modificar |
| `electronics/adapters/legacySchematicEditorAdapter.js` | **NO TOCAR** | Adapter | No modificar |
| `AdvancedMathLab.jsx` | **PRESERVAR** | Lab Matemáticas Avanzadas V1 | Sin cambios |
| `AdvancedMathLabV2.jsx` | **PRESERVAR** | Lab Matemáticas Avanzadas V2 | Sin cambios |
| `mathHelpers.js` | **PRESERVAR** | Utilidad compartida | Sin cambios |
| `math-resources/README.md` | **PRESERVAR** | Recursos matemáticos | Sin cambios |

### 2.4. Componentes (`components/`)

| Archivo | Clasificación | Destino | Notas |
|---|---|---|---|
| `TopNav.jsx` | **AMPLIAR** | Barra con items nuevos (Hardware, Proyectos) | Añadir items; ningún item existente se quita/reordena; dot clúster preservado |
| `ClusterCard.jsx` | **PRESERVAR** (MOVER visual) | Sección Operación del Dashboard | Realojada, contenido intacto |
| `GlobalChart.jsx` | **PRESERVAR** (MOVER visual) | Sección Telemetría | Realojada |
| `TelemetryPanel.jsx` | **PRESERVAR** (MOVER visual) | Sección Telemetría | Realojada |
| `Telemetry3DScene.jsx` | **PRESERVAR** (MOVER visual) | Sección Telemetría (o Robotics que ya lo use) | Realojada |
| `LoginModal.jsx` | **PRESERVAR** | Dashboard (gate `onRequireAuth`) | En uso hoy; intacto |
| `AuthGuard.jsx` | **PRESERVAR** (latente) | Auth futura (D-A) | No rutear aún |
| `ErrorBoundary.jsx` | **PRESERVAR** | App | Sin cambios |
| `VoiceAssistant.jsx` | **AMPLIAR** | Voz ampliada | `routeMap` de App crece; el componente se conserva |

### 2.5. Hooks, stores, servicios, datos, auth, Knowledge Hub

| Archivo | Clasificación | Destino | Notas |
|---|---|---|---|
| `hooks/useRoboticsApi.js` | **PRESERVAR** | Robot lab | Sin cambios |
| `stores/useLabStore.js` | **PRESERVAR** | Estado de labs | Sin cambios |
| `services/cloud.js` | **PRESERVAR** | Fuente de clúster/telemetría | Sin cambios |
| `data/lab-data.js` | **PRESERVAR** | Fuente de verdad pedagógica de labs | Catálogo nuevo usa **otro** módulo; `lab-data.js` no se modifica |
| `data/ADDING_LABS.md` | **PRESERVAR** | Protocolo docente de añadir labs | Sin cambios |
| `auth/AuthContext.jsx` | **PRESERVAR** (latente) | Auth futura (D-A) | Sin cambios |
| `knowledge-hub/services/docLoader.js` | **PRESERVAR** | Knowledge Hub | Sin cambios |
| `knowledge-hub/services/markdownRenderUtils.js` | **PRESERVAR** | Knowledge Hub | Sin cambios |
| `knowledge-hub/registry/knowledgeRegistry.generated.json` | **AMPLIAR** (generado) | Registro con nuevas familias | Solo ampliación aditiva (schema bn/json compatible); el script generador se preserva |
| `knowledge-hub/pages/KnowledgeHubLayout.jsx` | **PRESERVAR** | `/knowledge` | Sin cambios |
| `knowledge-hub/components/MarkdownDocumentView.jsx` | **PRESERVAR** | Visor | Sin cambios |

### 2.6. Assets / vendor (fuera de `src/`)

| Ruta | Clasificación | Notas |
|---|---|---|
| `public/vendor/circuitjs1/**` (drop Falstad: html, js, locale, icon, font, doc, `WEB-INF/web.xml`, `circuitjs1/style.css`) | **NO TOCAR** | Simulador Falstad vendido del que depende `FalstadPanel` (iframe). No involucrado en la migración |
| `frontend/Dockerfile`, `frontend/index.html`, `frontend/package.json`, `frontend/package-lock.json` | **PRESERVAR** | Build/env; sin cambios salvo nueva dependencia aprobada |

---

## 3. Respuestas directas que la Misión exige

1. **Archivos React que existen:** 44 archivos catastrados (App/main/index.css + 8 páginas + 5
   `_deprecated` + 11 labs/utilidades + 9 componentes + 1 hook + 1 store + 1 servicio + 1 de datos
   + 1 auth + 4 del Knowledge Hub) — ver matriz.
2. **Componentes que sobreviven (PRESERVAR):** todos los labs, todos los widgets de telemetría
   (Panel/Chart/3D), ClusterCard, LoginModal, ErrorBoundary, VoiceAssistant, auth latente,
   servicios/datos/hooks/stores y el Knowledge Hub. **Ninguno se borra.**
3. **Componentes que cambian (AMPLIAR):** `App.jsx` (rutas + voz), `TopNav.jsx` (items),
   `Dashboard.jsx` (reorganización aditiva), `index.css` (clases nuevas), `knowledgeRegistry`
   (ampliación generada).
4. **MOVER visual (sin alterar contenido):** `ClusterCard` → Operación; `GlobalChart`,
   `TelemetryPanel`, `Telemetry3DScene` → Telemetría; tiles "Integraciones Futuras" →
   `/hardware-catalog`.
5. **DEPRECAR (legado, no se borra):** `pages/_deprecated/*` y (solo si el dueño decide) el banner
   debug `SYSTEM ONLINE` — que por regla suprema permanece hasta decisión explícita.

---

## 4. Garantía de no-pérdida

- Todo componente clasificado `PRESERVAR` o `AMPLIAR` tiene **casa permanente en la Ganadora**
  (matriz de Fase 3 de `FRONTEND_MIGRATION_PLAN`).
- El `PRESERVATION_AUDIT` (PA-01..PA-12) se cierra contra esta matriz: si un archivo no aparece
  aquí, se detecta como **olvidado** antes de migrar.

---

## 5. Referencias

- [`SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md`](SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md) — fases.
- [`SIGCTIARURAL_PAGE_MAPPING.md`](SIGCTIARURAL_PAGE_MAPPING.md) — página a página actual→futuro.
- [`SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS.md`](SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS.md) — gaps del Dashboard.
- [`SIGCTIARURAL_ROUTE_EVOLUTION.md`](SIGCTIARURAL_ROUTE_EVOLUTION.md) — rutas.
- [`SIGCTIARURAL_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) — inviolable.