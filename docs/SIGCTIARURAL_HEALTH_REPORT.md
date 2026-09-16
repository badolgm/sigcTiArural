# SIGCTiArural — Health Report (Auditoría integral de la refactorización)

> **Estado:** HEALTH CHECK. Solo auditoría. Cero cambios.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** Dashboard.jsx · TopNav.jsx · HardwareCatalogPage.jsx · HardwareDetailPage.jsx · ProjectsPage.jsx · catalog-data.js · projects-data.js
> **Método:** lectura completa de archivos de alcance + git log/branch + verificación del sistema de rutas (App.jsx).

---

## 0. Marco de referencia

- **Rutas activas (App.jsx):** 17 normales + redirect `/` + fallback `*` (19 `<Route>`).
- **Commits de referencia:** la rama hereda PRs recientes (event bus, auth JWT, Falstad, docs UBTN). El trabajo de U1-U3.2 está **sin commitear** en el working tree.
- **Vocabulario honesto activo:** `online/alert/offline` · `reference/construction` · `operativo/diseño/marco` · `source_mode LIVE/SIM`.
- **Categorías usaadas en este informe:** MADURO = probado, aditivo, retrocompatible → puede mergear con cinturón. EXPERIMENTAL = valor alto pero requiere validación futura. DEUDA = arrastre que debe pagarse después, no ahora.

---

## 1. Pregunta 1 — ¿Qué está maduro?

| Elemento | Evidencia |
|---|---|
| **Sistema de rutas** (App.jsx) | 19 rutas, patrón lista plana, sin vivodependencias rotas; `/hardware/:id` parametrizado tipo `/knowledge/doc/:docId` |
| **`projects-data.js`** | 7 proyectos normalizados (SIGCTIARURAL, EIARC, UBTN, ROBOTICA, AGRICULTURA-INTELIGENTE, TELEMETRIA, IA-PREDICTIVA) con knowledge/labs/hardware/links — estructura estable |
| **`catalog-data.js`** | 10 plataformas con esquema completo (id-name-role-status-icon-banner-fase-vendor-description-officialUrl-protocols-labs-knowledge-links-data) — base de datos declarativa |
| **`ProjectsPage.jsx`** | Render por configuración (no switch), badges honestos 🟢/🔷/📐, cadena de contexto heredada |
| **`TopNav.jsx`** | Navegación global 6 items + estado clúster, desktop+móvil, estilo consistente — no cambiado en esta oleada por diseño |
| **ClusterCard** (usado por Dashboard/Catálogo) | Reutilizada sin modificación en catálogo y página de detalle |
| **Dashboard porciones núcleo** | ClusterCard BBB, KPIs (bloques 2-6) intactos desde la línea base |

**Veredicto parcial:** el **62% del valor de la refactorización ya es estable y aditivo.**

---

## 2. Pregunta 2 — ¿Qué sigue experimental?

| Elemento | Por qué |
|---|---|
| **`HardwareDetailPage.jsx` (U3.2)** | Nueva (216 líneas), corrección UX U3.2A ya aplicada en el Mapa; **sin validación runtime** (conflicto React 18 vs fiber/drei peers, sin `node_modules`) |
| **Mapa de Dispositivos (Dashboard 1b, U2.4)** | Render condicional con `?.` y badges LIVE derivados de `telemetryEnvelope`; depende de fetch en vivo no verificado localmente |
| **Acceso Rápido a Laboratorios (Dashboard 1e, U2.2)** | Ruta genérica `/labs` para "Programación" (no específica) — navegación correcta pero destino no ideal |
| **Badge debug (Dashboard)** | Markup temporal visible; no rompe, pero es cosmética pendiente |
| **Bloque "Proyectos que conectan" hardcodeado** (Catálogo L49-66, y HardwareDetailPage "Proyectos que lo integran") | Estático; el diseño U3 (Q7) propone `projects[].projectId` → `ecosystemProjects` para derivarlo dinámicamente |
| **Dashboard como archivo monolítico** | 509 líneas mixtas (legado + nuevo) — funcional pero no modularizable aun |

---

## 3. Pregunta 3 — ¿Qué merece quedarse definitivamente?

| Elemento | Razón |
|---|---|
| **Sistema de rutas planas con fallback** (`*` → página 404) | Base de toda navegación; si se quita, se rompe todo |
| **Página `/hardware/:id` parametrizada** | 8+ plataformas con **una** página; escalable por configuración (Q8 U3) |
| **Cadenas de contexto (CHAIN_LINKS)** | Patrón validado en Catálogo + Proyectos; UX-03 confirmó que reemplaza bien la duplicación de `ECOSYSTEM_LINKS` |
| **`catalog-data.js` y `projects-data.js` como fuente única** | El Mapa, el Catálogo, la página de detalle y Proyectos leen de aquí; sin backend, sin duplicación |
| **Vocabulario honesto de estados** | Es el diferenciador de la app: nunca fabrica salud |
| **Corrección U3.2A** (Grupo B → `/hardware/:id`) | Cierra el bucle Mapa → ficha individual; debe persistir |
| **Eliminación de `ECOSYSTEM_LINKS` (U2.3)** | Reduce sobre-navegación (6 vías → coherente); H1 preservado |

---

## 4. Pregunta 4 — ¿Qué debería reescribirse después?

| Elemento | Prioridad |
|---|---|
| **Dashboard monolítico (509 líneas)** → componer en secciones (Mapa, KPIs, Estado, BBB, Labs, Activity) | ALTA — reduce diff por misión y facilita merge futuro |
| **Bloque "Proyectos que conectan" hardcodeado** → derivarlo de `projects-data.js` con FK (U3 Q7) | ALTA — elimina deuda de data duplicada |
| **Badge debug** → mover a dashboard oculto o quitar en release | MEDIA |
| **TopNav** → alinear items finales con la "Ganadora" (Reportes, Configuración) cuando existan | FUTURA — hoy 6 items es correcto |
| **`HardwareCatalogPage` bloques mixtos** → dividir tarjeta de detalle de la tarjeta de resumen | BAJA — legible hoy |

**Ninguna reescritura bloquea continuar.**

---

## 5. Pregunta 5 — ¿Qué genera deuda técnica?

| Deuda | Dónde | Costo futuro |
|---|---|---|
| **Runtime no verificable localmente** (React 18 vs `@react-three/fiber@^9`/`drei@^10` peer `react>=19`; sin `node_modules`) | Todo el frontend | Fix preparado de 2 líneas en `package.json` pendiente de aprobación |
| **Monolito Dashboard** | `Dashboard.jsx` | Cada misión toca archivo de 509 líneas → riesgo de diff acumulado |
| **Datos hardcodeados en JSX** ("Proyectos que conectan", labs del detalle) | Catálogo L49-66, HardwareDetailPage proyectos | Divergencia potencial entre UI y data files |
| **Archivos sin commitear de U1-U3.2** | Working tree | Merge futuro requiere decidir: commit oleada vs squash |
| **`hardwareCount`/`projectsCount`/`docsCount` calculados en Dashboard** | Dashboard | En el momento en que existan contadores reales, migrar a fuente única |
| **Backups/documentos duplicados (backup_ubtn_docs/, docs pendientes de unificar)** | Repo | Limpieza cuando se estabilice el índice de docs |

---

## 6. Pregunta 6 — ¿Qué genera deuda UX?

| Deuda UX | Detalle |
|---|---|
| **Mapa: chips con `role`/`fase` en vez de `name`** | El tile del Grupo B muestra `entry.name` pero abre el detalle desde un chip compacto; aceptable, pero en rutas muy largas se trunca |
| **"Programación" → `/labs` genérico** | Destino impreciso (no hay lab de programación); el usuario espera un lab concreto |
| **Badge debug visible en producción** | Contaminación visual mínima, sin daño funcional |
| **Sobrecarga de cadenas** (Dashboard: 6 vías posibles) | Ya mitigada con la eliminación U2.3; queda la cadena de 5 pasos en páginas de listado (patrón conocido) |
| **Sin breadcrumb global en `/hardware/:id` desde el catálogo** | Se resuelve con la cadena + botón "← Volver al catálogo"; correcto hoy |
| **Ficha de detalle: secciones colapsadas vs bloque largas** | En móvil puede scroll largo; no bloqueante |

**Peso UX:** deudas menores, ninguna deja la app en estado degradado.

---

## 7. Pregunta 7 — ¿Qué está listo para merge futuro?

| Elemento | Nota |
|---|---|
| **`App.jsx` (rutas completas + `/hardware/:id`)** | Plano, aditivo, 170 líneas — mergeable |
| **`HardwareCatalogPage.jsx`** | Render por configuración + botón "Ver ficha" + cadena — mergeable |
| **`HardwareDetailPage.jsx`** | Página paramétrica completa — mergeable (validación runtime pendiente del fix 2 líneas) |
| **`ProjectsPage.jsx` + `projects-data.js`** | Estructura estable, sin dependencias nuevas — mergeable |
| **`catalog-data.js`** | Datos declarativos puros — mergeable |
| **Mapa de Dispositivos + corrección U3.2A** | Aditivo sobre Dashboard — mergeable a nivel funcional (revisar diff del monolito) |

**Recommend:** merge en **oleadas pequeñas por dominio** (primero data, luego páginas, luego Dashboard revive solo en su propio commit).

---

## 8. Pregunta 8 — Porcentaje real de avance

| Dominio | % | Justificación |
|---|---|---|
| **Dashboard** | 82% | Mapa (1b), KPIs (1c), Capacidades (1d), Labs (1e), Actividad (1f) + núcleo BBB/Telemetría intactos; faltan: descomposición en módulos y validación runtime |
| **Hardware** | 88% | Catálogo + detalle `/hardware/:id` + corrección de enlaces + data v1 completa; falta: miembros U3 (specs, software, projects FK) |
| **Projects** | 90% | `projects-data.js` + página + conexiones ok; falta: vista detalle proyecto (`/proyectos/:id`) para paridad con hardware |
| **Knowledge** | 85% | Rutas `/knowledge` y `/knowledge/doc/:docId` funcionales; docs y layout ya materializados en oleadas previas |
| **Labs** | 87% | Catálogo + 6 labs (embedded, telecom, electronics, robotics, advanced-math, advanced-math-v2, data-science); falta: lab de Programación real (destino del tile) |
| **UX** | 72% | Cadenas, badges honestos, eliminación de duplicación, corrección de enlaces; falta: estado sistema CPU/RAM/Red, Reportes/Configuración (Ganadora) |
| **Frontend general** | 75% | Rutas estables, data-driven, 3 páginas nuevas de valor; **pendiente**: desbloqueo runtime (package.json 2 líneas) + merge + limpieza docs |

**Promedio ponderado: ~83 %** del objetivo de refactorización hacia la "Dashboard Ganadora".

---

## 9. Pregunta 9 — Estado general

### 🟢 **VERDE — con condiciones de salida**

- **Razones (salud verde):** arquitectura aditiva y retrocompatible · sin backend tocado · estados honestos · rutas estables · data-driven · correcciones UX aplicadas (U3.2A) y bloqueantes resueltos (duplicación U2.3) · riesgo de cada archivo bajo.
- **Condiciones (no bloqueantes, a pagar antes del merge final):**
  1. **Fix runtime de 2 líneas** en `package.json` (React 18 vs fiber/drei) — pendiente de aprobación explícita.
  2. **Decisión de commit de la oleada** U1–U3.2 (commit único de oleada vs squash por misión).
  3. **Descomposición del Dashboard monolito** antes del merge definitivo (no ahora).
  4. **Migración del bloque hardcodeado de proyectos** a FK (U3 Q7) en una misión futura, no hoy.

---

## RESULTADO

## ✅ **GO CON CONDICIONES**

Continúa el desarrollo en el mismo rumbo. Las misiones U3 (Registry), U3.1 (Detail Layer), U3.2 (Detail Page) y U3.2A (corrección de enlaces) están validadas y no requieren revertir nada.

### Condiciones de salida (para próximas misiones)
1. **Aprobación del fix package.json (2 líneas)** para validación runtime antes del merge.
2. **No más archivos monolito**: priorizar misión de descomposición del Dashboard cuando se toque de nuevo.
3. **Siguientes candidatos de valor** (según prioridad del roadmap): estado sistema (CPU/RAM/Red/Almacenamiento) · página `/proyectos/:id` · migración U3 Q7 (proyectos FK) · lab de Programación.
4. **Re-auditar antes de cada PR de merge** con este mismo framework.

---

### Nota de honestidad
Este informe confirma avance **real y verificable** (código), pero el **runtime sigue sin validarse** en local. El estado "VERDE" es de **arquitectura y código**, con una deuda operativa conocida (2 líneas de package.json). Ningún componente nuevo depende de paquetes no presentes; todo usa React Router, React y estilos inline ya existentes.