
from dataclasses import dataclass
from ..exceptions import InvalidHumidityError


@dataclass(frozen=True)
class Humidity:
    """
    Objeto de Valor para representar humedad relativa en %.
    Inmutable y con validaciones de dominio.
    """

    value: float

    def __post_init__(self):
        """Valida que la humedad esté entre 0% y 100%."""
        if not (0.0 <= self.value <= 100.0):
            raise InvalidHumidityError(
                f"Humedad fuera de rango (0% a 100%): {self.value}%"
            )

    def __str__(self) -> str:
        return f"{self.value:.1f}%"
