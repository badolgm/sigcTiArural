# SIGCTiArural — Hardware Detail Layer (Diseño)

> **Estado:** U3.1. Solo diseño. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** páginas individuales por plataforma del `Universal Hardware Registry` (U3).
> **Regla:** NO implementar `Hardware Registry v2` aún. Diseñar solo la **capa de detalle**.

---

## 1. Contexto

`HardwareCatalogPage.jsx` hoy muestra un **grid unificado** de las 10 plataformas (`BBB`, `ESP32-WROOM-32`, `ESP32-S3`, `STM32`, `ARDUINO`, `RASPBERRY-PI`, `JETSON`, `FPGA`, `MINI-PC`, `CUSTOM-HW`). No existe una **página individual** (`/hardware/:id`).

La ganadora (Designer.png) y el modelo de aprendizaje (`SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md`) piden profundidad por dispositivo: una plataforma debe ser un **destino navegable**, no solo una tarjeta.

---

## 2. Pregunta 1 — ¿Cómo debe verse una página individual?

### 2.1 Ruta y patrón

- Ruta: **`/hardware/:id`** (nueva, pero se alinea con rutas existentes `/knowledge/doc/:docId`, `/lab-*`).
- `:id` es el `id` de `catalog-data.js` (`BBB`, `ESP32-WROOM-32`, …). Ruta con fallback: si el id no existe → redirección a `/hardware-catalog` con nota "plataforma no registrada".
- **Sin crear 8 páginas manuales**: UNA página parametrizada (`HardwareDetailPage.jsx`) que renderiza según el `id`. Nuevas plataformas = nuevas entradas de data, cero páginas nuevas (Q8 de U3).

### 2.2 Wireframe visual (Desktop)

```
┌─ Sidebar global (TopNav) ─────────────────────────────────────────────┐
│ 🛒 Hardware Catalog → [icon] BBB                                       │
└───────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ Cadena: Dashboard → Proyectos → Hardware → Conocimiento → Labs         │
│                    [Hardware = actual]                                 │
├────────────────────────────────────────────────────────────────────────┤
│ [💠]  BEAGLEBONE BLACK REVC        [reference] [operativo]             │
│       Edge Gateway · por BeagleBoard.org     [→ Catálogo completo]     │
│ ─────────────────────────────────────────────────────────────────────  │
│ Descripción: SBC de 1 GHz ARM Cortex-A8… base del clúster SIGC&T.     │
│                                                                        │
│ Protocolos: MQTT · HTTPS · GPIO · SPI · I2C                            │
│ ── En el ecosistema SIGCTiArural ────────────────────────────────────  │
│  [💠 BBB-01 Gateway] · [💠 BBB-02 IA Edge] · [💠 BBB-03 IoT]          │
│     (nodos del Dashboard, solo si id === 'BBB')                        │
│ ── Ficha técnica ────────────────────────────────────────────────────  │
│  Chipset    AM3358 (Cortex-A8 1 GHz)                                   │
│  RAM        512 MB DDR3                                                │
│  GPIO/IOs   65 pines                                                   │
│  Energía    5 V, 210–460 mA                                            │
│  OS         Debian 12 (BeagleBone)                                     │
│ ── Documentación ────────────────────────────────────────────────────  │
│  [Oficial BeagleBoard] [Datasheet AM335x] [ELinux Wiki] [KH: edge_setup]│
│ ── Laboratorios ─────────────────────────────────────────────────────  │
│  [⛁ Laboratorio de Hardware /lab-embedded]  (+Electrónica si aplica)   │
│ ── Software ─────────────────────────────────────────────────────────  │
│  [OS Debian] [framework TFLite Micro] [tooling PlatformIO]             │
│ ── Proyectos que lo integran ────────────────────────────────────────  │
│  [🌾 SIGCTiArural 🟢] [🩺 UBTN 🔷]                                     │
│                                                                        │
│ [Estado honesto]  ...vocabulario operativo/referencia/diseño…          │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Comportamiento responsive
- Columnas se apilan en móvil; ficha técnica pasa de tabla a filas `label: value`.
- Cadena se compacta a iconos.

### 2.4 Consistencia visual
- Mismos `NEON_COLORS`, `bg-gray-900`, bordes neon, título H1 con `textShadow` (patrón de Dashboard/Catálogo/Proyectos).
- Icono de la plataforma como avatar del header.
- Estilo idéntico al sistema para que se sienta "una página más", no una nueva sección.

---

## 3. Pregunta 2 — ¿Qué información mínima debe tener?

**Núcleo obligatorio (sin esto, la página no debería abrirse):**

| # | Campo | Fuente | Obligatorio |
|---|---|---|---|
| 1 | `id` | catalog | ✅ (key de ruta) |
| 2 | `name` | catalog | ✅ |
| 3 | `role` | catalog | ✅ |
| 4 | `status` (+ `fase`) | catalog | ✅ (honestidad) |
| 5 | `icon` | catalog | ✅ (identidad) |
| 6 | `description` | catalog | ✅ |
| 7 | `vendor` (+ `vendorId`) | catalog/vendors U3 | ✅ |
| 8 | `protocols` | catalog | ✅ |
| 9 | `link` oficial (oficial/compra/datasheet ≥1) | documentación U3 / `officialUrl` legado | ✅ |
| 10 | ≥1 laboratorio relacionado | `labs[]` | ✅ (conexión ecosistema) |
| 11 | ≥1 doc interno KH | `knowledge[]` | ✅ (conexión ecosistema) |
| 12 | `banner` | catalog | ✅ (estado honesto visible) |

**Aceptable con marcador "vacío"** (renderiza `—` / oculta sección): `specs`, `software[]`, `projects[]`, `data`, `links` extra.

**Fila especial "BBB":** si `id === 'BBB'`, se añade la subsección "En el ecosistema" con los 3 nodos del Dashboard (derivada de `nodes`/`initialNodes`). Es un enriquecimiento solo-BBB, porque catalog BBB es "referencia" mientras los nodos son dinámicos.

---

## 4. Pregunta 3 — ¿Qué datos ya existen en `catalog-data.js`?

**Todas las 10 entradas ya tienen (100% usable hoy):**

| Campo | Ejemplo | Usado en la página |
|---|---|---|
| `id`, `name`, `role`, `icon`, `banner` | `/BBB`, `BeagleBone Black RevC`… | header + chips |
| `status` | `reference` / `construction` | badge estado |
| `fase` | `operativo` / `diseño` | badge fase |
| `vendor` | `'BeagleBoard.org'`, `'Espressif'`… | línea fabricante |
| `description` | texto multi-línea | cuerpo principal |
| `officialUrl` | URL fabricante | botón "sitio oficial" |
| `protocols` | `['MQTT','HTTPS','GPIO','SPI','I2C']` | línea protocolos |
| `labs[]` | `[{label,to}]` | sección laboratorios |
| `knowledge[]` | `[{label,to}]` (U1.4) | sección documentación KH |
| `links[]` | `[{label,href}]` | sección enlaces externos |
| `data{}` | `{'Estado':'Operativo (referencia)'}` | bloque resumen operativo |

**Por cubrir (capa U3, futura):** `specs{}`, `software[]`, `projects[]`, `vendorId`/`hardwareVendors`, `documentation[]` jerarquizada. **El 80% de la página se puede construir hoy con datos existentes.**

### Mapa de datos → secciones de la página

| Sección | Fuente de datos |
|---|---|
| Header (icono, nombre, role, badges) | `id/name/role/icon/status/fase` |
| Fabricante | `vendor` (+ `hardwareVendors` U3) |
| Descripción | `description` |
| Protocolos | `protocols` |
| Sitio oficial | `officialUrl` |
| Laboratorios | `labs[]` |
| Conocimiento | `knowledge[]` |
| Enlaces externos | `links[]` |
| Resumen operativo | `data{}` |
| (futuro) Especificaciones | `specs{}` (U3) |
| (futuro) Software | `software[]` (U3) |
| (futuro) Proyectos | `projects[].projectId` → `ecosystemProjects` (U3) |

---

## 5. Pregunta 4 — ¿Qué información debe venir del fabricante (externa)?

**Datos que la app NO debe inventar — deben referenciar al fabricante:**

| Información | Fuente | Tipo de enlace |
|---|---|---|
| Datasheet / hoja de datos PDF | sitio oficial del fabricante (ej. TI datasheet AM335x) | `documentation[].type='datasheet'` + `href` externo |
| Especificaciones oficiales | página de producto del fabricante | `officialUrl` |
| Guías de inicio ("getting started") | docs oficiales | `documentation[].type='official'` |
| Repo de código del fabricante / SDK | GitHub/portal del chip | `software[]` + `links[]` |
| Comunidad / foros | ELinux, forums | `links[]` |
| Notas de aplicación técnica (app notes) | TI/ST/Espressif | `documentation[].type='appnote'` |

**Regla de honestidad (crítica):** la app nunca afirma capacidades que no verifica por sí misma. Todo lo técnico profundo (frecuencias, pines, consumos, firmware) → **enlace al fabricante** + resumen corto local derivado de `specs`/`description` (fuente humana del proyecto). Si el dato local no existe → se omite la sección (no inventar).

### Evolución futura
- `officialSpecUrl` (datasheet directo) por plataforma.
- En `links[]` ya hay referencias reales (BeagleBoard.org, TI, Espressif, ST, Arduino, RPi, NVIDIA…) → reutilizables como "documentación del fabricante" desde el día 1.

---

## 6. Pregunta 5 — ¿Cómo conectar Hardware → Knowledge → Labs → Projects?

### 6.1 Mapa de conexiones (usando datos existentes, sin backend)

```
HARDWARE (catalog-data.js)
   │
   ├─ knowledge[] ──────────► KNOWLEDGE HUB  (/knowledge/doc/:docId)
   │      (edge_setup, api_reference, masterdoc…)
   │
   ├─ labs[] ───────────────► LABS (/lab-embedded, /lab-electronics…)
   │      (rutas existentes, U1.4/U2.2)
   │
   ├─ (U3) projects[].projectId ─► PROJECTS (/proyectos + ecosystemProjects)
   │
   ├─ officialUrl / links[] ─► FABRICANTE (externo)
   │
   └─ nodes (solo BBB) ─────► DASHBOARD (/dashboard — monitoreo en vivo)
```

### 6.2 Comportamiento de navegación
- **Cadena superior** `CHAIN_LINKS` (mismo patrón de Catálogo/Proyectos): `Dashboard → Proyectos → Hardware → Conocimiento → Labs`, con `[Hardware: nominativo]` como nodo actual y el item `Conocimiento` enlazando a `/knowledge`.
- **Botones accionables:**
  - Labs → `link.to` (rutas reales existentes).
  - Conocimiento → `link.to` (`/knowledge/doc/...` reales).
  - Proyectos → `/proyectos` (o futuro `/proyectos/:id`).
  - Dashboard (solo BBB) → `/dashboard` sección BBB (ancla o scroll).
- **Cross-links inversos** (opción futuro, no bloqueante): en `ProjectsPage.jsx` y en el KH, chips hacia `/hardware/:id`. Hoy basta con la cadena.

### 6.3 Regla de la cadena (herencia U1.8/UX-03)
La cadena **se hereda** del patrón ya validado (CHAIN_LINKS en `HardwareCatalogPage.jsx` y `ProjectsPage.jsx`) → cero riesgo de romper el modelo de navegación existente.

---

## 7. Pregunta 6 — ¿Cómo mantener compatibilidad total?

1. **Data intocada en lo legado:** `catalog-data.js` no se modifica en esta misión (diseño). Cuando U3 v2 se implemente, los campos son **aditivos** (`?,` defensivos). `ClusterCard`, Mapa U2.4, Catálogo y Proyectos siguen funcionando sin cambio.
2. **Ruta nueva sin conflicto:** `/hardware/:id` es nueva; no pisa `/hardware-catalog` (ruta existente). Ambas conviven. `/hardware-catalog` sigue siendo el listado; `/hardware/:id` el detalle.
3. **Componente nuevo independiente:** se crea `HardwareDetailPage.jsx` (nuevo archivo). No toca ningún componente existente.
4. **Render defensivo:** toda sección opcional se guarda con `?.` y `array?.length > 0`; una plataforma "pobre" (solo núcleo) se ve correcta y completa-ish, sin crash.
5. **Fallback de ruta:** `id` inexistente → `Navigate` hacia `/hardware-catalog` (sin página 404 rota ni estado falso).
6. **App.jsx:** +1 import +1 `<Route path="/hardware/:id">`. Nada más de los imports actuales se toca.
7. **Voz/asistente:** añadible key `hardware` → `/hardware-catalog` (opcional); no se toca `routeMap` existente salvo adición.
8. **Estados honestos:** la página nunca pinta `operativo` donde `status === 'construction'` (fase diseño). Respeta el vocabulario TRUE.
9. **BBB especial sin acoplar:** la subsección "En el ecosistema / nodos" se resuelve con `nodes` prop pasado a la página (o import data) y solo se muestra con `id === 'BBB'`; aislada en un fragmento condicional, sin tocar `ClusterCard`.

### Checklist de compatibilidad (post-implementación futura)
| Recurso | Estado esperado |
|---|---|
| `/hardware-catalog` (listado) | ✅ intacto |
| Mapa de Dispositivos (Dashboard U2.4) | ✅ intacto (usa catalog `?`) |
| `/projects`, `/labs/*`, `/knowledge/doc/:docId` | ✅ intactos |
| TopNav / Sidebar | ✅ intactos |
| ClusterCard | ✅ no se modifica |
| Backend / Docker / Telemetría / BBB | ✅ no se tocan |

---

## 8. Archivos afectados (REALIZACIÓN futura)

| Archivo | Tipo |
|---|---|
| `src/frontend/src/pages/HardwareDetailPage.jsx` | **NUEVO** (única página parametrizada) |
| `src/frontend/src/App.jsx` | +1 import +1 ruta `/hardware/:id` (aditivo) |
| `src/frontend/src/pages/HardwareCatalogPage.jsx` | opcional: cada tarjeta se vuelve `<Link to={'/hardware/'+id}>` (aditivo; NO obligatorio para esta misión) |
| `src/frontend/src/data/catalog-data.js` | 0 cambios hoy (datos U3 en v2 futura) |

---

## 9. Riesgos y rollback

### Riesgos
| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | Ruta `/hardware/:id` colisiona con lógica de App si hay fallback | Baja | Medio | Patrón probado `/knowledge/doc/:docId`; fallback → Navigate a catalog |
| 2 | `id` con caracteres (ESP32-WROOM-32) en URL | Baja | Bajo | IDs son strings URL-safe (`encodeURIComponent`) |
| 3 | Plataforma sin datos (CUSTOM-HW) se ve pobre | Media | Bajo | Secciones condicionales; núcleo obligatorio siempre presente |
| 4 | Duplicación de "conocimiento" con KH | Media | Bajo | `knowledge[]` apunta a rutas reales del KH; página es agregadora, no duplica contenido |
| 5 | Acople de la subsección BBB | Baja | Bajo | Fragmento condicional `id==='BBB'`, sin tocar ClusterCard |

### Rollback
```bash
git restore src/frontend/src/App.jsx          # quita ruta nueva (si se aplicó)
rm src/frontend/src/pages/HardwareDetailPage.jsx   # elimina página nueva (si se aplicó)
```
(o `git restore` si ya existía antes). Sin impacto en resto del sistema.

---

## 10. Resumen decisivo

| Pregunta | Respuesta |
|---|---|
| 1. Página individual | Única página parametrizada `/hardware/:id` con header (icono/nombre/role/badges), descripción, protocolos, fabricante, ficha técnica, documentación, labs, software, proyectos + cadena de navegación |
| 2. Info mínima | 12 campos núcleo (id, name, role, status, fase, icon, desc, vendor, protocols, link oficial, ≥1 lab, ≥1 doc KH) |
| 3. Datos ya existentes | 22 campos de `catalog-data.js` cubren el 80 % (todo menos specs/software/projects/vendors U3) |
| 4. Info del fabricante | Datasheet, specs oficiales, getting started, repo/SDK, comunidad — SIEMPRE vía enlace externo; nunca inventada |
| 5. Conexión cadena | knowledge[]→KH · labs[]→Labs · projects→Projects · officialUrl→fabricante · nodes(BBB)→Dashboard |
| 6. Compatibilidad | Ruta nueva que no pisa la existente; data aditiva; render `?.` defensivo; fallback Navigate; estados honestos; BBB aislado |

**Estado: DISEÑO APROBADO PARA REVISIÓN — NO IMPLEMENTADO.**