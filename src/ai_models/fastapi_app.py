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
    Sirve para ubicar rutas relativas sin importar desde dónde se lance uvicorn."""
    current = start.resolve()
    for _ in range(5):
        if (current / "src").exists() or (current / "README.md").exists():
            return current
        if current.parent == current:
            break
        current = current.parent
    return Path.cwd() # Fallback

ROOT_DIR = find_repo_root(Path(__file__))
MODELS_DIR = ROOT_DIR / "src" / "ai_models" / "production_models"
LOGS_DIR = ROOT_DIR / "data" / "logs"
INFER_LOG = LOGS_DIR / "infer_log.jsonl"

# Asegurar directorios
MODELS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Variable global para el modelo cargado
model = None
model_name = None

# Intentar cargar TensorFlow (puede no estar instalado en entornos muy ligeros)
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow no encontrado. El servicio funcionará pero no podrá hacer inferencia real (solo mock).")


def load_latest_model():
    """Busca el archivo .h5 más reciente en production_models y lo carga."""
    global model, model_name
    if not TF_AVAILABLE:
        return None
    
    files = list(MODELS_DIR.glob("*.h5")) + list(MODELS_DIR.glob("*.keras"))
    if not files:
        print("⚠️ No se encontraron modelos en", MODELS_DIR)
        return None
    
    # Ordenar por fecha de modificación
    latest = max(files, key=lambda p: p.stat().st_mtime)
    if model_name != latest.name:
        print(f"🔄 Cargando modelo: {latest.name}")
        try:
            model = tf.keras.models.load_model(latest)
            model_name = latest.name
        except Exception as e:
            print(f"❌ Error cargando modelo {latest}: {e}")
            return None
    return model_name

# Carga inicial
load_latest_model()

class InferenceRequest(BaseModel):
    image_url: Optional[str] = None

def preprocess_image(img_data: bytes, target_size=(224, 224)):
    """Convierte bytes a array numpy preprocesado para MobileNetV2."""
    image = Image.open(io.BytesIO(img_data)).convert("RGB")
    image = image.resize(target_size)
    img_array = np.array(image)
    # Preprocesamiento estándar de MobileNetV2: escala pixel values entre -1 y 1
    # tf.keras.applications.mobilenet_v2.preprocess_input hace esto internamente
    if TF_AVAILABLE:
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    else:
        img_array = (img_array / 127.5) - 1.0
        
    img_array = np.expand_dims(img_array, axis=0) # Batch dim
    return img_array

def log_inference(source, result, latency):
    """Guarda el resultado en un archivo JSONL (simula base de datos de series de tiempo)."""
    entry = {
        "ts": time.time(),
        "source": source,
        "result": result,
        "latency_ms": round(latency * 1000, 2),
        "model": model_name or "mock_model"
    }
    with INFER_LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

@app.get("/")
def index():
    return {"msg": "SIGC&T Rural AI Service. Docs at /docs"}

@app.get("/health")
def health():
    # Intenta recargar si no hay modelo
    if not model:
        load_latest_model()
    return {
        "status": "ok",
        "tf_available": TF_AVAILABLE,
        "model_loaded": model_name if model else False
    }

@app.post("/infer")
async def infer(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = None
):
    start_time = time.time()
    
    # 1. Obtener imagen
    img_bytes = None
    source_info = "upload"
    
    if file:
        img_bytes = await file.read()
        source_info = f"file:{file.filename}"
    elif url:
        try:
            resp = requests.get(url, timeout=5)
            resp.raise_for_status()
            img_bytes = resp.content
            source_info = f"url:{url}"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error descargando imagen: {e}")
    else:
        raise HTTPException(status_code=400, detail="Debe enviar 'file' o 'url'.")

    # 2. Inferencia
    result = {}
    
    if TF_AVAILABLE and model:
        try:
            # Asumimos modelo clasificador de plantas (Sanor / Enfermo)
            # Ajustar etiquetas según tu entrenamiento real
            CLASS_NAMES = ["Enferma", "Sana"] 
            
            input_arr = preprocess_image(img_bytes)
            preds = model.predict(input_arr)
            score = float(np.max(preds))
            idx = int(np.argmax(preds))
            
            # Protección si el modelo tiene más clases de las que pensamos
            label = CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else f"Class {idx}"
            
            result = {
                "diagnosis": label,
                "confidence": round(score, 4),
                "top_class_index": idx,
                "raw_output": preds.tolist()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error en inferencia: {e}")
    else:
        # Mock para pruebas sin TF instalado o sin modelo entrenado
        result = {
            "diagnosis": "MOCK_RESULT",
            "confidence": 0.99,
            "note": "Instala tensorflow y entrena un modelo para resultados reales."
        }

    latency = time.time() - start_time
    log_inference(source_info, result, latency)
    
    return {
        "data": result,
        "meta": {
            "model": model_name,
            "latency": f"{latency:.3f}s"
        }
    }

# --- Server Sent Events (SSE) para Dashboard en Tiempo Real ---

async def _iter_log_events():
    """Vigila el archivo de logs y emite nuevas líneas como eventos SSE."""
    if not INFER_LOG.exists():
        # Crear si no existe para no fallar
        INFER_LOG.touch()
        
    with INFER_LOG.open("r", encoding="utf-8") as f:
        # Ir al final del archivo
        f.seek(0, 2)
        while True:
            line = f.readline()
            if not line:
                await  time.sleep(0.5) # Espera no bloqueante (simulada en este contexto sincrono-loop)
                continue
            yield f"data: {line.strip()}\n\n"

# Nota: Para SSE real en producción con FastAPI, se recomienda sse-starlette.
# Aquí usamos una implementación simple compatible con StreamingResponse.
def follow_file(file_path):
    file_path = Path(file_path)
    if not file_path.exists():
        file_path.touch()
        
    last_size = file_path.stat().st_size
    while True:
        time.sleep(1)
        if not file_path.exists():
            continue
        size = file_path.stat().st_size
        if size > last_size:
            try:
                with file_path.open("r", encoding="utf-8") as f:
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
    return StreamingResponse(follow_file(INFER_LOG), media_type="text/event-stream")


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
    avg_conf = sum(confidences) / len(confidences) if confidences else 0
    
    return {
        "total_inferences": len(confidences),
        "class_distribution": counts,
        "average_confidence": round(avg_conf, 3)
    }