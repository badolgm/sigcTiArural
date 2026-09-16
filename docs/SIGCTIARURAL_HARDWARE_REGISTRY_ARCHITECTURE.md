# SIGCTiArural — Universal Hardware Registry (Arquitectura)

> **Estado:** U3. Solo diseño. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** `catalog-data.js` + `HardwareCatalogPage.jsx` → evolución a **Universal Hardware Registry (UHR)**.
> **Regla:** aditivo y retrocompatible. Todo registro existente sigue funcionando sin cambio.

---

## 1. Contexto: el esquema actual

### 1.1 Estructura vigente de cada entrada (`catalog-data.js`)

| Campo | Tipo | Ejemplo (BBB) |
|---|---|---|
| `id` | string | `'BBB'` |
| `name` | string | `'BeagleBone Black RevC'` |
| `role` | string | `'Edge Gateway'` |
| `status` | string | `'reference'` / `'construction'` |
| `icon` | string | `'💠'` |
| `banner` | string | `'Copia de referencia…'` |
| `fase` | string | `'operativo'` / `'diseño'` |
| `vendor` | string | `'BeagleBoard.org'` |
| `description` | string | texto libre |
| `officialUrl` | string | URL oficial |
| `protocols` | string[] | `['MQTT','HTTPS','GPIO','SPI','I2C']` |
| `labs` | array{label,to} | labs relacionados |
| `knowledge` | array{label,to} | docs KH (agregado en U1.4) |
| `links` | array{label,href} | enlaces externos |
| `data` | object | pares clave-valor libres |

### 1.2 Render actual (`HardwareCatalogPage.jsx`)

- Grid 1/2/3 columnas → cada entrada en un `<ClusterCard>` + tarjeta de detalle (descripción, fabricante, protocolos, sitio oficial, labs, `knowledge?.map`).
- Bloque relacional "Proyectos que conectan con este hardware" — **hardcodeado** (3 links fijos) en L49-66.
- Cadena de navegación `CHAIN_LINKS` (Dashboard → Proyectos → Hardware → Conocimiento → Labs).

---

## 2. Principio de diseño

> **El UHR es una base de datos declarativa versionable, no un componente.**

`catalog-data.js` se convierte en la **única fuente de verdad** del registro universal. Toda relación (fabricante, docs, labs, software, proyectos) vive **en el registro**, no en el JSX. Nuevas plataformas = nueva entrada de objeto. Cero código nuevo para un hardware nuevo.

Los 5 campos existentes que NO cambian: `id`, `name`, `icon`, `status`, `banner` (retrocompatibilidad total con `ClusterCard`).

---

## 3. Respuestas por pregunta

### Q1 — ¿Cómo soportar hardware infinito?

**Estrategia: documento de configuración categorizado, con escalado por convención.**

1. **Formato único**: cada hardware es una entrada en `hardwareCatalogEntries[]`. No hay límite técnico (array JS).
2. **Escalado por taxonomía**: se añade `category` (grupo semántico) para agrupar UI y filtros:
   ```js
   category: 'SBC' | 'MCU' | 'GPU/Aceleradora' | 'Sensor' | 'Actuador' | 'Gateway/IoT' | 'PCB propio'
   ```
3. **Indexación por `platformType`** para futuros filtros/búsqueda:
   ```js
   platformType: 'sbc' | 'mcu' | 'edge-ai' | 'base-station' | ...
   ```
4. **Versionado del dataset**: constante `REGISTRY_SCHEMA = 2` + cada entrada puede tener `since` (version si aparece por primera vez). Permite evolución sin romper consumidores.
5. **Agrupación automática en UI**: el grid puede agruparse/colapsarse por `category` si el array supera ~12 entradas (mostrar contadores y toggle por categoría).

**Contrato de escalado (Q8)** también aplica aquí: agregar entradas es solo data.

### Q2 — ¿Cómo soportar fabricantes?

**Estrategia: los fabricantes como entidades independientes (normalización 1-N).**

Se extrae `vendor` de string → objeto de referencia. Dos opciones compatibles:

**Opción A (recomendada, mínima):** colección `hardwareVendors[]` junto a las entradas:
```js
export const hardwareVendors = [
  { id: 'beagleboard', name: 'BeagleBoard.org', logo: '📟', country: 'EE.UU.', url: 'https://beagleboard.org/' },
  { id: 'espressif',    name: 'Espressif Systems', slogan: 'IoT silicon', url: 'https://www.espressif.com/' },
  { id: 'stmicro',      name: 'STMicroelectronics', url: 'https://www.st.com/' },
  { id: 'arduino',      name: 'Arduino', url: 'https://www.arduino.cc/' },
  { id: 'rpi',          name: 'Raspberry Pi Foundation', url: 'https://www.raspberrypi.com/' },
  { id: 'nvidia',       name: 'NVIDIA', url: 'https://www.nvidia.com/' },
  { id: 'sigct',        name: 'Proyecto SIGC&T / SENA', url: 'https://github.com/badolgm/sigcTiArural' },
];
```
Y en cada entrada:
```js
vendorId: 'beagleboard',        // nuevo (referencia FK)
vendor: 'BeagleBoard.org',      // se conserva como denormalización para ClusterCard/render actual
```
La UI muestra un **badge de fabricante clickable** que lleva a una vista de "fichas del fabricante" o al `url`. El nombre legado `vendor` se mantiene para no romper nada.

**Opción B (futura):** página `/hardware/vendors` con filtro de catálogo por fabricante. NO hoy.

### Q3 — ¿Cómo soportar fichas técnicas?

**Estrategia: hoja de datos estructurada dentro del registro.**

Se añade `specs` (mapa clave→valor normalizado, en lugar del `data` libre):
```js
specs: {
  'Chipset': 'AM3358 (Cortex-A8 @ 1 GHz)',
  'RAM': '512 MB DDR3',
  'Puertos': 'Ethernet 10/100 · USB Host · HDMI · microSD',
  'GPIO': '65 pines',
  'Energía': '5 V, 210–460 mA',
  'OS': 'Debian 12 (BeagleBone)',
},
```
Reglas:
- `data` (actual) se **conserva** y se renderiza como bloque "Resumen operativo" (para ClusterCard).
- `specs` (nuevo) se renderiza en el detalle como **tabla técnica** (label: valor).
- Formato para chipsets/RAM: preferir `string` compacto; unidades dentro del string (sin parser).
- En el futuro, `officialSpecUrl` (datasheet en PDF del fabricante) puede agregarse como campo opcional.

### Q4 — ¿Cómo soportar documentación oficial?

**Estrategia: consolidar 4 fuentes de doc en un solo bloque `documentation`.**

```js
documentation: [
  { type: 'official', label: 'BeagleBoard.org', href: 'https://beagleboard.org/black' },
  { type: 'datasheet', label: 'AM335x TRM', href: 'https://www.ti.com/lit/pdf/spruh73' },
  { type: 'wiki', label: 'ELinux BeagleBone', href: 'https://elinux.org/BeagleBone_Black' },
  { type: 'internal', label: 'API Telemetría v3', to: '/knowledge/doc/api_reference' },
],
```
Reglas:
- Se **reemplaza** el uso estructural de `officialUrl` + `links` externos internos → deben coexistir: `links` solo apunta a webs del fabricante/directas; `documentation` da jerarquía (`official`, `datasheet`, `wiki`, `internal`, `example`, `tutorial`).
- Docs **internos** (Knowledge Hub) siempre con `to:` (van a `/knowledge/...`); docs **externos** con `href:` + `target=_blank`.
- Render: pestañas/segmentos desplegables o chips agrupados por `type`.

### Q5 — ¿Cómo soportar labs relacionados?

**Estrategia: jerarquizar los labs existentes y permitir múltiples.**

Ya existe `labs[]`. Se extiende con **tipo de relación** para priorizar UI:
```js
labs: [
  { label: 'Laboratorio de Hardware', to: '/lab-embedded', role: 'primary' },   // rol: hub principal
  { label: 'Electrónica', to: '/lab-electronics', role: 'secondary' },
],
```
Reglas:
- `role: 'primary'` → se muestra destacado (botón "⛁ Abrir lab principal").
- `role: 'secondary'` → se agrupa en "Otros labs".
- Los valores previos sin `role` se tratan como `secondary` (retrocompatible).
- Los labs **no se crean ni se duplican**: se referencian por ruta ya existente (regla U2.2).

### Q6 — ¿Cómo soportar software relacionado?

**Estrategia: bloque `software[]` de herramientas/SDK/IDE compilables.**

```js
software: [
  { name: 'TensorFlow Lite Micro', type: 'framework', href: 'https://www.tensorflow.org/lite/microcontrollers' },
  { name: 'PlatformIO', type: 'tooling', href: 'https://platformio.org/' },
  { name: 'Debian 12', type: 'os', href: 'https://www.debian.org/' },
],
```
Reglas:
- `type` ∈ `'os' | 'framework' | 'tooling' | 'ide' | 'sdk' | 'runtime'`.
- La UI agrupa por `type` con icono (💿 OS · 🧩 framework · 🛠️ tooling · 🧑‍💻 IDE).
- Debe coexistir con lo que hoy son `links` de software (los existentes como EDGE_SETUP, PlatformIO se migran por data a `software`).
- En el futuro podría haber `softwareOfficial` a nivel de ecosistema (apps del proyecto). NO hoy.

### Q7 — ¿Cómo soportar proyectos relacionados?

**Estrategia: relación bidireccional explícita con `projects-data.js` (elimina el hardcode).**

En el registro:
```js
projects: [
  { projectId: 'SIGCTIARURAL', role: 'matriz' },
  { projectId: 'UBTN', role: 'uso' },
  { projectId: 'AGRICULTURA-INTELIGENTE', role: 'uso' },
],
```
- `projectId` debe existir en `ecosystemProjects` (FK validable). 
- La página deriva los chips desde `ecosystemProjects.find(p => p.id === projectId)` → con su `icon`, `name`, `status` real.
- **Reemplaza el bloque hardcodeado actual** ("Proyectos que conectan con este hardware" L49-66) que hoy es estático (P2/P6/P7 de la auditoría `SIGCTIARURAL_U2_ROADMAP_DECISION.md`).
- Render: chips por proyecto con badge de estado derivado; click → `/proyectos`.

### Q8 — ¿Cómo permitir nuevas plataformas por simple configuración?

**Estrategia: "Agrégala como dato y el sistema la renderiza".**

1. Crear una entrada en `hardwareCatalogEntries` (los 7 campos obligatorios: `id,name,role,status,icon,fase,banner` + opcionales), **sin modificar código de UI/JSX**.
2. La página **deriva todo por convención** — no hay `switch/case` ni arrays de render por plataforma.
3. Guardarraís obligatorios del registro:
   - `id` único y estable (stable key).
   - `status` ∈ vocabulario honesto (`reference`/`construction`/`operativo`).
   - `fase` ∈ `operativo`/`diseño` (vocabulario de la app).
   - Validar referencias: `vendorId`, `labs[].to`, `knowledge[].to`, `projects[].projectId` deben existir en sus colecciones/rutas.
   - Derechos: ninguna misión borra plataformas sin aprobación; las plataformas en "diseño" se marcan honestamente (`construction`), nunca como operativas falsas.
4. **Onboarding en 3 pasos** (documentado en el propio archivo como plantilla/plantilla de registro comentada):
   - copiar un bloque de plantilla (`TEMPLATE_ENTRY` comentado),
   - llenar campos + enlaces,
   - ejecutar validación de referencias (script de revisión opcional, lee el array y reporta IDs rotos).

---

## 4. Estructura de archivo propuesta (`catalog-data.js` v2)

```js
export const REGISTRY_SCHEMA = 2;

export const hardwareVendors = [ /* Q2 */ ];

export const hardwareCatalogEntries = [
  {
    id: 'BBB',
    name: 'BeagleBone Black RevC',
    role: 'Edge Gateway',
    // ── legado (intacto) ──
    status: 'reference',
    icon: '💠',
    banner: 'Copia de referencia — BBB-01/02/03 viven en el Dashboard',
    fase: 'operativo',
    vendor: 'BeagleBoard.org',
    description: '...',
    officialUrl: 'https://beagleboard.org/black',
    protocols: ['MQTT','HTTPS','GPIO','SPI','I2C'],
    labs: [ ... ],                 // Q5 (role opcional)
    knowledge: [ ... ],            // KH (ya existente)
    links: [ ... ],                // webs externas
    data: { 'Estado': '...' },     // resumen operativo (legado)
    // ── U3: capa universal (opcional) ──
    vendorId: 'beagleboard',       // Q2 (FK a hardwareVendors)
    category: 'SBC',               // Q1
    platformType: 'sbc',           // Q1
    specs: { ... },                // Q3 tabla técnica
    documentation: [ ... ],        // Q4 official/datasheet/wiki/internal
    software: [ ... ],             // Q6
    projects: [ ... ],             // Q7 FK a ecosystemProjects
  },
  // ... resto de 9 entradas, migradas incrementalmente
];
```

**Retrocompatibilidad:** ningún campo antiguo se elimina; la UI los sigue leyendo. Los campos U3 son aditivos (`?.` defensivo en render).

---

## 5. Diseño de UI (HardwareCatalogPage.jsx v2 — aditivo)

### 5.1 Header del registro
- Título "🛒 Universal Hardware Registry" + `REGISTRY_SCHEMA` badge + contador `N plataformas · M fabricantes`.
- Barra de **filtro por categoría** (chips: Todas · SBC · MCU · …) generada desde los `category` existentes.
- Barra de **búsqueda** simple (filtra por name/id/role) — sin backend.

### 5.2 Tarjeta de plataforma (detalle ampliado)
```
┌────────────────────────────────────────────────┐
│ [icon] NAME        [reference/diseño]          │
│ [vendor badge]     role · fase                  │
│ ─────────────────────────────────────────────── │
│ Descripción…                                    │
│ Protocolos: MQTT · HTTPS · GPIO · SPI · I2C     │
│ ── 📋 Ficha técnica (specs) ──                  │
│   Chipset: AM3358    RAM: 512MB    GPIOS: 65    │
│ ── 📚 Documentación ──                          │
│   [Oficial] [Datasheet] [Wiki] [KH internos]    │
│ ── 🧬 Laboratorios ──                           │
│   [⛁ Lab principal /lab-embedded] +others       │
│ ── 🧩 Software ──                                │
│   [OS 💿] [framework 🧩] [tooling 🛠️]            │
│ ── 📋 Proyectos que lo usan ──                  │
│   [🌾 SIGCTiArural 🟢] [🩺 UBTN 🔷] …           │
│        (derivado de ecosystemProjects, live)    │
└────────────────────────────────────────────────┘
```

### 5.3 Secciones condicionales
Solo se renderizan si el campo existe (`especs?.length`, `documentation?.length`, …). Un plataforma mínima (solo legado) se ve igual que hoy.

---

## 6. Archivos afectados (REALIZACIÓN futura — no ahora)

| Archivo | Cambio |
|---|---|
| `src/frontend/src/data/catalog-data.js` | v2: `REGISTRY_SCHEMA`, `hardwareVendors`, campos opcionales (`category`, `platformType`, `vendorId`, `specs`, `documentation`, `software`, `projects`) |
| `src/frontend/src/pages/HardwareCatalogPage.jsx` | Aditivo: filtros categoría/búsqueda, render de nuevas secciones `?.`, bloque proyectos derivado de `ecosystemProjects` (reemplaza hardcode) |
| `src/frontend/src/pages/Dashboard.jsx` | 0 cambios (el Mapa U2.4 ya consume `hardwareCatalogEntries`; seguirá funcionando) |
| `src/frontend/src/pages/ProjectsPage.jsx` | 0 cambios (puede opcionalmente leer `projects` DNI en el futuro) |

Nuevos componentes opcionales:
- `RegistryFilters.jsx` (chips categoria + buscador)
- `SpecTable.jsx` (tabla de ficha técnica)

---

## 7. Riesgos

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | Romper `ClusterCard`/Mapa al cambiar `catalog-data.js` | Media | Alto | Campos U3 solo **aditivos**; `?.` en render; `vendor`, `data`, `links` intactos. Mapa U2.4 no usa campos nuevos. |
| 2 | IDs rotos en `projects[].projectId` | Media | Bajo | Validación de referencias (script opcional); fallback: no se renderiza chip si el id no existe. |
| 3 | Sobre-render en grid (hardware infinito) | Baja | Bajo | Agrupación por categoría + colapso + filtros; paginación futura con `slice`. |
| 4 | Migración de 9 entradas requiere disciplina | Media | Bajo | Migración incremental por entrada; template comentado; ninguna entrada pierde campos legados. |
| 5 | Duplicación conceptual entre `links` y `documentation`/`software` | Media | Bajo | Guía: `links` = webs de plataforma; `documentation` = docs jerarquizados; `software` = herramientas. Separación documentada en el archivo. |
| 6 | Conflicto con "hardware infinito" y el **Mapa de Dispositivos** (U2.4) | Baja | Bajo | El Mapa muestra los `17` registros actuales; al crecer, el Mapa podría mostrar solo `status !== diseño` o categorías top — decisión futura, no ahora. |

**Riesgo neto: BAJO** (arquitectura 100% aditiva y retrocompatible).

---

## 8. Rollback

- Si solo se añadieron campos nuevos: `git restore src/frontend/src/data/catalog-data.js src/frontend/src/pages/HardwareCatalogPage.jsx`.
- Si se implementó la UI de filtros: `git restore` de ambos archivos (misma operación).
- Sin tocar: Dashboard, Mapa, BBB, Telemetría, Labs, KH, IA, Backend, Docker.

---

## 9. Resumen decisivo

| Pregunta | Respuesta |
|---|---|
| 1. Hardware infinito | Array config de entradas categorizadas (`category`, `platformType`), UI derivada por convención, filtros/agrupación |
| 2. Fabricantes | Colección `hardwareVendors` + `vendorId` FK, denormalización `vendor` conservada |
| 3. Fichas técnicas | Campo `specs{}` (tabla label:valor) junto al `data` legado |
| 4. Documentación oficial | Campo `documentation[]` con tipos (official/datasheet/wiki/internal) |
| 5. Labs relacionados | `labs[]` existente + `role` primary/secondary; rutas ya existentes |
| 6. Software relacionado | Campo `software[]` tipado (os/framework/tooling/ide) |
| 7. Proyectos relacionados | `projects[].projectId` FK a `ecosystemProjects` — elimina el hardcode actual |
| 8. Incorporación por configuración | Plantilla de entrada + 7 campos obligatorios + validación de referencias; cero código por plataforma |

**Veredicto de madurez:** el esquema actual cubre el 70 % de este diseño (id/name/role/status/icon/vendor/desc/protocols/labs/knowledge/links/data). Faltan solo los campos semánticos U3. Migración trivial y segura.