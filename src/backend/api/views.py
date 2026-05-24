from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import SensorReading, Robot, RobotTelemetry, RobotCommand
from .serializers import SensorReadingSerializer, RobotSerializer, RobotTelemetrySerializer, RobotCommandSerializer
from django.utils import timezone
from datetime import timedelta
import random

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

# ==============================================================================
# ARQUITECTURA HEXAGONAL V2 (REFACCIONADA)
# ==============================================================================
from .logic.domain.services import LaboratorioService
from .logic.domain.factories import LaboratorioStrategyFactory
from .logic.adapters.persistence import DjangoRepository

class TelemetryHistoryV2View(APIView):
    """
    Versión refactorizada de TelemetryHistoryView usando Arquitectura Hexagonal y Factory Strategy.
    """
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.repository = DjangoRepository()

    def get(self, request):
        # Obtener el tipo de laboratorio de los parámetros (por defecto ROBOTICA)
        tipo_lab = request.query_params.get('tipo', 'ROBOTICA')
        
        try:
            service = LaboratorioService(tipo_lab)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        # 1. Intentamos obtener datos del puerto de persistencia (Adaptador Django)
        # Aquí podríamos filtrar por sensor_id según el laboratorio
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
            
        # 2. Fallback: Lógica de dominio pura para datos simulados
        data_simulada = service.obtener_simulacion_historica()
        return Response(data_simulada)

from .logic.adapters.ai_service import FastAPI_AIAdapter

class AICropAdviceView(APIView):
    """
    Nuevo endpoint que utiliza el Adaptador de IA para dar sugerencias.
    Demuestra la Arquitectura Hexagonal aplicada a servicios externos.
    """
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ai_adapter = FastAPI_AIAdapter()
        self.repository = DjangoRepository()

    def get(self, request):
        # Obtenemos el último dato de sensores
        last_reading = self.repository.listar_todos('api.SensorReading')
        if not last_reading:
            return Response({"error": "No hay datos de sensores para analizar"}, status=404)
        
        reading = last_reading[0]
        datos = {
            "temperature": reading.temperature,
            "humidity": reading.humidity,
            "sensor_id": reading.sensor_id
        }
        
        # Pedimos sugerencia al Adaptador de IA
        sugerencia = self.ai_adapter.obtener_sugerencias_productividad(datos)
        
        return Response({
            "datos_analizados": datos,
            "ia_feedback": sugerencia
        })