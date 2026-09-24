# SIGCTiArural — DATASET V2+ ACQUISITION ROADMAP

**Clasificación:** ⚙️ **SOLO DISEÑO · NO CANÓNICO** · PLAN DE ADQUISICIÓN
**Documento:** SIGCTIARURAL_DATASET_V2_PLUS_ACQUISITION_ROADMAP
**Rama:** `feature/ubtn-biological-telemetry` · **HEAD:** `5a079f4`
**Fecha:** 2026-09-22
**Reglas:** SOLO DISEÑO. NO implementar · NO crear código · NO commits · NO modificar documentos canónicos · NO modificar MASTERPLAN · NO modificar DATASET_V2 vigente.
**Fuentes de este documento:** MULTIDATASET_FEASIBILITY_AUDIT · DATASET_V2_PLUS_ACQUISITION_AUDIT · DATASET_V2_PLUS_MVP.
**Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA. Honestidad de estado: **[real]** verificado vs **[estimado]** a medir con `Get-PSDrive` y checksums en la adquisición.

---

## 0. Principio de ejecución

- Adquisición **secuencial una fuente a la vez**, jamás paralela (lección Fase 0: descarga abortada a mitad).
- Cada adquisición ejecuta los **gates de Fase 0** del checklist vigente: GATE 1 espacio → GATE 5 punto de retorno → GATE 8 estructura → GATE 12 manifiesto.
- Presupuesto duro ASUS: **~19 GB libres [real]**.
- El esquema `species__condition__source` y los dominios recon el **MVP** ya diseñado: DOM1 lab · DOM2 field · DOM3 coffee · DOM4 cocoa.
- PlantVillage V2 (21.160/16/3) entra SIN ALTERACIÓN; lo demás se adquiere como extensión aditiva.

---

## Fase A — PlantVillage (DOM1 · leaf-lab · baseline)

| Campo | Detalle |
|---|---|
| **Tamaño** | Descarga scope V2: **~0,35 GB [estimado]** · full dataset 827,82 MiB [real] (TFDS) · expandido ≈ 0,35 GB [estimado] |
| **URLs** | https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset [real] · espejo Mendeley https://data.mendeley.com/datasets/tywbtsjrjv/1 · git https://github.com/spMohanty/PlantVillage-Dataset |
| **Licencia** | **CC BY-SA 3.0** original PSU [real] · espejo Kaggle/figshare declara CC BY 4.0 → verificar la fuente usada |
| **Prioridad** | **P0 — baseline inviolable**: prerrequisito absoluto de warm-up y referencia DOM1 |
| **Espacio requerido** | **~0,35–0,85 GB** |
| **Riesgo** | Bajo. Legal: ShareAlike (atribución/SA obligatoria en derivados). Técnico: extensiones mixtas .jpg/.jpeg/.png (GATE 8.5 ya lo cubre); sesgo lab conocido (fondo uniforme, 1 hoja) |
| **Valor científico** | Baseline reproducible · warm-up de feature extractor · benchmark de referencia · fuente de laboratorio controlado |

**Mirada:** ya está diseñado y permanece intocable. Solo queda materializarlo en el ASUS bajo gates Fase 0.

---

## Fase B — PlantDoc + FieldPlant (DOM2 · leaf-field)

### B1 · PlantDoc

| Campo | Detalle |
|---|---|
| **Tamaño** | **~0,91–0,99 GB [real]** espejos (Roboflow 907,92 MB · Kaggle 992,32 MB) · GitHub menor [estimado] |
| **URLs** | clasificación https://github.com/pratikkayal/PlantDoc-Dataset · detección https://github.com/pratikkayal/PlantDoc-Object-Detection-Dataset · espejo https://www.kaggle.com/datasets/yusufmurtaza01/plantdoc-object-detection-dataset · Roboflow https://public.roboflow.com/object-detection/plantdoc |
| **Licencia** | **CC BY 4.0 [real]** |
| **Prioridad** | **P1 — robustez de campo**: primer dataset de campo real del MVP |
| **Espacio requerido** | **~1 GB** |
| **Riesgo** | Alto técnico-conceptual: sin patólogo (ruido de etiquetas documentado), clase huérfana (~2 muestras), test pequeño (236 imgs → CIs anchas), conteos 2.482–2.598 entre mirrors, riesgo de duplicados con PlantVillage (scrapeo desde sus clases) → dedup global obligatorio |
| **Valor científico** | Primer eje de campo · permite el benchmark lab→field sobre especies compartidas con V2 (tomate/maíz/papa) |

### B2 · FieldPlant

| Campo | Detalle |
|---|---|
| **Tamaño** | **1,5–2 GB [estimado]** (5.170 imgs / 8.629 hojas; fuente no publica bytes) |
| **URLs** | https://universe.roboflow.com/plant-disease-detection/fieldplant [real] (cuenta Roboflow) · paper DOI 10.1109/access.2023.3263042 |
| **Licencia** | **CC BY 4.0 [real]** (IEEE Access) · confirmar licencia del proyecto al exportar Roboflow |
| **Prioridad** | **P1 — calidad de campo supervisada por patólogo** (el más confiable del DOM2) |
| **Espacio requerido** | **~2 GB** |
| **Riesgo** | Técnico-medio: export requiere cuenta/SDK Roboflow; conteos 5.170 vs 5.156 en terceros; multi-hoja → split a nivel de imagen-fuente (no de hoja) para anti-fuga |
| **Valor científico** | Patólogo anotando → ground-truth confiable de campo; primer dataset con cassava anotado; complementa y corrige el ruido de PlantDoc |

**Orden dentro de la fase:** PlantDoc primero (rápido, espejos directos) → FieldPlant después (depende de cuenta Roboflow).

---

## Fase C — Coffee (DOM3 · coffee · tropical)

| Campo | Detalle |
|---|---|
| **Tamaño** | **2–3 GB [estimado]** (58.555 imgs JMuBEN 22.591 + JMuBEN2 35.964; bytes no publicados) · expandido ≈ 3 GB |
| **URLs** | JMuBEN https://data.mendeley.com/datasets/t2r6rszp5c/1 (DOI 10.17632/t2r6rszp5c.1) · JMuBEN2 https://data.mendeley.com/datasets/tgv3zb82nd/1 (DOI 10.17632/tgv3zb82nd.1) · paper PMC8165403 |
| **Licencia** | **CC BY 4.0 [real]** (artículo Data in Brief) · confirmar etiqueta en landing de cada DOI |
| **Prioridad** | **P2 — primer dominio tropical** |
| **Espacio requerido** | **~3 GB** |
| **Riesgo** | Técnico-medio: dataset **ya aumentado** → el split debe estratificar por `augmented` para no fuguar el mismo original en train y test; dos DOIs separados a unificar; nombres de carpetas inconsistentes entre descripción y tabla del paper (Phoma/Rust); tamaño por archivo no publicado |
| **Valor científico** | Dominio tropical real con patólogo (Kenia); 5 clases abarcables; prepuesta de transferencia hacia café (SIGCTiArural de interés local); JMuBEN es un núcleo coffee sólido |

**Orden dentro de la fase:** JMuBEN (v1) primero → JMuBEN2 (v2) después, unificando al esquema coffee_arabica__{condition}.

---

## Fase D — Cocoa (DOM4 · cocoa · tropical)

### D1 · CocoaMonilia

| Campo | Detalle |
|---|---|
| **Tamaño** | **~2 GB [estimado]** (1.953 imgs · 4 clases h0/m1/m2/m3) |
| **URLs** | https://zenodo.org/records/17716661 (DOI 10.5281/zenodo.17716661) · repo https://github.com/joanfco30/CocoaMoniliaDataSet |
| **Licencia** | **CC BY 4.0 [real]** |
| **Prioridad** | **P3 — etapas tempranas de Monilia (detección temprana)** |
| **Espacio requerido** | **~2 GB** |
| **Riesgo** | Bajo. Anotaciones COCO/YOLO/máscaras (no clasificación simple → pipeline de extracción de crops); dataset colombiano relevante al contexto EIAR; clase de etapas → 4 clases finas |
| **Valor científico** | Predicción temprana de Monilia por etapas (30–40% pérdida mundial documentada); añade cacao con ciclo biológico anotado |

### D2 · KaraAgroAI

| Campo | Detalle |
|---|---|
| **Tamaño** | Full **10,83 GB [real]** en Supervisely/DatasetNinja (11.978 imgs · 8 cl) → **SUBset curado ~3–5 GB [estimado]** |
| **URLs** | DatasetNinja https://datasetninja.com/kara-agro-ai-cocoa · origen Kaggle/KaraAgro AI (Ghana) |
| **Licencia** | **CC0 1.0 [real]** |
| **Prioridad** | **P3 — segundo dominio cocoa (CSSVD/anthracnose/healthy anatómico)** |
| **Espacio requerido** | **~3–5 GB con subset** · full 10,83 GB supera el margen seguro → subset obligatorio |
| **Riesgo** | Alto-volumen (10,83 GB full) → forzar subset; bounding boxes (21.712 objetos) → pipeline bbox→crops; desbalance cssvd/anthracnose/healthy; unificar anatomía leaf/pod/stem como metadato, healthy simple por especie |
| **Valor científico** | Anotado por agrónomos de Ghana en 7 regiones cacao; complementa Monilia con CSSVD (enfermedad virótica); licencia CC0 sin fricción |

**Decisión derivada del ACQUISITION_AUDIT:** NO adquirir el `cocoa-disease-unified` de Kaggle como RAW productivo (hereda CC BY-NC-SA y ODbL de fuentes origen) → usar CocoaMonilia CC BY 4.0 + KaraAgroAI CC0 y, si se quiere, el unified solo como referencia externa.

---

## Resumen de fases

| Fase | Fuente | Tamaño | Licencia | Prioridad | Espacio | Riesgo principal |
|---|---|---|---|---|---|---|
| A | PlantVillage V2 | ~0,35–0,85 GB | CC BY-SA 3.0 (verificar espejo) | P0 | ~0,85 GB | SA legal · sesgo lab |
| B1 | PlantDoc | ~1 GB | CC BY 4.0 | P1 | ~1 GB | ruido sin patólogo · dup con PV |
| B2 | FieldPlant | ~1,5–2 GB | CC BY 4.0 | P1 | ~2 GB | cuenta Roboflow · split por imagen |
| C | Coffee JMuBEN+2 | ~3 GB | CC BY 4.0 | P2 | ~3 GB | ya aumentado · 2 DOIs |
| D1 | CocoaMonilia | ~2 GB | CC BY 4.0 | P3 | ~2 GB | anotaciones COCO/YOLO |
| D2 | KaraAgroAI | ~3–5 GB subset | CC0 | P3 | ~3–5 GB | volumen full 10,83 GB |

### Presupuesto acumulado vs 19 GB

| Paso | GB acumulado | Vs 19 GB |
|---|---|---|
| A | ~0,85 | ✅ |
| B1 | ~1,85 | ✅ |
| B2 | ~3,85 | ✅ |
| C | ~6,85 | ✅ |
| D1 | ~8,85 | ✅ |
| D2 subset | ~12–14 | ✅ dentro con subset |
| D2 full | ~19,7 | 🔴 excede → subset o disco externo |

**Regla operativa:** todo el MVP entra en 19 GB **siempre que KaraAgroAI se tomo como subset curado** (~half sized). Full 10,83 GB + acumulado ≈ 19,7 GB topa el límite → no adquirir full salvo disco externo ≥ 20 GB.

---

## Resultado final · ORDEN EXACTO DE ADQUISICIÓN

```
 1 · PLANTVILLAGE  (Fase A)   → baseline intocable, warm-up
 2 · PLANTDOC      (Fase B1)   → campo real rápido, eval lab→field
 3 · FIELDPPLANT   (Fase B2)   → campo con patólogo, corrige ruido B1
 4 · JMuBEN        (Fase C1)   → café tropical v1
 5 · JMuBEN2       (Fase C2)   → café tropical v2, completa JMuBEN
 6 · CocoaMonilia  (Fase D1)   → monilia etapas, Colombia
 7 · KaraAgroAI    (Fase D2)   → CSSVD/anthracnose cacao, żsubset obligatorio
```

**Justificación del orden:**
1. PlantVillage primero (prerequisito absoluto, baseline, referencia DOM1).
2. PlantDoc antes que FieldPlant por rapidez de adquisición (espejos directos, ~1 GB) y porque habilita el eje lab→field; FieldPlant después por dependencia de cuenta Roboflow y mayor valor-verdad del suelo.
3. Coffee tras el DOM2 completo (consistencia con criticità p2: primer dominio tropical).
4. Cocoa al final (p3) y **D2 KaraAgroAI último**: su volumen obliga a confirmar espacio/postura de subset antes de iniciar.
5. Cada paso = **gates Fase 0 completos** y **manifiesto de proveniencia** (GATE 12) antes de abrir el siguiente.

**Puntos de decisión de Bernardo antes de cada fase:**
- **Antes de B2:** cuenta Roboflow para export FieldPlant.
- **Antes de C:** confirmar espacio ✓ y aceptar que JMuBEN viene aumentado (split estratificado por augmented).
- **Antes de D2:** decidir **subset vs disco externo** (KaraAgroAI full ≈ 10,83 GB).
- **Gate legal global:** IP102 NO entra (excluida del MVP; requiere permiso escrito académico si algún día se reactiva).

---

*Roadmap de adquisición Dataset V2+. SOLO DISEÑO · NO CANÓNICO. No modifica MASTERPLAN, DATASET_V2, manifiestos ni documentación canónica existente. Sin commits. Tamaños estimados a medir en la ejecución real (`Get-PSDrive` + checksums). Próximo paso: orden de Bernardo para iniciar Fase A under gates Fase 0.*