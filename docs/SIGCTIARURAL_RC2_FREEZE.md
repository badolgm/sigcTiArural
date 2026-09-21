# SIGC&T Rural — FREEZE RC-2 (Punto de congelamiento)

**Fecha original:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Estado:** CONGELADO en 2026-09-15 — no se implementa más funcionalidad hasta nuevo aviso.
**Propósito de este documento:** permitir retomar el proyecto en cualquier momento con cualquier IA sin pérdida de contexto.

> **BLOQUE DE ACTUALIZACIÓN — 2026-09-21 (STATE SYNCHRONIZATION).** El congelamiento RC-2 sigue siendo la foto del frontend al 15-sep-2026, pero **fue superado puntual y explícitamente por la misión F1 (primer dato real de sensor)**: el backend de ingesta Telemetry V3 (`TelemetryIngestV3View`, `POST /api/v3/telemetry/readings/`) quedó **implementado, probado (60/60) y commiteado** en `941a55d feat(f1)` (código + 5 docs F1) dentro de `feature/ubtn-biological-telemetry`, seguido de `0989ec9 docs(ai)` (3 docs IA/ML). El frontend NO fue tocado por F1; sus archivos siguen como en este freeze (Dashboard.jsx conserva únicamente el diff RC-2/UX pendiente: accordions +157/−119, 0 símbolos V3). Estado git y runtime actualizados en `AGENTS.md`. Los apartados `§0`, `§7`, `§8` de este documento describen el estado AL 15-sep-2026 y se conservan como registro histórico.

---

## 0. Cómo retomar el proyecto (instrucción a la próxima IA)

1. Leer este documento completo (FREEZE RC-2) → refleja el estado real.
2. Leer en orden: `README.md` (visión) → `docs/MASTERDOC.md` (vértice documental) → `docs/PLAN_MAESTRO.md` (plan) → `SIGCT_RURAL_SYSTEM_BOOT.md` (gobernanza; parcialmente superado, ver columna de vigencia) → `docs/SIGCTIARURAL_RC2_READINESS.md` + `docs/SIGCTIARURAL_RC2_CONSOLIDATION.md` (estado frontend).
3. NO tocar la rama actual (ver §8). NO commitear/pushear sin orden explícita de Bernardo.
4. Única validación de sintaxis disponible: balance `{`/`}` y `(`/`)` en archivos JSX (sin `node_modules`). Runtime solo vía Docker 5173/5174.
5. Regla suprema del código: **NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA**; vocabulario honesto obligatorio (`operativo / referencia / diseño`).
6. Prohibido modificar: `main`, backend, Docker, Telemetry Context, SensorReading, RobotTelemetry, BBB, Labs, Knowledge Hub, IA existente — sin orden de Bernardo.

---

## 1. Qué está TERMINADO (estado congelado)

| Componente | Estado | Archivos clave |
|---|---|---|
| Dashboard Ganadora (bloques 0-6 + cinta) | ✅ Terminado (720 líneas, balance 461/461 · 146/146) | `pages/Dashboard.jsx` |
| Cinta del Ciclo Científico (SENSOR→PRODUCCIÓN) | ✅ Terminado | `pages/Dashboard.jsx` (1a) |
| Header Ganadora (identidad+nav+estado+notificaciones+perfil) | ✅ Terminado | `components/TopNav.jsx` (194 líneas) |
| Mapa de Dispositivos (Grupos A/B/C, fuente única) | ✅ Terminado | `pages/Dashboard.jsx` (1b) |
| Telemetría ejecutiva (DigitalDisplay + MiniSparkline + LIVE/SIM honesto) | ✅ Terminado | `components/TelemetryPanel.jsx` (170 l.) |
| Hardware Catalog (10 plataformas + honestidad) | ✅ Terminado | `pages/HardwareCatalogPage.jsx` · `data/catalog-data.js` (237 l.) |
| Hardware Detail Layer (ecosistema + learning layer) | ✅ Terminado | `pages/HardwareDetailPage.jsx` (278 l.) |
| Learning Layer (`resources[]` oficiales en 5 fichas; 18 recursos) | ✅ Terminado | `catalog-data.js` |
| Projects (7 proyectos, estados honestos) | ✅ Terminado | `pages/ProjectsPage.jsx` · `data/projects-data.js` (120 l.) |
| Knowledge Hub (registry 51 docs) | ✅ Terminado (heredado, intacto) | `knowledge-hub/registry/*.json` |
| Laboratory (8 labs + rutas) | ✅ Terminado (heredado, intacto) | `labs/*`, `App.jsx` |

## 2. Qué está ESTABLE (probado, sin cambios abiertos)

- Balance de sintaxis verificado en todos los archivos evolucionados del frontend.
- Navegación completa (6 destinos + Sidebar + rutas de labs/KH/IA) — no modificada.
- Confirmación Docker 5173 (referencia) y 5174 (laboratorio activo) operativos.
- Duplicación de `futureNodes` eliminada (U4.3) — roadmap vive solo en Mapa Grupo C + resumen ejecutivo.
- Mapa de Dispositivos como única ventana jerárquica de hardware (consolidación U4.2).
- Vocabulario honesto de estado presente en Dashboard, catálogo, detalle y proyectos.

## 3. Qué está EXPERIMENTAL (presente, no consolidado)

| Pieza | Estado | Por qué |
|---|---|---|
| `HardwareCatalogPage.jsx` chips de proyectos | 🟡 Hardcodeados | Duplican `projects-data.js` (pendiente de derivar) |
| Barra `SYSTEM DEBUG` en `App.jsx` | 🟡 Visible | Artefacto de desarrollo en producción |
| `catch(() => [])` en App (fetch cluster) | 🟡 Silencioso | Fallo de backend sin diagnóstico |
| `initialNodes` duplicado (App/Dashboard/TopNav) | 🟠 3 copias | Drift futuro |
| `NEON_COLORS` duplicado (5+ archivos) | 🟠 5+ definiciones | Drift visual |
| `onRequireAuth` muerto en Dashboard | 🟠 dead code | Sin uso desde U3.7 |
| Research/Experimentation Layer | 🟡 Diseño | Primitive design listo, datos parciales |

## 4. Qué DEPENDE de BACKEND futuro

- Telemetría V3 real estable con datos vivos (hoy: funca con despliegue pero con fallback).
- Dataset agrícola físico (inventario, split, calidad materializados) — hoy solo docs `_dataset_inventory` en diseño.
- Pipeline de entrenamiento → modelo real servible desde `/api/v3/ai/inference/`.
- Los `catch(() => [])` y estados "en diseño" del Dashboard dejarán de ser diseño cuando el backend entregue.

## 5. Qué DEPENDE de IA futura

- **Modelo ML real** (hoy solo demo binaria `binary_only` con `confidence` en AIPredictiva y SSE en DataScienceLab).
- Datasets reales de agricultura (research_v2: taxonomy, label schema, split spec — GO en benchmark, sin dataset físico).
- Recomendaciones IA productivas (hoy: "Escenario demostrativo" honesto).
- La Cinta del Ciclo Científico pasará eslabones DATASET/MODELO/IA/DECISIÓN de ámbar a verde cuando exista el pipeline V2.

## 6. Qué DEPENDE de PRODUCCIÓN futura

- **Terminal de producción agrícola** (proyecto AGRICULTURA-INTELIGENTE hoy en `diseño`; ningún dato productivo real existe: 0 matches de rendimiento/cultivo/parcela/suelo/riego).
- Despliegue UBTN/BBB en campo.
- La cinta muestra PRODUCCIÓN en gris ("en diseño") a propósito — **nunca** se podrá pintar productivo sin datos reales.

## 7. Pruebas que debe realizar Bernardo (checklist manual)

1. Navegación desktop: Header (6 destinos) + Sidebar Dashboard + rutas (Labs, Hardware, Detail, Projects, Knowledge, IA, BBB, Telemetría).
2. Menú móvil (hamburguesa) → 6 destinos + estado + notificaciones + perfil.
3. Telemetría dual: con backend (LIVE/SIM) y sin backend (error honesto, sin pantalla blanca).
4. Fichas: `/hardware/ARDUINO` (learning layer con resources), `/hardware/BBB` (barra ecosistema), `/hardware/NO-EXISTE` (redirect).
5. Knowledge Hub: lista + `/knowledge/doc/research_v2_*` (markdown).
6. Caso degradado sin red → fallback honesto visible.
7. 404 → botón "Volver al Dashboard".
8. Cinta del Ciclo → cada eslabón navega a su página real.
9. Posterior: consolidar ítems §3 experimentales (limpieza DEBUG, hermanamiento de chips, centralizar tokens) ANTES del primer commit.

---

## 8. Estado git congelado (verificado 2026-09-15)

**4 modificados (M):** `README.md` · `SIGCT_RURAL_SYSTEM_BOOT.md` · `docs/MASTERDOC.md` · `docs/PLAN_MAESTRO.md`
**4 modificados código (M):** `App.jsx` · `components/TelemetryPanel.jsx` · `components/TopNav.jsx` · `pages/Dashboard.jsx`
**5 nuevos código (??):** `data/catalog-data.js` · `data/projects-data.js` · `pages/HardwareCatalogPage.jsx` · `pages/HardwareDetailPage.jsx` · `pages/ProjectsPage.jsx`
**+88 docs/auditorías untracked** (incluidas las de este control: RC1/RC2_READINESS/RC2_CONSOLIDATION/ECOSYSTEM_ALIGNMENT/MATURITY, etc.)
**Total: 98 entradas modificadas/sin rastrear.** Último commit en rama: `7b7dfd9` (UBTN architecture). Sin commits pendientes ejecutados.

### Estructura de commit lógico recomendado (cuando Bernardo ordene)
C1 heritage → C2 core (Dashboard/TopNav/TelemetryPanel) → C3 registry (catalog/projects-data) → C4 pages (Catalog/Detail/Projects) → C5 consolidación (App.jsx). Ver `docs/SIGCTIARURAL_RC2_CONSOLIDATION.md` §6.

---

## Resultado

### ¿Puede otro asistente continuar el proyecto sin perder contexto?
**SÍ**, con condiciones.

**Justificación:**
- **SÍ porque** existe una cadena documental viva y actualizada al freeze: README (visión) + MASTERDOC (vértice) + SYSTEM_BOOT (gobernanza con tabla de vigencia) + RC2_READINESS + RC2_CONSOLIDATION + este FREEZE + 10+ auditorías específicas. El estado real del frontend está documentado con archivos exactos, balance de sintaxis y decisiones (U3.4→U5) trazables en `docs/`.
- **SÍ porque** el código del freeze es autocontenido: datos en `catalog-data.js`/`projects-data.js`, registry JSON, rutas en `App.jsx`, y vocabulario honesto en vivo; ninguna pieza depende de contexto que no esté en el repo o en estos docs.
- **CONDICIONES:** (1) leer FREEZE + RC2_READINESS antes de tocar código; (2) respetar reglas de gobernanza (SYSTEM_BOOT §14/§18) y la lista de prohibidos (§0.6); (3) validar sintaxis por balance (sin node_modules); (4) probar solo en Docker 5173/5174; (5) antes del primer commit, ejecutar la lista de consolidación §3 del READINESS; (6) sin acceso a sesiones previas para misiones contextuales, la IA recién ingresada no sabrá detalles no documentados — pero todos los hechos clave (decisiones de diseño, estados, deudas) están en estos documentos.

**Riesgo residual reportado:** la riqueza de detalle de las 90+ misiones previas se ha condensado en 12+ docs; para un retorno CRÍTICO se recomienda que la próxima IA lea al menos: FREEZE RC-2 → RC2_READINESS → RC2_CONSOLIDATION → ECOSYSTEM_ALIGNMENT_AUDIT → ECOSYSTEM_MATURITY_AUDIT → RESEARCH_PRODUCTION_VISION → U4_2_CONTENT_AUDIT, en ese orden.

**Conclusión: ✅ SÍ (con las condiciones listadas).**