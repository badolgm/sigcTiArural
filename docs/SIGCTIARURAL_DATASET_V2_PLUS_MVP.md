# SIGCTiArural — DATASET V2+ MVP · DISEÑO

**Clasificación:** ⚙️ **SOLO DISEÑO · NO CANÓNICO** · MODO DISEÑO
**Documento:** SIGCTIARURAL_DATASET_V2_PLUS_MVP
**Rama:** `feature/ubtn-biological-telemetry` · **HEAD:** `5a079f4`
**Fecha:** 2026-09-22
**Reglas:** SOLO DISEÑO. NO implementar · NO crear código · NO commits · NO modificar documentos canónicos · NO modificar MASTERPLAN · NO modificar DATASET_V2 vigente.
**Base de lectura:** MULTIDATASET_FEASIBILITY_AUDIT · DATASET_V2_PLUS_ACQUISITION_AUDIT · 5 manifests V2 · DATASET_V2_MASTERPLAN · ECOSYSTEM_IDENTITY · CANONICAL_ENGINEERING_REVIEW.
**Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA. Honestidad de estado: valores **[real]** verificados vs **[estimado]** a medir/congelar en EDA.

---

## 0. Contexto del MVP

**Dataset V2 canónico — PERMANECE VIGENTE E INVIOLABLE:**
- PlantVillage · **21.160 imág** · **16 clases** · **3 especies** (tomate 10, papa 3, maíz 3) · split 80/20.
- Rol: baseline científico · warm-up de feature extractor · benchmark reproducible · fuente de laboratorio controlado.

**El Dataset V2+ MVP se diseña como extensión ADITIVA.** Se organiza por **dominios de evaluación**, no como un solo softmax global.

### Fuentes aprobadas para el MVP

| Capa | Fuente | Imágenes [real] | Clases [real] | Especies | Dominio |
|---|---|---|---|---|---|
| 1 | PlantVillage V2 (color) | 21.160 | 16 | 3 (tomate/papa/maíz) | **DOM1 · leaf-lab** |
| 2 | PlantDoc | 2.598 | 27–28 (benchmark Cropped) | hasta 14 taxa hoja | **DOM2 · leaf-field** |
| 2 | FieldPlant (hojas cropeadas C-FP) | 8.629 hojas (5.170 imgs) | 27 | 3 (maíz/cassava/tomate) | **DOM2 · leaf-field** |
| 3 | Coffee JMuBEN + JMuBEN2 | 58.555 | 5 | 1 (café arábica) | **DOM3 · coffee** |
| 4 | CocoaMoniliaDataSet | 1.953 | 4 (h0/m1/m2/m3) | 1 (cacao) | **DOM4 · cocoa** |
| 4 | KaraAgroAI Cocoa | 11.978 | 8 | 1 (cacao) | **DOM4 · cocoa** |

> Nota de dominio DOM2: PlantDoc fue scrapeada de internet a partir de clases PlantVillage → **riesgo alto de duplicados con PlantVillage**; FieldPlant es fotografiada en campo de Camerún. El overlap de especies (tomate/maíz/papa) es precisamente lo que habilita el benchmark de robustez lab→field.

### Excluidas del MVP (documentadas para expansión futura en FEASIBILITY_AUDIT)

NASA Harvest · AgroSabia · IP102 (gate de licencia académica) · Banano (34,3 GB) · Cassava (solo CC0) · Paddy Doctor · Cítricos · Aguacate. Estos dominios NO se diseñan ni se adquieren en el MVP.

---

## 1. Arquitectura del Dataset V2+ MVP

```
                    DATASET V2+ MVP — multi-dataset coordinado
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA DE INGESTA (gates Fase 0 por fuente, secuencial)              │
│  ┌────────────┬─────────────┬──────────────┬──────────────┬────────┐ │
│  │PlantVillage│ PlantDoc    │ FieldPlant   │ JMB/JMB2     │ Cocoa  │ │
│  └────────────┴─────────────┴──────────────┴──────────────┴────────┘ │
│                          ↓ RAW preserves + manifests                │
├──────────────────────────────────────────────────────────────────────┤
│  CAPA DE GOBERNANZA (pipeline, en este orden)                        │
│  1. Manifiestos de proveniencia por fuente                           │
│  2. Deduplicación exacta + perceptual (log preservado)               │
│  3. Normalización de taxonomía a species__condition__source          │
│  4. Anti-fuga global + split por dominio                             │
├──────────────────────────────────────────────────────────────────────┤
│  CAPA DE DOMINIOS (benchmark por dominio, NO un softmax global)      │
│  DOM1 leaf-lab  → PlantVillage V2 (intocable)                        │
│  DOM2 leaf-field→ PlantDoc + FieldPlant                              │
│  DOM3 coffee    → JMuBEN + JMuBEN2                                   │
│  DOM4 cocoa     → CocoaMonilia + KaraAgroAI                          │
├──────────────────────────────────────────────────────────────────────┤
│  CAPA DE BENCHMARK (ver sección 9)                                   │
│  BT1 per-domain · BT2 cross-domain lab→field · BT3 aggregated report │
└──────────────────────────────────────────────────────────────────────┘
```

**Decisiones de arquitectura:**
1. Cada dominio es **una tarea de clasificación propia** con su propio split y métricas.
2. Las especies se mantienen por dominio; **no se cruza especie→especie entre dominios** en una sola cabeza.
3. El esquema `species__condition__source` NO define la dimensión del softmax: define la **clave de trazabilidad** (leak, splits, dedup, manifiestos). El softmax usa `species__condition_detail`.
4. PlantVillage V2 se usa tal cual como base de warm-up y como benchmark de referencia DOM1, **sin ninguna alteración**.

---

## 2. Taxonomía recomendada

Se usa **doble granularidad**:

| Nivel | Formato | Uso |
|---|---|---|
| **Condition (binario)** | `healthy` / `diseased` | Benchmark robusto de salud-enfermedad, desbalance, producto |
| **Condition detail (fino)** | token de enfermedad/peste | Diagnóstico científico y tarea principal por dominio |
| **Clase de entrenamiento** | `species__condition_detail` | Softmax por dominio |

### Ontologías por dominio

- **DOM1 · leaf-lab (V2 inviolable):** 16 clases canónicas de PlantVillage color (tomate 10, papa 3, maíz 3). NO se extiende ni se mapea: se evalúa tal cual.
- **DOM2 · leaf-field:** unificar PlantDoc (crude, sin patólogo) y FieldPlant (patólogo) **sin mezclar archivos entre fuentes**. Especies objetivo del MVP: tomate, maíz, cassava (campo); papel + papa vía V2 para cross-domain. Las classes de PlantDoc en especies fuera del objetivo (apple, blueberry, cherry, grape, orange, peach, pepper, raspberry, soybean, squash, strawberry) entran como taxa healthy/general de campo en el manifiesto CRUDO pero se excluyen del benchmark MVP fino.
- **DOM3 · coffee:** 5 clases JMuBEN/JMuBEN2 → `coffee_arabica__{healthy|cercospora|rust|phoma|miner}`.
- **DOM4 · cocoa:** fusionar CocoaMonilia (4: h0/m1/m2/m3 = healthy + 3 etapas monilia) y KaraAgroAI (8: cssvd leaf/pod/stem, anthracnose leaf/pod, healthy leaf/pod) → clases finas: `theobroma_cacao__{healthy|cssvd|anthracnose|monilia_m1|monilia_m2|monilia_m3}`. `anatomical_part` (leaf/pod/stem) como **metadato**, no clase.

Regla de healthy: **una sola clase healthy por especie** (healthy unificado; la anatomía va en metadato).

---

## 3. Esquema `species__condition__source`

**Identificador de trazabilidad global** (no clase de softmax):

```
{species}__{condition}__{source}
```

- `species`: token canónico (p. ej. `coffee_arabica`, `theobroma_cacao`, `tomato`, `corn`, `potato`, `cassava`).
- `condition`: `healthy` o `diseased` (privilegia sintoma primario; si hay etapa, se añade `__detail` opcional, p. ej. `diseased__monilia_m1`).
- `source`: dataset origen + versión, p. ej. `plantvillage_v2`, `plantdoc_cropped_v1`, `fieldplant_cropped_v1`, `jmuben_v1`, `cocoa_monilia_v1`, `karaagroai_v1`.

**Ejemplos reales:**
```
tomato__diseased__bacterial_spot__plantvillage_v2
tomato__diseased__early_blight__plantdoc_cropped_v1
corn__diseased__common_rust__fieldplant_cropped_v1
cassava__diseased__bacterial_blight__fieldplant_cropped_v1
coffee_arabica__diseased__leaf_rust__jmuben_v1
theobroma_cacao__diseased__monilia_m2__cocoa_monilia_v1
theobroma_cacao__healthy__karaagroai_v1
```

Cada fila del índice global lleva además: `split`, `subset`, `checksum_md5`, `width×height`, `license` derivada, `doi`. **El esquema es el contrato del manifiesto, no la etiqueta.**

---

## 4. Política de proveniencia

1. **Manifiesto por fuente** (extensión del patrón de 5 manifests V2): campos obligatorios: source_id, URL/DOI, versión, licencia, fecha adquisición, nº imágenes RAW, checksum del paquete (SHA256), clases declaradas, persona/responsable, comandos de descarga reproducibles, estados de imagen descartada (con motivo).
2. **Índice de proveniencia global** (CSV/parquet): 1 fila por imagen, siempre con el `species__condition__source` completo.
3. **RAW preserve:** lo descargado jamás se borra; las versiones curadas se generan por transformación versionada desde el RAW (BOLETO = raw → curate). NADA DESAPARECE.
4. **Licencia por fuente derivada:** la atribución agrega licencia de cada origen; Kokog no la reemplaza (regla ya usada en el unified de cocoa).
5. Todos los artefactos de decisión (logs de dedup, maps de especies, conteos) se archivan en el subtree de gobernanza, sin borrado posterior.

---

## 5. Política anti-fuga global

**Regla dura: ninguna imagen —ni perceptualmente casi-idéntica— debe existir a la vez en train y en test dentro del pool multi-fuente.**

1. Por cada imagen se computa un **fingerprint perceptual** (pHash 64-bit; umbral Hamming ≤ 10 = candidato duplicado/near-duplicado).
2. La comparación es **cross-source global**: PlantDoc↔PlantVillage (riesgo histórico por scrapeo), PlantDoc↔FieldPlant, JMuBEN↔JMuBEN2 (mismo dominio), CocoaMonilia↔KaraAgroAI.
3. Los pares near-duplicate se registran (log preservado) y se resuelve antes de split: mantener la imagen con mejor calidad/patólogo (prioridad: FieldPlant patólogo > CocoaMonilia/KaraAgro > PlantDoc > lab).
4. **Split a nivel de imagen-fuente, no de hoja:** las 8.629 hojas de FieldPlant provienen de 5.170 imgs; todas las hojas de una misma imagen van al mismo split (evita que hojas de la misma foto estén en train y test).
5. Toda extracción de características usada en benchmark (warm-up) se calcula sobre imágenes del split de entrenamiento tras dedup; nunca sobre test.

---

## 6. Política de deduplicación

| Nivel | Método | Alcance | Decisión |
|---|---|---|---|
| Exacto | MD5/SHA256 de bytes | intra e inter fuente | mantiene 1 del lote idéntico |
| Perceptual A | pHash 64-bit Hamming ≤ 10 | global cross-source | mantiene imagen de mayor proveniencia |
| Perceptual B (opcional) | embeddings de red preentrenada coseno ≥ 0,95 | verificación fina | registro manual/log |

Reglas:
- La dedup **solo elimina del CURATE**; el RAW preserve siempre (NADA DESAPARECE).
- El log de dedup es un artefacto de gobernanza versionado (quién/como/cuándo de cada eliminación).
- PlantDoc↔PlantVillage es el caso crítico: se esperan solapados por el método de scrapeo; el fingerprint global los captura antes de cualquier split.

---

## 7. Estrategia de labels

1. **Etiquetado en dos niveles**: `condition` (healthy/diseased) automáticamente derivado y `condition_detail` (clase fina) consolidadas por dominio.
2. **Unificación de sinónimos**: monilia stages (m1/m2/m3 de CocoaMonilia) → clases finas separadas `monilia_mX`, con `condition=diseased` en todas. Anthracnose/CSSVD de KaraAgro → clases finas separadas; anatomía (leaf/pod/stem) en metadato.
3. **Healthy unificado por especie** (una sola clase healthy; anatomía como metadato).
4. **Sin synth**: JMuBEN ya viene aumentado (58.555 totales incluye augmentation). Se documenta `augmented=true/false` por fila; el split estratifica por fuente y por augmented (evita fuga por el mismo original aumentado en train y test).
5. **Labels filoso**: nunca anotar a partir del filename de PlantVillage; la etiqueta canónica la fija el manifiesto (class index), no el nombre de archivo original.
6. **Clases raras/manipulación de desbalance**: políticas ya definidas para V2 (weighted loss, class-balanced sampling, minority-augmented) se reutilizan por dominio.

---

## 8. Estrategia de split

Por dominio, estratificado y en orden estricto: **dedup global → map de clases → split → warm-up → benchmark**.

- **DOM1**: split oficial V2 80/20 (intocable).
- **DOM2**: split por imagen-fuente (all hoja de una imagen juntas); estratificado por `species__condition_detail` y por fuente (PlantDoc y FieldPlant NO se mezclan en el mismo split: cada fuente aporta su partición; el cross-domain usa fuente como eje).
- **DOM3**: estratificado por fuente (JMuBEN vs JMuBEN2) y por augmented; retiene validación separada por clase.
- **DOM4**: estratificado por fuente (CocoaMonilia vs KaraAgro) y por clase fina; healthy repartido como la literatura (≈70/15/15).
- Proporción objetivo por dominio: train/val/test 80/10/10 con piso de muestra en test por clase (mín ≥ 20 [estimado], a fijar en EDA).

---

## 9. Estrategia de benchmark — respuesta A vs B

### RESPUESTA: **A · Benchmark por dominio** (primario)

**(por equilibrio de confusión B: benchmark único AGREGADO de reporte, no un softmax global).**

**Se adopta la opción A** con justificación científica:

1. **No hay discriminación compartida entre especies.** Un softmax global de 50+ clases de especies heterogéneas (tomate/café/cacao) hace que las clases minoritarias se hunda; la frontera aprendida es un artefacto de fuente (laboratorio vs campo vs fondo), no de enfermedad.
2. **Distribución por dominio ≠ distribución global.** Lab (fondo uniforme, 1 hoja) y campo (multi-hoja, fondo complejo) son distribuciones distintas; el benchmark único mezcla las dos sin poder atribuir la métrica a ninguna. La degradación lab→field está documentada (PlantDoc/FieldPlant: modelos entrenados en lab caen en campo). Un solo número los enmascara.
3. **Robustez es el objetivo real.** El test que mide valor (¿entrenar en lab + field mejora campo?) se define por eje de fuente/dominio, no por mezcla. Separar dominios permite responder train-lab→eval-field.
4. **Comparabilidad con literatura.** Cada fuente publica su benchmark; evaluar por dominio permite comparar contra FieldPlant, PlantDoc, JMuBEN, CocoaMonilia y KaraAgroAI. Un número global mezclado no es comparable con nada.
5. **Riesgo de leakage en global.** Si PlantVillage (lab) y PlantDoc (scrape de las mismas clases) se fusionan y hay duplicados no detectados, el benchmark "global" mide leakage, no generalización.
6. **Operación del producto.** SIGCTiArural diagnostica por cultivo: el usuario pregunta "¿hoja de café sana/enferma?" — el sistema por dominio coincide con el caso de uso real.

**Casos de uso B (rechazado como modelo de entrenamiento, aceptado solo como reporte):** un **índice agregado** (macro-promedio de macro-F1 por dominio o balanced accuracy) sirve para dashboard de estado del dataset y para comparar versiones del multi-dataset. NUNCA como softmax de clasificación único sobre el pool mezclado.

**Protocolo de benchmark:**
- **BT1 · per-domain:** por dominio → macro-F1, balanced accuracy, ECE (calibración), AUROC multiclase (one-vs-rest). Clases saludables reportadas por separado.
- **BT2 · cross-domain lab→field:** warm-up V2 → fine-tune en field (tomate/maíz/papa) → eval en FieldPlant/PlantDoc. Reporta ganancia vs PlantVillage-only. Es **el benchmark que valida el MVP**.
- **BT3 · aggregated report:** tabla única con métricas por dominio + índice agregado (para gobernanza), sin mezclar softmax.
- Métricas siempre a nivel **macro** (no micro) para no ocultar clases raras; ECE para confianza (usada por telemetría).

---

## 10. Roadmap MVP

| Hito | Contenido | Estado |
|---|---|---|
| M0 | Auditorías de viabilidad y adquisición (2 docs) | ✅ hecho |
| M1 | Diseño MVP (este documento) | ✅ hecho (a validar por gobernanza) |
| M2 | Adquisición por fuente (gates Fase 0 secuenciales): V2→PlantDoc→FieldPlant→JMuBEN→Cocoa | 🔴 pendiente |
| M3 | Ingesta + manifiestos de proveniencia por fuente | 🔴 |
| M4 | Dedup global (exacta + pHash) + log | 🔴 |
| M5 | Normalización taxonómica + esquema species__condition__source + split | 🔴 |
| M6 | Warm-up V2 + BT1 (per-domain) + BT2 (lab→field) + BT3 report | 🔴 |
| M7 | Revisión de gobernanza → decisión de expansión (COIN untuk Capa 2–4 restantes) | 🔴 |

Sin commits y sin implementación hasta orden explícita.

---

## RESULTADO FINAL

### 1. ¿Cuál es el Dataset V2+ MVP exacto?

Un **multi-dataset coordinado de 4 dominios de evaluación**, aditivo al V2 inviolable:
- **DOM1 · leaf-lab:** PlantVillage V2 (21.160 imág, 16 cl, 3 sp) — intocable, base y warm-up.
- **DOM2 · leaf-field:** PlantDoc (2.598 imág) + FieldPlant hojas cropeadas (8.629 hojas → ~27 cl, maíz/cassava/tomate). Proporciona el benchmark lab→field.
- **DOM3 · coffee:** JMuBEN + JMuBEN2 (58.555, 5 cl, café arábica).
- **DOM4 · cocoa:** CocoaMonilia (1.953, 4 cl) + KaraAgroAI (11.978, 8 cl) → fusionadas en 6 clases finas de cacao.
**Capa de expansión futura excluida:** NASA Harvest, AgroSabia, IP102, Banano, Cassava, Paddy Doctor, Cítricos, Aguacate.

### 2. ¿Cuántas clases tendría?

**~54 clases finas consolidadas [estimado]** (`species__condition_detail`):
- DOM1: 16 (V2 intocable) · DOM2: ~27 tras unificar FieldPlant+PlantDoc en especies objetivo (tomate/maíz/papa/cassava) · DOM3: 5 café · DOM4: 6 cacao (healthy, cssvd, anthracnose, monilia_m1/m2/m3).
Rango honesto 50–60; **se congela tras EDA** (M4–M5), no antes.

### 3. ¿Cuántas especies tendría?

**6 especies objetivo del MVP [real]:**
1. tomato (rashV2 + PlantDoc + FieldPlant) · 2. potato (V2 + PlantDoc) · 3. corn (V2 + PlantDoc + FieldPlant) · 4. cassava (FieldPlant) · 5. coffee_arabica (JMuBEN) · 6. theobroma_cacao (CocoaMonilia + KaraAgroAI).
*(Los taxa extra de PlantDoc — manzana/citrus/berry/etc — se documentan en RAW como healthy de campo, sin entrar al benchmark MVP.)*

### 4. ¿Cuál sería el volumen aproximado de imágenes?

**~104.900 imág crudas [real por conteos]: 21.160 + 2.598 + 8.629 + 58.555 + 1.953 + 11.978 ≈ 104.873.**
Post-dedup esperado ≈ 100.500–103.000 [estimado] (por solapados PlantDoc↔PlantVillage y JMuBEN augmented). Peso curado a 224×224 ≈ **8–12 GB [estimado]**.

### 5. ¿Cuál sería el primer benchmark realista para SIGCTiArural?

**BT2 · Robustez Cross-Domain Lab→Field** — warm-up con PlantVillage V2 sobre las firmas de las 4 especies compartidas y evaluación field en FieldPlant/PlantDoc (macro-F1 + ECE), acompañado de BT1 (per-domain con coffee y cocoa) como paridad. Es el benchmark correcto porque mide la tesis del MVP: **¿entrenar con datos de campo real mejora la detección en campo frente a solo PlantVillage lab?**

### 6. ¿Qué precisión de campo podría esperarse respecto a usar solamente PlantVillage?

**[Estimado fundamentado en literatura, no experimental.]**
- Modelo **solo PlantVillage (lab)** evaluado en imágenes de campo real: **precisión típica muy baja, del orden de 30–45%** — la brecha lab→field es el hecho conocido de PlantDoc (incremento de hasta +31% al añadir datos de campo) y FieldPlant (que supera a PlantDoc gracias a patólogo).
- Modelo **MVP (warm-up V2 + fine-tune field):** **60–90%** de precisión de campo en especies compartidas según clase y desbalance, con mejora esperada de **+25 a +45 puntos absolutos** en tomate/maíz/papa/cassava.
- Conclusión honesta: el MVP **no garantiza un %:** garantiza un **path de medición real** (BT2) donde PlantVillage-only se degrada y el MVP demuestra su tesis de robustez de campo. El número exacto debe salir de la primera ejecución, no del diseño.

---

*Diseño SOLO DISEÑO·NO CANÓNICO. No modifica MASTERPLAN, DATASET_V2, manifiestos ni documentación canónica. Sin commits. Clases/especies/imág/benchmark estimados se congelan en EDA (M4–M5). Próximo paso: validación de gobernanza del diseño MVP y orden de adquisición M2.*