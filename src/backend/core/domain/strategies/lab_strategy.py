
from abc import ABC, abstractmethod
from typing import Dict, Any, List


class LabStrategy(ABC):
    """
    Interfaz (Puerto de Dominio) para las estrategias de procesamiento de laboratorios.
    Define el contrato que deben seguir todos los laboratorios (Robótica, Telecom, etc.)
    """

    @abstractmethod
    def procesar(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa los datos específicos del laboratorio y devuelve un resultado estructurado.
        """
        pass

    @abstractmethod
    def generar_historico_simulado(self, horas: int = 24) -> List[Dict[str, Any]]:
        """
        Genera datos históricos simulados para el laboratorio.
        """
        pass
