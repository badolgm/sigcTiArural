"""
Tests de RegistrarLecturaSensorCommand (Día 16-17, Sub-bloque B).
Repositorio in-memory (Día 9) + bus espía (fake EventBusPort) — sin Django ni BD.
"""
from datetime import datetime

from contexts.telemetry.application.commands.registrar_lectura_sensor_command import (
    RegistrarLecturaSensorCommand,
)
from contexts.telemetry.domain.entities import SensorReading
from contexts.telemetry.domain.value_objects import Temperature, Humidity, SensorId
from contexts.telemetry.infrastructure.persistence.in_memory.in_memory_sensor_reading_repository import (
    InMemorySensorReadingRepository,
)
from shared_kernel.event_bus.domain.lab_signal import LabSignal
from shared_kernel.event_bus.ports.event_bus import EventBusPort


class SpyEventBus(EventBusPort):
    """Bus espía: registra cada llamada a publish() sin entregar nada a nadie."""

    def __init__(self):
        self.published = []

    def publish(self, signal: LabSignal) -> None:
        self.published.append(signal)

    def subscribe(self, signal_type, handler) -> None:
        raise NotImplementedError("SpyEventBus no soporta subscribe() — no es necesario para estos tests")


def _make_reading(sensor_id="BBB-01", temp=22.5, hum=60.0):
    return SensorReading(
        sensor_id=SensorId(sensor_id),
        temperature=Temperature(temp),
        humidity=Humidity(hum),
        timestamp=datetime(2026, 8, 11, 12, 0, 0),
    )


def test_ejecutar_llama_save_una_vez():
    repo = InMemorySensorReadingRepository()
    bus = SpyEventBus()
    command = RegistrarLecturaSensorCommand(repository=repo, event_bus=bus)

    command.ejecutar(_make_reading())

    assert len(repo.get_all()) == 1


def test_ejecutar_llama_publish_una_vez():
    repo = InMemorySensorReadingRepository()
    bus = SpyEventBus()
    command = RegistrarLecturaSensorCommand(repository=repo, event_bus=bus)

    command.ejecutar(_make_reading())

    assert len(bus.published) == 1


def test_ejecutar_devuelve_la_lectura_guardada_con_id():
    repo = InMemorySensorReadingRepository()
    bus = SpyEventBus()
    command = RegistrarLecturaSensorCommand(repository=repo, event_bus=bus)

    resultado = command.ejecutar(_make_reading())

    assert resultado.id is not None
    assert resultado.sensor_id.value == "BBB-01"


def test_lab_signal_publicado_tiene_la_forma_exacta_del_plan():
    """Ver docs/local/PLAN_DIA16-17_INTERCONEXION.md, sección 2."""
    repo = InMemorySensorReadingRepository()
    bus = SpyEventBus()
    command = RegistrarLecturaSensorCommand(repository=repo, event_bus=bus)

    command.ejecutar(_make_reading(sensor_id="BBB-03", temp=36.0, hum=20.0))

    signal = bus.published[0]
    assert isinstance(signal, LabSignal)
    assert signal.source_context == "telemetry"
    assert signal.signal_type == "sensor_reading"
    assert signal.timestamp == datetime(2026, 8, 11, 12, 0, 0)
    assert signal.payload == {
        "temperature": 36.0,
        "humidity": 20.0,
        "sensor_id": "BBB-03",
    }
    assert signal.signal_id  # autogenerado, no vacío
    assert signal.metadata == {}


def test_lab_signal_usa_el_timestamp_de_la_lectura_guardada():
    repo = InMemorySensorReadingRepository()
    bus = SpyEventBus()
    command = RegistrarLecturaSensorCommand(repository=repo, event_bus=bus)

    reading = _make_reading()
    command.ejecutar(reading)

    assert bus.published[0].timestamp == reading.timestamp
