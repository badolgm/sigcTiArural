# SIGC&T Rural — Readiness del Punto de Control RC-2

**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Tipo:** AUDITORÍA — no se implementó ni modificó nada.
**Alcance:** App.jsx · TopNav.jsx · Dashboard.jsx · TelemetryPanel.jsx · catalog-data.js · projects-data.js · HardwareCatalogPage.jsx · HardwareDetailPage.jsx · ProjectsPage.jsx

---

## 1. Qué está LISTO PARA CONSOLIDAR

| Archivo | Estado | Evidencia |
|---|---|---|
| **TopNav.jsx** (194 l.) | 🟢 Consolidado | Header Ganadora (U4): identidad + nav 6 destinos + Estado + Notificaciones (alertas reales) + Perfil honesto. Sin clases Tailwind interpoladas, sin duplicación funcional |
| **Dashboard.jsx** (678 l.) | 🟢 Casi consolidado | Balance 427/427 · 134/134. Mapa único jerárquico (U4.2), Capacidades→chips (U4), Hardware→micro-chips (U4.1), módulos ejecutivos (U3.8), duplicación `futureNodes` eliminada (U4.3) |
| **TelemetryPanel.jsx** (170 l.) | 🟢 Consolidado | Rediseño ejecutivo U3.7: DigitalDisplays compact + MiniSparkline SVG sin dependencias + lectura honesta (LIVE/SIM/estado error) |
| **catalog-data.js** (237 l.) | 🟢 Consolidado | 10 plataformas · vocabulario honesto (reference/construction) · `resources[]` oficiales en 5 fichas |
| **projects-data.js** (120 l.) | 🟢 Consolidado | 7 proyectos · estados honestos (operativo/diseño) · enlaces reales a KH/Labs/Hardware |
| **ProjectsPage.jsx** (150 l.) | 🟢 Consolidado | Cards con cadena Conocimiento/Labs/Hardware + "Estado honesto" + vocabulario vivo |
| **HardwareDetailPage.jsx** (278 l.) | 🟢 Consolidado | Barra de Ecosistema U3.5 + Learning Layer (resources por tipo) + estados honestos |

## 2. Qué sigue EXPERIMENTAL

| Archivo / pieza | Nivel | Motivo |
|---|---|---|
| **HardwareCatalogPage.jsx** | 🟡 Experimental | Chips de proyectos **hardcodeados** (SIGCTiArural/UBTN/Agricultura IA) — violan la única fuente de verdad (`projects-data.js`) |
| **App.jsx** | 🟡 Experimental | Barra `SYSTEM DEBUG` fija visible en producción; `fetchCluster...catch(() => [])` **traga errores** (dashboard puede verse vacío sin diagnóstico); `nodes` sembrados de fallback |
| **Dashboard bloque 2** (telemetría) | 🟡 Refinable | Quedó como bloque "BBB antigua" mencionado en U4.1 (bajo Mapa), candidato a compactación futura |
| **Dashboard `initialNodes`** | 🟠 Duplicado | `initialNodes` existe en App + Dashboard + TopNav (3 copias del fallback BBB) |
| **`NEON_COLORS`** | 🟠 Duplicado | Definido en 5+ archivos (App, Dashboard, TopNav, HardwareDetail, AIPredictiva; TelemetryPanel usa su propio `NEON`) |
| **Autenticación** | 🟠 Superficial | Solo `LoginModal` en Dashboard; `onRequireAuth` quedó sin uso tras U3.7 (código muerto) |

## 3. Qué DEBERÍA entrar en RC-2

1. **Retirar la barra `SYSTEM DEBUG`** de App.jsx (deuda visual de producción 🟠 de auditorías repetidas).
2. **Unificar el fallback BBB**: `initialNodes` en una sola fuente (p. ej. importar de Dashboard a App/TopNav) — elimina 1 de las 3 copias.
3. **`NEON_COLORS` centralizado** en data (o componente token) — elimina la multiduplicación.
4. **Eliminar `onRequireAuth` muerto** del Dashboard (código muerto confirmado).
5. **HardwareCatalogPage**: derivar los chips de proyectos desde `projects-data.js` en lugar de hardcode (misma lección U4.2: una sola fuente de verdad).
6. **Validación runtime funcional** en Docker 5174 (cada uno con su confirmación visual de Bernardo).
7. **Consolidación del Header** como pieza aprobada (ya lista).

## 4. Qué NO debería entrar en RC-2

1. **Capa de Investigación/Experimentación** (diseño de `SIGCTIARURAL_RESEARCH_EXPERIMENTATION_LAYER.md`) — es diseño sin datos reales aún; entraría como franja futura, no en el control.
2. **Producción agrícola** — no existe (0 matches) y no debe introducirse un módulo "falso" solo para completar el gráfico (riesgo de romper la honestidad).
3. **Unificación TopNav↔Sidebar del Dashboard** — merge de navegación de alto riesgo; diferido a validación runtime.
4. **Refactor de rutas/reestructura de labs** — fuera del alcance del punto de control.
5. **Gráficos nuevos** — MiniSparkline/Plotly ya cubren; añadir más visuales no es requisito de consolidación.
6. **Cambios en Telemetry Context / SensorReading / RobotTelemetry / Backend / Docker** — prohibidos.

## 5. Qué debe PROBAR Bernardo manualmente

- **Navegación completa:** desktop (Header nav + Sidebar del Dashboard) y móvil (hamburguesa → 6 destinos + estado + notificaciones + perfil).
- **Dashboard → cada destino:** Labs, Hardware, Proyectos, IA, Conocimiento y vuelta (rutas reales).
- **Telemetría con backend y sin backend** (fuente LIVE/SIM/error, MiniSparkline, modo panel).
- **Checkerboard honesto:** Mapa Grupo A/B/C, KPIs, Estado del Sistema, micro-chips BBB/catálogo, módulos ejecutivos.
- **Fichas de hardware:** `/hardware/ESP32-WROOM-32` (Learning Layer con 4 resources), `/hardware/BB` (barra ecosistema + nodos BBB), e id inexistente → redirect a catálogo.
- **Proyectos:** cards con botones KH/Labs/Hardware, estados operativo/diseño.
- **Knowledge Hub:** `/knowledge` y `/knowledge/doc/research_v2_*` (render de markdown).
- **Caso degradado:** sin red/backend → verificar que el Dashboard no se rompe (fallback honesto, sin excepción blanca).
- **404** → botón "Volver al Dashboard".

## 6. Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| **Runtime local no verificable** (React 18 vs fiber/drei, sin node_modules) | 🔴 Alto | Dock 5173/5174 son las únicas referencias; probar solo ahí; validación estática de balance tras cada cambio |
| `fetch...catch(() => [])` silencioso → dashboard puede verse vacío sin diagnóstico | 🟠 Medio | Bernardo prueba el caso degradado; futuro: capturar el error en pantalla |
| Triple fallback BBB + NEON duplicado = drift futuro | 🟠 Medio | Puntos 3.2/3.3 del control |
| Voz/Asistente + rutas de navegación puente (routeMap) → posibles saltos inesperados | 🟡 Bajo | Probar comando de voz básico |
| Dependencias CDN (pyodide/plotly) requieren red | 🟡 Bajo | DataScienceLab informa error si no cargan |

## 7. Porcentaje REAL de madurez

| Capa | % |
|---|---|
| Navegación / Header | 90 |
| Dashboard | 90 |
| Hardware (catálogo + detalle + learning) | 85 |
| Projects | 85 |
| Knowledge / Labs | 88 |
| IA / ML (inferencia + SSE) | 72 |
| Producción agrícola | 5 |
| Gobernanza / Docs / Auditorías | 93 |
| **Madurez global ponderada** | **≈ 82%** |

**Lectura:** la plataforma es funcional y honesta en su núcleo (telemetría/hardware/conocimiento/labs). El 18% restante se concentra en: unificación de tokens/fuentes duplicadas (RC-2 ítem 3), la capa científica futura (research/datasets/producción), y la validación runtime humana que solo Bernardo puede cerrar.

**Estado:** solo auditoría. Ningún archivo modificado, sin commits. Resultado aplicable a decisión del punto de control RC-2.