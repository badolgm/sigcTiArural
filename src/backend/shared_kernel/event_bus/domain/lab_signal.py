
from dataclasses import dataclass, field
from datetime import datetime
from types import MappingProxyType
from typing import Any, Dict
from uuid import uuid4


@dataclass(frozen=True)
class LabSignal:
    """
    Objeto de valor (inmutable) de transporte para una señal que fluye entre
    laboratorios/bounded contexts a través del EventBusPort. Ver
    docs/local/PLAN_DIA16-17_INTERCONEXION.md, sección 2, para el caso piloto
    (Telemetría -> Labs/Agricultura).

    frozen=True + payload/metadata envueltos en MappingProxyType (ver
    __post_init__): InMemoryEventBus.publish() entrega la MISMA instancia a
    cada suscriptor en secuencia, sin copia defensiva -- si un suscriptor
    pudiera mutar la señal, el siguiente vería esa mutación de forma invisible
    en el call site, dependiente del orden de subscribe(). Mismo criterio de
    inmutabilidad que Temperature/Humidity/SensorId.
    """

    source_context: str
    signal_type: str
    timestamp: datetime
    payload: Dict[str, Any]
    signal_id: str = field(default_factory=lambda: str(uuid4()))
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        object.__setattr__(self, "payload", MappingProxyType(dict(self.payload)))
        object.__setattr__(self, "metadata", MappingProxyType(dict(self.metadata)))
