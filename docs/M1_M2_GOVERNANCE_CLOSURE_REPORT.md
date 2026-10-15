# Cierre de Gobernanza M1 ↔ M2

**Documento:** `M1_M2_GOVERNANCE_CLOSURE_REPORT`
**Misión:** `M1_M2_GOVERNANCE_CLOSURE`
**Fecha:** 2026-10-14
**Marco:** `AI_CANON_HYBRID` (baseline/challenger · gates macro-F1 + ECE · test single-use · honestidad de estado)
**Reglas respetadas:** sin entrenar · sin modificar código · sin commits · sin push.
**Evidencia base:** `docs/M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md` (`M2_RECOVERED`) · `docs/M1_RECOVERY_AUDIT_REPORT.md` (`M1_PARTIAL`).

---

## 0. Dictamen

> ## `M1_BASELINE_M2_CHALLENGER`

El gate M1↔M2 queda **cerrado** como decisión de gobernanza estable: **M1 permanece baseline oficial congelado**, **M2 permanece challenger**, y el esquema baseline/challenger se **mantiene**. La promoción de M2 **no procede** en este cierre: no supera el discriminador primario (ECE) y el test single-use —que el canon reserva como confirmatorio— no se ha ejecutado.

---

## 1. Evidencia decisoria (recuperada)

| Dimensión | M1 MobileNetV2 (baseline) | M2 EfficientNet-B0 (challenger) | Δ (M2−M1) | Mejor |
|---|---|---|---|---|
| macro-F1 (val) | 0.9899 | **0.9937** | +0.0038 | M2 |
| **ECE (val)** | **0.0313** | 0.0332 | **+0.0019** | **M1** |
| balanced_accuracy | 0.9898 | **0.9943** | +0.0045 | M2 |
| weighted_f1 | 0.9902 | **0.9956** | +0.0054 | M2 |
| best epoch | 38 | 32 | — | — |
| duración | 2.78 h | 4.66 h | +1.88 h | M1 |
| params | **2 244 368** | 4 028 044 | **+79.5 %** | **M1** |
| Gates (macro-F1 ≥0.955 · ECE ≤0.10) | PASS · PASS | PASS · PASS | — | — |
| **Recuperación de artefactos** | `M1_PARTIAL` (pesos perdidos) | `M2_RECOVERED` (weights `best/last.pth`) | — | M2 |
| Test single-use | no ejecutado | no ejecutado | — | — |

**Regla de decisión del canon** (`TABLA_COMPARATIVA_M1_M5.md` §4): *(1) ECE ≤ 0.10 · (2) macro-F1 test single-use · (3) coste edge*. Con dataset de laboratorio saturado, **el discriminador real es ECE + coste edge**, no F1 solo.
**Habilitación** (`§5`): «la decisión P4 se toma con métricas de validación **hasta que se libere el test**».

**Lectura:** M2 gana en F1/BalAcc/W-F1 (márgenes < 0.005), pero **pierde en el discriminador primario (ECE)** y **pierde en coste edge** (+79.5 % params). No cumple superioridad en los criterios que el canon declara decisivos.

## 2. Q1 — ¿Debe mantenerse M1 como baseline?

> ## SÍ

- M1 = **BASELINE OFICIAL · CONGELADO** (`agriculture_v2_baseline_v2`, `APPROVED`); su rol es control clásico y referencia estable del benchmark.
- Supera ambos gates (macro-F1 0.9899 ≥ 0.955 · ECE 0.0313 ≤ 0.10) y **gana el discriminador primario (ECE)** y el coste edge.
- Su evidencia está íntegra y congelada (notebook + dossiers), aunque sus **pesos estén perdidos** (`M1_PARTIAL`): el baseline es una **decisión de referencia**, no depende de tener pesos vivos.
- **M1 no se re-entrena ni se modifica** (invarianza del canon).

## 3. Q2 — ¿Debe promoverse M2?

> ## NO

- **No supera el discriminador primario:** su ECE (0.0332) es **peor** que el de M1 (0.0313).
- **No supera el criterio de coste edge:** +79.5 % de parámetros (4 028 044 vs 2 244 368), coherente con inferencia embebida UBTN.
- **Test single-use no ejecutado** (`RUN_FINAL_TEST=False` en ambos) → falta la métrica confirmatoria que el canon designa como decisión final.
- M2 gana en F1 por márgenes sub-0.005, pero el propio canon advierte que con dataset saturado **F1 no es el factor discriminante**.
- El propio informe del run (`M2_VS_M1.json`) lo declara «**COMPETITIVO** … `baseline_master_candidate` … la decisión final depende del test single-use» — **competitivo ≠ superior**.
- Preservación honesta: **M2 permanece como `baseline_master_candidate` / challenger**, sin promoción.

## 4. Q3 — ¿Debe mantenerse un esquema baseline/challenger?

> ## SÍ

- Es el **invariante estructural de `AI_CANON_HYBRID`**: un control congelado (M1) + challengers evaluados con política idéntica.
- M2 es un challenger **válido y ahora auditable de extremo a extremo** (`M2_RECOVERED`), por lo que **mantener la ranura de challenger es lo correcto**: la evidencia ya no se pierde.
- El esquema sostiene la comparabilidad (misma seed 42, misma política, mismos splits) y la honestidad de estado.

## 5. Estado del gate

El gate **se cierra** en su componente **de status/arquitectura** (M1 baseline · M2 challenger) conforme al canon §5 (decisión con validación). Queda **reservado** —no abierto como bloqueo, sino como paso gobernado— el **test single-use** confirmatorio y cualquier eventual promoción futura (ver Q4).

## 6. Q4 — Requisitos para promoción (contrato)

La promoción de M2 (o de cualquier challenger) exige **TODO** lo siguiente, en orden:

1. **Test single-use ejecutado** una sola vez (`RUN_FINAL_TEST=True` en celda protegida), con métricas registradas (`test_metrics.json`).
2. **macro-F1 (test) ≥ baseline** sin degradación significativa.
3. **Sin regresión de ECE:** `ECE(M2) ≤ ECE(M1)` (+ margen declarado) — criterio primario.
4. **Coste edge dentro de presupuesto** (params/FLOPs) o justificación explícita de su impacto en inferencia embebida.
5. **`model_card.md`** de M2 + artefactos íntegros y reproducibles (`M2_RECOVERED` ✅ ya cumplido).
6. **Registro en manifiestos** (`baseline_experiment_manifest`, `TABLA_COMPARATIVA_M1_M5.md`, `benchmark_report.md`, `model_cards/`).
7. **Sin fuga ni bug** (diagnóstico macro-F1 < 1.0 y ≥ 0.90, idéntico en ambas arquitecturas).
8. **Orden explícita de Bernardo** (gobernanza humana; ninguna promoción por defecto ni automática).

> Mientras no se cumpla **todo** lo anterior: `M1 = baseline oficial · M2 = challenger`.

## 7. Q5 — Gobernanza definitiva del gate M1↔M2

> ## Gobernanza definitiva del gate M1↔M2

| Regla | Contenido |
|---|---|
| **G-1 Estado final** | **M1 = baseline oficial/congelado · M2 = challenger validado.** |
| **G-2 Discriminador** | Decisión por ECE (primario) + coste edge, no por F1 solo. |
| **G-3 Test single-use** | Reservado; se libera **una vez** al cierre de cada modelo, con orden explícita. |
| **G-4 No re-entrenar** | M1 no se re-entrena ni ajusta. Re-entrenarlo exige **orden explícita** (rompe el congelado). |
| **G-5 Promoción** | Solo por el contrato §Q4 (8 requisitos), con decisión humana explícita. |
| **G-6 Honestidad de artefactos** | M2 = `M2_RECOVERED` (weights vivos); M1 = `M1_PARTIAL` (pesos perdidos, métricas completas). Se declara, no se oculta. |
| **G-7 Servicio (R5)** | Ningún modelo M1/M2 es servible hoy: M1 sin pesos; M2 sin export aprobado. **Prohibido** usar `plant_disease_mbv2.h5` (histórico, `ROTO`) como M1/M2. |
| **G-8 Inmutabilidad** | El estado del gate se registra; no se reabre salvo nuevo experimento o liberación del test. |

## 8. Resultado del cierre

- **Gate M1↔M2: CERRADO** → `M1_BASELINE_M2_CHALLENGER` (decisión de gobernanza estable).
- **Reservado (no bloqueante):** test single-use confirmatorio (confirmación numérica, no cambia el estado salvo contradicción).
- **Preservado (NADA DESAPARECE):** M2 íntegro (13 artefactos, hashes en el informe M2); M1 como evidencia (notebook + dossiers).

## 9. Preservación

- M2: directorio completo (65.7 MB) = artefacto canónico recuperado.
- M1: notebook canónico embebe histórico + métricas + figuras (única copia viva).
- Dossiers M1 (`Documentacion/IA/Benchmark_M1_MobileNetV2/`) intactos.
- Sin commits, sin push, sin cambios de código. `stash@{0}` intacto.

---

*Honestidad de estado: M1 = baseline oficial (métricas reales congeladas; pesos perdidos); M2 = challenger validado (artefactos recuperados). Decisión del gate adoptada sobre validación conforme al canon; confirmación por test single-use reservada.*
