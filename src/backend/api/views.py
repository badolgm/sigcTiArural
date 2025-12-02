from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import SensorReading
from .serializers import SensorReadingSerializer
from django.utils import timezone
from datetime import timedelta
import random

class TelemetryHistoryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Datos reales (últimas 24h)
        readings = SensorReading.objects.all()[:24]
        
        if readings.exists():
            data = []
            for r in readings:
                data.append({
                    "time": r.timestamp.strftime("%H:%M"),
                    "temp": r.temperature,
                    "humidity": r.humidity,
                    "sensor": r.sensor_id
                })
            # Invertir para orden cronológico en gráfica
            return Response(data[::-1])
            
        # Fallback: Datos simulados si la BD está vacía (para Demo)
        return Response(self.generate_mock_data())

    def generate_mock_data(self):
        data = []
        now = timezone.now()
        temp, hum = 24.0, 65.0
        for i in range(24):
            time_slot = now - timedelta(hours=23-i)
            temp += random.uniform(-1, 1)
            hum += random.uniform(-2, 2)
            data.append({
                "time": time_slot.strftime("%H:%M"),
                "temp": round(temp, 1),
                "humidity": round(hum, 1),
                "sensor": "Simulado"
            })
        return data