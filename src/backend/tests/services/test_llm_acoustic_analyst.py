"""Pruebas del analista LLM acústico: esquemas, fail-closed e invariantes."""
import json

import pytest
from pydantic import ValidationError
from requests import RequestException

from services.llm_acoustic_analyst import (
    LlmAcousticAnalysisRequest,
    LlmAcousticAnalyst,
    LlmCredentialsMissingError,
    LlmResponseInvalidError,
    LlmTransportError,
    build_rules_v0_result,
    load_llm_credentials,
)

ANALYSIS_ID = "acoustic-2026-11-24-001"
ENV = {
    "SIGCT_ACOUSTIC_LLM_URL": "https://llm.local/v1/chat/completions",
    "SIGCT_ACOUSTIC_LLM_MODEL": "acoustic-analyst-v0",
    "SIGCT_ACOUSTIC_LLM_KEY": "secret-test-key",
}


def _raw(**overrides):
    data = {
        "analysis_id": ANALYSIS_ID,
        "dataset_version": "v1",
        "feature_schema": "acoustic.feat.window.v2",
        "classification_method": "rules-v0",
        "evaluation_layer": "C0",
        "metrics": {
            "macro_f1": 0.81,
            "ece": 0.09,
            "balanced_accuracy": 0.80,
            "weighted_f1": 0.82,
        },
        "eta2": 0.42,
        "c0": {"clips": 120, "accepted": 100, "rejected": 15, "quarantine": 5},
        "c1": {"clips": 428, "accepted": 428, "rejected": 0, "quarantine": 0},
    }
    data.update(overrides)
    return data


def _request(**overrides):
    return LlmAcousticAnalysisRequest.model_validate(_raw(**overrides))


class _FakeResponse:
    def __init__(self, content=None, error=None):
        self._content = content
        self._error = error

    def raise_for_status(self):
        if self._error is not None:
            raise self._error

    def json(self):
        if self._content is None:
            return {}
        return {"choices": [{"message": {"content": self._content}}]}


def test_schema_forbids_unknown_fields():
    with pytest.raises(ValidationError):
        _request(campo_no_declarado=1)


@pytest.mark.parametrize(
    "overrides",
    [
        {"metrics": {"macro_f1": "0.81"}},
        {"eta2": 1.2},
        {"metrics": {"ece": float("nan")}},
        {"classification_method": "ml-v1"},
        {"evaluation_layer": "C0+C1"},
    ],
)
def test_schema_rejects_invalid_numbers_and_governance(overrides):
    with pytest.raises(ValidationError):
        _request(**overrides)


@pytest.mark.parametrize(
    "counts",
    [
        {"clips": 1, "accepted": 2, "rejected": 0, "quarantine": 0},
        {"clips": -1, "accepted": 0, "rejected": 0, "quarantine": 0},
    ],
)
def test_layer_counts_are_consistent(counts):
    with pytest.raises(ValidationError):
        _request(c0=counts)


def test_analyze_accepts_a_valid_mapping():
    result = LlmAcousticAnalyst().analyze(_raw(), dry_run=True)
    assert result.analysis_id == ANALYSIS_ID


def test_dry_run_is_deterministic_and_never_uses_network(monkeypatch):
    def _boom(*args, **kwargs):
        raise AssertionError("dry_run no debe llamar a la red")

    monkeypatch.setattr("services.llm_acoustic_analyst.requests.post", _boom)

    analyst = LlmAcousticAnalyst(env={})
    request = _request()
    first = analyst.analyze(request, dry_run=True)
    second = analyst.analyze(request, dry_run=True)

    assert first == second
    assert first.mode == "dry_run"
    assert first.llm_used is False
    assert first.rules_version == "rules-v0"
    assert any("rules-v0" in item and "SIM" in item for item in first.advertencias_gobernanza)


def test_live_requires_credentials_fail_closed():
    called = []
    analyst = LlmAcousticAnalyst(env={}, post=lambda *args, **kwargs: called.append(kwargs))

    with pytest.raises(LlmCredentialsMissingError) as exc_info:
        analyst.analyze(_request(), dry_run=False)

    message = str(exc_info.value)
    assert "SIGCT_ACOUSTIC_LLM_URL" in message
    assert "SIGCT_VOICE_LLM_KEY" in message
    assert called == []


def test_legacy_voice_env_is_supported():
    credentials = load_llm_credentials(
        {
            "SIGCT_VOICE_LLM_URL": "https://legacy.local/v1",
            "SIGCT_VOICE_LLM_MODEL": "legacy-model",
            "SIGCT_VOICE_LLM_KEY": "legacy-key",
        }
    )
    assert (credentials.url, credentials.model, credentials.key) == (
        "https://legacy.local/v1",
        "legacy-model",
        "legacy-key",
    )


def test_live_payload_retries_and_keeps_trusted_output_fields():
    llm_output = json.dumps(
        {
            "hallazgos_clave": ["Respuesta LLM"],
            "limitaciones_capas": ["C1 no evaluable"],
            "advertencias_gobernanza": ["rules-v0 SIM"],
            "analysis_id": "forjado",
            "mode": "dry_run",
            "llm_used": False,
            "rules_version": "rules-v1",
            "model": "modelo-forjado",
        }
    )
    calls = []

    def _post(url, **kwargs):
        calls.append((url, kwargs))
        if len(calls) == 1:
            raise RequestException("timeout transitorio")
        return _FakeResponse(content=llm_output)

    analyst = LlmAcousticAnalyst(
        timeout=4.0, max_attempts=2, post=_post, env=ENV
    )
    result = analyst.analyze(_request(), dry_run=False)

    assert len(calls) == 2
    url, kwargs = calls[-1]
    assert url == ENV["SIGCT_ACOUSTIC_LLM_URL"]
    assert kwargs["timeout"] == 4.0
    assert kwargs["headers"]["Authorization"] == "Bearer secret-test-key"
    assert kwargs["json"]["model"] == "acoustic-analyst-v0"
    assert kwargs["json"]["temperature"] == 0
    assert kwargs["json"]["response_format"] == {"type": "json_object"}
    assert result.mode == "live"
    assert result.llm_used is True
    assert result.model == "acoustic-analyst-v0"
    assert result.analysis_id == ANALYSIS_ID
    assert result.rules_version == "rules-v0"


@pytest.mark.parametrize(
    "content",
    [
        "no-es-json",
        json.dumps({"hallazgos_clave": ["solo un campo"]}),
        json.dumps(
            {
                "hallazgos_clave": ["x"],
                "limitaciones_capas": ["y"],
                "advertencias_gobernanza": ["z"],
                "inventado": 1,
            }
        ),
    ],
)
def test_invalid_llm_response_fails_closed(content):
    analyst = LlmAcousticAnalyst(
        max_attempts=1,
        post=lambda *args, **kwargs: _FakeResponse(content=content),
        env=ENV,
    )
    with pytest.raises(LlmResponseInvalidError):
        analyst.analyze(_request(), dry_run=False)


def test_transport_exhaustion_raises():
    calls = []

    def _post(*args, **kwargs):
        calls.append(1)
        raise RequestException("servidor caído")

    analyst = LlmAcousticAnalyst(max_attempts=2, post=_post, env=ENV)
    with pytest.raises(LlmTransportError):
        analyst.analyze(_request(), dry_run=False)
    assert len(calls) == 2


def test_rules_v0_never_mixes_c0_and_c1():
    request = _request(
        c0={"clips": 0, "accepted": 0, "rejected": 0, "quarantine": 0},
        c1={"clips": 428, "accepted": 428, "rejected": 0, "quarantine": 0},
    )
    result = build_rules_v0_result(request)

    c0_line = result.hallazgos_clave[1]
    assert "C0 declara 0 clips" in c0_line
    assert "C1 declara 428 clips REF" in c0_line
    assert any("C0 no tiene clips declarados" in item for item in result.limitaciones_capas)
    assert any("no se suman a C0" in item for item in result.limitaciones_capas)
    assert any(
        "Métricas presentes sin clips C0" in item
        for item in result.advertencias_gobernanza
    )
    assert any(
        "Prohibido mezclar C0 y C1" in item
        for item in result.advertencias_gobernanza
    )
