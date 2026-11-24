"""Pruebas HTTP de los endpoints CMSC: catálogo C0 y cálculo fail-closed."""
import json
import math

from rest_framework.test import APIRequestFactory

from api import cmsc_views
from api.cmsc_views import AcousticEnvelopesView, RealSeriesCalculusView

SCHEMA = "cmsc.acoustic.envelopes.v1"


def envelope_file(tmp_path, *, schema=SCHEMA, count=2):
    path = tmp_path / "envelopes.json"
    path.write_text(
        json.dumps(
            {
                "schema": schema,
                "description": "fixture de pruebas",
                "count": count,
                "envelopes": {
                    "ac_test_000": [0.1, 0.4, 0.9, 0.5],
                    "ac_test_001": [0.2, 0.3, 0.7, 0.6],
                },
            }
        ),
        encoding="utf-8",
    )
    return path


def test_catalog_exposes_real_local_provenance(tmp_path, monkeypatch):
    monkeypatch.setattr(cmsc_views, "resolve_envelope_path", lambda: envelope_file(tmp_path))
    response = AcousticEnvelopesView.as_view()(
        APIRequestFactory().get("/api/v3/cmsc/acoustic-envelopes/")
    )
    assert response.status_code == 200
    body = response.data
    assert body["ok"] is True
    assert body["estado"] == "REAL-LOCAL"
    assert body["layer"] == "C0"
    assert body["count"] == 2
    assert body["samples"][0]["n"] == 4
    assert body["samples"][0]["duration_s"] > 0


def test_sample_endpoint_returns_time_values_and_honors_missing_id(tmp_path, monkeypatch):
    monkeypatch.setattr(cmsc_views, "resolve_envelope_path", lambda: envelope_file(tmp_path))
    factory = APIRequestFactory()
    response = AcousticEnvelopesView.as_view()(
        factory.get("/api/v3/cmsc/acoustic-envelopes/", {"sample_id": "ac_test_000"})
    )
    assert response.status_code == 200
    assert response.data["estado"] == "REAL-LOCAL"
    assert response.data["values"] == [0.1, 0.4, 0.9, 0.5]
    assert len(response.data["time"]) == 4

    missing = AcousticEnvelopesView.as_view()(
        factory.get("/api/v3/cmsc/acoustic-envelopes/", {"sample_id": "no_existe"})
    )
    assert missing.status_code == 404
    assert missing.data["code"] == "NO_DATA"


def test_catalog_fails_closed_on_wrong_schema_or_missing_file(tmp_path, monkeypatch):
    monkeypatch.setattr(
        cmsc_views,
        "resolve_envelope_path",
        lambda: envelope_file(tmp_path, schema="otro.schema"),
    )
    response = AcousticEnvelopesView.as_view()(
        APIRequestFactory().get("/api/v3/cmsc/acoustic-envelopes/")
    )
    assert response.status_code == 503
    assert response.data["ok"] is False

    monkeypatch.setattr(cmsc_views, "resolve_envelope_path", lambda: tmp_path / "no_file.json")
    missing = AcousticEnvelopesView.as_view()(
        APIRequestFactory().get("/api/v3/cmsc/acoustic-envelopes/")
    )
    assert missing.status_code == 503


def test_calculus_endpoint_computes_and_rejects_bad_payload():
    time = [i * 0.01 for i in range(629)]  # un período completo
    payload = {
        "series": {
            "time": time,
            "values": [math.sin(t) for t in time],
            "estado": "REAL-LOCAL",
            "layer": "C0",
        },
        "options": {"minSamples": 3},
    }
    response = RealSeriesCalculusView.as_view()(
        APIRequestFactory().post(
            "/api/v3/cmsc/real-series-calculus/", payload, format="json"
        )
    )
    assert response.status_code == 200
    body = response.data
    assert body["ok"] is True
    assert body["provenance"]["estado"] == "REAL-LOCAL"
    assert body["differential"]["criticalCount"] >= 1
    assert body["integral"]["normL2"] > 0

    bad = RealSeriesCalculusView.as_view()(
        APIRequestFactory().post(
            "/api/v3/cmsc/real-series-calculus/",
            {"series": {"time": [0, 1, 2], "values": [1, 2], "estado": "REAL-LOCAL"}},
            format="json",
        )
    )
    assert bad.status_code == 422
    assert bad.data["code"] == "SCHEMA_INVALID"

    broken = RealSeriesCalculusView.as_view()(
        APIRequestFactory().post(
            "/api/v3/cmsc/real-series-calculus/",
            {
                "series": {"time": [0, 1, 2, 3], "values": [1, 2, 3, 4]},
                "options": {"minSamples": 5},
            },
            format="json",
        )
    )
    assert broken.status_code == 422
    assert broken.data["code"] == "TOO_SHORT"
