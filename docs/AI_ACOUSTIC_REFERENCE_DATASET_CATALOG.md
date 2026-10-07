# REFERENCE ACOUSTIC CORPUS — CATÁLOGO DEFINITIVO DE FUENTES REF v1

**Misión:** `H1_REFERENCE_DATASET_CATALOG` · **Fecha:** 2026-10-06 · **HEAD:** `a125a66` · **Estado:** SOLO CATÁLOGO — sin descarga, sin implementación
**Base:** `docs/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` (estrategia C0/C1/C2 aprobada) · `docs/AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md` (arquitectura H0)
**Regla de honestidad:** todas las cifras verificadas el 2026-10-06 en fuentes primarias; las estimaciones de tamaño no verificadas se marcan explícitamente. Nada se descargó.

---

# 0. RESUMEN EJECUTIVO

Catálogo definitivo de la capa REF: **7 fuentes catalogadas + UrbanSound8K formalmente excluido**.

| Prioridad | Fuentes | Rol |
|---|---:|---|
| **ALTA (3)** | FSD50K · ESC-50 · Xeno-canto | pre-entrenamiento columna vertebral · bootstrap cerrado · subclases AVE/INSECTOS (profundidad insustituible) |
| **MEDIA (4)** | SONYC-UST · Speech Commands · BirdCLEF · AudioSet | rol acotado (MOTOR, VOZ/VAD, refuerzo AVE/INSECTOS, ontología/embeddings) |
| **BAJA / EXCLUIDA (1)** | UrbanSound8K | redundante con SONYC-UST (CC BY > CC BY-NC; 18.515 > 8.732; 23/8 > 10 etiquetas) |

**Regla de oro del catálogo:** ninguna fuente transfiere estado a S81; todo consumo es `REF`.

---

# 1. CRITERIO DE PRIORIDAD (operacionalizado)

| Nivel | Definición | Cuándo se ingesta |
|---|---|---|
| **ALTA** | Rol **insustituible** o de núcleo del pipeline (pre-entrenamiento/base del clasificador, bootstrap cerrado, o profundidad de clase rural crítica) sin bloqueante legal firme | H1–H2 del roadmap |
| **MEDIA** | Rol **acotado** a subclase específica, redundante, o con condición previa (decisión de fuente/licencia) | H3 en adelante |
| **BAJA / EXCLUIDA** | Redundante sin ventaja sobre otra fuente ya seleccionada | no se ingesta por defecto |

---

# 2. TABLA DEFINITIVA (respuesta principal)

| # | 1. Dataset | 2. Licencia | 3. Tamaño | 4. Clases útiles (SIGCT-Rural) | 5. Compatibilidad SIGCT-Rural | 6. Riesgos | 7. Prioridad |
|---|---|---|---|---|---|---|---|
| 1 | **FSD50K** (Zenodo 4060432) | dataset **CC-BY** · **por clip** CC0/CC-BY/CC-BY-NC/CC Sampling+ | 51.197 clips · ≈108,3 h (volumen zip del orden de GB, **no verificado** en esta sesión) | `Wind` · `Rain` · `Water` · `Speech` · `Engine`/`Vehicle` (+ `Bird`, `Insect`) | **La mayor del corpus REF**: cobertura 7–8/9 ontológica alineada; **ningún clip es rural** (proxies) | ruido de etiqueta multilabel; `Sampling+`/`NC` por clip → filtro obligatorio; volumen local | **ALTA** |
| 2 | **ESC-50** (GitHub karoldvl) | **CC BY-NC 3.0** (subconjunto **ESC-10: CC BY**) | 2.000 clips · 5 s · 44,1 kHz mono (≈0,9 GB descomprimido, zip menor) | `wind` · `rain` · `water_drops` · `sea_waves` · `pouring_water` · `crickets` · `insects` · `chirping_birds` · `rooster` · `crow` · `engine` | Balance perfecto 40×50, etiqueta de alta calidad, solapamiento 6–7/9 → **smoke test ideal**; `NC` penaliza uso comercial | techo ~40 clips/clase; sin SILENCIO ni VOZ; `NC` global | **ALTA** |
| 3 | **Xeno-canto** (GBIF 10.15468/qv0ksn) | **por grabación** (CC BY · CC BY-SA · CC BY-NC · **CC BY-NC-ND**) · metadatos GBIF CC BY-NC 4.0 | 857.858 ocurrencias (subset GBIF); volumen total enorme (miles de GB si se baja todo → **filtrar**) | **`ave`** (miles de especies) · **`insectos`** (parte de la colección) | **Única fuente con profundidad real** para las 2 clases rurales más valiosas; es bioacústica, no dominio rural | **`ND` prohibido** (excluir); `NC` no comercial; **API tras Anubis** → reproducibilidad media; duración/SNR variable | **ALTA** |
| 4 | **SONYC-UST v2.3** (Zenodo 3966543) | **CC BY 4.0** ✅ (la más permisiva del conjunto) | 18.515 grabaciones · 10 s (por contrato ≈15–20 GB, **no verificado**) | **`motor`** (subtags `engine` · `machinery` · `car`) + `ruido_desconocido` urbano (seeds) | MOTOR con licencia libre y 1.385 anotaciones **verificadas**; **100 % urbano (NYC)**, no rural | rol acotado a 1 clase (+OOD); desbalance multilabel de voluntarios; atribución obligatoria | **MEDIA** |
| 5 | **Speech Commands v2** (TensorFlow, arXiv:1804.03209) | **CC BY 4.0** ✅ | 105.829 utterances · 35 palabras · 1 s · 16 kHz · ~3,8 GB (2,7 GB tar.gz) | **`voz`** (detección de habla/VAD) + silencio/desconocido integrados | VOZ con licencia libre y acceso directo; **inglés monopalabra ≠ español rural** → solo VAD/negatives | rol acotado a VOZ; idioma/registro fuera de dominio; redundable con FSD50K `Speech` | **MEDIA** |
| 6 | **BirdCLEF+ 2026** (Kaggle) | competición **CC BY-NC-SA 4.0** · mirrors **CC0** (por verificar por archivo) | ~33 GB master (207 dirs) · test ~600 soundscapes 1 min/32 kHz | **`ave`** · **`insectos`** (+ anfibios/mamíferos/reptiles, fuera de las 9) | Bioacústica del Pantanal (Neotrópico) → gran alineación con `ave`/`insectos`; **no es dominio rural de SIGCT-Rural** | `NC-SA`: derivados SA; **decisión de fuente pendiente** (competición vs mirror CC0); Kaggle con cuenta; volumen alto (redundante con Xeno-canto) | **MEDIA** |
| 7 | **AudioSet** (Google) — capa C2 | anotaciones **CC BY 4.0** · ontología **CC BY-SA 4.0** · **audio NO distribuido** | 2.084.320 segmentos · 527+ etiquetas (mirror HF ~1,89 TiB) | **ninguna como audio** — ontología completa (verificación de `mid` G-DS-1d) + YAMNet (521 clases) | Alineación **ontológica 9/9**, material 0 → **no es corpus**; sirve de profesor de embeddings sobre C0 | ontología SA → derivados SA; audio YouTube no redistribuible/frágil; sin descarga de audio | **MEDIA** |
| 8 | ~~**UrbanSound8K**~~ (Zenodo 1203745) | **CC BY-NC** | 8.732 clips · ≤4 s · 6,0 GB tar.gz | `engine_idling` → `motor` | MOTOR urbano; **redundante** con SONYC-UST | `NC`; menos volumen y etiquetas que SONYC; sin ventaja | **BAJA / EXCLUIDA** |

---

# 3. FICHAS RESUMEN (respuesta por fuente)

### 3.1 FSD50K — ALTA
Pre-entrenamiento columna vertebral (200 clases ontología AudioSet mejor licencia entre los grandes, descarga Zenodo directa). Se filtra por clip (`Sampling+`/`NC` marcados) y por clases mapeadas. Resultado `REF`.

### 3.2 ESC-50 — ALTA
Bootstrap cerrado del pipeline de features/modelo (balance y etiqueta superiores). `NC` documentado globalmente; ESC-10 libre.

### 3.3 Xeno-canto — ALTA
Profundidad insustituible de `ave`/`insectos`. Exige filtro de licencia (`ND` excluido, `NC` marcado, prioridad CC0/CC-BY/CC-BY-SA). Acceso con Anubis: la adquisición requiere estrategia documentada (GBIF DwC-A + descarga por grabación).

### 3.4 SONYC-UST v2.3 — MEDIA
Cobertura CC BY de `motor` con 1.385 verificadas. Rol acotado: 1 clase + seeds de OOD urbano.

### 3.5 Speech Commands v2 — MEDIA
VOZ/VAD libre (CC BY). Rol acotado: detección de presencia de habla y negatives; no aporta habla rural evaluable.

### 3.6 BirdCLEF+ 2026 — MEDIA
Refuerzo AVE/INSECTOS con sesgo Neotrópico. **Bloqueado hasta decidir fuente** (competición NC-SA vs mirror CC0 verificado). Alternativa: quedarse solo con Xeno-canto.

### 3.7 AudioSet (C2) — MEDIA
Solo ontología + YAMNet. Valor real: cerrar G-DS-1(d) (7 `mid` `UNVERIFIED`) y embeddings de transferencia. Jamás audio de YouTube.

### 3.8 UrbanSound8K — BAJA / EXCLUIDA
Consolidación de la decisión H0: sin justificación superior a SONYC (licencia, volumen, etiquetas). Se archiva como registrada, no se ingesta.

---

# 4. ORDEN DE INGESTA RESULTANTE (derivado de la prioridad)

| Paso | Fuente | Prioridad | Precondición |
|---|---|---|---|
| 1 | ESC-50 | ALTA | ninguna (bootstrap, pequeño) |
| 2 | FSD50K (filtrado) | ALTA | filtro por clip + clases mapeadas |
| 3 | Xeno-canto | ALTA | filtro `ND`/`NC` + estrategia Anubis |
| 4 | SONYC-UST | MEDIA | ninguna |
| 5 | Speech Commands | MEDIA | ninguna |
| 6 | BirdCLEF | MEDIA | **decisión de fuente (Bernardo)** |
| 7 | AudioSet (C2) | MEDIA | ontología (verificar `mid`) + YAMNet |
| — | UrbanSound8K | BAJA | **ninguna (excluida)** |

---

# 5. RIESGOS CONSOLIDADOS DEL CATÁLOGO

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| H1-R1 | Licencia por clip mal gestionada (`Sampling+`, `ND`, `NC-Sampling`) | 🔴 | G-REF-2: `DISTINCT license` por clip; `ND` prohibido; `NC`/`SA` marcados |
| H1-R2 | Descarga descontrolada (Xeno-canto, BirdCLEF, audio de YouTube) | 🔴 | Ingesta por rol y por filtro; AudioSet nunca como audio |
| H1-R3 | Confundir cobertura "ontológica" con material real (AudioSet 9/9 vs 0 clips) | 🔴 | Estado `REF` por capa; card declara 0 bytes |
| H1-R4 | Volumen local (33 GB BirdCLEF; cientos de GB Xeno-canto) | 🟠 | Externalizar a disco local; filtro por clase y por clip |
| H1-R5 | Redundancia de ingesta (FSD50K ⊃ ESC-50 parcial; BirdCLEF ⊃ Xeno-canto) | 🟠 | Prioridad por rol; sin duplicar subsets innecesarios |
| H1-R6 | Reproducibilidad degradada (Anubis, Kaggle) | 🟠 | `provenance` completa + pin de versiones |

---

# 6. TRAZABILIDAD (decisión consolidada)

| Decisión | Estrategia híbrida (2026-10-06) | H0 arquitectura | **Este catálogo (H1)** |
|---|---|---|---|
| C1 fuentes | 6 + C2 | 6 + C2 | **7 catalogadas + UrbanSound8K excluido** |
| Prioridad de ingesta | esbozada (ESC→FSD→SONYC→XC/BC→C2) | orden sugerido | **formalizada con niveles ALTA/MEDIA/BAJA** (§4) |
| UrbanSound8K | excluido | justificado | **consolidado como BAJA/EXCLUIDA** |
| Filtros de licencia | por clip | G-REF-2 | **enumerados por fuente** |

**Pendientes acumulados para Bernardo:** (1) vocabulario `schema.json` (H0); (2) fuente BirdCLEF — AQUÍ se hace explícito que si no se resuelve, **se prescinde de BirdCLEF** y Xeno-canto cubre AVE/INSECTOS; (3) alcance `abejas`/`paisaje rural` (taxonomía).

# 7. NO-ACCIONES CONFIRMADAS

Sin descarga · sin implementación · sin modificación de datasets/v1/ · sin commits ni push. Este catálogo es **tabla y decisión**, no código.