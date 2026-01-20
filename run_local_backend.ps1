# ==========================================
# Script de Ejecución Local para Backend Django
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

# 2. Instalar dependencias
Write-Host "📦 Verificando dependencias..."
pip install django djangorestframework psycopg2-binary corsheaders

# 3. Configurar Variables de Entorno para Postgres Local
# Asumimos que Docker está corriendo la DB o tienes una local
$env:DB_NAME = "sigct_db"
$env:DB_USER = "user"
$env:DB_PASSWORD = "password"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"

# 4. Ejecutar Migraciones y Servidor
Write-Host "🗄️ Ejecutando migraciones..."
python src/backend/manage.py migrate

Write-Host "🚀 Iniciando Backend Django en puerto 8000..."
python src/backend/manage.py runserver 0.0.0.0:8000
