# SIGCTIARURAL_EVOLUTION_MATRIX — Matriz de evolución por módulo

**Familia:** Refactorización Global · **Gate:** U0 → U0.5 → Preservación + Expansión
**Estado:** `referencia` (análisis, no implementación)
**Principio rector:** Nada desaparece; la evolución es por ampliación, no por sustitución.

---

## 1. Propósito

Para **cada módulo** de SIGCTiArural, definir:
- Estado actual
- Estado futuro
- Compatibilidad con lo existente
- Riesgo de evolución
- Prioridad de evolución

Las prioridades son indicativas de **secuencia de diseño** (gate U0.5 → U1), no de implementación.
**No hay implementación en este gate** (regla de la Misión).

---

## 2. Nota de uso

- **Compatible** = la evolución NO rompe funcionalidad existente (ampliación pura).
- **Incompatible** = requiere cambio de contrato/ruta/interfaz de manera que la versión anterior
  no funciona sin migración → **prohibido en el gate U0.5**, requiere Fase 8+ y migración documentada.
- **Riesgo ALTO** = la evolución afecta la experiencia del usuario, contratos de dominio o
  conexión con hardware real.
- **Prioridad** = en qué orden se diseña (P0 primero, P2 después); no implica que se implemente
  antes (ver `IMPLEMENTATION_READINESS`).

---

## 3. Matriz por módulo

### 3.1. Dashboard principal (encabezado + gráfica V3 + fallbacks)

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — Encabezado científico Edge, datos BBB-01/02/03 (fallback/estática), telemetría V3 (`fetchTelemetryEnvelope` → `/api/v3/telemetry/history/`), `GlobalChart`, `TelemetryPanel`, gráfica fallback, 5 tiles "Integraciones Futuras" (RPI-05/FPGA-X/ARDUINO/ALEXA-IOT/DRONE-NAV) con links externos |
| **Estado futuro** | Se reorganiza en **sección Operación** (BBB-01/02/03 + ClusterCard + dot TopNav) + **sección Telemetría** (V3 + GlobalChart + TelemetryPanel + 3DScene). Los 5 tiles se realojan como entradas del Hardware Catalog (`vacío/futuro`) |
| **Compatibilidad** | **Alta** — se reorganiza contenido interno de Dashboard.jsx sin cambiar rutas ni eliminan componentes |
| **Riesgo** | `bajo` — se preservan todos los componentes; cambia solo la composición visual |
| **Prioridad** | P0 |

### 3.2. TopNav (navegación superior)

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — Items: Dashboard, Laboratorios, IA Predictiva, Conocimiento; dot de estado clúster (BBB-01/02/03); logo SIGC&T RURAL |
| **Estado futuro** | Se amplía con: Hardware, Proyectos. Dot de estado preservado (se mantiene como referencia de BBB) |
| **Compatibilidad** | **Alta** — solo se añaden items; los existentes no cambian |
| **Riesgo** | `bajo` |
| **Prioridad** | P0 |

### 3.3. Telemetría (panel, gráfica, 3D scene, V3)

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — `TelemetryPanel`, `GlobalChart`, `Telemetry3DScene`, API V3 (`{context:'telemetry', items:[]}`) + fallbacks V1/V2 |
| **Estado futuro** | Se integra en sección dedicada de la nueva composición del Dashboard (o ruta `/telemetry`). Componentes preservados; se añade acceso a UBTN (bioseñal conceptual) |
| **Compatibilidad** | **Alta** — componentes intactos, solo se realojan |
| **Riesgo** | `bajo` |
| **Prioridad** | P0 |

### 3.4. Laboratorios (canónicos)

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — 4 canónicos (Robótica, Telecomunicaciones, Electrónica, Agricultura — Strategy/Factory en backend) + experiencia (AdvancedMath V1/V2, DataScience) + STEM (Embedded); rutas `/labs/*`, `/advanced-math*`, `/data-science` |
| **Estado futuro** | Se integran a la **sección Labs** (cadena Conocimiento→...→Proyectos); breadcrumb preservado; catálogo ampliado (ETF con predictivo, adaptado, automotriz) como entradas en Hardware Catalog si se vinculan a hardware |
| **Compatibilidad** | **Alta** — rutas intactas, componentes intactos |
| **Riesgo** | `bajo` |
| **Prioridad** | P0 |

### 3.5. Laboratorios (experiencia / STEM)

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — AdvancedMath V1 (cuántica, Newton, Caos), V2 (Dr. Binary, calculadora), DataScience (Pyodide, D3) |
| **Estado futuro** | Se integran a Labs como experiencia/STEM; nuevos labs se añaden aditivamente |
| **Compatibilidad** | **Alta** |
| **Riesgo** | `bajo` |
| **Prioridad** | P1 |

### 3.6. Electrónica / SchematicEditor / Falstad

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — ElectronicsLab usa `SchematicEditor.jsx` (legacy), `FalstadPanel.jsx`, `circuitSimulationPort.js`, `falstadAdapter.js`, `legacySchematicEditorAdapter.js` (hexagonal) |
| **Estado futuro** | Se preservan tal cual (Día 18/19 es trabajo reciente); SchematicEditor se migra a WebAssembly cuando sea viable (largo plazo) |
| **Compatibilidad** | **Alta** |
| **Riesgo** | `bajo` |
| **Prioridad** | P2 (preservar, no tocar) |

### 3.7. Knowledge Hub (Conocimiento)

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — 51 docs operativos, `knowledgeRegistry.generated.json`, `KnowledgeHubLayout`, `MarkdownDocumentView`, `docLoader`, `markdownRenderUtils` |
| **Estado futuro** | Se amplía: familias UBTN/SIGCTIARURAL se integran al índice; schema bn/json (U1) se añade sin romper existente |
| **Compatibilidad** | **Alta** — aditivo |
| **Riesgo** | `bajo` |
| **Prioridad** | P0 |

### 3.8. Voice Assistant

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — 12 comandos de navegación en `routeMap` (dashboard/labs/robotics/ai/docs/math/etc.), flotante |
| **Estado futuro** | Se **amplía** su `routeMap` con nuevas rutas (Hardware, Proyectos, UBTN si se valida). Nunca se reduce |
| **Compatibilidad** | **Alta** — solo se añaden comandos |
| **Riesgo** | `bajo` |
| **Prioridad** | P1 |

### 3.9. Auth (Login/Register/Admin2FA/AuthGuard/LoginModal)

| | Detalle |
|---|---|
| **Estado actual** | `latente` — Componentes existen pero NO están ruteados en App.jsx; LoginModal sí se usa en Dashboard para gating |
| **Estado futuro** | Se preservan como capacidad latente; rutear solo tras decisión explícita (gate U1, política GIA) |
| **Compatibilidad** | **Alta** (si se rutearan sería aditivo) |
| **Riesgo** | `medio` — activar auth puede cambiar experiencia del usuario; requiere decisión explícita |
| **Prioridad** | P2 (diseño en IMPLEMENTATION_READINESS, no implementar aún) |

### 3.10. Hardware Catalog (nuevo)

| | Detalle |
|---|---|
| **Estado actual** | `vacío` — No existe ruta ni vista; tiles "Integraciones Futuras" proveen seed parcial |
| **Estado futuro** | **Ruta `/hardware-catalog`** (o sección dentro de Dashboard) con entradas por capacidad/fase (NO por identidad BBB): BBB Gateway, BBB IA Edge, BBB Sensores, ESP32, STM32, Raspberry, FPGA, Arduino, Drones, Alexa/Google, UBTN; estado honesto (`operativo`/`referencia`/`vacío`) |
| **Compatibilidad** | **Alta** — ruta nueva aditiva; tiles reales se realojan |
| **Riesgo** | `bajo` |
| **Prioridad** | P1 |

### 3.11. Persona Selector / IA por persona

| | Detalle |
|---|---|
| **Estado actual** | `vacío` — No existe selector ni flujos por persona |
| **Estado futuro** | Selector de 5 personas (Estudiante ADSO, Instructor, Investigador, Desarrollador, Agricultor=futuro gated) → dashboard filtrado por IA canónica |
| **Compatibilidad** | **Alta** — se añade aditivo (nuevo componente/página); no rompe nada |
| **Riesgo** | `bajo` |
| **Prioridad** | P1 (MVP): Estudiante/Investigador/Desarrollador. P2: Agricultor (gated) |

### 3.12. UBTN en la interfaz

| | Detalle |
|---|---|
| **Estado actual** | `diseño` — 26 docs; sin representación visual real |
| **Estado futuro** | Vista de telemetría biológica conceptual (no tiles fake); `BiologicalNode` como capacidad/proyecto, integrado a la cadena |
| **Compatibilidad** | **Alta** — ruta conceptual nueva o sección (sin estados falsos) |
| **Riesgo** | `bajo` |
| **Prioridad** | P2 (gate U1, tras A-7) |

### 3.13. Proyectos Reales (nuevo)

| | Detalle |
|---|---|
| **Estado actual** | `vacío` — No existe ruta ni vista |
| **Estado futuro** | Ruta `/proyectos` (aditiva); casos de uso reales documentados en la cadena |
| **Compatibilidad** | **Alta** |
| **Riesgo** | `bajo` |
| **Prioridad** | P1 |

### 3.14. Navegación (TopNav + Voice Assistant + breadcrumb)

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — TopNav 4 items, Voice 12 comandos, rutas 12 rutas activas |
| **Estado futuro** | TopNav ampliado (+Hardware, +Proyectos, +Data Science), Voice ampliado, breadcrumb-preservado, aliases sin rotos |
| **Compatibilidad** | **Alta** |
| **Riesgo** | `bajo` |
| **Prioridad** | P0 (aditivo, no rompe hábitos) |

### 3.15. ClusterBBB en Dashboard / TopNav

| | Detalle |
|---|---|
| **Estado actual** | `operativo` — 3 BBB con fallback, dot en TopNav, ClusterCard |
| **Estado futuro** | Se integra a **sección Operación** (dentro de la nueva composición del Dashboard); dot TopNav se preserva |
| **Compatibilidad** | **Alta** |
| **Riesgo** | `bajo` |
| **Prioridad** | P0 |

### 3.16. Código legado/aux (`_deprecated/*`, `SYSTEM ONLINE` banner, `ErrorBoundary`)

| | Detalle |
|---|---|
| **Estado actual** | `deprecated`/`latente` — 5 páginas docs migradas, banner debug, contenedor de errores |
| **Estado futuro** | Se preservan tal cual (NO se eliminan); se documentan como legado histórico |
| **Compatibilidad** | **Alta** (no se tocan) |
| **Riesgo** | `bajo` |
| **Prioridad** | N/A (solo preservar) |

---

## 4. Resumen de prioridades

| Prioridad | Módulos |
|---|---|
| **P0** (diseñar primero, sin tocar `src/`) | Dashboard (reorganización), TopNav (aditivo), Telemetría (reubicación), Labs canónicos, Knowledge Hub, Navegación (ampliación), ClusterBBB |
| **P1** (diseñar después, Gate U1 siguiente) | Labs experiencia/STEM, Voice Assistant, Hardware Catalog (ruta nueva), Persona Selector/IA por persona (MVP: Estudiante/Investigador/Desarrollador), Proyectos Reales (ruta nueva) |
| **P2** (largo plazo, requiere decisión) | Auth (rutear), Electrónica/SchematicEditor (preservar), UBTN en interfaz (gate U1 tras A-7), Persona Agricultor (gated) |
| **N/A** | Legado, banner debug, ErrorBoundary (solo preservar) |

---

## 5. Gobernanza

- Esta matriz se revisa con cada nueva auditoría (PRESERVATION_AUDIT) y al gate U1.
- Cualquier módulo cuya evolución sea "incompatible" requiere un ADR/propuesta específica antes de diseñar.
- **No hay implementación** en este gate; la matriz gobierna la **secuencia de diseño**.

---

## 6. Referencias

- [`SIGCTIARURAL_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) — qué se preserva y por qué.
- [`SIGCTIARURAL_COMPONENT_MAP.md`](SIGCTIARURAL_COMPONENT_MAP.md) — inventario completo del filesystem.
- [`SIGCTIARURAL_IMPLEMENTATION_READINESS.md`](SIGCTIARURAL_IMPLEMENTATION_READINESS.md) — qué está listo para U1.
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — spec visual del dashboard.