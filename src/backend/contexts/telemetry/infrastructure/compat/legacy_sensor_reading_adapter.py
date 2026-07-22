"""
Puente de compatibilidad temporal para TelemetryHistoryV2View
(api/views.py) -- la unica vista con esta ruta que sirve trafico
real sin condicion hoy.

Traduce las entidades de dominio de contexts/telemetry/ (que envuelven
temperature/humidity en value objects) a la forma plana que la vista
legacy espera (floats simples), replicando la firma de
DjangoRepository.listar_todos(modelo_nombre) para minimizar el cambio
en la vista al repuntar (Dia 10, Paso 3): solo cambia que linea
instancia self.repository en __init__, el resto del metodo get() no
se toca.

Vida util esperada: hasta que TelemetryHistoryV2View se reescriba
para consumir la entidad de dominio nativamente (Opcion B, evaluada
y diferida en el analisis de solo lectura del Paso 2). Cuando eso
pase, este archivo se elimina.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from ...ports import SensorReadingRepositoryPort
from ..config.dependencies import get_sensor_reading_repository


@dataclass(frozen=True)
class FlatSensorReading:
    """Forma plana de una lectura, compatible con lo que hoy lee
    TelemetryHistoryV2View: r.timestamp, r.temperature, r.humidity,
    r.sensor_id -- sin value objects."""

    timestamp: datetime
    temperature: float
    humidity: float
    sensor_id: str


class LegacySensorReadingRepositoryAdapter:
    """
    Expone listar_todos(modelo_nombre) con la misma firma que
    api.logic.adapters.persistence.DjangoRepository, pero lee desde
    contexts/telemetry/ (via el composition root del Paso 1) en vez
    del modelo Django plano.
    """

    _MODELO_SOPORTADO = "api.SensorReading"

    def __init__(self, repository: Optional[SensorReadingRepositoryPort] = None):
        self._repository = repository or get_sensor_reading_repository()

    def listar_todos(self, modelo_nombre: str) -> list[FlatSensorReading]:
        if modelo_nombre != self._MODELO_SOPORTADO:
            raise ValueError(
                f"LegacySensorReadingRepositoryAdapter solo soporta "
                f"'{self._MODELO_SOPORTADO}', recibido: '{modelo_nombre}'"
            )

        # Sin limite: replica list(model.objects.all()) del
        # DjangoRepository original byte a byte. La vista sigue
        # aplicando su propio [:24] sobre el resultado -- no se
        # optimiza aqui para no mezclar "cambiar la fuente" con
        # "ademas optimizar un path legacy" en el mismo paso.
        entidades = self._repository.get_all()

        return [
            FlatSensorReading(
                timestamp=e.timestamp,
                temperature=e.temperature.value,
                humidity=e.humidity.value,
                sensor_id=e.sensor_id.value,
            )
            for e in entidades
        ]
