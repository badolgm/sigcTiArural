"""
Fase F1 (docs/SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md): caracterización de
TelemetryIngestV3View (POST /api/v3/telemetry/readings/).

Reutiliza el use case RegistrarLecturaSensorCommand y los value objects de
contexts/telemetry; valida el sobre V3 (context/contract_version/operation/
source_mode live|fallback) y que la lectura quede persistida y visible en
TelemetryHistoryV3View (GET /api/v3/telemetry/history/) con source_mode='live'.

Patrón de tests: APIClient + reverse + @pytest.mark.django_db, igual que
tests/api/test_telemetry_history_v2_view.py.
"""

import pytest
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from api.models import SensorReading


@pytest.fixture
def api_client():
    return APIClient()


def _timestamp_pasado_iso_z():
    """Timestamp seguro en ISO-8601 con sufijo 'Z', siempre en pasado para
    respetar el invariante de SensorReading (no futuros)."""
    ts = (timezone.now() - timedelta(minutes=5)).astimezone(timezone.utc)
    return ts.strftime("%Y-%m-%dT%H:%M:%SZ")


def _payload(**overrides):
    payload = {
        "sensor_id": "BBB-03",
        "temperature": 24.5,
        "humidity": 78.1,
        "timestamp": _timestamp_pasado_iso_z(),
    }
    payload.update(overrides)
    return payload


@pytest.mark.django_db
def test_post_valido_persiste_lectura(api_client):
    SensorReading.objects.all().delete()

    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(), format="json")

    assert response.status_code == 201
    data = response.json()

    assert data["context"] == "telemetry"
    assert data["contract_version"] == "v1"
    assert data["operation"] == "register_reading"
    assert data["source_mode"] == "live"

    item = data["item"]
    assert item["sensor_id"] == "BBB-03"
    assert item["temperature"] == 24.5
    assert item["humidity"] == 78.1
    assert item["reading_id"] is not None
    assert item["timestamp"]  # ISO-8601

    lectura = SensorReading.objects.get(sensor_id="BBB-03")
    assert lectura.temperature == 24.5
    assert lectura.humidity == 78.1


@pytest.mark.django_db
def test_post_valido_visible_en_history_v3_como_live(api_client):
    """End-to-end de F1: tras el POST, GET /api/v3/telemetry/history/ debe
    devolver la lectura con source_mode='live' (antes: solo simulado)."""
    SensorReading.objects.all().delete()

    url = reverse("telemetry-ingest-v3")
    post_response = api_client.post(url, _payload(), format="json")
    assert post_response.status_code == 201

    history_url = reverse("telemetry-history-v3")
    history_response = api_client.get(history_url, {"tipo": "AGRICULTURA"})

    assert history_response.status_code == 200
    data = history_response.json()

    assert data["source_mode"] == "live"
    assert data["context"] == "telemetry"
    assert data["contract_version"] == "v1"
    assert data["count"] == 1
    assert data["items"][0]["sensor_id"] == "BBB-03"
    assert data["items"][0]["temperature"] == 24.5
    assert data["items"][0]["humidity"] == 78.1


@pytest.mark.django_db
def test_post_sin_timestamp_usa_ahora_y_persiste(api_client):
    """El campo timestamp es opcional: el default de la entidad (ahora)
    debe operar y persistir sin futuros rechazos."""
    SensorReading.objects.all().delete()

    url = reverse("telemetry-ingest-v3")
    payload = _payload()
    payload.pop("timestamp")
    response = api_client.post(url, payload, format="json")

    assert response.status_code == 201
    assert response.json()["source_mode"] == "live"
    assert SensorReading.objects.filter(sensor_id="BBB-03").count() == 1


@pytest.mark.django_db
def test_post_sensor_id_vacio_devuelve_400_fallback(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(sensor_id="   "), format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"
    assert response.json()["error"]["code"] == "invalid_payload"
    assert SensorReading.objects.count() == 0


@pytest.mark.django_db
def test_post_temperatura_fuera_de_rango_devuelve_400(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(temperature=99.0), format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"
    assert response.json()["error"]["code"] == "invalid_payload"


@pytest.mark.django_db
def test_post_humedad_fuera_de_rango_devuelve_400(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(humidity=150.0), format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"
    assert response.json()["error"]["code"] == "invalid_payload"


@pytest.mark.django_db
def test_post_timestamp_futuro_devuelve_400(api_client):
    """Invariante de dominio: no se admiten lecturas con timestamp futuro."""
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(
        url, _payload(timestamp="2099-01-01T00:00:00Z"), format="json"
    )

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"
    assert "futuro" in response.json()["error"]["detail"]


@pytest.mark.django_db
def test_post_payload_incompleto_devuelve_400(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, {"sensor_id": "BBB-03"}, format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"
    assert response.json()["error"]["code"] == "invalid_payload"


@pytest.mark.django_db
def test_post_temperature_no_numerica_devuelve_400(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(temperature="caliente"), format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"
    assert response.json()["error"]["code"] == "invalid_payload"


# --- Caseos borde F1.1 (hardening, detectados en auditoría) ---


@pytest.mark.django_db
def test_post_temperature_null_devuelve_400(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(temperature=None), format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"
    assert response.json()["error"]["code"] == "invalid_payload"


@pytest.mark.django_db
def test_post_humidity_null_devuelve_400(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(humidity=None), format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"


@pytest.mark.django_db
def test_post_temperature_booleano_devuelve_400(api_client):
    """bool es subclase de int en Python: sin la defensa, true se aceptaría
    como 1.0 °C. El adaptador debe rechazarlo explícitamente."""
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(temperature=True), format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"
    assert response.json()["error"]["code"] == "invalid_payload"


@pytest.mark.django_db
def test_post_humidity_booleana_devuelve_400(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(humidity=True), format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"


@pytest.mark.django_db
def test_post_sensor_id_no_cadena_devuelve_400(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(sensor_id=123), format="json")

    assert response.status_code == 400
    assert response.json()["source_mode"] == "fallback"


@pytest.mark.django_db
def test_post_sensor_id_demasiado_largo_devuelve_400_no_500(api_client):
    """Defensa: el modelo Django limita sensor_id a 50 chars. Sin este chequeo
    el VO (que solo exige no-vacío) lo aceptaría y la BD rompería con 500."""
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(sensor_id="X" * 51), format="json")

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "invalid_payload"


@pytest.mark.django_db
def test_post_body_lista_devuelve_400(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, [{"sensor_id": "BBB-03"}], format="json")

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "invalid_payload"


@pytest.mark.django_db
def test_post_json_malformado_devuelve_400_envelope(api_client):
    url = reverse("telemetry-ingest-v3")
    response = api_client.post(
        url,
        data='{"sensor_id": "BBB-03", "temperature": ',
        content_type="application/json",
    )

    assert response.status_code == 400
    body = response.json()
    assert body["source_mode"] == "fallback"
    assert body["error"]["code"] == "invalid_payload"


@pytest.mark.django_db
def test_post_timestamp_null_se_trata_como_omitido(api_client):
    """timestamp=null debe equivaler a omitirlo (usa now()) en vez de 400."""
    SensorReading.objects.all().delete()

    url = reverse("telemetry-ingest-v3")
    response = api_client.post(url, _payload(timestamp=None), format="json")

    assert response.status_code == 201
    assert SensorReading.objects.filter(sensor_id="BBB-03").count() == 1


@pytest.mark.django_db
def test_post_campos_extra_no_rompen(api_client):
    """Payloads con campos extra son tolerados (sin romper compatibilidad)."""
    SensorReading.objects.all().delete()

    url = reverse("telemetry-ingest-v3")
    response = api_client.post(
        url,
        {
            "sensor_id": "BBB-03",
            "temperature": 24.5,
            "humidity": 78.1,
            "extra": "ignorado",
        },
        format="json",
    )

    assert response.status_code == 201
    assert SensorReading.objects.filter(sensor_id="BBB-03").count() == 1