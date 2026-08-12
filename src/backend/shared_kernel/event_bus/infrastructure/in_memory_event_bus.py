
from collections import defaultdict
from typing import Callable, Dict, List

from ..domain.lab_signal import LabSignal
from ..ports.event_bus import EventBusPort


class InMemoryEventBus(EventBusPort):
    """
    Adaptador en memoria de EventBusPort. Entrega síncrona a los suscriptores
    del mismo signal_type, sin persistencia ni reintentos — mismo alcance
    liviano del resto del ecosistema (ver CLAUDE.md, Gestión de recursos).
    """

    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[LabSignal], None]]] = defaultdict(list)

    def publish(self, signal: LabSignal) -> None:
        for handler in self._subscribers.get(signal.signal_type, []):
            handler(signal)

    def subscribe(self, signal_type: str, handler: Callable[[LabSignal], None]) -> None:
        self._subscribers[signal_type].append(handler)
