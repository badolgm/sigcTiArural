# EVENTOS UNIVERSALES Y `secondary_classes` V2 — SIGCT-RURAL (DOCUMENTACIÓN OFICIAL DE GOBERNANZA)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:17:38-05:00
> - Origen: `.local_backups/SIGCTIARURAL_ACOUSTIC_TAXONOMY_EXPANSION_V1.md` (propuesta aprobada conceptualmente)
> - Destino: `docs/acoustic/secondary_classes_v2.md` (NUEVO — listo para promoción futura)
> - Nota: gobierna la capa de concurrencia sobre la columna `secondary_classes` ya existente. Sin columna nueva.

**Misión:** `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_V2`
**Naturaleza:** documentación oficial de **gobernanza de eventos universales**. **NO** modifica `schema.json` (la columna ya existe), **NO** implementa código, **NO** crea clases combinadas.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `c5bcaeb`
**Fuentes:** `docs/acoustic/taxonomy_v2.md` §7 · `schema.json` 1.3.0 (`secondary_classes` = OPCIONAL, *"CSV de clases concurrentes"*).
**Estado:** **LISTO PARA PROMOCIÓN FUTURA**.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Honestidad de estado:** un evento universal etiquetado no es evidencia de reconocimiento automático; `rules-v0` no lo detecta y eso no es regresión.

---

# 0. Problema que resuelve

`musica`, `radio`, `television`, `telefono`, `alarma` y `conversacion` **aparecen en cualquier entorno**. Si se modelaran como combinaciones con cada clase primaria, se generaría una explosión combinatoria (55 × 6 = 330 etiquetas imposibles como `lluvia_con_radio`, `ganado_con_musica`, `impacto_con_telefono`).

La solución gobernada es una **capa de concurrencia**: el evento dominante va en `class_id` (monoetiqueta, contrato v1 intacto) y los eventos que acompañan van en `secondary_classes` (multi-label opcional, **columna ya existente**).

---

# 1. Columna `secondary_classes` (contrato vigente)

| Propiedad | Valor verificado |
|---|---|
| Nombre | `secondary_classes` |
| Tipo | `string` |
| Gobierno en `schema.json` 1.3.0 | `OPCIONAL` |
| Nota literal del esquema | *"CSV de clases concurrentes."* |
| ¿Se propone columna nueva? | **NO.** La columna ya existe y basta. |
| Cardinalidad | 0, 1 o varios `class_id` separados por coma |
| Versionado | No altera `schema_version`; es un uso gobernado de una columna existente |

> **Consecuencia:** la gobernanza v2 de universales es **aditiva sin bump de esquema**. El bump a `acoustic_v2_taxonomy` / `dataset_version v2` se debe a las clases nuevas, no a `secondary_classes`.

---

# 2. Los seis eventos universales

| `class_id` | `domain_id` | `is_universal` | Fase | Nota de estado |
|---|---|---|---|---|
| `musica` | `UNIVERSAL` | `true` | P1 | DISENO, 0 clips |
| `radio` | `UNIVERSAL` | `true` | P1 | DISENO, 0 clips |
| `television` | `UNIVERSAL` | `true` | P1 | DISENO, 0 clips — ID nuevo (no estaba en la lista de clases) |
| `telefono` | `HUMANO` | `true` | P1 | DISENO, 0 clips |
| `alarma` | `ANOMALIAS` | `true` | **P0** | DISENO, 0 clips — seguridad |
| `conversacion` | `HUMANO` | `true` | P1 | DISENO, 0 clips |

## 2.1 Duplicados resueltos (una idea, un ID)

| ID canónico | Aparecía en | Resolución gobernada |
|---|---|---|
| `conversacion` | HUMANO + universales | **Un solo ID**, `domain_id=HUMANO`, `is_universal=true` |
| `alarma` | HUMANO + ANOMALIAS + universales | **Un solo ID**, `domain_id=ANOMALIAS`, `is_universal=true` |
| `telefono` | HUMANO + universales | **Un solo ID**, `domain_id=HUMANO`, `is_universal=true` |
| `musica`, `radio` | HUMANO + universales | **Un solo ID** c/u, `domain_id=UNIVERSAL` |
| `television` | Solo en la lista universal | Nuevo ID, `domain_id=UNIVERSAL` |

**Regla SC-1 · Unicidad.** Ningún evento universal existe dos veces. `domain_id` indica dónde se gobierna semánticamente; `is_universal=true` indica que puede aparecer en cualquier entorno.

---

# 3. Formato del valor `secondary_classes`

## 3.1 Especificación

```
secondary_classes = ""                         # sin eventos concurrentes
secondary_classes = "radio"                    # un evento
secondary_classes = "conversacion,musica"      # varios eventos
```

| Regla | Contenido |
|---|---|
| **SC-2 · Separador** | Coma simple, sin espacios. `conversacion,musica` (no `conversacion, musica`). |
| **SC-3 · IDs válidos** | Solo `class_id` con `is_universal=true` vigentes en la `taxonomy_version` de la fila. |
| **SC-4 · Sin duplicados** | Un mismo ID no aparece dos veces en la misma celda. |
| **SC-5 · Exclusión de la primaria** | El `class_id` dominante **no** se repite en `secondary_classes`. |
| **SC-6 · Vacío válido** | Cadena vacía es el valor por defecto y significa "sin concurrencia". |
| **SC-7 · Sin alias** | Se usan IDs canónicos, nunca alias (`ave`, `ruido_desconocido`). |
| **SC-8 · Sin combinados** | Prohibido escribir `lluvia_con_radio` ni cualquier `class_id` compuesto. |

## 3.2 Ejemplos normativos

| Situación observada | `class_id` | `secondary_classes` |
|---|---|---|
| Solo suena la radio | `radio` | *(vacío)* |
| Lluvia con radio de fondo | `lluvia` | `radio` |
| Ganado + conversación + música | `ganado` | `conversacion,musica` |
| Alarma dominante | `alarma` | *(vacío)* |
| Impacto con alarma de fondo | `impacto` | `alarma` |
| Teléfono suena durante tormenta | `tormenta` | `telefono` |
| Voz humana reconocible | `voz` | *(vacío)* — ver privacidad §5 |

---

# 4. Primario vs secundario

**SC-9 · Dominancia.** Un evento universal puede ser **primario** (cuando es lo dominante del clip) o **secundario** (cuando acompaña). El **mismo `class_id`** sirve para ambos; no se duplica el concepto.

| Criterio de dominancia | Resultado |
|---|---|
| El evento universal es lo que motiva la captura / lo más audible | Va en `class_id`; `secondary_classes` vacío o con otros |
| El evento universal es fondo de otro evento | Va en `secondary_classes` |
| Dos eventos con dominancia equivalente e irreductible | Se etiqueta el primario por `domain_id` de mayor especificidad y el otro como secundario; si persiste la duda, `REVIEW` |

**SC-10 · Evaluación.** Las métricas de `class_id` se calculan sobre la etiqueta primaria. Los eventos secundarios se reportan como métricas multi-label independientes (precisión/recall por evento universal), **nunca** como clases del clasificador primario.

---

# 5. Privacidad y consentimiento

**SC-11 · Voz y habla.** `conversacion`, `telefono`, `voz` y `grito` heredan la regla vigente de `voz`: **sin retención de habla identificable**. Se documenta consentimiento en `annotator_id` + `notes` cuando corresponda.

**SC-12 · No transcripción.** La taxonomía etiqueta la **presencia** del evento, no su contenido. Está prohibido transcribir conversaciones o números telefónicos como parte de la etiqueta.

---

# 6. Interacción con motores y consumidores

| Consumidor | Comportamiento |
|---|---|
| `rules-v0` | Emite **solo `class_id`**. No lee `secondary_classes`. **No es regresión.** |
| `rules-v1` (futuro) | Puede emitir veredicto primario + secundarios; degrada con elegancia si `secondary_classes` está vacío. |
| ACP | Puede explicar eventos concurrentes leyendo `secondary_classes`, jamás inferirlos si la celda está vacía. |
| Knowledge Hub | Asocia cada evento universal a su documento por `class_id` + `taxonomy_version`; no crea documentos por combinación. |
| Modelos ML | Cabecera multi-label separada para los 6 eventos universales; la primaria sigue siendo una sola. |
| Modelos LLM | Vocabulario cerrado: solo los 6 IDs universales como secundarios válidos. |

---

# 7. Criterios de aceptación específicos

Un valor de `secondary_classes` se acepta solo si cumple:

| ID | Criterio |
|---|---|
| **SC-AC-1** | Cumple SC-2..SC-8 |
| **SC-AC-2** | Todos los IDs existen en `labels.csv` de la `taxonomy_version` de la fila |
| **SC-AC-3** | Ningún ID tiene `is_universal=false` |
| **SC-AC-4** | No contiene el `class_id` primario |
| **SC-AC-5** | Si la fila es OOD (`evento_desconocido`), la concurrencia se registra igual; OOD no borra secundarios |
| **SC-AC-6** | La celda vacía es explícitamente válida (no se exige rellenarla) |

---

# 8. Compatibilidad con dataset v1

1. Las filas v1 tienen `secondary_classes` **vacío** (columna opcional no usada). Permanece así: **no se rellena retroactivamente**.
2. No se crean clases combinadas en v1 ni en v2.
3. No se modifica `schema.json`: la columna ya existe desde 1.1.0.
4. La capa universal es **multi-label opcional**: un clip v2 puede tener 0, 1 o varios secundarios; la ausencia no es error.
5. El contrato monoetiqueta de `class_id` queda intacto, por lo que `rules-v0` y los splits v1 siguen funcionando.

---

# 9. Estado al cierre

Documento de gobernanza oficial, **listo para promoción futura**. Sin columna nueva, sin código, sin commits. `HEAD=c5bcaeb`.
