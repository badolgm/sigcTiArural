"""
Test aislado de LegacySensorReadingRepositoryAdapter
(contexts/telemetry/infrastructure/compat/), Dia 10 Paso 2b.

Usa InMemorySensorReadingRepository inyectado explicitamente por el
parametro opcional del constructor -- no depende de settings.TESTING
ni de una BD real. No sustituye a los 4 tests de caracterizacion de
tests/api/test_telemetry_history_v2_view.py (esos fijan el
comportamiento de la VISTA con DjangoRepository real); este solo
verifica el adaptador en aislamiento, antes de conectarlo en el
Paso 3.
"""

import pytest

from contexts.telemetry.domain.entities import SensorReading
from contexts.telemetry.domain.value_objects import Humidity, SensorId, Temperature
from contexts.telemetry.infrastructure.compat.legacy_sensor_reading_adapter import (
    FlatSensorReading,
    LegacySensorReadingRepositoryAdapter,
)
from contexts.telemetry.infrastructure.persistence.in_memory.in_memory_sensor_reading_repository import (
    InMemorySensorReadingRepository,
)


@pytest.fixture
def in_memory_repo_con_lecturas():
    repo = InMemorySensorReadingRepository()
    repo.save(
        SensorReading(
            sensor_id=SensorId(value="SENSOR-A"),
            temperature=Temperature(value=21.5),
            humidity=Humidity(value=55.0),
        )
    )
    repo.save(
        SensorReading(
            sensor_id=SensorId(value="SENSOR-B"),
            temperature=Temperature(value=18.2),
            humidity=Humidity(value=60.5),
        )
    )
    repo.save(
        SensorReading(
            sensor_id=SensorId(value="SENSOR-C"),
            temperature=Temperature(value=25.0),
            humidity=Humidity(value=40.0),
        )
    )
    return repo


def test_listar_todos_devuelve_flat_sensor_reading_con_floats_planos(in_memory_repo_con_lecturas):
    adapter = LegacySensorReadingRepositoryAdapter(repository=in_memory_repo_con_lecturas)

    resultado = adapter.listar_todos("api.SensorReading")

    assert len(resultado) == 3
    for item in resultado:
        assert isinstance(item, FlatSensorReading)
        assert isinstance(item.temperature, float)
        assert isinstance(item.humidity, float)
        assert isinstance(item.sensor_id, str)
        # No deben quedar value objects filtrados en el resultado plano.
        assert not hasattr(item.temperature, "value")
        assert not hasattr(item.humidity, "value")

    sensor_ids = {item.sensor_id for item in resultado}
    assert sensor_ids == {"SENSOR-A", "SENSOR-B", "SENSOR-C"}


def test_listar_todos_con_modelo_no_soportado_lanza_valueerror(in_memory_repo_con_lecturas):
    adapter = LegacySensorReadingRepositoryAdapter(repository=in_memory_repo_con_lecturas)

    with pytest.raises(ValueError, match="otro.Modelo"):
        adapter.listar_todos("otro.Modelo")
