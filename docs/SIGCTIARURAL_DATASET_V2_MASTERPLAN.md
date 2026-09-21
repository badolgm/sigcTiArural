# SIGCTiArural — Masterplan de Materialización del DATASET V2

**Documento:** SIGCTIARURAL_DATASET_V2_MASTERPLAN
**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry` (trabajo commiteado hasta `0989ec9`; ver `AGENTS.md` para estado git vivo)
**Tipo:** Plan de investigación científica y de ingeniería de datos (MISIÓN PRE-SESIÓN IA/ML).
**Regla suprema:** NO IMPLEMENTAR · NO MODIFICAR CÓDIGO · NO MODIFICAR DOCUMENTOS EXISTENTES · NO CREAR RUTAS/PÁGINAS · NO TOCAR FRONTEND. **Solo diseñar y documentar.** (*La mención "working tree limpio" del original fue actualizada 2026-09-21 por STATE SYNCHRONIZATION: hoy el árbol tiene `Dashboard.jsx` M + `dashboard_rc2_ui.patch`, asunto RC-2/UX independiente de este plan.*)

**Fundamento rector:** La auditoría `SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md` determinó que el cuello de botella científico es **la data**, no la arquitectura, ni el frontend, ni la IA, ni el ML, ni el hardware. Este plan diseña el camino para materializar **DATASET V2** como siguiente paso del ecosistema, en plena coherencia con el canónico (`research_v2`, UBTN, EIARC, gobernanza MLOps).

---

## 0. Tesis central del plan

> Un dataset no es una colección de imágenes: es un **artefacto científico versionado** con taxonomía, esquema de etiquetas, particiones, métricas de calidad, procedencia y gobernanza. Dataset V2 debe nacer **bootstrap de laboratorio** (PlantVillage auditado, 21.160/16/3) y evolucionar hacia **datos propios de campo** — sin nunca presentar el bootstrap como validez de campo (invariante de honestidad canónico).

El objetivo de estos próximos 90 días es pasar de "dataset en diseño" (0 bytes físicos) a **"dataset v1 materializado + split v1 generado + primera evidencia de benchmark reproducible"**.

---

## 1. ¿Qué dataset necesitamos realmente?

### Necesidad inmediata (90 días) — bootstrap de laboratorio
| Aspecto | Definición | Fuente |
|---|---|---|
| **Identidad** | `agriculture_images_tomato-potato-corn_taxonomy-v1_labels-v1_dataset-v1` | `AI_DATASET_STRATEGY_V2.md §4.4` |
| Contenido | 21.160 imágenes RGB, 16 clases, 3 especies (tomate 9, papa 3, maíz 4) | Inventario V2 |
| Origen | `PlantVillage-Dataset-master/raw/color` (subset auditado, sancionado como bootstrap) | Discovery audit §12.3 |
| Exclusiones obligatorias | `raw/grayscale`, `raw/segmented`, `generated_for_paper`, clase Spider-mite | Execution Plan §scope |
| Natura | **Bootstrap para benchmark controlado** — NO validez de campo | Inventario §5.3 |

### Necesidad estructural (post-90 días) — pipa de datos propios
- **Agricultura propia:** imágenes tomadas en campo/lab SIGC&T con protocolo de captura (3 especies + extensión regional cacao/café/banano en oleada 5 años).
- **Telemetría/UBTN:** series temporales etiquetadas (collares, corrales, colmenas, piscicultura) — sin gold standard hoy (gaps IA1/IA2).
- **Knowledge:** corpus estructurado para RAG local gobernado (`AI_CONTEXT_V2_ARCHITECTURE.md §11.2`).

**Respuesta corta:** necesitamos primero un **dataset bootstrap versionado y reproducible** (para el benchmark V2), y diseñar simultáneamente la **pipa de captura propia** que lo reemplace como fuente de evidencia de campo.

---

## 2. ¿Qué problema científico resolverá?

| Problema | Cómo lo resuelve Dataset V2 |
|---|---|
| Colapso del modelo binario (severidad crítica) | Un modelo multiclase real (16 clases) reemplaza al colapsado; provee distribución sobre condiciones reales |
| Ausencia de evidencia empírica (0 corridas de entrenamiento) | Desbloquea el primer entrenamiento reproducible con métricas publicables |
| Falta de gold standard / validación | Define ground truth inicial por etiqueta validada (bootstrap) y protocolo de validación a campo |
| Imposibilidad de MLOps real | Los manifiestos + fits + datasets versionados dan los primeros datos operativos para tracking/registry |
| Incompatibilidad de contratos | Valida el contrato semántico EIARC y el `scientific_scope: taxonomic` (evolución del `binary_only`) |
| Desalineación UI vs modelo real | Permite la corrección científica end-to-end (resolvedor ✔, UI pendiente) con un modelo que sí produce lo que la UI mostrará |

---

## 3. ¿Qué especies o dominios cubrirá?

### Fase principal (v1 — PlantVillage bootstrap)
**Tomato (9):** healthy, early_blight, late_blight, leaf_mold, septoria_leaf_spot, bacterial_spot, target_spot, mosaic_virus, yellow_leaf_curl_virus.
**Potato (3):** healthy, early_blight, late_blight.
**Corn (4):** healthy, cercospora_gray_leaf_spot, common_rust, northern_leaf_blight.

(Verificado contra `AGRICULTURE_AI_V2_TAXONOMY.md`; 16 clases cerradas por taxonomy_v1.)

### Dominios futuros (plan 3–5 años — `SIGCT_RURAL_AI_RESEARCH_PROGRAM_V2.md`)
| Dominio | Línea del programa | Estado de dataset |
|---|---|---|
| Cultivos (cacao/café/banano) | Agriculture AI (oleada regional) | Diseño |
| Animales de granja (collares V1-V4) | Animal Health AI | Diseño (RI-18) |
| Abejas (acústica de colmenas) | Audio Intelligence | Diseño (RI-14) |
| Peces (piscicultura Fase 9) | Telemetría/Acústica | Diseño (RI-15) |
| Señales de laboratorio | Signal Intelligence | Diseño |
| Mosquitos/plagas | Agriculture AI extensión | No referenciado — marcar como oportunidad pendiente en backlog, sin inventar |

---

## 4. ¿Qué datos deben capturarse?

### Para el bootstrap v1 (ya especificado, resta materializar)
- 21.160 RGB de `raw/color` (sin derivadas grayscale/segmented).
- Manifiestos: `raw_source_manifest`, `curation_manifest`, `taxonomy_binding_manifest`, `split_manifest`, `baseline_experiment_manifest`.
- Particiones: `train/validation/test` 70/15/15 estratificadas, anti-fuga (seed 42, `stratified_group_split`, pHash dedup).

### Para la pipa de datos propios (protocolo a diseñar)
| Tipo de dato | Qué capturar | Justificación científica |
|---|---|---|
| Imagen de hoja/cultivo | Foto estándar (posicion, luz, fondo definido), múltiples vistas por planta, metadata EXIF + geolocalización | Consistencia de captura; permite estudiar invarianza a condiciones |
| Series fisiológicas (collar/corral) | T°, HR/FC, FR, SpO₂, actividad (IMU), rumia — con timestamp y `source_context` (`bio`) | Gaps B1 (basal bovino trópico 7 días/10 cabezas) |
| Acústica | Grabaciones de colmena/piscicultura con evento etiquetado | RI-14/RI-15 |
| Audio de laboratorio | Señales con trigger experimental documentado | Línea Signal Intelligence |
| Datos demográficos operativos | Especie, edad, sexo, finca (sujeto a Identity/FacilityId futuro) | Asociación nodo→finca (A-6) |

**Regla dorada de captura:** todo dato debe poder volverse **evidencia verificable** (procedencia + estado honesto + consentimiento), no "ruido de archivo".

---

## 5. ¿Qué NO debemos capturar?

1. **Raw grayscale/segmented del PlantVillage** — ya excluidos (nº informativo para la taxonomía visual, no para entrenar).
2. **`generated_for_paper`** — no usado como fuente de verdad.
3. **Clase Spider-mite** — excluida por decisión de inventario.
4. **Datos simulados pasados como reales** — `source_mode=simulated` solo como demo separada (invariante de honestidad).
5. **Series temporales sin limpiar en puerta C de la arquitectura** — `timeSeries door C` es deuda irreversible (ADR-18, ≥10M filas); diseñar, no abrir.
6. **Datos biométricos sin consentimiento** — gobernanza RI-17 (retención, consentimiento multi-actor, seudonimización). Sin acuerdo → no capturar.
7. **Rosetas de datos de otra máquina** — el dataset auditado vive en `C:\Users\Devbadolgm\...` (máquina anterior): **copiar a `data/datasets/` con manifiesto o no usarlo**.
8. **Datos de campo sin validación experta** declarados como validez — false overclaiming prohibido por RSK-REG-02.

---

## 6. ¿Cómo etiquetar?

### Esquema oficial existente — usar, no reinventar
`agriculture_v2_label_schema_v1` (campos: `sample_id`, `taxonomy_version`, `species`, `condition_group`, `condition_name`, `health_state`, `annotation_quality`, `validation_source`). Fuente: `AGRICULTURE_AI_V2_LABEL_SCHEMA.md`.

### Estrategia de etiquetado bootstrap
- **Etiquetas de origen:** usadas tal cual (proceden del dataset auditado), registrando `annotation_quality` y `validation_source=source_dataset_audited`.
- **Doble revisión:** muestras de riesgo (las 4 minoritarias: papa healthy=152, tomate mosaic=373, tomate septoria=443, maíz gray=513) con revisión de un segundo anotador.

### Estrategia de etiquetado propietario (diseño)
- **Anotadores:** estudiantes ADSO supervisados por experto agrónomo (máx 2-3 por lote, definición de consenso).
- **Protocolo:** guía de anotación con ejemplos canónicos por clase + preguntas de control (competencias).
- **Esquema de eventos temporales** (UBTN): etiquetado por evento clínico observado (cojera, celo, estrés) — ground truth anclado en observación, no en predicción.

---

## 7. ¿Cómo validar etiquetas?

### Bootstrap v1
| Nivel | Método | Umbral |
|---|---|---|
| Sanidad de origen | Estadísticas de distribución por clase vs inventario auditado | match 100% con inventario |
| Dedup | pHash near-duplicate detection + dedup | 100% de duplicados removidos |
| Consentimiento taxonómico | Todo `condition_name` dentro del enum cerrado taxonomy_v1 | 100% |
| Partición | Stratified 70/15/15, censos por clase publicados | sin fuga entre splits |

### Propietario (futuro)
- **Inter-anotador:** Cohen's Kappa por clase; umbral ≥0.8 (sana), ≥0.7 (enfermedades ambiguas).
- **Experto:** revisión de 100% de etiquetas discordantes; 10% aleatorio de las concordantes.
- **ValidacionRetention:** `real_world_holdout_v1` externo e intocable durante entrenamiento (Execution Plan §9.3).
- **Triangulación:** etiqueta de imagen + registro clínico/lab (para series) cuando exista.

---

## 8. ¿Cómo generar ground truth?

### Ground truth bootstrap (sancionado, limitado)
- Ground truth = etiqueta del dataset auditado + dedup + revisión de minoritarias. **Es verdad de laboratorio, no de campo.**

### Ground truth de campo (protocolo de diseño)
| Dominio | Ground truth | Método de adquisición |
|---|---|---|
| Enfermedades de hoja | Diagnóstico por fitopatólogo + cultivo/prueba confirmatoria | Captura colaborativa con técnicos SENA |
| Salud animal (collares) | Observación clínica veterinaria correlacionada con series | Registro de eventos de campo (RI-18) |
| Colmenas/peces | Inspección técnica + contador de eventos | Protocolo RI-14/RI-15 |
| Señales de laboratorio | Trigger experimental + instrumentación conocida | Estación de laboratorio SIGC&T |

**Principio de ground truth:** etiqueta = evidencia trazable a una observación o prueba, con `validation_source` explícito. Sin evidencia → sin etiqueta de verdad.

---

## 9. ¿Cómo versionar datasets?

Adoptar el diseño de gobernanza canónico (`AI_MLOPS_AND_TRAINING_GOVERNANCE_V2.md`):
- **Manifiestos versionados** (`major/minor/patch`): naming `theme_context_taxonomy-v1_labels-v1_dataset-v1`.
- **Estados del dato:** raw → staged → curated → feature_ready → evaluation_ready → archived.
- **Cadena de trazabilidad:** raw → manifest → split_version → feature_version → experiment_id → model_version → validation_report → deployment_target.
- **Objetos inmutables:** nadie modifica un dataset publicado; el cambio crea una versión nueva con manifiesto propio.
- **Split versionado:** `split_v1` inamovible para el benchmark; cualquier re-split = `split_v2` con justificación científica.

**Rol del Git:** datasets NO se versionan por Git (binarios); se versionan por **manifiestos + checksum** (hash de carpeta/imagen) y se publican como releases de `data/datasets/`.

---

## 10. ¿Cómo gobernar datasets?

Adoptar los 4 pilares de MLOps governance (ubicación de datos por contexto/modality/lifecycle) y añadir gobernanza del propio artefacto:
| Área | Regla |
|---|---|
| Procedencia | Todo dataset con manifiesto de origen + checksum |
| Autoridad | Nadie crea dataset sin manifiesto y revisión; el cambio pasa por el flujo de gobernanza del programa V2 |
| Cambios | Versionados e inmutables; `data freeze` para experimentos activos |
| Consentimiento | Datos biométricos de humanos/animales con consentimiento multi-actor (RI-17) y seudonimización |
| Retención | Default 90 días para series crudas (D1) hasta acuerdo multi-actor (ADR-16) |
| Publicación | Datasets propios = activo de I+D+i formal (evidencia SENA) |
| Auditoría | Registro en `docs/ai/manifests/` + entrada en Inventory; cada dataset referenciable por su ID |

---

## MACHINE LEARNING — diseño de entrenamiento/validación/benchmark

### Entrenamiento (diseño, no ejecutar aún)
| Aspecto | Diseño canónico |
|---|---|
| Arquitecturas | EfficientNet-B0 (master), MobileNetV3-Large (edge), ResNet50 (control), ConvNeXt-Tiny (techo), all transfer learning, 224×224, batch 32 | 
| Marco hardware | GPU RTX 3060/4060/4070 (1-10 h) / CPU 8-40+ h; min 32 GB RAM |
| Equilibrio de clases | weighted loss + class-balanced sampling + augmentation dirigida a minorías; prohibido undersampling ciego / oversampling / mixup/cutmix por defecto |

### Métricas y validación
- **métrica primaria:** **macro-F1** (no accuracy). **secundarias:** balanced accuracy, per-class recall/precision, weighted F1, confusion matrix.
- **curvas:** ROC one-vs-rest, PR por clase (obligatorio en minoritarias), calibration curve.
- **calibración:** ECE (expected calibration error) obligatorio como puerta de promoción; "buen macro-F1 sin calibración = NO promovible".

### Benchmark
- GO condicionado ya otorgado (laboratorio controlado) — ejecutar solo tras materializar dataset + split_v1. 
- Comparación solo entre modelos con mismo dataset/split/taxonomía.

### Desbalance de clases
Las minoritarias (4) reciben: evaluación por PR, recall por clase en reporte, y **no** se balancea agresivamente; se documenta el sesgo y se planifica dataset propio de campo para esas clases (la mejor cura del desbalance es más datos reales, no magia).

---

## UBTN — cómo encaja Dataset V2 en el futuro UBTN

| Dominio UBTN | Encaje con Dataset V2 | Fase |
|---|---|---|
| **Abejas** (consciencia acústica) | Plantilla bootstrap V2 → dataset acústico etiquetado (RI-14) | P2, audio |
| **Peces** (piscicultura) | Protocolo de captura/ground truth de Dataset V2 reutilizado para sensores OD/pH (RI-15) | P2 |
| **Mosquitos / plaga** | Línea Agriculture ext. → categoría visual + protocolo de captura (oportunidad a documentar en backlog) | 5 años |
| **Bioseñales** (collar V1-V4) | Mismo esquema `source_context` + label schema por eventos clínicos; ground truth por observación (RI-18) | U6 |
| **Audio** | Esquema label de Dataset V2 extendido a multicanal + evento temporal | P2 |
| **Telemetría** | El "dataset V2 de telemetría" es la **serie limpia por sujeto** etiquetada (EDGE strategy §6.1); U6 depende de P0 (rangos) + RI-18 | U6 |
| **Edge AI** | Un modelo adecuado en edge = MobileNetV3 quantizado (TFLite int8) entrenado sobre dataset Versionado V2; la exportación → eje de evaluación (notebook `14_edge_assessment`) | post-U7 |

**Lectura clave:** Dataset V2 es el **primer eslabón de una cadena de datasets por dominio**, no la última; su valor para UBTN está en establecer el *patrón* (manifiesto → split → ground truth → benchmark → edge eval).

---

## LLM — rol real (justificación)

| Rol | Decisión | Justificación |
|---|---|---|
| **Tutor** | ⚠️ No diseñado; si se adopta: como asistente sancionado de laboratorio sobre datasets/protocolos verificados | El sistema es conocimiento verificable; tutor libre contradiría la identidad |
| **RAG** | ✅ Sí — el rol primario: **RAG local/gobernado sobre el Knowledge Hub** (51 docs) | `AI_CONTEXT_V2_ARCHITECTURE.md §11.2`: explicación y síntesis sobre evidencia propia |
| **Investigador** | ✅ Como asistente de investigación (no un investigador autónomo) | Puede resumir hallazgos, armar estructuras de paper, revisar coherencia — siempre con fuentes trazables |
| **Asistente de laboratorio** | ✅ Sí — ej. ayudar a etiquetar, validar manifiestos, redactar protocolos | Reduce fricción operativa sin tocar el motor predictivo |
| **Generador de hipótesis** | ⚠️ Limitado/supervisado | Puede proponer hipótesis (arrelo a datos existentes), pero la validación es empírica obligatoria |
| **Motor predictivo** | ❌ **Nunca** | `AI_CONTEXT_V2_ARCHITECTURE.md §11.5`: "LLM solo para explicación y síntesis, nunca como sustituto del motor predictivo principal" |

**Regla LLM del ecosistema:** los LLM son capa de *interfaz cognitiva* sobre evidencia verificable; la predicción la hace ML entrenado sobre Dataset V2 (y derivados), no generación.

---

## RIESGOS

### Científico
- R-C1: Bootstrap de laboratorio presentado como validez de campo (violación de honestidad). **Mitigación:** invariante de estado + `real_world_holdout`.
- R-C2: Desbalance severo (35.24×) sesga el modelo hacia clases mayoritarias. **Mitigación:** macro-F1, PR por clase, más datos reales.
- R-C3: Overfitting por fuga entre splits. **Mitigación:** pHash dedup + stratified_group_split + holdout intocable.

### Técnico
- R-T1: Dependencia del dataset en la máquina antigua (ruta inexistente). **Mitigación:** manifiesto + descarga controlada en `data/datasets/` con checksum.
- R-T2: Reproducibilidad (sin GPU, runtime versión). **Mitigación:** seed 42, TF pinned, notebook roadmap (16 notebooks), manifiesto de entorno.
- R-T3: `AI_PIPELINE.md` tiene rutas desactualizadas (`src/backend/ai_service/...` inexistente). **Mitigación:** corregir en docs de materialización (no alterar el canónico sin proceso — registrar como hallazgo).

### Académico
- R-A1: Entrega ADSO sin evidencia reproducible. **Mitigación:** el dataset + manifiestos + benchmark = evidencia I+D+i formal.
- R-A2: Alcance sobredimensionado en 90 días. **Mitigación:** plan enfocado (materializar v1 + split_v1 + benchmark de 4 arquitecturas; campos después).

### Ético
- R-E1: Datos biométricos/animales sin consentimiento (RI-17). **Mitigación:** prohibido capturar bioseries sin acuerdo; seudonimización.
- R-E2: Diagnósticos mostrados sin respaldo del modelo real (incidente ya existente). **Mitigación:** corrección científica completa antes de exponer resultados a campo.

---

## RESULTADO FINAL — La UNA cosa (90 días)

**Si Bernardo solo trabajara en una cosa los próximos 90 días → materializar el DATASET V2 + ejecutar el benchmark de laboratorio agrícola.** Concretamente:

1. **Materializar `agriculture_v2_dataset_v1`:** obtener PlantVillage audito → `data/datasets/` con manifiesto + checksum; aplicar curation y taxonomy_binding; generar `split_v1` (70/15/15, anti-fuga) con censos por clase publicados.
2. **Ejecutar benchmark baseline:** EfficientNet-B0 / MobileNetV3-Large / ResNet50 / ConvNeXt-Tiny con macro-F1 + ECE; publicar reporte de evaluación científica; decidir baseline master+edge.
3. **Costruir la pipa de datos propios:** diseñar protocolo de captura de campo (para que el siguiente trimestre ya capturen datos SIGC&T reales).

**Justificación con evidencia de toda la documentación canónica:**
- La auditoría IA/ML SOTA marca la data como **único cuello de botella** (`SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md §9, §10`).
- `AGRICULTURE_AI_V2_BENCHMARK_READINESS.md §5` otorga **GO condicionado** a laboratorio — el único GO materializable hoy sin hardware ni campo.
- `AGRICULTURE_AI_V2_EXECUTION_PLAN.md` define **6 fases**; las 3 primeras (dataset→split→benchmark) son exactamente este plan: ya especificadas, ejecutables.
- El `AI_DATASET_DISCOVERY_AND_AUDIT.md` verifica fit "como bootstrap para benchmark controlado" (`§12.3`) → el material ya existe auditado.
- UBTN `RESEARCH_GAPS IA1/IA2` difiere IA hasta que exista dataset etiquetado → la cadena científica completa (UBTN, audio, telemetría) **depende de que este plan ocurra**.
- La gobernanza (`AI_MLOPS... §31.1`) necesita un dataset real para que cualquier tracking/registry/monitoring tenga sentido.
- El colapso crítico del binario solo se cura con un multiclase real entrenado sobre Dataset V2 (corrección científica end-to-end).

**En una frase:** el primer trimestre de materialización científica de SIGCTiArural es **producir, versionar y evaluar `agriculture_images_tomato-potato-corn_v1` hasta obtener un baseline reproducible sobre el cual construir todos los demás dominios — y sembrar la pipa de captura propia que convertirá bootstrap en evidencia de campo.**

---

*Plan maestro de diseño para la materialización del Dataset V2. Pre-sesión IA/ML. Sin implementación, sin modificación de código ni documentos existentes, sin commits.*