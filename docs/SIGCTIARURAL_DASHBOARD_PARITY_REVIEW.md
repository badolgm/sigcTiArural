# SIGCTiArural — Parity Review: Dashboard Ganadora (Visión) vs Dashboard 5174 (Implementación)

> **Estado:** U1.7. Evaluación read-only. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Visión:** `SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md` (spec visual, U0.5)
> **Implementación:** Dashboard 5174 actuac (`src/frontend/src/**`)
> **Resumen de parity:** **≈ 50 % de la Dashboard Ganadora está implementado hoy.**

---

## 0. Estructura de evaluación

Metodología: se descompone la visión en **21 elementos verificables** (features del wireframe y de la spec). Cada elemento recibe un estado:

- ✅ **IMPLEMENTADO** (completo, funcional hoy)
- 🟡 **PARCIAL** (existe la base/estructura pero falta la profundidad de la visión)
- ❌ **FALTANTE** (no existe aún)

Fórmula: `IMPLEMENTADO×1.0 + PARCIAL×0.5 + FALTANTE×0.0` sobre 21 → resultado porcentual.

---

## 1. Respuesta — 21 elementos de la visión vs hoy

| # | Elemento de la visión (spec V2) | Estado | Evidencia de implementación (5174) |
|---|---|---|---|
| 1 | **Header + selector de persona** (Estudiante/Instructor/Investigador/Desarrollador/Agricultor*) + 🔔 | ❌ | No existe selector ni notificaciones |
| 2 | **Barra de navegación por capacidades** (Capacidades · Labs · Hardware · Telemetría · IA · Proyectos · Conocimiento · Operación) | 🟡 | TopNav: Dashboard · Laboratorios · Hardware · IA · Conocimiento (5/8); faltan Capacidades, Proyectos, Operación, Telemetría |
| 3 | **Cadena del ecosistema navegable** (Conocimiento→Labs→Hardware→Protocolos→Telemetría→IA→Proyectos) | ✅ | Bloque "🧭 Capacidades del Ecosistema" en Dashboard con 6 links SPA |
| 4 | **Grid de Capacidades Activas** (Telemetría · IA Edge · Conocimiento · UBTN · Research V2) con estados honestos | 🟡 | El bloque de capacidades son *links*, no *tarjetas*; faltan UBTN y Research/AI V2 como tiles |
| 5 | **Evidencia reciente** trazable hasta proyecto (lab → señal → proyecto) | ❌ | No existe sección de evidencia |
| 6 | **Estado de Operación colapsable subordinado** (portadores + brokers/APIs V1-V3, tests) | 🟡 | Secciones "⚙️ Operación — Infraestructura BBB" y "📈 Operación — Telemetría Global"; no colapsable, sin brokers/APIs/tests |
| 7 | **Hardware Catalog — tabla por nivel de aprendizaje** (Nivel│Plataforma│Estado│Protocolos│Labs│Proyectos) | 🟡 | Existe catálogo en grid de cards con estado honesto (`referencia/diseño`) + protocolos + labs; falta orden por nivel y columna Proyectos |
| 8 | **Detalle del Hardware** (qué se aprende · evidencia esperada · proyectos que habilita) | ❌ | El detalle hoy es descripción/fabricante/protocolos/links; no "evidencia esperada" ni "proyectos" |
| 9 | **Knowledge Hub contextual desde la cadena** (lab → su documentación) | 🟡 | `/knowledge` operativo (51 docs) y enlazado desde la cadena y catálogo (📚); no hay acceso contextual desde cada lab |
| 10 | **UBTN como capacidad/eslabón "Bioseñal"** | ❌ | No existe tile/capacidad UBTN ni firmware view |
| 11 | **Telemetría como capacidad** (señal ambiental + bioseñal + interpretación IA + metadatos/procedencia) | 🟡 | Señal ambiental en vivo (TelemetryPanel + GlobalChart) y etiqueta de fuente; faltan bioseñal UBTN, interpretación IA y metadatos completos |
| 12 | **Proyectos Reales** (/proyectos con evidencia trazada; MVP ADSO, UBTN, Agricultura V2) | ❌ | Sin ruta `/proyectos`; solo botón "Proyectos (docs)" → masterdoc (UX-02) |
| 13 | **Ruta `/hardware-catalog`** (nueva en §9) | ✅ | Ruta registrada y página operativa (U1.1) |
| 14 | **Ruta `/proyectos`** (nueva en §9) | ❌ | No existe |
| 15 | **`/` → `/dashboard`** (redirect) | ✅ | App.jsx L108 `<Navigate to="/dashboard" />` |
| 16 | **BBB-01/02/03 preservados en Operación** (roles originales, dot TopNav, telemetría V3) | ✅ | Sección "⚙️ Operación — Infraestructura BBB" con las 3 ClusterCard + dot en TopNav |
| 17 | **TelemetryPanel / GlobalChart / ClusterCard preservados** | ✅ | Componentes intactos, reutilizados tal cual |
| 18 | **Integraciones Futuras → entradas honestas del catálogo** (`vacío/futuro`, enlaces intactos) | 🟡 | RPI/FPGA/ARDUINO/DRONE/ALEXA aún como tiles en "Operación"; el catálogo ya tiene Raspberry/FPGA/Arduino, pero no ALEXA-IOT ni DRONE-NAV; falta migrar contenedor |
| 19 | **VoiceAssistant + routeMap preservado y extendido** (nunca reducido) | 🟡 | Voz y routeMap intactos (U0); NO se ha añadido aún `hardware-catalog`/`proyectos` al mapa de comandos |
| 20 | **Login/Auth como capacidad latente preservada** | 🟡 | LoginModal/AuthProvider intactos; no presentados como capacidad |
| 21 | **Estados honestos** (sin `online/alert` falso; vocabulario `operativo/referencia/diseño/vacío`) | ✅ | Banners "🔷 Planeado", catálogo `reference/diseño`, `source_mode` LIVE/SIM, label SYSTEM DEBUG |

---

## 2. Resultado numérico

| Estado | Cantidad | Peso |
|---|---|---|
| ✅ IMPLEMENTADO | 6 | ×1.0 → 6.0 |
| 🟡 PARCIAL | 9 | ×0.5 → 4.5 |
| ❌ FALTANTE | 6 | ×0.0 → 0.0 |
| **Total** | **21** | **10.5 / 21** |

### 🎯 Porcentaje implementado de la Dashboard Ganadora: **≈ 50 %**

---

## 3. Respuestas a las preguntas

### 1. Elementos que YA existen (✅)
- Cadena del ecosistema navegable (#3) — el logro estructural clave.
- Ruta `/hardware-catalog` operativa (#13) y redirect `/` → `/dashboard` (#15).
- BBB preservados en Operación (#16), componentes de telemetría intactos (#17).
- Vocabulario honesto de estados (#21).
- Base: TopNav 5 entradas, catálogo con 10 plataformas conectadas a labs/knowledge.

### 2. Elementos que FALTAN (❌)
- Selector de persona + notificaciones (#1).
- Evidencia reciente trazable (#5) y ruta `/proyectos` (#14).
- UBTN como capacidad/eslabón Bioseñal (#10).
- Detalle de aprendizaje/evidencia en el catálogo (#8).
- Acceso contextual Knowledge desde labs (#9 prof.).
- Entradas de catálogo honestas para los 5 tiles de Integraciones Futuras completas (#18 parcial).

### 3. Elementos a MEDIO CAMINO (🟡)
- Navegación por capacidades: 5/8 entradas en TopNav (#2). Faltan **Capacidades, Proyectos, Telemetría, Operación** como entradas de nav.
- Capacidades Activas: son links, no tarjetas con estado (#4).
- Operación: secciones existen pero no colapsables, sin brokers/APIs (#6).
- Hardware Catalog: grid vs tabla por nivel de aprendizaje; sin columna Proyectos (#7).
- Telemetría como capacidad: señal sí; bioseñal/IA/metadatos no (#11).
- Integraciones Futuras: tiles aún en Dashboard; catálogo incompleto para ellos (#18).
- routeMap sin extender (#19).

### 4. Prioridad ALTA
1. **Selector de persona** (#1) — firma distintiva de la Ganadora; achica el gap visual más grande.
2. **Proyectos Reales / ruta `/proyectos`** (#12/14) — cierra la cadena (Proyectos es el último eslabón).
3. **Evidencia reciente** (#5) — la norma de trazabilidad de la misión (Misión 2 GLC-03).
4. **Capacidades Activas como tarjetas honestas** (#4) — convierte links en estado visible.

### 5. Prioridad MEDIA
5. **Completar navegación** (#2): añadir Capacidades/Proyectos/Telemetría/Operación como entradas TopNav sin romper las 5 actuales.
6. **Operación colapsable + brokers/APIs/tests** (#6).
7. **Hardware Catalog como tabla por nivel + columna Proyectos** (#7).
8. **Migrar tiles Integraciones Futuras al catálogo con estado `vacío/futuro`** (#18), incl. ALEXA-IOT y DRONE-NAV.
9. **Extender routeMap de voz** (#19) con `hardware-catalog`/`proyectos` (nunca reducir).

### 6. Elementos que DEBEN ESPERAR
10. **UBTN en la navegación/capacidad** (#10) — gated por diseño real UBTN (CE-02); no ofertar vista sin MVP.
11. **Telemetría con bioseñal UBTN e interpretación IA** (#11 prof.) — depende del pipeline IA y de `AI_PREDICTION_VALIDATION_AUDIT`.
12. **Login/Auth como capacidad navegable** (#20) — sin rutear (GIA), preservado como latente.
13. **Access contextual labs→documentación** (#9 prof.) — refactor de labs, requiere gate de labs.

---

## 4. Matriz VISIÓN → IMPLEMENTADO → PENDIENTE

| Visión (spec V2) | ✅ Implementado hoy | 🟡/❌ Pendiente |
|---|---|---|
| Dashboard principal: persona + cadena + capacidades + operación | Cadena navegable (#3); redirect y rutas base (#13/15) | Persona (#1), Capacidades Activas tarjetas (#4), Evidencia (#5), Operación colapsable (#6) |
| Navegación por capacidades | TopNav 5 entradas | 3 entradas faltantes (#2) |
| Hardware Catalog por aprendizaje | Catálogo grid + estados honestos (#7 base) | Tabla por nivel, columna Proyectos, detalle evidencia (#7/8) |
| Knowledge Hub contextual | `/knowledge` operativo y enlazado (#9 base) | Acceso por lab (#9 prof.) |
| UBTN | — | Capacidad bioseñal (#10, esperar) |
| Telemetría como capacidad | Señal en vivo + GlobalChart (#11 base) | Bioseñal/IA/metadatos (#11 prof., esperar) |
| Proyectos Reales | Botón docs→masterdoc (UX-02, enlace) | Ruta `/proyectos` + evidencia (#12/14) |
| Preservación total | BBB, componentes, tiles, voz, login (#16-20 base) | Migrar 5 tiles a catálogo, extender routeMap |

---

## 5. Conclusión

- **~50 % de la Dashboard Ganadora está implementado hoy.**
- Lo que ya existe es la **estructura** (cadena, navegación base, catálogo, honestidad, preservación). Lo que falta es la **profundidad de la experiencia**: persona, evidencia, proyectos y capacidades como objetos visuales con estado.
- Prioridades ALTAS (persona, proyectos, evidencia) son **aditivas y de bajo riesgo** — alineadas con la regla suprema (nada desaparece). Las MEDIAS se apoyan en la base ya construida. Las que DEBEN ESPERAR dependen de gates externos (UBTN/IA/labs).
- Ready para U1.8 planning: el siguiente gran salto es **selector de persona + bloque de Proyectos/Evidencia + capacidades como tarjetas** — todo aditivo y reversible.

---

## Referencias
- `SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md` (spec visual, wireframes §3-9).
- `SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md` (IA de navegación, personas).
- `SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md` (estados de aprendizaje del catálogo).
- Implementación: `Dashboard.jsx`, `TopNav.jsx`, `HardwareCatalogPage.jsx`, `catalog-data.js`, `App.jsx`.