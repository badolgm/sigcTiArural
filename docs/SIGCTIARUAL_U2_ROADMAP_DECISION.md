# SIGCTiArural — Auditoría de Madurez U2 (Roadmap Decision)

> **Estado:** U2.2 Review Final. Solo auditoría. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** U1.1→U1.8 + U2 + U2.2 sobre los 6 archivos: `Dashboard.jsx`, `TopNav.jsx`, `HardwareCatalogPage.jsx`, `ProjectsPage.jsx`, `catalog-data.js`, `projects-data.js`.
> **Contraste:** `SIGCTIARUAL_DESIGN_PARITY_AUDIT.md`, `SIGCTIARUAL_U2_1_EXECUTIVE_LAYER.md`, Designer.png/jpg.

---

## Resumen ejecutivo

El trabajo U1/U2 construyó **3 capas de valor real**: (1) un modelo de datos del ecosistema (`catalog-data.js`, `projects-data.js`), (2) dos páginas independientes y coherentes (Hardware Catalog, Proyectos) conectadas por cadenas de navegación, y (3) un Dashboard Ejecutivo (U2) + Acceso Rápido a Labs (U2.2) que enmarca todo como "Capacidades". El peligro principal detectado es **sobre-navegación** (6 vías para llegar a lo mismo) y **una pieza experimental hardcodeada** (bloque "Proyectos que conectan con este hardware").

---

## Pregunta 1 — ¿Qué hemos construido que aporta valor real?

| # | Activo | Valor real | Madurez |
|---|---|---|---|
| 1 | `catalog-data.js` — modelo de 10 plataformas (id, role, status, fase, vendor, descripción, protocols, labs, knowledge, links, data) | **ALTO** — fuente única y honesta de hardware; reutilizable por cualquier módulo futuro (incluye el Mapa U2.3) | Alta |
| 2 | `projects-data.js` — 7 proyectos con estados honestos (operativo/diseño) + enlaces knowledge/labs/hardware reales verificados contra registry | **ALTO** — modelo de trazabilidad Proyectos↔Conocimiento↔Labs↔Hardware | Alta |
| 3 | `HardwareCatalogPage.jsx` — página completa: cadena, descripciones, fabricante, protocolos, oficial, labs, knowledge, estado honesto | **ALTO** — página autónoma entregable | Alta |
| 4 | `ProjectsPage.jsx` — grid de 7 proyectos con 4 bloques de enlaces + estado honesto | **ALTO** — entrega la promesa "Proyectos" de la Ganadora | Alta |
| 5 | `Dashboard.jsx` (U2) — sidebar ejecutiva, 5 KPIs reales, Estado del sistema honesto, Actividad reciente, 5 tarjetas de capacidades | **ALTO** — es el corazón de la experiencia Ganadora | Media-Alta (mezclado con legado) |
| 6 | `Dashboard.jsx` (U1.5/U1.6) — Capacidades del Ecosistema + rejerarquización Capacidades/Operación | **ALTO** — define la primera impresión según filosofia "no BBB-céntrica" | Media-Alta |
| 7 | `TopNav.jsx` — 6 items con ruta `/proyectos` + highlight activo | **ALTO** — navegación global funcional | Alta |
| 8 | `Dashboard.jsx` (U2.2) — Acceso Rápido a Labs (7 tiles) | **MEDIO-ALTO** — cierra gap #7 de Ganadora | Media (ver P2) |
| 9 | `App.jsx` routeMap voz + rutas (`/hardware-catalog`, `/proyectos`) | **ALTO** — infraestructura de navegación | Alta |
| 10 | U1.3 badge "SYSTEM DEBUG" | **BAJO** — útil para dev, irrelevante para UX | Baja (experimental) |

**Conclusión P1:** El mayor valor está en los **modelos de datos** (`catalog-data.js`, `projects-data.js`) y en las **2 páginas autónomas**. Son activos independientes, verificables y portables.

---

## Pregunta 2 — ¿Qué cambios podrían revertirse sin perder valor?

| Cambio | ¿Revertible sin pérdida? | Observación |
|---|---|---|
| **Bloque "📋 Proyectos que conectan con este hardware"** en `HardwareCatalogPage.jsx` (L49-66) | ✅ **Sí** — es 100% hardcodeado (SIGCTiArural, UBTN, Agricultura IA fijos) y todos sus links apuntan a `/proyectos` (no a fichas reales). No deriva de `ecosystemProjects`. Valor decorativo | Debe **reconstruirse derivando de datos** si se quiere mantener (ver P6) |
| **U1.3 badge "SYSTEM DEBUG · ruta"** en `App.jsx` (L97-102) | ✅ **Sí** — overlay de debug para desarrollador, no aporta a la UX Ganadora | Ocultable detrás de `import.meta.env.DEV` |
| **`LAB_QUICK_ACCESS` item "💻 Programación → /labs"** (Dashboard L41) | ⚠️ Parcial — el tile es valioso pero su destino es genérico (`/labs`), no un lab específico. Revertir solo ese tile no pierde el resto | Ver P6 |
| **Duplicación visual `futureNodes` (Dashboard) vs catálogo** (Raspberry/FPGA/Arduino en ambas) | ⚠️ Parcial — eliminar el bloque "Integraciones Futuras" sería perder código original prohibido; pero **no se pierde valor real** porque los 3 duplicados ya viven en `catalog-data.js` (RASPBERRY-PI, FPGA, ARDUINO) | No revertir por regla suprema |
| **U1.1→U1.8 y U2 en general** | ❌ No — el valor está en la infraestructura de navegación + datos + páginas | Conservar |

**Conclusión P2:** El único candidato claro a reversión **sin pérdida de valor real** es el bloque de "Proyectos que conectan" hardcodeado (y el badge debug). Todo lo demás aporta o está anclado a la regla suprema.

---

## Pregunta 3 — ¿Qué elementos están realmente maduros?

| Elemento | Criterio de madurez |
|---|---|
| **`catalog-data.js`** | Estructura uniforme (10/10 entradas con mismos campos), estados honestos (`reference`/`construction`), enlaces reales verificados, sin lógica acoplada. **Listo para producción.** |
| **`projects-data.js`** | 7/7 proyectos con docIds verificados contra `knowledgeRegistry.generated.json`, vocabulario honesto operativo/diseño. **Listo.** |
| **`HardwareCatalogPage.jsx`** | Página independiente, sin props externas, defensiva (`?.` en knowledge), coherente con paleta. **Lista.** |
| **`ProjectsPage.jsx`** | Independiente, defensiva (usa `?.length > 0`), coherente. **Lista.** |
| **`TopNav.jsx`** | 6 items, highlight por `startsWith`, móvil funcional. **Listo.** |
| **Rutas en `App.jsx`** | 16 rutas reales + 404 + redirección raíz. **Listas.** |

**Conclusión P3:** Los **modelos de datos y las 2 páginas autónomas** son los elementos maduros. Soportan un merge/port sin fricción.

---

## Pregunta 4 — ¿Qué elementos siguen siendo experimentales?

| Elemento | Por qué es experimental |
|---|---|
| **Dashboard Ejecutivo (U2)** | Mezcla código legado (Clúster BBB, Integraciones Futuras) con capa nueva (sidebar, KPIs, cards) en un mismo archivo de 464 líneas. Funcional, pero su arquitectura aún no está "estable" (depende de datos simulados + fetch V3). |
| **Cadenas de navegación `CHAIN_LINKS`** | Hardcodeadas y duplicadas en 2 páginas (HardwareCatalog, Projects). El Dashboard **no tiene cadena** → inconsistencia (ver P6). |
| **`LAB_QUICK_ACCESS` (U2.2)** | Tile "Programación → /labs" es genérico; los otros 6 son precisos. El bloque es nuevo sin pruebas de usuario. |
| **Bloque "Proyectos que conectan" (hardcoded)** | No derivado de datos → experimental por diseño (ver P2). |
| **`futureNodes` vs `hardwareCatalogEntries`** | Fuentes duplicadas para Raspberry/FPGA/Arduino. No consolidadas. |
| **Integracion Telemetría V3** | Depende de endpoints externos (`import.meta.env.VITE_TELEMETRY_HISTORY_URL`, `/api/v3/...`). Fallback a datos simulados sin indicador claro de cuál se usa dentro del Mapa futuro. |

**Conclusión P4:** Lo experimental es la **integración del Dashboard** (mezcla legado+nuevo en 1 archivo), frente a lo maduro (datos + páginas autónomas).

---

## Pregunta 5 — Si mañana hubiera un merge parcial: ¿qué archivos serían candidatos?

**Prioridad de merge (menor riesgo → mayor riesgo):**

| Orden | Archivo | Estado | Riesgo de merge | Razón |
|---|---|---|---|---|
| 1 | `src/frontend/src/data/catalog-data.js` | NUEVO | **Mínimo** | Datos puros, sin imports, sin lógica |
| 2 | `src/frontend/src/data/projects-data.js` | NUEVO | **Mínimo** | Datos puros, sin imports |
| 3 | `src/frontend/src/pages/HardwareCatalogPage.jsx` | NUEVO | **Mínimo** | Independiente; importa catálogo + `lab-data.js` (ya existente) |
| 4 | `src/frontend/src/pages/ProjectsPage.jsx` | NUEVO | **Mínimo** | Independiente; importa projects-data + lab-data |
| 5 | `src/frontend/src/components/TopNav.jsx` | MODIFICADO | **Bajo** | +1 item ("Proyectos") + ruta `/proyectos`; lógica intacta |
| 6 | `src/frontend/src/App.jsx` | MODIFICADO | **Bajo-Medio** | +routeMap (proyectos/`/proyectos`, `/hardware-catalog`) + import + 2 rutas. El badge debug (L97) es el único aditivo no requerido, trivial de excluir |
| 7 | `src/frontend/src/pages/Dashboard.jsx` | MODIFICADO | **Medio-Alto** | Mismo archivo carga legado (TelemetryPanel, ClusterCard, futureNodes, LoginModal) + U2 + U2.2. Un merge requiere diff fino |

**Conclusión P5:** Un merge parcial **seguro** sería capas 1→5 (datos + 2 páginas + TopNav). El `App.jsx` es 90% seguro (excluir solo el badge debug). `Dashboard.jsx` **no es candidato para merge automático** — requiere revisión manual del diff para no arrastrar conflictos con el legado.

---

## Pregunta 6 — ¿La experiencia de usuario ya es coherente?

**Visualmente: SÍ.** Los 6 archivos comparten la misma paleta (`NEON_COLORS`), fondos `bg-gray-900`, bordes neon, hover glow y tipografía. Un usuario percibe un solo universo visual.

**Navegacionalmente: NO del todo.** Hay **6 vías de navegación coexistiendo**:
1. `TopNav` (global, superior)
2. Sidebar `NAV_SIDEBAR` (Dashboard)
3. `CAPABILITY_CARDS` (Dashboard)
4. `ECOSYSTEM_LINKS` (cadena Dashboard)
5. `LAB_QUICK_ACCESS` (tiles labs Dashboard)
6. `CHAIN_LINKS` (breadcrumb solo en HardwareCatalog + Projects)

**Incoherencias concretas:**
- `CHAIN_LINKS` existe en 2 páginas pero **no en el Dashboard** (donde nace la cadena).
- El breadcrumb de HardwareCatalog **no coincide** con el mapa de voz de conversation (dice "Dashboard→Proyectos→Hardware→Conocimiento→Labs", el Dashboard dice "Conocimiento→Labs→Hardware→Telemetría→IA→Proyectos").
- El bloque "Proyectos que conectan" muestra 3 proyectos hardcodeados mientras `ecosystemProjects` tiene `hardware` por proyecto — hay datos reales sin usar.

**Veredicto:** UX visual coherente, pero **la navegación está sobre-poblada y no unificada** → genera redundancia (P7) y una pequeña fricción (qué uso).

---

## Pregunta 7 — ¿Existe sobreingeniería?

**Sí, en navegación.** Evidencia:
- 6 vías de navegación al mismo destino (ej. `/labs` está en: TopNav, sidebar, capability card, ecosystem link, quick-access tile, breadcrumb).
- `CHAIN_LINKS` y `ECOSYSTEM_LINKS` son **dos conceptos de cadena** con orden diferente.
- El bloque "Proyectos que conectan" es **display sin lógica** (no lee `ecosystemProjects[].hardware`), o sea "sobre-código" manual donde ya existía un modelo.

**No hay sobreingeniería** en los datos (los modelos son simples), ni en las 2 páginas (sencillas, declarativas).

**Guía:** la #5 es el caso a no repetir. El Mapa de Dispositivos (U2.3) **no debe** añadir una 7ª vía de navegación; debe ser una **vista**, no otro menú.

---

## Pregunta 8 — ¿Cuál es el siguiente cambio con mejor ROI?

**Respuesta: Implementar el Mapa de Dispositivos (diseño U2.3 ya aprobado).**

| Criterio | Evaluación |
|---|---|
| Alineación con Designer.png | **Exacta** — es el elemento visual #1 ausente (audit: 0%, gap de mayor impacto) |
| Datos disponibles | **100%** — `nodes`, `hardwareCatalogEntries`, `futureNodes`, `telemetryItems` ya en el Dashboard (sin backend) |
| Riesgo | **Bajo** — módulo de lectura, aditivo, 1 archivo (`Dashboard.jsx`), rollback instantáneo |
| ROI visual | **Alto** — unifica 17 dispositivos bajo una vista, oxígeno visual, ataca el 40% de parity visual |
| Costo | Medio (80-100 líneas JSX) |

**Alternativa complementaria (mismo ROI, menor costo):** derivar el bloque "Proyectos que conectan" desde `ecosystemProjects[].hardware` en vez de hardcodear — 10 líneas, convierten un componente experimental en maduro.

**NO recomendado todavía:** header (logo/perfil/notificaciones), selector de persona, IA en Dashboard, rutas nuevas — requieren datos/auth no existentes (P4, prohibidos o sin base).

---

## Recomendación Final

### GO — para el siguiente paso U2.4: Implementar Mapa de Dispositivos (según spec `SIGCTIARUAL_U2_3_DEVICE_MAP.md`)

**Justificación del GO:**
1. Es el gap #1 contra Designer.png (parity visual 40% → el Mapa aporta el mayor salto).
2. Tiene datos 100% disponibles, riesgo bajo, rollback instantáneo, cero backend.
3. Cierra también la incoherencia de "6 vías" al darle **una vista** al hardware (sin añadir un 7º menú).

**Guardarraíl obligatorio al implementar:**
- El Mapa es **vista** (render por estado), no navegación (no agregar otro conjunto de links de menú al mismo nivel de TopNav/sidebar).
- Reemplazar el bloque hardcodeado "Proyectos que conectan" por derivación de `ecosystemProjects` en la misma misión (mejora P2/P6/P7 de una vez).

---

## Anexo: Estado de los 6 archivos (line counts)

| Archivo | Líneas | Estado git |
|---|---|---|
| `src/frontend/src/pages/Dashboard.jsx` | 464 | Modificado (U1.5/1.6/U2/U2.2) |
| `src/frontend/src/components/TopNav.jsx` | 130 | Modificado (U1.2/U1.7) |
| `src/frontend/src/pages/HardwareCatalogPage.jsx` | 116 | Nuevo (U1.1) |
| `src/frontend/src/pages/ProjectsPage.jsx` | 150 | Nuevo (U1.7) |
| `src/frontend/src/data/catalog-data.js` | 209 | Nuevo (U1.1) |
| `src/frontend/src/data/projects-data.js` | 120 | Nuevo (U1.7) |