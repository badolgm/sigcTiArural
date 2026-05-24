from ..ports.ai_service import AIServicePort
from typing import Dict, Any
import requests
import os

class FastAPI_AIAdapter(AIServicePort):
    """
    Adaptador para el microservicio de IA implementado en FastAPI.
    """
    def __init__(self):
        # En Docker, el host es 'ai_service'. En local es 'localhost'.
        self.base_url = os.environ.get('AI_SERVICE_URL', 'http://ai_service:8081')

    def predecir_enfermedad(self, imagen_bytes: bytes) -> Dict[str, Any]:
        url = f"{self.base_url}/infer"
        try:
            files = {'file': ('image.jpg', imagen_bytes, 'image/jpeg')}
            response = requests.post(url, files=files, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": f"Error conectando con IA Service: {str(e)}"}

    def obtener_sugerencias_productividad(self, datos_sensores: Dict[str, Any]) -> Dict[str, Any]:
        # Suponiendo que hay un endpoint para esto en el futuro
        url = f"{self.base_url}/suggest"
        try:
            response = requests.post(url, json=datos_sensores, timeout=5)
            response.raise_for_status()
            return response.json()
        except Exception:
            # Fallback a sugerencias básicas si el servicio de IA no responde
            return self._sugerencias_basicas(datos_sensores)

    def _sugerencias_basicas(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        temp = datos.get('temperature', 20)
        hum = datos.get('humidity', 50)
        sug = "Condiciones estables."
        if temp > 30: sug = "Alerta: Temperatura alta. Aumentar ventilación."
        if hum < 40: sug = "Alerta: Humedad baja. Activar riego."
        return {"sugerencia": sug, "fuente": "Fallback Local"}
