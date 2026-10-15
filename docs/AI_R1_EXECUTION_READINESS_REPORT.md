# AI_R1_EXECUTION_READINESS_REPORT

**Misión:** `AI_R1_EXECUTION_READINESS` (validar el plan `AI_R1_ARTIFACT_IMPLEMENTATION_PLAN` antes de ejecutar)
**Naturaleza:** SOLO validación read-only. **NO implementa · NO copia artefactos · NO ONNX · NO commits · NO push.**
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-14

---

## 0. Dictamen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   CLASIFICACIÓN:   SAFE_TO_EXECUTE                                            │
│                                                                               │
│   · 13/13 artefactos presentes y SHA-256 recomputados = informe forense.      │
│   · class_index_map VERIFICADO hoy (16 clases, orden ImageFolder).            │
│   · Destino benchmark/runs/ confirmado ignorado (pesos fuera de git).         │
│   · Docs de gobernanza (docs/ai/artifacts, manifests) confirmados tracked.    │
│   · Disco 14,0 GB libres (copia ≈65,7 MB).                                    │
│                                                                               │
│   Condiciones de ejecución: ver §9. No cambian el veredicto.                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Regla del veredicto:** el plan es seguro **tal como está redactado** (destino ignorado, binarios fuera de git, fuentes read-only, rollback trivial). Las condiciones §9 son controles operativos, no bloqueadores.

## 0.1 Verificación ejecutada (read-only, hoy)

| Verificación | Comando/Evidencia | Resultado |
|---|---|---|
| Artefactos origen | `Get-ChildItem` sobre el export externo | **13 archivos · 65 665 990 B** ✅ |
| SHA-256 reales | `Get-FileHash -Algorithm SHA256` (13) | **coinciden** con el informe forense ✅ |
| Destino ignorado | `git check-ignore -v benchmark/runs/M2_.../best.pth` | `benchmark/runs/` (`.gitignore:20`) ✅ |
| Docs versionables | `git check-ignore -v docs/ai/artifacts/...` | **no ignorados** → se versionarán ✅ |
| Manifiestos tracked | `git ls-files docs/ai/manifests` | **tracked** ✅ |
| Colisión destino | `Get-ChildItem benchmark\runs` | solo `M1_mobilenetv2_001` (dirs vacíos) ✅ |
| Ignore global pesos | `.gitignore` | **NO** hay regla `.pth`/`.onnx`/`.h5` ⚠️ (§7) |
| exclude local | `.git/info/exclude` | solo `.local_backups/` ✅ |
| Espacio disco | `Get-PSDrive C` | **14,0 GB** libres ✅ |
| Clases | `curated/train/\*` (16 dirs) | train=val=test = **16/16/16** ✅ |
| Holdout | `holdout/real_world_holdout_v1` | **vacío** (0 muestras) — afecta AI-R5, no AI-R1 ℹ️ |

---

## 1. Q1 — Riesgos restantes

Riesgos que **persisten** tras la verificación (heredados del plan + nuevos):

| ID | Riesgo | Sev. | Estado tras validación |
|---|---|---|---|
| R-EXEC-1 | Ejecutor haga `git add -A` y comitee binarios por error | 🔴 | Mitigable: `benchmark/runs/` ignorado; verificación post-copia `git status` |
| R-EJEC-2 | Copia parcial/corrupta | Alta | Mitigado: re-verificar SHA-256 **tras** la copia (§3) |
| R-EJEC-3 | Ubicación incorrecta fuera de `benchmark/runs/` | 🔴 | Sin ignore global `.pth` → disciplina estricta |
| R-EJEC-4 | Transcripción errónea del `class_index_map` | Alta | Verificado el orden (§2); el riesgo residual es **copiarlo mal** |
| R-EJEC-5 | Naming `M2_efficientnet_b0` vs `run_id M2_efficientnet_b0_001` | Baja | Inconsistencia cosmética; fijar una convención |
| R-EJEC-6 | `model_registry` sin esquema precedente | Media | Inventar formato; alinear a manifiestos existentes (§5) |
| R-EJEC-7 | Precedencia M1 (baseline) sin artefacto | Media | Fuera de AI-R1; M1 = evidencia (`M1_PARTIAL`) |
| R-EJEC-8 | `holdout` vacío (0 muestras) | Media | No bloquea AI-R1; bloquea AI-R5 |
| R-EJEC-9 | Origen externo modificado/borrado | Baja | Origen read-only; NADA DESAPARECE |
| R-EJEC-10 | D-serve abierta (artefacto servible ≠ promoción) | Media | Restatar servir ≠ promover; gate intacto |

## 2. Q2 — Verificación de `class_index_map`

**Método:** el notebook M2 carga con `tvd.ImageFolder(DATA_ROOT + "/train")`; torchvision asigna índices por **`sorted(os.listdir)`**. Se enumeró `curated/train` ordenado alfabéticamente (16 dirs).

> ⚠️ Este orden es de `curated/train`. `curated/validation` y `curated/test` tienen **las mismas 16 clases**; `ImageFolder` las ordena idénticamente.

**`class_index_map` VERIFICADO (autoridad = orden ImageFolder):**

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

**Hallazgos:**
- ✅ 16 clases · 3 especies (corn 4 · potato 3 · tomato 9) — coincide con `dataset_card.md`.
- ✅ `class_to_idx` es determinista (no aleatorio) → reproducible.
- ⚠️ **NO está en `validation_metrics.json`** (solo la matriz 16×16). El mapa debe **publicarse** en el model card (riesgo de transposición).
- ⚠️ El orden es **≠** el de las filas de `labels_v1.csv` (agrupadas por `sample_id`). Confundirlos = predicciones mal etiquetadas.
- ➖ Residual: no se puede confirmar contra un artefacto guardado (el notebook no persiste `class_to_idx`); verificado por reconstrucción. Sev. residual **Alta** si se transcribe mal.

## 3. Q3 — Riesgos de hashes

**Verificación real (13/13 recomputados hoy, coinciden con `M2_ARTIFACT_FORENSIC_VALIDATION_REPORT`):**

| Archivo | SHA-256 (prefijo…sufijo) | Match |
|---|---|---|
| `checkpoints/best.pth` | `3FDF86A7…BDFFABC3` | ✅ |
| `checkpoints/last.pth` | `1996F105…65D9E221F4` | ✅ |
| `config.json` | `4E04643F…F80F80D` | ✅ |
| `metrics.csv` | `0CF9C046…65A882F6` | ✅ |
| `report/validation_metrics.json` | `DD13897C…E4CA64AA` | ✅ |
| `report/M2_VS_M1.json` | `88037503…0E3EC8A6A9` | ✅ |
| 6× `plots/*.png` + `report/M2_VS_M1.md` | (hashes completos en CHECKSUMS a generar) | ✅ |

**Riesgos:**
1. **Drift por re-ejecución** ⚠️: si se re-copia tras un re-run del notebook, `best.pth`/`last.pth` cambian → el `CHECKSUMS.sha256` debe regenerarse **leyendo el destino**, no heredarse.
2. **Método de hashing** ⚠️: fijar **SHA-256**, `-Algorithm SHA256`, y formato `HASH  ruta_relativa` (compatible con el `CHECKSUMS.sha256` del dataset). No mezclar hashing de directorio (ZIP) con hashing de archivo.
3. **Encoding/line endings** ➖: `CHECKSUMS.sha256` debe ser ASCII/LF; evitar CRLF para reproducibilidad en Linux/Docker.
4. **Colisión de nombre**: `last.pth` (16,4 MB) es **solo pesos** (no full checkpoint) → no confundir con `best.pth` (full, 48,8 MB) al hashear.
5. ➖ Sin riesgo de colisión criptográfica (SHA-256).

**Veredicto:** hashes **estables y verificados**; el único riesgo real es **regenerar vs heredar** tras la copia. Mitigación en §9-C2.

## 4. Q4 — Riesgos de `model_card`

- ⚠️ **No existe `model_cards/`** en el repo (confirmado) → no hay plantilla canónica; se inventa estructura (§6b del plan). Riesgo: formato inconsistente con futuros modelos.
- ⚠️ **Corrección de rendimiento**: M1 ECE `0.0313` < M2 ECE `0.0332`; el card **no** debe declarar superioridad absoluta de M2 (macro-F1/F1 sí mejoran). Honestidad obligatoria.
- ⚠️ **`class_index_map`**: debe incluirse íntegro y correcto (§2).
- ⚠️ **Preprocesado**: replicar el transform exacto (ImageNet mean/std); el card es la fuente que AI-R2 usará → un error se propaga a ONNX.
- ⚠️ **Estado `challenger` + test no ejecutado** deben declararse (no sobrevender).
- ➖ Menor: enlazar hashes concretos; no describir rutas absolutas locales (portabilidad).

## 5. Q5 — Riesgos de `model_registry`

- ⚠️ **Sin esquema precedente** para modelos; los 8 manifiestos existentes son de **dataset**. Riesgo de crear un formato huérfano.
- **Mitigación de diseño:** modelar como **manifiesto más**: `schema_version`, `manifest_id`, `registry_id`, `generated_at`, `models:[{id, role, framework, artifact_path, artifact_sha256, metrics_ref, status, gate}]`. Alinear `taxonomy_version`/`dataset_version` a los manifiestos existentes.
- ⚠️ **Doble fuente de verdad**: el registry **referencia** al artefacto por hash; no incrustar métricas como verdad (solo `metrics_ref`).
- ⚠️ **Ubicación**: debe vivir en `docs/ai/manifests/` (tracked, confirmado). No en `data/` (ignorado).
- ➖ Riesgo de naming colisión con `baseline_experiment_manifest...` (ambos describen modelos); documentar la distinción (experimento vs registro de artefacto).
- ➖ Bajo impacto: archivo nuevo, reversible.

## 5. Q5b — Riesgos de `docs/ai/artifacts/*` (registro)

- ✅ `docs/ai/artifacts/` **no existe** aún, pero su ruta **NO está ignorada** (`git check-ignore` sin salida) → los `.md` nuevos **se versionarán** (deseado).
- ⚠️ `docs/ai/` ya contiene `manifests/` + `research_v2/` + `debug-ai-model-loader.md`; verificar que un `artifacts/` nuevo no colisione conceptualmente con `research_v2/`.

## 6. Q6 — Riesgos de `benchmark/runs`

- ✅ **Ignorado** (`.gitignore:20`) → los pesos **nunca** entran a git por esa ruta.
- ✅ `benchmark/runs/M1_mobilenetv2_001/{checkpoints,plots,report}` existe (dirs vacíos) → **patrón confirmado**; `M2_efficientnet_b0` lo espeja.
- ⚠️ **No hay `.gitkeep`**: los dirs vacíos de M1 existen porque fueron creados manualmente; si AI-R1 crea `M2_efficientnet_b0/` y git lo ignora, **no aparecerá** en el árbol (esperado para pesos, pero la *existencia* del destino no queda en git → registrar la ruta en el model card/registry).
- ⚠️ **Convención de nombre**: M1 usa `M1_mobilenetv2_001` (con `_001`); el plan propone `M2_efficientnet_b0` (sin `_001`, run id `..._001`). **Decidir una** y documentarla; la inconsistencia es cosmética pero afecta futuros scripts.
- ⚠️ Un futuro `load_latest_model()`/script que escanee `benchmark/runs/**/*.pth` podría confundir M1 (ausente) con M2; documentar que `runs/` es de runs, no de serving.
- ➖ Espacio: copia 65,7 MB sobre 14,0 GB libres → sin riesgo.

## 7. Q7 — Riesgos de `.gitignore`

- ✅ `benchmark/runs/` ignorado · `/data/` ignorado · `.git/info/exclude` solo `.local_backups/`.
- 🔴 **Hallazgo crítico:** **NO existe regla global** para `.pth`/`.pt`/`.onnx`/`.h5`/`.keras`. Confirmado: `git check-ignore tmp/best.pth` y `model.onnx` → **sin salida** (NO ignorados → serían comiteables).
- **Consecuencia:** AI-R1 es seguro **solo** porque el destino elegido (`benchmark/runs/`) ya está ignorado. Cualquier `.pth`/`.onnx` fuera de `benchmark/runs/` (p.ej. el ONNX de AI-R2 en `src/ai_models/`) **quedaría comiteable**.
- ➖ Recomendación (NO en AI-R1, proponer para AI-R2): evaluar una regla defensiva `*.pth`/`*.onnx` **con** allowlist de los artefactos canónicos que sí deban versionarse (si alguno).

## 8. Q8 — Riesgos de rollback

- ✅ **Materialización reversible**: borrar `benchmark/runs/M2_efficientnet_b0/` restaura el estado; el dir está ignorado → **sin historia git**.
- ✅ **Origen read-only intacto**: el export externo permanece → rollback último garantizado.
- ✅ **Docs reversibles** por `git checkout` (texto versionado).
- ✅ **Sin rollback funcional**: AI-R1 no toca código/Docker/`ai_service`.
- ⚠️ Riesgo residual: si AI-R1 **borrara** el origen (prohibido) el rollback perdería la única copia. Control: §9-C3.
- ➖ Rendimiento nulo: no consume servicios.

---

## 9. Condiciones de ejecución (controles, no bloqueadores)

| ID | Control |
|---|---|
| **C1** | Copiar **solo** a `benchmark/runs/M2_efficientnet_b0/`; verificar `git check-ignore` del destino antes y después. |
| **C2** | Regenerar `CHECKSUMS.sha256` **leyendo el destino**; re-verificar 13/13 SHA-256 vs §3; ASCII/LF. |
| **C3** | Origen externo **read-only** (no borrar, no mover). |
| **C4** | Fijar convención de nombre (`M2_efficientnet_b0[_001]`) y documentarla. |
| **C5** | Publicar el `class_index_map` verificado (§2) en el model card y en el registry. |
| **C6** | **Prohibido** `git add -A`; revisar `git status` antes de cualquier commit (que no ocurre en AI-R1). |
| **C7** | Registrar la ruta del artefacto (no versionada) dentro de los docs versionados. |

## 10. Clasificación

```
CLASIFICACIÓN: SAFE_TO_EXECUTE
Condiciones §9 (operativas) · ningún bloqueador técnico.
Riesgos residuales máximos: ubicación fuera de runs/ (R-EJEC-3) y transcripción de
class_index_map (R-EJEC-4) — ambos controlados por C1/C5.
```

---

**NO implementado · NO copiado · NO exportado (ONNX) · sin commits · sin push.**

**Referencias:** `docs/AI_R1_ARTIFACT_IMPLEMENTATION_PLAN.md` · `docs/M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md` · `docs/AI_CANON_IMPLEMENTATION_DECISION_REPORT.md` · `.gitignore:20,68` · `data/datasets/agriculture_images_tomato-potato-corn/v1/{curated,split_lists,holdout,dataset_card.md}` · `docs/ai/manifests/` · `benchmark/runs/` · `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb`.
