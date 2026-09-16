# SIGCTIARURAL_PRESERVATION_STRATEGY — Estrategia de Preservación del Ecosistema

**Familia:** Refactorización Global · **Gate:** U0 → U0.5 → Preservación + Expansión
**Estado:** `referencia` (estrategia vigente para toda la refactorización)
**Regla suprema:** **NADA DESAPARECE.** La evolución es por **ampliación**, no por sustitución.

---

## 1. Propósito

Definir **qué se preserva, qué se protege y qué jamás debe romperse** de SIGCTiArural, con la
justificación de cada elemento. Este documento es el punto de entrada de la **Misión Crítica:
PRESERVACIÓN + EXPANSIÓN DEL ECOSISTEMA** y gobierna a los demás documentos de la familia
(`COMPONENT_MAP`, `EVOLUTION_MATRIX`, `NAVIGATION_EVOLUTION`, `IMPLEMENTATION_READINESS`,
`PRESERVATION_AUDIT`) y a la revisión de `DASHBOARD_REIMAGINED_V2`.

`SIGCTiArural` **no** se rediseña para sustituir lo existente: se refactoriza para **preservar,
organizar, conectar y expandir**. Todo lo construido hasta hoy tiene valor histórico, técnico,
educativo y arquitectónico.

---

## 2. Principios de la preservación

1. **NADA DESAPARECE** — ningún componente, doc, contexto, entidad de dominio o ruta se elimina
   como resultado de esta refactorización.
2. **Evolución por ampliación** — las capacidades nuevas se añaden **al lado** de las existentes;
   las existentes se reorganizan o se realojan, nunca se borran.
3. **Los BBB dejan de ser el centro del universo, pero siguen existiendo** — su rol, datos y
   representación se conservan; simplemente se integran a un diagrama de hardware más grande.
4. **El conocimiento histórico es un activo** — docs superados, bitácoras y legado se preservan y
   se catalogan (los `_deprecated/*` no se eliminan; se documentan como historia).
5. **La interfaz es evolución, la identidad es inviolable** — la IA/cadena pedagógica
   (Conocimiento → Laboratorios → Hardware → Protocolos → Telemetría → IA → Proyectos Reales) y el
   corazón educativo/científico (GR-01..GR-12) jamás se sacrifican por estética.
6. **Estado honesto sobre estado bonito** — se preserva la información; si un estado no tiene
   procedencia real, se muestra como `referencia`/`vacío`, no se borra.

---

## 3. Qué se preserva (inventario inviolable)

### 3.1. Hardware/proyecto (identidad de campo)

| Ítem | Preservado tal como | Justificación |
|---|---|---|
| **BBB-01 Gateway / MQTT Broker** | Rol, ID, tarjeta, datos/fallback, dot de estado en TopNav | Es el origen operativo del clúster; su rol de gateway y MQTT es histórico y educativo |
| **BBB-02 IA Edge / TFLite** | Ídem + diagnóstico de ejemplo (`Enfermedad Detectada`) | Demuestra el concepto de inferencia en el borde; pieza de la cadena de IA |
| **BBB-03 Adquisición de Datos / Sensores IoT** | Ídem (estado offline = honesto, no se maquilla) | Representa la capa de sensores; su estado real (0 bytes, script de referencia) no se oculta |
| Superficie de hardware, sensores y protocolos (DHT22, humedad, MQTT/pub-sub, TFLite) | Catálogo y docs | Base del modelo de aprendizaje por hardware |

### 3.2. Contextos de backend / dominio (mundo productivo)

| Contextos existentes | Preservación | Justificación |
|---|---|---|
| `labs` (Strategy/Factory: AGRICULTURA, TELECOMUNICACIONES, ROBÓTICA, ELECTRÓNICA) | Tres capas internas, puertos/adaptadores intactos | Es la evolución concreta de los 4 labs canónicos y el corazón hexagonal |
| `telemetry` | Entidades/eventos intactos | Telemetría es eslabón de la cadena; su modelo se amplía, no se sustituye |
| `ai` / `labs.robotica` (RobotTelemetry) | Entidades y contratos intactos | Telemetría robótica es una capacidad actual reutilizable por la cadena |
| `shared_kernel` (EventBus, wiring, etc.) | Sin tocar | Plomería que conecta contextos; romperla rompe el sistema |
| V1/V2/V3 API / envelopes | Sin tocar (V3 `{context:'telemetry', items:[]}` consumido por Dashboard) | Compatibilidad con frontend actual y futura telemetría |

### 3.3. Modelo de datos / contrato inviolable

| Único | Por qué jamás se toca |
|---|---|
| `SensorReading` | Contrato de lectura de sensores existente; está prohibido modificarlo (regla de la Misión); se preserva tal cual |
| `Telemetry` context (eventos, V1-V3) | Base operativa del Dashboard y de gráficas históricas |
| `RobotTelemetry` | Capacidad de la línea robótica; se preserva y se le da eslabón claro |
| `lab-data.js` / `LabCatalog` | Datos estáticos de labs actuales; son la "verdad pedagógica" visible hoy |

### 3.4. Frontend (cada componente y ruta)

Todas las rutas actuales se preservan (regla C-03): `/dashboard`, `/labs`, `/ai-predictive`,
`/data-science`, `/labs/robotics`, `/advanced-math`, `/advanced-math-v2`, `/lab-embedded`,
`/lab-telecom`, `/lab-electronics`, `/knowledge`, `/knowledge/doc/:docId`, 404 → `/dashboard`.

Componentes que no se eliminan: `TopNav`, `Dashboard`, `ClusterCard`, `GlobalChart`,
`TelemetryPanel`, `Telemetry3DScene`, `LoginModal`, `ErrorBoundary`, `VoiceAssistant`,
`AuthGuard`, `AuthContext`, `useLabStore`, `useRoboticsApi`, `cloud.js`, `markdownRenderUtils`,
`docLoader`, `lab-data.js`. Ver [`COMPONENT_MAP`](SIGCTIARURAL_COMPONENT_MAP.md) §2 (inventario completo).

- **Dashboard** con su encabezado científico, telemetría V3 y fallbacks: preservado.
- **Integraciones Futuras (RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV)**: preservadas
  como entradas del Hardware Catalog (identidad, ícono, rol y enlaces intactos), sin estado falso
  `construction` (ver `DASHBOARD_REIMAGINED_V2` §10.2).
- **Voice Assistant**: nunca se reduce su `routeMap`; solo se amplía.

### 3.5. Aplicaciones/capacidades transversales

| Capacidad | Preservar |
|---|---|
| Dashboard + Dashboard Científico (Edge) | Completo |
| Telemetría (panel, gráfica, 3D scene, V3) | Completo |
| IA Predictiva (`/ai-predictive`) | Ruta y función |
| Laboratorios (4 canónicos + experiencia/STEM: AdvancedMath V1/V2, DataScience, SchematicEditor/Falstad, Embedded, Telecom, Robotics, Electronics) | Todos, en su lugar |
| Conocimiento / Knowledge Hub (MVP + entrada Fase 9A; 51 docs operativos, registro generado) | Completo, operativo |
| Hardware (BBB + futuro catálogo) | Preservado y expandido |
| Proyectos (Proyectos Reales) | Conceptual, preservado como capacidad |
| Auth (Login/Register/Admin2FA/AuthContext/AuthGuard/LoginModal) | Preservado como **capacidad latente** (aún sin rutas propias; ver §3.5.1) |
| Procesadores: SchematicEditor (legacy) + FalstadAdapter/legacySchematicEditorAdapter | Preservados (vía `circuitSimulationPort`) |

#### 3.5.1. Capacidades latentes (existen, están preservadas, no están activadas)

Se inventarían y **no se eliminan**: `Login`, `Register`, `Admin2FA`, `AuthGuard`, `AuthContext`
y el `LoginModal` ya usado por el Dashboard. Su ruteo público y política (GIA) se decide en
`IMPLEMENTATION_READINESS` — jamás se borran.

### 3.6. Conocimiento y memoria del proyecto

- **Conocimiento histórico**: docs superados, bitácoras (`docs/historical/`, `architect_master/`,
  `project_knowledge_base/`), familias UBTN, EIARC (superseded → legado), SIGCTIARURAL_* de U0.5.
  Nada se borra; se cataloga en Knowledge Hub o en el mapa documental.
- **Los `pages/_deprecated/*` (DocsReadme, DocsPlanMaestro, DocsMasterdoc, DocsEdgeSetup,
  DocsApiReference)**: preservados en el repo como legado; los conocimientos que representaban ya
  viven en el Knowledge Hub. No se eliminan ni se restan de la memoria del proyecto.
- **El banner `SYSTEM ONLINE` (debug)**: se preserva tal cual; NO se toca salvo decisión explícita
  del dueño. Se cataloga como "artefacto de depuración legado".

---

## 4. Qué se protege (guardarraíles activados durante la refactorización)

Se protege contra **daño colateral de la refactorización**:

| Protección | Mecanismo |
|---|---|
| No romper `src/` (backend, frontend, embedded) durante el rediseño | Guardarraíl GR-02; la v2 es diseño hasta gate U1 |
| No romper el corazón pedagógico/científico | GR-01 (identidad), GR-03/04 (Conocimiento/Labs operativos), GR-06/07/08 (labs+capacidades) |
| No romper `Telemetry`, `SensorReading`, `RobotTelemetry` | Prohibiciones explícitas de la Misión + GR-05 (contratos) |
| No crear alarmas falsas (estado sin procedencia) | GR-09 + estado `referencia`/`vacío` para BBB 0 bytes y tiles futuros |
| No perder funcionalidad al reorganizar | Tabla §10.2 de `DASHBOARD_REIMAGINED_V2` + auditoría MISIÓN 7 |
| No romper hábitos de usuarios | `NAVIGATION_EVOLUTION` (aditiva, rutas intactas, redirects si algo se mueve) |
| No eliminar el legado/historia | Regla suprema "NADA DESAPARECE" + sección §3.6 |

---

## 5. Qué jamás debe romperse (no-negociables de preservación)

1. La **cadena pedagógica**: Conocimiento → Laboratorios → Hardware → Protocolos → Telemetría →
   IA → Proyectos Reales. Es la IA canónica (`NAVIGATION_MODEL` M4).
2. **Todos los labs, todas las rutas, todas las páginas**: ninguna navegación o página se elimina.
3. **Los tres BBB** y su presencia en el Dashboard/Operación.
4. **Los contratos de dominio**: `SensorReading`, `Telemetry`, `RobotTelemetry`, `EventBus`,
   `lab-data.js`, V1/V2/V3, `knowledgeRegistry.generated.json`.
5. **El conocimiento**: Knowledge Hub operativo + todo doc histórico (nada se borra del repo).
6. **El valor educativo/investigador**: la prueba de éxito es la trazabilidad y la formación, no la
   belleza de la interfaz (veredicto de `REFACTORING_AUDIT`).
7. **Honestidad de estados**: no inventar `online/alert` ni ocultar lo `vacío/referencia`.

---

## 6. Justificación económica (por qué vale la pena preservar)

- **Económica**: voltear a sustituir tira años de trabajo de Fases 1-9 (PLAN_MAESTRO), UBTN (26
  docs) y la refactorización hexagonal ya consumada.
- **Educativa**: labs, Falstad, avanzada, data science y Knowledge Hub forman al SENA/ADSO; el
  eslabón pedagógico es el producto.
- **Histórica**: BBB-01/02/03 y el Dashboard son la génesis del proyecto; borrarlos sería borrar la
  memoria del sistema.
- **Arquitectónica**: `labs`, `telemetry`, `ai`, `shared_kernel` y los puertos hexagonales ya
  probados son la base que la v2 **amplía**.
- **Social/técnica**: el Dashboard científico-Edge con telemetría V3 ya enseña IoT/edge en vivo;
  las nuevas capacidades (catálogo, persona, proyectos) se suman a esa base.

---

## 7. Criterio de éxito de la Misión Crítica

La refactorización es exitosa si **SIGCTiArural v2** contiene:

- **TODO lo que existe hoy** (inventario §3 + matriz §10.2 de `DASHBOARD_REIMAGINED_V2`) —
  incluyendo BBB-01/02/03, Dashboard, Telemetría, IA Predictiva, Laboratorios, Conocimiento,
  Hardware, Proyectos, Contextos, Telemetry, RobotTelemetry, SensorReading y el conocimiento
  histórico; **más**:
- nuevas capacidades (Hardware Catalog, persona/IA, Proyectos Reales, continuidad UBTN),
- nueva navegación (aditiva, sin romper hábitos),
- nueva arquitectura conceptual (cadena + guardarraíles),
- **sin sacrificar** educación, investigación, telemetría, hardware, laboratorios, IA, conocimiento
  e historia del proyecto.

**Frase meta al terminar:** *«SIGCTiArural v2 es más grande, más ordenado y más potente que v1.
No se perdió absolutamente nada de lo que hacía valioso a SIGCTiArural.»*

---

## 8. Gobernanza

- Verificación de cumplimiento de esta estrategia: **MISIÓN 7 (`PRESERVATION_AUDIT`)** y el check
  GR-12 (guardarraíles) al pasar al gate U1.
- Cualquier cambio que toque un elemento de §3 o §5 requiere este documento + auditoría + bitácora.
- **Sin código**: este documento es diseño. Nada de §3 obliga a modificar `src/`.

---

## 9. Referencias

- [`SIGCTIARURAL_VISION_ALIGNMENT.md`](SIGCTIARURAL_VISION_ALIGNMENT.md) — identidad/cadena/no-negociables.
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — §10 Regla Suprema.
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) — GR-01..GR-12.
- [`SIGCTIARURAL_COMPONENT_MAP.md`](SIGCTIARURAL_COMPONENT_MAP.md) — inventario total.
- [`docs/ECOSYSTEM_IDENTITY.md`](ECOSYSTEM_IDENTITY.md) — identidad canónica.