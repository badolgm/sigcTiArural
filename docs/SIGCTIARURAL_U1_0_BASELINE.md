# SIGCTIARURAL_U1_0_BASELINE — Baseline de U1.1 (Hardware Catalog)

> **Familia:** Refactorización Global · **Gate:** U1 · **Fase:** U1.0 (baseline pre-implementación)
> **Fecha:** 15 de septiembre 2026 · **Rama:** `feature/ubtn-biological-telemetry`
> **Propósito:** fijar el estado exacto del frontend ANTES de U1.1, el checklist de regresión y el plan de rollback. Solo documentación — **no se escribe código ni se modifican archivos del proyecto.**
> **Hechos del código verificados por lectura:** todas las rutas, componentes y secciones citados fueron confirmados contra `src/frontend`.

---

## 1. Estado exacto actual del Dashboard (`src/frontend/src/pages/Dashboard.jsx`, 247 líneas)

La página `/dashboard` renderiza **6 secciones + 1 modal**, en este orden:

| # | Sección | Contenido verificado | Líneas |
|---|---|---|---|
| 1 | **Encabezado científico** | H1 "🌱 Dashboard Científico (Edge)" + subtítulo "visualización en tiempo real de los 3 Nodos BeagleBone Black RevC" + badge animado **"● SISTEMA OPERATIVO"** (banner debug #2) | 152-171 |
| 2 | **Panel de Telemetría** | `<TelemetryPanel>` con `items`, `sourceMode`, `loading`, `error` — alimentado por `fetchTelemetryEnvelope()` (endpoint `VITE_TELEMETRY_HISTORY_URL` o fallback `/api/v3/telemetry/history/`; valida `context==='telemetry'` e `items[]`) | 39-78, 174-179 |
| 3 | **Infraestructura Activa** | Grid de 3 `ClusterCard` BBB (desde prop `nodes`, con fallback `initialNodes`): **BBB-01** Gateway/MQTT online · **BBB-02** IA Edge/TFLite alerta · **BBB-03** Adquisición/IoT offline | 16-20, 182-189 |
| 4 | **📈 Telemetría Global** | `<GlobalChart>` con datos mapeados (`timestamp→time`, `temperature`, `humidity`, `sensor_id`); estados: loading / error (oculta gráfica) / sin lecturas | 137-146, 191-213 |
| 5 | **🧩 Integraciones Futuras** | Grid de 5 `ClusterCard` desde `futureNodes`: **RPI-05** (🍓), **FPGA-X** (🧩), **ARDUINO-UNO-Q** (⚡), **ALEXA-IOT** (🎙️), **DRONE-NAV** (🛸); todos `status:'construction'`, `banner:'Placeholder de integración'`, con enlaces oficiales (raspberrypi.com, amd.com/yosys, docs.arduino.cc, amazon alexa, px4/ardupilot) | 58-98, 215-227 |
| 6 | **🗞️ Noticias & Enlaces Oficiales** | 5 anclas externas (Arduino Blog, Raspberry Pi News, Alexa News, Google Developers Blog, IEEE Spectrum) | 229-239 |
| — | `<LoginModal>` | Modal de auth (abre vía `onRequireAuth` en acciones de ClusterCard de la sección 3) | 100-105, 241 |

**Otros dos banners de render permanente verificados:**
- Banner global fijo (en `App.jsx:93-98`): **`SYSTEM ONLINE: {location.pathname}`** (debug).
- Badge del encabezado del Dashboard (`Dashboard.jsx:166-170`): **`● SISTEMA OPERATIVO`** (animado).

> **Nota para D-B (banner):** existen **DOS** banners de debug/estado (App global + encabezado Dashboard). Ambos se **preservan intactos en U1.1**; el relabel honesto corresponde a U1.3.

**Datos fuente vivos (no duplicar, no escribir en U1.1):**
- `App.jsx:38-42` estado `nodes` (BBB) + `chartData`, cargados en `useEffect` desde `services/cloud.js` (`fetchClusterNodesReal`, `fetchTelemetrySeriesReal`).
- `Dashboard.jsx:39-54` `fetchTelemetryEnvelope()` (V3) → `telemetryEnvelope`.

## 2. Capturas / páginas que deben verificarse (baseline vs post-U1.1)

| # | Página | Qué verificar en la captura/screenshot |
|---|---|---|
| 1 | `/dashboard` | 6 secciones completas (encabezado con badge, TelemetryPanel, 3 BBB, Telemetría Global, 5 tiles Integraciones Futuras, Noticias) — **píxel a píxel idéntico antes/después** |
| 2 | `/labs` | Catálogo de laboratorios (11 categorías, colores neón) |
| 3 | `/labs/robotics` | Escena 3D (`Telemetry3DScene`, lazy) + HUD de telemetría |
| 4 | `/lab-electronics` | Editor de circuitos (Falstad) funcional |
| 5 | `/ai-predictive` | Página IA predictiva carga sin error |
| 6 | `/data-science` | Página carga sin error |
| 7 | `/knowledge` | Índice del Knowledge Hub resuelve (registry) |
| 8 | `/knowledge/doc/masterdoc` | `docLoader` resuelve el `docId` (da doc) |
| 9 | `/hardware-catalog` | **EN U1.1:** nueva página renderiza (5 tiles copiados + 3 BBB `operativo` + 7 plataformas) y enlaces abren |
| 10 | Cualquier ruta `*` | 404 con botón "Volver al Dashboard" |

**Antes de U1.1 se captura el estado del navegador (Dashboard + `/labs/robotics`) como imagen de referencia.** No se modifica nada; solo se captura.

## 3. Rutas actuales (`src/frontend/src/App.jsx:105-141`) — verificado, 14 rutas

| # | Ruta | Elemento | # | Ruta | Elemento |
|---|---|---|---|---|---|
| 1 | `/` | `<Navigate to="/dashboard" replace />` | 8 | `/advanced-math-v2` | `AdvancedMathLabV2` |
| 2 | `/dashboard` | `Dashboard` | 9 | `/lab-embedded` | `EmbeddedLab` |
| 3 | `/labs` | `LabCatalog` | 10 | `/lab-telecom` | `TelecomLab` |
| 4 | `/ai-predictive` | `AIPredictiva` | 11 | `/lab-electronics` | `ElectronicsLab` |
| 5 | `/data-science` | `DataScienceLab` | 12 | `/knowledge` | `KnowledgeHubLayout` |
| 6 | `/labs/robotics` | `RoboticsLab` | 13 | `/knowledge/doc/:docId` | `KnowledgeHubLayout` |
| 7 | `/advanced-math` | `AdvancedMathLab` | 14 | `*` | Página 404 con botón |

> **Ruta nueva en U1.1 (aditiva, la #15):** `/hardware-catalog` — NO toca ninguna de las 14.

## 4. Componentes actuales (inventario `src/frontend/src/**`) — verificado

- **Componentes (`components/`):** `ClusterCard`, `ErrorBoundary`, `GlobalChart`, `LoginModal`, `Telemetry3DScene`, `TelemetryPanel`, `TopNav`, `VoiceAssistant`, `AuthGuard`.
- **Páginas (`pages/`):** `Dashboard`, `LabCatalog`, `AIPredictiva`, `DataScienceLab`, `Login`, `Register`, `Admin2FA`, y 5 en `pages/_deprecated/`.
- **Laboratorios (`labs/`):** `RoboticsLab`, `EmbeddedLab`, `TelecomLab`, `ElectronicsLab` (+ `electronics/FalstadPanel`), `AdvancedMathLab`, `AdvancedMathLabV2`, `SchematicEditor`.
- **Knowledge Hub (`knowledge-hub/`):** `pages/KnowledgeHubLayout`, `components/MarkdownDocumentView`, `services/docLoader`, `registry/knowledgeRegistry.generated.json`.
- **Auth (`auth/`):** `AuthContext`.
- **Datos:** `data/lab-data.js` (único módulo de datos; patrón para `catalog-data.js`).
- **Servicios:** `services/cloud.js` (BBB + series de telemetría).

> **Observación registrada (sin tocar en U1.1):** `ErrorBoundary` está importado en `App.jsx:4` pero no se usa en el JSX (import sin uso). Se documenta para una futura limpieza; NO se elimina ahora.

## 5. Checklist de regresión (pre-U1.1 = baseline; post-U1.1 = misma lista)

1. [ ] Recorrer las **14 rutas**; ninguna cae en 404 ni pantalla blanca.
2. [ ] `/labs/robotics` renderiza la escena 3D + HUD.
3. [ ] `/dashboard` muestra las **3 BBB** con sus estados correctos (roles Gateway/Analista/Sensor).
4. [ ] `/dashboard` muestra los **5 tiles** de Integraciones Futuras con sus enlaces.
5. [ ] **Telemetría Global**: panel y gráfica en su modo actual (datos oficiales V3 si hay servicio; de lo contrario el estado error/sin lecturas honesto, sin pantalla blanca).
6. [ ] `/knowledge` y `/knowledge/doc/:docId` resuelven (sin `docId` roto).
7. [ ] **Asistente de voz** sigue respondiendo: los comandos del `routeMap` (dashboard, labs, robotics, ai, docs, math, advanced-math-v2, lab-embedded, lab-telecom, lab-electronics, data-lab) navegan.
8. [ ] Banners preservados: `SYSTEM ONLINE: {path}` (App) y `● SISTEMA OPERATIVO` (Dashboard) siguen visibles (no forma parte de U1.1 cambiarlos).
9. [ ] Consola del navegador sin errores nuevos.
10. [ ] **Post-U1.1 adicional:** `/hardware-catalog` renderiza; los 5 enlaces de tiles copiados no dan 404; Dashboard **idéntico** a la captura del baseline (sección 2).

## 6. Plan de rollback (revertir por resta — todo lo de U1.1 es aditivo)

| Paso | Acción | Efecto |
|---|---|---|
| 1 | Borrar `src/frontend/src/data/catalog-data.js` | Elimina la nueva fuente de datos |
| 2 | Borrar `src/frontend/src/pages/HardwareCatalogPage.jsx` | Elimina la nueva vista |
| 3 | Quitar de `App.jsx` el `import` y la línea de ruta `/hardware-catalog` | Restaura las 14 rutas exactas |
| — | **Nada más.** Ningún archivo existente fue alterado en su lógica, por lo que no existe un "estado roto" que reparar | Estado pre-U1.1 idéntico |

Regla de seguridad: si el checklist de regresión (sección 5) falla tras U1.1, se ejecuta este rollback de inmediato y se re-verifica el checklist completo. El snapshot de archivos (`App.jsx`, `Dashboard.jsx`, `TopNav.jsx`, `lab-data.js`, `cloud.js`, `ClusterCard.jsx`, `RoboticsLab.jsx`, `Telemetry3DScene.jsx`) queda copiado fuera del repo en `C:\Users\BagmDev\AppData\Local\Temp\opencode\sigctiarural-u1-snapshot\` como respaldo adicional.

## 7. Archivos que serán tocados en U1.1 (lista COMPLETA y cerrada)

| Archivo | Tipo de cambio | Detalle |
|---|---|---|
| `src/frontend/src/data/catalog-data.js` | **NUEVO** | Copia íntegra de los 5 tiles de `futureNodes` (mismos `id`: RPI-05/FPGA-X/ARDUINO-UNO-Q/ALEXA-IOT/DRONE-NAV, mismos hrefs, `fase` explícita) + copia de lectura de BBB-01/02/03 (`operativo`, sin escribir) + plataformas ESP32/STM32/Arduino/Raspberry/Jetson/FPGA/MiniPC (`fase` honesta, enlaces oficiales, `labs` → rutas existentes). Patrón `lab-data.js`. |
| `src/frontend/src/pages/HardwareCatalogPage.jsx` | **NUEVO** | Vista que solo **lee** `catalog-data.js` (y `lab-data.js`). Sin lógica de telemetría ni escrituras. |
| `src/frontend/src/App.jsx` | Modificación **mínima** | Solo `import` del nuevo componente + **1 `<Route path="/hardware-catalog" ... />`**. |

> Revisión del diff al final: `git status` (sin commit) debe mostrar SOLO estos 2 archivos nuevos + 1 modificación. Si hay cualquier otra entrada en `src/`, es error y se detiene.

## 8. Archivos que NO pueden tocarse en U1.1 (prohibido)

- `pages/Dashboard.jsx` (incluidos `initialNodes`, `futureNodes`, `fetchTelemetryEnvelope`, `LoginModal`, `GlobalChart`, banners del encabezado).
- `components/TopNav.jsx` (nav + estado de cluster), `components/ClusterCard.jsx`, `components/LoginModal.jsx`, `components/GlobalChart.jsx`, `components/TelemetryPanel.jsx`, `components/VoiceAssistant.jsx`, `components/ErrorBoundary.jsx`, `components/AuthGuard.jsx`, `components/Telemetry3DScene.jsx`.
- `labs/*` (todos), `pages/LabCatalog.jsx`, `pages/AIPredictiva.jsx`, `pages/DataScienceLab.jsx`, `pages/Login.jsx`, `pages/Register.jsx`, `pages/Admin2FA.jsx`, `pages/_deprecated/*`.
- `knowledge-hub/*` (incluido `knowledgeRegistry.generated.json` y `docLoader.js`).
- `auth/AuthContext.jsx`, `services/cloud.js`, `data/lab-data.js`, `main.jsx`.
- **`src/backend`**, **`src/embedded`** y los contextos `Telemetry`, `SensorReading`, `RobotTelemetry` (mandato absoluto).
- Rutas existentes de `App.jsx` (las 14): solo se añade la nueva, no se toca ninguna.

## 9. Verificación de que los 7 activos siguen funcionando DESPUÉS de U1.1

| Activo | Ubicación actual (fuente de verdad) | Cómo se verifica tras U1.1 |
|---|---|---|
| **BBB-01 / BBB-02 / BBB-03** | `App.jsx:38-42` (`nodes`) + `Dashboard.jsx:16-20` (`initialNodes`) + `TopNav.jsx:12-16` + `cloud.js:30-32` (payload real) | 1) Grilla "Infraestructura Activa" muestra los 3 con sus estados/roles. 2) Punto de estado del cluster en TopNav refleja alerta (BBB-02). 3) La copia en `catalog-data.js` es de **lectura**: no escribe y no se usa como fuente en Dashboard. **Ninguna de las 4 ubicaciones cambia.** |
| **Telemetría Global** | `Dashboard.jsx:39-54` (`fetchTelemetryEnvelope`), `GlobalChart` | Panel + gráfica siguen consumiendo V3 (o el estado honesto de error/sin lecturas). El catálogo NO toca telemetría. |
| **Laboratorios** | `App.jsx` rutas 6-11, `labs/*` | Las rutas `/labs`, `/labs/robotics`, `/lab-embedded`, `/lab-telecom`, `/lab-electronics`, módulos `/advanced-math*` cargan y 3D de Robótica intacto. |
| **IA Predictiva** | `pages/AIPredictiva.jsx` (ruta `/ai-predictive`) | La ruta carga sin error y sin cambios en su componente. |
| **Integraciones Futuras** | `Dashboard.jsx:58-98` (`futureNodes`) + render en `:222-226` | La sección 5 del Dashboard sigue mostrando los **5 tiles con sus enlaces originales** (nada se mueve en U1.1; solo se **copia** a `catalog-data.js`). Clic en al menos 2 enlaces: sin 404. |
| **Conocimiento / Knowledge Hub** | `knowledge-hub/*`, ruta `/knowledge` | Índice y `/knowledge/doc/:docId` resuelven; no se modifica el registry. |
| **Navegación y voz** | `TopNav.jsx`, `VoiceAssistant.jsx`, `routeMap` de `App.jsx:69-83` | Los 4 enlaces de TopNav y los ~13 comandos de voz del `routeMap` funcionan idénticos. |

**Regla transversal:** en U1.1 el Dashboard y TODOS los consumidores se comportan **exactamente igual** porque nada de lo existente se modifica: `futureNodes`, `nodes`, telemetría y `lab-data.js` quedan intactos; el catálogo es contenido nuevo en ruta nueva.

---

## RESULTADO — Listos para U1.1

# **GO para U1.1 (Hardware Catalog) — sin romper funcionalidad existente.**

**Justificación técnica:** el baseline verificado en código demuestra que U1.1 es **100 % aditivo**:
2 archivos nuevos (`catalog-data.js`, `HardwareCatalogPage.jsx`) + 1 sola línea de ruta en `App.jsx`.
Ninguna de las 14 rutas, de los componentes listados en §4 ni de las 4 fuentes de los BBB cambia.
El rollback (§6) es una resta de 3 pasos sin efectos colaterales, y el checklist (§5) cubre los 7
activos (-§9). La regla NADA DESAPARECE se cumple: **se copia, no se mueve, no se elimina.**

**Condiciones para ejecutar (ya acordadas en sesiones previas):**
1. El dueño mantiene firmadas las 6 decisiones (`SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md` §7), en especial **D-D** (`catalog-data.js` como fuente de verdad).
2. Gate U1 confirmado (Fases 7-8 u override).
3. **Snapshot** de los archivos de §6 copiado **antes** del primer cambio, y **captura** del Dashboard/robótica de §2.
4. Checklist de regresión §5 pasado **antes** (baseline) y **después** (U1.1).

No se escribió código. No se modificó archivo del proyecto. Sin commits ni push. Único documento nuevo: este.

---

## Referencias
- [`SIGCTIARURAL_U1_BOOTSTRAP.md`](SIGCTIARURAL_U1_BOOTSTRAP.md) — plan de ejecución U1.1-U1.4 (archivos, criterios, rollback).
- [`SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md`](SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md) — decisiones D-A..R-13.
- [`SIGCTIARURAL_U1_GO_NO_GO.md`](SIGCTIARURAL_U1_GO_NO_GO.md) — auditoría final del gate.
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — spec de la Dashboard Ganadora (§10/§11).
- Hechos verificados por lectura: `pages/Dashboard.jsx`, `App.jsx`, `components/TopNav.jsx`, `services/cloud.js`, inventario completo de `src/frontend/src/**`.