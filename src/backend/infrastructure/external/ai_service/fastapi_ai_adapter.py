
from core.ports.services import AIServicePort
from typing import Dict, Any
import requests
import os
from tenacity import retry, stop_after_attempt, wait_exponential


class FastAPIAIAdapter(AIServicePort):
    """
    Adaptador para el microservicio de IA implementado en FastAPI.
    """

    def __init__(self):
        self.base_url = os.environ.get('AI_SERVICE_URL', 'http://ai_service:8081')

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def predecir_enfermedad(self, imagen_bytes: bytes) -> Dict[str, Any]:
        url = f"{self.base_url}/infer"
        try:
            files = {'file': ('image.jpg', imagen_bytes, 'image/jpeg')}
            response = requests.post(url, files=files, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": f"Error conectando con IA Service: {str(e)}"}

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=1, max=5))
    def obtener_sugerencias_productividad(self, datos_sensores: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}/suggest"
        try:
            response = requests.post(url, json=datos_sensores, timeout=5)
            response.raise_for_status()
            return response.json()
        except Exception:
            return self._sugerencias_basicas(datos_sensores)

    def _sugerencias_basicas(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        temp = datos.get('temperature', 20)
        hum = datos.get('humidity', 50)
        sug = "Condiciones estables."
        if temp > 30:
            sug = "Alerta: Temperatura alta. Aumentar ventilación."
        if hum < 40:
            sug = "Alerta: Humedad baja. Activar riego."
        return {"sugerencia": sug, "fuente": "Fallback Local"}
