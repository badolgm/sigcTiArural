"""
Test de integración de wire_all() (Día 16-17, Sub-bloque D).
Cablea el bus real a través del composition root y publica un LabSignal real,
confirmando que el handler corrió de punta a punta -- incluida la alerta S.O.S
de Agricultura ante estrés crítico (el efecto no trivial del piloto, ver
docs/local/PLAN_DIA16-17_INTERCONEXION.md, sección 1).

wire_all() vive en sigct_backend/ (no en shared_kernel/event_bus/) desde la
revisión post-commit del ultrareview: el shared kernel debe permanecer neutral
y no depender de contexts.labs. Este test se movió con él, en espejo.
"""
from datetime import datetime

from shared_kernel.event_bus.domain.lab_signal import LabSignal
from shared_kernel.event_bus.infrastructure.in_memory_event_bus import InMemoryEventBus
from shared_kernel.event_bus.infrastructure.config.dependencies import get_event_bus
from sigct_backend.wiring import wire_all


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


def test_wire_all_es_idempotente_no_duplica_suscripcion_en_el_mismo_bus(capsys):
    """Hallazgo del ultrareview: cada llamada a wire_all() construye un
    OnSensorReadingHandler nuevo -- sin la guardia de idempotencia, una
    segunda llamada sobre el mismo bus duplicaría la suscripción y, por lo
    tanto, la alerta S.O.S. por cada lectura crítica."""
    bus = InMemoryEventBus()
    wire_all(bus)
    wire_all(bus)  # segunda llamada sobre el mismo bus: debe ser un no-op

    bus.publish(_make_sensor_reading_signal(temperature=36.0, humidity=20.0))

    salida = capsys.readouterr().out
    assert salida.count("ALERTA S.O.S RURAL") == 1


def test_wire_all_cablea_cada_bus_de_forma_independiente(capsys):
    """La idempotencia es por instancia de bus, no global: wire_all() sobre
    un bus distinto sigue funcionando con normalidad."""
    bus_1 = InMemoryEventBus()
    bus_2 = InMemoryEventBus()
    wire_all(bus_1)
    wire_all(bus_2)

    bus_1.publish(_make_sensor_reading_signal(temperature=36.0, humidity=20.0))
    bus_2.publish(_make_sensor_reading_signal(temperature=36.0, humidity=20.0))

    salida = capsys.readouterr().out
    assert salida.count("ALERTA S.O.S RURAL") == 2
