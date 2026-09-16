# SIGCTIARURAL_PAGE_MAPPING — Mapa exacto página actual → página futura

**Familia:** Refactorización Global · **Gate:** U0.5 → U1 (transición a la Dashboard Ganadora)
**Estado:** `referencia` (mapeo de diseño — sin código)
**Regla:** **NADA DESAPARECE** · la **Dashboard Ganadora** es `DASHBOARD_REIMAGINED_V2`.

---

## 1. Mapa general (actual → futuro)

| Vista actual | Ruta actual | → Vista futura (Ganadora) | Ruta futura | Cambio de ruta |
|---|---|---|---|---|
| Dashboard (Dashboard Científico Edge) | `/dashboard` | Dashboard Ganadora: **Operación** (BBB-01/02/03) + **Telemetría** (V3/panel/gráfica/3D) + accesos a catálogo/labs/cadena | `/dashboard` | **No** (se reorganiza el contenido interno) |
| — | `/` (redirect a `/dashboard`) | — (sin cambio) | `/` → `/dashboard` | No |
| Laboratorios (LabCatalog) | `/labs` | Sección **Laboratorios** (cadena Conocimiento→…) | `/labs` | No |
| Robótica | `/labs/robotics` | Lab Robótica | `/labs/robotics` | No |
| Sistemas Embebidos | `/lab-embedded` | Lab Sistemas Embebidos (Programación) | `/lab-embedded` | No |
| Telecomunicaciones | `/lab-telecom` | Lab Telecomunicaciones | `/lab-telecom` | No |
| Física y Electrónica | `/lab-electronics` | Lab Física y Electrónica (+Falstad) | `/lab-electronics` | No |
| Matemáticas Avanzadas V1 | `/advanced-math` | Lab Matemáticas Avanzadas V1 | `/advanced-math` | No |
| Matemáticas Avanzadas V2 | `/advanced-math-v2` | Lab Matemáticas Avanzadas V2 | `/advanced-math-v2` | No |
| IA Predictiva | `/ai-predictive` | Eslabón IA de la cadena | `/ai-predictive` | No |
| Ciencia de Datos | `/data-science` | Lab Ciencia de Datos | `/data-science` | No |
| Knowledge Hub | `/knowledge`, `/knowledge/doc/:docId` | Centro de Conocimiento (ampliado: UBTN + SIGCTIARURAL al índice) | `/knowledge*` | No |
| **Integraciones Futuras (tiles RPI-05/FPGA-X/ARDUINO/ALEXA/DRONE)** | dentro del Dashboard | **Hardware Catalog** (entradas `referencia`/`vacío`, enlaces intactos) | `/hardware-catalog` (nueva) | Nueva ruta aditiva |
| **Hardware (BBB-01/02/03)** | dentro del Dashboard (ClusterCard + dot TopNav) | **Operación** (Dashboard) + **Hardware Catalog** (referencia) | `/dashboard`, `/hardware-catalog` | No |
| **Proyectos (conceptual)** | — (no existe) | Vista **Proyectos Reales** (cadena) | `/proyectos` (nueva) | Nueva ruta aditiva |
| **Persona (conceptual)** | — (no existe) | Selector de persona (opcional, vista general default) | sobre `/dashboard` | Aditivo |
| **Telemetría biológica UBTN (diseño)** | — (no existe) | Vista conceptual de bioseñal (tras A-7/gate) | sección o `/ubtn` (decisión U1) | Aditivo |
| **Telemetría dedicada (opcional)** | — (no existe) | Vista Telemetría dedicada | `/telemetry` (opcional) | Aditivo |
| Página no encontrada | `*` (404 → botón "Volver al Dashboard") | Idem | `*` | No |

---

## 2. Detalle de mapeos críticos

### 2.1. Dashboard actual → Dashboard Ganadora

```
Dashboard actual                          Dashboard Ganadora (/dashboard)
├─ Encabezado científico                  ├─ Encabezado científico            (PRESERVAR)
├─ Cluster BBB-01/02/03 (ClusterCard)   → ├─ Sección Operación               (ClusterCard + nodos/
│  + dados/fallback + V3 + dot TopNav      │  fallback/V3 intactos; dot TopNav) 
├─ Telemetría: GlobalChart, TelemetryPanel│
│  Telemetry3DScene + gráfica V3        → ├─ Sección Telemetría              (componentes + V3 + fallback
│                                          │  preservados)
├─ LoginModal (gate auth)               → ├─ LoginModal (gate auth)          (PRESERVAR)
├─ Tiles "Integraciones Futuras" (5)    → ├─ Acceso a Hardware Catalog       (realojo de tiles → catálogo;
│                                          │  datos/enlaces intactos)          sin pérdida de contenido)
└─ Breadcrumb cadena (nuevo, aditivo)      └─ Breadcrumb cadena              (aditivo)
```

### 2.2. Hardware BBB-01/02/03 → Operación + Catálogo

| Hoy | → Mañana | Qué se preserva |
|---|---|---|
| Chip ClusterCard de BBB-01 (Gateway/MQTT), BBB-02 (IA Edge/TFLite), BBB-03 (Sensores) en Dashboard | Sección **Operación** del Dashboard + entrada de **referencia** en Hardware Catalog | IDs, roles, datos/fallback, dot de estado, enlaces a telemetría V3 |
| Tiles "Integraciones Futuras" | Entradas del Hardware Catalog (RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV) | ícono, rol, material de links externos (documentación oficial) |

### 2.3. Laboratorios → cadena con breadcrumb

Todos los labs preservan su ruta y su contenido; la **nueva** capa es el breadcrumb/orden de la
cadena. Categorías de `lab-data.js` mapeadas a la sección Laboratorios (ver [`LAB_PRESERVATION_STRATEGY`](SIGCTIARURAL_LAB_PRESERVATION_STRATEGY.md)).

---

## 3. Páginas que **no** se crean en este gate

- **No** se diseña ninguna **visión nueva** de dashboard distinta a la Ganadora (`DASHBOARD_REIMAGINED_V2`).
- **No** se remplaza ninguna ruta; las nuevas (`/hardware-catalog`, `/proyectos`) son aditivas.
- Auth (`/login`, `/register`, `/admin-2fa`) **no** se rutea sin decisión del dueño (§D-A).

---

## 4. Verificación de mapeo (nada fuera del mapa)

| Check | Estado |
|---|---|
| Cada vista actual tiene destino en la Ganadora | ✅ (tabla §1) |
| Ninguna ruta actual se elimina | ✅ (todas "No cambio de ruta") |
| Ningún componente se pierde | ✅ (`COMPONENT_MIGRATION_MATRIX`) |
| Todo destino nuevo es aditivo | ✅ (solo `/hardware-catalog`, `/proyectos`, opcionales) |

---

## 5. Referencias

- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — spec de la Ganadora.
- [`SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md`](SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md) — qué cambia.
- [`SIGCTIARURAL_ROUTE_EVOLUTION.md`](SIGCTIARURAL_ROUTE_EVOLUTION.md) — rutas y redirects.
- [`SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS.md`](SIGCTIARURAL_DASHBOARD_GAP_ANALYSIS.md) — qué falta/sobra/ampliar en el Dashboard.