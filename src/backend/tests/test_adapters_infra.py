"""
Infrastructure Adapter Tests for Hexagonal Architecture (Fase 2).

Certifica el comportamiento de los adaptadores de infraestructura
(FastAPI_AIAdapter y ConsoleNotificationAdapter) frente a llamadas externas,
asegurando el correcto aislamiento de interfaces mediante el uso de Mocks.
"""

import pytest
from unittest.mock import patch, MagicMock
import requests

from api.logic.adapters.ai_service import FastAPI_AIAdapter
from api.logic.adapters.notifications import ConsoleNotificationAdapter


# ============================================================
# PRUEBAS PARA EL ADAPTADOR DE IA (api/logic/adapters/ai_service.py)
# ============================================================

def test_adaptador_ia_predecir_enfermedad_exitoso():
    """Simula una petición de inferencia HTTP exitosa a /infer para predecir enfermedad."""
    adaptador = FastAPI_AIAdapter()
    imagen_simulada = b"fake_jpeg_bytes"
    
    with patch("api.logic.adapters.ai_service.requests.post") as mock_post:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "ok",
            "diagnosis": "Tomato_Early_blight",
            "confidence": 0.87
        }
        mock_post.return_value = mock_response
        
        resultado = adaptador.predecir_enfermedad(imagen_simulada)
        
        assert resultado["status"] == "ok"
        assert resultado["diagnosis"] == "Tomato_Early_blight"
        mock_post.assert_called_once()


def test_adaptador_ia_predecir_enfermedad_fallido_except():
    """Simula un fallo de red en /infer cubriendo el bloque except de predecir_enfermedad."""
    adaptador = FastAPI_AIAdapter()
    
    with patch("api.logic.adapters.ai_service.requests.post", side_effect=requests.exceptions.RequestException("Error de conexión simulado")):
        resultado = adaptador.predecir_enfermedad(b"fake_bytes")
        
        assert "error" in resultado
        assert "Error conectando con IA Service" in resultado["error"]


def test_adaptador_ia_sugerencias_exitoso():
    """Simula una respuesta HTTP exitosa del endpoint /suggest de la IA."""
    adaptador = FastAPI_AIAdapter()
    datos_sensores = {"temperature": 25, "humidity": 60}
    
    with patch("api.logic.adapters.ai_service.requests.post") as mock_post:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"sugerencia": "Mantener riego normal", "fuente": "IA"}
        mock_post.return_value = mock_response
        
        resultado = adaptador.obtener_sugerencias_productividad(datos_sensores)
        
        assert resultado["sugerencia"] == "Mantener riego normal"


def test_adaptador_ia_sugerencias_fallido_activa_fallback_local():
    """Simula caída de /suggest para cubrir el bloque except que activa el Fallback Local."""
    adaptador = FastAPI_AIAdapter()
    datos_criticos = {"temperature": 35, "humidity": 30}  # Provocará alertas en tu lógica
    
    with patch("api.logic.adapters.ai_service.requests.post", side_effect=requests.exceptions.RequestException):
        resultado = adaptador.obtener_sugerencias_productividad(datos_criticos)
        
        # Debe saltar a tu método _sugerencias_basicas
        assert resultado["fuente"] == "Fallback Local"
        assert "Humedad baja" in resultado["sugerencia"]


# ============================================================
# PRUEBAS PARA EL ADAPTADOR DE NOTIFICACIONES (api/logic/adapters/notifications.py)
# ============================================================

def test_adaptador_notificaciones_enviar_alerta():
    """Verifica la ejecución de enviar_alerta con sus parámetros reales."""
    adaptador = ConsoleNotificationAdapter()
    
    resultado = adaptador.enviar_alerta(
        titulo="Alerta Sensores",
        mensaje="Temperatura fuera de rango",
        prioridad="alta"
    )
    assert resultado is True


def test_adaptador_notificaciones_analisis_ia():
    """Verifica la ejecución de notificar_analisis_ia."""
    adaptador = ConsoleNotificationAdapter()
    datos_analisis = {"tipo": "Tomate", "estado": "crítico"}
    
    resultado = adaptador.notificar_analisis_ia(datos_analisis)
    assert resultado is True