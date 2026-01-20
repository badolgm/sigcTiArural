#!/bin/bash

# ==========================================
# Script de Ejecución Local para IA (Git Bash)
# ==========================================

echo "🚀 Iniciando configuración de entorno para IA..."

# 1. Configurar Entorno Virtual
if [ ! -d "venv" ]; then
    echo "⚠️ No se encontró el entorno virtual 'venv'."
    echo "Creando nuevo entorno en la raíz..."
    python -m venv venv
fi

# Activar entorno (Soporte para Git Bash en Windows)
source venv/Scripts/activate

# 2. Instalar dependencias críticas
echo "📦 Verificando dependencias..."
pip install fastapi uvicorn python-multipart speechrecognition gtts pydub requests

# 3. Configurar PYTHONPATH
# Esto es CRÍTICO para que 'src.ai_models' sea visible
export PYTHONPATH=$PYTHONPATH:$(pwd)
echo "🔧 PYTHONPATH configurado: $PYTHONPATH"

# 4. Ejecutar Uvicorn
echo "🚀 Iniciando Servicio de IA en puerto 8081..."
python -m uvicorn src.ai_models.fastapi_app:app --reload --host 0.0.0.0 --port 8081
