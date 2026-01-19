#!/bin/bash
# Activa el entorno virtual desde la carpeta del proyecto de IA
source src/ai_models/venv/Scripts/activate

# Inicia el servidor Uvicorn apuntando a la ruta correcta del módulo
# Se ejecuta desde la raíz del proyecto.
uvicorn src.ai_models.fastapi_app:app --host 0.0.0.0 --port 8081 --reload
