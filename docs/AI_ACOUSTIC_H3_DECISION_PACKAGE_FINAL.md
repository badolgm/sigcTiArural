# REFERENCE ACOUSTIC CORPUS — H3 DECISION PACKAGE (D5) v1

**Misión:** `H3_DECISION_PACKAGE_FINAL` · **Fecha:** 2026-10-07 · **HEAD:** `a125a66` · **Estado:** SOLO PREPARACIÓN — NO descargar · NO crear `reference/` · NO modificar datasets
**Propósito:** cambios mínimos para cerrar **D5** (vocabulario `schema.json` que habilita la capa REF).
**Fuentes verificadas:** `data/datasets/sigct_rural_acoustic/v1/metadata/schema.json` (leído íntegro, 344 líneas, `schema_version 1.2.0`).

**Decisiones de alcance cerradas previamente (H3_READINESS):** AudioSet=ontología · BirdCLEF=diferido · `abejas`/`paisaje rural`=taxonomy v2.

---

# 0. RESUMEN EJECUTIVO

D5 exige ampliar el **vocabulario** del contrato para el material REF sin alterar la estructura ni el C0.
El análisis del `schema.json` real muestra que el paquete es **aditivo mínimo: 2 valores en 2 enums** y **0
cambios estructurales**:

| Elemento | Cambio | Por qué |
|---|---|---|
| `schema_version` | `1.2.0` → **`1.3.0`** | bump minor aditivo (regla declarada) |
| `partition.values` | + **`"reference"`** | la partición de la capa C1/C2 |
| `source.values` | + **`"audioset"`** | ontología/anotaciones C2 (fuente sin audio) |
| `license.values` | **sin cambio** | las 5 licencias vigentes cubren 100 % del lote H3 |
| `schema_changelog` | + entrada `1.3.0` | trazabilidad del cambio |
| `versioning_rules` | + 1 regla declarativa | enum aditivo = minor, jamás quitar valores |

---

# 1. DIFF EXACTO PARA `schema.json` (respuesta 1)

## Bloque 1 — `schema_version` (línea 3)
```diff
-  "schema_version": "1.2.0",
+  "schema_version": "1.3.0",
```

## Bloque 2 — columna `partition` (línea 211)
```diff
-    { "name": "partition", "type": "enum", "gobierno": "OBLIGATORIA", "values": ["unassigned", "train", "validation", "test", "holdout"], "default": "unassigned" },
+    { "name": "partition", "type": "enum", "gobierno": "OBLIGATORIA", "values": ["unassigned", "train", "validation", "test", "holdout", "reference"], "default": "unassigned", "notes": "reference: material de la capa C1/C2 de referencia (externo). JAMAS se materializa en train|validation|test de C0. Anadido por H3_DECISION_PACKAGE_FINAL (D5)." },
```

## Bloque 3 — columna `source` (línea 232)
```diff
-    { "name": "source", "type": "enum", "gobierno": "OBLIGATORIA", "values": ["cmsc_logger", "fsd50k", "esc50", "xeno_canto", "speech_commands", "sonyc"], "notes": " cmsc_logger es el valor canonico. El diseno previo escribia cmcs_logger (errata OBS-05)." },
+    { "name": "source", "type": "enum", "gobierno": "OBLIGATORIA", "values": ["cmsc_logger", "fsd50k", "esc50", "xeno_canto", "speech_commands", "sonyc", "audioset"], "notes": "cmsc_logger es el valor canonico (C0). Fuentes REF C1: fsd50k, esc50, xeno_canto, speech_commands, sonyc. C2: audioset (ontologia/anotaciones, jamas audio). birdclef queda DIFERIDO: no se anade hasta que se decida su fuente." },
```

## Bloque 4 — columna `license` (línea 231) — **SIN CAMBIO**
```diff
-    { "name": "license", "type": "enum", "gobierno": "OBLIGATORIA", "values": ["PROPIO", "CC0", "CC-BY", "CC-BY-SA", "CC-BY-NC"], "notes": "ND esta PROHIBIDO (G-DS-5). v1 solo admite PROPIO." },
+    SIN CAMBIO.
```
**Justificación:** el lote H3 usa solo `CC0 · CC-BY · CC-BY-SA · CC-BY-NC` (ya en el enum); `PROPIO` sigue siendo
el único de C0. `CC Sampling+` (FSD50K) queda **excluido del lote** y solo entrará en un bump futuro si Bernardo
lo autoriza. `CC-BY-NC-SA` (BirdCLEF) no entra por diferido.

## Bloque 5 — `versioning_rules` (tras línea 273)
```diff
+    "Anadir VALORES NUEVOS a un enum (vocabulario aditivo: particiones, sources) -> schema_version minor. Nunca se quitan valores existentes en < 2.0.0. Declarado por H3_DECISION_PACKAGE_FINAL (D5): partition=reference, source=audioset.",
```

## Bloque 6 — `schema_changelog` (prepend de la entrada `1.3.0`)
```diff
+    {
+      "version": "1.3.0",
+      "date": "2026-10-07",
+      "mission": "H3_DECISION_PACKAGE_FINAL",
+      "breaking": false,
+      "changes": [
+        "partition.values + reference: capa C1/C2 (material externo). Nunca se materializa en train/validation/test de C0.",
+        "source.values + audioset: C2 (ontologia/anotaciones YAMNet, jamas audio).",
+        "license.values SIN cambio: las 5 licencias vigentes cubren el lote H3 por completo.",
+        "versioning_rules + regla declarativa: enum aditivo = minor; nunca quitar valores en < 2.0.0."
+      ],
+      "columns_before": 42,
+      "columns_after": 42,
+      "reason": "Cierre de D5: vocabulario minimo para inventariar la capa REF sin tocar estructura, clases ni clip contract.",
+      "no_impacto": "C0 intacto (0 filas nuevas; logger sigue emitiendo unassigned/train/validation/test/holdout). S81/S82 en DISENO. Sin descargas."
+    },
```

**Total del diff:** 3 líneas de valores + 1 regla + 1 changelog. **Ninguna columna se añade, renombra ni reordena.**

---

# 2. NUEVOS ENUMS RESULTANTES (respuesta 2)

| Columna | Enum tras D5 | Cambio |
|---|---|---|
| `partition` | `unassigned · train · validation · test · holdout · reference` | +1 |
| `source` | `cmsc_logger · fsd50k · esc50 · xeno_canto · speech_commands · sonyc · audioset` | +1 |
| `license` | `PROPIO · CC0 · CC-BY · CC-BY-SA · CC-BY-NC` | 0 |
| `class_id` | `silencio · viento · lluvia · agua · insectos · ave · voz · motor · ruido_desconocido` | 0 (taxonomy v1 intacta) |

`dataset_state` (CAPTADO_INICIAL), `taxonomy_version`, `label_schema_version`, `feature_schema`,
`window_schema` (44 dims) y `clip_contract` **no se tocan**.

---

# 3. COMPATIBILIDAD HACIA ATRÁS (respuesta 3)

| Aspecto | Evaluación |
|---|---|
| **Filas existentes** | Ninguna usa `reference`/`audioset` hoy → 0 registros afectados |
| **Estructura de columnas** | 42/42 columnas, mismas 42, mismo orden → Gates `columns_before/after` siguen en 42 |
| **Logger C0** | Sigue emitiendo `unassigned` (default) y solo `train|validation|test|holdout`; `reference` nunca lo escribe C0 |
| **Metadata.csv** | No recibe filas REF (barrera física/esquema H0): `partition=reference` queda disponible para el metadata/manifest REF, no para la tabla maestra C0 |
| **Gates G-DS-*** | G-DS-1 valida `labels.csv`/mids · G-DS-5 valida `license` (sin cambio) · G-DS-2 (≥150/clase) evalua solo `source=cmsc_logger` → sin impacto |
| **dataset_version** | Sigue `v1`: cambio aditivo de vocabulario NO es estructural (regla declarada) |
| **Scripts de validación** | Riesgo R1 (lista dura) si algún validador usa whitelist fija → se documenta el punto de extensión; ninguno revisado rompe (ver §4) |
| **Hash de contrato** | El SHA-256 de `schema.json` cambia ⇒ **obligación registrada:** actualizar la tabla de trazabilidad §11 y `schema_version` de los docs en el MISMO cambio (regla de invalidación). |

---

# 4. RIESGOS (respuesta 4)

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| R1 | Un validador con whitelist dura de `partition`/`source` rechazaría filas REF | 🟠 | punto de extensión documentado en `notes` del schema; REF inventaría en manifest, no en metadata.csv |
| R2 | Bump de `schema_version` sin actualizar el hash de trazabilidad §11 | 🔴 | regla de invalidación: actualizar SHA + versión en el MISMO cambio; sin eso no se aplica el bump |
| R3 | Confusión `partition=reference` (vocabulario) vs `reference_status` (estado C1) | 🟠 | notas del schema + separación 4 barreras H0; reporting separado |
| R4 | Fuga accidental de REF a splits C0 amparada en el nuevo valor | 🔴 | `reference` solo en manifest/metadata REF; gates G-DS-2/5 + G-REF-6 rechazan cualquier `reference` en `train/validation/test` |
| R5 | Activar futuros vocabularios (BirdCLEF, `Sampling+`, `abejas`) requiere nuevo bump | 🟡 | diferidos por diseño: no se adelantan valores muertos |

---

# 5. EJEMPLOS DE METADATA REF (respuesta 5)

Formato **manifest_ref** (nada de esto escribe en `metadata.csv` de C0). Un ejemplo por fuente:

```yaml
# manifest_ref.fsd50k.yaml (fragmento)
source_id: ref_fsd50k_020543
origin_dataset: FSD50K.dev
partition: reference
source: fsd50k
license: CC-BY
class_id: motor                  # mapeado desde mid maquina/vehiculo
reference_status: CONSUMIBLE
provenance:
  download_from: zenodo.org/records/4060432
  filename: FSD50K.dev_audio_8.wav
  sha256_author: "<hash del autor al momento real>"
  transformation: [downmix_mono, resample_44100, window_3s]
  resample_method: soxr_hq
```

```yaml
# manifest_ref.esc50.yaml (fragmento)
source_id: ref_esc50_dog
origin_dataset: ESC-50
partition: reference
source: esc50
license: CC-BY-NC              # dataset CC BY-NC 3.0; ESC-10 subset CC-BY
class_id: voz_dog              # NO mapea a las 9 clases: solo uso VAD/pretrain
reference_status: CONSUMIBLE
provenance: { origin_folder: "audio/1-100032-A-0.wav", resample_method: none }
```

```yaml
# manifest_ref.xeno_canto.yaml (fragmento)
source_id: ref_xc_12345
origin_dataset: Xeno-canto (GBIF 10.15468/qv0ksn)
partition: reference
source: xeno_canto
license: CC-BY                 # ND y desconocida excluidas; NC marcada
class_id: ave
reference_status: CONSUMIBLE
provenance:
  taxon: "<especie mapeada a ave>"
  download_via: xeno-canto API (Anubis, cuota cumplida)
  window: 3.0s
```

```yaml
# manifest_ref.sonyc.yaml (fragmento)
source_id: ref_sonyc_0001
origin_dataset: SONYC-UST v2.3 (Zenodo 3966543)
partition: reference
source: sonyc
license: CC-BY
class_id: motor
annotation: verified           # 1.385 grabaciones verificadas priorizadas
reference_status: CONSUMIBLE
```

```yaml
# manifest_ref.speech_commands.yaml (fragmento)
source_id: ref_sc_yes_0001
origin_dataset: Speech Commands v2
partition: reference
source: speech_commands
license: CC-BY
class_id: voz
role: VAD                      # nunca silencio; _background_noise_ = OOD
reference_status: CONSUMIBLE
resample_method: soxr_hq      # 16 kHz -> 44,1 kHz declarado
```

```yaml
# manifest_ref.audioset.yaml (fragmento C2, JAMAS audio)
source_id: audioset_ontology_v2023
origin_dataset: AudioSet ontology + yamnet_class_map.csv
partition: reference
source: audioset
license: CC-BY-SA              # ontologia; anotaciones CC-BY aparte
kind: ontology                 # tablas/embeddings, sin grabaciones
reference_status: CONSUMIBLE
```

---

# 6. CHECKLIST FINAL H3 (respuesta 6)

| ID | Ítem | Estado |
|---|---|---|
| D1 | AudioSet = ontología únicamente | ✅ cerrada (H3_READINESS) |
| D2 | BirdCLEF = diferido | ✅ cerrada (H3_READINESS) |
| D3 | Abejas = taxonomy v2 | ✅ cerrada (H3_READINESS) |
| D4 | Paisaje rural = taxonomy v2 | ✅ cerrada (H3_READINESS) |
| **D5** | **Vocabulario `schema.json` para REF** | **→ paquete listo (este documento); aplicación = misión de gobernanza explícita + hash §11 en el mismo cambio** |
| D6 | Aprobación lote ~~9.500~~ + espacio ~22–25 GB | ⬜ pendiente Bernardo |
| D7 | Credenciales Xeno-canto (Anubis) + red/almacenamiento | ⬜ pendiente |
| D8 | Orden explícita H3-EXECUTION (descarga) | ⬜ pendiente |
| D9 | Verificación de integridad (hash del autor) al momento real | ⬜ al ejecutar |

---

# 7. DICTAMEN (respuesta 7)

> ## GO_D5 ✅
>
> El paquete de decisión es **viable, mínimo y no rompe nada**: 2 valores añadidos a 2 enums, 0 columnas
> nuevas, 0 clases nuevas, 0 cambios en clip_contract/features/C0. El lote H3 queda **100 % cubierto** por el
> vocabulario resultante sin tocar `license`.
>
> **Condiciones de aplicación (para la misión que materialice D5):**
> 1. Texto del diff §1 aplicado **tal cual** a `schema.json`.
> 2. Actualización del SHA-256 y `schema_version` en la tabla de trazabilidad §11 de
>    `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` **en el mismo cambio** (regla de invalidación).
> 3. Sin descarga, sin `reference/`, sin tocar datasets, sin commits (hasta orden explícita).
>
> **NO_GO** solo si Bernardo prefiere contemplar `Sampling+`/BirdCLEF en el mismo bump (no recomendado: lote
> no lo requiere).

---

# 8. NO-ACCIONES CONFIRMADAS Y TRAZABILIDAD

- No se descargó nada · no se creó `reference/` · no se modificó `schema.json` (el diff §1 es **propuesta**,
  no edición) · no se tocaron `labels.csv`/`metadata.csv`/manifiestos/Dataset v1 · CMSC/S30/S81/S82 intactos ·
  sin commits.
- Cadena previa: STRATEGY → H0 → H1 → H2 → H3_READINESS → **H3_DECISION_PACKAGE_FINAL (este doc)**.
- Próxima misión sugerida: **aplicación de D5** (gobernanza) → **H3_EXECUTION** (descarga).