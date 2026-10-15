# DOCKER_READY_FINAL_DECISION_REPORT

**Misión:** `DOCKER_READY_FINAL_DECISION`
**Naturaleza:** SOLO DECISIÓN · evaluación y clasificación. **NO modifica código · NO dockeriza · NO crea tag · NO commits · NO push · NO `down -v` · NO OCI.**
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-14 (America/Bogota)
**Base (referencia):** `DOCKER_READY_CLOSURE_REPORT` (`DOCKER_NOT_READY`) · `DOCKER_READY_R1_R4_REPORT` (`DOCKER_READY_R1R4`) · `H5_AI_GOVERNANCE_CLOSURE_REPORT` (`H5_CLOSED`) · `M1_M2_GOVERNANCE_CLOSURE_REPORT` (`M1_BASELINE_M2_CHALLENGER`).
**Regla:** toda afirmación se ancla a disco/git/runtime. Lo no evidenciado se declara.

---

## 0. Dictamen

> # `DOCKER_NOT_READY`

Han cerrado los bloques de **gobernanza** (H5 ✅, gate M1↔M2 ✅) y el tramo **R1–R4** ✅, y se recuperó **M2** (`M2_RECOVERED`). Pero **el *serving* de IA (R5), el versionado/despliegue (R6) y la verificación E2E + visual (R7/R7.5) siguen ABIERTOS**. Por tanto **no puede declararse `DOCKER_READY` global**.

| Ámbito | Estado | Motivo |
|---|---|---|
| R1–R4 (higiene · readiness · backend prod · mismo-origen) | ✅ **CERRADO** | `DOCKER_READY_R1R4` |
| H5 (gobernanza IA: canónico vs histórico) | ✅ **CERRADO** | `H5_CLOSED` |
| Gate M1↔M2 (G-1) | ✅ **CERRADO** | `M1_BASELINE_M2_CHALLENGER` (M1 baseline · M2 challenger) |
| Recuperación de artefactos | ◑ **PARCIAL** | M2 `M2_RECOVERED` · M1 `M1_PARTIAL` (pesos perdidos) |
| **R5 (serving IA canónico)** | ❌ **ABIERTO** | `ai_service` sirve el `.h5` histórico; sin cadena ONNX |
| **R6 (tag release · `compose.resolved.yml` · `DEPLOYMENT.md`)** | ❌ **NO CERRADO** | sin tag de release; artefacto y doc oficial ausentes |
| **R7 (§G E2E)** | ❌ **NO CERRADO** | G2/G4/G8/G13/G15 sin verificar |
| **R7.5 (validación visual humana)** | ❌ **PENDIENTE** | 16 capturas §J + DevTools |

---

## 1. Verificación de estado (read-only, 2026-10-14)

- **Git:** HEAD `9109050` (sin commits desde la cadena previa) · tags solo `PRE_DOCKER_OFFICIAL_2026_10_13` y `PRE_R1_R4_EXECUTION` → **no existe tag de release** · 35 líneas en `git status` (8 modificados R1–R4/pre-existentes + docs untracked).
- **R6:** `docs/DEPLOYMENT.md` **existe pero obsoleto** (2 213 B · 21/08/2026; línea 74: *"El repositorio actual no incluye `docker-compose.yml`"* — **falso hoy**) · `compose.resolved.yml` **ausente** · `docs/R6_R7_EXECUTION_REPORT.md` **ausente**.
- **R5:** `*.onnx` en repo = **∅**; `:8081/health` sirve `plant_disease_mbv2.h5` (histórico). Sin cadena ONNX.
- **R7:** sin evidencia de G2/G4/G8/G13/G15 ejecutadas.
- **Artefactos M2:** presentes en `...\Archivos-sigctiArural\runs-20261015T023028Z-1-001\runs\M2_efficientnet_b0` (13 archivos · 65 665 990 B).
- **Runtime:** daemon Docker **UP**; stack `sigctiarural_{frontend,backend,ai_service,postgres_db}` corriendo (frontend `healthy`; resto `health: starting` en la observación); contenedores ajenos (`vetna_*`, `eiarc_*`, `servsoft*`) intactos.

## 2. Q1 — Bloqueadores reales restantes

| # | Bloqueador | Ámbito | Naturaleza | Estado |
|---|---|---|---|---|
| **B1** | **Serving IA no alineado al canon** — `ai_service` sirve el `.h5` histórico; **sin cadena ONNX** (R5.1–R5.6 sin ejecutar) | Global (R5) | Código/Implementación | ❌ Abierto |
| **B2** | **Sin tag de release reproducible** (semver+SHA) | R6 | Ops | ❌ Abierto |
| **B3** | **`docs/DEPLOYMENT.md` obsoleto** (21/08/2026) y **sin `compose.resolved.yml`** | R6 | Documental/Ops | ❌ Abierto |
| **B4** | **Decisión de alcance R6:** ¿registry push = OCI (excluido) o parte de R6? | R6 | Gobernanza | ⏳ Pendiente |
| **B5** | **§G E2E incompleto:** G2 (build 4), G4 (migraciones), G8 (`/infer`), G13 (sin binarios), G15 (smoke frontend) | R7 | Verificación | ❌ Abierto |
| **B6** | **Validación visual humana §J** (16 capturas + DevTools) | R7.5 | Humana | ❌ Pendiente |
| **B7** | **M1 sin pesos** (`M1_PARTIAL`) → restringe servir M1 como `default` | R5 (parcial) | Artefacto | ❌ Abierto (mitigable) |
| **B8** | *(Opcional, ligado)* de-cloud `cloud.js`/`lab-data.js` (residual V8) | Residual | Código | ⏳ Opcional |

**No bloqueadores (ya resueltos):** H5 (gobernanza) ✓ · gate G-1 M1↔M2 ✓ · R1–R4 ✓ · M2 artefactos ✓.

## 3. Q2 — Qué sigue pendiente

- **R5 (serving canónico):** materializar cadena ONNX (M1 y/o M2) + paridad dorada · reemplazar carga `.h5` en `ai_service` · generalizar contrato a 16 clases (`contract_version v2`) · frontend multiclase · holdout (`G-3b`). **Requiere misión de código explícita.**
- **R6:** tag de release anotado · `compose.resolved.yml` · reescritura de `DEPLOYMENT.md` · resolver B4 (registry = OCI).
- **R7:** ejecutar G2/G4/G8/G13/G15 con daemon UP y servicios explícitos.
- **R7.5:** pasada visual humana §J + DevTools (acta + capturas).
- **Residual opcional:** de-cloud.

> **Actualización de prerrequisitos R5** (respecto a `R5_AI_SERVING_STRATEGY_REPORT`): **P2 (gate G-1) queda RESUELTO** (`M1_BASELINE_M2_CHALLENGER`) y **P1 queda parcialmente resuelto** (M2 materializado). Persisten **P3** (`holdout=0`) y **P4** (sin ONNX). **Nuevo matiz:** al faltar los pesos de M1, la estrategia «servir M1 `default` + M2 flag» **no es ejecutable** sin re-entrenar; M2 es el único artefacto materializado disponible.

## 4. Q3 — Qué puede cerrarse

1. **R5 — prerrequisitos:** P2 ✅ (gate cerrado) y P1 ◑ (M2 recuperado) ya se pueden dar por resueltos; el bloqueo restante es **implementación** (ONNX + serving), no gobernanza ni artefactos.
2. **R5 — interim (Vía B-runtime, desbloqueado):** etiquetar el `.h5` como `HISTÓRICO` explícito en `/infer`+UI (gate G-5) — haría al `ai_service` **honesto sin M1/M2**. No sustituye al serving canónico, pero es cerrable por misión de código.
3. **R6:** cerrable con una misión de ejecución (tag + `compose.resolved.yml` + `DEPLOYMENT.md`), resolviendo B4.
4. **R7/R7.5:** cerrables con misión de verificación (daemon UP, servicios explícitos) + acta visual humana.
5. **De-cloud (B8):** cerrable (opcional) alineado con R6/R7.

## 5. Q4 — ¿Puede declararse Docker Oficial (`DOCKER_READY`) ya?

> ## NO — `DOCKER_NOT_READY`

- **Gobernanza:** ✅ resuelta (H5 + gate M1↔M2). El antiguo "bloqueador no controlable" (R5/H5) está **desbloqueado a nivel de decisión**, pero **no implementado**.
- **Faltan tres ámbitos de ejecución** independientes: **R5** (serving), **R6** (versionado/docs), **R7/R7.5** (verificación + visual).
- Honestidad: `H5_CLOSED` cerró la *pregunta de canon*, **no** el *serving*; `:8081/health` sigue reportando el `.h5` histórico. Sin R5, el stack **no está alineado** a `AI_CANON_HYBRID`.

**Vía de cierre hacia `DOCKER_READY`:**
1. **R5** — ONNX de M2 (y M1 si se recupera/re-entrena con orden) + `ai_service` ONNX + contrato v2 + holdout — **o** interim G-5 (etiqueta `HISTÓRICO`) si se acepta serving no canónico.
2. **R6** — tag release + `compose.resolved.yml` + `DEPLOYMENT.md`; decidir registry (OCI).
3. **R7** — §G completo en verde.
4. **R7.5** — acta visual humana.
5. **R8:** declarar → **`DOCKER_READY`**.

> Si se cierra **R5(interim o canónico) + R6 + R7**, el estado pasa a **`DOCKER_READY`**. Hoy, sin ninguno de los tres, el veredicto permanece **`DOCKER_NOT_READY`**.

---

## 6. Clasificación

```
┌──────────────────────────────────────────────────────────────────────┐
│  R1–R4:          ✅ CERRADO (DOCKER_READY_R1R4)                        │
│  H5:             ✅ CERRADO (gobernanza) — serving sigue ABIERTO       │
│  Gate M1↔M2:     ✅ CERRADO (M1 baseline · M2 challenger)             │
│  M2 artefactos:  ✅ M2_RECOVERED   ·   M1: ◑ M1_PARTIAL (sin pesos)    │
│  R5 serving:     ❌ ABIERTO   (sin ONNX; ai_service sirve .h5)         │
│  R6:             ❌ NO CERRADO (tag · compose.resolved.yml · doc)      │
│  R7 / R7.5:      ❌ NO CERRADO / PENDIENTE                             │
│                                                                        │
│  CLASIFICACIÓN GLOBAL:  DOCKER_NOT_READY                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Recomendación (sin ejecutar)

1. **Misión de ejecución R6+R7** (plan ya disponible en `R6_R7_EXECUTION_PLAN`, `READY_FOR_R6_R7_EXECUTION`).
2. **Decidir R5:** (a) implementación canónica ONNX sobre **M2** (único artefacto vivo) + contrato v2; o (b) interim G-5 (etiqueta `HISTÓRICO`). Con la salvedad de que servir M1 exige re-entrenar (orden explícita) por `M1_PARTIAL`.
3. Confirmar decisión **B4** (registry = OCI, fuera de R6).
4. Declarar `DOCKER_READY` (R8) **solo** cuando R5 + R6 + R7 estén cerrados con evidencia.

---

**Sin modificar código · sin commits · sin push · sin dockerizar · sin `down -v` · sin OCI.**

**Referencias:** `docs/DOCKER_READY_CLOSURE_REPORT.md` · `docs/DOCKER_READY_R1_R4_REPORT.md` · `docs/H5_AI_GOVERNANCE_CLOSURE_REPORT.md` · `docs/M1_M2_GOVERNANCE_CLOSURE_REPORT.md` · `docs/M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md` · `docs/M1_RECOVERY_AUDIT_REPORT.md` · `docs/R5_AI_SERVING_STRATEGY_REPORT.md` · `docs/R6_R7_EXECUTION_PLAN.md`.
