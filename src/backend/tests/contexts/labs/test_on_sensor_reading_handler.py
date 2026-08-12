"""
Tests de OnSensorReadingHandler (Día 16-17, Sub-bloque C).
Construye un LabSignal a mano y verifica que LaboratorioService(AGRICULTURA)
recibe los datos traducidos correctamente. LaboratorioService/ProcesadorAgricultura
reales no se tocan; se usa un espía solo para aislar la traducción.
"""
from datetime import datetime

from contexts.labs.application.commands.on_sensor_reading_handler import (
    OnSensorReadingHandler,
)
from contexts.labs.domain.services.laboratorio_service import LaboratorioService
from shared_kernel.event_bus.domain.lab_signal import LabSignal


def _make_signal(temperature=22.5, humidity=60.0, sensor_id="BBB-01"):
    return LabSignal(
        source_context="telemetry",
        signal_type="sensor_reading",
        timestamp=datetime(2026, 8, 11, 12, 0, 0),
        payload={"temperature": temperature, "humidity": humidity, "sensor_id": sensor_id},
    )


class SpyLaboratorioService:
    """Espía sobre la interfaz pública que usa el handler: ejecutar_analisis()."""

    def __init__(self):
        self.recibido = None

    def ejecutar_analisis(self, datos):
        self.recibido = datos
        return {"estado": "espiado"}


def test_manejar_traduce_temperature_y_humidity_al_dict_de_agricultura():
    spy = SpyLaboratorioService()
    handler = OnSensorReadingHandler(laboratorio_service=spy)

    handler.manejar(_make_signal(temperature=36.0, humidity=20.0))

    assert spy.recibido == {
        "temperature": 36.0,
        "humidity": 20.0,
        "imagen_analizada": False,
    }


def test_manejar_devuelve_el_resultado_de_ejecutar_analisis():
    spy = SpyLaboratorioService()
    handler = OnSensorReadingHandler(laboratorio_service=spy)

    resultado = handler.manejar(_make_signal())

    assert resultado == {"estado": "espiado"}


def test_manejar_ignora_sensor_id_del_payload_sin_romper():
    """sensor_id viaja en el payload (para futura correlación en la alerta SOS,
    ver sección 2 del plan) pero ProcesadorAgricultura no lo consume hoy."""
    spy = SpyLaboratorioService()
    handler = OnSensorReadingHandler(laboratorio_service=spy)

    handler.manejar(_make_signal(sensor_id="BBB-99"))

    assert "sensor_id" not in spy.recibido


def test_handler_por_defecto_usa_laboratorioservice_real_de_agricultura():
    """Smoke: sin inyectar nada, el handler construye un LaboratorioService(AGRICULTURA)
    real (reusado tal cual) y produce un análisis válido."""
    handler = OnSensorReadingHandler()

    assert isinstance(handler._laboratorio_service, LaboratorioService)

    resultado = handler.manejar(_make_signal(temperature=22.0, humidity=70.0))

    assert resultado["estado"] == "analizado"
    assert resultado["tipo"] == "agricultura_analisis"
    assert resultado["nivel_estres"] == "Bajo"


def test_handler_por_defecto_dispara_alerta_sos_ante_estres_critico(capsys):
    """El efecto no trivial del piloto: la alerta SOS (ya programada en
    LaboratorioService, hoy código muerto en producción) suena de verdad por
    primera vez ante datos reales llegando por el camino de eventos."""
    handler = OnSensorReadingHandler()

    resultado = handler.manejar(_make_signal(temperature=36.0, humidity=20.0))

    assert resultado["nivel_estres"] == "Crítico"

    salida = capsys.readouterr().out
    assert "ALERTA S.O.S RURAL" in salida
    assert "Estrés Hídrico/Térmico Crítico" in salida
