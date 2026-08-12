
"""
Composition root de shared_kernel/event_bus/.

Este es el ÚNICO lugar del sistema donde se cablean explícitamente los
suscriptores (Pub/Sub) de un EventBusPort a un signal_type concreto. No hay
descubrimiento automático de framework detrás (Django no escanea nada, no hay
AppConfig.ready() involucrado) — la conexión entre "quién publica" y "quién
escucha" queda escrita aquí, a la vista, en vez de implícita.

Decisión explícita del Sub-bloque D (Día 16-17, ver
docs/local/PLAN_DIA16-17_INTERCONEXION.md): se eligió un composition root
invocado a mano en vez de un AppConfig.ready() de Django, por coherencia con
la arquitectura hexagonal del proyecto, que privilegia dependencias explícitas
sobre inversión de control implícita del framework.

Deliberadamente NO se invoca todavía desde ningún punto de arranque real del
proceso (wsgi.py/asgi.py/settings.py/apps.py) — enganchar wire_all() al
arranque de Django es una decisión de alcance aparte, fuera de este piloto.
Hoy se invoca a mano: desde el test de integración (Sub-bloque D) y desde el
script de verificación manual (Sub-bloque E).
"""
from contexts.labs.application.commands.on_sensor_reading_handler import (
    OnSensorReadingHandler,
)

from .ports.event_bus import EventBusPort


def wire_all(event_bus: EventBusPort) -> None:
    """
    Registra, sobre el puerto EventBusPort recibido, todas las suscripciones
    (adaptador -> handler) que conforman el caso piloto Telemetría ->
    Labs/Agricultura.

    Hoy solo existe una: OnSensorReadingHandler queda suscrito a las señales
    signal_type="sensor_reading" publicadas por telemetry (ver
    RegistrarLecturaSensorCommand). Nuevas interconexiones futuras entre
    laboratorios se agregarían aquí mismo, como líneas adicionales, sin tocar
    ni el puerto ni los handlers existentes.
    """
    handler = OnSensorReadingHandler()
    event_bus.subscribe("sensor_reading", handler.manejar)
