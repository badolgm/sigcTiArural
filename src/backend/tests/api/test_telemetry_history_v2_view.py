"""
Caracterización del comportamiento ACTUAL de TelemetryHistoryV2View
(api/views.py), tal como está hoy con DjangoRepository real.

Estos tests se escriben ANTES de introducir el adaptador puente
(Día 10, Paso 2b) para fijar una línea base byte a byte del
comportamiento en producción, siguiendo el mismo patrón usado en
Día 9 para contexts/telemetry/ (28 tests de caracterización antes
de tocar código sin cobertura previa). No deben modificarse cuando
se conecte el adaptador: si algo cambia de resultado, el adaptador
está mal, no el test.
"""

import re

import pytest
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from api.models import SensorReading


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_con_lecturas_reales_devuelve_max_24_en_orden_ascendente_y_formato_plano(api_client):
    """Con >=25 lecturas en BD: máx. 24, orden cronológico ascendente,
    formato exacto de 'time' (%H:%M), temp/humidity como floats planos
    (no value objects), y 'sensor' con el sufijo del tipo de lab."""
    SensorReading.objects.all().delete()
    ahora = timezone.now()

    # 30 lecturas, la más antigua primero (i=0, hace 30 min) a la más
    # reciente (i=29, hace 1 min). sensor_id único por lectura para
    # poder rastrear el orden exacto en la respuesta.
    for i in range(30):
        SensorReading.objects.create(
            sensor_id=f"SENSOR-{i:02d}",
            temperature=20.0 + i * 0.1,
            humidity=40.0 + i * 0.1,
            timestamp=ahora - timedelta(minutes=(30 - i)),
        )

    url = reverse("telemetry-history-v2")
    response = api_client.get(url, {"tipo": "ROBOTICA"})

    assert response.status_code == 200
    data = response.json()

    # Máximo 24 elementos, aunque hay 30 lecturas en BD.
    assert len(data) == 24

    # DjangoRepository.listar_todos() trae TODO ordenado por
    # -timestamp (más reciente primero, Meta.ordering del modelo),
    # la vista toma los primeros 24 ([:24], o sea los 24 MAS
    # recientes: i=6..29) y los invierte (data[::-1]) para quedar en
    # orden cronológico ascendente. Los 6 mas antiguos (i=0..5)
    # quedan fuera.
    indices_esperados = list(range(6, 30))

    for item, i in zip(data, indices_esperados):
        lectura = SensorReading.objects.get(sensor_id=f"SENSOR-{i:02d}")

        assert item["time"] == lectura.timestamp.strftime("%H:%M")

        assert item["temp"] == lectura.temperature
        assert isinstance(item["temp"], float)

        assert item["humidity"] == lectura.humidity
        assert isinstance(item["humidity"], float)

        assert item["sensor"] == f"{lectura.sensor_id} (ROBOTICA V2)"

    # El primero y el último confirman los extremos del orden ascendente.
    assert data[0]["sensor"] == "SENSOR-06 (ROBOTICA V2)"
    assert data[-1]["sensor"] == "SENSOR-29 (ROBOTICA V2)"


@pytest.mark.django_db
def test_bd_vacia_cae_a_simulacion_historica(api_client):
    """Sin lecturas en BD: la vista cae al fallback
    service.obtener_simulacion_historica(). Como esa simulación usa
    random.uniform() internamente (api/logic/domain/robotica.py), no
    es determinista entre llamadas -- se caracteriza la FORMA de la
    respuesta, no valores exactos."""
    SensorReading.objects.all().delete()

    url = reverse("telemetry-history-v2")
    response = api_client.get(url, {"tipo": "ROBOTICA"})

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 24  # ProcesadorRobotica.generar_historico_simulado(horas=24)

    for item in data:
        assert set(item.keys()) == {"time", "temp", "humidity", "sensor"}
        assert re.fullmatch(r"\d{2}:\d{2}", item["time"])
        assert isinstance(item["temp"], float)
        assert isinstance(item["humidity"], float)
        assert item["sensor"] == "Simulado (Domain v2)"


@pytest.mark.django_db
def test_tipo_lab_invalido_devuelve_400_con_mensaje_exacto(api_client):
    """tipo_lab no soportado por LaboratorioStrategyFactory: 400 con el
    mensaje de ValueError propagado tal cual (conserva el casing
    original recibido, no lo normaliza a mayúsculas en el mensaje)."""
    url = reverse("telemetry-history-v2")
    response = api_client.get(url, {"tipo": "inventado"})

    assert response.status_code == 400
    assert response.json() == {"error": "Tipo de laboratorio no soportado: inventado"}


@pytest.mark.django_db
def test_sin_query_param_tipo_usa_robotica_por_defecto(api_client):
    """Sin el query param 'tipo': request.query_params.get('tipo', 'ROBOTICA')
    debe defaultear a 'ROBOTICA', visible en el sufijo del campo 'sensor'."""
    SensorReading.objects.all().delete()
    SensorReading.objects.create(
        sensor_id="SENSOR-DEFAULT",
        temperature=22.5,
        humidity=50.0,
    )

    url = reverse("telemetry-history-v2")
    response = api_client.get(url)  # sin 'tipo'

    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["sensor"] == "SENSOR-DEFAULT (ROBOTICA V2)"
