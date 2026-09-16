# SIGCTiArural — Mapa de Dispositivos (U2.3)

> **Estado:** U2.3. Diseño exclusivo. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** `Dashboard.jsx` — módulo Mapa de Dispositivos.
> **Fuente de verdad:** Designer.png prevalece sobre documentación secundaria.

---

## 1. Concepto

Bloque visual en el Dashboard que muestra **todos los dispositivos del ecosistema SIGCTiArural en una sola vista unificada**, agrupados por estado honesto. Reemplaza la percepción fragmentada (BBB en un lado, catálogo en otra ruta, futuros en otro bloque) por una sola "fotografía del hardware" con estado real derivado de datos existentes.

**Diferencia clave con bloques existentes:**
- `ClusterCard` BBB: solo muestra 3 nodos, sin contexto de catálogo ni roadmap.
- `Integraciones Futuras` (ClusterCard ×5): solo muestra roadmap, sin BBB ni catálogo.
- `Hardware Catalog` (ruta `/hardware-catalog`): página dedicada con descripciones largas.
- **Mapa de dispositivos**: vista compacta unificada de TODO el hardware con su estado, navegable.

---

## 2. Fuentes de datos (existentes, sin backend)

| Fuente | Variable en Dashboard.jsx | Qué aporta | Campos clave |
|---|---|---|---|
| Nodos BBB (reales/simulados) | prop `nodes` (o `initialNodes`) | BBB-01/02/03 con status real y data | `id`, `name`, `role`, `status` (online/alert/offline), `data.cpu`, `data.temp` |
| Hardware Catalog | import `hardwareCatalogEntries` | 10 plataformas con estado honesto | `id`, `name`, `role`, `status` (reference/construction), `icon`, `fase` |
| Future Nodes | const `futureNodes` | 5 nodos roadmap | `id`, `name`, `role`, `status` (construction), `icon` |
| Telemetría (en vivo) | `telemetryEnvelope` → `telemetryItems` | Última lectura por sensor_id | `items[].sensor_id`, `items[].temperature`, `items[].humidity`, `source_mode` |
| Knowledge Hub | import `registry` | N.º de docs indexados | `registry.documents.length` |

**No se crea ningún dato nuevo. No se llama a ninguna API.**

---

## 3. Resolución de duplicaciones

Hay solapamiento entre fuentes que se debe resolver antes del render:

| Duplicación | Solución |
|---|---|
| `hardwareCatalogEntries` incluye `id: 'BBB'` (status: reference) | Se excluye del grupo catálogo. BBB ya está representado por los 3 nodos de `nodes`. La entrada del catálogo se muestra como nota a pie: "BBB también documentado en Hardware Catalog". |
| `futureNodes` incluye RPI-05, FPGA-X, ARDUINO-UNO-Q que se solapan con RASPBERRY-PI, FPGA, ARDUINO del catálogo | Se deduplica: si un `futureNode.id` tiene contraparte en `hardwareCatalogEntries` por rol相似, se usa el registro de catálogo como fuente y `futureNodes` solo aporta el contexto de roadmap. Alternativa más limpia: tratar `futureNodes` como grupo independiente "Roadmap" sin deduplicar, ya que representan versiones específicas (RPI-05 es RPi 5, RASPBERRY-PI es la marca genérica). |
| Telemetría: `sensor_id` puede no correlacionarse directamente con un `node.id` | Se usa como enriquecimiento opcional. Si `telemetryItems.length > 0`, se extrae `sensor_id`, `temperature`, `humidity` del último reading y se muestra como mini-badge en el chip de BBB-03 (el sensor). No se fuerza correlación; si no hay match, se omite. |

**Decisión de diseño:** No deduplicar. Mantener los 3 grupos por separado con sus propias fuentes. La deduplicación crea confusión visual sin beneficio. El usuario distingue naturalmente "BBB cluster" (3 nodos) de "Catálogo de plataformas" (documentación) de "Roadmap" (integraciones futuras).

---

## 4. Inventario resultante

### Grupo A — Nodos Operativos (de `nodes`)
| ID | Nombre | Rol | Estado | Data disponible |
|---|---|---|---|---|
| BBB-01 | Gateway / MQTT Broker | Gateway | online | cpu, temp, network |
| BBB-02 | IA Edge / TFLite | Analista | alert | cpu, temp, diagnosis |
| BBB-03 | Adquisición de Datos / IoT | Sensor | offline | cpu, temp, humidity |

### Grupo B — Plataformas en Catálogo (de `hardwareCatalogEntries`, excluyendo BBB)
| ID | Nombre | Rol | Estado | Icono |
|---|---|---|---|---|
| ESP32-WROOM-32 | ESP32 (WROOM-32) | MCU + WiFi/BLE | construction | ⚡ |
| ESP32-S3 | ESP32-S3 | MCU + WiFi/BLE + IA | construction | ⚡ |
| STM32 | STM32 (ST) | MCU ARM Cortex-M | construction | ⚡ |
| ARDUINO | Arduino | MCU educativo | construction | 🎯 |
| RASPBERRY-PI | Raspberry Pi | SBC | construction | 🍓 |
| JETSON | Jetson (NVIDIA) | IA de borde | construction | 🧠 |
| FPGA | FPGA (HDL) | Lógica reconfigurable | construction | 🧩 |
| MINI-PC | MiniPC | Nodo de cómputo | construction | 🖥️ |
| CUSTOM-HW | Hardware Personalizado | PCB / dispositivos propios | construction | 🔧 |

### Grupo C — Roadmap (de `futureNodes`)
| ID | Nombre | Rol | Estado |
|---|---|---|---|
| RPI-05 | Raspberry Pi 5 / Edge AI | SBC | construction |
| FPGA-X | FPGA Moderna / HDL | Aceleradora | construction |
| ARDUINO-UNO-Q | Arduino UNO Q | SBC/MCU | construction |
| ALEXA-IOT | Alexa / Google Assistant | Voz IoT | construction |
| DRONE-NAV | Drones / Autopilots | UAV | construction |

**Total de chips: 17 dispositivos.**

---

## 5. Diseño visual

### 5.1 Layout general

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🗺️ MAPA DE DISPOSITIVOS                                  [Leyenda ▼]  │
│                                                                          │
│ ┌─ OPERATIVOS ────────────────────────────────────────────────────────┐  │
│ │ [💠 BBB-01] Gateway    🟢 online   cpu: 15%  temp: 45°C  → Dash   │  │
│ │ [💠 BBB-02] IA Edge    🟡 alerta   cpu: 88%  temp: 68°C  → Dash   │  │
│ │ [💠 BBB-03] IoT Sensor ⚫ offline   cpu: 0%   temp: N/A   → Dash   │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ ┌─ CATÁLOGO DE PLATAFORMAS (9) ──────────────────────────────────────┐  │
│ │ [⚡ ESP32-WROOM] MCU WiFi/BLE        🔵 referencia → Catálogo       │  │
│ │ [⚡ ESP32-S3]    MCU WiFi/BLE + IA   🔵 referencia → Catálogo       │  │
│ │ [⚡ STM32]       MCU ARM Cortex-M    🔵 referencia → Catálogo       │  │
│ │ [🎯 Arduino]     MCU educativo        🔵 referencia → Catálogo       │  │
│ │ [🍓 Raspberry]   SBC                  🔵 referencia → Catálogo       │  │
│ │ [🧠 Jetson]      IA de borde          🔵 referencia → Catálogo       │  │
│ │ [🧩 FPGA]        Lógica reconfig.     🔵 referencia → Catálogo       │  │
│ │ [🖥️ MiniPC]      Nodo cómputo         🔵 referencia → Catálogo       │  │
│ │ [🔧 Custom HW]   PCB propio           🔵 referencia → Catálogo       │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ ┌─ ROADMAP (5) ──────────────────────────────────────────────────────┐  │
│ │ [🍓 RPI-05]       SBC / Edge AI      ⚪ roadmap → Catálogo          │  │
│ │ [🧩 FPGA-X]       Aceleradora        ⚪ roadmap → Catálogo          │  │
│ │ [⚡ ARDUINO-UNO-Q] SBC/MCU            ⚪ roadmap → Catálogo          │  │
│ │ [🎙️ Alexa IoT]    Voz IoT            ⚪ roadmap → Catálogo          │  │
│ │ [🛸 DRONE-NAV]    UAV                ⚪ roadmap → Catálogo          │  │
│ └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Chips de dispositivo (unidad mínima)

Cada chip es un `<Link>` compacto con estilo consistente con la paleta actual:

```
┌──────────────────────────────────────────────┐
│ [icon] name          status   cpu/temp → dest │
└──────────────────────────────────────────────┘
```

- **Ancho fijo** (~180-220px), `grid-cols-2 sm:3 md:4 lg:5` responsive.
- **Fondo:** `bg-gray-900 bg-opacity-60` (mismo que bloques existentes).
- **Borde:** color por estado (online=green, alert=yellow, offline=gray, reference=primary, construction=primary, roadmap=gray-600).
- **Hover:** `scale-[1.03]` + glow del color de borde.
- **Layout interno:** flex-row, icono + texto a la izquierda, pill de estado a la derecha.
- **Tooltip/título** en cada chip: `title="BBB-01 · Gateway · online"` para accesibilidad.

### 5.3 Leyenda de estados (esquina superior derecha del bloque)

```
🟢 online  🟡 alerta  ⚫ offline  🔵 referencia  ⚪ roadmap
```

- Toggle de expansión: `▼` / `▶` (como LabCatalog). Por defecto colapsada (solo se ve el label "Leyenda ▶").

### 5.4 Agrupación visual

Cada grupo se separa con:
- **Título de grupo** (`<h4>`) en `text-xs uppercase tracking-widest text-gray-500` + conteo `(N)`.
- **Borde inferior** sutil `border-b border-gray-800` entre grupos.
- Los 3 grupos están dentro de la misma card contenedora (`rounded-xl border bg-gray-900`).

### 5.5 Destino de cada chip

| Grupo | Destino | Ruta |
|---|---|---|
| Nodos Operativos | Dashboard (sección BBB existente) | `#` (scroll to section) o `/dashboard` |
| Catálogo | Hardware Catalog page | `/hardware-catalog` |
| Roadmap | Hardware Catalog page | `/hardware-catalog` |

**Nota:** Los chips de BBB-01/02/03 apuntan a `/dashboard` (ya están visibles en el mismo Dashboard). Se podría hacer scroll-to-section pero es más complejo; usar `/dashboard` es seguro y funcional.

---

## 6. Datos enriquecidos del mapa

### 6.1 BBB con telemetría cruzada

Si `telemetryItems.length > 0`, se extrae el último reading:
```js
const lastReading = telemetryItems[telemetryItems.length - 1];
// lastReading?.sensor_id  → puede mapearse con BBB-03 (IoT sensor)
// lastReading?.temperature → temp actual del aire
// lastReading?.humidity    → humedad actual
```

**Correlación:** El `sensor_id` del último reading se compara con los `nodes[].id`. Si hay match (o si el sensor es del tipo BBB-03), se muestra un mini-badge "📡 LIVE" en el chip de BBB-03. Si no hay match o `sourceMode !== 'live'`, se omite.

### 6.2 Catálogo enriquecido

Cada chip del catálogo muestra:
- `icon` + `name` + `role` (ya disponibles en `hardwareCatalogEntries`)
- `fase` como subtexto: "diseño" / "referencia"

### 6.3 Roadmap enriquecido

Cada chip del roadmap muestra:
- `icon` + `name` + `role` (disponibles en `futureNodes`)
- Banner: "Placeholder de integración" como subtexto sutil

---

## 7. Ubicación en el Dashboard

**Posición propuesta:** Bloque 1d-bis, después de KPIs (1c) y antes de Acceso Rápido a Laboratorios (1e/U2.2).

Justificación: La Ganadora ubica el mapa como sección central después de KPIs. Colocarlo después de los KPIs y antes de Labs sigue la jerarquía visual: Header → Capacidades → KPIs → **Mapa de Dispositivos** → Labs → Actividad → Operación.

**No se reemplaza ni se mueve** ningún bloque existente. Solo se agrega un bloque adicional.

---

## 8. Archivos afectados

| Archivo | Tipo de cambio | Líneas estimadas |
|---|---|---|
| `src/frontend/src/pages/Dashboard.jsx` | +1 constante `DEVICE_MAP_GROUPS` + 1 bloque JSX (sección Mapa de Dispositivos) | +80-100 líneas |
| — (ningún otro) | — | — |

**Importación necesaria:** `Link` ya está importada. `hardwareCatalogEntries`, `ecosystemProjects`, `registry` ya están importados. No se necesita ningún import nuevo.

---

## 9. Riesgos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | **Duplicación visual con Integraciones Futuras** (ClusterCard ×5) | Alta | Bajo | El Mapa es una vista unificada por estado; Integraciones Futuras es presentacional. Se mantiene ambas: el Mapa da contexto global, las tarjetas futuras dan detalle por nodo. No confunden porque están en secciones distintas. |
| 2 | **Duplicación visual con Hardware Catalog page** | Media | Bajo | El Mapa es un resumen navegable (17 chips); el Catálogo es una página dedicada con descripciones largas. Son complementarios: Mapa = "qué existe y en qué estado", Catálogo = "detalles técnicos". |
| 3 | **Sobre-carga visual** (17 chips) | Media | Medio | Chips compactos (~180px), agrupados por estado con títulos de grupo, scroll vertical natural. 17 items no son rendimiento ni legibilidad. Si se siente pesado, se puede colapsar por grupo con toggle. |
| 4 | **Confusión BBB catálogo vs BBB cluster** | Alta | Bajo | El grupo "Nodos Operativos" usa `nodes` (real/simulado) y muestra status dinámico. El grupo "Catálogo" excluye `id: 'BBB'` de `hardwareCatalogEntries`. La diferencia es clara: uno es vivo, otro es documentación. |
| 5 | **Datos stale** si cambia estructura de `hardwareCatalogEntries` o `futureNodes` | Baja | Medio | Mapeo defensivo con `?.` en cada campo. Si un campo falta, se muestra "—" como fallback. Sin crash. |
| 6 | **Accesibilidad** (solo visual, sin ARIA) | Baja | Bajo | Chip con `title` attribute para screen readers. Mejorable en futuro. |
| 7 | **Performance**: 17 items + 3 BBB + 5 futureNodes renderizados | Muy baja | Muy bajo | JSX estático, sin cálculos pesados, sin fetch. |

**Riesgo neto: BAJO.** El módulo es 100% de lectura, aditivo, sin dependencias nuevas.

---

## 10. Rollback

### Opción A (recomendada): eliminar solo el bloque Mapa de Dispositivos
```bash
git restore src/frontend/src/pages/Dashboard.jsx
```
Esto revierte U2.3 (Mapa) + U2.2 (Acceso labs) + U2 (Dashboard Executive Layer) y cualquier cambio posterior en Dashboard.jsx que no estuviera committeado.

### Opción B (quirúrgica): eliminar solo la constante y el bloque JSX
Eliminar manualmente:
1. La constante `DEVICE_MAP_GROUPS` (o equivalente) del bloque de constantes.
2. El bloque JSX `{/* X. MAPA DE DISPOSITIVOS */}` (~80-100 líneas).

Dashboard.jsx vuelve al estado exacto de antes de U2.3.

---

## 11. Checklist de validación post-implementación

| Verificación | Método |
|---|---|
| Balance de llaves `{}` = `}` | `regex count` en Dashboard.jsx |
| Balance de paréntesis `(` = `)` | `regex count` en Dashboard.jsx |
| No se eliminó ningún bloque existente | Diff manual o `git diff src/frontend/src/pages/Dashboard.jsx` |
| Todos los links del mapa apuntan a rutas existentes | Verificar contra `App.jsx:109-147` |
| `LAB_QUICK_ACCESS` (U2.2) intacto | Verificar que la constante sigue en Dashboard.jsx |
| `CAPABILITY_CARDS` intacto | Verificar que la constante sigue en Dashboard.jsx |
| `ECOSYSTEM_LINKS` intacto | Verificar que la constante sigue en Dashboard.jsx |
| `NAV_SIDEBAR` intacto | Verificar que la constante sigue en Dashboard.jsx |
| `futureNodes` intacto | Verificar que la constante sigue en Dashboard.jsx |
| TelemetryPanel, ClusterCard, GlobalChart sin cambios | No se tocaron archivos de componentes |

---

## 12. Resumen

| Dimensión | Valor |
|---|---|
| **Concepto** | Vista unificada de 17 dispositivos (3 BBB + 9 catálogo + 5 roadmap) agrupados por estado honesto |
| **Datos reutilizados** | `nodes`, `hardwareCatalogEntries`, `futureNodes`, `telemetryItems` — cero datos nuevos |
| **Backend** | No toca |
| **Archivos nuevos** | 0 |
| **Archivos modificados** | 1 (`Dashboard.jsx`, +80-100 líneas aditivas) |
| **Riesgo neto** | Bajo (100% lectura, sin dependencias nuevas) |
| **Rollback** | `git restore Dashboard.jsx` (instantáneo) |
| **Estado** | DISEÑO — NO IMPLEMENTADO |

---

## 13. Decisión de implementación

Este diseño está listo para implementarse como **U2.4** o similar, siempre que:
1. Se confirme que la carga visual de 17 chips es aceptable en el Dashboard.
2. Se valide que la deduplicación BBB catálogo vs cluster es clara para el usuario.
3. Se apruebe la posición (después de KPIs, antes de Labs).

**NO IMPLEMENTAR en esta misión.**
