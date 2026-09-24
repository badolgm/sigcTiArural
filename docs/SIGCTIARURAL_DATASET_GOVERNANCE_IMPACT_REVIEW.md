# SIGCTiArural — Dataset Governance Impact Review (Dataset V2+)

**Documento:** SIGCTIARURAL_DATASET_GOVERNANCE_IMPACT_REVIEW
**Fecha:** 2026-09-23 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `5a079f4`
**Clasificación:** **NO CANÓNICO · SOLO INVESTIGACIÓN · SOLO GOBERNANZA**
**Tipo:** Revisión formal de impacto técnico de introducir **Dataset V2+** (extensión aditiva) sobre Dataset V2, manifests, split, benchmark y taxonomía.
**Modo:** SOLO INVESTIGACIÓN/Gobernanza. No modifica MASTERPLAN, EXECUTION_PLAN, DATASET_V2 ni MANIFESTS. No ejecuta materialización, no entrena, no commit.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado (real/referencia/simulación/diseño). NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.

---

## 0. Postura rectora (decisión fundante)

- **Dataset V2 Canónico** permanece como **baseline oficial e inmutable**:
  - PlantVillage · **22.488 imágenes** · **16 clases** · **3 especies** (referencia: `SIGCTIARURAL_DATASET_V2_RECOVERY_CONSOLIDATION.md`).
- **Dataset V2+ es una extensión aditiva.** No reemplaza, no muta, no "supera": convive y se evalúa contra el baseline v1.
- Toda referencia histórica/estructural del ecosistema DATASET V2 (manifiestos v1, RAW v1, labels_v1.csv, split_v1, contexto de taxonomía EIARC) se preserva exactamente como está.

---

## 1. Qué cambia realmente con V2+

Cambia **contenido, fronteras y contrato de comparabilidad de los datos** — no la documentación estructural existente.

| Componente | Cambio real |
|---|---|
| **raw_source_manifest** | `expected_images` (21160 → nuevo conteo V2+), `source_root`/`subset_root` (fuente ya no es PlantVillage puro: suman datos de campo/vía alterna) |
| **curation_manifest** | `expected_totals`, `included_classes`, conteos por clase (≠ 21160 / ≠ Septoria 443 ya divergentes en recuperación) |
| **labels** | Nuevos `sample_id`, nuevos valores de `annotation_quality`/`validation_source` para datos no-PlantVillage (p. ej. `field_collected`) |
| **split** | `split_manifest` + `split_lists/*.csv` se regeneran sobre el corpus ampliado; anti-fuga (dedup + pHash) re-aplica al universo combinado; **rangos y ratios por clase cambian** |
| **benchmark** | El experimento `agriculture_v2_baseline_v1` deja de ser representativo del corpus ampliado (num_classes, distribución, class-imbalance). Resultados v1 **NO comparables 1:1** contra benchmark v2+ salvo re-ejecución completa |
| **taxonomía** | Los 16 `canonical_class_id` existentes NO cambian, pero el universo se expande → se requiere **taxonomía v2** (bindings nuevos), no edición de la v1 |

**El cambio es de escala y de fronteras: tamaño, distribución, procedencia y comparabilidad del benchmark.**

---

## 2. Qué NO cambia con V2+

| Artefacto | Estado bajo V2+ |
|---|---|
| **16 canonical_class_id** (`tomato__*`, `potato__*`, `corn__*`) | Intactos; `binding_rules` y delimiter `___` siguen vigentes |
| **Manifiestos v1 canónicos** (`docs/ai/manifests/*.yaml`) | Intactos; fuente de verdad de la fase v1, vigencia histórica |
| **RAW v1 congelado / CHECKSUMS.sha256** | No se re-hashea; se preserva tal cual |
| **Anti-fuga** (dedup SHA-256 + pHash, seed 42) | Misma metodología e integridad; aplica al corpus nuevo |
| **evaluation_policy** (macro_f1, ECE, curvas, calibración) | Idéntico; es política, no contenido |
| **Estructura `dataset_id/.../v1/`** | No se muta; V2+ vive en camino propio (`v1` vs `v1_plus`/`v2`, ver §5) |
| **Niveles 21.160 → 22.488** de recuperación | Histórico documentado; no se re-escribe el pasado |

---

## 3. Qué permanece congelado (no se toca nunca por V2+)

Decisión de gobernanza: **el bloque v1 queda congelado como "cota de laboratorio puro"**.

1. `data/datasets/agriculture_images_tomato-potato-corn/v1/**` completo: `RAW/`, `labels/labels_v1.csv`, `split_lists/*.csv`, `curated/{train,validation,test}/`, `CHECKSUMS.sha256`, `dataset_card.md`, `split_report.md`.
2. **Los 5 manifests v1 canónicos** (si V2+ requiere actualizar `expected_images`/`source_root`, se hace en **copias v2** — jamás en los v1).
3. **Benchmark v1** (4 arquitecturas + control MobileNetV2): internamente válido y comparable SOLO consigo mismo, como línea base "PlantVillage puro".
4. **Política anti-fuga** (dedup, pHash, seed 42) reutilizada idéntica en V2+.
5. **El Documento Canónico Dataset V2**: baseline oficial 22.488/16/3 permanece como definición inalterada.

---

## 4. Qué requiere nueva gobernanza

Puntos donde hoy NO existe regla escrita → se resuelven con dirección explícita (Bernardo):

| # | Tema | Pregunta/política necesaria |
|---|---|---|
| G1 | **Regla de versionado** | ¿Cuándo se abre V2+? Umbral de % imágenes nuevas, nuevas condiciones/especies, procedencia |
| G2 | **Manifiestos v2+** | Actualización SOLO en YAML v2 de `expected_images`, `source_root/subset_root`, `included_classes`, `expected_totals`; v1 intocable |
| G3 | **Taxonomía v2** | Política para nuevos `canonical_class_id` (species/conditions no presentes en PlantVillage) con `semantic_code` EIARC consistente, sin romper los 16 actuales |
| G4 | **Procedencia** | Atributos `validation_source`/`annotation_quality` para datos no-PlantVillage (p. ej. `field_collected`, `double_reviewed_field`) → política en label_schema |
| G5 | **Comparabilidad benchmark** | ¿Re-ejecución completa de las 4 modelos+control (comparable a v1) o solo incremento (NO comparable)? Sin esta decisión el impacto queda indefinido |
| G6 | **Convivencia curated/splits** | ¿Splits independientes v1 y v2+, o split combinado que invalida el v1 operativo (no recomendado, rompe §3)? |

---

## 5. Estrategia de convivencia: Dataset V2 + Dataset V2+

**Principio: V2+ es aditivo; V1 es el suelo. Nunca V2+ se monta encima de V1.**

```
Dataset V2 (Canónico, baseline oficial)          Dataset V2+ (Extensión aditiva)
─────────────────────────────────────────         ─────────────────────────────────────────
PlantVillage 22.488/16/3                         PlantVillage 22.488/16/3   (base, referenciada)
  RAW v1 (congelado)          ──────────────┐      + datos nuevos (procedencia definida en G4)
  labels_v1.csv (congelado)                  │          │
  split_v1 (seed 42, congelado)              │          ├── RAW v2+
  curated v1 (congelado)                     │          ├── labels v2+
  CHECKSUMS.sha256 (congelado)               ├─ ancla ──┼── split v2+ (re-aplica anti-fuga)
  manifests v1 (canónicos)                   │          ├── curated v2+
  benchmark v1 (línea base "lab puro")       │          └── manifests v2+ (G2)
─────────────────────────────────────────    │         ─────────────────────────────────────────
  POSTURA: NUNCA se muta.                    │         POSTURA: se construye como artefacto nuevo
  V1 permanece como cota de laboratorio.     └───────── comparabilidad según G5.
```

Reglas de convivencia:
1. **V2+ siempre deriva del dataset v1 como base** (las 22.488 imágenes de PlantVillage y sus labels mismas), más las imágenes adicionales.
2. **No existe "V2+ que reemplaza"**: los artefactos v1 siguen siendo la referencia de laboratorio puro.
3. **Comparación legítima** solo si se define en G5: re-ejecutar benchmarking con el mismo manifiesto de evaluación sobre el corpus combinado.
4. Cualquier dato nuevo que entre en V2+ **primero pasa por anti-fuga contra v1** (evitar que muestras casi idénticas contaminen la comparación).

---

## 6. Artefactos que dependen para su existencia

| Artefacto | Existencia | Depende de |
|---|---|---|
| Manifiestos v2+ | requiere G2 | decisión de versionado G1 |
| Taxonomía v2 | requiere G3 | definición de universo nuevo |
| labels v2+ | requiere G4 | política de procedencia |
| Split v2+ | requiere G2+G3+G6 | conteos veraces + anti-fuga |
| Benchmark v2+ | requiere G5 | decisión de comparabilidad |

**Cadena de construcción (primer artefacto técnico viable):** manifold actualizado de conteos reales (21160→22488, Septoria 1771) → `labels_v1.csv` regenerado → split → curated → benchmark. Sin el primer eslabón veraz nada posterior es confiable.

---

## 7. Clasificación y límites de este documento

- **NO CANÓNICO**: no tiene fuerza de gobierno sobre MASTERPLAN/EXECUTION_PLAN/DATASET_V2/MANIFESTS.
- **SOLO INVESTIGACIÓN / SOLO GOBERNANZA**: insumo de decisión para Bernardo; ninguna de sus propuestas se activa sin orden explícita.
- No modifica: MASTERPLAN · EXECUTION_PLAN · DATASET_V2 · MANIFESTS. Solo este archivo fue creado. No se realizan commits.

---

*Revisión formal de impacto de Dataset V2+ (extensión aditiva) sobre Dataset V2, manifests, split, benchmark y taxonomía. Postura: V1 congelado como baseline oficial; V2+ coexiste de forma aditiva; gobernanza pendiente en G1–G6 queda en manos de Bernardo.*