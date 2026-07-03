
from ..strategies import (
    LabStrategy,
    RoboticsStrategy,
    AgricultureStrategy,
    ElectronicsStrategy,
    TelecomStrategy,
)


class LabStrategyFactory:
    """
    Factoría para instanciar la estrategia de laboratorio adecuada.
    """

    _strategies = {
        "ROBOTICA": RoboticsStrategy,
        "TELECOMUNICACIONES": TelecomStrategy,
        "AGRICULTURA": AgricultureStrategy,
        "ELECTRONICA": ElectronicsStrategy,
    }

    @staticmethod
    def get_strategy(tipo: str) -> LabStrategy:
        strategy_class = LabStrategyFactory._strategies.get(tipo.upper())
        if not strategy_class:
            raise ValueError(f"Tipo de laboratorio no soportado: {tipo}")
        return strategy_class()
