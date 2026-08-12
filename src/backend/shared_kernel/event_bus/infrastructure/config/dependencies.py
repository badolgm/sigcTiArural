
from functools import lru_cache

from ...ports.event_bus import EventBusPort
from ..in_memory_event_bus import InMemoryEventBus


@lru_cache(maxsize=1)
def get_event_bus() -> EventBusPort:
    """
    Singleton de proceso: a diferencia de get_sensor_reading_repository()
    (cuyo estado real vive en la BD), el estado de InMemoryEventBus vive en el
    propio objeto — publicadores y suscriptores deben compartir la misma
    instancia para que subscribe()/publish() funcionen de punta a punta.
    """
    return InMemoryEventBus()
