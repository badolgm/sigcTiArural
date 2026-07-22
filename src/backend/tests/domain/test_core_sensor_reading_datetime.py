"""
Primera caracterizacion de core/domain/entities/sensor_reading.py
(V3 original) -- hasta esta sesion no tenia ningun test propio, solo
su copia en contexts/telemetry/ (ver tests/contexts/telemetry/test_telemetry.py)
estaba cubierta.

Alcance minimo, deliberado: solo los 2 casos del fix de timezone
(naive vs. aware datetime, ver docs/local/MOVEMENT_LOG.md). No
replica los 28 tests completos de contexts/telemetry/ -- eso queda
para una sesion futura si se decide dar cobertura completa a core/.
"""

from datetime import datetime, timedelta, timezone

import pytest

from core.domain.entities import SensorReading
from core.domain.value_objects import Temperature, Humidity, SensorId


def test_sensor_reading_acepta_timestamp_aware_sin_typeerror():
    """Reproduce el escenario real: Postgres con USE_TZ=True entrega
    timestamps timezone-aware. No debe lanzar TypeError (bug corregido,
    ver docs/local/MOVEMENT_LOG.md)."""
    reading = SensorReading(
        sensor_id=SensorId(value="BBB-03"),
        temperature=Temperature(value=22.5),
        humidity=Humidity(value=60.0),
        timestamp=datetime.now(timezone.utc) - timedelta(minutes=5),
    )
    assert reading.timestamp.tzinfo is not None


def test_sensor_reading_timestamp_aware_futuro_lanza_valueerror():
    """La regla 'no puede estar en el futuro' sigue vigente con
    timestamps aware, no solo con naive."""
    with pytest.raises(ValueError, match="no puede estar en el futuro"):
        SensorReading(
            sensor_id=SensorId(value="BBB-03"),
            temperature=Temperature(value=22.5),
            humidity=Humidity(value=60.0),
            timestamp=datetime.now(timezone.utc) + timedelta(hours=1),
        )
