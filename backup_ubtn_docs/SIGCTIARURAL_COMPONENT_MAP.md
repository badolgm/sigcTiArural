# SIGCTIARURAL_COMPONENT_MAP — Mapa completo de componentes existentes/faltantes

**Familia:** Refactorización Global · **Gate:** U0 → U0.5 → Preservación + Expansión
**Estado:** `referencia` (inventario verificado del estado del sistema)
**Veracidad:** generado a partir de inspección directa del filesystem (no suposiciones).

---

## 1. Propósito

Inventariar **TODO** lo que existe en SIGCTiArural hoy: qué está, qué no está y qué evoluciona.
Este mapa es la fuente de verdad de la **Misión Crítica: Preservación + Expansión** y se
complementa con [`PRESERVATION_STRATEGY`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) y
[`EVOLUTION_MATRIX`](SIGCTIARURAL_EVOLUTION_MATRIX.md).

---

## 2. Frontend (`src/frontend/src/`) — Inventario completo verificado

### 2.1. Páginas principales (`pages/`)

| Archivo | Ruta/App | Estado hoy | Evolución |
|---|---|---|---|
| `Dashboard.jsx` | `/dashboard` (App) | **operativo** (encabezado científico, BBB-01/02/03, telemetría V3 + fallback, gráfica, 5 tiles "Integraciones Futuras") | Se reorganiza (vista Operación + Telemetría); componentes preservados |
| `AIPredictiva.jsx` | `/ai-predictive` | **operativo** | Se integra en la cadena, sin cambio funcional |
| `DataScienceLab.jsx` | `/data-science` | **operativo** | Se integra a Laboratorios; NO eliminado |
| `LabCatalog.jsx` | `/labs` | **operativo** (lista kanban de labs) | Se reorganiza en sección Labs (4 canónicos + experiencia + STEM) |
| `Register.jsx` | (no ruteado) | **latente** (autenticación) | Se preserva como capacidad futura; no rutear aún (GIA) |
| `Login.jsx` | (no ruteado) | **latente** | Ídem |
| `Admin2FA.jsx` | (no ruteado) | **latente** | Ídem (requiere autenticación avanzada) |
| `_deprecated/DocsReadme.jsx` | (no ruteado) | `deprecated` | Se preserva como legado (ya migrado a Knowledge Hub) |
| `_deprecated/DocsPlanMaestro.jsx` | (no ruteado) | `deprecated` | Ídem |
| `_deprecated/DocsMasterdoc.jsx` | (no ruteado) | `deprecated` | Ídem |
| `_deprecated/DocsEdgeSetup.jsx` | (no ruteado) | `deprecated` | Ídem |
| `_deprecated/DocsApiReference.jsx` | (no ruteado) | `deprecated` | Ídem |

### 2.2. Laboratorios (`labs/`)

| Archivo | Ruta/App | Estado hoy | Evolución |
|---|---|---|---|
| `RoboticsLab.jsx` | `/labs/robotics` | **operativo** (3D Scene, log, contratos robot) | Se integra al catálogo Labs (canónico: robótica) |
| `EmbeddedLab.jsx` | `/lab-embedded` | **operativo** | Se integra a Labs (experiencia) |
| `TelecomLab.jsx` | `/lab-telecom` | **operativo** | Se integra a Labs (canónico: telecomunicaciones) |
| `ElectronicsLab.jsx` | `/lab-electronics` | **operativo** (SchematicEditor legacy, FalstadPanel) | Se integra a Labs (canónico: electrónica); SchematicEditor preservado |
| `AdvancedMathLab.jsx` | `/advanced-math` | **operativo** | Se integra a Labs (experiencia avanzada) |
| `AdvancedMathLabV2.jsx` | `/advanced-math-v2` | **operativo** | Se integra a Labs (STEM) |
| `SchematicEditor.jsx` | (componente de lab, no ruta propia) | **referencia** (legacy, vía adapter) | Preservado; se migra a WebAssembly (GR-07) |
| `FalstadPanel.jsx` | (dentro de ElectronicsLab) | **operativo** (Día 18-19) | Se preserva |
| `electronics/FalstadPanel.jsx` | Ídem | operativo | Ídem |
| `electronics/ports/circuitSimulationPort.js` | (puerto hexagonal) | **operativo** | Preservado (GR-07) |
| `electronics/adapters/legacySchematicEditorAdapter.js` | (adapter) | **operativo** | Preservado |
| `electronics/adapters/falstadAdapter.js` | (adapter) | **operativo** | Preservado |
| `mathHelpers.js` | (utilidad compartida) | operativo | Preservado |

### 2.3. Componentes (`components/`)

| Archivo | Uso hoy | Evolución |
|---|---|---|
| `TopNav.jsx` | Barra fija superior: logo, nav items (Dashboard, Labs, IA Predictiva, Conocimiento), dot estado del clúster (BBB-01/02/03) | Se amplía (añadir Hardware, Proyectos) sin quitar elementos |
| `Dashboard` (llamado desde TopNav) | Ver §2.1 | Ver §2.1 |
| `TelemetryPanel.jsx` | Panel de telemetría (llamado por Dashboard) | Se integra en sección Telemetría |
| `GlobalChart.jsx` | Gráfica de telemetría (llamada por Dashboard) | Se integra en sección Telemetría |
| `Telemetry3DScene.jsx` | Visualización 3D (llamado por Dashboard) | Se integra en sección Telemetría |
| `ClusterCard.jsx` | Tarjeta de BBB-01/02/03 (llamada por Dashboard) | Se integra en sección Operación |
| `LoginModal.jsx` | Modal de login (gate de acciones que requieren auth) | Se preserva (capacidad latente; auth aún sin ruteo) |
| `VoiceAssistant.jsx` | Asistente de voz flotante + `routeMap` (12 rutas) | Se preserva y **amplía** (nuevas rutas en `routeMap`) |
| `ErrorBoundary.jsx` | Contenedor de errores global (App) | Preservado |
| `AuthGuard.jsx` | Protección de rutas privadas (no usado en App.jsx) | Se preserva como capacidad latente |

### 2.4. Auth (`auth/`)

| Archivo | Estado | Notas |
|---|---|---|
| `AuthContext.jsx` | `latente` (no ruteado, no usado en App) | Proveedor de contexto de autenticación; NO eliminar; capacidad futura |

### 2.5. Hooks, servicios, datos, stores, conocimiento

| Archivo | Estado | Notas |
|---|---|---|
| `hooks/useRoboticsApi.js` | **operativo** | Hook de telemetría robótica; preservado |
| `services/cloud.js` | **operativo** | `fetchClusterNodesReal`, `fetchTelemetrySeriesReal`; fuente del Dashboard |
| `data/lab-data.js` | **operativo** | Datos estáticos de labs; fuente de verdad pedagógica |
| `stores/useLabStore.js` | **operativo** | Estado de laboratorios; preservado |
| `knowledge-hub/registry/knowledgeRegistry.generated.json` | **operativo** (51 docs) | Registro generado; se amplía (familias UBTN/SIGCTIARURAL al índice) |
| `knowledge-hub/services/docLoader.js` | operativo | Servicio de carga de docs |
| `knowledge-hub/services/markdownRenderUtils.js` | operativo | Utilidades de renderizado Markdown |
| `knowledge-hub/pages/KnowledgeHubLayout.jsx` | **operativo** | Layout del hub; se preserva |
| `knowledge-hub/components/MarkdownDocumentView.jsx` | operativo | Visor de Markdown |

---

## 3. Backend (resumen — no se detallan aquí a menos que presencia frontal)

| Contexto | Estado hoy | Relevancia para la v2 |
|---|---|---|
| `src/backend/contexts/labs/` | **operativo** (Strategy/Factory, 4 labs) | Corazón que conecta laboratorios; se preserva tal cual |
| `src/backend/contexts/telemetry/` | **operativo** | Base de la capa de telemetría (V1/V2/V3); se preserva |
| `src/backend/contexts/ai/` | **operativo** (RobotTelemetry, ML) | Se preserva |
| `src/backend/contexts/shared_kernel/` | **operativo** (EventBus, puertos) | Plomería; sin tocar |
| APIs V1/V2/V3 (`/api/v1/...`, `/api/v2/...`, `/api/v3/telemetry/history/`) | **operativas** (consumidas por Dashboard) | Se preservan; V3 consumido actualmente |

---

## 4. Hardware/edge (`src/embedded/`)

| Archivo/nodo | Estado hoy | Evolución |
|---|---|---|
| BBB-01 Gateway (`bbb_01_gateway/`) | `referencia` (scripts de 0 bytes; integración física "en progreso") | Se preserva como referencia; se muestra como `referencia` en Operación |
| BBB-02 IA Edge (`bbb_02_ai_edge/`) | `referencia` (scripts de 0 bytes) | Ídem |
| BBB-03 Sensors (`bbb_03_sensors/`) | `referencia` (scripts de 0 bytes) | Ídem |

---

## 5. Hardware físico (inventario real vs representación)

| Hardware | Real hoy | En el Dashboard/representación | Status actual | Evolución |
|---|---|---|---|---|
| BBB-01/02/03 | 3 placas de referencia | ClusterCard + datos + dot TopNav | `referencia` | Preservado; deja de ser centro del universo |
| ESP32 | Referencia (piscicultura/Colombia) | Sin representación propia en Dashboard | `referencia` | Se añade al Hardware Catalog como entrada |
| Jetson Nano / Xavier NX | Mencionado en docs | Sin representación en Dashboard | `referencia` | Se añade al Hardware Catalog como entrada |
| STM32 / Arduino / Raspberry Pi | 0 bytes (referencia) / tiles futuros | RPI-05 tile (Dashboard); sin STM32/Arduino tile propio | `vacío` | Se añaden al Hardware Catalog como entradas |
| FPGA Moderna | Referencia (tile FPGA-X en Dashboard) | Tile FPGA-X con enlace AMD | `vacío` | Se integra al Hardware Catalog como entrada |
| Drones / PX4 / ArduPilot | Referencia (tile DRONE-NAV en Dashboard) | Tile DRONE-NAV | `vacío` | Se integra al Hardware Catalog como entrada |
| Alexa / Google Assistant | Referencia (tile ALEXA-IOT) | Tile ALEXA-IOT | `vacío` | Se integra al Hardware Catalog como entrada |
| UBTN (ESP32 wearable) | Diseño U0 | Sin representación visual aún | `diseño` | Se integra como capacidad/proyecto en la v2 |

---

## 6. Familias documentales (docs/)

| Familia | N° docs | Estado hoy | Evolución |
|---|---|---|---|
| UBTN (`UBTN_*`) | 26 (Fase U0 cerrada) | `referencia` | Se integra al mapa documental; UBTN = capacidad/proyecto |
| SigcTiArural (U0.5): `SIGCTIARURAL_VISION`, `DASHBOARD_NAVIGATION_MODEL`, `HARDWARE_LEARNING_MODEL`, `CAPABILITIES_VS_HARDWARE`, `REFACTORING_GUARDRAILS`, `DASHBOARD_REIMAGINED_V2` | 6 (Gate U0.5) | `referencia` | Familia U0.5 vigente; gobierna la refactorización |
| Preservación (U0.5): `PRESERVATION_STRATEGY`, `COMPONENT_MAP`, `EVOLUTION_MATRIX`, `NAVIGATION_EVOLUTION`, `IMPLEMENTATION_READINESS`, `PRESERVATION_AUDIT` | 6 (Misión Crítica) | `diseño` (esta misión) | Se integran a la familia; se completan iterativamente |
| Knowledge Hub (51 docs operativos) | 51+ | `operativo` | Se amplía; schema U1 bn/json preservado |
| Históricos/EIARC (`EIARC_*`, `architect_master/*`, `project_knowledge_base/*`) | Muchos | `deprecated`/legado | Se preservan; se catalogan en Knowledge Hub; NO se borran |
| PLAN_MAESTRO, MASTERDOC, SYSTEM_BOOT | 3 | `operativo` | Se mantienen al día con bitácora |
| Blockchain, FarmingTRM, IoT AWS, Specs | ~10 | `referencia` | Se preservan como legado/referencia |

---

## 7. Qué falta hoy (gaps)

| N° Gap | Qué falta | Quién lo reporta |
|---|---|---|
| **GAP-01** | Ruta `/hardware-catalog` (vista de catálogo honesta por capacidad/fase, NO por identidad BBB) | SIGCTIARURAL_REFACTORING_AUDIT C-03 |
| **GAP-02** | Ruta `/proyectos` (vista de proyectos reales) | SIGCTIARURAL_REFACTORING_AUDIT C-03 |
| **GAP-03** | Selector de persona (5 personas; Agricultor gated por MVP) | DASHBOARD_REIMAGINED_V2 §10.2, NAVIGATION_MODEL M4 |
| **GAP-04** | Código de Auth (rutas `/login`, `/register`, `/admin-2fa`, `AuthGuard` con policy) | IMPLEMENTATION_READINESS |
| **GAP-05** | Trazabilidad de evidencia (papelera funcional): `EvidenciaTracking`, `EvidenceRepositoryPort` | SigcTiArural v2 (gate U1 posterior) |
| **GAP-06** | Fuente de datos real para BBB (actualmente 0 bytes; solo fallback/estática) | HARDWARE_LEARNING_MODEL GHL-01 |
| **GAP-07** | Contexto/port Hardware (capacidad): `HardwareContext` + `HardwareCatalogRepositoryPort` | IMPLEMENTATION_READINESS |
| **GAP-08** | Representación honesta de UBTN en la interfaz (vista sin falso estado) | DASHBOARD_REIMAGINED_V2 §10.2 |

---

## 8. Convenciones del mapa

| Término | Significado (único en toda la familia) |
|---|---|
| `operativo` | Código funcional, consume datos reales o símil; ruta activa |
| `referencia` | Hardware/documentación/doc que existe pero no consume datos (scripts de 0 bytes, versiones de referencia, entidades de diseño U0) |
| `diseño` | Diseño sin código (Familia U0.5/U0) |
| `vacío` | Hardware que se conoce pero no tiene representación real en el Dashboard (tiles futuro, hardware sin inventariar) |
| `latente` | Código que existe y se preserva, pero no está activado (auth, Admin2FA) |
| `deprecated` | Código/doc migrado pero preservado como legado (no se borra) |

---

## 9. Referencias

- [`SIGCTIARURAL_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) — qué se preserva y por qué.
- [`SIGCTIARURAL_EVOLUTION_MATRIX.md`](SIGCTIARURAL_EVOLUTION_MATRIX.md) — evolución de cada módulo.
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — spec visual del dashboard.
- [`SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md`](SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md) — ladder de aprendizaje hardware.
- [`SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md`](SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md) — hardware ≠ capacidad.