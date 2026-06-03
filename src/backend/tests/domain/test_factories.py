"""
Characterization tests for LaboratorioStrategyFactory.

These tests capture the current behavior of the domain factory
as part of Fase 0 hexagonal refactoring.
"""
import pytest

from api.logic.domain.factories import LaboratorioStrategyFactory
from api.logic.domain.interfaces import ProcesadorLaboratorioStrategy
from api.logic.domain.robotica import ProcesadorRobotica
from api.logic.domain.agricultura import ProcesadorAgricultura
from api.logic.domain.electronica import ProcesadorElectronica
from api.logic.domain.telecom import ProcesadorTelecomunicaciones


def test_obtener_estrategia_robotica():
    """Factory returns correct concrete strategy for ROBOTICA."""
    strategy = LaboratorioStrategyFactory.obtener_estrategia("ROBOTICA")
    assert isinstance(strategy, ProcesadorRobotica)
    assert isinstance(strategy, ProcesadorLaboratorioStrategy)


def test_obtener_estrategia_case_insensitive():
    """Factory accepts lowercase and mixed case."""
    strategy = LaboratorioStrategyFactory.obtener_estrategia("agricultura")
    assert isinstance(strategy, ProcesadorAgricultura)

    strategy = LaboratorioStrategyFactory.obtener_estrategia("ELECTRONICA")
    assert isinstance(strategy, ProcesadorElectronica)


def test_obtener_estrategia_telecomunicaciones():
    strategy = LaboratorioStrategyFactory.obtener_estrategia("TELECOMUNICACIONES")
    assert isinstance(strategy, ProcesadorTelecomunicaciones)


def test_obtener_estrategia_invalido_raises_value_error():
    """Factory raises ValueError for unsupported lab type (characterization of current error handling)."""
    with pytest.raises(ValueError) as exc:
        LaboratorioStrategyFactory.obtener_estrategia("QUIMICA")

    assert "Tipo de laboratorio no soportado" in str(exc.value)


def test_obtener_estrategia_retorna_nueva_instancia():
    """Each call returns a fresh instance (current behavior)."""
    s1 = LaboratorioStrategyFactory.obtener_estrategia("ROBOTICA")
    s2 = LaboratorioStrategyFactory.obtener_estrategia("ROBOTICA")
    assert s1 is not s2
    assert type(s1) is type(s2)


# Additional characterization tests for all strategies (Fase 0 progress)

def test_obtener_estrategia_agricultura():
    """Factory returns correct strategy for AGRICULTURA."""
    strategy = LaboratorioStrategyFactory.obtener_estrategia("AGRICULTURA")
    assert isinstance(strategy, ProcesadorAgricultura)


def test_obtener_estrategia_electronica():
    """Factory returns correct strategy for ELECTRONICA."""
    strategy = LaboratorioStrategyFactory.obtener_estrategia("ELECTRONICA")
    assert isinstance(strategy, ProcesadorElectronica)


def test_obtener_estrategia_telecomunicaciones_full():
    """Factory returns correct strategy for TELECOMUNICACIONES."""
    strategy = LaboratorioStrategyFactory.obtener_estrategia("TELECOMUNICACIONES")
    assert isinstance(strategy, ProcesadorTelecomunicaciones)


def test_todos_los_tipos_son_subclases_de_strategy():
    """All registered strategies implement the base interface."""
    for tipo in ["ROBOTICA", "AGRICULTURA", "ELECTRONICA", "TELECOMUNICACIONES"]:
        strategy = LaboratorioStrategyFactory.obtener_estrategia(tipo)
        assert isinstance(strategy, ProcesadorLaboratorioStrategy)