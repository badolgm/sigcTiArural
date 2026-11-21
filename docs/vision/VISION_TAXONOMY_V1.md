# TAXONOMÍA VISUAL OFICIAL V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T19:14:24-05:00
> - Origen: misión `SIGCTIARURAL_VISION_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/vision/VISION_TAXONOMY_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: taxonomía declarativa de imagen y video. No crea `class_id` ejecutables, no etiqueta imágenes, no entrena.

**Misión:** `SIGCTIARURAL_VISION_GOVERNANCE_V1`
**Naturaleza:** fuente de verdad del vocabulario visual. Contrato **`DISENO`**: todas las clases listadas nacen con **0 activos**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Autoridad:** `docs/vision/VISION_GOVERNANCE_V1.md` · subordinada a la gobernanza multimodal V1 y al Masterplan V1.
**No modifica:** `docs/acoustic/taxonomy_v2.md`, `labels.csv`, `schema.json`, la plataforma de observaciones ni ningún dataset.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Regla dura:** **NO CREAR CLASES COMBINADAS** (VG-3, NC-1..NC-6).

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Taxonomía visual canónica en `docs/` antes de esta misión | **No existía** |
| Estado de esta taxonomía | **`DISENO`** — propuesta oficial gobernada |
| Clases activas con assets | **0** |
| `labels.csv` de imagen | **No existe**; no se crea aquí |
| Materialización de `v1/` visual | **No se crea** (ver `VISION_DATASET_ROADMAP_V1.md`) |
| Detección/clasificación automática | **Prohibida** en esta misión |

> Decir que esta taxonomía "ya funciona" sería falso. Es el vocabulario oficial **declarado**, pendiente de ratificación ejecutiva por misión de gobernanza.

---

# 1. Estructura del contrato de clase

## 1.1 `class_id`

| Propiedad | Regla |
|---|---|
| Tipo | Token `snake_case`, minúsculas, sin acentos ni espacios |
| Cardinalidad | **Exactamente uno por objeto anotado** (caja, máscara o imagen monoetiqueta) |
| Dominio | Enum cerrado por `taxonomy_version` (`visual_v1_taxonomy`) |
| Inmutabilidad | Un `class_id` no se renombra; el cambio se gestiona con `alias_of` |
| Granularidad | Se etiqueta al nivel más fino **observable y confirmable** |
| Estado | Toda clase nace `DISENO`; `REAL` requiere evidencia y gates |
| Composición | **Prohibida** (§5) |

## 1.2 Ejes ortogonales

| Eje | Campo | Valores | Función |
|---|---|---|---|
| A · Dominio | `visual_domain_id` | 9 dominios + `OOD` (§2) | Agrupa; **nunca** es `class_id` |
| B · Clase | `class_id` | Canónica raíz o subclase | Etiqueta primaria del objeto |
| C · Jerarquía | `parent_id` | `null` o canónica raíz | Plegado; profundidad máxima **1** |
| D · Escena | `scene_id` | 8 valores canónicos (§4) | Contexto; **nunca** `class_id` |
| E · Concurrencia | `secondary_classes` | CSV | Eventos simultáneos, sin clases compuestas |
| F · Ocurrencia | `event_id` | `evt_...` | Evento real; `visual_event_id` es su vista |

> Estos seis ejes son la traducción visual de los cinco ejes del Masterplan §6.1, más el eje de ocurrencia. **Ninguno se mezcla.**

---

# 2. Los 10 dominios obligatorios

| # | Dominio | Estado | Función |
|---|---|---|---|
| 1 | **CULTIVOS** | `DISENO` | Plantas, hojas, frutos, flores, suelo |
| 2 | **ENFERMEDADES** | `DISENO` | Síntomas fitopatológicos |
| 3 | **PLAGAS** | `DISENO` | Insectos, hongos, malezas, roedores |
| 4 | **INFRAESTRUCTURA** | `DISENO` | Invernaderos, tanques, tuberías, cercas |
| 5 | **MAQUINARIA** | `DISENO` | Tractores, bombas, motores, drones |
| 6 | **GANADO** | `DISENO` | Bovinos, porcinos, aves, abejas, peces |
| 7 | **PERSONAS** | `DISENO` | Operarios y visitantes, con consentimiento |
| 8 | **FENOMENOS_CLIMATICOS** | `DISENO` | Lluvia, granizo, niebla, humo, incendio |
| 9 | **ANOMALIAS** | `DISENO` | Eventos anómalos **conocidos** |
| 10 | **OOD** | `DISENO` | Sentinela de no-clasificación |

> `ANOMALIAS` no es OOD: una anomalía es un evento **conocido** de comportamiento anómalo; OOD es incertidumbre **semántica** (OO-5 de audio, VOD-5 visual).

---

# 3. Taxonomía canónica por dominio

> Todas las filas son `DISENO` con 0 activos. La columna de fuente indica el crosswalk previsto, **no una ingesta ejecutada**.

## 3.1 CULTIVOS

| `class_id` | `parent_id` | Crosswalk REF | Nota |
|---|---|---|---|
| `planta` | `null` | PlantVillage · PlantDoc | Canónica raíz |
| `hoja` | `planta` | PlantVillage · PlantDoc | Ejemplo correcto de la misión |
| `fruto` | `planta` | PlantVillage · IP102 | — |
| `flor` | `planta` | iNaturalist | — |
| `suelo` | `null` | — | Superficie, no evento |
| `tomate` | `planta` | PlantVillage · PlantDoc | **Ejemplo correcto** |
| `maiz` | `planta` | PlantVillage · PlantDoc | **Ejemplo correcto** |
| `papa` | `planta` | PlantVillage | — |
| `hoja_manchada` | `hoja` | PlantVillage | Subclase; el padre sigue válido |

## 3.2 ENFERMEDADES

| `class_id` | `parent_id` | Crosswalk REF | Nota |
|---|---|---|---|
| `sintoma_foliar` | `null` | PlantVillage | Canónica raíz de síntoma |
| `mildiu` | `sintoma_foliar` | PlantVillage · IP102 | — |
| `roya` | `sintoma_foliar` | PlantVillage | — |
| `mancha_bacteriana` | `sintoma_foliar` | PlantVillage | — |
| `marchitez` | `sintoma_foliar` | PlantVillage · PlantDoc | — |
| `podredumbre` | `null` | PlantVillage | Fruto/raíz; no foliar |

**Regla ENF-1:** la enfermedad se anota como **objeto/síntoma** con su propio `class_id` y su propia caja, nunca como sufijo del cultivo (`tomate_con_manchas` está prohibido).

## 3.3 PLAGAS

| `class_id` | `parent_id` | Crosswalk REF | Nota |
|---|---|---|---|
| `insecto_plaga` | `null` | IP102 · iNaturalist | Canónica raíz |
| `pulgon` | `insecto_plaga` | IP102 | — |
| `escarabajo` | `insecto_plaga` | IP102 | — |
| `mariposa_plaga` | `insecto_plaga` | IP102 | — |
| `hongo` | `null` | PlantVillage · IP102 | — |
| `maleza` | `null` | IP102 · iNaturalist | — |
| `roedor` | `null` | iNaturalist | — |
| `nematodo` | `null` | IP102 | Microscópico; `DISENO` y sin captura T0 |

## 3.4 INFRAESTRUCTURA

| `class_id` | `parent_id` | Crosswalk REF | Nota |
|---|---|---|---|
| `invernadero` | `null` | — | **Ejemplo correcto** de la misión |
| `tanque` | `null` | — | — |
| `tubería` | `null` | — | — |
| `cerca` | `null` | — | — |
| `silo` | `null` | — | — |
| `panel_solar` | `null` | — | — |
| `compuerta` | `null` | — | — |
| `malla_rota` | `invernadero` | — | Subclase de daño, no clase compuesta |

## 3.5 MAQUINARIA

| `class_id` | `parent_id` | Crosswalk REF | Nota |
|---|---|---|---|
| `tractor` | `null` | iNaturalist (no cubre) | **Ejemplo correcto** |
| `bomba` | `null` | — | — |
| `motor` | `null` | — | Cruza con audio `motor` por `event_id` |
| `banda` | `null` | — | — |
| `drone` | `null` | — | T0 visual: solocuadro, no vuelo autónomo |
| `tractor_activo` | `tractor` | — | Subclase por estado observado, no por contexto |

## 3.6 GANADO

| `class_id` | `parent_id` | Crosswalk REF | Nota |
|---|---|---|---|
| `bovino` | `null` | iNaturalist | Ganadería |
| `porcino` | `null` | iNaturalist | Porcicultura |
| `ave` | `null` | iNaturalist | Avicultura |
| `gallina` | `ave` | iNaturalist | **Ejemplo correcto** |
| `abeja` | `null` | iNaturalist | Apicultura; cruza con audio `abejas` |
| `pez` | `null` | iNaturalist | Acuicultura |
| `bovino_paciendo` | `bovino` | iNaturalist | Subclase por comportamiento |

> **Regla GAN-1:** `abeja` (imagen) y `abejas` (audio v2) son el mismo concepto cruzado por `event_id`, **no dos taxonomías competitivas** (VTX-6 del Masterplan).

## 3.7 PERSONAS

| `class_id` | `parent_id` | Estado | Nota |
|---|---|---|---|
| `operario` | `null` | `DISENO` | Requiere `consent_id` |
| `visitante` | `null` | `DISENO` | Requiere `consent_id` |
| `rostro` | `operario` | `DISENO` | Solo con consentimiento **explícito**; redactado en reportes |

**Regla PER-1:** prohibido el reconocimiento biométrico, la inferencia de identidad y el etiquetado de menores sin consentimiento legal. Sin `consent_id`, el bloque se omite y el veredicto es `PARTIAL` (VG-8, ACP-6).

## 3.8 FENOMENOS_CLIMATICOS

| `class_id` | `parent_id` | Crosswalk REF | Nota |
|---|---|---|---|
| `lluvia_visual` | `null` | — | Cruza con audio `lluvia` y telemetría `lluvia_mm` |
| `granizo` | `null` | — | — |
| `niebla` | `null` | — | — |
| `humo` | `null` | — | — |
| `incendio` | `null` | — | — |
| `inundacion` | `null` | — | — |
| `viento_visual` | `null` | — | Cruza con audio `viento` |

## 3.9 ANOMALIAS

| `class_id` | `parent_id` | Nota |
|---|---|---|
| `rotura` | `null` | Evento conocido de daño |
| `fuga` | `null` | — |
| `candado_forzado` | `null` | — |
| `equipo_danado` | `null` | — |

## 3.10 OOD

| `class_id` | `parent_id` | `is_ood_bucket` | `dir_name` | Estado |
|---|---|---|---|---|
| `evento_visual_desconocido` | `null` | `true` | `desconocido_visual` | **`DISENO` — NO creada** |

> No se captura a demanda. No explica contenido. No sube confianza. Contrato completo en `VISION_OOD_POLICY_V1.md`.

---

# 4. `scene_id` canónico

| `scene_id` | Significado | Alias de lectura | Dominios típicos |
|---|---|---|---|
| `scene_paisaje_rural` | Campo abierto, parcela, pastura | — | CULTIVOS · GANADO · FORESTAL |
| `scene_invernadero` | Invernadero o casa de malla | — | CULTIVOS · ENFERMEDADES · INFRAESTRUCTURA |
| `scene_cultivo` | Cultivo sembrado | — | CULTIVOS · PLAGAS |
| `scene_granja` | Granja o corral | `corral` (Masterplan §6) | GANADO · PORCICULTURA · AVICULTURA |
| `scene_porqueriza` | Nave porcina | — | GANADO |
| `scene_estanque` | Estanque / piscicultura | — | GANADO · FENOMENOS |
| `scene_bosque` | Forestal, sendero, montaña | — | FORESTAL |
| `scene_entorno_urbano` | Calle, infraestructura urbana | `calle` (Masterplan §6) | INFRAESTRUCTURA · PERSONAS |

> Los 8 valores de la misión son canónicos. Los alias `corral` y `calle` preservan los ejemplos del Masterplan sin crear duplicados (SCN-1). `paisaje rural` **nunca** es `class_id` (SCN-2).

---

# 5. Jerarquía, alias y anti-pérdida

| ID | Regla |
|---|---|
| TAX-1 | Profundidad máxima **1** (`parent_id` → canónica raíz). Coherente con audio v2. |
| TAX-2 | Una subclase **nunca sustituye** a su padre. `gallina` no borra `ave`; `hoja_manchada` no borra `hoja`. |
| TAX-3 | El padre es siempre etiqueta válida y nivel de agregación de evaluación. |
| TAX-4 | Ante duda entre hermanas, se etiqueta al **padre** (LP-4 de audio, generalizado). |
| TAX-5 | Un `class_id` no se renombra: se declara `alias_of`. Los alias sirven para **leer** pasado, no para etiquetar nuevo. |
| TAX-6 | Una clase nueva nace `DISENO` con 0 activos. `REAL` exige evidencia y gates. |
| TAX-7 | Toda aprobación de esta taxonomía requiere misión de gobernanza explícita. |

---

# 6. No crear clases combinadas (regla dura)

## 6.1 Ejemplos correctos e incorrectos

| ✅ Correcto | ❌ Incorrecto | Forma gobernada |
|---|---|---|
| `tomate` | `tomate_con_plaga` | `class_id=tomate` + `bbox_` con `class_id=insecto_plaga` |
| `hoja` | `hoja_enferma_con_insecto` | `class_id=hoja` + dos `bbox_` separadas |
| `tractor` | `tractor_bajo_lluvia` | `class_id=tractor` + `event_id` de lluvia / telemetría |
| `abeja` | `abeja_sobre_flor_roja` | `class_id=abeja` + `scene_id=scene_cultivo` + nota |
| `persona` | `persona_con_maquinaria` | `class_id=persona` + `class_id=tractor` en otra caja |
| `invernadero` | `invernadero_con_goteo` | `scene_id=scene_invernadero` + `class_id` separado |
| `gallina` | `gallina_en_corral_con_maiz` | `class_id=gallina` + `scene_id=scene_granja` + `class_id=maiz` |
| `maiz` | `maiz_con_manchas` | `class_id=maiz` + `bbox_` de `sintoma_foliar` |

## 6.2 Reglas de validación

| ID | Regla |
|---|---|
| NC-1 | Prohibidos los sufijos `_con_`, `_bajo_`, `_en_`, `_y_` en `class_id`. |
| NC-2 | Un `annotation_id` espacial lleva un solo `class_id`. Dos objetos ⇒ dos IDs. |
| NC-3 | La concurrencia va en `secondary_classes` y en `event_id`. |
| NC-4 | El contexto va en `scene_id`; la condición ambiental en telemetría. |
| NC-5 | Una clase compuesta detectada en validación se **rechaza**, no se reescribe (VG-7). |

---

# 7. Crosswalk de fuentes externas

| Fuente | Mapeo | Uso gobernado | Estado |
|---|---|---|---|
| **PlantVillage** | `plant_disease` → `class_id` visual (ej. `mildiu`, `tomate`) + `scene_cultivo` | Bootstrap `REF`; nunca verdad de campo | `REF` |
| **PlantDoc** | Igual, conservando `original_id` y condición de campo | Dominio real / análisis de desplazamiento | `REF` |
| **IP102** | Nivel jerárquico → `parent_id` (ej. `pulgon` → `insecto_plaga`) | Clases finas con agregación por padre | `REF` |
| **iNaturalist** | Taxón → `class_id` / `event_type`; foto → `image_`; hábitat → `scene_id` | Biodiversidad, aves, insectos; licencia por observación | `REF` |
| **Propias SIGCT-Rural** | Audio v1 + 22.488 imágenes agrícolas según inventario | Única evaluación propia | `REAL-LOCAL` / `REF` según evidencia |

> El mapeo completo a `observation_id` está en `VISION_GOVERNANCE_V1.md` §4. Ninguna fuente se descarga aquí.

---

# 8. Gates de la taxonomía

| Gate | Condición | Estado |
|---|---|---|
| **G-VT-1** | 10 dominios ratificados | `DISENO` |
| **G-VT-2** | 8 `scene_id` con alias reconciliados | `DISENO` |
| **G-VT-3** | Regla NC-1 verificada en fixtures | `DISENO` |
| **G-VT-4** | Crosswalk de 4 fuentes verificado con licencia | `DISENO` |
| **G-VT-5** | Clase nueva nace con 0 activos | `DISENO` |
| **G-VT-6** | Sentinela OOD aprobada por misión | `DISENO` |

---

# 9. Cierre

Esta taxonomía da vocabulario oficial sin crear una sola etiqueta ejecutable: 10 dominios, jerarquía de profundidad 1, 8 escenas, alias anti-pérdida y una prohibición dura de clases compuestas.

**Estado honesto:** **`DISENO`**, 0 activos, sin `labels.csv` de imagen, sin descargas, sin modelos, sin IA. No modifica `OBSERVATION_ID` ni la taxonomía acústica v2.

---

*Fin de la taxonomía visual. Complementa —nunca sustituye— la gobernanza visual V1 y el Masterplan V1.*
