# SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS — Dashboard Actual vs Dashboard Ganadora

**Familia:** Refactorización Global · **Gate:** U0.5 → U1 (transición a la Dashboard Ganadora)
**Estado:** `referencia` (análisis de diferencias — sin código)
**Referencia oficial:** **Dashboard Ganadora** = [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md).
**Regla:** **NO se propone eliminar nada.**

---

## 1. Objetivo

Comparar el **Dashboard actual** (código real verificado: `Dashboard.jsx`, `TopNav.jsx`, `App.jsx`)
contra la **Dashboard Ganadora** (diseño oficial), clasificando cada elemento como:

- ✅ **Existe** (ya está y se preserva tal cual)
- ➕ **Falta** (diseñado en la Ganadora, hoy no existe)
- 🔁 **Sobra/reubicar** (existe de forma que contradice la Ganadora; **se realoja/transforma, nunca se borra**)
- 📈 **Ampliar** (existe y la Ganadora lo hace más grande)

---

## 2. Inventario real del Dashboard (verificado en código)

### 2.1. Elementos existentes hoy (`Dashboard.jsx` + `TopNav.jsx` + `App.jsx`)

| Elemento | Origen en código | Estado Ganadora |
|---|---|---|
| Encabezado "Dashboard Científico (Edge)" | `Dashboard.jsx` (h1 neón) | ✅ Existe → **PRESERVAR** |
| Nodos BBB-01/02/03 (roles/datos/status) | `initialNodes` en `Dashboard.jsx` + `TopNav.jsx` (doble definición) | ✅ Existe → **PRESERVAR** (sección Operación) |
| Dot de estado del clúster (TopNav) | `TopNav.jsx` (clusterStatus alert/online) | ✅ Existe → **PRESERVAR** |
| Telemetría V3 (envelope `{context:'telemetry', items[]}`) | `fetchTelemetryEnvelope` → `TELEMETRY_ENDPOINTS` (env + `/api/v3/telemetry/history/`) | ✅ Existe → **PRESERVAR** (sección Telemetría) |
| Gráfica de telemetría + fallback | `GlobalChart` + `defaultChartData` | ✅ Existe → **PRESERVAR** |
| Paneles TelemetryPanel / Telemetry3DScene | `TelemetryPanel.jsx`, `Telemetry3DScene.jsx` | ✅ Existe → **PRESERVAR** |
| LoginModal (gate de acciones auth) | `LoginModal.jsx` + `onRequireAuth` | ✅ Existe → **PRESERVAR** |
| 5 tiles "Integraciones Futuras" | `futureNodes` (RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV) con enlaces externos | 🔁 **Sobra (reubicar)** → entradas del Hardware Catalog (estado `vacío`/`futuro`, enlaces intactos) |
| Logo SIGC&T RURAL + TopNav 4 items | `TopNav.jsx` (`navItems`) | ✅ Existe → **PRESERVAR** (items) / 📈 **Ampliar** (añadir Hardware/Proyectos) |
| Voice Assistant (12 comandos) | `VoiceAssistant.jsx` + `handleNavigation`/`routeMap` en `App.jsx` | ✅ Existe → **PRESERVAR** / 📈 **Ampliar** (comandos nuevos) |
| Ruta `/` → `/dashboard` (redirect) | `App.jsx` | ✅ Existe → **PRESERVAR** |
| Ruta 404 → botón "Volver al Dashboard" | `App.jsx` | ✅ Existe → **PRESERVAR** |
| Banner debug `SYSTEM ONLINE` | `App.jsx` (fixed debug) | 🔁 Existe pero **contradice la Ganadora** → se realoja/decide (NO se borra sin decisión del dueño, PA-02) |

### 2.2. Lo que la Dashboard Ganadora añade (➕ Falta)

| Capacidad diseñada | ¿Existe hoy? | Fase de la migración |
|---|---|---|
| Sección **Operación** (BBB-01/02/03) | Parcial (BBB ya están, pero como bloques sueltos con tiles) | Fase 3 |
| Sección **Telemetría** (panel + gráfica + 3D + V3) | Parcial (componentes sueltos en Dashboard) | Fase 3 |
| Acceso frontal a **Hardware Catalog** (`/hardware-catalog`) | ➕ **Falta** | Fase 2 |
| Entradas de catálogo: ESP32, STM32, Arduino, Raspberry, Jetson, FPGA, MiniPC | ➕ **Falta** (solo tiles parciales: RPI-05/FPGA-X/ARDUINO) | Fase 2 |
| **Persona Selector** (5 personas, Agricultor* gated) | ➕ **Falta** | Fase 4 |
| **Proyectos Reales** (`/proyectos`) | ➕ **Falta** | Fase 5 |
| **Breadcrumb** de la cadena (Conocimiento→…→Proyectos) | ➕ **Falta** | Fase 3 |
| Techos/capacidades por persona (IA canónica) | ➕ **Falta** (solo diseño `NAVIGATION_MODEL`) | Fase 4 |
| Acceso UBTN (bioseñal conceptual) | ➕ **Falta** (diseño U0) | Fase 6 (tras A-7) |
| Estado honesto (`referencia`/`vacío`) para BBB y tiles | 🔁 Parcial (hoy usan `online/alert` simulados) | Fase 3 |

---

## 3. Diagnóstico por categoría

### ✅ Existe (se preserva sin cambios)
Encabezado científico, BBB-01/02/03 + dot TopNav, V3 + fallback, GlobalChart, TelemetryPanel,
Telemetry3DScene, LoginModal, TopNav (4 items + logo), VoiceAssistant (12), redirect `/`, 404,
estilos neón, `initialNodes`/`defaultChartData`.

### 📈 Ampliar (se añade, no se quita)
- `TopNav`: items **+Hardware, +Proyectos**.
- `VoiceAssistant`: **+`hardware`, +`proyectos`** (nunca se reduce); opcionales `telemetry`, `ubtn`.
- `App.jsx`: **+rutas** `/hardware-catalog`, `/proyectos` (aditivas).
- `knowledgeRegistry`: ampliación aditiva (familias UBTN/SIGCTIARURAL → índice).
- `index.css`: clases nuevas aditivas.

### 🔁 Sobra → reubicar/transformar (nunca borrar)
- **5 tiles "Integraciones Futuras"** → entradas del Hardware Catalog (contenido/enlaces intactos).
- **Banner debug `SYSTEM ONLINE`** → decisión del dueño (PA-02); hasta entonces se preserva.
- **Estados `online/alert` simulados** → se rotulan `referencia`/`simulado` (GR-09), el dato se
  conserva.

### ➕ Falta (a crear de forma aditiva)
Hardware Catalog + entrada real de ESP32/STM32/Jetson/MiniPC, Persona Selector, Proyectos, breadcrumb,
vista UBTN conceptual (gated), vista Telemetría dedicada (opcional).

---

## 4. Confirmación de "sin pérdida" (matriz cerrada)

| Requerimiento de la Misión | Dónde sobrevive |
|---|---|
| BBB-01 Gateway | Operación + Hardware Catalog (§ref) + dot TopNav |
| BBB-02 IA Edge | Operación + Hardware Catalog (§ref) |
| BBB-03 Sensores | Operación + Hardware Catalog (§ref) |
| Telemetría Global | Sección Telemetría (panel + gráfica + 3D + V3 + fallback) |
| IA Predictiva | Ruta `/ai-predictive` intacta (eslabón IA) |
| Integraciones Futuras (tiles RPI-05/FPGA-X/ARDUINO/ALEXA/DRONE) | Hardware Catalog: entradas `vacío/futuro` con enlaces intactos |
| Laboratorios | Sección Laboratorios + breadcrumb (rutas intactas) |
| Conocimiento | `/knowledge*` ampliado |
| Hardware | Hardware Catalog (BBB + ESP32/STM32/Arduino/RPi/Jetson/FPGA/MiniPC) |
| Proyectos | `/proyectos` (nueva) + breadcrumb |

---

## 5. Nota de gobernanza

- Nada de esta sección "sobra" se elimina: los tiles y el banner se **realojan** o quedan sujetos a
  decisión explícita. Esto cumple la Regla Suprema **NADA DESAPARECE**.
- Cualquier discrepancia con `DASHBOARD_REIMAGINED_V2` se resuelve **a favor de la Ganadora**
  (referencia oficial), siempre de forma aditiva.

---

## 6. Referencias

- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — Dashboard Ganadora.
- [`SIGCTIARURAL_PAGE_MAPPING.md`](SIGCTIARURAL_PAGE_MAPPING.md) — mapa página a página.
- [`SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md`](SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md) — clasificación.
- [`SIGCTIARURAL_PRESERVATION_AUDIT.md`](SIGCTIARURAL_PRESERVATION_AUDIT.md) — PA-02/PA-08.