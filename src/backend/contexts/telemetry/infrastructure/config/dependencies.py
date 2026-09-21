from functools import lru_cache

from django.conf import settings

from shared_kernel.event_bus.infrastructure.in_memory_event_bus import InMemoryEventBus
from shared_kernel.event_bus.ports.event_bus import EventBusPort

from ...ports import SensorReadingRepositoryPort
from ..persistence.django.django_sensor_reading_repository import (
    DjangoSensorReadingRepository,
)
from ..persistence.in_memory.in_memory_sensor_reading_repository import (
    InMemorySensorReadingRepository,
)


def get_sensor_reading_repository() -> SensorReadingRepositoryPort:
    if getattr(settings, "TESTING", False):
        return InMemorySensorReadingRepository()
    return DjangoSensorReadingRepository()


@lru_cache(maxsize=1)
def get_telemetry_event_bus() -> EventBusPort:
    """
    Adaptador de salida de eventos compartido por el contexto telemetry.

    Construye un InMemoryEventBus (único por proceso, vía lru_cache) y lo
    deja cableado con el composition root existente (sigct_backend.wiring:
    wire_all), replicando el mismo patrón que verifica
    verify_dia16_17_pilot.py: al publicar una LecturaSensor, la señal
    sensor_reading la recibe OnSensorReadingHandler (contexts/labs).

    El import de wiring es diferido para evitar acoplar la carga del
    contexto telemetry a la composición raíz del proceso (ver
    sigct_backend/wiring.py, docstring: el composition root se sienta
    encima de los contextos).
    """
    bus = InMemoryEventBus()
    from sigct_backend.wiring import wire_all

    wire_all(bus)
    return bus
