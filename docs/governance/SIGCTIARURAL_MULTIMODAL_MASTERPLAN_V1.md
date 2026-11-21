# PLAN MAESTRO DEL ECOSISTEMA MULTIMODAL — SIGCT-RURAL V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T19:00:39-05:00
> - Origen: misión `SIGCTIARURAL_MULTIMODAL_ECOSYSTEM_MASTERPLAN_V1` (documento nuevo)
> - Destino: `docs/governance/SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: arquitectura operativa de ecosistema. No crea código, modelos, datasets ni hardware.

**Misión:** `SIGCTIARURAL_MULTIMODAL_ECOSYSTEM_MASTERPLAN_V1`
**Naturaleza:** arquitectura maestra **declarativa**. Define cómo se captura, se identifica, se gobierna y se consume la evidencia digital rural durante **10 años** sin refactorizar la identidad central.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Estado:** **OFICIAL — DISEÑADO**. Los gates se definen, no se cierran. Ninguna fase autoriza implementación por sí misma.
**Documentos base:** `docs/governance/SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1.md` · `docs/governance/multimodal_entity_model_v1.md` · `docs/acoustic/*` · Constitución V1.0.1 · Carta de Gobernanza IA V1.0.1 · D-003.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante de honestidad:** los **7 estados canónicos** (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`) no se amplían. El estado nunca mejora por captura, agregación, modelo o navegación.

---

# 0. Regla de oro: no es otro sistema de audio

Este masterplan **no** propone un nuevo sistema de captura de audio. El audio ya está gobernado y operativo (Acoustic Governance V2, captura rápida, captura experta, bridge, 7 muestras reales). Lo que se diseña aquí es el **ecosistema de evidencia digital rural**: una forma única de producir, identificar, curar, gobernar y consumir evidencia, en la que el audio es **una modalidad más** y nunca el centro.

**Frase rectora:** *una observación es una afirmación verificable sobre el mundo rural, con procedencia, estado y anclas; las modalidades son solo formas de registrar esa afirmación.*

## 0.1 Restricción dura de hardware

> **TODO MVP DEBE FUNCIONAR CON: laptop · webcam integrada · micrófono integrado · navegador · celular. EL HARDWARE ESPECIALIZADO SERÁ ADITIVO, NUNCA OBLIGATORIO.**

Esto se formaliza en cuatro capas de captura:

| Capa | Nombre | Dispositivo | Naturaleza |
|---|---|---|---|
| **T0** | **Base obligatoria** | Laptop o celular + micrófono y webcam integrados + navegador | **Todo MVP debe ser satisfacible aquí.** Ningún gate depende de T1–T3. |
| **T1** | Sensores estándar del dispositivo | Celular: luz ambiental, IMU, GPS, barómetro | Aditivo, sin compra de hardware |
| **T2** | Fuentes por red | Open-Meteo / clima externo, registros públicos | `REF`, nunca evaluación propia |
| **T3** | Hardware especializado | BBB, ESP32, SDR, estación meteorológica, colmena instrumentada, drones | **Aditivo.** Entra por el cauce de 5 pasos; nunca es prerrequisito |

**Regla de no bloqueo (MP-0):** si una capacidad solo funciona en T3, se declara `DISENO`/opcional y **no bloquea** el MVP. Si un dominio no puede observarse en T0, el dominio no está cubierto.

## 0.2 Lo que este masterplan NO es

- No es código, ni implementación, ni creación de modelos ML/DL/LLM.
- No es un nuevo dashboard IoT (P-9), ni un LMS (P-8), ni una plataforma de un proveedor (P-6).
- No crea datasets nuevos, ni descarga fuentes externas, ni escribe en el Knowledge Hub.
- No modifica audio actual, `taxonomy_v2`, `rules-v0`, dataset v1, captura rápida ni captura experta.
- No sustituye la gobernanza multimodal V1: la **operacionaliza**.

---

# 1. Hechos verificados (base honesta)

| Hecho | Estado | Implicación para el masterplan |
|---|---|---|
| Acoustic Governance V2 promovida (`1685794`) | ✅ Real | No se rehace; se reutiliza como especialización de audio |
| `OBSERVATION_ID` · `ASSET_ID` · `EVENT_ID` definidos | ✅ Gobernanza V1 | Se ratifican; no se renombran (§3) |
| Dataset acústico con 7 muestras | ✅ Real, limitado | Escala actual = 7; el plan apunta a 100.000 |
| Captura rápida / experta + bridge | ✅ Operativos | Son los primeros productores T0 reales |
| `schema.json` 1.3.0, 42 columnas, `secondary_classes` | ✅ Real | Audio no se reescribe; se envuelve |
| Taxonomía visual / telemetría canónica en `docs/` | ❌ No existe | Se **diseñan** aquí (§6, §7), estado `DISENO` |
| Observation Registry, Ledger, ACP operativos | ❌ `DISENO` | Se definen como contratos futuros, no se afirma que funcionen |
| KH real | ✅ 51 documentos, 6 categorías | `docsByObservation` se deriva por lectura; sin doble escritura |
| M1 baseline / M2 challenger | ✅ Cerrados | No se promueve nada; sirven de patrón de gobernanza de modelos |

---

# 2. Principios del masterplan

| ID | Principio | Consecuencia |
|---|---|---|
| **MP-1** | **Ecosistema, no módulo** | Toda modalidad entra por el mismo cauce de identidad, estado y curación. |
| **MP-2** | **Observación como átomo inmutable** | `OBSERVATION_ID` es la raíz de evidencia; nunca se refactoriza (§3). |
| **MP-3** | **T0 primero** | Ningún MVP, gate ni métrica exige hardware especializado. |
| **MP-4** | **Paridad de modalidad** | Audio, imagen, video y telemetría comparten reglas de ID, OOD y curación. |
| **MP-5** | **Aditividad extrema** | Cada cambio añade una versión, una clase o un asset; nunca reescribe. |
| **MP-6** | **Estado honesto** | 7 estados intactos; la evidencia hereda, nunca mejora. |
| **MP-7** | **Evento une, no fusiona** | `event_id` cruza modalidades sin crear clases combinadas. |
| **MP-8** | **Fuente única, vistas derivadas** | Registry y `docsByObservation` se leen; no se escriben en dos sitios. |
| **MP-9** | **Externo es `REF`** | Ningún clip, imagen o lectura externa entra en evaluación propia. |
| **MP-10** | **Modelo es herramienta** | ML, DL y LLM interpretan; no deciden gobernanza ni son verdad (Carta IA). |
| **MP-11** | **Personas con consentimiento** | Toda observación con personas declara consentimiento y sin reconocimiento biométrico. |
| **MP-12** | **Privacidad por diseño** | Redacción de PII antes de cualquier modelo o reporte. |
| **MP-13** | **Preservación a 10 años** | Formatos abiertos, huellas, versiones hermanas, sin dependencia de proveedor. |
| **MP-14** | **Sin misión, sin ejecución** | Este documento habilita; no autoriza código, ingestas ni entrenamientos. |

---

# 3. RESPUESTA 1 — ¿Cuál es la entidad central?

## 3.1 Veredicto

> **SÍ. `OBSERVATION_ID` DEBE MANTENERSE COMO RAÍZ INMUTABLE.**

No existe alternativa que resista 10 años sin refactorización:

| Candidato a raíz | Por qué falla |
|---|---|
| `sample_id` | Está atado al dataset v1 y al audio; no resiste la incorporación de imagen/telemetría. |
| `asset_id` (archivo) | Cambia cada vez que se cura un archivo o cambia el formato. |
| `event_id` | Es una interpretación; un evento puede reubicarse y agrupar muchas observaciones. |
| `model_id` | Cambia con cada reentrenamiento; además, el modelo es herramienta, no evidencia. |
| `doc_id` | Vive en el KH registry y es gestionado por gobernanza documental (D-003). |
| **`observation_id`** | **Es el único que nace con el acto de observar y no depende de nada de lo posterior.** |

**Precisiones necesarias:**

1. `OBSERVATION_ID` es la raíz de **evidencia**, no la raíz de **todas** las entidades. `MODEL_ID` y `REPORT_ID` pueden existir de forma independiente, pero **siempre referencian observaciones** y nunca las sustituyen como ancla.
2. El formato actual (`obs_<YYYYMMDD>_<session_id>_<seq4>`) se **congela gramaticalmente**. Los consumidores **no pueden parsearlo** para extraer significado (OBS-10): los componentes son metadatos de procedencia, no semántica. Eso permite cambiar el formato en el futuro sin refactorizar a quienes lo usan.
3. La asignación la hace **una única autoridad de registro**. Un cliente nunca genera IDs por su cuenta (OBS-11): en T0 con conectividad limitada se reservan bloques de secuencia con sincronización diferida, sin colisiones.

## 3.2 Contrato de estabilidad a 10 años

| ID | Invariante |
|---|---|
| **OBS-10** | El ID es **opaco para el consumidor**: ningún código, prompt, reporte ni índice lo descompone. |
| **OBS-11** | Lo asigna una autoridad de registro única; nunca se genera en el dispositivo de forma aislada. |
| **OBS-12** | El ID **no codifica** modalidad, taxonomía, versión, hardware, modelo, país ni organización. |
| **OBS-13** | El ID sobrevive a migración de almacenamiento, importación/exportación, cambio de proveedor y cambio de esquema. |
| **OBS-14** | Toda corrección crea una nueva versión **sin cambiar el ID**; el ID es el hilo de la historia. |

## 3.3 Qué puede cambiar y qué no

| Puede cambiar (aditivamente) | No puede cambiar |
|---|---|
| Taxonomía de audio, imagen, telemetría | El valor de `observation_id` |
| Esquema de metadata (con bump) | La semántica de "una observación = un acto de observar" |
| Modalidades disponibles | La obligatoriedad de procedencia (quién / cuándo / dónde / cómo) |
| Modelos ML/DL/LLM y sus proveedores | Los 7 estados canónicos |
| Almacenamiento, formatos derivados, compresión | La regla de no reescritura |
| Versión de gobernanza | El ancla de ACP y KH: siempre `observation_id` |

## 3.4 Prueba de los 10 años

| Escenario de cambio | ¿Cambia `observation_id`? | Mecanismo |
|---|---|---|
| Audio v1 → v2 → v3 | No | `legacy_sample_id`, taxonomía como metadata (OB-2) |
| aparece imagen y video | No | Nuevos `asset_id` colgados del mismo ID |
| aparece telemetría T3 | No | Nuevo `telemetry_id`; T0 sigue válido |
| se cambia el proveedor de LLM | No | `model_id` del LLM es un campo, no el ancla |
| se cambia el esquema de 42 columnas | No | `schema_version` + bump; versión hermana |
| se migra el almacenamiento | No | IDs + huellas en manifiestos; sin foreign keys físicas |
| se corrige una etiqueta | No | `annotation_id` nuevo con `supersedes` |
| se cambia de organización o país | No | `place_id` es metadata; el ID es opaco (OBS-12) |

**Conclusión:** el criterio de éxito —*10 años sin refactorizar `observation_id`*— se satisface porque la identidad está **desacoplada de toda variable que cambia**.

---

# 4. RESPUESTA 2 — ¿Cómo se captura evidencia sin hardware especializado?

## 4.1 Matriz de captura T0

| Modalidad | Dispositivo | Mecanismo declarado (sin implementar) | Calidad mínima | Estado |
|---|---|---|---|---|
| **Audio** | Micrófono integrado (laptop/celular) | API de audio del navegador → PCM → WAV mono | Duración, tasa, canales, umbral de recorte; AC-1..AC-10 vigentes | **Operativo** (S30 / captura rápida) |
| **Imagen** | Webcam integrada / cámara de celular | API de cámara del navegador → captura de cuadro | Resolución declarada, foco, exposición, `sha256`, EXIF saneado | `DISENO` |
| **Video** | Webcam integrada / cámara de celular | Grabación del navegador → contenedor + cuadros derivados | fps, duración, códec, `keyframes`, audio track opcional | `DISENO` |
| **Telemetría T0** | Ningún sensor externo | Entrada guiada + lectura manual asistida por foto del display del medidor | `metric_id`, unidad, precisión, dispositivo declarado | `DISENO` |
| **Telemetría T1** | Sensores del celular | Luz ambiental, IMU, GPS, barómetro (si el dispositivo los expone) | Unidad SI, marca de tiempo, disponibilidad declarada | `DISENO` |
| **Telemetría T2** | Red | Open-Meteo / fuente pública, etiquetada `clima-externo` | `source_id`, timestamp, licencia, `REF` | `DISENO` |
| **Anotación** | Navegador | Formulario con doble anotación y `supersedes` | Acuerdo como categoría; κ `PENDING` | Parcial (audio v2) |

> **Telemetría sin sensor no es simulación.** La lectura manual declarada es evidencia `REAL-LOCAL` con `source=manual` y el instrumento identificado. Lo prohibido es inventar el valor o poner `0` cuando no se midió (§7, TEL-3).

## 4.2 Modos de captura

| Modo | Descripción | Rubro | Estado |
|---|---|---|---|
| **Rápida** | Una toma, metadatos mínimos obligatorios, QC inmediato | T0 | **Operativo** (audio) |
| **Experta** | Protocolo guiado,.place, sesión, anotador, doble revisión | T0 | **Operativo** (audio) |
| **Continua** | Video + muestreo de telemetría en ventana temporal | T0/T1 | `DISENO` |
| **Pasiva / importación** | Fuente externa o dataset histórico | T2 | `DISENO` (capa `REF`) |

## 4.3 Reglas de captura

| ID | Regla |
|---|---|
| CAP-1 | Toda captura crea **una observación** y al menos un asset; la observación puede ser monomodal. |
| CAP-2 | Ninguna observación se rechaza por **falta** de telemetría, imagen o video. La multimodalidad es opcional. |
| CAP-3 | Todo asset declara `sha256`, `captured_at`, `timezone`, `source_tier` (T0..T3) y `state`. |
| CAP-4 | Contenido con personas exige `consent_id` y activa redacción de PII (MP-11/MP-12). |
| CAP-5 | Los sensores T1/T3 se declaran; si no están disponibles, se reporta `NO_DATA`, nunca un valor inventado. |
| CAP-6 | La captura T0 funciona **sin conexión**: se guarda localmente y se sincroniza después con la autoridad de IDs (OBS-11). |
| CAP-7 | El hardware especializado se registra por el cauce de 5 pasos (identificar → clasificar → etiquetar → conectar → registrar); jamás sustituye a T0. |

---

# 5. RESPUESTA 3 — Identificadores operativos

## 5.1 Catálogo completo

| ID | Prefijo | Rol | Estado |
|---|---|---|---|
| `observation_id` | `obs_` | Raíz de evidencia | **Ratificado** (§3) |
| `asset_id` | `audio_` · `image_` · `video_` · `telemetry_` | Activo concreto | **Ratificado** + 3 nuevos |
| `event_id` | `evt_` | Ocurrencia real | **Ratificado** |
| `annotation_id` | `ann_` | Anotación / curación de etiqueta | **Ratificado** |
| `evidence_id` | `ev_` | Registro en Evidence Ledger | **Declarado** |
| `model_id` | `model_ml_` · `model_dl_` · `model_llm_` | Definición + pesos del modelo | **Nuevo, `DISENO`** |
| `model_run_id` | `run_` | Ejecución concreta (entrenamiento o inferencia) | **Nuevo, `DISENO`** |
| `prediction_id` | `pred_` | Salida de un modelo | **Nuevo, `DISENO`** |
| `report_id` | `report_` | Informe, respuesta del ACP o veredicto | **Nuevo, `DISENO`** |
| `doc_id` | `doc_` | Referencia al registry del KH | **Declarado** (nunca copia) |
| `legacy_sample_id` | — | Envoltura de filas v1 | **Declarado** |

## 5.2 Definición de los cinco IDs solicitados

### `IMAGE_ID` — `image_<YYYYMMDD>_<HHmmss>_<seq3>`

| Campo | Obligación | Nota |
|---|---|---|
| `asset_id` · `observation_id` | OBLIGATORIA | Pertenencia |
| `sha256` · `mime_type` · `width` · `height` | OBLIGATORIAS | Integridad y forma |
| `capture_source` · `source_tier` | OBLIGATORIAS | T0..T3 |
| `exif_policy` | OBLIGATORIA | Se sanea por defecto: GPS y dispositivo se guardan como metadata gobernada, no incrustados |
| `derived_from` | OPCIONAL | Si es cuadro extraído de video, apunta a `video_id` |
| `consent_id` · `pii_redacted` | CONDICIONAL | Obligatorios si hay personas |
| `state` · `license` · `governance_version` | OBLIGATORIAS | Honestidad y procedencia |

### `VIDEO_ID` — `video_<YYYYMMDD>_<HHmmss>_<seq3>`

| Campo | Obligación | Nota |
|---|---|---|
| `container` · `codec` · `fps` · `duration_s` · `resolution` | OBLIGATORIAS | Formato abierto preferido |
| `keyframes[]` | OBLIGATORIA | Puntos de derivación de cuadros |
| `audio_track_id` | OPCIONAL | Si existe, es un `audio_` asset enlazado, no bytes duplicados |
| `frame_ids[]` | DERIVADO | Cuadros `image_` con `derived_from=video_id`; se materializan solo cuando se consumen |
| `state` · `sha256` · `observation_id` | OBLIGATORIAS | Igual que cualquier asset |

**Regla VID-1:** el video es un **contenedor de assets**, no una clase nueva. Ningún cuadro se convierte en observación distinta; pertenece a la misma `observation_id`.

### `TELEMETRY_ID` — `telemetry_<YYYYMMDD>_<stream>_<seq>`

| Campo | Obligación | Nota |
|---|---|---|
| `metric_id` · `value` · `unit` | OBLIGATORIAS | Unidad canónica SI (§7) |
| `precision` · `sampling_rate` · `window_s` | OBLIGATORIAS | Una lectura o una ventana |
| `sensor_source` · `source_tier` | OBLIGATORIAS | `manual` · `device` · `external` · `legacy` |
| `calibration_id` | CONDICIONAL | Obligatoria en T3; `N/A` declarado en T0 manual |
| `quality_flag` | OBLIGATORIA | `ok` · `suspect` · `NO_DATA` — **`NO_DATA` nunca es 0** |
| `state` | OBLIGATORIA | `REAL` · `REAL-LOCAL` · `REF` · `SIM` · `ROTO` |

### `MODEL_ID` — `model_<familia>_<nombre>_<v>`

| Campo | Obligación | Nota |
|---|---|---|
| `family` | OBLIGATORIA | `ml` · `dl` · `llm` — todos son herramientas (MP-10) |
| `architecture` · `weights_sha256` · `tool_version` | OBLIGATORIAS | Sin huella, el modelo no es reproducible |
| `governance_version` · `input_taxonomy_versions[]` | OBLIGATORIAS | Declara bajo qué vocabulario se entrenó |
| `role` | OBLIGATORIA | `classifier` · `detector` · `embedder` · `explainer` · `redactor` |
| `promotion_status` | OBLIGATORIA | `baseline` · `challenger` · `rejected` · `DISENO` — **la IA no decide esto** |

**Distinción crítica:** `MODEL_ID` es la definición; `MODEL_RUN_ID` es la corrida; `PREDICTION_ID` es la salida; `REPORT_ID` es el relato gobernado. Mezclarlos es el error que el cierre M1/M2 evitó.

### `REPORT_ID` — `report_<YYYYMMDD>_<slug>`

| Campo | Obligación | Nota |
|---|---|---|
| `generated_by` | OBLIGATORIA | `acp` · `model_run` · `humano` · `pipeline` |
| `input_observation_ids[]` | OBLIGATORIA | **A nivel de observación, nunca de sample** (§9) |
| `evidence_ids[]` · `doc_ids[]` | OBLIGATORIAS | Anclas derivadas por lectura |
| `verdict` | OBLIGATORIA | `RESOLVED` · `PARTIAL` · `NO_DATA` · `BLOCKED` · `UNANSWERABLE` |
| `state` · `confidence` | OBLIGATORIAS | 7 estados + confianza ortogonal |
| `model_id` · `prompt_template_version` | CONDICIONALES | Si intervino un LLM |
| `promotion_status` | OBLIGATORIA | `informe` · `evidencia` · `documento_canónico` (por gobernanza) |

**Regla RP-1:** un reporte **no es conocimiento verificado** por existir. Solo pasa a documento canónico por promoción gobernada (Hangar de Autenticidad, F3E).

---

# 6. RESPUESTA 4 — Taxonomía visual oficial

> **Estado: `DISENO`.** Se diseña el vocabulario; **no se crea `labels.csv` de imagen**, no se etiquetan imágenes y no se generan datasets. Toda clase nace con 0 activos.

## 6.1 Ejes ortogonales

| Eje | Campo | Valores | Función |
|---|---|---|---|
| A · Dominio | `visual_domain_id` | `CULTIVOS` · `INFRAESTRUCTURA` · `MAQUINARIA` · `GANADO` · `PLAGAS` · `PERSONAS` · `FENOMENOS` · `ANOMALIAS` · `UNIVERSAL` · `OOD` | Agrupa. Nunca es `class_id`. |
| B · Clase | `class_id` | Canónica raíz o subclase | Etiqueta primaria; monoetiqueta por cuadro |
| C · Jerarquía | `parent_id` | `null` o canónica raíz | Plegado; profundidad máxima 1 (coherente con audio v2) |
| D · Escena | `scene_id` | `paisaje_rural` · `invernadero` · `corral` · `estanque` · `bosque` · `calle` | Contexto, **nunca** `class_id` (decisión H3 D4) |
| E · Concurrencia | `secondary_classes` | CSV ya existente | Eventos universales simultáneos, sin clases combinadas |

## 6.2 Árbol propuesto por dominio

| Dominio | Canónicas raíz (propuestas) | Subclases (propuestas) | Crosswalk / nota |
|---|---|---|---|
| **CULTIVOS** | `planta` · `hoja` · `fruto` · `flor` · `suelo` | `hoja_manchada` · `fruto_dañado` · `planta_marchita` | PlantVillage / PlantDoc (REF) |
| **INFRAESTRUCTURA** | `invernadero` · `tanque` · `tubería` · `cerca` · `silo` · `panel_solar` · `compuerta` | `malla_rota` · `goteo_activo` | Invernaderos, riego |
| **MAQUINARIA** | `tractor` · `bomba` · `motor` · `banda` · `drone` | `tractor_activo` · `bomba_anomala` | Se cruza con audio `motor` mediante `event_id` |
| **GANADO** | `bovino` · `porcino` · `ave` · `abeja` · `pez` | `bovino_paciendo` · `cerdo` · `pollo` · `abeja_en_flor` · `pez_superficie` | Ganadería · porcicultura · avicultura · apicultura · acuicultura |
| **PLAGAS** | `insecto_plaga` · `hongo` · `maleza` · `roedor` · `nematodo` | `pulgon` · `escarabajo` · `mildiou` | IP102 (jerarquía → `parent_id`) |
| **PERSONAS** | `operario` · `visitante` | `rostro` **(solo con consentimiento)** | Sin reconocimiento biométrico (VTX-9) |
| **FENOMENOS** | `lluvia_visual` · `granizo` · `niebla` · `humo` · `incendio` · `inundacion` · `viento_visual` | — | Se cruzan con audio y telemetría por `event_id` |
| **ANOMALIAS** | `rotura` · `fuga` · `candado_forzado` | — | Eventos **conocidos** anómalos (distintos de OOD) |
| **OOD** | `evento_visual_desconocido` *(alias propuesto)* | — | Nunca se captura a demanda |

## 6.3 Reglas

| ID | Regla |
|---|---|
| VTX-1 | Un cuadro tiene **exactamente un** `class_id`; la concurrencia va en `secondary_classes`. |
| VTX-2 | Profundidad máxima 1; el padre sigue siendo etiqueta válida y nivel de agregación. |
| VTX-3 | Nunca se renombra una clase: se usa `alias_of`. Los alias de fuentes externas conservan `original_label`. |
| VTX-4 | `paisaje rural` es `scene_id`, jamás `class_id`. |
| VTX-5 | No existen clases combinadas (`tractor_con_lluvia`): se separan en `class_id` + `secondary_classes` + `event_id`. |
| VTX-6 | `abeja` en imagen y `abejas` en audio son **el mismo concepto** cruzado por `event_id`, no dos taxonomías competitivas. |
| VTX-7 | Las fuentes externas entran `REF`, con licencia por activo y `ND` excluido. |
| VTX-8 | Clase nueva nace `DISENO` con 0 activos; `REAL` requiere evidencia y gates. |
| VTX-9 | En `PERSONAS`: consentimiento obligatorio, sin identificación biométrica, sin inferencia de identidad, redacción de rostro por defecto en reportes. |
| VTX-10 | Los eventos OOD requieren nota y no suben confianza (MG-OOD-3). |
| VTX-11 | La taxonomía visual es **independiente** de la de audio: compartir `event_id` no compartir `class_id`. |
| VTX-12 | Toda aprobación de esta taxonomía requiere misión de gobernanza explícita; este documento solo la propone. |

---

# 7. RESPUESTA 5 — Taxonomía de telemetría

> **Estado: `DISENO`.** No se crean streams, no se calibran sensores y no se inventan lecturas.

## 7.1 Ejes

| Eje | Campo | Valores |
|---|---|---|
| Dominio | `telemetry_domain_id` | `AMBIENTAL` · `SUELO` · `AGUA` · `INFRAESTRUCTURA` · `MAQUINARIA` · `BIOLOGICO` · `DISPOSITIVO` · `EXTERNO` |
| Métrica | `metric_id` | Token canónico snake_case de la tabla §7.2 |
| Fuente | `source_tier` | `T0` manual · `T1` dispositivo · `T2` externa · `T3` especializada |
| Calidad | `quality_flag` | `ok` · `suspect` · `NO_DATA` |

## 7.2 Métricas canónicas

| `metric_id` | Unidad SI | Rango de plausibilidad | Tier típico | Dominio |
|---|---|---|---|---|
| `temperatura_ambiente` | °C | −40 .. 80 | T0/T1/T2/T3 | AMBIENTAL |
| `humedad_relativa` | % | 0 .. 100 | T1/T2/T3 | AMBIENTAL |
| `luminosidad` | lux | 0 .. 200000 | T1/T3 | AMBIENTAL |
| `lluvia_mm` | mm/h | 0 .. 500 | T2/T3 | AMBIENTAL |
| `presion_atmosferica` | hPa | 800 .. 1100 | T1/T2/T3 | AMBIENTAL |
| `viento_velocidad` | m/s | 0 .. 100 | T2/T3 | AMBIENTAL |
| `radiacion_uv` | índice | 0 .. 15 | T3 | AMBIENTAL |
| `co2` | ppm | 300 .. 5000 | T3 | AMBIENTAL |
| `ph` | pH | 0 .. 14 | T0 manual / T3 | SUELO · AGUA |
| `conductividad` | µS/cm | 0 .. 100000 | T0 manual / T3 | SUELO · AGUA |
| `humedad_suelo` | % | 0 .. 100 | T3 | SUELO |
| `temperatura_suelo` | °C | −10 .. 60 | T3 | SUELO |
| `nivel_agua` | cm | 0 .. 1000 | T0 manual / T3 | AGUA |
| `temperatura_agua` | °C | 0 .. 50 | T0 manual / T3 | AGUA |
| `oxigeno_disuelto` | mg/L | 0 .. 20 | T3 | AGUA |
| `turbidez` | NTU | 0 .. 1000 | T3 | AGUA |
| `caudal` | L/s | 0 .. 1000 | T3 | AGUA · INFRAESTRUCTURA |
| `peso_colmena` | kg | 0 .. 200 | T3 (aditivo) | BIOLOGICO |
| `actividad_vuelo` | conteo/ventana | 0 .. 100000 | T0 visual / T3 | BIOLOGICO |
| `corriente` | A | 0 .. 100 | T3 | MAQUINARIA |
| `voltaje` | V | 0 .. 500 | T3 | MAQUINARIA |
| `bateria` | % | 0 .. 100 | T1/T3 | DISPOSITIVO |
| `movimiento` | m/s² | −20 .. 20 | T1 | DISPOSITIVO |
| `posicion` | lat/lon | — | T1 | DISPOSITIVO |

## 7.3 Reglas

| ID | Regla |
|---|---|
| TEL-1 | Unidad **canónica SI**; si el instrumento usa otra, se declara conversión y se conserva el valor original. |
| TEL-2 | Rango de plausibilidad: fuera de rango ⇒ `suspect`, nunca descartado silenciosamente. |
| TEL-3 | **`NO_DATA` ≠ 0.** No medir se reporta como ausencia; `0` es un valor medido. |
| TEL-4 | Toda lectura lleva `captured_at` + `timezone` + `window_s`. |
| TEL-5 | `source_tier` y `sensor_source` son obligatorios; la lectura manual nombra el instrumento. |
| TEL-6 | `calibration_id` es obligatorio en T3; en T0 se declara `N/A` explícitamente. |
| TEL-7 | La fuente T2 es `REF` y se nombra `clima-externo`; jamás se usa como verdad de campo. |
| TEL-8 | La lectura simulada se etiqueta `SIM`; jamás se mezcla con `REAL` en el mismo split. |
| TEL-9 | Una métrica nueva entra por bump aditivo de `metric_id`; las anteriores no se renombran. |
| TEL-10 | La correlación con audio/imagen se hace por `event_id`, **no** solo por proximidad de timestamps (AL-3). |
| TEL-11 | La precisión declarada limita los decimales/reportes; no se inventa precisión aguas arriba. |
| TEL-12 | Ningún gate de V1 depende de una métrica T3: todas tienen alternativa T0/T1/T2 o son opcionales. |

---

# 8. RESPUESTA 6 — Relación entre observación, evento, asset, KH y ACP

```
   OBSERVATION_ID  (raíz inmutable)
        │ 1:N
        ▼
   ASSET_ID  ── audio_ / image_ / video_ / telemetry_
        │ 0:N (reconocimiento gobernado)
        ▼
   EVENT_ID  ◄── N:M ── otra OBSERVACIÓN (otra modalidad)
        │ deriva
        ▼
   EVIDENCE_ID  (Evidence Ledger — hereda estado)
        │
        ├──► MODEL_ID / MODEL_RUN_ID  ──► PREDICTION_ID
        │                                       │
        └───────────────────────────────────────┤
                                                ▼
                                        REPORT_ID  (ACP / veredicto)
                                                │
                    ┌───────────────────────────┴──────────────────────┐
                    ▼                                                  ▼
         KNOWLEDGE HUB registry                          docsByObservation
         doc_id por PROMOCIÓN gobernada                  (derivado por lectura)
                    │                                                  │
                    └──────────────────► ACP lee ◄──────────────────────┘
                                                │
                                                ▼
                          retroalimentación: nueva anotación / curación
                          (NUEVA versión, MISMO observation_id)
```

| Relación | Cardinalidad | Regla |
|---|---|---|
| Observación → Asset | 1 : 1..N | Toda observación tiene al menos un asset. |
| Observación → Evento | 1 : 0..N | Puede no reconocerse ninguno (OOD o sin anotar). |
| Evento → Observación | N : M | Une modalidades y sesiones; no fusiona etiquetas. |
| Observación → Evidencia | 1 : 0..N | Derivada; hereda estado, nunca lo mejora. |
| Evidencia → Modelo | N : M | Un modelo consume muchas evidencias; un `model_run_id` declara sus entradas. |
| Modelo → Predicción | 1 : N | Cada predicción referencia `input_observation_ids[]`. |
| Predicción → Reporte | 0..N | El ACP compone el reporte con anclas. |
| Reporte → KH | 0..1 | Solo por promoción gobernada; nunca escritura directa. |
| Documento → Observación | N : M derivado | `docsByObservation` se calcula; no se escribe en dos lados (MP-8). |

**Quién escribe qué:**

| Actor | Puede escribir | NO puede escribir |
|---|---|---|
| Productor gobernado (captura) | Observación, assets, metadata | Ledger, KH, taxonomía |
| Anotador | `annotation_id`, curación con `supersedes` | Estado de la observación, etiquetas ajenas |
| Modelo ML/DL | `prediction_id`, `model_run_id` | Gobernanza, KH, promoción |
| ACP | `report_id` con anclas | Ledger ni KH directo (C-5, F3E-9) |
| Humano (Bernardo) | Gates, promociones, taxonomía | — (es la autoridad de gobernanza) |

---

# 9. RESPUESTA 7 — Cómo un futuro LLM consumirá la información

> **Regla de oro:** el LLM **nunca consume samples aislados**. Consume **paquetes de observación** y redacta dentro de anclas. Es `IA-2` del slot intercambiable de la Carta IA: herramienta de lenguaje, no fuente de verdad.

## 9.1 `ObservationPackage` — unidad de dieta

Vista de lectura, inmutable, derivada de la observación. No es un nuevo registro ni una copia.

| Bloque | Contenido |
|---|---|
| Identidad | `observation_id` · `entity_model_version` · `governance_version` |
| Procedencia | `session_id` · `place_id` · `captured_at` · `timezone` · `operator_id` · `consent_id` |
| Honestidad | `state` (7 estados) · `confidence_declared` |
| Assets | Descriptores: `asset_id` · modalidad · `sha256` · `mime` · atributos técnicos · huellas de features. **No bytes crudos por defecto.** |
| Eventos | `event_id` + `event_type` + vocabulario declarado |
| Anotación | Etiqueta vigente + cadena `supersedes`; acuerdo como categoría (κ `PENDING`) |
| Evidencia | `evidence_id` · método · veredicto · estado heredado |
| Conocimiento | `doc_id` vía `docsByObservation` (derivado) |
| Historial | `report_id` previos y sus veredictos |
| Presupuesto | Nivel `compact` / `full` declarado por el consumidor |

## 9.2 Reglas de consumo

| ID | Regla |
|---|---|
| LLM-1 | El ancla de cada afirmación es `observation_id`; opcionalmente `evidence_id` y `doc_id`. Sin ancla, la afirmación se descarta (H5). |
| LLM-2 | El LLM **no ve** samples sueltos: solo `ObservationPackage`. Evita el error de nivel de sample. |
| LLM-3 | El LLM **no decide**: no cierra gates, no promueve modelos, no escribe al Ledger ni al KH (N-6, C-5). |
| LLM-4 | Confianza = `MIN` de anclas × cobertura × penalidad por estado no-`REAL` (F4 §9). El LLM **nunca la sube** (N-2). |
| LLM-5 | Estado de la observación se hereda; un `SIM`/`DISENO`/`REF` jamás se presenta como `REAL` (N-5). |
| LLM-6 | Ante ausencia: `NO_DATA` · `PARTIAL` · `BLOCKED` · `UNANSWERABLE`, con "qué buscó y qué falta". |
| LLM-7 | PII y rostros se redactan **antes** del prompt; `consent_id` se verifica. Sin consentimiento, el bloque `PERSONAS` se omite y se reporta `PARTIAL`. |
| LLM-8 | Toda respuesta registra `model_id` (LLM), `prompt_template_version`, `input_observation_ids[]` y `report_id`. |
| LLM-9 | El proveedor es intercambiable; si falla, el modo sin-LLM responde con veredictos honestos (fallback preservado). |
| LLM-10 | Fixtures de rechazo obligatorias: inventar observación, inventar evidencia, subir confianza, filtrar un sample aislado, incluir PII sin consentimiento. |

## 9.3 Ejemplo de trazabilidad de una respuesta

```
intención: "¿hay actividad apícola en campo07?"
   │
   ▼
ObservationPackage(obs_20261120_campo07_0001)
   ├─ audio: abejas (DISENO) · evt_..._0002
   ├─ image: abeja_en_flor (DISENO)
   └─ telemetry: actividad_vuelo 37/ventana (T0 visual)
   │
   ▼
LLM redacta: "actividad observada; evidencia limitada; confianza MODERADA"
   │  anclas: observation_id + evidence_id + doc_id
   ▼
report_20261120_apicola → veredicto PARTIAL → model_id=model_llm_...
   │
   ▼
promoción a documento canónico SOLO por gobernanza (Hangar)
```

---

# 10. RESPUESTA 8 — Ciclo completo

```
  [1] CAPTURA ──► [2] CURACIÓN ──► [3] DATASET ──► [4] MODELO
        ▲                                              │
        │                                              ▼
  [8] RETROALIMENTACIÓN ◄── [7] KNOWLEDGE HUB ◄── [6] ACP ◄── [5] (predicción)
```

| # | Etapa | Entrada | Transformación | Salida | Actor | Gate | ID producido |
|---|---|---|---|---|---|---|---|
| 1 | Captura | Mundo real | Registro T0..T3 con procedencia | Observación + assets | Productor gobernado | CAP-1..7 | `observation_id` · `asset_id` |
| 2 | Curación | Observación + anotación | Doble revisión, `supersedes`, OOD, cuarentena | Versión curada (sin borrar) | Anotador / gobernanza | CU-1..8 | `annotation_id` |
| 3 | Dataset | Observaciones curadas | Split por `(session_id, place_id)`, manifiesto, huella | Versión hermana `vN/` | Gobernanza de dataset | G-DS-* (adaptados) | `dataset_version` · `manifest_id` |
| 4 | Modelo | Dataset | Entrenamiento/inferencia declarada | Predicción + métricas | Modelo ML/DL/LLM | Gate de promoción | `model_id` · `run_` · `pred_` |
| 5 | Predicción | Observación + modelo | Inferencia con confianza propia | Salida interpretada | Modelo | TR-5 | `prediction_id` |
| 6 | ACP | Registry + Ledger + KH | Verificación por anclas, veredicto | Reporte anclado | ACP (`IA-1`) | G-F4A/G-MM-7 | `report_id` |
| 7 | Knowledge Hub | Reporte + evidencia | Revisión de autenticidad, promoción | Documento canónico + registry regenerado | Humano | G-F3E / Hangar | `doc_id` |
| 8 | Retroalimentación | Documento / revisión | Nueva anotación o curación | **Nueva versión, mismo ID** | Humano / productor | MG-5 / CU-4 | `annotation_id` nuevo |

## 10.1 Anti-corrupción del ciclo

| Riesgo | Regla que lo bloquea |
|---|---|
| La predicción convierte `DISENO` en `REAL` | TR-3 · MP-6 |
| El ACP escribe directo al KH | C-5 · KH-3 · F3E-9 |
| La curación borra la etiqueta original | CU-1 · CU-7 |
| La retroalimentación reescribe la observación | OBS-14 |
| Fuente `REF` entra al split propio | FX-1 · MP-9 |
| Se inventa confianza para "mejorar" el reporte | LLM-4 · N-2 |
| Se reporta κ simulado | CU-8 · AN-16 |

**Regla de cierre del ciclo (MP-15):** la retroalimentación **nunca cierra una versión reescribiéndola**; abre una nueva versión enlazada. El `observation_id` permanece como hilo de toda la historia.

---

# 11. RESPUESTA 9 — Cuellos de botella hacia 100.000 observaciones

## 11.1 Estimaciones (marcadas como `ESTIMADO`)

| Supuesto | Valor estimado |
|---|---|
| 100.000 observaciones × 1 audio (3 s, 44,1 kHz, 16 bit) | ≈ 26 GB |
| 100.000 × 1 imagen (1,5 MB promedio) | ≈ 150 GB |
| 20 % con video (100 MB promedio) | ≈ 2 TB |
| Features y metadata | ≈ 5–15 GB |
| **Total bruto** | **≈ 2,2 TB (sin replicar) · 6–9 TB con 3 copias** |

> Estas cifras son **`ESTIMADO`**, no mediciones. La imagen y el video dependen de resolución y códec; deben verificarse con un piloto antes de dimensionar infraestructura.

## 11.2 Inventario de cuellos de botella

| ID | Cuello de botella | Severidad | Umbral donde aparece | Mitigación gobernada |
|---|---|---|---|---|
| **B-01** | Asignación de IDs y sincronización offline | 🔴 | ~1.000 | Autoridad única con bloques de secuencia; nunca IDs locales libres (OBS-11) |
| **B-02** | Crecimiento de almacenamiento (video) | 🔴 | ~5.000 | Derivación diferida de cuadros, miniaturas, capas frías, formatos abiertos |
| **B-03** | Ancho de banda desde celular | 🟡 | ~2.000 | QC local, compresión declarada, carga diferida, sin pérdida de huella |
| **B-04** | **Capacidad humana de anotación** | 🔴 | ~3.000 | QC por niveles, muestreo, asistencia por modelo con veredicto humano; κ sigue `PENDING` |
| **B-05** | Latencia de aprobación de curaciones | 🟡 | ~5.000 | Cola con responsable, SLA gobernado, lotes; sin borrado |
| **B-06** | Deriva de taxonomía y alias | 🔴 | ~10.000 | `alias_of`, crosswalks, bumps aditivos, nunca renombrar |
| **B-07** | Calibración y deriva de sensores T3 | 🟡 | ~10.000 | `calibration_id` obligatorio, registro de deriva; T0 no depende de esto |
| **B-08** | Consentimiento y privacidad (personas) | 🔴 | ~1.000 | `consent_id`, redacción, sin biometría, retención declarada |
| **B-09** | Licencias de fuentes externas | 🟡 | ~10.000 | Licencia por activo, lista cerrada, `ND` excluido |
| **B-10** | Rigidez del esquema de metadata | 🔴 | ~10.000 | Bumps aditivos y versiones hermanas; nunca reescribir columnas |
| **B-11** | Rendimiento de índices derivados | 🟡 | ~20.000 | Vistas de lectura materializadas; **nunca** doble escritura (MP-8) |
| **B-12** | Contaminación de evaluación (`REF` en splits) | 🔴 | ~5.000 | `REFONLY`, split por `(session_id, place_id)`, holdout separado |
| **B-13** | Límite de contexto del LLM | 🟡 | ~20.000 | `ObservationPackage` con niveles `compact`/`full`, recuperación por ancla |
| **B-14** | Crecimiento de `docsByObservation` | 🟡 | ~50.000 | El registry indexa observaciones como vista derivada, no un documento por observación |
| **B-15** | Capacidad de gobernanza (gates y aprobaciones) | 🔴 | ~10.000 | Delegación con autoridad registrada; el humano aprueba decisiones, no filas |
| **B-16** | Dependencia de hardware especializado | 🔴 | cualquier escala | Garantía T0 (MP-0); T3 siempre opcional |
| **B-17** | Colisión semántica entre dominios (`abeja` audio/imagen/apicultura) | 🟡 | ~10.000 | `event_id` como crosswalk; vocabularios por modalidad, nunca uno global plano |
| **B-18** | Conectividad rural intermitente | 🟡 | ~2.000 | Captura offline con sincronización diferida y verificación de huella |
| **B-19** | Verificación de integridad en cada salto | 🔴 | ~50.000 | Manifiestos `sha256` por lote; huella distinta ⇒ `BLOCKED` (TR-4) |
| **B-20** | Obsolescencia de formatos a 10 años | 🟡 | ~5 años | Formatos abiertos, migración por versión hermana, checksums preservados |
| **B-21** | Explosión de assets derivados de video | 🟡 | ~10.000 | Materialización perezosa; `derived_from`, sin copias |
| **B-22** | Menores en observaciones con personas | 🔴 | ~1.000 | Prohibición estricta sin consentimiento legal; redacción obligatoria |

## 11.3 Dato clave

> El cuello de botella dominante **no es el almacenamiento**: es la **capacidad humana de anotación y gobernanza** (B-04, B-15). El almacenamiento se compra; la honestidad de la anotación no se compra. Por eso el plan V2 invierte en QC por niveles y delegación registrada antes que en hardware.

## 11.4 Umbrales de escala

| Escala | Riesgo principal | Requisito para seguir creciendo |
|---|---|---|
| 7 → 1.000 | Identidad y procedencia | Autoridad de IDs y manifiestos de huella |
| 1.000 → 10.000 | Anotación y consentimiento | QC por niveles, `consent_id`, crosswalk de taxonomía |
| 10.000 → 50.000 | Índices, deriva, gobernanza | Vistas derivadas, `calibration_id`, delegación registrada |
| 50.000 → 100.000 | Integridad, video, KH | Manifiestos por lote, capas frías, registry como vista |

---

# 12. RESPUESTA 10 — Roadmap real V1 → V2 → V3

> Todos los gates están **`DISENO` / `PENDING`**. El roadmap **no autoriza implementación**: cada fase requiere misión explícita.

## 12.1 V1 — Cimientos del ecosistema (meses 0–18)

**Objetivo:** demostrar que una observación puede nacer en T0, gobernarse y ser leída por ACP y KH sin hardware especializado.

| Elemento | Alcance V1 |
|---|---|
| Identidad | `OBSERVATION_ID` como raíz; autoridad de IDs y envoltura `legacy_sample_id` |
| Captura | Audio (ya operativo) + imagen T0 + telemetría T0 manual/T2 externa |
| Taxonomías | Visual y de telemetría **ratificadas** como `DISENO` gobernado; audio v2 vigente |
| Curación | `supersedes`, `curated_path`, OOD, sin borrado |
| Datos | `v2/` hermano, **sin tocar `v1/`**; 7 muestras envueltas |
| Modelos | Ninguno nuevo; M1/M2 permanecen congelados |
| ACP / KH | Lectura por `observation_id`; `docsByObservation` derivado; sin escritura directa |
| Hardware | **Cero obligatorio**. Ningún gate depende de T3 |
| Escala objetivo | 10.000 observaciones |

**Gates V1:** G-MP-V1-1 ID ratificado · G-MP-V1-2 captura T0 en 9 dominios · G-MP-V1-3 taxonomías visual/telemetría aprobadas · G-MP-V1-4 curación auditada · G-MP-V1-5 ACP responde por observación con fixtures de rechazo · G-MP-V1-6 sin dependencia T3.

## 12.2 V2 — Escala y dominios (meses 18–42)

**Objetivo:** crecer a 50.000 observaciones sin refactorizar la identidad y sin convertir el hardware en requisito.

| Elemento | Alcance V2 |
|---|---|
| Modalidades | Video con cuadros derivados; telemetría T1 generalizada |
| Dominios | Invernaderos, ganadería, porcicultura, avicultura, apicultura, acuicultura, forestal, urbano y rural con protocolos propios |
| Anotación | QC por niveles, delegación registrada, κ **real** si hay etiquetas individuales; si no, sigue `PENDING` |
| Modelos | `MODEL_ID` / `MODEL_RUN_ID` / `PREDICTION_ID` gobernados; ML y DL con gate de promoción |
| Evidencia | Evidence Ledger operativo bajo misión explícita |
| Hardware | T3 aditivo por el cauce de 5 pasos; nunca obligatorio |
| Escala objetivo | 50.000 observaciones |

**Gates V2:** G-MP-V2-1 video gobernado sin duplicación · G-MP-V2-2 κ real o `PENDING` honesto · G-MP-V2-3 crosswalk verificado de al menos una fuente REF · G-MP-V2-4 T3 registrado sin volverse requisito · G-MP-V2-5 9 dominios observables en T0 · G-MP-V2-6 integridad verificada por lote.

## 12.3 V3 — Ecosistema de conocimiento verificable (meses 42–120 / año 10)

**Objetivo:** sostener 100.000+ observaciones durante el horizonte de 10 años, con IA gobernada y preservación garantizada.

| Elemento | Alcance V3 |
|---|---|
| IA | LLM como slot intercambiable (Carta IA), sin proveedor único, fallback sin-LLM |
| Modelos | ML/DL/LLM bajo la misma gobernanza de promoción; ninguno es fuente de verdad |
| Conocimiento | KH como corazón: señal → evidencia → registro → contexto, con promoción gobernada |
| Multimodalidad | `event_id` como crosswalk entre audio, imagen, video y telemetría a escala |
| Preservación | Formatos abiertos, migraciones por versión hermana, checksums, sin dependencia de proveedor |
| Escala objetivo | 100.000+ observaciones |

**Gates V3:** G-MP-V3-1 LLM consume solo `ObservationPackage` · G-MP-V3-2 fixtures de rechazo en producción · G-MP-V3-3 100.000 observaciones con IDs sin cambios · G-MP-V3-4 prueba de migración de almacenamiento sin refactor · G-MP-V3-5 preservación verificada a 5 y 10 años.

## 12.4 Regla de evolución entre versiones

| Elemento | V1 | V2 | V3 |
|---|---|---|---|
| `OBSERVATION_ID` | `obs_...` | **idéntico** | **idéntico** |
| Taxonomía | audio v2 + propuestas | ratificadas | ampliadas por bump |
| Modelos | ninguno nuevo | ML/DL gobernados | ML/DL/LLM gobernados |
| Hardware | T0 | T0 + T1/T3 aditivos | T0 + todo lo anterior, opcional |
| Ancla ACP/KH | observación | observación | observación |

---

# 13. Cobertura obligatoria de dominios

> **Regla:** cada dominio debe ser observable en **T0**. Si un dominio requiere T3 para existir, no está cubierto.

| Dominio | Audio T0 | Imagen T0 | Video T0 | Telemetría T0/T1/T2 | T3 aditivo | Estado hoy |
|---|---|---|---|---|---|---|
| **Invernaderos** | Mic integrado (bomba, riego) | Webcam (hojas, malla) | Cámara (recorrido) | Temp/hum manual + luz T1 + clima T2 | Sensor suelo, compuerta | `DISENO` |
| **Ganadería** | Mic (vocalización) | Cámara (bovino) | Cámara (pastura) | Temp manual + GPS T1 | Collar, peso | `DISENO` |
| **Porcicultura** | Mic (gruñidos) | Cámara (cerdo) | Cámara (corral) | Temp/hum manual + amonio T3 | Sensor NH3 | `DISENO` |
| **Avicultura** | Mic (cantío) | Cámara (pollo) | Cámara (nave) | Temp manual + luz T1 | Sensor ambiental | `DISENO` |
| **Apicultura** | Mic (`abejas`, audio v2) | Cámara (`abeja_en_flor`) | Cámara (colmenar) | `actividad_vuelo` visual T0 + temp manual | `peso_colmena` UBTN | Parcial: audio `DISENO` |
| **Acuicultura** | Mic (bomba/agua) | Cámara (`pez_superficie`) | Cámara (estanque) | `temperatura_agua`, `ph`, `nivel_agua` manuales + foto del medidor | OD, turbidez | `DISENO` |
| **Forestal** | Mic (ave, insectos) | Cámara (hoja, tronco) | Cámara (recorrido) | GPS T1 + clima T2 | Drone, SDR | `DISENO` |
| **Ambientes urbanos** | Mic (motor, alarma) | Cámara (infraestructura) | Cámara (calle) | Clima T2 + ruido medido | Sensor ruido | `DISENO` · **privacidad crítica** (VTX-9) |
| **Ambientes rurales** | Mic (lluvia, viento, ave) | Cámara (cultivo, fauna) | Cámara (parcela) | Temp/hum manual + clima T2 | Estación | Parcial:audio operativo |

**Nota honesta:** "Parcial" significa que existe evidencia acústica real limitada; **no** que el dominio esté operativo multimodalmente.

---

# 14. Criterio de éxito y verificación

## 14.1 Criterio de éxito de la misión

> **Primera arquitectura maestra capaz de soportar 10 años de evolución sin refactorizar `OBSERVATION_ID`.** Pensar como ecosistema, no como módulo.

## 14.2 Verificación

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Entidad central ratificada como raíz inmutable | ✅ §3, OBS-10..14 |
| 2 | Captura T0 definida para audio, imagen, video y telemetría | ✅ §4, MP-0 |
| 3 | `IMAGE_ID`, `VIDEO_ID`, `TELEMETRY_ID`, `MODEL_ID`, `REPORT_ID` definidos | ✅ §5 |
| 4 | Taxonomía visual con los 7 rubros exigidos + OOD | ✅ §6 |
| 5 | Taxonomía de telemetría con las métricas exigidas | ✅ §7 |
| 6 | Relación observación / evento / asset / KH / ACP | ✅ §8 |
| 7 | LLM a nivel de observación, nunca de sample | ✅ §9 |
| 8 | Ciclo completo con retroalimentación no destructiva | ✅ §10 |
| 9 | 22 cuellos de botella con umbrales y mitigación | ✅ §11 |
| 10 | Roadmap V1/V2/V3 a 10 años con gates | ✅ §12 |
| 11 | 9 dominios obligatorios cubiertos en T0 | ✅ §13 |
| 12 | Coherencia con Constitución, Carta IA, D-003 y gobernanza previa | ✅ 7 estados · veredictos ACP · sin doble escritura · sin reescritura |

## 14.3 Límites declarados

- Sin código, sin implementación, sin modelos, sin datasets nuevos, sin hardware.
- Sin modificación de audio, `taxonomy_v2`, `rules-v0`, dataset v1, captura rápida ni captura experta.
- Sin commit, push, merge ni tag.
- La taxonomía visual y la de telemetría son **propuestas `DISENO`**: requieren misión de gobernanza para volverse oficiales ejecutables.

---

# 15. Cierre

El ecosistema de evidencia digital rural se sostiene sobre una idea simple y resistente: **una observación inmutable, muchas modalidades aditivas, un evento que une sin fusionar, y una cadena que nunca borra**.

El hardware especializado podrá llegar, aportar y enriquecer. **Nunca será el precio de entrada.** El precio de entrada es un navegador, un micrófono y una webcam.

Con esta arquitectura, SIGCT-Rural puede crecer de 7 a 100.000 observaciones, de audio a audio + imagen + video + telemetría + IA, y de 2026 a 2036, **sin cambiar una sola vez el valor de `observation_id`**.

---

*Fin del plan maestro. Complementa —nunca sustituye— la gobernanza multimodal V1, la gobernanza acústica V2, la Constitución, la Carta IA y D-003.*
