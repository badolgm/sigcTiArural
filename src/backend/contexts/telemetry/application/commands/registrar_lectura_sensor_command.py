
from shared_kernel.event_bus.domain.lab_signal import LabSignal
from shared_kernel.event_bus.ports.event_bus import EventBusPort

from ...domain.entities import SensorReading
from ...ports import SensorReadingRepositoryPort


class RegistrarLecturaSensorCommand:
    """
    Orquesta el registro de una lectura de sensor: la persiste vía
    SensorReadingRepositoryPort y publica la LabSignal correspondiente en el
    EventBusPort, para que otros laboratorios puedan reaccionar a ella.
    Ver docs/local/PLAN_DIA16-17_INTERCONEXION.md, sección 2, para la forma
    exacta de la señal publicada.
    """

    def __init__(self, repository: SensorReadingRepositoryPort, event_bus: EventBusPort):
        self._repository = repository
        self._event_bus = event_bus

    def ejecutar(self, reading: SensorReading) -> SensorReading:
        guardada = self._repository.save(reading)

        signal = LabSignal(
            source_context="telemetry",
            signal_type="sensor_reading",
            timestamp=guardada.timestamp,
            payload={
                "temperature": guardada.temperature.value,
                "humidity": guardada.humidity.value,
                "sensor_id": guardada.sensor_id.value,
            },
        )
        self._event_bus.publish(signal)

        return guardada
