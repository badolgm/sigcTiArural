# AI-R3 Execution Readiness Report

**mission:** `AI_R3_EXECUTION_READINESS` · **date:** 2026-10-14
**base:** `AI_R3_ONNXRUNTIME_SERVING_PLAN` · `AI_R2_EXECUTION_REPORT` (`AI_R2_COMPLETE`) · `AI_R4_SEMANTIC_CONTRACT_PLAN`
**objetivo:** verificar que AI-R3 puede ejecutarse sin riesgo. **Solo readiness.**
**estado:** **`NOT_SAFE_TO_EXECUTE` (en aislamiento)** — con dos vías explícitas para convertirlo en `SAFE_TO_EXECUTE` (§9)

> **NO se cambió código · NO se ejecutó AI-R3 · NO commits · NO push.** Todo lo aquí consignado es verificación de solo lectura sobre el estado real.

---

## 0. Veredicto

Los **artefactos técnicos están completos y verificados** (ONNX íntegro, Docker sano, rollback trivial, ruta del modelo confirmada). **Sin embargo, activar M2 en el servicio vivo degrada la semántica de la UI** mientras no exista AI-R4:

El resolver del backend sigue **binario** (`0=enferma`, `1=sana`). Con M2, el índice **1 = `corn__common_rust` (enfermedad)** se interpretaría como **"sana"** → **mislabel en producción**. Por eso la ejecución **aislada** no es segura; sí lo es si el ONNX queda **dormido** (default `.h5`) o si **AI-R3 + AI-R4** se despliegan juntos.

---

## 1. Riesgos restantes

| ID | Riesgo | Evidencia | Sev | Estado |
|---|---|---|---|---|
| **R-EXEC-1** | **Regresión semántica en vivo**: resolver binario vs 16 clases → `class_1` (corn rust) se muestra "sana" | `semantic_prediction_resolver.py` `CLASS_DEFINITIONS {0:enferma,1:sana}`; servicio **healthy y consumido** | 🔴 | **Abierto** — lo cierra AI-R4 |
| **R-EXEC-2** | Rebuild de imagen: `requirements.txt` cambia ⇒ capa `pip install` se invalida ⇒ re-descarga TF (~600 MB+) | imagen actual **3.97 GB**; disco libre **13 GB** | 🟠 | Mitigable (disco basta; ver §5) |
| **R-EXEC-3** | `onnxruntime` ausente en el contenedor y en el repo | `ModuleNotFoundError: onnxruntime` dentro del contenedor | 🟠 | Se resuelve con el pin (parte de AI-R3) |
| **R-EXEC-4** | Convivencia `.h5` + `.onnx` en `/app/production_models` ⇒ selección por `mtime` elige el `.h5` (más nuevo/antiguo impredecible) | `load_latest_model()` usa `max(mtime)` | 🟡 | Exige selección **explícita** (`AI_BACKEND`), no `mtime` |
| **R-EXEC-5** | Diferencia de preprocesado (`.h5` sin normalizar vs M2 ImageNet) | `preprocess_image()` resize(224) sin normalizar | 🟠 | Rama por backend (ya en plan R3) |
| **R-EXEC-6** | Logits sin softmax → `confidence` mal | ONNX devuelve `logits` | 🟡 | Aplicar `softmax` (ya en plan R3) |
| **R-EXEC-7** | Healthcheck de compose depende de `/health == 200` | `test: urlopen('/health').status==200` | 🟢 | Mantener campos y status (aditivo) |
| **R-EXEC-8** | Proyecto compose no listado por nombre esperado | `docker compose ls` muestra `docker` (EIARC) y `servsoftbagm`, no el de SIGCT | 🟡 | Verificar `-f <ruta> -p <proyecto>` al reconstruir |

---

## 2. Dependencias

| Dependencia | Estado verificado |
|---|---|
| AI-R2 (ONNX) | ✅ `AI_R2_COMPLETE`; artefacto presente |
| `model.onnx` | ✅ presente, hash verificado (§3) |
| `onnxruntime` | ❌ **ausente** (repo y contenedor) → dependencia a añadir |
| Docker daemon | ✅ `Server.Version` 2.x; `sigctiarural_ai_service` **Up (healthy)** 8081 |
| Disco | ✅ **13 GB** libres (margen suficiente pero no holgado) |
| Ruta del modelo en compose | ✅ `./benchmark/runs/M2_efficientnet_b0/exports/model.onnx` existe |
| AI-R4 | ⚠️ **no requerido para ejecutar R3**, pero **requerido para que el resultado sea correcto** (R-EXEC-1) |

---

## 3. Verificación de ONNX

| Check | Resultado |
|---|---|
| Ruta | `benchmark/runs/M2_efficientnet_b0/exports/model.onnx` ✅ |
| Tamaño | **16 102 181 B** ✅ (coincide con AI-R2) |
| SHA-256 | `4BD657B363407D4012F013589A5469DCA57B9C5E347A9EA54E1F6E57A3274EC3` ✅ **coincide** con AI-R2 |
| `onnx.checker` / IR | OK (AI-R2: opset 17, IR 8, 239 nodos) ✅ |
| Contrato | `input` f32 `[N,3,224,224]` → `logits` f32 `[N,16]`, batch dinámico ✅ |
| Paridad | G-NEW-A PASS · `Δmacro_f1` 0.0 (AI-R2) ✅ |
| Artefactos vecinos | `CHECKSUMS.sha256` 329 B · `export_record.json` · `golden_set.json` (46 660 B) · `parity_report.json` ✅ |

**Veredicto ONNX:** íntegro y apto. **Sin hallazgos.**

---

## 4. Verificación de `ai_service`

| Check | Resultado |
|---|---|
| Contenedor | `sigctiarural_ai_service` **Up ~1 h (healthy)** · `0.0.0.0:8081->8081` ✅ |
| Python | **3.11.17** ✅ |
| TensorFlow | **2.21.0** instalado (serving `.h5` actual) |
| onnxruntime | ❌ **ausente** (`ModuleNotFoundError`) |
| `ROOT_DIR` en contenedor | **`/app`** (verificado por ejecución de `find_repo_root`) |
| `MODELS_DIR` en contenedor | **`/app/production_models`** (contiene `plant_disease_mbv2.h5`, 9.2 MB; sin `.onnx`) |
| `load_latest_model()` | glob `*.h5`/`*.keras` por **`mtime`**; **no contempla `*.onnx`** |
| `preprocess_image()` | `resize((224,224))` **sin normalizar** (asume Rescaling interno del `.h5`) |
| `/infer` | devuelve `diagnosis="class_{idx}"`, `class_index`, `confidence`, `model`, `processing_time`, `status` |
| `/health` | `status`, `tensorflow`, `voice`, `model_loaded`; **sin** `model_contract_version` |
| Consumo vivo | Frontend `/api/v3/ai/inference/` (AIPredictiva) + **CMSC** ModelPredictCell |

**Veredicto `ai_service`:** apto para el cambio (5 puntos del plan R3), pero **el servicio está VIVO y consumido** → cualquier activación de M2 surte efecto inmediato (origen de R-EXEC-1).

---

## 5. Verificación de Docker

| Check | Resultado |
|---|---|
| Build context | `./src/ai_models` ✅ |
| `.dockerignore` | `venv/ __pycache__/ *.pyc .pytest_cache/ .env` (no excluye `production_models`) |
| `COPY . .` | hornea `production_models/*.h5` (9.2 MB) — **no** el `.onnx` (fuera del contexto) |
| Puerto | `8081` ✅ |
| Healthcheck | `python -c "urllib.../health ==200"` · 10s/5s/5/20s ✅ |
| Imagen actual | `sigctiarural-ai_service:latest` = **3.97 GB** · id `sha256:54bbaf867683…` · creada **2026-10-14T17:09Z** |
| Disco | **13 GB** libres |

**Veredicto Docker:** compatible. **R-EXEC-2** (rebuild re-descarga TF) es el punto operativo a vigilar; **no bloquea**.

---

## 6. Verificación de volumes

- **Ruta propuesta (relativa al compose, raíz del repo):**
  `./benchmark/runs/M2_efficientnet_b0/exports/model.onnx` → **confirmada existente** ✅.
- **Destino en contenedor:** `/app/production_models/model.onnx` (`MODELS_DIR` confirmado = `/app/production_models`).
- **Modo read-only** (`:ro`) → coherente con **G-NEW-C** (no horneado) y con `AI_SERVING_ONNX`.
- **Conflicto detectado (R-EXEC-4):** al montar el `.onnx` junto al `.h5` en el mismo directorio, el `mtime` no decide correctamente → **hace falta `AI_BACKEND`/`AI_MODEL_PATH` explícito.**
- **Sin volúmenes nombrados en conflicto** (el `ai_service` no declara `volumes` hoy; la adición es aditiva).
- En Windows/host: bind mount de un archivo individual es válido; verificar que el archivo exista antes de `up`.

**Veredicto volumes:** viable. Requiere selección explícita de backend.

---

## 7. Verificación de rollback

| Nivel | Mecanismo | Verificado |
|---|---|---|
| Runtime | `AI_BACKEND=tf` (dormir ONNX) — requiere que el plan R3 lo implemente | ✅ disponible por diseño |
| Modelo | Retirar el bind mount `model.onnx` del compose + `docker compose up -d ai_service` | ✅ |
| Imagen | Imagen previa preservada: `sigctiarural-ai_service:latest` id `54bbaf867683` (creada hoy) | ✅ — **etiquetar antes del rebuild** para garantizar el retorno |
| Código | `git revert` del bloque R3 (`fastapi_app.py`/`requirements.txt`) | ✅ (sin commits aún; árbol controlado) |
| Datos | **Sin migraciones.** El `.h5` **no se elimina** (`NADA DESAPARECE`) | ✅ |

**Veredicto rollback:** viable y de bajo coste. **Recomendación:** `docker tag sigctiarural-ai_service:latest sigctiarural-ai_service:pre-air3` **antes** del rebuild.

---

## 7.1 Estado git (para el rollback de código)
`benchmark/runs/` está **gitignored** (el `.onnx` no entra a git). El `.h5` sigue **tracked**. Sin cambios de código en esta misión.

---

## 8. Compatibilidad con AI-R4

| Punto de acople | Estado | Nota |
|---|---|---|
| `model_contract_version` en `/health` y `trace` | Diseñado en R3 | **Necesario** para que el resolver (AI-R4) detecte binario vs 16 |
| Detección de modo en el resolver | Diseñado en R4 (`model_contract_version`) | Cierra R-EXEC-1 |
| `get_class_definitions()` | Punto de extensión ya previsto en el código | AI-R4 lo sustituye |
| Frontend builders | Centralizados; exportados a CMSC (aditivo) | R3 no los toca |
| Coexistencia `.h5` (binario) | Permitida; el resolver debe tolerar ambos modos | Requisito conjunto R3+R4 |
| Frontend `AIPredictiva.jsx` | Sin cambios en R3 | Cambios son de R4 |

**Veredicto:** la **compatibilidad técnica R3→R4 es correcta**, pero **R3 sin R4 deja un estado de mislabel** (R-EXEC-1). Es el único hallazgo de fondo.

---

## 8.1 Contrato operativo de activación (propuesto)
1. `AI_BACKEND=tf` + volumen montado ⇒ **ONNX dormido**, comportamiento actual (`.h5`) → **cero regresión**.
2. Validar `GET /health` → `model_backend="onnx"` cuando se active.
3. **No activar** (`AI_BACKEND=onnx`) hasta que AI-R4 provea la detección de modo / contrato v2.

---

## 9. Condiciones para reclasificar a `SAFE_TO_EXECUTE`

Cualquiera de las dos, más las menores:

**Vía A (recomendada) — R3 dormido:** ejecutar AI-R3 implementando el switch con **default `AI_BACKEND=tf`** y el volumen **no activo**. Resultado: capacidad ONNX instalada y verificada, sin cambio de comportamiento. → `SAFE_TO_EXECUTE`.

**Vía B — R3 + R4 juntos:** desplegar AI-R3 y AI-R4 en el mismo ciclo, con la **detección de modo** (`model_contract_version`) operativa en el resolver. → `SAFE_TO_EXECUTE`.

**Condiciones menores (siempre):**
- D3-A: bind mount read-only (no hornear).
- D3-C: conservar TensorFlow durante R3.
- Etiquetar la imagen previa (`pre-air3`) antes del rebuild.
- Implementar selección **explícita** de modelo (no `mtime`).
- Confirmar `docker compose -p <proyecto> -f docker-compose.yml` correcto (R-EXEC-8).

---

## 9.1 Checklist de readiness

| # | Ítem | Estado |
|---|---|---|
| 1 | ONNX presente + hash coincide | ✅ |
| 2 | ONNX checker/contrato/paridad | ✅ |
| 3 | Docker sano + healthcheck | ✅ |
| 4 | Ruta del modelo para el volumen | ✅ |
| 5 | `onnxruntime` instalable (pin) | ✅ |
| 6 | Rollback (imagen + flag + `.h5`) | ✅ |
| 7 | **Compatibilidad semántica viva (R3 vs R4)** | ❌ **(R-EXEC-1)** |
| 8 | `AI_BACKEND` explícito (no `mtime`) | ⚠️ a implementar |
| 9 | Etiquetar imagen `pre-air3` | ⚠️ a hacer antes del rebuild |

---

## 10. Clasificación

**`NOT_SAFE_TO_EXECUTE` (en aislamiento)** · pasa a **`SAFE_TO_EXECUTE`** mediante **Vía A (R3 dormido)** o **Vía B (R3+R4 juntos)**.

**Motivo único y suficiente:** R-EXEC-1 — el servicio vivo + resolver binario ⇒ activar M2 **mislabela** las 16 clases (p. ej. `corn__common_rust` como "sana"). Los demás riesgos son operativos y mitigables.

## 10.1 No ejecutado
Sin cambios de código · sin instalar `onnxruntime` · sin rebuild de imágenes · sin tocar el contenedor `ai_service` · sin commits · sin push.
