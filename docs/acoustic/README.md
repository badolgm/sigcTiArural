# GOVERNANZA ACÚSTICA V2 · SIGCT-RURAL — índice

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:17:38-05:00
> - Origen: misión `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_PROMOTION_V1` (documento nuevo, índice de la carpeta)
> - Destino: `docs/acoustic/README.md` (PROMOVIDO — visible para git)
> - Nota: punto de entrada de la gobernanza acústica v2. No implementa código.

**Misión:** `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_PROMOTION_V1`
**Naturaleza:** índice navegacional. Define **qué documento gobernar** para cada decisión acústica; no añade norma nueva.
**Estado:** **PROMOVIDO** al repositorio (sin commit). `HEAD=c5bcaeb`.
**Subordinación:** Constitución V1.0.1 · Carta de Gobernanza IA V1.0.1 · D-003 · `AGENTS.md`.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> La documentación canónica es la fuente de verdad. Los documentos de esta carpeta gobiernan la **taxonomía**; no autorizan implementación.

---

## 1. Los seis documentos

| # | Documento | Responde a | Idea central |
|---|---|---|---|
| 1 | [`taxonomy_v2.md`](taxonomy_v2.md) | ¿Qué clases existen? | **61 `class_id`**: 37 canónicas raíz + 22 subclases + 2 alias. Árbol por dominios, `parent_id`, fases P0/P1 y migración de las 9 clases v1. |
| 2 | [`labeling_policy_v2.md`](labeling_policy_v2.md) | ¿Cómo se etiqueta la clase primaria? | `class_id` monoetiqueta, dominancia, granularidad fina→padre, alias legacy y criterios **ALAB-1..10**. |
| 3 | [`secondary_classes_v2.md`](secondary_classes_v2.md) | ¿Y los eventos que suenan a la vez? | Seis universales (`musica`, `radio`, `television`, `telefono`, `alarma`, `conversacion`) sobre la columna **ya existente** `secondary_classes`. Sin columna nueva, sin clases combinadas. Reglas **SC-1..12**. |
| 4 | [`ood_policy_v2.md`](ood_policy_v2.md) | ¿Qué pasa cuando nada encaja? | `evento_desconocido` sucede a `ruido_desconocido` conservando `is_ood_bucket=true` y `dir_name=desconocido`. Nunca se captura a demanda. Ciclo de promoción OOD→clase. Reglas **OO-1..9**. |
| 5 | [`annotation_protocol_v2.md`](annotation_protocol_v2.md) | ¿Quién valida la etiqueta y qué pasa si está mal? | Doble anotación, `agreement` con κ **`PENDING`** (sin simulación), curación no destructiva vía `curated_path`. Criterios **AN-AC-1..10**, errores **E-1..E-7**. |
| 6 | [`dataset_v2_roadmap.md`](dataset_v2_roadmap.md) | ¿Cómo se materializa sin romper v1? | `v2/` como **directorio hermano**, fases **0–6**, gates **G-RM-0..6**, bloqueos **B-1..8**, reglas de bump y compatibilidad estricta. |

---

## 2. Mapa rápido de decisión

| Necesito decidir… | Ir a |
|---|---|
| Si un evento es canónico o subclase | `taxonomy_v2.md` §4–§5 |
| Si etiqueto `abejas` o `insectos` | `labeling_policy_v2.md` LP-3/LP-4 |
| Si la radio suena de fondo | `secondary_classes_v2.md` §3–§4 |
| Si el clip no encaja en ninguna clase | `ood_policy_v2.md` §2 |
| Si dos anotadores discrepan | `annotation_protocol_v2.md` §2 (AN-5: padre como árbitro) |
| Si una etiqueta está errónea | `annotation_protocol_v2.md` §5 (curación, nunca reescritura) |
| Si se crea `v2/` | `dataset_v2_roadmap.md` §2–§4 (requiere misión explícita) |
| Cómo migrar las 9 clases v1 | `taxonomy_v2.md` §9 · `dataset_v2_roadmap.md` §6 |

---

## 3. Invariantes de la carpeta

1. **v1 intacto.** `data/datasets/sigct_rural_acoustic/v1/` y sus 7 muestras nunca se reescriben.
2. **Aditividad.** Toda clase nueva nace `DISENO` con 0 clips; ninguna se declara `REAL` por decreto.
3. **Sin columna nueva.** `secondary_classes` ya existe desde `schema_version 1.1.0`.
4. **Sin clases combinadas.** La concurrencia es multi-label opcional, no `lluvia_con_radio`.
5. **OOD gobernado.** Nunca se captura a demanda, nunca se promociona automáticamente.
6. **Curación sin borrado.** `curated_path` enlaza la corrección; la fila original permanece.
7. **Honestidad.** Cohen κ es `PENDING` hasta que existan etiquetas individuales por anotador.
8. **`rules-v0` vigente.** `rules-v1` es aditivo y requiere misión explícita.

---

## 4. Estado y límites

- ✅ **Gobernanza:** seis documentos + este índice, promovidos al repositorio.
- ⛔ **No ejecutado:** `v2/` no existe; `schema.json`, `labels.csv`, `metadata.csv`, `rules-v0`, `rules-v1`, S81 y S82 permanecen intactos.
- ⛔ **Sin commit:** los archivos están visibles para git (`git status`), pero no se hicieron `git add`, `commit`, `push`, `merge` ni `tag`.

**Informe de la misión:** `docs/reports/ACOUSTIC_GOVERNANCE_PROMOTION_REPORT_V1.md`.

---

## 5. Alcance multimodal (determinación de la misión)

Esta carpeta gobierna **audio**. La taxonomía v2 es **necesaria pero no suficiente** para una gobernanza multimodal audio + imagen + telemetría: no define identidad de señal entre modalidades, alineación temporal, proveniencia multimodal, reglas de fusión ni promoción a Knowledge Hub. Por ello se requiere un documento padre **`SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1`** en una misión futura; esta carpeta quedaría como especialización de dominio acústico subordinada a él. **No se crea en esta misión.**
