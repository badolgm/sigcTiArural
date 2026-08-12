"""
Test de integración de wire_all() (Día 16-17, Sub-bloque D).
Cablea el bus real a través del composition root y publica un LabSignal real,
confirmando que el handler corrió de punta a punta -- incluida la alerta S.O.S
de Agricultura ante estrés crítico (el efecto no trivial del piloto, ver
docs/local/PLAN_DIA16-17_INTERCONEXION.md, sección 1).
"""
from datetime import datetime

from shared_kernel.event_bus.domain.lab_signal import LabSignal
from shared_kernel.event_bus.infrastructure.in_memory_event_bus import InMemoryEventBus
from shared_kernel.event_bus.infrastructure.config.dependencies import get_event_bus
from shared_kernel.event_bus.wiring import wire_all


def _make_sensor_reading_signal(temperature=22.5, humidity=60.0, sensor_id="BBB-01"):
    return LabSignal(
        source_context="telemetry",
        signal_type="sensor_reading",
        timestamp=datetime(2026, 8, 11, 12, 0, 0),
        payload={"temperature": temperature, "humidity": humidity, "sensor_id": sensor_id},
    )


def test_wire_all_conecta_sensor_reading_al_handler_de_extremo_a_extremo(capsys):
    bus = InMemoryEventBus()
    wire_all(bus)

    bus.publish(_make_sensor_reading_signal(temperature=36.0, humidity=20.0))

    salida = capsys.readouterr().out
    assert "ALERTA S.O.S RURAL" in salida
    assert "Estrés Hídrico/Térmico Crítico" in salida


def test_wire_all_no_dispara_alerta_con_datos_normales(capsys):
    bus = InMemoryEventBus()
    wire_all(bus)

    bus.publish(_make_sensor_reading_signal(temperature=22.0, humidity=70.0))

    salida = capsys.readouterr().out
    assert "ALERTA S.O.S RURAL" not in salida


def test_wire_all_funciona_sobre_el_bus_singleton_get_event_bus(capsys):
    """Ver docs/local/PLAN_DIA16-17_INTERCONEXION.md, tabla del Sub-bloque D:
    'Test de integración: publicar una señal real en el bus singleton
    (get_event_bus()), confirmar que el handler corrió de punta a punta'."""
    get_event_bus.cache_clear()
    try:
        bus = get_event_bus()
        wire_all(bus)

        bus.publish(_make_sensor_reading_signal(temperature=36.0, humidity=20.0))

        salida = capsys.readouterr().out
        assert "ALERTA S.O.S RURAL" in salida
    finally:
        get_event_bus.cache_clear()
