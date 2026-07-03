
from abc import ABC, abstractmethod
from typing import Dict, Any


class NotificationPort(ABC):
    """
    Puerto abstracto que define las operaciones de notificación permitidas 
    por el dominio sin acoplarse a servicios externos.
    """

    @abstractmethod
    def enviar_alerta(self, titulo: str, mensaje: str, prioridad: str = "media") -> bool:
        pass

    @abstractmethod
    def notificar_analisis_ia(self, resultado: Dict[str, Any]) -> bool:
        pass
