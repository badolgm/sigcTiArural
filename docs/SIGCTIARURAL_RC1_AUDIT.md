# SIGCTiArural — RC-1 Audit (primer punto de control de la refactorización)

## Misión

RC-1 — Auditar los 9 archivos clave del frontend en `feature/ubtn-biological-telemetry` para determinar si el estado actual puede convertirse en un **Release Candidate** (primer punto de control de la refactorización). Solo auditoría.

## Fecha

2026-09-15

## Regla suprema aplicada

NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA

## Archivos auditados (líneas reales verificadas)

| Archivo | Líneas | Estado sintáxis |
|---|---|---|
| `App.jsx` | 170 | OK |
| `Dashboard.jsx` | 678 | braces 413/413 · parens 135/135 |
| `TopNav.jsx` | 130 | OK |
| `TelemetryPanel.jsx` | 170 | braces 76/76 · parens 42/42 |
| `HardwareCatalogPage.jsx` | 119 | OK |
| `HardwareDetailPage.jsx` | 278 | braces 157/157 · parens 48/48 (pre U3.7) |
| `ProjectsPage.jsx` | 150 | OK |
| `catalog-data.js` | 237 | braces 80/80 · parens 31/31 |
| `projects-data.js` | 120 | OK |

---

# AUDITORÍA (7 puntos)

## 1. Qué está listo para Release Candidate

🟢 **Listo (bajo riesgo):**

| Elemento | Por qué |
|---|---|
| **Hardware Catalog** (`HardwareCatalogPage`) | Página data-driven estable (119 l.), cadena de contexto, ClusterCard + ficha, enlaces a labs/knowledge, "Ver ficha" a detalle. Sin dependencias inestables. |
| **Hardware Detail** (`HardwareDetailPage`) | 12 campos del registro, subsección BBB honesta, Learning Layer tipado, barra de ecosistema. Cero lógica inventada. |
| **Projects** (`ProjectsPage`) | Cards data-driven desde `projects-data.js`, estados honestos (operativo/diseño/marco), conexión con knowledge/labs/hardware. |
| **Catálogos** (`catalog-data.js`, `projects-data.js`) | Source of truth con vocabulario honesto; `resources[]` reales en 5 plataformas. Estables y coherentes con Hardware Registry y Learning Layer. |
| **Navegación global** (`TopNav`) | 6 accesos reales, móvil + desktop, estado de clúster. Funcionalmente estable (deuda menor de estilo). |

## 2. Qué sigue experimental

🟠

| Elemento | Por qué experimental |
|---|---|
| **Dashboard.jsx (678 líneas)** | Crece con cada misión; bloques 4-6 en acordeón (U3.6), franja hardware (U3.7); funcional pero **es el componente con mayor superficie de cambio** → aún no estable para RC |
| **Learning Layer en detalle (resources[])** | Funciona de forma tipada pero **solo 5/10 plataformas tienen datos**; las otras muestran "Pendiente de integración" (honesto, pero incompleto) |
| **TelemetryPanel rediseñado (U3.7)** | Visualmente nuevo, no validado en runtime local (bloqueo React 18/drei) — requiere prueba manual |
| **Mini sparklines SVG** | Nuevas en U3.7, sin pruebas visuales previas |
| **RBAC/LoginModal** | Presente pero no auditado en profundidad en estas misiones (AuthGuard, Admin2FA) |

## 3. Qué debe probar Bernardo manualmente

| # | Prueba | Archivo |
|---|---|---|
| 1 | **Dashboard pleno**: Mapa (Grupos A/B/C), KPIs, Estado, franja "🔌 Hardware conectado" (desplegar acordeón) | Dashboard |
| 2 | **Telemetría en Tiempo Real**: tiles compactos + sparklines + chips fuente/estado; comportamiento con telemetría LIVE vs sin datos | TelemetryPanel |
| 3 | **Acordeones 3-6** (Hardware conectado / Telemetría Global / Integraciones / Noticias): abrir/cerrar sin romper layout | Dashboard |
| 4 | **Catálogo → ficha**: click en tarjeta → `/hardware/:id` → barra de ecosistema → "Ver ficha" | Catalog/Detail |
| 5 | **Ficha con resources** (BBB, ESP32, STM32, Arduino, Raspberry) vs **sin resources** (Jetson, FPGA, MiniPC, Custom) → "Pendiente de integración" | Detail |
| 6 | **Projects**: 7 cards, estados honestos, enlaces cruzados | Projects |
| 7 | **Navegación**: TopNav desktop + móvil, sidebar Dashboard, cadena en cada página | Global |
| 8 | **Mobile**: checkpoints 375px, 768px, 1280px (grids y acordeones) | Global |

## 4. Bugs potenciales

| # | Severidad | Descripción |
|---|---|---|
| 1 | 🟠 Media | **`onRequireAuth` muerto en Dashboard**: tras U3.7 ya no se pasa a ningún `ClusterCard`; permanece definido (L137) sin uso. Inofensivo pero señal de código huérfano. |
| 2 | 🟡 Baja | **Clases Tailwind interpoladas en `TopNav`** (`text-[${...}]`, `shadow-[0_0_10px_${...}]`): JIT NO las compila en runtime → sin efecto visual; solo el `style` inline funciona. |
| 3 | 🟡 Baja | **Triple navegación**: TopNav + Sidebar Dashboard (bloque 0) + barra DEBUG fija de `App.jsx` → redundancia y ruido en producción. |
| 4 | 🟡 Baja | **`initialNodes` duplicado** en `App.jsx`, `Dashboard.jsx` y `TopNav.jsx` (3 fuentes del mismo clúster) → riesgo de divergencia en estados. |
| 5 | 🟠 Media | **HardwareCatalog bloque "Proyectos conectados"**: los chips (`SIGCTiArural`, `UBTN`, `Agricultura IA`) son **hardcodeados en la página** y apuntan todos a `/proyectos`, no son data-driven del catálogo → candidato a consolidación. |
| 6 | 🟡 Baja | **`GlobalChart` fallback** con `temp:0, humidity:0` si no llegan datos → línea plana engañosa al inicio (UID honesto, pero visualmente extraño). |
| 7 | 🟠 Media | **Runtime local NO verificable** (React 18 vs fiber/drei, sin `node_modules`): todo el JSX nuevo (sparklines, acordeones, chips) **no ha sido compilado/ejecutado** → validación solo estática. |
| 8 | 🟡 Baja | **Ruta `/knowledge/doc/:docId`** comparte el mismo layout para lista y detalle (sin diferenciación clara de contexto). |

## 5. Qué sigue siendo "Dashboard BBB antigua"

| Bloque | Evidencia |
|---|---|
| **Bloque 4 — "📈 Operación — Telemetría Global"** | Título con "Operación —" y acordeón estilo panel heredado; aunque compactado, conserva el lenguaje de la etapa pre-Ganadora (métrica no es una tasa/seg) |
| **Bloque 5 — "🧩 Operación — Integraciones Futuras"** | Mismo prefijo "Operación —" + tarjetas ClusterCard que **duplican el Roadmap del Mapa (Grupo C)** |
| **Bloque 6 — "🗞️ Noticias"** | Enlaces planos (Arduino/RPi/Alexa/Google/IEEE) sin contexto de ecosistema; fuera de la spec Ganadora |
| **TopNav heredado** | Sigue siendo "barra superior monolítica" (la Ganadora pide Header con Estado/Perfil/Notificaciones + sidebar real) |

## 6. Qué ya parece Dashboard Ganadora

| Elemento | Evidencia |
|---|---|
| **1b Mapa de Dispositivos (U3.5)** | 3 zonas (Nodos Operativos / Hardware Disponible / Roadmap), leyenda, accesos directos → corazón de la vista de ecosistema |
| **1c KPIs (U3.3 estratégico)** | 7 métricas ejecutivas honestas (Dispositivos, Lecturas, Alertas, Proyectos, Plataformas, Conocimiento, Fuente) |
| **1g Panel Estado del Sistema (U3.3)** | CPU/RAM/Red/Almacenamiento honestos + indicadores de ecosistema — pieza diferencial Ganadora |
| **1e Acceso Rápido Labs** | 7 tiles con acento por lab — coincide con la Ganadora |
| **1f Actividad reciente** | Feed de estado con puntos de color |
| **🔌 Hardware conectado (U3.7)** | Franja de chips BBB + plataformas navegables a `/hardware/:id` — elemento EXPLÍCITO de la spec Ganadora que ya está implementado |
| **Telemetría compacta (U3.7)** | Tiles compactos + mini tendencias → lectura ejecutiva |
| **Cadena de contexto en páginas** | Projects/Hardware Catalog/Detail con CHAIN_LINKS → ecosistema percibido como UNO |

## 7. Qué consolidar

| Prioridad | Consolidación |
|---|---|
| 🔴 Alta | **Unificar navegación**: TopNav.navItems + Dashboard.NAV_SIDEBAR + routeMap (App) → un solo `nav-data.js` consumido por los 3 |
| 🔴 Alta | **Unificar origen del clúster BBB**: `initialNodes` (3 fuentes) → catálogo/store único |
| 🟠 Media | **Bloques 5 y 6** → folder bajo el Mapa (los datos ya viven en Roadmap/Noticias) para liberar altura, SIN eliminar |
| 🟠 Media | **HardwareCatalog "Proyectos conectados"** → derivar de `projects-data.js` (hardware FK) en vez de chips hardcodeados |
| 🟡 Baja | **`NEON_COLORS` duplicado** en Dashboard, TopNav, GlobalChart, TelemetryPanel, lab-data → un único módulo de tema |
| 🟡 Baja | **Eliminar barra DEBUG** de producción (App.jsx L99-103) |

---

# RESULTADO

## ✅ GO CON CONDICIONES

**Sí se puede generar el primer punto de control de la refactorización**, con estas condiciones:

### Condiciones de GO (bloqueantes leves)
1. **Validación manual de Bernardo** de la lista del punto 3 antes de considerarlo RC final (especialmente telemetría, acordeones y móvil).
2. **No incluir los puntos 🟠 del punto 4 como ignorados**: `onRequireAuth` muerto y los chips hardcodeados de HardwareCatalog deben resolverse en la próxima iteración de consolidación (punto 7).
3. El **runtime local sigue bloqueado** (React 18 vs drei sin `node_modules`); la única señal de ejecución válida hoy es Docker `localhost:5173` (referencia estable) — el RC se valida contra esa referencia de forma manual.

### Qué entra al RC-1 tal cual
- Hardware Catalog, Hardware Detail, Projects, catálogos de datos, chain links, KPIs, Mapa, Estado del Sistema, franja Hardware conectado, telemetría compacta (visual).

### Qué NO entra aún como "cerrado"
- Dashboard como componente estable (sigue en evolución activa), Learning Layer para las 5 plataformas sin `resources[]`, y el Header Ganadora completo (TopNav) — pospuesto deliberadamente.

### Deuda registrada para la siguiente fase
- Navegación triple, triplicación de `initialNodes`, bloques 5-6 duplicando el Mapa, clases Tailwind interpoladas, barra DEBUG, `NEON_COLORS` duplicado, `GlobalChart` fallback a 0.

## Rollback

Sin cambios de código en esta misión — auditoría únicamente.

## git status

- Nuevo: `docs/SIGCTIARURAL_RC1_AUDIT.md`
- 0 archivos de código modificados por esta misión.