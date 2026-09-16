# SIGCTiArural — Misión Estratégica: Aceleración hacia la Dashboard Ganadora

> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Docker (5173):** estable · referencia · NO TOCAR
> **Frontend Refactor (5174):** laboratorio · evolución Ganadora
> **Regla:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA

---

## FASE 1 — Auditoría implementada

| Dominio | Estado live | Observaciones |
|---|---|---|
| **Dashboard** | Bloque 1b Mapa · 1c KPIs · 1d Tarjetas · 1e Labs · 1f Actividad · 2 TelemetryPanel · 3 Grid BBB · 4 GlobalChart · 5 Integraciones · 6 Noticias | Monolito 509 líneas, pero funcional y data-driven |
| **Sidebar / Nav** | TopNav global (6 items) + cadenas CHAIN_LINKS | Sin sidebar lateral "Ganadora" todavía |
| **KPIs** | 5 KPIs ejecutivos (Nodos, Fuente, Plataformas, Proyectos, Docs) | La Ganadora exige: Dispositivos activos · Lecturas/seg · Alertas activas · Proyectos activos |
| **Hardware Catalog** | 10 plataformas, data-driven + "Ver ficha" | Maduro |
| **Hardware Detail** | `/hardware/:id`, 1 página paramétrica | Maduro (U3.2 + U3.2A) |
| **Projects** | Página `projects-data.js` (7 proyectos) + cadena | Maduro |
| **Knowledge** | `/knowledge` + `/knowledge/doc/:docId` | Maduro |
| **Labs** | `LabCatalog` + 6 labs reales | Maduro |
| **Mapa de Dispositivos** | 3 grupos (BBB→dashboard, catálogo→/hardware/:id, roadmap→catalog) | Corregido (U3.2A) |

## FASE 2 — Estadios detectados

- **Redundancias:** cadenas CHAIN_LINKS repetidas entre páginas (patrón aceptado, consolida en módulo en U3.5). "Estado honesto" duplicado visual en cad, catálogo y detalle (aceptado como firma honesta).
- **Navegación innecesaria:** ninguna crítica; eliminación ECOSYSTEM_LINKS (U2.3) ya resolvió la sobre-navegación.
- **Componentes repetidos:** `NEON_COLORS` redefinido en 4+ archivos (deuda técnica → U3.5 consolidar). `ClusterCard` reutilizada bien.
- **Bloques visuales débiles:** KPIs actuales son genéricos (no reflejan la Ganadora); Actividad Reciente es lista plana; falta "Estado del Sistema" (CPU/RAM/Red/Almacenamiento) que la Ganadora exige.
- **Zonas desperdiciadas:** el bloque KPIs (1c) es la zona de mayor visibilidad mal aprovechada hoy.
- **Deuda UX:** "Programación"→`/labs` genérico; badge debug; sin estado sistema.

## FASE 3 — TOP 10 CAMBIOS (impacto visual / riesgo)

| # | Cambio | Impacto visual | Riesgo | Reversible |
|---|---|---|---|---|
| 1 | **KPIs ejecutivos → KPIs Ganadora** (Dispositivos activos, Lecturas en flujo, Alertas activas, Proyectos, Plataformas, Docs, Fuente) | ★★★★★ | Bajo | Sí |
| 2 | **Panel Estado del Sistema** (CPU/RAM/Red/Almacenamiento) visual, honesto | ★★★★★ | Medio | Sí |
| 3 | **Strip "Hardware conectado"** (chips BBB/ESP32/STM32/Arduino/Rasp/Jetson/FPGA/MiniPC) → /hardware/:id | ★★★★ | Bajo | Sí |
| 4 | **Actividad reciente → timeline visual** (iconos, colores, glow) | ★★★★ | Bajo | Sí |
| 5 | **Header Dash ejecutivo** (badge estado + fuente + contador en vivo) | ★★★★ | Bajo | Sí |
| 6 | **Leyenda Mapa de Dispositivos** más rica (tooltips, contadores por grupo) | ★★★ | Bajo | Sí |
| 7 | **Consolidar NEON_COLORS en módulo único** (menos duplicación global) | ★★ | Bajo | Sí |
| 8 | **Unificar cadenas CHAIN_LINKS en componente** | ★★ | Bajo | Sí |
| 9 | **Badge debug → dashboard ocultable** | ★★ | Bajo | Sí |
| 10 | **Sidebar lateral Ganadora** (Inicio/Dashboard/Labs/Hardware/Telemetría/Proyectos/Conocimiento/Reportes/Configuración) | ★★★★ | Medio | Sí |

## FASE 4 — Siguientes pasos elegidos (U3.3 · U3.4 · U3.5)

- **U3.3 = Cambio #2 — Panel Estado del Sistema (CPU/RAM/Red/Almacenamiento).** Impacto visual máximo, cierra la brecha #1 de la Ganadora, honesto con barras no fabricadas. Riesgo medio controlable.
- **U3.4 = Cambio #3 — Strip "Hardware conectado".** Conecta las 8 plataformas con /hardware/:id desde el Dashboard; bajo riesgo, refuerza el ecosistema.
- **U3.5 = Cambio #7+#8 — Deuda cero:** consolidar `NEON_COLORS` + cadenas en módulos compartidos (higiene que reduce costo de todo lo posterior).

*Descartados U3.3-U3.5 alternativos:* sidebar #10 (alto riesgo sin validar runtime), timeline #4 y header #5 (menor ROI que #2/#3), leyenda #6 (ya funcional).

## FASE 5 — Cambio #1 ejecutado

- **Se implementó SOLO el cambio #1**: KPIs ejecutivos → **KPIs Dashboard Ganadora** (7 métricas, 100% derivadas de datos reales, honestas). Ver entregables abajo.

---

## RESULTADO FINAL — Proximidad a Designer.png

| Dimensión | Hoy | Nota |
|---|---|---|
| **Visual** | **58%** | KPIs Ganadora (nuevo #1), Mapa, cadencia; falta Estado Sistema (U3.3) y strip hardware (U3.4) |
| **UX** | **74%** | Estados honestos, cadenas, correcciones; deudas menores (labs genérico, badge debug) |
| **Navegación** | **80%** | 19 rutas, sin sobre-navegación tras U2.3, breadcrumbs cadena |
| **Dashboard Ganadora** | **62%** | Núcleo listo; faltan Estado Sistema, Hardware conectado, header rico, sidebar |

**Próximo cuello de botella:** el **Panel Estado del Sistema (U3.3)** — es la pieza visual que más separa al Dashboard de la Ganadora hoy. Su riesgo (no fabricar datos) se controla con métricas derivadas reales (CPU/temp de BBB, modo de fuente, lecturas en flujo).