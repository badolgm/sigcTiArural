# Debug Session: ai-model-loader

Status: OPEN

## Objetivo

Corregir exclusivamente la carga del modelo TensorFlow en `src/ai_models/fastapi_app.py`.

## Hipotesis

1. `MODELS_DIR` apunta a una ruta distinta de la que Docker usa para copiar `production_models`.
2. `find_repo_root()` construye un root valido para repo local, pero no para el layout final dentro del contenedor.
3. `model_loaded = null` ocurre porque `load_latest_model()` no encuentra archivos `.h5` o `.keras`.
4. Corrigiendo solo el path de `MODELS_DIR`, `/health` debe exponer el nombre real del modelo.
5. Si el modelo carga bien, `/infer` debe dejar de responder con `model: "mock"`.
