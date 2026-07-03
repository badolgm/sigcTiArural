
from typing import Dict, Any, List, Optional
from ..strategies import LabStrategy
from ..factories import LabStrategyFactory
from ...ports import NotificationPort, AIServicePort


class LabService:
    """
    Servicio de Dominio que coordina la ejecución de estrategias de laboratorio.
    """

    def __init__(
        self,
        tipo_lab: str = "ROBOTICA",
        notification_port: Optional[NotificationPort] = None,
        ai_service_port: Optional[AIServicePort] = None,
    ):
        self._strategy = LabStrategyFactory.get_strategy(tipo_lab)
        self._tipo_lab = tipo_lab
        self._notification_port = notification_port
        self._ai_service_port = ai_service_port

    def cambiar_laboratorio(self, tipo_lab: str):
        self._strategy = LabStrategyFactory.get_strategy(tipo_lab)
        self._tipo_lab = tipo_lab

    def ejecutar_analisis(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        resultado = self._strategy.procesar(datos)

        if self._tipo_lab == "AGRICULTURA" and resultado.get("nivel_estres") == "Crítico":
            if self._notification_port:
                self._notification_port.enviar_alerta(
                    titulo="ALERTA S.O.S RURAL: Estrés Hídrico/Térmico Crítico",
                    mensaje=f"El sistema detectó anomalías severas en las variables físicas: {resultado.get('detalles', 'Revisar sensores')}",
                    prioridad="alta"
                )

        return resultado

    def obtener_simulacion_historica(self) -> List[Dict[str, Any]]:
        if hasattr(self._strategy, 'generar_historico_simulado'):
            return self._strategy.generar_historico_simulado()
        return []
