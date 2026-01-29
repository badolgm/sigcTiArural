# 1. Definir la imagen base primero
FROM python:3.11-slim

# 2. Establecer el directorio de trabajo
WORKDIR /app

# 3. Instalar dependencias del sistema (FFmpeg y librerías de audio)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libespeak-dev \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. Copiar los archivos de requerimientos e instalar dependencias de Python
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# 5. Copiar el resto del código del microservicio
COPY . .

# 6. Crear directorios necesarios (como los mencionados en fastapi_app.py)
RUN mkdir -p /app/production_models /app/data/logs

# 7. Exponer el puerto del servicio de IA
EXPOSE 8081

# 8. Comando para arrancar la aplicación
CMD ["uvicorn", "fastapi_app:app", "--host", "0.0.0.0", "--port", "8081"]