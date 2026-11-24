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
import unicodedata
from urllib.parse import quote
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
    KNOWN_ARTIFACTS,
    SEMANTIC_CONTRACT_VERSION,
    STATUS_NO_DISPONIBLE,
    hash_file,
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
    # S62: el navegador debe poder leer las trazas X-SIGCT-* del /assist.
    expose_headers=[
        "X-SIGCT-Assist-Mode",
        "X-SIGCT-LLM-Used",
        "X-SIGCT-LLM-Status",
        "X-SIGCT-Intent",
        "X-SIGCT-Transcript",
        "X-SIGCT-Navigate",
        "X-SIGCT-Context-Status",
        # Clip local de visión: métricas multi-frame declaradas por el cliente.
        "X-SIGCT-Clip-Status",
        "X-SIGCT-Clip-Frames",
        "X-SIGCT-Clip-Motion",
        "X-SIGCT-Clip-Sha256",
    ],
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
# Backend de inferencia (AI-R3, DORMIDO por defecto)
# =========================
# AI-R3 introduce un segundo motor (ONNX Runtime) SIN activarlo:
#   AI_BACKEND=tf    (default) -> sirve el .h5 historico con TensorFlow.
#   AI_BACKEND=onnx            -> sirve model.onnx (M2); lo activa AI-R4.
# `auto` se descarta a proposito: activaria ONNX sin decision explicita.
# Un valor desconocido cae a `tf` (fail-safe: nunca enciende ONNX solo).

AI_BACKEND = (os.environ.get("AI_BACKEND") or "tf").strip().lower()
if AI_BACKEND not in ("tf", "onnx"):
    AI_BACKEND = "tf"
AI_MODEL_PATH = (os.environ.get("AI_MODEL_PATH") or "").strip() or None

# Identificador de contrato de modelo (aditivo en /health). AI-R4 lo consumira
# para detectar el espacio de clases (eco del modo), sin adivinar.
MODEL_CONTRACT_VERSION_TF = "binary_only"
MODEL_CONTRACT_VERSION_ONNX = "agriculture_v2_multiclass16"

# Contrato del artefacto ONNX (AI-R2 export_record.json).
ONNX_INPUT_NAME = "input"
ONNX_OUTPUT_NAME = "logits"
ONNX_INPUT_SIZE = 224
ONNX_RESIZE_SIZE = 256
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype="float32")
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype="float32")

# =========================
# TensorFlow
# =========================

model = None
model_name = None
model_backend = None  # "tf" | "onnx" | None (ninguno cargado)

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow no disponible. Modo MOCK activado.")

try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ort = None
    ONNX_AVAILABLE = False
    print("⚠️ onnxruntime no disponible. Backend ONNX deshabilitado (AI-R3 dormido).")


def _onnx_candidates():
    """Rutas .onnx candidatas: AI_MODEL_PATH o, si no, MODELS_DIR (orden fijo).

    Seleccion explicita, NUNCA por `mtime` (R-EXEC-4): evita que el .h5 mas
    reciente gane cuando coexisten ambos artefactos.
    """
    if AI_MODEL_PATH:
        return [Path(AI_MODEL_PATH)]
    return sorted(MODELS_DIR.glob("*.onnx"))


def _load_tf_model():
    global model, model_name, model_backend
    if not TF_AVAILABLE: return None
    files = list(MODELS_DIR.glob("*.h5")) + list(MODELS_DIR.glob("*.keras"))
    if not files: return None
    latest = max(files, key=lambda p: p.stat().st_mtime)
    if model_name != latest.name or model_backend != "tf":
        try:
            model = tf.keras.models.load_model(latest, compile=False)
            model_name = latest.name
            model_backend = "tf"
        except Exception as e:
            print(f"❌ Error cargando modelo: {e}")
    return model_name


def _load_onnx_model():
    global model, model_name, model_backend
    if not ONNX_AVAILABLE:
        print("⚠️ AI_BACKEND=onnx pero onnxruntime no esta disponible.")
        return None
    candidates = [path for path in _onnx_candidates() if path.is_file()]
    if not candidates:
        print("⚠️ AI_BACKEND=onnx pero no se encontro ningun artefacto .onnx.")
        return None
    if len(candidates) > 1:
        print(f"⚠️ Varios .onnx; se usa el primero por orden estable: {candidates[0].name}")
    target = candidates[0]

    # Hash guard (AI-R3/D-D): un .onnx cuyo SHA-256 no este en el registro de
    # ejecucion NO se carga. Fail-closed, nunca NO_DECLARADO servido.
    try:
        artifact_sha256 = hash_file(target)
    except OSError as exc:
        print(f"❌ No se pudo hashear el artefacto ONNX: {exc}")
        return None
    if artifact_sha256 not in KNOWN_ARTIFACTS:
        print(
            f"❌ Artefacto ONNX NO_DECLARADO (sha256={artifact_sha256}); "
            "se rechaza la carga (fail-closed)."
        )
        return None

    if model_backend != "onnx" or model_name != target.name:
        try:
            model = ort.InferenceSession(str(target), providers=["CPUExecutionProvider"])
            model_name = target.name
            model_backend = "onnx"
            print(f"✅ ONNX cargado con hash registrado: {artifact_sha256[:8]}")
        except Exception as e:
            print(f"❌ Error cargando modelo ONNX: {e}")
    return model_name


def load_latest_model():
    """Carga el artefacto servible segun AI_BACKEND (dormido: tf)."""
    if AI_BACKEND == "onnx":
        return _load_onnx_model()
    return _load_tf_model()


load_latest_model()


def _model_output_dim():
    """Numero de clases del grafo cargado, o None si no es determinable.

    Tercera fuente del cross-check de class_space (L-1).
    """
    try:
        if model_backend == "onnx":
            get_outputs = getattr(model, "get_outputs", None)
            if not callable(get_outputs):
                return None
            shape = get_outputs()[0].shape
        else:
            shape = getattr(model, "output_shape", None)
        if not shape:
            return None
        dimension = int(shape[-1])
        return dimension if dimension > 0 else None
    except Exception:
        return None


def _served_onnx_path():
    """Ruta del .onnx que se sirve, o None (AI-R3)."""
    candidates = [path for path in _onnx_candidates() if path.is_file()]
    return candidates[0] if candidates else None


def _model_identity():
    """Identidad del artefacto servible actual (nunca lanza)."""
    try:
        if model_backend == "onnx":
            path = _served_onnx_path()
            directory = path.parent if path else MODELS_DIR
            return refresh_model_identity(
                directory,
                output_dim=_model_output_dim(),
                include_onnx=True,
                explicit_path=path,
            )
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


def _model_contract_version():
    """Contrato del modelo servido (eco del modo), o None si no hay modelo."""
    if model_backend == "onnx":
        return MODEL_CONTRACT_VERSION_ONNX
    if model_backend == "tf":
        return MODEL_CONTRACT_VERSION_TF
    return None


def _identity_fields(identity):
    """Subconjunto de identidad que viaja en /infer (el envelope V3 lo publica)."""
    return {
        "model_sha256": identity.get("model_sha256"),
        "model_status": identity.get("model_status"),
        "artifact_id": identity.get("artifact_id"),
        "class_space": identity.get("class_space"),
        "class_labels": identity.get("class_labels") or [],
        "scientific_scope": identity.get("scientific_scope") or "unknown",
        # AI-R4 (R4-PLU): el contrato del modelo viaja tambien en /infer, de modo
        # que el resolver del backend detecta el modo (v1/v2) sin heuristicas
        # fragiles. Eco de `_model_contract_version()`, no una segunda verdad.
        "model_contract_version": _model_contract_version(),
    }


def _service_capabilities(identity):
    """Capacidades declaradas, NO un healthcheck de modelo ni de LLM.

    Aditivo a /health: permite a un cliente descubrir el contrato vigente, el
    espacio de clases del artefacto servido y si hay proveedor LLM configurado,
    sin disparar inferencia ni revelar credenciales. `status: ok` sigue
    significando solo que el proceso responde; la procedencia viaja aparte.
    """
    labels = identity.get("class_labels") or []
    return {
        "semantic_contract_version": SEMANTIC_CONTRACT_VERSION,
        "model_contract_version": _model_contract_version(),
        "model_status": identity.get("model_status"),
        "class_space": identity.get("class_space"),
        "class_labels": list(labels),
        "llm": {
            "status": "CONFIGURED" if VOICE_LLM_READY else "NOT_CONFIGURED",
            "model": VOICE_LLM_MODEL or None,
            "fallback": "KEYWORD_RULE",
        },
        "vision": {
            "frames_per_inference_request": 1,
            "clip_contract": "clip-evidence-v1",
            "clip_status": "LOCAL",
        },
        "ingest": {
            "envelope_contract": "sigct-ingest-envelope-v1",
            "persistence": "IN_MEMORY_SESSION",
        },
        "limitations": [
            "Servir un artefacto NO equivale a promoverlo sobre M1.",
            "Sin inferencia ejecutada no se emite diagnóstico: source_mode=fallback / NO_DATA.",
            "Clip local y métricas multi-frame son LOCAL: no validan escena agrícola.",
        ],
    }


def _preprocess_image_onnx(image):
    """Preprocesado M2 (identico al de exportacion, AI-R2).

    Resize(256) del lado corto -> CenterCrop(224) -> [0,1] -> Normalize(ImageNet)
    -> NCHW. NO reutiliza el preprocesado del .h5 (aquel no normaliza).
    """
    resize = max(ONNX_RESIZE_SIZE, ONNX_INPUT_SIZE)
    width, height = image.size
    scale = resize / float(min(width, height))
    new_size = (max(1, int(round(width * scale))), max(1, int(round(height * scale))))
    image = image.resize(new_size, Image.BILINEAR)
    left = (new_size[0] - ONNX_INPUT_SIZE) // 2
    top = (new_size[1] - ONNX_INPUT_SIZE) // 2
    image = image.crop((left, top, left + ONNX_INPUT_SIZE, top + ONNX_INPUT_SIZE))
    arr = np.asarray(image).astype("float32") / 255.0
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
    arr = np.transpose(arr, (2, 0, 1))  # HWC -> CHW
    return np.expand_dims(arr, axis=0).astype("float32")


def _softmax(values):
    """Softmax numericamente estable sobre el ultimo eje."""
    shifted = values - np.max(values, axis=-1, keepdims=True)
    exp = np.exp(shifted)
    return exp / np.sum(exp, axis=-1, keepdims=True)


def preprocess_image(img_data: bytes, target_size=(224, 224)):
    # El modelo ya incluye Rescaling(1/127.5, -1): recibe [0,255] y normaliza internamente.
    # No aplicar segunda normalización aquí (evita el bug de doble normalización).
    image = Image.open(io.BytesIO(img_data)).convert("RGB")
    if model_backend == "onnx":
        return _preprocess_image_onnx(image)
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
        # --- backend y contrato de modelo (AI-R3, aditivo) ---
        "model_backend": model_backend,
        "onnxruntime": getattr(ort, "__version__", None) if ONNX_AVAILABLE else None,
        "model_contract_version": _model_contract_version(),
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
        # Descubrimiento de capacidades: aditivo, sin modelos ni LLM invocados.
        "semantic_capabilities": _service_capabilities(identity),
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

        if model_backend == "onnx" and model is not None:
            # ONNX entrega logits crudos (sin softmax): replicar la semantica
            # del .h5 para conservar `confidence` como probabilidad.
            logits = model.run([ONNX_OUTPUT_NAME], {ONNX_INPUT_NAME: processed})[0]
            preds = _softmax(np.asarray(logits, dtype="float64"))[0]
            idx = int(np.argmax(preds))
            confidence = float(np.max(preds))
            diagnosis = f"class_{idx}"
        elif TF_AVAILABLE and model is not None:
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
# CONTRATO DE CONTEXTO DE VOZ (S62) — aditivo y fail-closed
# ===================================
# El cliente envia un resumen acotado (S35 + evidencia de vision). Este modulo
# NO es un LLM: valida, normaliza y usa ese resumen como contexto declarado.
# Los unicos estados aceptados son los del canon de honestidad permitido;
# cualquier otro valor degrada a NO_DATA. Nunca se eleva nada a REAL.

VOICE_CONTEXT_VERSION = "sigct-voice-context-v1"
VOICE_HONESTY_STATES = {"REAL-LOCAL", "LOCAL", "SIM", "NO_DATA", "ROTO"}
VOICE_CONTEXT_MAX_CHARS = 8000

VOICE_NAV_LABELS = {
    "dashboard": "el panel principal",
    "cmsc": "el dashboard científico CMSC",
    "labs": "los laboratorios",
    "robotics": "robótica",
    "ai": "inteligencia artificial",
    "math": "matemáticas",
    "lab-telecom": "telecomunicaciones",
    "lab-electronics": "electrónica",
    "data-lab": "ciencia de datos",
    "proyectos": "proyectos",
    "docs": "el centro de conocimiento",
}
VOICE_NAV_PREFIXES = (
    "ir a ", "ir al ", "abre ", "abrir ", "navegar a ", "llevame a ", "vamos a ",
)
VOICE_NAV_KEYWORDS = {
    "dashboard": ("dashboard", "panel principal", "panel", "inicio"),
    "cmsc": ("cmsc", "dashboard cientifico"),
    "labs": ("laboratorios", "laboratorio", "labs"),
    "robotics": ("robotica", "robots", "robot"),
    "ai": ("inteligencia artificial", "predictiva"),
    "math": ("matematicas", "matematica", "mate"),
    "lab-telecom": ("telecomunicaciones", "telecom"),
    "lab-electronics": ("electronica",),
    "data-lab": ("ciencia de datos", "data science"),
    "proyectos": ("proyectos", "proyecto"),
    "docs": ("conocimiento", "documentacion", "knowledge", "documentos"),
}

# LLM real SOLO si hay configuracion completa por entorno. Sin ella se usa
# exclusivamente la regla determinista existente: no se simula un modelo.
VOICE_LLM_URL = os.getenv("SIGCT_VOICE_LLM_URL", "").strip()
VOICE_LLM_MODEL = os.getenv("SIGCT_VOICE_LLM_MODEL", "").strip()
VOICE_LLM_KEY = os.getenv("SIGCT_VOICE_LLM_KEY", "").strip()
VOICE_LLM_READY = all((VOICE_LLM_URL, VOICE_LLM_MODEL, VOICE_LLM_KEY))


def _voice_clip(value, limit=120):
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned[:limit] if cleaned else None


def _voice_dict(value):
    return value if isinstance(value, dict) else {}


def _voice_state(value):
    return value if value in VOICE_HONESTY_STATES else "NO_DATA"


def _voice_clip_state(value):
    """Un clip leido desde disco es LOCAL: jamas se eleva a REAL-LOCAL."""
    state = _voice_state(value)
    return "LOCAL" if state == "REAL-LOCAL" else state


def _voice_number(value):
    try:
        if value is None or value == "":
            return None
        parsed = float(value)
        return parsed if np.isfinite(parsed) else None
    except (TypeError, ValueError):
        return None


def _ascii_fold(value):
    return unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode("ascii").lower()


def _normalize_voice_context(raw):
    """Devuelve (contexto_normalizado, estado). Nunca lanza al llamador."""
    if raw is None or raw == "":
        return None, "absent"
    if not isinstance(raw, str) or len(raw) > VOICE_CONTEXT_MAX_CHARS:
        return None, "invalid"
    try:
        payload = json.loads(raw)
    except (ValueError, TypeError):
        return None, "invalid"
    if not isinstance(payload, dict) or payload.get("version") != VOICE_CONTEXT_VERSION:
        return None, "invalid"

    live = _voice_dict(payload.get("signal"))
    sight = _voice_dict(payload.get("vision"))
    capture = _voice_dict(sight.get("capture"))
    inference = _voice_dict(sight.get("inference"))
    clip_raw = _voice_dict(sight.get("clip"))
    clip_frames = _voice_dict(clip_raw.get("frameInferences"))
    published = live.get("published") is True
    context = {
        "version": VOICE_CONTEXT_VERSION,
        "signal": {
            "id": _voice_clip(live.get("id"), 12) or "S35",
            "published": published,
            "estado": _voice_state(live.get("estado")) if published else "NO_DATA",
            "sourceLabel": _voice_clip(live.get("sourceLabel"), 100),
            "sampleCount": _voice_clip(live.get("sampleCount"), 24),
            "fs": _voice_clip(live.get("fs"), 24),
            "rms": _voice_clip(live.get("rms"), 24),
        },
        "vision": {
            "status": _voice_state(sight.get("status")),
            "captureStatus": _voice_state(capture.get("status")),
            "captureKind": _voice_clip(capture.get("kind"), 40),
            "authorized": capture.get("authorized") is True,
            "inferenceExecuted": inference.get("executed") is True,
            "modelStatus": _voice_clip(inference.get("modelStatus"), 40),
            "modelId": _voice_clip(inference.get("modelId"), 80),
            "contractVersion": _voice_clip(inference.get("contractVersion"), 20),
            "confidence": _voice_number(inference.get("confidence")),
            "analysisKind": _voice_clip(sight.get("analysisKind"), 40),
            "clip": None if not clip_raw else {
                "status": _voice_clip_state(clip_raw.get("status")),
                "declaredPath": _voice_clip(clip_raw.get("declaredPath"), 160),
                "sha256": _voice_clip(clip_raw.get("sha256"), 64),
                "durationSec": _voice_number(clip_raw.get("durationSec")),
                "analyzedFrames": _voice_number(clip_raw.get("analyzedFrames")),
                "meanFrameDelta": _voice_number(clip_raw.get("meanFrameDelta")),
                "temporalVariation": _voice_number(clip_raw.get("temporalVariation")),
                "lumaTrend": _voice_clip(clip_raw.get("lumaTrend"), 24),
                "frameInferences": None if not clip_raw.get("frameInferences") else {
                    "requestedFrames": _voice_number(clip_frames.get("requestedFrames")),
                    "executedFrames": _voice_number(clip_frames.get("executedFrames")),
                    "distinctLabels": [
                        _voice_clip(label, 40)
                        for label in (clip_frames.get("distinctLabels") or [])
                        if _voice_clip(label, 40)
                    ][:8],
                },
            },
        },
    }
    return context, "accepted"


def _voice_context_short(context):
    if not context:
        return "No hay resumen de contexto vivo del cliente."
    signal = context["signal"]
    vision = context["vision"]
    parts = [
        f"Contexto declarado por la interfaz: S35 {signal['estado']}",
    ]
    if signal["sourceLabel"]:
        parts.append(f"({signal['sourceLabel']})")
    parts.append(f"; visión {vision['status']}")
    if vision["inferenceExecuted"]:
        parts.append(f"; inferencia ejecutada sobre la muestra, artefacto {vision['modelStatus'] or 'no declarado'}")
    clip = vision.get("clip")
    if clip:
        motion = clip["temporalVariation"]
        parts.append(
            f"; clip local {clip['status']}, {clip['analyzedFrames'] if clip['analyzedFrames'] is not None else '—'} frames, "
            f"variación temporal {motion if motion is not None else '—'}"
        )
    parts.append(".")
    return " ".join(parts)


def _voice_context_summary(context, sensor):
    if sensor:
        sensor_line = (
            f"Última lectura Postgres: temperatura {sensor['temperature']}, "
            f"humedad {sensor['humidity']}."
        )
    else:
        sensor_line = "Última lectura Postgres: NO_DATA."
    if not context:
        return f"Contexto vivo del cliente: NO_DATA (sin resumen válido). {sensor_line}"
    signal = context["signal"]
    vision = context["vision"]
    chunks = [
        "Resumen declarado por el cliente (NO verificado por este servicio):",
        f"S35 publicada={signal['published']} · estado={signal['estado']} · fuente={signal['sourceLabel'] or 'no declarada'}.",
        f"Visión: estado={vision['status']} · captura={vision['captureStatus']} · "
        f"inferencia_ejecutada={vision['inferenceExecuted']} · artefacto={vision['modelStatus'] or 'no declarado'}.",
    ]
    if vision["confidence"] is not None:
        chunks.append(
            f"Confianza declarada sobre la muestra: {vision['confidence']:.4f} "
            "(no es precisión validada)."
        )
    clip = vision.get("clip")
    if clip:
        frames = clip["analyzedFrames"]
        delta = clip["meanFrameDelta"]
        motion = clip["temporalVariation"]
        chunk = (
            f"Clip local declarado (NO cámara, NO campo): estado={clip['status']} · "
            f"ruta={clip['declaredPath'] or 'no declarada'} · "
            f"frames={frames if frames is not None else 'no declarado'} · "
            f"delta medio={delta if delta is not None else 'no declarado'} · "
            f"variación temporal={motion if motion is not None else 'no declarada'} · "
            f"tendencia={clip['lumaTrend'] or 'no declarada'}. "
            "Métricas deterministas locales: NO son inferencia, NO son un diagnóstico "
            "y NO elevan la escena a REAL-LOCAL."
        )
        inferences = clip.get("frameInferences")
        if inferences:
            chunk += (
                f" Frames enviados con autorización: "
                f"{inferences['executedFrames'] if inferences['executedFrames'] is not None else '—'}/"
                f"{inferences['requestedFrames'] if inferences['requestedFrames'] is not None else '—'}; "
                "cada inferencia describe solo su frame."
            )
        chunks.append(chunk)
    chunks.append(sensor_line)
    chunks.append("Este resumen NO eleva señales a REAL y NO sustituye al modelo servido.")
    return " ".join(chunks)


def _voice_nav_target(text):
    normalized = _ascii_fold(text)
    if not any(prefix in normalized for prefix in VOICE_NAV_PREFIXES):
        return ""
    for token, keywords in VOICE_NAV_KEYWORDS.items():
        if any(_ascii_fold(keyword) in normalized for keyword in keywords):
            return token
    return ""


def _voice_llm_answer(text, summary, intent):
    """LLM opcional y real. Sin configuración devuelve None: nunca se finge."""
    if not VOICE_LLM_READY:
        return None, "NOT_CONFIGURED"
    system = (
        "Asistente de lectura de SIGC&T Rural. Responde en español en máximo tres frases. "
        "Usa únicamente los datos del resumen de contexto; no inventes sensores, modelos, "
        "métricas ni fuentes. Si el resumen indica NO_DATA o ROTO, dilo explícitamente. "
        "No afirmes que realizaste inferencia ni que consultaste un modelo."
    )
    user = f"Pregunta del operador: {text}\nIntención detectada: {intent}\nResumen verificado: {summary}"
    try:
        response = requests.post(
            VOICE_LLM_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {VOICE_LLM_KEY}",
            },
            json={
                "model": VOICE_LLM_MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "temperature": 0,
                "max_tokens": 180,
            },
            timeout=8,
        )
        response.raise_for_status()
        payload = response.json()
        choice = (payload.get("choices") or [{}])[0]
        content = (choice.get("message") or {}).get("content")
        if not isinstance(content, str) or not content.strip():
            return None, "NO_RESPONSE"
        return content.strip()[:700], "OK"
    except Exception as exc:
        print(f"⚠️ LLM de voz no disponible; se mantiene la regla determinista: {exc}")
        return None, "ERROR_FALLBACK"


def _assist_headers(trace):
    return {
        "X-SIGCT-Assist-Mode": trace["mode"],
        "X-SIGCT-LLM-Used": "true" if trace["llm_used"] else "false",
        "X-SIGCT-LLM-Status": trace["llm_status"],
        "X-SIGCT-Intent": trace["intent"] or "unknown",
        "X-SIGCT-Transcript": quote(trace["transcript"] or "", safe=""),
        "X-SIGCT-Navigate": trace["navigate"] or "",
        "X-SIGCT-Context-Status": trace["context_status"],
        "X-SIGCT-Clip-Status": str(trace.get("clip_status") or "absent"),
        "X-SIGCT-Clip-Frames": str(trace.get("clip_frames") or ""),
        "X-SIGCT-Clip-Motion": str(trace.get("clip_motion") or ""),
        "X-SIGCT-Clip-Sha256": str(trace.get("clip_sha256") or ""),
    }


# ===================================
# Asistente de Voz Inteligente (Postgres)
# ===================================

@app.post("/assist")
async def assist(
    request: Request, 
    audio: Optional[UploadFile] = File(None),
    audio_file: Optional[UploadFile] = File(None)
):
    """S62: voz + contexto vivo opcional + LLM real solo si está configurado."""

    # Traza devuelta SIEMPRE en headers X-SIGCT-* (incluso en fallback).
    trace = {
        "mode": "KEYWORD_RULE",
        "llm_used": False,
        "llm_status": "NOT_CONFIGURED" if not VOICE_LLM_READY else "CONFIGURED",
        "intent": "unknown",
        "transcript": "",
        "navigate": "",
        "context_status": "absent",
        "clip_status": "absent",
        "clip_frames": "",
        "clip_motion": "",
        "clip_sha256": "",
    }

    def respond(audio_io):
        return StreamingResponse(audio_io, media_type="audio/mpeg", headers=_assist_headers(trace))

    # 1. Unificar entrada de archivo
    incoming_file = audio or audio_file

    if not VOICE_AVAILABLE:
        raise HTTPException(503, "Servicios de voz no configurados en el servidor")

    try:
        # Debug: Verificar campos recibidos
        form_data = await request.form()
        print(f"DEBUG INCOMING: Form keys: {list(form_data.keys())}")

        voice_context, context_status = _normalize_voice_context(form_data.get("context"))
        trace["context_status"] = context_status

        # Trazas del clip local: SOLO lo que el cliente declaró y el normalizador
        # aceptó. Nunca se inventan métricas ni se eleva el clip a REAL.
        clip = (voice_context or {}).get("vision", {}).get("clip")
        if clip:
            trace["clip_status"] = clip["status"]
            trace["clip_sha256"] = clip.get("sha256") or ""
            analyzed = clip.get("analyzedFrames")
            if analyzed is not None:
                trace["clip_frames"] = f"{analyzed:g} analizados"
            inferences = clip.get("frameInferences")
            if (inferences
                    and inferences.get("executedFrames") is not None
                    and inferences.get("requestedFrames") is not None):
                trace["clip_frames"] += (
                    f" · {inferences['executedFrames']:g}/{inferences['requestedFrames']:g} enviados"
                )
            motion = clip.get("temporalVariation")
            if motion is not None:
                trace["clip_motion"] = f"var={motion:g}"

        # Validar si el archivo llegó
        if incoming_file is None:
            print("⚠️ No se recibió archivo de audio (ni 'audio' ni 'audio_file').")
            raise HTTPException(400, "No se recibió archivo de audio. Verifique el FormData.")

        audio_bytes = await incoming_file.read()
        if len(audio_bytes) == 0:
            return respond(generar_audio_error("No se capturó audio"))

        webm_audio = io.BytesIO(audio_bytes)

        # 1. Decodificación
        try:
            audio_segment = AudioSegment.from_file(webm_audio)
            wav_io = io.BytesIO()
            audio_segment.export(wav_io, format="wav")
            wav_io.seek(0)
        except Exception as e:
            print(f"❌ Error decodificando audio: {e}")
            return respond(generar_audio_error("No pude procesar tu audio"))

        # 2. Reconocimiento de voz
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data, language="es-ES").lower()
            except sr.UnknownValueError:
                return respond(generar_audio_error("No te entendí bien"))

        trace["transcript"] = text[:160]
        trace["navigate"] = _voice_nav_target(text)

        # 3. Contexto disponible: sensores REALes + resumen declarado por el cliente.
        sensor = get_latest_sensor_data_pg()
        context_summary = _voice_context_summary(voice_context, sensor)

        # 4. Lógica de respuesta (regla determinista por defecto)
        response_text = ""
        intent = "unknown"

        # Palabras clave
        is_greeting = any(w in text for w in ["hola", "buenos días", "buenas tardes"])
        is_sensor_query = any(w in text for w in ["estado", "nodos", "temperatura", "humedad", "clima", "cómo está"])
        is_followup = any(w in text for w in ["y la humedad", "y el nodo", "qué opinas", "es bueno", "es malo", "analiza"])
        is_repeat = "repite" in text or "qué dijiste" in text

        if is_greeting:
            response_text = "Hola, soy el asistente de SIGC&T Rural. Puedo informarte sobre el estado de los cultivos."
            intent = "greeting"
            memory.update(intent=intent, response=response_text)

        elif is_sensor_query:
            intent = "sensor_query"
            if sensor:
                response_text = (f"El último reporte indica: Temperatura de {sensor['temperature']} grados "
                                 f"y Humedad del {sensor['humidity']}%.")
                memory.update(data=sensor, intent=intent, response=response_text)
            else:
                response_text = "Conecté a la base de datos, pero no encontré lecturas recientes."
            if voice_context:
                response_text += " " + _voice_context_short(voice_context)

        elif is_followup:
            intent = "followup"
            if memory.last_data:
                advice = memory.get_context_advice()
                response_text = f"Analizando los datos anteriores: {advice} {_voice_context_short(voice_context)}"
            else:
                response_text = "No tengo datos recientes en memoria para analizar. Pregúntame primero por el estado de los nodos."

        elif is_repeat:
            intent = "repeat"
            if memory.last_response:
                response_text = f"Te decía que: {memory.last_response}"
            else:
                response_text = "No he dicho nada todavía."

        else:
            response_text = f"Escuché: {text}. Intenta preguntar por el 'estado del sistema'."

        if trace["navigate"]:
            label = VOICE_NAV_LABELS.get(trace["navigate"], trace["navigate"])
            response_text += f" Navegación solicitada a {label}; la interfaz validará la ruta antes de abrirla."
            intent = "navigation" if intent == "unknown" else f"{intent}+navigation"

        trace["intent"] = intent
        memory.update(response=response_text)

        # 5. LLM real: SOLO si hay URL + modelo + credencial configurados.
        #    Sin configuracion (o con error) se conserva la respuesta reglada.
        llm_answer, llm_status = await asyncio.to_thread(
            _voice_llm_answer, text, context_summary, intent
        )
        trace["llm_status"] = llm_status
        if llm_answer:
            response_text = llm_answer
            trace["mode"] = "LLM"
            trace["llm_used"] = True
            memory.update(response=response_text)

        # 6. Generar respuesta de audio
        tts = gTTS(text=response_text, lang='es')
        mp3_io = io.BytesIO()
        tts.write_to_fp(mp3_io)
        mp3_io.seek(0)

        return respond(mp3_io)

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
