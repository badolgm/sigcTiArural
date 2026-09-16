# SIGCTIARURAL_NAVIGATION_EVOLUTION — Evolución sin destruir hábitos

**Familia:** Refactorización Global · **Gate:** U0 → U0.5 → Preservación + Expansión
**Estado:** `referencia` (estrategia de navegación aditiva, no implementación)
**Regla rectora:** **NADA DESAPARECE.** La evolución es por **ampliación**, no por sustitución.

---

## 1. Propósito

Responder: **¿Cómo evolucionar la navegación actual de SIGCTiArural sin destruir los hábitos
de los usuarios actuales?** Este documento define la estrategia de navegación aditiva que se
aplica junto con [`DASHBOARD_REIMAGINED_V2`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) y la
cadena pedagógica (`VISION_ALIGNMENT`).

---

## 2. Hábitos de navegación actuales (lo que se protege)

| Hábito del usuario | Ruta actual | Componente | Se preserva |
|---|---|---|---|
| Ir al Dashboard al entrar | `/dashboard` (redirect de `/`) | `Dashboard.jsx` | **Sí** (ruta intacta, contenido reorganizado internamente) |
| Ver laboratorios | `/labs` (TopNav "Laboratorios") | `LabCatalog.jsx` | **Sí** |
| Abrir un lab específico | `/labs/robotics`, `/lab-telecom`, `/lab-electronics`, `/lab-embedded`, `/advanced-math`, `/advanced-math-v2`, `/data-science` | Labs individuales | **Sí** (todas las rutas intactas) |
| Consultar IA Predictiva | `/ai-predictive` (TopNav "IA Predictiva") | `AIPredictiva.jsx` | **Sí** |
| Navegar el Knowledge Hub | `/knowledge` → `/knowledge/doc/:docId` (TopNav "Conocimiento") | `KnowledgeHubLayout` | **Sí** |
| Usar el asistente de voz | VoiceAssistant flotante (12 comandos) | `VoiceAssistant.jsx` | **Sí** y se amplía |
| Ver estado del clúster | Dot en TopNav (BBB-01/02/03) | `TopNav.jsx` | **Sí** (dot preservado) |
| Volver al Dashboard desde 404 | Botón "Volver al Dashboard" | Ruta `*` | **Sí** |

**Principio:** ninguna URL, ningún enlace visible, ningún item del TopNav ni ningún comando del
asistente de voz se elimina o se redirige sin su consentimiento.

---

## 3. Estrategia de evolución aditiva (fases de diseño)

### Fase A: Añadir sin quitar (diseño inmediato, gate U0.5)

**Objetivo:** ampliar la cobertura sin cambiar nada de lo que ya funciona.

| Acción | Detalle | Hábito roto |
|---|---|---|
| Añadir item "Hardware" al TopNav | Nuevo item después de "Conocimiento" | **Ninguno** |
| Añadir item "Proyectos" al TopNav | Nuevo item después de "Hardware" | **Ninguno** |
| Añadir item "Data Science" al TopNav | Nuevo item después de "IA Predictiva" | **Ninguno** |
| Añadir comandos al VoiceAssistant | `hardware` → `/hardware-catalog`, `proyectos` → `/proyectos` | **Ninguno** (solo se añaden comandos) |
| Ruta nueva `/hardware-catalog` | Entrada aditiva en `App.jsx` | **Ninguno** |
| Ruta nueva `/proyectos` | Entrada aditiva en `App.jsx` | **Ninguno** |

**TopNav resultante (diseño, no implementado):**

```
[Dashboard] [Laboratorios] [IA Predictiva] [Data Science] [Conocimiento] [Hardware] [Proyectos]
                                                         ● (dot clúster)
```

**Enlaces preservados:** todos los existentes se mantienen en el mismo orden; los nuevos se añaden
al final (o agrupados lógicamente). El logo, dot y voice assistant permanecen.

### Fase B: Reorganizar contenido interno (diseño gate U1 posterior)

**Objetivo:** reorganizar el **contenido** de las páginas existentes sin cambiar sus URLs.

| Acción | Detalle | Hábito roto |
|---|---|---|
| Reorganizar Dashboard en secciones (Operación + Telemetría) | Se reorganiza el interior de `Dashboard.jsx`; URLs intactas | **Ninguno** (mismo lugar, mismo nombre) |
| Realojar tiles "Integraciones Futuras" como entradas del Hardware Catalog | Los 5 tiles reales se transforman en entradas de catálogo con estado `vacío/futuro`; identidad y enlaces preservados | **Ninguno** (se muestran en lugar nuevo, pero la información no se pierde) |

### Fase C: Redirigir sin romper (gate U1+, requiere migración documentada)

**Objetivo:** si en algún momento futuro algo se mueve, siempre se deja un redirect.

| Regla | Ejemplo |
|---|---|
| **Si algo cambia de ruta**, crear redirect automático (`<Navigate to="nueva-ruta" replace />` en la ruta antigua) | Si `/labs` se reorganizara internamente, `/labs` sigue respondiendo |
| **Si algo se duplica**, mantener ambas entradas durante un periodo de gracia | Si `TelemetryPanel` se accediera desde dos lugares, ambos funcionan |
| **Si se añade una sub-sección dentro de una página**, usar breadcrumb/anchor sin cambiar la ruta base | `/dashboard#operacion`, `/dashboard#telemetria` |

---

## 4. Mapa de voz ampliado (sin reducir comandos existentes)

| Comando actual (preservado) | Ruta | Comando nuevo (añadido) | Ruta nueva |
|---|---|---|---|
| `dashboard` / `home` | `/dashboard` | `hardware` | `/hardware-catalog` |
| `labs` | `/labs` | `proyectos` | `/proyectos` |
| `robotics` | `/labs/robotics` | `telemetry` / `telemetria` | `/telemetry` o sección Dashboard |
| `ai` | `/ai-predictive` | `ubtn` | Sección conceptual (no ruta aún) |
| `docs` | `/knowledge/doc/masterdoc` | | |
| `math` | `/advanced-math-v2` | | |
| `advanced-math` | `/advanced-math` | | |
| `advanced-math-v2` | `/advanced-math-v2` | | |
| `lab-embedded` | `/lab-embedded` | | |
| `lab-telecom` | `/lab-telecom` | | |
| `lab-electronics` | `/lab-electronics` | | |
| `data-lab` | `/data-science` | | |

**Regla inmutable:** el `routeMap` del VoiceAssistant **nunca** se reduce; solo se amplía.

---

## 5. Breadcumb (cadena pedagógica como guía de navegación)

La cadena Conocimiento → Laboratorios → Hardware → Protocolos → Telemetría → IA → Proyectos
Reales actúa como **breadcrumb natural** (ver `VISION_ALIGNMENT` §2). En la v2:

```
Inicio → [Conocimiento] → [Laboratorios] → [Hardware] → [Protocolos] → [Telemetría] → [IA] → [Proyectos]
```

- Cada sección del Dashboard enlaza a la siguiente en la cadena (aditivo).
- El breadcrumb se muestra **en la interfaz** para guiar al usuario sin perder orientación.
- Los usuarios actuales que van directo a `/ai-predictive` o `/labs/robotics` siguen llegando
  al mismo lugar; simplemente ahora pueden seguir el breadcrumb hacia atrás o hacia adelante.

---

## 6. Selector de persona (capacidad aditiva, no sustitutiva)

El selector de persona (5 personas; Agricultor gated) se añade como **capacidad aditiva**:

| Hábito actual | Hábito nuevo (aditivo) | Hábito roto |
|---|---|---|
| El usuario entra a Dashboard y ve lo que hay | El usuario (si quiere) selecciona persona → Dashboard filtrado por IA | **Ninguno** (el Dashboard general sigue existiendo para quien no seleccione persona) |

El selector **no reemplaza** la vista general; se añade como opción. Quien no lo usa ve el
Dashboard tal como hoy.

---

## 7. Anti-patrones de navegación (qué NO se hace jamás)

1. **No se elimina ningún enlace del TopNav** (ampliar, nunca reducir).
2. **No se cambia el orden de los items existentes** (los nuevos se añaden al final o se agrupan).
3. **No se elimina ningún comando del VoiceAssistant** (ampliar `routeMap`, nunca reducir).
4. **No se redirige una ruta existente a otra sin告知 al usuario y crear redirect automático.**
5. **No se ocultan labs tras un menú anidado** (la cadena es el breadcrumb, no un menú hamburger).
6. **No se rompe el hábito de `/dashboard` como landing** (siempre sigue siendo la ruta por defecto).
7. **No se eliminan páginas** (`_deprecated/*` se preservan; `Login/Register/Admin2FA` se mantienen
   como latentes).

---

## 8. Criterios de éxito de esta evolución

1. Un usuario actual que usa `/dashboard`, `/labs`, `/ai-predictive`, `/knowledge` **no nota
   ninguna ruptura** en sus rutas habituales.
2. Las rutas nuevas (`/hardware-catalog`, `/proyectos`) son **fáciles de descubrir** (TopNav + Voice
   Assistant) pero no obligatorias.
3. La cadena pedagógica se **entiende visualmente** (breadcrumb) pero no se impone.
4. El selector de persona es **opcional**; la vista general del Dashboard se mantiene como
   default para todos.

---

## 9. Referencias

- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — spec visual.
- [`SIGCTIARURAL_VISION_ALIGNMENT.md`](SIGCTIARURAL_VISION_ALIGNMENT.md) — cadena pedagógica / no-negociables.
- [`SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md`](SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md) — flujos por persona.
- [`SIGCTIARURAL_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) — qué se preserva.
- [`SIGCTIARURAL_EVOLUTION_MATRIX.md`](SIGCTIARURAL_EVOLUTION_MATRIX.md) — secuencia de diseño por módulo.