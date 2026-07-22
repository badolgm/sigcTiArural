from django.conf import settings

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
