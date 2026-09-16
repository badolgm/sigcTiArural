# SIGCTiArural — Learning Layer Architecture (Capa educativa de fichas de hardware)

> **Estado:** U3.3 (diseño). Solo arquitectura. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Archivo base analizado:** `src/frontend/src/pages/HardwareDetailPage.jsx` (216 líneas)
> **Regla:** aditivo, retrocompatible, honesto. NADA DESAPARECE. TODO SE CONECTA.

---

## 1. Contexto: qué hace hoy la ficha de hardware

`HardwareDetailPage.jsx` renderiza, por `/hardware/:id`:

| Sección | Fuente | Estado |
|---|---|---|
| Cadena `CHAIN_LINKS` (Dash→Proyectos→Hardware→Conocimiento→Labs) | estático | ✅ |
| Header plataforma (icono, nombre, role, fabricante, badges status/fase) | `catalog-data.js` | ✅ |
| Descripción + protocolos | catálogo | ✅ |
| ClusterCard (resumen) | catálogo + ClusterCard | ✅ |
| 📚 Knowledge Hub | `entry.knowledge[]` | ✅ |
| ⛁ Laboratorios | `entry.labs[]` | ✅ |
| 🌐 Documentación oficial | `entry.officialUrl` + `entry.links[]` | ✅ |
| 💠 Ecosistema (solo BBB) | hardcode condicional | ✅ |
| 📋 Proyectos que lo integran | hardcode ("SIGCTiArural") | ⚠️ limitado |
| Estado honesto | estático | ✅ |

**Gap detectado:** la ficha conecta hacia el **conocimiento interno y los labs**, pero **no tiene capa educativa explícita** (cursos, videos, investigaciones, datasets, repositorios) ni enlaza hacia **Proyectos dinámicos** ni hacia **Recursos**. Y el roadmap (RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV) **no tiene fichas**.

---

## 2. Pregunta 1 — ¿Cómo conectar Hardware → Conocimiento → Labs → Proyectos → Recursos?

### 2.1 Modelo de flujo (una sola dirección de profundidad, siempre navegable)

```
HARDWARE (/hardware/:id)
   │
   ├─► CONOCIMIENTO   knowledge[] → /knowledge/doc/:docId     (ya existe)
   ├─► LABS           labs[]      → /lab-embedded, /lab-*      (ya existe)
   ├─► PROYECTOS      projects[]  → /proyectos (+ futuro /proyectos/:id)
   └─► RECURSOS       resources[] → externo (cursos/videos/datasets/repos)
```

### 2.2 La ficha se convierte en un ENLACE DE CONVERGENCIA (hub, no fin de línea)

- La cadena `CHAIN_LINKS` ya horizontaliza Dashboard/Proyectos/Hardware/Conocimiento/Labs.
- Dentro de la ficha, las secciones pasan a estar **indexadas por rol educativo**:
  1. **Aprende** (Conocimiento + Recursos) — el usuario estudia
  2. **Pon en práctica** (Labs + Proyectos) — el usuario aplica
  3. **Verifica** (Documentación oficial + ClusterCard) — el usuario contrasta

### 2.3 Contrato de conexión (data-driven, sin backend)

```js
// En catalog-data.js, por entrada:
knowledge: [...],   // inmutable (ya existe)
labs: [...],        // inmutable (ya existe)
projects: [...],    // NUEVO: FK a ecosystemProjects
resources: [...],   // NUEVO: capa educativa (Q2)
```

- `projects[]` y `resources[]` son **opcionales** (`?.length > 0` → render).
- Si no hay dato → sección oculta o micro-mensaje "Pendiente de integración" (regla honestidad).
- Todo target (`to`, `href`) debe existir o ser rutas reales de la app.

---

## 3. Pregunta 2 — ¿Cómo soportar Cursos, Videos, Investigaciones, Datasets, Repositorios?

### 3.1 Estructura única `resources` con tipado por tipo

```js
resources: [
  { type: 'course',      label: 'Curso: Introducción a ESP32',        href: 'https://...', source: 'Educativos Hispano', free: true },
  { type: 'video',       label: 'Taller práctico BeagleBone',          href: 'https://...', source: 'YouTube / Canal SIGC&T' },
  { type: 'research',    label: 'Artículo: IA en el borde',            href: 'https://...', author: 'Equipo SIGC&T' },
  { type: 'dataset',     label: 'Dataset térmico UBTN',                href: 'https://...', format: 'CSV · JSON' },
  { type: 'repo',        label: 'GitHub: sigcTiArural',                href: 'https://github.com/badolgm/sigcTiArural' },
]
```

### 3.2 Vocabulario de tipos (código de tipado)

| type | Icono | Sub-campos opcionales |
|---|---|---|
| `course` | 🎓 | `level`, `free`, `platform` |
| `video` | 🎬 | `duration`, `channel` |
| `research` | 📄 | `author`, `year` |
| `dataset` | 📊 | `format`, `size` |
| `repo` | 📦 | `lang`, `stars` (opcional) |

### 3.3 Render en la ficha (sección "🎓 Aprende")

```
┌─ 🎓 Aprende ───────────────────────────────┐
│  [Curso] [Video] [Investigación] [DataSet] │  ← tabs por type (si hay >4)
│  ────────────────────────────────────────── │
│  🎓 Curso: Introducción a ESP32 · GRATIS    │  ← group mode: lista
│  🎬 Video: Taller práctico BeagleBone       │
│  📄 Investigación: IA en el borde (2026)    │
│  📊 Dataset: térmico UBTN (CSV · JSON)      │
│  📦 Repositorio: sigcTiArural ↗             │
└────────────────────────────────────────────┘
```

- **Modo colapsado:** si >6 recursos → tabs por tipo.
- **Modo marco:** en plataformas "construction" los recursos se marcan con `since/reference` (recursos de estudio válidos aunque la plataforma no esté integrada).
- **Externos siempre:** `href` + `target="_blank"` + `↗` (igual que officialUrl).

### 3.4 Fuente de datos
- Recursos por plataforma en `catalog-data.js` (por entrada).
- (Futuro, NO hoy) `resources-data.js` central solo si un recurso reutiliza en >3 plataformas.

---

## 4. Pregunta 3 — ¿Cómo soportar Roadmap Detail Pages (RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV)?

### 4.1 Problema actual
`futureNodes` (Dashboard.jsx:90-130) define 5 plataformas roadmap: `RPI-05`, `FPGA-X`, `ARDUINO-UNO-Q`, `ALEXA-IOT`, `DRONE-NAV`. Sus ids **no existen** en `catalog-data.js` → hoy `/hardware/:id` con esos ids cae en `<Navigate to="/hardware-catalog">`.

### 4.2 Diseño: "roadmap como entradas de catálogo en fase diseño" (una sola fuente)

Se **aprovecha el mecanismo existente** — no se crea página nueva:

```js
// catalog-data.js — 5 entradas roadmap agregadas con status: 'construction'
{
  id: 'RPI-05',
  name: 'Raspberry Pi 5 / Edge AI',
  role: 'SBC',
  status: 'construction',      // badge 🔷 En construcción (ya renderiza STATUS_LABEL)
  fase: 'diseño',
  icon: '🍓',
  banner: 'Roadmap — placeholder de integración',
  vendor: 'Raspberry Pi Foundation',
  protocols: ['WiFi','BLE','GPIO','SPI','I2C'],
  lab: [{ label: 'Laboratorio de Hardware', to: '/lab-embedded' }],
  knowledge: [{ label: 'Knowledge Hub', to: '/knowledge' }],
  resources: [ ... ],          // Q2: cursos/videos/dataset/repo reales
  ...
},
// ... FPGA-X (🧩), ARDUINO-UNO-Q (⚡), ALEXA-IOT (🎙️), DRONE-NAV (🛸)
```

**Consecuencias (todas aditivas, cero ruptura):**
1. `/hardware/RPI-05` renderiza la ficha roadmap con badge "En construcción" (STATUS_LABEL ya soporta `construction`).
2. El **Mapa de Dispositivos Grupo C** (roadmap) puede apuntar a `/hardware/${node.id}` (hoy audita a `/hardware-catalog`, ver U3.2A) — **se actualiza automáticamente por data, sin editar el Link**: porque `futureNodes` y `catalog-data.js` comparten ids.
3. `HardwareCatalog` los muestra en el grid (ya filtra por id≠BBB; roadmap entra al mismo flujo).
4. `catalog-data.js` → 15 entradas (10 + 5 roadmap) — el contador del Dashboard (hardwareCount) se actualiza solo.

### 4.3 Decisión de unificación de ids
- **Sí, unificar:** RPI-05 == RASPBERRY-PI? **NO.** `RASPBERRY-PI` es la plataforma (RPi genérica); `RPI-05` es la instancia roadmap (Pi 5 específica). Se mantienen como entradas distintas honestas (por eso el roadmap muestrea ids distintos).
- Si en el futuro se integra el RPi 5, la entrada roadmap **migra a operativo** (status cambia) sin duplicar.

### 4.4 Guardarraíl
- Las 5 entradas roadmap **no se borran ni se fusionan** con las 9 catálogo existentes mientras estén en diseño.
- El Mapa Grupo C sigue mostrando su propio contador (`futureNodes.length`).

---

## 5. Pregunta 4 — ¿Cómo evitar duplicidad?

### 5.1 Fuente única (SSOT)

| Concepto | Única fuente de verdad |
|---|---|
| Plataforma (datos + recursos + projects + knowledge + labs) | `catalog-data.js` |
| Proyectos | `projects-data.js` (`ecosystemProjects`) |
| Documentos KH | `registry.documents` (Knowledge Hub) |
| Roadmap futureNodes | Ver §5.2 |
| Cadenas / colores | Módulo compartido (U3.5) |

### 5.2 Prohibición: ids duplicados

- **Un id = una entrada.** RPI-05 es roadmap; RASPBERRY-PI es plataforma. Si una entrada roadmap "madura", se **actualiza esa misma entrada** (status → operativo) — nunca se crea segunda con misma id.
- `futureNodes` del Dashboard **puede quedar como está** (consume `hardwareCatalogEntries` para el link) o migrarse a un selector: el roadmap pasa a derivarse del catálogo filtrando `fase === 'diseño' && status === 'construction'` → **una sola lista**, cero copias.

### 5.3 Regla anti-duplicidad en recursos

- Si un recurso aplica a >3 plataformas → moverlo a un índice central (`resources-index.js`) o añadirlo al KH como documento (`/knowledge/doc/:id`) y referenciarlo por `to:`.
- Si un recurso solo vale para una plataforma → vive en esa entrada del catálogo.
- Los enlaces externos no se duplican en `links[]` y `resources[]` a la vez: `links[]` = web del fabricante/plataforma; `resources[]` = material educativo.

### 5.4 Verificación automática (opcional, futura)
- Script de revisión (sin runtime) que comprueba: ids únicos en catálogo, `to/href` no vacíos, `projectId` existentes en `ecosystemProjects`, `type` dentro del vocabulario.

---

## 6. Archivos afectados (REALIZACIÓN futura)

| Archivo | Cambio |
|---|---|
| `src/frontend/src/data/catalog-data.js` | + campos `resources[]`, `projects[]`; + 5 entradas roadmap (construction) |
| `src/frontend/src/pages/HardwareDetailPage.jsx` | Sección "🎓 Aprende" (resources) + sección Proyectos dinámica (FK) |
| `src/frontend/src/pages/Dashboard.jsx` | Mapa Grupo C: `to=` con ids roadmap (si se unifica id); contadores automáticos |
| `src/frontend/src/pages/HardwareCatalogPage.jsx` | 0 cambios (grid ya data-driven; roadmap aparece solo) |
| `src/frontend/src/data/projects-data.js` | 0 cambios (ya es el registro de proyectos) |

---

## 7. Riesgos

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | 15 entradas en catálogo = grid más largo | Media | Bajo | Agrupación por `category`/`fase` (U3) en U3.4; roadmap con badge 🔷 |
| 2 | Duplicación visual roadmap (Dashboard + catálogo) | Media | Bajo | Es intencional y honesto (misma fuente de data); count se actualiza solo |
| 3 | Ids roadmap colisionan con catálogo | Baja | Bajo | Guardarraíl 5.2: un id = una entrada |
| 4 | Recursos no verificables (href muertos) | Media | Bajo | Cambio: validación de enlaces en checklist de regresión |
| 5 | Texto educativo sin actualizar | Media | Bajo | `source`/`year` en cada recurso; revisar en health check |

**Riesgo neto: BAJO** — todo es data-driven, aditivo y con fallback "Pendiente de integración".

---

## 8. Resumen decisivo

| Pregunta | Respuesta |
|---|---|
| 1. Conexión Hardware→Conocimiento→Labs→Proyectos→Recursos | La ficha es **hub de convergencia**: knowledge[]/labs[] existentes + projects[] FK nuevo + resources[] nuevo; todo `?.` defensivo y honesto |
| 2. Cursos/Videos/Investigaciones/Datasets/Repos | Campo `resources[]` tipado (course/video/research/dataset/repo), render en "🎓 Aprende" con tabs si >6 |
| 3. Roadmap Detail Pages | Las 5 plataformas roadmap se agregan al catálogo con `status:'construction'` → la página `/hardware/:id` **existente** las renderiza sin nueva ruta; Mapa Grupo C actualizable por id compartido |
| 4. Evitar duplicidad | Fuente única por concepto; un id = una entrada; recursos trasladables a índice central si >3 usos; script de validación opcional |

**Estado: DISEÑO APROBADO PARA REVISIÓN — NO IMPLEMENTADO.**