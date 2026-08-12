
import logging
from collections import defaultdict
from typing import Callable, Dict, List

from ..domain.lab_signal import LabSignal
from ..ports.event_bus import EventBusPort

logger = logging.getLogger(__name__)


class InMemoryEventBus(EventBusPort):
    """
    Adaptador en memoria de EventBusPort. Entrega síncrona a los suscriptores
    del mismo signal_type, sin persistencia ni reintentos — mismo alcance
    liviano del resto del ecosistema (ver CLAUDE.md, Gestión de recursos).
    """

    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[LabSignal], None]]] = defaultdict(list)

    def publish(self, signal: LabSignal) -> None:
        """
        Aislamiento de fallos entre suscriptores: si un handler lanza, se
        registra en el log y se continúa con el resto -- un suscriptor roto
        no debe impedir que los demás reciban la señal, ni propagar la
        excepción hasta el publicador (que ya pudo haber persistido datos
        antes de publicar, ver RegistrarLecturaSensorCommand).
        """
        for handler in self._subscribers.get(signal.signal_type, []):
            try:
                handler(signal)
            except Exception:
                logger.exception(
                    "Suscriptor de signal_type=%r lanzó una excepción; se continúa con el resto",
                    signal.signal_type,
                )

    def subscribe(self, signal_type: str, handler: Callable[[LabSignal], None]) -> None:
        self._subscribers[signal_type].append(handler)
