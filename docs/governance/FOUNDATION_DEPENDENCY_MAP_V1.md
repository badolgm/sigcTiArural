# MAPA DE DEPENDENCIAS DEL FOUNDATION STACK V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T00:25:00-05:00
> - Origen: misión `SIGCTIARURAL_FOUNDATION_AUDIT_V1` (documento nuevo)
> - Destino: `docs/governance/FOUNDATION_DEPENDENCY_MAP_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: mapa de solo lectura. No modifica documentos, no crea gobernanza, IDs ni taxonomías. No implementa código.

**Misión:** `SIGCTIARURAL_FOUNDATION_AUDIT_V1`
**Complemento de:** `docs/governance/SIGCTIARURAL_FOUNDATION_AUDIT_V1.md`
**Fecha:** 2026-11-21 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Alcance:** 10 documentos del foundation stack + su precedencia D-003.

> **Regla de lectura:** los mapas son **descriptivos**. Declaran relaciones ya escritas en los documentos auditados; no crean dependencias nuevas ni resuelven colisiones. Las colisiones se registran, no se corrigen.

---

# 0. Inventario de nodos

| Nodo | Nombre | Rol en el mapa |
|---|---|---|
| N0 | D-003 / Constitución / Carta IA | Autoridad documental y de gobernanza IA |
| N1 | Multimodal Governance V1 | Emite `observation_id` (raíz) |
| N2 | Multimodal Masterplan V1 | Congela la raíz 10 años |
| N3 | Acoustic Governance V2 | Dominio de origen (usa `sample_id`, hoy sin raíz nativa) |
| N4 | Vision Governance V1 | Dominio de origen (assets visuales) |
| N5 | Telemetry Governance V1 | Dominio de origen (lecturas + `NO_DATA`) |
| N6 | Observation Platform V1 | Orquesta el `ObservationPackage` |
| N7 | Observation Registry V1 | Autoridad de la raíz; versión e historia |
| N8 | Evidence Ledger V1 | Deriva evidencia; custodia y relaciones |
| N9 | ACP Consumer Architecture V1 | Consume y produce `report_id` / `acprep_` |
| N10 | Knowledge Hub Architecture V1 | Promueve a conocimiento; regenera registry documental |

**Flecha `A ──▶ B`:** A depende de B / A es anterior a B en la cadena de autoridad o de datos.
**Flecha `A ⇢ B`:** dependencia declarada **problemática** (ciclo o colisión).

---

# 1. Mapa de dependencias

```
  N0  D-003 / CONSTITUCIÓN / CARTA IA  (P-IA-5 · C-5 · jerarquía documental)
   │
   ├──▶ N1  MULTIMODAL GOVERNANCE V1   [OB-1..5 · crea observation_id]
   │        │
   │        ├──▶ N2  MULTIMODAL MASTERPLAN V1   [OBS-10..14 · raíz inmutable]
   │        │
   │        ├──▶ N3  ACOUSTIC GOVERNANCE V2     [sample_id / class_id · sin obs_ nativa]
   │        ├──▶ N4  VISION GOVERNANCE V1       [VG-1 · image_/video_/scene_/evt_]
   │        └──▶ N5  TELEMETRY GOVERNANCE V1    [TG-1 · telemetry_ · ND-2 local]
   │
   └──▶ N6  OBSERVATION PLATFORM V1   [ACP-1..8 · KH-1..6 · paquete por observation_id]
            │
            ▼
         N7  OBSERVATION REGISTRY V1  [RA-3 · OR-2 · obsver_/obshist_/obsrel_]
            │
            ▼
         N8  EVIDENCE LEDGER V1       [AEL-1..12 · evd_/evdver_/evdchain_/evdrel_]
            │
            ▼
         N9  ACP CONSUMER ARCH V1     [CR-1..6 · acps_/acpq_/acpt_/acprep_]
            │                                   │
            │  report_id / promotion_candidate   │  lectura de KH registry (ANC-3, orden)
            ▼                                   ▼
         N10 KNOWLEDGE HUB ARCH V1    [KCN-14 · docprom_/doc_/docsByObservation]
                    ╲                          ╱
                     ⇢⇢⇢ CICLO DECLARATIVO ⇢⇢⇢
```

## 1.1 Dependencias doc a doc (evidencia textual)

| # | Dependencia | Documento de origen | Evidencia |
|---|---|---|---|
| D1 | Carta IA → ACP / Ledger / KH | `CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md:85` | C-5: provocar registro vía productor gobernado |
| D2 | Multimodal V1 → todos los dominios | `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1.md:27,89` | `observation_id` / `obs_` |
| D3 | Masterplan → Registry | `SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md:93,108` | raíz inmutable; precisión ambigua |
| D4 | Acoustic → Multimodal | `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1.md:349` | `legacy_sample_id` (envoltura no materializada) |
| D5 | Visión → Multimodal | `VISION_GOVERNANCE_V1.md:64,93` | VG-1 |
| D6 | Telemetría → Multimodal | `TELEMETRY_GOVERNANCE_V1.md:67,95,198` | TG-1 / OBT-1 |
| D7 | Dominios → Platform | `SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md:110,476` | paquete por `observation_id` |
| D8 | Platform → Registry | `SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md:483-484` | ACP-2/3: lee Registry, no escribe |
| D9 | Registry → Ledger | `SIGCTIARURAL_EVIDENCE_LEDGER_V1.md:25,107` | no modifica raíz |
| D10 | Ledger → ACP | `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md:161,187` | `evidence_id` / EV-2 |
| D11 | ACP → KH | `SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md:396` | ANC-3 + `promotion_candidate` |
| D12 | KH → D-003 / humano | `SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1.md:185` | ciclo sin realimentación |

## 1.2 Dependencias circulares

| # | Ciclo | Tipo | Evidencia | Estado |
|---|---|---|---|---|
| C1 | **ACP ⇄ KH** | Declarativo, no operativo | ACP-2 (`SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md:483`) lee `Registry → Ledger → KH registry`; ACP KHA-1..10 exigen que el KH reciba `report_id` para promover (`SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md:406-409`). | 🔴 Sin frontera de snapshot: ACP lee el estado del KH que él mismo ayuda a alimentar. |
| C2 | ACP → Ledger → ACP | **Apariencia de ciclo, resuelta** | Ledger R-01 (`EVIDENCE_LEDGER_ROADMAP_V1.md:197`) prohíbe `produced_by = acp`; ACP solo produce `acprep_`. | ✅ No es ciclo real: el reporte no entra al Ledger. |
| C3 | KH → Registry → KH | **Apariencia de ciclo, resuelta** | KH KCN-14 / KEL-1 solo leen; `docsByObservation` es derivado (MP-8, MG-7). | ✅ No es doble escritura. |

> El único ciclo abierto es **C1**. No se declara aquí cómo resolverlo: eso requiere una decisión de gobernanza futura con `supersedes`.

---

# 2. Mapa de trazabilidad

## 2.1 Cadena exigida por la misión

```
  OBSERVACIÓN                    EVIDENCIA                    REPORTE                    CONOCIMIENTO
  ───────────                    ─────────                    ───────                    ─────────────
  observation_id     ────▶       evidence_id        ────▶     report_id        ────▶      doc_id
       │                              │                           │                         │
       ├─ asset_id                    ├─ evdver_                  ├─ acps_                    ├─ docprom_
       ├─ event_id                    ├─ evdchain_                ├─ acpq_                    ├─ docsByObservation (vista)
       └─ obsver_/obshist_            └─ evdrel_                  └─ acpt_ → acprep_          └─ registry regenerado

  Dueño: N1/N7              Dueño: N8                    Dueño: N9                  Dueño: N10
  Estado: DISENO            Estado: DISENO               Estado: DISENO             Estado: DISENO
  Instancias: 0             Instancias: 0                Instancias: 0              Instancias: 0
```

## 2.2 Reglas de trazabilidad verificadas

| Regla |Origen | Efecto |
|---|---|---|
| Trazabilidad completa o `PARTIAL` | Ledger REP-8 (`SIGCTIARURAL_EVIDENCE_LEDGER_V1.md:395`) | `report_id` sin `evidence_version_ids[]` ⇒ `PARTIAL` |
| Retroceso hasta la raíz | ACP ATR-13 (`ACP_ENTITY_MODEL_V1.md:305`) | `acprep_ → observation_id` obligatorio (ANC-3) |
| Sin evidencia ⇒ sin `RESOLVED` | ACP (`ACP_ENTITY_MODEL_V1.md:351`) | 0 anclas ⇒ `NO_DATA` / `UNANSWERABLE` |
| Estado heredado, nunca mejorado | Ledger EVER-4 / F3E-2 | `REF` no se convierte en evaluación propia |
| `NO_DATA` no se imputa | ACP ND-2 (`SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md:341`) | relleno ⇒ `BLOCKED` |
| Promoción por gobernanza, no por existencia | Platform KH-2:496 / F3E-9 | paquete ≠ conocimiento verificado |

## 2.3 Puntos de ruptura detectados en la trazabilidad

| # | Ruptura | Impacto |
|---|---|---|
| TR-1 | Audio sin `observation_id` nativo (`docs/acoustic/*.md`: 0 menciones) | La primera flecha de la cadena no puede ejecutarse desde S30 sin la envoltura `legacy_sample_id`. |
| TR-2 | `report_id` con triple denominación (`report_` / `acprep_` /_ids de proceso) | Un mismo eslabón tiene tres dueños declarados (Carta C-5, Platform ACP-3, ACP entity model). |
| TR-3 | `doc_` con doble dueño (asset documental vs `DOC_ID` del KH) | La última flecha de la cadena es ambigua en el prefijo. |
| TR-4 | 0 instancias en toda la cadena | Ninguno de los seis IDs ha sido ejercitado; la trazabilidad es **diseño**, no evidencia de funcionamiento. |

---

# 3. Mapa de promoción

```
  promotion_candidate (ACP · acprep_)
          │
          ▼
  ┌───────────────────────────────────────────────────────────┐
  │ HANGAR DE AUTENTICIDAD  (F3E / KH · F3E-9)                │
  │  - no es knowledge-base                                   │
  │  - no es registry generado                                │
  │  - auditoría + veredicto humano                           │
  └───────────────────────────────────────────────────────────┘
          │
          ▼
  D-003 · jerarquía documental  ──▶  decisión humana documentada
          │
          ▼
  ADMITTED  ──▶ doc_id (KH)  ──▶ regeneración de knowledgeRegistry.generated.json
          │
          └──▶ SUPERSEDED / RETIRED  (modelo declarado, 0 usos reales)
```

## 3.1 Puertas de promoción verificadas

| Puerta | Documento | Regla |
|---|---|---|
| P1 · candidato sin estado mejorado | KH `KPR-*` | La promoción no cambia `REAL`/`SIM`/`REF`; hereda. |
| P2 · registro generado inmutable a mano | MP-8 / MG-7 | El registry se regenera; nunca se edita directo. |
| P3 · humano decide | F3E-9 / D-003 | El ACP propone; el KH canóniza por gobernanza. |
| P4 · salida `obs_` desde el KH ⇒ `BLOCKED` | KH roadmap R-01:176 | El KH no crea la raíz. |
| P5 · salida `evd_` desde el KH ⇒ `BLOCKED` | KH roadmap R-02:177 | El KH no crea evidencia. |

---

# 4. Colisiones de prefijos y códigos

## 4.1 Colisiones de prefijos de ID

| Prefijo | Dueño A | Dueño B | Severidad | Evidencia |
|---|---|---|---|---|
| `doc_` | `ASSET_ID` documental (Multimodal §3.2) | `DOC_ID` del KH (`SIGCTIARURAL_KNOWLEDGE_HUB_ARCHITECTURE_V1.md:111`) | 🔴 | Mismo prefijo, dos dueños y dos semánticas: bytes observados vs conocimiento promovido. |
| `evt_` | `EVENT_ID` (Multimodal §3.3) | `VISUAL_EVENT_ID` (Visión `:91`) | 🔴 | Visión lo declara "vista, no raíz nueva", pero el prefijo es indistinguible en almacenamiento. |
| `report_` vs `acprep_` | Carta IA C-5 / Platform ACP-3 | ACP entity model (`ACP_ENTITY_MODEL_V1.md:28,82`) | 🟡 | Tres nombres para el mismo eslabón; sin `supersedes` que los unifique. |

## 4.2 Colisiones de códigos de regla

| Código | Significado 1 | Significado 2 | Severidad | Evidencia |
|---|---|---|---|---|
| `ND-2` | ACP: prohibido rellenar `NO_DATA` (`SIGCTIARURAL_ACP_CONSUMER_ARCHITECTURE_V1.md:341`) | Telemetría: un `NO_DATA` no degrada la observación (`TELEMETRY_GOVERNANCE_V1.md:268`) | 🟡 | Mismo código, dominios distintos; la regla equivalente en telemetría es `ND-4`. |
| `C-5` | Carta IA: provocar registro vía productor gobernado (`:85`) | Freeze documental: estatus de 3 diagramas (`ARCHITECTURE_FREEZE_CLOSURE_REVIEW.md:24`) | 🔴 | Colisión entre gobernanza IA y gobernanza documental; además Platform lo cita sin definirlo. |
| `R-01` | Registry roadmap: autoridad duplicada (`:188`) | Ledger roadmap: ACP crea evidencia (`:197`) | KH roadmap: KH crea `OBSERVATION_ID` (`:176`) | 🔴 | Al menos 4 significados con el mismo código en roadmaps distintos. |
| `P-12` | Carta IA: eslabón no es fuente de verdad de sí mismo (`:37`) | — | 🟢 | Uso único verificado; se lista para completar el barrido de tokens. |

## 4.3 Reglas redundantes (49 declaraciones)

| Familia | Cantidad | Contenido repetido |
|---|---|---|
| `KH-1..6` | 6 | fuente única · promoción gobernada · estados honestos |
| `KHR-1..8` | 8 | idem (roadmap KH) |
| `KEL-1..10` | 10 | idem (interfaz Ledger↔KH) |
| `KHA-1..10` | 10 | idem (interfaz ACP↔KH) |
| `KCN-1..15` | 15 | idem (canonización KH) |
| **Total** | **49** | No se contradicen; multiplican superficie de mantenimiento. |

> `MP-8` (Masterplan `:79`) y `MG-7` (Multimodal `:78`) repiten la misma invariante "fuente única, vistas derivadas" con otra denominación. `ACP-3` (Platform `:484`) y `CR-3` (ACP) repiten "ACP no escribe". No se enumera una nueva taxonomía: solo se mide la duplicidad.

---

# 5. Cierre del mapa

Los tres mapas exigidos por la misión están completos: **dependencias** (§1), **trazabilidad** (§2) y **promoción** (§3). Se han localizado **1 ciclo declarativo abierto** (ACP⇄KH), **4 rupturas de trazabilidad**, **3 colisiones de prefijo**, **3 colisiones de código** y **49 reglas redundantes**. Ninguna se corrige en este documento; todas se trasladan a `FOUNDATION_GAP_ANALYSIS_V1.md` con severidad, riesgo y recomendación.

**Estado honesto:** mapa **OFICIAL**, sin modificar documentos existentes, sin crear IDs, taxonomías ni gobernanzas, sin código, sin `git add`, `commit`, `push`, `merge` ni `tag`.

---

*Fin del mapa de dependencias del Foundation Stack V1. Complementa —nunca sustituye ni modifica— los diez documentos auditados.*
