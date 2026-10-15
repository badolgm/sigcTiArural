# AI_R1_EXECUTION_REPORT

**Misión:** `AI_R1_EXECUTION` (materialización del artefacto M2)
**Base:** `AI_R1_ARTIFACT_IMPLEMENTATION_PLAN` + `AI_R1_EXECUTION_READINESS_REPORT` (`SAFE_TO_EXECUTE`)
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-14

---

## 0. Dictamen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   CLASIFICACIÓN:   AI_R1_EXECUTED                                             │
│                                                                               │
│   Ejecución realizada de forma segura. Controles C1–C7 cumplidos.            │
│   13/13 hashes verificados · artefacto materializado · gobernanza versionada.│
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Resumen:** 13 archivos copiados a `benchmark/runs/M2_efficientnet_b0/` (65 665 990 B); `CHECKSUMS.sha256` regenerado leyendo el destino (13/13 = origen); 3 documentos de gobernanza versionados creados; origen read-only intacto; sin commits, sin push; PROHIBIDO respetado (cero cambios en código, Docker, `ai_service`, frontend).

## 1. Materialización del artefacto (C1 · C3)

| Paso | Evidencia |
|---|---|
| Destino verificado ignorado **antes** | `git check-ignore -v benchmark/runs/M2_efficientnet_b0/checkpoints/best.pth` → `.gitignore:20` |
| Destino no existía antes | `Test-Path` = `False` |
| Copia | `Copy-Item $src\* $dst -Recurse -Force` |
| Conteo destino | **13 archivos · 65 665 990 B** ✅ |
| Destino verificado ignorado **después** | `.gitignore:20` ✅ |
| **C3** origen intacto | `origen archivos = 13` (sin borrar/mover) ✅ |

## 2. `CHECKSUMS.sha256` (C2)

- Recomputado **leyendo el destino**; formato `SHA256  ruta_relativa` (ASCII/LF); 13 líneas ordenadas.
- Archivo: `benchmark/runs/M2_efficientnet_b0/CHECKSUMS.sha256` (14.º archivo, ignorado).

| Verificación | Resultado |
|---|---|
| Origen = destino (hash por hash) | **13 coinciden · 0 discrepancias** ✅ |
| Relectura de `CHECKSUMS.sha256` contra disco | **13/13 ok · 0 bad** ✅ |
| Líneas con formato válido | **13/13** ✅ |

Hashest clave: `best.pth 3FDF86A7…BDFFABC3` · `last.pth 1996F105…65D9E221F4` · `validation_metrics.json DD13897C…E4CA64AA`.

## 3. Documentos de gobernanza creados (C5 · C7)

| # | Archivo | Contenido |
|---|---|---|
| 3 | `docs/ai/artifacts/M2_ARTIFACT_RECORD.md` | Ubicación · 13 hashes · **lineage** (§2b) · métricas · `class_index_map` · rollback |
| 4 | `docs/ai/artifacts/model_cards/M2_efficientnet_b0.model_card.md` | Model card completo (uso, datos, métricas, per-class, hashes, limitaciones) |
| 5 | `docs/ai/manifests/model_registry.agriculture_v2.yaml` | Índice de modelos (M1/M2/histórico) + `class_index_map` + roadmap |
| 6 | *(lineage)* | Cadena `dataset v1 → split v1 (seed 42) → notebook M2 → run M2_efficientnet_b0_001 → copia verificada` en `M2_ARTIFACT_RECORD.md §2b` |

- **C7:** la ruta (no versionada) del artefacto queda registrada en los documentos versionados; los binarios **no** entran a git (destino ignorado).
- Configuración de destino: `docs/ai/artifacts/` y `model_registry…yaml` **no ignorados** (se versionarán).

## 4. `class_index_map` (C5)

Verificado contra `curated/train` (orden `torchvision.ImageFolder`, alfabético), idéntico en `train`/`validation`/`test` (16/16/16). Publicado en el model card y en el registry:

| idx | clase | idx | clase |
|---|---|---|---|
| 0 | corn__cercospora_gray_leaf_spot | 8 | tomato__early_blight |
| 1 | corn__common_rust | 9 | tomato__healthy |
| 2 | corn__healthy | 10 | tomato__late_blight |
| 3 | corn__northern_leaf_blight | 11 | tomato__leaf_mold |
| 4 | potato__early_blight | 12 | tomato__mosaic_virus |
| 5 | potato__healthy | 13 | tomato__septoria_leaf_spot |
| 6 | potato__late_blight | 14 | tomato__target_spot |
| 7 | tomato__bacterial_spot | 15 | tomato__yellow_leaf_curl_virus |

## 4b. Convención de nombre (C4)

Adoptada: directorio **`benchmark/runs/M2_efficientnet_b0/`** (espeja el patrón `M1_mobilenetv2_001/`); el `run_id` interno (`config.json`) es **`M2_efficientnet_b0_001`**. Documentado en `M2_ARTIFACT_RECORD.md §1` y en el registry.

## 5. Validaciones

| Validación | Resultado |
|---|---|
| Todos los hashes (13) | ✅ 13/13 |
| YAML `model_registry.agriculture_v2.yaml` | ✅ parsea · 3 models · 16 classes |
| `benchmark/runs` en `git status` | ✅ ausente (ignorado) |
| Nuevos docs aparecen como `??` (untracked) | ✅ `docs/ai/artifacts/`, `.../model_registry.agriculture_v2.yaml` |

## 6. Seguridad / `.gitignore` (C1 · C6)

- `benchmark/runs/` (`.gitignore:20`) y `/data/` (`:68`) ignorados; `.git/info/exclude` solo `.local_backups/`.
- **No hay regla global `.pth`/`.onnx`** (hallazgo heredado): por eso el artefacto vive **solo** en `benchmark/runs/`. Nada fuera de esa ruta fue creado.
- **C6**: ningún `git add -A`; ningún commit. `git status` total = 41 líneas, todas del trabajo previo + 3 entradas nuevas de gobernanza.

## 7. Rollback

| Acción | Efecto |
|---|---|
| Borrar `benchmark/runs/M2_efficientnet_b0/` | Restaura estado previo; ignorado → **sin historia git** |
| Export externo | **Intacto** (read-only) → fuente última |
| Docs nuevos | Revertibles con `git checkout`/delete |
| Código/Docker/`ai_service`/frontend | **No tocados** → sin rollback funcional |

## 7b. Cumplimiento de reglas

| Control | Estado |
|---|---|
| C1 solo a `benchmark/runs/` | ✅ |
| C2 CHECKSUMS del destino, 13/13 | ✅ |
| C3 origen read-only | ✅ |
| C4 naming fijado | ✅ |
| C5 `class_index_map` publicado | ✅ |
| C6 sin `git add -A` / sin commits | ✅ |
| C7 ruta registrada en docs versionados | ✅ |

**PROHIBIDO respetado:** NO ONNX · NO export · NO `ai_service` · NO API v2 · NO frontend · NO Docker · NO OCI · NO Memory · sin commits · sin push.

## 7c. Límites honestos

- El artefacto **no está servido** ni promovido (gate `M1_BASELINE_M2_CHALLENGER` intacto; servir ≠ promover).
- `holdout` sigue vacío → sin validez de dominio (AI-R5).
- `metrics.csv` conserva 53 filas (epochs duplicados) — anomalía registrada, no corregida.
- M1 permanece `EVIDENCE_ONLY` (pesos no recuperados).
- ONNX y `ai_service` neutral **no** se tocaron (AI-R2+).

## 8. Clasificación

```
CLASIFICACIÓN: AI_R1_EXECUTED
Controles C1–C7 cumplidos · PROHIBIDO respetado · 13/13 hashes verificados.
```

---

**Entregables:** `benchmark/runs/M2_efficientnet_b0/**` (13+1, ignorado) · `docs/ai/artifacts/M2_ARTIFACT_RECORD.md` · `docs/ai/artifacts/model_cards/M2_efficientnet_b0.model_card.md` · `docs/ai/manifests/model_registry.agriculture_v2.yaml`.

**Referencias:** `docs/AI_R1_ARTIFACT_IMPLEMENTATION_PLAN.md` · `docs/AI_R1_EXECUTION_READINESS_REPORT.md` · `docs/M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md` · `docs/M1_M2_GOVERNANCE_CLOSURE_REPORT.md` · `docs/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md`.
