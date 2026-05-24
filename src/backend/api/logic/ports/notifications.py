from abc import ABC, abstractmethod
from typing import Dict, Any

class NotificationPort(ABC):
    """
    Puerto para el envío de notificaciones y alertas.
    Permite desacoplar el canal (Push, Email, WebSocket) de la lógica.
    """
    @abstractmethod
    def enviar_alerta(self, titulo: str, mensaje: str, prioridad: str = "media") -> bool:
        pass

    @abstractmethod
    def notificar_analisis_ia(self, resultado: Dict[str, Any]) -> bool:
        pass
