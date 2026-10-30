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
import base64
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import numpy as np
from PIL import Image
import requests

# L-1 (2026-10-30): identidad del artefacto por bytes. Modulo stdlib puro,
# mismo directorio que este archivo. Se importa fuera del try de TensorFlow a
# proposito: saber QUE archivo hay no depende de poder cargarlo.
from model_identity import (
    SEMANTIC_CONTRACT_VERSION,
    STATUS_NO_DISPONIBLE,
    refresh_model_identity,
)

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
# ASEGÚRATE de que estos datos coincidan con tu docker-compose.yml
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
CONTAINER_MODELS_DIR = ROOT_DIR / "production_models"
REPO_MODELS_DIR = ROOT_DIR / "src" / "ai_models" / "production_models"
MODELS_DIR = (
    CONTAINER_MODELS_DIR
    if list(CONTAINER_MODELS_DIR.glob("*.h5")) or list(CONTAINER_MODELS_DIR.glob("*.keras"))
    else REPO_MODELS_DIR
)
LOGS_DIR = ROOT_DIR / "data" / "logs"
INFER_LOG = LOGS_DIR / "infer_log.jsonl"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# =========================
# Lógica de Datos (Cerebro Nodos)
# =========================

# --- MEMORIA DE CORTO PLAZO (Contexto) ---
class ConversationMemory:
    def __init__(self):
        self.last_data = None  # Último dato de sensores leído
        self.last_intent = None # Última intención (ej: "consulta_clima")
        self.last_response = "" # Última respuesta dada (para repetir)

    def update(self, data=None, intent=None, response=None):
        if data: self.last_data = data
        if intent: self.last_intent = intent
        if response: self.last_response = response

    def get_context_advice(self):
        """Genera consejo basado en el último dato guardado"""
        if not self.last_data:
            return "No tengo datos recientes para analizar."
        
        temp = self.last_data.get('temperature', 0)
        hum = self.last_data.get('humidity', 0)
        
        advice = []
        if temp > 30:
            advice.append("La temperatura es muy alta. Sugiero activar riego.")
        elif temp < 10:
            advice.append("Hace frío, cuidado con las heladas.")
        else:
            advice.append("La temperatura es óptima.")
            
        if hum < 30:
            advice.append("La humedad es baja.")
        
        return " ".join(advice)

# Instancia global (Simulación de sesión única)
memory = ConversationMemory()

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


def _model_output_dim():
    """Numero de clases del grafo cargado, o None si no es determinable.

    Tercera fuente del cross-check de class_space (L-1).
    """
    try:
        shape = getattr(model, "output_shape", None)
        if not shape:
            return None
        dimension = int(shape[-1])
        return dimension if dimension > 0 else None
    except Exception:
        return None


def _model_identity():
    """Identidad del artefacto servible actual (nunca lanza)."""
    try:
        return refresh_model_identity(MODELS_DIR, output_dim=_model_output_dim())
    except Exception as exc:  # pragma: no cover - defensa de liveness
        print(f"⚠️ No se pudo calcular la identidad del artefacto: {exc}")
        return {
            "model_file": model_name,
            "model_sha256": None,
            "model_bytes": None,
            "model_mtime": None,
            "model_status": STATUS_NO_DISPONIBLE,
            "artifact_id": None,
            "identity_source": "none",
            "class_space": None,
            "class_labels": [],
            "scientific_scope": "unknown",
            "superseded_by": None,
            "declared_in": "src/ai_models/model_identity.py",
            "expires_on": None,
            "semantic_contract_version": SEMANTIC_CONTRACT_VERSION,
        }


def _identity_fields(identity):
    """Subconjunto de identidad que viaja en /infer (el envelope V3 lo publica)."""
    return {
        "model_sha256": identity.get("model_sha256"),
        "model_status": identity.get("model_status"),
        "artifact_id": identity.get("artifact_id"),
        "class_space": identity.get("class_space"),
        "class_labels": identity.get("class_labels") or [],
        "scientific_scope": identity.get("scientific_scope") or "unknown",
    }


def preprocess_image(img_data: bytes, target_size=(224, 224)):
    # El modelo ya incluye Rescaling(1/127.5, -1): recibe [0,255] y normaliza internamente.
    # No aplicar segunda normalización aquí (evita el bug de doble normalización).
    image = Image.open(io.BytesIO(img_data)).convert("RGB")
    image = image.resize(target_size)
    arr = np.array(image).astype("float32")
    return np.expand_dims(arr, axis=0)

# =========================
# API Endpoints
# =========================

@app.get("/health")
def health():
    """Liveness + procedencia del artefacto (L-1, D-L2).

    SIEMPRE 200: la alarma viaja en `model_status`, nunca en el codigo HTTP.
    Un 5xx por procedencia marcaria el contenedor `unhealthy` y, por
    `depends_on: ai_service: service_healthy` (docker-compose.yml), impediria
    arrancar el frontend.
    """
    if not model:
        load_latest_model()
    identity = _model_identity()
    return {
        # --- contrato previo, intacto ---
        "status": "ok",
        "tensorflow": TF_AVAILABLE,
        "voice": VOICE_AVAILABLE,
        "model_loaded": model_name,
        # --- procedencia del artefacto (L-1) ---
        "model_file": identity.get("model_file"),
        "model_sha256": identity.get("model_sha256"),
        "model_bytes": identity.get("model_bytes"),
        "model_mtime": identity.get("model_mtime"),
        "model_status": identity.get("model_status"),
        "artifact_id": identity.get("artifact_id"),
        "identity_source": identity.get("identity_source"),
        "class_space": identity.get("class_space"),
        "class_labels": identity.get("class_labels") or [],
        "scientific_scope": identity.get("scientific_scope"),
        "superseded_by": identity.get("superseded_by"),
        "declared_in": identity.get("declared_in"),
        "expires_on": identity.get("expires_on"),
        "semantic_contract_version": SEMANTIC_CONTRACT_VERSION,
    }



@app.post("/infer")
async def infer(file: Optional[UploadFile] = File(default=None)):
    """
    POST /infer - Inferencia de enfermedades de plantas.
    Versión estable y minimalista.
    Solo acepta multipart/form-data con campo 'file'.
    """
    start_time = time.time()

    if not model:
        load_latest_model()

    try:
        if file is None:
            raise HTTPException(status_code=400, detail="No se recibió imagen (usa multipart con campo 'file')")

        img_bytes = await file.read()
        processed = preprocess_image(img_bytes)

        if TF_AVAILABLE and model is not None:
            preds = model.predict(processed, verbose=0)[0]
            idx = int(np.argmax(preds))
            confidence = float(np.max(preds))
            diagnosis = f"class_{idx}"
        else:
            diagnosis = "unknown"
            confidence = 0.0
            idx = -1

        processing_time = f"{(time.time() - start_time):.2f}s"
        identity = _model_identity()

        result = {
            "diagnosis": diagnosis,
            "confidence": round(confidence, 4),
            "class_index": idx,
            "model": model_name or "unavailable",
            "processing_time": processing_time,
            "status": "ok" if diagnosis != "unknown" else "error",
            # L-1 / D-L4: procedencia del artefacto != resultado de la inferencia
            "inference_executed": diagnosis != "unknown",
            **_identity_fields(identity),
        }


        if diagnosis == "unknown":
            result["detail"] = (
                "No fue posible ejecutar inferencia oficial: el modelo no esta disponible "
                "o TensorFlow no esta cargado."
            )

        try:
            log_entry = {**result, "timestamp": datetime.utcnow().isoformat() + "Z"}
            with open(INFER_LOG, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception:
            pass

        return result

    except HTTPException:
        raise
    except Exception as e:
        return {
            "diagnosis": "unknown",
            "confidence": 0.0,
            "class_index": -1,
            "model": "fallback",
            "processing_time": f"{(time.time() - start_time):.2f}s",
            "status": "error",
            "detail": f"No fue posible ejecutar inferencia oficial: {str(e)}",
            # L-1 / D-L4: no hubo inferencia, pero el artefacto sigue siendo el
            # que esta en disco. Se declaran ambos hechos por separado.
            "inference_executed": False,
            **_identity_fields(_model_identity()),
        }


def generar_audio_error(mensaje):
    """Función auxiliar para responder por voz ante errores"""
    tts = gTTS(text=mensaje, lang='es')
    error_io = io.BytesIO()
    tts.write_to_fp(error_io)
    error_io.seek(0)
    return error_io

# ===================================
# Asistente de Voz Inteligente (Postgres)
# ===================================

@app.post("/assist")
async def assist(
    request: Request, 
    audio: Optional[UploadFile] = File(None),
    audio_file: Optional[UploadFile] = File(None)
):
    """Asistente de voz mejorado: Soporta 'audio' (Nuevo Frontend) y 'audio_file' (Viejo Frontend)"""
    
    # 1. Unificar entrada de archivo
    incoming_file = audio or audio_file
    
    if not VOICE_AVAILABLE:
        raise HTTPException(503, "Servicios de voz no configurados en el servidor")

    try:
        # Debug: Verificar campos recibidos
        form_data = await request.form()
        print(f"DEBUG INCOMING: Form keys: {list(form_data.keys())}")
        
        # Validar si el archivo llegó
        if incoming_file is None:
            print("⚠️ No se recibió archivo de audio (ni 'audio' ni 'audio_file').")
            raise HTTPException(400, "No se recibió archivo de audio. Verifique el FormData.")

        audio_bytes = await incoming_file.read()
        if len(audio_bytes) == 0:
            return {"error": "Audio vacío"}

        webm_audio = io.BytesIO(audio_bytes)
        
        # 1. Decodificación
        try:
            audio_segment = AudioSegment.from_file(webm_audio)
            wav_io = io.BytesIO()
            audio_segment.export(wav_io, format="wav")
            wav_io.seek(0)
        except Exception as e:
            print(f"❌ Error decodificando audio: {e}")
            return StreamingResponse(generar_audio_error("No pude procesar tu audio"), media_type="audio/mpeg")

        # 2. Reconocimiento de voz
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data, language="es-ES").lower()
            except sr.UnknownValueError:
                return StreamingResponse(generar_audio_error("No te entendí bien"), media_type="audio/mpeg")

        # 3. Lógica de respuesta (Con Inteligencia Contextual)
        response_text = ""
        intent = "unknown"
        
        # Palabras clave
        is_greeting = any(w in text for w in ["hola", "buenos días", "buenas tardes"])
        is_sensor_query = any(w in text for w in ["estado", "nodos", "temperatura", "humedad", "clima", "cómo está"])
        is_followup = any(w in text for w in ["y la humedad", "y el nodo", "qué opinas", "es bueno", "es malo", "analiza"])
        is_repeat = "repite" in text or "qué dijiste" in text

        if is_greeting:
            response_text = "Hola, soy la inteligencia artificial de SIGC&T Rural. Puedo informarte sobre el estado de los cultivos."
            memory.update(intent="greeting", response=response_text)
            
        elif is_sensor_query:
            data = get_latest_sensor_data_pg()
            if data:
                response_text = (f"El último reporte indica: Temperatura de {data['temperature']} grados "
                                f"y Humedad del {data['humidity']}%.")
                memory.update(data=data, intent="sensor_query", response=response_text)
            else:
                response_text = "Conecté a la base de datos, pero no encontré lecturas recientes."
                
        elif is_followup:
            # Aquí es donde ocurre la MAGIA del contexto
            if memory.last_data:
                advice = memory.get_context_advice()
                response_text = f"Analizando los datos anteriores: {advice}"
            else:
                response_text = "No tengo datos recientes en memoria para analizar. Pregúntame primero por el estado de los nodos."
        
        elif is_repeat:
            if memory.last_response:
                response_text = f"Te decía que: {memory.last_response}"
            else:
                response_text = "No he dicho nada todavía."

        else:
            response_text = f"Escuché: {text}. Intenta preguntar por el 'estado del sistema'."

        # Guardar última respuesta por si pide repetir
        memory.update(response=response_text)

        # 4. Generar respuesta de audio
        tts = gTTS(text=response_text, lang='es')
        mp3_io = io.BytesIO()
        tts.write_to_fp(mp3_io)
        mp3_io.seek(0)
        
        return StreamingResponse(mp3_io, media_type="audio/mpeg")

    except Exception as e:
        print(f"🔥 Error crítico en /assist: {e}")
        return {"error": str(e)}

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
# =================================================================
# 🚀 ANEXO DE INGENIERÍA: LABORATORIO DE ELECTRÓNICA (Suma al total)
# =================================================================

@app.post("/analyze-circuit")
async def analyze_circuit(request: Request):
    """
    Analizador de Ingeniería Electrónica para SIGC&T Rural.
    Este bloque se añade al final de las 333 líneas originales.
    """
    try:
        data = await request.json()
        nodes = data.get("nodes", [])
        
        # Lógica de interpretación de IA para el Gemelo Digital
        if len(nodes) > 0:
            analisis = {
                "tipo": "Análisis de Topología Dinámica",
                "estado": "Operativo",
                "explicacion": f"Bernardo, he recibido el esquema. Detecto {len(nodes)} nodos de conexión. "
                               "Procediendo a calcular voltajes de nodo y corrientes de malla."
            }
        else:
            analisis = {
                "tipo": "Lienzo Vacío",
                "estado": "Inactivo",
                "explicacion": "El laboratorio está listo. Coloca un componente para iniciar."
            }
        return {"status": "success", "data": analisis}
    except Exception as e:
        print(f"❌ Error en análisis de laboratorio: {e}")
        return {"error": str(e)}
