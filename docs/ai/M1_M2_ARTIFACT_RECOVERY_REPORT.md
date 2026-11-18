# Informe de Recuperación de Artefactos M1 / M2

**Documento:** `M1_M2_ARTIFACT_RECOVERY_REPORT`
**Misión:** `M1_M2_ARTIFACT_RECOVERY_AUDIT` (auditoría de solo lectura)
**Fecha:** 2026-10-14
**Alcance:** localizar los artefactos reales producidos por los runs **M1 (MobileNetV2)** y **M2 (EfficientNet-B0)** y determinar qué es recuperable.
**Reglas respetadas:** sin entrenamiento · sin exportación a ONNX · sin modificar código · sin commits · sin push. NADA DESAPARECE.

---

## 1. Veredicto (clasificación)

> ## `ARTIFACTS_PARTIAL`

- **NO existen en disco local** los artefactos canónicos de modelo: `best.pth`, `last.pth`, `metrics.csv`, `validation_metrics.json`, `model_card.md`, `.onnx`.
- **SÍ existen registros** de ambos runs: métricas declaradas en documentación versionada, salidas gráficas embebidas en los notebooks y *scaffolds* de directorios vacíos.
- **M2** apunta a **Google Drive** (`MyDrive/SIGCTiArural/runs/M2_efficientnet_b0/`); Google Drive **no está montado** en esta máquina ⇒ existencia **UNVERIFIED**.
- **M1** apunta a `/content/M1_mobilenetv2_001` (**efímero**). Sin celda de copia a Drive ejecutada ⇒ **presuntamente perdido**.
- Si la recuperación desde Google Drive falla, degrada a **`ARTIFACTS_MISSING`**.

---

## 2. Búsqueda realizada (dónde se buscó)

| Zona | Búsqueda | Resultado |
|---|---|---|
| Repo (sin `.venv`/`node_modules`) | `*.pth/*.pt/*.onnx/*.h5/*.keras/validation_metrics.json/model_card.md` | solo `plant_disease_mbv2.h5` (HISTÓRICO) |
| `benchmark/runs` | recursivo | **0 archivos** (solo dirs vacíos) |
| `C:\Users\BagmDev\AppData\Local\Temp\m2_smoke` | recursivo | scaffold smoke test: dataset sintético mínimo + `runs/M2_efficientnet_b0/{checkpoints,plots,report}` **vacíos** |
| `Documents` / `Desktop` / `Downloads` | `*.pth/*.onnx/*.keras/validation_metrics.json/model_card.md` (depth 5) | sin resultados |
| `OneDrive` / `OneDrive - SENA` / `OneDrive - VIEW FOUNDATION` | artefactos + `SIGCT|M1|M2|Colab|.pth|.onnx` | solo documentos (`.docx`, PDF de notebooks); ningún peso |
| Perfil | carpetas `My Drive` / `GoogleDrive` | **ninguna** ⇒ Drive no sincronizado |
| `LOCALAPPDATA\Google\DriveFS` · `Program Files\Google\Drive File Stream` | existencia | **no instalado** |
| Git (`--all`, objetos) | `*.pth/*.pt/*.onnx/*.h5/*.keras/*efficientnet*/*mobilenetv2*/validation_metrics/model_card` | **único** artefacto jamás versionado: `plant_disease_mbv2.h5` |

---

## 3. A — ¿Qué artefactos existen realmente?

| Artefacto | ¿Existe localmente? | Ubicación / evidencia |
|---|---|---|
| `plant_disease_mbv2.h5` (HISTÓRICO, no M1/M2) | ✅ SÍ | `src/ai_models/production_models/plant_disease_mbv2.h5` (9 431 432 B) |
| Scaffold `benchmark/runs/M1_mobilenetv2_001/` | ✅ (dirs vacíos) | `checkpoints/`, `plots/`, `report/` — **0 archivos** |
| Scaffold `…\Temp\m2_smoke\runs\M2_efficientnet_b0/` | ✅ (dirs vacíos) | `checkpoints/`, `plots/`, `report/` — **0 archivos** |
| Métricas M1 (macro-F1 0.9899 · ECE 0.0313) | ✅ documentadas | `Documentacion/IA/Benchmark_M1_MobileNetV2/EVIDENCIA_EJECUCION_M1.md` |
| Métricas M2 (macro-F1 0.9937 · ECE 0.0332) | ✅ documentadas | reportes CMSC |
| Figuras M1 | ✅ solo embebidas | salidas base64 en `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb` |
| `best.pth` / `last.pth` / JSON / `model_card` / `.onnx` | ❌ NO | no presentes |

## 3. B — ¿Qué falta?

- **M1:** `best.pth`, `last.pth`, `metrics.csv`, `validation_metrics.json`, `model_card.md`, PNG como archivo.
- **M2:** `best.pth`, `last.pth`, `metrics.csv`, `validation_metrics.json`, `model_card.md` (PNG/JSON presuntos en Drive).
- **Ambos:** cualquier `.onnx` (coherente con `R5_NOT_READY`).

## 3. C — ¿Están en Google Drive?

- **M2:** `OUT = /content/drive/MyDrive/SIGCTiArural/runs/M2_efficientnet_b0`; celda ejecutada imprime `Guardado: …/report/validation_metrics.json`. El run **escribió a Drive** ⇒ los artefactos **probablemente existen en la nube**.
- **M1:** `OUT = /content/M1_mobilenetv2_001` (**efímero**); `EVIDENCIA_EJECUCION_M1.md` §3 lo marca **"pendiente"**. ⇒ presuntamente perdido.
- **Bloqueo:** Drive for Desktop no instalado / sin carpeta `My Drive` ⇒ **UNVERIFIED** desde esta máquina. Solo Bernardo puede confirmarlo (Colab/nube).

## 3. D — ¿Están en Git?

**No.** `git log --all` y todos los objetos: único artefacto versionado = `plant_disease_mbv2.h5` (commit `f773212`, 2026-01-18) — modelo **histórico**, **no** M1/M2. `benchmark/runs/` está **gitignored**. No hay `.pth`/`.onnx`/`validation_metrics.json`/`model_card.md` en ninguna rama.

## 3. E — ¿Qué es recuperable?

| Artefacto | Origen de recuperación | Estado |
|---|---|---|
| Métricas M1 | `Documentacion/IA/Benchmark_M1_MobileNetV2/EVIDENCIA_EJECUCION_M1.md` | ✅ ya |
| Figuras M1 | salidas embebidas en el `.ipynb` M1 | ⚠️ solo como imágenes |
| Métricas M2 | reportes CMSC + notebook | ✅ ya |
| `validation_metrics.json` M2 | `MyDrive/SIGCTiArural/runs/M2_efficientnet_b0/report/` | ⚠️ presunto en Drive — UNVERIFIED |
| `best.pth`/`last.pth` M2 | `MyDrive/SIGCTiArural/runs/M2_efficientnet_b0/checkpoints/` | ⚠️ presunto en Drive — UNVERIFIED |
| `best.pth`/`last.pth` M1 | `/content/M1_mobilenetv2_001` (efímero) | ❌ presuntamente perdido |

**Protocolo (solo Bernardo, misión aparte):** abrir Colab, montar Drive y verificar/descargar `MyDrive/SIGCTiArural/runs/{M1_mobilenetv2_001,M2_efficientnet_b0}`. El repo versiona la *dirección* del contrato, nunca una copia.

---

## 4. Rutas canónicas declaradas por los notebooks

| Run | Salida del notebook | Naturaleza |
|---|---|---|
| M1 | `/content/M1_mobilenetv2_001` (doc §3 propone copiar a `MyDrive/SIGCTiArural/runs/M1_mobilenetv2_001`) | **efímero** |
| M2 | `/content/drive/MyDrive/SIGCTiArural/runs/M2_efficientnet_b0` (`checkpoints/`, `report/`, `plots/`) | **persistente en Drive** |

Dataset (ambos): `/content/drive/MyDrive/SIGCTiArural/datasets/v1/curated` (22 488 imgs · 16 clases · seed 42).

---

## 5. Consecuencias (honestidad de estado)

1. **R5 sigue bloqueado:** sin pesos M1/M2 en disco no hay cadena ONNX ⇒ `R5_NOT_READY` (P1 abierto) se confirma.
2. **Gate G-1 (promoción M1/M2) permanece PENDIENTE** y **no verificable**: no hay artefactos para recomputar paridad ni calibración.
3. **`plant_disease_mbv2.h5` NO sustituye a M1/M2:** es histórico y está declarado degenerado (doble normalización, `fastapi_app.py:192`).
4. **NADA DESAPARECE:** los *scaffolds* vacíos (`benchmark/runs/…`, `Temp\m2_smoke/…`) se conservan como registro honesto; no se eliminan.

## 6. Recomendación

- Mantener el dictamen **`ARTIFACTS_PARTIAL`** hasta confirmar Google Drive.
- Solicitar a **Bernardo** una misión explícita de **verificación + descarga desde Google Drive** de `runs/M1_mobilenetv2_001` y `runs/M2_efficientnet_b0` (solo lectura de la nube, sin tocar código).
- Si Drive no conserva M1, registrar **M1 `LOST`** y evaluar re-ejecución (requiere misión explícita; hoy **prohibido entrenar**).
- No promover ningún cambio de estado M1/M2 ni de R5 sin los artefactos reales presentes y verificados.
