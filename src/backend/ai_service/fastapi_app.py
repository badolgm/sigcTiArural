"""
FastAPI microservicio de inferencia para diagnóstico por imágenes.

Características:
- /health: estado del servicio.
- /models: lista de modelos disponibles en src/ai_models/production_models.
- /infer: recibe image_url o archivo y realiza inferencia con el modelo cargado.
- Registra resultados en data/logs/infer_log.jsonl.

Notas:
- Usa TensorFlow si está disponible (tensorflow-cpu recomendado).
- Si no hay modelo, devuelve 503 con mensaje claro.
- Pensado para ejecutarse en localhost de forma gratuita.
"""

from pathlib import Path
from typing import Optional, List
import json
import io

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import numpy as np
from PIL import Image
import requests
import time

app = FastAPI(title="SIGC&T Rural IA Inference Service", version="0.1.0")

# Permitir CORS para el frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def find_repo_root(start: Path) -> Path:
    """Sube en el árbol hasta encontrar la carpeta 'src' o el archivo README.md.
    Sirve para ubicar rutas relativas dentro del repo.
    """
    cur = start
    for _ in range(6):
        if (cur / "src").exists() or (cur / "README.md").exists():
            return cur
        cur = cur.parent
    return start


REPO_ROOT = find_repo_root(Path(__file__).resolve())
MODELS_DIR = REPO_ROOT / "src" / "ai_models" / "production_models"
LOGS_DIR = REPO_ROOT / "data" / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
INFER_LOG = LOGS_DIR / "infer_log.jsonl"

# Carga perezosa del modelo para ahorrar memoria en arranque
_MODEL = None
_MODEL_NAME = None
_TF_AVAILABLE = False

try:
    import tensorflow as tf  # type: ignore
    _TF_AVAILABLE = True
except Exception:
    _TF_AVAILABLE = False


def list_model_files() -> List[Path]:
    if not MODELS_DIR.exists():
        return []
    exts = [".h5", ".keras", ".tflite"]
    return [p for p in MODELS_DIR.iterdir() if p.is_file() and p.suffix in exts]


def load_default_model():
    global _MODEL, _MODEL_NAME
    if _MODEL is not None:
        return _MODEL
    files = list_model_files()
    if not files:
        return None
    # Priorizar Keras H5/Keras; TFLite requeriría intérprete distinto
    model_path = None
    for p in files:
        if p.suffix in {".h5", ".keras"}:
            model_path = p
            break
    if model_path is None:
        # No hay modelo Keras. Devolver None para que se informe claramente.
        return None
    if not _TF_AVAILABLE:
        return None
    _MODEL = tf.keras.models.load_model(str(model_path))
    _MODEL_NAME = model_path.name
    return _MODEL


def preprocess_image(img: Image.Image, target_size: int = 224) -> np.ndarray:
    img = img.convert("RGB").resize((target_size, target_size))
    arr = np.asarray(img).astype(np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)  # (1, H, W, C)
    return arr


class InferRequest(BaseModel):
    image_url: Optional[str] = None


@app.get("/health")
def health():
    return {
        "status": "ok",
        "tf_available": _TF_AVAILABLE,
        "models_dir": str(MODELS_DIR),
        "available_models": [p.name for p in list_model_files()],
    }


@app.get("/models")
def models():
    files = list_model_files()
    return {"count": len(files), "models": [p.name for p in files]}


def log_event(event: dict):
    try:
        with INFER_LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps(event, ensure_ascii=False) + "\n")
    except Exception:
        pass


@app.post("/infer")
async def infer(req: InferRequest, file: UploadFile = File(None)):
    # Cargar modelo si existe
    model = load_default_model()
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "No se encontró un modelo listo. Coloca un archivo .h5/.keras en "
                f"{MODELS_DIR} o instala TensorFlow CPU para habilitar la inferencia."
            ),
        )

    # Obtener imagen desde URL o archivo
    pil_img = None
    src = None
    if req.image_url:
        try:
            r = requests.get(req.image_url, timeout=20)
            r.raise_for_status()
            pil_img = Image.open(io.BytesIO(r.content))
            src = {"type": "url", "value": req.image_url}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error al descargar imagen: {e}")
    elif file is not None:
        try:
            content = await file.read()
            pil_img = Image.open(io.BytesIO(content))
            src = {"type": "upload", "filename": file.filename}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Archivo inválido: {e}")
    else:
        raise HTTPException(status_code=400, detail="Proporcione image_url o un archivo de imagen.")

    # Preprocesar y predecir
    arr = preprocess_image(pil_img, 224)
    try:
        preds = model.predict(arr)
        # Asumimos salida vectorial con probabilidades por clase
        preds = preds[0].tolist()
        top_idx = int(np.argmax(preds))
        confidence = float(np.max(preds))
        result = {
            "model": _MODEL_NAME,
            "top_class_index": top_idx,
            "confidence": round(confidence, 5),
            "raw": preds,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de predicción: {e}")

    log_event({"source": src, "result": result})
    return {"source": src, "result": result}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

########################################
# Eventos en vivo (SSE) y métricas
########################################

def _iter_log_events(interval: float = 1.0):
    """Generador que emite nuevas líneas del log como eventos SSE.
    Usa polling ligero sobre el tamaño del archivo.
    """
    last_size = INFER_LOG.stat().st_size if INFER_LOG.exists() else 0
    # Al comenzar, emitir últimas 20 líneas si existen
    if INFER_LOG.exists():
        try:
            lines = INFER_LOG.read_text(encoding="utf-8").splitlines()
            for line in lines[-20:]:
                yield f"data: {line}\n\n"
        except Exception:
            pass
    while True:
        time.sleep(interval)
        if not INFER_LOG.exists():
            continue
        size = INFER_LOG.stat().st_size
        if size > last_size:
            try:
                with INFER_LOG.open("r", encoding="utf-8") as f:
                    f.seek(last_size)
                    for line in f:
                        line = line.strip()
                        if line:
                            yield f"data: {line}\n\n"
                last_size = size
            except Exception:
                pass


@app.get("/events")
def events():
    return StreamingResponse(_iter_log_events(), media_type="text/event-stream")


@app.get("/metrics")
def metrics():
    """Agrega métricas simples a partir del log: conteo por clase y promedio de confianza."""
    counts = {}
    confidences = []
    if INFER_LOG.exists():
        try:
            for line in INFER_LOG.read_text(encoding="utf-8").splitlines():
                ev = json.loads(line)
                res = ev.get("result", {})
                idx = str(res.get("top_class_index"))
                conf = res.get("confidence")
                if idx:
                    counts[idx] = counts.get(idx, 0) + 1
                if isinstance(conf, (int, float)):
                    confidences.append(conf)
        except Exception:
            pass
    avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
    return JSONResponse({"class_counts": counts, "avg_confidence": round(avg_conf, 5), "events": len(confidences)})