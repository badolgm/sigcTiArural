# SIGCTiArural — INVENTARIO DEL DATASET V2 (Estado Físico Real)

**Documento:** SIGCTIARURAL_DATASET_V2_INVENTORY
**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry` (working tree limpio)
**Tipo:** Inventario verificado y preparación (MISIÓN DATASET V2 INVENTORY).
**Regla suprema:** NO IMPLEMENTAR · NO ENTRENAR · NO GENERAR CÓDIGO · NO CREAR PIPELINES · NO MODIFICAR DOCUMENTOS EXISTENTES. SOLO INVENTARIAR Y PREPARAR.

**Naturaleza de la evidencia:** TODOS los estados de este documento fueron **verificados físicamente en disco** (2026-09-15) mediante recorridos de directorios, búsquedas de archivos, chequeo de manifests YAML y rastreo de rutas externas. No es diseño: es el inventario real.

---

## 0. Verdictado ejecutivo

> **La materialización del Dataset V2 NO puede comenzar mañana en su fase de entrena/benchmark, porque el dataset bootstrap NO EXISTE en la máquina actual (ni en el repo, ni en rutas externas conocidas).**
>
> **SÍ puede comenzar mañana la FASE 0 de preparación/adquisición** (recuperar el raw de PlantVillage, verificar contra manifiesto, estructurar árbol v1) — todo lo demás (labels, split, curated, benchmark) queda bloqueado por ese único artefacto físico.

La infraestructura de gobernanza (5 manifests YAML verificados) está **100% lista**. El código de entrenamiento en bt (`train_plant_disease_mobilenet.py`, notebooks) existe. **El único betting block es el dataset de origen.**

---

## 1. ¿Dónde está exactamente el dataset bootstrap?

### Ruta declarada (canónica) — NO EXISTE
```
C:\Users\Devbadolgm\Development\workspace\DatosProyectos\PlantVillage-Dataset-master
C:\Users\Devbadolgm\Development\workspace\DatosProyectos\PlantVillage-Dataset-master\raw\color
```
Fuente: `docs/ai/manifests/raw_source_manifest.agriculture_v2_dataset_v1.yaml` (`source_root`, `subset_root`, `allow_external_path: true`).

### Estado verificado de la ubicación
| Ubicación | ¿Existe? | Detalle |
|---|---|---|
| `C:\Users\Devbadolgm\...\PlantVillage-Dataset-master` | ❌ NO | `C:\Users\Devbadolgm` NO existe en esta máquina (perfil del equipo anterior) |
| `C:\Users\Devbadolgm` (raíz) | ❌ NO | No existe el usuario |
| `C:\Users\BagmDev\` (usuario actual) | ✅ Existe | Sin PlantVillage en ningún subdirectorio (recorrido ≤6 niveles) |
| `C:\Users\BagmDev\Downloads` | ✅ Existe | NO hay PlantVillage; hay `ImagenesDx.csv` (7.62 MB — radiografías clínicas SISPRO, NO vegetal, NO relevante para Dataset V2) |
| `C:\Users\BagmDev\Downloads\9.PROYECTOS\SensorCollarIA` | ✅ Existe | Solo `Datasheets` — sin imágenes vegetales |
| `C:\Users\BagmDev\Downloads\5.Varios_Ejecutados\data` | ✅ Existe | Solo `lab-data.js` + `ADDING_LABS.md` (datos de labs frontend, no dataset) |
| `C:\Users\BagmDev\.kaggle` | ❌ NO | Sin credenciales Kaggle configuradas |
| `D:\`, discos adicionales | ❌ NO | Solo existe disco `C:` (21.8 GB libres) |
| Repo `git` (tracked) | ❌ NO | `git ls-files` sin `.h5`/`.jpg`/`.csv` datasets; solo manifiestos YAML |

---

## 2. ¿Existe físicamente?

**NO.** No existe ningún archivo de dataset (ni PlantVillage, ni `data/`, ni `data/datasets/`, ni subconjunto de las 16 clases V2) en la máquina actual (`BagmDev`) ni en el repositorio.

**LO QUE SÍ EXISTE físicamente (verificado):**
| Artefacto | Ruta | Tamaño |
|---|---|---|
| `data/` (directorio raíz) | `data/` | ❌ NO existe |
| Modelo heredado MobileNetV2 | `src/ai_models/production_models/plant_disease_mbv2.h5` | 9.210 KB (~9 MB) |
| Metadata del modelo | `src/ai_models/production_models/model_metadata.json` | 0.1 KB |
| Imagen de prueba | `src/ai_models/test_leaf.jpg` | 1.4 KB |
| Script de entrenamiento | `src/ai_models/train_plant_disease_mobilenet.py` | 3.4 KB |
| Notebook de entrenamiento | `src/ai_models/notebooks/train_plant_disease_mobilenet.py` | 2.3 KB |
| Preparador de dataset | `src/ai_models/notebooks/prepare_plant_disease_dataset.py` | 4.3 KB |

---

## 3. ¿Está accesible?

| Vía de acceso | ¿Accesible hoy? | Observación |
|---|---|---|
| Path canónico (máquina vieja) | ❌ NO | Usuario/equipo anterior desaparecido |
| Kaggle (Kaggle API) | ❌ NO | Sin `.kaggle/kaggle.json` |
| Backups locales | ❌ NO | Ninguno encontrado |
| Repo GitHub (LFS/objetos) | ❌ NO | No rastreado por git |
| Descarga pública (Kaggle/rep) | ✅ POSIBLE | PlantVillage es dataset público; requiere conexión y credencial Kaggle (o mirrors) — **acción pendiente que destraba todo** |

**Conclusión:** la adquisición es factible (dataset público) pero **NO es automática**: requiere credencial Kaggle API o mirror, y un contrato de descarga ~1–2 GB estimado.

---

## 4. ¿Cuál es su tamaño esperado?

| Métrica | Valor | Fuente |
|---|---|---|
| Imágenes del subconjunto V2 | 21.160 | raw_source_manifest (`expected_images: 21160`) |
| Peso estimado `raw/color` (JPG originales) | **~1.0–2.5 GB** (estimación razonable: JPG 100–300 KB × 21.160; puede variar) | Estimación técnica, no auditar en el repo |
| Dataset PlantVillage completo (all subsets) | ~146.351 imágenes derivadas (52.977 color + 48.741 grayscale + 44.633 segmented en inventario) | `AI_DATASET_DISCOVERY_AND_AUDIT.md §2.3` |
| Espacio libre en disco C: | **21.8 GB** | Verificado — suficiente (margen >10×) |
| `.h5` del modelo | 9 MB | Verificado en disco |

---

## 5. ¿Cuántas imágenes contiene?

**21.160 imágenes RGB** (subconjunto cerrado de `raw/color` de las 16 clases V2). 
(Verificable contra `expected_images: 21160` del raw_source_manifest; las cifras fueron auditadas en `AGRICULTURE_AI_V2_DATASET_INVENTORY.md`.)

---

## 6. ¿Qué clases contiene?

**16 clases cerradas** (taxonomy_v1 — enum cerrado):

| Especie | Clases (condition_name) | Total |
|---|---|---|
| Tomato | healthy, early_blight, late_blight, leaf_mold, septoria_leaf_spot, bacterial_spot, target_spot, mosaic_virus, yellow_leaf_curl_virus | 9 |
| Potato | healthy, early_blight, late_blight | 3 |
| Corn | healthy, cercospora_gray_leaf_spot, common_rust, northern_leaf_blight | 4 |

**Excluidas explícitamente:** `raw/grayscale`, `raw/segmented`, `generated_for_paper`, `Tomato___Spider_mites Two-spotted_spider_mite`, y todo lo que no esté en las 16 clases (scope del manifiesto).

---

## 7. ¿Qué clases minoritarias existen?

| Clase | Conteo inventariado | % del dataset | Severidad |
|---|---|---|---|
| `potato__healthy` | 152 | 0.72% | **Crítica** (la más pequeña) |
| `tomato__mosaic_virus` | 373 | 1.76% | Alta |
| `tomato__septoria_leaf_spot` | 443 | 2.09% | Alta |
| `corn__cercospora_gray_leaf_spot` | 513 | 2.42% | Alta |
| (mayoritaria) `tomato__yellow_leaf_curl_virus` | 5.357 | 25.32% | — |

Ratio global de desbalance: **35.24×**. (Fuente: `AGRICULTURE_AI_V2_DATASET_INVENTORY.md §4.1`.) Estas 4 clases exigen doble revisión de etiquetas (`validation_source=double_reviewed`) y PR-curve obligatoria en evaluación.

---

## 8. ¿Qué manifiestos debemos reutilizar?

**Los 5 manifests canónicos YA EXISTEN y están verificados en disco** (`docs/ai/manifests/`) — reutilizar, NO recrear:

| Manifiesto | Tamaño verificado | Estado |
|---|---|---|
| `raw_source_manifest.agriculture_v2_dataset_v1.yaml` | 1.459 B | ✅ EXISTE (autoridad de origen/scope/exclusiones) |
| `curation_manifest.agriculture_v2_dataset_v1.yaml` | 2.360 B | ✅ EXISTE |
| `taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml` | 5.175 B | ✅ EXISTE |
| `split_manifest.agriculture_v2_split_v1.yaml` | 1.415 B | ✅ EXISTE (70/15/15, seed 42, anti-fuga) |
| `baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml` | 1.758 B | ✅ EXISTE (4 modelos, macro-F1, ECE, edge) |

**Nota de estado:** los manifests definen el diseño. El **materializado del split** (train/validation/test.csv) aún NO existe (se genera en fase de ejecución). Los manifests se copian a `v1/manifests/` con hash idéntico al canónico.

---

## 9. ¿Qué archivos metadata existen?

| Archivo metadata | ¿Existe? | Ubicación |
|---|---|---|
| `model_metadata.json` (`{"classes":["enferma","sana"],"framework":"tensorflow_fixed"}`) | ✅ EXISTE | `src/ai_models/production_models/` |
| Manifests YAML (5) | ✅ EXISTEN | `docs/ai/manifests/` |
| Specs de diseño research_v2 (taxonomía, inventory, split spec, execution plan, baseline readiness, label schema) | ✅ EXISTEN | `docs/ai/research_v2/` (18 docs) |
| `labels_v1.csv` | ❌ NO EXISTE | se genera (16 clases, 21.160 filas) |
| `split_lists/{train,validation,test}.csv` | ❌ NO EXISTE | se genera |
| `dataset_card.md` | ❌ NO EXISTE | se crea |
| `CHECKSUMS.sha256` | ❌ NO EXISTE | se crea |
| `split_report.md` | ❌ NO EXISTE | se crea |

---

## 10. ¿Qué metadata falta?

| Metadata faltante | Por qué se requiere | Quién la genera |
|---|---|---|
| `labels_v1.csv` | Etiquetas trazables por muestra (label_schema_v1) | Script mecánico (fase ejecución) |
| Conteos reales por clase (post-descarga) | Verificar la consistencia contra el inventario 35.24× | Script de verificación |
| `CHECKSUMS.sha256` | Integridad/vidra de la copia | Script de checksum |
| `split_lists/*.csv` | Particiones del benchmark | Script split_v1 |
| `dataset_card.md` | Ficha científica del dataset | Redacción (manual/IA) |
| Credencial Kaggle / fuente de descarga | Acceso al origen | Bernardo |

---

## ESTRUCTURA FINAL ESPERADA (v1/)

```
data/datasets/agriculture_images_tomato-potato-corn/v1/
├── RAW/                        [NO EXISTE]  ← bloqueante #1 (origen PlantVillage)
├── curated/
│   ├── train/                  [NO EXISTE]
│   ├── validation/             [NO EXISTE]
│   └── test/                   [NO EXISTE]
├── split_lists/
│   ├── train.csv               [NO EXISTE]
│   ├── validation.csv          [NO EXISTE]
│   └── test.csv                [NO EXISTE]
├── labels/
│   └── labels_v1.csv           [NO EXISTE]
├── holdout/
│   └── real_world_holdout_v1/  [NO EXISTE — reservar vacío, intocable]
├── manifests/                  [NO EXISTE — copiar 5 YAML canónicos]
└── CHECKSUMS.sha256            [NO EXISTE]
```

**Estado global de la estructura: 0 de 10 elementos EXISTE físicamente** (el directorio raíz `data/` tampoco existe aún). La infraestructura de diseño (manifests/specs) está completa al 100%.

---

## GROUND TRUTH

| Aspecto | Qué existe | Qué falta | Quién valida | Cómo validar |
|---|---|---|---|---|
| Origen (imágenes) | Solo el contrato de scope en manifiesto | **El material físico en disco** | Bernardo (descarga) | Checksum + conteo por clase = expected (21.160/16) |
| Etiquetas | Label schema_v1 (espec) | `labels_v1.csv` | Script + revisión minoritarias | Validación enum cerrado + doble revisión 4 clases críticas |
| Particiones | split_manifest (reglas) | split_lists + curated | Script split_v1 + gate anti-fuga | Conteos por clase×partición, dedup/pHash reportado |
| Modelo | `plant_disease_mbv2.h5` (heredado) | Benchmark 4 arquitecturas | Reporte benchmark | macro-F1 (primaria) + ECE (puerta) + curvas |
| Semántica | taxonomy_v1, contract EIARC | — (diseño completo) | Governanza | IDs versionados, compatible con contrato |

---

## BENCHMARK — preparación validada

| Arquitectura | Prepara dataset itself | Prepara entrenamiento | Prepara evaluación | Estado |
|---|---|---|---|---|
| **MobileNetV2** (control negativo) | ✅ código existe (`train_plant_disease_mobilenet.py`) | ⚠️ sin dataset | ⚠️ sin metrics framework | 🟡 **NO ejecutable (falta data)** |
| **MobileNetV3** (+TFLite edge) | ✅ diseño manifiesto | ⚠️ script no existe | ⚠️ edge assessment spec | 🟡 **NO ejecutable (falta data)** |
| **EfficientNet-B0** | ✅ diseño manifiesto | ⚠️ script no existe | ⚠️ metrics spec | 🟡 **NO ejecutable (falta data)** |
| **ResNet50** | ✅ diseño manifiesto | ⚠️ script no existe | ⚠️ — | 🟡 **NO ejecutable (falta data)** |
| **ConvNeXt-Tiny** | ✅ diseño manifiesto | ⚠️ script no existe | ⚠️ — | 🟡 **NO ejecutable (falta data)** |

**Conclusión benchmark:** el diseño está completo y correcto (manifiestos, metrics, edge policy), pero **ninguna arquitectura puede entrenar/evaluar sin el dataset**. El bloqueo no es de especificación sino de material adquisición.

---

## RIESGOS (clasificación)

| Riesgo | Clase | Severidad | Mitigación |
|---|---|---|---|
| El raw de PlantVillage NO está en la máquina ni en backups | **CRÍTICO** | Bloquea TODO el plan | Descargar de Kaggle/mirror; verificar checksum; no subir por git |
| Descarga sin credencial Kaggle | ALTO | Retrasa Fase 0 | Crear cuenta/credencial Kaggle API (o buscar mirror público) |
| Disco C: 21.8 GB libres — espacio ajustado para pipelines | MEDIO | Riesgo de almacenamiento medio plazo | Dataset ~2 GB es viable; planificar limpieza/gestiones |
| Confundir `ImagenesDx.csv` (clínico) con datos vegetales | BAJO | Error de fuentes | Nunca usar ese CSV; fuentes solo vía manifiesto |
| Fuga por grayscale/segmented si se descarga el completo | ALTO | Invalida el benchmark | Usar SOLO `raw/color` (regla del manifiesto) |
| Fuga near-dup en split | ALTO | Invalida métricas | pHash + dedup antes de particionar (gate bloqueante) |
| Colapso del modelo binario heredado contamina comparativas | MEDIO | Sesgo en el informe | Tratar MobileNetV2 solo como control negativo histórico |

---

## RESULTADO FINAL

### ¿Podemos comenzar mañana la materialización del Dataset V2?

**SI — pero solo la FASE 0 (preparación y adquisición). NO la fase de entrenamiento/benchmark.**

Justificación técnica:
1. **La gobernanza está 100% lista:** 5 manifests YAML verificados, specs de split/label/benchmark completos. No hay nada más que diseñar.
2. **El bloqueante único es físico:** el raw PlantVillage (`raw/color`, 21.160/16/3) no existe en esta máquina ni en el repo. Todo lo demás (labels, split, curated, benchmark) depende de ese origen.
3. **La adquisición es factible** (dataset público) pero requiere acción humana (credencial Kaggle o mirror) — por eso no es "arrancar y correr".
4. **LO QUE SÍ se puede hacer mañana sin más evidencia:** (a) descargar/recuperar PlantVillage `raw/color`, (b) verificar conteos vs manifiesto (21.160/16, ratio 35.24×), (c) crear la estructura `v1/` y `CHECKSUMS.sha256`, (d) copiar manifests, (e) reservar holdout. Con ese material, el día siguiente libera labels → split → curated → benchmark de forma mecánica.

---

## BONUS — CHECKLIST OPERATIVO DE 30 PASOS (secuencial, sin reinterpretar)

| # | PASO | OBJETIVO | ENTRADA | SALIDA | RIESGO | CRITERIO DE ÉXITO |
|---|---|---|---|---|---|---|
| 1 | Confirmar credencial Kaggle/mirror | Acceso al origen | Cuenta Kaggle | `kaggle.json` válido | Alto | API responde 200 |
| 2 | Descargar PlantVillage raw/color | Traer el material | URL Kaggle/mirror | `.zip` local | Alto | Archivo íntegro, tamaño >1 GB |
| 3 | Descomprimir a `v1/RAW/` | Estructura base | zip | 16 carpetas de clase | Alto | 21.160 archivos JPG |
| 4 | Conteo por carpeta clase | Verificar total | RAW/ | tabla conteo | Alto | Suma = 21.160 y 16 clases |
| 5 | Verificar clases = taxonomía cerrada | Cumplir scope | taxonomy_v1 | listado dif | Alto | Diferencia = vacío |
| 6 | Verificar exclusiones ausentes | No mezclar variantes | RAW/ | check grayscale/segmented | Alto | 0 archivos excluidos |
| 7 | Generar `CHECKSUMS.sha256` | Integridad | RAW/ | checksum file | Medio | Hash estable + documentado |
| 8 | Copiar 5 manifests canónicos a `v1/manifests/` | Referencia operativa | docs/ai/manifests/ | 5 YAML copiados | Bajo | Hash YAML = canónico |
| 9 | Crear árbol `v1/{curated,split_lists,labels,holdout}` | Estructura | — | directorios | Bajo | Árbol según plan |
| 10 | Reservar `holdout/real_world_holdout_v1/` vacío | Aislamiento | — | carpeta intocable | Medio | Fuera de todo split |
| 11 | Redactar `dataset_card.md` | Ficha científica | conteos + manifests | ficha | Medio | 21.160/16/3 + aviso "bootstrap ≠ campo" |
| 12 | Generar `labels_v1.csv` | Etiquetas trazables | taxonomía + RAW | CSV 8 campos | Alto | 21.160 filas, enum cerrado |
| 13 | Marcar 4 clases minoritarias `double_reviewed` | Calidad etiquetado | lista minoritaria | flag en labels | Medio | 4 clases marcadas |
| 14 | Dedup exactos (hash) | Anti-fuga | RAW | informe n duplicados | Alto | 0 duplicados intra-partición |
| 15 | pHash near-dup → grupos | Anti-fuga | RAW | informe grupos | Alto | Grupos en una sola partición |
| 16 | Generar split_v1 (70/15/15, seed 42) | Particiones | RAW+labels | split_lists/*.csv | Alto | `stratified_group_split`, conteo por clase |
| 17 | Verificar clases presentes en 3 particiones | Gate calidad | split CSVs | check | Alto | Ninguna clase ausente |
| 18 | Verificar cero fuga inter-partición | Gate | split CSVs | check | Alto | 0 hashes cruzados |
| 19 | Redactar `split_report.md` | Transparencia | split CSVs | reporte | Bajo | Conteos + dedup + fugas |
| 20 | Construir `curated/{train,val,test}/` | Datos listos | split CSVs + RAW | 3 carpetas | Medio | Copias/symlinks según membresía |
| 21 | Bloquear RAW/ reads (modo inmutal) | Preservar integridad | responsibilities | hash verificado | Bajo | Cambios de RAW = 0 |
| 22 | Declarar entorno (TF pinned, seed, GPU) | Reproducibilidad | — | env manifest | Medio | Versiones fijas documentadas |
| 23 | Registrar experiment_id | Traza | baseline_manifest | entrada registry | Bajo | `agriculture_v2_baseline_v1` |
| 24 | Entrenar EfficientNet-B0 | Benchmark | curated/train | resultados | Medio | macro-F1 + ECE registrados |
| 25 | Entrenar MobileNetV3-Large + TFLite | Benchmark+edge | curated | resultados + .tflite | Medio | Paridad cuantizada ≥ umbral |
| 26 | Entrenar ResNet50 | Control clásico | curated | resultados | Medio | macro-F1 + ECE |
| 27 | Entrenar ConvNeXt-Tiny | Techo | curated | resultados | Medio | macro-F1 + ECE |
| 28 | Evaluar MobileNetV2 en test (control negativo) | Basura histórica | test | metrics de contraste | Medio | No retraer; solo comparar |
| 29 | Publicar benchmark_report+calibration+error | Evidencia | todas las metrics | 3 reportes + model_cards + curvas | Bajo | MVP del checklist §11 |
| 30 | Decidir baseline master+edge | Decisión | reportes | dictamen GO/NO-GO campo | Alto | Baseline con calibración ECE OK |

**Umbral de ejecución:** los pasos 1–11 (Fase 0: adquisición y estructura) son los únicos que dependen de acción de Bernardo (credencial/descarga). Los pasos 12–30 son mecánicos una vez existe RAW.

---

*Inventario verificado físicamente. Solo inventariar y preparar: sin implementación, sin entrenamiento, sin código, sin commits.*