# SIGCTiArural — Frontend Architecture Audit (v2 · ampliada)

## Misión

ARQUITECTURA FRONTEND — Auditar que toda la evolución realizada en Hardware Catalog, Hardware Detail Layer, Projects, Device Map, Dashboard Executive Layer, Learning Layer, Sidebar y TopNav sigue respetando la arquitectura original del proyecto.

**Solo auditoría. NO se implementó ni modificó ningún archivo de código.**

## Fecha

2026-09-15

## Rama

`feature/ubtn-biological-telemetry`

## Archivos auditados

| Archivo | Líneas | Rol |
|---|---|---|
| `src/frontend/src/App.jsx` | 170 | Composición raíz, rutas, puente de voz, servicios |
| `src/frontend/src/components/TopNav.jsx` | 130 | Barra de navegación global fija |
| `src/frontend/src/pages/Dashboard.jsx` | 623 | Orquestador ejecutivo (bloques 1a–1g, 2–6) |
| `src/frontend/src/pages/HardwareCatalogPage.jsx` | 119 | Lista data-driven del catálogo |
| `src/frontend/src/pages/HardwareDetailPage.jsx` | 278 | Ficha de dispositivo (12 campos + Learning + Ecosistema) |
| `src/frontend/src/pages/ProjectsPage.jsx` | 150 | Proyectos del ecosistema |
| `src/frontend/src/data/catalog-data.js` | 237 | Registro universal de hardware (10 entradas, resources en 5) |
| `src/frontend/src/data/projects-data.js` | 120 | Proyectos (7) con FK a knowledge/labs/hardware |

Referencia de principios: `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_PRINCIPLES.md` · `docs/SIGCTIARURAL_HARDWARE_REGISTRY_ARCHITECTURE.md` · `docs/SIGCTIARURAL_LEARNING_LAYER_ARCHITECTURE.md`

---

# VERIFICACIÓN (12 puntos)

## 1. DDD intacta — 🟢 VERDE

- El proyecto se organiza por **contextos de dominio** (Conocimiento, Laboratorios, Hardware, Proyectos, Telemetría/BBB), no por tecnología — coherente con el Principio de Contextos EIARC.
- Las páginas nuevas son contextos reales con **vocabulario de negocio** (`operativo/referencia/construction`, `source_mode`, `fase`, `online/alert/offline`) y estados honestos; sin `class_index`/`argmax` en capa presentacional (Principio de Contrato Semántico).
- Los objetos de dominio (entradas de hardware, proyectos) viven en `data/` como catálogos, no incrustados en páginas.

## 2. Arquitectura Hexagonal intacta — 🟢 VERDE

- El patrón puerto/adaptador de Electrónica permanece intacto: `labs/electronics/ports/circuitSimulationPort.js` (contrato cero-argumentos, resultado inmutable) + `adapters/falstadAdapter.js` + `adapters/legacySchematicEditorAdapter.js`.
- El consumidor depende solo del **puerto + store** (`useLabStore`), nunca del origen de la señal — dependencia hacia adentro.
- La evolución U2/U3 no creó puertos/adaptadores paralelos ni alambró nuevos acoplamientos directos.

## 3. Frontend desacoplado del backend — 🟡 AMARILLO

- Favorables: existe `services/cloud.js` (unica capa que conoce backend/Open-Meteo); `App.jsx` consume servicios y baja datos por props; Knowledge usa registry generado local.
- **Deuda:** `Dashboard.jsx` conserva `fetchTelemetryEnvelope()` con `TELEMETRY_ENDPOINTS` propios (`/api/v3/telemetry/history/`, `VITE_TELEMETRY_HISTORY_URL`) — duplica la responsabilidad de `services/` dentro de una página. Prohibido tocar por restricción (Telemetría). `cloud.js` tiene URLs hardcodeadas (fallback documentado).
- Condición: **AMARILLO preexistente**, fuera de alcance de esta misión, a resolver cuando se levante la restricción de Telemetría.

## 4. Dashboard.jsx no es un God Component — 🟡 AMARILLO (tendencia)

- **A favor:** es **orquestador**, delega el trabajo pesado (`ClusterCard`, `GlobalChart`, `TelemetryPanel`, `LoginModal`); no tiene lógica de dominio; tras U3.6 los bloques operativos quedaron en acordeones `<details>`.
- **En contra (tendencia):** 623 líneas presentacionales aditivas (1a–1g + 2–6); `futureNodes` duplica el "roadmap" del Mapa y del catálogo (riesgo de divergencia); mantiene fetch propio (ver #3).
- **Threshold de vigilancia: 700 líneas.** Hoy: 623 · braces 374/374 · parens 131/131 → aún no es Dios, pero es el componente con más riesgo de convertirse.

## 5. Separación de responsabilidades — 🟢 VERDE

| Capa | Módulos |
|---|---|
| Composición raíz | `main.jsx`, `App.jsx` |
| Páginas | `pages/`, `knowledge-hub/pages/`, `labs/` |
| Componentes reutilizables | `components/` (ClusterCard, GlobalChart, TelemetryPanel, TopNav…) |
| Datos gobernados | `data/*.js`, `knowledgeRegistry.generated.json` |
| Servicios | `services/cloud.js` |
| Estado federado | `stores/useLabStore.js` |
| Hexágono lab | `labs/electronics/{ports,adapters}` |

Ninguna página U2/U3 inyectó lógica de datos en `App.jsx`; cada nueva página es archivo propio dependiente de su catálogo.

## 6. Reutilización correcta de componentes — 🟢 VERDE

- `ClusterCard`: Dashboard (BBB + Integraciones) y Hardware Detail (ficha) sin forks.
- `GlobalChart`: reutilizada con prop `compact` (U3.6 usó la prop existente, no creó otra gráfica).
- `Link`/rutas: páginas usan react-router; el puente de voz centraliza `routeMap` en `App.jsx`.
- Se detectó una duplicación de **datos de navegación**: `TopNav.navItems` (6 ítems) y `Dashboard.NAV_SIDEBAR` (6 ítems) conviven con los mismos destinos. Deuda menor (ver F).

## 7. Data-driven design — 🟢 VERDE

- `catalog-data.js` es la única fuente de Hardware Catalog, Hardware Detail (por `:id`) y Mapa Grupo B.
- `projects-data.js` alimenta ProjectsPage y KPI Proyectos.
- `knowledgeRegistry.generated.json` alimenta contadores de Knowledge.
- **Prueba delta:** en U3.4A se agregó `resources[]` SOLO al catálogo, sin tocar el render — evidencia que la capa de presentación consume datos gobernados.
- Dashboard deriva KPIs de props + catálogos + `source_mode`; lo no disponible = "Pendiente de integración" (sin métricas inventadas).

## 8. Compatible con Hardware Registry — 🟢 VERDE

- `catalog-data.js` expresa el shape del registro universal (`docs/SIGCTIARURAL_HARDWARE_REGISTRY_ARCHITECTURE.md`): id, name, role, status, icon, banner, links, specs(data), knowledge, labs, resources.
- `HardwareDetailPage.jsx` renderiza los 12 campos núcleo del registro sin desviarse del contrato definido.
- FK implícitas a Labs/Knowledge/Resources conservan la referencialidad del registro.

## 9. Compatible con Learning Layer — 🟢 VERDE

- `RESOURCE_TYPES = [course 🎓, video 🎬, research 📄, dataset 📊, repo 📦]` (vocabulario fijo en HardwareDetailPage) coincide con el `resources[]` tipado de `catalog-data.js` y el diseño de `docs/SIGCTIARURAL_LEARNING_LAYER_ARCHITECTURE.md`.
- **U3.4A ya pobló `resources[]` reales (18) en BBB, ESP32-WROOM-32, STM32, ARDUINO, RASPBERRY-PI** — la capa de aprendizaje consume datos gobernados, no contenido inventado.
- Render honesto: `resources?.length === 0 → "Pendiente de integración"`; plataformas restantes (Jetson, FPGA, MiniPC, Custom, ESP32-S3) usan ese estado.

## 10. Compatible con futuras plataformas (ESP32, STM32, Arduino, Raspberry, Jetson, FPGA, MiniPC, Custom) — 🟢 VERDE

- Las 10 entradas ya existen en `catalog-data.js` con el **mismo shape** (id único, role, status, fases, links, specs, knowledge, labs) → cualquier plataforma nueva es una entrada nueva del catálogo, sin cambios de código.
- ESP32 y Raspberry ya tienen `resources[]`; las restantes esperan el mismo bloque (estado honesto "Pendiente").
- El Mapa Grupo B y Hardware Catalog iteran genéricamente sobre `hardwareCatalogEntries` → compatibles con N plataformas futuras por construcción.
- Regla anti-duplicidad del Learning Layer (un id = una entrada) se respeta: `BBB` existe una vez y se excluye del Grupo B.

## 11. Compatibilidad futura con UBTN — 🟢 VERDE

- UBTN (Biosedal) ya está modelado en `projects-data.js` como proyecto `diseño` (estado honesto, sin despliegue productivo falso).
- La telemetría BBB usa `source_mode` LIVE/SIM y los dispositivos usan `status` honesto → el modelo de datos del registro admite nodos UBTN futuros como entradas con status/phase de diseño.
- `docs/UBTN_*` y EIARC definen el contrato semántico; la capa frontend no acopla hardware concreto (BBB subsección está aislada en la ficha, no en el catálogo).

## 12. Cumplimiento NADA DESAPARECE — 🟢 VERDE

- Toda la evolución fue **aditiva**: código legacy preservado (bloques 3–6 del Dashboard, SchematicEditor en cuarentena, rutas antiguas, `futureNodes`) y complementado, nunca eliminado ni reemplazado por decreto.
- La compactación U3.6 usó acordeones `<details>` (contenido intacto dentro), y la Barra de Ecosistema U3.5 fue aditiva.
- `\_deprecated/` existe para docs viejos sin borrado destructivo.
- Estado actual y objetivo conviven documentados → Principio de Evolución Controlada EIARC.

---

# RESPUESTAS A–F

### A. ¿Qué está bien diseñado?

1. **Registro universal data-driven** (`catalog-data.js`): una única fuente para 3 vistas (lista, ficha, mapa). Es el acierto arquitectónico más fuerte.
2. **Learning Layer** como dato en el catálogo + render tipado en la ficha: separación dato/presentación ejemplar (U3.4A lo demostró).
3. **Patrón puerto/adaptador de Electrónica** con contrato inmutable y trazabilidad (`source`): ejemplar y coherente con el hexágono del backend.
4. **Estados honestos y vocabulario único** (`operativo/referencia/construction`, LIVE/SIM): coherente entre catálogo, mapa, KPIs y proyectos.
5. **Composición raíz limpia** (`App.jsx`): rutas + auth + servicios, sin lógica de negocio.

### B. ¿Qué empieza a deteriorarse?

1. **Dashboard** crece en líneas y bloques inline; cada misión le suma una sección. Es el único componente en pendiente ascendente.
2. **Duplicación de navegación**: `TopNav.navItems` vs `Dashboard.NAV_SIDEBAR` vs `routeMap` del puente de voz — tres listas que deben mantenerse sincronizadas.
3. **`futureNodes`** duplicado entre Dashboard y el catálogo (roadmap) — empieza a divergir.

### C. ¿Qué deuda técnica aparece?

1. `fetchTelemetryEnvelope()` dentro de Dashboard (duplica `services/`).
2. URLs hardcodeadas en `cloud.js` (backend Render, Open-Meteo).
3. `futureNodes` como constante en Dashboard (catálogo ya lo cubre).
4. `text-[${NEON_COLORS.primary}]` y `shadow-[0_0_10px_...]` en `TopNav.jsx`: clases Tailwind interpoladas dinámicamente que **no existen como clases compiladas** (Tailwind JIT no genera clases con interpolación runtime) — silenciosamente sin efecto visual; solo el `style` inline las salva. Patrón a evitar en componentes nuevos.
5. `initialNodes` duplicado en `Dashboard.jsx`, `TopNav.jsx` y `App.jsx` (mismo clúster BBB en 3 lugares).

### D. ¿Qué deuda UX aparece?

1. **Tres barras de navegación sobrepuestas** en Dashboard: TopNav global + Sidebar ejecutiva (bloque 0) + barra DEBUG fija en `App.jsx` → redundancia de contexto y ruido visual.
2. **Barra DEBUG fija** (`SYSTEM DEBUG · ruta`) es ruido de desarrollo visible en producción.
3. Dashboard mezcla niveles de profundidad (capacidades + operación BBB + roadmap) — la compactación U3.6 ayudó, pero la página sigue siendo de scroll largo (aunque ahora los bloques pesados están colapsados).
4. `Cluster Status` label en TopNav usa "online" como fallback cuando hay alerta en algunos nodos → semántica imprecisa (un nodo alert = estado alert, correcto; pero "online" por defecto cuando no hay props no refleja BBB-03 offline).

### E. ¿Qué deuda arquitectónica aparece?

1. El Dashboard concentra **5 responsabilidades** en un solo orquestador (mapa, KPIs, estado, navegación, operación) — riesgo de God Component (vigilar a 700 líneas).
2. **Frontend ↔ backend** acoplado en un punto (Telemetría) por restricción; el resto está bien aislado en `services/`.
3. Duplicación del clúster BBB en 3 fuentes (`App.jsx` state, `Dashboard.initialNodes`, `TopNav.initialNodes`): fuente única de verdad difusa fuera de los catálogos.

### F. ¿Qué áreas requieren refactor futuro?

1. **Extraer secciones del Dashboard** (Sidebar → componente, KPIs → componente) si supera 700 líneas.
2. **Unificar navegación** en un único modelo de datos (`nav-data.js`) consumido por TopNav, Sidebar y puente de voz.
3. **Migrar `futureNodes`** de Dashboard a `catalog-data.js` (roadmap) y eliminar la duplicación.
4. **Consolidar el clúster BBB** en un solo origen (`catalog-data.js` o store).
5. **Mover `fetchTelemetryEnvelope`** a `services/` cuando la restricción se levante.
6. **Eliminar clases Tailwind interpoladas** en componentes compartidos (usar `style` siempre).
7. **Quitar barra DEBUG** de producción.

---

# CLASIFICACIÓN POR ÁREA

| Área | Estado | Resumen |
|---|---|---|
| **DDD** | 🟢 VERDE | Contextos y vocabulario semántico intactos |
| **Hexagonal** | 🟢 VERDE | Puerto/adaptadores intactos, consumidor por contrato |
| **Frontend** | 🟡 AMARILLO | Desacoplado salvo Telemetría en Dashboard (preexistente, restringido) |
| **UX** | 🟡 AMARILLO | Buen flujo, pero triple navegación + barra DEBUG + dashboard largo |
| **Dashboard** | 🟡 AMARILLO | Orquestador sano; vigilar en 700 líneas y con deuda menor |
| **Hardware** | 🟢 VERDE | Registro data-driven, ficha de 12 campos, mapa integrado |
| **Learning Layer** | 🟢 VERDE | Tipado, data-driven, honesto, 18 recursos reales |

**Global: 🟡 AMARILLO** (sano y evolucionando bien; con deudas puntuales, ninguna estructural ni bloqueante).

---

# RESULTADO FINAL

## ¿La evolución actual sigue siendo coherente con la arquitectura SIGCTiArural original?

# ✅ SI

### Justificación

La evolución Hardware Catalog → Hardware Detail → Projects → Device Map → Dashboard Ejecutivo → Learning Layer → Sidebar → TopNav **históricamente respeta la arquitectura original**:

1. **No eliminó nada** (regla suprema): todo fue aditivo; el legacy BBB/Telemetría/Integraciones/Noticias permanece preservado (U3.6 lo compactó con acordeones, reduciendo la percepción sin borrar contenido).
2. **Todos los datos nuevos viven en catálogos gobernados** (`catalog-data.js`, `projects-data.js`, registry generado) — el frontend no se acopló al backend ni duplicó lógica de dominio.
3. **El hexágono de Electrónica y los contextos DDD están intactos**; las páginas nuevas son contextos con vocabulario honesto.
4. La única desviación fuerte (fetch de Telemetría dentro de Dashboard) es **preexistente y acotada por restricción explícita**, no causada por la evolución auditada.

**Condición de continuidad:** mantener las 3 vigilancias amarillas (Dashboard ≤700 líneas, no duplicar datos de navegación, comunidad de fuente única BBB) y, cuando se levante la restricción de Telemetría, migrar el fetch del Dashboard a `services/`. Ninguna de estas deudas bloquea la evolución actual.

## Rollback

Sin cambios de código — auditoría únicamente.

## git status

- Actualizado: `docs/SIGCTIARURAL_FRONTEND_ARCHITECTURE_AUDIT.md`
- 0 archivos de código modificados en esta misión.