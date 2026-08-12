"""
Tests del scaffold de shared_kernel/event_bus/ (Día 16-17, Sub-bloque A).
Pytest puro, sin Django ni BD — mismo enfoque que las pruebas de dominio
del Día 9 (contexts/telemetry).
"""
from datetime import datetime

from shared_kernel.event_bus.domain.lab_signal import LabSignal
from shared_kernel.event_bus.ports.event_bus import EventBusPort
from shared_kernel.event_bus.infrastructure.in_memory_event_bus import InMemoryEventBus
from shared_kernel.event_bus.infrastructure.config.dependencies import get_event_bus


# ============================================================
# LabSignal
# ============================================================

def test_lab_signal_construccion_con_todos_los_campos():
    signal = LabSignal(
        source_context="telemetry",
        signal_type="sensor_reading",
        timestamp=datetime(2026, 8, 11, 12, 0, 0),
        payload={"temperature": 36.0, "humidity": 20.0, "sensor_id": "BBB-01"},
    )
    assert signal.source_context == "telemetry"
    assert signal.signal_type == "sensor_reading"
    assert signal.payload["sensor_id"] == "BBB-01"
    assert signal.signal_id  # autogenerado, no vacío
    assert signal.metadata == {}


def test_lab_signal_signal_id_autogenerado_es_unico():
    s1 = LabSignal(source_context="a", signal_type="b", timestamp=datetime.now(), payload={})
    s2 = LabSignal(source_context="a", signal_type="b", timestamp=datetime.now(), payload={})
    assert s1.signal_id != s2.signal_id


def test_lab_signal_acepta_signal_id_explicito():
    signal = LabSignal(
        source_context="telemetry",
        signal_type="sensor_reading",
        timestamp=datetime.now(),
        payload={},
        signal_id="explicit-id-123",
    )
    assert signal.signal_id == "explicit-id-123"


def test_lab_signal_metadata_por_defecto_es_diccionario_vacio_e_independiente():
    """Characterization: default_factory evita el bug clásico de mutable default compartido entre instancias."""
    s1 = LabSignal(source_context="a", signal_type="b", timestamp=datetime.now(), payload={})
    s2 = LabSignal(source_context="a", signal_type="b", timestamp=datetime.now(), payload={})
    s1.metadata["x"] = 1
    assert s2.metadata == {}


# ============================================================
# EventBusPort / InMemoryEventBus
# ============================================================

def test_in_memory_event_bus_implementa_el_puerto():
    bus = InMemoryEventBus()
    assert isinstance(bus, EventBusPort)


def test_in_memory_event_bus_publish_sin_suscriptores_no_lanza_error():
    bus = InMemoryEventBus()
    signal = LabSignal(source_context="telemetry", signal_type="sensor_reading", timestamp=datetime.now(), payload={})
    bus.publish(signal)  # no debe lanzar


def test_in_memory_event_bus_entrega_a_suscriptor_del_mismo_signal_type():
    bus = InMemoryEventBus()
    recibidas = []
    bus.subscribe("sensor_reading", recibidas.append)

    signal = LabSignal(
        source_context="telemetry",
        signal_type="sensor_reading",
        timestamp=datetime.now(),
        payload={"temperature": 36.0},
    )
    bus.publish(signal)

    assert recibidas == [signal]


def test_in_memory_event_bus_no_entrega_a_suscriptor_de_otro_signal_type():
    bus = InMemoryEventBus()
    recibidas = []
    bus.subscribe("otro_tipo", recibidas.append)

    signal = LabSignal(source_context="telemetry", signal_type="sensor_reading", timestamp=datetime.now(), payload={})
    bus.publish(signal)

    assert recibidas == []


def test_in_memory_event_bus_soporta_multiples_suscriptores_del_mismo_tipo():
    bus = InMemoryEventBus()
    recibidas_1, recibidas_2 = [], []
    bus.subscribe("sensor_reading", recibidas_1.append)
    bus.subscribe("sensor_reading", recibidas_2.append)

    signal = LabSignal(source_context="telemetry", signal_type="sensor_reading", timestamp=datetime.now(), payload={})
    bus.publish(signal)

    assert recibidas_1 == [signal]
    assert recibidas_2 == [signal]


# ============================================================
# get_event_bus() — singleton de proceso
# ============================================================

def test_get_event_bus_devuelve_instancia_del_puerto():
    assert isinstance(get_event_bus(), EventBusPort)


def test_get_event_bus_es_singleton():
    """Necesario para que publish()/subscribe() compartan estado entre distintos
    puntos del proceso — decisión de diseño explícita, ver Sub-bloque D en
    docs/local/PLAN_DIA16-17_INTERCONEXION.md."""
    assert get_event_bus() is get_event_bus()
