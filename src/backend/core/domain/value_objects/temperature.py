
from dataclasses import dataclass
from ..exceptions import InvalidTemperatureError


@dataclass(frozen=True)
class Temperature:
    """
    Objeto de Valor para representar temperaturas en °C.
    Inmutable y con validaciones de dominio.
    """

    value: float

    def __post_init__(self):
        """Valida que la temperatura esté en un rango realista para entornos rurales."""
        if not (-50.0 <= self.value <= 60.0):
            raise InvalidTemperatureError(
                f"Temperatura fuera de rango (-50°C a 60°C): {self.value}°C"
            )

    def __str__(self) -> str:
        return f"{self.value:.1f}°C"
