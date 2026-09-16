# SIGCTiArural — Auditoría de Navegación UX-03

> **Estado:** UX-03. Auditoría read-only. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** Sidebar izquierda (`NAV_SIDEBAR`), `TopNav`, `Dashboard.jsx`, `HardwareCatalogPage.jsx`, `ProjectsPage.jsx`.
> **Propósito:** decidir GO/NO GO para eliminar el bloque "🧭 Capacidades del Ecosistema".

---

## 0. Inventario de navegación actual

### A — Sidebar izquierda (`NAV_SIDEBAR`, Dashboard.jsx L11-18)
| # | Ítem | Destino |
|---|---|---|
| 1 | 🏠 Dashboard | `/dashboard` |
| 2 | 📋 Proyectos | `/proyectos` |
| 3 | 🛒 Hardware | `/hardware-catalog` |
| 4 | 📚 Conocimiento | `/knowledge` |
| 5 | 🧬 Laboratorios | `/labs` |
| 6 | 🧠 IA Predictiva | `/ai-predictive` |

### B — TopNav (global, 6 ítems)
Dashboard → `/dashboard` · Laboratorios → `/labs` · Hardware → `/hardware-catalog` · IA Predictiva → `/ai-predictive` · Proyectos → `/proyectos` · Conocimiento → `/knowledge`

### C — Tarjetas de Capacidades `CAPABILITY_CARDS` (Dashboard.jsx L20-26)
Proyectos · Hardware · Laboratorios · IA Predictiva · Conocimiento → mismos destinos que sidebar.

### D — Laboratorios Acceso Rápido (U2.2) `LAB_QUICK_ACCESS`
7 tiles → `/lab-electronics`, `/lab-telecom`, `/labs`, `/ai-predictive`, `/labs/robotics`, `/lab-embedded`, `/data-science`.

### E — Mapa de Dispositivos (U2.4)
BBB → `/dashboard` · Catálogo → `/hardware-catalog` · Roadmap → `/hardware-catalog`.

### F — Bloque EN AUDITORÍA: "🧭 Capacidades del Ecosistema" (`ECOSYSTEM_LINKS`, L28-35; JSX L268-290)
| Destino dentro del bloque | Label |
|---|---|
| `/knowledge` | Conocimiento |
| `/labs` | Laboratorios |
| `/hardware-catalog` | Hardware |
| `/dashboard` | Telemetría (en vivo) |
| `/ai-predictive` | IA |
| `/knowledge/doc/masterdoc` | Proyectos (docs) |

---

## Pregunta 1 — ¿Todo lo que representa el bloque ya existe en la navegación?

| Destino del bloque F | ¿Existe en otra navegación? | Dónde |
|---|---|---|
| `/knowledge` | ✅ SÍ | Sidebar (A-4) · TopNav (B) · CAPABILITY_CARDS (C) |
| `/labs` | ✅ SÍ | Sidebar (A-5) · TopNav (B) · CAPABILITY_CARDS (C) · LAB_QUICK_ACCESS (D) |
| `/hardware-catalog` | ✅ SÍ | Sidebar (A-3) · TopNav (B) · CAPABILITY_CARDS (C) · Mapa (E) |
| `/dashboard` | ✅ SÍ (label distinto) | Sidebar (A-1 "Dashboard") · TopNav (B "Dashboard") |
| `/ai-predictive` | ✅ SÍ | Sidebar (A-6) · TopNav (B) · CAPABILITY_CARDS (C) · LAB_QUICK_ACCESS (D) |
| `/knowledge/doc/masterdoc` | ⚠️ PARCIAL | No hay item de menú directo. Se llega vía `/proyectos` → Proyecto SIGCTiArural → MASTERDOC (2 clics) y por voz `'docs'` en `routeMap` |

**5 de 6 destinos existen plenamente.** El único enlace único es `masterdoc`, y NO queda huérfano (accesible desde ProjectsPage y voz).

---

## Pregunta 2 — ¿Qué funciones perderíamos si se elimina?

### Funciones NAVEGACIONALES perdidas:
1. **Acceso directo en 1 clic al MASTERDOC** (`/knowledge/doc/masterdoc`) — pasa de 1 clic a 2 clics (`/proyectos` → SIGCTiArural → MASTERDOC).
2. **Label semántico "Telemetría (en vivo)"** como item de navegación — es un **auto-enlace** (`→ /dashboard` = página actual). Al estar parado en el Dashboard, el enlace no navega a ningún sitio nuevo. Pérdida casi nula: la Telemetría en vivo sigue visible en el propio Dashboard (TelemetryPanel + GlobalChart "📈 Operación — Telemetría Global").

### Funciones que NO se pierden:
- Conocimiento, Laboratorios, Hardware, IA: **duplicadas** por sidebar + TopNav + cards (P4).
- La **narrativa de cadena** (Conocimiento → Labs → Hardware → Protocolos → Telemetría → IA → Proyectos): persiste textualmente en el subtítulo del H1 (L258) del propio Dashboard.

*Matiz:* tras U2, el bloque F es **anterior a** la sidebar ejecutiva. La sidebar + CAPABILITY_CARDS (C) lo subsumen.

---

## Pregunta 3 — ¿Qué elementos quedarían huérfanos?

**Ninguno.**

- `/knowledge/doc/masterdoc` → **NO huérfano**: ProjectsPage (Proyecto SIGCTiArural → 📚 MASTERDOC, `projects-data.js` L16) + voz `'docs'`.
- `/dashboard`, `/labs`, `/knowledge`, `/hardware-catalog`, `/ai-predictive` → todos con presencia en ≥2 navegaciones.
- La identidad "Capacidades del Ecosistema" **no desaparece**: sigue en el H1 (L255) y en las tarjetas de capacidades (C).

---

## Pregunta 4 — ¿Qué elementos están duplicados?

| Destino | Sidebar | TopNav | Cards (C) | Labs Rápido (D) | Mapa (E) | Bloque F |
|---|---|---|---|---|---|---|
| `/dashboard` | ✅ | ✅ | — | — | ✅ (BBB) | ✅ |
| `/hardware-catalog` | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| `/knowledge` | ✅ | ✅ | ✅ | — | — | ✅ |
| `/labs` | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| `/ai-predictive` | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| `/proyectos` | ✅ | ✅ | ✅ | — | — | — (solo docs) |
| `/knowledge/doc/masterdoc` | — | — | — | — | — | **único** |

**Conclusión:** el bloque F duplica **5 de sus 6** destinos. Solo aporta 1 destino "único" (masterdoc), que igualmente existe en ProjectsPage. Es el **bloque con mayor redundancia** del Dashboard (aporta el caso 5/6 de duplicación crítica detectado en `SIGCTIARUAL_U2_ROADMAP_DECISION.md` P6/P7).

---

## Pregunta 5 — ¿La Sidebar ya sustituye completamente el bloque Capacidades?

**Casi, con 2 matices:**

| Matiz | Detalle |
|---|---|
| 1. Label "Telemetría (en vivo)" | La sidebar no tiene item "Telemetría"; su "Dashboard" lleva al mismo lugar. El label se pierde, pero es un auto-enlace sin valor de navegación (self-link). |
| 2. Enlace único a MASTERDOC | La sidebar NO apunta a `/knowledge/doc/masterdoc`; se cubre vía `/proyectos` (2 clics) y voz. |

**Veredicto funcional:** la sidebar + ProjectsPage **sí sustituyen** la navegación del bloque F en su totalidad (6/6 destinos alcanzables sin él). La substitución es **navegacional completa**; lo que se pierde es únicamente un *atajo* y un *label decorativo*.

---

## Pregunta 6 — VEREDICTO: **GO PARA ELIMINACIÓN**

**Justificación:**
1. **Redundancia crítica:** 5/6 destinos del bloque ya viven en sidebar + TopNav + tarjetas (P4). El bloque F es hoy el eslabón duplicado que infla la "sobre-navegación" detectada en la auditoría de madurez (`SIGCTIARUAL_U2_ROADMAP_DECISION.md` P6/P7: 6 vías al mismo lugar).
2. **Cero huérfanos:** ningún destino se pierde (P3).
3. **Auto-enlace sin valor:** "Telemetría (en vivo) → /dashboard" no navega a ningún lugar nuevo estando en el Dashboard.
4. **La identidad persiste:** H1 "Capacidades del Ecosistema" + tarjetas de capacidades (C) + Mapa (E) + Acceso Labs (D) conservan la filosofía "no BBB-céntrica".
5. **Precedencia visual:** la ganadora (Designer.png) prioriza sidebar + mapa + KPIs; el bloque informativo-breadcrumb duplicado no figura como bloque de primer nivel.
6. **Regla suprema respetada:** nada *funcional* desaparece. Solo se retira un bloque informativo cuyas conexiones ya están preservadas en 4 navegaciones coexistentes.

---

## Pregunta 7 — Si GO: qué eliminar exactamente

### Dentro de `src/frontend/src/pages/Dashboard.jsx`:

**a) CONSTANTE `ECOSYSTEM_LINKS`** — L28-35 (completa):
```
const ECOSYSTEM_LINKS = [ ... ];   // 6 entradas
```
Verificado: solo se usa en el bloque 1b (L277). No hay otros consumidores (grep: 2 matches, ambos en bloque F).

**b) BLOQUE JSX 1b** — RANGO EXACTO: de `{/* 1b. CAPACIDADES — bloque informativo aditivo (cadena del ecosistema) */}` (L268) hasta el `</div>` de cierre (L290), inclusive:
```
268:  {/* 1b. CAPACIDADES — bloque informativo aditivo (cadena del ecosistema) */}
269:  <div className="mb-8 p-6 ... NEON_COLORS.primary40 }}>       ← incluir
...
290:  </div>                                                          ← incluir (este cierre)
291:  (blank line)
292:  {/* 1c. KPIs EJECUTIVOS ... */}                                 ← NO tocar
```

**c) NO ELIMINAR:**
- H1 header (L250-266): conserva "🌱 SIGC&T Rural — Capacidades del Ecosistema" + subtítulo de cadena (L258) → mantiene la identidad.
- Sidebar (A), CAPABILITY_CARDS (C), LAB_QUICK_ACCESS (D), Mapa de dispositivos (E), KPIs (1c) → todos intactos.

**Resultado esperado del diff:** −1 constante (7 líneas) −1 bloque JSX (23 líneas) ≈ **−30 líneas**, sin pérdida funcional.

---

## Pregunta 8 — (GO) Verificación post-eliminación

| Check | Resultado esperado |
|---|---|
| `/knowledge` alcanzable | Sidebar A-4 + TopNav + Cards |
| `/labs` alcanzable | Sidebar A-5 + TopNav + Cards + Acceso Rápido |
| `/hardware-catalog` alcanzable | Sidebar A-3 + TopNav + Cards + Mapa |
| `/ai-predictive` alcanzable | Sidebar A-6 + TopNav + Cards + Acceso Rápido |
| `/dashboard` alcanzable | Sidebar A-1 + TopNav |
| `/proyectos` alcanzable | Sidebar A-2 + TopNav + Cards |
| MASTERDOC alcanzable | `/proyectos` → SIGCTiArural → MASTERDOC + voz `'docs'` |
| Telemetría en vivo | Sigue en el Dashboard (TelemetryPanel + GlobalChart) |
| Filosofía "Capacidades" | H1 + Cards + Mapa + Labs accesos intactos |
| Balance sintaxis | braces/parens 0 diff (validación regex) |

**Rollback:** `git restore src/frontend/src/pages/Dashboard.jsx` (instantáneo, archivo único).

---

## Resumen ejecutivo

| Pregunta | Respuesta |
|---|---|
| 1. ¿Todo representado existe? | **5/6 sí plenamente**; 1 (masterdoc) accesible en 2 clics |
| 2. ¿Qué se pierde? | Solo un atajo directo a masterdoc y un label decorativo auto-enlazado |
| 3. ¿Huérfanos? | **Ninguno** |
| 4. ¿Duplicado? | Bloque F duplica **5/6** destinos |
| 5. ¿Sidebar sustituye? | **Sí, navegacionalmente completo** con ProjectsPage |
| 6. Veredicto | **GO PARA ELIMINACIÓN** |
| 7. Qué eliminar | Constante `ECOSYSTEM_LINKS` (L28-35) + bloque JSX 1b (L268-290) en Dashboard.jsx |
| 8. Verificación | Ruta por ruta en tabla anterior |