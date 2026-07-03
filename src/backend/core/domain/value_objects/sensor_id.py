
from dataclasses import dataclass
from ..exceptions import InvalidSensorIdError


@dataclass(frozen=True)
class SensorId:
    """
    Objeto de Valor para representar identificadores de sensores.
    """

    value: str

    def __post_init__(self):
        """Valida que el ID del sensor no esté vacío y limpia el valor."""
        if not self.value or not isinstance(self.value, str) or len(self.value.strip()) == 0:
            raise InvalidSensorIdError("El ID del sensor no puede estar vacío")
        object.__setattr__(self, 'value', self.value.strip())

    def __str__(self) -> str:
        return self.value
