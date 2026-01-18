# Dockerfile para el Backend de Django

# Usa una imagen base de Python
FROM python:3.11-slim-bullseye

# Establece variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala las dependencias del sistema necesarias
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    pkg-config \
    build-essential \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia el archivo requirements.txt y las dependencias de Python
COPY requirements.txt .

# Instala las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código de la aplicación
COPY . .

# Expone el puerto en el que se ejecutará la aplicación Django
EXPOSE 8000

# Define el comando para ejecutar el servidor de desarrollo de Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
