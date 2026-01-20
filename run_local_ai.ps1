# ==========================================
# Script de Ejecución Local para IA
# ==========================================

# 1. Configurar Entorno Virtual
$venvPath = Join-Path $PSScriptRoot "src\backend\venv"
if (!(Test-Path $venvPath)) {
    Write-Host "⚠️ No se encontró el entorno virtual en $venvPath"
    Write-Host "Creando nuevo entorno en la raíz..."
    python -m venv venv
    $venvPath = Join-Path $PSScriptRoot "venv"
}

# Activar entorno
$activatePath = Join-Path $venvPath "Scripts\Activate.ps1"
if (Test-Path $activatePath) {
    . $activatePath
} else {
    Write-Host "❌ No se pudo activar el entorno virtual."
    exit 1
}

# 2. Instalar dependencias críticas
Write-Host "📦 Verificando dependencias..."
pip install fastapi uvicorn python-multipart speechrecognition gtts pydub requests

# 3. Configurar PYTHONPATH
# Esto es CRÍTICO para que 'src.ai_models' sea visible
$env:PYTHONPATH = $PSScriptRoot
Write-Host "🔧 PYTHONPATH configurado a: $env:PYTHONPATH"

# 4. Ejecutar Uvicorn
Write-Host "🚀 Iniciando Servicio de IA en puerto 8081..."
python -m uvicorn src.ai_models.fastapi_app:app --reload --host 0.0.0.0 --port 8081
