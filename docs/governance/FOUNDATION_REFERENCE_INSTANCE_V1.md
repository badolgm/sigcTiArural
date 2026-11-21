# INSTANCIA DE REFERENCIA DEL FOUNDATION STACK V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T12:13:00-05:00
> - Origen: misión `SIGCTIARURAL_FOUNDATION_REMEDIATION_V1` (documento nuevo)
> - Destino: `docs/governance/FOUNDATION_REFERENCE_INSTANCE_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: instancia **de referencia, no implementada**. No crea observaciones, evidencias, reportes ni documentos reales.

**Complemento de:** `SIGCTIARURAL_FOUNDATION_REMEDIATION_V1.md` y `FOUNDATION_NAMESPACE_REGISTRY_V1.md`
**Fecha:** 2026-11-21 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Objetivo (R4):** demostrar documentalmente que el stack puede recorrerse de observación a conocimiento sin colisiones y sin ciclos.

---

# 0. Naturaleza de las etiquetas

Las seis etiquetas exigidas por la misión son **referencias de ejemplo**, no identificadores emitidos:

| Etiqueta | Naturaleza | ¿Prefijo de producción? | ¿Registrada en algún registry? |
|---|---|---|---|
| `OBS-0001` | Referencia de observación | No (`obs_` es el prefijo real) | No |
| `ASSET-0001` | Referencia de asset | No (`audio_`/`image_`/…) | No |
| `EVENT-0001` | Referencia de evento | No (`evt_` es el prefijo real) | No |
| `EVIDENCE-0001` | Referencia de evidencia | No (`evd_` es el prefijo real) | No |
| `REPORT-0001` | Referencia de reporte | No (`report_`/`acprep_`) | No |
| `DOC-0001` | Referencia de documento promovido | No (`doc_` del KH) | No |

> No se crean IDs nuevos: las etiquetas no usan los prefijos de producción y no se materializan. Toda instancia real seguirá las reglas `INS-01..10` del informe rector.

---

# 1. Cadena extremo a extremo

```
   OBS-0001            ASSET-0001           EVENT-0001
   (raíz)              (hijo)               (ocurrencia)
      │                    │                     │
      └────────┬───────────┴──────────┬──────────┘
               ▼                      ▼
        EVIDENCE-0001  ───────▶  REPORT-0001  ───────▶  DOC-0001
        (Ledger · T0)          (ACP · T0)              (KH · T1)

   OBSERVATION PLATFORM → REGISTRY → LEDGER → ACP → KNOWLEDGE HUB
```

**Estado de cada nodo:** `DISENO` (no implementado). **Instantáneas:** ACP lee `T0`; KH publica `T1`.

---

# 2. Recorrido paso a paso

| # | Capa | Entrada | Transformación | Salida | Validación aplicada | Resultado |
|---|---|---|---|---|---|---|
| 1 | Observation Platform | Captura de dominio (genérica, no S30) | Empaquetado bajo una raíz | `OBS-0001` + `ASSET-0001` | `INS-03`, `INS-04`: un asset sin observación no entra | ✅ |
| 2 | Registry | `OBS-0001` | Versión + historia, sin mutar el ID | `obsver_`/`obshist_` (forma real) | `OBS-10..14`, `RA-3`: ID inmutable y opaco | ✅ |
| 3 | Multimodal / dominio | `ASSET-0001` + lugar + franja | Clasificación como ocurrencia | `EVENT-0001` | `INS-05`: evento ≠ `event_type` | ✅ |
| 4 | Evidence Ledger | Observación + asset + evento | Derivación con estado y confianza **heredados** | `EVIDENCE-0001` | `INS-06`: nunca mejora estado; no es raíz (NSP-05) | ✅ |
| 5 | ACP (lectura `T0`) | Registry@T0 + Ledger@T0 + KH@T0 | Interpretación anclada, veredicto | `REPORT-0001` | `INS-07`: sin anclas ⇒ `NO_DATA`; `SNP-01..03` | ✅ |
| 6 | Knowledge Hub (publicación `T1`) | `REPORT-0001` | Evaluación gobernada + regeneración del registry | `DOC-0001` | `INS-09`, `INS-10`: sin `obs_`/`evd_`; requiere humano | ✅ |

---

# 3. Verificación por capa exigida

| Capa | Pregunta | Evidencia en la instancia | Veredicto |
|---|---|---|---|
| Observation Platform | ¿El paquete cuelga de `observation_id`? | `OBS-0001` antecede a `ASSET-0001` y `EVENT-0001` | ✅ Coherente |
| Registry | ¿La raíz se mutation? | ID emitido una vez; versiones e historia como hijas | ✅ Coherente |
| Ledger | ¿La evidencia es hija, no raíz? | `EVIDENCE-0001` deriva de observación + asset | ✅ Coherente (con lectura corregida de Ledger §4, NSP-05) |
| ACP | ¿Crea evidencia? ¿Lee KH sin ciclo? | Produce `REPORT-0001`; lee KH@T0 cerrado | ✅ Coherente (`SNP-01..05`) |
| Knowledge Hub | ¿Crea raíz o evidencia? ¿Promueve por gobernanza? | Produce `DOC-0001` desde candidato; sin `obs_`/`evd_` | ✅ Coherente (`KCN-14`, `KEL-1`) |

**Resultado:** 5/5 capas recorridas sin colisión de prefijo ni realimentación circular.

---

# 4. Fallas de consistencia detectadas y su resolución documental

| # | Falla detectada al trazar la instancia | Resolución aplicada en la baseline V1 | Estado |
|---|---|---|---|
| F1 | `DOC-0001` podía confundirse con un asset documental por el prefijo `doc_` | `doc_` = solo `DOC_ID` (NSP-02); asset documental sin prefijo nuevo | ✅ Resuelta |
| F2 | `EVENT-0001` podía confundirse con una vista visual | `evt_` = solo `EVENT_ID`; vista sin ID propio (NSP-03) | ✅ Resuelta |
| F3 | `REPORT-0001` tenía tres denominaciones | `report_` lógico ≡ `acprep_` físico; un productor (NSP-06) | ✅ Resuelta |
| F4 | ACP leía un KH que él mismo ayuda a alimentar | Snapshot `T0` (lectura) → `T1` (publicación), sin realimentación (SNP-03/05) | ✅ Resuelta |
| F5 | El ejemplo no ejercita audio con `observation_id` nativo | Fuera de alcance (H-01); la instancia es genérica, no S30 | ⚠️ Preservada, no reabierta |

---

# 5. Fixtures de rechazo (diseño, no ejecución)

| # | Entrada inválida | Regla | Veredicto esperado |
|---|---|---|---|
| X1 | `ASSET-0001` sin `OBS-0001` | INS-04 | `BLOCKED` |
| X2 | `lluvia` usado como ID de evento | INS-05 | `BLOCKED` (es `event_type`) |
| X3 | `EVIDENCE-0001` con estado superior al de su observación | INS-06 | `BLOCKED` |
| X4 | `REPORT-0001` sin `evidence_version_ids[]` | REP-8 | `PARTIAL` |
| X5 | KH emite `obs_...` o `evd_...` | INS-09 / KCN-14 / KEL-1 | `BLOCKED` |
| X6 | Reintroducir el resultado de `T1` dentro de `T0` | SNP-05 | `BLOCKED` |
| X7 | `NO_DATA` rellenado con promedio | ND-2 | `BLOCKED` |
| X8 | `DOC-0001` promovido solo por existir del paquete | INS-10 | `BLOCKED` |

---

# 6. Cierre de la instancia

> **Veredicto: RECORRIDO DEMOSTRADO EN EL PLANO DOCUMENTAL.** La cadena `OBS-0001 → ASSET-0001 → EVENT-0001 → EVIDENCE-0001 → REPORT-0001 → DOC-0001` atraviesa las cinco capas exigidas sin colisiones de prefijo, sin doble dueño de código y sin ciclo ACP↔KH, apoyada en `FOUNDATION STACK CANONICAL BASELINE V1`.

**Precisiones finales:**

- La instancia **no está implementada**, no se materializó en Registry, Ledger ni KH.
- No se crearon IDs de dominio: las etiquetas son de referencia.
- B1 sigue pendiente de ejecución Git; la demostración es contractual.
- H-01 (audio sin raíz nativa) permanece fuera de alcance y sin reabrir.

**Estado honesto:** sin código, sin datos, sin API, sin UI, sin base de datos, sin IA, sin LLM, sin RAG, sin gobernanzas nuevas. Sin `git add`, `commit`, `push`, `merge` ni `tag`.

---

*Fin de la instancia de referencia del Foundation Stack V1. Complementa la remediación y preserva íntegramente los documentos auditados.*
