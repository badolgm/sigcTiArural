# AI_CANON_IMPLEMENTATION_DECISION_REPORT

**Misión:** `AI_CANON_IMPLEMENTATION_DECISION`
**Naturaleza:** SOLO decisión estratégica + roadmap. **NO implementa · NO exporta ONNX · NO entrena · NO modifica código · NO genera modelos · NO commits · NO push · NO OCI.**
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-14 · **Regla:** toda afirmación se ancla a disco/git/docs; lo no evidenciado se declara.

---

## 0. Estado congelado (recibido, no se modifica)

| Hecho | Estado |
|---|---|
| `AI_CANON_HYBRID` | ✅ línea canónica = **M1/M2 sobre `agriculture_images_tomato-potato-corn/v1`**; contrato **neutral de framework (ONNX)**; `.h5` = HISTÓRICO |
| `H5_CLOSED` | ✅ gobernanza cerrada (canónico vs histórico) |
| `M1_BASELINE_M2_CHALLENGER` | ✅ gate M1↔M2 cerrado: **M1 baseline oficial · M2 challenger** · promoción **NO procede** |
| `M2_RECOVERED` | ✅ pesos M2 en disco (fuera del repo): `best.pth`/`last.pth` + `validation_metrics.json` + `model_card`-inputs |
| `M1_PARTIAL` | ⚠️ métricas completas, **pesos perdidos** (no servible sin re-entrenar) |
| Dataset `v1` | ✅ canónico (22 488 imgs · 16 clases · split seed 42) |
| Docker R1–R4 | ✅ ejecutado |
| Servicio hoy | ❌ `ai_service` sirve `plant_disease_mbv2.h5` (**HISTÓRICO**, degenerado); `*.onnx` en repo = ∅ |
| `real_world_holdout` | ❌ = 0 |

> **Decisiones intocables:** M1 = baseline oficial · M2 = challenger oficial · Dataset v1 = canónico · `plant_disease_mbv2.h5` = HISTÓRICO.

---

## 1. Q1 — ¿Cuál debe ser la estrategia oficial de serving?

> ## D. **Contrato neutral (ONNX)**

**La estrategia oficial es servir la línea canónica a través de un contrato neutral de framework (ONNX / ONNX Runtime).**

**Motivo (anclado al canon):** `AI_CANONICAL_STRATEGY_DECISION_REPORT.md` §7.3 fija el contrato público como **neutral de framework** (`{prediction, trace, source_mode}`) y ordena **exportar a ONNX/ONNX Runtime** para desacoplar frontend/Docker/edge del framework de entrenamiento. `H5_CLOSED §5.4` confirma que el contrato público (`prediction/trace/source_mode`) **no cambia** al migrar.

### Evaluación de las 4 opciones

| Opción | Veredicto | Razón (anclada) |
|---|---|---|
| **A. Mantener `.h5` histórico** | ❌ **RECHAZADA** | Institucionaliza un modelo **degenerado** (colapsa a `class_0`, `MODEL_RETRAIN_REQUIRED`) y **no relacionado con `v1`** (`DATASET_UNRELATED_TO_MODEL`). Contradice `H5_CLOSED` (el `.h5` no es el oficial). Riesgo **CRÍTICO** (congela el error). |
| **B. Servir M2 directamente** | ❌ **RECHAZADA** | Acopla el contrato al **framework PyTorch** (fuera del perímetro declarado) y equivale a **promover por decreto** un challenger — `M1_M2_GOVERNANCE_CLOSURE` Q2 = **NO** (M2 no supera ECE ni coste edge). |
| **C. Servir M1 primero** | ❌ **NO EJECUTABLE hoy** | M1 = baseline, pero `M1_PARTIAL`: **pesos perdidos** → no hay artefacto que servir sin re-entrenar (prohibido sin orden explícita; rompe el congelado). |
| **D. Contrato neutral (ONNX)** | ✅ **ADOPTADA** | Única compatible a la vez con `AI_CANON_HYBRID §7.3`, `H5_CLOSED`, `M1_BASELINE_M2_CHALLENGER`. Desacopla framework, no institucionaliza el error, no quema el gate. |

> **Nota de precisión:** D **no elige modelo**; elige la **vía de serving**. Qué artefacto se exporta (M2 disponible; M1 requeriría re-entrenar) es la **decisión D-serve** (§7, punto abierto).
> **Servir ≠ promover:** exportar bajo contrato neutral **no** altera el gate (`M1 baseline / M2 challenger`); la promoción sigue reservada a los 8 requisitos del contrato y a orden explícita.

---

## 2. Q2 — Camino con menor riesgo

**Menor riesgo global (gobernanza + ciencia + operación) = D (ONNX) ejecutado por fases, precedido del *interim* honesto.**

| Camino | Riesgo gobernanza | Riesgo ciencia | Riesgo operativo | Global |
|---|---|---|---|---|
| A (`.h5`) | 🔴 Crítico | 🔴 Crítico | 🟢 Nulo | 🔴 **Inadmisible** |
| B (M2 directo) | 🟠 Alto (quema gate) | 🟡 Bajo | 🟡 Medio (torch en imagen) | 🟠 Alto |
| C (M1 primero) | 🟡 Medio | 🟢 Bajo | 🔴 **Bloqueado** (sin pesos) | 🔴 **No ejecutable** |
| **D (ONNX) + interim** | 🟢 Bajo | 🟢 Bajo | 🟡 Medio–bajo | 🟢 **Mínimo** |

- **Paso 0 de riesgo casi nulo:** **interim honesto** — etiquetar el `.h5` como `HISTÓRICO` explícito en `/infer` + UI (gate `G-5`). Rinde **honestidad inmediata** sin tocar modelos. (Es *etiquetado*, **no** serving del canon — `R5_AI_SERVING_STRATEGY_REPORT §7.0`.)
- **Riesgo específico mitigado:** paridad de preprocesado (doble normalización) → **test de paridad dorada** PyTorch ≈ ONNX ≈ servido (≤1e-3), obligatorio antes de publicar.

**Respuesta:** D, ejecutado por fases, arrancando por el *interim* honesto.

---

## 3. Q3 — Camino con menor esfuerzo

> Distinción honesta de tres planos:

1. **Menor esfuerzo absoluto = A (no hacer nada).** Coste ≈ 0 — **pero inadmisible** (rechazada por gobernanza).
2. **Menor esfuerzo aceptable (honestidad sin modelos) = *interim* `G-5`:** editar texto/badge en `/infer` + `AIPredictiva.jsx` para declarar `HISTÓRICO`. Horas, no días; **no sirve el canon**.
3. **Menor esfuerzo que SÍ sirve el canon = D (ONNX)** con un **solo artefacto** (export de M2, ya recuperado) — evita el trabajo de materializar M1 (imposible hoy sin re-entrenar).

**Respuesta:** para *servir el canon*, el menor esfuerzo es **D con export único de M2** + runtime neutral; el atajo absoluto (**A**) queda **rechazado** por gobernanza, y el *interim* `G-5` es el paliativo honesto más barato.

---

## 4. Q4 — Camino técnicamente correcto a largo plazo

> ### D — Contrato neutral (ONNX)

Es la única vía que satisface simultáneamente los invariantes del ecosistema:

1. **Desacople framework↔servicio:** cambiar de modelo/arquitectura **no** obliga a reescribir frontend/Docker/edge (el defecto estructural que hoy acopla todo al `.h5`).
2. **Reproducibilidad y paridad:** artefacto versionado + `model_card` + `labels_v1.csv` como autoridad del mapa índice→clase; paridad dorada verificable.
2. **Edge (UBTN):** mismo `.onnx` convertible a TFLite/otros en perímetro (`UBTN_EDGE_AI_STRATEGY`), sin salir de la línea canónica.
3. **Compatibilidad con lo oficial:** Frontend (`prediction/trace` se conserva y generaliza a 16 clases), Docker (runtime neutral), OCI (contenedor neutro), SIGCT Memory (documenta, no binarios), ACP (contrato estable), CMSC (mismo runtime `onnxruntime` ya previsto para S81).

**Respuesta:** framework-neutral, reproducible y agnóstico de despliegue → **D**.

---

## 5. Q5 — Impacto por sistema

| Sistema | Impacto de servir por ONNX (D) | Evidencia |
|---|---|---|
| **Docker Oficial** | **Requiere rediseño del `ai_service`:** `onnxruntime` reemplaza `tensorflow-cpu` (`requirements.txt:1-13`); el artefacto se **inyecta** (no se hornea — hoy `Dockerfile:21` hace `COPY . .`); `.dockerignore` excluye `.h5`/`.keras`. Reduce peso y arranque. **Habilita `DOCKER_READY`** una vez cerrados R6/R7. | `R5_AI_SERVING_STRATEGY_REPORT §4` · `DOCKER_READY_FINAL_DECISION_REPORT` |
| **OCI** | **Neutro.** El contenedor sirve igual cualquier runtime; el `.onnx` es apto para registry/firma/SBOM (fuera de alcance). Queda **"ready-for-OCI"**, no se ejecuta. | `AI_CANONICAL_STRATEGY_DECISION_REPORT §6,§10` |
| **SIGCT Memory** | **Favorable.** Excluye binarios (`*.h5/*.keras/*.onnx`) e indexa **documentación**; canonizar **documenta** la línea y la alimenta con gobernanza, no con pesos. | `SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md:59,96` |
| **VoiceAssistant** | **Independiente.** Comparte contenedor (`/assist` STT/TTS) pero **no depende** del modelo de imagen. | `VoiceAssistant.jsx:8,83,172` · `fastapi_app.py:291` |
| **ACP** | **Favorable.** Consume el contrato **estable** `prediction/trace`, no un framework → mejora su trazabilidad. | `CMSC_F4_ACP_ARCHITECTURE_v1.md` |
| **CMSC** | **Favorable/alineado.** La línea acústica ya prevé `onnxruntime-web` (S81); ambas usan el mismo principio de runtime neutral → **convergencia**. | `AI_ACOUSTIC_S81_INTEGRATION.md:104-112` |
| **Dashboard / Frontend Oficial** | **Presentación, no red.** `AIPredictiva.jsx:58-62,141,147-148` deja de rotular "binario" y muestra `especie · condición` (contrato v2). Misma forma de fetch. **Requiere misión explícita de frontend (G-5).** | `R5_AI_SERVING_STRATEGY_REPORT §6` |

---

## 6. Q6 — Gates faltantes para que la IA canónica sea servible

| Gate | Contenido | Estado |
|---|---|---|
| **G-1** | Promoción M1 vs M2 | ✅ **CERRADO** (`M1_BASELINE_M2_CHALLENGER`) |
| **G-2** | **Export ONNX + runtime neutral en `ai_service`** + paridad dorada | ❌ **ABIERTO** (`DISEÑO`) |
| **G-3** | **`semantic_contract_version v2`** + resolver **16 clases data-driven** | ❌ **ABIERTO** (`PENDING`) |
| **G-3b** | `real_world_holdout` > 0 **antes de publicar** | ❌ **ABIERTO** (holdout = 0) |
| **G-4** | Reubicar `.h5` a histórico (sin borrar) | ⏳ Pendiente (housekeeping) |
| **G-5** | Frontend: retiro del rótulo binario + presentación multiclase; `/infer` etiqueta `HISTÓRICO` | ⏳ Pendiente (frontend) |
| **G-NEW-A** | **Paridad dorada** PyTorch↔ONNX↔servido (≤1e-3) | ❌ Añadido por esta misión |
| **G-NEW-B** | **`model_card.md` + `validation_metrics.json` + `labels_v1.csv`** como requisito de existencia del modelo | ❌ Añadido |
| **G-NEW-C** | **Artefacto inyectado** (no hornear `.h5`/`.onnx` en la imagen) | ❌ Añadido |

**Conclusión:** el gate de gobernanza (G-1) ya no bloquea; **bloquean los gates de implementación G-2/G-3/G-3b** (+ los nuevos A/B/C) y el frontend G-5.

---

## 7. Q7 — Roadmap operativo (AI-R1 → AI-R5)

> Cada fase = **misión explícita**. Este reporte **no ejecuta ninguna**.

| Fase | Nombre | Trabajo | Salida | Gate |
|---|---|---|---|---|
| **AI-R1** | **Preparación de artefacto** | Decidir artefacto servible (**M2 disponible**; M1 requiere orden de re-entrenar — §7). Reunir `model_card.md` + `validation_metrics.json` + `labels_v1.csv`. | artefacto + metadatos listos | G-NEW-B |
| **AI-R2** | **Export ONNX + paridad** | `torch.onnx.export` (opset 17) + **test de paridad dorada** (≤1e-3). | `.onnx` verificado | **G-2 / G-NEW-A** |
| **AI-R3** | **`ai_service` neutral** | `onnxruntime` reemplaza `tensorflow-cpu`; carga `.onnx`; **inyección** de artefacto; `/health` honesto; `.dockerignore`. | imagen sirve ONNX; `.h5` fuera del build | **G-2 / G-NEW-C** |
| **AI-R4** | **Contrato v2 + Frontend** | Resolver **16 clases data-driven** + `contract_version:"v2"`; `AIPredictiva.jsx` multiclase; retiro rótulo binario. | `/api/v3/ai/inference/` v2 | **G-3 / G-5** |
| **AI-R5** | **Validación y cierre** | Validación con `real_world_holdout`; publicar métricas; **cierre R5** → habilita `DOCKER_READY`. | `R5_CLOSED` | **G-3b** |

**Diagrama:**
```
.h5 HISTÓRICO (hoy) ─┐
                      │ AI-R1 artefacto (M2) ─► AI-R2 ONNX ─► AI-R3 ai_service ─► AI-R4 v2+UI ─► AI-R5 holdout ─► R5_CLOSED
M1 baseline (ref.)  ──┘                                     │
  (sin pesos → requiere orden para re-entrenar)             └─ interim G-5: etiqueta HISTÓRICO (desbloqueado, no canon)
```

---

## 8. Clasificación

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   CLASIFICACIÓN:   AI_SERVING_ONNX                                            │
│                                                                               │
│   Estrategia oficial = contrato neutral de framework (ONNX/ONNX Runtime).     │
│   · Rechaza servir el .h5 histórico (A) ni promover un modelo por decreto     │
│     (B/C).                                                                    │
│   · Compatible a la vez con AI_CANON_HYBRID, H5_CLOSED y                      │
│     M1_BASELINE_M2_CHALLENGER.                                                │
│   · Menor riesgo (D por fases + interim honesto) y camino correcto a largo    │
│     plazo.                                                                    │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Descartadas:** `AI_SERVING_H5` (institucionaliza el error) · `AI_SERVING_M1` (no ejecutable, `M1_PARTIAL`) · `AI_SERVING_M2` (acopla a PyTorch + promoción por decreto).

---

## 9. Punto abierto — Decisión `D-serve` (para Bernardo)

La vía D está adoptada; **falta decidir qué artefacto se exporta primero**:

| Sub-opción | Descripción | Coste | Nota de gobernanza |
|---|---|---|---|
| **D-serve-1** | Exportar **M2** (recuperado) bajo contrato neutral | Bajo (artefacto existe) | **No altera el gate** (servir ≠ promover); requiere **orden explícita** (§G-7). |
| **D-serve-2** | Materializar **M1** (baseline) como modelo por defecto | Alto (**re-entrenar**, `M1_PARTIAL`) | **Rompe el congelado** del baseline → exige orden explícita y nuevo run. |
| **D-serve-3** | *Interim* `G-5` mientras D-serve-1/2 madura | Muy bajo | Etiquetado honesto, **no** sirve el canon. |

**Recomendación (sin ejecutar):** **D-serve-1** (exportar M2) + contrato neutral, con M1 como **baseline de referencia congelado**; mantener el *.interim* honesto* como paso 0. Servir M2 bajo contrato neutral **no es promoción** y no reabre el gate; si Bernardo exige servir *el baseline* (M1), solo **D-serve-2** lo permite (con orden explícita de re-entrenar).

---

## 10. Veredicto

- **Estrategia de serving oficial:** **D — contrato neutral (ONNX)** → `AI_SERVING_ONNX`.
- **Menor riesgo:** D por fases + *interim* honesto `G-5`.
- **Menor esfuerzo:** aceptable = *interim* `G-5`; canon = D con export único de M2 (A = mínimo absoluto pero **inadmisible**).
- **Correcto a largo plazo:** D (desacople framework, edge/UBTN, Memory, ACP, CMSC).
- **Gates faltantes:** G-2 · G-3 · G-3b · G-5 (+G-NEW A/B/C); **G-1 ya cerrado**.
- **Roadmap:** AI-R1 artefacto → AI-R2 ONNX+paridad → AI-R3 `ai_service` → AI-R4 contrato v2+UI → AI-R5 holdout → `R5_CLOSED` → habilita `DOCKER_READY`.

---

**Sin implementar · sin exportar ONNX · sin entrenar · sin modificar código · sin commits · sin push · sin OCI.**

**Referencias (evidencia):**
- `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` (`AI_CANON_HYBRID`, §7.3 contrato neutral, gates G-1..G-5)
- `docs/H5_AI_GOVERNANCE_CLOSURE_REPORT.md` (`H5_CLOSED`, canónico vs histórico, impacto Docker)
- `docs/M1_M2_GOVERNANCE_CLOSURE_REPORT.md` (`M1_BASELINE_M2_CHALLENGER`, G-7 servicio)
- `docs/M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md` (`M2_RECOVERED`)
- `docs/M1_RECOVERY_AUDIT_REPORT.md` (`M1_PARTIAL`, pesos perdidos)
- `docs/R5_AI_SERVING_STRATEGY_REPORT.md` (`R5_NOT_READY`, estrategia ONNX, §7.0 interim)
- `docs/DOCKER_READY_FINAL_DECISION_REPORT.md` (`DOCKER_NOT_READY`)
- `src/ai_models/fastapi_app.py:171-193,199-263` · `src/ai_models/Dockerfile:21` · `src/ai_models/requirements.txt:1-13`
- `src/backend/.../semantic_prediction_resolver.py:74` · `src/frontend/src/pages/AIPredictiva.jsx:58-62,141,147-148`
