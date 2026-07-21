
from abc import ABC, abstractmethod
from typing import List, Optional
from ..domain.entities import SensorReading


class SensorReadingRepositoryPort(ABC):
    """
    Puerto de salida para la persistencia de lecturas de sensores.
    """

    @abstractmethod
    def save(self, reading: SensorReading) -> SensorReading:
        pass

    @abstractmethod
    def get_all(self, limit: Optional[int] = None) -> List[SensorReading]:
        pass

    @abstractmethod
    def get_by_id(self, reading_id: int) -> Optional[SensorReading]:
        pass
