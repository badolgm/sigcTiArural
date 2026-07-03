
from typing import List, Optional
from api.models import SensorReading as DjangoSensorReading
from core.ports.repositories import SensorReadingRepositoryPort
from core.domain.entities import SensorReading
from ..mappers.sensor_reading_mapper import SensorReadingMapper


class DjangoSensorReadingRepository(SensorReadingRepositoryPort):
    """
    Adaptador de Persistencia para SensorReading usando Django ORM.
    """

    def save(self, reading: SensorReading) -> SensorReading:
        django_obj = SensorReadingMapper.to_django(reading)
        django_obj.save()
        return SensorReadingMapper.to_domain(django_obj)

    def get_all(self, limit: Optional[int] = None) -> List[SensorReading]:
        queryset = DjangoSensorReading.objects.all()
        if limit is not None:
            queryset = queryset[:limit]
        return [SensorReadingMapper.to_domain(obj) for obj in queryset]

    def get_by_id(self, reading_id: int) -> Optional[SensorReading]:
        try:
            django_obj = DjangoSensorReading.objects.get(id=reading_id)
            return SensorReadingMapper.to_domain(django_obj)
        except DjangoSensorReading.DoesNotExist:
            return None
