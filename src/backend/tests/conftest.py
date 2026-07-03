"""
Pytest configuration and shared fixtures for backend tests (Fase 1: Consolidate Domain).

Domain tests are pure Python (no Django needed). These fixtures help DRY the
characterization tests for the existing hexagonal core (LaboratorioService + Factory).

See test_services.py for how to add tests for new labs/edges, and Sec 7.8 of the
ADSO guide for the goal of increasing domain coverage with simulation edges + error cases.
"""
import pytest

from api.logic.domain.services import LaboratorioService


@pytest.fixture
def make_lab_service():
    """
    Factory fixture to create a LaboratorioService for a given lab type.
    Usage in tests:
        def test_foo(make_lab_service):
            svc = make_lab_service("AGRICULTURA")
            ...
    Default is ROBOTICA (as in real __init__).
    """
    def _factory(tipo_lab: str = "ROBOTICA") -> LaboratorioService:
        return LaboratorioService(tipo_lab)
    return _factory


@pytest.fixture
def lab_service(make_lab_service):
    """Convenience fixture for default (ROBOTICA) service."""
    return make_lab_service()


# Future (higher phases):
# @pytest.fixture
# def sample_sensor_data():
#     return {"temperature": 25.0, "humidity": 60.0}