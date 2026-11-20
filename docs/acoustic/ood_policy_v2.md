# POLÍTICA OOD V2 — `evento_desconocido` — SIGCT-RURAL (DOCUMENTACIÓN OFICIAL DE GOBERNANZA)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:17:38-05:00
> - Origen: `.local_backups/SIGCTIARURAL_ACOUSTIC_TAXONOMY_EXPANSION_V1.md` (propuesta aprobada conceptualmente)
> - Destino: `docs/acoustic/ood_policy_v2.md` (NUEVO — listo para promoción futura)
> - Nota: gobierna la sentinela OOD y su ciclo de promoción. Conserva el alias v1 `ruido_desconocido`. Sin código.

**Misión:** `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_V2`
**Naturaleza:** documentación oficial de **gobernanza OOD**. **NO** modifica `labels.csv`, `rules-v0` ni el dataset; **NO** crea clases nuevas por decreto.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `c5bcaeb`
**Fuentes:** `docs/acoustic/taxonomy_v2.md` §3.6/§6/§9 · `labels.csv` v1 (`ruido_desconocido`, `is_ood_bucket=true`, `dir_name=desconocido`).
**Estado:** **LISTO PARA PROMOCIÓN FUTURA**.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Honestidad de estado:** OOD es un **veredicto de no-clasificación**, no una clase mágica que "explica" todo lo desconocido. Declarar OOD no mejora la confianza ni convierte la señal en `REAL`.

---

# 0. Propósito

Definir cómo se gobierna aquello que **no encaja** en el vocabulario cerrado de la taxonomía v2, sin perder la sentinela histórica de v1 y sin fabricar clases nuevas. Responde:

1. qué es `evento_desconocido` y qué relación tiene con `ruido_desconocido`,
2. cuándo se asigna (y cuándo **no**),
3. cómo se registra, se reporta y se audita,
4. cómo se promociona un evento OOD a clase oficial,
5. cómo se mantiene la compatibilidad con las filas v1.

---

# 1. Identidades OOD

| Rol | `class_id` | `taxonomy_version` | `is_ood_bucket` | `dir_name` | Uso |
|---|---|---|---|---|---|
| **Sentinela v2 (canónica)** | `evento_desconocido` | `acoustic_v2_taxonomy` | `true` | `desconocido` | Nuevas capturas OOD |
| **Alias v1 (legacy, activo)** | `ruido_desconocido` | `acoustic_v1_taxonomy` | `true` | `desconocido` | Lectura/evaluación de filas v1 |

**OO-1 · Sucesión sin borrado.** `evento_desconocido` **sucede** a `ruido_desconocido` pero no lo elimina. El alias v1 sigue siendo `class_id` válido con `is_ood_bucket=true` y `dir_name=desconocido` intactos.

**OO-2 · Un solo bucket físico.** Ambos IDs comparten la carpeta `desconocido/`. No se crea una carpeta nueva para la sentinela v2. La distinción está en `taxonomy_version`, no en el directorio.

**OO-3 · Sentinela, no clase de contenido.** `evento_desconocido` significa *"ninguna clase del enum explica este clip de forma suficiente"*. **No** significa "ruido", "extraño" ni "anomalía" (para eso existen `interferencia`, `ruido_electrico`, `rotura`, `impacto`).

---

# 2. Cuándo se asigna OOD

## 2.1 Criterios de asignación

Se asigna `evento_desconocido` **solo** si se cumple **todo**:

| ID | Criterio |
|---|---|
| **OOD-1** | Ningún `class_id` vigente describe el evento dominante con suficiencia |
| **OOD-2** | Tampoco encaja ninguna subclase bajo un padre vigente (se agotó `parent_id`) |
| **OOD-3** | No es un evento universal (`secondary_classes` no resuelve la concurrencia) |
| **OOD-4** | La señal pasó los controles de calidad (AC-1..AC-10); no es un clip corrupto |
| **OOD-5** | El anotador registra una nota (`notes`) con qué escuchó y por qué no encaja |

## 2.2 Cuándo NO se asigna OOD

| Situación | Acción correcta |
|---|---|
| Duda entre dos clases conocidas | `REVIEW` o `PARENT_FALLBACK` (`labeling_policy_v2.md`), **no** OOD |
| Clip con ruido de fondo + clase clara | La clase clara en `class_id`; ruido accesorio no es OOD |
| Calidad de señal inválida (AC fallido) | `REJECTED` / `quarantine`, **no** OOD |
| Evento nuevo recurrente aún no catalogado | OOD temporal **con nota**, candidato a promoción (§5) |
| Falta de anotador | `PENDING`, **no** OOD |
| Se quiere "subir confianza" | Prohibido: OOD no cambia confianza |

**OO-4 · OOD nunca se captura a demanda.** No existe botón ni sesión "capturar desconocido". El bucket se puebla solo por veredicto de anotación sobre clips capturados con otra intención.

**OO-5 · OOD no es anomalía por defecto.** `evento_desconocido` es incertidumbre **semántica**; las anomalías (`ANOMALIAS`) son eventos **conocidos** de comportamiento anómalo. Un evento desconocido no se reporta automáticamente como anomalía.

---

# 3. Registro y trazabilidad

| Campo | Valor/obligación |
|---|---|
| `class_id` | `evento_desconocido` (v2) o `ruido_desconocido` (v1) |
| `taxonomy_version` | Obligatoria; declara bajo qué vocabulario se dictaminó OOD |
| `label_schema_version` | Obligatoria |
| `is_ood_bucket` | `true` en `labels.csv` para ambos IDs |
| `notes` | Obligatoria para OOD: descripción de lo observado y motivo de no-encaje |
| `confidence_annotator` | Se registra tal cual; **no** se incrementa por ser OOD |
| `qc_status` | Debe ser `pass`/equivalente; un clip fallido no entra al bucket OOD |
| `secondary_classes` | Puede acompañar (ej. OOD + `alarma` de fondo) sin borrarse |

**OO-6 · Veredicto vs estado.** El veredicto `OOD` es un resultado de anotación, **ortogonal** a los 7 estados de honestidad (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`). Un clip OOD capturado con micrófono real sigue siendo `REAL-LOCAL`.

---

# 4. Reporte y consumo

| Consumidor | Comportamiento |
|---|---|
|Informes de métricas | OOD se reporta como **categoría separada**, nunca se pliega a una clase conocida ni se cuenta como acierto |
| `rules-v0` | Conserva su veredicto v1 sobre `ruido_desconocido`; sin cambios |
| `rules-v1` (futuro) | Puede emitir `OOD` con `confidence` y `notes`; nunca inventa una clase para el evento |
| ACP | Ante OOD responde con vocabulario unificado: `NO_DATA` / `PARTIAL` / `BLOCKED` / `UNANSWERABLE` según qué falte; **jamás** nombra una clase no registrada |
| Knowledge Hub | Un registro OOD por evento observado con su nota; no crea documento de clase hasta la promoción (§5) |
| Modelos ML | OOD se usa para calibración/umbrales y holdout, **nunca** como clase de entrenamiento positiva |

**OO-7 · Sin "clase cajón".** Agregar OOD al entrenamiento como si fuera una clase más degradaría la calibración. Se mantiene fuera del conjunto de clases positivas.

---

# 5. Ciclo de promoción gobernada (OOD → clase oficial)

Un evento OOD recurrente puede promocionarse a `class_id` oficial, pero **solo por gobernanza explícita**:

| Paso | Acción | Gate |
|---|---|---|
| 1 | Detectar recurrencia en `notes` de múltiples clips OOD | ≥N clips con descripción consistente (umbral por misión) |
| 2 | Proponer `class_id` nuevo en `taxonomy_v2.md` con definición y `domain_id` | Revisión documental |
| 3 | Definir `parent_id` o confirmar que es raíz | Sin profundidad > 1 |
| 4 | Aprobar en decisión documental (D-xxx) y añadir a `labels.csv` v2 | Firma de Bernardo |
| 5 | Aplicar bump de `taxonomy_version` / `label_schema_version` | Regla de invalidación de huellas en el mismo cambio |
| 6 | Asignar estado `DISENO` y 0 clips propios hasta captura dirigida | Honestidad de estado |
| 7 | Acumular ≥150 clips + doble anotación | G-DS-2 / `annotation_protocol_v2.md` |

**OO-8 · Ninguna promoción automática.** Un modelo, un ACP o un agente **no** puede promocionar OOD a clase. Solo la decisión documental.

**OO-9 · El pasado no se reetiqueta.** Cuando una clase se promociona, las filas OOD históricas **no** se reescriben. Pueden referenciarse como evidencia de origen, pero conservan su `class_id=evento_desconocido` y su `taxonomy_version`.

---

# 6. Compatibilidad con dataset v1

1. `ruido_desconocido` conserva `class_id`, `is_ood_bucket=true`, `dir_name=desconocido` y su fila real (1 clip). **Sin cambios.**
2. `evento_desconocido` se añade como **canónico v2**, con el mismo `dir_name=desconocido` (un solo bucket físico).
3. `labels.csv` v2 incluye ambos IDs: el canónico y el alias con `alias_of=evento_desconocido`.
4. Los informes pueden plegar `ruido_desconocido → evento_desconocido` sin tocar filas v1.
5. Ningún clip v1 se reetiqueta ni se mueve de carpeta.

---

# 7. Criterios de aceptación OOD

| ID | Criterio |
|---|---|
| **OOD-AC-1** | Se cumplen OOD-1..OOD-5 |
| **OOD-AC-2** | `class_id` es `evento_desconocido` o `ruido_desconocido` según `taxonomy_version` |
| **OOD-AC-3** | `is_ood_bucket=true` en el registro de clase correspondiente |
| **OOD-AC-4** | `notes` no vacío y descriptivo |
| **OOD-AC-5** | `qc_status` válido (no `rejected`/`quarantine`) |
| **OOD-AC-6** | `confidence_annotator` no fue inflado |
| **OOD-AC-7** | No existe ya una clase vigente que explique el evento (de lo contrario, usar esa clase) |

---

# 8. Estado al cierre

Documento de gobernanza oficial, **listo para promoción futura**. Sin código, sin reetiquetado, sin commits. `HEAD=c5bcaeb`.
