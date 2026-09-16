# SIGCTiArural — Auditoría de Paridad con Designer.png

> **Estado:** U2.2. Auditoría read-only. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Fuente primaria:** Designer.png (el usuario la describe textualmente en la misión; es la referencia oficial).
> **Alcance:** Dashboard.jsx (estado post-U2) vs Dashboard Ganadora.

---

## Regla de precedencia

Si existe conflicto entre documentación (Markdown, docs, specs) y el diseño visual de Designer.png, **prevalece Designer.png**. La descripción textual de la Ganadora que se usó para esta auditoría es:

> *La Dashboard NO es BBB-céntrica. La Dashboard es: Capacidades → Hardware → Conocimiento → Laboratorios → Telemetría → IA → Proyectos. BBB es una capacidad operativa, no el centro.*

---

## Pregunta 1: ¿Qué elementos de Designer ya existen exactamente?

| # | Elemento Ganadora | Estado actual en Dashboard.jsx | Ubicación |
|---|---|---|---|
| 1 | **Sidebar izquierda** (Dashboard, Laboratorios, Hardware, Proyectos, Conocimiento) | ✅ **Presente y funcional** (6 ítems: Dashboard, Proyectos, Hardware, Conocimiento, Laboratorios, IA Predictiva) | L11-18 `NAV_SIDEBAR` |
| 2 | **KPIs — Dispositivos activos** | ✅ **Presente** como "Nodos BBB" (online/total) | L282-296 |
| 3 | **KPIs — Proyectos activos** | ✅ **Presente** como "Proyectos" (count de `ecosystemProjects`) | L287 |
| 4 | **Actividad reciente** | ✅ **Presente** con 5 eventos honestos (cluster, telemetría, catálogo, docs, proyectos) | L314-343 |
| 5 | **Estado del sistema** (parcial: fuente/LIVE/SIM) | ✅ **Presente** como badge "SISTEMA OPERATIVO" + sección sidebar "Fuente: {sourceMode}" | L220-228, L250-254 |
| 6 | **Hardware conectado — BBB** | ✅ **Presente** como ClusterCard grid (BBB-01/02/03 con CPU/temp/red) | L354-365 |
| 7 | **Telemetría** | ✅ **Presente y funcional** — TelemetryPanel (items) + GlobalChart (gráfico temporal) | L346-383 |
| 8 | **Conocimiento** (sidebar + ruta) | ✅ **Presente** — ítem sidebar, KPI "Docs", ECOSYSTEM_LINKS, ruta `/knowledge` | L15, L288, L29-35 |
| 9 | **Laboratorios** (sidebar + ruta) | ✅ **Presente** — ítem sidebar, CAPABILITY_CARD, ECOSYSTEM_LINKS, rutas `/labs` + subrutas | L16, L23, L16 |
| 10 | **Proyectos** (sidebar + ruta completa) | ✅ **Presente** — ítem sidebar, KPI, CAPABILITY_CARD, ruta `/proyectos` con 7 proyectos | L13, L21, route |
| 11 | **IA Predictiva** (sidebar + ruta) | ✅ **Presente** — ítem sidebar, CAPABILITY_CARD, ruta `/ai-predictive` | L17, L24 |
| 12 | **Capacidades del Ecosistema** (cadena visual) | ✅ **Presente** — ECOSYSTEM_LINKS con 6 nodos y flechas | L257-278 |
| 13 | **Integraciones Futuras** (hardware roadmap) | ✅ **Presente** — 5 tarjetas (RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV) | L385-423 |

**Resumen:** 13 de los 17 elementos Ganadora están presentes en alguna forma. La base está sólida.

---

## Pregunta 2: ¿Qué elementos faltan completamente?

| # | Elemento Ganadora | Estado | Impacto |
|---|---|---|---|
| 1 | **Mapa de dispositivos** — visualización geográfica o mapa de hardware | ❌ **Completamente ausente** | ALTO — es el elemento visual más diferenciador de la Ganadora |
| 2 | **Acceso rápido a laboratorios** — 5 tiles (Electrónica, Telecomunicaciones, Programación, IA, Robótica) | ❌ **Completamente ausente** — Labs existen como rutas pero NO hay acceso rápido desde Dashboard | MEDIO — destruye la cadena "Capacidades → Labs" |
| 3 | **Estado del sistema: CPU, RAM, Red, Almacenamiento** — como métricas separadas | ❌ **Completamente ausente** — solo se muestra fuente (LIVE/SIM), no métricas de recurso | MEDIO — la Ganadora espera ver salud del hardware a nivel sistema |
| 4 | **KPIs: Lecturas/segundo** | ❌ **Completamente ausente** | BAJO-MEDIO — la Ganadora lo lista como KPI |
| 5 | **KPIs: Alertas activas** | ❌ **Completamente ausente** — el conteo de alertas está implícito en "Nodos BBB" pero NO es un KPI dedicado | BAJO |
| 6 | **Header: Logo SIGCTiArural** (imagen) | ❌ **Completamente ausente** — solo texto "SIGC&T Rural" | BAJO |
| 7 | **Header: Perfil de usuario** | ❌ **Completamente ausente** | BAJO (requiere auth) |
| 8 | **Header: Notificaciones** | ❌ **Completamente ausente** | BAJO (requiere backend) |
| 9 | **Sidebar: Inicio** | ❌ **Completamente ausente** | BAJO |
| 10 | **Sidebar: Reportes** | ❌ **Completamente ausente** — no existe ruta | BAJO |
| 11 | **Sidebar: Configuración** | ❌ **Completamente ausente** — no existe ruta | BAJO |
| 12 | **Hardware conectado: ESP32, STM32, Jetson, MiniPC** — como hardware visible | ❌ **Completamente ausente del Dashboard** — existen en catálogo pero NO se muestran como hardware conectado en Dashboard | MEDIO |

**Resumen:** 12 elementos ausentes. Los de mayor impacto: Mapa de dispositivos, Acceso labs, Estado CPU/RAM/Red.

---

## Pregunta 3: ¿Qué elementos existen parcialmente?

| # | Elemento Ganadora | Qué falta | Completitud |
|---|---|---|---|
| 1 | **Sidebar** | Faltan 3 ítems: Inicio, Reportes, Configuración. Falta Telemetría como ítem de sidebar (solo está en cadena ECOSYSTEM_LINKS) | ~60% |
| 2 | **Header** | Falta logo (imagen), perfil de usuario, notificaciones. Solo hay título + badge de estado | ~25% |
| 3 | **KPIs** | Ganadora pide 4 KPIs; Dashboard tiene 5 diferentes. Coinciden 2 (dispositivos, proyectos). Faltan: lecturas/seg, alertas | ~50% |
| 4 | **Estado del sistema** | Solo fuente LIVE/SIM. Falta: CPU, RAM, Red, Almacenamiento como métricas independientes | ~25% |
| 5 | **Hardware conectado** | Ganadora lista 8 plataformas; Dashboard muestra 3 BBB + 5 futuros. Coinciden: BBB, Raspberry, FPGA, Arduino. Faltan: ESP32, STM32, Jetson, MiniPC | ~50% |
| 6 | **IA Predictiva** | Ruta existe, tile existe, pero NO hay display de Modelo/Confianza/Resultado en Dashboard | ~30% |
| 7 | **Actividad reciente** | Presente pero estática (derivada de datos actuales). Ganadora sugiere eventos dinámicos | ~75% |

---

## Pregunta 4: ¿Qué elemento genera HOY la mayor diferencia visual?

**El Mapa de dispositivos.**

Razón: La Ganadora coloca una "visualización geográfica" de dispositivos como sección central prominente. El Dashboard actual no tiene nada equivalente. Es el único bloque visual de la Ganadora que no tiene parcial ni completa representación en el Dashboard actual.

Los otros gaps (CPU/RAM, acceso labs, header) son importantes pero son refinamientos de secciones que ya existen en algún grado. El Mapa es una sección **enteramente nueva** que redefine la identidad visual del Dashboard.

---

## Pregunta 5: ¿Qué elemento produce el mayor impacto con el menor riesgo?

**Acceso rápido a laboratorios (5 tiles).**

| Criterio | Valoración |
|---|---|
| Impacto visual | ALTO — 5 tiles con iconos + labels rompe la monotonía y refuerza "Capacidades → Labs" |
| Riesgo | MUY BAJO — solo se agregan 5 `<Link>` con iconos; todas las rutas ya existen (`/labs`, `/labs/robotics`, `/lab-embedded`, `/lab-electronics`, `/ai-predictive`) |
| Esfuerzo | MINIMO — ~15-20 líneas JSX aditivas, 0 imports nuevos, 0 datos nuevos |
| Rollback | INSTANTÁNEO — git restore Dashboard.jsx |

**Segundo lugar:** Mapa de dispositivos (ya diseñado en U2.1, reutiliza datos existentes, riesgo bajo-medio).

---

## Pregunta 6: ¿Qué debería ser U2.2 / U2.3 / U2.4?

| Misión | Propuesta | Justificación |
|---|---|---|
| **U2.2** | **Acceso rápido a laboratorios** — 5 tiles en Dashboard (Electrónica, Telecomunicaciones, Programación, IA, Robótica) | Mayor impacto con menor riesgo. Rutas ya existen. Solo JSX aditivo. Cierra gap #7 de la Ganadora. |
| **U2.3** | **Mapa de dispositivos** — implementar el diseño de U2.1 (DeviceMap) en Dashboard.jsx | Segundo gap de mayor impacto. Ya diseñado. Reutiliza datos existentes. Bajo riesgo. |
| **U2.4** | **Estado del sistema extendido** — Métricas CPU, RAM, Red, Almacenamiento derivadas de los nodos BBB existentes | Tercer gap de mayor impacto. Datos ya disponibles en `nodes[i].data`. Solo mostrarlos como KPIs o en sidebar extendido. |

**Misiones futuras (fuera de U2.x):**
- Header (logo + perfil + notificaciones) — requiere assets de imagen y posiblemente sistema de auth
- Sidebar completo (Inicio, Reportes, Configuración) — requiere crear rutas nuevas
- IA Predictiva display en Dashboard — requiere decidable si se muestra o no en Dashboard vs ruta dedicada

---

## Pregunta 7: ¿Qué NO debemos implementar todavía?

| Elemento | Razón para posponer |
|---|---|
| **Perfil de usuario** | Requiere sistema de autenticación/usuarios que no existe |
| **Notificaciones** | Requiere backend de eventos/notifications que no existe |
| **Reportes** | No existe ruta `/reportes` ni generación de reportes |
| **Configuración** | No existe ruta `/config` ni sistema de configuración |
| **Inicio** | Ambiguo: ¿es `/dashboard`? ¿es landing? Definir antes de implementar |
| **Mapa geográfico real** (GPS/lat-lng) | Requiere datos de ubicación geográfica de dispositivos que no existen |
| **IA Predictiva: Modelo/Confianza/Resultado** en Dashboard | Requiere definir si se muestra resumen en Dashboard o solo en ruta `/ai-predictive`. Evitar duplicación |
| **Lecturas/segundo como KPI** | Requiere definir métrica (¿promedio global? ¿por nodo?) y fuente de datos |
| **Alertas activas como KPI dedicado** | Ya está implícito en "Nodos BBB" con conteo de alertCount; posiblemente redundante |

---

## Pregunta 8: Porcentaje real comparado contra Designer.png

### Visual: **40%**
Justificación: 13/17 elementos Ganadora existen, pero con completitud promedio de ~55%. El Mapa de dispositivos (0%), Header (~25%), Estado del sistema (~25%), Acceso labs (0%) arrastran el promedio. Lo que existe es visualmente sólido (sidebar, KPIs, activity, hardware BBB, telemetría).

### Funcional: **55%**
Justificación: El usuario puede navegar a 6/9 destinos Ganadora desde el sidebar. Puede ver KPIs, actividad, telemetría, hardware BBB. NO puede: ver mapa de dispositivos, acceder rápido a labs, ver CPU/RAM/Red, ver IA en Dashboard. La funcionalidad base funciona; las capacidades avanzadas faltan.

### Navegación: **65%**
Justificación: 6/9 ítems de sidebar Ganadora están presentes (Dashboard, Laboratorios, Hardware, Proyectos, Conocimiento, + IA Predictiva extra). Faltan: Inicio, Reportes, Configuración, Telemetría como ítem sidebar (solo está en cadena). La cadena ECOSYSTEM_LINKS compensa parcialmente con 6 destinos navegables.

### Experiencia: **40%**
Justificación: La filosofía "Capacidades → Hardware → Conocimiento → Labs → Telemetría → IA → Proyectos" está implementada en cadena visual (ECOSYSTEM_LINKS) y en sidebar, pero la distribución visual no coincide con la Ganadora. Falta el bloque central (Mapa de dispositivos), el acceso rápido a labs, y las métricas de sistema. La experiencia se siente "funcional pero diferente" vs la Ganadora.

| Dimensión | Porcentaje |
|---|---|
| **Visual** | **40%** |
| **Funcional** | **55%** |
| **Navegación** | **65%** |
| **Experiencia** | **40%** |
| **Promedio general** | **50%** |

---

## RESULTADO FINAL: **GO** para comenzar U2.2

### Justificación:

1. **La base está sólida.** 13/17 elementos Ganadora existen. El Dashboard no necesita reescritura; necesita refinamiento aditivo.

2. **U2.2 (Acceso rápido a laboratorios) es de riesgo trivial.** Solo agrega 5 `<Link>` tiles con iconos usando rutas que ya existen. No toca lógica de datos, no crea componentes nuevos, no modifica rutas existentes. Rollback instantáneo.

3. **El parcial de U2.2 cierra el gap #7 de la Ganadora** (Acceso rápido a laboratorios: Electrónica, Telecomunicaciones, Programación, IA, Robótica) — un bloque visual de alto impacto con esfuerzo mínimo.

4. **Cada misión subsecuente (U2.3 Mapa, U2.4 Estado del sistema) es independiente y aditiva.** No hay dependencias entre ellas ni con backend.

5. **Regla suprema respetada:** NADA desaparece. TODO se preserva. TODO se conecta. TODO evoluciona. U2.2 solo agrega, nunca quita.

**GO.**
