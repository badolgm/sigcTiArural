from .interfaces import ProcesadorLaboratorioStrategy
from .factories import LaboratorioStrategyFactory
from typing import Dict, Any, List

class LaboratorioService:
    """
    Servicio de Dominio que coordina la ejecución de estrategias de laboratorio.
    """
    def __init__(self, tipo_lab: str = "ROBOTICA"):
        self._estrategia = LaboratorioStrategyFactory.obtener_estrategia(tipo_lab)

    def cambiar_laboratorio(self, tipo_lab: str):
        self._estrategia = LaboratorioStrategyFactory.obtener_estrategia(tipo_lab)

    def ejecutar_analisis(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        return self._estrategia.procesar(datos)

    def obtener_simulacion_historica(self) -> List[Dict[str, Any]]:
        if hasattr(self._estrategia, 'generar_historico_simulado'):
            return self._estrategia.generar_historico_simulado()
        return []
