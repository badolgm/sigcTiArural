"""
Servicio de Dominio para la gestión y coordinación de estrategias de laboratorio.
Aplica principios SOLID (Inversión de Dependencias) para el desacoplamiento de interfaces.
"""
from typing import Dict, Any, List
from ..strategies.base import ProcesadorLaboratorioStrategy
from ..factories.laboratorio_factory import LaboratorioStrategyFactory
from ...ports.notifications import NotificationPort  # <-- 1. Importamos el puerto abstracto
from api.logic.ports.ai_service import AIServicePort  # <-- NUEVO: Importamos el puerto de IA

class LaboratorioService:
    """
    Servicio de Dominio que coordina la ejecución de estrategias de laboratorio.
    """
    def __init__(self, tipo_lab: str = "ROBOTICA", notification_port: NotificationPort = None, ai_service_port: AIServicePort = None):
        """
        Inicializa el servicio inyectando de forma opcional los puertos de comunicación externa.
        """
        self._estrategia = LaboratorioStrategyFactory.obtener_estrategia(tipo_lab)
        self._tipo_lab = tipo_lab  # Guardamos el tipo para validaciones en la ejecución
        self._notification_port = notification_port  # <-- Guardamos la referencia del puerto de alertas
        self._ai_service_port = ai_service_port  # <-- NUEVO: Guardamos la referencia del puerto de IA

    def cambiar_laboratorio(self, tipo_lab: str):
        self._estrategia = LaboratorioStrategyFactory.obtener_estrategia(tipo_lab)
        self._tipo_lab = tipo_lab

    def ejecutar_analisis(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        # Ejecuta el análisis delegando el procesamiento a la estrategia activa
        resultado = self._estrategia.procesar(datos)

        # Interceptamos si es AGRICULTURA y reporta estrés Crítico
        if self._tipo_lab == "AGRICULTURA" and resultado.get("nivel_estres") == "Crítico":
            if self._notification_port:
                self._notification_port.enviar_alerta(
                    titulo="ALERTA S.O.S RURAL: Estrés Hídrico/Térmico Crítico",
                    mensaje=f"El sistema detectó anomalías severas en las variables físicas: {resultado.get('detalles', 'Revisar sensores')}",
                    prioridad="alta"
                )

        return resultado

    def obtener_simulacion_historica(self) -> List[Dict[str, Any]]:
        if hasattr(self._estrategia, 'generar_historico_simulado'):
            return self._estrategia.generar_historico_simulado()
        return []
