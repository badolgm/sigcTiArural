# CMSC — Plantilla de Decisión del Gate de Benchmark (G1) (v1)

| Campo | Valor |
|---|---|
| Documento | BENCHMARK_GATE_DECISION_TEMPLATE |
| Fecha | 2026-09-29 |
| Misión | CMSC_GOVERNANCE_GATE_CLOSURE_V1 |
| Naturaleza | Gobernanza · plantilla para fijar el gate G1 y registrar la decisión M1/M2. Sin código, sin commits. |
| Resuelve | Condición 5 del READINESS (gate de decisión benchmark G1 fijado en el roadmap) |

---

## 1. Objeto

Fijar en el roadmap la posición del gate G1 y proveer la plantilla para registrar, en una misión futura, la decisión entre el baseline oficial M1 (MobileNetV2) y el challenger M2 (EfficientNet-B0). No decide aquí: solo establece el mecanismo.

## 2. Posición del gate en el roadmap (acordada)

1. El gate G1 queda fijado **antes de la promoción de evidencia de modelos en F3E** (READINESS:187).
2. Mientras la decisión no exista, el Dashboard CMSC muestra la comparativa como **dato de gobernanza** con estado `PENDIENTE` (Blueprint §3 fila 9); no bloquea mostrar, sí promocionar (condición 5).
3. La decisión NO se toma en esta misión de gobernanza: se toma en una misión de análisis científico M1 vs M2 con orden explícita.

## 3. Datos de referencia (verificados, no decisión)

| Métrica | M1 MobileNetV2 (baseline) | M2 EfficientNet-B0 (challenger) |
|---|---|---|
| macro-F1 | 0.9899 | 0.9937 |
| ECE | 0.0313 | 0.0332 |
| Balanced Accuracy | 0.9898 | 0.9943 |
| Weighted-F1 | — | 0.9956 |
| Best epoch | — | 32 |
| Tiempo | — | 4.66 h aprox. |
| Estado actual | APROBADO/CONGELADO | EJECUTADO 2026-09-27, gates PASS |
| Artefactos en repo | sin pesos reconstruibles | sin pesos en repo (solo resultados) |

Fuente: `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` y `CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md:212-220`.

## 4. Campos obligatorios de la decisión futura

| Campo | Valor esperado |
|---|---|
| fecha_decision | fecha de la misión que decide |
| decision | M1 baseline se mantiene · M2 promovido a baseline · otro |
| criterio | métrica o criterio científico que justifica |
| exigencia_artefactos | lista de artefactos a materializar en repo antes de firmar |
| impacto_f3e | cómo afecta la promoción de evidencia en el KH |
| estado_anterior | PENDIENTE → resuelto |
| firma | Bernardo |

## 5. Regla de honestidad

La plantilla NO permite falsificar resultados: los números se citan desde ESTADO_ACTUAL_BENCHMARKS con trazabilidad; la decisión es un acto de gobernanza, no una mejora de datos.

## 6. Cierre

Gate G1 fijado en posición y procedimiento de decisión definido. La decisión correlativa queda pendiente por diseño (invariante de honestidad) hasta misión de análisis científico explícita.

---

*Plantilla de gobernanza. Sin decisión tomada. Sin código. HEAD `18b95b1` intacto.*