# L1_L6_EXECUTION_PLAN

**Misión:** `L1_L6_EXECUTION_PLAN`
**Base:** `docs/L1_L6_RUNTIME_DISCLOSURE_PLAN.md` (`READY_FOR_L1_L6`)
**Fecha:** 2026-10-30
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `d930a34`
**Modo:** SOLO PLAN. **Cero** código modificado, cero commits, cero push, cero Docker.

---

## 0. Veredicto

> ### `SAFE_TO_EXECUTE`
>
> Las 6 operaciones son **aditivas**, no hay migración, no hay dependencia nueva, no hay cambio de
> comportamiento de inferencia, y los 4 archivos existentes son revertibles por `git checkout --`.
>
> **Condicionado a 4 guardrails no negociables** (§9.2): `/health` siempre 200 · identidad derivada
> del hash (nunca literal por nombre) · `source_mode` **no** se toca · S74 `estado` **no** se toca.
>
> **Y con 3 AC diferidos**, no omitidos: los que exigen runtime (§8.3). Hoy Docker está apagado y
> **Django/TensorFlow no están instalados en el host**, así que la suite del backend y los `curl`
> solo pueden correr en contenedor. Ejecutar sin verificarlos y llamarlo "hecho" sería el atajo que
> este plan existe para impedir.

---

## 1. Restricciones verificadas hoy (cambian el plan)

Estas tres no estaban resueltas en el plan base y condicionan el diseño:

| # | Hecho verificado | Consecuencia |
|---|---|---|
| **X-1** | `src/ai_models/Dockerfile:21` es `COPY . .` → el contenedor tiene `production_models/` pero **NO tiene `docs/ai/manifests/`** | El runtime **no puede leer** `model_registry.agriculture_v2.yaml`. Un registro en YAML es inservible en ejecución |
| **X-2** | Host: `django` **no instalado**, `tensorflow` **no instalado**; `pytest 9.1.1` y `pyyaml` sí | La lógica de identidad debe ser **stdlib puro** para poder probarse **hoy**, sin Docker |
| **X-3** | `src/ai_models/fastapi_ai_adapter.py:40-42` hace passthrough del payload (`payload = response.json()`) | Los campos nuevos de `/infer` llegan al resolver **sin tocar el adaptador**. 0 líneas ahí |

**Y una corrección de diseño al plan base (D-L4, §2.4):** el plan base hacía que `model_status`
describiera también el resultado de la petición. Son dos ejes distintos. Se separan con
`inference_executed`, derivable de campos que ya existen ⇒ compatible con un `ai_service` viejo
durante un despliegue por partes.

---

## 2. Punto 1 — Archivos exactos

### 2.1 Inventario

| # | Operación | Archivo | Líneas | Δ |
|---|---|---|---|---|
| **L-1a** | **NUEVO** | `src/ai_models/model_identity.py` | 0 → ~110 | +110 |
| **L-1b** | **NUEVO** | `src/ai_models/test_model_identity.py` | 0 → ~70 | +70 |
| **L-1c** | modificado | `src/ai_models/fastapi_app.py` | `:8-16` (imports) · `:185` · `:199-207` · `:241-248` · `:268-276` | +22 |
| **L-2** | modificado | `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py` | `:4-58` (constantes) · `:69-75` · tras `:138` | +34 |
| **L-3a** | modificado | `src/frontend/src/pages/AIPredictiva.jsx` | `:105-127` · `:142` · `:176-200` · `:460-463` · `:466-481` · `:516-558` · `:571` | +38 |
| **L-3b** | modificado | `src/frontend/src/pages/cmsc/ModelPredictCell.jsx` | `:53` · `:72` · `:113-125` | +14 |
| **L-4** | modificado | `src/frontend/src/components/VoiceAssistant.jsx` | `:11-15` · `:96-104` · `:135-193` | +16 |
| **L-4c** | modificado | `src/frontend/src/pages/cmsc/AcpCell.jsx` | `:35-50` · tras `:70` | +8 |
| **L-6** | modificado | `docs/ai/manifests/model_registry.agriculture_v2.yaml` | `:19-25` · `:115-125` | +12 |
| **L-5** | documental | `docs/DEPLOYMENT.md` (61 líneas, 21/08/2026, obsoleta) | reescritura | n/a |

**Total: 2 archivos nuevos (1 módulo + 1 test) · 6 modificados · 1 documento · 1 YAML.**
**No se toca:** `src/backend/api/views.py` (el envelope se construye desde `resolved`, que ya transporta los campos) · `fastapi_ai_adapter.py` (X-3) · `docker-compose.yml` · `src/ai_models/Dockerfile` · `src/frontend/Dockerfile` · `requirements.txt` · `_PREDICTION_FIELDS` · `signalCatalog.js` (salvo `nota` de S74, decisión D-L1b).

### 2.2 Dónde vive el registro en runtime (resuelve X-1)

**Decisión de arquitectura de este plan:** el registro de runtime vive **en código**,
`KNOWN_ARTIFACTS` dentro de `model_identity.py`, indexado por **SHA-256**, no por nombre.

```
                    ┌──────────────────────────────┐
IDENTIDAD (bytes) → │ model_identity.py            │ → STATUS / SCOPE / CLASS_SPACE
                    │ KNOWN_ARTIFACTS[sha256]      │
                    └──────────────────────────────┘
                                    ▲
                    hash igual      │      (AC-L13 verifica que coincidan)
                                    ▼
                    docs/ai/manifests/model_registry.agriculture_v2.yaml
                              (fuente canónica documental, L-6)
```

Por qué en código y no en un JSON/YAML junto al modelo:

1. El contenedor **no tiene** `docs/` (X-1); leer el manifiesto exigiría tocar `Dockerfile` o
   `docker-compose.yml`, ambos fuera del permiso de esta misión.
2. `model_identity.py` en **stdlib puro** es testeable **hoy** con Python 3.11.9 del host (X-2),
   sin Django, sin TensorFlow, sin Docker.
3. El registro sigue siendo **por hash**: si aparece un `.h5` nuevo, el hash no está en el dict y el
   estado es `NO_DECLARADO`. La crítica del plan base (R-L1) queda cerrada.

**Riesgo aceptado y declarado (R-L10):** la duplicación código↔YAML puede derivar. Se cierra
mecánicamente con **AC-L13** (comparación de los dos hashes) y con `declared_in` apuntando a la ruta
del módulo, no a una copia.

---

## 3. Punto 2 — Campos exactos

### 3.1 `model_status` — enum cerrado (5 valores, sin alias)

| Valor | Significado técnico | Cómo se produce |
|---|---|---|
| `HISTORICO` | Hash está en `KNOWN_ARTIFACTS` con `status: HISTORICO`, y el cross-check de `class_space` pasa | derivado |
| `CANONICO` | Hash declarado canónico y cross-check OK (hoy **ningún** artefacto lo produce) | derivado |
| `NO_DECLARADO` | Archivo cargable cuyo hash **no** está en el registro | **default fail-closed** |
| `INCONSISTENTE` | Hash declarado pero `class_space` no coincide con `model_metadata.json` o con `model.output_shape[-1]` | derivado |
| `NO_DISPONIBLE` | No hay `.h5`/`.keras` cargable, o TF no disponible | derivado |

**Invariante:** `HISTORICO` **nunca** es el valor por defecto en ningún punto de la cadena —ni en
Python, ni en el resolver, ni en el JSX, ni en el badge—. Ningún `if not valor: 'HISTORICO'`.
Cualquier valor fuera del enum, incluido `None`, `""`, `"historico"` en minúsculas o `"HISTORICAL"`,
se normaliza a `NO_DECLARADO`.

### 3.2 `model_sha256`

- 64 hex **minúsculas** al emitir (el YAML canónico usa MAYÚSCULAS: comparar con `casefold()`).
- Se calcula por **streaming** en bloques de 1 MiB, no `read_bytes()`.
- Se calcula **independientemente de TensorFlow**: saber *qué archivo hay* no depende de *poder
  cargarlo*. Si se anidara dentro del `try` de TF, el modo degradado perdería el único dato útil.
- **Caché** por `(name, size, mtime_ns)`: con healthcheck cada 10 s (`docker-compose.yml:87`),
  re-hashear 9,4 MB en cada sondeo es IO regalado. Se re-hashea solo si cambia la clave.

### 3.3 Identidad del artefacto

| Campo | Tipo | Derivación | Ejemplo real |
|---|---|---|---|
| `model_file` | str | `latest.name` (la misma regla que hoy: **más reciente por mtime**) | `plant_disease_mbv2.h5` |
| `model_bytes` | int | `latest.stat().st_size` | `9431432` |
| `model_mtime` | str ISO-8601 UTC | `latest.stat().st_mtime` | `2026-08-21T17:14:27Z` |
| `model_sha256` | str(64) | hash de bytes | `77b0efec…19c0` |
| `artifact_id` | str | `f"{latest.stem}@{sha256[:8]}"` | `plant_disease_mbv2@77b0efec` |
| `identity_source` | enum str | `sha256_registry` \| `sha256_only` \| `none` | `sha256_registry` |
| `declared_in` | str | ruta del registro runtime | `src/ai_models/model_identity.py` |
| `superseded_by` | str \| null | del registro | `M2_efficientnet_b0_001` |

**Hash verificado hoy en disco:** `77B0EFECD602F95FD31846C3058B4D45E41289155438FBD22738BCE0640219C0`
(9 431 432 B, mtime 21/08/2026 17:14:27). El mismo que ya está declarado en este plan base.

### 3.4 `class_space` — el campo que hace verificable el resto

`int` (número de clases del espacio de salida). Se calcula por **cross-check de tres fuentes**:

| Fuente | Cómo se lee | Valor hoy |
|---|---|---|
| A. Registro | `KNOWN_ARTIFACTS[sha]["class_space"]` | `2` |
| B. Metadatos | `latest.parent / "model_metadata.json"` → `len(json["classes"])` | `2` (`["enferma","sana"]`) |
| C. Grafo cargado | `model.output_shape[-1]` (guardado con `try/except`: no todos los modelos exponen `output_shape`) | `2` |

```
si A existe:
    si B disponible y B != A  → INCONSISTENTE
    si C disponible y C != A  → INCONSISTENTE
    si no                      → HISTORICO
si A no existe:
    class_space = B si B disponible si no C si no None
    model_status = NO_DECLARADO
```

Sin este cruce, `class_space: 2` sería otro string que puede mentir. **Limitación honesta (R-L11):**
coincidencia de *cardinalidad* no prueba coincidencia de *etiquetas*; `model_metadata.json` no
declara hash propio. Es verificación necesaria, no suficiente — y aun así convierte un literal en un
dato contrastado.

### 3.5 `inference_executed` (corrección D-L4)

| Eje | Campo | Responde | Valores |
|---|---|---|---|
| Procedencia del artefacto | `model_status` | *¿qué modelo es?* | enum de §3.1 |
| Resultado de la petición | `inference_executed` | *¿se ejecutó?* | `true` \| `false` |

**Derivación en el resolver (compatible hacia atrás):**

```
declarado = raw_result.get("inference_executed")          # campo nuevo de /infer
si declarado es bool            → usarlo
si no                          → derivar: diagnosis no vacía AND class_index >= 0 AND
                                          str(status).lower() != "error"
```

Con esto, un backend nuevo contra un `ai_service` viejo (sin el campo) sigue sabiendo si hubo
inferencia, sin inventar procedencia. Y un artefacto `HISTORICO` con inferencia fallida **no** se
convierte en "modelo no disponible" (que sería falso sobre el artefacto).

### 3.6 Matriz definitiva por superficie

| Campo | `/health` | `/infer` | envelope `prediction` | envelope `trace` |
|---|---|---|---|---|
| `model_file` | ✅ (`model_loaded`, se conserva) | ✅ (`model`, se conserva) | — | ✅ nuevo |
| `model_bytes` | ✅ | — | — | — |
| `model_mtime` | ✅ | — | — | — |
| `model_sha256` | ✅ | ✅ | ✅ | — |
| `model_status` | ✅ | ✅ | ✅ | — |
| `artifact_id` | ✅ | ✅ | ✅ | — |
| `identity_source` | ✅ | — | — | — |
| `class_space` | ✅ | ✅ | ✅ | — |
| `class_labels` | ✅ | ✅ | ✅ | — |
| `scientific_scope` | ✅ | ✅ | ✅ (ya existe) | — |
| `superseded_by` | ✅ | — | ✅ | — |
| `declared_in` | ✅ | — | — | — |
| `inference_executed` | — | ✅ | — | ✅ |
| `inference_origin` | — | — | — | ✅ `"local_container"` |
| `semantic_contract_version` | ✅ | — | ✅ (ya existe) | — |

**Regla:** el frontend solo puede consumir el **envelope** (nginx proxea `/api/` y `location = /assist`,
`src/frontend/Dockerfile:43-65`; `:8081/health` **no** es alcanzable desde el navegador en producción).
`/health` es para auditoría de máquina y forense.

---

## 4. Punto 3 — `/health`

### 4.1 Snippet propuesto (aditivo, conserva las 4 claves actuales)

```python
# PROPUESTA — NO APLICADA (L-1c) · sustituye fastapi_app.py:199-207
@app.get("/health")
def health():
    if not model:
        load_latest_model()
    identity = refresh_model_identity()          # caché por (name,size,mtime)
    return {
        # --- contrato previo, intacto ---
        "status": "ok",
        "tensorflow": TF_AVAILABLE,
        "voice": VOICE_AVAILABLE,
        "model_loaded": model_name,
        # --- procedencia (L-1) ---
        "model_file": identity["model_file"],
        "model_sha256": identity["model_sha256"],
        "model_bytes": identity["model_bytes"],
        "model_mtime": identity["model_mtime"],
        "model_status": identity["model_status"],
        "artifact_id": identity["artifact_id"],
        "identity_source": identity["identity_source"],
        "class_space": identity["class_space"],
        "class_labels": identity["class_labels"],
        "scientific_scope": identity["scientific_scope"],
        "superseded_by": identity["superseded_by"],
        "declared_in": identity["declared_in"],
        "semantic_contract_version": "v1",
    }
```

### 4.2 Códigos HTTP — invariante duro

| Situación | HTTP | `model_status` |
|---|---|---|
| Histórico declarado, cross-check OK | **200** | `HISTORICO` |
| Hash no declarado | **200** | `NO_DECLARADO` |
| `class_space` inconsistente | **200** | `INCONSISTENTE` |
| Sin modelo cargable / sin TF | **200** | `NO_DISPONIBLE` |
| Proceso realmente roto (excepción no controlada) | 5xx | (como hoy) |

**Por qué 200 siempre, verificado:** `docker-compose.yml:86` ejecuta
`urlopen('http://127.0.0.1:8081/health').status==200`; `urlopen` **lanza** en 5xx ⇒ contenedor
`unhealthy`. Y `frontend` declara `depends_on: ai_service: condition: service_healthy`
(`docker-compose.yml:124-125`). Un 503 por procedencia **impediría arrancar el frontend**: convertir
una etiqueta de gobernanza en un fallo de *liveness* apagaría el producto para señalar un problema
documental. La alarma correcta es el **valor del campo**, no el código HTTP.

> **D-L2** pendiente de tu firma. Si eligieras 503, este plan deja de ser `SAFE_TO_EXECUTE` (rompe el
> arranque del frontend) y habría que diseñar `/health/deep` fuera del healthcheck antes de tocar nada.

### 4.3 Contrato de `refresh_model_identity()`

```
entrada: ningún argumento (usa MODELS_DIR del módulo)
salida:  dict con las 13 claves de §3.3/§3.4 (nunca None, nunca excepción hacia el endpoint)
caché:   _CACHE = {"key": (name, size, mtime_ns), "value": {...}}
efectos: solo lectura de disco; no crea archivos; no loguea en INFER_LOG
```

---

## 5. Punto 4 — `/api/v3/ai/inference/`

### 5.1 Dónde se construye (y por qué `views.py` no se toca)

```
/infer (8081)                     adapter (passthrough, X-3)      resolver              views.py
{model_sha256, model_status,  →   payload = response.json()  →   prediction.update  →  Response(resolved)
 class_space, ...}                                               (L-2)                 ↑ ya existía
```

`AIInferenceV3View.post` (`src/backend/api/views.py:330-402`) ya devuelve
`resolved["prediction"]` completo (línea 393) y `resolved["source_mode"]` (línea 392). Añadir claves
en `resolve_prediction` las publica **sin editar `views.py`** ⇒ el archivo con más superficie de
riesgo del backend queda intacto.

Único cambio necesario en `views.py`: **ninguno**. Se documenta explícitamente porque el plan base lo
listaba como "quizá".

### 5.2 Envelope de éxito (forma final)

```json
{
  "context": "ai",
  "contract_version": "v1",
  "operation": "plant_diagnosis",
  "source_mode": "cloud",
  "prediction": {
    "prediction_code": "plant_condition.binary.unhealthy",
    "prediction_label": "Condicion no saludable detectada",
    "plant_species": "unknown",
    "condition_name": "unhealthy",
    "condition_group": "binary_condition",
    "health_state": "warning",
    "severity": "undetermined",
    "recommended_action": "Validar manualmente la muestra. El modelo actual solo clasifica condicion binaria enferma/sana y no identifica enfermedad especifica.",
    "confidence": 0.9987,
    "model_id": "plant_disease_classifier",
    "model_version": "plant_disease_mbv2",
    "semantic_contract_version": "v1",
    "scientific_scope": "binary_only",

    "model_status": "HISTORICO",
    "model_sha256": "77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0",
    "artifact_id": "plant_disease_mbv2@77b0efec",
    "class_space": 2,
    "class_labels": ["enferma", "sana"],
    "superseded_by": "M2_efficientnet_b0_001"
  },
  "trace": {
    "provider": "fastapi_ai_service",
    "raw_diagnosis": "class_0",
    "raw_class_index": 0,
    "processing_time": "0.31s",
    "upstream_status": "ok",
    "upstream_detail": null,
    "model_file": "plant_disease_mbv2.h5",
    "inference_executed": true,
    "inference_origin": "local_container"
  }
}
```

`contract_version` sigue en `v1`: **todo es aditivo**, ningún consumidor existente se rompe (los
tests del resolver solo exigen un subconjunto de claves, `test_semantic_prediction_resolver.py:64`).

### 5.3 Matriz de degradación

| Caso | HTTP | `source_mode` | `prediction.model_status` | `trace.inference_executed` |
|---|---|---|---|---|
| Éxito | 200 | `cloud` | `HISTORICO` | `true` |
| `/infer` → `status:"error"` (sin `error`) | 200 | `fallback` | procedencia real + cross-check | `false` |
| `/infer` inalcanzable / excepción (adapter) | 502 | `fallback` | **ausente** (hay `error`) | — |
| `ai_service` viejo (sin campos nuevos) | 200 | `cloud` | `NO_DECLARADO` | derivado (§3.5) |

**Regla:** en 502 no se inventa `model_status` — el `error` ya es la declaración. En 200-degradado
**sí** viene, porque la UI va a pintar una tarjeta y necesita decir por qué.

### 5.4 N10 — `source_mode: "cloud"` (no se toca aquí)

`semantic_prediction_resolver.py:116` devuelve `"cloud"` para toda inferencia exitosa; el modelo
corre en el contenedor local (`ai_service`, TF CPU). Es factualmente falso.

**No se corrige en L-1..L-6:** cambiar el enum rompe `contract_version: v1` por un adjetivo.
Se resuelve aditivamente con `trace.inference_origin: "local_container"` y la UI deja de narrar
`source_mode` como origen (§6.4). Corrección del enum → **B-9** (junto al bump a `contract v2` de
AI-R4).

---

## 6. Punto 5 — Voice Assistant

Hay **dos canales distintos**. Confundirlos es el error que produce R3.

### 6.1 Canal A — narración del resultado (`speechSynthesis`)

No es el asistente. Es el navegador leyendo la inferencia, y está **duplicado**:

| Archivo | Línea | Hoy | Propuesto |
|---|---|---|---|
| `AIPredictiva.jsx` | `190-192` | `info.mode === 'real' ? 'Inferencia real finalizada.' : label` | prefijo por `inferenceExecuted` + `modelStatus` |
| `ModelPredictCell.jsx` | `53` | `` `Inferencia real finalizada. ${built.disease}…` `` | mismo prefijo, sin literal |

**Función única compartida** (vive en `AIPredictiva.jsx`, ya es el módulo del que `ModelPredictCell`
importa en `:6`; así no se crea un tercer origen):

```javascript
// PROPUESTA — NO APLICADA (L-3a) · exportar junto a buildInfoFromOfficialResponse
export const buildNarrationPrefix = (info) => {
  if (!info?.inferenceExecuted) return 'Modo degradado: no se ejecutó el modelo.';
  if (info.modelStatus === 'HISTORICO') {
    return 'Inferencia ejecutada con modelo histórico binario. No identifica enfermedad específica.';
  }
  if (info.modelStatus === 'CANONICO') return 'Inferencia ejecutada con el modelo canónico.';
  return 'Inferencia ejecutada. Procedencia del modelo no declarada.';
};
```

Tabla de render:

| `inference_executed` | `model_status` | Prefijo hablado |
|---|---|---|
| `false` | cualquiera | `Modo degradado: no se ejecutó el modelo.` |
| `true` | `HISTORICO` | `Inferencia ejecutada con modelo histórico binario. No identifica enfermedad específica.` |
| `true` | `CANONICO` | `Inferencia ejecutada con el modelo canónico.` |
| `true` | otro | `Inferencia ejecutada. Procedencia del modelo no declarada.` |

**La palabra "real" desaparece de toda narración de inferencia.** Se conserva solo como nombre de la
**ruta** que elige el usuario (`ANALYSIS_MODES.real`), y se recomienda renombrar el botón (**D-L3**).

### 6.2 Canal B — asistente conversacional (`/assist`)

**No usa el modelo de plantas.** Es STT + `gTTS` + Postgres opcional (`fastapi_app.py:291-390`).
Lo correcto ya está; lo que falta es **declarar el fallo**:

| Requisito | Hoy | Acción |
|---|---|---|
| No mencionar el modelo de plantas | ✅ | — |
| No decir "inferencia real" | ✅ | — |
| Fallo visible al usuario | ❌ solo `console.error` (`VoiceAssistant.jsx:97`, `:100`, `:178`, `:181`) | **L-4b** |

```javascript
// PROPUESTA — NO APLICADA (L-4) · en el hook useAiVoiceAssist
const [error, setError] = useState(null);
// ...antes de fetch:  setError(null);
// ...si !response.ok:  setError('Asistente de voz no disponible (HTTP ' + response.status + ').');
// ...catch:            setError('Asistente de voz no disponible: sin conexión con el servicio.');
// ...return { isListening, isProcessing, error, toggle: ... }
```

Render en `AcpCell.jsx` (consumidor real del hook, `AcpCell.jsx:6`):

```jsx
// PROPUESTA — NO APLICADA (L-4c) · junto al botón Voz (AcpCell.jsx:50)
{voice.error && (
  <span className="text-[10px] font-semibold" style={{ color: NEON.alert }}>{voice.error}</span>
)}
```

Hoy el usuario aprieta, no pasa nada y no hay explicación: es una **pérdida silenciosa**, el mismo
patrón que N2/N9 penalizan en el canal de datos.

**B-10 (backlog, fuera de L-1..L-6):** `/assist` devuelve **solo MP3**, sin transcripción ⇒ un canal
que habla y no deja texto **no es auditable**. Propuesta futura `?format=json` → `{transcript,
response_text, audio_b64}`. No entra: cambia el contrato de `/assist`.

### 6.3 Lo que NO se toca del canal B

`getUserMedia`, selección de MIME, `MediaRecorder`, `audio.play()`, `resolveEndpoint`, el botón
flotante y la lógica de `/assist` en `fastapi_app.py`. Solo se añade un estado de error visible.

---

## 7. Punto 6 — `AIPredictiva.jsx`

### 7.1 Cambio conceptual previo

Hoy **una** variable hace **dos** trabajos: `mode` = "qué ruta eligió el usuario" **y** "qué pasó
realmente". `mode: 'real'` (`:142`) significa lo primero y se narra como lo segundo. Se separan:

| Eje | Campo | Quién lo decide | Se usa en |
|---|---|---|---|
| Ruta elegida | `analysisMode` (ya existe, `:183`) | el usuario | selector de botones, `speakResult` |
| Lo que ocurrió | `provenance` + `modelStatus` + `inferenceExecuted` (nuevos) | la respuesta | badge, tarjeta, trazabilidad |

`mode` **se conserva** (lo leen `:185` y `:190`): quitarlo rompería dos sitios. Se añade, no se
sustituye.

### 7.2 Los 7 sitios de edición, uno por uno

| # | Línea | Hoy | Propuesto |
|---|---|---|---|
| 1 | `:142` | `mode: 'real',` | `mode: 'real',` (**se queda**) + `provenance: data?.source_mode \|\| 'unknown'`, `modelStatus: prediction?.model_status \|\| 'NO_DECLARADO'`, `modelSha256: prediction?.model_sha256 \|\| null`, `artifactId: prediction?.artifact_id \|\| null`, `classSpace: prediction?.class_space ?? null`, `classLabels: prediction?.class_labels \|\| []`, `supersededBy: prediction?.superseded_by \|\| null`, `inferenceExecuted: trace?.inference_executed === true` |
| 2 | `:123-127` | `getModePresentation` **cae a `real`** con cualquier valor (fail-open) | añadir `degraded` y `desconocido`; el `return` final pasa a `label: 'NO DETERMINADO'`, clase gris. **Fail-closed** |
| 3 | `:187-200` | `info.mode === 'real' ? 'Inferencia real finalizada.'` | `buildNarrationPrefix(info)` (§6.1) |
| 4 | `:460-463` | 2 badges (estado clínico + modo) | **3er badge de procedencia** dentro del mismo `div` |
| 5 | `:466-481` | barra "CERTEZA DEL MODELO" 99.9 % | nota fija bajo la barra (§7.4) |
| 6 | `:516-558` | panel trazabilidad (9 campos) | + `model_status`, `artifact_id`, `class_space`, `model_sha256` (12 chars + `title` con el hash completo) |
| 7 | `:571` | `Seleccione inferencia real, simulacion o robot demo…` | `Seleccione análisis con modelo, simulación o robot demo…` |

**No se toca:** `:6` `ANALYSIS_MODES` (salvo D-L3), `:183` estado, `:219-228` `activateMode`,
`:230-271` `handleUpload`, `:273-313` simulación, `:333` cabecera (N11 → B-11), `:441-491` estructura
de la tarjeta.

### 7.3 Badge de procedencia — tabla de render

Prioridad **primero** `inferenceExecuted`, **después** `model_status`:

| Condición | Texto del badge | Color | `title` |
|---|---|---|---|
| `inferenceExecuted === false` | `SIN INFERENCIA · MODO DEGRADADO` | ámbar | "No se ejecutó el modelo. El resultado no proviene de inferencia." |
| `HISTORICO` | `MODELO HISTÓRICO · BINARIO · SIN HOLDOUT` | ámbar | "Artefacto declarado histórico; no es el modelo canónico." |
| `CANONICO` | `MODELO CANÓNICO` | cian | — |
| `NO_DECLARADO` | `PROCEDENCIA NO DECLARADA` | **rojo** | "El artefacto servido no consta en el registro. No se afirma su estado." |
| `INCONSISTENTE` | `PROCEDENCIA INCONSISTENTE` | **rojo** | motivo del desajuste de `class_space` |
| `NO_DISPONIBLE` | `MODELO NO DISPONIBLE` | gris | "El resultado no proviene de inferencia." |

**Regla dura:** el badge va en la **tarjeta principal** (`:441-491`), no solo en el panel técnico
(`:516-558`). Un dato que solo aparece en "Trazabilidad" es un dato que el usuario no lee, y C-2
exige visibilidad real.

### 7.4 Nota de la barra de confianza (G-3b)

```
Confianza por imagen (softmax). NO es precisión validada: sin holdout de campo (G-3b).
```

Debe ir **debajo de la barra**, no en el panel de trazabilidad: es la corrección de R1 (normalización)
y de R5 (99 % citado como precisión). `holdout/real_world_holdout_v1` está vacío ⇒ no se puede
afirmar precisión.

De paso: la etiqueta `CERTEZA DEL MODELO` es ambigua. Se propone `CONFIANZA POR IMAGEN` (cosmético,
mismo sitio, reversible).

### 7.5 `ModelPredictCell.jsx` (CMSC) — obligatorio, no opcional

`ModelPredictCell.jsx:6` importa `buildInfoFromOfficialResponse`; como los campos se definen **dentro**
de esa función, los datos llegan solos. El **render** hay que añadirlo:

| Línea | Hoy | Propuesto |
|---|---|---|
| `:53` | `` `Inferencia real finalizada. ${built.disease}…` `` | `` `${buildNarrationPrefix(built)} ${built.disease}. ${built.recommendation}` `` |
| `:72` | `operar inferencia real · S61` | `inferencia declarada · S61` |
| `:113-125` | sin badge de procedencia | añadirlo junto a `presentation.badgeLabel`, misma tabla §7.3 |
| `:134-136` | `… · {info.modelVersion} · {info.sourceMode}` | + `· {info.modelStatus}` (fuente de verdad de procedencia) |

Sin esto, `/dashboard-cmsc` (la vista insignia) seguiría narrando "real" mientras `/ai-predictive` ya
sería honesta. **Divergencia de honestidad entre dos vistas del mismo dato = peor que no tener badge.**

---

## 8. Punto 7 — Rollback

### 8.1 Principio

> El rollback **no depende de git**. `docs/` ya tiene 5 untracked; un `git checkout` a ciegas o un
> `git clean` podría borrar trabajo no versionado. Antes de tocar nada se copia, nunca se mueve.

### 8.2 Secuencia (paso 0, antes de la primera edición)

```powershell
$bk = ".local_backups\L1_L6_20261030"
New-Item -ItemType Directory -Force -Path $bk | Out-Null
Copy-Item src\ai_models\fastapi_app.py $bk\
Copy-Item src\backend\infrastructure\external\ai_service\semantic_prediction_resolver.py $bk\
Copy-Item src\frontend\src\pages\AIPredictiva.jsx $bk\
Copy-Item src\frontend\src\pages\cmsc\ModelPredictCell.jsx $bk\
Copy-Item src\frontend\src\components\VoiceAssistant.jsx $bk\
Copy-Item src\frontend\src\pages\cmsc\AcpCell.jsx $bk\
Copy-Item docs\ai\manifests\model_registry.agriculture_v2.yaml $bk\
Copy-Item docs\DEPLOYMENT.md $bk\DEPLOYMENT.md.orig
```

`.local_backups/` está excluido por `.git/info/exclude` (verificado) ⇒ **no** ensucia `git status`.

### 8.3 Restauración

| Nivel | Acción | Efecto |
|---|---|---|
| **R-A (quirúrgico)** | `Copy-Item $bk\<archivo> <ruta original> -Force` | vuelve al byte exacto de hoy |
| **R-B (git)** | `git checkout -- <6 archivos>` (solo los tracked) | idem, si los backups se perdieran |
| **R-C (nuevos)** | `Remove-Item src\ai_models\model_identity.py, src\ai_models\test_model_identity.py` | los 2 archivos nuevos desaparecen; nada más los referencia |
| **R-D (parcial)** | revertir solo L-3a/L-3b y dejar L-1/L-2 | el backend emite campos que la UI ignora: **estado válido y seguro** (degradación limpia) |

**Orden inverso recomendado:** L-4c → L-4 → L-3b → L-3a → L-6 → L-2 → L-1c → L-1b/1a.

### 8.4 Prohibiciones de rollback

- ❌ `git reset --hard` · `git clean -fd` · `git stash` (el `stash@{0}` `PRE_MULTI_AGENT_2026_09_29` es intocable).
- ❌ Borrar o mover archivos del dataset/reference/benchmark.
- ❌ `docker compose down -v` (destruye `postgres_data`).
- ❌ Tocar `docs/L1_L6_RUNTIME_DISCLOSURE_PLAN.md`, los 3 informes previos ni `STAGE_FREEZE_20261013.txt`.

### 8.5 Reversibilidad de estado en caliente

Los cambios no persisten datos nuevos: no hay migración, ni tabla, ni archivo de features. El único
estado es la **caché de identidad en memoria** de `ai_service` ⇒ se descarta reiniciando ese
contenedor (o esperando a que cambie `mtime`). `data/logs/infer_log.jsonl` gana 6 claves por línea
**a partir del cambio**; las líneas viejas siguen siendo legibles (aditivo, no versionado).

---

## 9. Punto 8 — Validaciones

### 9.1 Bloque A — estáticas, ejecutables **hoy** (Docker apagado)

| ID | Qué | Comando | Esperado |
|---|---|---|---|
| **V-1** | Sintaxis Python del módulo nuevo | `python -m py_compile src\ai_models\model_identity.py` | exit 0 |
| **V-2** | Sintaxis del endpoint | `python -m py_compile src\ai_models\fastapi_app.py` | exit 0 |
| **V-3** | **Lógica de identidad contra el artefacto real** | `cd src\ai_models; python -m unittest test_model_identity -v` | 6/6 OK — incluye `sha256 == 77b0efec…19c0`, `class_space == 2`, `status == HISTORICO`, y los 3 casos negativos (hash desconocido → `NO_DECLARADO`; `class_space` 3 → `INCONSISTENTE`; sin archivos → `NO_DISPONIBLE`) |
| **V-4** | Env del resolver (sin Django) | `python -m py_compile src\backend\...\semantic_prediction_resolver.py` | exit 0 |
| **V-5** | Build del frontend | `cd src\frontend; npm run build` | exit 0 (`node_modules` presente, verificado) |
| **V-6** | 0 literales de narración | `Select-String -Path src\frontend\src -Include *.jsx -Recurse -Pattern "Inferencia real finalizada"` | **0 resultados** |
| **V-7** | 0 fail-open de modo | inspección de `getModePresentation` | `return` final = `NO DETERMINADO` |
| **V-8** | Campos presentes en el envelope (grep) | `model_status`, `model_sha256`, `artifact_id`, `class_space` en resolver y JSX | 4/4 en ambos lados |
| **V-9** | `HISTORICO` no es default en ningún `if` | grep `HISTORICO` | solo en `KNOWN_ARTIFACTS` y en las tablas de render, **nunca** en un `else`/`??`/`\|\|` |

**V-3 es la validación fuerte de hoy:** prueba el núcleo (hash → estado → cross-check) sin FastAPI,
sin TensorFlow y sin Docker, porque `model_identity.py` es stdlib puro. Es exactamente lo que X-2
exigía.

### 9.2 Bloque B — runtime, **diferidas** (requieren Docker encendido)

| ID | Qué | Esperado |
|---|---|---|
| **V-10** | `curl -s localhost:8081/health` | 200 · `model_status=HISTORICO` · `model_sha256=77b0efec…` · `class_space=2` · `identity_source=sha256_registry` |
| **V-11** | `POST /infer` con imagen real | `model_sha256` + `class_space:2` + `inference_executed:true` + `status:"ok"` |
| **V-12** | `POST /api/v3/ai/inference/` | `prediction.model_status=HISTORICO` · `trace.inference_origin=local_container` |
| **V-13** | `docker compose ps` tras 30 s | `ai_service` **healthy** con los 5 estados posibles (no se cae por procedencia) |
| **V-14** | Fallback: `docker compose stop ai_service` + inferir | 502 con `error` (no `model_status` inventado); UI muestra error, no badge histórico |
| **V-15** | `pytest src/backend/tests/test_semantic_prediction_resolver.py -v` | verde (solo exige subconjunto) |
| **V-16** | `python src/ai_models/test_model_identity.py` dentro del contenedor | mismo resultado que V-3 (hash idéntico en imagen) |
| **V-17** | Capturas | `/ai-predictive` y `/dashboard-cmsc`: badge de procedencia **visible sin abrir Trazabilidad**, idéntico en ambas |
| **V-18** | Regresión de voz | narración dice "modelo histórico binario", **nunca** "inferencia real" |
| **V-19** | `docker compose config` | válido, sin cambios (no se tocó compose) |

**Ninguna de V-10..V-19 puede declararse "OK" sin ejecutarse.** Si Docker sigue apagado, el estado
honesto del entregable es **"ejecutado, pendiente de verificación en runtime"**, no "terminado".

### 9.3 Criterios de aceptación (AC-L1..AC-L14)

| ID | Criterio | Bloque |
|---|---|---|
| AC-L1 | `/health` expone las 13 claves nuevas con valores correctos | B |
| AC-L2 | `model_sha256` == `77b0efec…19c0` (casefold) | A+B |
| AC-L3 | `class_space` == 2 **y** coincide con `model_metadata.json` **y** con `output_shape[-1]` | A+B |
| AC-L4 | Envelope de éxito con `prediction.model_status=HISTORICO` | B |
| AC-L5 | **Fallback ⇒ `trace.inference_executed=false`** y la UI dice "Modo degradado" (no se miente sobre el artefacto) | B |
| AC-L6 | 0 cadenas "Inferencia real finalizada" en `src/frontend/src` | **A** |
| AC-L7 | Badge de procedencia visible en la tarjeta principal | B |
| AC-L8 | `ModelPredictCell` muestra el mismo badge que `AIPredictiva` | B |
| AC-L9 | `/health` responde **200** en los 5 estados de procedencia | B |
| AC-L10 | `model_registry` sin `artifact_sha256: null`, sin "degenerado", sin contradicción de `serving` | **A** (lectura del YAML) |
| AC-L11 | `expires_on` presente y apunta a `AI-R3+R4` | **A** |
| AC-L12 | Suite del backend verde | B (necesita Django) |
| AC-L13 | **`KNOWN_ARTIFACTS` sha == `artifact_sha256` del YAML** (anti-deriva, R-L10) | **A** |
| AC-L14 | `model_identity.py` no importa nada fuera de stdlib | **A** |

**AC-L5 cambia respecto al plan base** (allí decía "`model_status` ≠ HISTORICO"): se corrige por
D-L4 — el artefacto **sigue** siendo histórico aunque la petición falle; lo que cambia es
`inference_executed`. Mantener el criterio anterior habría forzado una etiqueta falsa.

---

## 10. Orden de ejecución y guardrails

### 10.1 Secuencia

```
0.  Backup (§8.2) + decisión D-L1, D-L1b, D-L2, D-L3, D-L4
1.  L-1a  model_identity.py            (stdlib puro)
2.  L-1b  test_model_identity.py       → V-1, V-3 (validación HOY, sin Docker)
3.  L-1c  fastapi_app.py               → V-2
4.  L-2   resolver                     → V-4
5.  L-3a  AIPredictiva.jsx             ─┐
6.  L-3b  ModelPredictCell.jsx         ├─ V-5, V-6, V-7, V-8, V-9
7.  L-4   VoiceAssistant.jsx           │
8.  L-4c  AcpCell.jsx                  ─┘
9.  L-6   model_registry.agriculture_v2.yaml  → AC-L10, L-11, L-13
10. L-5   DEPLOYMENT.md  (junto con O-3, evita editar dos veces)
11. AC-L1..AC-L14  (bloque A hoy · bloque B con Docker)
```

### 10.2 Guardrails no negociables (si uno cae, la clasificación cae)

| ID | Guardrail | Verificación |
|---|---|---|
| **G-EX-1** | `/health` devuelve **200** en los 5 estados | AC-L9 |
| **G-EX-2** | `model_status` se deriva **del hash**, jamás del nombre ni de una constante | V-9 + revisión del diff |
| **G-EX-3** | `source_mode` **no** cambia (`cloud`/`fallback`/`mock` intactos) | diff del resolver |
| **G-EX-4** | S74 `estado` **no** cambia (solo `nota`, si D-L1b = a) | diff de `signalCatalog.js` |
| **G-EX-5** | Cero cambios en `views.py`, `fastapi_ai_adapter.py`, `docker-compose.yml`, `Dockerfile`, `requirements.txt` | `git status` de esos archivos |
| **G-EX-6** | Cero ML: no se entrena, no se reexporta, no se mueve el `.h5` ni el `.onnx` | `git status` + hash del `.h5` sin cambios |

### 10.3 Riesgos residuales

| ID | Riesgo | Sev. | Estado |
|---|---|---|---|
| **R-L1** | `.h5` nuevo hereda etiqueta literal | 🔴 | **cerrado** por hash + `NO_DECLARADO` |
| **R-L2** | `/health` 5xx tumba el frontend | 🔴 | **cerrado** por G-EX-1 |
| **R-L10** | Deriva código (`KNOWN_ARTIFACTS`) ↔ YAML | 🟠 | mitigado con AC-L13; residual aceptado |
| **R-L11** | `class_space` coincide pero etiquetas no | 🟠 | limitación declarada (§3.4) |
| **R-L12** | `model_metadata.json` del contenedor ≠ del repo | 🟡 | mismo `COPY . .`; V-16 lo detecta |
| **R-L13** | `model_mtime` cambia con cada rebuild de imagen | 🟡 | solo informativo; nunca se usa como identidad |
| **R-L14** | Se declara "hecho" sin V-10..V-19 | 🟠 | §9.2: el estado honesto es "pendiente de runtime" |
| **R-EXEC-1** | Activar M2 (16 clases) con resolver binario mislabela `class_1` como "sana" | 🔴 | **fuera de alcance**; `model_status` lo haría visible (`NO_DECLARADO` ≠ `HISTORICO`), no lo resuelve |

---

## 11. Clasificación final

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ENTREGABLE: L1_L6_EXECUTION_PLAN                                            │
│                                                                              │
│  CLASIFICACIÓN:   SAFE_TO_EXECUTE                                            │
│                                                                              │
│  Justificación:  6 cambios aditivos · 2 archivos nuevos (1 módulo stdlib     │
│                  puro + 1 test) · 0 migraciones · 0 dependencias nuevas ·    │
│                  0 cambios de comportamiento de inferencia ·               │
│                  rollback por copia de bytes (§8) · reversibilidad estructural│
│                                                                              │
│  CONDICIONADO A: G-EX-1..G-EX-6 (§10.2) + D-L1, D-L1b, D-L2, D-L3, D-L4      │
│                                                                              │
│  VERIFICABLE HOY (sin Docker):  V-1..V-9, AC-L2/L3(parcial)/L6/L10/L11/L13/L14│
│  DIFERIDO A RUNTIME:            V-10..V-19, AC-L1/L4/L5/L7/L8/L9/L12         │
│                                                                              │
│  SI D-L2 = 503  →  NOT_SAFE_TO_EXECUTE  (rompe el arranque del frontend)      │
│  SI se toca source_mode o S74  →  fuera de misión, no ejecutable aquí         │
└──────────────────────────────────────────────────────────────────────────────┘
```

### En una frase

El plan es `SAFE_TO_EXECUTE` porque **toda la verdad nueva nace de los bytes del artefacto** (hash →
`KNOWN_ARTIFACTS` → `model_status` → badge), la lógica vive en un módulo stdlib puro que se puede
probar **hoy** contra el `.h5` real sin Django, sin TensorFlow y sin Docker, y ningún cambio puede
empeorar el sistema si se detiene a la mitad (L-1/L-2 sin L-3 dejan campos que la UI ignora, que es un
estado válido). Lo que **no** es seguro es llamarlo terminado antes de V-10..V-19: la mitad de los AC
exigen contenedor, y decir "listo" sin ellos sería exactamente el atajo que este documento prohíbe.

**Sin implementación · sin cambios de código · sin commits · sin push · sin OCI · sin MEMORY.**
