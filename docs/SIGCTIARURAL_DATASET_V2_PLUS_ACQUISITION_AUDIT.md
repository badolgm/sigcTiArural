# SIGCTiArural — DATASET V2+ ACQUISITION AUDIT

**Clasificación:** ⚠️ **AUDITORÍA DE ADQUISICIÓN · SOLO INVESTIGACIÓN · NO CANÓNICO**
**Documento:** SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_AUDIT
**Fecha:** 2026-09-22 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `86d545e`
**Tipo:** Auditoría de adquisición de las 9 fuentes del Dataset V2+ multicapa. **NO** modifica MASTERPLAN, ni DATASET_V2 vigente (21.160/16/3 sigue inviolable), ni manifiestos, ni documentación canónica. Sin commits.
**Fuentes base:** MULTIDATASET_FEASIBILITY_AUDIT · READINESS_REPORT · PHASE0_EXECUTION_GUIDE · PHASE0_READYCHECK · PHASE0_EXECUTION_CHECKLIST.
**Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA. Honestidad de estado: cada dato lleva marcado **[real]** (publicado/verificado 2026-09-22) o **[estimado]** (derivado; verificar al descargar).

---

## 0. Método y honestidad de datos

- **[real]**: URL, licencia o tamaño publicado por la fuente oficial y verificado por investigación web.
- **[estimado]**: tamaño deducido por nº de imágenes/formato (la fuente no publica bytes); debe medirse con `Get-PSDrive` y checksums al ejecutar la descarga.
- Criterio de prioridad: (a) prerequisito de baseline → (b) bajo riesgo + alto valor → (c) volumen/espacio → (d) restricción legal.
- Presupuesto duro: ASUS tiene **~19 GB libres [real]**; el set completo suma **>60 GB [estimado]** → adquisición secuencial con subsets es obligatoria (gates Fase 0 aplican por fuente).

---

## 1. PlantVillage (Capa 1 — baseline)

| # | Campo | Valor |
|---|---|---|
| 1 | URL exacta | https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset **[real]** · espejo Mendeley https://data.mendeley.com/datasets/tywbtsjrjv/1 · git https://github.com/spMohanty/PlantVillage-Dataset |
| 2 | Licencia | **CC BY-SA 3.0** (original PSU "Share and Share Alike") **[real]** · espejos Kaggle/figshare declaran CC BY 4.0 → verificar por fuente usada |
| 3 | Tamaño descarga | **827.82 MiB** full 54.303 (TensorFlow Datasets) **[real]** · scope V2 21.160 ≈ **~350 MB [estimado]** |
| 4 | Tamaño expandido | ~815 MiB full **[real]** · scope V2 **~350 MB [estimado]** |
| 5 | Formato | JPG/PNG carpetas por clase · variantes `raw/color`, `raw/grey`, `segment` · split 80/20 predefinido **[real]** |
| 6 | Clases | Full 38 (14 spp, 26 enfermedades + healthy) · **scope V2: 16 clases / 3 spp (tomate 10, papa 3, maíz 3) = 21.160 imgs** **[real]** |
| 7 | Riesgos legales | ShareAlike: derivados deben licenciarse igual + atribución. Bajo riesgo si se cumple SA |
| 8 | Riesgos técnicos | Sesgo de fondo lab (conocido); extensiones mixtas **.jpg/.jpeg/.png** (GATE 8.5 ya lo contempla); filename expone clase; evitar variantes grey/segment |
| 9 | Prioridad | **P0 — baseline inviolable** |
| 10 | Orden de adquisición | **1** (prerrequisito de todo lo demás; Fase 0 ya diseñada) |

---

## 2. PlantDoc (Capa 3 — campo)

| # | Campo | Valor |
|---|---|---|
| 1 | URL exacta | Clasificación: https://github.com/pratikkayal/PlantDoc-Dataset · Detección: https://github.com/pratikkayal/PlantDoc-Object-Detection-Dataset · mirror Kaggle https://www.kaggle.com/datasets/yusufmurtaza01/plantdoc-object-detection-dataset · Roboflow https://public.roboflow.com/object-detection/plantdoc **[real]** |
| 2 | Licencia | **CC BY 4.0** **[real]** |
| 3 | Tamaño descarga | **~0,91–0,99 GB** (Roboflow 907,92 MB / Kaggle 992,32 MB) **[real]**; repo GitHub menor **[estimado]** |
| 4 | Tamaño expandido | **~1 GB [estimado]** |
| 5 | Formato | JPG carpetas por clase (clasificación) · Pascal VOC/YOLO (detección) · split 2342/236 **[real]** |
| 6 | Clases | 2.598 imgs · 13 spp · 27–30 clases (17 enfermedad + 10 healthy); conteos varían 2.482–2.598 entre mirrors **[real]** |
| 7 | Riesgos legales | Ninguno material (CC BY 4.0 + atribución) |
| 8 | Riesgos técnicos | Rótulos de internet **sin patólogo** (ruido documentado); clase huérfana ~2 muestras (spider-mites); test solo 236 → CIs anchas; discrepancias de conteo entre mirrors |
| 9 | Prioridad | **P1 — robustez de campo** |
| 10 | Orden de adquisición | **2** |

---

## 3. FieldPlant (Capa 3 — campo)

| # | Campo | Valor |
|---|---|---|
| 1 | URL exacta | https://universe.roboflow.com/plant-disease-detection/fieldplant (oficial; requiere cuenta Roboflow) · paper DOI 10.1109/access.2023.3263042 **[real]** |
| 2 | Licencia | **CC BY 4.0** (IEEE Access) **[real]** · export sujeto a términos Roboflow → verificar al exportar |
| 3 | Tamaño descarga | **1,5–2 GB [estimado]** (5.170 imgs + 8.629 bboxes; la fuente no publica bytes) |
| 4 | Tamaño expandido | **~2 GB [estimado]** |
| 5 | Formato | JPG + YOLO/VOC vía Roboflow · imágenes multi-hoja o cropeadas (C-FP) **[real]** |
| 6 | Clases | **27 enfermedades · 3 cultivos (maíz, cassava, tomate) · 5.170 imgs / 8.629 hojas** **[real]** |
| 7 | Riesgos legales | Bajo; cita obligatoria del paper; confirmar licencia del proyecto al exportar Roboflow |
| 8 | Riesgos técnicos | Cuenta/SDK Roboflow obligatorios; conteos 5.170 vs 5.156 en terceros; multi-hoja exige pipeline de recorte o path de detección |
| 9 | Prioridad | **P1 — calidad de campo supervisada por patólogo** |
| 10 | Orden de adquisición | **3** |

---

## 4. Coffee — JMuBEN + JMuBEN2 (Capa 2 — café)

| # | Campo | Valor |
|---|---|---|
| 1 | URL exacta | JMuBEN: https://data.mendeley.com/datasets/t2r6rszp5c/1 (DOI 10.17632/t2r6rszp5c.1) · JMuBEN2: https://data.mendeley.com/datasets/tgv3zb82nd/1 (DOI 10.17632/tgv3zb82nd.1) · paper: PMC8165403 **[real]** |
| 2 | Licencia | Mendeley Data; artículo Data in Brief **CC BY 4.0** **[real]** → confirmar etiqueta en landing de cada DOI antes de bajar |
| 3 | Tamaño descarga | **2–3 GB [estimado]** (58.555 JPEG recortados/aumentados; bytes no publicados) |
| 4 | Tamaño expandido | **~3 GB [estimado]** |
| 5 | Formato | ZIP con carpetas por clase · JPEG recortados al ROI · ya aumentado **[real]** |
| 6 | Clases | **5 (Phoma, Cercospora, Rust, Healthy, Miner) · 58.555 imgs · arabica · campo Kenia con patólogo** **[real]** (JMuBEN 22.591 + JMuBEN2 35.964) |
| 7 | Riesgos legales | Bajo (CC BY + atribución Jepkoech et al. 2021) |
| 8 | Riesgos técnicos | Dos DOIs separados → unificar; tabla publicada con Phoma/Rust de inconsistente respecto al texto → leer carpetas reales; **ya aumentado** → riesgo de fuga si se re-particiona sin pHash; tamaño por archivo no publicado |
| 9 | Prioridad | **P2 — primer dominio tropical** |
| 10 | Orden de adquisición | **4** |

---

## 5. Cocoa — Disease Unified (Capa 2 — cacao)

| # | Campo | Valor |
|---|---|---|
| 1 | URL exacta | https://www.kaggle.com/datasets/danielohachor/cocoa-disease-unified (v1) · alternativas limpias: KaraAgroAI CC0 (DatasetNinja 10,83 GB) · CocoaMonilia https://zenodo.org/records/17716661 (CC BY 4.0, 1.953 imgs) **[real]** |
| 2 | Licencia | **"Other" — agregado de 6 fuentes con licencias propias** **[real]** · incluye **CC BY-NC-SA 4.0** (bryandarquea/Perú) y **ODbL 1.0** (Serrano YOLOv4) → 🔴 ver §7 |
| 3 | Tamaño descarga | **5,52 GB** (Kaggle v1) **[real]** |
| 4 | Tamaño expandido | **~5,5–6 GB [estimado]** |
| 5 | Formato | Carpetas por clase (clasificación derivada de bboxes YOLO/COCO) · dedup pHash solo aplicado a `pod_borer` **[real]** |
| 6 | Clases | **9: healthy, cssvd, anthracnose, black_pod_rot, frosty_pod_rot, mirid, monilia, pod_borer, witches_broom** **[real]** (fuentes: Amini/Zindi, KaraAgroAI, Serrano, COCOA-3, Nyarko, CocoaMonilia, bryandarquea) |
| 7 | Riesgos legales | 🔴 **Altos**: NC-SA y ODbL heredados bloquean uso comercial mientras esas fuentes estén dentro. Requiere auditoría por fuente o **reconstrucción con solo CC0/BY** (KaraAgroAI + CocoaMonilia) |
| 8 | Riesgos técnicos | 5,52 GB pesado para ASUS; desbalance fuerte (anthracnose 2.264 archivos); bbox→clasificación arrastra fondo; reconstruir proveniencia 6 fuentes en manifiesto; dedup incompleto cross-source |
| 9 | Prioridad | **P3 — dominio tropical de alto valor** |
| 10 | Orden de adquisición | **5** (vía preferida: subset reconstruido CC0/BY, no el unified completo) |

---

## 6. Banano — Tanzania (Capa 2 — banano)

| # | Campo | Valor |
|---|---|---|
| 1 | URL exacta | Zenodo 11.767: https://doi.org/10.5281/zenodo.7670326 (9 ZIP) · Harvard Dataverse 16.092: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/LQUWXW **[real]** |
| 2 | Licencia | **CC BY 4.0** (paper Sci Data s41597-025-04456-4) **[real]** · Dataverse: confirmar etiqueta al descargar |
| 3 | Tamaño descarga | Zenodo **34,3 GB** (9 zips de 2,0–7,2 GB) **[real]** · Dataverse **4–6 GB [estimado]** (1024×768) |
| 4 | Tamaño expandido | ≈ comprimido: **34,3 GB** Zenodo / **~5 GB** Dataverse **[real]/[estimado]** |
| 5 | Formato | 9 ZIP → JPEG · Zenodo 3480×3496 · Dataverse 1024×768 **[real]** |
| 6 | Clases | **3: Healthy 3.339 · Black Sigatoka 3.496 · Fusarium Wilt R1 4.932** (11.767) **[real]** · mismo triplete en los 16.092 |
| 7 | Riesgos legales | Bajo (CC BY 4.0 + atribución) |
| 8 | Riesgos técnicos | 🔴 **34,3 GB > 19 GB libres → Zenodo full IMPOSIBLE en ASUS**; 9 zips → descarga reanudable obligatoria (lección Fase 0); resolución 3480² → resize a 224×224 obligatorio; usar Dataverse o subset |
| 9 | Prioridad | **P6 — diferido por volumen** |
| 10 | Orden de adquisición | **8** (ruta única viable: Dataverse 1024×768 o subset Zenodo) |

---

## 7. Cassava — Kaggle 2020 (Capa 3 — campo)

| # | Campo | Valor |
|---|---|---|
| 1 | URL exacta | Oficial: https://www.kaggle.com/c/cassava-leaf-disease-classification/data (requiere aceptar reglas) · espejos **CC0**: https://www.kaggle.com/datasets/ibia9sa/cassava1920labeltfrec (3,32 GB) · https://www.kaggle.com/datasets/kingofarmy/cassavapreprocessed (7,19 GB) · merged 2019+2020 https://www.kaggle.com/datasets/srg9000/cassava-plant-disease-merged-20192020 (11,51 GB) **[real]** · ❌ NO usar PennState original |
| 2 | Licencia | Espejos Kaggle **CC0** **[real]** · PennState original **CC BY-NC-SA 4.0** → **EXCLUIDO** por NC |
| 3 | Tamaño descarga | **5,5–7,2 GB [estimado]** (21.367 train; TFRecords 5,54 GB / preproc 7,19 GB **[real]**) |
| 4 | Tamaño expandido | **~7–9 GB [estimado]**; 11,51 GB si merged 2019+2020 |
| 5 | Formato | JPG carpetas + `train.csv` · variantes TFRecords 512×512 **[real]** |
| 6 | Clases | **5: CBB, CBSD, CGM, CMD, Healthy · 21.367 train 2020 (+~500 de 2019) · campo Uganda, anotado NaCRRI/Makerere** **[real]** |
| 7 | Riesgos legales | ✅ CC0 por espejo · 🔴 PennState NC-SA prohibido · oficial puede exigir aceptación de reglas de competencia → preferir espejo CC0 trazable |
| 8 | Riesgos técnicos | Desbalance CMD mayoritario; si se fusionan 2019+2020 deduplicar; fotos de agricultores → calidad variable; 5–7 GB ya pesado para el presupuesto |
| 9 | Prioridad | **P5** |
| 10 | Orden de adquisición | **7** |

---

## 8. Paddy Doctor (Capa 3 — campo)

| # | Campo | Valor |
|---|---|---|
| 1 | URL exacta | Oficial: https://paddydoc.github.io/ · https://github.com/paddydoc/paddy-doctor-dataset · IEEE DataPort (full `paddy-doctor-diseases.zip` 4,64 GB) · espejo Kaggle https://www.kaggle.com/datasets/dasa7753912/new-paddy-doctor-paddy-disease-classification (~2,33 GB) o castlerichard (1,09 GB) **[real]** |
| 2 | Licencia | Liberado open-source por autores **[real]**; confirmar **CC BY 4.0** en IEEE DataPort; mirrors Kaggle sin licencia explícita → preferir oficial |
| 3 | Tamaño descarga | Full **4,64 GB** · small **322 MB** · Kaggle **1,09–2,33 GB** **[real]** |
| 4 | Tamaño expandido | **~4,6 GB** full / **~2,3 GB** Kaggle **[real]/[estimado]** |
| 5 | Formato | ZIP → JPEG carpetas · Kaggle `train.csv` + imágenes 1080×1440 **[real]** |
| 6 | Clases | Full **13 (12 enfermedades/pestes + normal) · 16.225 imgs** · subset Kaggle **10 (9 + normal) · 10.407 train + 3.469 test** · campo India con agrónomo **[real]** |
| 7 | Riesgos legales | Bajo; usar fuente oficial (DataPort/GitHub) para licencia trazable |
| 8 | Riesgos técnicos | **Discrepancia 13 vs 10 clases** entre full y subset Kaggle → no mezclar sin reconciliar ontología; resolución alta (resize); metadata variety/age a preservar |
| 9 | Prioridad | **P4** |
| 10 | Orden de adquisición | **6** |

---

## 9. IP102 (plagas — Capa 2/3, condicional)

| # | Campo | Valor |
|---|---|---|
| 1 | URL exacta | Oficial: https://github.com/xpwu95/IP102 (Google Drive https://drive.google.com/drive/folders/1svFSy2Da3cVMvekBwe13mzyx38XZ9xWo · AliyunDrive) · mirror Kaggle https://www.kaggle.com/datasets/hungt1/ip102-dataset · Ultralytics v1.1 (5,5 GB) **[real]** |
| 2 | Licencia | 🔴 **"free for academic usage" — NO es licencia abierta**; otros usos requieren permiso escrito a Xiaoping Wu (xpwu95@163.com) **[real]** |
| 3 | Tamaño descarga | **~7,8 GB** (paper; Kaggle mirror) **[real]** · Ultralytics 5,5 GB (95.477 imgs) **[real]** |
| 4 | Tamaño expandido | **~7,8–8 GB [estimado]** |
| 5 | Formato | JPEG/PNG · split 6:1:3 (45.095/7.508/22.619) · 18.983 con bbox Pascal VOC · `classes.txt` jerárquico **[real]** |
| 6 | Clases | **102 plagas** (jerarquía por cultivo) · **75.222 imgs** · cola larga extrema (mín. 71/clase) **[real]** |
| 7 | Riesgos legales | 🔴🔴 **BLOQUEANTE**: uso solo académico → integra sin permiso escrito → contamina el dataset productivo SIGCTiArural. **Gate: permiso por escrito ANTES de adquirir** |
| 8 | Riesgos técnicos | Google Drive con límites/frágil; 7,8 GB; ruido/watermarks de búsqueda web; long-tail 71–~6k; mapear jerarquía a taxonomía `species__condition__source` |
| 9 | Prioridad | **P7 — CONDICIONAL (gate de licencia)** |
| 10 | Orden de adquisición | **9 (último)** |

---

## 9b. Resumen de prioridades (ítem 9 consolidado)

| Prioridad | Fuentes | Justificación |
|---|---|---|
| **P0** | PlantVillage | Baseline V2 diseñado; prerequisito absoluto |
| **P1** | PlantDoc · FieldPlant | Campo real, solapan spp con V2, bajo riesgo, ~3 GB |
| **P2** | Coffee (JMuBEN+2) | Tropical de alto valor, CC BY, ~3 GB |
| **P3** | Cocoa | Alto valor; gate de limpieza de licencias (NC/ODbL) |
| **P4** | Paddy Doctor | Calidad oficial, discrepar 13/10 a resolver |
| **P5** | Cassava | CC0 viable, pesado (5–7 GB), desbalance CMD |
| **P6** | Banano | Full Zenodo inviable (34,3 GB); solo Dataverse/subset |
| **P7** | IP102 | 🔴 licencia académica → permiso escrito previo |

---

## 10. Orden de adquisición (ítem 10 consolidado)

| Orden | Fuente | GB descarga | Acum. | Espacio vs 19 GB |
|---|---|---|---|---|
| 1 | PlantVillage (scope V2) | ~0,35–0,85 | ~0,85 | ✅ |
| 2 | PlantDoc | ~1 | ~1,85 | ✅ |
| 3 | FieldPlant | ~2 | ~3,85 | ✅ |
| 4 | Coffee | ~3 | ~6,85 | ✅ |
| 5 | Cocoa (subset CC0/BY) | ~2–5,5 | ~9–12,4 | ✅ con subset |
| 6 | Paddy Doctor (subset Kaggle 2,3 o full 4,64) | 2,3–4,64 | ~11–17 | ⚠️ cerca del límite |
| 7 | Cassava (CC0 espejo) | 5,5–7,2 | **17–24** | 🔴 **excede 19** |
| 8 | Banano (Dataverse o subset) | ~5 | **~22–29** | 🔴 **excede** |
| 9 | IP102 (tras permiso) | 7,8 | **~30–37** | 🔴 **excede** |

**Reglas operativas derivadas (conectan con Fase 0 ya diseñada):**
1. **No cabe el RAW completo en ASUS (19 GB)** → política obligatoria: `subset + resize 224×224 + purge de RAW tras ingesta`, o disco externo ≥ 100 GB. Decisión de Bernardo antes del orden 6.
2. Cada adquisición = una ejecución de gates Fase 0 (GATE 1 espacio → GATE 5 punto de retorno → GATE 8 estructura → GATE 12 manifiesto de proveniencia).
3. Descarga secuencial una fuente a la vez; jamás paralela (mismo riesgo de mitad-de-descarga ya documentado).
4. **IP102 no se descarga bajo ningún escenario sin permiso escrito del autor** (gate legal previo a GATE 1).
5. Cocoa se adquiere preferentemente como **subset reconstruido CC0/BY** (KaraAgroAI + CocoaMonilia), dejando el unified completo como referencia, no como RAW productivo.

---

*Auditoría de adquisición Dataset V2+. SOLO INVESTIGACIÓN · NO CANÓNICO. No modifica MASTERPLAN, DATASET_V2, manifiestos ni documentación canónica existente. Sin commits. Tamaños marcados [estimado] deben medirse en el momento real de descarga (`Get-PSDrive` + checksums). Próximo paso de gobernanza: confirmar política de espacio (subset/purge vs disco externo) y gate de licencia IP102 antes de emitir orden de descarga de ninguna fuente.*