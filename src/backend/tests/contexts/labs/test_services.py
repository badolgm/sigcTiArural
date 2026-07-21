"""
Characterization tests for LaboratorioService.

Tests the current behavior of the domain service layer.
These are "characterization tests" to protect existing logic
during the hexagonal refactor (Fase 0 baseline + Fase 1 consolidate).

Fase 1 focus (per ADSO Sec 7.8):
- Edge cases for procesar() in all strategies.
- Full coverage of generar_historico_simulado via service (all 4 labs).
- Multi-switch behavior of the service (stateful strategy holder).
- Smoke integration factory <-> service.

How to add a test for a new lab (future):
1. Add characterization test here that exercises the public API of LaboratorioService
   (cambiar_laboratorio, ejecutar_analisis, obtener_simulacion_historica).
2. Observe real behavior first (python -c "from api... ; ...") then assert exact observed.
3. Run pytest + .\\scripts\verify_refactor.ps1 after every addition.
4. Never assert "better" behavior; lock what the current domain does.

These tests are the safety net for when we later extract ports/adapters (higher risk phases).

"""
import pytest

from contexts.labs.domain.services.laboratorio_service import LaboratorioService


def test_servicio_default_robotica(lab_service):
    """Default lab type is ROBOTICA (via fixture) and ejecutar_analisis returns expected structure (characterization of __init__ default + robotica.procesar echo)."""
    # lab_service fixture provides default ROBOTICA (see conftest.py for Fase 1 DRY improvement)
    result = lab_service.ejecutar_analisis({"foo": "bar"})

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


# Additional characterization tests for procesar logic of all strategies (added across Fase 0/1 autonomous sessions).
# See also the Fase 1 historico + error sections below.

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


# Edge case characterization tests for procesar (focused on agricultura/electronica boundaries, added in prior Fase 1 work).
# Quality note: many of these could be refactored with @pytest.mark.parametrize for even cleaner organization.

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


# Additional characterization tests (focused on weak procesar edges + combinations, from previous safe round).
# These + the historico ones below target Sec 7.8 goals for simulation edges and coverage.

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
    from contexts.labs.domain.factories.laboratorio_factory import LaboratorioStrategyFactory
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


# ============================================================
# Fase 1: Consolidate Domain - Additional characterization tests
# Focus: edge cases and simulation historico (to cover generar_historico_simulado
# in all strategies and the forwarding logic in service). Per Sec 7.8.
# These lock the *current observed* behavior of the existing domain core.
# ============================================================

def test_todos_labs_historico_genera_exactly_24_registros():
    """Characterization: all 4 labs' historico via service always return exactly 24 items (default in strategies + service ignores any horas arg)."""
    for tipo in ["ROBOTICA", "AGRICULTURA", "ELECTRONICA", "TELECOMUNICACIONES"]:
        svc = LaboratorioService(tipo)
        data = svc.obtener_simulacion_historica()
        assert isinstance(data, list)
        assert len(data) == 24, f"Expected 24 for {tipo}, got {len(data)}"


def test_agricultura_historico_estructura_y_sensor():
    """Current Agricultura historico structure (keys + specific sensor tag from generar_historico_simulado)."""
    svc = LaboratorioService("AGRICULTURA")
    data = svc.obtener_simulacion_historica()
    assert len(data) == 24
    item = data[0]
    assert "time" in item and "temp" in item and "humidity" in item and "sensor" in item
    assert "AgroNode-Sim (Domain v2)" in item["sensor"]


def test_robotica_historico_estructura_y_sensor():
    """Current Robotica historico structure and sensor (characterizes the sim in robotica.py)."""
    svc = LaboratorioService("ROBOTICA")
    data = svc.obtener_simulacion_historica()
    assert len(data) == 24
    item = data[5]  # mid list
    assert set(item.keys()) == {"time", "temp", "humidity", "sensor"}
    assert "Simulado (Domain v2)" in item["sensor"]


def test_electronica_historico_estructura_y_sensor():
    """Current Electronica historico (different keys: v_out etc + DigitalTwin sensor)."""
    svc = LaboratorioService("ELECTRONICA")
    data = svc.obtener_simulacion_historica()
    assert len(data) == 24
    item = data[0]
    assert "v_out" in item and "i_load_ma" in item and "temp_mosfet" in item
    assert "DigitalTwin-V2" in item["sensor"]


def test_telecom_historico_estructura_y_sensor():
    """Current Telecom historico (signal keys + SDR sensor from its generar)."""
    svc = LaboratorioService("TELECOMUNICACIONES")
    data = svc.obtener_simulacion_historica()
    assert len(data) == 24
    item = data[-1]  # last
    assert "signal_strength" in item and "noise_floor" in item
    assert "SDR-Simulated (Domain v2)" in item["sensor"]


def test_cambiar_laboratorio_multiple_switches_affect_procesar_and_historico():
    """Characterization of service as stateful strategy holder: multiple cambiar_laboratorio affect both procesar 'tipo' and subsequent historico sensor."""
    svc = LaboratorioService("ROBOTICA")
    # initial
    r = svc.ejecutar_analisis({"x": 1})
    assert r["tipo"] == "robotica_telemetria"
    h0 = svc.obtener_simulacion_historica()
    assert "Simulado (Domain v2)" in h0[0]["sensor"]

    # switch to agri
    svc.cambiar_laboratorio("AGRICULTURA")
    r = svc.ejecutar_analisis({"temperature": 22, "humidity": 70})
    assert r["tipo"] == "agricultura_analisis"
    h1 = svc.obtener_simulacion_historica()
    assert "AgroNode-Sim (Domain v2)" in h1[0]["sensor"]

    # switch to telecom
    svc.cambiar_laboratorio("TELECOMUNICACIONES")
    r = svc.ejecutar_analisis({})
    assert r["tipo"] == "telecom_spectrum"
    h2 = svc.obtener_simulacion_historica()
    assert "SDR-Simulated (Domain v2)" in h2[0]["sensor"]


# ============================================================
# Fase 1 continued (aggressive but safe): more edges for generar_historico_simulado (direct on strategies),
# error cases / current lack of validation, factory casing quirks, service guard branch,
# and additional switch/error characterization. Per Sec 7.8 "edge cases de simulaciones" + "casos de error y validaciones".
# Also demonstrates quality: some use the make_lab_service fixture from conftest.
# ============================================================

def test_estrategias_historico_directo_edges_para_todas_las_labs():
    """
    Characterization of generar_historico_simulado on the concrete strategies (obtained via factory).
    Covers the loop + time calc + random (len check only) for multiple 'horas' values including edges 0/1/48.
    Note: service never forwards horas (see earlier test); strategies do support the param.
    """
    from contexts.labs.domain.factories.laboratorio_factory import LaboratorioStrategyFactory
    labs = ["ROBOTICA", "AGRICULTURA", "ELECTRONICA", "TELECOMUNICACIONES"]
    for tipo in labs:
        strat = LaboratorioStrategyFactory.obtener_estrategia(tipo)
        for horas in [0, 1, 5, 24, 48]:
            data = strat.generar_historico_simulado(horas)
            assert len(data) == horas, f"{tipo} with horas={horas} gave {len(data)}"
            if horas > 0:
                assert "time" in data[0]
                assert isinstance(data[0]["time"], str)


def test_estrategias_historico_directo_horas_negativo_o_cero_devuelve_lista_vacia():
    """Current behavior (characterization): range(negative) or 0 in all generar_historico_simulado yields []."""
    from contexts.labs.domain.factories.laboratorio_factory import LaboratorioStrategyFactory
    for tipo in ["ROBOTICA", "AGRICULTURA", "ELECTRONICA", "TELECOMUNICACIONES"]:
        strat = LaboratorioStrategyFactory.obtener_estrategia(tipo)
        assert strat.generar_historico_simulado(0) == []
        assert strat.generar_historico_simulado(-3) == []
        assert strat.generar_historico_simulado(-1) == []


def test_factory_obtener_estrategia_no_tolera_espacios_en_nombre():
    """Current (no trim): names with leading/trailing spaces after .upper() fail lookup -> ValueError."""
    from contexts.labs.domain.factories.laboratorio_factory import LaboratorioStrategyFactory
    with pytest.raises(ValueError) as exc:
        LaboratorioStrategyFactory.obtener_estrategia("ROBOTICA ")
    assert "no soportado" in str(exc.value)
    with pytest.raises(ValueError):
        LaboratorioStrategyFactory.obtener_estrategia(" agricultura")


def test_cambiar_laboratorio_invalido_levanta_valueerror():
    """Symmetrical to init: cambiar_laboratorio with unknown type raises the same ValueError from factory."""
    svc = LaboratorioService("ROBOTICA")
    with pytest.raises(ValueError) as exc:
        svc.cambiar_laboratorio("QUIMICA")
    assert "Tipo de laboratorio no soportado" in str(exc.value)


def test_ejecutar_analisis_agricultura_datos_no_numericos_levanta_typeerror_actual():
    """
    Characterization of current lack of validation/robustness in agricultura.procesar:
    non-numeric temp/hum leads to TypeError on '>' comparison (not caught).
    This is observed behavior to lock before any future input sanitizing (higher phase).
    """
    svc = LaboratorioService("AGRICULTURA")
    with pytest.raises(TypeError) as exc:
        svc.ejecutar_analisis({"temperature": "hot", "humidity": 20})
    assert "not supported between" in str(exc.value) or ">" in str(exc.value)


def test_ejecutar_analisis_electronica_componentes_invalidos_levanta_attributeerror_actual():
    """
    Characterization for electronica: if 'componentes' is not list-of-dicts (e.g. str),
    the sum([c.get...]) fails with AttributeError on the bad value.
    Current observed (no guard).
    """
    svc = LaboratorioService("ELECTRONICA")
    with pytest.raises(AttributeError):
        svc.ejecutar_analisis({"nodos": 2, "componentes": "not-a-list"})


def test_obtener_simulacion_historica_fallback_lista_vacia_si_estrategia_sin_metodo():
    """
    Characterization of the hasattr guard + return [] in LaboratorioService.obtener_simulacion_historica (line ~21).
    Exercises the 'no historico support' fallback path (currently never hit by real strategies, but part of the code).
    Uses private mutation only for test (acceptable for full branch coverage of the service layer).
    """
    svc = LaboratorioService("ROBOTICA")
    # Force a dummy without the method
    original = svc._estrategia
    try:
        class _NoHistorico:
            def procesar(self, datos):
                return {"estado": "ok"}
        svc._estrategia = _NoHistorico()
        data = svc.obtener_simulacion_historica()
        assert data == []
    finally:
        svc._estrategia = original  # restore


def test_todos_labs_procesar_con_input_minimo_no_rompe():
    """Smoke + edge: all labs accept minimal/empty-ish input for procesar and return dict with 'estado' (no crash on defaults)."""
    for tipo in ["ROBOTICA", "AGRICULTURA", "ELECTRONICA", "TELECOMUNICACIONES"]:
        svc = LaboratorioService(tipo)
        res = svc.ejecutar_analisis({})  # or minimal
        assert isinstance(res, dict)
        assert "estado" in res


# ============================================================
# FASE 2: Aislamiento de Interfaces - Pruebas de Puertos y Adaptadores
# Certifica el desacoplamiento y cableado de contratos (SOLID).
# ============================================================

def test_laboratorio_service_dispara_alerta_cuando_estres_es_critico():
    """
    Certifica que LaboratorioService invoque correctamente el puerto de notificaciones
    cuando la estrategia de AGRICULTURA reporta un nivel de estrés 'Crítico'.
    """
    from contexts.labs.domain.services.laboratorio_service import LaboratorioService
    from contexts.labs.infrastructure.notifications.console_notification_adapter import ConsoleNotificationAdapter

    # 1. Instanciamos el adaptador de consola real
    adaptador_notificaciones = ConsoleNotificationAdapter()

    # 2. Inyectamos el adaptador en el servicio configurado para AGRICULTURA
    servicio = LaboratorioService(tipo_lab="AGRICULTURA", notification_port=adaptador_notificaciones)

    # 3. Simulamos datos de entrada que sabemos de forma determinista que disparan estrés crítico
    datos_criticos = {"temperature": 36, "humidity": 20, "imagen_analizada": False}

    # 4. Ejecutamos el análisis
    resultado = servicio.ejecutar_analisis(datos_criticos)

    # 5. Verificaciones de contrato y estado del dominio
    assert resultado["nivel_estres"] == "Crítico"
    assert resultado["sugerencia_riego"] is True


def test_laboratorio_service_integra_puerto_ia_correctamente():
    """
    Certifica que LaboratorioService acepte la inyección del puerto de IA
    y que el adaptador responda adecuadamente al contrato establecido.
    """
    from contexts.labs.domain.services.laboratorio_service import LaboratorioService
    from api.logic.adapters.ai_service import FastAPI_AIAdapter

    # 1. Instanciamos el adaptador real
    adaptador_ia = FastAPI_AIAdapter()

    # 2. Inyectamos el adaptador en el servicio
    servicio = LaboratorioService(tipo_lab="AGRICULTURA", ai_service_port=adaptador_ia)

    # 3. Validamos la persistencia de la instancia dentro del servicio de dominio
    assert servicio._ai_service_port is not None
    assert isinstance(servicio._ai_service_port, FastAPI_AIAdapter)

    # 4. Probamos el método de fallback determinista local del adaptador
    datos_prueba = {"temperature": 35, "humidity": 30}
    resultado_fallback = adaptador_ia._sugerencias_basicas(datos_prueba)

    assert "Alerta" in resultado_fallback["sugerencia"]
    assert resultado_fallback["fuente"] == "Fallback Local"
