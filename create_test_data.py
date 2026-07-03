
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigct_backend.settings')
django.setup()

from api.models import SensorReading
from datetime import datetime

# Crear dato de prueba
reading = SensorReading.objects.create(
    sensor_id="test_sensor_001",
    temperature=25.5,
    humidity=60.0,
    timestamp=datetime.now()
)

print(f"Dato de prueba creado: {reading}")
print(f"ID: {reading.id}")
