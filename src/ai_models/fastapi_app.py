"""
FastAPI microservicio de inferencia para diagnóstico por imágenes.

Características:
- /health: estado del servicio.
- /models: lista de modelos disponibles en src/ai_models/production_models.
- /infer: recibe image_url o archivo y realiza inferencia con el modelo cargado.
- Registra resultados en data/logs/infer_log.jsonl.
"""

from pathlib import Path
from typing import Optional
import json
import io
import time
import asyncio

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import numpy as np
from PIL import Image
import requests

# =========================
# App
# =========================

app = FastAPI(
    title="SIGC&T Rural IA Inference Service",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Rutas base
# =========================

def find_repo_root(start: Path) -> Path:
    current = start.resolve()
    for _ in range(6):
        if (current / "src").exists() or (current / "README.md").exists():
            return current
        current = current.parent
    return Path.cwd()

ROOT_DIR = find_repo_root(Path(__file__))
MODELS_DIR = ROOT_DIR / "src" / "ai_models" / "production_models"
LOGS_DIR = ROOT_DIR / "data" / "logs"
INFER_LOG = LOGS_DIR / "infer_log.jsonl"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# =========================
# TensorFlow
# =========================

model = None
model_name = None

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow no disponible. Modo MOCK activado.")

# =========================
# Modelo
# =========================

def load_latest_model():
    global model, model_name

    if not TF_AVAILABLE:
        return None

    files = list(MODELS_DIR.glob("*.h5")) + list(MODELS_DIR.glob("*.keras"))
    if not files:
        print("⚠️ No se encontraron modelos en", MODELS_DIR)
        return None

    latest = max(files, key=lambda p: p.stat().st_mtime)

    if model_name != latest.name:
        print(f"🔄 Cargando modelo: {latest.name}")
        try:
            model = tf.keras.models.load_model(
                latest,
                compile=False  # 🔑 CLAVE PARA PYTHON 3.11 + TF 2.15
            )
            model_name = latest.name
            print("✅ Modelo cargado correctamente")
        except Exception as e:
            print(f"❌ Error cargando modelo {latest}: {e}")
            model = None
            model_name = None

    return model_name

load_latest_model()

# =========================
# Utils
# =========================

def preprocess_image(img_data: bytes, target_size=(224, 224)):
    image = Image.open(io.BytesIO(img_data)).convert("RGB")
    image = image.resize(target_size)
    arr = np.array(image)

    if TF_AVAILABLE:
        arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
    else:
        arr = (arr / 127.5) - 1.0

    return np.expand_dims(arr, axis=0)

def log_inference(source, result, latency):
    entry = {
        "ts": time.time(),
        "source": source,
        "result": result,
        "latency_ms": round(latency * 1000, 2),
        "model": model_name or "mock_model"
    }
    with INFER_LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

# =========================
# API
# =========================

@app.get("/")
def index():
    return {"msg": "SIGC&T Rural AI Service", "docs": "/docs"}

@app.get("/health")
def health():
    if not model:
        load_latest_model()
    return {
        "status": "ok",
        "tensorflow": TF_AVAILABLE,
        "model_loaded": model_name
    }

@app.post("/infer")
async def infer(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = None
):
    start = time.time()

    if file:
        img_bytes = await file.read()
        source = f"file:{file.filename}"
    elif url:
        try:
            r = requests.get(url, timeout=5)
            r.raise_for_status()
            img_bytes = r.content
            source = f"url:{url}"
        except Exception as e:
            raise HTTPException(400, f"Error descargando imagen: {e}")
    else:
        raise HTTPException(400, "Debe enviar 'file' o 'url'")

    if TF_AVAILABLE and model:
        try:
            CLASS_NAMES = ["Enferma", "Sana"]  # ajustable
            arr = preprocess_image(img_bytes)
            preds = model.predict(arr)
            idx = int(np.argmax(preds))
            score = float(np.max(preds))

            result = {
                "diagnosis": CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else f"Class {idx}",
                "confidence": round(score, 4),
                "top_class_index": idx,
                "raw_output": preds.tolist()
            }
        except Exception as e:
            raise HTTPException(500, f"Error en inferencia: {e}")
    else:
        result = {
            "diagnosis": "MOCK_RESULT",
            "confidence": 0.99,
            "note": "TensorFlow o modelo no disponible"
        }

    latency = time.time() - start
    log_inference(source, result, latency)

    return {
        "data": result,
        "meta": {
            "model": model_name,
            "latency": f"{latency:.3f}s"
        }
    }

# =========================
# SSE – Eventos en tiempo real
# =========================

async def follow_file(path: Path):
    path.touch(exist_ok=True)
    last_size = path.stat().st_size

    while True:
        await asyncio.sleep(1)
        size = path.stat().st_size
        if size > last_size:
            with path.open("r", encoding="utf-8") as f:
                f.seek(last_size)
                for line in f:
                    yield f"data: {line.strip()}\n\n"
            last_size = size

@app.get("/events")
def events():
    return StreamingResponse(
        follow_file(INFER_LOG),
        media_type="text/event-stream"
    )

@app.get("/metrics")
def metrics():
    counts = {}
    confidences = []

    if INFER_LOG.exists():
        for line in INFER_LOG.read_text(encoding="utf-8").splitlines():
            ev = json.loads(line)
            res = ev.get("result", {})
            idx = str(res.get("top_class_index"))
            conf = res.get("confidence")

            if idx:
                counts[idx] = counts.get(idx, 0) + 1
            if isinstance(conf, (int, float)):
                confidences.append(conf)

    avg = sum(confidences) / len(confidences) if confidences else 0

    return {
        "total_inferences": len(confidences),
        "class_distribution": counts,
        "average_confidence": round(avg, 3)
    }

# ===================================
# Asistente de Voz (NUEVA SECCIÓN)
# ===================================

try:
    import speech_recognition as sr
    from gtts import gTTS
    from pydub import AudioSegment
    VOICE_AVAILABLE = True
except ImportError:
    VOICE_AVAILABLE = False
    print("⚠️ Librerías de voz no disponibles. El endpoint /assist estará desactivado.")

# Importar el módulo de contexto conversacional
try:
    from .conversation_context import (
        get_conversation_manager, classify_intent, 
        NAVIGATION_COMMANDS, ANALYSIS_COMMANDS, SOCIAL_COMMANDS,
        MOTIVATIONAL_RESPONSES, THANKS_RESPONSES
    )
    CONTEXT_AVAILABLE = True
except ImportError:
    print("⚠️ Módulo de contexto no disponible. Usando lógica básica.")
    CONTEXT_AVAILABLE = False

recognizer = sr.Recognizer() if VOICE_AVAILABLE else None

@app.post("/assist")
async def assist(
    audio_file: UploadFile = File(...)
):
    if not VOICE_AVAILABLE or not recognizer:
        raise HTTPException(503, "El servicio de voz no está disponible en el servidor.")

    response_text = "No te he entendido, ¿puedes repetirlo?"
    
    try:
        # Convertir el archivo de audio recibido a un formato que pydub entienda
        segment = AudioSegment.from_file(io.BytesIO(await audio_file.read()))
        # Exportarlo como WAV, que es lo que SpeechRecognition maneja mejor
        wav_io = io.BytesIO()
        segment.export(wav_io, format="wav")
        wav_io.seek(0)

        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            # Transcribir usando la API de Google (requiere internet)
            text = recognizer.recognize_google(audio_data, language="es-ES")
            print(f"🎤 Texto reconocido: '{text}'")

            # Lógica de respuesta simple
            if "hola" in text.lower():
                response_text = "Hola, soy la inteligencia artificial de SIGC&T Rural. ¿En qué puedo ayudarte hoy?"
            elif "adiós" in text.lower():
                response_text = "Hasta pronto. Si necesitas algo más, no dudes en consultarme."
            elif "enfermedad" in text.lower() or "planta" in text.lower():
                response_text = "Puedo ayudarte a analizar imágenes de plantas. Por favor, sube una foto en el laboratorio de ciencia de datos."
            else:
                response_text = f"He entendido que has dicho: {text}. Aún estoy aprendiendo a mantener una conversación."

    except sr.UnknownValueError:
        print("🚫 El audio no fue claro o estaba vacío.")
        response_text = "No he podido entender lo que has dicho. Por favor, habla más claro."
    except sr.RequestError as e:
        print(f"❌ Error con el servicio de reconocimiento de voz: {e}")
        response_text = "Hay un problema con el servicio de reconocimiento de voz. Inténtalo más tarde."
    except Exception as e:
        print(f"💥 Error inesperado en el procesamiento de audio: {e}")
        raise HTTPException(500, f"Error procesando el audio: {e}")

    # Convertir la respuesta de texto a audio (MP3)
    try:
        tts = gTTS(text=response_text, lang='es', slow=False)
        mp3_io = io.BytesIO()
        tts.write_to_fp(mp3_io)
        mp3_io.seek(0)
        
        # Devolver el audio como una respuesta que el navegador puede reproducir
        return StreamingResponse(mp3_io, media_type="audio/mpeg")

    except Exception as e:
        print(f"💥 Error generando el audio de respuesta: {e}")
        raise HTTPException(500, f"Error generando la respuesta de audio: {e}")
