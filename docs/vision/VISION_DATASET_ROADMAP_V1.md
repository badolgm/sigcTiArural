# ROADMAP DEL DATASET VISUAL V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T19:17:32-05:00
> - Origen: misión `SIGCTIARURAL_VISION_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/vision/VISION_DATASET_ROADMAP_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: define versiones, fases, gates, compatibilidad con la plataforma y los 25 riesgos a 1.000.000 imágenes. No crea `v1/` visual, no descarga, no entrena.

**Misión:** `SIGCTIARURAL_VISION_GOVERNANCE_V1`
**Naturaleza:** documentación oficial de **gobernanza de roadmap visual**. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Fuentes:** `VISION_GOVERNANCE_V1.md` · `VISION_TAXONOMY_V1.md` · `VISION_LABELING_POLICY_V1.md` · `VISION_OOD_POLICY_V1.md` · `docs/governance/SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md` · `docs/acoustic/dataset_v2_roadmap.md` (patrón hermano).
**No hace:** no crea el directorio `v1/` visual, no descarga fuentes, no etiqueta, no entrena, no hace commits.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Fuente única de los 25 riesgos:** este documento §9. Los otros cuatro documentos visuales remiten aquí; no duplican la lista.

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Dataset visual materializado | **NO** — no existe `data/datasets/sigct_rural_visual/v1/` |
| Imágenes propias anotadas con taxonomía visual | **0** |
| Fuentes REF descargadas en esta misión | **0** |
| Modelo visual / YOLO / CNN | **NO existe, NO se crea** |
| Gates de fase cerrados | **0 / 8** |
| Estimaciones de almacenamiento | **ESTIMADAS**, no medidas |
| `OBSERVATION_ID` | **Intacto**; ninguna fase lo modifica |

> Un roadmap no es un dataset. Aquí se fija el camino; ejecutar cada fase requiere misión explícita.

---

# 1. Versiones hermanas y convivencia

## 1.1 Modelo de "versiones hermanas"

El ecosistema no quiere un "dataset visual v2" que reemplace al acústico. Quiere **versiones hermanas** bajo la misma plataforma de observaciones: audio y visión crecen en paralelo, sin competir y sin compartir escritura.

```
  OBSERVATION_ID  (raíz única, inmutable — Platform V1)
        │
        ├── audio/    ──► SIGCT_RURAL_ACOUSTIC v1  (INTACTO · 7 muestras) ──► v2 (gobernado, DISENO)
        │
        ├── image/    ──► SIGCT_RURAL_VISUAL v1    (NUEVO · DISENO · 0 imágenes)
        │                     ├── taxonomy: visual_v1_taxonomy
        │                     ├── labels:    DISENO, no materializado
        │                     └── REF:       PlantVillage · PlantDoc · IP102 · iNaturalist
        │
        └── video/    ──► contenedores con frame_ids[] (derived_from=video_id)
```

## 1.2 Contrato de versión visual

| Campo | Valor | Nota |
|---|---|---|
| `dataset_id` | `SIGCT_RURAL_VISUAL` | Hermano de `SIGCT_RURAL_ACOUSTIC` |
| `dataset_version` | `v1` | Reservado, **no materializado** |
| `taxonomy_version` | `visual_v1_taxonomy` | `VISION_TAXONOMY_V1.md` |
| `label_schema_version` | `visual_label_v1` | `VISION_LABELING_POLICY_V1.md` |
| `ood_bucket` | `evento_visual_desconocido` | `DISENO`, no creada |
| `coordinate_contract` | normalizado [0,1] | VG-10 |
| `evaluation_source` | **Solo captura propia** | REF nunca evalúa (VG-9) |

## 1.3 Barreras de no mezcla

| Barrera | Regla |
|---|---|
| Física | Raíces separadas: `observations/` vs `datasets/`; visual nunca escribe en acústico. |
| De esquema | `visual_v1_taxonomy` ≠ `acoustic_v1/v2_taxonomy`; `class_id` pueden coincidir en texto (`abeja`/`abejas`) pero se enlazan por `event_id`, no por unión de enumeraciones. |
| De evaluación | Las métricas propias se calculan solo sobre assets `REAL-LOCAL` propios; REF jamás entra. |
| De reporting | `dataset_state` visual ≠ `dataset_state` acústico; se reportan por separado. |
| De OOD | `desconocido_visual` ≠ `desconocido` (audio); carpetas distintas. |

---

# 2. Estructura física prevista (NO creada)

```
data/
├── datasets/
│   ├── sigct_rural_acoustic/
│   │   └── v1/                      ← INTACTO. 7 muestras. No se toca.
│   └─ (futuro) sigct_rural_visual/
│       └─ v1/                       ← RESERVADO. No se crea en esta misión.
│
└── observations/
    ├── inbox/v1/                     ← entrega PENDING_ACCEPTANCE (Platform §7)
    └── v1/
        └── obs_<session>_<seq4>/
            ├── audio/                ← audio del mismo acto de captura
            ├── image/                ← fuente de los assets visuales propios
            │   ├── image_....jpg
            │   └── image_manifest.json
            ├── video/
            │   ├── video_....webm
            │   └── video_manifest.json
            ├── telemetry/
            ├── metadata/
            │   ├── observation.json
            │   ├── observation_package.json
            │   └── delivery_manifest.yaml
            └── reports/              ← ACP/KH futuros; la captura no escribe aquí
```

> La estructura visual **no es nueva**: reutiliza exactamente la de la Observation Platform V1 §4.1. El roadmap no propone otra raíz ni otro flujo (VG-1, OBSV-1).

---

# 3. Fases (definidas, NO ejecutadas)

| Fase | Nombre | Objetivo | Gate de salida |
|---|---|---|---|
| **V0** | Gobernanza | Los 5 documentos existen y son visibles | G-VD-1 |
| **V1** | Contrato de assets | `image_`/`video_` con huella y `ObservationPackage` sin rotura | G-VD-2 |
| **V2** | Crosswalk REF | iNaturalist mapeado a `observation_id` con `source_card` y licencia | G-VD-3 |
| **V3** | Anotación humana | Primer lote etiquetado con AV-1..AV-11; κ `PENDING` honesto | G-VD-4 |
| **V4** | Sentinela OOD | Bucket `desconocido_visual` materializado por misión, 0 a demanda | G-VD-5 |
| **V5** | Split gobernado | Splits por `observation_id`, sin fuga de REF, `split_group_key` | G-VD-6 |
| **V6** | Escala piloto | 10.000 imágenes con integridad verificada | G-VD-7 |
| **V7** | Escala millón | 1.000.000 con los 25 riesgos mitigados | G-VD-8 |

## 3.1 Reglas de fase

| ID | Regla |
|---|---|
| PH-1 | Ninguna fase arranca sin misión explícita (VG-12). |
| PH-2 | Un gate no se cierra por "parece bien": requiere evidencia verificable. |
| PH-3 | Si un gate falla, se retrocede a la fase anterior con nota; **nada se borra**. |
| PH-4 | Cada fase produce un `delivery_manifest`, nunca escritura directa en `datasets/`. |
| PH-5 | V7 **no implica** modelo: escalar datos no es entrenar. |
| PH-6 | El orden V0→V7 es aditivo; las fases futuras no reescriben las anteriores. |

---

# 4. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado hoy |
|---|---|---|
| **G-VD-1** | 5 documentos visuales visibles en git con D-004.6 | `DISENO` (documentos listos; gate requiere verificación formal) |
| **G-VD-2** | `image_`/`video_` en `ObservationPackage`, plataforma intacta | `DISENO` |
| **G-VD-3** | ≥1 fuente REF con `source_card` + licencia + `original_id` | `DISENO` |
| **G-VD-4** | Lote anotado con AV-1..AV-11 y κ `PENDING` | `DISENO` |
| **G-VD-5** | Sentinela OOD creada por misión, nunca a demanda | `DISENO` |
| **G-VD-6** | Split sin fuga REF y por `observation_id` | `DISENO` |
| **G-VD-7** | 10.000 imágenes, 100 % huella verificada | `DISENO` |
| **G-VD-8** | 1.000.000 imágenes, 25 riesgos mitigados | `DISENO` |

> La existencia de este roadmap **no cierra ningún gate**.

---

# 5. Compatibilidad con Observation Platform V1

| Requisito de la plataforma | Cumplimiento del roadmap visual |
|---|---|
| Raíz `observation_id` inmutable (PL-1/OB-1..5) | Todas las fases cuelgan de la misma raíz; V5 divide por `observation_id` (§5.1). |
| 7 pasos de captura (Platform §3) | Sin cambios; el roadmap no añade pasos, solo especializa `image/`/`video/`. |
| Estructura física §4.1 | Reutilizada sin modificaciones (§2). |
| `ObservationPackage` inmutable, derivado (Platform §3.6) | El dataset visual se construye desde paquetes **derivados**, nunca los muta. |
| Handoff por `delivery_manifest` (P7-1..P7-5) | Cada fase entrega por manifiesto; estado `PENDING_ACCEPTANCE`. |
| Dataset acústico v1 intacto (CO-1..CO-6) | Barreras físicas y de esquema (§1.3). |
| Migración por envoltura (MIG-1..9) | El dataset visual **no migra nada**: nace nuevo; el acústico conserva su historia. |
| ACP/KH consumen por `observation_id` (ACP-1..8, KH-1..6) | Sin cambio; ver §6. |
| 7 estados canónicos | No se amplían; V0..V7 son estados de **proceso**, no de honestidad. |

## 5.1 Splits sin fuga

| Regla | Detalle |
|---|---|
| SPL-1 | El agrupamiento usa `observation_id` / `session_id` / `place_id`, **nunca** imagen individual suelta. |
| SPL-2 | Todas las imágenes de una observación van al **mismo** split. |
| SPL-3 | Los cuadros derivados de un video siguen a su video. |
| SPL-4 | Fuentes REF nunca se materializan en `train|validation|test` propios (VG-9). |
| SPL-5 | `holdout` queda reservado y sin uso, patrón del dataset acústico. |
| SPL-6 | Semilla y partición se declaran; cambiarlas crea una nueva versión, no reescribe la anterior. |

---

# 6. Consumo por ACP y Knowledge Hub

| Consumidor | Regla en el roadmap visual |
|---|---|
| **ACP** | Lee `ObservationPackage` por `observation_id`; cada afirmación lleva ancla; confianza = `MIN`; sin inferencia visual propia. V7 **no** activa al ACP: consume paquetes, no imágenes sueltas. |
| **Knowledge Hub** | `docsByObservation` derivado por lectura; el dataset visual **no escribe** en el registry; promoción gobernada para `doc_id`. |
| **Evidence Ledger** | Hoy vacío para visión; se llena solo con evidencia verificada, nunca con `prediction_id`. |
| **Veredictos** | `RESOLVED` · `PARTIAL` · `NO_DATA` · `BLOCKED` · `UNANSWERABLE` — sin crear nuevos. |

> El roadmap escala **evidencia**, no decisiones. Aumentar a 1.000.000 imágenes no autoriza al ACP a interpretarlas automáticamente.

---

# 7. Graduación de escala y honestidad de estimaciones

| Hito | Imágenes | Estado honesto de la cifra |
|---|---|---|
| Hoy | 0 | **Medido** |
| V3 (piloto de anotación) | ~500 | **Planificado** |
| V6 (piloto de escala) | 10.000 | **Planificado** |
| V7 (destino de diseño) | 1.000.000 | **Objetivo de diseño, NO medido** |

> No se afirma espacio, tiempo ni costo como dato real. Cualquier estimación de almacenamiento o esfuerzo se marca **`ESTIMADO`** y se recalcula con datos del piloto V6 antes de V7.

---

# 8. Criterios de éxito del roadmap

| # | Requisito | Sección | Estado |
|---|---|---|---|
| 1 | Versiones hermanas sin reemplazar el dataset acústico | §1 | ✅ |
| 2 | Estructura física sin romper la plataforma | §2 · §5 | ✅ |
| 3 | Fases y gates verificables | §3 · §4 | ✅ |
| 4 | Splits sin fuga de REF | §5.1 | ✅ |
| 5 | Consumo ACP/KH por `observation_id` | §6 | ✅ |
| 6 | **25 riesgos a 1.000.000 imágenes** | §9 | ✅ |
| 7 | Sin materializar `v1/` visual, sin descargas, sin IA | §0 · §10 | ✅ |
| 8 | `OBSERVATION_ID` intacto | §1 · §5 | ✅ |

---

# 9. Los 25 mayores riesgos de escalar a 1.000.000 imágenes

> **Única fuente de verdad.** Severidad: 🔴 bloqueante · 🟡 alto · 🟢 moderado. Umbral = señal para activar mitigación. Ninguno se resuelve con IA: todos se resuelven con gobernanza, proceso o verificacion.

| # | Riesgo | Sev. | Umbral | Mitigación |
|---|---|---|---|---|
| **R-01** | **Cuello de anotación humana.** 1.000.000 imágenes × doble revisión agota al equipo. | 🔴 | > 5.000 pendientes | V3 mide rendimiento real; lotes pequeños; κ `PENDING` honesto; nunca "autotiquetar" con modelo. |
| **R-02** | **Clases combinadas** introducidas por anotadores al escalar. | 🔴 | Cualquier `_con_`/`_bajo_`/`_en_`/`_y_` | NC-1 + AV-6 + fixture de rechazo (política §8); validación automática de token. |
| **R-03** | **Deriva de taxonomía**: distintos lotes usan vocabularios distintos. | 🔴 | > 1 `taxonomy_version` activa sin crosswalk | `taxonomy_version` obligatoria por anotación; alias `alias_of`; un bump = un crosswalk publicado. |
| **R-04** | **`scene_id` convertido en clase** (`paisaje_rural` como `class_id`). | 🔴 | Cualquier escena en enum de clase | VLP-6 / SCN-2; validación separada de ejes. |
| **R-05** | **Colisión de `OBSERVATION_ID`** al sincronizar offline. | 🔴 | Cualquier ID duplicado | Autoridad única con bloques reservados (PL-1/PL-11); prefijo de sesión; verificación global antes de V5. |
| **R-06** | **Escritura accidental en el dataset acústico v1.** | 🔴 | Cualquier cambio de hash en `v1/` | Raíces hermanas (CO-1); hash antes/después en cada fase; plataforma intacta. |
| **R-07** | **Fuga de fuentes REF** a splits propios. | 🔴 | 1 fila REF en `train|val|test` | SPL-4 + `source_tier` obligatorio + auditoría de split antes de cerrar G-VD-6. |
| **R-08** | **Privacidad**: personas/rostros sin `consent_id`, menores. | 🔴 | 1 imagen con persona sin consentimiento | VLP-8 / PER-1 / VOD-R5; bloque omitido + `PARTIAL`; prohibida biometría. |
| **R-09** | **EXIF con GPS/dispositivo** filtrado al escalar. | 🟡 | 1 archivo con EXIF sin saneado | `exif_policy` obligatoria (IMG-1); saneado por defecto; GPS a metadata gobernada. |
| **R-10** | **Integridad por huella** no verificada en todo el lote. | 🔴 | 1 `sha256` sin coincidir | P6-1/P6-5; verificación asset por asset; `BLOCKED` con ID culpable antes de aceptar lote. |
| **R-11** | **Coordenadas absolutas** que se rompen al cambiar resolución. | 🔴 | 1 caja fuera de [0,1] o sin `source_width/height` | VG-10 / BB-2/5; normalización obligatoria desde V3. |
| **R-12** | **Pérdida por "limpieza"** de datos dudosos. | 🔴 | 1 asset eliminado | VG-7 / CUR-2 / NADA DESAPARECE; corrección por `supersedes`, nunca borrado. |
| **R-13** | **Inferencia disfrazada de anotación** (`prediction_id`). | 🔴 | 1 `prediction_id` en el pipeline | VG-11 / AV-11 / VOD-R3; `BLOCKED`; la gobernanza prohíbe modelo en captura y etiquetado. |
| **R-14** | **κ fabricado** para aparentar acuerdo. | 🔴 | κ numérico con 0 pares reales | KAP-1..6; `PENDING` hasta pares reales; `BLOCKED` si se reporta sin n. |
| **R-15** | **Duplicación de bytes** (cuadros, pista de audio, copias de REF). | 🟡 | 1 cuadro sin `derived_from` | VID-1 / FRM-1/2; derivación perezosa; referencia por ID. |
| **R-16** | **Explosión de almacenamiento y transferencia** en laptop. | 🟡 | > 100 GB en un nodo | FS-8 formatos abiertos; lotes; estimaciones marcadas `ESTIMADO` y recalculadas en V6. |
| **R-17** | **Licencias por activo** en fuentes REF (iNaturalist por observación, NC/SA/ND). | 🔴 | 1 activo sin `source_card` o con `ND` | SRC-1..7; excluir `ND`, aislar `SA`, marcar `NC`; verificación por activo antes de V2. |
| **R-18** | **`original_id` sobrescrito** al importar REF. | 🔴 | 1 `original_id` vacío o distinto | AS-4 / SRC-1; inmutabilidad de procedencia; crosswalk de lectura. |
| **R-19** | **Doble escritura KH ↔ observación.** | 🟡 | 2 índices apuntando lo mismo | KH-1 / MP-8; `docsByObservation` derivado por lectura, fuente única. |
| **R-20** | **`visual_event_id` convertido en raíz competidora** de `event_id`. | 🔴 | 1 `evt_` sin `event_id` resoluble | VEV-1 / OBSV-5; vista tipada, no entidad nueva; validación de resolución. |
| **R-21** | **Sentinela OOD capturada a demanda** para llenar cupos. | 🔴 | Cualquier captura con `evento_visual_desconocido` como objetivo | VG-6 / VOD-A6; asignación solo por veredicto humano; bucket sin cupos. |
| **R-22** | **Promoción OOD sin gobernanza** (clase nueva por decisión de anotador). | 🔴 | 1 `class_id` nuevo sin misión | VOD-P5 / TAX-7; requiere bump + crosswalk + misión explícita. |
| **R-23** | **Deriva de `consent_id`** en videos con audio y cuadros. | 🟡 | 1 derivado sin heredar consentimiento | VLP-8 + FRM-2; herencia de consentimiento por `observation_id`. |
| **R-24** | **Rehidratación imposible**: cambiar esquema y perder el pasado. | 🔴 | 1 campo renombrado sin alias | TAX-5 / MIG-1 / VG-2; IDs opacos sin semántica de esquema; alias y bump. |
| **R-25** | **Escalar se interpreta como autorización de IA/YOLO/CNN.** | 🔴 | 1 `model_id`/`prediction_id` en el roadmap ejecutado | VG-11 / PH-5 / §0; escalar datos ≠ entrenar; cada modelo requiere gobernanza y misión propias. |

## 9.1 Distribución de severidad

| Severidad | Cantidad | IDs |
|---|---|---|
| 🔴 Bloqueante | 20 | R-01..R-08, R-10..R-14, R-17, R-18, R-20..R-22, R-24, R-25 |
| 🟡 Alto | 5 | R-09, R-15, R-16, R-19, R-23 |
| 🟢 Moderado | 0 | — |

> Nota de conteo: 20 bloqueantes + 5 altos = 25. La fila 🟢 se mantiene con 0 para hacer explícito que no hay riesgos menores ignorables.

---

# 10. Fixtures de rechazo del roadmap

| Fixture | Resultado esperado |
|---|---|
| Fila REF en split propio | `BLOCKED` (R-07) |
| `sha256` sin coincidir en un lote | `BLOCKED` con ID culpable (R-10) |
| Caja con coordenadas absolutas | `REJECTED` (R-11) |
| `class_id` compuesto en lote grande | `REJECTED` (R-02) |
| κ con 0 pares | `BLOCKED` (R-14) |
| `prediction_id` en anotación | `BLOCKED` (R-13) |
| Captura OOD con cupo | `REJECTED` (R-21) |
| Cambio de hash en dataset acústico v1 | `BLOCKED` (R-06) |
| `evt_` sin `event_id` | `BLOCKED` (R-20) |

---

# 11. Cierre

El roadmap define un camino de ocho fases desde la gobernanza hasta 1.000.000 imágenes **sin crear hoy ni un solo directorio de dataset**, sin descargar, sin anotar y sin entrenar. Las versiones son hermanas, la plataforma sigue intacta, los splits se agrupan por `observation_id`, y los 25 riesgos tienen umbral y mitigación verificables.

**Criterio de éxito:** primera gobernanza visual capaz de crecer 10 años **sin modificar `OBSERVATION_ID`**. Se cumple porque cada fase cuelga de la misma raíz y porque ninguna mitigación exige reescribir el pasado: todo se resuelve con `supersedes`, alias, bumps y manifiestos.

**Estado honesto:** **`DISENO`**, 0/8 gates cerrados, 0 imágenes, 0 modelos. Sin commit, push, merge ni tag.

---

*Fin del roadmap visual. Complementa —nunca sustituye— la gobernanza visual V1, la taxonomía, la política de etiquetado, la política OOD, la Observation Platform V1 y la gobernanza acústica V2.*
