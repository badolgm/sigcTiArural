# REFERENCE ACOUSTIC CORPUS — ARQUITECTURA DE LA CAPA C1 (REF) v1

**Misión:** `ACOUSTIC_H0_REFERENCE_LAYER_DESIGN` · **Fecha:** 2026-10-06 · **HEAD:** `a125a66` · **Estado:** SOLO ARQUITECTURA Y TRAZABILIDAD
**Regla de honestidad:** **NO se ha descargado nada.** Todo `raw/` de la capa REF está vacío hasta misión explícita. `reference_status` vigente para todas las fuentes: `PLANIFICADO`.
**Restricciones respetadas:** sin descargar · sin implementar · sin modificar datasets · sin entrenar · sin tocar CMSC/S81/S82.

**Hereda de:**
- `docs/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` — estrategia híbrida aprobada (C0 objetivo · C1 REF · C2 ontología). **Este documento materializa C1 y C2 a nivel de arquitectura.**
- `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` — gobernanza de C0 (`schema.json` 1.2.0, gates G-DS-1..6, AC-1..10, SG-1..5).
- `docs/AI_ACOUSTIC_DATASET_REVIEW.md` · `docs/AI_ACOUSTIC_DATASET_V1_DESIGN.md`.
- Estado real del ecosistema: E1 `REAL-LOCAL` · dataset `CAPTADO_INICIAL` (1 muestra `silencio`) · S81/S82 `DISENO`.

---

# 0. RESUMEN EJECUTIVO

H0 diseña la **arquitectura física y de gobernanza** de la capa de referencia acústica (C1) y de la capa
ontológica (C2), separadas de la capa objetiva C0. El resultado es un corpus de referencia **consumible solo
para pre-entrenamiento, bootstrap cerrado, negatives y análisis** — jamás para la evaluación de S81.

| Entregable | Respuesta corta |
|---|---|
| Árbol | `data/datasets/sigct_rural_acoustic/reference/<source_id>/` con plantilla unificada por fuente + `manifests/` |
| Metadatos por fuente | `source_id` · `license` · `origin_dataset` · `provenance` · `reference_status` (§3) |
| Cobertura | 7 de 8 clases vivas con proxy público (§4) |
| Real-local obligatorio | `silencio` + `ruido_desconocido` (hoy) · candidatas futuras: `abejas`, `paisaje rural`, `anomalías` (§5) |
| Artefactos de gobernanza | `REFERENCE_DATASET_CARD.md` · `REFERENCE_MANIFEST.yaml` · `REFERENCE_GOVERNANCE.md` (§6–8) |
| Convivencia C0/C1 | Regla física + regla de esquema + regla de entrenamiento + regla de reporting (§9) |
| Extensiones `schema.json` | propuestas, pendientes de Bernardo, ejecución fuera de esta misión (§10) |
| Veredicto | **GO_H0 CONDICIONADO** (§13) |

**Dimensión de la capa:** los scripts de descarga/ingesta/feature están **previstos en el árbol** (`tools/`,
`ingest/`) pero **no se escriben ni se ejecutan**. El árbol documenta la arquitectura; no contiene bytes.

---

# 1. ALCANCE Y DECISIONES DE PARTIDA

1. **C1 = capa de referencia (`REF`).** Material externo de 7 fuentes (AudioSet solo ontología/embeddings).
2. **C2 = capa ontológica.** AudioSet ontología (CC BY-SA) + YAMNet embeddings. Vive dentro de `reference/audioset/`.
3. **UrbanSound8K queda EXCLUIDO por defecto** a falta de justificación superior a SONYC-UST (ver §4.4).
4. **La taxonomía de C0 permanece en 9 clases.** `abejas`/`paisaje rural` son **extensiones futuras fuera de la
   taxonomía vigente** (§5); `anomalías` es el propósito de S82, no una clase de dataset.
5. **Regla de no mezcla heredada e inmutable:** ningún clip externo entra en `train|validation|test` de C0.

---

# 2. ARQUITECTURA GENERAL (A)

## 2.1 Vista de capas

```
┌──────────────────────────────────────────────────────────────────────────┐
│  C2  ONTOLÓGICA            reference/audioset/  (ontología + YAMNet)      │
│       ontología CC BY-SA · embeddings · jamás audio de YouTube            │
├──────────────────────────────────────────────────────────────────────────┤
│  C1  REFERENCIA (REF)     reference/{esc50,fsd50k,xeno_canto,birdclef,   │
│       fuente de pre-      sonyc,speech_commands}/                         │
│       entrenamiento /     · raw + metadata + features + manifiesto        │
│       bootstrap /         · licencia POR CLIP · consume: pre-train,       │
│       negatives /         bootstrap, negatives, análisis · NUNCA eval     │
│       subclases                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│  C0  OBJETIVA (REAL-LOCAL)  data/datasets/sigct_rural_acoustic/v1/ o v2/  │
│       cmsc_logger · metadata.csv (fuente única) · gates G-DS-1..6 ·       │
│       ÚNICA evaluación de S81                                             │
└──────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Relación con el sistema de estados

| Capa | Estado de sus datos | Estado de S81 |
|---|---|---|
| C2 | `REF` (ontología/embeddings) | no influye |
| C1 | `REF` | permanece `DISENO` |
| C0 | `CAPTADO_INICIAL` → `CURADO` → `SPLITEADO` → `PUBLICADO` | sube a `REAL-LOCAL` vía G-DS-2/3 + G-M-* |

**El estado de S81 lo sube SOLO C0.** Las capas REF alimentan el *camino* (modelos de referencia), no el *juez*.

---

# 3. METADATOS CANÓNICOS DE LA CAPA REF (respuesta 2)

Cinco campos obligatorios, definidos una vez y usados en el manifiesto y en la tarjeta:

| Campo | Definición | Valores posibles (cerrados) |
|---|---|---|
| `source_id` | identificador estable de la fuente dentro del ecosistema | `audioset` · `fsd50k` · `esc50` · `birdclef` · `xeno_canto` · `sonyc` · `speech_commands` |
| `license` | licencia aplicable **por clip** (o por dataset si así la publica el autor) | lista cerrada C1 = `CC0 · CC-BY · CC-BY-SA · CC-BY-NC · CC-BY-NC-SA · CC Sampling+`; **`ND` PROHIBIDO** |
| `origin_dataset` | nombre y versión del dataset tal como lo publica el autor | p. ej. `FSD50K v1` · `ESC-50 (2020)` · `BirdCLEF+ 2026` · `SONYC-UST v2.3` · `Speech Commands v0.02` |
| `provenance` | traza verificable: `origin_dataset@version → URL/DOI → filtros aplicados (clases, licencias, duración) → hash` | cadena de texto con estructura declarada (§3.1) |
| `reference_status` | estado honesto del material dentro de C1 | `PLANIFICADO → DESCARGADO → VALIDADO → FILTRADO → INVENTARIADO → CONSUMIBLE` |

## 3.1 Estructura de `provenance`

Formato canónico (cada fuente lo completa en su `manifest_ref.<source_id>.yaml`):

```
provenance:
  origin_dataset: "<Nombre> <versión>"
  origin_url: "<URL/DOI oficial>"
  capture_date: "<timestamp de descarga>"
  filters_applied: ["class_id in <mapas>", "license in <lista>", "duration <= <>"]
  transformation: "<none | recorte | remuestreo | copia>"
  file_sha256: "<hash del artefacto si es archivo único>"
  dataset_token: "<hash del conjunto provisto por el autor si existe>"
```

**Regla:** si no se puede completar `capture_date` + `filters_applied` + hash, el material **no pasa de
`DESCARGADO` a `VALIDADO`**. Un corpus de referencia sin traza no se consume.

## 3.2 Tabla maestra de fuentes (verificada 2026-10-06)

| `source_id` | `origin_dataset` | `license` | `provenance` esencial | `reference_status` |
|---|---|---|---|---|
| `audioset` | AudioSet (Google) | anotaciones **CC BY 4.0** · ontología **CC BY-SA 4.0** · audio **no distribuido** | research.google.com/audioset · 2.084.320 seg. YouTube · 527+ etiquetas | `PLANIFICADO` (solo ontología + embeddings) |
| `fsd50k` | FSD50K (Zenodo 4060432) | dataset **CC-BY** · **por clip** CC0/CC-BY/CC-BY-NC/CC Sampling+ | 51.197 clips · 200 clases · ≈108,3 h · dev 40.966 + eval 10.231 | `PLANIFICADO` |
| `esc50` | ESC-50 (GitHub karoldvl) | **CC BY-NC 3.0** (subconjunto ESC-10: CC BY) | 2.000 clips · 50 clases · 5 s · 44,1 kHz mono · 5 folds | `PLANIFICADO` |
| `birdclef` | BirdCLEF+ 2026 (Kaggle) | competición **CC BY-NC-SA 4.0** · mirrors **CC0** (por verificar por archivo) | Pantanal brasileño · 234 clases (aves/anfibios/mamíferos/reptiles/insectos) · ~33 GB | `PLANIFICADO` · decisión de fuente en H0 |
| `xeno_canto` | Xeno-canto (GBIF 10.15468/qv0ksn) | **por grabación** (CC BY/SA/NC/**NC-ND**) · metadatos GBIF CC BY-NC 4.0 | 857.858 ocurrencias · coords 97 % · API tras Anubis | `PLANIFICADO` |
| `sonyc` | SONYC-UST v2.3 (Zenodo 3966543) | **CC BY 4.0** ✅ | 18.515 grabaciones 10 s · multilabel 23/8 · 1.385 verificadas | `PLANIFICADO` |
| `speech_commands` | Speech Commands v0.02 | **CC BY 4.0** ✅ | 105.829 utterances · 35 palabras · 1 s · 16 kHz · 2.618 hablantes | `PLANIFICADO` |
| ~~`urbansound8k`~~ | UrbanSound8K (Zenodo 1203745) | **CC BY-NC** | 8.732 clips ≤4 s · 10 clases · 6,0 GB | **EXCLUIDO** (§4.4) |

---

# 4. MAPEO DE DATASETS → CLASES (respuesta 3 y 4)

## 4.1 Alimentación de las 7 clases vivas con proxy público

| Clase C0 | Fuentes C1 (rol) | Clase fuente (verificada) | Rol en C1 |
|---|---|---|---|
| `viento` | ESC-50 · FSD50K | `wind` (ESC) · `Wind` (FSD) | bootstrap + pretrain + negatives |
| `lluvia` | ESC-50 · FSD50K | `rain` (ESC) · `Rain` (FSD) | bootstrap + pretrain + negatives |
| `agua` | ESC-50 · FSD50K | `water_drops`, `sea_waves`, `pouring_water` (ESC) · `Water` (FSD) | bootstrap + pretrain + negatives |
| `insectos` | Xeno-canto · BirdCLEF · ESC-50 | grabaciones `Insecta` (XC/BC) · `crickets`, `insects` (ESC) | **pre-entrenamiento profundo** + negatives |
| `ave` | Xeno-canto · BirdCLEF · ESC-50 | grabaciones de aves (XC/BC) · `chirping_birds`, `rooster`, `crow` (ESC) | **pre-entrenamiento profundo** + negatives |
| `voz` | Speech Commands · FSD50K | 35 palabras (SC) · `Speech` (FSD) | VAD + negatives de voz |
| `motor` | SONYC-UST · FSD50K | subtags `engine`/`machinery`/`car` (SONYC) · `Engine`/`Vehicle` (FSD) | MOTOR urbano + negatives |

**Importantísimo:** cada celda contribuye a C1 con **estado `REF`**; el ground truth evaluable de cada clase
sigue saliendo de C0 (captura local con `cmsc_logger`).

## 4.2 Cobertura agregada

| Clase | ¿Cubierta por externo? | Profundidad | ¿Se evalúa S81 con externo? |
|---|---:|---|---|
| `silencio` | ❌ (no existe) | — | nunca |
| `viento` | ✅ proxy | moderada (40 + subset FSD) | **no** |
| `lluvia` | ✅ proxy | moderada | **no** |
| `agua` | ✅ proxy | moderada | **no** |
| `insectos` | ✅ profunda | alto (XC/BC, miles) | **no** |
| `ave` | ✅ profunda | alto (XC/BC, miles) | **no** |
| `voz` | ✅ VAD | alto para detección, nulo para español rural | **no** |
| `motor` | ✅ proxy | alto urbano, nulo agrícola | **no** |
| `ruido_desconocido` | ❌ (bucket OOD) | — | nunca |

## 4.3 Clases que quedan OBLIGATORIAMENTE REAL-LOCAL (respuesta 4)

| Clase | Estado hoy | Por qué es REAL-LOCAL |
|---|---|---|
| `silencio` | `REAL-LOCAL` objetivo (1 muestra E1) | No existe clase pública; es el **piso de ruido del entorno** del CMSC. Proxy de otro entorno = dato falso. |
| `ruido_desconocido` (OOD) | REAL-LOCAL por construcción | No es una clase natural capturable a demanda; se llena con rechazos, ambiguos y eventos nuevos de **C0**. Material externo `ND` jamás entra aquí. |

**Candidatas futuras (FUERA de la taxonomía `acoustic_v1_taxonomy` vigente — no están en `labels.csv`):**

| Clase candidata | Naturaleza | Necesita | Veredicto honesto hoy |
|---|---|---|---|
| `abejas` (Apis) | clase nueva de bioacústica (zumbido) | crecimiento de taxonomía (`taxonomy_version` nueva) + captura propia | **no vigente** · si se incorpora → REAL-LOCAL (sin proxy público equiparable para S81) |
| `paisaje rural` | clase-escena (no evento) | nueva taxonomía + diseño de etiqueta de escena | **no vigente** · propuesta de diseño, no taxonomía |
| `anomalías` (S82) | **no es una clase de dataset** — es el propósito del detector S82 | corpus derivado de C0 (baseline por hora/sitio) + bucket OOD | **fuera del alcance del dataset** · S82 permanece `DISENO` |

> Si Bernardo aprueba `abejas` o `paisaje rural`, se incorporan como rollout de taxonomía (leaf:
> `metadata/labels.csv` +10 filas min → bump de `taxonomy_version` → `dataset_version v2`), **nunca** como
> importación desde C1. Esa es una misión de gobernanza aparte, no esta.

## 4.4 Justificación UrbanSound8K (EXCLUIDO)

| Criterio | UrbanSound8K | SONYC-UST | Conclusión |
|---|---|---|---|
| Licencia | CC BY-NC | **CC BY 4.0** | SONYC supera |
| Grabaciones | 8.732 (≤4 s) | **18.515 × 10 s** | SONYC supera |
| Etiquetas | 10 clases single-label | **23 finas / 8 gruesas multilabel** + 1.385 verificadas | SONYC supera |
| Acceso | Zenodo directo | Zenodo directo | empate |
| Rol MOTOR | `engine_idling` | `engine`/`machinery`/`car` | SONYC supera |

**No existe justificación superior a SONYC** para ninguna de las 7 clases. UrbanSound8K queda **excluido por
defecto**; solo una orden expresa de Bernardo podría reactivarlo (limitado a `REF` MOTOR con `NC` marcado).

---

# 5. ESTRATEGIA DE CONSUMO DE CADA FUENTE (rol en C1/C2)

| `source_id` | Rol | Consumo permitido | Consumo prohibido | Condición de licencia |
|---|---|---|---|---|
| `fsd50k` | pretrain columna vertebral | extractor/embedding, negatives | evaluación, cierre de gates | filtrar por clip; excluir `CC Sampling+` o extender lista; marcar `NC` |
| `esc50` | bootstrap cerrado | benchmark cerrado de 6 clases, smoke test pipeline | evaluación de S81 | `NC` documentado globalmente; ESC-10 (CC BY) libre |
| `xeno_canto` | AVE/INSECTOS profundo | pre-entrenamiento de subclases, negatives | evaluación | **excluir `ND`**; marcar `NC`; priorizar CC0/CC-BY/CC-BY-SA |
| `birdclef` | AVE/INSECTOS industrial | pre-entrenamiento de subclases, negatives | evaluación | decidir mirror: competición `CC BY-NC-SA` (derivados SA) o mirror `CC0` verificado por archivo |
| `sonyc` | MOTOR + OOD urbano | MOTOR, negativos de ruido, seeds para `desconocido` | evaluación | CC BY ✅ · atribución obligatoria |
| `speech_commands` | VOZ/VAD | VAD, negatives de voz, detección de presencia de habla | evaluación de habla rural | CC BY ✅ |
| `audioset` (C2) | ontología + profesor de embeddings (YAMNet) | mapping `mid` (G-DS-1d), embeddings sobre C0 | nunca audio de YouTube | ontología CC BY-SA → derivados SA; embeddings de C0 consignados `REF` |

---

# 6. ESTRUCTURA COMPLETA DE CARPETAS (B) — ÁRBOL DEFINITIVO

## 6.1 Raíz de la capa

```
data/datasets/sigct_rural_acoustic/
├── v1/                          # C0 · capa objetiva (intocada por esta misión)
└── reference/                   # ← C1 + C2 · NUEVO
    ├── README.md                # mapa C1 + estado honesto ("nada descargado")
    ├── REFERENCE_GOVERNANCE.md  # canon de la capa (§8 de este documento, materializado al crear)
    ├── REFERENCE_DATASET_CARD.md# tarjeta global del corpus de referencia (§7)
    └── reference_manifest.yaml  # índice maestro de las 7 fuentes
```

## 6.2 Plantilla por fuente (`<source_id>`)

```
reference/<source_id>/
├── README.md                    # qué contiene, licencia resumida, cómo se consumió
├── source_card.md               # ficha de la fuente (tabla §3.2 + notas de acceso)
├── manifest_ref.<source_id>.yaml# contrato por fuente (provenance, checks, mapas)
├── raw/                         # audio tal como lo publica el autor (o subárbol filtrado)
│   └── <class_id>/*.ext         # mapeado a las clases C0 cuando aplica
├── metadata/                    # tablas de etiquetas/licencias del autor + filtro aplicado
├── features/                    # features acústicas derivadas (solo si se consumen)
│   └── README.md                # regla: un CSV por versión, mismo esquema `acoustic.feat.window.v2`
├── ingest/                      # lugar de los scripts (NO se escriben en H0)
└── checksums.sha256             # integridad tras descarga (vacío/place holder honesto)
```

## 6.3 Caso especial `audioset` (C2)

```
reference/audioset/
├── README.md                    # "solo ontología + embeddings; nunca audio de YouTube"
├── ontology/
│   └── yamnet_class_map.csv     # para verificar los 7 `mid` `UNVERIFIED` de C0 (G-DS-1d)
├── embeddings/                  # YAMNet over clips de C0 (derivado local, no descargado)
└── source_card.md
```

## 6.4 `manifests/` de referencia (índice)

```
reference/manifests/
├── reference_manifest.yaml      # índice maestro (resumen de las 7 fuentes + estado global)
├── mapping_c0_to_sources.yaml   # tabla §4.1 invertida: clase C0 → {source, clase fuente, rol}
└── exclusion_rules.yaml         # `ND` prohibido · `NC` marcado · `SA` aislado · sin fallos de mezcla
```

> **NOTA DE HONESTIDAD:** REDACTAR este árbol **no lo crea**. La creación física de `reference/` (con sus 20+
> directorios en vacío o con placeholders honestos) es tarea de una misión de implementación posterior,
> igual que se hizo con `v1/` en la misión de 2026-10-04. Este documento es la **especificación** del árbol.

---

# 7. DISEÑO DE `REFERENCE_DATASET_CARD.md` (respuesta 5)

Estructura canónica del fichero (una tarjeta global + resumen por fuente):

```
# REFERENCE ACOUSTIC DATASET CARD — C1/C2

## 1. Identidad
dataset_id: sigct_rural_acoustic_reference
capas: [C1 (REF externo), C2 (ontología + embeddings)]
estado_global: PLANIFICADO            # ningun byte descargado

## 2. Composición
| source_id | origin_dataset | clips_planificados | license | estado | md-espacio |
   (las 7 filas de §3.2, con columnas honestas de cantidad real = 0)

## 3. Cobertura por clase C0 (tabla §4.1/§4.2)

## 4. Licencias agregadas
- Conjunto permitido: CC0 · CC-BY · CC-BY-SA · CC-BY-NC · CC-BY-NC-SA · CC Sampling+
- Prohibido: ND · desconocida
- NC: marcado explícito por clip; SA: mantenido aislado de C0
- AudioSet: no redistribuible como audio

## 5. Reuso permitido
pretrain · bootstrap · negatives · features de análisis · nunca evaluación
de S81, nunca filas en metadata.csv de C0

## 6. Riesgos (heredados HR1..HR7 del strategy, + nuevas G-REF)

## 7. Estado honesto
dataset_state C1: PLANIFICADO (0 bytes)
propietario: CMSC · gobernanza: REFERENCE_GOVERNANCE.md
```

---

# 8. DISEÑO DE `REFERENCE_GOVERNANCE.md` (respuesta 6)

## 8.1 Estructura

```
# REFERENCE GOVERNANCE — capa C1/C2

## 1. Principios
P-REF-1  La capa REF jamás es fuente del ground truth de S81.
P-REF-2  La licencia se verifica POR CLIP, nunca solo por dataset.
P-REF-3  ND prohibido · NC marcado · SA aislado · Sampling+ decidido o filtrado.
P-REF-4  El estado sube por evidencia (checksums, provenance), nunca por decisión.
P-REF-5  Reproducibilidad: la traza (provenance) es prerequisito de consumo.

## 2. Estados de referencia (reference_status)
PLANIFICADO → DESCARGADO → VALIDADO → FILTRADO → INVENTARIADO → CONSUMIBLE
Transición válida solo si: provenance completa + hash verificado + licencia por clip OK.

## 3. Gates de la capa REF
G-REF-1 Taxonomía de mapeo aprobada (clase C0 ↔ clase fuente) por Bernardo.
G-REF-2 Licencia por clip conforme (inventario de licenses DISTINCT completo).
G-REF-3 Provenance completa (URL, fecha, filtros, hash) para cada fuente consumida.
G-REF-4 Integridad (checksums.sha256) verificada tras ingesta.
G-REF-5 Reutilización controlada (pre-train/bootstrap/negatives/features; cero evaluación).
G-REF-6 Separación física y lógica respecto de C0 (arboles y esquemas distintos).

## 4. Reglas de convivencia con C0 (resumen de §9)

## 5. Registro de acceso (log de qué se consumió y para qué modelo REF)

## 6. Auditoría y renovación
Actualización de licencias en cambios de versiones de origen; revisión anual.
```

## 8.2 YAML maestro — `reference_manifest.yaml`

```yaml
schema_version: "1.0"
manifest_type: "reference_manifest"
dataset_id: "sigct_rural_acoustic_reference"
layers: ["C1", "C2"]
status: "PLANIFICADO"
created: "2026-10-06"
sources:
  - source_id: esc50
    origin_dataset: "ESC-50"
    license: "CC-BY-NC 3.0 (ESC-10: CC-BY)"
    reference_status: "PLANIFICADO"
    roles: ["bootstrap", "negatives"]
    maps_to: ["viento", "lluvia", "agua", "insectos", "ave", "motor"]
    provenance: "https://github.com/karoldvl/ESC-50 · pendiente captura"
  - source_id: fsd50k
    origin_dataset: "FSD50K v1"
    license: "dataset CC-BY · per-clip CC0/CC-BY/CC-BY-NC/CC-Sampling+"
    reference_status: "PLANIFICADO"
    roles: ["pretrain", "negatives"]
    maps_to: ["viento", "lluvia", "agua", "voz", "motor"]
    provenance: "Zenodo 4060432 · pendiente captura"
  - source_id: xeno_canto
    origin_dataset: "Xeno-canto (GBIF subset)"
    license: "per-recording CC-BY/SA/NC / NC-ND excluido"
    reference_status: "PLANIFICADO"
    roles: ["pretrain_subclass", "negatives"]
    maps_to: ["ave", "insectos"]
    provenance: "GBIF 10.15468/qv0ksn · API tras Anubis · pendiente filtro"
  - source_id: birdclef
    origin_dataset: "BirdCLEF+ 2026"
    license: "competicion CC-BY-NC-SA 4.0 · mirrors CC0 (verificar)"
    reference_status: "PLANIFICADO"
    roles: ["pretrain_subclass", "negatives"]
    maps_to: ["ave", "insectos"]
    provenance: "Kaggle · decision de fuente en H0"
  - source_id: sonyc
    origin_dataset: "SONYC-UST v2.3"
    license: "CC-BY 4.0"
    reference_status: "PLANIFICADO"
    roles: ["motor_ref", "ood_urbano", "negatives"]
    maps_to: ["motor"]
    provenance: "Zenodo 3966543 · pendiente captura"
  - source_id: speech_commands
    origin_dataset: "Speech Commands v0.02"
    license: "CC-BY 4.0"
    reference_status: "PLANIFICADO"
    roles: ["vad", "voz_negatives"]
    maps_to: ["voz"]
    provenance: "TensorFlow · arXiv 1804.03209 · pendiente captura"
  - source_id: audioset
    origin_dataset: "AudioSet (ontologia + YAMNet)"
    license: "anot CC-BY 4.0 · ontologia CC-BY-SA 4.0 · audio no distribuido"
    reference_status: "PLANIFICADO"
    roles: ["ontology", "embeddings_teacher"]
    maps_to: ["todas (mapeo mid)"]
    provenance: "research.google.com/audioset · nunca audio"
rules:
  no_nd: true
  no_unknown_license: true
  per_clip_license: true
  nc_marked: true
  sa_isolated: true
  never_in_c0_split: true
```

> Este YAML es **diseño**: no existe ningún fichero en disco aún. La creación se coordinará con la
> materialización del árbol (§6.4) en la misión de implementación.

---

# 9. CONVIVENCIA C0 vs C1 SIN CONTAMINAR `train/validation/test` (respuesta 8)

Cuatro reglas independientes — todas verificables en máquina:

1. **Regla física (árbol).** C0 vive en `sigct_rural_acoustic/vX/`; C1/C2 en `sigct_rural_acoustic/reference/`.
   Las rutas evaluables de C0 (`train|validation|test|holdout`) no existen dentro de `reference/`. Un proceso
   no puede inyectar accidentalmente un WAV de referencia en un split de C0 porque no comparten árbol.

2. **Regla de esquema (datos).** `metadata.csv` de C0 solo contiene filas con `source=cmsc_logger` y
   `license=PROPIO`. Ninguna herramienta de C1 escribe en `metadata.csv` de C0; C1 tiene su propio manifiesto.
   Gates G-DS-2 (source) y G-DS-5 (license) son los *guardianes* de esta regla.

3. **Regla de entrenamiento (modelo).** Los modelos entrenados con C1/C2 se registran como `REF`; los modelos
   candidatos a `REAL-LOCAL` se entrenan/validan **solo** con C0. La evaluación (macro-F1/ECE) se reporta
   exclusivamente contra el holdout de C0. Comparar un modelo `REF` contra un split de C0 es **información**, no
   decisión de S81.

4. **Regla de reporting (estado).** `dataset_state` de C0 y `reference_status` de C1 son **estados separados**.
   Ningún reporte puede sumar muestras de C1 al conteo de C0 para aparentar avance (regla de honestidad).

**Consecuencia:** la no contaminación queda garantizada por **cuatro barreras ortogonales** (física, de datos,
de entrenamiento y de reporting). No requiere confiar en "cuidado" humano.

---

# 10. EXTENSIONES FUTURAS DE `schema.json` (respuesta 9 — SOLO PROPUESTA)

Impacto sobre `schema.json` **1.2.0** (C0) si se activa o se referencza la capa C1. **Nada se ejecuta.**

| Elemento | 1.2.0 actual | Propuesta | Naturaleza |
|---|---|---|---|
| `partition` | `unassigned · train · validation · test · holdout` | añadir `reference` (opcional, para una eventual tabla maestra unificada v2) | extensión de lista cerrada de columna `OBLIGATORIA` → **2.0.0 / v2** si cambia el conjunto; si no, decisión de gobernanza |
| `source` | `cmsc_logger · fsd50k · esc50 · xeno_canto · speech_commands · sonyc` | añadir `birdclef`; descartar `urbansound8k` | extensión de lista cerrada |
| `license` | `PROPIO · CC0 · CC-BY · CC-BY-SA · CC-BY-NC` | añadir `CC-BY-NC-SA` (BirdCLEF) y/o **excluir** `CC Sampling+` (FSD50K) | extensión de lista cerrada; `ND` sigue prohibido |
| `taxonomy` | `acoustic_v1_taxonomy` (9 clases) | nueva `taxonomy_version` si se incorporan `abejas`/`paisaje rural` (futuro) | **bump de taxonomía + `dataset_version v2`** |
| `dataset_state` | máquina 5 estados de C0 | NO acoplada a C1; C1 usa `reference_status` propio | sin cambio |
| `feature_storage` | `features/acoustic_features_v2.csv` (C0) | C1: `features/` dentro de `reference/<source_id>/` con el **mismo** esquema `acoustic.feat.window.v2` | directiva de capa, no de esquema |

**Pendiente de decisión de Bernardo antes de cualquier bump:** (i) `partition=reference` sí/no y si ese valor
entra en `metadata.csv` de una futura v2; (ii) admitir `CC Sampling+` o filtrarlo; (iii) fuente de BirdCLEF
(competición NC-SA vs mirror CC0 verificado); (iv) incorporar `abejas`/`paisaje rural` a la taxonomía.

---

# 11. ARQUITECTURA H0 COMPLETA (entrega A)

```mermaid-lite
C2 ontología (audioset/) ──► verificar mids G-DS-1d ──► embeddings YAMNet sobre C0 (REF)
C1 referencia (6 sources) ─► Filtro por clip (licencia, clase, duración)
                            ├─► pre-train extractor (REF)
                            ├─► bootstrap cerrado ESC-50 (REF)
                            ├─► negatives / features (REF)
                            └─► JAMÁS────► train|validation|test de C0
C0 objetiva (v1/v2) ────────► G-DS-2/3/4/6 ──► evaluación única ──► S81 → REAL-LOCAL
S82 (anomalías) ◄─────────── baseline C0 + OOD (diseño, fuera de H0)
```

**Componentes físicos que esta misión define (y NO crea):**
1. Árbol `reference/` (§6) — especificado.
2. `REFERENCE_GOVERNANCE.md`, `REFERENCE_DATASET_CARD.md`, `reference_manifest.yaml` y `mapping_c0_to_sources.yaml` — especificados (§7, §8).
3. Estados y gates G-REF-1..6 — definidos.
4. Reglas de separación C0/C1 — definidas (§9).
5. Vocabulario futuro de `schema.json` — propuesto (§10).

---

# 12. RIESGOS (entrega D)

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| H0-R1 | Se descarga demasiado (volumen/duplicación: ESC-50 vs FSD50K subsets) | 🟠 | ingesta por rol, no por "tenerlo todo"; filtro por clases mapeadas |
| H0-R2 | Licencia por clip mal gestionada (FSD50K `Sampling+`; Xeno-canto `ND`) | 🔴 | G-REF-2 (DISTINCT license por clip) + exclusión `ND` innegociable |
| H0-R3 | BirdCLEF NC-SA contamina los derivados | 🔴 | decidir mirror (CC0 verificado) o aislar `SA` de C0; derivados SA declarados |
| H0-R4 | Fuga accidental de referencia en split de C0 | 🔴 | 4 barreras (§9); gates G-DS-2/5 + G-REF-6 |
| H0-R5 | Estado fingido de "dataset listo" sin bytes | 🔴 | `reference_status=PLANIFICADO` + 0 bytes declarados en la tarjeta |
| H0-R6 | Reproducibilidad degradada (Anubis Xeno-canto, Kaggle BirdCLEF) | 🟠 | `provenance` completa + pin de versiones + mirrors/Zenodo |
| H0-R7 | Embeddings de C0 con YAMNet se etiquetan como capacidad propia | 🟠 | resultado `REF` siempre; C2 no sube estado de S81 |
| H0-R8 | `abejas`/`paisaje rural` se diseñan sin escalar la taxonomía | 🟡 | declaradas candidatas futuras; bump de `taxonomy_version` si se aprueban |

---

# 13. RECOMENDACIÓN OFICIAL (entrega E) Y VEREDICTO (entrega F)

## 13.1 Recomendación oficial

1. **Adoptar la arquitectura H0 tal como se define aquí** (árbol `reference/`, estado `PLANIFICADO`, 7 fuentes).
2. **Materializar la capa en fases estrictas**: primero gobernanza (documentos + checksums vacíos honestos),
   después ingesta por rol siguiendo `G-REF-1..6`, nunca descarga masiva sin filtro.
3. **Orden de ingesta sugerida** (cuando haya misión): ESC-50 (bootstrap, pequeño) → FSD50K filtrado
   (pretrain) → SONYC (MOTOR, CC BY) + Speech Commands (VOZ, CC BY) → Xeno-canto/BirdCLEF (subclases, previo
   decisión de fuente) → C2 (ontología/embeddings).
4. **No descargar nada antes de cerrar las 3 decisiones de Bernardo** (§10 pendientes).
5. **C0 sigue siendo la única vía a `REAL-LOCAL`**: no se inicia ninguna ingesta REF que desplace a
   `CMSC_DATA_LOGGER_V1`.
6. **Registrar todo modelo alimentado por C1/C2 como `REF`** hasta que un gate G-M-* sobre C0 lo ascienda.

## 13.2 Veredicto

> ## GO_H0 — CONDICIONADO ✅
>
> La arquitectura de la capa REF está completa, trazable y compatible con el canon. El veredicto es **GO**
> **condicionado a 3 decisiones de Bernardo** (ninguna bloquea el *diseño*, todas bloquean la *ingesta*):
>
> 1. **Vocabulario `schema.json`**: aprobar o no `partition=reference`, `source=birdclef` y el tratamiento de
>    `CC Sampling+` / `CC-BY-NC-SA` para una futura v2.
> 2. **Fuente BirdCLEF**: competición `CC BY-NC-SA 4.0` vs mirror `CC0` verificado por archivo.
> 3. **Alcance de taxonomía**: confirmar si `abejas` y `paisaje rural` entran como clases candidatas (requiere
>    `taxonomy_version` nueva) o se descartan fuera del alcance.
>
> Sin esas 3 decisiones, la siguiente misión de H0 (materialización del árbol y de la gobernanza en disco) está
> lista para ejecutarse; la **ingesta de audio** requiere además una misión explícita de descarga.

---

# 14. NO-ACCIONES CONFIRMADAS

Sin descarga de ningún dataset · sin escritura del árbol `reference/` · sin modificación de `v1/` (`schema.json`,
`labels.csv`, `metadata.csv`, `acoustic_features_v2.csv` intactos) · sin entrenamiento · sin cambios en CMSC,
S30, S81, S82 · sin commits ni push. **Este documento solo especifica.**

# 15. TRAZABILIDAD CON LA ESTRATEGIA HÍBRIDA

| Elemento | `AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` | Este documento (H0) |
|---|---|---|
| Capas C0/C1/C2 | definidas | **materializa C1/C2 en arquitectura física y gobernanza** |
| Regla de no mezcla | declarada | **operacionalizada en 4 barreras** (§9) |
| UrbanSound8K | excluido | **justificado formalmente** (§4.4) |
| Roadmap H0→H5 | fase H0 = gobernanza + árbol `reference/` | **este es el entregable de H0** |
| Extensiones `schema.json` | mencionadas | **enumera ítems + decisiones** (§10) |