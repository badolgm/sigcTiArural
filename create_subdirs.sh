#!/bin/bash
# -----------------------------------------------------------------------------
# SCRIPT DE CREACIÓN DE SUB-DIRECTORIOS: SIGC&T Rural
#
# Propósito: Crea la estructura de directorios FALTANTE dentro de un
#            repositorio ya clonado.
#
# INSTRUCCIONES:
# 1. Asegúrate de estar en la raíz de tu repositorio clonado.
# 2. Guarda este archivo como 'create_subdirs.sh' en esa raíz.
# 3. Dale permisos de ejecución: chmod +x create_subdirs.sh
# 4. Ejecútalo: ./create_subdirs.sh
# -----------------------------------------------------------------------------

echo "Creando estructura de directorios para SIGC&T Rural..."

# Directorio de Documentación (Basado en MASTERDOC)
mkdir -p docs
mkdir -p docs/architecture
mkdir -p docs/database
mkdir -p docs/uml
mkdir -p docs/sena_artifacts
echo "-> 'docs/' creado."

# Directorio Principal de Código Fuente
mkdir -p src

# Código Fuente: Backend (Cloud - Django)
mkdir -p src/backend
mkdir -p src/backend/sigct_backend # Proyecto Django
mkdir -p src/backend/api          # App de Django para la API REST
mkdir -p src/backend/users        # App de Django para usuarios
echo "-> 'src/backend/' (Django) creado."

# Código Fuente: Frontend (Cloud - React)
mkdir -p src/frontend
mkdir -p src/frontend/src/components
mkdir -p src/frontend/src/pages
mkdir -p src/frontend/src/assets
mkdir -p src/frontend/src/context
echo "-> 'src/frontend/' (React) creado."

# Código Fuente: Modelos de IA
mkdir -p src/ai_models
mkdir -p src/ai_models/notebooks   # Para entrenamiento (Jupyter)
mkdir -p src/ai_models/production_models # Para .h5 y .tflite
echo "-> 'src/ai_models/' creado."

# Código Fuente: Scripts para Sistemas Embebidos (Edge)
mkdir -p src/embedded
mkdir -p src/embedded/bbb_01_gateway
mkdir -p src/embedded/bbb_02_ia_edge
mkdir -p src/embedded/bbb_03_sensors
echo "-> 'src/embedded/' (Edge) creado."

# Directorio de Pruebas
mkdir -p tests
mkdir -p tests/backend
mkdir -p tests/frontend
mkdir -p tests/embedded
echo "-> 'tests/' creado."

# Directorio de Datos (para datasets locales pequeños o CSVs)
mkdir -p data
mkdir -p data/datasets
mkdir -p data/logs
echo "-> 'data/' creado."

# Directorio de Configuración
mkdir -p config # Para .env.example, etc.
echo "-> 'config/' creado."

# --- Creación de archivos base vacíos ---
touch docs/architecture/README.md
touch docs/database/README.md
touch docs/uml/README.md
touch docs/sena_artifacts/README.md
touch src/backend/manage.py
touch src/backend/requirements.txt
touch src/backend/sigct_backend/__init__.py
touch src/backend/sigct_backend/settings.py
touch src/backend/sigct_backend/urls.py
touch src/backend/sigct_backend/wsgi.py
touch src/backend/api/__init__.py
touch src/backend/api/models.py
touch src/backend/api/views.py
touch src/backend/api/urls.py
touch src/backend/api/serializers.py
touch src/backend/users/__init__.py
touch src/frontend/index.html
touch src/frontend/package.json
touch src/frontend/src/main.jsx
touch src/frontend/src/App.jsx
touch src/embedded/bbb_01_gateway/mqtt_broker.py
touch src/embedded/bbb_02_ia_edge/tflite_api.py
touch src/embedded/bbb_03_sensors/sensor_reader.py
touch src/ai_models/notebooks/plant_disease_training.ipynb
touch config/settings.ini
touch .env.example
echo "-> Archivos base vacíos creados."

echo "----------------------------------------"
echo "✅ ¡Estructura de carpetas completada!"
echo "----------------------------------------"
