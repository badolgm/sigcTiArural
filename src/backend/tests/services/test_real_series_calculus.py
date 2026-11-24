"""Pruebas del operador numérico: contratos estrictos y fail-closed."""
import math

import pytest
from pydantic import ValidationError

from services.real_series_calculus import (
    CALCULUS_VERSION,
    CalculusRequest,
    RealSeriesCalculusError,
    analyze_payload,
    analyze_series,
)


def payload(time, values, **overrides):
    data = {
        "series": {
            "time": time,
            "values": values,
            "estado": "REAL-LOCAL",
            "layer": "C0",
            "sourceKind": "envelope",
            "sourceLabel": "fixture-C0",
        },
        "options": {"minSamples": 3},
        "order": 1,
        "method": "auto",
    }
    data.update(overrides)
    return data


def sine_payload(n=629, h=0.01):  # un período completo
    time = [i * h for i in range(n)]
    return payload(time, [math.sin(t) for t in time])


def test_schema_is_strict_and_rejects_fabricated_numbers():
    with pytest.raises(ValidationError):
        CalculusRequest.model_validate(payload([0, 1, 2], [1, 2, 3], campo_extra=1))
    with pytest.raises(ValidationError):
        CalculusRequest.model_validate(payload([0, 1, 2], [1, "2", 3]))
    with pytest.raises(ValidationError):
        CalculusRequest.model_validate(payload([0, 1, 2], [1, float("nan"), 3]))
    with pytest.raises(ValidationError):
        CalculusRequest.model_validate(payload([0, 1, 2], [1, 2]))
    with pytest.raises(ValidationError):
        CalculusRequest.model_validate(payload([0, 1, 2], [1, 2, 3], method="newton"))
    with pytest.raises(ValidationError):
        CalculusRequest.model_validate(payload([0, 1, 2], [1, 2, 3], order=3))


def test_full_calculus_inherits_provenance_and_computes_real_numbers():
    result = analyze_payload(sine_payload())
    assert result["ok"] is True
    assert result["version"] == CALCULUS_VERSION
    assert result["provenance"]["estado"] == "REAL-LOCAL"
    assert result["provenance"]["layer"] == "C0"
    assert result["provenance"]["inheritsState"] is True
    assert result["differential"]["method"] == "lagrange-3-point-finite-differences"
    assert abs(result["differential"]["d1"][100] - math.cos(1.0)) < 1e-4
    assert abs(result["differential"]["d2"][100] + math.sin(1.0)) < 1e-4
    assert result["differential"]["criticalCount"] >= 1
    assert result["integral"]["method"] == "simpson-compuesto"
    assert abs(result["integral"]["defined"]) < 1e-5  # error O(h⁴) de Simpson compuesto
    assert result["integral"]["normL2"] > 0
    assert len(result["integral"]["cumulative"]) == 629
    assert result["vector"]["maxMagnitude"] > 0
    assert len(result["vector"]["phaseVectors"]) == 629
    assert result["diagnostics"]["outputCount"] == 629


def test_sim_is_never_promoted_and_unknown_states_degrade():
    sim = analyze_payload({
        "series": {**sine_payload()["series"], "estado": "SIM", "layer": "rules-v0"}
    })
    assert sim["provenance"]["estado"] == "SIM"
    assert sim["provenance"]["layer"] == "rules-v0"

    unknown = analyze_payload({
        "series": {**sine_payload()["series"], "estado": "REAL", "layer": "C9"}
    })
    assert unknown["provenance"]["estado"] == "NO_DATA"
    assert unknown["provenance"]["layer"] == "LOCAL"


def test_gaps_and_outliers_are_declared_not_silently_fixed():
    time = [i * 0.01 for i in range(8)]
    values = [0, 0.1, None, -0.1, None, 0.05, -0.05, 50]
    result = analyze_payload(payload(time, values))
    diag = result["diagnostics"]
    assert diag["droppedNonFinite"] == 2
    assert diag["interpolatedGaps"] == 2
    assert diag["clippedOutliers"] == 1
    assert all(math.isfinite(v) for v in result["differential"]["d1"])


@pytest.mark.parametrize(
    "time, values, options, code",
    [
        ([0, 1, 1, 2], [1, 2, 3, 4], {}, "NON_MONOTONIC_TIME"),
        ([0, 1, 2, 100], [1, 2, 3, 4], {}, "GAP_TOO_LARGE"),
        ([0, 1, 2, 3], [None, None, None, None], {}, "TOO_FEW_AFTER_CLEAN"),
        ([0, 1, 2], [1, 2, 3], {"minSamples": 5}, "TOO_SHORT"),
    ],
)
def test_fail_closed_with_codes(time, values, options, code):
    request = CalculusRequest.model_validate(payload(time, values, options=options))
    with pytest.raises(RealSeriesCalculusError) as exc:
        analyze_series(request)
    assert exc.value.code == code


def test_irregular_grid_derivative_is_exact_for_a_line():
    time = [0, 0.1, 0.35, 0.4, 0.9]
    result = analyze_payload(payload(time, [2 * t + 1 for t in time]))
    for value in result["differential"]["d1"]:
        assert abs(value - 2) < 1e-9
    assert result["integral"]["method"] == "trapecio"
