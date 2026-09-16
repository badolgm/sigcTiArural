# SIGC&T Rural — Auditoría de Contenido U4.2

**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Alcance:** `Dashboard.jsx` — Bloques: 🗺️ Mapa de Dispositivos (1b), 🧩 Integraciones Futuras (módulo 5), 📰 Noticias & Enlaces Oficiales (módulo 6)
**Tipo:** AUDITORÍA PURA — no se implementó ningún cambio, no se eliminó nada.

---

## Bloques auditados

| Bloque | Ubicación (Dashboard.jsx) | Fuente de datos |
|---|---|---|
| 🗺️ Mapa de Dispositivos (Grupo A/B/C) | L259–339 | `nodes`, `hardwareCatalogEntries`, `futureNodes` |
| 🧩 Integraciones Futuras (módulo 5) | L629–648 | `futureNodes` (ClusterCard) |
| 📰 Noticias & Enlaces Oficiales (módulo 6) | L650–667 | 5 enlaces externos hardcodeados |

---

## Pregunta 1 — ¿Qué información está duplicada?

| Dato | Dónde aparece | Grado |
|---|---|---|
| `futureNodes` (FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV) | **Mapa Grupo C** (L331) **y** **Módulo 5** (L635) | 🔴 **100% duplicado** — mismo array, mismo render discreto (± una sola ficha en el Mapa) |
| Clúster BBB (`nodes`) | Mapa Grupo A (L281) + bloque 3 Hardware Conectado (L539, micro-chips U4.1) | 🟠 Duplicación reducida pero aún presente |
| Catálogo (`hardwareCatalogEntries`) | Mapa Grupo B (L309) + bloque 3 sub-franja 2 (L565) + HardwareCatalogPage | 🟡 Jerárquica (resumen vs. página completa) |
| Enlaces oficiales de plataformas | Módulo 6 (Noticias) + `links`/`resources` de las fichas del catálogo | 🟢 Parcial (genérico vs. específico de ficha) |

---

## Pregunta 2 — ¿Qué información ya aparece en el Mapa?

- Los **nodos BBB operativos** → Grupo A (con cpu/temp y badge 📡 LIVE).
- El **hardware disponible (catálogo)** → Grupo B (con rol y fase, navegable a ficha).
- El **roadmap tecnológico** → Grupo C (`futureNodes` completo, con rol y data).
- La leyenda de estados (online/alerta/offline/referencia/roadmap).

**Conclusión:** el Mapa (1b) YA es la ventana única de todo el ecosistema de dispositivos. Cualquier módulo inferior que vuelva a listar BBB, catálogo o roadmap duplica al Mapa.

---

## Pregunta 3 — ¿Qué información ya aparece en Hardware Catalog?

- Las **fichas completas** de todas las plataformas con: banners honestos, `description`, `protocols`, `labs`, `knowledge`, `links` y `resources[]` (Learning Layer).
- Los **enlaces oficiales** de cada plataforma (BeagleBoard, Espressif, Arduino, Raspberry Pi, STM32, etc.).
- El estatus honesto: `reference` / `construction` (operativo / diseño).

**Conclusión:** Hardware Catalog es la fuente canónica de fichas; el Mapa es su resumen navegable. Los `futureNodes` NO están en el catálogo (son placeholders con links, ver pregunta 6).

---

## Plan por bloque

### 🗺️ Mapa de Dispositivos (1b)
- **CONSERVAR:** Se mantiene como el hub jerárquico de todo el contenido de dispositivos: es el bloque que más valor aporta y el de mayor prioridad visual.
- **COMPACTAR:** La leyenda de estados puede condensarse a un tooltip si el espacio se reutiliza.
- **FUSIONAR:** Debe SER el receptor de la información del bloque 3 (Hardware Conectado) y de Integraciones Futuras (ver abajo).
- **CRECER:** Es el bloque recomendado para crecer si se integra el contenido redundante que hoy vive duplicado debajo.

### 🧩 Integraciones Futuras (módulo 5)
- **CONSERVAR:** El concepto (integración futura, roadmap) permanece — ya vive en el Mapa Grupo C.
- **COMPACTAR:** No re-renderizar el grid de `futureNodes` (ClusterCard); sustituir la sección por un **acceso puntual** al Grupo C del Mapa (etiqueta + contador + enlace ancla), o dejar que el Grupo C sea el único render.
- **FUSIONAR:** Se fusiona en el Mapa Grupo C (Roadmap Tecnológico). El módulo 5 deja de renderizar el array duplicado y pasa a ser una referencia cruzada.

### 📰 Noticias & Enlaces Oficiales (módulo 6)
- **CONSERVAR:** Es el único bloque con **contenido realmente distinto del Mapa y del Catálogo**: enlaces externos a fuentes oficiales (Arduino Blog, RPi News, Alexa Dev, Google Dev, IEEE Spectrum). No duplica el Mapa.
- **COMPACTAR:** Reducir la lista a línea única de chips pequeños (p. ej. solo el nombre de la fuente, ~90% menos alto) manteniendo los 5 enlaces y `target="_blank" rel="noreferrer"`.
- **FUSIONAR:** Sin impacto; se puede dejar como módulo colapsado por defecto si se desea jerarquía menor.

---

## Preguntas 4–6 (resumen)

| Bloque | PERMANECER | COMPACTAR | FUSIONAR |
|---|---|---|---|
| 🗺️ Mapa Dispositivos (1b) | ✅ Sí — hub único | 🟡 leyenda → tooltip | ➕ receptor de bloque 3 + Integraciones |
| 🧩 Integraciones Futuras (módulo 5) | ✅ concepto | ✅ a acceso puntual al Grupo C | ➕ en Mapa Grupo C (Roadmap) |
| 📰 Noticias (módulo 6) | ✅ sí (única fuente externa) | ✅ a línea de chips | ❌ no requiere fusión |
| 🔌 Hardware Conectado (3) [hallazgo transversal] | ✅ nodos/estados | ✅ ya micro-chips (U4.1) | ➕ candidato a fusionarse en Mapa A/B |

---

## Hallazgos finales

1. **Duplicación exacta 🔴:** `futureNodes` se renderiza 2 veces en la misma página (Mapa Grupo C L331 → Módulo 5 L635).
2. **Fuente canónica:** Hardware Catalog es la fuente de verdad; el Mapa es su capa resumen; los módulos inferiores deben referenciar, no re-listar.
3. **Único contenido único abajo:** Noticias/Enlaces oficiales (módulo 6) — no aparece en Mapa ni en Catálogo.
4. **Siguiente paso de executor (no ejecutado):** fusionar el módulo 5 en el Grupo C del Mapa (eliminar el doble render de `futureNodes`) y compactar Noticias a línea de chips — validando balance `{`/`(` después de cada cambio.

**Estado:** solo auditoría. Ningún archivo se modificó en esta misión.