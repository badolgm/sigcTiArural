"""
SIGC&T Rural - Microservicio de IA Integrado v2.0
- Inferencia de imágenes (MobileNetV2)
- Asistente de Voz con Contexto de Nodos (PostgreSQL)
- Eventos en tiempo real (SSE)
"""

from pathlib import Path
from typing import Optional
import json
import io
import time
import asyncio
import os

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import numpy as np
from PIL import Image
import requests

# Librerías de Voz y Base de Datos (Postgres)
try:
    import speech_recognition as sr
    from gtts import gTTS
    from pydub import AudioSegment
    import psycopg2
    from psycopg2.extras import RealDictCursor
    VOICE_AVAILABLE = True
except ImportError:
    VOICE_AVAILABLE = False
    print("⚠️ Librerías de voz o Postgres no disponibles. Modo limitado activado.")

# =========================
# App y Configuración
# =========================

app = FastAPI(
    title="SIGC&T Rural IA Inference Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración dinámica para PostgreSQL (Alineado con tu Guía de Migración)
db_config = {
    'dbname': 'sigct_db',
    'user': 'user',
    'password': 'password',
    'host': 'db', 
    'port': 5432
}

# =========================
# Rutas y Directorios
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
# Lógica de Datos (Cerebro Nodos)
# =========================

def get_latest_sensor_data_pg():
    """Consulta optimizada para PostgreSQL - Soporte Dual (Docker/Local)"""
    conn = None
    try:
        try:
            # Intento 1: Red de Docker
            conn = psycopg2.connect(**db_config, connect_timeout=3)
        except:
            # Intento 2: Localhost (Tus terminales Git Bash)
            local_config = db_config.copy()
            local_config['host'] = 'localhost'
            conn = psycopg2.connect(**local_config, connect_timeout=3)
            
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Nombre de tabla según Django
        query = 'SELECT temperature, humidity FROM api_sensorreading ORDER BY timestamp DESC LIMIT 1'
        cur.execute(query)
        result = cur.fetchone()
        cur.close()
        return result
    except Exception as e:
        print(f"⚠️ Error de conexión a Postgres: {e}")
        return None
    finally:
        if conn: conn.close()

# =========================
# TensorFlow (Tu lógica original de Inferencia)
# =========================

model = None
model_name = None

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow no disponible. Modo MOCK activado.")

def load_latest_model():
    global model, model_name
    if not TF_AVAILABLE: return None
    files = list(MODELS_DIR.glob("*.h5")) + list(MODELS_DIR.glob("*.keras"))
    if not files: return None
    latest = max(files, key=lambda p: p.stat().st_mtime)
    if model_name != latest.name:
        try:
            model = tf.keras.models.load_model(latest, compile=False)
            model_name = latest.name
        except Exception as e:
            print(f"❌ Error cargando modelo: {e}")
    return model_name

load_latest_model()

def preprocess_image(img_data: bytes, target_size=(224, 224)):
    image = Image.open(io.BytesIO(img_data)).convert("RGB")
    image = image.resize(target_size)
    arr = np.array(image)
    if TF_AVAILABLE:
        arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
    else:
        arr = (arr / 127.5) - 1.0
    return np.expand_dims(arr, axis=0)

# =========================
# API Endpoints
# =========================

@app.get("/health")
def health():
    if not model: load_latest_model()
    return {
        "status": "ok",
        "tensorflow": TF_AVAILABLE,
        "voice": VOICE_AVAILABLE,
        "model_loaded": model_name
    }

@app.post("/infer")
async def infer(file: Optional[UploadFile] = File(None), url: Optional[str] = None):
    start = time.time()
    if file:
        img_bytes = await file.read()
        source = f"file:{file.filename}"
    elif url:
        r = requests.get(url, timeout=5)
        img_bytes = r.content
        source = f"url:{url}"
    
    if TF_AVAILABLE and model:
        CLASS_NAMES = ["Enferma", "Sana"]
        arr = preprocess_image(img_bytes)
        preds = model.predict(arr)
        idx = int(np.argmax(preds))
        result = {"diagnosis": CLASS_NAMES[idx], "confidence": round(float(np.max(preds)), 4)}
    else:
        result = {"diagnosis": "MOCK", "confidence": 0.0}

    latency = time.time() - start
    return {"data": result, "latency": f"{latency:.3f}s"}

# ===================================
# Asistente de Voz Inteligente (Postgres)
# ===================================

@app.post("/assist")
async def assist(audio_file: UploadFile = File(...)):
    if not VOICE_AVAILABLE:
        raise HTTPException(503, "Servicio de voz no disponible")

    response_text = "No te he entendido, ¿puedes repetirlo?"
    
    try:
        # 1. Procesamiento de Audio (WebM del navegador -> WAV)
        segment = AudioSegment.from_file(io.BytesIO(await audio_file.read()))
        wav_io = io.BytesIO()
        segment.export(wav_io, format="wav")
        wav_io.seek(0)

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language="es-ES").lower()

        # 2. Lógica de Negocio con datos de Postgres
        if any(word in text for word in ["estado", "nodos", "cultivo", "temperatura"]):
            data = get_latest_sensor_data_pg()
            if data:
                response_text = (f"El sistema informa: El Nodo 3 detecta {data['temperature']} grados "
                                f"y {data['humidity']}% de humedad.")
            else:
                response_text = "Gateway conectado, pero no hay datos recientes en PostgreSQL."
        elif "hola" in text:
            response_text = "Hola, soy la inteligencia artificial de SIGC&T Rural. ¿Quieres saber el estado del cultivo?"
        else:
            response_text = f"He entendido: {text}. ¿Deseas consultar la telemetría?"

        # 3. Generar respuesta de audio
        tts = gTTS(text=response_text, lang='es')
        mp3_io = io.BytesIO()
        tts.write_to_fp(mp3_io)
        mp3_io.seek(0)
        
        return StreamingResponse(mp3_io, media_type="audio/mpeg")

    except Exception as e:
        raise HTTPException(500, f"Error en asistente: {e}")

# SSE - Eventos
@app.get("/events")
def events():
    async def follow_file(path: Path):
        path.touch(exist_ok=True)
        last_size = path.stat().st_size
        while True:
            await asyncio.sleep(1)
            size = path.stat().st_size
            if size > last_size:
                with path.open("r") as f:
                    f.seek(last_size)
                    for line in f: yield f"data: {line.strip()}\n\n"
                last_size = size
    return StreamingResponse(follow_file(INFER_LOG), media_type="text/event-stream")