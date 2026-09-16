# SIGCTiArural — Capa Ejecutiva del Dashboard (U2.1)

> **Estado:** U2.1. Auditoría read-only. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** `Dashboard.jsx` (estado post-U2) · diseño del módulo **Mapa de dispositivos**.

---

## 1. Elemento visual de mayor impacto que falta

**Respuesta: un "Mapa de dispositivos" (vista unificada de todo el hardware con estados honestos) es el elemento de mayor impacto que acerca la Dashboard a la Ganadora.**

Justificación (contra el wireframe de `SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`):
- La Dashboard ganadora distingue **CAPACIDADES** de lo que es **infraestructura/dispositivos** (§3 wireframe: "CAPACIDADES ACTIVAS" ≠ "ESTADO DE OPERACIÓN"), y representa cada dispositivo con su estado real (`operativo / referencia / diseño / vacío`).
- Hoy el Dashboard muestra los dispositivos **dispersos** en 3 lugares distintos: (a) tiles `TelemetryPanel` (parte alta), (b) `ClusterCard` BBB en "⚙️ Operación" (mitad), (c) grid del Hardware Catalog en otra ruta (`/hardware-catalog`). **No hay una vista que muestre en un solo lugar "cuántos y qué dispositivos existen y en qué estado están".**
- El wireframe de la espec V2 (§3 y §4) exige exactamente eso: un mapa que agrupe por estado y que sea navegable. Ese es el "gap visual" que separa al Dashboard actual (~50 % parity) de la Ganadora.

Complemento que NO debe hacerse ahora: el **selector de persona** (Estudiante/Instructor/…) es otro gap de alto impacto, pero es transversal (afecta header/nav) y no se pide en U2.1. El **Mapa de dispositivos** es local, autónomo y de bajo riesgo.

---

## 2. Diseño del módulo "Mapa de dispositivos" (sin tocar backend)

### 2.1 Concepto
Card única en el Dashboard que **lista todos los dispositivos del ecosistema** con:
- **Identidad**: icono + nombre + rol.
- **Estado honesto**: pill de estado unificado con vocabulario `operativo / alerta / referencia / diseño / futuro`.
- **Fuente**: etiqueta corta que distingue datado real vs simulado (procedencia).
- **Navegación**: cada fila enlaza a donde ese dispositivo "vive" (Dashboard para BBB, `/hardware-catalog` para catálogo).
- **Leyenda** que explica el vocabulario de estados (mismo lenguaje que README/catálogo: 🟢 operativo, 🟡 alerta, 🔵 referencia, 🟠 diseño, ⚪ futuro/vacío).

### 2.2 Datos: SOLO fuentes existentes (sin fetch, sin backend)
| Dato | Fuente (ya en `Dashboard.jsx`) | Estado |
|---|---|---|
| BBB-01/02/03 (id, name, role, status, data) | prop `nodes` (real o `initialNodes` simulado) | online / alert / offline |
| Plataformas catálogo (id, name, role, status, icon, banner) | `hardwareCatalogEntries` (import ya existente U2) | reference / construction (diseño) |
| Plataformas futuras (RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV) | array `futureNodes` (de `Dashboard.jsx`) | construcción → etiqueta "futuro" |
| N. docs / fuente / KPIs | `registry`, `sourceMode`, métricas U2 | — |

**No se crea ningún dato nuevo ni se llama a ninguna API.**

### 2.3 Composición visual (grid ~2–4 columnas, responsive)

```
┌─ 🗺️ MAPA DE DISPOSITIVOS ─────────────────────────────────────────┐
│ Leyenda: 🟢 operativo · 🟡 alerta · 🔵 referencia · 🟠 diseño · ⚪ futuro │
├────────────────────────────────────────────────────────────────────┤
│ [💠 BBB-01] Gateway / MQTT   [🟢 online  · fuente real]   → Dashboard │
│ [💠 BBB-02] IA Edge / TFLite [🟡 alerta  · fuente real]   → Dashboard │
│ [💠 BBB-03] IoT / Sensor     [⚫ offline  · fuente real]   → Dashboard │
│ [🛒 ESP32]  MCU + WiFi/BLE   [🟠 diseño   · catálogo]     → Catálogo   │
│ [🛒 STM32]  MCU ARM Cortex-M [🟠 diseño   · catálogo]     → Catálogo   │
│ … (catálogo completo, agrupado por estado)                           │
│ [🍓 RPI-05] SBC              [⚪ futuro   · roadmap]       → Catálogo   │
│ [🧩 FPGA-X] Aceleradora       [⚪ futuro   · roadmap]       → Catálogo   │
└──────────────────────────────────────────────────────────────────────┘
Cada fila = botón/¿Link? con pill de estado + flecha de destino.
```
- **Grupos ordenados**: `Operativos` → `Alerta` → `Referencia` → `Diseño` → `Futuro`.
- Estilo: reutiliza `NEON_COLORS`, fondos `bg-gray-900`, bordes `borderColor` por estado (misma paleta que `ClusterCard`), sin duplicar la lógica de tarjetas existentes.

### 2.4 Dónde se inserta (sin reemplazar nada)
- Posición propuesta: **entre "1d Tarjetas de Capacidades" y "1e Actividad reciente"**, para dar la visión de "qué existe" justo después de "a dónde navego".
- sólo es **adición de una sección** en el flujo del contenido; no se mueve ni esconde `TelemetryPanel`, `ClusterCard` BBB, `GlobalChart` ni `Integraciones Futuras`.

### 2.5 Implementación mínima (referencia, NO aplicada)
Opción A (recomendada): componente nuevo `src/frontend/src/components/DeviceMap.jsx` + uso en `Dashboard.jsx` (1 import + 1 etiqueta `<DeviceMap nodes={nodes} />`).
Opción B: bloque inline dentro de `Dashboard.jsx` como los U2 restantes (0 archivos nuevos).
Ambas leen `nodes` (prop) + `hardwareCatalogEntries` + `futureNodes` locales, mapean a filas y renderizan `Link`s. Rollback trivial.

---

## 3. Archivos afectados (futura implementación)
| Archivo | Tipo de cambio | Razón |
|---|---|---|
| `src/frontend/src/components/DeviceMap.jsx` | **nuevo** (opción A) | módulo mapa lectura de datos existentes |
| `src/frontend/src/pages/Dashboard.jsx` | + import y +1 `<DeviceMap />` | integración posicional (aditiva) |
| — (ningún otro) | — | sin tocar BBB/Telemetry/Labs/KH/IA/Docker/App/TopNav |

---

## 4. Riesgos
1. **Duplicación visual con "Integraciones Futuras" / catálogo**: riesgo de confundir al usuario con 2 vistas similares. Mitigación: el mapa es navegación+estado, las 5 tarjetas de Integraciones Futuras son presentacionales; se conservan ambas pero el mapa **agrupa** por estado (no repite tarjetas).
2. **Vocabulario mixto** (online/alert/offline de BBB vs construction/reference de catálogo): mitiga con leyenda y mapa de equivalencias (`construction → diseño/futuro`, `reference → referencia`).
3. **Acoplamiento a exports de catálogo**: si `catalog-data.js` renombrara sus exports, el mapa se rompería. Se importa el export existente sin cambios (cero riesgo que solo el propio archivo).
4. **Rendimiento**: 3 BBB + 10 catálogo + 5 futuros = 18 filas; render estático sin impacto.
5. **Estado de procedencia mal entendido**: los BBB muestran "fuente real" cuando `sourceMode === 'live'` y "simulado" cuando no; el mapa etiqueta honradamente (sin fingir operativo).
6. **Regresión de layout mobile**: se usa grid responsive ya probado (`grid-cols-2 md:3 lg:4`).

**Impacto total: bajo. Aditivo, sin backend, sin lógica de datos.**

---

## 5. Rollback
- Opción A: borrar `DeviceMap.jsx` + quitar import/uso en `Dashboard.jsx`; o `git restore src/frontend/src/pages/Dashboard.jsx` + `rm src/frontend/src/components/DeviceMap.jsx`.
- Opción B: `git restore src/frontend/src/pages/Dashboard.jsx`.
- Sin efectos colaterales (módulo es 100 % de lectura).

---

## 6. Resumen
1. El gap visual de mayor impacto = **Mapa de dispositivos** (vista única de hardware + estados honestos navegable).
2. Diseño listo: card con leyenda, agrupada por estado, honesta por procedencia, navegable a Dashboard/Catálogo.
3. Reutiliza exclusivamente: `nodes`, `hardwareCatalogEntries`, `futureNodes`, `registry`, `sourceMode`, `NEON_COLORS` — **sin backend**.
4. No toca BBB/Telemetría/Labs/KH/IA/Docker; 1 nuevo archivo (A) o 0 (B), Dashboard solo aditivo.
5. **NO implementado** en esta misión (solo especificación).