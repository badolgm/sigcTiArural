# MODELO DE ENTIDADES DEL ACP CONSUMIDOR V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T23:30:38-05:00
> - Origen: misión `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1` (documento nuevo)
> - Destino: `docs/governance/ACP_ENTITY_MODEL_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: modelo conceptual del consumidor estricto. No crea agente, IA, LLM, prompt, RAG, embedding, API, UI ni base de datos.

**Misión:** `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1`
**Naturaleza:** modelo **conceptual** de entidades de proceso, relaciones, cardinalidades y máquinas de estado. Contrato **`DISENO`**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Autoridad:** `docs/governance/SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md`
**Relación con modelos previos:** extiende `multimodal_entity_model_v1.md`, `OBSERVATION_REGISTRY_ENTITY_MODEL_V1.md` y `EVIDENCE_LEDGER_ENTITY_MODEL_V1.md` **sin reemplazarlos**. El ACP no posee entidades de dominio: solo **proceso, traza y reporte**.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante:** `observation_id` es la raíz única. Ningún ID del ACP es ancla suficiente ni sustituye a `observation_id`, `evidence_id` o `event_id`.
> **Raíces gobernadas referenciadas:** `OBSERVATION_ID` · `EVIDENCE_ID` · `EVENT_ID`. El ACP las lee; no las crea ni las modifica.
> **Invariante de consumo:** el ACP solo consume. No crea observaciones, eventos ni evidencia; no modifica Registry ni Ledger; no promueve conocimiento.

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Diagramas ASCII | **10** (D-ACP1..D-ACP10) |
| Entidades de proceso del ACP | **4** (`acps_`, `acpq_`, `acpt_`, `acprep_`) |
| Entidades de dominio poseídas | **0** |
| Escrituras en Registry / Ledger / KH | **0 / 0 / 0** |
| Agentes, modelos, prompts, RAG, embeddings creados | **0 / 0 / 0 / 0 / 0** |
| Queries, trazas y reportes gobernados hoy | **0 / 0 / 0** |
| Veredictos | **5 canónicos**; `HIPÓTESIS` inactivo (G-IA-1) |

---

# 1. D-ACP1 — Posición del ACP en la cadena de autoridad

```
  CONSTITUCION -> CARTA IA -> ACP(IA-1) -> EVIDENCE LEDGER -> KNOWLEDGE HUB
                                  │              │                 │
                                  │ lee          │ lee             │ lee
                                  ▼              ▼                 ▼
                          OBSERVATION      EVIDENCE         KH registry
                            REGISTRY          LEDGER        (docsByEvidence)
                                  │
                                  └── SOLO LECTURA (CR-1..CR-6)

  El ACP NO esta encima del Registry ni del Ledger: esta DESPUES de ellos.
```

| Regla | Consecuencia |
|---|---|
| El ACP es IA-1 bajo la Carta IA. | Mismo sujeto que F4; no se crea un segundo ACP. |
| El ACP no es fuente de verdad. | Solo ancla lo que el Registry y el Ledger ya gobernaron. |
| La cadena de autoridad termina en el KH. | El ACP propone; el KH decide (KHA-2). |

---

# 2. D-ACP2 — Los cuatro IDs de proceso y su no-competencia

```
  acps_  ACP_SESSION_ID  (agrupador; sin ancla)
     │ 1:N
     ▼
  acpq_  ACP_QUERY_ID    (pregunta; NO es observacion)
     │ 1:1
     ├──► acpt_  ACP_TRACE_ID   (decision append-only; NO es evidencia)
     │        │ prev_trace_sha256
     │        ▼
     └──► acprep_ ACP_REPORT_ID (alias de report_id; NO es hecho)

  Raices gobernadas QUE NO SE TOCAN:
     observation_id   evidence_id   event_id
```

| ID de proceso | Compite con | Respuesta |
|---|---|---|
| `acps_` | `observation_id` | No: agrupa interacción, no sustenta evidencia. |
| `acpq_` | `observation_id` | No: pregunta, no ocurrencia. |
| `acpt_` | `evidence_id` | No: decisión, no artefacto reproducible. |
| `acprep_` | `evidence_id` · `event_id` | No: interpretación anclada, no hecho. |

**Regla D-ACP2-1:** ningún ID de proceso aparece como `ancla_id` válida (ANC-3).
**Regla D-ACP2-2:** todo ID de proceso referencia al menos un `observation_id` o `evidence_id` en su contenido.

---

# 3. D-ACP3 — Ciclo completo de consumo (7 pasos)

```
  [1] PREGUNTA     acpq_ + acps_
        │
        ▼
  [2] REGISTRY     observation_id exacto -> version vigente (supersedes)
        │
        ▼
  [3] LEDGER       evidence_id[] vigente -> cadena + estado/confianza heredadas
        │
        ▼
  [4] FILTRO       estado | source_tier | licencia | consentimiento | timezone
        │
        ▼
  [5] ANALISIS     cruce de anclas + contradicciones DECLARADAS
        │
        ▼
  [6] RESPUESTA    afirmaciones ancladas + veredicto + C=MIN x cov x penalidad
        │
        ▼
  [7] REPORT_ID    acprep_ + acpt_ (append-only)
        │
        └── (NUNCA realimenta [2] ni [3]: CR-4/CR-5)
```

| Paso | Prohibición dura |
|---|---|
| 1 | Convertir la pregunta en observación o evento. |
| 2 | Parsear el ID opaco o usar "la última fila". |
| 3 | Escribir en el Ledger o crear evidencia. |
| 4 | Rellenar `NO_DATA` o filtrar por similitud. |
| 5 | Resolver disputas por votos, fecha o confianza. |
| 6 | Subir confianza o crear veredicto nuevo. |
| 7 | Escribir en Registry, Ledger o KH. |

---

# 4. D-ACP4 — Frontera de lectura

```
  LECTURA PERMITIDA                    LECTURA PROHIBIDA COMO FUENTE
  ┌───────────────────────────┐        ┌────────────────────────────┐
  │ observation_id            │        │ LLM / Interprete           │
  │ obsver_ vigente           │        │ prompt                     │
  │ asset_ids[] / event_ids[] │        │ embedding / vector store   │
  │ evidence_id[] (Ledger)    │        │ RAG no gobernado           │
  │ evdver_ / evdchain_       │        │ archivo sin observation_id │
  │ evdrel_ DECLARADAS        │        │ bytes sin sha256           │
  │ doc_id / docsByEvidence   │        │ memoria conversacional     │
  │ ObservationPackage        │        │ event_id por timestamp     │
  └─────────────┬─────────────┘        └─────────────┬──────────────┘
                │                                    │
                ▼                                    ▼
          ACP_TRACE_ID                         BLOCKED / PARTIAL
```

**Regla D-ACP4-1:** leer no es producir. Una query no genera entradas en Registry ni Ledger (ACS-10).
**Regla D-ACP4-2:** todo lo leído se registra con su **versión exacta** en `ACP_TRACE_ID` (ACS-15).

---

# 5. D-ACP5 — Árbol de decisión del veredicto

```
                    PREGUNTA
                       │
        ┌──────────────┼───────────────┐
        ▼              ▼               ▼
  Sin cauce      Sin ancla /      Cauce con anclas
  gobernado      huella rota      y acceso gobernado
        │              │               │
        ▼              ▼               ▼
 UNANSWERABLE    BLOCKED      ┌─────────────────────┐
                              │ ambiguedad?         │
                              │ DISPUTED?           │
                              │ C < 0.30?           │
                              └──────────┬──────────┘
                                         │
                        ┌────────────────┼────────────────┐
                        ▼                ▼                ▼
                     PARTIAL         NO_DATA         RESOLVED
                 (cobertura/       (busqueda        (todo completo,
                  disputa)          vacia)          anclas validas)
```

| Veredicto | Regla de activación |
|---|---|
| `RESOLVED` | Anclas válidas + vigente + sin disputa + cobertura completa + `C ≥ 0.30`. |
| `PARTIAL` | Anclas válidas pero cobertura incompleta, `DISPUTED`, consentimiento omitido o `C < 0.30`. |
| `NO_DATA` | Existe cauce, pero la búsqueda gobernada es vacía. |
| `BLOCKED` | Afirmación sin ancla, huella rota, fuente `ROTO` o violación de regla. |
| `UNANSWERABLE` | No existe cauce gobernado para la pregunta. |

**Regla D-ACP5-1:** ante duda, se elige el veredicto **más degradado** (VER-4).
**Regla D-ACP5-2:** `HIPÓTESIS` **no aparece** en el árbol: inactivo, PENDIENTE de G-IA-1.

---

# 6. D-ACP6 — Embudo de confianza conservadora

```
  confianzas de anclas:  [0.92] [0.71] [0.88] [0.45]
                                    │
                                    ▼
                    MIN = 0.45   (NUNCA promedio/max/suma)
                                    │
                                    ▼
                    cobertura declarada = 0.80
                                    │
                                    ▼
                    penalidad_no-REAL = 0.90  (gobernanza)
                                    │
                                    ▼
                    C = 0.45 x 0.80 x 0.90 = 0.324
                                    │
                                    ▼
                    C <= 0.45  (regla de evidencia mas debil)
                                    │
                                    ▼
                    C < 0.30 ? -> degradar veredicto
```

| Factor | Origen | Regla |
|---|---|---|
| `MIN(anclas)` | Evidencias citadas | Nunca promedio, máximo ni suma (ACF-3/4/5). |
| `cobertura` | Declarada por el ACP | (0, 1], nunca implícita (ACF-10). |
| `penalidad_no-REAL` | Gobernanza | Tabla `DISENO`, no operativa hasta gate (ACF-11). |

**Regla D-ACP6-1:** agregar evidencias puede **bajar** `C`, nunca subirlo (ACF-6).
**Regla D-ACP6-2:** LLM, fluidez y consenso no alteran `C` (ACF-7/8/9).

---

# 7. D-ACP7 — Estados de la evidencia ante el ACP

```
  SUPERSEDED ──► usar version vigente (supersedes) ──► RESOLVED posible
       │
       └── anterior solo como historico

  RETRACTED / RETIRED ──► no anclar ──► NO_DATA o BLOCKED
       │
       └── sin borrado: el marcador sigue legible

  CORRECTED ──► anclar version nueva + evidence_version_ids[]
       │
       └── REPORT_ANTIGUO intacto; conviven versiones => PARTIAL

  DISPUTED ──► mostrar AMBAS partes + razon declarada ──► PARTIAL obligatorio
       │
       └── sin vencedor por votos/fecha/confianza/lenguaje
```

| Estado | Veredicto típico | Prohibición |
|---|---|---|
| `SUPERSEDED` | `RESOLVED` si todo lo demás completo | Usar la última fila. |
| `RETRACTED` | `NO_DATA` / `BLOCKED` | Fingir que nunca existió. |
| `CORRECTED` | `PARTIAL` si conviven; si no, `RESOLVED` | Reescribir el reporte anterior. |
| `DISPUTED` | **`PARTIAL`** | Elegir ganador por inferencia. |

---

# 8. D-ACP8 — Barrera `NO_DATA`

```
  busqueda gobernada vacia / bloque NO_DATA del paquete
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   REPORTAR NO_DATA          REPORTAR PARTIAL
   "que se busco /           (si el resto de la
    que falta"                respuesta tiene anclas)
          │
          ├── PROHIBIDO rellenar con inferencia, promedio o modelo
          ├── PROHIBIDO inferir desde otras observaciones
          ├── PROHIBIDO convertir en 0 / null / fila ausente
          └── PROHIBIDO calcular C ficticia
                       │
                       ▼
              auditoria: relleno => BLOCKED (AAUD-8)
```

**Regla D-ACP8-1:** `NO_DATA ≠ UNANSWERABLE` (VER-2): aquel tiene cauce, este no.
**Regla D-ACP8-2:** `NO_DATA ≠ 0 ≠ NULL` (Telemetría V1 §4, ND-1..ND-4).

---

# 9. D-ACP9 — Trazabilidad inversa de una respuesta

```
  RESPUESTA        acprep_...  (veredicto + C + cobertura)
       │
       ▼
  AFIRMACION       texto + ancla_id + ancla_tipo + estado + C
       │
       ▼
  ANCLA            observation_id  O  evidence_id
       │                                 │
       │                                 ▼
       │                         evdver_ vigente + evdchain_ + sha256
       │                                 │
       └────────────────┬────────────────┘
                        ▼
  OBSERVACION     observation_id en Registry + asset_ids[] + event_ids[]
                        │
                        ▼
  TRAZA           acpt_ (prev_trace_sha256, IDs leidos, filtros, versiones)
```

| Regla | Garantía |
|---|---|
| ATR-2 | Una ancla por afirmación. |
| ATR-6 | Versión exacta de la evidencia citada. |
| ATR-10 | Traza append-only, nunca reescrita. |
| ATR-11 | La traza sobrevive a cambios posteriores de la evidencia. |
| ATR-13 | Retroceso posible desde `doc_id` hasta la observación. |

---

# 10. D-ACP10 — Interacción con el Knowledge Hub

```
  ACP_REPORT_ID
       │
       ├── afirmaciones ancladas (a Registry / Ledger)
       │
       └── promotion_candidate = [evidencia/doc candidato]
                        │
                        ▼
              ACP NO ESCRIBE doc_id
                        │
                        ▼
      KNOWLEDGE HUB (Hangar de Autenticidad + D-003)
                        │
                        ▼
              DECIDE promocion -> doc_id
                        │
                        ▼
      registry documental se REGENERA (nunca edicion a mano)
                        │
                        ▼
      docsByObservation / docsByEvidence DERIVADOS por lectura
```

| Regla | Consecuencia |
|---|---|
| KHA-2 | ACP propone; KH decide. |
| KHA-4 | ACP no edita `knowledgeRegistry.generated.json`. |
| KHA-5 | Sin doble escritura de índices derivados. |
| KHA-6 | D-003 resuelve conflictos documentales. |

---

# 11. Cardinalidades del modelo

| Relación | Card. | Regla |
|---|---:|---|
| `acps_ → acpq_` | 1:N | Una sesión agrupa muchas preguntas. |
| `acpq_ → acpt_` | 1:1 | Una decisión por query (si se emite). |
| `acpt_ → acprep_` | 1:0..1 | Toda traza puede dar lugar a un reporte; no al revés. |
| `acprep_ → observation_id` | 1:1..N | Ancla raíz obligatoria (ANC-3). |
| `acprep_ → evidence_id[]` | 1:0..N | 0 anclas ⇒ `NO_DATA`/`UNANSWERABLE`, nunca `RESOLVED`. |
| `afirmacion → ancla` | 1:1 | Sin ancla ⇒ `BLOCKED` (ANC-1). |
| `acpt_ → prev_trace_sha256` | 1:1 | Encadenamiento append-only. |
| `promotion_candidate → doc_id` | 0:1 | Solo propuesta; el KH decide (KHA-2). |

---

# 12. Máquina de estados del proceso ACP

```
  (sin query)
      │ recibir pregunta
      ▼
   QUERY_RECEIVED
      │ resolver Registry
      ▼
   ANCHORS_RESOLVED ──── sin ancla ────► BLOCKED
      │ leer Ledger
      ▼
   EVIDENCE_READ ──── vacio ──────────► NO_DATA
      │ filtros declarados
      ▼
   FILTERED
      │ analizar solo lo leido
      ▼
   ANALYZED ──── disputa ─────────────► PARTIAL
      │ veredicto + C
      ▼
   RESPONDED
      │ emitir acprep_ + acpt_
      ▼
   REPORTED (terminal; NO realimenta Registry ni Ledger)
```

| Estado de proceso | No confundir con |
|---|---|
| `BLOCKED` (estado de proceso del ACP) | 7 estados de honestidad — es un **veredicto**, no un estado de señal. |
| `QUERY_RECEIVED` | `observation_id` — la query no es observación. |
| `REPORTED` | `doc_id` — el reporte no es conocimiento promocionado. |

---

# 13. Fixtures de rechazo del modelo

| Fixture | Resultado esperado |
|---|---|
| Query convertida en `observation_id` | `BLOCKED` (CR-1, ACS-3) |
| Correlación que crea `event_id` | `BLOCKED` (CR-2, ACS-4) |
| Interpretación escrita en `evdchain_` | `BLOCKED` (CR-3, ACS-5) |
| ACP escribe `obsver_` / `obshist_` | `BLOCKED` (CR-4, AAUD-10) |
| ACP escribe `evdver_` / `evdrel_` | `BLOCKED` (CR-5, AAUD-10) |
| `acprep_` sin `observation_id` | `BLOCKED` (ANC-3) |
| Afirmación con `doc_id` como única ancla | `BLOCKED` (ATR-5) |
| Confianza mayor que `MIN(anclas)` | `BLOCKED` (ACF-2, AAUD-7) |
| Veredicto `INFERRED` o `HIPÓTESIS` activo | `BLOCKED` (AAUD-9, G-IA-1) |
| `NO_DATA` rellenado con promedio | `BLOCKED` (ND-2, AAUD-8) |
| `DISPUTED` resuelto por fecha | `PARTIAL` forzado (CONF-3) |
| `RETRACTED` usado como ancla vigente | `NO_DATA`/`BLOCKED` (§10) |
| ACP escribe `doc_id` | `BLOCKED` (KHA-4, AAUD-11) |
| Traza reescrita in-place | `BLOCKED` (ATR-10, AAUD-13) |
| `LIKE` sobre ID opaco | `BLOCKED` (ACS-8) |
| Fecha sin `timezone` | `BLOCKED` (ACS-9) |
| Agente, LLM, prompt, RAG o embedding creado aquí | `BLOCKED` (límite duro de la misión) |

---

# 14. Cierre

El modelo define **4 entidades de proceso** y **0 entidades de dominio poseídas**. Los 10 diagramas ASCII muestran que el ACP está después del Registry y del Ledger, lee en orden, calcula confianza por mínimo, nunca rellena `NO_DATA`, ancla cada afirmación, preserva trazas append-only y **propone** al KH sin promover. `observation_id` permanece como raíz única.

**Estado honesto:** **`DISENO`**, 0 queries, 0 trazas, 0 reportes, 0 agentes, 0 IA, 0 LLM, 0 prompts, 0 RAG, 0 embeddings, 0 API, 0 UI, 0 base de datos. Sin modificar ningún documento existente. Sin commit, push, merge ni tag.

---

*Fin del modelo de entidades del ACP. Complementa —nunca sustituye— `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md`, `EVIDENCE_LEDGER_ENTITY_MODEL_V1.md`, `OBSERVATION_REGISTRY_ENTITY_MODEL_V1.md` y `multimodal_entity_model_v1.md`.*
