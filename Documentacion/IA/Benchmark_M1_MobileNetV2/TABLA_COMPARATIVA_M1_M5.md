# SIGCTiArural — Tabla Comparativa Benchmark V1 (M1–M5)

**Documento:** TABLA_COMPARATIVA_MODELOS (D)
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry`
**Estado honestidad:** M1 = **real (APROBADO, baseline oficial)** · M2–M5 = `diseño/pendiente`
**Dataset:** `agriculture_images_tomato-potato-corn` v1 · 22.488 / 16 clases / 3 especies · split 15.741/3.373/3.374 (seed 42)
**Regla de oro:** el test set se toca **UNA sola vez** al cierre de cada modelo; ningún modelo se evalúa contra test en fases intermedias.

---

## 1. Tabla general

| ID | Arquitectura | Rol oficial | Params (aprox.) | Coste entreno | Estado | macro-F1 val (real/esperado) | ECE val (real/esperado) |
|---|---|---|---|---|---|---|---|
| **M1** | **MobileNetV2** | **control clásico · baseline oficial SIGCTiArural** | **2.24M (medido)** | baja | ✅ **APROBADO — CONGELADO** | **0.9899 (real)** · esperado 0.955–0.970 | **0.0313 (real)** · esperado 0.04–0.08 |
| M2 | EfficientNet-B0 | baseline_master_candidate | ~4.3M | media | ⏳ pendiente | esperado 0.955–0.970 | esperado 0.04–0.08 |
| M3 | MobileNetV3-Large | baseline_edge_candidate | ~4.2M | baja | ⏳ pendiente | esperado 0.955–0.970 | esperado 0.04–0.08 |
| M4 | ResNet50 | classic_control | ~23.6M | media-alta | ⏳ pendiente | esperado alto | por estimar |
| M5 | ConvNeXt-Tiny | experimental_ceiling | ~27.9M | alta | ⏳ pendiente | esperado alto | por estimar |

> Params de M2–M5: **estimaciones** (cabeza 16 clases, torchvision); se validan con `measure_params` al ejecutar cada run. Params de M1: **medidos** (celda #5 del notebook, total 2.244.368).

## 2. Criterios de aceptación (gates, idénticos en los 5)

| Gate | Umbral | Resultado M1 |
|---|---|---|
| macro-F1 (validation) | ≥ 0.955 | **0.9899 → PASS ✅** |
| ECE (validation) | ≤ 0.10 | **0.0313 → PASS ✅** |
| Diagnóstico | no fuga (macro-F1 no ≈ 1.0) · no bug (≥ 0.90) | consistente (0.9899 < 1.0) ✅ |

## 3. Método de comparación (idéntico en los 5)

- Misma seed 42, mismas transformaciones (augment train; val/test sin augment).
- Misma política: CrossEntropy ponderada, WeightedRandomSampler, AdamW 3e-4 (wd 1e-4), CosineAnnealing T=40, early stop patience 8, batch 64, 224px.
- Mismas particiones oficiales; scripts/notebook del benchmark (`benchmark/src/*`, `config.yaml`) como referencia canónica.
- Métrica de decisión final: **macro-F1 sobre test (single-use)**; Δ reportadas por pares (arquitectura − control M1).

## 4. Criterio de decisión (prioridades)

1. ECE ≤ 0.10 (calibración).
2. macro-F1 test.
3. Coste edge (params/FLOPs) — coherente con inferencia embebida UBTN.

> Con dataset de laboratorio saturado, la separación en F1 entre top arquitecturas suele ser pequeña; **el factor de discriminación real será ECE + coste edge**, no F1 solo.

## 5. Observaciones de gobernanza

- M1 queda **congelado** como referencia: ningún re-entrenamiento, ningún ajuste de hiperparámetros.
- registro oficial: `baseline_experiment_manifest.agriculture_v2_baseline_v2.yaml` (rol **control**).
- M2–M5: al aprobarse, se registran con su estado de honestidad y se suman a esta tabla.
- Prohibido comparar arquitecturas fuera de la política idéntica (amenaza de validez interna).