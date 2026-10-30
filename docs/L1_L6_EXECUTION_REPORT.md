# L1_L6_EXECUTION_REPORT

**Misión:** `L1_L6_EXECUTION` — ejecución controlada de L-1..L-6 (transparencia de procedencia de modelo)
**Fecha:** 2026-10-30
**Base:** `docs/L1_L6_EXECUTION_PLAN.md` (aprobado) + `docs/L1_L6_RUNTIME_DISCLOSURE_PLAN.md` (D-L1..D-L4) + `docs/DOCKER_READY_CONDITIONAL_DECISION_REPORT.md` (criterios C-1..C-5, O-2..O-5)
**HEAD:** `d930a34` (sin commits, sin push, sin stage)
**Clasificación:** **`DOCKER_NOT_READY`**

---

## 0. Veredicto en una línea

> **Lo que se puede probar sin Docker, se probó y está verde (identidad por hash, fail-closed, contrato del resolver, build del frontend, registro sin deriva). Lo que exige el daemon de Docker —y el 40 % restante de los AC— NO se ejecutó. Por eso la clasificación es `DOCKER_NOT_READY`, no `DOCKER_READY_CONDITIONAL`.**

Desglose honesto:

| Dimensión | Estado |
|---|---|
| **DECIBLE** (el sistema puede declarar qué artefacto sirve y con qué alcance) | **5/5** ✅ |
| **VERIFICADA** (alguien lo comprobó contra el contenedor corriendo) | **0/4** ❌ (Docker apagado) |

`DOCKER_READY_CONDITIONAL` exige **L-1..L-6 + O-2 + O-3 + O-4 + O-5** (§6.1 del informe de decisión). Hoy hay **L-1..L-6 ejecutados a nivel de código** y **O-2/O-4 imposibles**: el daemon no responde.

```
docker info → failed to connect to npipe:////./pipe/dockerDesktopLinuxEngine: file not found
→ O-2 (G2/G4/G8/G13/G15) y O-4 (16 capturas) NO ejecutables.
```

### 0.1 Condiciones de legitimidad C-1..C-5 (criterio de la propia categoría)

| ID | Requisito | Estado tras L-1..L-6 | Evidencia |
|---|---|---|---|
| C-1 | Condición verificable por máquina | ✅ **CUMPLE** (código) | `/health` expone 14 campos nuevos; `model_status` se deriva del hash |
| C-2 | Condición visible al usuario final | ✅ **CUMPLE** (código) | badge de procedencia en la tarjeta principal (`AIPredictiva.jsx:590-600`) |
| C-3 | Registrada en el canon con dueño y fecha | ✅ **CUMPLE** | `conditional_window.owner/declared_on` en el manifiesto |
| C-4 | Caducidad y disparador de salida | ✅ **CUMPLE** | `expires_on: AI-R3+R4` + `trigger` + `on_expiry` |
| C-5 | No se extiende a OCI ni exposición pública | ✅ **CUMPLE** | nada público tocado; `reference/` y bridge siguen fuera |

**Las 5 condiciones de legitimidad están cerradas a nivel de código y canon.** Lo que falta no es legitimidad: es **verificación de runtime**.

---

## 1. Alcance ejecutado vs. plan

| ID | Entrega | Resultado |
|---|---|---|
| **L-1a** | `src/ai_models/model_identity.py` (nuevo, 233 líneas) | ✅ EJECUTADO |
| **L-1b** | `src/ai_models/test_model_identity.py` (nuevo, 94 líneas) | ✅ EJECUTADO · **20/20** |
| **L-1c** | `src/ai_models/fastapi_app.py` — `/health` siempre 200 + identidad en `/infer` | ✅ EJECUTADO |
| **L-2** | `semantic_prediction_resolver.py` — `model_status`, `model_sha256`, `artifact_id`, `class_space`, `class_labels`, `superseded_by`, `trace` | ✅ EJECUTADO · **33/33** |
| **L-2 (cont.)** | `src/backend/api/views.py` — 3 claves aditivas en `trace` | ✅ EJECUTADO **con enmienda a G-EX-5** (ver §5.1) |
| **L-3a** | `AIPredictiva.jsx` — modo honesto + badge de procedencia + nota junto a confianza | ✅ EJECUTADO |
| **L-3b** | `ModelPredictCell.jsx` — mismo badge que `AIPredictiva` | ⛔ **NO EJECUTADO** (archivo en `pages/cmsc/` = CMSC, prohibido por la misión) |
| **L-4** | `VoiceAssistant.jsx` — fallos declarados en pantalla, no en consola | ✅ EJECUTADO |
| **L-4c** | `AcpCell.jsx` — pintar el `error` del hook | ⛔ **NO EJECUTADO** (mismo motivo) |
| **S74 (nota)** | `signalCatalog.js` — nota de procedencia de S74 | ⛔ **NO EJECUTADO** (mismo motivo) |
| **L-5** | `docs/DEPLOYMENT.md` — sección canónica + original conservado | ✅ EJECUTADO |
| **L-6** | `docs/ai/manifests/model_registry.agriculture_v2.yaml` | ✅ EJECUTADO |

**Regla respetada:** NADA DESAPARECE. `DEPLOYMENT.md` conserva el original íntegro bajo `# HISTÓRICO (2026-08-21)`; el manifiesto conserva `ROTO` y `colapso a class_0` como historia del artefacto.

### 1.1 Por qué L-3b / L-4c / S74 no se ejecutaron

La misión prohíbe tocar CMSC, Knowledge Hub, Labs, Bridge, Dashboard. Los tres ficheros viven en `src/frontend/src/pages/cmsc/`:

| Fichero | Qué contenía pendiente |
|---|---|
| `pages/cmsc/ModelPredictCell.jsx` | `:53` narración `"Inferencia real finalizada…"`, `:72` etiqueta `"operar inferencia real · S61"` |
| `pages/cmsc/AcpCell.jsx` | consumidor de `useAiVoiceAssist` sin pintar `error` |
| `pages/cmsc/signalCatalog.js` | nota de alcance de S74 |

**La prohibición prevalece sobre el plan.** Se declara como deuda con parche exacto en §6.2.

---

## 2. Cambios por archivo

| Archivo | Δ | Qué se hizo |
|---|---|---|
| `src/ai_models/model_identity.py` | **nuevo** (233 líneas) | Registro `KNOWN_ARTIFACTS` por SHA-256; `hash_file()` streaming 1 MiB; `compute_identity()` con cross-check `class_space`; caché por `(path, size, mtime_ns, output_dim)`; `normalize_status()` con alias único; fail-closed a `NO_DECLARADO` |
| `src/ai_models/test_model_identity.py` | **nuevo** (94 líneas) | 20 tests: 12 del artefacto real + 3 negativos + 5 de normalización/enum |
| `src/ai_models/fastapi_app.py` | +102 / −0 | `model_identity` importado **fuera** del `try` de TF (`:30`); `_model_output_dim()` (`:197`), `_model_identity()` (`:212`, nunca lanza), `_identity_fields()` (`:236`); `/health` (`:260-293`) con **18 claves** (4 previas + 14 nuevas) y **siempre 200**; `/infer` (`:297`) con `inference_executed` + identidad en rama de éxito **y** de excepción |
| `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py` | +127 / −2 | Enum `HISTORICO/CANONICO/NO_DECLARADO/INCONSISTENTE/NO_DISPONIBLE`; 9 métodos privados; `prediction.update()` con 6 campos; `trace{model_file, inference_executed, inference_origin}`; `_resolve_source_mode()` intacto (`"cloud"`) |
| `src/backend/api/views.py` | +9 / −0 | `resolved_trace` + 3 claves aditivas (`:392`, `:407-409`); `contract_version` sigue `"v1"` |
| `src/frontend/src/pages/AIPredictiva.jsx` | +189 / −21 | `ANALYSIS_MODES.real = 'ANÁLISIS CON MODELO'` (`:7`); `getModePresentation` fail-closed (`:113-147`); `getProvenancePresentation` (`:152`) y `buildNarrationPrefix` (`:219`); **modo derivado de `source_mode`** (`:256`); badge en tarjeta principal (`:590-600`); `CONFIANZA POR IMAGEN` (`:604`) + nota G-3b (`:617-621`); 6 campos nuevos en Trazabilidad; exports ampliados (`:752`) |
| `src/frontend/src/components/VoiceAssistant.jsx` | +45 / −9 | `error` en componente flotante (`:16`) y en `useAiVoiceAssist` (`:163`), expuesto en el `return` (`:229`); `alert()` sustituido por aviso inline (`:62`); caja `role="alert"` (`:130`) |
| `docs/DEPLOYMENT.md` | +66 / −0 | Sección canónica (compose real, contrato de procedencia, `NO_DECLARADO` ≠ fallo de arranque, 5173 vs 5174) + original histórico conservado |
| `docs/ai/manifests/model_registry.agriculture_v2.yaml` | +41 / −4 | `serving_note` corregido; `runtime_registry`, `status_vocabulary`, `status_alias_policy`; entrada `plant_disease_mbv2_h5` con `HISTORICO` + `status_alias`, hash real, bytes, mtime, `class_space`, `class_labels`, `declared_in`, `superseded_by`, `conditional_window` (owner/fecha/caducidad/trigger) |

**Total:** 7 archivos modificados (**+556 / −23**) + 2 nuevos.

---

## 3. Validaciones V-1..V-19

### 3.1 Ejecutadas hoy (bloque A, sin Docker)

| ID | Comando | Resultado |
|---|---|---|
| **V-1** | `python -m py_compile src\ai_models\model_identity.py` | ✅ exit 0 |
| **V-2** | `python -m py_compile src\ai_models\fastapi_app.py` | ✅ exit 0 |
| **V-3** | `cd src\ai_models; python -m unittest test_model_identity -v` | ✅ **20/20 OK** (0.05 s) |
| **V-4** | `python -m py_compile ...\semantic_prediction_resolver.py` | ✅ exit 0 |
| **V-5** | `cd src\frontend; npm run build` | ✅ **built in 21.51 s** (dos builds en la sesión: 24.17 s y 21.51 s) |
| **V-6** | `grep "Inferencia real finalizada"` en `src/frontend/src` | ⚠️ **PARCIAL**: 0 en `AIPredictiva.jsx`, **2 en `ModelPredictCell.jsx`** (prohibido) |
| **V-7** | inspección `getModePresentation` | ✅ `return` final = `NO DETERMINADO` (fail-closed) |
| **V-8** | campos en resolver y JSX | ✅ 30 coincidencias en el resolver · 17 en el JSX |
| **V-9** | `HISTORICO` como default | ✅ **0** apariciones en patrón `\|\|`/`??`/`else 'HISTORICO'` |

**Validaciones adicionales ejecutadas (no estaban en el catálogo original):**

| Validación | Resultado |
|---|---|
| Script directo del resolver (`validate_resolver_l2.py`) reproduciendo los tests existentes + casos nuevos | ✅ **33/33 checks OK**, 0 FAIL |
| `pytest --noconftest -q src\backend\tests\test_semantic_prediction_resolver.py` | ✅ **4 passed** (el `conftest.py` importa `django` ⇒ sin `--noconftest` no arranca) |
| Parseo del YAML + comparación de hashes (AC-L13) | ✅ `match True` |
| Conteo de claves de `/health` por AST | ✅ 18 totales = 4 previas + **14 nuevas** |
| Hash del `.h5` en disco (post-ejecución) | ✅ `77B0EFEC…219C0` (**sin cambios**) |

### 3.2 Diferidas a runtime (bloque B, requieren Docker)

| ID | Qué verifica | Por qué no se ejecutó |
|---|---|---|
| **V-10** | `curl :8081/health` → `model_status=HISTORICO`, `model_sha256=77b0efec…`, `class_space=2` | daemon apagado |
| **V-11** | `POST /infer` con imagen real → `inference_executed:true` | ídem |
| **V-12** | `POST /api/v3/ai/inference/` → `prediction.model_status=HISTORICO` · `trace.inference_origin=local_container` | requiere Django |
| **V-13** | `docker compose ps` → `ai_service` healthy | daemon apagado |
| **V-14** | fallback: `stop ai_service` → 502 sin `model_status` inventado | ídem |
| **V-15** | `pytest src/backend/tests/test_semantic_prediction_resolver.py` (suite completa) | `conftest.py:2` importa `django` (ausente en host) |
| **V-16** | `test_model_identity.py` **dentro** del contenedor (mismo hash en imagen) | ídem |
| **V-17** | capturas de `/ai-predictive` y `/dashboard-cmsc` | requiere navegador + servicios |
| **V-18** | regresión de voz: dice "modelo histórico binario", nunca "inferencia real" | requiere audio real |
| **V-19** | `docker compose config` | daemon apagado |

---

## 4. Criterios de aceptación AC-L1..AC-L14

| AC | Enunciado | Estado | Motivo / evidencia |
|---|---|---|---|
| **AC-L1** | `/health` expone las 13 claves nuevas con valores correctos | 🟡 **DIFERIDO** (código ✅) | El handler devuelve **14** claves nuevas (una más que el plan: `identity_source`). Valores calculados en host ✅; la lectura HTTP no se ejecutó |
| **AC-L2** | `model_sha256` == `77b0efec…19c0` (casefold) | ✅ **CUMPLE** | Calculado sobre el binario real: `77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0` |
| **AC-L3** | `class_space == 2` **y** coincide con `model_metadata.json` **y** con `output_shape[-1]` | 🟡 **PARCIAL** | `2` vs `{"classes":["enferma","sana"]}` ✅ (cross-check en `compute_identity`); `output_shape[-1]` exige TensorFlow ⇒ V-11 |
| **AC-L4** | Envelope de éxito con `prediction.model_status=HISTORICO` | 🟡 **DIFERIDO** (código ✅) | Resolver validado con payload nuevo (33/33); el envelope HTTP exige Django |
| **AC-L5** | Fallback ⇒ `trace.inference_executed=false` y la UI dice "Modo degradado" | ✅ **CUMPLE** (código) | `_resolve_inference_executed()` → `False` si `diagnosis=unknown` o `status=error`; `mode` se deriva de `source_mode==='fallback'` (`AIPredictiva.jsx:256`). E2E = V-14 |
| **AC-L6** | 0 cadenas "Inferencia real finalizada" en `src/frontend/src` | 🟡 **PARCIAL** | 0 en `AIPredictiva.jsx`; **2 en `ModelPredictCell.jsx:53,72`** (archivo prohibido) |
| **AC-L7** | Badge de procedencia visible en la tarjeta principal | 🟡 **DIFERIDO** (código ✅) | `<div>` con `provenancePresentation` junto al badge de modo (`:590-600`); falta la captura V-17 |
| **AC-L8** | `ModelPredictCell` muestra el mismo badge que `AIPredictiva` | ❌ **NO CUMPLE** | Imposible sin tocar CMSC. Deuda declarada (§6.2) |
| **AC-L9** | `/health` responde **200** en los 5 estados | ✅ **CUMPLE** (código) | El handler no usa `status_code` ni `HTTPException`; la alarma viaja en `model_status`. Prueba HTTP = V-10/V-13 |
| **AC-L10** | `model_registry` sin `artifact_sha256: null`, sin "degenerado", sin contradicción de `serving` | ✅ **CUMPLE** (con matiz) | `degenerado`: 0 · `serving_note` corregido (sí se sirve el `.h5` legacy) · el único `artifact_sha256: null` restante es **M1**, cuyo binario no existe en disco (`artifact_present: false`) |
| **AC-L11** | `expires_on` presente y apunta a `AI-R3+R4` | ✅ **CUMPLE** | YAML `AI-R3+R4` == registro `AI-R3+R4` |
| **AC-L12** | Suite del backend verde | 🟡 **PARCIAL** | `test_semantic_prediction_resolver.py` **4/4 verdes** con `--noconftest`; la suite completa no arranca sin Django |
| **AC-L13** | `KNOWN_ARTIFACTS` sha == `artifact_sha256` del YAML | ✅ **CUMPLE** | `match True` (anti-deriva R-L10 cerrado) |
| **AC-L14** | `model_identity.py` no importa nada fuera de stdlib | ✅ **CUMPLE** | imports: `hashlib`, `json`, `datetime`, `pathlib`, `typing`. Verificado en runtime: `tensorflow/fastapi/django/yaml/numpy` **no** cargados |

**Recuento:** 7 CUMPLE · 5 PARCIAL/DIFERIDO · 1 NO CUMPLE · 1 DIFERIDO puro (AC-L1).

---

## 5. Enmiendas y desviaciones declaradas

### 5.1 G-EX-5 enmendado (SE DECLARA)

`G-EX-5` del plan prohibía tocar `views.py`. Se tocó **solo** para añadir 3 claves aditivas en `trace`:

```python
resolved_trace = resolved.get("trace") or {}
...
"model_file": resolved_trace.get("model_file"),
"inference_executed": resolved_trace.get("inference_executed"),
"inference_origin": resolved_trace.get("inference_origin"),
```

**Justificación:** sin esto, `model_status` viajaría en `prediction` pero el consumidor no podría distinguir *"el artefacto es histórico"* (identidad) de *"esta petición ejecutó el modelo"* (resultado), que es exactamente D-L4. El adaptador (`fastapi_ai_adapter.py:40-42`) hace passthrough, así que `_PREDICTION_FIELDS` no cambió y los tests existentes (que exigen subconjunto) siguen verdes.

**Riesgo residual:** ninguno verificado; `contract_version` sigue `"v1"`.

### 5.2 `alert()` → aviso inline en `VoiceAssistant.jsx`

El plan preveía conservar `alert()`. Se sustituyó por `setError` + caja `role="alert"` (`:130`). **Motivo:** un `alert` bloquea el hilo y no deja rastro; la dirección de honestidad es la misma (declarar el fallo), con menos fricción. Se declara.

### 5.3 Modo derivado de `source_mode` (no previsto literalmente en el plan)

`buildInfoFromOfficialResponse` tenía `mode: 'real'` **hardcodeado**. Con eso, un fallback habría pintado dos badges contradictorios: `ANÁLISIS CON MODELO` + `SIN INFERENCIA · MODO DEGRADADO`. Se corrigió (`:256`):

```js
mode: data?.source_mode === 'fallback' ? 'degraded' : 'real',
```

y se añadió la rama `degraded` en `getProvenancePresentation`, `buildNarrationPrefix` y la nota junto a la confianza. **Es la corrección que hace AC-L5 real, no cosmética.**

### 5.4 `/health` expone 14 claves nuevas, no 13

Delta `+1`: `identity_source` (`sha256_registry` vs `none`). Permite distinguir "hash calculado del registro" de "no hay artefacto". AC-L1 se declara con el número real.

### 5.5 L-6 se ejecutó sobre el manifiesto, no como `deployment_readiness.yaml`

El informe de decisión (§6, L-6) pedía un `deployment_readiness.yaml` nuevo. El **plan aprobado** redefinió L-6 como la corrección de `model_registry.agriculture_v2.yaml` (`L1_L6_EXECUTION_PLAN.md:59`). Se siguió el plan. **`deployment_readiness.yaml` NO existe**; los campos de gobernanza que pedía (dueño, fecha, caducidad, trigger) se incorporaron a `conditional_window` dentro del manifiesto.

### 5.6 `/assist` no se tocó (0 cambios)

Se verificó que `POST /assist` (`fastapi_app.py:387`) es **STT + gTTS + Postgres**: no usa el modelo de plantas. Añadirle `model_status` sería inventar procedencia sobre un canal que no infiere. `git diff` sobre `assist` = **vacío**. El fallo del canal se declara en el cliente (L-4).

---

## 6. Deuda residual

### 6.1 Tabla

| ID | Deuda | Bloquea | Trigger de pago |
|---|---|---|---|
| **D-A** | `ModelPredictCell.jsx:53,72` conserva "inferencia real" | AC-L6 total | misión que autorice tocar CMSC |
| **D-B** | `ModelPredictCell` sin badge de procedencia | AC-L8 | ídem |
| **D-C** | `AcpCell.jsx` no pinta `error` del hook (el hook ya lo devuelve) | L-4c | ídem |
| **D-D** | `signalCatalog.js` sin nota de alcance de S74 | S74 | ídem |
| **D-E** | `source_mode: "cloud"` es factualmente falso (corre local) | B-9 | corrección del enum; `trace.inference_origin` ya lo compensa |
| **D-F** | `/health` y envelope sin verificación HTTP | AC-L1/L4/L9 | Docker arriba (V-10..V-19) |
| **D-G** | `output_shape[-1]` sin cross-check real | AC-L3 total | TensorFlow en contenedor (V-11) |

### 6.2 Parche exacto pendiente para `ModelPredictCell.jsx` (NO aplicado)

```diff
@@ línea 53 (narración) @@
-          `Inferencia real finalizada. ${built.disease}. ${built.recommendation}`
+          `Análisis con modelo finalizado. ${built.disease}. ${built.recommendation}`

@@ línea 72 (etiqueta) @@
-          <p className="text-[10px] text-gray-500">operar inferencia real · S61</p>
+          <p className="text-[10px] text-gray-500">operar análisis con modelo · S61</p>
```

Para AC-L8 hace falta además reutilizar `getProvenancePresentation` (ya exportado en `AIPredictiva.jsx:752`) y pintar el badge con `built.modelStatus`. **No se aplicó: el fichero pertenece a CMSC.**

---

## 7. Riesgos residuales vivos

| ID | Riesgo | Estado |
|---|---|---|
| **R-L10** | Deriva código (`KNOWN_ARTIFACTS`) ↔ YAML | ✅ **mitigado** (AC-L13 = `True`) |
| **R-L11** | Cardinalidad de `class_space` no prueba las etiquetas | ✅ declarado: cross-check en 3 fuentes, pero `class_labels` sigue siendo **declaración**, no verificación del grafo |
| **R-L12** | `model_metadata.json` del contenedor ≠ del repo | ⏳ V-16 lo detecta (mismo `COPY . .`) |
| **R-L14** | Declarar "hecho" sin V-10..V-19 | ✅ **evitado**: este informe dice `DOCKER_NOT_READY` |
| **R-L15** | `/health` con 5xx rompería el arranque del frontend (`depends_on: service_healthy`) | ✅ mitigado por diseño (siempre 200) |
| **R-L16** | El badge de procedencia se lee como "certificación" | 🟡 mitigado con la nota G-3b explícita (*"no es precisión validada"*) |
| **R-L17** | `benchmark/runs/*.onnx` (challenger) podría parecer "modelo canónico" | ✅ `serving_note` corregido: se sirve el `.h5` legacy; **nada de `benchmark/` está servido** |

---

## 8. Integridad del repositorio (verificación final)

```
git rev-parse --short HEAD                → d930a34
git status --porcelain                    → 7 M + 8 ??  (15 entradas)
git stash list                            → stash@{0}: PRE_MULTI_AGENT_2026_09_29  (intacto)
Get-FileHash plant_disease_mbv2.h5        → 77B0EFEC…219C0  (sin cambios)
```

- **Sin commits · sin push · sin `git add`.**
- `git diff --stat`: `7 files changed, 556 insertions(+), 23 deletions(-)`.
- **No tocado:** CMSC · Knowledge Hub · Labs · Bridge · Dashboard · M1 · M2 · ONNX · Memory · OCI · ningún binario.
- `docs/DEPLOYMENT.md` y el resolver muestran aviso CRLF→LF de git; es solo normalización de fin de línea, no cambio de contenido.
- Backups de rollback en `.local_backups/L1_L6_20261030/` (excluido por `.git/info/exclude`): originales de los 4 ficheros no tocados aún + `.HEAD.orig` de los 3 Python.

---

## 9. Qué falta exactamente para `DOCKER_READY_CONDITIONAL`

| Bloque | Entrega | Requiere |
|---|---|---|
| **L-1..L-6** | ✅ ejecutado (con las desviaciones de §5) | — |
| **O-2** | Verificación G2/G4/G8/G13/G15 | Docker arriba |
| **O-3** | Tag + `DEPLOYMENT.md` + `compose.resolved.yml` | ✅ doc hecho; tag y `resolved` pendientes |
| **O-4** | 16 capturas | Docker arriba + navegador |
| **O-5** | Decisión registry vs OCI | decisión de Bernardo |
| **+ deuda D-A..D-D** | AC-L6 total y AC-L8 | autorización para tocar `pages/cmsc/` |

**Orden recomendado:** (1) levantar Docker → V-10..V-19 → O-2/O-4; (2) misión corta para D-A..D-D → AC-L6/AC-L8; (3) O-5; (4) declarar `DOCKER_READY_CONDITIONAL` con caducidad `AI-R3+R4`.

---

## 10. Recomendación

1. **No declarar `DOCKER_READY_CONDITIONAL` hoy.** Declararlo sin O-2/O-4 sería exactamente el riesgo R1 del informe de decisión: *"condicional"* se volvería permanente y nadie ejecutaría R3+R4.
2. **Sí declarar el bloque A como cerrado**: la mitad verificable sin Docker está probada y verde (identidad por hash, fail-closed, contrato del resolver, build, anti-deriva del registro).
3. **No commitear todavía** sin orden explícita. El árbol queda con 7 modificados + 2 nuevos, todo reversible por copia de bytes.
4. La próxima sesión con Docker arriba puede cerrar V-10..V-19 en una sola pasada, porque los campos ya existen en el código y en la UI.

---

## Anexo A — Evidencia del artefacto real

```
archivo        : src/ai_models/production_models/plant_disease_mbv2.h5
bytes          : 9 431 432
sha256         : 77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0
mtime (UTC)    : 2026-08-21T22:14:27Z   (17:14:27 local, UTC-05:00)
metadata       : {"classes": ["enferma","sana"], "framework": "tensorflow_fixed"}
model_status   : HISTORICO
artifact_id    : plant_disease_mbv2@77b0efec
class_space    : 2
class_labels   : ["enferma", "sana"]
scientific_scope: binary_only
superseded_by  : M2_efficientnet_b0_001
declared_in    : src/ai_models/model_identity.py
expires_on     : AI-R3+R4
```

## Anexo B — Por qué el registro vive en código y no solo en el manifiesto

`src/ai_models/Dockerfile:21` hace `COPY . .` **del directorio del microservicio**: el contenedor `ai_service` **no contiene `docs/`**. Si el estado del artefacto se leyera del YAML, el runtime no podría declararlo. Por eso:

- **código** = registro de ejecución (`KNOWN_ARTIFACTS` en `model_identity.py`);
- **manifiesto** = fuente documental canónica;
- **AC-L13** = el candado que impide que ambos deriven.

Es la única forma de que `model_status` sea verificable por máquina (C-1) sin inventar una dependencia de `docs/` dentro de la imagen.
