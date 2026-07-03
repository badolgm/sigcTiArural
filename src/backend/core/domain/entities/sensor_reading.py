
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from ..value_objects import Temperature, Humidity, SensorId


@dataclass
class SensorReading:
    """
    Entidad de Dominio para representar una lectura de sensor.
    Contiene invariantes de negocio y objetos de valor.
    """

    sensor_id: SensorId
    temperature: Temperature
    humidity: Humidity
    timestamp: datetime = field(default_factory=datetime.now)
    id: Optional[int] = None  # ID de persistencia (solo para adaptadores)

    def __post_init__(self):
        """Validaciones de dominio adicionales."""
        if self.timestamp > datetime.now():
            raise ValueError("La fecha y hora no puede estar en el futuro")

    def __str__(self) -> str:
        return f"SensorReading[{self.sensor_id}]: {self.temperature}, {self.humidity} @ {self.timestamp}"
