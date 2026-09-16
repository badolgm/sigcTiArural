# SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN — Plan del Hardware Catalog

**Familia:** Refactorización Global · **Gate:** U0.5 → U1 (transición a la Dashboard Ganadora)
**Estado:** `referencia` (plan de diseño — sin código)
**Referencia oficial:** `DASHBOARD_REIMAGINED_V2` §4 y §10 (Regla NO ELIMINAR NADA).

---

## 1. Objetivo

Diseñar el **Hardware Catalog** (`/hardware-catalog`) que:
- **Preserva** BBB-01/02/03 (sección Operación/Referencia) sin que dejen de existir ni verse.
- **Incorpora** ESP32, STM32, Arduino, Raspberry, Jetson, FPGA, MiniPC (y los tiles reales
  RPI-05/FPGA-X/ARDUINO-UNO-Q/ALEXA-IOT/DRONE-NAV).
- **No rompe** la experiencia actual (Dashboard, labs, telemetría, rutas intactas).

---

## 2. Invariantes del catálogo

1. **No es una vista de identidad BBB** — es una vista **por capacidad/fase de aprendizaje**
   (GR-04, `CAPABILITIES_VS_HARDWARE`).
2. **BBB-01/02/03 aparecen** en el catálogo como entradas `referencia` **y** siguen visibles en
   Operación del Dashboard (dot TopNav intacto). "Dejan de ser el centro" ≠ "dejan de verse".
3. **Todos los estados honestos**: `operativo` / `referencia` / `diseño` / `vacío` (Vocabulario
   único; nunca inventar `online/alert` sin procedencia — GR-09/PA-08).
4. **Enlaces originales preservados**: los tiles RPI-05/FPGA-X/ARDUINO/ALEXA/DRONE conservan su
   identidad, ícono, rol y enlaces (raspberrypi.com, amd.com+yosys, docs.arduino.cc, Alexa, PX4/ArduPilot).
5. **Frontend-only en este gate** — no requiere cambios en `src/backend`; el catálogo se alimenta de
   un módulo de datos nuevo (estilo `lab-data.js`). El `HardwareCatalogRepositoryPort`/`HardwareContext`
   backend es diseño U1 posterior (decisión), y al existir será **aditivo**.
6. **Nada se borra** — los tiles del Dashboard se realojan a aquí (Regla §10.2).

---

## 3. Modelo de datos del catálogo (diseño, sin código)

```
HardwareCatalog = {
  plataforma: string,
  fase: 'operativo' | 'referencia' | 'diseño' | 'vacío',
  capacidad: string[]  (roles pedagógicos: Gateway, IA Edge, Sensor, SBC, MCU, FPGA, UAV, Voz, Biosensor…),
  origen: { tileDashboard?: string, linkDocs?: string, enlacesExternos?: [{label, href}] },
  notas: string
}
```

| Entrada | Fase | Capacidad | Origen/enlaces preservados |
|---|---|---|---|
| BBB-01 | `referencia` | Gateway / MQTT Broker | Dashboard/ClusterCard; docs BBB |
| BBB-02 | `referencia` | IA Edge / TFLite | Dashboard/ClusterCard; docs IA edge |
| BBB-03 | `referencia` | Adquisición / Sensores | Dashboard/ClusterCard; docs sensores |
| ESP32 | `referencia` | MCU inalámbrico (piscicultura) | Docs/hardware; UBTN (diseño) |
| STM32 | `referencia` | MCU industrial | Docs |
| Arduino UNO | `referencia` | MCU educativo | Tile **ARDUINO-UNO-Q** → enlaces docs.arduino.cc/cloud |
| Raspberry Pi 5 | `vacío` | SBC / Edge AI | Tile **RPI-05** → enlaces raspberrypi.com |
| Jetson (Nano/Xavier NX) | `referencia` | SBC IA | Docs Hughes-et-al (sin representación hoy) |
| FPGA Moderna | `vacío` | Aceleradora HDL | Tile **FPGA-X** → enlaces AMD/yosys |
| MiniPC | `referencia` | Procesamiento | Docs/network |
| Drones/PX4/ArduPilot | `vacío` | UAV | Tile **DRONE-NAV** → enlaces PX4/ardupilot |
| Alexa / Google | `vacío` | Voz IoT | Tile **ALEXA-IOT** → enlaces Alexa Developer |
| UBTN-ESP32 (wearable) | `diseño` | Biosensor | Familia UBTN (U0); se añade sin falso estado |

> ESP32 aparece ahora en dos lugares con propósitos distintos: como entrada general (MCU) y como
> plataforma del UBTN. Ambas entradas coexisten (una apunta al modelo de aprendizaje, otra al
> proyecto UBTN). **Nada se sustituye.**

---

## 4. Estructura de la página (según Ganadora §4)

```
/hardware-catalog
├─ Título: "Hardware Catalog — Capacidades, no piezas"
├─ Filtros aditivos: [Todos] [Operativo] [Referencia] [Vacío] [Diseño] [Por capacidad]
└─ Grupos por fase de aprendizaje (HARDWARE_LEARNING_MODEL)
   ├─ Nivel 1 · Sensores y adquisición → BBB-03, ESP32, DHT22/humedad
   ├─ Nivel 2 · Control y protocolos   → BBB-01(MQTT), ESP32, STM32
   ├─ Nivel 3 · Procesamiento local    → BBB-02(TFLite), RPi, Jetson, MiniPC
   ├─ Nivel 4 · Aceleración y futuro   → FPGA-X, DRONE-NAV, ALEXA-IOT
   └─ Proyecto colgante               → UBTN-ESP32 (diseño; acceso a vista bioseñal vía C-04)
```

Cada entrada muestra: ícono, nombre, fase, capacidades, origen, y **enlaces** (los que venían de los
tiles si aplica). Sin indicadores de salud falsos.

---

## 5. Procedencia de los datos (sin tocar lo existente)

| Fuente hoy | Uso: se reutiliza | Uso: no se toca |
|---|---|---|
| `futureNodes` en `Dashboard.jsx` (5 tiles) | Sus datos/enlaces se **copian** (no se mueven de referencia) al módulo del catálogo en la Fase 3 | `Dashboard.jsx` sigue funcionando hasta la Fase 3 la realoje al acceso → catálogo |
| `lab-data.js` | Patrón de módulo de datos + `ADDING_LABS.md` como referencia de cómo documentar entradas | **No se modifica** |
| Docs `HARDWARE_LEARNING_MODEL` / `CAPABILITIES_VS_HARDWARE` | Definir fases/capacidades | N/A |
| Familia UBTN (`UBTN_HARDWARE_ROADMAP`, `UBTN_SENSOR_CATALOG`) | Entrada UBTN-ESP32 (fase `diseño`) | N/A |

**Nota honesta:** el catálogo es un **nuevo módulo de datos frontend** (`catalog-data.js`) — NO se
reutiliza `lab-data.js` porque su contrato es pedagógico/labs y se preserva intacto.

---

## 6. Fases de implementación del catálogo (dentro de `FRONTEND_MIGRATION_PLAN`)

| Fase | Alcance | Criterio de aceptación |
|---|---|---|
| 2a | Ruta + página vacía + datos estáticos con las 13 entradas | `/hardware-catalog` carga; BBB visibles; enlaces OK |
| 2b | Filtros/Tabs y agrupación por fase de aprendizaje | Navegar sin error; estados honestos |
| 3 | Realojar tiles del Dashboard → entradas (los datos siguen igual, viven aquí) | Contenido de los 5 tiles accesible desde catálogo; Dashboard muestra acceso al catálogo (sin pérdida) |
| 6 (gated) | Entrada UBTN-ESP32 con vista de bioseñal conceptual | Tras A-7 + decisión dueño |

**Rollback:** retirar ruta/módulo sin tocar nada del Dashboard hasta la Fase 3 (esta se planifica
con snapshot previo).

---

## 7. Qué NO hacer (anti-patterns del catálogo)

- No mostrar `online/alert` para hardware que no reporta (GR-09) — usar estados honestos.
- No hacer de la vista "el centro": el Dashboard (Operación) sigue mostrando BBB para el usuario
  habitual (`NAVIGATION_EVOLUTION`).
- No tocar `lab-data.js`, `futureNodes` (hasta Fase 3), `Dashboard.jsx` (hasta Fase 3), ni `src/backend`.
- No crear un contexto backend todavía (Host `HardwareCatalog` solo en diseño U1 si el dueño decide).

---

## 8. Referencias

- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — §4 wireframe catálogo y §10 Regla Suprema.
- [`SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md`](SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md) — fases de aprendizaje.
- [`SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md`](SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md) — hardware ≠ capacidad.
- [`SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md`](SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md) — clasificación de archivos.
- [`SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md`](SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md) — Fase 2.
- [`SIGCTIARURAL_ROUTE_EVOLUTION.md`](SIGCTIARURAL_ROUTE_EVOLUTION.md) — ruta `/hardware-catalog`.