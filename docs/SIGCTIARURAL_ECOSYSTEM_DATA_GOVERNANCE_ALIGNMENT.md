# SIGCTiArural — ECOSYSTEM DATA GOVERNANCE ALIGNMENT (Alineación de Gobernanza de Datos del Ecosistema)

**Clasificación:** 🗳️ **DOCUMENTACIÓN CANÓNICA — DOCUMENTO DE GOBERNANZA (aclaración/alineación/corrección)**
**Documento:** SIGCTIARURAL_ECOSYSTEM_DATA_GOVERNANCE_ALIGNMENT
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `5a079f4`
**Tipo:** MISIÓN CRÍTICA — CRÍTICA SIGCTIARURAL ECOSYSTEM ALIGNMENT · DATA GOVERNANCE CANONICAL UPDATE.
**MODO:** DOCUMENTACIÓN CANÓNICA. PERMITIDO: actualizar/sincronizar/corregir documentación. **PROHIBIDO:** backend, Docker, frontend, manifiestos, Dataset V2, DDD, Hexagonal, **commits**.
**Regla de corrección:** las correcciones se expresan SOLO mediante bloques de aclaración, alineación y gobernanza, en ESTE documento. Ningún documento canónico fue modificado en sitio.

---

## 0. Tesis de la misión

> SIGCTiArural **NO** es un sistema agrícola, **NO** es un clasificador de plantas, **NO** es "PlantVillage". Es un **ecosistema de ciencia, tecnología, investigación, IA, IoT, telemetría y conocimiento verificable**, construido sobre Bounded Contexts, **agnóstico de hardware, de sensor, de cultivo y de dominio**. La Agricultura es el **contexto productivo #1** de ocho, y el Dataset V2 es su baseline científico — no la identidad del ecosistema.

**Invariantes que este documento consolida:**
1. `ECOSYSTEM_IDENTITY.md` es el vértice de identidad (fuente de verdad de qué es y qué no es el ecosistema).
2. **8 contextos productivos**: Agricultura (#1), Ganadería, Apicultura, Piscicultura, Robótica, Telemetría, Investigación, Nuevos dominios.
3. **Dataset V2 canónico se conserva** (PlantVillage, **21.160/16/3**, split 70/15/15 → 80/20 según MASTERPLAN): baseline científico, benchmark reproducible, warm-up de feature extractor, dataset oficial del caso ADSO/SENA.
4. **Dataset V2+ es evolución ADITIVA** del contexto Agricultura: PlantVillage + PlantDoc + FieldPlant + Coffee (JMuBEN/JMuBEN2) + Cocoa (CocoaMonilia + KaraAgroAI), con capas futuras por contexto productivo.
5. Honestidad de estado (real/referencia/simulación/diseño) es invariante de dominio, no opción de UI.

---

## 1. Bloque de ACLARACIÓN — Identidad del ecosistema (leer primero)

### 1.1 Qué ES (fuente: `docs/ECOSYSTEM_IDENTITY.md:63`)

> "SIGCT-Rural es un ecosistema vivo de conocimiento verificable donde formación, investigación, inteligencia artificial, laboratorios y telemetría convergen para transformar aprendizaje en evidencia, y evidencia en conocimiento — construido sobre Bounded Contexts, agnóstico de hardware y software, y validado a través de EIARC como su primer caso de uso productivo real."

### 1.2 Qué NO es (fuente: `ECOSYSTEM_IDENTITY.md:11-12`, `AI_ONBOARDING_GUIDE.md §1`)

- No plataforma, no aplicación, no dashboard aislado, no laboratorio, no IA.
- No LMS.
- No plataforma IoT (IoT es instrumento, no identidad).
- **NO es un sistema agrícola ni un clasificador de enfermedades de plantas** — la agricultura es dominio de aplicación del contexto #1, no la esencia del ecosistema.

### 1.3 El origen no es la identidad

`ECOSYSTEM_IDENTITY.md:21` documenta el origen: el proyecto **nació** como monitoreo agrícola con IoT (pH, enfermedades de plantas). Evolucionó deliberadamente para **no** ser "un simple sistema clasificador de enfermedades", sino un ecosistema donde se investiga ciencia de datos, ML, DL y algoritmos usando variables agropecuarias como dominio de aplicación **sin quedar limitado a ellas**.

**Lectura correcta:** toda mención de "agricultura sostenible", "sector agrícola" o "PlantVillage" en la documentación debe leerse como (a) el origen histórico, (b) el caso de uso productivo #1, o (c) un propósito social (los ODS: Hambre Cero), **nunca** como la definición completa del ecosistema.

### 1.4 Mapa de los 8 contextos productivos

| # | Contexto productivo | Rol en el ecosistema | Estado dataset |
|---|---|---|---|
| 1 | **Agricultura** | Caso #1 · EIARC (productivo real) · baseline V2 (21.160/16/3) + V2+ aditivo (PlantDoc, FieldPlant, Coffee, Cocoa) | V2 en diseño (0% físico) · V2+ diseñado |
| 2 | **Ganadería** | Telemetría biológica UBTN (collares) · biométrica multiespecie | Diseño (RI-18, gaps B1) |
| 3 | **Apicultura** | Acústica de colmenas · salud de polinizadores | Diseño (RI-14) |
| 4 | **Piscicultura** | Calidad de agua · oxígeno · ciclos de cría | Diseño (RI-15, Fase 9) |
| 5 | **Robótica** | Estrategias de dominio labs (robótica real implementada) | —
| 6 | **Telemetría** | Contexto más maduro · V3 hexagonal · F1 real en 8010 | Real (ingesta operativa) |
| 7 | **Investigación** | Línea transversal · Knowledge Hub (51 docs) · research_v2 | Real (documental) |
| 8 | **Nuevos dominios** | Cualquier dominio vivo futuro (acústica, señales, ambiente, salud) | Por definir |

Fuente de contexto productivo `Agricultura/Electrónica/Robótica/Telecom` + futuros en `README.md:187-193` (mindmap) y `PLAN_MAESTRO.md:21,41-59`; reconciliado aquí a 8 con los dominios que ya aparecen en `UBTN_ROADMAP.md` y `MASTERPLAN §3`.

---

## 2. Bloque de ALINEACIÓN — Revisión documento por documento

Método: se revisó cada documento de la lista REVISAR, se detectaron formulaciones que inducen "SIGCTiArural = Agricultura" y se les asocia el bloque correctivo. **Los originales NO se editaron**; la corrección vive aquí.

### 2.1 `README.md`

**Hallazgo A1 — Tagline agrícola-centrista (línea 26):** "Ecosistema autónomo y agnóstico de hardware/software que integra IoT, IA, laboratorios interconectados y educación técnica **para impulsar la agricultura sostenible** y la inclusión tecnológica en zonas rurales de Colombia."
- **Aclaración:** la oración ya declara "ecosistema autónomo y agnóstico"; la cláusula "para impulsar la agricultura sostenible" es **un propósito social** (ODS Hambre Cero, `README.md:100`), no la identidad. El README mismo, líneas 68-70, define el ecosistema sin acotarlo a agricultura ("agnóstico de hardware y software por diseño — cualquier fuente de señal puede conectarse").
- **Alineación:** léase línea 26 como: "ecosistema... que integra... para impulsar la agricultura sostenible **como primer caso de uso productivo (EIARC)** y, en general, la inclusión tecnológica rural". El resto del README (mindmap 156-195, C4 216-258) ya es multi-dominio.
- **Gobernanza:** si se edita el README en el futuro, el tagline debe separar "propósito social" de "identidad del ecosistema".

**Hallazgo A2 — Usuario "Agricultor/Técnico" como único actor (líneas 222, 232):** "Actores de Contextos Productivos (Agricultor/Técnico — multi-dominio)".
- **Aclaración:** "multi-dominio" ya califica; los contextos productivos son 8 (agro, ganadería, apicultura, piscicultura, robótica, telemetría, investigación, nuevos dominios). El "Agricultor" es el actor del contexto #1 solamente.
- **Alineación:** leer "Agricultor/Técnico" como "actor del contexto productivo #1 (ej. agricultor)" y no como rótulo global.

**Hallazgo A3 — `README.md:348` "SIGC&T evoluciona dentro de una línea arquitectónica más amplia llamada EIARC":**
- **Aclaración:** inversión de identidad ya registrada (D1 en `CANONICAL_ENGINEERING_REVIEW.md:180`). Ley vigente: **EIARC es el caso de uso productivo real del ecosistema**, no el paraguas que contiene a SIGCTiArural (`ECOSYSTEM_IDENTITY.md:41-45`).
- Sin relación con agricultura per se, pero refuerza la lectura correcta del ecosistema.

**Veredicto README:** texto mayoritariamente alineado (define bien el ecosistema); require solo lectura corregida de A1-A3. No fue editado.

### 2.2 `AGENTS.md`

**Hallazgo B1 — Dato de estado git desactualizado:** AGENTS.md (2026-09-21) describe HEAD `0989ec9` y "1 archivo M (`Dashboard.jsx`) + `dashboard_rc2_ui.patch`". **Estado real verificado hoy (2026-09-23):** HEAD `5a079f4` (commit `docs(dataset-v2)` de `5a079f4`, tras `86d545e` y `b031f28`); la rama ya no está en `0989ec9`. El working tree tiene **5 archivos untracked** (`dashboard_rc2_ui.patch` + 4 docs V2+ míos) — ver §5.5.
- **Aclaración:** no es un fallo de identidad; es latencia de un doc vivo. AGENTS.md sigue siendo correcto en identidad ("ecosistema vivo de conocimiento verificable", EIARC primer caso de uso real).
- **Alineación/Gobernanza:** la próxima actualización de AGENTS.md debe fijar HEAD `5a079f4` y el bloque "Cómo retomar mañana" debe añadir este documento a la cadena de lectura (punto 2): `ECOSYSTEM_DATA_GOVERNANCE_ALIGNMENT` antes de `DATASET_V2_MASTERPLAN`.

**Veredicto AGENTS.md:** sin formulación agrícola; requiere solo sync de estado git (§5.5).

### 2.3 `docs/MASTERDOC.md`

**Hallazgo C1 — Identidad del proyecto (línea 49):** "SIGC&T Rural es una **plataforma web** híbrida Cloud/Edge de código abierto que integra IoT, IA y educación técnica **para impulsar la agricultura sostenible**..."
- **Aclaración:** dos desviaciones respecto a `ECOSYSTEM_IDENTITY` — (a) "plataforma" (el ecosistema es explícitamente "No plataforma"), y (b) agricultura como fin último. El MASTERDOC es documento histórico-vivo (bitácora); su identidad quedó **superada por `ECOSYSTEM_IDENTITY.md`** (que el propio MASTERDOC cita como fuente de identidad en su §0 tabla "Qué Cubre": EIARC y ecosistema).
- **Alineación:** cuando se edite, línea 49 debe decir: "SIGC&T Rural es un **ecosistema** agnóstico de hardware/software que integra IoT, IA, laboratorios y educación técnica; impulsa la agricultura sostenible y la inclusión tecnológica rural **como su primer caso de uso (EIARC)**".

**Hallazgo C2 — "Evolución de Alcance: Ecosistema EIARC" (línea 63):** define EIARC con "dos significados" (marco arquitectónico + expansión productiva agropecuaria Fase 9). Coherente con `README.md:348` pero superado en su lectura (EIARC no es paraguas, es caso de uso).
- **Alineación:** leer la expansión productiva listada (telemetría veterinaria, apicultura, piscicultura) como ejemplos de los **contextos productivos #2/#3/#4** del ecosistema, no como "expansión de un marco".

**Veredicto MASTERDOC:** es el mayor inductor de lectura "sistema agrícola" junto con la tagline del README. Corrección vía este documento; MASTERDOC no fue modificado.

### 2.4 `docs/PLAN_MAESTRO.md`

**Hallazgo D1 — Objetivo principal (línea 19):** "Desarrollar SIGC&T Rural como plataforma web híbrida (Cloud/Edge) que integra IoT, IA y educación técnica **para el sector agrícola**..."
- **Aclaración:** el PLAN MAESTRO es el roadmap de fases (autoridad de fase), articulado históricamente sobre el caso ADSO/SENA = sector agrícola/agropecuario. El texto ya está auto-marcado: línea 39 **"⚠️ DOCUMENTO SUPERADO (20-jul-2026) ... Ver `docs/ECOSYSTEM_IDENTITY.md` ... referencia histórica, no fuente de verdad"**. Por tanto, "para el sector agrícola" es el alcance del *plan de proyecto productivo SENA*, no el alcance del ecosistema.

**Hallazgo D2 — "EIARC (Ecosistema de Inteligencia Artificial y Robótica para el Campo)" (líneas 21, 41, 43):** expande EIARC como "ecosistema agropecuario integral" (apicultura, piscicultura, ganadería, avicultura, invernaderos).
- **Aclaración:** esa reconceptualización como "ecosistema agropecuario" **fue reemplazada** por `ECOSYSTEM_IDENTITY.md` (EIARC = caso de uso productivo real de SIGCTiArural; los dominios listados siguen siendo válidos como futuros contextos productivos #2/#3/#4).
- **Alineación:** cuando se actualice, la Fase 9 debe describirse con el vocabulario de los 8 contextos productivos, no como "expansión agropecuaria del campo".

**Veredicto PLAN_MAESTRO:** correctamente auto-declarado superado en identidad; es la fuente legítima de fases/roadmap. Sin editar.

### 2.5 `docs/ECOSYSTEM_IDENTITY.md`

**Hallazgo E1 — Ninguno de equidad agrícola.** Es el documento de identidad vigente; su propia §"El origen y la evolución" (línea 21) explica la salida deliberada del "clasificador de enfermedades". Totalmente alineado con la tesis.
- **Aportación de gobernanza:** este documento NO enumera los 8 contextos productivos explícitamente. Se recomienda (futura edición, no realizada) añadir la tabla §1.4 de este documento como anexo de "contextos productivos".

**Veredicto ECOSYSTEM_IDENTITY:** ✅ vértice, sin corrección.

### 2.6 `SIGCT_RURAL_SYSTEM_BOOT.md`

**Hallazgo F1 — Sección 1 "Qué es SIGCT-Rural" (línea 61):** "SIGCT-Rural es un proyecto productivo ADSO - SENA que evolucionó desde una plataforma SIGCT-Rural funcional hacia una línea arquitectónica más amplia denominada EIARC."
- **Aclaración:** presenta a EIARC como línea "más amplia" que contiene a SIGCT (inversión). El propio doc lo declara **superado** en su encabezado (líneas 8-16) y en la tabla de vigencia (§1 "Superado — contradicción de identidad... ver `docs/ECOSYSTEM_IDENTITY.md`"). La lectura vigente es la inversa: SIGCTiArural es el ecosistema; EIARC es **su** caso de uso productivo real.
- **Nota de matiz:** la palabra "Rural"/"Campo" del nombre es **denominación histórica** del contexto de origen (monitoreo rural/agrícola), no restricción de dominio. El ecosistema es agnóstico de dominio aunque conserve el nombre.

**Veredicto SYSTEM_BOOT:** gobernanza de entrada; identidad ya transferida a ECOSYSTEM_IDENTITY. Sin editar.

### 2.7 `docs/SIGCTIARURAL_CANONICAL_ENGINEERING_REVIEW.md`

**Hallazgo G1 — Alineado por construcción.** La revisión canónica ya resuelve la identidad (`§1 Identidad del proyecto`), registra inversión D1 (README:348) y concluye que la verdad arquitectónica es el "Ecosistema Vivo de Conocimiento Verificable... agnóstico de hardware" (`§Resultado 5, línea 258`).
- **Única referencia agrícola operativa:** "Producción agrícola = diseño" (`§7` — proyecto **AGRICULTURA-INTELIGENTE** en `projects-data.js` como `diseño`). Es un **proyecto** del ecosistema (contexto #1), no la identidad. Coherente con la honestidad de estado.

**Veredicto CANONICAL_ENGINEERING_REVIEW:** ✅ alineado; no registra formulación "SIGCTiArural = Agricultura".

### 2.8 `docs/SIGCTIARURAL_AI_ONBOARDING_GUIDE.md`

**Hallazgo H1 — Alineado.** `§1` define el ecosistema agnóstico y lo que no es; `§2` historia V1/V2/V3/UBTN/EIARC; Lenguaje Ubicuo sancionado. No induce lectura agrícola.
- **Aportación:** sus "80 contextos" no existen; pero referencia correctamente las 3 enumeraciones de contextos coexistentes (7 EIARC / 6 reconciliados / tabla ADSO) — invariante a conservar.

**Veredicto AI_ONBOARDING_GUIDE:** ✅ alineado.

### 2.9 `docs/SIGCTIARURAL_RC2_FREEZE.md`

**Hallazgo I1 — Referencias agrícolas contextuales, no identitarias.** `§4` (depende de backend: "Dataset agrícola físico"), `§5` (datasets reales de agricultura), `§6` (Terminal de producción agrícola, proyecto AGRICULTURA-INTELIGENTE) describen hitos del **contexto #1**, todos honestamente marcados "en diseño/0 datos reales". Correcto.

**Veredicto RC2_FREEZE:** ✅ sin corrección.

### 2.10 `docs/SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` · 2.11 `docs/SIGCTIARURAL_DATASET_V2_EXECUTION_PLAN.md` · 2.12 `docs/SIGCTIARURAL_DATASET_V2_READINESS_REPORT.md`

**Hallazgo J1 — Naming `agriculture_*` y dominio tomate/papa/maíz.** Los tres documentos usan identificadores del contexto Agricultura (`agriculture_images_tomato-potato-corn_...`, taxonomy `agriculture_v2_taxonomy_v1`, label `agriculture_v2_label_schema_v1`).
- **Aclaración:** esos IDs son la **línea Agriculture AI V2** del programa de investigación (`AI_CONTEXT_V2_ARCHITECTURE` define 8 bloques: Agriculture, Animal Health, Telemetry, Feature Engineering, Computer Vision, Time Series, Recommendation Engine, Knowledge AI). Es decir: **el dataset V2 materializa el bloque/contexto #1**, no "el dataset del ecosistema".
- **Alineación:** el ecosistema tendrá, por diseño de programa, datasets futuros por contexto (Ganadería/UBTN → series fisiológicas; Apicultura → acústica; Piscicultura → telemetría; Investigación → Knowledge/RAG), conforme a `MASTERPLAN §3` ("Dominios futuros").
- **Gobernanza:** el patrón de IDs debe replicarse por contexto cuando se diseñen (`<contexto>_<modalidad>_<taxonomy-version>...`). El esquema `species__condition__source` del V2+ sigue siendo válido como convención interna del contexto Agricultura.

**Veredicto V2 MASTERPLAN/EXECUTION/READINESS:** correctos como plan del contexto #1; requieren solo lectura con la aclaración J1. **NO se modifican.** Dataset V2 canónico **permanece vigente como baseline** (incluso tras V2+).

### 2.13 `docs/SIGCTIARURAL_DATASET_V2_PLUS_MVP.md` (generado 2026-09-22)

**Hallazgo K1 — Ya alineado por diseño.** El MVP V2+ se declara "extensión ADITIVA" y deja "Dataset V2 canónico — PERMANECE VIGENTE E INVIOLABLE" (líneas 15-19). Sus DOM1 (leaf-lab), DOM2 (leaf-field), DOM3 (coffee), DOM4 (cocoa) son **dominios de evaluación del contexto Agricultura**, no del ecosistema.
- **Aclaración adicional:** el MVP cubre cultivos (agricultura #1). Las **capas futuras** que el MVP menciona ("futuro: Ganadería, Apicultura, Piscicultura, Robótica, Telemetría, Investigación" — ver §1.4) serán datasets propios por contexto, con sus propios manifiestos y taxonomías, siguiendo el mismo patrón de gobernanza.
- **Coherencia:** el dataset V2+ no sustituye a V2 ni como baseline científico ni como dataset oficial ADSO/SENA; son artefactos complementarios del mismo contexto.

**Veredicto DATASET_V2_PLUS_MVP:** ✅ alineado.

### 2.14 `docs/SIGCTIARURAL_MULTIDATASET_FEASIBILITY_AUDIT.md` (generado 2026-09-22)

**Hallazgo L1 — NO CANÓNICO correcto.** Se autodeclara "⚠️ NO CANÓNICO · SOLO INVESTIGACIÓN", no reemplaza a DATASET_V2, y evalúa fuentes de los contexto agrícola/tropical. No induce lectura de identidad.

**Veredicto MULTIDATASET_FEASIBILITY_AUDIT:** ✅ alineado.

---

## 3. Bloque de GOBERNANZA — Reglas de gobernanza de datos del ecosistema

### G-1 Identidad de datos
Todo dataset/artefacto de datos del ecosistema debe declarar a qué **contexto productivo** pertenece (`context: agriculture | livestock | apiculture | aquaculture | robotics | telemetry | research | new_domain`) en su manifiesto. El prefijo `agriculture_*` es válido solo para el contexto #1.

### G-2 Dataset V2 — inviolable como baseline
La identidad `agriculture_images_tomato-potato-corn_taxonomy-v1_labels-v1_dataset-v1` (21.160/16/3, PlantVillage `raw/color`, split 70/15/15 seed 42 con anti-fuga pHash) es el **benchmark reproducible oficial y dataset ADSO/SENA**. No se reescribe, no se elimina, no se baja de categoría. V2+ es aditivo.

### G-3 Dataset V2+ — aditivo y gobernado
V2+ (PlantVillage + PlantDoc + FieldPlant + Coffee JMuBEN/JMuBEN2 + CocoaMonilia + KaraAgroAI) es **extensión coordinada del contexto #1**, con:
- Manifiestos de proveniencia por fuente.
- Dedup exacta + pHash con log preservado.
- Normalización a `species__condition__source`.
- Anti-fuga global + split por dominio (benchmark por dominio, no softmax global).
- Beneficio científico central: **benchmark de robustez lab→field** (PlantVillage vs PlantDoc/FieldPlant) — evaluación, no mezcla ciega.

### G-4 Capas futuras por contexto
Los contextos #2-#8 tendrán sus propios programas de datos cuando la misión lo ordene, usando el mismo patrón de gobernanza (manifiestos, taxonomía, split, dedup, holdout, dataset card). **Prohibido** declararlos materializados o con "gold standard" antes de existir evidencia física (invariante de honestidad; gaps IA1/IA2 de UBTN).

### G-5 Honestidad de estado (reforzado)
Ninguna capa futura puede presentarse como validez de campo sin `real_world_holdout` propio. El bootstrap V2 es laboratorio; V2+ campo externo (PlantDoc/FieldPlant/Coffee/Cocoa) es **dominio de evaluación**, no aún "producción real" del ecosistema.

### G-6 Precedencia documental (sin cambios)
`ECOSYSTEM_IDENTITY.md` > `SIGCT_RURAL_SYSTEM_BOOT.md` (índice/gobernanza) > `MASTERDOC.md` (bitácora/arq.) > `PLAN_MAESTRO.md` (fases) > planes de datos (V2/V2+) como especificaciones de contexto. Este documento es gobernanza de alineación: no reemplaza a ninguno, los interpreta bajo la identidad canónica.

---

## 4. RESPONDER — Las 5 preguntas de la misión

### P1. ¿El ecosistema SIGCTiArural depende exclusivamente del dominio Agricultura para su identidad, misión o viabilidad?
**NO.** Su identidad es "ecosistema vivo de conocimiento verificable sobre Bounded Contexts, agnóstico de hardware y dominio" (`ECOSYSTEM_IDENTITY.md:63`). La Agricultura es el contexto productivo #1 — el primero en materializarse productivamente (EIARC) y el de mayor madurez documental — pero la misión (transformar aprendizaje en evidencia) y la arquitectura (Monolito Modular Hexagonal, `MASTERDOC §1`) no dependen de ella. Evidencia: los labs reales incluyen Robótica, Matemáticas, Embebidos, Telecom, Electrónica (`RC2_FREEZE §1`); la telemetría ya es real con F1 (`MASTERDOC.md:77`); UBTN/Ganadería, Apicultura y Piscicultura están en diseño como contextos propios (`PLAN_MAESTRO.md:41-59`).

### P2. ¿El Dataset V2 canónico debe ser reemplazado o degradado por el Dataset V2+?
**NO.** V2 es el baseline científico oficial: bootstrap de laboratorio reproducible, warm-up del feature extractor y dataset ADSO/SENA. V2+ **se diseña como extensión aditiva** (`DATASET_V2_PLUS_MVP §0:15-19`) y no altera manifiestos, taxonomía ni split de V2. Reemplazar V2 rompería el invariante NADA DESAPARECE y la comparabilidad del benchmark (solo comparable sobre el mismo dataset/split, `EXECUTION_PLAN §8`).

### P3. ¿El Dataset V2+ es una evolución aditiva y legalmente viable del contexto Agricultura?
**SÍ.** Aditivo: jerarquiza 4 dominios de evaluación (DOM1-4) sin fusionar en un softmax global y sin tocar V2. Legalmente viable: las 6 fuentes aprobadas son CC BY 4.0 (PlantDoc, FieldPlant, JMuBEN/JMuBEN2, CocoaMonilia) o CC0 (KaraAgroAI); IP102, Banano 34,3 GB, Cassava NC y Cocoa unificado (NC-SA/ODbL) quedaron excluidos del MVP (`MVP §0:34-36`, `ACQUISITION_AUDIT`). El presupuesto ASUS (19 GB) es viable solo con KaraAgroAI como subset.

### P4. ¿La arquitectura puede alojar los 8 contextos productivos sin rediseño?
**SÍ.** La arquitectura ya absorbe nuevos dominios por diseño: estrategias de laboratorio (Strategy + Factory), Telemetry Context como puerta común de ingesta (`SensorReading` + contexto hermano `bio` vía ADR-UBTN-01), y `AIServicePort` para modelos por dominio (`PLAN_MAESTRO.md:54-57`, `CANONICAL_ENGINEERING_REVIEW §3`). Los 8 contextos productivos se materializan como estrategias/contextos/conjuntos de datos **nuevos**, no como reescritura. Coherente con "Fase 9 sin rediseño" de PLAN_MAESTRO.

### P5. ¿Existe algún documento canónico que deba contar con acceso prioritario de lectura por la gobernanza de datos?
**SÍ: `docs/ECOSYSTEM_IDENTITY.md`** como vértice (juicio de qué es el ecosistema), seguido de `SIGCT_RURAL_SYSTEM_BOOT.md` (índice y reglas de precedencia), `CANONICAL_ENGINEERING_REVIEW.md` (auditoría que ya registra D1-D7), y el `DATASET_V2_MASTERPLAN.md` (que define el patrón de dataset por contexto). Este documento de alineación debe leerse como intérprete de la identidad para cualquier plan de datos.

---

## 5. RESULTADO FINAL — 4 SI/NO con justificación arquitectónica

### R-1. ¿SIGCTiArural es un sistema agrícola? → **NO**
- **Arquitectónico:** identidad canónica = ecosistema sobre Bounded Contexts agnóstico (`ECOSYSTEM_IDENTITY.md:63`); contextos reales incluyen Telemetry (más maduro, real F1), Labs (Robótica/Matemáticas/Telecom/Electrónica), Knowledge, AI (`MASTERDOC §3`).
- **De dominio:** agricultura = contexto #1 (EIARC productivo), no identidad.
- **De datos:** `agriculture_*` es prefijo del contexto #1, no del ecosistema (G-1).

### R-2. ¿El Dataset V2 es reemplazado por V2+? → **NO**
- **Científico:** V2 es baseline reproducible oficial; V2+ es evaluación de robustez lab→field (G-2, G-3).
- **Documental:** `DATASET_V2_PLUS_MVP §0` lo declara "inviolable"; el Execution Plan exige comparabilidad sobre el mismo split (`§8`).
- **Gobernanza:** NADA DESAPARECE — V2 se preserva como artefacto versionado.

### R-3. ¿El Dataset V2+ es aditivo y compatible con el ecosistema? → **SÍ**
- **Arquitectónico:** se adiciona como capa de evaluación del contexto #1 sin tocar manifiestos/taxonomía/split de V2 (G-3).
- **Legal:** fuentes aprobadas CC BY 4.0/CC0; excluidos IP102, NC y volúmenes >19 GB (`MVP §0`, `ACQUISITION_AUDIT`).
- **Científico:** benchmark por dominio habilita el objetivo real: generalización lab→campo (60–90% esperado vs 30–45% solo-PlantVillage).

### R-4. ¿La arquitectura está abierta a nuevos contextos productivos? → **SÍ**
- **Patterns:** Strategy/Factory por contexto (`PRODUCTION CONTEXTS`), Telemetry como puerta de ingesta única con contexto hermano `bio` (ADR-UBTN-01), `AIServicePort` extensible (`PLAN_MAESTRO.md:54-57`).
- **Datos:** manifiestos por contexto (G-1), capas futuras por contexto (G-4), sin reescritura.
- **Gobernanza:** EIARC como primer caso de uso productivo materializado; los 8 contextos son evolución aditiva, no rediseño.

---

## 6. Anexo — Estado verificado de la revisión (2026-09-23)

| Documento REVISAR | Ruta real | Hallazgo | Veredicto |
|---|---|---|---|
| README.md | `README.md` | A1/A2/A3 | Alineado con lectura corregida |
| AGENTS.md | `AGENTS.md` | B1 (sync estado git) | Alineado; pendiente sync |
| MASTERDOC.md | `docs/MASTERDOC.md` | C1/C2 | Corrección vía bloques |
| PLAN_MAESTRO.md | `docs/PLAN_MAESTRO.md` | D1/D2 (auto-superado) | Alineado (histórico) |
| ECOSYSTEM_IDENTITY.md | `docs/ECOSYSTEM_IDENTITY.md` | E1 | ✅ vértice |
| SIGCT_RURAL_SYSTEM_BOOT.md | `SIGCT_RURAL_SYSTEM_BOOT.md` | F1 (auto-superado) | Alineado (histórico) |
| CANONICAL_ENGINEERING_REVIEW.md | `docs/SIGCTIARURAL_CANONICAL_ENGINEERING_REVIEW.md` | G1 | ✅ alineado |
| AI_ONBOARDING_GUIDE.md | `docs/SIGCTIARURAL_AI_ONBOARDING_GUIDE.md` | H1 | ✅ alineado |
| RC2_FREEZE.md | `docs/SIGCTIARURAL_RC2_FREEZE.md` | I1 | ✅ contextual |
| DATASET_V2_MASTERPLAN.md | `docs/SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` | J1 | Contexto #1 correcto |
| DATASET_V2_EXECUTION_PLAN.md | `docs/SIGCTIARURAL_DATASET_V2_EXECUTION_PLAN.md` | J1 | Contexto #1 correcto |
| DATASET_V2_READINESS_REPORT.md | `docs/SIGCTIARURAL_DATASET_V2_READINESS_REPORT.md` | J1 (0% físico, origen bloqueante) | Contexto #1 correcto |
| DATASET_V2_PLUS_MVP.md | `docs/SIGCTIARURAL_DATASET_V2_PLUS_MVP.md` | K1 | ✅ alineado |
| MULTIDATASET_FEASIBILITY_AUDIT.md | `docs/SIGCTIARURAL_MULTIDATASET_FEASIBILITY_AUDIT.md` | L1 | ✅ NO CANÓNICO correcto |

**Estado git real (verificado este análisis):** HEAD `5a079f4` · working tree con 5 untracked: `dashboard_rc2_ui.patch`, `SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_AUDIT.md`, `SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_ROADMAP.md`, `SIGCTIARURAL_DATASET_V2_PLUS_MVP.md`, `SIGCTIARURAL_MULTIDATASET_FEASIBILITY_AUDIT.md` (+ este documento). Sin commits (regla del modo).

---

*Documento de gobernanza canónico. Ningún documento canónico fue modificado en sitio; las correcciones se expresan mediante los bloques de aclaración, alineación y gobernanza de este archivo. Sin commits.*