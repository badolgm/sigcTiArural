# SIGC&T Rural — Auditoría: Hardware Catalog Page + Data

Fecha: 2026-09-15 · Misión: auditoría solo-lectura.
Archivos auditados: `src/frontend/src/data/catalog-data.js` (195 l), `src/frontend/src/pages/HardwareCatalogPage.jsx` (65 l), `src/frontend/src/components/ClusterCard.jsx` (112 l, referencia).

---

## 1. La página representa correctamente la Dashboard Ganadora

✅ **Correcto.** La página NO reemplaza el Dashboard; es una vista de catálogo de plataformas hardware con:

- **Header honesto** ("Inventario de plataformas de hardware del ecosistema (referencia y diseño). No reemplaza el Dashboard ni la telemetría").
- **Entrada BBB** con `status: 'reference'` y banner "Copia de referencia — BBB-01/02/03 viven en el Dashboard" → dirigencia clara al Dashboard para datos en vivo.
- **Footer "Estado honesto"** que refuerza: "no modifica el Dashboard, la telemetría, los laboratorios ni el Knowledge Hub".
- **Reutiliza `ClusterCard`** (mismo componente que Dashboard y Labs) → consistencia visual garantizada sin crear componentes nuevos.
- **10 entradas** (1 referencia + 9 diseño) alineadas con la spec de la misión U1.1.

⚠ **Mejorable.** El título "🛒 Hardware Catalog" usa un emoji de carrito de compras que no tiene precedente en el proyecto (otros headers: "LABORATORIOS", "IA PREDICTIVA", "Robótica Avanzada & Gemelos Digitales"). Consistencia emoji: agregar o quitar emojis de headers para mantener uniformidad.

---

## 2. Respeta NADA DESAPARECE

✅ **Correcto.** Verificación por componente:

| Activo | Estado |
|---|---|
| `Dashboard.jsx` (247 l) | Intacto — 6 secciones + LoginModal |
| `TopNav.jsx` (4 links) | Intacto — sin agregar enlace a `/hardware-catalog` en la nav (solo accesible por URL directa) |
| `services/cloud.js` (BBB-01/02/03) | Intacto |
| `labs/**` (todas las rutas) | Intactas |
| `knowledge-hub/**` | Intacto |
| `AIPredictiva.jsx` | Intacto |
| `Telemetry3DScene.jsx` | Intacto |
| `VoiceAssistant.jsx` | Intacto |
| `App.jsx` | Solo +1 import +1 ruta (autorizado por U1.1) |
| `HardwareCatalogPage.jsx` | **Nuevo** (U1.1) |

---

## 3. BBB-01, BBB-02 y BBB-03 se preservan

✅ **Correcto.** Las 4 capas de duplicación de BBB permanecen intactas:

1. `App.jsx` (líneas 39-41): `BBB-01`, `BBB-02`, `BBB-03` en `initialNodes`.
2. `Dashboard.jsx` (líneas 17-19): `BBB-01`, `BBB-02`, `BBB-03` en `initialNodes`.
3. `TopNav.jsx` (líneas 12-16): BBB-01 como nodo principal, BBB-02/03 como secundarios.
4. `services/cloud.js` (líneas 30-32): `initialNodes` con los 3 BBB.

En el catálogo, el BBB se presenta como **una sola entrada** (id: `BBB`) con:
- `status: 'reference'` (no 'online' ni 'construction') — honesto.
- Banner: "Copia de referencia — BBB-01/02/03 viven en el Dashboard".
- `data: { 'Estado': 'Operativo (referencia)', 'Cluster': 'BBB-01 · BBB-02 · BBB-03' }` — mención explícita.
- Link interno: "Dashboard (en vivo)" → `/dashboard` — dirigencia al Dashboard.
- Sin controles "Iniciar"/"Reiniciar" (suprimidos por `banner` existente).

---

## 4. Hardware Catalog no duplica innecesariamente información

⚠ **Mejorable (parcial duplicación en la entrada BBB).**

La entrada BBB en el catálogo **sí** tiene información que existe en el Dashboard:
- Nombre, role, protocols, vendor (mismos datos que `initialNodes` en Dashboard).
- Links externos (BeagleBoard.org) que ya están implícitos en la configuración del Dashboard.

**Sin embargo, esto es intencional y honesto:**
- El `status: 'reference'` (no 'online') indica que es una *copia*, no la fuente de verdad.
- El banner lo confirma explícitamente.
- La entrada sirve como *catálogo* de plataformas soportadas, no como dashboard de telemetría.

**Las 9 entradas restantes son completamente nuevas** (no existen en Dashboard, Labs, ni ningún otro archivo) → sin duplicación.

⚠ **Mejorable (sección de detalle debajo de ClusterCard).** La página muestra:
1. `ClusterCard` (con `data`, `links`, `banner`, `status`).
2. Debajo: bloque de texto con `description`, `vendor`, `protocols`, `officialUrl`, `labs`.

El bloque inferior **duplica parcialmente** lo que `ClusterCard` ya muestra:
- `links` del ClusterCard incluyen el enlace oficial → el botón "Sitio oficial" del bloque inferior lo repite.
- `data` del ClusterCard muestra 'Estado'/'Fase' → el bloque inferior no lo repite (bueno).

---

## 5. Mejoras visuales propuestas

### 5.1. Sección de detalle debajo de ClusterCard (mejorable)

**Situación actual:** bloque de texto plano con borde gray-800 (por defecto) debajo de cada tarjeta.

**Mejoras propuestas:**
- **Borde dinámico:** el bloque de detalle podría heredar el color del borde de su ClusterCard padre (cyan para reference, amber para construction) para mantener coherencia visual.
- **Protocolos como badges:** en lugar de texto plano `MQTT · HTTPS · GPIO`, usar `<span>` con fondo semitransparente y borde neón → más escaneable.
- **Enlace oficial destacado:** el botón "Sitio oficial" podría usar el color primario (cyan) y ser más prominente (más padding, borde sólido) para diferenciarlo de los links internos de laboratorio.
- **Altura de tarjetas:** en pantallas grandes (grid 3 columnas), las tarjetas pueden tener alturas diferentes si las descripciones varían mucho. Usar `h-full` + `flex-grow` en el bloque de detalle alinearía las alturas.

### 5.2. Banner de construction (mejorable)

**Situación actual:** las 9 entradas de diseño tienen el mismo texto "Plataforma de diseño — aún no implementada".

**Mejora propuesta:** diferenciar ligeramente (ejemplo: "Diseño: MCU ESP32 — aún no implementada" vs "Diseño: SBC Raspberry Pi — aún no implementada"). Esto ayuda al usuario a identificar la plataforma sin leer el nombre.

### 5.3. Emojis en el header (mejorable)

**Situación actual:** "🛒 Hardware Catalog" — emoji de carrito de compras.

**Mejora propuesta:** usar un emoji más alineado con el dominio del proyecto (ejemplo: "🔧 Hardware Catalog" o "⚙️ Hardware Catalog") o eliminar el emoji para mantener consistencia con otros headers que no los usan.

### 5.4. Botones de laboratorio (correcto pero mejorable)

**Situación actual:** botones de lab usan color secundario (verde neón) → distingue de "Sitio oficial" (cyan).

**Mejora menor:** el botón "Dashboard (en vivo)" en la entrada BBB podría usar un color diferente (ejemplo: amarillo o verde más intenso) para indicar que es un link interno a datos en vivo, no a un laboratorio estático.

---

## Resumen ejecutivo

| Criterio | Veredicto | Detalle |
|---|---|---|
| 1. Representa la Dashboard Ganadora | ✅ Correcto | Catálogo separado, honesto, reutiliza ClusterCard |
| 2. NADA DESAPARECE | ✅ Correcto | Dashboard, Labs, KH, IA, BBB, Telemetría intactos |
| 3. BBB-01/02/03 preservados | ✅ Correcto | 4 capas intactas; catálogo referenciales |
| 4. Sin duplicación innecesaria | ⚠ Mejorable | BBB parcialmente duplicado (intencional y honesto); sección de detalle podría integrarse mejor con ClusterCard |
| 5. Mejoras visuales | ⚠ Mejorable | 4 propuestas concretas (borde dinámico, badges, alturas, diferenciar banners) |
| 6. No se modificaron archivos | ✅ Correcto | Solo se leyeron y auditaron |
