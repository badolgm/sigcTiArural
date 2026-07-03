
from typing import List, Optional
from core.ports.repositories import SensorReadingRepositoryPort
from core.domain.entities import SensorReading


class InMemorySensorReadingRepository(SensorReadingRepositoryPort):
    """
    Repositorio en memoria para tests unitarios (no requiere BD).
    """

    def __init__(self):
        self._readings: List[SensorReading] = []
        self._next_id: int = 1

    def save(self, reading: SensorReading) -> SensorReading:
        if reading.id is None:
            reading.id = self._next_id
            self._next_id += 1
        else:
            # Eliminar la versión anterior si existe
            self._readings = [r for r in self._readings if r.id != reading.id]
        self._readings.append(reading)
        return reading

    def get_all(self, limit: Optional[int] = None) -> List[SensorReading]:
        if limit is not None:
            return self._readings[-limit:]  # Últimos N
        return self._readings.copy()

    def get_by_id(self, reading_id: int) -> Optional[SensorReading]:
        for reading in self._readings:
            if reading.id == reading_id:
                return reading
        return None
