# SIGCTIARURAL_LAB_PRESERVATION_STRATEGY — Preservación de laboratorios (nada queda huérfano)

**Familia:** Refactorización Global · **Gate:** U0.5 → U1 (transición a la Dashboard Ganadora)
**Estado:** `referencia` (formularios de preservación por área — sin código)
**Regla:** **NADA DESAPARECE** · ningún laboratorio queda huérfano en la migración.

---

## 1. Formulario de preservación (plantilla por laboratorio)

| Campo | Valor |
|---|---|
| **Área** | Electrónica / Telecomunicaciones / Programación / IA / Robótica / Matemáticas / Agricultura |
| **Componente(s) reales** | Archivos `src/frontend/src/**` |
| **Ruta actual** | URL activa (App.jsx) |
| **Estado hoy** | `operativo` / `referencia` / `diseño` |
| **Dependencias internas** | Puerto/adapter/script/data/vendor que no debe romperse |
| **Lugar en la Ganadora** | Sección Laboratorios + categoría `lab-data.js` + breadcrumb de la cadena |
| **Clasificación migración** | `PRESERVAR` / `AMPLIAR` |
| **Riesgo de quedar huérfano** | Ninguno / Medio (ver nota) |
| **Garantía de no-pérdida** | Cómo se verifica que permanece accesible |

---

## 2. Formularios por área (7)

### Área 1 · Electrónica (Física y Electrónica)

| Campo | Valor |
|---|---|
| Componentes | `ElectronicsLab.jsx`, `SchematicEditor.jsx`, `electronics/FalstadPanel.jsx`, `ports/circuitSimulationPort.js`, `adapters/falstadAdapter.js`, `adapters/legacySchematicEditorAdapter.js` |
| Ruta | `/lab-electronics` (App.jsx) |
| Estado | `operativo` (SchematicEditor legacy preservado vía adapter; Falstad Día 18-19) |
| Dependencias | Vendor Falstad `public/vendor/circuitjs1/**` (**NO TOCAR**); puerto/adapters hexagonales (**NO TOCAR**) |
| Lugar en la Ganadora | Sección Laboratorios → categoría **Física y Electrónica** (`lab-data.js`) |
| Clasificación | `PRESERVAR` (labs) + `NO TOCAR` (puertos/adapters/vendor) |
| Riesgo | Medio si un refactor reescribe ElectronicsLab o el `electronica.py` backend → prohibido (GR-07) |
| Garantía | `COMPONENT_MIGRATION_MATRIX` §2.3; GR-07; Falstad vendored intacto |

### Área 2 · Telecomunicaciones

| Campo | Valor |
|---|---|
| Componentes | `TelecomLab.jsx` |
| Ruta | `/lab-telecom` |
| Estado | `operativo` |
| Dependencias | `lab-data.js` (categoría Telecomunicaciones) |
| Lugar en la Ganadora | Sección Laboratorios → **Telecomunicaciones** |
| Clasificación | `PRESERVAR` |
| Riesgo | Ninguno |
| Garantía | Ruta congelada + categoría presente en LabCatalog |

### Área 3 · Programación (Sistemas Embebidos)

| Campo | Valor |
|---|---|
| Componentes | `EmbeddedLab.jsx` (programación embebida: C/Python/placas); complementos de programación general en AdvancedMath V1/V2 (JS/teoría) y DataScience (Python/Pyodide) |
| Ruta | `/lab-embedded` |
| Estado | `operativo` |
| Dependencias | `lab-data.js` (categoría **Sistemas Embebidos**) |
| Lugar en la Ganadora | Sección Laboratorios → **Sistemas Embebidos** |
| Clasificación | `PRESERVAR` |
| Riesgo | Ninguno (ver nota: "Programación general" se cubre por embebido + cálculo + data science; no hay lab aislado de programación que se pierda) |
| Garantía | Ruta congelada + categoría en LabCatalog |

### Área 4 · IA (Ciencia de Datos + IA Predictiva)

| Campo | Valor |
|---|---|
| Componentes | `DataScienceLab.jsx` (Pyodide/D3), `AIPredictiva.jsx`, `hooks/useRoboticsApi.js` (telemetría robot) |
| Rutas | `/data-science`, `/ai-predictive` |
| Estado | `operativo` |
| Dependencias | Backend `contexts/ai` (RobotTelemetry), `services/cloud.js` (si aplica) |
| Lugar en la Ganadora | Sección Laboratorios → **Ciencia de Datos**; eslabón **IA** de la cadena (breadcrumb) |
| Clasificación | `PRESERVAR` |
| Riesgo | Ninguno |
| Garantía | Rutas congeladas + breadcrumb eslabón IA |

### Área 5 · Robótica

| Campo | Valor |
|---|---|
| Componentes | `RoboticsLab.jsx` (3D scene, log, contratos), `hooks/useRoboticsApi.js` |
| Ruta | `/labs/robotics` |
| Estado | `operativo` |
| Dependencias | Backend `laboratorio_factory.py` (registra ROBOTICA), `robotics_contracts` (`src/backend/contexts/labs/...`); **preservar `telemetry`/`RobotTelemetry`** |
| Lugar en la Ganadora | Sección Laboratorios → **Robótica** |
| Clasificación | `PRESERVAR` |
| Riesgo | Medio si toca `RobotTelemetry` → prohibido (regla Misión) |
| Garantía | Ruta congelada + `RobotTelemetry` preservado (PA-08/GR-05) |

### Área 6 · Matemáticas

| Campo | Valor |
|---|---|
| Componentes | `AdvancedMathLab.jsx` (V1: cuántica, Newton, Caos), `AdvancedMathLabV2.jsx` (V2: Dr. Binary, calculadora), `mathHelpers.js` |
| Rutas | `/advanced-math`, `/advanced-math-v2` |
| Estado | `operativo` |
| Dependencias | `mathHelpers.js` (compartido), `labs/math-resources/README.md` |
| Lugar en la Ganadora | Sección Laboratorios → **Matemáticas Avanzadas** |
| Clasificación | `PRESERVAR` |
| Riesgo | Ninguno |
| Garantía | Rutas congeladas + ambas versiones en LabCatalog (desiredOrder incluye Matemáticas Avanzadas) |

### Área 7 · Agricultura (+ IA)

| Campo | Valor |
|---|---|
| Componentes | Representación frontend vía categoría **Agricultura + IA** en `lab-data.js` (tiles/vínculos del catálogo); capacidad backend `agricultura.py` (Strategy/Factory) |
| Ruta | vía `/labs` (LabCatalog) — sin página dedicada hoy |
| Estado | `operativo` (categoría) / `referencia` (backend strategy viva) |
| Dependencias | `lab-data.js` (categoría Agricultura + IA), `contexts/labs` (`agricultura.py` **NO TOCAR**) |
| Lugar en la Ganadora | Sección Laboratorios → **Agricultura + IA** (primer eslabón natural de la cadena rural) |
| Clasificación | `PRESERVAR` |
| Riesgo | Medio si se rompe `agricultura.py` o si el breadcrumb ignora el lab → prohibido (GR-06) |
| Garantía | Categoría en LabCatalog + breadcrumb cadena (Conocimiento→…→Agricultura→Proyectos); `agricultura.py` intacto |

---

## 3. Matriz "nada queda huérfano" (cobertura total)

| Área | Categoría `lab-data.js` | Ruta(s) | En LabCatalog (desiredOrder) | En breadcrumb cadena | Huérfano? |
|---|---|---|---|---|---|
| Electrónica | Física y Electrónica | `/lab-electronics` | ✅ Puesto 3 | ✅ Hardware→Protocolos | No |
| Telecomunicaciones | Telecomunicaciones | `/lab-telecom` | ✅ Puesto 4 | ✅ Protocolos→Telemetría | No |
| Programación (Embebidos) | Sistemas Embebidos | `/lab-embedded` | ✅ Puesto 2 | ✅ Hardware→Protocolos | No |
| IA | Ciencia de Datos | `/data-science`, `/ai-predictive` | ✅ Puesto 6 | ✅ IA (eslabón) | No |
| Robótica | Robótica | `/labs/robotics` | ✅ Puesto 1 | ✅ Telemetría (robot) | No |
| Matemáticas | Matemáticas Avanzadas | `/advanced-math*` | ✅ Puesto 7 | ✅ Antes/después de la cadena (STEM) | No |
| Agricultura | Agricultura + IA | vía `/labs` | ✅ Puesto 5 | ✅ Origen rural de la cadena | No |
| Knowledge Hub | — (reubicado desde Documentación Técnica) | `/knowledge*` | Retirado de grid por diseño (Fase 9A), contenido intacto en `lab-data.js` | ✅ Conocimiento (raíz) | No |

**Nota honestidad:** "Documentación Técnica" fue retirado **voluntariamente** de la grilla de
`LabCatalog` (el contenido/enlaces siguen en `lab-data.js` y vive en Knowledge Hub). No es un lab
huérfano: es un **reubicado** documentado (se preserva íntegro). Este y cualquier reubicado futuro
siempre registra la categoría origen en `lab-data.js`.

---

## 4. Criterios de no-huérfano (aceptación)

1. Todo lab tiene **ruta activa** (o vínculo aditivo válido) y **entrada** en LabCatalog o en la
   nueva sección Laboratorios.
2. Todo lab tiene **dependencias** catalogadas (puerto/adapter/vendor/backend) bajo `NO TOCAR` o
   `PRESERVAR` (matriz §2.4).
3. Todo lab tiene **lugar en la cadena** (breadcrumb) — nada cuelga fuera de la cadena.
4. Si un lab se "reubica" (como Documentación Técnica → Knowledge Hub), su contenido previo
   permanece (`lab-data.js`) y se documenta.

---

## 5. Referencias

- [`SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md`](SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md) — mapa de labs y vacíos GLC.
- [`SIGCTIARURAL_VISION_ALIGNMENT.md`](SIGCTIARURAL_VISION_ALIGNMENT.md) — cadena pedagógica.
- [`SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md`](SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md) — clasificación.
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) — GR-06/07/08.
- [`SIGCTIARURAL_PRESERVATION_AUDIT.md`](SIGCTIARURAL_PRESERVATION_AUDIT.md) — PA-12 (labs fuera de `/labs/*`).