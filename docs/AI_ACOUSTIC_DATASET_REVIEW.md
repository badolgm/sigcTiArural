# AI ACOUSTIC DATASET REVIEW — v1

**Misión:** CMSC_ACOUSTIC_DATASET_AND_MODEL_V1 · **FASE 1 · Benchmark de datasets acústicos públicos**
**Fecha:** 2026-10-02 · **HEAD verificado:** `83b6089` · **Estado:** SOLO DISEÑO — sin descarga, sin entrenamiento
**Objetivo:** decidir con qué corpus (público y/o propio) se puede construir el clasificador acústico S81,
sin romper la regla de honestidad ni inventar capacidades inexistentes.

**Documentos rectores:**
- `docs/AI_ACOUSTIC_FEATURE_MAP.md` — features reales disponibles (22 derivables).
- `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md` — contrato `acoustic.feat.v1`, S81/S82, integración.
- `docs/AI_MODEL_INVENTORY.md` — no existe ningún modelo ni dataset acústico hoy.

**Regla de honestidad aplicada:** este documento **no descarga nada** ni afirma disponer de los datasets.
Reporta licencia, tamaño y acceso tal como se verificaron en fuentes públicas (2026-10-02) y marca
explícitamente lo que es **referencia no verificada**.

---

## 0. Tesis central (leer primero)

> **Ningún dataset público es "el dataset" del CMSC.** Todos son **proxies**: ninguno contiene un corpus
> etiquetado de **entorno rural / agropecuario** con las 9 clases objetivo. Sirven para (a) pre-entrenar
> o (b) cubrir subclases aisladas. El corpus objetivo —el que de verdad mide el desempeño del ecosistema—
> debe **capturarse con el `CMSC_DATA_LOGGER_V1`** (FASE 3) sobre señal real S30.

Consecuencia de gobernanza:
- Los datasets públicos **pueden** alimentar un `ml-v0` (pre-entrenamiento / baseline), pero su resultado
  es `REF` (referencia externa), **no** `REAL-LOCAL` del ecosistema.
- Solo datos **propios, del entorno real y trazables** pueden promocionar S81 a `REAL-LOCAL`.

---

## 1. Criterios de evaluación

| # | Criterio | Peso | Justificación |
|---|---|---:|---|
| C1 | **Licencia** compatible con uso académico/derivados | 25% | Riesgo legal R1 ya identificado (caso GeoGebra). `NC` es tolerable en academia; `ND` bloquea entrenamiento. |
| C2 | **Relevancia** a las 9 clases objetivo | 25% | Sin solapamiento, el dataset no sirve al CMSC. |
| C3 | **Acceso reproducible** (sin login/formulario) | 15% | Descarga desatendida = pipeline reproducible. |
| C4 | **Tamaño manejable** (entorno local/repo) | 10% | Datasets de +50 GB no caben en el flujo actual (fuera de git, pero local). |
| C5 | **Calidad de etiquetado** | 15% | Ruido de etiqueta degrada ECE/calibración. |
| C6 | **Alineación ontológica** (aprovechable por transferencia) | 10% | Reutilizar clases/embeddings (AudioSet/YAMNet) reduce esfuerzo. |

Escala por criterio: **A** (excelente) · **B** (aceptable) · **C** (limitado) · **D** (bloqueante).

---

## 2. Fichas de datasets verificadas (2026-10-02)

### 2.1 ESC-50 — *Environmental Sound Classification*

| Campo | Valor |
|---|---|
| Clips / clases | 2.000 clips (40 × 50 clases), 5 s c/u |
| Licencia | **CC BY-NC 3.0** (subconjunto ESC-10 con licencia propia) |
| Acceso | GitHub `karoldvl/ESC-50` (clon directo, sin login) |
| Categorías | 5 macro (animales, naturales, humanas, domésticas, urbanas) |
| Clases útiles CMSC | `rain`, `sea_waves`, `crackling_fire`, `crickets`, `chirping_birds`, `rooster`, `crow`, `insects`, `wind`, `water_drops`, `pouring_water`, `engine`, `helicopter` |
| Huecos | sin `SILENCIO`, sin `VOZ` conversacional, sin `MOTOR` agrícola |
| Solapamiento 9 clases | **6–7 de 9** (VIENTO, LLUVIA, AGUA, INSECTOS, AVE, MOTOR parcial) |
| Veredicto | **Candidato fuerte de bootstrap**, penalizado por `NC` |

### 2.2 FSD50K

| Campo | Valor |
|---|---|
| Clips / clases | 51.197 clips, **200 clases** (ontología AudioSet), ≈108,3 h |
| Licencia | **Por clip** (mayoría CC), **dataset CC-BY**; verificar por archivo |
| Acceso | Zenodo (descarga directa, sin login) |
| Clases útiles CMSC | `Wind`, `Rain`, `Water`, `Insect`, `Bird`, `Bird vocalization`, `Speech`, `Engine`, `Vehicle` |
| Huecos | etiqueta multilabel débil; sin `SILENCIO`; muy grande |
| Solapamiento 9 clases | **7–8 de 9** (casi todas, con ruido de etiqueta) |
| Veredicto | **Candidato fuerte de pre-entrenamiento** por cobertura + CC-BY |

### 2.3 Xeno-canto / BirdCLEF (2024 · 2025 ESMT)

| Campo | Valor |
|---|---|
| Volumen | 2024: >25.000 grabaciones focales, 182 especies; test 1.073 paisajes sonoros. 2025 ESMT: >38.000 grabaciones etiquetadas, 206 especies; 770 soundscapes fuertemente etiquetados (≈15k cajas), 11.340 sin etiquetar; <50 GB |
| Licencia | **Por grabación** (Xeno-canto: CC BY / BY-SA / BY-NC / **BY-NC-ND**; iNaturalist varia). Competición en Kaggle (reglas propias) |
| Acceso | Xeno-canto API directa (filtrable por licencia); Kaggle requiere cuenta |
| Clases útiles CMSC | **AVE**, **INSECTOS** (clase Insecta), anfibios/mamíferos (fuera de las 9) |
| Huecos | solo bioacústica (focal + soundscape); sin VIENTO/LLUVIA/MOTOR/SILENCIO |
| Solapamiento 9 clases | **2 de 9** (AVE, INSECTOS) pero **profundidad altísima** |
| Veredicto | **Fuente de referencia para AVE/INSECTOS**; exige filtro de licencia (excluir `ND`) |

> **Cautela legal:** `BY-NC-ND` prohíbe obras derivadas → **no entrenar** con esos clips. Hay que filtrar
> la API de Xeno-canto por licencia (`cc-by`, `cc-by-sa`, `cc0`) antes de usar.

### 2.4 AudioSet (+ YAMNet)

| Campo | Valor |
|---|---|
| Segmentos / clases | 2.042.985 segmentos (unbalanced train); 632 clases (527 usadas) |
| Licencia | **Dataset CC BY 4.0**, **ontología CC BY-SA 4.0** |
| Acceso | **No entrega audio** — solo IDs YouTube + etiquetas. La descarga de audio es frágil/ToS-sensible |
| Clases útiles CMSC | ontología completa (mapea casi todas); YAMNet expone 521 |
| Modelo asociado | **YAMNet**: MobileNetV1, 3,7 M pesos, 69,2 M mults/frame de 960 ms; **TFLite disponible** |
| Solapamiento 9 clases | ontológico **9 de 9**, material **0** |
| Veredicto | **Referencia ontológica + profesor de embeddings (YAMNet)**. NO usar como corpus crudo |

### 2.5 SONYC-UST v2.3

| Campo | Valor |
|---|---|
| Grabaciones / clases | 18.515 grabaciones; multilabel 23 finas / 8 gruesas (urbanas); 1.385 verificadas |
| Licencia | **CC BY 4.0** ✅ (la más permisiva del conjunto) |
| Acceso | Zenodo (descarga directa, sin login) |
| Clases útiles CMSC | `engine`, `car`, `machinery` → **MOTOR**, ruido urbano |
| Huecos | 100% urbano (NYC); sin clases naturales ni rurales |
| Solapamiento 9 clases | **1–2 de 9** (MOTOR, RUIDO DESCONOCIDO aproximado) |
| Veredicto | **Activo CC-BY para MOTOR/ruido**, no para el núcleo rural |

### 2.6 UrbanSound8K

| Campo | Valor |
|---|---|
| Clips / clases | 8.732 clips (≤4 s), 10 clases urbanas |
| Licencia | **CC BY-NC 3.0** |
| Acceso | Zenodo (descarga directa) |
| Clases útiles CMSC | `engine_idling` → MOTOR; resto urbano |
| Huecos | sin clases naturales |
| Solapamiento 9 clases | **1 de 9** (MOTOR) |
| Veredicto | Auxiliar menor (MOTOR). Similar a SONYC pero `NC` y menos clases |

### 2.7 Google Speech Commands v2

| Campo | Valor |
|---|---|
| Clips / clases | 105.829 utterances, 35 palabras, 1 s; splits 84.848 / 9.982 / 4.890 |
| Licencia | **CC BY 4.0** ✅ |
| Acceso | Descarga directa (TensorFlow) |
| Clases útiles CMSC | **VOZ** (detección/palabra), útil como VAD fuerte y negativos de voz |
| Huecos | inglés, 1 palabra; no lenguaje natural ni ambiente |
| Solapamiento 9 clases | **1 de 9** (VOZ) |
| Veredicto | **Activo CC-BY para VOZ/VAD**; descargable sin fricción |

### 2.8 Referencias NO verificadas en esta sesión (marcadas para no confundir)

- **TAU Urban Acoustic Scenes 2022 / DCASE Task 1** — escenas urbanas (10 clases), ≈64 h. No verificado hoy.
- **DCASE Task 2 / Anomalous Sound Detection** — útil conceptualmente para S82; no verificado hoy.
- **Freesound / BBC Sound Effects** — agregadores; licencias heterogéneas; no verificados hoy.

> Regla: no incorporar a la decisión lo no verificado. Se listan solo como próximas consultas (FASE 1b).

---

## 3. Matriz comparativa

Puntuación cualitativa por criterio (A=4, B=3, C=2, D=1), suma simple orientativa.

| Dataset | C1 Licencia | C2 Relevancia | C3 Acceso | C4 Tamaño | C5 Etiqueta | C6 Ontología | Σ | Solap. 9 |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **ESC-50** | C | A | A | A | A | B | **21** | 6–7 |
| **FSD50K** | B | A | A | B | B | A | **22** | 7–8 |
| **Xeno-canto / BirdCLEF** | C | B | B | B | A | B | **19** | 2 (profundo) |
| **AudioSet / YAMNet** | A | A | D | D | B | A | **19** | 9 (ontol.) |
| **SONYC-UST** | A | C | A | B | A | B | **20** | 1–2 |
| **UrbanSound8K** | C | C | A | A | B | B | **17** | 1 |
| **Speech Commands v2** | A | C | A | B | A | B | **20** | 1 |

> La suma simple **no decide**: el uso correcto es **combinado por rol** (bootstrap vs pre-entrenamiento
> vs fuente de una subclase). Ver §4.

---

## 4. TOP 3 (recomendación razonada)

### 🥇 1. FSD50K — *columna vertebral de pre-entrenamiento*
- **Por qué:** cobertura 200 clases alineada con la ontología AudioSet, **CC-BY** (la mejor licencia entre
  los grandes), descarga desatendida desde Zenodo, y solapamiento con 7–8 de las 9 clases.
- **Rol propuesto:** pre-entrenamiento de un extractor/embedding y negativos diversos. **No** es target.
- **Riesgo:** ruido de etiqueta multilabel y verificación por-clip. Mitigación: filtrar a las clases mapeadas.
- **Uso honesto:** resultado sobre FSD50K se reporta como `REF`.

### 🥈 2. ESC-50 — *bootstrap limpio y balanceado*
- **Por qué:** 40 clips/clase perfectamente balanceado, etiqueta de alta calidad, descarga en segundos,
  solapamiento directo con VIENTO/LLUVIA/AGUA/INSECTOS/AVE/MOTOR.
- **Rol propuesto:** **primer benchmark cerrado** de 6 clases y *smoke test* del pipeline de features/modelo.
- **Riesgo:** **CC BY-NC 3.0** (uso no comercial) y tamaño pequeño (40/clase → techo de accuracy).
- **Uso honesto:** baseline `REF` con licencia `NC` documentada; no confundir con capacidad propia.

### 🥉 3. Xeno-canto (filtrado) / BirdCLEF — *fuente de AVE e INSECTOS*
- **Por qué:** es la **única fuente con profundidad real** para AVE e INSECTOS, las clases rurales
  más valiosas del CMSC. BirdCLEF+ 2025 incluye Insecta además de aves.
- **Rol propuesto:** corpus de clases AVE/INSECTOS + soundscapes para robustez de dominio.
- **Riesgo:** licencias **por grabación** (excluir `BY-NC-ND`), y Kaggle con cuenta/reglas. Filtro obligatorio.
- **Uso honesto:** documentar licencia de **cada** clip en el manifiesto (`license` por sample).

### Auxiliares (no TOP, pero valiosos por clase)
- **Speech Commands v2** (CC BY) → clase **VOZ** y VAD.
- **SONYC-UST** (CC BY) → clase **MOTOR** / ruido.
- **UrbanSound8K** (CC BY-NC) → apoyo MOTOR (menor).
- **AudioSet/YAMNet** → **ontología** y **profesor de embeddings** (transferencia), no audio crudo.

---

## 5. Qué NO puede resolver ningún dataset público

| Clase CMSC | Cobertura pública | Brecha |
|---|---|---|
| SILENCIO | ❌ inexistente como clase | **propia** (piso de ruido del entorno) |
| VIENTO | ✅ ESC-50 / FSD50K | proxy, no entorno real |
| LLUVIA | ✅ ESC-50 / FSD50K | proxy |
| AGUA | ✅ ESC-50 / FSD50K | proxy |
| INSECTOS | 🟡 BirdCLEF/Xeno-canto (Insecta) | sesgo de especie/región |
| AVE | ✅ BirdCLEF/Xeno-canto | sesgo geográfico (India/Colombia) |
| VOZ | 🟡 Speech Commands (inglés) | idioma/acento ≠ rural |
| MOTOR | ✅ SONYC/UrbanSound8K | motor urbano ≠ maquinaria agrícola |
| RUIDO DESCONOCIDO | ❌ no es clase, es bucket | **propia** (piso OOD) |

> **Conclusión dura:** las 9 clases **no** se cubren con público. A lo sumo se obtiene un `ml-v0` de
> referencia. El dataset objetivo es **propio** (FASE 2/3).

---

## 6. Riesgos de esta fase

| ID | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| DR1 | Usar audio con licencia `ND`/`NC` sin documentar | 🔴 Alta | columna `license` por clip en manifiesto; excluir `ND`; marcar `NC` |
| DR2 | Confundir `REF` (público) con `REAL-LOCAL` (propio) | 🔴 Alta | el estado de S81 solo sube con datos propios validados |
| DR3 | Domain shift enorme (lab/urbano → campo rural) | 🟠 Media | siempre mezclar con datos propios; evaluar por entorno |
| DR4 | Tamaño (FSD50K/BirdCLEF) rompe el flujo local | 🟠 Media | externalizar a `D:\` como el dataset agrícola; no versionar |
| DR5 | AudioSet no entrega audio | 🟡 Baja | usarlo solo como ontología/profesor, no como corpus |
| DR6 | Datasets "marcados no verificados" entran por inercia | 🟡 Baja | FASE 1b de verificación explícita antes de usarlos |

---

## 7. Salida de FASE 1

1. **Decisión propuesta:** construir el dataset del CMSC en **dos capas**:
   - **Capa referencia (`REF`)** = FSD50K (pre-entrenamiento) + ESC-50 (benchmark cerrado) + Xeno-canto
     filtrado (AVE/INSECTOS) + Speech Commands (VOZ) + SONYC (MOTOR).
   - **Capa objetivo (`REAL-LOCAL`)** = `SIGCT_RURAL_ACOUSTIC_DATASET_V1`, capturado con `CMSC_DATA_LOGGER_V1`.
2. **No descargar nada todavía.** La materialización requiere misión explícita de implementación.
3. **Pendiente FASE 1b:** verificar TAU/DCASE Task 2 y agregadores (Freesound). Impacta S82, no S81.
4. Entregable siguiente: **`AI_ACOUSTIC_DATASET_V1_DESIGN.md`** (FASE 2/3), que traduce esta decisión
   en un dataset maestro + logger reproducibles.

> **Invariante:** ningún dataset público convierte a S81 en `REAL-LOCAL`. Solo el corpus propio y su
> validación por entorno lo hacen. Mientras tanto, cualquier clasificador acústico permanece en `REF`/`SIM`.
