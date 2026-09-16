# SIGCTiArural — Mapa de Dispositivos: Auditoría de Enlaces (U3.2A)

> **Estado:** U3.2A. Solo auditoría. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Fuentes auditadas:** `Dashboard.jsx` · `HardwareCatalogPage.jsx` · `HardwareDetailPage.jsx` · `catalog-data.js`
> **Objetivo:** verificar que las tarjetas del **Mapa de Dispositivos** naveguen a las **Hardware Detail Pages** (`/hardware/:id`) y no al catálogo genérico.

---

## 1. Pregunta 1 — ¿Qué tarjetas del Mapa siguen apuntando al catálogo?

El Mapa de Dispositivos vive en `Dashboard.jsx` (bloque `1b`, líneas 259-335). Tiene **3 grupos**, cada uno con destino propio:

| Grupo | Línea del `<Link>` | Destino actual | Tipo de datos |
|---|---|---|---|
| **A. Nodos Operativos (BBB)** | `Dashboard.jsx:279` | `/dashboard` | `nodes[]` (BBB-01/02/03) |
| **B. Catálogo de Plataformas** | `Dashboard.jsx:300` | `/hardware-catalog` ⚠️ | `hardwareCatalogEntries` (9, sin BBB) |
| **C. Roadmap** | `Dashboard.jsx:322` | `/hardware-catalog` ⚠️ | `futureNodes[]` (RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV) |

**Quién sigue apuntando al catálogo:**
- **Grupo B — 9 tarjetas**: `ESP32-WROOM-32`, `ESP32-S3`, `STM32`, `ARDUINO`, `RASPBERRY-PI`, `JETSON`, `FPGA`, `MINI-PC`, `CUSTOM-HW` → todas a `/hardware-catalog`.
- **Grupo C — 5 tarjetas roadmap**: `RPI-05`, `FPGA-X`, `ARDUINO-UNO-Q`, `ALEXA-IOT`, `DRONE-NAV` → todas a `/hardware-catalog`.
- **Grupo A — BBB-01/02/03**: apuntan a `/dashboard` (NO al catálogo). No son parte del problema, pero se analizan en riesgo (ver §5).

---

## 2. Pregunta 2 — ¿Qué tarjetas deberían apuntar a `/hardware/:id`?

**Las 9 del Grupo B, sí.** Sus `id` existen en `catalog-data.js` y por tanto tienen Hardware Detail Page en `/hardware/:id`:

```
ESP32-WROOM-32 → /hardware/ESP32-WROOM-32
ESP32-S3       → /hardware/ESP32-S3
STM32          → /hardware/STM32
ARDUINO        → /hardware/ARDUINO
RASPBERRY-PI   → /hardware/RASPBERRY-PI
JETSON         → /hardware/JETSON
FPGA           → /hardware/FPGA
MINI-PC        → /hardware/MINI-PC
CUSTOM-HW      → /hardware/CUSTOM-HW
```

**Las 5 del Grupo C (Roadmap), NO.** Sus `id` (`RPI-05`, `FPGA-X`, `ARDUINO-UNO-Q`, `ALEXA-IOT`, `DRONE-NAV`) **no existen** en `catalog-data.js` → `/hardware/:id` con esos ids activaría el fallback `<Navigate to="/hardware-catalog">` de `HardwareDetailPage.jsx:33` (viaje de ida y vuelta sin valor). **Conclusión:** el roadmap debe **seguir apuntando al catálogo** (destino ancla legítimo) como hoy.

**Nodos BBB (Grupo A):** son instancias en vivo (`BBB-01`,`BBB-02`,`BBB-03` → nodos del Dashboard). El catálogo solo tiene la plataforma `BBB` (referencia). Cambiarlos a `/hardware/BBB` perdería el contexto de monitoreo en vivo. **Se mantienen en `/dashboard`** (deliberado, no es un bug).

| Grupo | ¿Debe ir a `/hardware/:id`? | Detalle |
|---|---|---|
| A. BBB-01/02/03 | ❌ Mantener `/dashboard` | live monitoring real |
| B. 9 plataformas | ✅ **Sí** | ids 1:1 con el catálogo |
| C. 5 roadmap | ❌ Mantener `/hardware-catalog` | ids inexistentes en catálogo → fallback no aporta |

---

## 3. Pregunta 3 — ¿Cómo corregirlo?

**Cambio mínimo en `Dashboard.jsx`, línea 300:**

```jsx
// ANTES
<Link key={entry.id} to="/hardware-catalog" ...>

// DESPUÉS
<Link key={entry.id} to={`/hardware/${entry.id}`} ...>
```

Única edición. Se conserva todo lo demás del tile (icono, badge estado, nombre, role, fase).

**No tocar:** línea 279 (Grupo A → `/dashboard`) ni línea 322 (Grupo C → `/hardware-catalog`).

**Alternativa futura (fuera de alcance):** si el roadmap madura, sus entradas se agregan a `catalog-data.js` con los mismos `id`, y entonces el `<Link>` del Grupo C podría condicionarse:
```jsx
to={hardwareCatalogEntries.some(e => e.id === node.id) ? `/hardware/${node.id}` : '/hardware-catalog'}
```
Hoy NO aplica (IDs no coinciden).

---

## 4. Pregunta 4 — ¿Qué archivos deben modificarse?

| Archivo | Cambio | ¿Obligatorio? |
|---|---|---|
| `src/frontend/src/pages/Dashboard.jsx` | L300: `to="/hardware-catalog"` → `to={\`/hardware/${entry.id}\`}` | ✅ única edición |
| `src/frontend/src/pages/HardwareCatalogPage.jsx` | 0 cambios | — |
| `src/frontend/src/pages/HardwareDetailPage.jsx` | 0 cambios | — |
| `src/frontend/src/data/catalog-data.js` | 0 cambios | — |

**1 archivo, 1 línea.**

---

## 5. Pregunta 5 — ¿Qué riesgos existen?

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | Cambiar por error también al Grupo C (roadmap) | Baja | Bajo | Edición dirigida a L300; el roadmap queda igual (fallback Navigate ya lo protegería igual) |
| 2 | `id` con guiones (ESP32-WROOM-32) en URL | Muy baja | Nulo | Strings URL-safe; `encodeURIComponent` no necesario para estos ids |  |
| 3 | Cambiar Grupo A (BBB) a `/hardware/BBB` por malentendido | Baja | Medio | Son instancias vivas → quedan en `/dashboard` (decisión documentada) |
| 4 | Futuro roadmap con ids coincidentes quede sin página | Baja | Bajo | Condicional documentado en §3; no aplica hoy |
| 5 | Romper balance/JSX al editar Dashboard | Baja | Bajo | Validación de balance braces/parens post-edición |

**Riesgo neto: MUY BAJO.** La edición es un cambio de valor de atributo en una única línea.

---

## 6. Pregunta 6 — ¿Qué rollback tendría?

```bash
git restore src/frontend/src/pages/Dashboard.jsx
```
- Revierte la línea 300 a `/hardware-catalog` (estado U2.4/U3.2).
- Si ha habido otras misiones sobre Dashboard.jsx sin commit, `git restore` revierte TODO el archivo — alternativa quirúrgica: `git diff` para deshacer solo la línea con `git checkout -p` o edición manual inversa.
- Sin tocar: HardwareCatalog, HardwareDetailPage, catálogo, Dashboard estructura, BBB, telemetría, Labs, KH, IA, Docker, backend.

---

## Resumen decisivo

| Pregunta | Respuesta |
|---|---|
| 1. Tarjetas al catálogo | 14: 9 del Grupo B (catálogo) + 5 del Grupo C (roadmap) |
| 2. Deberían ir a `/hardware/:id` | Solo las 9 del Grupo B (ids 1:1). Roadmap y BBB: NO (mantener destinos actuales) |
| 3. Cómo corregir | 1 línea en `Dashboard.jsx:300`: `to={\`/hardware/${entry.id}\`}` |
| 4. Archivos a modificar | Solo `Dashboard.jsx` |
| 5. Riesgos | Muy bajos; el mayor es editar por error el grupo equivocado |
| 6. Rollback | `git restore Dashboard.jsx` (o deshacer 1 línea) |

**Veredicto: CORRECCIÓN TRIVIAL Y SEGURA — pendiente de autorización para implementar (1 línea, 1 archivo).**