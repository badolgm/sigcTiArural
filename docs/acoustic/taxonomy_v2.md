# TAXONOMÍA ACÚSTICA V2 — SIGCT-RURAL (DOCUMENTACIÓN OFICIAL DE GOBERNANZA)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:17:38-05:00
> - Origen: `.local_backups/SIGCTIARURAL_ACOUSTIC_TAXONOMY_EXPANSION_V1.md` (propuesta aprobada conceptualmente)
> - Destino: `docs/acoustic/taxonomy_v2.md` (NUEVO — listo para promoción futura)
> - Nota: convierte la propuesta aprobada en documento oficial de gobernanza. No implementa código, no modifica el dataset, no hace commits.

**Misión:** `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_V2`
**Naturaleza:** documentación oficial de **gobernanza**. Define la taxonomía acústica v2 como contrato declarativo. **NO implementa código**, **NO** crea el directorio `v2/`, **NO** modifica `schema.json`, `labels.csv`, `metadata.csv` ni `rules-*`.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `c5bcaeb` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Base aprobada:** `SIGCTIARURAL_ACOUSTIC_TAXONOMY_EXPANSION_V1` (`GO_PROPUESTA`, 12 comprobaciones internas).
**Estado:** **LISTO PARA PROMOCIÓN FUTURA** — gobernanza ratificable; la materialización en dataset es misión posterior.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Honestidad de estado (invariante de dominio):** toda clase nueva nace `DISENO` con **0 clips**. Ninguna se declara `REAL` por decreto documental.

---

# 0. Propósito y fuente de verdad

Este documento es la **fuente de verdad declarativa** del vocabulario acústico v2 de SIGCT-Rural. Sustituye conceptualmente —sin borrar— la taxonomía plana de 9 clases de `acoustic_v1_taxonomy` por un modelo jerárquico escalable capaz de gobernar:

- invernaderos · agricultura · biodiversidad · entornos rurales
- entornos domésticos · pecuarios · telemetría · seguridad

**No rompe el dataset actual.** `data/datasets/sigct_rural_acoustic/v1/` y sus 7 muestras reales quedan intactos. La taxonomía v2 se materializará, cuando se autorice, en un directorio **hermano** `v2/` con `acoustic_v2_taxonomy` y `dataset_version=v2`.

## 0.1 Hechos verificados sobre los que se funda

| Hecho | Valor |
|---|---|
| Taxonomía vigente | `acoustic_v1_taxonomy` — **9 `class_id` congelados** |
| `label_schema_version` vigente | `acoustic_v1_label_schema` |
| `schema_version` vigente | `1.3.0` |
| Dataset real | `data/datasets/sigct_rural_acoustic/v1/` · `dataset_state=CAPTADO_INICIAL` |
| Muestras reales | **7** (`silencio` 2 · `lluvia` 3 · `voz` 1 · `ruido_desconocido` 1) |
| Clases v1 sin muestras | `viento`, `agua`, `insectos`, `ave`, `motor` |
| Columnas ya presentes | `taxonomy_version` (OBLIGATORIA) · `label_schema_version` (OBLIGATORIA) · `secondary_classes` (OPCIONAL, *"CSV de clases concurrentes"*) |
| Regla de versionado vigente | *"Añadir o quitar una clase → `taxonomy_version` nueva (`acoustic_v2_taxonomy`) y `dataset_version v2`"* · *"Ningún cambio reescribe history: las versiones anteriores se conservan como directorios hermanos"* |
| Decisiones H3 ya cerradas | `abejas` = taxonomy v2 ✅ · `paisaje rural` = escena/contexto, **no** clase ✅ · AudioSet = ontología · BirdCLEF = diferido |

---

# 1. Invariantes de gobernanza

**INV-1 · No destrucción.** Los 9 `class_id` de v1 siguen siendo válidos en v2 (7 idénticos + 2 alias). Ningún valor se quita.

**INV-2 · No reescritura.** Ninguna fila de `metadata.csv` v1, ningún WAV y ningún vector de features se reescribe ni se reetiqueta.

**INV-3 · Aditividad.** Toda clase nueva es una adición con estado `DISENO` y 0 clips. El estado `REAL` solo se alcanza con evidencia (gates cerrados).

**INV-4 · Unicidad de identificador.** Un concepto = un `class_id`. Los duplicados se resuelven con un solo ID canónico + alias, nunca con dos clases competidoras.

**INV-5 · Separación de ejes.** `domain_id`, `class_id`, `parent_id`, `scope` y `secondary_classes` son ejes ortogonales. `domain_id` **nunca** es `class_id`.

**INV-6 · Versionado explícito.** Toda fila declara `taxonomy_version` y `label_schema_version`. Mezclar versiones en un mismo split está prohibido.

---

# 2. Modelo: cinco ejes ortogonales

Una lista plana de 55 etiquetas no escala y genera combinaciones imposibles (`lluvia_con_radio`, `ganado_con_musica`, …). El modelo separa cinco ejes:

| Eje | Campo | Valores | Función | Gobernado en |
|---|---|---|---|---|
| **A · Dominio** | `domain_id` | `AMBIENTE` · `HUMANO` · `FAUNA` · `MAQUINARIA` · `INFRAESTRUCTURA` · `ANOMALIAS` · `UNIVERSAL` | Agrupación semántica. **Nunca** es `class_id`. | Este documento §3 |
| **B · Clase** | `class_id` | Leaf capturable | Etiqueta primaria. Contrato cerrado para `schema.json` y `rules-v0/v1`. | `labeling_policy_v2.md` |
| **C · Jerarquía** | `parent_id` | `null` = canónica raíz · ID = subclase | Agregación y métricas gruesas. Una subclase **sigue siendo capturable**. | Este documento §5 |
| **D · Alcance** | `scope` | `LOCAL` · `OPORTUNISTA` · `UNIVERSAL` · `OOD` · `REFONLY` | Define cómo se captura y se evalúa. | `dataset_v2_roadmap.md` |
| **E · Concurrencia** | `secondary_classes` | CSV ya existente | Eventos universales que coexisten con la clase dominante. **Sin columna nueva.** | `secondary_classes_v2.md` |

## 2.1 Definición formal de los campos gobernados

### `class_id`
Identificador **canónico, cerrado y estable** de la etiqueta primaria de un clip. Reglas:
- Es un token `snake_case` minúsculo, sin espacios ni acentos (`evento_desconocido`, no `evento desconocido`).
- Pertenece al enum de `labels.csv` de la `taxonomy_version` declarada en la fila.
- **Exactamente un** `class_id` por clip (contrato monoetiqueta heredado de v1). La concurrencia se expresa en `secondary_classes`.
- Nunca se renombra una fila existente: el cambio de nombre se gestiona con `alias_of` (§6).
- Los alias legacy son `class_id` **válidos para lectura y evaluación**, aunque no se usen para nuevas capturas.

### `parent_id`
Identificador de la clase agregada bajo la cual se pliega esta clase. Reglas:
- `null` ⇒ canónica raíz. Un `class_id` ⇒ subclase.
- Profundidad máxima = **1** (sin subclases de subclases en v2).
- El padre es siempre una canónica raíz del mismo `domain_id`.
- El padre **no desaparece**: sigue siendo etiqueta válida y es el nivel de agregación de métricas y de comparación v1↔v2.
- `parent_id` es una herramienta de **plegado**, no una etiqueta alternativa. No autoriza a etiquetar un clip con el padre cuando el evento fino es observable.

### `secondary_classes`
Columna OPCIONAL ya presente en `schema.json` 1.3.0 (`"CSV de clases concurrentes"`). Contiene cero, uno o varios `class_id` de eventos universales que suenan simultáneamente con la clase primaria. **No se crea columna nueva.** Formato y reglas en `secondary_classes_v2.md`.

### Sentinela OOD
`evento_desconocido` es la clase sentinela de **fuera de distribución**. `ruido_desconocido` permanece como alias activo con `is_ood_bucket=true` y `dir_name=desconocido`. Nunca se captura a demanda; se asigna por veredicto de anotación. Reglas completas en `ood_policy_v2.md`.

---

# 3. Árbol completo de clases

**Leyenda:** **[C]** canónica raíz (`parent_id=null`) · **[S]** subclase (`parent_id=<padre>`) · **[A]** alias legacy activo · **[O]** sentinela OOD · **P0** MVP rural · **P1** Fase 2.
**Estado:** salvo indicación explícita, toda clase nueva es `DISENO` con 0 clips.

## 3.1 AMBIENTE

| `class_id` | Tipo | `parent_id` | `scope` | Fase | Estado real |
|---|---|---|---|---|---|
| `silencio` | [C] | — | `LOCAL` | **P0** | REAL-LOCAL (2 clips) |
| `lluvia` | [C] | — | `OPORTUNISTA` | **P0** | REAL-LOCAL (3 clips) |
| `lluvia_suave` | [S] | `lluvia` | `OPORTUNISTA` | P1 | DISENO |
| `lluvia_fuerte` | [S] | `lluvia` | `OPORTUNISTA` | P1 | DISENO |
| `granizo` | [C] | — | `OPORTUNISTA` | P1 | DISENO |
| `tormenta` | [C] | — | `OPORTUNISTA` | P1 | DISENO |
| `viento` | [C] | — | `LOCAL` | **P0** | DISENO (v1, 0 clips) |
| `viento_suave` | [S] | `viento` | `LOCAL` | P1 | DISENO |
| `viento_fuerte` | [S] | `viento` | `LOCAL` | P1 | DISENO |
| `agua` | [C] | — | `LOCAL` | **P0** | DISENO (v1, 0 clips) |
| `agua_corriente` | [S] | `agua` | `LOCAL` | P1 | DISENO |
| `agua_estancada` | [S] | `agua` | `LOCAL` | P1 | DISENO |
| `riego` | [S] | `agua` | `LOCAL` | **P0** | DISENO |
| `aspersor` | [S] | `agua` | `LOCAL` | P1 | DISENO |
| `goteo` | [S] | `agua` | `LOCAL` | P1 | DISENO |

## 3.2 HUMANO

| `class_id` | Tipo | `parent_id` | `scope` | Fase | Estado real |
|---|---|---|---|---|---|
| `voz` | [C] | — | `LOCAL` | **P0** | REAL-LOCAL (1 clip) |
| `grito` | [S] | `voz` | `LOCAL` | P1 | DISENO |
| `pasos` | [C] | — | `LOCAL` | P1 | DISENO |
| `aplausos` | [C] | — | `LOCAL` | P1 | DISENO |
| `conversacion` | [C] | — | `UNIVERSAL` | P1 | DISENO (ID único; ver §7) |
| `grupo_personas` | [S] | `conversacion` | `UNIVERSAL` | P1 | DISENO |

> `musica`, `radio`, `telefono` y `alarma` aparecen originalmente en HUMANO pero se gobiernan como **UNIVERSAL** (§7). No se duplican.

## 3.3 FAUNA

| `class_id` | Tipo | `parent_id` | `scope` | Fase | Estado real |
|---|---|---|---|---|---|
| `insectos` | [C] | — | `LOCAL` | **P0** | DISENO (v1, 0 clips) |
| `abejas` | [S] | `insectos` | `LOCAL` | **P0** | DISENO (decisión H3 D3) |
| `grillos` | [S] | `insectos` | `LOCAL` | P1 | DISENO |
| `saltamontes` | [S] | `insectos` | `LOCAL` | P1 | DISENO |
| `insectos_genericos` | [S] | `insectos` | `LOCAL` | P1 | DISENO |
| `aves` | [C] | — | `LOCAL` | **P0** | DISENO |
| `anfibios` | [C] | — | `LOCAL` | P1 | DISENO |
| `perro` | [C] | — | `LOCAL` | P1 | DISENO |
| `gato` | [C] | — | `LOCAL` | P1 | DISENO |
| `ganado` | [C] | — | `LOCAL` | **P0** | DISENO |
| `caballo` | [C] | — | `LOCAL` | P1 | DISENO |
| `otros_animales` | [C] | — | `LOCAL` | P1 | DISENO |

## 3.4 MAQUINARIA

| `class_id` | Tipo | `parent_id` | `scope` | Fase | Estado real |
|---|---|---|---|---|---|
| `motor` | [C] | — | `LOCAL` | **P0** | DISENO (v1, 0 clips) |
| `tractor` | [S] | `motor` | `LOCAL` | **P0** | DISENO |
| `motobomba` | [S] | `motor` | `LOCAL` | **P0** | DISENO |
| `ventilador` | [S] | `motor` | `LOCAL` | P1 | DISENO |
| `compresor` | [S] | `motor` | `LOCAL` | P1 | DISENO |
| `herramienta_manual` | [C] | — | `LOCAL` | P1 | DISENO |
| `herramienta_electrica` | [S] | `motor` | `LOCAL` | P1 | DISENO |
| `generador` | [S] | `motor` | `LOCAL` | P1 | DISENO |
| `vehiculo` | [S] | `motor` | `LOCAL` | P1 | DISENO |

## 3.5 INFRAESTRUCTURA

| `class_id` | Tipo | `parent_id` | `scope` | Fase | Estado real |
|---|---|---|---|---|---|
| `puerta` | [C] | — | `LOCAL` | **P0** | DISENO |
| `golpe` | [C] | — | `LOCAL` | P1 | DISENO |
| `metal` | [C] | — | `LOCAL` | P1 | DISENO |
| `plastico` | [C] | — | `LOCAL` | P1 | DISENO |
| `tuberia` | [C] | — | `LOCAL` | P1 | DISENO |
| `vibracion` | [C] | — | `LOCAL` | P1 | DISENO |
| `electrico` | [C] | — | `LOCAL` | P1 | DISENO |

## 3.6 ANOMALIAS

| `class_id` | Tipo | `parent_id` | `scope` | Fase | Estado real |
|---|---|---|---|---|---|
| `interferencia` | [C] | — | `LOCAL` | P1 | DISENO |
| `ruido_electrico` | [C] | — | `LOCAL` | P1 | DISENO |
| `rotura` | [C] | — | `LOCAL` | P1 | DISENO |
| `impacto` | [C] | — | `LOCAL` | **P0** | DISENO |
| `evento_desconocido` | [O] | — | `OOD` | **P0** | DISENO (sucesor OOD) |

## 3.7 UNIVERSAL (capa transversal — §7)

| `class_id` | Tipo | `parent_id` | `scope` | Fase | Estado real |
|---|---|---|---|---|---|
| `musica` | [C] | — | `UNIVERSAL` | P1 | DISENO |
| `radio` | [C] | — | `UNIVERSAL` | P1 | DISENO |
| `television` | [C] | — | `UNIVERSAL` | P1 | DISENO |
| `telefono` | [C] | — | `UNIVERSAL` | P1 | DISENO |
| `alarma` | [C] | — | `UNIVERSAL` | **P0** | DISENO (seguridad) |
| `conversacion` | [C] | — | `UNIVERSAL` | P1 | DISENO (ID único) |

## 3.8 Alias legacy (identificadores v1 que NO desaparecen)

| `class_id` | Tipo | `alias_of` | `dir_name` | Nota |
|---|---|---|---|---|
| `ave` | [A] | `aves` | `ave` | Singular v1; sigue siendo `class_id` válido. No se renombran filas. |
| `ruido_desconocido` | [A] | `evento_desconocido` | `desconocido` | Sentinela OOD v1; `is_ood_bucket=true` intacto. |

## 3.9 Conteo oficial del vocabulario v2

| Concepto | Cantidad | Detalle |
|---|---|---|
| Clases únicas del dominio ampliado | **55** | 12 AMBIENTE + 10 HUMANO + 11 FAUNA + 9 MAQUINARIA + 7 INFRAESTRUCTURA + 5 ANOMALIAS nuevas + `television` |
| Agregados legacy añadidos | **4** | `lluvia`, `viento`, `agua`, `insectos` (padres de subclases y anclas v1) |
| Alias legacy | **2** | `ave`, `ruido_desconocido` |
| **Total `class_id` v2** | **61** | 55 + 4 + 2 |
| Canónicas raíz (incluye sentinela OOD) | **37** | 36 [C] + 1 [O] |
| Subclases | **22** | Todas con `parent_id` de profundidad 1 |
| Alias | **2** | Ambos válidos para lectura/evaluación; no para nuevas capturas |

> Los **9 `class_id` de v1 están todos incluidos**: 7 idénticos (`silencio`, `viento`, `lluvia`, `agua`, `insectos`, `voz`, `motor`) + 2 alias (`ave`, `ruido_desconocido`).

---

# 4. Clases canónicas (37)

**Definición.** Una clase canónica es un identificador **raíz** (`parent_id=null`) y estable. Cumple al menos uno de estos criterios:

1. Es un **fenómeno acústico distinto**, no una variante de intensidad de otro.
2. Es un **agregado legacy** conservado para comparar métricas v1 ↔ v2.
3. Es un **evento universal** con identidad propia en cualquier entorno.
4. Es la **sentinela OOD**.

**Lista oficial (37):**

| Dominio | Canónicas raíz |
|---|---|
| AMBIENTE (6) | `silencio` · `lluvia` · `granizo` · `tormenta` · `viento` · `agua` |
| HUMANO (3) | `voz` · `pasos` · `aplausos` |
| FAUNA (8) | `insectos` · `aves` · `anfibios` · `perro` · `gato` · `ganado` · `caballo` · `otros_animales` |
| MAQUINARIA (2) | `motor` · `herramienta_manual` |
| INFRAESTRUCTURA (7) | `puerta` · `golpe` · `metal` · `plastico` · `tuberia` · `vibracion` · `electrico` |
| ANOMALIAS (5) | `interferencia` · `ruido_electrico` · `rotura` · `impacto` · `evento_desconocido` **[O]** |
| UNIVERSAL (6) | `musica` · `radio` · `television` · `telefono` · `alarma` · `conversacion` |

---

# 5. Subclases (22)

**Definición.** Una subclase es un **refinamiento capturable** bajo una canónica raíz. Se registra como `class_id` propio (no se pierde granularidad) y lleva `parent_id` para:

- plegar métricas a la clase gruesa (comparabilidad con v1),
- entrenar en curriculum grueso → fino,
- heredar `scope` y reglas de captura del padre.

**ANTI-PÉRDIDA.** Una subclase **nunca sustituye** a su padre: `abejas` no borra `insectos`; `tractor` no borra `motor`. El padre sigue siendo etiqueta válida y agregado de evaluación.

| Padre | Subclases | Razón del plegado |
|---|---|---|
| `lluvia` | `lluvia_suave`, `lluvia_fuerte` | Intensidad, no fenómeno nuevo |
| `viento` | `viento_suave`, `viento_fuerte` | Intensidad, no fenómeno nuevo |
| `agua` | `agua_corriente`, `agua_estancada`, `riego`, `aspersor`, `goteo` | Variantes de la misma fuente hídrica |
| `insectos` | `abejas`, `grillos`, `saltamontes`, `insectos_genericos` | Estridulación; el género refina |
| `motor` | `tractor`, `motobomba`, `ventilador`, `compresor`, `herramienta_electrica`, `generador`, `vehiculo` | Firma motor compartida |
| `voz` | `grito` | Variante vocal |
| `conversacion` | `grupo_personas` | Variante multihablante |

**Excluida explícitamente:** `paisaje rural` **no es clase** (decisión H3 D4 cerrada). Es una **escena/contexto**: se registra en `environment` (o en un futuro `scene_id`), **jamás** en `class_id`.

---

# 6. Alias yunicidad de identificador

| Regla | Contenido |
|---|---|
| **AL-1** | Un concepto = un `class_id`. Los duplicados detectados en la entrada del usuario se resuelven con **un solo ID canónico** (`conversacion`, `alarma`, `telefono`, `musica`, `radio`). |
| **AL-2** | `ave` es alias de `aves`: se conserva por compatibilidad v1; `alias_of=aves`. Las filas existentes con `class_id=ave` **no se renombran**. |
| **AL-3** | `ruido_desconocido` es alias de `evento_desconocido`: conserva `is_ood_bucket=true` y `dir_name=desconocido`. |
| **AL-4** | Un alias es válido para **lectura, evaluación y agregación**, pero **no se usa para nuevas capturas** (las nuevas capturas usan el ID canónico). |
| **AL-5** | La tabla de alias vive en `labels.csv` v2 (`alias_of`), nunca en una lista paralela. |

---

# 7. Capa universal y eventos transversales

`musica`, `radio`, `television`, `telefono`, `alarma` y `conversacion` aparecen en **cualquier** entorno: no compiten con `AMBIENTE`/`FAUNA`/`MAQUINARIA`, se **superponen**.

| ID canónico | Aparecía en | Resolución |
|---|---|---|
| `conversacion` | HUMANO + universales | **Un solo ID**, `domain_id=HUMANO`, `is_universal=true` |
| `alarma` | HUMANO + ANOMALIAS + universales | **Un solo ID**, `domain_id=ANOMALIAS`, `is_universal=true` |
| `telefono` | HUMANO + universales | **Un solo ID**, `domain_id=HUMANO`, `is_universal=true` |
| `musica`, `radio` | HUMANO + universales | **Un solo ID** c/u, `domain_id=UNIVERSAL` |
| `television` | Solo en la pregunta universal | Nuevo ID, `domain_id=UNIVERSAL` |

**Mecanismo.** La columna ya existente `secondary_classes` (CSV de clases concurrentes) expresa la concurrencia. No se crea columna, campo ni clase combinada. Ejemplos:

| Situación | `class_id` (primaria) | `secondary_classes` |
|---|---|---|
| Solo suena la radio | `radio` | vacío |
| Lluvia con radio de fondo | `lluvia` | `radio` |
| Ganado + conversación + música | `ganado` | `conversacion,musica` |
| Alarma dominante | `alarma` | vacío |
| Impacto con alarma | `impacto` | `alarma` |

Reglas de gobierno: `is_universal=true` autoriza a aparecer como primario o secundario en cualquier dominio; `scope=UNIVERSAL` exime de "lugar de captura" propio; `conversacion`/`telefono`/`voz`/`grito` heredan la regla de privacidad de `voz`. Detalle normativo en `secondary_classes_v2.md`.

---

# 8. MVP rural (P0) y Fase 2 (P1)

## 8.1 MVP rural — 16 capturables + 1 sentinela

Criterio: valor por entorno × observabilidad con la captura actual × separabilidad con el vector de 44 dims.

| Dominio | Clases P0 | Entorno cubierto |
|---|---|---|
| AMBIENTE | `silencio`, `lluvia`, `viento`, `agua`, `riego` | rural, invernadero, clima |
| FAUNA | `insectos`, `aves`, `abejas`, `ganado` | biodiversidad, apicultura, pecuario |
| HUMANO | `voz` | doméstico, telemetría |
| MAQUINARIA | `motor`, `tractor`, `motobomba` | agricultura, invernadero, bombeo |
| INFRAESTRUCTURA / ANOMALIAS | `puerta`, `impacto` | seguridad |
| UNIVERSAL | `alarma` | seguridad en cualquier entorno |
| SENTINELA | `evento_desconocido` | OOD (nunca a demanda) |

**Honestidad:** de las 16 capturables, solo `silencio`, `lluvia` y `voz` tienen clips reales hoy; `viento`, `agua`, `insectos` y `motor` son IDs v1 con **0 muestras**. El MVP es un **objetivo**, no un estado alcanzado.

## 8.2 Fase 2 (39 clases)

El resto del árbol: `lluvia_suave`, `lluvia_fuerte`, `granizo`, `tormenta`, `viento_suave`, `viento_fuerte`, `agua_corriente`, `agua_estancada`, `aspersor`, `goteo`, `grito`, `pasos`, `aplausos`, `grupo_personas`, `grillos`, `saltamontes`, `insectos_genericos`, `anfibios`, `perro`, `gato`, `caballo`, `otros_animales`, `ventilador`, `compresor`, `herramienta_manual`, `herramienta_electrica`, `generador`, `vehiculo`, `golpe`, `metal`, `plastico`, `tuberia`, `vibracion`, `electrico`, `interferencia`, `ruido_electrico`, `rotura`, `musica`, `radio`, `television`, `telefono`, `conversacion`.

**Gate de entrada a Fase 2:** definición en `labels.csv` v2, ≥150 clips propios, doble anotación y G-DS-2 cerrado. El bump de taxonomía **no** implica que las clases nuevas estén listas.

---

# 9. Migración de las 9 clases actuales (sin perder compatibilidad)

| # | `class_id` v1 | Destino en v2 | Mecanismo de compatibilidad |
|---|---|---|---|
| 1 | `silencio` | `silencio` [C] | ID idéntico; fila intacta; `dir_name=silencio` |
| 2 | `viento` | `viento` [C] (padre) | ID válido como agregado; `viento_suave/fuerte` se pliegan a él |
| 3 | `lluvia` | `lluvia` [C] (padre) | ID válido como agregado; `lluvia_suave/fuerte` se pliegan a él |
| 4 | `agua` | `agua` [C] (padre) | ID válido como agregado; 5 subclases hídricas se pliegan a él |
| 5 | `insectos` | `insectos` [C] (padre) | ID válido como agregado; `abejas` y 3 más se pliegan a él |
| 6 | `ave` | `aves` [C] + alias `ave` [A] | `ave` **sigue siendo `class_id` válido**; sin renombrar filas; `alias_of=aves` |
| 7 | `voz` | `voz` [C] | ID idéntico; `grito` se pliega a él |
| 8 | `motor` | `motor` [C] (padre) | ID idéntico; 7 subclases de maquinaria se pliegan a él |
| 9 | `ruido_desconocido` | `evento_desconocido` [O] + alias [A] | `is_ood_bucket=true` conservado; `dir_name=desconocido` intacto |

## 9.1 Garantías de no rotura

1. **`v1/` no se toca.** Las 7 filas reales conservan `taxonomy_version=acoustic_v1_taxonomy` y sus `sample_id`.
2. **Sin migración de filas.** No se reescribe `metadata.csv`, `features/*` ni `raw/*`.
3. **Enum de v2 = unión.** El enum v2 incluye los 9 IDs v1 + los nuevos. Ningún valor se quita.
4. **`labels.csv` v2 conserva los 9 bindings** y añade `parent_id`, `scope`, `is_universal`, `alias_of`, `status`, `definition`. `dir_name` de los alias no cambia.
5. **Métricas comparables.** Un clip v1 `lluvia` y un clip v2 `lluvia_fuerte` colapsan al mismo `parent_id=lluvia`. No hace falta reetiquetar el pasado.
6. **`rules-v0` sigue vigente en v1.** `rules-v1` (futuro) lee `parent_id` y `secondary_classes` sin invalidar veredictos anteriores.
7. **Gates a actualizar en su momento (no ahora):** G-DS-1 (hoy exige exactamente 9 clases), G-DS-2/6 (cuotas y anotación). Penden de misión de gobernanza explícita.

---

# 10. Consumo posterior por el ecosistema

| Consumidor | Uso de la taxonomía v2 |
|---|---|
| `rules-v1` | Lee `class_id`, `parent_id` (plegado grueso) y `secondary_classes` (concurrencia). Sin romper `rules-v0`. |
| ACP | Consulta el registro como **fuente de verdad declarativa**; jamás inventa una clase. Responde `NO_DATA` si el ID no existe. |
| Knowledge Hub | Un documento por clase canónica enlazado por `class_id` + `taxonomy_version`; aristas `clase→dominio`, `subclase→clase`, `evento→evidencia`. |
| Modelos ML | Curriculum grueso→fino; cabecera multi-label para `secondary_classes`; evaluación con group split `(session_id, place_id)`. |
| Modelos LLM | Vocabulario cerrado como restricción de salida; definiciones de `labels.csv` como texto fundado. Prohibido inventar etiquetas. |
| Modelos multimodales | Misma taxonomía como anclas; imagen/video aporta contexto, **no** crea clases. |

---

# 11. Control de cambios de la taxonomía

| Cambio | Consecuencia obligatoria |
|---|---|
| Añadir o quitar una clase | `taxonomy_version` → `acoustic_v2_taxonomy` (para v2) y `dataset_version v2` en directorio hermano |
| Renombrar una clase | Crear alias, **no** reescribir filas; `alias_of` en `labels.csv` |
| Cambiar `parent_id` de una subclase | Requiere nueva `label_schema_version` y registro de decisión; nunca reescribe v1 |
| Añadir un evento universal | Debe usar `secondary_classes`; **no** crea clases combinadas |
| Promover OOD a clase real | Ver `ood_policy_v2.md` (ciclo de promoción gobernada) |
| Toda modificación | Actualizar la huella/tabla de trazabilidad en el mismo cambio (regla de invalidación) |

---

# 12. Relación con los otros documentos de gobernanza v2

| Documento | Responsabilidad |
|---|---|
| `taxonomy_v2.md` (este) | Vocabulario, jerarquía y migración de clases |
| `labeling_policy_v2.md` | Reglas de etiquetado primario, `class_id`, aceptación y alias en uso |
| `secondary_classes_v2.md` | Capa de eventos universales y concurrencia |
| `ood_policy_v2.md` | Sentinela OOD y ciclo de promoción |
| `annotation_protocol_v2.md` | Criterios de aceptación, doble anotación y curación de etiquetas erróneas |
| `dataset_v2_roadmap.md` | Fases, gates, compatibilidad y materialización futura |

---

# 13. Validación interna y estado al cierre

| # | Comprobación | Resultado |
|---|---|---|
| V1 | ¿Se conservan los 9 `class_id` v1? | ✅ 7 idénticos + 2 alias |
| V2 | ¿Se conservan las 7 muestras reales? | ✅ `v1/` intacto |
| V3 | ¿Respeta D-003 / jerarquía documental? | ✅ gobernanza aditiva, sin conflicto |
| V4 | ¿`abejas` coherente con H3 D3? | ✅ subclase de `insectos` |
| V5 | ¿`paisaje rural` fuera de `class_id`? | ✅ tratado como escena |
| V6 | ¿Estado honesto? | ✅ clases nuevas = DISENO, 0 clips |
| V7 | ¿Sin columna nueva para universales? | ✅ usa `secondary_classes` |
| V8 | ¿Respeta versionado? | ✅ `acoustic_v2_taxonomy` + `dataset_version v2` |
| V9 | ¿Se redujeron las 8 clases vivas? | ✅ no, se amplían a 61 sin quitar ninguna |
| V10 | ¿Se tocó código / dataset? | ✅ no |
| V11 | ¿Sentinela OOD preservada? | ✅ alias activo + sucesor |
| V12 | ¿Escalabilidad? | ✅ jerarquía + concurrencia evitan combinatoria |

**Estado:** documento de gobernanza oficial, **listo para promoción futura**. Sin implementación. Sin commits. `HEAD=c5bcaeb`.
