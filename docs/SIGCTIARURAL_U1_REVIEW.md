# SIGCTiArural — U1 Review (Auditoría Visual U1.1 → U1.5)

> **Estado:** U1.5 done. Auditoría read-only. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** Dashboard.jsx · TopNav.jsx · HardwareCatalogPage.jsx · catalog-data.js

---

## 0. Objeto de la auditoría

| Componente | Rol | Cambios U1 |
|---|---|---|
| `Dashboard.jsx` | Página principal (6 secciones) | U1.3 (label debug en App.jsx) · U1.5 (bloque Capacidades + enlace Integraciones Futuras) |
| `TopNav.jsx` | Barra de navegación global | U1.2 (+navItem `Hardware` → `/hardware-catalog`) |
| `HardwareCatalogPage.jsx` | Nueva página catálogo | U1.1 (creación) · U1.4 (botones `knowledge`) |
| `catalog-data.js` | Datos del catálogo (10 entradas) | U1.1 (creación) · U1.4 (campo `knowledge`) |

Estado de vida: `Git status` no-committed, sin merges, sin tocar main.

---

## 1. ¿La Dashboard actual ya empieza a parecerse a la Dashboard Ganadora?

**Sí, a nivel de información y navegación (parcial, honesto).**

- La cadena del ecosistema **Conocimiento → Laboratorios → Hardware → Telemetría → IA → Proyectos Reales** ya es visible y navegable (bloque "🧭 Capacidades del Ecosistema", U1.5), cumpliendo el principio rector de `SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md`.
- La firma "CAPACIDADES, CONOCIMIENTO, LABORATORIOS, HARDWARE, PROYECTOS" aparece representada vía enlaces reales, no como tiles genéricos.
- El Hardware Catalog ya es una **capacidad/espacio de conocimiento** (10 plataformas honradas con estados `operativo/referencia/diseño`), alineado con el wireframe de la Dashboard Reimaginada V2.
- "Operación" (BBB) sigue siendo protagonista visual: aún gana la jerarquía (ver punto 2 y 4).

**Conclusión parcial:** la Dashboard ahora tiene el "esqueleto" informativo de la Ganadora, pero su "cuerpo visual" sigue siendo la Dashboard BBB antigua dominante.

---

## 2. ¿Qué elementos visuales siguen viéndose como Dashboard BBB antigua?

1. **TopNav "Cluster Status:"** — indicador de estado del clúster (dot verde/rojo) y acceso swift a infraestructura. Responde a la métrica de "infra = protagonista".
2. **Encabezado "Dashboard Científico (Edge)"** + badge `● SISTEMA OPERATIVO` animado — lenguaje de infraestructura/monitoreo, no de capacidades.
3. **"Infraestructura Activa"** — título y grid de 3 `ClusterCard` BBB-01/02/03 con controles **Iniciar/Reiniciar** y datos CPU/temp/network (estilo "panel gamer de nodos").
4. **Tiles de telemetría `TelemetryPanel`** — estilo industrial digital (temp/humedad/sensor/fuente/lectura); correcto pero heredado de la vista antigua de nodos.
5. **"Telemetría Global"** con gráfica recharts — valiosa, pero presentada como panel de monitoreo y no como "capacidad" navegable.
6. **Banner de debug global** "SYSTEM DEBUG" (App.jsx) — aunque ya es honesto (U1.3), sigue siendo un ornamento de arriba que recuerda a la vista de sistema.

En conjunto: la mitad superior del Dashboard (nav status + encabezado + infraestructura + telemetría) todavía es 100% BBB.

---

## 3. ¿Qué elementos visuales ya reflejan la Dashboard Ganadora?

1. **TopNav con "Hardware"** (U1.2) — 5 entradas (Dashboard/Labs/Hardware/IA/Conocimiento), navegación por capacidades+conocimiento.
2. **Bloque "🧭 Capacidades del Ecosistema"** (U1.5) — la cadena navegable, con degradados neón y el mismo lenguaje visual.
3. **Hardware Catalog** (U1.1/U1.4) — página de capacidades con `ClusterCard` reusado, estado honesto (`operativo/referencia/diseño`), enlaces a Labs y Knowledge (📚).
4. **Enlace aditivo "Integraciones Futuras → Hardware Catalog"** (U1.5) — conecta Dashboard ↔ Hardware sin borrar nada.
5. **Estados distintivos** en `CatalogCard` (🔷 Planeado) coherentes con el vocabulario honesto del README (sin estados falsos de salud).
6. **Label honesto** "SYSTEM DEBUG" (U1.3) — trasparencia de estado (principio P4).

---

## 4. ¿Cuál es el cambio visual único de mayor impacto que debería hacerse después?

**Reubicar/diferenciar "Operación" (BBB + Telemetría) como bloque explícito y dar protagonismo a CAPACIDADES.**

Cambio sugerido (para U1.6, aditivo y reversible):
- Mantener intacta la sección "Infraestructura Activa" + `TelemetryPanel`, pero **enmarcarla bajo un subtítulo de Operación** (p. ej. "⚙️ Operación — Infraestructura BBB") al pie del Dashboard, o introducir primero un **módulo login de persona** (Estudiante/Instructor/Investigador/Desarrollador) — señal distintiva de la Ganadora — manteniendo el contenido BBB intacto por debajo.

El impacto máximo real no es estético sino **jerárquico**: la Dashboard Ganadora declara `D[Canal] --> CAP[Capacidades]` y relega `OPS[Operación]` a la cola. Mover el peso visual de BBB/Telemetría a un panel de capacidades (sin borrarlos) transforma la percepción completa.

Alternativa de mínimo costo, máximo impacto: **cambiar el encabezado** a "🌱 SIGC&T Rural — Capacidades del Ecosistema" y convertir el badge `● SISTEMA OPERATIVO` a "🧭 Ecosistema" (1 línea, legible, reversible).

---

## 5. ¿Qué NO debe tocarse bajo ninguna circunstancia?

1. **`TelemetryPanel.jsx` / `GlobalChart.jsx`** — lógica de datos en vivo (fetch V3, recharts); su contenido alimenta la única fuente de verdad de telemetría.
2. **Tarjetas BBB-01/02/03 (`ClusterCard` en Dashboard)** — datos simulados/estado de clúster con controles `onRequireAuth`; representan el ambiente del proyecto.
3. **`LoginModal` y lógica `fetchTelemetryEnvelope`** — autenticación y red.
4. **Backend / Docker / UBTN / Labs / Knowledge Hub / IA** — fuera de alcance de U1.x.
5. **Rutas y props de `App.jsx`** (confirmadas en U1.1) — el mapa de navegación es contrato con voz/IA (`routeMap`).
6. **Regla suprema**: NADA DESAPARECE; TODO SE PRESERVA — ninguna tarjeta, sección o link debe borrarse; solo reubicarse/precederse visualmente.

---

## 6. ¿Estamos listos para U1.6?

**Sí, con una condición de alcance.**

- **Listos:** la base está conectada (Dashboard↔Hardware↔Labs↔IA↔Conocimiento), el vocabulario honesto es consistente, y las 10 plataformas catalogadas están enlazadas a conocimiento/labs.
- **Condición:** U1.6 debe ser **aditivo y reversible**, sin borrar `TelemetryPanel`, BBB ni Integraciones Futuras (p. ej., replanteo de la jerarquía de secciones, no recorte de contenido).
- **Riesgo controlado:** el único cambio de alto impacto (jerarquía Operación/Capacidades) es seguro si se implementa como sección adicional/movimiento de contenedor, no como eliminación.

Ready status: ✅ GO (aditivo) — manteniendo regla suprema en la regresión checklist.

---

## Referencias
- `SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md` — cadena del ecosistema, personas, reglas de navegación.
- `SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md` — spec visual de la Dashboard Ganadora.
- `SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md` — plan U1.1.
- `SIGCTIARURAL_DEPENDENCY_AUDIT.md` — conflicto React18/fiber (pendiente de aplicar, runtime local vía Variante A).