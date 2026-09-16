# SIGCTiArural — U3.5 UX Review (Dashboard vs Designer.png)

> **Estado:** U3.5 REVIEW. Solo revisión. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Comparativa:** Dashboard.jsx · HardwareCatalogPage.jsx · HardwareDetailPage.jsx · ProjectsPage.jsx · TopNav.jsx
> **Contra:** Designer.png / Designer.jpg (spec textual provista por el usuario).
> **Nota:** el modelo no puede leer imágenes; la comparación usa la spec Ganadora textual (Sidebar, Header con Estado/Perfil/Notificaciones, KPIs, Mapa, Actividad, Estado sistema, Acceso labs, Hardware conectado, IA Predictiva).

---

## 1. Qué elementos visuales sobrAN

| Elemento | Dónde | Razón |
|---|---|---|
| **🗞️ Bloque 6 — Noticias & Enlaces Oficiales** | Dashboard L573-583 | No existe en la Ganadora; enlaces dispersos (Arduino/RPi/Alexa/Google/IEEE) sin contexto de ecosistema; duplica la función de `links[]` de las fichas |
| **🧩 Bloque 5 — Integraciones Futuras (5 ClusterCards)** | Dashboard L555-571 | **REDUNDANTE CON EL MAPA:** renderiza los mismos `futureNodes` que el Mapa Grupo C (Roadmap L325-346). Doble representación del mismo dato |
| **Blque 4 — "Operación — Telemetría Global" (Gráfico grande `compact=false`)** | Dashboard L531-553 | En la Ganadora el dato "lecturas" es un **KPI** (Lecturas/seg), no un gráfico protagonista empujado por scroll |
| **📋 Bloque 1d — Tarjetas de Capacidades (CAPABILITY_CARDS)** | Dashboard L356-368 | 5 cards genéricas (IA, Data, etc.) que ya son accesibles vía KPIs/sidebar; filler visual medio |
| **Bluque 3 — Grid BBB (3 ClusterCards completas)** | Dashboard L511-529 | Es la pieza más "Dashboard BBB antigua": botones Iniciar/Reiniciar + tarjetas grandes duplican lo que el Mapa Grupo A ya resume |

## 2. Qué elementos visuales faltan

| Elemento Ganadora | Faltante | Dónde debería estar |
|---|---|---|
| **Sidebar lateral** (Inicio, Dashboard, Labs, Hardware, Telemetría, Proyectos, Conocimiento, Reportes, Configuración) | ❌ | Sustituir/complementar TopNav en viewport grande (Dashboard `lg:flex-row` ya tiene estructura de 2 columnas, pero el contenedor interno no es un sidebar real) |
| **Header con Estado del sistema + Perfil + Notificaciones** | ❌ | El TopNav solo tiene logo + nav + cluster status; faltan notificaciones y perfil |
| **IA Predictiva como módulo en Dashboard** | ❌ | Existe `/ai-predictive` como página; la Ganadora la muestra en el dashboard (Modelo/Confianza/Resultado) |
| **Hardware conectado (chips: BBB ESP32 STM32 Arduino Raspberry Jetson FPGA MiniPC)** | ❌ | El Mapa los lista, pero el diseño pide una **franja visual de conexión** explícita |
| **Exactitud: KPIs "Lecturas/seg"** (hoy "Lecturas (flujo)") | ⚠️ | Ya hay 7 KPIs Ganadora (U3.3) pero la métrica no es una tasa/seg real |
| **Reportes / Configuración** | ❌ | Son items de la spec; aún no existen rutas |

## 3. Qué sigue pareciendo Dashboard BBB antigua

| Bloque | Evidencia |
|---|---|
| **Bloque 3 — Grid BBB (3 ClusterCards)** | Título "⚙️ Operación — Infraestructura BBB", botones "Iniciar/Reiniciar" de ClusterCard, layout de 3 columnas clásico pre-ganadora |
| **Bloque 4 — Telemetría Global** | Gráfico `GlobalChart compact={false}` de una página mega-dash antigua |
| **Bloque 5 — Integraciones Futuras** | 5 ClusterCards de la etapa previa al Mapa (fue lo que se migró a U2.4) |
| **Bloque 6 — Noticias** | Lista de enlaces sin estilo ganadora |
| **TopNav sin sidebar** | Marca toda la app como "navegación superior monolítica" clásica |

## 4. Qué ya parece Dashboard Ganadora

| Elemento | Evidencia |
|---|---|
| **1b Mapa de Dispositivos (U3.5 refinado)** | 3 zonas de ecosistema (Operativos/Disponible/Roadmap), leyenda, accesos directos — es el corazón Ganadora |
| **1c KPIs ejecutivos (U3.3)** | 7 métricas neon honestas (Dispositivos, Lecturas, Alertas, Proyectos, Plataformas, Conocimiento, Fuente) |
| **1e Acceso Rápido a Laboratorios** | 7 tiles con acento por lab — coincide con "Acceso rápido a laboratorios" de la Ganadora |
| **1g Panel Estado del Sistema (U3.3)** | CPU/RAM/Red/Almacenamiento honestos + indicadores de ecosistema |
| **1f Actividad reciente** | Feed de estado con puntos de color — estilo Ganadora |
| **Fichas de Hardware (Catalog + Detail)** | Página por plataforma con cadena, badges, ficha técnica — maduro |

## 5. Qué bloque ocupa demasiado espacio

| Bloque | Espacio estimado | Veredicto |
|---|---|---|
| **Bloque 4 — Telemetría Global** | ~130 px + gráfico grande | Demasiado para su ROI actual (dato ya está como KPI y como panel 2) |
| **Bloque 5 — Integraciones Futuras** | ~300 px (5 ClusterCards) | Demasiado: **duplica el Roadmap del Mapa** |
| **Bloque 3 — Grid BBB** | ~280 px (3 ClusterCards) | Demasiado para ser "la misma info" que Mapa Grupo A |
| **Bloque 6 — Noticias** | ~180 px | Innecesario |

**En total, los bloques 3-6 ocupan ~60-65 % de la altura del Dashboard con contenido redundante/de etapa antigua.**

## 6. Qué bloque merece crecer

| Bloque | Por qué |
|---|---|
| **Mapa de Dispositivos (1b)** | Es la "vista del ecosistema": merece el espacio que hoy roban 3-6, con más contexto por chip (estado/hardware conectado) |
| **Panel Estado del Sistema (1g)** | Pieza diferencial Ganadora; puede pasar de fila a panel completo con IA Predictiva anexa |
| **Acceso Rápido a Labs (1e)** | Feedback visual de tráfico/uso futuro |
| **KPIs (1c)** | Pueden crecer en sub-etiquetas informativas (ej. "última lectura: HH:MM") |

## 7. Los 3 próximos cambios de MAYOR IMPACTO y MENOR RIESGO

| # | Cambio | Impacto | Riesgo | Notas |
|---|---|---|---|---|
| 1 | **Header Ganadora: reemplazar la franja del bloque 3 (Grid BBB) por un "Hardware conectado" strip + mover BBB a detalle** | ★★★★★ | Bajo | Reusa ClusterCard dismimuido o elimina el grid redundante; los datos viven en el Mapa (Grupo A). Aditivo pero acotado |
| 2 | **Footer/Noticias (bloque 6) → sustituir por "IA Predictiva resumen" teaser** | ★★★★ | Bajo | Ya existe página `/ai-predictive`; teaser data-driven (Modelo/Confianza/Resultado honestos) sin backend |
| 3 | **TopNav → Header Ganadora** (logo + estado + notificaciones + perfil; nav colapsado) | ★★★★ | Bajo-Medio | Cambia componente compartido TopNav.jsx (alto impacto visual global; riesgo controlado con fallback móvil) |

## 8. Selección (1 sola)

### ✅ **Cambio #1 — Sustituir el Grid BBB (bloque 3) por franja "Hardware conectado" + condensar Telemetría Global (bloque 4)**

**Justificación:**
- Es el cambio que **más elimina "aspecto BBB antigua"** (bloque 3) en un solo movimiento.
- Datos **ya existentes**: la franja se deriva de `hardwareCatalogEntries` (ya usados en el Mapa) + el estado de los BBB, sin inventar nada.
- Los nodos BBB siguen representados (Mapa Grupo A) → **NADA DESAPARECE**, solo cambia de representación.
- Riesgo bajo: edición localizada en Dashboard.jsx (bloque 3 y 4), sin tocar TopNav/componentes compartidos, sin rutas nuevas.
- Impacto visual: el primer pliegue del Dashboard pasaría de "tarjetas antiguas" a "ecosistema Ganadora".

**Alcance del cambio (cuando se autorice):**
1. Bloque 3 (Grid BBB, L511-529) → reemplazar por **franja "🔌 Hardware conectado"**: chips compactos por plataforma (icono + nombre + estado) navegables a `/hardware/:id`, y los 3 BBB como chips pequeños a `/dashboard`.
2. Bloque 4 (Telemetría Global, L531-553) → **condensar** a un panel colapsable de 1 fila (reusando GlobalChart con `compact=true`), liberando altura.
3. Bloque 5 (Integraciones Futuras) → dejar como nota "ver en Mapa/Roadmap" (se evita la duplicación) — evaluado en una sub-misión posterior si se aprueba.
4. Bloque 6 (Noticias) → sin cambios en este alcance.

---

## RESULTADO

## ✅ **GO**

para el **cambio #1** (franja "Hardware conectado" + condensar Telemetría Global). Es el de mayor impacto visual con el menor riesgo: usa solo datos existentes, edita un bloque de Dashboard.jsx, y no toca componentes compartidos, rutas, backend, Docker, BBB, Labs, Knowledge ni IA.

*Condiciones:*
1. Ejecutar como **reemplazo de representación** (no borrar datos): los BBB y futureNodes siguen presentes en el Mapa.
2. Respetar regla honesta: chips de hardware sin datos → "Pendiente de integración".
3. Re-auditar con este mismo marco después de implementar U3.5 (bloques 3-6).

*NO GO diferido:* cambio #3 (TopNav→Header) queda pospuesto hasta validar runtime, por ser el componente compartido más sensible.