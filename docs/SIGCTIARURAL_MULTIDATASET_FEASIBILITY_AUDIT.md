# SIGCTiArural — MULTIDATASET FEASIBILITY AUDIT (provisional)

**Clasificación:** ⚠️ **NO CANÓNICO** · SOLO INVESTIGACIÓN
**Documento:** SIGCTIARURAL_MULTIDATASET_FEASIBILITY_AUDIT
**Fecha:** 2026-09-22 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `86d545e`
**Tipo:** Auditoría de viabilidad de la arquitectura **Dataset Base MVP multicapa** (Capa 1–4) como evolución ADITIVA del Dataset V2 canónico (PlantVillage 21.160/16/3), que **permanece vigente como baseline**.
**Base de lectura:** READINESS_REPORT · PHASE0_EXECUTION_GUIDE · PHASE0_READYCHECK · PHASE0_EXECUTION_CHECKLIST · 5 manifests V2. Investigación web (10 consultas, 2026).
**Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA. Honestidad de estado. NO se modifica MASTERPLAN, ni DATASET_V2 vigente, ni ninguna doc canónica.

---

## 0. Alcance y estatus

**Qué es:** investigación de factibilidad de fuentes externas para el Dataset Base MVP. NO es diseño canónico de Dataset V2+: es el insumo técnico previo que un diseño formal debe consumir.

**Qué NO es:** no reemplaza a DATASET_V2 (21.160/16/3), no modifica MASTERPLAN, no añade capas al gobernanza existente, no sustituye el plan de Fase 0 ya diseñado.

**Modelo multicapa en evaluación (propuesta de Bernardo, a validar por gobernanza):**
- **Capa 1:** PlantVillage — baseline controlado (ya diseñado V2).
- **Capa 2:** Datasets agrícolas tropicales complementarios — Café, Cacao, Banano, Cítricos, Aguacate, Plagas.
- **Capa 3:** Datasets de campo real — PlantDoc, FieldPlant, Cassava, Paddy Doctor.
- **Capa 4:** Telemetría y predicción — NASA Harvest, AgroSabia, IoT, Soil Moisture.

**Veredicto general:** **VIABLE y aditiva**. Las fuentes existen, son abiertas y mayormente CC BY 4.0. Riesgos reales: unificación taxonómica mal hecha, volúmenes pesados (banano 34.3 GB, cacao Perú 25 GB), licencia NC en PennyState Cassava original.

---

## 1. Fuentes validadas (disponibilidad confirmada 2026-09-22)

| # | Fuente | Capa | Disponibilidad verificada | Modalidad | Imágenes/datos |
|---|---|---|---|---|---|
| 1 | **PlantVillage** | 1 | Kaggle `abdallahalidev/plantvillage-dataset` · GitHub spMohanty | hojas lab | 21.160 en scope V2 (54.309 total) |
| 2 | **PlantDoc** | 3 | GitHub `pratikkayal/PlantDoc-Dataset` · Roboflow · HF | hojas campo (web) | 2.598 / 2.578 · 28 clases · 13 especies |
| 3 | **FieldPlant** | 3 | Roboflow `plant-disease-detection/fieldplant` | hojas campo Camerún | 5.170 · 8.629 hojas · 27 clases (maíz/cassava/tomate) |
| 4 | **Cassava** | 3 | Kaggle comp 2020 · PennState (NC) | hojas campo Uganda | 21.367 (2020) · 5 clases |
| 5 | **Paddy Doctor** | 3 | Kaggle · IEEE DataPort | hojas arroz campo India | 16.225 · 13 cl · subset Kaggle 10.407 / 10 cl |
| 6 | **Coffee JMuBEN/JMuBEN2** | 2 | Mendeley (Kenya, patólogo) | hojas café campo | 58.555 · 5 cl |
| 7 | **Coffee RoCoLe** | 2 | Mendeley (Ecuador) | hojas café campo | 1.560 · 2 cl + segmentación |
| 8 | **Coffee BRACOL** | 2 | Mendeley (Brasil) | hojas café | 1.747 · 5 estrés |
| 9 | **Coffee DECAFIA (Colombia)** | 2 | Zenodo `10.5281/zenodo.19931904` | hojas café Santander (YOLO) | 2.786 · 15.181 inst · 4 cl |
| 10 | **Cacao KaraAgroAI** | 2 | Kaggle/KaraAgro (Ghana) | hoja/vaina/tallo | 11.978 · 8 cl |
| 11 | **Cacao unificado (Kaggle)** | 2 | Kaggle `cocoa-disease-unified` (6 fuentes dedup) | mixto | 9 cl |
| 12 | **Cacao Perú** | 2 | IEEE DataPort | vainas | 3.104 · 5 cl · ⚠️ 25 GB |
| 13 | **Cacao CocoaMoniliaDataSet** | 2 | Zenodo (Colombia) | vainas Monilia 4 etapas | 1.953 · ~6.2 GB |
| 14 | **Cacao CocoaSwolSet** | 2 | Mendeley (Côte d'Ivoire) | hoja/vaina/tallo CSSV | ~1.500–2.500 |
| 15 | **Banano Tanzania** | 2 | Zenodo | hoja/tallo | 11.767 (subconjunto) · 16.092 (mayor) · ⚠️ 34.3 GB total |
| 16 | **Cítricos CitrusUAT** | 2 | Zenodo `10.5281/zenodo.8294078` | hojas naranjo (qPCR HLB) | 953 · 12 cl |
| 17 | **Cítricos (Pakistán)** | 2 | Mendeley | hojas/frutos | ~558 |
| 18 | **Aguacate K-Kotagiri** | 2 | Mendeley | hojas | 435 · 2 cl |
| 19 | **Aguacate AvocadoPest3 (Mx)** | 2 | Mendeley | hojas 3 plagas × 3 severidad | 1.932→2.033→4.871 aug · 9 cl |
| 20 | **Aguacate Etiopía** | 2 | repositorio (CC BY) | hojas | 3.000 · 5 cl |
| 21 | **NASA Harvest / CropHarvest** | 4 | GitHub `nasaharvest/cropharvest` · harvestportal.org (86 datasets) | geo/sat/tabular | 95.186 puntos · Sentinel/SRTM/ERA5 |
| 22 | **AgroSabia** | 4 | datos.gov.co (foliar `bdgn-vc4f`, suelos `ch4u-f3i5`, EVA) · GitHub AgRSCol | tabular/geo | nacional |

---

## 2. Licencias (compatibilidad de uso)

| Fuente | Licencia | Uso comercial | Riesgo legal |
|---|---|---|---|
| PlantVillage | CC BY 4.0 | ✅ | — |
| PlantDoc (+ cifn ccange HF) | CC BY 4.0 | ✅ | — |
| FieldPlant | CC (BY, verificar al bajar) | ✅ | atribución Roboflow |
| Cassava **Kaggle 2020** | CC0 (dominio público vía Kaggle) | ✅ | — |
| Cassava **PennState original** | **CC BY-NC-SA 4.0** | ❌ NO comercial | 🔴 si se mezcla con producción |
| Paddy Doctor | ✓ Kaggle/DataPort | ✅ | atribución |
| Coffee JMuBEN | ✓ pública Mendeley | ✅ | atribución |
| Coffee RoCoLe | ✓ (re-distribuida CC BY 4.0 en DECAFIA) | ✅ | — |
| Coffee DECAFIA | **CC BY 4.0** | ✅ | ko fuente secundaria RoCoLe/Silva re-anotadas BY |
| Cacao KaraAgroAI | ✓ abierta | ✅ | — |
| Cacao unificado | ✓ Kaggle (mixto según fuente origen) | ✅ | dedup documentada |
| Cacao Perú | ✓ IEEE DataPort | ✅ | — |
| Cacao CocoaMonilia | ✓ | ✅ | — |
| Banano Tanzania | Libre (Zenodo) | ✅ | — |
| CitrusUAT | ✓ Zenodo | ✅ | — |
| Aguacate Mendeley | CC BY 4.0 | ✅ | — |
| NASA Harvest / CropHarvest | Abierta con atribución | ✅ | términos por dataset |
| AgroSabia | Abierta (datos.gov.co) | ✅ | — |

**Regla de oro de licencias (para el diseño):** incluir siempre el archivado y atribución por fuente derivada. **Excepción crítica:** PennState Cassava `CC BY-NC-SA` NO se mezcla con datasets de uso comercial; se usa solo la variante Kaggle CC0.

---

## 3. Volúmenes y almacenamiento

| Rubro | Estimado |
|---|---|
| PlantVillage scope V2 (RAW) | 1.5–2.5 GB |
| PlantDoc | ~0.2 GB (imgs) / 0.9 GB (anotaciones Roboflow) |
| FieldPlant | ~1.5–2 GB (Roboflow) |
| Cassava 2020 | ~5.7–13 GB (imágenes 512×512) |
| Paddy Doctor subset Kaggle | ~2–4 GB |
| Coffee JMuBEN | ~gigable (58 k imágenes 128×128; ~1–2 GB) |
| Coffee DECAFIA | ~0.6 GB |
| Cacao unificado | ~1.5–3 GB |
| ⚠️ Banano Tanzania total | **34.3 GB** (resize/subset obligado) |
| ⚠️ Cacao Perú | **25 GB** (PNG, subset obligado) |
| CropHarvest | pequeños (geoJSON + h5py factible) |

**Conclusión de almacenamiento:** un **Dataset MVP** entrenable (subset por dominio, resize 224×224, curate por fuente) cabe en **10–20 GB**. El "completo" sin downsample puede superar los 100 GB — inviable en ASUS actual sin subset. Recomendación: **solo subsets curados entran al pipeline**; el RAW completo por fuente solo cuando el almacenamiento lo justifique.

---

## 4. Riesgos de la arquitectura multicapa

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Unificación en un único softmax gigante (40+ clases, especies heterogéneas) | 🔴 | **Dividir por dominio + benchmark por fuente** (ver §5–§6) |
| Fuga de datos cross-source (duplicados entre PlantVillage/PlantDoc/FieldPlant) | 🔴 | pHash global + dedup entre fuentes antes de split |
| Licencia NC en Cassava PennState | 🔴 | usar solo variante Kaggle CC0; NC nunca a producción |
| Imágenes en alta resolución (banano 3480², cacao PNG) | 🟠 | pipeline obligatorio de resize/subset |
| Benchmark débil en PlantDoc (test pequeño, CI anchas) | 🟠 | agregar robustez por dominio, no métricas per-class únicas |
| Desbalance severo (minorías café/cacao/aguacate) | 🟠 | políticas ya definidas (weighted loss, class-balanced, minority-augmented) |
| Campos no homogéneos de anotación (etapas vs binario) | 🟠 | esquema global con `condition` binaria + metadato `stage` separado |
| CropHarvest/AgroSabia mezclados con visión | 🟠 | **Capa 4 separada**, pipeline distinto (time-series/geo) |
| Descarga gigante aborta a mitad | 🟠 | descarga por fuente con retorno GATE 5 (lección Fase 0) |
| NASA Harvest sin dataset enumerable único | 🟡 | elegir artefactos concretos (crop type maps, CropHarvest) |

---

## 5. Estrategia multicapa (integración recomendada)

**Principio rector:** **NUNCA un softmax único para todo.** Las especies no comparten discriminación visual entre dominios; mezclarlas en una sola cabeza degrada a las minorías.

**Arquitectura de evaluación recomendada:**

```
Dataset Base MVP
├── DOM1 · leaf-lab     → PlantVillage (16 cl, 3 especies)        [baseline V2, controlado]
├── DOM2 · leaf-field   → PlantDoc + FieldPlant (+ Cassava 2020)   [robustez de campo]
├── DOM3 · coffee       → JMuBEN + RoCoLe + DECAFIA + BRACOL       [dominio tropical]
├── DOM4 · cocoa        → KaraAgroAI + unificado Kaggle + CocoaSwolSet
├── DOM5 · citrus       → CitrusUAT (+ Pakistán)
├── DOM6 · banana       → Zenodo Tanzania (subset)
├── DOM7 · avocado      → AvocadoPest3 + K-Kotagiri
└── CAPA4 · geo/telemetry → CropHarvest + AgroSabia (separado, no visión)
```

Cada dominio: **esquema global `species__condition__source`**, split por fuente con anti-fuga global (pHash + dedup exactos), benchmark independiente (macro-F1/ECE) **y un benchmark cross-domain** (train lab → eval field) que es el que mide robustez real (replicando la lección de PlantDoc: 15–31% de mejora con datos de campo).

---

## 6. Taxonomía recomendada (borrador NO canónico)

**Formato global de etiqueta (cada imagen):**
```
species__condition__source
```
- `species`: identidad botánica en el vocabulario canónico (coffee_arabica, cosacao, banana_grp, citrus_sinensis, avocado, cassava, paddy/rice, tomato, potato, corn).
- `condition`: **binario normalizado** (healthy / diseased) + campos separados `condition_detail` (patógeno/etapa si aplica, p. ej. monilia_stage_m1) y `severity` (baja/media/alta si la fuente lo declara).
- `source`: dataset de origen + versión + DOI (trazabilidad absoluta).

**Mapeo por fuente (ejemplos clave):**

| Fuente | → `species` | `condition` | `condition_detail` (conservar) |
|---|---|---|---|
| PlantVillage | tomato/potato/corn | healthy/diseased | 16 clases canónicas V2 |
| PlantDoc | 13 spp | healthy/diseased | 27–28 clases (rutilar ruido en spider-mites orphan) |
| FieldPlant | corn/cassava/tomato | healthy/diseased | 27 cl |
| Cassava | cassava | healthy/diseased | CBB/CBSD/CGM/CMD |
| Paddy | paddy | healthy/diseased | 12 enfermedades |
| Coffee | coffee_arabica | healthy/diseased | Cercospora/Rust/Phoma/Miner (+deficiencias) |
| Cocoa | cocoa | healthy/diseased | CSSVD/Monilia/Phytophthora/Witches/broom/Anthracnose/mirid/pod_borer |
| Citrus | citrus_sinensis | healthy/diseased | HLB/canker/otras (12 cl) |
| Banana | banana | healthy/diseased | Sigatóka Negra/Fusarium TR4 |
| Avocado | avocado | healthy/diseased | 3 plagas × severidad (Oligonychus/Garcaria etc.) |

**Regla:** la taxonomía canónica V2 (16 cl PlantVillage) NO se modifica; se **extiende** con sub-ontologías por dominio bajo un esquema padre `species__condition__source`.

---

## 7. Plan de adquisición por fases (prioridad recomendada)

| Fase | Dominio | Fuentes | Volumen curado | Priority |
|---|---|---|---|---|
| P1 | leaf-field | PlantDoc + FieldPlant | ~5–6 GB | 🔴 alta (robustez real, especies solapan V2) |
| P2 | coffee | JMuBEN + DECAFIA (Col) + RoCoLe | ~3–5 GB | alto (tropical, Col. propio con DECAFIA) |
| P3 | cocoa | KaraAgro + unificado Kaggle + CocoaSwolSet | ~3–5 GB | alto |
| P4 | paddy | Paddy Doctor | ~2–4 GB | medio |
| P5 | cassava | Kaggle 2020 (CC0) | ~6–13 GB subset | medio |
| P6 | citrus | CitrusUAT | <1 GB | medio |
| P7 | banana | Zenodo Tanzania (subset fijo) | ~3–5 GB | medio |
| P8 | avocado | AvocadoPest3 + K-Kotagiri | <1 GB | bajo |
| P9 | geo/telemetry | CropHarvest + AgroSabia | <5 GB | futuro (Capa 4) |

**Orden óptimo:** P1 → P2 → P3 primero (más valor con menos riesgo). La **Capa 1 (PlantVillage) sigue siendo Fase 0 ya diseñada** y es prerrequisito de baseline.

---

## 8. Dataset MVP recomendado (provisional)

**Primer entregable multicapa con máximo valor/riesgo balanceado:**

```
MULTIDATASET MVP v1 (provisional)
├── DOM1 · leaf-lab  → PlantVillage V2                        [16 cl · baseline]
├── DOM2 · leaf-field→ PlantDoc (subset limpio) + FieldPlant   [robustez campo]
└── DOM3 · coffee    → JMuBEN + DECAFIA-Col                 [tropical, Colombia]
```

- **Volumen objetivo:** ~10–15 GB curados (224×224).
- **Métricas:** por dominio (macro-F1, ECE) + **cross-domain lab→field**.
- **Por qué estos tres:** (a) solapan especies con V2 (tomato/potato/corn) → miden robustez real; (b) café representa el primer dominio tropical con fuente colombiana (DECAFIA, CC BY 4.0); (c) controla el riesgo de unificación manteniendo dominios discretos.
- **NO incluye todavía:** Cocoa, Banana, Citrus, Avocado, Cassava, Paddy (se agregan como dominios en expansión; no como presión inicial).

---

## 9. Dataset Completo recomendado (visión, NO canónico)

Expansión aditiva por fases hasta:

```
DATASET V2+ COMPLETO (visión)
├── Capa 1 · baseline            → PlantVillage V2 (intocable)
├── Capa 2 · tropicales          → coffee (JMuBEN/DECAFIA/RoCoLe/BRACOL)
│                                 + cocoa (KaraAgro/unificado/CocoaSwolSet)
│                                 + banana (Zenodo subset) + citrus (CitrusUAT)
│                                 + avocado (AvocadoPest3/K-Kotagiri)
├── Capa 3 · campo real          → PlantDoc + FieldPlant + Cassava(CC0) + Paddy Doctor
└── Capa 4 · telemetría/predicción → CropHarvest + AgroSabia + IoT + Soil Moisture  (pipeline geo/time-series separado)
```

- **Volumen estimado completo curado:** 30–60 GB (con subsets y resize por fuente).
- **Regla dura:** cada capa se adquiere con su propio sub-manifiesto de proveniencia (fuente, DOI, licencia, volúmenes, asociación al subtree, checksums) — extendiendo el patrón de manifiestos V2 a nivel multi-dataset.
- **Capa 4 NUNCA se mezcla con visión:** se entrena y evalúa con pipeline propio (series temporales satelitales/tabulares).

---

## 10. Roadmap Dataset V2+ (hitos)

| Hito | Contenido | Estado |
|---|---|---|
| H0 | Fase 0 (PlantVillage RAW) ejecutada en ASUS | 🔴 pendiente (GO descarga NO emitido) |
| H1 | DATASET V2 baseline materializado (21.160/16/3) + split + benchmark | 🔴 pendiente |
| H2 | Auditoría de viabilidad (ESTE documento) | ✅ **hecho (provisional)** |
| H3 | Diseño formal del Dataset Base MVP (consumir este audit; definir manifiestos multi-fuente, anti-fuga global, taxonomía extendida) | 🟡 siguiente paso de diseño |
| H4 | Adquisición MVP P1 (leaf-field: PlantDoc + FieldPlant) | pendiente |
| H5 | Benchmarks por dominio + cross-domain lab→field | pendiente |
| H6 | Expansión tropical (P2–P3: coffee, cocoa) | pendiente |
| H7 | Expansión complementaria (P4–P8) | pendiente |
| H8 | Capa 4 geo/telemetría (CropHarvest + AgroSabia) pipeline propio | futuro |

**Decisión de gobernanza requerida (no tomada hoy):** si el Dataset Base MVP pasa a diseño formal, debe materializarse un **extensión del framework de manifiestos V2 a nivel multi-fuente** y una **política de anti-duplicación inter-fuente** — siempre conservando DATASET_V2 vigente como baseline inviolable.

---

*Auditoría provisional de factibilidad multidataset. NO CANÓNICO · SOLO INVESTIGACIÓN. No modifica MASTERPLAN, ni DATASET_V2, ni manifiestos, ni documentación canónica existente. Sin commits. Próximo insumo requerido: decisión de gobernanza sobre si este audit avanza a diseño formal de Dataset Base MVP.*