from abc import ABC, abstractmethod
from typing import Dict, Any

class ProcesadorLaboratorioStrategy(ABC):
    """
    Puerto de Dominio (Interfaz) para las estrategias de procesamiento de laboratorios.
    Define el contrato que deben seguir todos los laboratorios (Robótica, Telecom, etc.)
    """
    @abstractmethod
    def procesar(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa los datos específicos del laboratorio y devuelve un resultado estructurado.
        """
        pass
