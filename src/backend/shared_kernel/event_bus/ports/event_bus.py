
from abc import ABC, abstractmethod
from typing import Callable

from ..domain.lab_signal import LabSignal


class EventBusPort(ABC):
    """
    Puerto de salida para la publicación/suscripción de señales (LabSignal)
    entre laboratorios y bounded contexts.
    """

    @abstractmethod
    def publish(self, signal: LabSignal) -> None:
        pass

    @abstractmethod
    def subscribe(self, signal_type: str, handler: Callable[[LabSignal], None]) -> None:
        pass
