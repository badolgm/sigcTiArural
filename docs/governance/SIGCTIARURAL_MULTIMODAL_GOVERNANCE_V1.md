# GOBERNANZA MULTIMODAL V1 — SIGCT-RURAL (ARQUITECTURA OFICIAL PADRE)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:40:54-05:00
> - Origen: misión `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1` (documento nuevo, gobernanza padre)
> - Destino: `docs/governance/SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: define el modelo de entidades y las reglas comunes de audio, imagen y telemetría. No implementa código, no crea modelos, no genera datasets.

**Misión:** `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1`
**Naturaleza:** documentación oficial de **gobernanza**. Contrato **declarativo**: define identificadores, relaciones, OOD, curación, versionado, trazabilidad y consumo por ACP / Knowledge Hub.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Estado:** **OFICIAL — DISEÑADO**. Arquitectura ratificable; su materialización (schemas, directorios, ingestas, modelos) requiere misiones explícitas posteriores.
**Compañero:** `docs/governance/multimodal_entity_model_v1.md` (diagramas conceptuales, sin norma nueva).

**Subordinación:** Constitución V1.0.1 → Carta de Gobernanza IA V1.0.1 → D-003 → `AGENTS.md` → **este documento** → especializaciones de dominio (`docs/acoustic/`, futuras `docs/image/` y `docs/telemetry/`).

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante de honestidad:** los **7 estados canónicos** (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`) permanecen intactos. Esta gobernanza **no crea estados nuevos** y **no mejora el estado** de nada por decreto documental.

---

# 0. Propósito y fuente de verdad

SIGCT-Rural ya tiene gobernanza acústica v2 oficial en `docs/acoustic/` y un dataset acústico operativo. Pero el ecosistema **no es solo audio**: produce imágenes agrícolas, telemetría, anotaciones, evidencia, respuestas del ACP y documentos del Knowledge Hub. Hoy esas piezas se nombran de forma independiente (`sample_id`, `signal_id`, `evidence_id`, `doc_id`) y no existe una entidad que las unifique sin refactorizaciones futuras.

Este documento crea esa entidad: **`observation_id`**, la unidad atómica de evidencia del ecosistema. Alrededor de ella se organizan **`asset_id`** (el activo), **`event_id`** (el evento real) y las reglas que gobiernan sus relaciones.

**Lo que este documento SÍ hace:**
1. Define las tres entidades y sus relaciones con cardinalidad explícita.
2. Generaliza a imagen y telemetría las reglas ya probadas en audio (OOD, curación no destructiva, versionado por directorios hermanos, trazabilidad por huella).
3. Establece cómo ACP y Knowledge Hub consumen `observation_id` **en lugar de muestras aisladas**.
4. Fija el contrato de compatibilidad con fuentes externas y propias.

**Lo que este documento NO hace:**
- No implementa código, no crea modelos ML/DL/LLM, no genera datasets nuevos.
- No modifica `docs/acoustic/*`, `rules-v0`, `dataset v1`, captura rápida ni captura experta.
- No crea `docs/image/`, `docs/telemetry/`, `v2/` ni ningún directorio de datos.
- No cierra gates: los defines, no los ejecuta.
- No modifica la jerarquía documental (D-003) ni la Constitución, la Carta IA o el apéndice de estados.

> Todo nombre de sentinela OOD para imagen y telemetría que aparezca aquí es una **propuesta de nomenclatura en estado `DISENO`**. No se crea ninguna clase, columna ni archivo de dataset en esta misión.

---

# 1. Hechos verificados sobre los que se funda

La honestidad de estado exige separar lo que existe de lo que se diseña.

| Hecho | Estado real | Fuente verificable |
|---|---|---|
| Gobernanza acústica v2 oficial | **Promovida y commiteada** (`1685794`) | `docs/acoustic/` (7 documentos) |
| Taxonomía acústica v2 | **61 `class_id`** (37 raíz + 22 subclases + 2 alias) | `docs/acoustic/taxonomy_v2.md` |
| Dataset acústico | **Operativo, 7 muestras reales**, `v1/` intacto | `data/datasets/sigct_rural_acoustic/v1/` (fuera de git) |
| Captura rápida / experta y bridge | **Operativos** | commits `a0af8b4` / `ff5ae10`, `tools/cmsc-data-logger/bridge/server.js` |
| Columna `secondary_classes` | **Ya existe** desde `schema_version 1.1.0` | `schema.json` 1.3.0 (42 columnas) |
| Dataset de imágenes agrícolas propio | **22.488 imágenes · 16 clases · 3 especies · seed 42** (fuera de git) | `docs/ai/H5_AI_GOVERNANZA_CLOSURE_REPORT.md` |
| M1 baseline / M2 challenger | **Cerrados**; M1 congelado, M2 no promovido | `docs/ai/M1_M2_GOVERNANCE_CLOSURE_REPORT.md` |
| ACP operativo | **NO** — arquitectura conceptual `DISENO` (F4) | `Documentacion/Arquitectura/CMSC_F4_ACP_ARCHITECTURE_v1.md` |
| Evidence Ledger operativo | **NO** — `DISENO` (F3E) | `Documentacion/Arquitectura/CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md` |
| Taxonomía de imagen / telemetría canónica en `docs/` | **NO existe** | búsqueda en `docs/` (2026-11-20) |
| Gobernanza multimodal padre en `docs/` | **NO existía** — la crea esta misión | este documento |

**Consecuencia honesta:** esta arquitectura es la **primera gobernanza multimodal oficial**, pero es **declarativa**. La imagen y la telemetría quedan preparadas para entrar **sin rediseño**; aún no tienen vocabulario canónico propio. Decir lo contrario sería violar P-2.

---

# 2. Principios rectores

| ID | Principio | Consecuencia operativa |
|---|---|---|
| **MG-1** | **Observación como átomo** | La unidad de evidencia es `observation_id`, nunca un archivo ni una fila aislada. |
| **MG-2** | **Identidad estable entre versiones** | Un ID no codifica taxonomía: sobrevive a v1 → v2 → v3 sin renombrarse. |
| **MG-3** | **Paridad de modalidad** | Audio, imagen y telemetría se gobiernan con las mismas reglas de ID, estado, OOD y curación. El formato cambia; la gobernanza no. |
| **MG-4** | **OOD es veredicto, no clase mágica** | La sentinela nunca explica, nunca se captura a demanda y nunca sube confianza. |
| **MG-5** | **Honestidad intacta** | Los 7 estados canónicos no se amplían. El estado nunca mejora por navegación, agregación ni inferencia. |
| **MG-6** | **Evento distinto de etiqueta** | `event_id` = ocurrencia real; `class_id` = vocabulario. Un evento puede reunir varias observaciones y varias modalidades. |
| **MG-7** | **Fuente única, índices derivados** | Los índices (`docsByObservation`, grafo, registry) se derivan por lectura; nunca se escriben en dos sitios. |
| **MG-8** | **Versiones hermanas, sin reescritura** | Cada versión es un directorio/contrato nuevo; la anterior permanece legible. |
| **MG-9** | **Proveniencia obligatoria** | Toda observación declara quién, cuándo, dónde, con qué herramienta y bajo qué versión nació. Sin procedencia no es evidencia (P-3). |
| **MG-10** | **Externo nunca evalúa propio** | Las fuentes externas entran como `REF`; jamás se mezclan con los splits de evaluación propios. |
| **MG-11** | **ACP y KH consumen observaciones** | El ancla de una respuesta o de un documento es `observation_id`, no `sample_id`. |
| **MG-12** | **Sin implementación sin misión** | Esta gobernanza habilita; no autoriza código, ingestas, modelos ni escritura en Knowledge Hub. |

---

# 3. Modelo de tres entidades

## 3.1 `OBSERVATION_ID` — entidad principal

**Definición.** Identificador único, inmutable y **estable entre versiones** de una ocurrencia de captura. Una observación es el contenedor de todo lo que se registró en un mismo acto: audio, imagen, telemetría, anotaciones, eventos y, posteriormente, evidencia y resultados.

**Formato propuesto:** `obs_<YYYYMMDD>_<session_id>_<seq4>`
**Ejemplo:** `obs_20261120_campo07_0001`

**Reglas de identidad:**

| ID | Regla |
|---|---|
| OB-1 | Se asigna **en el nacimiento** (captura o importación gobernada), nunca después. |
| OB-2 | **No codifica taxonomía ni versión**: `obs_...` sigue siendo válida aunque la clase pase de v1 a v2 o v3. Es el mecanismo anti-refactorización. |
| OB-3 | Nunca se reutiliza, nunca se renombra, nunca se fusiona con otra. |
| OB-4 | Una observación puede nacer **monomodal** (solo audio) y crecer después con más assets. Crecer no cambia su ID. |
| OB-5 | Toda observación heredera de una fila v1 declara `legacy_sample_id` con el `sample_id` original; la fila v1 no se toca. |

**Campos declarativos (contrato mínimo):**

| Campo | Obligación | Función |
|---|---|---|
| `observation_id` | OBLIGATORIA | Identidad estable |
| `entity_model_version` | OBLIGATORIA | Versión del modelo de entidades (`1.0`) |
| `governance_version` | OBLIGATORIA | Versión de esta gobernanza (`1.0`) |
| `captured_at` + `timezone` | OBLIGATORIAS | Ancla temporal; sin zona horaria la hora no es evidencia |
| `session_id` · `place_id` · `operator_id` | OBLIGATORIAS | Procedencia (quién / dónde / cuándo) |
| `capture_source` | OBLIGATORIA | Origen gobernado: captura propia, importación REF, documento |
| `modality_set` | OBLIGATORIA | Subconjunto de `AUDIO` · `IMAGE` · `TELEMETRY` · `ANNOTATION` |
| `state` | OBLIGATORIA | Uno de los **7 estados canónicos** |
| `confidence_declared` | OBLIGATORIA | 0..1, ortogonal al estado (never inflada) |
| `asset_ids[]` | 1..N | Activos vinculados |
| `event_ids[]` | 0..N | Eventos reconocidos |
| `annotation_ids[]` | 0..N | Anotaciones humanas / gobernadas |
| `evidence_ids[]` | 0..N derivados | Evidencia generada a partir de la observación |
| `provenance` | OBLIGATORIA | `source_id` · `original_id` · `license` · `method` · `tool_version` |
| `environment` | OPCIONAL | Escena/contexto (`paisaje rural` vive aquí, **nunca** en `class_id`) |
| `sync` | OPCIONAL | `method` (`manual`/`ntp`/`gps`/`none-declared`) + `offset_ms` por modality |
| `links[]` | OPCIONAL | Observaciones vecinas, predecesoras o curadas (por ID, nunca por copia) |

**Estado agregado (regla conservadora).** Cada asset declara su propio estado. La observación **declara el estado del asset originario** y nunca muestra un estado mejor que el de sus componentes. Si cualquier asset está `ROTO`, la observación se reporta como `ROTO` para efectos de visualización (degradación, nunca mejora). `SIM`, `REF`, `DISENO`, `REAL-LOCAL` y `REAL` se presentan como **distribución** (termómetro), no se colapsan en un estado inventado. La confianza agregada sigue la regla de propagación conservadora del ACP: `MIN` de las anclas (F4 §9).

## 3.2 `ASSET_ID` — identificador de cada activo

**Definición.** Identificador único del activo concreto que transporta una modalidad. Un asset es **inmutable en sus bytes**: cualquier corrección produce un **nuevo** asset enlazado al original.

**Formato propuesto (prefijo por modalidad):**

| Tipo | Prefijo | Ejemplo | Estado hoy |
|---|---|---|---|
| Audio | `audio_` | `audio_20261120_180207_000` | **Operativo** (v1 usa `sample_id` equivalente) |
| Imagen | `image_` | `image_20261120_141002_003` | `DISENO` (sin dataset canónico nuevo) |
| Telemetría | `telemetry_` | `telemetry_20261120_141002_hum` | `DISENO` como asset gobernado |
| Documento | `doc_` | `doc_CMSC_F4_ACP_ARCHITECTURE_v1` | Referencia al registry, **nunca copia** |

**Reglas:**

| ID | Regla |
|---|---|
| AS-1 | Todo asset declara: `asset_id`, `modality`, `sha256`, `mime_type`, `captured_at`, `state`, `license`, `provenance`, `observation_id`. |
| AS-2 | `sha256` es la huella de integridad. Cambiar bytes ⇒ nuevo `asset_id`; el original permanece. |
| AS-3 | `doc_` es una **referencia** al documento gobernado (registry del KH), no una duplicación de contenido (MG-7, P-12). |
| AS-4 | Los assets externos declaran `source_id` y `original_id`; el identificador de la fuente **nunca se sobrescribe**. |
| AS-5 | Un asset pertenece **exactamente a una** observación. Si debe compartirse, se referencia por ID desde la otra observación; no se copia. |
| AS-6 | Los parámetros de captura (tasa de muestreo, resolución, unidades, precisión) son metadata del asset, no del evento. |

## 3.3 `EVENT_ID` — representación de un evento real

**Definición.** Identificador de una **ocurrencia** del mundo real, con ventana temporal y lugar. Es el pegamento semántico entre modalidades: la misma lluvia puede ser oída (audio), vista (imagen) y medida (telemetría) como tres assets de **distintas observaciones** que convergen en **un mismo `event_id`**.

**Formato propuesto:** `evt_<YYYYMMDD>_<place_id>_<seq4>`
**Ejemplo:** `evt_20261120_campo07_0002`

> **Aclaración necesaria.** Los ejemplos de la misión (`lluvia`, `plaga`, `riego`, `alarma`, `motor_activo`, `abejas_detectadas`) son **`event_type`** (vocabulario), no identificadores de ocurrencia. El `event_id` identifica *esa* lluvia, *en ese* lugar y *en esa* franja. Confundir ambos niveles es el error que esta gobernanza evita (MG-6).

| `event_type` (ejemplo de la misión) | Vocabulario de origen | Estado del vocabulario |
|---|---|---|
| `lluvia` | `class_id` audio v2 `lluvia` | **Oficial** (`taxonomy_v2.md`) |
| `riego` | `class_id` audio v2 `riego` (subclase de `agua`) | **Oficial** (`taxonomy_v2.md`) |
| `motor_activo` | `class_id` audio v2 `motor` | **Oficial** (`taxonomy_v2.md`) |
| `abejas_detectadas` | `class_id` audio v2 `abejas` (subclase de `insectos`) | **Oficial** (`taxonomy_v2.md`, `DISENO`, 0 clips) |
| `alarma` | universal `alarma` en `secondary_classes` | **Oficial como concurrente**, no como primaria |
| `plaga` | taxonomía de imagen futura | **`DISENO`** — no existe vocabulario canónico en `docs/` todavía |

**Reglas:**

| ID | Regla |
|---|---|
| EV-1 | Un `event_type` apunta a un vocabulario canónico declarado; si no existe, el evento nace OOD (§5). |
| EV-2 | Un evento referencia 1..N `observation_id` y, a través de ellos, 1..N assets de cualquier modalidad. |
| EV-3 | Evento y etiqueta son ortogonales: un evento puede tener etiquetas de audio, imagen y telemetría simultáneas sin fusionarlas. |
| EV-4 | `lluvia` no se convierte en `evento_desconocido` porque falte imagen: la multimodalidad es **opcional**, no obligatoria. |
| EV-5 | Un evento no se elimina: se marca `SUPERSEDED_BY` con otro `event_id` y se conserva (P-1). |
| EV-6 | `paisaje rural` sigue siendo **escena/contexto** en `environment`, nunca `event_type` ni `class_id` (decisión H3 D4). |

---

# 4. Relación entre audio, imagen y telemetría

## 4.1 Grafo canónico

La misión ilustra la cadena `observation_id → audio.wav → imagen.jpg → humedad → temperatura → resultado ACP`. Esa cadena es correcta como **ejemplo lineal**, pero el contrato es un **grafo** con un roots y tres hijos directos: los assets no se encadenan entre sí, cuelgan de la observación. El resultado del ACP **no es un asset**: es evidencia posterior que referencia la observación.

```
                         ┌──────────────────────────┐
                         │     OBSERVATION_ID       │  ← raíz, estable entre versiones
                         │  obs_20261120_campo07_0001│
                         └─────────────┬────────────┘
                                       │  1:N (pertenencia)
        ┌──────────────────┬───────────┼───────────────┬────────────────────┐
        ▼                  ▼           ▼               ▼                    ▼
  audio_..._000      image_..._003  telemetry_..._hum  telemetry_..._temp   annotation_id
   (AUDIO)            (IMAGE)        (TELEMETRY)         (TELEMETRY)         (ANOTACIÓN)
        └──────────────────┴───────────┼───────────────┴────────────────────┘
                                       │  0:N (reconocimiento)
                                       ▼
                            ┌─────────────────────┐
                            │      EVENT_ID       │ ← 1:N: otra observación
                            │ evt_20261120_..._2  │   puede aportar assets
                            └──────────┬──────────┘   al MISMO evento
                                       │  0:N derivados
                                       ▼
                     evidence_id → split/manifest → model_run_id → prediction_id
                                       │
                                       ▼
                          resultado ACP (veredicto + anclas)
                                       │
                                       ▼
                     doc_id del KH  ← docsByObservation (derivado por lectura)
```

## 4.2 Matriz de cardinalidad

| Relación | Cardinalidad | Regla |
|---|---|---|
| Observación → Asset | **1 : 1..N** | Toda observación tiene al menos un asset; puede crecer sin cambiar de ID (OB-4). |
| Observación → Evento | **1 : 0..N** | Una observación puede no reconocer ningún evento (OOD o sin anotar). |
| Evento → Observación | **1 : 1..N** | Un evento reúne observaciones de una o varias modalidades (EV-2). |
| Asset → Curación | **1 : 0..N** | Cada cura produce un nuevo asset; el original nunca se reemplaza (§6). |
| Observación → Evidencia | **1 : 0..N** | La evidencia se deriva; no se copia. |
| Documento → Observación | **N : M derivado** | `docsByObservation` se calcula por lectura, nunca se escribe en ambos lados (MG-7). |

## 4.3 Alineación temporal y espacial

| ID | Regla |
|---|---|
| AL-1 | Todo asset declara `captured_at` y `timezone`. Sin ambos, no se alinea: se marca `sync.method=none-declared`. |
| AL-2 | La pertenencia a la misma **observación** es la alineación fuerte. La coincidencia de timestamps entre assets **no** prueba pertenencia. |
| AL-3 | La pertenencia al mismo **evento** es una decisión gobernada (anotador o modelo con evidencia), nunca un cálculo automático de proximidad temporal. |
| AL-4 | `place_id` es obligatorio en la observación; en telemetría fija se hereda pero se declara. |
| AL-5 | Ninguna modalidad es obligatoria. Una observación solo-audio es **válida y compatible con v1**. |

## 4.4 Crecimiento sin refactorización (criterio de éxito)

| Paso | Acción | ¿Requiere cambiar el modelo? |
|---|---|---|
| 1 | Capturar audio → observación monomodal | No |
| 2 | Añadir imagen a esa misma observación | No — nuevo asset, mismo ID |
| 3 | Añadir humedad y temperatura | No — nuevos assets, mismo ID |
| 4 | Reconocer un evento compartido con otra observación | No — nuevo `event_id`, mismos IDs |
| 5 | Incorporar un modelo ML/DL/LLM | No — nuevo `model_run_id`, mismos IDs |
| 6 | Cambiar la taxonomía de audio v2 a v3 | No — el ID no codifica taxonomía (OB-2) |

---

# 5. Gobernanza OOD para audio, imagen y telemetría

## 5.1 Principio universal

| ID | Regla |
|---|---|
| MG-OOD-1 | OOD es un **veredicto de no-clasificación**, no una clase que explica contenido. Hereda la doctrina de `docs/acoustic/ood_policy_v2.md`. |
| MG-OOD-2 | La sentinela **nunca se captura a demanda**. No existe sesión "capturar desconocido" en ninguna modalidad. |
| MG-OOD-3 | Asignar OOD **no mejora** el estado ni la confianza; adicionalmente exige nota obligatoria. |
| MG-OOD-4 | Toda sentinela declara `is_ood_bucket=true` y un `dir_name` estable compartido con su alias, si lo hay. |
| MG-OOD-5 | Un clip corrupto o un sensor fallido **no es OOD**: es `REJECTED` / `quarantine` / `ROTO`. |
| MG-OOD-6 | La promoción de OOD a clase oficial es un **evento de gobernanza documental**: requiere misión explícita, bump de versión y huella sincronizada. Nunca es automática. |
| MG-OOD-7 | El frente de OOD se reporta con el vocabulario de veredictos de la Carta IA: `NO_DATA` · `PARTIAL` · `BLOCKED` · `UNANSWERABLE`. |
| MG-OOD-8 | La sentinela de una modalidad **no contamina** a las demás: audio OOD + imagen válida = observación con un asset OOD y otro válido (paridad MG-3). |
| MG-OOD-9 | Las filas OOD se conservan con su nota original aunque luego se curen a una clase (AN-14 generalizado). |

## 5.2 Sentinelas por modalidad

| Modalidad | Sentinela | Alias / bucket | Estado real | Gobernancia de detalle |
|---|---|---|---|---|
| **Audio** | `evento_desconocido` | `ruido_desconocido` · `dir_name=desconocido` | **OFICIAL** | `docs/acoustic/ood_policy_v2.md` (OO-1..OO-9) |
| **Imagen** | `evento_visual_desconocido` *(propuesta)* | `dir_name=desconocido_visual` *(propuesta)* | **`DISENO` — NO creada** | futura `docs/image/ood_policy_v1.md` |
| **Telemetría** | `lectura_desconocida` *(propuesta)* | `dir_name=desconocido_telemetria` *(propuesta)* | **`DISENO` — NO creada** | futura `docs/telemetry/ood_policy_v1.md` |
| **Compuesto** | `evento_multimodal_no_resuelto` *(propuesta)* | sin bucket físico | **`DISENO` — NO creado** | se marca en `event_id`, nunca en los assets |

## 5.3 OOD compuesto

Cuando cada modalidad encaja en su vocabulario pero **la combinación** no tiene `event_type` canónico (ej.: `abejas` en audio + `plaga` en imagen + humedad anómala), se marca **`evento_multimodal_no_resuelto` en el `event_id`**, no en los assets. Los assets conservan sus etiquetas válidas. Este mecanismo evita degradar etiquetas correctas y evita inventar clases combinadas (`abejas_con_plaga`), el mismo error que `secondary_classes` ya evita en audio.

## 5.4 Frontera con anomalía y con ACP

`evento_desconocido` es incertidumbre **semántica**; una anomalía es un evento **conocido** de comportamiento anómalo. Un OOD no se reporta automáticamente como anomalía (OO-5). Ante un OOD, el ACP responde `NO_DATA` / `PARTIAL`, nunca una interpretación inventada (N-1, H5).

---

# 6. Políticas de curación no destructiva

## 6.1 Principio

**Nada se borra. Nada se reescribe. Toda corrección es una nueva versión enlazada.** Se generalizan AN-10..AN-15 de `docs/acoustic/annotation_protocol_v2.md` a las tres modalidades.

## 6.2 Niveles de curación

| Nivel | Qué corrige | Mecanismo | Original |
|---|---|---|---|
| **C-A · Asset** | Bytes, formato, calidad de imagen, unidad de telemetría | Nuevo `asset_id` con `curated_from=<asset original>` + `curated_path` + `sha256` propio | Intacto, con su huella |
| **C-L · Etiqueta** | `class_id`, `event_type`, `secondary_classes`, anotación | Nueva fila de anotación con `supersedes=<annotation_id>` | Intacta; se conserva la nota OOD si la había |
| **C-E · Evento** | Asociación observación ↔ evento | `event_id` nuevo con `SUPERSEDED_BY` en el anterior (EV-5) | Intacto |
| **C-V · Versión** | Declaración de `taxonomy_version` / `governance_version` errónea | Declarar la versión correcta **en la cura** | La fila original **nunca** se reescribe (AN-13) |

## 6.3 Reglas

| ID | Regla |
|---|---|
| CU-1 | `curated_path` apunta a la versión corregida; el path original sigue existiendo y siendo legible. |
| CU-2 | Toda cura declara: motivo, autor, timestamp, versión de gobernanza y huella del original. |
| CU-3 | La cura **no mueve splits** y **no cambia** `session_id`, `place_id`, `operator_id` ni `sha256` originales. |
| CU-4 | La cura **no promueve estados**: una clase `DISENO` no se vuelve `REAL` por ser corregida (AN-12). |
| CU-5 | La cura **no aumenta confianza**; puede reducirla con evidencia (AN-7 generalizado). |
| CU-6 | Cuarentena ≠ borrado: un asset inválido se aísla y se declara `ROTO`, no se elimina. |
| CU-7 | Rollback = volver a apuntar al ID original. Ninguna cura destructiva => ninguna migración de vuelta. |
| CU-8 | Cohen κ sigue `PENDING`. La curación **no** produce κ simulado (AN-16). |

---

# 7. Versionamiento v1 → v2 → v3

## 7.1 Ejes de versión (ortogonales)

| Eje | v1 (hoy, audio) | v2 (esta gobernanza) | v3 (reservado, `DISENO`) |
|---|---|---|---|
| `governance_version` | — | **1.0** | 2.0 (sin definir) |
| `entity_model_version` | — | **1.0** | 2.0 (sin definir) |
| Unidad de evidencia | `sample_id` | **`observation_id`** (con `legacy_sample_id`) | `observation_id` (estable) |
| Taxonomía audio | `acoustic_v1_taxonomy` (9) | `acoustic_v2_taxonomy` (61) | superior, sin definir |
| Taxonomía imagen | — | — (sin crear) | `image_v1_taxonomy`, `DISENO` |
| Taxonomía telemetría | — | — (sin crear) | `telemetry_v1_taxonomy`, `DISENO` |
| `schema_version` | **1.3.0** | bump acordado **en el mismo cambio** | posterior |
| `rules` | **`rules-v0` vigente** | `rules-v1` aditivo, no implementado | posterior |
| Directorio de datos | `v1/` intacto | `v2/` **hermano, no creado** | `v3/` hermano, no creado |

## 7.2 Reglas de versión

| ID | Regla |
|---|---|
| MG-V-1 | Toda fila declara `governance_version`, `entity_model_version` y la `taxonomy_version` que corresponda a su modalidad. |
| MG-V-2 | Mezclar versiones de taxonomía en un mismo split está **prohibido**. |
| MG-V-3 | Añadir un valor a un enum cerrado = **minor**; quitar un valor en versiones < 2.0.0 = **prohibido**. |
| MG-V-4 | Cambiar un contrato exige actualizar **su huella SHA-256 y su versión en el mismo cambio** (regla de invalidación ya aplicada en gobernanza acústica §11). |
| MG-V-5 | Las versiones conviven como **directorios hermanos**; ninguna reescribe a la anterior. |
| MG-V-6 | `v1/` y sus 7 muestras quedan **intactos**: la compatibilidad se resuelve por envoltura (`legacy_sample_id`), no por migración. |
| MG-V-7 | `rules-v0` sigue vigente hasta que una misión explícita active `rules-v1`. |
| MG-V-8 | v3 se nombra para **reservar el espacio**, no para prometer fecha ni contenido. |

## 7.3 Compatibilidad v1 → v2 (respuesta directa a la pregunta de migración)

Una fila v1 (`sample_id=ac_20261120_180207_000`) se hace legible en v2 **sin tocar la fila**: se crea una observación `obs_...` que declara `legacy_sample_id` y apunta al mismo audio como asset. Los 9 `class_id` v1 sobreviven (7 idénticos + 2 alias según `taxonomy_v2.md` §9). El alias `ruido_desconocido` sigue activo junto a `evento_desconocido`. El resultado: **cero reescrituras, cero pérdida, cero refactorización**.

---

# 8. Trazabilidad completa: captura → modelo

## 8.1 Cadena de custodia

| # | Etapa | Identificador | Se declara en el eslabón | Estado / confianza |
|---|---|---|---|---|
| 1 | Captura | `session_id` · `operator_id` · `place_id` | observación | Estado del productor |
| 2 | Observación | `observation_id` | observación | 7 estados + `confidence_declared` |
| 3 | Activo | `asset_id` + `sha256` | asset | Estado propio del asset |
| 4 | Anotación | `annotation_id` | anotación | Humano / gobernado, con acuerdo categories (κ `PENDING`) |
| 5 | Evento | `event_id` | evento | Vocabulario declarado u OOD |
| 6 | Evidencia | `evidence_id` | Evidence Ledger | Hereda estado, **no lo mejora** (R-10.4) |
| 7 | Preparación | split / `manifest_id` | dataset versionado | Sin mezcla REF en splits propios |
| 8 | Modelo | `model_run_id` | registro de corrida | ML / DL / LLM, con método y versión |
| 9 | Predicción | `prediction_id` | salida del modelo | Confianza del modelo, **ortogonal** al estado |
| 10 | ACP | veredicto + anclas | respuesta | `RESOLVED`/`PARTIAL`/`NO_DATA`/`BLOCKED`/`UNANSWERABLE`; `MIN` de anclas |
| 11 | Conocimiento | `doc_id` | KH registry | Promoción gobernada, nunca escritura directa |

## 8.2 Reglas de la cadena

| ID | Regla |
|---|---|
| TR-1 | Cada eslabón apunta al **anterior por ID**, nunca por copia de contenido. |
| TR-2 | Un eslabón faltante se declara: se reporta `NO_DATA` / `PARTIAL`. **Nunca se rellena con inferencia** (N-1). |
| TR-3 | La evidencia hereda el estado de la observación; una predicción nunca convierte `DISENO` en `REAL`. |
| TR-4 | La huella (`sha256`) del asset se verifica en cada salto; huella distinta invalida la cadena y se reporta `BLOCKED`. |
| TR-5 | Todo modelo —ML, DL o LLM— declara `model_run_id`, `tool_version`, `input_observation_ids[]` y `governance_version`. Sin eso, su salida no es evidencia. |
| TR-6 | La trazabilidad es **bidireccional por lectura**: de modelo a observación y de observación a modelo. |

---

# 9. Estructura futura compatible con fuentes externas y propias

## 9.1 Contrato de fuente

Toda fuente externa se incorpora como **`REF`** mediante un `source_id` con: `source_card.md` (licencia, dominio, versión), `manifest_ref.<id>.yaml` (IDs originales, mapeo, filtros), `checksums`, y un **crosswalk** `source_label → event_type`. El `original_id` de la fuente **jamás se sobrescribe** (AS-4). Esto replica el patrón ya diseñado para AudioSet/FSD50K en la capa REF acústica.

## 9.2 Matriz de compatibilidad

| Fuente | Forma nativa | Mapeo al modelo | Uso gobernado | Estado |
|---|---|---|---|---|
| **PlantVillage** | Imagen etiquetada, fondos controlados (~54.305 imágenes según documentación propia) | 1 imagen → 1 observación monomodal (`image_` asset) + `event_type` de enfermedad | **Bootstrap** de imagen; nunca verdad de producción (generalización a campo incierta) | `REF` |
| **PlantDoc** | Imagen en condición de campo | Igual que PlantVillage; conservar `original_id` y licencia | Holdout de dominio real / análisis de desplazamiento | `REF` (cifras por verificar en `source_card`) |
| **IP102** | Imagen de plagas, jerarquía de 102 clases | El nivel jerárquico se mapea a `parent_id` del vocabulario de imagen; nunca se aplana | Clases finas de plaga con agregación por padre | `REF` (cifras por verificar en `source_card`) |
| **iNaturalist** | **Ya es observación**: foto(s), taxón, ubicación, fecha, observador | Mapeo más directo: `observation_id` propio con `original_id` = observation de iNaturalist; fotos → `image_` assets; taxón → `event_type` | Biodiversidad / AVE / INSECTOS; licencia **por observación**, excluir `ND` | `REF` |
| **Datasets propios SIGCT-Rural** | Audio `v1/` (7 muestras) · imágenes agrícolas (22.488 / 16 clases) | Envoltura con `legacy_sample_id` o `original_id`; mismos IDs estables | **Única base de evaluación** de modelos propios | `REAL-LOCAL` / `REAL` / `REF` según evidencia |

## 9.3 Reglas

| ID | Regla |
|---|---|
| FX-1 | Ningún asset externo entra en los splits propios de evaluación (hereda `REFONLY`). |
| FX-2 | Licencia por activo con lista cerrada; `ND` excluido; `NC` marcado; `SA` aislado. |
| FX-3 | El crosswalk es un **mapa de lectura**, no una reescritura: la etiqueta original permanece en `provenance.original_label`. |
| FX-4 | Las cifras de fuentes externas no se afirman como canónicas hasta verificarlas en su `source_card`. |
| FX-5 | Esta misión **no descarga ni genera** ningún dataset: solo fija el contrato de compatibilidad. |

---

# 10. Cómo ACP y Knowledge Hub consumen `observation_id`

## 10.1 ACP: del `sample_id` a la observación como ancla

Hoy el ACP (F4) ancla sus respuestas en `signal_id`, `evidence_id` y `doc_id`, con confianza `MIN` y veredictos `NO_DATA`/`PARTIAL`/`BLOCKED`/`UNANSWERABLE` (Carta IA). El cambio es **aditivo y de una sola línea conceptual**:

| Antes (muestra aislada) | Después (observación) |
|---|---|
| Ancla = `sample_id` / `signal_id` | Ancla raíz = **`observation_id`**; assets y eventos son hijos del ancla |
| Una respuesta cita un audio | Una respuesta cita una observación y declara **qué modalidades** la sustentan |
| Confianza de una señal | `MIN` de las anclas de la observación (F4 §9, sin cambios) |
| "No hay dato" = señal ausente | `NO_DATA` = observación localizable pero sin evidencia suficiente |

**Reglas:**

| ID | Regla |
|---|---|
| AC-1 | Toda afirmación factual del ACP lleva `observation_id` como ancla, o no existe (extensión de H5). |
| AC-2 | El ACP **lee** Observation Registry → Evidence Ledger (`evidence_id` por observación) → KH registry (`docsByObservation`). |
| AC-3 | El ACP **no escribe** en el Ledger ni en el KH: produce interpretación; el productor gobernado la registra (C-5, F3E-9). |
| AC-4 | Si una modalidad está `ROTO`, `SIM` o `DISENO`, la respuesta lo declara; la penalidad de confianza se aplica, nunca se oculta (N-7). |
| AC-5 | El `LLM / Interprete` sigue siendo **slot intercambiable** y redactor limitado por anclas; no decide hechos (Carta IA, cadena de autoridad). |
| AC-6 | Las v1 siguen siendo legibles: una observación envolvente con `legacy_sample_id` da ancla al ACP sin migrar la fila original. |

## 10.2 Knowledge Hub: `docsByObservation` derivado

| ID | Regla |
|---|---|
| KH-1 | `docsByObservation(observation_id)` se deriva por lectura del registry y del mapa de entidades — **única fuente**, igual que `docsBySignal` (F3E). |
| KH-2 | **Nunca** se escribe la relación en ambos lados (observación y documento). No existen punteros duplicados. |
| KH-3 | La promoción de evidencia a documento canónico pasa por el **Hangar de Autenticidad** y regenera el registry; jamás es escritura ad-hoc. |
| KH-4 | Al regenerar el registry, el `doc_id` pasa a declarar `observation_refs[]` derivados; la observación no guarda una copia del documento. |
| KH-5 | Un documento puede sustentar muchas observaciones y una observación puede sustentar muchos documentos (N:M derivado). |
| KH-6 | El KH presenta conocimiento con su estado honesto; la existencia de un `observation_id` **no** convierte la evidencia en conocimiento verificado sin promoción gobernada. |

## 10.3 Ejemplo trazable (fin de la cadena)

```
obs_20261120_campo07_0001
  ├─ audio_..._000   → class_id=abejas  (taxonomy_v2, DISENO, 0 clips)
  ├─ telemetry_..._hum → humedad 61 %
  └─ evt_20261120_campo07_0002 (abejas_detectadas)
          ↓
     evidence_id (producida por el sensor gobernado; hereda DISENO/REAL-LOCAL)
          ↓
     model_run_id (modelo de detección, declarado) → prediction_id
          ↓
     ACP: "actividad apícola observada en campo07; confianza MODERADA; ancla obs_..._0001"
          ↓  (veredicto NO_DATA si faltara evidencia; nunca invención)
     KH: doc promovido por gobernanza → docsByObservation(obs_..._0001)
```

---

# 11. Gates (definidos, NO ejecutados)

| Gate | Condición | Estado hoy |
|---|---|---|
| **G-MM-1** | Modelo de tres entidades ratificado con sus cardinalidades | **DISEÑO** (definido aquí) |
| **G-MM-2** | `observation_id` generado en captura real (audio → observación envolvente) | **PENDING** |
| **G-MM-3** | Sentinela OOD de imagen y telemetría aprobada por misión de gobernanza | **PENDING** |
| **G-MM-4** | Curación no destructiva ejecutada y auditada en al menos una modalidad | **PENDING** |
| **G-MM-5** | Crosswalk de una fuente REF verificada con licencia y huella | **PENDING** |
| **G-MM-6** | Observation Registry y `docsByObservation` derivados y legibles | **PENDING — DISEÑO** |
| **G-MM-7** | ACP respondiendo por `observation_id` con fixtures de rechazo (inventar ancla, subir confianza) | **PENDING — DISEÑO** |
| **G-MM-8** | Trazabilidad extremo a extremo verificada en un caso real | **PENDING** |

> La existencia de esta gobernanza **no cierra ningún gate**. Todo cierre requiere ejecución y evidencia.

---

# 12. Riesgos detectados

| ID | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| R-MM-1 | Confundir `event_type` con `event_id` | 🔴 | §3.3 lo separa explícitamente; los ejemplos de la misión se declaran `event_type` |
| R-MM-2 | Creer que imagen/telemetría ya están gobernadas | 🔴 | §1 declara su estado `DISENO`; las sentinelas son propuestas no creadas |
| R-MM-3 | Mezclar fuentes `REF` con evaluación propia | 🔴 | FX-1 / MG-10, herencia de `REFONLY` |
| R-MM-4 | Inventar estados nuevos al agregar modalidades | 🔴 | MG-5; agregación como distribución, nunca estado nuevo |
| R-MM-5 | Doble escritura del puente KH ↔ observación | 🟡 | KH-1/KH-2: índice derivado, fuente única |
| R-MM-6 | Reinterpretar la gobernanza como autorización de código/modelos | 🔴 | MG-12; §0 lista explícita de lo que NO se hace |
| R-MM-7 | Pérdida por refactorización al migrar v1 | 🔴 | OB-2 / MG-V-6 / §7.3: IDs sin taxonomía + envoltura, sin reescritura |
| R-MM-8 | Licencias externas (`ND`, `NC`, `SA`) mal gestionadas | 🟡 | FX-2, lista cerrada y verificación en `source_card` |
| R-MM-9 | κ simulado por presión de métricas | 🔴 | CU-8 / AN-16: `PENDING` obligatorio |

---

# 13. Próximos pasos (misiones futuras, NO ejecutadas)

| # | Misión / acción | Requiere |
|---|---|---|
| 1 | Revisión y commit selectivo de `.gitignore`, este documento y su compañero | Decisión de Bernardo |
| 2 | `docs/governance/multimodal_entity_model_v1.md` — **ya generado en esta misión** (diagramas) | Ninguna |
| 3 | Observación envolvente para las 7 muestras acústicas v1 (`legacy_sample_id`) | Misión explícita, sin tocar v1 |
| 4 | `docs/image/` y `docs/telemetry/`: taxonomía, OOD y anotación propias | Misiones de gobernanza separadas |
| 5 | Observation Registry declarativo + `docsByObservation` derivado | Misión de gobernanza / implementación |
| 6 | Crosswalk verificado de una fuente REF (iNaturalist es la de forma nativa más cercana) | Verificación de licencia y fuente |
| 7 | ACP consumiendo `observation_id` con fixtures de rechazo | Misión de implementación + gates G-MM-7 |

---

# 14. Cierre

Esta misión entrega la **primera arquitectura oficial multimodal del ecosistema SIGCT-Rural**. El criterio de éxito —crecer de audio a audio + imagen + telemetría + IA **sin refactorizaciones futuras**— se satisface porque:

1. `observation_id` es **estable entre versiones** y no codifica taxonomía (OB-2).
2. Los assets se **añaden** a la observación sin cambiar su identidad (OB-4, AL-1).
3. El `event_id` es el pegamento entre modalidades y entre observaciones (EV-2), sin clases combinadas.
4. v1 sobrevive por **envoltura**, no por migración (§7.3).
5. Los contratos de OOD, curación, versión, trazabilidad y consumo por ACP/KH son **los mismos** para las tres modalidades (MG-3).

**Estado honesto:** arquitectura **OFICIAL y DISEÑADA**. Sin código, sin modelos, sin datasets nuevos, sin modificar audio/taxonomy_v2/rules-v0/dataset v1/captura rápida/captura experta. Sin commit, push, merge ni tag. Los gates permanecen abiertos hasta que exista evidencia.

---

*Fin de la gobernanza multimodal padre. Complementa —nunca sustituye— la Constitución, la Carta IA, D-003 y la gobernanza acústica v2.*
