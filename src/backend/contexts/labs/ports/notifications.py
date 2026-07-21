"""
Contrato de interfaz para el sistema de alertas y notificaciones de SIGC&T Rural.
Alineado con los requerimientos de desacoplamiento de la arquitectura hexagonal (ADSO).
"""
from abc import ABC, abstractmethod
from typing import Dict, Any

class NotificationPort(ABC):
    """
    Puerto abstracto que define las operaciones de notificación permitidas
    por el dominio sin acoplarse a servicios externos (Email, SMS, WebSocket o Consola).
    """

    @abstractmethod
    def enviar_alerta(self, titulo: str, mensaje: str, prioridad: str = "media") -> bool:
        """
        Despacha una alerta genérica o de telemetría (e.g., estrés crítico en agricultura).

        :param titulo: Título corto de la anomalía o evento.
        :param mensaje: Detalle completo de las variables físicas que superaron los umbrales.
        :param prioridad: Nivel de criticidad ('baja', 'media', 'alta').
        :return: True si fue procesada por el adaptador, False en caso contrario.
        """
        pass

    @abstractmethod
    def notificar_analisis_ia(self, resultado: Dict[str, Any]) -> bool:
        """
        Despacha los resultados detallados e inferencias generadas por el microservicio de IA.

        :param resultado: Diccionario con el diagnóstico, confianza y metadatos de la planta.
        :return: True si la notificación se envió correctamente, False en caso contrario.
        """
        pass
