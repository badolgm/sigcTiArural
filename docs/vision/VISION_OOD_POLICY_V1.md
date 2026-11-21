# POLÍTICA OOD VISUAL V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T19:17:32-05:00
> - Origen: misión `SIGCTIARURAL_VISION_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/vision/VISION_OOD_POLICY_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: define la sentinela `evento_visual_desconocido` y sus criterios de asignación, promoción, rechazo y curación. No crea la sentinela, no etiqueta, no implementa.

**Misión:** `SIGCTIARURAL_VISION_GOVERNANCE_V1`
**Naturaleza:** doctrina oficial de **out-of-distribution visual**. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Autoridad:** `docs/vision/VISION_GOVERNANCE_V1.md` §6 · `docs/vision/VISION_TAXONOMY_V1.md` §3.10.
**Patrón hermano:** `docs/acoustic/ood_policy_v2.md` (sentinela `evento_desconocido`).
**No modifica:** la gobernanza acústica, la plataforma de observaciones ni ningún dataset.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante:** OOD es un **veredicto de incertidumbre**, no una clase de contenido, no un estado de honestidad y no un atajo de captura (VG-6).

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Sentinela `evento_visual_desconocido` | **`DISENO` — NO creada** |
| Imágenes que la usan hoy | **0** |
| `is_ood_bucket` | `true` (declarado en contrato) |
| `dir_name` | `desconocido_visual` (estable, compartido) |
| Se captura a demanda | **NO** |
| Se genera por modelo | **NO** |
| Promoción ejecutada | **Ninguna** |

> Decir que ya existe un bucket OOD visual sería falso. Existe el **contrato**; el bucket se materializará solo por misión explícita y tras verificación.

---

# 1. La sentinela

## 1.1 Identidad

| Campo | Valor |
|---|---|
| `class_id` | `evento_visual_desconocido` |
| `visual_domain_id` | `OOD` |
| `parent_id` | `null` |
| `taxonomy_version` | `visual_v1_taxonomy` |
| `is_ood_bucket` | `true` |
| `dir_name` | `desconocido_visual` |
| `state` | `DISENO` (no creada) |
| `confidence` | **No aplica / no sube** — OOD no incrementa confianza |

## 1.2 Qué significa y qué NO

**Significa:** *"ningún `class_id` vigente explica esta imagen o región de forma suficiente para el anotador"*. Es una declaración de **incertidumbre semántica**.

**NO significa:**

| No significa | En su lugar usar |
|---|---|
| "Es ruido / basura" | `REJECTED` por calidad (§4) |
| "Es algo raro" | `ANOMALIAS` (`rotura`, `fuga`, `equipo_danado`) si es conocido |
| "Es una anomalía" | Dominio `ANOMALIAS`, no OOD |
| "No salió en el modelo" | Eso es fallo de modelo, no OOD de datos; además no hay modelo aquí |
| "Captura genérica de prueba" | Observación normal con `scene_id` y `class_id` válidos |

**Distinción crítica (OO-5 / VOD-1):**

| Concepto | Naturaleza | Ejemplo |
|---|---|---|
| **Anomalía** | Evento **conocido** de comportamiento anómalo | `rotura`, `fuga`, `candado_forzado` |
| **OOD** | **Incertidumbre semántica**; el vocabulario no alcanza | Insecto desconocido que no encaja en `insecto_plaga` ni en `pulgón` |
| **Calidad inválida** | Problema de captura, no de semántica | Imagen borrosa, sobreexpuesta, sin consentimiento |

---

# 2. Criterios de asignación

## 2.1 Cuándo se asigna

Se asigna `evento_visual_desconocido` **solo si se cumplen todas**:

| # | Condición |
|---|---|
| VOD-A1 | La imagen/región es de **calidad válida** (P6-1..P6-6, AV-1..AV-11 excepto AV-1). |
| VOD-A2 | El anotador revisó el enum vigente de `visual_v1_taxonomy` y **ningún** `class_id` explica el contenido. |
| VOD-A3 | Se intentó el **padre** antes que la sentinela (VLP-4): si `insecto_plaga` sirve, no se usa OOD. |
| VOD-A4 | El anotador escribió una `notes` justificando qué se vio y por qué no encaja. |
| VOD-A5 | La decisión es **humana**; ningún modelo la produjo (AV-11 / VG-11). |
| VOD-A6 | Si hay personas, hay `consent_id`; si no, se omite el bloque y se reporta `PARTIAL`. |

## 2.2 Cuándo NO se asigna

| Situación | Acción correcta |
|---|---|
| Imagen borrosa, movida, sobreexpuesta | `REJECTED`/`quarantine` por calidad (§4) |
| No se sabe si es `pulgón` o `escarabajo` | Padre `insecto_plaga` (VLP-4), **no** OOD |
| Es un socket de maquinaria no listado | Proponer `class_id` nuevo por gobernanza, **no** OOD permanente |
| Contenido sensible sin consentimiento | Bloque omitido, `PARTIAL`, **no** OOD |
| El modelo falló / dio baja confianza | No aplica: no hay modelo en esta misión; se anota humano |
| Se quiere "llenar" el bucket para entrenar | **Prohibido**: OOD no se captura a demanda (VG-6) |

## 2.3 Veredicto de asignación

| Veredicto | Significado |
|---|---|
| `OOD_ASSIGNED` | Cumple VOD-A1..A6; se registra con justificación. |
| `PARENT_FALLBACK` | Existía un padre válido; se usa él en vez de OOD. |
| `REJECTED_QUALITY` | Falló calidad; va a curación, **no** a OOD. |
| `REVIEW` | Duda sobre si encaja; segunda anotación decide. |

---

# 3. Criterios de promoción

> **Promoción** = convertir una imagen/región OOD en una `class_id` canónica nueva. Es el único camino para que el vocabulario crezca durante 10 años sin romper `OBSERVATION_ID`.

| # | Criterio |
|---|---|
| VOD-P1 | Existencia de un **candidato** con ≥ N instancias OOD independientes (N lo fija la misión de gobernanza; hoy **no definido ⇒ sin promoción**). |
| VOD-P2 | Diversidad declarada: ≥ 2 `place_id` y ≥ 2 `session_id`; sin concentración en un solo origen. |
| VOD-P3 | Doble anotación humana confirmando el mismo concepto; `agreement=FULL`. |
| VOD-P4 | `notes` descriptivas y `class_id` candidato propuesto con `parent_id`. |
| VOD-P5 | **Misión de gobernanza explícita** aprobando el nuevo `class_id` (TAX-7). |
| VOD-P6 | `taxonomy_version` actualizada (`visual_v1_taxonomy` → siguiente) y crosswalk de alias publicado. |
| VOD-P7 | La sentinela y las notas OOD **se conservan**: la imagen promovida mantiene `ood_origin=true` y su `annotation_id` previo con `supersedes`. |
| VOD-P8 | El estado **no sube** por promoción: `DISENO`/`REAL-LOCAL` se hereda; `REAL` exige gates propios. |

## 3.1 Reglas de promoción

| ID | Regla |
|---|---|
| PROM-1 | Promover **nunca borra** la evidencia OOD que originó la clase (NADA DESAPARECE). |
| PROM-2 | Promover **nunca reescribe** `OBSERVATION_ID`: la observación sigue siendo la misma raíz. |
| PROM-3 | El `class_id` candidato debe pasar NC-1 (atómico, sin `_con_`, `_bajo_`, `_en_`, `_y_`). |
| PROM-4 | Si el candidato resulta ser una clase compuesta, se **rechaza** y se descompone (§5). |
| PROM-5 | Una promoción sin misión de gobernanza es inválida y se revierte por nueva versión, no por borrado. |

---

# 4. Criterios de rechazo

> Rechazo = la imagen/región **no apta** para OOD ni para el dataset. Es distinto de OOD.

| # | Criterio de rechazo |
|---|---|
| VOD-R1 | Integridad: `sha256` no coincide (Platform P6-1 / P6-5 ⇒ `BLOCKED`). |
| VOD-R2 | Formato inválido o corrupto. |
| VOD-R3 | `prediction_id` presente: inferencia disfrazada de anotación (VG-11). |
| VOD-R4 | `class_id` compuesto o `scene_id` en `class_id` (NC-1, VLP-6). |
| VOD-R5 | Persona sin `consent_id` o menor sin consentimiento legal (PER-1). |
| VOD-R6 | Sin justificación `notes` en la asignación OOD (VOD-A4). |
| VOD-R7 | OOD usado por conveniencia cuando existía un padre válido (VOD-A3). |
| VOD-R8 | Fuente externa sin `source_card`/licencia verificable (SRC-3). |

## 4.1 Destino del rechazo

| Destino | Cuándo |
|---|---|
| `quarantine` | Recuperable con curación (VOD-R1..R2, R4, R6, R7) |
| `ROTO` | Corrupción irreversible |
| `PARTIAL` + bloque omitido | Privacidad (VOD-R5) |
| `BLOCKED` | Inferencia (VOD-R3) o integridad crítica |

> El rechazo **nunca elimina** el asset ni su observación: se conserva con nota (VG-7, CUR-2).

---

# 5. Criterios de curación

| ID | Regla |
|---|---|
| VOD-C1 | La curación crea una **nueva versión** con `supersedes`; el OOD original permanece consultable. |
| VOD-C2 | Si la cura concluye que sí encaja un `class_id` existente, se anota esa clase y OOD queda como `ood_origin=true`. |
| VOD-C3 | Si la cura propone clase nueva, sigue §3 (promoción); no se autocrea. |
| VOD-C4 | Si la cura confirma OOD, se enriquece `notes` y se conserva el `dir_name` estable. |
| VOD-C5 | La curación **no sube** `state` ni `confidence` (CUR-4). |
| VOD-C6 | La curación es misión futura; hoy solo se define el contrato. |
| VOD-C7 | Un bucket OOD acumula candidatos hasta promoción; nunca se vacía ni se "limpia" (NADA DESAPARECE). |

## 5.1 Ciclo de vida completo

```
  imagen válida
       │  ningún class_id encaja (VOD-A1..A6)
       ▼
  evento_visual_desconocido   [DISENO · 0 activos · no capturado a demanda]
       │
       ├──► rechazo por calidad (§4) ──► quarantine / ROTO / BLOCKED
       │
       ├──► curación a clase existente (§5.2) ──► ood_origin=true
       │
       └──► promoción a clase nueva (§3) ──► taxonomy bump + supersedes
                    │
                    ▼
              observación SIGUE siendo la misma  (OBSERVATION_ID intacto)
```

---

# 6. Convivencia con OOD acústico

| Aspecto | Audio v2 | Visión v1 | Regla |
|---|---|---|---|
| Sentinela | `evento_desconocido` | `evento_visual_desconocido` | IDs distintos, misma doctrina |
| `is_ood_bucket` | `true` | `true` | — |
| `dir_name` | `desconocido` | `desconocido_visual` | Carpetas separadas, sin colisión |
| Alias legacy | `ruido_desconocido` | (ninguno; taxonomía nueva) | Audio conserva su alias; visión no tiene pasado que preservar |
| Estado | Operativo en contrato | `DISENO`, NO creada | No se copia el estado |
| Regla común | No se captura a demanda | No se captura a demanda | VG-6 |

> **OO-1 visual:** si en el futuro se unifica la sentinela, se haría con `alias_of` y bump, **nunca borrando** `evento_visual_desconocido`.

---

# 7. Fixtures de rechazo (deben fallar)

| Fixture | Resultado esperado |
|---|---|
| OOD asignado a imagen borrosa | `REJECTED_QUALITY`, no OOD (VOD-A1) |
| OOD asignado sin `notes` | `REJECTED` (VOD-R6) |
| OOD asignado cuando existía `insecto_plaga` | `PARENT_FALLBACK` (VOD-A3) |
| OOD generado por `prediction_id` | `BLOCKED` (VOD-R3) |
| `evento_visual_desconocido` usado como `class_id` de contenido | `REJECTED` (§1.2) |
| Bucket OOD "limpiado" al promover | Prohibido (PROM-1 / VOD-C7) |
| Promoción sin misión de gobernanza | Inválida (VOD-P5) |
| `confidence` elevada por OOD | `BLOCKED` (§1.1) |
| Persona sin consentimiento en OOD | `PARTIAL` + bloque omitido (VOD-R5) |

---

# 8. Gates (definidos, NO ejecutados)

| Gate | Condición | Estado |
|---|---|---|
| **G-VO-1** | Sentinela aprobada por misión de gobernanza | `DISENO` |
| **G-VO-2** | `dir_name=desconocido_visual` sin colisión con audio | `DISENO` |
| **G-VO-3** | Criterios VOD-A1..A6 verificados en un lote real | `DISENO` |
| **G-VO-4** | Promoción con misión + bump + `supersedes` | `DISENO` |
| **G-VO-5** | Rechazo por calidad separado de OOD | `DISENO` |
| **G-VO-6** | Curación sin pérdida ni subida de estado | `DISENO` |

---

# 9. Cierre

`evento_visual_desconocido` es la sentinela oficial: veredicto humano de incertidumbre, no clase, no estado, no atajo. Se asigna solo tras agotar el padre, se promociona solo por gobernanza, se rechaza por calidad y se cura sin borrar. Nace **`DISENO`** con **0 activos**.

**Estado honesto:** doctrina **`DISENO`**. Sin bucket materializado, sin imágenes etiquetadas, sin código, sin IA. Sin modificar la gobernanza acústica ni la plataforma. Sin commit, push, merge ni tag.

---

*Fin de la política OOD visual. Complementa —nunca sustituye— la gobernanza visual V1, la taxonomía visual V1 y la política de etiquetado visual V1.*
