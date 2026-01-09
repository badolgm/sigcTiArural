# Dockerfile — FastAPI IA Service (SSE + inferencia)
# Contexto de build: src/ai_models/

FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el contenido de src/ai_models al directorio /app del contenedor
COPY . /app

# Instalar dependencias del AI Service
RUN pip install --no-cache-dir -r requirements.txt

# Crear directorios esperados por el servicio (si son necesarios dentro del contexto de AI models)
RUN mkdir -p /app/production_models

EXPOSE 8081

# Ejecuta el servicio FastAPI con Uvicorn
CMD ["python", "-m", "uvicorn", "fastapi_app:app", "--host", "0.0.0.0", "--port", "8081", "--reload"]
