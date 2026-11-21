# LIBRO MAYOR DE EVIDENCIA V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T23:17:50-05:00
> - Origen: misión `SIGCTIARURAL_EVIDENCE_LEDGER_V1` (documento nuevo)
> - Destino: `docs/governance/SIGCTIARURAL_EVIDENCE_LEDGER_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: gobernanza oficial del Libro Mayor de Evidencia. No crea base de datos, API, UI, IA ni código.

**Misión:** `SIGCTIARURAL_EVIDENCE_LEDGER_V1`
**Naturaleza:** contrato **declarativo y ejecutable**. Establece la fuente oficial de evidencia del ecosistema y la cadena de custodia que la sostiene.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Estado:** **OFICIAL — DISEÑADO**. El contrato existe; su materialización requiere misión explícita.
**Conjunto de 3 documentos:** este es el padre.

| Documento | Autoridad |
|---|---|
| `SIGCTIARURAL_EVIDENCE_LEDGER_V1.md` | Definición, autores, 4 IDs, cadena de custodia, escenarios, consumidores y escalones |
| `EVIDENCE_LEDGER_ENTITY_MODEL_V1.md` | Entidades, cardinalidades, relaciones tipadas y máquinas de estado |
| `EVIDENCE_LEDGER_ROADMAP_V1.md` | Fases, gates, escala y los 30 riesgos |

**Subordinación:** Constitución V1.0.1 → Carta IA V1.0.1 → D-003 → Gobernanza Multimodal V1 → Masterplan V1 → Observation Platform V1 → **Observation Registry V1** → gobernanzas acústica / visión / telemetría → **este Ledger** → documentos especializados.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante de raíz:** `OBSERVATION_ID` no se modifica. `OBSERVATION_REGISTRY_V1` no se modifica. Este Ledger **no reescribe** ninguno de sus contratos; los acata.
> **Invariante de autoría:** **el ACP no crea evidencia; el ACP consume evidencia.** **Un LLM no crea evidencia; un LLM interpreta evidencia.**
> **Invariante de honestidad:** los **7 estados canónicos** (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`) no se amplían. La evidencia **hereda** el estado de su observación; nunca lo mejora (F3E-2).
> **Invariante de veredicto:** los **5 veredictos ACP** (`RESOLVED` · `PARTIAL` · `NO_DATA` · `BLOCKED` · `UNANSWERABLE`) no se amplían. `HIPÓTESIS` sigue **inactivo**, **PENDIENTE de G-IA-1**.
> **Invariante de preservación:** **append-only** es principio oficial: no hay `DELETE`, no hay `UPDATE`, no hay reescritura in-place (P-IA-7).
> **Invariante de no-ejecución:** gobernar no autoriza implementar. Este documento **no es** una base de datos, una API, una UI, un modelo ni un servicio.

---

# 0. Propósito

El Registry ya gobierna **identidad, versiones y trazabilidad**. Falta la autoridad que gobierne la **evidencia derivada**: qué cuenta como evidencia, quién puede producirla, cómo se custodia, cómo se corrige sin borrar y cómo la consumen el ACP y el Knowledge Hub sin fabricar nada.

**Lo que SÍ gobierna:** la evidencia como artefacto reproducible y verificable; sus cuatro identificadores; la cadena de custodia; los seis escenarios de cambio; las reglas de lectura del ACP y del KH; la relación con `report_id`; y el ascenso de una afirmación desde la observación hasta el conocimiento.

**Lo que NO hace:**

| No hace | Detalle |
|---|---|
| No modifica el Registry | `observation_id`, `obsver_`, `obshist_` y `obsrel_` siguen bajo `OBSERVATION_REGISTRY_V1`. |
| No crea `observation_id` | La evidencia **siempre** llega después de una observación gobernada. |
| No sustituye a la Platform | El `ObservationPackage` sigue siendo la dieta; el Ledger registra lo que de él se deriva. |
| No crea evidencia por inferencia | Sin productor gobernado, método, huella y ancla, no existe evidencia. |
| No escribe en ACP, Ledger ajeno ni KH | El ACP y el KH son lectores; el KH promociona por gobernanza, no por decreto. |
| No decide veredictos | Eso es del ACP, con los 5 canónicos. |
| No entrena ni predice | Ningún modelo se crea, entrena ni consume aquí. |
| No implementa | Cero tablas, endpoints, pantallas, servicios, firmas ni modelos de IA. |

> Estado honesto: hoy existen **0 evidencias registradas**, **0 cadenas**, **0 versiones** y **0 relaciones**. El dataset acústico v1 sigue con sus 7 muestras y su `schema.json` 1.3.0, intacto.

---

# 1. Qué es y qué NO es una evidencia

## 1.1 Definición oficial

**Evidencia** es un artefacto **reproducible y verificable**, derivado de una observación gobernada, que conserva la huella de su origen, el método que lo produjo, la identidad de quien lo produjo y el estado de honestidad heredado. Es la forma canónica en que un dato deja de ser un archivo y pasa a ser **sustento consultable**.

**Envelope mínimo verificable** (heredado de F3E §3.3, sin modificarlo):

| Campo | Obligación | Función |
|---|---|---|
| `evidence_id` | OBLIGATORIA | Identidad de la evidencia |
| `observation_id` | OBLIGATORIA | Ancla raíz; heredada del Registry |
| `asset_id[]` | OBLIGATORIA | Bytes de origen; cada asset con su `sha256` |
| `event_id[]` | OPCIONAL | Ocurrencia real reconocida; nunca inferida por fecha |
| `status` · `class` | OBLIGATORIAS | **Heredadas**, nunca elevadas (F3E-2) |
| `trace` | OBLIGATORIA | Etapas recorridas; huecos declarados |
| `confidence` | OBLIGATORIA | **Heredada**; `MIN` de anclas, nunca subida |
| `method` · `version` | OBLIGATORIAS | Reproducibilidad |
| `produced_by` | OBLIGATORIA | Productor gobernado (nunca ACP ni LLM) |
| `timestamp` · `timezone` | OBLIGATORIAS | Momento con zona horaria |
| `sha256` | OBLIGATORIA | Huella del artefacto derivado |

## 1.2 Tabla definitoria

| ✅ ES una evidencia | ❌ NO es una evidencia |
|---|---|
| Un espectro calculado por un motor gobernado sobre un asset con huella. | Una captura cruda sin derivación: eso es un **asset**. |
| Una métrica agregada con método, versión y productor declarados. | Una inferencia de un LLM presentada como dato. |
| Una anotación curada con `supersedes` y autor verificable. | Una etiqueta sin anotador ni razón. |
| Una medición validada con `NO_DATA` gobernado donde corresponda. | Un `0` usado para representar ausencia. |
| Un registro encadenado por huella y consultable por `evidence_id`. | Un archivo de log editable o una bitácora que se limpia. |
| Una copia exacta de un clip **externo `REF`** con `original_id` y licencia. | Un clip externo presentado como evaluación propia. |
| Un sustento al que el ACP **acude** para emitir un veredicto. | Un veredicto del ACP disfrazado de evidencia. |
| Un paso previo a la promoción gobernada al KH. | Un documento canónico creado por escritura directa. |

**Frase definitoria:** *la evidencia no es la señal ni la opinión: es el rastro reproducible que permite reconstruir qué se observó, cómo se transformó y quién responde por ello.*

---

# 2. Los cuatro identificadores del Ledger

## 2.1 Catálogo

| ID solicitado | Prefijo | Naturaleza | Depende de | Estado |
|---|---|---|---|---|
| `EVIDENCE_ID` | `evd_` | Identidad de una evidencia derivada | `observation_id` | **Nuevo, `DISENO`** |
| `EVIDENCE_VERSION_ID` | `evdver_` | Versión inmutable del estado declarativo de una evidencia | `evidence_id` | **Nuevo, `DISENO`** |
| `EVIDENCE_CHAIN_ID` | `evdchain_` | Cadena de custodia append-only de una evidencia | `evidence_id` | **Nuevo, `DISENO`** |
| `EVIDENCE_RELATION_ID` | `evdrel_` | Arista **tipada y dirigida** entre evidencias y entidades gobernadas | entidades existentes | **Nuevo, `DISENO`** |

> **Regla de no-raíz:** ninguno de los cuatro sustituye a `observation_id`. `evd_` es **hija** de la observación; los otros tres son hijos o vistas de `evd_`. El Registry conserva la autoridad sobre la raíz; el Ledger gobierna solo la vida de la evidencia derivada.

## 2.2 `EVIDENCE_ID` — `evd_<observation_id>_<seq4>`

Ejemplo: `evd_obs_20261120_invernadero01_0001_0001`.

| Campo | Obligación | Función |
|---|---|---|
| `evidence_id` · `observation_id` | OBLIGATORIAS | Identidad y ancla inmutable |
| `asset_ids[]` · `event_ids[]` | OBLIGATORIAS / OPCIONAL | Procedencia de bytes y ocurrencias |
| `evidence_type` | OBLIGATORIA | Tipo declarado: espectro · métrica · anotación · medición · inferencia gobernada · referencia |
| `state` · `confidence` | OBLIGATORIAS | Heredadas de la observación (F3E-2) |
| `source_tier` | OBLIGATORIA | `PROPIO` · `REF` · `SIM` — separación física |
| `license` | OBLIGATORIA | Licencia declarada; `ND` prohibido |
| `produced_by` · `method` · `version` | OBLIGATORIAS | Autoría y reproducibilidad |
| `sha256` · `timestamp` · `timezone` | OBLIGATORIAS | Huella y momento verificables |

**Regla EID-1:** el ID se asigna **después** de la observación, por el registrador de evidencia, nunca por el productor de forma aislada.
**Regla EID-2:** no codifica clase, taxonomía, versión ni estado: un bump de taxonomía crea versión, no nueva raíz de evidencia (OB-2, VER-3).
**Regla EID-3:** nunca se reutiliza, renombra ni fusiona. La fusión se declara con `evdrel_`, no editando el ID.
**Regla EID-4:** las evidencias `REF` conservan `original_id` y `source_id`; jamás se presentan como `PROPIO` (TG-10, DS-8).
**Regla EID-5:** una evidencia sin `observation_id` no se registra: `BLOCKED` (LLM-1, ACP-1).

## 2.3 `EVIDENCE_VERSION_ID` — `evdver_<evidence_id>_<seq4>`

| Campo | Obligación | Función |
|---|---|---|
| `version_id` · `evidence_id` | OBLIGATORIAS | Versión y raíz de evidencia |
| `seq4` · `supersedes` | OBLIGATORIOS | Cadena append-only; la primera declara `null` |
| `manifest_sha256` | OBLIGATORIA | Huella del manifiesto de esa versión |
| `state_distribution` · `confidence_declared` | OBLIGATORIAS | Termómetro y `MIN`, sin mejora |
| `valid_from` · `valid_to` · `reason` · `actor_id` | OBLIGATORIOS | Vigencia y autoría; `valid_to` se escribe, nunca se borra |

**Regla EVER-1:** una versión nunca se reescribe. Corregir produce `seq4+1` con `supersedes`.
**Regla EVER-2:** la versión vigente se resuelve por `supersedes` + `valid_from/valid_to`, **nunca** por "la última fila" (VER-4).
**Regla EVER-3:** cambiar los bytes de un artefacto crea **otro `asset_id`** y otra versión; `evidence_id` permanece (AS-2, OV-3).
**Regla EVER-4:** ninguna versión eleva el estado ni la confianza heredada.

## 2.4 `EVIDENCE_CHAIN_ID` — `evdchain_<evidence_id>_<seq6>`

| Campo | Obligación | Función |
|---|---|---|
| `chain_id` · `evidence_id` | OBLIGATORIAS | Entrada y evidencia a la que pertenece |
| `seq6` · `prev_chain_sha256` | OBLIGATORIOS | Encadenamiento; la primera declara `null` |
| `action` | OBLIGATORIO | `PRODUCED` · `INTEGRITY_CHECKED` · `SEALED` · `DELIVERED` · `CONSUMED` · `CORRECTED` · `RETIRED` · `DISPUTED` · `REPLACED` · `SPLIT` · `COMBINED` · `PROMOTED` · `EXPORTED` |
| `actor_id` · `actor_role` · `at` · `timezone` | OBLIGATORIOS | Autoría verificable con zona |
| `before` · `after` · `reason` · `evidence_ref[]` | OBLIGATORIOS | Transición y justificación; sin razón ⇒ `BLOCKED` |
| `entry_sha256` | OBLIGATORIA | Integridad de la entrada |

**Regla ECH-1:** la cadena es **append-only**; no existe `UPDATE` ni `DELETE` (AP-1).
**Regla ECH-2:** un error se corrige con **otra entrada** que lo declara; la anterior se conserva (AP-4).
**Regla ECH-3:** `prev_chain_sha256` roto ⇒ `BLOCKED`; la cadena no se reordena.
**Regla ECH-4:** `CONSUMED` y `EXPORTED` también son entradas: leer y divulgar cambian el estado de custodia, no los bytes.

## 2.5 `EVIDENCE_RELATION_ID` — `evdrel_<type>_<seq6>`

| Campo | Obligación | Función |
|---|---|---|
| `relation_id` · `type` | OBLIGATORIOS | Arista tipada |
| `from_id` · `to_id` | OBLIGATORIOS | Entidades existentes, referidas por ID |
| `declared_by` · `at` · `timezone` · `reason` | OBLIGATORIOS | Declaración gobernada, sin inferencia |
| `state` | OBLIGATORIA | 7 estados canónicos; no mejora nada |
| `supersedes` | OPCIONAL | Solo para relaciones que reemplazan a otra |

**Tipos cerrados:** `DERIVED_FROM` · `EVIDENCE_FOR` · `SUPPORTS` · `CORRECTS` · `RETIRES` · `CONTRADICTS` · `DISPUTES` · `REPLACES` · `SPLIT_INTO` · `COMBINED_FROM` · `REPORTED_BY` · `PROMOTED_TO` · `PRECEDED_BY`.

**Regla EREL-1:** toda arista exige declaración y `reason`; nunca se infiere por fechas, nombres ni vectores (OR-1).
**Regla EREL-2:** `DERIVED_FROM` apunta siempre a un `asset_id` o `observation_id` existente; nunca a un archivo sin ancla.
**Regla EREL-3:** `SUPPORTS` va de `evidence_id` a `report_id`; `REPORTED_BY` conserva su sentido del Registry (reporte → observación).
**Regla EREL-4:** `CORRECTS` · `REPLACES` · `SPLIT_INTO` · `COMBINED_FROM` no forman ciclos; ciclo ⇒ `BLOCKED` (OR-3).
**Regla EREL-5:** cambiar un tipo de relación crea otra con `supersedes`; no se edita (OR-4).

---

# 3. Autoría: quién puede y quién no puede crear evidencia

## 3.1 SÍ puede crear evidencia

La **función de registrador de evidencia**, actuando sobre una observación ya gobernada. Puede materializarse en un productor gobernado humano o en un motor determinista bajo supervisión, pero **siempre** con autoría declarada.

| Actor | Condición | Límite |
|---|---|---|
| **Productor gobernado** (laboratorio, motor de señales, pipeline de ingesta, curador humano) | Declara `observation_id`, `asset_id`, `method`, `version`, `sha256`, `timestamp` + `timezone`, `produced_by` y consentimiento verificable. | No puede elevar estado ni confianza; no puede borrar. |
| **Registrador de evidencia** | Asigna `evidence_id` y escribe la entrada `PRODUCED` en la cadena. | No inventa datos: solo registra lo que el productor declara y verifica huella. |
| **Curador humano** | Propone versión nueva con `supersedes` y razón. | No aprueba en solitario su propia cura (AUD-3). |
| **Auditor** | Verifica huellas, autores y cadena. | **Lee**; no produce evidencia ni corrige (AUD-4). |
| **Fuente externa gobernada `REF`** | Entra con `original_id`, `source_id`, licencia y `state=REF`. | Nunca entra en evaluación propia; nunca se le cambia el estado. |

**Regla AUT-1:** toda evidencia nace de una observación. Sin `observation_id`, `BLOCKED`.
**Regla AUT-2:** autoría verificable = `produced_by` + `actor_id` + `actor_role` + `at` + `timezone` + `reason`.
**Regla AUT-3:** la creación es un acto humano gobernado o determinista supervisado (P-IA-6: la IA propone; el humano decide).
**Regla AUT-4:**`getEvidence` no equivale a `createEvidence`: consultar no produce nada (ECH-4).

## 3.2 NO puede crear evidencia — reglas obligatorias

| Actor | Veredicto | Fundamento |
|---|---|---|
| **ACP** | **NO CREA EVIDENCIA. CONSUME EVIDENCIA.** | ACP-3; ACR-6; Carta IA cadena de autoridad: `ACP → EVIDENCE LEDGER` como lector. |
| **LLM / `Interprete`** | **NO CREA EVIDENCIA. INTERPRETA EVIDENCIA.** | Carta IA §8, IA-2, P-IA-5 (no fabricación), R-9.3 (no es fuente de verdad). |
| **Sub-agentes IA-3, sistemas de razonamiento IA-5, modelos predictivos IA-6** | No crean evidencia. | Carta IA: sujetos gobernados IA-1..IA-6; la evidencia la escribe el productor gobernado. |
| **KH** | No crea evidencia; promociona evidencia ya registrada. | KH-2, KEL-1; Hangar de Autenticidad. |
| **UI / dashboard / cliente / script ad-hoc** | No crea evidencia. | Solo solicita; la autoría la ejerce el registrador gobernado. |
| **Dispositivo sin observación registrada** | No crea evidencia. | AUT-1; OBS-11. |
| **Fuente `REF` sin `original_id` ni licencia** | No crea evidencia de evaluación propia. | TG-10, DS-8, EID-4. |
| **El propio Ledger por inferencia** | No crea evidencia. | Sin declaración no existe (EREL-1, TRZ-2). |

### 3.2.1 Aclaración gobernada sobre F3E

F3E §13 menciona una interpretación reproducible del ACP que "pasa al Ledger" con `produced_by = acp`. **Lectura oficial de este Ledger, sin modificar F3E:** el ACP **propone** esa interpretación al productor gobernado (C-4, P-IA-6); es el productor quien la registra con `produced_by = <productor gobernado>` y `proposed_by = acp` como campo de procedencia. El ACP **nunca escribe** en el Ledger. Si un texto antiguo dijera `produced_by = acp`, se interpreta como `proposed_by = acp` + autoría gobernada; ninguna gobernanza se reescribe por esta aclaración.

**Regla AUT-5 (dura):** ninguna salida de IA se convierte en evidencia por el hecho de ser lenguaje, inferencia o veredicto. Solo se convierte en evidencia cuando un productor gobernado la declara con método, huella y ancla.

---

# 4. Relación entre los cuatro identificadores raíz

```
  OBSERVATION_ID  (Registry V1 — RAÍZ inmutable, 10 años)
        │
        ├── ASSET_ID       1:N   bytes + sha256 + modalidad
        │                         (corrección => nuevo asset_id)
        │
        ├── EVENT_ID       N:M   ocurrencia real; cruza observaciones
        │                         (lluvia es event_type, no ID)
        │
        └── EVIDENCE_ID    0:N   derivada, hija, hereda estado y confianza
                  │
                  ├── EVDVER_   1:N   versiones append-only
                  ├── EVDCHAIN_ 1     cadena de custodia
                  └── EVDREL_   0:N   relaciones tipadas
                            │
                            ▼
                     REPORT_ID (ACP — fuera del Ledger)
                            │
                            ▼
                       DOC_ID (KH — promoción gobernada)
```

| Relación | Card. | Regla de integridad | Si falla |
|---|---|---|---|
| `observation_id → asset_id` | 1:N | Un asset pertenece a exactamente una observación (AS-5). | `BLOCKED` |
| `asset_id → event_id` | N:M | Reconocimiento declarado; nunca por timestamp (EV-2, TEL-11). | `PARTIAL` |
| `observation_id + asset_id → evidence_id` | 1:N | Derivación con método, versión, huella y productor. | `BLOCKED` |
| `evidence_id → evdver_` | 1:N | `supersedes` + vigencia; nunca última fila (EVER-2). | `BLOCKED` |
| `evidence_id → evdchain_` | 1:1 por entrada | Huella encadenada, actor y razón. | `BLOCKED` |
| `evidence_id → evdrel_` | 0:N | Tipos cerrados, sin ciclos (EREL-4). | `BLOCKED` |
| `evidence_id[] → report_id` | 0:N | Ancla obligatoria; confianza `MIN` (ACP-1/4). | `BLOCKED` / `NO_DATA` |
| `report_id → doc_id` | 0:N | Promoción gobernada, referencia sin copia (KH-2/3). | `PARTIAL` |

**Regla REL-1:** la evidencia **nunca** se convierte en asset: un cambio de bytes produce otro `asset_id` y otra versión, no una fusión de IDs.
**Regla REL-2:** la evidencia **nunca** sustituye al evento: si dos evidencias comparten ocurrencia, se declara `event_id`; no se infiere (OR-2).
**Regla REL-3:** ningún ID del Ledger aparece como raíz de ACP ni de KH; el ancla sigue siendo `observation_id` (REG-2, ACP-1).

---

# 5. Cadena de custodia

## 5.1 Definición

La **cadena de custodia** es la sucesión ordenada y encadenada de entradas que explica, desde la producción hasta la promoción o exportación, quién tuvo la evidencia, qué hizo con ella y por qué. Se materializa en `EVIDENCE_CHAIN_ID` con `prev_chain_sha256`.

## 5.2 Etapas oficiales

| # | Etapa | `action` | Requisito de entrada | Salida |
|---|---|---|---|---|
| 1 | **Producción** | `PRODUCED` | `observation_id` + `asset_id` + método + versión + `produced_by` + huella + zona | `evidence_id` nace con estado heredado |
| 2 | **Verificación** | `INTEGRITY_CHECKED` | `sha256` recalculado coincide | Huella confirmada; divergencia ⇒ `BLOCKED` |
| 3 | **Sellado** | `SEALED` | `ObservationPackage` verificado (PL-5/6) | Vista inmutable; sin copia de bytes |
| 4 | **Entrega** | `DELIVERED` | `delivery_manifest` en `PENDING_ACCEPTANCE` (P7-2) | Nunca se afirma `accepted` |
| 5 | **Consumo** | `CONSUMED` | `report_id` con `anclas[]` y `MIN` | El ACP lee; **no escribe** |
| 6 | **Cura o corrección** | `CORRECTED` | Razón + autor + versión nueva | Original intacto; `supersedes` |
| 7 | **Retiro / disputa** | `RETIRED` / `DISPUTED` | Motivo declarado; ambas partes conservadas | Sin borrado; veredicto degrada |
| 8 | **Reemplazo / división / combinación** | `REPLACED` / `SPLIT` / `COMBINED` | Relación declarada a los IDs de origen | Linaje completo |
| 9 | **Promoción** | `PROMOTED` | Revisión del Hangar de Autenticidad | `doc_id` por referencia |
| 10 | **Exportación** | `EXPORTED` | Destino + huella | Original permanece (PRES-3) |

## 5.3 Reglas de custodia

| ID | Regla |
|---|---|
| CUS-1 | Toda entrada lleva `actor_id`, `actor_role`, `at`, `timezone`, `reason`, `before`, `after` y `entry_sha256`. |
| CUS-2 | `prev_chain_sha256` garantiza orden; roto ⇒ `BLOCKED`. |
| CUS-3 | Registrar ≠ auditor ≠ productor con autoridad única sobre la misma entrada (AUD-3). |
| CUS-4 | La custodia **no mejora** el estado ni la confianza: hereda y degrada (F3E-2, ACP-4). |
| CUS-5 | Una evidencia `REF` mantiene su cadena de origen externo separada de la cadena de evaluación propia. |
| CUS-6 | Los datos sensibles se redactan **en la vista**, nunca se eliminan de la cadena (POS-2/3, P3-3). |
| CUS-7 | La cadena se conserva 10 años, sin compactación destructiva (MP-13, P-IA-7). |
| CUS-8 | Ninguna etapa autoriza IA, entrenamiento ni inferencia por sí misma. |

---

# 6. Los seis escenarios

| Escenario | Acción gobernada | ID que CAMBIA | ID que NO cambia | Reglas |
|---|---|---|---|---|
| **Se corrige** | Nueva `evdver_` con `supersedes`; entrada `CORRECTED`; relación `CORRECTS`; versión anterior legible. | `evdver_`, `evdchain_`, `evdrel_` | `evidence_id`, `observation_id`, versión original | EVER-1, OH-2, OR-3 |
| **Se retira** | Marca `RETIRED` con motivo; relación `RETIRES`/`PRECEDED_BY`; sin borrado; consumidores degradan. | `evdchain_`, `evdrel_` | `evidence_id`, `observation_id`, entrada original | PRES-1, MG-5, AEL-9 |
| **Se controvierte** | Entrada `DISPUTED` + relación `CONTRADICTS`/`DISPUTES`; **ambas versiones** quedan visibles; veredicto `PARTIAL`; ninguna gana por inferencia. | `evdchain_`, `evdrel_` | `evidence_id`, ninguna evidencia se elimina | EREL-1, ACR-5, AUD-8 |
| **Se reemplaza** | Nuevo `evidence_id` con `REPLACES`; la anterior queda como histórica y sigue resoluble. | `evidence_id` nueva, `evdver_`, `evdchain_`, `evdrel_` | `observation_id`, `evidence_id` original | EID-3, OR-3, PRES-1 |
| **Se divide** | Nuevos `evidence_id` con `DERIVED_FROM`/`SPLIT_INTO` y grupo de división declarado; el original intacto. | N `evidence_id`, `evdrel_`, `evdchain_` | `observation_id`, `evidence_id` original | DS-2, EREL-2 |
| **Se combina** | Nuevo `evidence_id` con `COMBINED_FROM` hacia cada fuente; huella propia; fuentes intactas. | `evidence_id` nueva, `evdrel_`, `evdchain_` | `observation_id`, evidencias fuente | EID-1, EREL-4, EVER-4 |

> **Regla de los seis escenarios:** en **corregir**, **retirar** y **controvertir** el `evidence_id` se mantiene. En **reemplazar**, **dividir** y **combinar** se crean IDs nuevos **con linaje declarado**. En ningún caso se borra, se reescribe ni se cambia `observation_id`.

---

# 7. Append-only como principio oficial

| ID | Regla |
|---|---|
| **AP-1** | El contrato del Ledger **no contiene** `DELETE`, `UPDATE`, `TRUNCATE` ni reescritura in-place. |
| **AP-2** | Toda corrección es una entrada o versión nueva con `supersedes`; el error se declara, nunca se tacha. |
| **AP-3** | Toda entrada se encadena por `prev_chain_sha256` y lleva `entry_sha256`; huella rota ⇒ `BLOCKED`. |
| **AP-4** | Un error humano se corrige con otra entrada que lo declara; la entrada original permanece como evidencia del proceso. |
| **AP-5** | Retención mínima declarada: **10 años**; sin compactación destructiva (MP-13). |
| **AP-6** | Exportar no vacía el Ledger: genera `EXPORTED` y deja el original intacto (PRES-3). |
| **AP-7** | La redacción de datos sensibles ocurre **en la vista**, no en el registro (SRCH-9). |
| **AP-8** | El ahorro de espacio se logra con capas frías y manifiestos, nunca con pérdida (B-20). |
| **AP-9** | Los marcadores (`RETIRED`, `DISPUTED`, `SUPERSEDED_BY`, `valid_to`) son **datos**, no borrados. |
| **AP-10** | AP es un eje **ortogonal** a los 7 estados y a los 5 veredictos: ser append-only no mejora nada. |

**Frase oficial:** *el Ledger no reescribe la historia; la historia se escribe hacia adelante.* Nadie necesita borrar para corregir, porque corregir ya es escribir.

---

# 8. Cómo consume el ACP

| ID | Regla |
|---|---|
| **AEL-1** | El ACP lee **Registry → Evidence Ledger → KH registry**, en ese orden (ACP-2). |
| **AEL-2** | El ACP llega por `observation_id` y obtiene `evidence_id[]` de la versión vigente del Registry. |
| **AEL-3** | El ACP resuelve la versión vigente de cada evidencia por `supersedes`, nunca por "la última fila" (EVER-2). |
| **AEL-4** | Confianza = `MIN` de anclas × cobertura × penalidad por estado no-`REAL`; el ACP **nunca la sube** (ACP-4). |
| **AEL-5** | Veredictos permitidos: los **5 canónicos**. `HIPÓTESIS` sigue inactivo (G-IA-1 pendiente). |
| **AEL-6** | `NO_DATA` jamás se rellena con inferencia: se reporta `NO_DATA`/`PARTIAL` (ACP-5). |
| **AEL-7** | El ACP **no escribe** en el Ledger: produce `report_id` con `anclas[]` (ACP-3, AUT-5). |
| **AEL-8** | Evidencia `DISPUTED` ⇒ veredicto `PARTIAL`; nunca `RESOLVED` por mayoría ni por fecha. |
| **AEL-9** | Evidencia `RETIRED` ⇒ `NO_DATA` o `BLOCKED` según dependencia de la afirmación. |
| **AEL-10** | Evidencia `REF` se cita como referencia, jamás como evaluación propia (TG-10, DS-8). |
| **AEL-11** | Evidencia con personas sin consentimiento ⇒ bloque omitido y `PARTIAL` (ACP-6, CUS-6). |
| **AEL-12** | Hoy el ACP **no consume nada**: es consumidor futuro bajo misión y gates propios (ACP-8, ACR-10). |

---

# 9. Cómo consume el Knowledge Hub

| ID | Regla |
|---|---|
| **KEL-1** | El KH **no escribe** en el Ledger; solo lee por `observation_id` y `evidence_id` (KH-1). |
| **KEL-2** | La existencia de evidencia **no** la convierte en conocimiento: hace falta promoción gobernada (KH-2). |
| **KEL-3** | La promoción pasa por el **Hangar de Autenticidad**; el registry se regenera, nunca se edita a mano (F3E §4). |
| **KEL-4** | `doc_id` es referencia al registry documental, nunca copia de bytes ni del envelope (KH-3). |
| **KEL-5** | `docsByEvidence` y `docsByObservation` se derivan **por lectura**: fuente única, sin doble escritura (MP-8, KHR-1). |
| **KEL-6** | La relación es N:M derivada: una evidencia sustenta muchos documentos y un documento muchas evidencias (KH-5). |
| **KEL-7** | El KH presenta los **7 estados honestos**; jamás muestra `DISENO` o `REF` como `REAL` (KH-6). |
| **KEL-8** | El KH no eleva la confianza heredada; muestra `MIN` y su cobertura (ACP-4). |
| **KEL-9** | Los conflictos documentales se resuelven por **D-003**, no por el Ledger (KHR-8). |
| **KEL-10** | Si el KH detecta un vínculo incorrecto, **propone** una relación `evdrel_` con `reason`; no la escribe (KHR-7). |

---

# 10. `REPORT_ID` y `EVIDENCE_ID`

## 10.1 Contrato del reporte

`report_id` pertenece al ACP (C-5, ACP-3). El Ledger **no lo crea**: solo declara cómo se relaciona con la evidencia que sustenta cada afirmación.

| Campo del reporte | Obligación | Regla |
|---|---|---|
| `report_id` · `verdict` | OBLIGATORIAS | Uno de los 5 canónicos; sin veredicto nuevo. |
| `observation_id` · `observation_version_id` | OBLIGATORIAS | Ancla raíz y versión consumida (LLM-1, ACR-3). |
| `evidence_id[]` · `evidence_version_ids[]` | OBLIGATORIAS | Anclas de evidencia y versión exacta leída. |
| `confidence` | OBLIGATORIA | `MIN` de anclas × cobertura × penalidad; nunca subida. |
| `state_distribution` | OBLIGATORIA | Heredada de las evidencias; no mejora estados. |
| `produced_by` | OBLIGATORIO | ACP — **nunca** productor de evidencia. |
| `at` · `timezone` | OBLIGATORIOS | Momento con zona. |

## 10.2 Reglas de relación

| ID | Regla |
|---|---|
| **REP-1** | Relación tipada: `evidence_id` —`SUPPORTS`→ `report_id`; `report_id` —`REPORTED_BY`→ `observation_id`. |
| **REP-2** | Un reporte puede anclar **0..N** evidencias. Con 0 anclas: `NO_DATA`/`UNANSWERABLE`, **nunca** `RESOLVED`. |
| **REP-3** | El reporte **no modifica** la evidencia: no escribe versión, entrada ni relación nueva en el Ledger. |
| **REP-4** | Si una evidencia se corrige después, el reporte antiguo sigue anclado a `evidence_version_ids[]` originales: no se reescribe. |
| **REP-5** | Un reporte no convierte evidencia en conocimiento; requiere promoción gobernada (KH-2). |
| **REP-6** | `evidence_id[]` sin `observation_id` ⇒ `BLOCKED` (ACR-2). |
| **REP-7** | La confianza del reporte es `≤ MIN` de sus anclas; agregar evidencias nunca la incrementa (ACR-4). |
| **REP-8** | Un `report_id` citado sin sus `evidence_version_ids[]` es `PARTIAL`: no se puede reconstruir qué se leyó. |

---

# 11. De la observación al conocimiento: los cuatro escalones

```
  1. OBSERVACIÓN   observation_id        estado honesto + assets + evento
        │  derivación gobernada (productor + método + versión + huella)
        ▼
  2. EVIDENCIA     evidence_id          estado Y confianza HEREDADAS, nunca elevadas
        │  interpretación anclada (ACP lee; LLM interpreta; ninguno crea)
        ▼
  3. REPORTE       report_id            veredicto + anclas[] + confianza MIN
        │  promoción gobernada (Hangar de Autenticidad + D-003)
        ▼
  4. CONOCIMIENTO  doc_id               referencia + registry regenerado + docsByEvidence derivado
```

| Escalón | Puerta de entrada | Puerta de salida | Prohibición |
|---|---|---|---|
| Observación → Evidencia | `observation_id` + `asset_id` + productor gobernado + método + huella | `evidence_id` con estado heredado | Crear evidencia sin observación; elevar estado. |
| Evidencia → Reporte | `evidence_id[]` vigente por `supersedes` | `report_id` con veredicto de los 5 canónicos | ACP o LLM escribiendo en el Ledger; `NO_DATA` rellenado. |
| Reporte → Conocimiento | Revisión de autenticidad + gobernanza documental | `doc_id` por referencia, registry regenerado | Escritura ad-hoc; copia de bytes; salto sin gobernanza. |

**Regla ASC-1:** no se puede saltar un escalón. De observación a reporte sin `evidence_id` ⇒ `NO_DATA`/`BLOCKED`. De reporte a conocimiento sin promoción ⇒ `PARTIAL`.
**Regla ASC-2:** ningún escalón mejora el estado de honestidad ni la confianza; la cadena solo **hereda o degrada**.
**Regla ASC-3:** el retroceso es lectura: desde un `doc_id` se reconstruyen reporte, evidencia, asset y observación por las mismas anclas (TRZ-3).
**Regla ASC-4:** la evidencia controvertida se detiene en el escalón 2 con `PARTIAL`; no asciende hasta que un humano gobernado lo resuelva con nueva entrada.

---

# 12. Auditoría y búsqueda

## 12.1 Auditoría

| ID | Regla |
|---|---|
| AUL-1 | Toda entrada lleva actor, rol, razón, zona horaria, antes/después y huella; sin ellos ⇒ `BLOCKED`. |
| AUL-2 | La cadena se verifica por `prev_chain_sha256`; huella rota ⇒ `BLOCKED`. |
| AUL-3 | Registrar ≠ auditor ≠ productor con autonomía sobre la misma entrada. |
| AUL-4 | Auditar es solo lectura: el auditor no corrige, no retira y no promociona. |
| AUL-5 | Toda correlación se audita por `event_id` declarado, nunca por timestamp (EREL-1). |
| AUL-6 | Toda exportación produce `EXPORTED` con destino y huella (AP-6). |
| AUL-7 | Veredictos de auditoría: los 5 canónicos; no se inventa `AUDIT_OK` ni `CLEAN`. |
| AUL-8 | El auditor reconstruye el estado en cualquier fecha por `valid_from/valid_to`, sin sistema externo. |
| AUL-9 | Un hallazgo se corrige con nueva entrada; cerrarlo nunca lo borra (AP-4). |
| AUL-10 | Retención mínima: 10 años, sin compactación destructiva (AP-5). |

## 12.2 Búsqueda

| ID | Regla |
|---|---|
| BS-1 | Solo lectura; devuelve IDs + estado + versión + cadena + veredicto, nunca bytes por defecto. |
| BS-2 | Coincidencia **exacta** por ID; prohibido `LIKE`, prefijo, fuzzy e inferencia (SRCH-2). |
| BS-3 | Toda búsqueda temporal exige rango **y `timezone`**; sin zona ⇒ `BLOCKED`. |
| BS-4 | `domain` son facets declarados: `domain.modality` · `domain.telemetry_domain_id` · `domain.scene_id` · `domain.source_tier`. |
| BS-5 | No se infiere dominio desde `class_id`, `event_type` ni similitud (SRCH-5). |
| BS-6 | IDs opacos: no se descomponen ni se ordenan por su texto (OBS-10). |
| BS-7 | Resultado vacío es `NO_DATA` gobernado, nunca error silencioso (SRCH-7). |
| BS-8 | Consultar no muta; solo exportar genera entrada `EXPORTED` (ECH-4). |
| BS-9 | Resultados redactan `posicion` y personas sin consentimiento (CUS-6). |
| BS-10 | Filtrar `REAL` nunca devuelve `SIM`, `REF` ni `DISENO` (SRCH-10). |
| BS-11 | Búsquedas obligatorias: `evidence_id` · `observation_id` · `asset_id` · `event_id` · fecha con zona · `source_tier` · `session_id` · `place_id` · `produced_by` · `method.version`. |

---

# 13. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado |
|---|---|---|
| **G-EL-1** | 3 documentos visibles con D-004.6 y subordinación al Registry V1 | `DISENO` |
| **G-EL-2** | 4 identificadores definidos, ninguno raíz de observación | `DISENO` |
| **G-EL-3** | Autoría declarada; ACP y LLM explícitamente excluidos | `DISENO` |
| **G-EL-4** | Relación observation/asset/event/evidence verificable sin inferencia | `DISENO` |
| **G-EL-5** | Cadena de custodia encadenada por huella | `DISENO` |
| **G-EL-6** | 6 escenarios sin borrado + append-only oficial | `DISENO` |
| **G-EL-7** | Consumo ACP/KH de solo lectura y `report_id` con anclas | `DISENO` |
| **G-EL-8** | 4 escalones sin salto y 30 riesgos registrados | `DISENO` |
| **G-EL-9** | Escala y preservación sin cambiar `observation_id` ni el Registry | `DISENO` |

---

# 14. Cierre

**Criterio de éxito:** obtener la **fuente oficial de evidencia** del ecosistema SIGCT-Rural **sin cambiar `observation_id` ni `OBSERVATION_REGISTRY_V1`**. Se satisface en el plano contractual: el Ledger es hijo del Registry, hereda su ancla y sus estados, gobierna solo la evidencia derivada y expresa todo cambio con `supersedes`, cadenas encadenadas y relaciones tipadas. La verificación operativa pertenece al roadmap y permanece `DISENO`.

**Estado honesto:** **OFICIAL y DISEÑADO**. Sin base de datos, API, UI, IA, código, captura ni entrenamiento. Sin modificar el Registry V1, la Platform V1, el Masterplan V1 ni las gobernanzas de audio, visión y telemetría. Sin commit, push, merge ni tag. Los 9 gates permanecen abiertos.

---

*Fin del Libro Mayor de Evidencia V1. Complementa —nunca sustituye— el Observation Registry V1, la Observation Platform V1, F3E, la Carta IA, la Constitución y D-003.*
