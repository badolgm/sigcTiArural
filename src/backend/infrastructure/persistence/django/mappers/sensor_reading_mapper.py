
from typing import Optional
from api.models import SensorReading as DjangoSensorReading
from core.domain.entities import SensorReading
from core.domain.value_objects import Temperature, Humidity, SensorId


class SensorReadingMapper:
    """
    Mapeador bidireccional entre Modelo Django y Entidad de Dominio.
    """

    @staticmethod
    def to_domain(django_model: DjangoSensorReading) -> SensorReading:
        """Convierte un modelo Django a entidad de dominio."""
        return SensorReading(
            id=django_model.id,
            sensor_id=SensorId(value=django_model.sensor_id),
            temperature=Temperature(value=django_model.temperature),
            humidity=Humidity(value=django_model.humidity),
            timestamp=django_model.timestamp
        )

    @staticmethod
    def to_django(domain_entity: SensorReading) -> DjangoSensorReading:
        """Convierte una entidad de dominio a modelo Django (para guardar)."""
        django_data = {
            "sensor_id": str(domain_entity.sensor_id),
            "temperature": domain_entity.temperature.value,
            "humidity": domain_entity.humidity.value,
            "timestamp": domain_entity.timestamp
        }

        if domain_entity.id is not None:
            # Si ya tiene ID, es una actualización
            return DjangoSensorReading(id=domain_entity.id, **django_data)
        # Si no, es una nueva instancia
        return DjangoSensorReading(**django_data)
