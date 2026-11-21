# ARQUITECTURA DEL ACP COMO CONSUMIDOR ESTRICTO V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T23:30:38-05:00
> - Origen: misión `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1` (documento nuevo)
> - Destino: `docs/governance/SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: arquitectura y gobernanza del consumidor oficial de evidencia. No crea agente, IA, LLM, prompt, RAG, embedding, API, UI ni base de datos.

**Misión:** `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1`
**Naturaleza:** contrato **declarativo**. Define la interfaz de consumo del ACP, no su implementación.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Estado:** **OFICIAL — DISEÑADO**. La arquitectura existe; materializar el consumidor requiere misión explícita y gates propios.
**Siglas:** **ACP = Analytical Cognitive Processor**. En la Carta IA y en F4 se le denomina también *Agente Científico Principal* / *Orquestador Científico del Ecosistema*. **Es el mismo sujeto gobernado IA-1**; no se crea una segunda entidad.

| Documento | Autoridad |
|---|---|
| `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md` | Definición, límites, IDs de proceso, ciclo, veredictos, confianza, anclas, reglas y coherencia |
| `ACP_ENTITY_MODEL_V1.md` | **10 diagramas ASCII**, entidades, cardinalidades, estados y fixtures de rechazo |
| `ACP_ROADMAP_V1.md` | Fases, gates, **40 riesgos** con severidad, umbral, mitigación y fixture |

**Subordinación:** Constitución V1.0.1 → Carta IA V1.0.1 → D-003 → Gobernanza Multimodal V1 → Masterplan V1 → Platform V1 → Registry V1 → Evidence Ledger V1 → gobernanzas acústica / visión / telemetría → **esta arquitectura** → documentos especializados.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante de raíz:** `OBSERVATION_ID` sigue siendo la **raíz única** del ecosistema. Las raíces gobernadas `OBSERVATION_ID` · `EVIDENCE_ID` · `EVENT_ID` no se crean ni se modifican aquí; ningún ID definido en esta arquitectura compite con ellas.
> **Invariante de consumidor:** **el ACP solo consume.** No crea observaciones, no crea eventos, no crea evidencia, no modifica el Registry, no modifica el Ledger.
> **Invariante de honestidad:** los **7 estados canónicos** (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`) no se amplían.
> **Invariante de veredicto:** los **5 veredictos** (`RESOLVED` · `PARTIAL` · `NO_DATA` · `BLOCKED` · `UNANSWERABLE`) son vocabulario cerrado. **`HIPÓTESIS` permanece inactivo**, PENDIENTE de G-IA-1.
> **Invariante de confianza:** `C ≤ MIN(anclas) × cobertura × penalidad_no-REAL`. **Nunca supera la evidencia más débil.**
> **Invariante de no-ejecución:** no se crea agente, IA, LLM, prompt, RAG, embedding, API, UI ni base de datos. Todo eso queda **`DISENO`** y fuera de alcance.

---

# 0. Propósito y límite

El ecosistema ya puede capturar, identificar, trazar, versionar y custodiar evidencia. Le falta el **consumidor oficial**: la función que transforma preguntas en respuestas ancladas sin fabricar nada. Esa función es el ACP.

**Lo que SÍ define esta arquitectura:** qué es el ACP, qué puede leer, qué puede producir, sus IDs de proceso, el ciclo de consumo, los veredictos, la confianza, las anclas, la trazabilidad y la auditoría.

**Lo que NO hace — límite duro:**

| No hace | Detalle |
|---|---|
| No implementa código | Ningún `.js`, `.py`, `.jsx`, servicio ni firmware. |
| No crea API ni endpoints | Define flujo lógico de lectura, no rutas ni contratos HTTP. |
| No crea UI | Define respuesta lógica, no pantallas ni formularios. |
| No crea base de datos | Define trazas como contrato, no tablas ni índices físicos. |
| **No crea agentes** | Los 6 sub-agentes de F4 quedan referenciados como **`DISENO`**, sin materializar. |
| **No crea IA** | Ningún modelo se entrena, carga ni invoca. |
| **No crea prompts** | No se redacta ninguna instrucción para modelo de lenguaje. |
| **No crea LLM** | El slot `Interprete` queda declarado, vacío y agnóstico de proveedor (F4 §16). |
| **No crea RAG ni embeddings** | Ningún índice vectorial ni recuperación semántica se define ni se ejecuta. |
| No modifica documentos existentes | Platform, Registry, Ledger, gobernanzas y Carta IA quedan intactos. |
| No cambia raíces | `observation_id`, `evidence_id` y `event_id` no se alteran. |

> Estado honesto: hoy existen **0 queries ACP**, **0 trazas** y **0 reportes** gobernados por esta arquitectura. El ACP operativo sigue siendo **`DISENO`** (ACP-8, ACR-10, AEL-12).

---

# 1. Qué es el ACP

El **ACP (Analytical Cognitive Processor)** es la **función gobernada de consumo analítico** del ecosistema: recibe una pregunta, resuelve la observación y la evidencia gobernadas por sus anclas, aplica filtros declarados, produce afirmaciones ancladas, asigna un veredicto del vocabulario cerrado, calcula una confianza conservadora y emite un reporte como salida.

**En una frase:** *el ACP es el lector honorable del ecosistema: convierte evidencia ya gobernada en respuestas que pueden reconstruirse hasta la observación original, sin añadir un solo hecho nuevo.*

| Característica | Valor |
|---|---|
| Naturaleza | Función de consumo; **no** chatbot, **no** LLM, **no** fuente de verdad (Carta IA IA-1, F4) |
| Cadena de autoridad | `CONSTITUCIÓN → CARTA IA → ACP → EVIDENCE LEDGER → KNOWLEDGE HUB` |
| Entrada | `ACP_QUERY_ID` con pregunta y contexto de sesión |
| Fuentes | Observation Registry → Evidence Ledger → KH registry, **en ese orden** (ACP-2) |
| Salida | `ACP_REPORT_ID` con veredicto, afirmaciones ancladas, confianza y cobertura |
| Memoria | `ACP_TRACE_ID`, append-only, reconstruible |
| Proveedor | Agnóstico: línea base determinista sin-LLM; slot `Interprete` intercambiable (F4 §16) |

## 1.1 Qué NO es el ACP

| ❌ NO es | Detalle |
|---|---|
| Un generador de observaciones | No crea `observation_id`: nace en la captura (OB-1, RA-1). |
| Un generador de eventos | `lluvia`, `plaga`, `motor_activo` son `event_type`, no IDs creados por el ACP. |
| Un productor de evidencia | No escribe en el Ledger; la evidencia la produce el productor gobernado (AUT-5). |
| Un escritor del Registry | No asigna IDs, no cierra versiones, no escribe historia (ACR-6). |
| Un escritor del Ledger | No produce entradas `evdchain_` ni versiones `evdver_` (AEL-7). |
| Un decisionador del KH | No promueve conocimiento; propone y el KH decide (KH-2, KEL-3). |
| Un modelo de lenguaje | El LLM es una pieza opcional, no la identidad del orquestador (Carta IA R-9.5). |
| Un buscador fuzzy | No infiere relaciones por similitud, fecha ni vector (BS-2/5). |
| Un agente autónomo que ejecuta labs | Consulta, cruza y devuelve hallazgos; no ejecuta (F4 §6). |
| Un proveedor de veredictos nuevos | Vocabulario cerrado; `HIPÓTESIS` inactivo (G-IA-1). |

---

# 2. Responsabilidad exacta

| # | Responsabilidad | Límite verificable |
|---|---|---|
| **R-1** | Recibir una pregunta con `ACP_QUERY_ID` y `ACP_SESSION_ID`. | No la transforma en observación ni en evento. |
| **R-2** | Resolver `observation_id` en el Registry por coincidencia exacta. | Sin parseo del ID opaco (OBS-10). |
| **R-3** | Resolver la versión vigente por `supersedes` + vigencia. | Nunca "la última fila" (VER-4, EVER-2). |
| **R-4** | Leer `evidence_id[]` del Ledger para esa observación. | Sin inferir evidencia nueva. |
| **R-5** | Aplicar filtros declarados: estado, `source_tier`, licencia, consentimiento, zona. | Sin filtro implícito ni discriminación inventada. |
| **R-6** | Analizar solo lo leído: cruzar anclas y detectar contradicciones **declaradas**. | No resuelve disputas por votos, fecha ni confianza. |
| **R-7** | Producir afirmaciones con ancla obligatoria. | Sin ancla ⇒ `BLOCKED`. |
| **R-8** | Asignar uno de los 5 veredictos canónicos. | Sin veredictos nuevos. |
| **R-9** | Calcular confianza por `MIN` × cobertura × penalidad. | Nunca por encima de la evidencia más débil. |
| **R-10** | Emitir `ACP_REPORT_ID` y preservar `ACP_TRACE_ID`. | No escribe en Registry ni Ledger. |
| **R-11** | Proponer candidatos de promoción al KH. | No promueve; el KH decide. |
| **R-12** | Degradar honestamente cuando falta evidencia o hay conflicto. | `PARTIAL` / `NO_DATA` / `BLOCKED` / `UNANSWERABLE`. |

---

# 3. Qué puede leer / qué no puede leer

## 3.1 Puede leer

| Fuente | Campo | Regla |
|---|---|---|
| Observation Registry | `observation_id`, versión vigente, `asset_ids[]`, `event_ids[]`, `evidence_ids[]`, `doc_ids[]`, `state_distribution`, `valid_from/valid_to` | Solo lectura; resolución exacta (ACR-1..3). |
| Evidence Ledger | `evidence_id`, `evdver_`, versión vigente, `evdchain_` (custodia), `evdrel_` declaradas, estado/confianza heredadas, `source_tier`, `sha256` | Solo lectura; sin escritura (AEL-1..12). |
| KH registry | `doc_id`, `docsByObservation`, `docsByEvidence`, categorías KH | Derivado por lectura; fuente única (KEL-5, KHR-1). |
| `ObservationPackage` | Vista inmutable por `observation_id` | Paquete derivado, no copia (PL-5). |
| Carta IA y gobernanzas | Vocabulario de estados, veredictos y reglas | Como contrato, no como dato. |

## 3.2 No puede leer como fuente de verdad

| Fuente | Por qué | Resultado si se intenta |
|---|---|---|
| Un LLM / `Interprete` | No es fuente de verdad (Carta IA R-9.3). | `BLOCKED`; puede interpretar, no anclar. |
| Un prompt | No es evidencia; no se crea en esta misión. | `BLOCKED`. |
| Un embedding / índice vectorial | No existe ni está gobernado. | `BLOCKED`. |
| RAG no gobernado | Sin ancla ni versión, no es reconstruible. | `BLOCKED`. |
| Un archivo directo del dataset | Sin `observation_id` no es evidencia (AUT-1). | `BLOCKED`. |
| Bytes de un asset sin huella verificada | Sin `sha256` no hay evidencia (PL-10). | `BLOCKED`. |
| Memoria conversacional previa no anclada | No es fuente de verdad. | `BLOCKED`. |
| `event_id` inferido por timestamp | Sin declaración no existe (TEL-11, OR-1). | `PARTIAL`/`BLOCKED`. |

**Regla LECT-1:** leer no es producir. Una query no genera entradas en el Registry ni en el Ledger (ECH-4, BS-8).
**Regla LECT-2:** todo lo leído queda registrado en `ACP_TRACE_ID` con su `ID` y su **versión exacta**.

---

# 4. Qué puede producir / qué no puede producir

## 4.1 Puede producir

| Salida | Identificador | Naturaleza |
|---|---|---|
| **Query** | `ACP_QUERY_ID` | Registro lógico de la pregunta. |
| **Sesión** | `ACP_SESSION_ID` | Agrupador de queries en el tiempo. |
| **Traza** | `ACP_TRACE_ID` | Registro append-only de la decisión. |
| **Reporte** | `ACP_REPORT_ID` | Salida con veredicto, afirmaciones ancladas, confianza y cobertura. |
| **Afirmación anclada** | (parte del reporte) | Texto + `observation_id`/`evidence_id` + versión + estado + confianza. |
| **Propuesta de promoción** | (campo del reporte) | Candidato a KH; **no** promoción efectiva. |

## 4.2 No puede producir

| No puede producir | Regla |
|---|---|
| `observation_id` | OB-1, RA-1, CR-1 |
| `asset_id` ni bytes | AS-1/2; el ACP no captura |
| `event_id` | EV-2; el evento es ocurrencia real, no interpretación del ACP |
| `evidence_id`, `evdver_`, `evdchain_`, `evdrel_` | AUT-5, AEL-7, CR-3 |
| `obsver_`, `obshist_`, `obsrel_` | ACR-6, CR-4 |
| `doc_id` | KH-2, KEL-3; el KH promociona |
| Veredicto nuevo | Vocabulario cerrado; `HIPÓTESIS` inactivo |
| Confianza superior a sus anclas | ACF-2 (dura) |
| Hecho, métrica, clase o taxonomía nueva | P-IA-5; N-1 |
| Agente, modelo, prompt, RAG o embedding | Límite duro de esta misión |

---

# 5. Reglas críticas (invariantes de consumo)

| ID | Regla dura | Consecuencia de violación |
|---|---|---|
| **CR-1** | **ACP NO CREA OBSERVACIONES.** | `BLOCKED`; ninguna query puede convertirse en `observation_id`. |
| **CR-2** | **ACP NO CREA EVENTOS.** | `BLOCKED`; ninguna correlación del ACP crea `event_id`. |
| **CR-3** | **ACP NO CREA EVIDENCIA.** | `BLOCKED`; ninguna interpretación se escribe en el Ledger. |
| **CR-4** | **ACP NO MODIFICA OBSERVATION REGISTRY.** | `BLOCKED`; cero escrituras en `obsver_`/`obshist_`/`obsrel_`. |
| **CR-5** | **ACP NO MODIFICA EVIDENCE LEDGER.** | `BLOCKED`; cero escrituras en `evdver_`/`evdchain_`/`evdrel_`. |
| **CR-6** | **ACP SOLO CONSUME.** | Toda salida es reporte o traza; nunca un hecho gobernado. |

---

# 6. Los cuatro identificadores del ACP

> **Regla de no-competencia:** ninguno de los cuatro es raíz de evidencia. Son **IDs de proceso**; siempre referencian `observation_id` y/o `evidence_id` como anclas. No sustituyen a `observation_id`, `evidence_id` ni `event_id`.

| ID solicitado | Prefijo | Naturaleza | Depende de | Estado |
|---|---|---|---|---|
| `ACP_QUERY_ID` | `acpq_` | Pregunta gobernada | `ACP_SESSION_ID` | **Nuevo, `DISENO`** |
| `ACP_SESSION_ID` | `acps_` | Sesión de interacción | ninguna (agrupador) | **Nuevo, `DISENO`** |
| `ACP_TRACE_ID` | `acpt_` | Traza append-only de una decisión | `ACP_QUERY_ID` | **Nuevo, `DISENO`** |
| `ACP_REPORT_ID` | `acprep_` | Salida con veredicto y anclas | `ACP_QUERY_ID` | **Alias gobernado de `report_id`** |

## 6.1 `ACP_SESSION_ID` — `acps_<YYYYMMDD>_<seq6>`
Agrupa queries y trazas de una interacción. No contiene evidencia, no decide y no persiste como raíz. Referencia: `session_id` de procedencia del Registry (SRCH-6).

## 6.2 `ACP_QUERY_ID` — `acpq_<YYYYMMDD>_<seq6>`
Identifica una pregunta con su texto, timezone, solicitante y `session_id`. Es el disparador del ciclo; **no es una observación** (CR-1). Toda query lleva `requested_at` + `timezone`.

## 6.3 `ACP_TRACE_ID` — `acpt_<ACP_QUERY_ID>_<seq4>`
Registro append-only con: IDs consultados, versiones leídas, filtros aplicados, anclas consideradas, veredicto, confianza, cobertura, razón y `prev_trace_sha256`. La traza se preserva aunque la evidencia cambie después (Carta IA §15.2).

## 6.4 `ACP_REPORT_ID` — `acprep_<ACP_QUERY_ID>_<seq3>`
Es **el mismo `report_id`** definido por Platform C-5 / ACP-3, con prefijo explícito de autoría ACP. No es una nueva entidad y no compite con ninguna raíz. Contiene: `verdict` · `afirmaciones[]` · `observation_id` · `evidence_id[]` · `evidence_version_ids[]` · `confidence` · `coverage` · `state_distribution` · `promotion_candidate` · `at` + `timezone`.

| ID | ¿Compite con raíz gobernada? | Respuesta |
|---|---|---|
| `ACP_SESSION_ID` | `observation_id` | **No**: agrupa interacción, no sustenta evidencia. |
| `ACP_QUERY_ID` | `observation_id` | **No**: es pregunta, no ocurrencia. |
| `ACP_TRACE_ID` | `evidence_id` | **No**: es decisión, no artefacto reproducible. |
| `ACP_REPORT_ID` | `evidence_id` · `event_id` | **No**: es interpretación anclada, no hecho. |

---

# 7. Ciclo completo de consumo

```
  [1] PREGUNTA        ACP_QUERY_ID + ACP_SESSION_ID
          │
          ▼
  [2] REGISTRY        observation_id exacto + version vigente (supersedes)
          │
          ▼
  [3] LEDGER          evidence_id[] vigente + cadena + estado/confianza heredadas
          │
          ▼
  [4] FILTRO          estado · source_tier · licencia · consentimiento · timezone
          │
          ▼
  [5] ANÁLISIS        cruce de anclas + contradicciones DECLARADAS (sin inferencia)
          │
          ▼
  [6] RESPUESTA       afirmaciones ancladas + veredicto + C = MIN x cobertura x penalidad
          │
          ▼
  [7] REPORT_ID       ACP_REPORT_ID + ACP_TRACE_ID (append-only)
```

| Paso | Entrada | Acción permitida | Salida | Prohibición |
|---|---|---|---|---|
| 1 Pregunta | Texto + contexto | Registrar query y sesión | `ACP_QUERY_ID` | Convertirla en observación o evento. |
| 2 Registry | `observation_id` | Resolver existencia y versión vigente | IDs y estado | Parsear el ID; usar "última fila". |
| 3 Ledger | `evidence_id[]` | Leer versión vigente, custodia y anclas | Evidencia con estado/confianza | Escribir; crear evidencia. |
| 4 Filtro | Evidencia leída | Aplicar filtros declarados | Subconjunto gobernado | Rellenar `NO_DATA`; filtrar por similitud. |
| 5 Análisis | Subconjunto | Cruzar anclas, respetar disputas | Hallazgos anclados | Resolver conflictos por votos/fecha. |
| 6 Respuesta | Hallazgos | Asignar veredicto y calcular `C` | Respuesta con anclas | Subir confianza; veredicto nuevo. |
| 7 Reporte | Respuesta | Emitir reporte y preservar traza | `ACP_REPORT_ID` | Escribir en Registry, Ledger o KH. |

**Regla CIC-1:** el orden es **obligatorio**. No se puede pasar del paso 2 al 6 sin pasar por el Ledger, salvo para devolver `NO_DATA`/`BLOCKED` con la razón explícita.
**Regla CIC-2:** el paso 7 **nunca realimenta** el paso 2 ni el 3: el reporte no modifica las fuentes (CR-4/5).

---

# 8. Cuándo cada veredicto

| Veredicto | Condición completa | Ejemplo | Prohibición |
|---|---|---|---|
| **`RESOLVED`** | Todas las afirmaciones tienen ancla válida; versión vigente; sin `DISPUTED` ni `RETIRED` aplicable; cobertura completa; `C ≥ 0.30`. | Métrica ambiental con evidencia `REAL` anclada y huella verificada. | `RESOLVED` con ancla ausente o cobertura parcial. |
| **`PARTIAL`** | Hay anclas válidas pero falta cobertura, hay `DISPUTED` declarado, se omitió un bloque por consentimiento, o `C < 0.30` con anclas presentes. | Dos evidencias en contradicción declarada; se muestran ambas. | Elegir un bando por confianza o fecha. |
| **`NO_DATA`** | Dominio localizable, búsqueda gobernada vacía, o el paquete trae `NO_DATA`. | No hay evidencia de insects en ese `place_id`. | Rellenar, imputar o convertir en `0`. |
| **`BLOCKED`** | Afirmación sin ancla; huella rota; fuente `ROTO`; violación de regla de consumo; conflicto documental no resuelto por D-003. | `report_id` sin `observation_id`; cadena con `prev_sha256` roto. | Responder con afirmación débil en lugar de bloquear. |
| **`UNANSWERABLE`** | Pregunta fuera del ecosistema o sin cauce gobernado; exige taxonomía/clase/métrica no definida. | Preguntar por una clase fuera de las 9 clases acústicas vigentes. | Inventar la clase o responder con `PARTIAL` para salir del paso. |

**Regla VER-1:** vocabulario **cerrado**. No se crea `INFERRED`, `ESTIMATED`, `AUDIT_OK`, `CLEAN` ni **`HIPÓTESIS`** activo (G-IA-1 pendiente). Una predicción se expresa como `PARTIAL` con etiqueta no canónica "hipótesis", sin valor de estado.
**Regla VER-2:** diferencia dura — `NO_DATA` = **existe el cauce pero no hay datos**; `UNANSWERABLE` = **no existe cauce gobernado para esa pregunta**.
**Regla VER-3:** un veredicto se emite **por respuesta**, pero cada **afirmación** lleva su propia ancla y confianza (Carta IA §9.3).
**Regla VER-4:** ante duda entre dos veredictos, se elige el **más degradado** (UNANSWERABLE > BLOCKED > NO_DATA > PARTIAL > RESOLVED).

---

# 9. Confianza

## 9.1 Fórmula oficial

```
  C = MIN(confianza_de_anclas) × cobertura × penalidad_no-REAL
```

| Factor | Dominio | Regla |
|---|---|---|
| `MIN(confianza_de_anclas)` | 0..1 | **Mínimo honesto** de las evidencias citadas; nunca promedio ni máximo (Carta IA §8.2). |
| `cobertura` | (0, 1] | Fracción de la pregunta efectivamente cubierta por anclas; declarada, no implícita. |
| `penalidad_no-REAL` | [0, 1] | Factor reductor según el estado de honestidad heredado; **declarado por gobernanza**, no improvisado. |

**Regla de referencia (tabla `DISENO`, no operativa):** `REAL` 1.00 · `REAL-LOCAL` 0.90 · `REF` 0.70 · `SIM` 0.50 · `DISENO` 0.30 · `ROTO` 0.00 · `HUERFANO` 0.00. Estos valores son una propuesta declarativa pendiente de gate; **no están en vigor** y no autorizan cálculo operativo.

**Regla CF-UMBRAL:** `C < 0.30` o sin ancla ⇒ degradar a `BLOCKED` / `NO_DATA` / `UNANSWERABLE`, **nunca** afirmación débil (Carta IA §8.3).

## 9.2 15 reglas de confianza (`ACF-1..ACF-15`)

| ID | Regla |
|---|---|
| **ACF-1** | `C = MIN(anclas) × cobertura × penalidad_no-REAL`. |
| **ACF-2** | **Dura:** `C` nunca supera la evidencia más débil citada. |
| **ACF-3** | Nunca se calcula con promedio de anclas. |
| **ACF-4** | Nunca se calcula con máximo de anclas. |
| **ACF-5** | Nunca se calcula con suma de anclas. |
| **ACF-6** | Agregar más evidencias **no aumenta** `C`; puede disminuirlo. |
| **ACF-7** | El LLM / `Interprete` **no aumenta** `C`; solo interpreta. |
| **ACF-8** | La fluidez del lenguaje **no aumenta** `C`. |
| **ACF-9** | El consenso entre fuentes **no aumenta** `C`. |
| **ACF-10** | `cobertura` se declara explícitamente y está en (0, 1]. |
| **ACF-11** | `penalidad_no-REAL` se toma de gobernanza; nunca se inventa en la respuesta. |
| **ACF-12** | Ancla sin confianza declarada ⇒ `BLOCKED`/`NO_DATA`, nunca `1.0` por defecto. |
| **ACF-13** | `C < 0.30` degrada el veredicto según §8. |
| **ACF-14** | Un estado no-`REAL` penaliza; ninguna agregación lo mejora (MG-5). |
| **ACF-15** | Todo `C` se registra en `ACP_TRACE_ID` con sus tres factores y el `MIN` usado. |

---

# 10. Conflictos y estados de la evidencia

| Estado de la evidencia | Comportamiento del ACP | Veredicto resultante | No hace |
|---|---|---|---|
| **`SUPERSEDED`** | Usa la versión vigente por `supersedes` + `valid_from/valid_to`; cita la anterior solo como histórico. | `RESOLVED` si todo lo demás está completo. | Usar "la última fila". |
| **`RETRACTED`** (`RETIRED` en el Ledger) | No la usa como ancla de afirmación vigente; si la pregunta depende de ella, lo declara. | `NO_DATA` o `BLOCKED` según dependencia. | Borrarla ni fingir que nunca existió. |
| **`CORRECTED`** | Ancla la versión nueva y registra `evidence_version_ids[]` de la corrección; el reporte antiguo queda intacto. | `PARTIAL` si conviven versiones sin resolver; si no, `RESOLVED`. | Reescribir el reporte anterior. |
| **`DISPUTED`** | Muestra ambas partes, explica la contradicción **declarada** y no elige ganador. | **`PARTIAL`** obligatorio. | Resolver por votos, fecha, confianza o lenguaje. |

## 10.1 Conflictos entre evidencias

| ID | Regla |
|---|---|
| CONF-1 | Un conflicto solo existe si está **declarado** (`CONTRADICTS` / `DISPUTED` en el Ledger). |
| CONF-2 | El ACP **no infiere** conflictos por diferencia de valores, fechas ni confianza. |
| CONF-3 | Ante conflicto declarado, devuelve `PARTIAL` con ambas anclas y su razón. |
| CONF-4 | El ACP **no escribe** la resolución: la resuelve un humano gobernado con nueva entrada (ASC-4, D-EL5-2). |
| CONF-5 | Si una parte está `RETRACTED`, la otra no gana automáticamente: se reporta `PARTIAL` hasta decisión gobernada. |
| CONF-6 | El conflicto se registra en la traza con ambos `evidence_id` y sus versiones. |
| CONF-7 | Nunca se promedia ni se "reconcilia" un conflicto calculando un valor intermedio. |

---

# 11. `NO_DATA` — prohibición de relleno

| ID | Regla |
|---|---|
| ND-1 | `NO_DATA` es un **estado gobernado**, no ausencia silenciosa ni valor numérico. |
| ND-2 | **Prohibido rellenar** `NO_DATA` con inferencia, promedio, vecindario o modelo. |
| ND-3 | **Prohibido inferir** `NO_DATA`: no se deduce un valor a partir de otras observaciones. |
| ND-4 | **Prohibido convertir** `NO_DATA` en `0`, `null`, fila ausente ni cadena vacía. |
| ND-5 | `NO_DATA` se reporta como `NO_DATA` o `PARTIAL`, con "qué se buscó / qué falta". |
| ND-6 | `NO_DATA ≠ UNANSWERABLE`: aquel tiene cauce, este no (VER-2). |
| ND-7 | Un bloque `NO_DATA` del `ObservationPackage` se hereda sin modificar (ACP-5). |
| ND-8 | La confianza de un bloque `NO_DATA` no se calcula: se declara `NO_DATA`, sin `C` ficticia. |
| ND-9 | Rellenar `NO_DATA` produce `BLOCKED` en auditoría (AAUD-9). |
| ND-10 | Ningún LLM, RAG ni embedding puede completar un `NO_DATA` (P-IA-5, AUT-5). |

---

# 12. Anclas obligatorias

## 12.1 Definición

**Ancla** es el ID gobernado que convierte una afirmación en reconstruible. Solo dos IDs son anclas válidas:

| Ancla válida | Naturaleza | Uso |
|---|---|---|
| `observation_id` | Raíz del ecosistema (Registry). | Ancla de procedencia: qué se observó. |
| `evidence_id` | Derivada gobernada (Ledger). | Ancla analítica: qué se derivó y con qué método. |

## 12.2 Regla dura

> **TODA AFIRMACIÓN DEBE APUNTAR A `OBSERVATION_ID` O `EVIDENCE_ID`.**
> **AFIRMACIÓN SIN ANCLA = `BLOCKED`.**

## 12.3 IDs que NO son anclas suficientes

| ID | Por qué no | Si se usa como única ancla |
|---|---|---|
| `event_id` | Es ocurrencia interpretada; cruza observaciones. | `BLOCKED` (se requiere además `observation_id`). |
| `report_id` / `ACP_REPORT_ID` | Es salida del ACP, circular. | `BLOCKED`. |
| `doc_id` | Es promoción del KH, no sustento. | `BLOCKED`. |
| `ACP_QUERY_ID` / `ACP_TRACE_ID` | Son IDs de proceso. | `BLOCKED`. |
| `asset_id` | Sin derivación gobernada no es evidencia. | `PARTIAL`; debe ir con `evidence_id`. |
| `session_id` / `place_id` | Procedencia, no sustento. | `BLOCKED`. |

## 12.4 Formato de afirmación

```
  afirmacion {
    texto,
    ancla_id,              // observation_id o evidence_id (OBLIGATORIO)
    ancla_tipo,            // OBSERVATION | EVIDENCE
    evidence_version_id,   // si ancla_tipo = EVIDENCE
    estado_heredado,       // uno de los 7, sin mejora
    confianza,             // <= MIN(anclas)
    coverage
  }
```

**Regla ANC-1:** un reporte con `RESOLVED` y alguna afirmación sin ancla es `BLOCKED` en su totalidad.
**Regla ANC-2:** el ancla se cita por **ID exacto**, nunca por descripción, fecha ni texto libre (BS-2).
**Regla ANC-3:** toda afirmación con `evidence_id` declara también su `observation_id` de origen (TRZ-1, REL-1).
**Regla ANC-4:** las afirmaciones `REF` se marcan como referencia, nunca como evaluación propia (AEL-10).

---

# 13. Interacción con el Knowledge Hub

| ID | Regla |
|---|---|
| KHA-1 | El ACP lee el KH registry **después** del Registry y del Ledger (ACP-2, AEL-1). |
| KHA-2 | **ACP NO PROMUEVE CONOCIMIENTO.** El ACP **propone**; el **Knowledge Hub decide** (KH-2). |
| KHA-3 | El candidato de promoción se expresa como campo `promotion_candidate` en `ACP_REPORT_ID`, nunca como escritura en el registry. |
| KHA-4 | El ACP no escribe `doc_id` ni edita `knowledgeRegistry.generated.json` (KEL-3, KHR-1). |
| KHA-5 | `docsByObservation` y `docsByEvidence` se derivan por lectura; sin doble escritura (MP-8). |
| KHA-6 | El ACP respeta D-003 para conflictos documentales; no los resuelve (KHR-8). |
| KHA-7 | Si el KH necesita corregir un vínculo, **propone** una relación `evdrel_` con razón; no la escribe el ACP (KEL-10). |
| KHA-8 | Los 7 estados se presentan tal cual; el ACP nunca muestra `DISENO`/`REF` como `REAL` (KH-6). |
| KHA-9 | Una propuesta de promoción no cambia el veredicto ni la confianza del reporte. |
| KHA-10 | Hoy el KH consume evidencias solo como contrato: no hay promoción operativa (KEL-2). |

---

# 14. Trazabilidad completa de respuestas

```
  RESPUESTA (ACP_REPORT_ID)
        │
        ▼
  AFIRMACIÓN (texto + ancla + version + estado + C)
        │
        ▼
  ANCLA (observation_id o evidence_id)
        │
        ▼
  EVIDENCIA (evdver_ vigente + evdchain_ + sha256)
        │
        ▼
  OBSERVACIÓN (observation_id en Registry + asset_ids[] + event_ids[])
```

## 14.1 15 reglas de trazabilidad (`ATR-1..ATR-15`)

| ID | Regla |
|---|---|
| **ATR-1** | Toda respuesta se descompone en afirmaciones trazables. |
| **ATR-2** | Toda afirmación lleva un ancla válida (`observation_id` o `evidence_id`). |
| **ATR-3** | Afirmación sin ancla ⇒ `BLOCKED`. |
| **ATR-4** | El ancla se cita por ID exacto, sin parseo ni texto libre. |
| **ATR-5** | `event_id`, `doc_id` y `report_id` no son anclas suficientes. |
| **ATR-6** | Toda ancla de evidencia declara la versión exacta leída (`evidence_version_ids[]`). |
| **ATR-7** | Toda afirmación declara el estado honesto **heredado**. |
| **ATR-8** | Toda afirmación declara su confianza `≤ MIN(anclas)`. |
| **ATR-9** | `ACP_TRACE_ID` registra query, filtros, IDs leídos y versiones. |
| **ATR-10** | La traza es append-only, con `prev_trace_sha256`; no se reescribe. |
| **ATR-11** | La traza se preserva aunque la evidencia cambie con posterioridad. |
| **ATR-12** | El reporte antiguo sigue anclado a las versiones que leyó (REP-4). |
| **ATR-13** | El retroceso se hace por las mismas anclas: de `doc_id` a la observación (ASC-3). |
| **ATR-14** | La cobertura se declara por afirmación y agregada en el reporte. |
| **ATR-15** | El veredicto es reconstruible sin consultar sistema externo (AUL-8). |

## 14.2 Contenido de `ACP_TRACE_ID`

| Campo | Obligación |
|---|---|
| `trace_id` · `query_id` · `session_id` | OBLIGATORIAS |
| `ids_consultados[]` · `versiones_leidas[]` | OBLIGATORIAS (incluye `observation_version_id`) |
| `filtros_aplicados[]` | OBLIGATORIA (declarados, nunca implícitos) |
| `anclas_consideradas[]` · `anclas_descartadas[]` con razón | OBLIGATORIAS |
| `veredicto` · `confidence` · `coverage` · `penalidad` | OBLIGATORIAS |
| `at` · `timezone` · `actor_id` (`ACP/IA-1`) | OBLIGATORIAS |
| `prev_trace_sha256` · `entry_sha256` | OBLIGATORIAS; huella rota ⇒ `BLOCKED` |

---

# 15. 15 reglas de consumo (`ACS-1..ACS-15`)

| ID | Regla |
|---|---|
| **ACS-1** | Leer solo en orden Registry → Ledger → KH registry. |
| **ACS-2** | No escribir en Registry, Ledger ni KH (CR-4/5, KHA-4). |
| **ACS-3** | No crear `observation_id` (CR-1). |
| **ACS-4** | No crear `event_id` (CR-2). |
| **ACS-5** | No crear `evidence_id` ni versions ni cadenas (CR-3). |
| **ACS-6** | Resolver versión vigente por `supersedes`, nunca por última fila. |
| **ACS-7** | No inferir relaciones por timestamps ni similitud (OR-1, TEL-11). |
| **ACS-8** | Búsqueda exacta por ID; prohibido `LIKE`, prefijo y fuzzy (BS-2). |
| **ACS-9** | Toda fecha exige rango y `timezone` (BS-3). |
| **ACS-10** | Consultar no muta: la query no genera entradas en Registry ni Ledger. |
| **ACS-11** | Respetar redacción de `posicion` y personas sin consentimiento (CUS-6). |
| **ACS-12** | No rellenar ni inferir `NO_DATA` (ND-2/3). |
| **ACS-13** | Fuente `REF` se cita como referencia, nunca como evaluación propia (AEL-10). |
| **ACS-14** | No usar LLM, prompt, RAG ni embedding como fuente de verdad (LECT-2). |
| **ACS-15** | Toda lectura queda registrada en `ACP_TRACE_ID` con versión exacta. |

---

# 16. 15 reglas de auditoría (`AAUD-1..AAUD-15`)

| ID | Regla |
|---|---|
| **AAUD-1** | Toda traza declara `actor_id = ACP/IA-1`, rol y dominio. |
| **AAUD-2** | Registra **qué leyó**: IDs y versiones exactas. |
| **AAUD-3** | Registra **qué filtros** aplicó y por qué. |
| **AAUD-4** | Registra veredicto y razón; sin razón ⇒ hallazgo `BLOCKED`. |
| **AAUD-5** | Registra confianza con sus tres factores y cobertura. |
| **AAUD-6** | Registra una ancla por afirmación; sin ancla ⇒ hallazgo `BLOCKED`. |
| **AAUD-7** | Confianza superior al `MIN` de anclas ⇒ hallazgo `BLOCKED`. |
| **AAUD-8** | `NO_DATA` rellenado o inferido ⇒ hallazgo `BLOCKED`. |
| **AAUD-9** | Veredicto fuera de los 5 canónicos ⇒ hallazgo `BLOCKED`. |
| **AAUD-10** | Escritura en Registry o Ledger desde el ACP ⇒ hallazgo `BLOCKED`. |
| **AAUD-11** | Promoción efectuada por el ACP ⇒ hallazgo `BLOCKED`. |
| **AAUD-12** | Auditar es solo lectura de trazas; el auditor no corrige. |
| **AAUD-13** | Una corrección de traza es una entrada nueva con `supersedes`; nunca edición. |
| **AAUD-14** | Retención mínima de trazas: 10 años, sin compactación destructiva. |
| **AAUD-15** | Todo hallazgo se verifica con fixtures de rechazo (G-IA-3, G-ACP-8). |

---

# 17. Validación de coherencia

| # | Documento | Contrato que esta arquitectura acata | Estado |
|---|---|---|---|
| 1 | Acoustic Governance V2 | `legacy_sample_id`, `sha256`, OOD sin cupos; 9 clases; `window.v2` 44 dims. | ✅ Sin cambio |
| 2 | Vision Governance V1 | `scene_id` de contexto, clases atómicas, 25 riesgos. | ✅ Sin cambio |
| 3 | Telemetry Governance V1 | `NO_DATA ≠ 0 ≠ NULL`, sentinela `lectura_desconocida`, 24 métricas. | ✅ Sin cambio |
| 4 | Multimodal Governance V1 | OB-1..5; `observation_id` raíz, opaco, inmutable. | ✅ Sin cambio |
| 5 | Multimodal Masterplan V1 | OBS-10..14; autoridad única; 10 años sin refactor. | ✅ Sin cambio |
| 6 | Observation Platform V1 | ACP-1..8, KH-1..6, `ObservationPackage`, `PENDING_ACCEPTANCE`. | ✅ Sin cambio |
| 7 | Observation Registry V1 | ACR-1..10, KHR-1..8; versión por `supersedes`; sin inferencia. | ✅ Sin cambio |
| 8 | Evidence Ledger V1 | AEL-1..12, KEL-1..10, REP-1..8; ACP no crea evidencia. | ✅ Sin cambio |

**Adicionales:** Carta IA (P-IA-1..7, H1-H10, C-4/5/6, N-1/N-2, G-IA-1) y Constitución V1.0.1 (D-003 intacta). Ninguno se modifica.

---

# 18. Gates (definidos, NO cerrados)

| Gate | Condición verificable | Estado |
|---|---|---|
| **G-ACP-1** | 3 documentos visibles con D-004.6 y subordinación al Ledger V1 | `DISENO` |
| **G-ACP-2** | 4 IDs de proceso definidos, ninguno compite con las 3 raíces | `DISENO` |
| **G-ACP-3** | 6 reglas críticas verificables con fixtures de rechazo | `DISENO` |
| **G-ACP-4** | Ciclo de 7 pasos con orden obligatorio | `DISENO` |
| **G-ACP-5** | 5 veredictos cerrados; `HIPÓTESIS` inactivo | `DISENO` |
| **G-ACP-6** | `C = MIN × cobertura × penalidad` y regla de evidencia más débil | `DISENO` |
| **G-ACP-7** | 10 diagramas + 15+15+15+15 reglas presentes | `DISENO` |
| **G-ACP-8** | 40 riesgos con severidad, umbral, mitigación y fixture | `DISENO` |
| **G-ACP-9** | Coherencia con 8 documentos + cero escritura en Registry/Ledger | `DISENO` |

---

# 19. Cierre

**Criterio de éxito:** obtener la arquitectura oficial del ACP como **consumidor estricto** de observaciones y evidencias, **sin crear hechos**, **sin crear evidencias**, **sin modificar el Registry**, **sin modificar el Ledger** y **sin romper `observation_id` como raíz única**. Se satisface en el plano contractual: el ACP tiene IDs de proceso propios, un ciclo obligatorio, veredictos cerrados, confianza conservadora, anclas duras, trazabilidad reconstruible y auditoría verificable. Su materialización requiere misión explícita y gates propios.

**Estado honesto:** **OFICIAL y DISEÑADO**. Sin código, API, UI, base de datos, agente, IA, LLM, prompt, RAG ni embedding. Sin modificar ningún documento existente. Sin commit, push, merge ni tag. Los 9 gates permanecen abiertos.

---

*Fin de la arquitectura del ACP consumidor. Complementa —nunca sustituye— la Carta IA, F4, la Observation Platform V1, el Observation Registry V1, el Evidence Ledger V1 y la Constitución.*
