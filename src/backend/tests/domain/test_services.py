"""
Characterization tests for LaboratorioService.

Tests the current behavior of the domain service layer.
These are "characterization tests" to protect existing logic
during the hexagonal refactor (Fase 0).
"""
from api.logic.domain.services import LaboratorioService


def test_servicio_default_robotica():
    """Default lab type is ROBOTICA and ejecutar_analisis returns expected structure."""
    service = LaboratorioService()  # default "ROBOTICA"
    result = service.ejecutar_analisis({"foo": "bar"})

    assert isinstance(result, dict)
    assert result.get("estado") == "procesado"
    assert result.get("tipo") == "robotica_telemetria"
    assert result.get("resultado") == {"foo": "bar"}


def test_cambiar_laboratorio_a_agricultura():
    service = LaboratorioService("ROBOTICA")
    service.cambiar_laboratorio("AGRICULTURA")

    result = service.ejecutar_analisis({"temperature": 22, "humidity": 60})
    assert result.get("estado") == "analizado"
    assert "nivel_estres" in result
    assert "sugerencia_riego" in result


def test_obtener_simulacion_historica_default_24_registros():
    """Current default simulation generates 24 hours of data (characterization)."""
    service = LaboratorioService("ROBOTICA")
    data = service.obtener_simulacion_historica()

    assert isinstance(data, list)
    assert len(data) == 24
    if data:
        item = data[0]
        assert "time" in item
        assert "temp" in item
        assert "humidity" in item
        assert "sensor" in item


def test_obtener_simulacion_historica_uses_strategy_default():
    """
    Current implementation of LaboratorioService.obtener_simulacion_historica()
    does NOT forward the 'horas' parameter (characterization of existing code).
    It always calls the strategy with its internal default.
    """
    service = LaboratorioService("ELECTRONICA")
    data = service.obtener_simulacion_historica()

    # It will be the strategy default (24 for electronica)
    assert len(data) >= 1
    assert all("v_out" in d for d in data)  # specific to electronica simulation


def test_servicio_con_tipo_invalido_en_init():
    """Current behavior: ValueError bubbles up from factory."""
    import pytest
    with pytest.raises(ValueError):
        LaboratorioService("INEXISTENTE")


# Additional characterization tests for procesar logic of all strategies (added in autonomous progress)

def test_agricultura_procesar_estres_critico():
    """Test deterministic estres logic in Agricultura strategy."""
    service = LaboratorioService("AGRICULTURA")
    result = service.ejecutar_analisis({"temperature": 36, "humidity": 20, "imagen_analizada": False})
    assert result["nivel_estres"] == "Crítico"
    assert result["sugerencia_riego"] is True


def test_agricultura_procesar_estres_moderado():
    service = LaboratorioService("AGRICULTURA")
    result = service.ejecutar_analisis({"temperature": 31, "humidity": 40, "imagen_analizada": False})
    assert result["nivel_estres"] == "Moderado"


def test_electronica_procesar_estabilidad():
    """Test deterministic estabilidad logic in Electronica."""
    service = LaboratorioService("ELECTRONICA")
    result = service.ejecutar_analisis({"nodos": 5, "componentes": [{"v": 10}]})
    assert result["estabilidad"] == "Alta"
    assert result["nodos_detectados"] == 5


def test_telecom_procesar_estructura():
    """Telecom procesar always returns expected keys (even with random values)."""
    service = LaboratorioService("TELECOMUNICACIONES")
    result = service.ejecutar_analisis({"senales": []})
    assert result["estado"] == "analizado"
    assert result["tipo"] == "telecom_spectrum"
    assert "frecuencia_dominante" in result
    assert "snr" in result


def test_todos_los_servicios_retornan_dict_con_estado():
    """Smoke test that all 4 lab types return a dict with 'estado' key."""
    for tipo in ["ROBOTICA", "AGRICULTURA", "ELECTRONICA", "TELECOMUNICACIONES"]:
        service = LaboratorioService(tipo)
        result = service.ejecutar_analisis({})
        assert isinstance(result, dict)
        assert "estado" in result


# New edge case characterization tests (added this session, max 5-6, focused on procesar in agricultura/electronica)

def test_agricultura_procesar_con_imagen_analizada():
    """Current behavior: when imagen_analizada=True, enfermedad is chosen from the fixed list (random but constrained)."""
    service = LaboratorioService("AGRICULTURA")
    result = service.ejecutar_analisis({"temperature": 25, "humidity": 70, "imagen_analizada": True})
    assert result["enfermedad"] in ["Roya del Café", "Tizón Tardío", "Cacao: Moniliasis", "Sana"]
    assert result["estado"] == "analizado"


def test_agricultura_procesar_boundary_estres():
    """Characterization of exact boundary logic for estres levels (current code uses >35 or <30 for Crítico, >30 or <45 for Moderado; else Bajo)."""
    service = LaboratorioService("AGRICULTURA")
    # Just over critical
    result = service.ejecutar_analisis({"temperature": 35.1, "humidity": 30, "imagen_analizada": False})
    assert result["nivel_estres"] == "Crítico"
    # At exactly 35/30 -> Moderado (per current elif)
    result = service.ejecutar_analisis({"temperature": 35, "humidity": 30, "imagen_analizada": False})
    assert result["nivel_estres"] == "Moderado"
    # Just over for moderado
    result = service.ejecutar_analisis({"temperature": 30.1, "humidity": 45, "imagen_analizada": False})
    assert result["nivel_estres"] == "Moderado"
    # At exactly 30/45 -> Bajo (characterization)
    result = service.ejecutar_analisis({"temperature": 30, "humidity": 45, "imagen_analizada": False})
    assert result["nivel_estres"] == "Bajo"


def test_agricultura_sugerencia_riego_boundary():
    """Current behavior for sugerencia_riego (hum < 50)."""
    service = LaboratorioService("AGRICULTURA")
    result = service.ejecutar_analisis({"temperature": 20, "humidity": 50, "imagen_analizada": False})
    assert result["sugerencia_riego"] is False  # hum == 50 should be false per current code
    result = service.ejecutar_analisis({"temperature": 20, "humidity": 49, "imagen_analizada": False})
    assert result["sugerencia_riego"] is True


def test_electronica_procesar_nodos_boundary_estabilidad():
    """Characterization of estabilidad boundary at nodos=10."""
    service = LaboratorioService("ELECTRONICA")
    result = service.ejecutar_analisis({"nodos": 10, "componentes": []})
    assert result["estabilidad"] == "Compleja"
    result = service.ejecutar_analisis({"nodos": 9, "componentes": []})
    assert result["estabilidad"] == "Alta"


def test_electronica_procesar_empty_componentes():
    """Current behavior with empty componentes list (no division by zero)."""
    service = LaboratorioService("ELECTRONICA")
    result = service.ejecutar_analisis({"nodos": 3, "componentes": []})
    assert result["corriente_estimada_ma"] == 0.0
    assert result["nodos_detectados"] == 3


# Additional characterization tests added in this final safe round (3-5 new, focused on weak procesar edges in agricultura/electronica + combinations)

def test_agricultura_procesar_bajo_estres():
    """Current behavior for low stress case (temp low, hum high -> Bajo, no riego suggestion)."""
    service = LaboratorioService("AGRICULTURA")
    result = service.ejecutar_analisis({"temperature": 20, "humidity": 80, "imagen_analizada": False})
    assert result["nivel_estres"] == "Bajo"
    assert result["sugerencia_riego"] is False


def test_agricultura_procesar_critico_con_imagen():
    """Combination: high stress + imagen_analizada -> Crítico + random disease from list (characterization of current code)."""
    service = LaboratorioService("AGRICULTURA")
    result = service.ejecutar_analisis({"temperature": 40, "humidity": 20, "imagen_analizada": True})
    assert result["nivel_estres"] == "Crítico"
    assert result["enfermedad"] in ["Roya del Café", "Tizón Tardío", "Cacao: Moniliasis", "Sana"]
    assert "timestamp_analisis" in result


def test_electronica_procesar_nodos_zero():
    """Current behavior at nodos=0 (still Alta if <10, current= v /1 )."""
    service = LaboratorioService("ELECTRONICA")
    result = service.ejecutar_analisis({"nodos": 0, "componentes": [{"v": 12}]})
    assert result["nodos_detectados"] == 0
    assert result["estabilidad"] == "Alta"
    assert result["corriente_estimada_ma"] == 12000.0


def test_electronica_procesar_multi_component_sum():
    """Characterization of current sum logic for multiple components."""
    service = LaboratorioService("ELECTRONICA")
    result = service.ejecutar_analisis({"nodos": 2, "componentes": [{"v": 10}, {"v": 6}]})
    assert result["corriente_estimada_ma"] == 8000.0  # (16V / 2) * 1000
    assert result["nodos_detectados"] == 2


def test_agricultura_procesar_default_inputs_critico():
    """Characterization: missing/zero inputs -> hum=0 <30 triggers Crítico + riego suggestion (exact current if/elif, no imagen)."""
    service = LaboratorioService("AGRICULTURA")
    result = service.ejecutar_analisis({})  # defaults: temp=0, hum=0, imagen_analizada=False
    assert result["nivel_estres"] == "Crítico"
    assert result["sugerencia_riego"] is True
    assert result["enfermedad"] is None
    assert result["estado"] == "analizado"


def test_robotica_procesar_echoes_input_exactly():
    """Characterization of robotica: procesar just echoes input under 'resultado' + fixed tipo/estado (no transformation at all)."""
    service = LaboratorioService("ROBOTICA")
    payload = {"sensor_id": 42, "joint_angles": [0.1, 0.2], "extra": None}
    result = service.ejecutar_analisis(payload)
    assert result["estado"] == "procesado"
    assert result["tipo"] == "robotica_telemetria"
    assert result["resultado"] == payload  # exact echo per current impl in robotica.py:11-17


def test_factory_and_service_integration_smoke():
    """Smoke integration test between factory + service: both paths (direct strategy and via LaboratorioService) produce the exact same 'tipo' keys for all 4 labs (characterizes current composition/wiring)."""
    from api.logic.domain.factories import LaboratorioStrategyFactory
    expected_tipos = {
        "ROBOTICA": "robotica_telemetria",
        "AGRICULTURA": "agricultura_analisis",
        "ELECTRONICA": "electronica_circuit_analysis",
        "TELECOMUNICACIONES": "telecom_spectrum",
    }
    for tipo_lab, expected_tipo in expected_tipos.items():
        # via factory direct (low level)
        strat = LaboratorioStrategyFactory.obtener_estrategia(tipo_lab)
        res_f = strat.procesar({"dummy": 1})
        # via service (exercises __init__ + factory + ejecutar_analisis delegation)
        svc = LaboratorioService(tipo_lab)
        res_s = svc.ejecutar_analisis({"dummy": 1})
        assert res_f["tipo"] == expected_tipo
        assert res_s["tipo"] == expected_tipo
        assert isinstance(res_f, dict) and isinstance(res_s, dict)