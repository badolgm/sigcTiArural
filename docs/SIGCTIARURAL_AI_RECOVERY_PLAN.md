# SIGCTiArural — Plan de Recuperación de IA (AI-RECOVERY)

Estado: **DISEÑO / PLAN OPERATIVO** · Fecha: 2026-09-20 · Rama: `feature/ubtn-biological-telemetry`
Origen: `SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` (auditoría completa 2026-09-20).
Regla: **NO implementar nada aquí** — este documento prioriza y ordena qué hacer, no lo ejecuta.
Convención semántica: todo estado queda etiquetado `REAL` / `REFERENCIA` / `SIMULACIÓN` / `DISEÑO` (invariante EIARC).

---

## 0. Punto de partida (resumen del diagnóstico)

1. **Pipeline de 3 capas real pero no desplegado**: Frontend React → Django v3 (`/api/v3/ai/inference/`) → FastAPI+TensorFlow (`/infer` → `plant_disease_mbv2.h5`).
2. **Contenedores caídos** (2026-09-20): `sigctiarural_backend` (8010) y `sigctiarural_ai_service` (8081) están `Exited (255) 3 días`; solo corren `postgres`, `mysql` y Vite dev (5173).
3. **Modelo degenerado**: `plant_disease_mbv2.h5` colapsa a `class_0` (confianza 0.9876–0.9954 incluso en no-planta); `class_1` inalcanzable → **no es recuperable como ciencia**, solo como plataforma de demostración.
4. **Lo que es REAL**: código y arquitectura (commits `565ad2e`, `57a40c4`, v3). **Lo que es SIMULACIÓN**: modos `SIMULACIÓN`/`ROBOT DEMO` y el badge "SISTEMA ONLINE" estático.

**Estrategia del plan**: dos frentes paralelos y con cronología distinta.
- **A. Reactivación (horas)**: levantar el stack, validar modelo, probar inferencia end-to-end, delimitar simulación. **Recupera operatividad, no ciencia.**
- **B. Investigación (meses)**: Dataset V2 → benchmark multiclase → reemplazo del binario → utilidad científica. **Recupera valor científico.**

---

## 1. Cómo levantar backend IA

### 1.1 Orden de arranque (con `docker compose`, contexto raíz)
```bash
# 0) Verificar que el .env tiene las 16 variables requeridas (DB_NAME/DB_USER/DB_PASSWORD/POSTGRES_PORT/
#    BACKEND_PORT/AI_PORT/FRONTEND_PORT/VITE_* /DJANGO_DEBUG/SECRET_KEY/ALLOWED_HOSTS/CORS_ALLOWED_ORIGINS)
#    — verificado: .env raíz YA está completo.

# 1) Levantar base de datos primero (healthcheck de postgres desbloquea backend)
docker compose up -d db

# 2) Levantar el microservicio de IA (FastAPI + TensorFlow), puerto 8081
docker compose up -d --build ai_service

# 3) Levantar el backend Django (REST v3), puerto 8010
docker compose up -d --build backend

# 4) Frontend: elegir entre contenedor (5173) o dev Vite (ya escuchando en 5173)
#    Opción A: docker compose up -d --build frontend
#    Opción B (recomendada mientras se depura): seguir usando Vite dev actual,
#    que ya tiene proxy /api → http://localhost:8010 (vite.config.js)
```

### 1.2 Verificación de arranque
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String sigctiarural
# Esperado: postgres Up(healthy) · backend Up(8010->8000) · ai_service Up(8081->8081) · frontend Up(5173->80)
```

### 1.3 Condición de éxito
`Invoke-WebRequest http://localhost:8010/api/v3/ai/inference/ -Method POST` responde (400 por `file` faltante = ruta viva),
y `http://localhost:8081/health` responde `{"status":"ok","tensorflow":true,"model_loaded":"plant_disease_mbv2.h5"}`.

### 1.4 Riesgos
| Riesgo | Mitigación |
|---|---|
| Build pesado (TF en `ai_service`) | Usar `docker compose up -d --build ai_service` con timeout amplio; tag quema caché |
| Conflicto de puerto 8081/8010 ocupados | `Get-NetTCPConnection -LocalPort 8081,8010`; si el proceso no es el stack, ajustar `AI_PORT`/`BACKEND_PORT` |
| Postgres no inicia sin `.env` | `.env` ya contiene las variables; verificar `DB_HOST=db` dentro de la red compose |

---

## 2. Cómo verificar TensorFlow

### 2.1 En el contenedor de IA (verificación canónica)
```bash
# Health endpoint (semántico)
http://localhost:8081/health
# → {"status":"ok","tensorflow":true,"voice":true,"model_loaded":"plant_disease_mbv2.h5"}

# Directo en el contenedor
docker exec sigctiarural_ai_service python -c "import tensorflow as tf; print(tf.__version__); print(tf.config.list_physical_devices('GPU'))"
# Esperado: 2.x (tensorflow-cpu>=2.15.0). Sin GPU = CPU únicamente (aceptable para inferencia 224×224).
```

### 2.2 Qué significa cada estado
| Valor | Implicación |
|---|---|
| `tensorflow: true` + `model_loaded` poblado | TF OK y modelo cargado → inferencia real posible |
| `tensorflow: true` + `model_loaded: null` | TF OK pero `MODELS_DIR` sin `.h5`/`.keras` (volumen o build incompleto) |
| `tensorflow: false` | `tensorflow-cpu` no instaló en el contenedor → `/infer` entra en MOCK (`diagnosis: unknown, confidence 0`) |

### 2.3 Verificación de import en backend
TensorFlow **no debe** existir en Django (`src/backend/requirements.txt` no lo lista — verificado). Si alguien lo agregó,
quitarse de ese requirements: el volumen de carga vive en `src/ai_models` (servicio separado).

---

## 3. Cómo validar plant_disease_mbv2.h5

### 3.1 Validación de integridad (REAL, minutos)
```bash
$f = Get-Item src/ai_models/production_models/plant_disease_mbv2.h5
# Esperado: 9.431.432 bytes · mtime 2026-08-21 (verificado en auditoría)
# Registrar SHA256 antes de cualquier copia/build para trazabilidad del artefacto
Get-FileHash src/ai_models/production_models/plant_disease_mbv2.h5 -Algorithm SHA256
```

### 3.2 Validación funcional (REAL, con stack arriba)
```bash
# POST una imagen real al microservicio directo (evita Django en esta prueba)
Invoke-WebRequest -Uri http://localhost:8081/infer -Method Post -Form @{ file = Get-Item src/ai_models/test_leaf.jpg } 
# Esperado (según auditoría previa): {"diagnosis":"class_0","confidence":0.9953,"class_index":0,"model":"plant_disease_mbv2.h5","status":"ok"}
```

### 3.3 Reproducción del diagnóstico de colapso (VALIDACIÓN CIENTÍFICA, no corrección)
Repetir la prueba empírica de `AI_PREDICTION_VALIDATION_AUDIT.md §3.2` con **3 entradas control**:
`test_leaf.jpg` (hoja) · imagen sólida roja sintética · imagen ajedrezada no vegetal.
- Resultado esperado (documentado): las tres → `class_0` con 0.9953/0.9954/0.9876.
- **Objetivo**: dejar constancia reproducida del estado degenerado (baseline negativo) antes de reemplazar el modelo.
- **Regla EIARC**: este comportamiento debe publicarse como `scientific_scope: binary_only` + estado degenerado,
  jamás como diagnóstico taxonómico (la UI ya lo degrada a "Condición no saludable detectada").

### 3.4 Revisión de metadata
`src/ai_models/production_models/model_metadata.json` = `{"classes":["enferma","sana"],"framework":"tensorflow_fixed"}`.
- Confirma que el espacio real es binario (2 clases). **No sobrescribe**: es fiel al artefacto actual.
- En el futuro multiclase, este archivo (o su versión v2) alimentará `SemanticPredictionResolver` dinámicamente
  (TODO ya marcado en `semantic_prediction_resolver.py:88-92`).

---

## 4. Cómo probar inferencia real

### 4.1 Pruebas por capa (orden ascendente)
| # | Capa | Comando/URL | Resultado esperado |
|---|---|---|---|
| 1 | **FastAPI directo** | `POST http://localhost:8081/infer` (multipart `file=test_leaf.jpg`) | `class_0`, conf>0.9, `model: plant_disease_mbv2.h5` |
| 2 | **Django v3 (contrato)** | `POST http://localhost:8010/api/v3/ai/inference/` (multipart `file`, `client_context=aipredictiva`) | JSON `{context:ai, contract_version:v1, source_mode, prediction, trace}` |
| 3 | **Frontend (Vite 5173)** | Pagina /ai-predictive → INFERENCIA REAL → cargar `test_leaf.jpg` → EJECUTAR ANÁLISIS | Panel de diagnóstico con `source_mode` real y trazabilidad |

### 4.2 Validación del contrato v3 (Django)
La respuesta de la capa 2 debe incluir:
- `prediction.prediction_code` ∈ {`plant_condition.binary.unhealthy`, `…….healthy`, `…….unknown`}
- `prediction.scientific_scope: binary_only`, `semantic_contract_version: v1`
- `trace.raw_diagnosis`, `trace.raw_class_index`, `trace.upstream_status`
- `source_mode`: `cloud` (modelo real OK) o `fallback` (solo si error upstream)
- **No debe devolver enfermedad específica**: el resolver actual no publica taxonomía no soportada (corrección EIARC vigente).

### 4.3 Prueba con el binario colapsado: qué se espera observar
Toda imagen (planta o no) → `class_0` / "Condición no saludable detectada" con confianza alta.
**Esto NO es un fallo de despliegue**: es el comportamiento real del artefacto. Debe documentarse como tal en la
prueba (ver §3.3) y comunicarse como límite científico vigente.

---

## 5. Cómo desactivar simulación cuando sea necesario

### 5.1 Qué es (honestidad)
Los modos `SIMULACIÓN` y `ROBOT DEMO` viven en el frontend (`AIPredictiva.jsx:273-313`): un `useEffect` que, cuando
`analysisMode !== 'real'`, cicla `DEMO_SCENARIOS` (con `model_version: demo-simulator`) sin backend.

### 5.2 Desactivación operativa (sin tocar código)
- **Por defecto ya está desactivada**: `useState('real')` inicializa en `INFERENCIA REAL`; solo se activa al pulsar
  `INICIAR SIMULACIÓN` / `INICIAR ROBOT DEMO`. Para desactivarla → pulsar `DETENER …` (vuelve a `real`) o recargar la página.
- **Para excluirla de un flujo científico**: no incluirla en pruebas §4; los resultados científicos deben provenir
  exclusivamente de la capa 2/3 con `source_mode` no-simulado.

### 5.3 Desactivación por configuración (futuro, sin implementar ahora)
Opciones que el plan podrá ejercer cuando se decida:
1. Ocultar los dos botones detrás de un flag de entorno (p.ej. `VITE_ENABLE_AI_DEMO_MODES=false`).
2. Eliminar el `useEffect` auto-ciclo y hacer los modos demo manuales (una imagen → un resultado).
3. (Recomendado) Mantener visible pero etiquetado `SIMULACIÓN`/`DEMO` con banner persistente, preservando la transparencia.
**Regla suprema**: NADA DESAPARECE. Si se oculta por configuración, la ruta debe quedar documentada y recuperable.

---

## 6. Cómo pasar a Dataset V2

Ruta ya diseñada en 3 documentos canónicos (en orden de ejecución): `DATASET_V2_INVENTORY.md` → `DATASET_V2_EXECUTION_PLAN.md` → `DATASET_V2_MASTERPLAN.md`.

### 6.1 Fase 0 — Adquisición física (REAL, requiere provisiones de Bernardo)
Checklist de referencia: `SIGCTIARURAL_DATASET_V2_INVENTORY.md` (pasos 1-11, dependientes de credencial Kaggle/mirror).
- Runtime objetivo: `agriculture_images_tomato-potato-corn` v1 → 21.160 imág. RGB / 16 clases / 3 especies (tomate/melanzana/Maíz).
- Guardas previas: ruta canónica inexistente, sin `.kaggle`, sin backups → **descargar PlantVillage `raw/color` (~1–2 GB) es el primer bloqueante físico**.
- Escribir `docs/ai/manifests/raw_source_manifest.agriculture_v2_dataset_v1.yaml` con SHA256 real de cada artefacto.

### 6.2 Fase 1-3 — Materialización (según EXECUTION_PLAN)
1. **RAW**: copiar `raw/color` a `v1/RAW/` manteniendo estructura original.
2. **Curation**: limpieza de duplicados + pHash (manifest `curation_manifest…`).
3. **Taxonomía/Labels**: aplicar `taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml` (16 clases) y schema v1.
4. **Split**: 70/15/15, seed 42, `stratified_group_split` (manifest `split_manifest.agriculture_v2_split_v1.yaml`).
5. **Holdout real (campo)**: apartar `real_world_holdout` para validación futura (GO de investigación, NO-GO de campo).

### 6.3 Puerta GO/NO-GO
- **GO (laboratorio)**: dataset materializado + split + checksums + al menos 1 benchmark aprobado (macro-F1 + ECE).
- **NO-GO (campo/producción)**: hasta validación in situ + dataset propio. Mantener el flag `source_mode` honesto.

---

## 7. Cómo llegar a un modelo multiclase

### 7.1 Objetivo científico
Reemplazar el binario colapsado por un clasificador **16-clases** entrenado sobre Dataset V2 con validación estricta.

### 7.2 Benchmark definido (manifest real vigente: `baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml`)
| Arquitectura | Rol |
|---|---|
| EfficientNet-B0 | baseline master candidate |
| MobileNetV3-Large | baseline edge candidate (export TFLite float16/int8) |
| ResNet50 | classic control |
| ConvNeXt-Tiny | experimental ceiling |

**Política de entrenamiento**: 224×224, transfer learning, balanceo por weighted loss / class-balanced sampling /
minority-augmented sampling. **Evaluación**: macro-F1 (primaria); balanced accuracy, per-class recall/precision,
matrices de confusión; curvas ROC one-vs-rest, PR por clase, calibración; **ECE** como puerta de calibración.
**Artefactos esperados** (definidos en manifest): benchmark_report.md, calibration_report.md, error_analysis_report.md,
model_cards/, confusion_matrices/, curves/{roc,pr,calibration}/.

### 7.3 Camino incremental hasta multiclase (para no duplicar esfuerzo)
1. **Correr baseline sobre split V2** (4 arquitecturas, métricas del manifest).
2. Seleccionar mejor modelo por **macro-F1 sobre validación** + ECE aceptable.
3. **Fine-tune + calibración** (temperatura/Platt) hasta ECE < umbral definido.
4. **Export edge** (ModelMobileNetV3 → TFLite float16/int8) para BBB eventual (BBB-02 TinyML post-U7 — ver UBTN).
5. **Model card** por artefacto + rellenar `model_metadata.json` v2 → `SemanticPredictionResolver` deja de ser data-driven
   manual y lee metadata real (resuelve el TODO de `semantic_prediction_resolver.py:88-92`).
6. **Reemplazo del binario**: nueva versión en `production_models/`, mantener el `.h5` colapsado como
   baseline negativo histórico (NADA DESAPARECE).

---

## 8. Qué tareas deben hacerse en orden (backlog priorizado)

| # | Prioridad | Tarea | Salida | Rol requerido |
|---|---|---|---|---|
| T1 | P0 (hoy) | Verificar estado Docker y levantar `db` + `ai_service` | Contenedor IA arriba | Bernardo/ops |
| T2 | P0 (hoy) | Levantar `backend` Django (8010) y verificar ruta v3 | Ruta viva (400 por `file` ausente) | Bernardo/ops |
| T3 | P0 | `GET /health` → confirmar `tensorflow:true` + `model_loaded` | Diagnóstico TF real | IA asistida |
| T4 | P0 | Validar integridad + reproducir colapso (3 entradas control) | Baseline negativo documentado | IA asistida |
| T5 | P1 | Probar inferencia real por capas (§4.1: 1→2→3) | Evidencia end-to-end real | IA asistida |
| T6 | P1 | Delimitar simulación (modos demo + badge estático §5) | Inventario de simulación delimitado | IA asistida |
| T7 | P1 | Fase 0 Dataset V2 (adquisición raw, Fase 0) | `v1/RAW/` con SHA256 | **Bernardo (credencial Kaggle/mirror)** |
| T8 | P2 | Materializar Dataset V2 (curation→taxonomía→split→holdout) | `v1/` completo + manifestsChecksums | IA asistida |
| T9 | P2 | Benchmark 4 arquitecturas sobre split V2 | `benchmark_report.md` + métricas | IA asistida (GPU/lab) |
| T10 | P3 | Selección modelo + calibración (ECE) + fine-tune | Modelo multiclase calibrado | IA asistida (lab) |
| T11 | P3 | Export TFLite (float16/int8) + model cards | Artefactos edge | IA asistida |
| T12 | P3 | Reemplazo binario → resolver data-driven desde metadata v2 | IA Predictiva V5+ multiclase real | IA asistida |
| T13 | P3 | Prueba de campo con holdout real + dataset propio | **GO de campo eventual** (meses) | Campo/Bernardo |

**Frentes en paralelo**: A (T1–T6, horas, recupera operatividad) y B (T7–T13, meses, recupera ciencia). T7 depende de
Bernardo (provisión de credencial/mirror); T4 es la única tarea de "ciencia de limpieza" del estado actual.

---

## 9. Reglas de gobernanza a respetar durante la recuperación
- **NO tocar backend/Docker/Telemetry/SensorReading/RobotTelemetry/BBB/Knowledge Hub** salvo misión explícita (AGENTS.md).
  Este plan solo levanta/valida, no reescribe.
- **Honestidad de estado**: toda salida de inferencia conserva `source_mode` (`cloud`/`simulated`/`fallback`/`mock`).
- **NADA DESAPARECE**: el binario colapsado se conserva como baseline negativo histórico; los modos demo se mantienen
  o se documentan si se ocultan.
- **LLM ≠ motor predictivo**: el modelo multiclase es el motor; el LLM permanece como RAG/explicación (AI_CONTEXT_V2 §11.5).
- **Commits**: solo con orden explícita de Bernardo.

---

## 10. Archivos de referencia
- Auditoría origen: `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md`
- Física de datos: `docs/SIGCTIARURAL_DATASET_V2_INVENTORY.md` · Ejecución: `docs/SIGCTIARURAL_DATASET_V2_EXECUTION_PLAN.md`
- Fundamento: `docs/SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` · `docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md`
- Audiciones previas IA: `docs/ai/research_v2/AI_PREDICTION_VALIDATION_AUDIT.md` · `docs/eiarc/02_ARCHITECTURE/AI_PR1_CODE_REVIEW.md`
- Manifests: `docs/ai/manifests/baseline_experiment_manifest.agriculture_v2_baseline_v1.yaml` (+ raw/curation/taxonomy/split)
- Código: `src/ai_models/fastapi_app.py` · `src/backend/api/views.py` · `AIPredictiva.jsx` · `semantic_prediction_resolver.py`
- Infraestructura: `docker-compose.yml` · `src/frontend/vite.config.js` · `.env`
- Contexto/competencia: `AGENTS.md`