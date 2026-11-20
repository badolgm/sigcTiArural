# PROTOCOLO DE ANOTACIÓN V2 Y CURACIÓN DE ETIQUETAS ERRÓNEAS — SIGCT-RURAL (DOCUMENTACIÓN OFICIAL DE GOBERNANZA)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:17:38-05:00
> - Origen: `.local_backups/SIGCTIARURAL_ACOUSTIC_TAXONOMY_EXPANSION_V1.md` (propuesta aprobada conceptualmente)
> - Destino: `docs/acoustic/annotation_protocol_v2.md` (NUEVO — listo para promoción futura)
> - Nota: define doble anotación, criterios de aceptación y curación sin reescribir historia. Sin código.

**Misión:** `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_V2`
**Naturaleza:** documentación oficial de **gobernanza de anotación y curación**. **NO** modifica `metadata.csv`, calcula κ real ni implementa herramientas.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `c5bcaeb`
**Fuentes:** `docs/acoustic/taxonomy_v2.md` · `labeling_policy_v2.md` · `ood_policy_v2.md` · `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` (AC-1..10, G-DS-1..6).
**Estado:** **LISTO PARA PROMOCIÓN FUTURA**.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Honestidad de estado:** mientras no existan etiquetas individuales por anotador, el acuerdo (Cohen κ) se reporta `PENDING`. **No se aproxima, no se simula.**

---

# 0. Propósito

Gobernar la **calidad de la etiqueta** en la taxonomía v2: quién anota, cuántas rondas, qué criterios de aceptación, qué hacer con el desacuerdo y **cómo curar una etiqueta errónea sin destruir el registro original**.

Aclara dos planos que suelen confundirse:

| Plano | Gobernado por | No confundir con |
|---|---|---|
| **Calidad de la señal** (AC-1..10, WAV, feature, QC) | `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | Calidad de la etiqueta |
| **Calidad de la etiqueta** (`class_id`, acuerdo, curación) | Este documento | Calidad de la señal |

---

# 1. Roles y campos de trazabilidad

| Campo `metadata.csv` | Gobierno | Obligatoriedad en v2 |
|---|---|---|
| `annotator_id` | Quien emite la primera etiqueta | Obligatoria |
| `annotation_round` | Número de ronda (1 = primera, 2 = revisión) | Obligatoria |
| `review_annotator_id` | Segundo anotador (distinto del primero) | Obligatoria para muestra aceptada |
| `agreement` | Resultado del acuerdo | Obligatoria cuando hay 2 anotadores; `PENDING` si no es computable |
| `confidence_annotator` | Confianza del anotador, sin inflar | Obligatoria |
| `curated_path` | Ruta de la versión curada, si la hubo | Solo si se curó |
| `qc_status` | Estado de calidad de señal | Obligatoria (independiente de la etiqueta) |
| `ingest_status` | Veredicto de ingesta | Obligatoria (independiente de la etiqueta) |
| `notes` | Justificación, obligatoria en OOD y en curación | Según caso |

**AN-1 · Separación de personas.** `review_annotator_id` debe ser **distinto** de `annotator_id`. Un mismo anotador en dos rondas no cuenta como doble anotación.

**AN-2 · Confianza no inflada.** `confidence_annotator` se registra tal cual. La revisión puede **reducir** la confianza; nunca la aumenta automáticamente por el hecho de haber pasado una segunda ronda.

---

# 2. Doble anotación

## 2.1 Regla general

**AN-3 · Doble anotación para toda muestra aceptada en v2.** Toda muestra que entre al conjunto de entrenamiento/evaluación v2 debe tener:

1. ronda 1 con `annotator_id`,
2. ronda 2 con `review_annotator_id` distinto,
3. `agreement` registrado (o `PENDING` con explicación si el cómputo no está disponible).

**AN-4 · Excepción temporal honesta.** Mientras el sistema no registre etiquetas individuales por anotador, `agreement` se declara **`PENDING`**. Está prohibido escribir un valor aproximado o derivado de la confianza. Esta es la misma limitación que mantiene G-DS-6 en `PENDING` en v1.

## 2.2 Flujo de dos rondas

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Anotador A emite `class_id`, `secondary_classes` y `notes` | `annotation_round=1` |
| 2 | Anotador B revisa **sin ver** la etiqueta de A (ceguera) | `annotation_round=2` |
| 3a | Coinciden | `agreement=ACCEPTED` → muestra aceptada |
| 3b | No coinciden pero ambas son canónicas hermanas bajo el mismo padre | `PARENT_FALLBACK` al padre → `agreement=RESOLVED_PARENT` |
| 3c | No coinciden y no hay padre común | `REVIEW` → tercera revisión o descarte |
| 3d | Uno dice OOD y el otro una clase | Se aplica `ood_policy_v2.md`; si la clase es válida, gana la clase; si no, OOD con nota |
| 4 | Se registra decisión final y justificación | `notes` |

**AN-5 · Padre como árbitro.** El `parent_id` es el mecanismo de resolución preferido para desacuerdos entre subclases hermanas. Es una degradación controlada de granularidad, no un error.

**AN-6 · Desacuerdo irreductible.** Si tras tercera revisión no hay acuerdo, la muestra se marca `REVIEW`/`REJECTED` y **no** entra a entrenamiento. Se conserva con su nota.

---

# 3. Criterios de aceptación de la anotación

Una anotación v2 se acepta solo si cumple **todos**:

| ID | Criterio | Origen |
|---|---|---|
| **AN-AC-1** | Señal aceptada por AC-1..AC-10 | Gobernanza v1 |
| **AN-AC-2** | `class_id` válido para la `taxonomy_version` | `labeling_policy_v2.md` |
| **AN-AC-3** | Granularidad correcta (LP-3/LP-4) | `labeling_policy_v2.md` |
| **AN-AC-4** | `secondary_classes` válido o vacío | `secondary_classes_v2.md` |
| **AN-AC-5** | OOD gobernado si aplica | `ood_policy_v2.md` |
| **AN-AC-6** | Doble anotación o `PENDING` justificado | Este documento §2 |
| **AN-AC-7** | `annotator_id`, `annotation_round`, `review_annotator_id` y `agreement` presentes | Este documento §1 |
| **AN-AC-8** | `confidence_annotator` no inflado | AN-2 |
| **AN-AC-9** | Sin contradicción con `qc_status`/`ingest_status` | Gobernanza v1 |
| **AN-AC-10** | `notes` presente en OOD y en toda curación | §4/§5 |

**AN-7 · Aceptación compuesta.** Una muestra solo se considera `accepted` si pasa **simultáneamente** los criterios de señal (v1) y de anotación (v2). Un fallo de anotación no se compensa con buena señal.

---

# 4. Qué es una etiqueta errónea

Se considera **etiqueta errónea** cualquiera de estos casos:

| Tipo | Descripción | Ejemplo |
|---|---|---|
| **E-1 · Clase incorrecta** | El evento dominante es otro | Captura de lluvia etiquetada como `agua` |
| **E-2 · Granularidad incorrecta** | Se usó una subclase no confirmada | `abejas` cuando solo se oyó `insectos` |
| **E-3 · Alias en captura nueva** | Se asignó un alias en vez del canónico | `ave` en una fila v2 |
| **E-4 · OOD indebido** | Se declaró OOD existiendo clase válida | `evento_desconocido` para un `motor` claro |
| **E-5 · Concurrencia inválida** | `secondary_classes` con ID inexistente, duplicado o primario repetido | `lluvia,lluvia` |
| **E-6 · Conflicto de versión** | `class_id` no existe en la `taxonomy_version` declarada | `abejas` con `acoustic_v1_taxonomy` |
| **E-7 · Confianza inflada** | Valor de confianza incrementado sin evidencia | 0.95 tras revisión sin cambio |

---

# 5. Curación de etiquetas erróneas (sin destruir nada)

## 5.1 Principio de curación no destructiva

**AN-8 · NADA DESAPARECE.** La curación **no borra, no sobrescribe y no reescribe historia**. La etiqueta original se conserva y se emite una **versión curada** enlazada desde la fila original mediante `curated_path`.

**AN-9 · `curated_path` como puntero.** El campo `curated_path` ya existe en `metadata.csv`. La fila original conserva su `class_id`, `sample_id`, `taxonomy_version` y versión, y apunta a la corrección. Nunca se manipula la fila original.

## 5.2 Procedimiento de curación

| Paso | Acción | Regla |
|---|---|---|
| 1 | Detectar el error (revisión, auditoría, reporte) | Registrar quién lo detecta y cuándo |
| 2 | Clasificar el tipo E-1..E-7 | Determinar si es error de clase, granularidad, versión, etc. |
| 3 | Emitir **decisión de curación** documental | `curación <sample_id>: <original> → <corregido> · motivo · autor` |
| 4 | Crear el registro curado con nuevo `annotation_round` | Referencia al `sample_id` original en `notes` |
| 5 | Actualizar `curated_path` en la fila original | **Sin tocar** `class_id` original |
| 6 | Recalcular features solo si cambió la señal | Un error de etiqueta **no** invalida features |
| 7 | Registrar en el informe de curación | Trazabilidad completa |

## 5.3 Reglas de curación

| Regla | Contenido |
|---|---|
| **AN-10 · Sin reescritura** | Nunca se editan `class_id`, `sha256`, `sample_id` ni `taxonomy_version` de una fila existente |
| **AN-11 · Sin eliminación** | Nunca se borra un WAV, una fila ni una versión, aunque esté mal etiquetada |
| **AN-12 · Versión nunca se promueve** | Una corrección no convierte una clase `DISENO` en `REAL` |
| **AN-13 · Regla de versión** | Si el error es E-6 (conflicto de versión), la corrección declara explícitamente la `taxonomy_version` correcta; no se "arregla" cambiando la versión de la fila original |
| **AN-14 · Curación de OOD** | Si un OOD se cura a una clase, se conserva la nota original de OOD como evidencia del origen |
| **AN-15 · Curación y splits** | Una muestra curada **no** se mueve de split. Si su etiqueta cambia, se registra el impacto en el informe; el `split_group_key` permanece |

## 5.4 Matriz de cura por tipo

| Tipo | Cura permitida | Cura prohibida |
|---|---|---|
| E-1 | Emitir versión curada con clase correcta + nota | Sobrescribir `class_id` |
| E-2 | Plegar al padre (`PARENT_FALLBACK`) o reclasificar con revisión | Borrar la subclase errónea del registro |
| E-3 | Emitir versión curada con canónico (`aves`) | Eliminar la fila con alias |
| E-4 | Reclasificar a la clase válida; conservar nota OOD | Borrar la evidencia de que fue OOD |
| E-5 | Emitir `secondary_classes` corregido | Borrar el valor original |
| E-6 | Declarar la `taxonomy_version` correcta en la cura | Cambiar la versión de la fila original |
| E-7 | Reducir/confirmar confianza con evidencia | Aumentar la confianza |

---

# 6. Acuerdo y métricas (estado honesto)

| Concepto | Estado |
|---|---|
| Cohen κ real | **`PENDING`** — requiere etiquetas individuales por anotador |
| Acuerdo simple | Se registra como `ACCEPTED` / `RESOLVED_PARENT` / `REVIEW` / `REJECTED` |
| G-DS-6 | Sigue `PENDING` en v1; la política v2 **no** lo cierra |
| Aproximaciones | **Prohibidas**. No se deriva κ de `confidence_annotator` ni de acuerdos agregados |

**AN-16 · Declaración obligatoria.** Todo informe v2 que hable de acuerdo debe incluir literalmente: *"Cohen κ no calculado: etiquetas individuales por anotador no disponibles; `agreement` reportado como categoría, no como κ"*.

---

# 7. Compatibilidad con dataset v1

1. Las 7 filas reales v1 conservan sus `class_id`, `sample_id`, `annotator_id`, `agreement` y `taxonomy_version` intactos.
2. No se aplica doble anotación retroactiva a v1: se registra como deuda conocida, no se simula.
3. `curated_path` no se usa en v1 hoy; su uso en v2 es aditivo.
4. La curación v2 nunca reescribe v1; si un error se detecta en una fila v1, se documenta y se cura **en v2** con referencia al `sample_id` original.
5. `rules-v0` y los splits v1 siguen vigentes.

---

# 8. Criterios de cierre (gates futuros — no ejecutados)

| Gate | Condición | Estado hoy |
|---|---|---|
| **GA-1** | Doble anotación disponible en el 100 % de muestras v2 | DISEÑO |
| **GA-2** | `agreement` computable con etiquetas individuales | PENDING |
| **GA-3** | Procedimiento de curación trazado y auditado | DISEÑO |
| **GA-4** | G-DS-6 cerrado con κ real | PENDING |

**AN-17 · Sin cierre automático.** La existencia de este protocolo **no** cierra ningún gate. Los cierres requieren ejecución y evidencia.

---

# 9. Estado al cierre

Documento de gobernanza oficial, **listo para promoción futura**. Sin código, sin curación ejecutada, sin κ simulado, sin commits. `HEAD=c5bcaeb`.
