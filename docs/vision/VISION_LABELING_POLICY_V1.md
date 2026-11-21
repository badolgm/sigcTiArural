# POLÍTICA DE ETIQUETADO VISUAL V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T19:17:32-05:00
> - Origen: misión `SIGCTIARURAL_VISION_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/vision/VISION_LABELING_POLICY_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: define asignación de `class_id`, `secondary_classes`, cajas, segmentaciones y acuerdos. No etiqueta imágenes, no implementa código.

**Misión:** `SIGCTIARURAL_VISION_GOVERNANCE_V1`
**Naturaleza:** documentación oficial de **gobernanza de etiquetado visual**. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Fuentes de verdad:** `docs/vision/VISION_TAXONOMY_V1.md` (vocabulario) · `docs/vision/VISION_GOVERNANCE_V1.md` (IDs) · `docs/acoustic/labeling_policy_v2.md` (patrón hermano).
**No modifica:** `labels.csv`, `schema.json`, `docs/acoustic/*`, la plataforma de observaciones ni ningún dataset.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Regla dura:** **NO CREAR CLASES COMBINADAS** (NC-1..NC-6).
> **Honestidad:** Cohen κ permanece **`PENDING`** hasta que existan etiquetas individuales por anotador. No se calcula κ simulado.

---

# 0. Propósito

Esta política gobierna **cómo se asigna una etiqueta** a una imagen, un video o una región (caja/máscara). Responde:

1. qué es `class_id` y cómo se escribe en visión,
2. cuándo se etiqueta la subclase y cuándo el padre,
3. cómo se expresa la concurrencia sin clases compuestas (`secondary_classes`),
4. cómo se trazan cajas y segmentaciones al `annotation_id`,
5. qué criterios debe cumplir una etiqueta para ser **aceptada**,
6. cómo se mide —y cómo **no** se finge— el acuerdo entre anotadores.

> **Límite VG-11:** esta política describe anotación **humana y gobernada**. Ninguna etiqueta puede venir de un modelo, de YOLO, de una CNN ni de inferencia automática. Un `prediction_id` en una anotación ⇒ `BLOCKED`.

---

# 1. `class_id` — definición operativa visual

## 1.1 Contrato

| Propiedad | Regla |
|---|---|
| Tipo | Token `snake_case`, minúsculas, sin acentos ni espacios |
| Cardinalidad | **Exactamente uno por objeto anotado** (imagen monoetiqueta, caja o máscara) |
| Dominio | Enum cerrado de `visual_v1_taxonomy` (`VISION_TAXONOMY_V1.md`) |
| Versionado | Toda anotación declara `taxonomy_version` y `label_schema_version` |
| Inmutabilidad | Un `class_id` asignado no se renombra; el cambio se gestiona con `alias_of` |
| Trazabilidad | Toda etiqueta lleva `annotator_id`, `annotation_round` y `notes` |
| Estado | Toda clase nace `DISENO` con 0 activos; `REAL` exige evidencia y gates |
| Composición | **Prohibida** (§5) |

## 1.2 Reglas de asignación

| ID | Regla |
|---|---|
| **VLP-1 · Vocabulario cerrado** | El anotador elige solo entre los `class_id` vigentes. No se inventan etiquetas. Si nada encaja, se aplica `VISION_OOD_POLICY_V1.md`. |
| **VLP-2 · Primariedad por dominancia** | `class_id` describe el objeto/evento dominante. Lo que acompaña va en `secondary_classes` o en otra caja. |
| **VLP-3 · Granularidad fina confirmable** | Se etiqueta al nivel más fino **observable y confirmable**: si se identifica `gallina`, se usa `gallina`; si solo se confirma "ave", se usa `ave` (padre). |
| **VLP-4 · Padre por defecto** | Ante duda entre hermanas, se etiqueta al **padre** (`TAX-4`). Es preferible perder granularidad que introducir ruido. El padre siempre es válido. |
| **VLP-5 · Sin clases combinadas** | Prohibido `tomate_con_plaga`, `tractor_bajo_lluvia`, `persona_con_maquinaria`. La combinación se expresa con cajas separadas + `secondary_classes` + `scene_id` + telemetría. |
| **VLP-6 · Escena no es clase** | `paisaje_rural`, `invernadero`, `granja` y los 8 `scene_id` van en contexto (VG-4), **nunca** en `class_id`. **Excepción aparente resuelta:** `invernadero` es `class_id` legítimo de INFRAESTRUCTURA cuando el objeto anotado *es* la estructura; `scene_invernadero` es su escena. Misma palabra, ejes distintos; se declara el eje en cada campo. |
| **VLP-7 · Alias solo en lectura** | Los alias (`corral`, `calle`) sirven para leer/evaluar; no se asignan a anotaciones nuevas (usa `scene_granja`, `scene_entorno_urbano`). |
| **VLP-8 · Personas con consentimiento** | `operario`, `visitante`, `rostro` requieren `consent_id`. Sin él, bloque omitido y `PARTIAL` (PER-1). |

> **Aclaración VLP-6 (crítica).** La misión da `invernadero` como ejemplo **correcto** de clase. La taxonomía lo incluye en INFRAESTRUCTURA (donde sí es `class_id`) y además define `scene_invernadero` (donde es contexto). No hay contradicción: `class_id=invernadero` responde "qué objeto está en la caja"; `scene_id=scene_invernadero` responde "dónde se capturó". Ambos pueden coexistir en la misma anotación sin mezclarse.

## 1.3 Veredictos de asignación

| Veredicto | Significado |
|---|---|
| `ACCEPTED` | Cumple AV-1..AV-11 (§5). |
| `REVIEW` | Duda razonable; requiere segunda anotación antes de aceptar. |
| `PARENT_FALLBACK` | Se etiqueta al padre por VLP-4 (válido, granularidad reducida). |
| `OOD` | No encaja en el enum; se aplica `VISION_OOD_POLICY_V1.md`. |
| `REJECTED` | Imagen o etiqueta inválida; se registra y se cura (§7), **no** se convierte en OOD. |

---

# 2. `parent_id` en visión

| Propiedad | Regla |
|---|---|
| Valor | `null` para canónicas raíz; ID del padre para subclases |
| Profundidad | **Máximo 1 nivel** (sin subclases de subclases), coherente con audio v2 (TAX-1) |
| No sustitución | Etiquetar `gallina` **no** elimina `ave` como agregado (TAX-2) |
| Plegado | Las métricas agregadas se calculan sobre `parent_id`; las finas sobre `class_id` |
| Evaluación dual | Todo informe debe poder emitirse en nivel fino (`class_id`) y grueso (`parent_id`) |

| Subclase | Padre | Resultado del plegado |
|---|---|---|
| `hoja_manchada` | `hoja` | `hoja` sigue válida y agrega |
| `gallina` | `ave` | `ave` sigue válida y agrega |
| `bovino_paciendo` | `bovino` | `bovino` sigue válido y agrega |
| `pulgon` | `insecto_plaga` | `insecto_plaga` agrega todas las plagas finas |
| `malla_rota` | `invernadero` | `invernadero` agrega daño y estructura sana |

---

# 3. `secondary_classes` — concurrencia sin clases compuestas

> Análogo visual de `secondary_classes_v2.md` de audio. Es el mecanismo oficial para decir "hay varias cosas" **sin inventar un token compuesto**.

## 3.1 Contrato

| Propiedad | Regla |
|---|---|
| Tipo | Lista ordenada de `class_id` válidos del enum vigente |
| Cardinalidad | 0..N; **sin duplicados**; **no incluye** la `class_id` primaria |
| Orden | Por dominancia decreciente; el primero es el más visible |
| Ubicación | Va en el `annotation_id` de la imagen/escena, **no** dentro de una caja |
| OOD | Si algo no encaja, se registra en OOD por separado; **nunca** se mete en `secondary_classes` como `desconocido_visual` |

## 3.2 Ejemplos gobernados

| Situación | `class_id` (primaria) | `secondary_classes` | Otros campos |
|---|---|---|---|
| Tractor y persona en el campo | `tractor` | `["operario"]` | `scene_id=scene_paisaje_rural` · `consent_id` |
| Tomate con síntoma e insecto | `tomate` | `["sintoma_foliar","insecto_plaga"]` | Cajas separadas por objeto |
| Gallina, maíz y corral | `gallina` | `["maiz"]` | `scene_id=scene_granja` |
| Abeja sobre flor | `abeja` | `["flor"]` | `scene_id=scene_cultivo` |
| Invernadero con malla rota | `invernadero` | `["malla_rota"]` | `scene_id=scene_invernadero` |
| Motor bajo lluvia | `motor` | `["lluvia_visual"]` | telemetría/event_id de lluvia |

> En todos los casos, **la primaria sigue siendo atómica**. Lo compuesto se descompone; nunca se crea `tractor_con_operario`.

---

# 4. Cajas y segmentaciones

## 4.1 `BOUNDING_BOX_ID` (`bbox_`)

| ID | Regla |
|---|---|
| **BB-1** | Una caja describe **un** objeto con **un** `class_id`. Dos objetos ⇒ dos `bbox_`. |
| **BB-2** | Coordenadas `x_min,y_min,x_max,y_max` **normalizadas [0,1]** sobre `source_width × source_height`. |
| **BB-3** | Toda caja referencia `annotation_id` + `asset_id` + `image_id` (o frame de video). |
| **BB-4** | `occlusion` y `truncation` se declaran en escala acordada; no se inventan si no se observan. |
| **BB-5** | Cambiar la resolución de la imagen **no reescribe** la caja: se conserva `source_width/height` original. |
| **BB-6** | Una corrección crea un nuevo `bbox_` con `supersedes`; el original permanece. |
| **BB-7** | Caja sin `class_id` ⇒ `REJECTED`. Caja con `class_id` compuesto ⇒ `REJECTED` (NC-1). |

## 4.2 `SEGMENTATION_ID` (`seg_`)

| ID | Regla |
|---|---|
| **SEG-1** | La segmentación es **opcional**: imagen con cajas y sin máscaras es válida. |
| **SEG-2** | Formato **abierto** declarado (`polygon[]` o `rle_ref`); sin dependencia propietaria. |
| **SEG-3** | Geometría en coordenadas normalizadas [0,1]. |
| **SEG-4** | Un `class_id` por máscara; nunca compuesto. |
| **SEG-5** | No se genera automáticamente: generarla sería inferencia (VG-11). |
| **SEG-6** | Una corrección crea un nuevo `seg_` con `supersedes`; el original permanece. |

## 4.3 Coordenadas normalizadas (VG-10)

```
  x_norm = x_px / source_width
  y_norm = y_px / source_height

  Valores en [0,1] · origen (0,0) es la esquina superior izquierda.
  source_width/height se guardan SIEMPRE con la caja/máscara.
```

> Beneficio a 10 años: si el pipeline cambia de 1280×720 a 1920×1080, las anotaciones antiguas siguen siendo válidas y comparables. Es el equivalente visual del `window_schema` congelado de audio.

## 4.4 Video y cuadros derivados

| ID | Regla |
|---|---|
| **FRM-1** | Los cuadros extraídos son `image_` con `derived_from=video_id`, no assets independientes. |
| **FRM-2** | Comparten el `observation_id` del video; no crean nueva raíz. |
| **FRM-3** | La extracción de cuadros **no se ejecuta en esta misión**: se declara el contrato, no se realiza. |
| **FRM-4** | Una anotación sobre un cuadro referencia `image_id` del cuadro, no `video_id` directo. |

---

# 5. Criterios de aceptación de una etiqueta visual

Una anotación se considera **ACEPTADA** solo si cumple **todos** los criterios. Son aditivos a los checks de integridad de la plataforma (Platform P6-1..P6-6); no los sustituyen.

| ID | Criterio | Verificación |
|---|---|---|
| **AV-1** | `class_id` pertenece al enum de `visual_v1_taxonomy` | Comparación contra `VISION_TAXONOMY_V1.md` |
| **AV-2** | `class_id` es el objeto/evento dominante | Revisión del anotador + evidencia visible |
| **AV-3** | Granularidad correcta (VLP-3/VLP-4) | Si es subclase, el detalle fino fue confirmado |
| **AV-4** | `parent_id` coherente (profundidad 1) | Solo subclases |
| **AV-5** | `secondary_classes` válido si presente | Sin duplicados, sin la primaria, sin OOD dentro |
| **AV-6** | **No es clase combinada ni escena** | Cumplimiento de NC-1..NC-6 y VLP-5/6 |
| **AV-7** | Cajas/máscaras con un `class_id` atómico y coords [0,1] | BB-1/2, SEG-3/4 |
| **AV-8** | Si es OOD, sigue `VISION_OOD_POLICY_V1.md` | Sentinela, nunca a demanda |
| **AV-9** | Personas con `consent_id` | VLP-8 / PER-1 |
| **AV-10** | Doble anotación completada cuando aplica | `annotator_id` + `review_annotator_id` + `agreement` |
| **AV-11** | `label_schema_version` declarada y sin `prediction_id` | Campo no vacío; BLOCKED si hay inferencia |

---

# 6. Acuerdos y Cohen κ (`PENDING`)

> **Honestidad central.** No existe hoy ningún par de etiquetas individuales por anotador en el dominio visual. Por tanto **no se puede calcular Cohen κ real**. Reportar un κ numérico sería fabricación (P-IA-5 de la Carta IA).

## 6.1 Modelo de acuerdo

| Campo | Tipo | Regla |
|---|---|---|
| `annotator_id` | OBLIGATORIO | Autor de la anotación |
| `annotation_round` | OBLIGATORIO | Entero ≥ 1 |
| `review_annotator_id` | CONDICIONAL | Segundo anotador cuando aplica doble revisión |
| `agreement` | CONDICIONAL | **Categoría** (`FULL` · `PARTIAL` · `NONE` · `PENDING`), nunca un número simulado |
| `cohen_kappa` | DERIVADO | **`PENDING`** hasta tener etiquetas por pares; luego se calcula, nunca se estima |

## 6.2 Reglas

| ID | Regla |
|---|---|
| **KAP-1** | `cohen_kappa=PENDING` por defecto en todo el dominio visual. |
| **KAP-2** | `agreement` es cualitativo; un `PARTIAL` no se convierte en 0,5 numérico. |
| **KAP-3** | El κ solo se calcula sobre pares reales de anotadores independientes sobre el mismo `asset_id`. |
| **KAP-4** | El κ se reporta por `class_id` agregado y por `parent_id`, con n declarado. |
| **KAP-5** | Si un anotador corrigió, se conserva `supersedes` y el par se recalcula sobre la versión vigente, sin borrar la anterior. |
| **KAP-6** | Mostrar κ sin n o sin pares reales ⇒ `BLOCKED`. |

## 6.3 Veredicto honesto hoy

```
  acuerdos individuales por anotador : NO EXISTEN
  pares independientes               : 0
  cohen_kappa                        : PENDING
  agreement disponible               : PENDING (categoría)
  veredicto gobernanza               : NO_DATA  ✓ honesto
```

---

# 7. Curación no destructiva

| ID | Regla |
|---|---|
| **CUR-1** | Toda corrección crea un nuevo `annotation_id`/`bbox_`/`seg_` con `supersedes`. |
| **CUR-2** | El objeto corregido **nunca se reescribe ni se borra** (VG-7). |
| **CUR-3** | La versión vigente se resuelve por cadena `supersedes`; el historial completo queda consultable. |
| **CUR-4** | Una corrección **no sube el estado** de `REAL-LOCAL` a `REAL` ni la confianza. |
| **CUR-5** | Rechazar una clase compuesta no destruye la anotación: se conserva con nota y se reanota. |
| **CUR-6** | La curación es una misión futura; hoy solo se define el contrato. |

---

# 8. Fixtures de rechazo (deben fallar)

| Fixture | Resultado esperado |
|---|---|
| `class_id=tomate_con_plaga` | `REJECTED` (NC-1 / AV-6) |
| `class_id=tractor_bajo_lluvia` | `REJECTED` (VLP-5) |
| `class_id=persona_con_maquinaria` | `REJECTED` (NC-1) |
| `scene_id` copiado en `class_id` (`paisaje_rural`) | `REJECTED` (VLP-6 / SCN-2) |
| Caja con dos `class_id` | `REJECTED` (BB-1) |
| Coordenadas fuera de [0,1] | `REJECTED` (BB-2) |
| Máscara generada por modelo (`prediction_id`) | `BLOCKED` (VG-11 / AV-11) |
| `operario` sin `consent_id` | Bloque omitido + `PARTIAL` (AV-9) |
| `cohen_kappa=0.87` con 0 pares | `BLOCKED` (KAP-6) |
| `secondary_classes` con `desconocido_visual` | `REJECTED` (§3.1) |

---

# 9. Gates (definidos, NO ejecutados)

| Gate | Condición | Estado |
|---|---|---|
| **G-VL-1** | `class_id` validado contra enum vigente | `DISENO` |
| **G-VL-2** | Regla NC-1 verificada en fixtures (8 casos de la misión) | `DISENO` |
| **G-VL-3** | Cajas con coords [0,1] y un `class_id` | `DISENO` |
| **G-VL-4** | `secondary_classes` sin compuestos ni OOD | `DISENO` |
| **G-VL-5** | Consentimiento verificado en personas | `DISENO` |
| **G-VL-6** | `cohen_kappa=PENDING` declarado (sin fabricación) | `DISENO` |
| **G-VL-7** | Curación `supersedes` sin borrado | `DISENO` |

---

# 10. Cierre

Esta política convierte la taxonomía en reglas de uso: una etiqueta atómica por objeto, concurrencia por cajas y `secondary_classes`, contexto por `scene_id`, coordenadas normalizadas duraderas, acuerdos cualitativos y κ **`PENDING`** honesto.

**Estado honesto:** **`DISENO`**. No se etiquetó ninguna imagen, no se calculó κ, no se implementó nada, no se tocó la plataforma ni la gobernanza acústica. Sin commit, push, merge ni tag.

---

*Fin de la política de etiquetado visual. Complementa —nunca sustituye— la gobernanza visual V1 y la taxonomía visual V1.*
