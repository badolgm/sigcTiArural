
from typing import Any, Dict, Optional

from shared_kernel.event_bus.domain.lab_signal import LabSignal

from ...domain.services.laboratorio_service import LaboratorioService
from ...infrastructure.notifications.console_notification_adapter import (
    ConsoleNotificationAdapter,
)


class OnSensorReadingHandler:
    """
    Suscriptor de LabSignal con signal_type="sensor_reading" (origen: telemetry).
    Traduce el payload genérico al Dict que ProcesadorAgricultura.procesar()
    espera y delega en LaboratorioService(AGRICULTURA), sin tocar ni
    ProcesadorAgricultura ni LaboratorioService.

    Se inyecta ConsoleNotificationAdapter por defecto: es la primera vez que la
    alerta SOS de estrés crítico (ya programada en LaboratorioService, hoy
    código muerto en producción) puede sonar de verdad ante datos reales — ver
    docs/local/PLAN_DIA16-17_INTERCONEXION.md, sección 1.
    """

    def __init__(self, laboratorio_service: Optional[LaboratorioService] = None):
        self._laboratorio_service = laboratorio_service or LaboratorioService(
            tipo_lab="AGRICULTURA",
            notification_port=ConsoleNotificationAdapter(),
        )

    def manejar(self, signal: LabSignal) -> Dict[str, Any]:
        datos = self._traducir_payload(signal.payload)
        return self._laboratorio_service.ejecutar_analisis(datos)

    @staticmethod
    def _traducir_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "temperature": payload.get("temperature"),
            "humidity": payload.get("humidity"),
            "imagen_analizada": False,
        }
