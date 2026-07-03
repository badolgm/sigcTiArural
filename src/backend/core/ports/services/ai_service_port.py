
from abc import ABC, abstractmethod
from typing import Dict, Any


class AIServicePort(ABC):
    """
    Puerto para la comunicación con el servicio de Inteligencia Artificial.
    """

    @abstractmethod
    def predecir_enfermedad(self, imagen_bytes: bytes) -> Dict[str, Any]:
        pass

    @abstractmethod
    def obtener_sugerencias_productividad(self, datos_sensores: Dict[str, Any]) -> Dict[str, Any]:
        pass
