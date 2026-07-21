from ...ports.notifications import NotificationPort
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class ConsoleNotificationAdapter(NotificationPort):
    """
    Adaptador básico de notificaciones por consola.
    En producción, este adaptador se cambiaría por uno de RabbitMQ,
    Firebase (FCM) o Django Channels (WebSockets).
    """
    def enviar_alerta(self, titulo: str, mensaje: str, prioridad: str = "media") -> bool:
        print(f"\n🔔 [ALERTA {prioridad.upper()}]: {titulo} - {mensaje}")
        logger.info(f"Notificación enviada: {titulo}")
        return True

    def notificar_analisis_ia(self, resultado: Dict[str, Any]) -> bool:
        tipo = resultado.get("tipo", "desconocido")
        estado = resultado.get("estado", "procesado")
        print(f"\n🤖 [IA NOTIFICACIÓN]: Análisis de {tipo} finalizado con estado {estado}")
        return True
