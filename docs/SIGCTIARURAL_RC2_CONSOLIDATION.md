# SIGC&T Rural — Consolidación RC-2 (commit lógico)

**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Tipo:** AUDITORÍA de consolidación — NO se modificó, creó ni implementó nada.

---

## Estado git verificado (baseline del control)

| Archivo | Estado git | Delta | Naturaleza |
|---|---|---|---|
| `src/frontend/src/pages/Dashboard.jsx` | 🟡 M | +547 | Evolución mayor (U2→U4.3) |
| `src/frontend/src/components/TopNav.jsx` | 🟡 M | +118 | Barra → Header Ganadora (U4) |
| `src/frontend/src/components/TelemetryPanel.jsx` | 🟡 M | +109 | Rediseño ejecutivo (U3.7) |
| `src/frontend/src/App.jsx` | 🟡 M | +12 | Puente de datos (sin DEBUG retirado aún) |
| `src/frontend/src/data/catalog-data.js` | 🔵 ?? | — | Nuevo (registry hardware + learning) |
| `src/frontend/src/data/projects-data.js` | 🔵 ?? | — | Nuevo (7 proyectos) |
| `src/frontend/src/pages/HardwareCatalogPage.jsx` | 🔵 ?? | — | Nuevo (catálogo) |
| `src/frontend/src/pages/HardwareDetailPage.jsx` | 🔵 ?? | — | Nuevo (ficha + learning layer) |
| `src/frontend/src/pages/ProjectsPage.jsx` | 🔵 ?? | — | Nuevo (proyectos) |

*Los archivos de docs/ y README modificados quedan FUERA del alcance de este commit funcional de frontend.*

---

## 1. Cambios CANDIDATOS A CONSERVAR

| Cambio | Por qué conservar | Riesgo de conservar |
|---|---|---|
| **Header Ganadora** (TopNav U4) | Cumple spec Designer: identidad + nav + estado + notificaciones reales + perfil honesto; sin Tailwind interpolada | Bajo |
| **Mapa de Dispositivos único** (Dashboard U2.4) | Ventana jerárquica única; consolida BBB/catálogo/roadmap tras U4.2/U4.3 | Bajo |
| **Capacidades → franja de chips** (U4) | Elimina triple redundancia (sidebar/KPIs/cards); NADA DESAPARECE | Bajo |
| **Hardware → micro-chips** (U4.1) | Reduce ruido del bloque 3; misma data, mismo destino | Bajo |
| **Módulos ejecutivos 4-6** (U3.8 + U4.3) | Telemetría/Integraciones/Noticias compactas; duplicación `futureNodes` eliminada | Bajo |
| **TelemetryPanel ejecutivo** (U3.7) | DigitalDisplays + MiniSparkline sin dependencias; lectura honesta LIVE/SIM/ERR | Bajo |
| **Learning Layer** (catalog-data `resources[]` + detail) | 18 recursos oficiales verificados (course/video/research/dataset/repo) | Bajo |
| **Barra de Ecosistema** (Detail U3.5) | Cadena Hardware→Knowledge→Labs→Projects→Aprende con contadores honestos | Bajo |
| **Red de contexto** (Projects/Detail/Catalog "Cadena") | Navegación relacional consistente en 3 páginas | Bajo |

## 2. Cambios que siguen EXPERIMENTALES

| Pieza experimental | Estado | Nota |
|---|---|---|
| **HardwareCatalogPage chips de proyectos** | 🟡 Hardcodeados | SIGCTiArural/UBTN/Agricultura IA duplican `projects-data.js` (violación de una sola fuente de verdad) |
| **App.jsx barra `SYSTEM DEBUG`** | 🟡 Global visible | Artefacto de desarrollo en producción |
| **`fetch...catch(() => [])`** | 🟡 Silencioso | Fallo de backend = dashboard vacío sin diagnóstico |
| **`initialNodes` triple fallback** | 🟠 Duplicado | App + Dashboard + TopNav — 3 copias del mismo default BBB |
| **`NEON_COLORS` 5+ definiciones** | 🟠 Duplicado | Drift visual futuro garantizado |
| **`onRequireAuth` muerto** | 🟠 Dead code | Quedó sin uso tras U3.7 |

## 3. Qué debe VALIDAR Bernardo manualmente

1. **Compatibilidad total de contenido:** Dashboard, Mapa (A/B/C), KPIs, Estado del Sistema, Labs, Hardware, Projects, Knowledge, IA, BBB, Telemetría → cada ruta responde.
2. **Telemetría dual:** con backend (LIVE/SIM) y sin backend (error honesto, sin pantalla blanca).
3. **Ficha "cereza":** `/hardware/ARDUINO` (learning layer con 4-5 resources) y `/hardware/BBB` (barra ecosistema + enlaces KB/Labs/Projects).
4. **Redirect 404:** `/hardware/NO-EXISTE` → catálogo; ruta aleatoria → página 404 + botón "Volver al Dashboard".
5. **Menú móvil + desktop:** 6 destinos, estado, notificaciones (alerta real), perfil.
6. **Knowledge Hub:** lista + `/knowledge/doc/research_v2_*` (render de markdown).
7. **Caso degradado:** sin red → fallback honesto visible, sin excepción.

## 4. Riesgos abiertos

| Riesgo | Sev | Estado |
|---|---|---|
| Runtime local no verificable (React 18 vs fiber/drei) | 🔴 | Mitigación: Docker 5173/5174; validación estática de balance |
| Fallos de red/backend tragan error (catch []) | 🟠 | Requiere prueba del caso degradado por Bernardo |
| 5+ copias de NEON / 3 de initialNodes → drift | 🟠 | Consolidar antes del primer commit |
| VoiceAssistant + routeMap puente | 🟡 | Probar comando básico de voz |

## 5. Qué debe CONSOLIDARSE ANTES del primer commit

> Sin esto no se recomienda el commit inicial de frontend:

1. **Retirar barra `SYSTEM DEBUG`** de App.jsx (elimina el artefacto global).
2. **Centralizar `NEON_COLORS`** en `data/` (token único; las 5+ copias pasan a importarlo).
3. **Unificar fallback BBB**: `initialNodes` en una fuente (Dashboard exporta, App/TopNav importan) — una sola copia.
4. **Quitar `onRequireAuth` muerto** del Dashboard.
5. **Derivar chips de proyectos del catálogo** desde `projects-data.js` (fin de hardcode).
6. **`catch` con diagnóstico**: exponer el error en la UI (TelemetryPanel ya tiene estado error; reutilizarlo).

*Items 1-6 son la brecha RC-2 identificada también en `SIGCTIARURAL_RC2_READINESS.md`.*

## 6. Estructura de COMMIT LÓGICO propuesta

> A ejecutar SOLO cuando Bernardo lo pida (tras prueba manual). Sin commits previos prometidos.

| Orden | Tema del commit | Archivos | Mensaje sugerido |
|---|---|---|---|
| C1 | **heritage** (documental base) | `docs/` (los FASE/audit untracked relevantes a frontend), `README*` si aplica | `docs(frontend): consolida auditorías y decisiones U1-U4` |
| C2 | **core evolution** (el bloque grande) | `Dashboard.jsx`, `TopNav.jsx`, `TelemetryPanel.jsx` | `feat(dashboard): dashboard ganadora, header ejecutivo y telemetría compacta` |
| C3 | **registry + learning** (datos y deriva) | `catalog-data.js`, `projects-data.js` | `feat(hardware): registry honesto y learning layer con recursos oficiales` |
| C4 | **pages deriva** (vistas nuevas) | `HardwareCatalogPage.jsx`, `HardwareDetailPage.jsx`, `ProjectsPage.jsx` | `feat(hardware): catálogo, ficha de dispositivo y página de proyectos` |
| C5 | **consolidation RC-2** (limpieza pendiente) | `App.jsx` (+ cualquier fix de los ítems 5.1-5.6) | `refactor(frontend): retira debug y consolida tokens/fuentes para RC-2` |

**Reglas:** 1) C2→C5 son funcionales + 1 limpieza; C5 debe ir DESPUÉS de validar en Docker. 2) Cada commit debe compilar aislado (los `??` nuevos deben incluirse en C3/C4 para no romper imports). 3) No tocar `main`, no push sin orden expresa.

---

**Conclusión:** la rama tiene 4 archivos evolucionados + 5 nuevos que **son candidatos sólidos a consolidar** como RC interno, pero **no es condición de commit actual**: primero los 9 pasos de prueba manual de Bernardo y los 6 ítems de consolidación 5.1-5.6. Solo auditoría — ningún archivo modificado.