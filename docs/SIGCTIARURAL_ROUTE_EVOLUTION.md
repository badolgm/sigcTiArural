# SIGCTIARURAL_ROUTE_EVOLUTION — Inventario y evolución de rutas

**Familia:** Refactorización Global · **Gate:** U0.5 → U1 (transición a la Dashboard Ganadora)
**Estado:** `referencia` (mapeo de rutas — sin código)
**Regla:** **NADA DESAPARECE** · rutas actuales **congeladas** (adición, nunca sustitución).

---

## 1. Inventario completo de rutas actuales (verificado en `App.jsx`)

| # | Ruta | Vista | Origen | Estado |
|---|---|---|---|---|
| 1 | `/` | Redirect → `/dashboard` | `App.jsx` | **CONGELADA** (sin cambio) |
| 2 | `/dashboard` | Dashboard actual | `Dashboard.jsx` | **REORGANIZAR** (interior) → Ganadora |
| 3 | `/labs` | LabCatalog | `LabCatalog.jsx` | **CONGELADA** (sin cambio) |
| 4 | `/ai-predictive` | IA Predictiva | `AIPredictiva.jsx` | **CONGELADA** |
| 5 | `/data-science` | Ciencia de Datos | `DataScienceLab.jsx` | **CONGELADA** |
| 6 | `/labs/robotics` | Robótica | `RoboticsLab.jsx` | **CONGELADA** |
| 7 | `/advanced-math` | Matemáticas V1 | `AdvancedMathLab.jsx` | **CONGELADA** |
| 8 | `/advanced-math-v2` | Matemáticas V2 | `AdvancedMathLabV2.jsx` | **CONGELADA** |
| 9 | `/lab-embedded` | Sistemas Embebidos | `EmbeddedLab.jsx` | **CONGELADA** |
| 10 | `/lab-telecom` | Telecomunicaciones | `TelecomLab.jsx` | **CONGELADA** |
| 11 | `/lab-electronics` | Física y Electrónica | `ElectronicsLab.jsx` | **CONGELADA** |
| 12 | `/knowledge` | Knowledge Hub (lista) | `KnowledgeHubLayout.jsx` | **CONGELADA** (contenido se amplía) |
| 13 | `/knowledge/doc/:docId` | Knowledge Hub (doc) | `KnowledgeHubLayout.jsx` | **CONGELADA** |
| 14 | `*` | 404 → botón "Volver al Dashboard" | `App.jsx` | **CONGELADA** |

**Total:** 14 rutas registradas (12 navegables + `/` + `*`). Todas permanecen activas.

---

## 2. Rutas nuevas propuestas (aditivas, del diseño Ganadora)

| # | Ruta nueva | Vista | Fase de migración | Requiere backend? |
|---|---|---|---|---|
| A | `/hardware-catalog` | Hardware Catalog (BBB + ESP32/STM32/Arduino/RPi/Jetson/FPGA/MiniPC) | Fase 2 | No (frontend-only, datos estáticos estilo `lab-data`) |
| B | `/proyectos` | Proyectos Reales (casos/evidencia de la cadena) | Fase 5 | No (fuente estática o Knowledge Hub) |
| C (*opcional*) | `/telemetry` | Telemetría dedicada (si se decide separar del Dashboard) | Fase 3+ (decisión) | No |
| D (*gated*) | `/ubtn` (o sección) | Vista de telemetría biológica (UBTN conceptual) | Fase 6 (tras A-7) | Diseño U0 |
| E (*gated*) | `/login`, `/register`, `/admin-2fa` | Auth latente | Decisión D-A | No (código ya existe) |

**Regla:** A y B son las únicas rutas nuevas **sin gate** (pueden ir en la migración). C/D/E
requieren decisión del dueño/gate específico.

---

## 3. Cómo evolucionan (compatibilidad asegurada)

1. **Rutas existentes:** congeladas durante toda la migración — su URL, su componente y su
   comportamiento no cambian.
2. **Contenido que evoluciona:** el *interior* de `/dashboard` se reorganiza (secciones Operación +
   Telemetría); el *índice* de `/knowledge` se amplía; el *catálogo* de `/labs` gana vínculos
   aditivos. Nunca se cambia la ruta por eso.
3. **Alias de voz:** `handleNavigation`/`routeMap` se amplía con las nuevas rutas (A/B), sin tocar
   los 12 comandos actuales (regla: nunca se reduce).
4. **Feature-flag de sombra:** en U1, las vistas nuevas pueden servir bajo flag/URL antes de
   elevarse a la navegación principal; la vista de producción nunca se reemplaza de un solo golpe.

---

## 4. Redirects necesarios

Por la regla de congelamiento, **no se requieren redirects** durante la migración. Se documentan
solo casos futuros hipotéticos (por si el dueño autoriza mover algo):

| Si se moviera... | De | A | Redirect |
|---|---|---|---|
| Telemetría a vista dedicada | sección interna `/dashboard` | `/telemetry` | Mantener `/dashboard` con acceso + `<Navigate>` desde `/dashboard#telemetria` (o anchor) |
| Integraciones Futuras fuera del Dashboard | tiles del Dashboard | `/hardware-catalog` | Mantener botón/atajo en `/dashboard` hacia el catálogo (no se rompe el flujo) |
| Docs legacy | `pages/_deprecated/*` | `/knowledge/doc/*` | Ya migrado en contenido; los archivos se conservan sin ruta (no hay redirect activo posible — no ruteados) |
| UBTN vista | — | `/ubtn` | Si se crea, backup por voz: `ubtn` → nueva ruta |

**Regla de redirects (NAVIGATION_EVOLUTION Fase C):** si algo se mueve, la ruta antigua responde
siempre (redirect automático o acceso desde la página origen). Nunca una URL conocida queda muerta.

---

## 5. Matriz de responsabilidad de rutas

| Ruta | Componente único | Compite con otra? | Dueño |
|---|---|---|---|
| `/dashboard` | `Dashboard.jsx` | No | Migración Fase 3 |
| `/hardware-catalog` | (nuevo componente) | Tiles del Dashboard → reubicación | Migración Fase 2 |
| `/proyectos` | (nuevo componente) | No | Migración Fase 5 |
| `/labs*`, `/lab-*`, `/advanced-math*`, `/data-science`, `/ai-predictive` | Labs/páginas existentes | No | Migración Fase 1-3 (solo vínculos) |
| `/knowledge*` | Knowledge Hub | No | Fase 3 (ampliación de índice) |
| `/login|register|admin-2fa` | Auth latente | Ninguna (decisión D-A) |

---

## 6. Gobernanza

- Cualquier nueva ruta requiere: referencia en `PAGE_MAPPING`, clasificación en
  `COMPONENT_MIGRATION_MATRIX` y autorización del dueño (gate U1).
- Ninguna ruta de la sección §1 se elimina ni se redirige sin ADR + bitácora.
- **Este documento es diseño** — no se modifica `App.jsx` hoy.

---

## 7. Referencias

- [`SIGCTIARURAL_PAGE_MAPPING.md`](SIGCTIARURAL_PAGE_MAPPING.md) — mapa actual → futuro.
- [`SIGCTIARURAL_NAVIGATION_EVOLUTION.md`](SIGCTIARURAL_NAVIGATION_EVOLUTION.md) — hábitos/voz/redirects.
- [`SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md`](SIGCTIARURAL_FRONTEND_MIGRATION_PLAN.md) — fases.
- [`SIGCTIARURAL_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) — inviolable.