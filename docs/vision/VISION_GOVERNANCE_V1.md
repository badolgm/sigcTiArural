# GOBERNANZA VISUAL V1 — SIGCT-RURAL (CONTRATOS EJECUTABLES DE IMAGEN Y VIDEO)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T19:14:24-05:00
> - Origen: misión `SIGCTIARURAL_VISION_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/vision/VISION_GOVERNANCE_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: gobernanza oficial de imagen y video. No implementa código, no entrena, no detecta, no clasifica.

**Misión:** `SIGCTIARURAL_VISION_GOVERNANCE_V1`
**Naturaleza:** contrato **declarativo y ejecutable**. Define identificadores, relaciones, OOD, curación y consumo en el dominio visual.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Estado:** **OFICIAL — DISEÑADO**. Los contratos existen; su materialización requiere misiones explícitas.
**Conjunto de 5 documentos:** este documento es el padre. Los especializados son:

| Documento | Autoridad |
|---|---|
| `docs/vision/VISION_GOVERNANCE_V1.md` | Identificadores, relaciones, compatibilidad, mapeo de fuentes, principios |
| `docs/vision/VISION_TAXONOMY_V1.md` | Vocabulario canónico, `class_id`, `scene_id`, jerarquía, alias |
| `docs/vision/VISION_LABELING_POLICY_V1.md` | Asignación de etiquetas, cajas, segmentaciones, acuerdos |
| `docs/vision/VISION_OOD_POLICY_V1.md` | Sentinela `evento_visual_desconocido`, promoción, rechazo, curación |
| `docs/vision/VISION_DATASET_ROADMAP_V1.md` | Versionado, fases, gates y los 25 riesgos a 1.000.000 imágenes |

**Subordinación:** Constitución V1.0.1 → Carta IA V1.0.1 → D-003 → Gobernanza Multimodal V1 → Masterplan V1 → Observation Platform V1 → **esta gobernanza** → documentos visuales especializados.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante de honestidad:** los **7 estados canónicos** (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`) permanecen intactos. Etiquetar una imagen no mejora su estado.
> **Invariante de identidad:** **`OBSERVATION_ID` no se modifica** en ningún contrato de esta gobernanza. Todo ID visual es hijo o vista de él.

---

# 0. Propósito y alcance

La arquitectura ya existe: gobernanza multimodal, masterplan y plataforma de observaciones. El bloqueo actual es la **gobernanza visual**. Este documento y sus cuatro hermanos la resuelven sin reabrir la arquitectura general.

**Lo que SÍ define:**

1. Los siete identificadores solicitados: `IMAGE_ID`, `VIDEO_ID`, `SCENE_ID`, `ANNOTATION_ID`, `BOUNDING_BOX_ID`, `SEGMENTATION_ID`, `VISUAL_EVENT_ID`.
2. Cómo una imagen se relaciona con `ObservationPackage` **sin romper** la Observation Platform V1.
3. El mapeo obligatorio de PlantVillage, PlantDoc, IP102 e iNaturalist a `observation_id`.
4. La regla dura de **no crear clases combinadas**.
5. Los principios y gates que gobiernan la escala a 1.000.000 de imágenes.

**Lo que NO hace (explícitamente):**

| No hace | Detalle |
|---|---|
| No implementa código | Ningún archivo `.js`, `.py`, `.jsx` ni servicio |
| No entrena modelos | No hay `model_id`, `model_run_id` ni `prediction_id` nuevos |
| No hace YOLO ni CNN | No hay detección ni clasificación automática |
| No hace IA ni Deep Learning | No se invoca LLM, red ni inferred label |
| No crea datasets | No se descargan fuentes ni se materializa `v1/` visual |
| No modifica la plataforma | `docs/governance/SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md` queda intacto |
| No modifica audio | `docs/acoustic/*`, `taxonomy_v2`, `rules-v0` y el dataset v1 quedan intactos |

> Todo lo aquí descrito está en estado **`DISENO`** salvo las definiciones de ID heredadas de la plataforma, que están **ratificadas**. Ninguna clase visual nace con assets: todas nacen con 0.

---

# 1. Principios de la gobernanza visual

| ID | Principio | Consecuencia |
|---|---|---|
| **VG-1** | **Observación como raíz** | Toda imagen o video cuelga de un `observation_id`; ninguno se crea sin ella. |
| **VG-2** | **Identidad inmutable a 10 años** | Ningún ID visual codifica taxonomía, modelo, resolución ni fuente. |
| **VG-3** | **Sin clases combinadas** | Prohibido `tomate_con_plaga`. La composición se expresa con campos separados. |
| **VG-4** | **Escena ≠ clase** | `scene_id` es contexto; jamás se convierte en `class_id`. |
| **VG-5** | **Evento visual ≠ clase visual** | `visual_event_id` es una vista de `event_id`, no un vocabulario nuevo. |
| **VG-6** | **OOD es veredicto** | `evento_visual_desconocido` no explica contenido, no se captura a demanda y no sube confianza. |
| **VG-7** | **Original intacto** | Toda corrección crea un nuevo ID enlazado; nunca se borra ni se reescribe. |
| **VG-8** | **Personas con consentimiento** | `consent_id` obligatorio; sin biometría ni reconocimiento de identidad. |
| **VG-9** | **Externo es `REF`** | PlantVillage, PlantDoc, IP102 e iNaturalist nunca entran en evaluación propia. |
| **VG-10** | **Coordenadas normalizadas** | Cajas y máscaras usan [0,1] sobre la resolución declarada; cambiar resolución no reescribe anotaciones. |
| **VG-11** | **Anotación sin inferencia** | Este contrato describe anotación **humana/gobernada**. No hay etiqueta generada por modelo. |
| **VG-12** | **Sin misión, sin ejecución** | Gobernar no autoriza implementar. |

---

# 2. Los siete identificadores

## 2.1 Catálogo

| ID solicitado | Prefijo | Naturaleza | Depende de | Estado |
|---|---|---|---|---|
| `IMAGE_ID` | `image_` | Asset de imagen | `observation_id` | **Ratificado** (Platform §3.3) |
| `VIDEO_ID` | `video_` | Asset contenedor de video | `observation_id` | **Ratificado** (Platform §3.4) |
| `SCENE_ID` | `scene_` | Contexto/escena gobernada | `observation_id` | **Nuevo, `DISENO`** |
| `ANNOTATION_ID` | `ann_` | Acto de anotación humano | `asset_id` | **Nuevo, `DISENO`** |
| `BOUNDING_BOX_ID` | `bbox_` | Región espacial rectangular | `annotation_id` + `asset_id` | **Nuevo, `DISENO`** |
| `SEGMENTATION_ID` | `seg_` | Máscara/región irregular | `annotation_id` + `asset_id` | **Nuevo, `DISENO`** |
| `VISUAL_EVENT_ID` | `evt_` (vista) | Proyección visual de `event_id` | `event_id` | **Nuevo, `DISENO` — NO es raíz nueva** |

> Regla común: ninguno de estos IDs es la entidad central. Todos son hijos o vistas de `observation_id` (VG-1).

## 2.2 `IMAGE_ID` — `image_<YYYYMMDD>_<HHmmss>_<seq3>`

| Campo | Obligación | Función |
|---|---|---|
| `asset_id` · `observation_id` | OBLIGATORIA | Pertenencia (Platform FS-5) |
| `sha256` · `mime_type` | OBLIGATORIAS | Integridad y forma |
| `width` · `height` | OBLIGATORIAS | Resolución declarada (base de coordenadas) |
| `capture_source` · `source_tier` | OBLIGATORIAS | `webcam` · `upload` · `REF` · T0..T3 |
| `exif_policy` | OBLIGATORIA | Saneado por defecto; GPS/dispositivo a metadata gobernada |
| `original_id` · `source_id` | CONDICIONAL | Obligatorio en fuentes externas; nunca se sobrescribe |
| `consent_id` · `pii_redacted` | CONDICIONAL | Obligatorio con personas (VG-8) |
| `state` · `license` · `governance_version` | OBLIGATORIAS | Honestidad y procedencia |

**Regla IMG-1:** un `image_id` pertenece a **exactamente una** observación. Si otra observación necesita la misma imagen, la referencia por ID; nunca la copia.

## 2.3 `VIDEO_ID` — `video_<YYYYMMDD>_<HHmmss>_<seq3>`

| Campo | Obligación | Función |
|---|---|---|
| `container` · `codec` · `fps` · `duration_s` · `resolution` | OBLIGATORIAS | Formato abierto preferido |
| `keyframes[]` | OBLIGATORIA | Puntos de derivación de cuadros |
| `audio_track_id` | OPCIONAL | Enlace a un `audio_` asset; no duplica bytes |
| `frame_ids[]` | DERIVADO | Cuadros `image_` con `derived_from=video_id`; materialización perezosa |
| `sha256` · `observation_id` · `state` | OBLIGATORIAS | Integridad y pertenencia |

**Regla VID-1:** el video es un **contenedor**, no una clase ni una observación nueva. Sus cuadros comparten el mismo `observation_id`.

## 2.4 `SCENE_ID` — `scene_<token>`

**Definición.** Contexto del lugar y la condición general de captura. Se hereda de la observación y puede declararse por imagen o video. **Nunca describe el objeto** (VG-4).

| `scene_id` | Significado | Alias reconciliado |
|---|---|---|
| `scene_paisaje_rural` | Campo abierto, parcela, pastura | — |
| `scene_invernadero` | Invernadero o casa de malla | — |
| `scene_cultivo` | Cultivo sembrado | — |
| `scene_granja` | Granja o corral | `corral` (Masterplan §6) |
| `scene_porqueriza` | Nave porcina | — |
| `scene_estanque` | Estanque o piscicultura | — |
| `scene_bosque` | Forestal, sendero, montaña | — |
| `scene_entorno_urbano` | Calle, infraestructura urbana | `calle` (Masterplan §6) |

**Regla SCN-1:** los 8 valores de la misión son canónicos. Los valores ilustrativos del Masterplan (`corral`, `calle`) sobreviven como **alias de lectura**; no se crea un `scene_id` duplicado (anti-pérdida).

**Regla SCN-2:** `paisaje rural` sigue siendo escena, nunca `class_id` (decisión H3 D4, LV-6 de audio).

## 2.5 `ANNOTATION_ID` — `ann_<YYYYMMDD>_<seq4>`

| Campo | Obligación | Función |
|---|---|---|
| `annotation_id` · `asset_id` | OBLIGATORIA | Identidad y objetivo |
| `annotator_id` · `annotation_round` | OBLIGATORIAS | Autoría y ronda |
| `review_annotator_id` · `agreement` | CONDICIONALES | Doble revisión; acuerdo como **categoría** |
| `class_id` · `event_type` | OPCIONALES | Etiqueta primaria (una) |
| `supersedes` | OPCIONAL | Apunta a la anotación corregida; **nunca la reescribe** |
| `notes` | OBLIGATORIA | Justificación humana |
| `state` | OBLIGATORIA | Estado del acto de anotación |

**Regla ANN-1:** Cohen κ permanece **`PENDING`** mientras no existan etiquetas individuales por anotador. La anotación **no produce κ simulado** (AN-16 de audio, generalizado).

## 2.6 `BOUNDING_BOX_ID` — `bbox_<YYYYMMDD>_<seq4>`

| Campo | Obligación | Función |
|---|---|---|
| `bbox_id` · `annotation_id` · `asset_id` | OBLIGATORIAS | Pertenencia |
| `x_min` · `y_min` · `x_max` · `y_max` | OBLIGATORIAS | Coordenadas **normalizadas [0,1]** |
| `source_width` · `source_height` | OBLIGATORIAS | Resolución sobre la que se trazó |
| `class_id` | OBLIGATORIA | Un `class_id` por caja; **nunca compuesto** |
| `occlusion` · `truncation` | OPCIONALES | Grado declarado |
| `supersedes` | OPCIONAL | Cura no destructiva |

**Regla BB-1:** una caja describe **un** objeto con **una** etiqueta. Si hay dos objetos, hay dos cajas. `tractor_bajo_lluvia` se expresa como caja `tractor` + condición de lluvia en otro campo, nunca como una caja compuesta.

## 2.7 `SEGMENTATION_ID` — `seg_<YYYYMMDD>_<seq4>`

| Campo | Obligación | Función |
|---|---|---|
| `seg_id` · `annotation_id` · `asset_id` | OBLIGATORIAS | Pertenencia |
| `format` | OBLIGATORIA | Formato abierto declarado (ej. polígono/RLE); sin dependencia propietaria |
| `polygon[]` / `rle_ref` | OBLIGATORIA | Geometría en coordenadas normalizadas [0,1] |
| `class_id` | OBLIGATORIA | Un `class_id` por máscara; nunca compuesto |
| `supersedes` | OPCIONAL | Cura no destructiva |

**Regla SEG-1:** la segmentación es **opcional**. Una imagen con cajas y sin máscaras es válida. No se genera automáticamente: eso sería inferencia (VG-11).

## 2.8 `VISUAL_EVENT_ID` — vista de `event_id`

> **Aclaración crítica.** La misión pide definir `VISUAL_EVENT_ID`. Se define como **una vista tipada de `event_id`**, no como una nueva entidad raíz. Si se creara un `visual_event_id` independiente, aparecerían dos verdades para el mismo evento real y se rompería EV-2/EV-3 de la gobernanza multimodal.

| Propiedad | Regla |
|---|---|
| Valor | `evt_<YYYYMMDD>_<place_id>_<seq4>` — el mismo espacio de `event_id` |
| Naturaleza | Vista de lectura con filtro `modality ∈ {IMAGE, VIDEO}` |
| Referencia | Todo `visual_event_id` **debe** resolver a un `event_id` existente |
| Cardinalidad | 1 evento ↔ 0..N assets visuales; 1 asset visual ↔ 0..N eventos |
| Ejemplo | `evt_20261120_campo07_0002` reúne audio de `abejas` e imagen de `abeja_en_flor` |
| Prohibido | Crear `visual_event_id` sin `event_id`; crear `abejas_con_plaga` como evento |

**Regla VEV-1:** los ejemplos de la misión (`tomate`, `tractor`, `abeja`) son **`class_id`**, no IDs de evento. `lluvia`, `plaga` o `motor_activo` son **`event_type`** (vocabulario), no identificadores de ocurrencia.

---

# 3. Relación con `ObservationPackage` (sin romper Observation Platform V1)

## 3.1 Principio

La Observation Platform V1 define en su §3.3/§3.6/§4 que una imagen es un asset `image_` colgado de `observation_id` y que el `ObservationPackage` es una **vista inmutable y derivada**. Esta gobernanza **no cambia nada de eso**: solo añade los contratos visuales que el paquete puede referenciar.

```
  observation_id  (raíz — NO se modifica)
        │
        ├── image_...  ──┬── scene_id          (contexto)
        │                ├── annotation_...    (etiqueta humana)
        │                │      ├── bbox_...
        │                │      └── seg_...
        │                └── consent_id / exif_policy
        │
        ├── video_...  ─── frame_ids[] (derived_from=video_id)
        │
        └── evt_...     ← visual_event_id es VISTA de este event_id
                              │
                              ▼
  ObservationPackage  (inmutable, derivado — Platform §3.6)
     · bloque Assets: descriptores image_/video_ (ID, sha256, mime, ancho/alto)
     · bloque Eventos: event_ids[] (nunca visual_event_id duplicado)
     · bloque Anotación: annotation_ids[] (con bbox_/seg_ referenciados)
     · NO bytes crudos por defecto · NO predicciones · NO veredictos
```

## 3.2 Reglas de compatibilidad

| ID | Regla |
|---|---|
| OBSV-1 | La imagen se guarda en `obs_.../image/` según Platform FS-1/FS-3. **No se crea otra raíz.** |
| OBSV-2 | El `ObservationPackage` referencia `image_id`, nunca lo redefine ni lo copia. |
| OBSV-3 | El paquete **no incluye** `class_id` generado: la etiqueta vive en `annotation_id` y llega por curación. |
| OBSV-4 | `scene_id` viaja en el bloque de procedencia/contexto, **nunca** en el bloque de etiquetas. |
| OBSV-5 | `visual_event_id` se resuelve a `event_id` antes de entrar al paquete: un solo ancla. |
| OBSV-6 | Cajas y máscaras viajan como **descriptores** (coordenadas + ID), no como píxeles incrustados. |
| OBSV-7 | El paquete sin anotación es válido: `annotation_ids=[]`, estado honesto, sin predicción. |
| OBSV-8 | Ningún ID visual cambia el valor de `observation_id`. Es requisito del criterio de éxito. |
| OBSV-9 | Personas sin `consent_id` ⇒ bloque omitido y veredicto `PARTIAL` (Platform P3-3, ACP-6). |
| OBSV-10 | Esta gobernanza **no modifica** el documento de la plataforma; solo lo especializa. |

## 3.3 Comprobación de no-rotura

| Comprobación | Resultado esperado |
|---|---|
| Hash de `SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md` | Idéntico antes y después de esta misión |
| Estructura `obs_.../image/` | Idéntica a Platform §4.1 |
| Flujo de 7 pasos | Idéntico a Platform §3 |
| `ObservationPackage` | Mismo contrato; solo nuevos campos referenciados |
| `OBSERVATION_ID` | Sin cambios, en los 5 documentos |

---

# 4. Mapeo obligatorio de fuentes externas a `observation_id`

> Las cuatro fuentes se incorporan como **`REF`**. Conservan su `original_id`, nunca se renombran y **jamás** entran en splits de evaluación propios (VG-9, FX-1 del Masterplan).

| Fuente | Forma nativa | Mapeo a `observation_id` | `scene_id` sugerido | Nota de licencia |
|---|---|---|---|---|
| **PlantVillage** | Imagen etiquetada, fondos controlados | 1 imagen → 1 observación monomodal `image_`, con `provenance.source_id=plantvillage` y `original_id` nativo | `scene_cultivo` | Verificar en `source_card`; categorías mixtas CC BY / CC0 según versión |
| **PlantDoc** | Imagen en condición de campo | 1 imagen → 1 observación monomodal; conservar `original_id` | `scene_cultivo` · `scene_invernadero` | Verificar licencia por imagen; uso como dominio real / desplazamiento |
| **IP102** | Imagen de plagas con jerarquía de 102 clases | 1 imagen → 1 observación; nivel jerárquico → `parent_id`, **nunca aplanado** | `scene_cultivo` | Uso `REF`; cifras y licencia por verificar en `source_card` |
| **iNaturalist** | **Ya es una observación**: foto(s), taxón, lugar, fecha, observador | `observation_id` propio con `original_id` = observation de iNaturalist; fotos → `image_`; taxón → `event_type`/`class_id` de `REF` | Según hábitat (8 valores) | Licencia **por observación**; excluir `ND`; `SA` aislado |

## 4.1 Reglas del mapeo

| ID | Regla |
|---|---|
| SRC-1 | El `original_id` de la fuente **nunca se sobrescribe** (AS-4). |
| SRC-2 | El `source_label` se guarda en `provenance.original_label`; el crosswalk es un mapa de lectura. |
| SRC-3 | Toda fuente lleva `source_card.md` + `manifest_ref.<id>.yaml` + `checksums.sha256`. |
| SRC-4 | Las cifras de imágenes por fuente no se afirman como canónicas sin verificación en `source_card`. |
| SRC-5 | Ninguna fuente externa se descarga ni se genera en esta misión. |
| SRC-6 | iNaturalist es la fuente de forma nativa más cercana al modelo de entidades: se mapea primero. |
| SRC-7 | Una observación REF puede tener varias fotos (`image_` assets) bajo la misma raíz (OB-4). |

---

# 5. Regla dura: no crear clases combinadas

## 5.1 Ejemplos de la misión

| ✅ Correcto | ❌ Incorrecto | Expresión gobernada correcta |
|---|---|---|
| `tomate` | `tomate_con_plaga` | `class_id=tomate` + anotación de plaga separada (`bbox_` con `class_id=insecto_plaga`) |
| `hoja` | `hoja_enferma_con_insecto` | `class_id=hoja` + `bbox_` de enfermedad + `bbox_` de insecto |
| `tractor` | `tractor_bajo_lluvia` | `class_id=tractor` + `scene_id` / condición climática en telemetría o `event_id` |
| `abeja` | `abeja_sobre_flor_roja` | `class_id=abeja` + `scene_id=scene_cultivo` + nota |
| `persona` | `persona_con_maquinaria` | `class_id=persona` (con `consent_id`) + `class_id=tractor` en otra caja |
| `invernadero` | `invernadero_con_goteo` | `scene_id=scene_invernadero` + `class_id` separado si aplica |
| `gallina` | `gallina_en_corral_con_maiz` | `class_id=gallina` + `scene_id=scene_granja` + `class_id=maiz` en otra caja |
| `maiz` | `maiz_con_manchas` | `class_id=maiz` + `bbox_` con `class_id` de enfermedad |

## 5.2 Reglas

| ID | Regla |
|---|---|
| NC-1 | Un `class_id` es un token atómico `snake_case`. **Prohibido** cualquier sufijo de combinación (`_con_`, `_bajo_`, `_en_`, `_y_`). |
| NC-2 | Una caja o máscara lleva **un** `class_id`. Dos objetos ⇒ dos IDs de anotación espacial. |
| NC-3 | La concurrencia se expresa con `secondary_classes` (análogo a audio) y con `event_id`. |
| NC-4 | El contexto se expresa con `scene_id`; la condición ambiental con telemetría. |
| NC-5 | Los ocasos compuestos (`paisaje_rural`, `tractor_bajo_lluvia`) se rechazan en validación de taxonomía. |
| NC-6 | Rechazar una clase compuesta **no borra** la anotación: se conserva con nota y se reanota (curación, VG-7). |

---

# 6. Gobernanza OOD (resumen — contrato completo en `VISION_OOD_POLICY_V1.md`)

| Elemento | Definición |
|---|---|
| Sentinela | `evento_visual_desconocido` |
| `is_ood_bucket` | `true` · `dir_name` estable compartido `desconocido_visual` |
| Estado | Sentinela **`DISENO`**, no creada. Ninguna imagen la usa hoy. |
| Asignación | Solo por veredicto humano; nunca por modelo, nunca a demanda (VG-6) |
| Promoción | Misión de gobernanza explícita + bump + huella sincronizada + nota OOD conservada |
| Rechazo | Calidad inválida ⇒ `REJECTED`/`quarantine`/`ROTO`, **no** OOD |
| Curación | `supersedes`; original intacto; estado no sube; confianza no sube |

---

# 7. Escalabilidad y riesgos

Los **25 mayores riesgos de escalar a 1.000.000 de imágenes**, con severidad, umbral y mitigación, están definidos en `docs/vision/VISION_DATASET_ROADMAP_V1.md` §9. Se enumeran allí para que el roadmap y sus gates sean la única fuente de verdad. Puntos de atención principales:

- Almacenamiento y transferencia (estimado, no medido).
- Capacidad humana de anotación — el cuello dominante, como en audio.
- Deriva de taxonomía, alias y `scene_id`.
- Consentimiento y privacidad en ambientes urbanos.
- Licencias por activo en fuentes `REF`.
- Integridad por huella a escala de millón.

---

# 8. Gates (definidos, NO ejecutados)

| Gate | Condición | Estado |
|---|---|---|
| **G-VG-1** | Siete identificadores ratificados con cardinalidad | `DISENO` |
| **G-VG-2** | Taxonomía visual aprobada por misión de gobernanza | `DISENO` |
| **G-VG-3** | `scene_id` oficial con alias reconciliados | `DISENO` |
| **G-VG-4** | Política de etiquetado con regla NC-1 verificada | `DISENO` |
| **G-VG-5** | Sentinela OOD aprobada; nunca creada por defecto | `DISENO` |
| **G-VG-6** | Crosswalk de al menos una fuente REF verificado (iNaturalist) | `DISENO` |
| **G-VG-7** | Imagen en `ObservationPackage` sin modificar la plataforma | `DISENO` |
| **G-VG-8** | Fixtures de rechazo de clases compuestas | `DISENO` |
| **G-VG-9** | Consentimiento y redacción verificados | `DISENO` |
| **G-VG-10** | Integridad por huella en un lote real | `DISENO` |

---

# 9. Cierre

Esta gobernanza convierte la visión en un contrato: siete IDs, una raíz inmutable, escena separada de clase, evento como vista y no como verdad nueva, OOD como veredicto, y fuentes externas como `REF` con `original_id` preservado.

**Criterio de éxito:** primera gobernanza visual oficial capaz de crecer 10 años **sin modificar `OBSERVATION_ID`**. Se satisface porque ningún ID visual es raíz: todos cuelgan de la observación o son vistas de `event_id`.

**Estado honesto:** **OFICIAL y DISEÑADA**. Sin código, modelos, entrenamiento, YOLO, CNN, IA ni Deep Learning. Sin modificar la plataforma de observaciones ni la gobernanza acústica. Sin commit, push, merge ni tag. Los 10 gates permanecen abiertos.

---

*Fin de la gobernanza visual padre. Complementa —nunca sustituye— la Observation Platform V1, la gobernanza multimodal V1, el Masterplan V1, la Constitución, la Carta IA y D-003.*
