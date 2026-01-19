# Dockerfile — FastAPI IA Service (SSE + inferencia + Procesamiento de Audio)
# Contexto de build: src/ai_models/

FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# --- INTEGRACIÓN SIGC&T: SOPORTE MULTIMEDIA ---
# Añadimos ffmpeg para procesar audio WebM del navegador y build-essential para librerías de Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libavcodec-extra \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el contenido de src/ai_models al directorio /app del contenedor
COPY . /app

# Instalar dependencias del AI Service
# Nota: Asegúrate de añadir 'pydub', 'SpeechRecognition' y 'gTTS' a tu requirements.txt
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# Crear directorios esperados por el servicio
RUN mkdir -p /app/production_models

EXPOSE 8081

# Ejecuta el servicio FastAPI con Uvicorn
CMD ["python", "-m", "uvicorn", "fastapi_app:app", "--host", "0.0.0.0", "--port", "8081", "--reload"]