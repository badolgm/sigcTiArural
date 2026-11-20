# POLÍTICA DE ETIQUETADO V2 — SIGCT-RURAL (DOCUMENTACIÓN OFICIAL DE GOBERNANZA)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:17:38-05:00
> - Origen: `.local_backups/SIGCTIARURAL_ACOUSTIC_TAXONOMY_EXPANSION_V1.md` (propuesta aprobada conceptualmente)
> - Destino: `docs/acoustic/labeling_policy_v2.md` (NUEVO — listo para promoción futura)
> - Nota: define `class_id`, `parent_id`, alias y criterios de aceptación de la etiqueta primaria. No implementa código.

**Misión:** `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_V2`
**Naturaleza:** documentación oficial de **gobernanza de etiquetado**. **NO** modifica `labels.csv`, `schema.json`, `rules-v0` ni el dataset.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `c5bcaeb`
**Fuente de verdad del vocabulario:** `docs/acoustic/taxonomy_v2.md`
**Estado:** **LISTO PARA PROMOCIÓN FUTURA**.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Honestidad de estado:** una etiqueta no cambia el estado de la señal; `SIM` sigue siendo `SIM` aunque esté bien etiquetada.

---

# 0. Propósito

Esta política gobierna **cómo se asigna la etiqueta primaria** (`class_id`) de un clip en la taxonomía v2. Responde:

1. qué es y cómo se escribe `class_id`,
2. cuándo se etiqueta en la subclase y cuándo en el padre,
3. cómo se usan los alias legacy sin reescribir el pasado,
4. qué criterios debe cumplir una etiqueta para ser **aceptada**,
5. cómo se migra el etiquetado de las 9 clases v1 sin romper compatibilidad.

La concurrencia (eventos universales) se rige por `secondary_classes_v2.md`; la sentinela OOD por `ood_policy_v2.md`; la curación de errores por `annotation_protocol_v2.md`.

---

# 1. `class_id` — definición operativa

## 1.1 Contrato

| Propiedad | Regla |
|---|---|
| Tipo | Token `snake_case`, minúsculas, sin acentos ni espacios |
| Cardinalidad | **Exactamente uno** por clip (monoetiqueta heredada de v1) |
| Dominio | Enum cerrado de `labels.csv` para la `taxonomy_version` declarada en la fila |
| Versionado | Toda fila declara `taxonomy_version` y `label_schema_version` |
| Inmutabilidad | Un `class_id` asignado no se renombra; el cambio se gestiona con `alias_of` |
| Trazabilidad | Toda etiqueta lleva `annotator_id`, `annotation_round` y, si aplica, `review_annotator_id` + `agreement` |

## 1.2 Reglas de asignación

**LP-1 · Vocabulario cerrado.** El anotador elige solo entre los `class_id` vigentes de la `taxonomy_version` de la fila. No se inventan etiquetas. Si el evento no encaja, se aplica `ood_policy_v2.md`.

**LP-2 · Primariedad por dominancia.** `class_id` describe el evento **dominante** del clip. Los eventos que acompañan van en `secondary_classes` (`secondary_classes_v2.md`).

**LP-3 · Nivel de granularidad.** Se etiqueta en el **nivel más fino observable y confirmable**:

| Situación | Etiqueta correcta |
|---|---|
| Se identifica abeja | `abejas` (subclase) |
| Solo se confirma "insecto" | `insectos` (padre) |
| Se identifica tractor | `tractor` (subclase) |
| Solo se confirma "motor" | `motor` (padre) |
| Duda entre `abejas` y `insectos_genericos` | `insectos` (padre), nunca una subclase dudosa |

**LP-4 · Padre por defecto.** Ante incertidumbre entre subclases hermanas, se etiqueta al **padre**. Es preferible perder granularidad que introducir ruido. El padre siempre es válido.

**LP-5 · Sin clases combinadas.** Está prohibido crear `class_id` compuestos (`lluvia_con_radio`, `ganado_con_musica`). La combinación se expresa en `secondary_classes`.

**LP-6 · Escenas no son clases.** `paisaje rural` y cualquier contexto de escena se registran en `environment` (o futuro `scene_id`), **nunca** en `class_id` (decisión H3 D4).

**LP-7 · Alias solo en lectura.** Para nuevas capturas se usa el ID canónico (`aves`, `evento_desconocido`). Los alias (`ave`, `ruido_desconocido`) siguen siendo válidos para leer/evaluar filas antiguas, pero no se asignan a muestras nuevas.

---

# 2. `parent_id` — reglas de uso en etiquetado

| Propiedad | Regla |
|---|---|
| Valor | `null` para canónicas raíz; ID del padre para subclases |
| Profundidad | Máximo 1 nivel (sin subclases de subclases en v2) |
| Herencia | La subclase hereda el `scope` del padre (`riego` hereda `LOCAL` de `agua`) |
| Plegado | Las métricas agregadas se calculan sobre `parent_id`; las finas sobre `class_id` |
| No sustitución | Etiquetar `abejas` **no** elimina `insectos` como agregado |

**LP-8 · Evaluación dual.** Todo informe de métricas v2 debe poder emitirse en dos niveles:
- **nivel fino** (`class_id`), para rendimiento real del modelo;
- **nivel grueso** (`parent_id`), para comparabilidad con v1 y agregados estables.

---

# 3. Alias legacy en etiquetado

| Alias (`class_id` v1) | Canónico v2 | Uso permitido | Uso prohibido |
|---|---|---|---|
| `ave` | `aves` | Leer/evaluar filas v1; agregar métricas | Asignar a nuevas capturas |
| `ruido_desconocido` | `evento_desconocido` | Leer/evaluar filas v1; bucket OOD histórico | Asignar a nuevas capturas (usar `evento_desconocido`) |

**LP-9 · No renombrar filas.** Una fila v1 con `class_id=ave` permanece así. Su `taxonomy_version=acoustic_v1_taxonomy` declara el vocabulario con el que fue etiquetada. Los informes pueden plegar `ave → aves` sin tocar la fila.

**LP-10 · Alias en el mismo split.** Un split puede contener filas v1 y v2 solo si el informe declara ambas `taxonomy_version`. Nunca se mezclan silenciosamente.

---

# 4. Criterios de aceptación de una etiqueta

Una etiqueta se considera **ACEPTADA** solo si cumple **todos** los criterios siguientes. Estos criterios son aditivos a AC-1..AC-10 del dataset v1 (que gobiernan la **calidad de la señal**); no los sustituyen.

| ID | Criterio | Verificación |
|---|---|---|
| **ALAB-1** | `class_id` pertenece al enum de la `taxonomy_version` declarada | Comparación contra `labels.csv` de esa versión |
| **ALAB-2** | `class_id` es el evento dominante del clip | Revisión del anotador + evidencia audible |
| **ALAB-3** | Granularidad correcta (LP-3/LP-4) | Si es subclase, el evento fino fue confirmado |
| **ALAB-4** | `parent_id` coherente con `labels.csv` | Solo para subclases; profundidad 1 |
| **ALAB-5** | `secondary_classes` válido (si presente) | IDs universales existentes, sin duplicados, sin la propia primaria |
| **ALAB-6** | No es clase combinada ni escena | Cumplimiento de LP-5 y LP-6 |
| **ALAB-7** | Si es OOD, sigue `ood_policy_v2.md` | `evento_desconocido` / alias, nunca a demanda |
| **ALAB-8** | Doble anotación completada cuando aplica | `annotator_id` + `review_annotator_id` + `agreement` |
| **ALAB-9** | `label_schema_version` declarada | Campo obligatorio no vacío |
| **ALAB-10** | Sin contradicción con `qc_status` | Una señal `rejected`/`quarantine` no se reporta como etiqueta aceptada |

> **Nota de honestidad:** ALAB-7/8 son **criterios de gobernanza**, no implementación. En v1, G-DS-6 sigue `PENDING` porque no hay etiquetas individuales por anotador para calcular Cohen κ real. La política v2 **no** afirma que el acuerdo ya existe.

## 4.1 Veredictos de etiquetado

| Veredicto | Significado |
|---|---|
| `ACCEPTED` | Cumple ALAB-1..10 |
| `REVIEW` | Duda razonable; requiere segunda anotación antes de aceptar |
| `PARENT_FALLBACK` | Se etiqueta al padre por LP-4 (válido, con granularidad reducida) |
| `OOD` | No encaja en el enum; se aplica `ood_policy_v2.md` |
| `REJECTED` | Señal o etiqueta inválida; se registra y se cura (ver `annotation_protocol_v2.md`) |

---

# 5. Interacción con `rules-v0` y `rules-v1`

| Motor | Contexto | Comportamiento ante v2 |
|---|---|---|
| `rules-v0` | v1 (`acoustic_v1_taxonomy`) | Sigue emitiendo **solo etiqueta primaria** sobre los 9 IDs v1. No se modifica. |
| `rules-v1` (futuro) | v2 (`acoustic_v2_taxonomy`) | Puede leer `parent_id` (plegado) y `secondary_classes` (concurrencia). Debe degradar con elegancia si `secondary_classes` está vacío. |

**LP-11 · No regresión.** Que `rules-v0` no emita secundarios **no** es un defecto: es su contrato. Ningún informe v2 debe presentar la ausencia de secundarios en `rules-v0` como error.

**LP-12 · Sin promoción automática.** La existencia de la taxonomía v2 **no** convierte a `rules-v0` en `rules-v1`. Su implementación requiere misión explícita.

---

# 6. Migración del etiquetado de las 9 clases v1

| `class_id` v1 | Etiqueta v2 equivalente | Regla de etiquetado |
|---|---|---|
| `silencio` | `silencio` | Sin cambio. Fila intacta. |
| `viento` | `viento` (padre) | Válido como agregado; nuevas capturas finas usan `viento_suave/fuerte`. |
| `lluvia` | `lluvia` (padre) | Válido como agregado; nuevas capturas finas usan `lluvia_suave/fuerte`. |
| `agua` | `agua` (padre) | Válido como agregado; nuevas capturas finas usan `riego`/`goteo`/etc. |
| `insectos` | `insectos` (padre) | Válido como agregado; `abejas` es la subclase P0. |
| `ave` | `aves` (canónico) · `ave` (alias) | Fila v1 intacta; informes pliegan `ave → aves`. |
| `voz` | `voz` (canónico) | Sin cambio; `grito` se pliega a él. |
| `motor` | `motor` (padre) | Válido como agregado; nuevas capturas finas usan `tractor`/`motobomba`. |
| `ruido_desconocido` | `evento_desconocido` (canónico) · alias OOD | `is_ood_bucket=true` conservado; sin reetiquetar. |

## 6.1 Compatibilidad garantizada

1. **Cero reescritura** de `metadata.csv`, `raw/*` y `features/*` de v1.
2. **Enum de v2 = unión** de los 9 IDs v1 + nuevos; ningún valor se quita.
3. **`labels.csv` v2 conserva los 9 bindings** y añade `parent_id`, `scope`, `is_universal`, `alias_of`, `status`, `definition`.
4. **Plegado por `parent_id`** permite comparar v1 y v2 sin reetiquetar el pasado.
5. **`rules-v0` sigue vigente en v1**; `rules-v1` es aditivo.

---

# 7. Estado al cierre

Documento de gobernanza oficial, **listo para promoción futura**. No se modificó ningún archivo de código ni de dataset. No se hicieron commits. `HEAD=c5bcaeb`.
