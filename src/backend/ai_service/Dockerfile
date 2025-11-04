# Dockerfile — FastAPI IA Service (SSE + inferencia)
# Contexto de build: la raíz del repo. Este Dockerfile copia el repo completo
# para que las rutas relativas (data/logs, ai_models) funcionen.

FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el repo completo (para que find_repo_root ubique src/ y data/)
COPY . /app

# Instalar dependencias de backend (FastAPI, Uvicorn, Pillow, etc.)
RUN pip install --no-cache-dir -r src/backend/requirements.txt

# Crear directorios esperados por el servicio
RUN mkdir -p /app/data/logs /app/src/ai_models/production_models

EXPOSE 8000

# Ejecuta el servicio FastAPI con Uvicorn
CMD ["python", "-m", "uvicorn", "src.backend.ai_service.fastapi_app:app", "--host", "0.0.0.0", "--port", "8000"]