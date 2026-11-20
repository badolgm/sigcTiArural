# ROADMAP DEL DATASET V2 — SIGCT-RURAL (DOCUMENTACIÓN OFICIAL DE GOBERNANZA)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:17:38-05:00
> - Origen: `.local_backups/SIGCTIARURAL_ACOUSTIC_TAXONOMY_EXPANSION_V1.md` (propuesta aprobada conceptualmente)
> - Destino: `docs/acoustic/dataset_v2_roadmap.md` (NUEVO — listo para promoción futura)
> - Nota: define fases, gates, compatibilidad y materialización futura. No crea `v2/`, no implementa código.

**Misión:** `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_V2`
**Naturaleza:** documentación oficial de **gobernanza de roadmap**. **NO** crea el directorio `v2/`, **NO** modifica `schema.json`/`labels.csv`/`metadata.csv`, **NO** captura audio, **NO** entrena, **NO** hace commits.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `c5bcaeb`
**Fuentes:** `docs/acoustic/taxonomy_v2.md` · `labeling_policy_v2.md` · `secondary_classes_v2.md` · `ood_policy_v2.md` · `annotation_protocol_v2.md` · `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` · `Documentacion/Arquitectura/CMSC_ORCHESTRATION_V2_DESIGN.md` (flujo oficial S30 → Logger → Dataset → Validación → S81 → S82 → Knowledge Hub).
**Estado:** **LISTO PARA PROMOCIÓN FUTURA** — gobernanza completa; ejecución pendiente de misiones explícitas.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Honestidad de estado:** `v2/` **no existe hoy**. Ninguna fase de este roadmap se ha ejecutado. Todo lo aquí descrito es `DISENO`/`PENDING`.

---

# 0. Propósito

Convertir la taxonomía v2 gobernada en un plan de materialización **aditivo y reversible**, sin romper el dataset v1 real (7 muestras). Define:

1. la estructura futura `v2/` como directorio **hermano**,
2. las fases y sus gates,
3. la compatibilidad estricta con v1,
4. los prerrequisitos que hoy bloquean la ejecución,
5. qué **no** está autorizado todavía.

---

# 1. Estado real al día de hoy

| Hecho | Valor |
|---|---|
| Directorio vigente | `data/datasets/sigct_rural_acoustic/v1/` (fuera de git, `.gitignore:68`) |
| `dataset_state` | `CAPTADO_INICIAL` |
| Muestras reales | **7** (`silencio` 2 · `lluvia` 3 · `voz` 1 · `ruido_desconocido` 1) |
| `schema_version` | `1.3.0` |
| `taxonomy_version` | `acoustic_v1_taxonomy` |
| `label_schema_version` | `acoustic_v1_label_schema` |
| Gates G-DS-1..6 | 0/6 cerrados (G-DS-1 `FAIL` por 7 MIDs `UNVERIFIED`; G-DS-6 `PENDING` sin κ) |
| S81 / S82 | `DISENO` |
| `rules-v0` | Vigente en v1; sin cambios |
| `v2/` | **NO existe** |
| Código | Intacto en esta misión |

---

# 2. Estructura futura (DISEÑO — no creada)

```
data/datasets/sigct_rural_acoustic/
├── v1/                          ← INTACTO, nunca se reescribe
│   ├── metadata/                (schema.json 1.3.0, labels.csv v1, metadata.csv 7 filas)
│   ├── raw/                     (7 WAV)
│   ├── features/                (acoustic_features_v2.csv, 7 vectores, 44 dims)
│   └── manifests/
└── v2/                          ← DIRECTORIO HERMANO (futuro, NO creado hoy)
    ├── metadata/
    │   ├── schema.json          (bump: taxonomy_v2 enums; columnas 42/42 intactas)
    │   ├── labels.csv           (61 class_id: 37 canónicas + 22 subclases + 2 alias)
    │   └── metadata.csv         (taxonomy_version=acoustic_v2_taxonomy)
    ├── raw/<dir_name>/
    ├── features/
    ├── manifests/
    └── split_lists/
```

**RM-1 · Hermandad, no sustitución.** `v2/` se crea **al lado** de `v1/`. Nunca se renombra, mueve ni borra `v1/`.

**RM-2 · Un dataset, una versión por fila.** Cada fila declara `taxonomy_version` + `label_schema_version` + `dataset_version`. Un split nunca mezcla versiones sin declararlo.

**RM-3 · Sin reescritura de v1.** Las 7 filas reales y sus hashes permanecen. Ningún `sample_id` se regenera.

---

# 3. Contrato de versión (reglas de bump)

| Cambio | Acción obligatoria |
|---|---|
| Añadir/quitar clases (hecho: 9 → 61) | `taxonomy_version=acoustic_v2_taxonomy` · `label_schema_version` nueva · `dataset_version=v2` |
| Columnas obligatorias, nombres u orden | `schema_version 2.0.0` + `dataset_version v2` |
| Añadir columna opcional/derivada | `schema_version` minor; `dataset_version` sigue v1 |
| Cambiar clip contract (sample_rate, duration_s, n_fft, hop) | `dataset_version v2`; invalida features |
| Cambiar `feature_schema`/`window_schema` | `acoustic.feat.v2` / `window.v2` + `dataset_version v2` |
| Usar `secondary_classes` (columna existente) | **Sin bump de esquema**; gobernanza v2 |
| Toda modificación de contrato | Actualizar huella SHA-256 + tabla de trazabilidad **en el mismo cambio** (regla de invalidación) |

**RM-4 · 42/42 columnas.** El número y orden de columnas de `metadata.csv` se conserva. La expansión es de **valores** (enum de `class_id`), no de columnas.

**RM-5 · Enum aditivo.** El enum v2 es la unión de los 9 IDs v1 + los nuevos. Ningún valor se quita (regla: *"nunca se quitan valores existentes en < 2.0.0"*).

---

# 4. Fases del roadmap

> Todas las fases están **PENDIENTES**. Ninguna autoriza código por sí misma; cada una requiere misión explícita.

## FASE 0 · Gobernanza (ESTA MISIÓN) — ✅ COMPLETADA

| Entregable | Estado |
|---|---|
| `docs/acoustic/taxonomy_v2.md` | ✅ generado |
| `docs/acoustic/labeling_policy_v2.md` | ✅ generado |
| `docs/acoustic/secondary_classes_v2.md` | ✅ generado |
| `docs/acoustic/ood_policy_v2.md` | ✅ generado |
| `docs/acoustic/annotation_protocol_v2.md` | ✅ generado |
| `docs/acoustic/dataset_v2_roadmap.md` | ✅ generado |
| Código / dataset / commits | ✅ intactos |

**Gate G-RM-0:** los seis documentos existen y son coherentes entre sí. ✅ **CERRADO**.

## FASE 1 · Contrato v2 (PENDIENTE)

| Acción | Requisito |
|---|---|
| Definir `labels.csv` v2 con 61 filas | Una definición por `class_id`; `parent_id`, `scope`, `is_universal`, `alias_of`, `status`, `dir_name` |
| Bump de `schema.json` a v2 | Enums nuevos, columnas 42/42, huella actualizada en el mismo cambio |
| Verificar que los 9 IDs v1 siguen presentes | Comparación automatizada de conjuntos |
| No crear `v2/` todavía | Fase 1 es solo contrato documental |

**Gate G-RM-1:** `labels.csv` v2 contiene los 9 IDs v1 + 52 nuevos; 37 canónicas, 22 subclases, 2 alias; huella sincronizada. **Estado: PENDING.**

## FASE 2 · Estructura `v2/` (PENDIENTE)

| Acción | Requisito |
|---|---|
| Crear `v2/` como directorio hermano | Sin tocar `v1/` |
| Crear `raw/<dir_name>/` para las 16 clases P0 + bucket `desconocido` | `dir_name` canalizado desde `labels.csv` v2 |
| Crear `metadata/`, `features/`, `manifests/`, `split_lists/` | Misma plantilla que v1 |
| `metadata.csv` v2 vacía | 0 filas; `dataset_state=PREPARADO_VACIO` |

**Gate G-RM-2:** `v2/` existe, `v1/` sin modificaciones, 0 filas v2. **Estado: PENDING.**

## FASE 3 · MVP rural (PENDIENTE)

| Acción | Requisito |
|---|---|
| Capturar las 16 clases P0 | Con `rules-v1` o logger, según misión explícita |
| Sentinela `evento_desconocido` | Solo por veredicto OOD, nunca a demanda |
| Doble anotación por muestra | `annotation_protocol_v2.md` |
| Eventos universales | `secondary_classes`, sin columna nueva |

**Gate G-RM-3:** ≥150 clips por clase P0, doble anotación, AC-1..10 + AN-AC-1..10 verdes. **Estado: PENDING.**

## FASE 4 · Gates y validación (PENDIENTE)

| Gate v1 | Acción en v2 |
|---|---|
| G-DS-1 | Actualizar de "9 clases exactas" a "61 clases del enum v2"; verificar MIDs `UNVERIFIED` |
| G-DS-2 | Cuotas por clase (150) sobre `class_id` y agregados por `parent_id` |
| G-DS-3 | Validación reproducible |
| G-DS-4 | Publicación de manifests |
| G-DS-5 | Split por `(session_id, place_id)` sin fuga |
| G-DS-6 | κ real con etiquetas individuales; hoy `PENDING` |

**Gate G-RM-4:** G-DS-1..6 adaptados y cerrados con evidencia. **Estado: PENDING.**

## FASE 5 · `rules-v1` (PENDIENTE)

| Acción | Requisito |
|---|---|
| Implementar `rules-v1` | Lee `parent_id` y `secondary_classes` |
| No tocar `rules-v0` | Sigue vigente en v1 |
| Degradación elegante | Sin `secondary_classes`, emite solo primario |

**Gate G-RM-5:** `rules-v1` validado; `rules-v0` intacto; sin regresión en v1. **Estado: PENDING.**

## FASE 6 · S81 / S82 / Knowledge Hub (PENDIENTE)

| Acción | Estado actual |
|---|---|
| S81 sobre taxonomía v2 | `DISENO` — no se activa sin Fases 3–5 |
| S82 (anomalías / OOD) | `DISENO` — cold start sin alertas |
| Knowledge Hub | Lee registros por `class_id` + `taxonomy_version`; sin escritura ad-hoc |

**Gate G-RM-6:** Evidencia gobernada antes de activar S81/S82. **Estado: PENDING.**

---

# 5. Compatibilidad estricta con v1

| Garantía | Contenido |
|---|---|
| **No destrucción** | `v1/` intacto: 7 filas, 7 WAV, 7 vectores, hashes sin cambio |
| **No reescritura** | Sin `git mv`, sin renombrar `sample_id`, sin regenerar features de v1 |
| **Unión de enums** | Los 9 IDs v1 siguen válidos en v2 (7 idénticos + 2 alias) |
| **Alias activos** | `ave → aves`, `ruido_desconocido → evento_desconocido` (`is_ood_bucket=true`, `dir_name=desconocido`) |
| **Plegado por `parent_id`** | `lluvia_fuerte → lluvia`, `abejas → insectos`, `tractor → motor`, etc. |
| **`rules-v0` vigente** | No se modifica; sus veredictos v1 no se invalidan |
| **Métricas comparables** | Informes pueden emitirse en nivel fino (`class_id`) y grueso (`parent_id`) |
| **Sin columna nueva** | `secondary_classes` ya existe desde `schema_version 1.1.0` |
| **Sin reconciliación forzada** | No se exige reetiquetar v1 para entrenar v2 |

---

# 6. Migración de las 9 clases (resumen ejecutivo)

| v1 | v2 | Mecanismo |
|---|---|---|
| `silencio` | `silencio` [C] | Idéntico |
| `viento` | `viento` [C] padre | Agregado; subclases `viento_suave/fuerte` |
| `lluvia` | `lluvia` [C] padre | Agregado; subclases `lluvia_suave/fuerte` |
| `agua` | `agua` [C] padre | Agregado; 5 subclases hídricas |
| `insectos` | `insectos` [C] padre | Agregado; `abejas` + 3 |
| `ave` | `aves` [C] + alias | Sin renombrar filas; `alias_of=aves` |
| `voz` | `voz` [C] | Idéntico; `grito` se pliega |
| `motor` | `motor` [C] padre | Agregado; 7 subclases |
| `ruido_desconocido` | `evento_desconocido` [O] + alias | `is_ood_bucket=true`; `dir_name=desconocido` |

**Detalle normativo:** `docs/acoustic/taxonomy_v2.md` §9 y `labeling_policy_v2.md` §6.

---

# 7. Prerrequisitos que hoy bloquean la ejecución

| ID | Bloqueo | Estado |
|---|---|---|
| B-1 | Aprobación explícita para promover los seis documentos a canónicos | PENDIENTE |
| B-2 | Misión explícita para crear `v2/` | PENDIENTE |
| B-3 | Bump de `schema.json` + huella sincronizada en el mismo cambio | PENDIENTE |
| B-4 | G-DS-1 adaptado (hoy exige exactamente 9 clases) | PENDIENTE |
| B-5 | G-DS-6 con κ real (hoy `PENDING`) | PENDIENTE |
| B-6 | Implementación de `rules-v1` | PENDIENTE |
| B-7 | Contrato de captura PCM compartido con S30 | PENDIENTE (según diseño de orquestación) |
| B-8 | Gate de activación S81/S82 | PENDIENTE |

**RM-6 · Sin ejecución tácita.** Este roadmap **no** autoriza ninguna fase. Cada fase requiere misión, permisos y evidencia propios.

---

# 8. Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Reescritura accidental de `v1/` | 🔴 | Directorio hermano + verificación de hashes antes/después |
| Fuga de clases v2 en splits v1 | 🔴 | `taxonomy_version` por fila; validación de split |
| `secondary_classes` como clase combinada | 🟡 | SC-5/SC-8; sin columna nueva |
| κ simulado | 🔴 | `PENDING` hasta etiquetas individuales (AN-4/AN-16) |
| Promoción OOD automática | 🔴 | OO-8: solo decisión documental |
| Confusión `ave`/`aves` | 🟡 | Alias con `alias_of`; sin renombrar filas |
| Confusión OOD con anomalía | 🟡 | OO-5: dominios distintos |
| Bump sin huella sincronizada | 🔴 | Regla de invalidación en el mismo cambio |

---

# 9. Criterio de éxito final

La taxonomía v2 es escalable para entrenar futuros `rules-v1`, ACP, Knowledge Hub, modelos ML, LLM y multimodales **sin romper el dataset actual** si y solo si:

1. `v1/` sigue intacto y verificable (7 muestras, hashes iguales),
2. los 9 `class_id` v1 sobreviven (7 idénticos + 2 alias),
3. `secondary_classes` no crea columna ni clases combinadas,
4. OOD está gobernado y nunca se captura a demanda,
5. las etiquetas erróneas se curan sin borrar historia (`curated_path`),
6. los gates se cierran con evidencia y κ real, nunca simulado,
7. `rules-v0` sigue vigente y `rules-v1` es aditivo.

---

# 10. Estado al cierre

Documento de gobernanza oficial, **listo para promoción futura**. `v2/` **no creado**; sin código; sin captura; sin commits. `HEAD=c5bcaeb`.
