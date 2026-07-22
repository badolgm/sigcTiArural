"""
Characterization tests for the V3 Telemetry domain layer (core/domain/, core/ports/).

These tests establish the baseline that Labs already had for free via the 50
tests in test_factories.py/test_services.py (which cover api/logic/domain/, V2).
Telemetry has no V2 counterpart — it was born directly in core/domain/ (V3) and,
until this file, had zero test coverage (confirmed: no test anywhere referenced
Temperature, Humidity, SensorId or SensorReading before this session).

Scope (per Día 8-adjacent controlled session): only the pure domain layer and
the in-memory repository adapter, which requires no database. The Django
adapter (DjangoSensorReadingRepository) and its mapper are deliberately NOT
tested here — they require a real Postgres connection, out of scope for today
(same reasoning as not spinning up the full docker-compose stack for a
characterization pass).

Ranges/behavior documented below are read directly from the existing code
(core/domain/value_objects/*.py, core/domain/entities/sensor_reading.py),
not assumed.
"""
import pytest
from datetime import datetime, timedelta, timezone

from contexts.telemetry.domain.value_objects import Temperature, Humidity, SensorId
from contexts.telemetry.domain.entities import SensorReading
from contexts.telemetry.domain.exceptions import (
    InvalidTemperatureError,
    InvalidHumidityError,
    InvalidSensorIdError,
)
from contexts.telemetry.infrastructure.persistence.in_memory.in_memory_sensor_reading_repository import (
    InMemorySensorReadingRepository,
)


# ============================================================
# Value Object: Temperature
# Current range (core/domain/value_objects/temperature.py:17): -50.0 <= value <= 60.0
# ============================================================

def test_temperature_valor_valido_dentro_de_rango():
    t = Temperature(20.0)
    assert t.value == 20.0
    assert str(t) == "20.0°C"


def test_temperature_acepta_limites_exactos():
    assert Temperature(-50.0).value == -50.0
    assert Temperature(60.0).value == 60.0


def test_temperature_fuera_de_rango_por_encima_lanza_invalidtemperatureerror():
    with pytest.raises(InvalidTemperatureError):
        Temperature(60.1)


def test_temperature_fuera_de_rango_por_debajo_lanza_invalidtemperatureerror():
    with pytest.raises(InvalidTemperatureError):
        Temperature(-50.1)


def test_temperature_es_inmutable():
    t = Temperature(25.0)
    with pytest.raises(Exception):
        t.value = 30.0


# ============================================================
# Value Object: Humidity
# Current range (core/domain/value_objects/humidity.py:17): 0.0 <= value <= 100.0
# ============================================================

def test_humidity_valor_valido_dentro_de_rango():
    h = Humidity(45.0)
    assert h.value == 45.0
    assert str(h) == "45.0%"


def test_humidity_acepta_limites_exactos():
    assert Humidity(0.0).value == 0.0
    assert Humidity(100.0).value == 100.0


def test_humidity_fuera_de_rango_por_encima_lanza_invalidhumidityerror():
    with pytest.raises(InvalidHumidityError):
        Humidity(100.1)


def test_humidity_fuera_de_rango_por_debajo_lanza_invalidhumidityerror():
    with pytest.raises(InvalidHumidityError):
        Humidity(-0.1)


def test_humidity_es_inmutable():
    h = Humidity(50.0)
    with pytest.raises(Exception):
        h.value = 10.0


# ============================================================
# Value Object: SensorId
# Current behavior (core/domain/value_objects/sensor_id.py):
# - rejects empty/whitespace-only strings -> InvalidSensorIdError
# - strips surrounding whitespace from valid values (__post_init__)
# ============================================================

def test_sensor_id_valor_valido():
    sid = SensorId("BBB-03")
    assert sid.value == "BBB-03"
    assert str(sid) == "BBB-03"


def test_sensor_id_vacio_lanza_invalidsensoriderror():
    with pytest.raises(InvalidSensorIdError):
        SensorId("")


def test_sensor_id_solo_espacios_lanza_invalidsensoriderror():
    with pytest.raises(InvalidSensorIdError):
        SensorId("   ")


def test_sensor_id_recorta_espacios_circundantes():
    sid = SensorId("  ROBOT-001  ")
    assert sid.value == "ROBOT-001"


def test_sensor_id_es_inmutable():
    sid = SensorId("BBB-01")
    with pytest.raises(Exception):
        sid.value = "BBB-02"


# ============================================================
# Entity: SensorReading
# Current behavior (core/domain/entities/sensor_reading.py):
# - dataclass with sensor_id, temperature, humidity, timestamp (default=now), id (default=None)
# - __post_init__ validation: "La fecha y hora no puede estar en el futuro" -> ValueError
#   (a plain ValueError, NOT one of the DomainException subclasses)
# ============================================================

def test_sensor_reading_construccion_valida():
    reading = SensorReading(
        sensor_id=SensorId("BBB-03"),
        temperature=Temperature(22.5),
        humidity=Humidity(60.0),
    )
    assert reading.sensor_id.value == "BBB-03"
    assert reading.temperature.value == 22.5
    assert reading.humidity.value == 60.0
    assert reading.id is None  # default per dataclass field


def test_sensor_reading_timestamp_por_defecto_es_ahora():
    before = datetime.now()
    reading = SensorReading(
        sensor_id=SensorId("BBB-03"),
        temperature=Temperature(22.5),
        humidity=Humidity(60.0),
    )
    after = datetime.now()
    assert before <= reading.timestamp <= after


def test_sensor_reading_timestamp_futuro_lanza_valueerror():
    """Characterization of the exact validation in __post_init__ (sensor_reading.py:23)."""
    timestamp_futuro = datetime.now() + timedelta(hours=1)
    with pytest.raises(ValueError) as exc:
        SensorReading(
            sensor_id=SensorId("BBB-03"),
            temperature=Temperature(22.5),
            humidity=Humidity(60.0),
            timestamp=timestamp_futuro,
        )
    assert "no puede estar en el futuro" in str(exc.value)


def test_sensor_reading_timestamp_futuro_no_es_domain_exception():
    """The future-timestamp guard raises plain ValueError, not a DomainException subclass
    (unlike Temperature/Humidity/SensorId) — characterizing this asymmetry as-is."""
    from contexts.telemetry.domain.exceptions import DomainException
    timestamp_futuro = datetime.now() + timedelta(hours=1)
    with pytest.raises(ValueError):
        try:
            SensorReading(
                sensor_id=SensorId("BBB-03"),
                temperature=Temperature(22.5),
                humidity=Humidity(60.0),
                timestamp=timestamp_futuro,
            )
        except DomainException:
            pytest.fail("Expected plain ValueError, not a DomainException subclass")


def test_sensor_reading_acepta_timestamp_aware_sin_typeerror():
    """Reproduce el escenario real: Postgres con USE_TZ=True entrega
    timestamps timezone-aware. No debe lanzar TypeError (bug corregido,
    ver docs/local/MOVEMENT_LOG.md)."""
    reading = SensorReading(
        sensor_id=SensorId("BBB-03"),
        temperature=Temperature(22.5),
        humidity=Humidity(60.0),
        timestamp=datetime.now(timezone.utc) - timedelta(minutes=5),
    )
    assert reading.timestamp.tzinfo is not None


def test_sensor_reading_timestamp_aware_futuro_lanza_valueerror():
    """La regla 'no puede estar en el futuro' sigue vigente con
    timestamps aware, no solo con naive."""
    with pytest.raises(ValueError, match="no puede estar en el futuro"):
        SensorReading(
            sensor_id=SensorId("BBB-03"),
            temperature=Temperature(22.5),
            humidity=Humidity(60.0),
            timestamp=datetime.now(timezone.utc) + timedelta(hours=1),
        )


def test_sensor_reading_str_representation():
    reading = SensorReading(
        sensor_id=SensorId("BBB-03"),
        temperature=Temperature(22.5),
        humidity=Humidity(60.0),
        timestamp=datetime(2026, 7, 20, 12, 0, 0),
    )
    assert str(reading) == "SensorReading[BBB-03]: 22.5°C, 60.0% @ 2026-07-20 12:00:00"


# ============================================================
# Port contract: SensorReadingRepositoryPort, exercised via InMemorySensorReadingRepository
# (in_memory_sensor_reading_repository.py — its own docstring says it exists "para tests
# unitarios (no requiere BD)"; this is its first actual use in the test suite).
# Contract per core/ports/repositories/sensor_reading_repository.py: save, get_all, get_by_id.
# ============================================================

def _make_reading(sensor_id="BBB-01", temp=20.0, hum=50.0):
    return SensorReading(
        sensor_id=SensorId(sensor_id),
        temperature=Temperature(temp),
        humidity=Humidity(hum),
    )


def test_in_memory_repo_save_asigna_id_incremental_cuando_no_tiene():
    repo = InMemorySensorReadingRepository()
    r1 = repo.save(_make_reading())
    r2 = repo.save(_make_reading())
    assert r1.id == 1
    assert r2.id == 2


def test_in_memory_repo_save_reemplaza_si_ya_tiene_id():
    """Characterization: saving a reading with an existing id replaces the prior entry (no duplicate)."""
    repo = InMemorySensorReadingRepository()
    original = repo.save(_make_reading(temp=20.0))
    original.temperature = Temperature(30.0)
    repo.save(original)

    todos = repo.get_all()
    assert len(todos) == 1
    assert todos[0].temperature.value == 30.0


def test_in_memory_repo_get_all_sin_limite_devuelve_todo():
    repo = InMemorySensorReadingRepository()
    repo.save(_make_reading(sensor_id="A"))
    repo.save(_make_reading(sensor_id="B"))
    repo.save(_make_reading(sensor_id="C"))

    todos = repo.get_all()
    assert len(todos) == 3
    assert [r.sensor_id.value for r in todos] == ["A", "B", "C"]


def test_in_memory_repo_get_all_con_limite_devuelve_los_ultimos_n():
    """Characterization: get_all(limit=N) returns the last N (in_memory_sensor_reading_repository.py:28)."""
    repo = InMemorySensorReadingRepository()
    repo.save(_make_reading(sensor_id="A"))
    repo.save(_make_reading(sensor_id="B"))
    repo.save(_make_reading(sensor_id="C"))

    ultimos_2 = repo.get_all(limit=2)
    assert [r.sensor_id.value for r in ultimos_2] == ["B", "C"]


def test_in_memory_repo_get_all_vacio_devuelve_lista_vacia():
    repo = InMemorySensorReadingRepository()
    assert repo.get_all() == []


def test_in_memory_repo_get_by_id_existente():
    repo = InMemorySensorReadingRepository()
    guardado = repo.save(_make_reading(sensor_id="BBB-05"))

    encontrado = repo.get_by_id(guardado.id)
    assert encontrado is not None
    assert encontrado.sensor_id.value == "BBB-05"


def test_in_memory_repo_get_by_id_inexistente_devuelve_none():
    repo = InMemorySensorReadingRepository()
    repo.save(_make_reading())
    assert repo.get_by_id(9999) is None


def test_in_memory_repo_implementa_el_puerto():
    from contexts.telemetry.ports import SensorReadingRepositoryPort
    repo = InMemorySensorReadingRepository()
    assert isinstance(repo, SensorReadingRepositoryPort)
