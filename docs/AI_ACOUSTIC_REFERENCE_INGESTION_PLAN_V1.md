# REFERENCE ACOUSTIC CORPUS — PLAN DE INGESTIÓN CONTROLADA (H2) v1

**Misión:** `ACOUSTIC_H2_REFERENCE_INGESTION_PLAN` · **Fecha:** 2026-10-06 · **HEAD:** `a125a66` · **Estado:** SOLO DISEÑO — sin descarga, sin implementación, sin crear carpetas
**Base (canonos heredados):**
- `docs/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` — estrategia C0/C1/C2 aprobada.
- `docs/AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md` — arquitectura H0 (árbol `reference/<source_id>/`, `provenance`, `reference_status`, gates G-REF-1..6, 4 barreras C0/C1).
- `docs/AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md` — catálogo H1 (prioridades ALTA/MEDIA/BAJA, orden de ingesta).

**Restricciones respecias:** **NO** descargar · **NO** implementar · **NO** crear carpetas · **NO** modificar `schema.json` · **NO** modificar gobernanza. Todo este documento es **especificación**: describe *cómo se haría* la ingesta, no la hace.

---

# 0. RESUMEN EJECUTIVO

H2 define el **procedimiento de incorporación** de las fuentes REF a la capa C1/C2, con protocolos de
filtrado (licencia, duración, calidad), mapeo al vocabulario de las 9 clases y un **lote mínimo inicial**.
La ingesta es **por rol y por lote**, nunca masiva sin filtro, y respeta las 4 barreras de no contaminación
de C0 (§9 H0). Nada se ejecuta aquí: este documento es el plano.

| Entregable | Respuesta corta |
|---|---|
| A. Plan H2 | pipeline de 7 pasos por fuente (§2) |
| B. Mapeo dataset → clase | tabla §6 |
| C. Estrategia de ingestión | lotes + orden (§2.8, §7) |
| D. Estrategia de curación | AC-REF 1..8 (sin tocar AC-1..10 de C0) (§5) |
| E. Veredicto | **GO_H2 CONDICIONADO** (§10) |

---

# 1. PRINCIPIOS DE INGESTIÓN CONTROLADA (invariantes heredados)

1. **Aislamiento físico y lógico** de C0: todo material REF vive en `reference/<source_id>/`; jamás escribe en `metadata.csv` de C0 ni en sus `train|validation|test`.
2. **Licencia por clip**, verificada antes de cualquier consumo (G-REF-2). `ND` prohibido; `NC` marcado; `SA` aislado; `CC Sampling+` a decidir o filtrar.
3. **`reference_status` sube por evidencia**: `PLANIFICADO → DESCARGADO → VALIDADO → FILTRADO → INVENTARIADO → CONSUMIBLE`. Cada transición exige checksum/provenance.
4. **Estado honesto:** mientras no haya descarga, todo permanece `PLANIFICADO`.
5. **El plan NO toca el canon:** `schema.json` 1.2.0, `labels.csv`, manifiestos de C0 y gobernanza G-DS-* permanecen intactos. Las extensiones de vocabulario (H0 §10) se citan como *precondiciones* de consumición, no se implementan.
6. **Regla de reporte:** las métricas de cualquier modelo entrenado con REF se consignan como `REF`, nunca como `REAL-LOCAL`.

---

# 2. CÓMO DEBERÍA INCORPORARSE CADA FUENTE (respuestas 1–6)

Pipeline genérico de 7 pasos aplicado a cada fuente (los scripts viven en `reference/<source_id>/ingest/` y
**no se escriben en H2**):

```
1 DESCARGAR   → origen oficial (Zenodo/GitHub/TensorFlow/GBIF-API) + hash del autor
2 VALIDAR     → integridad (checksums), estructura, licencia por clip
3 FILTRAR     → licencia + clase mapeada + duración (§3, §4)
4 NORMALIZAR  → mono 44,1 kHz (remuestreo declarado, honestidad OBS-06) + rechazo de inválidos
5 FEATUREIZAR → mismo esquema `acoustic.feat.window.v2` (22 features → mean/std → 44 dims)
6 INVENTARIAR → manifest_ref.<source_id>.yaml (provenance completa, DISTINCT license, checksums)
7 CONSUMIR    → rol permitido (pretrain/bootstrap/negatives/features); JAMÁS eval C0
```

## 2.1 FSD50K (Zenodo 4060432)
- **Descarga:** artefactos dev (40.966) y eval (10.231) desde Zenodo; verificar huella del autor.
- **Filtro de clase:** subset a los `mid`/display que mapean a `viento`, `lluvia`, `agua`, `insectos`, `ave`(opcional), `voz`, `motor` (tabla §6). Mantener negativos diversos fuera del subset (para pretrain general).
- **Filtro de licencia por clip:** conservar **solo clips `CC0 · CC-BY`** para el lote mínimo (máxima limpieza legal); `CC-BY-NC` **apartado** como sub-carpeta separada marcada NC; `CC Sampling+` -> **excluido del lote mínimo** (decisión pendiente de vocabulario, no se fuerza).
- **Normalización:** clips de 0,3–30 s → downmix mono + resample 44,1 kHz (declarado en `provenance.transformation`); para la versión de features, ventanas de 3,0 s para comparabilidad con el esquema C0.
- **Estado objetivo:** `CONSUMIBLE` (rol pretrain + negatives).

## 2.2 ESC-50 (GitHub karoldvl)
- **Descarga:** clon/tar.gz del repo (2.000 clips, `audio/*.wav` 5 s, 44,1 kHz mono) + `meta/esc50.csv`.
- **Filtro de clase:** subconjuntos de las clases mapeadas (`wind`, `rain`, `water_drops`, `sea_waves`, `pouring_water`, `crickets`, `insects`, `chirping_birds`, `rooster`, `crow`, `engine`) — ≈ 11 de 50 clases.
- **Filtro de licencia:** global `CC BY-NC 3.0`; subconjunto **ESC-10** bajo `CC BY`. Marcar NC en el manifiesto; mantener la nota ESC-10.
- **Normalización:** ya 44,1 kHz mono → **ningún remuestreo** (`resample_method: none` honesto). Duración nativa 5 s.
- **Rol:** bootstrap cerrado de 6 de las 9 clases + smoke test del pipeline features/modelo.
- **Estado objetivo:** `CONSUMIBLE`.

## 2.3 Xeno-canto (GBIF 10.15468/qv0ksn)
- **Descarga (estrategia):** metadatos vía **GBIF DwC-A** (855.000+ ocurrencias, con coordenadas y licencia) para pre-selección; **audio por grabación** vía descarga individual de la colección Xeno-canto (API pública tras **Anubis** → descargas en cuotas con backoff; documentar la estrategia de rate-limit en `provenance`).
- **Filtro de clase:** mapear taxones a **`ave`** y **`insectos`** (y opcional: anfibios → OOD).
- **Filtro de licencia:** **excluir `BY-NC-ND`** (prohibido derivados); aceptar `CC0 · CC-BY · CC-BY-SA · CC-BY-NC` con `NC` marcado.
- **Normalización:** duración muy variable → extraer **ventanas de 3,0 s** de las grabaciones (focal + criterio de SNR); downmix mono + `resample` 44,1 kHz declarado.
- **Rol:** pre-entrenamiento profundo de AVE/INSECTOS + negatives.
- **Estado objetivo:** `CONSUMIBLE` (rol subclase).

## 2.4 SONYC-UST v2.3 (Zenodo 3966543)
- **Descarga:** Zenodo directo (v2.3).
- **Filtro de clase:** usar etiquetas finas `engine` · `machinery` · `car` → **`motor`**; el resto del ruido urbano puede ser **seeds de `ruido_desconocido`** (REF).
- **Filtro de licencia:** `CC BY 4.0` ✅ — atribución obligatoria; sin filtro de restricción.
- **Subconjunto verificado:** priorizar las **1.385 grabaciones verificadas** (etiqueta de doble anotación) como lote de máxima calidad; el resto queda como negativo.
- **Normalización:** 10 s nativos → 3 ventanas de ~3,0 s; downmix mono + resample 44,1 kHz declarado.
- **Rol:** MOTOR + seeds OOD urbano.
- **Estado objetivo:** `CONSUMIBLE`.

## 2.5 Speech Commands v2 (TensorFlow)
- **Descarga:** tar.gz oficial (~2,7 GB) + `validation_list.txt`/`testing_list.txt` para particiones de autor.
- **Filtro de clase:** mapear las 35 palabras → **`voz`** (detección de presencia de habla/VAD); NO usar `_background_noise_` como `silencio` (es ruido de fondo, etiquetar como OOD si se usa).
- **Filtro de licencia:** `CC BY 4.0` ✅.
- **Normalización:** 1 s · 16 kHz mono → `resample` a 44,1 kHz declarado (NO recortar: 1 s < contrato de 3 s es aceptable para su rol VAD).
- **Rol:** VAD + negatives de voz.
- **Estado objetivo:** `CONSUMIBLE`.

## 2.6 BirdCLEF+ 2026 (Kaggle) — CONDICIONADO
- **Bloqueante:** decisión de fuente de Bernardo (competición `CC BY-NC-SA` vs mirror `CC0` verificado por archivo). Sin esa decisión: **no se ingesta** (Xeno-canto cubre AVE/INSECTOS).
- **Si mirror CC0 verificado:** descargar subconjunto de especies mapeadas → `ave`/`insectos`; licencia `CC0` por archivo.
- **Si competición:** solo con aceptación explícita de que los **derivados heredan `CC BY-NC-SA`** y se aíslan de C0; marcar `SA` en el manifiesto.
- **Rol:** refuerzo de AVE/INSECTOS con sesgo Neotrópico; soundscapes de test excluidos de cualquier uso si aplica licencia competición.

---

# 3. FILTROS POR LICENCIA (respuesta 7) — tabla normativa

| Licencia | Permitida | Acción | Dónde se registra |
|---|---|---|---|
| `CC0` | ✅ sí | sin restricción | `manifest license` por clip |
| `CC-BY` | ✅ sí | atribución | igual |
| `CC-BY-SA` | ✅ sí | derivados heredan SA → aislar de C0 | igual + flag `sa_isolated` |
| `CC-BY-NC` | ✅ sí (academia) | **marcado explícito**; prohibido uso comercial | flag `nc` |
| `CC-BY-NC-SA` | ⚠️ condicional (BirdCLEF) | solo si Bernardo acepta SA heredado; aislar | flag `sa` + decisión |
| `CC Sampling+` | ⚠️ a decidir (FSD50K) | **excluido del lote mínimo** hasta decisión de vocabulario | flag `sampling_plus` |
| `CC-BY-NC-ND` | ❌ **prohibido** | descarte inmediato (derivados prohibidos) | — |
| `desconocida / sin licencia` | ❌ **prohibido** | descarte | — |

**Regla invariable (G-DS-5 + G-REF-2):** la licencia se evalúa **por clip**, nunca "por dataset".
`SELECT DISTINCT license` del manifiesto debe ser un subconjunto estricto de la lista cerrada permitida.

---

# 4. FILTROS POR DURACIÓN (respuesta 8)

| Fuente | Duración origen | Tratamiento | Normalización |
|---|---|---|---|
| ESC-50 | 5,0 s | mantener nativa | — |
| FSD50K | 0,3–30 s | incluir clips ≥1 s; ventanizar 3,0 s para features | 44,1 kHz mono |
| Xeno-canto | variable (seg–min) | ventanas de 3,0 s (criterio SNR/focal) | 44,1 kHz mono |
| SONYC-UST | 10 s | 3 ventanas de ~3,0 s | 44,1 kHz mono |
| Speech Commands | 1 s | usar nativo (rol VAD) | resample 44,1 kHz mono |
| BirdCLEF | variable | ventanas de 3,0 s (si se habilita) | 44,1 kHz mono |

**Regla transversal:** la duración de trabajo no es un gate de C0 (los clips REF no entran en `metadata.csv`),
pero la **normalización a mono 44,1 kHz y el remuestreo declarado** son obligatorios si se feature-iza con el
esquema `acoustic.feat.window.v2`, para que métricas REF y C0 sean comparables sin engaños.

---

# 5. FILTROS POR CALIDAD (respuesta 9) — protocolo AC-REF

Adaptación honesta de los AC-1..10 de C0 (no los modifica; define **chequeos propios de REF**):

| AC-REF | Chequeo | Descarte/salida | Hermano de C0 |
|---|---|---|---|
| 1 | `mono` | downmix estéreo declarado | AC-2 |
| 2 | `sample_rate=44100` (o remuestreo declarado) | mark en `provenance` | AC-1 · OBS-06 |
| 3 | bit-depth 16 (o conversión declarada) | mark | AC-4 |
| 4 | no mudo: `max\|x\| ≥ 0.001` | descarte | AC-5 |
| 5 | sin clipping: <1 % saturado | descarte | AC-6 |
| 6 | coherencia espectral: ≥1 pico 20 Hz–20 kHz | descarte | AC-7 |
| 7 | `sha256` único en la fuente | descarte duplicado | AC-8 |
| 8 | licencia por clip presente y válida | descarte | G-DS-5/G-REF-2 |

**Nota:** near-duplicate (AC-9 de C0) NO es obligatorio en REF **dentro de cada fuente** (solo cuando se
crucen features con C0 para evitar cuasi-duplicados entre REF y el corpus propio). El cruce aplica solo a
nivel de features de análisis, nunca a nivel de split.

---

# 6. MAPEO DATASET → CLASE (respuesta 10 — entregable B)

| `class_id` | Fuentes REF que lo alimentan | Clase fuente (́etiqueta real) | Rol |
|---|---|---|---|
| `silencio` | (ninguna) | — | **REAL-LOCAL exclusivo**; no existe proxy fiel; `_background_noise_` de Speech Commands NO es silencio |
| `viento` | FSD50K · ESC-50 | `Wind` · `wind` | pretrain + bootstrap + negatives |
| `lluvia` | FSD50K · ESC-50 | `Rain` · `rain` | pretrain + bootstrap + negatives |
| `agua` | FSD50K · ESC-50 | `Water` · `water_drops`/`sea_waves`/`pouring_water` | pretrain + bootstrap + negatives |
| `insectos` | Xeno-canto · BirdCLEF · ESC-50 | taxones `Insecta` · especies insectos · `crickets`/`insects` | pretrain profundo + negatives |
| `ave` | Xeno-canto · BirdCLEF · ESC-50 | taxones aves · especies aves · `chirping_birds`/`rooster`/`crow` | pretrain profundo + negatives |
| `voz` | Speech Commands · FSD50K | 35 palabras · `Speech` | VAD + negatives (no evalúa habla rural) |
| `motor` | SONYC-UST · FSD50K · (ESC-50 `engine`) | `engine`/`machinery`/`car` · `Engine`/`Vehicle` · `engine` | pretrain MOTOR + negatives |
| `ruido_desconocido` | SONYC-UST · FSD50K (outliers) | ruido urbano multilabel · clases no mapeadas | seeds OOD (bucket, no clase) |

**Regla del mapeo:** el ground truth evaluable de **cada** clase es C0; este mapeo solo define **material de
pre-entrenamiento/negatives/REF**. `silencio` y `ruido_desconocido` (y candidatas `abejas`/`paisaje rural`)
**nunca** se importan como clase desde externo.

---

# 7. LOTE MÍNIMO INICIAL (respuesta 11)

Objetivo: **primer lote `CONSUMIBLE`** para validar el pipeline completo y un pre-entrenamiento `ml-v0-REF`
real, sin comprometer volumen ni licencias.

| Fuente | Lote mínimo | Muestra seleccionada | Licencia objetivo |
|---|---|---:|---|---|
| ESC-50 | **2.000** (completo) | 11 clases mapeadas de las 50 | NC (marcado) / ESC-10 CC BY |
| FSD50K | **≈3.500** | ~500 × 7 clases mapeadas | CC0 · CC-BY únicamente |
| SONYC-UST | **≈2.000** | priorizar las 1.385 verificadas (etiquetas motor) + llenado motor | CC BY 4.0 |
| Speech Commands | **≈1.000** | muestra balanceada de las 35 palabras | CC BY 4.0 |
| Xeno-canto | **≈1.000** | ~500 `ave` + ~500 `insectos`, licencia filtrada | CC0/CC-BY/SA/NC(marcado) |
| BirdCLEF | **0** | — | pendiente decisión fuente |
| AudioSet (C2) | ontología + YAMNet class map | solo tablas/embeddings | CC BY / CC BY-SA |
| **Total** | **≈13.000** clips | — | — |

- **Criterio de aceptación del lote:** 100 % AC-REF 1..8 · 100 % licencia por clip marcada · `reference_status`
  de cada fuente en `CONSUMIBLE` · manifest_ref con `DISTINCT license` correcto.
- **Qué entrega el lote:** un pipeline REF validado de punta a punta y un `ml-v0-REF` honesto (sin decisión
  de S81).

---

# 8. RIESGOS (respuesta 12)

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| H2-R1 | Licencia por clip mal filtrada (`ND`, `Sampling+`, `SA` inadvertido) | 🔴 | lista cerrada + `DISTINCT license` + exclusión por script (G-REF-2) |
| H2-R2 | Contaminación residual de C0 (features near-dup REF↔propio) | 🔴 | 4 barreras (§9 H0) + AC-REF 8; cruce solo en análisis |
| H2-R3 | Normalización inconsistente (SR/duración) invalida features | 🟠 | remuestreo declarado + mono + ventanas 3,0 s (honestidad OBS-06) |
| H2-R4 | Etiqueta ruidosa de la fuente (FSD50K/SONYC voluntarios) degrada calibración | 🟠 | usar subconjuntos verificados/limpios; externo nunca valida |
| H2-R5 | Reproducibilidad (Anubis Xeno-canto, Kaggle BirdCLEF) | 🟠 | GBIF DwC-A + descarga por cuotas documentada; pin de versiones |
| H2-R6 | Volumen alto del lote (BirdCLEF 33 GB descartado hasta decisión) | 🟠 | lote mínimo acotado (§7); filtro por clase antes de descarga |
| H2-R7 | El lote "parece" capacidad S81 | 🔴 | estado REF y 0 bytes declarados; reporting separado (barrezo 4) |

---

# 9. ENTREGABLES (respuestas A–D)

## A. Plan H2
Pipeline de 7 pasos (§2) aplicado por fuente, con **lote mínimo** (§7) y **gates G-REF-1..6** (H0) como
condición de transición a `CONSUMIBLE`. Orden de ejecución (cuando haya misión de descarga):
**ESC-50 → FSD50K (filtrado) → SONYC-UST → Speech Commands → Xeno-canto → (BirdCLEF si decisión) → AudioSet/C2.**

## B. Mapeo dataset → clase
Tabla §6 (9 clases × fuentes REF). Incluye la regla dura de que `silencio`/`ruido_desconocido`/candidatas
futuras son **REAL-LOCAL exclusivo**.

## C. Estrategia de ingestión
- Por rol y por lote (no "bajar todo"); script `ingest/` por fuente.
- Normalización única (44,1 kHz · mono · AC-REF) y featureizado con `acoustic.feat.window.v2`.
- `reference_status` como máquina de estado por fuente; checksums por lote.

## D. Estrategia de curación
- AC-REF 1..8 (§5) — hermanos honestos de AC-1..10, **sin tocarlos**.
- Nada se borra: descartes van a `raw/<source_id>/rejected/` con motivo (regla suprema).
- Licencia correcta por clip antes de `INVENTARIADO`; `CONSUMIBLE` solo con manifest + checksums.

---

# 10. VEREDICTO (entregable E)

> ## GO_H2 — CONDICIONADO ✅
>
> El plan de ingestión controlada es completo, trazable y compatible con el canon. **GO condicionado a:**
>
> 1. **Las 3 decisiones pendientes de H0** (vocabulario `schema.json` · fuente BirdCLEF · alcance
>    `abejas`/`paisaje rural`) — sin ellas, la **ingesta real no arranca** (el plan sí está listo).
> 2. **Aprobación del lote mínimo §7** (~13.000 clips) por Bernardo.
> 3. **Misión explícita de descarga** (esta misión es solo diseño): ninguna fuente se mueve de `PLANIFICADO`
>    hasta una orden de H3-INGESTION_EXECUTION.
>
> El **plano** es `GO`; la **ejecución** queda bloqueada por diseño.

---

# 11. NO-ACCIONES CONFIRMADAS

Sin descarga · sin implementación · sin creación de carpetas (incluido `reference/`) · sin modificación de
`schema.json`/`labels.csv`/manifiestos/gobernanza de C0 · sin entrenamiento · sin tocar CMSC/S30/S81/S82 ·
sin commits ni push.

# 12. Trazabilidad

| Elemento | Estrategia (2026-10-06) | H0 | H1 catálogo | **Este plan (H2)** |
|---|---|---|---|---|
| Fuentes C1 | 6 + C2 | árbol + gobernanza | prioridades + orden | **procedimientos de ingesta (§2)** |
| Filtro licencia | regla | G-REF-2 | por fuente | **tabla normativa de licencias (§3)** |
| Comparabilidad features | esquema v2 | 44 dims | — | **normalización 44,1 kHz mono + AC-REF** |
| No mezcla | regla | 4 barreras | — | **reglas C (ingestión) + D (curación)** |
| Lote inicial | — | — | — | **~13.000 clips (§7)** |