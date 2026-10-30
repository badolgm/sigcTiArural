# L1_L6_RUNTIME_DISCLOSURE_PLAN

**Misión:** `L1_L6_HISTORICAL_RUNTIME_DISCLOSURE_PLAN`
**Fecha:** 2026-10-30
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `d930a34`
**Árbol:** limpio salvo 3 informes untracked de esta misma cadena + `STAGE_FREEZE_20261013.txt`
**Modo:** SOLO PLAN. **Cero** código modificado, cero commits, cero push.

---

## 0. Veredicto en una línea

> **`READY_FOR_L1_L6`** — el plan es ejecutable: los 3 puntos de cambio están localizados con precisión de línea, el artefacto está identificado por bytes, y las dependencias están resueltas.
> **Condicionado a 4 decisiones declarativas de Bernardo (§12)**, ninguna de las cuales requiere investigación nueva.
> **L-1..L-6 cierra la mitad de honestidad de `DOCKER_READY_CONDITIONAL` (C-1..C-4). NO cierra la declaración**: siguen faltando O-2, O-3, O-4 y O-5 (§11).

---

## 1. Método y evidencia anclada

Todo lo que sigue está verificado en disco hoy, no en memoria:

| Hecho | Evidencia |
|---|---|
| `.h5` servido = 9 431 432 B · SHA-256 `77B0EFEC…19C0` | `Get-FileHash` sobre `src/ai_models/production_models/plant_disease_mbv2.h5` |
| Metadata del artefacto | `model_metadata.json` → `{"classes":["enferma","sana"],"framework":"tensorflow_fixed"}` |
| `/health` devuelve 4 claves, sin identidad | `fastapi_app.py:199-207` |
| Selección de modelo = **el `.h5` más reciente por mtime** | `fastapi_app.py:171-185` (`max(files, key=...st_mtime)`) |
| `/infer` devuelve `model` = solo el nombre del archivo | `fastapi_app.py:241-248` |
| Resolver fija `scientific_scope:"binary_only"` y `contract v1` como **constantes** | `semantic_prediction_resolver.py:73-74` |
| `source_mode` de un `/infer` exitoso = **`"cloud"`** | `semantic_prediction_resolver.py:116` |
| Envelope V3 usa ese valor tal cual | `views.py:382-402` |
| `mode: 'real'` hardcodeado | `AIPredictiva.jsx:142` |
| Voz dice *"Inferencia real finalizada"* en **dos** sitios | `AIPredictiva.jsx:190-191` · `ModelPredictCell.jsx:53` |
| `getModePresentation` cae a `real` con **cualquier** valor desconocido | `AIPredictiva.jsx:123-127` |
| CMSC declara el modelo `ROTO` y "colapsa a class_0" | `signalCatalog.js:53` (S74) |
| El registro canónico **ya** lo declara `HISTORICAL`, pero con `artifact_sha256: null` y nota "degenerado" obsoleta | `docs/ai/manifests/model_registry.agriculture_v2.yaml:115-125` |
| `/health` se sondea cada **10 s** por el healthcheck de compose | `docker-compose.yml:85-90` |
| Tests del resolver solo exigen **subconjunto** de claves | `src/backend/tests/test_semantic_prediction_resolver.py:64` |

**Consecuencia de método:** el problema no es "faltan campos". Es que **el sistema ya tiene el dato en la documentación y no lo tiene en ejecución**, y en dos puntos **se contradice a sí mismo**.

---

## 2. Hallazgo estructural (lo que hace que este plan no sea trivial)

`load_latest_model()` (`fastapi_app.py:174-176`) carga **el `.h5` más reciente** de `production_models/`. Es decir:

> **Cualquier archivo `.h5` que se deje caer en esa carpeta se sirve automáticamente, sin revisión.**

Si `model_status = "HISTORICO"` se escribe como **string literal**, entonces:

1. Se copia M2 (o cualquier `.h5` nuevo) a `production_models/`.
2. Se reinicia `ai_service`.
3. El servicio carga el nuevo artefacto **y sigue diciendo `HISTORICO`**.

Eso no es un etiquetado: es una **etiqueta que miente sola**. Sería peor que hoy, porque hoy al menos no afirma nada.

**Principio de diseño que gobierna L-1..L-6:**

> **La identidad se deriva de los bytes, la etiqueta se deriva de la identidad, y el default es fail-closed (`NO_DECLARADO`).**

Corolario operativo: **`HISTORICO` nunca es un valor por defecto en ningún punto de la cadena.** Si falta el dato, se declara ignorancia, no historia.

---

## 3. Punto 1 — Cambios mínimos para declarar `model_status = HISTORICO`

### 3.1 Enum cerrado (vocabulario único)

| Valor | Significado | Quién lo ve |
|---|---|---|
| `HISTORICO` | Artefacto declarado histórico y registrado por hash; se sirve por autorización `D-serve` | UI + `/health` + envelope |
| `CANONICO` | Artefacto canónico declarado (hoy: **ninguno**) | idem |
| `NO_DECLARADO` | Archivo presente pero su hash no está en el registro | idem |
| `INCONSISTENTE` | Hash declarado pero `class_space` no coincide con el grafo/metadata | idem |
| `NO_DISPONIBLE` | No hay archivo cargable | idem |

**Nunca se expone un valor fuera de esta lista.** Cualquier valor desconocido que llegue de fuera se normaliza a `NO_DECLARADO` (fail-closed también en backend, §3.4).

### 3.2 Registro de procedencia por hash (el núcleo del plan)

Se propone añadir en `fastapi_app.py`, en la sección TensorFlow (tras la línea 169), un bloque de ~20 líneas:

```python
# PROPUESTA — NO APLICADA (L-1)
import hashlib

MODEL_PROVENANCE = {
    "77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0": {
        "model_status": "HISTORICO",
        "scientific_scope": "binary_only",
        "class_space": 2,
        "declared_in": "docs/ai/manifests/model_registry.agriculture_v2.yaml",
        "declared_at": "2026-10-30",
        "superseded_by": "M2_efficientnet_b0_001",
        "reason": "clasificador binario enferma/sana; sin holdout de campo (G-3b); no identifica especie ni enfermedad",
    },
}

model_identity = {
    "model_file": None, "model_sha256": None, "model_bytes": None,
    "model_status": "NO_DISPONIBLE", "scientific_scope": "unknown",
    "class_space": None, "class_labels": [], "identity_source": "none",
}
```

**Detalles que no son cosméticos:**

- **Hash en minúsculas** al emitir (el registro canónico usa MAYÚSCULAS en M2: comparar `casefold()`).
- **Streaming**, no `read_bytes()`: leer en bloques de 1 MiB evita cargar 9,4 MB por gusto.
- **Caché por `(name, size, mtime)`**: con healthcheck cada 10 s (`docker-compose.yml:87`), re-hashear en cada sondeo es IO y CPU regalados.
- **Independiente de TensorFlow**: la identidad debe calcularse aunque TF no esté disponible. Reportar *qué archivo hay* no depende de *poder cargarlo*. Si se anida dentro del `try` de TF, el modo degradado pierde la única información útil.

### 3.3 `refresh_model_identity()` — identidad derivada, no declarada

```
files = (*MODELS_DIR.glob("*.h5"), *MODELS_DIR.glob("*.keras"))
si no hay → model_status = NO_DISPONIBLE
latest = max(files, key=mtime)                    # misma regla que hoy
sha256 = hash_sha256_stream(latest)
declarado = MODEL_PROVENANCE.get(sha256)

model_status  = declarado.model_status  si declarado  sino "NO_DECLARADO"
scope         = declarado.scientific_scope si declarado sino "unknown"
class_space   = declarado.class_space     si declarado sino metadata_count o None
identity_source = "sha256_registry" | "sha256_only" | "none"

# cross-check (barato, alto valor)
output_dim = model.output_shape[-1]  (si model cargado)
si declarado y (class_space != metadata_count or class_space != output_dim):
    model_status = "INCONSISTENTE"
```

El **cross-check de tres fuentes** (hash declarado ↔ `model_metadata.json` ↔ `model.output_shape`) es lo que convierte el etiquetado en verificable. Sin él, `class_space: 2` es otro string que puede mentir.

### 3.4 Defensa en el backend (fail-closed, no fail-open)

En `semantic_prediction_resolver.py:69-75`, añadir al `update`:

```python
# PROPUESTA — NO APLICADA (L-2)
"model_status": self._normalize_model_status(raw_result.get("model_status")),
"model_sha256": self._normalize_sha256(raw_result.get("model_sha256")),
"class_space": self._normalize_class_space(raw_result.get("class_space")),
```

con

```python
_ALLOWED_MODEL_STATUS = ("HISTORICO", "CANONICO", "NO_DECLARADO", "INCONSISTENTE", "NO_DISPONIBLE")
# cualquier otro valor (incluido None, "", "OK", "historico") → "NO_DECLARADO"
```

**Por qué importa:** si mañana se despliega un `ai_service` viejo (sin L-1) contra un backend nuevo, el backend **no inventa historia**: dice `NO_DECLARADO`. La honestidad no depende de que ambos lados se actualicen a la vez.

### 3.5 Diff mínimo consolidado

| Archivo | Líneas | Cambio | Líneas netas |
|---|---|---|---|
| `src/ai_models/fastapi_app.py` | tras `:169` | `MODEL_PROVENANCE` + `model_identity` + `refresh_model_identity()` | +~45 |
| `src/ai_models/fastapi_app.py` | `:185` | llamar `refresh_model_identity()` junto a `load_latest_model()` | +1 |
| `src/ai_models/fastapi_app.py` | `:199-207` | añadir 7 campos a `/health` | +7 |
| `src/ai_models/fastapi_app.py` | `:241-248` | añadir `model_sha256`, `model_status`, `scientific_scope`, `class_space` a la respuesta de `/infer` | +4 |
| `src/backend/.../semantic_prediction_resolver.py` | `:69-75` + 3 helpers | 3 campos + normalizadores | +~20 |
| **Total** | | **2 archivos, 0 migraciones, 0 dependencias nuevas** | **≈77** |

**No se toca:** `/assist`, `preprocess_image`, `ConversationMemory`, `get_latest_sensor_data_pg`, `MODELS_DIR`, `Dockerfile`, `requirements.txt`. **Cero ML, cero reentrenamiento, cero cambio de comportamiento de inferencia.**

---

## 4. Punto 2 — Qué endpoint expone qué

| Campo | `/health` (8081) | `/infer` (8081) | `/api/v3/ai/inference/` | Origen |
|---|---|---|---|---|
| `model_status` | ✅ | ✅ | ✅ (`prediction`) | registro por hash |
| `model_sha256` | ✅ | ✅ | ✅ (`prediction`) | hash de bytes |
| `model_bytes` | ✅ | — | — | `stat` |
| `model_file` | ✅ (`model_loaded`, ya existe) | ✅ (`model`, ya existe) | ✅ (`trace.model_file`, nuevo) | `stat` |
| `artifact_id` | — | — | ✅ (`model_file@sha256[:8]`) | derivado |
| `scientific_scope` | ✅ | ✅ | ✅ (ya existe en `prediction`) | registro |
| `class_space` | ✅ | ✅ | ✅ | registro + cross-check |
| `class_labels` | — | ✅ (opcional L-2c) | ✅ (opcional) | `model_metadata.json` |
| `identity_source` | ✅ | — | — | derivado |
| `superseded_by` | ✅ | — | ✅ (`prediction`, opcional) | registro |
| `inference_origin` | — | — | ✅ (`trace`, nuevo) | constante `local_container` |

**Regla:** el envelope V3 es la **única** superficie que consume el frontend. Si el campo no está ahí, la UI no puede mostrarlo sin un salto extra a `:8081` (que en Docker va por nginx y no está expuesto como `/health` proxeado — solo `/assist` lo está: `src/frontend/Dockerfile`).

> **Nota operativa importante:** nginx solo proxea `/api/` y `location = /assist`. **`/health` de `:8081` no es alcanzable desde el navegador en producción.** Por eso `model_status` **debe** viajar en el envelope, no solo en `/health`. `/health` sirve para auditoría de máquina (curl interno, healthcheck, forense), no para la UI.

---

## 5. Punto 3 — Contrato exacto de `/health`

### 5.1 Respuesta propuesta (aditiva; las 4 claves actuales se conservan)

```json
{
  "status": "ok",
  "tensorflow": true,
  "voice": true,
  "model_loaded": "plant_disease_mbv2.h5",

  "model_status": "HISTORICO",
  "model_sha256": "77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0",
  "model_bytes": 9431432,
  "scientific_scope": "binary_only",
  "class_space": 2,
  "identity_source": "sha256_registry",
  "declared_in": "docs/ai/manifests/model_registry.agriculture_v2.yaml",
  "superseded_by": "M2_efficientnet_b0_001",
  "semantic_contract_version": "v1"
}
```

### 5.2 Códigos de estado — decisión crítica

| Situación | HTTP | Cuerpo |
|---|---|---|
| Modelo histórico declarado | **200** | `model_status: HISTORICO` |
| Hash no declarado | **200** | `model_status: NO_DECLARADO` |
| Inconsistencia de `class_space` | **200** | `model_status: INCONSISTENTE` |
| Sin modelo cargable | **200** | `model_status: NO_DISPONIBLE` |
| Proceso roto de verdad | 5xx | (como hoy) |

**`/health` NO debe devolver 5xx por estado de procedencia.** Razón verificable:

- `docker-compose.yml:86` → healthcheck ejecuta `urlopen(...).status==200`; un 503 **lanza excepción** ⇒ contenedor `unhealthy`.
- `frontend` tiene `depends_on: ai_service: condition: service_healthy`.
- Resultado: declarar `NO_DECLARADO` con 503 **impediría arrancar el frontend**.

Es decir: convertir una etiqueta de gobernanza en un fallo de *liveness* **apagaría el producto** para señalar un problema documental. La alarma correcta es el **valor del campo**, no el código HTTP. Si se quiere alarma operativa, va en un endpoint aparte (`/health/deep`) y **fuera** del healthcheck de compose.

> **Este punto es una decisión de Bernardo (D-L2)** porque cambia el modelo de alarma operativa.

---

## 6. Punto 4 — Contrato exacto de `/api/v3/ai/inference/`

### 6.1 Envelope propuesto (éxito)

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
    "model_sha256": "77b0efec…19c0",
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
    "inference_origin": "local_container"
  }
}
```

### 6.2 Envelope en degradación

| Caso | HTTP | `source_mode` | `prediction.model_status` |
|---|---|---|---|
| `/infer` respondió `status:"error"` (sin `error`) | 200 | `fallback` | `NO_DISPONIBLE` (o el que reporte el upstream) |
| `/infer` inalcanzable / excepción | 502 | `fallback` | **ausente** (hay `error`) |
| Sin TF (`model=None`) | 200 | `fallback` | `NO_DISPONIBLE` |

**Regla:** en 502 no se inventa `model_status`; el `error` ya es la declaración. En 200-degradado **sí** debe venir `model_status`, porque la UI va a pintar una tarjeta y necesita decir por qué.

### 6.3 Dos hallazgos que el envelope obliga a nombrar

**N10 — `source_mode: "cloud"` es factualmente falso.**
`semantic_prediction_resolver.py:116` devuelve `"cloud"` para toda inferencia exitosa. Pero el modelo corre **en el contenedor local** (`ai_service` dentro de compose, TF CPU). El único consumidor es la UI (`AIPredictiva.jsx:555`), que hoy imprime literalmente `cloud`.

No se corrige el enum en L-1..L-6 (romper `contract_version: v1` por un adjetivo es desproporcionado). Se resuelve **aditivamente** con `trace.inference_origin: "local_container"`, y la UI **deja de narrar `source_mode` como origen**. Corrección del enum → **B-9**, junto con el bump a `contract v2` de AI-R4.

**N11 — La cabecera de `AIPredictiva` afirma `● SISTEMA ONLINE` de forma estática** (`AIPredictiva.jsx:333`), sin consultar nada. Con el runtime caído sigue diciendo ONLINE. Fuera del mínimo de L-1..L-6; se registra como deuda de honestidad (B-11), y L-3 **no** la agrava (la tarjeta de resultado sí será honesta).

---

## 7. Punto 5 — Qué debe mostrar el Voice Assistant

Hay **dos canales de voz distintos** y confundirlos es el error que produce R3. Este es el punto donde el plan debe ser más quirúrgico:

### 7.1 Canal A — narración de resultados (`AIPredictiva` + `ModelPredictCell`)

No es el asistente: es `speechSynthesis` del navegador leyendo el resultado de la inferencia. **Aquí vive el 100 % del problema R3**, y está duplicado:

| Archivo | Línea | Texto actual | Problema |
|---|---|---|---|
| `AIPredictiva.jsx` | `190-191` | `'Inferencia real finalizada.'` | se emite siempre que `info.mode==='real'`, y `mode` está hardcodeado ⇒ **se emite incluso en fallback** |
| `ModelPredictCell.jsx` | `53` | `Inferencia real finalizada. ${built.disease}…` | literal, sin ninguna condición |

**Contrato de narración propuesto (L-4):**

```
si source_mode ∈ {fallback, mock}         → "Modo degradado: no se ejecutó el modelo."
si ejecutado y model_status = HISTORICO   → "Inferencia ejecutada con modelo histórico binario. No identifica enfermedad específica."
si ejecutado y model_status = CANONICO    → "Inferencia ejecutada con modelo canónico."
si ejecutado y otro estado                → "Inferencia ejecutada. Procedencia del modelo no declarada."
```

**La palabra "real" desaparece de toda narración de inferencia.** Se conserva únicamente como nombre del **selector de ruta** del usuario (`ANALYSIS_MODES.real`), y se recomienda renombrar el botón a `ANÁLISIS CON MODELO` (D-L3) porque hoy la etiqueta `INFERENCIA REAL` es a la vez el botón y la conclusión, y esa ambigüedad es la raíz del bug.

### 7.2 Canal B — asistente conversacional (`VoiceAssistant.jsx` / `useAiVoiceAssist` → `/assist`)

**No usa el modelo de plantas.** Es Google STT + `gTTS` + Postgres opcional (`fastapi_app.py:291-390`). Por tanto:

| Requisito | Estado hoy |
|---|---|
| No mencionar el modelo de plantas | ✅ ya correcto |
| No decir "inferencia real" | ✅ ya correcto (no lo dice) |
| Declarar cuando está degradado | ❌ **no declarado** |
| Fallo visible al usuario | ❌ **solo `console.error`** (`VoiceAssistant.jsx:96`, `:178` del hook) |

**L-4b (mínimo):** cuando `/assist` no responde `ok`, mostrar estado visible (`"Asistente de voz no disponible"`) en lugar de un `console.error` invisible. Hoy el usuario aprieta, no pasa nada, y no hay explicación: eso es una **pérdida silenciosa**, exactamente el patrón que N2/N9 penalizan en el canal de datos.

**B-10 (backlog, no mínimo):** `/assist` devuelve **solo MP3**, sin transcripción. Un canal que habla y no deja texto **no es auditable**: no se puede verificar qué afirmó. Propuesta futura: `?format=json` → `{transcript, response_text, audio_b64}`. No entra en L-1..L-6 porque cambia el contrato de `/assist` (riesgo alto para un beneficio de gobernanza que puede esperar).

---

## 8. Punto 6 — Qué debe mostrar `AIPredictiva.jsx`

### 8.1 Cambio conceptual previo (imprescindible)

Hoy hay **una** variable (`mode`) haciendo **dos** trabajos:

```
mode  =  "qué ruta eligió el usuario"   MEZCLADO CON   "qué pasó realmente"
```

`mode: 'real'` (`:142`) significa "el usuario eligió la ruta real" y se narra como "ocurrió inferencia real". **L-4 los separa en dos ejes:**

| Eje | Campo | Valores | Quién lo decide |
|---|---|---|---|
| Ruta elegida | `analysisMode` (ya existe) | `real` / `simulation` / `robot_demo` | el usuario |
| Lo que ocurrió | `provenance` (nuevo) | `executed` / `degraded` / `simulated` | la respuesta del backend |

`getModePresentation` sigue sirviendo al **selector**; el badge de la tarjeta usa `provenance` + `model_status`.

### 8.2 Los 6 sitios de edición, uno por uno

| # | Línea | Hoy | Propuesto |
|---|---|---|---|
| 1 | `:142` | `mode: 'real'` | `provenance: <de source_mode>`, `modelStatus: prediction.model_status \|\| 'NO_DECLARADO'`, `modelSha256`, `classSpace`, `artifactId` |
| 2 | `:108-127` | `getModePresentation` **cae a `real`** para cualquier valor | añadir `degraded` y `unknown`; el `return` final pasa a **`NO DETERMINADO`** (fail-closed) |
| 3 | `:187-200` | voz: `info.mode === 'real' ? 'Inferencia real finalizada.'` | prefijo según §7.1 |
| 4 | `:456-463` | 2 badges (estado clínico + modo) | **3er badge de procedencia** al lado |
| 5 | `:466-481` | barra "CERTEZA DEL MODELO" 99.9 % | nota fija bajo la barra: *"Confianza por imagen (softmax). NO es precisión validada: sin holdout de campo (G-3b)."* |
| 6 | `:516-558` | panel trazabilidad | añadir `model_status`, `artifact_id`, `class_space`, `model_sha256` (12 chars + `title` completo) |

### 8.3 Badge de procedencia — tabla de render

| `model_status` | Texto del badge | Color | Nota emergente |
|---|---|---|---|
| `HISTORICO` | `MODELO HISTÓRICO · BINARIO · SIN HOLDOUT` | ámbar | "Artefacto declarado histórico; no es el modelo canónico." |
| `CANONICO` | `MODELO CANÓNICO` | cian | — |
| `NO_DECLARADO` | `PROCEDENCIA NO DECLARADA` | **rojo** | "El artefacto servido no consta en el registro. No se afirma su estado." |
| `INCONSISTENTE` | `PROCEDENCIA INCONSISTENTE` | **rojo** | motivo del desajuste de `class_space` |
| `NO_DISPONIBLE` | `MODELO NO DISPONIBLE` | gris | "El resultado no proviene de inferencia." |

**Regla dura:** el badge va en la **tarjeta principal** (`:441-491`), no en el panel técnico (`:516-558`). Un dato que solo aparece en "Trazabilidad" es un dato que el usuario no lee, y C-2 exige visibilidad real.

### 8.4 `ModelPredictCell.jsx` (CMSC) — no opcional

`ModelPredictCell.jsx:6` importa `buildInfoFromOfficialResponse` de `AIPredictiva.jsx`. Como el nuevo `provenance`/`modelStatus` se define **dentro** de esa función, **los datos llegan solos** a la celda del dashboard. Pero el **render** hay que añadirlo:

- `:53` → sustituir el literal "Inferencia real finalizada." por el prefijo de §7.1.
- `:72` → `"operar inferencia real · S61"` → `"inferencia declarada · S61"`.
- `:113-125` → añadir el badge de procedencia junto a `presentation.badgeLabel`.

Sin esto, `/dashboard-cmsc` (la vista insignia) seguiría narrando "real" mientras `/ai-predictive` ya sería honesta. **Divergencia de honestidad entre dos vistas del mismo dato = peor que no tener el badge.**

---

## 9. Qué debe etiquetarse HISTÓRICO — conjunto cerrado

| Artefacto | Etiqueta | Justificación |
|---|---|---|
| `plant_disease_mbv2.h5` (9 431 432 B · `77B0EFEC…19C0`) | **HISTÓRICO** | `H5_CLOSED`; servido por `D-serve`; binario; sin holdout |
| `model_metadata.json` (`["enferma","sana"]`) | **HISTÓRICO** | contrato del artefacto histórico |
| Contrato semántico **v1** (`binary_only`) | **HISTÓRICO** (lo sustituye v2 en AI-R4) | alcance de 2 clases |
| M2 ONNX `benchmark/runs/M2_efficientnet_b0/exports/model.onnx` (16 102 181 B · `4BD657B3…74EC3`) | **NO** — `CHALLENGER CANÓNICO, LISTO, NO SERVIDO` | `M2_RECOVERED` + `AI_R2_COMPLETE` (G-NEW-A PASS) |
| M1 MobileNetV2 | **NO** — `BASELINE OFICIAL, SIN ARTEFACTO` | `M1_PARTIAL`; etiquetarlo histórico sería falso |
| M2 `best.pth` / `last.pth` | **NO** — pesos de entrenamiento del challenger | fuente del ONNX |

**Regla dura:** no se etiqueta histórico lo que es canon. Confundirlos reescribiría `M1_BASELINE_M2_CHALLENGER`.

---

## 10. L-6 — Reparación del registro canónico (no creación)

El informe previo proponía un `deployment_readiness.yaml` nuevo. **Verificado en disco, eso sería duplicar una fuente de verdad.** `docs/ai/manifests/model_registry.agriculture_v2.yaml` **ya declara**:

```yaml
- id: "plant_disease_mbv2_h5"
  role: "historical"
  status: "HISTORICAL"                       # ← ya existe
  scope: "binary_only"                       # ← ya existe
  serving: "currently_served_by_ai_service"  # ← ya existe
  artifact_sha256: null                      # ← FALTA
  notes: "Binario degenerado (doble normalizacion). Historico, no canonico."  # ← OBSOLETO
```

Y contiene **tres inconsistencias verificables**:

| # | Inconsistencia | Evidencia | Impacto |
|---|---|---|---|
| I-1 | `artifact_sha256: null` aunque el artefacto es el único servido | `:121` | sin hash, el registro no puede atar runtime↔canon (C-1) |
| I-2 | Nota **"degenerado (doble normalización)"** contradice el fix de `d930a34` (`fastapi_app.py:188-189`) | `:125` | declarar CONDITIONAL mientras el canon dice "degenerado" es autocontradicción |
| I-3 | `serving_note: "ningun artefacto esta servido"` (`:22`) vs `serving: currently_served_by_ai_service` (`:123`) | mismo archivo | dos afirmaciones opuestas en la misma fuente de verdad |

**Alcance de L-6 (mínimo, 4 ediciones declarativas):**

1. `artifact_sha256: "77B0EFEC…19C0"` + `artifact_bytes: 9431432` + `artifact_mtime: 2026-08-21`.
2. Corregir I-2: `notes` → *"Binario (2 clases). El colapso a class_0 se debía a doble normalización y quedó corregido en `d930a34`. Histórico, no canónico, sin holdout."*
3. Corregir I-3: acotar `serving_note` a *"ningún artefacto **canónico** está servido; el histórico sí, declarado"*.
4. Añadir bloque `conditional_window`: `declared_at`, `owner: Bernardo`, `expires_on: AI-R3+R4 (B-1)`, `revalidate_on: R3/R4/R5`, `forbidden_scopes: [OCI, exposición pública, captura acústica, afirmaciones de precisión]`.

Además, **alineación de vocabulario** (D-L1): el registro usa `HISTORICAL` y el runtime emitirá `HISTORICO`. Unificar a `HISTORICO` con `status_alias: "HISTORICAL"` para no romper lectores existentes. Dos vocabularios para el mismo estado es la semilla de la próxima contradicción.

### 10.1 Contradicción en `signalCatalog.js` (S74) — decisión de canon, no de este plan

`signalCatalog.js:53` declara:

```
S74 · "Modelo productivo degenerado" · estado: ROTO · nota: "colapsa a class_0, descalificado"
```

mientras `S61` (`:43`) declara la inferencia como `REAL`. Hoy el dashboard puede mostrar simultáneamente "la inferencia es REAL" y "el modelo que la produce está ROTO y colapsa". Con el fix de normalización, **"colapsa a class_0" ya es falso**, y la `nota` debe corregirse en L-6.

Pero el **`estado`** no lo decide este plan: el canon tiene 7 estados (`REAL/REAL-LOCAL/SIM/DISENO/ROTO/HUERFANO/REF`) y **no incluye `HISTORICO`**. Introducir un 8º estado es misión de gobernanza (y `AGENTS.md` prohíbe reetiquetar por decreto). Por eso:

> **`model_status` es un eje nuevo (procedencia del artefacto) y NO se fusiona con `estado` (honestidad de la señal).** S74 puede seguir `ROTO` —científicamente descalificado, sin holdout— mientras su artefacto es `HISTORICO` —procedencia declarada—. Son dos verdades simultáneas, no una contradicción, **siempre que la UI muestre ambas**.

Decisión **D-L1b**: ¿se corrige solo `nota` (recomendado, barato) o se revisa también `estado` de S74 (misión de canon aparte)?

---

## 11. ¿Habilita `DOCKER_READY_CONDITIONAL`? — validación pedida

Los 5 criterios de legitimidad definidos en `DOCKER_READY_CONDITIONAL_DECISION_REPORT.md`:

| # | Criterio | Antes | Tras L-1..L-6 | Cómo lo cierra |
|---|---|---|---|---|
| **C-1** | Condición verificable por máquina | ❌ | ✅ | `/health` + `prediction.model_status` + `model_sha256` |
| **C-2** | Visible al usuario final | ⚠️ | ✅ | badge en tarjeta principal (AIPredictiva **y** ModelPredictCell) + nota de confianza |
| **C-3** | Registrada en canon con dueño y fecha | ⚠️ | ✅ | `model_registry` reparado + `conditional_window` con owner/fecha |
| **C-4** | Caducidad y disparador de salida | ❌ | ✅ | `expires_on: AI-R3+R4 (B-1)` en registro **y** en el texto de `/health` |
| **C-5** | No se extiende a OCI ni exposición | ✅ | ✅ | `forbidden_scopes` explícito |

**Resultado: 5/5 en el eje de honestidad.**

> **Pero eso NO declara `DOCKER_READY_CONDITIONAL`.** La declaración exige además:
> **O-2** (G2/G4/G8/G13/G15 verdes) · **O-3** (tag + `DEPLOYMENT.md` + `compose.resolved.yml`) · **O-4** (16 capturas + DevTools) · **O-5** (decisión registry vs OCI).
> Ninguno de esos cuatro es código; los cuatro requieren **Docker encendido** (hoy apagado).

**Fórmula honesta:**

```
L-1..L-6  ⇒  hace la condición DECIBLE
O-2..O-5  ⇒  hacen la declaración VERIFICADA
CONDITIONAL = DECIBLE + VERIFICADA
```

Decirlo antes de O-2..O-5 sería exactamente el atajo narrativo que el informe anterior identificó como riesgo R2.

---

## 12. Decisiones que Bernardo debe tomar antes de ejecutar (4)

| ID | Decisión | Opciones | Recomendación |
|---|---|---|---|
| **D-L1** | Vocabulario: `HISTORICO` (runtime) vs `HISTORICAL` (registro) | (a) unificar a `HISTORICO` con alias · (b) mantener dos | **(a)** |
| **D-L2** | `/health` devuelve **siempre 200** y la alarma es el valor del campo | (a) sí · (b) 503 en `NO_DECLARADO` | **(a)** — con 503 se cae el frontend por `depends_on` |
| **D-L3** | Renombrar el botón `INFERENCIA REAL` → `ANÁLISIS CON MODELO` | (a) sí · (b) mantener | **(a)** — es la raíz de R3 |
| **D-L1b** | S74: ¿solo `nota` o también `estado`? | (a) nota + `model_status` separado · (b) revisar estado en misión de canon | **(a)** — no reetiquetar por decreto |

Ninguna requiere investigación: son elecciones de política. Por eso la clasificación es `READY`.

---

## 13. Riesgos del plan

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| **R-L1** | `load_latest_model()` sirve el `.h5` más reciente ⇒ un artefacto nuevo hereda la etiqueta | 🔴 | registro por hash + default `NO_DECLARADO` + cross-check de 3 fuentes (§3) |
| **R-L2** | `/health` con 5xx por procedencia ⇒ `frontend` no arranca (`depends_on: service_healthy`) | 🔴 | D-L2: 200 siempre |
| **R-L3** | Re-hashear 9,4 MB cada 10 s | 🟡 | caché por `(name,size,mtime)`; hashing en streaming |
| **R-L4** | `getModePresentation` fail-open: un valor desconocido pinta `INFERENCIA REAL` | 🟠 | invertir el default a `NO DETERMINADO` |
| **R-L5** | Se etiqueta `HISTORICO` y se olvida la caducidad | 🟠 | `expires_on` en registro **y** en `/health` |
| **R-L6** | Divergencia AIPredictiva vs ModelPredictCell | 🟠 | ambos consumen `buildInfoFromOfficialResponse`; ambos deben renderizar |
| **R-L7** | Declarar CONDITIONAL con el canon diciendo "degenerado" | 🟠 | L-6 corrige I-2 antes de declarar |
| **R-L8** | Se cree que L-1..L-6 "cierra Docker" | 🟡 | §11: fórmula DECIBLE ≠ VERIFICADA |
| **R-L9** | `source_mode: "cloud"` se lee como origen real | 🟡 | `trace.inference_origin` aditivo; no narrar `source_mode` como origen |

---

## 14. Criterios de aceptación verificables

| ID | Criterio | Verificación |
|---|---|---|
| AC-L1 | `/health` expone los 8 campos nuevos con valores correctos | `curl :8081/health` |
| AC-L2 | `model_sha256` == `77B0EFEC…19C0` | comparación casefold |
| AC-L3 | `class_space` == 2 y coincide con `model_metadata.json` y `output_shape[-1]` | AC-L1 + inspección |
| AC-L4 | `GET /api/v3/ai/inference/` (éxito) contiene `prediction.model_status = "HISTORICO"` | curl con imagen |
| AC-L5 | Fallback forzado ⇒ `model_status` ≠ `HISTORICO` **y** voz dice "Modo degradado" | detener `ai_service` parcial / simular `status:"error"` |
| AC-L6 | Ninguna cadena de la UI dice "inferencia real" al narrar un resultado | `grep -ri "inferencia real"` sobre `src/frontend/src` → 0 en narración |
| AC-L7 | Badge de procedencia visible **sin** abrir el panel de trazabilidad | captura de la tarjeta principal |
| AC-L8 | `ModelPredictCell` muestra el mismo badge que `AIPredictiva` | captura `/dashboard-cmsc` |
| AC-L9 | `/health` responde **200** en los 5 estados de procedencia | test paramétrico |
| AC-L10 | `model_registry` sin `artifact_sha256: null`, sin "degenerado", sin contradicción de `serving` | lectura del YAML |
| AC-L11 | `expires_on` presente y apunta a B-1 | lectura del YAML |
| AC-L12 | Suite del backend sigue verde (resolver: solo subconjunto de claves) | `pytest src/backend/tests/test_semantic_prediction_resolver.py` |

---

## 15. Lo que L-1..L-6 NO es y NO toca

**No es:** un arreglo de precisión · un reentrenamiento · una validación científica · un cierre de `F5` por ejecución de ONNX · un permiso para OCI · una autorización de captura acústica.

**No toca:** `/assist`, `ConversationMemory`, `get_latest_sensor_data_pg`, `preprocess_image`, `MODELS_DIR`, `MODEL_PROVENANCE` de M1/M2, `contract_version` v1, `splits`, dataset acústico, `stereo/schema.json` 1.3.0, `stash@{0}`, S30, MMC, Knowledge Hub, benchmark.

**Dependencias externas:** `L-5` debe aterrizar dentro de la reescritura de `docs/DEPLOYMENT.md` (hoy 61 líneas, 21/08/2026, obsoleta), que es **F2/O-3**. Si O-3 se ejecuta antes, L-5 se limita a redactar las 3 declaraciones; si se ejecuta después, hay que editar dos veces. **Orden recomendado: L-5 y O-3 en la misma sesión documental.**

---

## 16. Orden de ejecución propuesto

```
1. D-L1, D-L1b, D-L2, D-L3            (decisiones, 0 código)
2. L-1  fastapi_app.py  identidad+ /health       ─┐
3. L-2  resolver        modelo_status/scope      ├─ 1 sola sesión de código
4. L-3a AIPredictiva    badge + nota confianza   │  (mismo PR lógico)
5. L-3b ModelPredictCell narración + badge      ─┘
6. L-4  voz (2 canales) + default fail-closed
7. L-6  model_registry reparado + conditional_window
8. L-5  DEPLOYMENT.md  (junto con O-3)  →  3 declaraciones + frontera del bridge
9. AC-L1..AC-L12
10. O-2 / O-4 (requieren Docker encendido)  →  O-5  →  declarar CONDITIONAL
```

**Estimación honesta:** 3 archivos de código (1 de ellos con 2 sitios) + 1 componente CMSC + 2 documentos + 1 YAML. Ninguna migración, ninguna dependencia nueva, ningún rebuild costoso más allá del normal.

---

## 17. Clasificación final

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ENTREGABLE: L1_L6_RUNTIME_DISCLOSURE_PLAN                                   │
│                                                                              │
│  CLASIFICACIÓN:   READY_FOR_L1_L6                                            │
│                   (condicionado a D-L1, D-L1b, D-L2, D-L3 — 4 decisiones     │
│                    declarativas, sin investigación pendiente)                │
│                                                                              │
│  HALLAZGOS NUEVOS:                                                           │
│    N10  source_mode="cloud" es falso (corre local)            → trace.origin │
│    N11  cabecera "SISTEMA ONLINE" estática                    → B-11         │
│    I-1..I-3  model_registry: sha null, "degenerado", serving contradictorio  │
│         → L-6 las corrige                                                    │
│    S74 "colapsa a class_0" ya es falso tras d930a34           → L-6 nota      │
│                                                                              │
│  L-1..L-6  ⇒  C-1..C-5 = 5/5  ⇒  CONDICIÓN DECIBLE                           │
│  O-2..O-5  ⇒                  ⇒  DECLARACIÓN VERIFICADA                      │
│  CONDITIONAL = DECIBLE + VERIFICADA   (falta la segunda mitad)                │
└──────────────────────────────────────────────────────────────────────────────┘
```

**En una frase:** el problema no es que falten campos, es que **la etiqueta tiene que nacer del hash del artefacto y no de una constante**, porque el servicio carga automáticamente el `.h5` más reciente de `production_models/` — y con un string literal esa etiqueta mentiría en el primer cambio de archivo. Con identidad por bytes, default fail-closed y `class_space` cruzado en tres fuentes, `model_status = HISTORICO` se vuelve verificable; entonces `DOCKER_READY_CONDITIONAL` pasa a ser *decible*, y solo O-2/O-3/O-4/O-5 lo vuelven *declarable*.

**Sin implementación · sin cambios de código · sin commits · sin push · sin OCI · sin MEMORY.**
