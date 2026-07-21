from ..strategies.robotica import ProcesadorRobotica
from ..strategies.telecom import ProcesadorTelecomunicaciones
from ..strategies.agricultura import ProcesadorAgricultura
from ..strategies.electronica import ProcesadorElectronica
from ..strategies.base import ProcesadorLaboratorioStrategy

class LaboratorioStrategyFactory:
    """
    Factoría para instanciar la estrategia de laboratorio adecuada.
    """
    _estrategias = {
        "ROBOTICA": ProcesadorRobotica,
        "TELECOMUNICACIONES": ProcesadorTelecomunicaciones,
        "AGRICULTURA": ProcesadorAgricultura,
        "ELECTRONICA": ProcesadorElectronica,
        # Agregar más laboratorios aquí
    }

    @staticmethod
    def obtener_estrategia(tipo: str) -> ProcesadorLaboratorioStrategy:
        clase_estrategia = LaboratorioStrategyFactory._estrategias.get(tipo.upper())
        if not clase_estrategia:
            raise ValueError(f"Tipo de laboratorio no soportado: {tipo}")
        return clase_estrategia()
