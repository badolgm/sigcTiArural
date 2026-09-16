# SIGCTiArural — Revisión UX de Capacidades (UX-01)

> **Estado:** Auditoría read-only. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-15
> **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** Botones `Conocimiento`, `Telemetría (en vivo)`, `Proyectos (docs)` — bloque `🧭 Capacidades del Ecosistema` en `Dashboard.jsx` (`ECOSYSTEM_LINKS`, L9-14).

---

## 0. Los tres botones auditados

| # | Label | `to` (destino actual) | Componente donde vive | Línea |
|---|---|---|---|---|
| 1 | `Conocimiento` | `/knowledge` | Dashboard.jsx (`ECOSYSTEM_LINKS`) | 9 |
| 2 | `Telemetría (en vivo)` | `/dashboard` | Dashboard.jsx (`ECOSYSTEM_LINKS`) | 12 |
| 3 | `Proyectos (docs)` | `/knowledge` | Dashboard.jsx (`ECOSYSTEM_LINKS`) | 14 |

---

## 1. Destinos actuales (verificación con rutas reales)

Rutas registradas en `App.jsx` (fuente de verdad):
- `/knowledge` → `KnowledgeHubLayout` (hub indizado, 51 documentación, agrupado por categoría).
- `/knowledge/doc/:docId` → documento individual del registry (p. ej. `masterdoc`, `plan_maestro`, `api_reference`, `edge_setup`).
- `/dashboard` → `Dashboard` (TelemetryPanel + Infraestructura BBB + Telemetría Global + Integraciones Futuras + Noticias).

Destinos verificados:
1. **Conocimiento → `/knowledge`** = hub general. Correcto para esa etiqueta. ✔
2. **Telemetría (en vivo) → `/dashboard`** = **misma página que la hospeda** (auto-bucle). La única vista de telemetría es el propio Dashboard; no existe ruta `/telemetry` separada. Revisar: ver sección 2-B.
3. **Proyectos (docs) → `/knowledge`** = **mismo destino que "Conocimiento" en el mismo bloque** (duplicidad directa). Revisar: ver sección 2-A.

Relación con `routeMap` de `App.jsx` (L70-84): existe la clave `'docs': '/knowledge/doc/masterdoc'` — un precedente canónico para documentación de proyecto.

---

## 2. Duplicidades detectadas

### 2-A. `Conocimiento` ≡ `Proyectos (docs)` (← idénticos, en el mismo bloque)
- Ambos apuntan a `/knowledge` con etiquetas distintas.
- Impacto UX: dos botones en la misma cadena visual con el **mismo destino**; el usuario no obtiene nada nuevo al pulsar el segundo, y la jerarquía "Conocimiento → … → Proyectos" no se materializa.
- Origen: añadido en U1.5 como etiqueta representativa de la cadena, sin verificación de unicidad de destino.
- Clasificación: **duplicidad real (misma ruta, mismo bloque).**

### 2-B. `Telemetría (en vivo)` ≡ página actual (`/dashboard`)
- El botón apunta a `/dashboard`; al estar dentro del propio Dashboard, es un **auto-bucle** (no lleva a otra parte).
- Además **TopNav.jsx L25** ya ofrece `Dashboard → /dashboard` (menú global). Hay doble redundancia: sub-dentro del propio nó y frente al menú global.
- No hay sección anclable (`#telemetria`) para saltar directamente al panel.
- Clasificación: **auto-referencia sin valor navegacional** (redundancia).

---

## 3. Destino correcto propuesto (respetando compatibilidad total)

| Botón | Destino propuesto | Racional | Compatibilidad |
|---|---|---|---|
| `Conocimiento` | `/knowledge` (mantener) | Hub general de conocimiento — etiqueta correcta. | ✔ Sin cambios de ruta. |
| `Proyectos (docs)` | `/knowledge/doc/masterdoc` | Documento canónico del proyecto (coincide con `routeMap['docs']` y la categoría `project-core`). Distinct del hub genérico; da clara la "documentación de proyecto". | ✔ Ruta existente en registry y Routes. |
| `Telemetría (en vivo)` | `/dashboard#telemetria` (ancla) o mantener `/dashboard` | Conduce al panel de telemetría en vivo del propio Dashboard vía ancla (`id` en la sección de telemetría), eliminando el auto-bucle plano. Alternativa segura sin cambios: mantener `/dashboard`. | ✔ `/dashboard` ya existe; el ancla solo añade id/marcador (cambio mínimo futuro, no requerido hoy). |

> Nota de diseño (para una misión futura, NO implementar hoy):
> - Agregar `id="telemetria"` a la sección del `TelemetryPanel` y cambiar `to` a `'/dashboard#telemetria'` resuelve el auto-bucle sin tocar rutas ni lógica.
> - Alternativa: re-etiquetar `Proyectos (docs)` como `Proyecto (docs)` y apuntar al `masterdoc`, dejando claro que la doc viva del proyecto está en el Knowledge Hub.

---

## 4. Mantenimiento de compatibilidad total (sin tocar código)

- **Cero cambios de ruta**: todos los destinos propuestos ya existen (`/knowledge`, `/knowledge/doc/masterdoc`, `/dashboard`).
- **Cero cambios de lógica**: no se toca `Route`, `routeMap`, `TopNav`, ni componentes.
- **Cero riesgo de romper BBB/Telemetría/Labs/KH/IA/Docker/Backend**: el bloque `ECOSYSTEM_LINKS` es datos de presentación aislado en `Dashboard.jsx`.
- Regresión esperada si se implementara algún día: solo se comparan 3 strings en un array de datos; rollback = revertir el array o `git restore Dashboard.jsx`.
- El resto de la cadena (`Laboratorios → /labs`, `Hardware → /hardware-catalog`, `IA → /ai-predictive`) ya es única y correcta — sin duplicidades.

---

## 5. No se ha tocado código

- Modificado: **ningún archivo fuente**. Solo se crea este documento de auditoría.
- Git: sin cambios sobre el Working Tree de código (inmutable esta misión).

---

## Resumen
1. Destinos actuales: 1 hub genérico, 1 documento correcto, 1 auto-bucle.
2. Duplicidades: `Conocimiento` vs `Proyectos (docs)` (misma ruta, mismo bloque); `Telemetría (en vivo)` es auto-bucle del propio Dashboard.
3. Destino correcto: `Conocimiento → /knowledge` (sin cambio); `Proyectos (docs) → /knowledge/doc/masterdoc`; `Telemetría (en vivo) → /dashboard#telemetria` (futuro posible) con fallback `/dashboard`.
4. Compatibilidad: total — cero rutas, cero lógica, cero componentes modificados.
5. Código: NO implementado, pendiente de aprobación. Ready para UX-02 si se desea aplicar.