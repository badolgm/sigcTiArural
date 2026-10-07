# AI ACOUSTIC DATASET — TAXONOMÍA Y DATASETS EXTERNOS · ESTRATEGIA HÍBRIDA v1

**Misión:** `CMSC_TAXONOMY_AND_EXTERNAL_DATASETS` · **Fecha:** 2026-10-06 · **HEAD:** `a125a66` · **Estado:** SOLO DISEÑO Y AUDITORÍA — sin descarga, sin entrenamiento, sin implementación
**Regla de honestidad:** todo lo aquí descrito **no se ha descargado todavía**. Cada cifra se marca como verificada (2026-10-06) o como estimación no verificada. Ningún dataset público convierte a S81 en `REAL-LOCAL`.

**Documentos rectores (canonos, sin divergencia):**
- `docs/AI_ACOUSTIC_DATASET_REVIEW.md` — FASE 1 (2026-10-02): los públicos son **proxies**, no el dataset.
- `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` — gobernanza canónica de lo construido (`schema.json` 1.2.0, `labels.csv` 9 clases, gates G-DS-1..6, AC-1..10, SG-1..5).
- `docs/AI_ACOUSTIC_DATASET_V1_DESIGN.md` — intención original del diseño (§14 reconciliación, D-4).
- `docs/AI_ACOUSTIC_FEATURE_MAP.md` · `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md` · `docs/AI_ACOUSTIC_MODEL_BENCHMARK.md` — esquema `acoustic.feat.v2` (22 features, ventana mean+std → 44 dims), S81/S82, benchmark.

---

# 0. RESUMEN EJECUTIVO

La pregunta de la misión es: **¿con qué corpus se construye el clasificador acústico S81, combinando
datasets externos con el corpus propio, sin romper la gobernanza SIGCT-Rural?**

Respuesta en una frase:

> **El corpus propio (`SIGCT_RURAL_ACOUSTIC`, capturado con `CMSC_DATA_LOGGER_V1`) es la única fuente de
> ground truth evaluable de S81; los datasets externos son una capa de referencia (`REF`) para
> pre-entrenamiento, bootstrap cerrado y cobertura de subclases, y **jamás** entran en el split de
> evaluación del clasificador.**

Estructura híbrida definitiva en **3 capas**:

| Capa | Contenido | Estado | Promueve S81 a `REAL-LOCAL` |
|---|---|---|---|
| **C0 — Objetiva (propia)** | `sigct_rural_acoustic` capturado en campo/lab, `source=cmsc_logger`, `license=PROPIO` | `CAPTADO_INICIAL` (1 muestra) → objetivo 8×150 | **SÍ** (vía G-DS-2 + G-DS-3) |
| **C1 — Referencia externa** | FSD50K (pre-entrenamiento) · ESC-50 (bootstrap) · Xeno-canto/BirdCLEF (AVE/INSECTOS) · SONYC-UST (MOTOR) · Speech Commands (VOZ) | `REF` por diseño | **NO** |
| **C2 — Ontológica / transferencia** | AudioSet ontología (CC BY-SA) + YAMNet (embeddings, TFLite) | `REF` | **NO** |

**8 datasets verificados 2026-10-06** (licencias confirmadas en fuentes primarias): ver §2.
**9 clases analizadas**: 7 tienen proxy público, **2 no existen en público** (`silencio`, `ruido_desconocido`) — ver §3.
**Decisión propuesta clave: UrbanSound8K queda fuera de la estrategia** (redundante con SONYC-UST y licencia `NC`);
**AudioSet no se usa como corpus de audio** (no redistribuible; solo ontología + embeddings).

**Estado de la gobernanza tras esta misión: sin cambios.** Este documento **propone** extensiones de
vocabulario (`partition`, `source`, `license`) para la Fase H0, que requieren decisión de Bernardo y
bump de `schema.json`; **no las declara implementadas.**

---

# 1. CRITERIOS DE EVALUACIÓN (heredados de `AI_ACOUSTIC_DATASET_REVIEW.md` §1, vigentes)

| # | Criterio | Peso | Observación tras actualización 2026-10-06 |
|---|---|---|---:|
| C1 | **Licencia** compatible con uso académico/derivados | 25% | `ND` bloquea entrenamiento; `NC` tolerable en academia y debe marcarse; `SA` condiciona derivados (mantener separación). |
| C2 | **Relevancia** a las 9 clases objetivo | 25% | Sin solapamiento, no sirve. |
| C3 | **Acceso reproducible** (sin login/formulario) | 15% | Kaggle (BirdCLEF) y Xeno-canto (Anubis) pierden puntos ahora. |
| C4 | **Tamaño manejable** (flujo local, fuera de git) | 10% | AudioSet (1,89 TiB con mirror) y BirdCLEF (~33 GB) son externalizables pero no versionables. |
| C5 | **Calidad de etiquetado** | 15% | SONYC-UST: 3 votos voluntarios + subconjunto verificado doble-etiqueta (1.385). ESC-50: alta. FSD50K: débil por clip. |
| C6 | **Alineación ontológica** (transferencia/embeddings) | 10% | AudioSet asocia con YAMNet (521 clases). |

Escala: **A** (excelente) · **B** (aceptable) · **C** (limitado) · **D** (bloqueante).

---

# 2. FICHAS POR DATASET (verificadas 2026-10-06)

> Fuentes primarias consultadas: Zenodo (FSD50K 4060432 · SONYC-UST 3873076/3966543 · UrbanSound8K 1203745),
> GitHub karoldvl/ESC-50, research.google.com/audioset, Kaggle BirdCLEF+ 2026, GBIF/Xeno-canto, TensorFlow
> Speech Commands (arXiv:1804.03209).

## 2.0 Matriz comparativa

| Dataset | Clips | Clases | Licencia | Acceso | Solap. 9 | Rol propuesto | Veredicto |
|---|---|---:|---|---|---|---|---|
| **FSD50K** | 51.197 (≈108,3 h) | 200 (ont. AudioSet) | por clip (CC0/CC-BY/CC-BY-NC/CC Sampling+) · dataset CC-BY | Zenodo directo | 7–8/9 | pre-entrenamiento | 🥇 incluir |
| **ESC-50** | 2.000 (40×50) 5 s | 50 | **CC BY-NC 3.0** (ESC-10: CC BY) | GitHub directo | 6–7/9 | bootstrap cerrado | 🥈 incluir |
| **BirdCLEF+ 2026** | ~33 GB (207 dirs) · test ~600 soundscapes 1 min/32 kHz | 234 (aves/anfibios/mamíferos/reptiles/insectos) | **CC BY-NC-SA 4.0** (Kaggle; mirrors CC0) | Kaggle cuenta | 2/9 (profundo) | AVE/INSECTOS | 🥉 incluir con filtro |
| **Xeno-canto** | ~857.858 ocurrencias (subset GBIF) | miles de especies (aves, parcial insectos) | **por grabación** (CC BY/SA/NC/**NC-ND**) · subset GBIF CC BY-NC 4.0 | API protegida (Anubis) | 2/9 (profundo) | AVE/INSECTOS | 🥉 incluir con filtro |
| **SONYC-UST v2.3** | 18.515 grabaciones 10 s (1.385 verificadas) | multilabel 23 finas/8 gruesas | **CC BY 4.0** ✅ | Zenodo directo | 1–2/9 | MOTOR | ✅ incluir |
| **Speech Commands v2** | 105.829 (35 palabras, 1 s) | 35 + silencio/desconocido | **CC BY 4.0** ✅ | TensorFlow directo | 1/9 | VOZ/VAD | ✅ incluir |
| **UrbanSound8K** | 8.732 (≤4 s) | 10 | **CC BY-NC** (4.0 Zenodo / 3.0 sitio) | Zenodo directo (6,0 GB) | 1/9 | MOTOR (redundante) | ❌ **excluir** |
| **AudioSet** | 2.084.320 segmentos (10 s, YouTube) | 527+ (ontología histórica 632) | anotaciones **CC BY 4.0** · ontología **CC BY-SA 4.0** · **audio NO distribuido** | no entrega audio | 9/9 ontol. · 0 material | ontología + YAMNet | 🔶 solo ontología |

## 2.1 Fichas detalladas

### 2.1.1 FSD50K — columna vertebral de pre-entrenamiento
- **Hechos verificados:** 51.197 clips (dev 40.966 + eval 10.231), 200 clases de la ontología AudioSet, ≈108,3 h; Zenodo record 4060432; descarga directa sin login.
- **Licencia:** **por clip** (CC0 · CC-BY · CC-BY-NC · CC Sampling+), con el dataset global liberado bajo **CC-BY**. → Requiere **filtro por clip** (excluir `CC Sampling+` si no se extiende la lista cerrada de `schema.json`; marcar `NC`).
- **Fuerte:** cobertura casi total (7–8/9), ontológica alineada, permiso de redistribución.
- **Débil:** etiqueta multilabel débil/ruidosa; volumen grande local; tamaño no verificado en esta sesión (se estima del orden de GB).
- **Uso honesto:** pre-entrenar el extractor/embedding y negativos diversos. Resultado `REF`.

### 2.1.2 ESC-50 — bootstrap limpio y balanceado
- **Hechos verificados:** 2.000 clips (40 × 50 clases), 5 s c/u, WAV 44,1 kHz mono, 5 folds, origen Freesound; `meta/esc50.csv`; GitHub directo.
- **Licencia:** **CC BY-NC 3.0** global; **ESC-10** (10 clases) **CC BY**.
- **Fuerte:** balance perfecto, etiqueta humana de alta calidad, descarga trivial, solapamiento directo con 6–7 clases.
- **Débil:** `NC`; techo real ~40 clips/clase; sin SILENCIO ni VOZ.
- **Uso honesto:** primer benchmark cerrado de 6 clases y smoke test del pipeline features/modelo (`REF`, `NC` documentado).

### 2.1.3 BirdCLEF+ 2026 — profundidad para AVE/INSECTOS
- **Hechos verificados:** Kaggle, Pantanal brasileño; clases aves/anfibios/mamíferos/reptiles/insectos (**234**); competencia con soundscapes de test (~600 grabaciones de 1 min, 32 kHz); mirror "master dataset" ~33 GB (207 directorios); un mirror Kaggle bajo **CC0**, el repack de la competencia bajo **CC BY-NC-SA 4.0**.
- **Licencia:** la de la competición es **NC + SA**; existen mirrors CC0 **sin verificar exhaustivamente** cada fichero → uso condicionado a verificación previa (G-DS-5 por clip).
- **Fuerte:** única fuente industrial de bioacústica (AVE/INSECTOS) del Neotrópico.
- **Débil:** licencia NC-SA (derivados heredan SA), acceso Kaggle con cuenta, volumen alto.
- **Uso honesto:** pre-entrenamiento/features de AVE e INSECTOS; **no** entra al split de evaluación (`REF`).

### 2.1.4 Xeno-canto — referencia por grabación para AVE/INSECTOS
- **Hechos verificados:** colección comunitaria; subset GBIF con ~857.858 ocurrencias (100 % taxon match, 97 % con coordenadas) bajo metadatos **CC BY-NC 4.0**; las **grabaciones individuales** llevan licencia elegida por el registrador (CC BY · CC BY-SA · CC BY-NC · **CC BY-NC-ND**).
- **Acceso:** la web/API está ahora tras **Anubis** (anti-scraping); descarga masiva desatendida degradada en reproducibilidad.
- **Regla:** filtrar por licencia — **excluir `ND`** (prohíbe derivados/entrenamiento); `NC` operable en academia marcándolo; preferir `CC0/CC-BY/CC-BY-SA`.
- **Uso honesto:** corpus de referencia AVE/INSECTOS con columna `license` por clip (`REF`).

### 2.1.5 SONYC-UST v2.3 — MOTOR/ruido urbano con mejor licencia
- **Hechos verificados:** 18.515 grabaciones de 10 s de la red de sensores de NYC; multilabel **23 clases finas / 8 gruesas**; subconjunto **verificado** (doble etiqueta, desacuerdos resueltos) de 1.385; splits disjuntos por sensor; Zenodo (v2.3 record 3966543; v2.2 3873076).
- **Licencia:** **CC BY 4.0** ✅ — la más permisiva del conjunto.
- **Fuerte:** licencia, anotación verificada parcial, ruido urbano realista para `motor` y para el **bucket `ruido_desconocido`** de S82.
- **Débil:** 100 % urbano (NYC); sin clases naturales.
- **Uso honesto:** activo `REF` para MOTOR y OOD urbano.

### 2.1.6 Speech Commands v2 — VOZ/VAD con licencia libre
- **Hechos verificados:** 105.829 utterances de 35 palabras, 1 s, 16 kHz, 16-bit mono PCM, 2.618 hablantes; splits del paper 84.848/9.982/4.890 (TFDS: 85.511/10.102/4.890); ~3,8 GB (2,7 GB comprimido); descarga directa TensorFlow.
- **Licencia:** **CC BY 4.0** ✅.
- **Fuerte:** VOZ con silencio/desconocido integrados; excelente para VAD y negativos de voz; sin fricción legal.
- **Débil:** inglés, palabras sueltas (no habla conversacional); entorno ≠ rural.
- **Uso honesto:** VAD / detección de presencia de voz (`REF`). El `voz` evaluable debe ser **propio** (español rural, consentimiento).

### 2.1.7 UrbanSound8K — **excluido**
- **Hechos verificados:** 8.732 clips ≤4 s, 10 clases urbanas, 10 folds, Zenodo directo (tar.gz 6,0 GB); licencia **CC BY-NC** (4.0 en Zenodo; 3.0 en el sitio oficial).
- **Motivo de exclusión:** solapamiento 1/9 (solo `engine_idling`), licencia `NC`, **redundante con SONYC-UST (CC BY)**. No aporta sobre SONYC. Si Bernardo insiste, se limita a `REF` MOTOR con `NC` marcado.
- **Uso honesto:** no se incorpora a la estrategia por defecto.

### 2.1.8 AudioSet + YAMNet — solo capa ontológica
- **Hechos verificados:** 2.084.320 segmentos de 10 s de YouTube; 527+ etiquetas en el índice actual (ontología histórica 632); anotaciones **CC BY 4.0**, ontología **CC BY-SA 4.0**; **audio NO distribuido** (el mirror HF estima 1,6 M segmentos recuperables / ~1,89 TiB, con 240 k vídeos eliminados — acceso gated, sin re-distribución).
- **Consecuencia:** usar audio de AudioSet = descargar YouTube bajo ToS → frágil y no reproducible. **No es corpus**, es **ontología + profesor de embeddings** (YAMNet: MobileNetV1/TFLite, 521 clases).
- **Rol:** verificar los 7 `mid` `UNVERIFIED` de `labels.csv` contra `yamnet_class_map.csv` (accionable para G-DS-1) y reportar embeddings como `REF`.

---

# 3. COBERTURA POR CLASE (tabla de las 9 clases)

| `class_id` | OOD | Cobertura pública | Fuentes (≈ tamaño disponible) | Captura local necesaria | ¿Importable a C1 (REF)? |
|---|---:|---|---|---|---|
| `silencio` | no | ❌ **inexistente** como clase | — (piso de ruido del entorno) | **sí, obligatoria** | no |
| `viento` | no | ✅ proxy | ESC-50 `wind` (40) · FSD50K `Wind` | sí (entorno real decisivo) | parcial (proxy, no eval) |
| `lluvia` | no | ✅ proxy | ESC-50 `rain` (40) · FSD50K `Rain` | sí (oportunista por clima) | parcial (proxy, no eval) |
| `agua` | no | ✅ proxy | ESC-50 `water_drops` (40) + `sea_waves` (40) + `pouring_water` (40) · FSD50K `Water` | sí | parcial (proxy, no eval) |
| `insectos` | no | 🟡 profundo, sesgo región/especie | Xeno-canto / BirdCLEF `Insecta` (miles) · ESC-50 `crickets`/`insects` (80) | sí (estridulación local, nocturna) | sí (solo pre-entrenamiento) |
| `ave` | no | ✅ profundo | Xeno-canto / BirdCLEF (miles) · ESC-50 `chirping_birds`/`rooster`/`crow` (120) | sí (huerta/arbustos) | sí (solo pre-entrenamiento) |
| `voz` | no | 🟡 inglés monopalabra | Speech Commands (105.829, CC BY) · FSD50K `Speech` | sí (español rural + consentimiento) | VAD sí · clase evaluable **no** |
| `motor` | no | ✅ proxy urbano | SONYC-UST (18.515 grab, CC BY) · UrbanSound8K `engine_idling` (NC, excluido) | sí (maquinaria agrícola) | parcial (proxy, no eval) |
| `ruido_desconocido` | **sí** | ❌ bucket OOD | — | **nunca** a demanda (§5.6 gobernanza) | no (se llena con reject/ambiguos/`ND`) |

**Lectura de la tabla:** 8 de 9 clases exigen captura local para el ground truth evaluable. El material
externo (C1) sirve como **proxy de pre-entrenamiento y como negatives**, nunca como verdad de S81.

---

# 4. LAS 8 PREGUNTAS DE LA MISIÓN → RESPUESTAS

1. **¿Qué clases del SIGCT-Rural cubren los datasets externos?**
   `viento`, `lluvia`, `agua`, `insectos`, `ave`, `voz` y `motor` (7/9) **como proxies**. Solo `insectos` y
   `ave` tienen profundidad de clase real (Xeno-canto/BirdCLEF). `motor` tiene buen proxy urbano (SONYC).
2. **¿Qué clases NO cubren?**
   `silencio` (no existe como clase pública: el silencio es piso de ruido del entorno) y
   `ruido_desconocido` (bucket OOD, no capturable a demanda). Ningún público cubre el **dominio rural** en sí.
3. **¿Qué debe capturarse localmente (obligatorio)?**
   Las **8 clases vivas** para el ground truth evaluable de S81 (`silencio`..`motor`) con `cmsc_logger`, y el
   llenado de `ruido_desconocido` vía rechazos/ambiguos. El silencio y el OOD son **exclusivamente propios**.
4. **¿Qué se puede importar (como referencia)?**
   FSD50K (pre-entrenamiento) · ESC-50 (bootstrap) · Xeno-canto/BirdCLEF (AVE/INSECTOS) · SONYC-UST (MOTOR) ·
   Speech Commands (VOZ/VAD). **UrbanSound8K excluido**; **AudioSet nunca como audio**.
5. **¿Tamaño disponible por clase?**
   Ver §3: para `insectos`/`ave` **miles** de grabaciones (Xeno-canto/BirdCLEF); `voz` ≈3.000 utterances/palabra
   (Speech Commands) + subset `Speech` de FSD50K; `viento`/`lluvia`/`agua` 40–120 clips (ESC-50) + subsets de
   FSD50K (centenares, no verificados con precisión); `motor` ≈18.515 grabaciones multilabel (SONYC, con
   verificadas = 1.385) + subtags `engine`. `silencio`/OOD = 0 (propio).
6. **¿Restricciones de licencia?**
   - `ND` (Xeno-canto `BY-NC-ND`) → **prohibido entrenar** (G-DS-5: `ND` inexistente en la lista cerrada).
   - `NC` (ESC-50, UrbanSound8K, BirdCLEF officielle) → usable en academia, **marcado explícito por clip**.
   - `SA` (ontología AudioSet CC BY-SA; BirdCLEF CC BY-NC-SA) → los **derivados** deben redistribuirse con la
     misma licencia; mantener separado de la capa propia (no contaminar `PROPIO`).
   - `CC Sampling+` (algunos clips FSD50K) → fuera de la lista cerrada actual; filtrar o extender vocabulario.
   - AudioSet **no es redistribuible** como audio (YouTube ToS).
7. **¿Riesgos científicos?**
   (a) **Domain shift** lab/urbano → campo rural (el más grave); (b) **ruido de etiqueta** (FSD50K débil,
   SONYC voluntarios) degrada ECE/calibración; (c) **sesgo geográfico/especie** en AVE/INSECTOS; (d) **contaminar
   el split de S81** con externos rompería la definición de `REAL-LOCAL` y el anti-leakage G-DS-3; (e) desbalance
   si se mezcla sin filtrar; (f) reproducibilidad (Xeno-canto/Anubis, Kaggle con cuenta).
8. **¿Estrategia híbrida recomendada?**
   Las 3 capas de §5 con la **regla de no mezcla**: externo = `REF` (pre-entrenamiento/bootstrap/negatives),
   propio = única evaluación; gobernanza SIGCT-Rural intacta e incorpora a los externos con `license`/`source`
   por clip. Detalle y fases en §5 y §7.

---

# 5. ESTRATEGIA HÍBRIDA (DISEÑO)

## 5.1 Capa C0 — Objetiva (propia) · única verdad evaluable

- `data/datasets/sigct_rural_acoustic/v1/` con `source=cmsc_logger`, `license=PROPIO`.
- Meta: **8 clases vivas × ≥150 clips** (G-DS-2), split 70/15/15 con group split por `(session_id, place_id)` + holdout (G-DS-3), doble anotación (G-DS-6).
- Estado actual: `CAPTADO_INICIAL` (1 muestra `silencio`, piloto E1) → el camino sigue siendo `CMSC_DATA_LOGGER_V1` (piloto de 100 → captura masiva).
- **Regla dura:** el `train|validation|test` de esta capa contiene **solo** `cmsc_logger`. Ningún clip externo entra en la evaluación de S81.

## 5.2 Capa C1 — Referencia externa (`REF`)

Árbol propuesto (fuera del árbol de evaluación; decisión de gobernanza en Fase H0):

```
data/datasets/sigct_rural_acoustic/reference/<source_id>/
├── esc50/        # 2.000 clips (CC BY-NC 3.0; ESC-10 CC BY)
├── fsd50k/       # subset filtrado a clases mapeadas + licencias CC (por clip)
├── xeno_canto/   # AVE/INSECTOS filtrados (excluir ND; marcar NC)
├── birdclef/     # (opcional) subset bioacústico verificado
├── sonyc_ust/    # 18.515 grabaciones multilabel (CC BY)
├── speech_commands/  # 105.829 utterances (CC BY)
└── manifest_ref.<source_id>.yaml   # licencia POR CLIP + tabla de mapeo class_id
```

- Consumo permitido: **pre-entrenamiento** del extractor/embedding, **bootstrap cerrado** (ESC-50), **negatives** y **features de análisis** (no evaluación).
- Consumo prohibido: escribir filas en `metadata.csv` de S81 como `train/validation/test`; contribuir a G-DS-2; promocionar S81.
- Resultado de modelos entrenados sobre C1: **`REF`** (nunca `REAL-LOCAL`).

## 5.3 Capa C2 — Ontológica / transferencia

- AudioSet **ontología** (CC BY-SA) sola: verificar los 7 `mid` `UNVERIFIED` de `labels.csv` contra `yamnet_class_map.csv` → accionable para G-DS-1(d).
- **YAMNet** (TFLite, 521 clases): profesor de embeddings para transferencia; salida consignada como `REF`.
- Regla: no se descarga ni se entrena sobre audio de YouTube.

## 5.4 Regla de honestidad por capa (resumen)

| Resultado | Capa | Estado S81 |
|---|---|---|
| modelo sobre C1/C2 | REF | permanece `DISENO` |
| modelo sobre C0 con G-DS-1..4 y G-DS-6 | REAL (propio) | sube a `REAL-LOCAL` vía G-DS-2/3 + G-M-* |
| mezcla C0+C1 en cualquier split de evaluación | **prohibido** | invalida la evaluación |

---

# 6. INTEGRACIÓN DE GOBERNANZA (impacto sobre `schema.json` 1.2.0 — SOLO PROPUESTA)

Sin cambiar el canon existente, la estrategia **propone** estos cambios de vocabulario, que exigen
decisión de Bernardo y bump de versión. **Nada de esto se ejecuta en esta misión.**

| Elemento | `schema.json` 1.2.0 actual | Propuesta | Tipo de cambio |
|---|---|---|---|
| `partition` | `unassigned, train, validation, test, holdout` | añadir `reference` (o artefacto hermano fuera del árbol de split) | extensión de lista cerrada de una `OBLIGATORIA` → **2.0.0 / v2** si se cambia el conjunto de columnas; documento de gobernanza decide |
| `source` | `cmsc_logger, fsd50k, esc50, xeno_canto, speech_commands, sonyc` | añadir `birdclef`, `urbansound8k` (si se reactiva), `audioset_embeddings` | extensión de lista cerrada |
| `license` | `PROPIO, CC0, CC-BY, CC-BY-SA, CC-BY-NC` | confirmar `CC Sampling+` como excluible o añadirlo; `ND` **permanece prohibido** | extensión de lista cerrada |
| `G-DS-2` | solo `source=cmsc_logger` | **sin cambio** (externos no cuentan para el mínimo) | — |
| `G-DS-5` | licencia por clip | aplica ahora a C1 (por clip, no por dataset); `NC` marcado explícito | criterio ya vigente, ahora con material que verificar |
| Manifiestos | `raw_source_manifest` lista fuentes | registrar cada fuente C1 con su licencia y ruta de árbol de referencia | actualización de manifiesto (al liberar) |

**Invariante protegido:** `metadata.csv` de la capa C0 sigue siendo la única tabla maestra de S81. La capa C1
tiene **su propio** manifiesto, ídem C2. No se mezclan fuentes de verdad.

---

# 7. ROADMAP HÍBRIDO (fases con gates)

| Fase | Contenido | Gate / condición | Estado |
|---|---|---|---|
| **H0 · Gobernanza** | Decidir extensiones de vocabulario (§6); definir árbol `reference/`; actualizar `REVIEW.md` → este doc como estrategia; verificar `mid` AudioSet contra `yamnet_class_map.csv` | Decisión de Bernardo; bump de `schema.json` coherente | **no iniciada** |
| **H1 · Bootstrap ESC-50** | Descargar ESC-50 (2.000 clips); benchmark cerrado de 6 clases; smoke test features/modelo | G-DS-5 por clip (`NC` marcado) | no iniciada |
| **H2 · Pre-entrenamiento FSD50K** | Descargar subset filtrado (clases mapeadas + licencias permitidas); extractor/embedding → ml-v0 `REF` | filtro por clip; ~volumen local verificado | no iniciada |
| **H3 · Subclases profundas** | Xeno-canto/BirdCLEF (AVE/INSECTOS, filtro `ND`/`NC`) · SONYC-UST (MOTOR, CC BY) · Speech Commands (VOZ/VAD, CC BY) | licencia por clip; reproducibilidad (Anubis/Kaggle documentado) | no iniciada |
| **H4 · Propio (independiente y paralelo)** | `CMSC_DATA_LOGGER_V1`: piloto 100 → masivo 8×150 → G-DS-2/3/4/6 | piloto 100 % doble revisión; gates §4 gobernanza | **ya es la próxima misión** |
| **H5 · Decisión ml-v0 vs ml-v1** | Comparar clasificador C1 (`REF`) vs C0 (`REAL`); evaluar **solo** con C0 | macro-F1/ECE sobre holdout de C0 | no iniciada |

> **Posicionamiento:** H1–H3 (externo) **no bloquean** H4 (propio). La instrucción de gobernanza se mantiene:
> **primero audio** (`CMSC_DATA_LOGGER_V1`); las capas REF son refuerzo, no sustitución.

---

# 8. RECOMENDACIÓN OFICIAL

1. **Sí a la estrategia híbrida de 3 capas**, con `SIGCT_RURAL_ACOUSTIC` (C0) como única evaluación y los
   externos como `REF` (C1) + ontología/embeddings (C2).
2. **Incluir por defecto:** FSD50K (pre-entrenamiento, filtro por clip) · ESC-50 (bootstrap, `NC` marcado) ·
   Xeno-canto y/o BirdCLEF (AVE/INSECTOS, excluir `ND`/`NC` marcado) · SONYC-UST (MOTOR, CC BY) ·
   Speech Commands (VOZ/VAD, CC BY).
3. **Excluir por defecto:** UrbanSound8K (redundante con SONYC, `NC`); AudioSet como corpus (no redistribuible) —
   usar solo ontología + YAMNet.
4. **Regla inseparable:** ningún clip de C1/C2 entra en `train|validation|test` de S81. La promoción a
   `REAL-LOCAL` requiere G-DS-2/3 sobre `cmsc_logger`.
5. **Primera acción (no esta misión):** ejecutar H0 (decisiones de gobernanza) y **avanzar H4**
   (`CMSC_DATA_LOGGER_V1`), que es la única vía que activa los gates.

---

# 9. RIESGOS DE LA ESTRATEGIA

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| HR1 | Mezclar `REF` con `REAL-LOCAL` en un modelo "sintético" | 🔴 | Capas separadas; estado por capa; G-DS-2 inmutable |
| HR2 | Licencias por clip mal documentadas (FSD50K `Sampling+`, Xeno-canto `ND`) | 🔴 | filtro por clip + columna `license` (G-DS-5) |
| HR3 | Domain shift lab/urbano → rural degrada la transferencia | 🔴 | siempre acompañar con C0; evaluar solo en C0; filtros por `environment` |
| HR4 | Ruido de etiquetas externas degrada calibración | 🟠 | usar externo solo para pre-entrenar/negatives, no para validar |
| HR5 | Reproducibilidad (Anubis Xeno-canto, Kaggle BirdCLEF, YouTube AudioSet) | 🟠 | documentar el proceso; pin de versiones; preferir Zenodo/GitHub |
| HR6 | Volumen (AudioSet 1,89 TiB; BirdCLEF 33 GB) rompe el flujo local | 🟠 | externalizar a disco local (como dataset agrícola); fuera de git |
| HR7 | Sesgo de especie/región en AVE/INSECTOS | 🟠 | uso solo REF; el ground truth rural es propio |

---

# 10. NO-ACCIONES CONFIRMADAS

Sin descarga · sin entrenamiento · sin inferencia · sin cambios en `schema.json` · sin filas en `metadata.csv` ·
sin tocar `Hero`/`Dashboard`/`Workbench V6`/`SpectralAnalysisInstrument`/S30 · sin commits ni push.
Este documento es **diseño de estrategia**; las extensiones de gobernanza (§6) y las descargas (§7 H1–H4)
requieren misiones explícitas posteriores y la autorización de Bernardo.

# 11. TRAZABILIDAD CON EL DOCUMENTO DE REVISIÓN (REVIEW v1)

| Pregunta de esta misión | ANSWER en REVIEW v1 (2026-10-02) | Cambio verificado 2026-10-06 |
|---|---|---|
| TOP 3 | FSD50K · ESC-50 · Xeno-canto/BirdCLEF | **se mantiene** (reforzado por BirdCLEF+ 2026) |
| Auxiliares | Speech Commands v2, SONYC-UST, UrbanSound8K, AudioSet/YAMNet | SONYC y Speech Commands **ascienden a incluidos**; UrbanSound8K **cae a excluido**; AudioSet permanece ontológico |
| Split de evaluación | (no aplicaba) | **regla nueva explícita:** externos jamás en `train|validation|test` de S81 |
| Estado | públicos como `REF` | idem; **se añade la capa C2** (ontología + embeddings) |