
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict
from uuid import uuid4


@dataclass
class LabSignal:
    """
    Objeto de transporte para una señal que fluye entre laboratorios/bounded
    contexts a través del EventBusPort. Ver docs/local/PLAN_DIA16-17_INTERCONEXION.md,
    sección 2, para el caso piloto (Telemetría -> Labs/Agricultura).
    """

    source_context: str
    signal_type: str
    timestamp: datetime
    payload: Dict[str, Any]
    signal_id: str = field(default_factory=lambda: str(uuid4()))
    metadata: Dict[str, Any] = field(default_factory=dict)
