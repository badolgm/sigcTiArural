# MODELO DE ENTIDADES MULTIMODALES V1 — DIAGRAMAS CONCEPTUALES

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:40:54-05:00
> - Origen: misión `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1` (documento compañero)
> - Destino: `docs/governance/multimodal_entity_model_v1.md` (NUEVO — visible para git, sin commit)
> - Nota: visualiza el modelo definido en `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1.md`. **No crea norma nueva.**

**Misión:** `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1`
**Naturaleza:** apéndice visual de gobernanza. Todo diagrama es una **representación** del contrato declarado en el documento padre; ante discrepancia, prevalece el documento padre.
**Estado:** **OFICIAL — DISEÑADO**. Sin código, sin modelos, sin datasets, sin commit.
**Notación:** diagramas ASCII en bloques de código, legibles sin plugins, sin Mermaid y sin dependencias externas.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Honestidad:** lo aquí dibujado es `DISENO` salvo las piezas marcadas como ya operativas (audio v1, bridge, taxonomía v2).

---

## 0. Índice de diagramas

| # | Diagrama | Responde a |
|---|---|---|
| D-1 | Tres entidades y cardinalidades | ¿Qué entidades existen y cómo se relacionan? |
| D-2 | Cadena de la misión y grafo canónico | ¿Cómo cuelgan audio, imagen, humedad, temperatura y ACP? |
| D-3 | Evento compartido entre modalidades | ¿Cómo se unen observaciones distintas en un evento real? |
| D-4 | Ciclo de vida completo | ¿Cómo se va de la captura al conocimiento? |
| D-5 | Máquina de estados OOD | ¿Qué pasa cuando nada encaja? |
| D-6 | Curación no destructiva | ¿Cómo se corrige sin borrar? |
| D-7 | Versiones hermanas v1/v2/v3 | ¿Cómo se evoluciona sin refactorizar? |
| D-8 | Fuentes externas y propias | ¿Cómo entran PlantVillage, PlantDoc, IP102, iNaturalist? |
| D-9 | Consumo por ACP y Knowledge Hub | ¿Cómo se lee `observation_id` en lugar de muestras aisladas? |
| D-10 | Envoltura de compatibilidad v1 | ¿Cómo se migra sin tocar v1? |

---

## D-1 · Tres entidades y cardinalidades

```
   ┌───────────────────────────────────────────────┐
   │            OBSERVATION_ID  (raíz)             │
   │   obs_20261120_campo07_0001                   │
   │   · estable entre v1 → v2 → v3                │
   │   · NO codifica taxonomía                     │
   │   · session · place · operator · captured_at  │
   └──────────────────────┬────────────────────────┘
                          │ 1 : 1..N  (pertenencia)
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
 ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐
 │  ASSET_ID   │   │ ANNOTATION  │   │   EVIDENCE_ID    │
 │ audio_...   │   │ annotation_ │   │ ev_... (derivada)│
 │ image_...   │   │ ..._001     │   └──────────────────┘
 │ telemetry_..│   └──────┬──────┘
 │ doc_... (ref)│          │ 0..N
 └──────┬──────┘           ▼
        │ 0..N        ┌───────────────────────────────┐
        ▼             │          EVENT_ID             │
 ┌─────────────┐      │ evt_20261120_campo07_0002     │
 │  EVENT_ID   │◄────►│ · 1 : 1..N observaciones      │
 │ (0..N)      │      │ · event_type = vocabulario   │
 └─────────────┘      │   (NO es el ID)               │
                      └───────────────────────────────┘

   Notación: ──► pertenece / deriva     ◄──► muchos a muchos
   Un asset pertenece a UNA observación; un evento une VARIAS.
```

**Lectura:** la observación es el único nodo con identidad estable. Los eventos son el único nodo que cruza observaciones. Los documentos (`doc_`) son referencias al registry, nunca copias.

---

## D-2 · Cadena de la misión y grafo canónico

**Lo que pide la misión (cadena lineal):**

```
observation_id
      │
      ▼
  audio.wav
      │
      ▼
  imagen.jpg
      │
      ▼
   humedad
      │
      ▼
 temperatura
      │
      ▼
 resultado ACP
```

**Contrato canónico (grafo).** Los assets no se encadenan entre sí: cuelgan de la observación. El resultado ACP no es un asset, es evidencia posterior que apunta al observation_id.

```
                       OBSERVATION_ID
                     obs_20261120_campo07_0001
                              │
     ┌──────────────┬─────────┴────────┬──────────────────┐
     ▼              ▼                  ▼                  ▼
 audio_..._000  image_..._003   telemetry_..._hum  telemetry_..._temp
  (AUDIO)        (IMAGE)         (TELEMETRY 61 %)    (TELEMETRY 24 °C)
     └──────────────┴─────────┬────────┴──────────────────┘
                              ▼
                        EVENT_ID (evt_..._0002)
                              │  deriva
                              ▼
                     evidence_id → model_run_id → prediction_id
                              │
                              ▼
                    resultado ACP (veredicto + anclas)
                              │
                              ▼
                 doc_id del KH  (docsByObservation, derivado)
```

**Regla:** la cadena lineal es válida como relato; el grafo es válido como contrato. Agregar una modalidad no cambia el `observation_id`.

---

## D-3 · Evento compartido entre modalidades

```
  OBS-1 (captura en campo07, 14:02)
    ├── audio_..._000   → class_id = lluvia
    └── image_..._001   → (sin evento visual)
                                  │
                                  ├──► EVENT_ID E-7  "esta lluvia"
                                  │        │
  OBS-2 (sensor fijo, campo07, 14:03)       │
    ├── telemetry_..._hum → 91 %            │
    └── telemetry_..._temp → 19 °C ─────────┘

  OBS-3 (captura en campo07, 14:20)
    └── audio_..._004   → class_id = lluvia ──► MISMO EVENT_ID E-7
                                                (mismo evento, otra observación)

  Resultado: 3 observaciones · 5 assets · 1 evento · 0 clases combinadas
  Prohibido: crear "lluvia_con_humedad_91" como clase.
```

**Lectura:** el evento es una decisión gobernada de pertenencia, no un cálculo de proximidad temporal (AL-3). La lluvia sigue siendo `lluvia` en audio, la humedad sigue siendo telemetría, y el evento las une sin fusionarlas.

---

## D-4 · Ciclo de vida completo

```
  [1] NACIMIENTO        productor gobernado
       session_id · operator_id · place_id · captured_at
            │
            ▼
  [2] OBSERVACIÓN       observation_id  ← se asigna AQUÍ, nunca después
       state = estado del productor (7 estados) · confidence_declared
            │
            ▼
  [3] ASSETS            audio_id · image_id · telemetry_id · sha256
       cada asset declara SU estado (paridad MG-3)
            │
            ▼
  [4] ANOTACIÓN         annotation_id · class_id / event_type
       acuerdo como categoría · Cohen κ = PENDING (sin simulación)
            │
            ▼
  [5] EVENTO            event_id · vocabulario u OOD
            │
            ▼
  [6] EVIDENCIA         evidence_id  (Ledger; hereda estado, NO lo mejora)
            │
            ▼
  [7] DATASET           split · manifest_id · dataset_version (hermano)
       REF jamás entra a splits propios
            │
            ▼
  [8] MODELO            model_run_id · ML | DL | LLM · input_observation_ids[]
            │
            ▼
  [9] PREDICCIÓN        prediction_id · confianza del modelo (ortogonal al estado)
            │
            ▼
  [10] ACP              veredicto + anclas · confianza = MIN de anclas
       RESOLVED | PARTIAL | NO_DATA | BLOCKED | UNANSWERABLE
            │
            ▼
  [11] KNOWLEDGE HUB    doc_id por promoción gobernada
       docsByObservation se DERIVA por lectura (nunca doble escritura)
```

**Regla de eslabón roto:** si falta cualquier eslabón, se declara; no se rellena con inferencia (TR-2).

---

## D-5 · Máquina de estados OOD

```
                    ┌──────────────────────────┐
                    │  NUEVO ACTIVO / EVENTO   │
                    └────────────┬─────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │ ¿Encaja en vocabulario│
                     │   canónico vigente?   │
                     └───────┬───────┬───────┘
                          SÍ │       │ NO
                             ▼       ▼
                  ┌──────────────┐  ┌────────────────────────────┐
                  │ ETIQUETA     │  │ Pasó control de calidad?   │
                  │ canónica     │  └──────┬────────────┬─────────┘
                  └──────────────┘       SÍ │            │ NO
                                            ▼            ▼
                      ┌──────────────────────────┐  ┌──────────────────┐
                      │ SENTINELA OOD            │  │ REJECTED /       │
                      │ + nota OBLIGATORIA       │  │ quarantine/ROTO  │
                      │ + NO sube confianza      │  │ (NO es OOD)      │
                      └────────────┬─────────────┘  └──────────────────┘
                                   ▼
                     ┌─────────────────────────────┐
                     │ ¿Es recurrente con evidencia│
                     └──────┬──────────────┬───────┘
                          NO│              │SÍ
                            ▼              ▼
                   ┌──────────────┐  ┌──────────────────────────────┐
                   │ Permanece    │  │ PROMOCIÓN = DECISIÓN          │
                   │ OOD (no se   │  │ DOCUMENTAL + bump de versión │
                   │ captura a    │  │ + huella sincronizada        │
                   │ demanda)     │  │ + nota OOD conservada        │
                   └──────────────┘  └──────────────────────────────┘

  Sentinelas:
    AUDIO      evento_desconocido            [OFICIAL, alias ruido_desconocido]
    IMAGEN     evento_visual_desconocido     [DISENO — NO creada]
    TELEMETRÍA lectura_desconocida           [DISENO — NO creada]
    COMPUESTO  evento_multimodal_no_resuelto [DISENO — se marca en event_id]
```

**Frontera:** OOD es incertidumbre semántica; una anomalía es un evento conocido. No se confunden (OO-5).

---

## D-6 · Curación no destructiva

```
   ANTES                                   DESPUÉS

   asset_A (sha256=abc)  ──┬──►  asset_A (sha256=abc)  INTACTO
                           │       │
                           │       │ curated_from
                           │       ▼
                           └──►  asset_A′ (sha256=def)  NUEVO
                                   curated_path=...
                                   motivo · autor · timestamp · versión

   annotation_1 (lluvia) ──┬──► annotation_1  INTACTA
                           │      │ supersedes
                           │      ▼
                           └──► annotation_2 (lluvia_fuerte)  NUEVA

   evt_7 ──────────────────► evt_7  SUPERSEDED_BY=evt_9  (evt_9 NUEVO)

   Reglas visuales:
     ✗ No se tacha, no se borra, no se reescribe la fila original
     ✓ Se añade una versión enlazada por ID
     ✓ El split NO se mueve · el estado NO sube · la confianza NO sube
     ✓ Rollback = volver a apuntar al ID original
```

---

## D-7 · Versiones hermanas

```
   data/datasets/
   ├── sigct_rural_acoustic/
   │   ├── v1/   ← INTACTO: 7 muestras, rules-v0, schema 1.3.0
   │   ├── v2/   ← HERMANO, no creado en esta misión (DISENO)
   │   └── v3/   ← RESERVADO, no creado (DISENO)
   │
   ├── agriculture_images_tomato-potato-corn/v1/   ← 22.488 imgs (REF)
   └── (futuro) reference/<source_id>/             ← capa REF, no creada

   Línea de tiempo de identidad:

   v1:  sample_id = ac_20261120_180207_000
                    │  envoltura con legacy_sample_id (sin tocar la fila)
                    ▼
   v2:  observation_id = obs_20261120_campo07_0001   ← MISMO ID en v3
        taxonomy = acoustic_v2_taxonomy (61)
                    │
                    ▼
   v3:  observation_id = obs_20261120_campo07_0001   ← NO se renombra
        taxonomy = superior (sin definir)
```

**Regla:** el ID atraviesa las tres versiones. La taxonomía cambia; la identidad no.

---

## D-8 · Fuentes externas y propias

```
    ┌───────────────────────────────────────────────────────────┐
    │              CAPA DE FUENTES (source_id)                  │
    ├──────────────┬──────────────┬──────────────┬──────────────┤
    │ PlantVillage │  PlantDoc    │   IP102      │ iNaturalist  │
    │ imagen REF   │ imagen REF   │ imagen REF   │ YA es obs.   │
    │ bootstrap    │ campo real   │ 102 clases   │ foto+taxón+  │
    │              │              │ jerárquicas  │ lugar+fecha  │
    └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
           │              │              │              │
           └──── source_card + manifest_ref + crosswalk + sha256
                          │
                          ▼
              ┌──────────────────────────────────┐
              │ ADAPTADOR DE FUENTE              │
              │ · original_id PRESERVADO         │
              │ · license por activo (ND excluido)│
              │ · source_label → event_type      │
              │ · estado = REF (nunca REAL)      │
              └────────────────┬─────────────────┘
                               ▼
              ┌──────────────────────────────────┐
              │ OBSERVACIONES REF                │
              │ ✗ NO entran a splits propios     │
              └──────────────────────────────────┘

    ┌───────────────────────────────────────────────────────────┐
    │ FUENTES PROPIAS = ÚNICA EVALUACIÓN                        │
    │ audio v1 (7 muestras REAL-LOCAL) · imágenes 22.488/16 REF │
    │ (según evidencia) → observaciones con legacy_sample_id    │
    └───────────────────────────────────────────────────────────┘
```

**Lectura:** iNaturalist es la fuente cuya forma nativa ya coincide con el modelo; PlantVillage/PlantDoc/IP102 requieren envoltura de imagen. Ninguna se descarga en esta misión.

---

## D-9 · Consumo por ACP y Knowledge Hub

```
   ANTES (muestras aisladas)              DESPUÉS (observación)

   sample_id ──► evidence_id ──► doc_id    observation_id ──┬──► asset_ids[]
        │             │             │                       ├──► event_ids[]
   ancla débil   ancla media   ancla final                  ├──► evidence_id
                                                            └──► docsByObservation

   FLUJO DE LECTURA DEL ACP:

   intención del usuario
          │
          ▼
   ┌──────────────────────┐
   │ Observation Registry │ ← observation_id (ancla raíz)
   └──────────┬───────────┘
              ▼
   ┌──────────────────────┐
   │ Evidence Ledger      │ ← evidence_id por observación (hereda estado)
   └──────────┬───────────┘
              ▼
   ┌──────────────────────┐
   │ KH registry          │ ← docsByObservation (DERIVADO, fuente única)
   └──────────┬───────────┘
              ▼
   ┌──────────────────────────────────────────────────────┐
   │ ACP: veredicto + ancla por afirmación                │
   │ confianza = MIN(anclas) · estado no mejora            │
   │ NO_DATA / PARTIAL / BLOCKED / UNANSWERABLE            │
   │ LLM / Interprete = redactor opcional, NO decide       │
   └──────────────────────┬───────────────────────────────┘
                          ▼ (solo si hay interpretación reproducible)
              productor gobernado → Ledger → revisión → KH (promoción)
              ✗ El ACP NO escribe directo al KH
```

---

## D-10 · Envoltura de compatibilidad v1

```
   FILA v1 (NO SE TOCA)
   ┌──────────────────────────────────────────────────────┐
   │ sample_id = ac_20261120_180207_000                   │
   │ class_id = voz · taxonomy_version = acoustic_v1      │
   │ sha256 = ... · session_id · place_id · annotator_id   │
   └──────────────────────────┬───────────────────────────┘
                              │ legacy_sample_id (lectura, sin reescritura)
                              ▼
   OBSERVACIÓN v2 (NUEVA, ADITIVA)
   ┌──────────────────────────────────────────────────────┐
   │ observation_id = obs_20261120_campo07_0001           │
   │ legacy_sample_id = ac_20261120_180207_000            │
   │ modality_set = [AUDIO]  (monomodal, válida)          │
   │ asset_ids = [audio_20261120_180207_000]              │
   │ provenance.original_id = (mismo WAV, misma huella)   │
   └──────────────────────────────────────────────────────┘

   Migración de los 9 class_id v1:
     7 idénticos  ──────────────► mismos IDs en v2
     2 alias activos ───────────► ruido_desconocido → evento_desconocido
                                  aves → (alias de ave, según taxonomy_v2)

   Resultado: 0 filas reescritas · 0 WAV copiados · 0 clases perdidas
```

---

## Cierre

Los diez diagramas muestran una sola idea repetida: **la observación es estable, el evento une modalidades y nada se reescribe**. Eso permite crecer de audio a audio + imagen + telemetría + IA sin refactorizaciones.

**Estado honesto:** `DISENO` salvo audio v1, bridge y taxonomía v2, que están operativos o promovidos. Sin código, sin modelos, sin datasets nuevos, sin commit.

---

*Apéndice visual de la gobernanza multimodal padre. Complementa, nunca sustituye.*
