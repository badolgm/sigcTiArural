from .robotica import ProcesadorRobotica
from .telecom import ProcesadorTelecomunicaciones
from .agricultura import ProcesadorAgricultura
from .electronica import ProcesadorElectronica
from .interfaces import ProcesadorLaboratorioStrategy

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
