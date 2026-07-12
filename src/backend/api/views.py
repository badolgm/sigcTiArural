from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import SensorReading, Robot, RobotTelemetry, RobotCommand
from .serializers import SensorReadingSerializer, RobotSerializer, RobotTelemetrySerializer, RobotCommandSerializer
from django.utils import timezone
from datetime import datetime, timedelta
import random

# ==============================================================================
# VIEWS LEGACY (MANTENIDAS PARA COMPATIBILIDAD
# ==============================================================================
class RobotViewSet(viewsets.ModelViewSet):
    queryset = Robot.objects.all()
    serializer_class = RobotSerializer
    permission_classes = [AllowAny]

class RobotTelemetryViewSet(viewsets.ModelViewSet):
    queryset = RobotTelemetry.objects.all()
    serializer_class = RobotTelemetrySerializer
    permission_classes = [AllowAny]

class RobotCommandViewSet(viewsets.ModelViewSet):
    queryset = RobotCommand.objects.all()
    serializer_class = RobotCommandSerializer
    permission_classes = [AllowAny]

class TelemetryHistoryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
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
            return Response(data[::-1])
            
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

# ==============================================================================
# ARQUITECTURA HEXAGONAL V3 (REFACTORIZACIÓN COMPLETA)
# ==============================================================================
try:
    from core.domain.services import LabService
    from infrastructure.config.dependencies import (
        get_sensor_reading_repository,
        get_ai_service,
        get_notification_service,
    )
    HEXAGONAL_V3_AVAILABLE = True
except ImportError:
    HEXAGONAL_V3_AVAILABLE = False

if HEXAGONAL_V3_AVAILABLE:
    class TelemetryHistoryV3View(APIView):
        permission_classes = [AllowAny]

        def get(self, request):
            tipo_lab = request.query_params.get('tipo', 'ROBOTICA')
            
            try:
                service = LabService(
                    tipo_lab,
                    notification_port=get_notification_service())
            except ValueError as e:
                return Response({"error": str(e)}, status=400)

            repository = get_sensor_reading_repository()
            readings = repository.get_all(limit=24)
            
            if readings:
                items = []
                for r in readings[::-1]:
                    items.append({
                        "reading_id": r.id,
                        "sensor_id": str(r.sensor_id),
                        "timestamp": r.timestamp.isoformat(),
                        "temperature": r.temperature.value,
                        "humidity": r.humidity.value,
                    })
                return Response({
                    "context": "telemetry",
                    "contract_version": "v1",
                    "source_mode": "live",
                    "lab_type": tipo_lab,
                    "count": len(items),
                    "items": items,
                })
                
            data_simulada = service.obtener_simulacion_historica()
            items = []
            for item in data_simulada:
                raw_timestamp = item.get("timestamp")
                raw_time = item.get("time")

                if raw_timestamp and "T" in str(raw_timestamp):
                    normalized_timestamp = str(raw_timestamp)
                elif raw_time:
                    try:
                        parsed_time = datetime.strptime(str(raw_time), "%H:%M")
                        now = timezone.now()
                        normalized_timestamp = now.replace(
                            hour=parsed_time.hour,
                            minute=parsed_time.minute,
                            second=0,
                            microsecond=0,
                        ).isoformat()
                    except ValueError:
                        normalized_timestamp = timezone.now().isoformat()
                else:
                    normalized_timestamp = timezone.now().isoformat()

                items.append({
                    "reading_id": None,
                    "sensor_id": item.get("sensor", "Simulado"),
                    "timestamp": normalized_timestamp,
                    "temperature": item.get("temp"),
                    "humidity": item.get("humidity"),
                })
            return Response({
                "context": "telemetry",
                "contract_version": "v1",
                "source_mode": "simulated",
                "lab_type": tipo_lab,
                "count": len(items),
                "items": items,
            })

    class AICropAdviceV3View(APIView):
        permission_classes = [AllowAny]

        def get(self, request):
            repository = get_sensor_reading_repository()
            ai_adapter = get_ai_service()
            
            readings = repository.get_all(limit=1)
            if not readings:
                return Response({"error": "No hay datos de sensores para analizar"}, status=404)
            
            reading = readings[-1]
            datos = {
                "temperature": reading.temperature.value,
                "humidity": reading.humidity.value,
                "sensor_id": str(reading.sensor_id)
            }
            
            sugerencia = ai_adapter.obtener_sugerencias_productividad(datos)
            
            return Response({
                "datos_analizados": datos,
                "ia_feedback": sugerencia
            })

# ==============================================================================
# ARQUITECTURA HEXAGONAL V2 (REFACCIONADA - MANTENIDA)
# ==============================================================================
from .logic.domain.services import LaboratorioService as LegacyLaboratorioService
from .logic.domain.factories import LaboratorioStrategyFactory
from .logic.adapters.persistence import DjangoRepository

class TelemetryHistoryV2View(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.repository = DjangoRepository()

    def get(self, request):
        tipo_lab = request.query_params.get('tipo', 'ROBOTICA')
        
        try:
            service = LegacyLaboratorioService(tipo_lab)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        readings = self.repository.listar_todos('api.SensorReading')[:24]
        
        if readings:
            data = []
            for r in readings:
                data.append({
                    "time": r.timestamp.strftime("%H:%M"),
                    "temp": r.temperature,
                    "humidity": r.humidity,
                    "sensor": f"{r.sensor_id} ({tipo_lab} V2)"
                })
            return Response(data[::-1])
            
        data_simulada = service.obtener_simulacion_historica()
        return Response(data_simulada)

from .logic.adapters.ai_service import FastAPI_AIAdapter

class AICropAdviceView(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ai_adapter = FastAPI_AIAdapter()
        self.repository = DjangoRepository()

    def get(self, request):
        last_reading = self.repository.listar_todos('api.SensorReading')
        if not last_reading:
            return Response({"error": "No hay datos de sensores para analizar"}, status=404)
        
        reading = last_reading[0]
        datos = {
            "temperature": reading.temperature,
            "humidity": reading.humidity,
            "sensor_id": reading.sensor_id
        }
        
        sugerencia = self.ai_adapter.obtener_sugerencias_productividad(datos)
        
        return Response({
            "datos_analizados": datos,
            "ia_feedback": sugerencia
        })
